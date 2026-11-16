/* Kehillat Noam | the gabbai's Shabbat loop and the Shabbat autopilot.
   #/friday    : the Friday desk. A "ready for Shabbat" checklist that turns green, the
                 gabbai's report, and the Shabbat sheet that builds itself from what the
                 system already knows (times, aliyot, yahrzeits, dedications, announcements,
                 the kiddush sponsor), printable on one page and shareable by WhatsApp.
   #/autopilot : a timeline the visitor drags from Friday noon to Saturday night. Each
                 automation fires at its moment and the real TV follows the same clock.
   Nothing here changes any time or any Shabbat rule: it only shows the demo's own week. */
(function () {
  "use strict";
  var KN = window.KN, D = window.KN_DATA, S = KN.S, T = KN.T, L = KN.L, esc = KN.esc, ic = KN.ic, B = D.B, W = D.WEEK;
  function pro() { if (!S.pro) S.pro = { done: {}, aliyot: {}, recorded: false, seats: null, live: true }; return S.pro; }
  function al() { return KN.aliyotList ? KN.aliyotList() : []; }

  KN.mod({ id: "friday", ic: "cal", he: "יום שישי של הגבאי", en: "The gabbai's Friday", dHe: "רשימת ״מוכן לשבת״, דו״ח הגבאי ודף שבת שנבנה לבד.", dEn: "A ready-for-Shabbat list, the gabbai's report and a Shabbat sheet that builds itself.", need: "staff" });
  KN.mod({ id: "autopilot", ic: "flame", he: "טייס אוטומטי לשבת", en: "Shabbat autopilot", dHe: "ציר זמן מיום שישי עד מוצ״ש: המסך, ההודעות והתרומות על שעון אחד.", dEn: "A timeline from Friday to Saturday night: screen, messages and donations on one clock." });

  /* ================= the Shabbat sheet ================= */
  function sheetHtml() {
    var fri = KN.dayPrayers(5), sat = KN.dayPrayers(6), A = al(), wy = KN.weekYahrzeits(), kd = S.kiddush.filter(function (k) { return !k.open; });
    function rows(l) { return l.map(function (p) { return "<tr><td>" + esc(L(p.name)) + '</td><td class="num">' + KN.time(p.time) + "</td></tr>"; }).join(""); }
    return '<div class="sheet"><div class="sh-h"><div><h2>' + esc(KN.shulName()) + "</h2><span>" + T("דף השבת", "The Shabbat sheet") + '</span></div><div class="sh-p"><b>' + T("שבת פרשת ", "Shabbat Parashat ") + esc(L(W.parasha)) + "</b><span>" + KN.hdate(11, 2) + " " + L(W.hYear) + " · " + KN.date(W.shabbat) + '</span></div></div><div class="sh-t"><div><span>' + T("הדלקת נרות", "Candle lighting") + "</span><b>" + KN.time(W.candle) + "</b></div><div><span>" + T("צאת השבת", "Shabbat ends") + "</span><b>" + KN.time(W.ends) + "</b></div><div><span>" + T("רבנו תם", "Rabbeinu Tam") + "</span><b>" + KN.time(W.rt) + '</b></div></div><div class="sh-g"><div><h4>' + T("זמני התפילות", "Davening times") + '</h4><table>' + rows(fri) + rows(sat) + "</table><h4>" + T("שיעורים", "Shiurim") + "</h4><table>" + D.shiurim.slice(0, 4).map(function (s) { return "<tr><td>" + esc(L(s.name)) + " · " + esc(L(s.who)) + '</td><td class="num">' + KN.time(s.t) + "</td></tr>"; }).join("") + "</table></div><div><h4>" + T("העולים לתורה", "Aliyot") + "</h4>" + (A.length ? "<table>" + A.map(function (r) { return "<tr><td>" + T(r.h[1], r.h[2]) + "</td><td>" + esc(L(r.m.name)) + "</td></tr>"; }).join("") + "</table>" : '<p class="sh-e">' + T("העליות עוד לא שובצו. לחצו על ״שיבוץ אוטומטי״ בלוח העליות.", "The aliyot are not assigned yet. Press Auto-assign on the aliyot board.") + "</p>") + "</div><div><h4>" + T("יארצייט השבוע", "Yahrzeits this week") + "</h4><ul>" + wy.map(function (y) { return "<li><b>" + esc(L(y.name)) + "</b> · " + KN.hdate(y.hDay, y.hMonth) + "</li>"; }).join("") + "</ul><h4>" + T("הקדשות", "Dedications") + "</h4><ul>" + S.dedications.slice(0, 4).map(function (d) { return "<li>" + esc(L(d.text)) + "</li>"; }).join("") + "</ul><h4>" + T("מזל טוב", "Mazal Tov") + "</h4><ul>" + S.mazal.map(function (z) { return "<li>" + esc(L(z.text)) + "</li>"; }).join("") + '</ul></div></div><div class="sh-k">' + kd.map(function (k) { return "<div><b>" + esc(L(k.what)) + "</b> · " + esc(L(k.by)) + " · " + esc(L(k.why)) + "</div>"; }).join("") + '</div><div class="sh-a"><h4>' + T("הודעות", "Announcements") + "</h4>" + S.announcements.slice(0, 3).map(function (a) { return "<p><b>" + esc(L(a.title)) + ".</b> " + esc(L(a.text)) + "</p>"; }).join("") + '</div><div class="sh-f">' + T("הדף נבנה אוטומטית מנתוני המערכת · נתוני דמו", "This sheet is built automatically from the system's data · demo data") + "</div></div>";
  }
  KN.sheetHtml = sheetHtml;
  KN.act.sheetPrint = function () { pro().sheet = true; KN.save(); KN.modal('<div class="print-sheet sheet-print">' + sheetHtml() + '</div><p style="margin-top:14px" class="no-print row"><button class="btn" data-act="doPrint">' + ic("print") + T("הדפסה או שמירה כ־PDF", "Print or save as PDF") + "</button></p>", true); if (KN.route().name === "friday") paintReady(); };
  KN.act.sheetShare = function () {
    var t = KN.shulName() + " · " + T("שבת פרשת ", "Shabbat Parashat ") + L(W.parasha) + "\n" + T("הדלקת נרות ", "Candle lighting ") + KN.time(W.candle) + " · " + T("צאת השבת ", "Shabbat ends ") + KN.time(W.ends) + "\n" + KN.dayPrayers(5).concat(KN.dayPrayers(6)).map(function (p) { return L(p.name) + " " + KN.time(p.time); }).join("\n") + "\n" + T("שבת שלום!", "Shabbat Shalom!");
    pro().shared = true; KN.save(); window.open("https://wa.me/?text=" + encodeURIComponent(t), "_blank", "noopener"); if (KN.route().name === "friday") paintReady();
  };

  /* ================= the Friday desk ================= */
  function ready() {
    var P = pro(), n = al().length, kOpen = S.kiddush.filter(function (k) { return k.open && /וישלח|Vayishlach/.test(L(k.what)); }).length, kNow = S.kiddush.filter(function (k) { return !k.open; }).length, pend = S.yahrzeits.filter(function (y) { return y.status === "pending"; }).length;
    return [{ ok: true, t: T("זמני השבת נקבעו ופורסמו", "The Shabbat times are set and published"), s: T("הדלקת נרות ", "Candle lighting ") + KN.time(W.candle) + " · " + T("באתר, בטלפונים ועל המסך", "on the site, the phones and the screen") },
      { ok: n >= 11 || P.recorded, t: T("העליות שובצו", "The aliyot are assigned"), s: (P.recorded ? 11 : n) + "/11 · " + T("כולל כל החיובים של השבוע", "including every chiyuv of the week"), btn: T("לשבץ עכשיו", "Assign now"), act: "frAliyot" },
      { ok: !pend, t: T("היארצייטים של השבוע על המסך", "This week's yahrzeits are on the screen"), s: KN.weekYahrzeits().length + " " + T("שמות", "names") + (pend ? " · " + pend + " " + T("ממתין לאישור", "awaiting approval") : ""), btn: T("לאשר", "Approve"), act: "frYz" },
      { ok: kNow > 0, t: T("לקידוש של השבת יש חסות", "This Shabbat's kiddush has a sponsor"), s: S.kiddush.filter(function (k) { return !k.open; }).map(function (k) { return L(k.by); }).join(" · ") },
      { ok: !!P.sheet, t: T("דף השבת הודפס", "The Shabbat sheet is printed"), s: T("נבנה לבד מהנתונים שכבר במערכת", "Built by itself from what the system already knows"), btn: T("להדפיס", "Print"), act: "sheetPrint" },
      { ok: true, t: T("המסך על טייס אוטומטי", "The screen is on autopilot"), s: T("יעבור למצב שבת ב־", "Switches to Shabbat mode at ") + KN.time(W.candle) + T(" ויחזור ב־", " and back at ") + KN.time(W.ends), btn: T("לראות", "Watch"), act: "frAuto", always: true }];
  }
  function readyHtml() {
    var R = ready(), done = R.filter(function (r) { return r.ok; }).length, all = done === R.length;
    return '<div class="rdy-h' + (all ? " all" : "") + '"><div class="rdy-n"><b>' + done + "/" + R.length + "</b></div><div><h2>" + (all ? T("מוכנים לשבת. שבת שלום!", "Ready for Shabbat. Shabbat Shalom!") : T("כמעט מוכנים לשבת", "Almost ready for Shabbat")) + "</h2><span>" + (all ? T("הכול ירוק. המערכת ממשיכה לבד מכאן.", "Everything is green. The system takes it from here.") : T("נשארו " + (R.length - done) + " דברים. כל אחד בלחיצה.", (R.length - done) + " things left. Each takes one click.")) + '</span></div></div><div class="rdy-l">' + R.map(function (r, i) { return '<div class="rdy' + (r.ok ? " ok" : "") + '" style="--i:' + i + '"><span class="rdy-i">' + ic(r.ok ? "check" : "clock") + "</span><div><b>" + r.t + "</b><span>" + esc(r.s) + "</span></div>" + (r.btn && (!r.ok || r.always) ? '<button class="btn sm ' + (r.ok ? "sec" : "gold") + '" data-act="' + r.act + '">' + r.btn + "</button>" : "") + "</div>"; }).join("") + "</div>";
  }
  function reportHtml() {
    var A = al(), tot = A.reduce(function (a, r) { return a + r.amt; }, 0), ch = KN.weekYahrzeits().filter(function (y) { return y.memberId && KN.member(y.memberId); });
    return '<div class="rep"><div><b>' + A.length + '</b><span>' + T("כיבודים משובצים", "Honors assigned") + '</span></div><div><b>' + KN.moneyT(tot) + '</b><span>' + T("נדרים צפויים", "Expected pledges") + '</span></div><div><b>' + ch.length + '</b><span>' + T("חיובי יארצייט", "Yahrzeit chiyuvim") + '</span></div><div><b>' + S.mazal.length + '</b><span>' + T("שמחות להכריז", "Simchas to announce") + "</span></div></div>" +
      '<ul class="rep-l">' + ch.map(function (y) { return "<li>" + ic("flame") + "<span><b>" + esc(L(KN.member(y.memberId).name)) + "</b> · " + T("יארצייט: ", "Yahrzeit: ") + esc(L(y.name)) + "</span></li>"; }).join("") + S.mazal.map(function (z) { return "<li>" + ic("star") + "<span>" + esc(L(z.text)) + "</span></li>"; }).join("") + S.kiddush.filter(function (k) { return !k.open; }).map(function (k) { return "<li>" + ic("gift") + "<span><b>" + esc(L(k.what)) + "</b> · " + esc(L(k.by)) + "</span></li>"; }).join("") + "</ul>";
  }
  function paintReady() { var r = document.getElementById("frReady"); if (r) r.innerHTML = readyHtml(); var p = document.getElementById("frRep"); if (p) p.innerHTML = reportHtml(); var s = document.getElementById("frSheet"); if (s) s.innerHTML = sheetHtml(); var m = document.getElementById("frMotz"); if (m) m.innerHTML = motzHtml(); }
  function motzHtml() { var P = pro(), A = al(), tot = A.reduce(function (a, r) { return a + r.amt; }, 0); return P.recorded ? '<span class="chip ok">' + ic("check") + T("נדרי השבת נרשמו בחשבונות", "The Shabbat nedarim are on the accounts") + "</span>" : '<button class="btn" data-act="frCharge"' + (A.length ? "" : " disabled") + ">" + ic("check") + T("מוצאי שבת: לחייב את כל הכיבודים", "Motzei Shabbat: charge every honor") + (A.length ? " · " + KN.moneyT(tot) : "") + "</button>"; }
  KN.views.friday = { need: "staff",
    render: function () {
      return '<div class="page wide"><div class="page-head"><div><span class="eyebrow">' + T("יום שישי של הגבאי", "The gabbai's Friday") + "</span><h1>" + T("שבת פרשת ", "Shabbat Parashat ") + L(W.parasha) + T(": הכול במסך אחד", ": everything on one screen") + '</h1><p class="lede">' + T("רשימת ״מוכן לשבת״, דו״ח הגבאי ודף השבת. הכול נבנה לבד מהנתונים שכבר במערכת.", "The ready-for-Shabbat list, the gabbai's report and the Shabbat sheet. All built by itself from what the system already knows.") + '</p></div><span class="chip gold">' + T("נתוני דמו", "Demo data") + '</span></div><div class="fr-g"><div class="stack"><div class="card rdy-c" id="frReady">' + readyHtml() + '</div><div class="card"><div class="card-h"><h3>' + T("דו״ח הגבאי לשבת", "The gabbai's Shabbat report") + '</h3><span id="frMotz">' + motzHtml() + '</span></div><div id="frRep">' + reportHtml() + '</div></div></div><div class="card"><div class="card-h"><h3>' + T("דף השבת", "The Shabbat sheet") + '</h3><div class="row"><button class="btn sm sec" data-act="sheetShare">' + ic("wa") + T("לשתף ב־WhatsApp", "Share by WhatsApp") + '</button><button class="btn sm gold" data-act="sheetPrint">' + ic("print") + T("הדפסה / PDF", "Print / PDF") + '</button></div></div><div class="sheet-wrap" id="frSheet">' + sheetHtml() + "</div></div></div>" + KN.foot() + "</div>";
    }
  };
  KN.act.frAliyot = function () { if (KN.act.alAuto) KN.act.alAuto(); paintReady(); };
  KN.act.frYz = function () { if (KN.act.yzOk) KN.act.yzOk(); paintReady(); };
  KN.act.frAuto = function () { KN.go("autopilot"); };
  KN.act.frCharge = function () { if (KN.act.alRecord) KN.act.alRecord(); paintReady(); };
  KN.fridayCard = function () { var R = ready(), done = R.filter(function (r) { return r.ok; }).length; return '<button class="card frc" data-go="friday"><span class="frc-n' + (done === R.length ? " all" : "") + '">' + done + "/" + R.length + "</span><span><b>" + T("מוכן לשבת?", "Ready for Shabbat?") + "</b><span>" + T("רשימת יום שישי, דו״ח הגבאי ודף השבת", "The Friday list, the gabbai's report and the Shabbat sheet") + "</span></span>" + ic("arrow", "flip") + "</button>"; };

  /* ================= the Shabbat autopilot ================= */
  var T0 = KN.at(W.friday, "12:00"), T1 = KN.at(W.shabbat, "19:00"), CAN = KN.CANDLE, END = KN.ENDS;
  function EV() {
    var held = pro().held || 3;
    return [[T0, "clock", T("זמני השבת פורסמו", "The Shabbat times are published"), T("באתר, בטלפונים ועל המסך, בלי שאף אחד הקליד פעמיים.", "On the site, the phones and the screen, and nobody typed twice.")],
      [KN.at(W.friday, "13:00"), "print", T("דף השבת נבנה ונשלח לגבאי", "The Shabbat sheet is built and sent to the gabbai"), T("זמנים, עליות, יארצייט, הקדשות והודעות, בעמוד אחד.", "Times, aliyot, yahrzeits, dedications and announcements, on one page.")],
      [KN.at(W.friday, "14:00"), "scroll", T("דו״ח הגבאי מוכן", "The gabbai's report is ready"), T("מי חייב עלייה השבוע, ומי נותן את הקידוש.", "Who is due an aliyah this week, and who sponsors the kiddush.")],
      [CAN, "flame", T("הדלקת נרות: המסך עבר למצב שבת", "Candle lighting: the screen entered Shabbat mode"), T("״שבת שלום״, נרות, בלי קוד תרומה ובלי תנועה. לבד.", "\"Shabbat Shalom\", candles, no donation code, nothing moving. By itself.")],
      [CAN, "bell", T("שליחות ההודעות מוחזקות עד הבדלה", "Outgoing messages are held until Havdalah"), T("שום התראה, מייל או תזכורת לא יוצאים בשבת.", "No push, email or reminder goes out on Shabbat.")],
      [CAN, "lock", T("דף התרומות והתשלומים הושהו", "The donate page and payments are paused"), T("נפתחים מעצמם בצאת השבת.", "They reopen by themselves when Shabbat ends.")],
      [END, "tv", T("צאת השבת: המסך חזר למצב חול", "Shabbat ended: the screen is back to weekday mode"), T("״שבוע טוב״, וקוד התרומה חוזר.", "\"Shavua Tov\", and the donation code returns.")],
      [END, "send", held + T(" הודעות שהוחזקו נשלחו", " held messages were sent"), T("לפי הסדר, רגע אחרי צאת השבת.", "In order, right after Shabbat ends.")],
      [KN.at(W.shabbat, "17:45"), "coins", T("נדרי השבת מחכים לגבאי", "The Shabbat nedarim await the gabbai"), T("לחיצה אחת, וכל העליות נרשמות בחשבונות המתפללים.", "One click, and every aliyah is on the members' accounts.")]];
  }
  function fmt(t) { var d = new Date(t), h = d.getHours(), m = d.getMinutes(); return (d.getDay() === 5 ? T("שישי", "Fri") : T("שבת", "Sat")) + " " + KN.time((h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m); }
  function evHtml(now) { return EV().map(function (e) { var on = now >= e[0]; return '<div class="apv' + (on ? " on" : "") + '"><span class="apv-i">' + ic(on ? "check" : e[1]) + '</span><div><b>' + e[2] + "</b><span>" + e[3] + '</span></div><em class="num">' + fmt(e[0]) + "</em></div>"; }).join(""); }
  function apState(now) { return now >= END ? [T("מוצאי שבת", "Saturday night"), "wk"] : now >= CAN ? [T("שבת", "Shabbat"), "sh"] : [T("ערב שבת", "Friday"), "wk"]; }
  KN.autopilotHtml = function (compact) {
    var now = Math.min(T1, Math.max(T0, KN.now().getTime())), st = apState(now), pc = (CAN - T0) / (T1 - T0) * 100, pe = (END - T0) / (T1 - T0) * 100;
    return '<div class="ap' + (compact ? " compact" : "") + '"><div class="ap-top"><div class="ap-now"><span>' + T("השעון של ההדגמה", "The demo clock") + '</span><b id="apNow">' + fmt(now) + '</b><em id="apSt" class="' + st[1] + '">' + st[0] + '</em></div><div class="ap-ctl"><button class="btn sm gold" data-act="apPlay" id="apPlay">' + ic("play") + T("להריץ את כל השבת", "Play the whole Shabbat") + '</button><button class="btn sm ghost" data-act="apReset">' + T("חזרה ליום שישי בצהריים", "Back to Friday noon") + '</button></div></div><div class="ap-sl"><div class="ap-band" style="inset-inline-start:' + pc.toFixed(2) + "%;width:" + (pe - pc).toFixed(2) + '%"><span>' + T("שבת", "Shabbat") + '</span></div><input type="range" id="apR" min="' + T0 + '" max="' + T1 + '" step="60000" value="' + now + '" aria-label="' + T("שעה", "Time") + '"><div class="ap-tk"><span>' + T("שישי 12:00", "Fri 12:00") + '</span><span style="inset-inline-start:' + pc.toFixed(2) + '%">' + T("הדלקת נרות", "Candles") + '</span><span style="inset-inline-start:' + pe.toFixed(2) + '%">' + T("צאת השבת", "Shabbat ends") + "</span><span>" + T("מוצ״ש", "Sat night") + '</span></div></div><div class="ap-g"><div class="ap-ev" id="apEv">' + evHtml(now) + '</div><div class="ap-tv"><div class="tvframe"><div class="tvhost" id="apTv"></div></div><p class="small">' + T("זה המסך האמיתי, על אותו שעון. גררו את המחוון וראו אותו משתנה.", "This is the real screen, on the same clock. Drag the slider and watch it change.") + "</p></div></div></div>";
  };
  var playT = null;
  function apSet(t, fromPlay) {
    t = Math.min(T1, Math.max(T0, t)); KN.setClockAt(t);
    var n = document.getElementById("apNow"), s = document.getElementById("apSt"), st = apState(t), r = document.getElementById("apR"); if (!n) return;
    n.textContent = fmt(t); s.textContent = st[0]; s.className = st[1]; if (fromPlay) r.value = t; document.getElementById("apEv").innerHTML = evHtml(t);
  }
  KN.autopilotMount = function () {
    var r = document.getElementById("apR"); if (!r) return;
    if (KN.now().getTime() < T0 || KN.now().getTime() > T1) KN.setClockAt(Number(r.value));
    KN.tvMount(document.getElementById("apTv"));
    r.addEventListener("input", function () { stop(); apSet(Number(r.value)); });
    KN.cleanup.push(stop);
  };
  function stop() { if (playT) { clearInterval(playT); playT = null; var b = document.getElementById("apPlay"); if (b) b.innerHTML = ic("play") + T("להריץ את כל השבת", "Play the whole Shabbat"); } }
  KN.act.apPlay = function () {
    if (playT) { stop(); return; }
    var r = document.getElementById("apR"), t = Number(r.value); if (t >= T1 - 60000) t = T0;
    document.getElementById("apPlay").innerHTML = ic("x") + T("לעצור", "Stop");
    playT = setInterval(function () { t += 7 * 60000; if (t >= T1) { apSet(T1, true); stop(); return; } apSet(t, true); }, 120);
  };
  KN.act.apReset = function () { stop(); apSet(T0, true); };
  KN.views.autopilot = {
    render: function () { return '<div class="page wide"><div class="page-head"><div><span class="eyebrow">' + T("טייס אוטומטי לשבת", "Shabbat autopilot") + "</span><h1>" + T("מיום שישי בצהריים עד מוצאי שבת, בלי לגעת בכלום", "From Friday noon to Saturday night, without touching a thing") + '</h1><p class="lede">' + T("גררו את המחוון. כל אוטומציה נדלקת ברגע שלה, והמסך משתנה על אותו שעון של הדלקת הנרות.", "Drag the slider. Each automation lights up at its moment, and the screen changes on the same candle-lighting clock.") + "</p></div></div>" + KN.autopilotHtml() + KN.foot() + "</div>"; },
    after: function () { KN.autopilotMount(); }
  };
  KN.autopilotSection = function () { return '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("טייס אוטומטי לשבת", "Shabbat autopilot") + "</span><h2>" + T("הגבאי הולך להתכונן לשבת. <em>המערכת ממשיכה לבד.</em>", "The gabbai goes to get ready for Shabbat. <em>The system carries on.</em>") + "</h2><p>" + T("גררו את המחוון מיום שישי בצהריים עד מוצאי שבת, וראו מה קורה בכל רגע.", "Drag the slider from Friday noon to Saturday night and see what happens at each moment.") + '</p></div><div data-rv>' + KN.autopilotHtml(true) + "</div></section>"; };

  /* ---------- Shabbat-safe everywhere: one clock decides ---------- */
  KN.holdNote = function () { return KN.isShabbat() ? '<p class="hold">' + ic("flame") + "<span><b>" + T("שבת עכשיו לפי שעון ההדגמה.", "It is Shabbat by the demo clock.") + "</b> " + T("שליחות מוחזקות עד הבדלה ויוצאות מעצמן בצאת השבת.", "Sends are held until Havdalah and go out by themselves when Shabbat ends.") + "</span></p>" : ""; };
  KN.hold = function (n) { if (!KN.isShabbat()) return false; pro().held = (pro().held || 3) + (n || 1); KN.save(); KN.toast(T("שבת: ההודעות הוחזקו ויישלחו בצאת השבת", "Shabbat: the messages are held and will go out when Shabbat ends")); return true; };
})();
