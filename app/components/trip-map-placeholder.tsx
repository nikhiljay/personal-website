import "./trip-map.css";

export function TripMapPlaceholder() {
  return (
    <div
      className="trip-map-shell overflow-hidden"
      aria-hidden="true"
    >
      <div className="flex h-[min(480px,68vh)] w-full items-center justify-center">
        <span className="text-[13px] text-muted">Loading map…</span>
      </div>
    </div>
  );
}
