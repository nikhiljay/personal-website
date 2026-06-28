import { tool } from "ai";
import { z } from "zod";

import type { Coordinates } from "./geo";
import {
  formatWalkingDistance,
  formatWalkingDuration,
  getWalkingDistance,
  getWalkingDistances,
} from "./google-distance";
import {
  getPlaceCardDataForSpot,
  isKnownSavedSpot,
  rankPlacesByWalkingDistance,
  searchNearbyGooglePlaces,
  type PlaceCardData,
} from "./google-places";
import { resolveTripReferencePoint } from "./kavi-nyc-trip";
import type { TripEvent } from "./kavi-nyc-trip";
import { savedSpots } from "./nikhil-saved-spots";
import { savedSpotKindMeta, type SavedSpotKind } from "./saved-spot-kinds";
import {
  buildCurrentLocationToolOutput,
  nycCoordinatesFromContext,
  type CurrentLocationToolOutput,
  type UserLocationContext,
} from "./user-location";

import {
  buildScheduleToolOutput,
  type ScheduleToolOutput,
} from "./kavi-trip-schedule-tool";

export type { CurrentLocationToolOutput } from "./user-location";
export type { ScheduleToolOutput } from "./kavi-trip-schedule-tool";

export const NEARBY_MAX_WALK_SECONDS = 15 * 60;

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
      fromSavedList?: boolean;
      priceLabel?: string | null;
      cuisine?: string | null;
      mustOrder?: string[] | null;
      bestFor?: string[] | null;
      reservation?: string | null;
    };

export type NearbySpotsToolOutput =
  | { found: false; error: string }
  | {
      found: true;
      intro: string;
      source: "saved" | "google" | "mixed";
      referenceName: string | null;
      places: Array<PlaceRatingsToolOutput & { found: true }>;
    };

const savedSpotKindByLabel = Object.fromEntries(
  Object.entries(savedSpotKindMeta).map(([kind, meta]) => [
    meta.label.toLowerCase(),
    kind as SavedSpotKind,
  ]),
) as Record<string, SavedSpotKind>;

const restaurantKinds: SavedSpotKind[] = ["cafe", "casual", "nice", "bar"];

type SavedSpotFilter =
  | { mode: "all" }
  | { mode: "kinds"; kinds: SavedSpotKind[] }
  | { mode: "tags"; tags: string[] };

function resolveSavedSpotFilter(kind?: string): SavedSpotFilter {
  if (!kind) {
    return { mode: "all" };
  }

  const normalized = kind.trim().toLowerCase();
  if (
    normalized === "brunch" ||
    normalized === "breakfast" ||
    normalized === "morning meal"
  ) {
    return { mode: "tags", tags: ["brunch", "breakfast"] };
  }

  if (
    normalized === "restaurant" ||
    normalized === "restaurants" ||
    normalized === "food" ||
    normalized === "dining" ||
    normalized === "eat"
  ) {
    return { mode: "kinds", kinds: restaurantKinds };
  }

  const single = savedSpotKindByLabel[normalized];
  if (single) {
    return { mode: "kinds", kinds: [single] };
  }

  return { mode: "all" };
}

function resolveSavedSpotKinds(kind?: string): SavedSpotKind[] | null {
  const filter = resolveSavedSpotFilter(kind);
  return filter.mode === "kinds" ? filter.kinds : null;
}

function filterSavedSpotsByKind(kind?: string) {
  const filter = resolveSavedSpotFilter(kind);

  if (filter.mode === "all") {
    return savedSpots;
  }

  if (filter.mode === "tags") {
    return savedSpots.filter((spot) =>
      spot.tags?.some((tag) => filter.tags.includes(tag)),
    );
  }

  return savedSpots.filter((spot) => filter.kinds.includes(spot.kind));
}

function googleTypesForKind(kind?: string): string[] {
  const filter = resolveSavedSpotFilter(kind);
  if (filter.mode === "tags") {
    return ["cafe", "restaurant"];
  }

  const kinds = resolveSavedSpotKinds(kind);
  if (!kinds) {
    return ["restaurant"];
  }

  const types = new Set<string>();
  for (const entry of kinds) {
    if (entry === "cafe") {
      types.add("cafe");
    } else if (entry === "bar") {
      types.add("bar");
    } else {
      types.add("restaurant");
    }
  }

  return [...types];
}

