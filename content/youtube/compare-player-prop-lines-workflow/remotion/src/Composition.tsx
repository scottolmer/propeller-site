import {Composition, Still} from "remotion";
import {FPS, VIDEO_DURATION_FRAMES} from "./data";
import {CompareLinesWorkflow} from "./Video";
import {Thumbnail} from "./Thumbnail";

export const MyComposition: React.FC = () => (
  <>
    <Composition
      id="CompareLinesWorkflow"
      component={CompareLinesWorkflow}
      durationInFrames={VIDEO_DURATION_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{showCaptions: true}}
    />
    <Still id="CompareLinesThumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);
