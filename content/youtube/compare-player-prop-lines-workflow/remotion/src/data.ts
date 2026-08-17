export const FPS = 30;
export const AUDIO_DURATION_SECONDS = 222.6;
export const VIDEO_DURATION_FRAMES = Math.ceil(AUDIO_DURATION_SECONDS * FPS);

export type SceneKind = "hook" | "fields" | "terms" | "match" | "propeller" | "evidence" | "refresh" | "decision" | "close";

export type Scene = {
  id: string;
  start: number;
  end: number;
  kind: SceneKind;
  eyebrow: string;
  title: string;
};

export const scenes: Scene[] = [
  {id: "01", start: 0, end: 22.64, kind: "hook", eyebrow: "THE DESKTOP WORKFLOW", title: "Compare the question. Not the biggest number."},
  {id: "02", start: 22.64, end: 45.64, kind: "fields", eyebrow: "BUILD THE RESEARCH ROW", title: "Six fields before any opinion."},
  {id: "03", start: 45.64, end: 74.56, kind: "terms", eyebrow: "KEEP TERMS SEPARATE", title: "Price is not payout context."},
  {id: "04", start: 74.56, end: 100.52, kind: "match", eyebrow: "THE SPEED TRICK", title: "Exact matches first."},
  {id: "05", start: 100.52, end: 128.14, kind: "propeller", eyebrow: "ADD THE EVIDENCE LAYER", title: "Confirm the displayed line."},
  {id: "06", start: 128.14, end: 156.48, kind: "evidence", eyebrow: "INSPECT WHAT SUPPORTS IT", title: "Signals need context."},
  {id: "07", start: 156.48, end: 179.46, kind: "refresh", eyebrow: "RECHECK BEFORE DECIDING", title: "A moved line gets a new row."},
  {id: "08", start: 179.46, end: 200.2, kind: "decision", eyebrow: "THE DECISION GATE", title: "No action is a valid result."},
  {id: "09", start: 200.2, end: AUDIO_DURATION_SECONDS, kind: "close", eyebrow: "PROPELLER PICKS", title: "Research the exact line."},
];
