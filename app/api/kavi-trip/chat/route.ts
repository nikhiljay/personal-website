import { gateway } from "@ai-sdk/gateway";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { buildKaviTripSystemPrompt } from "@/app/lib/kavi-trip-ai-context";
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
    model: gateway("openai/gpt-5.4"),
    system: buildKaviTripSystemPrompt(tripEvents),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 500,
  });

  return result.toUIMessageStreamResponse();
}
