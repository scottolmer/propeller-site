export const FPS = 30;
export const DURATION_SECONDS = 324.85;
export const DURATION_IN_FRAMES = Math.ceil(DURATION_SECONDS * FPS);

export const sceneStarts = [
  0,
  21.88,
  44.42,
  91.48,
  112.3,
  151.22,
  171.58,
  195,
  219.58,
  244.42,
  265.72,
  286.2,
  DURATION_SECONDS,
].map((seconds) => Math.round(seconds * FPS));

export const colors = {
  ink: "#101311",
  paper: "#f2efe8",
  paperBright: "#fbfaf6",
  orange: "#ff6038",
  green: "#147d50",
  lime: "#bdf477",
  blue: "#2f59db",
  muted: "#66706b",
  line: "#d5d0c5",
  darkCard: "#17201b",
};

export type Player = {
  name: string;
  team: string;
  floor: number;
  projection: number;
  ceiling: number;
  inputs: number;
  games: number;
};

export const players: Player[] = [
  { name: "Elly De La Cruz", team: "CIN", floor: 5.3, projection: 12.8, ceiling: 24.1, inputs: 7, games: 20 },
  { name: "James Wood", team: "WSH", floor: 0, projection: 11.4, ceiling: 18.5, inputs: 3, games: 20 },
  { name: "JJ Bleday", team: "CIN", floor: 6.8, projection: 11, ceiling: 16.8, inputs: 6, games: 20 },
  { name: "Jake McCarthy", team: "COL", floor: 2.6, projection: 11, ceiling: 24.4, inputs: 5, games: 20 },
];
