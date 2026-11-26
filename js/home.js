/* Shul System sales demo | the marketing site.
   #/          the home page: what the system is, what is in it (live product frames), what it
               replaces, how a shul starts, questions, contact
   #/proposal  the request for a personal demonstration
   The gabbai's drawer (the story) lives at #/drawer. Every claim on these pages is a capability
   of the real system (FEATURE-MAP.md) or a statement the owner already makes in the demo. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, X = window.SHUL_XP, L = S.L, esc = S.esc;
  var SALES = UI.SALES;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cleanup = null;

  var CHECK = '<svg class="mk-ck" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg>';
  function arrow() { return '<span class="mk-arr" aria-hidden="true">' + L("←", "→") + "</span>"; }
  function tel(cls) { return '<a class="' + (cls || "") + '" href="tel:' + SALES.tel + '">' + X.ic("phone", 17) + '<bdi dir="ltr">' + esc(SALES.phone) + "</bdi></a>"; }
  function mail(cls) { return '<a class="' + (cls || "") + '" href="mailto:' + SALES.email + '">' + X.ic("mail", 17) + '<bdi dir="ltr">' + esc(SALES.email) + "</bdi></a>"; }
  function mincha() { return S.db.prayers.filter(function (p) { return p.id === "p3"; })[0] || S.db.prayers.filter(function (p) { return p.group === "weekday" && /mincha/i.test(p.en); })[0]; }
  function t12(min) { return S.hm(min, S.prefs.lang === "en"); }

  /* ---------- the header and footer of the marketing pages ---------- */
  var NAV = [["features", "מה במערכת", "What's inside"], ["compare", "מה היא מחליפה", "What it replaces"], ["start", "איך מתחילים", "Getting started"], ["faq", "שאלות נפוצות", "Questions"]];
  function header(page) {
    var links = NAV.map(function (n) { return '<a href="#/?to=' + n[0] + '" data-to="' + n[0] + '">' + L(n[1], n[2]) + "</a>"; }).join("");
    return '<header class="mk-head" id="mkHead"><div class="mk-wrap mk-head-in">' +
      '<a class="mk-brand" href="#/" data-to="top">' + UI.mark() + "<span>" + UI.wordmark() + "<small>" + L("מערכת לניהול בית הכנסת", "Shul management software") + "</small></span></a>" +
      '<nav class="mk-nav" id="mkNav" aria-label="' + L("ניווט ראשי", "Main") + '">' + links +
      '<a class="mk-nav-demo" href="#/gabbai" data-enter>' + L("הדגמה חיה", "Live demo") + "</a>" +
      '<div class="mk-nav-extra">' + tel("mk-nav-tel") + '<a class="mk-btn" href="#/proposal">' + L("בקשת הדגמה אישית", "Request a personal demo") + "</a></div></nav>" +
      '<div class="mk-head-end"><span class="mk-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button type="button" data-xl="he" aria-pressed="' + (S.prefs.lang === "he") + '">עברית</button><button type="button" data-xl="en" aria-pressed="' + (S.prefs.lang === "en") + '">English</button></span>' +
      (page === "proposal" ? "" : '<a class="mk-btn sm mk-head-cta" href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + "</a>") +
      '<button type="button" class="mk-burger" id="mkBurger" aria-expanded="false" aria-controls="mkNav" aria-label="' + L("תפריט", "Menu") + '"><i></i><i></i><i></i></button></div></div></header>';
  }
  function footer() {
    var tryLinks = [["super", "#/gabbai", "מערכת הגבאים", "The gabbai system"], ["member", "#/me", "החשבון של המתפלל", "The member account"], ["", "#/tv", "המסך באולם", "The shul screen"], ["visitor", "#/site", "אתר בית הכנסת", "The shul website"]];
    return '<footer class="mk-foot"><div class="mk-wrap mk-foot-grid">' +
      '<div class="mk-foot-brand"><a class="mk-brand" href="#/" data-to="top">' + UI.mark() + "<span>" + UI.wordmark() + "<small>" + L("מערכת לניהול בית הכנסת", "Shul management software") + "</small></span></a><p>" + L("המסך באולם, זמני התפילה, דף השבת, התרומות והחשבונות, במקום אחד.", "The screen, davening times, the Shabbat bulletin, donations and accounts, in one place.") + "</p></div>" +
      "<div><h3>" + L("באתר", "On this site") + "</h3>" + NAV.map(function (n) { return '<a href="#/?to=' + n[0] + '" data-to="' + n[0] + '">' + L(n[1], n[2]) + "</a>"; }).join("") + '<a href="#/drawer">' + L("המגירה של הגבאי", "The gabbai's drawer") + "</a></div>" +
      "<div><h3>" + L("ההדגמה החיה", "The live demo") + "</h3>" + tryLinks.map(function (t) { return '<a href="' + t[1] + '"' + (t[0] ? ' data-role="' + t[0] + '"' : "") + ">" + L(t[2], t[3]) + "</a>"; }).join("") + "</div>" +
      "<div><h3>" + L("יצירת קשר", "Contact") + "</h3>" + tel() + mail() + '<a href="#/proposal">' + L("בקשת הדגמה אישית", "Request a personal demo") + "</a></div></div>" +
      '<div class="mk-wrap mk-foot-fine">' + L("ההדגמה פועלת עם קהילה ונתונים בדויים. אין בה תשלומים, אימיילים או התראות אמיתיים.", "The demo runs on a fictional congregation and data. It makes no real payments and sends no real emails or notifications.") + "</div></footer>";
  }
  function bindChrome(root, goTo) {
    root.querySelectorAll("[data-xl]").forEach(function (b) { b.addEventListener("click", function () { UI.setLang(b.getAttribute("data-xl")); }); });
    root.querySelectorAll("[data-enter]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); X.go("super", "#/gabbai"); }); });
    root.querySelectorAll("a[data-role]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); X.go(a.getAttribute("data-role"), a.getAttribute("href")); }); });
    var head = root.querySelector("#mkHead"), burger = root.querySelector("#mkBurger");
    function shut() { head.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    burger.addEventListener("click", function () { var o = head.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    root.querySelectorAll("#mkNav a").forEach(function (a) { a.addEventListener("click", shut); });
    if (goTo) root.querySelectorAll("[data-to]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); shut(); goTo(a.getAttribute("data-to")); }); });
  }

  /* ---------- what is in the system: six parts, each shown running ---------- */
  var MOMENTS = [["1:600", "יום חול", "A weekday"], ["5:930", "שישי, לפני הדלקת נרות", "Friday, before candles"], ["6:660", "שבת", "Shabbat"], ["2:1425", "לילה", "Night"]];
  var FEATURES = [
    { id: "screen", vis: "screen", role: "", dest: "#/tv",
      n: ["המסך באולם", "The screen in the shul"], h: ["מסך שמנהל את עצמו, גם בשבת", "A screen that runs itself, on Shabbat too"],
      p: ["זמני היום, זמני התפילות, לוח הקהילה, הלכה יומית ודף יומי. בהדלקת נרות המסך עובר לבד למצב שבת, ובלילה הוא מתעמעם.", "Zmanim, davening times, the community board, a halacha of the day and the Daf Yomi. At candle lighting the screen switches to Shabbat mode on its own, and at night it dims."],
      b: [["המניין הבא מסומן, עם ספירה לאחור לנץ", "The next minyan is marked, with a countdown to Netz"], ["מצב שבת מהדלקת נרות ועד צאת השבת", "Shabbat mode from candle lighting until Shabbat ends"], ["קוד QR לתרומה, ישר מהמסך", "A donation QR code, right on the screen"]],
      c: ["לפתוח את המסך במלואו", "Open the full screen"] },
    { id: "times", vis: "times", role: "content", dest: "#/gabbai/tv",
      n: ["זמני תפילה ודף שבת", "Davening times and the bulletin"], h: ["משנים שעה פעם אחת, והיא מתעדכנת בכל מקום", "Change a time once and it updates everywhere"],
      p: ["מנחה זזה בחמש דקות? מעדכנים במערכת, והשעה החדשה מופיעה מיד במסך, באתר ובדף השבת. נסו כאן: הזיזו את מנחה והביטו במסך.", "Mincha moved by five minutes? Update it in the system and the new time shows at once on the screen, the website and the Shabbat bulletin. Try it here: move Mincha and watch the screen."],
      b: [["זמנים לימי חול, לשבת או ליום מסוים בשבוע", "Times for weekdays, Shabbat or one day of the week"], ["דף שבת שנבנה לבד מהזמנים, מוכן להדפסה", "A Shabbat bulletin that builds itself from the times, ready to print"], ["הודעות, מזל טוב ופליירים למסך, לפי תאריכים", "Announcements, mazal tovs and flyers on the screen, by date"]],
      c: ["לנסות את עורך הזמנים", "Try the times editor"] },
    { id: "finance", vis: "#/finance/nedarim", role: "finance", dest: "#/finance/nedarim",
      n: ["כספים ונדרים", "Finance and nedarim"], h: ["כל נדרי השבת בטבלה אחת, במוצאי שבת", "All of Shabbat's nedarim in one table, on Motzei Shabbat"],
      p: ["רושמים את כל העליות בטבלה אחת ושומרים פעם אחת. כל נדר נכנס לחשבון של המתפלל, והוא רואה אותו בטלפון.", "Enter every aliyah in one table and save once. Each neder goes onto the member's account, and they see it on their phone."],
      b: [["מי חייב וכמה, בכל רגע", "Who owes what, at any moment"], ["קבלות, דוח שנתי ומכתב מס לכל מתפלל", "Receipts, an annual report and a tax letter for every member"], ["חיובים קבועים, ותיקון של כל פעולה שנרשמה", "Recurring charges, and a correction for anything recorded"]],
      c: ["לרשום נדרי שבת בהדגמה", "Enter nedarim in the demo"] },
    { id: "member", vis: "member", role: "member", dest: "#/me",
      n: ["החשבון של המתפלל", "The member account"], h: ["לכל מתפלל חשבון בטלפון", "Every member has an account on their phone"],
      p: ["היתרה, כל חיוב וכל תשלום. המתפלל משלם בכרטיס מתוך החשבון, והיתרה מתעדכנת באותו רגע. אף אחד לא רודף אחרי חובות.", "The balance, every charge and every payment. Members pay by card from the account and the balance updates at once. Nobody chases balances."],
      b: [["תשלום בכרטיס, והתשלום נרשם מעצמו", "Pay by card, and the payment records itself"], ["בקשת יארצייט למשפחה, באישור הגבאי", "Family yahrzeit requests, approved by the gabbai"], ["הודעות מהקהילה והתראות לטלפון", "Community announcements and phone notifications"]],
      c: ["לראות את החשבון כמתפלל", "See the account as a member"] },
    { id: "site", vis: "site", role: "visitor", dest: "#/site",
      n: ["אתר ותרומות", "Website and donations"], h: ["אתר לבית הכנסת, עם תרומות באונליין", "A website for the shul, with online donations"],
      p: ["דף בית עם זמני השבת, דרכי הגעה ויצירת קשר, וטופס תרומה מסודר. משפחות חדשות מגישות בקשת הצטרפות, והגבאי מאשר.", "A home page with this Shabbat's times, directions and contact, and a proper donation form. New families send a join request, and the gabbai approves."],
      b: [["תרומה בכרטיס, Apple Pay ו-Google Pay", "Donate by card, Apple Pay and Google Pay"], ["הקדשה לתרומה ואפשרות לכסות את העמלה", "A dedication note and an option to cover the fee"], ["כל טקסט באתר ניתן לעריכה, בעברית ובאנגלית", "Every text on the site is editable, in Hebrew and English"]],
      c: ["לפתוח את האתר לדוגמה", "Open the sample website"] },
    { id: "admin", vis: "#/admin", role: "super", dest: "#/admin",
      n: ["גבאים, הרשאות וגיבוי", "Gabbaim, permissions and backup"], h: ["הגבאי מתחלף, והמידע נשאר", "The gabbai changes, and nothing gets lost"],
      p: ["לכל גבאי הרשאה משלו: כספים, או תוכן וזמנים. כל פעולה נרשמת ביומן, וגיבוי מלא נשמר כל לילה. הגבאי הבא מקבל הכל מסודר.", "Each gabbai gets their own access: finances, or content and times. Every action is logged, and a full backup is kept every night. The next gabbai gets it all in order."],
      b: [["הרשאות נפרדות לכספים ולתוכן", "Separate access for finances and for content"], ["יומן פעילות של כל שינוי במערכת", "An activity log of every change"], ["גיבוי לילי, והורדת גיבוי בכל רגע", "A nightly backup, and a download whenever you want one"]],
      c: ["לראות את ניהול ההרשאות", "See the permissions screen"] }
  ];
  function visual(f) {
    if (f.vis === "screen") {
      return '<div class="mk-moments" role="group" aria-label="' + L("רגע בשבוע", "Moment of the week") + '"><span>' + L("המסך ב:", "The screen on:") + "</span>" + MOMENTS.map(function (m, i) { return '<button type="button" data-mom="' + m[0] + '" aria-pressed="' + (i === 0) + '">' + L(m[1], m[2]) + "</button>"; }).join("") + "</div>" +
        X.tvset(X.frame("#/tv?preview=1&clock=" + MOMENTS[0][0], 1920, 1080, "", L("המסך באולם", "The shul screen")));
    }
    if (f.vis === "times") {
      var p = mincha();
      return '<div class="mk-mincha"><div><b>' + esc(S.N(p)) + "</b><small>" + L("ימי חול", "Weekdays") + '</small></div><div class="mk-mincha-ctl"><button type="button" data-mn="-5" aria-label="' + L("5 דקות מוקדם יותר", "5 minutes earlier") + '">−5</button><output id="mkMn">' + t12(window.SHUL_TV.prayerTime(p)) + '</output><button type="button" data-mn="5" aria-label="' + L("5 דקות מאוחר יותר", "5 minutes later") + '">+5</button></div><p id="mkMnNote" aria-live="polite">' + L("לחצו ‎+5‎ או ‎−5‎ והביטו במסך", "Press +5 or −5 and watch the screen") + "</p></div>" +
        X.tvset(X.frame("#/tv?preview=1&clock=1:720", 1920, 1080, "", L("המסך באולם", "The shul screen")));
    }
    if (f.vis === "member") return '<div class="mk-vis-phone">' + X.phone(X.frame("#/me?frame=1&as=member", 400, 860, "", L("חשבון המתפלל", "Member account"))) + "</div>";
    if (f.vis === "site") return X.browser("www." + X.slug() + ".org", X.frame("#/site?frame=1&as=visitor", 1280, 860, "", L("אתר בית הכנסת", "Shul website")));
    return X.browser("admin." + X.slug() + ".org", X.frame(f.vis + "?frame=1&as=" + f.role, 1360, 860, "", L(f.n[0], f.n[1])));
  }

  /* ---------- what it replaces ---------- */
  var COMPARE = [
    ["מנחה זזה", "Mincha moves", "מתקנים את הלוח בכניסה, את דף השבת ואת האתר, אחד אחד", "Fix the board at the door, the bulletin and the website, one by one", "משנים פעם אחת. המסך, האתר ודף השבת מתעדכנים מיד", "Change it once. The screen, the website and the bulletin update at once"],
    ["דמי חבר וחובות", "Dues and balances", "מעטפות, צ׳קים ורשימה של מי שילם ומי עוד לא", "Envelopes, cheques and a list of who has paid and who hasn't", "לכל מתפלל חשבון בטלפון. הוא משלם בכרטיס, והתשלום נרשם מעצמו", "Every member has an account on their phone. They pay by card and it records itself"],
    ["נדרי שבת", "Shabbat nedarim", "מחברת, ובמוצאי שבת מנסים להיזכר מי נדר וכמה", "A notebook, and on Motzei Shabbat trying to recall who pledged what", "טבלה אחת ושמירה אחת. כל נדר נכנס לחשבון של המתפלל", "One table, one save. Each neder goes onto the member's account"],
    ["הודעות ואירועים", "Announcements and events", "מדפיסים פלייר, תולים על הלוח ומקווים שכולם ראו", "Print a flyer, pin it to the board and hope everyone saw it", "מפרסמים פעם אחת. ההודעה עולה למסך בתאריכים שבחרתם, והמתפללים מקבלים התראה", "Post it once. It goes on the screen on the dates you choose, and members get a notification"],
    ["יארצייטים", "Yahrzeits", "כרטיס עם תאריכים, שצריך לזכור להוציא כל שנה", "A card of dates that someone has to remember every year", "המשפחה מבקשת מהחשבון, הגבאי מאשר, והמסך מציג בשבוע הנכון בכל שנה", "The family asks from their account, the gabbai approves, and the screen shows it in its week every year"],
    ["חילופי גבאים", "A new gabbai", "הכל בראש של הגבאי, ובמגירה שלו", "It is all in the gabbai's head, and in his drawer", "הרשאה לכל גבאי, יומן של כל פעולה, וגיבוי מלא כל לילה", "Access for each gabbai, a log of every action, and a full backup every night"]
  ];

  var STEPS = [
    ["מבקשים הדגמה", "Ask for a demo", "ממלאים טופס קצר או מתקשרים, ומספרים לנו מעט על הקהילה ומה חשוב לכם.", "Fill in a short form or call, and tell us a little about your community and what matters to you."],
    ["רואים אותה עם השם שלכם", "See it with your name", "אנחנו מכינים הדגמה אישית בשם ובעיצוב של בית הכנסת שלכם, והצעה למנוי חודשי.", "We prepare a personal demo in your shul's name and design, and a monthly subscription proposal."],
    ["מקבלים מערכת משלכם", "Get a system of your own", "לוגו, צבעים, שפה, זמני תפילה ומניינים, מסכים והרשאות: הכל מוגדר לפי הדרך שבה בית הכנסת שלכם עובד.", "Logo, colors, language, davening times and minyanim, screens and permissions: all set up the way your shul works."]
  ];

  var FAQ = [
    ["כמה זה עולה?", "What does it cost?", "המערכת ניתנת במנוי חודשי. ההצעה נקבעת לפי מה שבית הכנסת שלכם צריך, ולכן היא נשלחת יחד עם ההדגמה האישית. בקשת ההדגמה לא מחייבת לכלום.", "The system is a monthly subscription. The proposal depends on what your shul needs, so it comes together with the personal demo. Asking for a demo commits you to nothing."],
    ["ההדגמה באתר היא המערכת האמיתית?", "Is the demo on this site the real system?", "כן. אלה המסכים של המערכת עצמה, עם קהילה ונתונים בדויים, ואפשר ללחוץ על הכל בלי לקלקל. שלושה דברים קיימים במערכת המלאה ולא מודגמים כאן: אפליקציה לגבאי בטלפון אנדרואיד, הדפסה במדפסת של בית הכנסת מכל מקום, ושליטה מרחוק במסך.", "Yes. These are the screens of the system itself, with a fictional congregation and data, and you can press anything without breaking it. Three things exist in the full system and are not shown here: a gabbai app for Android phones, printing on the shul's printer from anywhere, and remote control of the screen."],
    ["מה קורה עם המסך בשבת?", "What happens to the screen on Shabbat?", "בהדלקת נרות המסך עובר לבד למצב שבת ונשאר כך עד צאת השבת. ההודעות יורדות ממנו, וזמני השבת מוצגים כבר מיום חמישי בצהריים. אף אחד לא צריך לגעת בו.", "At candle lighting the screen switches to Shabbat mode on its own and stays that way until Shabbat ends. Announcements leave it, and the Shabbat times show from Thursday noon. Nobody has to touch it."],
    ["אפשר להתאים את המערכת לבית הכנסת שלנו?", "Can it be fitted to our shul?", "כן. הלוגו, הצבעים, הגופנים, השפה וכל מילה באתר, במסך ובדף השבת נקבעים בזהות שלכם, וכך גם סוגי החיובים והנדרים והרשאות הגבאים. היקף ההתאמה נקבע יחד איתכם לפני תחילת העבודה. פיתוח של יכולות חדשות לגמרי אינו כלול אוטומטית.", "Yes. The logo, colors, fonts, language and every word on the website, the screen and the bulletin are set in your identity, and so are the charge and neder types and the gabbaim's permissions. The scope is agreed with you before work begins. Developing entirely new capabilities is not automatically included."],
    ["איך המתפללים משלמים ותורמים?", "How do members pay and donate?", "מתפלל משלם את היתרה שלו בכרטיס אשראי מתוך החשבון, והתשלום נרשם מעצמו. באתר יש טופס תרומה בכרטיס, ב-Apple Pay וב-Google Pay, ועל המסך באולם מוצג קוד QR לתרומה.", "A member pays their balance by card from their account, and the payment records itself. The website has a donation form for card, Apple Pay and Google Pay, and the shul screen shows a donation QR code."],
    ["מי רואה את הנתונים הכספיים?", "Who can see the financial data?", "רק מי שקיבל הרשאה לכך. הכניסה היא עם חשבון Google, והמנהל הראשי קובע לכל גבאי מה פתוח בפניו: כספים, תוכן וזמנים, או שניהם. מתפלל רואה רק את החשבון שלו.", "Only those given access. Sign-in is with a Google account, and the administrator decides what each gabbai can open: finances, content and times, or both. A member sees only their own account."],
    ["המערכת בעברית או באנגלית?", "Is it in Hebrew or English?", "בשתיהן. כל מסך, האתר, המסך באולם ודף השבת זמינים בעברית ובאנגלית.", "Both. Every screen, the website, the shul screen and the Shabbat bulletin are available in Hebrew and English."]
  ];

  var TRY = [
    { role: "super", dest: "#/gabbai", h: ["כגבאי", "As the gabbai"], p: ["לוח הבקרה: תשלומים, נדרים, זמני תפילה והמסך", "The dashboard: payments, nedarim, davening times and the screen"] },
    { role: "member", dest: "#/me", h: ["כמתפלל", "As a member"], p: ["החשבון בטלפון: יתרה, תשלום בכרטיס ויארצייטים", "The phone account: balance, paying by card and yahrzeits"] },
    { role: "", dest: "#/tv", h: ["המסך באולם", "The shul screen"], p: ["במסך מלא, כמו שהוא תלוי בבית הכנסת", "Full screen, as it hangs in the shul"] }
  ];
  var FACTS = [["עברית ואנגלית", "Hebrew and English", "בכל מסך", "on every screen"], ["מצב שבת", "Shabbat mode", "המסך עובר אליו לבד", "the screen switches on its own"], ["גיבוי מלא", "A full backup", "נשמר כל לילה", "kept every night"], ["בעיצוב שלכם", "In your design", "לוגו, צבעים ושם", "logo, colors and name"]];

  UI.route("/", {
    layout: "xp", live: false, title: function () { return L("מערכת לניהול בית הכנסת", "Shul management software"); },
    render: function (app, arg, params) {
      if (cleanup) cleanup();
      params = params || {};
      /* older links into the drawer */
      if (params.open) { location.replace(location.pathname + location.search + "#/drawer?open=" + encodeURIComponent(params.open)); return; }
      document.body.classList.add("pg-mk");
      var timers = [];

      app.innerHTML = '<div class="mk" id="top">' + header("home") +

        /* hero */
        '<section class="mk-hero"><div class="mk-wrap mk-hero-grid"><div class="mk-hero-copy">' +
        "<h1>" + L("כל בית הכנסת, במערכת אחת", "Your whole shul, in one system") + "</h1>" +
        '<p class="mk-lead">' + L("המסך באולם, זמני התפילה, דף השבת, התרומות, הנדרים והחשבון של כל מתפלל. הגבאי מעדכן פעם אחת, וכל השאר מתעדכן לבד.", "The screen in the shul, davening times, the Shabbat bulletin, donations, nedarim and every member's account. The gabbai updates it once, and everything else follows.") + "</p>" +
        '<div class="mk-cta-row"><a class="mk-btn gold lg" href="#/proposal">' + L("בקשת הדגמה אישית", "Request a personal demo") + '</a><a class="mk-btn line lg" href="#/gabbai" data-enter>' + L("לנסות את המערכת עכשיו", "Try the system now") + " " + arrow() + "</a></div>" +
        '<p class="mk-hero-note">' + L("ההדגמה פתוחה, בלי הרשמה. הנתונים בדויים, המערכת אמיתית.", "The demo is open, no sign-up. The data is fictional, the system is real.") + "</p></div>" +
        '<div class="mk-hero-vis" aria-hidden="true">' + X.tvset(X.frame("#/tv?preview=1&clock=" + MOMENTS[0][0], 1920, 1080, "", L("המסך באולם", "The shul screen"))) + '<div class="mk-hero-phone">' + X.phone(X.frame("#/me?frame=1&as=member", 400, 860, "", L("חשבון המתפלל", "Member account"))) + "</div></div></div>" +
        '<div class="mk-wrap"><ul class="mk-facts">' + FACTS.map(function (f) { return "<li><b>" + L(f[0], f[1]) + "</b><span>" + L(f[2], f[3]) + "</span></li>"; }).join("") + "</ul></div></section>" +

        /* what's inside */
        '<section class="mk-sec" id="features"><div class="mk-wrap"><div class="mk-sec-head"><h2>' + L("מה יש במערכת", "What's in the system") + "</h2><p>" + L("שישה חלקים שעובדים יחד. בחרו אחד וראו אותו פועל: אלה המסכים של המערכת עצמה, לא תמונות.", "Six parts that work together. Pick one and watch it run: these are the system's own screens, not pictures.") + "</p></div>" +
        '<div class="mk-feat"><div class="mk-feat-list" id="mkFeatList">' + FEATURES.map(function (f, i) {
          return '<div class="mk-feat-item' + (i === 0 ? " on" : "") + '" data-i="' + i + '"><button type="button" class="mk-feat-tab" aria-expanded="' + (i === 0) + '"><span class="mk-feat-n">' + (i + 1) + "</span><span>" + L(f.n[0], f.n[1]) + '</span><i aria-hidden="true"></i></button>' +
            '<div class="mk-feat-body"><h3>' + L(f.h[0], f.h[1]) + "</h3><p>" + L(f.p[0], f.p[1]) + "</p><ul>" + f.b.map(function (b) { return "<li>" + CHECK + "<span>" + L(b[0], b[1]) + "</span></li>"; }).join("") + '</ul><div class="mk-feat-slot"></div><a class="mk-link" href="' + f.dest + '"' + (f.role ? ' data-role="' + f.role + '"' : "") + ">" + L(f.c[0], f.c[1]) + " " + arrow() + "</a></div></div>";
        }).join("") + '</div><div class="mk-feat-stage" id="mkStage"><div class="mk-vis" id="mkVis"></div></div></div></div></section>' +

        /* what it replaces */
        '<section class="mk-sec mk-stone" id="compare"><div class="mk-wrap"><div class="mk-sec-head"><h2>' + L("מה המערכת מחליפה", "What the system replaces") + "</h2><p>" + L("פתקים, מעטפות, מחברת נדרים וכל מה שהגבאי זוכר בעל פה.", "Slips of paper, envelopes, the nedarim notebook and everything the gabbai keeps in his head.") + "</p></div>" +
        '<div class="mk-cmp" role="table"><div class="mk-cmp-h" role="row"><span role="columnheader"></span><span role="columnheader">' + L("היום", "Today") + '</span><span role="columnheader">' + L("עם המערכת", "With the system") + "</span></div>" +
        COMPARE.map(function (c) { return '<div class="mk-cmp-r" role="row"><b role="rowheader">' + L(c[0], c[1]) + '</b><span role="cell" data-l="' + L("היום", "Today") + '">' + L(c[2], c[3]) + '</span><span role="cell" class="mk-cmp-yes" data-l="' + L("עם המערכת", "With the system") + '">' + CHECK + "<span>" + L(c[4], c[5]) + "</span></span></div>"; }).join("") + "</div>" +
        '<a class="mk-drawer" href="#/drawer"><img src="img/drawer.jpg" alt="" loading="lazy" width="960" height="560"><span><b>' + L("המגירה של הגבאי", "The gabbai's drawer") + "</b><span>" + L("אותו סיפור, בדרך אחרת: מגירה עם שבעה דברים שכל גבאי מכיר. מרימים אחד, ורואים מה המערכת עושה במקומו.", "The same story told another way: a drawer of seven things every gabbai knows. Pick one up and see what the system does instead.") + '</span><em>' + L("לפתוח את המגירה", "Open the drawer") + " " + arrow() + "</em></span></a></div></section>" +

        /* getting started */
        '<section class="mk-sec" id="start"><div class="mk-wrap"><div class="mk-sec-head"><h2>' + L("איך מתחילים", "Getting started") + "</h2><p>" + L("שלושה שלבים, מהשיחה הראשונה ועד מערכת בשם של בית הכנסת שלכם.", "Three steps, from the first conversation to a system in your shul's name.") + "</p></div>" +
        '<ol class="mk-steps">' + STEPS.map(function (s, i) { return '<li><span class="mk-step-n">' + (i + 1) + "</span><h3>" + L(s[0], s[1]) + "</h3><p>" + L(s[2], s[3]) + "</p></li>"; }).join("") + "</ol>" +
        '<div class="mk-cta-row center"><a class="mk-btn lg" href="#/proposal">' + L("בקשת הדגמה אישית", "Request a personal demo") + "</a>" + tel("mk-btn line-dark lg") + "</div></div></section>" +

        /* make it yours */
        '<section class="mk-sec mk-stone" id="looks"><div class="mk-wrap mk-looks"><div class="mk-looks-copy"><h2>' + L("ייראה כמו בית הכנסת שלכם", "It will look like your shul") + "</h2><p>" + L("הקלידו את שם בית הכנסת ובחרו כיוון עיצובי. האתר והחשבון של המתפלל משתנים מול העיניים.", "Type your shul's name and pick a design direction. The website and the member account change in front of you.") + "</p>" + X.personalHtml() +
        '<p class="mk-small">' + L("ארבעת העיצובים הם דוגמאות בלבד. כל בית כנסת מקבל עיצוב משלו, והמערכת עצמה זהה בכל עיצוב.", "The four designs are only examples. Each shul gets a design of its own, and the system itself is the same in every design.") + "</p></div>" +
        '<div class="mk-looks-vis">' + X.browser("www." + X.slug() + ".org", X.frame("#/site?frame=1&as=visitor", 1280, 860, "", L("אתר בית הכנסת", "Shul website")).replace(' src="', ' data-src="')) + '<div class="mk-looks-phone">' + X.phone(X.frame("#/me?frame=1&as=member", 400, 860, "", L("חשבון המתפלל", "Member account")).replace(' src="', ' data-src="')) + "</div></div></div></section>" +

        /* try it */
        '<section class="mk-sec" id="try"><div class="mk-wrap"><div class="mk-sec-head"><h2>' + L("נסו בעצמכם, עכשיו", "Try it yourself, now") + "</h2><p>" + L("ההדגמה פתוחה בלי הרשמה, עם קהילה לדוגמה. אפשר ללחוץ על הכל; אי אפשר לקלקל כלום.", "The demo is open with no sign-up, on a sample community. Press anything; you can't break it.") + "</p></div>" +
        '<div class="mk-try">' + TRY.map(function (t) { return '<a href="' + t.dest + '"' + (t.role ? ' data-role="' + t.role + '"' : "") + "><b>" + L(t.h[0], t.h[1]) + "</b><span>" + L(t.p[0], t.p[1]) + "</span><em>" + L("כניסה", "Enter") + " " + arrow() + "</em></a>"; }).join("") + "</div></div></section>" +

        /* questions */
        '<section class="mk-sec mk-stone" id="faq"><div class="mk-wrap mk-faq-grid"><div class="mk-sec-head"><h2>' + L("שאלות נפוצות", "Common questions") + "</h2><p>" + L("לא מצאתם תשובה? התקשרו או כתבו לנו.", "Didn't find your answer? Call or write to us.") + '</p><div class="mk-faq-contact">' + tel() + mail() + "</div></div>" +
        '<div class="mk-faq">' + FAQ.map(function (q, i) { return "<details" + (i === 0 ? " open" : "") + "><summary>" + L(q[0], q[1]) + "</summary><p>" + L(q[2], q[3]) + "</p></details>"; }).join("") + "</div></div></section>" +

        /* closing */
        '<section class="mk-close"><div class="mk-wrap"><h2>' + L("רוצים לראות אותה עם השם של בית הכנסת שלכם?", "Want to see it with your shul's name on it?") + "</h2><p>" + L("נכין לכם הדגמה אישית, בשם ובעיצוב שלכם, והצעה למנוי חודשי.", "We'll prepare a personal demo for you, in your name and design, and a monthly subscription proposal.") + "</p>" +
        '<div class="mk-cta-row center"><a class="mk-btn gold lg" href="#/proposal">' + L("בקשת הדגמה אישית", "Request a personal demo") + "</a>" + tel("mk-btn line lg") + '</div><p class="mk-close-mail">' + L("או באימייל: ", "Or by email: ") + '<a href="mailto:' + SALES.email + '"><bdi dir="ltr">' + esc(SALES.email) + "</bdi></a></p></div></section>" +
        footer() +
        '<div class="mk-sticky" id="mkSticky"><a class="mk-btn gold" href="#/proposal">' + L("בקשת הדגמה אישית", "Request a personal demo") + '</a><a class="mk-btn line" href="tel:' + SALES.tel + '" aria-label="' + L("התקשרו", "Call") + '">' + X.ic("phone", 18) + "</a></div></div>";

      var head = app.querySelector("#mkHead");
      function goTo(id) {
        if (id === "dwLooks") id = "looks"; if (id === "dwTry") id = "try";
        var el = id === "top" ? app.querySelector("#top") : app.querySelector("#" + id);
        if (!el) return;
        var y = id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY - head.offsetHeight + 1;
        window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
      }
      bindChrome(app, goTo);

      /* ----- the feature explorer: one live frame at a time ----- */
      var vis = app.querySelector("#mkVis"), stage = app.querySelector("#mkStage"), items = app.querySelectorAll(".mk-feat-item"), cur = -1;
      var narrow = window.matchMedia("(max-width: 940px)");
      function place() { var slot = narrow.matches ? items[cur].querySelector(".mk-feat-slot") : stage; if (vis.parentNode !== slot) { slot.appendChild(vis); X.fitFrames(vis); } }
      function show(i, user) {
        if (i === cur) return;
        cur = i; var f = FEATURES[i];
        items.forEach(function (it, k) { it.classList.toggle("on", k === i); it.querySelector(".mk-feat-tab").setAttribute("aria-expanded", k === i); });
        vis.className = "mk-vis v-" + f.id; vis.innerHTML = visual(f);
        place(); X.fitFrames(vis);
        var ifr = vis.querySelector("iframe");
        vis.querySelectorAll("[data-mom]").forEach(function (b) {
          b.addEventListener("click", function () {
            vis.querySelectorAll("[data-mom]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
            ifr.src = "index.html#/tv?preview=1&clock=" + b.getAttribute("data-mom") + "&r=" + Date.now();
          });
        });
        var mnT = vis.querySelector("#mkMn"), note = vis.querySelector("#mkMnNote");
        vis.querySelectorAll("[data-mn]").forEach(function (b) {
          b.addEventListener("click", function () {
            var p = mincha(), t = window.SHUL_TV.prayerTime(p) + +b.getAttribute("data-mn");
            if (t < 12 * 60 || t > 20 * 60) return;
            p.time = t; delete p.rel;
            S.log("times", "עדכן זמן תפילה: " + p.he + " " + S.hm(t, false), "Updated davening time: " + p.en + " " + S.hm(t, false));
            S.save();
            mnT.textContent = t12(t); UI.flash(mnT);
            note.textContent = L("נשמר. המסך כבר מציג ", "Saved. The screen already shows ") + S.N(p) + " " + t12(t); note.classList.add("ok");
          });
        });
        if (user && narrow.matches) { var r = items[i].getBoundingClientRect(); if (r.top < head.offsetHeight) window.scrollTo({ top: r.top + window.scrollY - head.offsetHeight - 8, behavior: "auto" }); }
      }
      items.forEach(function (it, i) { it.querySelector(".mk-feat-tab").addEventListener("click", function () { show(i, true); }); });
      var onNarrow = function () { if (cur >= 0) place(); };
      if (narrow.addEventListener) narrow.addEventListener("change", onNarrow); else narrow.addListener(onNarrow);
      show(0);
      X.fitFrames(app.querySelector(".mk-hero-vis"));

      /* ----- make it yours ----- */
      var looks = app.querySelector("#looks"), lkFrames = looks.querySelectorAll("iframe"), lastTheme = S.prefs.theme;
      function loadLooks() { lkFrames.forEach(function (f) { if (f.getAttribute("data-src")) { f.src = f.getAttribute("data-src"); f.removeAttribute("data-src"); } }); }
      var lio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { loadLooks(); lio.disconnect(); } }, { rootMargin: "600px 0px" }) : null;
      if (lio) lio.observe(looks); else loadLooks();
      X.fitFrames(looks);
      X.bindPersonal(looks, function () {
        if (S.prefs.theme === lastTheme) return;
        lastTheme = S.prefs.theme;
        lkFrames.forEach(function (f) { var u = f.getAttribute("src"); if (u) f.src = u.replace(/&t=\w+/, "") + "&t=" + lastTheme; });
      });

      /* ----- header shadow, the current section, the phone's bottom bar ----- */
      var sticky = app.querySelector("#mkSticky"), closing = app.querySelector(".mk-close"), navLinks = app.querySelectorAll("#mkNav [data-to]"), ticking = false;
      function onScroll() {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var y = window.scrollY, mid = y + window.innerHeight * .35, on = "";
          head.classList.toggle("scrolled", y > 8);
          NAV.forEach(function (n) { var el = app.querySelector("#" + n[0]); if (el && el.offsetTop <= mid) on = n[0]; });
          navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-to") === on); });
          sticky.classList.toggle("on", y > 520 && closing.getBoundingClientRect().top > window.innerHeight);
        });
      }
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

      if (params.to) {
        try { history.replaceState(null, "", location.pathname + location.search + "#/"); } catch (e) {}
        timers.push(setTimeout(function () { goTo(params.to); }, 150));
      }

      function stop() {
        timers.forEach(clearTimeout); if (lio) lio.disconnect();
        window.removeEventListener("scroll", onScroll); window.removeEventListener("hashchange", onHash);
        if (narrow.removeEventListener) narrow.removeEventListener("change", onNarrow); else narrow.removeListener(onNarrow);
        document.body.classList.remove("pg-mk"); cleanup = null;
      }
      function onHash() { var h = (location.hash || "#/").split("?")[0]; if (h !== "#/" && h !== "#" && h !== "") stop(); }
      window.addEventListener("hashchange", onHash);
      cleanup = stop;
    }
  });

  /* ---------- the request for a personal demo ---------- */
  var INTEREST = [["tv", "המסך באולם", "The shul screen"], ["content", "זמני תפילה ודף שבת", "Davening times and the bulletin"], ["finance", "כספים ונדרים", "Finance and nedarim"], ["members", "חשבון למתפללים", "Member accounts"], ["site", "אתר בית הכנסת", "The shul website"], ["donate", "תרומות בכרטיס ובארנק דיגיטלי", "Card and wallet donations"]];
  UI.route("/proposal", {
    layout: "xp", live: false, title: function () { return L("בקשת הדגמה", "Request a demo"); },
    render: function (app) {
      if (cleanup) cleanup();
      document.body.classList.add("pg-mk");
      var th = UI.THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0];
      app.innerHTML = '<div class="mk mk-prop">' + header("proposal") +
        '<section class="mk-prop-top"><div class="mk-wrap"><h1>' + L("בקשת הדגמה אישית", "Request a personal demo") + "</h1><p>" + L("ספרו לנו מעט על הקהילה. נכין הדגמה בשם ובעיצוב של בית הכנסת שלכם, והצעה למנוי חודשי. הבקשה לא מחייבת לכלום.", "Tell us a little about your community. We'll prepare a demo in your shul's name and design, and a monthly subscription proposal. The request commits you to nothing.") + "</p></div></section>" +
        '<section class="mk-prop-body"><div class="mk-wrap mk-prop-grid">' +
        '<form class="mk-form" id="propF" novalidate><div class="mk-form-2"><label class="mk-f"><span>' + L("שם מלא", "Full name") + '</span><input name="name" required autocomplete="name"></label><label class="mk-f"><span>' + L("תפקיד בבית הכנסת", "Role at the shul") + '</span><select name="role"><option>' + L("גבאי", "Gabbai") + "</option><option>" + L("נשיא", "President") + "</option><option>" + L("רב", "Rabbi") + "</option><option>" + L("חבר הנהלה", "Board member") + "</option><option>" + L("אחר", "Other") + '</option></select></label><label class="mk-f"><span>' + L("אימייל", "Email") + '</span><input name="email" type="email" dir="ltr" required autocomplete="email"></label><label class="mk-f"><span>' + L("טלפון", "Phone") + '</span><input name="phone" type="tel" dir="ltr" autocomplete="tel"></label></div>' +
        '<label class="mk-f"><span>' + L("שם בית הכנסת", "Shul name") + '</span><input name="shul" value="' + esc(S.N(S.db.shul)) + '"></label><fieldset class="mk-f mk-ints"><legend>' + L("מה חשוב לכם במיוחד", "What matters most to you") + "</legend><div>" + INTEREST.map(function (x, i) { return '<label class="mk-chk"><input type="checkbox" name="int" value="' + i + '"' + (i < 4 ? " checked" : "") + "><span>" + L(x[1], x[2]) + "</span></label>"; }).join("") + '</div></fieldset><label class="mk-f"><span>' + L("הערות (לא חובה)", "Notes (optional)") + '</span><textarea name="notes" rows="3"></textarea></label>' +
        '<button class="mk-btn lg wide">' + L("שליחת הבקשה", "Send the request") + '</button><p class="mk-small">' + L("הבקשה נפתחת באפליקציית האימייל שלכם, מוכנה לשליחה אל ", "The request opens in your email app, ready to send to ") + '<bdi dir="ltr">' + esc(SALES.email) + "</bdi>" + L(". האתר עצמו לא שולח דבר.", ". The site itself sends nothing.") + '</p><div id="propOut"></div></form>' +
        '<aside class="mk-prop-side"><div class="mk-side-box"><h2>' + L("מעדיפים לדבר?", "Rather talk?") + "</h2>" + tel("mk-side-tel") + mail("mk-side-mail") + "</div>" +
        '<div class="mk-side-box"><h2>' + L("מה קורה אחרי הבקשה", "What happens next") + '</h2><ol class="mk-side-steps">' + STEPS.slice(1).map(function (s) { return "<li><b>" + L(s[0], s[1]) + "</b><span>" + L(s[2], s[3]) + "</span></li>"; }).join("") + "</ol></div>" +
        '<div class="mk-side-box mk-yours"><h2>' + L("ההדגמה שלכם כרגע", "Your demo right now") + "</h2><b>" + esc(S.N(S.db.shul)) + '</b><span><i style="background:' + th.c + '"></i>' + L("עיצוב: ", "Design: ") + esc(S.N(th)) + '</span><a class="mk-link" href="#/?to=looks">' + L("לשנות שם ועיצוב", "Change the name and design") + " " + arrow() + "</a></div></aside></div></section>" + footer() + "</div>";
      bindChrome(app, null);
      app.querySelector("#propF").addEventListener("submit", function (e) {
        e.preventDefault(); var f = e.target;
        if (!f.name.value.trim() || !/^\S+@\S+\.\S+$/.test(f.email.value.trim())) { UI.toast(L("נא למלא שם ואימייל", "Please fill in name and email")); (f.name.value.trim() ? f.email : f.name).focus(); return; }
        var ints = Array.prototype.slice.call(f.querySelectorAll("[name=int]:checked")).map(function (c) { return INTEREST[+c.value][2]; });
        var txt = "Shul System: request for a personal demonstration and subscription proposal\n\nShul: " + f.shul.value.trim() + "\nContact: " + f.name.value.trim() + " (" + f.role.value + ")\nEmail: " + f.email.value.trim() + (f.phone.value.trim() ? "\nPhone: " + f.phone.value.trim() : "") +
          "\nDesign direction: " + th.en + (S.prefs.brand ? ", brand color " + S.prefs.brand : "") + "\nInterested in: " + (ints.join(", ") || "Not specified") + (f.notes.value.trim() ? "\nNotes: " + f.notes.value.trim() : "");
        var out = app.querySelector("#propOut");
        var href = "mailto:" + SALES.email + "?subject=" + encodeURIComponent("Demo request: " + f.shul.value.trim()) + "&body=" + encodeURIComponent(txt);
        out.innerHTML = '<div class="mk-done"><b>' + L("הבקשה מוכנה", "Your request is ready") + '</b><pre dir="ltr">' + esc(txt) + '</pre><div class="mk-cta-row"><a class="mk-btn" id="propMail" href="' + esc(href) + '">' + X.ic("mail", 16) + L("פתיחה באימייל", "Open in email") + '</a><button type="button" class="mk-btn line-dark" id="propCopy">' + X.ic("doc", 16) + L("העתקה", "Copy") + '</button></div><p class="mk-small">' + L("לא נפתח אימייל? העתיקו ושלחו אל ", "No email app opened? Copy it and send it to ") + '<bdi dir="ltr">' + esc(SALES.email) + "</bdi>" + L(", או התקשרו ", ", or call ") + '<bdi dir="ltr">' + esc(SALES.phone) + "</bdi>.</p></div>";
        location.href = href;
        out.querySelector("#propCopy").addEventListener("click", function () {
          var done = function () { UI.toast(L("הועתק", "Copied")); };
          if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () { selectPre(); }); else selectPre();
          function selectPre() { var r = document.createRange(); r.selectNodeContents(out.querySelector("pre")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); UI.toast(L("הטקסט סומן. העתיקו אותו.", "Text selected. Copy it.")); }
        });
        out.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      });
      function onHash() { if ((location.hash || "").split("?")[0] !== "#/proposal") { window.removeEventListener("hashchange", onHash); document.body.classList.remove("pg-mk"); cleanup = null; } }
      window.addEventListener("hashchange", onHash);
      cleanup = function () { window.removeEventListener("hashchange", onHash); document.body.classList.remove("pg-mk"); cleanup = null; };
    }
  });
})();
