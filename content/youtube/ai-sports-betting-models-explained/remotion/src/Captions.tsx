import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", padding: "0 220px 96px" }}>
      <div style={{ background: "rgba(16,19,17,0.88)", border: "1px solid rgba(242,239,232,0.20)", boxShadow: "0 16px 46px rgba(0,0,0,0.24)", color: "#f2efe8", fontFamily: "IBM Plex Sans, Arial, sans-serif", fontSize: 38, fontWeight: 700, lineHeight: 1.14, padding: "17px 25px", textAlign: "center", whiteSpace: "pre-wrap" }}>
        {page.tokens.map((token) => {
          const active = token.fromMs <= currentMs && token.toMs > currentMs;
          return <span key={`${token.fromMs}-${token.text}`} style={{ color: active ? "#ff6038" : "#f2efe8" }}>{token.text}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionTrack: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("captions"));
  const load = useCallback(async () => {
    try {
      const response = await fetch(staticFile("captions.json"));
      setCaptions((await response.json()) as Caption[]);
      continueRender(handle);
    } catch (error) {
      cancelRender(error);
    }
  }, [cancelRender, continueRender, handle]);
  useEffect(() => { load(); }, [load]);
  const { fps } = useVideoConfig();
  const pages = useMemo(() => captions ? createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1050 }).pages : [], [captions]);
  if (!captions) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
      {pages.map((page) => {
        const from = Math.round((page.startMs / 1000) * fps);
        const until = from + Math.round((page.durationMs / 1000) * fps);
        if (until <= from) return null;
        return <Sequence key={`${page.startMs}`} from={from} durationInFrames={until - from}><CaptionPage page={page} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
