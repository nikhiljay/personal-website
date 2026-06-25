"use client";

import { useEffect, useMemo, useState } from "react";

import type { TripEvent } from "../lib/ahla-nyc-trip";
import { distanceInMiles, formatDistanceMiles, isInNyc } from "../lib/geo";
import { savedSpots } from "../lib/nikhil-saved-spots";
import {
  savedSpotKindMeta,
  type SavedSpotKind,
} from "../lib/saved-spot-kinds";

import { useCurrentLocation } from "../hooks/use-current-location";

import { KaviTripSchedule } from "./kavi-trip-schedule";
import { SavedSpotKindDot } from "./saved-spot-kind-dot";
import { TripMap } from "./trip-map";

const savedSpotKinds = Object.keys(savedSpotKindMeta) as SavedSpotKind[];

export function KaviTripMapSection({
  tripEvents = [],
}: {
  tripEvents?: TripEvent[];
}) {
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [activeKinds, setActiveKinds] = useState<SavedSpotKind[]>([]);
  const currentLocation = useCurrentLocation();

  const filteredSpots = useMemo(
    () =>
      activeKinds.length === 0
        ? savedSpots
        : savedSpots.filter((spot) => activeKinds.includes(spot.kind)),
    [activeKinds],
  );

  useEffect(() => {
    if (
      selectedSpotId &&
      !filteredSpots.some((spot) => spot.id === selectedSpotId)
    ) {
      setSelectedSpotId(null);
    }
  }, [filteredSpots, selectedSpotId]);

  const toggleKindFilter = (kind: SavedSpotKind) => {
    setActiveKinds((current) =>
      current.includes(kind)
        ? current.filter((entry) => entry !== kind)
        : [...current, kind],
    );
  };

  const isFiltering = activeKinds.length > 0;

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

      <section className="flex flex-col gap-3 px-6 md:px-0">
        <h2 className="section-label">Nikhil&apos;s saved spots</h2>
        <ul className="m-0 flex flex-wrap gap-x-4 gap-y-1 p-0 text-[12px] leading-5">
          {savedSpotKinds.map((kind) => {
            const isKindActive = activeKinds.includes(kind);

            return (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => toggleKindFilter(kind)}
                  aria-pressed={isKindActive}
                  className={`flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 transition-colors ${
                    isFiltering
                      ? isKindActive
                        ? "text-fg"
                        : "text-muted/40 hover:text-muted"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  <SavedSpotKindDot kind={kind} />
                  <span>{savedSpotKindMeta[kind].label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <ol className="m-0 list-none space-y-2 p-0 text-[15px] leading-5">
          {filteredSpots.map((spot) => {
            const isSelected = selectedSpotId === spot.id;
            const distanceLabel =
              currentLocation && isInNyc(currentLocation)
                ? formatDistanceMiles(
                    distanceInMiles(currentLocation, {
                      lat: spot.lat,
                      lng: spot.lng,
                    }),
                  )
                : null;

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
                  <SavedSpotKindDot kind={spot.kind} visited={spot.visited} />
                  <span className="min-w-0">
                    <span className={isSelected ? "text-fg" : undefined}>
                      {spot.name}
                    </span>
                    <span className="text-muted">
                      {" "}
                      — {spot.address}
                      {distanceLabel ? `, ${distanceLabel}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {tripEvents.length > 0 ? (
        <div className="px-6 md:px-0">
          <KaviTripSchedule
          events={tripEvents}
          selectedStopId={selectedStopId}
          onStopSelect={(stopId) => {
            setSelectedSpotId(null);
            setSelectedStopId(stopId);
          }}
          />
        </div>
      ) : null}
    </>
  );
}
