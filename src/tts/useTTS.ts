import { useEffect, useRef, useCallback } from "react";
import { ttsService, TTSOptions, VoicePreset } from "./ttsService";
import { useTTSSettingsOrDefault } from "./TTSContext";

/**
 * TTS 기능을 쉽게 사용할 수 있는 React Hook
 */
export const useTTS = () => {
  const isMountedRef = useRef(true);
  const { settings } = useTTSSettingsOrDefault();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const speak = useCallback(
    (text: string, options?: TTSOptions) => {
      if (isMountedRef.current && settings.enabled) {
        // 사용자 설정을 기본값으로 사용하고, 옵션으로 덮어쓰기
        const finalOptions: TTSOptions = {
          rate: settings.rate,
          pitch: settings.pitch,
          volume: settings.volume,
          // voiceGender는 pitch로 조절 (남성: 낮은 pitch, 여성: 높은 pitch)
          ...options,
        };

        // voiceGender에 따라 pitch 조정
        if (!options?.pitch) {
          if (settings.voiceGender === "male") {
            finalOptions.pitch = Math.max(0.5, settings.pitch - 0.2);
          } else {
            finalOptions.pitch = Math.min(2.0, settings.pitch + 0.1);
          }
        }

        ttsService.speak(text, finalOptions);
      }
    },
    [settings]
  );

  const stop = useCallback(() => {
    if (isMountedRef.current) {
      ttsService.stop();
    }
  }, []);

  const speakSequence = useCallback((texts: string[], options?: TTSOptions, delay?: number) => {
    if (isMountedRef.current) {
      ttsService.speakSequence(texts, options, delay);
    }
  }, []);

  const announceScreenChange = useCallback(
    (screenName: string) => {
      if (isMountedRef.current && settings.enabled) {
        const finalOptions: TTSOptions = {
          rate: settings.rate,
          pitch: settings.pitch,
          volume: settings.volume,
        };

        // voiceGender에 따라 pitch 조정
        if (settings.voiceGender === "male") {
          finalOptions.pitch = Math.max(0.5, settings.pitch - 0.2);
        } else {
          finalOptions.pitch = Math.min(2.0, settings.pitch + 0.1);
        }

        ttsService.speak(`${screenName} 화면입니다`, finalOptions);
      }
    },
    [settings]
  );

  const announceLabel = useCallback(
    (label: string, preset?: VoicePreset) => {
      if (isMountedRef.current && settings.enabled) {
        const finalOptions: TTSOptions = {
          rate: settings.rate,
          pitch: settings.pitch,
          volume: settings.volume,
        };

        // voiceGender에 따라 pitch 조정
        if (settings.voiceGender === "male") {
          finalOptions.pitch = Math.max(0.5, settings.pitch - 0.2);
        } else {
          finalOptions.pitch = Math.min(2.0, settings.pitch + 0.1);
        }

        ttsService.speak(label, finalOptions);
      }
    },
    [settings]
  );

  const speakWithPreset = useCallback((text: string, preset: VoicePreset = "default") => {
    if (isMountedRef.current) {
      ttsService.speakWithPreset(text, preset);
    }
  }, []);

  return {
    speak,
    stop,
    speakSequence,
    announceScreenChange,
    announceLabel,
    speakWithPreset,
    isSpeaking: ttsService.getIsSpeaking(),
  };
};

/**
 * 컴포넌트가 마운트될 때 자동으로 텍스트를 읽어주는 Hook
 * @param text 읽을 텍스트
 * @param options TTS 옵션
 * @param enabled 활성화 여부
 */
export const useAutoSpeak = (text: string | null | undefined, options?: TTSOptions, enabled: boolean = true) => {
  const hasSpokenRef = useRef(false);
  const { settings } = useTTSSettingsOrDefault();

  useEffect(() => {
    if (enabled && settings.enabled && text && !hasSpokenRef.current) {
      hasSpokenRef.current = true;

      // 사용자 설정 적용
      const finalOptions: TTSOptions = {
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume,
        ...options,
      };

      // voiceGender에 따라 pitch 조정
      if (!options?.pitch) {
        if (settings.voiceGender === "male") {
          finalOptions.pitch = Math.max(0.5, settings.pitch - 0.2);
        } else {
          finalOptions.pitch = Math.min(2.0, settings.pitch + 0.1);
        }
      }

      ttsService.speak(text, finalOptions);
    }

    return () => {
      hasSpokenRef.current = false;
    };
  }, [text, enabled, settings]);
};

/**
 * 화면 전환 시 자동으로 화면 이름을 읽어주는 Hook
 * @param screenName 화면 이름
 * @param enabled 활성화 여부
 */
export const useScreenAnnouncement = (screenName: string, enabled: boolean = true) => {
  const previousScreenNameRef = useRef<string | null>(null);
  const { settings } = useTTSSettingsOrDefault();

  useEffect(() => {
    // 화면 이름이 변경되었을 때만 TTS 실행
    if (enabled && settings.enabled && screenName && previousScreenNameRef.current !== screenName) {
      previousScreenNameRef.current = screenName;

      const finalOptions: TTSOptions = {
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume,
      };

      // voiceGender에 따라 pitch 조정
      if (settings.voiceGender === "male") {
        finalOptions.pitch = Math.max(0.5, settings.pitch - 0.2);
      } else {
        finalOptions.pitch = Math.min(2.0, settings.pitch + 0.1);
      }

      ttsService.speak(`${screenName} 화면입니다`, finalOptions);
    }
  }, [screenName, enabled, settings]);
};