function spotTypeLabel(kind?: string) {
  if (!kind) {
    return "spots";
  }

  const normalized = kind.trim().toLowerCase();
  if (normalized === "brunch" || normalized === "breakfast") {
    return "brunch spots";
  }

  const kinds = resolveSavedSpotKinds(kind);
  if (!kinds) {
    return "spots";
  }

  if (kinds.length > 1) {
    return "restaurants";
  }

  const label = savedSpotKindMeta[kinds[0]].label.toLowerCase();
  if (label === "sit-down") {
    return "sit-down restaurants";
  }

  if (label === "café") {
    return "cafés";
  }

  if (label === "activity") {
    return "activities";
  }

  return `${label}s`;
}

function formatNearbyReference(referenceName: string | null) {
  if (!referenceName) {
    return "here";
  }

  if (referenceName === "your location") {
    return "you";
  }

  return referenceName;
}

function buildNearbyIntro(input: {
  source: "saved" | "google" | "mixed";
  referenceName: string | null;
  kind?: string;
  autoFallback?: boolean;
  savedCount?: number;
}) {
  const reference = formatNearbyReference(input.referenceName);
  const typeLabel = spotTypeLabel(input.kind);

  if (input.source === "mixed") {
    const savedCount = input.savedCount ?? 0;
    const savedLabel =
      savedCount === 1 ? "one from Nikhil's list" : `${savedCount} from Nikhil's list`;
    return `Here are ${typeLabel} near ${reference} — ${savedLabel}, plus a few other picks:`;
  }

  if (input.source === "saved") {
    return `Here are ${typeLabel} from Nikhil's saved spots near ${reference}:`;
  }

  if (input.autoFallback) {
    return `None of Nikhil's saved spots are within a 15-min walk of ${reference} — here are nearby ${typeLabel} from Google:`;
  }

  return `Here are ${typeLabel} near ${reference} that aren't on Nikhil's saved list:`;
}

function resolveOrigin(
  near: string | undefined,
  currentLocation: Coordinates | null | undefined,
): Coordinates | null {
  if (near) {
    const reference = resolveTripReferencePoint(near);
    if (reference) {
      return { lat: reference.lat, lng: reference.lng };
    }
  }

  return currentLocation ?? null;
}

function resolveReferenceName(
  near: string | undefined,
  currentLocation: Coordinates | null | undefined,
): string | null {
  if (near) {
    return resolveTripReferencePoint(near)?.name ?? near;
  }

  return currentLocation ? "your location" : null;
}

function resolveNearbySearchContext(
  near: string | undefined,
  useUserLocation: boolean | undefined,
  currentLocation: Coordinates | null | undefined,
): { origin: Coordinates | null; referenceName: string | null } {
  if (useUserLocation) {
    return {
      origin: currentLocation ?? null,
      referenceName: currentLocation ? "your location" : null,
    };
  }

  return {
    origin: resolveOrigin(near, currentLocation),
    referenceName: resolveReferenceName(near, currentLocation),
  };
}

