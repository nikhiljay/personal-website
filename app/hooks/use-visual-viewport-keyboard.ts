"use client";

import { useLayoutEffect } from "react";

// iOS only reports the keyboard height once it has opened, so the very first
// focus has nothing exact to pre-apply — fall back to a typical iPhone keyboard
// height, then reuse the real measured height on every subsequent open.
const FALLBACK_KEYBOARD_INSET = 300;
// Pre-lift during the opening animation only — preventScroll handles the pan
// once focused, so the margin doesn't need to carry into the settled position.
const KEYBOARD_REVEAL_MARGIN = 8;
// A shrink larger than this means the on-screen keyboard is genuinely up.
const KEYBOARD_UP_THRESHOLD = 100;
// An inset at or below this counts as fully closed — small enough that resuming
// inset tracking here can't visibly snap the body back up.
const KEYBOARD_CLOSED_INSET = 4;
// No on-screen keyboard exceeds ~420px including accessory bars.
const KEYBOARD_INSET_ABSOLUTE_MAX = 420;
let cachedKeyboardInset = 0;

function isTextInputFocused() {
  const active = document.activeElement;
  return (
    active instanceof HTMLElement &&
    active.matches("input, textarea, [contenteditable]")
  );
}

function getMaxPlausibleKeyboardInset(layoutHeight: number) {
  return Math.min(
    Math.round(layoutHeight * 0.52),
    KEYBOARD_INSET_ABSOLUTE_MAX,
    (cachedKeyboardInset || FALLBACK_KEYBOARD_INSET) + 48,
  );
}

