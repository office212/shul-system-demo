<!-- ─────────────────────────────────────────────────────────────
     Shul System · interactive demo · README
     Header art, screenshots and the drawer recording: .github/readme/
     ───────────────────────────────────────────────────────────── -->

<div align="center">

<a href="https://office212.github.io/shul-system-demo/">
  <img src=".github/readme/banner.svg" alt="Shul System · One system for the whole shul" width="100%">
</a>

<h1>Shul System Demo</h1>

<p><b>An interactive sales experience for a complete shul management platform</b><br>
<sub>The screen in the shul · davening times and zmanim · the Shabbat bulletin · donations · members, nedarim and finance</sub></p>

<p>
  <a href="https://office212.github.io/shul-system-demo/"><img alt="Open the live demo" src="https://img.shields.io/badge/▶_Open_the_live_demo-0e2c4c?style=for-the-badge"></a>
  &nbsp;
  <a href="https://office212.github.io/shul-system-demo/#/proposal"><img alt="Request a demo" src="https://img.shields.io/badge/✉_Request_a_demo-e6cb92?style=for-the-badge"></a>
</p>

<p>
  <img alt="GitHub Pages" src="https://img.shields.io/badge/hosted_on-GitHub_Pages-3b2416?style=flat-square&logo=githubpages&logoColor=e6cb92&labelColor=24160c">
  <img alt="HTML CSS JS" src="https://img.shields.io/badge/HTML_·_CSS_·_JS-no_build_step-3b2416?style=flat-square&logo=javascript&logoColor=e6cb92&labelColor=24160c">
  <img alt="No backend" src="https://img.shields.io/badge/backend-none-3b2416?style=flat-square&labelColor=24160c">
  <img alt="Data" src="https://img.shields.io/badge/data-in_your_browser-3b2416?style=flat-square&labelColor=24160c">
  <img alt="Languages" src="https://img.shields.io/badge/עברית_%7C_English-0e2c4c?style=flat-square">
  <img alt="Designs" src="https://img.shields.io/badge/designs-14_examples-0e2c4c?style=flat-square">
  <img alt="Fictional" src="https://img.shields.io/badge/data-100%25_fictional-0e2c4c?style=flat-square">
</p>

<br>

<a href="https://office212.github.io/shul-system-demo/">
  <img src=".github/readme/shot-home.jpg" alt="The home page: Your whole shul, in one system" width="88%">
</a>

<br><br>

<a href="https://office212.github.io/shul-system-demo/#/drawer">
  <img src=".github/readme/drawer.gif" alt="The gabbai's drawer opens; the Mincha slip is picked up and the real system moves Mincha by five minutes, live on the screen" width="88%">
</a>

<sub><i>The drawer opens, a slip with the new Mincha time is picked up, and the real system moves Mincha by five minutes. The shul screen beside it follows.</i></sub>

</div>

<br>

## 🗄️ The gabbai's drawer

The site opens on the marketing home page (`#/`): what the system is, its six parts shown as live product frames, what it replaces, how a shul gets started, common questions and the demo request. The gabbai's drawer tells the same story another way at `#/drawer`: a walnut desk and an open drawer, seen from above, holding
what a gabbai carries around. **Pick one up and the real system, running on the demo data, shows what replaces it.**
When the drawer is empty, it closes.

<table>
<tr>
<td width="50%"><img src=".github/readme/shot-drawer-open.webp" alt="The open drawer"></td>
<td width="50%"><img src=".github/readme/shot-drawer-obj.webp" alt="An object picked up: Mincha moved? Change it once."></td>
</tr>
</table>

| | In the drawer | What replaces it |
|:-:|:--|:--|
| 1 | 📝 A slip with the new Mincha time | **Davening times.** *Mincha moved? Change it once.* |
| 2 | ✉️ An envelope of membership dues | **Balances and payments.** *Nobody chases balances.* |
| 3 | 📓 The nedarim notebook | **Shabbat nedarim.** *Motzei Shabbat: one table, one save.* |
| 4 | 🎉 A Melave Malka flyer | **Announcements and flyers.** *Post it once. Everyone sees it.* |
| 5 | 🕯️ The yahrzeit card | **Yahrzeits.** *The family asks, you approve. The screen remembers every year.* |
| 6 | 📺 The screen's remote | **The screen in the shul.** *The screen runs itself. On Shabbat too.* |
| 7 | 🔑 The keys | **Gabbaim and permissions.** *A new gabbai? Nothing gets lost.* |

