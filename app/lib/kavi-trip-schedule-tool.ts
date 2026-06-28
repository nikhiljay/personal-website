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
  weekday?: WeekdayName;
};

export type WeekdayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const WEEKDAY_PREFIX: Record<WeekdayName, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const WEEKDAY_LABEL: Record<WeekdayName, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const WEEKDAY_ALIASES: Record<string, WeekdayName> = {
  monday: "monday",
  mon: "monday",
  tuesday: "tuesday",
  tue: "tuesday",
  tues: "tuesday",
  wednesday: "wednesday",
  wed: "wednesday",
  thursday: "thursday",
  thu: "thursday",
  thur: "thursday",
  thurs: "thursday",
  friday: "friday",
  fri: "friday",
  saturday: "saturday",
  sat: "saturday",
  sunday: "sunday",
  sun: "sunday",
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

function normalizeWeekdayName(value: string | undefined): WeekdayName | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase().replace(/[.,]/g, "");
  return WEEKDAY_ALIASES[normalized];
}

const MONTH_ALIASES: Record<string, string> = {
  january: "jan",
  february: "feb",
  march: "mar",
  april: "apr",
  may: "may",
  june: "jun",
  july: "jul",
  august: "aug",
  september: "sep",
  october: "oct",
  november: "nov",
  december: "dec",
};

function expandDateQueryVariants(query: string) {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  const variants = new Set<string>([normalized]);

  for (const [full, short] of Object.entries(MONTH_ALIASES)) {
    if (normalized.includes(full)) {
      variants.add(normalized.replace(full, short));
    }
  }

  const ymd = query.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    variants.add(
      formatTripDayLabel(`${ymd[1]}-${ymd[2]}-${ymd[3]}`).toLowerCase(),
    );
  }

  const slash = query.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slash) {
    const year = slash[3]
      ? slash[3].length === 2
        ? `20${slash[3]}`
        : slash[3]
      : "2026";
    const month = slash[1].padStart(2, "0");
    const day = slash[2].padStart(2, "0");
    variants.add(formatTripDayLabel(`${year}-${month}-${day}`).toLowerCase());
  }

  return [...variants];
}

function tripDayLabelFromDateQuery(dateQuery: string) {
  const trimmed = dateQuery.trim();
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    return formatTripDayLabel(trimmed);
  }

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slash) {
    const year = slash[3]
      ? slash[3].length === 2
        ? `20${slash[3]}`
        : slash[3]
      : "2026";
    const month = slash[1].padStart(2, "0");
    const day = slash[2].padStart(2, "0");
    return formatTripDayLabel(`${year}-${month}-${day}`);
  }

  return null;
}

function eventMatchesDateQuery(eventDate: string, dateQuery: string) {
  const eventLower = eventDate.toLowerCase();
  return expandDateQueryVariants(dateQuery).some(
    (variant) => eventLower === variant || eventLower.includes(variant),
  );
}

function eventMatchesWeekdayPrefix(eventDate: string, weekdayPrefix: string) {
  return new RegExp(`^${weekdayPrefix}\\b`, "i").test(eventDate);
}

function resolveScheduleFilter(filter?: ScheduleFilter): {
  relativeDay?: RelativeTripDay;
  weekdayPrefix?: string;
  dateQuery?: string;
  resolvedLabel?: string;
} {
  const weekdayFromParam = filter?.weekday
    ? WEEKDAY_PREFIX[filter.weekday]
    : undefined;
  const weekdayFromDate = normalizeWeekdayName(filter?.date);
  const weekdayPrefix = weekdayFromParam ?? (
    weekdayFromDate ? WEEKDAY_PREFIX[weekdayFromDate] : undefined
  );

  if (weekdayPrefix) {
    const weekdayName = filter?.weekday ?? weekdayFromDate;
    return {
      weekdayPrefix,
      resolvedLabel: weekdayName
        ? WEEKDAY_LABEL[weekdayName]
        : weekdayPrefix,
    };
  }

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
  const { relativeDay, weekdayPrefix, dateQuery, resolvedLabel } =
    resolveScheduleFilter(filter);
  let events = tripEvents;

  if (weekdayPrefix) {
    events = events.filter((event) =>
      eventMatchesWeekdayPrefix(event.date, weekdayPrefix),
    );
  } else if (relativeDay) {
    const dayLabel = tripDayLabelForRelative(relativeDay);
    events = events.filter((event) => event.date === dayLabel);
  } else if (dateQuery) {
    const exactDayLabel = tripDayLabelFromDateQuery(dateQuery);
    events = events.filter((event) =>
      exactDayLabel
        ? event.date === exactDayLabel
        : eventMatchesDateQuery(event.date, dateQuery),
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
