// Draw single frames of the film for review: node video/scripts/frames.mjs <he|en> <t,t,t> [outDir] [scale]
import fs from 'fs';
import { chromium } from './lib.mjs';
const lang = process.argv[2] || 'he', times = (process.argv[3] || '0').split(',').map(Number), out = process.argv[4] || 'video/explore/f', dsf = +(process.argv[5] || 1);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dsf });
page.on('pageerror', e => console.log('pageerror:', e.message)); page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
await page.goto(`http://127.0.0.1:8765/video/comp/index.html?lang=${lang}&raw=1`, { waitUntil: 'networkidle' });
await page.waitForFunction('window.READY === true', null, { timeout: 60000 });
for (const t of times) { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: `${out}/${lang}-${t.toFixed(2).padStart(5, '0')}.png` }); }
console.log('ok', times.length); await b.close();
