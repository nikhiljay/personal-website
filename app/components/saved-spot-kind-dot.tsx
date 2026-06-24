import { savedSpotKindMeta, type SavedSpotKind } from "../lib/saved-spot-kinds";

export function SavedSpotKindDot({
  kind,
  className = "inline-block h-2 w-2 shrink-0 rounded-full",
}: {
  kind: SavedSpotKind;
  className?: string;
}) {
  const meta = savedSpotKindMeta[kind];

  return (
    <span
      className={className}
      style={{ backgroundColor: meta.color }}
      aria-label={meta.label}
      title={meta.label}
    />
  );
}
