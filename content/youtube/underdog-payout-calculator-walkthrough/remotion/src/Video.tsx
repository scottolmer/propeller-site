import React from "react";
import {Audio} from "@remotion/media";
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
import {Captions} from "./Captions";
import {FPS, scenes, type Scene} from "./data";
import {displayFont, fontCss, monoFont, sansFont} from "./fonts";

const C = {ink: "#101311", orange: "#ff6038", green: "#147d50", paper: "#f2efe8", mist: "#dadfdc", slate: "#59615c", white: "#fffdf8"};
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const Mark: React.FC<{size?: number}> = ({size = 34}) => <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true"><path d="M32 8v20M32 28 13 40M32 28l19 12" fill="none" stroke={C.orange} strokeWidth="9" strokeLinecap="round"/></svg>;

const Pill: React.FC<{children: React.ReactNode; tone?: "orange" | "green" | "ink"}> = ({children, tone = "ink"}) => <span style={{display: "inline-flex", alignItems: "center", padding: "9px 14px", borderRadius: 7, background: tone === "orange" ? C.orange : tone === "green" ? C.green : C.ink, color: C.white, fontFamily: monoFont, fontSize: 14, letterSpacing: .5}}>{children}</span>;

const SceneShell: React.FC<{scene: Scene; children: React.ReactNode}> = ({scene, children}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: C.paper, color: C.ink, padding: "38px 66px 116px", overflow: "hidden"}}>
    <div style={{position: "absolute", inset: 0, opacity: .27, backgroundImage: "radial-gradient(#717a73 0.7px, transparent 0.7px)", backgroundSize: "18px 18px"}}/>
    <div style={{position: "absolute", top: 0, left: 0, width: 18, height: "100%", background: C.orange}}/>
    <header style={{height: 132, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", position: "relative", zIndex: 2}}>
      <div style={{opacity: interpolate(frame, [0, 15], [0, 1], clamp), translate: `${interpolate(frame, [0, 15], [-20, 0], clamp)}px 0`}}>
        <div style={{fontFamily: monoFont, fontSize: 15, color: C.orange, letterSpacing: 1.8}}>{String(scene.id).padStart(2, "0")} / 12 · {scene.eyebrow}</div>
        <div style={{fontFamily: displayFont, fontSize: 55, fontWeight: 700, lineHeight: .98, letterSpacing: -1.4, marginTop: 13}}>{scene.title}</div>
      </div>
      <div style={{display: "flex", alignItems: "center", gap: 12, fontFamily: sansFont, fontSize: 18, fontWeight: 600}}><Mark size={30}/>PROPELLER</div>
    </header>
    <div style={{flex: 1, position: "relative", zIndex: 1, opacity: interpolate(frame, [7, 20], [0, 1], clamp), translate: `0 ${interpolate(frame, [7, 20], [22, 0], clamp)}px`}}>{children}</div>
  </AbsoluteFill>;
};

const BrowserFrame: React.FC<{children: React.ReactNode; width?: number; height?: number; label?: string}> = ({children, width = 1190, height = 720, label = "propellerpicks.com/tools/underdog-payout-calculator/"}) => <div style={{width, height, borderRadius: 18, overflow: "hidden", border: `7px solid ${C.ink}`, background: C.white, boxShadow: `15px 16px 0 ${C.orange}`}}><div style={{height: 44, display: "flex", alignItems: "center", gap: 8, padding: "0 15px", background: C.ink, color: C.mist, fontFamily: monoFont, fontSize: 12}}><span style={{width: 9, height: 9, borderRadius: 20, background: C.orange}}/><span style={{width: 9, height: 9, borderRadius: 20, background: "#d8b248"}}/><span style={{width: 9, height: 9, borderRadius: 20, background: C.green}}/><span style={{marginLeft: 10}}>{label}</span></div><div style={{height: height - 44, overflow: "hidden"}}>{children}</div></div>;

const PhoneFrame: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{width: 282, height: 620, borderRadius: 43, border: `10px solid ${C.ink}`, background: C.white, overflow: "hidden", boxShadow: `10px 12px 0 ${C.orange}`, position: "relative"}}><div style={{position: "absolute", left: "50%", top: 7, translate: "-50% 0", width: 84, height: 18, borderRadius: 20, background: C.ink, zIndex: 2}}/>{children}</div>;

