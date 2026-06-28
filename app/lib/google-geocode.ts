import type { Coordinates } from "./geo";

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { value: string | null; expiresAt: number }>();

function getGoogleMapsApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;
}

export async function reverseGeocodeAddress(
  coordinates: Coordinates,
): Promise<string | null> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return null;
  }

  const cacheKey = `${coordinates.lat.toFixed(5)},${coordinates.lng.toFixed(5)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${coordinates.lat},${coordinates.lng}`);
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      cache.set(cacheKey, {
        value: null,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return null;
    }

    const data = (await response.json()) as {
      status?: string;
      error_message?: string;
      results?: Array<{ formatted_address?: string }>;
    };

    if (data.status !== "OK" || !data.results?.[0]?.formatted_address) {
      if (data.status === "REQUEST_DENIED") {
        console.warn(
          "[google-geocode] Geocoding API not enabled:",
          data.error_message,
        );
      }
      return null;
    }

    const address = data.results[0].formatted_address;

    cache.set(cacheKey, {
      value: address,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return address;
  } catch {
    return null;
  }
}
