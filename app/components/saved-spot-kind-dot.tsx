import { savedSpotKindMeta, type SavedSpotKind } from "../lib/saved-spot-kinds";

export function SavedSpotKindDot({
  kind,
  visited = false,
}: {
  kind: SavedSpotKind;
  visited?: boolean;
}) {
  const meta = savedSpotKindMeta[kind];

  return (
    <span
      className={`inline-block shrink-0 ${visited ? "size-[7.75px] rounded-[1px]" : "size-2 rounded-full"}`}
      style={{ backgroundColor: meta.color }}
      aria-label={meta.label}
      title={meta.label}
    />
  );
}
