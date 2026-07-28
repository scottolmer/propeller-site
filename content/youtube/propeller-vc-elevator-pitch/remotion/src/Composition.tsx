import { Audio } from "@remotion/media";
import captionsJson from "./captions.json";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Caption } from "@remotion/captions";

const captions = captionsJson as Caption[];
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Scene: React.FC<{
  start: number;
  end: number;
  children: React.ReactNode;
}> = ({ start, end, children }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [start, start + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const exit = interpolate(frame, [end - 12, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return <AbsoluteFill style={{ opacity: Math.min(enter, exit) }}>{children}</AbsoluteFill>;
};

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="kicker"><span className="kickerDot" />{children}</div>
);

const Headline: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`headline ${className ?? ""}`}>{children}</div>
);

const Historical: React.FC = () => (
  <div className="historical">Illustrative product capture · July 2026</div>
);

const ProductImage: React.FC<{
  src: string;
  className?: string;
  focus?: "left" | "center" | "right";
}> = ({ src, className = "", focus = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame / fps;
  return (
    <div className={`productFrame ${className}`}>
      <Img
        src={staticFile(src)}
        className={`productImage focus-${focus}`}
        style={{ scale: 1.02 + Math.min(elapsed * 0.002, 0.04) }}
      />
      <Historical />
    </div>
  );
};

const CaptionOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const current = captions.findIndex((caption) => caption.startMs <= ms && caption.endMs >= ms);
  if (current < 0) return null;
  const page = captions.slice(current, Math.min(current + 8, captions.length));
  const text = page.map((caption) => caption.text).join("").trim();
  return <div className="caption">{text}</div>;
};

const Device: React.FC<{ side: "desktop" | "mobile"; children: React.ReactNode }> = ({ side, children }) => (
  <div className={`device device-${side}`}>{children}</div>
);

const SignalBadge: React.FC<{ label: string; value: string; tone?: "orange" | "green" }> = ({ label, value, tone = "orange" }) => (
  <div className={`signalBadge signal-${tone}`}>
    <span>{label}</span><b>{value}</b>
  </div>
);

const Grid: React.FC = () => <div className="gridOverlay" />;

