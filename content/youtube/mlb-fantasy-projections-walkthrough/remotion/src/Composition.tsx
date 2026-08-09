import { Composition, Still } from "remotion";
import { loadFont as loadFamiljen } from "@remotion/google-fonts/FamiljenGrotesk";
import { loadFont as loadPlexSans } from "@remotion/google-fonts/IBMPlexSans";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { DURATION_IN_FRAMES, FPS } from "./data";
import { FantasyWalkthrough, Thumbnail } from "./Video";

loadFamiljen("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });
loadPlexSans("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });
loadPlexMono("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const MyComposition = () => (
  <>
    <Composition id="FantasyWalkthrough" component={FantasyWalkthrough} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={1920} height={1080} />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);