const Shot: React.FC<{device: "desktop" | "mobile"; src: string; position?: string; zoom?: number}> = ({device, src, position = "center", zoom = 1}) => {
  const frame = useCurrentFrame();
  return <Img src={staticFile(`assets/captures/${device}/${src}`)} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: position, scale: interpolate(frame, [0, 500], [zoom, zoom + .035], clamp)}}/>;
};

const ProductPair: React.FC<{src: string; desktopPosition?: string; mobilePosition?: string; badge?: React.ReactNode}> = ({src, desktopPosition = "center", mobilePosition = "center", badge}) => <div style={{height: "100%", display: "grid", gridTemplateColumns: "1fr 285px", gap: 40, alignItems: "center", justifyItems: "center"}}><BrowserFrame><Shot device="desktop" src={src} position={desktopPosition}/></BrowserFrame><PhoneFrame><Shot device="mobile" src={src} position={mobilePosition}/></PhoneFrame>{badge ? <div style={{position: "absolute", left: 40, bottom: 2}}>{badge}</div> : null}</div>;

const Receipt: React.FC<{children: React.ReactNode; rotate?: number; width?: number}> = ({children, rotate = -1.5, width = 1050}) => <div style={{width, background: C.white, border: `1px solid #c9cfcb`, padding: "38px 44px", boxShadow: `18px 20px 0 ${C.orange}`, rotate: `${rotate}deg`, position: "relative", zIndex: 5}}><div style={{position: "absolute", left: 0, right: 0, top: -7, height: 14, background: "linear-gradient(135deg, transparent 8px, #fffdf8 0) 0 0/16px 16px repeat-x"}}/>{children}</div>;

const Formula = () => {
  const frame = useCurrentFrame();
  return <div style={{height: "100%", display: "grid", placeItems: "center"}}><Receipt width={1330}><div style={{fontFamily: monoFont, color: C.slate, fontSize: 18}}>POSSIBLE PAYOUT FORMULA</div><div style={{display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1.15fr", alignItems: "center", gap: 25, marginTop: 34, fontFamily: displayFont, fontSize: 76, fontWeight: 700}}><span>$ ENTRY</span><span style={{color: C.orange}}>×</span><span>MULTIPLIER</span><span style={{color: C.orange}}>=</span><span style={{color: C.green, scale: interpolate(frame, [18, 34], [.82, 1], clamp)}}>PAYOUT</span></div><div style={{marginTop: 37, paddingTop: 25, borderTop: `2px dashed ${C.mist}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: sansFont, fontSize: 23}}><span>Not one fixed number for every card.</span><Pill tone="orange">DISPLAYED ENTRY CONTROLS</Pill></div></Receipt></div>;
};

const Roadmap = () => {
  const frame = useCurrentFrame();
  const items = [["01", "STANDARD", "All active picks must be correct"], ["02", "FLEX", "Read each eligible result row"], ["03", "FINAL SCREEN", "Verify the current displayed amount"]];
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "center"}}>{items.map(([n, title, note], i) => <div key={n} style={{height: 430, background: i === 2 ? C.ink : C.white, color: i === 2 ? C.white : C.ink, border: `1px solid ${C.mist}`, borderRadius: 14, padding: "32px 32px", boxShadow: i === 2 ? `12px 14px 0 ${C.orange}` : "0 18px 50px rgba(16,19,17,.09)", opacity: interpolate(frame, [i * 12, i * 12 + 14], [0, 1], clamp), translate: `0 ${interpolate(frame, [i * 12, i * 12 + 14], [36, 0], clamp)}px`}}><div style={{fontFamily: monoFont, fontSize: 18, color: C.orange}}>{n}</div><div style={{fontFamily: displayFont, fontSize: 48, fontWeight: 700, marginTop: 52}}>{title}</div><div style={{fontFamily: sansFont, fontSize: 24, lineHeight: 1.4, color: i === 2 ? C.mist : C.slate, marginTop: 25}}>{note}</div></div>)}</div>;
};

