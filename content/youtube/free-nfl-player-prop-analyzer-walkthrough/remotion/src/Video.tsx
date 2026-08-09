import {Audio} from "@remotion/media";
import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
import {Captions} from "./Captions";
import {fixture, FPS, scenes, type Scene} from "./data";
import "./fonts";

const C = {ink: "#111316", slate: "#5d626b", paper: "#f2efe8", white: "#ffffff", orange: "#ff6038", green: "#4aaf65", blue: "#5d99ef", line: "#d7d2c9", dark: "#25272d"};
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const PropellerMark: React.FC<{size?: number}> = ({size = 40}) => <svg width={size} height={size} viewBox="0 0 54 54"><circle cx="27" cy="27" r="5.5" fill={C.orange}/><path d="M27 27V5M27 27L7 40M27 27L47 40" stroke={C.orange} strokeWidth="7.5" strokeLinecap="round"/></svg>;

const Pill: React.FC<{children: React.ReactNode; tone?: "orange"|"green"|"dark"|"light"}> = ({children, tone = "light"}) => {
  const map = {orange: ["#fff0eb", C.orange], green: ["#eaf7ed", "#287442"], dark: [C.ink, C.white], light: [C.white, C.slate]} as const;
  return <span style={{display:"inline-flex", alignItems:"center", padding:"8px 14px", borderRadius:999, background:map[tone][0], color:map[tone][1], fontFamily:"IBM Plex Mono", fontSize:13, fontWeight:600, letterSpacing:.7, border:`1px solid ${tone === "light" ? C.line : map[tone][0]}`}}>{children}</span>;
};

const Grid: React.FC = () => <AbsoluteFill style={{background:C.paper, backgroundImage:"linear-gradient(rgba(17,19,22,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(17,19,22,.045) 1px,transparent 1px)", backgroundSize:"36px 36px"}}/>;

const BrandHeader: React.FC<{historical?: boolean}> = ({historical}) => <div style={{height:60, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0}}>
  <div style={{display:"flex", alignItems:"center", gap:12}}><PropellerMark/><div><div style={{fontFamily:"Familjen Grotesk", fontSize:25, fontWeight:700, lineHeight:.9}}>PROPELLER</div><div style={{fontFamily:"IBM Plex Mono", fontSize:10, letterSpacing:5, color:C.orange, marginTop:6}}>PICKS</div></div></div>
  {historical ? <Pill tone="green">HISTORICAL INTERFACE EXAMPLE · NOT A LIVE LINE</Pill> : <Pill>FREE NFL ANALYZER WALKTHROUGH</Pill>}
</div>;

const SceneShell: React.FC<{eyebrow:string; title:string; historical?:boolean; children:React.ReactNode}> = ({eyebrow, title, historical, children}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{overflow:"hidden", color:C.ink}}><Grid/><div style={{position:"relative", height:"100%", padding:"30px 66px 120px", display:"flex", flexDirection:"column", gap:14}}><BrandHeader historical={historical}/><div style={{opacity:interpolate(frame,[0,10],[0,1],clamp), translate:`0 ${interpolate(frame,[0,13],[18,0],{...clamp,easing:Easing.out(Easing.cubic)})}px`, flexShrink:0}}><div style={{fontFamily:"IBM Plex Mono", fontSize:15, letterSpacing:2.2, color:C.orange, fontWeight:600}}>{eyebrow}</div><div style={{fontFamily:"Familjen Grotesk", fontSize:58, fontWeight:700, letterSpacing:-1.8, lineHeight:1, marginTop:6}}>{title}</div></div><div style={{flex:1, minHeight:0}}>{children}</div></div></AbsoluteFill>;
};

const BrowserFrame: React.FC<{children:React.ReactNode; url?:string; width?:number; height?:number}> = ({children, url="propellerpicks.com/analyzer/?sport=nfl", width=1210, height=610}) => <div style={{width, height, borderRadius:18, background:C.ink, padding:"44px 9px 9px", position:"relative", boxShadow:"15px 17px 0 rgba(255,96,56,.17)", overflow:"hidden"}}><div style={{position:"absolute", top:16, left:18, display:"flex", gap:8}}>{[C.orange,"#ffd06b",C.green].map(color=><i key={color} style={{width:11,height:11,borderRadius:99,background:color}}/>)}</div><div style={{position:"absolute",top:10,left:116,right:16,height:27,borderRadius:6,background:"#2d3138",color:"#ccd0d5",fontFamily:"IBM Plex Mono",fontSize:11,padding:"6px 12px"}}>{url}</div><div style={{height:"100%",background:C.white,borderRadius:10,overflow:"hidden"}}>{children}</div></div>;

