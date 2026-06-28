import "server-only";

import type { TextStreamPart, ToolSet } from "ai";

const TTFT_CHUNK_TYPES = new Set([
  "text-delta",
  "reasoning-delta",
  "tool-call",
  "tool-input-start",
]);

type TelemetryIntegration = {
  onChunk?: (event: { chunk: { callId?: string } }) => void;
};

export function isStreamTtftChunk(chunk: TextStreamPart<ToolSet>) {
  return TTFT_CHUNK_TYPES.has(chunk.type);
}

/** AI SDK v7 does not emit telemetry `onChunk`; forward the first content chunk manually. */
export function forwardStreamChunkToBraintrustTtft(
  callId: string,
  chunk: TextStreamPart<ToolSet>,
) {
  if (!isStreamTtftChunk(chunk)) {
    return;
  }

  const integrations =
    (
      globalThis as {
        AI_SDK_TELEMETRY_INTEGRATIONS?: TelemetryIntegration[];
      }
    ).AI_SDK_TELEMETRY_INTEGRATIONS ?? [];

  for (const integration of integrations) {
    integration.onChunk?.({ chunk: { ...chunk, callId } });
  }
}
