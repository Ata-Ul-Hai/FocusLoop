import { userStore } from '../store/userStore.js';
import { getReminderText } from './reminderText.js';

/**
 * notifService.js
 * Notification chain: Browser Notification -> Audio -> Toast
 */

class NotifService {
  constructor() {
    this.audioCtx = null;
  }

  async initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  async fire(task) {
    const cycle = task.cycles + 1;
    const reminderText = getReminderText(task, cycle);

    // 1. Browser Notification
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('FocusLoop', {
          body: reminderText,
          icon: '/public/icon-192.png'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    } catch (e) {
      console.warn('Notification API failed', e);
    }

    // 2. Audio Fallback
    await this.playThemeSound();
    if (task.ttsEnabled) {
      this.speak(reminderText);
    }

    // 3. In-app Toast (Event based, handled by Toast component)
    window.dispatchEvent(new CustomEvent('focusloop:toast', {
      detail: {
        message: 'Timer complete',
        submessage: `Cycle ${cycle} finished`,
        type: 'info'
      }
    }));
  }

  async playThemeSound(themeOverride) {
    const theme = themeOverride || userStore.getUser().soundTheme;
    if (theme === 'Silent') return;

    await this.initAudio();
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (theme) {
      case 'Ting': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.4);
        break;
      }
      case 'Bell': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(now + 1);
        osc2.stop(now + 1);
        break;
      }
      case 'Chime': {
        const notes = [440, 554.37, 659.25]; // A, C#, E
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + (i * 0.3);
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.1, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.3);
        });
        break;
      }
    }
  }

  speak(text) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export const notifService = new NotifService();
