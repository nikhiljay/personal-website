"use client";

import { useEffect, useState } from "react";

import { useMediaQuery } from "./use-media-query";

const MOBILE_BOTTOM_PADDING_PX = 4;

export function useFixedBottomOffset() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mobileBottom, setMobileBottom] = useState<string>(
    `calc(env(safe-area-inset-bottom, 0px) + ${MOBILE_BOTTOM_PADDING_PX}px)`,
  );

  useEffect(() => {
    if (isDesktop) {
      return;
    }

    const update = () => {
      const viewport = window.visualViewport;
      if (!viewport) {
        setMobileBottom(
          `calc(env(safe-area-inset-bottom, 0px) + ${MOBILE_BOTTOM_PADDING_PX}px)`,
        );
        return;
      }

      const visualViewportGap = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );

      setMobileBottom(
        `calc(env(safe-area-inset-bottom, 0px) + ${MOBILE_BOTTOM_PADDING_PX + visualViewportGap}px)`,
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
    };
  }, [isDesktop]);

  return { isDesktop, mobileBottom };
}
