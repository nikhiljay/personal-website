export type AhlaContactStatus = "confirmed" | "planned" | "prospect" | "connector";
export type AhlaFirmTier = "big-law" | "mid-sized" | "in-house" | "solo" | "association" | "advisory" | "unverified";
export type AhlaMarket = "ny" | "ca" | "other";

export type AhlaContact = {
  name: string;
  firm: string;
  title?: string;
  status: AhlaContactStatus;
  tier: AhlaFirmTier;
  market: AhlaMarket;
  rationale: string;
  notes?: string;
};

export type AhlaConnector = {
  priority: number;
  name: string;
  firm: string;
  title: string;
  rationale: string;
  access: "direct" | "via-hoyt" | "via-laura" | "session";
  notes?: string;
};

export type AhlaSession = {
  id: string;
  title: string;
  speakers: string[];
  times: string;
  notes?: string;
};

export type AhlaNetworkingEvent = {
  when: string;
  title: string;
  notes: string;
};

export type AhlaScheduleEntry = {
  time: string;
  title: string;
  category:
    | "check-in"
    | "optional-paid"
    | "general-session"
    | "concurrent"
    | "networking"
    | "meal"
    | "break";
  sessionId?: string;
  speakers?: string[];
  sponsor?: string;
  included?: boolean;
  notes?: string;
  /** Kavi-relevant: contact speaking, connector event, or strategic target */
  kaviRelevant?: boolean;
};

export type AhlaScheduleDay = {
  date: string;
  label: string;
  entries: AhlaScheduleEntry[];
};

export const ahlaConferenceMeta = {
  name: "AHLA Annual Meeting 2026",
  venue: "New York Hilton Midtown, New York NY",
  dates: "Sun Jun 28 – Wed Jul 1, 2026 (optional pre-programs Sat Jun 27)",
  scheduleSource: "AM26_Printable-5-7.pdf (draft as of 5/7/26)",
  kaviAttendance: "From Sunday Jun 28 onward",
};

/** Kavi's hiring strategy and conference mindset at AHLA 2026. */
export const ahlaGoals = {
  conference: `${ahlaConferenceMeta.name}, ${ahlaConferenceMeta.dates} @ ${ahlaConferenceMeta.venue}. ${ahlaConferenceMeta.kaviAttendance}.`,
  northStar:
    "Land a mid-to-big law associate job straight out of law school. Kavi starts 3L this fall (Fall 2026) — recruiting window is now.",
  conferencePriority:
    "Maximize learning about health law — sit in strong panels, follow substantive threads, and absorb how practitioners actually think about the work. Networking is secondary right now; many attorneys have been cold or dismissive once they learn she's a student, so don't push a hustle-heavy playbook.",
  nearTerm:
    "Mid-sized and boutique health-law firms — realistic entry points straight out of law school (NY is densest: Benesch Friedlander, Axinn Veltrop).",
  longTerm:
    "Big Law relationship-building with partners (Arnold & Porter NY, Sheppard Mullin CA) even if offers come later.",
  jobTarget:
    "Epstein Becker Green (EBG) Associate, Health Care & Life Sciences, San Francisco — health-law powerhouse, hybrid between boutique depth and national platform.",
  networkingStyle:
    "When networking happens, prioritize warm paths (Hoyt Sze, confirmed/planned contacts, connectors). Don't grind cold intros — a lot of attorneys are giving her the cold shoulder once they hear 'student.' Follow energy; it's OK to bail on a dead conversation and go learn something instead.",
};

/** People to steer away from — background only; do not raise unprompted. */
export const ahlaAvoidContacts = [
  {
    name: "Cliff Barnes",
    firm: "Epstein Becker Green",
    title: "Retired partner",
    reason:
      "Called Kavi at 12:30am — inappropriate. Do not suggest meeting or warm intros. Never bring up unprompted. If EBG comes up, point to Kim Looney or George Breen instead.",
  },
];

/** In-the-moment conference reality — shapes tone and advice. */
export const ahlaConferenceMindset = {
  currentFocus:
    "Switched gears from networking-first to learning-first. Use the rest of the conference to build real health-law literacy — panels, Q&A, hallway takeaways — not to force every conversation into a job pitch.",
  onTheGround:
    "Many attorneys disregard her or go cold once they find out she's a law student. That's the live dynamic — normalize it, don't over-coach through it, and don't make her feel like she's failing at networking.",
  selfCare:
    "New city, long days, conference social pressure. Remind her to eat, sleep, hydrate, and keep her guard up — trust her instincts, leave situations that feel off, and it's fine to skip an event for downtime.",
};

