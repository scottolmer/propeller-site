import {Audio} from '@remotion/media';
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {useEffect, useMemo, useState} from 'react';
import type {Caption} from '@remotion/captions';

const FPS = 30;
const DURATION = 9398;

const colors = {
  ink: '#101311',
  orange: '#ff6038',
  green: '#147d50',
  paper: '#f2efe8',
  line: '#d7d2c7',
  blue: '#345cff',
};

type ShotProps = {
  asset: string;
  y?: number;
  zoom?: number;
  tone?: 'paper' | 'ink';
  label?: string;
  panel?: 'wide' | 'mobile';
};

const fade = (frame: number, duration: number) =>
  interpolate(frame, [0, 14, duration - 16, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Kicker: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <div
    style={{
      color: dark ? '#ffe7de' : '#6b6d66',
      fontFamily: 'PlexMono, monospace',
      fontSize: 18,
      letterSpacing: 3.2,
      textTransform: 'uppercase',
      fontWeight: 500,
    }}
  >
    <span style={{color: colors.orange}}>—</span> {children}
  </div>
);

const Badge: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      alignSelf: 'flex-start',
      background: '#fff2ed',
      border: `1px solid ${colors.orange}`,
      color: '#9d321a',
      borderRadius: 999,
      padding: '9px 16px',
      fontFamily: 'PlexMono, monospace',
      fontSize: 15,
      letterSpacing: 1.4,
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

const ScreenshotPanel: React.FC<ShotProps> = ({
  asset,
  y = 0,
  zoom = 1,
  tone = 'paper',
  label,
  panel = 'wide',
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const width = panel === 'wide' ? 1120 : 395;
  const height = panel === 'wide' ? 660 : 760;
  const drift = interpolate(frame, [0, durationInFrames], [0, -22], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: panel === 'wide' ? 24 : 38,
        background: tone === 'ink' ? '#171a18' : '#ffffff',
        border: tone === 'ink' ? '1px solid rgba(255,255,255,.17)' : `1px solid ${colors.line}`,
        boxShadow: tone === 'ink' ? '0 28px 70px rgba(0,0,0,.38)' : '0 28px 56px rgba(22,22,17,.15)',
      }}
    >
      <Img
        src={staticFile(`assets/${asset}`)}
        style={{
          width: panel === 'wide' ? 1120 * zoom : 395 * zoom,
          height: 'auto',
          maxWidth: 'none',
          position: 'absolute',
          top: y + drift,
          left: panel === 'wide' ? (1120 - 1120 * zoom) / 2 : (395 - 395 * zoom) / 2,
        }}
      />
      {panel === 'mobile' ? (
        <>
          <div style={{position: 'absolute', top: 13, left: '50%', width: 116, height: 24, borderRadius: 99, background: '#0e100f', translate: '-50% 0'}} />
          <div style={{position: 'absolute', inset: 0, border: '8px solid #121513', borderRadius: 38, pointerEvents: 'none'}} />
        </>
      ) : null}
      {label ? (
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'rgba(16,19,17,.92)',
            color: '#f2efe8',
            fontFamily: 'PlexMono, monospace',
            fontSize: 13,
            letterSpacing: 1.2,
            padding: '8px 10px',
            borderRadius: 5,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

const ProductPair: React.FC<{
  desktop: string;
  mobile: string;
  desktopY?: number;
  desktopZoom?: number;
  mobileY?: number;
  mobileZoom?: number;
  historical?: boolean;
}> = ({desktop, mobile, desktopY, desktopZoom, mobileY, mobileZoom, historical}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 34, width: '100%', justifyContent: 'center'}}>
    <ScreenshotPanel
      asset={desktop}
      y={desktopY}
      zoom={desktopZoom}
      label={historical ? 'ILLUSTRATIVE HISTORICAL CAPTURE • JUL 2026' : undefined}
    />
    <ScreenshotPanel
      asset={mobile}
      y={mobileY}
      zoom={mobileZoom}
      panel="mobile"
      label={historical ? 'HISTORICAL' : undefined}
    />
  </div>
);

const EditorialScene: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark = false}) => (
  <AbsoluteFill
    style={{
      background: dark ? colors.ink : colors.paper,
      color: dark ? colors.paper : colors.ink,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: dark ? 0.14 : 0.32,
        backgroundImage:
          'linear-gradient(rgba(16,19,17,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(16,19,17,.12) 1px, transparent 1px)',
        backgroundSize: '42px 42px',
      }}
    />
    {children}
  </AbsoluteFill>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <EditorialScene>
      <div style={{position: 'absolute', left: 86, top: 70, opacity: fade(frame, durationInFrames)}}>
        <Kicker>AI research, not confident guessing</Kicker>
      </div>
      <div style={{position: 'absolute', left: 86, top: 165, width: 930, opacity: fade(frame, durationInFrames)}}>
        <div style={{fontFamily: 'Familjen, sans-serif', fontSize: 118, lineHeight: 0.91, letterSpacing: -5}}>
          Can ChatGPT
          <br />
          research <span style={{color: colors.orange}}>player props?</span>
        </div>
        <div style={{marginTop: 42, fontFamily: 'Plex, sans-serif', fontSize: 34, lineHeight: 1.25, maxWidth: 720, color: '#4c514b'}}>
          Yes—if it is used to ask better questions, not to pretend it knows today’s answer.
        </div>
      </div>
      <div style={{position: 'absolute', right: 82, bottom: 60, width: 490, opacity: interpolate(frame, [18, 55], [0, 1], {extrapolateRight: 'clamp'})}}>
        <ScreenshotPanel asset="prompt-builder-current.png" y={0} zoom={0.56} />
      </div>
      <div style={{position: 'absolute', left: 86, bottom: 68, display: 'flex', gap: 12}}>
        <Badge>LIVE RESEARCH WORKFLOW</Badge>
        <Badge>NO-ACTION IS VALID</Badge>
      </div>
    </EditorialScene>
  );
};

