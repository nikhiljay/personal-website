type MapExpression = unknown;

export type SavedSpotKind = "cafe" | "casual" | "nice" | "bar" | "activity";

export const savedSpotKindColors: Record<
  "light" | "dark",
  Record<SavedSpotKind, string>
> = {
  light: {
    cafe: "#B06A35",
    casual: "#3D8B47",
    nice: "#7550A0",
    bar: "#C99200",
    activity: "#2E7DAF",
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
  cafe: { label: "Café", color: "light-dark(#B06A35, #C4926A)" },
  casual: { label: "Casual", color: "light-dark(#3D8B47, #8FAF8F)" },
  nice: { label: "Sit-Down", color: "light-dark(#7550A0, #A898B8)" },
  bar: { label: "Bar", color: "light-dark(#C99200, #D4AA50)" },
  activity: { label: "Activity", color: "light-dark(#2E7DAF, #7AACC4)" },
};

export function savedSpotKindColorExpression(
  theme: "light" | "dark",
): MapExpression {
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
