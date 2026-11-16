# Shul System Demo

An interactive sales demo of a synagogue management system: davening times,
a TV screen that switches to Shabbat mode by itself, member area, finance
desk, donations, join flow, notifications, and a guided tour. Hebrew and
English, with a role switcher and a customization panel that re-skins the
whole demo live.

**Everything here is fictional.** The shul is "Kehillat Noam", a made-up
congregation. Every person, amount, dedication, and date is invented
sample data. No real congregation, member, or payment is involved, and
nothing leaves the browser: there is no server, no database, and no network
request. Donations in the demo are simulated; no card is charged.

## How to view it

- Live: https://office212.github.io/shul-system-demo/
- Locally: download this repo and open `index.html` in a browser. No server
  and no internet needed; it runs straight from the file.

The home page is a full pitch page: type your own shul's name in the hero and
the whole demo re-brands as you type; press "לראות את השבת נכנסת" to watch the
screen enter Shabbat; move Friday's Mincha in the "update once" lab and see the
site, the phone and the screen follow; and use the hours calculator and FAQ.

## What is in the demo

Everything is reachable from the command center (`#/hq`, "All modules"), from
quick search (Ctrl+K) and from "What's included". Each module is a working
demo on invented data; none of it is a promise about a shipped product.

| Area | Screens |
|---|---|
| Core | landing, times (+ editor), TV screen, donate, join, member area, finance, admin, notifications |
| Management | command center with the smart assistant (`#/hq`), aliyot board (`#/aliyot`), seat map (`#/seats`), family seat booking (`#/book`) |
| Shabbat | the gabbai's Friday and the Shabbat sheet (`#/friday`), Shabbat autopilot (`#/autopilot`) |
| Giving | matching campaign, embeddable widget, Bit, Section 46, Nedarim Plus, accounting export (`#/giving`), entrance kiosk (`#/kiosk`) |
| Community | minyan sign-up (`#/minyan`), message center (`#/messages`), a neder from the bimah (`#/bimah`), events (`#/events`), the rabbi's workspace (`#/rabbi`), children, meals and chesed (`#/chesed`) |
| Money | expenses and forecast (`#/expenses`) |
| Tools | member import (`#/import`), screen builder and times import (`#/tvbuild`), public website (`#/site`), shul directory (`#/directory`) |
| Selling | comparison (`#/compare`), ShulCloud alternative (`#/alt`) |

Rules the demo keeps: no prices, no ethnic identity, Shabbat-only automatic
switching, no recurring donations and no funds (every donation counts toward
the one campaign), no numeric time promises, no invented testimonials.

To add the 90-second tour video, put the file in `assets/` and set
`sales.video` in `js/data.js`; the slot under the hero appears by itself.

Try the TV screen: open "מסך בית הכנסת" (or "TV screen"), press "12 שניות
לפני הדלקת נרות", and watch it switch to Shabbat Shalom with candles by
itself.

## Contact

Want this system for your synagogue? Call 347-244-9382 or email
hanochhason@gmail.com.
