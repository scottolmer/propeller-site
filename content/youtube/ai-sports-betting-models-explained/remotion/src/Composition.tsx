import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CaptionTrack } from "./Captions";

const FPS = 30;
const DURATION = 8613;
const DARK = "#101311";
const ORANGE = "#ff6038";
const PAPER = "#f2efe8";

type SceneProps = {
  from: number;
  duration: number;
  children: React.ReactNode;
};

const Scene: React.FC<SceneProps> = ({ from, duration, children }) => (
  <Sequence name={`Scene ${from / FPS}s`} from={from} durationInFrames={duration}>
    {children}
  </Sequence>
);

const EditorialLabel: React.FC<{ text: string; dark?: boolean }> = ({ text, dark }) => (
  <div
    style={{
      background: dark ? "rgba(16,19,17,0.88)" : "rgba(242,239,232,0.94)",
      color: dark ? PAPER : DARK,
      border: `1px solid ${dark ? "rgba(255,255,255,0.18)" : "rgba(16,19,17,0.16)"}`,
      borderRadius: 999,
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: 1.2,
      padding: "12px 20px",
      textTransform: "uppercase",
      width: "fit-content",
    }}
  >
    {text}
  </div>
);

const HistoricalLabel: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 32,
      right: 38,
      zIndex: 10,
      background: "rgba(16,19,17,0.9)",
      color: PAPER,
      borderLeft: `5px solid ${ORANGE}`,
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: 1,
      padding: "11px 15px",
    }}
  >
    ILLUSTRATIVE HISTORICAL CAPTURE · JULY 2026
  </div>
);

const ImageStage: React.FC<{
  src: string;
  historical?: boolean;
  position?: string;
  scale?: number;
  dim?: boolean;
}> = ({ src, historical, position = "center", scale = 1, dim = false }) => {
  const frame = useCurrentFrame();
  const settle = interpolate(frame, [0, 24], [1.035 * scale, scale], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DARK }}>
      <Img
        src={staticFile(src)}
        style={{
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          scale: settle,
          width: "100%",
        }}
      />
      {dim ? <AbsoluteFill style={{ background: "rgba(16,19,17,0.32)" }} /> : null}
      {historical ? <HistoricalLabel /> : null}
    </AbsoluteFill>
  );
};

const SignalMap: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = ["MARKET", "ROLE", "MATCHUP", "AVAILABILITY", "CONTEXT", "FORM"];
  return (
    <AbsoluteFill style={{ alignItems: "center", background: PAPER, justifyContent: "center", padding: 100 }}>
      <div style={{ left: 110, position: "absolute", top: 100 }}>
        <EditorialLabel text="Inputs that can matter" />
        <div style={{ color: DARK, fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 70, fontWeight: 800, letterSpacing: -2, marginTop: 24, maxWidth: 860 }}>
          The model starts with a specific line—not a vague opinion.
        </div>
      </div>
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(3, 1fr)", marginTop: 250, width: 1450 }}>
        {nodes.map((node, index) => (
          <div
            key={node}
            style={{
              background: index === 0 ? DARK : "#ffffff",
              border: `2px solid ${index === 0 ? DARK : "#d9d5ca"}`,
              borderRadius: 18,
              color: index === 0 ? PAPER : DARK,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 31,
              fontWeight: 700,
              opacity: interpolate(frame, [index * 7, index * 7 + 16], [0, 1], { extrapolateRight: "clamp" }),
              padding: "35px 32px",
              scale: interpolate(frame, [index * 7, index * 7 + 18], [0.92, 1], { extrapolateRight: "clamp" }),
            }}
          >
            {node}
          </div>
        ))}
      </div>
      <div style={{ bottom: 96, color: "#5d615d", fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 28, maxWidth: 1200, textAlign: "center" }}>
        The exact mix depends on the sport, the market, and what data is available for that player prop.
      </div>
    </AbsoluteFill>
  );
};

const DesktopConfidenceCloseup: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ background: PAPER, border: `2px solid rgba(255,96,56,0.72)`, boxShadow: "0 24px 52px rgba(0,0,0,0.28)", height: 310, left: 110, overflow: "hidden", position: "absolute", top: 520, translate: `${interpolate(frame, [0, 22], [-34, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px 0`, width: 930, zIndex: 4 }}>
      <Img src={staticFile("desktop-detail-historical.png")} style={{ height: 1620, left: -650, position: "absolute", top: -520, width: 2880 }} />
      <div style={{ background: "rgba(16,19,17,0.92)", color: PAPER, fontFamily: "IBM Plex Mono, monospace", fontSize: 16, fontWeight: 700, left: 0, padding: "9px 13px", position: "absolute", top: 0 }}>DESKTOP · ILLUSTRATIVE HISTORICAL DETAIL · JULY 2026</div>
      <div style={{ background: "rgba(16,19,17,0.84)", bottom: 0, color: PAPER, fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 22, fontWeight: 700, left: 0, padding: "12px 16px", position: "absolute" }}>DIRECTION + CONFIDENCE, SHOWN TOGETHER</div>
    </div>
  );
};

