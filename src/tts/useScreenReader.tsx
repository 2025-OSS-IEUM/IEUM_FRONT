import { useEffect, useRef } from "react";
import { useTts } from "./index";

/**
 * @param text - 읽을 텍스트
 * @param options - 옵션
 * @param options.delay - 읽기 전 대기 시간 (ms)
 * @param options.skipIfEmpty - 텍스트가 비어있으면 건너뛰기
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [content, setContent] = useState("안녕하세요");
 *   useScreenReader(content);
 *
 *   return <Text>{content}</Text>;
 * };
 * ```
 */
export const useScreenReader = (
  text: string,
  options?: {
    delay?: number;
    skipIfEmpty?: boolean;
  }
) => {
  const { readScreenText, stop } = useTts();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousTextRef = useRef<string>("");
  const isFirstMount = useRef(true);

  // 컴포넌트가 마운트될 때 이전 TTS 중지 (한 번만 실행)
  useEffect(() => {
    stop();
    isFirstMount.current = true;

    return () => {
      // 언마운트 시에도 TTS 중지
      stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시에만 실행

  useEffect(() => {
    const delay = options?.delay ?? 300;
    const skipIfEmpty = options?.skipIfEmpty ?? true;

    // 텍스트가 변경되지 않았으면 건너뛰기
    if (text === previousTextRef.current && !isFirstMount.current) {
      return;
    }

    // 빈 텍스트 건너뛰기
    if (skipIfEmpty && !text.trim()) {
      previousTextRef.current = text;
      isFirstMount.current = false;
      return;
    }

    // 이전 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 지연 후 읽기
    timeoutRef.current = setTimeout(() => {
      if (text.trim()) {
        readScreenText(text);
      }
      previousTextRef.current = text;
      isFirstMount.current = false;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, readScreenText, options?.delay, options?.skipIfEmpty]);
};
