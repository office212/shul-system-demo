/* Kehillat Noam | giving tools (#/giving, tabs) and the entrance kiosk (#/kiosk).
   - A matching campaign with ambassadors; its thermometer also runs on the TV.
   - The kiosk: a demo donation in three taps, then the donor sees his dedication on
     the screen and a preview of his receipt.
   - An embeddable donation widget (a copy-paste snippet with a preview).
   - Israel: Bit as a payment method with the amount in shekels, Section 46 receipts
     behind a per-shul switch (the wording NEVER prints while the switch is off), and a
     Nedarim Plus sync screen with a log.
   - Accounting: CSV export of the ledger and a "QuickBooks connected" switch.
   Every figure is demo data; nothing is charged and nothing leaves the browser. */
(function () {
  "use strict";
  var KN = window.KN, D = window.KN_DATA, S = KN.S, T = KN.T, L = KN.L, esc = KN.esc, ic = KN.ic, B = D.B, RATE = 3.7;
  function G() { if (!S.give) S.give = { match: { on: false, pool: 10000, used: 0, aon: false, got: {} }, il: { bit: true, s46: false, org: "58-000-000-0", seq: 0 }, np: { on: false, id: "", log: [] }, qb: false, feed: [] }; return S.give; }
  KN.mod({ id: "giving", ic: "heart", he: "כלי תרומה", en: "Giving tools", dHe: "קמפיין מאצ׳ינג עם שגרירים, וידג׳ט להטמעה, Bit, סעיף 46 וייצוא לחשבונאות.", dEn: "A matching campaign with ambassadors, an embeddable widget, Bit, Section 46 and accounting export.", need: "staff" });
  KN.mod({ id: "kiosk", ic: "tv", he: "קיוסק בכניסה", en: "Entrance kiosk", dHe: "תרומה בשלוש לחיצות, וההקדשה עולה למסך מול התורם.", dEn: "A donation in three taps, and the dedication reaches the screen before the donor's eyes." });
  KN.shekel = function (usd) { return "₪" + Math.round(usd * RATE).toLocaleString("en-US"); };

  /* the campaign counts what the matchers add */
  var camp0 = KN.campaign;
  KN.campaign = function () { var c = camp0(), m = G().match; if (m.on && m.used) { c.raised += m.used; c.pct = Math.min(100, c.raised / c.goal * 100); } c.match = m.on ? m : null; return c; };

  /* ================= matching campaign ================= */
  var AMB = [["m1", 5000, 2150, "david"], ["m4", 4000, 1800, "avraham"], ["m7", 3000, 960, "yaakov"], ["m11", 2500, 1310, "chaim"]];
  function ambRows() { var g = G().match.got; return AMB.filter(function (a) { return KN.member(a[0]); }).map(function (a) { var r = a[2] + (g[a[0]] || 0); return { m: KN.member(a[0]), goal: a[1], raised: r, pct: Math.min(100, r / a[1] * 100), slug: a[3], id: a[0] }; }); }
  function matchHtml() {
    var g = G(), m = g.match, c = KN.campaign(), left = Math.max(0, m.pool - m.used);
    return '<div class="grid g2 gv"><div class="stack"><div class="card"><div class="card-h"><h2>' + T("קמפיין מאצ׳ינג", "A matching campaign") + '</h2><label class="switch"><input type="checkbox" data-on="gvMatch"' + (m.on ? " checked" : "") + "><i></i><span>" + (m.on ? T("פעיל", "On") : T("כבוי", "Off")) + '</span></label></div><p class="small muted">' + T("המכפילים שמים סכום בצד, וכל תרומה מוכפלת עד שהמאגר נגמר. כל התרומות נספרות באותו קמפיין: אין קרנות נפרדות.", "The matchers set an amount aside, and every gift is doubled until the pool runs out. All gifts count in the same campaign: there are no separate funds.") + '</p><div class="pool' + (m.on ? "" : " off") + '"><div><span>' + T("מאגר המכפילים", "The matching pool") + "</span><b>" + KN.moneyT(left) + "</b><em>" + T("נשאר מתוך ", "left of ") + KN.moneyT(m.pool) + '</em></div><div class="meter"><i style="width:' + (m.used / m.pool * 100).toFixed(1) + '%"></i></div></div><label class="check" style="margin-top:12px"><input type="checkbox" data-on="gvAon"' + (m.aon ? " checked" : "") + "><span><b>" + T("הכול או כלום", "All or nothing") + '</b><br><span class="small muted">' + T("אם הקמפיין לא מגיע ליעד עד הסיום, אף תורם לא מחויב.", "If the campaign misses its goal by the end, no donor is charged.") + '</span></span></label></div><div class="card"><h3>' + T("מתנת בדיקה", "A test gift") + '</h3><p class="small muted">' + T("בחרו שגריר וסכום, וראו את המאגר, את השגריר ואת המסך זזים.", "Pick an ambassador and an amount, and watch the pool, the ambassador and the screen move.") + '</p><div class="grid g2" style="margin-top:10px"><div class="field"><label for="gvAmb">' + T("דרך הקישור של", "Through the link of") + '</label><select class="input" id="gvAmb">' + ambRows().map(function (a) { return '<option value="' + a.id + '">' + esc(L(a.m.name)) + "</option>"; }).join("") + '</select></div><div class="field"><label for="gvAmt">' + T("סכום ($)", "Amount ($)") + '</label><input class="input num" id="gvAmt" inputmode="numeric" value="180"></div></div><button class="btn gold block" style="margin-top:12px" data-act="gvGift"' + (m.on ? "" : " disabled") + ">" + ic("heart") + T("לתרום (הדמיה)", "Give (simulated)") + '</button></div><div class="card"><div class="card-h"><h3>' + T("תורמים אחרונים", "Latest donors") + '</h3><span class="live"><i></i>' + T("חי", "LIVE") + '</span></div><div class="feed" id="gvFeed">' + (g.feed.length ? g.feed.slice(0, 5).map(function (f) { return '<div class="it"><span class="fi pay">' + ic("heart") + "</span><div><b>" + esc(L(f.t)) + '</b><div class="t">' + esc(L(f.s)) + "</div></div></div>"; }).join("") : '<p class="muted small">' + T("עוד אין מתנות בדיקה. נסו אחת.", "No test gifts yet. Try one.") + "</p>") + '</div></div></div><div class="stack"><div class="card camp"><div class="card-h"><h3>' + ic("target") + esc(c.name) + '</h3><span class="chip gold">' + T("נתוני דמו", "Demo data") + '</span></div><div id="gvCamp">' + KN.campHtml("gvThermo") + '</div></div><div class="card"><h3>' + T("השגרירים", "The ambassadors") + '</h3><p class="small muted">' + T("לכל שגריר יעד אישי וקישור אישי. תרומה דרך הקישור נרשמת על שמו אוטומטית.", "Each ambassador has a personal goal and a personal link. A gift through the link is credited to him automatically.") + '</p><div class="ambs">' + ambRows().map(function (a) { return '<div class="amb"><span class="avatar">' + esc(KN.initials(a.m)) + '</span><div><b>' + esc(L(a.m.name)) + '</b><bdi class="ltr small">kehillatnoam.demo/c/' + a.slug + "</bdi> <small>" + T("(קישור לדוגמה)", "(sample link)") + '</small><div class="meter"><i style="width:' + a.pct.toFixed(1) + '%"></i></div></div><span class="num"><b>' + KN.moneyT(a.raised) + "</b><small>" + T("מתוך ", "of ") + KN.moneyT(a.goal) + "</small></span></div>"; }).join("") + '</div></div><div><div class="tvframe"><div class="tvhost" id="gvTv"></div></div><p class="small muted center" style="margin-top:28px">' + T("מד הקמפיין רץ גם על המסך בבית הכנסת.", "The campaign meter also runs on the shul's screen.") + "</p></div></div></div>";
  }
  KN.on.gvMatch = function (el) { G().match.on = el.checked; KN.save(); KN.render(); KN.tvRefresh("campaign"); KN.toast(el.checked ? T("קמפיין המאצ׳ינג פעיל, והמד עלה למסך", "The matching campaign is on, and its meter is on the screen") : T("קמפיין המאצ׳ינג כבוי", "The matching campaign is off")); };
  KN.on.gvAon = function (el) { G().match.aon = el.checked; KN.save(); };
  KN.act.gvGift = function () {
    var g = G(), m = g.match, a = Math.max(1, Math.round(Number(document.getElementById("gvAmt").value) || 0)), id = document.getElementById("gvAmb").value, mb = KN.member(id), dbl = Math.min(a, Math.max(0, m.pool - m.used)), nm = B("תורם דרך " + mb.name.he, "A donor via " + mb.name.en);
    S.donations.unshift({ id: "G" + Date.now(), date: KN.todayIso(), amount: a, donor: nm, email: "donor@mail.demo", ref: KN.nextRef(), amb: id, fresh: true });
    m.used += dbl; m.got[id] = (m.got[id] || 0) + a + dbl;
    g.feed.unshift({ t: B(KN.moneyT(a) + (dbl ? " + " + KN.moneyT(dbl) + " מהמכפילים" : ""), KN.moneyT(a) + (dbl ? " + " + KN.moneyT(dbl) + " from the matchers" : "")), s: B("נזקף לשגריר " + mb.name.he, "Credited to ambassador " + mb.name.en) });
    KN.log("pay", B("מאצ׳ינג: " + KN.moneyT(a) + " הוכפל · שגריר " + mb.name.he, "Matching: " + KN.moneyT(a) + " doubled · ambassador " + mb.name.en)); KN.save(); KN.render(); KN.tvRefresh("campaign");
    KN.toast(dbl ? T("הוכפל: ", "Doubled: ") + KN.moneyT(a) + " + " + KN.moneyT(dbl) + T(" · נזקף ל", " · credited to ") + esc(L(mb.name)) : T("המאגר נגמר. התרומה נספרה בלי הכפלה.", "The pool is empty. The gift counted without a match."));
  };
  /* the campaign's slide on the TV */
  KN.tvExtraSlides = function (out) {
    var c = KN.campaign(); if (!c.match) return;
    out.unshift({ kind: "campaign", ids: [], html: "<h3>" + esc(c.name) + " · " + T("כל תרומה מוכפלת", "Every gift is doubled") + '</h3><div class="orn"></div><div class="tv-list"><div class="tv-camp"><b>' + KN.moneyT(c.raised) + "</b><span>" + T("מתוך ", "of ") + KN.moneyT(c.goal) + '</span><div class="tv-thermo"><i style="width:' + c.pct.toFixed(1) + '%"></i></div><em>' + Math.round(c.pct) + "% · " + c.donors + " " + T("תורמים", "donors") + " · " + c.days + " " + T("ימים נותרו", "days left") + " · " + T("במאגר המכפילים נשארו ", "the matchers still hold ") + KN.moneyT(Math.max(0, c.match.pool - c.match.used)) + "</em></div></div>" });
  };

  /* ================= embeddable widget ================= */
  var SNIP = '<iframe src="https://kehillatnoam.demo/donate?embed=1"\n        title="Donate" width="100%" height="520" style="border:0"></iframe>';
  function widgetHtml() {
    return '<div class="grid g2 gv"><div class="card"><h2>' + T("טופס התרומה, בכל אתר", "The donate form, on any website") + '</h2><p class="small muted">' + T("מעתיקים את הקטע הזה ומדביקים באתר של בית הכנסת, של הקמפיין או של אירוע. התרומות נוחתות באותו ספר.", "Copy this snippet and paste it into the shul's site, a campaign page or an event page. The gifts land in the same ledger.") + '</p><pre class="snip" dir="ltr" id="gvSnip">' + esc(SNIP) + '</pre><div class="row"><button class="btn" data-act="gvCopy">' + T("להעתיק את הקוד", "Copy the code") + '</button><span class="small muted">' + T("(כתובת לדוגמה)", "(sample address)") + '</span></div></div><div class="card"><h3>' + T("כך זה נראה באתר אחר", "How it looks on another site") + '</h3><div class="fakesite"><div class="fs-bar"><i></i><i></i><i></i><span dir="ltr">your-shul-website.demo/support</span></div><div class="fs-b"><h4>' + T("תמכו בקהילה", "Support the community") + '</h4><div class="embed"><b>' + esc(KN.shulName()) + '</b><div class="amts sm">' + [36, 72, 180, 360].map(function (a, i) { return '<button aria-pressed="' + (i === 2) + '" data-act="gvPrev">$' + a + "</button>"; }).join("") + '</div><button class="btn block" data-act="gvPrev">' + ic("lock") + T("לתרום ", "Donate ") + '$180</button><small>' + T("מאובטח · קבלה למס במייל", "Secure · tax receipt by email") + "</small></div></div></div></div></div>";
  }
  KN.act.gvCopy = function () { try { navigator.clipboard.writeText(SNIP); } catch (e) {} KN.toast(T("הקוד הועתק", "The code was copied")); };
  KN.act.gvPrev = function () { KN.toast(T("זו תצוגה מקדימה של הווידג׳ט. התרומה האמיתית בדף התרומה.", "This is a preview of the widget. The real flow is on the donate page.")); };

  /* ================= Israel ================= */
  function ilHtml() {
    var g = G(), il = g.il, np = g.np;
    return '<div class="grid g2 gv"><div class="stack"><div class="card"><div class="card-h"><h2><span class="bitlogo">bit</span> ' + T("תשלום ב־Bit", "Pay with Bit") + '</h2><label class="switch"><input type="checkbox" data-on="gvIl" data-k="bit"' + (il.bit ? " checked" : "") + "><i></i><span>" + (il.bit ? T("פעיל", "On") : T("כבוי", "Off")) + '</span></label></div><p class="small muted">' + T("Bit מופיע בדף התרומה ובתשלום של המתפלל, לצד כרטיס, Apple Pay ו־Google Pay, עם הסכום בשקלים. התשלום נרשם בספר עם אמצעי ״Bit״ והתורם מקבל קבלה.", "Bit appears on the donate page and in the member's payment, next to card, Apple Pay and Google Pay, with the amount in shekels. The payment is recorded as \"Bit\" and the donor gets a receipt.") + '</p><button class="btn sec" style="margin-top:10px" data-go="donate">' + T("לנסות בדף התרומה", "Try it on the donate page") + '</button></div><div class="card"><div class="card-h"><h2>' + T("קבלות סעיף 46", "Section 46 receipts") + '</h2><label class="switch"><input type="checkbox" data-on="gvIl" data-k="s46"' + (il.s46 ? " checked" : "") + "><i></i><span>" + (il.s46 ? T("למוסד יש אישור", "The shul is approved") : T("אין אישור", "Not approved")) + '</span></label></div><p class="small muted">' + T("כשהמתג דולק, הקבלה מדפיסה את שורת סעיף 46, את מספר הזהות של התורם ומספר מסדרה נפרדת. כשהוא כבוי, הנוסח לא מופיע בשום קבלה.", "With the switch on, the receipt prints the Section 46 line, the donor's ID number and a number from a separate series. With it off, the wording appears on no receipt.") + '</p><div class="field" style="margin-top:10px"><label for="gvOrg">' + T("מספר המוסד (לדוגמה)", "Institution number (sample)") + '</label><input class="input num" id="gvOrg" data-on="gvOrg" value="' + esc(il.org) + '"' + (il.s46 ? "" : " disabled") + '></div><button class="btn sec" style="margin-top:10px" data-act="gvRcpt">' + ic("mail") + T("לראות קבלה לדוגמה", "See a sample receipt") + '</button></div></div><div class="card"><div class="card-h"><h2>' + T("סנכרון נדרים פלוס", "Nedarim Plus sync") + '</h2><span class="chip ' + (np.on ? "ok" : "") + '">' + (np.on ? T("מחובר (הדמיה)", "Connected (simulated)") : T("לא מחובר", "Not connected")) + '</span></div><p class="small muted">' + T("הגבאי מזין פעם אחת את פרטי המוסד, ומאז התרומות שנכנסות בנדרים פלוס מופיעות בספר ובכרטיסי המתפללים. בלי הקלדה כפולה.", "The gabbai enters the institution's details once, and from then on gifts that arrive through Nedarim Plus show in the ledger and on the members' cards. No double typing.") + '</p><div class="grid g2" style="margin-top:10px"><div class="field"><label for="npId">' + T("מספר מוסד", "Institution ID") + '</label><input class="input num" id="npId" value="' + esc(np.id || "7001234") + '"></div><div class="field"><label for="npKey">' + T("סיסמת API", "API password") + '</label><input class="input" id="npKey" type="password" value="demo-demo" autocomplete="off"></div></div><div class="row" style="margin-top:12px"><button class="btn" data-act="npGo">' + ic("refresh") + (np.on ? T("לסנכרן עכשיו", "Sync now") : T("לחבר ולסנכרן", "Connect and sync")) + '</button><span class="small muted">' + T("הדמיה: שום דבר לא נשלח לנדרים פלוס.", "Simulation: nothing is sent to Nedarim Plus.") + '</span></div><h3 style="margin-top:16px">' + T("יומן הסנכרון", "Sync log") + "</h3>" + (np.log.length ? '<div class="tw"><table class="t"><tr><th>' + T("מתי", "When") + "</th><th>" + T("רשומות", "Records") + "</th><th>" + T("סכום", "Amount") + "</th></tr>" + np.log.map(function (l) { return "<tr><td>" + esc(l.when) + '</td><td class="num">' + l.n + '</td><td class="num">' + KN.moneyT(l.sum) + "</td></tr>"; }).join("") + "</table></div>" : '<p class="muted small">' + T("עוד לא בוצע סנכרון.", "No sync has run yet.") + "</p>") + "</div></div>";
  }
  KN.on.gvIl = function (el) { G().il[el.dataset.k] = el.checked; KN.save(); KN.render(); };
  KN.on.gvOrg = function (el) { G().il.org = el.value.trim(); KN.save(); };
  KN.act.gvRcpt = function () { KN.act.receiptMail({ dataset: { id: (S.donations[0] || {}).id } }); };
  var NP = [[B("משפחת אוחנה", "The Ohana family"), 360], [B("יעל ונדב שטרן", "Yael & Nadav Stern"), 180], [B("תורם דרך נדרים פלוס", "A donor via Nedarim Plus"), 100]];
  KN.act.npGo = function () {
    var np = G().np, d = KN.now(), sum = 0; np.on = true; np.id = document.getElementById("npId").value.trim();
    NP.forEach(function (x, i) { sum += x[1]; S.donations.unshift({ id: "G" + (Date.now() + i), date: KN.todayIso(), amount: x[1], donor: x[0], email: "donor@mail.demo", ref: KN.nextRef(), method: "nedarim", fresh: true }); });
    np.log.unshift({ when: KN.date(KN.todayIso()) + " · " + KN.time(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0")), n: NP.length, sum: sum });
    KN.log("pay", B("סנכרון נדרים פלוס: " + NP.length + " תרומות · " + KN.moneyT(sum), "Nedarim Plus sync: " + NP.length + " gifts · " + KN.moneyT(sum))); KN.save(); KN.render();
    KN.toast(T("סונכרנו " + NP.length + " תרומות לספר", NP.length + " gifts synced into the ledger"));
  };
  /* Section 46: the block exists only while the shul's switch is on */
  function ref46(r) { var il = G().il; if (!r.ref46) { il.seq = (il.seq || 0) + 1; r.ref46 = "46-2026-" + String(il.seq).padStart(5, "0"); KN.save(); } return r.ref46; }
  KN.s46Html = function (r) {
    var il = G().il; if (!il.s46 || !r) return "";
    return '<div class="s46"><b>' + T("קבלה לפי סעיף 46", "Section 46 receipt") + " · " + ref46(r) + "</b><br>" + T("למוסד אישור לעניין תרומות לפי סעיף 46 לפקודת מס הכנסה. מספר המוסד: ", "The institution is approved for donations under Section 46 of the Income Tax Ordinance. Institution number: ") + esc(il.org) + "<br>" + T("מספר זהות התורם: ", "Donor's ID number: ") + esc(r.tz || T("לא נמסר", "not provided")) + " · " + T("סכום בשקלים: ", "Amount in shekels: ") + KN.shekel(r.amount) + T(" (שער לדוגמה)", " (sample rate)") + "</div>";
  };
  var donate0 = KN.donate;
  KN.donate = function (o) { var tz = (document.getElementById("dnTz") || {}).value, r = donate0(o); if (G().il.s46) { r.tz = (tz || "").trim(); ref46(r); } return r; };

  /* the donate page: Bit, the shekel line, the ID field, the "ready for Israel" badge */
  var dv = KN.views.donate, dr = dv.render;
  dv.render = function () {
    var h = dr.apply(dv, arguments), il = G().il; if (h.indexOf('class="wallets"') < 0) return h;
    if (il.bit) h = h.replace('</bdi></button></div><div class="or">', '</bdi></button><button class="wallet bit" data-act="dnPay" data-w="Bit"><span class="bitlogo">bit</span><small id="dnIls"></small></button></div><div class="or">');
    if (il.s46) h = h.replace('<div class="cardgrid">', '<div class="field"><label for="dnTz">' + T("מספר זהות (לקבלת סעיף 46)", "ID number (for the Section 46 receipt)") + '</label><input class="input num" id="dnTz" inputmode="numeric" autocomplete="off"></div><div class="cardgrid">');
    return h.replace('</p></div></div><div class="split">', '</p><div class="ilb"><span class="bitlogo">bit</span><span>₪</span><span>' + (il.s46 ? T("קבלות סעיף 46", "Section 46 receipts") : T("קבלה למס במייל", "Tax receipt by email")) + "</span><em>" + T("מוכן לישראל", "Ready for Israel") + '</em></div></div></div><div class="split">');
  };
  function ils() { var e = document.getElementById("dnIls"), t = document.getElementById("dnGoT"); if (e && t) { var m = /[\d,.]+/.exec(t.textContent.replace(/,/g, "")); e.textContent = m ? KN.shekel(Number(m[0])) : ""; } }
  var da = dv.after; dv.after = function () { if (da) da.apply(dv, arguments); ils(); };
  document.addEventListener("click", function () { setTimeout(ils, 30); }); document.addEventListener("input", function () { setTimeout(ils, 30); });

  /* ================= accounting ================= */
  function accHtml() {
    var g = G();
    return '<div class="grid g2 gv"><div class="card"><div class="card-h"><h2>' + T("סנכרון חשבונאות", "Accounting sync") + '</h2><label class="switch"><input type="checkbox" data-on="gvQb"' + (g.qb ? " checked" : "") + "><i></i><span>" + (g.qb ? T("QuickBooks מחובר (הדמיה)", "QuickBooks connected (simulated)") : T("לא מחובר", "Not connected")) + '</span></label></div><p class="small muted">' + T("כל חיוב, תשלום ותרומה עוברים לתוכנת הנהלת החשבונות לפי סוג. בהדמיה המתג רק מוצג: שום נתון לא נשלח.", "Every charge, payment and donation moves to the accounting software by type. In the demo the switch is only shown: no data is sent.") + '</p></div><div class="card"><h2>' + T("ייצוא CSV", "CSV export") + '</h2><p class="small muted">' + T("תאריך, משק בית, סכום וסוג. נפתח באקסל ובכל תוכנת הנהלת חשבונות.", "Date, household, amount and type. Opens in Excel and in any accounting software.") + '</p><div class="row" style="margin-top:12px"><button class="btn" data-act="gvCsv" data-k="ledger">' + T("ספר התנועות (CSV)", "The ledger (CSV)") + '</button><button class="btn sec" data-act="gvCsv" data-k="month">' + T("סיכום חודשי (CSV)", "Monthly summary (CSV)") + "</button></div></div></div>";
  }
  KN.on.gvQb = function (el) { G().qb = el.checked; KN.save(); KN.render(); };
  KN.act.gvCsv = function (el) {
    var rows, q = function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; };
    if (el.dataset.k === "month") rows = [["month", "collected"]].concat(KN.monthSeries().map(function (m) { return [m[0].en, m[1]]; }));
    else { rows = [["date", "household", "amount", "type", "description"]]; S.members.forEach(function (m) { m.ledger.forEach(function (e) { rows.push([e.date, m.name.en, e.amount, e.type, e.desc.en]); }); }); S.donations.forEach(function (d) { rows.push([d.date, d.donor.en, d.amount, "donation", d.ref]); }); }
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + rows.map(function (r) { return r.map(q).join(","); }).join("\r\n")], { type: "text/csv;charset=utf-8" })); a.download = el.dataset.k === "month" ? "monthly-summary.csv" : "ledger.csv"; document.body.appendChild(a); a.click(); a.remove();
    KN.toast(T("הקובץ ירד · ", "File downloaded · ") + (rows.length - 1) + " " + T("שורות", "rows"));
  };

  /* ================= the page ================= */
  var TABS = [["", "קמפיין מאצ׳ינג", "Matching campaign", "target", matchHtml], ["widget", "וידג׳ט להטמעה", "Embeddable widget", "globe", widgetHtml], ["israel", "ישראל: Bit וסעיף 46", "Israel: Bit & Section 46", "coins", ilHtml], ["accounting", "חשבונאות", "Accounting", "book", accHtml]];
  KN.views.giving = { need: "staff",
    render: function (arg) {
      var t = TABS.filter(function (x) { return x[0] === arg; })[0] || TABS[0];
      return '<div class="page wide"><div class="page-head"><div><span class="eyebrow">' + T("כלי תרומה", "Giving tools") + "</span><h1>" + T(t[1], t[2]) + '</h1></div><div class="row"><button class="btn gold" data-go="kiosk">' + ic("tv") + T("לפתוח את הקיוסק", "Open the kiosk") + '</button><span class="chip gold">' + T("נתוני דמו", "Demo data") + '</span></div></div><div class="tabs" role="tablist">' + TABS.map(function (x) { return '<button role="tab" data-go="giving' + (x[0] ? "/" + x[0] : "") + '" aria-selected="' + (x === t) + '">' + ic(x[3]) + T(x[1], x[2]) + "</button>"; }).join("") + "</div>" + t[4]() + KN.foot() + "</div>";
    },
    after: function (root, arg) { if (!arg) { KN.tvMount(document.getElementById("gvTv"), { focus: "campaign" }); setTimeout(function () { KN.campFill("gvThermo"); }, 150); } }
  };

  /* ================= the kiosk ================= */
  var kz = { step: 1, amt: 0, rec: null, ded: null };
  function kReset() { kz = { step: 1, amt: 0, rec: null, ded: null }; }
  KN.views.kiosk = {
    render: function () {
      var head = '<div class="kz-h"><span class="logo">' + KN.logo() + "</span><b>" + esc(KN.shulName()) + '</b><span class="demo-badge">' + T("קיוסק · הדגמה", "KIOSK · DEMO") + '</span><button class="btn sm ghost" data-go="tv">' + T("חזרה למסך", "Back to the screen") + "</button></div>", body;
      if (KN.isShabbat()) body = '<div class="kz-c"><h1>' + T("שבת שלום", "Shabbat Shalom") + "</h1><p>" + T("הקיוסק סגור בשבת ונפתח מעצמו בצאת השבת.", "The kiosk is closed on Shabbat and opens by itself when Shabbat ends.") + "</p></div>";
      else if (kz.step === 1) body = '<div class="kz-c"><h1>' + T("תרומה לבית הכנסת", "Donate to the shul") + "</h1><p>" + T("בחרו סכום", "Choose an amount") + '</p><div class="kz-a">' + [18, 36, 72, 180, 360].map(function (a) { return '<button data-act="kzAmt" data-a="' + a + '">$' + a + "<small>" + KN.shekel(a) + "</small></button>"; }).join("") + '</div><div class="kz-s"><i class="on"></i><i></i><i></i></div></div>';
      else if (kz.step === 2) body = '<div class="kz-c"><h1>$' + kz.amt + "</h1><p>" + T("איך לשלם?", "How would you like to pay?") + '</p><div class="kz-m"><button data-act="kzPay" data-w="' + T("כרטיס בהצמדה", "Tap card") + '">' + ic("coins") + T("הצמידו כרטיס", "Tap a card") + '</button><button data-act="kzPay" data-w="Bit"><span class="bitlogo">bit</span>' + KN.shekel(kz.amt) + '</button><button data-act="kzPay" data-w="' + T("QR לטלפון", "QR to phone") + '"><span class="kz-qr">' + KN.qr() + "</span>" + T("סרקו בטלפון", "Scan with your phone") + '</button></div><button class="btn sm ghost" data-act="kzBack">' + T("חזרה", "Back") + '</button><div class="kz-s"><i class="on"></i><i class="on"></i><i></i></div></div>';
      else body = '<div class="kz-c kz-done"><div class="okmark">' + ic("check") + "</div><h1>" + T("תודה רבה!", "Thank you!") + "</h1><p>" + T("התרומה התקבלה · ", "Donation received · ") + KN.moneyT(kz.amt) + " · " + kz.rec.ref + '</p><div class="kz-d">' + (kz.ded ? '<div class="kz-tv"><div class="tvframe"><div class="tvhost" id="kzTv"></div></div><p>' + T("ההקדשה שלכם על המסך בבית הכנסת, עכשיו.", "Your dedication is on the shul's screen, now.") + "</p></div>" : '<div class="kz-f"><h3>' + T("רוצים הקדשה על המסך?", "Want a dedication on the screen?") + '</h3><div class="seg" role="group">' + [["mem", T("לעילוי נשמת", "In memory of")], ["ref", T("לרפואת", "For the recovery of")], ["zch", T("לזכות", "In the merit of")]].map(function (k, i) { return '<button data-act="kzKind" data-k="' + k[0] + '" aria-pressed="' + (i === 0) + '">' + k[1] + "</button>"; }).join("") + '</div><input class="input" id="kzName" placeholder="' + T("שם, למשל: שרה בת רחל", "A name, e.g. Sarah bat Rachel") + '"><button class="btn gold block" data-act="kzDed">' + ic("tv") + T("להעלות למסך", "Put it on the screen") + "</button></div>") + '</div><div class="row" style="justify-content:center;margin-top:14px"><button class="btn sec" data-act="kzRcpt">' + ic("mail") + T("לראות את הקבלה", "See the receipt") + '</button><button class="btn ghost" data-act="kzNew">' + T("תרומה נוספת", "Another donation") + '</button></div><div class="kz-s"><i class="on"></i><i class="on"></i><i class="on"></i></div></div>';
      return '<div class="kz">' + head + body + "</div>";
    },
    after: function () { if (kz.step === 3 && kz.ded) KN.tvMount(document.getElementById("kzTv"), { focus: kz.ded }); }
  };
  KN.act.kzAmt = function (el) { kz.amt = +el.dataset.a; kz.step = 2; KN.render(); };
  KN.act.kzBack = function () { kz.step = 1; KN.render(); };
  KN.act.kzNew = function () { kReset(); KN.render(); };
  KN.act.kzPay = function (el) {
    var id = "G" + Date.now(), nm = B("תורם בקיוסק", "A kiosk donor");
    kz.rec = { id: id, date: KN.todayIso(), amount: kz.amt, fee: 0, total: kz.amt, donor: nm, email: "kiosk.donor@mail.demo", ref: KN.nextRef(), method: el.dataset.w, fresh: true };
    S.donations.unshift(kz.rec); S.lastDonation = kz.rec; if (G().il.s46) ref46(kz.rec);
    KN.log("pay", B("תרומה בקיוסק " + KN.moneyT(kz.amt) + " · " + el.dataset.w, "Kiosk donation " + KN.moneyT(kz.amt) + " · " + el.dataset.w)); KN.notify({ kind: "payment", title: B("תרומה חדשה מהקיוסק", "A new kiosk donation"), body: B(KN.moneyT(kz.amt) + " · " + kz.rec.ref, KN.moneyT(kz.amt) + " · " + kz.rec.ref), to: ["finance", "admin"] });
    kz.step = 3; KN.save(); KN.render(); if (KN.confetti) KN.confetti();
  };
  var kKind = "mem";
  KN.act.kzKind = function (el) { kKind = el.dataset.k; document.querySelectorAll(".kz-f .seg button").forEach(function (b) { b.setAttribute("aria-pressed", b === el); }); };
  KN.act.kzDed = function () {
    var n = document.getElementById("kzName").value.trim(); if (n.length < 2) { KN.toast(T("כתבו שם להקדשה", "Enter a name for the dedication")); return; }
    var K = { mem: B("לעילוי נשמת ", "In memory of "), ref: B("לרפואת ", "For the recovery of "), zch: B("לזכות ", "In the merit of ") }[kKind], id = "D" + Date.now();
    S.dedications.unshift({ id: id, text: B("התרומה היום מוקדשת " + K.he + n, "Today's donation is dedicated " + K.en.toLowerCase() + n), by: B("תורם מהקיוסק", "A kiosk donor") });
    S.tvNew = id; kz.ded = id; kKind = "mem"; KN.save(); KN.render(); KN.tvRefresh(id); KN.toast(T("ההקדשה עלתה למסך", "The dedication is on the screen"));
  };
  KN.act.kzRcpt = function () { KN.act.receiptMail({ dataset: { id: kz.rec.id } }); };
  /* a way in from the TV page */
  var tv = KN.views.tv, tr = tv.render;
  tv.render = function () { return tr.apply(tv, arguments).replace('<button class="btn sm sec" data-act="tvFull">', '<button class="btn sm gold" data-go="kiosk">' + ic("heart") + T("מצב קיוסק", "Kiosk mode") + '</button><button class="btn sm sec" data-act="tvFull">'); };
})();
