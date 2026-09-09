import { readFile } from "node:fs/promises";
import path from "node:path";

const CLIPS: Record<string, string> = {
  a: "a.bin",
  b: "b.bin",
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const dest = request.headers.get("sec-fetch-dest");
  if (dest === "document" || dest === "video" || dest === "iframe") {
    return new Response(null, { status: 404 });
  }

  const { id } = await context.params;
  const file = CLIPS[id];
  if (!file) {
    return new Response(null, { status: 404 });
  }

  const bytes = await readFile(
    path.join(process.cwd(), "content/mosaic", file),
  );

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
