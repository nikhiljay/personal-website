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
  NEARBY_QUERY_SEARCH_RADIUS_METERS,
  NEARBY_SEARCH_RADIUS_METERS,
  rankPlacesByWalkingDistance,
  searchNearbyGooglePlaces,
  searchTextGooglePlaces,
  type PlaceCardData,
} from "./google-places";
import { resolveTripReferencePoint } from "./kavi-nyc-trip";
import type { TripEvent } from "./kavi-nyc-trip";
import { savedSpots, type SavedSpot } from "./nikhil-saved-spots";
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
import {
  buildAhlaEventsToolOutput,
  type AhlaEventsToolOutput,
} from "./kavi-ahla-events-tool";

export type { CurrentLocationToolOutput } from "./user-location";
export type { ScheduleToolOutput } from "./kavi-trip-schedule-tool";
export type { AhlaEventsToolOutput } from "./kavi-ahla-events-tool";

export const NEARBY_MAX_WALK_SECONDS = 15 * 60;
/** Neighborhood centroids aren't precise — allow a bit more reach for area searches */
export const NEARBY_NEIGHBORHOOD_WALK_SECONDS = 20 * 60;

type NearbySearchOptions = {
  maxWalkSeconds: number;
  searchRadiusMeters: number;
  googleTextQuery?: string;
};

function formatWalkLimitLabel(maxWalkSeconds: number) {
  return `${Math.round(maxWalkSeconds / 60)}-minute walk`;
}

function buildGoogleTextQuery(query: string, referenceName: string | null) {
  const trimmed = query.trim();
  if (!trimmed) {
    return undefined;
  }

  if (referenceName && referenceName !== "your location") {
    return `${trimmed} ${referenceName}`;
  }

  return trimmed;
}

function resolveNearbySearchOptions(
  near: string | undefined,
  query: string | undefined,
  referenceName: string | null,
): NearbySearchOptions {
  const reference = near ? resolveTripReferencePoint(near) : null;
  const isNeighborhood = reference?.kind === "neighborhood";
  const maxWalkSeconds = isNeighborhood
    ? NEARBY_NEIGHBORHOOD_WALK_SECONDS
    : NEARBY_MAX_WALK_SECONDS;
  const trimmedQuery = query?.trim() ?? "";
  const hasQuery = trimmedQuery.length > 0;
  const searchRadiusMeters = hasQuery
    ? NEARBY_QUERY_SEARCH_RADIUS_METERS
    : NEARBY_SEARCH_RADIUS_METERS;

  return {
    maxWalkSeconds,
    searchRadiusMeters,
    googleTextQuery: hasQuery
      ? buildGoogleTextQuery(trimmedQuery, referenceName)
      : undefined,
  };
}

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

