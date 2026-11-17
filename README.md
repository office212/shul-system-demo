# Shul System Demo

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

## The demo bar

The dark bar at the top is a demo navigation aid only, not a system feature:

- **View as**: switch between visitor, new sign-in (not a member yet), congregant,
  content and times gabbai, finance gabbai and super admin, to see each role's own screens.
- **Themes**: four example looks (Jerusalem Stone, White Marble, Night Tchelet, Galilee Olive).
- **Clock**: pin the demo clock (for example Friday afternoon or before Netz) to see the TV's states.
- **Fully customizable**: every shul gets its own design, texts and everything else.
- **Reset**: restore the original fictional data.

## Screens

| Address | Who | What |
|---|---|---|
| `#/` | Everyone | Landing page: welcome, this Shabbat's times, quick links, about, contact, directions |
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
- `js/ui.js`: demo bar, header, router, modals, toasts, simulated push, bell
- `js/tv.js`, `js/sheet.js`: the TV screen and the Shabbat sheet
- `js/views-*.js`: public pages, congregant, finance, gabbai and admin screens
