"use client";

import type { UIMessage } from "ai";
import { memo, type ReactNode } from "react";

import { PlaceRatingCard } from "@/app/components/place-rating-card";
import { LocationToolCard } from "@/app/components/location-tool-card";
import { ScheduleToolCard } from "@/app/components/schedule-tool-card";
import { AhlaEventToolCard } from "@/app/components/ahla-event-tool-card";
import type {
  AhlaEventsToolOutput,
  CurrentLocationToolOutput,
  NearbySpotsToolOutput,
  PlaceRatingsToolOutput,
  ScheduleToolOutput,
} from "@/app/lib/kavi-trip-ai-tools";
import { sanitizeAssistantText } from "@/app/lib/sanitize-assistant-text";
import { MessageMarkdown } from "@/components/message-markdown";
import {
  ReasoningBlock,
  type ThoughtTurnTiming,
} from "@/components/reasoning-block";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageScrollerItem } from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";

type MessageAnimatedProps = {
  message: UIMessage;
  scrollAnchor?: boolean;
  layoutStable?: boolean;
  scrollerMessageId?: string;
  textSize?: string;
  userVariant?: React.ComponentProps<typeof Bubble>["variant"];
  assistantVariant?: React.ComponentProps<typeof Bubble>["variant"];
  turnTiming?: ThoughtTurnTiming;
};

function getReasoningBlockKey(ownerId: string, flushIndex: number) {
  return flushIndex === 0
    ? `${ownerId}-reasoning`
    : `${ownerId}-reasoning-${flushIndex}`;
}

function flushReasoningBlock(
  elements: ReactNode[],
  text: string,
  state: "streaming" | "done" | undefined,
  key: string,
  turnTiming?: ThoughtTurnTiming,
  useTurnTiming = false,
) {
  elements.push(
    <ReasoningBlock
      key={key}
      text={text}
      state={state}
      turnTiming={useTurnTiming ? turnTiming : undefined}
      className="w-full min-w-0 self-stretch"
    />,
  );
}

export const MessageAnimated = memo(function MessageAnimated({
  message,
  scrollAnchor,
  layoutStable = false,
  scrollerMessageId,
  textSize = "text-sm/relaxed",
  userVariant = "muted",
  assistantVariant = "ghost",
  turnTiming,
}: MessageAnimatedProps) {
  const isUser = message.role === "user";
  const reasoningOwnerId = scrollerMessageId ?? message.id;

  const renderedParts: ReactNode[] = [];
  let reasoningText = "";
  let reasoningState: "streaming" | "done" | undefined;
  let reasoningFlushIndex = 0;

  const flushReasoning = () => {
    const hasContent =
      reasoningText.trim().length > 0 || reasoningState === "streaming";

    if (!hasContent) {
      return;
    }

    flushReasoningBlock(
      renderedParts,
      reasoningText,
      reasoningState,
      getReasoningBlockKey(reasoningOwnerId, reasoningFlushIndex),
      turnTiming,
      reasoningState === "streaming",
    );
    reasoningFlushIndex += 1;
    reasoningText = "";
    reasoningState = undefined;
  };

  message.parts.forEach((part, index) => {
    if (part.type === "reasoning") {
      reasoningText += part.text;
      if (part.state === "streaming") {
        reasoningState = "streaming";
      } else if (reasoningState !== "streaming") {
        reasoningState = part.state ?? "done";
      }
      return;
    }

    flushReasoning();

    if (part.type === "tool-getCurrentLocation") {
      const output = part.output as CurrentLocationToolOutput | undefined;

      renderedParts.push(
        <LocationToolCard
          key={`${message.id}-${part.toolCallId}`}
          state={part.state}
          output={output}
          textSize={textSize}
        />,
      );
      return;
    }

    if (part.type === "tool-getTripSchedule") {
      const output = part.output as ScheduleToolOutput | undefined;

      renderedParts.push(
        <ScheduleToolCard
          key={`${message.id}-${part.toolCallId}`}
          state={part.state}
          output={output}
          className="w-full min-w-0 self-stretch"
        />,
      );
      return;
    }

    if (part.type === "tool-getAhlaEvents") {
      const output = part.output as AhlaEventsToolOutput | undefined;

      renderedParts.push(
        <AhlaEventToolCard
          key={`${message.id}-${part.toolCallId}`}
          state={part.state}
          output={output}
          className="w-full min-w-0 self-stretch"
        />,
      );
      return;
    }

    if (part.type === "tool-findNearbySpots") {
      if (part.state !== "output-available") {
        renderedParts.push(
          <PlaceRatingCard
            key={`${message.id}-${part.toolCallId}`}
            state={part.state}
            textSize={textSize}
            className="w-full min-w-0 self-stretch"
          />,
        );
        return;
      }

      const output = part.output as NearbySpotsToolOutput | undefined;

      if (!output?.found || output.places.length === 0) {
        return;
      }

      const hasPriorText = message.parts
        .slice(0, index)
        .some(
          (priorPart) => priorPart.type === "text" && priorPart.text.trim(),
        );

      renderedParts.push(
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
        </div>,
      );
      return;
    }

    if (part.type === "tool-getPlaceRatings") {
      const input = part.input as
        | { name?: string; address?: string; spotId?: string }
        | undefined;
      const output = part.output as PlaceRatingsToolOutput | undefined;

      renderedParts.push(
        <PlaceRatingCard
          key={`${message.id}-${part.toolCallId}`}
          state={part.state}
          input={input}
          output={output}
          textSize={textSize}
          className="w-full min-w-0 self-stretch"
        />,
      );
      return;
    }

    if (part.type !== "text") {
      return;
    }

    if (!part.text.trim()) {
      return;
    }

    renderedParts.push(
      <Bubble
        key={`${message.id}-text-${part.text.slice(0, 24)}`}
        variant={isUser ? userVariant : assistantVariant}
        className={!isUser ? "w-full min-w-0 self-stretch" : undefined}
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
      </Bubble>,
    );
  });

  flushReasoning();

  if (
    turnTiming?.isActive &&
    reasoningFlushIndex === 0 &&
    !message.parts.some((part) => part.type === "reasoning")
  ) {
    flushReasoningBlock(
      renderedParts,
      "",
      undefined,
      getReasoningBlockKey(reasoningOwnerId, 0),
      turnTiming,
      true,
    );
  }

  return (
    <MessageScrollerItem
      messageId={reasoningOwnerId}
      scrollAnchor={scrollAnchor ?? false}
      layoutStable={layoutStable}
    >
      <Message align={isUser ? "end" : "start"} className={textSize}>
        <MessageContent
          className={
            isUser
              ? undefined
              : "[&>*]:w-full [&>*]:min-w-0 gap-1.5 [&>[data-slot=reasoning-block]+*]:-mt-1.5"
          }
        >
          {renderedParts}
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  );
});