const PromptWorkflow: React.FC<{phase: 'question' | 'sources' | 'counter' | 'limit'}> = ({phase}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const copy = {
    question: ['Start with the exact question.', 'Sport. Player. Stat. Current line. Source. Research goal.', 'FORM THE QUESTION'],
    sources: ['Ask for current evidence.', 'Timestamp sources. Verify the exact line. Check official availability first.', 'VERIFY BEFORE YOU TRUST'],
    counter: ['Require the other side.', 'Counterarguments, missing data, direct sources—and a conclusion that can be “no action.”', 'STRESS-TEST THE ANSWER'],
    limit: ['A prompt cannot make stale data current.', 'It can make an AI ask better questions. You still verify the player, line, timestamps, and context.', 'THE LIMIT'],
  }[phase];
  const crop = {
    question: 0,
    sources: -1100,
    counter: -1495,
    limit: -2375,
  }[phase];
  return (
    <EditorialScene dark={phase === 'counter'}>
      <div style={{position: 'absolute', left: 82, top: 70, width: 510, opacity: fade(frame, durationInFrames)}}>
        <Kicker dark={phase === 'counter'}>{copy[2]}</Kicker>
        <div style={{marginTop: 32, fontFamily: 'Familjen, sans-serif', fontSize: 74, lineHeight: 0.98, letterSpacing: -2.5}}>{copy[0]}</div>
        <div style={{marginTop: 28, fontFamily: 'Plex, sans-serif', color: phase === 'counter' ? '#d9dbd5' : '#515650', fontSize: 29, lineHeight: 1.27}}>{copy[1]}</div>
        {phase === 'limit' ? <div style={{marginTop: 36}}><Badge>VERIFY • THEN DECIDE</Badge></div> : null}
      </div>
      <div style={{position: 'absolute', right: 70, top: 115, opacity: fade(frame, durationInFrames)}}>
        <ScreenshotPanel asset="prompt-builder-illustrative-current.png" y={crop} zoom={0.76} tone={phase === 'counter' ? 'ink' : 'paper'} />
      </div>
      {phase === 'sources' ? (
        <div style={{position: 'absolute', left: 82, bottom: 82, display: 'flex', gap: 13}}>
          {['CURRENT TIME', 'EXACT LINE', 'OFFICIAL STATUS'].map((item) => <Badge key={item}>{item}</Badge>)}
        </div>
      ) : null}
    </EditorialScene>
  );
};

