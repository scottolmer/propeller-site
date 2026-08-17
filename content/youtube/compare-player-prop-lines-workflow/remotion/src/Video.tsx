import {Audio} from "@remotion/media";
import {AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {Captions} from "./Captions";
import {FPS, scenes, type Scene} from "./data";
import "./fonts";

const C = {ink: "#101311", orange: "#ff6038", green: "#147d50", paper: "#f2efe8", cream: "#faf8f3", muted: "#626a64", white: "#fff"};
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const Mark: React.FC<{size?: number; color?: string}> = ({size = 38, color = C.orange}) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true"><path d="M32 8v20M32 28 13 40M32 28l19 12" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" /></svg>
);

const Pill: React.FC<{children: React.ReactNode; tone?: "orange" | "green" | "ink"}> = ({children, tone = "ink"}) => {
  const bg = tone === "orange" ? C.orange : tone === "green" ? C.green : C.ink;
  return <div style={{display: "inline-flex", background: bg, color: tone === "orange" ? C.ink : C.white, padding: "9px 14px", borderRadius: 3, fontFamily: "IBM Plex Mono", fontSize: 16, letterSpacing: .5}}>{children}</div>;
};

const BrowserFrame: React.FC<{src: string; objectPosition?: string; width?: number}> = ({src, objectPosition = "center top", width}) => (
  <div style={{width: width ?? "100%", height: 600, background: C.white, border: `2px solid ${C.ink}`, boxShadow: "14px 16px 0 rgba(16,19,17,.13)", overflow: "hidden"}}>
    <div style={{height: 44, display: "flex", alignItems: "center", gap: 9, padding: "0 16px", background: C.ink}}>{[C.orange, "#f0b94a", C.green].map((x) => <span key={x} style={{width: 12, height: 12, borderRadius: 99, background: x}} />)}<div style={{height: 22, flex: 1, marginLeft: 10, background: "#2b302c", borderRadius: 3}} /></div>
    <Img src={staticFile(src)} style={{width: "100%", height: 556, objectFit: "cover", objectPosition}} />
  </div>
);

const PhoneFrame: React.FC<{src: string}> = ({src}) => (
  <div style={{width: 310, height: 630, border: `12px solid ${C.ink}`, borderRadius: 42, background: C.white, boxShadow: "15px 18px 0 rgba(255,96,56,.28)", overflow: "hidden"}}>
    <div style={{position: "absolute", width: 110, height: 24, background: C.ink, marginLeft: 88, zIndex: 2}} />
    <Img src={staticFile(src)} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top"}} />
  </div>
);

const SceneShell: React.FC<{scene: Scene; children: React.ReactNode; dark?: boolean}> = ({scene, children, dark = false}) => {
  const frame = useCurrentFrame();
  const inOpacity = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: Easing.bezier(.16, 1, .3, 1)});
  const titleY = interpolate(frame, [0, 18], [25, 0], {...clamp, easing: Easing.bezier(.16, 1, .3, 1)});
  const gridLine = dark ? "rgba(255,255,255,.06)" : "rgba(16,19,17,.055)";
  return (
    <AbsoluteFill style={{background: dark ? C.ink : C.paper, color: dark ? C.paper : C.ink, fontFamily: "IBM Plex Sans", opacity: inOpacity, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, opacity: dark ? .07 : .38, backgroundImage: `linear-gradient(${gridLine} 1px,transparent 1px),linear-gradient(90deg,${gridLine} 1px,transparent 1px)`, backgroundSize: "38px 38px"}} />
      <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: C.orange}} />
      <div style={{position: "relative", height: "100%", padding: "58px 76px 210px 94px", display: "grid", gridTemplateRows: "116px 1fr", gap: 22}}>
        <header style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", translate: `0 ${titleY}px`, opacity: inOpacity}}>
          <div><div style={{display: "flex", alignItems: "center", gap: 14, fontFamily: "IBM Plex Mono", color: C.orange, fontSize: 16, letterSpacing: 1.4}}><Mark size={30} />{scene.id} · {scene.eyebrow}</div><div style={{fontFamily: "Familjen Grotesk", fontSize: 55, fontWeight: 700, lineHeight: .98, letterSpacing: -1.6, marginTop: 11}}>{scene.title}</div></div>
          <div style={{fontFamily: "IBM Plex Mono", fontSize: 15, color: dark ? "#aeb6af" : C.muted, textAlign: "right", lineHeight: 1.6}}>MANUAL COMPARE<br />ILLUSTRATIVE WORKFLOW</div>
        </header>
        <div style={{minHeight: 0}}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

