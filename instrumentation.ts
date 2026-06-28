export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { ensureKaviBraintrustTelemetry } = await import(
    "@/app/lib/kavi-braintrust"
  );

  ensureKaviBraintrustTelemetry();
}
