import type { VisitorLocation } from "./visitor-store";

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getVisitorLocationFromHeaders(
  headers: Headers,
): VisitorLocation | null {
  const city =
    headers.get("x-vercel-ip-city") ??
    headers.get("cf-ipcity") ??
    headers.get("x-nf-geo-city");

  const region =
    headers.get("x-vercel-ip-country-region") ??
    headers.get("cf-region-code") ??
    headers.get("x-nf-geo-region");

  if (!city || !region) {
    return null;
  }

  return {
    city: titleCase(city),
    region: region.toUpperCase(),
  };
}

export function formatVisitorLocation(location: VisitorLocation) {
  return `${location.city}, ${location.region}`;
}
