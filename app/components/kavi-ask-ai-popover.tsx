"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import "./kavi-ask-ai-popover.css";

type KaviAskAiPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fabRef: React.RefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
};

export function KaviAskAiPopover({
  open,
  onOpenChange,
  fabRef,
  children,
}: KaviAskAiPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) {
        return;
      }
      if (fabRef.current?.contains(target)) {
        return;
      }
      onOpenChange(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [fabRef, onOpenChange, open]);

  return (
    <div
      ref={panelRef}
      className={cn(
        "kavi-ask-ai-popover fixed right-4 bottom-[calc(1.5rem+2.75rem+0.75rem)] z-40",
        "h-140 w-[min(100vw-3rem,24rem)]",
        open ? "is-open pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {children}
    </div>
  );
}
