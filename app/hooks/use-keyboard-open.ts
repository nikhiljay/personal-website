"use client";

import { useEffect, useRef, useState } from "react";

export function useKeyboardOpen(active: boolean) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const baselineHeightRef = useRef(0);

  useEffect(() => {
    if (!active) {
      baselineHeightRef.current = 0;
      setKeyboardOpen(false);
      return;
    }

    baselineHeightRef.current = Math.max(
      baselineHeightRef.current,
      window.innerHeight,
    );

    const sync = () => {
      baselineHeightRef.current = Math.max(
        baselineHeightRef.current,
        window.innerHeight,
      );
      setKeyboardOpen(
        window.innerHeight < baselineHeightRef.current - 60,
      );
    };

    sync();

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", sync);
    visualViewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);

    return () => {
      visualViewport?.removeEventListener("resize", sync);
      visualViewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      baselineHeightRef.current = 0;
      setKeyboardOpen(false);
    };
  }, [active]);

  return keyboardOpen;
}
