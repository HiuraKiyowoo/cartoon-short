# Original synthesized stems for "Perang Kue": music.wav + sfx.wav (mix levels are set later by mix.py)
import numpy as np, subprocess, sys
from scipy import signal
SR = 44100; DUR = 40.4375; N = int(DUR * SR); rng = np.random.default_rng(7)
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

def cannon(g=1.0): d = 0.9; return g * (sw(d, 110, 34, 6) * ex(d, 4.5) + 0.9 * lp(noise(d), 1800) * ex(d, 9) + 0.3 * bp(noise(d), 600, 3000) * ex(d, 30))
def whistle(d, g=1.0): t = t_(d); f = 1200 + 1800 * (t / d); return g * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(t * 40, 1) * 0.5
def pop(f=520, g=1.0): d = 0.16; return g * sw(d, f * 2, f, 30) * ex(d, 20)
def clink(g=1.0): d = 0.5; t = t_(d); return g * (np.sin(2 * np.pi * 2400 * t) + 0.6 * np.sin(2 * np.pi * 3700 * t)) * np.exp(-t * 14)
def crack(g=1.0): d = 0.25; return g * (hp(noise(d), 1500) * ex(d, 30) + 0.5 * lp(noise(d), 400) * ex(d, 18))
def chirp(g=1.0): d = 0.14; t = t_(d); return g * np.sin(2 * np.pi * np.cumsum(2500 + 1200 * np.sin(2 * np.pi * 18 * t)) / SR) * np.sin(np.pi * t / d)
def sad(f, d, g=1.0): t = t_(d); ff = f * (1 - 0.18 * t / d); return g * lp(np.sign(np.sin(2 * np.pi * np.cumsum(ff) / SR)), 900) * np.sin(np.pi * np.minimum(t / d, 1)) ** 0.6
S = np.zeros(N)
sec = lambda fr: fr / 30
# hook
place(S, pop(300, 1.0), sec(39)); place(S, whoosh(0.4, True), sec(36), 0.6); place(S, thunk(0.8), sec(71)); [place(S, pop(500 + 120 * i, 0.9), sec(72 + 4 * i)) for i in range(3)]
# town
place(S, whoosh(0.5, True), sec(104), 0.6); [place(S, chirp(0.6), 4.8 + i * 0.35) for i in range(3)]; place(S, rustle(1.2, 0.5), 5.2)
# baker
place(S, pluck(523, 0.6, 0.6), sec(232)); place(S, pluck(659, 0.6, 0.6), sec(238)); place(S, bell(392, 1.2, 0.4), sec(262)); place(S, whoosh(0.4, True), sec(268), 0.7)
for i in range(6): place(S, rustle(0.3, 0.8), sec(276) + i * 0.25)
for i, fr in enumerate((296, 310, 324, 338)): place(S, thunk(0.4), sec(fr)); place(S, rustle(0.2, 0.6), sec(fr))
# bills
place(S, whoosh(0.5, True), sec(372), 0.7); place(S, pop(400, 1.0), sec(388)); place(S, clink(0.7), sec(390)); place(S, clink(0.6), sec(394)); place(S, stamp_hit(), sec(418), 0.8)
place(S, whoosh(0.3, True), sec(437), 0.5); place(S, pluck(330, 0.6, 0.5), sec(445)); place(S, pluck(311, 0.6, 0.5), sec(455)); place(S, pop(380, 1.0), sec(472)); place(S, drip(0.8), sec(505))
place(S, whoosh(0.4, False), sec(540), 0.6); place(S, stamp_hit(), sec(551), 1.0)
place(S, whoosh(0.4, True), sec(596), 0.5); place(S, cannon(0.9), sec(612)); place(S, clink(0.8), sec(614)); place(S, clink(0.8), sec(618)); place(S, stamp_hit(), sec(636), 0.7)
# fleet
place(S, bp(noise(2.3), 200, 900) * np.sin(np.pi * t_(2.3) / 2.3), sec(655), 0.9); place(S, bell(110, 2.2, 0.45), sec(669)); [place(S, chirp(0.5), 22.9 + i * 0.4) for i in range(2)]
# volley
for i in range(3):
    for k in range(5): place(S, cannon(0.5), sec(726 + i * 6 + k * 3))
for fr in (772, 782, 790, 797): place(S, whistle(0.45, 0.4), sec(fr - 14)); place(S, cannon(0.9), sec(fr)); place(S, lp(noise(0.8), 800) * ex(0.8, 6), sec(fr), 0.6)
# fight
for i in range(6): place(S, cannon(0.8), sec(812 + 12 * i)); place(S, whoosh(0.5, True), sec(814 + 12 * i), 0.3)
# hit
place(S, whistle(0.63, 0.7), sec(893)); place(S, cannon(1.2), sec(912)); place(S, thunk(1.0), sec(913)); place(S, whoosh(1.0, True), sec(914), 0.7)
for i in range(3): place(S, bell(1568 + 200 * i, 0.9, 0.3), sec(926 + 4 * i))
# stump
place(S, thunk(0.8), sec(969)); place(S, sad(330, 1.4, 0.5), sec(971)); place(S, drip(0.8), sec(990))
# burial
for i in range(5): place(S, drum(70, 1.0), sec(1008) + i * 0.7)
place(S, bell(196, 3.0, 0.5), sec(1010))
for i in range(6): place(S, crack(0.9), sec(1078) + i * 0.012); place(S, lp(noise(1.2), 600) * ex(1.2, 4), sec(1078), 0.5)
[place(S, chirp(0.6), sec(1090) + i * 0.3) for i in range(3)]
# icons
for fr in (1090, 1138, 1174): place(S, pop(450, 1.0), sec(fr)); place(S, thunk(0.5), sec(fr)); place(S, clink(0.5), sec(fr + 3))
place(S, cannon(0.8), sec(1141)); place(S, stamp_hit(), sec(1198), 1.2); place(S, bell(98, 3.0, 0.5), sec(1198))

# ---------------- MUSIC ----------------
M = np.zeros(N); beat = 60 / 104
chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (261.63, 329.63, 392.0), (196.0, 246.94, 293.66)]  # Am F C G
t1 = 39.3; bar = 4 * beat; i = 0
while i * bar < t1:
    a = i * bar; c = chords[i % 4]; L = min(bar, t1 - a) + 0.3
    for f in c: place(M, pad(f, L, 0.28), a)
    place(M, pad(c[0] / 2, L, 0.5), a)
    for k in range(8):
        tt = a + k * beat / 2
        if tt < t1: place(M, pluck(c[[0, 1, 2, 1, 2, 1, 0, 2][k]] * 2, 0.5, 0.5), tt)
    if a >= 3.0:
        for k in (0, 2):
            if a + k * beat < t1 - 0.2: place(M, drum(66, 0.8), a + k * beat)
        for k in (1, 3):
            if a + k * beat < t1 - 0.2: place(M, hp(noise(0.1), 3500) * ex(0.1, 40), a + k * beat, 0.3)
    i += 1
fade = np.minimum(t_(DUR) / 0.8, 1.0) * np.minimum((DUR - t_(DUR)) / 1.2, 1.0); M = M * fade
def wav(name, x):
    s = np.clip(np.stack([x, x]).T, -1, 1).astype(np.float32); import soundfile as sf
    sf.write(name, s, SR, subtype="FLOAT")
try: import soundfile
except ImportError: subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "soundfile"])
wav("work/music_raw.wav", M / (np.abs(M).max() + 1e-9)); wav("work/sfx_raw.wav", S / (np.abs(S).max() + 1e-9)); print("stems ok", N / SR)
