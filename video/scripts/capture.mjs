// Captures the real screens of the demo (fictional data) for the marketing video.
// Usage: node video/scripts/capture.mjs [he|en|both] [group,group,...]
// Output: video/shots/<lang>/<name>.png and video/shots/<lang>/meta.json (sizes and element boxes).
import fs from 'fs';
import { chromium, open, go } from './lib.mjs';

const LANGS = (process.argv[2] && process.argv[2] !== 'both') ? [process.argv[2]] : ['he', 'en'];
const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const want = g => !ONLY.length || ONLY.includes(g);
const ROOT = 'video/shots';
const THEMES = ['classic', 'modern', 'warm', 'royal', 'heichal', 'parochet', 'emerald', 'platinum', 'techelet', 'kotel', 'sefer', 'marble', 'argaman', 'erez'];

const browser = await chromium.launch();

for (const lang of LANGS) {
  const dir = `${ROOT}/${lang}`;
  fs.mkdirSync(dir, { recursive: true });
  const metaPath = `${dir}/meta.json`;
  const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
  const saveMeta = () => fs.writeFileSync(metaPath, JSON.stringify(meta, null, 1));

  // screenshot + remember the CSS size and the boxes of named elements (CSS px)
  async function shot(page, name, rects = {}, opts = {}) {
    const vp = page.viewportSize();
    const boxes = await page.evaluate((rects) => {
      const o = {};
      for (const k in rects) {
        const el = document.querySelector(rects[k]);
        if (el) { const r = el.getBoundingClientRect(); o[k] = [r.x, r.y, r.width, r.height].map(v => Math.round(v * 10) / 10); }
      }
      return o;
    }, rects);
    await page.screenshot({ path: `${dir}/${name}.png`, ...opts });
    let w = vp.width, h = vp.height;
    if (opts.fullPage) { const s = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]); w = s[0]; h = s[1]; }
    if (opts.clip) { w = opts.clip.width; h = opts.clip.height; }
    meta[name] = { w, h, rects: boxes };
    saveMeta();
    console.log(`  [${lang}] ${name}`);
  }
  // one element alone, on transparency (toasts, push notifications, the bulletin sheet)
  async function cutout(page, name, selector, pad = 40) {
    const r = await page.evaluate(sel => { const el = document.querySelector(sel); if (!el) return null; el.setAttribute('data-iso', '1'); const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }, selector);
    if (!r) { console.log(`  [${lang}] ${name}: not found (${selector})`); return; }
    await page.evaluate(() => { const st = document.createElement('style'); st.id = '__iso'; st.textContent = 'html,body{background:transparent!important} body *{visibility:hidden!important} [data-iso], [data-iso] *{visibility:visible!important}'; document.head.appendChild(st); });
    await page.waitForTimeout(80);
    const vp = page.viewportSize();
    const clip = { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: 0, height: 0 };
    clip.width = Math.min(vp.width, r.x + r.w + pad) - clip.x; clip.height = Math.min(vp.height, r.y + r.h + pad) - clip.y;
    await page.screenshot({ path: `${dir}/${name}.png`, clip, omitBackground: true });
    await page.evaluate(() => { document.getElementById('__iso').remove(); document.querySelectorAll('[data-iso]').forEach(e => e.removeAttribute('data-iso')); });
    meta[name] = { w: clip.width, h: clip.height, at: [clip.x, clip.y], el: [r.x, r.y, r.w, r.h] };
    saveMeta(); console.log(`  [${lang}] ${name} (cut-out)`);
  }
  const quiet = page => page.addStyleTag({ content: '#toasts,#pushes{display:none!important}' });
  const pin = async (ctx, clock) => ctx.addInitScript(c => { try { sessionStorage.setItem('shulDemo.clock', c); } catch (e) {} }, clock);
  // wait until every nested TV preview has rendered
  const framesReady = async (page) => {
    await page.evaluate(() => document.querySelectorAll('iframe').forEach(f => { f.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.querySelectorAll('iframe.tvpv')].every(f => { try { return f.contentDocument && f.contentDocument.querySelector('.tv-stage .tv-cols'); } catch (e) { return false; } }), null, { timeout: 15000 }).catch(() => {});
    for (const f of page.frames()) { if (f !== page.mainFrame()) { await f.addStyleTag({ content: '.tv-demo,.tv-ctl{display:none!important}' }).catch(() => {}); await f.evaluate(() => { const s = document.querySelector('.tv-demo'); if (s && s.previousSibling && s.previousSibling.nodeType === 3) s.previousSibling.textContent = ''; return document.fonts.ready; }).catch(() => {}); } }
    await page.waitForTimeout(600);
  };
  const tvClean = page => page.evaluate(() => { const s = document.querySelector('.tv-demo'); if (s && s.previousSibling && s.previousSibling.nodeType === 3) s.previousSibling.textContent = ''; });

  /* ---------------- the screen in the shul ---------------- */
  if (want('tv')) {
    const { ctx, page } = await open(browser, { lang, w: 1920, h: 1080, dsf: 2 });
    const TVR = { zmanim: '.tv-cols .tv-col:first-of-type', center: '.tv-center', prayers: '.tv-cols .tv-col:last-of-type', next: '.tv-prayers .next, .tv-prow.next', nextbar: '.tv-next', qr: '.tv-slot', clock: '.tv-clock', brand: '.tv-brand', board: '.tv-board', title: '.tv-title' };
    await go(page, '/tv?preview=1&clock=1:900'); await tvClean(page);
    await shot(page, 'tv-day', TVR);
    // the community board rotates every 9 seconds: capture the next few slides
    for (let i = 1; i <= 7; i++) {
      await page.waitForTimeout(9050); await tvClean(page);
      const r = await page.evaluate(() => { const b = document.querySelector('.tv-center').getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; });
      await shot(page, `tv-board-${i}`, {}, { clip: r });
    }
    await go(page, '/tv?preview=1&clock=5:930'); await tvClean(page);
    await shot(page, 'tv-erev', TVR);
    await go(page, '/tv?preview=1&clock=6:660'); await tvClean(page);
    await shot(page, 'tv-shabbat', TVR);
    await ctx.close();
  }

  /* ---------------- designs: the screen, the website and the member account ---------------- */
  if (want('themes')) {
    for (const th of THEMES) {
      let o = await open(browser, { lang, w: 1920, h: 1080, dsf: 1, theme: th });
      await go(o.page, '/tv?preview=1&clock=1:900'); await tvClean(o.page);
      await shot(o.page, `th-tv-${th}`);
      await o.ctx.close();
      o = await open(browser, { lang, w: 1280, h: 800, dsf: 1.5, theme: th, role: 'visitor' });
      await pin(o.ctx, '1:900');
      await go(o.page, '/site');
      await shot(o.page, `th-site-${th}`);
      await o.ctx.close();
      o = await open(browser, { lang, w: 430, h: 932, dsf: 2, theme: th, role: 'member', mobile: true });
      await pin(o.ctx, '1:900');
      await go(o.page, '/me');
      await shot(o.page, `th-me-${th}`);
      await o.ctx.close();
    }
  }

  /* ---------------- gabbai: dashboard, davening times, content, bulletin, roles ---------------- */
  if (want('gabbai')) {
    const { ctx, page } = await open(browser, { lang, w: 1360, h: 860, dsf: 2, role: 'super' });
    await pin(ctx, '1:600');
    await go(page, '/gabbai'); await framesReady(page);
    await shot(page, 'dash', { tv: '.tv-frame', top: '.admin-top' });
    meta.dash.stats = await page.evaluate(() => [...document.querySelectorAll('.stat')].map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })); saveMeta();
    await shot(page, 'dash-full', {}, { fullPage: true });

    await go(page, '/gabbai/content'); await framesReady(page);
    await shot(page, 'content', { tv: '.tv-frame' });
    await go(page, '/gabbai/shabbat'); await page.waitForTimeout(400);
    await shot(page, 'bulletin', { sheet: '.sheet-page' });
    await page.setViewportSize({ width: 1360, height: 1500 }); await page.waitForTimeout(300);
    await cutout(page, 'sheet', '.sheet-page', 36);
    await page.setViewportSize({ width: 1360, height: 860 });
    await go(page, '/admin');
    await shot(page, 'admin');
    await go(page, '/backup');
    await shot(page, 'backup');
    await go(page, '/gabbai/activity');
    await shot(page, 'activity');
    await ctx.close();
  }

  /* ---------------- "Mincha moved? Change it once." ---------------- */
  if (want('times')) {
    const { ctx, page } = await open(browser, { lang, w: 1360, h: 860, dsf: 2, role: 'super' });
    await pin(ctx, '1:900');
    await go(page, '/gabbai/tv'); await framesReady(page);
    const R = { row: '[data-edit="p3"]', tv: '.tv-frame', card: '.card' };
    const rowRect = () => page.evaluate(() => { const b = document.querySelector('[data-edit="p3"]'); const row = b.closest('.row.between'); const r = row.getBoundingClientRect(), e = b.getBoundingClientRect(); const t = row.querySelector('b.num').getBoundingClientRect(); return { row: [r.x, r.y, r.width, r.height], edit: [e.x, e.y, e.width, e.height], time: [t.x, t.y, t.width, t.height] }; });
    // where the live preview's own picture sits on the page (the film lays a sharper capture of the same screen over it)
    const stageRect = () => page.evaluate(() => { const f = document.querySelector('iframe.tvpv'), fr = f.getBoundingClientRect(), st = f.contentDocument.querySelector('.tv-stage').getBoundingClientRect(); return { tvstage: [fr.x + st.x, fr.y + st.y, st.width, st.height], tvframe: [fr.x, fr.y, fr.width, fr.height] }; });
    await shot(page, 'times-0', R); Object.assign(meta['times-0'].rects, await rowRect(), await stageRect());
    await page.click('[data-edit="p3"]'); await page.waitForTimeout(450);
    await shot(page, 'times-1', { modal: '.modal', time: '.modal input[name=time]', save: '.modal .btn.primary' });
    await page.fill('.modal input[name=time]', '16:20'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(200);
    await shot(page, 'times-2', { modal: '.modal', time: '.modal input[name=time]', save: '.modal .btn.primary' });
    await page.click('.modal .btn.primary'); await page.waitForTimeout(450);
    await cutout(page, 'toast-times', '.toast', 30);
    await cutout(page, 'push-times', '.push', 36);
    await quiet(page); await framesReady(page);
    await shot(page, 'times-3', R); Object.assign(meta['times-3'].rects, await rowRect());
    saveMeta();
    // the same change, seen everywhere: the screen, the website and the bulletin
    await go(page, '/gabbai/shabbat'); await page.waitForTimeout(300);
    await shot(page, 'times-bulletin');
    await ctx.close();

    // before / after on the screen itself
    for (const [nm, t] of [['tvmin-before', 975], ['tvmin-after', 980]]) {
      const o = await open(browser, { lang, w: 1920, h: 1080, dsf: 2 });
      await o.ctx.addInitScript(t => { window.addEventListener('DOMContentLoaded', () => {}, { once: true }); window.__mincha = t; }, t);
      await o.page.goto('about:blank');
      await go(o.page, '/tv?preview=1&clock=1:900');
      await o.page.evaluate(t => { const p = SHUL.db.prayers.find(p => p.id === 'p3'); p.time = t; SHUL.save(); window.SHUL_TV_REFRESH && window.SHUL_TV_REFRESH(); }, t);
      await o.page.waitForTimeout(400); await tvClean(o.page);
      const r = await o.page.evaluate(() => { const c = document.querySelector('.tv-cols .tv-col:last-of-type').getBoundingClientRect(); const n = document.querySelector('.tv-prayers .next, .tv-prow.next'); const nr = n ? n.getBoundingClientRect() : c; return { col: [c.x, c.y, c.width, c.height], next: [nr.x, nr.y, nr.width, nr.height] }; });
      await shot(o.page, nm); meta[nm].rects = r; saveMeta();
      await o.ctx.close();
    }
  }

  /* ---------------- finance: Shabbat nedarim in one table, who owes, the member card ---------------- */
  if (want('finance')) {
    const { ctx, page } = await open(browser, { lang, w: 1360, h: 860, dsf: 2, role: 'finance' });
    await pin(ctx, '6:1110');
    await go(page, '/finance/home');
    await shot(page, 'fin-home', { stats: '.grid.g2, .stats', big: '.big-actions' });
    await shot(page, 'fin-home-full', {}, { fullPage: true });
    await go(page, '/finance/nedarim');
    const rows = [[0, 'm4', 52], [1, 'm2', 100], [2, 'm7', 36], [3, 'm9', 72], [4, 'm1', 180], [5, 'm13', 52], [6, 'm16', 100]];
    const rr = i => page.evaluate(i => { const tr = document.querySelector(`tr[data-row="${i}"]`); const r = tr.getBoundingClientRect(); const s = tr.querySelector('select').getBoundingClientRect(); const a = tr.querySelector('input').getBoundingClientRect(); return { row: [r.x, r.y, r.width, r.height], sel: [s.x, s.y, s.width, s.height], amt: [a.x, a.y, a.width, a.height] }; }, i);
    await shot(page, 'ned-0', { table: '#nt', card: '.card' });
    meta['ned-0'].rows = []; for (const r of rows) meta['ned-0'].rows.push(await rr(r[0]));
    let n = 0;
    for (const [i, mid, amt] of rows) {
      await page.selectOption(`tr[data-row="${i}"] select`, mid);
      await page.fill(`tr[data-row="${i}"] input[data-k=amt]`, String(amt));
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      n += 1; await shot(page, `ned-${n}`);
    }
    await page.evaluate(() => document.querySelector('#check').scrollIntoView({ block: 'center' })); await page.waitForTimeout(250);
    await shot(page, 'ned-check', { check: '#check' });
    await page.click('#check'); await page.waitForTimeout(450);
    await shot(page, 'ned-review', { modal: '.modal', ok: '.modal #ok' });
    await page.click('.modal #ok'); await page.waitForTimeout(500);
    await cutout(page, 'toast-ned', '.toast', 30);
    await quiet(page); await page.waitForTimeout(200);
    await shot(page, 'owes', { table: 'table' });
    meta.owes.rows = await page.evaluate(() => [...document.querySelectorAll('table tbody tr')].slice(0, 14).map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })); saveMeta();
    await go(page, '/finance/m/m1');
    await shot(page, 'mcard');
    await go(page, '/finance/more');
    await shot(page, 'fin-more');
    await go(page, '/finance/inbox');
    await shot(page, 'inbox');
    await ctx.close();
  }

  /* ---------------- the member's phone: balance, pay by card, donate ---------------- */
  if (want('member')) {
    const { ctx, page } = await open(browser, { lang, w: 430, h: 932, dsf: 3, role: 'member', mobile: true });
    await pin(ctx, '1:900');
    await go(page, '/me');
    await shot(page, 'me-0', { bal: '.mp-balance', pay: '.mp-pay', amt: '.mp-amt' });
    await shot(page, 'me-0-full', {}, { fullPage: true });
    await page.click('.mp-pay'); await page.waitForTimeout(700); await page.addStyleTag({ content: '#dock,.dock,#salesbar,.salesbar,.cta-demo{display:none!important}' });
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200);
    await shot(page, 'me-pay', { apple: '[data-wallet="Apple Pay"]', total: '#total' });
    await page.click('[data-wallet="Apple Pay"]'); await page.waitForTimeout(500);
    await shot(page, 'me-wallet', { ok: '#wOk', sheet: '.sheet' });
    await page.click('#wOk'); await page.waitForTimeout(250);
    await shot(page, 'me-wallet-done', { ok: '#wOk' });
    await page.waitForTimeout(1300);
    await cutout(page, 'push-paid', '.push', 36);
    await quiet(page); await page.waitForTimeout(150);
    await shot(page, 'me-thanks');
    await page.evaluate(() => { location.hash = '#/me'; }); await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200);
    await shot(page, 'me-paid', { bal: '.mp-balance' });
    await ctx.close();

    const o = await open(browser, { lang, w: 430, h: 932, dsf: 3, role: 'visitor', mobile: true });
    await pin(o.ctx, '1:900');
    await go(o.page, '/site'); await shot(o.page, 'site-m'); await shot(o.page, 'site-m-full', {}, { fullPage: true });
    await go(o.page, '/donate'); await shot(o.page, 'donate-m', { apple: '[data-wallet="Apple Pay"]' });
    await go(o.page, '/times'); await shot(o.page, 'times-m');
    await o.ctx.close();
  }


  /* ---------- the same change on the public times page, on a phone ---------- */
  if (want('timesm')) {
    const o = await open(browser, { lang, w: 430, h: 932, dsf: 3, role: 'visitor', mobile: true });
    await pin(o.ctx, '1:900');
    await go(o.page, '/times');
    await o.page.evaluate(() => { const p = SHUL.db.prayers.find(p => p.id === 'p3'); p.time = 980; SHUL.save(); SHUL_UI.render(); });
    await o.page.waitForTimeout(300); await o.page.addStyleTag({ content: '#dock,.dock,#salesbar,.salesbar,.cta-demo{display:none!important}' });
    const y = await o.page.evaluate(() => { const c = [...document.querySelectorAll('#app .card')][1]; const y = c.getBoundingClientRect().top + window.scrollY - 150; window.scrollTo(0, y); return y; });
    await o.page.waitForTimeout(300);
    await shot(o.page, 'times-m-after');
    meta['times-m-after'].rects = await o.page.evaluate(() => { const c = [...document.querySelectorAll('#app .card')][1]; const cr = c.getBoundingClientRect(); const rows = [...c.querySelectorAll('.row, tr, li, .zrow, div')].filter(e => e.children.length <= 3 && /4:20/.test(e.textContent) && e.getBoundingClientRect().height < 80); const r = (rows[rows.length - 1] || c).getBoundingClientRect(); return { card: [cr.x, cr.y, cr.width, cr.height], row: [r.x, r.y, r.width, r.height] }; });
    saveMeta();
    await o.ctx.close();
  }

  /* ---------------- the shul's website on a desktop ---------------- */
  if (want('site')) {
    const { ctx, page } = await open(browser, { lang, w: 1280, h: 800, dsf: 2, role: 'visitor' });
    await pin(ctx, '1:900');
    await go(page, '/site'); await shot(page, 'site'); await shot(page, 'site-full', {}, { fullPage: true });
    await go(page, '/donate'); await shot(page, 'donate');
    await ctx.close();
  }

  /* ---------------- the gabbai's drawer: the box and each thing in it, cut out ---------------- */
  if (want('drawer')) {
    const { ctx, page } = await open(browser, { lang, w: 1920, h: 1080, dsf: 2 });
    await go(page, '/drawer');
    await page.click('#dwInvite').catch(() => {});
    await page.waitForTimeout(2600);
    await page.addStyleTag({ content: '.dw-obj{animation:none!important;transition:none!important} .dw-obj.hint{transform:none!important} .dw-obj::after,.dw-obj::before{animation:none!important}' });
    await page.evaluate(() => document.querySelectorAll('.dw-obj.hint').forEach(o => o.classList.remove('hint')));
    await page.waitForTimeout(300);
    const info = await page.evaluate(() => {
      const d = document.querySelector('#dwDrawer').getBoundingClientRect();
      const objs = [...document.querySelectorAll('.dw-obj')].map(o => { const r = o.getBoundingClientRect(); return { cls: o.className.replace('dw-obj', '').trim().split(' ')[0], x: r.x, y: r.y, w: r.width, h: r.height }; });
      return { d: { x: d.x, y: d.y, w: d.width, h: d.height }, objs };
    });
    const pad = 44;
    meta.drawer = { box: info.d, pad, objs: {} };
    // each object alone, on transparency
    for (const o of info.objs) {
      await page.evaluate(cls => {
        let st = document.getElementById('__iso'); if (!st) { st = document.createElement('style'); st.id = '__iso'; document.head.appendChild(st); }
        st.textContent = `html,body{background:transparent!important} body *{visibility:hidden!important} .dw-obj.${cls}, .dw-obj.${cls} *{visibility:visible!important}`;
      }, o.cls);
      await page.waitForTimeout(120);
      const clip = { x: Math.max(0, o.x - pad), y: Math.max(0, o.y - pad), width: o.w + pad * 2, height: o.h + pad * 2 };
      await page.screenshot({ path: `${dir}/dw-${o.cls}.png`, clip, omitBackground: true });
      meta.drawer.objs[o.cls] = { x: clip.x - info.d.x, y: clip.y - info.d.y, w: clip.width, h: clip.height };
      console.log(`  [${lang}] dw-${o.cls}`);
    }
    // the empty drawer (small props stay: pencil, coins, a rubber band)
    await page.evaluate(() => { document.getElementById('__iso').textContent = 'html,body{background:transparent!important} body *{visibility:hidden!important} #dwDrawer, #dwDrawer *{visibility:visible!important} #dwDrawer .dw-obj, #dwDrawer .dw-obj *, #dwDrawer .dw-invite, #dwDrawer .dw-final, #dwDrawer .dw-final *{visibility:hidden!important}'; });
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${dir}/dw-box.png`, clip: { x: info.d.x - 30, y: info.d.y, width: info.d.w + 60, height: info.d.h + 70 }, omitBackground: true });
    meta.drawer.boxClip = { dx: -30, dy: 0, w: info.d.w + 60, h: info.d.h + 70 };
    console.log(`  [${lang}] dw-box`);
    saveMeta();
    await ctx.close();
  }
}
await browser.close();
console.log('done');
