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
  weekdayQualifier?: WeekdayQualifier;
};

export type WeekdayQualifier = "this" | "next";

export type WeekdayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

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

const WEEKDAY_JS: Record<WeekdayName, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
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

function dowInTripTimezone(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = utc.toLocaleDateString("en-US", {
    timeZone: TRIP_TIMEZONE,
    weekday: "short",
  });
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday] ?? 0;
}

function daysUntilWeekday(
  referenceYmd: string,
  weekday: WeekdayName,
  qualifier: WeekdayQualifier,
) {
  const refDow = dowInTripTimezone(referenceYmd);
  const targetDow = WEEKDAY_JS[weekday];
  let daysUntil = (targetDow - refDow + 7) % 7;

  if (qualifier === "next") {
    // "Next Sunday" on Saturday skips this Sunday (+8d), not tomorrow.
    daysUntil = daysUntil === 0 ? 7 : daysUntil + 7;
  }

  return daysUntil;
}

export function tripDayLabelForWeekday(
  weekday: WeekdayName,
  qualifier: WeekdayQualifier = "this",
  referenceYmd = ymdInTripTimezone(),
) {
  const daysUntil = daysUntilWeekday(referenceYmd, weekday, qualifier);
  return formatTripDayLabel(addDaysToYmd(referenceYmd, daysUntil));
}

function parseWeekdayQuery(value: string | undefined):
  | { weekday: WeekdayName; qualifier: WeekdayQualifier }
  | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  let text = value.trim().toLowerCase().replace(/[.,]/g, "");
  let qualifier: WeekdayQualifier = "this";

  if (text.startsWith("next ")) {
    qualifier = "next";
    text = text.slice(5).trim();
  } else if (text.startsWith("this ")) {
    qualifier = "this";
    text = text.slice(5).trim();
  }

  const weekday = WEEKDAY_ALIASES[text];
  if (!weekday) {
    return undefined;
  }

  return { weekday, qualifier };
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

const MONTH_SHORT: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

const SCHEDULE_LABEL_RE =
  /^[A-Za-z]{3},\s*([A-Za-z]{3})\s+(\d{1,2})$/;

function tripDayLabelFromScheduleLabel(label: string) {
  const match = label.trim().match(SCHEDULE_LABEL_RE);
  if (!match) {
    return null;
  }

  const month = MONTH_SHORT[match[1].toLowerCase().slice(0, 3)];
  if (!month) {
    return null;
  }

  const day = match[2].padStart(2, "0");
  return formatTripDayLabel(`2026-${month}-${day}`);
}

function tripDayLabelFromDateQuery(dateQuery: string) {
  const trimmed = dateQuery.trim();
  const fromScheduleLabel = tripDayLabelFromScheduleLabel(trimmed);
  if (fromScheduleLabel) {
    return fromScheduleLabel;
  }

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

function resolveScheduleFilter(filter?: ScheduleFilter): {
  relativeDay?: RelativeTripDay;
  weekdayDayLabel?: string;
  exactDayLabel?: string;
  dateQuery?: string;
  resolvedLabel?: string;
} {
  const dateTrimmed = filter?.date?.trim();
  if (dateTrimmed) {
    const exactLabel = tripDayLabelFromDateQuery(dateTrimmed);
    if (exactLabel) {
      return {
        exactDayLabel: exactLabel,
        resolvedLabel: exactLabel,
      };
    }

    const relativeFromDate = normalizeRelativeDayFromText(dateTrimmed);
    if (relativeFromDate) {
      return {
        relativeDay: relativeFromDate,
        resolvedLabel: tripDayLabelForRelative(relativeFromDate),
      };
    }

    const parsedWeekdayFromDate = parseWeekdayQuery(dateTrimmed);
    if (parsedWeekdayFromDate && !/\d/.test(dateTrimmed)) {
      const qualifier =
        filter?.weekdayQualifier ?? parsedWeekdayFromDate.qualifier;
      const dayLabel = tripDayLabelForWeekday(
        parsedWeekdayFromDate.weekday,
        qualifier,
      );
      return {
        weekdayDayLabel: dayLabel,
        resolvedLabel: `${qualifier === "next" ? "Next " : ""}${WEEKDAY_LABEL[parsedWeekdayFromDate.weekday]} (${dayLabel})`,
      };
    }

    return {
      dateQuery: dateTrimmed,
      resolvedLabel: dateTrimmed,
    };
  }

  if (filter?.weekday) {
    const qualifier = filter?.weekdayQualifier ?? "this";
    const dayLabel = tripDayLabelForWeekday(filter.weekday, qualifier);
    return {
      weekdayDayLabel: dayLabel,
      resolvedLabel: `${qualifier === "next" ? "Next " : ""}${WEEKDAY_LABEL[filter.weekday]} (${dayLabel})`,
    };
  }

  const relativeFromParam = normalizeRelativeDayFromText(filter?.relativeDay);
  if (relativeFromParam) {
    return {
      relativeDay: relativeFromParam,
      resolvedLabel: tripDayLabelForRelative(relativeFromParam),
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
  const { relativeDay, weekdayDayLabel, exactDayLabel, dateQuery, resolvedLabel } =
    resolveScheduleFilter(filter);
  let events = tripEvents;

  if (exactDayLabel) {
    events = events.filter((event) => event.date === exactDayLabel);
  } else if (weekdayDayLabel) {
    events = events.filter((event) => event.date === weekdayDayLabel);
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
