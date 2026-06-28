import { parseReasoningSteps } from "./parse-reasoning-steps";

/** Single reasoning body — section titles are stripped, paragraphs kept. */
export function flattenReasoningText(text: string): string {
  const steps = parseReasoningSteps(text.trim());
  if (steps.length === 0) {
    return text.trim();
  }

  return steps
    .map((step) => step.body.trim())
    .filter(Boolean)
    .join("\n\n");
}