const RefreshBranch: React.FC<{frame: number}> = ({frame}) => {
  const moved = frame > 250;
  return (
    <div style={{marginTop: 24, display: "grid", gridTemplateColumns: "1fr 140px 1fr", alignItems: "center", gap: 20}}>
      <div style={{padding: 22, border: `2px solid ${moved ? C.muted : C.green}`, background: C.white, opacity: moved ? .55 : 1}}><Pill tone="green">CAPTURE 10:02</Pill><strong style={{fontFamily: "Familjen Grotesk", fontSize: 34, marginLeft: 22}}>OVER 8.5</strong></div>
      <div style={{fontFamily: "Familjen Grotesk", textAlign: "center", fontSize: 40, color: C.orange}}>→</div>
      <div style={{padding: 22, border: `2px solid ${moved ? C.orange : "#d1d1ca"}`, background: moved ? "#fff0ea" : C.white, opacity: interpolate(frame, [220, 250], [.35, 1], clamp)}}><Pill tone="orange">NEW ROW 10:08</Pill><strong style={{fontFamily: "Familjen Grotesk", fontSize: 34, marginLeft: 22}}>{moved ? "OVER 9.5" : "REFRESHING…"}</strong></div>
    </div>
  );
};

const Ledger: React.FC<{mode?: "base" | "split" | "match" | "refresh"}> = ({mode = "base"}) => {
  const frame = useCurrentFrame();
  const fields = [["PLAYER", "Example Player"], ["STAT", "Rebounds"], ["DIRECTION", "OVER"], ["EXACT LINE", "8.5"], ["SOURCE", "Platform A"], ["CAPTURED", mode === "refresh" && frame > 260 ? "10:08" : "10:02"]];
  return (
    <div style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "center"}}>
      <div style={{fontFamily: "IBM Plex Mono", color: C.orange, fontSize: 14, marginBottom: 13}}>ILLUSTRATIVE WORKFLOW · NOT LIVE LINES</div>
      <div style={{display: "grid", gridTemplateColumns: "1.35fr .9fr .8fr .75fr 1fr .8fr", border: `2px solid ${C.ink}`, background: C.white, boxShadow: "14px 16px 0 rgba(16,19,17,.12)"}}>
        {fields.map(([label, value], i) => {
          const reveal = interpolate(frame, [20 + i * 11, 31 + i * 11], [0, 1], clamp);
          const emphasized = mode === "split" && i === 3;
          const matched = mode === "match";
          return <div key={label} style={{padding: "21px 18px", minHeight: 104, borderRight: i < fields.length - 1 ? "1px solid #d8d6d0" : "none", background: emphasized ? "#fff0ea" : matched ? "#edf7f2" : C.white, opacity: reveal}}><div style={{fontFamily: "IBM Plex Mono", fontSize: 12, color: emphasized ? C.orange : C.muted}}>{label}</div><div style={{fontFamily: "Familjen Grotesk", fontWeight: 700, fontSize: value.length > 12 ? 23 : 30, marginTop: 13}}>{value}</div>{matched ? <div style={{fontFamily: "IBM Plex Mono", fontSize: 12, color: C.green, marginTop: 9}}>✓ MATCH</div> : null}</div>;
        })}
      </div>
      {mode === "split" ? <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 26}}>{[["ROW A", "OVER 8.5", "same question"], ["ROW B", "OVER 9.5", "different question"]].map(([a, b, c], i) => <div key={a} style={{padding: "22px 26px", border: `2px solid ${i ? C.orange : C.green}`, background: i ? "#fff0ea" : "#edf7f2", translate: `0 ${interpolate(frame, [105 + i * 12, 124 + i * 12], [24, 0], clamp)}px`, opacity: interpolate(frame, [105 + i * 12, 124 + i * 12], [0, 1], clamp)}}><span style={{fontFamily: "IBM Plex Mono", color: i ? C.orange : C.green}}>{a}</span><strong style={{fontFamily: "Familjen Grotesk", fontSize: 34, marginLeft: 24}}>{b}</strong><span style={{float: "right", fontSize: 20, color: C.muted}}>{c}</span></div>)}</div> : null}
      {mode === "refresh" ? <RefreshBranch frame={frame} /> : null}
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const tabs = ["Platform A · 8.5", "Platform B · 8.5", "Platform C · 9.5", "Propeller · evidence"];
  return (
    <SceneShell scene={scenes[0]} dark>
      <div style={{height: "100%", display: "grid", gridTemplateColumns: ".72fr 1.28fr", gap: 48, alignItems: "center"}}>
        <div><div style={{fontFamily: "Familjen Grotesk", fontSize: 88, fontWeight: 700, lineHeight: .9}}>Same prop.<br /><span style={{color: C.orange}}>Same time.</span><br />Clean row.</div><div style={{marginTop: 30, fontSize: 24, color: "#c7cec8", lineHeight: 1.4}}>A fast comparison can still end with no action.</div></div>
        <div><div style={{display: "flex", gap: 10, marginBottom: 13}}>{tabs.map((t, i) => <div key={t} style={{padding: "11px 14px", background: i === 3 ? C.orange : "#2b302c", color: i === 3 ? C.ink : C.paper, fontFamily: "IBM Plex Mono", fontSize: 13, opacity: interpolate(frame, [i * 8, i * 8 + 11], [0, 1], clamp), translate: `0 ${interpolate(frame, [i * 8, i * 8 + 11], [10, 0], clamp)}px`}}>{t}</div>)}</div><div style={{border: `2px solid ${C.paper}`, background: C.cream, color: C.ink, padding: 26, boxShadow: `16px 18px 0 ${C.orange}`}}><div style={{fontFamily: "IBM Plex Mono", color: C.orange, fontSize: 13}}>RESEARCH LEDGER · ILLUSTRATIVE</div><div style={{display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 18}}>{[["EXACT LINE", "8.5"], ["CAPTURED", "10:02"], ["STATUS", "COMPARE"]].map(([a, b], i) => <div key={a} style={{padding: 18, background: i === 2 ? "#e3f4eb" : "#eeeae0"}}><div style={{fontFamily: "IBM Plex Mono", fontSize: 11, color: C.muted}}>{a}</div><div style={{fontFamily: "Familjen Grotesk", fontSize: 36, fontWeight: 700, marginTop: 9}}>{b}</div></div>)}</div></div></div>
      </div>
    </SceneShell>
  );
};