export const ahlaContacts: AhlaContact[] = [
  {
    name: "Hoyt Sze",
    firm: "Sheppard Mullin",
    title: "Partner",
    status: "confirmed",
    tier: "big-law",
    market: "ca",
    rationale: "Anchor connector — planning committee, connected Kavi to a pre-conference dinner, UC OP alum pipeline to Big Law.",
    notes: "Speaks Tue 8:00–9:00 Session 20. Sister Felicia Sze at Athene Law.",
  },
  {
    name: "Valerie Cohen",
    firm: "Venable",
    title: "Partner",
    status: "confirmed",
    tier: "big-law",
    market: "ny",
    rationale: "Confirmed meeting — Big Law NY partner, long-term relationship target.",
  },
  {
    name: "Caroline Farrell",
    firm: "Unknown",
    status: "confirmed",
    tier: "unverified",
    market: "other",
    rationale: "Confirmed willing to meet.",
    notes: "Speaks Session 13 (Medicaid Transformation) Mon 3:15 & Tue 10:45 with Charles Luband.",
  },
  {
    name: "Marissa Fernandez",
    firm: "Unified Women's Healthcare",
    title: "Senior Counsel",
    status: "confirmed",
    tier: "in-house",
    market: "other",
    rationale: "Confirmed meeting — in-house, not a firm hire target but valuable network contact.",
  },
  {
    name: "Wahida Bhuyan",
    firm: "Office of Wahida Bhuyan, Esq.",
    title: "Solo practitioner",
    status: "confirmed",
    tier: "solo",
    market: "ny",
    rationale: "Confirmed meeting — solo/fractional counsel in Astoria NY.",
    notes: "Attendee file spells Wahida, not Wahita.",
  },
  {
    name: "Alicia Macklin",
    firm: "Hooper Lundy & Bookman PC",
    status: "planned",
    tier: "mid-sized",
    market: "ca",
    rationale: "Planned meeting — LA health-law boutique.",
    notes: "Speaks Session 11 (Health Care AI) Mon 3:15 & Tue 10:45.",
  },
  {
    name: "Judith Waltz",
    firm: "Foley & Lardner",
    title: "Partner",
    status: "planned",
    tier: "big-law",
    market: "ca",
    rationale: "Planned meeting — Big Law CA partner.",
    notes: "Speaks Session 5 (MA Compliance) Mon 1:45 & Tue 1:45.",
  },
  {
    name: "Alison Bassett",
    firm: "Best Best & Krieger",
    title: "Partner",
    status: "planned",
    tier: "mid-sized",
    market: "ca",
    rationale: "Planned meeting — mid-sized CA firm, near-term target.",
  },
  {
    name: "Carla Hartley",
    firm: "McLaughlin & Stern",
    title: "Shareholder",
    status: "planned",
    tier: "mid-sized",
    market: "ca",
    rationale: "Planned meeting — mid-sized CA firm.",
  },
  {
    name: "Joel Richlan",
    firm: "Unknown",
    status: "planned",
    tier: "unverified",
    market: "other",
    rationale: "Planned meeting — NOT found in attendee list; verify firm/details in person.",
  },
  {
    name: "Felicia Sze",
    firm: "Athene Law",
    title: "Managing Partner",
    status: "prospect",
    tier: "mid-sized",
    market: "ca",
    rationale: "Hoyt's sister — SF health-law boutique founder, strong near-term target. Not free before conference; meet at her session or via Hoyt intro.",
    notes: "Speaks Session 18 Mon 4:45 & Wed 11:30.",
  },
  {
    name: "George Breen",
    firm: "Epstein Becker Green",
    title: "Chair, Health Care & Life Sciences Practice",
    status: "prospect",
    tier: "big-law",
    market: "other",
    rationale: "EBG practice leader — direct line to SF health-care associate role Kavi is interested in.",
    notes: "Speaks Session 9 (Private Equity & FCA) Mon 3:15 & Wed 10:00. No EBG SF attorneys on attendee list.",
  },
  {
    name: "Margia Corner",
    firm: "Sheppard Mullin",
    title: "Partner",
    status: "prospect",
    tier: "big-law",
    market: "ca",
    rationale: "Sheppard Mullin CA partner — reachable via Hoyt.",
    notes: "Speaks Session 33 (DEI Programs) Tue 1:45 pm (no repeat). Clashes with Waltz repeat.",
  },
  {
    name: "Steven Chiu",
    firm: "Manatt",
    title: "Partner",
    status: "prospect",
    tier: "big-law",
    market: "ca",
    rationale: "Big Law CA partner — reachable via Hoyt/Sheppard thread.",
    notes: "Speaks Session 40 (No Surprises Act) Tue 4:30 pm (no repeat).",
  },
  {
    name: "Rachel Hold-Weiss",
    firm: "Benesch Friedlander",
    status: "prospect",
    tier: "mid-sized",
    market: "ny",
    rationale: "Benesch has 7 attendees and active healthcare group — top near-term NY target.",
    notes: "Speaks Session 26 (Hospices & Home Health) Tue 9:15 am (no repeat).",
  },
  {
    name: "Kim Harvey Looney",
    firm: "Epstein Becker Green",
    title: "Partner",
    status: "prospect",
    tier: "big-law",
    market: "other",
    rationale: "EBG partner, high visibility on Mon Year-in-Review (GNYHA-sponsored).",
    notes: "Mon 9:45–11:45 am general session with Robert Homchick, Cynthia Wisner.",
  },
];

/** Connectors ranked by leverage × accessibility. */
export const ahlaConnectors: AhlaConnector[] = [
  {
    priority: 1,
    name: "Teshia Birts",
    firm: "AHLA",
    title: "Director of Member and Volunteer Inclusion & Engagement",
    rationale: "Her job is onboarding emerging members — highest-fit, lowest-friction connector.",
    access: "direct",
    notes: "Early-career Dine-Arounds Sun 6:30 pm is her world.",
  },
  {
    priority: 2,
    name: "Laura Alfredo",
    firm: "Greater New York Hospital Association",
    title: "EVP, Legal & General Counsel",
    rationale: "NY hospital-system hub — relationships with GCs at Mount Sinai, Northwell, NYP, MSK. Co-hosts Sun Welcome Reception.",
    access: "direct",
    notes: "Kavi is reaching out.",
  },
  {
    priority: 3,
    name: "Hoyt Sze",
    firm: "Sheppard Mullin",
    title: "Partner",
    rationale: "Planning committee connector — can intro Felicia, David Cade, and other Sheppard partners (Margia Corner, Steven Chiu).",
    access: "direct",
    notes: "Already connected Kavi to a dinner. Continue relationship.",
  },
  {
    priority: 4,
    name: "Jamie Ostroff",
    firm: "California Medical Association",
    title: "General Counsel & CLO",
    rationale: "CA statewide physician-org hub — West Coast analogue to Laura.",
    access: "direct",
    notes: "Kavi is reaching out.",
  },
  {
    priority: 5,
    name: "Rowena Manlapaz",
    firm: "UC Office of the President",
    title: "Senior Principal Counsel",
    rationale: "Same pipeline Hoyt used — UC system-wide legal hub feeding into Big Law.",
    access: "session",
  },
  {
    priority: 6,
    name: "David Cade",
    firm: "AHLA",
    title: "EVP & CEO",
    rationale: "Ultimate conference connector — but needs warm intro, not cold approach.",
    access: "via-hoyt",
    notes: "Visible Sun Membership Meeting, Mon welcome, Wed moderates DOJ/OIG/CMS session.",
  },
  {
    priority: 7,
    name: "Kerry Hoggard",
    firm: "AHLA",
    title: "VP of Membership",
    rationale: "Member growth mandate — motivated to help newcomers plug in.",
    access: "direct",
  },
  {
    priority: 8,
    name: "Robert Taflinger",
    firm: "AHLA",
    title: "Senior Director of Membership and Development",
    rationale: "Adjacent to Teshia/Kerry on member-facing roles.",
    access: "direct",
  },
  {
    priority: 9,
    name: "Lori Lahn",
    firm: "Greater New York Hospital Association",
    title: "Assistant VP, Legal & Regulatory",
    rationale: "Laura's deputy — same GNYHA hub access, more available. Backup if Laura is busy.",
    access: "via-laura",
  },
  {
    priority: 10,
    name: "Laurie Garvey",
    firm: "AHLA",
    title: "Senior Director of Conferences",
    rationale: "Runs the event — knows logistics, receptions, and who's who in real time.",
    access: "direct",
  },
  {
    priority: 11,
    name: "Jennifer Eilemberg",
    firm: "Stout",
    title: "Managing Director",
    rationale: "Advisory-firm connector with wide tier-spanning rolodex. Speaking Mon 1:45 Session 4 (AI compliance).",
    access: "session",
    notes: "Archetype 2 — Kavi deprioritizes advisory firms but kept her on radar.",
  },
  {
    priority: 12,
    name: "Jodie Rae Jordan",
    firm: "Kroll",
    title: "Director of Global Business Development",
    rationale: "Relationship-building is her entire job — wide rolodex across firm tiers.",
    access: "direct",
    notes: "Lowest priority — advisory archetype Kavi is setting aside.",
  },
];

