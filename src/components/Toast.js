/**
 * Toast.js
 * Lightweight notification system.
 */

export default function Toast({ message, submessage, type = 'info' }) {
  const toast = document.createElement('div');
  toast.className = 'toast';

  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <div class="toast-sub">${submessage}</div>
  `;

  // Auto-remove after 4s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(24px)';
    setTimeout(() => toast.remove(), 220);
  }, 4000);

  return toast;
}
