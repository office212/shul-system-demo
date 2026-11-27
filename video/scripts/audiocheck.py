#!/usr/bin/env python3
"""Octave-band levels of the soundtrack, per section (a check on the balance of the mix)."""
import sys, subprocess, numpy as np
from scipy import signal
p = sys.argv[1] if len(sys.argv) > 1 else "video/out/soundtrack.wav"
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-f", "f32le", "-ac", "2", "-ar", "48000", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64); SR = 48000
bands = [(20, 40), (40, 80), (80, 160), (160, 320), (320, 640), (640, 1250), (1250, 2500), (2500, 5000), (5000, 10000), (10000, 20000)]
secs = [("drawer", 1, 8), ("mark", 8.8, 12.4), ("screen", 12.5, 22.5), ("times", 22.5, 31), ("finance", 31.25, 41), ("member", 41.25, 50), ("designs", 50, 57.5), ("more", 57.5, 62.4), ("call", 62.5, 70)]
print("section    rms   peak  " + " ".join(f"{lo:>5}" for lo, hi in bands) + "   L-R corr")
for name, a, b in secs:
    s = x[int(a * SR):int(b * SR)]; m = s.mean(axis=1)
    row = []
    for lo, hi in bands:
        y = signal.sosfilt(signal.butter(4, [lo, min(hi, 23000)], btype="band", fs=SR, output="sos"), m)
        row.append(20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9))
    corr = np.corrcoef(s[:, 0], s[:, 1])[0, 1]
    print(f"{name:9} {20*np.log10(np.sqrt((s**2).mean())+1e-9):5.1f} {20*np.log10(np.abs(s).max()+1e-9):5.1f}  " + " ".join(f"{v:5.0f}" for v in row) + f"   {corr:.2f}")
