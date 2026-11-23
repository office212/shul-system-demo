/* Shul system sales demo | public pages: landing, davening times, donate, thanks, join. */
(function () {
  "use strict";
  var S = window.SHUL, UI = window.SHUL_UI, L = S.L, esc = S.esc, I = UI.I;

  /* every word of the landing page; the super admin edits them in #/gabbai/landing */
  var HOME_TEXTS = {
    heroTitle: { he: "קהילה של תורה, תפילה וחסד", en: "A Community of Torah, Tefillah and Chessed" },
    heroLead: { he: "ברוכים הבאים לבית הכנסת שלנו. זמני התפילה, זמני היום והשבת הקרובה, תרומה מאובטחת וחשבון אישי לכל מתפלל, הכל במקום אחד.", en: "Welcome to our shul. Davening times, daily zmanim and this coming Shabbat, secure donations and a personal account for every member, all in one place." },
    aboutTitle: { he: "על הקהילה", en: "About Our Kehilla" },
    aboutLead: { he: "בית כנסת חם ומשפחתי, שבו כל אחד מתקבל בחיוך. תפילות במניין קבוע, שיעורי תורה לכל הרמות ופעילות לכל המשפחה.", en: "A warm, family shul where everyone is welcomed with a smile. Regular minyanim, Torah shiurim for every level and programs for the whole family." },
    card1T: { he: "תפילה", en: "Tefillah" }, card1: { he: "מניינים קבועים בכל יום, בחול, בשבת ובחגים, בזמנים שמופיעים תמיד מעודכנים באתר ובמסך.", en: "Regular minyanim every day, weekdays, Shabbat and Yom Tov, at times that are always up to date on the site and the screen." },
    card2T: { he: "תורה", en: "Torah" }, card2: { he: "דף יומי, שיעור בפרשת השבוע וחברותות לכל הגילאים, בבית המדרש שלנו.", en: "Daf Yomi, a weekly Parasha shiur and chavrutot for all ages in our Beit Midrash." },
    card3T: { he: "קהילה", en: "Community" }, card3: { he: "שמחות, קידושים, מלווה מלכה ועזרה הדדית. כאן כולם משפחה אחת.", en: "Simchas, kiddushim, Melave Malka and helping one another. Here everyone is one family." },
    closing: { he: "מקום שבו התפילה מחברת והלב מוצא בית.", en: "A place where tefillah connects and the heart finds a home." }
  };
  function HT(k) { var o = (S.db.homeTexts || {})[k] || {}; var v = o[S.prefs.lang]; return (v && String(v).trim()) || S.N(HOME_TEXTS[k]); }

  function shabbatCard() {
    var st = S.shabbatTimes();
    return '<div class="timecard"><div class="eyebrow">' + L("השבת הקרובה", "This coming Shabbat") + "</div><h3 style=\"margin:4px 0 2px\">" + L("פרשת " + S.PARASHA.he, "Parashat " + S.PARASHA.en) + '</h3><div class="muted small">' + L("י״א כסלו תשפ״ז · 21 בנובמבר", "11 Kislev 5787 · November 21") + "</div>" +
      '<div class="big"><div class="muted small">' + L("הדלקת נרות, יום שישי", "Candle lighting, Friday") + '</div><div class="v num">' + S.hm(st.candles, true) + "</div></div>" +
      '<div class="tline"><span>' + L("צאת השבת", "Shabbat ends") + '</span><b class="num">' + S.hm(st.ends, true) + '</b></div><div class="tline"><span>' + L("רבינו תם", "Rabbeinu Tam") + '</span><b class="num">' + S.hm(st.rt, true) + "</b></div>" +
      '<a class="btn soft block" style="margin-top:12px" href="#/times">' + L("לכל זמני התפילה וזמני היום", "All davening times and zmanim") + "</a></div>";
  }
  UI.route("/site", {
    title: function () { return S.N(S.db.shul); },
    render: function (app) {
      var r = S.role(), z = S.zmanim(S.now());
      var quick = [
        ["#/tv", I.tv, L("המסך", "Screen"), L("המסך שדולק כל הזמן בבית הכנסת", "The always-on screen in the shul")],
        ["#/times", I.clock, L("זמני תפילה", "Davening Times"), L("זמני היום, שבת והדלקת נרות", "Zmanim, Shabbat and candle lighting")],
        ["#/donate", I.heart, L("תרומה", "Donate"), L("כרטיס, Apple Pay או Google Pay", "Card, Apple Pay or Google Pay")]
      ];
      if (r === "visitor" || r === "applicant") quick.push(["#/join", I.users, L("הצטרפות לקהילה", "Join the Community"), L("בקשה קצרה, והגבאי מאשר", "A short request, the gabbai approves")]);
      else quick.push(["#/me", I.user, L("החשבון שלי", "My Account"), L("יתרה, תשלומים ויארצייטים", "Balance, payments and yahrzeits")]);
      if (r === "finance" || r === "content" || r === "super") quick.push(["#/gabbai", I.gear, L("מערכת הגבאים", "Gabbai System"), L("ניהול הכל במקום אחד", "Manage everything in one place")]);
      app.innerHTML =
        '<section class="hero"><div class="wrap"><div><div class="eyebrow">' + esc(L(S.db.shul.he, S.db.shul.en.toUpperCase())) + " · " + esc(L(S.db.shul.cityHe, S.db.shul.cityEn.toUpperCase())) + "</div><h1>" + esc(HT("heroTitle")) + '</h1><p class="lead">' + esc(HT("heroLead")) + "</p>" +
        '<div class="row" style="margin-top:22px"><a class="btn primary lg" href="#/times">' + I.clock.replace("<svg", '<svg width="20" height="20"') + L("זמני תפילה וזמני היום", "Davening Times and Zmanim") + '</a><a class="btn lg" href="#/donate">' + L("תרמו עכשיו", "Donate Now") + '</a><button class="btn ghost lg" id="navBtn">' + L("ניווט לבית הכנסת", "Directions") + "</button></div>" +
        '<div class="row small hero-meta" style="margin-top:18px"><span>' + esc(S.hebDate(S.now())) + " · " + esc(S.fmtDateLong(S.now())) + "</span><span>·</span><span>" + L("נץ החמה ", "Netz ") + '<b class="num">' + S.hm(z.netz, true) + "</b></span><span>" + L("שקיעה ", "Shkiah ") + '<b class="num">' + S.hm(z.shkiah, true) + "</b></span></div></div>" +
        shabbatCard() + "</div></section>" +

        '<section class="section" style="padding-top:0"><div class="wrap"><div class="grid g4">' + quick.map(function (q) { return '<a class="tile" href="' + q[0] + '"><div class="ic">' + q[1] + "</div><div><b>" + q[2] + "</b><span>" + q[3] + "</span></div></a>"; }).join("") + "</div></div></section>" +
        '<section class="section" id="about" style="background:var(--surface-2);border-block:1px solid var(--line)"><div class="wrap"><div class="section-title"><div class="eyebrow">' + L("אודות", "About") + "</div><h2>" + esc(HT("aboutTitle")) + '</h2><p class="muted" style="max-width:640px;margin:0 auto">' + esc(HT("aboutLead")) + '</p></div><div class="grid g3">' +
        [1, 2, 3].map(function (i) { return '<div class="card"><h3>' + esc(HT("card" + i + "T")) + '</h3><p class="muted" style="margin:0">' + esc(HT("card" + i)) + "</p></div>"; }).join("") +
        '</div><p class="display" style="text-align:center;font-size:22px;margin-top:26px;color:var(--gold)">' + esc(HT("closing")) + "</p></div></section>" +
        '<section class="section" id="contact" style="border-top:1px solid var(--line)"><div class="wrap grid g2"><div><div class="eyebrow">' + L("נשמח לשמוע", "We'd love to hear from you") + "</div><h2>" + L("צור קשר", "Contact") + '</h2><div class="stack" style="margin-top:14px">' +
        '<div class="row">' + I.phone.replace("<svg", '<svg width="20" height="20"') + '<span class="num">' + esc(S.db.shul.phone) + "</span></div>" +
        '<div class="row">' + I.mail.replace("<svg", '<svg width="20" height="20"') + '<span class="num">' + esc(S.db.shul.email) + "</span></div>" +
        '<div class="row">' + I.map.replace("<svg", '<svg width="20" height="20"') + '<span dir="ltr">' + esc(S.db.shul.address) + "</span></div></div>" +
        '<div class="card flat" style="margin-top:16px;padding:0;overflow:hidden">' + mapArt() + '<div class="row" style="padding:12px"><button class="btn sm" data-nav="google">' + L("ניווט עם Google Maps", "Navigate with Google Maps") + '</button><button class="btn sm" data-nav="waze">' + L("ניווט עם Waze", "Navigate with Waze") + "</button></div></div></div>" +
        '<form class="card" id="contactForm"><h3>' + L("שלחו לנו הודעה", "Send us a message") + '</h3><div class="form-grid"><label class="field"><span>' + L("שם *", "Name *") + '</span><input name="name" required></label><label class="field"><span>' + L("טלפון *", "Phone *") + '</span><input name="phone" required inputmode="tel"></label></div>' +
        '<label class="field" style="margin-top:12px"><span>' + L("אימייל (לא חובה)", "Email (optional)") + '</span><input name="email" type="email"></label><label class="field" style="margin-top:12px"><span>' + L("הודעה *", "Message *") + '</span><textarea name="msg" required></textarea></label><button class="btn primary" style="margin-top:12px">' + L("שליחה", "Send") + "</button></form></div></section>";

      var navM = function (kind) {
        UI.modal("<h2>" + L("ניווט לבית הכנסת", "Directions to the shul") + "</h2><p>" + L("באתר האמיתי הכפתור פותח את ", "On the real site this button opens ") + (kind === "waze" ? "Waze" : "Google Maps") + L(" עם הכתובת של בית הכנסת, מוכן לנסיעה.", " with the shul's address, ready to go.") + '</p><p class="muted small">' + L("בהדגמה הכתובת בדויה, ולכן לא נפתחת מפה חיצונית.", "In the demo the address is fictional, so no outside map opens.") + '</p><div class="actions"><button class="btn primary" data-close>' + L("סגירה", "Close") + "</button></div>");
      };
      app.querySelector("#navBtn").addEventListener("click", function () { navM("google"); });
      UI.on(app, "[data-nav]", "click", function (e, b) { navM(b.getAttribute("data-nav")); });
      app.querySelector("#contactForm").addEventListener("submit", function (e) {
        e.preventDefault(); var f = e.target, name = f.name.value.trim();
        S.notify("super", "הודעה חדשה מהאתר: " + name, "New message from the website: " + name);
        S.save(); f.reset(); UI.toast(L("ההודעה נשלחה. נחזור אליכם בהקדם. (הדגמה: לא נשלח אימייל אמיתי)", "Message sent. We will get back to you soon. (Demo: no real email was sent)"));
      });
    }
  });
  function mapArt() {
    return '<svg viewBox="0 0 600 220" style="display:block;width:100%;height:auto;background:var(--surface-2)" aria-hidden="true"><g stroke="var(--line)" stroke-width="14" fill="none"><path d="M-10 160 C150 140 260 190 610 120"/><path d="M120 -10 L180 230"/><path d="M420 -10 C400 80 450 150 430 230"/></g><g stroke="var(--surface)" stroke-width="3" fill="none" stroke-dasharray="10 10"><path d="M-10 160 C150 140 260 190 610 120"/></g><circle cx="300" cy="105" r="34" fill="var(--accent)" opacity=".15"/><path d="M300 128s-18-16-18-32a18 18 0 0 1 36 0c0 16-18 32-18 32z" fill="var(--primary)"/><circle cx="300" cy="96" r="6" fill="var(--surface)"/></svg>';
  }

  /* ---------- davening times and zmanim ---------- */
  UI.route("/times", {
    title: function () { return L("זמני תפילה", "Davening Times"); },
    render: function (app, arg, params) {
      var sel = params.d != null ? +params.d : S.now().getDay();
      var d = S.weekDate(sel), z = S.zmanim(d), st = S.shabbatTimes();
      var TV = window.SHUL_TV;
      var rows = sel === 5 ? TV.groupRows("friday", 5) : sel === 6 ? TV.groupRows("shabbat", 6) : TV.groupRows("weekday", sel);
      app.innerHTML = '<div class="wrap page">' + UI.pageHead(L("זמני תפילה וזמני היום", "Davening Times and Daily Zmanim"), L("שבוע פרשת " + S.PARASHA.he + ", כסלו תשפ״ז", "Week of Parashat " + S.PARASHA.en + ", Kislev 5787")) +
        '<div class="row" style="margin-bottom:16px">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { var wd = S.weekDate(i); return '<a class="chip ' + (i === sel ? "on" : "") + '" href="#/times?d=' + i + '">' + (S.prefs.lang === "en" ? S.DAY_EN_SHORT[i] : S.DAY_HE[i]) + ' <span class="num small">' + wd.getDate() + "/" + (wd.getMonth() + 1) + "</span></a>"; }).join("") + "</div>" +
        '<div class="grid g3" style="align-items:start">' +
        '<div class="card"><div class="card-head"><h3>' + L("זמני היום", "Daily Zmanim") + '</h3><span class="badge">' + esc(S.hebDate(d)) + '</span></div><div class="timecard" style="padding:0;border:0;box-shadow:none">' +
        S.ZLIST.map(function (zz) { return '<div class="tline"><span>' + L(zz[1], zz[2]) + '</span><b class="num">' + S.hm(z[zz[0]], true) + "</b></div>"; }).join("") + "</div></div>" +
        '<div class="card"><div class="card-head"><h3>' + L("זמני תפילות", "Davening Times") + '</h3><span class="badge accent">' + esc(S.dayName(sel)) + '</span></div><div class="timecard" style="padding:0;border:0;box-shadow:none">' +
        (rows.length ? rows.map(function (r) { return '<div class="tline"><span>' + esc(S.N(r)) + '</span><b class="num">' + S.hm(r.time, true) + "</b></div>"; }).join("") : '<p class="muted">' + L("אין זמנים ליום הזה", "No times for this day") + "</p>") + "</div>" +
        (sel === 5 ? '<p class="small muted" style="margin-top:10px">' + L("זמני השבת, הדלקת נרות, צאת שבת ורבינו תם, מופיעים בכרטיס השבת שבצד.", "The Shabbat times, candle lighting, Shabbat ends and Rabbeinu Tam, are in the Shabbat card alongside.") + "</p>" : "") + "</div>" +
        '<div class="timecard"><div class="eyebrow">' + L("שבת קודש", "Shabbat Kodesh") + '</div><h3 style="margin:4px 0">' + L("פרשת " + S.PARASHA.he, "Parashat " + S.PARASHA.en) + "</h3>" +
        '<div class="tline"><span>' + L("הדלקת נרות", "Candle Lighting") + '</span><b class="num">' + S.hm(st.candles, true) + '</b></div><div class="tline"><span>' + L("שקיעה, יום שישי", "Shkiah, Friday") + '</span><b class="num">' + S.hm(st.friShkiah, true) + "</b></div>" +
        '<div class="tline"><span>' + L("צאת השבת", "Shabbat Ends") + '</span><b class="num">' + S.hm(st.ends, true) + '</b></div><div class="tline"><span>' + L("רבינו תם", "Rabbeinu Tam") + '</span><b class="num">' + S.hm(st.rt, true) + "</b></div>" +
        '<div class="row" style="margin-top:12px"><a class="btn soft sm" href="#/tv">' + L("לראות במסך", "See it on the screen") + "</a></div></div></div>" +
        '<h2 style="margin-top:34px">' + L("כל השבוע", "The whole week") + '</h2><div class="table-wrap"><table><thead><tr><th>' + L("זמן", "Zman") + "</th>" + [0, 1, 2, 3, 4, 5, 6].map(function (i) { return "<th>" + (S.prefs.lang === "en" ? S.DAY_EN_SHORT[i] : S.DAY_HE[i]) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        S.ZLIST.map(function (zz) { return "<tr><td><b>" + L(zz[1], zz[2]) + "</b></td>" + [0, 1, 2, 3, 4, 5, 6].map(function (i) { return '<td class="num">' + S.hm(S.zmanim(S.weekDate(i))[zz[0]], false) + "</td>"; }).join("") + "</tr>"; }).join("") +
        "</tbody></table></div></div>";
    }
  });

  /* ---------- donate (and pay my balance) ---------- */
  UI.route("/donate", {
    title: function () { return L("תרומה", "Donate"); },
    render: function (app, arg, params) {
      var bal = params.mode === "balance";
      var u = S.currentUser(), max = bal && u && u.mid ? S.balance(u.mid) : 0;
      if (bal && max <= 0) { location.hash = "#/me"; return; }
      var amount = bal ? max : 36, other = false;
      app.innerHTML = '<div class="wrap page"><div class="donate-wrap">' +
        '<div style="text-align:center;margin-bottom:18px"><div class="eyebrow">' + esc(S.N(S.db.shul)) + "</div><h1>" + (bal ? L("תשלום היתרה", "Pay My Balance") : L("תרומה לבית הכנסת", "Donate to the Shul")) + '</h1><p class="muted">' +
        (bal ? L("היתרה שלך: ", "Your balance: ") + '<b class="num">' + S.money(max) + "</b>" : L("כל תרומה מחזקת את התפילות, השיעורים והקהילה. תודה!", "Every gift strengthens our tefillah, shiurim and community. Thank you!")) + "</p></div>" +
        '<form class="card" id="payForm" novalidate>' +
        (bal ? '<label class="field"><span>' + L("סכום לתשלום", "Amount to pay") + '</span><input name="amount" type="number" min="1" step="0.01" max="' + max + '" value="' + max.toFixed(2) + '" class="ltr"></label><p class="tiny muted">' + L("אפשר לשלם חלק מהיתרה.", "You may pay part of the balance.") + "</p>"
          : '<div class="field"><span>' + L("סכום", "Amount") + '</span><div class="amounts">' + [18, 36, 100].map(function (a) { return '<button type="button" class="chip" data-amt="' + a + '" aria-pressed="' + (a === 36) + '">$' + a + "</button>"; }).join("") + '<button type="button" class="chip" data-amt="other" aria-pressed="false">' + L("אחר", "Other") + '</button></div><input name="other" type="number" min="1" step="1" class="ltr hidden" placeholder="' + L("סכום אחר", "Other amount") + '" style="margin-top:8px"></div>') +
        '<label class="check" style="margin-top:14px"><input type="checkbox" name="fee"><span>' + L("אכסה את עמלת הסליקה (2.88%) כדי שבית הכנסת יקבל את מלוא התרומה", "Cover the processing fee (2.88%) so the shul receives your full donation") + "</span></label>" +
        '<div class="balbox" style="margin-top:12px"><span>' + L("סה״כ לחיוב", "Total") + '</span><b class="num" id="total"></b></div>' +
        '<div class="divider">' + L("תשלום מהיר", "Express checkout") + '</div><div class="wallets"><button type="button" class="wallet-btn apple" data-wallet="Apple Pay"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9C5.9 6.8 4.2 7.8 3.3 9.4c-1.9 3.3-.5 8.1 1.3 10.8.9 1.3 2 2.7 3.4 2.7 1.3-.1 1.9-.9 3.5-.9s2.1.9 3.5.8c1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z"/></svg>Pay</button><button type="button" class="wallet-btn google" data-wallet="Google Pay"><b style="color:#4285f4">G</b> Pay</button></div>' +
        '<div class="divider">' + L("או בכרטיס", "or pay by card") + "</div>" +
        '<div class="form-grid"><label class="field"><span>' + L("שם מלא *", "Full name *") + '</span><input name="name" required value="' + esc(u ? u.en : "") + '"></label><label class="field"><span>' + L("אימייל *", "Email *") + '</span><input name="email" type="email" required class="ltr" value="' + esc(u ? u.email : "") + '"></label><label class="field"><span>' + L("טלפון *", "Phone *") + '</span><input name="phone" required inputmode="tel" class="ltr"></label></div>' +
        '<label class="field" style="margin-top:12px"><span>' + L("מספר כרטיס *", "Card number *") + '</span><input name="card" required inputmode="numeric" autocomplete="off" class="ltr" placeholder="4242 4242 4242 4242" maxlength="23"></label>' +
        '<div class="form-grid" style="margin-top:12px;grid-template-columns:1fr 1fr 1fr"><label class="field"><span>' + L("חודש *", "Month *") + '</span><select name="mm" required><option value="">MM</option>' + Array.from({ length: 12 }, function (x, i) { var v = String(i + 1).padStart(2, "0"); return "<option>" + v + "</option>"; }).join("") + '</select></label><label class="field"><span>' + L("שנה *", "Year *") + '</span><select name="yy" required><option value="">YY</option>' + [26, 27, 28, 29, 30, 31, 32].map(function (y) { return "<option>" + y + "</option>"; }).join("") + '</select></label><label class="field"><span>CVV *</span><input name="cvv" required inputmode="numeric" maxlength="4" class="ltr" autocomplete="off"></label></div>' +
        '<details style="margin-top:12px"><summary class="small" style="cursor:pointer;font-weight:700">' + L("כתובת לחיוב (לא חובה)", "Billing address (optional)") + '</summary><div class="form-grid" style="margin-top:10px"><label class="field"><span>' + L("רחוב", "Street") + '</span><input name="street"></label><label class="field"><span>' + L("עיר", "City") + '</span><input name="city"></label><label class="field"><span>' + L("מדינה", "State") + '</span><select name="state"><option value="">' + L("בחרו מדינה", "Select state") + "</option>" + ["NY", "NJ", "PA", "CT", "MA", "MD", "FL", "CA", "IL", "OH", "TX", "MI", "GA"].map(function (x) { return "<option>" + x + "</option>"; }).join("") + '<option value="other">' + L("מחוץ לארה״ב (ישראל ועוד)", "Outside the US (Israel and more)") + "</option>" + '</select></label><label class="field"><span>ZIP</span><input name="zip" class="ltr" inputmode="numeric"></label></div></details>' +
        '<label class="field" style="margin-top:12px"><span>' + L("הקדשה או הערה (לא חובה)", "Dedication or note (optional)") + '</span><input name="note" placeholder="' + L("לדוגמה: לעילוי נשמת..., לרפואה שלמה...", "For example: in memory of..., for a refuah shelemah...") + '"></label>' +
        '<p class="err hidden" id="payErr"></p><button class="btn primary lg block" id="payBtn" style="margin-top:14px">' + (bal ? L("לתשלום", "Pay") : L("לתרומה", "Donate")) + ' <span class="num" id="btnAmt"></span></button>' +
        '<p class="lock" style="margin-top:12px">' + I.lock + L("התשלום מעובד בצורה מאובטחת אצל ספק הסליקה. בית הכנסת לא רואה ולא שומר את פרטי הכרטיס.", "Your payment is processed securely on the payment provider's servers. The shul never sees or stores your card details.") + "</p>" +
        '<p class="tiny muted" style="background:var(--warn-soft);color:var(--warn);padding:8px 10px;border-radius:10px">' + L("הדגמה: כל מספר כרטיס עובד, ושום דבר לא מחויב.", "Demo: any card number works and nothing is charged.") + "</p></form>" +
        '<div class="card flat" style="margin-top:16px"><h3>' + L("קבלה לצורכי מס", "Tax receipt") + '</h3><p class="small muted" style="margin:0">' + L("בית הכנסת הוא ארגון ללא כוונת רווח לפי סעיף 501(c)(3). קבלה לצורכי מס נשלחת אוטומטית לאימייל שלכם מיד אחרי התשלום. לא ניתנו סחורות או שירותים תמורת התרומה.", "The shul is a 501(c)(3) nonprofit. A tax receipt is emailed to you automatically right after you give. No goods or services were provided in exchange for this contribution.") + "</p>" +
        '<hr class="gold-line"><p class="small" style="margin:0"><b>Zelle:</b> <span class="num">' + esc(S.db.shul.zelle) + "</span></p></div></div></div>";
      var f = app.querySelector("#payForm");
      function base() { if (bal) return Math.max(0, Math.min(max, +f.amount.value || 0)); return other ? (+f.other.value || 0) : amount; }
      function total() { var b = base(); return f.fee.checked ? Math.round(b * 1.0288 * 100) / 100 : b; }
      function upd() { var t = total(); app.querySelector("#total").textContent = S.money(t); app.querySelector("#btnAmt").textContent = t ? S.money(t) : ""; }
      UI.on(app, "[data-amt]", "click", function (e, b) {
        app.querySelectorAll("[data-amt]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        var v = b.getAttribute("data-amt"); other = v === "other"; f.other.classList.toggle("hidden", !other);
        if (!other) amount = +v; else f.other.focus(); upd();
      });
      f.addEventListener("input", upd); f.addEventListener("change", upd); upd();
      f.card.addEventListener("input", function () { var v = f.card.value.replace(/\D/g, "").slice(0, 19); f.card.value = v.replace(/(\d{4})(?=\d)/g, "$1 "); });
      function err(msg) { var e = app.querySelector("#payErr"); e.textContent = msg; e.classList.toggle("hidden", !msg); }
      function finish(wallet) {
        var t = total(), ref = String(10480000 + Math.floor(Math.random() * 90000));
        var rec = { id: S.uid("i"), ref: ref, name: f.name.value.trim() || (u ? u.en : "Donor"), email: (f.email.value.trim() || (u ? u.email : "")).toLowerCase(), amount: t, type: bal ? "balance" : "donation", date: S.todayIso(), note: f.note.value.trim(), last4: wallet ? "" : f.card.value.replace(/\D/g, "").slice(-4), wallet: wallet || "", status: "pending", fee: f.fee.checked };
        if (bal && u && u.mid) window.SHUL_MEMBER.recordBalancePayment(u.mid, t, ref, rec); /* production: recorded automatically */
        else S.db.inbox.unshift(rec); /* a donation waits for the gabbai to record it */
        S.notify("finance", "תשלום בכרטיס התקבל: " + rec.name + ", " + S.money(t), "Card payment received: " + rec.name + ", " + S.money(t));
        S.save();
        location.hash = "#/thanks?type=" + rec.type + "&ref=" + ref;
      }
      function busy(on) { var b = app.querySelector("#payBtn"); b.disabled = on; b.innerHTML = on ? L("מעבד תשלום...", "Processing...") : (bal ? L("לתשלום", "Pay") : L("לתרומה", "Donate")) + ' <span class="num" id="btnAmt">' + S.money(total()) + "</span>"; }
      f.addEventListener("submit", function (e) {
        e.preventDefault(); err("");
        if (!(base() > 0)) return err(L("נא לבחור סכום.", "Please choose an amount."));
        if (!f.name.value.trim() || !/^\S+@\S+\.\S+$/.test(f.email.value.trim()) || f.phone.value.replace(/\D/g, "").length < 7) return err(L("נא למלא שם, אימייל וטלפון.", "Please fill in name, email and phone."));
        if (f.card.value.replace(/\D/g, "").length < 13 || !f.mm.value || !f.yy.value || f.cvv.value.replace(/\D/g, "").length < 3) return err(L("נא למלא את פרטי הכרטיס.", "Please fill in the card details."));
        busy(true); setTimeout(function () { finish(""); }, 1300);
      });
      UI.on(app, "[data-wallet]", "click", function (e, b) {
        err(""); if (!(base() > 0)) return err(L("נא לבחור סכום.", "Please choose an amount."));
        var w = b.getAttribute("data-wallet");
        var sheet = document.createElement("div"); sheet.className = "paysheet";
        sheet.innerHTML = '<div class="sheet" dir="ltr"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">' + w + '</b><button class="btn ghost sm" id="wCancel" style="color:#06c">Cancel</button></div>' +
          '<div class="line"><span>Pay to</span><b>' + esc(S.db.shul.en) + '</b></div><div class="line"><span>Card</span><span>Demo Card •••• 4242</span></div><div class="line"><span>Total</span><b>' + S.money(total()) + '</b></div>' +
          '<button class="wallet-btn ' + (w === "Apple Pay" ? "apple" : "google") + '" id="wOk" style="width:100%;margin-top:14px">' + (w === "Apple Pay" ? "Confirm with Face ID" : "Continue") + '</button><p style="font-size:12px;color:#666;text-align:center;margin:8px 0 0">Simulated wallet sheet. Nothing is charged.</p></div>';
        document.body.appendChild(sheet);
        sheet.querySelector("#wCancel").addEventListener("click", function () { sheet.remove(); });
        sheet.querySelector("#wOk").addEventListener("click", function () { sheet.querySelector("#wOk").textContent = "✓ Done"; setTimeout(function () { sheet.remove(); finish(w); }, 700); });
      });
    }
  });

  function receiptHtml(rec) {
    return '<div class="print-area" style="background:#fff;color:#1f1b14;border:1px solid #e2d7c2;border-radius:14px;padding:22px;font-size:15px"><div style="text-align:center">' + UI.logo().replace("<svg", '<svg width="48" height="48" style="color:#0e2c4c"') + '<div style="font-family:Frank Ruhl Libre,serif;font-size:22px;font-weight:700;color:#0e2c4c">' + esc(S.db.shul.en) + '</div><div style="color:#6b5a3c">' + esc(S.db.shul.he) + " · " + esc(S.db.shul.address) + "</div></div><hr class=\"gold-line\">" +
      '<div dir="ltr" style="text-align:left"><p><b>Tax Receipt</b> · קבלה לצורכי מס</p><table style="font-size:14px"><tr><td>Donor</td><td><b>' + esc(rec.name) + "</b></td></tr><tr><td>Amount</td><td><b>" + S.money(rec.amount) + "</b></td></tr><tr><td>Date</td><td>" + esc(rec.date) + "</td></tr><tr><td>Reference</td><td>Ref #" + esc(rec.ref) + "</td></tr><tr><td>Paid with</td><td>" + esc(rec.wallet || ("Card ending " + rec.last4)) + "</td></tr>" + (rec.note ? "<tr><td>Dedication</td><td>" + esc(rec.note.split("|").pop()) + "</td></tr>" : "") + "</table>" +
      '<p style="font-size:13px;color:#555;margin-top:12px">' + esc(S.db.shul.en) + " is a 501(c)(3) nonprofit organization. No goods or services were provided in exchange for this contribution. This email is your tax receipt.</p><p dir=\"rtl\" style=\"font-size:13px;color:#555;text-align:right\">לא ניתנו סחורות או שירותים תמורת תרומה זו. אימייל זה הוא הקבלה שלכם לצורכי מס.</p></div></div>";
  }

  UI.route("/thanks", {
    render: function (app, arg, params) {
      var rec = S.db.inbox.filter(function (x) { return x.ref === params.ref; })[0];
      var bal = params.type === "balance";
      app.innerHTML = '<div class="wrap page"><div class="card" style="max-width:600px;margin:20px auto;text-align:center"><div style="width:68px;height:68px;margin:0 auto 12px;border-radius:50%;background:var(--ok-soft);color:var(--ok);display:grid;place-items:center">' + I.check.replace("<svg", '<svg width="34" height="34"') + "</div>" +
        "<h1>" + (bal ? L("התשלום התקבל", "Payment received") : L("תודה רבה על התרומה!", "Thank you for your donation!")) + '</h1><p class="muted">' + (bal ? L("היתרה שלך עודכנה.", "Your balance has been updated.") : L("קבלה לצורכי מס נשלחה לאימייל שלך. אם אינה מופיעה, כדאי לבדוק בתיקיית הספאם.", "A tax receipt was emailed to you. If you don't see it, please check your spam folder.") + " " + L("(בהדגמה לא נשלח אימייל אמיתי.)", "(In the demo, no real email is sent.)")) + "</p>" +
        (rec ? '<p class="small">' + L("אסמכתה: ", "Reference: ") + '<b class="num">' + esc(rec.ref) + "</b> · <b class=\"num\">" + S.money(rec.amount) + "</b></p>" : "") +
        '<div class="row" style="justify-content:center;margin-top:16px">' + (rec ? '<button class="btn" id="rcpt">' + I.receipt.replace("<svg", '<svg width="18" height="18"') + L("הצגת הקבלה שנשלחה", "View the emailed receipt") + "</button>" : "") +
        (bal ? '<a class="btn primary" href="#/me">' + L("לחשבון שלי", "To my account") + "</a>" : '<a class="btn primary" href="#/site">' + L("לדף הבית", "Back to home") + "</a>") + "</div></div></div>";
      var rb = app.querySelector("#rcpt");
      if (rb) rb.addEventListener("click", function () {
        var m = UI.modal("<h2>" + L("הקבלה כפי שנשלחה באימייל", "The receipt as emailed") + '</h2><p class="tiny muted">' + L("הדגמה: לא נשלח אימייל אמיתי.", "Demo: no real email was sent.") + "</p>" + receiptHtml(rec) + '<div class="actions"><button class="btn" id="pr">' + L("הדפסה", "Print") + '</button><button class="btn primary" data-close>' + L("סגירה", "Close") + "</button></div>", { wide: true });
        m.querySelector("#pr").addEventListener("click", function () { window.print(); });
      });
    }
  });

  /* ---------- join request ---------- */
  UI.route("/join", {
    title: function () { return L("הצטרפות", "Join"); },
    render: function (app) {
      var r = S.role(), A = S.db.applicant, u = S.db.demoUsers.applicant;
      var body;
      if (r !== "visitor" && r !== "applicant") {
        body = '<div class="alert ok"><b>' + L("כבר רשום כמתפלל", "Already a member") + "</b> " + L("החשבון שלך פעיל.", "Your account is active.") + ' <a href="#/me">' + L("לחשבון שלי", "To my account") + "</a></div>";
      } else if (r === "visitor") {
        body = '<p class="muted">' + L("כדי לבקש להצטרף, נכנסים קודם עם חשבון Google.", "To ask to join, first sign in with a Google account.") + '</p><button class="btn primary lg" id="gsign">' + L("כניסה עם Google", "Sign in with Google") + "</button>";
      } else if (A.status === "pending") {
        body = '<div class="alert"><b>' + L("הבקשה נשלחה.", "Request sent.") + "</b> " + L("הגבאי יאשר בקרוב.", "The gabbai will approve soon.") + '</div><p class="small muted" style="margin-top:12px">' + L("בהדגמה: עברו ל״מנהל ראשי״ בסרגל העליון, ואשרו את הבקשה במסך המתפללים.", "In the demo: switch to Super Admin in the top bar and approve the request on the Members screen.") + '</p><button class="btn soft" id="goApprove">' + L("הדגמה: לאשר בתור מנהל ראשי", "Demo: approve as Super Admin") + "</button>";
      } else if (A.status === "declined") {
        body = '<div class="alert warn"><b>' + L("הבקשה לא אושרה", "Request not approved") + '</b></div><button class="btn primary" id="again" style="margin-top:12px">' + L("שליחת הבקשה שוב", "Send request again") + "</button>";
      } else if (A.status === "approved") {
        body = '<div style="text-align:center"><div style="width:68px;height:68px;margin:0 auto 12px;border-radius:50%;background:var(--ok-soft);color:var(--ok);display:grid;place-items:center">' + I.check.replace("<svg", '<svg width="34" height="34"') + "</div><h2>" + L("ברוכים הבאים לקהילה!", "Welcome to the community!") + '</h2><p class="muted">' + L("הבקשה אושרה ונשלח אליך אימייל ברוכים הבאים. החשבון האישי שלך מוכן.", "Your request was approved and a welcome email was sent. Your personal account is ready.") + '</p><div class="row" style="justify-content:center"><button class="btn" id="welcomeMail">' + L("הצגת אימייל הברוכים הבאים", "View the welcome email") + '</button><a class="btn primary" href="#/me">' + L("לחשבון שלי", "To my account") + "</a></div></div>";
      } else body = null;
      var form = '<form id="joinForm"><div class="form-grid"><label class="field"><span>' + L("שם מלא", "Full name") + '</span><input name="name" required minlength="2" maxlength="80" value="' + esc(S.N(u)) + '"></label><label class="field"><span>' + L("טלפון", "Phone") + '</span><input name="phone" required inputmode="tel" class="ltr" value="' + esc(A.phone || "") + '" placeholder="(555) 0100-0000"></label></div><p class="small muted">' + L("אימייל: ", "Email: ") + '<span class="num">' + esc(u.email) + '</span></p><p class="err hidden" id="jErr"></p><button class="btn primary">' + L("שליחת בקשה", "Send request") + "</button></form>";
      app.innerHTML = '<div class="wrap page"><div class="card" style="max-width:620px;margin:10px auto">' + '<div class="eyebrow">' + esc(S.N(S.db.shul)) + "</div><h1>" + L("בקשת הצטרפות לקהילה", "Request to Join the Community") + '</h1><p class="muted">' + L("ממלאים שם וטלפון, והגבאי מאשר. אחרי האישור נפתח חשבון אישי עם יתרה, תשלומים ויארצייטים.", "Fill in your name and phone, and the gabbai approves. After approval you get a personal account with balance, payments and yahrzeits.") + "</p>" +
        (body || form) + (A.status === "declined" && A.reopen ? form : "") + "</div></div>";
      var gs = app.querySelector("#gsign"); if (gs) gs.addEventListener("click", function () { UI.setRole("applicant"); });
      var ga = app.querySelector("#goApprove"); if (ga) ga.addEventListener("click", function () { S.prefs.role = "super"; S.savePrefs(); UI.renderChrome(); location.hash = "#/finance/members"; });
      var ag = app.querySelector("#again"); if (ag) ag.addEventListener("click", function () { A.reopen = true; S.save(true); UI.render(); });
      var wm = app.querySelector("#welcomeMail"); if (wm) wm.addEventListener("click", function () { welcomeEmail(S.N(u)); });
      var jf = app.querySelector("#joinForm");
      if (jf) jf.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = jf.name.value.trim(), phone = jf.phone.value.trim();
        var er = app.querySelector("#jErr");
        if (name.length < 2 || phone.replace(/\D/g, "").length < 7) { er.textContent = L("נא למלא שם וטלפון תקינים.", "Please fill in a valid name and phone."); er.classList.remove("hidden"); return; }
        var resent = A.status === "declined";
        A.status = "pending"; A.phone = phone; A.reopen = false; u.he = /[א-ת]/.test(name) ? name : u.he; u.en = /[a-z]/i.test(name) ? name : u.en;
        S.db.joinReqs = S.db.joinReqs.filter(function (j) { return j.id !== "applicant"; });
        S.db.joinReqs.unshift({ id: "applicant", he: u.he, en: u.en, phone: phone, email: u.email, status: "pending", at: new Date().toISOString(), resent: resent });
        S.log("join", "בקשת הצטרפות התקבלה: " + u.he, "Join request received: " + u.en);
        S.notify("super", "בקשת הצטרפות חדשה: " + u.he, "New join request: " + u.en);
        S.save(); UI.render();
      });
    }
  });
  function welcomeEmail(name) {
    UI.modal('<h2>' + L("אימייל ברוכים הבאים", "Welcome email") + '</h2><p class="tiny muted">' + L("הדגמה: לא נשלח אימייל אמיתי.", "Demo: no real email was sent.") + '</p><div style="background:#fff;color:#1f1b14;border:1px solid #e2d7c2;border-radius:14px;padding:20px"><div style="text-align:center">' + UI.logo().replace("<svg", '<svg width="44" height="44" style="color:#0e2c4c"') + '</div><p dir="ltr" style="text-align:left"><b>Welcome to ' + esc(S.db.shul.en) + ", " + esc(name) + '!</b><br>Your account is ready. Sign in any time to see your balance, payments and family yahrzeits, and to get the shul\'s updates.</p><p dir="rtl" style="text-align:right"><b>ברוכים הבאים ל' + esc(S.db.shul.he) + "!</b><br>החשבון שלך מוכן. אפשר להיכנס בכל עת ולראות יתרה, תשלומים ויארצייטים של המשפחה, ולקבל את עדכוני בית הכנסת.</p></div><div class=\"actions\"><button class=\"btn primary\" data-close>" + L("סגירה", "Close") + "</button></div>");
  }
  window.SHUL_PUBLIC = { HOME_TEXTS: HOME_TEXTS, receiptHtml: receiptHtml, welcomeEmail: welcomeEmail };
})();