export const ahlaKeySessions: AhlaSession[] = [
  {
    id: "2",
    title: "Evolving Rules, Expanding Risks: Regulatory and Compliance Challenges in Life Sciences",
    speakers: ["Tynan O. Kugler", "Jonathan A. Porter (Husch Blackwell)", "Mara Smith-Kouba"],
    times: "Mon 1:45–2:45 pm (no repeat)",
  },
  {
    id: "4",
    title: "From Hype to Accountability: Compliance Frameworks for Safe and Lawful AI in Health Care",
    speakers: ["Jennifer Eilemberg (Stout)", "Janice Suchyta"],
    times: "Mon 1:45–2:45 pm (no repeat)",
  },
  {
    id: "5",
    title: "Whose Job is MA Compliance Anyway?",
    speakers: ["Annie Shieh", "Judith Waltz (Foley & Lardner)"],
    times: "Mon 1:45–2:45 pm, Tue 1:45–2:45 pm",
  },
  {
    id: "9",
    title: "Private Equity and Health Care: Navigating the False Claims Act Risk",
    speakers: ["George Breen (EBG)", "Candace Deisher", "Marc S. Raspanti"],
    times: "Mon 3:15–4:30 pm, Wed 10:00–11:15 am",
    notes: "EBG practice chair — key for SF associate role.",
  },
  {
    id: "11",
    title: "Health Care AI is Hot, Legal Risk is Not",
    speakers: ["Brenton Hill (Coalition for Health AI)", "Alicia Macklin (Hooper Lundy)", "Julia Michael (K Health)"],
    times: "Mon 3:15–4:30 pm, Tue 10:45 am–12:00 pm",
    notes: "CHAI = Coalition for Health AI, not Chai Discovery.",
  },
  {
    id: "13",
    title: "Medicaid Transformation under H.R.1",
    speakers: ["Caroline Farrell", "Charles Luband (Dentons)", "Anne Winter"],
    times: "Mon 3:15–4:30 pm, Tue 10:45 am–12:00 pm",
  },
  {
    id: "18",
    title: "Real or Imagined — Legal Ethical Issues in Providing F&A Advice",
    speakers: ["Lisa Noller", "Felicia Sze (Athene Law)"],
    times: "Mon 4:45–5:45 pm, Wed 11:30 am–12:30 pm",
  },
  {
    id: "20",
    title: "Gender-Affirming Care for Minors and Adolescents — Federal and State Developments (Advanced)",
    speakers: ["Jennifer Nelson Carney (EBG)", "Patrick O'Rourke", "Hoyt Sze (Sheppard Mullin)"],
    times: "Tue 8:00–9:00 am (no repeat)",
  },
  {
    id: "26",
    title: "It's A New World for Hospices and Home Health Agencies",
    speakers: ["Rachel Hold-Weiss (Benesch Friedlander)", "Hillary Loeffler"],
    times: "Tue 9:15–10:15 am (no repeat)",
    notes: "Benesch = near-term NY target firm.",
  },
  {
    id: "33",
    title: "Risks Surrounding DEI Programs",
    speakers: ["Margia Corner (Sheppard Mullin)", "Brandon Helms"],
    times: "Tue 1:45–2:45 pm (no repeat)",
    notes: "Clashes with Waltz Session 5 repeat — pick Corner if Waltz caught Mon.",
  },
  {
    id: "40",
    title: "No Surprises Act — Latest Guidance, Quirks, and Practical Approaches (Advanced)",
    speakers: ["Steven Chiu (Manatt)", "Trestney Manning", "Suzanne Strothkamp"],
    times: "Tue 4:30–5:30 pm (no repeat)",
  },
  {
    id: "42",
    title: "AI as Evidence in Reimbursement: Audits, Investigations, Litigation, and Liability (Advanced)",
    speakers: ["Stephen Bittinger", "Gregory Demske", "David Greenberg"],
    times: "Wed 10:00–11:15 am (no repeat)",
  },
];

