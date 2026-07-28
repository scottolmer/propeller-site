import {Audio} from '@remotion/media';
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {CaptionTrack} from './Captions';

const FPS = 30;
const DURATION = 15429;
const DARK = '#101311';
const ORANGE = '#ff6038';
const PAPER = '#f2efe8';

type Visual =
  | 'analyzer'
  | 'detail'
  | 'agents'
  | 'agentmap'
  | 'confidence'
  | 'workflow'
  | 'fantasy'
  | 'range'
  | 'results'
  | 'record'
  | 'closing';

type Beat = {
  from: number;
  until: number;
  visual: Visual;
  label: string;
  title: string;
  body: string;
};

// Derived from the finished word-level narration alignment, not estimated script length.
const beats: Beat[] = [
  {from: 0, until: 469, visual: 'analyzer', label: 'Start with the question', title: 'What exact line is the model analyzing?', body: 'Line, evidence, freshness, and limits belong in the same decision.'},
  {from: 470, until: 1109, visual: 'analyzer', label: 'What Propeller is', title: 'A research workspace—not a sportsbook.', body: 'Built for inspecting a player, stat, direction, and line on web and mobile.'},
  {from: 1110, until: 1829, visual: 'workflow', label: 'Two distinct jobs', title: 'Player props and fantasy projections answer different questions.', body: 'Direction for an exact prop line. A range for an eligible fantasy player.'},
  {from: 1830, until: 2582, visual: 'detail', label: 'Exact line first', title: 'A changed line is a changed research question.', body: 'Confirm player, stat, direction, and displayed line before interpreting the read.'},
  {from: 2583, until: 3359, visual: 'agentmap', label: 'Technical agents', title: 'Agents are separate sport-specific analysis signals.', body: 'They are not a generic chatbot or equal-weight poll.'},
  {from: 3360, until: 4837, visual: 'agents', label: 'Basketball context', title: 'Minutes. Usage. Pace. Injury. Matchup.', body: 'Different evidence channels contribute when usable for the prop.'},
  {from: 4838, until: 5501, visual: 'agentmap', label: 'Market context', title: 'No-vig disagreement is a research question—not automatic value.', body: 'Compare market context after the bookmaker margin is removed.'},
  {from: 5502, until: 6246, visual: 'agentmap', label: 'Sport changes the mix', title: 'Baseball and football require different context.', body: 'Park, handedness, role, opportunity, matchup, and game environment can matter.'},
  {from: 6247, until: 7072, visual: 'agentmap', label: 'Calibrated inputs', title: 'There is no universal agent count or fixed set of weights.', body: 'Available signals can vary by sport, prop, model version, and production calibration.'},
  {from: 7073, until: 7819, visual: 'agents', label: 'Inspect the breakdown', title: 'Support, pushback, and disagreement are all useful.', body: 'A missing signal is a limitation to disclose—not a silent neutral vote.'},
  {from: 7820, until: 8702, visual: 'confidence', label: 'Read confidence correctly', title: 'Direction first. Then directional support for that exact line.', body: '72 is not 72 percent probability, a guarantee, or a profit promise.'},
  {from: 8703, until: 9365, visual: 'workflow', label: 'Research workflow', title: 'Line → direction + confidence → agents → freshness → research or pass.', body: 'Passing is a valid answer when the evidence is not strong enough.'},
  {from: 9366, until: 10623, visual: 'fantasy', label: 'Fantasy projections', title: 'Current public fantasy: MLB hitters under DraftKings MLB scoring.', body: 'Floor, central point projection, and ceiling—not an Over or Under.'},
  {from: 10624, until: 11746, visual: 'range', label: 'How the fantasy range is built', title: 'Current market components + recent form + outcome variation.', body: 'The point estimate anchors a widened lower and upper range.'},
  {from: 11747, until: 12283, visual: 'fantasy', label: 'Fantasy limitations', title: 'Floor and ceiling are scenarios, not hard limits.', body: 'The public feature does not include pitchers, other sports, salary or lineup optimization, entries, or guarantees.'},
  {from: 12284, until: 12938, visual: 'fantasy', label: 'Freshness matters', title: 'Know whether a board is current, latest available, or unavailable.', body: 'Late lineup news can still change the research picture.'},
  {from: 12939, until: 13761, visual: 'results', label: 'Public record', title: 'Historical results should be inspectable—not accepted on faith.', body: 'Wins, losses, pushes, sport splits, and confidence ranges are exposed in the archive.'},
  {from: 13762, until: 14427, visual: 'record', label: 'Use the right unit', title: '2.18M raw rows and a 293K public ledger need context.', body: 'Historical archive outcomes are descriptive, not a uniquely published forward-test or ROI claim.'},
  {from: 14428, until: 15014, visual: 'record', label: 'Forward record standard', title: 'Pre-event publication. Exact side and line. Named price. Exact settlement.', body: 'That is the standard needed to speak responsibly about ROI.'},
  {from: 15015, until: DURATION, visual: 'closing', label: 'Use it responsibly', title: 'Make the research clearer. Keep the decision yours.', body: 'Start free at PropellerPicks.com/Analyzer.'},
];

