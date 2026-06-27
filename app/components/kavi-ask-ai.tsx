"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { TooltipProvider } from "@/components/ui/tooltip";

import { useMediaQuery } from "../hooks/use-media-query";
import { KaviAskAiChat } from "./kavi-ask-ai-chat";
import { KaviAskAiDrawer } from "./kavi-ask-ai-drawer";
import { KaviAskAiFab } from "./kavi-ask-ai-fab";
import { KaviAskAiPopover } from "./kavi-ask-ai-popover";

const chatTransport = new DefaultChatTransport({ api: "/api/kavi-trip/chat" });

export function KaviAskAi() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const fabRef = useRef<HTMLButtonElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const chat = useChat({ transport: chatTransport });

  const chatProps = {
    input,
    setInput,
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    status: chat.status,
    error: chat.error,
    stop: chat.stop,
  };

  return (
    <TooltipProvider>
      {createPortal(
        <>
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
            >
              <KaviAskAiChat variant="card" className="h-full" {...chatProps} />
            </KaviAskAiPopover>
          ) : null}
        </>,
        document.body,
      )}
      {!isDesktop ? (
        <KaviAskAiDrawer open={open} onOpenChange={setOpen}>
          <KaviAskAiChat
            variant="drawer"
            className="min-h-0 flex-1"
            {...chatProps}
          />
        </KaviAskAiDrawer>
      ) : null}
    </TooltipProvider>
  );
}
