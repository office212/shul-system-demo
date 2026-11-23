# Shul System Demo

**Your Shul. Your System. · בית הכנסת שלכם. המערכת שלכם.**

An interactive sales experience for the shul management platform. It opens on the
gabbai's notebook (`#/`): a scribbled to-do page every gabbai knows. Four of its lines, one at a
time, are crossed out as the real system shows what replaces them, live on the demo data. Then a
short list of what else is included, three ways to try the system yourself, the example designs,
and the contact. The platform tour (`#/tour`) has the real product running live inside it,
lets a visitor personalize it with their shul's name and a design direction, and leads into the product
itself: the shul website, the member portal, the administration and the TV.

See `FEATURE-MAP.md` for how every capability maps to the production repository.

An interactive sales demo of the shul management system, built for GitHub Pages.
It mirrors the live system screen for screen, using a fictional congregation
("Kehillat Nachalat HaEmek") with fictional members, times and amounts.

- Static site: plain HTML, CSS and JavaScript. No build step, no backend, no keys.
- All data lives in the visitor's browser (localStorage). "Reset" in the demo bar restores it.
- No real payments: the donation form and wallet buttons are simulated.
- Push notifications are simulated on screen; nothing is sent.

## Run it

Open `index.html` through any static server, for example:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000/`. On GitHub Pages, serve the repository root.

## Presentation tools (not system features)

The demo bar at the bottom of every page holds the demo controls (on phones it is a
full-width bar with short labels). They change the
presentation, never the product:

- **Viewing as**: website visitor, member, finance gabbai, content gabbai, administrator or a new applicant.
- **Design**: four example designs (Jerusalem, Clear, Warm, Royal); a preview-only brand color is in the design studio. The design is a separate, fully customizable layer over the same system.
- **What to try?**: five guided tasks (record a payment, change a davening time, enter Shabbat nedarim, see it as a member, post to the screen), each opening the right screen in the right role.
- The demo bar is hidden on the home page. Moments of the week for the screen are in the screen showroom (`#/screen`).
- **Language**: Hebrew or English.
- **Reset**: restores the fictional data, the name, the design and the time.
- **Request a proposal**: prepares the request and opens it in the visitor's own email app, addressed to the
  sales contact; the page also shows the email and phone for direct contact. The demo itself sends nothing.

## Contact the seller from any page

- A gold **Request a demo** button in the top bar of every page (overview, showcases, screen showroom, proposal,
  shul website, member pages and administration). On phones it becomes a compact "Demo" button.
- A slim contact bar at the bottom of every page: Request a demo, email and phone. Not on the screen itself (`#/tv`).
- On the platform tour hero: Request a demo, Call, and the email address. The notebook page ends with
  a torn notebook page: Request a demo, the phone and the email address. Each showcase ends with a
  "Fitted to your shul, the way you need it" band, and the screen showroom has its own Request a demo button.

## Experience pages

| Address | What |
|---|---|
| `#/` | The gabbai's notebook: four notebook lines (davening times, a member's balance, Shabbat nedarim, a yahrzeit), each crossed out as the live system shows what replaces it; what else is included; try it as the gabbai, as a member or on the screen; example designs; contact |
| `#/tour` | Platform tour: live composition, personalization, perspectives, five interactions, daily operations, customization tiers |
| `#/showcase/ledger` | One ledger, two views: finance gabbai and member side by side |
| `#/showcase/tv` | From editor to shul: preview and publish to the screen |
| `#/showcase/roles` | Every role and what it can do, and entering as any of them |
| `#/showcase/design` | Design studio: the same shul in different designs |
| `#/screen` | TV showroom with moments of the week |
| `#/proposal` | Personalized demo and proposal request |

## Screens

| Address | Who | What |
|---|---|---|
| `#/site` | Everyone | Shul website: welcome, this Shabbat's times, quick links, about, contact, directions |
| `#/tv` | Everyone | Always-on TV screen: zmanim, davening times, community board, Shabbat mode, Netz countdown, parasha line, brightness, remote refresh |
| `#/times` | Everyone | Daily zmanim, davening times, Shabbat times, candle lighting, Shabbat ends, Rabbeinu Tam, the week grid |
| `#/donate` | Everyone | Donation form: card, Apple Pay, Google Pay, dedication note, cover-the-fee option, tax receipt note |
| `#/thanks` | Everyone | Thank-you page with the emailed receipt |
| `#/join` | Signed in, not a member | Join request, pending, declined (send again), welcome |
| `#/me` | Congregant | My balance, pay by card, payments and charges, family yahrzeits, announcements (the statement and CSV are on the gabbai's member card, `#/finance/m/<id>`) |
| `#/gabbai` | Gabbaim | Gabbai home: tiles by role, alerts, live TV preview, recent actions |
| `#/gabbai/tv` | Content gabbai, super admin | Davening times editor, TV texts, brightness and remote refresh (super admin) |
| `#/gabbai/content` | Content gabbai, super admin | Announcements, mazal tov, flyers, dedications, hazkarot, yahrzeits, member yahrzeit requests, weekday and Shabbat preview |
| `#/gabbai/shabbat` | Content gabbai, super admin | Printable Shabbat bulletin, show on screen, Shabbat Shalom to the community (super admin) |
| `#/finance/...` | Finance gabbai, super admin | Home, payment and charge, Shabbat nedarim, who owes, members and join requests, member card, card payments inbox, tax letters, annual report, recurring charges |
| `#/backup` | Finance gabbai, super admin | Backup status, download, restore dry run (super admin) |
| `#/admin` | Super admin | Users and roles, broadcast notification |
| `#/gabbai/activity` | Super admin | Activity log |
| `#/gabbai/landing` | Super admin | Landing page texts editor |
| `#/gabbai/settings` | Gabbaim | Settings |

## Files

- `index.html`: the shell
- `css/app.css`: site styles and the four example designs (tokens); `css/product.css`: the modern base for every product screen and each design's personality; `css/tv.css`: the TV board
- `js/core.js`: language, store, demo week, zmanim, money, roles
- `js/seed.js`: the fictional data
- `js/ui.js`: router and layouts (site, admin shell, experience, TV), header, modals, toasts, simulated push, bell
- `js/presenter.js`: the presentation dock
- `js/notebook.js`, `css/notebook.css`: the gabbai's notebook (`#/`)
- `css/paper.css`: the paper-and-ink look of everything around the product (tour, showcases, screen showroom,
  proposal, the demo bar and the contact strip). The product screens keep their example designs.
- `js/experience.js`, `css/experience.css`: the platform tour, showcases, admin shell and portal styles
- `js/tv.js`, `js/sheet.js`: the TV screen and the Shabbat bulletin
- `js/vendor/qrcode.js`: QR code generator by Kazuhiko Arase (MIT license), for the screen's donation code
- `js/views-*.js`: public pages, congregant, finance, gabbai and admin screens
