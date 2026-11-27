// A film strip of rendered frames, for checking motion:
//   node video/scripts/strip.mjs <framesDir> <fps> <t0> <t1> <step> <out.png> [cols] [width]
import fs from 'fs';
import { spawnSync } from 'child_process';
const [dir, fps, t0, t1, step, out, cols = 6, w = 320] = process.argv.slice(2);
const first = fs.readdirSync(dir).sort()[0], ext = first.split('.').pop();
const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', dir + '/' + first]).stdout.toString().trim().split(',');
const h = Math.round(w * probe[1] / probe[0] / 2) * 2;
const list = [];
for (let t = +t0; t <= +t1 + 1e-6; t += +step) list.push(dir + '/' + String(Math.round(t * fps)).padStart(6, '0') + '.' + ext);
const args = ['-y', '-loglevel', 'error'];
list.forEach(f => args.push('-i', f));
const scaled = list.map((_, i) => '[' + i + ':v]scale=' + w + ':' + h + '[v' + i + ']').join(';');
const layout = list.map((_, i) => ((i % cols) * w) + '_' + (Math.floor(i / cols) * h)).join('|');
args.push('-filter_complex', scaled + ';' + list.map((_, i) => '[v' + i + ']').join('') + 'xstack=inputs=' + list.length + ':layout=' + layout + ':fill=black', '-frames:v', '1', out);
const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
console.log(list.length, 'frames', r.status);
