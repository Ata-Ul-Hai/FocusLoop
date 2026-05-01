import { storageService } from '../services/storageService.js';

const TASKS_STORAGE_KEY = 'focusloop_tasks';

let tasks = storageService.get(TASKS_STORAGE_KEY, []);

export const taskStore = {
  getTasks() {
    return tasks;
  },

  getActiveTasks() {
    return tasks.filter(t => !t.done);
  },

  getDoneTasks() {
    return tasks.filter(t => t.done);
  },

  addTask(name, options = {}) {
    const {
      priority = 'normal',
      duration = null,
      notes = '',
      reminderText = '',
      ttsEnabled = false
    } = options;

    // Random duration between 30 and 75 mins if not provided
    const finalDuration = duration || Math.floor(Math.random() * (4500 - 1800 + 1)) + 1800;
    const now = Date.now();

    const newTask = {
      id: Date.now().toString(),
      name,
      notes,
      reminderText,
      ttsEnabled,
      priority,
      duration: finalDuration,
      remaining: finalDuration,
      cycles: 0,
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      startedAt: now,
      nextFireAt: now + finalDuration * 1000
    };

    tasks.push(newTask);
    this.save();
    return newTask;
  },

  updateTask(id, patch) {
    tasks = tasks.map(t => t.id === id ? { ...t, ...patch } : t);
    this.save();
  },

  deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    this.save();
  },

  markDone(id) {
    tasks = tasks.map(t => t.id === id ? {
      ...t,
      done: true,
      completedAt: new Date().toISOString()
    } : t);
    this.save();
  },

  save() {
    storageService.set(TASKS_STORAGE_KEY, tasks);
  }
};