export const ahlaNetworkingEvents: AhlaNetworkingEvent[] = [
  {
    when: "Sat Jun 27, 6:00 pm",
    title: "AHLA Awards Dinner (Board of Directors, PYA sponsor)",
    notes: "Optional — additional fee, pre-registration required.",
  },
  {
    when: "Sun Jun 28, 9:00 am",
    title: "State of the Association / Membership Meeting",
    notes: "Mark Kopson (President), David Cade (CEO). Included in registration.",
  },
  {
    when: "Sun Jun 28, 5:30 pm",
    title: "Welcome Reception (VMG Health sponsor; NY State Bar, NYC Bar, GNYHA hosts)",
    notes: "Laura Alfredo's org is a host — meet her on home turf. Included. Roll into Dine-Arounds after.",
  },
  {
    when: "Sun Jun 28, 6:30 pm",
    title: "Dine-Arounds — Early Career Professionals Council",
    notes: "Highest-priority newcomer event. Self-pay group dinners. Teshia Birts' world.",
  },
  {
    when: "Mon Jun 29, 7:00–8:30 am",
    title: "Conference Breakfast (Norton Rose Fulbright)",
    notes: "Included. Low-pressure networking. Arrive ~7:10, sit at partially-full tables. Active window ~7:00–7:55 before 8:00 welcome overlap.",
  },
  {
    when: "Mon Jun 29, 2:45–3:15 pm",
    title: "Coffee and Networking Break (Dorsey & Whitney)",
    notes: "Exhibits open.",
  },
  {
    when: "Mon Jun 29, 7:00–9:30 pm",
    title: "MoMA Off-Property Reception (AHLA Members' Law Firms)",
    notes: "Included. Big Law partners socializing — long-game relationship building.",
  },
  {
    when: "Tue Jun 30, 6:30–7:30 am",
    title: "Exercise Class / Fun Run",
    notes: "Pre-registration required.",
  },
  {
    when: "Tue Jun 30, 7:00–8:30 am",
    title: "Conference Breakfast (Pivotal Mobile eDiscovery)",
    notes: "Included. Same breakfast networking playbook as Monday.",
  },
  {
    when: "Tue Jun 30, 10:15–10:45 am",
    title: "Coffee and Networking Break",
    notes: "Exhibits open.",
  },
  {
    when: "Tue Jun 30, 2:45–3:15 pm",
    title: "Networking Snack Break",
    notes: "Exhibits open.",
  },
  {
    when: "Tue Jun 30, 5:30–6:30 pm",
    title: "Networking Reception (LawVu sponsor)",
    notes: "Included. General networking block.",
  },
  {
    when: "Wed Jul 1, 7:00–8:30 am",
    title: "Women's Networking Breakfast (Pinnacle Healthcare Consulting)",
    notes: "NOT included — no extra fee but pre-registration required, limited attendance.",
  },
  {
    when: "Wed Jul 1, 7:30–9:00 am",
    title: "Conference Breakfast",
    notes: "Included.",
  },
  {
    when: "Wed Jul 1, 8:30–9:45 am",
    title: "General Session: DOJ, OIG and CMS — David Cade moderates",
    notes: "Kim Brandt, Susan Gillin, Brenna Jenny. Natural post-session window for Cade intro via Hoyt.",
  },
];

