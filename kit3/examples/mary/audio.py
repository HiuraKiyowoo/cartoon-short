# Original synthesized stems for "Mary Celeste": music.wav + sfx.wav (mix levels are set later by mix.py)
import numpy as np, subprocess, sys
from scipy import signal
SR = 44100; DUR = 51.5657; N = int(DUR * SR); rng = np.random.default_rng(7)
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
def squeak(g=1.0): d = 0.12; return g * sw(d, 3800, 2400, 20) * ex(d, 18) * (1 + 0.3 * np.sin(2 * np.pi * 40 * t_(d)))
def crunch(g=1.0): d = 0.07; return g * hp(noise(d), 2500) * ex(d, 45)
def meow(g=1.0): d = 0.6; t = t_(d); f = 450 + 350 * np.sin(np.pi * t / d) ** 0.7; x = sum(np.sin(2 * np.pi * np.cumsum(f * h) / SR) / h for h in (1, 2, 3)); return g * lp(x, 2500) * np.sin(np.pi * np.minimum(t / d, 1)) ** 0.5
def hiss(d=0.9, g=1.0): t = t_(d); return g * hp(noise(d), 3500) * np.minimum(t * 30, 1) * ex(d, 2.5)
def step(g=1.0): d = 0.1; return g * lp(noise(d), 1200) * ex(d, 40)
def cricket(g=1.0): d = 0.3; t = t_(d); return g * np.sin(2 * np.pi * 4200 * t) * (np.sin(2 * np.pi * 28 * t) > 0) * np.sin(np.pi * t / d) * 0.5
def creak(d=1.0, g=1.0): t = t_(d); f = 180 + 60 * np.sin(2 * np.pi * 3 * t) + 40 * rng.random(); return g * lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 700) * np.sin(np.pi * t / d) * 0.35
def wave(d, g=1.0): t = t_(d); return g * lp(noise(d), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * t - 1)) * np.minimum(t * 3, 1) * np.minimum((d - t) * 3, 1)
def wind(d, g=1.0): t = t_(d); return g * bp(noise(d), 200, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * t)) * np.minimum(t * 2, 1) * np.minimum((d - t) * 2, 1)
def gull(g=1.0): d = 0.5; t = t_(d); f = 1500 + 500 * np.sin(2 * np.pi * 6 * t) - 700 * t / d; return g * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.5
def sad(f, d, g=1.0): t = t_(d); ff = f * (1 - 0.18 * t / d); return g * lp(np.sign(np.sin(2 * np.pi * np.cumsum(ff) / SR)), 900) * np.sin(np.pi * np.minimum(t / d, 1)) ** 0.6
def tick(g=1.0): d = 0.06; return g * sw(d, 1800, 900, 40) * ex(d, 60)
def splash(d=0.6, g=1.0): return g * bp(noise(d), 400, 4000) * ex(d, 7) * np.minimum(t_(d) * 80, 1)
def oar(d=0.5, g=1.0): return g * lp(noise(d), 900) * np.sin(np.pi * t_(d) / d) * 0.6
S = np.zeros(N)
sec = lambda fr: fr / 30
# ambient sea bed + wind (quiet)
place(S, wave(51.0, 0.35), 0.2); place(S, wind(51.0, 0.12), 0.2)
# 0-255 ship drifting, empty
place(S, whoosh(0.8, True), 0.1, 0.4); [place(S, gull(0.5), 1.0 + i * 1.7) for i in range(3)]; place(S, creak(1.2, 0.7), sec(92)); place(S, creak(1.0, 0.6), sec(110))
place(S, whoosh(0.5, True), sec(133), 0.5); place(S, tick(0.8), sec(150)); place(S, tick(0.8), sec(158)); place(S, tick(0.8), sec(166))
place(S, creak(1.6, 0.8), sec(182)); place(S, bell(110, 3.0, 0.4), sec(215)); place(S, np.sin(2 * np.pi * 150 * t_(2.0)) * np.sin(np.pi * t_(2.0) / 2.0) * 0.18, sec(190))
# 1872 title
place(S, whoosh(0.5, True), sec(252), 0.7); place(S, thunk(0.9), sec(258)); place(S, pop(500, 0.9), sec(266)); place(S, clink(0.6), sec(268)); place(S, pop(440, 0.8), sec(292))
# found (Dei Gratia, rescuers rowing)
place(S, whoosh(0.8, True), sec(344), 0.6); [place(S, oar(0.5, 0.8), sec(384) + i * 0.7) for i in range(9)]; [place(S, splash(0.4, 0.4), sec(388) + i * 0.7 + 0.25) for i in range(9)]; [place(S, gull(0.5), 12.2 + i * 1.5) for i in range(2)]
# ten icons
place(S, pop(480, 1.0), sec(456)); place(S, thunk(0.7), sec(456))
for i in range(10): place(S, pop(600 + 40 * i, 0.7), sec(470 + i * 4)); place(S, tick(0.6), sec(470 + i * 4))
# crew
place(S, pluck(330, 0.8, 0.7), sec(534)); place(S, whoosh(0.3, True), sec(532), 0.5); place(S, thunk(0.5), sec(534))
place(S, pluck(392, 0.8, 0.7), sec(568)); place(S, thunk(0.4), sec(568)); place(S, pluck(494, 0.8, 0.7), sec(597)); place(S, bell(1320, 1.0, 0.25), sec(598))
for i in range(7): place(S, pop(420 + 30 * i, 0.7), sec(660 + i * 4)); place(S, thunk(0.3), sec(660 + i * 4))
# sound ship + sparkle
place(S, whoosh(1.4, True), sec(700), 0.5); [place(S, bell(1760 + 200 * i, 0.8, 0.22), sec(700 + i * 12)) for i in range(3)]; place(S, pluck(262, 0.8, 0.6), sec(704)); place(S, pluck(330, 0.8, 0.6), sec(716)); place(S, pluck(392, 1.0, 0.7), sec(728))
# cargo / things: warm tones
place(S, whoosh(0.6, True), sec(762), 0.5); [place(S, bell(1568 + 120 * i, 0.8, 0.2), sec(770 + i * 8)) for i in range(5)]; [place(S, thunk(0.3), sec(776 + i * 10)) for i in range(5)]
place(S, creak(1.4, 0.7), sec(790)); place(S, whoosh(0.5, True), sec(831), 0.5); [place(S, bell(1760 + 150 * i, 0.9, 0.2), sec(840 + i * 16)) for i in range(3)]; place(S, drip(0.7), sec(850)); place(S, tick(0.8), sec(880)); place(S, tick(0.8), sec(884))
# missing boat
place(S, whoosh(0.4, False), sec(898), 0.6); place(S, creak(1.6, 0.8), sec(902)); place(S, bell(98, 3.5, 0.45), sec(912)); place(S, np.sin(2 * np.pi * 190 * t_(1.6)) * np.sin(np.pi * t_(1.6) / 1.6) * 0.15, sec(920))
# log slate: 9 ticks
place(S, whoosh(0.5, True), sec(960), 0.5); place(S, thunk(0.6), sec(964))
for i in range(9): place(S, tick(1.2), sec(990 + i * 6)); place(S, thunk(0.25), sec(990 + i * 6))
place(S, stamp_hit(), sec(1036), 0.9); place(S, bell(98, 3.0, 0.4), sec(1036))
# theories
for t0 in (1066, 1118, 1148): place(S, pop(430, 0.9), sec(t0)); place(S, thunk(0.5), sec(t0))
place(S, drum(52, 0.9), sec(1070)); place(S, drum(52, 0.9), sec(1082)); place(S, crack(0.5), sec(1150))
for t0 in (1186, 1198, 1210): place(S, thunk(0.9), sec(t0)); place(S, sad(262, 0.6, 0.35), sec(t0))
# thinking / realization
place(S, pluck(311, 0.9, 0.6), sec(1240)); place(S, pluck(293, 0.9, 0.6), sec(1252)); place(S, pluck(277, 1.2, 0.7), sec(1264))
place(S, thunk(1.0), sec(1300)); place(S, bell(220, 2.0, 0.4), sec(1300)); [place(S, splash(0.5, 0.5), sec(1306 + i * 12)) for i in range(4)]; place(S, creak(2.0, 0.9), sec(1290))
# abandon: hurry
for i in range(14): place(S, thunk(0.35), sec(1358) + i * 0.17)
place(S, whoosh(0.6, True), sec(1360), 0.6); [place(S, pop(520 + 50 * (i % 3), 0.5), sec(1366 + i * 8)) for i in range(5)]
# ship alone, boat away
place(S, whoosh(1.2, True), sec(1414), 0.4); place(S, pad(147, 3.0, 0.3), sec(1416)); place(S, bell(262, 3.5, 0.3), sec(1418))
[place(S, oar(0.5, 0.6), sec(1462) + i * 0.8) for i in range(8)]; [place(S, splash(0.4, 0.3), sec(1465) + i * 0.8) for i in range(8)]
place(S, sad(330, 1.6, 0.35), sec(1500)); place(S, bell(98, 4.0, 0.5), sec(1522)); place(S, np.sin(2 * np.pi * 70 * t_(2.5)) * np.sin(np.pi * t_(2.5) / 2.5) * 0.35, sec(1520))

