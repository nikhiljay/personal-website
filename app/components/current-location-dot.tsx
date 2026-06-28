import "./trip-map.css";

import { cn } from "@/lib/utils";

export function CurrentLocationDot({
  active = true,
  label,
  className,
}: {
  active?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "trip-map-current-location inline-flex scale-[0.875] origin-center",
        !active && "trip-map-current-location--inactive",
        className,
      )}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <span className="trip-map-current-location-ring">
        <span className="trip-map-current-location-dot" />
      </span>
      {label ? (
        <span className="trip-map-current-location-label">{label}</span>
      ) : null}
    </span>
  );
}
