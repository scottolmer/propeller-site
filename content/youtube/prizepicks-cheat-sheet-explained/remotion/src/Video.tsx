import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
import {Audio} from "@remotion/media";
import {Captions} from "./Captions";
import {fontCss, displayFont, monoFont, sansFont} from "./fonts";
import {FPS, scenes, type Scene, type SceneKind} from "./data";

const C = {ink: "#101311", paper: "#f2efe8", cream: "#e8e3d9", orange: "#ff6038", green: "#147d50", red: "#b43e2a", slate: "#59615c", mist: "#dadfdc", white: "#fffef9"};
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const Mark: React.FC<{size?: number}> = ({size = 42}) => <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="8" fill={C.orange}/><path d="M36 28V6" stroke={C.orange} strokeWidth="9" strokeLinecap="round"/><path d="M29 40L10 51" stroke={C.orange} strokeWidth="9" strokeLinecap="round"/><path d="M43 40L62 51" stroke={C.orange} strokeWidth="9" strokeLinecap="round"/></svg>;

const Pill: React.FC<{children: React.ReactNode; tone?: "orange" | "green" | "paper" | "red"}> = ({children, tone = "paper"}) => {
  const bg = tone === "orange" ? C.orange : tone === "green" ? C.green : tone === "red" ? C.red : C.cream;
  return <span style={{display: "inline-flex", padding: "10px 15px", background: bg, color: tone === "paper" ? C.ink : C.white, fontFamily: monoFont, fontSize: 14, letterSpacing: .6, borderRadius: 999, whiteSpace: "nowrap"}}>{children}</span>;
};

const Cursor: React.FC<{from: [number, number]; to: [number, number]; start?: number; end?: number; label?: string}> = ({from, to, start = 8, end = 42, label}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [start, end], [from[0], to[0]], {...clamp, easing: Easing.bezier(.16,1,.3,1)});
  const y = interpolate(frame, [start, end], [from[1], to[1]], {...clamp, easing: Easing.bezier(.16,1,.3,1)});
  const pulse = interpolate(frame, [end, end + 8, end + 16], [0, 1, 0], clamp);
  return <div style={{position:"absolute",left:x,top:y,zIndex:20,pointerEvents:"none"}}><div style={{position:"absolute",width:58,height:58,borderRadius:99,border:`4px solid ${C.orange}`,left:-24,top:-24,opacity:pulse,scale:1+pulse*.55}}/><svg width="34" height="42" viewBox="0 0 34 42" style={{filter:"drop-shadow(0 3px 2px rgba(0,0,0,.35))"}}><path d="M4 2v31l8-8 6 14 7-4-6-13h12z" fill={C.ink} stroke={C.paper} strokeWidth="2"/></svg>{label?<div style={{position:"absolute",left:28,top:24,whiteSpace:"nowrap",background:C.ink,color:C.paper,borderLeft:`5px solid ${C.orange}`,padding:"8px 11px",fontFamily:monoFont,fontSize:12}}>{label}</div>:null}</div>;
};

