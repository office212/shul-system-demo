/* Shul system sales demo | core: language, store, dates, zmanim, money.
   Everything here is fictional demo data kept in this browser only (localStorage).
   No backend, no keys, no real payments. */
(function () {
  "use strict";
  var LS_KEY = "shulDemo.v1";
  var PREF_KEY = "shulDemo.prefs";

  /* ---------- preferences (language, theme, role) ---------- */
  var prefs = { lang: "he", theme: "classic", role: "visitor" };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || "{}")); } catch (e) {}
  if (["classic", "modern", "warm", "royal"].indexOf(prefs.theme) < 0) prefs.theme = "classic";
  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} }

  function L(he, en) { return prefs.lang === "en" ? en : he; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* a record with he/en fields -> current language */
  function N(o) { if (!o) return ""; return prefs.lang === "en" ? (o.en || o.he || "") : (o.he || o.en || ""); }

  /* ---------- demo week: Sunday Nov 15 to Shabbat Nov 21, 2026 (Parashat Vayetzei) ---------- */
  var WEEK0 = new Date(2026, 10, 15);
  var HEB_DAYS = ["ה׳", "ו׳", "ז׳", "ח׳", "ט׳", "י׳", "י״א"];
  var HEB_DAY_NUM = [5, 6, 7, 8, 9, 10, 11];
  var PARASHA = { he: "ויצא", en: "Vayetzei" };
  /* Daf Yomi for each day of the demo week (checked against the Hebcal calendar library) */
  var DAF = [["בכורות", "נ״ח", "Bechorot", 58], ["בכורות", "נ״ט", "Bechorot", 59], ["בכורות", "ס׳", "Bechorot", 60], ["בכורות", "ס״א", "Bechorot", 61], ["ערכין", "ב׳", "Arachin", 2], ["ערכין", "ג׳", "Arachin", 3], ["ערכין", "ד׳", "Arachin", 4]];
  function daf(d, lang) { var x = DAF[Math.max(0, Math.min(6, dayIdx(d)))]; return (lang || prefs.lang) === "en" ? x[2] + " " + x[3] : x[0] + " דף " + x[1]; }
  /* halacha of the day for the screen's weekday board */
  var HALACHA = [
    ["ישכים אדם לבית הכנסת כדי שיימנה עם עשרה הראשונים.", "One should come to shul early, to be counted among the first ten.", "שו״ע או״ח צ, יד", "Shulchan Aruch OC 90:14"],
    ["לא ישיח שיחת חולין בשעה שהשליח ציבור חוזר את התפילה.", "One may not engage in idle talk while the chazzan repeats the Amidah.", "שו״ע או״ח קכד, ז", "Shulchan Aruch OC 124:7"],
    ["מצוה לרוץ כשהולכים לבית הכנסת, וכשיוצאים לא ירוץ.", "It is a mitzvah to hurry on the way to shul, and not to rush on the way out.", "שו״ע או״ח צ, יב", "Shulchan Aruch OC 90:12"],
    ["תפילין של יחיד, שאינן ממשמשות תמיד, צריכות בדיקה פעמיים בשבע שנים.", "An individual's tefillin, if not handled constantly, should be checked twice in seven years.", "שו״ע או״ח לט, י", "Shulchan Aruch OC 39:10"],
    ["מצוה לקרוא את הפרשה בכל שבוע שנים מקרא ואחד תרגום.", "Each week one reads the parasha twice in the text and once in translation.", "שו״ע או״ח רפה, א", "Shulchan Aruch OC 285:1"],
    ["ישכים ביום שישי בבוקר להכין צרכי שבת.", "On Friday one rises early to prepare for Shabbat.", "שו״ע או״ח רנ, א", "Shulchan Aruch OC 250:1"],
    ["לעולם יסדר אדם שולחנו במוצאי שבת, ללוות את השבת.", "One should always set the table on Motzei Shabbat, to escort the Shabbat.", "שו״ע או״ח ש, א", "Shulchan Aruch OC 300:1"]
  ];
  function halacha(d) { return HALACHA[Math.max(0, Math.min(6, dayIdx(d)))]; }
  var DAY_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  var DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Shabbat"];
  var DAY_EN_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Shab"];
  var MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  var HEB_MONTHS = [
    { he: "תשרי", en: "Tishrei" }, { he: "חשון", en: "Cheshvan" }, { he: "כסלו", en: "Kislev" },
    { he: "טבת", en: "Tevet" }, { he: "שבט", en: "Shevat" }, { he: "אדר", en: "Adar" },
    { he: "אדר א׳", en: "Adar I" }, { he: "אדר ב׳", en: "Adar II" }, { he: "ניסן", en: "Nisan" },
    { he: "אייר", en: "Iyar" }, { he: "סיון", en: "Sivan" }, { he: "תמוז", en: "Tammuz" },
    { he: "אב", en: "Av" }, { he: "אלול", en: "Elul" }
  ];
  var HEB_NUM = ["", "א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ז׳", "ח׳", "ט׳", "י׳", "י״א", "י״ב", "י״ג", "י״ד", "ט״ו", "ט״ז", "י״ז", "י״ח", "י״ט", "כ׳", "כ״א", "כ״ב", "כ״ג", "כ״ד", "כ״ה", "כ״ו", "כ״ז", "כ״ח", "כ״ט", "ל׳"];

  /* demo clock: real time of day, placed on the same weekday of the demo week.
     The demo bar may pin a moment (a demo navigation aid only). */
  var clockPin = null; /* {dow, min} */
  function now() {
    var r = new Date();
    var dow = r.getDay(), min = r.getHours() * 60 + r.getMinutes() + r.getSeconds() / 60;
    if (clockPin) { dow = clockPin.dow; min = clockPin.min + (Date.now() - clockPin.set) / 60000; }
    var d = new Date(WEEK0.getFullYear(), WEEK0.getMonth(), WEEK0.getDate() + dow, 0, 0, 0);
    d.setMinutes(Math.floor(min)); d.setSeconds(Math.floor((min % 1) * 60));
    return d;
  }
  function pinClock(dow, min) { clockPin = dow == null ? null : { dow: dow, min: min, set: Date.now() }; }
  function pinned() { return clockPin; }
  function dayIdx(d) { return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - WEEK0) / 86400000); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function todayIso() { return iso(now()); }
  function parseIso(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function weekDate(i) { return new Date(WEEK0.getFullYear(), WEEK0.getMonth(), WEEK0.getDate() + i); }
  function fmtDate(s) {
    var d = typeof s === "string" ? parseIso(s) : s;
    return prefs.lang === "en" ? MONTHS_EN[d.getMonth()].slice(0, 3) + " " + d.getDate() + ", " + d.getFullYear()
      : d.getDate() + " ב" + MONTHS_HE[d.getMonth()] + " " + d.getFullYear();
  }
  function fmtDateLong(d) {
    return prefs.lang === "en" ? DAY_EN[d.getDay()] + ", " + MONTHS_EN[d.getMonth()] + " " + d.getDate()
      : "יום " + DAY_HE[d.getDay()] + ", " + d.getDate() + " ב" + MONTHS_HE[d.getMonth()];
  }
  function hebDate(d, lang) {
    var i = Math.max(0, Math.min(6, dayIdx(d)));
    lang = lang || prefs.lang;
    return lang === "en" ? HEB_DAY_NUM[i] + " Kislev 5787" : HEB_DAYS[i] + " כסלו תשפ״ז";
  }
  function hday(n) { return prefs.lang === "en" ? String(n) : HEB_NUM[n]; }
  function dayName(dow, lang) { return (lang || prefs.lang) === "en" ? DAY_EN[dow] : DAY_HE[dow]; }

  /* ---------- zmanim for the demo week (fictional town, realistic late-November values) ---------- */
  function zmanim(d) {
    var i = dayIdx(d);
    var netz = 400 + 0.95 * i, shkiah = 995 - 0.5 * i;
    var sh = (shkiah - netz) / 12, alot = netz - 72, tzeitMga = shkiah + 72, shMga = (tzeitMga - alot) / 12;
    var z = {
      alot: alot, talit: netz - 50, netz: netz,
      shemaMga: alot + 3 * shMga, shemaGra: netz + 3 * sh, tefillah: netz + 4 * sh,
      chatzot: netz + 6 * sh, minchaGedola: netz + 6.5 * sh, plag: shkiah - 1.25 * sh,
      shkiah: shkiah, tzeit: shkiah + 42
    };
    Object.keys(z).forEach(function (k) { z[k] = Math.round(z[k]); });
    return z;
  }
  var ZLIST = [
    ["alot", "עלות השחר", "Alot Hashachar"], ["talit", "זמן טלית ותפילין", "Talit and Tefillin"],
    ["netz", "נץ החמה", "Netz Hachama"], ["shemaMga", "סוף זמן ק״ש מגן אברהם", "Latest Shema, Magen Avraham"],
    ["shemaGra", "סוף זמן ק״ש גר״א", "Latest Shema, Gra"], ["tefillah", "סוף זמן תפילה", "Latest Shacharit"],
    ["chatzot", "חצות היום", "Chatzot"], ["minchaGedola", "מנחה גדולה", "Mincha Gedolah"],
    ["plag", "פלג המנחה", "Plag Hamincha"], ["shkiah", "שקיעה", "Shkiah"], ["tzeit", "צאת הכוכבים", "Tzet Hakochavim"]
  ];
  function shabbatTimes() {
    var fri = zmanim(weekDate(5)), sat = zmanim(weekDate(6));
    return { candles: fri.shkiah - 18, ends: sat.shkiah + 50, rt: sat.shkiah + 72, friShkiah: fri.shkiah, satShkiah: sat.shkiah };
  }
  function hm(m, ampm) {
    m = Math.round(m); var h = Math.floor(m / 60) % 24, mm = m % 60;
    var h12 = h % 12 || 12;
    return h12 + ":" + String(mm).padStart(2, "0") + (ampm ? (h < 12 ? " AM" : " PM") : "");
  }
  function parseHm(s) {
    var m = String(s || "").trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (!m) return null;
    var h = +m[1], mm = +m[2]; if (mm > 59 || h > 23) return null;
    if (m[3]) { var pm = /pm/i.test(m[3]); if (h === 12) h = 0; if (pm) h += 12; }
    if (!m[3] && h >= 1 && h <= 6) h += 12; /* 1:00 to 6:59 without am/pm reads as afternoon */
    return h * 60 + mm;
  }
  function toInputTime(min) { return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0"); }
  function fromInputTime(s) { var p = String(s || "").split(":"); if (p.length < 2) return null; return +p[0] * 60 + +p[1]; }

  /* day state for TV and pages */
  function dayState(d) {
    var dow = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), st = shabbatTimes();
    if (dow === 5 && m >= st.candles) return "shabbat";
    if (dow === 6 && m < st.ends) return "shabbat";
    if (dow === 6) return "motzei";
    if (dow === 5) return "erev";
    return "weekday";
  }

  /* ---------- money ---------- */
  function money(n) {
    var neg = n < 0; n = Math.abs(Math.round(n * 100) / 100);
    var s = n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "-" : "") + "$" + s;
  }
  function cents(n) { return Math.round(Number(n || 0) * 100); }

  /* ---------- store ---------- */
  var listeners = [];
  var DB = null;
  function load() {
    try { var s = localStorage.getItem(LS_KEY); if (s) { DB = JSON.parse(s); if (DB && DB.v === 2) return; } } catch (e) {}
    DB = window.SHUL_SEED();
    save(true);
  }
  function save(quiet) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(DB)); } catch (e) {}
    if (!quiet) listeners.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }
  function reset() { DB = window.SHUL_SEED(); save(); }
  function onChange(f) { listeners.push(f); }
  window.addEventListener("storage", function (e) {
    if (e.key === LS_KEY) { try { DB = JSON.parse(e.newValue); } catch (x) {} listeners.forEach(function (f) { try { f("remote"); } catch (x) {} }); }
    if (e.key === PREF_KEY) { try { Object.assign(prefs, JSON.parse(e.newValue)); } catch (x) {} listeners.forEach(function (f) { try { f("prefs"); } catch (x) {} }); }
  });
  var seq = Date.now() % 100000;
  function uid(p) { seq += 1; return (p || "id") + "-" + seq.toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- finance helpers ---------- */
  function balance(mid) {
    var c = 0;
    DB.ledger.forEach(function (e) { if (e.mid !== mid) return; c += e.type === "payment" ? -cents(e.amount) : cents(e.amount); });
    return c / 100; /* positive = owes */
  }
  function memberById(id) { return DB.members.filter(function (m) { return m.id === id; })[0]; }
  function isVoided(e) { return DB.ledger.some(function (x) { return x.voidOf === e.id; }); }
  function log(area, he, en) {
    DB.activity.unshift({ id: uid("a"), at: new Date().toISOString(), area: area, he: he, en: en, who: (currentUser() ? currentUser().he + "|" + currentUser().en : "מערכת|System") });
  }
  function notify(to, he, en, opts) {
    DB.notifs.unshift({ id: uid("n"), to: to, he: he, en: en, at: new Date().toISOString(), read: false });
    if (window.SHUL_UI && window.SHUL_UI.pushToast) window.SHUL_UI.pushToast(to, he, en, opts);
  }

  /* ---------- roles (the role picker is a demo navigation tool only) ---------- */
  var ROLES = {
    visitor: { he: "אורח (לא מחובר)", en: "Visitor (signed out)", home: "#/site" },
    applicant: { he: "נרשם חדש (עוד לא חבר)", en: "New applicant (not a member yet)", home: "#/join" },
    member: { he: "מתפלל", en: "Congregant", home: "#/me" },
    content: { he: "גבאי תוכן וזמנים", en: "Content and Times Gabbai", home: "#/gabbai" },
    finance: { he: "גבאי כספים", en: "Finance Gabbai", home: "#/gabbai" },
    super: { he: "מנהל ראשי", en: "Super Admin", home: "#/gabbai" }
  };
  /* a framed preview may show another perspective without changing the visitor's own choice */
  var over = { role: null, theme: null };
  function role() { return over.role || prefs.role; }
  function can(what) {
    var r = role();
    if (r === "super") return true;
    if (what === "finance") return r === "finance";
    if (what === "content") return r === "content";
    if (what === "gabbai") return r === "finance" || r === "content";
    if (what === "member") return r === "member";
    return false;
  }
  function currentUser() {
    var r = role(), u = DB && DB.demoUsers[r];
    return u || null;
  }
  function currentUserName() { var u = currentUser(); return u ? N(u) : L("מערכת", "System"); }

  window.SHUL = {
    prefs: prefs, savePrefs: savePrefs, L: L, N: N, esc: esc,
    WEEK0: WEEK0, PARASHA: PARASHA, HEB_MONTHS: HEB_MONTHS, HEB_NUM: HEB_NUM, ZLIST: ZLIST,
    DAY_HE: DAY_HE, DAY_EN: DAY_EN, DAY_EN_SHORT: DAY_EN_SHORT,
    now: now, pinClock: pinClock, pinned: pinned, dayIdx: dayIdx, iso: iso, todayIso: todayIso, parseIso: parseIso,
    weekDate: weekDate, hday: hday, fmtDate: fmtDate, fmtDateLong: fmtDateLong, hebDate: hebDate, dayName: dayName,
    HEB_DAY_NUM: HEB_DAY_NUM, daf: daf, halacha: halacha,
    zmanim: zmanim, shabbatTimes: shabbatTimes, hm: hm, parseHm: parseHm, toInputTime: toInputTime, fromInputTime: fromInputTime,
    dayState: dayState, money: money, cents: cents,
    get db() { return DB; }, load: load, save: save, reset: reset, onChange: onChange, uid: uid,
    balance: balance, memberById: memberById, isVoided: isVoided, log: log, notify: notify,
    ROLES: ROLES, role: role, over: over, can: can, currentUser: currentUser, currentUserName: currentUserName
  };
})();
