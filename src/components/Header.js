import { userStore } from '../store/userStore.js';

export default function Header(onToggleTheme, onOpenStats) {
  const user = userStore.getUser();
  const header = document.createElement('header');
  header.className = 'flex-between mt-6 mb-10';

  header.innerHTML = `
    <div class="flex-center" style="gap: var(--space-3)">
      <span class="text-lg font-bold">FocusLoop</span>
      <span class="cycle-badge">${user.username}</span>
    </div>
    <div class="flex-center" style="gap: var(--space-2)">
      <button id="theme-toggle" class="btn btn-icon" aria-label="Toggle Theme">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 6 6 0 0 1-9 6 6 0 0 1-9-6 6 0 0 0 9-6z"></path><path d="M12 15v6"></path><path d="M9 18h6"></path></svg>
      </button>
      <button id="stats-btn" class="btn btn-icon" aria-label="Open Focus Stats" title="Focus Stats">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      </button>
    </div>
  `;

  header.querySelector('#theme-toggle').onclick = onToggleTheme;
  header.querySelector('#stats-btn').onclick = onOpenStats;

  return header;
}
