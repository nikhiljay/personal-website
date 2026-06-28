import { gateway } from "@ai-sdk/gateway";

const DEFAULT_MODEL = "deepseek/deepseek-v4-flash";

export function getKaviChatModelId() {
  return process.env.KAVI_CHAT_MODEL?.trim() || DEFAULT_MODEL;
}

export function getKaviChatModel() {
  return gateway(getKaviChatModelId());
}

/** Reasoning effort for models that support extended thinking via AI Gateway. */
export function getKaviChatReasoningEffort():
  | "low"
  | "medium"
  | "high"
  | undefined {
  const model = getKaviChatModelId();

  if (model.includes("o1") || model.includes("o3") || model.includes("o4")) {
    return "medium";
  }

  if (model.includes("gpt-5")) {
    return "medium";
  }

  return undefined;
}
