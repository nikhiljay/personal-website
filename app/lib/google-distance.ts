import type { Coordinates } from "./geo";

export type WalkingDistance = {
  distanceMeters: number;
  durationSeconds: number;
};

type RouteMatrixElement = {
  originIndex?: number;
  destinationIndex?: number;
  distanceMeters?: number;
  duration?: string;
  status?: { code?: number; message?: string };
};

function parseDurationSeconds(duration: string) {
  return Number.parseFloat(duration.replace(/s$/, ""));
}

function getGoogleMapsApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;
}

export async function getWalkingDistances(
  origin: Coordinates,
  destinations: Coordinates[],
): Promise<(WalkingDistance | null)[]> {
  if (destinations.length === 0) {
    return [];
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured.");
  }

  const response = await fetch(
    "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "originIndex,destinationIndex,distanceMeters,duration,status",
      },
      body: JSON.stringify({
        origins: [
          {
            waypoint: {
              location: {
                latLng: { latitude: origin.lat, longitude: origin.lng },
              },
            },
          },
        ],
        destinations: destinations.map((destination) => ({
          waypoint: {
            location: {
              latLng: {
                latitude: destination.lat,
                longitude: destination.lng,
              },
            },
          },
        })),
        travelMode: "WALK",
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Google Routes lookup failed (${response.status}). ${detail.slice(0, 200)}`,
    );
  }

  const elements = (await response.json()) as RouteMatrixElement[];
  const results: (WalkingDistance | null)[] = Array.from({
    length: destinations.length,
  }).fill(null) as (WalkingDistance | null)[];

  for (const element of elements) {
    if (
      element.destinationIndex == null ||
      element.distanceMeters == null ||
      !element.duration ||
      element.status?.code
    ) {
      continue;
    }

    results[element.destinationIndex] = {
      distanceMeters: element.distanceMeters,
      durationSeconds: parseDurationSeconds(element.duration),
    };
  }

  return results;
}

export async function getWalkingDistance(
  origin: Coordinates,
  destination: Coordinates,
): Promise<WalkingDistance | null> {
  const [result] = await getWalkingDistances(origin, [destination]);
  return result;
}

export function formatWalkingDistance(meters: number) {
  const miles = meters / 1609.344;

  if (miles < 0.1) {
    return "< 0.1 mi walk";
  }

  if (miles < 10) {
    return `${miles.toFixed(1)} mi walk`;
  }

  return `${Math.round(miles)} mi walk`;
}

export function formatWalkingDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);

  if (minutes < 1) {
    return "< 1 min walk";
  }

  if (minutes < 60) {
    return `${minutes} min walk`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return `${hours} hr walk`;
  }

  return `${hours} hr ${remainder} min walk`;
}
