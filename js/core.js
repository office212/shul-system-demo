/* Kehillat Noam | the demo's engine: state (in this browser only), language, roles,
   the simulated clock, routing, the demo bar, toasts, modals. No server, no keys:
   nothing here talks to any backend. */
(function () {
  "use strict";
  var D = window.KN_DATA, G = window.KN_GEN, KEY = "knSalesDemo.v1";
  var KN = window.KN = { views: {}, act: {}, on: {}, cleanup: [] };
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function fresh() {
    return { lang: "he", role: "visitor", clock: "friPM", theme: { id: "classic", p: "#0e2c4c", a: "#b48e56" }, shul: clone(D.shul),
      members: clone(D.members), donations: clone(D.donations), unmatched: clone(D.unmatched), joinReqs: clone(D.joinReqs), yahrzeits: clone(D.yahrzeits),
      dedications: clone(D.dedications), hazkarot: clone(D.hazkarot), mazal: clone(D.mazal), announcements: clone(D.announcements), kiddush: clone(D.kiddush),
      prayers: clone(D.prayers), motzashRule: true, notifications: clone(D.notifications), activity: clone(D.activity), seq: 417, lastDonation: null, lastJoin: null, newIds: {} };
  }
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
  if (!S || !S.members || !S.shul) S = fresh();
  S.newIds = {};
  KN.S = S;
  KN.save = function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage is off or full: the demo still runs for this visit */ } };
  KN.reset = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.hash = "#/landing"; location.reload(); };

  /* ---------- words ---------- */
  var T = KN.T = function (he, en) { return S.lang === "he" ? he : en; };
  var L = KN.L = function (b) { return b == null ? "" : typeof b === "string" ? b : (b[S.lang] != null ? b[S.lang] : b.he); };
  var esc = KN.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  KN.money = function (n) { var v = Math.round(Number(n) * 100) / 100, neg = v < 0; v = Math.abs(v); var s = v.toLocaleString("en-US", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); return '<span class="num">' + (neg ? "−" : "") + "$" + s + "</span>"; };
  KN.moneyT = function (n) { var v = Math.round(Number(n) * 100) / 100; return "$" + v.toLocaleString("en-US", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
  KN.time = function (hhmm) { var p = String(hhmm).split(":"), h = +p[0], m = p[1], h12 = h % 12 || 12; return h12 + ":" + m + (S.lang === "en" ? (h < 12 ? " AM" : " PM") : ""); };
  KN.mins = function (t) { var p = String(t).split(":"); return +p[0] * 60 + +p[1]; };
  KN.hhmm = function (m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  var MON = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"], MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  KN.date = function (iso) { var p = String(iso).split("-"); return S.lang === "he" ? (+p[2]) + " ב" + MON[+p[1] - 1] : MON_EN[+p[1] - 1] + " " + (+p[2]); };
  KN.hdate = function (day, month) { return S.lang === "he" ? D.HDAY[day] + " ב" + D.HMONTHS[month].he : day + " " + D.HMONTHS[month].en; };
  KN.shulName = function () { return S.lang === "he" ? S.shul.nameHe : S.shul.nameEn; };
  KN.shulOther = function () { return S.lang === "he" ? S.shul.nameEn : S.shul.nameHe; };
  KN.initials = function (m) { var w = L(m.name).split(" "); return (w[0][0] || "") + (w.length > 1 ? w[w.length - 1][0] : ""); };

  /* ---------- icons and the sample logos (plain geometric marks) ---------- */
  var IC = { home: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6", clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2", tv: "M3 5h18v12H3zM8 21h8M12 17v4", user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6",
    coins: "M12 3v18M17 7H9.5a2.5 2.5 0 000 5h5a2.5 2.5 0 010 5H6", shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", heart: "M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z", bell: "M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 004 0",
    users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5M16 4.5a3.5 3.5 0 010 6.5M18 14.8c2.4.6 4 2.3 4 5.2", book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 21V5M8 7h7M8 11h7", palette: "M12 3a9 9 0 100 18c1.5 0 2-1 2-2 0-1.6 1-2 2.5-2H18a3 3 0 003-3c0-6-4-11-9-11zM7.5 12h.01M9.5 7.5h.01M14.5 7h.01",
    play: "M7 4l13 8-13 8z", check: "M4 12l5 5L20 6", lock: "M6 11h12v9H6zM8 11V8a4 4 0 018 0v3", search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5", plus: "M12 5v14M5 12h14", trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
    print: "M7 8V3h10v5M7 17H4v-7h16v7h-3M7 14h10v7H7z", mail: "M3 6h18v12H3zM3 7l9 7 9-7", phone: "M6 3h4l1.5 5-2.5 1.5a11 11 0 005.5 5.5L16 12.5l5 1.5v4c0 1-1 2-2 2C10.5 20 4 13.500 4 5c0-1 1-2 2-2z", cal: "M4 6h16v15H4zM4 10h16M8 3v5M16 3v5",
    star: "M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.300 6.400 20.300l1.200-6.300L3 9.600l6.300-.8z", cloud: "M7 18a4 4 0 01-.5-8 5.5 5.5 0 0110.600-1A4.500 4.500 0 0117 18z", globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18", key: "M14 10a4 4 0 11-3.900-4 4 4 0 013.900 4zM13 12l8 8M17 16l2-2",
    edit: "M4 20l4-1L19 8l-3-3L5 16zM14 6l3 3", flame: "M12 3c1 4 5 5.500 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z", list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01", arrow: "M5 12h14M13 6l6 6-6 6", x: "M6 6l12 12M18 6L6 18", eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z", gift: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" };
  var ic = KN.ic = function (n, cls) { return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (IC[n] || IC.star) + '"/></svg>'; };
  var MARKS = {
    arch: '<path d="M10 44V22a14 14 0 0128 0v22" fill="none" stroke="currentColor" stroke-width="3"/><path d="M6 44h36" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="4.5" fill="currentColor"/><path d="M24 12v4M15.500 16l2.500 3M32.500 16L30 19" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/>',
    rings: '<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" stroke-width="2.200"/><circle cx="24" cy="24" r="3.500" fill="currentColor"/>',
    diamond: '<path d="M24 5l19 19-19 19L5 24z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 14l10 10-10 10-10-10z" fill="currentColor"/>',
    rays: '<path d="M8 36a16 16 0 0132 0z" fill="currentColor"/><path d="M24 6v8M9 13l5 6M39 13l-5 6M4 26l7 2M44 26l-7 2" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M6 42h36" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'
  };
  KN.MARKS = MARKS;
  KN.logo = function () { var l = S.shul.logo; if (/^data:image\//.test(l)) return '<img alt="" src="' + l + '">'; return '<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">' + (MARKS[l] || MARKS.arch) + "</svg>"; };

  /* ---------- the simulated clock (one fixed week) ---------- */
  var W = D.WEEK;
  function at(iso, hhmm, sec) { var p = iso.split("-"), t = hhmm.split(":"); return new Date(+p[0], +p[1] - 1, +p[2], +t[0], +t[1], sec || 0).getTime(); }
  KN.at = at;
  var CANDLE = at(W.friday, W.candle), ENDS = at(W.shabbat, W.ends);
  KN.PRESETS = [
    { id: "wed", he: "יום רביעי בבוקר", en: "Wednesday morning", t: at("2026-11-18", "10:20") },
    { id: "friPM", he: "שישי אחר הצהריים", en: "Friday afternoon", t: at(W.friday, "14:45") },
    { id: "friSoon", he: "12 שניות לפני הדלקת נרות", en: "12 seconds before candle lighting", t: CANDLE - 12000 },
    { id: "friLit", he: "שישי, אחרי הדלקת נרות", en: "Friday, after candle lighting", t: at(W.friday, "16:40") },
    { id: "shabAM", he: "שבת בבוקר", en: "Shabbat morning", t: at(W.shabbat, "09:30") },
    { id: "motzash", he: "מוצאי שבת", en: "Saturday night", t: at(W.shabbat, "17:45") }
  ];
  var clockBase, clockSet;
  KN.setClock = function (id, quiet) {
    var p = KN.PRESETS.filter(function (x) { return x.id === id; })[0] || KN.PRESETS[1];
    S.clock = p.id; clockBase = p.t; clockSet = Date.now(); KN.save();
    if (!quiet) { KN.renderBar(); KN.render(); }
  };
  KN.now = function () { return new Date(clockBase + (Date.now() - clockSet)); };
  KN.isShabbat = function (d) { var t = (d || KN.now()).getTime(); return t >= CANDLE && t < ENDS; };
  KN.CANDLE = CANDLE; KN.ENDS = ENDS;
  KN.today = function () { var d = KN.now(); return W.days[Math.min(6, Math.max(0, d.getDate() - 15))]; };
  KN.todayIso = function () { return KN.today().iso; };
  KN.zman = function (iso) { return G.zmanim[iso]; };
  KN.dayPrayers = function (dow) { return S.prayers.filter(function (p) { return p.days.indexOf(dow) >= 0; }).map(function (p) { return p.rule === "motzash" && S.motzashRule ? Object.assign({}, p, { time: KN.hhmm(KN.mins(W.ends) - 3) }) : p; }).sort(function (a, b) { return KN.mins(a.time) - KN.mins(b.time); }); };

  /* ---------- people, balances ---------- */
  KN.member = function (id) { return S.members.filter(function (m) { return m.id === id; })[0]; };
  KN.balance = function (m) { return Math.round((m.ledger || []).reduce(function (a, e) { return a + (e.type === "charge" ? e.amount : -e.amount); }, 0) * 100) / 100; };
  KN.ROLES = [{ id: "visitor", he: "אורח", en: "Visitor" }, { id: "member", he: "מתפלל", en: "Member" }, { id: "finance", he: "גבאי כספים", en: "Finance gabbai" }, { id: "content", he: "גבאי תוכן", en: "Content gabbai" }, { id: "admin", he: "מנהל ראשי", en: "Admin / Super admin" }];
  KN.roleName = function (id) { var r = KN.ROLES.filter(function (x) { return x.id === id; })[0]; return r ? T(r.he, r.en) : id; };
  KN.me = function () { return KN.member({ member: "m1", finance: "m9", content: "m10", admin: "m12" }[S.role] || ""); };
  KN.can = function (what) { var r = S.role; return what === "finance" ? (r === "finance" || r === "admin") : what === "content" ? (r === "content" || r === "admin") : what === "admin" ? r === "admin" : what === "member" ? r !== "visitor" : true; };
  KN.setRole = function (r, go) { S.role = r; KN.save(); KN.renderBar(); if (go) { if (location.hash === "#/" + go) KN.render(); else location.hash = "#/" + go; } else KN.render(); KN.toast(T("מציגים עכשיו כ: ", "Now viewing as: ") + KN.roleName(r)); };
  KN.nextRef = function () { S.seq++; return "KN-2026-" + String(S.seq).padStart(5, "0"); };
  KN.notify = function (n) { n.id = "N" + Date.now() + Math.floor(Math.random() * 99); n.unread = true; n.when = D.B("עכשיו", "Just now"); S.notifications.unshift(n); KN.save(); KN.renderBar(); };
  KN.log = function (kind, text) { S.activity.unshift({ kind: kind, text: text, when: D.B("עכשיו", "Just now"), fresh: true }); KN.save(); };
  KN.myNotifs = function () { return S.notifications.filter(function (n) { return n.to.indexOf(S.role) >= 0; }); };

  /* ---------- toast, modal, panel ---------- */
  KN.toast = function (msg) {
    var host = document.getElementById("toasts"), el = document.createElement("div");
    el.className = "toast"; el.setAttribute("role", "status"); el.innerHTML = ic("check") + "<span>" + msg + "</span>";
    host.appendChild(el);
    setTimeout(function () { el.classList.add("out"); setTimeout(function () { el.remove(); }, 320); }, 3200);
  };
  KN.modal = function (html, wide) {
    KN.closeModal();
    var o = document.createElement("div"); o.className = "overlay"; o.id = "modal";
    o.innerHTML = '<div class="modal' + (wide ? " wide" : "") + '" role="dialog" aria-modal="true"><button class="x no-print" data-act="closeModal" aria-label="' + T("סגירה", "Close") + '">×</button>' + html + "</div>";
    o.addEventListener("mousedown", function (e) { if (e.target === o) KN.closeModal(); });
    document.body.appendChild(o);
    return o;
  };
  KN.closeModal = function () { var o = document.getElementById("modal"); if (o) o.remove(); };
  KN.act.closeModal = KN.closeModal;
  KN.panel = function (title, body) {
    KN.closePanel();
    var s = document.createElement("div"); s.className = "scrim"; s.id = "scrim"; s.addEventListener("click", KN.closePanel);
    var p = document.createElement("aside"); p.className = "panel"; p.id = "panel";
    p.innerHTML = '<div class="panel-h"><h3>' + title + '</h3><button class="x" data-act="closePanel" aria-label="' + T("סגירה", "Close") + '">×</button></div><div class="panel-b">' + body + "</div>";
    document.body.appendChild(s); document.body.appendChild(p);
  };
  KN.closePanel = function () { ["scrim", "panel"].forEach(function (i) { var e = document.getElementById(i); if (e) e.remove(); }); };
  KN.act.closePanel = KN.closePanel;
  KN.mail = function (o) {
    return '<div class="mail"><div class="mail-h"><span>' + T("מאת", "From") + '</span><b>' + esc(o.from) + '</b><span>' + T("אל", "To") + '</span><bdi class="ltr">' + esc(o.to) + '</bdi><span>' + T("נושא", "Subject") + "</span><b>" + esc(o.subject) + '</b></div><div class="mail-b">' + o.body + "</div></div>" +
      '<p class="note" style="margin-top:12px">' + T("זו תצוגה של המייל כפי שהמערכת שולחת אותו. בהדגמה שום מייל לא נשלח באמת.", "This is the email exactly as the system sends it. In the demo no email is really sent.") + "</p>";
  };
  KN.countUp = function (root) {
    (root || document).querySelectorAll("[data-count]").forEach(function (el) {
      var to = +el.getAttribute("data-count"), pre = el.getAttribute("data-pre") || "", t0 = performance.now(), dur = 1100;
      (function step(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + Math.round(to * e).toLocaleString("en-US"); if (k < 1) requestAnimationFrame(step); })(t0);
    });
  };

  /* ---------- theme ---------- */
  KN.THEMES = [
    { id: "classic", he: "כחול וזהב", en: "Navy & Gold", p: "#0e2c4c", a: "#b48e56", bg: "#f8f4ec", surface: "#fffdf9", line: "#e4d8c2" },
    { id: "sea", he: "ים ונחושת", en: "Sea & Copper", p: "#0f4c5c", a: "#d0773d", bg: "#f3f6f4", surface: "#fdfefd", line: "#d5e0dc" },
    { id: "bordeaux", he: "בורדו וחול", en: "Bordeaux & Sand", p: "#5b1f2c", a: "#c39a4a", bg: "#faf4ef", surface: "#fffdfb", line: "#ead9cf" }
  ];
  KN.applyTheme = function () {
    var t = KN.THEMES.filter(function (x) { return x.id === S.theme.id; })[0] || KN.THEMES[0], r = document.documentElement.style;
    r.setProperty("--p", S.theme.p || t.p); r.setProperty("--a", S.theme.a || t.a); r.setProperty("--bg", t.bg); r.setProperty("--surface", t.surface); r.setProperty("--line", t.line);
  };

  /* ---------- the demo bar ---------- */
  KN.NAV = [["landing", "בית", "Home", "home"], ["times", "זמני תפילה", "Davening times", "clock"], ["tv", "מסך בית הכנסת", "The TV screen", "tv"], ["donate", "תרומות", "Donate", "heart"], ["join", "הצטרפות", "Join", "users"],
    ["member", "האזור האישי", "My account", "user", "member"], ["finance", "כספים", "Finance", "coins", "finance"], ["admin", "ניהול", "Admin", "shield", "content"], ["notifications", "התראות", "Notifications", "bell"], ["included", "מה כלול", "What's included", "list"]];
  KN.renderBar = function () {
    var cur = KN.route().name, unread = KN.myNotifs().filter(function (n) { return n.unread; }).length;
    document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === "he" ? "rtl" : "ltr";
    document.title = KN.shulName() + " · " + T("הדגמת המערכת", "System demo");
    document.getElementById("bar").innerHTML =
      '<div class="bar-top"><button class="brand" data-go="landing"><span class="logo">' + KN.logo() + "</span><b>" + esc(KN.shulName()) + '</b></button><span class="demo-badge">' + T("הדגמה · DEMO", "DEMO") + '</span><span class="bar-sp"></span><div class="bar-tools">' +
      '<label class="role-sw"><span>' + T("מציגים כ:", "Viewing as:") + '</span><select id="roleSel" data-on="role" aria-label="' + T("תפקיד", "Role") + '">' + KN.ROLES.map(function (r) { return '<option value="' + r.id + '"' + (r.id === S.role ? " selected" : "") + ">" + T(r.he, r.en) + "</option>"; }).join("") + "</select></label>" +
      '<span class="lang" role="group" aria-label="Language"><button data-act="lang" data-l="he" aria-pressed="' + (S.lang === "he") + '">עב</button><button data-act="lang" data-l="en" aria-pressed="' + (S.lang === "en") + '">EN</button></span>' +
      '<button class="tb" data-act="bell" aria-label="' + T("התראות", "Notifications") + '">' + ic("bell") + (unread ? '<span class="dot">' + unread + "</span>" : "") + "</button>" +
      '<button class="tb" data-act="customize">' + ic("palette") + '<span class="w">' + T("התאמה אישית", "Customize") + "</span></button>" +
      '<button class="tb gold" data-act="tourStart">' + ic("play") + "<span>" + T("סיור מודרך", "Take the tour") + "</span></button></div></div>" +
      '<nav class="nav" aria-label="' + T("חלקי ההדגמה", "Demo sections") + '">' + KN.NAV.map(function (n) {
        var locked = n[4] && !KN.can(n[4]);
        return '<button data-go="' + n[0] + '"' + (cur === n[0] ? ' aria-current="page"' : "") + ">" + ic(n[3]) + T(n[1], n[2]) + (locked ? ic("lock", "lock") : "") + "</button>";
      }).join("") + "</nav>";
  };

  /* ---------- routing ---------- */
  KN.route = function () { var h = (location.hash || "#/landing").replace(/^#\/?/, "").split("/"); return { name: KN.views[h[0]] ? h[0] : "landing", arg: h[1] || "", arg2: h[2] || "" }; };
  KN.go = function (name) { if (location.hash === "#/" + name) KN.render(); else location.hash = "#/" + name; };
  KN.lockPage = function (need) {
    var names = { member: ["member"], finance: ["finance", "admin"], content: ["content", "admin"], admin: ["admin"] }[need];
    return '<div class="page"><div class="card lock-page"><div class="big">' + ic("lock") + "</div><h2>" + T("המסך הזה שמור לבעלי תפקיד", "This screen is for a specific role") + '</h2><p class="lede" style="margin:8px auto 18px">' +
      T("במערכת האמיתית רק ", "In the real system only ") + names.map(KN.roleName).join(T(" או ", " or ")) + T(" רואים את המסך הזה. בהדגמה אפשר להחליף תפקיד בלחיצה, בלי סיסמה.", " can see this screen. In the demo you switch roles with one click, no password.") +
      '</p><div class="row" style="justify-content:center">' + names.map(function (r) { return '<button class="btn" data-act="asRole" data-r="' + r + '">' + T("להציג כ", "View as ") + KN.roleName(r) + "</button>"; }).join("") + "</div></div></div>";
  };
  KN.act.asRole = function (el) { KN.setRole(el.dataset.r); };
  KN.render = function () {
    KN.cleanup.splice(0).forEach(function (f) { try { f(); } catch (e) {} });
    var r = KN.route(), v = KN.views[r.name], root = document.getElementById("view");
    root.innerHTML = v.need && !KN.can(v.need) ? KN.lockPage(v.need) : v.render(r.arg, r.arg2);
    if (!(v.need && !KN.can(v.need)) && v.after) v.after(root, r.arg, r.arg2);
    KN.countUp(root);
    document.querySelectorAll(".nav button").forEach(function (b) { if (b.dataset.go === r.name) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    var curBtn = document.querySelector('.nav button[aria-current="page"]'); if (curBtn && curBtn.scrollIntoView) curBtn.scrollIntoView({ block: "nearest", inline: "center" });
    S.newIds = {};
  };
  window.addEventListener("hashchange", function () { KN.closePanel(); KN.closeModal(); KN.render(); window.scrollTo(0, 0); if (KN.tourSync) KN.tourSync(); });

  /* ---------- events ---------- */
  document.addEventListener("click", function (ev) {
    var g = ev.target.closest("[data-go]"); if (g) { ev.preventDefault(); KN.go(g.dataset.go); return; }
    var a = ev.target.closest("[data-act]"); if (a && KN.act[a.dataset.act]) { ev.preventDefault(); KN.act[a.dataset.act](a, ev); }
  });
  function onInput(ev) { var t = ev.target; if (t && t.dataset && t.dataset.on && KN.on[t.dataset.on] && (ev.type === (t.dataset.ev || "input") || (ev.type === "change" && /^(SELECT)$/.test(t.tagName)) || (ev.type === "change" && (t.type === "checkbox" || t.type === "file" || t.type === "color" || t.type === "time")))) KN.on[t.dataset.on](t, ev); }
  document.addEventListener("input", function (ev) { var t = ev.target; if (t.tagName === "SELECT" || t.type === "checkbox" || t.type === "file" || t.type === "time") return; onInput(ev); });
  document.addEventListener("change", function (ev) { var t = ev.target; if (t.tagName === "SELECT" || t.type === "checkbox" || t.type === "file" || t.type === "time") onInput(ev); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { KN.closeModal(); KN.closePanel(); } });
  KN.on.role = function (el) { KN.setRole(el.value); };
  KN.act.lang = function (el) { S.lang = el.dataset.l; KN.save(); KN.renderBar(); KN.render(); if (KN.tourSync) KN.tourSync(true); };

  /* ---------- the bell ---------- */
  var NK = { payment: "coins", join: "users", times: "clock", announce: "bell", yahrzeit: "flame", approval: "check" };
  KN.ntfHtml = function (n) { return '<div class="ntf' + (n.unread ? " unread" : "") + '"><span class="ni">' + ic(NK[n.kind] || "bell") + '</span><div><b>' + esc(L(n.title)) + "</b>" + esc(L(n.body)) + '<div class="t">' + esc(L(n.when)) + "</div></div></div>"; };
  KN.act.bell = function () {
    var list = KN.myNotifs();
    KN.panel(T("התראות", "Notifications") + " · " + KN.roleName(S.role), (list.length ? list.map(KN.ntfHtml).join("") :
      '<p class="muted">' + T("אורח לא מקבל התראות. החליפו תפקיד (למעלה) כדי לראות את הפעמון של מתפלל או של גבאי.", "A visitor gets no notifications. Switch role (above) to see a member's or a gabbai's bell.") + "</p>") +
      '<button class="btn sec" data-go="notifications">' + T("איך ההתראות עובדות", "How notifications work") + "</button>");
    list.forEach(function (n) { n.unread = false; }); KN.save(); setTimeout(KN.renderBar, 600);
  };

  KN.start = function () {
    KN.applyTheme(); KN.setClock(S.clock || "friPM", true); KN.renderBar(); KN.render();
  };
})();
