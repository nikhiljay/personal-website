import { savedSpots, type SavedSpot } from "./nikhil-saved-spots";
import { savedSpotKindMeta } from "./saved-spot-kinds";

export type PlaceCardData = {
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
};

type GooglePlacesSearchResponse = {
  places?: Array<{
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    photos?: Array<{ name?: string }>;
  }>;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { value: PlaceCardData; expiresAt: number }>();

function cacheKey(name: string, address?: string) {
  return `${name.trim().toLowerCase()}|${(address ?? "").trim().toLowerCase()}`;
}

export function findSavedSpot(name: string, address?: string) {
  const normalizedName = name.trim().toLowerCase();

  const byName = savedSpots.filter(
    (spot) => spot.name.trim().toLowerCase() === normalizedName,
  );

  if (byName.length === 1) {
    return byName[0];
  }

  if (address) {
    const normalizedAddress = address.trim().toLowerCase();
    const byAddress = savedSpots.find((spot) =>
      spot.address.toLowerCase().includes(normalizedAddress),
    );
    if (byAddress) {
      return byAddress;
    }
  }

  return byName[0];
}

export function findSavedSpotById(spotId: string) {
  return savedSpots.find((spot) => spot.id === spotId);
}

function googlePhotoProxyUrl(photoName: string) {
  return `/api/places/photo?name=${encodeURIComponent(photoName)}`;
}

function buildPlaceCardData(
  savedSpot: SavedSpot | undefined,
  place: NonNullable<GooglePlacesSearchResponse["places"]>[number],
  fallbackName: string,
  fallbackAddress?: string,
): PlaceCardData {
  const googlePhotoName = place.photos?.[0]?.name;
  const photoUrl =
    savedSpot?.photo ??
    (googlePhotoName ? googlePhotoProxyUrl(googlePhotoName) : null);

  return {
    name: savedSpot?.name ?? place.displayName?.text ?? fallbackName,
    address:
      savedSpot?.address ?? place.formattedAddress ?? fallbackAddress ?? null,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    googleMapsUri: place.googleMapsUri ?? null,
    photoUrl,
    kind: savedSpot ? savedSpotKindMeta[savedSpot.kind].label : null,
    note: savedSpot?.note ?? null,
    visited: savedSpot?.visited ?? false,
    spotId: savedSpot?.id ?? null,
  };
}

export async function getPlaceCardData(input: {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  savedSpot?: SavedSpot;
}): Promise<PlaceCardData | { error: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { error: "Google Places API key is not configured." };
  }

  const key = cacheKey(input.name, input.address);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const textQuery = [input.name, input.address, "New York, NY"]
    .filter(Boolean)
    .join(", ");

  const body: Record<string, unknown> = {
    textQuery,
    maxResultCount: 1,
  };

  if (input.lat != null && input.lng != null) {
    body.locationBias = {
      circle: {
        center: { latitude: input.lat, longitude: input.lng },
        radius: 250,
      },
    };
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.photos",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    return {
      error: `Google Places lookup failed (${response.status}). ${detail.slice(0, 200)}`,
    };
  }

  const data = (await response.json()) as GooglePlacesSearchResponse;
  const place = data.places?.[0];

  if (!place) {
    return { error: `No Google Places result for "${input.name}".` };
  }

  const result = buildPlaceCardData(
    input.savedSpot,
    place,
    input.name,
    input.address,
  );

  cache.set(key, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

export async function getPlaceCardDataForSpot(input: {
  spotId?: string;
  name: string;
  address?: string;
}): Promise<PlaceCardData | { error: string }> {
  const savedSpot =
    (input.spotId ? findSavedSpotById(input.spotId) : undefined) ??
    findSavedSpot(input.name, input.address);

  return getPlaceCardData({
    name: savedSpot?.name ?? input.name,
    address: savedSpot?.address ?? input.address,
    lat: savedSpot?.lat,
    lng: savedSpot?.lng,
    savedSpot,
  });
}
