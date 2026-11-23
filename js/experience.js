/* Shul System sales demo | the sales layer around the product.
   #/          the gabbai's drawer (js/drawer.js): the story, live previews, personalization, contact
   #/proposal  a personalized request for a demonstration and a subscription proposal
   Older addresses (the tour, the showcases, the screen showroom) lead to the matching place in the drawer.
   Everything shown is the real demo product running on fictional data. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, L = S.L, esc = S.esc, I = UI.I;
  /* The sales contact, verified by the owner. The proposal opens the visitor's own email app;
     the demo itself sends nothing. */
  var SALES = UI.SALES;
  function telBtn(cls) { return '<a class="xp-btn ' + (cls || "") + '" href="tel:' + SALES.tel + '">' + ic("phone", 17) + L("התקשרו ", "Call ") + '<bdi dir="ltr">' + esc(SALES.phone) + "</bdi></a>"; }
  function ic(n, s) { return I[n].replace("<svg", '<svg width="' + (s || 20) + '" height="' + (s || 20) + '"'); }
  var ARROW = '<svg class="arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- live product frames: the real demo running inside scaled windows ---------- */
  function frame(src, w, h, cls, label) {
    return '<div class="sf ' + (cls || "") + '" data-w="' + w + '" data-h="' + h + '" style="aspect-ratio:' + w + "/" + h + '"><iframe src="index.html' + src + '" title="' + esc(label || "") + '" tabindex="-1" aria-hidden="true" style="width:' + w + "px;height:" + h + 'px"></iframe></div>';
  }
  var ro = window.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (e) { fitOne(e.target); }); }) : null;
  function fitOne(el) { var f = el.querySelector("iframe"); if (!f) return; f.style.transform = "scale(" + el.clientWidth / +el.getAttribute("data-w") + ")"; }
  function fitFrames(root) { root.querySelectorAll(".sf").forEach(function (el) { fitOne(el); if (ro) ro.observe(el); }); }
  function browser(url, inner, cls) {
    return '<div class="win ' + (cls || "") + '"><div class="win-bar"><i></i><i></i><i></i><span dir="ltr">' + esc(url) + "</span></div>" + inner + "</div>";
  }
  function phone(inner, cls) { return '<div class="phone ' + (cls || "") + '"><div class="phone-notch"></div>' + inner + "</div>"; }
  function tvset(inner, cls) { return '<div class="tvset ' + (cls || "") + '"><div class="tvset-screen">' + inner + '</div><div class="tvset-stand"></div></div>'; }
  function slug() { return (S.db.shul.en || "shul").toLowerCase().replace(/[^a-z0-9]+/g, "") || "shul"; }

  function go(role, dest) { UI.setRole(role, true, dest); }

  /* ---------- personalization: name + design, reflected live everywhere ---------- */
  var sample = window.SHUL_SEED().shul;
  function personalHtml(compact) {
    var custom = S.db.shul.en !== sample.en;
    return '<div class="pz' + (compact ? " compact" : "") + '" id="pz"><div class="pz-row"><label class="pz-field"><span>' + L("שם בית הכנסת שלכם", "Your shul's name") + '</span><input id="pzName" maxlength="48" autocomplete="off" placeholder="' + L("לדוגמה: קהילת בית שלום", "e.g. Congregation Beth Shalom") + '" value="' + (custom ? esc(S.db.shul.en) : "") + '"></label></div>' +
      '<div class="pz-designs" role="group" aria-label="' + L("כיוון עיצובי", "Design direction") + '">' + UI.THEMES.map(function (t) { return '<button type="button" class="pz-d" data-pz-theme="' + t.id + '" aria-pressed="' + (S.prefs.theme === t.id) + '"><span class="pz-sw" style="background:' + t.c + '"></span><span>' + esc(S.N(t)) + "</span></button>"; }).join("") + "</div>" +
      '<div class="pz-foot"><span class="pz-live"><i></i>' + L("כל מסך מתעדכן בזמן אמת", "Every screen updates live") + '</span><button type="button" class="pz-reset" id="pzReset"' + (custom ? "" : " hidden") + ">" + L("חזרה לשם לדוגמה", "Back to the sample name") + "</button></div></div>";
  }
  function bindPersonal(root, onChange) {
    var inp = root.querySelector("#pzName"), t = null;
    function apply(v) {
      v = v.trim();
      S.db.shul.he = v || sample.he; S.db.shul.en = v || sample.en; S.save();
      var r = root.querySelector("#pzReset"); if (r) r.hidden = !v;
      if (onChange) onChange();
    }
    if (inp) inp.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { apply(inp.value); }, 260); });
    var rs = root.querySelector("#pzReset"); if (rs) rs.addEventListener("click", function () { inp.value = ""; apply(""); });
    root.querySelectorAll("[data-pz-theme]").forEach(function (b) {
      b.addEventListener("click", function () { UI.setTheme(b.getAttribute("data-pz-theme"), true); root.querySelectorAll("[data-pz-theme]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); if (onChange) onChange(); });
    });
  }

  window.SHUL_XP = { frame: frame, fitFrames: fitFrames, browser: browser, phone: phone, tvset: tvset, slug: slug, telBtn: telBtn, go: go, ic: ic, ARROW: ARROW, personalHtml: personalHtml, bindPersonal: bindPersonal };

  /* ---------- older addresses: one path now, so each leads into the drawer ---------- */
  [["/tour", ""], ["/screen", "?open=screen"], ["/showcase/ledger", "?open=money"], ["/showcase/tv", "?open=flyer"], ["/showcase/roles", "?open=keys"], ["/showcase/design", "?to=dwLooks"]].forEach(function (r) {
    UI.route(r[0], { layout: "xp", live: false, title: function () { return "Shul System"; }, render: function () { location.replace(location.pathname + location.search + "#/" + r[1]); } });
  });

  /* ---------- the proposal request ---------- */
  var INTEREST = [["site", "אתר בית הכנסת", "The shul website"], ["members", "פורטל מתפללים", "Member portal"], ["finance", "ניהול כספים ונדרים", "Finance and nedarim"], ["content", "תוכן וזמני תפילה", "Content and davening times"], ["tv", "המסך באולם", "The shul screen"], ["donate", "תרומות בכרטיס ובארנק דיגיטלי", "Card and wallet donations"]];
  UI.route("/proposal", {
    layout: "xp", live: false, title: function () { return L("בקשת הצעה", "Request a proposal"); },
    render: function (app) {
      var th = UI.THEMES.filter(function (t) { return t.id === S.prefs.theme; })[0], DW = window.SHUL_DW;
      app.innerHTML = '<div class="dw dw-page">' +
        '<div class="dw-desk">' + DW.top("proposal") + '<div class="dw-intro"><p class="dw-kick">' + L("בהתאמה אישית", "Made for you") + "</p><h1>" + L("נתאים אותה לבית הכנסת שלכם.", "We'll fit it to your shul.") + "</h1><p>" + L("ספרו לנו מעט על הקהילה. נכין הדגמה אישית בשם ובעיצוב שלכם, והצעה למנוי חודשי.", "Tell us a little about your community. We'll prepare a personal demo in your name and design, and a monthly subscription proposal.") + "</p></div></div>" +
        '<section class="dw-propw"><div class="dw-wrap dw-prop">' +
        '<form class="dw-letter" id="propF" novalidate><div class="dw-fgrid"><label class="dw-f"><span>' + L("שם מלא", "Full name") + '</span><input name="name" required autocomplete="name"></label><label class="dw-f"><span>' + L("תפקיד בבית הכנסת", "Role at the shul") + '</span><select name="role"><option>' + L("גבאי", "Gabbai") + "</option><option>" + L("נשיא", "President") + "</option><option>" + L("רב", "Rabbi") + "</option><option>" + L("חבר הנהלה", "Board member") + "</option><option>" + L("אחר", "Other") + '</option></select></label><label class="dw-f"><span>' + L("אימייל", "Email") + '</span><input name="email" type="email" dir="ltr" required autocomplete="email"></label><label class="dw-f"><span>' + L("טלפון", "Phone") + '</span><input name="phone" type="tel" dir="ltr" autocomplete="tel"></label></div>' +
        '<label class="dw-f"><span>' + L("שם בית הכנסת", "Shul name") + '</span><input name="shul" value="' + esc(S.N(S.db.shul)) + '"></label><fieldset class="dw-f dw-ints"><legend>' + L("מה חשוב לכם", "What matters to you") + "</legend><div>" + INTEREST.map(function (x, i) { return '<label class="dw-chk"><input type="checkbox" name="int" value="' + i + '"' + (i < 4 ? " checked" : "") + "><span>" + L(x[1], x[2]) + "</span></label>"; }).join("") + '</div></fieldset><label class="dw-f"><span>' + L("הערות (לא חובה)", "Notes (optional)") + '</span><textarea name="notes" rows="3"></textarea></label>' +
        '<button class="dw-btn wide">' + L("שליחת הבקשה באימייל", "Send the request by email") + '</button><p class="dw-small">' + L("הבקשה נפתחת באפליקציית האימייל שלכם, מוכנה לשליחה אל ", "The request opens in your email app, ready to send to ") + '<bdi dir="ltr">' + esc(SALES.email) + "</bdi>" + L(". ההדגמה עצמה לא שולחת דבר.", ". The demo itself sends nothing.") + '</p><div id="propOut"></div></form>' +
        '<aside class="dw-side"><div class="dw-bcard"><span class="bc-logo">' + UI.logo() + '</span><b>Shul System</b><span class="bc-line">' + L("מערכת לניהול בית הכנסת", "Software for running a shul") + '</span><a href="tel:' + SALES.tel + '"><bdi dir="ltr">' + esc(SALES.phone) + '</bdi></a><a href="mailto:' + SALES.email + '"><bdi dir="ltr">' + esc(SALES.email) + "</bdi></a></div>" +
        '<div class="dw-yours"><small>' + L("ההדגמה שלכם", "Your demo") + "</small><b>" + esc(S.N(S.db.shul)) + '</b><span><i class="dw-sw" style="background:' + th.c + '"></i>' + esc(S.N(th)) + " · " + L("עברית ואנגלית", "English and Hebrew") + '</span><a href="#/?to=dwLooks">' + L("לשנות שם ועיצוב", "Change the name and design") + "</a></div></aside></div></section></div>";
      DW.bindTop(app);
      app.querySelector("#propF").addEventListener("submit", function (e) {
        e.preventDefault(); var f = e.target;
        if (!f.name.value.trim() || !/^\S+@\S+\.\S+$/.test(f.email.value.trim())) { UI.toast(L("נא למלא שם ואימייל", "Please fill in name and email")); return; }
        var ints = Array.prototype.slice.call(f.querySelectorAll("[name=int]:checked")).map(function (c) { return INTEREST[+c.value][2]; });
        var txt = "Shul System: request for a personal demonstration and subscription proposal\n\nShul: " + f.shul.value.trim() + "\nContact: " + f.name.value.trim() + " (" + f.role.value + ")\nEmail: " + f.email.value.trim() + (f.phone.value.trim() ? "\nPhone: " + f.phone.value.trim() : "") +
          "\nDesign direction: " + th.en + (S.prefs.brand ? ", brand color " + S.prefs.brand : "") + "\nInterested in: " + (ints.join(", ") || "Not specified") + (f.notes.value.trim() ? "\nNotes: " + f.notes.value.trim() : "");
        var out = app.querySelector("#propOut");
        var mail = "mailto:" + SALES.email + "?subject=" + encodeURIComponent("Proposal request: " + f.shul.value.trim()) + "&body=" + encodeURIComponent(txt);
        out.innerHTML = '<div class="dw-done"><b>' + L("הבקשה מוכנה", "Your request is ready") + '</b><pre dir="ltr">' + esc(txt) + '</pre><div class="dw-btns"><a class="dw-btn" id="propMail" href="' + esc(mail) + '">' + ic("mail", 16) + L("פתיחה באימייל", "Open in email") + '</a><button type="button" class="dw-btn ghost" id="propCopy">' + ic("doc", 16) + L("העתקה", "Copy") + '</button></div><p class="dw-small">' + L("לא נפתח אימייל? העתיקו ושלחו אל ", "No email app opened? Copy it and send it to ") + '<bdi dir="ltr">' + esc(SALES.email) + "</bdi>" + L(", או התקשרו ", ", or call ") + '<bdi dir="ltr">' + esc(SALES.phone) + "</bdi>.</p></div>";
        location.href = mail;
        out.querySelector("#propCopy").addEventListener("click", function () {
          var done = function () { UI.toast(L("הועתק", "Copied")); };
          if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () { selectPre(); }); else selectPre();
          function selectPre() { var r = document.createRange(); r.selectNodeContents(out.querySelector("pre")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); UI.toast(L("הטקסט סומן. העתיקו אותו.", "Text selected. Copy it.")); }
        });
        out.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      });
    }
  });
})();
