import {Audio} from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {Captions} from "./Captions";
import type {Card, Crop, FocusRect, Scene} from "./data";
import {DURATION_IN_FRAMES, FPS, scenes} from "./data";

export type SixSignalsProps = {
  showCaptions: boolean;
  accentColor: string;
  successColor: string;
  paperColor: string;
};

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const PropellerMark: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <svg width={size} height={size} viewBox="0 0 54 54" aria-hidden="true">
    <circle cx="27" cy="27" r="5.5" fill={color} />
    <path d="M27 27V5M27 27L7 40M27 27L47 40" stroke={color} strokeWidth="7.5" strokeLinecap="round" />
  </svg>
);

const Brand: React.FC<{accent: string; signal?: number; historical?: boolean}> = ({accent, signal, historical}) => (
  <div style={{height: 72, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
    <div style={{display: "flex", alignItems: "center", gap: 16}}>
      <PropellerMark color={accent} />
      <div>
        <div style={{fontFamily: "Familjen Grotesk, sans-serif", fontSize: 28, lineHeight: 0.9, fontWeight: 700, letterSpacing: -0.5}}>PROPELLER</div>
        <div style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 12, letterSpacing: 6, color: accent, marginTop: 7}}>PICKS</div>
      </div>
    </div>
    <div style={{display: "flex", alignItems: "center", gap: 14}}>
      {historical ? <Tag text="HISTORICAL WALKTHROUGH" color="#147d50" /> : null}
      {signal ? <Tag text={`SIGNAL 0${signal} / 06`} color={accent} /> : <Tag text="PLAYER PROP RESEARCH" color={accent} />}
    </div>
  </div>
);

const Tag: React.FC<{text: string; color: string}> = ({text, color}) => (
  <div style={{border: `1px solid ${color}`, borderRadius: 4, padding: "10px 15px", fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 600, letterSpacing: 1.3, color}}>{text}</div>
);

const GridBackground: React.FC<{accent: string}> = ({accent}) => (
  <AbsoluteFill>
    <div style={{position: "absolute", inset: 0, background: "#f2efe8"}} />
    <div style={{position: "absolute", inset: 0, opacity: 0.36, backgroundImage: "linear-gradient(rgba(16,19,17,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,19,17,0.08) 1px, transparent 1px)", backgroundSize: "32px 32px"}} />
    <div style={{position: "absolute", width: 760, height: 760, borderRadius: 999, right: -290, top: -370, border: `120px solid ${accent}`, opacity: 0.08}} />
    <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: accent}} />
  </AbsoluteFill>
);

const getSourceSize = (asset: string) => asset.startsWith("mobile-") ? {width: 1320, height: 2868} : {width: 1920, height: 1080};

const CropImage: React.FC<{
  asset: string;
  crop: Crop;
  focus?: FocusRect;
  width: number;
  height: number;
  durationInFrames: number;
  radius?: number;
}> = ({asset, crop, focus, width, height, durationInFrames, radius = 7}) => {
  const frame = useCurrentFrame();
  const source = getSourceSize(asset);
  const push = interpolate(frame, [0, Math.min(70, durationInFrames * 0.3), durationInFrames], [1.005, 1.032, 1.02], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const scale = Math.max(width / crop.width, height / crop.height) * push;
  const left = (width - crop.width * scale) / 2 - crop.x * scale;
  const top = (height - crop.height * scale) / 2 - crop.y * scale;
  const focusOpacity = focus ? interpolate(frame, [12, 24], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)}) : 0;

  return (
    <div style={{position: "relative", width, height, overflow: "hidden", borderRadius: radius, background: "#e9edf2"}}>
      <Img
        src={staticFile(`assets/${asset}`)}
        width={source.width}
        height={source.height}
        style={{position: "absolute", left, top, width: source.width, height: source.height, maxWidth: "none", maxHeight: "none", scale, transformOrigin: "top left"}}
      />
      {focus ? (
        <div style={{position: "absolute", left: left + focus.x * scale, top: top + focus.y * scale, width: focus.width * scale, height: focus.height * scale, border: "5px solid #ff6038", borderRadius: 9, boxShadow: "0 0 0 9999px rgba(16,19,17,0.26), 0 0 32px rgba(255,96,56,0.65)", opacity: focusOpacity}} />
      ) : null}
      <div style={{position: "absolute", inset: 0, border: "1px solid rgba(16,19,17,0.22)", borderRadius: radius}} />
    </div>
  );
};

