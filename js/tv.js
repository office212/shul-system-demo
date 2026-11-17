/* Shul system sales demo | the always-on TV screen (#/tv).
   A 16:9 board scaled to any screen: daily zmanim, davening times, the community board,
   Shabbat mode, the Netz countdown, the parasha line, brightness and remote refresh.
   One fixed look: Hebrew with small English lines (the TV does not follow the site language). */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, esc = S.esc;

  var TV_TEXTS = {
    colZmanim: { he: "זמני היום", en: "Zmanim" },
    colPrayers: { he: "זמני תפילות", en: "Davening Times" },
    boardTitle: { he: "לוח הקהילה", en: "Community Board" },
    nextZman: { he: "הזמן הבא", en: "Next" },
    centerShabbat: { he: "שבת שלום", en: "Shabbat Shalom" },
    welcomeTitle: { he: "ברוכים הבאים", en: "Welcome" },
    welcomeBody: { he: "ברוכים הבאים לבית הכנסת. נשמח לראותכם בתפילות ובשיעורים.", en: "Welcome to our shul. We look forward to seeing you at davening and shiurim." },
    donateTitle: { he: "תרומה לבית הכנסת", en: "Donate to the Shul" },
    donateLine: { he: "סרקו לתרומה מאובטחת בכרטיס, Apple Pay או Google Pay", en: "Scan to give securely by card, Apple Pay or Google Pay" },
    comingParasha: { he: "השבת הקרובה פרשת {parasha}", en: "This coming Shabbat, Parashat {parasha}" }
  };
  function T(k, lang) { var o = (S.db.tvTexts || {})[k] || {}; var d = TV_TEXTS[k]; return (o[lang] && String(o[lang]).trim()) || d[lang]; }
  var tm = function (m) { return S.hm(m, false); };
  var EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var BOARD_LABEL = {
    announcement: ["הכרזות", "Announcements"], mazaltov: ["מזל טוב", "Mazal Tov"], flyer: ["פלייר", "Flyer"],
    sponsor: ["נתרם על ידי", "Donated By"], parnas: ["פרנס היום ונר למאור", "Parnas Hayom and Ner Lamaor"],
    hazkara: ["הזכרות ותנחומים", "Hazkarot and Condolences"], yahrzeit: ["יארצייט השבוע", "Yahrzeits This Week"],
    dedication: ["הקדשות", "Dedications"]
  };

  /* ---------- what to show ---------- */
  function visible(it, d, shabbat) {
    if (it.status !== "published") return false;
    var dow = d.getDay(), di = S.iso(d);
    if (it.from && di < it.from) return false;
    if (it.to && di > it.to) return false;
    if (it.showOn === "weekday" && shabbat) return false;
    if (it.showOn === "shabbat" && !shabbat) return false;
    if (it.showOn === "days" && (it.weekdays || []).indexOf(dow) < 0) return false;
    return true;
  }
  function yahrzeitsThisWeek() {
    return S.db.yahrzeits.filter(function (y) { return y.status === "published" && y.hmonth === 2 && y.hday >= 5 && y.hday <= 11; })
      .sort(function (a, b) { return a.hday - b.hday; });
  }
  function prayerTime(p) { if (p.rel === "endsMinus3") return S.shabbatTimes().ends - 3; return p.time; }
  function sheetRows(day) {
    var sh = S.db.sheet;
    return sh.rows.filter(function (r) { return r.day === day && !r.hidden && /^(prayer:|manual|endsMinus3)/.test(r.src || "manual"); })
      .map(function (r) { return { he: r.he, en: r.en, time: window.SHUL_SHEET.rowTime(r) }; })
      .filter(function (r) { return r.time != null; });
  }
  function groupRows(group, dow) {
    return S.db.prayers.filter(function (p) {
      if (p.group !== group) return false;
      if (group === "weekday" && p.days === "days") return (p.weekdays || []).indexOf(dow) >= 0;
      return true;
    }).map(function (p) { return { he: p.he, en: p.en, time: prayerTime(p) }; }).filter(function (r) { return r.time != null; })
      .sort(function (a, b) { return a.time - b.time; });
  }
  function daveningGroups(d, forceShabbat) {
    var dow = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    var onTv = S.db.sheet.onTv;
    var fri = onTv ? groupRows("friday", 5).filter(function (r) { return r.time < 720; }).concat(sheetRows("fri")) : groupRows("friday", 5);
    var sat = onTv ? sheetRows("sat") : groupRows("shabbat", 6);
    var groups = [];
    if (forceShabbat || (dow === 5 && m >= S.shabbatTimes().candles) || (dow === 6 && S.dayState(d) === "shabbat")) {
      groups.push({ he: "שבת", en: "Shabbat", rows: sat, keep: true });
      return groups;
    }
    if (dow === 5) {
      groups.push({ he: "ערב שבת", en: "Erev Shabbat", rows: fri.filter(function (r) { return r.time + 60 > m; }) });
      groups.push({ he: "שבת", en: "Shabbat", rows: sat, keep: true });
      return groups;
    }
    var today = dow === 6 ? [] : groupRows("weekday", dow).filter(function (r) { return r.time + 60 > m; });
    if (today.length) groups.push({ he: "היום", en: "Today", rows: today });
    else {
      var td = (dow + 1) % 7;
      groups.push({ he: "מחר", en: "Tomorrow", rows: td === 5 ? fri : td === 6 ? sat : groupRows("weekday", td) });
    }
    return groups;
  }

  /* ---------- pieces ---------- */
  function candle(side) {
    return '<svg class="tv-candle ' + side + '" viewBox="0 0 60 200" aria-hidden="true"><defs><linearGradient id="wax' + side + '" x1="0" x2="1"><stop offset="0" stop-color="#efe6d2"/><stop offset=".5" stop-color="#fffaf0"/><stop offset="1" stop-color="#e2d6bd"/></linearGradient>' +
      '<radialGradient id="glow' + side + '"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf6b" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="30" cy="40" r="30" fill="url(#glow' + side + ')"/><path class="flame" d="M30 14c7 10 10 17 10 24a10 10 0 0 1-20 0c0-7 3-14 10-24z" fill="#ffc94d"/><path class="flame" d="M30 26c3.5 5 5 8.5 5 12a5 5 0 0 1-10 0c0-3.5 1.5-7 5-12z" fill="#fff3c4"/>' +
      '<rect x="29" y="46" width="2" height="8" fill="#3b3020"/><rect x="18" y="54" width="24" height="120" rx="3" fill="url(#wax' + side + ')" stroke="#d6c7a6"/><rect x="10" y="172" width="40" height="10" rx="3" fill="var(--gold)"/><rect x="16" y="182" width="28" height="12" rx="2" fill="var(--gold)" opacity=".8"/></svg>';
  }
  function shabbatCard(small) {
    return '<div class="tv-shcard ' + (small ? "small" : "") + '">' + candle("l") + '<div class="tv-shtext"><div class="he">' + esc(T("centerShabbat", "he")) + '</div><div class="en">' + esc(T("centerShabbat", "en")) + '</div><div class="par">פרשת ' + S.PARASHA.he + " | Parashat " + S.PARASHA.en + "</div></div>" + candle("r") + "</div>";
  }
  function qr() {
    var n = 25, cells = "", s = 11;
    function r() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
    function finder(x, y) { return '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#111"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" fill="#111"/>'; }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue;
      if (r() < 0.48) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    return '<svg class="tv-qr" viewBox="-1 -1 27 27" shape-rendering="crispEdges"><rect x="-1" y="-1" width="27" height="27" fill="#fff"/><g fill="#111">' + cells + "</g>" + finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7) + "</svg>";
  }
  function listItems(items) {
    return items.map(function (it) {
      if (it.name) return '<div class="tv-li"><div class="he">' + esc(it.name.he) + ' <span class="date">' + S.HEB_NUM[it.hday] + " " + S.HEB_MONTHS[it.hmonth].he + '</span></div><div class="en">' + esc(it.name.en) + (it.relation ? " · " + esc(it.relation.en) : "") + "</div></div>";
      return '<div class="tv-li"><div class="he">' + (it.title && it.type !== "announcement" ? '<b class="kind">' + esc(it.title.he) + ":</b> " : "") + esc(it.text.he) + '</div><div class="en">' + esc(it.text.en) + "</div></div>";
    }).join("");
  }
  function boardsFor(d, shabbat) {
    var items = allItems().filter(function (it) { return visible(it, d, shabbat) && it.type !== "ticker"; });
    var by = function (t) { return items.filter(function (i) { return i.type === t; }); };
    var yz = yahrzeitsThisWeek();
    if (shabbat) {
      return { lines: by("sponsor").concat(by("parnas"), by("dedication")), hazkarot: by("hazkara"), yz: yz };
    }
    var b = [];
    b.push({ kind: "welcome", html: '<div class="tv-welcome"><div class="he">' + esc(T("welcomeTitle", "he")) + '</div><div class="en">' + esc(T("welcomeTitle", "en")) + '</div><p class="hb">' + esc(T("welcomeBody", "he")) + '</p><p class="eb">' + esc(T("welcomeBody", "en")) + "</p></div>" });
    if (by("announcement").length) b.push({ kind: "announcement", html: '<div class="tv-list">' + by("announcement").slice(0, 4).map(function (a) { return '<div class="tv-li"><div class="he"><b class="kind">' + esc(a.title.he) + "</b> " + esc(a.text.he) + '</div><div class="en"><b>' + esc(a.title.en) + "</b> " + esc(a.text.en) + "</div></div>"; }).join("") + "</div>" });
    by("mazaltov").forEach(function (m) { b.push({ kind: "mazaltov", html: '<div class="tv-mazal"><div class="mt">מזל טוב</div><div class="mte">Mazal Tov</div><p class="hb">' + esc(m.text.he) + '</p><p class="eb">' + esc(m.text.en) + "</p></div>" }); });
    by("flyer").forEach(function (f) { b.push({ kind: "flyer", html: '<div class="tv-flyer ' + (f.style || "") + '"><div class="ft">' + esc(f.title.he) + '</div><div class="fte">' + esc(f.title.en) + '</div><div class="fb">' + esc(f.text.he) + '</div><div class="fbe">' + esc(f.text.en) + "</div></div>" }); });
    var ded = by("sponsor").concat(by("parnas"), by("dedication"));
    if (ded.length) b.push({ kind: "sponsor", html: '<div class="tv-list">' + listItems(ded) + "</div>" });
    if (yz.length) b.push({ kind: "yahrzeit", html: '<div class="tv-list">' + listItems(yz) + "</div>" });
    if (by("hazkara").length) b.push({ kind: "hazkara", html: '<div class="tv-list">' + listItems(by("hazkara")) + "</div>" });
    b.push({ kind: "donate", html: '<div class="tv-donate">' + qr() + '<div><div class="he">' + esc(T("donateTitle", "he")) + '</div><div class="en">' + esc(T("donateTitle", "en")) + '</div><p class="hb">' + esc(T("donateLine", "he")) + '</p><p class="eb">' + esc(T("donateLine", "en")) + '</p><p class="eb">Zelle: ' + esc(S.db.shul.zelle) + "</p></div></div>" });
    return b;
  }
  function boardHead(kind) {
    if (kind === "welcome" || kind === "donate") return "";
    var l = BOARD_LABEL[kind] || BOARD_LABEL.dedication;
    return '<div class="tv-bhead"><span class="he">' + l[0] + '</span><span class="en">' + l[1] + "</span></div>";
  }

  /* an unsaved item previewed by the editor (production: the TV preview before publishing) */
  var draft = null;
  function allItems() {
    if (!draft) return S.db.items;
    var d = Object.assign({}, draft, { status: "published" }), found = false;
    var list = S.db.items.map(function (it) { if (it.id === d.id) { found = true; return d; } return it; });
    return found ? list : [d].concat(list);
  }
  /* ---------- the screen ---------- */
  var state = { idx: 0, preview: false, shabbatPreview: false, stage: null, root: null, timers: [] };
  function titleFor(st, d) {
    if (st === "shabbat") return ["שבת שלום", "Good Shabbat"];
    if (st === "erev") return ["ערב שבת קודש", "Erev Shabbat Kodesh"];
    if (st === "motzei") return ["שבוע טוב", "Shavua Tov"];
    return ["יום " + S.DAY_HE[d.getDay()], S.DAY_EN[d.getDay()]];
  }
  function build() {
    var root = state.stage; if (!root) return;
    var d = S.now(), m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    var st = state.shabbatPreview ? "shabbat" : S.dayState(d);
    var shabbat = st === "shabbat";
    var dow = d.getDay(), stt = S.shabbatTimes();
    var z = S.zmanim(d), tomorrow = false;
    if (!shabbat && m > z.tzeit + 1) { var dt = new Date(d); dt.setDate(d.getDate() + 1); if (S.dayIdx(dt) <= 6) { z = S.zmanim(dt); tomorrow = true; } }
    var nextKey = null;
    if (!tomorrow) for (var i = 0; i < S.ZLIST.length; i++) { if (z[S.ZLIST[i][0]] > m) { nextKey = S.ZLIST[i][0]; break; } }
    var zrows = S.ZLIST.map(function (zz) {
      var past = !tomorrow && z[zz[0]] <= m;
      return '<div class="tv-zrow ' + (past ? "past" : "") + (zz[0] === nextKey ? " next" : "") + '"><div><div class="he">' + zz[1] + '</div><div class="en">' + zz[2] + '</div></div><div class="t">' + tm(z[zz[0]]) + "</div></div>";
    }).join("");
    var showShabbatBlock = dow === 5 || (dow === 6 && m < stt.rt + 5) || shabbat;
    var sblock = showShabbatBlock ? '<div class="tv-sblock"><div class="tv-sbt"><span class="he">שבת קודש · פרשת ' + S.PARASHA.he + '</span><span class="en">Shabbat Kodesh · Parashat ' + S.PARASHA.en + "</span></div>" +
      [["הדלקת נרות", "Candle Lighting", stt.candles], ["צאת שבת", "Motzei Shabbat", stt.ends], ["רבינו תם", "Rabbeinu Tam", stt.rt]].map(function (r) { return '<div class="tv-zrow"><div><div class="he">' + r[0] + '</div><div class="en">' + r[1] + '</div></div><div class="t">' + tm(r[2]) + "</div></div>"; }).join("") + "</div>"
      : '<div class="tv-parline"><span class="he">' + esc(T("comingParasha", "he").replace("{parasha}", S.PARASHA.he)) + '</span><span class="en">' + esc(T("comingParasha", "en").replace("{parasha}", S.PARASHA.en)) + "</span></div>";

    /* davening column */
    var groups = daveningGroups(d, state.shabbatPreview);
    var nextMinyan = null;
    groups.forEach(function (g) { g.rows.forEach(function (r) { if (!nextMinyan && g.he !== "מחר" && r.time > m && !(g.keep && dow === 5 && !shabbat)) nextMinyan = r; }); });
    var prow = groups.map(function (g) {
      return '<div class="tv-pgroup"><span class="he">' + g.he + '</span><span class="en">' + g.en + "</span></div>" + (g.rows.length ? g.rows.map(function (r) {
        return '<div class="tv-zrow ' + (r === nextMinyan ? "next" : "") + '"><div><div class="he">' + esc(r.he) + '</div><div class="en">' + esc(r.en) + '</div></div><div class="t">' + tm(r.time) + "</div></div>";
      }).join("") : '<div class="tv-empty">אין זמני תפילה נוספים · No more davening times</div>');
    }).join("");

    /* centre */
    var center, slot = "";
    var bd = boardsFor(d, shabbat);
    if (shabbat) {
      var lines = bd.lines, haz = bd.hazkarot, yz = bd.yz, has = lines.length || haz.length || yz.length;
      var list = (lines.length ? '<div class="tv-bhead"><span class="he">הקדשות</span><span class="en">Dedications</span></div><div class="tv-list">' + listItems(lines) + "</div>" : "") +
        (haz.length ? '<div class="tv-bhead"><span class="he">הזכרות ותנחומים</span><span class="en">Hazkarot</span></div><div class="tv-list">' + listItems(haz) + "</div>" : "") +
        (yz.length ? '<div class="tv-bhead"><span class="he">יארצייט השבוע</span><span class="en">Yahrzeits This Week</span></div><div class="tv-list">' + listItems(yz) + "</div>" : "");
      if (has) { center = '<div class="tv-board shabbat"><div class="tv-scroll">' + list + "</div></div>"; slot = shabbatCard(true); }
      else center = '<div class="tv-board shabbat only">' + shabbatCard(false) + "</div>";
    } else {
      if (state.idx >= bd.length) state.idx = 0;
      var b = bd[state.idx];
      center = '<div class="tv-board"><div class="tv-bwrap" key="' + state.idx + '">' + boardHead(b.kind) + b.html + '</div><div class="tv-dots">' + bd.map(function (x, i) { return '<i class="' + (i === state.idx ? "on" : "") + '"></i>'; }).join("") + "</div></div>";
      var early = dow === 5 && m >= stt.candles - 45 && (bd.length > 0);
      slot = early ? shabbatCard(true) : '<div class="tv-qrcard">' + qr() + '<div><div class="he">' + esc(T("donateTitle", "he")) + '</div><div class="en">' + esc(T("donateTitle", "en")) + "</div></div></div>";
    }

    /* strips */
    var chips = [];
    if (!shabbat && S.dayIdx(d) >= 2) chips.push("קידוש לבנה | עד ט״ו כסלו · Kiddush Levana until 15 Kislev");
    var nz = "";
    if (!shabbat) {
      if (!tomorrow && m < z.netz && m >= z.alot - 120) nz = '<span class="he">הנץ בעוד ' + cd(z.netz - m, "he") + '</span><span class="en">Netz ' + cd(z.netz - m, "en") + "</span>";
      else if (nextKey) { var zz = S.ZLIST.filter(function (x) { return x[0] === nextKey; })[0]; nz = '<span class="he">' + esc(T("nextZman", "he")) + ": " + zz[1] + " " + tm(z[nextKey]) + " · " + cd(z[nextKey] - m, "he") + '</span><span class="en">' + esc(T("nextZman", "en")) + ": " + zz[2] + " " + tm(z[nextKey]) + "</span>"; }
      else if (tomorrow) nz = '<span class="he">עלות השחר מחר ' + tm(z.alot) + '</span><span class="en">Alot Hashachar tomorrow ' + tm(z.alot) + "</span>";
      if (dow === 5 && m < stt.candles) nz = '<span class="he">הדלקת נרות ' + tm(stt.candles) + " · " + cd(stt.candles - m, "he") + '</span><span class="en">Candle lighting ' + tm(stt.candles) + " · " + cd(stt.candles - m, "en") + "</span>";
    }
    var ticker = S.db.items.filter(function (it) { return it.type === "ticker" && it.status === "published"; });
    var tt = titleFor(st, d);
    var dims = dimLevel(d);
    root.className = "tv-stage" + (shabbat ? " is-shabbat" : "");
    root.innerHTML =
      '<header class="tv-head"><div class="tv-brand">' + UI.logo() + '<div><div class="he">' + esc(S.db.shul.he) + '</div><div class="en">' + esc(S.db.shul.en) + "</div></div></div>" +
      '<div class="tv-title"><div class="he">' + tt[0] + '</div><div class="sub">' + S.hebDate(d, "he") + " | " + S.DAY_EN[d.getDay()] + ", " + EN_MONTHS[d.getMonth()] + " " + d.getDate() + "</div></div>" +
      '<div class="tv-clock" id="tvClock">' + clockStr(d) + "</div></header>" +
      '<div class="tv-cols">' +
      '<section class="tv-col' + (showShabbatBlock ? ' compact' : '') + '"><div class="tv-ch"><span class="he">' + (tomorrow ? "זמני מחר" : esc(T("colZmanim", "he"))) + '</span><span class="en">' + (tomorrow ? "Tomorrow's Zmanim" : esc(T("colZmanim", "en"))) + "</span></div>" + zrows + sblock + "</section>" +
      '<section class="tv-center">' + (chips.length ? '<div class="tv-chips">' + chips.map(function (c) { return "<span>" + c + "</span>"; }).join("") + "</div>" : "") +
      (nz ? '<div class="tv-next" id="tvNext">' + nz + "</div>" : "") +
      '<div class="tv-ch center"><span class="he">' + esc(T("boardTitle", "he")) + '</span><span class="en">' + esc(T("boardTitle", "en")) + "</span></div>" + center + "</section>" +
      '<section class="tv-col"><div class="tv-ch"><span class="he">' + esc(T("colPrayers", "he")) + '</span><span class="en">' + esc(T("colPrayers", "en")) + '</span></div><div class="tv-prayers">' + prow + '</div><div class="tv-slot">' + slot + "</div></section>" +
      "</div>" +
      '<footer class="tv-foot"><div class="tv-fname"><b>' + esc(S.db.shul.he) + "</b> · <bdi dir=\"ltr\">" + esc(S.db.shul.address) + '</bdi></div><div class="tv-ticker"><div class="tv-tick-in">' + ticker.concat(ticker).map(function (t) { return "<span>✦ " + esc(t.text.he) + " · " + esc(t.text.en) + "</span>"; }).join("") + "</div></div></footer>" +
      '<div class="tv-dim" style="opacity:' + dims + '"></div>' + (draft ? '<div class="tv-draft">תצוגה מקדימה · Preview, not published</div>' : "");
    state.lastBoards = shabbat ? 0 : bd.length;
  }
  function cd(mins, lang) {
    mins = Math.max(0, Math.ceil(mins));
    var h = Math.floor(mins / 60), mm = mins % 60;
    if (lang === "he") { if (!h) return "בעוד " + mm + " דק׳"; return "בעוד " + (h === 1 ? "שעה" : h + " שעות") + (mm ? " ו-" + mm + " דק׳" : ""); }
    if (!h) return "in " + mm + " min"; return "in " + h + " hr" + (mm ? " " + mm + " min" : "");
  }
  function clockStr(d) { return S.hm(d.getHours() * 60 + d.getMinutes(), false) + '<small>:' + String(d.getSeconds()).padStart(2, "0") + "</small>"; }

  /* brightness (settings/tvDisplay): off, manual, automatic window. Large screens only. */
  function dimLevel(d) {
    var t = S.db.tvDisplay, vw = window.innerWidth;
    if (vw < 901 && !state.preview) return 0;
    var lvl;
    if (t.mode === "manual") lvl = t.level;
    else if (t.mode === "auto") {
      var m = d.getHours() * 60 + d.getMinutes(), from = S.fromInputTime(t.from);
      var to = t.toKind === "alot" ? S.zmanim(d).alot - (t.alotBefore || 0) : S.fromInputTime(t.to);
      var inWin = from > to ? (m >= from || m < to) : (m >= from && m < to);
      lvl = inWin ? t.level : 100;
    } else lvl = 100;
    return Math.max(0, Math.min(0.8, (100 - lvl) / 100));
  }

  function tick() {
    var d = S.now();
    var c = document.getElementById("tvClock"); if (c) c.innerHTML = clockStr(d);
    if (d.getSeconds() === 0) build();
  }
  function rotate() { if (state.lastBoards > 1) { state.idx = (state.idx + 1) % state.lastBoards; build(); } }

  function checkReload() {
    var t = S.db.tvDisplay, seen = 0;
    try { seen = +localStorage.getItem("shulDemo.tvReloadSeen") || 0; } catch (e) {}
    if (!t.reloadAt || t.reloadAt <= seen) return;
    if (state.preview) return; /* never in a preview */
    if (S.dayState(S.now()) === "shabbat") return; /* waits until after Shabbat */
    try { localStorage.setItem("shulDemo.tvReloadSeen", String(t.reloadAt)); } catch (e) {}
    var o = document.createElement("div"); o.className = "tv-reload"; o.innerHTML = "<div>מרענן את המסך · Refreshing the screen</div>";
    state.stage.appendChild(o);
    setTimeout(function () { location.reload(); }, 1500);
  }

  function fit() {
    var s = state.stage; if (!s) return;
    var w = window.innerWidth, h = window.innerHeight, k = Math.min(w / 1920, h / 1080);
    s.style.transform = "translate(-50%,-50%) scale(" + k + ")";
  }

  UI.route("/tv", {
    bare: true, live: false, title: function () { return S.L("המסך", "Screen"); },
    render: function (app, arg, params) {
      state.timers.forEach(clearInterval); state.timers = [];
      state.preview = params.preview === "1";
      if (params.clock) { var cp = params.clock.split(":"); if (cp[0] === "live") S.pinClock(null); else { S.pinClock(+cp[0], +cp[1]); S.pinned().min0 = +cp[1]; } }
      state.shabbatPreview = params.shabbat === "1";
      try { if (!state.preview && !localStorage.getItem("shulDemo.tvReloadSeen")) localStorage.setItem("shulDemo.tvReloadSeen", String(S.db.tvDisplay.reloadAt || 0)); } catch (e) {}
      app.innerHTML = '<div class="tv-host"><div class="tv-stage" id="tvStage"></div>' + (state.preview ? "" :
        '<div class="tv-ctl" id="tvCtl"><a class="btn sm" href="#/screen">' + S.L("חזרה להדגמה", "Back to demo") + '</a><button class="btn sm" id="tvSh">' + (state.shabbatPreview ? "צא מתצוגת שבת · Exit Shabbat preview" : "תצוגת שבת · Shabbat preview") + '</button><button class="btn sm" id="tvFs">' + S.L("מסך מלא", "Fullscreen") + "</button></div>") + "</div>";
      state.stage = app.querySelector("#tvStage");
      build(); fit(); checkReload();
      window.onresize = fit;
      state.timers.push(setInterval(tick, 1000), setInterval(rotate, 9000), setInterval(function () { state.stage.style.marginLeft = (Math.round(Math.random() * 6) - 3) + "px"; }, 300000));
      var ctl = app.querySelector("#tvCtl");
      if (ctl) {
        var hideT; var host = app.querySelector(".tv-host"); var show = function () { ctl.classList.add("show"); host.classList.remove("nocursor"); clearTimeout(hideT); hideT = setTimeout(function () { ctl.classList.remove("show"); host.classList.add("nocursor"); }, 3500); };
        app.addEventListener("mousemove", show); app.addEventListener("touchstart", show); show();
        ctl.querySelector("#tvSh").addEventListener("click", function () { location.hash = state.shabbatPreview ? "#/tv" : "#/tv?shabbat=1"; });
        ctl.querySelector("#tvFs").addEventListener("click", function () { var el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(function () {}); });
      }
      window.addEventListener("hashchange", function stop() { if (!/^#\/tv/.test(location.hash)) { state.timers.forEach(clearInterval); state.timers = []; state.stage = null; window.removeEventListener("hashchange", stop); } });
    }
  });
  S.onChange(function () { if (state.stage) { build(); checkReload(); } });
  window.SHUL_TV_REFRESH = function () { if (state.stage) build(); };
  function focusKind(kind) { if (!state.stage) return; var bd = boardsFor(S.now(), state.shabbatPreview || S.dayState(S.now()) === "shabbat"); if (!bd.length) return; for (var i = 0; i < bd.length; i++) if (bd[i].kind === kind) { state.idx = i; break; } build(); }
  window.SHUL_TV_SETDRAFT = function (it) { draft = it ? JSON.parse(JSON.stringify(it)) : null; if (it) focusKind(it.type); else if (state.stage) build(); };
  window.SHUL_TV_FOCUS = focusKind;
  window.SHUL_TV = { TV_TEXTS: TV_TEXTS, visible: visible, yahrzeitsThisWeek: yahrzeitsThisWeek, prayerTime: prayerTime, groupRows: groupRows };
})();
