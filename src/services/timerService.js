import { taskStore } from '../store/taskStore.js';
import { notifService } from './notifService.js';

/**
 * timerService.js
 * Interval management and visibility compensation.
 */

class TimerService {
  constructor() {
    this.intervals = new Map();
    this.hiddenAt = null;
    this.setupVisibilityListener();
  }

  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.hiddenAt = Date.now();
      } else if (this.hiddenAt) {
        this.compensate();
      }
    });
  }

  compensate() {
    this.hiddenAt = null;

    const activeTasks = taskStore.getActiveTasks();
    activeTasks.forEach(task => {
      this.syncTaskWithClock(task, true);
    });
  }

  startTimer(taskId, onTick) {
    this.stopTimer(taskId);

    const interval = setInterval(() => {
      const tasks = taskStore.getTasks();
      const task = tasks.find(t => t.id === taskId);

      if (!task || task.done) {
        this.stopTimer(taskId);
        return;
      }

      this.syncTaskWithClock(task, true);

      if (onTick) onTick();
    }, 1000);

    this.intervals.set(taskId, interval);
  }

  stopTimer(taskId) {
    if (this.intervals.has(taskId)) {
      clearInterval(this.intervals.get(taskId));
      this.intervals.delete(taskId);
    }
  }

  stopAll() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
  }

  resumeAll(onTick) {
    const activeTasks = taskStore.getActiveTasks();
    activeTasks.forEach(task => {
      this.syncTaskWithClock(task, false);
      this.startTimer(task.id, onTick);
    });
  }

  syncTaskWithClock(task, shouldNotify = false) {
    const now = Date.now();
    const durationMs = task.duration * 1000;
    let nextFireAt = task.nextFireAt || (now + (task.remaining || task.duration) * 1000);
    let cycles = task.cycles || 0;
    let remaining;
    let cyclesAdded = 0;

    if (now >= nextFireAt) {
      cyclesAdded = Math.floor((now - nextFireAt) / durationMs) + 1;
      cycles += cyclesAdded;
      nextFireAt += cyclesAdded * durationMs;
      remaining = Math.max(1, Math.ceil((nextFireAt - now) / 1000));
    } else {
      remaining = Math.max(1, Math.ceil((nextFireAt - now) / 1000));
    }

    taskStore.updateTask(task.id, {
      remaining,
      cycles,
      nextFireAt,
      startedAt: task.startedAt || now
    });

    if (shouldNotify && cyclesAdded > 0) {
      notifService.fire({ ...task, cycles: cycles - 1 });
    }
  }
}

export const timerService = new TimerService();
