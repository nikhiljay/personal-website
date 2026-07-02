"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useCurrentLocation } from "../hooks/use-current-location";
import { useMediaQuery } from "../hooks/use-media-query";
import {
  buildLocationContext,
  type UserLocationContext,
} from "../lib/user-location";
import { KaviAskAiChat } from "./kavi-ask-ai-chat";
import { KaviAskAiFab } from "./kavi-ask-ai-fab";
import { KaviAskAiFullscreen } from "./kavi-ask-ai-fullscreen";
import { KaviAskAiPopover } from "./kavi-ask-ai-popover";

const chatTransport = new DefaultChatTransport({ api: "/api/kavi-trip/chat" });

export function KaviAskAi() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const fabRef = useRef<HTMLButtonElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const {
    location,
    isSimulated,
    enabled,
    permissionDenied,
    isSupported,
  } = useCurrentLocation({ requireInteraction: true });
  const locationContextRef = useRef<UserLocationContext>({ mode: "unavailable" });
  locationContextRef.current = buildLocationContext({
    location,
    isSimulated,
    enabled,
    permissionDenied,
    isSupported,
  });
  const chat = useChat({ transport: chatTransport });
  const openRef = useRef(open);
  openRef.current = open;

  const restoreChatTriggerFocus = useCallback(() => {
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      active.closest('[data-slot="input-group-control"]')
    ) {
      active.blur();
    }

    fabRef.current?.focus({ preventScroll: true });
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => {
      restoreChatTriggerFocus();
    });
  }, [restoreChatTriggerFocus]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        requestAnimationFrame(() => {
          restoreChatTriggerFocus();
        });
      }
    },
    [restoreChatTriggerFocus],
  );

  const toggleChat = useCallback(() => setOpen((current) => !current), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "c" && event.key !== "C") {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      const target = event.target;
      if (
        openRef.current &&
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      event.preventDefault();
      toggleChat();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [toggleChat]);

  const chatProps = {
    isOpen: open,
    input,
    setInput,
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    status: chat.status,
    error: chat.error,
    stop: chat.stop,
    getLocationContext: () => locationContextRef.current,
  };

  return (
    <>
      {createPortal(
        <>
          <KaviAskAiFab
            ref={fabRef}
            onClick={toggleChat}
            aria-expanded={open}
            className={!isDesktop && open ? "pointer-events-none opacity-0" : undefined}
          />
          {isDesktop ? (
            <KaviAskAiPopover
              open={open}
              onOpenChange={handleOpenChange}
              fabRef={fabRef}
            >
              <KaviAskAiChat variant="card" className="h-full" {...chatProps} />
            </KaviAskAiPopover>
          ) : null}
        </>,
        document.body,
      )}
      {!isDesktop ? (
        <KaviAskAiFullscreen open={open} onClose={closeChat}>
          {(scrollContainerRef) => (
            <KaviAskAiChat
              variant="fullscreen"
              className="min-h-0 flex-1"
              scrollContainerRef={scrollContainerRef}
              {...chatProps}
            />
          )}
        </KaviAskAiFullscreen>
      ) : null}
    </>
  );
}
