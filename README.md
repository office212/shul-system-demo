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

The management layer (switch role to Admin, or press Ctrl+K anywhere):

- **Command center** (`#/hq`): KPIs with trends, a smart assistant that proposes
  one-click actions (payment reminders, matching a payment, approving a
  yahrzeit, offering an open kiddush), a campaign thermometer, today's schedule
  and a live feed with an optional simulation of incoming sample donations.
- **Aliyot board** (`#/aliyot`): auto-assigns honors by chiyuv (yahrzeit, Bar
  Mitzvah, new baby) and rotation, prints a gabbai's sheet, and records
  everything as nedarim on Saturday night.
- **Seat map** (`#/seats`): High Holiday seating; click a seat to sell, hold or
  release it, and the charge lands on the member's account.
- **Quick search** (Ctrl+K): members, screens and actions.

Try the TV screen: open "מסך בית הכנסת" (or "TV screen"), press "12 שניות
לפני הדלקת נרות", and watch it switch to Shabbat Shalom with candles by
itself.

## Contact

Want this system for your synagogue? Call 347-244-9382 or email
hanochhason@gmail.com.
