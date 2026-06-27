"use client";

import type { RefObject } from "react";
import type { useChat } from "@ai-sdk/react";
import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  StopCircleIcon,
  XIcon,
} from "lucide-react";

import type { Coordinates } from "@/app/lib/geo";
import { useKeyboardOpen } from "@/app/hooks/use-keyboard-open";
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
  InputGroupTextarea,
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
  const keyboardOpen = useKeyboardOpen(isFullscreen);
  const textSize = "text-sm/relaxed";
  const inputTextSize = "text-sm/relaxed md:text-sm/relaxed";

  return (
    <MessageScrollerProvider autoScroll>
      <div className={cn("relative flex h-full w-full flex-col", className)}>
        <Card
          className={cn(
            "mx-auto h-full w-full gap-0",
            textSize,
            isFullscreen
              ? "max-w-none rounded-none border-0 bg-transparent py-0 shadow-none ring-0 [--card-spacing:--spacing(5)]"
              : "max-w-sm",
          )}
        >
          <CardHeader
            className={cn(
              "shrink-0 gap-1 border-b",
              isFullscreen &&
                "pt-[max(0.75rem,env(safe-area-inset-top,0px))]",
            )}
          >
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

          <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
            {messages.length === 0 ? (
              <Empty
                className={cn(
                  "h-full border-0 transition-[padding] duration-200",
                  isFullscreen && keyboardOpen
                    ? "justify-start pt-[min(22dvh,9rem)]"
                    : "justify-center",
                )}
              >
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
              "shrink-0 flex-col gap-2",
              isFullscreen &&
                "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]",
            )}
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit(input);
              }}
              className="w-full"
            >
              <InputGroup className={textSize}>
                <InputGroupTextarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about spots, schedule, neighborhoods…"
                  className={cn("min-h-14 px-3 py-2.5", inputTextSize)}
                  rows={2}
                  enterKeyHint="send"
                  autoComplete="off"
                  autoCorrect="on"
                  disabled={isBusy}
                  onKeyDown={(event) => {
                    if (
                      event.key !== "Enter" ||
                      event.nativeEvent.isComposing
                    ) {
                      return;
                    }

                    if (!event.shiftKey) {
                      event.preventDefault();
                      void handleSubmit(input);
                    }
                  }}
                />
                <InputGroupAddon align="block-end" className={cn("pt-1", textSize)}>
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={!input.trim() || isBusy}
                    className="ml-auto data-[hidden=true]:hidden"
                    data-hidden={isBusy}
                  >
                    <ArrowUpIcon />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                  <InputGroupButton
                    size="icon-sm"
                    type="button"
                    data-hidden={!isBusy}
                    className="ml-auto data-[hidden=true]:hidden"
                    onClick={() => stop()}
                  >
                    <StopCircleIcon />
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
