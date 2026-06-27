"use client";

import {
  getSavedSpotKindColor,
  savedSpotKindMeta,
  type SavedSpotKind,
} from "../lib/saved-spot-kinds";
import { usePreferredColorScheme } from "../hooks/use-preferred-color-scheme";

export function SavedSpotKindDot({
  kind,
  visited = false,
}: {
  kind: SavedSpotKind;
  visited?: boolean;
}) {
  const theme = usePreferredColorScheme();
  const meta = savedSpotKindMeta[kind];
  const color = getSavedSpotKindColor(kind, theme);

  return (
    <span
      className={`inline-block shrink-0 ${visited ? "size-[7.75px] rounded-[1px]" : "size-2 rounded-full"}`}
      style={{ backgroundColor: color }}
      aria-label={meta.label}
      title={meta.label}
    />
  );
}