const Fields: React.FC = () => <SceneShell scene={scenes[1]}><Ledger mode="split" /></SceneShell>;

const Terms: React.FC = () => {
  const frame = useCurrentFrame();
  return <SceneShell scene={scenes[2]}><div style={{height: "100%", display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 42, alignItems: "center"}}><div style={{position: "relative"}}><BrowserFrame src="assets/pick6-desktop.png" objectPosition="center top" /><div style={{position: "absolute", left: 34, bottom: 32}}><Pill tone="orange">CURRENT PROPELLER TOOL · AUG 16, 2026</Pill></div></div><div style={{display: "grid", gap: 18}}><div style={{padding: 26, border: `2px solid ${C.ink}`, background: C.white, translate: `${interpolate(frame, [12, 32], [28, 0], clamp)}px 0`}}><div style={{fontFamily: "IBM Plex Mono", color: C.orange}}>SPORTSBOOK</div><div style={{fontFamily: "Familjen Grotesk", fontSize: 42, fontWeight: 700, marginTop: 10}}>Line + price</div><div style={{fontSize: 20, color: C.muted, marginTop: 8}}>Example: 8.5 · −110</div></div><div style={{fontFamily: "Familjen Grotesk", fontSize: 48, textAlign: "center", color: C.orange}}>≠</div><div style={{padding: 26, border: `2px solid ${C.ink}`, background: C.white, translate: `${interpolate(frame, [28, 48], [28, 0], clamp)}px 0`}}><div style={{fontFamily: "IBM Plex Mono", color: C.green}}>PICK'EM / DFS</div><div style={{fontFamily: "Familjen Grotesk", fontSize: 42, fontWeight: 700, marginTop: 10}}>Displayed terms</div><div style={{fontSize: 20, color: C.muted, marginTop: 8}}>Multiplier · payout · grading</div></div><div style={{padding: "16px 20px", background: C.ink, color: C.paper, fontFamily: "IBM Plex Mono", fontSize: 16}}>LIVE PLATFORM TERMS + FINAL SCREEN CONTROL</div></div></div></SceneShell>;
};

