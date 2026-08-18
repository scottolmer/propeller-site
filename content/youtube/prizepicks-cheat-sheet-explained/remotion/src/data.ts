export const FPS = 30;
export type SceneKind = "hook" | "current" | "identity" | "line" | "confidence" | "evidence" | "context" | "freshness" | "boundary" | "limits" | "checklist" | "mobile" | "close";
export type Scene = {id: string; start: number; end: number; eyebrow: string; title: string; kind: SceneKind};
export const scenes: Scene[] = [
  {id:"01",start:0,end:17.96,eyebrow:"ANSWER FIRST",title:"A dated research snapshot—not a promise",kind:"hook"},
  {id:"02",start:17.96,end:35.48,eyebrow:"THE QUESTION",title:"Player, stat, and exact line",kind:"identity"},
  {id:"03",start:35.48,end:51.67,eyebrow:"FRESHNESS",title:"The row and timestamp must agree",kind:"freshness"},
  {id:"04",start:51.67,end:72.28,eyebrow:"DATED EXAMPLE",title:"One current Propeller row on both screens",kind:"current"},
  {id:"05",start:72.28,end:84.18,eyebrow:"CONFIDENCE",title:"Signal strength is not win probability",kind:"confidence"},
  {id:"06",start:84.18,end:108.68,eyebrow:"SUPPORTING DATA",title:"Inspect evidence—and missing inputs",kind:"evidence"},
  {id:"07",start:108.68,end:132,eyebrow:"CONTEXT",title:"Signals describe. They do not promise.",kind:"context"},
  {id:"08",start:132,end:152.68,eyebrow:"READ SEPARATELY",title:"Direction, confidence, payout, availability",kind:"confidence"},
  {id:"09",start:152.68,end:178.22,eyebrow:"PLATFORM CHECK",title:"No verified PrizePicks match means stop",kind:"boundary"},
  {id:"10",start:178.22,end:195.54,eyebrow:"LIMITS",title:"What a cheat sheet cannot establish",kind:"limits"},
  {id:"11",start:195.54,end:215.34,eyebrow:"CHECKLIST",title:"Eight checks before a decision",kind:"checklist"},
  {id:"12",start:215.34,end:232.9,eyebrow:"TAKEAWAY",title:"Clear question. Visible limits. Honest check.",kind:"close"},
];
export const DURATION_FRAMES = Math.ceil(232.9 * FPS);
