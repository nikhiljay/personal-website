"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";

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
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex max-h-[92dvh] flex-col p-2 pb-[max(1rem,env(safe-area-inset-bottom,0px))] before:hidden [&>div:first-of-type]:hidden">
        {children}
      </DrawerContent>
    </Drawer>
  );
}
