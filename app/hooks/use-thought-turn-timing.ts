import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

export type ThoughtTurnTiming = {
  isActive: boolean;
  elapsedSeconds: number;
};

export function useThoughtTurnTiming(
  status: ChatStatus,
  onTurnComplete?: (elapsedSeconds: number) => void,
) {
  const startedAtRef = useRef<number | null>(null);
  const onTurnCompleteRef = useRef(onTurnComplete);
  onTurnCompleteRef.current = onTurnComplete;
  const [elapsedSeconds, setElapsedSeconds] = useState(1);

  const isActive = status === "submitted" || status === "streaming";

  useLayoutEffect(() => {
    if (status === "submitted") {
      startedAtRef.current = Date.now();
      setElapsedSeconds(1);
      return;
    }

    if (status === "ready" && startedAtRef.current != null) {
      const elapsed = Math.max(
        1,
        Math.ceil((Date.now() - startedAtRef.current) / 1000),
      );
      setElapsedSeconds(elapsed);
      startedAtRef.current = null;
      onTurnCompleteRef.current?.(elapsed);
    }
  }, [status]);

  useEffect(() => {
    if (!isActive || startedAtRef.current == null) {
      return;
    }

    const tick = () => {
      if (startedAtRef.current == null) {
        return;
      }

      setElapsedSeconds(
        Math.max(1, Math.ceil((Date.now() - startedAtRef.current) / 1000)),
      );
    };

    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isActive]);

  return { isActive, elapsedSeconds };
}
