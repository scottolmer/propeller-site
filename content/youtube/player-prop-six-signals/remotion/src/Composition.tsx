import {Composition, Still} from "remotion";
import {DURATION_IN_FRAMES, FPS} from "./data";
import {SixSignals} from "./SixSignals";
import {Thumbnail} from "./Thumbnail";

export const MyComposition = () => (
  <>
    <Composition
      id="PropellerSixSignals"
      component={SixSignals}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{
        showCaptions: true,
        accentColor: "#ff6038",
        successColor: "#147d50",
        paperColor: "#f2efe8",
      }}
    />
    <Still id="PropellerSixSignalsThumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);