const easing = Easing.bezier(0.16, 1, 0.3, 1);

const BrandMark: React.FC = () => (
  <div style={{alignItems: 'center', display: 'flex', gap: 12}}>
    <svg width="34" height="32" viewBox="0 0 34 32" aria-label="Propeller Picks">
      <path d="M17 3v12M17 15 6 23M17 15l11 8" fill="none" stroke={ORANGE} strokeLinecap="round" strokeWidth="5" />
      <circle cx="17" cy="15" fill={ORANGE} r="4" />
    </svg>
    <span style={{color: DARK, fontFamily: 'Familjen Grotesk, sans-serif', fontSize: 27, fontWeight: 800, letterSpacing: -0.8}}>Propeller</span>
  </div>
);

const Label: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark = false}) => (
  <div style={{background: dark ? 'rgba(16,19,17,0.9)' : 'rgba(242,239,232,0.94)', border: `1px solid ${dark ? 'rgba(242,239,232,0.3)' : 'rgba(16,19,17,0.2)'}`, color: dark ? PAPER : DARK, fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, fontWeight: 700, letterSpacing: 1.3, padding: '12px 16px', textTransform: 'uppercase', width: 'fit-content'}}>{children}</div>
);

const Historic: React.FC<{date?: string}> = ({date = 'JULY 2026'}) => (
  <div style={{background: 'rgba(16,19,17,0.92)', borderLeft: `5px solid ${ORANGE}`, color: PAPER, fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 700, letterSpacing: 1, padding: '10px 13px', position: 'absolute', right: 36, top: 32, zIndex: 5}}>ILLUSTRATIVE HISTORICAL CAPTURE · {date}</div>
);

const HeroText: React.FC<{beat: Beat; dark?: boolean}> = ({beat, dark = false}) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 22], [34, 0], {easing, extrapolateRight: 'clamp'});
  return <div style={{color: dark ? PAPER : DARK, maxWidth: 820, opacity: interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'}), translate: `0 ${y}px`}}>
    <Label dark={dark}>{beat.label}</Label>
    <div style={{fontFamily: 'Familjen Grotesk, sans-serif', fontSize: 78, fontWeight: 800, letterSpacing: -2.8, lineHeight: 0.94, marginTop: 28}}>{beat.title}</div>
    <div style={{borderLeft: `5px solid ${ORANGE}`, fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 30, lineHeight: 1.25, marginTop: 30, paddingLeft: 20}}>{beat.body}</div>
  </div>;
};

const ImageBackdrop: React.FC<{src: string; dark?: boolean; historical?: boolean; date?: string; focus?: string}> = ({src, dark = true, historical, date, focus = 'center'}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: DARK, overflow: 'hidden'}}>
    <Img src={staticFile(src)} style={{height: '100%', objectFit: 'cover', objectPosition: focus, scale: interpolate(frame, [0, 700], [1.025, 1.11], {extrapolateRight: 'clamp'}), width: '100%'}} />
    {dark ? <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(16,19,17,0.97) 0%, rgba(16,19,17,0.72) 45%, rgba(16,19,17,0.12) 100%)'}} /> : null}
    {historical ? <Historic date={date} /> : null}
  </AbsoluteFill>;
};

