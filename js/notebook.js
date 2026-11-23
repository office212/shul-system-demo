/* Shul System sales demo | #/ the gabbai's notebook.
   One idea, for a buyer: everything the gabbai writes in a notebook today, the system does.
   The hero is the notebook, scribbled. Four lines from it, one at a time: the line is crossed
   out as it comes into view, and the real system (live, on the demo data) shows what replaces it.
   Every answer is a capability of the real system (FEATURE-MAP.md); the notes are fictional. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, X = window.SHUL_XP, L = S.L, esc = S.esc;
  var SALES = UI.SALES;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cleanup = null;

  function mincha() { return S.db.prayers.filter(function (p) { return p.id === "p3"; })[0] || S.db.prayers.filter(function (p) { return p.group === "weekday" && /mincha/i.test(p.en); })[0]; }
  function t12(min) { return S.hm(min, S.prefs.lang === "en"); }
  function first(id) { var n = S.N(S.memberById(id)).split(" "); return n[0] + (n[1] ? " " + n[1].charAt(0) + "." : ""); }
  function lazy(html) { return html.replace(' src="', ' data-src="'); }

  /* the four lines of the notebook, and what replaces each */
  function lines() {
    var t = window.SHUL_TV.prayerTime(mincha());
    return [
      { id: "times", hand: L("לעדכן מנחה בלוח בכניסה: ", "Fix Mincha on the board: ") + "<s>" + t12(t - 10) + "</s> → " + t12(t) + L(" (ושלא ישכחו גם את המעריב השני)", " (and the late Maariv)"),
        k: ["זמני תפילה", "Davening times"],
        h: ["מעדכנים פעם אחת. כל השאר מתעדכן לבד.", "Update it once. Everything else follows."],
        p: ["משנים שעה במערכת, והיא מופיעה מיד במסך בבית הכנסת, באתר ובדף השבת.", "Change a time in the system and it shows at once on the shul screen, the website and the Shabbat bulletin."],
        vis: "times", role: "content", dest: "#/gabbai/tv" },
      { id: "debt", hand: esc(first("m1")) + L(" חייב $360. להזכיר לו?? (איך בלי להביך...)", " owes $360. Remind him?? (without embarrassing him...)"),
        k: ["חובות ותשלומים", "Balances and payments"],
        h: ["לא צריך להזכיר. כל מתפלל רואה בעצמו.", "No reminders. Every member sees it."],
        p: ["לכל מתפלל יש חשבון בטלפון עם היתרה וכל החיובים. הוא משלם בכרטיס, והתשלום נרשם מעצמו.", "Every member has an account on their phone with the balance and every charge. They pay by card and it records itself."],
        vis: "member", role: "member", dest: "#/me" },
      { id: "nedarim", hand: L("נדרים מהשבת: לוי, ", "Shabbat nedarim: Levi, ") + esc(first("m3")) + " <s>$52</s> $72?? " + L("מפטיר: לא זוכר מי...", "Maftir: can't remember who..."),
        k: ["נדרי שבת", "Shabbat nedarim"],
        h: ["במוצאי שבת: טבלה אחת, שמירה אחת.", "Motzei Shabbat: one table, one save."],
        p: ["רושמים את כל העליות בטבלה אחת. כל נדר נכנס לחשבון של המתפלל, והוא רואה אותו בטלפון.", "Enter every aliyah in one table. Each neder goes onto the member's account, and they see it on their phone."],
        vis: "#/finance/nedarim", role: "finance", dest: "#/finance/nedarim" },
      { id: "yahrzeit", hand: L("יארצייט: דבורה בת מנחם, כ׳ כסלו (ביקש ", "Yahrzeit: Devorah bat Menachem, 20 Kislev (asked by ") + esc(first("m7")) + L(") לא לשכוח!!!", ") don't forget!!!"),
        k: ["יארצייטים", "Yahrzeits"],
        h: ["המשפחה מבקשת, אתם מאשרים. המסך זוכר כל שנה.", "The family asks, you approve. The screen remembers every year."],
        p: ["המתפלל מבקש מהחשבון שלו. אחרי לחיצת אישור, היארצייט מוצג במסך בשבוע שלו, בכל שנה.", "The member asks from their account. After one tap to approve, the yahrzeit shows on the screen in its week, every year."],
        vis: "#/gabbai/content?type=yahrzeit", role: "content", dest: "#/gabbai/content?type=yahrzeit" }
    ];
  }
  var ALSO = [
    ["דף שבת מוכן להדפסה, שנבנה לבד מהזמנים", "A Shabbat bulletin ready to print, built from the times"],
    ["תרומות באתר: כרטיס, Apple Pay ו-Google Pay", "Donations on the website: card, Apple Pay and Google Pay"],
    ["מכתבי מס לכל מתפלל ודוח שנתי", "Tax letters for every member and an annual report"],
    ["משפחות חדשות נרשמות לבד, ואתם מאשרים", "New families sign up themselves, and you approve"],
    ["הרשאה נפרדת לכל גבאי: כספים, או תוכן וזמנים", "Separate access for each gabbai: finances, or content and times"],
    ["כל פעולה נרשמת, וגיבוי מלא כל לילה", "Every action is logged, with a full backup every night"]
  ];
  var TRY = [
    { role: "super", dest: "#/gabbai", ic: "shield", h: ["אני הגבאי", "I'm the gabbai"], p: ["לוח הבקרה: תשלומים, נדרים, זמנים והמסך", "The dashboard: payments, nedarim, times and the screen"] },
    { role: "member", dest: "#/me", ic: "user", h: ["אני מתפלל", "I'm a member"], p: ["החשבון בטלפון: יתרה, תשלום ויארצייטים", "The phone account: balance, paying and yahrzeits"] },
    { role: null, dest: "#/screen", ic: "tv", h: ["המסך בבית הכנסת", "The shul screen"], p: ["זמנים, לוח הקהילה ומצב שבת", "Times, the community board and Shabbat mode"] }
  ];

  function visual(n) {
    if (n.vis === "times") {
      var p = mincha();
      return '<div class="nb-times"><div class="nb-ed"><div><b>' + esc(S.N(p)) + "</b><small>" + L("ימי חול", "Weekdays") + '</small></div><div class="nb-ctl"><button type="button" data-mn="-5" aria-label="' + L("5 דקות מוקדם יותר", "5 minutes earlier") + '">−5</button><output id="mnT">' + t12(window.SHUL_TV.prayerTime(p)) + '</output><button type="button" data-mn="5" aria-label="' + L("5 דקות מאוחר יותר", "5 minutes later") + '">+5</button></div><p id="mnNote" aria-live="polite">' + L("נסו: שנו את השעה, והמסך מתעדכן.", "Try it: change the time, the screen updates.") + "</p></div>" +
        X.tvset(lazy(X.frame("#/tv?preview=1&clock=1:720", 1920, 1080, "", L("המסך", "Screen")))) + "</div>";
    }
    if (n.vis === "member") return '<div class="nb-phone">' + X.phone(lazy(X.frame("#/me?frame=1&as=member", 400, 860, "", L("חשבון המתפלל", "Member account")))) + "</div>";
    return X.browser("admin." + X.slug() + ".org", lazy(X.frame(n.vis + (n.vis.indexOf("?") > 0 ? "&" : "?") + "frame=1&as=" + n.role, 1360, 860, "", L(n.k[0], n.k[1]))), "nb-win");
  }

  UI.route("/", {
    layout: "xp", live: false, title: function () { return L("המחברת של הגבאי", "The gabbai's notebook"); },
    render: function (app) {
      if (cleanup) cleanup();
      document.body.classList.add("pg-nb");
      var LN = lines(), timers = [];
      app.innerHTML = '<div class="nb">' +
        '<header class="nb-top"><a class="nb-mark" href="#/">' + UI.logo() + '<span>Shul System</span></a><nav><button type="button" data-go="nbHow">' + L("איך זה עובד", "How it works") + '</button><button type="button" data-go="nbTry">' + L("לנסות", "Try it") + '</button><span class="nb-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button data-xl="he" aria-pressed="' + (S.prefs.lang === "he") + '">עב</button><button data-xl="en" aria-pressed="' + (S.prefs.lang === "en") + '">EN</button></span><a class="nb-cta" href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + "</a></nav></header>" +
        /* hero */
        '<section class="nb-hero"><div class="nb-hero-copy"><p class="nb-k">' + L("מערכת לניהול בית הכנסת", "Software for running a shul") + "</p><h1>" + L("כל מה שכתוב<br>במחברת של הגבאי.<br><em>עכשיו זה עובד לבד.</em>", "Everything in<br>the gabbai's notebook.<br><em>Now it runs itself.</em>") + '</h1><p class="nb-lead">' + L("זמני תפילה, חובות, נדרים ויארצייטים. מעדכנים פעם אחת, והמסך בבית הכנסת, החשבון של כל מתפלל ודף השבת מתעדכנים מעצמם.", "Davening times, balances, nedarim and yahrzeits. Update once, and the shul screen, every member's account and the Shabbat bulletin follow on their own.") + '</p><div class="nb-ctas"><button type="button" class="nb-btn" data-go="nbHow">' + L("לראות איך", "See how") + '</button><a class="nb-btn ghost" href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + "</a></div></div>" +
        '<div class="nb-book" aria-label="' + L("המחברת של הגבאי", "The gabbai's notebook") + '"><div class="nb-page"><div class="nb-date">' + L("מוצאי שבת, פרשת " + S.PARASHA.he, "Motzei Shabbat, " + S.PARASHA.en) + '</div><p class="nb-title">' + L("לעשות!!", "To do!!") + "</p><ol>" + LN.map(function (n, i) { return '<li data-line="' + i + '"><button type="button" data-go="nb' + i + '">' + n.hand + "</button></li>"; }).join("") + '</ol><p class="nb-scrawl">' + L("+ קבלה למס לאהרן פ. · דף שבת לצלם · לבדוק מי שילם בכרטיס...", "+ tax receipt for Aharon F. · copy the Shabbat sheet · check who paid by card...") + '</p><span class="nb-ring" aria-hidden="true"></span></div></div></section>' +
        /* the four lines */
        '<div id="nbHow">' + LN.map(function (n, i) {
          return '<section class="nb-ch" id="nb' + i + '"><div class="nb-ch-l"><p class="nb-k">' + (i + 1) + " · " + L(n.k[0], n.k[1]) + '</p><p class="nb-line"><span>' + n.hand + '</span></p><h2>' + L(n.h[0], n.h[1]) + "</h2><p>" + L(n.p[0], n.p[1]) + '</p><a class="nb-more" href="' + n.dest + '" data-role="' + n.role + '">' + L("לפתוח במערכת", "Open it in the system") + ' ←</a></div><div class="nb-ch-r">' + visual(n) + "</div></section>";
        }).join("") + "</div>" +
        /* and also */
        '<section class="nb-also"><h2>' + L("ובנוסף, בלי עוד מחברות:", "And also, no more notebooks:") + "</h2><ul>" + ALSO.map(function (a) { return "<li>" + L(a[0], a[1]) + "</li>"; }).join("") + "</ul></section>" +
        /* try it */
        '<section class="nb-try" id="nbTry"><h2>' + L("נסו בעצמכם.", "Try it yourself.") + "</h2><p>" + L("זו המערכת האמיתית, עם קהילה לדוגמה. אי אפשר לקלקל כלום.", "This is the real system, with a sample community. You can't break anything.") + '</p><div class="nb-try-grid">' +
        TRY.map(function (t) { return '<a class="nb-card" href="' + t.dest + '"' + (t.role ? ' data-role="' + t.role + '"' : "") + '><span class="nb-card-ic">' + X.ic(t.ic, 26) + "</span><b>" + L(t.h[0], t.h[1]) + "</b><span>" + L(t.p[0], t.p[1]) + "</span></a>"; }).join("") + "</div></section>" +
        /* looks */
        '<section class="nb-looks"><h2>' + L("ייראה כמו בית הכנסת שלכם.", "It looks like your shul.") + "</h2><p>" + L("לוגו, צבעים, גופנים וכל מילה, בהתאמה מלאה. כאן ארבע דוגמאות; לחצו כדי לראות.", "Logo, colors, fonts and every word, fully customized. Four examples here; click to see.") + '</p><div class="nb-looks-row">' +
        UI.THEMES.map(function (t) { return '<button type="button" class="nb-look" data-look="' + t.id + '" aria-pressed="' + (S.prefs.theme === t.id) + '"><span class="nb-sw" style="background:' + t.c + '"></span>' + esc(S.N(t)) + "</button>"; }).join("") + "</div></section>" +
        /* contact */
        '<section class="nb-end"><div class="nb-note"><p class="nb-k">' + L("גבאי?", "Gabbai?") + "</p><h2>" + L("בואו נדבר.", "Let's talk.") + "</h2><p>" + L("נכין לבית הכנסת שלכם הדגמה אישית והצעה למנוי חודשי.", "We'll prepare a personal demo for your shul and a monthly subscription proposal.") + '</p><div class="nb-ctas"><a class="nb-btn" href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + '</a><a class="nb-btn ghost" href="tel:' + SALES.tel + '"><bdi dir="ltr">' + esc(SALES.phone) + '</bdi></a></div><p class="nb-mail"><a href="mailto:' + SALES.email + '"><bdi dir="ltr">' + esc(SALES.email) + "</bdi></a></p></div>" +
        '<p class="nb-fine">' + L("הדגמה עם נתונים בדויים. אין תשלומים, אימיילים או התראות אמיתיים.", "Demo with fictional data. No real payments, emails or notifications.") + ' · <a href="#/tour">' + L("סיור מלא במערכת", "Full platform tour") + "</a></p></section></div>";

      /* nav and buttons */
      function goTo(id) { var el = app.querySelector("#" + id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
      app.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { goTo(b.getAttribute("data-go")); }); });
      app.querySelectorAll("[data-xl]").forEach(function (b) { b.addEventListener("click", function () { UI.setLang(b.getAttribute("data-xl")); }); });
      app.querySelectorAll("a[data-role]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); X.go(a.getAttribute("data-role"), a.getAttribute("href")); }); });
      app.querySelectorAll("[data-look]").forEach(function (b) { b.addEventListener("click", function () { UI.setTheme(b.getAttribute("data-look"), true); location.hash = "#/showcase/design"; }); });

      /* frames load near the screen */
      function load(f) { if (f.getAttribute("data-src")) { f.src = f.getAttribute("data-src"); f.removeAttribute("data-src"); } }
      var frames = app.querySelectorAll("iframe[data-src]");
      var lio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting) return; var f = en.target.querySelector("iframe[data-src]"); if (f) load(f); lio.unobserve(en.target); }); }, { rootMargin: "800px 0px" }) : null;
      frames.forEach(function (f) { if (lio) lio.observe(f.closest(".sf")); else load(f); });
      X.fitFrames(app);

      /* a line is crossed out, in the notebook and in its chapter, as its chapter comes into view */
      var cio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting) return; var i = en.target.id.slice(2); en.target.classList.add("done"); var li = app.querySelector('[data-line="' + i + '"]'); if (li) li.classList.add("done"); cio.unobserve(en.target); }); }, { threshold: 0.45 }) : null;
      app.querySelectorAll(".nb-ch").forEach(function (c) { if (cio && !reduce) cio.observe(c); else c.classList.add("done"); });

      /* the Mincha edit */
      var mnT = app.querySelector("#mnT"), note = app.querySelector("#mnNote");
      app.querySelectorAll("[data-mn]").forEach(function (b) {
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

      function stop() { timers.forEach(clearTimeout); if (lio) lio.disconnect(); if (cio) cio.disconnect(); window.removeEventListener("hashchange", onHash); document.body.classList.remove("pg-nb"); cleanup = null; }
      function onHash() { var h = (location.hash || "#/").split("?")[0]; if (h !== "#/" && h !== "#" && h !== "") stop(); }
      window.addEventListener("hashchange", onHash);
      cleanup = stop;
    }
  });
})();
