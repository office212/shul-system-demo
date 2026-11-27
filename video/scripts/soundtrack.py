#!/usr/bin/env python3
"""The film's soundtrack, synthesized from scratch (numpy + scipy): an original piece in D major
at 96 BPM, and the small sounds of the interface, placed on the film's own cues.

  python3 video/scripts/soundtrack.py [cues.json] [out.wav]

The only recordings used are the demo's own drawer sounds (audio/drawer-open.mp3, drawer-close.mp3).
"""
import json, subprocess, sys
import numpy as np
from scipy import signal

SR = 48000
BEAT = 60 / 96.0            # 0.625 s
BAR = 4 * BEAT              # 2.5 s
LEN = 73.0
N = int(LEN * SR)
rng = np.random.default_rng(7)

cues_path = sys.argv[1] if len(sys.argv) > 1 else "video/out/cues-he.json"
out_path = sys.argv[2] if len(sys.argv) > 2 else "video/out/soundtrack.wav"
CUES = json.load(open(cues_path))["cues"]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def n(name):
    """'F#4' -> midi number"""
    return 12 * (int(name[-1]) + 1) + NOTE[name[:-1]]


class Bus:
    """a stereo track"""

    def __init__(self):
        self.b = np.zeros((N, 2))

    def add(self, t, x, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N or i < 0:
            return
        x = x[: N - i]
        if x.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            self.b[i:i + len(x), 0] += x * gain * l
            self.b[i:i + len(x), 1] += x * gain * r
        else:
            self.b[i:i + len(x)] += x * gain


def fade(x, a=0.004, r=0.02):
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    x = x.copy()
    x[:na] *= np.linspace(0, 1, na) ** 1.5
    x[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return x


def butter(x, kind, f, order=2):
    sos = signal.butter(order, f, btype=kind, fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


# ---------------------------------------------------------------- instruments
def ep(m, dur, vel=0.8):
    """a soft electric piano (two-operator FM with a little tine on the attack)"""
    f = hz(m)
    t = np.arange(int((dur + 0.6) * SR)) / SR
    idx = (2.7 * vel + 0.5) * np.exp(-t * 3.4) + 0.34
    car = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    car += 0.22 * np.sin(2 * np.pi * 2 * f * t + 0.6 * idx * np.sin(2 * np.pi * f * t)) * np.exp(-t * 2.5)
    tine = np.sin(2 * np.pi * f * 7.01 * t) * np.exp(-t * 30) * 0.13 * vel
    body = np.sin(2 * np.pi * f * 0.5 * t) * 0.10 * np.exp(-t * 2.2)
    amp = np.exp(-t * (1.15 + f / 900.0))
    rel = np.ones_like(t)
    k = int(dur * SR)
    rel[k:] = np.exp(-(t[k:] - dur) * 9)
    return fade((car + tine + body) * amp * rel, 0.003, 0.05) * vel


def pluck(m, dur=1.6, vel=0.8, bright=0.8):
    """a plucked string (Karplus-Strong, run at twice the rate so it stays in tune)"""
    f = hz(m)
    osr = SR * 2
    period = int(round(osr / f - 0.5))
    cnt = int(dur * osr)
    x = np.zeros(cnt)
    burst = rng.uniform(-1, 1, period)
    burst = signal.lfilter([bright], [1, -(1 - bright)], burst)
    x[:period] = burst - burst.mean()
    g = 0.9975 if f < 500 else 0.996
    a = np.zeros(period + 2)
    a[0] = 1
    a[period] = -0.5 * g
    a[period + 1] = -0.5 * g
    y = signal.lfilter([1.0], a, x)
    y = signal.resample_poly(y, 1, 2)
    y /= max(1e-9, np.abs(y).max())
    return fade(y, 0.001, 0.08) * vel


def bell(m, dur=2.4, vel=0.7):
    """a small celesta-like bell"""
    f = hz(m)
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for ratio, amp, dec in ((1, 1.0, 2.6), (2.0, 0.30, 4.5), (3.01, 0.16, 7.0), (4.2, 0.07, 10.0), (5.43, 0.04, 14.0)):
        if f * ratio < 12000:
            out += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * dec)
    return fade(out, 0.002, 0.2) * vel


def pad(ms, dur, vel=0.5, attack=1.1, release=1.6):
    """a warm pad: three slightly detuned voices per note, spread left to right"""
    cnt = int((dur + release) * SR)
    t = np.arange(cnt) / SR
    out = np.zeros((cnt, 2))
    for m in ms:
        f = hz(m)
        for cents, pan in ((-7, -0.7), (0, 0.0), (7, 0.7)):
            ff = f * 2 ** (cents / 1200)
            v = np.zeros(cnt)
            ph = rng.uniform(0, 6.28)
            for h in range(1, 10):
                if ff * h > 6500:
                    break
                v += np.sin(2 * np.pi * ff * h * t + ph * h) / h ** 1.45
            v *= 1 + 0.08 * np.sin(2 * np.pi * (0.13 + 0.05 * pan) * t + ph)
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            out[:, 0] += v * l
            out[:, 1] += v * r
    env = np.ones(cnt)
    na = int(attack * SR)
    env[:na] = np.linspace(0, 1, na) ** 1.6
    k = int(dur * SR)
    env[k:] = np.linspace(1, 0, cnt - k) ** 1.8
    return out * env[:, None] * vel / max(1, len(ms)) ** 0.5


def bass(m, dur, vel=0.8):
    f = hz(m)
    t = np.arange(int((dur + 0.12) * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + 0.42 * np.sin(4 * np.pi * f * t) + 0.16 * np.sin(6 * np.pi * f * t)
    env = np.minimum(1, t / 0.014) * (0.72 + 0.28 * np.exp(-t * 5))
    k = int(dur * SR)
    env[k:] *= np.linspace(1, 0, len(t) - k)
    return np.tanh(x * env * 1.25) * 0.8 * vel


def kick(vel=1.0, soft=False):
    t = np.arange(int(0.42 * SR)) / SR
    f = 46 + (62 if soft else 95) * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * (11 if soft else 8.5))
    click = butter(rng.normal(0, 1, len(t)), "high", 2500) * np.exp(-t * 450) * (0.05 if soft else 0.16)
    return fade(x + click, 0.0005, 0.05) * vel


def noise_hit(dur, lo, hi, decay, attack=0.001):
    t = np.arange(int(dur * SR)) / SR
    x = signal.sosfilt(signal.butter(2, [lo, hi], btype="band", fs=SR, output="sos"), rng.normal(0, 1, len(t)))
    return fade(x * np.exp(-t * decay), attack, 0.01)


def shaker(vel=1.0):
    return noise_hit(0.09, 4500, 10500, 46, 0.006) * 0.5 * vel


def hat(vel=1.0):
    return noise_hit(0.05, 7000, 14000, 110) * 0.5 * vel


def rim(vel=1.0):
    t = np.arange(int(0.08 * SR)) / SR
    return (np.sin(2 * np.pi * 1750 * t) * np.exp(-t * 130) * 0.6 + noise_hit(0.08, 1800, 5200, 150) * 0.5) * vel


def clap(vel=1.0):
    out = np.zeros(int(0.3 * SR))
    for d, g in ((0, 0.7), (0.011, 0.8), (0.022, 1.0)):
        x = noise_hit(0.22, 900, 3800, 30 if d > 0.02 else 240)
        i = int(d * SR)
        out[i:i + len(x)] += x[: len(out) - i] * g
    return out * 0.5 * vel


def sweep(dur, up=True, lo=250.0, hi=9000.0, curve=2.0):
    """a breath of filtered noise that rises (or falls): the film's 'whoosh'"""
    cnt = int(dur * SR)
    x = rng.normal(0, 1, cnt + 4096)
    out = np.zeros(cnt)
    blk, hop = 2048, 512
    win = np.hanning(blk)
    for s in range(0, cnt - blk, hop):
        p = (s + blk / 2) / cnt
        p = p ** curve if up else (1 - p) ** curve
        fc = lo * (hi / lo) ** p
        sos = signal.butter(2, [fc * 0.6, min(fc * 1.7, SR / 2 - 100)], btype="band", fs=SR, output="sos")
        out[s:s + blk] += signal.sosfilt(sos, x[s:s + blk]) * win * (hop / blk) * 2
    t = np.linspace(0, 1, cnt)
    env = (t ** 2.2 if up else (1 - t) ** 1.3 * np.minimum(1, t / 0.06))
    return out * env


def boom(vel=1.0):
    t = np.arange(int(2.6 * SR)) / SR
    f = 37 + 34 * np.exp(-t * 7)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    th = butter(rng.normal(0, 1, len(t)), "low", 180) * np.exp(-t * 14) * 0.5
    return fade(x + th, 0.002, 0.3) * vel


def air(dur=2.4, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = signal.sosfilt(signal.butter(2, [5200, 13000], btype="band", fs=SR, output="sos"), rng.normal(0, 1, (len(t), 2)), axis=0)
    return x * (np.minimum(1, t / 0.03) * np.exp(-t * 2.4))[:, None] * vel


def sparkle(bus, t0, names, step=0.11, vel=0.34):
    for i, nm in enumerate(names):
        bus.add(t0 + i * step, bell(n(nm), 1.8, vel * (1 - 0.06 * i)), 0.7, pan=0.7 * (-1) ** i)


def blip(f0, f1, dur, vel=1.0, decay=40):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay), 0.001, 0.01) * vel


def paper(dur=0.28, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = noise_hit(dur, 1400, 7500, 6, 0.012)
    wob = np.abs(signal.sosfilt(signal.butter(1, 28, fs=SR, output="sos"), rng.normal(0, 1, len(t))))
    wob /= wob.max() + 1e-9
    return x * (0.25 + wob) * np.sin(np.pi * t / dur) ** 0.8 * 0.5 * vel


def load(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


# ---------------------------------------------------------------- the piece
def at(bar, beat=0.0):
    return bar * BAR + beat * BEAT


EP, PL, PAD, BASS, DR, BELL, FX = Bus(), Bus(), Bus(), Bus(), Bus(), Bus(), Bus()

CH = {
    "D":    dict(bass="D2", pad=["A3", "D4", "E4", "F#4"], arp=["D4", "A4", "E5", "F#5", "A4", "E5", "F#5", "A5"]),
    "A/C#": dict(bass="C#2", pad=["A3", "C#4", "E4", "A4"], arp=["C#4", "A4", "E5", "C#5", "A4", "E5", "C#5", "A5"]),
    "Bm7":  dict(bass="B1", pad=["A3", "B3", "D4", "F#4"], arp=["B3", "A4", "D5", "F#5", "A4", "D5", "F#5", "A5"]),
    "G":    dict(bass="G1", pad=["G3", "B3", "D4", "F#4"], arp=["B3", "G4", "D5", "F#5", "G4", "D5", "B4", "D5"]),
    "A":    dict(bass="A1", pad=["A3", "C#4", "E4", "A4"], arp=["A3", "E4", "A4", "C#5", "E4", "A4", "C#5", "E5"]),
    "Asus": dict(bass="A1", pad=["A3", "D4", "E4", "A4"], arp=["A3", "E4", "A4", "D5", "E4", "A4", "D5", "E5"]),
    "Em7":  dict(bass="E2", pad=["G3", "B3", "D4", "E4"], arp=["E4", "B4", "D5", "G5", "B4", "D5", "G5", "B5"]),
    "G/D":  dict(bass="D2", pad=["G3", "B3", "D4", "G4"], arp=["D4", "G4", "B4", "D5", "G4", "B4", "D5", "G5"]),
}
ACC = [1.0, 0.55, 0.72, 0.58, 0.86, 0.56, 0.7, 0.52]

# --- the drawer (0 - 8.1): free time, B minor, a few notes placed on the picture
PAD.add(0.7, pad([n("B2"), n("F#3"), n("B3"), n("D4")], 3.2, 0.42, attack=1.6, release=1.4))
PAD.add(3.9, pad([n("G2"), n("D3"), n("B3"), n("D4")], 1.9, 0.44, attack=0.9, release=1.2))
PAD.add(5.75, pad([n("E3"), n("G3"), n("B3"), n("D4")], 0.6, 0.46, attack=0.5, release=0.45))
PAD.add(6.35, pad([n("A2"), n("E3"), n("A3"), n("C#4"), n("E4")], 2.1, 0.52, attack=0.5, release=0.8))
for t, notes in ((1.57, ["B3", "F#4"]), (2.32, ["D4", "A4"]), (3.07, ["F#4", "C#5"]), (4.07, ["G3", "D4", "B4"])):
    for i, nm in enumerate(notes):
        EP.add(t + i * 0.012, ep(n(nm), 1.6, 0.62 - i * 0.06), 0.9, pan=-0.25 + 0.25 * i)
picks = [c for c in CUES if c[1] == "pick"]
for i, (c, nm) in enumerate(zip(picks, ["B4", "D5", "E5", "F#5", "A5", "B5", "D6"])):
    PL.add(c[0] + 0.03, pluck(n(nm), 1.4, 0.5 + i * 0.04), 0.8, pan=-0.6 + 0.2 * i)
EP.add(6.17, ep(n("E4"), 1.4, 0.5), 0.8, -0.2)
EP.add(6.19, ep(n("B4"), 1.4, 0.5), 0.8, 0.2)
EP.add(6.52, ep(n("A4"), 1.6, 0.56), 0.8, -0.1)
EP.add(6.54, ep(n("C#5"), 1.6, 0.56), 0.8, 0.2)
EP.add(6.56, ep(n("E5"), 1.6, 0.5), 0.8, 0.3)

# --- the mark (8.75): the arch opens onto D major
HIT = at(3, 2)   # 8.75
FX.add(HIT - 0.72, sweep(0.74, True, 300, 10000, 1.8), 0.42)
FX.add(HIT, boom(1.0), 0.6)
FX.add(HIT, air(2.6), 0.10)
sparkle(BELL, HIT + 0.3, ["A6", "D7", "F#7", "A7", "F#7", "D7", "A6", "D7"], 0.156)
PAD.add(HIT - 0.05, pad([n("D3"), n("A3"), n("D4"), n("E4"), n("F#4"), n("A4")], 3.55, 0.62, attack=0.12, release=1.2))
for i, nm in enumerate(["D4", "A4", "D5", "F#5", "A5"]):
    EP.add(HIT + i * 0.016, ep(n(nm), 3.0, 0.72), 0.85, pan=-0.4 + 0.2 * i)
for i, nm in enumerate(["D5", "A5", "D6", "F#6"]):
    BELL.add(HIT + 0.02 + i * 0.07, bell(n(nm), 3.2, 0.5 - i * 0.05), 0.8, pan=0.5 - 0.3 * i)
for t, nm, v in ((at(4, 0), "F#5", 0.55), (at(4, 1), "A5", 0.5), (at(4, 2), "D6", 0.55), (at(4, 3), "E6", 0.42), (at(4, 3.5), "F#6", 0.36)):
    BELL.add(t, bell(n(nm), 2.6, v), 0.8, pan=0.2)
for i, nm in enumerate(["D4", "A4", "E5", "F#5", "A4", "E5", "F#5", "A5"]):
    EP.add(at(4, i * 0.5), ep(n(nm), 0.9, 0.42 + 0.03 * i), 0.7, pan=0.3 * (-1) ** i)
BASS.add(HIT, bass(n("D2"), 3.5, 0.75), 0.9)
FX.add(at(5) - 0.5, sweep(0.5, True, 500, 9000, 2.0), 0.2)


# --- the body (bars 5 - 24): I  V6  vi  IV, then a lift
def bar_of(b, chord, level):
    c = CH[chord]
    t0 = at(b)
    PAD.add(t0 - 0.06, pad([n(x) for x in c["pad"]], BAR - 0.1, 0.48 if level < 3 else 0.54, attack=0.35, release=0.9))
    # electric piano: eighth notes
    for i, nm in enumerate(c["arp"]):
        v = ACC[i] * (0.5 if level == 0 else 0.6 if level < 3 else 0.68)
        EP.add(t0 + i * BEAT / 2, ep(n(nm), 0.5 if i % 2 else 0.75, v), 0.8, pan=0.35 * (-1) ** i)
    # plucked string an octave above, on the off-beats, once the piece has opened up
    if level >= 1:
        for i in (1, 3, 5, 7) if level < 3 else (1, 2, 3, 5, 6, 7):
            PL.add(t0 + i * BEAT / 2, pluck(n(c["arp"][i]) + 12, 1.2, 0.42 + 0.1 * (i == 3)), 0.55, pan=0.6 * (-1) ** (i // 2))
    # bass
    m = n(c["bass"])
    if level == 0:
        BASS.add(t0, bass(m + 12, BAR * 0.96, 0.6), 0.85)
    else:
        for bt, d, v in ((0, 1.35, 0.9), (1.5, 0.42, 0.62), (2, 1.3, 0.82), (3.5, 0.42, 0.6)):
            BASS.add(t0 + bt * BEAT, bass(m + (12 if m < n("C2") else 0), d * BEAT, v), 0.85)
    # drums
    if level >= 1:
        for bt in ((0, 2) if level < 3 else (0, 1, 2, 3)):
            DR.add(t0 + bt * BEAT, kick(0.9 if bt in (0, 2) else 0.72, soft=level < 3), 0.8)
        for i in range(8):
            DR.add(t0 + i * BEAT / 2, shaker(0.55 + 0.35 * (i % 2)), 0.85, pan=0.3)
        for bt in (1, 3):
            DR.add(t0 + bt * BEAT, rim(0.7) if level < 3 else clap(0.8), 0.42 if level < 3 else 0.5, pan=-0.2)
    else:
        DR.add(t0, kick(0.7, soft=True), 0.6)
    if level >= 2:
        for i in range(16):
            if i % 4 != 0:
                DR.add(t0 + i * BEAT / 4, hat(0.35 + 0.25 * (i % 2 == 0)), 0.5, pan=-0.35)


PROG = ["D", "A/C#", "Bm7", "G"]
for b in range(5, 20):
    lvl = 0 if b < 9 else 1 if b < 13 else 2
    bar_of(b, PROG[(b - 5) % 4], lvl)
# the bell's tune, from the member scene on (bars 13 - 19)
TUNE = {0: [(0, "F#5", 2), (2, "A5", 1), (3, "F#5", 1)], 1: [(0, "E5", 2), (2, "C#5", 2)], 2: [(0, "D5", 2), (2, "F#5", 1), (3, "E5", 1)], 3: [(0, "D5", 3), (3, "B4", 1)]}
for b in range(13, 20):
    for bt, nm, d in TUNE[(b - 5) % 4]:
        BELL.add(at(b, bt), bell(n(nm), 0.6 + d * BEAT, 0.5), 0.7, pan=0.25)
# designs: IV  V  vi, a new design on every beat
for b, chd in ((20, "G"), (21, "A"), (22, "Bm7")):
    bar_of(b, chd, 3)
    for bt in range(4):
        BELL.add(at(b, bt), bell(n(CH[chd]["arp"][[3, 2, 3, 7][bt]]) + 12, 0.9, 0.42), 0.6, pan=0.4 * (-1) ** bt)
# a few more things: IV  V, rising into the call
for b, chd in ((23, "G"), (24, "Asus")):
    bar_of(b, chd, 3)
for i in range(16):
    DR.add(at(24, i * 0.25), noise_hit(0.07, 1500, 6000, 70) * (0.12 + 0.05 * i), 0.5)
FX.add(at(25) - 1.9, sweep(1.9, True, 250, 11000, 2.2), 0.5)
for i, c in enumerate([c for c in CUES if c[1] == "pop" and 57.5 < c[0] < 62]):
    PL.add(c[0], pluck(n(["D5", "E5", "F#5", "A5", "B5", "D6", "E6", "F#6"][i % 8]), 1.0, 0.6), 0.7, pan=-0.7 + 0.2 * i)

# --- the call (bar 25 = 62.5): home
END = at(25)
FX.add(END, boom(1.0), 0.62)
FX.add(END, air(3.0), 0.11)
sparkle(BELL, END + 0.3, ["A6", "D7", "F#7", "A7", "F#7", "D7", "A6", "D7", "F#7", "A7"], 0.156)
sparkle(BELL, at(26, 2), ["G6", "B6", "D7", "G7"], 0.156, 0.26)
sparkle(BELL, at(27, 2), ["A6", "D7", "F#7", "A7"], 0.156, 0.24)
PAD.add(END - 0.05, pad([n("D3"), n("A3"), n("D4"), n("E4"), n("F#4"), n("A4")], 2.45, 0.64, attack=0.1, release=0.8))
PAD.add(at(26) - 0.05, pad([n("D3"), n("G3"), n("B3"), n("D4"), n("G4")], 2.4, 0.56, attack=0.4, release=0.8))
PAD.add(at(27) - 0.05, pad([n("D3"), n("A3"), n("D4"), n("F#4"), n("A4")], 5.6, 0.56, attack=0.5, release=3.2))
for i, nm in enumerate(["D4", "A4", "D5", "F#5", "A5", "D6"]):
    EP.add(END + i * 0.018, ep(n(nm), 3.2, 0.74), 0.85, pan=-0.5 + 0.2 * i)
for i, nm in enumerate(["D5", "A5", "D6", "F#6"]):
    BELL.add(END + 0.03 + i * 0.07, bell(n(nm), 3.4, 0.5 - i * 0.05), 0.8, pan=0.5 - 0.3 * i)
BASS.add(END, bass(n("D2"), 2.4, 0.8), 0.9)
BASS.add(at(26), bass(n("D2"), 2.4, 0.7), 0.9)
BASS.add(at(27), bass(n("D2"), 4.5, 0.7), 0.9)
for b, arp in ((25, CH["D"]["arp"]), (26, CH["G/D"]["arp"]), (27, CH["D"]["arp"])):
    for i in range(8):
        EP.add(at(b, i * 0.5), ep(n(arp[i]), 0.8, ACC[i] * (0.52 - 0.02 * (b - 25))), 0.75, pan=0.35 * (-1) ** i)
    DR.add(at(b), kick(0.7, soft=True), 0.6)
for t, nm, v in ((at(25, 2), "F#5", 0.5), (at(26, 0), "G5", 0.5), (at(26, 2), "E5", 0.46), (at(27, 0), "F#5", 0.5), (at(27, 2), "A5", 0.44), (at(28, 0), "D6", 0.5)):
    BELL.add(t, bell(n(nm), 3.0, v), 0.75, pan=0.2)
for i, nm in enumerate(["D4", "A4", "D5", "F#5"]):
    EP.add(at(28) + i * 0.03, ep(n(nm), 4.5, 0.6), 0.85, pan=-0.3 + 0.2 * i)
BASS.add(at(28), bass(n("D2"), 3.5, 0.6), 0.8)

# ---------------------------------------------------------------- the small sounds, on the film's cues
for t, kind, v in CUES:
    if kind == "drawerOpen":
        FX.add(t, load("audio/drawer-open.mp3"), 0.9)
    elif kind == "drawerClose":
        FX.add(t - 0.05, load("audio/drawer-close.mp3"), 0.85)
    elif kind == "paper":
        FX.add(t, paper(0.26 + 0.1 * v, v), 0.5, pan=rng.uniform(-0.5, 0.5))
    elif kind == "pick":
        FX.add(t, paper(0.2, 0.7), 0.4, pan=rng.uniform(-0.6, 0.6))
        FX.add(t, sweep(0.3, True, 800, 6000, 1.5), 0.07)
    elif kind == "click":
        FX.add(t, blip(1500, 700, 0.03, 1.0, 90) + noise_hit(0.03, 2500, 8000, 260) * 0.25, 0.3)
    elif kind == "type":
        FX.add(t, blip(2100, 1500, 0.022, 1.0, 130) * 0.7 + noise_hit(0.022, 3000, 9000, 300) * 0.3, 0.16 * v)
    elif kind == "tick":
        FX.add(t, bell(n("A6"), 0.35, 0.5), 0.16)
    elif kind == "pop":
        FX.add(t, blip(420, 900, 0.07, 1.0, 26), 0.2 * v)
    elif kind == "save":
        FX.add(t, bell(n("A5"), 0.9, 0.6), 0.36, pan=-0.1)
        FX.add(t + 0.1, bell(n("D6"), 1.3, 0.6), 0.38, pan=0.1)
    elif kind == "notify":
        for i, nm in enumerate(["F#5", "A5", "D6"]):
            FX.add(t + i * 0.085, bell(n(nm), 1.2, 0.6), 0.36, pan=0.15)
    elif kind == "on":
        FX.add(t, boom(0.5), 0.3)
        FX.add(t, blip(180, 520, 0.5, 1.0, 5), 0.07)
    elif kind == "shimmer":
        for i, nm in enumerate(["D6", "F#6", "A6", "D7", "F#7"]):
            FX.add(t + i * 0.09, bell(n(nm), 2.2, 0.4), 0.26, pan=-0.5 + 0.25 * i)
        FX.add(t, sweep(1.2, True, 1500, 9000, 1.2), 0.07)
    elif kind == "whoosh":
        FX.add(t - 0.05, sweep(0.6, False, 300, 7000, 1.3), 0.2 * v)
    elif kind == "hit":
        pass   # written into the music itself
    elif kind == "swell":
        FX.add(t - 0.4, sweep(0.9, True, 400, 5000, 1.6), 0.09 * v)

# ---------------------------------------------------------------- the room, and the mix
def reverb(x, t60=2.3, wet=1.0, pre=0.022):
    cnt = int(t60 * 1.25 * SR)
    t = np.arange(cnt) / SR
    ir = rng.normal(0, 1, (cnt, 2)) * np.exp(-t * 6.91 / t60)[:, None]
    ir = butter(butter(ir, "low", 7500), "high", 320)
    ir[: int(0.004 * SR)] *= 0.2
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    d = int(pre * SR)
    out = np.zeros_like(x)
    for ch in (0, 1):
        y = signal.fftconvolve(x[:, ch], ir[:, ch])[: len(x)]
        out[d:, ch] = y[: len(x) - d]
    return out * wet


def pingpong(x, delay=BEAT * 0.75, fb=0.36, wet=0.3):
    d = int(delay * SR)
    out = np.zeros_like(x)
    src = x.mean(axis=1)
    g = 1.0
    for k in range(1, 6):
        g *= fb if k > 1 else 1
        ch = k % 2
        out[k * d:, ch] += butter(src, "low", 4200 - 400 * k)[: len(src) - k * d] * g
    return out * wet


def duck(x, trig, depth=0.28, rel=0.2):
    """the pad breathes a little under the kick"""
    e = np.abs(trig.mean(axis=1))
    e = signal.sosfilt(signal.butter(1, 1 / rel, fs=SR, output="sos"), np.maximum(e, 0))
    e = np.clip(e / (e.max() + 1e-9) * 3, 0, 1)
    return x * (1 - depth * e)[:, None]


def peaking(x, f0, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
    b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x, axis=0)


def shelf_hi(x, f0, gain_db, slope=0.8):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; c = np.cos(w); s_ = np.sin(w)
    al = s_ / 2 * np.sqrt((A + 1 / A) * (1 / slope - 1) + 2); k = 2 * np.sqrt(A) * al
    b = [A * ((A + 1) + (A - 1) * c + k), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - k)]
    a = [(A + 1) - (A - 1) * c + k, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - k]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x, axis=0)


EP.b = peaking(butter(EP.b, "low", 9500), 330, -3.0, 0.8)
PAD.b = duck(peaking(butter(butter(PAD.b, "low", 5200), "high", 150), 300, -4.0, 0.7), DR.b)
PL.b = PL.b + pingpong(PL.b)
BELL.b = BELL.b + pingpong(BELL.b, BEAT * 1.5, 0.3, 0.2)
BASS.b = butter(BASS.b, "low", 900)

dry = EP.b * 0.50 + PL.b * 0.56 + PAD.b * 0.24 + BASS.b * 0.50 + DR.b * 0.66 + BELL.b * 0.46 + FX.b * 0.9
send = EP.b * 0.28 + PL.b * 0.40 + PAD.b * 0.22 + BELL.b * 0.46 + DR.b * 0.06 + FX.b * 0.22
mix = dry + reverb(send, 2.4) * 0.5
mix = butter(mix, "high", 30)
mix = shelf_hi(peaking(peaking(mix, 280, -2.5, 0.8), 2900, 4.0, 0.7), 5000, 4.0)

# the end fades with the picture
t = np.arange(N) / SR
mix *= np.clip((71.6 - t) / 1.8, 0, 1)[:, None] ** 1.5
mix *= np.clip(t / 0.05, 0, 1)[:, None]

# a gentle glue: soft knee, then a ceiling just under full scale
peak = np.abs(mix).max()
mix = mix / peak * 0.98
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix = mix / np.abs(mix).max() * 10 ** (-1.2 / 20)

def write(m):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", out_path], input=(m * 32767).astype("<i2").tobytes())


write(mix)
rep_ = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", out_path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = float(rep_.split("Integrated loudness:")[1].split("I:")[1].split("LUFS")[0])
gain = 10 ** ((-14.3 - lufs) / 20)
mix = mix * gain
# a look-ahead limiter for the few peaks (the two arrivals), so the whole piece can sit at a normal level
from scipy.ndimage import maximum_filter1d, uniform_filter1d
ceil_ = 10 ** (-1.3 / 20)
env = maximum_filter1d(np.abs(mix).max(axis=1), size=int(0.012 * SR))
gr = np.minimum(1.0, ceil_ / np.maximum(env, 1e-9))
gr = uniform_filter1d(np.minimum(gr, uniform_filter1d(gr, size=int(0.03 * SR))), size=int(0.006 * SR))
mix = mix * gr[:, None]
mix = np.clip(mix, -ceil_, ceil_)
write(mix)
print("loudness before", lufs, "LUFS; gain", round(20 * np.log10(gain), 2), "dB")
print("wrote", out_path, "peak", round(float(np.abs(mix).max()), 3), "rms", round(float(np.sqrt((mix ** 2).mean())), 4))
