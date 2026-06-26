"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { TripMapPlaceholder } from "./trip-map-placeholder";

const TripMap = dynamic(
  () => import("./trip-map").then((mod) => mod.TripMap),
  {
    ssr: false,
  },
);

const CROSSFADE_MS = 500;

type LazyTripMapProps = ComponentProps<typeof TripMap>;

export function LazyTripMap(props: LazyTripMapProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowPlaceholder(false);
    }, CROSSFADE_MS);

    return () => window.clearTimeout(timer);
  }, [mapReady]);

  return (
    <div
      ref={shellRef}
      className="trip-map-shell relative h-[min(480px,68vh)] overflow-hidden"
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity ease-in-out",
          mapReady ? "opacity-100" : "opacity-0",
        )}
        style={{
          transitionDuration: `${CROSSFADE_MS}ms`,
        }}
      >
        <TripMap
          {...props}
          embedded
          shellRef={shellRef}
          onReady={() => setMapReady(true)}
        />
      </div>

      {showPlaceholder ? (
        <div className="absolute inset-0 z-10">
          <TripMapPlaceholder bare />
        </div>
      ) : null}
    </div>
  );
}
