"use client";

import {
  groupScheduleEvents,
  type ScheduleEventOutput,
  type ScheduleToolOutput,
} from "@/app/lib/kavi-trip-schedule-tool";
import { getScheduleMarkerColor } from "@/app/lib/kavi-nyc-trip";
import { usePreferredColorScheme } from "@/app/hooks/use-preferred-color-scheme";
import { DeltaLogo } from "@/app/components/delta-logo";
import { ExternalLink } from "@/app/components/external-link";
import { MapMarkerDot } from "@/app/components/map-marker-dot";
import { cn } from "@/lib/utils";

function ScheduleEventNote({
  note,
  url,
}: {
  note: string;
  url?: string | null;
}) {
  const showLogo = note.startsWith("DL ");

  if (url) {
    return (
      <ExternalLink
        href={url}
        target="_blank"
        className="site-link-icon text-xs leading-5"
      >
        {showLogo ? <DeltaLogo /> : null}
        {note}
      </ExternalLink>
    );
  }

  if (showLogo) {
    return (
      <span className="inline-flex items-center gap-1 text-xs leading-5 text-muted-foreground">
        <DeltaLogo />
        {note}
      </span>
    );
  }

  return (
    <span className="text-xs leading-5 text-muted-foreground">{note}</span>
  );
}

function ScheduleEventRow({ event }: { event: ScheduleEventOutput }) {
  const theme = usePreferredColorScheme();
  const markerColor =
    event.stopId ? getScheduleMarkerColor(event.stopId, theme) : null;

  return (
    <li
      className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-start gap-x-3 py-2.5 first:pt-0 last:pb-0"
    >
      <time
        className="pt-0.5 text-xs leading-5 text-muted-foreground tabular-nums"
        dateTime={event.time}
      >
        {event.time}
      </time>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm font-medium leading-snug text-foreground">
          {event.title}
        </p>
        {event.stopName ? (
          <p className="flex min-w-0 items-center gap-1.5 text-xs leading-5 text-muted-foreground">
            {markerColor ? (
              <MapMarkerDot color={markerColor} label={event.stopName} />
            ) : null}
            <span className="min-w-0 truncate">{event.stopName}</span>
          </p>
        ) : null}
        {event.stopAddress && !event.note ? (
          <p className="truncate text-xs leading-5 text-muted-foreground">
            {event.stopAddress}
          </p>
        ) : null}
        {event.note ? (
          <div className="min-w-0 truncate text-xs leading-5">
            <ScheduleEventNote note={event.note} url={event.url} />
          </div>
        ) : null}
      </div>
    </li>
  );
}

function ScheduleToolCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background p-3",
        className,
      )}
    >
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3">
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="space-y-1.5">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3">
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

type ScheduleToolCardProps = {
  state: string;
  output?: ScheduleToolOutput;
  className?: string;
};

export function ScheduleToolCard({
  state,
  output,
  className,
}: ScheduleToolCardProps) {
  if (state === "output-available" && output?.found) {
    const dayGroups = groupScheduleEvents(output.events);

    return (
      <div
        data-slot="schedule-card"
        className={cn(
          "w-full min-w-0 self-stretch overflow-hidden rounded-xl border border-border bg-background",
          className,
        )}
      >
        {dayGroups.map((group, groupIndex) => (
          <div
            key={group.date}
            className={cn(
              "px-3",
              groupIndex === 0 ? "pt-3" : "pt-4",
              groupIndex === dayGroups.length - 1 ? "pb-3" : "pb-0",
            )}
          >
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground">
              {group.date}
            </h4>
            <ul className="mt-2 divide-y divide-border">
              {group.events.map((event) => (
                <ScheduleEventRow key={event.id} event={event} />
              ))}
            </ul>
          </div>
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
        Couldn&apos;t load schedule.
      </div>
    );
  }

  return <ScheduleToolCardSkeleton className={className} />;
}
