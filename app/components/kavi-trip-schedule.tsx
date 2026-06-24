"use client";

import {
  getScheduleMarkerColor,
  getStopById,
  type TripEvent,
} from "../lib/ahla-nyc-trip";

import { MapMarkerDot } from "./map-marker-dot";

export function KaviTripSchedule({
  events,
  selectedStopId,
  onStopSelect,
}: {
  events: TripEvent[];
  selectedStopId: string | null;
  onStopSelect: (stopId: string | null) => void;
}) {
  return (
    <section className="mt-12">
      <h2 className="section-label">Schedule</h2>
      <ul className="mt-4 divide-y divide-[light-dark(#ececec,#2e2e2e)]">
        {events.map((event) => {
          const stop = event.stopId ? getStopById(event.stopId) : undefined;
          const isSelected = Boolean(stop && selectedStopId === stop.id);

          return (
            <li
              key={event.id}
              className="grid grid-cols-[5.75rem_minmax(0,1fr)] items-start gap-x-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="pt-0.5 text-[13px] leading-5 text-muted tabular-nums">
                <div>{event.date}</div>
                <div>{event.time}</div>
              </div>
              <div className="min-w-0 text-[15px] leading-[1.7]">
                <div className="text-fg">{event.title}</div>
                {stop ? (
                  <button
                    type="button"
                    onClick={() =>
                      onStopSelect(isSelected ? null : stop.id)
                    }
                    className={`mt-0.5 flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left text-[13px] leading-5 transition-colors ${
                      isSelected ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    <MapMarkerDot
                      color={getScheduleMarkerColor(stop.id)}
                      label={stop.name}
                    />
                    <span>{stop.name}</span>
                  </button>
                ) : null}
                {event.note ? (
                  <div className="mt-0.5 text-[13px] leading-5 text-muted">
                    {event.note}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
