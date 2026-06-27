"use client";

import type { useChat } from "@ai-sdk/react";
import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  StopCircleIcon,
} from "lucide-react";

import { MessageAnimated } from "@/components/message-animated";
import {
  Card,
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
  variant?: "card" | "drawer";
  input: string;
  setInput: (value: string) => void;
  messages: ReturnType<typeof useChat>["messages"];
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  status: ReturnType<typeof useChat>["status"];
  error: ReturnType<typeof useChat>["error"];
  stop: ReturnType<typeof useChat>["stop"];
};

export function KaviAskAiChat({
  className,
  variant = "card",
  input,
  setInput,
  messages,
  sendMessage,
  status,
  error,
  stop,
}: KaviAskAiChatProps) {
  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) {
      return;
    }

    setInput("");
    await sendMessage({ text: trimmed });
  };

  const isDrawer = variant === "drawer";
  const textSize = "text-sm/relaxed";
  const inputTextSize = "text-sm/relaxed md:text-sm/relaxed";

  return (
    <MessageScrollerProvider autoScroll>
      <div className={cn("relative flex h-full w-full flex-col", className)}>
        <Card
          className={cn(
            "mx-auto h-full w-full gap-0",
            textSize,
            isDrawer
              ? "max-w-none rounded-xl py-0 ring-0 [--card-spacing:--spacing(5)]"
              : "max-w-sm",
          )}
        >
          {isDrawer ? (
            <div
              aria-hidden
              className="mx-auto mt-4 h-1.5 w-[100px] shrink-0 rounded-full bg-muted"
            />
          ) : null}
          <CardHeader
            className={cn("gap-1 border-b", isDrawer && "pt-3")}
          >
            <CardTitle>Ask AI</CardTitle>
            <CardDescription className={textSize}>
              How can I help you today?
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
            {messages.length === 0 ? (
              <Empty className="h-full border-0">
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
              <MessageScroller className="h-full">
                <MessageScrollerViewport>
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

          <CardFooter className={cn("flex-col gap-2", isDrawer && "pb-6")}>
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
                  disabled={isBusy}
                  onFocus={() => {
                    if (isDrawer) {
                      requestAnimationFrame(() => {
                        window.scrollTo(0, 0);
                      });
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
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
