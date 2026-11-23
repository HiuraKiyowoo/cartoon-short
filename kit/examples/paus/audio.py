# Original synthesized stems for "Paus yang Mengadili Jenazah": music.wav + sfx.wav (mix levels are set later by mix.py)
import numpy as np, subprocess, sys
from scipy import signal
SR = 44100; DUR = 45.871; N = int(DUR * SR); rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR
def place(buf, x, at, g=1.0):
    i = int(at * SR); 
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * g
def noise(d): return rng.standard_normal(int(d * SR))
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)
def ex(d, k): t = t_(d); return np.exp(-t * k)
def sw(d, f0, f1, k=6):  # exponential sweep sine
    t = t_(d); f = f1 + (f0 - f1) * np.exp(-t * k); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def thunk(g=1.0): d = 0.5; return g * (sw(d, 130, 42, 9) * ex(d, 7) + 0.5 * lp(noise(d), 1400) * ex(d, 28))
def stamp_hit(): d = 0.9; return 1.0 * sw(d, 150, 38, 7) * ex(d, 4.5) + 0.7 * lp(noise(d), 2500) * ex(d, 22) + 0.25 * bp(noise(d), 800, 3000) * ex(d, 40)
def bell(f, d=2.6, g=1.0):
    t = t_(d); x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * k) for m, a, k in [(1, 1, 1.4), (2.0, 0.5, 2.2), (2.76, 0.6, 2.8), (5.4, 0.25, 4.5), (8.9, 0.12, 6)]); return g * x
def clang(g=1.0): d = 1.8; t = t_(d); return g * (sum(a * np.sin(2 * np.pi * 360 * m * t) * np.exp(-t * k) for m, a, k in [(1, 1, 3), (2.32, 0.7, 4), (4.25, 0.5, 5), (6.63, 0.35, 7), (9.38, 0.2, 9)]) + 0.8 * hp(noise(d), 2000) * ex(d, 30))
def whoosh(d, up=True, g=1.0):
    x = bp(noise(d), 300, 3500); t = t_(d) / d; e = np.sin(np.pi * np.clip(t, 0, 1)) ** (1.5 if up else 1.0); return g * x * e
def rustle(d, g=1.0): x = hp(noise(d), 2500); m = (rng.random(int(d * SR / 400) + 2) > 0.4).repeat(400)[: len(x)].astype(float); m = lp(m, 60); return g * x * m
def scratch(d, g=1.0): x = bp(noise(d), 2500, 7000); m = np.abs(np.sin(2 * np.pi * (6 + 4 * rng.random()) * t_(d))) ** 3; return g * x * m
def drip(g=1.0): d = 0.18; return g * sw(d, 1800, 700, 25) * ex(d, 22)
def pluck(f, d=0.8, g=1.0):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * h * t) / h ** 1.3 for h in range(1, 7)); return g * x * np.exp(-t * 5.5) * np.minimum(t * 400, 1)
def pad(f, d, g=1.0):
    t = t_(d); x = 0; 
    for det in (-0.004, 0, 0.004): x = x + sum(np.sin(2 * np.pi * f * (1 + det) * h * t + h) / h for h in (1, 2, 3, 4))
    e = np.minimum(t / 1.2, 1) * np.minimum((d - t) / 1.2, 1); return g * lp(x, 1800) * e * (1 + 0.04 * np.sin(2 * np.pi * 5 * t))
def drum(f=62, g=1.0): d = 0.45; return g * (sw(d, f * 1.6, f, 18) * ex(d, 9) + 0.25 * lp(noise(d), 600) * ex(d, 35))

