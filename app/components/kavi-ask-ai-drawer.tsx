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
      <DrawerContent className="flex h-[76dvh] max-h-[76dvh] flex-col p-2 pb-[max(1rem,env(safe-area-inset-bottom,0px))] before:hidden data-[vaul-drawer-direction=bottom]:mt-20 data-[vaul-drawer-direction=bottom]:h-[76dvh] data-[vaul-drawer-direction=bottom]:max-h-[76dvh] [&>div:first-of-type]:hidden">
        {children}
      </DrawerContent>
    </Drawer>
  );
}