export const VCElevatorPitch: React.FC = () => {
  return (
    <AbsoluteFill className="film">
      <Audio src={staticFile("narration-v2.mp3")} />
      <Grid />

      <Scene start={0} end={360}>
        <div className="scenePad problemScene">
          <Kicker>PROP RESEARCH, REBUILT</Kicker>
          <Headline>Sports research<br />is <span>fragmented.</span></Headline>
          <div className="fragmentCloud">
            {['LINE', 'INJURY NEWS', 'ROLE', 'MATCHUP', 'MARKET', 'SOCIAL'].map((item, index) => (
              <div className={`fragment fragment-${index}`} key={item}>{item}</div>
            ))}
          </div>
          <div className="problemFooter">Six disconnected tabs. One high-stakes decision.</div>
        </div>
      </Scene>

      <Scene start={350} end={765}>
        <div className="scenePad introScene">
          <Kicker>THE RESEARCH LAYER</Kicker>
          <Headline>One question.<br /><span>Inspectable</span> context.</Headline>
          <div className="introCopy">Propeller Picks combines player, market, and game context into a research workflow built for web and mobile.</div>
          <div className="deviceRow introDevices">
            <Device side="desktop"><ProductImage src="analyzer-historical.png" /></Device>
            <Device side="mobile"><ProductImage src="mobile-detail-historical.png" /></Device>
          </div>
        </div>
      </Scene>

      <Scene start={750} end={930}>
        <div className="scenePad analyzerScene">
          <div className="analyzerText">
            <Kicker>FREE PROP ANALYZER</Kicker>
            <Headline className="smaller">Line. Direction.<br /><span>Freshness.</span></Headline>
            <div className="analyzerPill">Start with what is on the board now.</div>
          </div>
          <ProductImage src="desktop-detail-historical.png" className="analyzerPanel" focus="center" />
        </div>
      </Scene>

      <Scene start={920} end={1785}>
        <div className="scenePad methodScene">
          <Kicker>EXPLAINABLE ENSEMBLE</Kicker>
          <Headline className="methodTitle">Not one opaque<br />prediction.</Headline>
          <div className="methodDiagram">
            <SignalBadge label="RECENCY" value="WEIGHTED" />
            <SignalBadge label="NO-VIG" value="NORMALIZED" tone="green" />
            <SignalBadge label="INJURY" value="CASCADE" />
            <SignalBadge label="TREND" value="CONSISTENCY" tone="green" />
            <div className="methodCore"><span>SPORT-SPECIFIC</span><b>CALIBRATION</b></div>
            <svg className="methodLines" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
              <path d="M155 112 C330 112, 355 215, 492 250" />
              <path d="M845 112 C670 112, 645 215, 508 250" />
              <path d="M155 385 C330 385, 355 285, 492 250" />
              <path d="M845 385 C670 385, 645 285, 508 250" />
            </svg>
          </div>
          <ProductImage src="desktop-agents-historical.png" className="agentPanel" />
        </div>
      </Scene>

      <Scene start={1760} end={2280}>
        <div className="scenePad wedgeScene">
          <Kicker>THE WEDGE</Kicker>
          <Headline className="wedgeHeadline">Not a black-box pick.<br /><span>A transparent workflow.</span></Headline>
          <div className="wedgeRail">
            <div><b>DISCOVER</b><span>Free Analyzer</span></div>
            <i />
            <div><b>INSPECT</b><span>Line + evidence</span></div>
            <i />
            <div><b>REPEAT</b><span>Full workspace</span></div>
          </div>
          <div className="deviceRow wedgeDevices">
            <Device side="desktop"><ProductImage src="desktop-detail-historical.png" /></Device>
            <Device side="mobile"><ProductImage src="mobile-agents-historical.png" /></Device>
          </div>
        </div>
      </Scene>

      <Scene start={2260} end={2600}>
        <div className="scenePad confidenceScene">
          <Kicker>MODEL CONFIDENCE</Kicker>
          <Headline className="smaller">Signal strength,<br /><span>not certainty.</span></Headline>
          <div className="confidenceRing"><span>50—100</span><b>CONVICTION</b></div>
          <div className="deviceRow confidenceDevices">
            <Device side="desktop"><ProductImage src="desktop-detail-historical.png" /></Device>
            <Device side="mobile"><ProductImage src="mobile-detail-historical.png" /></Device>
          </div>
          <div className="notProbability">Not a calibrated win probability. Not a guarantee.</div>
        </div>
      </Scene>

      <Scene start={2580} end={2940}>
        <div className="scenePad fantasyScene">
          <Kicker>FANTASY EXPANSION</Kicker>
          <Headline className="smaller">Floor. Projection.<br /><span>Ceiling.</span></Headline>
          <div className="fantasyScope">MLB HITTERS · DRAFTKINGS MLB</div>
          <ProductImage src="fantasy-historical.png" className="fantasyPanel" />
        </div>
      </Scene>

      <Scene start={2920} end={3150}>
        <div className="scenePad trustScene">
          <Kicker>BUILT FOR TRUST</Kicker>
          <Headline className="smaller">Documented methods.<br /><span>Honest uncertainty.</span></Headline>
          <div className="trustColumns">
            <div><b>METHOD</b><span>Signal definitions and limitations are visible.</span></div>
            <div><b>CONTEXT</b><span>A changed line is a new research question.</span></div>
            <div><b>CONTROL</b><span>Stop when evidence is incomplete.</span></div>
          </div>
        </div>
      </Scene>

      <Scene start={3130} end={3375}>
        <div className="scenePad organicScene">
          <Kicker>ORGANIC DISCOVERY</Kicker>
          <Headline className="smaller">Growth through<br /><span>useful answers.</span></Headline>
          <div className="searchOrb"><span>HOW DOES A</span><b>CONFIDENCE<br />SCORE WORK?</b></div>
          <div className="searchOrb orb2"><span>WHAT IS</span><b>NO-VIG<br />CONTEXT?</b></div>
          <div className="searchOrb orb3"><span>HOW TO READ</span><b>PLAYER PROP<br />SIGNALS</b></div>
        </div>
      </Scene>

      <Scene start={3355} end={3645}>
        <div className="scenePad closingScene">
          <div className="brandMark"><i /><i /><i /></div>
          <div className="brandName">PROPELLER<br /><span>PICKS</span></div>
          <Headline className="closingHeadline">Trusted research<br />for the moments<br /><span>context matters.</span></Headline>
          <div className="closingUrl">propellerpicks.com</div>
          <div className="closingFine">Research and analytics platform · Not a sportsbook</div>
        </div>
      </Scene>

      <CaptionOverlay />
    </AbsoluteFill>
  );
};

export const VCElevatorThumbnail: React.FC = () => (
  <AbsoluteFill className="thumbnailFilm">
    <Grid />
    <div className="thumbKicker">THE RESEARCH LAYER</div>
    <div className="thumbTitle">NOT A<br /><span>BLACK BOX.</span></div>
    <div className="thumbSub">INSPECT THE WHY</div>
    <div className="thumbScreen"><Img src={staticFile("desktop-agents-historical.png")} /></div>
    <div className="thumbLogo"><i /><i /><i /></div>
  </AbsoluteFill>
);
