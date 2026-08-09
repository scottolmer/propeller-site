export const FPS = 30;
export const DURATION_SECONDS = 387.675;
export const VIDEO_DURATION_FRAMES = Math.ceil(DURATION_SECONDS * FPS);

export type Agent = {name: string; label: string; score: number};

export const fixture = {
  player: "Josh Allen",
  team: "BUF",
  stat: "Passing Yards",
  line: "195.5",
  direction: "UNDER",
  confidence: 62,
  date: "DEC 29, 2025",
  week: "2025 · WEEK 17",
  platform: "NOT RETAINED",
};

export const agents: Agent[] = [
  {name: "DVOA", label: "Team Efficiency", score: 42},
  {name: "GameScript", label: "Game Script", score: 58},
  {name: "HitRate", label: "Hit Rate", score: 49.65},
  {name: "Injury", label: "Injury Impact", score: 50},
  {name: "Matchup", label: "Defensive Matchup", score: 25},
  {name: "NoVig", label: "Market Check", score: 51.04},
  {name: "Variance", label: "Variance", score: 62},
  {name: "Volume", label: "Usage Volume", score: 70},
];

export const mobileAgentNames = new Set(["DVOA", "Volume", "Injury", "Matchup", "NoVig"]);

export const scenes = [
  {start: 0, end: 22.6, kind: "intro", eyebrow: "NFL PLAYER PROP RESEARCH", title: "Start with the market. Not the model."},
  {start: 22.6, end: 36.84, kind: "availability", eyebrow: "GAME-WEEK WORKFLOW", title: "First: verify that a current slate exists."},
  {start: 36.84, end: 54.2, kind: "disclosure", eyebrow: "ARCHIVED 2025 DATA", title: "Historical data. Clearly labeled."},
  {start: 54.2, end: 77.7, kind: "availability", eyebrow: "STEP 01 · AVAILABILITY", title: "No slate is still useful information."},
  {start: 77.7, end: 101.04, kind: "identity", eyebrow: "VERIFY THE DECISION", title: "Player. Stat. Line. Platform. Time."},
  {start: 101.04, end: 134.58, kind: "role", eyebrow: "STEP 02 · ROLE", title: "Research the opportunity behind the result."},
  {start: 134.58, end: 161.54, kind: "injury", eyebrow: "STEP 03 · INJURIES", title: "Injury context is a cascade."},
  {start: 161.54, end: 187.62, kind: "matchup", eyebrow: "STEP 04 · MATCHUP", title: "Build the game environment."},
  {start: 187.62, end: 216.52, kind: "agents", eyebrow: "PROPELLER AGENTS", title: "Eight specialized research lenses."},
  {start: 216.52, end: 244.74, kind: "disagreement", eyebrow: "READ THE BREAKDOWN", title: "Disagreement is a research prompt."},
  {start: 244.74, end: 267.34, kind: "direction", eyebrow: "DIRECTION → CONFIDENCE", title: "Read the direction first."},
  {start: 267.34, end: 289.06, kind: "probability", eyebrow: "KEEP THE FIELDS SEPARATE", title: "Confidence is not win probability."},
  {start: 289.06, end: 309.56, kind: "movement", eyebrow: "LINE MOVEMENT", title: "A changed line creates a new question."},
  {start: 309.56, end: 334.48, kind: "checklist", eyebrow: "FINAL CHECK", title: "Seven questions before a decision."},
  {start: 334.48, end: 348.24, kind: "pass", eyebrow: "A VALID OUTCOME", title: "No action."},
  {start: 348.24, end: 361.02, kind: "freshness", eyebrow: "CLOSE TO KICKOFF", title: "Repeat the freshness check."},
  {start: 361.02, end: DURATION_SECONDS, kind: "cta", eyebrow: "PROPELLER PICKS", title: "Research the prop. Understand the assumptions."},
] as const;
