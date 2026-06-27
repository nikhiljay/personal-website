"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { TooltipProvider } from "@/components/ui/tooltip";

import { useCurrentLocation } from "../hooks/use-current-location";
import { useMediaQuery } from "../hooks/use-media-query";
import { isInNyc, type Coordinates } from "../lib/geo";
import { KaviAskAiChat } from "./kavi-ask-ai-chat";
import { KaviAskAiFab } from "./kavi-ask-ai-fab";
import { KaviAskAiFullscreen } from "./kavi-ask-ai-fullscreen";
import { KaviAskAiPopover } from "./kavi-ask-ai-popover";

const chatTransport = new DefaultChatTransport({ api: "/api/kavi-trip/chat" });

function resolveChatLocation(
  location: Coordinates | null,
  isSimulated: boolean,
) {
  if (!location) {
    return null;
  }

  return isSimulated || isInNyc(location) ? location : null;
}

export function KaviAskAi() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const fabRef = useRef<HTMLButtonElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { location, isSimulated } = useCurrentLocation({ requireInteraction: true });
  const chatLocationRef = useRef<Coordinates | null>(null);
  chatLocationRef.current = resolveChatLocation(location, isSimulated);
  const chat = useChat({ transport: chatTransport });

  const chatProps = {
    input,
    setInput,
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    status: chat.status,
    error: chat.error,
    stop: chat.stop,
    getCurrentLocation: () => chatLocationRef.current,
  };

  return (
    <TooltipProvider>
      {createPortal(
        <>
          <KaviAskAiFab
            ref={fabRef}
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className={!isDesktop && open ? "pointer-events-none opacity-0" : undefined}
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
        <KaviAskAiFullscreen open={open}>
          {(scrollContainerRef) => (
            <KaviAskAiChat
              variant="fullscreen"
              className="min-h-0 flex-1"
              scrollContainerRef={scrollContainerRef}
              onClose={() => setOpen(false)}
              {...chatProps}
            />
          )}
        </KaviAskAiFullscreen>
      ) : null}
    </TooltipProvider>
  );
}
