import {
  ahlaAllSessions,
  ahlaContacts,
  ahlaFullSchedule,
  ahlaKeySessions,
  ahlaNetworkingEvents,
  type AhlaContactStatus,
  type AhlaScheduleDay,
} from "./kavi-ahla-context";

export type AhlaEventPriority = "must-attend" | "recommended" | "networking";

export type AhlaEventSpeaker = {
  name: string;
  firm?: string;
  status?: AhlaContactStatus;
};

export type AhlaEventCard = {
  id: string;
  sessionId?: string;
  title: string;
  dayLabel: string;
  timeLabel: string;
  kind: "session" | "networking" | "general" | "meal";
  priority?: AhlaEventPriority;
  speakers: AhlaEventSpeaker[];
  tip?: string;
  repeatNote?: string;
  included?: boolean;
  sponsor?: string;
};

export type AhlaEventsToolOutput =
  | { found: false; error: string }
  | {
      found: true;
      intro?: string;
      groupLabel?: string;
      events: AhlaEventCard[];
    };

export type AhlaEventsFilter = {
  priority?: AhlaEventPriority;
  day?: "sun" | "mon" | "tue" | "wed";
  kind?: "session" | "networking" | "general" | "meal";
  sessionIds?: string[];
  contactName?: string;
  mustAttendOnly?: boolean;
};

const MUST_ATTEND_SESSION_IDS = new Set(["9", "18", "20", "26"]);

const SESSION_TIPS: Record<string, string> = {
  "year-in-review":
    "Kim Looney is on the panel — hang back after and mention interest in EBG's SF health-care group.",
  "9": "Most important single session for EBG. Approach George Breen afterward with a genuine question and SF office interest.",
  "18": "Felicia Sze — top near-term target, warm intro via Hoyt.",
  "20": "Anchor contact Hoyt Sze — reinforce the relationship; mention you came for his panel.",
  "26": "Benesch Friedlander is a top near-term NY target — Rachel Hold-Weiss leads this panel.",
  "11": "Planned contact Alicia Macklin speaks — attend then introduce yourself.",
  "13": "Confirmed contact Caroline Farrell speaks alongside Charles Luband (Dentons).",
  "5": "Planned contact Judith Waltz — catch Mon or Tue repeat.",
  "4": "Jennifer Eilemberg (Stout) — connector on your radar; built-in approach after panel.",
  "33": "Margia Corner (Sheppard) — reachable via Hoyt. Pick this if Waltz caught Monday.",
  "40": "Steven Chiu (Manatt) — Big Law CA partner via Hoyt thread.",
};

const NETWORKING_TIPS: Record<string, string> = {
  "sun-welcome":
    "Laura Alfredo's GNYHA co-hosts — meet her on home turf before Dine-Arounds.",
  "sun-dine-arounds":
    "Highest-priority newcomer event. Teshia Birts' world — self-pay group dinners.",
  "sun-membership":
    "David Cade speaks — good visibility before seeking intro via Hoyt.",
  "mon-breakfast":
    "Arrive ~7:10, sit at partially-full tables. Active networking ~7:00–7:55 before welcome at 8:00.",
  "mon-moma":
    "Big Law partners socializing — long-game relationship building.",
  "tue-breakfast":
    "Same playbook as Monday breakfast — low-pressure serendipity.",
  "tue-reception":
    "Included networking block — good for volume reps after targeted sessions.",
  "wed-doj":
    "David Cade moderates — natural post-session window for intro via Hoyt.",
};

function normalizeSpeakerName(name: string) {
  return name.replace(/\s+/g, " ").trim().toLowerCase();
}

function isPlaceholderFirm(firm?: string) {
  if (!firm?.trim()) {
    return true;
  }
  const lower = firm.trim().toLowerCase();
  return lower === "unknown" || lower === "unverified";
}

function expandFirmName(firm: string) {
  const abbrev: Record<string, string> = {
    EBG: "Epstein Becker Green",
  };
  return abbrev[firm.trim()] ?? firm.trim();
}

/** Known affiliations for agenda speakers (key sessions + general sessions). */
function buildSpeakerFirmLookup(): Record<string, string> {
  const lookup: Record<string, string> = {
    "mark kopson": "Plunkett Cooney",
    "david s. cade": "AHLA",
    "david cade": "AHLA",
    "robert g. homchick": "GNYHA",
    "kim harvey looney": "Epstein Becker Green",
    "cynthia f. wisner": "GNYHA",
    "charles luband": "Dentons",
    "lisa noller": "Foley & Lardner",
    "annie shieh": "King & Spalding",
    "jennifer eilemberg": "Stout",
    "brenton hill": "Coalition for Health AI",
    "julia michael": "K Health",
    "patrick o'rourke": "University of California",
    "hillary loeffler": "Polsinelli",
    "brandon helms": "Baker Donelson",
    "trestney manning": "Hall Render",
    "suzanne strothkamp": "Quarles & Brady",
  };

  for (const session of [...ahlaKeySessions, ...ahlaAllSessions]) {
    for (const raw of session.speakers) {
      const paren = raw.match(/^(.+?)\s*\((.+)\)$/);
      if (paren) {
        lookup[normalizeSpeakerName(paren[1])] = expandFirmName(paren[2]);
      }
    }
  }

  return lookup;
}

