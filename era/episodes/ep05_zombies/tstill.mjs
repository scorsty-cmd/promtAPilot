import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const o = { chromiumOptions: { gl: 'angle' }, browserExecutable: '/usr/bin/google-chrome' };
for (const id of process.argv.slice(2)) {
  const t0 = Date.now(); const comp = await selectComposition({ serveUrl, id, ...o });
  await renderStill({ serveUrl, composition: comp, frame: 10, output: `stills/${id}.png`, ...o });
  console.log(id, (Date.now() - t0) / 1000);
}
