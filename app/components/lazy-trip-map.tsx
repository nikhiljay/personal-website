"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { TripMapPlaceholder } from "./trip-map-placeholder";

const TripMap = dynamic(
  () =>
    import(/* webpackPrefetch: true */ "./trip-map").then((mod) => mod.TripMap),
  {
    ssr: false,
  },
);

const CROSSFADE_MS = 500;
const MAP_MOUNT_FALLBACK_MS = 800;

type LazyTripMapProps = ComponentProps<typeof TripMap>;

function scheduleMapMount(onMount: () => void) {
  let mounted = false;

  const mount = () => {
    if (mounted) {
      return;
    }

    mounted = true;
    onMount();
  };

  let observer: PerformanceObserver | undefined;

  if ("PerformanceObserver" in window) {
    try {
      observer = new PerformanceObserver(() => {
        observer?.disconnect();
        mount();
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // LCP type unsupported — fall through to timeout.
    }
  }

  const fallback = window.setTimeout(mount, MAP_MOUNT_FALLBACK_MS);

  return () => {
    observer?.disconnect();
    window.clearTimeout(fallback);
  };
}

export function LazyTripMap(props: LazyTripMapProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => scheduleMapMount(() => setShouldMount(true)), []);

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
      {shouldMount ? (
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
      ) : null}

      {showPlaceholder ? (
        <div className="absolute inset-0 z-10">
          <TripMapPlaceholder bare />
        </div>
      ) : null}
    </div>
  );
}
