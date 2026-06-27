"use client";

import { useEffect } from "react";

import { useMediaQuery } from "./use-media-query";

export function useFabViewportOffset(active = true) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (isDesktop || !active) {
      document.documentElement.style.removeProperty("--fab-viewport-offset");
      return;
    }

    const update = () => {
      const viewport = window.visualViewport;
      const visualViewportGap = viewport
        ? Math.max(
            0,
            window.innerHeight - viewport.height - viewport.offsetTop,
          )
        : 0;

      document.documentElement.style.setProperty(
        "--fab-viewport-offset",
        `${visualViewportGap}px`,
      );
    };

    update();
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
      document.documentElement.style.removeProperty("--fab-viewport-offset");
    };
  }, [active, isDesktop]);
}
