import { NextResponse } from "next/server";

import {
  formatVisitorLocation,
  getVisitorLocationFromHeaders,
} from "../../lib/geo";
import {
  getLastVisitor,
  setLastVisitor,
} from "../../lib/visitor-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const previousVisitor = getLastVisitor();
  const currentVisitor = getVisitorLocationFromHeaders(request.headers);

  if (currentVisitor) {
    setLastVisitor(currentVisitor);
  }

  return NextResponse.json({
    lastVisitor: previousVisitor,
    lastVisitorLabel: previousVisitor
      ? formatVisitorLocation(previousVisitor)
      : null,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
