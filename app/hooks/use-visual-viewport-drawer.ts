"use client";

import { useEffect, type RefObject } from "react";

const DRAWER_HEIGHT_RATIO = 0.76;
const TOP_GAP_PX = 12;

export function useVisualViewportDrawer(
  open: boolean,
  contentRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const content = contentRef.current;
    if (!content) {
      return;
    }

    const sync = () => {
      const viewport = window.visualViewport;
      if (!viewport) {
        return;
      }

      const keyboardInset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      const availableHeight = viewport.height - TOP_GAP_PX;
      const preferredHeight = window.innerHeight * DRAWER_HEIGHT_RATIO;
      const height = Math.min(preferredHeight, availableHeight);

      content.style.bottom = `${keyboardInset}px`;
      content.style.height = `${height}px`;
      content.style.maxHeight = `${availableHeight}px`;
    };

    const preventPageScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    sync();
    preventPageScroll();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    viewport?.addEventListener("scroll", preventPageScroll);
    window.addEventListener("scroll", preventPageScroll, { passive: true });

    return () => {
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      viewport?.removeEventListener("scroll", preventPageScroll);
      window.removeEventListener("scroll", preventPageScroll);
      content.style.removeProperty("bottom");
      content.style.removeProperty("height");
      content.style.removeProperty("max-height");
    };
  }, [contentRef, open]);
}
