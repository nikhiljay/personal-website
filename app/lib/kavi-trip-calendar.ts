import { type TripEvent, tripStops } from "./kavi-nyc-trip";

const TRIP_TIMEZONE = "America/New_York";
const SF_TIMEZONE = "America/Los_Angeles";
const TRIP_START = new Date("2026-06-25T00:00:00-04:00");
const TRIP_END = new Date("2026-07-04T00:00:00-04:00");

export const CALENDAR_REVALIDATE_SECONDS = 900;

const stopPatterns: Record<string, RegExp[]> = {
  hilton: [
    /hilton/i,
    /lcdp/i,
    /conference day/i,
    /awards dinner/i,
    /dine-around/i,
    /network reception/i,
    /welcome reception/i,
  ],
  "il-gattopardo": [/gattopardo/i],
  limani: [/limani/i, /rockefeller plaza/i],
  moma: [/moma/i],
  paley: [/paley/i],
  "thai-diner": [/thai diner/i],
  musaafer: [/musaafer/i],
  tartinery: [/tartinery/i],
  "jacks-wife-freda": [/jack'?s wife freda/i],
};

type ParsedIcsEvent = {
  uid: string;
  summary: string;
  location: string;
  status?: string;
  start: Date;
};

const STATIC_EVENT_URLS: Record<string, string> = {
  "flight-outbound-dl365":
    "https://live.flighty.app/22b947272-3ac9-461b-b67d-8205cd341685",
  "flight-return-dl679":
    "https://live.flighty.app/28d386992-f86a-47b3-bf95-268dd3f971a7",
};

const CALENDAR_EVENT_EXCLUSIONS = [
  /jd health law advising/i,
  /flight\s+jfk\s*(?:-->|→|->)\s*sfo/i,
];

/** Coarse calendar blocks replaced by granular static entries. */
const CALENDAR_EVENT_REPLACEMENTS: { ymd: string; pattern: RegExp }[] = [
  { ymd: "2026-06-29", pattern: /^conference day 1$/i },
  { ymd: "2026-06-30", pattern: /^conference day 2$/i },
];

const STATIC_TRIP_EVENTS: ParsedIcsEvent[] = [
  {
    uid: "flight-outbound-dl365",
    summary: "Fly to NYC",
    location: "DL 365 · SFO 10:40 PM → JFK 6:53 AM",
    start: new Date("2026-06-25T22:40:00-07:00"),
  },
  {
    uid: "solo-adventure-jun-26",
    summary: "Solo adventure",
    location: "",
    start: new Date("2026-06-26T19:00:00-04:00"),
  },
  {
    uid: "flight-return-dl679",
    summary: "Fly home",
    location: "DL 679 · JFK 2:55 PM → SFO 6:30 PM",
    start: new Date("2026-07-03T14:55:00-04:00"),
  },
  {
    uid: "july-4-weekend-sf",
    summary: "Enjoy 4th of July weekend with Nikhil!",
    location: "",
    start: new Date("2026-07-03T18:30:00-07:00"),
  },
  {
    uid: "mon-jun-29-life-sciences",
    summary:
      "Session 2: Evolving Rules, Expanding Risks: Regulatory and Compliance Challenges in Life Sciences",
    location: "Hilton Midtown",
    start: new Date("2026-06-29T13:45:00-04:00"),
  },
  {
    uid: "mon-jun-29-health-care-ai",
    summary: "Session 11: Health Care AI is Hot, Legal Risk is Not",
    location: "Hilton Midtown",
    start: new Date("2026-06-29T15:15:00-04:00"),
  },
  {
    uid: "mon-jun-29-felicia-sze",
    summary:
      "Session 18: Real or Imagined — Legal Ethical Issues in Providing F&A Advice",
    location: "Hilton Midtown",
    start: new Date("2026-06-29T16:45:00-04:00"),
  },
  {
    uid: "tue-jun-30-health-care-ai",
    summary: "Session 11: Health Care AI is Hot, Legal Risk is Not",
    location: "Hilton Midtown",
    start: new Date("2026-06-30T10:45:00-04:00"),
  },
  {
    uid: "tue-jun-30-womens-health",
    summary: "Session 30: Navigating the Women's Health Triumvirate",
    location: "Hilton Midtown",
    start: new Date("2026-06-30T10:45:00-04:00"),
  },
];

function unfoldIcs(text: string) {
  const lines: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }

  return lines;
}

function parseIcsDateTime(rawKey: string, value: string) {
  if (rawKey.includes("VALUE=DATE") || value.length === 8) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const hour = Number(value.slice(9, 11));
  const minute = Number(value.slice(11, 13));
  const second = value.length >= 15 ? Number(value.slice(13, 15)) : 0;
  const localIso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;

  if (value.endsWith("Z")) {
    return new Date(`${localIso}Z`);
  }

  // Kavi's NYC trip ICS tags DTSTART with Pacific TZID, but the clock times are
  // Eastern (event times in NYC). Parse as ET — do not add a PT→ET offset.
  return zonedTimeToUtc(localIso, TRIP_TIMEZONE);
}