const AgentBreakdownPair: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <div style={{ color: DARK, left: 110, position: "absolute", top: 78, zIndex: 5 }}>
        <EditorialLabel text="Open the agent breakdown" />
        <div style={{ fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 68, fontWeight: 800, letterSpacing: -2.1, lineHeight: 0.96, marginTop: 22, maxWidth: 1150 }}>See what supports the direction—and what pushes back.</div>
      </div>
      <div style={{ bottom: 82, display: "grid", gap: 24, gridTemplateColumns: "1fr 0.47fr", left: 100, position: "absolute", right: 100, top: 300 }}>
        <div style={{ background: DARK, overflow: "hidden", position: "relative", scale: interpolate(frame, [0, 28], [0.97, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }) }}>
          <Img src={staticFile("desktop-agents-historical.png")} style={{ height: "100%", objectFit: "cover", objectPosition: "55% 64%", width: "100%" }} />
          <HistoricalLabel />
          <div style={{ background: "rgba(16,19,17,0.9)", bottom: 18, color: PAPER, fontFamily: "IBM Plex Mono, monospace", fontSize: 18, fontWeight: 700, left: 18, padding: "12px 14px", position: "absolute" }}>DESKTOP · MODEL BREAKDOWN</div>
        </div>
        <div style={{ background: "#111", overflow: "hidden", position: "relative", scale: interpolate(frame, [8, 34], [0.97, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }) }}>
          <Img src={staticFile("mobile-model-historical.png")} style={{ height: "100%", objectFit: "cover", objectPosition: "center 96%", width: "100%" }} />
          <HistoricalLabel />
          <div style={{ background: "rgba(16,19,17,0.9)", bottom: 18, color: PAPER, fontFamily: "IBM Plex Mono, monospace", fontSize: 18, fontWeight: 700, left: 18, padding: "12px 14px", position: "absolute" }}>MOBILE · SIGNAL MIX + AGENTS</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AnalyzerEnding: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 20], [28, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <AbsoluteFill style={{ background: DARK, overflow: "hidden" }}>
      <Img src={staticFile("current-analyzer-jul-21.png")} style={{ height: "100%", objectFit: "cover", objectPosition: "center 38%", scale: interpolate(frame, [0, 660], [1.03, 1.1], { extrapolateRight: "clamp" }), width: "100%" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(16,19,17,0.97) 0%, rgba(16,19,17,0.78) 45%, rgba(16,19,17,0.18) 78%, rgba(16,19,17,0.04) 100%)" }} />
      <div style={{ color: PAPER, left: 112, position: "absolute", top: 164, translate: `0 ${rise}px`, width: 760 }}>
        <EditorialLabel text="Explore the current analyzer" dark />
        <div style={{ fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 78, fontWeight: 800, letterSpacing: -2.5, lineHeight: 0.96, marginTop: 28 }}>Use the model to make research clearer.</div>
        <div style={{ borderLeft: `5px solid ${ORANGE}`, fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 31, lineHeight: 1.28, marginTop: 34, paddingLeft: 21 }}>Start with the exact prop question, then keep the current line, news, and uncertainty in the decision.</div>
        <div style={{ color: ORANGE, fontFamily: "IBM Plex Mono, monospace", fontSize: 28, fontWeight: 700, marginTop: 38 }}>PROPELLERPICKS.COM/ANALYZER</div>
      </div>
      <div style={{ background: "rgba(16,19,17,0.86)", bottom: 42, color: "#d8d8d0", fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 17, lineHeight: 1.3, padding: "13px 16px", position: "absolute", right: 42, textAlign: "right", width: 560 }}>Research and analytics, not a sportsbook. Player props involve uncertainty; nothing here is a guarantee or financial advice.</div>
    </AbsoluteFill>
  );
};

const ModelSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = Math.floor(frame / fps);
  const section = seconds < 18 ? "Current analyzer" : seconds < 35 ? "Exact question" : seconds < 64 ? "Available inputs" : seconds < 110 ? "Sport-specific signals" : seconds < 154 ? "Agents and disagreement" : seconds < 195 ? "Direction + confidence" : seconds < 218 ? "Limits and freshness" : seconds < 242 ? "A responsible workflow" : seconds < 265 ? "What it cannot tell you" : "Explore the analyzer";
  return (
    <AbsoluteFill>
      <Scene from={0} duration={540}>
        <ImageStage src="current-analyzer-jul-21.png" dim />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(16,19,17,0.96) 0%, rgba(16,19,17,0.47) 58%, rgba(16,19,17,0.08) 100%)", justifyContent: "center", paddingLeft: 110 }}>
          <div style={{ color: PAPER, maxWidth: 820 }}>
            <EditorialLabel text="Answer first" dark />
            <div style={{ fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 78, fontWeight: 800, letterSpacing: -2.5, lineHeight: 0.98, marginTop: 28 }}>
              A model helps you inspect the evidence behind a player prop.
            </div>
            <div style={{ borderLeft: `5px solid ${ORANGE}`, fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 31, lineHeight: 1.25, marginTop: 34, paddingLeft: 20 }}>
              It does not guarantee the result—or replace your judgment.
            </div>
          </div>
        </AbsoluteFill>
      </Scene>

      <Scene from={540} duration={510}>
        <ImageStage src="desktop-detail-historical.png" historical position="60% 26%" scale={1.07} />
        <div style={{ background: "rgba(16,19,17,0.92)", bottom: 78, color: PAPER, left: 86, padding: "28px 34px", position: "absolute", width: 740 }}>
          <EditorialLabel text="The actual question" dark />
          <div style={{ fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 47, fontWeight: 800, letterSpacing: -1.3, lineHeight: 1.05, marginTop: 18 }}>
            Player · stat · direction · current line
          </div>
        </div>
      </Scene>

      <Scene from={1050} duration={870}>
        <SignalMap />
      </Scene>

      <Scene from={1920} duration={1380}>
        <ImageStage src="desktop-agents-historical.png" historical position="54% 64%" scale={1.16} />
        <div style={{ background: "rgba(242,239,232,0.96)", borderLeft: `6px solid ${ORANGE}`, bottom: 70, left: 70, padding: "24px 30px", position: "absolute", width: 680 }}>
          <div style={{ color: DARK, fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 46, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.05 }}>
            The breakdown shows agreement, conflict, and the strongest driver.
          </div>
        </div>
      </Scene>

      <Scene from={3300} duration={1342}>
        <AgentBreakdownPair />
      </Scene>

      <Scene from={4642} duration={1200}>
        <AbsoluteFill style={{ background: DARK }}>
          <div style={{ color: PAPER, left: 110, position: "absolute", top: 88, zIndex: 4 }}>
            <EditorialLabel text="Read direction first" dark />
            <div style={{ fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 72, fontWeight: 800, letterSpacing: -2.2, marginTop: 24, maxWidth: 800 }}>
              Confidence is signal strength—not a win probability.
            </div>
          </div>
          <DesktopConfidenceCloseup />
          <div style={{ bottom: 0, height: 890, overflow: "hidden", position: "absolute", right: 130, width: 520 }}>
            <Img src={staticFile("mobile-detail-historical.png")} style={{ height: 1480, objectFit: "cover", objectPosition: "center top", width: 520 }} />
            <HistoricalLabel />
            <div style={{ background: DARK, bottom: 0, height: 340, left: 0, position: "absolute", right: 0 }} />
          </div>
        </AbsoluteFill>
      </Scene>

      <Scene from={5842} duration={686}>
        <ImageStage src="current-analyzer-jul-21.png" dim position="center 68%" scale={1.12} />
        <AbsoluteFill style={{ alignItems: "flex-start", background: "linear-gradient(90deg, rgba(16,19,17,0.94), rgba(16,19,17,0.32))", justifyContent: "center", paddingLeft: 105 }}>
          <div style={{ color: PAPER, maxWidth: 820 }}>
            <EditorialLabel text="When to slow down" dark />
            <div style={{ fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 74, fontWeight: 800, letterSpacing: -2.4, lineHeight: 0.98, marginTop: 25 }}>
              Missing data is not positive evidence.
            </div>
            <div style={{ fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 31, lineHeight: 1.3, marginTop: 32 }}>
              Late news, role changes, sparse samples, source problems, and a changed line can all weaken an earlier analysis.
            </div>
          </div>
        </AbsoluteFill>
      </Scene>

      <Scene from={6528} duration={746}>
        <AbsoluteFill style={{ background: PAPER }}>
          <div style={{ color: DARK, left: 110, position: "absolute", top: 78, zIndex: 5 }}>
            <EditorialLabel text="The workflow" />
            <div style={{ fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 68, fontWeight: 800, letterSpacing: -2, marginTop: 22 }}>Use the model. Do not hand it the decision.</div>
          </div>
          <div style={{ bottom: 70, display: "grid", gap: 24, gridTemplateColumns: "1fr 0.48fr", left: 100, position: "absolute", right: 100, top: 300 }}>
            <div style={{ background: DARK, overflow: "hidden", position: "relative" }}>
              <Img src={staticFile("desktop-agents-historical.png")} style={{ height: "100%", objectFit: "cover", objectPosition: "55% 62%", width: "100%" }} />
              <HistoricalLabel />
            </div>
            <div style={{ background: "#111", overflow: "hidden", position: "relative" }}>
              <Img src={staticFile("mobile-model-historical.png")} style={{ height: "100%", objectFit: "cover", objectPosition: "center 96%", width: "100%" }} />
              <HistoricalLabel />
            </div>
          </div>
          <div style={{ bottom: 96, display: "flex", gap: 18, left: 114, position: "absolute", zIndex: 6 }}>
            {["1 · CURRENT LINE", "2 · DIRECTION + CONFIDENCE", "3 · AGENTS", "4 · FRESHNESS", "5 · RESEARCH OR PASS"].map((item, index) => (
              <div key={item} style={{ background: index === 4 ? ORANGE : DARK, color: index === 4 ? DARK : PAPER, fontFamily: "IBM Plex Mono, monospace", fontSize: 18, fontWeight: 700, padding: "15px 16px" }}>
                {item}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Scene>

      <Scene from={7274} duration={676}>
        <AbsoluteFill style={{ background: DARK, color: PAPER, justifyContent: "center", padding: "0 140px" }}>
          <EditorialLabel text="What the model cannot tell you" dark />
          <div style={{ fontFamily: "Familjen Grotesk, Arial, sans-serif", fontSize: 91, fontWeight: 800, letterSpacing: -3.5, lineHeight: 0.95, marginTop: 34, maxWidth: 1380 }}>
            It cannot guarantee a result, know unavailable information, or decide your risk tolerance.
          </div>
          <div style={{ borderTop: "1px solid rgba(242,239,232,0.25)", color: "#c9c9c2", fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 31, lineHeight: 1.3, marginTop: 55, maxWidth: 1120, paddingTop: 28 }}>
            Use the model to make the research clearer—not to hand off the decision.
          </div>
          <div style={{ bottom: 72, color: "#8d938c", fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 18, lineHeight: 1.3, position: "absolute", right: 140, textAlign: "right", width: 680 }}>
            Propeller Picks is a research and analytics platform, not a sportsbook. Player props involve uncertainty; nothing here is a guarantee or financial advice.
          </div>
        </AbsoluteFill>
      </Scene>

      <Scene from={7950} duration={663}>
        <AnalyzerEnding />
      </Scene>

      <Audio src={staticFile("narration.mp3")} />
      <CaptionTrack />
      <div style={{ background: "rgba(16,19,17,0.86)", color: PAPER, fontFamily: "IBM Plex Mono, monospace", fontSize: 17, left: 30, padding: "9px 12px", position: "absolute", top: 26, zIndex: 30 }}>
        {section.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};

const ModelThumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: DARK, overflow: "hidden" }}>
    <Img src={staticFile("mobile-detail-historical.png")} style={{ height: "108%", objectFit: "cover", objectPosition: "center 13%", opacity: 0.92, position: "absolute", right: -44, top: -18, width: "52%" }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, #101311 0%, #101311 42%, rgba(16,19,17,0.48) 69%, rgba(16,19,17,0.06) 100%)" }} />
    <div style={{ color: PAPER, left: 64, position: "absolute", top: 54, width: 760 }}>
      <div style={{ color: ORANGE, fontFamily: "IBM Plex Mono, monospace", fontSize: 23, fontWeight: 700, letterSpacing: 1.2 }}>PROPELLER PICKS EXPLAINS</div>
      <div style={{ fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 88, fontWeight: 700, letterSpacing: -3.8, lineHeight: 0.9, marginTop: 26 }}>HOW AI SPORTS BETTING MODELS WORK</div>
      <div style={{ color: PAPER, fontFamily: "IBM Plex Mono, monospace", fontSize: 30, fontWeight: 700, lineHeight: 1.15, marginTop: 30 }}>SIGNAL ≠ CERTAINTY</div>
    </div>
    <div style={{ background: "rgba(16,19,17,0.9)", color: PAPER, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 700, padding: "9px 12px", position: "absolute", right: 24, top: 22 }}>ILLUSTRATIVE HISTORICAL CAPTURE</div>
    <div style={{ background: ORANGE, bottom: 48, color: DARK, fontFamily: "IBM Plex Mono, monospace", fontSize: 20, fontWeight: 700, left: 64, padding: "12px 16px", position: "absolute" }}>CONFIDENCE · AGENTS · CURRENT LINE</div>
  </AbsoluteFill>
);

export const ModelExplainerComposition: React.FC = () => (
  <>
    <Composition id="ModelExplainer" component={ModelSystem} durationInFrames={DURATION} fps={FPS} height={1080} width={1920} />
    <Composition id="ModelThumbnail" component={ModelThumbnail} durationInFrames={1} fps={FPS} height={720} width={1280} />
  </>
);
