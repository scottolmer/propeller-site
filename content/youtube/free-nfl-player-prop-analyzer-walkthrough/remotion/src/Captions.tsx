import type {Caption, TikTokPage} from "@remotion/captions";
import {createTikTokStyleCaptions} from "@remotion/captions";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {AbsoluteFill, Sequence, staticFile, useDelayRender, useVideoConfig} from "remotion";

const PAGE_MS = 3200;

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => (
  <AbsoluteFill style={{zIndex: 100, justifyContent: "flex-end", alignItems: "center", paddingBottom: 25, pointerEvents: "none"}}>
    <div style={{maxWidth: 1420, padding: "13px 28px 15px", borderRadius: 10, background: "rgba(13,15,20,.92)", boxShadow: "0 10px 36px rgba(0,0,0,.22)", color: "#fff", fontFamily: "IBM Plex Sans", fontSize: 32, fontWeight: 600, lineHeight: 1.18, textAlign: "center", whiteSpace: "pre-wrap"}}>
      {page.tokens.map((token) => token.text).join("")}
    </div>
  </AbsoluteFill>
);

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