function zonedTimeToUtc(localIso: string, timeZone: string) {
  const localDate = new Date(`${localIso}Z`);
  const utcDate = new Date(localDate.toLocaleString("en-US", { timeZone: "UTC" }));
  const zonedDate = new Date(localDate.toLocaleString("en-US", { timeZone }));
  return new Date(localDate.getTime() + (utcDate.getTime() - zonedDate.getTime()));
}

function parseIcsEvents(text: string): ParsedIcsEvent[] {
  const events: ParsedIcsEvent[] = [];
  let current: Partial<ParsedIcsEvent> & Record<string, string> = {};
  let inEvent = false;

  for (const line of unfoldIcs(text)) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (inEvent && current.summary && current.startIso) {
        events.push({
          uid: current.uid ?? `${current.summary}-${current.startIso}`,
          summary: current.summary,
          location: current.location ?? "",
          status: current.status,
          start: parseIcsDateTime(current.startKey ?? "DTSTART", current.startIso),
        });
      }

      inEvent = false;
      current = {};
      continue;
    }

    if (!inEvent || !line.includes(":")) {
      continue;
    }

    const [rawKey, ...valueParts] = line.split(":");
    const value = valueParts.join(":");
    const key = rawKey.split(";")[0];

    if (key === "DTSTART") {
      current.startKey = rawKey;
      current.startIso = value;
    } else if (key === "SUMMARY") {
      current.summary = value;
    } else if (key === "LOCATION") {
      current.location = value;
    } else if (key === "UID") {
      current.uid = value;
    } else if (key === "STATUS") {
      current.status = value;
    }
  }

  return events;
}

function formatEventDate(date: Date, timeZone = TRIP_TIMEZONE) {
  return date.toLocaleDateString("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatEventTime(date: Date, timeZone = TRIP_TIMEZONE) {
  return date.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
}

function eventTimeZone(event: ParsedIcsEvent) {
  if (
    event.uid === "flight-outbound-dl365" ||
    event.uid === "july-4-weekend-sf"
  ) {
    return SF_TIMEZONE;
  }

  return TRIP_TIMEZONE;
}

function cleanIcsText(value: string) {
  return value.replace(/\\,/g, ",").replace(/\\n/g, " ").trim();
}

function matchStop(summary: string, location: string) {
  const text = `${summary} ${location}`;

  for (const stop of tripStops) {
    const patterns = stopPatterns[stop.id] ?? [new RegExp(stop.name, "i")];
    if (patterns.some((pattern) => pattern.test(text))) {
      return stop.id;
    }
  }

  return undefined;
}

function locationNote(location: string) {
  const cleaned = cleanIcsText(location);
  if (!cleaned) {
    return undefined;
  }

  const venue = cleaned.split("(")[0]?.trim();
  return venue || cleaned;
}

function eventYmdInTripTimezone(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: TRIP_TIMEZONE });
}

function isExcludedCalendarEvent(event: ParsedIcsEvent) {
  const summary = cleanIcsText(event.summary);
  if (CALENDAR_EVENT_EXCLUSIONS.some((pattern) => pattern.test(summary))) {
    return true;
  }

  const ymd = eventYmdInTripTimezone(event.start);
  return CALENDAR_EVENT_REPLACEMENTS.some(
    (replacement) =>
      replacement.ymd === ymd && replacement.pattern.test(summary),
  );
}

function isTripEvent(event: ParsedIcsEvent) {
  if (event.status === "CANCELLED") {
    return false;
  }

  if (isExcludedCalendarEvent(event)) {
    return false;
  }

  return event.start >= TRIP_START && event.start < TRIP_END;
}

function toTripEvent(event: ParsedIcsEvent): TripEvent {
  const summary = cleanIcsText(event.summary || "Untitled");
  const location = cleanIcsText(event.location);
  const stopId = matchStop(summary, location);
  const isStaticEvent = STATIC_TRIP_EVENTS.some((entry) => entry.uid === event.uid);
  const displayTimeZone = isStaticEvent ? eventTimeZone(event) : TRIP_TIMEZONE;

  return {
    id: event.uid || `${summary}-${event.start.toISOString()}`,
    title: summary,
    date: formatEventDate(event.start, displayTimeZone),
    time: formatEventTime(event.start, displayTimeZone),
    startsAt: event.start.toISOString(),
    stopId,
    note: !stopId && location ? locationNote(location) : undefined,
    url: STATIC_EVENT_URLS[event.uid],
  };
}

async function fetchCalendarIcs() {
  const url = process.env.KAVI_TRIP_CALENDAR_ICAL_URL;
  if (!url) {
    return null;
  }

  const response = await fetch(url, {
    next: { revalidate: CALENDAR_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Calendar fetch failed: ${response.status}`);
  }

  return response.text();
}

export async function getTripEventsFromCalendar(): Promise<TripEvent[]> {
  const ics = await fetchCalendarIcs();

  return [...(ics ? parseIcsEvents(ics) : []), ...STATIC_TRIP_EVENTS]
    .filter(isTripEvent)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(toTripEvent);
}