const Calculator = () => <ProductPair src="calculator-default.png" desktopPosition="center 52%" mobilePosition="center 42%" badge={<Pill tone="orange">CURRENT LOCAL CALCULATOR · CAPTURED AUG 16, 2026</Pill>}/>;

const Standard = () => <div style={{height: "100%", position: "relative"}}><ProductPair src="standard-5pick-10.png" desktopPosition="center 68%" mobilePosition="center 58%"/><div style={{position: "absolute", left: 92, top: 126, width: 930, height: 138, border: `6px solid ${C.orange}`, borderRadius: 17, boxShadow: "0 0 0 10px rgba(255,96,56,.15)"}}/><div style={{position: "absolute", right: 56, top: 42}}><Receipt width={345} rotate={2}><div style={{fontFamily: monoFont, fontSize: 15, color: C.slate}}>ILLUSTRATIVE BASE</div><div style={{fontFamily: displayFont, fontSize: 51, fontWeight: 700, marginTop: 12}}>$10 × 20x</div><div style={{fontFamily: monoFont, fontSize: 14, color: C.green, marginTop: 12}}>FIVE-PICK STANDARD</div></Receipt></div></div>;

const Total = () => <div style={{height: "100%", display: "grid", gridTemplateColumns: "1.35fr .65fr", gap: 45, alignItems: "center"}}><BrowserFrame width={1170}><Shot device="desktop" src="standard-5pick-10.png" position="center 72%" zoom={1.03}/></BrowserFrame><div style={{display: "grid", gap: 18}}><Receipt width={510} rotate={1}><div style={{fontFamily: monoFont, fontSize: 16, color: C.slate}}>TOTAL PAYOUT</div><div style={{fontFamily: displayFont, fontSize: 74, fontWeight: 700, color: C.green}}>$200</div><div style={{fontFamily: sansFont, fontSize: 21}}>Includes the original $10 entry.</div></Receipt><Receipt width={510} rotate={-1}><div style={{fontFamily: monoFont, fontSize: 16, color: C.slate}}>PAYOUT MINUS ENTRY</div><div style={{fontFamily: displayFont, fontSize: 67, fontWeight: 700}}>+$190</div><div style={{fontFamily: sansFont, fontSize: 21}}>A separate arithmetic view.</div></Receipt></div></div>;

const WhatIf = () => <div style={{height: "100%", position: "relative"}}><ProductPair src="standard-5pick-10.png" desktopPosition="center 61%" mobilePosition="center 50%"/><div style={{position: "absolute", left: 116, top: 225, width: 890, height: 95, border: `6px solid ${C.orange}`, borderRadius: 15}}/><div style={{position: "absolute", right: 86, bottom: 20, background: C.ink, color: C.white, width: 620, padding: "29px 34px", borderRadius: 15, boxShadow: `13px 14px 0 ${C.orange}`}}><div style={{fontFamily: displayFont, fontSize: 43, fontWeight: 700}}>WHAT IF?</div><div style={{fontFamily: sansFont, fontSize: 22, lineHeight: 1.42, color: C.mist, marginTop: 10}}>Visitor-supplied assumption.<br/>Not Propeller's forecast.<br/>Not proof of independence.</div></div></div>;

const Flex = () => <div style={{height: "100%", position: "relative"}}><ProductPair src="flex-6pick-10.png" desktopPosition="center 77%" mobilePosition="center 75%"/><div style={{position: "absolute", left: 89, top: 282, display: "flex", gap: 12}}><Pill tone="green">6/6 · 25x</Pill><Pill tone="orange">5/6 · 2.6x</Pill><Pill>4/6 · 0.25x</Pill></div></div>;

