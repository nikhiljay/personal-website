import { getStopById, type TripEvent } from "./kavi-nyc-trip";

const TRIP_TIMEZONE = "America/New_York";

export type RelativeTripDay = "today" | "tomorrow" | "yesterday";

export type ScheduleEventOutput = {
  id: string;
  title: string;
  date: string;
  time: string;
  stopId: string | null;
  stopName: string | null;
  stopAddress: string | null;
  note: string | null;
  url: string | null;
};

export type ScheduleToolOutput =
  | { found: false; error: string }
  | { found: true; events: ScheduleEventOutput[] };

export type ScheduleFilter = {
  date?: string;
  relativeDay?: RelativeTripDay;
};

function ymdInTripTimezone(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: TRIP_TIMEZONE });
}

function addDaysToYmd(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return utc.toISOString().slice(0, 10);
}

/** Matches calendar event `date` labels (e.g. "Sat, Jun 27"). */
export function formatTripDayLabel(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return utc.toLocaleDateString("en-US", {
    timeZone: TRIP_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function tripDayLabelForRelative(relativeDay: RelativeTripDay) {
  const offset =
    relativeDay === "today" ? 0 : relativeDay === "tomorrow" ? 1 : -1;
  const ymd = addDaysToYmd(ymdInTripTimezone(), offset);
  return formatTripDayLabel(ymd);
}

function normalizeRelativeDayFromText(
  value: string | undefined,
): RelativeTripDay | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "today") {
    return "today";
  }

  if (normalized === "tomorrow") {
    return "tomorrow";
  }

  if (normalized === "yesterday") {
    return "yesterday";
  }

  return undefined;
}

function resolveScheduleFilter(filter?: ScheduleFilter): {
  relativeDay?: RelativeTripDay;
  dateQuery?: string;
  resolvedLabel?: string;
} {
  const relativeFromDay = normalizeRelativeDayFromText(filter?.relativeDay);
  const relativeFromDate = normalizeRelativeDayFromText(filter?.date);

  const relativeDay = relativeFromDay ?? relativeFromDate;

  if (relativeDay) {
    return {
      relativeDay,
      resolvedLabel: tripDayLabelForRelative(relativeDay),
    };
  }

  if (filter?.date?.trim()) {
    return {
      dateQuery: filter.date.trim(),
      resolvedLabel: filter.date.trim(),
    };
  }

  return {};
}

function enrichScheduleEvent(event: TripEvent): ScheduleEventOutput {
  const stop = event.stopId ? getStopById(event.stopId) : undefined;

  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    stopId: event.stopId ?? null,
    stopName: stop?.name ?? null,
    stopAddress: stop?.address ?? null,
    note: event.note ?? null,
    url: event.url ?? null,
  };
}

export function buildScheduleToolOutput(
  tripEvents: TripEvent[],
  filter?: ScheduleFilter,
): ScheduleToolOutput {
  const { relativeDay, dateQuery, resolvedLabel } = resolveScheduleFilter(
    filter,
  );
  let events = tripEvents;

  if (relativeDay) {
    const dayLabel = tripDayLabelForRelative(relativeDay);
    events = events.filter((event) => event.date === dayLabel);
  } else if (dateQuery) {
    const query = dateQuery.toLowerCase();
    events = events.filter((event) =>
      event.date.toLowerCase().includes(query),
    );
  }

  if (events.length === 0) {
    return {
      found: false,
      error: resolvedLabel
        ? `No events found for ${resolvedLabel}.`
        : "Schedule unavailable.",
    };
  }

  return {
    found: true,
    events: events.map(enrichScheduleEvent),
  };
}

export function groupScheduleEvents(events: ScheduleEventOutput[]) {
  const groups: { date: string; events: ScheduleEventOutput[] }[] = [];

  for (const event of events) {
    const current = groups[groups.length - 1];

    if (current?.date === event.date) {
      current.events.push(event);
    } else {
      groups.push({ date: event.date, events: [event] });
    }
  }

  return groups;
}
