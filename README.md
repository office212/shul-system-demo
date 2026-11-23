# Shul System Demo

**Your Shul. Your System. · בית הכנסת שלכם. המערכת שלכם.**

An interactive sales experience for the shul management platform. It opens on the
board at the shul entrance (`#/`): the cork board every gabbai knows, full of handwritten notes.
Each note, torn off the board, shows where it lives in the system, live; when the board is empty
the shul screen lights up on the same wall. The platform
tour (`#/tour`) has the real product running live inside it, lets a visitor
personalize it with their shul's name and a design direction, and leads into the product
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

The floating dock at the bottom of every page holds the demo controls (on phones, a single
"Demo controls" tab in the corner that opens them all). They change the
presentation, never the product:

- **Viewing as**: website visitor, member, finance gabbai, content gabbai, administrator or a new sign-in.
- **Design**: four example designs (Jerusalem, Clear, Warm, Royal) and a preview-only brand color. The design is a separate, fully customizable layer over the same system.
- **Time**: pin a moment of the demo week to see the TV's states (before Netz, night dimming, Friday, Shabbat).
- **Language**: Hebrew or English.
- **Reset**: restores the fictional data, the name, the design and the time.
- **Request a proposal**: prepares the request and opens it in the visitor's own email app, addressed to the
  sales contact; the page also shows the email and phone for direct contact. The demo itself sends nothing.

## Contact the seller from any page

- A gold **Request a demo** button in the top bar of every page (overview, showcases, screen showroom, proposal,
  shul website, member pages and administration). On phones it becomes a compact "Demo" button.
- A slim contact bar at the bottom of every page: Request a demo, email and phone. Not on the screen itself (`#/tv`).
- On the platform tour hero: Request a demo, Call, and the email address. The board page ends with
  a note with tear-off tabs (the proposal), the phone and the email address. Each showcase ends with a
  "See this running in your shul" band, and the screen showroom has its own Request a demo button.

## Experience pages

| Address | What |
|---|---|
| `#/` | The board at the entrance: ten notes (davening times, a member's debt, Shabbat nedarim, a yahrzeit, "gabbai wanted", Mazal Tov, last week's Shabbat times, a receipt, a card payment to check, a new family). Tearing one off opens the capability that replaces it, in the live product. The empty board becomes the screen, a brass plaque takes the shul's name, a weekly-sheet Q&A, and a tear-off note for the request |
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
| `#/me` | Congregant | My balance, pay by card, payments and charges, statement, CSV, family yahrzeits, times, announcements |
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
- `js/board.js`, `css/board.css`: the board at the entrance (`#/`)
- `css/paper.css`: the paper-and-ink look of everything around the product (tour, showcases, screen showroom,
  proposal, the demo bar and the contact strip). The product screens keep their example designs.
- `js/experience.js`, `css/experience.css`: the platform tour, showcases, admin shell and portal styles
- `js/tv.js`, `js/sheet.js`: the TV screen and the Shabbat bulletin
- `js/views-*.js`: public pages, congregant, finance, gabbai and admin screens
