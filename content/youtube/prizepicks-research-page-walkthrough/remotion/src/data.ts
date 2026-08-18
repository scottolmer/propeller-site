export const FPS = 30;
export type SceneKind = "hook" | "current" | "identity" | "line" | "confidence" | "evidence" | "gap" | "context" | "freshness" | "platform" | "boundary" | "limits" | "checklist" | "mobile" | "close";
export type Scene = {id: string; start: number; end: number; eyebrow: string; title: string; kind: SceneKind};
export const scenes: Scene[] = [
  {id:"01",start:0,end:20.58,eyebrow:"SAFE WORKFLOW",title:"Find, match, inspect, verify—or stop",kind:"hook"},
  {id:"02",start:20.58,end:33.48,eyebrow:"SOURCE BOUNDARY",title:"Current Propeller analysis, not a platform claim",kind:"current"},
  {id:"03",start:33.48,end:51.8,eyebrow:"STEP ONE",title:"Open the page and check the visible date",kind:"freshness"},
  {id:"04",start:51.8,end:65.76,eyebrow:"MATCHED CAPTURE",title:"The same row on desktop and mobile",kind:"current"},
  {id:"05",start:65.76,end:77.92,eyebrow:"EXACT ROW",title:"Player, stat, and line define the question",kind:"identity"},
  {id:"06",start:77.92,end:94.32,eyebrow:"STEP TWO",title:"Read direction and confidence separately",kind:"confidence"},
  {id:"07",start:94.32,end:117.3,eyebrow:"STEP THREE",title:"Inspect the five dated evidence agents",kind:"evidence"},
  {id:"08",start:117.3,end:133.88,eyebrow:"MISSING INPUT",title:"No injury data means check late news",kind:"gap"},
  {id:"09",start:133.88,end:155.38,eyebrow:"STEP FOUR",title:"Use the source-analysis timestamp",kind:"freshness"},
  {id:"10",start:155.38,end:171.12,eyebrow:"STEP FIVE",title:"Search the actual PrizePicks projection",kind:"platform"},
  {id:"11",start:171.12,end:188.38,eyebrow:"TRUTH GATE",title:"The platform-backed result is empty",kind:"boundary"},
  {id:"12",start:188.38,end:199.76,eyebrow:"NO SUBSTITUTES",title:"A similar line is not the same question",kind:"boundary"},
  {id:"13",start:199.76,end:217.74,eyebrow:"MOBILE",title:"Same order. Same truth gate.",kind:"mobile"},
  {id:"14",start:217.74,end:234.08,eyebrow:"REFRESH",title:"Any mismatch invalidates the row",kind:"limits"},
  {id:"15",start:234.08,end:255.1,eyebrow:"TAKEAWAY",title:"Exact row. Evidence. Freshness. Platform.",kind:"close"},
];
export const DURATION_FRAMES = Math.ceil(255.1 * FPS);
