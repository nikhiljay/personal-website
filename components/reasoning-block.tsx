"use client";

import { ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { flattenReasoningText } from "@/app/lib/flatten-reasoning-text";
import { ReasoningBody } from "@/components/reasoning-steps";
import { cn } from "@/lib/utils";

import "./reasoning-block.css";

function ThoughtLabel({
  isStreaming,
  elapsedSeconds,
  className,
}: {
  isStreaming?: boolean;
  elapsedSeconds: number;
  className?: string;
}) {
  if (isStreaming) {
    return (
      <span
        className={cn(
          "reasoning-label-shimmer text-sm leading-none",
          className,
        )}
      >
        Thinking
      </span>
    );
  }

  return (
    <span className={cn("text-sm leading-none", className)}>
      <span className="text-muted-foreground">Thought</span>
      <span className="text-muted-foreground/45">
        {" "}
        for {Math.max(1, elapsedSeconds)}s
      </span>
    </span>
  );
}

export type ThoughtTurnTiming = {
  isActive: boolean;
  elapsedSeconds: number;
};

type ReasoningBlockProps = {
  text: string;
  state?: "streaming" | "done";
  className?: string;
  turnTiming?: ThoughtTurnTiming;
};

export function ReasoningBlock({
  text,
  state,
  className,
  turnTiming,
}: ReasoningBlockProps) {
  const usesTurnTiming = turnTiming != null;
  const isStreaming = usesTurnTiming
    ? turnTiming.isActive
    : state === "streaming";
  const [open, setOpen] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const [localElapsedSeconds, setLocalElapsedSeconds] = useState(1);
  const [frozenElapsedSeconds, setFrozenElapsedSeconds] = useState<
    number | null
  >(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const displayText = useMemo(() => flattenReasoningText(text), [text]);

  useEffect(() => {
    if (usesTurnTiming) {
      if (!turnTiming.isActive && turnTiming.elapsedSeconds > 0) {
        setFrozenElapsedSeconds(turnTiming.elapsedSeconds);
      }
      return;
    }

    if (isStreaming) {
      if (startedAtRef.current == null) {
        startedAtRef.current = Date.now();
      }
      return;
    }

    if (startedAtRef.current != null) {
      setLocalElapsedSeconds(
        Math.max(1, Math.ceil((Date.now() - startedAtRef.current) / 1000)),
      );
      startedAtRef.current = null;
    }
  }, [isStreaming, turnTiming, usesTurnTiming]);

  const elapsedSeconds =
    frozenElapsedSeconds ??
    (usesTurnTiming ? turnTiming.elapsedSeconds : localElapsedSeconds);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when streamed text grows
  useEffect(() => {
    if (!open || !isStreaming || !contentRef.current) {
      return;
    }

    const panel = contentRef.current;
    panel.scrollTop = panel.scrollHeight;
  }, [open, isStreaming, displayText.length]);

  if (!displayText && !isStreaming) {
    return null;
  }

  return (
    <div className={cn("w-full min-w-0 self-stretch", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-1 rounded-md py-0.5 text-left transition-colors"
      >
        <ThoughtLabel
          isStreaming={isStreaming}
          elapsedSeconds={elapsedSeconds}
        />
        <ChevronRightIcon
          className={cn(
            "size-3 shrink-0 text-muted-foreground/45 transition-transform duration-200 ease-out",
            open && "rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            ref={contentRef}
            className={cn(
              "reasoning-panel mt-1.5 max-h-52 overflow-y-auto overscroll-contain",
              open && "pb-0.5",
            )}
          >
            <ReasoningBody
              text={displayText}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Lightweight pending state before reasoning parts arrive. */
export function ThinkingIndicator({
  className,
  isActive = true,
}: {
  className?: string;
  isActive?: boolean;
}) {
  if (!isActive) {
    return null;
  }

  return (
    <div
      className={cn("flex w-full items-center gap-1 py-0.5", className)}
      role="status"
    >
      <ThoughtLabel isStreaming elapsedSeconds={1} />
      <ChevronRightIcon
        className="size-3 shrink-0 text-muted-foreground/45"
        aria-hidden
      />
    </div>
  );
}
