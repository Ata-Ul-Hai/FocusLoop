/**
 * voiceService.js
 * Web Speech API wrapper.
 */

class VoiceService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN'; // Optimized for Indian accents and Hinglish
    } else {
      this.recognition = null;
    }
    this.isListening = false;
  }

  isSupported() {
    return this.recognition !== null;
  }

  setLanguage(langCode) {
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  async requestMicrophonePermission() {
    if (!navigator.mediaDevices?.getUserMedia) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
  }

  start(callbacks) {
    if (!this.recognition) return;

    const { onInterim, onFinal, onError, onEnd } = callbacks;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) onFinal(finalTranscript);
      if (interimTranscript) onInterim(interimTranscript);
    };

    this.recognition.onerror = (event) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    this.recognition.start();
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
}

export const voiceService = new VoiceService();
