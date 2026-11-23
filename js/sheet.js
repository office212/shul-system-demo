/* Shul system sales demo | the Shabbat bulletin: times source and the printable page. */
(function () {
  "use strict";
  var S = window.SHUL, esc = S.esc;
  function sourceTime(r) {
    var st = S.shabbatTimes(), sat = S.zmanim(S.weekDate(6)), src = r.src || "manual";
    if (src === "candles") return st.candles;
    if (src === "friShkiah") return st.friShkiah;
    if (src === "satShkiah") return st.satShkiah;
    if (src === "ends") return st.ends;
    if (src === "rt") return st.rt;
    if (src === "endsMinus3") return st.ends - 3;
    if (src.indexOf("zman:") === 0) return sat[src.slice(5)];
    if (src.indexOf("prayer:") === 0) {
      var p = S.db.prayers.filter(function (x) { return x.id === src.slice(7); })[0];
      return p ? window.SHUL_TV.prayerTime(p) : null;
    }
    return r.time != null ? r.time : null;
  }
  function rowTime(r) {
    var o = S.db.sheet.overrides[r.id];
    if (o != null) return o;
    if (r.every != null) return r.every;
    return sourceTime(r);
  }
  function srcLabel(r) {
    var src = r.src || "manual", L = S.L;
    if (src === "manual") return L("זמן שהוקלד", "Typed time");
    if (src.indexOf("prayer:") === 0) return L("מזמני התפילה", "From davening times");
    if (src === "endsMinus3") return L("מוצע לפי צאת שבת", "Suggested from Shabbat ends");
    return L("מזמני היום", "From the zmanim");
  }
  function pageHtml(opts) {
    opts = opts || {};
    var sh = S.db.sheet, st = S.shabbatTimes();
    var day = function (d, he, en) {
      var rows = sh.rows.filter(function (r) { return r.day === d && !r.hidden; });
      return '<div class="sh-day"><span>' + he + "</span><span>" + en + "</span></div>" + rows.map(function (r) {
        var t = rowTime(r);
        return '<div class="sh-row ' + (r.star ? "star" : "") + '"' + (r.size ? ' style="font-size:' + (2.75 + r.size * .3) + 'cqw"' : "") + '><span>' + esc(r.he) + '<span class="en">' + esc(r.en) + "</span></span><b>" + (t == null ? "" : S.hm(t, false)) + "</b></div>";
      }).join("");
    };
    return '<div class="sheet-wrap"><div class="sheet-page ' + (opts.clean ? "clean " : "") + (opts.print ? "print-area" : "") + '"><div class="sh-top">' + window.SHUL_UI.logo().replace("<svg", '<svg style="color:#0e2c4c"') +
      '<div class="sh-shul">' + esc(S.db.shul.he) + " · " + esc(S.db.shul.en) + '</div><div class="sh-title">' + esc(sh.title.he) + '</div>' + (sh.title.en ? '<div class="sh-title-en">' + esc(sh.title.en) + "</div>" : "") + '<div class="sh-par">פרשת ' + S.PARASHA.he + " · י״א כסלו תשפ״ז<br><bdi dir=\"ltr\">Parashat " + S.PARASHA.en + " · November 21, 2026</bdi></div></div>" +
      day("fri", "ערב שבת · יום שישי", "Friday, Nov 20") + day("sat", "שבת קודש", "Shabbat, Nov 21") +
      '<div class="sh-daf">דף יומי בשבת: ' + S.daf(S.weekDate(6), "he") + ' · <bdi dir="ltr">Daf Yomi: ' + S.daf(S.weekDate(6), "en") + "</bdi></div>" +
      '<div class="sh-note">' + esc(sh.note.he) + "<br>" + esc(sh.note.en) + "</div></div></div>";
  }
  window.SHUL_SHEET = { rowTime: rowTime, sourceTime: sourceTime, srcLabel: srcLabel, pageHtml: pageHtml };
})();
