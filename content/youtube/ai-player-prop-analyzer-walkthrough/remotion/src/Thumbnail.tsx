import { AbsoluteFill, Img, staticFile } from "remotion";

export const VideoThumbnail: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#101311", overflow: "hidden", fontFamily: "Familjen, sans-serif" }}>
      <Img src={staticFile("assets/desktop-detail-historical.png")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6, objectPosition: "center" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(16,19,17,0.97) 0%, rgba(16,19,17,0.84) 42%, rgba(16,19,17,0.14) 100%)" }} />
      <div style={{ position: "absolute", left: 68, top: 58, color: "#ff6038", fontSize: 24, letterSpacing: 4, fontWeight: 800 }}>PROPELLER PICKS</div>
      <div style={{ position: "absolute", left: 68, top: 142, color: "#f2efe8", fontSize: 80, lineHeight: 0.88, fontWeight: 800, maxWidth: 620 }}>HOW TO READ A PLAYER PROP</div>
      <div style={{ position: "absolute", left: 72, top: 480, borderLeft: "8px solid #ff6038", paddingLeft: 22, color: "#f2efe8", fontFamily: "Plex, sans-serif", fontSize: 28, fontWeight: 700 }}>LINE → CONFIDENCE → AGENTS</div>
      <div style={{ position: "absolute", right: 72, bottom: 54, background: "#ff6038", color: "#101311", borderRadius: 999, padding: "16px 28px", fontFamily: "Plex, sans-serif", fontSize: 25, fontWeight: 800 }}>FREE WALKTHROUGH</div>
    </AbsoluteFill>
  );
};
