import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const name = new URL(req.url).searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Missing photo name" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const photoResponse = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxHeightPx=480&maxWidthPx=640&skipHttpRedirect=true`,
    {
      headers: { "X-Goog-Api-Key": apiKey },
      next: { revalidate: 60 * 60 * 24 },
    },
  );

  if (!photoResponse.ok) {
    return NextResponse.json({ error: "Photo unavailable" }, { status: 502 });
  }

  const data = (await photoResponse.json()) as { photoUri?: string };
  if (!data.photoUri) {
    return NextResponse.json({ error: "Photo unavailable" }, { status: 502 });
  }

  return NextResponse.redirect(data.photoUri);
}
