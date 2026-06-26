"use client";

import dynamic from "next/dynamic";

import type { TripEvent } from "../lib/kavi-nyc-trip";

const KaviTripMapSection = dynamic(
  () =>
    import("./kavi-trip-map-section").then((mod) => mod.KaviTripMapSection),
  { ssr: false },
);

export function KaviTripMapSectionLoader({
  tripEvents,
}: {
  tripEvents: TripEvent[];
}) {
  return <KaviTripMapSection tripEvents={tripEvents} />;
}
