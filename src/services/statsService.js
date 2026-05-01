import { userStore } from '../store/userStore.js';

/**
 * statsService.js
 * Logic for daily stats, streaks and focus time.
 */

export const statsService = {
  updateOnTaskComplete(task) {
    const user = userStore.getUser();
    const stats = user.stats;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastDate = stats.lastActiveDate;

    // Calculate streak
    let newStreak = stats.streakDays;
    if (lastDate === today) {
      // Already counted today
    } else if (lastDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
      newStreak++;
    } else {
      newStreak = 1;
    }

    userStore.updateStats({
      tasksCompleted: stats.tasksCompleted + 1,
      totalFocusSeconds: stats.totalFocusSeconds + task.duration,
      streakDays: newStreak,
      lastActiveDate: today
    });
  },

  getTodayStats() {
    const user = userStore.getUser();
    // In a real app we'd store per-day stats.
    // For MVP, we use the lifetime stats and current streak.
    return user.stats;
  }
};
