export const FPS = 30;
export const DURATION_SECONDS = 333.35;
export const VIDEO_DURATION_FRAMES = Math.ceil(DURATION_SECONDS * FPS);

export const fixture = {
  player: "Josh Allen",
  team: "BUF",
  stat: "Passing Yards",
  line: "195.5",
  direction: "UNDER",
  confidence: 62,
  date: "DEC 29, 2025",
  week: "2025 · WEEK 17",
  platform: "NOT RETAINED — VERIFY",
};

export const scenes = [
  {start: 0, end: 27.72, kind: "intro", eyebrow: "FREE NFL PLAYER PROP ANALYZER", title: "Research one exact player line."},
  {start: 27.72, end: 39.36, kind: "select", eyebrow: "STEP 01 · SELECT NFL", title: "Check the slate before the score."},
  {start: 39.36, end: 70.5, kind: "empty", eyebrow: "CURRENT NFL STATUS", title: "No current props is useful information."},
  {start: 70.5, end: 90.8, kind: "disclosure", eyebrow: "ARCHIVED 2025 DATA", title: "Historical interface example."},
  {start: 90.8, end: 122.22, kind: "identity", eyebrow: "STEP 02 · DEFINE THE QUESTION", title: "Player. Stat. Exact line. Platform."},
  {start: 122.22, end: 142.64, kind: "direction", eyebrow: "STEP 03 · READ DIRECTION", title: "Direction comes before confidence."},
  {start: 142.64, end: 173.22, kind: "confidence", eyebrow: "STEP 04 · READ CONFIDENCE", title: "Signal strength is not probability."},
  {start: 173.22, end: 192.46, kind: "boundary", eyebrow: "THE FREE ANALYZER", title: "A focused player-line lookup."},
  {start: 192.46, end: 217.12, kind: "prompt", eyebrow: "NEXT RESEARCH STEP", title: "Build a structured AI research prompt."},
  {start: 217.12, end: 239.6, kind: "workspace", eyebrow: "SEPARATE PRODUCT SURFACE", title: "The full workspace goes deeper."},
  {start: 239.6, end: 265.82, kind: "freshness", eyebrow: "FINAL FRESHNESS CHECK", title: "Reverify what can change."},
  {start: 265.82, end: 280.16, kind: "noaction", eyebrow: "A VALID RESULT", title: "No action."},
  {start: 280.16, end: 299.06, kind: "proof", eyebrow: "METHOD + PUBLIC RESULTS", title: "Understand the score. Inspect the record."},
  {start: 299.06, end: DURATION_SECONDS, kind: "cta", eyebrow: "PROPELLER PICKS", title: "Build the habit before game week."},
] as const;

export type Scene = typeof scenes[number];