const SceneShell: React.FC<{scene: Scene; children: React.ReactNode; dark?: boolean}> = ({scene, children, dark = false}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: dark ? C.ink : C.paper, color: dark ? C.paper : C.ink, overflow: "hidden"}}><style>{fontCss}</style><div style={{position: "absolute", inset: 0, background: dark ? "radial-gradient(circle at 76% 16%, rgba(255,96,56,.22), transparent 36%)" : "radial-gradient(circle at 82% 18%, rgba(255,96,56,.12), transparent 33%)"}}/><div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: C.orange}}/><div style={{position: "relative", height: "100%", padding: "50px 72px 184px 92px", display: "grid", gridTemplateRows: "106px 1fr", gap: 18}}><header style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", opacity: interpolate(frame, [0, 14], [0, 1], clamp), translate: `0 ${interpolate(frame, [0, 18], [15, 0], {...clamp, easing: Easing.bezier(.16,1,.3,1)})}px`}}><div><div style={{display: "flex", alignItems: "center", gap: 12, fontFamily: monoFont, color: C.orange, fontSize: 15, letterSpacing: 1.2}}><Mark size={28}/>{scene.id} · {scene.eyebrow}</div><div style={{fontFamily: displayFont, fontSize: 50, fontWeight: 700, lineHeight: .98, letterSpacing: -1.3, marginTop: 8}}>{scene.title}</div></div><div style={{fontFamily: monoFont, fontSize: 13, color: dark ? "#b7beb8" : C.slate, textAlign: "right", lineHeight: 1.55}}>PROPELLER PICKS<br/>RESEARCH, NOT A SPORTSBOOK</div></header><div style={{minHeight: 0}}>{children}</div></div></AbsoluteFill>;
};

const BrowserFrame: React.FC<{src: string; objectPosition?: string; scale?: number; label?: string}> = ({src, objectPosition = "center center", scale = 1, label = "CURRENT PROPELLER PUBLIC PAGE"}) => {
  const frame = useCurrentFrame();
  return <div style={{height: "100%", border: `2px solid ${C.ink}`, background: C.white, boxShadow: "16px 18px 0 rgba(16,19,17,.13)", overflow: "hidden", position: "relative"}}><div style={{height: 38, background: C.ink, display: "flex", alignItems: "center", padding: "0 14px", gap: 7}}>{[C.red, "#e0a22c", C.green].map((color) => <span key={color} style={{width: 9, height: 9, borderRadius: 99, background: color}}/>)}<span style={{marginLeft: 12, color: "#bfc6c0", fontFamily: monoFont, fontSize: 11}}>propellerpicks.com</span></div><div style={{height: "calc(100% - 38px)", overflow: "hidden"}}><Img src={staticFile(src)} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition, scale: interpolate(frame, [0, 800], [scale, scale + .035], clamp)}}/></div><div style={{position: "absolute", left: 18, bottom: 18}}><Pill tone="orange">{label}</Pill></div></div>;
};

const PhoneFrame: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{height: 520, width: 256, border: `8px solid ${C.ink}`, borderRadius: 33, background: C.white, overflow: "hidden", boxShadow: "13px 16px 0 rgba(16,19,17,.17)", position: "relative"}}><Img src={staticFile("assets/prizepicks-mobile.png")} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", scale: interpolate(frame, [0, 700], [1.01, 1.04], clamp)}}/><div style={{position: "absolute", left: 12, bottom: 11}}><Pill tone="orange">MOBILE · AUG 17</Pill></div></div>;
};

const CurrentPair: React.FC<{focus?: "line" | "confidence" | "date"}> = ({focus}) => <div style={{height: "100%", display: "grid", gridTemplateColumns: "1fr 290px", gap: 34, alignItems: "center"}}><div style={{height: 520, position: "relative"}}><BrowserFrame src="assets/prizepicks-desktop.png" objectPosition={focus === "date" ? "center 36%" : "center 47%"} scale={focus ? 1.08 : 1}/><Cursor from={[180,410]} to={focus === "date"?[850,92]:[315,250]} label={focus === "date"?"CHECK THE VISIBLE DATE":"OPEN THE EXACT ROW"}/>{focus ? <div style={{position: "absolute", right: 26, top: 82, padding: "16px 20px", background: "rgba(16,19,17,.94)", borderLeft: `7px solid ${C.orange}`, color: C.paper, fontFamily: monoFont, fontSize: 16}}>{focus === "line" ? "PLAYER · STAT · EXACT LINE" : focus === "confidence" ? "DIRECTION ≠ CONFIDENCE" : "DATED CURRENT RESEARCH"}</div> : null}</div><div style={{display: "grid", justifyItems: "center", gap: 18}}><PhoneFrame/><div style={{display: "flex", gap: 8}}><Pill tone="green">SAME ROW</Pill><Pill>DESKTOP + MOBILE</Pill></div></div></div>;

