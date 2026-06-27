"use client";

import { useEffect, type RefObject } from "react";

export function useBodyScrollLock(
  active: boolean,
  allowScrollWithinRef: RefObject<Element | null>,
) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const hadDrawerOpenAttribute = html.hasAttribute("data-drawer-open");

    html.setAttribute("data-drawer-open", "");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const shouldAllowScroll = (target: EventTarget | null) => {
      if (!(target instanceof Node)) {
        return false;
      }

      return allowScrollWithinRef.current?.contains(target) ?? false;
    };

    let touchStartTarget: EventTarget | null = null;

    const onTouchStart = (event: TouchEvent) => {
      touchStartTarget = event.target;
    };

    const preventBackgroundScroll = (event: TouchEvent | WheelEvent) => {
      const target =
        event.type === "touchmove"
          ? (touchStartTarget ?? event.target)
          : event.target;

      if (shouldAllowScroll(target)) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });
    document.addEventListener("wheel", preventBackgroundScroll, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      document.removeEventListener("wheel", preventBackgroundScroll);

      if (!hadDrawerOpenAttribute) {
        html.removeAttribute("data-drawer-open");
      }

      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [active, allowScrollWithinRef]);
}
