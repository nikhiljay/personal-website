"use client";

import type { RefObject } from "react";
import type { UIMessage } from "ai";
import type { useChat } from "@ai-sdk/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  XIcon,
} from "lucide-react";

import type { UserLocationContext } from "@/app/lib/user-location";
import { usePreferredColorScheme } from "@/app/hooks/use-preferred-color-scheme";
import { useThoughtTurnTiming } from "@/app/hooks/use-thought-turn-timing";
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
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";

const IN_PROGRESS_ASSISTANT_ID = "in-progress-assistant";

const PENDING_ASSISTANT_MESSAGE: UIMessage = {
  id: IN_PROGRESS_ASSISTANT_ID,
  role: "assistant",
  parts: [],
};

type KaviAskAiChatProps = {
  className?: string;
  variant?: "card" | "fullscreen";
  isOpen?: boolean;
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

function getStreamRevision(messages: UIMessage[]) {
  const lastMessage = messages.at(-1);

  if (!lastMessage) {
    return "0";
  }

  const streamContentKey =
    lastMessage.parts
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

  return `${messages.length}:${lastMessage.id}:${streamContentKey}`;
}

const NEAR_BOTTOM_THRESHOLD_PX = 96;

function isNearBottom(viewport: HTMLElement) {
  return (
    viewport.scrollHeight -
      viewport.scrollTop -
      viewport.clientHeight <=
    NEAR_BOTTOM_THRESHOLD_PX
  );
}

/** Pin scroll to bottom during streaming; coalesced to one scroll per frame. */
function ChatBottomPin({
  isBusy,
  streamRevision,
  viewportRef,
}: {
  isBusy: boolean;
  streamRevision: string;
  viewportRef: RefObject<HTMLElement | null>;
}) {
  const { scrollToEnd } = useMessageScroller();
  const stickToBottomRef = useRef(false);
  const wasBusyRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);

  const scheduleScrollToEnd = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        programmaticScrollRef.current = true;
        scrollToEnd({ behavior: "auto" });
        requestAnimationFrame(() => {
          programmaticScrollRef.current = false;
        });
      });
    });
  }, [scrollToEnd]);

  const cancelScheduledScroll = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    if (isBusy) {
      stickToBottomRef.current = true;
    }
  }, [isBusy]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: streamRevision encodes stream growth
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const shouldPin =
      stickToBottomRef.current || (isBusy && isNearBottom(viewport));

    if (!shouldPin) {
      return;
    }

    stickToBottomRef.current = true;
    scheduleScrollToEnd();

    return cancelScheduledScroll;
  }, [cancelScheduledScroll, isBusy, scheduleScrollToEnd, streamRevision, viewportRef]);

  useLayoutEffect(() => {
    if (wasBusyRef.current && !isBusy && stickToBottomRef.current) {
      scheduleScrollToEnd();
    }

    wasBusyRef.current = isBusy;
  }, [isBusy, scheduleScrollToEnd]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-bind when message list mounts viewport content
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const handleScroll = () => {
      if (programmaticScrollRef.current) {
        return;
      }

      stickToBottomRef.current = isNearBottom(viewport);
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [streamRevision, viewportRef]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-bind when message list mounts viewport content
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") {
      return;
    }

    const content = viewport.querySelector(
      '[data-slot="message-scroller-content"]',
    );
    if (!content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!stickToBottomRef.current) {
        return;
      }

      scheduleScrollToEnd();
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, [scheduleScrollToEnd, streamRevision, viewportRef]);

  return null;
}

export function KaviAskAiChat({
  className,
  variant = "card",
  isOpen = false,
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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const mergeViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;

      if (scrollContainerRef) {
        scrollContainerRef.current = node;
      }
    },
    [scrollContainerRef],
  );
  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);

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
  const displayMessages = useMemo(
    () =>
      showFallbackThinking
        ? [...messages, PENDING_ASSISTANT_MESSAGE]
        : messages,
    [messages, showFallbackThinking],
  );
  const latestRenderableAssistantId =
    displayMessages.findLast((message) => message.role === "assistant")?.id ??
    null;
  const streamRevision = useMemo(
    () => getStreamRevision(displayMessages),
    [displayMessages],
  );
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      footerRef.current
        ?.querySelector<HTMLInputElement>('[data-slot="input-group-control"]')
        ?.focus({ preventScroll: isFullscreen });
    });

    return () => cancelAnimationFrame(frame);
  }, [isFullscreen, isOpen]);

  const header = (
    <CardHeader className="shrink-0 gap-1 border-b bg-popover py-4 [.border-b]:pb-4">
      <CardTitle>Nikhil Agent</CardTitle>
      <CardDescription className="text-sm/tight">
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
              : "max-w-sm flex flex-col pt-0",
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
                  streamRevision={streamRevision}
                  viewportRef={viewportRef}
                />
                <MessageScrollerViewport
                  ref={mergeViewportRef}
                  className={isFullscreen ? "touch-auto" : undefined}
                >
                  <MessageScrollerContent
                    aria-busy={isBusy}
                    className="p-(--card-spacing)"
                  >
                    {displayMessages.map((message, index) => {
                      const isInProgressAssistantTurn =
                        message.role === "assistant" &&
                        index === displayMessages.length - 1 &&
                        thoughtTurn.isActive;
                      const scrollerMessageId = isInProgressAssistantTurn
                        ? IN_PROGRESS_ASSISTANT_ID
                        : message.id;

                      return (
                        <MessageAnimated
                          key={scrollerMessageId}
                          message={message}
                          scrollerMessageId={scrollerMessageId}
                          scrollAnchor={false}
                          layoutStable={index >= displayMessages.length - 2}
                          textSize={textSize}
                          turnTiming={
                            message.role === "assistant" &&
                            message.id === latestRenderableAssistantId &&
                            thoughtTurn.isActive
                              ? thoughtTurn
                              : undefined
                          }
                        />
                      );
                    })}
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
            ref={footerRef}
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