/** Full official schedule from AM26_Printable-5-7.pdf. kaviRelevant flags contact/connector/strategic sessions. */
export const ahlaFullSchedule: AhlaScheduleDay[] = [
  {
    date: "2026-06-27",
    label: "Sat Jun 27 (optional pre-programs — before Kavi's attendance)",
    entries: [
      { time: "9:00 am–5:30 pm", title: "Check-In and Badge Pick-Up", category: "check-in" },
      {
        time: "10:00 am–5:30 pm",
        title: "Leadership & Career Development Program (Day 1)",
        category: "optional-paid",
        notes: "Additional fee, pre-registration required",
      },
      {
        time: "6:00–9:30 pm",
        title: "AHLA Awards Dinner",
        category: "optional-paid",
        sponsor: "PYA",
        notes: "Additional fee, pre-registration required",
      },
    ],
  },
  {
    date: "2026-06-28",
    label: "Sun Jun 28 — Kavi's first day",
    entries: [
      { time: "7:00 am–5:30 pm", title: "Check-In and Badge Pick-Up", category: "check-in" },
      {
        time: "8:00 am–5:00 pm",
        title: "LCDP (Day 2)",
        category: "optional-paid",
        notes: "Ends 5:00 pm; additional fee",
      },
      {
        time: "8:00 am–5:30 pm",
        title: "In-House Counsel Program",
        category: "optional-paid",
        sponsor: "Stout",
        notes: "Additional fee, pre-registration required",
      },
      {
        time: "9:00–10:00 am",
        title: "State of the Association / Membership Meeting",
        category: "general-session",
        speakers: ["Mark Kopson", "David S. Cade"],
        included: true,
        kaviRelevant: true,
      },
      {
        time: "5:30–6:30 pm",
        title: "Welcome Reception",
        category: "networking",
        sponsor: "VMG Health",
        included: true,
        kaviRelevant: true,
        notes: "Hosted by NY State Bar, NYC Bar, GNYHA",
      },
      {
        time: "6:30 pm",
        title: "Dine-Arounds (Early Career Professionals Council)",
        category: "networking",
        included: true,
        kaviRelevant: true,
        notes: "Self-pay dinners",
      },
    ],
  },
  {
    date: "2026-06-29",
    label: "Mon Jun 29",
    entries: [
      { time: "7:00 am–5:30 pm", title: "Check-In and Badge Pick-Up", category: "check-in" },
      {
        time: "7:00–8:30 am",
        title: "Conference Breakfast",
        category: "meal",
        sponsor: "Norton Rose Fulbright",
        included: true,
        kaviRelevant: true,
        notes: "Networking window ~7:00–7:55 before welcome at 8:00",
      },
      {
        time: "8:00–8:30 am",
        title: "Welcome and Member Awards",
        category: "general-session",
        speakers: ["Mark Kopson", "David S. Cade"],
        included: true,
        kaviRelevant: true,
      },
      {
        time: "8:30–9:30 am",
        title: "Keynote Address",
        category: "general-session",
        sponsor: "FTI Consulting",
        included: true,
      },
      { time: "9:30–9:45 am", title: "Break", category: "break" },
      {
        time: "9:45–11:45 am",
        title: "Year In Review",
        category: "general-session",
        sponsor: "GNYHA",
        speakers: ["Robert G. Homchick", "Kim Harvey Looney", "Cynthia F. Wisner"],
        included: true,
        kaviRelevant: true,
        notes: "Kim Looney = EBG partner",
      },
      {
        time: "12:00–1:30 pm",
        title: "Lunch and Learn",
        category: "optional-paid",
        sponsor: "Fredrikson & Byron PA",
        notes: "Not included; no extra fee; pre-registration required",
      },
      {
        time: "1:45–2:45 pm",
        title: "Concurrent Sessions 2–7",
        category: "concurrent",
        notes: "See session list below",
      },
      { time: "2:45–3:15 pm", title: "Coffee and Networking Break", category: "networking", sponsor: "Dorsey & Whitney", included: true },
      {
        time: "3:15–4:30 pm",
        title: "Extended Concurrent Sessions 8–13",
        category: "concurrent",
        notes: "See session list below",
      },
      {
        time: "4:45–5:45 pm",
        title: "Concurrent Sessions 14–19",
        category: "concurrent",
        notes: "See session list below",
      },
      {
        time: "7:00–9:30 pm",
        title: "MoMA Off-Property Reception",
        category: "networking",
        included: true,
        kaviRelevant: true,
        notes: "Sponsored by AHLA Members' Law Firms",
      },
    ],
  },
  {
    date: "2026-06-30",
    label: "Tue Jun 30",
    entries: [
      { time: "6:30–7:30 am", title: "Exercise Class / Fun Run", category: "optional-paid", notes: "Pre-registration required" },
      { time: "7:00 am–5:30 pm", title: "Check-In and Badge Pick-Up", category: "check-in" },
      {
        time: "7:00–8:30 am",
        title: "Conference Breakfast",
        category: "meal",
        sponsor: "Pivotal Mobile eDiscovery",
        included: true,
        kaviRelevant: true,
      },
      {
        time: "8:00–9:00 am",
        title: "Concurrent Sessions 20–25",
        category: "concurrent",
        notes: "See session list below",
      },
      {
        time: "9:15–10:15 am",
        title: "Concurrent Sessions 26–29 (+ repeats 7, 19)",
        category: "concurrent",
        notes: "See session list below",
      },
      { time: "10:15–10:45 am", title: "Coffee and Networking Break", category: "networking", included: true },
      {
        time: "10:45 am–12:00 pm",
        title: "Extended Concurrent Sessions 30–32 (+ repeats 10, 11, 13)",
        category: "concurrent",
        notes: "See session list below",
      },
      {
        time: "12:00–1:30 pm",
        title: "Lunch and Learn",
        category: "optional-paid",
        sponsor: "Arnold & Porter Kaye Scholer",
        notes: "Not included; pre-registration required",
      },
      {
        time: "1:45–2:45 pm",
        title: "Concurrent Sessions 33–35 (+ repeats 5, 6, 22)",
        category: "concurrent",
        notes: "See session list below",
      },
      { time: "2:45–3:15 pm", title: "Networking Snack Break", category: "networking", included: true },
      {
        time: "3:15–4:15 pm",
        title: "Concurrent Sessions 36–39 (+ repeats 16, 25)",
        category: "concurrent",
        notes: "See session list below",
      },
      {
        time: "4:30–5:30 pm",
        title: "Concurrent Sessions 40–41 (+ repeats 17, 23, 24, 28)",
        category: "concurrent",
        notes: "See session list below",
      },
      {
        time: "5:30–6:30 pm",
        title: "Networking Reception",
        category: "networking",
        sponsor: "LawVu",
        included: true,
        kaviRelevant: true,
      },
    ],
  },
  {
    date: "2026-07-01",
    label: "Wed Jul 1 — last day",
    entries: [
      { time: "7:00 am–12:30 pm", title: "Conference Attendee Assistance", category: "check-in" },
      {
        time: "7:00–8:30 am",
        title: "Women's Networking Breakfast",
        category: "optional-paid",
        sponsor: "Pinnacle Healthcare Consulting",
        notes: "Pre-registration required, limited attendance",
      },
      { time: "7:30–9:00 am", title: "Conference Breakfast", category: "meal", included: true },
      {
        time: "8:30–9:45 am",
        title: "DOJ, OIG and CMS Fraud and Abuse Prevention and Enforcement",
        category: "general-session",
        sponsor: "BDO",
        speakers: ["David Cade (Moderator)", "Kim Brandt", "Susan Gillin", "Brenna Jenny"],
        included: true,
        kaviRelevant: true,
      },
      {
        time: "10:00–11:15 am",
        title: "Extended Concurrent Sessions 42–43 (+ repeat 9, 12, 31, 32)",
        category: "concurrent",
        notes: "See session list below",
      },
      {
        time: "11:30 am–12:30 pm",
        title: "Concurrent Sessions (+ repeats 18, 29, 35, 38, 39)",
        category: "concurrent",
        notes: "See session list below",
      },
    ],
  },
];

