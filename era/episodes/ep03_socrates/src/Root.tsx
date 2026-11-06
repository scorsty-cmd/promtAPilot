import React from 'react';
import { Composition } from 'remotion';
import { Sheet } from './Sheet';
import { FPS, W, H, TOTAL } from './lib';
let Video: any = null; try { Video = require('./Video').Video; } catch (e) {}
let SH: any = null; try { SH = require('./Short'); } catch (e) {}
let Thumb: any = null; try { Thumb = require('./Thumb').Thumb; } catch (e) {}
export const Root: React.FC = () => <>
  {Video && <Composition id="Socrates" component={Video} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />}
  {Thumb && <Composition id="Thumb" component={Thumb} durationInFrames={30} fps={FPS} width={1280} height={720} />}
  {SH && SH.SHORTS.map((p: any, i: number) => <Composition key={i} id={`Short${p.id}`} component={SH.Short} defaultProps={{ n: i }} durationInFrames={Math.round(p.dur * FPS)} fps={FPS} width={1080} height={1920} />)}
  <Composition id="Sheet" component={Sheet} durationInFrames={60} fps={FPS} width={1920} height={1080} />
</>;
