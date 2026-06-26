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

type LazyTripMapProps = ComponentProps<typeof TripMap>;

export function LazyTripMap(props: LazyTripMapProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowPlaceholder(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [mapReady]);

  useEffect(() => {
    const node = shellRef.current;
    if (!node) {
      return;
    }

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const startLoading = () => setShouldLoad(true);

    const scheduleLoad = () => {
      if ("requestIdleCallback" in window) {
        idleId = requestIdleCallback(startLoading, { timeout: 1500 });
        return;
      }

      timeoutId = setTimeout(startLoading, 1);
    };

    const cleanupScheduledLoad = () => {
      if (idleId !== undefined) {
        cancelIdleCallback(idleId);
      }

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };

    if (!("IntersectionObserver" in window)) {
      scheduleLoad();
      return cleanupScheduledLoad;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        observer.disconnect();
        scheduleLoad();
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cleanupScheduledLoad();
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="trip-map-shell relative h-[min(480px,68vh)] overflow-hidden"
    >
      {shouldLoad ? (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-out",
            mapReady ? "opacity-100" : "opacity-0",
          )}
        >
          <TripMap
            {...props}
            embedded
            shellRef={shellRef}
            onReady={() => setMapReady(true)}
          />
        </div>
      ) : null}

      {showPlaceholder ? (
        <div className="absolute inset-0 z-10">
          <TripMapPlaceholder exiting={mapReady} bare />
        </div>
      ) : null}
    </div>
  );
}
