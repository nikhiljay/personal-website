export type TasteItem = {
  title: string;
  href?: string;
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
      {
        title: "Garmin Forerunner 970",
        href: "https://www.garmin.com/en-US/c/sports-fitness/running-smartwatches/",
      },
      {
        title: "Whoop 5.0",
        href: "https://www.whoop.com",
      },
      {
        title: "Things 3",
        href: "https://culturedcode.com/things/",
      },
      {
        title: "Obsidian & iA Writer",
        links: [
          { label: "Obsidian", href: "https://obsidian.md" },
          { label: "iA Writer", href: "https://ia.net/writer" },
        ],
      },
      {
        title: "Warp",
        href: "https://www.warp.dev",
      },
      {
        title: "Notion Calendar",
        href: "https://www.notion.com/product/calendar",
      },
      {
        title: "Copilot Money",
        href: "https://copilot.money",
      },
      {
        title: "Dia",
        href: "https://www.diabrowser.com",
      },
    ],
  },
  {
    title: "Reading",
    items: [
      {
        title: "Can't Hurt Me",
        href: "https://www.amazon.com/Cant-Hurt-Me-Master-Your-Mind/dp/1544512279",
      },
      {
        title: "Becoming",
        href: "https://www.amazon.com/Becoming-Michelle-Obama/dp/1524763136",
      },
      {
        title: "The Speed of Trust",
        href: "https://www.amazon.com/Speed-Trust-Thing-affects/dp/0743273296",
      },
      {
        title: "Mistborn",
        href: "https://www.amazon.com/Mistborn-Final-Empire-Brandon-Sanderson/dp/0765311789",
      },
    ],
  },
  {
    title: "Food",
    items: [
      { title: "Nari" },
      { title: "Delfina" },
      { title: "Tartine Manufactory" },
      { title: "Rintaro" },
    ],
  },
];
