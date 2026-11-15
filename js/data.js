/* Kehillat Noam | the demo's sample data. EVERYTHING here is invented: the congregation,
   the people, the amounts, the dedications. One fixed week: Sunday Nov 15 to Shabbat
   Nov 21, 2026 = 5 to 11 Kislev 5787, Parashat Vayetze. Every date below agrees with it. */
(function () {
  "use strict";
  var B = function (he, en) { return { he: he, en: en }; };
  var HDAY = ["", "א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ז׳", "ח׳", "ט׳", "י׳", "י״א", "י״ב", "י״ג", "י״ד", "ט״ו", "ט״ז", "י״ז", "י״ח", "י״ט", "כ׳", "כ״א", "כ״ב", "כ״ג", "כ״ד", "כ״ה", "כ״ו", "כ״ז", "כ״ח", "כ״ט", "ל׳"];
  var HMONTHS = [B("תשרי", "Tishrei"), B("חשוון", "Cheshvan"), B("כסלו", "Kislev"), B("טבת", "Tevet"), B("שבט", "Shevat"), B("אדר", "Adar"), B("ניסן", "Nisan"), B("אייר", "Iyar"), B("סיוון", "Sivan"), B("תמוז", "Tammuz"), B("אב", "Av"), B("אלול", "Elul")];
  var DOW = [B("ראשון", "Sunday"), B("שני", "Monday"), B("שלישי", "Tuesday"), B("רביעי", "Wednesday"), B("חמישי", "Thursday"), B("שישי", "Friday"), B("שבת", "Shabbat")];
  var DOW_S = [B("א׳", "Sun"), B("ב׳", "Mon"), B("ג׳", "Tue"), B("ד׳", "Wed"), B("ה׳", "Thu"), B("ו׳", "Fri"), B("ש׳", "Sat")];
  var days = [];
  for (var i = 0; i < 7; i++) days.push({ iso: "2026-11-" + (15 + i), dow: i, hDay: 5 + i, hMonth: 2, g: B((15 + i) + " בנובמבר", "Nov " + (15 + i)) });
  var WEEK = { days: days, parasha: B("ויצא", "Vayetze"), hYear: B("תשפ״ז", "5787"), candle: "16:17", ends: "17:19", rt: "17:40", friday: "2026-11-20", shabbat: "2026-11-21" };

  /* ----- the members (12) and their ledgers. c = charge, p = payment ----- */
  var D = {
    dues: B("דמי חבר שנתיים תשפ״ז", "Annual membership 5787"), kiddush: B("חסות קידוש", "Kiddush sponsorship"), ner: B("נר למאור", "Ner Lamaor"),
    al3: B("נדר · עלייה שלישית", "Neder · third aliyah"), al6: B("נדר · עלייה שישית", "Neder · sixth aliyah"), maftir: B("נדר · מפטיר", "Neder · Maftir"),
    petichah: B("נדר · פתיחת ההיכל", "Neder · opening the Ark"), hagbah: B("נדר · הגבהה", "Neder · Hagbah"), misheb: B("נדר · מי שברך", "Neder · Mi Sheberach"),
    hanukkah: B("תרומה למסיבת חנוכה", "Chanukah party donation"), building: B("תרומה לקמפיין הבניין", "Building campaign gift"), seuda: B("חסות סעודה שלישית", "Seudah Shlishit sponsorship"),
    pay: B("תשלום", "Payment")
  };
  var n = 0;
  function c(date, amount, d, par) { return { id: "L" + (++n), date: date, type: "charge", amount: amount, desc: par ? B(d.he + " · " + par.he, d.en + " · " + par.en) : d }; }
  function p(date, amount, method) { return { id: "L" + (++n), date: date, type: "payment", amount: amount, desc: D.pay, method: method }; }
  var P = { noach: B("פרשת נח", "Noach"), lech: B("פרשת לך לך", "Lech Lecha"), vayera: B("פרשת וירא", "Vayera"), chayei: B("פרשת חיי שרה", "Chayei Sarah"), toldot: B("פרשת תולדות", "Toldot"), bereshit: B("פרשת בראשית", "Bereshit") };
  function M(id, he, en, phone, since, ledger, extra) {
    var o = { id: id, name: B(he, en), email: en.toLowerCase().replace(/[^a-z]+/g, ".") + "@noam.demo", phone: "(555) 010-" + phone, since: since, status: "active", ledger: ledger };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  var members = [
    M("m1", "דוד אלמליח", "David Elmaliach", "0111", 2009, [
      c("2026-09-13", 600, D.dues), p("2026-09-20", 300, "check"), c("2026-10-10", 52, D.al3, P.bereshit), p("2026-10-18", 300, "card"),
      c("2026-10-24", 72, D.petichah, P.lech), p("2026-11-01", 124, "card"), c("2026-11-07", 100, D.misheb, P.chayei), c("2026-11-14", 80, D.al6, P.toldot)]),
    M("m2", "יוסף ביטון", "Yosef Biton", "0112", 2001, [c("2026-09-13", 600, D.dues), p("2026-09-15", 600, "check"), c("2026-11-07", 36, D.hagbah, P.chayei), p("2026-11-09", 36, "cash")]),
    M("m3", "משה אוחיון", "Moshe Ohayon", "0113", 2014, [c("2026-09-13", 600, D.dues), p("2026-10-02", 240, "zelle"), c("2026-11-14", 360, D.kiddush, B("שבת ויצא", "Shabbat Vayetze")), p("2026-11-16", 360, "card")]),
    M("m4", "אברהם דהן", "Avraham Dahan", "0114", 1998, [
      c("2026-09-13", 600, D.dues), p("2026-09-14", 600, "check"), c("2026-09-26", 180, D.maftir, B("שבת שובה", "Shabbat Shuva")), p("2026-09-29", 180, "check"),
      c("2026-10-10", 101, D.al3, P.bereshit), p("2026-10-12", 101, "cash"), c("2026-10-17", 72, D.ner, B("חודש חשוון", "Cheshvan")), p("2026-10-20", 72, "zelle"),
      c("2026-10-31", 126, D.al6, P.vayera), p("2026-11-03", 126, "card"), c("2026-11-07", 250, D.building), p("2026-11-10", 250, "check"),
      c("2026-11-14", 52, D.petichah, P.toldot)]),
    M("m5", "רפאל טולדנו", "Refael Toledano", "0115", 2017, [c("2026-09-13", 600, D.dues), p("2026-09-21", 600, "card"), c("2026-10-24", 54, D.hagbah, P.lech), p("2026-10-26", 54, "card")]),
    M("m6", "שמעון אזולאי", "Shimon Azoulay", "0116", 2006, [c("2026-09-13", 600, D.dues), p("2026-10-01", 600, "check"), c("2026-10-31", 90, D.al3, P.vayera), c("2026-11-14", 36, D.misheb, P.toldot)]),
    M("m7", "יעקב מימון", "Yaakov Maimon", "0117", 2020, [c("2026-09-13", 600, D.dues), p("2026-09-13", 600, "zelle"), c("2026-11-07", 180, D.seuda, P.chayei), p("2026-11-08", 180, "zelle")]),
    M("m8", "אליהו סויסה", "Eliyahu Suissa", "0118", 2003, [c("2026-09-13", 600, D.dues), p("2026-10-15", 100, "cash"), c("2026-11-14", 180, D.seuda, B("שבת ויצא", "Shabbat Vayetze"))]),
    M("m9", "מאיר אמסלם", "Meir Amsalem", "0119", 2005, [c("2026-09-13", 600, D.dues), p("2026-09-16", 600, "check"), c("2026-10-17", 52, D.al6, P.noach), p("2026-10-19", 52, "cash")], { perm: "finance" }),
    M("m10", "נסים אברג׳ל", "Nissim Abergel", "0120", 2011, [c("2026-09-13", 600, D.dues), p("2026-09-30", 600, "card"), c("2026-11-14", 72, D.maftir, P.toldot)], { perm: "content" }),
    M("m11", "חיים פרץ", "Chaim Peretz", "0121", 2019, [c("2026-09-13", 600, D.dues), p("2026-09-18", 600, "check"), c("2026-11-07", 100, D.hanukkah), p("2026-11-12", 100, "card")]),
    M("m12", "גבריאל אדרי", "Gavriel Edri", "0122", 1998, [c("2026-09-13", 600, D.dues), p("2026-09-13", 600, "check"), c("2026-10-24", 200, D.building), p("2026-10-25", 200, "check")], { perm: "admin" })
  ];

  /* 108 more households, generated the same way every time (a fixed seed), so the shul
     has about 120 members and every screen counts the same people and the same money. */
  (function () {
    var FN = [["אהרן", "Aharon"], ["בנימין", "Binyamin"], ["דניאל", "Daniel"], ["אליעזר", "Eliezer"], ["גדעון", "Gideon"], ["הלל", "Hillel"], ["יצחק", "Yitzchak"], ["יהושע", "Yehoshua"], ["מנחם", "Menachem"], ["נתן", "Natan"], ["עזרא", "Ezra"], ["פנחס", "Pinchas"], ["צבי", "Tzvi"], ["ראובן", "Reuven"], ["שלמה", "Shlomo"], ["תומר", "Tomer"], ["אריאל", "Ariel"], ["יונתן", "Yonatan"], ["עמית", "Amit"], ["אלחנן", "Elchanan"], ["ישראל", "Yisrael"], ["מרדכי", "Mordechai"], ["נחום", "Nachum"], ["עקיבא", "Akiva"]];
    var LN = [["כהן", "Cohen"], ["לוי", "Levi"], ["פרידמן", "Friedman"], ["מזרחי", "Mizrachi"], ["גולדברג", "Goldberg"], ["שפירא", "Shapiro"], ["כץ", "Katz"], ["בן שושן", "Ben Shushan"], ["רוזנברג", "Rosenberg"], ["אוחנה", "Ohana"], ["וייס", "Weiss"], ["חדד", "Hadad"], ["גרינברג", "Greenberg"], ["אשכנזי", "Ashkenazi"], ["הורוביץ", "Horowitz"], ["אבוטבול", "Abutbul"], ["קליין", "Klein"], ["שוורץ", "Schwartz"], ["נחמיאס", "Nachmias"], ["ברגר", "Berger"], ["סבג", "Sabag"], ["זילברמן", "Silberman"], ["גבריאלי", "Gavrieli"], ["שטרן", "Stern"], ["מלכה", "Malka"], ["הלפרין", "Halperin"], ["רבינוביץ", "Rabinowitz"], ["דיין", "Dayan"], ["טנא", "Tene"]];
    var seed = 20261120, NED = [D.al3, D.al6, D.petichah, D.hagbah, D.misheb, D.maftir], AMT = [36, 52, 72, 101, 126], MTH = ["card", "check", "zelle", "cash"];
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    function day(mo, a, b) { var d = a + Math.floor(rnd() * (b - a + 1)); return "2026-" + mo + "-" + (d < 10 ? "0" + d : d); }
    for (var i = 0; i < 108; i++) {
      var f = FN[(i * 7 + 3) % FN.length], l = LN[(i * 11 + Math.floor(i / LN.length) * 5) % LN.length], r = rnd(), L = [c("2026-09-13", 600, D.dues)];
      if (r < 0.34) L.push(p(day("09", 14, 30), 600, MTH[i % 4])); else if (r < 0.58) L.push(p(day("10", 1, 30), 600, MTH[i % 4])); else if (r < 0.86) L.push(p(day("11", 1, 19), 600, MTH[i % 4])); else if (r < 0.93) L.push(p(day("10", 5, 28), 300, MTH[i % 4]));
      if (rnd() < 0.35) { var a1 = AMT[Math.floor(rnd() * AMT.length)]; L.push(c("2026-10-24", a1, NED[i % NED.length], P.lech)); if (rnd() < 0.8) L.push(p(day("10", 25, 31), a1, MTH[(i + 1) % 4])); }
      if (rnd() < 0.3) { var a2 = AMT[Math.floor(rnd() * AMT.length)]; L.push(c("2026-11-07", a2, NED[(i + 2) % NED.length], P.chayei)); if (rnd() < 0.6) L.push(p(day("11", 8, 19), a2, MTH[(i + 2) % 4])); }
      members.push(M("m" + (13 + i), f[0] + " " + l[0], f[1] + " " + l[1], String(1000 + i * 7 % 9000).slice(-4), 1998 + Math.floor(rnd() * 28), L));
    }
  })();
  /* general donations (people who are not members): one ledger, counted in income */
  var donations = [
    { id: "G1", date: "2026-11-02", amount: 180, donor: B("רחל ושמואל קורן", "Rachel & Shmuel Koren"), email: "koren.family@mail.demo", ref: "KN-2026-00412" },
    { id: "G2", date: "2026-11-05", amount: 36, donor: B("אורח מהשבת", "A Shabbat guest"), email: "guest.one@mail.demo", ref: "KN-2026-00413" },
    { id: "G3", date: "2026-11-09", amount: 500, donor: B("משפחת לנדאו", "The Landau family"), email: "landau.family@mail.demo", ref: "KN-2026-00414" },
    { id: "G4", date: "2026-11-12", amount: 72, donor: B("דניאל שרעבי", "Daniel Sharabi"), email: "d.sharabi@mail.demo", ref: "KN-2026-00415" },
    { id: "G5", date: "2026-11-17", amount: 101, donor: B("מרים עטיה", "Miriam Attia"), email: "m.attia@mail.demo", ref: "KN-2026-00416" }
  ];
  var unmatched = [
    { id: "U1", ref: "KN-2026-00409", amount: 54, name: "R TOLEDANO", email: "rafi.t.work@mail.demo", date: "2026-11-18", type: "donation", hint: "m5" },
    { id: "U2", ref: "KN-2026-00410", amount: 250, name: "JONATHAN BAROUKH", email: "j.baroukh@mail.demo", date: "2026-11-19", type: "donation", hint: "" }
  ];
  var joinReqs = [
    { id: "J1", name: B("עמנואל בן חיים", "Emanuel Ben Chaim"), email: "emanuel.bc@mail.demo", phone: "(555) 010-0141", when: "2026-11-18", note: B("עברנו לשכונה בקיץ", "We moved to the neighborhood this summer") },
    { id: "J2", name: B("יונתן אסייג", "Yonatan Assayag"), email: "y.assayag@mail.demo", phone: "(555) 010-0142", when: "2026-11-19", note: B("מתפלל אצלכם בשבתות כבר שנה", "Davening with you on Shabbat for a year") },
    { id: "J3", name: B("אורי לוי־נחמני", "Ori Levi-Nachmani"), email: "ori.ln@mail.demo", phone: "(555) 010-0143", when: "2026-11-20", note: B("חתן של משפחת מימון", "Son-in-law of the Maimon family") }
  ];
  /* ----- the week on the screen ----- */
  var yahrzeits = [
    { id: "Y1", name: B("מסעודה בת רחל ז״ל", "Mas'uda bat Rachel z\"l"), rel: B("אמו של דוד אלמליח", "Mother of David Elmaliach"), hDay: 7, hMonth: 2, memberId: "m1", status: "approved" },
    { id: "Y2", name: B("רבי שלום בן יחיא ז״ל", "Rabbi Shalom ben Yichya z\"l"), rel: B("אביו של אברהם דהן", "Father of Avraham Dahan"), hDay: 9, hMonth: 2, memberId: "m4", status: "approved" },
    { id: "Y3", name: B("אסתר בת שמחה ז״ל", "Esther bat Simcha z\"l"), rel: B("סבתו של משה אוחיון", "Grandmother of Moshe Ohayon"), hDay: 11, hMonth: 2, memberId: "m3", status: "approved" },
    { id: "Y4", name: B("יצחק בן מרים ז״ל", "Yitzchak ben Miriam z\"l"), rel: B("אביו של דוד אלמליח", "Father of David Elmaliach"), hDay: 22, hMonth: 6, memberId: "m1", status: "approved" },
    { id: "Y5", name: B("זוהרה בת עישה ז״ל", "Zohara bat Aisha z\"l"), rel: B("אמו של שמעון אזולאי", "Mother of Shimon Azoulay"), hDay: 10, hMonth: 2, memberId: "m6", status: "pending" }
  ];
  var dedications = [
    { id: "D1", text: B("הלימוד השבוע מוקדש לרפואת שלמה בן ג׳ולייט", "This week's learning is dedicated to the recovery of Shlomo ben Juliet"), by: B("משפחת סויסה", "The Suissa family") },
    { id: "D2", text: B("נר למאור השבוע לעילוי נשמת רבי שלום בן יחיא ז״ל", "This week's Ner Lamaor is in memory of Rabbi Shalom ben Yichya z\"l"), by: B("משפחת דהן", "The Dahan family") },
    { id: "D3", text: B("שיעור הדף היומי מוקדש להצלחת ילדי הקהילה", "The Daf Yomi shiur is dedicated to the success of the community's children"), by: B("משפחת מימון", "The Maimon family") },
    { id: "D4", text: B("ספרי התהילים החדשים נתרמו לזכות נועה בת אורלי", "The new Tehillim books were donated in the merit of Noa bat Orly"), by: B("משפחת טולדנו", "The Toledano family") },
    { id: "D5", text: B("תאורת ההיכל מוקדשת לעילוי נשמת מסעודה בת רחל ז״ל", "The lighting of the Ark is dedicated in memory of Mas'uda bat Rachel z\"l"), by: B("משפחת אלמליח", "The Elmaliach family") }
  ];
  var hazkarot = [
    { id: "H1", name: B("חנה בת פרחה ז״ל", "Chana bat Farcha z\"l"), text: B("אזכרת השלושים · יום רביעי אחרי ערבית", "Shloshim memorial · Wednesday after Maariv"), by: B("משפחת אזולאי", "The Azoulay family") },
    { id: "H2", name: B("מרדכי בן עליזה ז״ל", "Mordechai ben Aliza z\"l"), text: B("אזכרת השנה · מוצאי שבת, סעודה ולימוד", "First-year memorial · Motzei Shabbat, meal and learning"), by: B("משפחת פרץ", "The Peretz family") }
  ];
  var mazal = [
    { id: "Z1", text: B("מזל טוב למשפחת אוחיון לבר המצווה של הבן איתמר", "Mazal Tov to the Ohayon family on the Bar Mitzvah of their son Itamar"), sub: B("שבת פרשת ויצא", "Shabbat Parashat Vayetze") },
    { id: "Z2", text: B("מזל טוב ליעקב ושירה מימון להולדת הבת", "Mazal Tov to Yaakov and Shira Maimon on the birth of a daughter"), sub: B("שתזכו לגדלה לתורה, לחופה ולמעשים טובים", "May you raise her to Torah, chuppah and good deeds") }
  ];
  var announcements = [
    { id: "A1", title: B("מסיבת חנוכה קהילתית", "Community Chanukah party"), text: B("מוצאי שבת, כ״ו בכסלו (5 בדצמבר), 7:30 בערב באולם. הדלקת נר שני, סופגניות ופעילות לילדים.", "Motzei Shabbat, 26 Kislev (Dec 5), 7:30 PM in the hall. Second candle, sufganiyot and activities for children.") },
    { id: "A2", title: B("אבות ובנים חוזר", "Avot uBanim is back"), text: B("כל מוצאי שבת, שעה אחרי צאת השבת. פיצה והגרלה לילדים.", "Every Motzei Shabbat, one hour after Shabbat ends. Pizza and a raffle for the children.") },
    { id: "A3", title: B("מבצע מעילים לחורף", "Winter coat drive"), text: B("אפשר להביא מעילים במצב טוב לארגז בכניסה עד ראש חודש טבת.", "Bring coats in good condition to the box at the entrance until Rosh Chodesh Tevet.") }
  ];
  var kiddush = [
    { id: "K1", what: B("קידוש שבת ויצא", "Kiddush · Shabbat Vayetze"), by: B("משפחת אוחיון", "The Ohayon family"), why: B("לכבוד בר המצווה של איתמר", "In honor of Itamar's Bar Mitzvah") },
    { id: "K2", what: B("סעודה שלישית", "Seudah Shlishit"), by: B("משפחת סויסה", "The Suissa family"), why: B("לרפואת שלמה בן ג׳ולייט", "For the recovery of Shlomo ben Juliet") },
    { id: "K3", what: B("קידוש שבת וישלח", "Kiddush · Shabbat Vayishlach"), by: B("פנוי לחסות", "Open for sponsorship"), why: B("לפרטים: הגבאי", "Ask the gabbai"), open: true }
  ];
  var shiurim = [
    { t: "05:40", name: B("דף יומי", "Daf Yomi"), who: B("הרב יעקב בן עמי · כל בוקר", "Rabbi Yaakov Ben Ami · every morning") },
    { t: "17:15", name: B("הלכה יומית", "Daily Halacha"), who: B("בין מנחה לערבית", "Between Mincha and Maariv") },
    { t: "20:00", name: B("שיעור פרשת השבוע", "Weekly Parasha shiur"), who: B("יום חמישי · הרב", "Thursday · the Rabbi") },
    { t: "15:10", name: B("עין יעקב", "Ein Yaakov"), who: B("שבת לפני מנחה", "Shabbat before Mincha") },
    { t: "18:20", name: B("אבות ובנים", "Avot uBanim"), who: B("מוצאי שבת", "Motzei Shabbat") }
  ];
  var rabbi = B("״וַיִּפְגַּע בַּמָּקוֹם״: יעקב תיקן תפילת ערבית. גם כשהשמש שוקעת, יהודי מוצא את המקום שלו בתפילה.", "\"Vayifga bamakom\": Yaakov established Maariv. Even when the sun sets, a Jew finds his place in prayer.");
  var prayers = [
    { id: "p1", kind: "shacharit", name: B("שחרית · מניין ראשון", "Shacharit · first minyan"), days: [1, 2, 3, 4, 5], time: "06:15" },
    { id: "p2", kind: "shacharit", name: B("שחרית · מניין שני", "Shacharit · second minyan"), days: [1, 2, 3, 4, 5], time: "07:30" },
    { id: "p3", kind: "shacharit", name: B("שחרית", "Shacharit"), days: [0], time: "08:00" },
    { id: "p4", kind: "mincha", name: B("מנחה", "Mincha"), days: [0, 1, 2, 3, 4], time: "16:20" },
    { id: "p5", kind: "maariv", name: B("ערבית", "Maariv"), days: [0, 1, 2, 3, 4], time: "16:55" },
    { id: "p6", kind: "maariv", name: B("ערבית · מניין מאוחר", "Maariv · late minyan"), days: [0, 1, 2, 3, 4], time: "20:30" },
    { id: "p7", kind: "mincha", name: B("מנחה וקבלת שבת", "Mincha & Kabbalat Shabbat"), days: [5], time: "16:25" },
    { id: "p8", kind: "shacharit", name: B("שחרית של שבת", "Shabbat Shacharit"), days: [6], time: "08:00" },
    { id: "p9", kind: "mincha", name: B("מנחה של שבת", "Shabbat Mincha"), days: [6], time: "15:50" },
    { id: "p10", kind: "maariv", name: B("ערבית מוצאי שבת", "Maariv · Motzei Shabbat"), days: [6], time: "17:16", rule: "motzash" }
  ];
  var holidays = [
    { name: B("נר ראשון של חנוכה", "First Chanukah candle"), when: B("יום שישי, כ״ד בכסלו · 4 בדצמבר", "Friday, 24 Kislev · Dec 4"), note: B("מדליקים לפני נרות שבת · 4:07", "Light before Shabbat candles · 4:07 PM") },
    { name: B("ראש חודש טבת", "Rosh Chodesh Tevet"), when: B("חמישי ושישי · 10 ו־11 בדצמבר", "Thursday and Friday · Dec 10-11"), note: B("שחרית עם הלל ומוסף · 6:00", "Shacharit with Hallel and Musaf · 6:00 AM") },
    { name: B("זאת חנוכה", "Zot Chanukah"), when: B("שבת, ב׳ בטבת · 12 בדצמבר", "Shabbat, 2 Tevet · Dec 12"), note: B("נר שמיני ביום שישי, לפני נרות שבת", "Eighth candle on Friday, before Shabbat candles") },
    { name: B("צום עשרה בטבת", "Fast of 10 Tevet"), when: B("יום ראשון · 20 בדצמבר", "Sunday · Dec 20"), note: B("תחילת הצום 5:58 · סיום 5:07", "Fast begins 5:58 AM · ends 5:07 PM") }
  ];
  var notifications = [
    { id: "N1", kind: "payment", title: B("תשלום התקבל", "Payment received"), body: B("משה אוחיון שילם $360 בכרטיס · חסות קידוש", "Moshe Ohayon paid $360 by card · Kiddush sponsorship"), when: B("יום שני, 9:12", "Monday, 9:12 AM"), to: ["finance", "admin"], unread: true },
    { id: "N2", kind: "join", title: B("בקשת הצטרפות חדשה", "New join request"), body: B("מאת אורי לוי־נחמני", "From Ori Levi-Nachmani"), when: B("היום, 8:40", "Today, 8:40 AM"), to: ["admin"], unread: true },
    { id: "N3", kind: "times", title: B("שינוי בזמני התפילה", "Davening time changed"), body: B("מנחה וקבלת שבת: 4:25 (במקום 4:30)", "Mincha & Kabbalat Shabbat: 4:25 PM (was 4:30)"), when: B("יום חמישי, 20:05", "Thursday, 8:05 PM"), to: ["member", "finance", "content", "admin"], unread: true },
    { id: "N4", kind: "announce", title: B("הודעה חדשה מבית הכנסת", "New announcement from the shul"), body: B("מסיבת חנוכה קהילתית · מוצאי שבת 5 בדצמבר", "Community Chanukah party · Motzei Shabbat Dec 5"), when: B("יום רביעי, 13:30", "Wednesday, 1:30 PM"), to: ["member", "finance", "content", "admin"], unread: false },
    { id: "N5", kind: "yahrzeit", title: B("יארצייט השבוע", "Yahrzeit this week"), body: B("מסעודה בת רחל ז״ל · ז׳ בכסלו · מופיע במסך בית הכנסת", "Mas'uda bat Rachel z\"l · 7 Kislev · shown on the shul screen"), when: B("יום ראשון, 7:00", "Sunday, 7:00 AM"), to: ["member"], unread: false },
    { id: "N6", kind: "approval", title: B("הבקשה אושרה ✓", "Request approved ✓"), body: B("היארצייט של יצחק בן מרים ז״ל אושר ויופיע במסך בשבוע שלו", "The yahrzeit of Yitzchak ben Miriam z\"l was approved and will appear on the screen in its week"), when: B("לפני שבוע", "A week ago"), to: ["member"], unread: false }
  ];
  var activity = [
    { kind: "pay", text: B("תרומה כללית $101 · מרים עטיה", "General donation $101 · Miriam Attia"), when: B("יום שלישי", "Tuesday") },
    { kind: "pay", text: B("משה אוחיון שילם $360 בכרטיס", "Moshe Ohayon paid $360 by card"), when: B("יום שני", "Monday") },
    { kind: "yz", text: B("יארצייט אושר: אסתר בת שמחה ז״ל", "Yahrzeit approved: Esther bat Simcha z\"l"), when: B("יום ראשון", "Sunday") },
    { kind: "join", text: B("בקשת הצטרפות: עמנואל בן חיים", "Join request: Emanuel Ben Chaim"), when: B("יום רביעי", "Wednesday") },
    { kind: "charge", text: B("נרשמו 7 נדרים משבת תולדות", "7 Nedarim recorded from Shabbat Toldot"), when: B("מוצאי שבת", "Motzei Shabbat") },
    { kind: "pay", text: B("חיים פרץ שילם $100 בכרטיס", "Chaim Peretz paid $100 by card"), when: B("12 בנובמבר", "Nov 12") }
  ];
  window.KN_DATA = { B: B, HDAY: HDAY, HMONTHS: HMONTHS, DOW: DOW, DOW_S: DOW_S, WEEK: WEEK, DESC: D, members: members, donations: donations, unmatched: unmatched, joinReqs: joinReqs,
    yahrzeits: yahrzeits, dedications: dedications, hazkarot: hazkarot, mazal: mazal, announcements: announcements, kiddush: kiddush, shiurim: shiurim, rabbi: rabbi, prayers: prayers,
    holidays: holidays, notifications: notifications, activity: activity,
    shul: { nameHe: "קהילת נועם", nameEn: "Kehillat Noam", tagHe: "קהילה חמה ופתוחה · נוסדה בשנת 1998", tagEn: "A warm, open congregation · founded 1998", rabbi: B("הרב יעקב בן עמי", "Rabbi Yaakov Ben Ami"),
      address: "212 Rimon Lane, Noam Heights", phone: "(555) 010-0100", email: "office@kehillatnoam.demo", zelle: "zelle@kehillatnoam.demo", logo: "arch" },
    /* one campaign, no funds: every donation counts toward it. base = raised before this week's sample donations. */
    campaign: { name: B("קמפיין הבניין", "The building campaign"), goal: 50000, base: 30861, baseDonors: 81, end: "2026-12-13" },
    /* collected in the months before the sample ledger starts (September) */
    history: [[B("יוני", "Jun"), 7400], [B("יולי", "Jul"), 6100], [B("אוג׳", "Aug"), 6800]],
    sales: { phone: "347-244-9382", tel: "+13472449382", email: "hanochhason@gmail.com" } };
})();
