import TaskCard from './TaskCard.js';
import { taskStore } from '../store/taskStore.js';

export default function TaskList(onUpdate) {
  const container = document.createElement('div');
  container.className = 'task-list';

  const render = () => {
    container.innerHTML = '';
    const active = taskStore.getActiveTasks();
    const done = taskStore.getDoneTasks();

    // Sort active by priority: high > normal > low
    const priorityMap = { high: 0, normal: 1, low: 2 };
    active.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);

    const fragment = document.createDocumentFragment();

    active.forEach(task => {
      fragment.appendChild(TaskCard(task, onUpdate));
    });

    if (done.length > 0) {
      const doneHeader = document.createElement('div');
      doneHeader.className = 'text-xs text-text-3 uppercase font-bold mt-6 mb-3';
      doneHeader.textContent = 'Completed';
      fragment.appendChild(doneHeader);

      done.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      done.forEach(task => {
        fragment.appendChild(TaskCard(task, onUpdate));
      });
    }

    container.appendChild(fragment);
  };

  render();
  container.render = render;

  return container;
}
