"use client";

import type { RefObject } from "react";
import type { UIMessage } from "ai";
import type { useChat } from "@ai-sdk/react";
import { useLayoutEffect } from "react";
import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  XIcon,
} from "lucide-react";

import type { UserLocationContext } from "@/app/lib/user-location";
import { usePreferredColorScheme } from "@/app/hooks/use-preferred-color-scheme";
import { useThoughtTurnTiming } from "@/app/hooks/use-thought-turn-timing";
import { MessageAnimated } from "@/components/message-animated";
import { ReasoningBlock } from "@/components/reasoning-block";
import { Button } from "@/components/ui/button";
import { Message, MessageContent } from "@/components/ui/message";
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
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
} from "@/components/ui/message-scroller";
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
  getLocationContext: () => UserLocationContext;
};

function getSendButtonColors(
  scheme: "light" | "dark",
  disabled: boolean,
) {
  if (disabled) {
    return {
      backgroundColor: scheme === "dark" ? "#404040" : "#d4d4d4",
      color: "#737373",
    };
  }

  return {
    backgroundColor: scheme === "dark" ? "#f5f5f5" : "#171717",
    color: scheme === "dark" ? "#171717" : "#ffffff",
  };
}

function ChatBottomPin({
  isBusy,
  messages,
  showFallbackThinking,
}: {
  isBusy: boolean;
  messages: UIMessage[];
  showFallbackThinking: boolean;
}) {
  const { scrollToEnd } = useMessageScroller();
  const scrollable = useMessageScrollerScrollable();
  const atBottom = !scrollable.end;
  const lastMessage = messages.at(-1);
  const streamContentKey =
    lastMessage?.parts
      .map((part) => {
        if (part.type === "text") {
          return `t:${part.text.length}`;
        }

        if (part.type === "reasoning") {
          return `r:${part.text.length}:${part.state ?? ""}`;
        }

        if (part.type.startsWith("tool-") && "state" in part) {
          return `tool:${part.toolCallId}:${part.state}`;
        }

        return part.type;
      })
      .join("|") ?? "";
  const pinKey = `${messages.length}:${lastMessage?.id ?? ""}:${showFallbackThinking}:${streamContentKey}`;

  // biome-ignore lint/correctness/useExhaustiveDependencies: pinKey encodes message/tool stream updates
  useLayoutEffect(() => {
    if (!isBusy || !atBottom) {
      return;
    }

    scrollToEnd({ behavior: "auto" });
  }, [atBottom, isBusy, pinKey, scrollToEnd]);

  return null;
}

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
  getLocationContext,
}: KaviAskAiChatProps) {
  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const latestAssistantMessageId =
    lastMessage?.role === "assistant" ? lastMessage.id : null;

  const thoughtTurn = useThoughtTurnTiming(status);
  const hasStreamingAssistant =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some(
      (part) =>
        part.type === "reasoning" ||
        part.type === "text" ||
        part.type.startsWith("tool-"),
    );
  const showFallbackThinking =
    thoughtTurn.isActive &&
    !hasStreamingAssistant &&
    lastMessage?.role !== "assistant";
  const colorScheme = usePreferredColorScheme();
  const isSubmitDisabled = !input.trim() || isBusy;
  const sendButtonColors = getSendButtonColors(colorScheme, isSubmitDisabled);
  const stopIconColor = colorScheme === "dark" ? "#171717" : "#ffffff";

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) {
      return;
    }

    setInput("");
    await sendMessage(
      { text: trimmed },
      { body: { locationContext: getLocationContext() } },
    );
  };

  const isFullscreen = variant === "fullscreen";
  const textSize = "text-sm/relaxed";
  const inputTextSize = "text-sm/relaxed md:text-sm/relaxed";

  const header = (
    <CardHeader className="shrink-0 gap-1 border-b bg-popover">
      <CardTitle>Nikhil Agent</CardTitle>
      <CardDescription className={textSize}>
        How can I help you today?
      </CardDescription>
      {onClose ? (
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
              ? "!grid min-h-0 grid-rows-[minmax(0,1fr)_auto] max-w-none rounded-none border-0 bg-popover py-0 shadow-none ring-0 [--card-spacing:--spacing(5)]"
              : "max-w-sm flex flex-col",
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
                  <EmptyTitle>Hey Kavi 🤏🏽</EmptyTitle>
                  <EmptyDescription className={textSize}>
                    Ask about food recs, your schedule, AHLA, or things to do. Send
                    a message to start.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <MessageScroller className="h-full touch-auto">
                <ChatBottomPin
                  isBusy={isBusy}
                  messages={messages}
                  showFallbackThinking={showFallbackThinking}
                />
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
                    {messages.map((message, index) => (
                      <MessageAnimated
                        key={message.id}
                        message={message}
                        scrollAnchor={false}
                        layoutStable={index >= messages.length - 2}
                        textSize={textSize}
                        turnTiming={
                          message.role === "assistant" &&
                          message.id === latestAssistantMessageId &&
                          thoughtTurn.isActive
                            ? thoughtTurn
                            : undefined
                        }
                      />
                    ))}
                    {showFallbackThinking ? (
                      <MessageScrollerItem messageId="thinking" layoutStable>
                        <Message align="start" className={textSize}>
                          <MessageContent className="[&>*]:w-full [&>*]:min-w-0 gap-1.5 [&>[data-slot=reasoning-block]+*]:-mt-1.5">
                            <ReasoningBlock
                              text=""
                              turnTiming={thoughtTurn}
                              className="w-full min-w-0 self-stretch"
                            />
                          </MessageContent>
                        </Message>
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
              "kavi-ask-ai-chat-footer shrink-0 flex-col gap-2 bg-popover",
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
              <InputGroup
                className={cn(
                  textSize,
                  "h-12 rounded-full border-0 bg-muted p-1.5 shadow-none",
                  "has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0",
                )}
              >
                <InputGroupInput
                  type="text"
                  name="message"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask me anything!"
                  aria-label="Message"
                  className={cn(
                    "h-full min-w-0 px-3 py-0 text-foreground placeholder:text-muted-foreground",
                    inputTextSize,
                  )}
                  enterKeyHint="send"
                  autoComplete="off"
                  autoCorrect="on"
                  disabled={isBusy}
                  onTouchEnd={
                    isFullscreen
                      ? (event) => {
                          // iOS scrolls the visual viewport to reveal focused
                          // inputs even inside fixed overlays. preventScroll on
                          // touchend is the supported way to opt out.
                          const el = event.currentTarget;
                          if (el === document.activeElement) {
                            return;
                          }
                          event.preventDefault();
                          el.focus({ preventScroll: true });
                        }
                      : undefined
                  }
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
                  className={cn(
                    "shrink-0 p-0 has-[>button]:mr-0",
                    textSize,
                  )}
                >
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    style={sendButtonColors}
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border-0 p-0 shadow-none outline-none appearance-none [-webkit-appearance:none] disabled:opacity-100",
                      isBusy && "hidden",
                    )}
                  >
                    <ArrowUpIcon className="size-[18px] stroke-[2.5]" />
                    <span className="sr-only">Send</span>
                  </button>
                  <button
                    type="button"
                    style={getSendButtonColors(colorScheme, false)}
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border-0 p-0 shadow-none outline-none appearance-none [-webkit-appearance:none]",
                      !isBusy && "hidden",
                    )}
                    onClick={() => stop()}
                  >
                    <span
                      className="size-3 shrink-0 rounded-[3px]"
                      style={{ backgroundColor: stopIconColor }}
                      aria-hidden
                    />
                    <span className="sr-only">Stop</span>
                  </button>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardFooter>
        </Card>
      </div>
    </MessageScrollerProvider>
  );
}
