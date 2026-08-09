import type {Caption, TikTokPage} from "@remotion/captions";
import {createTikTokStyleCaptions} from "@remotion/captions";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";

const PAGE_MS = 1700;
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill
      style={{
        zIndex: 100,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 22,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1420,
          padding: "12px 26px 14px",
          border: "1px solid rgba(250,248,243,0.14)",
          borderRadius: 8,
          background: "rgba(16,19,17,0.92)",
          boxShadow: "7px 7px 0 rgba(255,96,56,0.22)",
          color: "#faf8f3",
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: 34,
          fontWeight: 600,
          lineHeight: 1.18,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          opacity: interpolate(frame, [0, 6], [0, 1], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {page.tokens.map((token) => {
          const active = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span
              key={`${token.fromMs}-${token.text}`}
              style={{color: active ? "#ff6038" : "#faf8f3"}}
            >
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
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender("Loading captions"));
  const {fps, durationInFrames: compositionDuration} = useVideoConfig();

  const load = useCallback(async () => {
    try {
      const response = await fetch(staticFile("assets/captions.json"));
      setCaptions((await response.json()) as Caption[]);
      continueRender(handle);
    } catch (error) {
      cancelRender(error);
    }
  }, [cancelRender, continueRender, handle]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(() => {
    if (!captions) return [];
    return createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: PAGE_MS}).pages;
  }, [captions]);

  if (!captions) return null;

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const next = pages[index + 1];
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = next
          ? Math.round((next.startMs / 1000) * fps)
          : compositionDuration;
        const durationInFrames = endFrame - startFrame;
        if (durationInFrames <= 0) return null;
        return (
          <Sequence key={`${page.startMs}-${index}`} from={startFrame} durationInFrames={durationInFrames}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
