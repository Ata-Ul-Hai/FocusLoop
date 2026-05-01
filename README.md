# ♾️ FocusLoop — Deep work, on repeat.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=Capacitor&logoColor=white)](https://capacitorjs.com/)

FocusLoop is a personal task manager designed for deep work. Every task is paired with a repeating countdown timer (30–75 min) that prompts you to check in. Once a timer expires, it fires a notification and automatically restarts, cycling until the task is marked as complete.

---

## ✨ Features

- **🔄 Repeating Timers**: Automatic cycling reminders to maintain focus.
- **🎙️ Voice Input**: Add tasks hands-free via Web Speech API.
- **🔔 Notification Chain**: Native Android/iOS notifications, Browser notifications, and Audio tones.
- **📱 Mobile Ready**: Built with Capacitor for a native mobile experience.
- **🔋 PWA Support**: Installable on desktop and mobile, offline-ready.
- **📊 Productivity Stats**: Track completed tasks, focus time, and streaks.
- **🌗 Customization**: Dark/Light themes and multiple sound profiles.
- **⌨️ Keyboard-First**: Quick shortcuts for power users:
  - `N`: New Task
  - `V`: Voice Input
  - `S`: Toggle Stats
  - `T`: Toggle Theme

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/Ata-Ul-Hai/FocusLoop.git
   cd FocusLoop
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🛠️ Technical Architecture

### Core Logic
- **State Management**: Vanilla JS stores (`taskStore`, `userStore`) mirrored to `localStorage` via a `storageService` wrapper.
- **Timer Engine**: Managed by `timerService`, which utilizes a Registry pattern for intervals and the `Page Visibility API` to compensate for browser throttling in background tabs.
- **Component Pattern**: Functional components that return DOM elements with internal `update` and `destroy` methods for high-performance manual DOM manipulation.

### PWA & Mobile
- **Vite PWA**: Uses `vite-plugin-pwa` for service worker registration and asset caching.
- **Capacitor**: Pre-configured for mobile wrapping.
  ```bash
  npm run build
  npx cap add android # or ios
  npx cap sync
  npx cap open android
  ```

## 🗺️ Future Roadmap
- **AI-Driven Duration**: Integration with Gemma 2 to suggest optimal focus durations based on task complexity.
- **Cloud Sync**: Optional account-based synchronization.
- **Deep Integration**: Calendar import/export.

## 🤝 Contributing
Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

