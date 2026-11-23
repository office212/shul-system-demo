/* Shul System sales demo | #/ "the board at the entrance".
   The cork board every gabbai knows: handwritten times, a sticky note about a debt, a crumpled
   nedarim page, last week's Shabbat times. Each note, torn off the board, shows where it lives
   in the system, in the live product. When the board is empty, the shul screen lights up on
   the same wall. Every answer is a capability of the real system (FEATURE-MAP.md); the notes,
   names and amounts are fictional, taken from the demo data. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, X = window.SHUL_XP, L = S.L, esc = S.esc;
  var SALES = UI.SALES;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cleanup = null;

  function mincha() { return S.db.prayers.filter(function (p) { return p.id === "p3"; })[0] || S.db.prayers.filter(function (p) { return p.group === "weekday" && /mincha/i.test(p.en); })[0]; }
  function t12(min) { return S.hm(min, S.prefs.lang === "en"); }
  function mem(id) { return S.N(S.memberById(id)); }
  function first(id) { var n = mem(id).split(" "); return n[0] + " " + (n[1] ? n[1].charAt(0) + "." : ""); }

  /* ---------- the notes ---------- */
  function notes() {
    var mn = mincha(), now = t12(window.SHUL_TV.prayerTime(mn)), old = t12(window.SHUL_TV.prayerTime(mn) - 10);
    return [
      { id: "times", cls: "lined", pin: "red", pos: [2, 5, 228, -3],
        html: "<b class='hw-t'>" + L("מנחה מחר!!", "Mincha tomorrow!!") + "</b><p><s>" + old + "</s> <span class='red'>" + now + "</span></p><p>" + L("לתקן גם בלוח בכניסה", "fix the board at the door too") + "</p><p class='sm'>" + L("+ מעריב שני כרגיל?", "+ late Maariv as usual?") + "</p>",
        h: ["משנים פעם אחת. המסך באולם כבר יודע.", "Change it once. The screen in the shul already knows."],
        p: ["גבאי התוכן מעדכן זמן תפילה, והמסך באולם מציג אותו תוך שנייה, בלי לרענן. אין לוח לתקן, ואין פתק שנשכח על הקיר.", "The content gabbai updates a davening time and the screen in the shul shows it within a second, no refresh. No board to fix, no note forgotten on the wall."],
        vis: "times", role: "content", dest: "#/gabbai/tv", go: ["לעורך זמני התפילה", "Open the times editor"] },
      { id: "debt", cls: "sticky", pos: [22, 9, 172, 4],
        html: "<p>" + L("להזכיר ל", "remind ") + esc(first("m1")) + "</p><p>" + L("עדיין חייב", "still owes") + " <b class='red'>$360</b></p><p class='sm'>" + L("(בלי להביך אותו...)", "(without embarrassing him...)") + "</p>",
        h: ["לא צריך להזכיר. הוא רואה לבד.", "No reminding needed. He sees it himself."],
        p: ["כל מתפלל רואה בחשבון האישי שלו את היתרה, את כל החיובים והתשלומים, ודף חשבון. הוא משלם את היתרה בכרטיס, התשלום נרשם מעצמו, והיתרה מתעדכנת מיד גם אצל גבאי הכספים.", "Every member sees their balance, every charge and payment, and a statement in their own account. They pay the balance by card, it records itself, and the balance updates at once for the finance gabbai too."],
        vis: "member", role: "member", dest: "#/me", go: ["לחשבון המתפלל", "Open the member account"] },
      { id: "nedarim", cls: "crumpled", tape: 1, pos: [39, 3, 236, -1.5],
        html: "<b class='hw-t'>" + L("נדרים · " + S.PARASHA.he, "Nedarim · " + S.PARASHA.en) + "</b><table><tr><td>" + L("כהן", "Kohen") + "</td><td>" + esc(first("m6")) + "</td><td>36</td></tr><tr><td>" + L("לוי", "Levi") + "</td><td>" + esc(first("m3")) + "</td><td><s>52</s> 72?</td></tr><tr><td>" + L("שלישי", "Shlishi") + "</td><td>" + esc(first("m2")) + "</td><td>18</td></tr><tr><td>" + L("מפטיר", "Maftir") + "</td><td>???</td><td></td></tr></table>",
        h: ["מוצאי שבת: טבלה אחת, שמירה אחת.", "Motzei Shabbat: one table, one save."],
        p: ["כל העליות של השבת בטבלה אחת. כל נדר נרשם כחיוב בכרטיס המתפלל, והוא רואה אותו בחשבון שלו. אין סימני שאלה, ואין דף מקומט.", "Every aliyah of Shabbat in one table. Each neder becomes a charge on the member's card, and the member sees it in their account. No question marks, no crumpled page."],
        vis: "#/finance/nedarim", role: "finance", dest: "#/finance/nedarim", go: ["לנדרי השבת", "Open Shabbat nedarim"] },
      { id: "yahrzeit", cls: "card", pin: "blue", pos: [60, 7, 196, 3],
        html: "<b class='hw-t'>" + L("יארצייט", "Yahrzeit") + "</b><p>" + L("דבורה בת מנחם", "Devorah bat Menachem") + "</p><p>" + L("כ׳ כסלו", "20 Kislev") + "</p><p class='sm'>" + L("ביקש: ", "asked by: ") + esc(first("m7")) + "</p><p class='red'>" + L("לא לשכוח!!!", "don't forget!!!") + "</p>",
        h: ["המשפחה מבקשת. אתה מאשר. המסך זוכר כל שנה.", "The family asks. You approve. The screen remembers every year."],
        p: ["המתפלל מוסיף את היארצייט מהחשבון שלו, גם אם יש לו רק תאריך לועזי. אצלך זה מופיע כבקשה ממתינה, ואחרי אישור היארצייט מוצג במסך בשבוע שלו, כל שנה.", "The member adds the yahrzeit from their account, even with only the English date. It reaches you as a pending request, and once approved it shows on the screen in its week, every year."],
        vis: "#/gabbai/content?type=yahrzeit", role: "content", dest: "#/gabbai/content?type=yahrzeit", go: ["לבקשות היארצייט", "Open yahrzeit requests"] },
      { id: "wanted", cls: "wanted", pin: "green", pos: [79, 2, 196, -2],
        html: "<b class='poster'>" + L("דרוש גבאי", "Gabbai wanted") + "</b><p>" + L("התנדבות.", "Volunteer.") + "</p><p>" + L("24 שעות, 7 ימים.", "24 hours, 7 days.") + "</p><p>" + L("כולל מוצאי שבת.", "Motzei Shabbat included.") + "</p><p class='sm'>" + L("פרטים אצל הגבאי הקודם", "ask the previous gabbai") + "</p>",
        h: ["התפקיד עובר. הידע נשאר.", "The role moves on. The knowledge stays."],
        p: ["כל גבאי מקבל הרשאה לפי התפקיד שלו: כספים, תוכן וזמנים, או מנהל ראשי. כשמחליפים גבאי נותנים הרשאה לבא אחריו, וכל ההיסטוריה, היתרות והיארצייטים נשארים במקום. כל פעולה נרשמת ביומן הפעילות.", "Each gabbai gets access by role: finance, content and times, or administrator. When the gabbai changes, give the next one access, and all the history, balances and yahrzeits stay where they are. Every action is in the activity log."],
        vis: "#/admin", role: "super", dest: "#/admin", go: ["לגבאים והרשאות", "Open gabbaim and permissions"] },
      { id: "mazal", cls: "pink", pin: "yellow", pos: [3, 54, 206, 2.5],
        html: "<b class='poster'>" + L("מזל טוב!", "Mazal Tov!") + "</b><p>" + L("למשפחת ברנר", "to the Brenner family") + "</p><p>" + L("להולדת הנכד", "on the birth of a grandson") + "</p><p class='sm'>" + L("(אפשר גם על המסך?)", "(on the screen too?)") + "</p>",
        h: ["מזל טוב, ישר למסך.", "Mazal Tov, straight to the screen."],
        p: ["הודעות, מזל טוב, פליירים והקדשות מתפרסמים למסך עם תאריכים וימים, ורואים תצוגה מקדימה לפני הפרסום. בשבת המסך מציג רק את מה שמתאים לשבת.", "Announcements, Mazal Tov, flyers and dedications go to the screen with dates and days, with a preview before publishing. On Shabbat the screen shows only what suits Shabbat."],
        vis: "#/gabbai/content", role: "content", dest: "#/gabbai/content", go: ["לתוכן המסך", "Open screen content"] },
      { id: "sheet", cls: "copy", tape: 1, pos: [21, 50, 204, -4],
        html: "<b class='print'>" + L("זמני השבת", "Shabbat times") + "</b><p class='print sm'>" + L("פרשת תולדות", "Parashat Toldot") + "</p><div class='rows'><span>" + L("הדלקת נרות", "Candles") + "</span><span>4:13</span><span>" + L("שחרית", "Shacharit") + "</span><span>8:45</span><span>" + L("מנחה", "Mincha") + "</span><span>4:00</span></div><p class='red scrawl'>" + L("של שבוע שעבר!!", "last week's!!") + "</p>",
        h: ["דף השבת נבנה לבד. אף פעם לא של שבוע שעבר.", "The Shabbat bulletin builds itself. Never last week's."],
        p: ["דף השבת נבנה מזמני היום ומזמני התפילה של השבוע, מוכן להדפסה, ואפשר להציג אותו גם במסך באולם.", "The Shabbat bulletin builds itself from this week's zmanim and davening times, ready to print, and it can show on the shul screen too."],
        vis: "#/gabbai/shabbat", role: "content", dest: "#/gabbai/shabbat", go: ["לדף השבת", "Open the Shabbat bulletin"] },
      { id: "receipt", cls: "receipt", pin: "red", pos: [41, 57, 214, 1.5],
        html: "<div class='rc-h print'><span>" + L("קבלה", "Receipt") + "</span><span>№ 0412</span></div><p><span class='print sm'>" + L("התקבל מאת:", "Received from:") + "</span> " + esc(first("m16")) + "</p><p><span class='print sm'>" + L("סך:", "Amount:") + "</span> ______</p><p class='sm blue'>" + L("צריך מכתב לרו״ח...", "needs a letter for his accountant...") + "</p>",
        h: ["מכתב מס לכל מתפלל, בלי פנקס קבלות.", "A tax letter for every member, no receipt book."],
        p: ["מכתבי מס שנתיים לכל מתפלל, דוח שנתי לפי אמצעי תשלום, וחיובים קבועים כמו דמי חבר.", "Annual tax letters for every member, an annual report by payment method, and recurring charges such as membership."],
        vis: "#/finance/more", role: "finance", dest: "#/finance/more", go: ["למכתבי המס", "Open tax letters"] },
      { id: "envelope", cls: "envelope", tape: 1, pos: [59, 52, 214, -2.5],
        html: "<b class='hw-t'>" + L("צ׳קים להפקדה", "Checks to deposit") + "</b><p>" + L("+ ", "+ ") + esc(first("m8")) + L(" אמר ששילם", " says he paid") + "</p><p>" + L("בכרטיס דרך האתר", "by card on the website") + "</p><p class='red'>" + L("לבדוק!?", "check!?") + "</p>",
        h: ["התשלום כבר מחכה לך, מותאם למתפלל.", "The payment is already waiting, matched to the member."],
        p: ["תשלומים ותרומות בכרטיס מהאתר מגיעים לתיבה אחת ומותאמים למתפלל לפי האימייל. לחיצה אחת, והם רשומים בכרטיס שלו.", "Card payments and donations from the website arrive in one inbox, matched to the member by email. One tap and they are recorded on the member's card."],
        vis: "#/finance/inbox", role: "finance", dest: "#/finance/inbox", go: ["לתיבת התשלומים", "Open the payments inbox"] },
      { id: "members", cls: "scrap", pin: "blue", pos: [79, 56, 190, 3.5],
        html: "<b class='hw-t'>" + L("חדשים בבית הכנסת", "New at the shul") + "</b><p>" + L("משפחת ברון", "the Baron family") + "</p><p>" + L("לרשום ברשימה", "add to the list") + "</p><p class='sm'>" + L("טלפון? אימייל? ???", "phone? email? ???") + "</p>",
        h: ["משפחות חדשות נרשמות לבד.", "New families sign themselves up."],
        p: ["משפחה חדשה נרשמת באתר ושולחת בקשת הצטרפות. אתה מאשר בלחיצה ובוחר תפקיד, והיא מקבלת אימייל ברוכים הבאים וחשבון משלה.", "A new family signs up on the website and sends a join request. You approve with one tap and choose a role, and they get a welcome email and their own account."],
        vis: "#/finance/members", role: "super", dest: "#/finance/members", go: ["לבקשות ההצטרפות", "Open join requests"] }
    ];
  }

  var QA = [
    [["אני לא איש של מחשבים. זה בשבילי?", "I'm not a computer person. Is this for me?"], ["כל גבאי רואה רק את מה ששייך לתפקיד שלו. גבאי כספים רואה את הכספים, גבאי תוכן רואה את המסך והזמנים, ושום דבר אחר לא מפריע. בעברית ובאנגלית.", "Each gabbai sees only what belongs to their role. The finance gabbai sees the finances, the content gabbai sees the screen and times, and nothing else is in the way. In Hebrew and English."], "#/showcase/roles", null],
    [["מי יכניס את כל המתפללים?", "Who will enter all the members?"], ["המתפללים נרשמים בעצמם באתר ושולחים בקשת הצטרפות. הגבאי מאשר בלחיצה ובוחר תפקיד.", "Members sign up on the website and send a join request. The gabbai approves with one tap and chooses a role."], "#/finance/members", "super"],
    [["ומה אם משהו יימחק בטעות?", "And if something is deleted by mistake?"], ["רישום שמבטלים נשאר ביומן כתיקון ולא נמחק. כל פעולה נרשמת ביומן הפעילות, ויש גיבוי מלא כל לילה.", "A cancelled entry stays in the ledger as a correction and is never erased. Every action is in the activity log, and there is a full backup every night."], "#/gabbai/activity", "super"],
    [["הוועד ירצה לראות מספרים.", "The board will want numbers."], ["רשימת מי חייב, מהיתרה הגדולה לקטנה, ודוח הכנסות שנתי לפי אמצעי תשלום.", "Who owes, from the largest balance down, and an annual income report by payment method."], "#/finance/owes", "finance"],
    [["ובשבת?", "And on Shabbat?"], ["המסך עובר לבד למצב שבת: הדלקת נרות, הקדשות, הזכרות ויארצייטים. הודעות של ימי חול לא מוצגות, ורענון מרחוק לא פועל בשבת.", "The screen switches to Shabbat mode on its own: candle lighting, dedications, hazkarot and yahrzeits. Weekday announcements step aside, and remote refresh does not run on Shabbat."], "#/screen", null]
  ];

  function noteHtml(n) {
    var p = n.pos;
    return '<button type="button" class="nt nt-' + n.cls + (n.id === "times" ? " hint" : "") + '" data-hint="' + esc(L("התחילו כאן ↑", "Start here ↑")) + '" data-note="' + n.id + '" style="--x:' + p[0] + "%;--y:" + p[1] + "%;--w:" + p[2] + "px;--r:" + p[3] + 'deg" aria-label="' + esc(L(n.h[0], n.h[1])) + '"><span class="nt-in">' + n.html + "</span>" +
      (n.pin ? '<i class="pin pin-' + n.pin + '" aria-hidden="true"></i>' : "") + (n.tape ? '<i class="tape" aria-hidden="true"></i>' : "") + "</button>";
  }
  function visual(n) {
    if (n.vis === "times") {
      var p = mincha();
      return '<div class="dv-times"><div class="dv-ed"><div class="dv-row"><div><b>' + esc(S.N(p)) + "</b><small>" + L("ימי חול", "Weekdays") + '</small></div><div class="dv-ctl"><button type="button" data-mn="-5" aria-label="' + L("5 דקות מוקדם יותר", "5 minutes earlier") + '">−5</button><output id="mnT">' + t12(window.SHUL_TV.prayerTime(p)) + '</output><button type="button" data-mn="5" aria-label="' + L("5 דקות מאוחר יותר", "5 minutes later") + '">+5</button></div></div><p class="dv-note" id="mnNote" aria-live="polite">' + L("נסה: שנה את השעה, והמסך שלידך מתעדכן.", "Try it: change the time and the screen beside it updates.") + "</p></div>" +
        '<div class="dv-tv">' + X.tvset(X.frame("#/tv?preview=1&clock=1:720", 1920, 1080, "", L("המסך", "Screen"))) + "</div></div>";
    }
    if (n.vis === "member") return '<div class="dv-phone">' + X.phone(X.frame("#/me?frame=1&as=member", 400, 860, "", L("חשבון המתפלל", "Member account"))) + "</div>";
    return '<div class="dv-win">' + X.browser("admin." + X.slug() + ".org", X.frame(n.vis + (n.vis.indexOf("?") > 0 ? "&" : "?") + "frame=1&as=" + n.role, 1360, 860, "", L(n.h[0], n.h[1]))) + "</div>";
  }

  UI.route("/", {
    layout: "xp", live: false, title: function () { return L("הלוח בכניסה", "The board at the door"); },
    render: function (app) {
      if (cleanup) cleanup();
      document.body.classList.add("pg-board");
      var NOTES = notes(), left = NOTES.length, timers = [];
      var sample = window.SHUL_SEED().shul, custom = S.db.shul.en !== sample.en;

      app.innerHTML = '<div class="bd">' +
        '<header class="bd-top"><a class="bd-mark" href="#/">' + UI.logo() + "<span>Shul System</span></a><nav><a href=\"#/tour\">" + L("סיור במערכת", "Platform tour") + '</a><span class="bd-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button data-xl="he" aria-pressed="' + (S.prefs.lang === "he") + '">עב</button><button data-xl="en" aria-pressed="' + (S.prefs.lang === "en") + '">EN</button></span><a class="bd-cta" href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + "</a></nav></header>" +
        '<section class="bd-wall" id="bdWall"><div class="bd-head"><p class="bd-what">' + L("Shul System · מערכת לניהול בית הכנסת", "Shul System · software for running a shul") + "</p><h1>" + L("כל גבאי מכיר<br>את הלוח הזה.", "Every shul has<br>this board.") + '</h1><p class="bd-lead">' + L("כל פתק על הלוח הוא עבודה שהגבאי עושה היום ביד: זמנים, חובות, נדרים, יארצייטים.", "Every note on this board is work the gabbai does by hand today: times, debts, nedarim, yahrzeits.") + '</p><p class="bd-hand bd-do">' + L("לחצו על פתק, ותראו איך המערכת עושה את זה במקומכם", "Click a note to see how the system does it for you") + ' <span aria-hidden="true">↓</span></p></div>' +
        '<div class="bd-scene" id="bdScene"><div class="bd-frame" id="bdFrame"><div class="bd-cork" id="bdCork">' +
          '<span class="bd-deco d-scrap" aria-hidden="true"><i class="pin pin-yellow"></i></span><span class="bd-deco d-card" aria-hidden="true"><b>' + L("הובלות כהן", "Cohen Movers") + '</b><span>' + L("הובלות קטנות וגדולות", "Small and large moves") + '</span><bdi dir="ltr">(555) 0147-2210</bdi></span>' +
          NOTES.map(noteHtml).join("") + "</div></div>" +
        '<div class="bd-tvwall" id="bdTv" hidden><div class="bd-tvset">' + X.tvset(X.frame("#/tv?preview=1&clock=1:720", 1920, 1080, "", L("המסך", "Screen")).replace(' src="', ' data-src="')) + '</div><div class="bd-tvnote"><i class="pin pin-red"></i>' + L("הלוח החדש.<br>מתעדכן לבד.", "The new board.<br>Updates itself.") + "</div></div></div>" +
        '<div class="bd-under"><p class="bd-count" id="bdCount" aria-live="polite"></p><button type="button" class="bd-all" id="bdAll">' + L("אין לי זמן. תוריד הכל.", "No time. Take them all down.") + '</button><button type="button" class="bd-all" id="bdBack" hidden>' + L("להחזיר את הפתקים ללוח", "Put the notes back") + "</button></div>" +
        '<div class="bd-plaque-wrap" id="bdPlaque" hidden><label class="bd-plaque"><span>' + L("בית הכנסת", "Congregation") + '</span><input id="bdName" maxlength="40" autocomplete="off" placeholder="' + L("הקלד את השם של בית הכנסת שלך", "Type your shul's name") + '" value="' + (custom ? esc(S.N(S.db.shul)) : "") + '"></label><p class="bd-hand sm">' + L("השם מופיע במסך, באתר, בחשבונות המתפללים ובדף השבת.", "The name appears on the screen, the website, the member accounts and the Shabbat bulletin.") + "</p></div></section>" +
        /* questions and answers, as a weekly sheet */
        '<section class="bd-sheet"><div class="sh-paper"><header class="sh-head"><span>' + L("גיליון לגבאים", "A sheet for gabbaim") + '</span><h2>' + L("שו״ת הגבאי", "The Gabbai's Q&amp;A") + "</h2><span>" + L("שאלות שגבאים שואלים, ותשובות מתוך המערכת", "Questions gabbaim ask, answered from the system") + '</span></header><div class="sh-cols">' +
        QA.map(function (q, i) { return '<article class="sh-q"><h3><span>' + L("שאלה", "Q") + "</span> " + L(q[0][0], q[0][1]) + "</h3><p><span>" + L("תשובה", "A") + "</span> " + L(q[1][0], q[1][1]) + ' <a href="' + q[2] + '"' + (q[3] ? ' data-go-role="' + q[3] + '"' : "") + ">" + L("לראות במערכת", "See it in the system") + "</a></p></article>"; }).join("") +
        "</div></div></section>" +
        /* the design is a layer: any look, the same system */
        '<section class="bd-looks"><div class="lk-in"><p class="bd-what">' + L("עיצוב", "Design") + "</p><h2>" + L("ייראה בדיוק כמו בית הכנסת שלכם.", "It looks exactly like your shul.") + '</h2><p class="lk-lead">' + L("העיצוב ניתן להתאמה מלאה: לוגו, צבעים, גופנים, צורות, המסך באולם וכל מילה. מה שהמערכת עושה נשאר זהה בכל עיצוב.", "The design is fully customizable: logo, colors, fonts, shapes, the shul screen and every word. What the system does stays the same in every design.") + '</p><div class="lk-grid">' +
          UI.THEMES.map(function (t) { return '<a class="lk" href="#/showcase/design" data-lk="' + t.id + '"><div class="lk-shot" data-theme="' + t.id + '"><div class="lk-bar"><span class="lk-logo">' + UI.logo() + '</span><b>' + esc(S.N(S.db.shul)) + '</b></div><div class="lk-hero"><small>' + L("השבת הקרובה", "This Shabbat") + "</small><strong>" + L("פרשת " + S.PARASHA.he, "Parashat " + S.PARASHA.en) + '</strong><div class="lk-card"><span>' + L("הדלקת נרות", "Candle lighting") + '</span><b class="num">' + S.hm(S.shabbatTimes().candles, S.prefs.lang === "en") + '</b></div><span class="lk-btn">' + L("לתרומה", "Donate") + '</span></div></div><span class="lk-name">' + esc(S.N(t)) + "</span></a>"; }).join("") +
          '</div><p class="lk-more"><a href="#/showcase/design">' + L("לסטודיו העיצוב, לראות את כל המסכים בכל עיצוב", "Open the design studio to see every screen in every design") + "</a></p></div></section>" +
        /* the close: a note with tear-off tabs */
        '<section class="bd-end"><div class="end-note"><i class="pin pin-red"></i><p class="end-k">' + L("גבאי?", "Gabbai?") + "</p><h2>" + L("רוצה מוצאי שבת שקט?", "Want a quiet Motzei Shabbat?") + '</h2><p class="end-s">' + L("נכין לבית הכנסת שלך הדגמה אישית והצעה למנוי חודשי.", "We'll prepare a personal demo for your shul and a monthly subscription proposal.") + "</p><p class=\"end-tip\">" + L("תתלוש פתק ←", "Tear one off ↓") + '</p><div class="end-tabs">' +
        [0, 1, 2, 3, 4, 5, 6].map(function (i) { return '<a class="end-tab" href="#/proposal" data-tab><span>' + L("הדגמה", "Demo") + '</span><bdi dir="ltr">' + esc(SALES.phone) + "</bdi></a>"; }).join("") + "</div></div>" +
        '<p class="end-direct"><a href="tel:' + SALES.tel + '"><bdi dir="ltr">' + esc(SALES.phone) + '</bdi></a> · <a href="mailto:' + SALES.email + '"><bdi dir="ltr">' + esc(SALES.email) + '</bdi></a> · <a href="#/tour">' + L("סיור מלא במערכת", "Full platform tour") + "</a></p>" +
        '<p class="bd-fine">' + L("הדגמה עם נתונים בדויים. הפתקים, השמות והסכומים בדויים. אין תשלומים, אימיילים או התראות אמיתיים.", "Demo with fictional data. The notes, names and amounts are invented. No real payments, emails or notifications.") + "</p></section>" +
        '<div class="dr-scrim" id="drScrim" hidden></div><div class="dr" id="dr" role="dialog" aria-modal="true" aria-labelledby="drH" hidden><div class="dr-paper" id="drPaper"></div></div>' +
        "</div>";

      var cork = app.querySelector("#bdCork"), count = app.querySelector("#bdCount"), dr = app.querySelector("#dr"), drPaper = app.querySelector("#drPaper"), scrim = app.querySelector("#drScrim");
      function drawCount() {
        count.innerHTML = left ? L("נשארו על הלוח: ", "Left on the board: ") + "<b>" + left + "</b> " + L(left === 1 ? "פתק" : "פתקים", left === 1 ? "note" : "notes") : L("הלוח ריק.", "The board is empty.");
        app.querySelector("#bdAll").hidden = !left;
        app.querySelector("#bdBack").hidden = !!left;
      }
      drawCount();

      app.querySelectorAll("[data-xl]").forEach(function (b) { b.addEventListener("click", function () { UI.setLang(b.getAttribute("data-xl")); }); });
      app.querySelectorAll("[data-go-role]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); X.go(a.getAttribute("data-go-role"), a.getAttribute("href")); }); });

      /* tear a note off: a copy flies away, a sun-bleached patch stays where it was */
      function tear(el, quick) {
        if (el.classList.contains("gone")) return;
        if (!reduce) {
          var r = el.getBoundingClientRect(), fly = el.cloneNode(true);
          fly.removeAttribute("data-note"); fly.setAttribute("aria-hidden", "true"); fly.tabIndex = -1;
          fly.classList.add("fly"); fly.style.left = r.left + "px"; fly.style.top = r.top + "px"; fly.style.width = r.width + "px";
          fly.style.setProperty("--dx", (Math.random() * 160 - 80).toFixed(0) + "px"); fly.style.setProperty("--dr", (Math.random() * 50 - 25).toFixed(0) + "deg");
          document.body.appendChild(fly);
          timers.push(setTimeout(function () { fly.remove(); }, quick ? 900 : 1100));
        }
        el.classList.add("gone"); el.disabled = true; el.setAttribute("aria-hidden", "true");
        cork.querySelectorAll(".nt.hint").forEach(function (h) { h.classList.remove("hint"); });
        left -= 1; drawCount();
        if (!left) timers.push(setTimeout(finale, quick ? 700 : 300));
      }
      function openNote(n) {
        drPaper.innerHTML = '<button type="button" class="dr-x" id="drX" aria-label="' + L("סגירה", "Close") + '">×</button><div class="dr-stamp" aria-hidden="true">' + L("טופל", "Done") + '</div>' +
          '<div class="dr-was"><span>' + L("היה על הלוח:", "Was on the board:") + '</span><div class="dr-mini nt-' + n.cls + '"><span class="nt-in">' + n.html + "</span></div></div>" +
          '<h2 id="drH">' + L(n.h[0], n.h[1]) + "</h2><p class=\"dr-p\">" + L(n.p[0], n.p[1]) + "</p>" + visual(n) +
          '<div class="dr-act"><a class="bd-btn" href="' + n.dest + '" data-dgo="' + n.role + '">' + L(n.go[0], n.go[1]) + '</a><button type="button" class="bd-link" id="drNext">' + (left ? L("לפתק הבא", "Next note") : L("לראות את הלוח", "Back to the board")) + "</button></div>";
        X.fitFrames(drPaper);
        dr.hidden = false; scrim.hidden = false;
        requestAnimationFrame(function () { dr.classList.add("open"); scrim.classList.add("open"); });
        document.documentElement.classList.add("bd-lock");
        drPaper.querySelector("#drX").addEventListener("click", closeNote);
        drPaper.querySelector("#drNext").addEventListener("click", function () { closeNote(); var nx = cork.querySelector(".nt:not(.gone)"); if (nx) timers.push(setTimeout(function () { nx.focus(); nx.click(); }, reduce ? 0 : 380)); });
        drPaper.querySelector("[data-dgo]").addEventListener("click", function (e) { e.preventDefault(); document.documentElement.classList.remove("bd-lock"); X.go(n.role, n.dest); });
        bindTimes();
        drPaper.querySelector("#drX").focus();
      }
      function closeNote() {
        if (dr.hidden) return;
        dr.classList.remove("open"); scrim.classList.remove("open"); document.documentElement.classList.remove("bd-lock");
        timers.push(setTimeout(function () { dr.hidden = true; scrim.hidden = true; drPaper.innerHTML = ""; }, reduce ? 0 : 320));
        /* the note itself is gone: focus moves to the next one on the board, or to the count */
        var nx = cork.querySelector(".nt:not(.gone)"), c = app.querySelector("#bdCount");
        if (nx) nx.focus({ preventScroll: true }); else if (c) { c.tabIndex = -1; c.focus({ preventScroll: true }); }
      }
      scrim.addEventListener("click", closeNote);
      function onKey(e) {
        if (dr.hidden) return;
        if (e.key === "Escape") { closeNote(); return; }
        if (e.key === "Tab") { var f = drPaper.querySelectorAll("button, a, input"); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
      }
      document.addEventListener("keydown", onKey);

      cork.querySelectorAll("[data-note]").forEach(function (el) {
        el.addEventListener("click", function () {
          var n = NOTES.filter(function (x) { return x.id === el.getAttribute("data-note"); })[0];
          tear(el);
          timers.push(setTimeout(function () { openNote(n); }, reduce ? 0 : 420));
        });
      });
      app.querySelector("#bdAll").addEventListener("click", function () {
        var rest = Array.prototype.slice.call(cork.querySelectorAll(".nt:not(.gone)"));
        rest.forEach(function (el, i) { timers.push(setTimeout(function () { tear(el, true); }, reduce ? 0 : i * 110)); });
      });
      app.querySelector("#bdBack").addEventListener("click", function () { UI.render(); });

      /* the empty board becomes the screen */
      function finale() {
        var tvw = app.querySelector("#bdTv"), f = tvw.querySelector("iframe[data-src]");
        if (f) { f.src = f.getAttribute("data-src"); f.removeAttribute("data-src"); }
        app.querySelector("#bdScene").classList.add("lit");
        tvw.hidden = false; X.fitFrames(tvw);
        app.querySelector("#bdPlaque").hidden = false;
      }

      /* the Mincha edit in the times note */
      function bindTimes() {
        var mnT = drPaper.querySelector("#mnT"), note = drPaper.querySelector("#mnNote");
        if (!mnT) return;
        drPaper.querySelectorAll("[data-mn]").forEach(function (b) {
          b.addEventListener("click", function () {
            var p = mincha(), t = window.SHUL_TV.prayerTime(p) + +b.getAttribute("data-mn");
            if (t < 12 * 60 || t > 20 * 60) return;
            p.time = t; delete p.rel;
            S.log("times", "עדכן זמן תפילה: " + p.he + " " + S.hm(t, false), "Updated davening time: " + p.en + " " + S.hm(t, false));
            S.save();
            mnT.textContent = t12(t);
            note.textContent = L("נשמר. המסך כבר מציג ", "Saved. The screen already shows ") + S.N(p) + " " + t12(t) + ".";
            note.classList.add("ok"); UI.flash(mnT);
          });
        });
      }

      /* the plaque: the shul's name, live on the screen */
      var inp = app.querySelector("#bdName"), nt = null;
      inp.addEventListener("input", function () { clearTimeout(nt); nt = setTimeout(function () { var v = inp.value.trim(); S.db.shul.he = v || sample.he; S.db.shul.en = v || sample.en; S.save(); }, 260); });

      app.querySelectorAll("[data-lk]").forEach(function (a) { a.addEventListener("click", function () { UI.setTheme(a.getAttribute("data-lk"), true); }); });
      /* the tear-off tabs */
      app.querySelectorAll("[data-tab]").forEach(function (a) {
        a.addEventListener("click", function (e) {
          if (reduce) return;
          e.preventDefault(); a.classList.add("torn");
          timers.push(setTimeout(function () { location.hash = "#/proposal"; }, 650));
        });
      });

      function stop() {
        timers.forEach(clearTimeout); clearTimeout(nt);
        document.removeEventListener("keydown", onKey); window.removeEventListener("hashchange", onHash);
        document.body.classList.remove("pg-board"); document.documentElement.classList.remove("bd-lock");
        document.querySelectorAll("body > .nt.fly").forEach(function (x) { x.remove(); });
        cleanup = null;
      }
      function onHash() { var h = (location.hash || "#/").split("?")[0]; if (h !== "#/" && h !== "#" && h !== "") stop(); }
      window.addEventListener("hashchange", onHash);
      cleanup = stop;
    }
  });
})();
