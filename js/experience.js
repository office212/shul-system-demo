/* Shul System sales demo | the sales layer around the product.
   Shared helpers for the marketing pages (js/home.js) and the gabbai's drawer (js/drawer.js):
   live product frames, device chrome, and the shul-name and design control.
   Older addresses (the tour, the showcases, the screen showroom) lead to the matching place.
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

  /* ---------- older addresses: each leads to the matching place in the drawer or on the home page ---------- */
  [["/tour", "drawer"], ["/screen", "drawer?open=screen"], ["/showcase/ledger", "drawer?open=money"], ["/showcase/tv", "drawer?open=flyer"], ["/showcase/roles", "drawer?open=keys"], ["/showcase/design", "?to=looks"]].forEach(function (r) {
    UI.route(r[0], { layout: "xp", live: false, title: function () { return "Shul System"; }, render: function () { location.replace(location.pathname + location.search + "#/" + r[1]); } });
  });
})();