const PhoneFrame: React.FC<{children:React.ReactNode; width?:number; height?:number}> = ({children,width=340,height=650}) => <div style={{width,height,borderRadius:50,background:C.ink,padding:12,border:"4px solid #3a3d44",boxShadow:"12px 14px 0 rgba(93,153,239,.14)",position:"relative"}}><div style={{position:"absolute",zIndex:3,top:18,left:"50%",translate:"-50% 0",width:86,height:19,borderRadius:20,background:C.ink}}/><div style={{height:"100%",borderRadius:35,overflow:"hidden",background:C.white}}>{children}</div></div>;

const Screenshot: React.FC<{src:string; position?:string; zoom?:number; cropLeft?:boolean}> = ({src, position="center", zoom=1.02, cropLeft=false}) => {
  const frame = useCurrentFrame();
  return <Img src={staticFile(`assets/captures/${src}`)} style={{width:cropLeft?"190%":"100%",height:"100%",objectFit:"cover",objectPosition:cropLeft?"left center":position,scale:interpolate(frame,[0,150],[1,zoom],clamp),translate:cropLeft?`${interpolate(frame,[0,150],[0,-35],clamp)}px 0`:"0 0"}}/>;
};

const ProductPair: React.FC<{desktop:string; mobile:string; url?:string; cropLeft?:boolean; desktopPosition?:string}> = ({desktop,mobile,url,cropLeft,desktopPosition}) => <div style={{height:"100%",display:"grid",gridTemplateColumns:"1.48fr .44fr",gap:38,alignItems:"center"}}><BrowserFrame url={url}><Screenshot src={desktop} position={desktopPosition} cropLeft={cropLeft} zoom={1.035}/></BrowserFrame><PhoneFrame><Screenshot src={mobile} position="top center" zoom={1.02}/></PhoneFrame></div>;

const Intro: React.FC = () => <div style={{height:"100%",display:"grid",gridTemplateColumns:".62fr 1.38fr",gap:44,alignItems:"center"}}><div><div style={{fontFamily:"IBM Plex Sans",fontSize:25,lineHeight:1.42,color:C.slate}}>Choose an NFL player, stat, and line. Read the direction and confidence context without creating an account.</div><div style={{display:"grid",gap:11,marginTop:26}}>{[["FREE","No account required"],["ONE LINE","Focused lookup"],["INDEPENDENT","No wager placement"]].map(([a,b])=><div key={a} style={{background:C.white,border:`1px solid ${C.line}`,borderLeft:`7px solid ${C.orange}`,borderRadius:10,padding:"13px 16px"}}><div style={{fontFamily:"Familjen Grotesk",fontSize:25,fontWeight:700}}>{a}</div><div style={{fontFamily:"IBM Plex Sans",fontSize:15,color:C.slate}}>{b}</div></div>)}</div></div><BrowserFrame width={1130}><Screenshot src="current-analyzer-desktop.png" position="center 52%" zoom={1.045}/></BrowserFrame></div>;

const SelectNFL: React.FC = () => <div style={{height:"100%",position:"relative"}}><ProductPair desktop="current-analyzer-desktop.png" mobile="current-nfl-empty-mobile.png" desktopPosition="center 59%"/><div style={{position:"absolute",left:545,top:178,width:160,height:78,border:`5px solid ${C.orange}`,borderRadius:18,boxShadow:"0 0 0 9px rgba(255,96,56,.15)"}}/><div style={{position:"absolute",right:62,top:118}}><Pill tone="orange">NFL TAB SELECTED</Pill></div></div>;

const EmptyState: React.FC = () => <div style={{height:"100%",position:"relative"}}><ProductPair desktop="current-analyzer-desktop.png" mobile="current-nfl-empty-mobile.png" desktopPosition="center 64%"/><div style={{position:"absolute",left:77,bottom:43,background:C.ink,color:C.white,borderRadius:13,padding:"18px 23px",boxShadow:`9px 10px 0 ${C.orange}`}}><div style={{fontFamily:"IBM Plex Mono",fontSize:12,color:"#a8e8b5",letterSpacing:1.4}}>PUBLIC NFL SLATE STATUS · JUL 31, 2026</div><div style={{fontFamily:"Familjen Grotesk",fontSize:31,fontWeight:700,marginTop:7}}>OFFSEASON · WEEK 0 · 0 CURRENT PROPS</div></div></div>;

