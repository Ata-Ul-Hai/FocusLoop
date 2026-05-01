import { userStore } from './store/userStore.js';
import { taskStore } from './store/taskStore.js';
import { timerService } from './services/timerService.js';
import { statsService } from './services/statsService.js';
import { nativeNotifService } from './services/nativeNotifService.js';

import Login from './components/Login.js';
import Header from './components/Header.js';
import TaskInput from './components/TaskInput.js';
import TaskList from './components/TaskList.js';
import StatsPanel from './components/StatsPanel.js';
import OnboardingTooltip from './components/OnboardingTooltip.js';
import NotifBanner from './components/NotifBanner.js';
import Toast from './components/Toast.js';

class App {
  constructor() {
    console.log('App: Constructor started');
    this.user = userStore.getUser();
    this.screens = {
      login: document.getElementById('screen-login'),
      main: document.getElementById('screen-main')
    };

    if (!this.screens.login || !this.screens.main) {
      console.error('App: Critical error - screens not found in DOM');
      return;
    }

    console.log('App: Screens found:', {
      login: !!this.screens.login,
      main: !!this.screens.main
    });

    this.toastContainer = document.getElementById('toast-container');
    this.onboardingContainer = document.getElementById('onboarding-container');
    this.statsPanelEl = document.getElementById('stats-panel');

    this.init();
  }

  init() {
    nativeNotifService.init().catch((error) => {
      console.warn('Native notification setup failed', error);
    });

    console.log('App: Initializing...');
    this.setupEventListeners();
    this.setupTheme();

    if (this.user.username) {
      console.log('App: User logged in, showing main screen');
      this.showScreen('main');
      this.renderMain();
    } else {
      console.log('App: No user, showing login screen');
      this.showScreen('login');
      this.renderLogin();
    }
  }

  setupEventListeners() {
    // Global Toast Listener
    window.addEventListener('focusloop:toast', (e) => {
      const toast = Toast(e.detail);
      this.toastContainer.appendChild(toast);
    });

    this.statsPanelEl.addEventListener('click', (e) => {
      if (e.target === this.statsPanelEl) {
        this.toggleStats(false);
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (this.screens.main.classList.contains('active')) {
        if (e.key === 'n') {
          e.preventDefault();
          document.querySelector('#task-name')?.focus();
        }
        if (e.key === 'v') {
          e.preventDefault();
          document.querySelector('#voice-btn')?.click();
        }
        if (e.key === 's') {
          e.preventDefault();
          this.toggleStats(true);
        }
        if (e.key === 't') {
          e.preventDefault();
          this.toggleTheme();
        }
        if (e.key === 'Escape') {
          this.toggleStats(false);
        }
      }
    });
  }

  setupTheme() {
    document.body.setAttribute('data-theme', this.user.theme);
  }

  toggleTheme() {
    this.user = userStore.getUser();
    const newTheme = this.user.theme === 'dark' ? 'light' : 'dark';
    userStore.setUser({ theme: newTheme });
    this.user = userStore.getUser();
    document.body.setAttribute('data-theme', newTheme);
  }

  showScreen(screenId) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    this.screens[screenId].classList.add('active');
  }

  renderLogin() {
    this.screens.login.innerHTML = '';
    this.screens.login.appendChild(Login((username) => {
      userStore.setUser({ username });
      this.user = userStore.getUser();
      this.showScreen('main');
      this.renderMain();
    }));
  }

  renderMain() {
    this.screens.main.innerHTML = '';

    // Header
    const header = Header(
      () => this.toggleTheme(),
      () => this.toggleStats(true)
    );
    this.screens.main.appendChild(header);

    // Web notification permission banner. Native builds use Capacitor permissions instead.
    if (!nativeNotifService.isNative() && 'Notification' in window && Notification.permission !== 'granted') {
      this.screens.main.appendChild(NotifBanner());
    }

    // Input
    const input = TaskInput((task) => {
      this.taskList.render();
      timerService.startTimer(task.id, () => {
        // Update visible cards on every tick
        this.updateActiveCards();
      });
      nativeNotifService.scheduleTaskWindow(task).catch((error) => {
        console.warn('Native notification scheduling failed', error);
      });
    });
    this.screens.main.appendChild(input);

    // List
    this.taskList = TaskList(() => {
      this.taskList.render();
    });
    this.screens.main.appendChild(this.taskList);

    // Stats Panel
    this.statsPanelEl.innerHTML = '';
    this.statsPanel = StatsPanel(() => this.toggleStats(false));
    this.statsPanelEl.appendChild(this.statsPanel);

    // Onboarding
    if (!this.user.onboardingSeen) {
      this.onboardingContainer.classList.remove('hidden');
      this.onboardingContainer.appendChild(OnboardingTooltip(() => {
        this.onboardingContainer.classList.add('hidden');
      }));
    }

    // Resume existing timers
    timerService.resumeAll(() => {
      this.updateActiveCards();
    });
    nativeNotifService.scheduleActiveTasks(taskStore.getActiveTasks()).catch((error) => {
      console.warn('Native notification rescheduling failed', error);
    });
  }

  updateActiveCards() {
    const activeTasks = taskStore.getActiveTasks();
    activeTasks.forEach(task => {
      const card = document.querySelector(`.task-card[data-id="${task.id}"]`);
      if (card && card.update) {
        card.update(task);
      }
    });
  }

  toggleStats(show) {
    this.statsPanelEl.classList.toggle('hidden', !show);
    this.statsPanelEl.classList.toggle('active', show);
    if (show) this.statsPanel.render();
  }
}

window.onload = () => {
  console.log('Window loaded, bootstrapping App...');
  new App();
};
