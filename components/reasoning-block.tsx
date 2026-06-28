"use client";

import { ChevronRightIcon } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import type { ThoughtTurnTiming } from "@/app/hooks/use-thought-turn-timing";
import { flattenReasoningText } from "@/app/lib/flatten-reasoning-text";
import { ReasoningBody } from "@/components/reasoning-steps";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { cn } from "@/lib/utils";

import "./reasoning-block.css";

const StreamingThoughtLabel = memo(function StreamingThoughtLabel() {
  return (
    <ShimmeringText
      text="Thinking"
      duration={1.6}
      repeat
      spread={2}
      className="text-sm leading-none"
    />
  );
});

function ThoughtHeader({
  isStreaming,
  elapsedSeconds,
}: {
  isStreaming?: boolean;
  elapsedSeconds: number;
}) {
  if (isStreaming) {
    return <StreamingThoughtLabel />;
  }

  return (
    <span className="text-sm leading-none">
      <span className="text-muted-foreground">Thought</span>
      <span className="text-muted-foreground/45">
        {" "}
        for {Math.max(1, elapsedSeconds)}s
      </span>
    </span>
  );
}

export type { ThoughtTurnTiming };

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
  const displayText = useMemo(() => flattenReasoningText(text), [text]);
  const isPendingTurnTiming =
    turnTiming?.isActive === true &&
    state !== "streaming" &&
    state !== "done" &&
    displayText.trim().length === 0;
  const isStreaming = state === "streaming" || isPendingTurnTiming;
  const [open, setOpen] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming) {
      if (startedAtRef.current == null) {
        startedAtRef.current = Date.now();
      }
      return;
    }

    if (startedAtRef.current != null) {
      setElapsedSeconds(
        Math.max(1, Math.ceil((Date.now() - startedAtRef.current) / 1000)),
      );
      startedAtRef.current = null;
    }
  }, [isStreaming]);

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

  const hasExpandableBody = displayText.trim().length > 0;

  return (
    <div
      data-slot="reasoning-block"
      className={cn(
        "flex w-full min-w-0 flex-col self-stretch pt-2.5 pb-3",
        "has-[+[data-slot=schedule-card]]:pb-4",
        className,
      )}
    >
      <button
        type="button"
        disabled={!hasExpandableBody}
        onClick={
          hasExpandableBody ? () => setOpen((current) => !current) : undefined
        }
        aria-expanded={hasExpandableBody ? open : undefined}
        className={cn(
          "flex w-full items-baseline gap-[0.25em] rounded-md text-left transition-colors",
          !hasExpandableBody && "cursor-default disabled:opacity-100",
        )}
      >
        <ThoughtHeader
          isStreaming={isStreaming}
          elapsedSeconds={elapsedSeconds}
        />
        <ChevronRightIcon
          className={cn(
            "relative top-[0.1em] size-3 shrink-0 text-muted-foreground/45 transition-transform duration-200 ease-out",
            open && hasExpandableBody && "rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      {hasExpandableBody ? (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            open ? "mt-1.5 grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div
              ref={contentRef}
              className={cn(
                "reasoning-panel max-h-52 overflow-y-auto overscroll-contain",
                open && "pb-0.5",
              )}
            >
              <ReasoningBody text={displayText} isStreaming={isStreaming} />
            </div>
          </div>
        </div>
      ) : null}
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
      data-slot="reasoning-block"
      className={cn("flex w-full items-center gap-[0.25em] pt-2.5 pb-3", className)}
      role="status"
    >
      <ThoughtHeader isStreaming elapsedSeconds={1} />
      <ChevronRightIcon
        className="size-3 shrink-0 text-muted-foreground/45"
        aria-hidden
      />
    </div>
  );
}
