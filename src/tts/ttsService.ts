import * as Speech from "expo-speech";

export interface TTSOptions {
  rate?: number; // 0.0 ~ 1.0
  pitch?: number; // 0.5 ~ 2.0
  volume?: number; // 0.0 ~ 1.0
  language?: string;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
  onStopped?: () => void;
}

export type VoicePreset = "default" | "fast" | "slow" | "high" | "low";

class TTSService {
  private isSpeaking: boolean = false;
  private currentUtteranceId: string | null = null;

  /**
   * 텍스트를 음성으로 읽어줍니다.
   */
  speak(text: string, options?: TTSOptions): void {
    if (!text || text.trim().length === 0) {
      return;
    }

    // 기존 재생 중인 음성 정지
    this.stop();

    const defaultOptions: TTSOptions = {
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      language: "ko-KR",
      ...options,
    };

    try {
      this.isSpeaking = true;
      const utteranceId = Speech.speak(text, {
        rate: defaultOptions.rate,
        pitch: defaultOptions.pitch,
        volume: defaultOptions.volume,
        language: defaultOptions.language,
        onStart: () => {
          this.currentUtteranceId = utteranceId;
          if (defaultOptions.onStart) {
            defaultOptions.onStart();
          }
        },
        onDone: () => {
          this.isSpeaking = false;
          this.currentUtteranceId = null;
          if (defaultOptions.onDone) {
            defaultOptions.onDone();
          }
        },
        onError: (error: Error) => {
          this.isSpeaking = false;
          this.currentUtteranceId = null;
          if (defaultOptions.onError) {
            defaultOptions.onError(error);
          } else {
            console.error("TTS Error:", error);
          }
        },
        onStopped: () => {
          this.isSpeaking = false;
          this.currentUtteranceId = null;
          if (defaultOptions.onStopped) {
            defaultOptions.onStopped();
          }
        },
      });
    } catch (error) {
      this.isSpeaking = false;
      this.currentUtteranceId = null;
      if (defaultOptions.onError) {
        defaultOptions.onError(error as Error);
      } else {
        console.error("TTS Error:", error);
      }
    }
  }

  /**
   * 현재 재생 중인 음성을 정지합니다.
   */
  stop(): void {
    if (this.isSpeaking) {
      Speech.stop();
      this.isSpeaking = false;
      this.currentUtteranceId = null;
    }
  }

  /**
   * 여러 텍스트를 순차적으로 읽어줍니다.
   */
  speakSequence(texts: string[], options?: TTSOptions, delay: number = 500): void {
    if (texts.length === 0) {
      return;
    }

    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= texts.length) {
        return;
      }

      const text = texts[currentIndex];
      const isLast = currentIndex === texts.length - 1;

      this.speak(text, {
        ...options,
        onDone: () => {
          if (options?.onDone && isLast) {
            options.onDone();
          }
          if (!isLast) {
            setTimeout(() => {
              currentIndex++;
              speakNext();
            }, delay);
          }
        },
        onError: (error) => {
          if (options?.onError) {
            options.onError(error);
          }
        },
      });
    };

    speakNext();
  }

  /**
   * 프리셋을 사용하여 텍스트를 읽어줍니다.
   */
  speakWithPreset(text: string, preset: VoicePreset = "default"): void {
    const presetOptions: Record<VoicePreset, Partial<TTSOptions>> = {
      default: { rate: 0.9, pitch: 1.0, volume: 1.0 },
      fast: { rate: 1.0, pitch: 1.0, volume: 1.0 },
      slow: { rate: 0.6, pitch: 1.0, volume: 1.0 },
      high: { rate: 0.9, pitch: 1.5, volume: 1.0 },
      low: { rate: 0.9, pitch: 0.7, volume: 1.0 },
    };

    this.speak(text, presetOptions[preset]);
  }

  /**
   * 현재 재생 중인지 확인합니다.
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = new TTSService();