const IdentityCard: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [["PLAYER", "Christian Franklin"], ["STAT", "RBIs"], ["EXACT LINE", "0.5"]];
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 38, alignItems: "center"}}><div style={{height: 510,position:"relative"}}><BrowserFrame src="assets/analyzer-desktop.png" objectPosition="left 74%" scale={1.13} label="CURRENT PROPELLER ANALYZER · AUG 17"/><Cursor from={[140,400]} to={[320,260]} label="SELECT CHRISTIAN FRANKLIN"/></div><div style={{display: "grid", gap: 14}}>{items.map(([label, value], i) => <div key={label} style={{padding: "23px 26px", background: i === 2 ? "#fff0ea" : C.white, border: `2px solid ${i === 2 ? C.orange : C.ink}`, translate: `${interpolate(frame, [i*18, i*18+18], [26,0], clamp)}px 0`, opacity: interpolate(frame, [i*18, i*18+18], [0,1], clamp)}}><div style={{fontFamily: monoFont, color: i === 2 ? C.orange : C.slate, fontSize: 13}}>{label}</div><div style={{fontFamily: displayFont, fontSize: 41, fontWeight: 700, marginTop: 7}}>{value}</div></div>)}</div></div>;
};

const ConfidenceScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 40, alignItems: "center"}}><div style={{height: 520,position:"relative"}}><BrowserFrame src="assets/analyzer-desktop.png" objectPosition="left 76%" scale={1.2} label="EXACT CURRENT ROW"/><Cursor from={[160,430]} to={[430,300]} label="OPEN THE BREAKDOWN"/></div><div style={{display: "grid", gap: 18}}><div style={{padding: 30, background: "#fff0ea", border: `3px solid ${C.orange}`}}><div style={{fontFamily: monoFont, color: C.orange}}>DIRECTION</div><div style={{fontFamily: displayFont, fontSize: 65, fontWeight: 700, marginTop: 8}}>UNDER</div><div style={{fontFamily: sansFont, fontSize: 19, color: C.slate}}>Which side the combined analysis supports.</div></div><div style={{padding: 30, background: "#edf7f2", border: `3px solid ${C.green}`, scale: interpolate(frame, [30,55], [.96,1], clamp)}}><div style={{fontFamily: monoFont, color: C.green}}>MODEL CONFIDENCE</div><div style={{fontFamily: displayFont, fontSize: 65, fontWeight: 700, marginTop: 8}}>79</div><div style={{fontFamily: sansFont, fontSize: 19, color: C.slate}}>Signal strength for this line. Not win probability.</div></div></div></div>;
};

