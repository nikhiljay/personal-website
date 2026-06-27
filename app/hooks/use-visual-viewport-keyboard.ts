"use client";

import { useLayoutEffect } from "react";

// iOS only reports the keyboard height once it has opened, so the very first
// focus has nothing exact to pre-apply — fall back to a typical iPhone keyboard
// height, then reuse the real measured height on every subsequent open.
const FALLBACK_KEYBOARD_INSET = 300;
let cachedKeyboardInset = 0;

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

      if (keyboardInset > 0) {
        cachedKeyboardInset = keyboardInset;
      }

      html.style.setProperty("--vv-top", `${offsetTop}px`);
      html.style.setProperty("--keyboard-inset", `${keyboardInset}px`);
    };

    // On focus iOS scrolls the visual viewport up to reveal the input it
    // assumes the keyboard will cover, spiking offsetTop and whipping the
    // header / chat top around before it settles back to 0 (the input stays
    // smooth because it tracks the keyboard top, not offsetTop). Pre-applying
    // the expected keyboard inset the instant an input is focused lifts the
    // input above the keyboard first, so iOS finds nothing to reveal and skips
    // the scroll. The visualViewport resize then corrects to the exact height,
    // and the CSS transition smooths the estimate -> measured handoff.
    let revealGuard = 0;

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        !target.matches("input, textarea, [contenteditable]")
      ) {
        return;
      }

      const currentInset =
        Number.parseFloat(html.style.getPropertyValue("--keyboard-inset")) || 0;
      if (currentInset > 0) {
        return;
      }

      html.style.setProperty(
        "--keyboard-inset",
        `${cachedKeyboardInset || FALLBACK_KEYBOARD_INSET}px`,
      );

      // Undo the speculative inset if no on-screen keyboard actually shows up
      // (e.g. an external/hardware keyboard), so the input isn't left lifted.
      window.clearTimeout(revealGuard);
      revealGuard = window.setTimeout(() => {
        const vv = window.visualViewport;
        if (vv && window.innerHeight - vv.height < 100) {
          sync();
        }
      }, 400);
    };

    sync();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      window.clearTimeout(revealGuard);
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      document.removeEventListener("focusin", onFocusIn);
      html.style.removeProperty("--vv-top");
      html.style.removeProperty("--keyboard-inset");
      html.style.position = previousHtml.position;
      html.style.width = previousHtml.width;
      html.style.height = previousHtml.height;
      html.style.overscrollBehavior = previousHtml.overscrollBehavior;
    };
  }, [active]);
}
