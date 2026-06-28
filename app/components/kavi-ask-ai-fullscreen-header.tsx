"use client";

import { memo } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type KaviAskAiFullscreenHeaderProps = {
  onClose: () => void;
};

export const KaviAskAiFullscreenHeader = memo(function KaviAskAiFullscreenHeader({
  onClose,
}: KaviAskAiFullscreenHeaderProps) {
  return (
    <CardHeader className="gap-1 bg-popover pb-2.5 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] [--card-spacing:--spacing(5)]">
      <CardTitle id="ask-ai-title">Nikhil Agent</CardTitle>
      <CardDescription className="text-sm/relaxed">
        How can I help you today?
      </CardDescription>
      <CardAction>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close Nikhil Agent"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </CardAction>
    </CardHeader>
  );
});
