import { userStore } from '../store/userStore.js';
import { notifService } from '../services/notifService.js';

export default function SoundPicker(onChanged) {
  const container = document.createElement('div');
  container.className = 'task-card';
  container.innerHTML = `
    <h3 class="text-sm mb-4">Sound Theme</h3>
    <div class="flex-center" style="gap: var(--space-2); flex-wrap: wrap;">
      ${['Ting', 'Bell', 'Chime', 'Silent'].map(theme => `
        <button class="btn btn-ghost sound-btn" data-theme="${theme}">${theme}</button>
      `).join('')}
    </div>
  `;

  const currentTheme = userStore.getUser().soundTheme;
  container.querySelector(`[data-theme="${currentTheme}"]`).classList.add('btn-primary');

  container.querySelectorAll('.sound-btn').forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('btn-primary'));
      btn.classList.add('btn-primary');
      const theme = btn.dataset.theme;
      onChanged(theme);
      
      // Play preview
      notifService.playThemeSound(theme);
    };
  });

  return container;
}
