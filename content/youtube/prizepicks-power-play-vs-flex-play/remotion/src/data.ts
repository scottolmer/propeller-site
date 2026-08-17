export const FPS = 30;
export const DURATION_FRAMES = 7800;

export type SceneKind = "intro" | "rules" | "power-chart" | "flex-chart" | "example" | "details" | "reversions" | "calculator" | "summary" | "cta";

export type Scene = {id: string; start: number; end: number; kind: SceneKind; eyebrow: string; title: string};

export const scenes: Scene[] = [
  {id: "01", start: 0, end: 23.44, kind: "intro", eyebrow: "POWER PLAY vs. FLEX PLAY", title: "ONE TRADEOFF. TWO PAYOUT SHAPES."},
  {id: "02", start: 23.44, end: 47.88, kind: "rules", eyebrow: "PLAYER PICKS · CURRENT RULES", title: "START WITH THE LINEUP CONSTRAINTS."},
  {id: "03", start: 47.88, end: 68.64, kind: "power-chart", eyebrow: "STANDARD PLAYER PICK RATES", title: "POWER: EVERY ACTIVE PICK CORRECT."},
  {id: "04", start: 68.64, end: 94.70, kind: "flex-chart", eyebrow: "STANDARD PLAYER PICK RATES", title: "FLEX: MORE THAN ONE PAYOUT TIER."},
  {id: "05", start: 94.70, end: 123.54, kind: "example", eyebrow: "$20 · FOUR-PICK EXAMPLE", title: "THE SAME PICKS. A DIFFERENT PAYOUT SHAPE."},
  {id: "06", start: 123.54, end: 151.08, kind: "details", eyebrow: "THE CONTROLLING NUMBER", title: "THE INDIVIDUAL DETAILS SCREEN WINS."},
  {id: "07", start: 151.08, end: 189.94, kind: "reversions", eyebrow: "DNP · REBOOT · TIE", title: "SPECIAL OUTCOMES CAN LOWER THE TIER."},
  {id: "08", start: 189.94, end: 216.12, kind: "calculator", eyebrow: "PROPELLER SCENARIO TOOL", title: "ILLUSTRATE THE MATH. DO NOT PREDICT THE RESULT."},
  {id: "09", start: 216.12, end: 237.12, kind: "summary", eyebrow: "THE SHORT ANSWER", title: "POWER CONCENTRATES. FLEX ADDS TIERS."},
  {id: "10", start: 237.12, end: 260, kind: "cta", eyebrow: "RULES CHANGE · VERIFY CURRENT TERMS", title: "CHECK THE DETAILS SCREEN BEFORE ACTING."},
];

export const powerRates = [
  {picks: "2", result: "2 / 2", multiplier: "3x"},
  {picks: "3", result: "3 / 3", multiplier: "6x"},
  {picks: "4", result: "4 / 4", multiplier: "10x"},
  {picks: "5", result: "5 / 5", multiplier: "20x"},
  {picks: "6", result: "6 / 6", multiplier: "37.5x"},
];

export const flexRates = [
  {picks: "2", tiers: ["2/2 · 2x", "1/2 · 0.5x"]},
  {picks: "3", tiers: ["3/3 · 3x", "2/3 · 1x"]},
  {picks: "4", tiers: ["4/4 · 6x", "3/4 · 1.5x"]},
  {picks: "5", tiers: ["5/5 · 10x", "4/5 · 2x", "3/5 · 0.4x"]},
  {picks: "6", tiers: ["6/6 · 25x", "5/6 · 2x", "4/6 · 0.4x"]},
];
