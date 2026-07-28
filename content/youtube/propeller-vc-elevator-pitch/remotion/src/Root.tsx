import "./index.css";
import { VCElevatorPitch, VCElevatorThumbnail } from "./Composition";
import { Composition } from "remotion";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VCElevatorPitch"
        component={VCElevatorPitch}
        durationInFrames={3645}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="VCElevatorThumbnail"
        component={VCElevatorThumbnail}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
