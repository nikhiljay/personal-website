import { type TripEvent, tripStops } from "./ahla-nyc-trip";

const TRIP_TIMEZONE = "America/New_York";
const TRIP_START = new Date("2026-06-26T00:00:00-04:00");
const TRIP_END = new Date("2026-07-03T00:00:00-04:00");

export const CALENDAR_REVALIDATE_SECONDS = 900;

const WINDOWS_TIMEZONES: Record<string, string> = {
  "Pacific Standard Time": "America/Los_Angeles",
  "Eastern Standard Time": "America/New_York",
  "Central Standard Time": "America/Chicago",
};

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
};

type ParsedIcsEvent = {
  uid: string;
  summary: string;
  location: string;
  status?: string;
  start: Date;
};

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

  const tzid = rawKey.match(/TZID=([^;:]+)/)?.[1];
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

  const timeZone = WINDOWS_TIMEZONES[tzid ?? ""] ?? "America/New_York";
  return zonedTimeToUtc(localIso, timeZone);
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

function formatEventDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    timeZone: TRIP_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatEventTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    timeZone: TRIP_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
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

function isTripEvent(event: ParsedIcsEvent) {
  if (event.status === "CANCELLED") {
    return false;
  }

  return event.start >= TRIP_START && event.start < TRIP_END;
}

function toTripEvent(event: ParsedIcsEvent): TripEvent {
  const summary = cleanIcsText(event.summary || "Untitled");
  const location = cleanIcsText(event.location);
  const stopId = matchStop(summary, location);

  return {
    id: event.uid || `${summary}-${event.start.toISOString()}`,
    title: summary,
    date: formatEventDate(event.start),
    time: formatEventTime(event.start),
    stopId,
    note: !stopId && location ? locationNote(location) : undefined,
  };
}

async function fetchCalendarIcs() {
  const url = process.env.KAVI_TRIP_CALENDAR_ICAL_URL;
  if (!url) {
    throw new Error("KAVI_TRIP_CALENDAR_ICAL_URL is not set");
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

  return parseIcsEvents(ics)
    .filter(isTripEvent)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(toTripEvent);
}
