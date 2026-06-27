"use client";

import { useState } from "react";

import {
  getScheduleMarkerColor,
  getStopById,
  type TripEvent,
} from "../lib/kavi-nyc-trip";
import { usePreferredColorScheme } from "../hooks/use-preferred-color-scheme";

import { MapMarkerDot } from "./map-marker-dot";
import { ExpandableAside } from "./expandable-aside";
import { ExternalLink } from "./external-link";
import { DeltaLogo } from "./delta-logo";

const TITLE_ASIDES = [
  {
    pattern: /\b(archie)\b/i,
    explanation: "Tell her I say hi!",
  },
  {
    pattern: /\b(shobha)\b/i,
    explanation: "I'm so jealous, tell me how it is",
  },
  {
    pattern: /(moma reception)/i,
    explanation: "You're going to look so beautiful, please send me pics!",
  },
  {
    pattern: /\b(hoyt)\b/i,
    explanation: "Shoutout to our homie #1",
  },
  {
    pattern: /(solo adventure)/i,
    explanation:
      "Why wait for company? Enjoy the city by yourself - you're in the best city to explore!",
  },
] as const;

function EventTitle({ title }: { title: string }) {
  const [expanded, setExpanded] = useState(false);

  for (const aside of TITLE_ASIDES) {
    const match = title.match(aside.pattern);

    if (!match || match.index === undefined) {
      continue;
    }

    const before = title.slice(0, match.index);
    const name = match[1];
    const after = title.slice(match.index + name.length);

    return (
      <>
        <div className="text-fg">
          {before}
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="site-link inline cursor-pointer border-0 bg-transparent p-0 font-inherit"
          >
            {name}
          </button>
          {after}
        </div>
        <ExpandableAside open={expanded}>
          <div className="text-[13px] leading-5 text-muted">{aside.explanation}</div>
        </ExpandableAside>
      </>
    );
  }

  return <div className="text-fg">{title}</div>;
}

function EventNote({ note, url }: { note: string; url?: string }) {
  const showLogo = note.startsWith("DL ");

  if (url) {
    return (
      <ExternalLink
        href={url}
        target="_blank"
        className="site-link-icon text-[13px]"
      >
        {showLogo ? <DeltaLogo /> : null}
        {note}
      </ExternalLink>
    );
  }

  if (showLogo) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] leading-5 text-muted">
        <DeltaLogo />
        {note}
      </span>
    );
  }

  return <span className="text-muted">{note}</span>;
}

function groupEventsByDate(events: TripEvent[]) {
  const groups: { date: string; events: TripEvent[] }[] = [];

  for (const event of events) {
    const current = groups[groups.length - 1];

    if (current?.date === event.date) {
      current.events.push(event);
    } else {
      groups.push({ date: event.date, events: [event] });
    }
  }

  return groups;
}

export function KaviTripSchedule({
  events,
  selectedStopId,
  onStopSelect,
}: {
  events: TripEvent[];
  selectedStopId: string | null;
  onStopSelect: (stopId: string | null) => void;
}) {
  const theme = usePreferredColorScheme();
  const dayGroups = groupEventsByDate(events);

  return (
    <section className="mt-12">
      <div>
        {dayGroups.map((group) => (
          <div key={group.date} className="mt-8 first:mt-0">
            <h3 className="section-label">{group.date}</h3>
            <ul className="mt-3 divide-y divide-[light-dark(#ececec,#2e2e2e)]">
              {group.events.map((event) => {
                const stop = event.stopId ? getStopById(event.stopId) : undefined;
                const isSelected = Boolean(stop && selectedStopId === stop.id);

                return (
                  <li
                    key={event.id}
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-x-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="pt-0.5 text-[13px] leading-5 text-muted tabular-nums">
                      {event.time}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0 text-[15px] leading-[1.7]">
                      <EventTitle title={event.title} />
                      {stop ? (
                        <button
                          type="button"
                          onClick={() =>
                            onStopSelect(isSelected ? null : stop.id)
                          }
                          className={`flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left text-[13px] leading-5 transition-colors ${
                            isSelected ? "text-fg" : "text-muted hover:text-fg"
                          }`}
                        >
                          <MapMarkerDot
                            color={getScheduleMarkerColor(stop.id, theme)}
                            label={stop.name}
                          />
                          <span>{stop.name}</span>
                        </button>
                      ) : null}
                      {event.note ? (
                        <div className="text-[13px] leading-5">
                          <EventNote note={event.note} url={event.url} />
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