const agents = [["HIT RATE", "UNDER", "0 of 20 over · historical trend"], ["BALLPARK", "UNDER", "Pitcher-friendly park context"], ["USAGE", "UNDER", "Usage-adjusted projection below 0.5"], ["MARKET", "NEUTRAL", "One source · implied context only"], ["INJURY", "MISSING", "No injury report data available"]] as const;
const EvidenceScene: React.FC<{timeline: ReadonlyArray<readonly [number, number]>}> = ({timeline}) => {
  const frame = useCurrentFrame();
  const active = timeline.reduce((current, [startFrame, agentIndex]) => frame >= startFrame ? agentIndex : current, timeline[0]?.[1] ?? 0);
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 38, alignItems: "center"}}><div style={{position:"relative"}}><div style={{display:"inline-flex",alignItems:"center",gap:10,background:C.ink,color:C.paper,padding:"8px 13px",marginBottom:9,fontFamily:monoFont,fontSize:13}}><span style={{color:C.orange}}>DETAIL OPEN</span> CHRISTIAN FRANKLIN · RBIs 0.5</div><Cursor from={[520,-25]} to={[active%2===0?230:600,active<2?130:active<4?240:340]} start={0} end={24}/><div style={{fontFamily: monoFont, color: C.orange, fontSize: 14, marginBottom: 9}}>CURRENT PROPELLER ANALYSIS · AUG 17, 2026 · 20:30 UTC</div><div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9}}>{agents.map(([name, direction, note], i) => <div key={name} style={{padding: "13px 17px", minHeight: 94, background: i === active ? "#fff0ea" : C.white, border: `2px solid ${i === active ? C.orange : "#d3d5d0"}`,opacity:interpolate(frame,[i*9,i*9+12],[0,1],clamp),translate:`0 ${interpolate(frame,[i*9,i*9+12],[10,0],clamp)}px`}}><div style={{display: "flex", justifyContent: "space-between", fontFamily: monoFont, fontSize: 13}}><span>{name}</span><strong style={{color: direction === "UNDER" ? C.red : direction === "MISSING" ? C.orange : C.slate}}>{direction}</strong></div><div style={{fontFamily: sansFont, fontSize: 16, color: C.slate, lineHeight: 1.25, marginTop: 10}}>{note}</div></div>)}</div></div><div style={{padding: 30, background: C.ink, color: C.paper, borderLeft: `9px solid ${C.orange}`}}><div style={{fontFamily: monoFont, color: C.orange}}>EVIDENCE, INCLUDING GAPS</div><div style={{fontFamily: displayFont, fontSize: 46, fontWeight: 700, lineHeight: .98, marginTop: 15}}>Missing injury data is part of the answer.</div><div style={{fontFamily: sansFont, fontSize: 19, color: "#c8cec9", lineHeight: 1.35, marginTop: 18}}>Check late news, lineup status, and any moved line yourself.</div></div></div>;
};

const FreshnessScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: "1fr .8fr", gap: 42, alignItems: "center"}}><div style={{height: 510}}><BrowserFrame src="assets/prizepicks-desktop.png" objectPosition="center 34%" scale={1.08} label="VISIBLE PAGE DATE · AUG 17"/></div><div>{[["PAGE DATE", "AUG 17, 2026", C.orange], ["ANALYZED AT", "20:30:12 UTC", C.green], ["PLATFORM MATCH", "NOT AVAILABLE", C.red]].map(([label,value,color],i)=><div key={label} style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:18,padding:"20px 0",borderBottom:`2px solid ${C.ink}`,opacity:interpolate(frame,[i*18,i*18+14],[0,1],clamp)}}><span style={{fontFamily:monoFont,color}}>{label}</span><strong style={{fontFamily:displayFont,fontSize:36}}>{value}</strong></div>)}<div style={{marginTop: 23, fontFamily: sansFont, fontSize: 19, color: C.slate, lineHeight: 1.45}}>Page-load time is not the source-analysis time. Preserve the actual analysis timestamp.</div></div></div>;
};

const BoundaryScene: React.FC = () => {
  const frame = useCurrentFrame(); const failed = frame > 55;
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: "1fr .75fr", gap: 42, alignItems: "center"}}><div style={{display: "grid", gap: 13}}>{[["PLAYER", "Christian Franklin", "MATCH"], ["STAT", "RBIs", "MATCH"], ["PROPELLER LINE", "0.5", "CURRENT"], ["PRIZEPICKS LINE", "No platform record", "FAIL"]].map(([label,value,status],i)=><div key={label} style={{display:"grid",gridTemplateColumns:"190px 1fr 120px",alignItems:"center",padding:"20px 22px",background:C.white,borderLeft:`8px solid ${status==="FAIL"?C.red:C.green}`,opacity:interpolate(frame,[i*14,i*14+12],[0,1],clamp)}}><span style={{fontFamily:monoFont,color:C.slate}}>{label}</span><strong style={{fontFamily:displayFont,fontSize:29}}>{value}</strong><span style={{fontFamily:monoFont,textAlign:"right",color:status==="FAIL"?C.red:C.green}}>{status}</span></div>)}</div><div style={{padding: "48px 34px", textAlign: "center", border: `4px solid ${failed ? C.red : C.green}`, color: failed ? C.red : C.green, rotate: failed ? "-2deg" : "0deg", scale: interpolate(frame, [45,75], [.94,1], clamp)}}><div style={{fontFamily: monoFont}}>PLATFORM CHECK</div><div style={{fontFamily: displayFont, fontSize: 65, fontWeight: 700, lineHeight: .9, marginTop: 18}}>NO VERIFIED<br/>PRIZEPICKS MATCH</div><div style={{fontFamily: sansFont, color: C.slate, fontSize: 20, marginTop: 23}}>Stop. Do not substitute a similar line.</div></div></div>;
};

