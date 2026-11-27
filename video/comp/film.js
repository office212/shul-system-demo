/* The film itself: nine scenes on one timeline.
   Laid out once for Hebrew (text on the right); English mirrors the layout.
   ?fmt=v is the portrait cut (1080 x 1920): the same timeline, with the words centred on top and
   the device under them. Each scene gives its portrait geometry beside the landscape one (V ? a : b).
   The product screens are real captures of the demo (video/scripts/capture.mjs). */
(async function () {
  "use strict";
  var qs = new URLSearchParams(location.search);
  var LANG = qs.get("lang") === "en" ? "en" : "he";
  var HE = LANG === "he", M = HE ? 1 : -1;
  var V = qs.get("fmt") === "v";                           /* the portrait cut */
  var SW = V ? 1080 : 1920, SHT = V ? 1920 : 1080;         /* the stage */
  var C = window.COPY[LANG], CT = window.COPY.contact;
  var stage = document.getElementById("stage");
  stage.dir = C.dir; stage.lang = LANG; if (V) stage.classList.add("v");
  stage.style.setProperty("--o-start", HE ? "right" : "left");
  var tw = FX.tw, set = FX.set, show = FX.show, hook = FX.hook, E = FX.E;

  var META = await (await fetch("../shots/" + LANG + "/meta.json")).json();
  function SH(n, l) { return "../shots/" + (l || LANG) + "/" + n + ".png"; }
  function IMG(n, cls, style, l) { return '<img class="' + (cls || "") + '" decoding="sync" src="' + SH(n, l) + '"' + (style ? ' style="' + style + '"' : "") + ">"; }
  function mx(x, w) { return HE ? x : SW - x - (w || 0); }        /* mirror a left edge */
  function gx(x) { return HE ? x : SW - x; }                      /* mirror a point */
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
  function add(parent, html) { var e = el(html); parent.appendChild(e); return e; }
  function box(e, x, y, w, h) { e.style.left = mx(x, w) + "px"; e.style.top = y + "px"; if (w != null) e.style.width = w + "px"; if (h != null) e.style.height = h + "px"; return e; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function lines(arr, cls) { return arr.map(function (s, i) { var c = Array.isArray(cls) ? cls[i] : cls; return '<span class="ln"><span class="li ' + (c || "") + '">' + s + "</span></span>"; }).join(""); }

  /* cues for the soundtrack: [time, kind] */
  var CUES = []; function cue(t, k, v) { CUES.push([Math.round(t * 1000) / 1000, k, v == null ? 1 : v]); }

  /* ---------- icons ---------- */
  var IC = {
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    cursor: '<svg class="cur" viewBox="0 0 30 30"><path d="M5 3l17.5 9.3-7.4 2.2 4.6 8.7-3.5 1.9-4.6-8.8-5.3 5.5z" fill="#fff" stroke="#10182b" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    receipt: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
    report: '<svg viewBox="0 0 24 24"><path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>',
    letter: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    sheet: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>',
    flame: '<svg viewBox="0 0 24 24"><path d="M12 3c2 3 4 4.5 4 7.5a4 4 0 0 1-8 0C8 8.5 10.500 7 12 3z"/><path d="M9 21h6M10 17h4v4h-4z"/></svg>',
    horn: '<svg viewBox="0 0 24 24"><path d="M4 10v4h3l7 4V6l-7 4z"/><path d="M17.500 9a4 4 0 0 1 0 6"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.500-3.200 8-8 9-4.800-1-8-4.500-8-9V6z"/><path d="M9 12l2.200 2.200L15.500 10"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path d="M7 18a4.500 4.500 0 0 1-.6-8.960A6 6 0 0 1 18 10.500a3.800 3.800 0 0 1-.5 7.500z"/><path d="M12 11v5M9.800 13.800L12 16l2.200-2.200"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.800 3 2.800 15 0 18M12 3c-2.800 3-2.800 15 0 18"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    link: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.800 3 2.800 15 0 18M12 3c-2.800 3-2.800 15 0 18"/></svg>',
    arrow: HE ? '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    candle: '<svg viewBox="0 0 24 30" fill="none"><path d="M12 2c2.400 3 3.600 4.600 3.600 6.600a3.600 3.600 0 0 1-7.200 0C8.400 6.600 9.600 5 12 2z" fill="#ffd27a"/><rect x="9" y="13" width="6" height="14" rx="1.500" fill="#fff4dc"/><path d="M12 10.500V13" stroke="#ffd27a" stroke-width="1.600" stroke-linecap="round"/></svg>'
  };
  function MARK(door) {
    return '<svg class="mark" viewBox="0 0 48 48"><path class="m-out" d="M6.5 43.5V22a17.5 17.5 0 0 1 35 0v21.5z" fill="#fff"/>' +
      '<path class="m-gold" d="M14 43.5V22.5a10 10 0 0 1 20 0v21" fill="none" stroke="#e0a92e" stroke-width="2.6" pathLength="1"/>' +
      '<path class="m-door" d="M20.4 43.5V23a3.6 3.6 0 0 1 7.2 0v20.5z" fill="' + (door || "#0a1730") + '"/></svg>';
  }
  var WORD = '<span class="wordmark"><b>Shul</b> System</span>';
  function kicker(num, text) { return '<div class="kicker">' + (num ? "<b>" + num + "</b>" : "") + "<i></i><span>" + text + "</span></div>"; }

  /* ---------- shared motion ---------- */
  function riseLines(root, t, px, stag, dur) { tw($$(".li", root), t, dur || 0.95, { y: [px, 0] }, "out", stag == null ? 0.11 : stag); }
  function kickIn(k, t) {
    tw($$("i", k), t, 0.6, { sx: [0, 1] }, "out");
    tw($$("span, b", k), t + 0.08, 0.7, { o: [0, 1], x: [26 * M, 0] }, "out", 0.06);
  }
  function fadeUp(target, t, dy, dur, stag) { tw(target, t, dur || 0.8, { o: [0, 1], y: [dy == null ? 28 : dy, 0], blur: [6, 0] }, "out", stag || 0); }
  function fadeOut(target, t, dy, dur, stag) { tw(target, t, dur || 0.45, { o: 0, y: dy == null ? -22 : dy }, "inSoft", stag || 0); }
  function pulse(target, t, amt) { tw(target, t, 0.22, { s: [1, 1 + (amt || 0.05)] }, "outSoft"); tw(target, t + 0.22, 0.5, { s: 1 }, "inOutSoft"); }

  /* a camera over a captured screen: the screen is k times its CSS size inside a view of vw x vh */
  function Cam(camEl, shot, k, vw, vh, oy) {
    oy = oy || 0;
    return {
      el: camEl, k: k,
      pt: function (r) { return [(r[0] + r[2] / 2) * k, (r[1] + r[3] / 2) * k + oy]; },
      to: function (t, dur, r, Z, ease) {
        var cx = (r[0] + r[2] / 2) * k, cy = (r[1] + r[3] / 2) * k, W = shot.w * k, H = shot.h * k;
        Z = Math.max(Z, vw / W, vh / H);                 /* never past the edge of the capture */
        var x = vw / 2 - cx * Z, y = vh / 2 - cy * Z;
        x = Math.min(0, Math.max(vw - W * Z, x)); y = Math.min(0, Math.max(vh - H * Z, y));
        tw(camEl, t, dur, { x: x, y: y, zm: Z }, ease || "cam");
      },
      ring: function (ringEl, r, pad) { pad = pad == null ? 6 : pad; return { "--x": r[0] * k - pad, "--y": r[1] * k - pad + oy, "--w": r[2] * k + pad * 2, "--h": r[3] * k + pad * 2 }; }
    };
  }
  /* a zoom: as given in landscape; in portrait, the size the capture should have on the stage (1 = its CSS size) */
  function Zs(k, zl, sv) { return V ? sv / k : zl; }
  function union(a, b) { var x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]); return [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y]; }
  /* a pointer that lives inside a camera, in the screen's own coordinates */
  function Pointer(cam, kind) {
    var p = add(cam.el, kind === "tap" ? '<div class="tap"></div>' : IC.cursor);
    var c = add(cam.el, '<div class="clk"></div>');
    tw(p, 0, 0.001, { o: [0, 0] }); tw(c, 0, 0.001, { o: [0, 0] });
    var api = {
      el: p,
      at: function (t, pt) { set(p, t, { x: pt[0], y: pt[1] }); return api; },
      show: function (t) { tw(p, t, 0.25, { o: 1 }); return api; },
      hide: function (t) { tw(p, t, 0.25, { o: 0 }); return api; },
      move: function (t, dur, pt, ease) { tw(p, t, dur, { x: pt[0], y: pt[1] }, ease || "inOut"); return api; },
      size: function (t, s) { set(p, t, { s: s }); return api; },
      click: function (t, pt, s) {
        s = s || 1;
        tw(p, t - 0.07, 0.07, { s: 0.82 * s }, "outSoft"); tw(p, t, 0.22, { s: s }, "out");
        set(c, t - 0.001, { x: pt[0], y: pt[1] });
        tw(c, t, 0.5, { s: [0.25 * s, 1.5 * s], o: [0.95, 0] }, "outQuart");
        cue(t, "click");
        return api;
      }
    };
    return api;
  }
  /* a phone: every captured screen gets the status bar of an installed app above it */
  var SB = '<span class="tm">3:00</span><span class="ic"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.500" width="3" height="6.500" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg><svg viewBox="0 0 17 12"><path d="M8.500 2.600c2.300 0 4.400.9 6 2.400l1.100-1.200A10.300 10.300 0 0 0 8.500.900C5.800.900 3.300 2 1.400 3.800l1.100 1.200a8.600 8.600 0 0 1 6-2.400zm0 3.400c1.400 0 2.700.5 3.700 1.400l1.100-1.200a7 7 0 0 0-9.600 0l1.100 1.200c1-.9 2.300-1.400 3.700-1.400zm0 3.300c-.7 0-1.400.300-1.900.700l1.900 2 1.900-2c-.5-.4-1.200-.7-1.900-.7z"/></svg><svg viewBox="0 0 27 12"><rect x=".500" y=".500" width="22" height="11" rx="3.200" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="19" height="8" rx="1.900"/><path d="M24 4v4c.8-.3 1.300-1.100 1.300-2S24.800 4.300 24 4z" opacity=".5"/></svg></span>';
  function sbH(VW) { return Math.round(VW * 0.118); }
  function scr(name, cls) { return '<div class="scr ' + (cls || "") + '"><div class="sb">' + SB + "</div>" + IMG(name) + "</div>"; }
  function phone(size, VW, inner) {
    var h = sbH(VW);
    return '<div class="ph ' + (size || "") + '" style="--vw:' + VW + "px;--sb:" + h + 'px"><div class="view"><div class="cam" style="width:' + VW + "px;height:" + (h + 932 * VW / 430) + 'px">' + inner + '</div></div><span class="ph-island"></span></div>';
  }
  function phoneH(VW) { return sbH(VW) + 932 * VW / 430; }
  /* the bar takes the color of the screen under it */
  function tintBars() {
    var cv = document.createElement("canvas"); cv.width = cv.height = 1; var cx = cv.getContext("2d", { willReadFrequently: true });
    $$(".scr").forEach(function (sc) {
      var im = $("img", sc); try { cx.drawImage(im, 6, 6, 2, 2, 0, 0, 1, 1); var d = cx.getImageData(0, 0, 1, 1).data; var lum = 0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2];
        sc.style.background = "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")"; $(".sb", sc).style.color = lum > 140 ? "#10182b" : "#fff"; } catch (e) {}
    });
  }
  /* portrait: the "saved" toast sits at the foot of the window itself, whatever the camera is looking at */
  function pinToast(img, win, W, m) {
    var w = m.w * 0.9; img.style.cssText = "position:absolute;z-index:9;left:" + (W - w) / 2 + "px;bottom:-2px;width:" + w + "px";
    $(".view", win).appendChild(img);
  }
  function browser(url, viewH) {
    return '<div class="bw"><div class="bw-bar"><i></i><i></i><i></i><span class="bw-url">' + IC.lock + url + '</span></div><div class="view" style="height:' + viewH + 'px"><div class="cam"></div></div></div>';
  }

  /* =====================================================================
     the backdrop
     ===================================================================== */
  var archD = (V ? [220, 360, 500, 640, 800, 980] : [260, 420, 580, 740, 900]).map(function (a, i) {
    var cx = SW / 2, top = (V ? 1560 : 800) - a * 0.1, bot = SHT + 10;
    return '<path' + (i === 1 ? ' class="g"' : "") + ' d="M' + (cx - a) + " " + bot + "V" + top + "A" + a + " " + a + " 0 0 1 " + (cx + a) + " " + top + "V" + bot + '"/>';
  }).join("");
  add(stage, '<div id="bg"></div>');
  var glowA = add(stage, '<div class="glow" id="glowA"></div>'), glowB = add(stage, '<div class="glow" id="glowB"></div>'), glowC = add(stage, '<div class="glow" id="glowC"></div>');
  var tints = add(stage, '<div id="tints"></div>');
  add(stage, '<svg id="arches" viewBox="0 0 ' + SW + " " + SHT + '">' + archD + "</svg>");
  var dust = add(stage, '<div id="dust"></div>');
  add(stage, '<div id="vig"></div>'); add(stage, '<div id="grain"></div>'); add(stage, '<div id="black"></div>');
  var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  var motes = []; for (var i = 0; i < 34; i++) { var m = add(dust, "<i></i>"); motes.push({ el: m, x: rnd() * SW, y: rnd() * (SHT + 100), sp: 9 + rnd() * 22, ph: rnd() * 6.28, sz: 0.5 + rnd() * 1.5, tw: 0.4 + rnd() * 0.9 }); }
  hook(function (t) {
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i], MH = SHT + 100, y = ((m.y - t * m.sp) % MH + MH) % MH - 50, x = m.x + 34 * Math.sin(t * 0.32 + m.ph);
      m.el.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) scale(" + m.sz + ")";
      m.el.style.opacity = (0.16 + 0.34 * (0.5 + 0.5 * Math.sin(t * m.tw + m.ph * 3))).toFixed(3);
    }
  });
  tw(dust, 8, 1.2, { o: [0, 1] });
  tw("#arches", 8, 64, { s: [1, 1.16] }, "linear");
  /* where the two soft lights sit in each scene: [time, ax, ay, bx, by] */
  (V ? [[8, 540, 640, 540, 1560], [12.4, 540, 1060, 880, 1740], [22.4, 540, 1080, 170, 330], [31.2, 540, 1130, 910, 1780], [41.2, 540, 1140, 910, 420], [50, 540, 1020, 540, 170], [57.4, 540, 520, 540, 1750], [62.4, 540, 760, 540, 1290]]
     : [[8, 960, 380, 960, 900], [12.4, 560, 470, 1560, 930], [22.4, 1330, 500, 330, 960], [31.2, 600, 500, 1600, 190], [41.2, 800, 560, 1640, 900], [50, 960, 640, 960, 60], [57.4, 960, 250, 960, 1040], [62.4, 960, 400, 960, 760]]).forEach(function (g, i) {
    if (i === 0) { set(glowA, 0, { x: gx(g[1]), y: g[2] }); set(glowB, 0, { x: gx(g[3]), y: g[4] }); return; }
    tw(glowA, g[0], 1.6, { x: gx(g[1]), y: g[2] }, "inOut"); tw(glowB, g[0], 1.6, { x: gx(g[3]), y: g[4] }, "inOut");
  });
  set(glowC, 0, { x: gx(V ? 540 : 660), y: V ? 1090 : 520, o: 0 });

  /* =====================================================================
     1 · the gabbai's drawer  (0 - 8.9)
     ===================================================================== */
  (function () {
    var D = META.drawer;
    var s = add(stage, '<section class="scene" id="s1"><div class="s1-world"><div class="s1-floor"></div><div class="s1-spot"></div>' +
      '<div class="s1-wrap"><div class="s1-drw">' + IMG("dw-box", "box") + "</div></div><div class=\"s1-desk\"></div></div>" +
      '<div class="s1-copy"><div class="kicker"><i></i><span>' + C.s1.kicker + "</span><i></i></div>" +
      '<h1 class="s1-h">' + C.s1.words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join("") + "</h1>" +
      '<p class="s1-sub">' + C.s1.sub + "</p></div>" +
      '<div class="s1-after"><h1 class="s1-h"><span class="w">' + C.s1.after[0] + '</span><span class="w goldgrad" style="text-shadow:none">' + C.s1.after[1] + "</span></h1></div></section>");
    var drw = $(".s1-drw", s), obj = {};
    Object.keys(D.objs).forEach(function (k) { var o = D.objs[k]; obj[k] = add(drw, IMG("dw-" + k, "dwo", "left:" + o.x + "px;top:" + o.y + "px;width:" + o.w + "px;height:" + o.h + "px")); });
    show(s, 0, 8.98);
    tw("#black", 0, 0.6, { o: [0.2, 0] }, "outSoft");
    tw($(".s1-world", s), 0, 9, { s: [1, 1.075] }, "linear");
    tw($(".s1-spot", s), 0.1, 2, { o: [0.25, 1] });
    /* the drawer slides out from under the desk */
    tw(drw, 0.05, 1.35, { y: [-345, 0] }, "outSoft"); cue(0.02, "drawerOpen");
    var k = $(".kicker", s);
    tw($$("i", k), 0.1, 0.9, { sx: [0.35, 1] }, "out");
    /* each word, and the thing it names lifts for a moment */
    function lift(key, t, amt, rot) { amt = amt || 1; tw(obj[key], t, 0.5, { s: [1, 1 + 0.12 * amt], y: [0, -18 * amt], r: [0, rot || 0] }, "back"); tw(obj[key], t + 0.62, 0.6, { s: 1, y: 0, r: 0 }, "inOutSoft"); cue(t, "paper", amt); }
    var W = $$(".s1-copy .w", s);
    [[1.55, "o-note", 2.6], [2.3, "o-env", -2], [3.05, "o-pad", 2.2]].forEach(function (x, i) { fadeUp(W[i], x[0], 34, 0.75); lift(x[1], x[0] + 0.02, 1.15, x[2]); });
    fadeUp($(".s1-sub", s), 4.05, 20, 0.8);
    [["o-card", -1.6], ["o-flyer", 1.8], ["o-keys", -2.4], ["o-remote", 2]].forEach(function (x, i) { lift(x[0], 4.12 + i * 0.16, 0.7, x[1]); });
    /* everything is picked up, one thing after another */
    fadeOut($(".s1-copy", s), 5.55, -18, 0.45);
    ["o-note", "o-env", "o-pad", "o-flyer", "o-card", "o-remote", "o-keys"].forEach(function (key, i) {
      var t = 5.7 + i * 0.14;
      tw(obj[key], t, 0.66, { s: 1.5, y: -150, o: [1, 0], blur: [0, 9], r: (i % 2 ? 7 : -7) }, "in"); cue(t, "pick", 1 - i * 0.08);
    });
    var A = $$(".s1-after .w", s);
    fadeUp(A[0], 6.15, 34, 0.8); fadeUp(A[1], 6.5, 34, 0.9);
    /* and the drawer closes */
    tw(drw, 7.5, 0.85, { y: -690 }, "inOut"); cue(7.5, "drawerClose");
    fadeOut($(".s1-after", s), 8.05, -16, 0.4);
  })();

  /* =====================================================================
     2 · the mark  (8.1 - 12.6)   opens through an arch
     ===================================================================== */
  (function () {
    var s = add(stage, '<section class="scene" id="s2" style="background:linear-gradient(160deg,#0b1a36 0%,#081226 55%,#050b17 100%)">' +
      '<div class="s2-halo"></div><div class="s2-rays"></div><div class="s2-mark">' + MARK() + "</div>" +
      '<div class="s2-word">' + WORD + "<small>" + C.brandSub + "</small></div>" +
      '<div class="s2-tag"><h1 class="h">' + lines(C.s2.tag, ["", "goldgrad"]).replace("</span></span><span", "</span></span> <span") + "</h1></div></section>");
    var iris = add(stage, '<svg id="iris" viewBox="0 0 ' + SW + " " + SHT + '"><path d=""/></svg>'), ip = $("path", iris);
    var T0 = 8.1, T1 = 9.0, ease = FX.bezier(0.7, 0, 0.3, 1);
    show(s, T0, 12.66); show(iris, T0, T1 + 0.05);
    hook(function (t) {
      if (t < T0 || t > T1 + 0.05) { if (s.style.clipPath) s.style.clipPath = ""; return; }
      var p = ease(Math.min(1, (t - T0) / (T1 - T0)));
      var r = 4 + (V ? 1900 : 1800) * p, cx = SW / 2, cy = V ? 690 + 1050 * p : 372 + 830 * p, by = cy + r * 1.25;
      var d = "M" + (cx - r).toFixed(1) + " " + by.toFixed(1) + "L" + (cx - r).toFixed(1) + " " + cy.toFixed(1) + "A" + r.toFixed(1) + " " + r.toFixed(1) + " 0 0 1 " + (cx + r).toFixed(1) + " " + cy.toFixed(1) + "L" + (cx + r).toFixed(1) + " " + by.toFixed(1) + "Z";
      s.style.clipPath = p >= 1 ? "" : 'path("' + d + '")';
      ip.setAttribute("d", d); ip.style.opacity = Math.max(0, 1 - Math.max(0, p - 0.55) / 0.4).toFixed(3);
    });
    cue(T0, "whoosh", 1); cue(8.8, "hit", 1);
    var mark = $(".s2-mark", s), gold = $(".m-gold", s);
    gold.style.strokeDasharray = "1"; gold.style.strokeDashoffset = "calc(var(--d, 0) * 1)";
    tw(mark, 8.22, 1.15, { s: [0.35, 1], o: [0, 1] }, "back");
    tw(gold, 8.8, 1.0, { "--d": [1, 0] }, "inOut");
    tw($(".m-door", s), 8.85, 0.6, { o: [0, 1] });
    tw($(".s2-halo", s), 8.15, 1.6, { s: [0.2, 1], o: [0, 1] }, "out"); tw($(".s2-halo", s), 9.9, 2.8, { s: 1.12 }, "inOutSoft");
    tw($(".s2-rays", s), 8.6, 1.4, { o: [0, 0.7] }); tw($(".s2-rays", s), 8.1, 4.6, { r: [0, 20] }, "linear");
    fadeUp($(".s2-word .wordmark", s), 9.3, 26, 0.8); fadeUp($(".s2-word small", s), 9.5, 18, 0.8);
    riseLines($(".s2-tag", s), 10.0, 170, 0.16, 1.05); cue(10.0, "swell");
    /* out: the words leave, the room dims to the shared backdrop */
    tw($$(".s2-tag .li", s), 12.02, 0.5, { y: -170 }, "in", 0.05);
    tw([mark, $(".s2-word", s)], 12.0, 0.5, { o: 0, s: 0.92 }, "inSoft");
    tw(s, 12.15, 0.5, { o: [1, 0] }, "inOutSoft");
  })();

  /* the small mark that stays in the corner through the product scenes */
  (function () {
    var b = add(stage, '<div id="bug">' + MARK() + WORD + "</div>");
    if (V) { b.style.left = "0"; b.style.right = "0"; b.style.top = "126px"; b.style.justifyContent = "center"; }
    else if (HE) b.style.left = "72px"; else b.style.right = "72px";
    show(b, 12.6, 62.7);
    tw(b, 12.75, 0.8, { o: [0, 0.94], y: [-16, 0] }, "out"); tw(b, 62.2, 0.4, { o: 0 });
  })();

  /* a block of text for the product scenes */
  function textBlock(scene, x, y, w, num, kick, hl, size, cls) {
    var t = box(add(scene, '<div class="txt">' + kicker(num, kick) + '<h1 class="h" style="font-size:' + size + 'px">' + lines(hl, cls) + "</h1></div>"), x, y, w);
    return t;
  }

  /* =====================================================================
     3 · the screen in the shul  (12.5 - 22.5)
     ===================================================================== */
  (function () {
    var a = 12.5, s = add(stage, '<section class="scene" id="s3"></section>');
    var W = V ? 1010 : 1150, VW = W - 24, k = VW / 1920, VH = 1080 * k, H = VH + 24, X = V ? 35 : 84, Y = V ? 850 : 190;
    var R = META["tv-day"].rects, cr = R.center;
    var p = box(add(s, '<div class="p3d"><div class="body">' + IMG("tv-day", "amb a1") + IMG("tv-shabbat", "amb a2") +
      '<div class="tvf"><div class="view"><div class="cam" style="width:' + VW + "px;height:" + VH + 'px">' + IMG("tv-day", "st") +
      IMG("tv-board-2", "cut b1", "left:" + cr[0] * k + "px;top:" + cr[1] * k + "px;width:" + cr[2] * k + "px") +
      IMG("tv-board-4", "cut b2", "left:" + cr[0] * k + "px;top:" + cr[1] * k + "px;width:" + cr[2] * k + "px") +
      IMG("tv-shabbat", "st sh") +
      '<svg class="dimmer" viewBox="0 0 ' + VW + " " + VH + '"><path fill-rule="evenodd"/></svg><div class="ring">' + C.s3.tags.map(function (t) { return '<span class="tag" style="transform:translateX(-50%)"><span>' + t + "</span></span>"; }).join("") + "</div>" +
      '<div class="sheen"></div><div class="off"></div></div></div></div></div></div>'), X, Y, W, H);
    var body = $(".body", p), cam = Cam($(".cam", p), META["tv-day"], k, VW, VH), ring = $(".ring", p), tags = $$(".tag", p);
    if (V) { var names = add(s, '<div class="abs" style="left:0;right:0;top:' + (Y - 44) + 'px;height:0"></div>'); tags.forEach(function (t) { names.appendChild(t); }); }
    var txt = V ? textBlock(s, 60, 256, 960, "01", C.s3.kicker, C.s3.h.concat([C.s3.also]), HE ? 116 : 98, ["", "", "goldgrad"])
                : textBlock(s, 1296, 300, 540, "01", C.s3.kicker, C.s3.h.concat([C.s3.also]), HE ? 100 : 76, ["", "", "goldgrad"]);
    var li = $$(".li", txt);
    var cap = add(s, '<div class="abs" style="left:' + mx(X, W) + "px;width:" + W + "px;top:" + (Y + H + (V ? 50 : 40)) + 'px;text-align:center"><span class="cap">' + IC.candle + "<span>" + C.s3.cap + "</span></span></div>");
    show(s, a - 0.15, 22.95);
    /* the screen comes on */
    if (V) { tw(body, a, 1.5, { o: [0, 1], s: [1.1, 1], ry: [10 * M, 4 * M], rx: [7, 2], y: [80, 0] }, "out"); tw(body, a + 1.5, 8.4, { ry: 2 * M, rx: 1 }, "inOutSoft"); }
    else { tw(body, a, 1.5, { o: [0, 1], s: [1.12, 1], ry: [17 * M, 8 * M], rx: [5, 2], x: [-70 * M, 0] }, "out"); tw(body, a + 1.5, 8.4, { ry: 4.5 * M, rx: 1.2 }, "inOutSoft"); }
    tw($(".off", p), a + 0.3, 0.7, { o: [1, 0] }, "inOutSoft"); cue(a + 0.3, "on");
    tw($(".a1", p), a + 0.4, 1.3, { o: [0, 0.5] }); set($(".a2", p), 0, { o: 0 });
    kickIn($(".kicker", txt), a + 0.5); tw([li[0], li[1]], a + 0.65, 0.95, { y: [150, 0] }, "out", 0.12); set(li[2], 0, { y: 150 });
    /* four things on it, one after another */
    var spots = [R.zmanim, R.prayers, R.center, R.qr], st = [14.375, 15.625, 16.875, 18.125];   /* on the beat */
    set(ring, 0, Object.assign({ o: 0, "--dim": 0 }, cam.ring(ring, spots[0], -4)));
    tw(ring, st[0], 0.4, { o: 1, "--dim": 1 }); cue(st[0], "tick");
    spots.forEach(function (r, i) { if (i) { tw(ring, st[i], 0.6, cam.ring(ring, r, -4), "inOut"); cue(st[i], "tick"); } tw(tags[i], st[i] + (i ? 0.32 : 0.15), 0.3, { o: [0, 1] }); tw(tags[i], (st[i + 1] || 19.1) - 0.06, 0.2, { o: 0 }); });
    tw(ring, 19.1, 0.35, { o: 0, "--dim": 0 });
    if (V) {
      var col = function (r) { return [r[0], 150, r[2], 856]; };
      cam.to(st[0] - 0.45, 0.85, col(spots[0]), 1.28);
      cam.to(st[1], 0.6, col(spots[1]), 1.28, "inOut"); cam.to(st[2], 0.6, col(spots[2]), 1.28, "inOut");
      cam.to(st[3], 0.6, [0, 560, 640, 520], 1.5, "inOut");
      cam.to(19.0, 0.75, [0, 0, 1920, 1080], 1, "inOut");
    }
    var dpath = $(".dimmer path", p);
    hook(function (t) {
      if (t < 14 || t > 19.6) { dpath.style.opacity = 0; return; }
      var g = function (n) { return parseFloat(ring.style.getPropertyValue(n)) || 0; }, x = g("--x") - 3, y = g("--y") - 3, w = g("--w") + 6, h = g("--h") + 6, r = 16;
      dpath.setAttribute("d", "M-20 -20H" + (VW + 20) + "V" + (VH + 20) + "H-20Z M" + (x + r) + " " + y + "H" + (x + w - r) + "A" + r + " " + r + " 0 0 1 " + (x + w) + " " + (y + r) + "V" + (y + h - r) + "A" + r + " " + r + " 0 0 1 " + (x + w - r) + " " + (y + h) + "H" + (x + r) + "A" + r + " " + r + " 0 0 1 " + x + " " + (y + h - r) + "V" + (y + r) + "A" + r + " " + r + " 0 0 1 " + (x + r) + " " + y + "Z");
      dpath.style.opacity = g("--dim");
    });
    tw($(".b1", p), 17.2, 0.4, { o: [0, 1] }); tw($(".b2", p), 17.8, 0.4, { o: [0, 1] });
    /* candle lighting: the screen turns to Shabbat on its own */
    var sheen = $(".sheen", p); tw(sheen, 19.3, 1.25, { x: [-620, V ? 1150 : 1300], o: [0, 1] }, "inOutSoft"); tw(sheen, 20.3, 0.3, { o: 0 });
    tw($(".sh", p), 19.45, 0.85, { o: [0, 1] }, "inOutSoft"); cue(19.375, "shimmer");
    tw($(".a2", p), 19.45, 1.2, { o: 0.62 }); tw($(".a1", p), 19.45, 1.2, { o: 0 });
    tw(glowC, 19.375, 1.4, { o: 1 }, "inOutSoft"); tw(glowC, 21.9, 0.8, { o: 0 });
    tw(li[2], 19.6, 1.0, { y: 0 }, "out");
    fadeUp($(".cap", cap), 20.0, 26, 0.8);
    /* out */
    tw(body, 21.95, 0.55, V ? { y: 130, o: 0 } : { x: -150 * M, o: 0 }, "in"); fadeOut(txt, 21.95, -26, 0.45); fadeOut(cap, 21.95, 20, 0.4);
    cue(21.95, "whoosh", 0.7);
  })();

  /* =====================================================================
     4 · "Mincha moved? Change it once."  (22.5 - 31.25)
     ===================================================================== */
  (function () {
    var a = 22.5, s = add(stage, '<section class="scene" id="s4"></section>');
    /* in portrait the window is taller than the capture is wide, so the camera always stays a little closer */
    var W = V ? 1000 : 1110, k = W / 1360, IH = 860 * k, VH = V ? 760 : IH, H = VH + 46, X = V ? 40 : 730, Y = V ? 690 : 168, ps = V ? 0.78 : 1;
    var m0 = META["times-0"].rects, m1 = META["times-1"].rects, tt = META["toast-times"];
    var p = box(add(s, '<div class="p3d"><div class="body">' + browser("admin.kehillatnachalathaemek.org", VH) + "</div></div>"), X, Y, W, H);
    var body = $(".body", p), camEl = $(".cam", p); camEl.style.width = W + "px"; camEl.style.height = IH + "px";
    /* the page's small live preview is too coarse for a close-up, so a sharp capture of the very same screen lies over it */
    var ts = m0.tvstage, tvpos = "left:" + ts[0] * k + "px;top:" + ts[1] * k + "px;width:" + ts[2] * k + "px";
    camEl.innerHTML = IMG("times-0", "st") + IMG("tvmin-before", "cut", tvpos) + IMG("times-1", "st s1") + IMG("times-2", "st s2") + IMG("times-3", "st s3") + IMG("tvmin-after", "cut tvhi", tvpos) +
      IMG("toast-times", "cut toast", "left:" + tt.at[0] * k + "px;top:" + tt.at[1] * k + "px;width:" + tt.w * k + "px") +
      '<div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>';
    var cam = Cam(camEl, META["times-0"], k, W, VH), ptr = Pointer(cam);
    cam.to(0, 0.001, union(m0.row, m0.tv), 0);
    var txt = V ? textBlock(s, 60, 244, 960, "02", C.s4.kicker, [C.s4.h[0], C.s4.h[1] + " " + C.s4.h[2]], HE ? 112 : 100, ["", "goldgrad"])
                : textBlock(s, 104, 286, 580, "02", C.s4.kicker, C.s4.h, HE ? 100 : 84, ["", "goldgrad", "goldgrad"]);
    var li = $$(".li", txt);
    var sub = add(txt, '<p class="sub" style="max-width:' + (V ? 900 : 520) + 'px">' + C.s4.sub + "</p>");
    show(s, a - 0.15, 31.7);
    if (V) { tw(body, a, 1.3, { o: [0, 1], y: [150, 0], ry: [-8 * M, -3 * M], rx: [6, 1.5], s: [0.94, 1] }, "out"); tw(body, a + 1.3, 7.2, { ry: -1.5 * M, rx: 0.8 }, "inOutSoft"); }
    else { tw(body, a, 1.3, { o: [0, 1], x: [170 * M, 0], ry: [-16 * M, -7 * M], rx: [4, 1.5], s: [0.94, 1] }, "out"); tw(body, a + 1.3, 7.2, { ry: -3.5 * M, rx: 0.8 }, "inOutSoft"); }
    kickIn($(".kicker", txt), a + 0.4); tw(li[0], a + 0.55, 0.95, { y: [150, 0] }, "out"); set(li.slice(1), 0, { y: 150 });
    /* to the Mincha row, and press Edit */
    var edit = cam.pt(m0.edit), start = [edit[0] + 230, edit[1] + 190];
    cam.to(23.55, 0.9, m0.row, Zs(k, 1.55, 1.7));
    ptr.size(0, 0.8 * ps).at(0, start).show(23.75).move(23.9, 0.65, edit).click(24.62, edit, 0.8 * ps);
    tw($(".s1", camEl), 24.7, 0.2, { o: [0, 1] });
    cam.to(24.78, 0.75, m1.modal, Zs(k, 1.36, 1.5));
    /* 4:15 becomes 4:20 */
    var r1 = $(".r1", camEl); set(r1, 0, Object.assign({ o: 0 }, cam.ring(r1, m1.time, 5)));
    var tf = cam.pt([m1.time[0] + m1.time[2] * (HE ? 0.62 : 0.38), m1.time[1], 0, m1.time[3]]);
    ptr.move(24.92, 0.45, tf).click(25.42, tf, 0.85 * ps);
    tw(r1, 25.42, 0.25, { o: 1 }); tw($(".s2", camEl), 25.85, 0.14, { o: [0, 1] }); pulse(r1, 25.85, 0.05); cue(25.85, "type"); tw(r1, 26.3, 0.25, { o: 0 });
    var save = cam.pt(m1.save);
    ptr.move(26.0, 0.48, save).click(26.58, save, 0.85 * ps).hide(26.85);
    tw([$(".s3", camEl), $(".tvhi", camEl)], 26.66, 0.22, { o: [0, 1] }); cue(26.7, "save");
    tw(li.slice(1), 26.72, 0.95, { y: 0 }, "out", 0.12);
    /* saved: the row, and the live preview of the screen beside it */
    cam.to(26.78, 0.85, union(m0.row, m0.tv), Zs(k, 1.16, 0.95));
    var toast = $(".toast", camEl); if (V) pinToast(toast, p, W, tt);
    tw(toast, 26.9, 0.5, { o: [0, 1], y: [34, 0] }, "back"); tw(toast, 28.35, 0.3, { o: 0 });
    var r2 = $(".r2", camEl), r3 = $(".r3", camEl);
    set(r2, 0, Object.assign({ o: 0 }, cam.ring(r2, m0.time, 9))); set(r3, 0, Object.assign({ o: 0 }, cam.ring(r3, m0.tv, 7)));
    tw([r2, r3], 27.35, 0.3, { o: 1 }, "out", 0.12); pulse(r2, 27.4, 0.08); cue(27.35, "tick");
    tw(r2, 28.0, 0.3, { o: 0 });
    cam.to(28.05, 1.0, m0.tv, Zs(k, 2.12, 2.0));
    fadeUp(sub, 28.3, 22, 0.8);
    tw(r3, 30.6, 0.3, { o: 0 });
    /* and on the shul's website, on a phone */
    var ta = META["times-m-after"], PV = V ? 250 : 262, pk = PV / 430, PX = V ? 778 : 1622, PY = V ? 1052 : 392;
    var ph = box(add(s, '<div class="p3d" style="z-index:5"><div class="body">' + phone("xs", PV, scr("times-m-after") + '<div class="ring r4"></div>') + "</div></div>"), PX, PY, PV + 16, phoneH(PV) + 16);
    var PM = V ? 1 : M, sideR = V || HE;      /* portrait: the screen's davening times are on its left in both languages, so the phone always stands on the right */
    if (V) ph.style.left = PX + "px";
    var phb = $(".body", ph), pcam = Cam($(".cam", ph), ta, pk, PV, phoneH(PV), sbH(PV)), r4 = $(".r4", ph);
    set(r4, 0, Object.assign({ o: 0 }, pcam.ring(r4, ta.rects.row, 3))); r4.style.borderRadius = "9px"; r4.style.borderWidth = "2.5px";
    tw(phb, 28.95, 0.9, { o: [0, 1], y: [120, 0], s: [0.8, 1], r: [7 * PM, 2.5 * PM] }, "back"); cue(28.95, "pop");
    tw(r4, 29.5, 0.3, { o: 1 }); pulse(r4, 29.55, 0.06);
    var l1 = add(s, '<span class="lbl">' + C.s4.site + "</span>"); l1.style.top = (PY - 62) + "px"; if (sideR) l1.style.right = (SW - PX - PV - 16) + "px"; else l1.style.left = (SW - PX - PV - 16) + "px";
    fadeUp(l1, 29.25, 16, 0.6);
    var l2 = add(s, '<span class="lbl">' + C.s4.screen + "</span>"); l2.style.top = (Y - 34) + "px"; if (sideR) l2.style.left = (X + (V ? 36 : 150)) + "px"; else l2.style.right = (X + (V ? 36 : 150)) + "px";
    fadeUp(l2, 28.75, 16, 0.6);
    /* out */
    tw(body, 30.72, 0.55, V ? { y: 160, o: 0 } : { x: 160 * M, o: 0 }, "in"); tw(phb, 30.68, 0.5, { y: 140, o: 0 }, "in"); fadeOut([txt, l1, l2], 30.7, -26, 0.45);
    cue(30.72, "whoosh", 0.7);
  })();

  /* =====================================================================
     5 · Shabbat nedarim: one table, one save  (31.25 - 41.25)
     ===================================================================== */
  (function () {
    var a = 31.25, s = add(stage, '<section class="scene" id="s5"></section>');
    var W = V ? 1000 : 1110, k = W / 1360, IH = 860 * k, VH = V ? 760 : IH, H = VH + 46, X = V ? 40 : 84, Y = V ? 770 : 168, ps = V ? 0.85 : 1;
    var n0 = META["ned-0"], rows = n0.rows, nc = META["ned-check"].rects, nr = META["ned-review"].rects, ow = META.owes, tn = META["toast-ned"];
    var p = box(add(s, '<div class="p3d"><div class="body">' + browser("admin.kehillatnachalathaemek.org", VH) + "</div></div>"), X, Y, W, H);
    var body = $(".body", p), camEl = $(".cam", p); camEl.style.width = W + "px"; camEl.style.height = IH + "px";
    var html = IMG("ned-0", "st"); for (var i = 1; i <= 7; i++) html += IMG("ned-" + i, "st n" + i);
    html += IMG("ned-check", "st nc") + IMG("ned-review", "st nrv") + IMG("owes", "st ow");
    html += ow.rows.slice(0, 6).map(function (r) { return '<div class="hl" style="left:' + r[0] * k + "px;top:" + r[1] * k + "px;width:" + r[2] * k + "px;height:" + r[3] * k + 'px"></div>'; }).join("");
    html += IMG("toast-ned", "cut toast", "left:" + tn.at[0] * k + "px;top:" + tn.at[1] * k + "px;width:" + tn.w * k + "px");
    camEl.innerHTML = html;
    var cam = Cam(camEl, n0, k, W, VH), ptr = Pointer(cam);
    var F5 = V ? (HE ? [60, 112, 108] : [50, 98, 92]) : (HE ? [56, 100, 96] : [46, 86, 80]);   /* the lead-in, the first headline, the second */
    var txt = box(add(s, '<div class="txt">' + kicker("03", C.s5.kicker) + '<div class="swap" style="height:' + (V ? 450 : 520) + 'px"><div class="one" style="width:100%"><p class="line2" style="font-size:' + F5[0] + 'px;color:rgba(247,242,232,.72);margin-bottom:10px"><span class="ln"><span class="li">' + C.s5.pre + '</span></span></p><h1 class="h" style="font-size:' + F5[1] + 'px">' + lines(C.s5.h, ["", "goldgrad"]) + '</h1><p class="sub" style="margin-top:' + (V ? 26 : 34) + 'px">' + C.s5.sub + '</p></div><div class="two" style="width:100%"><h1 class="h" style="font-size:' + F5[2] + 'px">' + lines(C.s5.h2, ["", "goldgrad"]) + '</h1><div class="chips" style="margin-top:40px">' + [["receipt", 0], ["report", 1], ["letter", 2]].map(function (c) { return '<span class="chip">' + IC[c[0]] + C.s5.chips[c[1]] + "</span>"; }).join("") + "</div></div></div></div>"), V ? 60 : 1262, V ? 244 : 268, V ? 960 : 580);
    var one = $$(".one .li", txt), two = $$(".two .li", txt), sub = $(".sub", txt), chips = $$(".chip", txt);
    show(s, a - 0.15, 41.7);
    cam.to(0, 0.001, [n0.rects.table[0], 150, n0.rects.table[2], 560], 0);
    if (V) { tw(body, a, 1.3, { o: [0, 1], y: [150, 0], ry: [8 * M, 3 * M], rx: [6, 1.5], s: [0.94, 1] }, "out"); tw(body, a + 1.3, 8, { ry: 1.5 * M, rx: 0.8 }, "inOutSoft"); }
    else { tw(body, a, 1.3, { o: [0, 1], x: [-170 * M, 0], ry: [16 * M, 7 * M], rx: [4, 1.5], s: [0.94, 1] }, "out"); tw(body, a + 1.3, 8, { ry: 3.5 * M, rx: 0.8 }, "inOutSoft"); }
    kickIn($(".kicker", txt), a + 0.4); tw(one, a + 0.55, 0.95, { y: [150, 0] }, "out", 0.11); set(two, 0, { y: 150 }); set(sub, 0, { o: 0 }); set(chips, 0, { o: 0 });
    /* row after row */
    var table = V ? n0.rects.card : n0.rects.table, top = [table[0], 150, table[2], 560], bot = [table[0], 300, table[2], 560];   /* portrait: the whole card, so the page's heading is not cut */
    cam.to(a + 1.0, 0.9, top, Zs(k, 1.2, 0.955));
    cam.to(33.3, 1.9, bot, Zs(k, 1.2, 0.955), "inOutSoft");
    var t0 = 32.75, step = 0.34, first = cam.pt(rows[0].amt);
    ptr.size(0, 0.85 * ps).at(0, [first[0] + 150, first[1] + 210]).show(32.3).move(32.4, 0.32, first);
    rows.slice(0, 7).forEach(function (r, i) {
      var t = t0 + i * step, pt = cam.pt(r.amt);
      if (i) ptr.move(t - 0.26, 0.24, pt, "inOutSoft");
      tw($(".n" + (i + 1), camEl), t, 0.1, { o: [0, 1] }); cue(t, "type", 0.7 + i * 0.04);
    });
    /* review, then one save */
    var tc = 35.3; tw($(".nc", camEl), tc, 0.35, { o: [0, 1] }, "inOutSoft"); cam.to(tc - 0.05, 0.6, [nc.check[0] - 300, nc.check[1] - 330, 760, 520], Zs(k, 1.2, 1.12));
    var chk = cam.pt(nc.check); ptr.move(tc + 0.05, 0.5, chk).click(35.95, chk, 0.85 * ps);
    tw($(".nrv", camEl), 36.02, 0.2, { o: [0, 1] }); cam.to(36.05, 0.65, nr.modal, Zs(k, 1.26, 1.3));
    var ok = cam.pt(nr.ok); ptr.move(36.3, 0.5, ok).click(37.0, ok, 0.85 * ps).hide(37.2);
    tw($(".ow", camEl), 37.08, 0.25, { o: [0, 1] }); cue(37.1, "save");
    cam.to(37.15, 0.9, [ow.rects.table[0], 60, ow.rects.table[2], 640], Zs(k, 1.1, 0.93));
    var toast = $(".toast", camEl); if (V) pinToast(toast, p, W, tn);
    tw(toast, 37.3, 0.5, { o: [0, 1], y: [34, 0] }, "back"); tw(toast, 39.3, 0.3, { o: 0 });
    fadeUp(sub, 37.35, 20, 0.7);
    /* who owes what, at any moment */
    tw(one, 38.0, 0.45, { y: -150 }, "in", 0.05); fadeOut(sub, 38.0, -20, 0.35); tw(two, 38.3, 0.95, { y: 0 }, "out", 0.11);
    var hl = $$(".hl", camEl); set(hl, 0, { o: 0 }); tw(hl, 38.45, 0.5, { o: [0, 1], sx: [0.2, 1] }, "out", 0.09); tw(hl, 40.2, 0.4, { o: 0 }); cue(38.45, "tick");
    tw(chips, 38.9, 0.6, { o: [0, 1], y: [22, 0], s: [0.9, 1] }, "back", 0.13); [0, 1, 2].forEach(function (i) { cue(38.9 + i * 0.13, "pop", 0.6); });
    /* out */
    tw(body, 40.72, 0.55, V ? { y: 160, o: 0 } : { x: -160 * M, o: 0 }, "in"); fadeOut(txt, 40.7, -26, 0.45);
    cue(40.72, "whoosh", 0.7);
  })();

  /* =====================================================================
     6 · every member, an account on the phone  (41.25 - 50)
     ===================================================================== */
  (function () {
    var a = 41.25, s = add(stage, '<section class="scene" id="s6"></section>');
    var VW = V ? 416 : 372, k = VW / 430, VH = phoneH(VW), PW = VW + 26, PH = VH + 26, X = V ? 319 : 606, Y = V ? 630 : 100, OY = sbH(VW);
    var me = META["me-0"].rects, mp = META["me-pay"].rects, md = META["me-paid"].rects, pp = META["push-paid"];
    var p = box(add(s, '<div class="p3d" style="z-index:3"><div class="body">' + phone("", VW,
      scr("me-0") + scr("me-pay", "s1") + scr("me-paid", "s4") +
      IMG("push-paid", "cut push", "left:" + pp.at[0] * k + "px;top:" + (OY + (pp.at[1] - 60) * k) + "px;width:" + pp.w * k + "px") +
      '<div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>') + "</div></div>"), X, Y, PW, PH);
    var body = $(".body", p), camEl = $(".cam", p), cam = Cam(camEl, META["me-0"], k, VW, VH, OY), tap = Pointer(cam, "tap");
    /* a second phone: the donation form */
    var V2 = V ? 228 : 286, p2 = box(add(s, '<div class="p3d"><div class="body">' + phone("sm", V2, scr("donate-m")) + "</div></div>"), V ? 170 : 196, V ? 1040 : 236, V2 + 20, phoneH(V2) + 20);
    var body2 = $(".body", p2);
    var cap2 = V ? add(s, '<div class="abs" style="left:' + mx(144, 300) + 'px;width:300px;top:936px;text-align:center"><span class="chip wrapchip">' + C.s6.donateV + "</span></div>")
                 : add(s, '<div class="abs" style="left:' + mx(86, 530) + 'px;width:530px;top:928px;text-align:center"><span class="chip" style="font-size:24px">' + C.s6.donate + "</span></div>");
    var txt, sub, line, hOne, hTwo;
    if (V) {   /* portrait: the closing line takes the headline's place, which leaves the phone more room */
      txt = box(add(s, '<div class="txt">' + kicker("04", C.s6.kicker) + '<div class="swap" style="height:' + (HE ? 240 : 268) + 'px"><div class="one" style="width:100%"><h1 class="h" style="font-size:' + (HE ? 108 : 82) + 'px">' + lines(C.s6.h, ["", "goldgrad", "goldgrad"]) + '</h1></div><div class="two" style="width:100%"><h1 class="h" style="font-size:' + (HE ? 104 : 96) + 'px">' + lines(C.s6.lineV, "goldgrad") + "</h1></div></div></div>"), 60, HE ? 228 : 206, 960);
      sub = add(txt, '<p class="sub">' + C.s6.sub + "</p>"); hOne = $$(".one .li", txt); hTwo = $$(".two .li", txt);
    } else {
      txt = textBlock(s, 1090, HE ? 250 : 214, 750, "04", C.s6.kicker, C.s6.h, HE ? 100 : 88, ["", "goldgrad", "goldgrad"]);
      sub = add(txt, '<p class="sub">' + C.s6.sub + "</p>"); line = add(txt, '<p class="line2 goldgrad" style="font-size:' + (HE ? 58 : 52) + 'px">' + C.s6.line + "</p>");
    }
    show(s, a - 0.15, 50.45);
    tw(body, a, 1.3, { o: [0, 1], y: [260, 0], r: [7 * M, 0], ry: [14 * M, 6 * M], s: [0.9, 1] }, "out");
    tw(body, a + 1.3, 7, { ry: 2 * M }, "inOutSoft");
    kickIn($(".kicker", txt), a + 0.45);
    if (V) { tw(hOne, a + 0.6, 0.95, { y: [150, 0] }, "out", 0.12); set(hTwo, 0, { y: 160 }); } else riseLines(txt, a + 0.6, 150, 0.12);
    /* the balance, then: pay by card */
    var r1 = $(".r1", camEl), r2 = $(".r2", camEl);
    set(r1, 0, Object.assign({ o: 0 }, cam.ring(r1, me.bal, 4))); tw(r1, 42.6, 0.3, { o: 1 }); pulse(r1, 42.65, 0.04); tw(r1, 43.35, 0.25, { o: 0 }); cue(42.6, "tick");
    var pay = cam.pt(me.pay);
    tap.at(0, pay).show(43.05).click(43.3, pay).hide(43.45);
    tw($(".s1", camEl), 43.4, 0.32, { o: [0, 1], y: [26, 0] }, "out");
    var ap = cam.pt(mp.apple), r3 = $(".r3", camEl); set(r3, 0, Object.assign({ o: 0 }, cam.ring(r3, mp.apple, 4)));
    tap.at(43.9, ap).show(44.05).click(44.3, ap).hide(44.45);
    tw(r3, 44.3, 0.2, { o: 1 }); pulse(r3, 44.32, 0.05); tw(r3, 44.8, 0.2, { o: 0 }); cue(44.3, "save");
    fadeUp(sub, 44.75, 20, 0.7);
    /* paid: nothing owed, and a notification */
    tw($(".s4", camEl), 44.85, 0.4, { o: [0, 1] }, "inOutSoft");
    var push = $(".push", camEl); tw(push, 45.15, 0.7, { o: [0, 1], y: [-150, 0] }, "back"); cue(45.15, "notify"); tw(push, 48.6, 0.35, { o: 0, y: -60 }, "in");
    set(r2, 0, Object.assign({ o: 0 }, cam.ring(r2, md.bal, 4))); tw(r2, 45.6, 0.3, { o: 1 }); pulse(r2, 45.65, 0.04); tw(r2, 47.2, 0.3, { o: 0 });
    /* the donation form slides in beside it */
    if (V) tw(body, 46.6, 1.1, { x: 150 * M }, "inOut");      /* in portrait the first phone makes room */
    tw(body2, 46.6, 1.1, { o: [0, 1], x: [-200 * M, 0], r: [-12 * M, -5 * M], ry: [22 * M, 12 * M], s: [0.86, 1] }, "out"); cue(46.6, "pop");
    fadeUp($(".chip", cap2), 47.05, 20, 0.7);
    if (V) { tw(hOne, 47.0, 0.45, { y: -160 }, "in", 0.05); tw(hTwo, 47.3, 0.95, { y: 0 }, "out", 0.11); } else fadeUp(line, 47.0, 24, 0.9);
    cue(47.0, "swell", 0.6);
    /* out */
    tw(body, 49.45, 0.55, { y: 220, o: 0 }, "in"); tw(body2, 49.4, 0.5, { x: -200 * M, o: 0 }, "in"); fadeOut([txt, cap2], 49.45, -26, 0.45);
    cue(49.45, "whoosh", 0.7);
  })();

  /* =====================================================================
     7 · it will look like your shul  (50 - 57.5)
     ===================================================================== */
  (function () {
    var a = 50, s = add(stage, '<section class="scene" id="s7"></section>');
    var TH = ["classic", "heichal", "techelet", "parochet", "emerald", "warm", "argaman", "erez", "royal"];
    var TC = { classic: ["#132a52", "#efe6d6", "#1d3a6b"], heichal: ["#0a0a0c", "#0b0b0d", "#d6b36a"], techelet: ["#184f94", "#eaf2fb", "#1f5fae"], parochet: ["#3a0e19", "#3a0e19", "#e2bf7a"], emerald: ["#0c2a20", "#0d2a21", "#dcc07f"], warm: ["#8f4020", "#f6e3d1", "#b4532a"], argaman: ["#4a184e", "#f3e6f1", "#5a1f5e"], erez: ["#54301a", "#ead9c2", "#6b3f22"], royal: ["#0c1628", "#0c1628", "#e0c48c"] };
    var beat = 0.625, t1 = 51.25, at = TH.map(function (_, i) { return i ? t1 + (i - 1) * beat : 0; });
    /* the backdrop takes each design's color */
    TH.forEach(function (th, i) { var d = add(tints, '<div class="tint" style="background:radial-gradient(ellipse 90% 80% at 50% 62%, ' + TC[th][0] + " 0%, " + TC[th][0] + 'cc 38%, #050b17 100%)"></div>'); show(d, a - 0.1, 58.2); tw(d, i ? at[i] : a + 0.1, i ? 0.4 : 0.9, { o: [0, 1] }, "inOutSoft"); if (i === TH.length - 1) tw(d, 57.3, 0.7, { o: 0 }); });
    $$(".tint", tints).slice(0, -1).forEach(function (d) { tw(d, 57.3, 0.01, { o: 0 }); });
    function stack(prefix, cls) { return TH.map(function (th, i) { return IMG(prefix + th, "st" + (i ? " wipe " : " ") + (cls || "")); }).join(""); }
    function pstack(prefix) { return TH.map(function (th, i) { return scr(prefix + th, i ? "wipe" : ""); }).join(""); }
    /* the screen, the website and the member account, together */
    var TW = 1000, tk = (TW - 20) / 1920, tvh = 1080 * tk;
    var tv = box(add(s, '<div class="p3d"><div class="body"><div class="tvf sm" style="padding:10px"><div class="view"><div class="cam" style="width:' + (TW - 20) + "px;height:" + tvh + 'px">' + stack("th-tv-") + "</div></div></div></div></div>"), V ? 40 : 460, V ? 664 : 318, TW, tvh + 20);
    var BW = V ? 640 : 610, bk = BW / 1280, bvh = 800 * bk;
    var br = box(add(s, '<div class="p3d" style="z-index:2"><div class="body">' + browser("www.kehillatnachalathaemek.org", bvh) + "</div></div>"), V ? 40 : 150, V ? 1140 : 598, BW, bvh + 38);
    $(".bw-bar", br).style.height = "38px"; $(".bw-url", br).style.cssText = "top:6px;height:26px;min-width:300px;font-size:13px;line-height:26px"; $$(".bw-bar i", br).forEach(function (d) { d.style.width = d.style.height = "11px"; });
    var bc = $(".cam", br); bc.style.width = BW + "px"; bc.style.height = bvh + "px"; bc.innerHTML = stack("th-site-");
    var PW = V ? 244 : 236, pvh = phoneH(PW);
    var ph = box(add(s, '<div class="p3d" style="z-index:3"><div class="body">' + phone("xs", PW, pstack("th-me-")) + "</div></div>"), V ? 780 : 1400, V ? 1030 : 452, PW + 16, pvh + 16);
    var head = add(s, '<div class="abs center" style="left:0;right:0;top:' + (V ? 236 : 62) + 'px"><div style="display:flex;justify-content:center;margin-bottom:22px">' + kicker("05", C.s7.kicker) + '</div><h1 class="h" style="font-size:' + (V ? (HE ? 110 : 100) : (HE ? 94 : 88)) + 'px">' + lines(V ? C.s7.hv : [C.s7.h]) + "</h1></div>");
    var pill = add(s, '<div class="abs center" style="left:0;right:0;top:' + (V ? 560 : 246) + 'px"><span class="pill" style="position:relative"><span class="sw"></span><span>' + C.s7.label + '</span><span class="names" style="width:' + (HE ? 110 : 150) + 'px">' + TH.map(function (th) { return "<b>" + C.s7.themes[th] + "</b>"; }).join("") + '</span><span style="opacity:.45">·</span><span>' + C.s7.sub + "</span></span></div>");
    var sw = $(".sw", pill); TH.forEach(function (th) { add(sw, '<span class="abs" style="inset:0;background:linear-gradient(135deg,' + TC[th][1] + " 50%," + TC[th][2] + ' 50%)"></span>'); });
    var sws = $$("span", sw), names = $$(".names b", pill);
    show(s, a - 0.15, 57.95);
    kickIn($(".kicker", head), a + 0.25); riseLines(head, a + 0.4, 150);
    fadeUp($(".pill", pill), a + 0.9, 18, 0.7);
    var bodies = [$(".body", tv), $(".body", br), $(".body", ph)];
    tw(bodies[0], a + 0.15, 1.3, { o: [0, 1], y: [150, 0], s: [0.9, 1], rx: [14, 3] }, "out");
    tw(bodies[1], a + 0.35, 1.3, { o: [0, 1], y: [190, 0], x: [-90 * M, 0], ry: [22 * M, 11 * M], s: [0.9, 1] }, "out");
    tw(bodies[2], a + 0.5, 1.3, { o: [0, 1], y: [210, 0], x: [90 * M, 0], ry: [-24 * M, -12 * M], s: [0.9, 1] }, "out");
    tw(bodies[0], a + 1.5, 6, { rx: 1 }, "inOutSoft"); tw(bodies[1], a + 1.7, 6, { ry: 7 * M }, "inOutSoft"); tw(bodies[2], a + 1.8, 6, { ry: -8 * M }, "inOutSoft");
    /* a new design on every beat */
    set(names, 0, { o: 0 }); set(sws, 0, { o: 0 });
    tw(names[0], a + 0.9, 0.5, { o: [0, 1] }); tw(sws[0], a + 0.9, 0.5, { o: [0, 1] });
    TH.forEach(function (th, i) {
      if (!i) return; var t = at[i];
      [tv, br, ph].forEach(function (dev, j) { tw($$(".wipe", dev)[i - 1], t + j * 0.045, 0.34, { "--p": [0, 1] }, "inOut"); pulse(bodies[j], t + j * 0.045, 0.012); });
      tw(names[i - 1], t, 0.14, { o: 0 }); tw(names[i], t + 0.1, 0.22, { o: [0, 1], y: [10, 0] }, "out");
      tw(sws[i], t, 0.25, { o: [0, 1] });
      cue(t, "beat", i);
    });
    /* out */
    tw(bodies, 57.0, 0.5, { y: 170, o: 0 }, "in", 0.05); fadeOut([head, pill], 57.0, -26, 0.42);
    cue(57.0, "whoosh", 0.7);
  })();

  /* =====================================================================
     8 · a few more things that no longer need a drawer  (57.5 - 62.5)
     ===================================================================== */
  (function () {
    var a = 57.5, s = add(stage, '<section class="scene" id="s8"></section>');
    var head = add(s, '<div class="abs center" style="left:0;right:0;top:' + (V ? 218 : 128) + 'px"><h1 class="h" style="font-size:' + (V ? (HE ? 82 : 64) : (HE ? 74 : 66)) + 'px">' + lines(V ? C.s8.hv : [C.s8.h]) + "</h1></div>");
    /* each card shows a piece of a real screen: [capture, the part to show (x, y, w in the capture's CSS px), icon] */
    /* a piece of a gabbai page, w wide, from the page's own edge (the menu is 264 wide, on the right in Hebrew) */
    function pg(w) { return [HE ? 1096 - w : 264, 70, w]; }
    var cards = [
      ["sheet", [36, 34, 504], "sheet"], ["tv-board-7", [20, HE ? 396 : 262, 620], "flame"], ["tv-board-4", [20, 150, 620], "horn"], ["admin", pg(540), "shield"],
      ["activity", pg(610), "list"], ["backup", pg(540), "cloud"], ["fin-more", pg(610), "report"], ["__lang", null, "globe"]
    ];
    var NC = V ? 2 : 4, CW = V ? 484 : 402, CH = V ? 276 : 296, GAP = V ? 22 : 32, X0 = (SW - (NC * CW + (NC - 1) * GAP)) / 2, Y0 = V ? 428 : 306, TWd = CW - 24;
    var els = cards.map(function (c, i) {
      var col = i % NC, row = Math.floor(i / NC), x = X0 + (NC - 1 - col) * (CW + GAP), y = Y0 + row * (CH + GAP), th;
      if (c[0] === "__lang") {
        /* Hebrew and English: the same screen, in both */
        var z = TWd / 820, he = [1096 - 820 + 14, 70], en = [264 - 14, 70];
        th = '<div class="half" style="clip-path:polygon(0 0,58% 0,42% 100%,0 100%)"><img decoding="sync" src="' + SH("dash", "en") + '" style="width:' + 1360 * z + "px;left:" + (-en[0] * z) + "px;top:" + (-en[1] * z) + 'px"></div>' +
          '<div class="half" style="clip-path:polygon(58% 0,100% 0,100% 100%,42% 100%)"><img decoding="sync" src="' + SH("dash", "he") + '" style="width:' + 1360 * z + "px;left:" + (-he[0] * z) + "px;top:" + (-he[1] * z) + 'px"></div>';
      } else {
        var mw = META[c[0]].w, zz = TWd / c[1][2];
        th = '<img decoding="sync" src="' + SH(c[0]) + '" style="width:' + mw * zz + "px;left:" + (-c[1][0] * zz) + "px;top:" + (-c[1][1] * zz) + 'px">';
      }
      var e = add(s, '<div class="card8"><div class="th">' + th + '</div><div class="t">' + IC[c[2]] + "<span>" + C.s8.cards[i] + "</span></div></div>");
      e.style.left = mx(x, CW) + "px"; e.style.top = y + "px";
      return e;
    });
    show(s, a - 0.1, 63.0);
    riseLines(head, a + 0.2, 120);
    els.forEach(function (e, i) { var t = a + 0.625 + i * 0.3125; tw(e, t, 0.75, { o: [0, 1], y: [70, 0], s: [0.86, 1], rx: [18, 0] }, "back"); cue(t, "pop", 0.75); });
    tw(els, 62.0, 0.45, { o: 0, y: -50, s: 0.94 }, "in", 0.03); fadeOut(head, 62.0, -26, 0.4);
    cue(62.0, "whoosh", 1);
  })();

  /* =====================================================================
     9 · the call  (62.5 - 71)
     ===================================================================== */
  (function () {
    var a = 62.5, s = add(stage, '<section class="scene" id="s9"></section>');
    add(s, '<div class="s2-halo" style="top:' + (V ? 820 : 520) + 'px;width:1500px;height:1500px;margin:-750px 0 0 -750px"></div>');
    var AR = V ? ["M66 1940V770A474 474 0 0 1 1014 770V1940", "M14 1940V770A526 526 0 0 1 1066 770V1940"] : ["M330 1100V560A630 630 0 0 1 1590 560V1100", "M270 1100V560A690 690 0 0 1 1650 560V1100"];
    var arch = add(s, '<svg class="abs" viewBox="0 0 ' + SW + " " + SHT + '" style="left:0;top:0;width:' + SW + "px;height:" + SHT + 'px"><path d="' + AR[0] + '" fill="none" stroke="rgba(242,188,61,.5)" stroke-width="2.5" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:calc(var(--d,0)*1)"/><path d="' + AR[1] + '" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1.5" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:calc(var(--d,0)*1)"/></svg>');
    var mk = add(s, '<div class="s9-mark">' + MARK() + WORD + "</div>");
    var hd = add(s, '<div class="s9-h"><h1 class="h" style="font-size:' + (V ? (HE ? 102 : 96) : (HE ? 96 : 92)) + 'px">' + (V ? lines(C.s9.hv, ["", "goldgrad", "goldgrad"]) : lines(C.s9.h, ["", "goldgrad"])) + "</h1></div>");
    var bw = add(s, '<div class="abs" style="left:0;right:0;top:0"><span class="s9-btn" style="transform:translateX(-50%)"><span>' + C.s9.btn + "</span>" + IC.arrow + '<i class="shine"></i></span></div>');
    var ct = add(s, '<div class="s9-contact"><span>' + IC.link + CT.url + "</span><span>" + IC.phone + CT.phone + "</span><span>" + IC.mail + CT.email + "</span></div>");
    var fine = add(s, '<div class="s9-fine">' + C.s9.fine + "</div>");
    show(s, a - 0.1, 71.2);
    tw($(".s2-halo", s), a, 1.6, { o: [0, 0.9], s: [0.5, 1] }, "out"); tw($(".s2-halo", s), a + 1.6, 6.5, { s: 1.1 }, "inOutSoft");
    tw($$("path", arch), a + 0.1, 1.9, { "--d": [1, 0] }, "inOut", 0.15);
    tw(mk, a + 0.2, 0.9, { o: [0, 1], y: [-26, 0], s: [0.9, 1] }, "out"); cue(a, "hit", 0.9);
    riseLines(hd, a + 0.55, 150, 0.14, 1.05);
    /* the button is a wrapper (kept centered) around the animated pill */
    var btnWrap = bw, btn = $(".s9-btn", bw);
    tw(btnWrap, a + 1.875, 0.9, { o: [0, 1], y: [40, 0] }, "back"); cue(a + 1.875, "save", 1);
    var shine = $(".shine", bw); tw(shine, a + 2.6, 1.0, { x: [-200, 900] }, "inOutSoft"); tw(shine, a + 5.3, 1.0, { x: [-200, 900] }, "inOutSoft"); set(shine, a + 5.29, { x: -200 });
    tw($$("span", ct).filter(function (e) { return e.parentElement === ct; }), a + 2.5, 0.8, { o: [0, 1], y: [26, 0] }, "out", 0.12);
    tw(fine, a + 3.3, 1.0, { o: [0, 1] });
    tw(shine, a + 7.2, 1.0, { x: [-200, 900] }, "inOutSoft"); set(shine, a + 7.19, { x: -200 });
  })();

  /* ---------- ready ---------- */
  window.DURATION = 71; window.FORMAT = { w: SW, h: SHT }; window.CUES = CUES.sort(function (x, y) { return x[0] - y[0]; }); window.seek = FX.seek;
  await document.fonts.ready;
  await Promise.all(["700 80px 'Frank Ruhl Libre'", "900 80px 'Frank Ruhl Libre'", "400 30px Heebo", "500 30px Heebo", "600 30px Heebo", "700 30px Heebo", "800 30px Heebo", "400 30px Inter", "500 30px Inter", "800 30px Inter"].map(function (f) { return document.fonts.load(f, "אבגדה Shul 123"); }));
  await Promise.all($$("img", stage).map(function (im) { return im.decode ? im.decode().catch(function () {}) : null; }));
  tintBars();
  FX.seek(parseFloat(qs.get("t") || "0"));
  if (qs.get("play")) { var t0 = performance.now(), st = parseFloat(qs.get("t") || "0"); (function loop() { var t = st + (performance.now() - t0) / 1000; if (t > window.DURATION) return; FX.seek(t); requestAnimationFrame(loop); })(); }
  /* fit the stage to the window when watching in a browser */
  if (!qs.get("raw")) { var fit = function () { var z = Math.min(innerWidth / SW, innerHeight / SHT); stage.style.transformOrigin = "0 0"; stage.style.transform = "scale(" + z + ")"; }; fit(); addEventListener("resize", fit); }
  window.READY = true;
})();
