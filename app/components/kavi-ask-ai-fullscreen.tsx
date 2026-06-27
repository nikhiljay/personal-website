"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";
import { useVisualViewportKeyboard } from "../hooks/use-visual-viewport-keyboard";
import { KaviAskAiFullscreenHeader } from "./kavi-ask-ai-fullscreen-header";
import "./kavi-ask-ai-fullscreen.css";

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

  return createPortal(
    <div
      className={cn(
        "kavi-ask-ai-fullscreen fixed inset-0 z-50",
        open && "is-open",
      )}
      aria-hidden={!open}
    >
      <div aria-hidden className="absolute inset-0 bg-popover" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-ai-title"
        className="absolute inset-x-0 top-0 flex h-[var(--vv-height,100dvh)] touch-none flex-col overflow-hidden overscroll-none bg-popover text-popover-foreground will-change-[transform,height] [transform:translate3d(0,var(--vv-top,0px),0)]"
      >
        <div className="isolate shrink-0 border-b border-border bg-popover">
          <KaviAskAiFullscreenHeader onClose={onClose} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-popover">
          {children(scrollContainerRef)}
        </div>
      </div>
    </div>,
    document.body,
  );
}
