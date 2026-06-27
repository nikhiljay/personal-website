"use client";

import type { UIMessage } from "ai";

import { MessageMarkdown } from "@/components/message-markdown";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageScrollerItem } from "@/components/ui/message-scroller";

type MessageAnimatedProps = {
  message: UIMessage;
  scrollAnchor?: boolean;
  userVariant?: React.ComponentProps<typeof Bubble>["variant"];
  assistantVariant?: React.ComponentProps<typeof Bubble>["variant"];
};

export function MessageAnimated({
  message,
  scrollAnchor,
  userVariant = "muted",
  assistantVariant = "ghost",
}: MessageAnimatedProps) {
  const isUser = message.role === "user";

  return (
    <MessageScrollerItem
      messageId={message.id}
      scrollAnchor={scrollAnchor ?? isUser}
    >
      <Message align={isUser ? "end" : "start"}>
        <MessageContent>
          {message.parts.map((part, index) => {
            if (part.type !== "text") {
              return null;
            }

            return (
              <Bubble
                key={`${message.id}-${index}`}
                variant={isUser ? userVariant : assistantVariant}
              >
                <BubbleContent>
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{part.text}</span>
                  ) : (
                    <MessageMarkdown>{part.text}</MessageMarkdown>
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
