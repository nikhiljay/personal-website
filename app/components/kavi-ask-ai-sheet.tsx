"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const STARTER_PROMPTS = [
  "What's on my schedule tomorrow?",
  "Best cafes near Midtown?",
  "Where should I go Friday night?",
];

const chatTransport = new DefaultChatTransport({ api: "/api/kavi-trip/chat" });

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

type KaviAskAiSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function KaviAskAiSheet({ open, onOpenChange }: KaviAskAiSheetProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error } = useChat({
    transport: chatTransport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setInput("");
    await sendMessage({ text: trimmed });
  };

  const emptyState = useMemo(
    () => messages.length === 0 && status === "ready",
    [messages.length, status],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        className="flex h-[min(70vh,560px)] flex-col gap-0 border-[light-dark(#e8e8e8,#333333)] bg-bg p-0 text-body"
      >
        <SheetHeader className="border-b border-[light-dark(#e8e8e8,#333333)] px-5 py-4 text-left">
          <SheetTitle className="text-[15px] font-normal text-fg">
            Ask about your trip
          </SheetTitle>
          <SheetDescription className="text-[13px] text-muted">
            Schedule, saved spots, and NYC tips from Nikhil&apos;s guide.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-5 py-4">
          {emptyState ? (
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-muted">Try asking:</p>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void handleSubmit(prompt)}
                  className="cursor-pointer rounded-md border border-[light-dark(#e8e8e8,#333333)] bg-transparent px-3 py-2 text-left text-[13px] text-body transition-colors hover:text-fg"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((message) => {
                const text = messageText(message);
                if (!text) {
                  return null;
                }

                const isUser = message.role === "user";

                return (
                  <li
                    key={message.id}
                    className={`text-[14px] leading-5 ${
                      isUser ? "text-fg" : "text-body"
                    }`}
                  >
                    {!isUser ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <p className="rounded-md bg-[light-dark(#f5f5f5,#2a2a2a)] px-3 py-2 whitespace-pre-wrap">
                        {text}
                      </p>
                    )}
                  </li>
                );
              })}
              {isLoading ? (
                <li className="text-[13px] text-muted" aria-live="polite">
                  Thinking…
                </li>
              ) : null}
            </ul>
          )}
          <div ref={bottomRef} />
        </ScrollArea>

        {error ? (
          <p className="px-5 pb-2 text-[13px] text-red-600 dark:text-red-400">
            {error.message}
          </p>
        ) : null}

        <form
          className="flex gap-2 border-t border-[light-dark(#e8e8e8,#333333)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about spots, schedule, neighborhoods…"
            rows={2}
            className="min-h-0 flex-1 resize-none border-[light-dark(#e8e8e8,#333333)] bg-bg text-[14px] text-fg"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit(input);
              }
            }}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={isLoading || !input.trim()}
            className="self-end border-[light-dark(#e8e8e8,#333333)] text-fg"
          >
            Send
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