const UpTo = () => <div style={{height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "center"}}><Receipt width={730}><div style={{fontFamily: monoFont, fontSize: 16, color: C.orange}}>FLEX RESULT LABEL</div><div style={{fontFamily: displayFont, fontSize: 102, fontWeight: 700, lineHeight: .88, marginTop: 25}}>UP TO</div><div style={{fontFamily: sansFont, fontSize: 23, lineHeight: 1.4, color: C.slate, marginTop: 28}}>The displayed lower-result amount can depend on exactly which selection loses.</div></Receipt><div style={{display: "grid", gap: 16}}>{[["1.5x", "modifier on winning selection", C.green], ["0.7x", "modifier on losing selection", C.orange]].map(([value, label, color]) => <div key={value} style={{background: C.white, borderRadius: 13, padding: "26px 31px", border: `1px solid ${C.mist}`, display: "flex", justifyContent: "space-between", alignItems: "center"}}><span style={{fontFamily: monoFont, fontSize: 43, color}}>{value}</span><span style={{fontFamily: sansFont, fontSize: 21, color: C.slate}}>{label}</span></div>)}<div style={{fontFamily: monoFont, fontSize: 15, color: C.slate, padding: "10px 8px"}}>EDITORIAL EXAMPLE · OFFICIAL ENTRY DETAILS CONTROL</div></div></div>;

const Changes = () => {
  const frame = useCurrentFrame();
  const items = [["ALT", "Alternative projection"], ["CORR", "Correlated picks"], ["PROMO", "Promotion or boost"], ["POOL", "Champions prize pool"]];
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 45, alignItems: "center"}}><Receipt width={950}><div style={{fontFamily: monoFont, fontSize: 17, color: C.slate}}>BASE TABLE</div><div style={{fontFamily: displayFont, fontSize: 68, fontWeight: 700, marginTop: 15}}>STARTING POINT</div><div style={{height: 4, background: C.mist, margin: "26px 0", position: "relative"}}><div style={{height: "100%", width: `${interpolate(frame, [0, 90], [14, 100], clamp)}%`, background: C.orange}}/></div><div style={{fontFamily: monoFont, fontSize: 17, color: C.green}}>DISPLAYED ENTRY = CURRENT DETAIL</div></Receipt><div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}>{items.map(([tag, label], i) => <div key={tag} style={{height: 170, background: i === 3 ? C.ink : C.white, color: i === 3 ? C.white : C.ink, borderRadius: 13, padding: "20px 22px", border: `1px solid ${C.mist}`, opacity: interpolate(frame, [i * 9, i * 9 + 12], [0, 1], clamp)}}><div style={{fontFamily: monoFont, fontSize: 14, color: C.orange}}>{tag}</div><div style={{fontFamily: displayFont, fontSize: 29, fontWeight: 700, lineHeight: 1.03, marginTop: 22}}>{label}</div></div>)}</div></div>;
};

const Checklist = () => {
  const frame = useCurrentFrame();
  const items = [["01", "LOCATION", "Classic or Champions"], ["02", "FORMAT + COUNT", "Standard or Flex · exact picks"], ["03", "DO THE MATH", "Amount × displayed multiplier"], ["04", "FINAL SCREEN", "Compare before submitting"]];
  return <div style={{height: "100%", display: "grid", gridTemplateColumns: "1fr 630px", gap: 45, alignItems: "center"}}><div style={{display: "grid", gap: 12}}>{items.map(([n, title, note], i) => <div key={n} style={{background: i === 3 ? C.ink : C.white, color: i === 3 ? C.white : C.ink, border: `1px solid ${C.mist}`, borderRadius: 12, padding: "17px 22px", display: "grid", gridTemplateColumns: "72px 260px 1fr", alignItems: "center", opacity: interpolate(frame, [i * 14, i * 14 + 12], [0, 1], clamp), translate: `${interpolate(frame, [i * 14, i * 14 + 12], [-30, 0], clamp)}px 0`}}><span style={{fontFamily: monoFont, fontSize: 17, color: C.orange}}>{n}</span><span style={{fontFamily: displayFont, fontSize: 31, fontWeight: 700}}>{title}</span><span style={{fontFamily: sansFont, fontSize: 20, color: i === 3 ? C.mist : C.slate}}>{note}</span></div>)}</div><PhoneFrame><Shot device="mobile" src="calculator-default.png" position="center 45%" zoom={1.02}/></PhoneFrame></div>;
};

