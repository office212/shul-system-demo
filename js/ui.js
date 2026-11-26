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
    sparkle: ic('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
    play: ic('<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5.5 3.5-5.5 3.5z"/>'),
    globe: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 2.6 15.2 0 18M12 3c-2.6 2.8-2.6 15.2 0 18"/>'),
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

  /* the Shul System mark: a shul's arch, a gold inner arch and an open door. The sample
     congregation keeps its own logo (logo(), above), as each shul's identity is its own. */
  function mark(cls) {
    return '<svg class="bm ' + (cls || "") + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<path d="M6.5 43.5V22a17.5 17.5 0 0 1 35 0v21.5z" fill="currentColor"/>' +
      '<path d="M14 43.5V22.5a10 10 0 0 1 20 0v21" fill="none" stroke="var(--bm-gold, #e0a92e)" stroke-width="2.6"/>' +
      '<path d="M20.4 43.5V23a3.6 3.6 0 0 1 7.2 0v20.5z" fill="var(--bm-door, #fff)"/></svg>';
  }
  function wordmark() { return '<b class="bm-word" dir="ltr">Shul <span>System</span></b>'; }

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
    { id: "classic", kin: "classic", he: "ירושלים", en: "Jerusalem", c: "linear-gradient(135deg,#efe6d6 50%,#1d3a6b 50%)", dhe: "אבן חמה, כחול עמוק ונגיעות נחושת. סריף מודרני בכותרות.", den: "Warm stone, deep blue and brass. A modern serif for headings." },
    { id: "modern", kin: "modern", he: "נקי", en: "Clear", c: "linear-gradient(135deg,#ffffff 50%,#2348d6 50%)", dhe: "לבן חד, כחול אחד חזק וטיפוגרפיה הדוקה. עכשווי ושקט.", den: "Crisp white, one strong blue, tight type. Contemporary and calm." },
    { id: "warm", kin: "warm", he: "חם", en: "Warm", c: "linear-gradient(135deg,#f6e3d1 50%,#b4532a 50%)", dhe: "חול וחימר, כותרות מעוגלות וכפתורים רכים. מזמין ומשפחתי.", den: "Sand and clay, rounded headings, soft pill buttons. Welcoming." },
    { id: "royal", kin: "royal", dark: true, he: "מלכותי", en: "Royal", c: "linear-gradient(135deg,#0c1628 50%,#e0c48c 50%)", dhe: "כחול לילה ושמפניה, סריף אלגנטי. חגיגי ומכובד.", den: "Night navy and champagne, an elegant serif. Festive and dignified." },
    { id: "heichal", kin: "royal", dark: true, lux: true, he: "היכל", en: "Heichal", c: "linear-gradient(135deg,#0b0b0d 50%,#d6b36a 50%)", dhe: "שיש שחור ועלי זהב, סריף קלאסי. חגיגי כמו היכל.", den: "Black marble and gold leaf, a classic serif. As solemn as the heichal." },
    { id: "parochet", kin: "royal", dark: true, lux: true, he: "פרוכת", en: "Parochet", c: "linear-gradient(135deg,#3a0e19 50%,#e2bf7a 50%)", dhe: "קטיפת יין ורקמת זהב, כותרות עבות. חם ומלכותי.", den: "Wine velvet and gold embroidery, bold headings. Warm and regal." },
    { id: "emerald", kin: "royal", dark: true, lux: true, he: "אזמרגד", en: "Emerald", c: "linear-gradient(135deg,#0d2a21 50%,#dcc07f 50%)", dhe: "ירוק יער עמוק וזהב עתיק. שקט ועשיר.", den: "Deep forest green and antique gold. Quiet and rich." },
    { id: "platinum", kin: "royal", dark: true, lux: true, he: "פלטינה", en: "Platinum", c: "linear-gradient(135deg,#15181c 50%,#dfe3e8 50%)", dhe: "גרפיט וכסף מוברש, אותיות דקות. עכשווי ויוקרתי.", den: "Graphite and brushed silver, light type. Contemporary and luxurious." },
    { id: "techelet", kin: "classic", lux: true, he: "תכלת", en: "Techelet", c: "linear-gradient(135deg,#eaf2fb 50%,#1f5fae 50%)", dhe: "לבן ותכלת של פתיל הציצית, עם כסף. נקי ומאיר.", den: "White and the blue of the tzitzit thread, with silver. Clean and bright." },
    { id: "kotel", kin: "classic", lux: true, he: "כותל", en: "Kotel", c: "linear-gradient(135deg,#e7dcc6 50%,#525a2f 50%)", dhe: "אבן ירושלמית, זית וארד, פינות ישרות כמו אבני גזית.", den: "Jerusalem stone, olive and bronze, square-cut like ashlar." },
    { id: "sefer", kin: "classic", lux: true, he: "ספר", en: "Sefer", c: "linear-gradient(135deg,#f6f0e1 50%,#1b1712 50%)", dhe: "נייר שמנת ודיו שחור, מסודר כמו שער של ספר.", den: "Cream paper and black ink, set like the title page of a sefer." },
    { id: "marble", kin: "modern", lux: true, he: "שיש", en: "Marble", c: "linear-gradient(135deg,#ffffff 50%,#1a1a1a 50%)", dhe: "אבן לבנה, שחור וקו זהב דק. אותיות גדולות ושקטות.", den: "White stone, black and a hairline of gold. Large, quiet type." },
    { id: "argaman", kin: "warm", lux: true, he: "ארגמן", en: "Argaman", c: "linear-gradient(135deg,#f3e6f1 50%,#5a1f5e 50%)", dhe: "שנהב וארגמן עם זהב. נדיב וחגיגי.", den: "Ivory and royal purple with gold. Generous and festive." },
    { id: "erez", kin: "classic", lux: true, he: "ארז", en: "Erez", c: "linear-gradient(135deg,#ead9c2 50%,#6b3f22 50%)", dhe: "ארז ואגוז, העץ של הבימה, עם שמנת ופליז.", den: "Cedar and walnut, the wood of the bimah, with cream and brass." }
  ];
  function themeById(id) { return THEMES.filter(function (t) { return t.id === id; })[0] || THEMES[0]; }
  var BRANDS = { navy: "#1b3a5c", emerald: "#1f5f4a", plum: "#4b2e5a", slate: "#334155", teal: "#0f5e6b" };
  function curTheme() { return S.over.theme || S.prefs.theme; }
  function applyPrefs() {
    var h = document.documentElement, th = curTheme();
    h.lang = S.prefs.lang; h.dir = S.prefs.lang === "he" ? "rtl" : "ltr";
    var TH = themeById(th); th = TH.id;
    h.setAttribute("data-theme", th); h.setAttribute("data-kin", TH.kin);
    ["--primary", "--primary-hover", "--title-ink", "--head-ink", "--tv-head", "--tv-hi"].forEach(function (v) { h.style.removeProperty(v); });
    var c = BRANDS[S.prefs.brand];
    if (c && !TH.dark && !TH.lux) {
      h.style.setProperty("--primary", c); h.style.setProperty("--primary-hover", "color-mix(in srgb, " + c + " 82%, #ffffff)");
      h.style.setProperty("--title-ink", c); h.style.setProperty("--tv-head", c); h.style.setProperty("--tv-hi", c);
      h.style.setProperty("--head-ink", c);
    }
  }
  function setBrand(b) { S.prefs.brand = b || null; S.savePrefs(); applyPrefs(); }
  function setLang(l) { S.prefs.lang = l; S.savePrefs(); applyPrefs(); renderChrome(); render(); }
  function setTheme(t, quiet) { var changed = S.prefs.theme !== t; S.prefs.theme = t; S.savePrefs(); document.documentElement.classList.add("theming"); applyPrefs(); renderChrome(); setTimeout(function () { document.documentElement.classList.remove("theming"); }, 450); if (current && current.onTheme) current.onTheme(); if (changed && !quiet) { var th = THEMES.filter(function (x) { return x.id === t; })[0]; toast("<b>" + esc(S.N(th)) + "</b> · " + L("עיצוב לדוגמה. כל בית כנסת מקבל עיצוב משלו.", "An example design. Every shul gets its own."), null, null, 2600); } var f = document.querySelectorAll("iframe.tvpv"); f.forEach(function (x) { try { x.contentWindow.SHUL_TV_REFRESH && x.contentWindow.SHUL_TV_REFRESH(); } catch (e) {} }); }
  function setRole(r, go, dest) {
    var changed = S.prefs.role !== r;
    S.prefs.role = r; S.savePrefs();
    if (changed && window.SHUL_PRESENTER) window.SHUL_PRESENTER.roleCard(r);
    if (go !== false) { var h = dest || S.ROLES[r].home; if (location.hash === h) render(); else location.hash = h; } else render();
  }

  /* ---------- customization (presentation tools only) ---------- */
  var CUSTOM_ITEMS = [
    [I.palette, "עיצוב ומיתוג", "Visual design and branding", "לוגו, צבעים, גופנים, צורת המסכים והמסך, בזהות של בית הכנסת שלכם.", "Logo, colors, fonts, the look of every screen and the screen, in your shul's identity."],
    [I.edit, "שפה ותוכן כתוב", "Language and written content", "עברית, אנגלית או שתיהן, וכל מילה באתר, במסך, בדף השבת ובאימיילים, בסגנון שלכם.", "Hebrew, English or both, and every word on the site, the screen, the Shabbat bulletin and the emails, in your style."],
    [I.map, "המידע של בית הכנסת", "Your shul's information", "שם, כתובת, זמני תפילה, מניינים, שיעורים, נוסח ומנהגים.", "Name, address, davening times, minyanim, shiurim, nusach and minhagim."],
    [I.gear, "הגדרת היכולות הקיימות", "Configuration of existing features", "אילו מסכים פעילים, מה מוצג במסך, סוגי חיובים ונדרים, הרשאות לכל גבאי.", "Which screens are on, what the screen shows, charge and neder types, permissions for each gabbai."],
    [I.users, "התאמת תהליכי העבודה", "Adapting existing workflows", "תהליכי התשלום, ההצטרפות, היארצייטים והתרומות מותאמים לדרך שבה בית הכנסת שלכם עובד.", "Payment, joining, yahrzeit and donation flows are set up the way your shul works."]
  ];
  function customItemsHtml() {
    return '<div class="custom-grid">' + CUSTOM_ITEMS.map(function (c) { return '<div class="custom-item"><div class="ic">' + c[0] + "</div><div><b>" + L(c[1], c[2]) + "</b><span>" + L(c[3], c[4]) + "</span></div></div>"; }).join("") + "</div>";
  }
  function scopeNote() { return L("היקף ההתאמה נקבע יחד עם כל בית כנסת לפני תחילת העבודה. פיתוח של יכולות חדשות לגמרי אינו כלול אוטומטית.", "The scope of customization is agreed with each shul before work begins. Developing entirely new capabilities is not automatically included."); }
  function themePickerHtml() {
    return '<div class="theme-pick" role="group" aria-label="' + L("עיצוב לדוגמה", "Example design") + '">' + THEMES.map(function (t) {
      return '<button type="button" class="theme-card" data-pick-theme="' + t.id + '" aria-pressed="' + (S.prefs.theme === t.id) + '"><span class="sw-big" style="background:' + t.c + '"></span><b>' + esc(S.N(t)) + "</b><small>" + esc(L(t.dhe, t.den)) + "</small></button>";
    }).join("") + "</div>";
  }
  function renameHtml() {
    var sh = S.db.shul;
    return '<form class="rename" data-rename><div class="form-grid"><label class="field"><span>' + L("שם בית הכנסת בעברית", "Shul name in Hebrew") + '</span><input name="he" maxlength="40" value="' + esc(sh.he) + '"></label><label class="field"><span>' + L("שם בית הכנסת באנגלית", "Shul name in English") + '</span><input name="en" maxlength="48" class="ltr" value="' + esc(sh.en) + '"></label></div><div class="row" style="margin-top:10px"><button class="btn primary">' + L("הצג את השם בכל המערכת", "Show it across the system") + '</button><button type="button" class="btn ghost" data-rename-reset>' + L("חזרה לשם לדוגמה", "Back to the sample name") + "</button></div></form>";
  }
  function bindCustom(root) {
    root.querySelectorAll("[data-pick-theme]").forEach(function (b) { b.addEventListener("click", function () { setTheme(b.getAttribute("data-pick-theme")); root.querySelectorAll("[data-pick-theme]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); }); });
    root.querySelectorAll("[data-rename]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault(); var he = f.he.value.trim(), en = f.en.value.trim();
        if (!he && !en) return;
        S.db.shul.he = he || en; S.db.shul.en = en || he; S.save(); closeModal(); renderChrome(); render();
        toast(L("השם עודכן בכל המערכת: בכותרת, במסך, בדף השבת, בקבלות ובאימיילים.", "The name now appears across the system: header, screen, Shabbat bulletin, receipts and emails."), L("לראות במסך", "See it on the screen"), function () { location.hash = "#/tv"; }, 6000);
      });
      f.querySelector("[data-rename-reset]").addEventListener("click", function () { var sd = window.SHUL_SEED().shul; S.db.shul.he = sd.he; S.db.shul.en = sd.en; S.save(); closeModal(); renderChrome(); render(); });
    });
  }
  function customModal() {
    var m = modal('<div class="eyebrow">' + L("בית הכנסת שלכם. המערכת שלכם.", "Your Shul. Your System.") + "</div><h2>" + L("המערכת מותאמת אישית לבית הכנסת שלכם", "Fully customized for your shul") + '</h2><p class="muted">' + L("זו לא תבנית קבועה. כל בית כנסת מקבל מערכת בזהות שלו. הנה מה שאפשר להתאים:", "This is not a fixed template. Every shul gets a system in its own identity. Here is what can be customized:") + "</p>" + customItemsHtml() +
      '<p class="tiny muted" style="margin-top:12px">' + scopeNote() + '</p><hr class="gold-line"><h3>' + L("נסו בעצמכם: שם בית הכנסת שלכם", "Try it: your shul's name") + "</h3>" + renameHtml() +
      '<h3 style="margin-top:18px">' + L("עיצובים לדוגמה", "Example designs") + '</h3><p class="small muted">' + L("אלה רק דוגמאות למה שאפשר. העיצוב שלכם ייבנה במיוחד עבורכם.", "These are only examples of what is possible. Your design is created especially for you.") + "</p>" + themePickerHtml() +
      '<div class="actions"><button class="btn primary" data-close>' + L("סגירה", "Close") + "</button></div>", { wide: true });
    bindCustom(m);
  }
  /* ---------- sales contact: verified by the owner, shown on every page except the screen itself ---------- */
  var SALES = window.SHUL_SALES_CONTACT || { email: "hanochhason@gmail.com", phone: "347-244-9382", tel: "+13472449382" };
  function ctaDemo(cls) {
    return '<a class="cta-demo' + (cls ? " " + cls : "") + '" href="#/proposal" aria-label="' + L("בקשת הדגמה", "Request a demo") + '">' + "<span class=\"cta-l\">" + L("בקשת הדגמה", "Request a demo") + '</span><span class="cta-s">' + L("הדגמה", "Demo") + "</span></a>";
  }
  function salesbarHtml() {
    return '<div class="sb-in"><a class="sb-brand" href="#/">' + mark() + "Shul System</a>" + '<span class="sb-dot" aria-hidden="true">·</span><a href="#/proposal">' + L("בקשת הדגמה", "Request a demo") + '</a><span class="sb-dot" aria-hidden="true">·</span><a href="mailto:' + SALES.email + '">' + I.mail.replace("<svg", '<svg width="14" height="14"') + '<bdi dir="ltr">' + esc(SALES.email) + '</bdi></a><span class="sb-dot" aria-hidden="true">·</span><a href="tel:' + SALES.tel + '">' + I.phone.replace("<svg", '<svg width="14" height="14"') + '<bdi dir="ltr">' + esc(SALES.phone) + '</bdi></a><span class="sb-dot" aria-hidden="true">·</span><span class="sb-week">' + L("שבוע ההדגמה: 15 עד 21 בנובמבר 2026, נתונים בדויים", "Demo week: Nov 15 to 21, 2026, fictional data") + "</span></div>";
  }
  var layout = "site";
  function renderChrome() {
    if (window.SHUL_PRESENTER) window.SHUL_PRESENTER.render();
    var head = document.getElementById("sitehead"), foot = document.getElementById("sitefoot"), sb = document.getElementById("salesbar");
    var pg = (location.hash || "#/").split("?")[0], salesPage = pg === "#/" || pg === "#" || pg === "" || pg === "#/proposal" || pg === "#/drawer";
    if (sb) { sb.hidden = layout === "bare" || salesPage; sb.innerHTML = sb.hidden ? "" : salesbarHtml(); }
    if (layout !== "site") { head.innerHTML = ""; foot.innerHTML = ""; renderBell(); return; }
    var r = S.role(), u = S.currentUser();
    var links = [["#/site", L("ראשי", "Home")], ["#/times", L("זמני תפילה", "Davening Times")], ["#/tv", L("המסך", "Screen")], ["#/donate", L("תרומה", "Donate")]];
    if (r === "member") links.push(["#/me", L("החשבון שלי", "My Account")]);
    if (r === "applicant") links.push(["#/join", L("הצטרפות", "Join")]);
    if (r === "finance" || r === "content" || r === "super") links.push(["#/gabbai", L("מערכת הגבאים", "Gabbai System")]);
    var signed = r !== "visitor";
    head.innerHTML = '<div class="wrap"><a class="brand" href="#/site">' + logo() + "<span><b>" + esc(S.N(S.db.shul)) + "</b><small>" + esc(L(S.db.shul.en, S.db.shul.he)) + "</small></span></a>" +
      '<nav class="nav" id="nav">' + links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("") + "</nav>" +
      '<span class="spacer"></span><div class="lang" role="group" aria-label="' + L("שפה", "Language") + '"><button aria-pressed="' + (S.prefs.lang === "he") + '" data-l="he">עב</button><button aria-pressed="' + (S.prefs.lang === "en") + '" data-l="en">EN</button></div>' +
      (signed ? '<div class="rel" id="bellHost"><button class="icon-btn" id="bellBtn" aria-label="' + L("התראות", "Notifications") + '">' + I.bell + "</button></div>" : "") +
      (signed ? '<button class="btn sm" id="acctBtn"><span class="nm">' + esc(u ? S.N(u).split(" ")[0] : "") + " · </span>" + L("יציאה", "Sign out") + "</button>" : '<button class="btn primary sm" id="signinBtn">' + L("כניסה", "Sign in") + "</button>") +
      ctaDemo("site-cta") + '<button class="icon-btn menu-btn" id="menuBtn" aria-label="' + L("תפריט", "Menu") + '">' + I.menu + "</button></div>";
    head.querySelectorAll(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-l")); }); });
    var mb = head.querySelector("#menuBtn"); mb.addEventListener("click", function () { head.classList.toggle("open"); });
    head.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { head.classList.remove("open"); }); });
    var bb = head.querySelector("#bellBtn"); if (bb) bb.addEventListener("click", openBell);
    var sb = head.querySelector("#signinBtn"); if (sb) sb.addEventListener("click", signInModal);
    var ab = head.querySelector("#acctBtn"); if (ab) ab.addEventListener("click", function () { setRole("visitor", true, "#/site"); toast(L("יצאת מהחשבון", "Signed out")); });
    markNav(); renderBell();
    foot.innerHTML = '<div class="wrap foot-grid"><div class="foot-brand">' + logo() + "<div><b>" + esc(S.N(S.db.shul)) + '</b><bdi dir="ltr">' + esc(S.db.shul.address) + "</bdi></div></div>" +
      '<nav class="foot-nav" aria-label="' + L("קישורים", "Links") + '">' + links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("") + "</nav>" +
      '<p class="foot-note">' + L("הדגמה: שם הקהילה, האנשים והנתונים בדויים. אין תשלומים אמיתיים.", "Demo: the congregation, people and data are fictional. No real payments.") + ' <a href="#/">' + L("על Shul System", "About Shul System") + "</a></p></div>";
  }
  function markNav() {
    var h = location.hash || "#/";
    document.querySelectorAll("#nav a").forEach(function (a) {
      var t = a.getAttribute("href"); a.classList.toggle("on", h.split("?")[0] === t || (t !== "#/site" && h.indexOf(t) === 0));
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
  var ADMIN_NAV = [
    { sec: ["סקירה", "Overview"], items: [["#/gabbai", "sparkle", "לוח בקרה", "Dashboard", "gabbai"]] },
    { sec: ["כספים", "Finance"], items: [["#/finance/home", "wallet", "כספים", "Finance", "finance"], ["#/finance/pay", "receipt", "תשלום / חיוב", "Payment / Charge", "finance"], ["#/finance/nedarim", "list", "נדרי שבת", "Shabbat nedarim", "finance"], ["#/finance/owes", "users", "מי חייב", "Who owes", "finance"], ["#/finance/members", "user", "מתפללים", "Members", "finance", "join"], ["#/finance/inbox", "inbox", "תשלומים בכרטיס", "Card payments", "finance", "inbox"], ["#/finance/more", "doc", "דוחות ומכתבי מס", "Reports and tax letters", "finance"]] },
    { sec: ["תוכן ומסך", "Content and screen"], items: [["#/gabbai/content", "megaphone", "תוכן המסך", "Screen content", "content", "yz"], ["#/gabbai/tv", "clock", "זמני תפילה והמסך", "Davening times and screen", "content"], ["#/gabbai/shabbat", "candle", "דף השבת", "Shabbat bulletin", "content"]] },
    { sec: ["ניהול", "Administration"], items: [["#/admin", "shield", "גבאים והרשאות", "Gabbaim and permissions", "super"], ["#/gabbai/activity", "list", "יומן פעילות", "Activity log", "super"], ["#/gabbai/landing", "edit", "דף הנחיתה", "Landing page", "super"], ["#/backup", "cloud", "גיבוי", "Backup", "finance"], ["#/gabbai/settings", "gear", "הגדרות", "Settings", "gabbai"]] }
  ];
  function navAllowed(need) { return need === "super" ? S.role() === "super" : S.can(need); }
  function badge(kind) {
    var n = 0, r = S.role();
    if (kind === "inbox") n = S.db.inbox.filter(function (x) { return x.status === "pending"; }).length;
    if (kind === "join" && r === "super") n = S.db.joinReqs.filter(function (j) { return j.status === "pending"; }).length;
    if (kind === "yz") n = S.db.yzRequests.filter(function (y) { return y.status === "pending"; }).length;
    return n ? '<span class="nav-count">' + n + "</span>" : "";
  }
  function adminShell(app, def) {
    var hsh = (location.hash || "").split("?")[0], best = "";
    ADMIN_NAV.forEach(function (g) { g.items.forEach(function (it) { if ((hsh === it[0] || hsh.indexOf(it[0] + "/") === 0) && it[0].length > best.length) best = it[0]; }); });
    if (!best && hsh.indexOf("#/finance/m/") === 0) best = "#/finance/members";
    var u = S.currentUser(), r = S.role();
    var nav = ADMIN_NAV.map(function (g) {
      var items = g.items.filter(function (it) { return navAllowed(it[4]); });
      if (!items.length) return "";
      return '<div class="side-sec"><div class="side-h">' + L(g.sec[0], g.sec[1]) + "</div>" + items.map(function (it) {
        return '<a href="' + it[0] + '" class="side-a' + (it[0] === best ? " on" : "") + '"' + (it[0] === best ? ' aria-current="page"' : "") + ">" + I[it[1]] + "<span>" + L(it[2], it[3]) + "</span>" + (it[5] ? badge(it[5]) : "") + "</a>";
      }).join("") + "</div>";
    }).join("");
    app.innerHTML = '<div class="admin"><aside class="admin-side" id="adminSide"><a class="side-brand" href="#/gabbai">' + logo() + "<span><b>" + esc(S.N(S.db.shul)) + "</b><small>" + L("מערכת הגבאים", "Gabbai system") + "</small></span></a><nav>" + nav + '</nav><div class="side-foot"><a class="side-a" href="#/tv">' + I.tv + "<span>" + L("המסך", "screen") + '</span></a><a class="side-a" href="#/site">' + I.map + "<span>" + L("אתר בית הכנסת", "Shul website") + '</span></a><a class="side-a" href="#/me">' + I.user + "<span>" + L("החשבון שלי", "My account") + "</span></a></div></aside>" +
      '<div class="admin-main"><header class="admin-top"><button class="icon-btn side-toggle" id="sideToggle" aria-label="' + L("תפריט", "Menu") + '">' + I.menu + '</button><div class="admin-title">' + esc(def.title ? (typeof def.title === "function" ? def.title() : def.title) : "") + "</div>" +
      (S.can("finance") ? '<div class="admin-search rel"><input id="admSearch" type="search" autocomplete="off" placeholder="' + L("חיפוש מתפלל", "Find a member") + '" aria-label="' + L("חיפוש מתפלל", "Find a member") + '"><div class="member-pick hidden" id="admRes"></div></div>' : '<span class="spacer"></span>') +
      '<div class="lang" role="group" aria-label="' + L("שפה", "Language") + '"><button aria-pressed="' + (S.prefs.lang === "he") + '" data-l="he">עב</button><button aria-pressed="' + (S.prefs.lang === "en") + '" data-l="en">EN</button></div>' +
      ctaDemo("adm-cta") + '<div class="rel" id="bellHost"><button class="icon-btn" id="bellBtn" aria-label="' + L("התראות", "Notifications") + '">' + I.bell + "</button></div>" +
      '<button class="user-chip" id="admUser" title="' + L("יציאה", "Sign out") + '"><span class="av">' + esc((u ? S.N(u) : "?").charAt(0)) + '</span><span class="uc-t"><b>' + esc(u ? S.N(u) : "") + "</b><small>" + esc(S.N(S.ROLES[r])) + '</small></span></button></header><div class="admin-content" id="adminContent"></div></div><div class="side-scrim" id="sideScrim"></div></div>';
    var shell = app.querySelector(".admin");
    var tog = function () { shell.classList.toggle("side-open"); };
    app.querySelector("#sideToggle").addEventListener("click", tog); app.querySelector("#sideScrim").addEventListener("click", tog);
    app.querySelectorAll(".admin-top .lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-l")); }); });
    app.querySelector("#bellBtn").addEventListener("click", openBell);
    app.querySelector("#admUser").addEventListener("click", function () { confirmBox(L("לצאת מהחשבון?", "Sign out?"), L("תחזרו לאתר בית הכנסת.", "You will return to the shul website."), L("יציאה", "Sign out"), function () { setRole("visitor", true, "#/site"); }); });
    var q = app.querySelector("#admSearch");
    if (q) q.addEventListener("input", function () {
      var res = app.querySelector("#admRes"), v = q.value.trim().toLowerCase();
      res.classList.toggle("hidden", !v);
      var list = S.db.members.filter(function (m) { return v && (m.he + " " + m.en + " " + m.phone).toLowerCase().indexOf(v) >= 0; }).slice(0, 7);
      res.innerHTML = list.map(function (m) { var b = S.balance(m.id); return '<button data-id="' + m.id + '"><span>' + esc(S.N(m)) + '</span><span class="num small">' + (b > 0 ? S.money(b) : b < 0 ? L("זכות ", "Credit ") + S.money(-b) : "✓") + "</span></button>"; }).join("") || '<p class="muted small" style="padding:10px">' + L("לא נמצא", "Not found") + "</p>";
      res.querySelectorAll("[data-id]").forEach(function (b) { b.addEventListener("click", function () { location.hash = "#/finance/m/" + b.getAttribute("data-id"); }); });
    });
    return app.querySelector("#adminContent");
  }
  function parseHash() {
    var h = (location.hash || "#/").replace(/^#/, "");
    var q = h.split("?"), path = q[0] || "/", params = {};
    (q[1] || "").split("&").forEach(function (kv) { if (kv) { var p = kv.split("="); params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); } });
    return { path: path, params: params };
  }
  function render() {
    var ph = parseHash(), path = ph.path, params = ph.params;
    var parts = path.split("/").filter(Boolean);
    var def = routes["/" + parts.join("/")], arg = null;
    if (!def && parts.length > 1) { def = routes["/" + parts.slice(0, -1).join("/") + "/*"]; arg = parts[parts.length - 1]; }
    if (!def) { def = routes["/"]; if (path !== "/" && params.frame !== "1") { try { history.replaceState(null, "", location.pathname + location.search + "#/"); } catch (e) {} setTimeout(function () { toast(L("הכתובת הזו לא קיימת, אז הגענו לדף הבית.", "That address doesn't exist, so here's the home page.")); }, 400); } }
    var framed = params.frame === "1" || params.embed === "1";
    var ok = allowed(def.need);
    layout = def.bare ? "bare" : def.layout === "xp" ? "xp" : (def.admin && ok) ? "admin" : (params.embed === "1" ? "bare-site" : "site");
    var b = document.body;
    b.classList.toggle("bare", layout === "bare"); b.classList.toggle("layout-xp", layout === "xp"); b.classList.toggle("layout-admin", layout === "admin"); b.classList.toggle("framed", framed);
    current = def;
    renderChrome();
    if (!ok) {
      var want = NEED_ROLE[def.need] || "super";
      app.innerHTML = '<div class="wrap page"><div class="card" style="max-width:560px;margin:40px auto;text-align:center"><div style="width:56px;height:56px;margin:0 auto 10px;border-radius:14px;background:var(--accent-soft);color:var(--accent-ink);display:grid;place-items:center">' + I.lock + "</div><h2>" + L("המסך הזה פתוח ל", "This screen is open to the ") + esc(S.N(S.ROLES[want])) + '</h2><p class="muted">' +
        L("במערכת כל אחד רואה רק את מה שמותר לו. בהדגמה אפשר להחליף תפקיד בלחיצה.", "In the system everyone sees only what they may use. In the demo you can switch roles in one press.") + '</p><div class="row" style="justify-content:center;gap:10px;flex-wrap:wrap"><button class="btn primary" id="switchRole">' + L("להמשיך בתור ", "Continue as ") + esc(S.N(S.ROLES[want])) + '</button><a class="btn" href="#/">' + L("חזרה לאתר הראשי", "Back to the main site") + "</a></div></div></div>";
      app.querySelector("#switchRole").addEventListener("click", function () { setRole(want, false); });
      markNav(); return;
    }
    if (layout !== "bare") window.scrollTo(0, 0);
    app.innerHTML = "";
    var target = layout === "admin" ? adminShell(app, def) : app;
    def.render(target, arg, params);
    var t = def.title ? (typeof def.title === "function" ? def.title() : def.title) : "";
    document.title = layout === "xp" ? (t || L("מערכת לניהול בית הכנסת", "Shul management platform")) + " | Shul System" : (t ? t + " | " : "") + S.N(S.db.shul);
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
  function flash(el) { if (!el) return; el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function start() {
    S.load();
    var p0 = parseHash().params;
    if (p0.as && S.ROLES[p0.as]) S.over.role = p0.as;
    if (p0.theme) S.over.theme = p0.theme;
    if (p0.clock) { var cp = p0.clock.split(":"); S.pinClock(+cp[0], +cp[1]); S.pinned().min0 = +cp[1]; }
    try { var c = sessionStorage.getItem("shulDemo.clock"); if (!p0.clock && c && c !== "live") { var p = c.split(":"); S.pinClock(+p[0], +p[1]); S.pinned().min0 = +p[1]; } } catch (e) {}
    applyPrefs();
    app = document.getElementById("app");
    renderChrome();
    window.addEventListener("hashchange", render);
    S.onChange(function (why) { if (why === "prefs") { applyPrefs(); renderChrome(); } renderBell(); if (why === "remote" || why === "prefs") rerender(); });
    document.addEventListener("click", function (e) { var host = document.getElementById("bellHost"); if (host && !host.contains(e.target)) { var p = host.querySelector(".bellpop"); if (p) p.remove(); } });
    render();
  }

  window.SHUL_UI = {
    I: I, logo: logo, mark: mark, wordmark: wordmark, B: B, timeAgo: timeAgo, modal: modal, closeModal: closeModal, confirmBox: confirmBox,
    toast: toast, pushToast: pushToast, customItemsHtml: customItemsHtml, scopeNote: scopeNote, themePickerHtml: themePickerHtml, renameHtml: renameHtml, bindCustom: bindCustom, route: route, render: render, setRole: setRole, setLang: setLang, setTheme: setTheme,
    h: h, on: on, pageHead: pageHead, crumbGabbai: crumbGabbai, download: download, customModal: customModal, THEMES: THEMES, themeById: themeById,
    start: start, renderChrome: renderChrome, SALES: SALES, ctaDemo: ctaDemo, signInModal: signInModal, setBrand: setBrand, BRANDS: BRANDS, flash: flash, applyPrefs: applyPrefs, curTheme: curTheme
  };
})();
