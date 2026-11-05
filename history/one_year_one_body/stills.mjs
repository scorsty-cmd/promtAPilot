// usage: node stills.mjs Ep01 out/stills f1 f2 ...   (one bundle, many stills)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'path';
const [comp, outDir, ...frames] = process.argv.slice(2);
const serveUrl = process.env.BUNDLE || await bundle({entryPoint: path.resolve('src/index.tsx')});
const browser = await openBrowser('chrome', {browserExecutable: process.env.CHROME || '/usr/bin/google-chrome', chromiumOptions: {gl: process.env.GL || null}});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser});
for (const f of frames) {
  const t = Date.now();
  await renderStill({composition, serveUrl, output: `${outDir}/${comp}_${String(f).padStart(5, '0')}.png`, frame: Number(f), puppeteerInstance: browser});
  console.log('still', f, Date.now() - t, 'ms');
}
await browser.close({silent: true});