/** All 42 concurrent sessions — compact reference from official agenda. */
export const ahlaAllSessions: AhlaSession[] = [
  { id: "2", title: "Evolving Rules, Expanding Risks: Regulatory and Compliance Challenges in Life Sciences", speakers: ["Tynan O. Kugler", "Jonathan A. Porter", "Mara Smith-Kouba"], times: "Mon 1:45–2:45 (no repeat)" },
  { id: "3", title: "The NLRB General Counsel's Agenda (Advanced)", speakers: ["Jon Anderson", "Crystal S. Carey"], times: "Mon 1:45–2:45 (no repeat)" },
  { id: "4", title: "From Hype to Accountability: Compliance Frameworks for Safe and Lawful AI in Health Care", speakers: ["Jennifer Eilemberg", "Janice Suchyta"], times: "Mon 1:45–2:45 (no repeat)" },
  { id: "5", title: "Whose Job is MA Compliance Anyway?", speakers: ["Annie Shieh", "Judith A. Waltz"], times: "Mon 1:45–2:45, Tue 1:45–2:45" },
  { id: "6", title: "To Defer or Not to Defer — Agency Deference in Health Care Disputes", speakers: ["Daniel J. Hettich"], times: "Mon 1:45–2:45, Tue 1:45–2:45" },
  { id: "7", title: "False Claims Act Enforcement in Year 2 of Trump 2", speakers: ["Denise Barnes", "Mary Inman", "Benjamin C. Mizer"], times: "Mon 1:45–2:45, Tue 9:15–10:15" },
  { id: "8", title: "From Concept to Care Delivery: Legal Strategies for Opening Innovative Health Care Facilities", speakers: ["Jeffrey Jowers", "Kim McWhorter", "Jeff Wurzburg"], times: "Mon 3:15–4:30 (no repeat)" },
  { id: "9", title: "Private Equity and Health Care: Navigating the False Claims Act Risk", speakers: ["George B. Breen", "Candace Deisher", "Marc S. Raspanti"], times: "Mon 3:15–4:30, Wed 10:00–11:15" },
  { id: "10", title: "Hot Topics in Health Care Antitrust Enforcement", speakers: ["Aimee DeFilippo", "Alexis Gilman", "Rohan Pai"], times: "Mon 3:15–4:30, Tue 10:45 am–12:00 pm" },
  { id: "11", title: "Health Care AI is Hot, Legal Risk is Not", speakers: ["Brenton Hill", "Alicia W. Macklin", "Julia Michael"], times: "Mon 3:15–4:30, Tue 10:45 am–12:00 pm" },
  { id: "12", title: "From Insight to Oversight: Investigations to Drive Auditing and Monitoring", speakers: ["Jason Ehrlinspiel", "Maria Joseph", "Dhara Satija"], times: "Mon 3:15–4:30, Wed 10:00–11:15" },
  { id: "13", title: "Medicaid Transformation under H.R.1", speakers: ["Caroline Farrell", "Charles Luband", "Anne Winter"], times: "Mon 3:15–4:30, Tue 10:45 am–12:00 pm" },
  { id: "14", title: "Behavioral Health Integration: Legal and Regulatory Hurdles", speakers: ["Melissa Barlett", "Bradley E. Lerner", "Deepti Loharikar"], times: "Mon 4:45–5:45 (no repeat)" },
  { id: "15", title: "Molecules to Markets: Compliance Challenges in R&D Partnerships", speakers: ["Rebecca Merrill", "Audrey Pike Wilson", "Robert Q. Wilson"], times: "Mon 4:45–5:45 (no repeat)" },
  { id: "16", title: "What's New in Health Privacy", speakers: ["Mario Meeks", "Sara Pullen"], times: "Mon 4:45–5:45, Tue 3:15–4:15" },
  { id: "17", title: "Employer Pitfalls: Discrimination and Retaliation Claims", speakers: ["Greg Northen"], times: "Mon 4:45–5:45, Tue 4:30–5:30" },
  { id: "18", title: "Real or Imagined — Legal Ethical Issues in Providing F&A Advice", speakers: ["Lisa Noller", "Felicia Sze"], times: "Mon 4:45–5:45, Wed 11:30 am–12:30 pm" },
  { id: "19", title: "The Carrot and the Stick: Incentivizing Physician Employee Loyalty", speakers: ["Erin Smith Aebel", "Melissa Mora"], times: "Mon 4:45–5:45, Tue 9:15–10:15" },
  { id: "20", title: "Gender-Affirming Care for Minors and Adolescents (Advanced)", speakers: ["Jennifer Nelson Carney", "Patrick O'Rourke", "Hoyt Sze"], times: "Tue 8:00–9:00 (no repeat)" },
  { id: "21", title: "Structuring and Scaling Telehealth", speakers: ["Jeremy Herman", "Andrea Musker"], times: "Tue 8:00–9:00 (no repeat)" },
  { id: "22", title: "Enforcement Insights: Advanced Strategies to Minimize Risk (Advanced)", speakers: ["Rob DeConti", "Greg Radinsky", "Spencer Turnbull"], times: "Tue 8:00–9:00, Tue 1:45–2:45" },
  { id: "23", title: "Across the Table: Hospital and Physician Counsel (Advanced)", speakers: ["Serj Mooradian", "Valerie S. Rup"], times: "Tue 8:00–9:00, Tue 4:30–5:30" },
  { id: "24", title: "Prescription Drug Pricing — Legal Considerations", speakers: ["Dorothy Shuldman", "Amanda Smith"], times: "Tue 8:00–9:00, Tue 4:30–5:30" },
  { id: "25", title: "The JOA Is Back: Strategic Partnerships Post-Merger", speakers: ["Brad Dennis", "Colin McDermott"], times: "Tue 8:00–9:00, Tue 3:15–4:15" },
  { id: "26", title: "It's A New World for Hospices and Home Health Agencies", speakers: ["Rachel Hold-Weiss", "Hillary Loeffler"], times: "Tue 9:15–10:15 (no repeat)" },
  { id: "27", title: "Caught in the Middle: Legal Ethics, Whistleblowers, and Dual Roles", speakers: ["Caitlin Forsyth", "Ally Kjellander"], times: "Tue 9:15–10:15 (no repeat)" },
  { id: "28", title: "Mission vs. Margin: Tax Policy Challenges for Exempt Hospitals", speakers: ["Amy Ciminello", "Michael N. Fine"], times: "Tue 9:15–10:15, Tue 4:30–5:30" },
  { id: "29", title: "Accountable AI in Health Care: URAC's AI Accreditation", speakers: ["Ally Bremer", "Madhu Reddiboina", "Jennifer Richards"], times: "Tue 9:15–10:15, Wed 11:30 am–12:30 pm" },
  { id: "30", title: "Navigating the Women's Health Triumvirate", speakers: ["Priya Bathija", "Chelsea Daniels", "Laura Koman"], times: "Tue 10:45 am–12:00 (no repeat)" },
  { id: "31", title: "Back to the Future of JVs (Advanced)", speakers: ["Brynne R. Goncher", "William T. Mathias", "Ethan Rii"], times: "Tue 10:45 am–12:00, Wed 10:00–11:15" },
  { id: "32", title: "Key Considerations in Responding to a Corporate Criminal Investigation (Advanced)", speakers: ["Anthony J. Burba", "Henry Leventis"], times: "Tue 10:45 am–12:00, Wed 10:00–11:15" },
  { id: "33", title: "Risks Surrounding DEI Programs", speakers: ["Margia Corner", "Brandon Helms"], times: "Tue 1:45–2:45 (no repeat)" },
  { id: "34", title: "What Every Health Lawyer Needs to Know About Rural Hospital Partnerships", speakers: ["Jennifer Lyday", "Jeff Sommer"], times: "Tue 1:45–2:45 (no repeat)" },
  { id: "35", title: "PSL (Stark Law) Pitfalls and Possibilities (Advanced)", speakers: ["Nicholas F. Alarif", "Matthew Edgar"], times: "Tue 1:45–2:45, Wed 11:30 am–12:30 pm" },
  { id: "36", title: "Mind the Gap: Variable Compensation and Earnouts in Health Care Transactions (Advanced)", speakers: ["Stephen Angelette", "Jennifer Kreick"], times: "Tue 3:15–4:15 (no repeat)" },
  { id: "37", title: "ICE Worksite Raids and Immigration Compliance", speakers: ["Marissa Marquez", "Dustin J. O'Quinn"], times: "Tue 3:15–4:15 (no repeat)" },
  { id: "38", title: "Emerging Trends and Strategic Challenges in Managed Care", speakers: ["Christi Grimm", "Giselle Joffre"], times: "Tue 3:15–4:15, Wed 11:30 am–12:30 pm" },
  { id: "39", title: "Physician Arrangements and Pre-payment Audits (Advanced)", speakers: ["Mark Despoth", "Mike Pazzo"], times: "Tue 3:15–4:15, Wed 11:30 am–12:30 pm" },
  { id: "40", title: "No Surprises Act — Latest Guidance (Advanced)", speakers: ["Steven Chiu", "Trestney Manning", "Suzanne Strothkamp"], times: "Tue 4:30–5:30 (no repeat)" },
  { id: "41", title: "Practitioner Professionalism Concerns", speakers: ["Ellie Bane", "Charlie Chulack"], times: "Tue 4:30–5:30 (no repeat)" },
  { id: "42", title: "AI as Evidence in Reimbursement (Advanced)", speakers: ["Stephen Bittinger", "Gregory Demske", "David Greenberg"], times: "Wed 10:00–11:15 (no repeat)" },
  { id: "43", title: "Health Care Transactions: Antitrust Landscape (Advanced)", speakers: ["Elizabeth M. Azano", "Desmond Jordan", "Josh Soven"], times: "Wed 10:00–11:15 (no repeat)" },
];