const Field: React.FC<{label:string;value:string;warn?:boolean}> = ({label,value,warn}) => <div style={{background:warn?"#fff0eb":"#f4f2ee",borderRadius:10,padding:"11px 13px",border:warn?`1px solid ${C.orange}`:"1px solid transparent"}}><div style={{fontFamily:"IBM Plex Mono",fontSize:9,color:C.slate,letterSpacing:.8}}>{label}</div><div style={{fontFamily:"Familjen Grotesk",fontSize:value.length>18?15:22,fontWeight:700,color:warn?C.orange:C.ink,marginTop:3}}>{value}</div></div>;

const HistoricalCard: React.FC<{mobile?:boolean; focus?:"identity"|"direction"|"confidence"|"prompt"}> = ({mobile=false,focus}) => <div style={{height:"100%",fontFamily:"IBM Plex Sans",color:C.ink,padding:mobile?"48px 13px 14px":"24px 30px",background:"#f7f5f1",overflow:"hidden"}}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:8}}><PropellerMark size={mobile?21:27}/><b style={{fontFamily:"Familjen Grotesk",fontSize:mobile?16:21}}>Propeller</b></div><span style={{fontFamily:"IBM Plex Mono",fontSize:mobile?8:11,color:C.slate}}>FREE ANALYZER</span></div>
  <div style={{display:"flex",gap:mobile?5:10,marginTop:mobile?13:17}}>{["NBA","NHL","MLB","NFL","SOCCER"].map(s=><span key={s} style={{padding:mobile?"5px 6px":"7px 12px",fontSize:mobile?7:10,borderRadius:8,background:s==="NFL"?C.blue:C.white,color:s==="NFL"?C.white:C.slate,fontFamily:"IBM Plex Mono"}}>{s}</span>)}</div>
  <div style={{marginTop:mobile?10:13,background:C.dark,color:C.white,borderRadius:10,padding:mobile?"8px 10px":"10px 14px",fontSize:mobile?10:13}}>⌕&nbsp;&nbsp;Josh Allen</div>
  <div style={{marginTop:mobile?10:13,background:C.white,border:`1px solid ${C.line}`,borderRadius:14,padding:mobile?12:18,outline:focus==="identity"?`4px solid ${C.orange}`:"none",outlineOffset:3}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}><div><div style={{fontFamily:"IBM Plex Mono",fontSize:mobile?7:10,color:C.slate}}>{fixture.week} · {fixture.date}</div><div style={{fontFamily:"Familjen Grotesk",fontSize:mobile?24:34,fontWeight:700,marginTop:5}}>{fixture.player}</div><div style={{fontSize:mobile?10:13,color:C.slate}}>Buffalo · Quarterback</div></div><Pill tone="green">ARCHIVED</Pill></div>
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"1.15fr .7fr 1fr",gap:8,marginTop:mobile?11:14}}><Field label="STAT" value={fixture.stat}/><Field label="LINE" value={fixture.line}/>{!mobile?<Field label="PLATFORM" value={fixture.platform} warn/>:null}</div>
    {mobile?<div style={{marginTop:8}}><Field label="PLATFORM" value={fixture.platform} warn/></div>:null}
    <div style={{display:"grid",gridTemplateColumns:"1.35fr .65fr",gap:9,marginTop:9}}><div style={{background:"#fff0eb",borderRadius:10,padding:mobile?"9px 11px":"11px 14px",outline:focus==="direction"?`4px solid ${C.orange}`:"none",outlineOffset:3,opacity:focus==="confidence"?.72:1}}><div style={{fontFamily:"IBM Plex Mono",fontSize:mobile?7:9,color:C.slate}}>DIRECTIONAL READ</div><div style={{fontFamily:"Familjen Grotesk",fontSize:mobile?24:30,fontWeight:700,color:C.orange}}>{fixture.direction}</div></div><div style={{background:"#f2f4f6",borderRadius:10,padding:mobile?"9px 8px":"11px 12px",textAlign:"center",outline:focus==="confidence"?`4px solid ${C.orange}`:"none",outlineOffset:3,opacity:focus==="direction"?.38:1}}><div style={{fontFamily:"IBM Plex Mono",fontSize:mobile?7:9,color:C.slate}}>CONFIDENCE</div><div style={{fontFamily:"Familjen Grotesk",fontSize:mobile?26:32,fontWeight:700}}>{fixture.confidence}<span style={{fontSize:.55* (mobile?26:32)}}>%</span></div></div></div>
    <div style={{height:6,borderRadius:8,background:"#e1ded8",marginTop:10,overflow:"hidden"}}><div style={{width:"62%",height:"100%",background:C.orange}}/></div>
    <div style={{marginTop:mobile?9:11,borderRadius:8,background:focus==="prompt"?C.ink:"#f1eee8",color:focus==="prompt"?C.white:C.ink,padding:mobile?"8px 10px":"10px 13px",fontFamily:"IBM Plex Sans",fontSize:mobile?10:12,fontWeight:600,textAlign:"center",outline:focus==="prompt"?`4px solid ${C.orange}`:"none"}}>Build AI research prompt →</div>
  </div>
  <div style={{marginTop:mobile?8:10,fontFamily:"IBM Plex Mono",fontSize:mobile?7:10,lineHeight:1.35,color:"#287442"}}>HISTORICAL INTERFACE EXAMPLE · NOT LIVE · NOT PUBLISHED PREGAME</div>
