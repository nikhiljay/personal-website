"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { KaviAskAiChat } from "./kavi-ask-ai-chat";

type KaviAskAiDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function KaviAskAiDrawer({ open, onOpenChange }: KaviAskAiDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex max-h-[92dvh] flex-col p-2 pb-[max(1rem,env(safe-area-inset-bottom,0px))] before:hidden [&>div:first-of-type]:hidden">
        <KaviAskAiChat
          variant="drawer"
          className="min-h-0 flex-1"
        />
      </DrawerContent>
    </Drawer>
  );
}