function savedSpotSearchText(spot: SavedSpot) {
  return [
    spot.name,
    spot.cuisine,
    spot.note,
    ...(spot.tags ?? []),
    ...(spot.mustOrder ?? []),
    ...(spot.bestFor ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function savedSpotMatchesQuery(spot: SavedSpot, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = savedSpotSearchText(spot);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

function filterSavedSpots(kind?: string, query?: string) {
  const byKind = filterSavedSpotsByKind(kind);
  if (!query?.trim()) {
    return byKind;
  }

  return byKind.filter((spot) => savedSpotMatchesQuery(spot, query));
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

function spotTypeLabel(kind?: string, query?: string) {
  if (query?.trim()) {
    return `${query.trim()} spots`;
  }

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
  query?: string;
  autoFallback?: boolean;
  savedCount?: number;
}) {
  const reference = formatNearbyReference(input.referenceName);
  const typeLabel = spotTypeLabel(input.kind, input.query);

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
    return `None of Nikhil's saved spots are within walking distance of ${reference} — here are nearby ${typeLabel} from Google:`;
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
  query?: string,
): {
  origin: Coordinates | null;
  referenceName: string | null;
  search: NearbySearchOptions;
} {
  if (useUserLocation) {
    const referenceName = currentLocation ? "your location" : null;
    return {
      origin: currentLocation ?? null,
      referenceName,
      search: resolveNearbySearchOptions(near, query, referenceName),
    };
  }

  const referenceName = resolveReferenceName(near, currentLocation);
  return {
    origin: resolveOrigin(near, currentLocation),
    referenceName,
    search: resolveNearbySearchOptions(near, query, referenceName),
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
  query?: string,
  maxWalkSeconds = NEARBY_MAX_WALK_SECONDS,
): Promise<Array<PlaceRatingsToolOutput & { found: true }>> {
  const candidates = filterSavedSpots(kind, query);

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
        walking.durationSeconds > maxWalkSeconds
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
  search: NearbySearchOptions = {
    maxWalkSeconds: NEARBY_MAX_WALK_SECONDS,
    searchRadiusMeters: NEARBY_SEARCH_RADIUS_METERS,
  },
): Promise<Array<PlaceRatingsToolOutput & { found: true }>> {
  const googlePlaces = search.googleTextQuery
    ? await searchTextGooglePlaces({
        origin,
        textQuery: search.googleTextQuery,
        maxResultCount: 20,
        radiusMeters: search.searchRadiusMeters,
      })
    : await searchNearbyGooglePlaces({
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
    search.maxWalkSeconds,
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
  query?: string,
  search: NearbySearchOptions = {
    maxWalkSeconds: NEARBY_MAX_WALK_SECONDS,
    searchRadiusMeters: NEARBY_SEARCH_RADIUS_METERS,
  },
): Promise<{
  places: Array<PlaceRatingsToolOutput & { found: true }>;
  source: "saved" | "google" | "mixed";
  savedCount: number;
}> {
  const savedPlaces = await buildSavedSpotCards(
    origin,
    kind,
    limit,
    query,
    search.maxWalkSeconds,
  );
  const hasFilter = Boolean(kind?.trim() || query?.trim());

  if (!hasFilter) {
    if (savedPlaces.length > 0) {
      return { places: savedPlaces, source: "saved", savedCount: savedPlaces.length };
    }

    const googlePlaces = await buildGoogleSpotCards(
      origin,
      kind,
      limit,
      false,
      [],
      search,
    );
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
    search,
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
  query?: string,
  maxWalkSeconds = NEARBY_MAX_WALK_SECONDS,
) {
  const reference = referenceName ?? "here";
  const typeLabel = spotTypeLabel(kind, query);
  const walkLabel = formatWalkLimitLabel(maxWalkSeconds);
  const filterHint = query?.trim()
    ? ` matching "${query.trim()}"`
    : kind
      ? ` ${typeLabel}`
      : "";

  return `None of Nikhil's${filterHint} saved spots are within a ${walkLabel} of ${reference}. Try a different search, drop the filter, or ask for Google options.`;
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
        "Find nearby restaurants/spots within walking distance, returning rich place cards. GPS/specific-place searches use a 15-minute walk; neighborhood searches (Tribeca, SoHo, etc.) use 20 minutes from the area center. For 'near me' questions, set useUserLocation=true. Pass query for food/dish/cuisine (matcha, ramen, Thai) — keep query on location follow-ups. Pass kind for spot type only (café, bar, brunch). source: saved = Nikhil's list only, google = outside his list, auto = saved first then Google fallback.",
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
        query: z
          .string()
          .optional()
          .describe(
            "Food, dish, or cuisine filter — pass for specific items like matcha, ramen, Thai, pizza, coffee. Do NOT substitute kind=café when the user names a specific item.",
          ),
        kind: z
          .string()
          .optional()
          .describe(
            "Filter by spot type — pass when the user asks for a category: brunch, breakfast, restaurant, Café, Casual, Sit-Down, Nice, Bar, or Activity. Not for specific dishes (use query instead).",
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
        query,
        kind,
        source = "auto",
        limit = 5,
      }): Promise<NearbySpotsToolOutput> => {
        const { origin, referenceName, search } = resolveNearbySearchContext(
          near,
          useUserLocation,
          currentLocation,
          query,
        );
        const walkLabel = formatWalkLimitLabel(search.maxWalkSeconds);

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
              [],
              search,
            );

            if (googlePlaces.length === 0) {
              return {
                found: false,
                error: query?.trim()
                  ? `No ${query.trim()} spots outside Nikhil's saved list within a ${walkLabel} of ${referenceName ?? "here"} — try a broader search or different area.`
                  : `No places outside Nikhil's saved list within a ${walkLabel} — try a different area or spot type.`,
              };
            }

            return {
              found: true,
              source: "google",
              intro: buildNearbyIntro({
                source: "google",
                referenceName,
                kind,
                query,
              }),
              referenceName,
              places: googlePlaces,
            };
          }

          if (source === "saved") {
            const savedPlaces = await buildSavedSpotCards(
              origin,
              kind,
              limit,
              query,
              search.maxWalkSeconds,
            );

            if (savedPlaces.length === 0) {
              return {
                found: false,
                error: savedListEmptyMessage(
                  referenceName,
                  kind,
                  query,
                  search.maxWalkSeconds,
                ),
              };
            }

            return {
              found: true,
              source: "saved",
              intro: buildNearbyIntro({
                source: "saved",
                referenceName,
                kind,
                query,
              }),
              referenceName,
              places: savedPlaces,
            };
          }

          const { places, source: resultSource, savedCount } =
            await buildAutoNearbyPlaces(origin, kind, limit, query, search);

          if (places.length === 0) {
            return {
              found: false,
              error: query?.trim()
                ? `No ${query.trim()} spots within a ${walkLabel} of ${referenceName ?? "here"} — try a broader search or different area.`
                : `No places within a ${walkLabel} found nearby — try a different area or spot type.`,
            };
          }

          return {
            found: true,
            source: resultSource,
            intro: buildNearbyIntro({
              source: resultSource,
              referenceName,
              kind,
              query,
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
    getAhlaEvents: tool({
      description:
        "Return AHLA conference sessions and networking events as rich cards (time, speakers, contact status, play/tips). Use for AHLA schedule questions, must-attend sessions, where contacts are speaking, networking events, or conference day planning. Do NOT list event details as plain text — the tool renders cards.",
      inputSchema: z.object({
        mustAttendOnly: z
          .boolean()
          .optional()
          .describe(
            "When true, return only must-attend sessions (EBG, Felicia, Hoyt, Benesch, etc.).",
          ),
        priority: z
          .enum(["must-attend", "recommended", "networking"])
          .optional()
          .describe("Filter by priority tier."),
        day: z
          .enum(["sun", "mon", "tue", "wed"])
          .optional()
          .describe("Conference day filter."),
        kind: z
          .enum(["session", "networking", "general", "meal"])
          .optional()
          .describe("Event type filter."),
        sessionIds: z
          .array(z.string())
          .optional()
          .describe("Specific session numbers, e.g. ['9', '18', '20']."),
        contactName: z
          .string()
          .optional()
          .describe("Filter to events where this contact speaks."),
      }),
      execute: async (filter): Promise<AhlaEventsToolOutput> =>
        buildAhlaEventsToolOutput(filter),
    }),
  };
}

export type KaviTripAiTools = ReturnType<typeof createKaviTripAiTools>;
