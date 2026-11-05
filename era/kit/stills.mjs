// render stills at given seconds: node stills.mjs 1.0 5.2 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const serveUrl = process.env.BUNDLE || await bundle({ entryPoint: path.resolve('src/index.ts') });
const inputProps = {};
const comp = await selectComposition({ serveUrl, id: 'Stone', inputProps, chromiumOptions: { gl: process.env.GL || 'angle' }, browserExecutable: '/usr/bin/google-chrome' });
for (const s of process.argv.slice(2)) {
  const t0 = Date.now();
  await renderStill({ serveUrl, composition: comp, frame: Math.round(parseFloat(s) * 30), output: `stills/s_${s}.png`, chromiumOptions: { gl: process.env.GL || 'angle' }, browserExecutable: '/usr/bin/google-chrome', inputProps });
  console.log(s, (Date.now() - t0) / 1000, 's');
}
console.log('BUNDLE', serveUrl);
