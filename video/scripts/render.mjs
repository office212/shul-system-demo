// Render the film frame by frame and encode it.
//   node video/scripts/render.mjs <he|en> [--fps 60] [--dsf 2] [--workers 4] [--from 0] [--to 71] [--draft] [--audio path.wav] [--out file.mp4]
// --draft: 30 fps, 1x, JPEG frames (fast, for review).  Frames go to video/out/frames-<lang>/.
import fs from 'fs'; import path from 'path'; import { spawn, spawnSync } from 'child_process';
import { chromium } from './lib.mjs';
const a = process.argv.slice(2), lang = a[0] === 'en' ? 'en' : 'he';
const opt = (k, d) => { const i = a.indexOf('--' + k); return i < 0 ? d : (a[i + 1] === undefined || a[i + 1].startsWith('--') ? true : a[i + 1]); };
const draft = !!opt('draft', false);
const fps = +opt('fps', draft ? 30 : 60), dsf = +opt('dsf', draft ? 1 : 2), workers = +opt('workers', 4);
const URL = (process.env.FILM_URL || 'http://127.0.0.1:8765/video/comp/index.html') + `?lang=${lang}&raw=1`;
const outDir = path.resolve('video/out'), frames = path.join(outDir, `frames-${lang}${draft ? '-draft' : ''}`);
fs.mkdirSync(frames, { recursive: true });
const ext = draft ? 'jpg' : 'png';

async function boot() {
  const b = await chromium.launch({ args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb', '--disable-gpu-vsync'] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dsf });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction('window.READY === true', null, { timeout: 120000 });
  const cdp = await ctx.newCDPSession(page);
  return { b, page, cdp };
}
const first = await boot();
const DUR = await first.page.evaluate(() => window.DURATION), cues = await first.page.evaluate(() => window.CUES);
fs.writeFileSync(path.join(outDir, `cues-${lang}.json`), JSON.stringify({ duration: DUR, cues }));
const f0 = Math.round(+opt('from', 0) * fps), f1 = Math.min(Math.round(DUR * fps), Math.round(+opt('to', DUR) * fps));
const total = f1 - f0; let done = 0; const t00 = Date.now();
console.log(`${lang}: frames ${f0}..${f1 - 1} at ${fps} fps, ${dsf}x, ${workers} workers`);
let next = opt('encode-only', false) ? f1 : f0;   // --encode-only: the frames are already there
async function work(w) {
  const { b, page, cdp } = w;
  for (;;) {
    const f = next++; if (f >= f1) break;
    await page.evaluate(t => window.seek(t), f / fps);
    const r = await cdp.send('Page.captureScreenshot', draft ? { format: 'jpeg', quality: 92 } : { format: 'png', optimizeForSpeed: true });
    fs.writeFileSync(path.join(frames, String(f).padStart(6, '0') + '.' + ext), Buffer.from(r.data, 'base64'));
    if (++done % 200 === 0) console.log(`  ${done}/${total}  ${(done / ((Date.now() - t00) / 1000)).toFixed(1)} fps`);
  }
  await b.close();
}
const ws = [first]; for (let i = 1; i < workers; i++) ws.push(await boot());
await Promise.all(ws.map(work));
console.log(`frames done in ${((Date.now() - t00) / 1000).toFixed(0)}s`);
if (opt('noencode', false)) process.exit(0);

// encode: BT.709, 1080p, H.264 + AAC, fast start.
// The frames are drawn at twice the size. They are brought down to 1080p at 16 bits, the faint steps that
// 8-bit gradients leave in the dark backdrop are smoothed (deband), and the picture is then dithered to
// 8 bits with a fixed pattern, so the gradients stay smooth and still cost nothing where nothing moves.
const audio = opt('audio', null), out = path.resolve(opt('out', path.join(outDir, `shul-system-${lang}${draft ? '-draft' : ''}.mp4`)));
const args = ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-start_number', String(f0), '-i', path.join(frames, `%06d.${ext}`)];
if (audio) args.push('-ss', String(f0 / fps), '-i', audio);
const vf = draft
  ? 'scale=1920:1080:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p'
  : 'zscale=w=1920:h=1080:f=lanczos:min=gbr:m=709:rin=full:r=limited,format=yuv444p16le,deband=1thr=0.012:2thr=0.012:3thr=0.012:range=22:blur=1,zscale=d=ordered,format=yuv420p';
args.push('-frames:v', String(total), '-vf', vf,
  '-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'slow', '-crf', String(opt('crf', draft ? 20 : 17)), '-x264-params', 'aq-mode=3', '-profile:v', 'high', '-level', fps > 30 ? '4.2' : '4.1',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart');
if (audio) args.push('-c:a', 'aac', '-b:a', '256k', '-shortest');
args.push('-metadata', 'title=' + (lang === 'he' ? 'Shul System · מערכת לניהול בית הכנסת' : 'Shul System · Shul management software'), '-metadata:s:a:0', 'language=' + (lang === 'he' ? 'heb' : 'eng'));
args.push(out);
const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
console.log(r.status === 0 ? `wrote ${out}` : 'ffmpeg failed');
