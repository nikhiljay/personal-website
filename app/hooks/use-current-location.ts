"use client";

import { useEffect, useState } from "react";

import { SIMULATED_NYC_LOCATION, type Coordinates } from "../lib/geo";

type UseCurrentLocationOptions = {
  requireInteraction?: boolean;
};

type CurrentLocationState = {
  location: Coordinates | null;
  isSimulated: boolean;
};

function readSimulatedLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);

  if (params.has("simulateLocation")) {
    return SIMULATED_NYC_LOCATION;
  }

  return null;
}

export function useCurrentLocation(
  options: UseCurrentLocationOptions = {},
): CurrentLocationState {
  const { requireInteraction = false } = options;
  const [simulatedLocation, setSimulatedLocation] =
    useState<Coordinates | null>(null);
  const [enabled, setEnabled] = useState(!requireInteraction);
  const [location, setLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    const simulated = readSimulatedLocation();
    if (simulated) {
      setSimulatedLocation(simulated);
      setLocation(simulated);
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (simulatedLocation || !requireInteraction) {
      return;
    }

    const enable = () => setEnabled(true);

    window.addEventListener("pointerdown", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });

    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
    };
  }, [requireInteraction, simulatedLocation]);

  useEffect(() => {
    if (simulatedLocation) {
      return;
    }

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
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15_000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, simulatedLocation]);

  return {
    location,
    isSimulated: Boolean(simulatedLocation),
  };
}
