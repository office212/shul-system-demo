# Shul System Demo

**Your Shul. Your System. · בית הכנסת שלכם. המערכת שלכם.**

An interactive sales experience for the synagogue management platform. It opens on a
platform overview (`#/`) with the real product running live inside it, lets a visitor
personalize it with their shul's name and a design direction, and leads into the product
itself: the shul website, the member portal, the administration and the TV.

See `FEATURE-MAP.md` for how every capability maps to the production repository.

An interactive sales demo of the synagogue management system, built for GitHub Pages.
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

The floating dock at the bottom of every page holds the demo controls. They change the
presentation, never the product:

- **Viewing as**: website visitor, member, finance gabbai, content gabbai, administrator or a new sign-in.
- **Design**: four example designs (Jerusalem Classic, Modern Blue, Royal Elegant, Minimal Light) and a preview-only brand color.
- **Time**: pin a moment of the demo week to see the TV's states (before Netz, night dimming, Friday, Shabbat).
- **Language**: Hebrew or English.
- **Reset**: restores the fictional data, the name, the design and the time.
- **Request a proposal**: prepares a request to copy; the demo sends nothing. To enable a real
  contact, set `window.SHUL_SALES_CONTACT = { email: "..." }` before `js/experience.js` loads.

## Experience pages

| Address | What |
|---|---|
| `#/` | Platform overview: live composition, personalization, perspectives, five interactions, daily operations, customization tiers |
| `#/showcase/ledger` | One ledger, two views: finance gabbai and member side by side |
| `#/showcase/tv` | From editor to sanctuary: preview and publish to the TV |
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
| `#/gabbai/shabbat` | Content gabbai, super admin | Printable Shabbat sheet, show on TV, Shabbat Shalom to the community (super admin) |
| `#/finance/...` | Finance gabbai, super admin | Home, payment and charge, Shabbat nedarim, who owes, members and join requests, member card, card payments inbox, tax letters, annual report, recurring charges |
| `#/backup` | Finance gabbai, super admin | Backup status, download, restore dry run (super admin) |
| `#/admin` | Super admin | Users and roles, broadcast notification |
| `#/gabbai/activity` | Super admin | Activity log |
| `#/gabbai/landing` | Super admin | Landing page texts editor |
| `#/gabbai/settings` | Gabbaim | Settings |

## Files

- `index.html`: the shell
- `css/app.css`: site styles and the four themes; `css/tv.css`: the TV board
- `js/core.js`: language, store, demo week, zmanim, money, roles
- `js/seed.js`: the fictional data
- `js/ui.js`: router and layouts (site, admin shell, experience, TV), header, modals, toasts, simulated push, bell
- `js/presenter.js`: the presentation dock
- `js/experience.js`, `css/experience.css`: the sales experience, showcases, admin shell and portal styles
- `js/tv.js`, `js/sheet.js`: the TV screen and the Shabbat sheet
- `js/views-*.js`: public pages, congregant, finance, gabbai and admin screens
