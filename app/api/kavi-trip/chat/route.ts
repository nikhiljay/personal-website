import { gateway } from "@ai-sdk/gateway";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type StopCondition,
  type UIMessage,
} from "ai";

import { buildKaviTripSystemPrompt } from "@/app/lib/kavi-trip-ai-context";
import { kaviTripAiTools } from "@/app/lib/kavi-trip-ai-tools";
import type { PlaceRatingsToolOutput } from "@/app/lib/kavi-trip-ai-tools";
import { getTripEventsFromCalendar } from "@/app/lib/kavi-trip-calendar";

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
const stopAfterPlaceLookup: StopCondition<typeof kaviTripAiTools> = ({
  steps,
}) => {
  const lastStep = steps.at(-1);
  if (!lastStep) {
    return false;
  }

  return lastStep.staticToolResults.some((result) => {
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
  const { messages }: { messages: UIMessage[] } = await req.json();
  const tripEvents = await loadTripEvents();

  const result = streamText({
    model: gateway("openai/gpt-4o-mini"),
    system: buildKaviTripSystemPrompt(tripEvents),
    messages: await convertToModelMessages(messages),
    tools: kaviTripAiTools,
    stopWhen: [stopAfterPlaceLookup, stepCountIs(5)],
    maxOutputTokens: 600,
  });

  return result.toUIMessageStreamResponse({
    onError: formatStreamError,
  });
}
