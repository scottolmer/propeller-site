import './index.css';
import {Composition} from 'remotion';
import {PropellerSocialCover, PropellerSocialLaunch} from './Composition';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PropellerSocialLaunch" component={PropellerSocialLaunch} durationInFrames={2520} fps={30} width={1080} height={1920} />
    <Composition id="PropellerSocialCover" component={PropellerSocialCover} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
