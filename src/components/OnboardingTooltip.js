import { userStore } from '../store/userStore.js';

export default function OnboardingTooltip(onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'tooltip-overlay';

  const steps = [
    {
      text: "Add your first task here",
      target: '#task-name'
    },
    {
      text: "Use voice by clicking the mic",
      target: '#voice-btn'
    },
    {
      text: "Tasks auto-remind you on a loop — until you're done",
      target: '.task-list'
    }
  ];

  let currentStep = 0;

  const renderStep = () => {
    overlay.innerHTML = '';
    const step = steps[currentStep];
    const targetEl = document.querySelector(step.target);

    if (!targetEl) {
      complete();
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.top = `${rect.bottom + 12}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2) - 100}px`;

    tooltip.innerHTML = `
      <div>${step.text}</div>
      <div class="tooltip-btn">${currentStep === steps.length - 1 ? 'Finish' : 'Next'}</div>
    `;

    tooltip.querySelector('.tooltip-btn').onclick = () => {
      currentStep++;
      if (currentStep >= steps.length) {
        complete();
      } else {
        renderStep();
      }
    };

    overlay.appendChild(tooltip);
  };

  const complete = () => {
    overlay.classList.add('hidden');
    userStore.setUser({ onboardingSeen: true });
    onComplete();
  };

  renderStep();

  return overlay;
}
