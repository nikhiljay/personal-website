"use client";

import type { RefObject } from "react";
import type { useChat } from "@ai-sdk/react";
import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  XIcon,
} from "lucide-react";

import type { Coordinates } from "@/app/lib/geo";
import { MessageAnimated } from "@/components/message-animated";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/components/ui/marker";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type KaviAskAiChatProps = {
  className?: string;
  variant?: "card" | "fullscreen";
  onClose?: () => void;
  scrollContainerRef?: RefObject<Element | null>;
  input: string;
  setInput: (value: string) => void;
  messages: ReturnType<typeof useChat>["messages"];
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  status: ReturnType<typeof useChat>["status"];
  error: ReturnType<typeof useChat>["error"];
  stop: ReturnType<typeof useChat>["stop"];
  getCurrentLocation: () => Coordinates | null;
};

export function KaviAskAiChat({
  className,
  variant = "card",
  onClose,
  scrollContainerRef,
  input,
  setInput,
  messages,
  sendMessage,
  status,
  error,
  stop,
  getCurrentLocation,
}: KaviAskAiChatProps) {
  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) {
      return;
    }

    setInput("");
    const currentLocation = getCurrentLocation();
    await sendMessage(
      { text: trimmed },
      currentLocation ? { body: { currentLocation } } : undefined,
    );
  };

  const isFullscreen = variant === "fullscreen";
  const textSize = "text-sm/relaxed";
  const inputTextSize = "text-sm/relaxed md:text-sm/relaxed";

  const header = (
    <CardHeader className="shrink-0 gap-1 border-b bg-popover">
      <CardTitle>Ask AI</CardTitle>
      <CardDescription className={textSize}>
        How can I help you today?
      </CardDescription>
      {onClose ? (
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close Ask AI"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        </CardAction>
      ) : null}
    </CardHeader>
  );

  return (
    <MessageScrollerProvider autoScroll>
      <div className={cn("relative flex h-full w-full flex-col", className)}>
        <Card
          className={cn(
            "mx-auto h-full w-full gap-0",
            textSize,
            isFullscreen
              ? "flex min-h-0 max-w-none flex-col rounded-none border-0 bg-popover py-0 shadow-none ring-0 [--card-spacing:--spacing(5)]"
              : "max-w-sm",
          )}
        >
          {!isFullscreen ? header : null}

          <CardContent className="min-h-0 flex-1 overflow-hidden overscroll-none p-0">
            {messages.length === 0 ? (
              <Empty className="h-full touch-none justify-center overflow-hidden border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageCircleDashedIcon />
                  </EmptyMedia>
                  <EmptyTitle>Hey Kavi!</EmptyTitle>
                  <EmptyDescription className={textSize}>
                    Ask about your schedule, saved spots, or neighborhoods. Send
                    a message to start.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <MessageScroller className="h-full touch-auto">
                <MessageScrollerViewport
                  ref={
                    scrollContainerRef as React.RefObject<HTMLDivElement | null>
                  }
                  className={isFullscreen ? "touch-auto" : undefined}
                >
                  <MessageScrollerContent
                    aria-busy={isBusy}
                    className="p-(--card-spacing)"
                  >
                    {messages.map((message) => (
                      <MessageAnimated
                        key={message.id}
                        message={message}
                        scrollAnchor={message.role === "user"}
                        textSize={textSize}
                      />
                    ))}
                    {status === "submitted" ? (
                      <MessageScrollerItem messageId="thinking">
                        <Marker role="status" className={textSize}>
                          <MarkerIcon>
                            <Spinner />
                          </MarkerIcon>
                          <MarkerContent>Thinking…</MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                    ) : null}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            )}
          </CardContent>

          {error ? (
            <p
              className={cn(
                "px-(--card-spacing) pb-2 text-destructive",
                textSize,
              )}
            >
              {error.message}
            </p>
          ) : null}

          <CardFooter
            className={cn(
              "shrink-0 flex-col gap-2 bg-popover",
              isFullscreen && "pb-3",
            )}
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit(input);
              }}
              className="w-full"
            >
              <InputGroup
                className={cn(
                  textSize,
                  "h-12 rounded-full border-0 bg-neutral-100 shadow-none dark:bg-neutral-800/80",
                  "has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0",
                )}
              >
                <InputGroupInput
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about spots, schedule, neighborhoods…"
                  className={cn(
                    "h-full min-w-0 px-4 py-0",
                    inputTextSize,
                  )}
                  enterKeyHint="send"
                  autoComplete="off"
                  autoCorrect="on"
                  disabled={isBusy}
                  onTouchEnd={(event) => {
                    if (!isFullscreen) {
                      return;
                    }

                    event.currentTarget.focus({ preventScroll: true });
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key !== "Enter" ||
                      event.nativeEvent.isComposing
                    ) {
                      return;
                    }

                    event.preventDefault();
                    void handleSubmit(input);
                  }}
                />
                <InputGroupAddon
                  align="inline-end"
                  className={cn("shrink-0 py-0 pr-3", textSize)}
                >
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={!input.trim() || isBusy}
                    className="size-9 rounded-full border-0 bg-neutral-900 text-white shadow-none hover:bg-neutral-800 focus-visible:ring-0 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:opacity-100 data-[hidden=true]:hidden"
                    data-hidden={isBusy}
                  >
                    <ArrowUpIcon className="size-[18px] stroke-[2.5]" />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                  <InputGroupButton
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                    data-hidden={!isBusy}
                    className="size-9 rounded-full border-0 bg-neutral-900 p-0 text-white shadow-none hover:bg-neutral-800 focus-visible:ring-0 data-[hidden=true]:hidden"
                    onClick={() => stop()}
                  >
                    <span
                      className="size-3 shrink-0 rounded-[3px] bg-white"
                      aria-hidden
                    />
                    <span className="sr-only">Stop</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardFooter>
        </Card>
      </div>
    </MessageScrollerProvider>
  );
}
