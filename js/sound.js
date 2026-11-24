/* Shul System sales demo | the drawer's sounds.
   The drawer is a real recording (audio/, from Pixabay, free to use). Paper lifted and put back, keys
   and a plastic remote are made in the browser (Web Audio).
   Browsers play sound only after the visitor clicks or presses a key, so unlock() is called from
   a click. The visitor can turn sound off; the choice is kept in this browser. */
(function () {
  "use strict";
  var KEY = "shulDemo.sound";
  var on = true; try { on = localStorage.getItem(KEY) !== "off"; } catch (e) {}
  var ctx = null, out = null, noiseBuf = null;

  function init() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    out = ctx.createGain(); out.gain.value = .7; out.connect(comp); comp.connect(ctx.destination);
    var len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function unlock() { var c = init(); if (!c) return Promise.resolve(); decodeAll(); return c.state === "suspended" ? c.resume().catch(function () {}) : Promise.resolve(); }
  function live() { return on && ctx && ctx.state === "running"; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* a noise source through a chain of filters into a gain; returns the gain to shape */
  function noise(t0, dur, filters) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var node = s;
    filters.forEach(function (f) { var b = ctx.createBiquadFilter(); b.type = f[0]; b.frequency.value = f[1]; b.Q.value = f[2] || .7; node.connect(b); node = b; f.node = b; });
    var g = ctx.createGain(); g.gain.value = 0; node.connect(g); g.connect(out);
    s.start(t0, rnd(0, 1.5)); s.stop(t0 + dur + .05);
    return g;
  }
  function burst(t0, dur, type, freq, q, peak) {
    var g = noise(t0, dur, [[type, freq, q]]);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + Math.min(.004, dur / 4)); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  }
  function tone(t0, f0, f1, dur, peak, type) {
    var o = ctx.createOscillator(); o.type = type || "sine"; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + .005); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + .02);
  }

  /* the drawer: a real recording (audio/drawer-open.mp3, audio/drawer-close.mp3), fetched with the page
     so it is ready on the first click, decoded once sound is allowed */
  var FILES = { open: "audio/drawer-open.mp3", close: "audio/drawer-close.mp3" }, raw = {}, bufs = {}, decoding = null;
  var top = true; try { top = window.self === window.top; } catch (e) { top = false; }
  Object.keys(FILES).forEach(function (k) { raw[k] = !top ? Promise.resolve(null) : fetch(FILES[k]).then(function (r) { return r.ok ? r.arrayBuffer() : null; }).catch(function () { return null; }); });
  function decodeAll() {
    if (decoding) return decoding;
    decoding = Promise.all(Object.keys(FILES).map(function (k) {
      return raw[k].then(function (ab) { if (!ab) return; return new Promise(function (res) { ctx.decodeAudioData(ab.slice(0), function (b) { bufs[k] = b; res(); }, function () { res(); }); }); });
    }));
    return decoding;
  }
  function drawer(dir) {
    if (!live()) return;
    var asked = ctx.currentTime;
    decodeAll().then(function () {
      var b = bufs[dir === "open" ? "open" : "close"]; if (!b || !live()) return;
      var late = ctx.currentTime - asked; if (late > .6) return; /* too late to match the drawer's movement */
      var src = ctx.createBufferSource(); src.buffer = b;
      var g = ctx.createGain(); g.gain.value = .85; src.connect(g); g.connect(out);
      src.start(ctx.currentTime, Math.min(late, b.duration - .05));
    });
  }

  /* paper: a soft swish with small crinkles in it */
  function paper(heavy, soft) {
    var t0 = ctx.currentTime + .01, D = soft ? .28 : .46, lo = heavy ? 900 : 2000, hi = heavy ? 2600 : 5200, amp = (soft ? .7 : 1.4) * (heavy ? 1.5 : 1);
    var sw = noise(t0, D, [["highpass", heavy ? 500 : 900, .7], ["bandpass", heavy ? 1600 : 3400, .45]]);
    sw.gain.setValueAtTime(0, t0); sw.gain.linearRampToValueAtTime(.07 * amp, t0 + .04); sw.gain.linearRampToValueAtTime(.035 * amp, t0 + D * .6); sw.gain.linearRampToValueAtTime(0, t0 + D);
    var n = soft ? 8 : 24;
    for (var k = 0; k < n; k++) burst(t0 + Math.pow(Math.random(), 1.3) * D, rnd(.005, .028), "bandpass", rnd(lo, hi), rnd(.8, 3), rnd(.1, .38) * amp);
  }
  function keys(soft) {
    var t0 = ctx.currentTime + .01, n = soft ? 4 : 7;
    for (var k = 0; k < n; k++) {
      var t = t0 + rnd(0, soft ? .18 : .34), f = rnd(2300, 4600), a = rnd(.05, .11) * (soft ? .6 : 1);
      [[1, 1], [2.76, .5], [5.4, .25]].forEach(function (p) { tone(t, f * p[0], f * p[0] * .995, rnd(.09, .22), a * p[1], "sine"); });
      burst(t, .012, "highpass", 5000, .7, a * .8);
    }
  }
  function plastic(soft) {
    var t0 = ctx.currentTime + .01;
    var sw = noise(t0, .18, [["bandpass", 1200, .6]]); sw.gain.setValueAtTime(0, t0); sw.gain.linearRampToValueAtTime(.05, t0 + .04); sw.gain.linearRampToValueAtTime(0, t0 + .18);
    var t = t0 + (soft ? .12 : .16);
    burst(t, .03, "bandpass", 1900, 2, soft ? .22 : .32); tone(t, 950, 820, .04, .1); tone(t, 190, 120, .07, soft ? .2 : .28);
  }
  /* an object lifted out, or put back */
  function pick(id, back) {
    if (!live()) return;
    if (id === "keys") keys(back);
    else if (id === "screen") plastic(back);
    else paper(id === "money" || id === "nedarim", back);
  }
  function isOn() { return on; }
  function toggle() {
    on = !on; try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {}
    if (on) { unlock(); setTimeout(function () { if (live()) paper(false, true); }, 60); }
    return on;
  }
  window.SHUL_SOUND = { unlock: unlock, drawer: drawer, pick: pick, isOn: isOn, toggle: toggle };
})();
