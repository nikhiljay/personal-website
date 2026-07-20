export type TasteItem = {
  title: string;
  location?: string;
  href?: string;
  heart?: boolean;
  links?: { label: string; href: string }[];
};

export type TasteSection = {
  title: string;
  items: TasteItem[];
};

export const tasteSections: TasteSection[] = [
  {
    title: "Stack",
    items: [
      { title: "Tissot PRX" },
      { title: "Garmin Forerunner 970" },
      { title: "Whoop 5.0" },
      { title: "Things 3" },
      { title: "Obsidian & iA Writer" },
      { title: "Warp" },
      { title: "Notion Calendar" },
      { title: "Copilot Money" },
      { title: "Dia" },
    ],
  },
  {
    title: "Reading",
    items: [
      { title: "Can't Hurt Me" },
      { title: "Becoming" },
      { title: "The Speed of Trust" },
      { title: "Mistborn" },
      { title: "Atomic Habits" },
      { title: "The Dictionary of Obscure Sorrows" },
      { title: "Tomorrow, and Tomorrow, and Tomorrow" },
    ],
  },
  {
    title: "Food",
    items: [
      {
        title: "Kokkari Estiatorio",
        location: "SF",
      },
      {
        title: "Purple Rice",
        location: "SF",
      },
      {
        title: "Norcina",
        location: "SF",
      },
      {
        title: "Che Fico",
        location: "SF",
      },
      {
        title: "Kavi in NYC",
        href: "/kavi-nyc-trip",
        heart: true,
      },
    ],
  },
];
