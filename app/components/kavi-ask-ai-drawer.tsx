"use client";

import { useRef } from "react";

import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { useVisualViewportDrawer } from "../hooks/use-visual-viewport-drawer";

type KaviAskAiDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function KaviAskAiDrawer({
  open,
  onOpenChange,
  children,
}: KaviAskAiDrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useVisualViewportDrawer(open, contentRef);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent
        ref={contentRef}
        className="flex max-h-[76dvh] flex-col p-2 pb-[max(1rem,env(safe-area-inset-bottom,0px))] before:hidden data-[vaul-drawer-direction=bottom]:mt-16 data-[vaul-drawer-direction=bottom]:max-h-[76dvh] [&>div:first-of-type]:hidden"
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
}
