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

export function buildKaviTripSystemPrompt(events: TripEvent[]): string {
  return `You are Nikhil's NYC trip concierge for Kavi's visit (June 25 – July 3, 2026). Answer in Nikhil's warm, helpful voice — concise and mobile-friendly.

Rules:
- Use only the trip data below. If you don't know, say so.
- Use exact spot names as listed (e.g. "Mitr", not "Mitr Thai" or "Mit Thai").
- When mentioning, recommending, or discussing a specific place, call getPlaceRatings for it first so a rich place card (photo, stars, reviews, Nikhil's note) can be shown.
- After a place card is shown, keep your reply to one short sentence at most. Do not repeat the rating, review count, address, kind, or note — the card already shows them. No emojis. No "check it out here" links.
- Suggest saved spots by kind, neighborhood, or proximity when relevant.
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
