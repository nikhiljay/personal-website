import type { ExpressionSpecification } from "maplibre-gl";

export type SavedSpotKind = "cafe" | "casual" | "nice" | "bar" | "activity";

export const savedSpotKindColors: Record<
  "light" | "dark",
  Record<SavedSpotKind, string>
> = {
  light: {
    cafe: "#8B5E3C",
    casual: "#5C7A5C",
    nice: "#6B5B7B",
    bar: "#A67C00",
    activity: "#4A7389",
  },
  dark: {
    cafe: "#C4926A",
    casual: "#8FAF8F",
    nice: "#A898B8",
    bar: "#D4AA50",
    activity: "#7AACC4",
  },
};

export const savedSpotKindMeta: Record<
  SavedSpotKind,
  { label: string; color: string }
> = {
  cafe: { label: "Café", color: "light-dark(#8B5E3C, #C4926A)" },
  casual: { label: "Casual", color: "light-dark(#5C7A5C, #8FAF8F)" },
  nice: { label: "Sit-Down", color: "light-dark(#6B5B7B, #A898B8)" },
  bar: { label: "Bar", color: "light-dark(#A67C00, #D4AA50)" },
  activity: { label: "Activity", color: "light-dark(#4A7389, #7AACC4)" },
};

export function savedSpotKindColorExpression(
  theme: "light" | "dark",
): ExpressionSpecification {
  const colors = savedSpotKindColors[theme];

  return [
    "match",
    ["get", "kind"],
    "cafe",
    colors.cafe,
    "casual",
    colors.casual,
    "nice",
    colors.nice,
    "bar",
    colors.bar,
    "activity",
    colors.activity,
    colors.cafe,
  ];
}
