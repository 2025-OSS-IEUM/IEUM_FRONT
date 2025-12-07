import { useTtsContext } from "./TtsContext";

/**
 * TTS 기능을 사용하기 위한 커스텀 훅
 *
 * @example
 * ```tsx
 * const { speak, readScreenText, settings } = useTts();
 *
 * // 직접 텍스트 읽기
 * speak("안녕하세요");
 *
 * // 화면 텍스트 읽기 (활성화된 경우에만)
 * readScreenText("화면에 표시된 텍스트");
 * ```
 */
export const useTts = () => {
  return useTtsContext();
};
