export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { ensureKaviAiTelemetry } = await import("@/app/lib/kavi-braintrust");

  await ensureKaviAiTelemetry();
}
