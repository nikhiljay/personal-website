"use client";

import { useEffect, useState } from "react";

import type { Coordinates } from "../lib/geo";

type UseCurrentLocationOptions = {
  requireInteraction?: boolean;
};

export function useCurrentLocation(options: UseCurrentLocationOptions = {}) {
  const { requireInteraction = false } = options;
  const [enabled, setEnabled] = useState(!requireInteraction);
  const [location, setLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!requireInteraction) {
      return;
    }

    const enable = () => setEnabled(true);

    window.addEventListener("pointerdown", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });

    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
    };
  }, [requireInteraction]);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocation(null);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled]);

  return location;
}
