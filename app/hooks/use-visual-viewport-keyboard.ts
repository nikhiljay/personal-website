"use client";

import { useLayoutEffect } from "react";

// iOS only reports the keyboard height once it has opened, so the very first
// focus has nothing exact to pre-apply — fall back to a typical iPhone keyboard
// height, then reuse the real measured height on every subsequent open.
const FALLBACK_KEYBOARD_INSET = 300;
// Pre-lift the input a little ABOVE the measured keyboard so iOS sees clearance
// and skips its reveal-pan; a flush fit still triggers the pan.
const KEYBOARD_REVEAL_MARGIN = 16;
// A shrink larger than this means the on-screen keyboard is genuinely up.
const KEYBOARD_UP_THRESHOLD = 100;
let cachedKeyboardInset = 0;

// TEMP: on-screen readout to confirm behavior on real iOS. Flip off / delete the
// dbg* blocks once dialed in.
const DEBUG = true;

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

    // ---- TEMP DEBUG ----
    let dbgBox: HTMLPreElement | null = null;
    let dbgFocusLine = "";
    const dbgSyncLog: string[] = [];
    let dbgT0 = 0;
    let dbgMaxTop = 0;
    const dbgRender = () => {
      if (dbgBox) {
        dbgBox.textContent = [
          `PEAK pan(top)=${dbgMaxTop}  <- 0 = good`,
          dbgFocusLine,
          ...dbgSyncLog.slice(-10),
        ].join("\n");
      }
    };
    if (DEBUG) {
      dbgBox = document.createElement("pre");
      dbgBox.style.cssText =
        "position:fixed;top:0;left:0;z-index:99999;margin:0;padding:6px;background:rgba(0,0,0,.82);color:#0f0;font:11px/1.3 monospace;white-space:pre;pointer-events:none;max-width:78vw;";
      document.body.appendChild(dbgBox);
    }

    // The keyboard height is (layout viewport) - (visual viewport bottom).
    // Use documentElement.clientHeight for the layout viewport: on iOS
    // window.innerHeight tracks the *visual* viewport (so innerHeight - vv ≈ 0
    // always), but clientHeight stays the full layout height the keyboard
    // overlays. Lifting the input by this amount puts it above the keyboard, so
    // iOS has no hidden input to reveal and skips its janky pan.
    const sync = () => {
      const vv = window.visualViewport;
      if (!vv) {
        return;
      }

      const layoutHeight = html.clientHeight;
      const offsetTop = Math.max(0, Math.round(vv.offsetTop));
      const keyboardInset = Math.max(
        0,
        Math.round(layoutHeight - vv.offsetTop - vv.height),
      );

      if (keyboardInset > cachedKeyboardInset) {
        cachedKeyboardInset = keyboardInset;
      }

      html.style.setProperty("--vv-top", `${offsetTop}px`);
      html.style.setProperty("--keyboard-inset", `${keyboardInset}px`);

      if (DEBUG && dbgBox) {
        if (offsetTop > dbgMaxTop) {
          dbgMaxTop = offsetTop;
        }
        const t = dbgT0 ? Math.round(performance.now() - dbgT0) : 0;
        dbgSyncLog.push(
          `+${t} top=${offsetTop} h=${Math.round(vv.height)} ch=${layoutHeight} kb=${keyboardInset}`,
        );
        dbgRender();
      }
    };

    let revealGuard = 0;

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        !target.matches("input, textarea, [contenteditable]")
      ) {
        return;
      }

      const vv = window.visualViewport;
      const shrink = vv ? Math.round(html.clientHeight - vv.height) : -1;

      if (DEBUG) {
        dbgT0 = performance.now();
        dbgSyncLog.length = 0;
        dbgMaxTop = 0;
      }

      // Skip only if a keyboard is genuinely already up (refocus). Use the live
      // layout-vs-visual delta, not --keyboard-inset (which keeps a residual).
      if (vv && shrink > KEYBOARD_UP_THRESHOLD) {
        if (DEBUG) {
          dbgFocusLine = `FOCUS skip shrink=${shrink}`;
          dbgRender();
        }
        return;
      }

      const predicted = cachedKeyboardInset
        ? cachedKeyboardInset + KEYBOARD_REVEAL_MARGIN
        : FALLBACK_KEYBOARD_INSET;
      html.style.setProperty("--keyboard-inset", `${predicted}px`);

      if (DEBUG) {
        dbgFocusLine = `FOCUS lift=${predicted} cached=${cachedKeyboardInset} ch=${html.clientHeight}`;
        dbgRender();
      }

      // Undo the speculative inset if no on-screen keyboard actually shows up
      // (e.g. an external keyboard), so the input isn't left lifted.
      window.clearTimeout(revealGuard);
      revealGuard = window.setTimeout(() => {
        const live = window.visualViewport;
        if (live && html.clientHeight - live.height < KEYBOARD_UP_THRESHOLD) {
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
      dbgBox?.remove();
      html.style.removeProperty("--vv-top");
      html.style.removeProperty("--keyboard-inset");
      html.style.position = previousHtml.position;
      html.style.width = previousHtml.width;
      html.style.height = previousHtml.height;
      html.style.overscrollBehavior = previousHtml.overscrollBehavior;
    };
  }, [active]);
}
