import { isInNyc, type Coordinates } from "./geo";

export type UserLocationMode = "unavailable" | "outside_nyc" | "in_nyc";

export type UserLocationContext =
  | { mode: "unavailable" }
  | ({ mode: "outside_nyc" | "in_nyc" } & Coordinates);

export type CurrentLocationToolOutput = {
  mode: UserLocationMode;
  lat: number | null;
  lng: number | null;
  label: string;
  message: string;
};

export function formatLocationLabel({ lat, lng }: Coordinates) {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function nycCoordinatesFromContext(
  context: UserLocationContext,
): Coordinates | null {
  return context.mode === "in_nyc"
    ? { lat: context.lat, lng: context.lng }
    : null;
}

export function buildLocationContext(input: {
  location: Coordinates | null;
  isSimulated: boolean;
  enabled: boolean;
  permissionDenied: boolean;
  isSupported: boolean;
}): UserLocationContext {
  if (input.isSimulated && input.location) {
    return {
      mode: "in_nyc",
      lat: input.location.lat,
      lng: input.location.lng,
    };
  }

  if (!input.isSupported || input.permissionDenied || !input.enabled) {
    return { mode: "unavailable" };
  }

  if (!input.location) {
    return { mode: "unavailable" };
  }

  if (isInNyc(input.location)) {
    return {
      mode: "in_nyc",
      lat: input.location.lat,
      lng: input.location.lng,
    };
  }

  return {
    mode: "outside_nyc",
    lat: input.location.lat,
    lng: input.location.lng,
  };
}

export function parseLocationContext(value: unknown): UserLocationContext {
  if (!value || typeof value !== "object" || !("mode" in value)) {
    return { mode: "unavailable" };
  }

  const mode = value.mode;
  if (mode === "unavailable") {
    return { mode: "unavailable" };
  }

  if (
    (mode !== "outside_nyc" && mode !== "in_nyc") ||
    !("lat" in value) ||
    !("lng" in value) ||
    typeof value.lat !== "number" ||
    typeof value.lng !== "number"
  ) {
    return { mode: "unavailable" };
  }

  const coordinates = { lat: value.lat, lng: value.lng };

  if (mode === "in_nyc" && !isInNyc(coordinates)) {
    return { mode: "outside_nyc", ...coordinates };
  }

  if (mode === "outside_nyc" && isInNyc(coordinates)) {
    return { mode: "in_nyc", ...coordinates };
  }

  return { mode, ...coordinates };
}

export function buildCurrentLocationToolOutput(
  context: UserLocationContext,
): CurrentLocationToolOutput {
  if (context.mode === "unavailable") {
    return {
      mode: "unavailable",
      lat: null,
      lng: null,
      label: "Location unavailable",
      message:
        "Location permission not granted or unavailable. Ask the user to allow location access on the trip page.",
    };
  }

  const label = formatLocationLabel(context);

  if (context.mode === "outside_nyc") {
    return {
      mode: "outside_nyc",
      lat: context.lat,
      lng: context.lng,
      label,
      message: `User is outside NYC (${label}). Walking-distance queries from their location are not available.`,
    };
  }

  return {
    mode: "in_nyc",
    lat: context.lat,
    lng: context.lng,
    label,
    message: `User is in NYC (${label}). Use for near-me and walking-distance queries.`,
  };
}