const AgentMap: React.FC<{beat: Beat}> = ({beat}) => {
  const frame = useCurrentFrame();
  const names = beat.label === 'Basketball context' ? ['MINUTES', 'USAGE', 'PACE', 'INJURY', 'MATCHUP'] : beat.label === 'Market context' ? ['NO-VIG', 'MARKET LINE', 'BOOK MARGIN', 'DISAGREEMENT'] : beat.label === 'Sport changes the mix' ? ['MLB · PARK', 'MLB · HANDEDNESS', 'NFL · OPPORTUNITY', 'NFL · ENVIRONMENT'] : ['SPORT', 'PROP', 'MODEL VERSION', 'AVAILABLE SIGNALS'];
  return <AbsoluteFill style={{background: PAPER, overflow: 'hidden', padding: '86px 110px'}}>
    <BrandMark />
    <div style={{marginTop: 66}}><HeroText beat={beat} /></div>
    <div style={{bottom: 95, display: 'grid', gap: 18, gridTemplateColumns: 'repeat(2, 1fr)', position: 'absolute', right: 110, width: 870}}>
      {names.map((name, index) => <div key={name} style={{background: index === 0 ? DARK : '#fff', border: `2px solid ${index === 0 ? DARK : '#d9d5ca'}`, color: index === 0 ? PAPER : DARK, fontFamily: 'IBM Plex Mono, monospace', fontSize: 25, fontWeight: 700, opacity: interpolate(frame, [index * 8, index * 8 + 18], [0, 1], {extrapolateRight: 'clamp'}), padding: '28px 26px', scale: interpolate(frame, [index * 8, index * 8 + 18], [0.92, 1], {extrapolateRight: 'clamp'})}}>{name}</div>)}
    </div>
  </AbsoluteFill>;
};

const Workflow: React.FC<{beat: Beat}> = ({beat}) => {
  const frame = useCurrentFrame();
  const isTwoJobs = beat.label === 'Two distinct jobs';
  const items = isTwoJobs ? ['PLAYER · STAT · LINE', 'DIRECTION + CONFIDENCE', 'FLOOR · POINT · CEILING'] : ['CURRENT LINE', 'DIRECTION + CONFIDENCE', 'AGENT BREAKDOWN', 'FRESHNESS', 'RESEARCH OR PASS'];
  return <AbsoluteFill style={{background: DARK, overflow: 'hidden', padding: '84px 108px'}}>
    <div style={{left: 108, position: 'absolute', top: 84}}><HeroText beat={beat} dark /></div>
    <div style={{bottom: 120, display: 'flex', gap: 16, left: 108, position: 'absolute', right: 108}}>
      {items.map((item, index) => <div key={item} style={{alignItems: 'center', background: index === 0 ? ORANGE : '#1d241f', color: index === 0 ? DARK : PAPER, display: 'flex', flex: 1, fontFamily: 'IBM Plex Mono, monospace', fontSize: 23, fontWeight: 700, justifyContent: 'center', minHeight: 128, opacity: interpolate(frame, [index * 8, index * 8 + 16], [0, 1], {extrapolateRight: 'clamp'}), padding: '20px', textAlign: 'center'}}>{item}</div>)}
    </div>
  </AbsoluteFill>;
};

