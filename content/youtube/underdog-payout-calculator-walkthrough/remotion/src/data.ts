export const FPS = 30;
export const DURATION_SECONDS = 202;
export const VIDEO_DURATION_FRAMES = FPS * DURATION_SECONDS;

export type SceneKind =
  | "formula"
  | "roadmap"
  | "calculator"
  | "standard"
  | "total"
  | "whatif"
  | "flex"
  | "upto"
  | "changes"
  | "checklist"
  | "truth"
  | "cta";

export type Scene = {
  id: number;
  start: number;
  end: number;
  kind: SceneKind;
  eyebrow: string;
  title: string;
};

export const scenes: Scene[] = [
  {id: 1, start: 0, end: 20.54, kind: "formula", eyebrow: "THE SHORT ANSWER", title: "Possible payout starts with one multiplication."},
  {id: 2, start: 20.54, end: 36.62, kind: "roadmap", eyebrow: "THREE THINGS TO READ", title: "Standard. Flex. Final screen."},
  {id: 3, start: 36.62, end: 55.78, kind: "calculator", eyebrow: "FREE SCENARIO ESTIMATOR", title: "Choose the format, picks, and amount."},
  {id: 4, start: 55.78, end: 74.4, kind: "standard", eyebrow: "ILLUSTRATIVE STANDARD EXAMPLE", title: "Five picks · ten dollars · twenty times."},
  {id: 5, start: 74.4, end: 83.38, kind: "total", eyebrow: "READ BOTH NUMBERS", title: "Total payout includes the entry amount."},
  {id: 6, start: 83.38, end: 99.06, kind: "whatif", eyebrow: "SCENARIO CONTROL", title: "Your hit-rate assumption is not a forecast."},
  {id: 7, start: 99.06, end: 121.3, kind: "flex", eyebrow: "ILLUSTRATIVE FLEX EXAMPLE", title: "One card. Three possible result rows."},
  {id: 8, start: 121.3, end: 132, kind: "upto", eyebrow: "FLEX DETAIL", title: "Lower-result amounts can be “up to.”"},
  {id: 9, start: 132, end: 146.5, kind: "changes", eyebrow: "WHY THE NUMBER CAN MOVE", title: "The displayed multiplier belongs to that entry."},
  {id: 10, start: 146.5, end: 169.48, kind: "checklist", eyebrow: "BEFORE SUBMITTING", title: "Run the four-step payout check."},
  {id: 11, start: 169.48, end: 180.94, kind: "truth", eyebrow: "SOURCE OF TRUTH", title: "Current Underdog disclosure beats an old chart."},
  {id: 12, start: 180.94, end: 202, kind: "cta", eyebrow: "INDEPENDENT RESEARCH", title: "Estimate the math. Verify the screen."},
];
