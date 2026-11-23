/* Shul System sales demo | the sales experience around the product.
   #/                  the board at the entrance (js/board.js)
   #/tour              platform tour with the live, personalizable product composition
   #/showcase/ledger   one ledger, two views: finance gabbai and member, side by side
   #/showcase/tv       from the editor to the shul screen
   #/showcase/roles    what each role can do, and entering as any of them
   #/showcase/design   the same shul in different designs
   #/screen            the TV showroom
   #/proposal          a personalized request for a demonstration and pricing proposal
   Everything shown is the real demo product running on fictional data. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, L = S.L, esc = S.esc, I = UI.I;
  /* The sales contact, verified by the owner. The proposal opens the visitor's own email app;
     the demo itself sends nothing. */
  var SALES = UI.SALES;
  function telBtn(cls) { return '<a class="xp-btn ' + (cls || "") + '" href="tel:' + SALES.tel + '">' + ic("phone", 17) + L("התקשרו ", "Call ") + '<bdi dir="ltr">' + esc(SALES.phone) + "</bdi></a>"; }
  /* the same closing band on every showcase */
  function ctaBand() {
    return '<section class="cta-band"><div class="xp-wrap"><div class="cb-in"><div class="cb-copy"><span class="xp-k">' + L("הצעד הבא", "Next step") + "</span><h2>" + L("לראות את זה עובד בבית הכנסת שלכם", "See this running in your shul") + '</h2></div><div class="cb-act"><a class="cta-demo lg" href="#/proposal">' + I.sparkle.replace("<svg", '<svg width="18" height="18"') + "<span>" + L("בקשת הדגמה", "Request a demo") + "</span></a>" + telBtn("ghost cb-tel") + "</div></div></div></section>";
  }

  function ic(n, s) { return I[n].replace("<svg", '<svg width="' + (s || 20) + '" height="' + (s || 20) + '"'); }
  var ARROW = '<svg class="arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- live product frames: the real demo running inside scaled windows ---------- */
  function frame(src, w, h, cls, label) {
    return '<div class="sf ' + (cls || "") + '" data-w="' + w + '" data-h="' + h + '" style="aspect-ratio:' + w + "/" + h + '"><iframe src="index.html' + src + '" title="' + esc(label || "") + '" tabindex="-1" aria-hidden="true" style="width:' + w + "px;height:" + h + 'px"></iframe></div>';
  }
  var ro = window.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (e) { fitOne(e.target); }); }) : null;
  function fitOne(el) { var f = el.querySelector("iframe"); if (!f) return; f.style.transform = "scale(" + el.clientWidth / +el.getAttribute("data-w") + ")"; }
  function fitFrames(root) { root.querySelectorAll(".sf").forEach(function (el) { fitOne(el); if (ro) ro.observe(el); }); }
  function browser(url, inner, cls) {
    return '<div class="win ' + (cls || "") + '"><div class="win-bar"><i></i><i></i><i></i><span dir="ltr">' + esc(url) + "</span></div>" + inner + "</div>";
  }
  function phone(inner, cls) { return '<div class="phone ' + (cls || "") + '"><div class="phone-notch"></div>' + inner + "</div>"; }
  function tvset(inner, cls) { return '<div class="tvset ' + (cls || "") + '"><div class="tvset-screen">' + inner + '</div><div class="tvset-stand"></div></div>'; }
  function slug() { return (S.db.shul.en || "shul").toLowerCase().replace(/[^a-z0-9]+/g, "") || "shul"; }

  function xpNav(sub) {
    return '<header class="xp-nav' + (sub ? " sub" : "") + '"><div class="xp-wrap"><a class="xp-mark" href="#/"><span class="xp-logo">' + UI.logo() + "</span><span>Shul System</span></a>" +
      (sub ? '<span class="xp-crumb">' + sub + "</span>" : '<nav class="xp-links"><a href="#perspectives">' + L("פרספקטיבות", "Perspectives") + '</a><a href="#see">' + L("לראות בפעולה", "See it work") + '</a><a href="#daily">' + L("עבודה שוטפת", "Daily operations") + '</a><a href="#custom">' + L("התאמה אישית", "Customization") + "</a></nav>") +
      '<span class="xp-sp"></span><div class="xp-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button data-xl="he" aria-pressed="' + (S.prefs.lang === "he") + '">עב</button><button data-xl="en" aria-pressed="' + (S.prefs.lang === "en") + '">EN</button></div>' +
      (sub ? '<a class="xp-btn ghost" href="#/tour">' + L("סיור במערכת", "Platform tour") + "</a>" : "") + UI.ctaDemo("xp-cta") + "</div></header>";
  }
  function bindNav(app) {
    app.querySelectorAll("[data-xl]").forEach(function (b) { b.addEventListener("click", function () { UI.setLang(b.getAttribute("data-xl")); }); });
    app.querySelectorAll('.xp-links a[href^="#"]').forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); var t = app.querySelector(a.getAttribute("href")); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }); });
  }
  function go(role, dest) { UI.setRole(role, true, dest); }
  /* shared with the board at the entrance (js/board.js) */
  window.SHUL_XP = { frame: frame, fitFrames: fitFrames, browser: browser, phone: phone, tvset: tvset, slug: slug, telBtn: telBtn, go: go, ic: ic, ARROW: ARROW };

  /* ---------- personalization: name + design, reflected live everywhere ---------- */
  var sample = window.SHUL_SEED().shul;
  function personalHtml(compact) {
    var custom = S.db.shul.en !== sample.en;
    return '<div class="pz' + (compact ? " compact" : "") + '" id="pz"><div class="pz-row"><label class="pz-field"><span>' + L("שם בית הכנסת שלכם", "Your shul's name") + '</span><input id="pzName" maxlength="48" autocomplete="off" placeholder="' + L("לדוגמה: קהילת בית שלום", "e.g. Congregation Beth Shalom") + '" value="' + (custom ? esc(S.db.shul.en) : "") + '"></label></div>' +
      '<div class="pz-designs" role="group" aria-label="' + L("כיוון עיצובי", "Design direction") + '">' + UI.THEMES.map(function (t) { return '<button type="button" class="pz-d" data-pz-theme="' + t.id + '" aria-pressed="' + (S.prefs.theme === t.id) + '"><span class="pz-sw" style="background:' + t.c + '"></span><span>' + esc(S.N(t)) + "</span></button>"; }).join("") + "</div>" +
      '<div class="pz-foot"><span class="pz-live"><i></i>' + L("כל מסך מתעדכן בזמן אמת", "Every screen updates live") + '</span><button type="button" class="pz-reset" id="pzReset"' + (custom ? "" : " hidden") + ">" + L("חזרה לשם לדוגמה", "Back to the sample name") + "</button></div></div>";
  }
  function bindPersonal(root, onChange) {
    var inp = root.querySelector("#pzName"), t = null;
    function apply(v) {
      v = v.trim();
      S.db.shul.he = v || sample.he; S.db.shul.en = v || sample.en; S.save();
      var r = root.querySelector("#pzReset"); if (r) r.hidden = !v;
      if (onChange) onChange();
    }
    if (inp) inp.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { apply(inp.value); }, 260); });
    var rs = root.querySelector("#pzReset"); if (rs) rs.addEventListener("click", function () { inp.value = ""; apply(""); });
    root.querySelectorAll("[data-pz-theme]").forEach(function (b) {
      b.addEventListener("click", function () { UI.setTheme(b.getAttribute("data-pz-theme"), true); root.querySelectorAll("[data-pz-theme]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); if (onChange) onChange(); });
    });
  }

  /* =================================================================== */
  /* ---------- #/ the platform overview ---------- */
  var PERSP = [
    { id: "site", he: "אתר בית הכנסת", en: "Website", role: "visitor", dest: "#/site", kind: "browser", src: "#/site?frame=1&as=visitor", w: 1280, h: 860,
      ttl: ["הפנים של הקהילה, לכל מבקר", "Your shul's public face"], pts: [["זמני השבת והדלקת נרות", "Shabbat times and candle lighting"], ["תרומה בכרטיס, Apple Pay ו-Google Pay", "Donations by card, Apple Pay and Google Pay"], ["בקשת הצטרפות שהגבאי מאשר", "Join requests the gabbai approves"], ["כל מילה ניתנת לעריכה בעברית ובאנגלית", "Every word editable in Hebrew and English"]] },
    { id: "member", he: "פורטל המתפלל", en: "Member portal", role: "member", dest: "#/me", kind: "phone", src: "#/me?frame=1&as=member", w: 400, h: 860,
      ttl: ["כל מתפלל, עם החשבון שלו", "Every member, their own account"], pts: [["יתרה והיסטוריה מלאה, מאותו יומן חשבונות", "Balance and full history from the same ledger"], ["תשלום היתרה בכרטיס, שנרשם מעצמו", "Pay the balance by card; it records itself"], ["יארצייטים של המשפחה, למסך אחרי אישור", "Family yahrzeits, on the screen after approval"], ["הודעות הקהילה", "Community announcements"]] },
    { id: "admin", he: "מערכת הגבאים", en: "Administration", role: "super", dest: "#/gabbai", kind: "browser", src: "#/gabbai?frame=1&as=super", w: 1360, h: 860,
      ttl: ["מרכז הניהול של בית הכנסת", "The shul's command center"], pts: [["תשלומים, חיובים, נדרי שבת ומי חייב", "Payments, charges, Shabbat nedarim and who owes"], ["מתפללים ובקשות הצטרפות", "Members and join requests"], ["תוכן המסך, זמני תפילה ודף השבת", "Screen content, davening times and the Shabbat bulletin"], ["הרשאות לכל גבאי, יומן פעילות וגיבוי לילי", "Permissions per gabbai, activity log, nightly backup"]] },
    { id: "tv", he: "מסך בית הכנסת", en: "Shul screen", role: null, dest: "#/screen", kind: "tv", src: "#/tv?preview=1", w: 1920, h: 1080,
      ttl: ["המסך שדולק כל הזמן באולם", "The always-on screen in the shul"], pts: [["זמני היום וזמני התפילות, תמיד מעודכנים", "Zmanim and davening times, always current"], ["מצב שבת: נרות, הקדשות, הזכרות ויארצייטים", "Shabbat mode: candles, dedications, hazkarot, yahrzeits"], ["ספירה לנץ ושורת הפרשה", "Netz countdown and the parasha line"], ["עמעום לילי ורענון מרחוק", "Night dimming and remote refresh"]] }
  ];
  function perspStage(p) {
    var f = frame(p.src, p.w, p.h, "", L(p.he, p.en));
    if (p.kind === "phone") return '<div class="ps-phone">' + phone(f) + "</div>";
    if (p.kind === "tv") return tvset(f, "ps-tv");
    return browser((p.id === "admin" ? "admin." : "www.") + slug() + ".org", f, "ps-win");
  }
  var SEE = [
    { href: "#top", n: "A", ic: "edit", he: "הופכים אותה לשלכם", en: "Make it yours", dhe: "מקלידים את שם בית הכנסת ובוחרים כיוון עיצובי. האתר, הפורטל, מערכת הגבאים והמסך מתעדכנים מיד.", den: "Type your shul's name and choose a design direction. The website, portal, administration and screen update at once." },
    { href: "#/showcase/ledger", n: "B", ic: "wallet", he: "יומן אחד, שתי נקודות מבט", en: "One ledger, two views", dhe: "הגבאי רושם חיוב, המתפלל רואה אותו ומשלם בכרטיס, והתשלום נרשם מעצמו. היתרה מתעדכנת מיד בשני הצדדים.", den: "The gabbai records a charge, the member sees it and pays by card, and the payment records itself. Both sides update at once." },
    { href: "#/showcase/tv", n: "C", ic: "tv", he: "מהעורך אל האולם", en: "From editor to shul", dhe: "עורכים הודעה, רואים תצוגה מקדימה על המסך, ומפרסמים. בשבת ההודעות לא מוצגות, כמו במערכת האמיתית.", den: "Edit an announcement, preview it on the screen, publish. On Shabbat announcements step aside, exactly as in the real system." },
    { href: "#/showcase/roles", n: "D", ic: "shield", he: "לכל תפקיד, המערכת שלו", en: "Every role, its own system", dhe: "מתפלל, גבאי כספים, גבאי תוכן ומנהל ראשי. כל אחד רואה רק את מה שמותר לו.", den: "Member, finance gabbai, content gabbai and administrator. Each sees only what they may use." },
    { href: "#/showcase/design", n: "E", ic: "palette", he: "אותו בית כנסת, עיצובים שונים", en: "Same shul, different designs", dhe: "משווים כיווני עיצוב על המוצר האמיתי, מהאתר ועד המסך.", den: "Compare design directions on the real product, from the website to the screen." }
  ];
  var DAILY = [
    ["finance", "#/finance/pay", "wallet", "רישום תשלום", "Record a payment", "מתפלל, סכום ואמצעי תשלום. יתרה לפני ואחרי, ביטול מיידי וקבלה.", "Member, amount, method. Balance before and after, instant undo, a receipt."],
    ["finance", "#/finance/nedarim", "list", "נדרי שבת במוצאי שבת", "Shabbat nedarim on Motzei Shabbat", "כל העליות בטבלה אחת ושמירה אחת. כל נדר הוא חיוב בכרטיס המתפלל.", "Every aliyah in one table and one save. Each neder becomes a charge on the member's card."],
    ["finance", "#/finance/inbox", "inbox", "תשלומים בכרטיס", "Card payments", "מגיעים מעצמם ומותאמים לפי אימייל. לחיצה אחת לרישום.", "Arrive on their own, matched by email. One tap to record."],
    ["finance", "#/finance/owes", "users", "מי חייב", "Who owes", "כל היתרות הפתוחות, מהגדולה לקטנה, עם טלפון ותשלום אחרון.", "Every open balance, largest first, with phone and last payment."],
    ["content", "#/gabbai/tv", "clock", "זמני תפילה", "Davening times", "שינוי שעה מופיע במסך תוך שנייה, בלי לרענן.", "A changed time is on the screen within a second, no refresh."],
    ["content", "#/gabbai/content", "megaphone", "תוכן המסך", "Screen content", "הודעות, מזל טוב, פליירים, הקדשות ויארצייטים, עם תאריכים וימים.", "Announcements, mazal tov, flyers, dedications and yahrzeits, with dates and days."],
    ["content", "#/gabbai/shabbat", "candle", "דף השבת", "The Shabbat bulletin", "נבנה לבד מזמני היום וזמני התפילה, מוכן להדפסה.", "Builds itself from the zmanim and davening times, ready to print."],
    ["super", "#/finance/members", "user", "מתפללים ובקשות הצטרפות", "Members and join requests", "אישור בלחיצה עם בחירת תפקיד, ואימייל ברוכים הבאים.", "Approve in one tap with a role, and a welcome email."],
    ["finance", "#/finance/more", "receipt", "מכתבי מס ודוח שנתי", "Tax letters and annual report", "מכתב לכל מתפלל, ודוח הכנסות לפי אמצעי תשלום.", "A letter per member, and income by payment method."],
    ["super", "#/admin", "shield", "הרשאות, יומן וגיבוי", "Permissions, log and backup", "תפקיד לכל גבאי, כל פעולה מתועדת, וגיבוי מלא כל לילה.", "A role per gabbai, every action logged, a full backup every night."]
  ];
  function tiersHtml() {
    var col = function (tag, cls, he, en, items) { return '<div class="tier ' + cls + '"><span class="tier-tag">' + tag + "</span><h3>" + L(he, en) + "</h3><ul>" + items.map(function (i) { return "<li>" + (i[2] ? '<a href="' + i[2] + '" data-go-role="' + (i[3] || "") + '">' + L(i[0], i[1]) + "</a>" : L(i[0], i[1])) + "</li>"; }).join("") + "</ul></div>"; };
    return '<div class="tiers">' +
      col(L("במערכת היום", "In the system today"), "t1", "מגדירים בעצמכם", "Configure it yourself", [["כל מילה בהמסך, בעברית ובאנגלית", "Every word on the screen, in Hebrew and English", "#/gabbai/tv", "content"], ["כל מילה בדף הבית של האתר", "Every word on the website's home page", "#/gabbai/landing", "super"], ["זמני תפילה, כולל ימים מסוימים", "Davening times, including specific weekdays", "#/gabbai/tv", "content"], ["מה מוצג במסך, מתי ובאילו ימים", "What the screen shows, when and on which days", "#/gabbai/content", "content"], ["בהירות המסך ורענון מרחוק", "Screen brightness and remote refresh", "#/gabbai/tv", "super"], ["שורות דף השבת", "The Shabbat bulletin's rows", "#/gabbai/shabbat", "content"], ["תפקיד והרשאות לכל גבאי", "A role and permissions for each gabbai", "#/admin", "super"]]) +
      col(L("בהתאמה אישית", "Made for you"), "t2", "מעוצב עבור בית הכנסת שלכם", "Designed for your shul", [["לוגו, צבעים וגופנים בזהות שלכם", "Your logo, colors and typography"], ["עיצוב האתר, הפורטל ומערכת הגבאים", "The design of the website, portal and administration"], ["מראה המסך באולם", "The look of the shul screen"], ["הטקסטים, הנוסח והמנהגים של הקהילה", "Your community's wording, nusach and minhagim"], ["התאמת התהליכים הקיימים לדרך העבודה שלכם", "Existing workflows set up the way you work"]]) +
      col(L("בהדגמה בלבד", "Demo only"), "t3", "פקדי ההדגמה", "Presentation controls", [["החלפת פרספקטיבה ותפקיד", "Switching perspective and role"], ["ארבעת העיצובים לדוגמה וצבע המותג", "The four example designs and brand color"], ["הקלדת שם בית הכנסת", "Typing your shul's name"], ["זמן ההדגמה ואיפוס", "Demo time and reset"]]) +
      '</div><p class="tiers-note">' + UI.scopeNote() + "</p>";
  }

  UI.route("/tour", {
    layout: "xp", live: false, title: function () { return L("סיור במערכת", "Platform tour"); },
    render: function (app) {
      var pTab = 0;
      app.innerHTML = '<div class="xp" id="top">' + xpNav() +
        '<section class="xp-hero"><div class="xp-glow"></div><div class="xp-wrap xp-hero-grid"><div class="xp-copy">' +
        '<div class="xp-eyebrow"><span></span>' + L("פלטפורמה לניהול בית הכנסת", "Shul management platform") + "</div>" +
        "<h1>" + L("כל בית הכנסת.<br><em>במערכת אחת.</em>", "The whole shul.<br><em>One system.</em>") + "</h1>" +
        '<p class="xp-lead">' + L("מתפללים, חשבונות ותשלומים, המסך באולם, זמני התפילה, דף השבת והאתר. הכל מחובר, בעברית ובאנגלית, ומעוצב סביב בית הכנסת שלכם.", "Members, ledger and payments, the shul screen, davening times, the Shabbat bulletin and your website. Connected, in Hebrew and English, and designed around your shul.") + "</p>" +
        '<div class="hero-cta"><div class="hc-row"><a class="cta-demo lg" href="#/proposal">' + I.sparkle.replace("<svg", '<svg width="18" height="18"') + "<span>" + L("בקשת הדגמה", "Request a demo") + "</span></a>" + telBtn("lg ghost") + '</div><p class="hc-mail">' + L("שאלות? כתבו אל ", "Questions? Email ") + '<a href="mailto:' + SALES.email + '"><bdi dir="ltr">' + esc(SALES.email) + "</bdi></a></p></div>" +
        '<div class="xp-ctas"><a class="xp-btn lg" href="#perspectives" data-scroll>' + L("לסיור במערכת", "Explore the platform") + ARROW + '</a><a class="xp-btn lg ghost" href="#/showcase/ledger">' + L("לראות אותה עובדת", "See it work") + "</a></div>" +
        personalHtml() + "</div>" +
        '<div class="xp-stage" id="stage" aria-label="' + L("תצוגה חיה של המערכת", "Live view of the platform") + '">' +
        '<a class="ly ly-admin" href="#/gabbai" data-go="super" aria-label="' + L("מערכת הגבאים", "Administration") + '"><span class="ly-tag">' + L("ניהול", "Administration") + '</span>' + browser("admin." + slug() + ".org", frame("#/gabbai?frame=1&as=super", 1360, 860, "", "Administration")) + "</a>" +
        '<a class="ly ly-site" href="#/site" data-go="visitor" aria-label="' + L("אתר בית הכנסת", "Website") + '"><span class="ly-tag">' + L("אתר", "Website") + '</span>' + browser("www." + slug() + ".org", frame("#/site?frame=1&as=visitor", 1280, 860, "", "Website")) + "</a>" +
        '<a class="ly ly-tv" href="#/screen" aria-label="' + L("המסך", "screen") + '"><span class="ly-tag">' + L("מסך", "screen") + '</span>' + tvset(frame("#/tv?preview=1", 1920, 1080, "", "screen")) + "</a>" +
        '<a class="ly ly-phone" href="#/me" data-go="member" aria-label="' + L("פורטל המתפלל", "Member portal") + '"><span class="ly-tag">' + L("פורטל המתפלל", "Member portal") + '</span>' + phone(frame("#/me?frame=1&as=member", 400, 860, "", "Member portal")) + "</a>" +
        "</div></div></section>" +
        '<section class="xp-band"><div class="xp-wrap"><p>' + L("ארבע פרספקטיבות. <b>רישום אחד משותף.</b> תשלום שהגבאי רושם מופיע בחשבון המתפלל, והודעה שמתפרסמת מופיעה במסך.", "Four perspectives. <b>One shared record.</b> A payment the gabbai records appears in the member's account; a published announcement appears on the screen.") + "</p></div></section>" +
        '<section class="xp-sec paper" id="perspectives"><div class="xp-wrap"><div class="xp-sh"><span class="xp-k">' + L("פרספקטיבות", "Perspectives") + "</span><h2>" + L("מערכת אחת, מכל זווית.", "One platform, from every side.") + "</h2></div>" +
        '<div class="ps-tabs" role="tablist">' + PERSP.map(function (p, i) { return '<button role="tab" class="ps-tab" data-pt="' + i + '" aria-selected="' + (i === 0) + '">' + L(p.he, p.en) + "</button>"; }).join("") + '</div><div class="ps-body" id="psBody"></div></div></section>' +
        '<section class="xp-sec" id="see"><div class="xp-wrap"><div class="xp-sh"><span class="xp-k">' + L("לראות בפעולה", "See it work") + "</span><h2>" + L("חמש דרכים להרגיש את המערכת.", "Five ways to feel the platform.") + '</h2><p>' + L("כל אחת עובדת על המוצר האמיתי ועל נתוני ההדגמה. אין סדר חובה.", "Each runs on the real product and the demo data. No set order.") + '</p></div><div class="see-grid">' +
        SEE.map(function (c) { return '<a class="see-card" href="' + c.href + '"' + (c.href === "#top" ? " data-focus-name" : "") + '><span class="see-n">' + c.n + '</span><span class="see-ic">' + ic(c.ic, 22) + "</span><h3>" + L(c.he, c.en) + "</h3><p>" + L(c.dhe, c.den) + '</p><span class="see-go">' + L("לנסות", "Try it") + ARROW + "</span></a>"; }).join("") + "</div></div></section>" +
        '<section class="xp-sec paper" id="daily"><div class="xp-wrap"><div class="xp-sh"><span class="xp-k">' + L("עבודה שוטפת", "Daily operations") + "</span><h2>" + L("בנויה לכל שבוע, לא רק ליום ההשקה.", "Built for every week, not just launch day.") + "</h2><p>" + L("המערכת מלווה את בית הכנסת בעבודה היומיומית. לחצו על כל משימה כדי לפתוח את המסך האמיתי שלה.", "The platform carries the shul's everyday work. Click any task to open its real screen.") + '</p></div><div class="daily-grid">' +
        DAILY.map(function (d) { return '<a class="daily" href="' + d[1] + '" data-go="' + d[0] + '"><span class="daily-ic">' + ic(d[2]) + "</span><b>" + L(d[3], d[4]) + "</b><span>" + L(d[5], d[6]) + '</span><span class="daily-role">' + esc(S.N(S.ROLES[d[0]])) + ARROW + "</span></a>"; }).join("") +
        '</div><p class="sub-note">' + ic("refresh", 16) + L("מוצעת במנוי חודשי. ההצעה מותאמת לכל בית כנסת.", "Offered as a monthly subscription. Each proposal is prepared for the individual shul.") + "</p></div></section>" +
        '<section class="xp-sec" id="custom"><div class="xp-wrap"><div class="xp-sh"><span class="xp-k">' + L("התאמה אישית", "Customization") + "</span><h2>" + L("בית הכנסת שלכם. המערכת שלכם.", "Your shul. Your system.") + "</h2><p>" + L("לא תבנית קבועה. אותן יכולות מוכחות, בזהות ובדרך העבודה של הקהילה שלכם. כך מבחינים בין מה שבמערכת היום, מה שמעוצב עבורכם ומה ששייך להדגמה בלבד:", "Not a fixed template. The same proven features, in your community's identity and way of working. Here is what is in the system today, what is designed for you, and what belongs to this demo only:") + "</p></div>" + tiersHtml() +
        '<div class="mini-themes">' + UI.THEMES.map(function (t) { return '<button class="mt" data-theme="' + t.id + '" data-mt="' + t.id + '"><span class="mt-h">' + esc(S.N(S.db.shul)) + '</span><span class="mt-p">' + L("שבת שלום", "Shabbat Shalom") + '</span><span class="mt-b">' + L("לתרומה", "Donate") + '</span><span class="mt-n">' + esc(S.N(t)) + "</span></button>"; }).join("") + '</div><div class="xp-center"><a class="xp-btn" href="#/showcase/design">' + L("לסטודיו העיצוב", "Open the design studio") + ARROW + "</a></div></div></section>" +
        '<section class="xp-sec xp-final"><div class="xp-wrap"><div class="final"><div><span class="xp-k">' + L("הצעד הבא", "Next step") + "</span><h2>" + L("רוצים לראות אותה עם בית הכנסת שלכם?", "Want to see it with your shul?") + '</h2><p>' + L("נכין הדגמה אישית והצעה למנוי חודשי, לפי הצרכים של בית הכנסת.", "We will prepare a personal demonstration and a monthly subscription proposal, based on your shul's needs.") + '</p></div><div class="final-card"><span class="fc-k">' + L("ההדגמה שלכם", "Your demo") + '</span><b id="finalName">' + esc(S.N(S.db.shul)) + '</b><span class="fc-d">' + esc(S.N(UI.THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0])) + '</span><a class="xp-btn lg" href="#/proposal">' + L("בקשת הדגמה והצעה", "Request a demo and proposal") + ARROW + "</a></div></div></div></section>" +
        '<footer class="xp-foot"><div class="xp-wrap"><span>Shul System</span><span>' + L("הדגמה עם נתונים בדויים. אין תשלומים, אימיילים או התראות אמיתיים.", "Demo with fictional data. No real payments, emails or notifications.") + "</span></div></footer></div>";
      bindNav(app);
      fitFrames(app);
      bindPersonal(app, function () { var fn = app.querySelector("#finalName"); if (fn) fn.textContent = S.N(S.db.shul); app.querySelectorAll(".mt-h").forEach(function (x) { x.textContent = S.N(S.db.shul); }); app.querySelectorAll(".win-bar span").forEach(function (x) { x.textContent = (x.textContent.indexOf("admin.") === 0 ? "admin." : "www.") + slug() + ".org"; }); var fd = app.querySelector(".fc-d"); if (fd) fd.textContent = S.N(UI.THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0]); });
      app.querySelectorAll("[data-go]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); go(a.getAttribute("data-go"), a.getAttribute("href")); }); });
      app.querySelectorAll("[data-go-role]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); go(a.getAttribute("data-go-role"), a.getAttribute("href")); }); });
      app.querySelectorAll("[data-scroll]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); app.querySelector(a.getAttribute("href")).scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }); });
      app.querySelectorAll("[data-focus-name]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); setTimeout(function () { var i = app.querySelector("#pzName"); if (i) i.focus(); }, reduce ? 0 : 450); }); });
      app.querySelectorAll("[data-mt]").forEach(function (b) { b.addEventListener("click", function () { UI.setTheme(b.getAttribute("data-mt"), true); app.querySelectorAll("[data-pz-theme]").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-pz-theme") === S.prefs.theme); }); }); });
      /* perspectives */
      function drawTab(i) {
        pTab = i; var p = PERSP[i], body = app.querySelector("#psBody");
        app.querySelectorAll(".ps-tab").forEach(function (t) { t.setAttribute("aria-selected", +t.getAttribute("data-pt") === i); });
        body.innerHTML = '<div class="ps-grid ps-' + p.kind + '"><div class="ps-copy"><h3>' + L(p.ttl[0], p.ttl[1]) + "</h3><ul>" + p.pts.map(function (x) { return "<li>" + ic("check", 18) + "<span>" + L(x[0], x[1]) + "</span></li>"; }).join("") + '</ul><a class="xp-btn" href="' + p.dest + '" id="psOpen">' + L("לפתוח: ", "Open the ") + L(p.he, p.en.toLowerCase()) + ARROW + '</a></div><div class="ps-stage">' + perspStage(p) + "</div></div>";
        fitFrames(body);
        body.querySelector("#psOpen").addEventListener("click", function (e) { e.preventDefault(); if (p.role) go(p.role, p.dest); else location.hash = p.dest; });
      }
      app.querySelectorAll(".ps-tab").forEach(function (t) { t.addEventListener("click", function () { drawTab(+t.getAttribute("data-pt")); }); });
      app.querySelector(".ps-tabs").addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var dir = (e.key === "ArrowRight") === (S.prefs.lang === "en") ? 1 : -1; var n = (pTab + dir + PERSP.length) % PERSP.length; drawTab(n); app.querySelector('[data-pt="' + n + '"]').focus(); } });
      drawTab(0);
      /* the composition responds to the pointer, gently */
      var stage = app.querySelector("#stage");
      if (stage && !reduce) {
        var hero = app.querySelector(".xp-hero"), raf = 0;
        hero.addEventListener("pointermove", function (e) {
          if (raf) return;
          raf = requestAnimationFrame(function () { raf = 0; var r = hero.getBoundingClientRect(); stage.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3)); stage.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3)); });
        });
        hero.addEventListener("pointerleave", function () { stage.style.setProperty("--px", 0); stage.style.setProperty("--py", 0); });
      }
      /* reveal sections as they scroll in */
      if ("IntersectionObserver" in window && !reduce) {
        var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { threshold: 0.12 });
        app.querySelectorAll(".xp-sec .xp-sh, .see-card, .daily, .tier, .ps-body, .final").forEach(function (el) { el.classList.add("rv"); io.observe(el); });
      }
    }
  });

  /* =================================================================== */
  /* ---------- B: one ledger, two views ---------- */
  var CHARGE_FOR = [["דמי חבר", "Membership"], ["קידוש", "Kiddush"], ["נדר: עלייה", "Neder: aliyah"], ["מקום בבית הכנסת", "Seat"]];
  UI.route("/showcase/ledger", {
    layout: "xp", live: false, title: function () { return L("יומן אחד, שתי נקודות מבט", "One ledger, two views"); },
    render: function (app, arg, params) {
      var mid = params.m && S.memberById(params.m) ? params.m : "m1", events = [], payOpen = false;
      var fin = S.db.demoUsers.finance;
      app.innerHTML = '<div class="xp light">' + xpNav(L("יומן אחד, שתי נקודות מבט", "One ledger, two views")) +
        '<div class="xp-wrap sc-head"><span class="xp-k">B</span><h1>' + L("גבאי רושם. מתפלל רואה. היתרה אחת.", "The gabbai records. The member sees. One balance.") + "</h1><p>" + L("שני מסכים אמיתיים, אותו יומן חשבונות. היתרה מחושבת תמיד מכל הרישומים. כשמתפלל משלם את היתרה בכרטיס מהחשבון שלו, התשלום נרשם אוטומטית והיתרה מתעדכנת מיד, בלי פעולה של הגבאי, בדיוק כמו במערכת.", "Two real screens, the same ledger. The balance is always computed from every entry. When a member pays their balance by card from their account, the payment records itself and the balance updates at once, with no gabbai action, exactly as in the system.") + "</p></div>" +
        '<div class="xp-wrap sc-split"><section class="sc-panel admin-look" aria-label="' + L("גבאי כספים", "Finance gabbai") + '"><div class="sc-ph"><span class="sc-role">' + ic("wallet", 16) + L("גבאי כספים", "Finance gabbai") + " · " + esc(S.N(fin)) + '</span><select id="lgM" aria-label="' + L("מתפלל", "Member") + '">' + S.db.members.filter(function (m) { return m.status === "active"; }).map(function (m) { return '<option value="' + m.id + '"' + (m.id === mid ? " selected" : "") + ">" + esc(S.N(m)) + "</option>"; }).join("") + '</select></div><div id="lgAdmin"></div></section>' +
        '<div class="sc-link" aria-hidden="true"><span></span>' + ic("refresh", 18) + "<span></span></div>" +
        '<section class="sc-panel phone-side" aria-label="' + L("מתפלל", "Member") + '"><div class="sc-ph"><span class="sc-role">' + ic("user", 16) + L("המתפלל, בטלפון", "The member, on their phone") + "</span></div>" + '<div class="phone big"><div class="phone-notch"></div><div class="phone-app" id="lgPhone"></div></div></section></div>' +
        '<div class="xp-wrap"><section class="sc-log"><h3>' + L("מה קרה", "What happened") + '</h3><ol id="lgLog"></ol></section></div>' + "</div>";
      app.querySelector(".xp").insertAdjacentHTML("beforeend", ctaBand()); bindNav(app);
      function log(he, en, kind) { events.unshift({ t: new Date(), he: he, en: en, k: kind }); drawLog(); }
      function drawLog() {
        app.querySelector("#lgLog").innerHTML = events.length ? events.map(function (e) { return '<li class="k-' + e.k + '"><time>' + e.t.toLocaleTimeString(S.prefs.lang === "he" ? "he-IL" : "en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }) + "</time>" + esc(L(e.he, e.en)) + "</li>"; }).join("") : '<li class="empty">' + L("כאן יופיע כל צעד: רישום חיוב ותשלום בכרטיס שנרשם מעצמו.", "Every step appears here: a charge recorded, and a card payment that records itself.") + "</li>";
      }
      function drawAdmin(flash) {
        var m = S.memberById(mid), b = S.balance(mid), lv = window.SHUL_MEMBER.ledgerView(mid), cards = S.db.inbox.filter(function (x) { return x.memberId === mid; }).slice(0, 3);
        var box = app.querySelector("#lgAdmin");
        box.innerHTML = '<div class="lg-bal"><span>' + L("יתרה", "Balance") + '</span><b class="num" id="lgB">' + window.SHUL_MEMBER.balanceText(b) + "</b></div>" +
          '<form class="lg-charge" id="lgCharge"><div class="lg-h">' + L("חיוב חדש", "New charge") + '</div><div class="row">' + [18, 36, 72, 180].map(function (x) { return '<button type="button" class="chip" data-q="' + x + '">$' + x + "</button>"; }).join("") + '</div><div class="lg-row"><input name="amount" type="number" min="1" step="1" value="180" class="ltr" aria-label="' + L("סכום", "Amount") + '"><select name="for" aria-label="' + L("עבור", "For") + '">' + CHARGE_FOR.map(function (c, i) { return '<option value="' + i + '">' + L(c[0], c[1]) + "</option>"; }).join("") + '</select><button class="btn primary">' + L("רישום חיוב", "Record charge") + "</button></div></form>" +
          '<div class="lg-h">' + L("תשלומים בכרטיס", "Card payments") + "</div>" +
          (cards.length ? cards.map(function (x) { return '<div class="lg-pend ' + (x.status === "pending" ? "" : "done") + '"><div><b class="num">' + S.money(x.amount) + '</b><span class="small muted"> · ' + esc(S.fmtDate(x.date)) + ' · <bdi dir="ltr">Ref #' + esc(x.ref) + "</bdi></span></div>" + (x.status === "pending" ? '<button class="btn primary sm" data-rec="' + x.id + '">' + L("רישום", "Record") + "</button>" : '<span class="badge ok">' + L("נרשם אוטומטית", "Recorded automatically") + "</span>") + "</div>"; }).join("") : '<p class="lg-empty">' + L("עוד אין תשלומים בכרטיס. כשהמתפלל ישלם את היתרה מהחשבון שלו, התשלום יירשם כאן מעצמו.", "No card payments yet. When the member pays their balance from their account, it is recorded here on its own.") + "</p>") +
          '<div class="lg-h">' + L("יומן החשבונות", "Ledger") + '</div><div class="table-wrap"><table><tbody>' + lv.rows.slice(0, 6).map(function (e) { var p = e.type === "payment"; return '<tr data-id="' + e.id + '"><td class="nowrap small">' + esc(S.fmtDate(e.date)) + '</td><td class="small">' + esc(UI.B(e.desc)) + '</td><td class="num ' + (p ? "amt-pos" : "") + '">' + (p ? "-" : "") + S.money(e.amount) + "</td></tr>"; }).join("") + "</tbody></table></div>";
        box.querySelectorAll("[data-q]").forEach(function (q) { q.addEventListener("click", function () { box.querySelector("[name=amount]").value = q.getAttribute("data-q"); }); });
        box.querySelector("#lgCharge").addEventListener("submit", function (e) {
          e.preventDefault(); var f = e.target, a = Math.round(+f.amount.value * 100) / 100, c = CHARGE_FOR[+f["for"].value];
          if (!(a > 0)) { UI.toast(L("נא להזין סכום", "Please enter an amount")); return; }
          var en = { id: S.uid("L"), mid: mid, date: S.todayIso(), type: "charge", amount: a, desc: c[0] + "|" + c[1], by: fin.he + "|" + fin.en, source: "manual" };
          S.db.ledger.push(en); S.log("finance", "רשם חיוב: " + m.he + ", " + S.money(a), "Recorded charge: " + m.en + ", " + S.money(a)); S.save();
          log("הגבאי רשם חיוב של " + S.money(a) + " (" + c[0] + ") בכרטיס של " + m.he + ".", "The gabbai recorded a " + S.money(a) + " charge (" + c[1] + ") on " + m.en + "'s card.", "charge");
          draw("charge", en.id);
        });
        box.querySelectorAll("[data-rec]").forEach(function (btn) { btn.addEventListener("click", function () {
          var r = S.db.inbox.filter(function (x) { return x.id === btn.getAttribute("data-rec"); })[0];
          if (S.db.ledger.some(function (e) { return e.id === "card-" + r.ref; })) return;
          r.status = "recorded";
          S.db.ledger.push({ id: "card-" + r.ref, mid: mid, date: r.date, type: "payment", amount: r.amount, desc: "תשלום בכרטיס Ref #" + r.ref + "|Card payment Ref #" + r.ref, method: "card", by: fin.he + "|" + fin.en, source: "card" });
          S.log("finance", "רשם תשלום בכרטיס: " + m.he + ", " + S.money(r.amount), "Recorded card payment: " + m.en + ", " + S.money(r.amount));
          S.notify(mid, "התשלום שלך התקבל: " + S.money(r.amount) + ". תודה!", "Your payment was received: " + S.money(r.amount) + ". Thank you!");
          S.save();
          log("הגבאי רשם את התשלום. היתרה ירדה בשני המסכים.", "The gabbai recorded the payment. The balance dropped on both screens.", "record");
          draw("record", "card-" + r.ref);
        }); });
        if (flash) { UI.flash(box.querySelector(".lg-bal")); var tr = flash.id && box.querySelector('tr[data-id="' + flash.id + '"]'); UI.flash(tr); if (flash.k === "pay") UI.flash(box.querySelector(".lg-pend")); }
      }
      function drawPhone(flash) {
        var b = S.balance(mid), ph = app.querySelector("#lgPhone");
        ph.innerHTML = '<div class="pa-top"><span>' + esc(S.N(S.db.shul)) + "</span><span>" + L("החשבון שלי", "My account") + "</span></div>" +
          window.SHUL_MEMBER.portalHtml(mid, { limit: 5, payButton: '<button type="button" class="btn primary mp-pay" id="phPay">' + ic("wallet", 18) + L("תשלום בכרטיס", "Pay by card") + "</button>" }) +
          (payOpen ? '<div class="pay-sheet" role="dialog" aria-label="' + L("תשלום בכרטיס", "Pay by card") + '"><div class="ps-grab"></div><b>' + L("תשלום היתרה", "Pay my balance") + '</b><label class="field"><span>' + L("סכום", "Amount") + '</span><input id="phAmt" type="number" min="1" max="' + b + '" step="0.01" value="' + b.toFixed(2) + '" class="ltr"></label><div class="ps-card"><span>Demo card</span><b dir="ltr">•••• 4242</b></div><button type="button" class="btn primary block" id="phDo">' + L("לתשלום (מדומה)", "Pay (simulated)") + '</button><button type="button" class="btn ghost block" id="phX">' + L("ביטול", "Cancel") + '</button><p class="tiny muted">' + L("הדגמה: שום דבר לא מחויב.", "Demo: nothing is charged.") + "</p></div>" : "");
        var pb = ph.querySelector("#phPay"); if (pb) pb.addEventListener("click", function () { payOpen = true; drawPhone(); });
        var x = ph.querySelector("#phX"); if (x) x.addEventListener("click", function () { payOpen = false; drawPhone(); });
        var dd = ph.querySelector("#phDo");
        if (dd) dd.addEventListener("click", function () {
          var a = Math.round(Math.min(b, +ph.querySelector("#phAmt").value || 0) * 100) / 100; if (!(a > 0)) return;
          dd.disabled = true; dd.textContent = L("מעבד...", "Processing...");
          setTimeout(function () {
            var m = S.memberById(mid), ref = String(10480000 + Math.floor(Math.random() * 90000));
            window.SHUL_MEMBER.recordBalancePayment(mid, a, ref);
            S.notify("finance", "תשלום בכרטיס התקבל: " + m.he + ", " + S.money(a), "Card payment received: " + m.en + ", " + S.money(a)); S.save();
            payOpen = false;
            log("המתפלל שילם " + S.money(a) + " בכרטיס. התשלום נרשם אוטומטית, והיתרה ירדה מיד בשני המסכים.", "The member paid " + S.money(a) + " by card. It was recorded automatically, and the balance dropped on both screens at once.", "record");
            draw("record", "card-" + ref);
          }, 900);
        });
        if (flash) { UI.flash(ph.querySelector(".mp-balance")); var tr = flash.id && ph.querySelector('tr[data-id="' + flash.id + '"]'); UI.flash(tr); if (flash.k === "pay") UI.flash(ph.querySelector(".mp-pending")); }
      }
      function draw(k, id) { var f = k ? { k: k, id: id } : null; drawAdmin(f); drawPhone(f); }
      app.querySelector("#lgM").addEventListener("change", function (e) { mid = e.target.value; payOpen = false; draw(); });
      draw(); drawLog();
    }
  });

  /* =================================================================== */
  /* ---------- C: from editor to shul ---------- */
  var SHOW = [["weekday", "יום חול בלבד", "Weekdays only"], ["all", "כל הימים", "Every day"], ["shabbat", "שבת וחג בלבד", "Shabbat and Yom Tov only"]];
  UI.route("/showcase/tv", {
    layout: "xp", live: false, title: function () { return L("מהעורך אל האולם", "From editor to shul"); },
    render: function (app) {
      var sel = "it1", mode = "weekday", con = S.db.demoUsers.content;
      app.innerHTML = '<div class="xp light">' + xpNav(L("מהעורך אל האולם", "From editor to shul")) +
        '<div class="xp-wrap sc-head"><span class="xp-k">C</span><h1>' + L("כותבים כאן. מופיע באולם.", "Write it here. See it in the shul.") + "</h1><p>" + L("עורך התוכן של גבאי התוכן והמסך עצמו. תצוגה מקדימה לפני פרסום, ופרסום שמגיע למסך מיד. בשבת המסך מציג רק הקדשות, הזכרות ויארצייטים, כמו במערכת האמיתית.", "The content gabbai's editor and the screen itself. A preview before publishing, and publishing that reaches the screen at once. On Shabbat the screen shows only dedications, hazkarot and yahrzeits, as in the real system.") + "</p></div>" +
        '<div class="xp-wrap tvs-grid"><section class="sc-panel admin-look"><div class="sc-ph"><span class="sc-role">' + ic("megaphone", 16) + L("גבאי תוכן", "Content gabbai") + " · " + esc(S.N(con)) + '</span><button class="btn sm" id="tvNew">' + ic("plus", 16) + L("הודעה חדשה", "New announcement") + '</button></div><div id="tvEd"></div></section>' +
        '<section class="tvs-screen"><div class="tvs-toolbar"><div class="seg" role="group" aria-label="' + L("יום", "Day") + '"><button data-mode="weekday" aria-pressed="true">' + L("יום חול", "Weekday") + '</button><button data-mode="shabbat" aria-pressed="false">' + L("שבת", "Shabbat") + '</button></div><a class="btn sm" href="#/screen">' + L("לאולם התצוגה", "screen showroom") + "</a></div>" + tvset(frame("#/tv?preview=1", 1920, 1080, "", "screen"), "tvs-set") + '<p class="tvs-note" id="tvNote"></p></section></div></div>';
      app.querySelector(".xp").insertAdjacentHTML("beforeend", ctaBand()); bindNav(app); fitFrames(app);
      var ifr = app.querySelector(".tvs-set iframe");
      function tvw() { try { return ifr.contentWindow; } catch (e) { return null; } }
      function note(he, en) { app.querySelector("#tvNote").innerHTML = ic("tv", 16) + " " + esc(L(he, en)); }
      function items() { return S.db.items.filter(function (i) { return i.type === "announcement"; }); }
      function drawEd() {
        var it = S.db.items.filter(function (i) { return i.id === sel; })[0] || items()[0]; sel = it.id;
        var ed = app.querySelector("#tvEd");
        ed.innerHTML = '<div class="tve-list">' + items().map(function (i) { return '<button class="tve-item' + (i.id === sel ? " on" : "") + '" data-sel="' + i.id + '"><b>' + esc(S.N(i.title)) + '</b><span class="badge ' + (i.status === "published" ? "ok" : i.status === "draft" ? "warn" : "") + '">' + (i.status === "published" ? L("מפורסם", "Published") : i.status === "draft" ? L("טיוטה", "Draft") : L("בארכיון", "Archived")) + "</span></button>"; }).join("") + "</div>" +
          '<form id="tveF" class="tve-form"><div class="form-grid"><label class="field"><span>' + L("כותרת בעברית", "Hebrew title") + '</span><input name="th" value="' + esc(it.title.he) + '"></label><label class="field"><span>' + L("כותרת באנגלית", "English title") + '</span><input name="te" class="ltr" value="' + esc(it.title.en) + '"></label></div>' +
          '<label class="field"><span>' + L("טקסט בעברית", "Hebrew text") + '</span><textarea name="xh">' + esc(it.text.he) + '</textarea></label><label class="field"><span>' + L("טקסט באנגלית", "English text") + '</span><textarea name="xe" class="ltr">' + esc(it.text.en) + "</textarea></label>" +
          '<label class="field"><span>' + L("מתי להציג", "When to show") + '</span><select name="show">' + SHOW.map(function (x) { return '<option value="' + x[0] + '"' + (it.showOn === x[0] ? " selected" : "") + ">" + L(x[1], x[2]) + "</option>"; }).join("") + "</select></label>" +
          '<div class="tve-acts"><button type="button" class="btn" id="tvePrev">' + ic("eye", 16) + L("תצוגה מקדימה במסך", "Preview on the screen") + '</button><button class="btn primary">' + L("פרסום במסך", "Publish to the screen") + "</button></div></form>";
        ed.querySelectorAll("[data-sel]").forEach(function (b) { b.addEventListener("click", function () { sel = b.getAttribute("data-sel"); clearDraft(); drawEd(); var w = tvw(); if (w && w.SHUL_TV_FOCUS) w.SHUL_TV_FOCUS("announcement"); }); });
        var f = ed.querySelector("#tveF");
        function fromForm() { var c = JSON.parse(JSON.stringify(it)); c.title = { he: f.th.value.trim() || it.title.he, en: f.te.value.trim() || f.th.value.trim() }; c.text = { he: f.xh.value.trim() || it.text.he, en: f.xe.value.trim() || f.xh.value.trim() }; c.showOn = f.show.value; return c; }
        ed.querySelector("#tvePrev").addEventListener("click", function () {
          var w = tvw(); if (w && w.SHUL_TV_SETDRAFT) w.SHUL_TV_SETDRAFT(fromForm());
          note(mode === "shabbat" && f.show.value === "weekday" ? "תצוגה מקדימה. בשבת הודעה של ימי חול לא מוצגת: עברו ל״יום חול״ כדי לראות אותה." : "תצוגה מקדימה בלבד. שום דבר עוד לא פורסם.", mode === "shabbat" && f.show.value === "weekday" ? "Preview. On Shabbat a weekday announcement is not shown: switch to Weekday to see it." : "Preview only. Nothing is published yet.");
        });
        f.addEventListener("submit", function (e) {
          e.preventDefault(); var c = fromForm();
          it.title = c.title; it.text = c.text; it.showOn = c.showOn; var was = it.status; it.status = "published";
          S.log("screen", "פרסם: " + it.title.he, "Published: " + it.title.en);
          if (was !== "published") S.notify("members", "הודעה חדשה: " + it.title.he, "New announcement: " + it.title.en);
          S.save(); clearDraft(); drawEd();
          setTimeout(function () { var w = tvw(); if (w && w.SHUL_TV_FOCUS) w.SHUL_TV_FOCUS("announcement"); }, 120);
          note("פורסם. ההודעה מופיעה במסך ובפורטל המתפללים.", "Published. It is on the screen and in the member portal.");
          UI.toast(L("פורסם במסך", "Published to the screen"));
        });
      }
      function clearDraft() { var w = tvw(); if (w && w.SHUL_TV_SETDRAFT) w.SHUL_TV_SETDRAFT(null); }
      app.querySelector("#tvNew").addEventListener("click", function () {
        var it = { id: S.uid("it"), type: "announcement", title: { he: "הודעה חדשה", en: "New announcement" }, text: { he: "כתבו כאן את ההודעה לקהילה.", en: "Write your message to the community here." }, showOn: "weekday", status: "draft" };
        S.db.items.unshift(it); S.save(); sel = it.id; drawEd(); note("טיוטה חדשה. ערכו, ראו בתצוגה מקדימה ופרסמו.", "A new draft. Edit it, preview it, publish it.");
      });
      app.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () {
        mode = b.getAttribute("data-mode"); app.querySelectorAll("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        ifr.src = "index.html#/tv?preview=1" + (mode === "shabbat" ? "&shabbat=1" : "");
        note(mode === "shabbat" ? "מצב שבת: המסך לא מתחלף, ומציג את כרטיס השבת עם ההקדשות, ההזכרות והיארצייטים. הודעות מוצגות רק בחול." : "יום חול: לוח הקהילה מתחלף בין הודעות, מזל טוב, פליירים, הקדשות ויארצייטים.", mode === "shabbat" ? "Shabbat mode: the screen stops rotating and shows the Shabbat card with dedications, hazkarot and yahrzeits. Announcements show on weekdays only." : "Weekday: the community board rotates through announcements, mazal tov, flyers, dedications and yahrzeits.");
      }); });
      ifr.addEventListener("load", function () { setTimeout(function () { var w = tvw(); if (w && w.SHUL_TV_FOCUS && mode === "weekday") w.SHUL_TV_FOCUS("announcement"); }, 300); });
      note("יום חול: לוח הקהילה מתחלף בין הודעות, מזל טוב, פליירים, הקדשות ויארצייטים.", "Weekday: the community board rotates through announcements, mazal tov, flyers, dedications and yahrzeits.");
      drawEd();
    }
  });

  /* =================================================================== */
  /* ---------- D: every role, its own system ---------- */
  var RCOLS = ["visitor", "member", "content", "finance", "super"];
  var RROWS = [
    ["האתר, המסך ותרומה", "Website, screen and donations", [1, 1, 1, 1, 1]],
    ["בקשת הצטרפות (אחרי כניסה עם Google)", "Join request (after Google sign-in)", [1, 0, 0, 0, 0]],
    ["החשבון שלי: יתרה, היסטוריה, תשלום בכרטיס", "My account: balance, history, pay by card", [0, 1, 1, 1, 1]],
    ["בקשות יארצייט למשפחה", "Family yahrzeit requests", [0, 1, 1, 1, 1]],
    ["תוכן המסך, זמני תפילה וטקסטים במסך", "Screen content, davening times and screen texts", [0, 0, 1, 0, 1]],
    ["דף השבת ואישור יארצייטים", "Shabbat bulletin and yahrzeit approvals", [0, 0, 1, 0, 1]],
    ["מתפללים, יומן חשבונות, תשלומים ונדרים", "Members, ledger, payments and nedarim", [0, 0, 0, 1, 1]],
    ["תשלומים בכרטיס, מכתבי מס ודוח שנתי", "Card payments, tax letters and annual report", [0, 0, 0, 1, 1]],
    ["הורדת גיבוי", "Backup download", [0, 0, 0, 1, 1]],
    ["אישור בקשות הצטרפות ומתן תפקידים", "Approving join requests and assigning roles", [0, 0, 0, 0, 1]],
    ["משתמשים, הרשאות והודעה לכולם", "Users, permissions and broadcast", [0, 0, 0, 0, 1]],
    ["יומן פעילות, טקסטים של דף הבית, שחזור", "Activity log, home page texts, restore", [0, 0, 0, 0, 1]],
    ["בהירות המסך ורענון מרחוק", "Screen brightness and remote refresh", [0, 0, 0, 0, 1]]
  ];
  UI.route("/showcase/roles", {
    layout: "xp", live: false, title: function () { return L("לכל תפקיד, המערכת שלו", "Every role, its own system"); },
    render: function (app) {
      var P = window.SHUL_PRESENTER.PERSP;
      var pp = function (id) { return P.filter(function (x) { return x.id === id; })[0]; };
      app.innerHTML = '<div class="xp light">' + xpNav(L("לכל תפקיד, המערכת שלו", "Every role, its own system")) +
        '<div class="xp-wrap sc-head"><span class="xp-k">D</span><h1>' + L("כל אחד רואה בדיוק את מה שמותר לו.", "Everyone sees exactly what they may use.") + "</h1><p>" + L("התפקידים וההרשאות כמו במערכת האמיתית. גבאי תוכן לא רואה נתונים כספיים, וגבאי כספים לא משנה את המסך. המנהל הראשי נותן את התפקידים.", "Roles and permissions as in the real system. A content gabbai never sees financial data, and a finance gabbai does not change the screen. The administrator assigns roles.") + "</p></div>" +
        '<div class="xp-wrap"><div class="role-cards">' + RCOLS.map(function (r) { var p = pp(r); return '<button class="role-c" data-enter="' + r + '"><span class="rc-i">' + ic(p.ic, 22) + "</span><b>" + esc(L(p.he, p.en)) + "</b><span>" + esc(L(p.dhe, p.den)) + '</span><span class="rc-go">' + L("כניסה בתור", "Enter as") + ARROW + "</span></button>"; }).join("") + "</div>" +
        '<div class="table-wrap matrix"><table><thead><tr><th>' + L("יכולת", "Capability") + "</th>" + RCOLS.map(function (r) { return "<th>" + esc(L(pp(r).he, pp(r).en)) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        RROWS.map(function (row) { return "<tr><td>" + L(row[0], row[1]) + "</td>" + row[2].map(function (v) { return '<td class="mx">' + (v ? '<span class="yes" aria-label="' + L("כן", "Yes") + '">' + ic("check", 16) + "</span>" : '<span class="no" aria-label="' + L("לא", "No") + '">·</span>') + "</td>"; }).join("") + "</tr>"; }).join("") +
        '</tbody></table></div><p class="tiers-note">' + L("בהדגמה עוברים בין תפקידים בלחיצה. במערכת האמיתית הכניסה היא עם חשבון Google, והמנהל הראשי קובע מי מקבל איזה תפקיד.", "In the demo you switch roles with a click. In the real system people sign in with Google, and the administrator decides who gets which role.") + "</p></div></div>";
      app.querySelector(".xp").insertAdjacentHTML("beforeend", ctaBand()); bindNav(app);
      app.querySelectorAll("[data-enter]").forEach(function (b) { b.addEventListener("click", function () { var r = b.getAttribute("data-enter"); go(r, pp(r).dest); }); });
    }
  });

  /* =================================================================== */
  /* ---------- E: same shul, different designs ---------- */
  var DEV = [["site", "אתר", "Website", "#/site?frame=1&as=visitor", 1280, 860], ["me", "פורטל", "Member portal", "#/me?frame=1&as=member", 400, 860], ["admin", "ניהול", "Administration", "#/gabbai?frame=1&as=super", 1360, 860], ["tv", "מסך", "screen", "#/tv?preview=1", 1920, 1080]];
  var TYPO = { classic: "Frank Ruhl Libre · Assistant", modern: "Rubik", royal: "Bellefair · Assistant", minimal: "Heebo Light" };
  UI.route("/showcase/design", {
    layout: "xp", live: false, title: function () { return L("סטודיו העיצוב", "Design studio"); },
    render: function (app, arg, params) {
      var dev = 0;
      app.innerHTML = '<div class="xp light">' + xpNav(L("סטודיו העיצוב", "Design studio")) +
        '<div class="xp-wrap sc-head"><span class="xp-k">E</span><h1>' + L("אותו בית כנסת. זהות אחרת.", "The same shul. A different identity.") + "</h1><p>" + L("אותם נתונים ואותן יכולות, בכיוונים עיצוביים שונים. אלה ארבע דוגמאות; העיצוב שלכם נבנה עבורכם.", "The same data and features, in different design directions. These are four examples; your design is created for you.") + "</p></div>" +
        '<div class="xp-wrap studio"><aside class="studio-side">' + personalHtml(true) +
        '<div class="studio-h">' + L("כיוון עיצובי", "Design direction") + '</div><div class="studio-themes">' + UI.THEMES.map(function (t) { return '<button class="st-card" data-st="' + t.id + '" aria-pressed="' + (S.prefs.theme === t.id) + '"><span class="st-sw" style="background:' + t.c + '"></span><span><b>' + esc(S.N(t)) + "</b><small>" + esc(L(t.dhe, t.den)) + '</small><small class="st-type">' + TYPO[t.id] + "</small></span></button>"; }).join("") + "</div>" +
        '<div class="studio-h">' + L("צבע מותג", "Brand color") + ' <span class="badge">' + L("תצוגה בלבד", "Preview only") + '</span></div><div class="pop-brands" id="stBrands"></div>' +
        '<p class="tiny muted">' + L("מה שמשתנה: גופנים, צבעים, צורות, ניווט, כותרת האתר והמסך. מה שלא משתנה: הנתונים, התפקידים והיכולות.", "What changes: fonts, colors, shapes, navigation, the site header and the screen. What stays: the data, the roles and the features.") + '</p></aside>' +
        '<section class="studio-main"><div class="seg studio-dev" role="tablist">' + DEV.map(function (d, i) { return '<button role="tab" data-dev="' + i + '" aria-pressed="' + (i === 0) + '">' + L(d[1], d[2]) + "</button>"; }).join("") + '</div><div class="studio-stage" id="stStage"></div></section></div>' +
        '<div class="xp-wrap"><div class="studio-h" style="margin-top:28px">' + L("השוואה", "Side by side") + '</div><div class="compare">' + UI.THEMES.map(function (t) { return '<button class="cmp" data-st="' + t.id + '">' + browser("www." + slug() + ".org", frame("#/site?frame=1&as=visitor&theme=" + t.id, 1280, 860, "", S.N(t))) + "<span>" + esc(S.N(t)) + "</span></button>"; }).join("") + "</div></div></div>";
      app.querySelector(".xp").insertAdjacentHTML("beforeend", ctaBand()); bindNav(app); fitFrames(app);
      bindPersonal(app, function () { app.querySelectorAll(".win-bar span").forEach(function (x) { x.textContent = "www." + slug() + ".org"; }); });
      function drawBrands() {
        var bx = app.querySelector("#stBrands");
        bx.innerHTML = '<button class="brand-dot none" data-brand="" aria-pressed="' + !S.prefs.brand + '">' + L("רגיל", "Default") + "</button>" + Object.keys(UI.BRANDS).map(function (k) { return '<button class="brand-dot" data-brand="' + k + '" aria-pressed="' + (S.prefs.brand === k) + '" title="' + k + '" style="background:' + UI.BRANDS[k] + '"></button>'; }).join("") + (S.prefs.theme === "royal" ? '<p class="tiny muted" style="width:100%">' + L("בעיצוב המלכותי הזהב הוא צבע המותג.", "Royal Elegant keeps its gold.") + "</p>" : "");
        bx.querySelectorAll("[data-brand]").forEach(function (b) { b.addEventListener("click", function () { UI.setBrand(b.getAttribute("data-brand")); drawBrands(); }); });
      }
      function drawDev(i) {
        dev = i; var d = DEV[i], st = app.querySelector("#stStage");
        app.querySelectorAll("[data-dev]").forEach(function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-dev") === i); });
        var f = frame(d[3], d[4], d[5], "", L(d[1], d[2]));
        st.className = "studio-stage dev-" + d[0];
        st.innerHTML = d[0] === "me" ? phone(f, "big") : d[0] === "tv" ? tvset(f) : browser((d[0] === "admin" ? "admin." : "www.") + slug() + ".org", f);
        fitFrames(st);
      }
      app.querySelectorAll("[data-dev]").forEach(function (b) { b.addEventListener("click", function () { drawDev(+b.getAttribute("data-dev")); }); });
      app.querySelectorAll("[data-st]").forEach(function (b) { b.addEventListener("click", function () {
        UI.setTheme(b.getAttribute("data-st"), true);
        app.querySelectorAll(".st-card").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-st") === S.prefs.theme); });
        app.querySelectorAll("[data-pz-theme]").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-pz-theme") === S.prefs.theme); });
        drawBrands();
      }); });
      drawBrands(); drawDev(0);
    }
  });

  /* =================================================================== */
  /* ---------- the TV showroom ---------- */
  UI.route("/screen", {
    layout: "xp", live: false, title: function () { return L("מסך בית הכנסת", "The shul screen"); },
    render: function (app) {
      var M = window.SHUL_PRESENTER.MOMENTS, cur = "live";
      var t = S.db.tvDisplay;
      app.innerHTML = '<div class="xp room">' + xpNav(L("מסך בית הכנסת", "The shul screen")) +
        '<div class="xp-wrap room-head"><h1>' + L("המסך שדולק כל הזמן באולם.", "The screen that never sleeps.") + "</h1><p>" + L("זמני היום, זמני התפילות ולוח הקהילה. בשבת הוא עובר לבד למצב שבת, בלילה הוא מתעמעם, ואפשר לרענן אותו מרחוק.", "Zmanim, davening times and the community board. On Shabbat it switches to Shabbat mode on its own, at night it dims, and it can be refreshed remotely.") + "</p></div>" +
        '<div class="room-wall"><div class="xp-wrap">' + tvset(frame("#/tv?preview=1", 1920, 1080, "", "screen"), "room-tv") + "</div></div>" +
        '<div class="xp-wrap room-ctl"><div class="room-moments" role="group" aria-label="' + L("רגע בשבוע", "Moment of the week") + '">' + M.map(function (m) { return '<button class="mom" data-m="' + m[0] + '" aria-pressed="' + (m[0] === cur) + '">' + esc(L(m[1], m[2])) + "</button>"; }).join("") + '</div><p class="room-note" id="roomNote"></p>' +
        '<div class="room-facts">' + [["sun", "עמעום לילי", "Night dimming", "אוטומטי מ-" + t.from + " ועד " + t.alotBefore + " דקות לפני עלות השחר, ברמה " + t.level + "%. המנהל משנה זאת בהגדרות המסך.", "Automatic from " + t.from + " until " + t.alotBefore + " minutes before Alot, at " + t.level + "%. The administrator changes this in the screen settings."],
          ["candle", "מצב שבת", "Shabbat mode", "מהדלקת הנרות: כרטיס שבת שלום עם נרות, ההקדשות, ההזכרות והיארצייטים של השבוע. 45 דקות לפני, הכרטיס מופיע בפינה.", "From candle lighting: the Shabbat Shalom card with candles, dedications, hazkarot and this week's yahrzeits. 45 minutes before, the card appears in the corner."],
          ["refresh", "רענון מרחוק", "Remote refresh", "המנהל לוחץ פעם אחת וכל מסך פתוח נטען מחדש. לא בשבת ולא בחג.", "The administrator presses once and every open screen reloads. Never on Shabbat or Yom Tov."],
          ["clock", "תמיד מעודכן", "Always current", "שינוי בזמני התפילה או פרסום הודעה מגיעים למסך תוך שנייה.", "A changed davening time or a published announcement reaches the screen within a second."]].map(function (f) { return '<div class="fact">' + ic(f[0], 20) + "<b>" + L(f[1], f[2]) + "</b><span>" + L(f[3], f[4]) + "</span></div>"; }).join("") + "</div>" +
        '<div class="xp-center"><a class="xp-btn" href="#/tv">' + L("פתיחה במסך מלא", "Open full screen") + ARROW + '</a> <a class="xp-btn ghost dark" href="#/showcase/tv">' + L("לפרסם הודעה למסך", "Publish to the screen") + "</a></div></div></div>";
      app.querySelector(".room-wall").insertAdjacentHTML("afterend", '<div class="xp-wrap room-cta"><p>' + L("רוצים את המסך הזה בבית הכנסת שלכם?", "Want this screen in your shul?") + '</p><a class="cta-demo" href="#/proposal">' + I.sparkle.replace("<svg", '<svg width="16" height="16"') + "<span>" + L("בקשת הדגמה", "Request a demo") + "</span></a></div>"); bindNav(app); fitFrames(app);
      var ifr = app.querySelector(".room-tv iframe");
      var NOTES = { "live": ["המסך כפי שהוא עכשיו בשבוע ההדגמה.", "The screen as it is right now in the demo week."], "0:385": ["לפני הנץ: הפס העליון סופר את הדקות לנץ החמה.", "Before Netz: the top strip counts down the minutes to sunrise."], "2:1425": ["בלילה: המסך מתעמעם אוטומטית, ובבוקר חוזר לבהירות מלאה.", "At night: the screen dims on its own and returns to full brightness by morning."], "5:375": ["יום שישי: זמני ערב שבת ואחריהם כל זמני השבת. בלוק השבת מוצג בצד.", "Friday: Erev Shabbat times followed by the whole Shabbat schedule. The Shabbat block shows at the side."], "5:940": ["לפני הדלקת נרות: ספירה לאחור, וכרטיס השבת מופיע במקום הקוד לתרומה.", "Before candle lighting: a countdown, and the Shabbat card takes the donation code's place."], "5:1100": ["שבת: המסך לא מתחלף. כרטיס שבת שלום, ההקדשות, ההזכרות והיארצייטים.", "Shabbat: the screen stops rotating. The Shabbat Shalom card, dedications, hazkarot and yahrzeits."], "6:660": ["שבת בבוקר: זמני השבת, וכרטיס השבת נשאר במקומו.", "Shabbat morning: the Shabbat times, with the Shabbat card in place."] };
      function setM(v) {
        cur = v; app.querySelectorAll(".mom").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-m") === v); });
        ifr.src = "index.html#/tv?preview=1&clock=" + v + "&r=" + Date.now();
        var n = NOTES[v] || NOTES.live; app.querySelector("#roomNote").textContent = L(n[0], n[1]);
      }
      app.querySelectorAll(".mom").forEach(function (b) { b.addEventListener("click", function () { setM(b.getAttribute("data-m")); }); });
      setM("live");
    }
  });

  /* =================================================================== */
  /* ---------- proposal ---------- */
  var INTEREST = [["site", "אתר בית הכנסת", "The shul website"], ["members", "פורטל מתפללים", "Member portal"], ["finance", "ניהול כספים ונדרים", "Finance and nedarim"], ["content", "תוכן וזמני תפילה", "Content and davening times"], ["tv", "המסך באולם", "The shul screen"], ["donate", "תרומות בכרטיס ובארנק דיגיטלי", "Card and wallet donations"]];
  UI.route("/proposal", {
    layout: "xp", live: false, title: function () { return L("בקשת הצעה", "Request a proposal"); },
    render: function (app) {
      var th = UI.THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0];
      app.innerHTML = '<div class="xp light">' + xpNav(L("בקשת הדגמה והצעה", "Demo and proposal request")) +
        '<div class="xp-wrap prop"><div class="prop-l"><span class="xp-k">' + L("הצעד הבא", "Next step") + "</span><h1>" + L("נבנה אותה עבור בית הכנסת שלכם.", "Let's build it for your shul.") + "</h1><p>" + L("ספרו לנו מעט על הקהילה. נכין הדגמה אישית בשם ובעיצוב שלכם, והצעה למנוי חודשי.", "Tell us a little about your community. We will prepare a personal demonstration with your name and design, and a monthly subscription proposal.") + "</p>" +
        '<div class="prop-sum"><div class="ps-swatch" style="background:' + th.c + '"></div><div><small>' + L("ההדגמה שלכם", "Your demo") + "</small><b>" + esc(S.N(S.db.shul)) + "</b><span>" + esc(S.N(th)) + (S.prefs.brand ? " · " + esc(S.prefs.brand) : "") + " · " + (S.prefs.lang === "he" ? "עברית ואנגלית" : "English and Hebrew") + '</span></div><a class="xp-btn ghost dark sm" href="#/showcase/design">' + L("שינוי", "Change") + "</a></div>" +
        '<div class="prop-contact"><span class="pc-k">' + L("אפשר גם לפנות ישירות", "Or reach out directly") + '</span><a href="mailto:' + SALES.email + '?subject=' + encodeURIComponent("Shul System: " + S.db.shul.en) + '">' + ic("mail", 18) + '<span dir="ltr">' + esc(SALES.email) + '</span></a><a href="tel:' + SALES.tel + '">' + ic("phone", 18) + '<span dir="ltr">' + esc(SALES.phone) + "</span></a></div></div>" +
        '<form class="prop-f card" id="propF"><div class="form-grid"><label class="field"><span>' + L("שם מלא", "Full name") + '</span><input name="name" required></label><label class="field"><span>' + L("תפקיד בבית הכנסת", "Role at the shul") + '</span><select name="role"><option>' + L("נשיא", "President") + "</option><option>" + L("גבאי", "Gabbai") + "</option><option>" + L("רב", "Rabbi") + "</option><option>" + L("חבר הנהלה", "Board member") + "</option><option>" + L("אחר", "Other") + '</option></select></label><label class="field"><span>' + L("אימייל", "Email") + '</span><input name="email" type="email" class="ltr" required></label><label class="field"><span>' + L("טלפון", "Phone") + '</span><input name="phone" class="ltr"></label></div>' +
        '<label class="field"><span>' + L("שם בית הכנסת", "Shul name") + '</span><input name="shul" value="' + esc(S.N(S.db.shul)) + '"></label><div class="field"><span>' + L("מה חשוב לכם", "What matters to you") + '</span><div class="prop-int">' + INTEREST.map(function (x, i) { return '<label class="check"><input type="checkbox" name="int" value="' + i + '"' + (i < 4 ? " checked" : "") + "> " + L(x[1], x[2]) + "</label>"; }).join("") + '</div></div><label class="field"><span>' + L("הערות (לא חובה)", "Notes (optional)") + '</span><textarea name="notes"></textarea></label>' +
        '<button class="btn primary lg block">' + L("שליחת הבקשה באימייל", "Send the request by email") + '</button><p class="tiny muted">' + L("הבקשה נפתחת באפליקציית האימייל שלכם, מוכנה לשליחה אל ", "The request opens in your email app, ready to send to ") + '<bdi dir="ltr">' + esc(SALES.email) + "</bdi>" + L(". ההדגמה עצמה לא שולחת דבר.", ". The demo itself sends nothing.") + '</p><div id="propOut"></div></form></div></div>';
      bindNav(app);
      app.querySelector("#propF").addEventListener("submit", function (e) {
        e.preventDefault(); var f = e.target;
        if (!f.name.value.trim() || !/^\S+@\S+\.\S+$/.test(f.email.value.trim())) { UI.toast(L("נא למלא שם ואימייל", "Please fill in name and email")); return; }
        var ints = Array.prototype.slice.call(f.querySelectorAll("[name=int]:checked")).map(function (c) { return INTEREST[+c.value][2]; });
        var txt = "Shul System: request for a personal demonstration and subscription proposal\n\nShul: " + f.shul.value.trim() + "\nContact: " + f.name.value.trim() + " (" + f.role.value + ")\nEmail: " + f.email.value.trim() + (f.phone.value.trim() ? "\nPhone: " + f.phone.value.trim() : "") +
          "\nDesign direction: " + th.en + (S.prefs.brand ? ", brand color " + S.prefs.brand : "") + "\nInterested in: " + (ints.join(", ") || "Not specified") + (f.notes.value.trim() ? "\nNotes: " + f.notes.value.trim() : "");
        var out = app.querySelector("#propOut");
        var mail = "mailto:" + SALES.email + "?subject=" + encodeURIComponent("Proposal request: " + f.shul.value.trim()) + "&body=" + encodeURIComponent(txt);
        out.innerHTML = '<div class="prop-done"><b>' + L("הבקשה מוכנה", "Your request is ready") + '</b><pre dir="ltr">' + esc(txt) + '</pre><div class="row"><a class="btn primary" id="propMail" href="' + esc(mail) + '">' + ic("mail", 16) + L("פתיחה באימייל", "Open in email") + '</a><button type="button" class="btn" id="propCopy">' + ic("doc", 16) + L("העתקה", "Copy") + '</button></div><p class="small muted">' + L("לא נפתח אימייל? העתיקו ושלחו אל ", "No email app opened? Copy it and send it to ") + '<bdi dir="ltr">' + esc(SALES.email) + "</bdi>" + L(", או התקשרו ", ", or call ") + '<bdi dir="ltr">' + esc(SALES.phone) + "</bdi>.</p></div>";
        location.href = mail;
        out.querySelector("#propCopy").addEventListener("click", function () {
          var done = function () { UI.toast(L("הועתק", "Copied")); };
          if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () { selectPre(); }); else selectPre();
          function selectPre() { var r = document.createRange(); r.selectNodeContents(out.querySelector("pre")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); UI.toast(L("הטקסט סומן. העתיקו אותו.", "Text selected. Copy it.")); }
        });
        out.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      });
    }
  });
})();
