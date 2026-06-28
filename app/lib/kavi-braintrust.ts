import "server-only";

import { braintrustAISDKTelemetry, initLogger } from "braintrust";
import { registerTelemetry, type Telemetry } from "ai";

const initializedKey = Symbol.for("kavi.braintrust.initialized");

type GlobalWithBraintrust = typeof globalThis & {
  [initializedKey]?: boolean;
};

export function ensureKaviBraintrustTelemetry() {
  const global = globalThis as GlobalWithBraintrust;
  if (global[initializedKey]) {
    return;
  }
  global[initializedKey] = true;

  initLogger({
    projectName: process.env.BRAINTRUST_PROJECT_NAME ?? "braintrust-aqua-ball",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });

  // Braintrust's v7 integration implements `onFinish`, but AI SDK v7 emits `onEnd`
  // when a stream completes — wire them together so output + TTFT are logged.
  const braintrustTelemetry = braintrustAISDKTelemetry() as Telemetry & {
    onFinish?: (event: unknown) => void;
  };

  registerTelemetry({
    ...braintrustTelemetry,
    onEnd: braintrustTelemetry.onFinish,
  });
}