</div>;

const HistoricalPair: React.FC<{focus?:"identity"|"direction"|"confidence"|"prompt"}> = ({focus}) => <div style={{height:"100%",display:"grid",gridTemplateColumns:"1.48fr .44fr",gap:38,alignItems:"center"}}><BrowserFrame><HistoricalCard focus={focus}/></BrowserFrame><PhoneFrame><HistoricalCard mobile focus={focus}/></PhoneFrame></div>;

const Disclosure: React.FC = () => <div style={{height:"100%",position:"relative"}}><HistoricalPair focus="identity"/><div style={{position:"absolute",left:72,top:162,width:790,background:"rgba(17,19,22,.97)",color:C.white,borderRadius:16,padding:"31px 36px",boxShadow:`13px 14px 0 ${C.orange}`}}><div style={{fontFamily:"IBM Plex Mono",fontSize:15,color:C.orange}}>JOSH ALLEN · ARCHIVED 2025 WEEK 17</div><div style={{fontFamily:"Familjen Grotesk",fontSize:43,fontWeight:700,lineHeight:1.02,marginTop:15}}>Interface demonstration only.</div><div style={{fontFamily:"IBM Plex Sans",fontSize:21,lineHeight:1.42,color:"#d8d9dc",marginTop:14}}>Not a live line. Not published pregame. Not actionable.</div></div></div>;

const ConfidenceScene: React.FC = () => <div style={{height:"100%",position:"relative"}}><HistoricalPair focus="confidence"/><div style={{position:"absolute",left:90,bottom:35,display:"flex",gap:12}}><Pill tone="orange">50–100 SIGNAL-STRENGTH SCALE</Pill><Pill tone="dark">NOT 62% WIN PROBABILITY</Pill></div></div>;

const Boundary: React.FC = () => <ProductPair desktop="analyzer-boundary-desktop.png" mobile="analyzer-boundary-mobile.png" cropLeft desktopPosition="left center"/>;

const PromptHandoff: React.FC = () => <div style={{height:"100%",display:"grid",gridTemplateColumns:".78fr 1.22fr",gap:30,alignItems:"center"}}><div style={{height:590,borderRadius:17,overflow:"hidden",boxShadow:`12px 14px 0 ${C.orange}`,border:`7px solid ${C.ink}`}}><HistoricalCard focus="prompt"/></div><div style={{display:"flex",alignItems:"center",gap:24}}><BrowserFrame width={770} url="propellerpicks.com/tools/ai-betting-prompt-builder/"><Screenshot src="prompt-builder-desktop.png" position="center" zoom={1.04}/></BrowserFrame><PhoneFrame width={270} height={570}><Screenshot src="prompt-builder-mobile.png" position="top center" zoom={1.02}/></PhoneFrame></div><div style={{position:"absolute",right:78,bottom:33}}><Pill tone="green">PREFILLED: NFL · JOSH ALLEN · PASSING YARDS · 195.5</Pill></div></div>;

const Workspace: React.FC = () => <ProductPair desktop="workspace-boundary-desktop.png" mobile="workspace-boundary-mobile.png" desktopPosition="center top"/>;

const Freshness: React.FC = () => {const frame=useCurrentFrame(); const items=[["01","ACTIVE STATUS"],["02","EXPECTED ROLE"],["03","EXACT STAT + LINE"],["04","CURRENT TIMESTAMP"]]; return <div style={{height:"100%",display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:36,alignItems:"center"}}><BrowserFrame width={1070}><Screenshot src="current-analyzer-desktop.png" position="center 63%" zoom={1.025}/></BrowserFrame><div style={{display:"grid",gap:12}}>{items.map(([n,label],i)=><div key={n} style={{background:i===3?C.ink:C.white,color:i===3?C.white:C.ink,border:`1px solid ${C.line}`,borderRadius:11,padding:"16px 19px",opacity:interpolate(frame,[i*12,i*12+9],[0,1],clamp),translate:`${interpolate(frame,[i*12,i*12+9],[20,0],clamp)}px 0`}}><span style={{fontFamily:"IBM Plex Mono",fontSize:13,color:C.orange,marginRight:16}}>{n}</span><span style={{fontFamily:"Familjen Grotesk",fontSize:26,fontWeight:700}}>{label}</span></div>)}</div></div>};

