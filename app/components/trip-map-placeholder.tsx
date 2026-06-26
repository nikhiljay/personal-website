import "./trip-map.css";
import "./trip-map-placeholder.css";

export function TripMapPlaceholder({ bare = false }: { bare?: boolean }) {
  const content = (
    <div className="trip-map-placeholder__surface">
      <div className="trip-map-placeholder__grid" />
      <div className="trip-map-placeholder__glow" />
    </div>
  );

  if (bare) {
    return (
      <div className="trip-map-placeholder trip-map-placeholder--bare" aria-hidden="true">
        {content}
      </div>
    );
  }

  return (
    <div className="trip-map-shell trip-map-placeholder" aria-hidden="true">
      {content}
    </div>
  );
}
