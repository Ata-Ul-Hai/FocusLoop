import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { userStore } from '../store/userStore.js';
import { taskStore } from '../store/taskStore.js';
import { getReminderText } from './reminderText.js';

const ReminderSpeech = registerPlugin('ReminderSpeech');

const CHANNELS = {
  Ting: { id: 'focusloop_v3_ting', sound: 'long_reminder.wav' },
  Bell: { id: 'focusloop_v3_bell', sound: 'bell.wav' },
  Announcement: { id: 'focusloop_v3_announcement', sound: 'focus_checkin.wav' },
  Silent: { id: 'focusloop_v3_silent', sound: undefined }
};

export const nativeNotifService = {
  isNative() {
    return Capacitor.isNativePlatform();
  },

  async init() {
    if (!this.isNative()) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.setup().catch((error) => {
      this.initPromise = null;
      throw error;
    });
    return this.initPromise;
  },

  async setup() {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    if (Capacitor.getPlatform() === 'android') {
      if (LocalNotifications.checkExactNotificationSetting) {
        const exact = await LocalNotifications.checkExactNotificationSetting();
        if (exact.exact_alarm !== 'granted') {
          console.warn('Exact notification alarms are not enabled.');
        }
      }
      // Request battery optimizations once
      await ReminderSpeech.requestBatteryOptimizations();
    }

    for (const [name, channel] of Object.entries(CHANNELS)) {
      await LocalNotifications.createChannel({
        id: channel.id,
        name: `FocusLoop ${name}`,
        description: `FocusLoop ${name} reminders`,
        importance: 4,
        sound: channel.sound,
        vibration: true
      });
    }
  },

  async scheduleTaskWindow(task, count = 8) {
    if (!this.isNative()) return;
    await this.init();
    await this.cancelPendingTaskNotifications(task.id);

    const theme = userStore.getUser().soundTheme || 'Ting';
    const channel = CHANNELS[theme] || CHANNELS.Ting;
    const now = Date.now();
    const firstDelaySeconds = Math.max(1, task.remaining || task.duration);
    const baseCycle = task.cycles || 0;

    const speechReminders = [];
    const notifications = Array.from({ length: count }, (_, index) => {
      const cycle = baseCycle + index + 1;
      const at = new Date(now + firstDelaySeconds * 1000 + index * task.duration * 1000);
      const reminderText = getReminderText(task, cycle);
      const id = this.notificationId(task.id, cycle);

      speechReminders.push({
        id,
        taskId: task.id,
        taskName: task.name,
        at: at.getTime(),
        reminderText,
        ttsEnabled: Boolean(task.ttsEnabled),
        soundTheme: theme,
        cycle
      });

      return {
        id,
        title: 'FocusLoop',
        body: reminderText,
        largeBody: `${reminderText}\n\nCycle ${cycle} finished. Keep going or mark the task done.`,
        schedule: {
          at,
          allowWhileIdle: true
        },
        channelId: channel.id,
        group: `task-${task.id}`,
        autoCancel: true,
        extra: {
          taskId: task.id,
          cycle,
          ttsEnabled: task.ttsEnabled,
          reminderText
        }
      };
    });

    if (Capacitor.getPlatform() === 'android') {
      await ReminderSpeech.schedule({ reminders: speechReminders });
      // Start foreground service to keep app alive
      await ReminderSpeech.startForegroundService({ taskName: task.name });
      return;
    }

    await LocalNotifications.schedule({ notifications });
  },

  async scheduleActiveTasks(tasks) {
    if (!this.isNative()) return;
    await Promise.all(tasks.map(task => this.scheduleTaskWindow(task)));
  },

  async cancelTask(task) {
    if (!this.isNative()) return;
    await this.init();
    await this.cancelPendingTaskNotifications(task.id);
    
    // Stop foreground service if no more active tasks
    const activeTasks = taskStore.getActiveTasks();
    if (activeTasks.length === 0 && Capacitor.getPlatform() === 'android') {
      await ReminderSpeech.stopForegroundService();
    }
  },

  async cancelPendingTaskNotifications(taskId) {
    const pending = await LocalNotifications.getPending();
    const notifications = pending.notifications
      .filter(n => n.extra?.taskId === taskId)
      .map(n => ({ id: n.id }));

    if (notifications.length) {
      await LocalNotifications.cancel({ notifications });
    }
    if (Capacitor.getPlatform() === 'android') {
      await ReminderSpeech.cancelTask({ taskId });
    }
  },

  notificationId(taskId, cycle) {
    const key = `${taskId}:${cycle}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash * 31) + key.charCodeAt(i)) | 0;
    }
    return (Math.abs(hash) % 2147483646) + 1;
  }
};