# ---------------- SFX ----------------
S = np.zeros(N)
wind = lp(noise(DUR), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t_(DUR)))
place(S, wind[: int(4.5 * SR)] * np.minimum(t_(4.5)[: int(4.5 * SR)] * 2, 1) * np.minimum((4.5 - t_(4.5)) * 2, 1), 0, 0.5)
for tt in (0.5, 1.5, 2.5, 3.5): place(S, thunk(0.9), tt); place(S, bp(noise(0.35), 600, 2500) * ex(0.35, 10), tt - 0.12, 0.5)
place(S, whoosh(0.5, True), 4.35, 0.8); place(S, bell(196, 3.0), 4.7, 0.5)
place(S, lp(noise(2.4), 220) * np.sin(np.pi * t_(2.4) / 2.4), 8.3, 1.2); place(S, hp(noise(3.0), 3500) * np.sin(np.pi * t_(3.0) / 3.0) ** 2, 9.2, 0.35)
for i in range(7): place(S, rustle(0.3, 0.8), 11.6 + i * 0.22)
place(S, lp(noise(1.0), 400) * np.sin(np.pi * t_(1.0)), 13.7, 1.4); place(S, thunk(1.0), 14.6); place(S, whoosh(1.3, True), 14.5, 0.8)
place(S, whoosh(0.4, False), 16.3, 0.9); place(S, thunk(1.2), 17.08); place(S, bell(523, 1.4), 16.7, 0.3); place(S, rustle(0.5, 0.9), 16.7); place(S, thunk(0.6), 17.98)
for tt in (20.4, 21.8, 23.2, 24.2): place(S, drip(0.9), tt)
for tt in (25.4, 26.9): place(S, lp(noise(0.25), 500) * np.sin(np.pi * t_(0.25) / 0.25), tt, 1.2); place(S, drip(0.8), tt + 0.6)
fly = bp(noise(3.2), 140, 420) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t_(3.2))) + 0.5 * np.sin(2 * np.pi * 190 * t_(3.2) + 3 * np.sin(2 * np.pi * 2.3 * t_(3.2)))
place(S, fly * np.sin(np.pi * t_(3.2) / 3.2) ** 0.5, 28.7, 0.45)
for tt in (29.6, 30.2, 30.8, 31.4): 
    for j in range(3): place(S, np.sin(2 * np.pi * 4300 * t_(0.05)) * ex(0.05, 30), tt + j * 0.07, 0.18)
place(S, whoosh(0.5, False), 32.85, 0.8); place(S, stamp_hit(), 33.36, 1.0)
place(S, bp(noise(2.0), 300, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t_(2.0))) * np.sin(np.pi * t_(2.0) / 2.0), 34.2, 0.8)
place(S, thunk(0.7), 36.68); place(S, sw(0.3, 700, 300, 10) * ex(0.3, 10), 36.7, 0.5)
for i in range(8): place(S, thunk(0.35) , 37.3 + i * 0.15)
place(S, clang(1.0), 39.18); place(S, thunk(0.9), 39.18)
rip = hp(noise(0.8), 1500) * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * t_(0.8))) * np.sin(np.pi * t_(0.8) / 0.8) ** 0.6; place(S, rip, 40.4, 0.9)
place(S, rustle(0.9, 0.9), 41.55); place(S, bell(880, 1.0), 41.9, 0.25)
place(S, scratch(0.55), 42.25, 0.6); place(S, scratch(0.5), 42.85, 0.6)
place(S, thunk(0.7), 44.33); place(S, np.sin(2 * np.pi * 260 * t_(0.2)) * ex(0.2, 25), 44.33, 0.4); place(S, thunk(0.5), 44.93); place(S, whoosh(0.3, False), 45.0, 0.5)
place(S, stamp_hit(), 45.2, 1.2); place(S, bell(98, 3.0), 45.2, 0.45)

# ---------------- MUSIC ----------------
M = np.zeros(N); beat = 60 / 76
chords = [(146.83, 174.61, 220.0), (116.54, 146.83, 174.61), (130.81, 164.81, 196.0), (110.0, 138.59, 164.81)]  # Dm Bb C A
t0, t1 = 0.0, 43.6; bar = 4 * beat; i = 0
while i * bar < t1:
    a = i * bar; c = chords[i % 4]; L = min(bar, t1 - a) + 0.4
    for f in c: place(M, pad(f, L, 0.35), a); 
    place(M, pad(c[0] / 2, L, 0.5), a)
    for k in range(8):
        tt = a + k * beat / 2
        if tt < t1: place(M, pluck(c[[0, 1, 2, 1, 2, 1, 0, 2][k]] * 2, 0.7, 0.45), tt)
    if a >= 4.2:
        for k in (0, 2): 
            if a + k * beat < t1 - 0.2: place(M, drum(62, 0.9), a + k * beat)
        if a >= 20: place(M, hp(noise(0.08), 4000) * ex(0.08, 60), a + 1.5 * beat, 0.25)
    i += 1
drone = pad(73.42, DUR - 43.0, 0.9); place(M, drone, 43.0)
place(M, bell(146.8, 3.0), 4.4, 0.6)
fade = np.minimum(t_(DUR) / 1.5, 1.0); M = M * fade
def wav(name, x):
    s = np.clip(np.stack([x, x]).T, -1, 1).astype(np.float32); import soundfile as sf
    sf.write(name, s, SR, subtype="FLOAT")
try: import soundfile
except ImportError: subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "soundfile"])
wav("work/music_raw.wav", M / (np.abs(M).max() + 1e-9)); wav("work/sfx_raw.wav", S / (np.abs(S).max() + 1e-9)); print("stems ok", N / SR)
