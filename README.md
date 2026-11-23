# Shul System Demo

**Your Shul. Your System. · בית הכנסת שלכם. המערכת שלכם.**

An interactive sales experience for the shul management platform. It opens on the
gabbai's drawer (`#/`): a walnut desk and an open drawer, seen from above, holding what a gabbai
carries around (a slip with the new Mincha time, an envelope of dues, the nedarim notebook, a flyer,
a yahrzeit card, the screen's remote and the keys). Pick one up and the real system, live on the demo
data, shows what replaces it. When the drawer is empty, it closes. Below it: what else is included,
three ways to try the system yourself, "make it yours" (type the shul's name, pick a design, and the
live website and member account change), and the contact on a business card.

One path: the drawer tells the story, "Enter the system" opens the real product with the demo bar, and
"Request a demo" opens the proposal. Older addresses (`#/tour`, `#/screen`, `#/showcase/*`) lead to the
matching place in the drawer.

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
- **Design**: four example designs (Jerusalem, Clear, Warm, Royal); the shul's name and the design are also tried at the end of the drawer page. The design is a separate, fully customizable layer over the same system.
- **What to try?**: five guided tasks (record a payment, change a davening time, enter Shabbat nedarim, see it as a member, post to the screen), each opening the right screen in the right role.
- The demo bar is hidden on the drawer and the proposal page. Moments of the week for the screen are on the drawer's remote.
- **Language**: Hebrew or English.
- **Reset**: restores the fictional data, the name, the design and the time.
- **Request a proposal**: prepares the request and opens it in the visitor's own email app, addressed to the
  sales contact; the page also shows the email and phone for direct contact. The demo itself sends nothing.

## Contact the seller from any page

- **Request a demo** in the top bar of the drawer, and in the top bar of the product (shul website, member pages
  and administration). On phones it becomes a compact "Demo" button.
- A slim contact bar at the bottom of the product pages: Request a demo, email and phone. Not on the screen itself (`#/tv`).
- The drawer ends with a business card on the desk, and the proposal page shows it beside the form.

## Experience pages

| Address | What |
|---|---|
| `#/` | The gabbai's drawer: seven objects (davening times, dues, Shabbat nedarim, a flyer, yahrzeits, the screen, the keys to roles and backup); each one, picked up, opens the live system that replaces it; what else is included; try it; make it yours (the shul's name and a design, live); contact |
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
- `js/drawer.js`, `css/drawer.css`: the gabbai's drawer (`#/`); its wood and paper textures are generated images in `img/` (`desk.jpg`, `oak.jpg`, `liner.jpg`, `grain.png`)
- `css/paper.css`: the paper-and-ink look of the demo bar and the contact strip. The product screens keep their example designs.
- `js/experience.js`: shared live-frame helpers, the shul-name and design control, older addresses, and the proposal page (`#/proposal`)
- `css/experience.css`: frames, admin shell and portal styles
- `js/tv.js`, `js/sheet.js`: the TV screen and the Shabbat bulletin
- `js/vendor/qrcode.js`: QR code generator by Kazuhiko Arase (MIT license), for the screen's donation code
- `js/views-*.js`: public pages, congregant, finance, gabbai and admin screens
