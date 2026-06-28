const TRIP_TIMEZONE = "America/New_York";

export function formatNycNow(date = new Date()) {
  return date.toLocaleString("en-US", {
    timeZone: TRIP_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Matches schedule event date labels (e.g. "Sat, Jun 27"). */
export function formatNycDateLabel(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    timeZone: TRIP_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
