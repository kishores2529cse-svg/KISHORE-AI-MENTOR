import { api } from './api';

export interface AuthoritativeResponse {
  response_id: string;
  lesson_id?: string;
  text: string;
  spoken_text?: string;
  language?: string;
  voice?: string;
  timestamp?: number;
}

export interface AudioPlayCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onAudioReady?: () => void;
}

export function prepareSpeechText(rawText: string, language: string = 'English'): string {
  if (!rawText) return '';

  let spoken = rawText;

  // 1. Remove code blocks or summarize
  spoken = spoken.replace(/```[\w]*\n[\s\S]*?```/g, ' code snippet ');
  spoken = spoken.replace(/`([^`]+)`/g, '$1');

  // 2. Convert LaTeX fractions: \frac{a}{b} -> "a over b"
  spoken = spoken.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1 over $2');

  // 3. Convert square roots: \sqrt{x} -> "square root of x"
  spoken = spoken.replace(/\\sqrt\{([^{}]+)\}/g, 'square root of $1');

  // 4. Convert superscripts/powers: x^2 -> "x squared", x^3 -> "x cubed"
  spoken = spoken.replace(/(\b[A-Za-z0-9]+)\^2\b/g, '$1 squared');
  spoken = spoken.replace(/(\b[A-Za-z0-9]+)\^3\b/g, '$1 cubed');
  spoken = spoken.replace(/(\b[A-Za-z0-9]+)\^\{?([A-Za-z0-9]+)\}?/g, '$1 to the power of $2');

  // 5. Common symbols
  spoken = spoken.replace(/\\Delta|\\delta/g, 'delta');
  spoken = spoken.replace(/\\theta/g, 'theta');
  spoken = spoken.replace(/\\pi/g, 'pi');
  spoken = spoken.replace(/\\Omega/g, 'Ohms');
  spoken = spoken.replace(/\\times/g, 'times');
  spoken = spoken.replace(/\\approx/g, 'is approximately');
  spoken = spoken.replace(/\\neq/g, 'is not equal to');
  spoken = spoken.replace(/\\leq|\\le/g, 'is less than or equal to');
  spoken = spoken.replace(/\\geq|\\ge/g, 'is greater than or equal to');

  // 6. Strip math delimiters $ and $$
  spoken = spoken.replace(/\$\$/g, ' ').replace(/\$/g, ' ');

  // 7. Strip markdown headers, bullets, bold/italic, links
  spoken = spoken.replace(/^#{1,6}\s+/gm, '');
  spoken = spoken.replace(/^\s*[-*+]\s+/gm, '');
  spoken = spoken.replace(/\*\*([^*]+)\*\*/g, '$1');
  spoken = spoken.replace(/\*([^*]+)\*/g, '$1');
  spoken = spoken.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 8. Clean excess whitespace
  spoken = spoken.replace(/\s+/g, ' ').trim();

  return spoken;
}

class AudioManagerService {
  private activeResponseId: string | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentAudioBlobUrl: string | null = null;
  private isMuted: boolean = false;
  private audioCache: Map<string, string> = new Map(); // key: hash -> blobUrl
  private isGeneratingVoice: boolean = false;
  private activeResponse: AuthoritativeResponse | null = null;

  public getActiveResponseId(): string | null {
    return this.activeResponseId;
  }

  public getActiveResponse(): AuthoritativeResponse | null {
    return this.activeResponse;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public isVoiceMuted(): boolean {
    return this.isMuted;
  }

  public isGenerating(): boolean {
    return this.isGeneratingVoice;
  }

  /**
   * Stops any currently playing audio and cancels active generation token
   */
  public stop(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public pause(): void {
    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
    } else if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play().catch(() => {});
    } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  public replay(callbacks?: AudioPlayCallbacks): void {
    if (this.activeResponse) {
      this.playResponse(this.activeResponse, callbacks);
    }
  }

  /**
   * Plays the authoritative teacher response with strict response_id version protection.
   * If a new response arrives while audio is generating or playing, old audio is immediately discarded.
   */
  public async playResponse(
    response: AuthoritativeResponse,
    callbacks?: AudioPlayCallbacks
  ): Promise<void> {
    if (this.isMuted) {
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    // 1. Immediately cancel prior audio
    this.stop();

    // 2. Set this response as authoritative
    this.activeResponseId = response.response_id;
    this.activeResponse = response;
    const assignedId = response.response_id;

    // 3. Prepare natural spoken text (no raw markdown/equations)
    const targetText = response.spoken_text || response.text;
    const cleanSpeech = prepareSpeechText(targetText, response.language || 'English');

    if (!cleanSpeech) {
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    const language = response.language || 'English';
    const voice = response.voice || 'en-IN-PrabhatNeural';
    const cacheKey = `${cleanSpeech}_${language}_${voice}`;

    this.isGeneratingVoice = true;

    try {
      let audioUrl = this.audioCache.get(cacheKey);

      if (!audioUrl) {
        // Synthesize via backend Neural TTS
        audioUrl = await api.synthesizeSpeechAudio(cleanSpeech, voice, language, assignedId);
        this.audioCache.set(cacheKey, audioUrl);
      }

      // STALE CHECK: Did another response become active while synthesizing?
      if (this.activeResponseId !== assignedId) {
        // Discard stale audio!
        return;
      }

      this.isGeneratingVoice = false;
      if (callbacks?.onAudioReady) callbacks.onAudioReady();

      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      audio.onplay = () => {
        if (this.activeResponseId === assignedId && callbacks?.onStart) {
          callbacks.onStart();
        }
      };

      audio.onended = () => {
        if (this.activeResponseId === assignedId) {
          this.currentAudioElement = null;
          if (callbacks?.onEnd) callbacks.onEnd();
        }
      };

      audio.onerror = (e) => {
        console.warn("Neural audio playback warning, falling back to Web Speech:", e);
        if (this.activeResponseId === assignedId) {
          this.fallbackWebSpeech(cleanSpeech, assignedId, callbacks);
        }
      };

      await audio.play();

    } catch (err) {
      console.warn("Backend neural TTS error, falling back to Web Speech:", err);
      if (this.activeResponseId === assignedId) {
        this.fallbackWebSpeech(cleanSpeech, assignedId, callbacks);
      }
    } finally {
      if (this.activeResponseId === assignedId) {
        this.isGeneratingVoice = false;
      }
    }
  }

  private fallbackWebSpeech(
    text: string,
    assignedId: string,
    callbacks?: AudioPlayCallbacks
  ): void {
    if (!('speechSynthesis' in window) || this.isMuted) {
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Guy')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
    if (matchVoice) utterance.voice = matchVoice;

    utterance.onstart = () => {
      if (this.activeResponseId === assignedId && callbacks?.onStart) {
        callbacks.onStart();
      }
    };

    utterance.onend = () => {
      if (this.activeResponseId === assignedId && callbacks?.onEnd) {
        callbacks.onEnd();
      }
    };

    utterance.onerror = () => {
      if (this.activeResponseId === assignedId && callbacks?.onEnd) {
        callbacks.onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const audioManager = new AudioManagerService();
