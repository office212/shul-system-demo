/* Kehillat Noam | the sales layer. Replaces the landing view with a full pitch page:
   a live hero (the real TV + a phone, and "type your shul's name" that re-brands the
   whole demo as you type), the "update once" lab, before/after, the hours calculator,
   the FAQ. Also: the floating contact button, scroll reveal, confetti and the finance
   chart. Still no server: everything runs on the same in-browser state. */
(function () {
  "use strict";
  var KN = window.KN, D = window.KN_DATA, S = KN.S, T = KN.T, L = KN.L, esc = KN.esc, ic = KN.ic, B = D.B;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function custom() { return S.shul.nameHe !== D.shul.nameHe || S.shul.nameEn !== D.shul.nameEn; }
  function chk(he, en) { return "<span>" + ic("check") + T(he, en) + "</span>"; }

  /* ---------- the closing call to action (used on several pages) ---------- */
  function mailto() { return "mailto:" + D.sales.email + "?subject=" + encodeURIComponent(T("מערכת לבית הכנסת", "A system for our synagogue") + (custom() ? " · " + KN.shulName() : "")); }
  KN.cta = function () {
    return '<section class="sx" data-rv><div class="cta"><div><h2>' + (custom() ? T("רוצים את זה ל", "Want this for ") + '<span data-shulname>' + esc(KN.shulName()) + "</span>?" : T("רוצים את זה לבית הכנסת שלכם?", "Want this for your synagogue?")) + "</h2><p>" +
      T("אותה מערכת, עם השם, הלוגו והצבעים שלכם. אנחנו מקימים אותה יחד איתכם, בלי ציוד חדש חוץ מטלוויזיה. שיחה קצרה, ונראה לכם איך זה נראה אצלכם.", "The same system, with your name, your logo and your colors. We set it up with you, no new hardware except a TV. One short call and we will show you how it looks for your shul.") +
      '</p><div class="cta-list">' + chk("הקמה מלווה", "Guided setup") + chk("בלי ציוד חדש", "No new hardware") + chk("עברית ואנגלית", "Hebrew & English") + chk("עובד בכל טלפון", "Works on every phone") + '</div></div><div class="cta-box">' + KN.contactBtns() + "</div></div></section>";
  };
  /* ---------- small pieces ---------- */
  function pn(n) { return '<div class="pn"><span class="pi">' + KN.logo() + "</span><div><b>" + esc(L(n.title)) + "</b><span>" + esc(L(n.body)) + "</span></div></div>"; }
  function p7() { return S.prayers.filter(function (p) { return p.id === "p7"; })[0] || S.prayers.filter(function (p) { return p.days.indexOf(5) >= 0; })[0]; }
  function siteRows() { var me = p7(); return KN.dayPrayers(5).map(function (p) { return '<div class="' + (me && p.id === me.id ? "me" : "") + '"><span>' + esc(L(p.name)) + "</span><b>" + KN.time(p.time) + "</b></div>"; }).join(""); }
  function shabBtn() { return KN.isShabbat() ? ic("clock") + T("להחזיר ליום שישי", "Back to Friday afternoon") : ic("flame") + T("הדמיית הדלקת נרות", "Simulate candle lighting"); }

  /* ================= the landing page ================= */
  KN.views.landing = {
    render: function () {
      var me = p7(), mins = [30, 90, 45, 40];
      var cp = KN.campaign();
      var hero = '<section class="hx"><div class="hx-in"><div><span class="hx-pill"><i></i>' + T("הדמו פתוח: בלי הרשמה, בלי שיחת מכירה", "Open demo: no sign-up, no sales call") + "</span><h1>" + T("המסך, הכספים והקהילה.", "The screen, the money, the community.") + "<em>" + T("בעברית, במערכת אחת.", "Hebrew first, in one system.") + '</em></h1><p class="hx-lede">' +
        T("מערכת ניהול מלאה לבית הכנסת: מסך טלוויזיה שעובר לשבת <b>מעצמו</b>, כספים, תרומות, עליות ומקומות. הגבאי מעדכן פעם אחת, וזה מופיע באתר, בטלפונים ועל המסך.", "A complete system for your shul: a TV screen that enters Shabbat <b>by itself</b>, finance, donations, aliyot and seats. Update once; the site, the phones and the screen follow.") +
        '</p><div class="hx-name"><label for="hxName">' + ic("edit") + T("נסו עם השם של בית הכנסת שלכם", "Try it with your own shul's name") + '</label><input id="hxName" data-on="hxName" autocomplete="off" maxlength="40" placeholder="' + T("למשל: בית הכנסת אהבת שלום", "e.g. Congregation Ahavat Shalom") + '" value="' + (custom() ? esc(KN.shulName()) : "") + '"><small>' + T("הקלידו, וכל ההדגמה הופכת לשלכם: המסך, האתר, הקבלות והמיילים.", "Type, and the whole demo becomes yours: the screen, the site, the receipts and the emails.") + "</small></div>" +
        '<div class="hx-cta"><button class="btn gold lg" data-act="tourStart">' + ic("play") + T("סיור מודרך · 3 דקות", "Take the tour · 3 minutes") + '</button><a class="btn lg wa-h" href="' + KN.waLink() + '" target="_blank" rel="noopener">' + ic("wa") + 'WhatsApp</a></div><div class="hx-proof">' + chk("בלי הרשמה", "No sign-up") + chk("עברית קודם", "Hebrew first") + chk("מסך הטלוויזיה כלול", "The TV screen is included") + chk("בלי תשלום לפי חבר", "No per-member fee") + chk("הקמה מלווה", "Guided setup") + "</div></div>" +
        '<div class="hx-stage"><div class="tvframe"><div class="tvhost" id="heroTv" data-go="tv" title="' + T("לפתוח את המסך", "Open the screen") + '"></div></div><div class="hx-cap"><button class="btn sm gold" id="hxShab" data-act="hxShabbat">' + shabBtn() + '</button></div><button class="hqm" data-act="proGo" data-to="hq" aria-label="' + T("לפתוח את מרכז הפיקוד", "Open the command center") + '"><div class="hqm-h"><span class="live"><i></i>' + T("מרכז הפיקוד", "Command center") + "</span><em>" + T("נתוני דמו", "Demo data") + '</em></div><div class="hqm-k"><div><b>' + KN.moneyT(KN.monthCollected()) + "</b><span>" + T("נגבה בנובמבר", "Collected in Nov") + "</span></div><div><b>" + S.members.length + "</b><span>" + T("מתפללים", "Members") + "</span></div><div><b>" + cp.pct.toFixed(1) + "%</b><span>" + T("מיעד הקמפיין", "Of the campaign") + '</span></div></div><div class="hqm-f" id="hqmFeed"></div></button></div></div></section>';
      var ribbon = '<div class="ribbon"><div class="ribbon-in">' + [[S.members.length, "", "מתפללים רשומים", "Registered members"], [KN.monthCollected(), "$", "נגבה בנובמבר", "Collected in November"], [S.prayers.reduce(function (a, p) { return a + p.days.length; }, 0), "", "מניינים בשבוע", "Minyanim a week"], [S.dedications.length, "", "הקדשות על המסך", "Dedications on screen"]].map(function (s) {
        return '<div class="rb"><div class="v" data-count="' + s[0] + '" data-pre="' + s[1] + '">0</div><div class="k">' + T(s[2], s[3]) + "</div></div>"; }).join("") + '</div><p class="ribbon-note">' + T("מספרים חיים מתוך ההדגמה. תרמו, אשרו בקשה או רשמו נדר, והם משתנים.", "Live numbers from the demo. Donate, approve a request or record a neder and they change.") + "</p></div>";
      var OLD = [["מחברת נדרים", "The nedarim notebook", "מי חייב מה? רק הגבאי יודע.", "Who owes what? Only the gabbai knows."], ["קבוצות וואטסאפ", "WhatsApp groups", "שינוי בזמן המנחה נבלע בין מאה הודעות.", "A changed Mincha time drowns among a hundred messages."], ["קובצי אקסל", "Excel files", "שלושה עותקים, אף אחד לא מעודכן.", "Three copies, none of them current."], ["פתקים על הלוח", "Notes on the board", "הקדשה שנשכחה, יארצייט שהתפספס.", "A forgotten dedication, a missed yahrzeit."], ["קבלות בכתב יד", "Handwritten receipts", "ובסוף השנה: ערב שלם של מכתבי מס.", "And at year end: a whole evening of tax letters."]];
      var NEW = [["כל נדר נרשם בחשבון המתפלל", "Every neder lands on the member's account", "והוא רואה ומשלם בעצמו, בכרטיס.", "And he sees it and pays by card himself."], ["התראה לטלפון, רק למי שזה נוגע", "A push to the phone, only to the people it concerns", "שינוי בזמנים מגיע לכולם בשנייה.", "A time change reaches everyone in a second."], ["מקור אחד לכל הנתונים", "One source for all the data", "עם גיבוי אוטומטי בכל לילה.", "With an automatic backup every night."], ["מסך חי בבית הכנסת", "A live screen in the shul", "הקדשות ויארצייט עולים לבד, בזמן.", "Dedications and yahrzeits appear on time, by themselves."], ["קבלה למס נשלחת במייל", "A tax receipt goes out by email", "ברגע התרומה, בלי שאף אחד מקליד.", "At the moment of the donation, nobody types a thing."]];
      var ba = '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("למה בכלל", "Why bother") + "</span><h2>" + T("ככה זה נראה היום. <em>וככה זה יכול להיראות.</em>", "This is how it looks today. <em>And how it could.</em>") + '</h2></div><div class="ba"><div class="ba-col ba-old" data-rv><h3>' + ic("x") + T("היום", "Today") + "</h3><ul>" + OLD.map(function (o) { return "<li>" + ic("x") + "<div><b>" + T(o[0], o[1]) + "</b><small>" + T(o[2], o[3]) + "</small></div></li>"; }).join("") + '</ul></div><div class="ba-mid" data-rv><span>' + ic("arrow") + '</span></div><div class="ba-col ba-new" data-rv style="--d:2"><h3>' + ic("check") + T("עם המערכת", "With the system") + "</h3><ul>" + NEW.map(function (o) { return "<li>" + ic("check") + "<div><b>" + T(o[0], o[1]) + "</b><small>" + T(o[2], o[3]) + "</small></div></li>"; }).join("") + "</ul></div></div></section>";
      var lab = '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("נסו בעצמכם", "Try it yourself") + "</span><h2>" + T("מעדכנים פעם אחת. <em>מתעדכן בכל מקום.</em>", "Update once. <em>It changes everywhere.</em>") + "</h2><p>" + T("אתם הגבאי. הזיזו את זמן המנחה של ערב שבת, וראו מה קורה באתר, בטלפון של המתפללים ועל המסך.", "You are the gabbai. Move Friday's Mincha, and watch the site, the members' phones and the screen.") + '</p></div><div class="lab" data-rv><div class="lab-ctl"><div class="who"><span class="avatar">' + ic("user") + "</span><div><b>" + esc(L(me.name)) + "</b><span>" + T("יום שישי · הגבאי משנה את השעה", "Friday · the gabbai changes the time") + '</span></div></div><div class="stepper"><button data-act="labStep" data-d="-5" aria-label="' + T("חמש דקות מוקדם יותר", "Five minutes earlier") + '">−5</button><output id="labT">' + KN.time(me.time).replace(/ (AM|PM)/, "") + '</output><button data-act="labStep" data-d="5" aria-label="' + T("חמש דקות מאוחר יותר", "Five minutes later") + '">+5</button></div></div><div class="lab-wire"></div><div class="lab-out">' +
        '<div class="lab-s"><h4>' + ic("globe") + T("האתר", "The website") + '<span class="ok">' + ic("check") + T("עודכן", "Updated") + '</span></h4><div class="lab-site"><div class="url"><i></i><i></i><i></i> ' + T("זמני תפילה · יום שישי", "Davening times · Friday") + '</div><div class="rows" id="labRows">' + siteRows() + "</div></div></div>" +
        '<div class="lab-s"><h4>' + ic("phone") + T("הטלפון של המתפללים", "The members' phones") + '<span class="ok">' + ic("check") + T("נשלח", "Sent") + '</span></h4><div class="lab-phone" id="labPhone"><p class="hint">' + T("כאן תופיע ההתראה. לחצו על ‎+5 או ‎−5.", "The push will appear here. Press +5 or −5.") + "</p></div></div>" +
        '<div class="lab-s"><h4>' + ic("tv") + T("המסך בבית הכנסת (תקריב)", "The shul screen (close-up)") + '<span class="ok">' + ic("check") + T("עודכן", "Updated") + '</span></h4><div class="lab-tv"><div class="tvhost" id="labTv"></div></div></div></div><p class="lab-foot">' + T("פעולה אחת של הגבאי. בלי להדפיס, בלי לשלוח הודעות, בלי לעדכן שלושה מקומות.", "One action by the gabbai. Nothing to print, no messages to send, no three places to update.") + "</p></div></section>";
      var act = S.activity.slice(0, 3), fri = KN.dayPrayers(5).slice(0, 3), sampleN = S.notifications[0];
      var bento = '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("מה יש במערכת", "What the system does") + "</span><h2>" + T("שבעה דברים שגבאים <em>מפסיקים לרדוף אחריהם</em>", "Seven things gabbaim <em>stop chasing</em>") + "</h2><p>" + T("כל כרטיס פותח את החלק האמיתי בהדגמה. לחצו ושחקו.", "Each card opens the real part of the demo. Press and play.") + '</p></div><div class="bento">' +
        '<button class="bt w3 dark" data-go="tv" data-rv><span class="bt-h"><span class="qi">' + ic("tv") + "</span><b>" + T("מסך שעובר לשבת מעצמו", "A screen that enters Shabbat by itself") + "</b></span><p>" + T("הקדשות, יארצייט, הודעות וספירה לאחור להדלקת נרות, על טלוויזיה רגילה. ברגע הדלקת הנרות המסך משתנה לבד, ואף אחד לא נוגע בו עד מוצאי שבת.", "Dedications, yahrzeits, announcements and a countdown to candle lighting, on an ordinary TV. At candle lighting the screen changes by itself, and nobody touches it until Saturday night.") + '</p><span class="modes"><div><b>' + T("יום חול", "Weekday") + "</b>" + T("הקדשות, QR, ספירה לאחור", "Dedications, QR, countdown") + "</div>" + ic("arrow", "flip") + '<div class="sh"><b>' + T("שבת שלום", "Shabbat Shalom") + "</b>" + T("נרות, בלי QR, בלי תנועה", "Candles, no QR, nothing moving") + '</div></span><span class="go">' + T("לראות את המעבר", "Watch the switch") + ic("arrow") + "</span></button>" +
        '<button class="bt w3" data-act="asFinance" data-rv style="--d:1"><span class="bt-h"><span class="qi">' + ic("coins") + "</span><b>" + T("כספים בלי מחברות", "Finance without notebooks") + "</b></span><p>" + T("נדרים ועליות, תשלומים, יתרות, דוח חודשי ומכתבי מס. הכול נרשם, שום דבר לא נמחק, וכל מתפלל רואה את החשבון שלו.", "Nedarim and aliyot, payments, balances, a monthly report and tax letters. Everything is recorded, nothing is erased, and each member sees his own account.") + '</p><span class="mini">' + act.map(function (a) { return '<span class="r"><span>' + esc(L(a.text)) + "</span></span>"; }).join("") + '</span><span class="go">' + T("לשולחן גבאי הכספים", "Open the finance desk") + ic("arrow") + "</span></button>" +
        '<button class="bt" data-go="times" data-rv><span class="bt-h"><span class="qi">' + ic("clock") + "</span><b>" + T("זמני תפילה וזמני היום", "Davening times & zmanim") + '</b></span><span class="mini">' + fri.map(function (p) { return '<span class="r"><span>' + esc(L(p.name)) + "</span><b>" + KN.time(p.time) + "</b></span>"; }).join("") + '</span><span class="go">' + T("לוח הזמנים", "See the times") + ic("arrow") + "</span></button>" +
        '<button class="bt" data-go="donate" data-rv style="--d:1"><span class="bt-h"><span class="qi">' + ic("heart") + "</span><b>" + T("תרומות בכרטיס", "Card donations") + '</b></span><span class="mini pills"><span>$36</span><span>$72</span><span class="on">$180</span><span>$360</span><em>' + ic("check") + T("קבלה למס נשלחה במייל", "Tax receipt emailed") + '</em></span><span class="go">' + T("לתרום בהדגמה", "Make a demo donation") + ic("arrow") + "</span></button>" +
        '<button class="bt" data-go="join" data-rv style="--d:2"><span class="bt-h"><span class="qi">' + ic("users") + "</span><b>" + T("חברים והצטרפות", "Members & joining") + '</b></span><span class="avs">' + S.members.slice(0, 5).map(function (m) { return '<span class="avatar">' + esc(KN.initials(m)) + "</span>"; }).join("") + '<span class="more">+' + Math.max(0, S.members.length - 5) + " · " + T("אישור בלחיצה", "one-click approval") + '</span></span><span class="go">' + T("להצטרף בהדגמה", "Join in the demo") + ic("arrow") + "</span></button>" +
        '<button class="bt w3" data-go="notifications" data-rv><span class="bt-h"><span class="qi">' + ic("bell") + "</span><b>" + T("התראות לטלפון, בלי אפליקציה מהחנות", "Phone notifications, no app store") + "</b></span><p>" + T("תשלום, שינוי בזמנים, הודעה, יארצייט. כל אחד מקבל רק את מה שנוגע לו.", "A payment, a time change, an announcement, a yahrzeit. Each person gets only what concerns him.") + '</p><span class="mini" style="background:none;padding:0">' + (sampleN ? pn(sampleN) : "") + '</span><span class="go">' + T("לשלוח התראה לדוגמה", "Send a sample push") + ic("arrow") + "</span></button>" +
        '<button class="bt w3" data-act="customize" data-rv style="--d:1"><span class="bt-h"><span class="qi">' + ic("palette") + "</span><b>" + T("השם, הלוגו והצבעים שלכם", "Your name, your logo, your colors") + "</b></span><p>" + T("המערכת לא נראית כמו תוכנה של מישהו אחר. היא נראית כמו בית הכנסת שלכם: באתר, במיילים, בקבלות ועל המסך.", "It does not look like someone else's software. It looks like your shul: on the site, in the emails, on the receipts and on the screen.") + '</p><span class="mini pills">' + KN.THEMES.map(function (t) { return '<span style="background:' + t.p + ";color:#fff;border-color:" + t.a + '">' + T(t.he, t.en) + "</span>"; }).join("") + '</span><span class="go">' + T("להחליף מראה עכשיו", "Re-skin it now") + ic("arrow") + "</span></button></div></section>";
      var RL = [["member", "member", "user", "המתפלל", "The member", "היתרה שלו, תשלום בכרטיס, היארצייטים של המשפחה.", "His balance, card payment, the family's yahrzeits."], ["finance", "finance", "coins", "גבאי הכספים", "The finance gabbai", "נדרים, תשלומים, יתרות ודוח חודשי במקום אחד.", "Nedarim, payments, balances and a monthly report in one place."], ["content", "admin", "edit", "גבאי התוכן", "The content gabbai", "הקדשות, הודעות ויארצייט שעולים ישר למסך.", "Dedications, announcements and yahrzeits, straight to the screen."], ["admin", "admin/join", "shield", "המנהל", "The admin", "בקשות הצטרפות, הרשאות, הגדרות וגיבויים.", "Join requests, permissions, settings and backups."]];
      var roles = '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("ארבעה תפקידים", "Four roles") + "</span><h2>" + T("כל אחד רואה <em>רק את מה ששלו</em>", "Everyone sees <em>only what is his</em>") + "</h2><p>" + T("בחרו תפקיד והיכנסו למערכת דרך העיניים שלו. בהדגמה אין סיסמאות.", "Pick a role and enter the system through his eyes. The demo has no passwords.") + '</p></div><div class="roles">' + RL.map(function (r, i) { return '<button class="rl" data-act="roleGo" data-r="' + r[0] + '" data-to="' + r[1] + '" data-rv style="--d:' + i + '"><span class="ri">' + ic(r[2]) + "</span><b>" + T(r[3], r[4]) + "</b><span>" + T(r[5], r[6]) + "</span><em>" + T("להיכנס כ" + r[3].replace(/^ה/, ""), "Enter as " + r[4].replace(/^The /, "")) + T(" ←", " →") + "</em></button>"; }).join("") + "</div></section>";
      var CT = [["עדכון זמנים, לוחות והודעות", "Updating times, boards and notices"], ["רישום נדרים ומעקב אחרי חובות", "Recording nedarim and chasing balances"], ["קבלות ומכתבי מס", "Receipts and tax letters"], ["תזכורות, יארצייט והקדשות", "Reminders, yahrzeits and dedications"]];
      var calc = '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("מחשבון", "Calculator") + "</span><h2>" + T("כמה שעות של מתנדבים <em>הולכות על ניירת?</em>", "How many volunteer hours <em>go to paperwork?</em>") + "</h2><p>" + T("הזיזו את המחוונים לפי מה שקורה אצלכם. זו הערכה לפי המספרים שלכם, לא הבטחה.", "Move the sliders to match your shul. It is an estimate from your own numbers, not a promise.") + '</p></div><div class="calc" data-rv><div class="calc-l">' + CT.map(function (c, i) { return '<div class="sl"><label for="cs' + i + '"><span>' + T(c[0], c[1]) + '</span><output id="co' + i + '"></output></label><input type="range" id="cs' + i + '" data-on="calc" min="0" max="240" step="5" value="' + mins[i] + '"></div>'; }).join("") + '<p class="small muted">' + T("דקות בשבוע, של כל הגבאים יחד.", "Minutes a week, all gabbaim together.") + '</p></div><div class="calc-r"><div class="u">' + T("בערך", "About") + '</div><div class="big" id="calcBig">0</div><div class="u">' + T("שעות בשנה", "hours a year") + "</div><p>" + T("של עבודה שהמערכת עושה לבד או בלחיצה אחת.", "of work the system does by itself or with one click.") + '</p><span class="eq" id="calcEq"></span></div></div></section>';
      var ST = [["מדברים", "We talk", "שיחה קצרה: כמה מתפללים, מה חשוב לכם, מה יש היום.", "A short call: how many members, what matters to you, what you use today."], ["מתאימים", "We fit it to you", "השם, הלוגו והצבעים שלכם, הזמנים שלכם, רשימת המתפללים.", "Your name, logo and colors, your times, your member list."], ["עולים לאוויר", "You go live", "תולים טלוויזיה, שולחים למתפללים קישור, והגבאים מתחילים לעבוד.", "Hang a TV, send the members a link, and the gabbaim start working."]];
      var steps = '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("איך מתחילים", "How it starts") + "</span><h2>" + T("שלושה צעדים, <em>ואנחנו איתכם בכל אחד</em>", "Three steps, <em>and we are with you in each</em>") + '</h2></div><div class="steps3">' + ST.map(function (s, i) { return '<div class="st3" data-rv style="--d:' + i + '"><h3>' + T(s[0], s[1]) + "</h3><p>" + T(s[2], s[3]) + "</p></div>"; }).join("") + "</div></section>";
      var FAQ = [["צריך לקנות ציוד מיוחד?", "Do we need special hardware?", "לא. המסך הוא טלוויזיה רגילה, והמערכת עובדת בכל טלפון ובכל מחשב.", "No. The screen is an ordinary TV, and the system works on any phone and any computer."],
        ["המתפללים צריכים להוריד אפליקציה?", "Do members need to download an app?", "לא. נכנסים מקישור, ואפשר להוסיף את האתר למסך הבית כדי לקבל התראות, באייפון ובאנדרואיד.", "No. They open a link, and can add the site to the home screen to get notifications, on iPhone and Android."],
        ["מה קורה בשבת?", "What happens on Shabbat?", "המסך עובר מעצמו למצב שבת ברגע הדלקת הנרות: בלי קוד תרומה ובלי תנועה. במוצאי שבת הוא חוזר לבד. אף אחד לא נוגע בו.", "The screen switches to Shabbat mode by itself at candle lighting: no donation code, nothing moving. On Saturday night it switches back. Nobody touches it."],
        ["ומי שלא מסתדר עם מחשבים?", "What about gabbaim who are not technical?", "המערכת נכתבה לגבאים, לא למתכנתים. כפתורים גדולים, עברית מלאה, וכל פעולה היא לחיצה או שתיים. הדרך הטובה ביותר לבדוק: נסו כאן בהדגמה.", "It was written for gabbaim, not developers. Big buttons, full Hebrew, and every action is a click or two. The best test: try it here in the demo."],
        ["המידע של הקהילה שמור?", "Is the community's data safe?", "כל אחד רואה רק את מה ששייך לתפקיד שלו, ויש גיבוי אוטומטי בכל לילה עם שחזור בלחיצה.", "Each person sees only what belongs to his role, and there is an automatic backup every night with a one-click restore."],
        ["הזמנים מתאימים למנהג שלנו?", "Do the times follow our custom?", "כן. הזמנים והניסוחים על המסך מותאמים למנהג בית הכנסת שלכם, ואתם קובעים אותם בהגדרות.", "Yes. The times and the wording on the screen follow your shul's custom, and you set them in the settings."],
        ["כמה זה עולה?", "How much does it cost?", "אין תשלום לפי חבר. את כל הפרטים נשמח לתת בשיחה קצרה.", "There is no per-member fee. We are glad to give you the details on a short call."]];
      var faq = '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("שאלות נפוצות", "Common questions") + "</span><h2>" + T("מה ששואלים אותנו <em>בכל שיחה</em>", "What we are asked <em>on every call</em>") + '</h2></div><div class="faq" data-rv>' + FAQ.map(function (f, i) { return "<details" + (i === 0 ? " open" : "") + "><summary>" + T(f[0], f[1]) + "</summary><p>" + T(f[2], f[3]) + "</p></details>"; }).join("") + '</div><p class="center" style="margin-top:20px"><button class="btn sec" data-go="included">' + ic("list") + T("הרשימה המלאה: מה כלול", "The full list: what's included") + '</button> <button class="btn sec" data-act="contactMsg">' + ic("mail") + T("לנסות את טופס יצירת הקשר של הקהילה", "Try the shul's contact form") + "</button></p></section>";
      return hero + ribbon + '<div class="page" style="animation:none;padding-top:0">' + KN.videoSection() + ba + lab + KN.autopilotSection() + (KN.proSection ? KN.proSection() : "") + bento + roles + calc + KN.onboardSection() + steps + KN.trustSection() + KN.compareSection() + faq + KN.cta() + KN.foot() + "</div>";
    },
    after: function (root) {
      var btn = document.getElementById("hxShab"), cdT = null;
      KN.tvMount(document.getElementById("heroTv"), { onMode: function () { clearInterval(cdT); if (btn) btn.innerHTML = shabBtn(); } });
      KN.tvMount(document.getElementById("labTv"));
      /* the command-center preview: automations firing, built from the demo's own people and amounts */
      var feed = document.getElementById("hqmFeed"), db = S.members.filter(function (m) { return KN.balance(m) > 0.004; }), fi = 0;
      function line() { var m = db[fi % Math.max(1, db.length)] || S.members[0], k = fi++ % 4;
        return [T("תזכורת תשלום נשלחה · ", "Payment reminder sent · ") + L(m.name), T("נדר נרשם · שלישי · ", "Neder recorded · third aliyah · ") + L(S.members[fi % S.members.length].name), T("מקום נמכר וחויב · שורה ", "Seat sold and charged · row ") + (1 + fi % 9), T("קבלה נשלחה במייל · תרומה ", "Receipt emailed · donation ") + KN.moneyT([36, 72, 180, 101][fi % 4])][k]; }
      function pushLine() { if (!feed || !feed.isConnected) return; feed.insertAdjacentHTML("afterbegin", "<div>" + ic("check") + "<span>" + esc(line()) + "</span></div>"); while (feed.children.length > 3) feed.lastChild.remove(); }
      pushLine(); pushLine(); pushLine();
      var t2 = setInterval(pushLine, 2600);
      KN.cleanup.push(function () { clearInterval(t2); clearInterval(cdT); });
      KN._hxCount = function () {
        clearInterval(cdT);
        cdT = setInterval(function () { var s = Math.ceil((KN.CANDLE - KN.now().getTime()) / 1000); if (s <= 0 || !btn.isConnected) { clearInterval(cdT); return; } btn.innerHTML = ic("flame") + T("הדלקת נרות בעוד ", "Candle lighting in ") + s + T(" שניות…", "s…"); }, 250);
      };
      KN.autopilotMount();
      KN.on.calc();
      KN.reveal(root);
    }
  };

  /* type your shul's name: the whole demo re-brands as you type */
  var nameDeb;
  KN.on.hxName = function (el) {
    var v = el.value.trim();
    S.shul.nameHe = v || D.shul.nameHe; S.shul.nameEn = v || D.shul.nameEn;
    KN.save(); KN.renderBar();
    clearTimeout(nameDeb); nameDeb = setTimeout(function () { KN.tvRefresh(); }, 160);
  };
  /* watch Shabbat come in on the hero screen: 12 seconds before candle lighting, then it switches by itself */
  KN.act.hxShabbat = function () {
    if (KN.isShabbat()) { KN.setClock("friPM", true); KN.toast(T("חזרנו ליום שישי אחר הצהריים", "Back to Friday afternoon")); return; }
    KN.setClock("friSoon", true); KN._hxCount();
    var tv = document.querySelector(".hx-stage"); if (tv && window.innerWidth < 1000) tv.scrollIntoView({ block: "center", behavior: "smooth" });
    KN.toast(T("הביטו במסך: עוד 12 שניות הוא עובר לשבת מעצמו", "Watch the screen: in 12 seconds it switches to Shabbat by itself"));
  };
  KN.act.asFinance = function () { KN.setRole("finance", "finance"); };
  KN.act.roleGo = function (el) { KN.setRole(el.dataset.r, el.dataset.to); };

  /* the lab: one change, three places */
  KN.act.labStep = function (el) {
    var p = p7(), was = p.time, m = Math.min(18 * 60, Math.max(15 * 60, KN.mins(p.time) + (+el.dataset.d)));
    if (KN.hhmm(m) === was) return;
    if (KN.now().getDay() !== 5 || KN.isShabbat()) KN.setClock("friPM", true);
    p.time = KN.hhmm(m); KN.save(); KN.tvRefresh();
    var out = document.getElementById("labT"); out.textContent = KN.time(p.time).replace(/ (AM|PM)/, ""); out.classList.remove("bump"); void out.offsetWidth; out.classList.add("bump");
    document.getElementById("labRows").innerHTML = siteRows();
    var row = document.querySelector("#labRows .me"); if (row) row.classList.add("flash");
    document.getElementById("labPhone").innerHTML = pn({ title: B("שינוי בזמני התפילה", "Davening time changed"), body: B(p.name.he + ": " + KN.time(p.time) + " (במקום " + KN.time(was) + ")", p.name.en + ": " + KN.time(p.time) + " (was " + KN.time(was) + ")") });
    document.querySelectorAll(".lab-s").forEach(function (s, i) { s.classList.remove("hit"); setTimeout(function () { s.classList.add("hit"); }, 120 + i * 260); });
  };
  KN.on.calc = function () {
    var tot = 0;
    for (var i = 0; i < 4; i++) { var el = document.getElementById("cs" + i); if (!el) return; var v = +el.value; tot += v; document.getElementById("co" + i).textContent = v + T(" דק׳ בשבוע", " min / week"); }
    var hrs = Math.round(tot * 52 / 60);
    document.getElementById("calcBig").textContent = hrs.toLocaleString("en-US");
    document.getElementById("calcEq").textContent = T("שווה ערך ל־" + Math.round(hrs / 8) + " ימי עבודה מלאים", "That is " + Math.round(hrs / 8) + " full working days");
  };

  /* ---------- scroll reveal ---------- */
  var io = null;
  if ("IntersectionObserver" in window && !reduce) {
    document.documentElement.classList.add("rv-on");
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  }
  KN.reveal = function (root) { (root || document).querySelectorAll("[data-rv]").forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); }); };
  var render0 = KN.render;
  KN.render = function () { render0(); if (KN.route().name !== "landing") KN.reveal(document.getElementById("view")); };

  /* ---------- confetti (after a donation, at the end of the tour) ---------- */
  KN.confetti = function () {
    if (reduce) return;
    var old = document.getElementById("confetti"); if (old) old.remove();
    var c = document.createElement("canvas"); c.id = "confetti"; document.body.appendChild(c);
    var x = c.getContext("2d"), w = c.width = innerWidth, h = c.height = innerHeight, cs = getComputedStyle(document.documentElement);
    var cols = [cs.getPropertyValue("--a").trim() || "#b48e56", "#f3dfb4", "#ffffff", cs.getPropertyValue("--p").trim() || "#0e2c4c", "#7ad3a4"], ps = [], t0 = performance.now();
    for (var i = 0; i < 140; i++) ps.push({ x: w / 2 + (Math.random() - .5) * 120, y: h * .38, vx: (Math.random() - .5) * 17, vy: -Math.random() * 15 - 4, s: 5 + Math.random() * 7, r: Math.random() * 6.3, vr: (Math.random() - .5) * .4, c: cols[i % cols.length] });
    (function step(t) {
      var k = (t - t0) / 2600; x.clearRect(0, 0, w, h);
      ps.forEach(function (p) { p.vy += .42; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.globalAlpha = Math.max(0, 1 - k * k); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .66); x.restore(); });
      if (k < 1) requestAnimationFrame(step); else c.remove();
    })(t0);
  };
  var th = KN.views.thanks, thAfter = th.after;
  th.after = function () { if (thAfter) thAfter.apply(th, arguments); if (S.lastDonation) setTimeout(KN.confetti, 250); };
  var tourEnd0 = KN.act.tourEnd;
  KN.act.tourEnd = function (el, ev, done) { tourEnd0(el, ev, done); if (done) KN.confetti(); };
  document.addEventListener("keydown", function (ev) {
    if (!document.getElementById("tour") || /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
    var fwd = S.lang === "he" ? "ArrowLeft" : "ArrowRight", back = S.lang === "he" ? "ArrowRight" : "ArrowLeft";
    if (ev.key === fwd) KN.act.tourNext(); else if (ev.key === back) KN.act.tourPrev();
  });

  /* ---------- the finance desk's chart: collected per month (sample history) ---------- */
  KN.chartCard = function () {
    var M = KN.monthSeries();
    var max = Math.max.apply(null, M.map(function (m) { return m[1]; })) || 1;
    return '<div class="card"><div class="card-h"><h3>' + T("גבייה לפי חודש", "Collected per month") + '</h3><span class="chip gold">' + T("חצי שנה · נתוני דמו", "Six months · demo data") + '</span></div><div class="chart" role="img" aria-label="' + T("גבייה בכל חודש, יוני עד נובמבר", "Collected each month, June to November") + '">' +
      M.map(function (m, i) { return '<div class="col' + (i === 5 ? " now" : "") + '" tabindex="0" title="' + L(m[0]) + ": " + KN.moneyT(m[1]) + '"><span class="val">' + KN.moneyT(m[1]) + '</span><div class="bar" style="height:' + (m[1] / max * 100).toFixed(1) + "%;--i:" + i + '"></div></div>'; }).join("") +
      '</div><div class="chart-x">' + M.map(function (m, i) { return '<span class="' + (i === 5 ? "now" : "") + '">' + L(m[0]) + "</span>"; }).join("") + "</div></div>";
  };

  /* ---------- the floating contact button ---------- */
  function fab() {
    var b = document.getElementById("fab"); if (!b) { b = document.createElement("button"); b.id = "fab"; b.className = "fab no-print"; b.setAttribute("data-act", "talk"); document.body.appendChild(b); }
    b.innerHTML = ic("phone") + "<span>" + T("רוצים את זה אצלכם?", "Want this for your shul?") + "</span>"; b.setAttribute("aria-label", T("דברו איתנו", "Talk to us"));
  }
  function fabShow() { var b = document.getElementById("fab"); if (b) b.classList.toggle("show", KN.route().name !== "landing" || window.scrollY > 520); }
  window.addEventListener("scroll", fabShow, { passive: true });
  window.addEventListener("hashchange", function () { setTimeout(fabShow, 0); });
  var bar0 = KN.renderBar;
  KN.renderBar = function () { bar0(); fab(); fabShow(); };
})();
