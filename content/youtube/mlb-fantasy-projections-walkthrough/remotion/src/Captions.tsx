import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import { colors } from "./data";

const SWITCH_MS = 1650;

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 58 }}>
      <div
        style={{
          maxWidth: 1480,
          padding: "15px 28px 17px",
          borderRadius: 10,
          background: "rgba(16, 19, 17, 0.9)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "white",
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: 39,
          lineHeight: 1.22,
          fontWeight: 650,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          boxShadow: "0 14px 44px rgba(0,0,0,0.25)",
        }}
      >
        {page.tokens.map((token) => {
          const active = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span key={`${token.fromMs}-${token.text}`} style={{ color: active ? colors.lime : "white" }}>
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading aligned captions"));
  const { fps } = useVideoConfig();

  const load = useCallback(async () => {
    try {
      const response = await fetch(staticFile("captions/captions.json"));
      const parsed = (await response.json()) as Caption[];
      setCaptions(parsed);
      continueRender(handle);
    } catch (error) {
      cancelRender(error);
    }
  }, [cancelRender, continueRender, handle]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(
    () =>
      captions
        ? createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: SWITCH_MS }).pages
        : [],
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const next = pages[index + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const until = Math.round(((next?.startMs ?? page.startMs + SWITCH_MS) / 1000) * fps);
        return (
          <Sequence key={`${page.startMs}-${index}`} from={from} durationInFrames={Math.max(1, until - from)}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
