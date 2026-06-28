"use client";

import { useEffect, useState } from "react";

import { SIMULATED_NYC_LOCATION, type Coordinates } from "../lib/geo";

type UseCurrentLocationOptions = {
  requireInteraction?: boolean;
};

type CurrentLocationState = {
  location: Coordinates | null;
  isSimulated: boolean;
  enabled: boolean;
  permissionDenied: boolean;
  isSupported: boolean;
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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const isSupported =
    typeof navigator !== "undefined" && Boolean(navigator.geolocation);

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

    if (!enabled || !isSupported) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPermissionDenied(false);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setLocation(null);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
        }
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
  }, [enabled, simulatedLocation, isSupported]);

  return {
    location,
    isSimulated: Boolean(simulatedLocation),
    enabled,
    permissionDenied,
    isSupported,
  };
}
