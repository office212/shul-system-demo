/* Shul System sales demo | the presentation dock.
   Demo-only controls: perspective, design, language, demo time, reset, proposal.
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
    { id: "applicant", ic: "users", dest: "#/join", he: "נרשם חדש", en: "New sign-in", dhe: "נכנס עם Google ושולח בקשת הצטרפות", den: "Signed in with Google, sends a join request" }
  ];
  var MOMENTS = [
    ["live", "עכשיו", "Now"], ["0:385", "ראשון, לפני הנץ", "Sunday, before Netz"], ["2:1425", "שלישי, 11:45 בלילה (עמעום)", "Tuesday 11:45 PM (night dimming)"],
    ["5:375", "שישי בבוקר", "Friday morning"], ["5:940", "שישי, 35 דק׳ לפני הדלקת נרות", "Friday, 35 min before candles"], ["5:1100", "ליל שבת", "Friday night (Shabbat)"], ["6:660", "שבת בבוקר", "Shabbat morning"]
  ];
  function ic(n, s) { return UI().I[n].replace("<svg", '<svg width="' + (s || 18) + '" height="' + (s || 18) + '"'); }
  function curPersp() { var r = S.prefs.role; return PERSP.filter(function (p) { return p.id === r; })[0] || PERSP[0]; }
  function momentKey() { var p = S.pinned(); return p ? p.dow + ":" + Math.round(p.min0) : "live"; }

  function render() {
    var dock = document.getElementById("dock"); if (!dock) return;
    var b = document.body;
    if (b.classList.contains("bare") || b.classList.contains("framed")) { dock.innerHTML = ""; dock.hidden = true; return; }
    dock.hidden = false;
    var th = UI().THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0];
    var p = curPersp(), mk = momentKey();
    var mom = MOMENTS.filter(function (m) { return m[0] === mk; })[0] || MOMENTS[0];
    dock.innerHTML = '<div class="dock-bar" role="toolbar" aria-label="' + L("פקדי הדגמה", "Demo controls") + '">' +
      '<a class="dock-home" href="#/" title="' + L("דף הבית", "Home") + '"><span class="dock-mark">S</span><span class="dock-lbl">' + L("הדגמה", "Demo") + "</span></a>" +
      '<button class="dock-btn" data-pop="persp" aria-haspopup="true">' + ic(p.ic) + '<span class="dock-k">' + L("צפייה בתור", "Viewing as") + "</span><b>" + esc(L(p.he, p.en)) + "</b></button>" +
      '<button class="dock-btn" data-pop="design" aria-haspopup="true"><span class="dock-sw" style="background:' + th.c + '"></span><span class="dock-k">' + L("עיצוב", "Design") + "</span><b>" + esc(S.N(th)) + "</b></button>" +
      '<button class="dock-btn hide-md" data-pop="time" aria-haspopup="true">' + ic("clock") + '<span class="dock-k">' + L("זמן", "Time") + "</span><b>" + esc(L(mom[1], mom[2])) + "</b></button>" +
      '<div class="dock-lang" role="group" aria-label="' + L("שפה", "Language") + '"><button data-lang="he" aria-pressed="' + (S.prefs.lang === "he") + '">עב</button><button data-lang="en" aria-pressed="' + (S.prefs.lang === "en") + '">EN</button></div>' +
      '<button class="dock-btn dock-more" data-pop="more" aria-label="' + L("עוד", "More") + '">' + ic("menu") + "</button>" +
      '<a class="dock-cta hide-md" href="#/proposal">' + L("בקשת הצעה", "Request a proposal") + "</a></div>" +
      '<div class="dock-pop" id="dockPop" hidden></div>';
    dock.querySelectorAll("[data-pop]").forEach(function (btn) { btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(btn.getAttribute("data-pop"), btn); }); });
    dock.querySelectorAll("[data-lang]").forEach(function (btn) { btn.addEventListener("click", function () { UI().setLang(btn.getAttribute("data-lang")); }); });
    if (open) toggle(open, null, true);
  }

  function popHtml(kind) {
    var head = function (t, sub) { return '<div class="pop-h"><b>' + t + "</b><span>" + sub + "</span></div>"; };
    if (kind === "persp") {
      return head(L("פרספקטיבה", "Perspective"), L("מחליף את התפקיד בהדגמה בלבד. במערכת האמיתית הכניסה היא עם Google והתפקיד נקבע על ידי המנהל.", "Changes the role in the demo only. In the real system sign-in is with Google and the administrator assigns roles.")) +
        '<div class="pop-list">' + PERSP.map(function (p) {
          return '<button class="pop-item" data-role="' + p.id + '" aria-pressed="' + (S.prefs.role === p.id) + '">' + ic(p.ic, 20) + "<span><b>" + esc(L(p.he, p.en)) + "</b><small>" + esc(L(p.dhe, p.den)) + "</small></span></button>";
        }).join("") + '</div><div class="pop-links"><a href="#/tour">' + L("סיור במערכת", "Platform tour") + '</a><a href="#/screen">' + L("אולם התצוגה של המסך", "screen showroom") + '</a><a href="#/showcase/roles">' + L("השוואת תפקידים", "Compare roles") + "</a></div>";
    }
    if (kind === "design") {
      var brands = UI().BRANDS;
      return head(L("עיצוב", "Design"), L("ארבעה עיצובים לדוגמה. כל בית כנסת מקבל עיצוב שנבנה עבורו.", "Four example designs. Every shul gets a design made for it.")) +
        '<div class="pop-themes">' + UI().THEMES.map(function (t) { return '<button class="pop-theme" data-theme-pick="' + t.id + '" aria-pressed="' + (S.prefs.theme === t.id) + '"><span class="sw" style="background:' + t.c + '"></span><b>' + esc(S.N(t)) + "</b></button>"; }).join("") + "</div>" +
        '<div class="pop-sub">' + L("צבע מותג (תצוגה בלבד)", "Brand color (preview only)") + '</div><div class="pop-brands"><button class="brand-dot none" data-brand="" aria-pressed="' + !S.prefs.brand + '" title="' + L("ברירת המחדל של העיצוב", "Design default") + '">' + L("רגיל", "Default") + "</button>" +
        Object.keys(brands).map(function (k) { return '<button class="brand-dot" data-brand="' + k + '" aria-pressed="' + (S.prefs.brand === k) + '" title="' + k + '" style="background:' + brands[k] + '"></button>'; }).join("") + "</div>" +
        (S.prefs.theme === "royal" ? '<p class="pop-note">' + L("בעיצוב המלכותי הזהב הוא צבע המותג.", "Royal Elegant keeps its gold as the brand color.") + "</p>" : "") +
        '<div class="pop-links"><a href="#/showcase/design">' + L("סטודיו העיצוב", "Open the design studio") + "</a></div>";
    }
    if (kind === "time") {
      return head(L("זמן ההדגמה", "Demo time"), L("מציג את המסך והאתר ברגע אחר בשבוע ההדגמה. לא משנה דבר במערכת.", "Shows the screen and site at another moment of the demo week. Changes nothing in the system.")) +
        '<div class="pop-list">' + MOMENTS.map(function (m) { return '<button class="pop-item compact" data-moment="' + m[0] + '" aria-pressed="' + (momentKey() === m[0]) + '">' + ic("clock", 18) + "<span><b>" + esc(L(m[1], m[2])) + "</b></span></button>"; }).join("") + "</div>";
    }
    return head(L("פקדי הדגמה", "Demo controls"), L("משנים את ההצגה בלבד, לא את המוצר.", "These change the presentation, not the product.")) +
      '<div class="pop-list">' +
      '<a class="pop-item compact" href="#/proposal">' + ic("mail") + "<span><b>" + L("בקשת הדגמה אישית והצעת מחיר", "Request a personal demo and proposal") + "</b></span></a>" +
      '<button class="pop-item compact" data-act="time">' + ic("clock") + "<span><b>" + L("זמן ההדגמה", "Demo time") + "</b></span></button>" +
      '<a class="pop-item compact" href="#/showcase/design">' + ic("palette") + "<span><b>" + L("סטודיו העיצוב", "Design studio") + "</b></span></a>" +
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
    pop.querySelectorAll("[data-moment]").forEach(function (b) { b.addEventListener("click", function () { setMoment(b.getAttribute("data-moment")); }); });
    pop.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    var t = pop.querySelector('[data-act="time"]'); if (t) t.addEventListener("click", function (e) { e.stopPropagation(); toggle("time", null); });
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
