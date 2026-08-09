import { Audio } from "@remotion/media";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";
import captionsData from "../public/assets/captions.json";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const dark = "#101311";

type Scene = {
  start: number;
  end: number;
  asset: string;
  title: string;
  kicker: string;
  historical?: boolean;
  focus?: { left: number; top: number; width: number; height: number };
  mobile?: string;
  mobileTop?: number;
  note?: string;
  emptyState?: boolean;
};

const scenes: Scene[] = [
  {
    start: 0,
    end: 244,
    asset: "assets/public-current.png",
    kicker: "PROP ANALYZER · START HERE",
    title: "A clearer way to research a player prop",
    note: "START WITH THE EXACT LINE",
  },
  {
    start: 244,
    end: 1349,
    asset: "assets/desktop-detail-historical.png",
    mobile: "assets/mobile-detail-historical.png",
    kicker: "01 · DEFINE THE QUESTION",
    title: "Player. Stat. Direction. Line.",
    focus: { left: 420, top: 135, width: 915, height: 237 },
    historical: true,
    note: "A different line is a different research question",
  },
  {
    start: 1349,
    end: 2000,
    asset: "assets/desktop-detail-historical.png",
    mobile: "assets/mobile-model-historical.png",
    kicker: "02 · READ THE SCORE",
    title: "Confidence is signal strength—not a promise",
    focus: { left: 885, top: 375, width: 194, height: 138 },
    historical: true,
    note: "Confidence and chance-to-hit are separate measurements",
  },
  {
    start: 2000,
    end: 4818,
    asset: "assets/desktop-agents-historical.png",
    mobile: "assets/mobile-model-historical.png",
    kicker: "03 · INSPECT THE EVIDENCE",
    title: "Open the agent breakdown",
    focus: { left: 424, top: 595, width: 870, height: 357 },
    historical: true,
    note: "Look for support, conflict, and the top driver",
  },
  {
    start: 4818,
    end: 6084,
    asset: "assets/public-current.png",
    kicker: "04 · CHECK WHAT CHANGED",
    title: "A changed line needs fresh research",
    historical: false,
    note: "No current rows is information—not a reason to force a pick",
    emptyState: true,
  },
  {
    start: 6084,
    end: 6676,
    asset: "assets/desktop-detail-historical.png",
    mobile: "assets/mobile-model-historical.png",
    kicker: "05 · REPEAT THE WORKFLOW",
    title: "Confirm. Interpret. Inspect. Recheck. Pass if needed.",
    historical: true,
    note: "A repeatable process beats a forced opinion",
  },
  {
    start: 6676,
    end: 7162,
    asset: "assets/public-current.png",
    kicker: "PROPELLER PICKS",
    title: "Research the line. Understand the signal.",
    note: "propellerpicks.com/analyzer",
  },
];

const captions = captionsData as Caption[];

const HistoricalTag: React.FC = () => (
  <div className="historical-tag">ILLUSTRATIVE HISTORICAL CAPTURE · JULY 2026</div>
);

const SceneImage: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - scene.start;
  const duration = scene.end - scene.start;
  const fade = interpolate(local, [0, 16, duration - 16, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const drift = interpolate(local, [0, duration], [1.015, 1.075], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleIn = interpolate(local, [8, 28], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Sequence from={scene.start} durationInFrames={duration} name={scene.title}>
      <AbsoluteFill style={{ opacity: fade, backgroundColor: dark }}>
        <Img
          src={staticFile(scene.asset)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: drift,
            filter: "brightness(0.82) saturate(0.9)",
          }}
        />
        <AbsoluteFill className="image-wash" />
        <div className="title-block" style={{ translate: `0 ${titleIn}px`, opacity: interpolate(local, [8, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div className="kicker">{scene.kicker}</div>
          <div className="scene-title">{scene.title}</div>
        </div>
        {scene.historical ? <HistoricalTag /> : null}
        {scene.focus ? (
          <div
            className="focus-box"
            style={{
              left: scene.focus.left,
              top: scene.focus.top,
              width: scene.focus.width,
              height: scene.focus.height,
              opacity: interpolate(local, [24, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          />
        ) : null}
        {scene.mobile ? (
          <div
            className="phone-frame"
            style={{
              top: scene.mobileTop ?? 180,
              opacity: interpolate(local, [34, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              translate: `${interpolate(local, [34, 54], [90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px 0`,
            }}
          >
            <Img src={staticFile(scene.mobile)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          </div>
        ) : null}
        {scene.emptyState ? (
          <div className="empty-state-card">
            <div className="empty-state-kicker">CURRENT PUBLIC FEED · JULY 21, 2026</div>
            <div className="empty-state-title">No current props available</div>
            <div className="empty-state-copy">The analyzer does not relabel an older slate as current. Recheck the line, player status, and slate before you continue.</div>
            <div className="empty-state-pass">PASS IS A VALID OUTCOME</div>
          </div>
        ) : null}
        <div className="scene-note" style={{ opacity: interpolate(local, [50, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {scene.note}
        </div>
        <div className="progress-rail">
          <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, ((frame / fps) / 238.7) * 100))}%` }} />
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = page.startMs + (frame / fps) * 1000;
  return (
    <div className="caption-box">
      {page.tokens.map((token) => {
        const active = token.fromMs <= time && token.toMs > time;
        return (
          <span key={`${token.fromMs}-${token.text}`} className={active ? "caption-active" : "caption-token"}>
            {token.text}
          </span>
        );
      })}
    </div>
  );
};

const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const pages = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1450 }).pages;
  return (
    <AbsoluteFill className="captions-layer">
      {pages.map((page, index) => {
        const next = pages[index + 1];
        const from = Math.floor((page.startMs / 1000) * fps);
        const until = next
          ? Math.floor((next.startMs / 1000) * fps)
          : Math.floor((page.tokens[page.tokens.length - 1].toMs / 1000) * fps) + 22;
        return until > from ? (
          <Sequence key={`${page.startMs}-${index}`} from={from} durationInFrames={until - from} layout="none" name="Caption">
            <CaptionPage page={page} />
          </Sequence>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

export const PropAnalyzerWalkthrough: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: dark }}>
      {scenes.map((scene) => <SceneImage key={scene.start} scene={scene} />)}
      <Captions />
      <Audio src={staticFile("assets/narration.mp3")} />
    </AbsoluteFill>
  );
};