# ---------------- MUSIC ---------------- (slow, eerie, minor)
M = np.zeros(N); beat = 60 / 76
chords = [(110.0, 130.81, 164.81), (87.31, 110.0, 130.81), (98.0, 123.47, 146.83), (110.0, 130.81, 164.81)]  # Am F G Am
t1 = 50.4; bar = 4 * beat; i = 0
while i * bar < t1:
    a = i * bar; c = chords[i % 4]; L = min(bar, t1 - a) + 0.6
    for f in c: place(M, pad(f * 2, L, 0.24), a)
    place(M, pad(c[0], L, 0.5), a)
    for k in range(4):
        tt = a + k * beat
        if tt < t1: place(M, bell(c[[2, 1, 2, 0][k]] * 4, 1.8, 0.1), tt)
    if a >= 8.0:
        for k in (0, 2):
            if a + k * beat < t1 - 0.2: place(M, drum(52, 0.5), a + k * beat)
    i += 1
fade = np.minimum(t_(DUR) / 1.5, 1.0) * np.minimum((DUR - t_(DUR)) / 1.6, 1.0); M = M * fade
def wav(name, x):
    s = np.clip(np.stack([x, x]).T, -1, 1).astype(np.float32); import soundfile as sf
    sf.write(name, s, SR, subtype="FLOAT")
try: import soundfile
except ImportError: subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "soundfile"])
wav("work/music_raw.wav", M / (np.abs(M).max() + 1e-9)); wav("work/sfx_raw.wav", S / (np.abs(S).max() + 1e-9)); print("stems ok", N / SR)