const NoAction: React.FC = () => <div style={{height:"100%",display:"grid",placeItems:"center"}}><div style={{width:1390,background:C.ink,color:C.white,borderRadius:20,padding:"52px 58px",boxShadow:`17px 19px 0 ${C.orange}`}}><div style={{display:"flex",gap:13,flexWrap:"wrap"}}>{["MISSING SLATE","MOVED LINE","UNCERTAIN ROLE","STALE EVIDENCE"].map(x=><Pill key={x} tone="orange">{x}</Pill>)}</div><div style={{fontFamily:"Familjen Grotesk",fontSize:118,fontWeight:700,lineHeight:.88,letterSpacing:-4,marginTop:34}}>NO ACTION</div><div style={{fontFamily:"IBM Plex Sans",fontSize:24,color:"#d4d6da",marginTop:25}}>A useful analyzer recognizes uncertainty instead of manufacturing confidence.</div></div></div>;

const Proof: React.FC = () => {const frame=useCurrentFrame(); const showResults=frame>270; return <div style={{height:"100%",display:"grid",gridTemplateColumns:"1.48fr .44fr",gap:38,alignItems:"center"}}><BrowserFrame url={showResults?"propellerpicks.com/results/":"propellerpicks.com/how-it-works/"}><Screenshot src={showResults?"results-desktop.png":"method-desktop.png"} position="center top" zoom={1.025}/></BrowserFrame><PhoneFrame><Screenshot src={showResults?"results-mobile.png":"method-mobile.png"} position="top center" zoom={1.015}/></PhoneFrame><div style={{position:"absolute",right:95,bottom:36}}><Pill tone={showResults?"green":"orange"}>{showResults?"PUBLIC ARCHIVE + LIMITATIONS":"DIRECTIONAL CONFIDENCE METHOD"}</Pill></div></div>};

const CTA: React.FC = () => <div style={{height:"100%",display:"grid",gridTemplateColumns:".68fr 1.32fr",gap:42,alignItems:"center"}}><div><PropellerMark size={64}/><div style={{fontFamily:"Familjen Grotesk",fontSize:62,fontWeight:700,lineHeight:.94,marginTop:20}}>Verify.<br/>Read direction.<br/>Then confidence.</div><div style={{marginTop:26}}><Pill tone="dark">PROPELLERPICKS.COM/ANALYZER</Pill></div><div style={{fontFamily:"IBM Plex Sans",fontSize:18,lineHeight:1.5,color:C.slate,marginTop:25}}>Independent research and analytics.<br/>No wager placement. No guaranteed outcomes.</div></div><ProductPair desktop="current-analyzer-desktop.png" mobile="current-nfl-empty-mobile.png" desktopPosition="center 62%"/></div>;

const SceneBody: React.FC<{scene:Scene}> = ({scene}) => {
  let body: React.ReactNode;
  switch(scene.kind){
    case "intro": body=<Intro/>; break;
    case "select": body=<SelectNFL/>; break;
    case "empty": body=<EmptyState/>; break;
    case "disclosure": body=<Disclosure/>; break;
    case "identity": body=<HistoricalPair focus="identity"/>; break;
    case "direction": body=<HistoricalPair focus="direction"/>; break;
    case "confidence": body=<ConfidenceScene/>; break;
    case "boundary": body=<Boundary/>; break;
    case "prompt": body=<PromptHandoff/>; break;
    case "workspace": body=<Workspace/>; break;
    case "freshness": body=<Freshness/>; break;
    case "noaction": body=<NoAction/>; break;
    case "proof": body=<Proof/>; break;
    default: body=<CTA/>;
  }
  const historical=["disclosure","identity","direction","confidence","prompt"].includes(scene.kind);
  return <SceneShell eyebrow={scene.eyebrow} title={scene.title} historical={historical}>{body}</SceneShell>;
};

export const FreeNFLAnalyzerVideo: React.FC<{showCaptions:boolean}> = ({showCaptions}) => <AbsoluteFill style={{background:C.paper}}><Audio src={staticFile("assets/narration.mp3")}/>{scenes.map(scene=><Sequence key={`${scene.start}-${scene.kind}`} from={Math.round(scene.start*FPS)} durationInFrames={Math.round((scene.end-scene.start)*FPS)}><SceneBody scene={scene}/></Sequence>)}{showCaptions?<Captions/>:null}</AbsoluteFill>;
