# Feature-to-source map

Every product capability shown in the demo, with where it lives in the production
repository and where the demo implements it.
Presentation-only tools are listed separately at the end.

| Capability | Production source | Demo |
|---|---|---|
| Public website, landing texts editable per language | `index.html`, `src/home/home-texts.js`, `gabbai/landing/` | `#/site`, `#/gabbai/landing` (`js/views-public.js`, `js/views-gabbai.js`) |
| Shabbat and daily times on the landing page | `src/home/home-texts.js` (today/Shabbat keys), `PUBLIC_ZMANIM` switch (off on the reference site) | Shown on `#/site`; a configuration choice per shul |
| Donation form: card, Apple Pay, Google Pay, fee cover, tax note | `src/donate/sola-form.js`, `donate/`, `thanks/` | `#/donate`, `#/thanks` (simulated, nothing charged) |
| Join request, approve with role, decline, send again, welcome email | README "Join requests", `src/ui/oh-members.js`, `functions/sendWelcomeEmail` | `#/join`, `#/finance/members` |
| Member account: balance, pay by card (a balance payment records itself and updates the balance at once), totals, ledger with cancellations | `congregant/index.html` (`renderCong`), `functions/payments` | `#/me`, `portalHtml` in `js/views-member.js` |
| Family yahrzeit requests, approval to the TV | `src/ui/oh-yahrzeit.js`, `gabbai/tv/content/` | `#/me`, `#/gabbai/content?type=yahrzeit` |
| Member announcements (announcement and rabbi items) | `congregant/index.html` (`congNews`) | `#/me` |
| Finance home, payment/charge, undo, receipt | `src/ui/oh-fin.js` | `#/finance/home`, `#/finance/pay` |
| Shabbat nedarim with pledges | `src/ui/oh-fin.js` | `#/finance/nedarim` |
| Who owes, member card, void as correction, edit details, statement, CSV | `src/ui/oh-fin.js`, `functions/sendStatementEmail` | `#/finance/owes`, `#/finance/m/<id>` |
| Card payments inbox: donations match by email and wait for the gabbai to record them | `src/ui/oh-inbox.js`, `functions/payments` | `#/finance/inbox` |
| Tax letters, annual report, recurring charges | README "Finance" | `#/finance/more` |
| Davening times editor (weekday groups, specific weekdays) | `admin/prayer-times.js`, `src/ui/oh-times.js` | `#/gabbai/tv` |
| TV texts editor | `admin/tv-texts-editor.js`, `src/tv/tv-texts.js` | `#/gabbai/tv` |
| TV brightness (off, manual, automatic) and remote refresh | `admin/tv-brightness-editor.js`, `src/tv/tv-dim.js` | `#/gabbai/tv`, `#/screen` |
| Screen content with dates, days and weekday/Shabbat preview | `gabbai/tv/content/`, `src/engines/display-engine.js` | `#/gabbai/content`, `#/showcase/tv` |
| TV: zmanim, davening times, community board, Netz countdown, parasha line, Shabbat block, early Shabbat card, Shabbat mode | `tv/`, `screen/screen.js`, `src/tv/*` | `#/tv` (`js/tv.js`), `#/screen` |
| Shabbat bulletin: overrides, every week, print, show on screen, Shabbat Shalom to the community | `src/shabbat-sheet/*`, `gabbai/shabbat/` | `#/gabbai/shabbat` (`js/sheet.js`) |
| Roles: super admin, finance, content, both, member | README "Roles and permissions", `src/firebase/firestore.rules` | Admin sidebar, `#/admin`, `#/showcase/roles` |
| Activity log | `gabbai/activity/` | `#/gabbai/activity` |
| Backup download, restore dry run, nightly backup | `backup/`, `restore/`, `functions/dailybackup` | `#/backup` |
| Push notifications and bell, broadcast | `functions/notifications`, `src/ui/oh-shell.js` | Bell in every signed-in view, `#/admin` (simulated) |
| Hebrew and English | `src/ui/labels.js`, `src/ui/oh-i18n.js` | Everywhere |

## Presentation only (not product features)

Perspective switcher, example designs and brand color, the shul-name field, the demo clock,
reset, the platform overview, the showcases, the TV showroom and the proposal request.
These exist to present the product and add no shul management capability.

## Known deviations

- `#/times` is a public times page for browsing the demo week. In production the same
  information appears on the TV, and optionally on the landing page.
- Zmanim are realistic fixed values for one demo week, not a live calendar.