const SPEAKER_FIRMS = buildSpeakerFirmLookup();
const KEY_SESSION_SPEAKERS = new Map(
  ahlaKeySessions.map((session) => [session.id, session.speakers]),
);

function contactBySpeakerName(name: string) {
  const normalized = name.toLowerCase().trim();
  const paren = normalized.match(/^(.+?)\s*\(/);
  const cleanName = (paren?.[1] ?? normalized).trim();

  return ahlaContacts.find((c) => {
    const contact = c.name.toLowerCase();
    return cleanName === contact || cleanName.includes(contact);
  });
}

function speakersFromNames(names: string[]): AhlaEventSpeaker[] {
  return names.map((raw) => {
    const paren = raw.match(/^(.+?)\s*\((.+)\)$/);
    const parsedName = paren?.[1].trim() ?? raw.trim();
    const parsedFirm = paren?.[2]?.trim();

    const contact = contactBySpeakerName(parsedName);
    const lookupFirm = SPEAKER_FIRMS[normalizeSpeakerName(parsedName)];

    let firm = parsedFirm ?? lookupFirm;
    if (!firm && contact && !isPlaceholderFirm(contact.firm)) {
      firm = contact.firm;
    }
    if (firm) {
      firm = expandFirmName(firm);
    }

    const speaker: AhlaEventSpeaker = {
      name: contact?.name ?? parsedName,
      ...(firm && !isPlaceholderFirm(firm) ? { firm } : {}),
      ...(contact?.status ? { status: contact.status } : {}),
    };

    return speaker;
  });
}

function normalizeDayLabel(label: string) {
  return label.replace(/,\s*/g, " ").trim();
}

function parseSessionTime(times: string): { dayLabel: string; timeLabel: string; repeatNote?: string } {
  const parts = times.split(",").map((p) => p.trim());
  const primary = parts[0] ?? times;
  const repeatNote =
    parts.length > 1 ? `Also: ${parts.slice(1).join("; ")}` : undefined;

  const dayMatch = primary.match(/^(Sun|Mon|Tue|Wed)\s+(.+)$/i);
  if (dayMatch) {
    const dayMap: Record<string, string> = {
      sun: "Sun Jun 28",
      mon: "Mon Jun 29",
      tue: "Tue Jun 30",
      wed: "Wed Jul 1",
    };
    const dayKey = dayMatch[1].toLowerCase();
    return {
      dayLabel: dayMap[dayKey] ?? dayMatch[1],
      timeLabel: dayMatch[2],
      repeatNote,
    };
  }

  return { dayLabel: "AHLA", timeLabel: primary, repeatNote };
}

function buildSessionCards(): AhlaEventCard[] {
  const keyIds = new Set(ahlaKeySessions.map((s) => s.id));

  return ahlaAllSessions
    .filter((s) => keyIds.has(s.id) || MUST_ATTEND_SESSION_IDS.has(s.id))
    .map((session) => {
      const { dayLabel, timeLabel, repeatNote } = parseSessionTime(session.times);
      const priority = MUST_ATTEND_SESSION_IDS.has(session.id)
        ? ("must-attend" as const)
        : ("recommended" as const);

      return {
        id: `session-${session.id}`,
        sessionId: session.id,
        title: session.title,
        dayLabel,
        timeLabel,
        kind: "session" as const,
        priority,
        speakers: speakersFromNames(
          KEY_SESSION_SPEAKERS.get(session.id) ?? session.speakers,
        ),
        tip: SESSION_TIPS[session.id] ?? session.notes,
        repeatNote,
      };
    });
}

function dayLabelFromScheduleDay(day: AhlaScheduleDay) {
  const [year, month, d] = day.date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, d, 12, 0, 0));
  return normalizeDayLabel(
    utc.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  );
}

function buildGeneralSessionCards(): AhlaEventCard[] {
  const cards: AhlaEventCard[] = [];

  for (const day of ahlaFullSchedule) {
    for (const entry of day.entries) {
      if (entry.category !== "general-session" || !entry.kaviRelevant) {
        continue;
      }

      const dayLabel = dayLabelFromScheduleDay(day);
      const id =
        entry.title.includes("Year In Review")
          ? "year-in-review"
          : entry.title.includes("DOJ")
            ? "wed-doj"
            : entry.title.toLowerCase().replace(/\s+/g, "-");

      cards.push({
        id: `general-${id}`,
        title: entry.title,
        dayLabel,
        timeLabel: entry.time,
        kind: "general",
        priority:
          id === "year-in-review" ? "must-attend" : id === "wed-doj" ? "recommended" : undefined,
        speakers: speakersFromNames(entry.speakers ?? []),
        tip: SESSION_TIPS[id] ?? entry.notes,
        included: entry.included,
        sponsor: entry.sponsor,
      });
    }
  }

  return cards;
}

