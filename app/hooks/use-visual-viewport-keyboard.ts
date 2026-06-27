"use client";

import { useLayoutEffect } from "react";

/** Tracks visual viewport size/offset for the fullscreen shell (GPU transform). */
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

      html.style.setProperty("--vv-top", `${Math.round(vv.offsetTop)}px`);
      html.style.setProperty("--vv-height", `${Math.round(vv.height)}px`);
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
      html.style.removeProperty("--vv-top");
      html.style.removeProperty("--vv-height");
      html.style.position = previousHtml.position;
      html.style.width = previousHtml.width;
      html.style.height = previousHtml.height;
      html.style.overflow = previousHtml.overflow;
      body.style.overflow = previousBody.overflow;
      body.style.touchAction = previousBody.touchAction;
    };
  }, [active]);
}
