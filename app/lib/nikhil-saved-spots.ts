import type { SavedSpotKind } from "./saved-spot-kinds";

export type SavedSpot = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  kind: SavedSpotKind;
};

export const savedSpots: SavedSpot[] = [
  { id: "adda", name: "Adda", address: "107 1st Ave", lat: 40.7268472, lng: -73.986228, kind: "nice" },
  { id: "au-zaatar", name: "Au Za'atar", address: "188 Avenue A", lat: 40.7289381, lng: -73.9812454, kind: "casual" },
  { id: "ayat", name: "Ayat", address: "107 Loisaida Ave", lat: 40.7242306, lng: -73.9789217, kind: "casual" },
  { id: "birdland", name: "Birdland", address: "315 W 44th St", lat: 40.7590853, lng: -73.9896379, kind: "bar" },
  { id: "bleecker-street-pizza", name: "Bleecker Street Pizza", address: "69 7th Ave S", lat: 40.7317056, lng: -74.0037793, kind: "casual" },
  { id: "brooklyn-bridge", name: "Brooklyn Bridge", address: "Brooklyn Bridge", lat: 40.7062175, lng: -73.9970208, kind: "activity" },
  { id: "by-antidote", name: "By Antidote", address: "30 E 20th St", lat: 40.7385926, lng: -73.988887, kind: "cafe" },
  { id: "c-and-b", name: "C&B", address: "178 E 7th St", lat: 40.7250538, lng: -73.9816964, kind: "cafe" },
  { id: "cafe-mogador", name: "Cafe Mogador", address: "101 St Marks Pl", lat: 40.7274166, lng: -73.9843381, kind: "casual" },
  { id: "caffe-panna-irving", name: "Caffè Panna", address: "77 Irving Pl", lat: 40.7369641, lng: -73.9868018, kind: "cafe" },
  { id: "casa-mono", name: "Casa Mono and Bar Jamón", address: "52 Irving Pl", lat: 40.7359257, lng: -73.9871655, kind: "nice" },
  { id: "chama-mama", name: "Chama Mama", address: "149 W 14th St", lat: 40.7384827, lng: -73.9988578, kind: "casual" },
  { id: "chili", name: "CHILI", address: "13 E 37th St", lat: 40.7501079, lng: -73.9820782, kind: "nice" },
  { id: "devocion", name: "Devoción", address: "25 E 20th St", lat: 40.7391158, lng: -73.9891065, kind: "cafe" },
  { id: "fairfax", name: "Fairfax", address: "234 W 4th St", lat: 40.7343436, lng: -74.0031007, kind: "casual" },
  { id: "fish-cheeks", name: "Fish Cheeks", address: "55 Bond St", lat: 40.7257377, lng: -73.9927035, kind: "nice" },
  { id: "fumo-kips-bay", name: "Fumo Kips Bay", address: "415 Third Ave", lat: 40.742602, lng: -73.9801487, kind: "nice" },
  { id: "indian-accent", name: "Indian Accent", address: "123 W 56th St", lat: 40.7640192, lng: -73.9783492, kind: "nice" },
  {
    id: "natural-history-museum",
    name: "Natural History Museum",
    address: "200 Central Park W",
    lat: 40.7811007,
    lng: -73.9742362,
    kind: "activity",
  },
  {
    id: "janie-baked-goods",
    name: "Janie's Life Changing Baked Goods",
    address: "212 W 80th St",
    lat: 40.7840334,
    lng: -73.9788663,
    kind: "cafe",
  },
  { id: "jazba", name: "Jazba", address: "207 Second Ave", lat: 40.7316574, lng: -73.9856935, kind: "nice" },
  { id: "joseph-leonard", name: "Joseph Leonard", address: "170 Waverly Pl", lat: 40.7335936, lng: -74.0016502, kind: "casual" },
  { id: "kikis", name: "Kiki's", address: "130 Division St", lat: 40.7145315, lng: -73.9919097, kind: "casual" },
  { id: "la-cabra", name: "La Cabra", address: "152 2nd Ave", lat: 40.7293547, lng: -73.9866878, kind: "cafe" },
  { id: "levain-lafayette", name: "Levain Bakery", address: "340 Lafayette St", lat: 40.7262725, lng: -73.9946961, kind: "cafe" },
  { id: "levain-18th", name: "Levain Bakery", address: "2 W 18th St", lat: 40.7386759, lng: -73.9924807, kind: "cafe" },
  { id: "locanda-verde", name: "Locanda Verde", address: "377 Greenwich St", lat: 40.7198779, lng: -74.010019, kind: "nice" },
  { id: "lindustrie", name: "L'industrie Pizzeria", address: "104 Christopher St", lat: 40.7332057, lng: -74.0049379, kind: "casual" },
  { id: "marea", name: "Marea", address: "240 Central Park S", lat: 40.7673344, lng: -73.9811711, kind: "nice" },
  { id: "mitr-thai", name: "Mitr Thai", address: "37 W 46th St", lat: 40.7568723, lng: -73.9804251, kind: "nice" },
  { id: "nolita-pizza", name: "Nolita Pizza", address: "68 Kenmare St", lat: 40.7209123, lng: -73.9961959, kind: "casual" },
  { id: "nom-wah", name: "Nom Wah", address: "10 Kenmare St", lat: 40.7203696, lng: -73.9945824, kind: "casual" },
  { id: "prince-st-pizza", name: "Prince St. Pizza", address: "27 Prince St", lat: 40.7230823, lng: -73.9945374, kind: "casual" },
  { id: "ramen-ishida", name: "Ramen Ishida", address: "122 Ludlow St", lat: 40.7195965, lng: -73.9883524, kind: "casual" },
  { id: "santo-taco", name: "Santo Taco", address: "94 University Pl", lat: 40.7338821, lng: -73.9930035, kind: "casual" },
  { id: "sappe", name: "Sappe", address: "240 W 14th St", lat: 40.7391677, lng: -74.0017632, kind: "casual" },
  { id: "singlish", name: "Singlish", address: "17 E 13th St", lat: 40.7349936, lng: -73.993015, kind: "casual" },
  { id: "soothr", name: "Soothr", address: "204 E 13th St", lat: 40.7322692, lng: -73.9873518, kind: "nice" },
  { id: "the-high-line", name: "The High Line", address: "820 Washington St", lat: 40.7397293, lng: -74.0082119, kind: "activity" },
  { id: "the-odeon", name: "The Odeon", address: "145 W Broadway", lat: 40.7169082, lng: -74.0079209, kind: "nice" },
  { id: "thisbowl-nyc", name: "Thisbowl NYC", address: "65 Bleecker St", lat: 40.7263784, lng: -73.9949921, kind: "casual" },
  { id: "tomi-jazz", name: "Tomi Jazz", address: "239 E 53rd St", lat: 40.7572284, lng: -73.9677693, kind: "bar" },
  { id: "uluh", name: "uluh", address: "152 Second Ave", lat: 40.7294457, lng: -73.9868292, kind: "nice" },
  { id: "village-east", name: "Village East by Angelika", address: "181-189 Second Ave", lat: 40.7292, lng: -73.9858, kind: "activity" },
  { id: "win-son-bakery", name: "Win Son Bakery", address: "23 2nd Ave", lat: 40.7246056, lng: -73.9909301, kind: "cafe" },
];