const Truth = () => <div style={{height: "100%", display: "grid", placeItems: "center"}}><div style={{width: 1420, display: "grid", gridTemplateColumns: ".9fr 1.1fr", borderRadius: 17, overflow: "hidden", boxShadow: `17px 19px 0 ${C.orange}`}}><div style={{background: C.white, padding: "44px 48px"}}><div style={{fontFamily: monoFont, fontSize: 16, color: C.slate}}>OLD CHART OR SCREENSHOT</div><div style={{fontFamily: displayFont, fontSize: 54, fontWeight: 700, marginTop: 25, color: C.slate}}>REFERENCE ONLY</div><div style={{fontFamily: sansFont, fontSize: 22, color: C.slate, marginTop: 18}}>Rules and eligibility can change.</div></div><div style={{background: C.ink, color: C.white, padding: "44px 48px"}}><div style={{fontFamily: monoFont, fontSize: 16, color: C.orange}}>CURRENT UNDERDOG DISCLOSURE</div><div style={{fontFamily: displayFont, fontSize: 57, fontWeight: 700, marginTop: 25}}>SOURCE OF TRUTH</div><div style={{fontFamily: sansFont, fontSize: 22, color: C.mist, marginTop: 18}}>Official help checked August 16, 2026.</div></div></div></div>;

const CTA = () => <div style={{height: "100%", display: "grid", gridTemplateColumns: ".72fr 1.28fr", gap: 44, alignItems: "center"}}><div><Mark size={67}/><div style={{fontFamily: displayFont, fontSize: 78, fontWeight: 700, lineHeight: .91, letterSpacing: -2.5, marginTop: 26}}>ESTIMATE.<br/>VERIFY.<br/><span style={{color: C.orange}}>DECIDE.</span></div><div style={{fontFamily: monoFont, fontSize: 17, lineHeight: 1.55, color: C.slate, marginTop: 29}}>PROPELLERPICKS.COM/TOOLS/<br/>UNDERDOG-PAYOUT-CALCULATOR/</div><div style={{fontFamily: sansFont, fontSize: 18, lineHeight: 1.45, color: C.slate, marginTop: 25}}>Independent research and analytics.<br/>No wager placement. No guaranteed outcomes.<br/>Set limits you can afford.</div></div><BrowserFrame width={1100}><Shot device="desktop" src="calculator-default.png" position="center 50%" zoom={1.02}/></BrowserFrame></div>;

const Body: React.FC<{scene: Scene}> = ({scene}) => {
  switch (scene.kind) {
    case "formula": return <Formula/>;
    case "roadmap": return <Roadmap/>;
    case "calculator": return <Calculator/>;
    case "standard": return <Standard/>;
    case "total": return <Total/>;
    case "whatif": return <WhatIf/>;
    case "flex": return <Flex/>;
    case "upto": return <UpTo/>;
    case "changes": return <Changes/>;
    case "checklist": return <Checklist/>;
    case "truth": return <Truth/>;
    default: return <CTA/>;
  }
};

export const UnderdogPayoutVideo: React.FC<{showCaptions: boolean}> = ({showCaptions}) => <AbsoluteFill style={{background: C.paper}}><style>{fontCss}</style><Audio src={staticFile("assets/narration.mp3")} volume={() => Math.SQRT1_2}/>{scenes.map((scene) => <Sequence key={scene.id} from={Math.round(scene.start * FPS)} durationInFrames={Math.round((scene.end - scene.start) * FPS)}><SceneShell scene={scene}><Body scene={scene}/></SceneShell></Sequence>)}{showCaptions ? <Captions/> : null}</AbsoluteFill>;
