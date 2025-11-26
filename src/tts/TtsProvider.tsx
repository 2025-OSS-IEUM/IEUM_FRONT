import React, { useState, useEffect, useCallback } from "react";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TtsContext, TtsSettings } from "./TtsContext";

const STORAGE_KEY = "@tts_settings";

const DEFAULT_SETTINGS: TtsSettings = {
  enabled: true,
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

interface TtsProviderProps {
  children: React.ReactNode;
}

export const TtsProvider: React.FC<TtsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<TtsSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error("Failed to load TTS settings:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // 설정 저장
  const saveSettings = useCallback(async (newSettings: TtsSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save TTS settings:", error);
    }
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback(
    async (newSettings: Partial<TtsSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await saveSettings(updated);
    },
    [settings, saveSettings]
  );

  // 직접 텍스트 읽기 (설정과 관계없이)
  const speak = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      Speech.speak(text, {
        language: "ko-KR",
        rate: settings.speed,
        pitch: settings.pitch,
        volume: settings.volume,
      });
    },
    [settings.speed, settings.pitch, settings.volume]
  );

  // TTS 중지
  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  // 화면 텍스트 읽기 (enabled가 true일 때만)
  const readScreenText = useCallback(
    (text: string) => {
      if (!settings.enabled || !text.trim()) return;
      speak(text);
    },
    [settings.enabled, speak]
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <TtsContext.Provider
      value={{
        settings,
        updateSettings,
        speak,
        stop,
        readScreenText,
      }}
    >
      {children}
    </TtsContext.Provider>
  );
};
