import { statsService } from '../services/statsService.js';
import { userStore } from '../store/userStore.js';
import SoundPicker from './SoundPicker.js';

export default function StatsPanel(onClose) {
  const panel = document.createElement('div');
  panel.className = 'stats-box';
  panel.id = 'stats-panel-el';

  const render = () => {
    const stats = statsService.getTodayStats();
    panel.innerHTML = `
      <div class="flex-between mb-6">
        <h2 class="text-xl">Focus Stats</h2>
        <button id="close-stats" class="btn btn-icon" aria-label="Close Focus Stats" title="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="stats-grid">
        <div class="stats-card">
          <span class="stats-val">${stats.tasksCompleted}</span>
          <span class="stats-lbl">Done</span>
        </div>
        <div class="stats-card">
          <span class="stats-val">${stats.streakDays}</span>
          <span class="stats-lbl">Streak</span>
        </div>
        <div class="stats-card" style="grid-column: span 2">
          <span class="stats-val">${Math.floor(stats.totalFocusSeconds / 3600)}h ${Math.floor((stats.totalFocusSeconds % 3600) / 60)}m</span>
          <span class="stats-lbl">Total Focus Time</span>
        </div>
      <div id="settings-container" class="mt-8"></div>
    `;
    panel.querySelector('#close-stats').onclick = onClose;

    const settingsContainer = panel.querySelector('#settings-container');
    const soundPicker = SoundPicker((newTheme) => {
      userStore.setUser({ soundTheme: newTheme });
      window.dispatchEvent(new CustomEvent('focusloop:toast', {
        detail: { message: 'Sound theme updated', submessage: `Selected: ${newTheme}`, type: 'success' }
      }));
    });
    settingsContainer.appendChild(soundPicker);
  };

  render();
  panel.render = render;

  return panel;
}
