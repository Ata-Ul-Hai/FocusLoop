import { taskStore } from '../store/taskStore.js';
import { voiceService } from '../services/voiceService.js';

export default function TaskInput(onTaskAdded) {
  const container = document.createElement('div');
  container.className = 'task-card animate-slide-up';
  container.style.marginBottom = 'var(--space-6)';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-4)">
      <div class="flex-between" style="gap: var(--space-3)">
        <div class="input-group" style="flex: 1; margin-bottom: 0;">
          <input type="text" id="task-name" class="input-field" placeholder="What's your focus?" maxlength="120" style="font-size: var(--text-lg); padding: var(--space-4);">
        </div>
        <button id="voice-btn" class="btn btn-icon voice-btn-large" aria-label="Start voice input" title="Dictate task">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        </button>
      </div>

      <div id="options-toggle" class="btn btn-ghost" style="width: 100%; font-size: var(--text-sm); color: var(--color-text-2); border-style: dashed;">
        + More options
      </div>
    </div>

    <div id="options-panel" class="hidden" style="margin-top: var(--space-5); display: flex; flex-direction: column; gap: var(--space-5);">
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--color-text-2)">Priority</span>
        <div class="btn-group">
          <button class="btn btn-ghost priority-btn" data-priority="high" aria-pressed="false">High</button>
          <button class="btn btn-ghost priority-btn" data-priority="normal" aria-pressed="true">Normal</button>
          <button class="btn btn-ghost priority-btn" data-priority="low" aria-pressed="false">Low</button>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        <div class="flex-between">
          <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--color-text-2)">Timer</span>
          <span id="duration-val" class="font-mono text-base" style="color: var(--color-text)">45m</span>
        </div>
        <div class="flex-center" style="gap: var(--space-3); width: 100%;">
          <input type="range" id="duration-slider" min="1800" max="4500" step="300" value="2700" style="flex: 1; height: 6px; border-radius: 3px;">
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--color-text-2)">Quick Presets</span>
        <div class="btn-group">
          <button class="btn btn-ghost duration-preset" style="flex: 1" data-duration="60" type="button">1m Test</button>
          <button class="btn btn-ghost duration-preset" style="flex: 1" data-duration="300" type="button">5m Test</button>
        </div>
      </div>

      <div class="input-group" style="margin-bottom: 0;">
        <div class="flex-between" style="gap: var(--space-4); align-items: flex-start;">
          <textarea id="task-notes" class="input-field" placeholder="Notes..." rows="2"></textarea>
          <button id="notes-voice-btn" class="btn btn-icon voice-btn-notes" aria-label="Dictate notes" title="Dictate notes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          </button>
        </div>
      </div>

      <div class="input-group" style="margin-bottom: 0;">
        <div class="flex-between" style="gap: var(--space-4); align-items: flex-start;">
          <textarea id="reminder-text" class="input-field" placeholder="Custom reminder message..." rows="2" maxlength="180"></textarea>
          <button id="reminder-voice-btn" class="btn btn-icon voice-btn-notes" aria-label="Dictate reminder text" title="Dictate reminder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          </button>
        </div>
      </div>

      <label class="option-toggle" style="background: var(--color-surface-2); padding: var(--space-3); border-radius: var(--radius-md);">
        <input type="checkbox" id="tts-enabled" checked>
        <span class="font-bold">Speak reminder aloud</span>
      </label>
    </div>

    <button id="add-btn" class="btn btn-primary" style="width: 100%; margin-top: var(--space-5); padding: var(--space-4); font-size: var(--text-base);">Add Focused Task</button>
  `;



  const nameInput = container.querySelector('#task-name');
  const voiceBtn = container.querySelector('#voice-btn');
  const optionsToggle = container.querySelector('#options-toggle');
  const optionsPanel = container.querySelector('#options-panel');
  const durationSlider = container.querySelector('#duration-slider');
  const durationVal = container.querySelector('#duration-val');
  const notesInput = container.querySelector('#task-notes');
  const notesVoiceBtn = container.querySelector('#notes-voice-btn');
  const reminderInput = container.querySelector('#reminder-text');
  const reminderVoiceBtn = container.querySelector('#reminder-voice-btn');
  const ttsToggle = container.querySelector('#tts-enabled');
  const addBtn = container.querySelector('#add-btn');

  let selectedPriority = 'normal';
  let selectedDuration = parseInt(durationSlider.value);

  const priorityButtons = [...container.querySelectorAll('.priority-btn')];



  const updatePriorityButtons = () => {
    priorityButtons.forEach(btn => {
      const isSelected = btn.dataset.priority === selectedPriority;
      btn.classList.toggle('is-selected', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });
  };

  updatePriorityButtons();

  // Handle priority buttons
  priorityButtons.forEach(btn => {
    btn.onclick = () => {
      selectedPriority = btn.dataset.priority;
      updatePriorityButtons();
    };
  });

  // Handle duration slider
  durationSlider.oninput = () => {
    selectedDuration = parseInt(durationSlider.value);
    durationVal.textContent = `${formatDurationLabel(selectedDuration)}`;
    container.querySelectorAll('.duration-preset').forEach(btn => {
      btn.classList.remove('is-selected');
      btn.setAttribute('aria-pressed', 'false');
    });
  };

  container.querySelectorAll('.duration-preset').forEach(btn => {
    btn.onclick = () => {
      selectedDuration = parseInt(btn.dataset.duration);
      durationVal.textContent = `${formatDurationLabel(selectedDuration)} test`;
      container.querySelectorAll('.duration-preset').forEach(preset => {
        const isSelected = preset === btn;
        preset.classList.toggle('is-selected', isSelected);
        preset.setAttribute('aria-pressed', String(isSelected));
      });
    };
  });

  // Handle options toggle
  optionsToggle.onclick = () => {
    const isHidden = optionsPanel.classList.toggle('hidden');
    optionsToggle.textContent = isHidden ? '+ More options' : '- Hide options';
    optionsToggle.style.borderStyle = isHidden ? 'dashed' : 'solid';
  };

  const addTask = () => {
    const name = nameInput.value.trim();
    if (!name) return;

    const task = taskStore.addTask(name, {
      priority: selectedPriority,
      duration: selectedDuration === 2700 ? null : selectedDuration,
      notes: notesInput.value.trim(),
      reminderText: reminderInput.value.trim(),
      ttsEnabled: ttsToggle.checked
    });

    nameInput.value = '';
    notesInput.value = '';
    reminderInput.value = '';
    ttsToggle.checked = true;
    selectedDuration = parseInt(durationSlider.value);
    durationVal.textContent = `${formatDurationLabel(selectedDuration)}`;
    container.querySelectorAll('.duration-preset').forEach(btn => {
      btn.classList.remove('is-selected');
      btn.setAttribute('aria-pressed', 'false');
    });
    selectedPriority = 'normal';
    updatePriorityButtons();
    optionsPanel.classList.add('hidden');
    optionsToggle.textContent = '+ More options';
    optionsToggle.style.borderStyle = 'dashed';
    onTaskAdded(task);
  };

  addBtn.onclick = addTask;
  nameInput.onkeydown = (e) => { if (e.key === 'Enter') addTask(); };

  // Voice logic
  if (!voiceService.isSupported()) {
    voiceBtn.style.display = 'none';
    notesVoiceBtn.style.display = 'none';
    reminderVoiceBtn.style.display = 'none';
  } else {
    const startDictation = async (targetInput, triggerBtn) => {
      if (voiceService.isListening) {
        voiceService.stop();
        return;
      }

      try {
        await voiceService.requestMicrophonePermission();
      } catch (err) {
        window.dispatchEvent(new CustomEvent('focusloop:toast', {
          detail: { message: 'Microphone blocked', submessage: 'Enable microphone permission for dictation.', type: 'error' }
        }));
        return;
      }

      triggerBtn.classList.add('is-listening', 'animate-ripple');
      voiceService.start({
        onInterim: (text) => {
          targetInput.value = text;
          targetInput.style.color = 'var(--color-text-2)';
        },
        onFinal: (text) => {
          targetInput.value = text;
          targetInput.style.color = 'var(--color-text)';
        },
        onError: (err) => {
          window.dispatchEvent(new CustomEvent('focusloop:toast', {
            detail: { message: 'Voice Error', submessage: err, type: 'error' }
          }));
        },
        onEnd: () => {
          targetInput.style.color = 'var(--color-text)';
          triggerBtn.classList.remove('is-listening', 'animate-ripple');
        }
      });
    };

    voiceBtn.onclick = () => startDictation(nameInput, voiceBtn);
    notesVoiceBtn.onclick = () => startDictation(notesInput, notesVoiceBtn);
    reminderVoiceBtn.onclick = () => startDictation(reminderInput, reminderVoiceBtn);
  }

  return container;
}

function formatDurationLabel(seconds) {
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
}
