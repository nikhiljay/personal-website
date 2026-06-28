"use client";

import type { UIMessage } from "ai";

import { PlaceRatingCard } from "@/app/components/place-rating-card";
import { LocationToolCard } from "@/app/components/location-tool-card";
import { ScheduleToolCard } from "@/app/components/schedule-tool-card";
import type {
  CurrentLocationToolOutput,
  NearbySpotsToolOutput,
  PlaceRatingsToolOutput,
  ScheduleToolOutput,
} from "@/app/lib/kavi-trip-ai-tools";
import { sanitizeAssistantText } from "@/app/lib/sanitize-assistant-text";
import { MessageMarkdown } from "@/components/message-markdown";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageScrollerItem } from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";

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
            if (part.type === "tool-getCurrentLocation") {
              const output = part.output as
                | CurrentLocationToolOutput
                | undefined;

              return (
                <LocationToolCard
                  key={`${message.id}-${part.toolCallId}`}
                  state={part.state}
                  output={output}
                  textSize={textSize}
                />
              );
            }

            if (part.type === "tool-getTripSchedule") {
              const output = part.output as ScheduleToolOutput | undefined;

              return (
                <ScheduleToolCard
                  key={`${message.id}-${part.toolCallId}`}
                  state={part.state}
                  output={output}
                  className="w-full min-w-0 self-stretch"
                />
              );
            }

            if (part.type === "tool-findNearbySpots") {
              if (part.state !== "output-available") {
                return (
                  <PlaceRatingCard
                    key={`${message.id}-${part.toolCallId}`}
                    state={part.state}
                    textSize={textSize}
                    className="w-full min-w-0 self-stretch"
                  />
                );
              }

              const output = part.output as NearbySpotsToolOutput | undefined;

              if (!output?.found || output.places.length === 0) {
                return null;
              }

              const hasPriorText = message.parts
                .slice(0, index)
                .some(
                  (priorPart) =>
                    priorPart.type === "text" && priorPart.text.trim(),
                );

              return (
                <div
                  key={`${message.id}-${part.toolCallId}`}
                  className="flex w-full min-w-0 flex-col gap-2 self-stretch"
                >
                  {!hasPriorText && output.intro ? (
                    <Bubble variant={assistantVariant}>
                      <BubbleContent className={cn(textSize, "overflow-visible")}>
                        <MessageMarkdown>
                          {sanitizeAssistantText(output.intro)}
                        </MessageMarkdown>
                      </BubbleContent>
                    </Bubble>
                  ) : null}
                  {output.places.map((place) => (
                    <PlaceRatingCard
                      key={`${part.toolCallId}-${place.spotId ?? place.name}`}
                      state="output-available"
                      output={place}
                      textSize={textSize}
                      className="w-full min-w-0 self-stretch"
                    />
                  ))}
                </div>
              );
            }

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
                <BubbleContent className={cn(textSize, !isUser && "overflow-visible")}>
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