const BrowserFrame: React.FC<{scene: Scene; width: number; height: number; durationInFrames: number}> = ({scene, width, height, durationInFrames}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{width, height, background: "#101311", border: "2px solid #101311", borderRadius: 10, padding: "44px 9px 9px", position: "relative", boxShadow: "12px 12px 0 rgba(255,96,56,0.24)", translate: interpolate(frame, [0, 16], ["24px 0px", "0px 0px"], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}}>
      <div style={{position: "absolute", top: 15, left: 17, display: "flex", gap: 8}}>
        {["#ff6038", "#c8f56a", "#147d50"].map((color) => <div key={color} style={{width: 11, height: 11, borderRadius: 99, background: color}} />)}
      </div>
      <div style={{position: "absolute", top: 9, left: 120, right: 16, height: 25, borderRadius: 4, background: "#242a26", padding: "5px 14px", color: "#bbc1bc", fontFamily: "IBM Plex Mono, monospace", fontSize: 12}}>app.propellerpicks.com</div>
      <CropImage asset={scene.asset!} crop={scene.crop!} focus={scene.focus} width={width - 18} height={height - 53} durationInFrames={durationInFrames} />
    </div>
  );
};

const PhoneFrame: React.FC<{asset: string; crop: Crop; focus?: FocusRect; durationInFrames: number; width?: number; height?: number}> = ({asset, crop, focus, durationInFrames, width = 390, height = 680}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{width, height, background: "#101311", borderRadius: 52, padding: 13, border: "4px solid #383f3a", boxShadow: "11px 11px 0 rgba(20,125,80,0.2)", translate: interpolate(frame, [0, 16], ["0px 28px", "0px 0px"], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}}>
      <CropImage asset={asset} crop={crop} focus={focus} width={width - 26} height={height - 26} durationInFrames={durationInFrames} radius={38} />
    </div>
  );
};

const Headline: React.FC<{scene: Scene; accent: string; compact?: boolean}> = ({scene, accent, compact}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 11}}>
      <div style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 18, fontWeight: 600, letterSpacing: 2.2, color: accent, textTransform: "uppercase"}}>{scene.eyebrow}</div>
      <Interactive.Div name="Scene title" style={{fontFamily: "Familjen Grotesk, sans-serif", fontSize: compact ? 55 : scene.title.length > 50 ? 65 : 76, fontWeight: 700, lineHeight: 0.98, letterSpacing: -2.2, maxWidth: 1660, color: "#101311", opacity: interpolate(frame, [0, 14], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)}), translate: interpolate(frame, [0, 14], ["0px 20px", "0px 0px"], clamp)}}>{scene.title}</Interactive.Div>
    </div>
  );
};

const Cards: React.FC<{cards: Card[]; accent: string; durationInFrames: number}> = ({cards, accent, durationInFrames}) => {
  const frame = useCurrentFrame();
  const columns = cards.length === 3 ? 3 : cards.length > 4 ? 3 : 2;
  return (
    <div style={{display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 18, width: "100%"}}>
      {cards.map((card, index) => {
        const start = 8 + index * Math.min(13, Math.max(6, Math.floor(durationInFrames / 18)));
        return (
          <Interactive.Div name={`Card ${card.label}`} key={`${card.label}-${card.detail}`} style={{minHeight: cards.length > 4 ? 130 : 155, border: "1.5px solid #101311", borderRadius: 7, background: index === 0 ? "#fff9f5" : "#faf8f3", padding: "22px 25px", boxShadow: `${index % 2 ? 5 : 8}px ${index % 2 ? 5 : 8}px 0 ${index === 0 ? "#ffe1d6" : "rgba(16,19,17,0.10)"}`, opacity: interpolate(frame, [start, start + 12], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)}), translate: interpolate(frame, [start, start + 12], ["0px 22px", "0px 0px"], clamp)}}>
            <div style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 15, letterSpacing: 1.3, color: index === 0 ? accent : "#59615b", fontWeight: 600}}>{card.label}</div>
            <div style={{fontFamily: "Familjen Grotesk, sans-serif", fontSize: cards.length > 4 ? 35 : 39, lineHeight: 1.06, fontWeight: 700, marginTop: 13, color: "#101311"}}>{card.detail}</div>
            {card.value ? <div style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 16, color: "#147d50", marginTop: 12}}>{card.value}</div> : null}
          </Interactive.Div>
        );
      })}
    </div>
  );
};