<details>
<summary><b>🔊 How it sounds, and the rest of the page</b></summary>
<br>

- The drawer starts ajar. The visitor's first click pulls it open with the sound of a wooden drawer. Picking things up rustles paper, jingles keys or taps the remote. If nobody clicks, the drawer opens quietly after a few seconds.
- The drawer sound is a real recording (`audio/drawer-open.mp3`, `audio/drawer-close.mp3`), cut from a Pixabay sound effect that is free to use under the Pixabay Content License. The paper, keys and remote sounds are made in the browser with Web Audio (`js/sound.js`). A speaker button in the top bar turns them off.
- Below the drawer come what else is included, three ways to try the system yourself, and "make it yours". In "make it yours" you type the shul's name and pick a design, and the live website and member account change in front of you. The page ends with the contact details on a business card.
- There is one path through the demo. The drawer tells the story, **Enter the system** opens the real product with the demo bar, and **Request a demo** opens the proposal. Older addresses (`#/tour`, `#/screen`, `#/showcase/*`) lead to the matching place in the drawer.

</details>

<div align="center">
<br>
<b>…and a few more things that no longer need a drawer</b>
<br><br>

| 📜 Shabbat bulletin | 💳 Online donations | 🙋 Self sign-up | 🧾 Tax letters | 🌍 Hebrew + English |
|:-:|:-:|:-:|:-:|:-:|
| builds itself from the times, ready to print | card, Apple Pay and Google Pay | new families apply, you approve | an annual report and a letter for every member | everything, in both languages |

<sub>In the real system, but not simulated here: 📱 a gabbai app for Android phones · 🖨️ printing on the shul's printer from anywhere · 🛰️ remote screen control (a screenshot, power, and an alert if the screen goes offline)</sub>

</div>

<br>

## 📺 The screen in the shul

<div align="center">
<img src=".github/readme/tv.webp" alt="The always-on TV screen: davening times, community board, zmanim" width="92%">
</div>

An always-on board for the shul's TV. It shows the **zmanim**, the **davening times** with a label on the next minyan, a **community board**, the halacha of the day and **Daf Yomi**, a **Netz countdown**, the parasha line, a Shabbat block from Thursday noon, an early-Shabbat card, **Shabbat mode** until Shabbat ends and a scannable **donation QR code**. The gabbai controls its brightness and can refresh it remotely.

<br>

## 🖥️ Inside the system

<table>
<tr>
<td width="50%" valign="top">
<img src=".github/readme/shot-gabbai.webp" alt="Gabbai dashboard">
<p align="center"><b>Gabbai dashboard</b><br><sub>Tiles by role, alerts, a live TV preview and recent actions · <code>#/gabbai</code></sub></p>
</td>
<td width="50%" valign="top">
<img src=".github/readme/shot-site.webp" alt="Shul website">
<p align="center"><b>The shul's website</b><br><sub>Welcome, this Shabbat's times, quick links, directions · <code>#/site</code></sub></p>
</td>
</tr>
<tr>
<td valign="top">
<img src=".github/readme/shot-finance.webp" alt="Finance home">
<p align="center"><b>Finance</b><br><sub>Payments and charges, undo, receipts, a card payments inbox · <code>#/finance/home</code></sub></p>
</td>
<td valign="top">
<img src=".github/readme/shot-nedarim.webp" alt="Shabbat nedarim">
<p align="center"><b>Shabbat nedarim</b><br><sub>Motzei Shabbat: one table, one save · <code>#/finance/nedarim</code></sub></p>
</td>
</tr>
<tr>
<td valign="top">
<img src=".github/readme/shot-me.webp" alt="Member account">
<p align="center"><b>My Account</b><br><sub>Balance, pay by card, history, family yahrzeits · <code>#/me</code></sub></p>
</td>
<td valign="top">
<img src=".github/readme/shot-shabbat.webp" alt="Shabbat bulletin">
<p align="center"><b>Shabbat bulletin</b><br><sub>Builds itself from the times, prints, shows on the screen · <code>#/gabbai/shabbat</code></sub></p>
</td>
</tr>
<tr>
<td valign="top">
<img src=".github/readme/shot-times.webp" alt="Davening times and screen">
<p align="center"><b>Davening times and screen</b><br><sub>Times editor, TV texts, brightness and remote refresh · <code>#/gabbai/tv</code></sub></p>
</td>
<td valign="top">
<img src=".github/readme/shot-content.webp" alt="Screen content">
<p align="center"><b>Screen content</b><br><sub>Announcements, flyers, dedications, yahrzeits, with a weekday and Shabbat preview · <code>#/gabbai/content</code></sub></p>
</td>
</tr>
<tr>
<td valign="top">
<img src=".github/readme/shot-donate.webp" alt="Donation form">
<p align="center"><b>Donations</b><br><sub>Card, Apple Pay, Google Pay, a cover-the-fee option (simulated) · <code>#/donate</code></sub></p>
</td>
<td valign="top">
<img src=".github/readme/shot-admin.webp" alt="Users and roles">
<p align="center"><b>Gabbaim and permissions</b><br><sub>Users and roles, broadcast notifications · <code>#/admin</code></sub></p>
</td>
</tr>
</table>

