"use client";

import { useLayoutEffect } from "react";

/**
 * Tracks keyboard inset for the dialog and keeps the page from scrolling
 * (so the header stays pinned without per-frame transforms).
 */
export function useVisualViewportKeyboard(active: boolean) {
  useLayoutEffect(() => {
    if (!active) {
      return;
    }

    const html = document.documentElement;
    const previousHtml = {
      position: html.style.position,
      width: html.style.width,
      height: html.style.height,
      overflow: html.style.overflow,
    };

    const body = document.body;
    const previousBody = {
      overflow: body.style.overflow,
      touchAction: body.style.touchAction,
    };

    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    html.style.position = "fixed";
    html.style.width = "100%";
    html.style.height = "100%";
    html.style.overflow = "hidden";

    let syncFrame = 0;
    let viewport = window.visualViewport;

    const sync = () => {
      syncFrame = 0;
      const vv = viewport ?? window.visualViewport;
      if (!vv) {
        return;
      }

      const keyboardInset = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop,
      );

      document.documentElement.style.setProperty(
        "--keyboard-inset",
        `${keyboardInset}px`,
      );

      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const schedule = () => {
      if (syncFrame !== 0) {
        return;
      }

      syncFrame = requestAnimationFrame(sync);
    };

    sync();

    viewport = window.visualViewport;
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);

    return () => {
      cancelAnimationFrame(syncFrame);
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      document.documentElement.style.removeProperty("--keyboard-inset");
      html.style.position = previousHtml.position;
      html.style.width = previousHtml.width;
      html.style.height = previousHtml.height;
      html.style.overflow = previousHtml.overflow;
      body.style.overflow = previousBody.overflow;
      body.style.touchAction = previousBody.touchAction;
    };
  }, [active]);
}
