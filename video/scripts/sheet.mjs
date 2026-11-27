// contact sheet of shots for a quick visual check: node video/scripts/sheet.mjs <dir> <out.png> [filter] [cols] [cellW]
import fs from 'fs'; import path from 'path';
import { chromium } from './lib.mjs';
const dir = path.resolve(process.argv[2]), out = process.argv[3], filt = new RegExp(process.argv[4] || '.'), cols = +(process.argv[5] || 4), cw = +(process.argv[6] || 460);
const files = fs.readdirSync(dir).filter(f => /\.(png|jpg|webp)$/.test(f) && filt.test(f)).sort();
const html = `<body style="margin:0;background:#888;font:13px sans-serif"><div style="display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:8px;padding:8px">${files.map(f => `<div style="background:repeating-conic-gradient(#bbb 0 25%,#ddd 0 50%) 0 0/20px 20px"><img src="file://${dir}/${f}" style="width:100%;display:block;max-height:${cw * 1.6}px;object-fit:contain"><div style="background:#222;color:#fff;padding:2px 6px">${f}</div></div>`).join('')}</div></body>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: cols * (cw + 8) + 8, height: 800 } });
const tmp = path.join(dir, '__sheet.html'); fs.writeFileSync(tmp, html); await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.waitForTimeout(600); fs.unlinkSync(tmp);
await p.screenshot({ path: out, fullPage: true }); await b.close(); console.log(files.length, 'files');
