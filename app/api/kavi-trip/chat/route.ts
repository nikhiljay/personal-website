import { gateway } from "@ai-sdk/gateway";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { buildKaviTripSystemPrompt } from "@/app/lib/kavi-trip-ai-context";
import { kaviTripAiTools } from "@/app/lib/kavi-trip-ai-tools";
import { getTripEventsFromCalendar } from "@/app/lib/kavi-trip-calendar";

export const maxDuration = 30;

async function loadTripEvents() {
  try {
    return await getTripEventsFromCalendar();
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const tripEvents = await loadTripEvents();

  const result = streamText({
    model: gateway("openai/gpt-4o-mini"),
    system: buildKaviTripSystemPrompt(tripEvents),
    messages: await convertToModelMessages(messages),
    tools: kaviTripAiTools,
    stopWhen: stepCountIs(5),
    maxOutputTokens: 600,
  });

  return result.toUIMessageStreamResponse();
}
