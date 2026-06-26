import "./trip-map.css";
import "./trip-map-placeholder.css";

export function TripMapPlaceholder({
  exiting = false,
  bare = false,
}: {
  exiting?: boolean;
  bare?: boolean;
}) {
  const content = (
    <div className="trip-map-placeholder__surface">
      <div className="trip-map-placeholder__grid" />
      <div className="trip-map-placeholder__glow" />
    </div>
  );

  if (bare) {
    return (
      <div
        className={`trip-map-placeholder trip-map-placeholder--bare ${exiting ? "trip-map-placeholder--exit" : ""}`.trim()}
        aria-hidden="true"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`trip-map-shell trip-map-placeholder ${exiting ? "trip-map-placeholder--exit" : ""}`.trim()}
      aria-hidden="true"
    >
      {content}
    </div>
  );
}
