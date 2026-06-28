"use client";

import { useRef, useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { TripMap } from "./trip-map";
import "./trip-map.css";
import { TripMapPlaceholder } from "./trip-map-placeholder";

type LazyTripMapProps = ComponentProps<typeof TripMap>;

export function LazyTripMap(props: LazyTripMapProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  return (
    <div
      ref={shellRef}
      className="trip-map-shell relative h-[min(480px,68vh)] overflow-hidden"
    >
      <div className={cn("absolute inset-0", mapReady ? "opacity-100" : "opacity-0")}>
        <TripMap
          {...props}
          embedded
          shellRef={shellRef}
          onReady={() => setMapReady(true)}
        />
      </div>

      {!mapReady ? (
        <div className="absolute inset-0 z-10">
          <TripMapPlaceholder bare />
        </div>
      ) : null}
    </div>
  );
}
