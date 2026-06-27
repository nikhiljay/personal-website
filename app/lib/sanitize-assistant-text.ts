function sanitizeAssistantText(text: string) {
  return text
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return true;
      }

      // Drop emoji-only lines (e.g. stray 🍴 / 🍽️ the model sometimes adds).
      return !/^[\p{Extended_Pictographic}\s]+$/u.test(trimmed);
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export { sanitizeAssistantText };
