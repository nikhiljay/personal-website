"use client";

import { useLayoutEffect } from "react";

/** Syncs --vv-top and --keyboard-inset to the visual viewport on every change. */
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
      overscrollBehavior: html.style.overscrollBehavior,
    };

    html.style.position = "fixed";
    html.style.width = "100%";
    html.style.height = "100%";
    html.style.overscrollBehavior = "none";

    // Write synchronously on each event so --vv-top tracks the visual
    // viewport top tightly (the header reads it directly). offsetTop and
    // height are read from the same vv snapshot, so they are always
    // consistent; smoothing between sparse iOS events is done in CSS via a
    // transition on the (now absolutely-positioned) header/body.
    const sync = () => {
      const vv = window.visualViewport;
      if (!vv) {
        return;
      }

      const offsetTop = Math.max(0, Math.round(vv.offsetTop));
      const keyboardInset = Math.max(
        0,
        Math.round(window.innerHeight - vv.offsetTop - vv.height),
      );

      html.style.setProperty("--vv-top", `${offsetTop}px`);
      html.style.setProperty("--keyboard-inset", `${keyboardInset}px`);
    };

    sync();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);

    return () => {
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      html.style.removeProperty("--vv-top");
      html.style.removeProperty("--keyboard-inset");
      html.style.position = previousHtml.position;
      html.style.width = previousHtml.width;
      html.style.height = previousHtml.height;
      html.style.overscrollBehavior = previousHtml.overscrollBehavior;
    };
  }, [active]);
}
