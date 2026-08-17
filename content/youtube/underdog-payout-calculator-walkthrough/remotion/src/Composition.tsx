import {Composition, Still} from "remotion";
import {FPS, VIDEO_DURATION_FRAMES} from "./data";
import {UnderdogPayoutVideo} from "./Video";
import {Thumbnail} from "./Thumbnail";

export const MyComposition: React.FC = () => (
  <>
    <Composition id="UnderdogPayoutWalkthrough" component={UnderdogPayoutVideo} durationInFrames={VIDEO_DURATION_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{showCaptions: true}}/>
    <Still id="UnderdogPayoutThumbnail" component={Thumbnail} width={1280} height={720}/>
  </>
);
