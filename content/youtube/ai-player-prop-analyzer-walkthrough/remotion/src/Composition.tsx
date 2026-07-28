import { Composition } from "remotion";
import { PropAnalyzerWalkthrough } from "./Video";
import { VideoThumbnail } from "./Thumbnail";

export const VIDEO_FPS = 30;
export const VIDEO_DURATION = 7162;

export const VideoCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="PropAnalyzerWalkthrough"
        component={PropAnalyzerWalkthrough}
        durationInFrames={VIDEO_DURATION}
        fps={VIDEO_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="PropAnalyzerThumbnail"
        component={VideoThumbnail}
        durationInFrames={1}
        fps={VIDEO_FPS}
        width={1280}
        height={720}
      />
    </>
  );
};
