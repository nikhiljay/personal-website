"use client";

import { useLayoutEffect, useRef } from "react";
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
  const headerRef = useRef<HTMLDivElement>(null);

  useVisualViewportKeyboard(open);
  useBodyScrollLock(open, scrollContainerRef, { fixBody: false, touchLock: true });

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const header = headerRef.current;
    const html = document.documentElement;
    if (!header) {
      return;
    }

    const syncHeaderHeight = () => {
      html.style.setProperty(
        "--ask-ai-header-height",
        `${header.offsetHeight}px`,
      );
    };

    syncHeaderHeight();

    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(header);

    return () => {
      observer.disconnect();
      html.style.removeProperty("--ask-ai-header-height");
    };
  }, [open]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-ai-title"
      className={cn(
        "kavi-ask-ai-fullscreen fixed inset-0 z-50 bg-popover text-popover-foreground",
        open && "is-open",
      )}
      aria-hidden={!open}
    >
      <div
        ref={headerRef}
        className="kavi-ask-ai-fullscreen-header absolute inset-x-0 top-[length:var(--vv-top,0px)] z-[60] border-b border-border bg-popover"
      >
        <KaviAskAiFullscreenHeader onClose={onClose} />
      </div>
      <div className="kavi-ask-ai-fullscreen-body absolute inset-x-0 top-[calc(var(--vv-top,0px)+var(--ask-ai-header-height,0px))] bottom-[length:var(--keyboard-inset,0px)] flex touch-none flex-col overflow-hidden overscroll-none">
        {children(scrollContainerRef)}
      </div>
    </div>,
    document.body,
  );
}
