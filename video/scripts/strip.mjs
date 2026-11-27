// A film strip of rendered frames, for checking motion:
//   node video/scripts/strip.mjs <framesDir> <fps> <t0> <t1> <step> <out.png> [cols] [width]
import fs from 'fs';
import { spawnSync } from 'child_process';
const [dir, fps, t0, t1, step, out, cols = 6, w = 320] = process.argv.slice(2);
const ext = fs.readdirSync(dir)[0].split('.').pop();
const list = [];
for (let t = +t0; t <= +t1 + 1e-6; t += +step) list.push(dir + '/' + String(Math.round(t * fps)).padStart(6, '0') + '.' + ext);
const h = Math.round(w * 9 / 16);
const args = ['-y', '-loglevel', 'error'];
list.forEach(f => args.push('-i', f));
const scaled = list.map((_, i) => '[' + i + ':v]scale=' + w + ':' + h + '[v' + i + ']').join(';');
const layout = list.map((_, i) => ((i % cols) * w) + '_' + (Math.floor(i / cols) * h)).join('|');
args.push('-filter_complex', scaled + ';' + list.map((_, i) => '[v' + i + ']').join('') + 'xstack=inputs=' + list.length + ':layout=' + layout + ':fill=black', '-frames:v', '1', out);
const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
console.log(list.length, 'frames', r.status);
