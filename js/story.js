/* Shul System sales demo | #/ the gabbai's story: "Motzei Shabbat, 23:40".
   The gabbai's phone fills with the questions every gabbai knows. As the visitor scrolls,
   each question is answered by a real capability of the system, shown live (the real demo
   product in a frame, on the fictional data). Nothing here promises a capability the
   production system does not have: every chapter maps to a row in FEATURE-MAP.md. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, X = window.SHUL_XP, L = S.L, esc = S.esc, I = UI.I;
  var SALES = UI.SALES;
  var ic = X.ic, ARROW = X.ARROW;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MOON = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>';

  /* the messages: fictional members of the demo congregation, each tied to a chapter */
  var MSGS = [
    { ch: 4, mid: "m7", t: "23:32", he: "תכניס בבקשה יארצייט לסבתא, דבורה בת מנחם, כ׳ כסלו", en: "Please add a yahrzeit for my grandmother, Devorah bat Menachem, 20 Kislev" },
    { ch: 0, mid: "m4", t: "23:31", he: "שבוע טוב! מנחה מחר באותה שעה? בלוח בכניסה עוד רשום הזמן של השבוע שעבר", en: "Shavua tov! Is Mincha tomorrow at the same time? The board at the entrance still shows last week's time" },
    { ch: 1, mid: "m1", t: "23:33", he: "כמה אני חייב בסך הכל? רוצה לסגור את החשבון", en: "How much do I owe in total? I'd like to settle my account" },
    { ch: 2, mid: "m8", t: "23:34", he: "שילמתי 250$ בכרטיס דרך האתר. הגיע אליך?", en: "I paid $250 by card on the website. Did it reach you?" },
    { ch: 3, mid: "m3", t: "23:35", he: "נדרתי בשבת על העלייה, ולא זוכר כמה אמרתי", en: "I pledged for my aliyah on Shabbat and can't remember how much I said" },
    { ch: 6, mid: "m16", t: "23:36", he: "צריך מכתב על התרומות של השנה, בשביל רואה החשבון", en: "I need a letter for this year's donations, for my accountant" },
    { ch: 1, mid: "m6", t: "23:37", he: "אפשר לשלם בכרטיס? אין לי צ׳קים בבית", en: "Can I pay by card? I have no checks at home" },
    { ch: 0, mid: "m10", t: "23:38", he: "יש מעריב שני גם השבוע?", en: "Is there a late Maariv this week too?" },
    { ch: 3, mid: "m2", t: "23:39", he: "רשמת כבר את הנדרים מהשבת? רוצה לשלם השבוע", en: "Have you recorded Shabbat's nedarim yet? I want to pay this week" },
    { ch: 5, mid: "m5", t: "23:39", he: "אפשר להעלות למסך מזל טוב? נולד לנו נכד, ברוך השם", en: "Can you put a Mazal Tov on the screen? We had a grandson, baruch Hashem" },
    { ch: 5, mid: "m11", t: "23:40", he: "מה הזמנים לשבת הבאה? אפשר לקבל את הדף?", en: "What are next Shabbat's times? Can I get the sheet?" }
  ];

  /* the chapters: each answer is a capability of the real system (see FEATURE-MAP.md) */
  var CH = [
    { ic: "clock", role: "content", dest: "#/gabbai/tv", tag: ["זמני תפילה", "Davening times"],
      h: ["משנים פעם אחת. המסך באולם כבר יודע.", "Change it once. The screen in the shul already knows."],
      p: ["גבאי התוכן מעדכן זמן תפילה, והמסך באולם מציג אותו תוך שנייה, בלי לרענן. כל הזמנים, מעריב שני והשיעורים מופיעים שם תמיד, לפי ימי השבוע.", "The content gabbai updates a davening time and the screen in the shul shows it within a second, no refresh. Every time, the late Maariv and the shiurim are always there, by day of the week."],
      go: ["לעורך זמני התפילה", "Open the times editor"], vis: "times" },
    { ic: "wallet", role: "member", dest: "#/me", tag: ["יתרות", "Balances"],
      h: ["כל מתפלל רואה את החשבון שלו, ומשלם לבד.", "Every member sees their own account, and pays on their own."],
      p: ["בחשבון האישי של המתפלל: היתרה, כל החיובים והתשלומים, ודף חשבון. תשלום היתרה בכרטיס נרשם מעצמו, והיתרה מתעדכנת מיד גם אצל גבאי הכספים.", "In the member's own account: the balance, every charge and payment, and a statement. Paying the balance by card records itself, and the balance updates at once for the finance gabbai too."],
      go: ["לחשבון המתפלל", "Open the member account"], vis: "member" },
    { ic: "inbox", role: "finance", dest: "#/finance/inbox", tag: ["תשלומים בכרטיס", "Card payments"],
      h: ["התשלום כבר מחכה לך, מותאם למתפלל.", "The payment is already waiting, matched to the member."],
      p: ["תשלומים ותרומות בכרטיס מהאתר מגיעים לתיבה אחת ומותאמים למתפלל לפי האימייל. לחיצה אחת, והם רשומים בכרטיס שלו.", "Card payments and donations from the website arrive in one inbox, matched to the member by email. One tap and they are recorded on the member's card."],
      go: ["לתיבת התשלומים", "Open the payments inbox"], vis: "#/finance/inbox" },
    { ic: "list", role: "finance", dest: "#/finance/nedarim", tag: ["נדרי שבת", "Shabbat nedarim"],
      h: ["מוצאי שבת: טבלה אחת, שמירה אחת.", "Motzei Shabbat: one table, one save."],
      p: ["כל העליות של השבת בטבלה אחת. כל נדר נרשם כחיוב בכרטיס המתפלל, והוא רואה אותו בחשבון שלו. בלי פתקים ובלי לזכור בעל פה.", "Every aliyah of Shabbat in one table. Each neder becomes a charge on the member's card, and the member sees it in their account. No slips of paper, nothing to remember."],
      go: ["לנדרי השבת", "Open Shabbat nedarim"], vis: "#/finance/nedarim" },
    { ic: "candle", role: "content", dest: "#/gabbai/content?type=yahrzeit", tag: ["יארצייטים", "Yahrzeits"],
      h: ["המשפחה מבקשת. אתה מאשר. המסך זוכר כל שנה.", "The family asks. You approve. The screen remembers every year."],
      p: ["המתפלל מוסיף את היארצייט מהחשבון שלו, גם אם יש לו רק תאריך לועזי. אצלך זה מופיע כבקשה ממתינה, ואחרי אישור היארצייט מוצג במסך בשבוע שלו, כל שנה.", "The member adds the yahrzeit from their account, even with only the English date. It reaches you as a pending request, and once approved it shows on the screen in its week, every year."],
      go: ["לבקשות היארצייט", "Open yahrzeit requests"], vis: "#/gabbai/content?type=yahrzeit" },
    { ic: "megaphone", role: "content", dest: "#/gabbai/shabbat", tag: ["המסך ודף השבת", "Screen and Shabbat bulletin"],
      h: ["מזל טוב על המסך. דף השבת נבנה לבד.", "Mazal Tov on the screen. The Shabbat bulletin builds itself."],
      p: ["הודעות, מזל טוב, פליירים והקדשות מתפרסמים למסך עם תאריכים וימים, ורואים תצוגה מקדימה לפני הפרסום. דף השבת נבנה מזמני היום ומזמני התפילה, מוכן להדפסה ולהצגה במסך.", "Announcements, Mazal Tov, flyers and dedications go to the screen with dates and days, with a preview before publishing. The Shabbat bulletin builds itself from the zmanim and davening times, ready to print and to show on the screen."],
      go: ["לדף השבת", "Open the Shabbat bulletin"], vis: "#/gabbai/shabbat" },
    { ic: "receipt", role: "finance", dest: "#/finance/more", tag: ["מכתבי מס", "Tax letters"],
      h: ["מכתב מס לכל מתפלל, בלי לשבת על זה בלילה.", "A tax letter for every member, without a late night."],
      p: ["מכתבי מס שנתיים לכל מתפלל, דוח שנתי לפי אמצעי תשלום, וחיובים קבועים כמו דמי חבר.", "Annual tax letters for every member, an annual report by payment method, and recurring charges such as membership."],
      go: ["למכתבי המס", "Open tax letters"], vis: "#/finance/more" }
  ];

  var BUTS = [
    { q: ["״אני לא איש של מחשבים.״", "“I'm not a computer person.”"], a: ["כל גבאי רואה רק את מה ששייך לתפקיד שלו: גבאי כספים את הכספים, גבאי תוכן את המסך והזמנים. בעברית ובאנגלית.", "Each gabbai sees only what belongs to their role: the finance gabbai the finances, the content gabbai the screen and times. In Hebrew and English."], href: "#/showcase/roles", role: null, l: ["לראות את התפקידים", "See the roles"] },
    { q: ["״מי יכניס את כל המתפללים?״", "“Who will enter all the members?”"], a: ["המתפללים נרשמים בעצמם באתר ושולחים בקשת הצטרפות. אתה מאשר בלחיצה, בוחר תפקיד, והם מקבלים אימייל ברוכים הבאים.", "Members sign up on the website and send a join request. You approve with one tap, choose a role, and they get a welcome email."], href: "#/finance/members", role: "super", l: ["לבקשות ההצטרפות", "See join requests"] },
    { q: ["״ומה אם משהו יימחק בטעות?״", "“What if something gets deleted by mistake?”"], a: ["רישום שמבטלים נשאר ביומן כתיקון ולא נמחק, כל פעולה נרשמת ביומן הפעילות, ויש גיבוי מלא כל לילה.", "A cancelled entry stays in the ledger as a correction and is never erased, every action is in the activity log, and there is a full backup every night."], href: "#/gabbai/activity", role: "super", l: ["ליומן הפעילות", "See the activity log"] },
    { q: ["״ומה יקרה כשאסיים את התפקיד?״", "“And when I hand over the role?”"], a: ["התפקיד עובר, הידע נשאר. נותנים הרשאה לגבאי הבא, וכל ההיסטוריה, היתרות והיארצייטים נשארים במקום.", "The role moves on, the knowledge stays. Give the next gabbai access, and all the history, balances and yahrzeits stay where they are."], href: "#/admin", role: "super", l: ["לגבאים והרשאות", "See gabbaim and permissions"] },
    { q: ["״הוועד ירצה לראות מספרים.״", "“The board will want to see numbers.”"], a: ["רשימת מי חייב, מהיתרה הגדולה לקטנה, ודוח הכנסות שנתי לפי אמצעי תשלום.", "Who owes, from the largest balance down, and an annual income report by payment method."], href: "#/finance/owes", role: "finance", l: ["למי חייב", "See who owes"] }
  ];

  function mincha() { return S.db.prayers.filter(function (p) { return p.id === "p3"; })[0] || S.db.prayers.filter(function (p) { return p.group === "weekday" && /mincha/i.test(p.en); })[0]; }
  function tomorrowShacharit() {
    var c = S.db.prayers.filter(function (p) { return p.group === "weekday" && /^shacharit/i.test(p.en) && (p.days !== "days" || (p.weekdays || []).indexOf(0) >= 0); });
    c.sort(function (a, b) { return a.time - b.time; });
    return c[0];
  }
  var cleanup = null;
  function t12(min) { return S.hm(min, S.prefs.lang === "en"); }
  /* a live product frame that loads only when it comes near the screen */
  function lazy(html) { return html.replace(' src="', ' data-src="'); }
  function initial(name) { return esc(String(name || "?").trim().charAt(0)); }

  function msgHtml(m, i) {
    var mem = S.memberById(m.mid);
    return '<div class="stm" data-i="' + i + '" data-ch="' + m.ch + '"><div class="stm-in"><div class="stm-card"><span class="stm-av">' + initial(S.N(mem)) + '</span><div class="stm-b"><div class="stm-top"><b>' + esc(S.N(mem)) + "</b><time>" + m.t + "</time></div><p>" + esc(L(m.he, m.en)) + '</p><span class="stm-done">' + ic("check", 14) + L("נענה במערכת", "Answered by the system") + "</span></div></div></div></div>";
  }
  function phoneHtml() {
    return '<div class="stp" id="stp" aria-label="' + L("הטלפון של הגבאי", "The gabbai's phone") + '"><div class="stp-screen"><div class="stp-status"><span>' + L("מוצאי שבת", "Motzei Shabbat") + '</span><span class="stp-bars"><i></i><i></i><i></i></span></div>' +
      '<div class="stp-clock" id="stClock">23:40</div><div class="stp-date">' + esc(L("מוצאי שבת פרשת " + S.PARASHA.he, "Motzei Shabbat, Parashat " + S.PARASHA.en)) + "</div>" +
      '<div class="stp-count"><span id="stBadge">0</span> ' + L("הודעות שלא נענו", "unanswered messages") + "</div>" +
      '<div class="stp-list" id="stList">' + MSGS.map(function (m, i) { return { m: m, i: i }; }).sort(function (a, b) { return a.m.t < b.m.t ? 1 : a.m.t > b.m.t ? -1 : b.i - a.i; }).map(function (x) { return msgHtml(x.m, x.i); }).join("") + "</div>" +
      '<div class="stp-empty">' + MOON + "<b>" + L("אין הודעות חדשות", "No new messages") + "</b><span>" + L("לילה טוב", "Good night") + "</span></div></div></div>";
  }
  function bubbles(ch) {
    return '<div class="stc-q">' + MSGS.filter(function (m) { return m.ch === ch; }).map(function (m) { var mem = S.memberById(m.mid); return '<div class="stc-bub"><span class="stm-av sm">' + initial(S.N(mem)) + "</span><div><b>" + esc(S.N(mem)) + "</b><p>" + esc(L(m.he, m.en)) + "</p></div></div>"; }).join("") + "</div>";
  }
  function visual(c) {
    if (c.vis === "times") {
      var p = mincha();
      return '<div class="stv-times"><div class="stv-ed"><span class="stv-k">' + ic("clock", 15) + L("נסה בעצמך: עורך זמני התפילה", "Try it: the davening times editor") + '</span><div class="stv-row"><div><b>' + esc(S.N(p)) + "</b><small>" + L("ימי חול", "Weekdays") + '</small></div><div class="stv-ctl"><button type="button" class="stv-b" data-mn="-5" aria-label="' + L("5 דקות מוקדם יותר", "5 minutes earlier") + '">−5</button><output id="mnT" class="num">' + t12(window.SHUL_TV.prayerTime(p)) + '</output><button type="button" class="stv-b" data-mn="5" aria-label="' + L("5 דקות מאוחר יותר", "5 minutes later") + '">+5</button></div></div><p class="stv-note" id="mnNote" aria-live="polite">' + L("שנה את השעה וראה את המסך מתעדכן.", "Change the time and watch the screen update.") + "</p></div>" +
        '<div class="stv-tv"><span class="stv-k">' + ic("tv", 15) + L("המסך באולם, עכשיו", "The shul screen, right now") + "</span>" + X.tvset(lazy(X.frame("#/tv?preview=1&clock=1:720", 1920, 1080, "", L("המסך", "Screen")))) + "</div></div>";
    }
    if (c.vis === "member") {
      var mem = S.memberById("m1");
      return '<div class="stv-phone"><span class="stv-k">' + ic("phone", 15) + L("הטלפון של ", "The phone of ") + esc(S.N(mem)) + "</span>" + X.phone(lazy(X.frame("#/me?frame=1&as=member", 400, 860, "", L("חשבון המתפלל", "Member account")))) + "</div>";
    }
    var url = "admin." + X.slug() + ".org";
    return '<div class="stv-win">' + X.browser(url, lazy(X.frame(c.vis + (c.vis.indexOf("?") > 0 ? "&" : "?") + "frame=1&as=" + c.role, 1360, 860, "", L(c.tag[0], c.tag[1])))) + "</div>";
  }
  function chapterHtml(c, i) {
    return '<section class="stc" data-ch="' + i + '" id="stc' + i + '"><div class="stc-tag"><span class="stc-ic">' + ic(c.ic, 18) + "</span>" + L(c.tag[0], c.tag[1]) + '<span class="stc-n">' + (i + 1) + "/" + CH.length + "</span></div>" + bubbles(i) +
      "<h2>" + L(c.h[0], c.h[1]) + "</h2><p>" + L(c.p[0], c.p[1]) + "</p>" + visual(c) +
      '<a class="xp-btn ghost stc-go" href="' + c.dest + '" data-go-role="' + c.role + '">' + L(c.go[0], c.go[1]) + ARROW + "</a></section>";
  }

  UI.route("/", {
    layout: "xp", live: false, title: function () { return L("מוצאי שבת, 23:40", "Motzei Shabbat, 23:40"); },
    render: function (app) {
      if (cleanup) cleanup();
      var sh = tomorrowShacharit(), mn = mincha();
      app.innerHTML = '<div class="st-pill" id="stPill" aria-hidden="true">' + ic("phone", 15) + '<span><b id="stPillN">0</b> ' + L("הודעות שלא נענו", "unanswered") + "</span></div>" +
        '<div class="xp st" id="stTop">' +
        '<header class="xp-nav"><div class="xp-wrap"><a class="xp-mark" href="#/"><span class="xp-logo">' + UI.logo() + '</span><span>Shul System</span></a><span class="xp-sp"></span>' +
        '<a class="st-navlink" href="#/tour">' + L("סיור מלא במערכת", "Full platform tour") + '</a><div class="xp-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button data-xl="he" aria-pressed="' + (S.prefs.lang === "he") + '">עב</button><button data-xl="en" aria-pressed="' + (S.prefs.lang === "en") + '">EN</button></div>' + UI.ctaDemo("xp-cta") + "</div></header>" +
        '<div class="st-sky" aria-hidden="true"></div>' +
        '<div class="xp-wrap st-stage"><div class="st-flow">' +
        '<section class="st-hero"><div class="st-eyebrow"><span></span>' + esc(L("מוצאי שבת פרשת " + S.PARASHA.he + " · 23:40", "Motzei Shabbat, Parashat " + S.PARASHA.en + " · 23:40")) + "</div>" +
        "<h1>" + L("מכיר את זה?", "Sound familiar?") + "</h1>" +
        '<p class="st-lead">' + L("כולם כבר בבית. הקידוש נגמר, הכיסאות סודרו, ורק אצל הגבאי הטלפון מתחיל לרטוט.", "Everyone is home. Kiddush is over, the chairs are stacked, and only the gabbai's phone is starting to buzz.") + "</p>" +
        '<p class="st-lead2">' + L("בוא נראה מה קורה לכל אחת מההודעות האלה, כשבית הכנסת עובד עם מערכת אחת.", "Let's see what happens to each of these messages when the shul runs on one system.") + "</p>" +
        '<div class="st-ctas"><button type="button" class="xp-btn lg" id="stStart">' + L("תן למערכת לענות", "Let the system answer") + ARROW + '</button><a class="xp-btn lg ghost" href="#/tour">' + L("לסיור המלא", "Full tour") + "</a></div>" +
        '<p class="st-scroll" aria-hidden="true">' + L("גלול, וההודעות ייענו אחת אחת", "Scroll, and the messages get answered one by one") + '<i></i></p></section>' +
        CH.map(chapterHtml).join("") +
        '<section class="st-quiet" id="stQuiet"><div class="stq-moon">' + MOON + "</div><h2>" + L("אין הודעות חדשות.", "No new messages.") + "</h2><p>" + L("השעה 23:52. אפשר ללכת לישון.", "It's 23:52. You can go to sleep.") + '</p><div class="stq-tom"><span>' + L("מחר, כפי שמופיע במסך", "Tomorrow, as on the screen") + "</span><b>" + (sh ? esc(S.N(sh)) + ' <bdi class="num">' + t12(sh.time) + "</bdi>" : "") + (mn ? " · " + esc(S.N(mn)) + ' <bdi class="num" id="stqMn">' + t12(window.SHUL_TV.prayerTime(mn)) + "</bdi>" : "") + "</b></div></section>" +
        "</div>" +
        '<aside class="st-side">' + phoneHtml() + "</aside></div>" +
        /* it is already yours */
        '<section class="st-own paper"><div class="xp-wrap st-own-grid"><div><span class="xp-k">' + L("עכשיו זה שלך", "Now it's yours") + "</span><h2>" + L("איך קוראים לבית הכנסת שלך?", "What's your shul called?") + "</h2><p>" + L("הקלד את השם, והמסך באולם מציג אותו. אותו שם מופיע גם באתר, בחשבונות המתפללים ובדף השבת.", "Type the name and the shul screen shows it. The same name appears on the website, in the member accounts and on the Shabbat bulletin.") + "</p>" +
        '<label class="st-name"><span>' + L("שם בית הכנסת", "Shul name") + '</span><input id="stName" maxlength="48" autocomplete="off" placeholder="' + L("לדוגמה: קהילת בית שלום", "e.g. Congregation Beth Shalom") + '" value="' + (S.db.shul.en !== window.SHUL_SEED().shul.en ? esc(S.N(S.db.shul)) : "") + '"></label>' +
        '<p class="st-own-note">' + L("רוצה לראות גם עיצוב אחר? ", "Want to see another design too? ") + '<a href="#/showcase/design">' + L("לסטודיו העיצוב", "Open the design studio") + "</a></p></div>" +
        '<div class="st-own-tv">' + X.tvset(lazy(X.frame("#/tv?preview=1&clock=1:720", 1920, 1080, "", L("המסך", "Screen")))) + "</div></div></section>" +
        /* the gabbai's buts */
        '<section class="st-buts paper"><div class="xp-wrap"><span class="xp-k">' + L("אבל...", "But...") + "</span><h2>" + L("השאלות שכל גבאי שואל.", "The questions every gabbai asks.") + '</h2><div class="stb-grid">' +
        BUTS.map(function (b) { return '<a class="stb" href="' + b.href + '"' + (b.role ? ' data-go-role="' + b.role + '"' : "") + "><h3>" + L(b.q[0], b.q[1]) + "</h3><p>" + L(b.a[0], b.a[1]) + '</p><span class="stb-go">' + L(b.l[0], b.l[1]) + ARROW + "</span></a>"; }).join("") + "</div></div></section>" +
        /* the close */
        '<section class="st-final"><div class="xp-wrap"><h2>' + L("גם לגבאי מגיע<br><em>להתפלל בשקט.</em>", "The gabbai deserves<br><em>to daven in peace, too.</em>") + "</h2><p>" + L("נכין לבית הכנסת שלך הדגמה אישית והצעה למנוי חודשי, לפי הצרכים של הקהילה.", "We'll prepare a personal demonstration for your shul and a monthly subscription proposal, based on your community's needs.") + "</p>" +
        '<div class="st-ctas center"><a class="cta-demo lg" href="#/proposal">' + I.sparkle.replace("<svg", '<svg width="18" height="18"') + "<span>" + L("אני רוצה מוצאי שבת שקט", "I want a quiet Motzei Shabbat") + "</span></a>" + X.telBtn("lg ghost") + '</div><p class="st-mail">' + L("או כתבו אל ", "Or email ") + '<a href="mailto:' + SALES.email + '"><bdi dir="ltr">' + esc(SALES.email) + "</bdi></a> · <a href=\"#/tour\">" + L("לסיור המלא במערכת", "Take the full platform tour") + "</a></p></div></section>" +
        '<footer class="xp-foot"><div class="xp-wrap"><span>Shul System</span><span>' + L("הדגמה עם נתונים בדויים. ההודעות, השמות והסכומים בדויים. אין תשלומים, אימיילים או התראות אמיתיים.", "Demo with fictional data. The messages, names and amounts are invented. No real payments, emails or notifications.") + "</span></div></footer></div>";

      /* nav */
      app.querySelectorAll("[data-xl]").forEach(function (b) { b.addEventListener("click", function () { UI.setLang(b.getAttribute("data-xl")); }); });
      app.querySelectorAll("[data-go-role]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); X.go(a.getAttribute("data-go-role"), a.getAttribute("href")); }); });
      app.querySelector("#stStart").addEventListener("click", function () { arriveAll(); var c = app.querySelector("#stc0"); c.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); });

      /* lazy frames */
      var frames = app.querySelectorAll("iframe[data-src]");
      function load(f) { if (f.getAttribute("data-src")) { f.src = f.getAttribute("data-src"); f.removeAttribute("data-src"); } }
      var lio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting) return; var f = en.target.querySelector("iframe[data-src]"); if (f) load(f); lio.unobserve(en.target); }); }, { rootMargin: "900px 0px" }) : null;
      frames.forEach(function (f) { if (lio) lio.observe(f.closest(".sf")); else load(f); });
      X.fitFrames(app);

      /* the phone: messages arrive, then get answered as the story scrolls */
      var list = app.querySelector("#stList"), stp = app.querySelector("#stp"), badge = app.querySelector("#stBadge"), pillN = app.querySelector("#stPillN"), clock = app.querySelector("#stClock");
      var items = Array.prototype.slice.call(list.querySelectorAll(".stm"));
      var arrived = 0, timers = [], doneCh = -1;
      var order = items.slice().sort(function (a, b) { return MSGS[+a.getAttribute("data-i")].t < MSGS[+b.getAttribute("data-i")].t ? -1 : MSGS[+a.getAttribute("data-i")].t > MSGS[+b.getAttribute("data-i")].t ? 1 : +a.getAttribute("data-i") - +b.getAttribute("data-i"); });
      function count() {
        var n = items.filter(function (el) { return el.classList.contains("in") && !el.classList.contains("done"); }).length;
        badge.textContent = n; pillN.textContent = n;
        stp.classList.toggle("clear", arrived >= items.length && n === 0);
      }
      function arriveOne() {
        if (arrived >= order.length) return;
        order[arrived].classList.add("in"); arrived += 1;
        if (!reduce) { stp.classList.remove("buzz"); void stp.offsetWidth; stp.classList.add("buzz"); }
        count();
      }
      function arriveAll() { timers.forEach(clearTimeout); timers = []; while (arrived < order.length) { order[arrived].classList.add("in"); arrived += 1; } count(); update(); }
      if (reduce) arriveAll();
      else order.forEach(function (x, k) { timers.push(setTimeout(function () { arriveOne(); if (arrived === order.length) update(); }, 700 + k * 420)); });

      var chs = Array.prototype.slice.call(app.querySelectorAll(".stc")), quiet = app.querySelector("#stQuiet"), pill = app.querySelector("#stPill"), raf = 0;
      function update() {
        raf = 0;
        var vh = window.innerHeight, passed = -1, focus = -1;
        chs.forEach(function (c, i) { var r = c.getBoundingClientRect(); if (r.top < vh * 0.5) passed = i; if (r.top < vh * 0.92 && r.bottom > vh * 0.3) focus = i; c.classList.toggle("on", r.top < vh * 0.75 && r.bottom > vh * 0.25); });
        if (passed >= 0 && arrived < order.length) arriveAll();
        if (passed !== doneCh) {
          doneCh = passed;
          items.forEach(function (el) { var ch = +el.getAttribute("data-ch"); el.classList.toggle("done", ch <= passed); });
          var m = 40 + Math.round(12 * (passed + 1) / CH.length);
          clock.textContent = "23:" + String(m).padStart(2, "0");
          count();
        }
        items.forEach(function (el) { el.classList.toggle("focus", +el.getAttribute("data-ch") === focus && focus > passed); });
        var pr = stp.getBoundingClientRect(), qr = quiet.getBoundingClientRect();
        pill.classList.toggle("show", pr.bottom < 90 && qr.top > vh * 0.6);
      }
      function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();

      /* chapter 1: change Mincha, watch the screen */
      var mnT = app.querySelector("#mnT"), mnNote = app.querySelector("#mnNote");
      app.querySelectorAll("[data-mn]").forEach(function (b) {
        b.addEventListener("click", function () {
          var p = mincha(), t = window.SHUL_TV.prayerTime(p) + +b.getAttribute("data-mn");
          if (t < 12 * 60 || t > 20 * 60) return;
          p.time = t; delete p.rel;
          S.log("times", "עדכן זמן תפילה: " + p.he + " " + S.hm(t, false), "Updated davening time: " + p.en + " " + S.hm(t, false));
          S.save();
          mnT.textContent = t12(t); var q = app.querySelector("#stqMn"); if (q) q.textContent = t12(t);
          mnNote.innerHTML = ic("check", 15) + " " + L("נשמר. המסך כבר מציג ", "Saved. The screen already shows ") + esc(S.N(p)) + " " + t12(t) + L(".", ".");
          mnNote.classList.add("ok"); UI.flash(mnT);
        });
      });

      /* the name, live on the screen */
      var inp = app.querySelector("#stName"), nt = null, sample = window.SHUL_SEED().shul;
      inp.addEventListener("input", function () { clearTimeout(nt); nt = setTimeout(function () { var v = inp.value.trim(); S.db.shul.he = v || sample.he; S.db.shul.en = v || sample.en; S.save(); app.querySelectorAll(".win-bar span").forEach(function (x) { x.textContent = "admin." + X.slug() + ".org"; }); }, 260); });

      /* clean up when leaving the page, or before this page draws again */
      function stop() { timers.forEach(clearTimeout); clearTimeout(nt); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); window.removeEventListener("hashchange", onHash); if (lio) lio.disconnect(); cleanup = null; }
      function onHash() { var h = (location.hash || "#/").split("?")[0]; if (h !== "#/" && h !== "#" && h !== "") stop(); }
      window.addEventListener("hashchange", onHash);
      cleanup = stop;
    }
  });
})();
