import "server-only";

/** Trace environment label sent to Braintrust via AI SDK telemetry `functionId`. */
export function getKaviAiTraceEnv() {
  const override = process.env.KAVI_AI_TRACE_ENV?.trim();
  if (override) {
    return override;
  }

  if (process.env.VERCEL === "1") {
    return process.env.VERCEL_ENV ?? "production";
  }

  return "local";
}

export function getKaviAiTraceFunctionId(baseId = "kavi-trip-chat") {
  return `${baseId}:${getKaviAiTraceEnv()}`;
}
