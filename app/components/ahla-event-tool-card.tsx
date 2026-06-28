"use client";

import { CalendarIcon, ClockIcon, RepeatIcon } from "lucide-react";

import type {
  AhlaEventCard,
  AhlaEventsToolOutput,
} from "@/app/lib/kavi-ahla-events-tool";
import { cn } from "@/lib/utils";

function PriorityBadge({
  priority,
}: {
  priority: AhlaEventCard["priority"];
}) {
  if (priority !== "must-attend") {
    return null;
  }

  return (
    <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
      Must-attend
    </span>
  );
}

function SessionBadge({ sessionId }: { sessionId?: string }) {
  if (!sessionId) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <CalendarIcon className="size-3.5 text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted"
      aria-label={`Session ${sessionId}`}
    >
      <div className="flex flex-col items-center gap-1 leading-none">
        <span className="text-[7px] font-normal uppercase tracking-[0.14em] text-muted-foreground">
          Sess
        </span>
        <span className="text-[13px] font-medium text-foreground">
          {sessionId}
        </span>
      </div>
    </div>
  );
}

function formatTimeRange(timeLabel: string) {
  return timeLabel.replace(/^(Sun|Mon|Tue|Wed)\s+/i, "").trim();
}

function AhlaEventCardContent({ event }: { event: AhlaEventCard }) {
  const timeRange = formatTimeRange(event.timeLabel);

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex gap-3 p-3">
        <SessionBadge sessionId={event.sessionId} />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 text-sm font-semibold leading-snug text-foreground">
                {event.title}
              </p>
              <PriorityBadge priority={event.priority} />
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="size-3 shrink-0" aria-hidden />
                {event.dayLabel}
              </span>
              {timeRange ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <ClockIcon className="size-3 shrink-0" aria-hidden />
                    {timeRange}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {event.speakers.length > 0 ? (
            <ul className="mt-0.5 space-y-1">
              {event.speakers.map((speaker) => (
                <li
                  key={speaker.name}
                  className="flex flex-wrap items-center gap-1.5 text-xs"
                >
                  <span className="font-medium text-foreground">
                    {speaker.name}
                  </span>
                  {speaker.firm ? (
                    <span className="text-muted-foreground">{speaker.firm}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {event.repeatNote ? (
            <p className="flex items-start gap-1 text-xs text-muted-foreground">
              <RepeatIcon className="mt-0.5 size-3 shrink-0" aria-hidden />
              <span>{event.repeatNote}</span>
            </p>
          ) : null}
        </div>
      </div>

      {event.tip ? (
        <div className="border-t border-border bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Play: </span>
          {event.tip}
        </div>
      ) : null}
    </article>
  );
}

function AhlaEventToolCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-background p-3">
        <div className="flex gap-3">
          <div className="size-9 animate-pulse rounded-md bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

type AhlaEventToolCardProps = {
  state: string;
  output?: AhlaEventsToolOutput;
  className?: string;
};

export function AhlaEventToolCard({
  state,
  output,
  className,
}: AhlaEventToolCardProps) {
  if (state === "output-available" && output?.found) {
    return (
      <div
        data-slot="ahla-event-cards"
        className={cn("flex w-full min-w-0 flex-col gap-2 self-stretch", className)}
      >
        {output.groupLabel ? (
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            {output.groupLabel}
          </p>
        ) : null}
        {output.events.map((event) => (
          <AhlaEventCardContent key={event.id} event={event} />
        ))}
      </div>
    );
  }

  if (state === "output-available" && output && !output.found) {
    return (
      <p
        className={cn(
          "w-full min-w-0 self-stretch text-sm leading-relaxed text-muted-foreground",
          className,
        )}
      >
        {output.error}
      </p>
    );
  }

  if (state === "output-error") {
    return (
      <div
        className={cn(
          "w-full min-w-0 self-stretch rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground",
          className,
        )}
      >
        Couldn&apos;t load AHLA events.
      </div>
    );
  }

  return <AhlaEventToolCardSkeleton className={className} />;
}