const Match: React.FC = () => {
  const frame = useCurrentFrame();
  const items = ["PLAYER", "STAT", "DIRECTION", "LINE", "TIME"];
  const mismatch = frame > 430;
  return <SceneShell scene={scenes[3]}><div style={{height: "100%", display: "grid", gridTemplateColumns: "1.35fr .65fr", gap: 42, alignItems: "center"}}><Ledger mode="match" /><div style={{background: mismatch ? "#fff0ea" : "#edf7f2", border: `3px solid ${mismatch ? C.orange : C.green}`, padding: 34}}><div style={{fontFamily: "IBM Plex Mono", color: mismatch ? C.orange : C.green}}>{mismatch ? "MISMATCH DETECTED" : "MATCH SCAN"}</div><div style={{display: "grid", gap: 10, marginTop: 22}}>{items.map((item, i) => <div key={item} style={{display: "flex", justifyContent: "space-between", padding: "12px 14px", background: C.white, fontFamily: "IBM Plex Mono", opacity: interpolate(frame, [i * 18, i * 18 + 12], [0, 1], clamp)}}><span>{item}</span><strong style={{color: mismatch && i === 3 ? C.orange : C.green}}>{mismatch && i === 3 ? "CHANGED" : "MATCH"}</strong></div>)}</div><div style={{fontFamily: "Familjen Grotesk", fontSize: 44, fontWeight: 700, marginTop: 28}}>{mismatch ? "Flag the row." : "Now compare terms."}</div></div></div></SceneShell>;
};

const Propeller: React.FC = () => {
  const frame = useCurrentFrame();
  return <SceneShell scene={scenes[4]}><div style={{height: "100%", display: "grid", gridTemplateColumns: "1.55fr .45fr", gap: 36, alignItems: "center"}}><div style={{position: "relative"}}><BrowserFrame src="assets/analyzer-desktop.png" objectPosition="center top" /><div style={{position: "absolute", left: 28, top: 68, padding: "17px 20px", background: "rgba(16,19,17,.94)", color: C.paper, borderLeft: `7px solid ${C.orange}`, opacity: interpolate(frame, [55, 76], [0, 1], clamp)}}><div style={{fontFamily: "IBM Plex Mono", fontSize: 13, color: C.orange}}>TRUTH BOUNDARY</div><div style={{fontFamily: "Familjen Grotesk", fontSize: 29, fontWeight: 700, marginTop: 6}}>Not an automatic all-platform odds screen.</div></div></div><div style={{display: "grid", justifyItems: "center", gap: 24}}><PhoneFrame src="assets/analyzer-mobile.png" /><div style={{display: "flex", gap: 10}}><Pill tone="orange">LINE</Pill><Pill tone="green">DIRECTION</Pill><Pill>CONFIDENCE</Pill></div></div></div></SceneShell>;
};

const Evidence: React.FC = () => {
  const frame = useCurrentFrame();
  const signals = ["ROLE", "INJURIES", "MATCHUP", "RECENT FORM", "ENVIRONMENT", "MARKET CONTEXT", "MISSING DATA"];
  const active = Math.min(signals.length - 1, Math.floor(frame / 95));
  return <SceneShell scene={scenes[5]}><div style={{height: "100%", display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: 42, alignItems: "center"}}><div style={{position: "relative"}}><BrowserFrame src="assets/analyzer-desktop.png" objectPosition="center 74%" /><div style={{position: "absolute", right: 26, bottom: 26}}><Pill tone="orange">CONFIRM DISPLAYED LINE FIRST</Pill></div></div><div><div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>{signals.map((s, i) => <div key={s} style={{padding: "18px 19px", background: i === active ? "#fff0ea" : C.white, border: `2px solid ${i === active ? C.orange : "#d9d7d1"}`, fontFamily: "IBM Plex Mono", fontSize: 17, scale: i === active ? 1.025 : 1}}>{String(i + 1).padStart(2, "0")} · {s}</div>)}</div><div style={{marginTop: 22, background: C.ink, color: C.paper, padding: 24, borderLeft: `8px solid ${C.orange}`}}><div style={{fontFamily: "Familjen Grotesk", fontSize: 33, fontWeight: 700}}>No-vig is market-implied context.</div><div style={{fontSize: 20, color: "#c9d0ca", marginTop: 9}}>Not true probability. Not a guarantee.</div></div></div></div></SceneShell>;
};

