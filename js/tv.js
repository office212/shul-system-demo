/* Kehillat Noam | the TV screen. One renderer for the full screen, the landing page's
   live preview and the editors' previews: a fixed 1920x1080 stage, scaled to its host.
   Weekdays: the centre rotates (dedications, yahrzeits, hazkarot, mazal tov, announcements,
   the kiddush board, the Rabbi's word), the QR is shown, the countdown to candle lighting
   ticks. From candle lighting to the end of Shabbat it switches BY ITSELF to the fixed
   Shabbat screen: Shabbat Shalom with candles, no QR, no rotation; the dedications stay. */
(function () {
  "use strict";
  var KN = window.KN, D = window.KN_DATA, G = window.KN_GEN, S = KN.S, T = KN.T, L = KN.L, esc = KN.esc, W = D.WEEK;
  var live = [];
  function pad(n) { return String(n).padStart(2, "0"); }
  function mode(d) { var t = d.getTime(); return t >= KN.ENDS ? "motzash" : t >= KN.CANDLE ? "shabbat" : d.getDay() === 5 ? "erev" : "week"; }
  function weekYahrzeits() { return S.yahrzeits.filter(function (y) { return y.status === "approved" && y.hMonth === 2 && y.hDay >= 5 && y.hDay <= 11; }).sort(function (a, b) { return a.hDay - b.hDay; }); }
  KN.weekYahrzeits = weekYahrzeits;
  function it(main, small, id) { return '<div class="tv-it' + (id && S.tvNew === id ? " new" : "") + '"><b>' + esc(main) + "</b>" + (small ? "<small>" + esc(small) + "</small>" : "") + "</div>"; }
  function itText(text, small, id) { return '<div class="tv-it' + (id && S.tvNew === id ? " new" : "") + '">' + esc(text) + (small ? "<small>" + esc(small) + "</small>" : "") + "</div>"; }
  function chunk(a, n) { var o = []; for (var i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }
  function slides() {
    var out = [];
    function add(kind, title, items, per) { chunk(items, per || 3).forEach(function (c, i, all) { out.push({ kind: kind, ids: c.map(function (x) { return x.id; }), html: "<h3>" + esc(title) + (all.length > 1 ? ' <span style="font-size:.55em;opacity:.55">' + (i + 1) + "/" + all.length + "</span>" : "") + '</h3><div class="orn"></div><div class="tv-list">' + c.map(function (x) { return x.html; }).join("") + "</div>" }); }); }
    add("dedications", T("הקדשות השבוע", "This week's dedications"), S.dedications.map(function (d) { return { id: d.id, html: itText(L(d.text), L(d.by), d.id) }; }));
    add("yahrzeits", T("יארצייט השבוע", "Yahrzeits this week"), weekYahrzeits().map(function (y) { return { id: y.id, html: it(L(y.name), KN.hdate(y.hDay, y.hMonth) + " · " + L(y.rel), y.id) }; }), 4);
    add("hazkarot", T("אזכרות", "Memorials"), S.hazkarot.map(function (h) { return { id: h.id, html: it(L(h.name), L(h.text) + " · " + L(h.by), h.id) }; }));
    add("mazal", T("מזל טוב!", "Mazal Tov!"), S.mazal.map(function (m) { return { id: m.id, html: it(L(m.text), L(m.sub), m.id) }; }));
    add("announcements", T("הודעות", "Announcements"), S.announcements.map(function (a) { return { id: a.id, html: '<div class="tv-it' + (S.tvNew === a.id ? " new" : "") + '"><b>' + esc(L(a.title)) + "</b>" + esc(L(a.text)) + "</div>" }; }));
    add("kiddush", T("לוח הקידושים", "Kiddush sponsors"), S.kiddush.map(function (k) { return { id: k.id, html: it(L(k.what) + " · " + L(k.by), L(k.why), k.id) }; }));
    out.push({ kind: "rabbi", ids: [], html: "<h3>" + T("דבר הרב לפרשת ", "The Rabbi's word · ") + esc(L(W.parasha)) + '</h3><div class="orn"></div><div class="tv-list"><div class="tv-it" style="font-size:40px;line-height:1.5;padding:30px;font-family:var(--display)">' + esc(L(D.rabbi)) + "<small>" + esc(L(S.shul.rabbi)) + "</small></div></div>" });
    if (KN.tvExtraSlides) KN.tvExtraSlides(out);
    return out;
  }
  function prayerRows(d, m) {
    var dow = d.getDay(), now = d.getHours() * 60 + d.getMinutes(), rows = [];
    function push(list, dayOfList) { list.forEach(function (p) { rows.push({ p: p, past: dayOfList === dow ? KN.mins(p.time) < now : dayOfList < dow }); }); }
    if (dow === 5) { var fri = KN.dayPrayers(5); if (m === "shabbat") fri = fri.filter(function (p) { return KN.mins(p.time) >= now; }); push(fri, 5); push(KN.dayPrayers(6), 6); } else push(KN.dayPrayers(dow), dow);
    var nextDone = false;
    return rows.map(function (r) { var cls = r.past ? "past" : (!nextDone ? (nextDone = true, "next") : ""); return '<div class="' + cls + '"><span>' + esc(L(r.p.name)) + "</span><b>" + KN.time(r.p.time) + "</b></div>"; }).join("");
  }
  function zRows(iso) {
    var z = KN.zman(iso), R = [["alot", "עלות השחר", "Alot HaShachar"], ["netz", "הנץ החמה", "Netz (sunrise)"], ["shemaGra", "סוף זמן ק״ש", "Latest Shema"], ["chatzot", "חצות", "Chatzot"], ["minchaGedola", "מנחה גדולה", "Mincha Gedola"], ["minchaKetana", "מנחה קטנה", "Mincha Ketana"], ["plag", "פלג המנחה", "Plag HaMincha"], ["shkiah", "שקיעה", "Shkiah (sunset)"], ["tzeit", "צאת הכוכבים", "Tzeit HaKochavim"], ["rt", "רבנו תם", "Rabbeinu Tam"]];
    if (KN.nusachRows && !KN.nusachRows().rt) R = R.filter(function (r) { return r[0] !== "rt"; });
    return R.map(function (r) { return "<div><span>" + T(r[1], r[2]) + "</span><b>" + KN.time(z[r[0]]) + "</b></div>"; }).join("");
  }
  KN.zRows = zRows;
  function qr() { return '<svg viewBox="-1 -1 ' + (G.qr.n + 2) + " " + (G.qr.n + 2) + '" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="' + G.qr.path + '"/></svg>'; }
  KN.qr = qr;
  function build(inst) {
    var d = KN.now(), m = mode(d), day = KN.today(), shab = m === "shabbat";
    var title = m === "shabbat" ? T("שבת קודש", "Shabbat Kodesh") : m === "erev" ? T("ערב שבת קודש", "Erev Shabbat") : m === "motzash" ? T("שבוע טוב ומבורך", "Shavua Tov") : T("יום ", "") + L(D.DOW[day.dow]);
    var head = '<div class="tv-head"><div class="tv-brand"><span class="logo">' + KN.logo() + "</span><div><b>" + esc(KN.shulName()) + "</b><span>" + esc(KN.shulOther()) + '</span></div></div><div class="tv-title"><b>' + title + "</b><span>" + T("פרשת ", "Parashat ") + esc(L(W.parasha)) + " · " + KN.hdate(day.hDay, day.hMonth) + " " + L(W.hYear) + '</span></div><div class="tv-clock"><b data-tv="clock"></b><span>' + esc(L(day.g)) + ", 2026</span></div></div>";
    var left = '<div class="tv-col"><div class="tv-box"><h4>' + (d.getDay() >= 5 && m !== "motzash" ? T("זמני התפילות לשבת", "Shabbat davening times") : T("זמני התפילות היום", "Today's davening times")) + '</h4><div class="tv-rows" data-tv="prayers">' + prayerRows(d, m) + "</div></div>" +
      (shab ? '<div class="tv-box"><h4>' + T("קידוש השבת", "This Shabbat's Kiddush") + '</h4><div class="tv-rows">' + S.kiddush.filter(function (k) { return !k.open; }).map(function (k) { return '<div style="display:block;font-size:25px"><b style="display:block;direction:inherit">' + esc(L(k.what)) + '</b><span style="opacity:.8">' + esc(L(k.by)) + " · " + esc(L(k.why)) + "</span></div>"; }).join("") + "</div></div>"
        : '<div class="tv-qr">' + qr() + "<div><b>" + T("סרקו לתרומה", "Scan to donate") + "</b><span>" + T("תרומה מאובטחת מהטלפון, עם קבלה למס", "A secure donation from your phone, with a tax receipt") + "</span></div></div>") + "</div>";
    var count = m === "shabbat" ? '<div class="tv-count tv-box"><span>' + T("צאת השבת", "Shabbat ends") + "</span><b>" + KN.time(W.ends) + "</b><i>" + T("רבנו תם ", "Rabbeinu Tam ") + KN.time(W.rt) + "</i></div>"
      : m === "motzash" ? '<div class="tv-count tv-box"><span>' + T("השבת יצאה", "Shabbat has ended") + "</span><b>" + T("שבוע טוב", "Shavua Tov") + "</b><i>" + T("ערבית ", "Maariv ") + KN.time(KN.hhmm(KN.mins(W.ends) - 3)) + " · " + T("רבנו תם ", "Rabbeinu Tam ") + KN.time(W.rt) + "</i></div>"
      : '<div class="tv-count tv-box"><span>' + T("הדלקת נרות בעוד", "Candle lighting in") + '</span><b data-tv="count"></b><i>' + T("הדלקת נרות ", "Candle lighting ") + KN.time(W.candle) + " · " + T("צאת השבת ", "Shabbat ends ") + KN.time(W.ends) + "</i></div>";
    var right = '<div class="tv-col">' + count + '<div class="tv-box"><h4>' + T("זמני היום", "Today's zmanim") + '</h4><div class="tv-rows z">' + zRows(day.iso) + "</div></div></div>";
    var centre;
    if (shab) {
      centre = '<div class="tv-centre"><div class="shalom"><div class="candles"><div class="candle"></div><div class="candle"></div></div><div><h3>' + T("שבת שלום", "Shabbat Shalom") + "</h3><p>" + T("שבת פרשת ", "Shabbat Parashat ") + esc(L(W.parasha)) + " · " + KN.hdate(11, 2) + '</p></div><div class="candles"><div class="candle"></div><div class="candle"></div></div></div>' +
        '<div class="tv-two"><div><h5>' + T("הקדשות", "Dedications") + "</h5>" + S.dedications.map(function (x) { return itText(L(x.text) + " · " + L(x.by), "", x.id); }).join("") + "</div><div><h5>" + T("יארצייט ואזכרות", "Yahrzeits & memorials") + "</h5>" +
        weekYahrzeits().map(function (y) { return it(L(y.name), KN.hdate(y.hDay, y.hMonth) + " · " + L(y.rel), y.id); }).join("") + S.hazkarot.map(function (h) { return it(L(h.name), L(h.by), h.id); }).join("") + "</div></div></div>";
    } else centre = '<div class="tv-centre"><div data-tv="slide" style="display:flex;flex-direction:column;flex:1;min-height:0"></div><div class="tv-dots" data-tv="dots"></div></div>';
    var sh = D.shiurim.map(function (s) { return "<span><b>" + esc(L(s.name)) + "</b> " + KN.time(s.t) + " · " + esc(L(s.who)) + "</span>"; }).join("");
    var strip = '<div class="tv-strip"><span class="lab">' + T("שיעורי תורה", "Shiurim") + '</span><div class="run"' + (shab ? ' style="animation:none"' : "") + ">" + sh + (shab ? "" : sh) + "</div></div>";
    inst.stage.className = "tv tv-fade" + (shab ? " shabbat" : "") + (KN.tvClass ? KN.tvClass(inst) : "");
    inst.stage.innerHTML = '<div class="tv-demo">' + T("הדגמה · DEMO", "DEMO") + "</div>" + (S.tvOffline ? '<div class="tv-net off">' + T("לא מקוון · ממשיך מהמטמון", "Offline · running from cache") + "</div>" : '<div class="tv-net">' + T("מוכן לא מקוון", "Offline-ready") + "</div>") + head + '<div class="tv-body">' + left + centre + right + "</div>" + strip;
    inst.mode = m; inst.slides = shab ? [] : slides(); inst.dayKey = day.iso;
    if (!shab) {
      var startAt = 0;
      if (inst.focus) inst.slides.forEach(function (s, i) { if (s.kind === inst.focus || s.ids.indexOf(inst.focus) >= 0) startAt = startAt || i; });
      if (!inst.focus && S.tvNew) inst.slides.forEach(function (s, i) { if (s.ids.indexOf(S.tvNew) >= 0) startAt = i; });
      inst.idx = startAt; inst.slideAt = Date.now(); showSlide(inst);
    }
    tick(inst);
  }
  function showSlide(inst) {
    var el = inst.stage.querySelector('[data-tv="slide"]'), dots = inst.stage.querySelector('[data-tv="dots"]'); if (!el || !inst.slides.length) return;
    inst.idx = inst.idx % inst.slides.length;
    el.innerHTML = '<div class="tv-slide">' + inst.slides[inst.idx].html + "</div>";
    dots.innerHTML = inst.slides.map(function (s, i) { return '<i class="' + (i === inst.idx ? "on" : "") + '"></i>'; }).join("");
  }
  function tick(inst) {
    var d = KN.now(), m = mode(d);
    if (m !== inst.mode || KN.today().iso !== inst.dayKey) { build(inst); if (inst.onMode) inst.onMode(m); return; }
    var c = inst.stage.querySelector('[data-tv="clock"]'); if (c) c.textContent = KN.time(pad(d.getHours()) + ":" + pad(d.getMinutes())).replace(/ (AM|PM)/, "") + ":" + pad(d.getSeconds());
    var cd = inst.stage.querySelector('[data-tv="count"]');
    if (cd) { var s = Math.max(0, Math.floor((KN.CANDLE - d.getTime()) / 1000)), dd = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), mi = Math.floor(s % 3600 / 60); cd.innerHTML = (dd ? '<span style="display:inline;font-size:.5em">' + dd + T(" ימים ", "d ") + "</span>" : "") + pad(h) + ":" + pad(mi) + ":" + pad(s % 60); }
    if (inst.mode !== "shabbat" && Date.now() - inst.slideAt > (inst.focus ? 12000 : 6500)) { inst.focus = null; inst.idx++; inst.slideAt = Date.now(); showSlide(inst); }
  }
  function scale(inst) {
    var w = inst.host.clientWidth, h = inst.host.clientHeight || w * 9 / 16, k = Math.min(w / 1920, h / 1080);
    inst.stage.style.transform = "translate(" + ((w - 1920 * k) / 2) + "px," + ((h - 1080 * k) / 2) + "px) scale(" + k + ")";
  }
  /* mount a screen in a .tvhost element; it is removed again when the view changes */
  KN.tvMount = function (host, opts) {
    var inst = { host: host, stage: document.createElement("div"), focus: (opts && opts.focus) || null, onMode: opts && opts.onMode };
    host.innerHTML = ""; host.appendChild(inst.stage);
    build(inst); scale(inst);
    inst.timer = setInterval(function () { tick(inst); }, 250);
    inst.ro = new ResizeObserver(function () { scale(inst); }); inst.ro.observe(host);
    live.push(inst);
    KN.cleanup.push(function () { clearInterval(inst.timer); inst.ro.disconnect(); live = live.filter(function (x) { return x !== inst; }); });
    return inst;
  };
  /* redraw every mounted screen (after an edit, a re-skin, a language change); focus = a kind or an item id to show first */
  KN.tvRefresh = function (focus) { live.forEach(function (inst) { inst.focus = focus || null; build(inst); scale(inst); }); };
})();
