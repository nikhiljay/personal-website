const TRIP_TIMEZONE = "America/New_York";

function ymdInTripTimezone(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: TRIP_TIMEZONE });
}

function addDaysToYmd(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return utc.toISOString().slice(0, 10);
}

function formatDateLabelFromYmd(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return noonUtc.toLocaleDateString("en-US", {
    timeZone: TRIP_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

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
  return formatDateLabelFromYmd(ymdInTripTimezone(date));
}

export function formatNycYesterdayLabel(date = new Date()) {
  return formatDateLabelFromYmd(addDaysToYmd(ymdInTripTimezone(date), -1));
}

export function formatNycTomorrowLabel(date = new Date()) {
  return formatDateLabelFromYmd(addDaysToYmd(ymdInTripTimezone(date), 1));
}

export function formatEventTemporalLabel(startsAt: string, now = new Date()) {
  return new Date(startsAt) <= now ? "past" : "upcoming";
}