/** Drop sparse iOS/simulator frames where vv.height briefly implodes. */
function readKeyboardInset(
  layoutHeight: number,
  vv: VisualViewport,
): number | null {
  const offsetTop = Math.max(0, Math.round(vv.offsetTop));
  const inset = Math.max(
    0,
    Math.round(layoutHeight - offsetTop - vv.height),
  );

  if (inset === 0) {
    return 0;
  }

  const maxPlausible = getMaxPlausibleKeyboardInset(layoutHeight);
  if (inset > maxPlausible) {
    return null;
  }

  // A real keyboard leaves at least ~38% of the layout visible.
  if (vv.height < layoutHeight * 0.38) {
    return null;
  }

  return inset;
}

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

    // The keyboard height is (layout viewport) - (visual viewport bottom).
    // Use documentElement.clientHeight for the layout viewport: on iOS
    // window.innerHeight tracks the *visual* viewport (so innerHeight - vv ≈ 0
    // always), but clientHeight stays the full layout height the keyboard
    // overlays. Lifting the input by this amount puts it above the keyboard.
    const sync = () => {
      const vv = window.visualViewport;
      if (!vv) {
        return;
      }

      const layoutHeight = html.clientHeight;
      const offsetTop = Math.max(0, Math.round(vv.offsetTop));
      const keyboardInset = readKeyboardInset(layoutHeight, vv);

      if (
        keyboardInset != null &&
        keyboardInset > cachedKeyboardInset &&
        keyboardInset > KEYBOARD_UP_THRESHOLD
      ) {
        cachedKeyboardInset = keyboardInset;
      }

      // We lift the chat from the bottom; while an input is focused, ignore
      // visual-viewport pan (offsetTop) so header/body top don't bob after the
      // keyboard settles. Real devices stay ~0 thanks to preventScroll; the
      // simulator reports noisy scroll events, especially on mouse-driven focus.
      const effectiveTop = isTextInputFocused() ? 0 : offsetTop;
      html.style.setProperty("--vv-top", `${effectiveTop}px`);

      // While dismissing, hold the inset at 0 (set on focusout) and only resume
      // tracking once the viewport confirms the keyboard is fully gone. Resuming
      // any earlier would re-read a mid-close height and snap the body back up
      // and down — the jerk at the bottom of the dismiss.
      if (dismissing) {
        if (keyboardInset === null) {
          return;
        }
        if (keyboardInset > KEYBOARD_CLOSED_INSET) {
          return;
        }
        dismissing = false;
        window.clearTimeout(dismissEnd);
      }

      let insetToApply: number;
      if (isTextInputFocused()) {
        if (keyboardInset != null) {
          const settledThreshold = Math.max(
            KEYBOARD_UP_THRESHOLD,
            (cachedKeyboardInset || FALLBACK_KEYBOARD_INSET) -
              KEYBOARD_REVEAL_MARGIN,
          );

          if (keyboardInset >= settledThreshold) {
            if (!hasMeasuredKeyboard) {
              hasMeasuredKeyboard = true;
              sessionInsetMax = keyboardInset;
            } else {
              sessionInsetMax = Math.max(sessionInsetMax, keyboardInset);
            }
          } else if (!hasMeasuredKeyboard) {
            sessionInsetMax = Math.max(sessionInsetMax, keyboardInset);
          }
        }

        // Never merge a raw (possibly spurious) frame — sessionInsetMax is the
        // only source of truth while focused.
        insetToApply = sessionInsetMax;
      } else if (keyboardInset != null) {
        insetToApply = keyboardInset;
      } else {
        return;
      }
      html.style.setProperty("--keyboard-inset", `${insetToApply}px`);
    };

    let revealGuard = 0;
    let dismissGuard = 0;
    let dismissEnd = 0;
    let dismissing = false;
    // Max inset seen during the current input-focus session. iOS (especially
    // the simulator) can emit a trailing burst of slightly smaller keyboard
    // heights after the UI has settled; holding the peak stops the bottom
    // transition from bouncing.
    let sessionInsetMax = 0;
    // Once the real keyboard height is reported, snap off the speculative
    // pre-lift and only hold peak measured values against trailing shrink.
    let hasMeasuredKeyboard = false;

    // The pre-lift only makes sense where focusing an input actually summons a
    // software keyboard — i.e. touch-primary devices. On a fine-pointer device
    // (desktop/laptop with a mouse) no keyboard appears, so predicting one would
    // shoot the input up by the guessed inset and snap it back. There, skip the
    // prediction entirely and let sync track the (unchanging) viewport.
    const canSoftKeyboard =
      window.matchMedia?.("(pointer: coarse)").matches ?? false;

    const onFocusIn = (event: FocusEvent) => {
      if (!canSoftKeyboard) {
        return;
      }

      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        !target.matches("input, textarea, [contenteditable]")
      ) {
        return;
      }

      const vv = window.visualViewport;

      // Skip only if a keyboard is genuinely already up (refocus). Use the live
      // layout-vs-visual delta, not --keyboard-inset (which keeps a residual).
      if (vv && html.clientHeight - vv.height > KEYBOARD_UP_THRESHOLD) {
        return;
      }

      const predicted = cachedKeyboardInset
        ? Math.min(cachedKeyboardInset, KEYBOARD_INSET_ABSOLUTE_MAX) +
          KEYBOARD_REVEAL_MARGIN
        : FALLBACK_KEYBOARD_INSET;
      sessionInsetMax = predicted;
      hasMeasuredKeyboard = false;
      html.style.setProperty("--keyboard-inset", `${predicted}px`);

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

    const onFocusOut = (event: FocusEvent) => {
      if (!canSoftKeyboard) {
        return;
      }

      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        !target.matches("input, textarea, [contenteditable]")
      ) {
        return;
      }

      // Defer so moving focus between fields (focusout → focusin) doesn't drop
      // the inset mid-switch; only collapse once focus has truly left all inputs.
      window.clearTimeout(dismissGuard);
      dismissGuard = window.setTimeout(() => {
        const activeEl = document.activeElement;
        if (
          activeEl instanceof HTMLElement &&
          activeEl.matches("input, textarea, [contenteditable]")
        ) {
          return;
        }

        // Collapse the inset right away so the body glides down in step with the
        // keyboard instead of waiting for iOS's sparse end-of-animation resize.
        // sync() holds it at 0 and resumes tracking once the close is confirmed.
        sessionInsetMax = 0;
        hasMeasuredKeyboard = false;
        dismissing = true;
        html.style.setProperty("--keyboard-inset", "0px");
        // Fallback only: release the guard if no resize ever confirms the close,
        // so the next keyboard open isn't left suppressed. Don't touch the inset
        // here — it's already 0 and re-reading now is what caused the jerk.
        window.clearTimeout(dismissEnd);
        dismissEnd = window.setTimeout(() => {
          dismissing = false;
        }, 600);
      }, 0);
    };

    sync();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      window.clearTimeout(revealGuard);
      window.clearTimeout(dismissGuard);
      window.clearTimeout(dismissEnd);
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      html.style.removeProperty("--vv-top");
      html.style.removeProperty("--keyboard-inset");
      html.style.position = previousHtml.position;
      html.style.width = previousHtml.width;
      html.style.height = previousHtml.height;
      html.style.overscrollBehavior = previousHtml.overscrollBehavior;
    };
  }, [active]);
}
