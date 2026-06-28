import "server-only";

import { braintrustAISDKTelemetry, initLogger } from "braintrust";
import { registerTelemetry, type Telemetry } from "ai";

const initializedKey = Symbol.for("kavi.braintrust.initialized");
const otelInitializedKey = Symbol.for("kavi.otel.initialized");

const DEFAULT_PROJECT_NAME = "kavi-nyc-trip";

type GlobalWithTelemetry = typeof globalThis & {
  [initializedKey]?: boolean;
  [otelInitializedKey]?: boolean;
};

function getBraintrustApiKey() {
  return process.env.BRAINTRUST_API_KEY?.trim() || undefined;
}

function registerBraintrustSdkTelemetry() {
  const global = globalThis as GlobalWithTelemetry;
  if (global[initializedKey]) {
    return;
  }
  global[initializedKey] = true;

  const apiKey = getBraintrustApiKey();
  if (!apiKey) {
    return;
  }

  const projectId = process.env.BRAINTRUST_PROJECT_ID?.trim();

  initLogger({
    projectName: process.env.BRAINTRUST_PROJECT_NAME ?? DEFAULT_PROJECT_NAME,
    ...(projectId ? { projectId } : {}),
    apiKey,
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

async function registerVercelOtelTelemetry() {
  const global = globalThis as GlobalWithTelemetry;
  if (global[otelInitializedKey]) {
    return;
  }
  global[otelInitializedKey] = true;

  const { registerOTel } = await import("@vercel/otel");
  registerOTel({ serviceName: "personal-website" });

  const { OpenTelemetry } = await import("@ai-sdk/otel");
  registerTelemetry(new OpenTelemetry() as Telemetry);
}

/** Direct Braintrust SDK tracing when BRAINTRUST_API_KEY is set. */
export function ensureKaviBraintrustTelemetry() {
  registerBraintrustSdkTelemetry();
}

/**
 * Production-safe telemetry bootstrap:
 * - SDK path when BRAINTRUST_API_KEY is present (local dev or explicit Vercel env)
 * - Vercel OTel drain path when deployed without an API key (Marketplace integration)
 */
export async function ensureKaviAiTelemetry() {
  if (getBraintrustApiKey()) {
    registerBraintrustSdkTelemetry();
    return;
  }

  if (process.env.VERCEL === "1") {
    await registerVercelOtelTelemetry();
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[kavi-ai] Braintrust tracing disabled — set BRAINTRUST_API_KEY in .env.local",
    );
  }
}
