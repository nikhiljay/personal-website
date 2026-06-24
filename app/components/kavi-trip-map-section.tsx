"use client";

import { useState } from "react";

import type { TripEvent } from "../lib/ahla-nyc-trip";
import { savedSpots } from "../lib/nikhil-saved-spots";
import { savedSpotKindMeta } from "../lib/saved-spot-kinds";

import { KaviTripSchedule } from "./kavi-trip-schedule";
import { SavedSpotKindDot } from "./saved-spot-kind-dot";
import { TripMap } from "./trip-map";

export function KaviTripMapSection({
  tripEvents = [],
}: {
  tripEvents?: TripEvent[];
}) {
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  return (
    <>
      <div className="mb-10">
        <TripMap
          selectedSavedSpotId={selectedSpotId}
          onSavedSpotSelect={(spotId) => {
            setSelectedStopId(null);
            setSelectedSpotId(spotId);
          }}
          selectedStopId={selectedStopId}
          onStopSelect={(stopId) => {
            setSelectedSpotId(null);
            setSelectedStopId(stopId);
          }}
        />
      </div>

      <section>
        <h2 className="section-label">Nikhil&apos;s saved spots</h2>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] leading-5 text-muted">
          {(Object.keys(savedSpotKindMeta) as Array<keyof typeof savedSpotKindMeta>).map(
            (kind) => (
              <li key={kind} className="flex items-center gap-1.5">
                <SavedSpotKindDot kind={kind} />
                <span>{savedSpotKindMeta[kind].label}</span>
              </li>
            ),
          )}
        </ul>
        <ol className="mt-4 list-none space-y-2 text-[15px] leading-[1.7]">
          {savedSpots.map((spot, index) => {
            const isSelected = selectedSpotId === spot.id;

            return (
              <li key={spot.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStopId(null);
                    setSelectedSpotId(isSelected ? null : spot.id);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left transition-colors ${
                    isSelected ? "text-fg" : "text-body hover:text-fg"
                  }`}
                >
                  <SavedSpotKindDot kind={spot.kind} />
                  <span className="min-w-0">
                    <span className="text-muted">{index + 1}.</span>{" "}
                    <span className={isSelected ? "text-fg" : undefined}>
                      {spot.name}
                    </span>
                    <span className="text-muted"> — {spot.address}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {tripEvents.length > 0 ? (
        <KaviTripSchedule
          events={tripEvents}
          selectedStopId={selectedStopId}
          onStopSelect={(stopId) => {
            setSelectedSpotId(null);
            setSelectedStopId(stopId);
          }}
        />
      ) : null}
    </>
  );
}
