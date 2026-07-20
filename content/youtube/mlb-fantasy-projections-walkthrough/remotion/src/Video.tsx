import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Brand, CaptureLabel, ComparisonPlayer, DesktopApp, Kicker, MobileApp } from "./AppUI";
import { Captions } from "./Captions";
import { colors, players, sceneStarts } from "./data";

const paperGrid: React.CSSProperties = {
  backgroundColor: colors.paper,
  backgroundImage:
    "linear-gradient(rgba(16,19,17,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(16,19,17,.055) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

const fade = (frame: number, duration = 14) =>
  interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Screenshot: React.FC<{
  src: string;
  objectPosition?: string;
  scaleFrom?: number;
  scaleTo?: number;
  darken?: number;
}> = ({ src, objectPosition = "center", scaleFrom = 1.04, scaleTo = 1.1, darken = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: colors.ink }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          scale: interpolate(frame, [0, 850], [scaleFrom, scaleTo], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      {darken > 0 ? <AbsoluteFill style={{ background: `rgba(16,19,17,${darken})` }} /> : null}
    </AbsoluteFill>
  );
};

const MetricCallout: React.FC<{ label: string; value: string; x: number; y: number; delay: number; color?: string }> = ({
  label,
  value,
  x,
  y,
  delay,
  color = colors.orange,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 190,
        padding: "16px 19px",
        borderRadius: 9,
        border: `2px solid ${color}`,
        background: "rgba(251,250,246,0.97)",
        boxShadow: "0 18px 46px rgba(0,0,0,.23)",
        opacity: interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        translate: `0 ${interpolate(frame, [delay, delay + 14], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
      }}
    >
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 15, letterSpacing: "0.1em", color: colors.muted, textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 7, fontFamily: "IBM Plex Mono, monospace", fontSize: 35, fontWeight: 700, color }}>{value}</div>
    </div>
  );
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: colors.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 78, top: 64, zIndex: 4 }}><Brand light /></div>
      <div style={{ position: "absolute", left: 80, top: 190, width: 720, zIndex: 5 }}>
        <Kicker dark>MLB fantasy walkthrough</Kicker>
        <div style={{ marginTop: 25, color: "white", fontFamily: "Familjen Grotesk, sans-serif", fontSize: 92, lineHeight: 0.92, fontWeight: 700, letterSpacing: "-0.045em" }}>
          One projection.<br /><span style={{ color: colors.lime }}>Three useful views.</span>
        </div>
        <div style={{ marginTop: 28, color: "#c8d0ca", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 28, lineHeight: 1.35, maxWidth: 650 }}>
          Floor, projected points, ceiling—and the Sit/Start comparison that brings them together.
        </div>
      </div>
      <div style={{ position: "absolute", right: 80, top: 70, width: 980, height: 760, borderRadius: 28, overflow: "hidden", border: "1px solid rgba(255,255,255,.18)", boxShadow: "0 36px 100px rgba(0,0,0,.45)", opacity: fade(frame), scale: interpolate(frame, [0, 30], [0.96, 1], { extrapolateRight: "clamp", easing: Easing.bezier(.16,1,.3,1) }) }}>
        <Img src={staticFile("captures/desktop/live-board-desktop-2026-07-18-projected.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "52% 74%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(16,19,17,.08), transparent 35%)" }} />
      </div>
      <MetricCallout label="Floor" value="5.3" x={910} y={555} delay={36} />
      <MetricCallout label="Projection" value="12.8" x={1120} y={470} delay={72} color={colors.lime} />
      <MetricCallout label="Ceiling" value="24.1" x={1335} y={555} delay={108} />
      <div style={{ position: "absolute", right: 74, bottom: 132, color: "#aeb7b0", fontFamily: "IBM Plex Mono, monospace", fontSize: 16 }}>LIVE BOARD · JUL 18, 2026</div>
    </AbsoluteFill>
  );
};

const ContextScene: React.FC = () => {
  const frame = useCurrentFrame();
  const chips = ["MLB hitters", "Jul 18 slate", "DraftKings MLB scoring", "Latest available"];
  return (
    <AbsoluteFill style={paperGrid}>
      <Screenshot src="captures/desktop/public-fantasy-landing-2026-07-18.png" objectPosition="center 28%" scaleFrom={1.02} scaleTo={1.06} darken={0.12} />
      <div style={{ position: "absolute", left: 88, top: 92, width: 720, padding: 38, borderRadius: 18, background: "rgba(242,239,232,.95)", border: `1px solid ${colors.line}`, boxShadow: "12px 12px 0 rgba(255,96,56,.22)", opacity: fade(frame) }}>
        <Kicker>Before you compare</Kicker>
        <div style={{ marginTop: 20, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 60, lineHeight: 0.98, fontWeight: 700, color: colors.ink }}>Confirm the board context.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 11, marginTop: 27 }}>
          {chips.map((chip, index) => (
            <div key={chip} style={{ padding: "12px 15px", borderRadius: 6, background: index === 3 ? colors.ink : "white", color: index === 3 ? "white" : colors.ink, border: `1px solid ${colors.line}`, fontFamily: "IBM Plex Mono, monospace", fontSize: 17, fontWeight: 700, opacity: interpolate(frame, [12 + index * 8, 22 + index * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{chip}</div>
          ))}
        </div>
      </div>
      <CaptureLabel>Public fantasy page · Jul 18, 2026</CaptureLabel>
    </AbsoluteFill>
  );
};

const ProjectionScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...paperGrid, overflow: "hidden" }}>
      <Screenshot src="captures/desktop/live-board-desktop-2026-07-18-projected.png" objectPosition="center 74%" scaleFrom={1.04} scaleTo={1.08} />
      <CaptureLabel />
      <div style={{ position: "absolute", left: 640, top: 790, width: 180, height: 105, borderRadius: 9, border: `5px solid ${colors.orange}`, boxShadow: "0 0 0 9999px rgba(16,19,17,.2)", opacity: interpolate(frame, [14, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      <div style={{ position: "absolute", left: 85, top: 105, width: 600, padding: 30, borderRadius: 15, background: "rgba(16,19,17,.94)", color: "white", boxShadow: "0 28px 70px rgba(0,0,0,.32)" }}>
        <Kicker dark>Central estimate</Kicker>
        <div style={{ marginTop: 15, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 55, lineHeight: 1, fontWeight: 700 }}>Projected points</div>
        <div style={{ marginTop: 17, color: "#ccd3ce", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 23, lineHeight: 1.38 }}>Current player markets inform the estimate. Recent performance fills scoring components those markets do not cover.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 23 }}>
          <div style={{ padding: 16, border: "1px solid rgba(255,255,255,.15)", borderRadius: 8 }}><strong style={{ color: colors.lime, fontFamily: "IBM Plex Mono, monospace", fontSize: 28 }}>7</strong><div style={{ marginTop: 5, fontFamily: "IBM Plex Sans, sans-serif", color: "#cbd2cd", fontSize: 17 }}>market inputs</div></div>
          <div style={{ padding: 16, border: "1px solid rgba(255,255,255,.15)", borderRadius: 8 }}><strong style={{ color: colors.lime, fontFamily: "IBM Plex Mono, monospace", fontSize: 28 }}>20</strong><div style={{ marginTop: 5, fontFamily: "IBM Plex Sans, sans-serif", color: "#cbd2cd", fontSize: 17 }}>recent games</div></div>
        </div>
        <div style={{ marginTop: 14, color: "#9ea9a1", fontFamily: "IBM Plex Mono, monospace", fontSize: 15 }}>CONTEXT COUNTS · NOT QUALITY GRADES</div>
      </div>
    </AbsoluteFill>
  );
};

const RangeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame < 210 ? "floor" : frame < 390 ? "ceiling" : "range";
  return (
    <AbsoluteFill style={{ background: colors.ink }}>
      <div style={{ position: "absolute", left: 76, top: 72 }}><Brand light /></div>
      <div style={{ position: "absolute", left: 80, top: 205, width: 610 }}>
        <Kicker dark>Range anatomy</Kicker>
        <div style={{ marginTop: 24, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 78, lineHeight: .95, fontWeight: 700, color: "white" }}>{active === "floor" ? "Floor shows the lower case." : active === "ceiling" ? "Ceiling shows the upper case." : "The range holds both."}</div>
        <div style={{ marginTop: 26, color: "#cbd2cd", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 25, lineHeight: 1.4 }}>A likely scoring range centered on today’s projection—not a guaranteed minimum or maximum.</div>
      </div>
      <div style={{ position: "absolute", right: 90, top: 190, width: 1040, padding: 55, borderRadius: 22, background: colors.paperBright, border: `1px solid ${colors.line}` }}>
        <div style={{ fontFamily: "Familjen Grotesk, sans-serif", fontSize: 48, fontWeight: 700, color: colors.ink }}>Elly De La Cruz</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22, marginTop: 42 }}>
          {[["Floor", "5.3"], ["Projection", "12.8"], ["Ceiling", "24.1"]].map(([label, value]) => {
            const highlighted = active === "range" || active === label.toLowerCase();
            return <div key={label} style={{ padding: 26, borderRadius: 12, border: `3px solid ${highlighted ? colors.orange : colors.line}`, background: highlighted ? "#fff0e9" : "white", scale: highlighted ? 1.03 : 1 }}><div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 17, letterSpacing: ".1em", color: colors.muted, textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 10, fontFamily: "IBM Plex Mono, monospace", fontSize: 55, fontWeight: 700, color: highlighted ? colors.orange : colors.ink }}>{value}</div></div>;
          })}
        </div>
        <div style={{ position: "relative", height: 95, marginTop: 48 }}>
          <div style={{ position: "absolute", left: 20, right: 20, top: 40, height: 8, borderRadius: 8, background: colors.line }} />
          <div style={{ position: "absolute", left: 25, width: "88%", top: 40, height: 8, borderRadius: 8, background: colors.orange, scale: `${interpolate(frame, [420, 520], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 1`, transformOrigin: "left center" }} />
          <div style={{ position: "absolute", left: "49%", top: 28, width: 32, height: 32, rotate: "45deg", background: colors.lime, border: `3px solid ${colors.ink}` }} />
          <div style={{ position: "absolute", left: 14, top: 60, fontFamily: "IBM Plex Mono, monospace", color: colors.muted, fontSize: 15 }}>LOWER</div>
          <div style={{ position: "absolute", left: "46%", top: 60, fontFamily: "IBM Plex Mono, monospace", color: colors.muted, fontSize: 15 }}>CENTER</div>
          <div style={{ position: "absolute", right: 10, top: 60, fontFamily: "IBM Plex Mono, monospace", color: colors.muted, fontSize: 15 }}>UPPER</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SortScene: React.FC = () => {
  const frame = useCurrentFrame();
  const state = frame < 360 ? "projected" : frame < 720 ? "floor" : "ceiling";
  return (
    <AbsoluteFill style={{ background: colors.paper }}>
      <Screenshot src={`captures/desktop/live-board-desktop-2026-07-18-${state}.png`} objectPosition="center 75%" scaleFrom={1.02} scaleTo={1.05} />
      <CaptureLabel />
      <div style={{ position: "absolute", right: 95, top: 155, padding: "18px 25px", borderRadius: 10, background: colors.ink, color: "white", boxShadow: "0 20px 50px rgba(0,0,0,.3)" }}>
        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 15, color: colors.lime, letterSpacing: ".1em" }}>SORTING LENS</div>
        <div style={{ marginTop: 7, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 40, fontWeight: 700 }}>{state === "projected" ? "Projected · central rank" : state === "floor" ? "Floor · lower-range rank" : "Ceiling · upper-range rank"}</div>
      </div>
      <div style={{ position: "absolute", left: 94, bottom: 126, width: 650, padding: 22, background: "rgba(242,239,232,.95)", border: `1px solid ${colors.line}`, borderRadius: 10, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 23, lineHeight: 1.35, color: colors.ink }}>Watch the list reorder. Each sort answers a different question; none is automatically “best.”</div>
    </AbsoluteFill>
  );
};

const CompareScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: colors.ink, justifyContent: "center", alignItems: "center" }}>
      <DesktopApp selected={frame < 260} comparison={frame >= 260} />
      <CaptureLabel>Web app UI · shipped source + live Jul 18 data</CaptureLabel>
      {frame < 260 ? <div style={{ position: "absolute", left: 1160, top: 655, width: 56, height: 56, borderRadius: 32, border: `5px solid ${colors.lime}`, opacity: 0.9, scale: interpolate(frame % 60, [0, 30, 60], [0.85, 1.15, 0.85]) }} /> : null}
    </AbsoluteFill>
  );
};

const FullRangeCompareScene: React.FC = () => (
  <AbsoluteFill style={{ ...paperGrid, padding: "88px 110px 160px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
      <div><Kicker>Same center, different shape</Kicker><div style={{ marginTop: 18, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 67, lineHeight: .98, fontWeight: 700, color: colors.ink }}>Compare the whole range.</div></div>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 18, color: colors.muted }}>PROJECTED GAP · 1.4 PTS</div>
    </div>
    <div style={{ display: "flex", gap: 24, marginTop: 42 }}>
      <ComparisonPlayer player={players[0]} recommended />
      <ComparisonPlayer player={players[1]} recommended={false} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginTop: 26 }}>
      {["Downside remains visible", "The center drives Start / Sit", "Upside does not erase the floor"].map((text, index) => <div key={text} style={{ padding: "18px 20px", borderLeft: `5px solid ${index === 1 ? colors.lime : colors.orange}`, background: colors.ink, color: "white", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 20 }}>{text}</div>)}
    </div>
    <CaptureLabel>Comparison UI reconstruction · shipped source</CaptureLabel>
  </AbsoluteFill>
);

const BoundariesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const checks = ["League and contest rules", "Roster constraints", "Injury and lineup news", "Weather and late changes"];
  return (
    <AbsoluteFill style={{ background: colors.ink }}>
      <div style={{ position: "absolute", left: -100, top: 110, scale: 0.78, opacity: .28, filter: "blur(2px)" }}><DesktopApp comparison /></div>
      <div style={{ position: "absolute", right: 92, top: 85, width: 790, padding: 48, borderRadius: 20, background: colors.paperBright, boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
        <Kicker>What Sit / Start knows</Kicker>
        <div style={{ marginTop: 18, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 64, lineHeight: .98, fontWeight: 700 }}>A direct projection comparison.</div>
        <div style={{ marginTop: 25, padding: 20, borderRadius: 10, background: "#eaf5ee", borderLeft: `6px solid ${colors.green}`, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 23, color: colors.ink }}>Higher displayed projection → <strong>Start</strong></div>
        <div style={{ marginTop: 27, fontFamily: "IBM Plex Mono, monospace", color: colors.muted, fontSize: 16, letterSpacing: ".1em" }}>VERIFY OUTSIDE PROPELLER</div>
        <div style={{ marginTop: 13, display: "grid", gap: 10 }}>
          {checks.map((check, index) => <div key={check} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", border: `1px solid ${colors.line}`, borderRadius: 7, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 21, opacity: interpolate(frame, [20 + index * 10, 32 + index * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}><span style={{ color: colors.orange, fontSize: 24 }}>✓</span>{check}</div>)}
        </div>
        <div style={{ marginTop: 20, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 20, color: colors.muted }}>Not a complete lineup optimizer or personalized roster recommendation.</div>
      </div>
    </AbsoluteFill>
  );
};

const MobileScene: React.FC = () => {
  const frame = useCurrentFrame();
  const comparison = frame > 300;
  const active = frame < 120 ? "floor" : frame < 220 ? "projection" : "ceiling";
  return (
    <AbsoluteFill style={{ ...paperGrid, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 92, top: 98, width: 690 }}>
        <Kicker>Same workflow, mobile</Kicker>
        <div style={{ marginTop: 22, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 82, lineHeight: .92, fontWeight: 700, color: colors.ink }}>Sort. Select two. Compare.</div>
        <div style={{ marginTop: 28, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 27, lineHeight: 1.4, color: colors.muted }}>The mobile Fantasy screen keeps the slate status, sorting chips, player rows, and full Sit/Start range together.</div>
        <div style={{ display: "flex", gap: 10, marginTop: 30 }}>{["1 · Choose lens", "2 · Tap two hitters", "3 · Read both ranges"].map((x, i) => <div key={x} style={{ padding: "12px 14px", borderRadius: 6, background: i === (comparison ? 2 : frame > 180 ? 1 : 0) ? colors.ink : "white", color: i === (comparison ? 2 : frame > 180 ? 1 : 0) ? "white" : colors.ink, border: `1px solid ${colors.line}`, fontFamily: "IBM Plex Mono, monospace", fontSize: 15 }}>{x}</div>)}</div>
      </div>
      <div style={{ position: "absolute", right: 230, top: 52 }}><MobileApp comparison={comparison} active={active} /></div>
      <div style={{ position: "absolute", left: 850, top: 400, width: 250, height: 450, borderRadius: 24, overflow: "hidden", border: `6px solid ${colors.ink}`, boxShadow: "0 25px 70px rgba(0,0,0,.22)", opacity: .78 }}><Img src={staticFile("captures/mobile/live-board-mobile-2026-07-18-projected.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 66%" }} /></div>
      <CaptureLabel>Mobile app reconstruction + real mobile public board</CaptureLabel>
    </AbsoluteFill>
  );
};

const RefreshScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: colors.ink, padding: "80px 96px 150px" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between" }}>
        <div><Kicker dark>Freshness check</Kicker><div style={{ marginTop: 18, color: "white", fontFamily: "Familjen Grotesk, sans-serif", fontSize: 72, lineHeight: .95, fontWeight: 700 }}>Refresh before the decision.</div></div>
        <div style={{ padding: "14px 18px", border: "1px solid rgba(255,255,255,.2)", borderRadius: 8, color: colors.lime, fontFamily: "IBM Plex Mono, monospace", fontSize: 18 }}>JUL 18 · LATEST AVAILABLE</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr .8fr", gap: 26, marginTop: 42, minHeight: 560 }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, border: "1px solid rgba(255,255,255,.16)" }}><Img src={staticFile("captures/desktop/live-board-desktop-2026-07-18-projected.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 52%" }} /><div style={{ position: "absolute", right: 35, top: 100, padding: "17px 21px", borderRadius: 8, background: colors.paperBright, border: `3px solid ${colors.orange}`, color: colors.ink, fontFamily: "IBM Plex Mono, monospace", fontSize: 21, fontWeight: 700 }}><span style={{ display: "inline-block", rotate: `${frame * 3}deg`, marginRight: 10 }}>↻</span>Manual refresh</div></div>
        <div style={{ position: "relative", display: "grid", placeItems: "center", overflow: "hidden", borderRadius: 18, background: colors.paper }}><MobileApp /><div style={{ position: "absolute", top: 30, left: "50%", translate: "-50% 0", color: colors.orange, fontFamily: "IBM Plex Mono, monospace", fontSize: 18, fontWeight: 700 }}>↓ PULL TO REFRESH</div></div>
      </div>
    </AbsoluteFill>
  );
};

const WorkflowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = ["Confirm MLB, slate date, and scoring", "Choose Projected, Floor, or Ceiling", "Select two hitters", "Compare the center and both ranges", "Verify lineup, weather, and contest rules"];
  return (
    <AbsoluteFill style={{ background: colors.paper }}>
      <Screenshot src="captures/desktop/live-board-desktop-2026-07-18-projected.png" objectPosition="center 72%" scaleFrom={1.02} scaleTo={1.05} darken={0.48} />
      <div style={{ position: "absolute", left: 92, top: 80, width: 880, padding: 46, borderRadius: 18, background: "rgba(242,239,232,.97)", boxShadow: "14px 14px 0 rgba(189,244,119,.88)" }}>
        <Kicker>Your five-step workflow</Kicker>
        <div style={{ marginTop: 18, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 64, lineHeight: .98, fontWeight: 700, color: colors.ink }}>Use the board with intent.</div>
        <div style={{ display: "grid", gap: 10, marginTop: 26 }}>
          {steps.map((step, index) => <div key={step} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 15, alignItems: "center", padding: "12px 14px", borderRadius: 7, background: index <= Math.floor(frame / 105) ? colors.ink : "white", color: index <= Math.floor(frame / 105) ? "white" : colors.ink, border: `1px solid ${colors.line}` }}><span style={{ color: index <= Math.floor(frame / 105) ? colors.lime : colors.orange, fontFamily: "IBM Plex Mono, monospace", fontSize: 20, fontWeight: 700 }}>{index + 1}</span><span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 22, fontWeight: 600 }}>{step}</span></div>)}
        </div>
      </div>
      <CaptureLabel />
    </AbsoluteFill>
  );
};

const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...paperGrid, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 92, top: 78 }}><Brand /></div>
      <div style={{ position: "absolute", left: 94, top: 232, width: 780 }}>
        <Kicker>MLB hitters · web + mobile</Kicker>
        <div style={{ marginTop: 24, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 88, lineHeight: .92, letterSpacing: "-.04em", fontWeight: 700, color: colors.ink }}>See the range.<br /><span style={{ color: colors.blue }}>Make the comparison.</span></div>
        <div style={{ marginTop: 28, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 27, lineHeight: 1.4, color: colors.muted }}>Explore today’s public MLB board, then use the full Sit/Start workflow inside Propeller on web or mobile.</div>
        <div style={{ display: "inline-flex", marginTop: 30, padding: "17px 24px", borderRadius: 8, background: colors.ink, color: "white", boxShadow: `7px 7px 0 ${colors.orange}`, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 22, fontWeight: 700 }}>Open Propeller Picks →</div>
        <div style={{ marginTop: 30, maxWidth: 690, fontFamily: "IBM Plex Sans, sans-serif", color: colors.muted, fontSize: 18, lineHeight: 1.45 }}>Independent research and analytics platform—not a sportsbook. Projections are estimates, not guarantees. Current public scope: MLB hitters.</div>
      </div>
      <div style={{ position: "absolute", right: 86, top: 80, width: 870, height: 790, borderRadius: 24, overflow: "hidden", border: `1px solid ${colors.line}`, boxShadow: "0 35px 90px rgba(0,0,0,.25)", opacity: fade(frame), scale: interpolate(frame, [0, 30], [.96,1], { extrapolateRight: "clamp", easing: Easing.bezier(.16,1,.3,1) }) }}><Img src={staticFile("captures/desktop/public-fantasy-landing-2026-07-18.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 28%" }} /></div>
      <div style={{ position: "absolute", right: 70, bottom: 120, width: 330, height: 650 }}><MobileApp comparison /></div>
      <CaptureLabel>Public page + workflow preview · Jul 18, 2026</CaptureLabel>
    </AbsoluteFill>
  );
};

const scenes = [HookScene, ContextScene, ProjectionScene, RangeScene, SortScene, CompareScene, FullRangeCompareScene, BoundariesScene, MobileScene, RefreshScene, WorkflowScene, CloseScene];

export const FantasyWalkthrough: React.FC = () => (
  <AbsoluteFill style={{ background: colors.ink }}>
    {scenes.map((Scene, index) => (
      <Sequence key={index} name={`Scene ${index + 1}`} from={sceneStarts[index]} durationInFrames={sceneStarts[index + 1] - sceneStarts[index]}>
        <Scene />
      </Sequence>
    ))}
    <Audio src={staticFile("audio/narration.mp3")} />
    <Captions />
  </AbsoluteFill>
);

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ ...paperGrid, padding: 58, overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Brand /><div style={{ padding: "10px 14px", borderRadius: 6, background: colors.ink, color: colors.lime, fontFamily: "IBM Plex Mono, monospace", fontSize: 20, fontWeight: 700 }}>MLB FANTASY</div></div>
    <div style={{ marginTop: 55, width: 720, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 88, lineHeight: .88, letterSpacing: "-.045em", color: colors.ink, fontWeight: 700 }}>Floor vs.<br />Ceiling<br /><span style={{ color: colors.blue }}>& Sit / Start</span></div>
    <div style={{ position: "absolute", right: 50, top: 120, width: 650, height: 500, overflow: "hidden", borderRadius: 16, border: `5px solid ${colors.ink}`, boxShadow: `13px 13px 0 ${colors.orange}` }}><Img src={staticFile("captures/desktop/live-board-desktop-2026-07-18-projected.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 75%" }} /></div>
    <div style={{ position: "absolute", right: 50, bottom: 42, display: "flex", gap: 10 }}>{[["FLOOR","5.3"],["PROJ","12.8"],["CEILING","24.1"]].map(([label,value]) => <div key={label} style={{ width: 190, padding: 16, borderRadius: 8, background: label === "PROJ" ? colors.ink : "white", color: label === "PROJ" ? "white" : colors.ink, border: `2px solid ${label === "PROJ" ? colors.ink : colors.orange}` }}><div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 15, color: label === "PROJ" ? colors.lime : colors.muted }}>{label}</div><div style={{ marginTop: 4, fontFamily: "IBM Plex Mono, monospace", fontSize: 35, fontWeight: 700 }}>{value}</div></div>)}</div>
  </AbsoluteFill>
);
