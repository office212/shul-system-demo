/* Kehillat Noam | the management layer: the command center (KPIs with trends, the smart
   assistant that proposes one-click actions, the campaign, today's schedule, a live feed),
   payment reminders, the aliyot board (auto-assign by chiyuv, then recorded as nedarim),
   the seat map for the High Holidays, and the Ctrl+K quick search. All on the same
   in-browser state; all people, amounts and events are invented sample data. */
(function () {
  "use strict";
  var KN = window.KN, D = window.KN_DATA, S = KN.S, T = KN.T, L = KN.L, esc = KN.esc, ic = KN.ic, B = D.B;
  function pro() { if (!S.pro) S.pro = { done: {}, aliyot: {}, recorded: false, seats: null, live: true }; return S.pro; }
  function first(m) { return L(m.name).split(" ")[0]; }
  function debtors() { return S.members.filter(function (m) { return KN.balance(m) > 0.004; }).sort(function (a, b) { return KN.balance(b) - KN.balance(a); }); }
  function owed() { return Math.round(debtors().reduce(function (a, m) { return a + KN.balance(m); }, 0)); }
  function staffGo(to, role) { if (role === "none") { KN.go(to); return; } if (role ? !KN.can(role) : !KN.can("staff")) { S.role = role === "finance" ? "finance" : "admin"; KN.save(); KN.renderBar(); } KN.go(to); }
  KN.act.proGo = function (el) { staffGo(el.dataset.to, el.dataset.need); };

  /* ================= the smart assistant ================= */
  function insights() {
    var P = pro(), out = [], db = debtors(), um = S.unmatched.filter(function (u) { return u.hint && KN.member(u.hint); })[0], yz = KN.weekYahrzeits().filter(function (y) { return y.memberId; }),
      pend = S.yahrzeits.filter(function (y) { return y.status === "pending"; })[0], kd = S.kiddush.filter(function (k) { return k.open; })[0];
    if (db.length || P.done.debt) out.push({ id: "debt", icon: "send", done: P.done.debt, title: P.done.debt ? T("תזכורות תשלום נשלחו", "Payment reminders sent") : db.length + T(" מתפללים עם יתרה פתוחה · ", " members with an open balance · ") + KN.moneyT(owed()), sub: T("תזכורת אישית עם קישור לתשלום בכרטיס, לכל אחד בשמו.", "A personal reminder with a card-payment link, each by name."), btn: T("לשלוח תזכורות", "Send reminders"), act: "remind" });
    if (um || P.done.match) out.push({ id: "match", icon: "zap", done: P.done.match, title: P.done.match ? T("התשלום שויך למתפלל", "The payment was matched") : T("תשלום של ", "A payment of ") + KN.moneyT(um.amount) + T(" נראה שייך ל", " looks like it belongs to ") + L(KN.member(um.hint).name), sub: T("אותו שם משפחה, אימייל אחר. שיוך בלחיצה, בלי קבלה כפולה.", "Same family name, a different email. One click, no second receipt."), btn: T("לשייך", "Match it"), act: "autoMatch" });
    if (yz.length) out.push({ id: "yz", icon: "flame", done: P.recorded || Object.keys(P.aliyot).length > 0, title: yz.length + T(" מתפללים עם יארצייט השבוע", " members have a yahrzeit this week"), sub: yz.map(function (y) { return first(KN.member(y.memberId)); }).join(" · ") + T(" · מגיעה להם עלייה בשבת.", " · each is due an aliyah on Shabbat."), btn: T("לשבץ עליות", "Assign aliyot"), act: "proGo", to: "aliyot" });
    if (S.joinReqs.length) out.push({ id: "join", icon: "users", title: S.joinReqs.length + T(" בקשות הצטרפות ממתינות", " join requests are waiting"), sub: T("הוותיקה ביותר מחכה מיום רביעי.", "The oldest has been waiting since Wednesday."), btn: T("לאישור", "Review"), act: "proGo", to: "admin/join", need: "admin" });
    if (pend || P.done.yzok) out.push({ id: "yzok", icon: "check", done: P.done.yzok, title: P.done.yzok ? T("היארצייט אושר ויעלה למסך", "The yahrzeit was approved for the screen") : T("יארצייט ממתין לאישור: ", "A yahrzeit awaits approval: ") + L(pend.name), sub: pend ? L(pend.rel) + " · " + KN.hdate(pend.hDay, pend.hMonth) : T("המתפלל קיבל הודעה.", "The member was notified."), btn: T("לאשר", "Approve"), act: "yzOk" });
    if (kd || P.done.kd) out.push({ id: "kd", icon: "gift", done: P.done.kd, title: P.done.kd ? T("ההצעה נשלחה לכל המתפללים", "The offer went out to all members") : L((kd || {}).what) + T(" עדיין בלי חסות", " has no sponsor yet"), sub: T("הודעה לטלפון של כל המתפללים, עם כפתור ״אני לוקח״.", "A push to every member's phone, with an \"I'll take it\" button."), btn: T("להציע למתפללים", "Offer it to members"), act: "kdOffer" });
    return out;
  }
  function asstHtml(compact) {
    var it = insights(); if (compact) it.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0); }); var open = it.filter(function (i) { return !i.done; }).length, pct = it.length ? Math.round((it.length - open) / it.length * 100) : 100, C = 2 * Math.PI * 34;
    return '<div class="asst-h"><span class="asst-i">' + ic("spark") + "</span><div><b>" + T("העוזר החכם", "The smart assistant") + "</b><span>" + (open ? T("מצאתי " + open + " דברים שכדאי לטפל בהם היום", "I found " + open + " things worth handling today") : T("הכול מטופל. שבת שלום!", "Everything is handled. Shabbat Shalom!")) + '</span></div><div class="ring" title="' + pct + '%"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" class="rt"/><circle cx="40" cy="40" r="34" class="rv" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct / 100)).toFixed(1) + '"/></svg><b>' + pct + "%</b></div></div>" +
      '<div class="asst-l">' + it.slice(0, compact ? 3 : 9).map(function (i, n) { return '<div class="ai' + (i.done ? " done" : "") + '" style="--i:' + n + '"><span class="ai-i">' + ic(i.done ? "check" : i.icon) + "</span><div><b>" + esc(i.title) + "</b><span>" + esc(i.sub) + "</span></div>" + (i.done || compact ? "" : '<button class="btn sm gold" data-act="' + i.act + '"' + (i.to ? ' data-to="' + i.to + '"' : "") + (i.need ? ' data-need="' + i.need + '"' : "") + ">" + i.btn + "</button>") + "</div>"; }).join("") + "</div>";
  }
  function repaint() { var a = document.getElementById("hqAsst"); if (a) { a.innerHTML = asstHtml(); paintKpis(); paintFeed(); paintCamp(); } }
  KN.act.autoMatch = function () {
    var u = S.unmatched.filter(function (x) { return x.hint && KN.member(x.hint); })[0]; if (!u) return; var m = KN.member(u.hint);
    KN.addEntry(m, "payment", u.amount, B("תשלום · " + u.ref, "Payment · " + u.ref), "card"); S.unmatched = S.unmatched.filter(function (x) { return x !== u; }); pro().done.match = true; KN.save(); repaint();
    KN.toast(T("שויך ל", "Matched to ") + esc(L(m.name)) + " · " + KN.moneyT(u.amount));
  };
  KN.act.yzOk = function () {
    var y = S.yahrzeits.filter(function (x) { return x.status === "pending"; })[0]; if (!y) return; y.status = "approved"; pro().done.yzok = true; S.tvNew = y.id;
    KN.log("yz", B("יארצייט אושר: " + y.name.he, "Yahrzeit approved: " + y.name.en)); KN.notify({ kind: "approval", title: B("הבקשה אושרה ✓", "Request approved ✓"), body: B("היארצייט של " + y.name.he + " יופיע במסך בשבוע שלו", "The yahrzeit of " + y.name.en + " will appear on the screen in its week"), to: ["member"] });
    KN.save(); repaint(); KN.toast(T("אושר. יופיע על המסך בשבוע היארצייט.", "Approved. It will appear on the screen in its week."));
  };
  KN.act.kdOffer = function () {
    var k = S.kiddush.filter(function (x) { return x.open; })[0]; pro().done.kd = true;
    KN.notify({ kind: "announce", title: B("קידוש פנוי לחסות", "A kiddush is open for sponsorship"), body: B((k ? k.what.he : "קידוש השבת") + " · לחצו כדי לקחת את החסות", (k ? k.what.en : "This Shabbat's kiddush") + " · tap to take the sponsorship"), to: ["member", "finance", "content", "admin"] });
    KN.log("charge", B("הצעת חסות קידוש נשלחה ל־" + S.members.length + " מתפללים", "Kiddush sponsorship offer sent to " + S.members.length + " members")); repaint();
    KN.toast(T("נשלח ל־" + S.members.length + " מתפללים", "Sent to " + S.members.length + " members"));
  };

  /* ---------- payment reminders ---------- */
  var rmCh = "wa";
  function rmMsg(m) { return T("שלום " + first(m) + ", תזכורת ידידותית מ" + KN.shulName() + ": היתרה הפתוחה שלך היא " + KN.moneyT(KN.balance(m)) + ". לתשלום מאובטח בכרטיס: ", "Hello " + first(m) + ", a friendly reminder from " + KN.shulName() + ": your open balance is " + KN.moneyT(KN.balance(m)) + ". Pay securely by card: ") + '<bdi class="ltr">kehillatnoam.demo/pay/' + m.id + "</bdi> " + T("(קישור לדוגמה)", "(sample link)") + T(" · תזכו למצוות!", " · Tizku lemitzvot!"); }
  KN.act.remind = function () {
    var db = debtors(); if (!db.length) { KN.toast(T("אין יתרות פתוחות", "No open balances")); return; }
    KN.modal('<h2>' + T("תזכורות תשלום", "Payment reminders") + '</h2><p class="lede">' + T("כל מתפלל מקבל הודעה אישית עם היתרה שלו וקישור לתשלום. בהדגמה שום הודעה לא נשלחת באמת.", "Each member gets a personal message with his balance and a payment link. In the demo nothing is really sent.") + '</p>' + (KN.holdNote ? KN.holdNote() : "") + '<div class="seg" role="group">' + [["wa", "WhatsApp"], ["sms", "SMS"], ["mail", T("מייל", "Email")]].map(function (c) { return '<button data-act="rmCh" data-c="' + c[0] + '" aria-pressed="' + (rmCh === c[0]) + '">' + c[1] + "</button>"; }).join("") + '</div><div class="rm"><div class="rm-l" id="rmList">' + db.map(function (m, i) { return '<label class="rm-r' + (i === 0 ? " on" : "") + '" data-id="' + m.id + '"><input type="checkbox" checked data-on="rmPick" value="' + m.id + '"><span class="avatar">' + esc(KN.initials(m)) + "</span><span><b>" + esc(L(m.name)) + '</b><small class="num">' + esc(m.phone) + '</small></span><b class="amt-pos">' + KN.money(KN.balance(m)) + '</b><i class="st"></i></label>'; }).join("") + '</div><div class="rm-p"><span class="eyebrow">' + T("תצוגה מקדימה", "Preview") + '</span><div class="bubble" id="rmPrev">' + rmMsg(db[0]) + '</div><p class="small muted">' + T("לחצו על שם כדי לראות את ההודעה שלו.", "Click a name to see his message.") + '</p></div></div><button class="btn gold block lg" id="rmGo" data-act="rmSend">' + ic("send") + '<span id="rmN"></span></button>', true);
    rmCount();
  };
  function rmCount() { var n = document.querySelectorAll("#rmList input:checked").length, el = document.getElementById("rmN"); if (el) el.textContent = T("לשלוח ל־" + n + " מתפללים", "Send to " + n + " members"); return n; }
  KN.on.rmPick = function () { rmCount(); };
  KN.act.rmCh = function (el) { rmCh = el.dataset.c; document.querySelectorAll(".seg button").forEach(function (b) { b.setAttribute("aria-pressed", b === el); }); };
  document.addEventListener("click", function (ev) { var r = ev.target.closest && ev.target.closest(".rm-r"); if (!r || ev.target.tagName === "INPUT") return; document.querySelectorAll(".rm-r").forEach(function (x) { x.classList.toggle("on", x === r); }); document.getElementById("rmPrev").innerHTML = rmMsg(KN.member(r.dataset.id)); });
  KN.act.rmSend = function (el) {
    var rows = [].slice.call(document.querySelectorAll("#rmList .rm-r")).filter(function (r) { return r.querySelector("input").checked; }); if (!rows.length) return;
    if (KN.hold && KN.hold(rows.length)) { pro().done.debt = true; KN.save(); KN.closeModal(); repaint(); return; }
    el.disabled = true;
    rows.forEach(function (r, i) { setTimeout(function () { r.classList.add("sending"); }, i * 260); setTimeout(function () { r.classList.remove("sending"); r.classList.add("sent"); }, i * 260 + 420); });
    setTimeout(function () {
      pro().done.debt = true; var ch = { wa: "WhatsApp", sms: "SMS", mail: T("מייל", "email") }[rmCh];
      KN.log("charge", B("נשלחו " + rows.length + " תזכורות תשלום", rows.length + " payment reminders sent"));
      KN.notify({ kind: "payment", title: B("תזכורת: יתרה פתוחה", "Reminder: open balance"), body: B("אפשר לשלם בכרטיס מהאזור האישי, בלחיצה", "You can pay by card from your account, in one click"), to: ["member"] });
      KN.closeModal(); repaint(); KN.toast(T("נשלחו " + rows.length + " תזכורות ב־" + ch, rows.length + " reminders sent by " + ch));
    }, rows.length * 260 + 900);
  };

  /* ================= the command center ================= */
  function spark(a) { var mx = Math.max.apply(null, a), mn = Math.min.apply(null, a), r = mx - mn || 1, pts = a.map(function (v, i) { return (i / (a.length - 1) * 96 + 2).toFixed(1) + "," + (26 - (v - mn) / r * 22).toFixed(1); }); return '<svg class="spk" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + pts.join(" ") + '"/></svg>'; }
  function totals() { var c = 0, p = 0; S.members.forEach(function (m) { m.ledger.forEach(function (e) { if (e.type === "charge") c += e.amount; else p += e.amount; }); }); return { c: c, p: p, rate: c ? Math.round(p / c * 100) : 100 }; }
  function kpisHtml(anim) {
    var now = KN.monthCollected(), t = totals(), ow = owed(), dn = S.donations.length;
    function v(n, pre, suf) { return (anim ? '<div class="v"><span data-count="' + n + '" data-pre="' + (pre || "") + '">' + (pre || "") + "0</span>" : '<div class="v">' + (pre || "") + n.toLocaleString("en-US")) + (suf || "") + "</div>"; }
    return '<div class="kp"><div class="k">' + ic("trend") + T("נגבה בנובמבר", "Collected in November") + "</div>" + v(now, "$") + spark(KN.monthSeries().map(function (m) { return m[1]; })) + '<div class="d' + (KN.monthDelta() >= 0 ? " up" : "") + '">' + KN.deltaHtml() + "</div></div>" +
      '<div class="kp"><div class="k">' + ic("coins") + T("יתרות פתוחות", "Outstanding") + "</div>" + v(ow, "$") + spark([1.6, 1.42, 1.3, 1.18, 1.07, 1].map(function (k) { return Math.round(ow * k); })) + '<div class="d">' + debtors().length + " " + T("מתפללים", "members") + "</div></div>" +
      '<div class="kp"><div class="k">' + ic("target") + T("שיעור גבייה · תשפ״ז", "Collection rate · 5787") + "</div>" + v(t.rate, "", "%") + '<div class="meter"><i style="width:' + t.rate + '%"></i></div><div class="d">' + KN.moneyT(Math.round(t.p)) + T(" מתוך ", " of ") + KN.moneyT(Math.round(t.c)) + "</div></div>" +
      '<div class="kp"><div class="k">' + ic("users") + T("מתפללים רשומים", "Registered members") + "</div>" + v(S.members.length) + spark([104, 108, 111, 115, 118, S.members.length]) + '<div class="d">' + S.joinReqs.length + " " + T("בקשות ממתינות", "requests waiting") + "</div></div>" +
      '<div class="kp"><div class="k">' + ic("heart") + T("תרומות החודש", "Donations this month") + "</div>" + v(dn) + spark([2, 3, 3, 6, 4, dn]) + '<div class="d">' + T("כולל אורחים", "Including guests") + "</div></div>";
  }
  function paintKpis() { var k = document.getElementById("hqKpis"); if (k) { k.innerHTML = kpisHtml(false); } }
  var FK = { pay: ["pay", "coins"], join: ["join", "users"], yz: ["yz", "flame"], charge: ["", "book"] };
  function feedHtml() { return S.activity.slice(0, 7).map(function (a) { var k = FK[a.kind] || FK.charge; return '<div class="it' + (a.fresh ? " new" : "") + '"><span class="fi ' + k[0] + '">' + ic(k[1]) + "</span><div><b>" + esc(L(a.text)) + '</b><div class="t">' + esc(L(a.when)) + "</div></div></div>"; }).join(""); }
  function paintFeed() { var f = document.getElementById("hqFeed"); if (f) { f.innerHTML = feedHtml(); S.activity.forEach(function (a) { delete a.fresh; }); } }
  function campHtml() { return KN.campHtml("thermo"); }
  function paintCamp() { var c = document.getElementById("hqCamp"); if (c) { c.innerHTML = campHtml(); KN.campFill("thermo", true); } }
  function sources() {
    var G = [["dues", "דמי חבר", "Membership dues", /דמי חבר/], ["ned", "נדרים ועליות", "Nedarim & aliyot", /נדר/], ["spon", "חסויות וקידושים", "Sponsorships & kiddush", /חסות|נר למאור/], ["bld", "קמפיין הבניין", "Building campaign", /קמפיין הבניין/], ["don", "תרומות", "Donations", /./]], sum = {};
    G.forEach(function (g) { sum[g[0]] = 0; });
    S.members.forEach(function (m) { m.ledger.forEach(function (e) { if (e.type !== "charge") return; for (var i = 0; i < G.length; i++) if (G[i][3].test(e.desc.he)) { sum[G[i][0]] += e.amount; break; } }); });
    S.donations.forEach(function (d) { sum.don += d.amount; });
    var rows = G.map(function (g) { return { n: T(g[1], g[2]), v: Math.round(sum[g[0]]) }; }).sort(function (a, b) { return b.v - a.v; }), mx = rows[0].v || 1;
    return rows.map(function (r, i) { return '<div class="src" title="' + r.n + ": " + KN.moneyT(r.v) + '"><span>' + r.n + '</span><div class="srb"><i style="width:' + (r.v / mx * 100).toFixed(1) + "%;--i:" + i + '"></i></div><b class="num">' + KN.moneyT(r.v) + "</b></div>"; }).join("");
  }
  function dayLine() {
    var d = KN.now(), dow = d.getDay(), now = d.getHours() * 60 + d.getMinutes(), nextDone = false;
    return KN.dayPrayers(dow).map(function (p) { var past = KN.mins(p.time) < now, cls = past ? "past" : (!nextDone ? (nextDone = true, "next") : ""); return '<div class="tl ' + cls + '"><b class="num">' + KN.time(p.time) + "</b><i></i><span>" + esc(L(p.name)) + (cls === "next" ? ' <em class="chip gold">' + T("הבא", "Next") + "</em>" : "") + "</span></div>"; }).join("") || '<p class="muted">' + T("אין תפילות רשומות להיום.", "No davening listed for today.") + "</p>";
  }
  function launcher() { return KN.MODS.length ? '<section class="section"><div class="card-h"><h2>' + T("כל המודולים", "All modules") + '</h2><span class="chip gold">' + T("הדגמות עם נתוני דמו", "Demos with sample data") + '</span></div><div class="mods">' + KN.MODS.map(function (m) { return '<button class="mod" data-act="proGo" data-to="' + m.id + '"' + (m.need ? ' data-need="' + m.need + '"' : ' data-need="none"') + '><span class="qi">' + ic(m.ic) + "</span><span><b>" + T(m.he, m.en) + "</b><span>" + T(m.dHe, m.dEn) + "</span></span></button>"; }).join("") + "</div></section>" : ""; }
  KN.views.hq = { need: "staff",
    render: function () {
      var P = pro(), day = KN.today(), me = KN.me(), wy = KN.weekYahrzeits();
      return '<div class="page wide hq"><div class="page-head"><div><span class="eyebrow">' + T("מרכז הפיקוד", "The command center") + " · " + KN.roleName(S.role) + "</span><h1>" + T("שלום, ", "Hello, ") + esc(first(me)) + '</h1><p class="lede">' + T("יום ", "") + L(D.DOW[day.dow]) + ", " + KN.hdate(day.hDay, day.hMonth) + " " + L(D.WEEK.hYear) + " · " + T("פרשת ", "Parashat ") + L(D.WEEK.parasha) + '</p></div><div class="row"><button class="btn sec" data-act="proGo" data-to="import">' + ic("users") + T("ייבוא חברים", "Import members") + '</button><button class="btn sec" data-act="cmdk">' + ic("search") + T("חיפוש מהיר", "Quick search") + ' <kbd>Ctrl K</kbd></button><button class="btn sec live-t" data-act="hqLive" aria-pressed="' + !!P.live + '"><span class="live"><i></i></span>' + T("סימולציה חיה", "Live simulation") + "</button></div></div>" +
        '<div class="kps" id="hqKpis">' + kpisHtml(true) + '</div><div class="hq-g"><div class="stack"><div class="asst" id="hqAsst">' + asstHtml() + "</div>" +
        '<div class="grid g2"><div class="card"><div class="card-h"><h3>' + T("סדר היום", "Today's schedule") + '</h3><button class="btn sm sec" data-go="times">' + T("כל הזמנים", "All times") + '</button></div><div class="tls">' + dayLine() + '</div></div><div class="card"><div class="card-h"><h3>' + T("השבוע בקהילה", "This week in the community") + '</h3></div><div class="wk">' +
        wy.map(function (y) { return '<div><span class="fi yz">' + ic("flame") + "</span><div><b>" + esc(L(y.name)) + "</b><span>" + KN.hdate(y.hDay, y.hMonth) + " · " + esc(L(y.rel)) + "</span></div></div>"; }).join("") + S.mazal.map(function (z) { return '<div><span class="fi join">' + ic("star") + "</span><div><b>" + T("מזל טוב", "Mazal Tov") + "</b><span>" + esc(L(z.text)) + "</span></div></div>"; }).join("") + "</div></div></div>" +
        '<div class="card"><div class="card-h"><h3>' + T("חיובים ותרומות לפי מקור · תשפ״ז", "Charges & donations by source · 5787") + '</h3><button class="btn sm sec" data-act="proGo" data-to="finance" data-need="finance">' + T("לשולחן הכספים", "Finance desk") + '</button></div><div class="srcs">' + sources() + "</div></div></div>" +
        '<div class="stack">' + (KN.fridayCard ? KN.fridayCard() : "") + '<div class="card camp"><div class="card-h"><h3>' + ic("target") + esc(KN.campaign().name) + '</h3><span class="chip gold">' + T("נתוני דמו", "Demo data") + '</span></div><div id="hqCamp">' + campHtml() + '</div><button class="btn sm gold" data-go="donate" style="margin-top:12px">' + T("לדף התרומה", "Open the donate page") + "</button></div>" + KN.chartCard() +
        '<div class="card"><div class="card-h"><h3>' + T("מה קורה עכשיו", "Happening now") + '</h3><span class="live"><i></i>' + T("חי", "LIVE") + '</span></div><div class="feed" id="hqFeed">' + feedHtml() + '</div><p class="small muted" style="margin-top:8px">' + T("בסימולציה החיה נכנסות תרומות לדוגמה כל כמה שניות, והמספרים מתעדכנים.", "In the live simulation sample donations arrive every few seconds and the numbers update.") + "</p></div></div></div>" + launcher() + KN.foot() + "</div>";
    },
    after: function () {
      S.activity.forEach(function (a) { delete a.fresh; });
      setTimeout(function () { KN.campFill("thermo"); }, 150);
      var n = 0, tm = setInterval(function () { if (!pro().live || document.getElementById("modal") || n >= 10) return; n++; simEvent(); }, 6500);
      KN.cleanup.push(function () { clearInterval(tm); });
    }
  };
  KN.act.hqLive = function (el) { pro().live = !pro().live; KN.save(); el.setAttribute("aria-pressed", pro().live); KN.toast(pro().live ? T("הסימולציה החיה פועלת", "Live simulation is on") : T("הסימולציה החיה הופסקה", "Live simulation paused")); };
  var SIM = [[B("משפחת בן דוד", "The Ben David family"), 180], [B("אורח מהמנחה", "A Mincha guest"), 36], [B("שרה אלקיים", "Sarah Elkayam"), 72], [B("משפחת וקנין", "The Vaknin family"), 500], [B("יהודה אסולין", "Yehuda Assouline"), 54], [B("תורם בעילום שם", "An anonymous donor"), 101], [B("משפחת חזן", "The Chazan family"), 260], [B("נתנאל גבאי", "Netanel Gabay"), 18]], simI = 0;
  function simEvent() {
    var e = SIM[simI++ % SIM.length];
    S.donations.unshift({ id: "G" + Date.now(), date: KN.todayIso(), amount: e[1], donor: e[0], email: "donor@mail.demo", ref: KN.nextRef(), sim: true });
    KN.log("pay", B("תרומה " + KN.moneyT(e[1]) + " · " + e[0].he, "Donation " + KN.moneyT(e[1]) + " · " + e[0].en));
    var c = document.getElementById("hqCamp"); if (c) { var was = document.getElementById("thermo").style.width; c.innerHTML = campHtml(); var t = document.getElementById("thermo"); t.style.transition = "none"; t.style.width = was; void t.offsetWidth; t.style.transition = ""; t.style.width = t.dataset.w + "%"; }
    paintKpis(); paintFeed(); document.querySelectorAll("#hqKpis .kp").forEach(function (k, i) { if (i === 0 || i === 4) { k.classList.add("tick"); } });
  }

  /* ================= the aliyot board ================= */
  var HON = [["petichah", "פתיחת ההיכל", "Opening the Ark", 52], ["kohen", "כהן", "Kohen", 36], ["levi", "לוי", "Levi", 36], ["al3", "שלישי", "Third", 72], ["al4", "רביעי", "Fourth", 72], ["al5", "חמישי", "Fifth", 52], ["al6", "שישי", "Sixth", 52], ["al7", "שביעי", "Seventh", 36], ["maftir", "מפטיר", "Maftir", 180], ["hagbah", "הגבהה", "Hagbah", 36], ["gelilah", "גלילה", "Gelilah", 26]];
  var TRIBE = { m2: "kohen", m11: "levi" };
  var WHY = { yz: B("יארצייט השבוע", "Yahrzeit this week"), bm: B("אבי בר המצווה", "Father of the Bar Mitzvah"), baby: B("הולדת הבת", "Birth of a daughter"), kohen: B("כהן", "Kohen"), levi: B("לוי", "Levi"), long: B("לא עלה מעל חודש", "No aliyah in over a month"), turn: B("לפי התור", "By rotation") };
  var PLAN = [["petichah", "m7", "baby"], ["kohen", "m2", "kohen"], ["levi", "m11", "levi"], ["al3", "m1", "yz"], ["al4", "m4", "yz"], ["al5", "m8", "long"], ["al6", "m5", "long"], ["al7", "m6", "turn"], ["maftir", "m3", "bm"], ["hagbah", "m10", "turn"], ["gelilah", "m9", "turn"]];
  function chiyuvim() { var c = KN.weekYahrzeits().filter(function (y) { return y.memberId; }).map(function (y) { return { m: y.memberId, why: "yz", note: L(y.name) + " · " + KN.hdate(y.hDay, y.hMonth) }; }); c.push({ m: "m3", why: "bm", note: T("בר המצווה של איתמר, שבת ויצא", "Itamar's Bar Mitzvah, Shabbat Vayetze") }); c.push({ m: "m7", why: "baby", note: T("מזל טוב ליעקב ושירה", "Mazal Tov to Yaakov and Shira") }); return c.filter(function (x) { return KN.member(x.m); }); }
  function lastAliyah(m) { var d = ""; m.ledger.forEach(function (e) { if (e.type === "charge" && /נדר/.test(e.desc.he) && e.date > d) d = e.date; }); return d; }
  function alRow(h, i) {
    var a = pro().aliyot[h[0]] || {}, rec = pro().recorded;
    return '<div class="al-r' + (a.m ? " set" : "") + '" style="--i:' + i + '"><b class="al-n">' + T(h[1], h[2]) + '</b><select class="input" data-on="alPick" data-h="' + h[0] + '"' + (rec ? " disabled" : "") + '><option value="">' + T("בחרו מתפלל", "Choose a member") + "</option>" + S.members.map(function (m) { return '<option value="' + m.id + '"' + (a.m === m.id ? " selected" : "") + ">" + esc(L(m.name)) + (TRIBE[m.id] ? " · " + L(WHY[TRIBE[m.id]]) : "") + "</option>"; }).join("") + '</select><span class="al-w">' + (a.why ? '<em class="chip ' + (a.why === "yz" || a.why === "bm" || a.why === "baby" ? "gold" : "") + '">' + L(WHY[a.why]) + "</em>" : "") + '</span><label class="al-a"><span>$</span><input class="input num" inputmode="numeric" data-on="alAmt" data-h="' + h[0] + '" value="' + (a.m ? (a.amt != null ? a.amt : h[3]) : "") + '"' + (rec ? " disabled" : "") + ' aria-label="' + T("סכום הנדר", "Pledge amount") + '"></label></div>';
  }
  function alSum() { var n = 0, t = 0; HON.forEach(function (h) { var a = pro().aliyot[h[0]]; if (a && a.m) { n++; t += Number(a.amt != null ? a.amt : h[3]) || 0; } }); return { n: n, t: t }; }
  function alSide() {
    var A = pro().aliyot, used = {}; Object.keys(A).forEach(function (k) { if (A[k].m) used[A[k].m] = 1; });
    var ch = chiyuvim(), fair = S.members.map(function (m) { return { m: m, d: lastAliyah(m) }; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; }).slice(0, 4);
    return '<div class="card"><div class="card-h"><h3>' + ic("flame") + T("חיובים השבוע", "This week's chiyuvim") + '</h3><span class="chip gold">' + ch.filter(function (c) { return used[c.m]; }).length + "/" + ch.length + '</span></div><div class="wk">' + ch.map(function (c) { var m = KN.member(c.m); return '<div class="' + (used[c.m] ? "ok" : "") + '"><span class="avatar">' + (used[c.m] ? ic("check") : esc(KN.initials(m))) + "</span><div><b>" + esc(L(m.name)) + " · " + L(WHY[c.why]) + "</b><span>" + esc(c.note) + "</span></div></div>"; }).join("") + "</div></div>" +
      '<div class="card"><h3>' + T("מי לא עלה מזמן", "Longest without an aliyah") + '</h3><p class="small muted">' + T("כדי שכל מתפלל יקבל את התור שלו.", "So that every member gets his turn.") + '</p><div class="wk" style="margin-top:8px">' + fair.map(function (f) { return '<div class="' + (used[f.m.id] ? "ok" : "") + '"><span class="avatar">' + (used[f.m.id] ? ic("check") : esc(KN.initials(f.m))) + "</span><div><b>" + esc(L(f.m.name)) + "</b><span>" + (f.d ? T("עלייה אחרונה: ", "Last aliyah: ") + KN.date(f.d) : T("עוד לא עלה השנה", "No aliyah yet this year")) + "</span></div></div>"; }).join("") + "</div></div>";
  }
  function alFoot() { var s = alSum(), rec = pro().recorded; return '<div><b>' + s.n + "/" + HON.length + "</b> " + T("כיבודים שובצו", "honors assigned") + " · <b>" + KN.moneyT(s.t) + "</b> " + T("נדרים צפויים", "in expected pledges") + '</div><div class="row"><button class="btn sec" data-act="alPrint"' + (s.n ? "" : " disabled") + ">" + ic("print") + T("דף לגבאי", "Gabbai's sheet") + "</button>" + (rec ? '<button class="btn sec" data-act="alNew">' + T("שבת חדשה", "New Shabbat") + "</button>" : '<button class="btn" data-act="alRecord"' + (s.n ? "" : " disabled") + ">" + ic("check") + T("מוצאי שבת: לרשום כנדרים", "Motzei Shabbat: record as nedarim") + "</button>") + "</div>"; }
  function alPaint(anim) { var b = document.getElementById("alBoard"); if (!b) return; b.innerHTML = HON.map(alRow).join(""); b.classList.toggle("anim", !!anim); document.getElementById("alSide").innerHTML = alSide(); document.getElementById("alFoot").innerHTML = alFoot(); }
  KN.views.aliyot = { need: "staff",
    render: function () {
      return '<div class="page"><div class="page-head"><div><span class="eyebrow">' + T("לוח העליות", "The aliyot board") + "</span><h1>" + T("שבת פרשת ", "Shabbat Parashat ") + L(D.WEEK.parasha) + '</h1><p class="lede">' + T("המערכת יודעת מי חייב עלייה השבוע ומי לא עלה מזמן. משבצים בלחיצה, ובמוצאי שבת הכול נרשם כנדרים בחשבונות המתפללים.", "The system knows who is due an aliyah this week and who has not had one for a while. Assign with one click, and on Saturday night it all becomes nedarim on the members' accounts.") + '</p></div><div class="row"><button class="btn sec" data-act="alClear">' + T("ניקוי", "Clear") + '</button><button class="btn gold lg" data-act="alAuto">' + ic("spark") + T("שיבוץ אוטומטי", "Auto-assign") + '</button></div></div><div class="split"><div class="card al"><div class="al-hd"><span>' + T("כיבוד", "Honor") + "</span><span>" + T("מתפלל", "Member") + "</span><span>" + T("למה", "Why") + "</span><span>" + T("נדר", "Pledge") + '</span></div><div id="alBoard">' + HON.map(alRow).join("") + '</div><div class="al-ft" id="alFoot">' + alFoot() + '</div></div><div class="stack" id="alSide">' + alSide() + "</div></div>" + KN.foot() + "</div>";
    },
    after: function () { if (document.getElementById("tour") && !alSum().n && !pro().recorded) setTimeout(function () { if (document.getElementById("alBoard")) KN.act.alAuto(); }, 1100); }
  };
  KN.act.alAuto = function () { if (pro().recorded) { KN.toast(T("השבת הזאת כבר נרשמה. פתחו שבת חדשה.", "This Shabbat is already recorded. Start a new one.")); return; } var A = pro().aliyot = {}; var ch = chiyuvim(); PLAN.forEach(function (p) { if (!KN.member(p[1])) return; var c = ch.filter(function (x) { return x.m === p[1]; })[0]; A[p[0]] = { m: p[1], why: c && !TRIBE[p[1]] ? (p[2] === "bm" ? "bm" : c.why) : p[2] }; }); KN.save(); alPaint(true); if (!document.getElementById("tour")) KN.toast(T("שובצו " + alSum().n + " כיבודים: קודם החיובים, אחר כך לפי התור", alSum().n + " honors assigned: chiyuvim first, then by rotation")); };
  KN.act.alClear = function () { if (pro().recorded) return; pro().aliyot = {}; KN.save(); alPaint(); };
  KN.act.alNew = function () { pro().aliyot = {}; pro().recorded = false; KN.save(); alPaint(); };
  KN.on.alPick = function (el) { var A = pro().aliyot, id = el.value; if (!id) delete A[el.dataset.h]; else { var c = chiyuvim().filter(function (x) { return x.m === id; })[0]; A[el.dataset.h] = { m: id, why: c ? c.why : TRIBE[id] || "turn" }; } KN.save(); alPaint(); };
  KN.on.alAmt = function (el) { var a = pro().aliyot[el.dataset.h]; if (!a) return; a.amt = Math.max(0, Number(el.value.replace(/[^\d.]/g, "")) || 0); KN.save(); document.getElementById("alFoot").innerHTML = alFoot(); };
  function alList() { return HON.map(function (h) { var a = pro().aliyot[h[0]]; return a && a.m && KN.member(a.m) ? { h: h, m: KN.member(a.m), amt: Number(a.amt != null ? a.amt : h[3]) || 0, why: a.why } : null; }).filter(Boolean); }
  KN.aliyotList = alList;
  KN.act.alPrint = function () { KN.modal('<div class="print-sheet"><h2>' + esc(KN.shulName()) + " · " + T("דף עליות לשבת פרשת ", "Aliyot sheet · Shabbat Parashat ") + L(D.WEEK.parasha) + '</h2><table class="t" style="margin-top:12px"><tr><th>' + T("כיבוד", "Honor") + "</th><th>" + T("מתפלל", "Member") + "</th><th>" + T("הערה", "Note") + "</th></tr>" + alList().map(function (r) { return "<tr><td><b>" + T(r.h[1], r.h[2]) + "</b></td><td>" + esc(L(r.m.name)) + "</td><td>" + L(WHY[r.why] || WHY.turn) + "</td></tr>"; }).join("") + '</table></div><p style="margin-top:14px" class="no-print"><button class="btn" data-act="doPrint">' + ic("print") + T("הדפסה", "Print") + "</button></p>", true); };
  KN.act.alRecord = function () {
    var list = alList().filter(function (r) { return r.amt > 0; }); if (!list.length) return; var tot = 0;
    list.forEach(function (r) { tot += r.amt; var m = r.m; m.ledger.push({ id: "L" + Date.now() + Math.floor(Math.random() * 9999), date: KN.todayIso(), type: "charge", amount: r.amt, desc: B("נדר · " + r.h[1] + " · פרשת ויצא", "Neder · " + r.h[2] + " · Vayetze"), fresh: true }); });
    pro().recorded = true; KN.log("charge", B("נרשמו " + list.length + " נדרים משבת ויצא · " + KN.moneyT(tot), list.length + " nedarim recorded from Shabbat Vayetze · " + KN.moneyT(tot))); KN.save(); alPaint();
    KN.modal('<div class="center"><div class="okmark">' + ic("check") + "</div><h2>" + T("נרשמו " + list.length + " נדרים · ", list.length + " nedarim recorded · ") + KN.moneyT(tot) + '</h2><p class="lede" style="margin:8px auto 16px">' + T("כל נדר נרשם כחיוב בחשבון המתפלל. הוא רואה אותו באזור האישי ויכול לשלם בכרטיס.", "Each neder is now a charge on the member's account. He sees it in his own area and can pay by card.") + '</p><div class="row" style="justify-content:center"><button class="btn gold" data-act="proGo" data-to="finance/m/' + list[0].m.id + '" data-need="finance">' + T("לראות את היתרה החדשה של ", "See the new balance of ") + esc(L(list[0].m.name)) + '</button><button class="btn" data-act="proGo" data-to="finance/ledger" data-need="finance">' + T("לראות בספר התנועות", "See them in the ledger") + '</button><button class="btn sec" data-act="closeModal">' + T("סגירה", "Close") + "</button></div></div>");
    if (KN.confetti) KN.confetti();
  };

  /* ================= the seat map ================= */
  var ROWS = 10, COLS = 16, HALF = 8, GUESTS = [B("משפחת קורן", "Koren family"), B("משפחת שרעבי", "Sharabi family"), B("משפחת לנדאו", "Landau family"), B("משפחת עטיה", "Attia family"), B("משפחת בן חיים", "Ben Chaim family"), B("משפחת אסייג", "Assayag family"), B("משפחת וקנין", "Vaknin family")];
  function price(r) { return r <= 2 ? 360 : r <= 5 ? 250 : 180; }
  function seats() {
    var P = pro(); if (P.seats) return P.seats;
    var m = {}, r, c, seed = 7; function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    for (r = 1; r <= ROWS; r++) for (c = 1; c <= COLS; c++) m[r + "-" + c] = { st: "free" };
    /* permanent seats: the first 46 households, two or three seats each, filling the front rows */
    var rr = 1, cc = 1; S.members.slice(0, 46).forEach(function (mb, i) { var n = i % 3 === 0 ? 3 : 2; if (cc + n - 1 > COLS || (cc <= HALF && cc + n - 1 > HALF)) { if (cc <= HALF) cc = HALF + 1; else { rr++; cc = 1; } } if (rr > 7) return; for (var q = 0; q < n; q++) m[rr + "-" + (cc + q)] = { st: "own", who: mb.id }; cc += n + (i % 4 === 1 ? 1 : 0); if (cc > COLS) { rr++; cc = 1; } });
    var g = 0; for (r = 1; r <= ROWS; r++) { c = 1; while (c <= COLS) { var k = r + "-" + c; if (m[k].st === "free" && rnd() < 0.3) { var n = 2 + Math.floor(rnd() * 3), st = rnd() < 0.2 ? "hold" : "sold", who = GUESTS[g++ % GUESTS.length]; for (var j = 0; j < n && c + j <= COLS && m[r + "-" + (c + j)].st === "free"; j++) m[r + "-" + (c + j)] = { st: st, guest: who }; c += n; } else c++; } }
    P.seats = m; KN.save(); return m;
  }
  function holder(s) { return s.who && KN.member(s.who) ? L(KN.member(s.who).name) : s.guest ? L(s.guest) : ""; }
  function seatStats() { var m = seats(), n = { free: 0, own: 0, sold: 0, hold: 0 }, rev = 0, pend = 0; Object.keys(m).forEach(function (k) { var s = m[k], r = +k.split("-")[0]; n[s.st]++; if (s.st === "sold") rev += price(r); if (s.st === "hold") pend += price(r); }); var tot = ROWS * COLS; return { n: n, rev: rev, pend: pend, occ: Math.round((tot - n.free) / tot * 100), tot: tot }; }
  var seatF = "all";
  KN.views.seats = { need: "staff",
    render: function () {
      var m = seats(), st = seatStats(), html = "";
      for (var r = 1; r <= ROWS; r++) {
        html += '<div class="srow"><span class="rn">' + r + "</span>";
        for (var c = 1; c <= COLS; c++) { var k = r + "-" + c, s = m[k], h = holder(s), w = s.who || (s.guest ? "g:" + s.guest.en : ""); html += (c === HALF + 1 ? '<span class="aisle"></span>' : "") + '<button class="seat st-' + s.st + (S.newIds[k] ? " pop" : "") + '" data-act="seatOpen" data-k="' + k + '" data-w="' + esc(w) + '" title="' + T("שורה ", "Row ") + r + T(" · מקום ", " · seat ") + c + (h ? " · " + esc(h) : "") + " · " + KN.moneyT(price(r)) + '">' + (s.st === "own" ? esc(KN.initials(KN.member(s.who))) : s.st === "free" ? c : s.st === "hold" ? "…" : ic("check")) + "</button>"; }
        html += '<span class="rn">' + KN.moneyT(price(r)) + "</span></div>" + (r === 5 ? '<div class="bimah">' + T("בימה", "Bimah") + "</div>" : "");
      }
      return '<div class="page"><div class="page-head"><div><span class="eyebrow">' + T("מקומות ישיבה", "Seating") + "</span><h1>" + T("מפת המקומות · ימים נוראים", "The seat map · High Holidays") + '</h1><p class="lede">' + T("מקומות קבועים, מכירה לימים הנוראים וחיוב אוטומטי. לחצו על מקום כדי למכור, לשריין או לשחרר אותו.", "Permanent seats, High Holiday sales and automatic billing. Click a seat to sell, hold or release it.") + '</p></div><button class="btn gold" data-act="seatFind">' + ic("spark") + T("למצוא 4 מקומות צמודים", "Find 4 seats together") + '</button></div><div class="kpis"><div class="kpi"><div class="v" data-count="' + st.occ + '">0</div><div class="k">' + T("אחוז תפוסה", "Occupancy %") + '</div><div class="d">' + (st.tot - st.n.free) + "/" + st.tot + '</div></div><div class="kpi"><div class="v" data-count="' + st.n.free + '">0</div><div class="k">' + T("מקומות פנויים", "Seats available") + '</div><div class="d">' + T("למכירה עכשיו", "On sale now") + '</div></div><div class="kpi"><div class="v" data-count="' + st.rev + '" data-pre="$">$0</div><div class="k">' + T("נמכר לימים הנוראים", "Sold for the High Holidays") + '</div><div class="d">' + st.n.sold + " " + T("מקומות", "seats") + '</div></div><div class="kpi"><div class="v" data-count="' + st.pend + '" data-pre="$">$0</div><div class="k">' + T("שמורים, ממתינים לתשלום", "Held, awaiting payment") + '</div><div class="d" style="color:var(--warn)">' + st.n.hold + " " + T("מקומות", "seats") + '</div></div></div><div class="card seatcard" style="margin-top:20px"><div class="card-h"><div class="legend"><span><i class="seat st-own"></i>' + T("מקום קבוע", "Permanent") + '</span><span><i class="seat st-sold"></i>' + T("נמכר", "Sold") + '</span><span><i class="seat st-hold"></i>' + T("שמור", "On hold") + '</span><span><i class="seat st-free"></i>' + T("פנוי", "Available") + '</span></div><div class="seg" role="group">' + [["all", T("הכול", "All")], ["free", T("פנויים בלבד", "Available only")]].map(function (f) { return '<button data-act="seatF" data-f="' + f[0] + '" aria-pressed="' + (seatF === f[0]) + '">' + f[1] + "</button>"; }).join("") + '</div></div><div class="seatmap f-' + seatF + '" id="seatmap"><div class="aron">' + T("ארון הקודש", "Aron Kodesh") + "</div>" + html + '</div><div id="seatBar"></div><p class="small muted center" style="margin-top:12px">' + T("מספר = מקום פנוי, ראשי תיבות = מקום קבוע של מתפלל, ✓ = נמכר. המחיר לפי השורה (נתוני דמו).", "A number = a free seat, initials = a member's permanent seat, ✓ = sold. Price is by row (demo data).") + "</p></div>" + KN.foot() + "</div>";
    },
    after: function (root) {
      var map = document.getElementById("seatmap");
      function fam(ev, on) { var b = ev.target.closest(".seat"); if (!b || !b.dataset.w) return; map.querySelectorAll('.seat[data-w="' + b.dataset.w.replace(/"/g, '\\"') + '"]').forEach(function (x) { x.classList.toggle("fam", on); }); }
      map.addEventListener("mouseover", function (e) { fam(e, true); }); map.addEventListener("mouseout", function (e) { fam(e, false); });
    }
  };
  KN.act.seatF = function (el) { seatF = el.dataset.f; KN.render(); };
  KN.act.seatFind = function () {
    var m = seats(); document.querySelectorAll(".seat.found").forEach(function (x) { x.classList.remove("found"); });
    for (var r = 1; r <= ROWS; r++) for (var c = 1; c <= COLS - 3; c++) { if (c <= HALF && c + 3 > HALF) continue; var ok = true; for (var j = 0; j < 4; j++) if (m[r + "-" + (c + j)].st !== "free") ok = false; if (ok) { for (j = 0; j < 4; j++) document.querySelector('.seat[data-k="' + r + "-" + (c + j) + '"]').classList.add("found"); document.querySelector(".seat.found").scrollIntoView({ block: "center", behavior: "smooth" }); document.getElementById("seatBar").innerHTML = '<div class="seatbar"><div><b>' + T("4 מקומות צמודים · שורה ", "4 seats together · row ") + r + "</b><span>" + T("סך הכול ", "Total ") + KN.moneyT(price(r) * 4) + '</span></div><select class="input" id="seatAllM" aria-label="' + T("מתפלל", "Member") + '">' + S.members.map(function (mb) { return '<option value="' + mb.id + '">' + esc(L(mb.name)) + "</option>"; }).join("") + '</select><button class="btn gold" data-act="seatSellAll" data-r="' + r + '" data-c="' + c + '">' + ic("check") + T("למכור את ארבעתם ולחייב", "Sell all four and charge") + "</button></div>"; KN.toast(T("נמצאו 4 מקומות צמודים בשורה " + r + " · " + KN.moneyT(price(r) * 4), "Found 4 seats together in row " + r + " · " + KN.moneyT(price(r) * 4))); return; } }
    KN.toast(T("אין כרגע 4 מקומות צמודים פנויים", "No 4 adjacent seats are free right now"));
  };
  KN.act.seatOpen = function (el) {
    var k = el.dataset.k, s = seats()[k], r = +k.split("-")[0], c = +k.split("-")[1], pr = price(r), h = holder(s), stN = { own: T("מקום קבוע", "Permanent seat"), sold: T("נמכר לימים הנוראים", "Sold for the High Holidays"), hold: T("שמור, ממתין לתשלום", "On hold, awaiting payment"), free: T("פנוי", "Available") }[s.st];
    var body = '<div class="seat-big st-' + s.st + '"><b>' + r + "·" + c + "</b><span>" + T("שורה ", "Row ") + r + T(", מקום ", ", seat ") + c + '</span></div><div class="receipt"><div><span>' + T("מצב", "Status") + "</span><b>" + stN + "</b></div>" + (h ? "<div><span>" + T("על שם", "Held by") + "</span><b>" + esc(h) + "</b></div>" : "") + "<div><span>" + T("מחיר לימים הנוראים", "High Holiday price") + "</span><b>" + KN.money(pr) + "</b></div></div>";
    if (s.st === "free" || s.st === "hold") body += '<div class="field"><label for="seatM">' + T("למכור למתפלל", "Sell to a member") + '</label><select class="input" id="seatM">' + S.members.map(function (m) { return '<option value="' + m.id + '">' + esc(L(m.name)) + "</option>"; }).join("") + '</select></div><button class="btn gold block" data-act="seatSell" data-k="' + k + '">' + ic("check") + T("למכור ולחייב ", "Sell and charge ") + KN.moneyT(pr) + "</button>" + (s.st === "free" ? '<button class="btn sec block" data-act="seatHold" data-k="' + k + '">' + T("לשריין בלי חיוב", "Hold without charging") + "</button>" : "");
    if (s.st === "sold" || s.st === "hold") body += '<button class="btn danger block" data-act="seatFree" data-k="' + k + '">' + T("לשחרר את המקום", "Release the seat") + "</button>";
    if (s.st === "own") body += '<p class="note">' + T("מקום קבוע של חבר הקהילה. כלול בדמי החבר השנתיים.", "A member's permanent seat. Included in the annual membership.") + '</p><button class="btn sec block" data-act="proGo" data-to="finance/m/' + s.who + '" data-need="finance">' + T("לחשבון המתפלל", "Open the member's account") + "</button>";
    KN.panel(T("מקום ", "Seat ") + r + "·" + c, body);
  };
  function seatDone(k, msg) { S.newIds[k] = 1; KN.save(); KN.closePanel(); KN.render(); KN.toast(msg); }
  KN.act.seatSell = function (el) { var k = el.dataset.k, m = KN.member(document.getElementById("seatM").value), r = +k.split("-")[0], c = k.split("-")[1]; seats()[k] = { st: "sold", who: m.id }; KN.addEntry(m, "charge", price(r), B("מקום לימים הנוראים · שורה " + r + " מקום " + c, "High Holiday seat · row " + r + " seat " + c)); seatDone(k, T("נמכר ל", "Sold to ") + esc(L(m.name)) + " · " + T("חיוב של ", "charged ") + KN.moneyT(price(r))); };
  KN.act.seatSellAll = function (el) { var r = +el.dataset.r, c = +el.dataset.c, m = KN.member(document.getElementById("seatAllM").value); for (var j = 0; j < 4; j++) { seats()[r + "-" + (c + j)] = { st: "sold", who: m.id }; S.newIds[r + "-" + (c + j)] = 1; } KN.addEntry(m, "charge", price(r) * 4, B("4 מקומות לימים הנוראים · שורה " + r, "4 High Holiday seats · row " + r)); KN.save(); KN.render(); KN.toast(T("4 מקומות נמכרו ל", "4 seats sold to ") + esc(L(m.name)) + " · " + T("חיוב של ", "charged ") + KN.moneyT(price(r) * 4)); };
  KN.act.seatHold = function (el) { var k = el.dataset.k, m = KN.member(document.getElementById("seatM").value); seats()[k] = { st: "hold", who: m.id }; seatDone(k, T("שוריין עבור ", "Held for ") + esc(L(m.name))); };
  KN.act.seatFree = function (el) { var k = el.dataset.k; seats()[k] = { st: "free" }; seatDone(k, T("המקום שוחרר וחזר למכירה", "The seat was released and is on sale again")); };

  /* ================= quick search (Ctrl+K) ================= */
  var ck = { items: [], idx: 0 };
  function ckItems() {
    var it = [];
    KN.NAV.forEach(function (n) { it.push({ g: T("מסכים", "Screens"), ic: n[3], t: T(n[1], n[2]), k: n[1] + " " + n[2], run: function () { if (n[4] && !KN.can(n[4])) { S.role = { member: "member", finance: "finance", content: "content", staff: "admin" }[n[4]] || "admin"; KN.save(); KN.renderBar(); } KN.go(n[0]); } }); });
    KN.MODS.forEach(function (m) { it.push({ g: T("מודולים", "Modules"), ic: m.ic, t: T(m.he, m.en), s: T(m.dHe, m.dEn), k: m.he + " " + m.en + " " + m.dHe + " " + m.dEn, run: function () { staffGo(m.id, m.need || "none"); } }); });
    S.members.forEach(function (m) { var b = KN.balance(m); it.push({ g: T("מתפללים", "Members"), ic: "user", t: L(m.name), s: m.phone + (b > 0 ? " · " + T("יתרה ", "balance ") + KN.moneyT(b) : ""), k: m.name.he + " " + m.name.en + " " + m.phone + " " + m.email, run: function () { staffGo("finance/m/" + m.id, "finance"); } }); });
    [["spark", "שיבוץ עליות אוטומטי", "Auto-assign aliyot", function () { staffGo("aliyot"); setTimeout(KN.act.alAuto, 500); }], ["send", "שליחת תזכורות תשלום", "Send payment reminders", function () { staffGo("hq"); setTimeout(KN.act.remind, 400); }], ["seat", "למצוא 4 מקומות צמודים", "Find 4 seats together", function () { staffGo("seats"); setTimeout(KN.act.seatFind, 600); }], ["play", "סיור מודרך", "Take the guided tour", function () { KN.act.tourStart(); }], ["users", "ייבוא חברים מקובץ", "Import members from a file", function () { staffGo("import"); }], ["palette", "התאמה אישית: שם, לוגו וצבעים", "Customize: name, logo, colors", function () { KN.act.customize(); }], ["flame", "המסך: 12 שניות לפני הדלקת נרות", "The screen: 12 seconds before candle lighting", function () { KN.setClock("friSoon", true); KN.go("tv"); }], ["globe", "English / עברית", "Switch language · עברית / English", function () { KN.act.lang({ dataset: { l: S.lang === "he" ? "en" : "he" } }); }], ["phone", "לדבר איתנו", "Talk to us", function () { KN.act.talk(); }]].forEach(function (a) { it.push({ g: T("פעולות", "Actions"), ic: a[0], t: T(a[1], a[2]), k: a[1] + " " + a[2], run: a[3] }); });
    KN.ROLES.forEach(function (r) { it.push({ g: T("להציג כ", "View as"), ic: "key", t: T(r.he, r.en), k: r.he + " " + r.en + " role תפקיד", run: function () { KN.setRole(r.id); } }); });
    return it;
  }
  function ckPaint() {
    var q = document.getElementById("ckQ").value.trim().toLowerCase(), list = ckItems().filter(function (i) { return !q || i.k.toLowerCase().indexOf(q) >= 0; }).slice(0, q ? 12 : 30), g = "";
    ck.items = list; ck.idx = Math.min(ck.idx, Math.max(0, list.length - 1));
    document.getElementById("ckL").innerHTML = list.length ? list.map(function (i, n) { var h = (i.g !== g ? '<div class="ck-g">' + (g = i.g) + "</div>" : "") + '<button class="ck-i' + (n === ck.idx ? " on" : "") + '" data-act="ckRun" data-n="' + n + '">' + ic(i.ic) + "<span><b>" + esc(i.t) + "</b>" + (i.s ? "<small>" + esc(i.s) + "</small>" : "") + "</span><kbd>↵</kbd></button>"; return h; }).join("") : '<p class="muted center" style="padding:26px">' + T("לא נמצא. נסו שם של מתפלל או של מסך.", "Nothing found. Try a member's name or a screen.") + "</p>";
    var on = document.querySelector(".ck-i.on"); if (on) on.scrollIntoView({ block: "nearest" });
  }
  KN.act.cmdk = function () {
    if (document.getElementById("cmdk")) { ckClose(); return; }
    KN.closeModal(); KN.closePanel();
    var o = document.createElement("div"); o.className = "cmdk"; o.id = "cmdk"; o.innerHTML = '<div class="ck" role="dialog" aria-label="' + T("חיפוש מהיר", "Quick search") + '"><div class="ck-q">' + ic("search") + '<input id="ckQ" autocomplete="off" placeholder="' + T("חפשו מתפלל, מסך או פעולה…", "Search a member, a screen or an action…") + '"><kbd>Esc</kbd></div><div class="ck-l" id="ckL"></div><div class="ck-f"><span><kbd>↑</kbd><kbd>↓</kbd> ' + T("ניווט", "navigate") + "</span><span><kbd>↵</kbd> " + T("בחירה", "select") + "</span><span>" + T("חיפוש בכל המערכת", "Search the whole system") + "</span></div></div>";
    o.addEventListener("mousedown", function (e) { if (e.target === o) ckClose(); }); document.body.appendChild(o);
    ck.idx = 0; var q = document.getElementById("ckQ"); q.addEventListener("input", function () { ck.idx = 0; ckPaint(); }); ckPaint(); q.focus();
  };
  function ckClose() { var o = document.getElementById("cmdk"); if (o) o.remove(); }
  KN.act.ckRun = function (el) { var i = ck.items[+el.dataset.n]; ckClose(); if (i) i.run(); };
  document.addEventListener("keydown", function (ev) {
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === "k" || ev.key === "K" || ev.key === "ל")) { ev.preventDefault(); KN.act.cmdk(); return; }
    if (!document.getElementById("cmdk")) return;
    if (ev.key === "Escape") ckClose(); else if (ev.key === "ArrowDown") { ev.preventDefault(); ck.idx = Math.min(ck.items.length - 1, ck.idx + 1); ckPaint(); } else if (ev.key === "ArrowUp") { ev.preventDefault(); ck.idx = Math.max(0, ck.idx - 1); ckPaint(); } else if (ev.key === "Enter") { ev.preventDefault(); var i = ck.items[ck.idx]; ckClose(); if (i) i.run(); }
  });
  window.addEventListener("hashchange", ckClose);
  var bar0 = KN.renderBar;
  KN.renderBar = function () { bar0(); var t = document.querySelector(".bar-tools"); if (t && !t.querySelector(".ck-b")) t.insertAdjacentHTML("afterbegin", '<button class="tb ck-b" data-act="cmdk" aria-label="' + T("חיפוש מהיר", "Quick search") + '">' + ic("search") + '<span class="w">' + T("חיפוש", "Search") + "</span><kbd>Ctrl K</kbd></button>"); };

  /* ================= the landing page's management section ================= */
  KN.proSection = function () {
    var m = seats(), mini = "";
    for (var r = 1; r <= 5; r++) { mini += "<div>"; for (var c = 1; c <= COLS; c++) mini += (c === HALF + 1 ? "<u></u>" : "") + '<i class="st-' + m[r + "-" + c].st + '"></i>'; mini += "</div>"; }
    var al = [["כהן", "Kohen", "m2", "kohen"], ["שלישי", "Third", "m1", "yz"], ["רביעי", "Fourth", "m4", "yz"], ["מפטיר", "Maftir", "m3", "bm"]].filter(function (a) { return KN.member(a[2]); });
    return '<section class="sx"><div class="prob" data-rv><div class="sx-h"><span class="eyebrow">' + T("מרכז הפיקוד", "The command center") + "</span><h2>" + T("מערכת ש<em>חושבת קדימה</em> בשביל הגבאי", "A system that <em>thinks ahead</em> for the gabbai") + "</h2><p>" + T("לא עוד רשימות. המערכת מזהה מה דורש טיפול, מציעה את הפעולה, ואתם רק מאשרים.", "No more lists. The system spots what needs attention, proposes the action, and you just approve.") + '</p></div><div class="prob-g"><button class="pc pc-a" data-act="proGo" data-to="hq"><div class="asst">' + asstHtml(true) + '</div><span class="go">' + T("להיכנס למרכז הפיקוד", "Enter the command center") + ic("arrow") + '</span></button><div class="stack"><button class="pc" data-act="proGo" data-to="aliyot"><span class="bt-h"><span class="qi">' + ic("scroll") + "</span><b>" + T("לוח עליות עם שיבוץ אוטומטי", "An aliyot board that assigns itself") + '</b></span><span class="mini">' + al.map(function (a) { return '<span class="r"><span><b>' + T(a[0], a[1]) + "</b> · " + esc(L(KN.member(a[2]).name)) + '</span><em class="chip gold">' + L(WHY[a[3]]) + "</em></span>"; }).join("") + '</span><span class="go">' + T("יארצייט, בר מצווה, תור. ובמוצ״ש: נדרים", "Yahrzeit, Bar Mitzvah, rotation. Then: nedarim") + ic("arrow") + '</span></button><button class="pc" data-act="proGo" data-to="seats"><span class="bt-h"><span class="qi">' + ic("seat") + "</span><b>" + T("מפת מקומות לימים הנוראים", "A seat map for the High Holidays") + '</b></span><span class="miniseats">' + mini + '</span><span class="go">' + T("מוכרים מקום בלחיצה, החיוב נרשם לבד", "Sell a seat with one click; the charge records itself") + ic("arrow") + "</span></button></div></div></div></section>";
  };
})();
