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
        title: "Tissot PRX",
        href: "https://www.tissotwatches.com/en-us/T1374071105100.html",
      },
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
      {
        title: "Atomic Habits",
        href: "https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299",
      },
      {
        title: "The Dictionary of Obscure Sorrows",
        href: "https://www.amazon.com/Dictionary-Obscure-Sorrows-John-Koenig/dp/1501153655",
      },
      {
        title: "Tomorrow, and Tomorrow, and Tomorrow",
        href: "https://www.amazon.com/Tomorrow-Tomorrow-Gabrielle-Zevin/dp/0593321200",
      },
    ],
  },
  {
    title: "Food",
    items: [
      {
        title: "Kokkari Estiatorio (SF)",
        href: "https://kokkari.com/",
      },
      {
        title: "Purple Rice (SF)",
        href: "https://www.yelp.com/biz/purple-rice-san-francisco",
      },
      {
        title: "Norcina (SF)",
        href: "https://www.norcinasf.com/",
      },
      {
        title: "Che Fico (SF)",
        href: "https://chefico.com/",
      },
      {
        title: "Zareen's (Palo Alto)",
        href: "https://www.zareensrestaurant.com/",
      },
      {
        title: "Mitr Thai (NYC)",
        href: "https://mitrthainyc.com/",
      },
      {
        title: "Adda (NYC)",
        href: "https://www.addanyc.com/",
      },
      {
        title: "Wayan (NYC)",
        href: "https://www.wayan-nyc.com/",
      },
      {
        title: "L'industrie Pizzeria (NYC)",
        href: "https://www.lindustriebk.com/",
      },
    ],
  },
];
