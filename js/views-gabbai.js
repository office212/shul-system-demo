/* Shul system sales demo | gabbai system: home, davening times and TV settings, screen content,
   Shabbat bulletin, settings, landing texts, users and roles, broadcast, backup, activity log. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, L = S.L, esc = S.esc, I = UI.I, B = UI.B;
  var sv = function (svg, n) { return svg.replace("<svg", '<svg width="' + (n || 18) + '" height="' + (n || 18) + '"'); };
  function who() { var u = S.db.demoUsers[S.role()]; return u ? u.he + "|" + u.en : "|"; }
  function tvFrame(q) { return '<div class="tv-frame"><iframe class="tvpv" title="' + L("תצוגה מקדימה של המסך", "screen preview") + '" src="index.html#/tv?preview=1' + (q || "") + '" loading="lazy"></iframe></div>'; }

  /* ---------- gabbai home ---------- */
  UI.route("/gabbai", { admin: true,
    need: "gabbai", title: function () { return L("לוח בקרה", "Dashboard"); },
    render: function (app) {
      var r = S.role(), fin = S.can("finance"), con = S.can("content"), sup = r === "super";
      var jr = S.db.joinReqs.filter(function (j) { return j.status === "pending"; }).length;
      var yr = S.db.yzRequests.filter(function (y) { return y.status === "pending"; }).length;
      var pend = S.db.inbox.filter(function (x) { return x.status === "pending"; });
      var d = S.now(), z = S.zmanim(d), m = d.getHours() * 60 + d.getMinutes(), nx = S.ZLIST.filter(function (x) { return z[x[0]] > m; })[0];
      var hour = d.getHours(), greet = hour < 12 ? L("בוקר טוב", "Good morning") : hour < 18 ? L("צהריים טובים", "Good afternoon") : L("ערב טוב", "Good evening");
      var alerts = [];
      if (sup && jr) alerts.push('<a class="alert" href="#/finance/members">' + sv(I.users) + "<b>" + L("בקשות הצטרפות", "Join requests") + " (" + jr + ")</b><span>" + L("ממתינות לאישור", "waiting for approval") + "</span></a>");
      if (con && yr) alerts.push('<a class="alert" href="#/gabbai/content?type=yahrzeit">' + sv(I.candle) + "<b>" + L("בקשות יארצייט ממתפללים", "Yahrzeit requests from members") + " (" + yr + ")</b></a>");
      if (fin && pend.length) alerts.push('<a class="alert warn" href="#/finance/inbox">' + sv(I.inbox) + "<b>" + L("תשלומים בכרטיס לרישום", "Card payments to record") + " (" + pend.length + ")</b><span>" + L("לחיצה אחת לכל תשלום", "one tap each") + "</span></a>");
      var kpi = function (icn, k, v, s) { return '<div class="kpi"><div class="k">' + I[icn] + k + '</div><div class="v">' + v + "</div>" + (s ? '<div class="s">' + s + "</div>" : "") + "</div>"; };
      var kpis = [];
      if (fin) {
        var ym = S.todayIso().slice(0, 7), col = 0, open = 0, owing = 0;
        S.db.ledger.forEach(function (e) { if (e.type === "payment" && e.date.slice(0, 7) === ym) col += S.cents(e.amount); });
        S.db.members.forEach(function (mm) { var b = S.balance(mm.id); if (b > 0) { open += S.cents(b); owing++; } });
        kpis.push(kpi("wallet", L("נגבה החודש", "Collected this month"), S.money(col / 100)), kpi("receipt", L("יתרה פתוחה", "Open balance"), S.money(open / 100), owing + L(" מתפללים עם יתרה", " members with a balance")), kpi("inbox", L("תשלומים בכרטיס", "Card payments"), pend.length, L("ממתינים לרישום", "waiting to be recorded")));
      }
      if (con) {
        var pub = S.db.items.filter(function (i) { return i.status === "published" && window.SHUL_TV.visible(i, d, false); }).length;
        kpis.push(kpi("tv", L("במסך היום", "On the screen today"), pub, L("פריטים מפורסמים", "published items")), kpi("candle", L("יארצייטים השבוע", "Yahrzeits this week"), window.SHUL_TV.yahrzeitsThisWeek().length, L("מוצגים במסך", "shown on the screen")));
      }
      var quick = [];
      if (fin) quick.push(["#/finance/pay", "wallet", L("רישום תשלום", "Record a payment"), "primary"], ["#/finance/nedarim", "list", L("נדרי שבת", "Shabbat nedarim")], ["#/finance/owes", "users", L("מי חייב", "Who owes")]);
      if (con) quick.push(["#/gabbai/content", "megaphone", L("הודעה למסך", "Post to the screen"), fin ? "" : "primary"], ["#/gabbai/tv", "clock", L("זמני תפילה", "Davening times")], ["#/gabbai/shabbat", "candle", L("דף השבת", "Shabbat bulletin")]);
      var right = "";
      if (fin) {
        right += '<div class="card"><div class="card-head"><h3>' + L("רישומים ב-7 הימים האחרונים", "Ledger, last 7 days") + '</h3><a class="btn sm" href="#/finance/home">' + L("לכספים", "Finance") + "</a></div>" + S.db.ledger.filter(function (e) { return e.date >= "2026-11-10"; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 7).map(function (e) { var mm = S.memberById(e.mid); return '<div class="list-row"><span><b>' + esc(mm ? S.N(mm) : "") + '</b> <span class="muted small">' + esc(B(e.desc)) + '</span></span><b class="num ' + (e.type === "payment" ? "amt-pos" : "") + '">' + (e.type === "payment" ? "-" : "") + S.money(e.amount) + "</b></div>"; }).join("") + "</div>";
        var byM = {}, tot = 0; S.db.ledger.forEach(function (e) { if (e.type === "payment") { var k = e.method || "none"; byM[k] = (byM[k] || 0) + S.cents(e.amount); tot += S.cents(e.amount); } });
        right += '<div class="card"><div class="card-head"><h3>' + L("תשלומים לפי אמצעי", "Payments by method") + '</h3><a class="btn sm" href="#/finance/more?s=report">' + L("לדוח השנתי", "Annual report") + "</a></div>" + Object.keys(byM).sort(function (a, b) { return byM[b] - byM[a]; }).map(function (k) { var pct = Math.round(byM[k] / tot * 100); return '<div style="margin:10px 0"><div class="row between small"><span>' + (window.SHUL_MEMBER.method(k) || L("לא צוין", "Not given")) + '</span><b class="num">' + S.money(byM[k] / 100) + '</b></div><div class="mbar"><i style="width:' + pct + '%"></i></div></div>'; }).join("") + "</div>";
      }
      if (con) right += '<div class="card"><div class="card-head"><h3>' + L("מפורסם עכשיו במסך", "Published on the screen now") + '</h3><a class="btn sm" href="#/gabbai/content">' + L("לתוכן המסך", "Screen content") + "</a></div>" + S.db.items.filter(function (i) { return i.status === "published" && i.type !== "ticker"; }).slice(0, 6).map(function (i) { return '<div class="list-row"><span><b>' + esc(S.N(i.title)) + '</b> <span class="muted small">' + esc(S.N(i.text)).slice(0, 56) + "</span></span></div>"; }).join("") + "</div>";
      app.innerHTML = '<div class="wrap page"><div class="dash-hello"><div><h1>' + greet + ", " + esc(S.N(S.currentUser()).split(" ")[0]) + '</h1><p class="muted" style="margin:6px 0 0">' + esc(S.hebDate(d)) + " · " + esc(S.fmtDateLong(d)) + (nx ? " · " + L("הזמן הבא: ", "Next: ") + L(nx[1], nx[2]) + " " + S.hm(z[nx[0]], true) : "") + '</p></div><span class="badge accent">' + esc(S.N(S.ROLES[r])) + "</span></div>" +
        (alerts.length ? '<div class="stack" style="margin-bottom:16px">' + alerts.join("") + "</div>" : "") +
        (kpis.length ? '<div class="kpis">' + kpis.join("") + "</div>" : "") +
        '<div class="quick">' + quick.map(function (q) { return '<a href="' + q[0] + '" class="' + (q[3] || "") + '">' + I[q[1]] + q[2] + "</a>"; }).join("") + "</div>" +
        '<div class="dash-grid"><div class="card"><div class="card-head"><h3>' + L("עכשיו במסך", "On the screen now") + '</h3><a class="btn sm" href="#/tv">' + L("פתיחה", "Open") + "</a></div>" + tvFrame() + "</div><div class=\"stack\">" + right + "</div></div></div>";
    }
  });
  /* ---------- davening times + TV settings ---------- */
  var GROUPS = [["weekday", "ימי חול (א׳-ה׳)", "Weekdays (Sun-Thu)"], ["friday", "ערב שבת", "Erev Shabbat"], ["shabbat", "שבת", "Shabbat"]];
  UI.route("/gabbai/tv", { admin: true,
    need: "content", title: function () { return L("זמני תפילה והמסך", "Davening times and screen"); },
    render: function (app) {
      var sup = S.role() === "super", t = S.db.tvDisplay;
      var plist = function (g) {
        return S.db.prayers.filter(function (p) { return p.group === g; }).sort(function (a, b) { return (window.SHUL_TV.prayerTime(a) || 0) - (window.SHUL_TV.prayerTime(b) || 0); }).map(function (p) {
          var days = p.days === "days" ? '<span class="badge accent">' + L("רק ביום ", "Only on ") + (p.weekdays || []).map(function (w) { return S.dayName(w); }).join(", ") + "</span>" : "";
          return '<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div><b>' + esc(S.N(p)) + "</b> " + days + (p.rel ? ' <span class="badge">' + L("מוצע לפי צאת שבת", "From Shabbat ends") + "</span>" : "") + '</div><div class="row"><b class="num" style="font-size:18px">' + S.hm(window.SHUL_TV.prayerTime(p), true) + '</b><button class="btn sm" data-edit="' + p.id + '">' + L("עריכה", "Edit") + '</button><button class="btn sm ghost" data-del="' + p.id + '">' + L("מחיקה", "Delete") + "</button></div></div>";
        }).join("");
      };
      var texts = window.SHUL_TV.TV_TEXTS, tv = S.db.tvTexts;
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("זמני תפילה והמסך", "Davening Times and screen"), L("כל שינוי מופיע במסך תוך שנייה, בלי לרענן.", "Every change shows on the screen within a second, no refresh needed."), UI.crumbGabbai()) +
        '<div class="grid g2" style="align-items:start"><div class="stack">' + GROUPS.map(function (g) { return '<div class="card"><div class="card-head"><h3>' + L(g[1], g[2]) + '</h3><button class="btn soft sm" data-add="' + g[0] + '">' + sv(I.plus, 16) + L("זמן חדש", "New time") + "</button></div>" + plist(g[0]) + "</div>"; }).join("") + "</div>" +
        '<div class="stack" style="position:sticky;top:120px"><div class="card"><div class="card-head"><h3>' + L("תצוגה חיה של המסך", "Live screen preview") + '</h3><a class="btn sm" href="#/tv">' + L("פתיחה", "Open") + "</a></div>" + tvFrame() + "</div>" +
        (sup ? '<div class="card" id="brightness"><h3>' + sv(I.sun) + " " + L("בהירות המסך", "Screen brightness") + '</h3><div class="row" style="margin-bottom:12px">' + [["off", "כבוי", "Off"], ["manual", "ידני", "Manual"], ["auto", "אוטומטי", "Automatic"]].map(function (x) { return '<button class="chip" data-bm="' + x[0] + '" aria-pressed="' + (t.mode === x[0]) + '">' + L(x[1], x[2]) + "</button>"; }).join("") + "</div>" +
          (t.mode !== "off" ? '<label class="field"><span>' + L("רמה: ", "Level: ") + '<b id="lvlV">' + t.level + '%</b></span><input type="range" min="20" max="100" step="1" id="lvl" value="' + t.level + '"></label>' : "") +
          (t.mode === "auto" ? '<div class="form-grid" style="margin-top:10px"><label class="field"><span>' + L("משעה", "From") + '</span><input type="time" id="bFrom" value="' + t.from + '"></label><label class="field"><span>' + L("עד", "Until") + '</span><select id="bToKind"><option value="alot"' + (t.toKind === "alot" ? " selected" : "") + ">" + L("דקות לפני עלות השחר", "minutes before Alot") + '</option><option value="time"' + (t.toKind === "time" ? " selected" : "") + ">" + L("שעה קבועה", "a fixed time") + "</option></select></label>" + (t.toKind === "alot" ? '<label class="field"><span>' + L("דקות", "Minutes") + '</span><input type="number" id="bAlot" min="0" max="180" value="' + t.alotBefore + '"></label>' : '<label class="field"><span>' + L("שעה", "Time") + '</span><input type="time" id="bTo" value="' + t.to + '"></label>') + '</div><p class="tiny muted">' + L("בחלון הזה המסך מתעמעם, ומחוצה לו בהירות מלאה. במסכים קטנים (טלפון) אין עמעום.", "Within this window the screen dims; outside it, full brightness. Small screens (phones) never dim.") + "</p>" : "") +
          '<hr class="gold-line"><h3>' + sv(I.refresh) + " " + L("רענון המסך מרחוק", "Remote screen refresh") + '</h3><p class="small muted">' + L("כל מסך פתוח טוען את עצמו מחדש תוך שניות. לא בשבת ולא בחג: הלחיצה מחכה לצאת השבת.", "Every open screen reloads itself within seconds. Never on Shabbat or Yom Tov: a press waits until after Shabbat.") + "</p>" +
          '<div class="row"><button class="btn" id="reload">' + L("רענן את המסך", "Refresh the screen") + '</button><span class="small muted">' + (t.lastReload ? L("רענון אחרון: ", "Last refresh: ") + UI.timeAgo(t.lastReload) : L("עדיין לא רוענן מרחוק", "Not refreshed remotely yet")) + "</span></div></div>" : "") +
        '<div class="card"><h3>' + L("הטקסטים במסך", "Screen texts") + '</h3><p class="small muted">' + L("כל מילה במסך ניתנת לעריכה, בעברית ובאנגלית.", "Every word on the screen can be edited, in Hebrew and English.") + '</p><form id="tt" class="stack">' +
          Object.keys(texts).map(function (k) { var o = tv[k] || {}; return '<div class="form-grid"><label class="field"><span class="small">' + esc(texts[k].he) + '</span><input name="he_' + k + '" value="' + esc(o.he || "") + '" placeholder="' + esc(texts[k].he) + '"></label><label class="field"><span class="small ltr">' + esc(texts[k].en) + '</span><input name="en_' + k + '" class="ltr" value="' + esc(o.en || "") + '" placeholder="' + esc(texts[k].en) + '"></label></div>'; }).join("") +
          '<div class="row"><button class="btn primary">' + L("שמירה", "Save") + '</button><button type="button" class="btn ghost" id="ttReset">' + L("חזרה לברירת המחדל", "Back to defaults") + "</button></div></form></div></div></div></div>";
      UI.on(app, "[data-add]", "click", function (e, b) { prayerForm(null, b.getAttribute("data-add")); });
      UI.on(app, "[data-edit]", "click", function (e, b) { prayerForm(S.db.prayers.filter(function (p) { return p.id === b.getAttribute("data-edit"); })[0]); });
      UI.on(app, "[data-del]", "click", function (e, b) {
        var p = S.db.prayers.filter(function (x) { return x.id === b.getAttribute("data-del"); })[0];
        UI.confirmBox(L("למחוק את הזמן?", "Delete this time?"), esc(S.N(p)) + " " + S.hm(window.SHUL_TV.prayerTime(p), true), L("מחיקה", "Delete"), function () { S.db.prayers = S.db.prayers.filter(function (x) { return x !== p; }); S.log("times", "מחק זמן תפילה: " + p.he, "Deleted davening time: " + p.en); S.save(); UI.render(); });
      });
      var tt = app.querySelector("#tt");
      tt.addEventListener("submit", function (e) { e.preventDefault(); Object.keys(texts).forEach(function (k) { var he = tt["he_" + k].value.trim(), en = tt["en_" + k].value.trim(); if (he || en) tv[k] = { he: he, en: en }; else delete tv[k]; }); S.log("texts", "עדכן טקסטים במסך", "Updated screen texts"); S.save(); UI.toast(L("נשמר. המסך התעדכן.", "Saved. The screen is updated.")); });
      app.querySelector("#ttReset").addEventListener("click", function () { S.db.tvTexts = {}; S.save(); UI.render(); UI.toast(L("הטקסטים במסך חזרו לברירת המחדל", "Screen texts are back to the defaults")); });
      if (sup) {
        UI.on(app, "[data-bm]", "click", function (e, b) { t.mode = b.getAttribute("data-bm"); S.log("texts", "בהירות המסך: " + t.mode, "screen brightness: " + t.mode); S.save(); UI.render(); });
        var lvl = app.querySelector("#lvl"); if (lvl) { lvl.addEventListener("input", function () { app.querySelector("#lvlV").textContent = lvl.value + "%"; }); lvl.addEventListener("change", function () { t.level = +lvl.value; S.save(); UI.toast(L("הבהירות עודכנה", "Brightness updated")); }); }
        ["bFrom", "bTo", "bAlot"].forEach(function (id) { var el = app.querySelector("#" + id); if (el) el.addEventListener("change", function () { if (id === "bFrom") t.from = el.value; if (id === "bTo") t.to = el.value; if (id === "bAlot") t.alotBefore = +el.value; S.save(); }); });
        var tk = app.querySelector("#bToKind"); if (tk) tk.addEventListener("change", function () { t.toKind = tk.value; S.save(); UI.render(); });
        app.querySelector("#reload").addEventListener("click", function () {
          UI.confirmBox(L("לרענן את המסך?", "Refresh the screen?"), L("כל מסך פתוח ייטען מחדש תוך כמה שניות.", "Every open screen will reload within a few seconds."), L("רענון", "Refresh"), function () {
            t.reloadAt = Date.now(); t.lastReload = new Date().toISOString(); S.log("texts", "רענון מסך מרחוק", "Remote screen refresh"); S.save();
            UI.toast(S.dayState(S.now()) === "shabbat" ? L("נשלח. המסך ירוענן אחרי צאת השבת.", "Sent. The screen refreshes after Shabbat ends.") : L("נשלח. מסך פתוח בלשונית אחרת ייטען מחדש עכשיו.", "Sent. A screen open in another tab reloads now."));
            UI.render();
          });
        });
      }
    }
  });
  function prayerForm(p, group) {
    var isNew = !p; p = p || { id: S.uid("p"), he: "", en: "", time: 1020, group: group, days: "all" };
    var md = UI.modal("<h2>" + (isNew ? L("זמן תפילה חדש", "New davening time") : L("עריכת זמן תפילה", "Edit davening time")) + '</h2><form id="pf"><div class="form-grid"><label class="field"><span>' + L("שם בעברית", "Hebrew name") + '</span><input name="he" required value="' + esc(p.he) + '" placeholder="מנחה"></label><label class="field"><span>' + L("שם באנגלית", "English name") + '</span><input name="en" class="ltr" required value="' + esc(p.en) + '" placeholder="Mincha"></label><label class="field"><span>' + L("שעה", "Time") + '</span><input name="time" type="time" required value="' + (p.rel ? S.toInputTime(window.SHUL_TV.prayerTime(p)) : S.toInputTime(p.time)) + '"></label></div>' +
      '<label class="field" style="margin-top:12px"><span>' + L("קבוצה", "Group") + '</span><select name="group">' + GROUPS.map(function (g) { return '<option value="' + g[0] + '"' + (p.group === g[0] ? " selected" : "") + ">" + L(g[1], g[2]) + "</option>"; }).join("") + "</select></label>" +
      '<div id="daysBox" style="margin-top:12px"><span class="small" style="font-weight:700">' + L("באילו ימים", "Which days") + '</span><div class="row" style="margin-top:6px"><label class="check"><input type="radio" name="days" value="all"' + (p.days !== "days" ? " checked" : "") + "> " + L("ראשון עד חמישי", "Sunday to Thursday") + '</label><label class="check"><input type="radio" name="days" value="days"' + (p.days === "days" ? " checked" : "") + "> " + L("ימים מסוימים", "Specific days") + '</label></div><div class="row" id="wdays" style="margin-top:8px">' + [0, 1, 2, 3, 4].map(function (w) { return '<button type="button" class="chip" data-w="' + w + '" aria-pressed="' + ((p.weekdays || []).indexOf(w) >= 0) + '">' + S.dayName(w) + "</button>"; }).join("") + "</div></div>" +
      (p.rel ? '<p class="small muted">' + L("כרגע הזמן מחושב: צאת שבת פחות 3 דקות. שמירת שעה תקבע זמן קבוע.", "Currently computed: Shabbat ends minus 3 minutes. Saving a time sets a fixed time.") + "</p>" : "") +
      '<p class="err hidden" id="pErr"></p><div class="actions"><button type="button" class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary">' + L("שמירה", "Save") + "</button></div></form>");
    var f = md.querySelector("#pf"), wd = (p.weekdays || []).slice();
    function sync() { var g = f.group.value; md.querySelector("#daysBox").classList.toggle("hidden", g !== "weekday"); md.querySelector("#wdays").classList.toggle("hidden", f.days.value !== "days"); }
    f.addEventListener("change", sync); sync();
    UI.on(md, "[data-w]", "click", function (e, b) { var w = +b.getAttribute("data-w"), i = wd.indexOf(w); if (i >= 0) wd.splice(i, 1); else wd.push(w); b.setAttribute("aria-pressed", i < 0); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var er = md.querySelector("#pErr");
      if (f.group.value === "weekday" && f.days.value === "days" && !wd.length) { er.textContent = L("נא לבחור לפחות יום אחד.", "Please choose at least one day."); er.classList.remove("hidden"); return; }
      var newT = S.fromInputTime(f.time.value), oldT = window.SHUL_TV.prayerTime(p);
      p.he = f.he.value.trim(); p.en = f.en.value.trim(); p.group = f.group.value;
      if (!(p.rel && newT === oldT)) { p.time = newT; delete p.rel; }
      p.days = p.group === "weekday" ? f.days.value : undefined; p.weekdays = p.days === "days" ? wd.sort() : undefined;
      if (isNew) S.db.prayers.push(p);
      S.log("times", (isNew ? "הוסיף" : "עדכן") + " זמן תפילה: " + p.he + " " + S.hm(window.SHUL_TV.prayerTime(p), false), (isNew ? "Added" : "Updated") + " davening time: " + p.en + " " + S.hm(window.SHUL_TV.prayerTime(p), false));
      S.notify("content", "זמן תפילה עודכן: " + p.he + " " + S.hm(window.SHUL_TV.prayerTime(p), false), "Davening time updated: " + p.en + " " + S.hm(window.SHUL_TV.prayerTime(p), false));
      S.save(); UI.closeModal(); UI.toast(L("נשמר. המסך כבר מציג את הזמן החדש.", "Saved. The screen already shows the new time.")); UI.render();
    });
  }

  /* ---------- screen content ---------- */
  var TYPES = [["announcement", "הודעה", "Announcement"], ["mazaltov", "מזל טוב", "Mazal Tov"], ["flyer", "פלייר", "Flyer"], ["sponsor", "נתרם על ידי (קידוש, סעודה)", "Donated by (Kiddush, Seudah)"], ["parnas", "פרנס היום ונר למאור", "Parnas Hayom and Ner Lamaor"], ["dedication", "הקדשה", "Dedication"], ["hazkara", "הזכרה ותנחומים", "Hazkara and condolences"], ["ticker", "הקדשה קבועה (שורה רצה)", "Permanent dedication (ticker)"], ["yahrzeit", "יארצייט", "Yahrzeit"]];
  function typeName(t) { var x = TYPES.filter(function (y) { return y[0] === t; })[0]; return x ? L(x[1], x[2]) : t; }
  var SHOW = [["all", "כל הימים", "Every day"], ["weekday", "יום חול בלבד", "Weekdays only"], ["shabbat", "שבת וחג בלבד", "Shabbat and Yom Tov only"], ["days", "ימים מסוימים", "Specific days"]];
  UI.route("/gabbai/content", { admin: true,
    need: "content", title: function () { return L("תוכן המסך", "Screen content"); },
    render: function (app, arg, params) {
      var type = params.type || "all", pv = params.pv || "weekday";
      var reqs = S.db.yzRequests.filter(function (y) { return y.status === "pending"; });
      var items = type === "yahrzeit" ? [] : S.db.items.filter(function (i) { return type === "all" || i.type === type; });
      var status = function (s) { return s === "published" ? '<span class="badge ok">' + L("מפורסם", "Published") + "</span>" : s === "draft" ? '<span class="badge warn">' + L("טיוטה", "Draft") + "</span>" : '<span class="badge">' + L("בארכיון", "Archived") + "</span>"; };
      var showLabel = function (it) { var x = SHOW.filter(function (s) { return s[0] === it.showOn; })[0]; return (x ? L(x[1], x[2]) : "") + (it.showOn === "days" ? ": " + (it.weekdays || []).map(function (w) { return S.dayName(w); }).join(", ") : ""); };
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("תוכן המסך", "Screen Content"), L("מה שמפורסם כאן מופיע במסך מיד, רק בתאריכים ובימים שנבחרו.", "What you publish here appears on the screen at once, only on the dates and days chosen."), UI.crumbGabbai(), '<button class="btn primary" id="newIt">' + sv(I.plus, 16) + L("פריט חדש", "New item") + "</button>") +
        '<div class="row" style="margin-bottom:14px"><a class="chip ' + (type === "all" ? "on" : "") + '" href="#/gabbai/content">' + L("הכל", "All") + "</a>" + TYPES.map(function (t) { return '<a class="chip ' + (type === t[0] ? "on" : "") + '" href="#/gabbai/content?type=' + t[0] + '">' + L(t[1], t[2]).split(" (")[0] + (t[0] === "yahrzeit" && reqs.length ? ' <span class="badge warn">' + reqs.length + "</span>" : "") + "</a>"; }).join("") + "</div>" +
        '<div class="grid g2" style="align-items:start"><div class="stack">' +
        (type === "yahrzeit" || type === "all" ? (reqs.length ? '<div class="card" style="border-color:var(--accent)"><h3>' + L("בקשות יארצייט ממתפללים", "Yahrzeit requests from members") + " (" + reqs.length + ")</h3>" + reqs.map(function (y) { var m = S.memberById(y.memberId); return '<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div><b>' + esc(S.N(y.name)) + '</b><div class="small muted">' + esc(S.N(y.relation)) + " · " + S.hday(y.hday) + " " + esc(S.N(S.HEB_MONTHS[y.hmonth])) + " · " + L("מאת ", "from ") + esc(m ? S.N(m) : "") + '</div></div><div class="row"><button class="btn primary sm" data-yok="' + y.id + '">' + L("אשר והצג במסך", "Approve and show on screen") + '</button><button class="btn sm" data-yno="' + y.id + '">' + L("לא לאשר", "Decline") + "</button></div></div>"; }).join("") + "</div>" : "") : "") +
        (type === "yahrzeit" ? '<div class="card"><div class="card-head"><h3>' + L("יארצייטים", "Yahrzeits") + '</h3><button class="btn soft sm" id="addYz">' + sv(I.plus, 16) + L("יארצייט חדש", "New yahrzeit") + '</button></div><p class="small muted">' + L("מזינים פעם אחת, והיארצייט חוזר לבד בשבוע שלו בכל שנה.", "Enter it once and it returns on its own in its week, every year.") + "</p>" + S.db.yahrzeits.slice().sort(function (a, b) { return a.hmonth - b.hmonth || a.hday - b.hday; }).map(function (y) { var m = S.memberById(y.memberId); return '<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div><b>' + esc(S.N(y.name)) + '</b><div class="small muted">' + esc(S.N(y.relation)) + (m ? " · " + L("מקושר ל", "linked to ") + esc(S.N(m)) : "") + '</div></div><div class="row"><span class="small">' + S.hday(y.hday) + " " + esc(S.N(S.HEB_MONTHS[y.hmonth])) + "</span>" + window.SHUL_MEMBER.yzStatus(y) + '<button class="btn ghost sm" data-ydel="' + y.id + '">' + L("מחיקה", "Delete") + "</button></div></div>"; }).join("") + "</div>" : "") +
        items.map(function (it) { return '<div class="card"><div class="row between"><div><span class="badge accent">' + typeName(it.type) + "</span> " + status(it.status) + '<h3 style="margin:8px 0 2px">' + esc(S.N(it.title)) + '</h3><p class="small muted" style="margin:0">' + esc(S.N(it.text)) + '</p><div class="tiny muted" style="margin-top:6px">' + esc(showLabel(it)) + (it.from || it.to ? " · " + esc(it.from || "") + " → " + esc(it.to || "") : "") + '</div></div></div><div class="row" style="margin-top:10px"><button class="btn sm" data-it="' + it.id + '">' + L("עריכה", "Edit") + "</button>" + (it.status !== "published" ? '<button class="btn primary sm" data-pub="' + it.id + '">' + L("פרסום", "Publish") + "</button>" : '<button class="btn sm" data-arc="' + it.id + '">' + L("לארכיון", "Archive") + "</button>") + '<button class="btn ghost sm" data-del="' + it.id + '">' + L("מחיקה", "Delete") + "</button></div></div>"; }).join("") +
        '</div><div class="card" style="position:sticky;top:120px"><div class="card-head"><h3>' + L("תצוגה מקדימה לפני פרסום", "Preview before publishing") + '</h3><div class="row"><a class="chip ' + (pv === "weekday" ? "on" : "") + '" href="#/gabbai/content?type=' + type + '&pv=weekday">' + L("חול", "Weekday") + '</a><a class="chip ' + (pv === "shabbat" ? "on" : "") + '" href="#/gabbai/content?type=' + type + '&pv=shabbat">' + L("שבת", "Shabbat") + "</a></div></div>" + tvFrame(pv === "shabbat" ? "&shabbat=1" : "") + '<p class="tiny muted" style="margin:10px 0 0">' + L("בשבת המסך לא מתחלף: כרטיס ״שבת שלום״ עם נרות, ההקדשות, ההזכרות והיארצייטים של השבוע. הודעות ופליירים מוצגים רק בחול.", "On Shabbat the screen stops rotating: the Shabbat Shalom card with candles, the dedications, hazkarot and this week's yahrzeits. Announcements and flyers show on weekdays only.") + "</p></div></div></div>";
      app.querySelector("#newIt").addEventListener("click", function () { if (type === "yahrzeit") addYz(); else itemForm(null, type === "all" ? "announcement" : type); });
      var ay = app.querySelector("#addYz"); if (ay) ay.addEventListener("click", addYz);
      UI.on(app, "[data-it]", "click", function (e, b) { itemForm(S.db.items.filter(function (i) { return i.id === b.getAttribute("data-it"); })[0]); });
      UI.on(app, "[data-pub]", "click", function (e, b) { var it = find(b.getAttribute("data-pub")); it.status = "published"; S.log("screen", "פרסם: " + it.title.he, "Published: " + it.title.en); if (it.type === "announcement") S.notify("members", "הודעה חדשה: " + it.title.he, "New announcement: " + it.title.en); S.save(); UI.render(); });
      UI.on(app, "[data-arc]", "click", function (e, b) { var it = find(b.getAttribute("data-arc")); it.status = "archived"; S.log("screen", "העביר לארכיון: " + it.title.he, "Archived: " + it.title.en); S.save(); UI.render(); });
      UI.on(app, "[data-del]", "click", function (e, b) { var it = find(b.getAttribute("data-del")); UI.confirmBox(L("למחוק?", "Delete?"), esc(S.N(it.title)), L("מחיקה", "Delete"), function () { S.db.items = S.db.items.filter(function (x) { return x !== it; }); S.log("screen", "מחק: " + it.title.he, "Deleted: " + it.title.en); S.save(); UI.render(); }); });
      UI.on(app, "[data-ydel]", "click", function (e, b) { S.db.yahrzeits = S.db.yahrzeits.filter(function (y) { return y.id !== b.getAttribute("data-ydel"); }); S.save(); UI.render(); });
      UI.on(app, "[data-yok]", "click", function (e, b) {
        var r = S.db.yzRequests.filter(function (y) { return y.id === b.getAttribute("data-yok"); })[0];
        S.db.yahrzeits.push({ id: "yzreq-" + r.id, name: r.name, relation: r.relation, hday: r.hday, hmonth: r.hmonth, memberId: r.memberId, status: "published" });
        r.status = "approved"; var m = S.memberById(r.memberId);
        S.log("screen", "אישר יארצייט: " + r.name.he, "Approved yahrzeit: " + r.name.en);
        S.notify(r.memberId, "היארצייט של " + r.name.he + " אושר ויוצג במסך בשבוע שלו", "The yahrzeit of " + r.name.en + " was approved and will show on the screen in its week");
        S.save(); UI.toast(L("אושר. יוצג במסך בשבוע שלו, כל שנה.", "Approved. It shows on the screen in its week, every year.")); UI.render();
      });
      UI.on(app, "[data-yno]", "click", function (e, b) { var r = S.db.yzRequests.filter(function (y) { return y.id === b.getAttribute("data-yno"); })[0]; r.status = "declined"; S.save(); UI.render(); });
    }
  });
  function find(id) { return S.db.items.filter(function (i) { return i.id === id; })[0]; }
  function addYz() {
    var opts = S.db.members.filter(function (m) { return m.status === "active"; }).map(function (m) { return '<option value="' + m.id + '">' + esc(S.N(m)) + "</option>"; }).join("");
    var pick = UI.modal("<h2>" + L("יארצייט חדש", "New yahrzeit") + '</h2><label class="field"><span>' + L("קישור למתפלל (לא חובה)", "Link to a member (optional)") + '</span><select id="ym"><option value="">' + L("ללא", "None") + "</option>" + opts + '</select></label><div class="actions"><button class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary" id="yNext">' + L("המשך", "Continue") + "</button></div>");
    pick.querySelector("#yNext").addEventListener("click", function () {
      var mid = pick.querySelector("#ym").value;
      window.SHUL_MEMBER.yahrzeitForm(mid, function (rec) {
        S.db.yahrzeits.push({ id: S.uid("y"), name: rec.name, relation: rec.relation, hday: rec.hday, hmonth: rec.hmonth, memberId: mid || "", status: "published" });
        S.log("screen", "הוסיף יארצייט: " + rec.name.he, "Added yahrzeit: " + rec.name.en); S.save(); UI.toast(L("נשמר ופורסם", "Saved and published")); UI.render();
      }, true);
    });
  }
  function itemForm(it, type) {
    var isNew = !it; it = it || { id: S.uid("it"), type: type, title: { he: "", en: "" }, text: { he: "", en: "" }, showOn: type === "announcement" || type === "flyer" || type === "mazaltov" ? "weekday" : "all", status: "draft" };
    var wd = (it.weekdays || []).slice();
    var md = UI.modal("<h2>" + (isNew ? L("פריט חדש", "New item") : L("עריכה", "Edit")) + '</h2><form id="itf"><label class="field"><span>' + L("סוג", "Type") + '</span><select name="type">' + TYPES.filter(function (t) { return t[0] !== "yahrzeit"; }).map(function (t) { return '<option value="' + t[0] + '"' + (it.type === t[0] ? " selected" : "") + ">" + L(t[1], t[2]) + "</option>"; }).join("") + '</select></label><div class="form-grid" style="margin-top:12px"><label class="field"><span>' + L("כותרת בעברית", "Hebrew title") + '</span><input name="the" required value="' + esc(it.title.he) + '"></label><label class="field"><span>' + L("כותרת באנגלית", "English title") + '</span><input name="ten" class="ltr" value="' + esc(it.title.en) + '"></label></div>' +
      '<label class="field" style="margin-top:12px"><span>' + L("טקסט בעברית", "Hebrew text") + '</span><textarea name="xhe" required>' + esc(it.text.he) + '</textarea></label><label class="field" style="margin-top:12px"><span>' + L("טקסט באנגלית", "English text") + '</span><textarea name="xen" class="ltr">' + esc(it.text.en) + "</textarea></label>" +
      '<label class="field" style="margin-top:12px"><span>' + L("מתי להציג", "When to show") + '</span><select name="showOn">' + SHOW.map(function (s) { return '<option value="' + s[0] + '"' + (it.showOn === s[0] ? " selected" : "") + ">" + L(s[1], s[2]) + "</option>"; }).join("") + '</select></label><div class="row hidden" id="wd" style="margin-top:8px">' + [0, 1, 2, 3, 4, 5, 6].map(function (w) { return '<button type="button" class="chip" data-w="' + w + '" aria-pressed="' + (wd.indexOf(w) >= 0) + '">' + S.dayName(w) + "</button>"; }).join("") + "</div>" +
      '<div class="form-grid" style="margin-top:12px"><label class="field"><span>' + L("מתאריך", "From date") + '</span><input type="date" name="from" value="' + (it.from || "") + '"></label><label class="field"><span>' + L("עד תאריך", "To date") + '</span><input type="date" name="to" value="' + (it.to || "") + '"></label></div>' +
      '<p class="err hidden" id="iErr"></p><div class="actions"><button type="button" class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button type="submit" class="btn" name="draft" value="1">' + L("שמירה כטיוטה", "Save as draft") + '</button><button type="submit" class="btn primary" name="pub" value="1">' + L("פרסום במסך", "Publish to the screen") + "</button></div></form>", { wide: true });
    var f = md.querySelector("#itf");
    function sync() { md.querySelector("#wd").classList.toggle("hidden", f.showOn.value !== "days"); }
    f.showOn.addEventListener("change", sync); sync();
    UI.on(md, "[data-w]", "click", function (e, b) { var w = +b.getAttribute("data-w"), i = wd.indexOf(w); if (i >= 0) wd.splice(i, 1); else wd.push(w); b.setAttribute("aria-pressed", i < 0); });
    var submitter = "pub";
    md.querySelectorAll("button[type=submit]").forEach(function (b) { b.addEventListener("click", function () { submitter = b.name; }); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var er = md.querySelector("#iErr");
      if (f.showOn.value === "days" && !wd.length) { er.textContent = L("נא לבחור לפחות יום אחד.", "Please choose at least one day."); er.classList.remove("hidden"); return; }
      if (f.from.value && f.to.value && f.to.value < f.from.value) { er.textContent = L("תאריך הסיום לפני תאריך ההתחלה.", "The end date is before the start date."); er.classList.remove("hidden"); return; }
      it.type = f.type.value; it.title = { he: f.the.value.trim(), en: f.ten.value.trim() || f.the.value.trim() }; it.text = { he: f.xhe.value.trim(), en: f.xen.value.trim() || f.xhe.value.trim() };
      it.showOn = f.showOn.value; it.weekdays = it.showOn === "days" ? wd.sort() : undefined; it.from = f.from.value || undefined; it.to = f.to.value || undefined;
      var wasPub = it.status === "published";
      it.status = submitter === "draft" ? "draft" : "published";
      if (isNew) S.db.items.unshift(it);
      S.log("screen", (it.status === "published" ? "פרסם: " : "שמר טיוטה: ") + it.title.he, (it.status === "published" ? "Published: " : "Saved draft: ") + it.title.en);
      if (it.status === "published" && !wasPub && it.type === "announcement") S.notify("members", "הודעה חדשה: " + it.title.he, "New announcement: " + it.title.en);
      S.save(); UI.closeModal(); UI.toast(it.status === "published" ? L("פורסם. מופיע עכשיו בתצוגה ובמסך.", "Published. It is on the preview and the screen now.") : L("נשמר כטיוטה", "Saved as draft")); UI.render();
    });
  }

  /* collections a restore checks: lists are matched by id, settings by key. Nothing is ever overwritten. */
  var RESTORE = ["members", "ledger", "items", "yahrzeits", "yzRequests", "prayers", "users", "joinReqs", "inbox", "recurring", "notifs", "activity"];
  var RESTORE_OBJ = ["tvDisplay", "tvTexts", "homeTexts", "pushOn"];
  function rkey(x) { return x && (x.id || x.mid); }

  /* ---------- Shabbat bulletin ---------- */
  UI.route("/gabbai/shabbat", { admin: true,
    need: "content", title: function () { return L("דף השבת", "Shabbat bulletin"); },
    render: function (app, arg, params) {
      var sh = S.db.sheet, SH = window.SHUL_SHEET, sup = S.role() === "super", clean = params.clean === "1";
      var rowEd = function (r, i, arr) {
        var t = SH.rowTime(r), sug = SH.sourceTime(r), ch = sh.overrides[r.id] != null;
        return '<div class="sheet-edit-row ' + (r.hidden ? "off" : "") + '"><button class="icon-btn" style="width:34px;height:34px" data-star="' + r.id + '" title="' + L("הדגשה", "Highlight") + '" aria-pressed="' + !!r.star + '">' + (r.star ? '<span style="color:var(--gold)">★</span>' : "☆") + '</button><div><b>' + esc(S.N(r)) + '</b><div class="src">' + esc(SH.srcLabel(r)) + (sug != null ? ' · <span class="sugg num">' + S.hm(sug, false) + "</span>" : "") + (ch ? ' · <span class="changed">' + L("שונה לשבוע הזה", "Changed for this week") + "</span>" : "") + (r.every != null ? ' · <span class="changed">' + L("קבוע כל שבוע", "Every week") + "</span>" : "") + '</div></div><input type="time" data-time="' + r.id + '" value="' + (t != null ? S.toInputTime(t) : "") + '"><div class="row acts" style="gap:4px"><button class="icon-btn" style="width:34px;height:34px" data-up="' + r.id + '"' + (i === 0 ? " disabled" : "") + ' aria-label="' + L("למעלה", "Up") + '">' + sv(I.up, 16) + '</button><button class="icon-btn" style="width:34px;height:34px" data-down="' + r.id + '"' + (i === arr.length - 1 ? " disabled" : "") + ' aria-label="' + L("למטה", "Down") + '">' + sv(I.down, 16) + '</button><button class="icon-btn" style="width:34px;height:34px" data-size="' + r.id + '" title="' + L("גודל טקסט", "Text size") + '">A' + (r.size ? "+" : "") + '</button><button class="icon-btn" style="width:34px;height:34px" data-hide="' + r.id + '" aria-label="' + L("הסתרה", "Hide") + '">' + sv(r.hidden ? I.eyeOff : I.eye, 16) + "</button>" + (ch ? '<button class="btn ghost sm" data-every="' + r.id + '">' + L("קבוע כל שבוע", "Every week") + "</button>" : "") + "</div></div>";
      };
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("דף השבת", "Shabbat Bulletin"), L("הזמנים נמשכים לבד מזמני היום ומזמני התפילה. שינוי כאן חל על השבת הזאת בלבד, אלא אם מסמנים ״קבוע כל שבוע״.", "Times come on their own from the zmanim and davening times. A change here applies to this Shabbat only, unless marked Every week."), UI.crumbGabbai()) +
        '<div class="grid g2" style="align-items:start"><div class="card"><div class="form-grid"><label class="field"><span>' + L("כותרת בעברית", "Hebrew title") + '</span><input id="shTitle" value="' + esc(sh.title.he) + '"></label><label class="field"><span>' + L("כותרת באנגלית", "English title") + '</span><input id="shTitleEn" class="ltr" value="' + esc(sh.title.en || "") + '"></label><label class="field"><span>' + L("שורה תחתונה בעברית", "Hebrew bottom line") + '</span><input id="shNote" value="' + esc(sh.note.he) + '"></label><label class="field"><span>' + L("שורה תחתונה באנגלית", "English bottom line") + '</span><input id="shNoteEn" class="ltr" value="' + esc(sh.note.en || "") + '"></label></div>' +
        '<h3 style="margin-top:16px">' + L("ערב שבת", "Erev Shabbat") + "</h3>" + sh.rows.filter(function (r) { return r.day === "fri"; }).map(rowEd).join("") +
        '<h3 style="margin-top:16px">' + L("שבת", "Shabbat") + "</h3>" + sh.rows.filter(function (r) { return r.day === "sat"; }).map(rowEd).join("") +
        '<div class="row" style="margin-top:12px"><button class="btn sm" id="addRow">' + sv(I.plus, 16) + L("שורה חדשה", "New row") + '</button><button class="btn ghost sm" id="clearWeek">' + L("ביטול השינויים של השבוע", "Clear this week's changes") + "</button></div>" +
        '<hr class="gold-line"><label class="check"><input type="checkbox" id="onTv"' + (sh.onTv ? " checked" : "") + "> <span><b>" + L("הצג בזמני התפילות במסך", "Show in the screen's davening times") + "</b><br><span class=\"small muted\">" + L("בשישי ובשבת המסך יציג את זמני הדף במקום הזמנים הרגילים.", "On Friday and Shabbat the screen shows this bulletin's times instead of the regular ones.") + "</span></span></label>" +
        (sup ? '<hr class="gold-line"><h3>' + L("שבת שלום לקהילה", "Shabbat Shalom to the community") + '</h3><p class="small muted">' + L("שולח לכל המתפללים את זמני השבת כפי שהם בדף, את נותני הקידוש ואת היארצייטים של השבוע: שורה קצרה לטלפון והודעה מלאה באימייל.", "Sends every member this Shabbat's times exactly as on the bulletin, the Kiddush sponsors and this week's yahrzeits: a short line to their phone and the full text by email.") + '</p><button class="btn primary" id="sendShabbat">' + sv(I.mail, 16) + L("שליחה לקהילה", "Send to the community") + "</button>" + (sh.sentAt ? ' <span class="small muted">' + L("נשלח ", "Sent ") + UI.timeAgo(sh.sentAt) + "</span>" : "") : "") + "</div>" +
        '<div class="stack" style="position:sticky;top:120px">' + SH.pageHtml({ clean: clean }) + '<div class="row" style="justify-content:center"><button class="btn primary" id="print">' + sv(I.print, 16) + L("הדפסה / PDF", "Print / PDF") + '</button><a class="btn" href="#/gabbai/shabbat' + (clean ? "" : "?clean=1") + '">' + (clean ? L("עם מסגרת", "With frame") : L("נקי להדפסה", "Clean for print")) + '</a><button class="btn" id="jpg">' + sv(I.download, 16) + "JPG</button></div></div></div></div>";
      function row(id) { return sh.rows.filter(function (r) { return r.id === id; })[0]; }
      function done(msg) { S.log("sheet", "עדכן את דף השבת", "Updated the Shabbat bulletin"); S.save(); if (msg) UI.toast(msg); UI.render(); }
      UI.on(app, "[data-time]", "change", function (e, inp) { var r = row(inp.getAttribute("data-time")), v = S.fromInputTime(inp.value); if (v == null) delete sh.overrides[r.id]; else if (v === SH.sourceTime(r) && r.every == null) delete sh.overrides[r.id]; else sh.overrides[r.id] = v; done(L("נשמר לשבת הזאת", "Saved for this Shabbat")); });
      UI.on(app, "[data-star]", "click", function (e, b) { var r = row(b.getAttribute("data-star")); r.star = !r.star; done(); });
      UI.on(app, "[data-hide]", "click", function (e, b) { var r = row(b.getAttribute("data-hide")); r.hidden = !r.hidden; done(); });
      UI.on(app, "[data-size]", "click", function (e, b) { var r = row(b.getAttribute("data-size")); r.size = ((r.size || 0) + 1) % 3; done(); });
      UI.on(app, "[data-every]", "click", function (e, b) { var r = row(b.getAttribute("data-every")); r.every = sh.overrides[r.id]; delete sh.overrides[r.id]; done(L("נקבע לכל שבוע", "Set for every week")); });
      var mv = function (id, dir) { var i = sh.rows.indexOf(row(id)), j = i + dir; while (j >= 0 && j < sh.rows.length && sh.rows[j].day !== sh.rows[i].day) j += dir; if (j < 0 || j >= sh.rows.length) return; var t = sh.rows[i]; sh.rows[i] = sh.rows[j]; sh.rows[j] = t; done(); };
      UI.on(app, "[data-up]", "click", function (e, b) { mv(b.getAttribute("data-up"), -1); });
      UI.on(app, "[data-down]", "click", function (e, b) { mv(b.getAttribute("data-down"), 1); });
      app.querySelector("#shTitle").addEventListener("change", function (e) { sh.title.he = e.target.value; done(); });
      app.querySelector("#shTitleEn").addEventListener("change", function (e) { sh.title.en = e.target.value; done(); });
      app.querySelector("#shNote").addEventListener("change", function (e) { sh.note.he = e.target.value; done(); });
      app.querySelector("#shNoteEn").addEventListener("change", function (e) { sh.note.en = e.target.value; done(); });
      app.querySelector("#onTv").addEventListener("change", function (e) { sh.onTv = e.target.checked; done(sh.onTv ? L("המסך מציג עכשיו את זמני הדף בשישי ובשבת", "The screen now shows the bulletin's times on Friday and Shabbat") : L("המסך חזר לזמנים הרגילים", "The screen is back to the regular times")); });
      app.querySelector("#clearWeek").addEventListener("click", function () { sh.overrides = {}; done(L("השינויים של השבוע בוטלו", "This week's changes were cleared")); });
      app.querySelector("#addRow").addEventListener("click", function () {
        var md = UI.modal("<h2>" + L("שורה חדשה", "New row") + '</h2><form id="nr"><div class="form-grid"><label class="field"><span>' + L("שם בעברית", "Hebrew name") + '</span><input name="he" required placeholder="שיעור הרב"></label><label class="field"><span>' + L("שם באנגלית", "English name") + '</span><input name="en" class="ltr" placeholder="Rabbi\'s shiur"></label><label class="field"><span>' + L("יום", "Day") + '</span><select name="day"><option value="fri">' + L("ערב שבת", "Erev Shabbat") + '</option><option value="sat" selected>' + L("שבת", "Shabbat") + '</option></select></label><label class="field"><span>' + L("שעה", "Time") + '</span><input type="time" name="time" required value="17:00"></label></div><div class="actions"><button type="button" class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary">' + L("הוספה", "Add") + "</button></div></form>");
        md.querySelector("#nr").addEventListener("submit", function (e) { e.preventDefault(); var f = e.target; sh.rows.push({ id: S.uid("s"), day: f.day.value, he: f.he.value.trim(), en: f.en.value.trim() || f.he.value.trim(), src: "manual", time: S.fromInputTime(f.time.value) }); UI.closeModal(); done(); });
      });
      app.querySelector("#print").addEventListener("click", function () { app.querySelector(".sheet-page").classList.add("print-area"); window.print(); app.querySelector(".sheet-page").classList.remove("print-area"); });
      app.querySelector("#jpg").addEventListener("click", function () { sheetJpg(); });
      var ss = app.querySelector("#sendShabbat");
      if (ss) ss.addEventListener("click", function () {
        var st = S.shabbatTimes(), yz = window.SHUL_TV.yahrzeitsThisWeek();
        var spons = S.db.items.filter(function (i) { return i.type === "sponsor" && i.status === "published"; });
        var lines = sh.rows.filter(function (r) { return !r.hidden; }).map(function (r) { var t = SH.rowTime(r); return esc(S.N(r)) + ": " + (t == null ? "" : S.hm(t, true)); });
        var go = function () {
          var md = UI.modal("<h2>" + L("לשלוח לכל הקהילה?", "Send to the whole community?") + '</h2><div class="card flat" style="max-height:320px;overflow:auto"><b>' + L("שבת שלום! פרשת ", "Shabbat Shalom! Parashat ") + L(S.PARASHA.he, S.PARASHA.en) + "</b><br>" + lines.join("<br>") + "<hr class=\"gold-line\">" + spons.map(function (s) { return esc(S.N(s.text)); }).join("<br>") + (yz.length ? '<hr class="gold-line"><b>' + L("יארצייטים השבוע: ", "Yahrzeits this week: ") + "</b>" + yz.map(function (y) { return esc(S.N(y.name)); }).join(", ") : "") + '</div><p class="small muted">' + L("יישלח ל-", "Goes to ") + S.db.members.filter(function (m) { return m.status === "active" && m.email; }).length + L(" מתפללים עם אימייל, ושורה קצרה לטלפון של כולם.", " members with an email, and a short line to everyone's phone.") + '</p><div class="actions"><button class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary" id="ok">' + L("שליחה", "Send") + "</button></div>", { wide: true });
          md.querySelector("#ok").addEventListener("click", function () { sh.sentAt = new Date().toISOString(); S.log("sheet", "נשלח ״שבת שלום לקהילה״", "Sent Shabbat Shalom to the community"); S.notify("members", "שבת שלום! הדלקת נרות " + S.hm(st.candles, true) + ", צאת השבת " + S.hm(st.ends, true), "Shabbat Shalom! Candles " + S.hm(st.candles, true) + ", Shabbat ends " + S.hm(st.ends, true)); S.save(); UI.closeModal(); UI.toast(L("נשלח לקהילה (הדגמה)", "Sent to the community (demo)")); UI.render(); });
        };
        if (sh.sentAt) UI.confirmBox(L("כבר נשלח השבוע", "Already sent this week"), L("לשלוח שוב?", "Send again?"), L("כן", "Yes"), go); else go();
      });
    }
  });
  function sheetJpg() {
    var SH = window.SHUL_SHEET, sh = S.db.sheet, W = 850, H = 1100, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d");
    x.fillStyle = "#fffdf8"; x.fillRect(0, 0, W, H); x.strokeStyle = "#c9ad7a"; x.lineWidth = 2; x.strokeRect(24, 24, W - 48, H - 48);
    x.fillStyle = "#0e2c4c"; x.textAlign = "center"; x.direction = "rtl";
    x.font = "700 52px 'Frank Ruhl Libre', serif"; x.fillText(sh.title.he, W / 2, 130);
    x.font = "24px 'Frank Ruhl Libre', serif"; x.fillStyle = "#6b5a3c"; x.fillText(S.db.shul.he + " · פרשת " + S.PARASHA.he, W / 2, 175);
    var y = 240;
    [["fri", "ערב שבת"], ["sat", "שבת קודש"]].forEach(function (d) {
      x.textAlign = "right"; x.fillStyle = "#0e2c4c"; x.font = "700 30px 'Frank Ruhl Libre', serif"; x.fillText(d[1], W - 90, y); y += 14;
      x.fillStyle = "#c9ad7a"; x.fillRect(90, y, W - 180, 2); y += 44;
      sh.rows.filter(function (r) { return r.day === d[0] && !r.hidden; }).forEach(function (r) {
        var t = SH.rowTime(r); x.fillStyle = "#1f1b14"; x.font = (r.star ? "700 " : "") + "28px 'Frank Ruhl Libre', serif"; x.textAlign = "right"; x.fillText(r.he, W - 90, y);
        x.textAlign = "left"; x.font = "700 30px Assistant, sans-serif"; x.fillText(t == null ? "" : S.hm(t, false), 90, y); y += 48;
      });
      y += 26;
    });
    x.textAlign = "center"; x.fillStyle = "#6b5a3c"; x.font = "24px 'Frank Ruhl Libre', serif"; x.fillText(sh.note.he, W / 2, H - 80);
    c.toBlob(function (b) { var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "shabbat-bulletin.jpg"; a.click(); }, "image/jpeg", 0.92);
  }

  /* ---------- settings ---------- */
  UI.route("/gabbai/settings", { admin: true,
    need: "gabbai", title: function () { return L("הגדרות", "Settings"); },
    render: function (app) {
      var sup = S.role() === "super", con = S.can("content");
      var cards = [[I.sparkle, L("שפת הממשק", "Interface language"), L("עברית או English. נשמר במכשיר הזה.", "Hebrew or English. Saved on this device."), '<div class="lang"><button aria-pressed="' + (S.prefs.lang === "he") + '" data-l="he">עברית</button><button aria-pressed="' + (S.prefs.lang === "en") + '" data-l="en">English</button></div>']];
      if (con) cards.push([I.clock, L("זמני תפילה", "Davening times"), L("חול (א׳-ה׳), שישי ושבת", "Weekdays (Sun-Thu), Friday and Shabbat"), '<a class="btn sm" href="#/gabbai/tv">' + L("לזמני התפילה", "To davening times") + "</a>"],
        [I.tv, L("המסך", "The screen"), L("כל מילה על המסך" + (sup ? ", בהירות ורענון מרחוק" : ""), "Every word on the screen" + (sup ? ", brightness and remote refresh" : "")), '<a class="btn sm" href="#/gabbai/tv">' + L("להגדרות המסך", "To screen settings") + "</a>"]);
      if (sup) cards.push([I.edit, L("דף הנחיתה", "Landing page"), L("כל מילה בדף הבית, בעברית ובאנגלית", "Every word on the home page, in Hebrew and English"), '<a class="btn sm" href="#/gabbai/landing">' + L("לטקסטים", "To the texts") + "</a>"],
        [I.shield, L("גבאים והרשאות", "Gabbaim and permissions"), L("מי יכול לעשות מה", "Who can do what"), '<a class="btn sm" href="#/admin">' + L("לגבאים", "To gabbaim") + "</a>"]);
      if (sup || S.can("finance")) cards.push([I.cloud, L("גיבוי ושחזור", "Backup and restore"), L("הגיבוי רץ כל לילה לבד", "The backup runs every night on its own"), '<a class="btn sm" href="#/backup">' + L("לגיבוי", "To backup") + "</a>"]);
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("הגדרות", "Settings"), L("כל מה שמגדירים פעם אחת, במקום אחד", "Everything you set once, in one place"), UI.crumbGabbai()) + '<div class="grid g2">' + cards.map(function (c) { return '<div class="tile" style="cursor:default"><div class="ic">' + c[0] + '</div><div style="flex:1"><b>' + c[1] + "</b><span>" + c[2] + '</span></div><div style="align-self:center">' + c[3] + "</div></div>"; }).join("") + "</div></div>";
      UI.on(app, "[data-l]", "click", function (e, b) { UI.setLang(b.getAttribute("data-l")); });
    }
  });

  /* ---------- landing page texts (super admin) ---------- */
  UI.route("/gabbai/landing", { admin: true,
    need: "super", title: function () { return L("דף הנחיתה", "Landing page"); },
    render: function (app) {
      var D = window.SHUL_PUBLIC.HOME_TEXTS, H = S.db.homeTexts;
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("הטקסטים בדף הנחיתה", "Landing Page Texts"), L("כל מילה בדף הבית ניתנת לשינוי. שדה ריק חוזר לברירת המחדל.", "Every word on the home page can be changed. An empty field goes back to the default."), UI.crumbGabbai()) +
        '<div class="grid g2" style="align-items:start"><form class="card stack" id="ht">' + Object.keys(D).map(function (k) { var o = H[k] || {}, long = D[k].he.length > 60; var inp = function (lang) { var v = esc(o[lang] || ""), ph = esc(D[k][lang]); return long ? '<textarea name="' + lang + "_" + k + '" ' + (lang === "en" ? 'class="ltr"' : "") + ' placeholder="' + ph + '">' + v + "</textarea>" : '<input name="' + lang + "_" + k + '" ' + (lang === "en" ? 'class="ltr"' : "") + ' value="' + v + '" placeholder="' + ph + '">'; }; return '<div class="form-grid"><label class="field"><span class="small">' + L("עברית", "Hebrew") + '</span>' + inp("he") + '</label><label class="field"><span class="small">English</span>' + inp("en") + "</label></div>"; }).join("") +
        '<div class="row"><button class="btn primary">' + L("שמירה", "Save") + '</button><button type="button" class="btn ghost" id="htReset">' + L("חזרה לברירת המחדל", "Back to defaults") + '</button></div></form><div class="card" style="position:sticky;top:120px"><div class="card-head"><h3>' + L("תצוגה חיה", "Live preview") + '</h3><a class="btn sm" href="#/site">' + L("לדף הבית", "To the home page") + '</a></div><div class="tv-frame" style="aspect-ratio:4/5;border-width:4px"><iframe class="tvpv" src="index.html#/site?embed=1" title="preview"></iframe></div></div></div></div>';
      var f = app.querySelector("#ht");
      f.addEventListener("submit", function (e) { e.preventDefault(); Object.keys(D).forEach(function (k) { var he = f["he_" + k].value.trim(), en = f["en_" + k].value.trim(); if (he || en) H[k] = { he: he, en: en }; else delete H[k]; }); S.log("texts", "עדכן את דף הנחיתה", "Updated the landing page"); S.save(); UI.toast(L("נשמר. דף הבית התעדכן.", "Saved. The home page is updated.")); });
      app.querySelector("#htReset").addEventListener("click", function () { S.db.homeTexts = {}; S.save(); UI.render(); UI.toast(L("דף הנחיתה חזר לברירת המחדל", "The landing page is back to the defaults")); });
    }
  });

  /* ---------- admin: users and roles + broadcast ---------- */
  var ROLE_OPTS = [["member", "מתפלל", "Member"], ["content", "גבאי תוכן וזמנים", "Content and times gabbai"], ["finance", "גבאי כספים", "Finance gabbai"], ["both", "כספים ותוכן", "Finance and content"]];
  UI.route("/admin", { admin: true,
    need: "super", title: function () { return L("גבאים והרשאות", "Gabbaim and permissions"); },
    render: function (app) {
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("גבאים והרשאות", "Gabbaim and Permissions"), L("כל אחד רואה רק את מה שמותר לו. שינוי תפקיד נכנס לתוקף בכניסה הבאה.", "Everyone sees only what they may use. A role change takes effect at the next sign-in."), UI.crumbGabbai()) +
        '<div class="grid g2" style="align-items:start"><div class="card"><div class="card-head"><h3>' + L("משתמשים", "Users") + '</h3><button class="btn soft sm" id="grant">' + sv(I.plus, 16) + L("מתן הרשאה", "Grant access") + '</button></div><div class="table-wrap"><table><thead><tr><th>' + L("שם", "Name") + "</th><th>" + L("אימייל", "Email") + "</th><th>" + L("תפקיד", "Role") + "</th></tr></thead><tbody>" +
        S.db.users.map(function (u, i) { return "<tr><td><b>" + esc(S.N(u)) + '</b></td><td class="small num">' + esc(u.email) + "</td><td>" + (u.role === "super" ? '<span class="badge accent">' + L("מנהל ראשי", "Super admin") + "</span>" : '<select data-u="' + i + '" style="min-height:34px;padding:4px 8px">' + ROLE_OPTS.map(function (r) { return '<option value="' + r[0] + '"' + (u.role === r[0] ? " selected" : "") + ">" + L(r[1], r[2]) + "</option>"; }).join("") + "</select>") + "</td></tr>"; }).join("") +
        '</tbody></table></div><div class="card flat" style="margin-top:14px"><h3>' + L("מה כל תפקיד רואה", "What each role sees") + '</h3><ul class="small muted" style="margin:0;padding-inline-start:18px"><li><b>' + L("מנהל ראשי", "Super admin") + "</b>: " + L("הכל, כולל הרשאות, בקשות הצטרפות, יומן פעילות וגיבוי.", "everything, including permissions, join requests, the activity log and backup.") + "</li><li><b>" + L("גבאי כספים", "Finance gabbai") + "</b>: " + L("מתפללים, יומן חשבונות, נדרים, מכתבי מס, גיבוי. בלי תוכן מסך.", "members, ledger, nedarim, tax letters, backup. No screen content.") + "</li><li><b>" + L("גבאי תוכן וזמנים", "Content and times gabbai") + "</b>: " + L("זמני תפילה, תוכן המסך, דף השבת, יארצייטים. בלי נתונים כספיים.", "davening times, screen content, the Shabbat bulletin, yahrzeits. No financial data.") + "</li><li><b>" + L("מתפלל", "Member") + "</b>: " + L("החשבון האישי בלבד.", "their own account only.") + "</li></ul></div></div>" +
        '<form class="card" id="bc"><h3>' + sv(I.bell) + " " + L("הודעה לכולם", "Message to everyone") + '</h3><p class="small muted">' + L("התראה לטלפון ולפעמון של כל מי שבחרתם.", "A notification to the phone and bell of everyone you choose.") + '</p><label class="field"><span>' + L("למי", "To") + '</span><select name="to"><option value="all">' + L("כולם", "Everyone") + '</option><option value="members">' + L("כל המתפללים", "All members") + '</option><option value="content">' + L("גבאי תוכן", "Content gabbaim") + '</option><option value="finance">' + L("גבאי כספים", "Finance gabbaim") + '</option></select></label><label class="field" style="margin-top:10px"><span>' + L("הודעה בעברית", "Hebrew message") + '</span><textarea name="he" required placeholder="תזכורת: אסיפת הקהילה ביום ראשון בשעה 8:00 בערב"></textarea></label><label class="field" style="margin-top:10px"><span>' + L("הודעה באנגלית", "English message") + '</span><textarea name="en" class="ltr" placeholder="Reminder: community meeting Sunday at 8:00 PM"></textarea></label><button class="btn primary" style="margin-top:12px">' + L("שליחה", "Send") + "</button></form></div></div>";
      UI.on(app, "[data-u]", "change", function (e, s) { var u = S.db.users[+s.getAttribute("data-u")]; u.role = s.value; S.log("permissions", "שינה תפקיד: " + u.he + " → " + s.value, "Changed role: " + u.en + " → " + s.value); S.save(); UI.toast(L("התפקיד עודכן. ייכנס לתוקף בכניסה הבאה.", "Role updated. It takes effect at the next sign-in.")); });
      app.querySelector("#grant").addEventListener("click", function () {
        var opts = S.db.members.filter(function (m) { return !S.db.users.some(function (u) { return u.mid === m.id; }); });
        var md = UI.modal("<h2>" + L("מתן הרשאה", "Grant access") + '</h2><p class="small muted">' + L("האדם נכנס פעם אחת עם Google, ואז נותנים לו תפקיד.", "The person signs in once with Google, then you give them a role.") + '</p><label class="field"><span>' + L("מתפלל", "Member") + '</span><select id="gm">' + opts.map(function (m) { return '<option value="' + m.id + '">' + esc(S.N(m)) + "</option>"; }).join("") + '</select></label><label class="field" style="margin-top:10px"><span>' + L("תפקיד", "Role") + '</span><select id="gr">' + ROLE_OPTS.map(function (r) { return '<option value="' + r[0] + '">' + L(r[1], r[2]) + "</option>"; }).join("") + '</select></label><div class="actions"><button class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary" id="gok">' + L("שמירה", "Save") + "</button></div>");
        md.querySelector("#gok").addEventListener("click", function () { var m = S.memberById(md.querySelector("#gm").value); if (!m) return; var r = md.querySelector("#gr").value; S.db.users.push({ mid: m.id, he: m.he, en: m.en, email: m.email, role: r }); S.log("permissions", "נתן הרשאה: " + m.he + " (" + r + ")", "Granted: " + m.en + " (" + r + ")"); S.save(); UI.closeModal(); UI.render(); });
      });
      app.querySelector("#bc").addEventListener("submit", function (e) { e.preventDefault(); var f = e.target, he = f.he.value.trim(), en = f.en.value.trim() || he; S.notify(f.to.value, he, en); S.log("permissions", "שלח הודעה לכולם: " + he, "Sent a broadcast: " + en); S.save(); f.reset(); UI.toast(L("נשלח (הדגמה: לא נשלחה התראה אמיתית)", "Sent (demo: no real notification was sent)")); });
    }
  });

  /* ---------- backup ---------- */
  UI.route("/backup", { admin: true,
    need: "finance", title: function () { return L("גיבוי", "Backup"); },
    render: function (app) {
      var sup = S.role() === "super";
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("גיבוי ושחזור", "Backup and Restore"), L("גיבוי אוטומטי מלא כל לילה בשעה 3:00, לאחסון פרטי ומאובטח.", "A full automatic backup every night at 3:00 AM, to private secure storage."), UI.crumbGabbai()) +
        '<div class="alert ok" style="margin-bottom:16px">' + sv(I.cloud) + "<span><b>" + L("גיבוי אוטומטי", "Automatic backup") + "</b> " + L("רץ לבד כל לילה בשעה 3:00 לאחסון פרטי ומאובטח, בלי שאף אחד צריך לזכור.", "runs on its own every night at 3:00 AM to private secure storage, with nobody having to remember.") + "</span></div>" +
        '<div class="grid g2" style="align-items:start">' +
        '<div class="stack"><div class="card"><h3>' + L("הורדת גיבוי עכשיו", "Download a backup now") + '</h3><p class="small muted">' + L("קובץ אחד עם כל הנתונים. לא משנה כלום.", "One file with all the data. Changes nothing.") + '</p><button class="btn primary" id="dl">' + sv(I.download, 16) + L("הורדת קובץ גיבוי", "Download backup file") + "</button></div>" +
        (sup ? '<div class="card"><h3>' + L("שחזור מקובץ", "Restore from a file") + '</h3><p class="small muted">' + L("שלב 1 תמיד בדיקה בלבד (קורא, לא כותב). שלב 2 מוסיף רק מה שחסר, ולעולם לא מוחק או דורס.", "Step 1 is always a dry run (reads only). Step 2 adds only what is missing and never deletes or overwrites.") + '</p><input type="file" id="rf" accept=".json,application/json"><div id="rres" style="margin-top:10px"></div></div>' : "") + "</div></div></div>";
      app.querySelector("#dl").addEventListener("click", function () {
        var data = JSON.parse(JSON.stringify(S.db)); delete data.demoUsers;
        UI.download("shul-backup-" + S.todayIso() + ".json", JSON.stringify({ exportedAt: new Date().toISOString(), demo: true, data: data }, null, 2));
        S.log("backup", "גיבוי ידני הורד", "Manual backup downloaded"); S.save(true);
      });
      var rf = app.querySelector("#rf");
      if (rf) rf.addEventListener("change", function () {
        var file = rf.files[0]; if (!file) return;
        var rd = new FileReader();
        rd.onload = function () {
          var out = app.querySelector("#rres");
          try {
            var j = JSON.parse(rd.result), d = j.data || j, rows = [], missing = 0;
            RESTORE.forEach(function (k) {
              var arr = Array.isArray(d[k]) ? d[k] : [], have = (S.db[k] || []).map(rkey);
              var miss = arr.filter(function (x) { return have.indexOf(rkey(x)) < 0; }).length; missing += miss;
              rows.push("<tr><td>" + k + '</td><td class="num">' + arr.length + '</td><td class="num">' + miss + "</td></tr>");
            });
            RESTORE_OBJ.forEach(function (k) {
              var o = d[k] && typeof d[k] === "object" ? d[k] : {}, ks = Object.keys(o), miss = ks.filter(function (x) { return !(x in (S.db[k] || {})); }).length; missing += miss;
              rows.push("<tr><td>" + k + '</td><td class="num">' + ks.length + '</td><td class="num">' + miss + "</td></tr>");
            });
            out.innerHTML = '<div class="alert ok">' + L("בדיקה הושלמה. שום דבר לא נכתב.", "Dry run complete. Nothing was written.") + '</div><div class="table-wrap" style="margin-top:8px"><table><thead><tr><th>' + L("אוסף", "Collection") + "</th><th>" + L("בקובץ", "In file") + "</th><th>" + L("חסרים", "Missing") + "</th></tr></thead><tbody>" + rows.join("") + '</tbody></table></div><button class="btn" id="imp" style="margin-top:8px"' + (missing ? "" : " disabled") + ">" + L("שלב 2: הוספת החסרים ", "Step 2: add the missing ") + "(" + missing + ")</button>";
            var ib = out.querySelector("#imp");
            if (ib) ib.addEventListener("click", function () {
              RESTORE.forEach(function (k) { if (!Array.isArray(S.db[k])) S.db[k] = []; var have = S.db[k].map(rkey); (Array.isArray(d[k]) ? d[k] : []).forEach(function (x) { if (have.indexOf(rkey(x)) < 0) S.db[k].push(x); }); });
              RESTORE_OBJ.forEach(function (k) { var o = d[k] && typeof d[k] === "object" ? d[k] : {}; S.db[k] = S.db[k] || {}; Object.keys(o).forEach(function (x) { if (!(x in S.db[k])) S.db[k][x] = o[x]; }); });
              S.log("backup", "שחזור: נוספו " + missing + " מסמכים", "Restore: added " + missing + " documents"); S.save(); UI.toast(L("נוספו ", "Added ") + missing); UI.render();
            });
          } catch (e) { out.innerHTML = '<p class="err">' + L("הקובץ אינו קובץ גיבוי תקין.", "This is not a valid backup file.") + "</p>"; }
        };
        rd.readAsText(file);
      });
    }
  });

  /* ---------- activity log ---------- */
  var AREAS = [["all", "הכל", "All"], ["finance", "כספים", "Finance"], ["members", "מתפללים", "Members"], ["permissions", "הרשאות", "Permissions"], ["join", "בקשות הצטרפות", "Join requests"], ["screen", "מסך", "Screen"], ["times", "זמנים", "Times"], ["texts", "טקסטים", "Texts"], ["sheet", "דף השבת", "Shabbat bulletin"], ["backup", "גיבוי", "Backup"]];
  UI.route("/gabbai/activity", { admin: true,
    need: "super", title: function () { return L("יומן פעילות", "Activity log"); },
    render: function (app, arg, params) {
      var area = params.a || "all", n = +(params.n || 50);
      var list = S.db.activity.filter(function (a) { return area === "all" || a.area === area; });
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("יומן פעילות", "Activity Log"), L("כל פעולה במערכת: מה, מתי ומי.", "Every action in the system: what, when and who."), UI.crumbGabbai()) +
        '<div class="row" style="margin-bottom:14px">' + AREAS.map(function (x) { return '<a class="chip ' + (area === x[0] ? "on" : "") + '" href="#/gabbai/activity?a=' + x[0] + '">' + L(x[1], x[2]) + "</a>"; }).join("") + '</div><div class="table-wrap"><table><thead><tr><th>' + L("מתי", "When") + "</th><th>" + L("מה", "What") + "</th><th>" + L("מי", "Who") + "</th><th>" + L("תחום", "Area") + "</th></tr></thead><tbody>" +
        list.slice(0, n).map(function (a) { var ar = AREAS.filter(function (x) { return x[0] === a.area; })[0]; return '<tr><td class="small num">' + esc(new Date(a.at).toLocaleString(S.prefs.lang === "he" ? "he-IL" : "en-US", { dateStyle: "short", timeStyle: "short" })) + "</td><td>" + esc(L(a.he, a.en)) + '</td><td class="small">' + esc(B(a.who)) + '</td><td><span class="badge">' + (ar ? L(ar[1], ar[2]) : a.area) + "</span></td></tr>"; }).join("") + "</tbody></table></div>" +
        (list.length > n ? '<a class="btn" style="margin-top:12px" href="#/gabbai/activity?a=' + area + "&n=" + (n + 50) + '">' + L("טען עוד", "Load more") + "</a>" : "") + "</div>";
    }
  });
})();
