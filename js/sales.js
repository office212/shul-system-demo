/* Kehillat Noam | trust and selling: the trust block and the founder's line, the
   onboarding band, the "moving from another system" section, the member-import wizard
   (#/import: a file, column mapping, a preview, then the members really join the demo),
   and the optional tour-video slot. No server: the file is read in the browser only. */
(function () {
  "use strict";
  var KN = window.KN, D = window.KN_DATA, S = KN.S, T = KN.T, L = KN.L, esc = KN.esc, ic = KN.ic, B = D.B;

  KN.mod({ id: "import", ic: "users", he: "ייבוא חברים מקובץ", en: "Import members from a file", dHe: "קובץ מהמערכת הישנה, התאמת עמודות, בדיקה, ייבוא.", dEn: "A file from the old system, column matching, a review, an import.", need: "staff" });

  /* ---------- landing blocks ---------- */
  KN.videoSection = function () {
    if (!D.sales.video) return "";
    return '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("סיור של 90 שניות", "A 90-second tour") + "</span><h2>" + T("כל המערכת, <em>בדקה וחצי</em>", "The whole system, <em>in a minute and a half</em>") + '</h2></div><div class="vid" data-rv><video controls preload="none" playsinline poster="assets/og.png" src="' + esc(D.sales.video) + '"></video></div></section>';
  };
  KN.trustSection = function () {
    var I = [["cloud", "גיבוי בכל לילה", "A backup every night", "הנתונים של הקהילה מגובים אוטומטית בכל לילה, ושחזור נעשה בלחיצה אחת.", "The community's data is backed up automatically every night, and a restore takes one click."],
      ["phone", "אדם עונה לכם", "A person answers you", "תמיכה בטלפון וב־WhatsApp, מאדם שמכיר את המערכת ואת העבודה של גבאי.", "Support by phone and WhatsApp, from a person who knows the system and a gabbai's work."],
      ["eye", "הדמו הוא ההוכחה", "The demo is the proof", "לא מצגת ולא סרטון: המערכת עצמה פתוחה כאן, בלי הרשמה. לחצו על הכול ושפטו בעצמכם.", "Not a slide deck and not a video: the system itself is open here, with no sign-up. Press everything and judge for yourselves."]];
    return '<section class="sx"><div class="sx-h" data-rv><span class="eyebrow">' + T("למה לסמוך על זה", "Why trust it") + "</span><h2>" + T("בלי הבטחות. <em>רק מה שאפשר לבדוק.</em>", "No promises. <em>Only what you can check.</em>") + '</h2></div><div class="trust">' + I.map(function (x, i) { return '<div class="tr" data-rv style="--d:' + i + '"><span class="tri">' + ic(x[0]) + "</span><h3>" + T(x[1], x[2]) + "</h3><p>" + T(x[3], x[4]) + "</p></div>"; }).join("") +
      '</div><div class="story" data-rv><div><span class="eyebrow">' + T("מי עומד מאחורי זה", "Who is behind it") + "</span><h3>" + T("נבנה על ידי גבאי, לבית הכנסת שלו.", "Built by a gabbai, for his own shul.") + "</h3><p>" + T("חנוך בנה את המערכת מתוך העבודה של גבאי: זמנים, נדרים, עליות, מקומות, מסך. אפשר לדבר איתו ישירות.", "Hanoch built the system out of a gabbai's own work: times, nedarim, aliyot, seats, the screen. You can talk to him directly.") + '</p></div><div class="cta-box talk-box">' + KN.contactBtns() + "</div></div></section>";
  };
  KN.onboardSection = function () {
    return '<section class="sx"><div class="onb" data-rv><div><span class="eyebrow">' + T("מעבר ממערכת אחרת", "Moving from another system") + "</span><h2>" + T("אנחנו מייבאים את החברים שלכם <em>ומדריכים את הגבאי שלכם.</em>", "We import your members <em>and train your gabbai.</em>") + "</h2><p>" + T("עובדים היום עם ShulCloud, עם אקסל או עם מחברת? אם יש לכם קובץ Excel או CSV של החברים, הוא נכנס למערכת עם היתרות והיארצייטים. נסו את זה עכשיו עם קובץ לדוגמה.", "On ShulCloud, on Excel or on a notebook today? If you have an Excel or CSV file of your members, it comes into the system with the balances and the yahrzeits. Try it now with a sample file.") + '</p><div class="row" style="margin-top:16px"><button class="btn gold lg" data-act="proGo" data-to="import">' + ic("users") + T("לנסות את אשף הייבוא", "Try the import wizard") + '</button><button class="btn ghost" data-act="csvTemplate">' + T("להוריד תבנית CSV", "Download the CSV template") + '</button></div></div><ol class="onb-s"><li><b>' + T("מייצאים קובץ", "Export a file") + "</b><span>" + T("רשימת החברים מהמערכת הנוכחית, או האקסל שלכם.", "The member list from your current system, or your own spreadsheet.") + "</span></li><li><b>" + T("מתאימים עמודות", "Match the columns") + "</b><span>" + T("שם, טלפון, יתרה, יארצייט. המערכת מזהה לבד, ואתם מאשרים.", "Name, phone, balance, yahrzeit. The system guesses, and you confirm.") + "</span></li><li><b>" + T("בודקים ומאשרים", "Review and confirm") + "</b><span>" + T("רואים את הרשימה לפני שמשהו נכנס. שום דבר לא נמחק.", "You see the list before anything goes in. Nothing is deleted.") + "</span></li></ol></div></section>";
  };

  /* ---------- the sample file (also the downloadable template) ---------- */
  var SAMPLE = ["שם משפחה,שם פרטי,טלפון,אימייל,יתרה פתוחה,יארצייט,תאריך יארצייט", "אלון,אבנר,(555) 010-2101,avner.alon@mail.demo,0,,", "בירנבאום,זאב,(555) 010-2102,zeev.birnbaum@mail.demo,180,חיה בת יוסף ז״ל,14 כסלו", "גבאי,אורי,(555) 010-2103,uri.gabay@mail.demo,0,,", "דרור,שגיא,(555) 010-2104,sagi.dror@mail.demo,600,,", "הרשקוביץ,נפתלי,(555) 010-2105,naftali.h@mail.demo,72,אברהם בן לאה ז״ל,3 טבת", "ועקנין,ליאור,(555) 010-2106,lior.v@mail.demo,0,,", "זכאי,אלעד,(555) 010-2107,elad.zakai@mail.demo,300,רחל בת שרה ז״ל,21 כסלו", "חיון,עידו,(555) 010-2108,ido.hayun@mail.demo,0,,"].join("\r\n");
  KN.act.csvTemplate = function () {
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + SAMPLE], { type: "text/csv;charset=utf-8" })); a.download = "members-template.csv"; document.body.appendChild(a); a.click(); a.remove();
    KN.toast(T("התבנית ירדה: members-template.csv", "Template downloaded: members-template.csv"));
  };
  function parseCsv(t) {
    var rows = [], row = [], cur = "", q = false; t = t.replace(/^﻿/, "");
    for (var i = 0; i < t.length; i++) { var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === "," || c === "\t" || c === ";") { row.push(cur); cur = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.some(function (x) { return x.trim(); })) rows.push(row); row = []; } else cur += c; }
    row.push(cur); if (row.some(function (x) { return x.trim(); })) rows.push(row);
    return rows;
  }
  var FIELDS = [["last", "שם משפחה", "Family name", /משפחה|last|family|surname/i], ["first", "שם פרטי", "First name", /פרטי|first|given/i], ["phone", "טלפון", "Phone", /טלפון|נייד|phone|mobile|cell/i], ["email", "אימייל", "Email", /מייל|דוא|mail/i], ["bal", "יתרה פתוחה", "Open balance", /יתרה|חוב|balance|owed|due/i], ["yz", "יארצייט (שם)", "Yahrzeit (name)", /^יארצייט$|yahrzeit$|נפטר|deceased/i], ["yzd", "יארצייט (תאריך עברי)", "Yahrzeit (Hebrew date)", /תאריך|date/i]];
  var im = { step: 1, file: "", head: [], rows: [], map: {} };
  function guess() { im.map = {}; FIELDS.forEach(function (f) { im.head.forEach(function (h, i) { if (im.map[f[0]] == null && f[3].test(h.trim())) im.map[f[0]] = i; }); if (im.map[f[0]] == null) im.map[f[0]] = -1; }); }
  function take(text, name) {
    var r = parseCsv(text); if (r.length < 2) { KN.toast(T("לא מצאתי שורות בקובץ. צריך שורת כותרות ולפחות חבר אחד.", "No rows found. The file needs a header row and at least one member.")); return; }
    im.file = name; im.head = r[0]; im.rows = r.slice(1, 400); guess(); im.step = 2; KN.render();
  }
  function recs() {
    var g = function (row, k) { var i = im.map[k]; return i >= 0 && row[i] != null ? String(row[i]).trim() : ""; };
    return im.rows.map(function (row) { var n = (g(row, "first") + " " + g(row, "last")).trim(); return { name: n, phone: g(row, "phone"), email: g(row, "email"), bal: Math.max(0, Number(g(row, "bal").replace(/[^\d.]/g, "")) || 0), yz: g(row, "yz"), yzd: g(row, "yzd") }; }).filter(function (x) { return x.name.length > 1; });
  }
  function hdate(s) { var m = /(\d{1,2})\s*ב?\s*([^\d\s]+)/.exec(s || ""); if (!m) return null; var mi = -1; D.HMONTHS.forEach(function (h, i) { if (h.he === m[2] || h.en.toLowerCase() === m[2].toLowerCase()) mi = i; }); return mi < 0 ? null : { d: Math.min(30, +m[1]), m: mi }; }
  function stepper() { var st = [T("קובץ", "File"), T("עמודות", "Columns"), T("בדיקה", "Review"), T("יובא", "Imported")]; return '<div class="row" style="gap:6px;margin-bottom:18px">' + st.map(function (s, i) { return '<span class="chip ' + (i + 1 < im.step ? "ok" : i + 1 === im.step ? "gold" : "") + '">' + (i + 1 < im.step ? ic("check") : (i + 1) + ".") + " " + s + "</span>"; }).join("") + "</div>"; }
  KN.views["import"] = { need: "staff",
    render: function () {
      var h = '<div class="page" style="max-width:980px"><div class="page-head"><div><span class="eyebrow">' + T("אשף הייבוא", "The import wizard") + "</span><h1>" + T("מביאים את החברים מהמערכת הישנה", "Bring your members from the old system") + '</h1><p class="lede">' + T("קובץ Excel שנשמר כ־CSV, מכל מערכת או מהאקסל שלכם. הקובץ נקרא בדפדפן שלכם בלבד ולא נשלח לשום מקום.", "An Excel file saved as CSV, from any system or your own spreadsheet. The file is read in your browser only and is sent nowhere.") + "</p></div></div>" + stepper();
      if (im.step === 1) return h + '<div class="card center imp-drop"><div class="big">' + ic("cloud") + "</div><h2>" + T("בחרו קובץ, או נסו עם קובץ לדוגמה", "Choose a file, or try a sample file") + '</h2><p class="lede" style="margin:8px auto 18px">' + T("עמודות מומלצות: שם משפחה, שם פרטי, טלפון, אימייל, יתרה פתוחה, יארצייט ותאריך היארצייט.", "Suggested columns: family name, first name, phone, email, open balance, yahrzeit and its date.") + '</p><div class="row" style="justify-content:center"><button class="btn gold lg" data-act="impSample">' + ic("spark") + T("לנסות עם קובץ לדוגמה", "Try with the sample file") + '</button><button class="btn sec lg" data-act="impPick">' + T("לבחור קובץ CSV", "Choose a CSV file") + '</button><button class="btn sec" data-act="csvTemplate">' + T("להוריד תבנית", "Download the template") + '</button></div><input type="file" id="impFile" accept=".csv,.tsv,.txt,text/csv" hidden data-on="impFile"></div>' + KN.foot() + "</div>";
      if (im.step === 2) return h + '<div class="card"><div class="card-h"><h2>' + T("איזו עמודה היא מה", "Which column is what") + '</h2><span class="chip">' + esc(im.file) + " · " + im.rows.length + " " + T("שורות", "rows") + '</span></div><p class="small muted">' + T("זיהיתי את העמודות לפי הכותרות. אפשר לתקן.", "I matched the columns by their headers. You can correct them.") + '</p><div class="imp-map">' + FIELDS.map(function (f) { return '<div class="field"><label for="im-' + f[0] + '">' + T(f[1], f[2]) + '</label><select class="input" id="im-' + f[0] + '" data-on="impMap" data-f="' + f[0] + '"><option value="-1">' + T("(אין עמודה כזאת)", "(no such column)") + "</option>" + im.head.map(function (c, i) { return '<option value="' + i + '"' + (im.map[f[0]] === i ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") + "</select></div>"; }).join("") + '</div><div class="row" style="margin-top:16px;justify-content:space-between"><button class="btn sec" data-act="impBack">' + T("חזרה", "Back") + '</button><button class="btn" data-act="impNext">' + T("להמשיך לבדיקה", "Continue to review") + " " + ic("arrow", "flip") + "</button></div></div>" + KN.foot() + "</div>";
      var R = recs(), tot = R.reduce(function (a, x) { return a + x.bal; }, 0), yz = R.filter(function (x) { return x.yz; }).length;
      if (im.step === 3) return h + '<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:18px"><div class="kpi"><div class="v">' + R.length + '</div><div class="k">' + T("חברים בקובץ", "Members in the file") + '</div></div><div class="kpi"><div class="v">' + KN.moneyT(tot) + '</div><div class="k">' + T("יתרות פתוחות", "Open balances") + '</div></div><div class="kpi"><div class="v">' + yz + '</div><div class="k">' + T("יארצייטים", "Yahrzeits") + '</div></div></div><div class="card"><div class="tw"><table class="t"><tr><th>' + T("שם", "Name") + "</th><th>" + T("טלפון", "Phone") + "</th><th>" + T("אימייל", "Email") + '</th><th style="text-align:end">' + T("יתרה", "Balance") + "</th><th>" + T("יארצייט", "Yahrzeit") + "</th></tr>" + R.map(function (x) { return "<tr><td><b>" + esc(x.name) + '</b></td><td class="num">' + esc(x.phone) + '</td><td><bdi class="ltr">' + esc(x.email) + '</bdi></td><td style="text-align:end">' + (x.bal ? '<span class="amt-pos">' + KN.money(x.bal) + "</span>" : '<span class="amt-zero">$0</span>') + "</td><td>" + (x.yz ? esc(x.yz) + (x.yzd ? " · " + esc(x.yzd) : "") : "") + "</td></tr>"; }).join("") + '</table></div><div class="row" style="margin-top:16px;justify-content:space-between"><button class="btn sec" data-act="impBack">' + T("חזרה לעמודות", "Back to columns") + '</button><button class="btn gold lg" data-act="impGo"' + (R.length ? "" : " disabled") + ">" + ic("check") + T("לייבא " + R.length + " חברים", "Import " + R.length + " members") + "</button></div></div>" + KN.foot() + "</div>";
      return h + '<div class="card center"><div class="okmark">' + ic("check") + "</div><h2>" + T(im.done + " חברים יובאו", im.done + " members imported") + '</h2><p class="lede" style="margin:8px auto 16px">' + T("הם ברשימת המתפללים, עם יתרת פתיחה לכל מי שהייתה לו יתרה, והיארצייטים יעלו למסך בשבוע שלהם.", "They are in the member list, with an opening balance for whoever had one, and the yahrzeits will reach the screen in their week.") + '</p><div class="row" style="justify-content:center"><button class="btn gold" data-act="impSee">' + ic("users") + T("לראות אותם ברשימה", "See them in the list") + '</button><button class="btn sec" data-act="impAgain">' + T("ייבוא נוסף", "Another import") + "</button></div></div>" + KN.foot() + "</div>";
    }
  };
  KN.act.impSample = function () { take(SAMPLE, "members-sample.csv"); };
  KN.act.impPick = function () { document.getElementById("impFile").click(); };
  KN.on.impFile = function (el) { var f = el.files && el.files[0]; if (!f) return; if (/\.xlsx?$/i.test(f.name)) { KN.toast(T("זה קובץ Excel. שמרו אותו כ־CSV (שמירה בשם, CSV) והעלו שוב.", "This is an Excel file. Save it as CSV (Save As, CSV) and upload again.")); return; } var r = new FileReader(); r.onload = function () { take(String(r.result), f.name); }; r.readAsText(f); };
  KN.on.impMap = function (el) { im.map[el.dataset.f] = +el.value; };
  KN.act.impBack = function () { im.step = Math.max(1, im.step - 1); KN.render(); };
  KN.act.impNext = function () { if (im.map.last < 0 && im.map.first < 0) { KN.toast(T("צריך לפחות עמודת שם", "At least a name column is needed")); return; } im.step = 3; KN.render(); };
  KN.act.impAgain = function () { im = { step: 1, file: "", head: [], rows: [], map: {} }; KN.render(); };
  KN.act.impGo = function () {
    var R = recs(), t = Date.now();
    R.forEach(function (x, i) {
      var m = { id: "m" + (t + i), name: B(x.name, x.name), email: x.email, phone: x.phone, since: 2026, status: "active", ledger: [], isNew: true };
      if (x.bal > 0) m.ledger.push({ id: "L" + (t + i), date: KN.todayIso(), type: "charge", amount: x.bal, desc: B("יתרת פתיחה (מהמערכת הקודמת)", "Opening balance (from the previous system)"), fresh: true });
      S.members.push(m);
      var hd = hdate(x.yzd); if (x.yz) S.yahrzeits.push({ id: "Y" + (t + i), name: B(x.yz, x.yz), rel: B("קרוב של " + x.name, "A relative of " + x.name), hDay: hd ? hd.d : 1, hMonth: hd ? hd.m : 2, memberId: m.id, status: "approved" });
    });
    im.done = R.length; im.last = R.length ? R[0].name.split(" ").pop() : ""; im.step = 4;
    KN.log("join", B("יובאו " + R.length + " חברים מקובץ " + im.file, R.length + " members imported from " + im.file)); KN.save(); KN.render(); if (KN.confetti) KN.confetti();
  };
  KN.act.impSee = function () { KN.setRole("finance", "finance/members"); setTimeout(function () { var q = document.getElementById("fq"); if (q) { q.value = T("חדש", "new"); q.value = ""; KN.on.fSearch(q); var n = document.querySelector("#fTable .chip.ok"); if (n) n.scrollIntoView({ block: "center" }); } }, 300); };
})();
