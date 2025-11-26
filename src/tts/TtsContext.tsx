import React, { createContext, useContext } from "react";

export interface TtsSettings {
  enabled: boolean;
  speed: number;
  pitch: number;
  volume: number;
}

interface TtsContextType {
  settings: TtsSettings;
  updateSettings: (newSettings: Partial<TtsSettings>) => Promise<void>;
  speak: (text: string) => void;
  stop: () => void;
  readScreenText: (text: string) => void;
}

const TtsContext = createContext<TtsContextType | undefined>(undefined);

export const useTtsContext = () => {
  const context = useContext(TtsContext);
  if (!context) {
    throw new Error("useTtsContext must be used within a TtsProvider");
  }
  return context;
};

export { TtsContext };