const LimitsScene: React.FC = () => {
  const frame = useCurrentFrame(); const limits = ["PLAYER ACTIVE", "LINE UNCHANGED", "AVAILABLE IN YOUR LOCATION", "ENTRY TERMS", "FUTURE OUTCOME"];
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 50, alignItems: "center"}}><div><div style={{fontFamily: displayFont, fontSize: 76, fontWeight: 700, lineHeight: .91}}>A cheat sheet<br/><span style={{color:C.orange}}>cannot prove</span><br/>the final screen.</div><div style={{fontFamily:sansFont,fontSize:20,color:C.slate,lineHeight:1.45,marginTop:25}}>Use the research to ask a precise question. Use the live platform to verify it.</div></div><div style={{display:"grid",gap:12}}>{limits.map((item,i)=><div key={item} style={{padding:"20px 24px",background:C.white,border:`2px solid ${C.ink}`,display:"flex",justifyContent:"space-between",opacity:interpolate(frame,[i*16,i*16+13],[0,1],clamp),translate:`${interpolate(frame,[i*16,i*16+16],[28,0],clamp)}px 0`}}><span style={{fontFamily:monoFont,fontSize:18}}>{String(i+1).padStart(2,"0")} · {item}</span><strong style={{fontFamily:monoFont,color:C.red}}>VERIFY</strong></div>)}</div></div>;
};

