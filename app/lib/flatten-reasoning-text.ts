import { parseReasoningSteps } from "./parse-reasoning-steps";

function normalizeTypography(text: string) {
  return text
    .replace(/\s+,/g, ",")
    .replace(/,(\S)/g, ", $1");
}

/** Single reasoning body — section titles are stripped, paragraphs kept. */
export function flattenReasoningText(text: string): string {
  const steps = parseReasoningSteps(text.trim());
  if (steps.length === 0) {
    return normalizeTypography(text.trim());
  }

  return normalizeTypography(
    steps
      .map((step) => step.body.trim())
      .filter(Boolean)
      .join("\n\n"),
  );
}