async function attachWalkingDistance(
  origin: Coordinates | null | undefined,
  place: {
    lat: number | null;
    lng: number | null;
  },
) {
  if (!origin || place.lat == null || place.lng == null) {
    return {
      walkingDistanceLabel: null,
      walkingDurationLabel: null,
    };
  }

  try {
    const walking = await getWalkingDistance(origin, {
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

function placeCardToOutput(
  place: PlaceCardData,
  walking: {
    walkingDistanceLabel: string;
    walkingDurationLabel: string;
  },
  fromSavedList: boolean,
): PlaceRatingsToolOutput & { found: true } {
  return {
    found: true,
    name: place.name,
    address: place.address,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    googleMapsUri: place.googleMapsUri,
    photoUrl: place.photoUrl,
    kind: place.kind,
    note: place.note,
    visited: place.visited,
    spotId: place.spotId,
    openNow: place.openNow,
    todayHours: place.todayHours,
    lat: place.lat,
    lng: place.lng,
    walkingDistanceLabel: walking.walkingDistanceLabel,
    walkingDurationLabel: walking.walkingDurationLabel,
    fromSavedList,
    priceLabel: place.priceLabel,
    cuisine: place.cuisine,
    mustOrder: place.mustOrder,
    bestFor: place.bestFor,
    reservation: place.reservation,
  };
}

async function buildSavedSpotCards(
  origin: Coordinates,
  kind: string | undefined,
  limit: number,
): Promise<Array<PlaceRatingsToolOutput & { found: true }>> {
  const candidates = filterSavedSpotsByKind(kind);

  if (candidates.length === 0) {
    return [];
  }

  const walkingDistances = await getWalkingDistances(
    origin,
    candidates.map((spot) => ({ lat: spot.lat, lng: spot.lng })),
  );

  const ranked = candidates
    .map((spot, index) => {
      const walking = walkingDistances[index];
      if (
        !walking ||
        walking.durationSeconds > NEARBY_MAX_WALK_SECONDS
      ) {
        return null;
      }

      return { spot, walking };
    })
    .filter(
      (
        entry,
      ): entry is {
        spot: (typeof candidates)[number];
        walking: NonNullable<(typeof walkingDistances)[number]>;
      } => entry != null,
    )
    .sort(
      (left, right) =>
        left.walking.distanceMeters - right.walking.distanceMeters,
    )
    .slice(0, limit);

  if (ranked.length === 0) {
    return [];
  }

  const places = await Promise.all(
    ranked.map(async ({ spot, walking }) => {
      const card = await getPlaceCardDataForSpot({
        spotId: spot.id,
        name: spot.name,
        address: spot.address,
      });

      if ("error" in card) {
        return placeCardToOutput(
          {
            name: spot.name,
            address: spot.address,
            rating: null,
            userRatingCount: null,
            googleMapsUri: null,
            photoUrl: spot.photo ?? null,
            kind: savedSpotKindMeta[spot.kind].label,
            note: spot.note ?? null,
            visited: spot.visited ?? false,
            spotId: spot.id,
            openNow: null,
            todayHours: null,
            lat: spot.lat,
            lng: spot.lng,
            priceLabel: null,
            cuisine: spot.cuisine ?? null,
            mustOrder: spot.mustOrder ?? null,
            bestFor: spot.bestFor ?? null,
            reservation: spot.reservation ?? null,
          },
          {
            walkingDistanceLabel: formatWalkingDistance(
              walking.distanceMeters,
            ),
            walkingDurationLabel: formatWalkingDuration(
              walking.durationSeconds,
            ),
          },
          true,
        );
      }

      return placeCardToOutput(
        card,
        {
          walkingDistanceLabel: formatWalkingDistance(walking.distanceMeters),
          walkingDurationLabel: formatWalkingDuration(walking.durationSeconds),
        },
        true,
      );
    }),
  );

  return places;
}

async function buildGoogleSpotCards(
  origin: Coordinates,
  kind: string | undefined,
  limit: number,
  fetchExtra = false,
  excludeSpotIds: string[] = [],
): Promise<Array<PlaceRatingsToolOutput & { found: true }>> {
  const googlePlaces = await searchNearbyGooglePlaces({
    origin,
    includedTypes: googleTypesForKind(kind),
    maxResultCount: fetchExtra ? 20 : 15,
  });

  const excludedIds = new Set(excludeSpotIds);
  const candidates = googlePlaces.filter(
    (place) => !isKnownSavedSpot(place) && !excludedIds.has(place.spotId ?? ""),
  );

  const ranked = await rankPlacesByWalkingDistance(
    origin,
    candidates,
    NEARBY_MAX_WALK_SECONDS,
    limit,
  );

  return ranked.map(({ place, walkingDistanceLabel, walkingDurationLabel }) =>
    placeCardToOutput(
      place,
      { walkingDistanceLabel, walkingDurationLabel },
      false,
    ),
  );
}

async function buildAutoNearbyPlaces(
  origin: Coordinates,
  kind: string | undefined,
  limit: number,
): Promise<{
  places: Array<PlaceRatingsToolOutput & { found: true }>;
  source: "saved" | "google" | "mixed";
  savedCount: number;
}> {
  const savedPlaces = await buildSavedSpotCards(origin, kind, limit);
  const hasKindFilter = Boolean(kind?.trim());

  if (!hasKindFilter) {
    if (savedPlaces.length > 0) {
      return { places: savedPlaces, source: "saved", savedCount: savedPlaces.length };
    }

    const googlePlaces = await buildGoogleSpotCards(origin, kind, limit);
    return { places: googlePlaces, source: "google", savedCount: 0 };
  }

  const remaining = limit - savedPlaces.length;
  if (remaining <= 0) {
    return { places: savedPlaces, source: "saved", savedCount: savedPlaces.length };
  }

  const googlePlaces = await buildGoogleSpotCards(
    origin,
    kind,
    remaining,
    true,
    savedPlaces
      .map((place) => place.spotId)
      .filter((spotId): spotId is string => spotId != null),
  );

  const combined = [...savedPlaces, ...googlePlaces].slice(0, limit);
  const source =
    savedPlaces.length > 0 && googlePlaces.length > 0
      ? "mixed"
      : savedPlaces.length > 0
        ? "saved"
        : "google";

  return { places: combined, source, savedCount: savedPlaces.length };
}

function savedListEmptyMessage(
  referenceName: string | null,
  kind?: string,
) {
  const reference = referenceName ?? "here";
  const typeLabel = spotTypeLabel(kind);
  const kindHint = kind
    ? ` ${typeLabel}`
    : "";

  return `None of Nikhil's${kindHint} saved spots are within a 15-min walk of ${reference}. Try a different kind, drop the filter, or ask for Google options.`;
}

export function createKaviTripAiTools(
  locationContext: UserLocationContext,
  tripEvents: TripEvent[],
) {
  const currentLocation = nycCoordinatesFromContext(locationContext);

  return {
    getCurrentLocation: tool({
      description:
        "Check the user's current location. Call this before 'near me' questions or whenever proximity to the user matters. Returns whether location is available and in NYC.",
      inputSchema: z.object({}),
      execute: async (): Promise<CurrentLocationToolOutput> =>
        await buildCurrentLocationToolOutput(locationContext),
    }),
    getTripSchedule: tool({
      description:
        "Get Kavi's NYC trip schedule as rich event cards. For weekdays: weekday + weekdayQualifier. 'Next Sunday' on Saturday = following Sunday (Jul 5), not tomorrow — use weekdayQualifier=next, never relativeDay=tomorrow. Omit filters for the full schedule.",
      inputSchema: z.object({
        relativeDay: z
          .enum(["today", "tomorrow", "yesterday"])
          .optional()
          .describe(
            "Only for today, tomorrow, or yesterday. Do not use for 'next Sunday' — use weekday + weekdayQualifier=next instead.",
          ),
        weekday: z
          .enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ])
          .optional()
          .describe(
            "Weekday name for 'next sun', 'this Monday', etc. Takes precedence over relativeDay.",
          ),
        weekdayQualifier: z
          .enum(["this", "next"])
          .optional()
          .describe(
            "this = upcoming occurrence (Sat → this Sunday = tomorrow). next = skip the upcoming one (Sat → next Sunday = following Sunday).",
          ),
        date: z
          .string()
          .optional()
          .describe(
            "Exact day: Sun, Jul 5, 2026-07-05, or next sunday. When set with a calendar date, do not pass conflicting weekday params.",
          ),
      }),
      execute: async ({
        date,
        relativeDay,
        weekday,
        weekdayQualifier,
      }): Promise<ScheduleToolOutput> =>
        buildScheduleToolOutput(tripEvents, {
          date,
          relativeDay,
          weekday,
          weekdayQualifier,
        }),
    }),
    findNearbySpots: tool({
      description:
        "Find nearby restaurants/spots within a 15-minute walk, returning rich place cards. For 'near me' / 'around here' questions, set useUserLocation=true and do not pass near. Set source explicitly: saved = Nikhil's list only, google = outside his list, auto = saved first then Google fallback.",
      inputSchema: z.object({
        useUserLocation: z
          .boolean()
          .optional()
          .describe(
            "Required for 'near me', 'around here', 'close to me' questions. Uses the user's GPS location — do not pass near when this is true.",
          ),
        near: z
          .string()
          .optional()
          .describe(
            "Named trip landmark only when the user names a specific place (e.g. 'near MoMA'). Never use for 'near me' — set useUserLocation instead.",
          ),
        kind: z
          .string()
          .optional()
          .describe(
            "Filter by type — pass whenever the user asks for a specific kind: brunch, breakfast, restaurant, Café, Casual, Sit-Down, Nice, Bar, or Activity",
          ),
        source: z
          .enum(["saved", "google", "auto"])
          .optional()
          .describe(
            "saved = Nikhil's saved list only (use when user asks for his spots). google = outside his list only. auto = saved first, Google fallback (default for general nearby questions).",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe("Max spots to return (default 5)"),
      }),
      execute: async ({
        near,
        useUserLocation,
        kind,
        source = "auto",
        limit = 5,
      }): Promise<NearbySpotsToolOutput> => {
        const { origin, referenceName } = resolveNearbySearchContext(
          near,
          useUserLocation,
          currentLocation,
        );

        if (!origin) {
          if (useUserLocation || !near) {
            return {
              found: false,
              error:
                "Location unavailable — ask the user to allow location access on the trip page.",
            };
          }

          return {
            found: false,
            error: `Could not find "${near}" in trip data. Use an exact trip stop, highlight, neighborhood, or saved spot name.`,
          };
        }

        try {
          if (source === "google") {
            const googlePlaces = await buildGoogleSpotCards(
              origin,
              kind,
              limit,
              true,
            );

            if (googlePlaces.length === 0) {
              return {
                found: false,
                error:
                  "No places outside Nikhil's saved list within a 15-minute walk — try a different area or spot type.",
              };
            }

            return {
              found: true,
              source: "google",
              intro: buildNearbyIntro({
                source: "google",
                referenceName,
                kind,
              }),
              referenceName,
              places: googlePlaces,
            };
          }

          if (source === "saved") {
            const savedPlaces = await buildSavedSpotCards(origin, kind, limit);

            if (savedPlaces.length === 0) {
              return {
                found: false,
                error: savedListEmptyMessage(referenceName, kind),
              };
            }

            return {
              found: true,
              source: "saved",
              intro: buildNearbyIntro({
                source: "saved",
                referenceName,
                kind,
              }),
              referenceName,
              places: savedPlaces,
            };
          }

          const { places, source: resultSource, savedCount } =
            await buildAutoNearbyPlaces(origin, kind, limit);

          if (places.length === 0) {
            return {
              found: false,
              error:
                "No places within a 15-minute walk found nearby — try a different area or spot type.",
            };
          }

          return {
            found: true,
            source: resultSource,
            intro: buildNearbyIntro({
              source: resultSource,
              referenceName,
              kind,
              autoFallback: resultSource === "google",
              savedCount,
            }),
            referenceName,
            places,
          };
        } catch (error) {
          return {
            found: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not search for nearby spots.",
          };
        }
      },
    }),
    getPlaceRatings: tool({
      description:
        "Look up a single place and return a rich place card (photo, Google rating, review count, kind, walking distance). Use for one-off mentions — for nearby lists, use findNearbySpots instead.",
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
        near: z
          .string()
          .optional()
          .describe(
            "Reference place for walking distance (same as findNearbySpots). Pass when answering proximity questions about a landmark.",
          ),
      }),
      execute: async ({
        name,
        address,
        spotId,
        near,
      }): Promise<PlaceRatingsToolOutput> => {
        const result = await getPlaceCardDataForSpot({ name, address, spotId });

        if ("error" in result) {
          return { found: false, error: result.error };
        }

        const walking = await attachWalkingDistance(
          resolveOrigin(near, currentLocation),
          result,
        );

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
          fromSavedList: result.spotId != null,
          priceLabel: result.priceLabel,
          cuisine: result.cuisine,
          mustOrder: result.mustOrder,
          bestFor: result.bestFor,
          reservation: result.reservation,
          ...walking,
        };
      },
    }),
  };
}

export type KaviTripAiTools = ReturnType<typeof createKaviTripAiTools>;
