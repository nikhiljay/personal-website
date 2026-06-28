import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type StopCondition,
  type UIMessage,
} from "ai";

import { buildKaviTripSystemPrompt } from "@/app/lib/kavi-trip-ai-context";
import { getKaviAiTraceFunctionId } from "@/app/lib/kavi-ai-trace-env";
import { ensureKaviAiTelemetry } from "@/app/lib/kavi-braintrust";
import {
  getKaviChatModel,
  getKaviChatReasoningEffort,
} from "@/app/lib/kavi-chat-model";
import {
  createKaviTripAiTools,
  type AhlaEventsToolOutput,
  type NearbySpotsToolOutput,
  type PlaceRatingsToolOutput,
} from "@/app/lib/kavi-trip-ai-tools";
import { getTripEventsFromCalendar } from "@/app/lib/kavi-trip-calendar";
import { forwardStreamChunkToBraintrustTtft } from "@/app/lib/kavi-stream-telemetry";
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

// Allow one follow-up turn after rich tool cards so the model can add a short
// analysis (pick, timing, tradeoffs). Stop once that text lands — avoids extra
// loops while still saving most multi-step churn vs an open-ended agent.
const stopAfterToolAnalysis: StopCondition<
  ReturnType<typeof createKaviTripAiTools>
> = ({ steps }) => {
  if (steps.length < 2) {
    return false;
  }

  const lastStep = steps.at(-1);
  if (!lastStep?.text.trim() || lastStep.toolCalls.length > 0) {
    return false;
  }

  return steps.slice(0, -1).some((step) =>
    step.staticToolResults.some((result) => {
      if (result.toolName === "findNearbySpots") {
        const output = result.output as NearbySpotsToolOutput | undefined;
        return output?.found === true && output.places.length > 0;
      }

      if (result.toolName === "getPlaceRatings") {
        const output = result.output as PlaceRatingsToolOutput | undefined;
        return output?.found === true;
      }

      if (result.toolName === "getTripSchedule") {
        return true;
      }

      if (result.toolName === "getAhlaEvents") {
        const output = result.output as AhlaEventsToolOutput | undefined;
        return output?.found === true && output.events.length > 0;
      }

      return false;
    }),
  );
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
  await ensureKaviAiTelemetry();

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

  let streamCallId: string | undefined;

  const result = streamText({
    model: getKaviChatModel(),
    system: buildKaviTripSystemPrompt(
      tripEvents,
      nycCoordinatesFromContext(locationContext),
    ),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: [stopAfterToolAnalysis, stepCountIs(5)],
    maxOutputTokens: 4000,
    telemetry: {
      functionId: getKaviAiTraceFunctionId(),
      recordInputs: true,
      recordOutputs: true,
    },
    ...(reasoning ? { reasoning } : {}),
    onStart: ({ callId }) => {
      streamCallId = callId;
    },
    onChunk: ({ chunk }) => {
      if (streamCallId) {
        forwardStreamChunkToBraintrustTtft(streamCallId, chunk);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: formatStreamError,
  });
}
