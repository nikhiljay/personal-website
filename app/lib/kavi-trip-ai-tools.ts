import { tool } from "ai";
import { z } from "zod";

import type { Coordinates } from "./geo";
import {
  formatWalkingDistance,
  formatWalkingDuration,
  getWalkingDistance,
  getWalkingDistances,
} from "./google-distance";
import { getPlaceCardDataForSpot } from "./google-places";
import { savedSpots } from "./nikhil-saved-spots";
import { savedSpotKindMeta, type SavedSpotKind } from "./saved-spot-kinds";

export type PlaceRatingsToolOutput =
  | { found: false; error: string }
  | {
      found: true;
      name: string;
      address: string | null;
      rating: number | null;
      userRatingCount: number | null;
      googleMapsUri: string | null;
      photoUrl: string | null;
      kind: string | null;
      note: string | null;
      visited: boolean;
      spotId: string | null;
      openNow: boolean | null;
      todayHours: string | null;
      lat: number | null;
      lng: number | null;
      walkingDistanceLabel: string | null;
      walkingDurationLabel: string | null;
    };

export type NearbySpotsToolOutput =
  | { found: false; error: string }
  | {
      found: true;
      spots: Array<{
        spotId: string;
        name: string;
        address: string;
        kind: string;
        walkingDistanceLabel: string;
        walkingDurationLabel: string;
      }>;
    };

const savedSpotKindByLabel = Object.fromEntries(
  Object.entries(savedSpotKindMeta).map(([kind, meta]) => [
    meta.label.toLowerCase(),
    kind as SavedSpotKind,
  ]),
) as Record<string, SavedSpotKind>;

function resolveSavedSpotKind(kind?: string) {
  if (!kind) {
    return null;
  }

  const normalized = kind.trim().toLowerCase();
  return savedSpotKindByLabel[normalized] ?? null;
}

async function attachWalkingDistance(
  currentLocation: Coordinates | null | undefined,
  place: {
    lat: number | null;
    lng: number | null;
  },
) {
  if (
    !currentLocation ||
    place.lat == null ||
    place.lng == null
  ) {
    return {
      walkingDistanceLabel: null,
      walkingDurationLabel: null,
    };
  }

  try {
    const walking = await getWalkingDistance(currentLocation, {
      lat: place.lat,
      lng: place.lng,
    });

    if (!walking) {
      return {
        walkingDistanceLabel: null,
        walkingDurationLabel: null,
      };
    }

    return {
      walkingDistanceLabel: formatWalkingDistance(walking.distanceMeters),
      walkingDurationLabel: formatWalkingDuration(walking.durationSeconds),
    };
  } catch {
    return {
      walkingDistanceLabel: null,
      walkingDurationLabel: null,
    };
  }
}

export function createKaviTripAiTools(currentLocation?: Coordinates | null) {
  return {
    findNearbySpots: tool({
      description:
        "Find Nikhil's saved spots sorted by walking distance from the user's current location. Use for nearby, close, or walking-distance questions.",
      inputSchema: z.object({
        kind: z
          .string()
          .optional()
          .describe(
            "Optional filter: Café, Casual, Sit-Down, Nice, Bar, or Activity",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .describe("Max spots to return (default 5)"),
      }),
      execute: async ({ kind, limit = 5 }): Promise<NearbySpotsToolOutput> => {
        if (!currentLocation) {
          return {
            found: false,
            error:
              "Location unavailable — ask the user to allow location access on the trip page.",
          };
        }

        const kindFilter = resolveSavedSpotKind(kind);
        const candidates = kindFilter
          ? savedSpots.filter((spot) => spot.kind === kindFilter)
          : savedSpots;

        if (candidates.length === 0) {
          return {
            found: false,
            error: kind
              ? `No saved spots match kind "${kind}".`
              : "No saved spots available.",
          };
        }

        try {
          const walkingDistances = await getWalkingDistances(
            currentLocation,
            candidates.map((spot) => ({ lat: spot.lat, lng: spot.lng })),
          );

          const ranked = candidates
            .map((spot, index) => {
              const walking = walkingDistances[index];
              if (!walking) {
                return null;
              }

              return {
                spot,
                walking,
              };
            })
            .filter(
              (
                entry,
              ): entry is {
                spot: (typeof candidates)[number];
                walking: NonNullable<(typeof walkingDistances)[number]>;
              } => entry != null,
            )
            .sort((left, right) => left.walking.distanceMeters - right.walking.distanceMeters)
            .slice(0, limit);

          if (ranked.length === 0) {
            return {
              found: false,
              error: "Could not calculate walking distances right now.",
            };
          }

          return {
            found: true,
            spots: ranked.map(({ spot, walking }) => ({
              spotId: spot.id,
              name: spot.name,
              address: spot.address,
              kind: savedSpotKindMeta[spot.kind].label,
              walkingDistanceLabel: formatWalkingDistance(walking.distanceMeters),
              walkingDurationLabel: formatWalkingDuration(walking.durationSeconds),
            })),
          };
        } catch (error) {
          return {
            found: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not calculate walking distances.",
          };
        }
      },
    }),
    getPlaceRatings: tool({
      description:
        "Look up a place and return card data (photo, Google rating, review count, kind, walking distance). Call whenever you mention, recommend, or discuss a specific restaurant or spot so a rich place card can be shown.",
      inputSchema: z.object({
        name: z.string().describe("Place name, using exact names from trip data"),
        address: z
          .string()
          .optional()
          .describe("Street address to disambiguate similar names"),
        spotId: z
          .string()
          .optional()
          .describe("Saved spot id from trip data, when known"),
      }),
      execute: async ({
        name,
        address,
        spotId,
      }): Promise<PlaceRatingsToolOutput> => {
        const result = await getPlaceCardDataForSpot({ name, address, spotId });

        if ("error" in result) {
          return { found: false, error: result.error };
        }

        const walking = await attachWalkingDistance(currentLocation, result);

        return {
          found: true,
          name: result.name,
          address: result.address,
          rating: result.rating,
          userRatingCount: result.userRatingCount,
          googleMapsUri: result.googleMapsUri,
          photoUrl: result.photoUrl,
          kind: result.kind,
          note: result.note,
          visited: result.visited,
          spotId: result.spotId,
          openNow: result.openNow,
          todayHours: result.todayHours,
          lat: result.lat,
          lng: result.lng,
          ...walking,
        };
      },
    }),
  };
}

export type KaviTripAiTools = ReturnType<typeof createKaviTripAiTools>;