const ProductScene: React.FC<{kind: 'line' | 'agents' | 'confidence' | 'close'}> = ({kind}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const copy = {
    line: ['Verify in the product.', 'Start with the player, stat, displayed direction, and exact line. A changed number is a new question.', 'THE LIVE QUESTION'],
    agents: ['Inspect the disagreement.', 'The agent breakdown lets you see support, conflict, and the driver that deserves more scrutiny.', 'NOT JUST ONE ANSWER'],
    confidence: ['Read confidence correctly.', '50–100 is directional signal strength for the displayed side—not a win probability or guarantee.', 'SIGNAL STRENGTH ≠ CERTAINTY'],
    close: ['Research. Verify. Pause or pass.', 'Build the prompt. Check current sources. Inspect the product context. Do not force an answer.', 'A BETTER WORKFLOW'],
  }[kind];
  return (
    <EditorialScene dark={kind === 'agents' || kind === 'confidence'}>
      <div style={{position: 'absolute', left: 80, top: 62, width: 580, opacity: fade(frame, durationInFrames), zIndex: 3}}>
        <Kicker dark={kind === 'agents' || kind === 'confidence'}>{copy[2]}</Kicker>
        <div style={{fontFamily: 'Familjen, sans-serif', fontSize: 67, lineHeight: 0.98, letterSpacing: -2, marginTop: 25}}>{copy[0]}</div>
        <div style={{fontFamily: 'Plex, sans-serif', fontSize: 27, lineHeight: 1.27, marginTop: 23, color: kind === 'agents' || kind === 'confidence' ? '#d9dbd5' : '#515650'}}>{copy[1]}</div>
      </div>
      <div style={{position: 'absolute', left: 64, bottom: 0, opacity: fade(frame, durationInFrames), zIndex: 2}}>
        {kind === 'line' ? <ProductPair desktop="historical-desktop-prop-detail.png" mobile="historical-mobile-prop-detail.png" desktopY={-72} desktopZoom={0.92} mobileY={-60} mobileZoom={1} historical /> : null}
        {kind === 'agents' ? <ProductPair desktop="historical-desktop-agents.png" mobile="historical-mobile-agents.png" desktopY={-220} desktopZoom={0.96} mobileY={-650} mobileZoom={1} historical /> : null}
        {kind === 'confidence' ? <ProductPair desktop="historical-desktop-prop-detail.png" mobile="historical-mobile-prop-detail.png" desktopY={-15} desktopZoom={1.15} mobileY={-8} mobileZoom={1.25} historical /> : null}
        {kind === 'close' ? <ProductPair desktop="public-analyzer-current.png" mobile="mobile-public-analyzer-current.png" desktopY={-115} desktopZoom={0.94} mobileY={-55} mobileZoom={1} /> : null}
      </div>
    </EditorialScene>
  );
};

type CaptionCue = {startMs: number; endMs: number; text: string};

const buildCaptionCues = (captions: Caption[]): CaptionCue[] => {
  const cues: CaptionCue[] = [];
  let words: Caption[] = [];
  const flush = () => {
    if (!words.length) return;
    cues.push({
      startMs: words[0].startMs,
      endMs: words[words.length - 1].endMs + 130,
      text: words.map((word) => word.text).join('').trim(),
    });
    words = [];
  };
  captions.forEach((word) => {
    words.push(word);
    const text = word.text.trim();
    const duration = word.endMs - words[0].startMs;
    if (words.length >= 10 || duration >= 2800 || (/[.!?]$/.test(text) && words.length >= 4) || (/[,:;]$/.test(text) && words.length >= 7)) flush();
  });
  flush();
  return cues;
};