function buildNetworkingCards(): AhlaEventCard[] {
  const idMap: Record<string, string> = {
    "Welcome Reception": "sun-welcome",
    "Dine-Arounds": "sun-dine-arounds",
    "State of the Association": "sun-membership",
    "Conference Breakfast": "mon-breakfast",
    "MoMA": "mon-moma",
    "Networking Reception": "tue-reception",
    "DOJ, OIG and CMS": "wed-doj",
  };

  return ahlaNetworkingEvents
    .filter(
      (e) =>
        e.title.includes("Welcome") ||
        e.title.includes("Dine-Around") ||
        e.title.includes("Membership") ||
        e.title.includes("Breakfast") ||
        e.title.includes("MoMA") ||
        e.title.includes("Networking Reception") ||
        e.title.includes("DOJ"),
    )
    .map((event) => {
      const key =
        Object.entries(idMap).find(([k]) => event.title.includes(k))?.[1] ??
        event.when.replace(/\s+/g, "-").toLowerCase();

      const whenParts = event.when.match(/^(\w+ \w+ \d+),?\s*(.+)$/);
      const dayLabel = normalizeDayLabel(
        whenParts?.[1] ?? event.when.split(",")[0] ?? event.when,
      );
      const timeLabel = whenParts?.[2] ?? "";

      return {
        id: `networking-${key}`,
        title: event.title.split("(")[0]?.trim() ?? event.title,
        dayLabel,
        timeLabel,
        kind: "networking" as const,
        priority: "networking" as const,
        speakers: [],
        tip: NETWORKING_TIPS[key] ?? event.notes,
        included: !event.notes.includes("NOT included"),
      };
    });
}

const AHLA_EVENT_CATALOG: AhlaEventCard[] = [
  ...buildGeneralSessionCards(),
  ...buildSessionCards(),
  ...buildNetworkingCards(),
];

function dayMatches(event: AhlaEventCard, day: AhlaEventsFilter["day"]) {
  if (!day) {
    return true;
  }
  const map: Record<NonNullable<AhlaEventsFilter["day"]>, string> = {
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
  };
  return event.dayLabel.toLowerCase().startsWith(map[day].toLowerCase());
}

function sortEvents(events: AhlaEventCard[]) {
  const dayOrder = ["Sun Jun 28", "Mon Jun 29", "Tue Jun 30", "Wed Jul 1"];
  const priorityOrder: Record<string, number> = {
    "must-attend": 0,
    recommended: 1,
    networking: 2,
  };

  return [...events].sort((a, b) => {
    const dayA = dayOrder.findIndex((d) => a.dayLabel.startsWith(d.slice(0, 3)));
    const dayB = dayOrder.findIndex((d) => b.dayLabel.startsWith(d.slice(0, 3)));
    if (dayA !== dayB) {
      return dayA - dayB;
    }
    const priA = priorityOrder[a.priority ?? "recommended"] ?? 2;
    const priB = priorityOrder[b.priority ?? "recommended"] ?? 2;
    if (priA !== priB) {
      return priA - priB;
    }
    return a.timeLabel.localeCompare(b.timeLabel);
  });
}

export function buildAhlaEventsToolOutput(
  filter: AhlaEventsFilter = {},
): AhlaEventsToolOutput {
  let events = [...AHLA_EVENT_CATALOG];

  if (filter.mustAttendOnly || filter.priority === "must-attend") {
    events = events.filter((e) => e.priority === "must-attend");
  } else if (filter.priority) {
    events = events.filter((e) => e.priority === filter.priority);
  }

  if (filter.kind) {
    events = events.filter((e) => e.kind === filter.kind);
  }

  if (filter.day) {
    events = events.filter((e) => dayMatches(e, filter.day));
  }

  if (filter.sessionIds?.length) {
    const ids = new Set(filter.sessionIds);
    events = events.filter(
      (e) => e.sessionId && ids.has(e.sessionId),
    );
  }

  if (filter.contactName?.trim()) {
    const query = filter.contactName.trim().toLowerCase();
    events = events.filter((e) =>
      e.speakers.some((s) => s.name.toLowerCase().includes(query)),
    );
  }

  events = sortEvents(events);

  if (events.length === 0) {
    return {
      found: false,
      error:
        "No AHLA events matched that lookup. Retry with broader criteria — e.g. pass only day, or drop mustAttendOnly/priority filters.",
    };
  }

  const groupLabel =
    filter.mustAttendOnly || filter.priority === "must-attend"
      ? "Must-attend"
      : filter.priority === "networking"
        ? "Networking"
        : undefined;

  return {
    found: true,
    groupLabel,
    events,
  };
}
