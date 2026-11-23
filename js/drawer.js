/* Shul System sales demo | #/ the gabbai's drawer.
   One idea, for a buyer: a desk drawer, seen from above, holding what a gabbai carries around:
   a slip with the new Mincha time, an envelope of dues, the nedarim notebook, a flyer to put up,
   a yahrzeit card, the screen's remote and the keys. Pick one up and the real system (live, on
   the demo data) shows what replaces it. When the drawer is empty, you can close it.
   Every answer is a capability of the real system (FEATURE-MAP.md); the notes are fictional. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, X = window.SHUL_XP, L = S.L, esc = S.esc;
  var SALES = UI.SALES;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cleanup = null;
  var taken = {};     /* objects picked up in this visit */
  var opened = false; /* the drawer opens once per visit; after that it stays open */

  function mincha() { return S.db.prayers.filter(function (p) { return p.id === "p3"; })[0] || S.db.prayers.filter(function (p) { return p.group === "weekday" && /mincha/i.test(p.en); })[0]; }
  function t12(min) { return S.hm(min, S.prefs.lang === "en"); }
  function first(id) { var n = S.N(S.memberById(id)).split(" "); return n[0] + (n[1] ? " " + n[1].charAt(0) + "׳" : ""); }
  function firstEn(id) { var m = S.memberById(id); var n = (m.en || "").split(" "); return n[0] + (n[1] ? " " + n[1].charAt(0) + "." : ""); }
  function who(id) { return S.prefs.lang === "en" ? firstEn(id) : first(id); }

  /* a deterministic random, so the torn edges look the same on every visit */
  function rnd(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function tornTop(seed, depth) {
    var r = rnd(seed), pts = [], n = 34;
    for (var i = 0; i <= n; i++) pts.push((i / n * 100).toFixed(2) + "% " + (r() * depth).toFixed(2) + "%");
    return "polygon(" + pts.join(",") + ",100% 100%,0% 100%)";
  }

  /* ---------- the objects ---------- */
  function hand(cls, html) { return '<span class="hd ' + (cls || "") + '">' + html + "</span>"; }
  function noteHtml() {
    var t = window.SHUL_TV.prayerTime(mincha());
    return '<span class="pp slip" style="clip-path:' + tornTop(11, 3.2) + '">' +
      hand("ks lg", L("מנחה ", "Mincha ") + "<s>" + S.hm(t - 10, false) + "</s> " + L("←", "→") + " " + S.hm(t, false) + " !!") +
      hand("", L("לשנות בלוח בכניסה", "fix the board")) +
      hand("", L("+ בדף השבת", "+ Shabbat bulletin")) +
      hand("", L("+ באתר (מי יודע איך?)", "+ website (how??)")) + "</span>";
  }
  function envelopeHtml() {
    return '<span class="cheque"><span class="ck-bank">' + L("לפקודת", "PAY TO THE ORDER OF") + '</span><span class="ck-amt hd">$180.00</span><span class="ck-line"></span></span>' +
      '<span class="clip" aria-hidden="true">' + clipSvg() + "</span>" +
      '<span class="pp env"><span class="flap"></span>' +
      hand("gr head", L("דמי חבר · כסלו", "Dues · Kislev")) +
      hand("gr ks", who("m1") + " — $360 ✗") +
      hand("gr", who("m2") + L(" — שילם?", " — paid?")) +
      hand("gr", who("m5") + " — $180 ✓") +
      hand("gr red", L("לבדוק מי שילם בכרטיס!!", "check who paid by card!!")) + "</span>";
  }
  function nedarimHtml() {
    var coils = ""; for (var i = 0; i < 11; i++) coils += "<i></i>";
    return '<span class="pad"><span class="coils">' + coils + '</span><span class="pp padpage">' +
      hand("head", L("נדרים · פ׳ " + S.PARASHA.he, "Nedarim · " + S.PARASHA.en)) +
      hand("", L("שלישי — לוי 18", "Levi — 18")) +
      hand("ks", L("רביעי — ", "") + who("m3") + " <s>52</s> 72??") +
      hand("", L("מפטיר — ??? לא זוכר", "Maftir — ???")) +
      hand("", L("+ להעביר לחשבונות", "+ into the accounts")) + "</span></span>";
  }
  function flyerHtml() {
    return '<span class="pp flyer"><span class="fl-shul">' + esc(S.N(S.db.shul)) + '</span><span class="fl-title">' + L("מלווה מלכה", "Melave Malka") + '</span><span class="fl-rule"></span>' +
      '<span class="fl-when">' + L("מוצאי שבת · 28 בנובמבר · 8:30", "Motzei Shabbat · Nov 28 · 8:30") + '</span><span class="fl-sub">' + L("מוזיקה חיה · ארוחה חמה · דברי תורה", "Live music · a hot meal · divrei Torah") + "</span>" +
      '<span class="fold fv"></span><span class="fold fh"></span>' + hand("ks corner", L("לתלות בלוח + לשלוח בווטסאפ!", "board + WhatsApp!")) + "</span>";
  }
  function yahrzeitHtml() {
    return '<span class="pp ycard"><span class="card-red"></span>' +
      hand("head", L("יארצייטים · כסלו", "Yahrzeits · Kislev")) +
      hand("", L("ז׳ — אסתר בת שמואל (קליין)", "7 — Esther bat Shmuel")) +
      hand("", L("ט׳ — יוסף בן אהרן (פרידמן)", "9 — Yosef ben Aharon")) +
      hand("ks", L("כ׳ — דבורה בת מנחם, ביקש ", "20 — Devorah b. Menachem, ") + who("m7")) +
      hand("red", L("לא לשכוח!!!", "don't forget!!!")) + '<span class="ear"></span></span>';
  }
  function clipSvg() {
    return '<svg viewBox="0 0 40 110" aria-hidden="true"><path d="M14 30 V88 a8 8 0 0 0 16 0 V18 a12 12 0 0 0 -24 0 V92 a16 16 0 0 0 32 0 V34" fill="none" stroke="#8d939b" stroke-width="3.4" stroke-linecap="round"/><path d="M14 30 V88 a8 8 0 0 0 16 0 V18 a12 12 0 0 0 -24 0 V92 a16 16 0 0 0 32 0 V34" fill="none" stroke="#e8ecf0" stroke-width="1.1" stroke-linecap="round" transform="translate(-.6 -.6)"/></svg>';
  }
  function remoteSvg() {
    var k = "", n = 1;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) {
      var lab = r === 3 ? (c === 1 ? "0" : "") : String(n++); if (r === 3 && c !== 1) continue;
      var cx = 24 + c * 26, cy = 96 + r * 24;
      k += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="url(#rk)"/><text x="' + cx + '" y="' + (cy + 3.2) + '" text-anchor="middle" font-size="8.5" fill="#d8d6d2" font-family="Inter,Arial">' + lab + "</text>";
    }
    var tape = S.prefs.lang === "en" ? "screen · hall" : "מסך · אולם";
    return '<svg viewBox="0 0 100 420" aria-hidden="true"><defs>' +
      '<linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#303034"/><stop offset=".18" stop-color="#232326"/><stop offset=".8" stop-color="#1b1b1e"/><stop offset="1" stop-color="#2a2a2e"/></linearGradient>' +
      '<radialGradient id="rk" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#4a4a50"/><stop offset="1" stop-color="#2c2c30"/></radialGradient>' +
      '<radialGradient id="rp" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#b8473b"/><stop offset="1" stop-color="#7a2620"/></radialGradient></defs>' +
      '<rect x="3" y="3" width="94" height="414" rx="38" fill="url(#rb)" stroke="#101012" stroke-width="2"/>' +
      '<rect x="9" y="7" width="82" height="20" rx="10" fill="#fff" opacity=".04"/>' +
      '<rect x="38" y="12" width="24" height="7" rx="3.5" fill="#2a0d0d"/>' +
      '<circle cx="28" cy="48" r="9" fill="url(#rp)"/><path d="M28 43 v5 M24.4 45 a5 5 0 1 0 7.2 0" stroke="#f1d7d2" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<rect x="56" y="41" width="22" height="13" rx="6.5" fill="url(#rk)"/>' + k +
      '<circle cx="50" cy="222" r="30" fill="#2e2e33" stroke="#141416" stroke-width="1.5"/><circle cx="50" cy="222" r="13" fill="url(#rk)"/><text x="50" y="225.5" text-anchor="middle" font-size="9" fill="#d8d6d2" font-family="Inter,Arial">OK</text>' +
      '<path d="M50 196 l4 5 h-8z M50 248 l4 -5 h-8z M24 222 l5 -4 v8z M76 222 l-5 -4 v8z" fill="#bdbab4"/>' +
      '<rect x="14" y="268" width="18" height="54" rx="9" fill="url(#rk)"/><rect x="68" y="268" width="18" height="54" rx="9" fill="url(#rk)"/>' +
      '<text x="23" y="282" text-anchor="middle" font-size="10" fill="#d8d6d2">+</text><text x="23" y="316" text-anchor="middle" font-size="10" fill="#d8d6d2">−</text><text x="77" y="282" text-anchor="middle" font-size="8" fill="#d8d6d2">▲</text><text x="77" y="316" text-anchor="middle" font-size="8" fill="#d8d6d2">▼</text>' +
      '<rect x="16" y="336" width="14" height="7" rx="3" fill="#8a3a32"/><rect x="34" y="336" width="14" height="7" rx="3" fill="#5c7a4a"/><rect x="52" y="336" width="14" height="7" rx="3" fill="#a88a3c"/><rect x="70" y="336" width="14" height="7" rx="3" fill="#3f5a86"/>' +
      '<g transform="rotate(-3 50 378)"><path d="M6 362 l3 2 -2 3 3 2 -2 3 3 2 -2 3 3 2 -2 3 3 2 -2 3 H94 l-3 -2 2 -3 -3 -2 2 -3 -3 -2 2 -3 -3 -2 2 -3 -3 -2 2 -3 Z" fill="#e6d8b0" opacity=".93"/>' +
      '<text x="50" y="384" text-anchor="middle" font-size="19" fill="#26306b" font-family="\'Amatic SC\',cursive" font-weight="700"' + (S.prefs.lang === "en" ? "" : ' direction="rtl"') + ">" + esc(tape) + "</text></g></svg>";
  }
  function keyPath(R, Lb, h) {
    var a = R - 3;
    return "M" + (-R) + " 0 A" + R + " " + R + " 0 1 0 " + R + " 0 A" + R + " " + R + " 0 1 0 " + (-R) + " 0 Z M" + (-R * .75) + " 0 A" + (R * .3) + " " + (R * .3) + " 0 1 0 " + (-R * .15) + " 0 A" + (R * .3) + " " + (R * .3) + " 0 1 0 " + (-R * .75) + " 0 Z" +
      " M" + a + " " + (-h / 2) + " H" + (R + Lb) + " L" + (R + Lb + 8) + " " + (-h / 2 + 5) + " V" + (h / 2 - 3) + " H" + (R + Lb - 10) + " l-6 7 l-7 -7 l-6 9 l-7 -9 l-6 6 l-6 -6 H" + (R + 14) + " V" + (h / 2) + " H" + a + " Z";
  }
  function keysSvg() {
    var tag = function (x, y, rot, txt, w) {
      return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ')"><path d="M0 0 h' + w + ' v40 h-' + w + ' l-14 -20z" fill="url(#kr)"/><circle cx="-3" cy="20" r="4.8" fill="none" stroke="#efe3c8" stroke-width="3.4"/><circle cx="-3" cy="20" r="2.6" fill="#3a2a1a" opacity=".55"/>' +
        '<text x="' + (w / 2 + 2) + '" y="28" text-anchor="middle" font-size="21" font-weight="700" fill="#26306b" font-family="\'Amatic SC\',cursive"' + (S.prefs.lang === "en" ? "" : ' direction="rtl"') + ">" + esc(txt) + "</text></g>";
    };
    return '<svg viewBox="0 0 320 240" aria-hidden="true"><defs>' +
      '<linearGradient id="kb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecd590"/><stop offset=".45" stop-color="#c49b45"/><stop offset="1" stop-color="#8d6a26"/></linearGradient>' +
      '<linearGradient id="ks" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f3f4"/><stop offset=".5" stop-color="#a9adb2"/><stop offset="1" stop-color="#6f7378"/></linearGradient>' +
      '<linearGradient id="kr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#cfa877"/><stop offset="1" stop-color="#b78e5c"/></linearGradient></defs>' +
      '<path d="M86 64 C 120 70, 150 30, 196 40" stroke="#ece4d2" stroke-width="1.3" fill="none"/><path d="M80 80 C 110 130, 160 170, 205 199" stroke="#ece4d2" stroke-width="1.3" fill="none"/>' +
      tag(196, 20, 8, L("משרד", "Office"), 84) + tag(208, 180, 8, L("ארון קודש", "Aron Kodesh"), 104) +
      '<g transform="translate(112 112) rotate(16)"><path d="' + keyPath(20, 108, 16) + '" fill="url(#kb)" fill-rule="evenodd" stroke="#6e5220" stroke-width=".8"/></g>' +
      '<g transform="translate(88 132) rotate(74)"><path d="' + keyPath(17, 90, 14) + '" fill="url(#ks)" fill-rule="evenodd" stroke="#55595e" stroke-width=".8"/></g>' +
      '<g transform="translate(108 96) rotate(-6)"><path d="' + keyPath(15, 76, 13) + '" fill="url(#kb)" fill-rule="evenodd" stroke="#6e5220" stroke-width=".8"/></g>' +
      '<circle cx="76" cy="78" r="30" fill="none" stroke="url(#ks)" stroke-width="5.5"/><circle cx="76" cy="78" r="30" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1" stroke-dasharray="40 150" transform="rotate(200 76 78)"/>' +
      tag(28, 172, -14, L("לגבאי הבא?", "next gabbai?"), 100) + '<path d="M70 108 C 60 140, 44 160, 30 186" stroke="#ece4d2" stroke-width="1.3" fill="none"/></svg>';
  }
  /* props: no meaning, only the feel of a real drawer */
  function propsHtml() {
    var coin = function (cls, r) { return '<span class="dw-prop ' + cls + '" aria-hidden="true"><svg viewBox="0 0 40 40"><defs><linearGradient id="cg' + r + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9e9e6"/><stop offset=".55" stop-color="#c3c5c6"/><stop offset="1" stop-color="#9a9da0"/></linearGradient></defs><circle cx="20" cy="20" r="19.2" fill="url(#cg' + r + ')" stroke="#8e9195" stroke-width=".8"/><circle cx="20" cy="20" r="16.4" fill="none" stroke="#a5a8ab" stroke-width=".9"/><circle cx="20" cy="20" r="16.4" fill="none" stroke="#f4f4f2" stroke-opacity=".7" stroke-width=".5" transform="translate(-.5 -.5)"/><path d="M15 27 c0-5 2-6 4-8 c1.5-1.5 1-4 3-5 c2-.8 3.5 1 3 3 c-.4 1.6-2 2-1.6 3.6 c.5 2 2.6 2.6 2.6 6.4" fill="none" stroke="#8f9296" stroke-width="1.1" stroke-linecap="round" opacity=".55"/></svg></span>'; };
    return '<span class="dw-prop pencil" aria-hidden="true"><i class="pc-tip"></i><i class="pc-body"></i><i class="pc-fer"></i><i class="pc-er"></i></span>' +
      coin("coin c1", 1) + coin("coin c2", 2) +
      '<span class="dw-prop band" aria-hidden="true"><svg viewBox="0 0 80 50"><path d="M10 26 C 8 8, 66 4, 72 20 C 78 38, 30 48, 14 40 C 6 36, 10 30, 10 26 Z" fill="none" stroke="#a5523b" stroke-width="2.6"/></svg></span>' +
      '<span class="dw-prop clip2" aria-hidden="true">' + clipSvg() + "</span>";
  }

  /* what each object is, where it lies (desktop x/y/w/rotation, then phone), and what replaces it */
  function objects() {
    return [
      { id: "times", cls: "o-note", html: noteHtml(), pos: [61, 8, 17, 5, 5, 5.5, 46, 4],
        name: ["פתק עם השעה החדשה של מנחה", "A slip with the new Mincha time"],
        k: ["זמני תפילה", "Davening times"], h: ["מנחה זזה? משנים פעם אחת.", "Mincha moved? Change it once."],
        p: ["משנים את השעה במערכת, והיא מופיעה מיד במסך בבית הכנסת, באתר ובדף השבת. נסו כאן: הזיזו את מנחה, והמסך שלידה מתעדכן.", "Change the time in the system and it shows at once on the shul screen, the website and the Shabbat bulletin. Try it here: move Mincha, and the screen beside it follows."],
        vis: "times", role: "content", dest: "#/gabbai/tv" },
      { id: "money", cls: "o-env", html: envelopeHtml(), pos: [26, 13, 30, 2.5, 4, 28.0, 70, 2],
        name: ["מעטפה של דמי חבר", "An envelope of membership dues"],
        k: ["חובות ותשלומים", "Balances and payments"], h: ["אף אחד לא רודף אחרי חובות.", "Nobody chases balances."],
        p: ["לכל מתפלל יש חשבון בטלפון: היתרה, כל חיוב וכל תשלום. הוא משלם בכרטיס, והתשלום נרשם מעצמו. בסוף השנה, מכתב מס לכל מתפלל בלחיצה.", "Every member has an account on their phone: the balance, every charge and every payment. They pay by card and it records itself. At year end, a tax letter for every member in one click."],
        vis: "member", role: "member", dest: "#/me" },
      { id: "nedarim", cls: "o-pad", html: nedarimHtml(), pos: [4.5, 7, 18, -4, 5, 49.5, 40, -3],
        name: ["מחברת הנדרים", "The nedarim notebook"],
        k: ["נדרי שבת", "Shabbat nedarim"], h: ["במוצאי שבת: טבלה אחת, שמירה אחת.", "Motzei Shabbat: one table, one save."],
        p: ["רושמים את כל העליות בטבלה אחת. כל נדר נכנס לחשבון של המתפלל, והוא רואה אותו בטלפון.", "Enter every aliyah in one table. Each neder goes onto the member's account, and they see it on their phone."],
        vis: "#/finance/nedarim", role: "finance", dest: "#/finance/nedarim" },
      { id: "flyer", cls: "o-flyer", html: flyerHtml(), pos: [41, 47, 19, -3.5, 50, 50.5, 44, 3],
        name: ["פלייר של מלווה מלכה", "A Melave Malka flyer"],
        k: ["הודעות ופליירים", "Announcements and flyers"], h: ["מפרסמים פעם אחת. כולם רואים.", "Post it once. Everyone sees it."],
        p: ["ההודעה עולה ללוח הקהילה במסך, בתאריכים ובימים שבחרתם, ועל הודעה חדשה המתפללים מקבלים התראה בטלפון. בשבת ההודעות יורדות מהמסך לבד.", "It goes up on the screen's community board, on the dates and days you choose, and a new announcement sends members a notification on their phone. On Shabbat, announcements leave the screen on their own."],
        vis: "#/gabbai/content", role: "content", dest: "#/gabbai/content" },
      { id: "yahrzeit", cls: "o-card", html: yahrzeitHtml(), pos: [6, 60, 28, 2.5, 4, 81.0, 60, 2],
        name: ["כרטיס היארצייטים", "The yahrzeit card"],
        k: ["יארצייטים", "Yahrzeits"], h: ["המשפחה מבקשת, אתם מאשרים. המסך זוכר כל שנה.", "The family asks, you approve. The screen remembers every year."],
        p: ["המתפלל מבקש מהחשבון שלו. אחרי לחיצת אישור, היארצייט מוצג במסך בשבוע שלו, בכל שנה.", "The member asks from their account. After one tap to approve, the yahrzeit shows on the screen in its week, every year."],
        vis: "#/gabbai/content?type=yahrzeit", role: "content", dest: "#/gabbai/content?type=yahrzeit" },
      { id: "screen", cls: "o-remote", html: remoteSvg(), pos: [84.5, 6, 7.4, -9, 79, 6.5, 13, -7],
        name: ["השלט של המסך", "The screen's remote"],
        k: ["המסך באולם", "The screen in the shul"], h: ["המסך עובד לבד. גם בשבת.", "The screen runs itself. On Shabbat too."],
        p: ["זמני היום והתפילות, לוח הקהילה, הלכה יומית ודף יומי. בהדלקת נרות הוא עובר למצב שבת, ובלילה מתעמעם. מהמערכת מרעננים אותו בלחיצה, ובמערכת המלאה גם רואים צילום שלו, מכבים ומדליקים, ומקבלים התראה אם הוא מתנתק.", "Zmanim and davening times, the community board, a halacha of the day and the Daf Yomi. At candle lighting it switches to Shabbat mode, and at night it dims. From the system you refresh it in one press; the full system also shows you a screenshot of it, powers it on and off, and alerts you if it goes offline."],
        vis: "screen", role: null, dest: "#/screen" },
      { id: "keys", cls: "o-keys", html: keysSvg(), pos: [65, 57, 24, 0, 64, 83.5, 34, -4],
        name: ["צרור המפתחות", "The keys"],
        k: ["גבאים והרשאות", "Gabbaim and permissions"], h: ["מחליפים גבאי? שום דבר לא הולך לאיבוד.", "A new gabbai? Nothing gets lost."],
        p: ["לכל גבאי הרשאה משלו: כספים, או תוכן וזמנים. כל פעולה נרשמת ביומן, וגיבוי מלא נשמר כל לילה. הגבאי הבא מקבל הכל, מסודר.", "Each gabbai gets their own access: finances, or content and times. Every action is logged, and a full backup is kept every night. The next gabbai gets it all, in order."],
        vis: "#/admin", role: "super", dest: "#/admin" }
    ];
  }

  var ALSO = [
    ["דף שבת שנבנה לבד מהזמנים, ונשלח להדפסה במדפסת של בית הכנסת מכל מקום", "A Shabbat bulletin that builds itself from the times, sent to the shul's printer from anywhere"],
    ["תרומות באתר: כרטיס, Apple Pay ו-Google Pay", "Donations on the website: card, Apple Pay and Google Pay"],
    ["משפחות חדשות נרשמות לבד, ואתם מאשרים", "New families sign up themselves, and you approve"],
    ["אפליקציה לגבאי בטלפון אנדרואיד", "A gabbai app for Android phones"],
    ["דוח שנתי ומכתבי מס לכל מתפלל", "An annual report and tax letters for every member"],
    ["הכל בעברית ובאנגלית", "Everything in Hebrew and English"]
  ];
  var TRY = [
    { role: "super", dest: "#/gabbai", h: ["אני הגבאי", "I'm the gabbai"], p: ["לוח הבקרה: תשלומים, נדרים, זמנים והמסך", "The dashboard: payments, nedarim, times and the screen"] },
    { role: "member", dest: "#/me", h: ["אני מתפלל", "I'm a member"], p: ["החשבון בטלפון: יתרה, תשלום ויארצייטים", "The phone account: balance, paying and yahrzeits"] },
    { role: null, dest: "#/screen", h: ["המסך באולם", "The shul screen"], p: ["זמנים, לוח הקהילה ומצב שבת", "Times, the community board and Shabbat mode"] },
    { role: null, dest: "#/tour", h: ["סיור מלא", "The full tour"], p: ["כל חלקי המערכת, ומה מותאם אישית", "Every part of the system, and what's made for you"] }
  ];

  /* ---------- what replaces each object: the live system ---------- */
  var MOMENTS = [["1:600", "יום חול", "A weekday"], ["5:930", "שישי, לפני הדלקת נרות", "Friday, before candles"], ["6:660", "שבת", "Shabbat"], ["2:1425", "לילה", "Night"]];
  function visual(o) {
    if (o.vis === "times") {
      var p = mincha();
      return '<div class="dv-times"><div class="dv-ed"><div><b>' + esc(S.N(p)) + "</b><small>" + L("ימי חול", "Weekdays") + '</small></div><div class="dv-ctl"><button type="button" data-mn="-5" aria-label="' + L("5 דקות מוקדם יותר", "5 minutes earlier") + '">−5</button><output id="mnT">' + t12(window.SHUL_TV.prayerTime(p)) + '</output><button type="button" data-mn="5" aria-label="' + L("5 דקות מאוחר יותר", "5 minutes later") + '">+5</button></div></div><p id="mnNote" class="dv-note" aria-live="polite">' + L("לחצו על ‎+5‎ או ‎−5‎ וצפו במסך.", "Press +5 or −5 and watch the screen.") + "</p>" +
        X.tvset(X.frame("#/tv?preview=1&clock=1:720", 1920, 1080, "", L("המסך", "Screen"))) + "</div>";
    }
    if (o.vis === "screen") {
      return '<div class="dv-screen"><div class="dv-moments" role="group" aria-label="' + L("רגע בשבוע", "Moment of the week") + '">' + MOMENTS.map(function (m, i) { return '<button type="button" data-mom="' + m[0] + '" aria-pressed="' + (i === 0) + '">' + L(m[1], m[2]) + "</button>"; }).join("") + "</div>" +
        X.tvset(X.frame("#/tv?preview=1&clock=" + MOMENTS[0][0], 1920, 1080, "", L("המסך", "Screen"))) + "</div>";
    }
    if (o.vis === "member") return '<div class="dv-phone">' + X.phone(X.frame("#/me?frame=1&as=member", 400, 860, "", L("חשבון המתפלל", "Member account"))) + "</div>";
    return X.browser("admin." + X.slug() + ".org", X.frame(o.vis + (o.vis.indexOf("?") > 0 ? "&" : "?") + "frame=1&as=" + o.role, 1360, 860, "", L(o.k[0], o.k[1])), "dv-win");
  }

  UI.route("/", {
    layout: "xp", live: false, title: function () { return L("המגירה של הגבאי", "The gabbai's drawer"); },
    render: function (app) {
      if (cleanup) cleanup();
      document.body.classList.add("pg-dw");
      var OB = objects(), timers = [];
      var left = function () { return OB.filter(function (o) { return !taken[o.id]; }).length; };

      app.innerHTML = '<div class="dw">' +
        '<section class="dw-scene" id="dwScene">' +
        '<div class="dw-desk"><header class="dw-top"><a class="dw-mark" href="#/">' + UI.logo() + '<span>Shul System</span></a><nav><button type="button" data-open-first>' + L("איך זה עובד", "How it works") + '</button><button type="button" data-go="dwTry">' + L("לנסות", "Try it") + '</button><span class="dw-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button data-xl="he" aria-pressed="' + (S.prefs.lang === "he") + '">עב</button><button data-xl="en" aria-pressed="' + (S.prefs.lang === "en") + '">EN</button></span><a class="dw-cta" href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + "</a></nav></header>" +
        '<div class="dw-intro"><p class="dw-kick">' + L("מערכת לניהול בית הכנסת", "Software for running a shul") + "</p><h1>" + L("המגירה של הגבאי.", "The gabbai's drawer.") + "</h1><p>" + L("כל מה שבפנים, המערכת כבר עושה. הרימו משהו.", "Everything in here, the system already does. Pick something up.") + "</p></div></div>" +
        '<div class="dw-stage"><div class="dw-drawer' + (opened || reduce ? " open" : "") + '" id="dwDrawer"><div class="dw-box"><div class="dw-in" id="dwIn">' + propsHtml() +
        OB.map(function (o, i) {
          var p = o.pos;
          return '<button type="button" class="dw-obj ' + o.cls + (taken[o.id] ? " done" : "") + '" data-i="' + i + '" aria-label="' + esc(L(o.name[0], o.name[1])) + '" style="--x:' + p[0] + "%;--y:" + p[1] + "%;--w:" + p[2] + "%;--r:" + p[3] + "deg;--mx:" + p[4] + "%;--my:" + p[5] + "%;--mw:" + p[6] + "%;--mr:" + p[7] + 'deg"><span class="obj">' + o.html + "</span></button>";
        }).join("") +
        '</div></div><div class="dw-front"><span class="dw-pull"><i></i><i></i></span></div></div>' +
        '<div class="dw-final" id="dwFinal" hidden><p class="dw-kick">' + L("מוצאי שבת, עם המערכת", "Motzei Shabbat, with the system") + "</p><h2>" + L("המגירה ריקה.", "The drawer is empty.") + "</h2><p>" + L("כל מה שהיה בה, המערכת עושה. בואו נכין אחת כזאת לבית הכנסת שלכם.", "Everything that was in it, the system does. Let's set one up for your shul.") + '</p><div class="dw-btns"><a class="dw-btn" href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + '</a><a class="dw-btn ghost" href="tel:' + SALES.tel + '"><bdi dir="ltr">' + esc(SALES.phone) + '</bdi></a></div><button type="button" class="dw-link" id="dwReopen">' + L("לפתוח את המגירה שוב", "Open the drawer again") + "</button></div></div>" +
        '<div class="dw-foot" id="dwFoot"></div></section>' +

        /* below the drawer */
        '<section class="dw-also"><div class="dw-wrap"><h2>' + L("ועוד כמה דברים שכבר לא צריכים מגירה.", "And a few more things that no longer need a drawer.") + "</h2><ul>" + ALSO.map(function (a) { return "<li>" + L(a[0], a[1]) + "</li>"; }).join("") + "</ul></div></section>" +
        '<section class="dw-try" id="dwTry"><div class="dw-wrap"><h2>' + L("נסו בעצמכם.", "Try it yourself.") + "</h2><p>" + L("זו המערכת האמיתית, עם קהילה לדוגמה. אי אפשר לקלקל כלום.", "This is the real system, with a sample community. You can't break anything.") + '</p><div class="dw-try-grid">' +
        TRY.map(function (t, i) { return '<a class="dw-card" href="' + t.dest + '"' + (t.role ? ' data-role="' + t.role + '"' : "") + '><span class="dw-card-n">0' + (i + 1) + "</span><b>" + L(t.h[0], t.h[1]) + "</b><span>" + L(t.p[0], t.p[1]) + "</span><em>" + L("לפתוח", "Open") + " " + X.ARROW + "</em></a>"; }).join("") + "</div></div></section>" +
        '<section class="dw-looks"><div class="dw-wrap"><h2>' + L("ייראה כמו בית הכנסת שלכם.", "It looks like your shul.") + "</h2><p>" + L("לוגו, צבעים, גופנים וכל מילה, בהתאמה מלאה. המערכת עצמה זהה בכל עיצוב. ארבע דוגמאות:", "Logo, colors, fonts and every word, fully customized. The system itself is the same in every design. Four examples:") + '</p><div class="dw-looks-row">' +
        UI.THEMES.map(function (t) { return '<button type="button" class="dw-look" data-look="' + t.id + '"><span class="dw-sw" style="background:' + t.c + '"></span><b>' + esc(S.N(t)) + "</b></button>"; }).join("") + "</div></div></section>" +
        '<section class="dw-end"><div class="dw-wrap"><div class="dw-bcard"><span class="bc-logo">' + UI.logo() + '</span><b>Shul System</b><span class="bc-line">' + L("מערכת לניהול בית הכנסת", "Software for running a shul") + '</span><a href="tel:' + SALES.tel + '"><bdi dir="ltr">' + esc(SALES.phone) + '</bdi></a><a href="mailto:' + SALES.email + '"><bdi dir="ltr">' + esc(SALES.email) + "</bdi></a></div>" +
        '<div class="dw-end-copy"><h2>' + L("בואו נדבר.", "Let's talk.") + "</h2><p>" + L("נכין לבית הכנסת שלכם הדגמה אישית, בשם ובעיצוב שלכם, והצעה למנוי חודשי.", "We'll prepare a personal demo for your shul, in your name and design, and a monthly subscription proposal.") + '</p><div class="dw-btns"><a class="dw-btn light" href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + '</a><a class="dw-btn ghost light" href="#/tour">' + L("סיור מלא במערכת", "Full platform tour") + "</a></div></div></div>" +
        '<p class="dw-fine">' + L("הדגמה עם נתונים בדויים. אין תשלומים, אימיילים או התראות אמיתיים.", "Demo with fictional data. No real payments, emails or notifications.") + "</p></section></div>";

      var drawer = app.querySelector("#dwDrawer"), foot = app.querySelector("#dwFoot"), fin = app.querySelector("#dwFinal");

      /* the drawer opens once, after the fonts are in */
      if (!opened && !reduce) {
        var go = function () { timers.push(setTimeout(function () { drawer.classList.add("open"); opened = true; timers.push(setTimeout(function () { var o = app.querySelector(".dw-obj:not(.done)"); if (o) o.classList.add("hint"); }, 1500)); }, 250)); };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
      } else opened = true;

      function renderFoot() {
        var n = left();
        foot.innerHTML = n ? '<p><span class="dw-count">' + (S.prefs.lang === "en" ? n + (n === 1 ? " thing" : " things") + " left in the drawer." : (n === 1 ? "נשאר דבר אחד במגירה." : "נשארו " + n + " דברים במגירה.")) + '</span><span class="dw-dots" aria-hidden="true">' + OB.map(function (o) { return '<i class="' + (taken[o.id] ? "on" : "") + '"></i>'; }).join("") + '</span><button type="button" class="dw-link" data-go="dwTry">' + L("לדלג ולנסות בעצמי", "Skip, let me try it") + "</button></p>"
          : '<p><span class="dw-count">' + L("המגירה ריקה.", "The drawer is empty.") + '</span><button type="button" class="dw-btn small" id="dwClose">' + L("לסגור את המגירה", "Close the drawer") + "</button></p>";
        var c = foot.querySelector("#dwClose"); if (c) c.addEventListener("click", closeDrawer);
        foot.querySelectorAll("[data-go]").forEach(bindGo);
      }
      function closeDrawer() {
        drawer.classList.remove("open"); drawer.classList.add("shut");
        timers.push(setTimeout(function () { fin.hidden = false; requestAnimationFrame(function () { fin.classList.add("on"); }); foot.innerHTML = ""; }, reduce ? 0 : 900));
      }
      app.querySelector("#dwReopen").addEventListener("click", function () {
        taken = {}; fin.classList.remove("on"); fin.hidden = true;
        app.querySelectorAll(".dw-obj").forEach(function (o) { o.classList.remove("done"); });
        drawer.classList.remove("shut"); drawer.classList.add("open"); renderFoot();
      });
      renderFoot();

      /* ---------- pick up, look, put away ---------- */
      var hold = null;
      function openObj(i) {
        var o = OB[i], btn = app.querySelector('.dw-obj[data-i="' + i + '"]');
        if (!btn || hold) return;
        app.querySelectorAll(".dw-obj.hint").forEach(function (x) { x.classList.remove("hint"); });
        var nextI = -1; for (var j = 1; j <= OB.length; j++) { var c = (i + j) % OB.length; if (!taken[OB[c].id] && c !== i) { nextI = c; break; } }
        var ov = document.createElement("div");
        ov.className = "dw-hold"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", L(o.k[0], o.k[1]));
        ov.innerHTML = '<div class="dw-slot" aria-hidden="true"></div><div class="dw-sheet"><button type="button" class="dw-x" aria-label="' + L("סגירה", "Close") + '">×</button>' +
          '<p class="dw-kick"><span>' + (i + 1) + " / " + OB.length + "</span>" + L(o.k[0], o.k[1]) + "</p><h2 tabindex=\"-1\">" + L(o.h[0], o.h[1]) + "</h2><p class=\"dw-p\">" + L(o.p[0], o.p[1]) + '</p><div class="dw-vis">' + visual(o) + "</div>" +
          '<div class="dw-acts"><a class="dw-btn" href="' + o.dest + '"' + (o.role ? ' data-role="' + o.role + '"' : "") + ">" + L("לנסות במערכת", "Try it in the system") + "</a>" +
          (nextI >= 0 ? '<button type="button" class="dw-btn ghost" data-next="' + nextI + '">' + L("הבא: ", "Next: ") + esc(L(OB[nextI].name[0], OB[nextI].name[1])) + "</button>" : '<button type="button" class="dw-btn ghost" data-finish>' + L("זה הכל. לסגור את המגירה", "That's all. Close the drawer") + "</button>") + "</div></div>";
        document.body.appendChild(ov);
        document.documentElement.classList.add("dw-lock");
        X.fitFrames(ov);

        /* the object flies from the drawer to the slot */
        var slot = ov.querySelector(".dw-slot");
        var w0 = btn.offsetWidth, h0 = btn.offsetHeight, r0 = btn.getBoundingClientRect();
        var sr = slot.getBoundingClientRect();
        var k = Math.min(sr.width / w0, sr.height / h0, o.id === "screen" ? 2.1 : 3);
        var fly = document.createElement("div");
        fly.className = "dw-fly " + o.cls;
        fly.innerHTML = '<span class="obj">' + o.html + "</span>";
        fly.style.cssText = "position:fixed;left:" + (r0.left + r0.width / 2 - w0 / 2) + "px;top:" + (r0.top + r0.height / 2 - h0 / 2) + "px;width:" + w0 + "px;";
        ov.appendChild(fly);
        btn.classList.add("lifted");
        var dx = sr.left + sr.width / 2 - (r0.left + r0.width / 2), dy = sr.top + sr.height / 2 - (r0.top + r0.height / 2);
        var r1 = o.id === "screen" ? -4 : o.pos[3] * .25;
        var settle = function () {
          fly.style.cssText = "width:" + (w0 * k) + "px;rotate:" + r1 + "deg";
          slot.style.width = w0 * k + "px"; slot.style.height = h0 * k + "px";
          slot.appendChild(fly); fly.classList.add("held");
        };
        requestAnimationFrame(function () { ov.classList.add("on"); });
        if (reduce || !fly.animate) settle();
        else {
          var a = fly.animate([{ transform: "translate(0,0) rotate(" + o.pos[3] + "deg) scale(1)" }, { transform: "translate(" + dx + "px," + dy + "px) rotate(" + r1 + "deg) scale(" + k + ")" }], { duration: 720, easing: "cubic-bezier(.2,.75,.15,1)", fill: "forwards" });
          a.onfinish = function () { a.cancel(); settle(); };
        }
        var h2 = ov.querySelector("h2"); timers.push(setTimeout(function () { h2.focus({ preventScroll: true }); }, 60));

        hold = { ov: ov, i: i, btn: btn, fly: fly };
        bindSheet(ov, o);
      }
      function closeObj(then) {
        if (!hold) return;
        var h = hold; hold = null;
        taken[OB[h.i].id] = true;
        h.btn.classList.remove("lifted"); h.btn.classList.add("done");
        h.ov.classList.remove("on"); h.ov.classList.add("off");
        document.documentElement.classList.remove("dw-lock");
        renderFoot();
        timers.push(setTimeout(function () { h.ov.remove(); if (then) then(); else h.btn.focus({ preventScroll: true }); }, reduce ? 0 : 380));
      }
      function bindSheet(ov, o) {
        ov.querySelector(".dw-x").addEventListener("click", function () { closeObj(); });
        ov.addEventListener("click", function (e) { if (e.target === ov) closeObj(); });
        var nx = ov.querySelector("[data-next]"); if (nx) nx.addEventListener("click", function () { var n = +nx.getAttribute("data-next"); closeObj(function () { openObj(n); }); });
        var fi = ov.querySelector("[data-finish]"); if (fi) fi.addEventListener("click", function () { closeObj(function () { app.querySelector("#dwScene").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); timers.push(setTimeout(closeDrawer, 300)); }); });
        ov.querySelectorAll("a[data-role]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); var r = a.getAttribute("data-role"), d = a.getAttribute("href"); closeObj(function () { X.go(r, d); }); }); });
        ov.querySelectorAll("a:not([data-role])").forEach(function (a) { a.addEventListener("click", function () { closeObj(); }); });
        /* the Mincha edit */
        var mnT = ov.querySelector("#mnT"), note = ov.querySelector("#mnNote");
        ov.querySelectorAll("[data-mn]").forEach(function (b) {
          b.addEventListener("click", function () {
            var p = mincha(), t = window.SHUL_TV.prayerTime(p) + +b.getAttribute("data-mn");
            if (t < 12 * 60 || t > 20 * 60) return;
            p.time = t; delete p.rel;
            S.log("times", "עדכן זמן תפילה: " + p.he + " " + S.hm(t, false), "Updated davening time: " + p.en + " " + S.hm(t, false));
            S.save();
            mnT.textContent = t12(t); UI.flash(mnT);
            note.textContent = L("נשמר. המסך כבר מציג ", "Saved. The screen already shows ") + S.N(p) + " " + t12(t) + ".";
            note.classList.add("ok");
          });
        });
        /* moments of the week on the screen */
        var ifr = ov.querySelector(".dv-screen iframe");
        ov.querySelectorAll("[data-mom]").forEach(function (b) {
          b.addEventListener("click", function () {
            ov.querySelectorAll("[data-mom]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
            ifr.src = "index.html#/tv?preview=1&clock=" + b.getAttribute("data-mom") + "&r=" + Date.now();
          });
        });
      }
      function onKey(e) { if (e.key === "Escape" && hold) closeObj(); }
      document.addEventListener("keydown", onKey);

      app.querySelectorAll(".dw-obj").forEach(function (b) { b.addEventListener("click", function () { openObj(+b.getAttribute("data-i")); }); });
      app.querySelector("[data-open-first]").addEventListener("click", function () {
        var i = 0; for (var j = 0; j < OB.length; j++) if (!taken[OB[j].id]) { i = j; break; }
        app.querySelector("#dwScene").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        timers.push(setTimeout(function () { openObj(i); }, 300));
      });

      /* nav and links */
      function goTo(id) { var el = app.querySelector("#" + id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
      function bindGo(b) { b.addEventListener("click", function () { goTo(b.getAttribute("data-go")); }); }
      app.querySelectorAll(".dw-top [data-go]").forEach(bindGo);
      app.querySelectorAll("[data-xl]").forEach(function (b) { b.addEventListener("click", function () { UI.setLang(b.getAttribute("data-xl")); }); });
      app.querySelectorAll(".dw-try a[data-role]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); X.go(a.getAttribute("data-role"), a.getAttribute("href")); }); });
      app.querySelectorAll("[data-look]").forEach(function (b) { b.addEventListener("click", function () { UI.setTheme(b.getAttribute("data-look"), true); location.hash = "#/showcase/design"; }); });

      function stop() {
        timers.forEach(clearTimeout); document.removeEventListener("keydown", onKey); window.removeEventListener("hashchange", onHash);
        if (hold) { hold.ov.remove(); hold = null; }
        document.documentElement.classList.remove("dw-lock"); document.body.classList.remove("pg-dw"); cleanup = null;
      }
      function onHash() { var h = (location.hash || "#/").split("?")[0]; if (h !== "#/" && h !== "#" && h !== "") stop(); }
      window.addEventListener("hashchange", onHash);
      cleanup = stop;
    }
  });
})();
