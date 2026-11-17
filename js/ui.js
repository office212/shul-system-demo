/* Shul system sales demo | shell: demo bar, header, router, modal, toasts, push, bell. */
(function () {
  "use strict";
  var S = window.SHUL, L = S.L, esc = S.esc;
  var routes = {};
  var app, current = null;

  /* ---------- icons ---------- */
  var P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  function ic(d) { return P + d + "</svg>"; }
  var I = {
    tv: ic('<rect x="2.5" y="4.5" width="19" height="13" rx="2"/><path d="M8 21h8M12 17.5V21"/>'),
    clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>'),
    wallet: ic('<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2"/>'),
    doc: ic('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>'),
    users: ic('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>'),
    user: ic('<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c.6-4 3.8-6.5 7.5-6.5s6.9 2.5 7.5 6.5"/>'),
    bell: ic('<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
    gear: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    heart: ic('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
    megaphone: ic('<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
    candle: ic('<path d="M12 3c1.5 1.7 1.5 3 0 4-1.5-1-1.5-2.3 0-4z"/><rect x="9.5" y="9" width="5" height="12" rx="1"/>'),
    shield: ic('<path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>'),
    cloud: ic('<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 18z"/><path d="M12 11v5M9.5 13.5 12 16l2.5-2.5"/>'),
    list: ic('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'),
    edit: ic('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    check: ic('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    print: ic('<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/>'),
    download: ic('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 20h16"/>'),
    lock: ic('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
    sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    refresh: ic('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
    star: ic('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
    up: ic('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    down: ic('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    eye: ic('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: ic('<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.3 6.3C3.6 8.1 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.2-1"/>'),
    trash: ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    sparkle: ic('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'),
    palette: ic('<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1-.8-1.4-.8-2.3 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7.2" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>'),
    map: ic('<path d="M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11z"/><circle cx="12" cy="10" r="2.3"/>'),
    phone: ic('<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>'),
    mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>'),
    menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    inbox: ic('<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>'),
    receipt: ic('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),
    flame: ic('<path d="M12 3c2.5 3 5 5.4 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.5 2 2.5 0-2.5-.8-4.4 1-7z"/>')
  };
  function logo(cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<path d="M8 44V20a16 16 0 0 1 32 0v24" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
      '<path d="M13 44V21a11 11 0 0 1 22 0v23" fill="none" stroke="var(--gold)" stroke-width="1.4"/>' +
      '<path d="M24 16v22M24 22c-3-1-5-3-5.5-6M24 22c3-1 5-3 5.5-6M24 28c-3.4-.8-6-3-6.8-6.2M24 28c3.4-.8 6-3 6.8-6.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M5 44h38" stroke="var(--gold)" stroke-width="1.6"/></svg>';
  }

  function B(s) { var p = String(s == null ? "" : s).split("|"); return S.prefs.lang === "en" ? (p[1] || p[0]) : p[0]; }
  function timeAgo(isoStr) {
    var m = Math.max(0, Math.round((Date.now() - new Date(isoStr).getTime()) / 60000));
    if (m < 1) return L("עכשיו", "just now");
    if (m < 60) return L("לפני " + m + " דק׳", m + " min ago");
    var h = Math.round(m / 60);
    if (h < 24) return L("לפני " + h + " שע׳", h + " hr ago");
    var d = Math.round(h / 24); return L("לפני " + d + " ימים", d + " days ago");
  }

  /* ---------- modal ---------- */
  function modal(html, opts) {
    opts = opts || {};
    closeModal();
    var back = document.createElement("div");
    back.className = "modal-back"; back.id = "modalBack";
    back.innerHTML = '<div class="modal ' + (opts.wide ? "wide" : "") + '" role="dialog" aria-modal="true">' + html + "</div>";
    back.addEventListener("click", function (e) { if (e.target === back && !opts.sticky) closeModal(); });
    document.body.appendChild(back);
    var m = back.firstChild;
    m.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
    var f = m.querySelector("input,select,textarea,button.primary"); if (f) setTimeout(function () { f.focus(); }, 30);
    return m;
  }
  function closeModal() { var b = document.getElementById("modalBack"); if (b) b.remove(); }
  function confirmBox(title, text, okLabel, onOk) {
    var m = modal("<h2>" + esc(title) + "</h2><p>" + text + '</p><div class="actions"><button class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary" id="cfOk">' + esc(okLabel) + "</button></div>");
    m.querySelector("#cfOk").addEventListener("click", function () { closeModal(); onOk(); });
  }

  /* ---------- toasts ---------- */
  function toast(msg, action, fn, ms) {
    var box = document.getElementById("toasts");
    var t = document.createElement("div"); t.className = "toast";
    t.innerHTML = '<span style="flex:1">' + msg + "</span>" + (action ? '<button type="button">' + esc(action) + "</button>" : "");
    if (action) t.querySelector("button").addEventListener("click", function () { t.remove(); fn(); });
    box.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || (action ? 7000 : 3800));
  }
  /* a simulated push notification, as it would appear on the person's phone */
  var ROLE_LABEL = function (to) {
    if (to === "members") return L("לכל המתפללים", "to all members");
    if (to === "all") return L("לכולם", "to everyone");
    if (S.ROLES[to]) return L("אל: ", "to: ") + S.N(S.ROLES[to]);
    var m = S.memberById(to); return m ? L("אל: ", "to: ") + S.N(m) : "";
  };
  function pushToast(to, he, en) {
    var box = document.getElementById("pushes"); if (!box) return;
    var p = document.createElement("div"); p.className = "push";
    p.innerHTML = '<div class="app" style="color:#fff">' + logo() + '</div><div><div class="t"><span>' + esc(S.N(S.db.shul)) + "</span><small>" + L("עכשיו", "now") + '</small></div><div class="b">' + esc(L(he, en)) + '</div><div class="who">' + L("התראת דחיפה מדומה ", "Simulated push ") + esc(ROLE_LABEL(to)) + "</div></div>";
    box.appendChild(p);
    setTimeout(function () { p.style.transition = "opacity .4s"; p.style.opacity = "0"; setTimeout(function () { p.remove(); }, 400); }, 5200);
    renderBell();
  }

  /* ---------- notifications for the signed-in demo person ---------- */
  function myNotifs() {
    var r = S.role(), u = S.currentUser();
    if (r === "visitor") return [];
    if (r === "applicant") return S.db.notifs.filter(function (n) { return n.to === "applicant" || (u && u.mid && (n.to === u.mid || n.to === "members" || n.to === "all")); });
    return S.db.notifs.filter(function (n) {
      if (n.to === "all") return true;
      if (r === "super") return true; /* the super admin gets everything, by design */
      if (n.to === r) return true;
      if (n.to === "members") return true;
      if (r === "finance" && n.to === "both") return true;
      if (u && u.mid && n.to === u.mid) return true;
      return false;
    });
  }
  function renderBell() {
    var b = document.getElementById("bellBtn"); if (!b) return;
    var n = myNotifs().filter(function (x) { return !x.read; }).length;
    var d = b.querySelector(".dot");
    if (n) { if (!d) { d = document.createElement("span"); d.className = "dot"; b.appendChild(d); } d.textContent = n; } else if (d) d.remove();
  }
  function openBell() {
    var host = document.getElementById("bellHost"); var old = host.querySelector(".bellpop");
    if (old) { old.remove(); return; }
    var on = S.db.pushOn[S.role()];
    var list = myNotifs().slice(0, 12);
    var pop = document.createElement("div"); pop.className = "bellpop";
    pop.innerHTML = '<div class="row between" style="padding:4px 6px 8px"><b>' + L("התראות", "Notifications") + "</b>" +
      (list.length ? '<button class="btn ghost sm" id="markAll">' + L("סמן הכל כנקרא", "Mark all read") + "</button>" : "") + "</div>" +
      (on ? '<div class="alert ok small" style="margin-bottom:8px">' + I.check.replace("<svg", '<svg width="18" height="18"') + L("התראות דחיפה פעילות במכשיר הזה (הדגמה)", "Push notifications are on for this device (demo)") + "</div>"
        : '<button class="btn primary block sm" id="enablePush" style="margin-bottom:8px">' + L("הפעל התראות", "Enable notifications") + "</button>") +
      (list.length ? list.map(function (n) { return '<div class="it ' + (n.read ? "" : "unread") + '"><div>' + esc(L(n.he, n.en)) + "<time>" + timeAgo(n.at) + "</time></div></div>"; }).join("")
        : '<p class="muted small" style="padding:8px">' + L("אין התראות עדיין", "No notifications yet") + "</p>");
    host.appendChild(pop);
    var ma = pop.querySelector("#markAll");
    if (ma) ma.addEventListener("click", function () { myNotifs().forEach(function (n) { n.read = true; }); S.save(); pop.remove(); renderBell(); });
    var ep = pop.querySelector("#enablePush");
    if (ep) ep.addEventListener("click", function () {
      pop.remove();
      var m = modal('<div style="text-align:center"><div style="width:56px;height:56px;margin:0 auto 10px;border-radius:14px;background:var(--accent-soft);color:var(--accent-ink);display:grid;place-items:center">' + I.bell + '</div><h2>' + L("לאפשר התראות?", "Allow notifications?") + '</h2><p class="muted">' +
        L("כך הדפדפן או הטלפון שואלים בפעם הראשונה. בהדגמה לא נשלחת התראה אמיתית: הכל מוצג על המסך.", "This is the browser or phone asking the first time. In the demo nothing is really sent: everything appears on screen.") +
        '</p></div><div class="actions" style="justify-content:center"><button class="btn" data-close>' + L("לא עכשיו", "Not now") + '</button><button class="btn primary" id="allowPush">' + L("אפשר", "Allow") + "</button></div>");
      m.querySelector("#allowPush").addEventListener("click", function () {
        closeModal(); S.db.pushOn[S.role()] = true; S.save();
        S.notify(S.currentUser() && S.currentUser().mid || S.role(), "התראות הופעלו. מעכשיו תקבלו עדכונים ישירות לטלפון.", "Notifications are on. You will now get updates right on your phone.");
      });
    });
  }

  /* ---------- demo bar + header ---------- */
  var THEMES = [
    { id: "stone", he: "אבן ירושלמית", en: "Jerusalem Stone", c: "linear-gradient(135deg,#efe3cc 50%,#0e2c4c 50%)" },
    { id: "marble", he: "שיש לבן", en: "White Marble", c: "linear-gradient(135deg,#ffffff 50%,#4aa3e0 50%)" },
    { id: "night", he: "תכלת לילה", en: "Night Tchelet", c: "linear-gradient(135deg,#0c1928 50%,#8cc4ee 50%)" },
    { id: "olive", he: "גליל וזית", en: "Galilee Olive", c: "linear-gradient(135deg,#e1e6d0 50%,#3d5a3a 50%)" }
  ];
  function applyPrefs() {
    var h = document.documentElement;
    h.lang = S.prefs.lang; h.dir = S.prefs.lang === "he" ? "rtl" : "ltr";
    h.setAttribute("data-theme", S.prefs.theme);
  }
  function setLang(l) { S.prefs.lang = l; S.savePrefs(); applyPrefs(); renderChrome(); render(); }
  function setTheme(t) { S.prefs.theme = t; S.savePrefs(); applyPrefs(); renderChrome(); var f = document.querySelectorAll("iframe.tvpv"); f.forEach(function (x) { try { x.contentWindow.SHUL_TV_REFRESH && x.contentWindow.SHUL_TV_REFRESH(); } catch (e) {} }); }
  function setRole(r, go) {
    S.prefs.role = r; S.savePrefs(); renderChrome();
    if (go !== false) { var h = S.ROLES[r].home; if (location.hash === h) render(); else location.hash = h; } else render();
  }

  function customModal() {
    modal('<div class="eyebrow">' + L("מותאם אישית במלואו", "Fully customizable") + "</div><h2>" + L("המערכת נבנית בדיוק כמו שבית הכנסת שלכם רוצה", "The system is built exactly the way your shul wants it") + "</h2>" +
      "<p>" + L("כל מה שרואים בהדגמה מותאם אישית לכל לקוח: העיצוב, הצבעים, הלוגו, הגופנים, כל הטקסטים בעברית ובאנגלית, מסך הטלוויזיה, זמני התפילה, דף השבת, טופס התרומה, התפקידים וההרשאות, וכל השאר.", "Everything in this demo is customized for each customer: the design, colors, logo, fonts, every text in Hebrew and English, the TV screen, the davening times, the Shabbat sheet, the donation form, the roles and permissions, and everything else.") + "</p>" +
      '<p class="muted">' + L("The system is fully customized exactly as the customer wants: design, texts, and everything else.", "המערכת מותאמת במלואה בדיוק כפי שהלקוח רוצה: העיצוב, הטקסטים וכל השאר.") + "</p>" +
      '<p class="small muted">' + L("ארבעת העיצובים בסרגל ההדגמה הם רק דוגמה. כל בית כנסת מקבל עיצוב משלו.", "The four looks in the demo bar are only examples. Every shul gets its own design.") + '</p><div class="actions"><button class="btn primary" data-close>' + L("הבנתי", "Got it") + "</button></div>");
  }

  function renderChrome() {
    var bar = document.getElementById("demobar");
    var pin = S.pinned();
    bar.innerHTML = '<div class="wrap"><span class="tag">DEMO</span>' +
      '<label><span class="hide-sm">' + L("צפייה בתור:", "View as:") + '</span><select id="roleSel" aria-label="' + L("תפקיד להדגמה", "Demo role") + '">' +
      Object.keys(S.ROLES).map(function (k) { return '<option value="' + k + '"' + (S.role() === k ? " selected" : "") + ">" + esc(S.N(S.ROLES[k])) + "</option>"; }).join("") + "</select></label>" +
      '<span class="swatches" role="group" aria-label="' + L("עיצוב", "Theme") + '">' + THEMES.map(function (t) { return '<button class="sw" title="' + esc(S.N(t)) + '" aria-label="' + esc(S.N(t)) + '" aria-pressed="' + (S.prefs.theme === t.id) + '" data-theme-id="' + t.id + '" style="background:' + t.c + '"></button>'; }).join("") + "</span>" +
      '<label class="hide-sm"><span>' + L("שעון:", "Clock:") + '</span><select id="clockSel">' +
      [["live", L("עכשיו", "Now")], ["5:375", L("שישי 6:15 בבוקר", "Friday 6:15 AM")], ["0:385", L("ראשון לפני הנץ", "Sunday before Netz")], ["5:940", L("שישי 3:40 אחה״צ", "Friday 3:40 PM")], ["5:1100", L("ליל שבת", "Friday night")], ["6:660", L("שבת בבוקר", "Shabbat morning")], ["2:1395", L("שלישי 11:15 בלילה", "Tuesday 11:15 PM")]]
        .map(function (o) { var sel = pin ? (o[0] === pin.dow + ":" + Math.round(pin.min0)) : o[0] === "live"; return '<option value="' + o[0] + '"' + (sel ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>" +
      '<span class="spacer"></span><button class="custom" id="customBtn">' + L("מותאם אישית במלואו", "Fully customizable") + "</button>" +
      '<button id="resetBtn" title="' + L("איפוס ההדגמה לנתונים המקוריים", "Reset the demo to its original data") + '">' + L("איפוס", "Reset") + "</button></div>";
    bar.querySelector("#roleSel").addEventListener("change", function (e) { setRole(e.target.value); });
    bar.querySelectorAll(".sw").forEach(function (b) { b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme-id")); }); });
    bar.querySelector("#customBtn").addEventListener("click", customModal);
    var cs = bar.querySelector("#clockSel");
    if (cs) cs.addEventListener("change", function () {
      var v = cs.value; if (v === "live") S.pinClock(null); else { var p = v.split(":"); S.pinClock(+p[0], +p[1]); S.pinned().min0 = +p[1]; }
      try { sessionStorage.setItem("shulDemo.clock", v); } catch (e) {}
      render();
    });
    bar.querySelector("#resetBtn").addEventListener("click", function () {
      confirmBox(L("לאפס את ההדגמה?", "Reset the demo?"), L("כל השינויים שעשיתם יימחקו והנתונים המדומים יחזרו למצבם המקורי.", "All your changes will be cleared and the fictional data returns to its original state."), L("איפוס", "Reset"), function () { S.reset(); toast(L("ההדגמה אופסה", "The demo was reset")); render(); });
    });

    var head = document.getElementById("sitehead");
    var r = S.role(), u = S.currentUser();
    var links = [["#/", L("ראשי", "Home")], ["#/times", L("זמני תפילה", "Davening Times")], ["#/tv", L("מסך הטלוויזיה", "TV Screen")], ["#/donate", L("תרומה", "Donate")]];
    if (r === "member") links.push(["#/me", L("החשבון שלי", "My Account")]);
    if (r === "applicant") links.push(["#/join", L("הצטרפות", "Join")]);
    if (r === "finance" || r === "content" || r === "super") links.push(["#/gabbai", L("מערכת הגבאים", "Gabbai System")]);
    var signed = r !== "visitor";
    head.innerHTML = '<div class="wrap"><a class="brand" href="#/">' + logo() + "<span><b>" + esc(S.N(S.db.shul)) + "</b><small>" + esc(L(S.db.shul.en, S.db.shul.he)) + "</small></span></a>" +
      '<nav class="nav" id="nav">' + links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("") + "</nav>" +
      '<span class="spacer"></span><div class="lang" role="group" aria-label="' + L("שפה", "Language") + '"><button aria-pressed="' + (S.prefs.lang === "he") + '" data-l="he">עב</button><button aria-pressed="' + (S.prefs.lang === "en") + '" data-l="en">EN</button></div>' +
      (signed ? '<div class="rel" id="bellHost"><button class="icon-btn" id="bellBtn" aria-label="' + L("התראות", "Notifications") + '">' + I.bell + "</button></div>" : "") +
      (signed ? '<button class="btn sm" id="acctBtn">' + esc(u ? S.N(u).split(" ")[0] : "") + " · " + L("יציאה", "Sign out") + "</button>" : '<button class="btn primary sm" id="signinBtn">' + L("כניסה", "Sign in") + "</button>") +
      '<button class="icon-btn menu-btn" id="menuBtn" aria-label="' + L("תפריט", "Menu") + '">' + I.menu + "</button></div>";
    head.querySelectorAll(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-l")); }); });
    var mb = head.querySelector("#menuBtn"); mb.addEventListener("click", function () { head.classList.toggle("open"); });
    head.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { head.classList.remove("open"); }); });
    var bb = head.querySelector("#bellBtn"); if (bb) bb.addEventListener("click", openBell);
    var sb = head.querySelector("#signinBtn"); if (sb) sb.addEventListener("click", signInModal);
    var ab = head.querySelector("#acctBtn"); if (ab) ab.addEventListener("click", function () { setRole("visitor"); toast(L("יצאת מהחשבון", "Signed out")); });
    markNav(); renderBell();
    var foot = document.getElementById("sitefoot");
    foot.innerHTML = '<div class="wrap"><div class="row">' + logo().replace("<svg", '<svg width="30" height="30" style="color:var(--primary)"') + "<span><b>" + esc(S.N(S.db.shul)) + "</b><br><bdi dir=\"ltr\">" + esc(S.db.shul.address) + "</bdi></span></div>" +
      '<div class="small">' + L("הדגמה: שם הקהילה, האנשים והנתונים בדויים. אין תשלומים אמיתיים.", "Demo: the congregation, people and data are fictional. No real payments.") + "<br>" +
      L("מותאם אישית במלואו: העיצוב, הטקסטים וכל השאר.", "Fully customizable: design, texts and everything else.") + "</div></div>";
  }
  function markNav() {
    var h = location.hash || "#/";
    document.querySelectorAll("#nav a").forEach(function (a) {
      var t = a.getAttribute("href"); a.classList.toggle("on", t === "#/" ? h === "#/" || h === "" : h.indexOf(t) === 0);
    });
  }
  function signInModal() {
    var m = modal("<h2>" + L("כניסה עם Google", "Sign in with Google") + '</h2><p class="muted">' +
      L("באתר האמיתי הכניסה היא עם חשבון Google בלבד. בהדגמה בוחרים חשבון לדוגמה:", "On the real site sign-in is with a Google account only. In the demo, pick a sample account:") + '</p><div class="stack">' +
      ["member", "content", "finance", "super", "applicant"].map(function (r) { var u = S.db.demoUsers[r]; return '<button class="tile" style="width:100%" data-r="' + r + '"><div class="ic">' + I.user + '</div><div style="text-align:start"><b>' + esc(S.N(u)) + "</b><span>" + esc(S.N(S.ROLES[r])) + " · " + esc(u.email) + "</span></div></button>"; }).join("") +
      '</div><div class="actions"><button class="btn" data-close>' + L("סגירה", "Close") + "</button></div>");
    m.querySelectorAll("[data-r]").forEach(function (b) { b.addEventListener("click", function () { closeModal(); setRole(b.getAttribute("data-r")); toast(L("נכנסת בתור ", "Signed in as ") + esc(S.N(S.db.demoUsers[b.getAttribute("data-r")]))); }); });
  }

  /* ---------- router ---------- */
  function route(path, def) { routes[path] = def; }
  function allowed(need) {
    if (!need) return true;
    var r = S.role();
    if (need === "signed") return r !== "visitor";
    if (need === "super") return r === "super";
    return S.can(need);
  }
  var NEED_ROLE = { finance: "finance", content: "content", gabbai: "finance", super: "super", member: "member", signed: "member" };
  function render() {
    var h = (location.hash || "#/").replace(/^#/, "");
    var q = h.split("?"), path = q[0] || "/", params = {};
    (q[1] || "").split("&").forEach(function (kv) { if (kv) { var p = kv.split("="); params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); } });
    var parts = path.split("/").filter(Boolean);
    var def = routes["/" + parts.join("/")], arg = null;
    if (!def && parts.length > 1) { def = routes["/" + parts.slice(0, -1).join("/") + "/*"]; arg = parts[parts.length - 1]; }
    if (!def) def = routes["/"];
    var isTv = def.bare || params.embed === "1";
    document.body.classList.toggle("bare", !!def.bare);
    document.getElementById("demobar").style.display = isTv ? "none" : "";
    document.getElementById("sitehead").style.display = isTv ? "none" : "";
    document.getElementById("sitefoot").style.display = isTv ? "none" : "";
    current = def;
    if (!allowed(def.need)) {
      var want = NEED_ROLE[def.need] || "super";
      app.innerHTML = '<div class="wrap page"><div class="card" style="max-width:560px;margin:40px auto;text-align:center"><div style="width:56px;height:56px;margin:0 auto 10px;border-radius:14px;background:var(--accent-soft);color:var(--accent-ink);display:grid;place-items:center">' + I.lock + "</div><h2>" + L("אין הרשאה", "No permission") + '</h2><p class="muted">' +
        L("המסך הזה מיועד ל", "This screen is for ") + esc(S.N(S.ROLES[want])) + L(". כל אחד רואה רק את מה שמותר לו.", ". Everyone sees only what they may use.") + '</p><button class="btn primary" id="switchRole">' + L("הדגמה: צפייה בתור ", "Demo: view as ") + esc(S.N(S.ROLES[want])) + "</button></div></div>";
      app.querySelector("#switchRole").addEventListener("click", function () { setRole(want, false); });
      markNav(); return;
    }
    if (!isTv) window.scrollTo(0, 0);
    app.innerHTML = "";
    def.render(app, arg, params);
    if (def.title) document.title = (typeof def.title === "function" ? def.title() : def.title) + " | " + S.N(S.db.shul);
    else document.title = S.N(S.db.shul) + " | " + L("הדגמה", "Demo");
    markNav(); renderBell();
  }
  function rerender() { if (current && current.live !== false) render(); }

  /* ---------- small helpers for views ---------- */
  function h(html) { var d = document.createElement("div"); d.innerHTML = html; return d; }
  function on(root, sel, ev, fn) { root.querySelectorAll(sel).forEach(function (el) { el.addEventListener(ev, function (e) { fn(e, el); }); }); }
  function pageHead(title, sub, crumbs, right) {
    return '<div class="page-head"><div>' + (crumbs ? '<div class="crumbs">' + crumbs + "</div>" : "") + "<h1>" + title + "</h1>" + (sub ? '<p class="muted" style="margin:6px 0 0">' + sub + "</p>" : "") + "</div>" + (right || "") + "</div>";
  }
  function crumbGabbai() { return '<a href="#/gabbai">' + L("מערכת הגבאים", "Gabbai System") + "</a>"; }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function start() {
    S.load();
    try { var c = sessionStorage.getItem("shulDemo.clock"); if (c && c !== "live") { var p = c.split(":"); S.pinClock(+p[0], +p[1]); S.pinned().min0 = +p[1]; } } catch (e) {}
    applyPrefs();
    app = document.getElementById("app");
    renderChrome();
    window.addEventListener("hashchange", render);
    S.onChange(function (why) { if (why === "prefs") { applyPrefs(); renderChrome(); } renderBell(); if (why === "remote" || why === "prefs") rerender(); });
    document.addEventListener("click", function (e) { var host = document.getElementById("bellHost"); if (host && !host.contains(e.target)) { var p = host.querySelector(".bellpop"); if (p) p.remove(); } });
    render();
  }

  window.SHUL_UI = {
    I: I, logo: logo, B: B, timeAgo: timeAgo, modal: modal, closeModal: closeModal, confirmBox: confirmBox,
    toast: toast, pushToast: pushToast, route: route, render: render, setRole: setRole, setLang: setLang, setTheme: setTheme,
    h: h, on: on, pageHead: pageHead, crumbGabbai: crumbGabbai, download: download, customModal: customModal, THEMES: THEMES,
    start: start, renderChrome: renderChrome, signInModal: signInModal
  };
})();
