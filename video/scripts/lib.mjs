// Shared helpers for capturing the live demo (fictional data) with Playwright.
import { createRequire } from 'module';
// Playwright from this project if it is installed here, otherwise from the machine's shared tools.
let pw;
try { pw = createRequire(import.meta.url)('playwright'); } catch (e) { pw = createRequire(process.env.PLAYWRIGHT_FROM || '/opt/node-tools/node_modules/')('playwright'); }
export const { chromium } = pw;
export const BASE = process.env.DEMO_URL || 'http://127.0.0.1:8765/index.html';

// Demo-only chrome (the presentation dock, the sales bar, the "request a demo" buttons, the note
// under a simulated notification) is hidden: the film shows the product screens themselves.
export const CLEAN_CSS = `
  #dock, .dock, #salesbar, .salesbar, .cta-demo, .mk-head-cta, .tv-ctl, .tv-demo, .push .who { display: none !important; }
  html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }
  *, *::before, *::after { caret-color: transparent !important; }
`;

export async function open(browser, { lang = 'he', w = 1360, h = 860, dsf = 2, theme = 'classic', role = 'visitor', mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: dsf, isMobile: mobile, hasTouch: mobile,
    locale: lang === 'he' ? 'he-IL' : 'en-US', timezoneId: 'America/New_York',
  });
  await ctx.addInitScript(([lang, theme, role]) => {
    try {
      if (!sessionStorage.getItem('__cap')) {
        localStorage.clear(); sessionStorage.setItem('__cap', '1');
        localStorage.setItem('shulDemo.prefs', JSON.stringify({ lang, theme, role }));
      }
    } catch (e) {}
  }, [lang, theme, role]);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('  pageerror:', e.message));
  return { ctx, page };
}

export async function go(page, hash, { settle = 700 } = {}) {
  await page.goto('about:blank');
  await page.goto(BASE + '#' + hash, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: CLEAN_CSS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(settle);
}
