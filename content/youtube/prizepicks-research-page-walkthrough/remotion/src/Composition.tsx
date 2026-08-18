import {Composition} from "remotion";
import {PrizePicksResearchVideo} from "./Video";
import {PrizePicksThumbnail} from "./Thumbnail";
import {DURATION_FRAMES, FPS} from "./data";

export const MyComposition = () => <><Composition id="PrizePicksResearchPageWalkthrough" component={PrizePicksResearchVideo} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{showCaptions:true}}/><Composition id="PrizePicksResearchWalkthroughThumbnail" component={PrizePicksThumbnail} durationInFrames={1} fps={FPS} width={1280} height={720}/></>;
