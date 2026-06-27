"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";

import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";

type KaviAskAiFullscreenProps = {
  open: boolean;
  children: (scrollContainerRef: React.RefObject<Element | null>) => React.ReactNode;
};

export function KaviAskAiFullscreen({ open, children }: KaviAskAiFullscreenProps) {
  const scrollContainerRef = useRef<Element | null>(null);

  useBodyScrollLock(open, scrollContainerRef);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex touch-none flex-col overflow-hidden overscroll-none bg-popover text-popover-foreground"
    >
      {children(scrollContainerRef)}
    </div>,
    document.body,
  );
}
