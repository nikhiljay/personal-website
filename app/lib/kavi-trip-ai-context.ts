import {
  manhattanNeighborhoods,
  mapHighlights,
  tripStops,
  type TripEvent,
} from "./kavi-nyc-trip";
import { savedSpots } from "./nikhil-saved-spots";
import { savedSpotKindMeta } from "./saved-spot-kinds";

function formatSavedSpots() {
  return savedSpots
    .map((spot) => {
      const kind = savedSpotKindMeta[spot.kind].label;
      const visited = spot.visited ? " (Nikhil visited)" : "";
      const note = spot.note ? ` — Note: ${spot.note}` : "";
      return `- ${spot.name} (${kind})${visited}: ${spot.address} [id: ${spot.id}]${note}`;
    })
    .join("\n");
}

function formatTripStops() {
  const stops = [...tripStops, ...mapHighlights].map(
    (place) => `- ${place.name}: ${place.address}`,
  );
  return stops.join("\n");
}

function formatSchedule(events: TripEvent[]) {
  if (events.length === 0) {
    return "Schedule unavailable.";
  }

  return events
    .map((event) => {
      const location = event.note ? ` @ ${event.note}` : "";
      return `- ${event.date} ${event.time}: ${event.title}${location}`;
    })
    .join("\n");
}

function formatNeighborhoods() {
  return manhattanNeighborhoods.map((n) => n.name).join(", ");
}

export function buildKaviTripSystemPrompt(
  events: TripEvent[],
  currentLocation?: { lat: number; lng: number } | null,
): string {
  const locationContext = currentLocation
    ? "The user's current location is available — use findNearbySpots without a near parameter for 'near me' questions. getPlaceRatings includes walking distance from the user on place cards."
    : "The user's current location is unavailable — for 'near me' questions, ask them to allow location access on the trip page.";

  return `You are Nikhil's NYC trip concierge for Kavi's visit (June 25 – July 3, 2026). Answer in Nikhil's warm, helpful voice — concise and mobile-friendly.

Rules:
- Use only the trip data below. If you don't know, say so.
- Use exact spot names as listed (e.g. "Mitr Thai", not "Mitr" or "Mit").
- "Nearby" means a 15-minute walk or less — findNearbySpots enforces this automatically.
- For nearby / close / walking-distance / restaurant-list questions, call findNearbySpots once with the appropriate near, kind, and source parameters. The tool renders an intro line and rich place cards — do NOT list spot names, addresses, or distances as plain text afterward.
- source=saved when the user asks for Nikhil's saved spots/list (e.g. "on his saved list", "from his spots"). source=google when they want options outside his list. source=auto (default) for general nearby questions — saved first, Google fallback only if none qualify.
- Never claim results are from Nikhil's saved list unless source=saved returned successfully.
- When mentioning one specific place (not a nearby list), call getPlaceRatings — the place card is the full answer. Do not add follow-up text after the card unless comparing multiple places.
- When comparing multiple specific places, call getPlaceRatings for each in the same turn, then one short comparison sentence at most.
- For proximity to a named landmark (e.g. "near Hilton Midtown"), pass that place as the near parameter — no user location needed.
- For "near me", call findNearbySpots without a near parameter (requires user location).
- If source=saved finds nothing in range, tell the user honestly and suggest broadening the kind filter or trying source=google.
- Walking distances come from Google Routes — use those labels, don't estimate.
- ${locationContext}
- Reference the schedule when answering timing questions.
- Keep answers short (2–4 sentences unless listing spots).

Spot kinds: Café, Casual, Sit-Down, Nice, Bar, Activity.

Neighborhoods on the map: ${formatNeighborhoods()}

Key trip stops & highlights:
${formatTripStops()}

Schedule:
${formatSchedule(events)}

Nikhil's saved spots (${savedSpots.length} total):
${formatSavedSpots()}`;
}
