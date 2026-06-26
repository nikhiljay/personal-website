"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";

import { TripMapPlaceholder } from "./trip-map-placeholder";

const TripMap = dynamic(
  () => import("./trip-map").then((mod) => mod.TripMap),
  {
    ssr: false,
    loading: () => <TripMapPlaceholder />,
  },
);

type LazyTripMapProps = ComponentProps<typeof TripMap>;

export function LazyTripMap(props: LazyTripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
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
    <div ref={containerRef}>
      {shouldLoad ? <TripMap {...props} /> : <TripMapPlaceholder />}
    </div>
  );
}
