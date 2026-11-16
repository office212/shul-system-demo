/* Kehillat Noam | the customization panel (name, logo, colors, three ready themes: the
   whole demo re-skins at once, the TV included) and the guided tour (a week in the
   life of a shul, ten short stops). */
(function () {
  "use strict";
  var KN = window.KN, D = window.KN_DATA, S = KN.S, T = KN.T, esc = KN.esc, ic = KN.ic, B = D.B;

  /* ================= customize ================= */
  var deb;
  function reskin(full) { KN.applyTheme(); KN.save(); KN.renderBar(); if (full) { clearTimeout(deb); deb = setTimeout(KN.render, 220); } else KN.tvRefresh(); syncPanel(); }
  function syncPanel() {
    document.querySelectorAll(".theme").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.t === S.theme.id && !S.theme.custom)); });
    document.querySelectorAll(".logos button[data-l]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.l === S.shul.logo)); });
    var p = document.getElementById("czP"), a = document.getElementById("czA"); if (p) p.value = S.theme.p; if (a) a.value = S.theme.a;
  }
  KN.act.customize = function () {
    var up = /^data:/.test(S.shul.logo);
    KN.panel(ic("palette") + " " + T("התאמה אישית", "Customize"),
      '<p class="small muted">' + T("כל בית כנסת מקבל את המראה שלו. שנו כאן, וכל ההדגמה מתחלפת מיד, כולל מסך הטלוויזיה.", "Every shul gets its own look. Change it here and the whole demo follows at once, the TV screen included.") + "</p>" +
      '<div class="field"><label for="czHe">' + T("שם בית הכנסת (עברית)", "Synagogue name (Hebrew)") + '</label><input class="input" id="czHe" data-on="czName" value="' + esc(S.shul.nameHe) + '"></div><div class="field"><label for="czEn">' + T("שם בית הכנסת (אנגלית)", "Synagogue name (English)") + '</label><input class="input" id="czEn" dir="ltr" data-on="czName" value="' + esc(S.shul.nameEn) + '"></div>' +
      '<div><p class="lbl" style="margin-bottom:6px">' + T("לוגו", "Logo") + '</p><div class="logos">' + Object.keys(KN.MARKS).map(function (k) { return '<button data-act="czLogo" data-l="' + k + '" aria-pressed="' + (S.shul.logo === k) + '" aria-label="' + T("סמל ", "Mark ") + k + '"><svg viewBox="0 0 48 48" width="100%" height="100%">' + KN.MARKS[k] + "</svg></button>"; }).join("") + '<button class="up" data-act="czUpload" aria-pressed="' + up + '">' + T("העלאה", "Upload") + '</button></div><input type="file" id="czFile" accept="image/*" hidden data-on="czFile"><p class="small muted" style="margin-top:6px">' + T("הסמלים כאן הם דוגמאות גאומטריות. אפשר להעלות את הלוגו שלכם; הוא נשאר בדפדפן הזה בלבד.", "The marks here are geometric samples. Upload your own logo; it stays in this browser only.") + "</p></div>" +
      '<div><p class="lbl" style="margin-bottom:6px">' + T("ערכת עיצוב", "Theme") + '</p><div class="themes">' + KN.THEMES.map(function (t) { return '<button class="theme" data-act="czTheme" data-t="' + t.id + '" aria-pressed="' + (S.theme.id === t.id && !S.theme.custom) + '"><div class="sw"><i style="background:' + t.p + '"></i><i style="background:' + t.a + '"></i></div>' + T(t.he, t.en) + "</button>"; }).join("") + "</div></div>" +
      '<div><p class="lbl" style="margin-bottom:6px">' + T("או הצבעים שלכם", "Or your own colors") + '</p><div class="colors"><label><input type="color" id="czP" data-on="czColor" data-c="p" value="' + S.theme.p + '">' + T("צבע ראשי", "Main color") + '</label><label><input type="color" id="czA" data-on="czColor" data-c="a" value="' + S.theme.a + '">' + T("צבע מבליט", "Accent color") + "</label></div></div>" +
      '<button class="btn gold block" data-act="czTv">' + ic("tv") + T("לראות את זה על מסך הטלוויזיה", "See it on the TV") + '</button><div class="row"><button class="btn sm sec" data-act="czDefault">' + T("חזרה למראה המקורי", "Back to the original look") + '</button><button class="btn sm danger" data-act="stReset">' + T("איפוס כל ההדגמה", "Reset the whole demo") + "</button></div>");
  };
  KN.on.czName = function () { var he = document.getElementById("czHe").value, en = document.getElementById("czEn").value; S.shul.nameHe = he.trim() || D.shul.nameHe; S.shul.nameEn = en.trim() || D.shul.nameEn; reskin(true); };
  KN.act.czLogo = function (el) { S.shul.logo = el.dataset.l; reskin(true); KN.toast(T("הלוגו הוחלף בכל ההדגמה", "The logo changed across the demo")); };
  KN.act.czUpload = function () { document.getElementById("czFile").click(); };
  KN.on.czFile = function (el) {
    var f = el.files && el.files[0]; if (!f) return;
    if (!/^image\//.test(f.type) || f.size > 1500000) { KN.toast(T("בחרו קובץ תמונה עד 1.5MB", "Choose an image file up to 1.5MB")); return; }
    var r = new FileReader(); r.onload = function () { S.shul.logo = String(r.result); reskin(true); KN.toast(T("הלוגו שלכם מופיע עכשיו בכל ההדגמה", "Your logo now shows across the demo")); }; r.readAsDataURL(f);
  };
  KN.act.czTheme = function (el) { var t = KN.THEMES.filter(function (x) { return x.id === el.dataset.t; })[0]; S.theme = { id: t.id, p: t.p, a: t.a }; reskin(); KN.toast(T("ערכת העיצוב הוחלפה: ", "Theme changed: ") + T(t.he, t.en)); };
  KN.on.czColor = function (el) { S.theme[el.dataset.c] = el.value; S.theme.custom = true; reskin(); };
  KN.act.czTv = function () { KN.closePanel(); KN.go("tv"); KN.toast(T("המסך באותו מראה, בלי לגעת בו", "The screen wears the same look, untouched")); };
  KN.act.czDefault = function () { S.theme = { id: "classic", p: "#0e2c4c", a: "#b48e56" }; S.shul.nameHe = D.shul.nameHe; S.shul.nameEn = D.shul.nameEn; S.shul.logo = D.shul.logo; var he = document.getElementById("czHe"), en = document.getElementById("czEn"); if (he) he.value = S.shul.nameHe; if (en) en.value = S.shul.nameEn; reskin(true); KN.toast(T("חזרנו למראה המקורי", "Back to the original look")); };

  /* ================= the guided tour ================= */
  var STEPS = [
    { go: "landing", role: "visitor", clock: "friPM", spot: ".tvframe", t: B("ברוכים הבאים", "Welcome"), x: B("בית כנסת בדוי, מערכת אמיתית. בשלוש דקות תראו שבוע שלם בחיי בית כנסת.", "A fictional shul, a real system. In three minutes you will see a whole week in the life of a synagogue.") },
    { go: "times/edit", role: "content", clock: "friPM", spot: ".ed-row", t: B("יום שישי בבוקר", "Friday morning"), x: B("הגבאי קובע את זמני השבת. שינוי אחד כאן, והאתר, הטלפונים והמסך מתעדכנים יחד.", "The gabbai sets the Shabbat times. One change here, and the site, the phones and the screen update together.") },
    { go: "tv", clock: "friPM", spot: "#bigTv", t: B("יום שישי אחר הצהריים", "Friday afternoon"), x: B("המסך בבית הכנסת מציג הקדשות, יארצייט והודעות, וסופר לאחור להדלקת נרות.", "The shul screen shows dedications, yahrzeits and announcements, and counts down to candle lighting.") },
    { go: "tv", clock: "friSoon", spot: "#bigTv", t: B("הדלקת נרות", "Candle lighting"), x: B("הביטו במסך: בעוד כמה שניות הוא עובר לשבת מעצמו. אף אחד לא נוגע בכלום.", "Watch the screen: in a few seconds it switches to Shabbat by itself. Nobody touches anything.") },
    { go: "tv", clock: "shabAM", spot: "#bigTv", t: B("שבת בבוקר", "Shabbat morning"), x: B("המסך קבוע: שבת שלום, נרות, ההקדשות והיארצייט. בלי קוד תרומה ובלי תנועה.", "The screen is still: Shabbat Shalom, candles, the dedications and yahrzeits. No donation code, nothing moving.") },
    { go: "autopilot", role: "visitor", clock: "friPM", spot: ".ap", t: B("טייס אוטומטי לשבת", "Shabbat autopilot"), x: B("גררו את המחוון מיום שישי בצהריים עד מוצאי שבת: המסך עובר לשבת, ההודעות מוחזקות והתרומות מושהות. הכול מאותו שעון.", "Drag the slider from Friday noon to Saturday night: the screen enters Shabbat, messages are held and donations pause. All from the same clock.") },
    { go: "donate", role: "visitor", clock: "motzash", spot: "#dnSum", t: B("מוצאי שבת", "Saturday night"), x: B("אורח תורם מהטלפון. הוא מסמן שהוא מכסה את העמלה, והסכום מתעדכן מול העיניים.", "A guest donates from his phone. He ticks the fee cover and the total updates before his eyes.") },
    { go: "finance", role: "finance", clock: "motzash", spot: ".feed", pre: "donation", t: B("דקה אחר כך", "A minute later"), x: B("אצל גבאי הכספים התרומה כבר בספרים ובפעמון. אף אחד לא הקליד כלום.", "On the finance gabbai's desk the donation is already in the books and on the bell. Nobody typed anything.") },
    { go: "member", role: "member", clock: "motzash", spot: "#yzCard", t: B("המתפלל בבית", "The member at home"), x: B("יתרה, תשלום בכרטיס, והיארצייטים של המשפחה. הוא מוסיף יארצייט, והגבאי מאשר.", "Balance, card payment, and the family's yahrzeits. He adds a yahrzeit and the gabbai approves.") },
    { go: "admin/join", role: "admin", clock: "motzash", spot: ".req", t: B("המנהל", "The admin"), x: B("בקשת הצטרפות חדשה מאושרת בלחיצה, והמצטרף מקבל מייל ברוכים הבאים.", "A new join request is approved with one click, and the new member gets a welcome email.") },
    { go: "hq", role: "admin", clock: "motzash", spot: "#hqAsst", t: B("מרכז הפיקוד", "The command center"), x: B("העוזר החכם מראה למנהל מה דורש טיפול: חייבים, תשלום לא מזוהה, קידוש בלי חסות. כל דבר נפתר בלחיצה אחת.", "The smart assistant shows the admin what needs attention: open balances, an unmatched payment, a kiddush with no sponsor. Each is solved with one click.") },
    { go: "aliyot", role: "content", clock: "friPM", spot: ".al", t: B("לוח העליות", "The aliyot board") , x: B("שיבוץ אוטומטי: מי שיש לו יארצייט, בר מצווה או הולדת בת מקבל עלייה. במוצאי שבת הכול נרשם כנדרים.", "Auto-assign: whoever has a yahrzeit, a Bar Mitzvah or a new baby gets an aliyah. On Saturday night it all becomes nedarim.") },
    { go: "seats", role: "admin", clock: "friPM", spot: "#seatmap", t: B("מפת המקומות", "The seat map"), x: B("כל המקומות לימים הנוראים במבט אחד. לוחצים על מקום פנוי, מוכרים, והחיוב נרשם בחשבון המתפלל.", "Every High Holiday seat at a glance. Click a free seat, sell it, and the charge lands on the member's account.") },
    { go: "landing", role: "visitor", clock: "friPM", spot: ".tvframe", pre: "customize", t: B("ועכשיו: שלכם", "And now: yours"), x: B("שם, לוגו וצבעים משלכם. בחרו ערכת עיצוב בצד, וכל המערכת מתחלפת, כולל המסך.", "Your own name, logo and colors. Pick a theme at the side and the whole system changes, the screen included.") }
  ];
  var cur = -1;
  function sampleDonation() {
    if (S.lastDonation) return;
    var name = B("יונתן ברוך", "Jonathan Baruch"), ref = KN.nextRef(), rec = { id: "G" + Date.now(), date: KN.todayIso(), amount: 180, fee: 5.68, total: 185.68, donor: name, email: "jonathan.baruch@mail.demo", ref: ref, method: "card", fresh: true };
    S.donations.unshift(rec); S.lastDonation = rec;
    KN.log("pay", B("תרומה חדשה $180 · יונתן ברוך", "New donation $180 · Jonathan Baruch"));
    KN.notify({ kind: "payment", title: B("תרומה חדשה התקבלה", "New donation received"), body: B("יונתן ברוך תרם $180 · תרומה כללית · " + ref, "Jonathan Baruch donated $180 · General donation · " + ref), to: ["finance", "admin"] });
  }
  function spot() {
    document.querySelectorAll(".spot").forEach(function (e) { e.classList.remove("spot"); });
    if (cur < 0) return;
    var el = document.querySelector(STEPS[cur].spot); if (el) { el.classList.add("spot"); el.scrollIntoView({ block: "center", behavior: "smooth" }); }
  }
  function card() {
    var old = document.getElementById("tour"); if (old) old.remove(); if (cur < 0) return;
    var s = STEPS[cur], el = document.createElement("div"); el.className = "tour" + (/^tv/.test(s.go) ? " top" : ""); el.id = "tour"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", T("סיור מודרך", "Guided tour"));
    el.innerHTML = '<div class="step">' + T("סיור מודרך · תחנה ", "GUIDED TOUR · STOP ") + (cur + 1) + T(" מתוך ", " OF ") + STEPS.length + "</div><h3>" + esc(KN.L(s.t)) + "</h3><p>" + esc(KN.L(s.x)) + '</p><div class="bar2"><i style="width:' + ((cur + 1) / STEPS.length * 100) + '%"></i></div><div class="row"><button class="btn sm sec" data-act="tourEnd">' + T("יציאה מהסיור", "Exit the tour") + '</button><span class="row">' + (cur > 0 ? '<button class="btn sm sec" data-act="tourPrev">' + T("הקודם", "Back") + "</button>" : "") + '<button class="btn sm gold" data-act="tourNext">' + (cur === STEPS.length - 1 ? T("סיום", "Finish") : T("הבא", "Next")) + " " + ic("arrow") + "</button></span></div>";
    document.body.appendChild(el);
  }
  function show(i) {
    cur = i; var s = STEPS[i];
    KN.closeModal(); KN.closePanel();
    if (s.role) S.role = s.role;
    if (s.pre === "donation") sampleDonation();
    KN.setClock(s.clock, true); KN.save(); KN.renderBar();
    if (location.hash === "#/" + s.go) KN.render(); else location.hash = "#/" + s.go;
    card(); setTimeout(spot, 380);
    if (s.pre === "customize") setTimeout(function () { if (cur === i) { KN.act.customize(); card(); } }, 900);
  }
  KN.tourSync = function (relabel) { if (cur < 0) return; if (relabel) card(); setTimeout(spot, 300); };
  KN.act.tourStart = function () { show(0); };
  KN.act.tourNext = function () { if (cur >= STEPS.length - 1) { KN.act.tourEnd(null, null, true); return; } show(cur + 1); };
  KN.act.tourPrev = function () { if (cur > 0) show(cur - 1); };
  KN.act.tourEnd = function (el, ev, done) {
    cur = -1; card(); spot(); KN.closePanel();
    if (done) KN.modal('<div class="center"><div class="okmark" style="background:var(--a)">' + ic("star") + "</div><h2>" + T("זה הכול. עכשיו תורכם.", "That's the tour. Now it's your turn.") + '</h2><p class="lede" style="margin:8px auto 16px">' + T("המשיכו ללחוץ על הכול בעצמכם: החליפו תפקיד, תרמו, אשרו בקשות. וכשתרצו את המערכת לבית הכנסת שלכם:", "Keep pressing everything yourselves: switch roles, donate, approve requests. And when you want the system for your own shul:") + '</p><div class="cta-box talk-box">' + KN.contactBtns() + '</div><p class="row" style="margin-top:16px;justify-content:center"><button class="btn sec" data-go="included">' + T("מה כלול במערכת", "What's included") + '</button><button class="btn sec" data-act="demoReset">' + ic("refresh") + T("להתחיל את הדמו מחדש", "Start the demo over") + "</button></p></div>");
  };
})();
