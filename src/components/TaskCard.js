import { taskStore } from '../store/taskStore.js';
import { statsService } from '../services/statsService.js';
import { nativeNotifService } from '../services/nativeNotifService.js';

export default function TaskCard(task, onUpdate) {
  const card = document.createElement('div');
  card.className = `task-card ${task.done ? 'done' : ''}`;
  card.dataset.id = task.id;

  const accentClass = task.priority === 'high' ? 'high' : (task.priority === 'low' ? 'low' : 'normal');

  card.innerHTML = `
    <div class="task-card-accent ${accentClass}"></div>
    <div class="task-card-header">
      <span class="task-name">${task.name}</span>
      <span class="timer-display font-mono">${formatTime(task.remaining)}</span>
    </div>
    <div class="progress-container">
      <div class="progress-bar ${task.remaining < 300 ? 'urgent' : ''}" style="width: ${getPercent(task.remaining, task.duration)}%"></div>
    </div>
    <div class="task-notes hidden text-sm text-text-2" style="margin-bottom: var(--space-3)">
      ${task.notes || 'No notes...'}
    </div>
    <div class="task-footer">
      <div class="flex-center" style="gap: var(--space-2)">
        <button class="btn btn-ghost btn-sm" data-action="toggle-notes">Notes</button>
        <span class="cycle-badge">Cycle ${task.cycles}</span>
      </div>
      <div class="btn-group" style="flex: 1; justify-content: flex-end;">
        ${!task.done ? `
          <button class="btn btn-primary" data-action="done" style="flex: 1;">Complete</button>
          <button class="btn btn-ghost" data-action="delete" style="flex: 0 0 48px;">×</button>
        ` : `
          <span class="text-xs font-bold" style="color: var(--color-text-2); width: 100%; text-align: right;">Completed</span>
        `}
      </div>
    </div>
  `;

  const timerEl = card.querySelector('.timer-display');
  const barEl = card.querySelector('.progress-bar');
  const notesEl = card.querySelector('.task-notes');

  // Update method for real-time ticks
  card.update = (updatedTask) => {
    timerEl.textContent = formatTime(updatedTask.remaining);
    const percent = getPercent(updatedTask.remaining, updatedTask.duration);
    barEl.style.width = `${percent}%`;
    barEl.classList.toggle('urgent', updatedTask.remaining < 300);
    card.querySelector('.cycle-badge').textContent = `Cycle ${updatedTask.cycles}`;
  };

  // Actions
  card.querySelector('[data-action="toggle-notes"]').onclick = () => {
    notesEl.classList.toggle('hidden');
  };

  const doneBtn = card.querySelector('[data-action="done"]');
  if (doneBtn) doneBtn.onclick = () => {
    taskStore.markDone(task.id);
    nativeNotifService.cancelTask(task).catch((error) => {
      console.warn('Native notification cancellation failed', error);
    });

    statsService.updateOnTaskComplete(task);
    triggerConfetti(card);
    onUpdate();
  };

  const deleteBtn = card.querySelector('[data-action="delete"]');
  if (deleteBtn) deleteBtn.onclick = () => {
    taskStore.deleteTask(task.id);
    nativeNotifService.cancelTask(task).catch((error) => {
      console.warn('Native notification cancellation failed', error);
    });

    onUpdate();
  };

  return card;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getPercent(remaining, duration) {
  return ((remaining / duration) * 100).toFixed(1);
}

async function triggerConfetti(element) {
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Dynamic import of canvas-confetti from CDN
  const confetti = await import('https://cdn.skypack.dev/canvas-confetti');
  confetti.default({
    particleCount: 80,
    spread: 60,
    colors: ['#ffffff', '#888888', '#333333'],
    origin: { x: x / window.innerWidth, y: y / window.innerHeight }
  });
}

