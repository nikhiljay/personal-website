export type TasteItem = {
  title: string;
  href?: string;
  description?: string;
};

export type TasteSection = {
  title: string;
  items: TasteItem[];
};

export const tasteSections: TasteSection[] = [
  {
    title: "Stack",
    items: [
      {
        title: "Tissot PRX Powermatic 80",
        href: "https://www.tissotwatches.com/en-us/t1244071104100.html",
        description: "Daily wear.",
      },
      {
        title: "Garmin Forerunner 965",
        href: "https://www.garmin.com/en-US/p/802104",
        description: "Workouts and race prep.",
      },
      {
        title: "Whoop 4.0",
        href: "https://www.whoop.com",
        description: "Recovery and sleep.",
      },
      {
        title: "Cursor",
        href: "https://cursor.com",
        description: "Editor.",
      },
    ],
  },
  {
    title: "Reading",
    items: [
      {
        title: "The Hard Thing About Hard Things",
        href: "https://www.amazon.com/Hard-Thing-About-Things-Building/dp/0062273205",
        description: "Ben Horowitz.",
      },
      {
        title: "Shoe Dog",
        href: "https://www.amazon.com/Shoe-Dog-Phil-Knight-Memoir/dp/1501135910",
        description: "Phil Knight.",
      },
      {
        title: "Thinking, Fast and Slow",
        href: "https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555",
        description: "Daniel Kahneman.",
      },
    ],
  },
  {
    title: "Food",
    items: [
      { title: "Nari", description: "Japantown." },
      { title: "Delfina", description: "Mission." },
      { title: "Tartine Manufactory", description: "Mission Bay." },
      { title: "Rintaro", description: "SOMA." },
    ],
  },
];
