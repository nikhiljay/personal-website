import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type StopCondition,
  type UIMessage,
} from "ai";

import { buildKaviTripSystemPrompt } from "@/app/lib/kavi-trip-ai-context";
import {
  getKaviChatModel,
  getKaviChatReasoningEffort,
} from "@/app/lib/kavi-chat-model";
import {
  createKaviTripAiTools,
  type NearbySpotsToolOutput,
  type PlaceRatingsToolOutput,
  type ScheduleToolOutput,
} from "@/app/lib/kavi-trip-ai-tools";
import { getTripEventsFromCalendar } from "@/app/lib/kavi-trip-calendar";
import {
  parseLocationContext,
  nycCoordinatesFromContext,
} from "@/app/lib/user-location";

export const maxDuration = 30;

async function loadTripEvents() {
  try {
    return await getTripEventsFromCalendar();
  } catch {
    return [];
  }
}

// Place cards are the response — skip a second LLM turn (saves a Gateway call and
// avoids free-tier rate limits that surfaced as "An error occurred.").
function parseLegacyCurrentLocation(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !("lat" in value) ||
    !("lng" in value) ||
    typeof value.lat !== "number" ||
    typeof value.lng !== "number"
  ) {
    return null;
  }

  return parseLocationContext({
    mode: "in_nyc",
    lat: value.lat,
    lng: value.lng,
  });
}

const stopAfterRichPlaceResponse: StopCondition<
  ReturnType<typeof createKaviTripAiTools>
> = ({ steps }) => {
  const lastStep = steps.at(-1);
  if (!lastStep) {
    return false;
  }

  return lastStep.staticToolResults.some((result) => {
    if (result.toolName === "findNearbySpots") {
      const output = result.output as NearbySpotsToolOutput | undefined;
      return output?.found === true && output.places.length > 0;
    }

    if (result.toolName === "getTripSchedule") {
      const output = result.output as ScheduleToolOutput | undefined;
      return output?.found === true && output.events.length > 0;
    }

    if (result.toolName !== "getPlaceRatings") {
      return false;
    }

    const output = result.output as PlaceRatingsToolOutput | undefined;
    return output?.found === true;
  });
};

function formatStreamError(error: unknown) {
  console.error("[kavi-trip/chat]", error);

  if (!(error instanceof Error)) {
    return "Chat request failed.";
  }

  if (error.message.includes("RateLimit") || error.message.includes("rate-limited")) {
    return "AI is briefly rate-limited — try again in a moment.";
  }

  return error.message;
}

export async function POST(req: Request) {
  const {
    messages,
    locationContext: locationContextInput,
    currentLocation: legacyCurrentLocation,
  }: {
    messages: UIMessage[];
    locationContext?: unknown;
    currentLocation?: unknown;
  } = await req.json();
  const tripEvents = await loadTripEvents();
  const locationContext = locationContextInput
    ? parseLocationContext(locationContextInput)
    : parseLegacyCurrentLocation(legacyCurrentLocation) ?? {
        mode: "unavailable" as const,
      };
  const tools = createKaviTripAiTools(locationContext, tripEvents);
  const reasoning = getKaviChatReasoningEffort();

  const result = streamText({
    model: getKaviChatModel(),
    system: buildKaviTripSystemPrompt(
      tripEvents,
      nycCoordinatesFromContext(locationContext),
    ),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: [stopAfterRichPlaceResponse, stepCountIs(5)],
    maxOutputTokens: 4000,
    ...(reasoning ? { reasoning } : {}),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: formatStreamError,
  });
}
