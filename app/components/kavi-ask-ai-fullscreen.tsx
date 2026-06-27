"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";

import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";
import { useVisualViewportKeyboard } from "../hooks/use-visual-viewport-keyboard";
import { KaviAskAiFullscreenHeader } from "./kavi-ask-ai-fullscreen-header";

type KaviAskAiFullscreenProps = {
  open: boolean;
  onClose: () => void;
  children: (scrollContainerRef: React.RefObject<Element | null>) => React.ReactNode;
};

export function KaviAskAiFullscreen({
  open,
  onClose,
  children,
}: KaviAskAiFullscreenProps) {
  const scrollContainerRef = useRef<Element | null>(null);

  useVisualViewportKeyboard(open);
  useBodyScrollLock(open, scrollContainerRef, { fixBody: false, touchLock: true });

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-ai-title"
      className="fixed inset-0 z-50 flex touch-none flex-col overflow-hidden overscroll-none bg-popover pb-[var(--keyboard-inset,0px)] text-popover-foreground"
    >
      <div className="shrink-0 border-b bg-popover">
        <KaviAskAiFullscreenHeader onClose={onClose} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-popover">
        {children(scrollContainerRef)}
      </div>
    </div>,
    document.body,
  );
}
