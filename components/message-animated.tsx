"use client";

import type { UIMessage } from "ai";

import { PlaceRatingCard } from "@/app/components/place-rating-card";
import type { PlaceRatingsToolOutput } from "@/app/lib/kavi-trip-ai-tools";
import { sanitizeAssistantText } from "@/app/lib/sanitize-assistant-text";
import { MessageMarkdown } from "@/components/message-markdown";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageScrollerItem } from "@/components/ui/message-scroller";

type MessageAnimatedProps = {
  message: UIMessage;
  scrollAnchor?: boolean;
  textSize?: string;
  userVariant?: React.ComponentProps<typeof Bubble>["variant"];
  assistantVariant?: React.ComponentProps<typeof Bubble>["variant"];
};

export function MessageAnimated({
  message,
  scrollAnchor,
  textSize = "text-sm/relaxed",
  userVariant = "muted",
  assistantVariant = "ghost",
}: MessageAnimatedProps) {
  const isUser = message.role === "user";

  return (
    <MessageScrollerItem
      messageId={message.id}
      scrollAnchor={scrollAnchor ?? isUser}
    >
      <Message align={isUser ? "end" : "start"} className={textSize}>
        <MessageContent className={isUser ? undefined : "[&>*]:w-full [&>*]:min-w-0"}>
          {message.parts.map((part, index) => {
            if (part.type === "tool-getPlaceRatings") {
              const input = part.input as
                | { name?: string; address?: string; spotId?: string }
                | undefined;
              const output = part.output as PlaceRatingsToolOutput | undefined;

              return (
                <PlaceRatingCard
                  key={`${message.id}-${part.toolCallId}`}
                  state={part.state}
                  input={input}
                  output={output}
                  textSize={textSize}
                  className="w-full min-w-0 self-stretch"
                />
              );
            }

            if (part.type !== "text") {
              return null;
            }

            if (!part.text.trim()) {
              return null;
            }

            return (
              <Bubble
                key={`${message.id}-${index}`}
                variant={isUser ? userVariant : assistantVariant}
              >
                <BubbleContent className={textSize}>
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{part.text}</span>
                  ) : (
                    <MessageMarkdown>
                      {sanitizeAssistantText(part.text)}
                    </MessageMarkdown>
                  )}
                </BubbleContent>
              </Bubble>
            );
          })}
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  );
}
