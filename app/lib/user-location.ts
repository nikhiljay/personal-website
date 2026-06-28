import { isInNyc, type Coordinates } from "./geo";
import { reverseGeocodeAddress } from "./google-geocode";

export type UserLocationMode = "unavailable" | "outside_nyc" | "in_nyc";

export type UserLocationContext =
  | { mode: "unavailable" }
  | ({ mode: "outside_nyc" | "in_nyc" } & Coordinates);

export type CurrentLocationToolOutput = {
  mode: UserLocationMode;
  lat: number | null;
  lng: number | null;
  address: string | null;
  label: string;
  message: string;
};

const LOCATION_STATUS_LABELS: Record<UserLocationMode, string> = {
  unavailable: "Location unavailable",
  outside_nyc: "Outside NYC",
  in_nyc: "In NYC",
};

export function locationStatusLabel(mode: UserLocationMode) {
  return LOCATION_STATUS_LABELS[mode];
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

export async function buildCurrentLocationToolOutput(
  context: UserLocationContext,
): Promise<CurrentLocationToolOutput> {
  if (context.mode === "unavailable") {
    return {
      mode: "unavailable",
      lat: null,
      lng: null,
      address: null,
      label: locationStatusLabel("unavailable"),
      message:
        "Location permission not granted or unavailable. Ask the user to allow location access on the trip page.",
    };
  }

  const address = await reverseGeocodeAddress(context);
  const label = address ?? locationStatusLabel(context.mode);

  if (context.mode === "outside_nyc") {
    return {
      mode: "outside_nyc",
      lat: context.lat,
      lng: context.lng,
      address,
      label,
      message: address
        ? `Location access is enabled. The user is at ${address}, outside NYC. Do NOT ask them to enable location access — they already have. Walking-distance and near-me spot recommendations only work in NYC. If they ask whether you have their location, say yes and mention they're at ${address}, outside NYC.`
        : "Location access is enabled. The user is outside NYC. Do NOT ask them to enable location access — they already have. Walking-distance and near-me spot recommendations only work in NYC. If they ask whether you have their location, say yes and that they're outside NYC.",
    };
  }

  return {
    mode: "in_nyc",
    lat: context.lat,
    lng: context.lng,
    address,
    label,
    message: address
      ? `Location access is enabled. The user is at ${address} in NYC. Use their location for near-me and walking-distance queries. If they ask whether you have their location, say yes and mention they're at ${address}.`
      : "Location access is enabled. The user is in NYC. Use their location for near-me and walking-distance queries.",
  };
}
