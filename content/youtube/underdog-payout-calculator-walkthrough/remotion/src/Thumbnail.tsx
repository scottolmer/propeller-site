import React from "react";
import {AbsoluteFill} from "remotion";
import {displayFont, fontCss, monoFont, sansFont} from "./fonts";

const Mark = () => <svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true"><path d="M32 8v20M32 28 13 40M32 28l19 12" fill="none" stroke="#ff6038" strokeWidth="9" strokeLinecap="round"/></svg>;

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: "#101311", color: "#f2efe8", fontFamily: displayFont, padding: "60px 68px", overflow: "hidden"}}>
    <style>{fontCss}</style>
    <div style={{position: "absolute", right: -70, top: -110, width: 520, height: 520, border: "90px solid rgba(255,96,56,.12)", borderRadius: "50%"}}/>
    <div style={{display: "flex", alignItems: "center", gap: 15, fontFamily: sansFont, fontSize: 24, fontWeight: 600}}><Mark/>PROPELLER PICKS</div>
    <div style={{fontSize: 106, lineHeight: .86, fontWeight: 700, letterSpacing: -4, marginTop: 62}}>UNDERDOG<br/><span style={{color: "#ff6038"}}>PAYOUTS</span></div>
    <div style={{position: "absolute", right: 70, bottom: 76, width: 540, background: "#f2efe8", color: "#101311", borderRadius: 16, padding: "28px 34px 30px", boxShadow: "16px 17px 0 #ff6038", rotate: "-2deg"}}>
      <div style={{fontFamily: monoFont, fontSize: 18, color: "#5a625d"}}>ILLUSTRATIVE BASE SCENARIO</div>
      <div style={{fontFamily: monoFont, fontSize: 58, fontWeight: 700, marginTop: 14}}>$10 × 20x</div>
      <div style={{fontSize: 72, fontWeight: 700, color: "#147d50", lineHeight: .9}}>= $200</div>
    </div>
    <div style={{position: "absolute", left: 70, bottom: 72, display: "flex", gap: 14}}>{["STANDARD", "FLEX", "FINAL CHECK"].map((label) => <span key={label} style={{background: label === "FINAL CHECK" ? "#ff6038" : "rgba(242,239,232,.1)", border: "1px solid rgba(242,239,232,.2)", padding: "10px 15px", borderRadius: 7, fontFamily: monoFont, fontSize: 17}}>{label}</span>)}</div>
  </AbsoluteFill>
);