export const ahlaFirmTargets = {
  nyBigLaw: [
    "Arnold & Porter (strongest NY partner bench: Choi, Cortes, Efron)",
    "King & Spalding (Berkowitz, Zall)",
    "Proskauer (Madden + associates)",
    "Dentons, Hogan Lovells, Holland & Knight, McDermott, McGuireWoods, Ropes & Gray, Sheppard Mullin, Venable",
  ],
  nyMidSized: [
    "Benesch Friedlander (7 attendees — actively building healthcare group)",
    "Axinn Veltrop (3 attendees)",
    "Abrams Fensterman, Phillips Lytle, Mitchell Silberberg",
  ],
  caBigLaw: [
    "Sheppard Mullin (5 partners: Grushkin, Ghazni, Huynh, Corner, Sze)",
    "King & Spalding, Seyfarth Shaw, Arnold & Porter, Foley & Lardner, Latham, Manatt, Nixon Peabody, Ropes & Gray",
  ],
  caMidSized: [
    "Athene Law (Felicia Sze, Managing Partner)",
    "Best Best & Krieger (Alison Bassett)",
    "McLaughlin & Stern (Carla Hartley)",
    "Mitchell Silberberg",
  ],
};

export const ahlaEbgTarget = {
  role: "Associate Attorney, Health Care & Life Sciences — San Francisco",
  office: "57 Post Street, Suite 703, San Francisco CA 94104",
  sfAttorneys: ["Raja Sékaran", "John M. Puente", "Gary Baldwin", "James M. Reilly"],
  conferenceAttendees: [
    "George Breen — practice chair (DC), Session 9",
    "Kim Looney — partner (Nashville), Mon Year-in-Review session",
    "Eric Neiman — partner (Portland), nearest West Coast attendee",
    "18 EBG attendees total; none from SF office",
  ],
  play: "Attend George Breen's Session 9 panel, introduce yourself afterward, mention genuine interest in SF health-care/life-sciences group.",
};

export const ahlaSchedulingNotes = [
  "Mon panels: Life Sciences (Session 2, 1:45), Health Care AI (Session 11, 3:15), Felicia Sze (Session 18, 4:45).",
  "Tue 10:45: Women's Health (Session 30) — Health Care AI repeat skipped (already attended Mon).",
  "Tue 1:45 clash: Waltz Session 5 repeat vs Margia Corner Session 33 — if Waltz caught Mon, take Corner (Sheppard partner, reachable via Hoyt).",
  "Sunday evening (Welcome Reception → Dine-Arounds) is the single highest-leverage networking block.",
  "Breakfast (Mon/Tue 7:00–8:30) overlaps with 8:00 welcome — use 7:00–7:55 for table networking, then get seated for keynote.",
];

function formatContacts() {
  const statusOrder: AhlaContactStatus[] = ["confirmed", "planned", "connector", "prospect"];
  const sorted = [...ahlaContacts].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
  );

  return sorted
    .map((c) => {
      const parts = [
        `- [${c.status.toUpperCase()}] ${c.name}`,
        c.title ? `(${c.title})` : "",
        `@ ${c.firm}`,
        `[${c.tier}, ${c.market.toUpperCase()}]`,
        `— ${c.rationale}`,
      ];
      return parts.filter(Boolean).join(" ") + (c.notes ? ` (${c.notes})` : "");
    })
    .join("\n");
}

function formatConnectors() {
  return ahlaConnectors
    .map(
      (c) =>
        `- #${c.priority} ${c.name}, ${c.title}, ${c.firm} [${c.access}] — ${c.rationale}${c.notes ? ` (${c.notes})` : ""}`,
    )
    .join("\n");
}

function formatNetworkingEvents() {
  return ahlaNetworkingEvents
    .map((e) => `- ${e.when}: ${e.title} — ${e.notes}`)
    .join("\n");
}

function formatFirmTargets() {
  return Object.entries(ahlaFirmTargets)
    .map(([key, firms]) => `- ${key}: ${firms.join("; ")}`)
    .join("\n");
}