const AgentBreakdown: React.FC<{beat: Beat}> = ({beat}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    <div style={{left: 100, position: 'absolute', top: 72, zIndex: 4}}><HeroText beat={beat} /></div>
    <div style={{bottom: 70, display: 'grid', gap: 24, gridTemplateColumns: '1.2fr 0.7fr', left: 100, position: 'absolute', right: 100, top: 350}}>
      <div style={{background: DARK, overflow: 'hidden', position: 'relative', scale: interpolate(frame, [0, 24], [0.97, 1], {easing, extrapolateRight: 'clamp'})}}><Img src={staticFile('desktop-agent-rows.png')} style={{height: '100%', objectFit: 'cover', width: '100%'}} /><Historic /><div style={{background: 'rgba(16,19,17,0.9)', bottom: 16, color: PAPER, fontFamily: 'IBM Plex Mono, monospace', fontSize: 18, fontWeight: 700, left: 16, padding: '10px 12px', position: 'absolute'}}>DESKTOP · AGENT ROWS (ZOOMED)</div></div>
      <div style={{background: '#111', overflow: 'hidden', position: 'relative', scale: interpolate(frame, [10, 34], [0.97, 1], {easing, extrapolateRight: 'clamp'})}}><Img src={staticFile('mobile-agent-rows.png')} style={{height: '100%', objectFit: 'cover', objectPosition: 'center 76%', width: '100%'}} /><Historic /><div style={{background: 'rgba(16,19,17,0.92)', bottom: 16, color: PAPER, fontFamily: 'IBM Plex Mono, monospace', fontSize: 17, fontWeight: 700, left: 16, padding: '10px 12px', position: 'absolute'}}>MOBILE · AGENT SECTION + ROW</div></div>
    </div>
  </AbsoluteFill>;
};

const Confidence: React.FC<{beat: Beat}> = ({beat}) => <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
  <ImageBackdrop src="desktop-detail-jul.png" dark={false} historical focus="56% 17%" />
  <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(242,239,232,0.97) 0%, rgba(242,239,232,0.80) 48%, rgba(242,239,232,0.10) 100%)', padding: '105px 110px'}}><HeroText beat={beat} /><div style={{background: DARK, bottom: 90, color: PAPER, fontFamily: 'IBM Plex Mono, monospace', fontSize: 26, left: 110, maxWidth: 790, padding: '23px 26px', position: 'absolute'}}>CONFIDENCE = DIRECTIONAL SUPPORT · NOT A WIN PROBABILITY</div></AbsoluteFill>
</AbsoluteFill>;

const Fantasy: React.FC<{beat: Beat}> = ({beat}) => <AbsoluteFill style={{background: DARK, overflow: 'hidden'}}>
  <ImageBackdrop src="fantasy-desktop-jul18.png" historical focus="58% 38%" />
  <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(16,19,17,0.96) 0%, rgba(16,19,17,0.72) 48%, rgba(16,19,17,0.10) 100%)', padding: '98px 110px'}}><HeroText beat={beat} dark /></AbsoluteFill>
  <div style={{background: DARK, bottom: 58, boxShadow: '0 32px 70px rgba(0,0,0,0.48)', overflow: 'hidden', position: 'absolute', right: 120, width: 264}}><Img src={staticFile('fantasy-mobile-jul18.png')} style={{display: 'block', width: '100%'}} /><div style={{background: 'rgba(16,19,17,0.92)', color: PAPER, fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 700, padding: '10px 12px'}}>MOBILE · HISTORICAL</div></div>
</AbsoluteFill>;

