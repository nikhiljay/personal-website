export type ReasoningStep = {
  title?: string;
  body: string;
};

const REASONING_HEADER_RE = /\*\*(.+?)\*\*/g;

function isReasoningSectionHeader(text: string, index: number, title: string) {
  const before = text.slice(0, index);
  const atBoundary =
    index === 0 || /\n\s*$/.test(before) || /[.!?]\s*$/.test(before);

  if (!atBoundary) {
    return false;
  }

  const normalized = title.trim();
  if (!normalized) {
    return false;
  }

  // Section titles are usually short phrases, not inline emphasis like **very**.
  return (
    normalized.length >= 8 ||
    normalized.includes(" ") ||
    /^[A-Z]/.test(normalized)
  );
}

function findReasoningHeaders(text: string) {
  const headers: { index: number; title: string; length: number }[] = [];

  for (const match of text.matchAll(REASONING_HEADER_RE)) {
    const index = match.index ?? 0;
    const title = match[1]?.trim() ?? "";

    if (!isReasoningSectionHeader(text, index, title)) {
      continue;
    }

    headers.push({
      index,
      title,
      length: match[0].length,
    });
  }

  return headers;
}

export function parseReasoningSteps(text: string): ReasoningStep[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  const headers = findReasoningHeaders(trimmed);
  if (headers.length === 0) {
    return [{ body: trimmed }];
  }

  const steps: ReasoningStep[] = [];
  const preamble = trimmed.slice(0, headers[0].index).trim();

  if (preamble) {
    steps.push({ body: preamble });
  }

  for (let index = 0; index < headers.length; index += 1) {
    const header = headers[index];
    const nextHeader = headers[index + 1];
    const bodyStart = header.index + header.length;
    const bodyEnd = nextHeader?.index ?? trimmed.length;
    const body = trimmed.slice(bodyStart, bodyEnd).trim();

    steps.push({
      title: header.title,
      body,
    });
  }

  return steps.length > 0 ? steps : [{ body: trimmed }];
}