const Callout: React.FC<{text: string; accent: string}> = ({text, accent}) => {
  const frame = useCurrentFrame();
  return <div style={{display: "inline-flex", alignSelf: "flex-start", borderLeft: `8px solid ${accent}`, background: "#fff9f5", padding: "16px 22px", fontFamily: "IBM Plex Mono, monospace", fontSize: 25, lineHeight: 1.2, fontWeight: 600, color: "#101311", opacity: interpolate(frame, [12, 24], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}}>{text}</div>;
};

const Points: React.FC<{points: string[]; accent: string}> = ({points, accent}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 15}}>
      {points.map((point, index) => <div key={point} style={{display: "flex", alignItems: "center", gap: 15, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 26, fontWeight: 600, color: "#333a35", opacity: interpolate(frame, [12 + index * 9, 23 + index * 9], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}}><div style={{width: 28, height: 4, background: index === points.length - 1 ? "#147d50" : accent}} />{point}</div>)}
    </div>
  );
};

const AbstractChart: React.FC<{accent: string}> = ({accent}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [8, 44], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const values = [18, 22, 25, 20, 23, 27, 22, 21];
  return (
    <div style={{border: "1.5px solid #101311", borderRadius: 8, background: "#faf8f3", padding: "28px 34px 24px", boxShadow: "9px 9px 0 #ffe1d6"}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18}}><span style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 17, color: "#59615b"}}>ILLUSTRATIVE RESULTS</span><span style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 17, color: accent}}>TONIGHT: 24.5</span></div>
      <svg width="1120" height="310" viewBox="0 0 1120 310">
        <line x1="40" y1="86" x2={40 + 1020 * draw} y2="86" stroke={accent} strokeWidth="6" strokeDasharray="14 10" />
        <text x="950" y="70" fill={accent} fontFamily="IBM Plex Mono" fontSize="22">24.5 LINE</text>
        {values.map((value, index) => {
          const h = value * 7;
          const over = value > 24.5;
          return <g key={`${value}-${index}`} opacity={interpolate(frame, [12 + index * 4, 20 + index * 4], [0, 1], clamp)}><rect x={55 + index * 128} y={270 - h} width="80" height={h} rx="4" fill={over ? "#147d50" : "#d5d9d5"} /><text x={95 + index * 128} y="298" textAnchor="middle" fill="#59615b" fontFamily="IBM Plex Mono" fontSize="17">{value}</text></g>;
        })}
      </svg>
    </div>
  );
};

const Workflow: React.FC<{points: string[]; accent: string}> = ({points, accent}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: "grid", gridTemplateColumns: `repeat(${points.length}, 1fr)`, alignItems: "stretch", gap: 18}}>
      {points.map((point, index) => <div key={point} style={{position: "relative", minHeight: 220, border: "1.5px solid #101311", borderRadius: 7, padding: "28px 24px", background: index === points.length - 1 ? "#101311" : "#faf8f3", color: index === points.length - 1 ? "#faf8f3" : "#101311", boxShadow: index === points.length - 1 ? `8px 8px 0 ${accent}` : "7px 7px 0 rgba(16,19,17,0.10)", opacity: interpolate(frame, [8 + index * 10, 20 + index * 10], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}}><div style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 17, color: accent}}>0{index + 1}</div><div style={{fontFamily: "Familjen Grotesk, sans-serif", fontSize: 34, lineHeight: 1.08, fontWeight: 700, marginTop: 25}}>{point}</div></div>)}
    </div>
  );
};

