# The Shul System film

A 71-second marketing film for Shul System, in Hebrew and in English.

| | |
|---|---|
| Hebrew | [`shul-system-he.mp4`](shul-system-he.mp4) |
| English | [`shul-system-en.mp4`](shul-system-en.mp4) |

1920 × 1080, 60 fps, H.264 + AAC, stereo, about 40 MB each. Posters: [`poster-he.jpg`](poster-he.jpg), [`poster-en.jpg`](poster-en.jpg).

## What is in it

| Time | Scene | What it shows |
|---|---|---|
| 0:00 | The gabbai's drawer | Slips of paper, envelopes, the nedarim notebook. Everything in here, the system already does. |
| 0:08 | The mark | Your whole shul, in one system |
| 0:12 | The screen in the shul | Zmanim, the next minyan, the community board, the donation QR code, and Shabbat mode |
| 0:22 | Davening times | Mincha moves from 4:15 to 4:20 once, and the screen and the website follow |
| 0:31 | Finance and nedarim | One table, one save. Who owes what, at any moment |
| 0:41 | The member account | The balance on a phone, paid by card, with the notification that follows |
| 0:50 | In your design | Nine of the example designs, one on every beat |
| 0:57 | A few more things | The bulletin, yahrzeits, announcements, access, the log, backup, tax letters, two languages |
| 1:02 | The call | Request a personal demo, with the contact details from the demo site |

Every product screen in the film is a real capture of this demo, running on its fictional
congregation. Every claim is one the home page or the drawer page already makes
(see [`FEATURE-MAP.md`](../FEATURE-MAP.md)).

Two things are composed rather than captured, and both stay true to the product:

- **The Mincha close-up.** The page's live preview of the screen is small, so for the close-up
  a sharp capture of the very same screen (same moment, same new time) is laid over it.
- **The phone frames.** Each phone screen gets a status bar above it, as an installed app has.
  The demo's simulated wallet sheet is left out: the film goes from the pay button to the paid account.

## How it is made

There is no video editor in this. The film is a web page whose every animated value is a pure
function of time; a script asks the page for frame after frame and ffmpeg joins them.

```text
comp/
  index.html     the stage: ?lang=he|en   ?t=12.5 to jump   ?play=1 for a rough real-time preview
  engine.js      a small deterministic animation engine: seek(t) draws any frame, in any order
  film.js        the nine scenes on one timeline; laid out for Hebrew, mirrored for English
  film.css       the look: device frames, type, the backdrop
  copy.js        every word, in Hebrew and English, and the contact details
scripts/
  lib.mjs        opening the demo in Chromium, with the demo-only chrome hidden
  capture.mjs    captures the product screens in both languages  ->  shots/<lang>/
  render.mjs     draws every frame and encodes the film            ->  out/
  soundtrack.py  the music and the interface sounds, synthesized   ->  out/soundtrack.wav
  frames.mjs     single frames, for review
  strip.mjs      a strip of frames, for checking motion
  sheet.mjs      a contact sheet of captures
  audiocheck.py  octave-band levels of the soundtrack, per scene
```

### Making it again

It needs Node with Playwright (Chromium), ffmpeg (built with zimg, for the `zscale` filter), and Python 3 with numpy and scipy.

```bash
python3 -m http.server 8765 --bind 127.0.0.1 &          # serve the repository root
node video/scripts/capture.mjs both                      # about 6 minutes: the screens, in both languages
node video/scripts/render.mjs he --draft --noencode      # writes out/cues-he.json (and a quick draft)
python3 video/scripts/soundtrack.py                      # out/soundtrack.wav, placed on the film's cues
node video/scripts/render.mjs he --audio video/out/soundtrack.wav --out video/shul-system-he.mp4
node video/scripts/render.mjs en --audio video/out/soundtrack.wav --out video/shul-system-en.mp4
```

To watch it while changing it, open
`http://127.0.0.1:8765/video/comp/index.html?lang=he&play=1`.

`shots/` and `out/` are not committed: both are rebuilt from the demo by the commands above.
A full render draws 4,260 frames at twice the size (about 7 minutes on four cores) and needs about 7 GB of disk for them.

The frames are brought down to 1080p at 16 bits, debanded and dithered with a fixed pattern before encoding,
so the dark gradients of the backdrop stay smooth in an 8-bit H.264 file (`render.mjs`, the encode step).

### Changing it

- **The words:** `comp/copy.js`. Hebrew and English sit side by side.
- **The contact details on the last frame:** `contact` at the bottom of `comp/copy.js`.
- **The timing of a scene:** each scene is one block in `comp/film.js`, with its times written out in seconds.
  Scene starts sit on the music's beat (96 BPM, one beat = 0.625 s).
- **The designs shown:** the `TH` list in scene 7 of `comp/film.js`.

## Sound

The music is an original piece, synthesized in `scripts/soundtrack.py` (an electric piano, a plucked
string, a pad, a bass, light percussion and a small bell, in D major at 96 BPM). The interface sounds
are synthesized too, and placed on cues that the film itself writes out. The only recordings are the
demo's own drawer sounds (`audio/drawer-open.mp3`, `audio/drawer-close.mp3`, Pixabay Content License).
There is no voice-over.

## Credits

- **Fonts:** Frank Ruhl Libre, Heebo and Inter, served from Google Fonts (SIL Open Font License).
- **Drawer sound:** see the main [README](../README.md#-credits).
