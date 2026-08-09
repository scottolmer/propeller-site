import {Composition} from "remotion";
import {DURATION_IN_FRAMES, FPS} from "./data";
import {Walkthrough} from "./Walkthrough";

export const MyComposition = () => {
  return (
    <Composition
      id="PropellerConfidenceWalkthrough"
      component={Walkthrough}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{
        showCaptions: true,
        accentColor: "#f97316",
        successColor: "#10b981",
      }}
    />
  );
};
