import {createTikTokStyleCaptions} from "@remotion/captions";
import type {Caption, TikTokPage} from "@remotion/captions";
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from "remotion";
import captionsJson from "../public/assets/captions.json";

const captions = captionsJson as Caption[];
const SWITCH_EVERY_MS = 1450;

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const absoluteTime = page.startMs + (frame / fps) * 1000;
  return (
    <div style={{maxWidth: 1450, margin: "0 auto", padding: "16px 28px 18px", borderRadius: 8, background: "rgba(16,19,17,.94)", borderTop: "3px solid #ff6038", boxShadow: "0 12px 32px rgba(0,0,0,.24)", color: "#f2efe8", fontFamily: "IBM Plex Sans", fontSize: 48, fontWeight: 700, lineHeight: 1.12, textAlign: "center", whiteSpace: "pre-wrap"}}>
      {page.tokens.map((token) => {
        const active = token.fromMs <= absoluteTime && token.toMs > absoluteTime;
        return <span key={`${token.fromMs}-${token.text}`} style={{color: active ? "#ff8a6d" : "#f2efe8"}}>{token.text}</span>;
      })}
    </div>
  );
};

export const Captions: React.FC = () => {
  const {fps} = useVideoConfig();
  const {pages} = createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: SWITCH_EVERY_MS});
  return (
    <AbsoluteFill style={{justifyContent: "flex-end", paddingBottom: 94, pointerEvents: "none"}}>
      {pages.map((page, index) => {
        const next = pages[index + 1];
        const from = Math.floor((page.startMs / 1000) * fps);
        const lastToken = page.tokens[page.tokens.length - 1];
        const until = next ? Math.floor((next.startMs / 1000) * fps) : Math.floor((lastToken.toMs / 1000) * fps) + 12;
        const duration = until - from;
        if (duration <= 0) return null;
        return <Sequence key={`${page.startMs}-${index}`} from={from} durationInFrames={duration} layout="none" name="Caption page"><CaptionPage page={page} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
