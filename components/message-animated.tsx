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
import {
  AssistantMessageContent,
} from "@/components/message-markdown";
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

function getMessagePartsSignature(message: UIMessage) {
  return message.parts
    .map((part, index) => {
      if (part.type === "text") {
        return `t${index}:${part.text.length}:${part.state ?? ""}`;
      }

      if (part.type === "reasoning") {
        return `r${index}:${part.text.length}:${part.state ?? ""}`;
      }

      if (part.type.startsWith("tool-") && "state" in part) {
        return `tool${index}:${part.toolCallId}:${part.state}`;
      }

      return `${part.type}${index}`;
    })
    .join("|");
}

function areMessageAnimatedPropsEqual(
  prev: MessageAnimatedProps,
  next: MessageAnimatedProps,
) {
  if (
    prev.message === next.message &&
    prev.scrollerMessageId === next.scrollerMessageId &&
    prev.layoutStable === next.layoutStable &&
    prev.scrollAnchor === next.scrollAnchor &&
    prev.textSize === next.textSize &&
    prev.turnTiming === next.turnTiming &&
    prev.userVariant === next.userVariant &&
    prev.assistantVariant === next.assistantVariant
  ) {
    return true;
  }

  if (prev.message.id !== next.message.id) {
    return false;
  }

  if (
    prev.scrollerMessageId !== next.scrollerMessageId ||
    prev.layoutStable !== next.layoutStable ||
    prev.scrollAnchor !== next.scrollAnchor ||
    prev.textSize !== next.textSize ||
    prev.turnTiming !== next.turnTiming ||
    prev.userVariant !== next.userVariant ||
    prev.assistantVariant !== next.assistantVariant
  ) {
    return false;
  }

  return (
    getMessagePartsSignature(prev.message) ===
    getMessagePartsSignature(next.message)
  );
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

function hasPriorAssistantText(message: UIMessage, partIndex: number) {
  return message.parts
    .slice(0, partIndex)
    .some((priorPart) => priorPart.type === "text" && priorPart.text.trim());
}

function appendToolPullingLine(
  elements: ReactNode[],
  key: string,
  label: string,
  textSize: string,
  assistantVariant: React.ComponentProps<typeof Bubble>["variant"],
) {
  elements.push(
    <Bubble
      key={key}
      variant={assistantVariant}
      className="w-full min-w-0 self-stretch"
    >
      <BubbleContent className={cn(textSize, "overflow-visible text-muted-foreground")}>
        {label}
      </BubbleContent>
    </Bubble>,
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

      if (part.state === "output-available" && output && !output.found) {
        return;
      }

      if (!hasPriorAssistantText(message, index)) {
        appendToolPullingLine(
          renderedParts,
          `${message.id}-${part.toolCallId}-pulling`,
          "Pulling AHLA sessions…",
          textSize,
          assistantVariant,
        );
      }

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
      if (!hasPriorAssistantText(message, index)) {
        appendToolPullingLine(
          renderedParts,
          `${message.id}-${part.toolCallId}-pulling`,
          "Pulling restaurants…",
          textSize,
          assistantVariant,
        );
      }

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

      renderedParts.push(
        <div
          key={`${message.id}-${part.toolCallId}`}
          className="flex w-full min-w-0 flex-col gap-2 self-stretch"
        >
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

    const isStreamingText =
      part.state === "streaming" ||
      (turnTiming?.isActive === true &&
        part.state !== "done" &&
        index === message.parts.length - 1);

    renderedParts.push(
      <Bubble
        // Part order is stable; index is the safest key while text length grows.
        // biome-ignore lint/suspicious/noArrayIndexKey: text parts have no stable id
        key={`${message.id}-text-${index}`}
        variant={isUser ? userVariant : assistantVariant}
        className={!isUser ? "w-full min-w-0 self-stretch" : undefined}
      >
        <BubbleContent className={cn(textSize, !isUser && "overflow-visible")}>
          {isUser ? (
            <span className="whitespace-pre-wrap">{part.text}</span>
          ) : (
            <AssistantMessageContent
              text={part.text}
              isStreaming={isStreamingText}
            />
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
}, areMessageAnimatedPropsEqual);