const Captions: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  useEffect(() => {
    fetch(staticFile('assets/captions.json')).then((response) => response.json()).then(setCaptions);
  }, []);
  const cues = useMemo(() => (captions ? buildCaptionCues(captions) : []), [captions]);
  const frame = useCurrentFrame();
  const time = (frame / FPS) * 1000;
  const cue = cues.find((item) => item.startMs <= time && item.endMs >= time);
  if (!cue) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 66, display: 'flex', justifyContent: 'center', zIndex: 30, pointerEvents: 'none'}}>
      <div style={{maxWidth: 1200, textAlign: 'center', background: 'rgba(16,19,17,.92)', border: '1px solid rgba(242,239,232,.25)', borderRadius: 18, padding: '15px 26px 17px', color: colors.paper, fontFamily: 'Familjen, sans-serif', fontSize: 36, lineHeight: 1.05, letterSpacing: -.5}}>
        {cue.text}
      </div>
    </div>
  );
};

const BrandBug: React.FC = () => (
  <div style={{position: 'absolute', top: 35, right: 46, zIndex: 32, fontFamily: 'PlexMono, monospace', color: colors.orange, fontSize: 19, letterSpacing: 2.4, fontWeight: 500}}>
    PROPELLER PICKS
  </div>
);

export const PromptResearchVideo: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile('assets/narration.mp3')} />
    <Sequence durationInFrames={932}><HookScene /></Sequence>
    <Sequence from={932} durationInFrames={1370}><PromptWorkflow phase="question" /></Sequence>
    <Sequence from={2302} durationInFrames={1268}><PromptWorkflow phase="sources" /></Sequence>
    <Sequence from={3570} durationInFrames={2060}><PromptWorkflow phase="counter" /></Sequence>
    <Sequence from={5630} durationInFrames={1430}><PromptWorkflow phase="limit" /></Sequence>
    <Sequence from={7060} durationInFrames={352}><ProductScene kind="line" /></Sequence>
    <Sequence from={7412} durationInFrames={302}><ProductScene kind="agents" /></Sequence>
    <Sequence from={7714} durationInFrames={511}><ProductScene kind="confidence" /></Sequence>
    <Sequence from={8225} durationInFrames={1173}><ProductScene kind="close" /></Sequence>
    <BrandBug />
    <Captions />
  </AbsoluteFill>
);

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: colors.paper, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, opacity: .28, backgroundImage: 'linear-gradient(rgba(16,19,17,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(16,19,17,.13) 1px, transparent 1px)', backgroundSize: '42px 42px'}} />
    <div style={{position: 'absolute', left: 74, top: 72, width: 610}}>
      <Kicker>Player-prop research</Kicker>
      <div style={{fontFamily: 'Familjen, sans-serif', color: colors.ink, fontSize: 88, lineHeight: .9, letterSpacing: -3.5, marginTop: 28}}>Can ChatGPT<br />research <span style={{color: colors.orange}}>props?</span></div>
      <div style={{fontFamily: 'Plex, sans-serif', color: '#535750', fontSize: 34, marginTop: 34}}>Use a better prompt.<br />Verify the answer.</div>
    </div>
    <div style={{position: 'absolute', right: -92, top: 90, width: 610, height: 560, overflow: 'hidden', borderRadius: 26, border: `1px solid ${colors.line}`, boxShadow: '0 22px 48px rgba(20,20,15,.16)'}}>
      <Img src={staticFile('assets/prompt-builder-illustrative-current.png')} style={{width: 720, maxWidth: 'none', position: 'absolute', top: -145, left: -55}} />
    </div>
    <div style={{position: 'absolute', left: 74, bottom: 72, display: 'flex', gap: 12}}><Badge>CURRENT SOURCES</Badge><Badge>NO-ACTION IS VALID</Badge></div>
  </AbsoluteFill>
);

export const VideoComposition: React.FC = () => (
  <Composition id="ChatGPTPlayerPropResearch" component={PromptResearchVideo} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
