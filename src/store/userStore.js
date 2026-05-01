import { storageService } from '../services/storageService.js';

const USER_STORAGE_KEY = 'focusloop_user_data';

const defaultUser = {
  username: '',
  theme: 'dark',
  soundTheme: 'Ting',
  onboardingSeen: false,
  stats: {
    tasksCompleted: 0,
    totalFocusSeconds: 0,
    streakDays: 0,
    lastActiveDate: null
  }
};

let state = storageService.get(USER_STORAGE_KEY, defaultUser);

export const userStore = {
  getUser() {
    return state;
  },

  setUser(patch) {
    state = { ...state, ...patch };
    storageService.set(USER_STORAGE_KEY, state);
  },

  updateStats(patch) {
    state.stats = { ...state.stats, ...patch };
    storageService.set(USER_STORAGE_KEY, state);
  },

  resetUser() {
    state = { ...defaultUser };
    storageService.set(USER_STORAGE_KEY, state);
  }
};
