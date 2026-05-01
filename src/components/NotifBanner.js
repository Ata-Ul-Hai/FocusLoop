export default function NotifBanner() {
  const banner = document.createElement('div');
  banner.className = 'task-card flex-between';
  banner.style.marginBottom = 'var(--space-4)';
  banner.style.borderColor = 'var(--color-accent)';

  banner.innerHTML = `
    <div class="text-sm">Enable notifications for FocusLoop timers?</div>
    <button id="allow-notif" class="btn btn-primary" style="padding: 4px 12px; font-size: var(--text-xs)">Allow</button>
  `;

  banner.querySelector('#allow-notif').onclick = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      banner.remove();
    }
  };

  return banner;
}