const ChecklistScene: React.FC = () => {
  const frame = useCurrentFrame(); const items = ["Player", "Stat", "Exact line", "Timestamp", "Evidence + gaps", "Direction", "Confidence", "PrizePicks check"];
  return <div style={{height:"100%",display:"grid",gridTemplateColumns:"1fr .7fr",gap:44,alignItems:"center"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{items.map((item,i)=><div key={item} style={{padding:"19px 22px",background:i===7?"#fff0ea":C.white,border:`2px solid ${i===7?C.orange:"#d3d5d0"}`,fontFamily:monoFont,fontSize:18,opacity:interpolate(frame,[i*12,i*12+11],[0,1],clamp)}}><span style={{color:i===7?C.orange:C.green,marginRight:13}}>✓</span>{item}</div>)}</div><div style={{padding:35,background:C.ink,color:C.paper,borderLeft:`9px solid ${C.orange}`}}><div style={{fontFamily:monoFont,color:C.orange}}>THE SAFE ORDER</div><div style={{fontFamily:displayFont,fontSize:54,fontWeight:700,lineHeight:.96,marginTop:18}}>Exact row.<br/>Evidence.<br/>Freshness.<br/>Platform.</div></div></div>;
};

const MobileScene: React.FC = () => <div style={{height:"100%",display:"grid",gridTemplateColumns:"320px 1fr",gap:48,alignItems:"center"}}><div style={{display:"grid",justifyItems:"center"}}><PhoneFrame/></div><div><div style={{fontFamily:displayFont,fontSize:65,fontWeight:700,lineHeight:.93}}>Same order.<br/><span style={{color:C.orange}}>Smaller screen.</span><br/>Same truth gate.</div><div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:30}}>{["DATE","PLAYER","STAT","LINE","DIRECTION","CONFIDENCE","EVIDENCE","PLATFORM"].map((x,i)=><Pill key={x} tone={i===7?"orange":i<4?"green":"paper"}>{x}</Pill>)}</div></div></div>;
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{height:"100%",display:"grid",gridTemplateColumns:"1fr .9fr",gap:48,alignItems:"center"}}><div><div style={{fontFamily:displayFont,fontSize:82,fontWeight:700,lineHeight:.89}}>A cheat sheet is<br/><span style={{color:C.orange}}>a question.</span><br/>Not a promise.</div><div style={{fontFamily:sansFont,fontSize:23,color:"#c6cdc7",lineHeight:1.4,marginTop:28}}>Exact row · dated evidence · final platform check</div></div><div style={{position:"relative",height:530,opacity:interpolate(frame,[10,28],[0,1],clamp),translate:`0 ${interpolate(frame,[10,32],[22,0],clamp)}px`}}><BrowserFrame src="assets/prizepicks-desktop.png" objectPosition="center 45%" scale={1.04} label="CURRENT PROPELLER RESEARCH · AUG 17"/></div></div>;
};
const CloseScene: React.FC = () => <div style={{height:"100%",display:"grid",gridTemplateColumns:"1fr .82fr",gap:50,alignItems:"center"}}><div style={{height:520}}><BrowserFrame src="assets/prizepicks-desktop.png" objectPosition="center 45%" scale={1.04} label="PROPELLERPICKS.COM/PICKS/PRIZEPICKS"/></div><div><div style={{display:"flex",alignItems:"center",gap:16}}><Mark size={62}/><div><div style={{fontFamily:displayFont,fontSize:56,fontWeight:700,lineHeight:.85}}>Propeller</div><div style={{fontFamily:monoFont,color:C.orange,letterSpacing:7,marginTop:10}}>PICKS</div></div></div><div style={{fontFamily:displayFont,fontSize:54,fontWeight:700,lineHeight:.96,marginTop:39}}>Research first.<br/>Verify the line.<br/><span style={{color:C.orange}}>Stop on mismatch.</span></div><div style={{fontFamily:sansFont,fontSize:18,color:C.slate,lineHeight:1.45,marginTop:28}}>Independent research and analytics—not a sportsbook.<br/>No model signal guarantees an outcome.</div></div></div>;

const sceneComponents: Record<SceneKind, React.FC> = {
  hook: HookScene,
  current: () => <CurrentPair/>,
  identity: IdentityCard,
  line: () => <CurrentPair focus="line"/>,
  confidence: ConfidenceScene,
  evidence: () => <EvidenceScene timeline={[[0, 0], [215, 1], [259, 2], [284, 3], [329, 4]]}/>,
  context: () => <EvidenceScene timeline={[[0, 0], [218, 1], [377, 3], [539, 4]]}/>,
  freshness: FreshnessScene,
  boundary: BoundaryScene,
  limits: LimitsScene,
  checklist: ChecklistScene,
  mobile: MobileScene,
  close: CloseScene,
};
export const PrizePicksResearchVideo: React.FC<{showCaptions: boolean}> = ({showCaptions}) => <AbsoluteFill style={{background:C.ink}}><Audio src={staticFile("assets/narration.mp3")}/>{scenes.map((scene) => {const Component = sceneComponents[scene.kind]; const dark = scene.kind === "hook" || scene.kind === "close"; return <Sequence key={scene.id} name={`${scene.id} ${scene.title}`} from={Math.round(scene.start*FPS)} durationInFrames={Math.max(1,Math.round((scene.end-scene.start)*FPS))}><SceneShell scene={scene} dark={dark}><Component/></SceneShell></Sequence>;})}{showCaptions ? <Captions/> : null}</AbsoluteFill>;