<br>

## 📱 In everyone's pocket

<div align="center">
<img src=".github/readme/phones.webp" alt="The website, the member account and finance on a phone, in Hebrew" width="86%">
<br>
<sub>The website, the member's account and the gabbai's finance screen on a phone. Every screen works in Hebrew (right to left) and in English.</sub>
</div>

<br>

## 🎨 It looks like your shul

The design is a separate layer over the same system, and every part of it can be customized. Fourteen example designs show the range: the first four (Jerusalem, Clear, Warm, Royal) and a collection of ten for Orthodox shuls (Heichal, Parochet, Emerald, Platinum, Techelet, Kotel, Sefer, Marble, Argaman, Erez). Each one restyles the shul screen, the website, the member account and the gabbai system. On the home page and the drawer page you can also type in the shul's name and watch the website and member account change live.

<table>
<tr>
<td width="50%" align="center"><img src=".github/readme/theme-classic.webp" alt="Jerusalem design"><br><b>Jerusalem</b> <sub>· warm stone, deep blue and brass</sub></td>
<td width="50%" align="center"><img src=".github/readme/theme-modern.webp" alt="Clear design"><br><b>Clear</b> <sub>· crisp white and one strong blue</sub></td>
</tr>
<tr>
<td align="center"><img src=".github/readme/theme-warm.webp" alt="Warm design"><br><b>Warm</b> <sub>· sand and clay, soft pill buttons</sub></td>
<td align="center"><img src=".github/readme/theme-royal.webp" alt="Royal design"><br><b>Royal</b> <sub>· night navy and champagne</sub></td>
</tr>
</table>

<div align="center"><sub>Your logo, colors and fonts · the website, the screen and the member account · every word, in Hebrew and English</sub></div>

<br>

## 🎛️ The demo bar

The demo bar at the bottom of every page holds the demo controls. On phones it is a full-width bar with short labels. These controls change how the product is presented, **never the product itself**.

| Control | What it does |
|:--|:--|
| 👁️ **Viewing as** | Switch between website visitor, member, finance gabbai, content gabbai, administrator or a new applicant |
| 🎨 **Design** | Fourteen example designs. The shul's name and the design can also be tried on the home page |
| 🧭 **What to try?** | Five guided tasks, each opening the right screen in the right role: record a payment, change a davening time, enter Shabbat nedarim, see it as a member, post to the screen |
| 🌍 **Language** | Hebrew or English |
| ↺ **Reset** | Restores the fictional data, the name, the design and the time |
| ✉️ **Request a proposal** | Prepares the request and opens it in the visitor's own email app, addressed to the sales contact. The page also shows the email and phone for direct contact. The demo itself sends nothing |

<sub>The demo bar is hidden on the drawer and on the proposal page. The screen's moments of the week are on the drawer's remote.</sub>

**Contacting the seller from any page**

- **Request a demo** sits in the top bar of the drawer and of the product (the shul website, the member pages and the administration). On phones it becomes a compact "Demo" button.
- A slim contact bar at the bottom of the product pages offers Request a demo, email and phone. It does not appear on the screen itself (`#/tv`).
- The drawer ends with a business card on the desk, and the proposal page shows the card beside the form.

<br>

## 🗺️ Every address

<details open>
<summary><b>Experience pages</b></summary>
<br>

