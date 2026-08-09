import {createTikTokStyleCaptions, type Caption, type TikTokPage} from '@remotion/captions';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useEffect, useMemo, useState} from 'react';

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentMs = page.startMs + (frame / fps) * 1000;
  return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', padding: '0 230px 72px'}}><div style={{background: 'rgba(16,19,17,0.9)', border: '1px solid rgba(242,239,232,0.25)', boxShadow: '0 12px 36px rgba(0,0,0,0.3)', color: '#f2efe8', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 34, fontWeight: 700, lineHeight: 1.14, maxWidth: 1280, padding: '14px 22px', textAlign: 'center'}}>{page.tokens.map((token) => <span key={`${token.fromMs}-${token.text}`} style={{color: token.fromMs <= currentMs && token.toMs > currentMs ? '#ff6038' : '#f2efe8'}}>{token.text}</span>)}</div></AbsoluteFill>;
};

export const CaptionTrack: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const pages = useMemo(() => captions ? createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: 980}).pages : [], [captions]);
  useEffect(() => { fetch(staticFile('captions.json')).then((response) => response.json()).then((data: Caption[]) => setCaptions(data)); }, []);
  const {fps} = useVideoConfig();
  if (!captions) return null;
  return <AbsoluteFill style={{pointerEvents: 'none', zIndex: 30}}>{pages.map((page) => { const from = Math.round((page.startMs / 1000) * fps); const duration = Math.max(1, Math.round((page.durationMs / 1000) * fps)); return <Sequence key={page.startMs} from={from} durationInFrames={duration}><CaptionPage page={page} /></Sequence>; })}</AbsoluteFill>;
};
