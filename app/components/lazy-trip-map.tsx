"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import "./trip-map.css";
import { TripMapPlaceholder } from "./trip-map-placeholder";

const TripMap = dynamic(
  () => import("./trip-map").then((mod) => mod.TripMap),
  {
    ssr: false,
  },
);

const CROSSFADE_MS = 500;
const MAP_MOUNT_FALLBACK_MS = 3_000;
const LCP_WAIT_MS = 2_500;

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

  const mountWhenIdle = () => {
    void import("./trip-map");

    if ("requestIdleCallback" in window) {
      requestIdleCallback(
        () => {
          requestAnimationFrame(() => {
            requestAnimationFrame(mount);
          });
        },
        { timeout: 1_000 },
      );
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(mount);
    });
  };

  let fontsDone = false;
  let lcpDone = false;

  const tryMount = () => {
    if (!fontsDone || !lcpDone) {
      return;
    }

    window.clearTimeout(fallback);
    window.clearTimeout(lcpFallback);
    mountWhenIdle();
  };

  const fallback = window.setTimeout(mount, MAP_MOUNT_FALLBACK_MS);
  const lcpFallback = window.setTimeout(() => {
    lcpDone = true;
    tryMount();
  }, LCP_WAIT_MS);

  if (typeof document !== "undefined" && "fonts" in document) {
    void document.fonts.ready
      .then(() => {
        fontsDone = true;
        tryMount();
      })
      .catch(() => {
        fontsDone = true;
        tryMount();
      });
  } else {
    fontsDone = true;
  }

  let observer: PerformanceObserver | undefined;

  if ("PerformanceObserver" in window) {
    try {
      observer = new PerformanceObserver((list) => {
        if (list.getEntries().length === 0) {
          return;
        }

        lcpDone = true;
        observer?.disconnect();
        tryMount();
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      lcpDone = true;
      tryMount();
    }
  } else {
    lcpDone = true;
    tryMount();
  }

  return () => {
    window.clearTimeout(fallback);
    window.clearTimeout(lcpFallback);
    observer?.disconnect();
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
