/* Kehillat Noam | the shell around every page: the contact button that never sits on
   content, the phone's bottom bar, back-to-top, a visible "restart the demo", the nav's
   scroll hint, the contact sheet (WhatsApp, phone, email, a call-back request) and the
   sample emails on the notifications page. */
(function () {
  "use strict";
  var KN = window.KN, D = window.KN_DATA, S = KN.S, T = KN.T, L = KN.L, esc = KN.esc, ic = KN.ic;
  function custom() { return S.shul.nameHe !== D.shul.nameHe || S.shul.nameEn !== D.shul.nameEn; }
  var WA = "https://wa.me/" + D.sales.tel.replace(/\D/g, "");
  KN.waLink = function (text) { return WA + "?text=" + encodeURIComponent(text || T("ראיתי את הדמו לבית הכנסת שלנו", "I saw the demo for our synagogue") + (custom() ? " (" + KN.shulName() + ")" : "")); };
  KN.mailLink = function (body) { return "mailto:" + D.sales.email + "?subject=" + encodeURIComponent(T("מערכת לבית הכנסת", "A system for our synagogue") + (custom() ? " · " + KN.shulName() : "")) + (body ? "&body=" + encodeURIComponent(body) : ""); };
  /* the three ways to reach us, used by the closing call, the tour's end and the contact sheet */
  KN.contactBtns = function () {
    return '<a class="wa" href="' + KN.waLink() + '" target="_blank" rel="noopener">' + ic("wa") + "<span>WhatsApp</span></a><a href=\"tel:" + D.sales.tel + '">' + ic("phone") + '<bdi class="ltr">' + D.sales.phone + '</bdi></a><a class="alt" href="' + KN.mailLink() + '">' + ic("mail") + '<bdi class="ltr">' + D.sales.email + "</bdi></a>";
  };
  KN.act.talk = function () {
    KN.modal('<div class="talk"><h2>' + T("בואו נדבר", "Let's talk") + '</h2><p class="lede" style="margin:6px auto 0">' + T("בלי התחייבות. נראה לכם איך המערכת נראית עם השם והצבעים שלכם.", "No commitment. We will show you how the system looks with your name and colors.") + '</p><div class="cta-box talk-box">' + KN.contactBtns() + '</div><div class="cb"><h3>' + T("או בקשו שנחזור אליכם", "Or ask us to call you back") + '</h3><div class="grid g2"><div class="field"><label for="cbName">' + T("שם", "Name") + '</label><input class="input" id="cbName" autocomplete="name"></div><div class="field"><label for="cbShul">' + T("בית הכנסת", "Synagogue") + '</label><input class="input" id="cbShul" value="' + (custom() ? esc(KN.shulName()) : "") + '"></div><div class="field"><label for="cbPhone">' + T("טלפון", "Phone") + '</label><input class="input num" id="cbPhone" inputmode="tel" autocomplete="tel"></div><div class="field"><label for="cbSize">' + T("כמה מתפללים, בערך", "About how many members") + '</label><input class="input num" id="cbSize" inputmode="numeric"></div></div><div class="row" style="margin-top:12px"><button class="btn" data-act="cbSend" data-via="wa">' + ic("wa") + T("לשלוח ב־WhatsApp", "Send by WhatsApp") + '</button><button class="btn sec" data-act="cbSend" data-via="mail">' + ic("mail") + T("לשלוח במייל", "Send by email") + '</button></div><p class="small muted" style="margin-top:8px">' + T("הדמו לא שומר ולא שולח כלום בעצמו: הכפתור פותח הודעה מוכנה אצלכם, ואתם שולחים.", "The demo stores and sends nothing by itself: the button opens a ready message on your side, and you send it.") + "</p></div></div>", true);
  };
  KN.act.cbSend = function (el) {
    var v = function (id) { return document.getElementById(id).value.trim(); }, name = v("cbName"), phone = v("cbPhone");
    if (name.length < 2 || phone.replace(/\D/g, "").length < 7) { KN.toast(T("כתבו שם וטלפון", "Enter a name and a phone")); return; }
    var txt = T("ראיתי את הדמו לבית הכנסת שלנו ואשמח לשיחה.", "I saw the demo for our synagogue and would like a call.") + "\n" + T("שם: ", "Name: ") + name + "\n" + T("בית הכנסת: ", "Synagogue: ") + (v("cbShul") || "-") + "\n" + T("טלפון: ", "Phone: ") + phone + "\n" + T("מספר מתפללים משוער: ", "Approximate members: ") + (v("cbSize") || "-");
    window.open(el.dataset.via === "wa" ? KN.waLink(txt) : KN.mailLink(txt), "_blank", "noopener");
  };
  KN.act.demoReset = function () { KN.reset(); };
  KN.act.toTop = function () { window.scrollTo({ top: 0, behavior: "smooth" }); };

  /* ---------- fixed chrome ---------- */
  var miniT;
  function chrome() {
    var r = KN.route().name, f = document.getElementById("fab");
    if (f) { f.classList.toggle("off", r === "tv" || r === "kiosk"); f.classList.toggle("opp", r === "donate"); clearTimeout(miniT); if (r === "landing") { f.classList.remove("mini"); miniT = setTimeout(function () { f.classList.add("mini"); }, 5000); } else f.classList.add("mini"); }
    var b = document.getElementById("bnav");
    if (!b) { b = document.createElement("nav"); b.id = "bnav"; b.className = "bnav no-print"; document.body.appendChild(b); }
    b.setAttribute("aria-label", T("קיצורים", "Shortcuts"));
    b.innerHTML = [["tourStart", "", "play", "סיור", "Tour"], ["", "included", "list", "מה כלול", "Included"], ["proGo", "hq", "grid", "פיקוד", "Command"], ["", "tv", "tv", "המסך", "Screen"], ["", "donate", "heart", "תרומה", "Donate"], ["talk", "", "phone", "דברו איתנו", "Talk"]].map(function (x) {
      return "<button " + (x[0] ? 'data-act="' + x[0] + '"' + (x[1] ? ' data-to="' + x[1] + '"' : "") : 'data-go="' + x[1] + '"') + (x[1] === r ? ' aria-current="page"' : "") + (x[0] === "talk" ? ' class="gold"' : "") + ">" + ic(x[2]) + "<span>" + T(x[3], x[4]) + "</span></button>"; }).join("");
    var t = document.getElementById("totop");
    if (!t) { t = document.createElement("button"); t.id = "totop"; t.className = "totop no-print"; t.setAttribute("data-act", "toTop"); t.innerHTML = ic("up"); document.body.appendChild(t); }
    t.setAttribute("aria-label", T("חזרה למעלה", "Back to top"));
    var tools = document.querySelector(".bar-tools");
    if (tools && !tools.querySelector(".rs-b")) tools.insertAdjacentHTML("beforeend", '<button class="tb rs-b" data-act="demoReset" title="' + T("הפעל מחדש את הדמו", "Restart the demo") + '" aria-label="' + T("הפעל מחדש את הדמו", "Restart the demo") + '">' + ic("refresh") + '<span class="w">' + T("הפעל מחדש", "Restart") + "</span></button>");
    var nav = document.querySelector(".nav"); if (nav && !nav._hint) { nav._hint = 1; nav.addEventListener("scroll", navHint, { passive: true }); } navHint(); onScroll();
  }
  function navHint() { var n = document.querySelector(".nav"), bar = document.getElementById("bar"); if (!n) return; var max = n.scrollWidth - n.clientWidth, pos = Math.abs(n.scrollLeft); bar.classList.toggle("nf-s", pos > 6); bar.classList.toggle("nf-e", max - pos > 6); }
  function onScroll() { var t = document.getElementById("totop"); if (t) t.classList.toggle("show", window.scrollY > 700); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", navHint);
  window.addEventListener("hashchange", function () { setTimeout(chrome, 0); });
  var bar0 = KN.renderBar; KN.renderBar = function () { bar0(); chrome(); };

  /* ---------- notifications page: the emails the system sends ---------- */
  var nv = KN.views.notifications, nr = nv.render;
  nv.render = function () {
    var h = nr.apply(nv, arguments), M = [["receipt", "קבלה למס אחרי תרומה", "A tax receipt after a donation", "נשלחת לתורם ברגע התשלום.", "Sent to the donor the moment he pays."], ["welcome", "ברוכים הבאים למתפלל חדש", "A welcome to a new member", "נשלח אחרי שהמנהל מאשר את ההצטרפות.", "Sent once the admin approves the request."]],
      card = '<div class="card" style="margin-top:20px"><div class="card-h"><h2>' + T("והמיילים", "And the emails") + '</h2><span class="chip">' + T("בשתי השפות, עם השם והלוגו שלכם", "In both languages, with your name and logo") + '</span></div><div class="grid g2">' + M.map(function (m) { return '<div class="mailcard"><span class="fi">' + ic("mail") + "</span><div><b>" + T(m[1], m[2]) + "</b><span>" + T(m[3], m[4]) + '</span></div><button class="btn sm sec" data-act="mailSample" data-k="' + m[0] + '">' + T("לראות דוגמה", "See a sample") + "</button></div>"; }).join("") + "</div></div>", k = h.lastIndexOf('<p class="center small muted"');
    return k > 0 ? h.slice(0, k) + card + h.slice(k) : h + card;
  };
  KN.act.mailSample = function (el) { if (el.dataset.k === "receipt") KN.act.receiptMail({ dataset: { id: (S.donations[0] || {}).id } }); else KN.act.welcomeMail({ dataset: { id: "m1" } }); };
})();
