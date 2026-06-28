import { getSavedSpotKindColor } from "./saved-spot-kinds";
import { savedSpots } from "./nikhil-saved-spots";

export type TripStop = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  kind: "conference" | "dinner" | "reception" | "coffee";
};

export type TripEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  /** ISO-8601 start instant for temporal comparisons in prompts/tools. */
  startsAt: string;
  stopId?: string;
  note?: string;
  url?: string;
};

export type Neighborhood = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export const tripStops: TripStop[] = [
  {
    id: "hilton",
    name: "Hilton Midtown",
    address: "1335 Avenue of the Americas",
    lat: 40.7622,
    lng: -73.9797,
    kind: "conference",
  },
  {
    id: "il-gattopardo",
    name: "Il Gattopardo",
    address: "13 W 54th St",
    lat: 40.7616453,
    lng: -73.9763252,
    kind: "dinner",
  },
  {
    id: "limani",
    name: "Limani",
    address: "45 Rockefeller Plaza",
    lat: 40.7587,
    lng: -73.9785,
    kind: "dinner",
  },
  {
    id: "moma",
    name: "MoMA",
    address: "11 West 53rd Street",
    lat: 40.7614,
    lng: -73.9776,
    kind: "reception",
  },
  {
    id: "paley",
    name: "The Paley Center for Media",
    address: "25 West 52nd Street",
    lat: 40.7605,
    lng: -73.9767,
    kind: "reception",
  },
  {
    id: "thai-diner",
    name: "Thai Diner",
    address: "151 Mott Street",
    lat: 40.7198,
    lng: -73.9955,
    kind: "dinner",
  },
  {
    id: "musaafer",
    name: "Musaafer",
    address: "133 Duane Street",
    lat: 40.7153,
    lng: -74.0087,
    kind: "dinner",
  },
];

export const manhattanNeighborhoods: Neighborhood[] = [
  { id: "financial-district", name: "Financial District", lat: 40.7075, lng: -74.009 },
  { id: "battery-park-city", name: "Battery Park City", lat: 40.711, lng: -74.016 },
  { id: "tribeca", name: "Tribeca", lat: 40.718, lng: -74.008 },
  { id: "chinatown", name: "Chinatown", lat: 40.715, lng: -73.997 },
  { id: "little-italy", name: "Little Italy", lat: 40.719, lng: -73.997 },
  { id: "nolita", name: "Nolita", lat: 40.724, lng: -73.995 },
  { id: "soho", name: "SoHo", lat: 40.723, lng: -74.002 },
  { id: "lower-east-side", name: "Lower East Side", lat: 40.718, lng: -73.984 },
  { id: "east-village", name: "East Village", lat: 40.726, lng: -73.982 },
  { id: "greenwich-village", name: "Greenwich Village", lat: 40.733, lng: -74.002 },
  { id: "west-village", name: "West Village", lat: 40.735, lng: -74.01 },
  { id: "chelsea", name: "Chelsea", lat: 40.746, lng: -74.001 },
  { id: "flatiron", name: "Flatiron", lat: 40.741, lng: -73.99 },
  { id: "gramercy", name: "Gramercy", lat: 40.737, lng: -73.985 },
  { id: "kips-bay", name: "Kips Bay", lat: 40.743, lng: -73.981 },
  { id: "murray-hill", name: "Murray Hill", lat: 40.748, lng: -73.976 },
  { id: "midtown", name: "Midtown", lat: 40.756, lng: -73.984 },
  { id: "midtown-east", name: "Midtown East", lat: 40.758, lng: -73.973 },
  { id: "garment-district", name: "Garment District", lat: 40.754, lng: -73.989 },
  { id: "times-square", name: "Times Square", lat: 40.758, lng: -73.987 },
  { id: "hells-kitchen", name: "Hell's Kitchen", lat: 40.763, lng: -73.992 },
  { id: "hudson-yards", name: "Hudson Yards", lat: 40.754, lng: -74.002 },
  { id: "columbus-circle", name: "Columbus Circle", lat: 40.768, lng: -73.982 },
];

export type MapHighlight = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  fill: string;
  ring: string;
  shape?: "square";
};

export const mapHighlights: MapHighlight[] = [
  {
    id: "hilton",
    name: "Hilton Midtown",
    address: "1335 Avenue of the Americas",
    lat: 40.7622,
    lng: -73.9797,
    fill: "#006BB6",
    ring: "rgba(0, 107, 182, 0.35)",
  },
  {
    id: "shobha-home",
    name: "Shobha's",
    address: "305 E 11th St",
    lat: 40.7302392,
    lng: -73.9856293,
    fill: "#F58426",
    ring: "rgba(245, 132, 38, 0.35)",
    shape: "square",
  },
];

export const mapHighlightIds = new Set(mapHighlights.map((place) => place.id));

/** Manhattan: Battery Park to ~80th St. */
export const mapBounds: [[number, number], [number, number]] = [
  [-74.015, 40.704],
  [-73.965, 40.786],
];

/** Manhattan street grid is ~29° east of true north; rotate so the island reads vertically. */
export const mapBearing = 28.9;

export function getStopById(id: string) {
  return tripStops.find((stop) => stop.id === id);
}

export function getPlaceByStopId(id: string) {
  return (
    mapHighlights.find((place) => place.id === id) ??
    getStopById(id) ??
    savedSpots.find((spot) => spot.id === id)
  );
}

export type TripReferencePoint = {
  name: string;
  lat: number;
  lng: number;
};

type TripReferenceCandidate = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

const tripReferenceCandidates: TripReferenceCandidate[] = [
  ...tripStops,
  ...mapHighlights,
  ...manhattanNeighborhoods,
  ...savedSpots,
];

export function resolveTripReferencePoint(
  query: string,
): TripReferencePoint | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const byId = tripReferenceCandidates.find(
    (place) => place.id.toLowerCase() === normalized,
  );
  if (byId) {
    return { name: byId.name, lat: byId.lat, lng: byId.lng };
  }

  const byExactName = tripReferenceCandidates.find(
    (place) => place.name.toLowerCase() === normalized,
  );
  if (byExactName) {
    return { name: byExactName.name, lat: byExactName.lat, lng: byExactName.lng };
  }

  const partialMatches = tripReferenceCandidates.filter(
    (place) =>
      place.name.toLowerCase().includes(normalized) ||
      normalized.includes(place.name.toLowerCase()),
  );

  if (partialMatches.length === 0) {
    return null;
  }

  const bestMatch = partialMatches.sort(
    (left, right) => left.name.length - right.name.length,
  )[0];

  return {
    name: bestMatch.name,
    lat: bestMatch.lat,
    lng: bestMatch.lng,
  };
}

export function getScheduleMarkerColor(
  stopId: string,
  theme: "light" | "dark" = "light",
) {
  const highlight = mapHighlights.find((place) => place.id === stopId);
  if (highlight) {
    return highlight.fill;
  }

  const savedSpot = savedSpots.find((spot) => spot.id === stopId);
  if (savedSpot) {
    return getSavedSpotKindColor(savedSpot.kind, theme);
  }

  return theme === "dark" ? "#f2f2f2" : "#111111";
}
