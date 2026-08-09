import {Audio} from '@remotion/media';
import type {Caption} from '@remotion/captions';
import captionsJson from './captions.json';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const captions = captionsJson as Caption[];
const FPS = 30;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

type CaptionCue = {text: string; startMs: number; endMs: number};

const captionCues: CaptionCue[] = (() => {
  const cues: CaptionCue[] = [];
  let words: Caption[] = [];
  const flush = () => {
    if (words.length === 0) return;
    const first = words[0];
    const last = words[words.length - 1];
    cues.push({text: words.map((word) => word.text).join('').trim(), startMs: first.startMs, endMs: last.endMs});
    words = [];
  };
  captions.forEach((word, index) => {
    words.push(word);
    const next = captions[index + 1];
    const currentDuration = word.endMs - words[0].startMs;
    const pauseAfter = next ? next.startMs - word.endMs : 0;
    const sentenceEnd = /[.!?]$/.test(word.text.trim());
    if (
      words.length >= 11 ||
      currentDuration >= 4300 ||
      pauseAfter >= 350 ||
      (sentenceEnd && words.length >= 4)
    ) flush();
  });
  flush();
  return cues;
})();

const BrandMark: React.FC = () => (
  <div className="brand-mark" aria-label="Propeller Picks">
    <i /><i /><i />
  </div>
);

const Grain: React.FC = () => <><div className="grid" /><div className="grain" /></>;

const Scene: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [from, from + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}),
    interpolate(frame, [to - 10, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}),
  );
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

const Eyebrow: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div className="eyebrow"><span />{children}</div>
);

const Historical: React.FC = () => <div className="historical">ILLUSTRATIVE PRODUCT CAPTURE · JUL 2026</div>;

const ProductShot: React.FC<{
  src: string;
  className?: string;
  position?: string;
  origin?: string;
  scale?: number;
  label?: string;
}> = ({src, className = '', position = 'center', origin = 'center', scale = 1.04, label}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame % 210, [0, 210], [0, 0.035], {extrapolateRight: 'clamp'});
  return (
    <div className={`shot ${className}`}>
      <Img src={staticFile(src)} className="shot-img" style={{objectPosition: position, transformOrigin: origin, scale: scale + drift}} />
      {label ? <div className="shot-label">{label}</div> : null}
      <Historical />
    </div>
  );
};

const CaptionOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const now = (frame / FPS) * 1000;
  const cue = captionCues.find((item) => item.startMs <= now && item.endMs >= now);
  if (!cue) return null;
  const fade = Math.min(
    interpolate(now, [cue.startMs, cue.startMs + 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    interpolate(now, [cue.endMs - 120, cue.endMs], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  return <div className="caption" style={{opacity: fade}}>{cue.text}</div>;
};

const Signal: React.FC<{label: string; x: number; y: number; delay: number}> = ({label, x, y, delay}) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return <div className="signal" style={{left: x, top: y, opacity: show, scale: 0.88 + show * 0.12}}>{label}</div>;
};

export const PropellerSocialLaunch: React.FC = () => {
  return (
    <AbsoluteFill className="film">
      <Audio src={staticFile('narration.mp3')} />
      <Grain />

      <Scene from={0} to={300}>
        <div className="scene hook">
          <div className="hook-orb" />
          <Eyebrow>SPORTS RESEARCH, REBUILT</Eyebrow>
          <div className="hook-title">LESS<br /><em>NOISE.</em></div>
          <div className="hook-sub">MORE CONTEXT.</div>
          <ProductShot src="analyzer-jul21.png" className="hook-shot" position="62% 48%" scale={1.2} />
          <div className="noise-words"><b>TABS</b><b>TAKES</b><b>NOISE</b></div>
        </div>
      </Scene>

      <Scene from={285} to={510}>
        <div className="scene intro">
          <div className="top-brand"><BrandMark /><span>PROPELLER<br /><em>PICKS</em></span></div>
          <Eyebrow>THE CLEARER WAY IN</Eyebrow>
          <div className="display">YOUR RESEARCH.<br /><em>IN ONE PLACE.</em></div>
          <div className="device-pair intro-devices">
            <ProductShot src="analyzer-jul21.png" className="desktop-card" position="58% 46%" label="WEB" />
            <ProductShot src="mobile-detail-jul.png" className="mobile-card" position="50% 20%" origin="center top" scale={1.05} label="MOBILE" />
          </div>
        </div>
      </Scene>

      <Scene from={495} to={690}>
        <div className="scene line-scene">
          <Eyebrow>START WITH THE QUESTION</Eyebrow>
          <div className="display compact">A PLAYER.<br />A LINE.<br /><em>THE WHY.</em></div>
          <ProductShot src="analyzer-jul21.png" className="line-desktop" position="52% 48%" scale={1.32} label="PLAYER · STAT · LINE" />
          <ProductShot src="mobile-detail-jul.png" className="line-mobile" position="50% 18%" origin="center top" scale={1.22} label="PLAYER + LINE" />
        </div>
      </Scene>

      <Scene from={675} to={1050}>
        <div className="scene access-scene">
          <Eyebrow>WHERE + WHEN</Eyebrow>
          <div className="display medium">START FREE.<br /><em>GO DEEPER.</em></div>
          <div className="access-rail"><span>WEB ANALYZER</span><i /><span>MOBILE WORKSPACE</span></div>
          <ProductShot src="analyzer-jul21.png" className="access-desktop" position="50% 47%" scale={1.12} />
          <ProductShot src="mobile-detail-jul.png" className="access-mobile" position="50% 18%" origin="center top" scale={1.05} />
          <div className="moment-list"><b>BEFORE THE SLATE</b><b>WHEN NEWS CHANGES</b><b>SECOND LOOK</b></div>
        </div>
      </Scene>

      <Scene from={1035} to={1350}>
        <div className="scene signals-scene">
          <Eyebrow>SPORT-SPECIFIC SIGNALS</Eyebrow>
          <div className="display medium">THE CONTEXT<br /><em>BEHIND THE CARD.</em></div>
          <div className="signal-cloud">
            <Signal label="ROLE" x={10} y={70} delay={1050} />
            <Signal label="MATCHUP" x={315} y={15} delay={1065} />
            <Signal label="RECENT FORM" x={580} y={105} delay={1080} />
            <Signal label="ENVIRONMENT" x={65} y={320} delay={1095} />
            <Signal label="INJURIES" x={350} y={400} delay={1110} />
            <Signal label="MARKET CONTEXT" x={585} y={305} delay={1125} />
          </div>
          <ProductShot src="desktop-agents-jul.png" className="signals-shot" position="50% 55%" scale={1.2} />
        </div>
      </Scene>

      <Scene from={1335} to={1680}>
        <div className="scene confidence-scene">
          <Eyebrow>DIRECTIONAL CONTEXT</Eyebrow>
          <div className="display medium">CONFIDENCE<br /><em>NOT CERTAINTY.</em></div>
          <div className="confidence-note">HOW STRONGLY AVAILABLE SIGNALS SUPPORT MORE OR LESS</div>
          <div className="confidence-ring"><b>50—100</b><span>SIGNAL STRENGTH</span></div>
          <div className="confidence-product"><ProductShot src="desktop-detail-jul.png" className="confidence-desktop" position="50% 34%" scale={1.45} label="CONFIDENCE + DIRECTION" /><ProductShot src="mobile-detail-jul.png" className="confidence-mobile" position="82% 16%" origin="right top" scale={1.24} label="MOBILE CONFIDENCE" /></div>
          <div className="guarantee">CONTEXT · NOT A GUARANTEE</div>
        </div>
      </Scene>

      <Scene from={1665} to={1920}>
        <div className="scene breakdown-scene">
          <Eyebrow>DON'T JUST TAKE A NUMBER</Eyebrow>
          <div className="display medium">OPEN THE<br /><em>BREAKDOWN.</em></div>
          <div className="breakdown-copy">INSPECT THE LINE.<br />THE DIRECTION.<br />THE SIGNALS.</div>
          <ProductShot src="desktop-agent-rows.png" className="breakdown-desktop" position="50% 62%" scale={1.05} label="MODEL BREAKDOWN" />
          <ProductShot src="mobile-agent-breakdown-crop.png" className="breakdown-mobile" scale={1.03} label="MOBILE AGENT BREAKDOWN" />
        </div>
      </Scene>

      <Scene from={1905} to={2100}>
        <div className="scene fantasy-scene">
          <Eyebrow>MLB FANTASY RESEARCH</Eyebrow>
          <div className="display medium">FLOOR.<br /><em>PROJECTION.</em><br />CEILING.</div>
          <div className="fantasy-scope">MLB HITTERS · DRAFTKINGS MLB</div>
          <ProductShot src="fantasy-desktop-jul18.png" className="fantasy-desktop" position="50% 48%" scale={1.14} />
          <ProductShot src="fantasy-mobile-jul18.png" className="fantasy-mobile" position="50% 15%" origin="center top" scale={1.03} label="MOBILE RANGE" />
        </div>
      </Scene>

      <Scene from={2085} to={2370}>
        <div className="scene independence-scene">
          <Eyebrow>YOUR RESEARCH. YOUR DECISION.</Eyebrow>
          <div className="display medium">NO SPORTSBOOK.<br /><em>NO ENTRIES PLACED.</em></div>
          <div className="independent-copy">AN INDEPENDENT RESEARCH WORKSPACE FOR THE GAMES YOU FOLLOW.</div>
          <div className="value-words"><b>LESS TAB HOPPING</b><b>MORE CONTEXT</b><b>MORE FUN</b></div>
          <ProductShot src="analyzer-jul21.png" className="independent-shot" position="55% 48%" scale={1.18} />
        </div>
      </Scene>

      <Scene from={2355} to={2520}>
        <div className="scene end-scene">
          <BrandMark />
          <div className="end-brand">PROPELLER<br /><em>PICKS</em></div>
          <div className="end-line">RESEARCH<br /><em>BETTER.</em></div>
          <div className="end-cta">START FREE</div>
          <div className="end-url">PROPELLERPICKS.COM/ANALYZER</div>
          <div className="end-fine">RESEARCH &amp; ANALYTICS PLATFORM · NOT A SPORTSBOOK</div>
        </div>
      </Scene>

      <CaptionOverlay />
    </AbsoluteFill>
  );
};

export const PropellerSocialCover: React.FC = () => (
  <AbsoluteFill className="cover">
    <Grain />
    <Eyebrow>PROPELLER PICKS</Eyebrow>
    <div className="cover-title">LESS<br /><em>NOISE.</em><br />MORE CONTEXT.</div>
    <ProductShot src="desktop-agent-rows.png" className="cover-shot" position="54% 47%" scale={1.1} />
    <div className="cover-footer">AI-ASSISTED SPORTS RESEARCH</div>
  </AbsoluteFill>
);
