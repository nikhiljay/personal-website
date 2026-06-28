import { useEffect, useRef, useState } from "react";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

export function useThoughtTurnTiming(status: ChatStatus) {
  const startedAtRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(1);

  const isActive = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "submitted") {
      startedAtRef.current = Date.now();
      setElapsedSeconds(1);
      return;
    }

    if (status === "ready" && startedAtRef.current != null) {
      setElapsedSeconds(
        Math.max(1, Math.ceil((Date.now() - startedAtRef.current) / 1000)),
      );
      startedAtRef.current = null;
    }
  }, [status]);

  return { isActive, elapsedSeconds };
}