| Address | What |
|---|---|
| `#/` | The home page: the offer, the six parts of the system running live (the screen, davening times and bulletin, finance and nedarim, the member account, website and donations, permissions and backup), today versus with the system, getting started, make it yours, try it, questions, contact |
| `#/drawer` | The gabbai's drawer: seven objects (davening times, dues, Shabbat nedarim, a flyer, yahrzeits, the screen, the keys to roles and backup); each one, picked up, opens the live system that replaces it; what else is included; try it; make it yours (the shul's name and a design, live); contact |
| `#/proposal` | Personalized demo and proposal request |

</details>

<details open>
<summary><b>Screens</b></summary>
<br>

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

</details>

> [!TIP]
> See **[`FEATURE-MAP.md`](FEATURE-MAP.md)** for how every capability shown here maps to the production repository.

<br>

## 🧱 How it is built

<table>
<tr>
<td align="center" width="25%">🪶<br><b>Static</b><br><sub>Plain HTML, CSS and JavaScript. No build step, no backend, no keys.</sub></td>
<td align="center" width="25%">💾<br><b>In the browser</b><br><sub>All data lives in the visitor's browser (localStorage). "Reset" in the demo bar restores it.</sub></td>
<td align="center" width="25%">🧪<br><b>Nothing is real</b><br><sub>The donation form and wallet buttons are simulated, and push notifications only appear on screen. Nothing is charged or sent.</sub></td>
<td align="center" width="25%">🏘️<br><b>A fictional shul</b><br><sub>"Kehillat Nachalat HaEmek", with fictional members, times and amounts.</sub></td>
</tr>
</table>

The demo mirrors the live system screen for screen, and it is built for GitHub Pages.

### ▶ Run it

Open `index.html` through any static server, for example:

```bash
python3 -m http.server 8000
```

then visit **http://localhost:8000/**. On GitHub Pages, serve the repository root.

### 📁 Files

```text
index.html                 the shell
css/
  app.css                  site styles and the first four example designs (tokens)
  themes.css               the collection: ten more example designs, each a set of tokens and a family
  product.css              the modern base for every product screen and each design's personality
  tv.css                   the TV board
  home.css                 the marketing home page and the demo request
  refine.css               finishing touches for every product screen, the demo bar and each example design
  drawer.css               the gabbai's drawer
  paper.css                the paper-and-ink look of the demo bar and the contact strip
                           (the product screens keep their example designs)
  experience.css           frames, admin shell and portal styles
js/
  core.js                  language, store, demo week, zmanim, money, roles
  seed.js                  the fictional data
  ui.js                    router and layouts (site, admin shell, experience, TV), header,
                           modals, toasts, simulated push, bell
  presenter.js             the presentation dock
  home.js                  the marketing home page (#/) and the demo request (#/proposal)
  drawer.js                the gabbai's drawer (#/drawer)
  sound.js                 paper, keys and remote sounds (Web Audio)
  experience.js            shared live-frame helpers, the shul-name and design control,
                           and older addresses
  tv.js, sheet.js          the TV screen and the Shabbat bulletin
  views-*.js               public pages, congregant, finance, gabbai and admin screens
  vendor/qrcode.js         QR code generator by Kazuhiko Arase (MIT license),
                           for the screen's donation code
img/                       drawer.jpg (the drawer, pictured on the home page) · desk.jpg, oak.jpg, liner.jpg, grain.png: the drawer's generated
                           wood and paper textures · icon.svg · og.png (link preview)
audio/                     drawer-open.mp3, drawer-close.mp3 (Pixabay Content License)
.github/readme/            the art and screenshots on this page
```

<br>

## 🙏 Credits

- **Drawer sound:** cut from a Pixabay sound effect, free to use under the Pixabay Content License.
- **QR codes:** QR code generator by Kazuhiko Arase, MIT license (`js/vendor/qrcode.js`).
- **Fonts:** served from Google Fonts.

<br>

<div align="center">

<a href="https://office212.github.io/shul-system-demo/"><img src="https://img.shields.io/badge/▶_Try_it_now-0e2c4c?style=for-the-badge" alt="Try it now"></a>
&nbsp;
<a href="https://office212.github.io/shul-system-demo/#/proposal"><img src="https://img.shields.io/badge/✉_Let's_talk-e6cb92?style=for-the-badge" alt="Let's talk"></a>

<br><br>

<img src="img/icon.svg" width="44" alt="">

<sub><b>Shul System</b> · Software for running a shul · מערכת לניהול בית הכנסת<br>
<i>A demo with fictional data. No real payments, emails or notifications.</i></sub>

<sub><a href="#shul-system-demo">⬆ Back to top</a></sub>

</div>
