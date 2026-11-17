/* Shul system sales demo | fictional seed data.
   The congregation, every person, phone, email and amount below is invented.
   Phones use the 555-01xx fictional range; emails use example.com / example.net. */
(function () {
  "use strict";
  window.SHUL_SEED = function () {
    var people = [
      ["m1", "דניאל כץ", "Daniel Katz"], ["m2", "אברהם פלדמן", "Avraham Feldman"], ["m3", "יהודה שטרן", "Yehuda Stern"],
      ["m4", "משה קליין", "Moshe Klein"], ["m5", "אליהו ברנר", "Eliyahu Brenner"], ["m6", "שמואל גולד", "Shmuel Gold"],
      ["m7", "חיים וייס", "Chaim Weiss"], ["m8", "יעקב רובין", "Yaakov Rubin"], ["m9", "בנימין הרטמן", "Binyamin Hartman"],
      ["m10", "נתן שפירא", "Natan Shapiro"], ["m11", "ארי לרנר", "Ari Lerner"], ["m12", "צבי מורגן", "Tzvi Morgen"],
      ["m13", "יוסף אדלר", "Yosef Adler"], ["m14", "מנחם רוט", "Menachem Roth"], ["m15", "ראובן הלפרן", "Reuven Halpern"],
      ["m16", "אהרן פרידמן", "Aharon Friedman"], ["m17", "שלמה גרין", "Shlomo Green"], ["m18", "אלחנן ויס", "Elchanan Vis"]
    ];
    var members = people.map(function (p, i) {
      var en = p[2].toLowerCase().split(" ");
      return {
        id: p[0], he: p[1], en: p[2],
        phone: "(555) 01" + String(10 + i).padStart(2, "0") + "-" + String(2000 + i * 37).slice(-4),
        email: p[0] === "m11" ? "" : en[0] + "." + en[1] + "@example.com",
        status: p[0] === "m12" ? "inactive" : "active",
        joined: "2025-0" + (1 + (i % 9)) + "-1" + (i % 9),
        hasAccount: ["m11", "m12", "m17"].indexOf(p[0]) < 0
      };
    });
    /* deterministic pseudo-random */
    var s = 7; function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    var ledger = [], n = 0;
    function add(mid, date, type, amount, desc, extra) {
      n += 1;
      var e = { id: "L" + n, mid: mid, date: date, type: type, amount: amount, desc: desc, by: "יוסף אדלר|Yosef Adler", source: "manual" };
      Object.assign(e, extra || {}); ledger.push(e);
    }
    var shabbatot = ["2026-10-03", "2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31", "2026-11-07", "2026-11-14"];
    var aliyot = [
      ["פתיחת ההיכל", "Petichat Haheichal"], ["כהן", "Kohen"], ["לוי", "Levi"], ["שלישי", "Shlishi"],
      ["רביעי", "Revi'i"], ["חמישי", "Chamishi"], ["שישי", "Shishi"], ["שביעי", "Shevi'i"], ["מפטיר", "Maftir"]
    ];
    var methods = ["cash", "check", "zelle", "card", "transfer"];
    members.forEach(function (m, i) {
      if (m.status === "inactive") { add(m.id, "2026-09-01", "charge", 720, "דמי חבר שנתיים תשפ״ז|Annual membership 5787", { source: "recurring" }); add(m.id, "2026-09-20", "payment", 720, "תשלום|Payment", { method: "check" }); return; }
      var monthly = i % 3 !== 0;
      if (monthly) ["2026-09-01", "2026-10-01", "2026-11-01"].forEach(function (d) { add(m.id, d, "charge", 60, "דמי חבר חודשיים|Monthly membership", { source: "recurring" }); });
      else add(m.id, "2026-09-01", "charge", 720, "דמי חבר שנתיים תשפ״ז|Annual membership 5787", { source: "recurring" });
      shabbatot.forEach(function (d, k) {
        if (rnd() < 0.38) {
          var a = aliyot[Math.floor(rnd() * aliyot.length)], amt = [18, 26, 36, 52, 72, 100, 180][Math.floor(rnd() * 7)];
          add(m.id, d, "charge", amt, "נדר: " + a[0] + "|Neder: " + a[1], { source: "neder", aliyah: a[1] });
        }
      });
      var bal = 0; ledger.forEach(function (e) { if (e.mid === m.id) bal += e.type === "payment" ? -e.amount : e.amount; });
      var payPart = [1, 0.5, 0, 1, 0.7, 1, 0.4, 0.6, 1, 0, 0.8, 1, 1, 1, 1, 0.3, 0, 1][i];
      var pay = Math.round(bal * payPart / 18) * 18;
      if (m.id === "m1") pay = Math.max(0, bal - 360);
      if (pay > 0) {
        var p1 = Math.round(pay * 0.6), p2 = pay - p1;
        add(m.id, "2026-10-0" + (2 + (i % 7)), "payment", p1, "תשלום|Payment", { method: methods[i % 5] });
        if (p2 > 0) add(m.id, "2026-11-1" + (i % 6), "payment", p2, "תשלום|Payment", { method: methods[(i + 2) % 5] });
      }
      if (m.id === "m6") add(m.id, "2026-11-09", "payment", 200, "תשלום מראש|Prepayment", { method: "zelle" });
    });
    /* a general donations record (not a member), for donations that match no one */
    var general = { id: "general", he: "תרומות כלליות", en: "General donations", phone: "", email: "", status: "general", hasAccount: false };

    var items = [
      { id: "it1", type: "announcement", title: { he: "שיעור בפרשת השבוע", en: "Weekly Parasha Shiur" }, text: { he: "יום חמישי בשעה 8:00 בערב, עם הרב. כיבוד קל.", en: "Thursday at 8:00 PM with the Rav. Light refreshments." }, showOn: "weekday", status: "published" },
      { id: "it2", type: "announcement", title: { he: "מסיבת חנוכה לילדים", en: "Children's Chanukah Party" }, text: { he: "יום ראשון, ו׳ בטבת, בשעה 4:00 אחר הצהריים באולם הקהילה.", en: "Sunday, December 6 at 4:00 PM in the social hall." }, showOn: "weekday", status: "published" },
      { id: "it3", type: "announcement", title: { he: "דף יומי", en: "Daf Yomi" }, text: { he: "כל ערב אחרי מעריב, בבית המדרש.", en: "Every evening after Maariv in the Beit Midrash." }, showOn: "weekday", status: "published" },
      { id: "it4", type: "mazaltov", title: { he: "מזל טוב", en: "Mazal Tov" }, text: { he: "למשפחת שטרן להולדת הנכדה. שתזכו לגדלה לתורה, לחופה ולמעשים טובים.", en: "To the Stern family on the birth of a granddaughter. May you raise her to Torah, chuppah and good deeds." }, showOn: "weekday", status: "published" },
      { id: "it5", type: "mazaltov", title: { he: "מזל טוב", en: "Mazal Tov" }, text: { he: "לחיים וייס לרגל בר המצווה של בנו אליעזר.", en: "To Chaim Weiss on the Bar Mitzvah of his son Eliezer." }, showOn: "weekday", status: "published" },
      { id: "it6", type: "flyer", title: { he: "מלווה מלכה קהילתית", en: "Community Melave Malka" }, text: { he: "מוצאי שבת, 28 בנובמבר, 8:30 בערב. מוזיקה חיה, ארוחה חמה ודברי תורה.", en: "Motzei Shabbat, November 28, 8:30 PM. Live music, a hot meal and divrei Torah." }, showOn: "weekday", status: "published", style: "night" },
      { id: "it7", type: "sponsor", title: { he: "קידוש", en: "Kiddush" }, text: { he: "הקידוש השבת נתרם על ידי משפחת פלדמן, לכבוד יום הולדתו של אבי המשפחה.", en: "This week's Kiddush is sponsored by the Feldman family, in honor of their father's birthday." }, showOn: "all", status: "published" },
      { id: "it8", type: "parnas", title: { he: "פרנס היום", en: "Parnas Hayom" }, text: { he: "לעילוי נשמת שרה בת אברהם, נתרם על ידי משפחת גולד.", en: "Leilui Nishmat Sarah bat Avraham, sponsored by the Gold family." }, showOn: "all", status: "published" },
      { id: "it9", type: "sponsor", title: { he: "סעודה שלישית", en: "Seudah Shelishit" }, text: { he: "נתרמה על ידי יעקב רובין, לרפואה שלמה של כל חולי ישראל.", en: "Sponsored by Yaakov Rubin, for a refuah shelemah for all who are ill." }, showOn: "all", status: "published" },
      { id: "it10", type: "hazkara", title: { he: "הזכרה", en: "Hazkara" }, text: { he: "הזכרה לעילוי נשמת יצחק בן משה הרטמן, ביום שישי אחרי שחרית.", en: "Hazkara for Yitzchak ben Moshe Hartman, Friday after Shacharit." }, showOn: "all", status: "published" },
      { id: "it11", type: "ticker", title: { he: "הקדשה קבועה", en: "Permanent dedication" }, text: { he: "הסידורים בבית הכנסת הוקדשו לעילוי נשמת מרדכי בן יצחק קליין", en: "The siddurim are dedicated in memory of Mordechai ben Yitzchak Klein" }, showOn: "all", status: "published" },
      { id: "it12", type: "ticker", title: { he: "הקדשה קבועה", en: "Permanent dedication" }, text: { he: "ארון הקודש נתרם על ידי משפחות הקהילה, לזכר מייסדי הקהילה", en: "The Aron Kodesh was donated by the families of the kehilla, in memory of its founders" }, showOn: "all", status: "published" },
      { id: "it13", type: "announcement", title: { he: "גיוס תרומות לספר תורה", en: "Sefer Torah Campaign" }, text: { he: "טיוטה: נפרסם אחרי אישור הרב.", en: "Draft: to be published after the Rav approves." }, showOn: "weekday", status: "draft" }
    ];
    var yahrzeits = [
      { id: "y1", name: { he: "אסתר בת שמואל", en: "Esther bat Shmuel" }, relation: { he: "אמו של משה קליין", en: "Mother of Moshe Klein" }, hday: 7, hmonth: 2, memberId: "m4", status: "published" },
      { id: "y2", name: { he: "יוסף בן אהרן", en: "Yosef ben Aharon" }, relation: { he: "אביו של אהרן פרידמן", en: "Father of Aharon Friedman" }, hday: 9, hmonth: 2, memberId: "m16", status: "published" },
      { id: "y3", name: { he: "רחל בת יעקב", en: "Rachel bat Yaakov" }, relation: { he: "סבתו של דניאל כץ", en: "Grandmother of Daniel Katz" }, hday: 11, hmonth: 2, memberId: "m1", status: "published" },
      { id: "y4", name: { he: "מרדכי בן יצחק", en: "Mordechai ben Yitzchak" }, relation: { he: "אביו של משה קליין", en: "Father of Moshe Klein" }, hday: 14, hmonth: 4, memberId: "m4", status: "published" },
      { id: "y5", name: { he: "חנה בת דוד", en: "Chana bat David" }, relation: { he: "אמו של דניאל כץ", en: "Mother of Daniel Katz" }, hday: 3, hmonth: 8, memberId: "m1", status: "published" }
    ];
    var yzRequests = [
      { id: "yr1", memberId: "m7", name: { he: "דבורה בת מנחם", en: "Devorah bat Menachem" }, relation: { he: "סבתא", en: "Grandmother" }, hday: 20, hmonth: 2, status: "pending", at: "2026-11-15" }
    ];
    var prayers = [
      { id: "p1", he: "שחרית", en: "Shacharit", time: 375, group: "weekday", days: "all" },
      { id: "p2", he: "שחרית (יום ראשון)", en: "Shacharit (Sunday)", time: 480, group: "weekday", days: "days", weekdays: [0] },
      { id: "p3", he: "מנחה", en: "Mincha", time: 975, group: "weekday", days: "all" },
      { id: "p4", he: "מעריב", en: "Maariv", time: 1020, group: "weekday", days: "all" },
      { id: "p5", he: "מעריב שני", en: "Late Maariv", time: 1290, group: "weekday", days: "all" },
      { id: "p6", he: "שיעור גמרא", en: "Gemara Shiur", time: 1230, group: "weekday", days: "days", weekdays: [1, 3] },
      { id: "p7", he: "שחרית", en: "Shacharit", time: 375, group: "friday" },
      { id: "p8", he: "מנחה וקבלת שבת", en: "Mincha and Kabbalat Shabbat", time: 980, group: "friday" },
      { id: "p9", he: "שחרית", en: "Shacharit", time: 525, group: "shabbat" },
      { id: "p10", he: "שיעור לפני מנחה", en: "Shiur before Mincha", time: 925, group: "shabbat" },
      { id: "p11", he: "מנחה", en: "Mincha", time: 960, group: "shabbat" },
      { id: "p12", he: "מעריב מוצאי שבת", en: "Maariv, Motzei Shabbat", time: null, rel: "endsMinus3", group: "shabbat" }
    ];
    var sheet = {
      title: { he: "לשבת הזאת", en: "This Shabbat" },
      note: { he: "הקידוש נתרם על ידי משפחת פלדמן", en: "Kiddush sponsored by the Feldman family" },
      onTv: false,
      rows: [
        { id: "s1", day: "fri", he: "הדלקת נרות", en: "Candle Lighting", src: "candles", star: true },
        { id: "s2", day: "fri", he: "מנחה וקבלת שבת", en: "Mincha and Kabbalat Shabbat", src: "prayer:p8" },
        { id: "s3", day: "fri", he: "שקיעה", en: "Shkiah", src: "friShkiah" },
        { id: "s4", day: "sat", he: "שחרית", en: "Shacharit", src: "prayer:p9" },
        { id: "s5", day: "sat", he: "סוף זמן ק״ש מגן אברהם", en: "Latest Shema, Magen Avraham", src: "zman:shemaMga" },
        { id: "s6", day: "sat", he: "סוף זמן ק״ש גר״א", en: "Latest Shema, Gra", src: "zman:shemaGra" },
        { id: "s7", day: "sat", he: "שיעור לפני מנחה", en: "Shiur before Mincha", src: "prayer:p10" },
        { id: "s8", day: "sat", he: "מנחה", en: "Mincha", src: "prayer:p11" },
        { id: "s9", day: "sat", he: "שקיעה", en: "Shkiah", src: "satShkiah" },
        { id: "s10", day: "sat", he: "מעריב", en: "Maariv", src: "endsMinus3" },
        { id: "s11", day: "sat", he: "צאת השבת", en: "Shabbat Ends", src: "ends", star: true },
        { id: "s12", day: "sat", he: "רבינו תם", en: "Rabbeinu Tam", src: "rt" }
      ],
      overrides: {}, sentAt: null
    };
    var joinReqs = [
      { id: "j1", he: "נועם ליבר", en: "Noam Lieber", phone: "(555) 0142-7781", email: "noam.lieber@example.net", status: "pending", at: "2026-11-16T19:20:00Z" }
    ];
    var inbox = [
      { id: "i1", ref: "10482231", name: "Moshe Klein", email: "moshe.klein@example.com", amount: 180, type: "donation", date: "2026-11-16", note: "לרפואה שלמה|For a refuah shelemah", last4: "4242", wallet: "", status: "pending" },
      { id: "i2", ref: "10482277", name: "Sarah Miller", email: "sarah.miller@example.net", amount: 50, type: "donation", date: "2026-11-16", note: "", last4: "1881", wallet: "Apple Pay", status: "pending" },
      { id: "i3", ref: "10482290", name: "Y. Rubin", email: "yaakov.rubin@example.com", amount: 250, type: "balance", date: "2026-11-17", note: "", last4: "0005", wallet: "", status: "pending" }
    ];
    var recurring = [
      { id: "r1", he: "דמי חבר חודשיים", en: "Monthly membership", amount: 60, freq: "monthly", count: 11, active: true, next: "2026-12-01" },
      { id: "r2", he: "דמי חבר שנתיים", en: "Annual membership", amount: 720, freq: "annual", count: 6, active: true, next: "2027-09-01" }
    ];
    var role = function (id, r) { var m = members.filter(function (x) { return x.id === id; })[0]; return { mid: id, he: m.he, en: m.en, email: m.email, role: r }; };
    var users = [
      role("m15", "super"), role("m13", "finance"), role("m14", "content"), role("m3", "both"),
      role("m1", "member"), role("m2", "member"), role("m4", "member"), role("m5", "member"), role("m6", "member"),
      role("m7", "member"), role("m8", "member"), role("m9", "member"), role("m10", "member"), role("m16", "member"), role("m18", "member")
    ];
    var ago = function (h) { return new Date(Date.now() - h * 3600000).toISOString(); };
    var notifs = [
      { id: "n1", to: "super", he: "בקשת הצטרפות חדשה: נועם ליבר", en: "New join request: Noam Lieber", at: ago(18), read: false },
      { id: "n2", to: "finance", he: "תשלום בכרטיס התקבל: Y. Rubin, $250.00", en: "Card payment received: Y. Rubin, $250.00", at: ago(2), read: false },
      { id: "n3", to: "m1", he: "התשלום שלך התקבל: $150.00. תודה!", en: "Your payment was received: $150.00. Thank you!", at: ago(70), read: true },
      { id: "n4", to: "content", he: "בקשת יארצייט חדשה מחיים וייס", en: "New yahrzeit request from Chaim Weiss", at: ago(30), read: false },
      { id: "n5", to: "members", he: "הודעה חדשה: שיעור בפרשת השבוע", en: "New announcement: Weekly Parasha Shiur", at: ago(26), read: false }
    ];
    var act = function (h, area, he, en, who) { return { id: "a" + h, at: ago(h), area: area, he: he, en: en, who: who }; };
    var activity = [
      act(2, "finance", "רשם תשלום: יעקב רובין, $120.00 (Zelle)", "Recorded payment: Yaakov Rubin, $120.00 (Zelle)", "יוסף אדלר|Yosef Adler"),
      act(5, "screen", "פרסם הודעה: שיעור בפרשת השבוע", "Published announcement: Weekly Parasha Shiur", "מנחם רוט|Menachem Roth"),
      act(9, "times", "עדכן זמן תפילה: מנחה 4:15", "Updated davening time: Mincha 4:15", "מנחם רוט|Menachem Roth"),
      act(20, "join", "בקשת הצטרפות התקבלה: נועם ליבר", "Join request received: Noam Lieber", "נועם ליבר|Noam Lieber"),
      act(28, "finance", "נדרי שבת נשמרו: 9 שורות, $612.00", "Shabbat nedarim saved: 9 lines, $612.00", "יוסף אדלר|Yosef Adler"),
      act(50, "permissions", "מינה את יהודה שטרן לגבאי כספים ותוכן", "Granted Yehuda Stern finance and content", "ראובן הלפרן|Reuven Halpern"),
      act(73, "sheet", "עדכן את דף השבת: שחרית 8:45", "Updated the Shabbat sheet: Shacharit 8:45", "מנחם רוט|Menachem Roth"),
      act(96, "backup", "גיבוי ידני הורד", "Manual backup downloaded", "ראובן הלפרן|Reuven Halpern")
    ];
    var backups = [];
    for (var b = 0; b < 10; b++) {
      var d = new Date(2026, 10, 17 - b, 3, 0, 4 + b);
      backups.push({ at: d.toISOString(), ok: true, docs: 1880 - b * 6, kb: 412 - b });
    }
    return {
      v: 1,
      shul: {
        he: "קהילת נחלת העמק", en: "Kehillat Nachalat HaEmek",
        cityHe: "סידר הולו", cityEn: "Cedar Hollow",
        address: "120 Orchard Way, Cedar Hollow", phone: "(555) 0100-0000", email: "office@example.org", zelle: "donate@example.org"
      },
      members: members, general: general, ledger: ledger, items: items, yahrzeits: yahrzeits, yzRequests: yzRequests,
      prayers: prayers, sheet: sheet, joinReqs: joinReqs, inbox: inbox, recurring: recurring, users: users,
      notifs: notifs, activity: activity, backups: backups,
      tvDisplay: { mode: "auto", level: 42, from: "23:30", toKind: "alot", to: "05:00", alotBefore: 60, reloadAt: 0, lastReload: null },
      tvTexts: {}, homeTexts: {},
      pushOn: {},
      demoUsers: {
        applicant: { he: "איתן ברון", en: "Eitan Baron", email: "eitan.baron@example.net" },
        member: { he: "דניאל כץ", en: "Daniel Katz", email: "daniel.katz@example.com", mid: "m1" },
        content: { he: "מנחם רוט", en: "Menachem Roth", email: "menachem.roth@example.com", mid: "m14" },
        finance: { he: "יוסף אדלר", en: "Yosef Adler", email: "yosef.adler@example.com", mid: "m13" },
        super: { he: "ראובן הלפרן", en: "Reuven Halpern", email: "reuven.halpern@example.com", mid: "m15" }
      },
      applicant: { status: "none", phone: "" }
    };
  };
})();
