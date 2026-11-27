/* A tiny, deterministic animation engine for the film.
   Every animated value is a pure function of time: seek(t) can be called for any t, in any
   order, and always draws the same frame. That is what lets the film be rendered frame by frame. */
(function () {
  "use strict";

  /* ---------- easing ---------- */
  function bezier(x1, y1, x2, y2) {
    // cubic-bezier(x1,y1,x2,y2) solved for x by Newton's method, as CSS does
    function A(a, b) { return 1 - 3 * b + 3 * a; } function B(a, b) { return 3 * b - 6 * a; } function C(a) { return 3 * a; }
    function calc(t, a, b) { return ((A(a, b) * t + B(a, b)) * t + C(a)) * t; }
    function slope(t, a, b) { return 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a); }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) { var s = slope(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (calc(t, x1, x2) - x) / s; }
      // bisection fallback keeps it exact where the slope is flat
      var lo = 0, hi = 1, g = t;
      if (Math.abs(calc(g, x1, x2) - x) > 1e-4) { for (var k = 0; k < 24; k++) { g = (lo + hi) / 2; if (calc(g, x1, x2) < x) lo = g; else hi = g; } t = g; }
      return calc(t, y1, y2);
    };
  }
  var E = {
    linear: function (x) { return x; },
    out: bezier(0.16, 1, 0.3, 1),            /* expo-like settle: the house ease */
    outSoft: bezier(0.22, 0.61, 0.36, 1),
    outQuart: bezier(0.25, 1, 0.5, 1),
    inOut: bezier(0.65, 0, 0.35, 1),
    inOutSoft: bezier(0.45, 0, 0.55, 1),
    inOutExpo: bezier(0.87, 0, 0.13, 1),
    in: bezier(0.55, 0, 1, 0.45),
    inSoft: bezier(0.4, 0, 1, 1),
    back: bezier(0.34, 1.4, 0.64, 1),
    backBig: bezier(0.3, 1.75, 0.5, 1),
    cam: bezier(0.6, 0, 0.2, 1)              /* camera moves: slow in, long settle */
  };
  E.spring = function (x) { /* one soft overshoot */
    if (x <= 0) return 0; if (x >= 1) return 1;
    return 1 - Math.exp(-6.2 * x) * Math.cos(9.5 * x);
  };

  /* ---------- tracks ---------- */
  var DEF = { x: 0, y: 0, z: 0, s: 1, sx: 1, sy: 1, r: 0, rx: 0, ry: 0, o: 1, blur: 0, bright: 1, sat: 1, zm: 1 };
  var els = [];           /* every animated element */
  var hooks = [];         /* custom per-frame functions: fn(t) */
  var windows = [];       /* [el, t0, t1] visibility windows */

  function list(target) {
    if (!target) return [];
    if (typeof target === "string") return Array.prototype.slice.call(document.querySelectorAll(target));
    if (target.nodeType) return [target];
    return Array.prototype.slice.call(target);
  }
  function reg(el) { if (!el._tr) { el._tr = {}; els.push(el); } return el._tr; }

  /* tw(target, t0, dur, {prop: to | [from, to]}, ease, stagger)
     A property keeps the value of the last segment that has started; before its first segment it
     holds that segment's "from". */
  function tw(target, t0, dur, props, ease, stagger) {
    var fn = typeof ease === "function" ? ease : (E[ease || "out"] || E.out);
    list(target).forEach(function (el, i) {
      var tr = reg(el), st = t0 + (stagger || 0) * i;
      Object.keys(props).forEach(function (k) {
        var v = props[k], segs = tr[k] || (tr[k] = []);
        var from, to;
        if (Array.isArray(v)) { from = v[0]; to = v[1]; }
        else { to = v; from = null; }
        segs.push({ t0: st, d: Math.max(dur, 1e-6), from: from, to: to, e: fn });
      });
      el._dirty = true;
    });
  }
  function set(target, t, props) { tw(target, t, 1e-6, props, "linear"); }

  function prep(el) {
    var tr = el._tr;
    Object.keys(tr).forEach(function (k) {
      var segs = tr[k];
      segs.sort(function (a, b) { return a.t0 - b.t0; });
      var prev = (k in DEF) ? DEF[k] : (k.charAt(0) === "-" ? 0 : 0);
      if (el._base && k in el._base) prev = el._base[k];
      segs.forEach(function (s) { if (s.from === null || s.from === undefined) s.f = prev; else s.f = s.from; prev = s.to; });
    });
    el._dirty = false;
  }
  function val(segs, t) {
    var s = segs[0];
    if (t <= s.t0) return s.f;
    for (var i = segs.length - 1; i >= 0; i--) { if (segs[i].t0 <= t) { s = segs[i]; break; } }
    var p = (t - s.t0) / s.d; if (p >= 1) return s.to;
    return s.f + (s.to - s.f) * s.e(p);
  }
  function base(target, props) { list(target).forEach(function (el) { reg(el); el._base = Object.assign(el._base || {}, props); el._dirty = true; }); }

  function show(target, t0, t1) { list(target).forEach(function (el) { windows.push([el, t0, t1]); }); }
  function hook(fn) { hooks.push(fn); }

  function r3(n) { return Math.round(n * 1000) / 1000; }
  function apply(el, t) {
    if (el._dirty) prep(el);
    var tr = el._tr, v = {}, k, hasT = false, hasF = false;
    for (k in tr) v[k] = val(tr[k], t);
    var st = el.style;
    if ("o" in v) st.opacity = r3(Math.max(0, Math.min(1, v.o)));
    for (k in v) { if (k === "x" || k === "y" || k === "z" || k === "s" || k === "sx" || k === "sy" || k === "r" || k === "rx" || k === "ry") hasT = true; else if (k === "blur" || k === "bright" || k === "sat") hasF = true; else if (k.charAt(0) === "-") st.setProperty(k, r3(v[k])); }
    /* zm is a layout zoom (CSS zoom): unlike a scale it is drawn sharp at any size, which a close-up
       of a captured screen needs. Zoom also multiplies the element's own translation, so that is divided back. */
    var zm = 1; if ("zm" in v) { zm = v.zm; st.zoom = r3(zm); hasT = true; }
    if (hasT) {
      var s = "translate3d(" + r3((v.x || 0) / zm) + "px," + r3((v.y || 0) / zm) + "px," + r3(v.z || 0) + "px)";
      if (v.rx) s += " rotateX(" + r3(v.rx) + "deg)";
      if (v.ry) s += " rotateY(" + r3(v.ry) + "deg)";
      if (v.r) s += " rotate(" + r3(v.r) + "deg)";
      var sc = "s" in v ? v.s : 1, sx = "sx" in v ? v.sx : 1, sy = "sy" in v ? v.sy : 1;
      if (sc !== 1 || sx !== 1 || sy !== 1) s += " scale(" + r3(sc * sx) + "," + r3(sc * sy) + ")";
      st.transform = s;
    }
    if (hasF) {
      var f = "";
      if (v.blur > 0.05) f += "blur(" + r3(v.blur) + "px) ";
      if ("bright" in v && Math.abs(v.bright - 1) > 0.002) f += "brightness(" + r3(v.bright) + ") ";
      if ("sat" in v && Math.abs(v.sat - 1) > 0.002) f += "saturate(" + r3(v.sat) + ") ";
      st.filter = f || "none";
    }
  }

  var now = 0;
  function seek(t) {
    now = t;
    var i, vis = new Map();
    for (i = 0; i < windows.length; i++) { var w = windows[i]; var on = t >= w[1] && t < w[2]; vis.set(w[0], (vis.get(w[0]) || false) || on); }
    vis.forEach(function (on, el) { var d = on ? "" : "none"; if (el.style.display !== d) el.style.display = d; });
    for (i = 0; i < els.length; i++) apply(els[i], t);
    for (i = 0; i < hooks.length; i++) hooks[i](t);
  }

  window.FX = { tw: tw, set: set, base: base, show: show, hook: hook, seek: seek, E: E, bezier: bezier, list: list, get now() { return now; } };
})();
