import {Composition} from "remotion";
import {PrizePicksPowerFlexVideo} from "./Video";
import {PrizePicksThumbnail} from "./Thumbnail";
import {DURATION_FRAMES, FPS} from "./data";

export const MyComposition = () => (
  <>
    <Composition
      id="PrizePicksPowerFlex"
      component={PrizePicksPowerFlexVideo}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{showCaptions: true}}
    />
    <Composition
      id="PrizePicksPowerFlexThumbnail"
      component={PrizePicksThumbnail}
      durationInFrames={1}
      fps={FPS}
      width={1280}
      height={720}
    />
  </>
);
