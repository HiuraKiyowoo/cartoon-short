# Original synthesized stems for "Pengadilan Tikus": music.wav + sfx.wav (mix levels are set later by mix.py)
import numpy as np, subprocess, sys
from scipy import signal
SR = 44100; DUR = 39.3143; N = int(DUR * SR); rng = np.random.default_rng(7)
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
S = np.zeros(N)
sec = lambda fr: fr / 30
# hook
place(S, thunk(0.7), 0.1); [place(S, squeak(0.7), tt) for tt in (0.6, 1.1, 1.8)]; place(S, whoosh(0.4, True), sec(76), 0.6); place(S, pluck(587, 0.7, 0.7), sec(82)); place(S, thunk(0.7), sec(82)); place(S, bell(1175, 1.0, 0.25), sec(84))
# village
[place(S, chirp(0.6), 5.0 + i * 0.5) for i in range(3)]; place(S, whoosh(0.6, True), sec(138), 0.5); place(S, rustle(2.0, 0.4), 5.2)
# swarm
for i in range(34): place(S, crunch(0.9), 8.1 + i * 0.09 + (i % 3) * 0.02)
[place(S, squeak(0.6), 8.2 + i * 0.37) for i in range(8)]; place(S, pluck(330, 0.5, 0.6), sec(270)); place(S, bell(880, 0.8, 0.3), sec(270))
# march
for i in range(15): place(S, step(0.9), sec(334) + i * 0.29); place(S, step(0.5), sec(334) + i * 0.29 + 0.14)
place(S, rustle(1.0, 0.5), 11.2); [place(S, squeak(0.5), 11.6 + i * 0.5) for i in range(4)]
# call
place(S, bell(196, 2.5, 0.4), sec(416)); [place(S, pluck(440 - 40 * i, 0.5, 0.8), sec(424 + i * 13)) for i in range(3)]; place(S, thunk(0.6), sec(416))
# empty
[place(S, cricket(0.7), sec(484) + i * 0.4) for i in range(4)]; place(S, drip(0.6), sec(500)); place(S, np.sin(2 * np.pi * 180 * t_(1.4) + 4 * np.sin(2 * np.pi * 14 * t_(1.4))) * np.sin(np.pi * t_(1.4) / 1.4) * 0.25, sec(488))
# lawyer
place(S, whoosh(0.4, True), sec(530), 0.6); place(S, twinkle := bell(1760, 0.9, 0.25), sec(548)); place(S, bell(220, 2.0, 0.45), sec(575)); place(S, thunk(0.5), sec(575)); place(S, pluck(740, 0.6, 0.7), sec(611)); place(S, bell(1320, 0.8, 0.25), sec(612))
# letter
place(S, whoosh(0.5, True), sec(644), 0.7); [place(S, drip(0.5), sec(656) + i * 0.09) for i in range(6)]; place(S, thunk(0.9), sec(682)); place(S, sad(330, 1.0, 0.45), sec(684)); place(S, whoosh(0.4, False), sec(688), 0.5)
# migrate
for i in range(70): place(S, step(0.5), sec(702) + i * 0.034 + (i % 4) * 0.01)
[place(S, squeak(0.5), 23.5 + i * 0.28) for i in range(8)]
# pula
place(S, pluck(494, 0.5, 0.6), sec(776)); place(S, pluck(587, 0.5, 0.6), sec(784)); place(S, pluck(740, 0.7, 0.7), sec(792))
# road: heartbeat + meows
for i in range(12): place(S, drum(52, 0.9), sec(806) + i * 0.52)
for i in range(6): place(S, meow(0.45), sec(812 + i * 12) + 0.2); 
place(S, lp(noise(3.4), 300) * np.sin(np.pi * t_(3.4) / 3.4), sec(806), 0.8)
# cat close
place(S, hiss(0.9, 0.9), sec(930)); place(S, thunk(1.0), sec(915)); place(S, meow(0.9), sec(916)); place(S, bell(98, 2.5, 0.4), sec(915))
# agree / gavel
place(S, pluck(392, 0.5, 0.6), sec(950)); place(S, pluck(392, 0.5, 0.6), sec(962)); place(S, pluck(494, 0.6, 0.7), sec(974)); place(S, whoosh(0.3, True), sec(985), 0.5)
place(S, stamp_hit(), sec(1000), 1.0); place(S, bp(noise(0.12), 1500, 5000) * ex(0.12, 40), sec(1000), 0.8)
# escape
place(S, whoosh(0.8, True), sec(1026), 0.7); [place(S, pop(500 + 60 * i, 0.8), sec(1030 + i * 5)) for i in range(6)]; place(S, rustle(1.4, 0.7), sec(1030))
for i in range(30): place(S, step(0.45), sec(1030) + i * 0.045)
[place(S, bell(1568 + 120 * i, 0.7, 0.2), sec(1032 + 4 * i)) for i in range(6)]
# sneaky
for i in range(22): place(S, crunch(0.9), sec(1076) + i * 0.1)
place(S, pluck(311, 0.6, 0.6), sec(1102)); place(S, pluck(293, 0.6, 0.6), sec(1110)); place(S, pluck(277, 0.8, 0.6), sec(1118))
# finale
place(S, np.sin(2 * np.pi * 70 * t_(0.7)) * np.sin(np.pi * t_(0.7) / 0.7) * 0.5, sec(1136)); place(S, whoosh(0.4, True), sec(1150), 0.8)
place(S, thunk(1.2), sec(1158)); place(S, hiss(1.1, 1.0), sec(1159)); place(S, meow(1.0), sec(1160)); [place(S, squeak(0.8), sec(1160) + i * 0.13) for i in range(6)]; place(S, bell(98, 3.0, 0.5), sec(1158))

# ---------------- MUSIC ----------------
M = np.zeros(N); beat = 60 / 112
chords = [(146.83, 174.61, 220.0), (196.0, 233.08, 293.66), (220.0, 277.18, 329.63), (146.83, 174.61, 220.0)]  # Dm Gm A Dm
t1 = 38.4; bar = 4 * beat; i = 0
while i * bar < t1:
    a = i * bar; c = chords[i % 4]; L = min(bar, t1 - a) + 0.3
    for f in c: place(M, pad(f, L, 0.22), a)
    place(M, pad(c[0] / 2, L, 0.45), a)
    for k in range(8):
        tt = a + k * beat / 2
        if tt < t1: place(M, pluck(c[[0, 1, 2, 1, 2, 1, 0, 2][k]] * 4, 0.45, 0.5), tt)
    if a >= 2.5:
        for k in (0, 2):
            if a + k * beat < t1 - 0.2: place(M, drum(60, 0.7), a + k * beat)
        for k in (1, 3):
            if a + k * beat < t1 - 0.2: place(M, hp(noise(0.08), 4500) * ex(0.08, 60), a + k * beat, 0.25)
    i += 1
fade = np.minimum(t_(DUR) / 0.8, 1.0) * np.minimum((DUR - t_(DUR)) / 1.0, 1.0); M = M * fade
def wav(name, x):
    s = np.clip(np.stack([x, x]).T, -1, 1).astype(np.float32); import soundfile as sf
    sf.write(name, s, SR, subtype="FLOAT")
try: import soundfile
except ImportError: subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "soundfile"])
wav("work/music_raw.wav", M / (np.abs(M).max() + 1e-9)); wav("work/sfx_raw.wav", S / (np.abs(S).max() + 1e-9)); print("stems ok", N / SR)
