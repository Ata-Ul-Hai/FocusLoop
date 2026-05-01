import { userStore } from '../store/userStore.js';

export default function Login(onLogin) {
  const container = document.createElement('div');
  container.className = 'flex-center';
  container.style.height = '80vh';

  const card = document.createElement('div');
  card.className = 'task-card animate-slide-up';
  card.style.width = '100%';
  card.style.maxWidth = '360px';
  card.style.textAlign = 'center';
  card.style.padding = 'var(--space-8)';

  card.innerHTML = `
    <h1 class="text-2xl mb-4">Welcome to FocusLoop</h1>
    <p class="text-sm text-text-2 mb-6">Enter your username to start focusing.</p>
    <div class="input-group">
      <input type="text" id="login-username" class="input-field" placeholder="Username..." maxlength="32">
      <button id="login-btn" class="btn btn-primary">Get Started</button>
    </div>
  `;

  const input = card.querySelector('#login-username');
  const btn = card.querySelector('#login-btn');

  const handleLogin = () => {
    const username = input.value.trim();
    if (username) {
      onLogin(username);
    }
  };

  btn.onclick = handleLogin;
  input.onkeydown = (e) => { if (e.key === 'Enter') handleLogin(); };

  container.appendChild(card);
  return container;
}
