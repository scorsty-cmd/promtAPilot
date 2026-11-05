import React from 'react';
import { Composition } from 'remotion';
import { Sheet } from './Sheet';
import { FPS, W, H, TOTAL } from './lib';
let Video: any = null; try { Video = require('./Video').Video; } catch (e) {}
export const Root: React.FC = () => <>
  {Video && <Composition id="Stone" component={Video} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />}
  <Composition id="Sheet" component={Sheet} durationInFrames={60} fps={FPS} width={W} height={H} />
</>;