const Refresh: React.FC = () => <SceneShell scene={scenes[6]}><Ledger mode="refresh" /></SceneShell>;

const Decision: React.FC = () => {
  const frame = useCurrentFrame();
  const questions = ["EXACT SAME PROP?", "SOURCE + TERMS CURRENT?", "EVIDENCE STILL APPLIES?"];
  const failed = frame > 360;
  return <SceneShell scene={scenes[7]} dark><div style={{height: "100%", display: "grid", gridTemplateColumns: "1fr .64fr", gap: 44, alignItems: "center"}}><div style={{display: "grid", gap: 16}}>{questions.map((q, i) => <div key={q} style={{display: "grid", gridTemplateColumns: "80px 1fr 130px", alignItems: "center", padding: "23px 26px", background: "#222823", borderLeft: `8px solid ${failed && i === 1 ? C.orange : C.green}`, opacity: interpolate(frame, [i * 25, i * 25 + 15], [0, 1], clamp)}}><span style={{fontFamily: "IBM Plex Mono", color: C.orange}}>0{i + 1}</span><strong style={{fontFamily: "Familjen Grotesk", fontSize: 32}}>{q}</strong><span style={{fontFamily: "IBM Plex Mono", textAlign: "right", color: failed && i === 1 ? C.orange : C.green}}>{failed && i === 1 ? "NO" : "YES"}</span></div>)}</div><div style={{border: `3px solid ${failed ? C.orange : C.green}`, color: failed ? C.orange : C.green, padding: "48px 34px", textAlign: "center", rotate: failed ? "-2deg" : "0deg", scale: interpolate(frame, [350, 390], [.94, 1], clamp)}}><div style={{fontFamily: "IBM Plex Mono", fontSize: 17}}>{failed ? "FALSE MATCH BLOCKED" : "RESEARCH GATE"}</div><div style={{fontFamily: "Familjen Grotesk", fontSize: 76, fontWeight: 700, lineHeight: .9, marginTop: 18, whiteSpace: "pre-line"}}>{failed ? "NO\nACTION" : "KEEP\nCHECKING"}</div></div></div></SceneShell>;
};

const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 670], [1.015, 1.065], clamp);
  return <SceneShell scene={scenes[8]}><div style={{height: "100%", display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 46, alignItems: "center"}}><div style={{overflow: "hidden", height: 540, border: `2px solid ${C.ink}`, boxShadow: "14px 16px 0 rgba(16,19,17,.13)"}}><Img src={staticFile("assets/analyzer-desktop.png")} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", scale: drift}} /></div><div><div style={{display: "flex", alignItems: "center", gap: 16}}><Mark size={64} /><div><div style={{fontFamily: "Familjen Grotesk", fontSize: 56, fontWeight: 700, lineHeight: .85}}>Propeller</div><div style={{fontFamily: "IBM Plex Mono", color: C.orange, letterSpacing: 7, marginTop: 11}}>PICKS</div></div></div><div style={{fontFamily: "Familjen Grotesk", fontSize: 56, fontWeight: 700, lineHeight: .96, marginTop: 40}}>Keep the ledger<br />beside the signal.</div><div style={{marginTop: 28}}><Pill tone="orange">PROPELLERPICKS.COM/ANALYZER</Pill></div><div style={{marginTop: 30, paddingTop: 22, borderTop: "1px solid #b8bab3", fontSize: 18, color: C.muted, lineHeight: 1.5}}>Research and analytics—not a sportsbook.<br />Verify current terms. No model signal guarantees an outcome.</div></div></div></SceneShell>;
};

const sceneComponents: Record<Scene["kind"], React.FC> = {hook: Hook, fields: Fields, terms: Terms, match: Match, propeller: Propeller, evidence: Evidence, refresh: Refresh, decision: Decision, close: Close};

export const CompareLinesWorkflow: React.FC<{showCaptions: boolean}> = ({showCaptions}) => (
  <AbsoluteFill style={{background: C.ink}}>
    <Audio src={staticFile("assets/narration.mp3")} />
    {scenes.map((scene) => {
      const Component = sceneComponents[scene.kind];
      return <Sequence key={scene.id} name={`${scene.id} ${scene.title}`} from={Math.round(scene.start * FPS)} durationInFrames={Math.round((scene.end - scene.start) * FPS)}><Component /></Sequence>;
    })}
    {showCaptions ? <Captions /> : null}
  </AbsoluteFill>
);