const Range: React.FC<{beat: Beat}> = ({beat}) => { const frame = useCurrentFrame(); return <AbsoluteFill style={{background: PAPER, overflow: 'hidden', padding: '82px 110px'}}>
  <BrandMark /><div style={{marginTop: 58}}><HeroText beat={beat} /></div>
  <div style={{bottom: 132, left: 150, position: 'absolute', right: 150}}><div style={{alignItems: 'center', display: 'flex', justifyContent: 'space-between'}}>{['P20 · FLOOR', 'EST · POINT', 'P80 · CEILING'].map((x, i) => <div key={x} style={{color: i === 1 ? ORANGE : DARK, fontFamily: 'IBM Plex Mono, monospace', fontSize: 25, fontWeight: 700}}>{x}</div>)}</div><div style={{background: '#dad6ca', height: 12, marginTop: 24, position: 'relative'}}><div style={{background: ORANGE, height: 12, left: '16%', position: 'absolute', right: '16%'}} /><div style={{background: '#c5f05a', border: `3px solid ${DARK}`, height: 28, left: `${interpolate(frame, [0, 180], [41, 59], {extrapolateRight: 'clamp'})}%`, position: 'absolute', top: -8, width: 28}} /></div><div style={{color: '#5c635e', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 26, marginTop: 28, textAlign: 'center'}}>Ranges describe scenarios around the estimate. Outcomes can still finish outside them.</div></div>
</AbsoluteFill>};

const Results: React.FC<{beat: Beat}> = ({beat}) => <AbsoluteFill style={{background: DARK, color: PAPER, overflow: 'hidden', padding: '86px 110px'}}>
  <div style={{color: PAPER, left: 110, position: 'absolute', top: 86}}><Label dark>{beat.label}</Label><div style={{fontFamily: 'Familjen Grotesk, sans-serif', fontSize: 72, fontWeight: 800, letterSpacing: -2.5, lineHeight: 0.96, marginTop: 26, maxWidth: 1040}}>{beat.title}</div><div style={{borderLeft: `5px solid ${ORANGE}`, fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 30, lineHeight: 1.25, marginTop: 28, maxWidth: 850, paddingLeft: 20}}>{beat.body}</div></div>
  <div style={{bottom: 102, display: 'grid', gap: 18, gridTemplateColumns: 'repeat(4, 1fr)', left: 110, position: 'absolute', right: 110}}>{['WINS', 'LOSSES', 'PUSHES', 'SPLITS + RANGES'].map((x, i) => <div key={x} style={{background: i === 0 ? ORANGE : '#1f2821', color: i === 0 ? DARK : PAPER, fontFamily: 'IBM Plex Mono, monospace', fontSize: 22, fontWeight: 700, padding: '33px 24px', textAlign: 'center'}}>{x}</div>)}</div>
</AbsoluteFill>;

const Record: React.FC<{beat: Beat}> = ({beat}) => <AbsoluteFill style={{background: PAPER, overflow: 'hidden', padding: '92px 110px'}}>
  <BrandMark /><div style={{marginTop: 60}}><HeroText beat={beat} /></div>
  <div style={{bottom: 100, display: 'grid', gap: 18, gridTemplateColumns: '1fr 1fr', position: 'absolute', right: 110, width: 800}}><div style={{background: DARK, color: PAPER, fontFamily: 'Familjen Grotesk, sans-serif', fontSize: 55, fontWeight: 800, letterSpacing: -2, lineHeight: 0.95, padding: '42px 38px'}}>2.18M<div style={{color: ORANGE, fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, letterSpacing: 1.1, marginTop: 18}}>RAW GRADED ROWS</div></div><div style={{background: '#fff', border: `2px solid ${DARK}`, color: DARK, fontFamily: 'Familjen Grotesk, sans-serif', fontSize: 55, fontWeight: 800, letterSpacing: -2, lineHeight: 0.95, padding: '42px 38px'}}>293K<div style={{color: ORANGE, fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, letterSpacing: 1.1, marginTop: 18}}>PUBLIC LEDGER</div></div></div>
</AbsoluteFill>;

