/* Shul System sales demo | the presentation dock.
   Demo-only controls: perspective, design, what to try, language, reset, proposal.
   They change how the demo is presented, never the product itself. */
(function () {
  "use strict";
  var S = window.SHUL, L = S.L, esc = S.esc;
  var UI = function () { return window.SHUL_UI; };
  var open = null;

  var PERSP = [
    { id: "visitor", ic: "map", dest: "#/site", he: "אורח באתר", en: "Website visitor", dhe: "האתר הציבורי, זמני השבת, תרומה והמסך", den: "Public website, Shabbat times, donations and the screen" },
    { id: "member", ic: "user", dest: "#/me", he: "מתפלל", en: "Member", dhe: "היתרה, החיובים והתשלומים, תשלום בכרטיס, יארצייטים", den: "Balance, charges and payments, pay by card, yahrzeits" },
    { id: "finance", ic: "wallet", dest: "#/gabbai", he: "גבאי כספים", en: "Finance gabbai", dhe: "מתפללים, יומן חשבונות, נדרים, מכתבי מס. בלי תוכן מסך", den: "Members, ledger, nedarim, tax letters. No screen content" },
    { id: "content", ic: "megaphone", dest: "#/gabbai", he: "גבאי תוכן וזמנים", en: "Content gabbai", dhe: "זמני תפילה, תוכן המסך, דף השבת. בלי נתונים כספיים", den: "Davening times, screen content, Shabbat bulletin. No financial data" },
    { id: "super", ic: "shield", dest: "#/gabbai", he: "מנהל ראשי", en: "Administrator", dhe: "הכל, כולל הרשאות, בקשות הצטרפות, יומן פעילות וגיבוי", den: "Everything, including permissions, join requests, activity log and backup" },
    { id: "applicant", ic: "users", dest: "#/join", he: "נרשם חדש", en: "New applicant", dhe: "נכנס עם Google ושולח בקשת הצטרפות", den: "Signed in with Google, sends a join request" }
  ];
  var MOMENTS = [
    ["live", "עכשיו", "Now"], ["0:385", "ראשון, לפני הנץ", "Sunday, before Netz"], ["2:1425", "שלישי, 11:45 בלילה (עמעום)", "Tuesday 11:45 PM (night dimming)"],
    ["5:375", "שישי בבוקר", "Friday morning"], ["5:940", "שישי, 35 דק׳ לפני הדלקת נרות", "Friday, 35 min before candles"], ["5:1100", "ליל שבת", "Friday night (Shabbat)"], ["6:660", "שבת בבוקר", "Shabbat morning"]
  ];
  function ic(n, s) { return UI().I[n].replace("<svg", '<svg width="' + (s || 18) + '" height="' + (s || 18) + '"'); }
  function curPersp() { var r = S.prefs.role; return PERSP.filter(function (p) { return p.id === r; })[0] || PERSP[0]; }

  function render() {
    var dock = document.getElementById("dock"); if (!dock) return;
    var b = document.body;
    var home = (location.hash || "#/").split("?")[0]; home = home === "#/" || home === "#" || home === "" || home === "#/proposal";
    if (b.classList.contains("bare") || b.classList.contains("framed") || home) { dock.innerHTML = ""; dock.hidden = true; return; }
    dock.hidden = false;
    var th = UI().THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0];
    var p = curPersp();
    dock.innerHTML = '<div class="dock-bar" role="toolbar" aria-label="' + L("פקדי הדגמה", "Demo controls") + '">' +
      '<a class="dock-home" href="#/" title="' + L("חזרה לדף הבית", "Back to the home page") + '"><span class="dock-mark">S</span><span class="dock-lbl">' + L("חזרה", "Home") + "</span></a>" +
      '<button class="dock-btn" data-pop="persp" aria-haspopup="true">' + ic(p.ic) + '<span class="dock-k">' + L("צפייה בתור", "Viewing as") + "</span><b>" + esc(L(p.he, p.en)) + "</b></button>" +
      '<button class="dock-btn" data-pop="design" aria-haspopup="true"><span class="dock-sw" style="background:' + th.c + '"></span><span class="dock-k">' + L("עיצוב", "Design") + "</span><b>" + esc(S.N(th)) + "</b></button>" +
      '<button class="dock-btn dock-try" data-pop="try" aria-haspopup="true">' + ic("sparkle") + '<b>' + L("מה לנסות?", "What to try?") + "</b></button>" +
      '<div class="dock-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button data-lang="he" aria-pressed="' + (S.prefs.lang === "he") + '">עב</button><button data-lang="en" aria-pressed="' + (S.prefs.lang === "en") + '">EN</button></div>' +
      '<button class="dock-btn dock-more" data-pop="more" aria-label="' + L("פקדי הדגמה", "Demo controls") + '">' + ic("menu") + '<span class="dock-tabl">' + L("פקדי הדגמה", "Demo controls") + "</span></button>" +
      '<a class="dock-cta hide-md" href="#/proposal">' + L("בקשת הצעה", "Request a proposal") + "</a></div>" +
      '<div class="dock-pop" id="dockPop" hidden></div>';
    dock.querySelectorAll("[data-pop]").forEach(function (btn) { btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(btn.getAttribute("data-pop"), btn); }); });
    dock.querySelectorAll("[data-lang]").forEach(function (btn) { btn.addEventListener("click", function () { UI().setLang(btn.getAttribute("data-lang")); }); });
    if (open) toggle(open, null, true);
  }

  var TRY = [
    ["finance", "#/finance/pay", "wallet", "לרשום תשלום", "Record a payment", "בחרו מתפלל וסכום, ושמרו. היתרה מתעדכנת מיד.", "Pick a member and an amount, save. The balance updates at once."],
    ["content", "#/gabbai/tv", "clock", "לשנות זמן תפילה", "Change a davening time", "ערכו שעה, והמסך שבצד מתעדכן תוך שנייה.", "Edit a time and the screen beside it updates within a second."],
    ["finance", "#/finance/nedarim", "list", "לרשום נדרי שבת", "Enter Shabbat nedarim", "טבלה אחת לכל העליות, שמירה אחת.", "One table for every aliyah, one save."],
    ["member", "#/me", "user", "לראות כמו מתפלל", "See it as a member", "היתרה, החיובים ותשלום בכרטיס, בטלפון.", "The balance, charges and paying by card, on the phone."],
    ["content", "#/gabbai/content", "megaphone", "לפרסם הודעה למסך", "Post to the screen", "מזל טוב או הודעה, עם תצוגה מקדימה.", "A Mazal Tov or announcement, with a preview."]
  ];
  function popHtml(kind) {
    var head = function (t, sub) { return '<div class="pop-h"><b>' + t + "</b><span>" + sub + "</span></div>"; };
    if (kind === "try") {
      return head(L("מה לנסות?", "What to try?"), L("זו המערכת האמיתית עם קהילה לדוגמה. אי אפשר לקלקל כלום.", "This is the real system with a sample community. You can't break anything.")) +
        '<div class="pop-list">' + TRY.map(function (t) { return '<button class="pop-item" data-try="' + t[0] + "|" + t[1] + '">' + ic(t[2], 20) + "<span><b>" + esc(L(t[3], t[4])) + "</b><small>" + esc(L(t[5], t[6])) + "</small></span></button>"; }).join("") + "</div>";
    }
    if (kind === "persp") {
      return head(L("פרספקטיבה", "Perspective"), L("מחליף את התפקיד בהדגמה בלבד. במערכת האמיתית הכניסה היא עם Google והתפקיד נקבע על ידי המנהל.", "Changes the role in the demo only. In the real system sign-in is with Google and the administrator assigns roles.")) +
        '<div class="pop-list">' + PERSP.map(function (p) {
          return '<button class="pop-item" data-role="' + p.id + '" aria-pressed="' + (S.prefs.role === p.id) + '">' + ic(p.ic, 20) + "<span><b>" + esc(L(p.he, p.en)) + "</b><small>" + esc(L(p.dhe, p.den)) + "</small></span></button>";
        }).join("") + '</div><div class="pop-links"><a href="#/">' + L("חזרה למגירה", "Back to the drawer") + "</a></div>";
    }
    if (kind === "design") {
      var brands = UI().BRANDS;
      return head(L("עיצוב", "Design"), L("אלה רק ארבע דוגמאות. העיצוב ניתן להתאמה מלאה: לוגו, צבעים, גופנים, צורות וכל מילה. המערכת עצמה נשארת זהה.", "These are only four examples. The design is fully customizable: logo, colors, fonts, shapes and every word. The system itself stays the same.")) +
        '<div class="pop-themes">' + UI().THEMES.map(function (t) { return '<button class="pop-theme" data-theme-pick="' + t.id + '" aria-pressed="' + (S.prefs.theme === t.id) + '"><span class="sw" style="background:' + t.c + '"></span><b>' + esc(S.N(t)) + "</b></button>"; }).join("") + "</div>" +
        '<div class="pop-links"><a href="#/?to=dwLooks">' + L("לנסות עם השם שלכם", "Try it with your name") + "</a></div>";
    }
    return head(L("פקדי הדגמה", "Demo controls"), L("משנים את ההצגה בלבד, לא את המוצר.", "These change the presentation, not the product.")) +
      '<div class="pop-list">' +
      '<button class="pop-item compact pop-m" data-act="persp">' + ic(curPersp().ic) + "<span><small>" + L("צפייה בתור", "Viewing as") + "</small><b>" + esc(L(curPersp().he, curPersp().en)) + "</b></span></button>" +
      '<button class="pop-item compact pop-m" data-act="design"><span class="dock-sw" style="background:' + UI().THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0].c + '"></span><span><small>' + L("עיצוב", "Design") + "</small><b>" + esc(S.N(UI().THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0])) + "</b></span></button>" +
      '<div class="pop-item compact pop-m pop-lang"><span><b>' + L("שפה", "Language") + '</b></span><span class="dock-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button data-lang="he" aria-pressed="' + (S.prefs.lang === "he") + '">עב</button><button data-lang="en" aria-pressed="' + (S.prefs.lang === "en") + '">EN</button></span></div>' +
      '<a class="pop-item compact" href="#/proposal">' + ic("mail") + "<span><b>" + L("בקשת הדגמה אישית והצעה", "Request a personal demo and proposal") + "</b></span></a>" +
      '<button class="pop-item compact pop-m" data-act="try">' + ic("sparkle") + "<span><b>" + L("מה לנסות?", "What to try?") + "</b></span></button>" +
      '<a class="pop-item compact" href="#/?to=dwLooks">' + ic("palette") + "<span><b>" + L("עם השם והעיצוב שלכם", "With your name and design") + "</b></span></a>" +
      '<button class="pop-item compact" data-act="reset">' + ic("refresh") + "<span><b>" + L("איפוס ההדגמה", "Reset the demo") + "</b><small>" + L("מחזיר את כל הנתונים המדומים, השם והעיצוב", "Restores all fictional data, the name and the design") + "</small></span></button></div>";
  }
  function toggle(kind, btn, keep) {
    var pop = document.getElementById("dockPop"); if (!pop) return;
    if (!keep && open === kind) { close(); return; }
    open = kind;
    pop.innerHTML = popHtml(kind); pop.hidden = false; pop.setAttribute("data-kind", kind);
    document.querySelectorAll(".dock-btn").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-pop") === kind); });
    pop.querySelectorAll("[data-role]").forEach(function (b) { b.addEventListener("click", function () { var r = b.getAttribute("data-role"); var p = PERSP.filter(function (x) { return x.id === r; })[0]; close(); UI().setRole(r, true, p.dest); }); });
    pop.querySelectorAll("[data-theme-pick]").forEach(function (b) { b.addEventListener("click", function () { UI().setTheme(b.getAttribute("data-theme-pick")); }); });
    pop.querySelectorAll("[data-brand]").forEach(function (b) { b.addEventListener("click", function () { UI().setBrand(b.getAttribute("data-brand")); render(); }); });
    pop.querySelectorAll("[data-try]").forEach(function (b) { b.addEventListener("click", function () { var v = b.getAttribute("data-try").split("|"); close(); UI().setRole(v[0], true, v[1]); }); });
    pop.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    ["persp", "design", "try"].forEach(function (k) { var t = pop.querySelector('[data-act="' + k + '"]'); if (t) t.addEventListener("click", function (e) { e.stopPropagation(); toggle(k, null); }); });
    pop.querySelectorAll("[data-lang]").forEach(function (b) { b.addEventListener("click", function () { close(); UI().setLang(b.getAttribute("data-lang")); }); });
    var rs = pop.querySelector('[data-act="reset"]');
    if (rs) rs.addEventListener("click", function () {
      close();
      UI().confirmBox(L("לאפס את ההדגמה?", "Reset the demo?"), L("כל השינויים יימחקו: הנתונים המדומים, שם בית הכנסת, העיצוב וזמן ההדגמה יחזרו למצבם המקורי.", "Everything you changed is cleared: the fictional data, the shul name, the design and the demo time return to their original state."), L("איפוס", "Reset"), function () {
        S.reset(); S.prefs.theme = "classic"; S.prefs.brand = null; S.savePrefs(); setMoment("live", true); UI().applyPrefs(); UI().toast(L("ההדגמה אופסה", "The demo was reset")); UI().render();
      });
    });
  }
  function close() { open = null; var pop = document.getElementById("dockPop"); if (pop) pop.hidden = true; document.querySelectorAll(".dock-btn").forEach(function (b) { b.classList.remove("on"); }); }
  function setMoment(v, quiet) {
    if (v === "live") S.pinClock(null); else { var p = v.split(":"); S.pinClock(+p[0], +p[1]); S.pinned().min0 = +p[1]; }
    try { sessionStorage.setItem("shulDemo.clock", v); } catch (e) {}
    close(); if (!quiet) { render(); UI().render(); }
  }
  /* a short, quiet card when the perspective changes: who you are now and what you can do */
  function roleCard(r) {
    var p = PERSP.filter(function (x) { return x.id === r; })[0]; if (!p) return;
    var old = document.getElementById("roleCard"); if (old) old.remove();
    var c = document.createElement("div"); c.id = "roleCard"; c.className = "role-card"; c.setAttribute("role", "status");
    c.innerHTML = '<div class="rc-ic">' + ic(p.ic, 22) + '</div><div><small>' + L("צופים עכשיו בתור", "Now viewing as") + "</small><b>" + esc(L(p.he, p.en)) + "</b><span>" + esc(L(p.dhe, p.den)) + "</span></div>";
    document.body.appendChild(c);
    setTimeout(function () { c.classList.add("out"); setTimeout(function () { c.remove(); }, 400); }, 2600);
  }
  document.addEventListener("click", function (e) { var d = document.getElementById("dock"); if (open && d && !d.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) close(); });
  window.SHUL_PRESENTER = { render: render, roleCard: roleCard, setMoment: setMoment, PERSP: PERSP, MOMENTS: MOMENTS };
})();
