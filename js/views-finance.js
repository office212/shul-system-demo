/* Shul system sales demo | finance (#/finance/*): home, payment/charge, Shabbat nedarim, who owes,
   members (with join requests), member card, card payments inbox, more (tax letters, report, recurring). */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, L = S.L, esc = S.esc, I = UI.I, B = UI.B;
  var M = function () { return window.SHUL_MEMBER; };
  var sv = function (svg, n) { return svg.replace("<svg", '<svg width="' + (n || 18) + '" height="' + (n || 18) + '"'); };

  function active() { return S.db.members.filter(function (m) { return m.status === "active"; }); }
  function tabs(on) {
    var pend = S.db.inbox.filter(function (x) { return x.status === "pending"; }).length;
    var jr = S.role() === "super" ? S.db.joinReqs.filter(function (j) { return j.status === "pending"; }).length : 0;
    var t = [["home", L("בית", "Home")], ["pay", L("תשלום / חיוב", "Payment / Charge")], ["nedarim", L("נדרי שבת", "Shabbat Nedarim")], ["owes", L("מי חייב", "Who Owes")], ["members", L("מתפללים", "Members") + (jr ? ' <span class="badge warn">' + jr + "</span>" : "")], ["inbox", L("תשלומים בכרטיס", "Card Payments") + (pend ? ' <span class="badge warn">' + pend + "</span>" : "")], ["more", L("עוד", "More")]];
    return '<nav class="tabs">' + t.map(function (x) { return '<a href="#/finance/' + x[0] + '" class="' + (x[0] === on ? "on" : "") + '">' + x[1] + "</a>"; }).join("") + "</nav>";
  }
  function frame(app, on, inner) {
    app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("כספים", "Finance"), "", UI.crumbGabbai()) + tabs(on) + inner + "</div>";
  }
  function monthTotal() {
    var ym = S.todayIso().slice(0, 7), c = 0;
    S.db.ledger.forEach(function (e) { if (e.type === "payment" && e.date.slice(0, 7) === ym) c += S.cents(e.amount); }); return c / 100;
  }
  function openTotal() { var c = 0; S.db.members.forEach(function (m) { var b = S.balance(m.id); if (b > 0) c += S.cents(b); }); return c / 100; }
  function ledgerRow(e, showName) {
    var m = S.memberById(e.mid), p = e.type === "payment", v = S.isVoided(e);
    return '<tr class="' + (v ? "voided" : "") + '"><td class="nowrap">' + esc(S.fmtDate(e.date)) + "</td>" + (showName ? '<td><a href="#/finance/m/' + e.mid + '">' + esc(m ? S.N(m) : "") + "</a></td>" : "") +
      "<td>" + esc(B(e.desc)) + (e.method ? ' <span class="badge">' + M().method(e.method) + "</span>" : "") + (e.source === "neder" ? ' <span class="badge accent">' + L("נדר", "Neder") + "</span>" : "") + (v ? ' <span class="badge">' + L("בוטל", "Voided") + "</span>" : "") + "</td>" +
      '<td class="num ' + (p ? "amt-pos" : "amt-neg") + '">' + (p ? "-" : "") + S.money(e.amount) + "</td></tr>";
  }
  function searchBox(id, ph) { return '<input id="' + id + '" type="search" placeholder="' + esc(ph || L("חיפוש לפי שם או טלפון", "Search by name or phone")) + '" autocomplete="off">'; }
  function matches(m, q) { q = q.trim().toLowerCase(); if (!q) return true; return (m.he + " " + m.en + " " + m.phone + " " + m.email).toLowerCase().indexOf(q) >= 0 || m.phone.replace(/\D/g, "").indexOf(q.replace(/\D/g, "") || "x") >= 0; }

  /* ---------- home ---------- */
  UI.route("/finance", { need: "finance", render: function (app) { location.replace("#/finance/home"); } });
  UI.route("/finance/*", {
    need: "finance", title: function () { return L("כספים", "Finance"); },
    render: function (app, arg, params) {
      var V = { home: home, pay: pay, charge: pay, nedarim: nedarim, owes: owes, members: members, inbox: inbox, more: more };
      if (arg && V[arg]) return V[arg](app, params, arg);
      return home(app, params);
    }
  });
  UI.route("/finance/m/*", { need: "finance", title: function () { return L("כרטיס מתפלל", "Member card"); }, render: function (app, id) { card(app, id); } });

  function home(app) {
    var pend = S.db.inbox.filter(function (x) { return x.status === "pending"; });
    var jr = S.role() === "super" ? S.db.joinReqs.filter(function (j) { return j.status === "pending"; }) : [];
    var last = S.db.ledger.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }).slice(0, 8);
    frame(app, "home",
      '<div class="stack">' + (pend.length ? '<a class="alert warn" href="#/finance/inbox" style="text-decoration:none">' + sv(I.inbox) + "<b>" + L("תשלומים בכרטיס לרישום", "Card payments to record") + " (" + pend.length + ")</b>" + L("ממתינים ללחיצה אחת על ״רישום״", "waiting for one tap on Record") + "</a>" : "") +
      (jr.length ? '<a class="alert" href="#/finance/members" style="text-decoration:none">' + sv(I.users) + "<b>" + L("בקשות הצטרפות", "Join requests") + " (" + jr.length + ")</b></a>" : "") + "</div>" +
      '<div style="margin:16px 0">' + searchBox("q") + '<div class="member-pick hidden" id="qres" style="margin-top:6px"></div></div>' +
      '<div class="big-actions"><a class="btn primary" href="#/finance/pay">' + sv(I.wallet, 28) + L("רישום תשלום", "Record a payment") + '</a><a class="btn" href="#/finance/nedarim">' + sv(I.list, 28) + L("נדרי שבת", "Shabbat nedarim") + '</a><a class="btn" href="#/finance/owes">' + sv(I.users, 28) + L("מי חייב", "Who owes") + "</a></div>" +
      '<div class="grid g3" style="margin-top:16px"><div class="stat"><div class="k">' + L("נגבה החודש", "Collected this month") + '</div><div class="v">' + S.money(monthTotal()) + '</div></div><div class="stat"><div class="k">' + L("יתרה פתוחה", "Open balance") + '</div><div class="v">' + S.money(openTotal()) + '</div></div><div class="stat"><div class="k">' + L("מתפללים פעילים", "Active members") + '</div><div class="v">' + active().length + "</div></div></div>" +
      '<h3 style="margin-top:22px">' + L("הרישומים האחרונים", "Latest entries") + '</h3><div class="table-wrap"><table><tbody>' + last.map(function (e) { return ledgerRow(e, true); }).join("") + "</tbody></table></div>");
    var q = app.querySelector("#q"), res = app.querySelector("#qres");
    q.addEventListener("input", function () {
      var list = S.db.members.filter(function (m) { return matches(m, q.value); }).slice(0, 8);
      res.classList.toggle("hidden", !q.value.trim());
      res.innerHTML = list.map(function (m) { return '<button data-id="' + m.id + '"><span>' + esc(S.N(m)) + ' <span class="muted small num">' + esc(m.phone) + "</span></span><span>" + M().balanceText(S.balance(m.id)) + "</span></button>"; }).join("") || '<p class="muted small" style="padding:10px">' + L("לא נמצא", "Not found") + "</p>";
      UI.on(res, "[data-id]", "click", function (e, b) { location.hash = "#/finance/m/" + b.getAttribute("data-id"); });
    });
  }

  /* ---------- payment / charge ---------- */
  function pay(app, params, which) {
    var mode = which === "charge" || params.t === "charge" ? "charge" : "payment";
    var sel = params.m || "", amt = "", meth = "cash";
    frame(app, "pay",
      '<div class="grid g2" style="align-items:start"><form class="card" id="pf"><div class="row" style="margin-bottom:12px"><button type="button" class="chip" data-mode="payment" aria-pressed="' + (mode === "payment") + '">' + L("תשלום", "Payment") + '</button><button type="button" class="chip" data-mode="charge" aria-pressed="' + (mode === "charge") + '">' + L("חיוב", "Charge") + "</button></div>" +
      '<div class="field"><span>' + L("מתפלל", "Member") + "</span>" + searchBox("ms") + '<div class="member-pick" id="mlist" style="margin-top:6px"></div></div>' +
      '<div class="field" style="margin-top:12px"><span>' + L("סכום", "Amount") + '</span><div class="row" id="quick"></div><input name="amount" type="number" min="0.01" step="0.01" class="ltr" style="margin-top:8px" placeholder="0.00"></div>' +
      '<div class="field" style="margin-top:12px" id="methWrap"><span>' + L("איך שילם", "Paid by") + '</span><div class="row">' + Object.keys(M().METHOD).map(function (k) { return '<button type="button" class="chip" data-meth="' + k + '" aria-pressed="' + (k === meth) + '">' + M().method(k) + "</button>"; }).join("") + "</div></div>" +
      '<div class="field hidden" style="margin-top:12px" id="forWrap"><span>' + L("עבור", "For") + '</span><div class="row">' + [["דמי חבר", "Membership"], ["קידוש", "Kiddush"], ["סעודה שלישית", "Seudah Shelishit"], ["מקום בבית הכנסת", "Seat"], ["אחר", "Other"]].map(function (x, i) { return '<button type="button" class="chip" data-for="' + x[0] + "|" + x[1] + '" aria-pressed="' + (i === 0) + '">' + L(x[0], x[1]) + "</button>"; }).join("") + "</div></div>" +
      '<div class="form-grid" style="margin-top:12px"><label class="field"><span>' + L("הערה (לא חובה)", "Note (optional)") + '</span><input name="note"></label><label class="field"><span>' + L("תאריך", "Date") + '</span><input name="date" type="date" max="' + S.todayIso() + '" value="' + S.todayIso() + '"></label></div>' +
      '<div class="balbox" style="margin-top:14px" id="bb"></div><p class="err hidden" id="pErr"></p><button class="btn primary lg block" style="margin-top:12px" id="saveBtn">' + L("שמירה", "Save") + "</button></form>" +
      '<div class="card flat"><h3>' + L("מה קורה כשלוחצים ״שמירה״", "What happens on Save") + '</h3><ul class="muted" style="margin:0;padding-inline-start:18px"><li>' + L("הרישום נכנס ליומן החשבונות, והיתרה מתעדכנת מיד.", "The entry goes into the ledger and the balance updates at once.") + "</li><li>" + L("המתפלל מקבל התראה לטלפון על התשלום.", "The member gets a phone notification about the payment.") + "</li><li>" + L("אפשר לבטל מיד, ולהפיק קבלה להדפסה.", "You can undo right away and print a receipt.") + "</li><li>" + L("כל פעולה נרשמת ביומן הפעילות.", "Every action is written to the activity log.") + "</li></ul></div></div>");
    var f = app.querySelector("#pf"), forV = "דמי חבר|Membership";
    function drawList() {
      var q = app.querySelector("#ms").value, list = active().filter(function (m) { return matches(m, q); });
      if (sel && !q) list = list.filter(function (m) { return m.id === sel; }).concat(list.filter(function (m) { return m.id !== sel; }));
      app.querySelector("#mlist").innerHTML = list.slice(0, 7).map(function (m) { return '<button type="button" data-id="' + m.id + '" class="' + (m.id === sel ? "on" : "") + '"><span>' + (m.id === sel ? "✓ " : "") + esc(S.N(m)) + "</span><span>" + M().balanceText(S.balance(m.id)) + "</span></button>"; }).join("");
      UI.on(app.querySelector("#mlist"), "[data-id]", "click", function (e, b) { sel = b.getAttribute("data-id"); drawList(); drawQuick(); upd(); });
    }
    function drawQuick() {
      var b = sel ? S.balance(sel) : 0, q = [18, 36, 50, 100, 180];
      app.querySelector("#quick").innerHTML = q.map(function (x) { return '<button type="button" class="chip" data-q="' + x + '">$' + x + "</button>"; }).join("") + (mode === "payment" && b > 0 ? '<button type="button" class="chip" data-q="' + b + '">' + L("כל היתרה ", "Full balance ") + S.money(b) + "</button>" : "");
      UI.on(app.querySelector("#quick"), "[data-q]", "click", function (e, bt) { f.amount.value = (+bt.getAttribute("data-q")).toFixed(2); upd(); });
    }
    function upd() {
      var b = sel ? S.balance(sel) : null, a = +f.amount.value || 0, after = b == null ? null : (mode === "payment" ? b - a : b + a);
      app.querySelector("#bb").innerHTML = sel ? "<span>" + L("לפני", "Before") + "</span><b>" + M().balanceText(b) + '</b><span class="arrow">' + (S.prefs.lang === "he" ? "←" : "→") + "</span><span>" + L("אחרי", "After") + "</span><b>" + M().balanceText(Math.round(after * 100) / 100) + "</b>" : '<span class="muted">' + L("בחרו מתפלל", "Choose a member") + "</span>";
      app.querySelector("#methWrap").classList.toggle("hidden", mode !== "payment");
      app.querySelector("#forWrap").classList.toggle("hidden", mode !== "charge");
      app.querySelector("#saveBtn").textContent = mode === "payment" ? L("שמירת תשלום", "Save payment") : L("שמירת חיוב", "Save charge");
    }
    UI.on(app, "[data-mode]", "click", function (e, b) { mode = b.getAttribute("data-mode"); app.querySelectorAll("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); drawQuick(); upd(); });
    UI.on(app, "[data-meth]", "click", function (e, b) { meth = b.getAttribute("data-meth"); app.querySelectorAll("[data-meth]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); });
    UI.on(app, "[data-for]", "click", function (e, b) { forV = b.getAttribute("data-for"); app.querySelectorAll("[data-for]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); });
    app.querySelector("#ms").addEventListener("input", drawList);
    f.addEventListener("input", upd);
    drawList(); drawQuick(); upd();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var a = Math.round((+f.amount.value || 0) * 100) / 100, er = app.querySelector("#pErr");
      if (!sel) { er.textContent = L("נא לבחור מתפלל.", "Please choose a member."); er.classList.remove("hidden"); return; }
      if (!(a > 0)) { er.textContent = L("נא להזין סכום.", "Please enter an amount."); er.classList.remove("hidden"); return; }
      if (f.date.value > S.todayIso()) { er.textContent = L("אי אפשר לרשום תאריך עתידי.", "A future date cannot be recorded."); er.classList.remove("hidden"); return; }
      var m = S.memberById(sel), note = f.note.value.trim();
      var desc = mode === "payment" ? "תשלום" + (note ? ": " + note : "") + "|Payment" + (note ? ": " + note : "") : forV.split("|")[0] + (note ? ": " + note : "") + "|" + forV.split("|")[1] + (note ? ": " + note : "");
      var entry = { id: S.uid("L"), mid: sel, date: f.date.value || S.todayIso(), type: mode, amount: a, desc: desc, method: mode === "payment" ? meth : undefined, by: S.db.demoUsers[S.role()].he + "|" + S.db.demoUsers[S.role()].en, source: "manual" };
      S.db.ledger.push(entry);
      S.log("finance", (mode === "payment" ? "רשם תשלום: " : "רשם חיוב: ") + m.he + ", " + S.money(a), (mode === "payment" ? "Recorded payment: " : "Recorded charge: ") + m.en + ", " + S.money(a));
      if (mode === "payment") S.notify(sel, "התשלום שלך התקבל: " + S.money(a) + ". תודה!", "Your payment was received: " + S.money(a) + ". Thank you!");
      S.save();
      UI.toast((mode === "payment" ? L("התשלום נשמר. ", "Payment saved. ") : L("החיוב נשמר. ", "Charge saved. ")) + esc(S.N(m)) + ": " + M().balanceText(S.balance(sel)), L("קבלה", "Receipt"), function () { receipt(entry); }, 9000);
      setTimeout(function () { UI.toast(L("טעות? אפשר לבטל.", "A mistake? You can undo."), L("בטל", "Undo"), function () { S.db.ledger = S.db.ledger.filter(function (x) { return x.id !== entry.id; }); S.log("finance", "ביטל רישום אחרון: " + m.he, "Undid the last entry: " + m.en); S.save(); UI.toast(L("בוטל", "Undone")); UI.render(); }, 9000); }, 150);
      sel = ""; f.amount.value = ""; f.note.value = ""; drawList(); drawQuick(); upd();
    });
  }
  function receipt(e) {
    var m = S.memberById(e.mid);
    var md = UI.modal('<div class="print-area" style="background:#fff;color:#1f1b14;padding:20px;border:1px solid #e2d7c2;border-radius:14px;text-align:center">' + UI.logo().replace("<svg", '<svg width="44" height="44" style="color:#0e2c4c"') + '<h2 style="color:#0e2c4c">' + L("קבלה", "Receipt") + "</h2><p><b>" + esc(S.N(S.db.shul)) + "</b><br>" + esc(S.db.shul.address) + '</p><hr class="gold-line"><p>' + L("התקבל מאת ", "Received from ") + "<b>" + esc(S.N(m)) + '</b></p><p style="font-size:30px;font-weight:800" class="num">' + S.money(e.amount) + "</p><p>" + esc(S.fmtDate(e.date)) + " · " + M().method(e.method) + '</p><p class="small" style="color:#555">' + L("לא ניתנו סחורות או שירותים תמורת תשלום זה.", "No goods or services were provided in exchange for this payment.") + '</p></div><div class="actions"><button class="btn" id="pr">' + L("הדפסה", "Print") + '</button><button class="btn primary" data-close>' + L("סגירה", "Close") + "</button></div>");
    md.querySelector("#pr").addEventListener("click", function () { window.print(); });
  }

  /* ---------- Shabbat nedarim ---------- */
  var ALIYOT = [["פתיחת ההיכל", "Petichat Haheichal"], ["כהן", "Kohen"], ["לוי", "Levi"], ["שלישי", "Shlishi"], ["רביעי", "Revi'i"], ["חמישי", "Chamishi"], ["שישי", "Shishi"], ["שביעי", "Shevi'i"], ["מפטיר", "Maftir"], ["הגבהה", "Hagbaha"], ["גלילה", "Gelila"]];
  function lastShabbat() { var d = S.now(); while (d.getDay() !== 6) d.setDate(d.getDate() - 1); return S.iso(d); }
  function nedarim(app) {
    var opts = '<option value="">' + L("בחרו", "Choose") + "</option>" + active().map(function (m) { return '<option value="' + m.id + '">' + esc(S.N(m)) + "</option>"; }).join("");
    var row = function (he, en, i, custom) { return '<tr data-row="' + i + '"><td>' + (custom ? '<input data-k="label" placeholder="' + L("מי שברך, אחר...", "Mi Sheberach, other...") + '">' : "<b>" + L(he, en) + "</b>") + '</td><td><select data-k="mid">' + opts + '</select></td><td><input data-k="amt" type="number" min="0" step="1" class="ltr" style="max-width:120px" placeholder="$"></td></tr>'; };
    frame(app, "nedarim", '<div class="card"><div class="card-head"><h3>' + L("נדרי שבת", "Shabbat nedarim") + '</h3><span class="badge">' + L("שבת ", "Shabbat ") + esc(S.fmtDate(lastShabbat())) + '</span></div><p class="muted small">' + L("כל העליות בטבלה אחת, ושמירה אחת במוצאי שבת. כל שורה הופכת לחיוב נפרד בכרטיס של המתפלל.", "Every aliyah in one table and one save on Motzei Shabbat. Each line becomes its own charge on the member's card.") + "</p>" +
      '<div class="table-wrap"><table id="nt"><thead><tr><th>' + L("עלייה", "Aliyah") + "</th><th>" + L("מתפלל", "Member") + "</th><th>" + L("סכום", "Amount") + "</th></tr></thead><tbody>" + ALIYOT.map(function (a, i) { return row(a[0], a[1], i); }).join("") + "</tbody></table></div>" +
      '<button class="btn sm" id="addRow" style="margin-top:10px">' + sv(I.plus, 16) + L("שורה נוספת", "Add a line") + "</button>" +
      '<h3 style="margin-top:20px">' + L("התחייבויות שאינן עליות", "Pledges that are not aliyot") + '</h3><div class="table-wrap"><table id="pt"><tbody>' + [["קידוש", "Kiddush"], ["סעודה שלישית", "Seudah Shelishit"], ["אירוע בבית הכנסת", "Event at the shul"]].map(function (p, i) { return row(p[0], p[1], "p" + i); }).join("") + '</tbody></table></div><button class="btn primary lg" id="check" style="margin-top:16px">' + L("בדיקה ושמירה", "Review and save") + "</button></div>");
    var extra = 100;
    app.querySelector("#addRow").addEventListener("click", function () { app.querySelector("#nt tbody").insertAdjacentHTML("beforeend", row("", "", extra++, true)); });
    app.querySelector("#check").addEventListener("click", function () {
      var lines = [];
      app.querySelectorAll("tr[data-row]").forEach(function (tr) {
        var mid = tr.querySelector('[data-k="mid"]').value, amt = +tr.querySelector('[data-k="amt"]').value;
        if (!mid || !(amt > 0)) return;
        var lab = tr.querySelector('[data-k="label"]'), name = lab ? (lab.value.trim() || L("אחר", "Other")) : tr.querySelector("b").textContent;
        var idx = ALIYOT.filter(function (a) { return L(a[0], a[1]) === name; })[0];
        var pl = [["קידוש", "Kiddush"], ["סעודה שלישית", "Seudah Shelishit"], ["אירוע בבית הכנסת", "Event at the shul"]].filter(function (a) { return L(a[0], a[1]) === name; })[0];
        var he = idx ? idx[0] : pl ? pl[0] : name, en = idx ? idx[1] : pl ? pl[1] : name;
        lines.push({ mid: mid, amt: amt, he: he, en: en, pledge: !!pl });
      });
      if (!lines.length) { UI.toast(L("לא מולאו שורות", "No lines filled in")); return; }
      var tot = lines.reduce(function (s, l) { return s + l.amt; }, 0);
      var md = UI.modal("<h2>" + L("בדיקה לפני שמירה", "Check before saving") + '</h2><div class="table-wrap"><table><tbody>' + lines.map(function (l) { return "<tr><td>" + esc(L(l.he, l.en)) + "</td><td>" + esc(S.N(S.memberById(l.mid))) + '</td><td class="num">' + S.money(l.amt) + "</td></tr>"; }).join("") + '</tbody></table></div><p style="margin-top:12px"><b>' + L("סה״כ: ", "Total: ") + '</b><span class="num">' + S.money(tot) + "</span> · " + lines.length + L(" שורות", " lines") + '</p><div class="actions"><button class="btn" data-close>' + L("חזרה", "Back") + '</button><button class="btn primary" id="ok">' + L("שמירה", "Save") + "</button></div>");
      md.querySelector("#ok").addEventListener("click", function () {
        var d = lastShabbat();
        lines.forEach(function (l) { S.db.ledger.push({ id: S.uid("L"), mid: l.mid, date: d, type: "charge", amount: l.amt, desc: (l.pledge ? "התחייבות: " : "נדר: ") + l.he + "|" + (l.pledge ? "Pledge: " : "Neder: ") + l.en, source: "neder", aliyah: l.en, by: S.db.demoUsers[S.role()].he + "|" + S.db.demoUsers[S.role()].en }); });
        S.log("finance", "נדרי שבת נשמרו: " + lines.length + " שורות, " + S.money(tot), "Shabbat nedarim saved: " + lines.length + " lines, " + S.money(tot));
        S.save(); UI.closeModal(); UI.toast(L("נשמרו ", "Saved ") + lines.length + L(" נדרים, ", " nedarim, ") + S.money(tot)); location.hash = "#/finance/owes";
      });
    });
  }

  /* ---------- who owes ---------- */
  function lastPay(mid) { var p = S.db.ledger.filter(function (e) { return e.mid === mid && e.type === "payment"; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0]; return p ? S.fmtDate(p.date) : L("אין", "None"); }
  function owes(app) {
    var list = S.db.members.map(function (m) { return { m: m, b: S.balance(m.id) }; }).filter(function (x) { return x.b > 0; }).sort(function (a, b) { return b.b - a.b; });
    frame(app, "owes", '<div class="row between" style="margin-bottom:12px"><b>' + list.length + L(" מתפללים עם יתרה, סה״כ ", " members with a balance, total ") + '<span class="num">' + S.money(openTotal()) + '</span></b><button class="btn sm" id="remind">' + sv(I.bell, 16) + L("תזכורת לכולם", "Remind all") + '</button></div><div class="table-wrap"><table><thead><tr><th>' + L("שם", "Name") + "</th><th>" + L("טלפון", "Phone") + "</th><th>" + L("תשלום אחרון", "Last payment") + "</th><th>" + L("יתרה", "Balance") + "</th></tr></thead><tbody>" +
      list.map(function (x) { return '<tr class="click" data-id="' + x.m.id + '"><td><b>' + esc(S.N(x.m)) + '</b></td><td class="num">' + esc(x.m.phone) + '</td><td class="nowrap">' + esc(lastPay(x.m.id)) + '</td><td class="num"><b>' + S.money(x.b) + "</b></td></tr>"; }).join("") + "</tbody></table></div>");
    UI.on(app, "tr[data-id]", "click", function (e, tr) { location.hash = "#/finance/m/" + tr.getAttribute("data-id"); });
    app.querySelector("#remind").addEventListener("click", function () {
      UI.confirmBox(L("לשלוח תזכורת?", "Send a reminder?"), L("כל מתפלל עם יתרה יקבל התראה לטלפון עם היתרה שלו וקישור לתשלום בכרטיס.", "Every member with a balance gets a phone notification with their balance and a link to pay by card."), L("שליחה", "Send"), function () {
        list.forEach(function (x) { S.db.notifs.unshift({ id: S.uid("n"), to: x.m.id, he: "תזכורת: היתרה שלך " + S.money(x.b) + ". אפשר לשלם בכרטיס בחשבון שלך.", en: "Reminder: your balance is " + S.money(x.b) + ". You can pay by card in your account.", at: new Date().toISOString(), read: false }); });
        S.log("finance", "נשלחה תזכורת יתרה ל-" + list.length + " מתפללים", "Balance reminder sent to " + list.length + " members");
        S.save(); UI.pushToast("members", "תזכורת: היתרה שלך ממתינה לתשלום.", "Reminder: your balance is waiting for payment."); UI.toast(L("נשלח ל-", "Sent to ") + list.length + L(" מתפללים (הדגמה)", " members (demo)"));
      });
    });
  }

  /* ---------- members + join requests ---------- */
  function members(app, params) {
    var isSuper = S.role() === "super", showInactive = params.inactive === "1";
    var jr = isSuper ? S.db.joinReqs.filter(function (j) { return j.status === "pending"; }) : [];
    frame(app, "members",
      (jr.length ? '<div class="card" style="margin-bottom:16px;border-color:var(--accent)"><div class="card-head"><h3>' + L("בקשות הצטרפות", "Join requests") + " (" + jr.length + ')</h3></div><div class="stack">' + jr.map(function (j) {
        return '<div class="row between" style="border-bottom:1px solid var(--line);padding-bottom:10px"><div><b>' + esc(S.N(j)) + "</b> " + (j.resent ? '<span class="badge">' + L("נשלחה שוב", "Sent again") + "</span>" : "") + '<div class="small muted num">' + esc(j.phone) + " · " + esc(j.email) + " · " + UI.timeAgo(j.at) + '</div></div><div class="row"><button class="btn primary sm" data-approve="' + j.id + '">' + L("אישור", "Approve") + '</button><button class="btn sm" data-decline="' + j.id + '">' + L("דחייה", "Decline") + "</button></div></div>";
      }).join("") + "</div></div>" : "") +
      '<div class="row" style="margin-bottom:12px"><div style="flex:1;min-width:220px">' + searchBox("mq") + '</div><a class="btn sm" href="#/finance/members' + (showInactive ? "" : "?inactive=1") + '">' + (showInactive ? L("הסתר לא פעילים", "Hide inactive") : L("הצג לא פעילים", "Show inactive")) + '</a><button class="btn primary sm" id="addM">' + sv(I.plus, 16) + L("מתפלל חדש", "New member") + '</button></div><div class="table-wrap"><table><thead><tr><th>' + L("שם", "Name") + "</th><th>" + L("טלפון", "Phone") + "</th><th>" + L("אימייל", "Email") + "</th><th>" + L("יתרה", "Balance") + '</th></tr></thead><tbody id="mt"></tbody></table></div>');
    function draw() {
      var q = app.querySelector("#mq").value;
      app.querySelector("#mt").innerHTML = S.db.members.filter(function (m) { return (showInactive || m.status === "active") && matches(m, q); }).map(function (m) {
        return '<tr class="click" data-id="' + m.id + '"><td><b>' + esc(S.N(m)) + "</b> " + (m.status !== "active" ? '<span class="badge">' + L("לא פעיל", "Inactive") + "</span>" : "") + (!m.email ? ' <span class="badge warn">' + L("אין מייל", "No email") + "</span>" : "") + '</td><td class="num">' + esc(m.phone) + '</td><td class="num small">' + esc(m.email) + "</td><td>" + M().balanceText(S.balance(m.id)) + "</td></tr>";
      }).join("");
      UI.on(app.querySelector("#mt"), "tr", "click", function (e, tr) { location.hash = "#/finance/m/" + tr.getAttribute("data-id"); });
    }
    app.querySelector("#mq").addEventListener("input", draw); draw();
    app.querySelector("#addM").addEventListener("click", addMember);
    UI.on(app, "[data-approve]", "click", function (e, b) { approve(b.getAttribute("data-approve")); });
    UI.on(app, "[data-decline]", "click", function (e, b) {
      var j = S.db.joinReqs.filter(function (x) { return x.id === b.getAttribute("data-decline"); })[0];
      j.status = "declined"; if (j.id === "applicant") S.db.applicant.status = "declined";
      S.log("join", "דחה בקשת הצטרפות: " + j.he, "Declined join request: " + j.en);
      S.notify(j.id === "applicant" ? "applicant" : "super", "הבקשה שלך לא אושרה", "Your request was not approved");
      S.save(); UI.render();
    });
  }
  function approve(id) {
    var j = S.db.joinReqs.filter(function (x) { return x.id === id; })[0];
    var roles = [["member", "מתפלל", "Member"], ["content", "גבאי תוכן וזמנים", "Times gabbai"], ["finance", "גבאי כספים", "Finance gabbai"], ["both", "כספים ותוכן", "Both"]];
    var md = UI.modal("<h2>" + L("אישור ", "Approve ") + esc(S.N(j)) + '</h2><p class="muted">' + L("בחרו תפקיד בלחיצה אחת:", "Pick a role in one tap:") + '</p><div class="grid g2">' + roles.map(function (r) { return '<button class="btn" data-role="' + r[0] + '">' + L(r[1], r[2]) + "</button>"; }).join("") + '</div><div class="actions"><button class="btn" data-close>' + L("ביטול", "Cancel") + "</button></div>");
    UI.on(md, "[data-role]", "click", function (e, b) {
      var role = b.getAttribute("data-role"), mid = S.uid("m");
      S.db.members.push({ id: mid, he: j.he, en: j.en, phone: j.phone, email: j.email, status: "active", joined: S.todayIso(), hasAccount: true });
      S.db.users.push({ mid: mid, he: j.he, en: j.en, email: j.email, role: role });
      j.status = "approved";
      if (id === "applicant") { S.db.applicant.status = "approved"; S.db.demoUsers.applicant.mid = mid; }
      S.log("join", "אישר בקשת הצטרפות: " + j.he + " (" + role + ")", "Approved join request: " + j.en + " (" + role + ")");
      S.notify(id === "applicant" ? "applicant" : "super", "הבקשה שלך אושרה. ברוכים הבאים!", "Your request was approved. Welcome!");
      S.save(); UI.closeModal();
      UI.toast(L("אושר. נשלח אימייל ברוכים הבאים.", "Approved. A welcome email was sent."), L("הצג", "View"), function () { window.SHUL_PUBLIC.welcomeEmail(S.N(j)); });
      UI.render();
    });
  }
  function addMember() {
    var md = UI.modal("<h2>" + L("מתפלל חדש", "New member") + '</h2><form id="am"><div class="form-grid"><label class="field"><span>' + L("שם בעברית", "Hebrew name") + '</span><input name="he" required></label><label class="field"><span>' + L("שם באנגלית", "English name") + '</span><input name="en" required class="ltr"></label><label class="field"><span>' + L("טלפון", "Phone") + '</span><input name="phone" class="ltr"></label><label class="field"><span>' + L("אימייל", "Email") + '</span><input name="email" type="email" class="ltr"></label></div><p class="err hidden" id="amErr"></p><div class="actions"><button type="button" class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary">' + L("הוספה", "Add") + "</button></div></form>");
    md.querySelector("#am").addEventListener("submit", function (e) {
      e.preventDefault(); var f = e.target, em = f.email.value.trim().toLowerCase(), er = md.querySelector("#amErr");
      if (em && S.db.members.some(function (m) { return m.email === em; })) { er.textContent = L("כבר יש מתפלל עם האימייל הזה.", "A member with this email already exists."); er.classList.remove("hidden"); return; }
      var id = S.uid("m");
      S.db.members.push({ id: id, he: f.he.value.trim(), en: f.en.value.trim(), phone: f.phone.value.trim(), email: em, status: "active", joined: S.todayIso(), hasAccount: false });
      S.log("members", "הוסיף מתפלל: " + f.he.value.trim(), "Added member: " + f.en.value.trim());
      S.save(); UI.closeModal(); UI.toast(L("המתפלל נוסף", "Member added") + (em ? L(". נשלח אימייל ברוכים הבאים.", ". A welcome email was sent.") : "")); location.hash = "#/finance/m/" + id;
    });
  }

  /* ---------- member card ---------- */
  function card(app, id) {
    var m = S.memberById(id); if (!m) { location.hash = "#/finance/members"; return; }
    var isSuper = S.role() === "super", b = S.balance(id);
    var hist = S.db.ledger.filter(function (e) { return e.mid === id; }).sort(function (a, c) { return a.date < c.date ? 1 : -1; });
    var yz = S.db.yahrzeits.filter(function (y) { return y.memberId === id; });
    var user = S.db.users.filter(function (u) { return u.mid === id; })[0];
    frame(app, "members", '<div class="grid g2" style="align-items:start"><div class="card"><div class="card-head"><div><h2>' + esc(S.N(m)) + "</h2><div class=\"small muted num\">" + esc(m.phone) + " · " + esc(m.email || L("אין מייל", "No email")) + "</div></div>" + (m.status !== "active" ? '<span class="badge">' + L("לא פעיל", "Inactive") + "</span>" : '<span class="badge ok">' + L("פעיל", "Active") + "</span>") + "</div>" +
      '<div style="font-size:34px;font-weight:800">' + M().balanceText(b) + '</div><div class="row" style="margin-top:12px"><a class="btn primary" href="#/finance/pay?m=' + id + '">+ ' + L("תשלום", "Payment") + '</a><a class="btn" href="#/finance/pay?m=' + id + '&t=charge">+ ' + L("חיוב", "Charge") + '</a><button class="btn" id="stmt">' + sv(I.print, 16) + L("דף חשבון", "Statement") + '</button><button class="btn" id="csv">CSV</button></div>' +
      (isSuper ? '<hr class="gold-line"><div class="row"><button class="btn sm" id="edit">' + sv(I.edit, 16) + L("עריכת פרטים", "Edit details") + '</button><button class="btn sm" id="inact">' + (m.status === "active" ? L("סימון כלא פעיל", "Mark inactive") : L("החזרה לפעיל", "Make active")) + "</button>" + (user && user.role !== "super" ? '<label class="row small" style="gap:6px">' + L("תפקיד:", "Role:") + '<select id="roleSel" style="min-height:34px;padding:4px 8px;width:auto">' + [["member", "מתפלל", "Member"], ["content", "גבאי תוכן", "Content gabbai"], ["finance", "גבאי כספים", "Finance gabbai"], ["both", "שניהם", "Both"]].map(function (r) { return '<option value="' + r[0] + '"' + (user.role === r[0] ? " selected" : "") + ">" + L(r[1], r[2]) + "</option>"; }).join("") + "</select></label>" : "") + "</div>" : "") +
      '</div><div class="card"><h3>' + L("יארצייטים מקושרים", "Linked yahrzeits") + "</h3>" + (yz.length ? yz.map(function (y) { return '<div class="row between" style="padding:6px 0;border-bottom:1px solid var(--line)"><span><b>' + esc(S.N(y.name)) + '</b> <span class="small muted">' + esc(S.N(y.relation)) + "</span></span><span class=\"small\">" + S.hday(y.hday) + " " + esc(S.N(S.HEB_MONTHS[y.hmonth])) + "</span></div>"; }).join("") : '<p class="muted small">' + L("אין", "None") + "</p>") + "</div></div>" +
      '<h3 style="margin-top:20px">' + L("היסטוריה מלאה", "Full history") + '</h3><div class="table-wrap"><table><thead><tr><th>' + L("תאריך", "Date") + "</th><th>" + L("תיאור", "Description") + "</th><th>" + L("סכום", "Amount") + "</th><th>" + L("נרשם על ידי", "Entered by") + "</th><th></th></tr></thead><tbody>" +
      hist.map(function (e) { var p = e.type === "payment", v = S.isVoided(e) || e.voidOf; return '<tr class="' + (S.isVoided(e) ? "voided" : "") + '"><td class="nowrap">' + esc(S.fmtDate(e.date)) + "</td><td>" + esc(B(e.desc)) + (e.method ? ' <span class="badge">' + M().method(e.method) + "</span>" : "") + (S.isVoided(e) ? ' <span class="badge">' + L("בוטל", "Voided") + "</span>" : "") + '</td><td class="num ' + (p ? "amt-pos" : "amt-neg") + '">' + (p ? "-" : "") + S.money(e.amount) + '</td><td class="small muted">' + esc(B(e.by)) + "</td><td>" + (v ? "" : '<button class="btn ghost sm" data-void="' + e.id + '">' + L("ביטול", "Void") + "</button>") + "</td></tr>"; }).join("") + "</tbody></table></div>");
    app.querySelector("#stmt").addEventListener("click", function () { var md = UI.modal(M().statementHtml(id) + '<div class="actions"><button class="btn" id="em">' + sv(I.mail, 16) + L("שליחה באימייל", "Email it") + '</button><button class="btn" id="pr">' + L("הדפסה", "Print") + '</button><button class="btn primary" data-close>' + L("סגירה", "Close") + "</button></div>", { wide: true }); md.querySelector("#pr").addEventListener("click", function () { window.print(); }); md.querySelector("#em").addEventListener("click", function () { if (!m.email) { UI.toast(L("אין מייל למתפלל הזה", "This member has no email")); return; } S.log("finance", "שלח דף חשבון: " + m.he, "Emailed a statement: " + m.en); S.save(); UI.closeModal(); UI.toast(L("דף החשבון נשלח ל-", "Statement emailed to ") + esc(m.email) + L(" (הדגמה)", " (demo)")); }); });
    app.querySelector("#csv").addEventListener("click", function () { UI.download(m.en.replace(/\s+/g, "-").toLowerCase() + ".csv", M().csvFor(id), "text/csv"); });
    UI.on(app, "[data-void]", "click", function (e, bt) {
      var en = S.db.ledger.filter(function (x) { return x.id === bt.getAttribute("data-void"); })[0];
      UI.confirmBox(L("לבטל את הרישום?", "Void this entry?"), L("היומן לא נמחק לעולם: נרשם תיקון בסכום הפוך, והרישום המקורי נשאר בהיסטוריה מסומן ״בוטל״.", "The ledger is never erased: a correction of the opposite sign is written and the original stays in the history, marked \"Voided\"."), L("ביטול הרישום", "Void entry"), function () {
        S.db.ledger.push({ id: "void-" + en.id, mid: id, date: S.todayIso(), type: en.type === "payment" ? "charge" : "payment", amount: en.amount, desc: "ביטול [" + en.id + "]|Void [" + en.id + "]", voidOf: en.id, by: S.db.demoUsers[S.role()].he + "|" + S.db.demoUsers[S.role()].en, source: "correction" });
        S.log("finance", "ביטל רישום: " + m.he + ", " + S.money(en.amount), "Voided an entry: " + m.en + ", " + S.money(en.amount)); S.save(); UI.render();
      });
    });
    if (isSuper) {
      app.querySelector("#edit").addEventListener("click", function () {
        var md = UI.modal("<h2>" + L("עריכת פרטים", "Edit details") + '</h2><form id="ed"><div class="form-grid"><label class="field"><span>' + L("שם בעברית", "Hebrew name") + '</span><input name="he" value="' + esc(m.he) + '"></label><label class="field"><span>' + L("שם באנגלית", "English name") + '</span><input name="en" value="' + esc(m.en) + '"></label><label class="field"><span>' + L("טלפון", "Phone") + '</span><input name="phone" value="' + esc(m.phone) + '"></label></div><p class="small muted">' + L("אימייל: ", "Email: ") + esc(m.email) + L(" (לא משתנה כאן)", " (not changed here)") + '</p><div class="actions"><button type="button" class="btn" data-close>' + L("ביטול", "Cancel") + '</button><button class="btn primary">' + L("שמירה", "Save") + "</button></div></form>");
        md.querySelector("#ed").addEventListener("submit", function (e) { e.preventDefault(); var f = e.target; S.log("members", "עדכן פרטים: " + m.he + " → " + f.he.value, "Updated details: " + m.en + " → " + f.en.value); m.he = f.he.value.trim(); m.en = f.en.value.trim(); m.phone = f.phone.value.trim(); S.save(); UI.closeModal(); UI.render(); });
      });
      app.querySelector("#inact").addEventListener("click", function () { m.status = m.status === "active" ? "inactive" : "active"; S.log("members", "שינה סטטוס: " + m.he, "Changed status: " + m.en); S.save(); UI.render(); });
      var rs = app.querySelector("#roleSel");
      if (rs) rs.addEventListener("change", function () { user.role = rs.value; S.log("permissions", "שינה תפקיד: " + m.he + " → " + rs.value, "Changed role: " + m.en + " → " + rs.value); S.save(); UI.toast(L("התפקיד עודכן", "Role updated")); });
    }
  }

  /* ---------- card payments inbox (unmatched payments) ---------- */
  function matchMember(rec) {
    if (rec.memberId) return S.memberById(rec.memberId);
    var l = S.db.members.filter(function (m) { return m.email && m.email === String(rec.email).toLowerCase() && m.status !== "pending"; });
    return l.length === 1 ? l[0] : null;
  }
  function inbox(app) {
    var pend = S.db.inbox.filter(function (x) { return x.status === "pending"; }), done = S.db.inbox.filter(function (x) { return x.status !== "pending"; }).slice(0, 8);
    var opts = '<option value="">' + L("שיוך למתפלל...", "Assign to member...") + '</option><option value="general">' + L("תרומה כללית (לא מתפלל)", "General donation (not a member)") + "</option>" + active().map(function (m) { return '<option value="' + m.id + '">' + esc(S.N(m)) + "</option>"; }).join("");
    frame(app, "inbox", '<p class="muted">' + L("כל תשלום בכרטיס, Apple Pay או Google Pay מגיע לכאן מעצמו. כשהאימייל תואם מתפלל, לוחצים ״רישום״ פעם אחת. כשאין התאמה, משייכים בבחירה אחת.", "Every card, Apple Pay or Google Pay payment lands here on its own. When the email matches a member, tap Record once. When there is no match, assign it with one choice.") + "</p>" +
      (pend.length ? '<div class="stack">' + pend.map(function (r) {
        var mm = matchMember(r);
        return '<div class="card"><div class="row between"><div><b style="font-size:18px" class="num">' + S.money(r.amount) + "</b> · " + esc(r.name) + ' <span class="small muted num">' + esc(r.email) + '</span><div class="small muted">' + esc(S.fmtDate(r.date)) + " · Sola #" + esc(r.ref) + " · " + esc(r.wallet || ("•••• " + r.last4)) + " · " + (r.type === "balance" ? L("תשלום יתרה", "Balance payment") : L("תרומה", "Donation")) + (r.note ? " · " + esc(B(r.note)) : "") + "</div></div>" +
          (mm ? '<div class="row"><span class="badge ok">' + L("תואם: ", "Matched: ") + esc(S.N(mm)) + '</span><button class="btn primary" data-rec="' + r.id + '" data-mid="' + mm.id + '">' + L("רישום", "Record") + "</button></div>"
            : '<div class="row"><span class="badge warn">' + L("לא נמצאה התאמה", "No match") + '</span><select data-assign="' + r.id + '" style="width:auto">' + opts + "</select></div>") + "</div></div>";
      }).join("") + "</div>" : '<div class="alert ok">' + sv(I.check) + L("הכל נרשם. אין תשלומים ממתינים.", "All recorded. No payments waiting.") + "</div>") +
      '<h3 style="margin-top:22px">' + L("נרשמו לאחרונה", "Recently recorded") + '</h3><div class="table-wrap"><table><tbody>' + (done.map(function (r) { var mm = r.memberId === "general" ? null : S.memberById(r.memberId); return '<tr><td class="nowrap">' + esc(S.fmtDate(r.date)) + "</td><td>" + esc(r.name) + "</td><td>" + (mm ? esc(S.N(mm)) : L("תרומות כלליות", "General donations")) + '</td><td class="num">' + S.money(r.amount) + '</td><td><span class="badge ok">' + L("נרשם", "Recorded") + "</span></td></tr>"; }).join("") || '<tr><td class="muted">' + L("עדיין אין", "None yet") + "</td></tr>") + "</tbody></table></div>" +
      '<p class="small muted" style="margin-top:12px">' + L("בהדגמה: תרמו בדף התרומה, והתשלום יופיע כאן מיד.", "In the demo: donate on the Donate page and the payment shows up here at once.") + ' <a href="#/donate">' + L("לדף התרומה", "To the Donate page") + "</a></p>");
    function record(rid, mid) {
      var r = S.db.inbox.filter(function (x) { return x.id === rid; })[0];
      if (S.db.ledger.some(function (e) { return e.id === "sola-" + r.ref; })) { UI.toast(L("כבר נרשם", "Already recorded")); return; }
      r.status = "recorded"; r.memberId = mid;
      if (mid !== "general") {
        S.db.ledger.push({ id: "sola-" + r.ref, mid: mid, date: r.date, type: "payment", amount: r.amount, desc: "תשלום בכרטיס Sola #" + r.ref + "|Card payment Sola #" + r.ref, method: "card", by: S.db.demoUsers[S.role()].he + "|" + S.db.demoUsers[S.role()].en, source: "card" });
        S.notify(mid, "התשלום שלך התקבל: " + S.money(r.amount) + ". תודה!", "Your payment was received: " + S.money(r.amount) + ". Thank you!");
      }
      var mm = mid === "general" ? { he: "תרומות כלליות", en: "General donations" } : S.memberById(mid);
      S.log("finance", "רשם תשלום בכרטיס: " + mm.he + ", " + S.money(r.amount), "Recorded card payment: " + mm.en + ", " + S.money(r.amount));
      S.save(); UI.toast(L("נרשם: ", "Recorded: ") + esc(S.N(mm)) + ", " + S.money(r.amount)); UI.render();
    }
    UI.on(app, "[data-rec]", "click", function (e, b) { record(b.getAttribute("data-rec"), b.getAttribute("data-mid")); });
    UI.on(app, "[data-assign]", "change", function (e, s) { if (s.value) record(s.getAttribute("data-assign"), s.value); });
  }

  /* ---------- more: tax letters, annual report, recurring charges, backup ---------- */
  function more(app, params) {
    var sub = params.s || "tax";
    var subs = [["tax", L("מכתבי מס", "Tax letters")], ["report", L("דוח שנתי", "Annual report")], ["recurring", L("חיובים קבועים", "Recurring charges")]];
    var body = "";
    if (sub === "tax") {
      var yr = 2026;
      var rows = S.db.members.map(function (m) { var t = 0; S.db.ledger.forEach(function (e) { if (e.mid === m.id && e.type === "payment" && e.date.slice(0, 4) === String(yr) && !S.isVoided(e)) t += S.cents(e.amount); }); return { m: m, t: t / 100 }; }).filter(function (x) { return x.t > 0; });
      body = '<p class="muted">' + L("מכתב אחד לכל מתפלל, עם סכום התרומות שלו לשנה. הגבאי מאשר את הסכום, ומדפיסים או שולחים באימייל.", "One letter per member with their total giving for the year. The gabbai confirms the amount, then print or email.") + '</p><div class="row" style="margin-bottom:12px"><b>' + L("שנת מס ", "Tax year ") + yr + '</b><span class="spacer"></span><button class="btn" id="sendAll">' + sv(I.mail, 16) + L("שליחה לכולם באימייל", "Email all") + '</button></div><div class="table-wrap"><table><thead><tr><th>' + L("שם", "Name") + "</th><th>" + L("סכום לניכוי", "Deductible amount") + "</th><th></th></tr></thead><tbody>" +
        rows.map(function (x) { return "<tr><td><b>" + esc(S.N(x.m)) + '</b></td><td class="num">' + S.money(x.t) + '</td><td><button class="btn sm" data-letter="' + x.m.id + '" data-t="' + x.t + '">' + L("מכתב", "Letter") + "</button></td></tr>"; }).join("") + "</tbody></table></div>";
    } else if (sub === "report") {
      var inc = 0, ch = 0, byM = {}, ned = 0;
      S.db.ledger.forEach(function (e) { if (e.type === "payment") { inc += S.cents(e.amount); byM[e.method || "none"] = (byM[e.method || "none"] || 0) + S.cents(e.amount); } else if (e.type === "charge") { ch += S.cents(e.amount); if (e.source === "neder") ned += S.cents(e.amount); } });
      body = '<div class="grid g4"><div class="stat"><div class="k">' + L("סך הכנסות", "Total income") + '</div><div class="v">' + S.money(inc / 100) + '</div></div><div class="stat"><div class="k">' + L("סך חיובים", "Total charges") + '</div><div class="v">' + S.money(ch / 100) + '</div></div><div class="stat"><div class="k">' + L("מתוכם נדרים", "Of which nedarim") + '</div><div class="v">' + S.money(ned / 100) + '</div></div><div class="stat"><div class="k">' + L("יתרות פתוחות", "Open balances") + '</div><div class="v">' + S.money(openTotal()) + "</div></div></div>" +
        '<h3 style="margin-top:20px">' + L("תשלומים לפי אמצעי", "Payments by method") + "</h3>" + Object.keys(byM).map(function (k) { var pct = Math.round(byM[k] / inc * 100); return '<div style="margin:8px 0"><div class="row between small"><span>' + (M().method(k) || L("לא צוין", "Not given")) + '</span><b class="num">' + S.money(byM[k] / 100) + " · " + pct + '%</b></div><div style="height:10px;background:var(--surface-2);border-radius:6px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:var(--accent)"></div></div></div>'; }).join("") +
        '<button class="btn" id="prRep" style="margin-top:12px">' + sv(I.print, 16) + L("הדפסה", "Print") + "</button>";
    } else {
      body = '<p class="muted">' + L("דמי חבר נרשמים מעצמם בזמן, בלי כפילויות. השהיה עוצרת רק חיובים עתידיים.", "Membership fees post themselves on schedule, never twice. Pausing stops future charges only.") + '</p><div class="table-wrap"><table><thead><tr><th>' + L("חיוב", "Charge") + "</th><th>" + L("סכום", "Amount") + "</th><th>" + L("תדירות", "Frequency") + "</th><th>" + L("מתפללים", "Members") + "</th><th>" + L("הבא", "Next") + "</th><th></th></tr></thead><tbody>" +
        S.db.recurring.map(function (r) { return "<tr><td><b>" + esc(S.N(r)) + '</b></td><td class="num">' + S.money(r.amount) + "</td><td>" + (r.freq === "monthly" ? L("חודשי", "Monthly") : L("שנתי", "Annual")) + "</td><td>" + r.count + '</td><td class="num">' + (r.active ? esc(S.fmtDate(r.next)) : '<span class="badge">' + L("מושהה", "Paused") + "</span>") + '</td><td><button class="btn sm" data-pause="' + r.id + '">' + (r.active ? L("השהיה", "Pause") : L("חידוש", "Resume")) + "</button></td></tr>"; }).join("") + "</tbody></table></div>";
    }
    frame(app, "more", '<div class="row" style="margin-bottom:14px">' + subs.map(function (s) { return '<a class="chip ' + (s[0] === sub ? "on" : "") + '" href="#/finance/more?s=' + s[0] + '">' + s[1] + "</a>"; }).join("") + '<a class="chip" href="#/backup">' + L("גיבוי", "Backup") + "</a></div>" + body);
    UI.on(app, "[data-letter]", "click", function (e, b) { taxLetter(S.memberById(b.getAttribute("data-letter")), +b.getAttribute("data-t")); });
    var sa = app.querySelector("#sendAll"); if (sa) sa.addEventListener("click", function () { UI.confirmBox(L("לשלוח את כל מכתבי המס?", "Email all tax letters?"), L("כל מתפלל עם אימייל יקבל את המכתב שלו.", "Every member with an email gets their letter."), L("שליחה", "Send"), function () { S.log("finance", "נשלחו מכתבי מס לשנת 2026", "Tax letters for 2026 emailed"); S.save(); UI.toast(L("מכתבי המס נשלחו (הדגמה)", "Tax letters emailed (demo)")); }); });
    var pr = app.querySelector("#prRep"); if (pr) pr.addEventListener("click", function () { app.querySelector(".page").classList.add("print-area"); window.print(); app.querySelector(".page").classList.remove("print-area"); });
    UI.on(app, "[data-pause]", "click", function (e, b) { var r = S.db.recurring.filter(function (x) { return x.id === b.getAttribute("data-pause"); })[0]; r.active = !r.active; S.log("finance", (r.active ? "חידש" : "השהה") + " חיוב קבוע: " + r.he, (r.active ? "Resumed" : "Paused") + " recurring charge: " + r.en); S.save(); UI.render(); });
  }
  function taxLetter(m, t) {
    var md = UI.modal('<div class="print-area" style="background:#fff;color:#1f1b14;padding:28px;border:1px solid #e2d7c2;border-radius:14px" dir="ltr"><div style="text-align:center">' + UI.logo().replace("<svg", '<svg width="48" height="48" style="color:#0e2c4c"') + '<div style="font-family:Frank Ruhl Libre,serif;font-size:22px;color:#0e2c4c;font-weight:700">' + esc(S.db.shul.en) + '</div><div style="color:#6b5a3c">' + esc(S.db.shul.address) + '</div></div><hr class="gold-line"><p>January 15, 2027</p><p>Dear ' + esc(m.en) + ",</p><p>Thank you for your generous support of " + esc(S.db.shul.en) + " during 2026. Our records show tax-deductible contributions totaling <b>" + S.money(t) + "</b>.</p><p>" + esc(S.db.shul.en) + " is a 501(c)(3) nonprofit organization. No goods or services were provided in exchange for these contributions.</p><p>With gratitude and blessings,<br>The Gabbaim</p></div><div class=\"actions\"><button class=\"btn\" id=\"pr\">" + L("הדפסה", "Print") + '</button><button class="btn primary" data-close>' + L("סגירה", "Close") + "</button></div>", { wide: true });
    md.querySelector("#pr").addEventListener("click", function () { window.print(); });
  }
})();