function formatFullScheduleDays() {
  return ahlaFullSchedule
    .map((day) => {
      const lines = day.entries.map((e) => {
        const flags = [
          e.kaviRelevant ? "[KAVI]" : "",
          e.included === false ? "[not included]" : e.included ? "[included]" : "",
          e.sessionId ? `Session ${e.sessionId}` : "",
        ].filter(Boolean);
        const meta = [
          e.sponsor ? `sponsor: ${e.sponsor}` : "",
          e.speakers?.length ? e.speakers.join(", ") : "",
          e.notes ?? "",
        ].filter(Boolean);
        return `  ${e.time}: ${e.title}${flags.length ? ` ${flags.join(" ")}` : ""}${meta.length ? ` — ${meta.join("; ")}` : ""}`;
      });
      return `${day.label}:\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

function formatAllSessionsCompact() {
  return ahlaAllSessions
    .map(
      (s) =>
        `${s.id}. ${s.title} | ${s.times} | ${s.speakers.join(", ")}`,
    )
    .join("\n");
}

function formatKaviSessionsOnly() {
  const kaviSessionIds = new Set(ahlaKeySessions.map((s) => s.id));
  return ahlaAllSessions
    .filter((s) => kaviSessionIds.has(s.id))
    .map(
      (s) =>
        `- Session ${s.id}: ${s.title} | ${s.times} | ${s.speakers.join(", ")}${s.notes ? ` (${s.notes})` : ""}`,
    )
    .join("\n");
}

/** Structured AHLA context block for the trip concierge system prompt. */
export function formatAhlaContext(): string {
  return `Kavi's AHLA 2026 goals:
- North star: ${ahlaGoals.northStar}
- Conference priority: ${ahlaGoals.conferencePriority}
- Conference: ${ahlaGoals.conference}
- Near-term (out of law school): ${ahlaGoals.nearTerm}
- Long-term: ${ahlaGoals.longTerm}
- Job target: ${ahlaGoals.jobTarget}
- Networking approach: ${ahlaGoals.networkingStyle}

Conference mindset (current):
- Focus: ${ahlaConferenceMindset.currentFocus}
- On the ground: ${ahlaConferenceMindset.onTheGround}
- Self-care: ${ahlaConferenceMindset.selfCare}

Avoid (background only — do not mention unless directly relevant):
${ahlaAvoidContacts.map((c) => `- ${c.name}, ${c.title} @ ${c.firm} — ${c.reason}`).join("\n")}

Official schedule: ${ahlaConferenceMeta.scheduleSource}. Venue: ${ahlaConferenceMeta.venue}.

Contact status key: CONFIRMED = responded & willing to meet; PLANNED = locked-in conference meeting; PROSPECT = target not yet met.

Contacts (${ahlaContacts.length} tracked):
${formatContacts()}

Priority connectors (leverage × accessibility):
${formatConnectors()}

Day-by-day program (networking + general sessions):
${formatFullScheduleDays()}

Sessions where Kavi's contacts speak:
${formatKaviSessionsOnly()}

All concurrent sessions (1–43):
${formatAllSessionsCompact()}

Networking events & breaks:
${formatNetworkingEvents()}

Firm hiring targets by market/tier:
${formatFirmTargets()}

EBG job angle:
- Role: ${ahlaEbgTarget.role}
- SF office: ${ahlaEbgTarget.office}
- SF attorneys (not at conference): ${ahlaEbgTarget.sfAttorneys.join(", ")}
- Conference line: ${ahlaEbgTarget.conferenceAttendees.join("; ")}
- Play: ${ahlaEbgTarget.play}

Scheduling conflicts & tactics:
${ahlaSchedulingNotes.map((n) => `- ${n}`).join("\n")}`;
}

export const ahlaAiRules = [
  "When Kavi asks about AHLA, networking, contacts, connectors, firm targets, or conference sessions, use the AHLA context below — not general knowledge.",
  "North star is still a mid-to-big law associate job out of law school, but her current conference mode is learning-first — panels and health-law substance beat forced networking.",
  "Many attorneys go cold once they learn she's a student. Don't push aggressive networking, cold approaches, or make her feel she's failing socially. Warm paths (confirmed/planned contacts, Hoyt) are fine; grinding is not.",
  "Prioritize substantive sessions and learning takeaways. Receptions and breaks are optional — fine to skip for rest or a solo meal.",
  "Take care of her: new city, long days. Nudge sleep, food, hydration, and keeping her guard up when something feels off. Trust her instincts.",
  "Cliff Barnes (EBG retired partner) — avoid entirely. Do not suggest meeting or bring up unprompted. If EBG comes up, steer to Kim Looney or George Breen.",
  "For AHLA sessions, networking events, must-attend panels, or where contacts speak, call getAhlaEvents — it renders rich event cards. Do NOT list sessions as bullet points with times/speakers in text.",
  "For schedule/timing questions, use the official agenda (draft 5/7/26): Sun Jun 28 – Wed Jul 1 @ Hilton Midtown. Sat Jun 27 is optional pre-programs only.",
  "Distinguish CONFIRMED vs PLANNED vs PROSPECT contacts. Don't treat prospects as locked meetings.",
  "Respect the two-track strategy: mid-sized/boutique for near-term hiring, Big Law partners for long-term relationships.",
  "For 'how to play' event questions, give practical advice without a networking-hustle tone — what the event is good for, when to leave, when rest beats another reception.",
  "Hoyt Sze is the anchor — route David Cade and Felicia Sze intros through him when possible. Teshia Birts and Laura Alfredo are direct-reach connectors.",
  "CHAI on the agenda = Coalition for Health AI (Brenton Hill), not Chai Discovery.",
  "Joel Richlan is unverified in the attendee list — flag if asked.",
  "Wahida Bhuyan (not Wahita) is solo counsel, not a firm hire target.",
  "Mon breakfast (7:00–8:30) overlaps with 8:00 welcome — networking window is ~7:00–7:55. Same pattern Tue.",
  "Events marked [included] are in registration; optional paid programs (LCDP, Awards Dinner, In-House Counsel, Lunch and Learns) need pre-registration.",
];
