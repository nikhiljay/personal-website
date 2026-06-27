"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { KaviAskAiChat } from "./kavi-ask-ai-chat";

type KaviAskAiPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fabRef: React.RefObject<HTMLButtonElement | null>;
};

export function KaviAskAiPopover({
  open,
  onOpenChange,
  fabRef,
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

  if (!open) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed right-6 bottom-[calc(1.5rem+2.75rem+0.75rem)] z-40",
        "h-140 w-[min(100vw-3rem,24rem)]",
      )}
    >
      <KaviAskAiChat className="h-full" />
    </div>
  );
}
