"use client";

import { useRef, useState } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

import { useMediaQuery } from "../hooks/use-media-query";
import { KaviAskAiDrawer } from "./kavi-ask-ai-drawer";
import { KaviAskAiFab } from "./kavi-ask-ai-fab";
import { KaviAskAiPopover } from "./kavi-ask-ai-popover";

export function KaviAskAi() {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <TooltipProvider>
      <KaviAskAiFab
        ref={fabRef}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      />
      {isDesktop ? (
        <KaviAskAiPopover
          open={open}
          onOpenChange={setOpen}
          fabRef={fabRef}
        />
      ) : (
        <KaviAskAiDrawer open={open} onOpenChange={setOpen} />
      )}
    </TooltipProvider>
  );
}