const SceneView: React.FC<{scene: Scene; durationInFrames: number; accentColor: string; successColor: string}> = ({scene, durationInFrames, accentColor, successColor}) => {
  const frame = useCurrentFrame();
  const accent = scene.accent === "green" ? successColor : accentColor;
  const entry = interpolate(frame, [0, 8], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});

  return (
    <AbsoluteFill style={{opacity: entry, color: "#101311", overflow: "hidden"}}>
      <GridBackground accent={accent} />
      <div style={{position: "relative", zIndex: 1, height: "100%", padding: "38px 70px 110px", display: "flex", flexDirection: "column", gap: 20}}>
        <Brand accent={accent} signal={scene.signal} historical={scene.historical} />
        <Headline scene={scene} accent={accent} compact={["desktop", "mobile", "dual"].includes(scene.layout)} />

        {scene.layout === "desktop" ? (
          <div style={{flex: 1, display: "grid", gridTemplateColumns: scene.points || scene.callout ? "1fr 2.1fr" : "1fr", alignItems: "center", gap: 42}}>
            {scene.points || scene.callout ? <div style={{display: "flex", flexDirection: "column", gap: 26}}>{scene.callout ? <Callout text={scene.callout} accent={accent} /> : null}{scene.points ? <Points points={scene.points} accent={accent} /> : null}</div> : null}
            <BrowserFrame scene={scene} width={scene.points || scene.callout ? 1110 : 1480} height={560} durationInFrames={durationInFrames} />
          </div>
        ) : null}

        {scene.layout === "mobile" ? (
          <div style={{flex: 1, display: "grid", gridTemplateColumns: "1fr 0.72fr", alignItems: "center", gap: 70}}><div style={{display: "flex", flexDirection: "column", gap: 25}}>{scene.callout ? <Callout text={scene.callout} accent={accent} /> : null}{scene.points ? <Points points={scene.points} accent={accent} /> : null}</div><PhoneFrame asset={scene.asset!} crop={scene.crop!} focus={scene.focus} durationInFrames={durationInFrames} width={420} height={650} /></div>
        ) : null}

        {scene.layout === "dual" ? (
          <div style={{flex: 1, display: "grid", gridTemplateColumns: "1.55fr 0.58fr", alignItems: "center", gap: 42}}>
            <BrowserFrame scene={scene} width={1190} height={560} durationInFrames={durationInFrames} />
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 18}}><PhoneFrame asset={scene.mobileAsset!} crop={scene.mobileCrop!} focus={scene.mobileFocus} durationInFrames={durationInFrames} width={360} height={580} />{scene.callout ? <Callout text={scene.callout} accent={accent} /> : null}</div>
          </div>
        ) : null}

        {scene.layout === "editorial" || scene.layout === "signals" ? (
          <div style={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30}}>{scene.cards ? <Cards cards={scene.cards} accent={accent} durationInFrames={durationInFrames} /> : null}{scene.callout ? <Callout text={scene.callout} accent={accent} /> : null}</div>
        ) : null}

        {scene.layout === "example" ? (
          <div style={{flex: 1, display: "grid", gridTemplateColumns: "1fr 1.25fr", alignItems: "center", gap: 65}}><div style={{fontFamily: "IBM Plex Mono, monospace", color: "#59615b", fontSize: 22, lineHeight: 1.55}}>EXAMPLE — NOT A LIVE PICK<br />PLAYER · POINTS · OVER · 24.5</div><div style={{border: "2px solid #101311", borderRadius: 8, background: "#faf8f3", padding: "44px", boxShadow: `12px 12px 0 ${accent}`, display: "flex", flexDirection: "column", gap: 24}}><div style={{fontFamily: "IBM Plex Mono, monospace", color: "#59615b", fontSize: 18}}>POINTS</div><div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><span style={{fontFamily: "Familjen Grotesk, sans-serif", fontSize: 74, fontWeight: 700}}>OVER</span><span style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 92, fontWeight: 600, color: accent}}>24.5</span></div>{scene.callout ? <Callout text={scene.callout} accent={accent} /> : null}</div></div>
        ) : null}

        {scene.layout === "chart" ? <div style={{flex: 1, display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center", gap: 46}}><div style={{display: "flex", flexDirection: "column", gap: 24}}>{scene.callout ? <Callout text={scene.callout} accent={accent} /> : null}{scene.points ? <Points points={scene.points} accent={accent} /> : null}</div><AbstractChart accent={accent} /></div> : null}

        {scene.layout === "workflow" ? <div style={{flex: 1, display: "flex", alignItems: "center"}}><Workflow points={scene.points!} accent={accent} /></div> : null}
      </div>
    </AbsoluteFill>
  );
};

export const SixSignals: React.FC<SixSignalsProps> = ({showCaptions, accentColor, successColor}) => (
  <AbsoluteFill style={{background: "#f2efe8"}}>
    <Audio src={staticFile("assets/narration.mp3")} />
    {scenes.map((scene, index) => {
      const from = Math.round(scene.start * FPS);
      const durationInFrames = Math.round((scene.end - scene.start) * FPS);
      return <Sequence key={`${scene.start}-${scene.title}`} name={`Scene ${index + 1} · ${scene.eyebrow}`} from={from} durationInFrames={durationInFrames}><SceneView scene={scene} durationInFrames={durationInFrames} accentColor={accentColor} successColor={successColor} /></Sequence>;
    })}
    {showCaptions ? <Captions /> : null}
  </AbsoluteFill>
);

export {DURATION_IN_FRAMES};
