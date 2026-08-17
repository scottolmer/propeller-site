import type {Caption, TikTokPage} from "@remotion/captions";
import {createTikTokStyleCaptions} from "@remotion/captions";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useDelayRender, useVideoConfig} from "remotion";
import {sansFont} from "./fonts";

const PAGE_MS = 2700;

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill style={{zIndex: 100, justifyContent: "flex-end", alignItems: "center", paddingBottom: 26, pointerEvents: "none"}}>
      <div style={{maxWidth: 1360, padding: "13px 25px 15px", borderRadius: 10, background: "rgba(16,19,17,.94)", boxShadow: "0 12px 44px rgba(0,0,0,.28)", color: "#f2efe8", fontFamily: sansFont, fontSize: 32, fontWeight: 600, lineHeight: 1.18, textAlign: "center", whiteSpace: "pre-wrap", border: "1px solid rgba(242,239,232,.16)"}}>
        {page.tokens.map((token) => (
          <span key={`${token.fromMs}-${token.text}`} style={{color: token.fromMs <= nowMs && token.toMs > nowMs ? "#ff8a65" : "#f2efe8"}}>{token.text}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender("Loading captions"));
  const {fps, durationInFrames} = useVideoConfig();
  const load = useCallback(async () => {
    try {
      const response = await fetch(staticFile("assets/captions.json"));
      setCaptions((await response.json()) as Caption[]);
      continueRender(handle);
    } catch (error) {
      cancelRender(error);
    }
  }, [cancelRender, continueRender, handle]);
  useEffect(() => { void load(); }, [load]);
  const pages = useMemo(() => captions ? createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: PAGE_MS}).pages : [], [captions]);
  if (!captions) return null;
  return <AbsoluteFill>{pages.map((page, index) => {
    const next = pages[index + 1];
    const from = Math.round(page.startMs / 1000 * fps);
    const to = next ? Math.round(next.startMs / 1000 * fps) : durationInFrames;
    return <Sequence key={`${page.startMs}-${index}`} from={from} durationInFrames={Math.max(1, to - from)}><CaptionPage page={page}/></Sequence>;
  })}</AbsoluteFill>;
};
