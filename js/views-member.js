/* Shul system sales demo | the congregant's own dashboard (#/me). */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, L = S.L, esc = S.esc, I = UI.I, B = UI.B;

  function balanceText(b) {
    if (b < 0) return '<span class="credit">' + L("זכות: ", "Credit: ") + S.money(-b) + "</span>";
    if (b === 0) return '<span class="credit">' + L("אין חוב ✓", "Nothing owed ✓") + "</span>";
    return '<span class="num">' + S.money(b) + "</span>";
  }
  var METHOD = { cash: ["מזומן", "Cash"], check: ["צ׳ק", "Check"], zelle: ["Zelle", "Zelle"], card: ["כרטיס", "Card"], transfer: ["העברה בנקאית", "Bank transfer"] };
  function method(m) { return m && METHOD[m] ? L(METHOD[m][0], METHOD[m][1]) : ""; }
  function statementHtml(mid) {
    var m = S.memberById(mid), rows = S.db.ledger.filter(function (e) { return e.mid === mid; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var run = 0;
    return '<div class="print-area" style="background:#fff;color:#1f1b14;padding:20px;border:1px solid #e2d7c2;border-radius:14px"><div class="row between"><div class="row">' + UI.logo().replace("<svg", '<svg width="40" height="40" style="color:#0e2c4c"') + '<div><b style="font-size:18px">' + esc(S.N(S.db.shul)) + '</b><div class="small" style="color:#6b5a3c">' + esc(S.db.shul.address) + '</div></div></div><div style="text-align:end"><b>' + L("דף חשבון", "Statement") + '</b><div class="small">' + esc(S.fmtDate(S.todayIso())) + "</div></div></div><hr class=\"gold-line\"><p><b>" + esc(S.N(m)) + "</b> · " + esc(m.email || "") + '</p><table style="font-size:13.5px"><thead><tr><th>' + L("תאריך", "Date") + "</th><th>" + L("תיאור", "Description") + "</th><th>" + L("חיוב", "Charge") + "</th><th>" + L("תשלום", "Payment") + "</th><th>" + L("יתרה", "Balance") + "</th></tr></thead><tbody>" +
      rows.map(function (e) { var c = e.type === "payment" ? -e.amount : e.amount; run += c; return "<tr><td class=\"nowrap\">" + esc(e.date) + "</td><td>" + esc(B(e.desc)) + (e.method ? " · " + method(e.method) : "") + '</td><td class="num">' + (e.type !== "payment" ? S.money(e.amount) : "") + '</td><td class="num">' + (e.type === "payment" ? S.money(e.amount) : "") + '</td><td class="num">' + S.money(run) + "</td></tr>"; }).join("") +
      '</tbody></table><p style="text-align:end;font-size:17px;margin-top:12px"><b>' + L("יתרה: ", "Balance: ") + "</b>" + balanceText(S.balance(mid)) + "</p></div>";
  }
  function hebFromGreg(isoStr, afterSunset) {
    var d = S.parseIso(isoStr); if (afterSunset) d.setDate(d.getDate() + 1);
    var parts = new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric" }).formatToParts(d);
    var day = +parts.filter(function (p) { return p.type === "day"; })[0].value;
    var mon = parts.filter(function (p) { return p.type === "month"; })[0].value;
    var yr = parts.filter(function (p) { return p.type === "year"; })[0].value;
    var map = { Tishri: 0, Tishrei: 0, Heshvan: 1, Cheshvan: 1, Kislev: 2, Tevet: 3, Shevat: 4, Adar: 5, "Adar I": 6, "Adar II": 7, Nisan: 8, Iyar: 9, Sivan: 10, Tamuz: 11, Tammuz: 11, Av: 12, Elul: 13 };
    return { day: day, month: map[mon] != null ? map[mon] : 0, year: yr };
  }
  function yzStatus(y) {
    if (y.status === "pending") return '<span class="badge warn">' + L("ממתין לאישור הגבאי", "Waiting for the gabbai") + "</span>";
    if (y.status === "declined") return '<span class="badge bad">' + L("לא אושר", "Not approved") + "</span>";
    var thisWeek = y.hmonth === 2 && y.hday >= 5 && y.hday <= 11;
    return thisWeek ? '<span class="badge ok">' + L("מוצג במסך השבוע", "On the screen this week") + "</span>" : '<span class="badge accent">' + L("יוצג במסך בשבוע שלו, כל שנה", "Shown on the screen in its week, every year") + "</span>";
  }

  /* The member's own card, as production shows it (congregant/index.html renderCong):
     balance, pay by card (recorded automatically), totals, the ledger with
     cancelled entries struck through, family yahrzeits and announcements. */
  function ledgerView(mid) {
    var voided = {}, rows = [], ch = 0, pay = 0;
    S.db.ledger.forEach(function (e) { if (e.mid === mid && e.voidOf) voided[e.voidOf] = true; });
    S.db.ledger.forEach(function (e) {
      if (e.mid !== mid || e.voidOf) return;
      rows.push(e);
      if (!voided[e.id]) { if (e.type === "payment") pay += S.cents(e.amount); else ch += S.cents(e.amount); }
    });
    rows.sort(function (x, y) { return x.date < y.date ? 1 : x.date > y.date ? -1 : 0; });
    return { rows: rows, voided: voided, charges: ch / 100, payments: pay / 100 };
  }
  /* A member paying their own balance by card from the member page: production records it
     automatically (ledger payment, method card) and the balance updates at once.
     Donations, which match no member page, still wait in the inbox for the gabbai. */
  function recordBalancePayment(mid, amount, ref, rec) {
    var m = S.memberById(mid);
    S.db.ledger.push({ id: "card-" + ref, mid: mid, date: S.todayIso(), type: "payment", amount: amount, desc: "תשלום בכרטיס Ref #" + ref + "|Card payment Ref #" + ref, method: "card", by: "נרשם אוטומטית|Recorded automatically", source: "card" });
    S.db.inbox.unshift(Object.assign({ id: S.uid("i"), ref: ref, name: m.en, email: m.email, amount: amount, type: "balance", date: S.todayIso(), note: "", last4: "4242", wallet: "" }, rec || {}, { memberId: mid, status: "recorded", auto: true }));
    S.log("finance", "תשלום בכרטיס נרשם אוטומטית: " + m.he + ", " + S.money(amount), "Card payment recorded automatically: " + m.en + ", " + S.money(amount));
    S.notify(mid, "התשלום שלך התקבל: " + S.money(amount) + ". תודה!", "Your payment was received: " + S.money(amount) + ". Thank you!");
  }
  function pendingFor(mid) { return S.db.inbox.filter(function (x) { return x.memberId === mid && x.status === "pending"; }); }
  function portalHtml(mid, opts) {
    opts = opts || {};
    var m = S.memberById(mid), b = S.balance(mid), lv = ledgerView(mid), pend = pendingFor(mid);
    var kind = b > 0 ? "owe" : b < 0 ? "credit" : "zero";
    var typeL = { charge: L("חיוב", "Charge"), payment: L("תשלום", "Payment"), correction: L("תיקון", "Correction") };
    var limit = opts.limit || 999;
    return '<section class="mp-card"><div class="mp-name">' + esc(S.N(m)) + '</div>' +
      '<div class="mp-balance bh-' + kind + '" data-flash="bal"><span class="mp-bl">' + (kind === "owe" ? L("יתרה לתשלום", "Balance due") : kind === "credit" ? L("זכות", "Credit") : L("אין חוב ✓", "Nothing owed ✓")) + "</span>" +
      (kind !== "zero" ? '<span class="mp-amt num">' + S.money(Math.abs(b)) + "</span>" : "") +
      (kind === "owe" ? (opts.payButton || '<a class="btn primary mp-pay" href="#/donate?mode=balance">' + I.wallet.replace("<svg", '<svg width="18" height="18"') + L("תשלום בכרטיס", "Pay by card") + "</a>") : "") + "</div>" +
      (pend.length ? '<div class="mp-pending" data-flash="pend"><h3>' + L("תשלומים שהתקבלו", "Payments received") + "</h3><ul>" + pend.map(function (x) { return '<li><b class="num">' + S.money(x.amount) + "</b> · " + esc(S.fmtDate(x.date)) + ' · <bdi dir="ltr">Ref #' + esc(x.ref) + "</bdi></li>"; }).join("") + "</ul><p>" + L("התקבל, ממתין לאישור הגבאי. היתרה תתעדכן אחרי שהגבאי ירשום את התשלום.", "Received, waiting for gabbai confirmation. Your balance updates once the gabbai records it.") + "</p></div>" : "") +
      '<div class="mp-totals"><span>' + L("סך חיובים", "Total charges") + ' <b class="num">' + S.money(lv.charges) + "</b></span><span>" + L("סך תשלומים", "Total payments") + ' <b class="num">' + S.money(lv.payments) + "</b></span></div>" +
      '<div class="table-wrap mp-table"><table><thead><tr><th>' + L("תאריך", "Date") + "</th><th>" + L("סוג", "Type") + "</th><th>" + L("סכום", "Amount") + "</th><th>" + L("תיאור", "Description") + "</th></tr></thead><tbody>" +
      lv.rows.slice(0, limit).map(function (e) { var v = lv.voided[e.id]; return '<tr class="' + (v ? "voided-row" : "") + '" data-id="' + e.id + '"><td class="nowrap">' + esc(S.fmtDate(e.date)) + '</td><td><span class="type-pill t-' + e.type + '">' + typeL[e.type] + "</span>" + (v ? ' <span class="muted small">' + L("(בוטל)", "(cancelled)") + "</span>" : "") + '</td><td class="num' + (v ? " strike" : "") + '">' + S.money(e.amount) + "</td><td>" + esc(B(e.desc)) + "</td></tr>"; }).join("") +
      "</tbody></table></div></section>";
  }

  UI.route("/me", {
    need: "signed", title: function () { return L("החשבון שלי", "My Account"); },
    render: function (app) {
      var u = S.currentUser();
      if (!u || !u.mid) { location.hash = "#/join"; return; }
      var mid = u.mid, d = S.now();
      var myY = S.db.yahrzeits.filter(function (y) { return y.memberId === mid; }).concat(S.db.yzRequests.filter(function (y) { return y.memberId === mid && y.status !== "approved"; }));
      var ann = S.db.items.filter(function (it) { return (it.type === "announcement" || it.type === "rabbi") && window.SHUL_TV.visible(it, d, false); });
      var welcome = S.role() === "applicant";
      app.innerHTML = '<div class="wrap page portal">' + UI.pageHead(L("החשבון שלי", "My Account"), L("מחובר: ", "Signed in: ") + '<bdi dir="ltr">' + esc(u.email) + "</bdi>") +
        (welcome ? '<div class="alert ok" style="margin-bottom:16px"><b>' + L("ברוכים הבאים לקהילה!", "Welcome to the community!") + "</b> " + L("זה החשבון האישי שלך.", "This is your personal account.") + "</div>" : "") +
        '<div class="portal-grid"><div>' + portalHtml(mid) + "</div>" +
        '<div class="stack"><section class="card"><div class="card-head"><h3>' + L("יארצייטים של המשפחה", "Family yahrzeits") + '</h3><button class="btn soft sm" id="addY">' + I.plus.replace("<svg", '<svg width="16" height="16"') + L("הוספה", "Add") + "</button></div>" +
        (myY.length ? myY.map(function (y) { return '<div class="yz-row"><div><b>' + esc(S.N(y.name)) + '</b><div class="small muted">' + esc(S.N(y.relation)) + " · " + S.hday(y.hday) + " " + esc(S.N(S.HEB_MONTHS[y.hmonth])) + '</div></div><div class="row">' + yzStatus(y) + (y.status === "pending" ? '<button class="btn ghost sm" data-cancel="' + y.id + '">' + L("ביטול", "Cancel") + "</button>" : "") + "</div></div>"; }).join("") : '<p class="muted">' + L("עוד לא נוספו יארצייטים.", "No yahrzeits yet.") + "</p>") +
        '<p class="tiny muted" style="margin:10px 0 0">' + L("יארצייט שהגבאי מאשר מוצג במסך בבית הכנסת בשבוע שלו, כל שנה.", "Once the gabbai approves, a yahrzeit shows on the shul screen in its week, every year.") + "</p></section>" +
        (ann.length ? '<section class="card"><h3>' + L("הודעות הקהילה", "Announcements") + "</h3>" + ann.map(function (a) { return '<div class="ann-row"><b>' + esc(S.N(a.title)) + '</b><div class="small muted">' + esc(S.N(a.text)) + "</div></div>"; }).join("") + "</section>" : "") +
        "</div></div></div>";
      UI.on(app, "[data-cancel]", "click", function (e, bt) { S.db.yzRequests = S.db.yzRequests.filter(function (y) { return y.id !== bt.getAttribute("data-cancel"); }); S.save(); UI.toast(L("הבקשה בוטלה", "Request cancelled")); UI.render(); });
      app.querySelector("#addY").addEventListener("click", function () { yahrzeitForm(mid); });
    }
  });
  function csvFor(mid) {
    var rows = [["date", "type", "description", "method", "amount"]];
    S.db.ledger.filter(function (e) { return e.mid === mid; }).forEach(function (e) { rows.push([e.date, e.type, B(e.desc), e.method || "", e.amount]); });
    return "﻿" + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
  }
  function yahrzeitForm(mid, onDone, asGabbai) {
    var mopts = S.HEB_MONTHS.map(function (mo, i) { return '<option value="' + i + '"' + (i === 2 ? " selected" : "") + ">" + esc(S.N(mo)) + "</option>"; }).join("");
    var m = UI.modal("<h2>" + L("הוספת יארצייט", "Add a yahrzeit") + '</h2><form id="yf"><div class="form-grid"><label class="field"><span>' + L("שם הנפטר/ת (כולל שם האב)", "Name of the departed (with father's name)") + '</span><input name="name" required placeholder="' + L("לדוגמה: שרה בת אברהם", "e.g. Sarah bat Avraham") + '"></label><label class="field"><span>' + L("קרבה", "Relation") + '</span><input name="rel" placeholder="' + L("אבא, אמא, סבא...", "Father, mother, grandfather...") + '"></label></div>' +
      '<div class="form-grid" style="margin-top:12px"><label class="field"><span>' + L("יום בחודש העברי", "Hebrew day") + '</span><select name="day">' + S.HEB_NUM.slice(1).map(function (n, i) { return '<option value="' + (i + 1) + '">' + n + " (" + (i + 1) + ")</option>"; }).join("") + '</select></label><label class="field"><span>' + L("חודש עברי", "Hebrew month") + '</span><select name="month">' + mopts + '</select></label><label class="field"><span>' + L("שנת פטירה (לא חובה)", "Year of passing (optional)") + '</span><input name="year" placeholder="5770" class="ltr"></label></div>' +
      '<div class="card flat" style="margin-top:12px;padding:12px"><b class="small">' + L("יש רק תאריך לועזי? נמיר אותו:", "Only have the English date? Convert it:") + '</b><div class="row" style="margin-top:8px"><input type="date" name="greg" style="max-width:190px"><label class="check small"><input type="checkbox" name="after"> ' + L("אחרי השקיעה", "After sunset") + '</label><button type="button" class="btn sm" id="conv">' + L("המרה לתאריך עברי", "Convert to Hebrew date") + "</button></div></div>" +
      '<p class="err hidden" id="yErr"></p><div class="actions"><button type="button" class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary">' + (asGabbai ? L("שמירה ופרסום במסך", "Save and show on the screen") : L("שליחה לגבאי", "Send to the gabbai")) + "</button></div></form>");
    var f = m.querySelector("#yf");
    m.querySelector("#conv").addEventListener("click", function () {
      if (!f.greg.value) return;
      var h = hebFromGreg(f.greg.value, f.after.checked);
      f.day.value = h.day; f.month.value = h.month; f.year.value = h.year;
      UI.toast(L("הומר: ", "Converted: ") + S.hday(h.day) + " " + S.N(S.HEB_MONTHS[h.month]) + " " + h.year);
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var day = +f.day.value, mon = +f.month.value, er = m.querySelector("#yErr");
      if (day === 30 && (mon === 5 || mon === 7)) { er.textContent = L("ל׳ אדר קיים רק באדר א׳ של שנה מעוברת.", "30 Adar exists only in Adar I of a leap year."); er.classList.remove("hidden"); return; }
      if (day === 30 && [3, 9, 11, 13].indexOf(mon) >= 0) { er.textContent = L("בחודש הזה יש רק 29 ימים.", "This month has only 29 days."); er.classList.remove("hidden"); return; }
      var name = f.name.value.trim(), rel = f.rel.value.trim();
      var rec = { id: S.uid("yr"), memberId: mid, name: { he: name, en: name }, relation: { he: rel, en: rel }, hday: day, hmonth: mon, year: f.year.value.trim(), status: "pending", at: S.todayIso() };
      UI.closeModal();
      if (asGabbai) { onDone(rec); return; }
      S.db.yzRequests.unshift(rec);
      var mm = S.memberById(mid);
      S.notify("content", "בקשת יארצייט חדשה מ" + mm.he, "New yahrzeit request from " + mm.en);
      S.save(); UI.toast(L("נשלח לגבאי לאישור", "Sent to the gabbai for approval")); UI.render();
    });
  }
  window.SHUL_MEMBER = { recordBalancePayment: recordBalancePayment, portalHtml: portalHtml, ledgerView: ledgerView, pendingFor: pendingFor, balanceText: balanceText, method: method, METHOD: METHOD, statementHtml: statementHtml, csvFor: csvFor, yahrzeitForm: yahrzeitForm, yzStatus: yzStatus };
})();
