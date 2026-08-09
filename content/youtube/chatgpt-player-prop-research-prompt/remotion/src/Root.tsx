import './index.css';
import './fonts';
import {Composition} from 'remotion';
import {Thumbnail, VideoComposition} from './Composition';

export const RemotionRoot: React.FC = () => (
  <>
    <VideoComposition />
    <Composition id="ChatGPTPlayerPropResearchThumbnail" component={Thumbnail} durationInFrames={1} fps={30} width={1280} height={720} />
  </>
);