const Closing: React.FC<{beat: Beat}> = ({beat}) => <AbsoluteFill style={{background: DARK, overflow: 'hidden'}}><ImageBackdrop src="analyzer-jul21.png" dark focus="center 35%" /><AbsoluteFill style={{padding: '112px 110px'}}><HeroText beat={beat} dark /><div style={{bottom: 96, color: ORANGE, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fontWeight: 700, left: 110, position: 'absolute'}}>PROPELLERPICKS.COM/ANALYZER</div></AbsoluteFill></AbsoluteFill>;

const RenderBeat: React.FC<{beat: Beat}> = ({beat}) => {
  if (beat.visual === 'analyzer') return <AbsoluteFill><ImageBackdrop src="analyzer-jul21.png" historical date="JULY 21, 2026" focus="center 36%" /><AbsoluteFill style={{padding: '105px 110px'}}><HeroText beat={beat} dark /></AbsoluteFill></AbsoluteFill>;
  if (beat.visual === 'detail') return <AbsoluteFill><ImageBackdrop src="desktop-detail-jul.png" historical focus="58% 17%" /><AbsoluteFill style={{padding: '98px 110px'}}><HeroText beat={beat} dark /></AbsoluteFill></AbsoluteFill>;
  if (beat.visual === 'agents') return <AgentBreakdown beat={beat} />;
  if (beat.visual === 'agentmap') return <AgentMap beat={beat} />;
  if (beat.visual === 'confidence') return <Confidence beat={beat} />;
  if (beat.visual === 'workflow') return <Workflow beat={beat} />;
  if (beat.visual === 'fantasy') return <Fantasy beat={beat} />;
  if (beat.visual === 'range') return <Range beat={beat} />;
  if (beat.visual === 'results') return <Results beat={beat} />;
  if (beat.visual === 'record') return <Record beat={beat} />;
  return <Closing beat={beat} />;
};

const IntroComposition: React.FC = () => <AbsoluteFill style={{background: DARK}}>{beats.map((beat) => <Sequence key={`${beat.from}-${beat.label}`} from={beat.from} durationInFrames={beat.until - beat.from}><RenderBeat beat={beat} /></Sequence>)}<Audio src={staticFile('narration.mp3')} /><CaptionTrack /></AbsoluteFill>;

const Thumbnail: React.FC = () => <AbsoluteFill style={{background: DARK, overflow: 'hidden'}}>
  <Img src={staticFile('desktop-agents-jul.png')} style={{height: '100%', objectFit: 'cover', objectPosition: '55% 67%', scale: 1.12, width: '100%'}} />
  <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(16,19,17,0.98) 0%, rgba(16,19,17,0.84) 52%, rgba(16,19,17,0.10) 100%)'}} />
  <div style={{left: 70, position: 'absolute', top: 62}}><BrandMark /></div>
  <div style={{color: PAPER, left: 70, position: 'absolute', top: 155, width: 720}}><div style={{color: ORANGE, fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, fontWeight: 700, letterSpacing: 1.3}}>PROPELLER PICKS EXPLAINED</div><div style={{fontFamily: 'Familjen Grotesk, sans-serif', fontSize: 106, fontWeight: 800, letterSpacing: -4, lineHeight: 0.86, marginTop: 20}}>WHAT DO THE<br />AGENTS SEE?</div><div style={{background: ORANGE, color: DARK, fontFamily: 'IBM Plex Mono, monospace', fontSize: 25, fontWeight: 700, marginTop: 28, padding: '14px 18px', width: 'fit-content'}}>HOW PROP RESEARCH WORKS</div></div>
  <div style={{background: 'rgba(16,19,17,0.92)', bottom: 28, color: PAPER, fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 700, padding: '10px 13px', position: 'absolute', right: 28}}>ILLUSTRATIVE HISTORICAL CAPTURE · JULY 2026</div>
</AbsoluteFill>;

export const PropellerChannelIntroduction: React.FC = () => <><Composition id="PropellerChannelIntroduction" component={IntroComposition} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} /><Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} /></>;
