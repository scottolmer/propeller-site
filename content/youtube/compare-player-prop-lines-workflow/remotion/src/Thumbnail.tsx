import {AbsoluteFill} from "remotion";
import "./fonts";

const orange = "#ff6038";
const ink = "#101311";
const paper = "#f2efe8";

const Mark: React.FC = () => (
  <svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true"><path d="M32 8v20M32 28 13 40M32 28l19 12" fill="none" stroke={orange} strokeWidth="9" strokeLinecap="round" /></svg>
);

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: paper, color: ink, fontFamily: "IBM Plex Sans", overflow: "hidden"}}>
    <div style={{position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(16,19,17,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(16,19,17,.06) 1px,transparent 1px)", backgroundSize: "32px 32px"}} />
    <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: orange}} />
    <div style={{position: "relative", height: "100%", padding: "54px 64px", display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: 44, alignItems: "center"}}>
      <div>
        <div style={{display: "flex", alignItems: "center", gap: 13}}><Mark /><div style={{fontFamily: "IBM Plex Mono", fontSize: 17, letterSpacing: 2.2, color: orange}}>PROPELLER FIELD GUIDE</div></div>
        <div style={{fontFamily: "Familjen Grotesk", fontSize: 88, fontWeight: 700, lineHeight: .88, letterSpacing: -3.5, marginTop: 28}}>Compare<br />prop lines.<br /><span style={{color: orange}}>Quickly.</span></div>
        <div style={{display: "inline-flex", marginTop: 27, padding: "11px 16px", border: `2px solid ${ink}`, fontFamily: "IBM Plex Mono", fontSize: 16}}>LINE · TIME · TERMS · EVIDENCE</div>
      </div>
      <div style={{rotate: "1.4deg", background: "#fff", border: `2px solid ${ink}`, boxShadow: `18px 20px 0 ${orange}`, padding: 28}}>
        <div style={{fontFamily: "IBM Plex Mono", fontSize: 13, color: "#626a64"}}>ILLUSTRATIVE WORKFLOW · NOT LIVE LINES</div>
        <div style={{fontFamily: "Familjen Grotesk", fontSize: 42, fontWeight: 700, marginTop: 12}}>Example Player</div>
        <div style={{fontSize: 20, color: "#626a64", marginTop: 3}}>Rebounds · OVER</div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 25}}>
          {[["EXACT LINE", "8.5"], ["CAPTURED", "10:02"], ["SOURCE", "PLATFORM A"], ["STATUS", "MATCH"]].map(([label, value], i) => (
            <div key={label} style={{padding: "14px 15px", background: i === 3 ? "#e3f4eb" : "#f6f4ee", borderLeft: `5px solid ${i === 3 ? "#147d50" : orange}`}}><div style={{fontFamily: "IBM Plex Mono", fontSize: 11, color: "#626a64"}}>{label}</div><div style={{fontFamily: "Familjen Grotesk", fontSize: 25, fontWeight: 700, marginTop: 5}}>{value}</div></div>
          ))}
        </div>
        <div style={{marginTop: 22, background: ink, color: paper, padding: "14px 16px", fontFamily: "IBM Plex Mono", fontSize: 14}}>FALSE MATCH? → NO ACTION</div>
      </div>
    </div>
  </AbsoluteFill>
);
