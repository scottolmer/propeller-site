import React from "react";
import {AbsoluteFill, Img, staticFile} from "remotion";

const Mark: React.FC = () => (
  <svg width="60" height="60" viewBox="0 0 54 54" aria-hidden="true">
    <circle cx="27" cy="27" r="5.5" fill="#ff6038" />
    <path d="M27 27V5M27 27L7 40M27 27L47 40" stroke="#ff6038" strokeWidth="7.5" strokeLinecap="round" />
  </svg>
);

export const Thumbnail: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#f2efe8",
      color: "#101311",
      fontFamily: "Familjen Grotesk, sans-serif",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.38,
        backgroundImage:
          "linear-gradient(rgba(16,19,17,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,19,17,0.08) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
    <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: "#ff6038"}} />
    <div style={{position: "absolute", width: 690, height: 690, borderRadius: 999, right: -280, top: -330, border: "100px solid #ff6038", opacity: 0.1}} />

    <div style={{position: "relative", zIndex: 2, width: "100%", height: "100%", padding: "40px 48px 38px 58px", display: "grid", gridTemplateColumns: "0.87fr 1.13fr", gap: 38}}>
      <div style={{display: "flex", flexDirection: "column"}}>
        <div style={{display: "flex", alignItems: "center", gap: 14}}>
          <Mark />
          <div>
            <div style={{fontSize: 30, lineHeight: 0.9, fontWeight: 700}}>PROPELLER</div>
            <div style={{fontFamily: "IBM Plex Mono, monospace", fontSize: 12, letterSpacing: 7, color: "#ff6038", marginTop: 8}}>PICKS</div>
          </div>
        </div>

        <div style={{marginTop: 50, fontFamily: "IBM Plex Mono, monospace", fontSize: 22, fontWeight: 600, letterSpacing: 2.4, color: "#147d50"}}>HOW TO ANALYZE</div>
        <div style={{marginTop: 8, fontSize: 142, lineHeight: 0.78, fontWeight: 700, letterSpacing: -8, color: "#ff6038"}}>6</div>
        <div style={{fontSize: 92, lineHeight: 0.82, fontWeight: 700, letterSpacing: -4.5}}>SIGNALS</div>
        <div style={{marginTop: 28, display: "inline-flex", alignSelf: "flex-start", background: "#101311", color: "#faf8f3", padding: "13px 18px 15px", boxShadow: "7px 7px 0 #ff6038", fontFamily: "IBM Plex Mono, monospace", fontSize: 23, fontWeight: 600, letterSpacing: 0.5}}>BEFORE ANY PROP</div>
      </div>

      <div style={{display: "flex", alignItems: "center", position: "relative"}}>
        <div style={{position: "absolute", right: 10, top: 63, width: 665, height: 540, border: "3px solid #101311", borderRadius: 9, background: "#101311", padding: "46px 8px 8px", boxShadow: "14px 14px 0 rgba(255,96,56,0.32)", overflow: "hidden"}}>
          <div style={{position: "absolute", top: 16, left: 18, display: "flex", gap: 8}}>
            {["#ff6038", "#c8f56a", "#147d50"].map((color) => <div key={color} style={{width: 12, height: 12, borderRadius: 99, background: color}} />)}
          </div>
          <div style={{position: "absolute", top: 10, left: 132, right: 18, height: 26, borderRadius: 4, background: "#242a26", color: "#bbc1bc", padding: "5px 14px", fontFamily: "IBM Plex Mono, monospace", fontSize: 11}}>app.propellerpicks.com</div>
          <div style={{position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 4, background: "#eef1f5"}}>
            <Img src={staticFile("assets/desktop-agents.png")} width={1920} height={1080} style={{position: "absolute", width: 1540, height: 866, maxWidth: "none", left: -320, top: -345}} />
            <div style={{position: "absolute", left: 18, right: 18, top: 170, height: 300, border: "6px solid #ff6038", borderRadius: 8, boxShadow: "0 0 0 999px rgba(16,19,17,0.24)"}} />
          </div>
        </div>
        <div style={{position: "absolute", right: -2, top: 40, background: "#147d50", color: "white", padding: "12px 17px", fontFamily: "IBM Plex Mono, monospace", fontSize: 17, fontWeight: 600, letterSpacing: 1.4, boxShadow: "6px 6px 0 #101311"}}>AGENT BREAKDOWN</div>
      </div>
    </div>
  </AbsoluteFill>
);
