# Original synthesized stems for "Pengadilan Tikus": music.wav + sfx.wav (mix levels are set later by mix.py)
import numpy as np, subprocess, sys
from scipy import signal
SR = 44100
# Durasi WAJIB dari voiceover nyata. Dulu hardcode 39,3143 (contoh lain) sehingga
# musik/SFX berhenti 9 detik sebelum video selesai.
DUR = float(subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "work/voice.mp3"],
    capture_output=True, text=True).stdout)
N = int(DUR * SR); rng = np.random.default_rng(7)
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

# ================= CUE: "Belanda jadi jajahan Indonesia" (1451 frame = 48,35 s) =================
# ambience laut
place(S, lp(noise(16.0), 320) * 0.5, 0.0, 0.5)
for fr in (60, 150, 233, 317):
    place(S, whoosh(0.5, True), sec(fr), 0.5)
for fr in (96, 180, 260):
    place(S, scratch(1.1, 0.5), sec(fr), 0.45)          # derit dermaga
for fr in (120, 210, 300):
    place(S, bell(1568, 0.45, 0.16), sec(fr))           # camar
# serangan pelabuhan (488-569): 4 tembakan meriam
place(S, lp(noise(3.2), 220) * np.sin(np.pi * t_(3.2) / 3.2), sec(500), 0.85)
for i, fr in enumerate((500, 517, 534, 551)):
    place(S, stamp_hit(), sec(fr), 0.85 - i * 0.06)
    place(S, thunk(0.9), sec(fr) + 0.05)
place(S, whoosh(0.6, True), sec(488), 0.6)
# pasar (570-616): koin + kerumunan
place(S, rustle(2.4, 0.5), sec(572))
for i in range(5):
    place(S, bell(1568 + 120 * (i % 3), 0.5, 0.15), sec(578 + i * 5))
place(S, pluck(330, 0.6, 0.55), sec(586)); place(S, pluck(392, 0.6, 0.55), sec(598))
# Amsterdam (617-709)
place(S, whoosh(0.7, True), sec(617), 0.6)
for fr in (640, 668, 696):
    place(S, clang(0.5), sec(fr), 0.45)
place(S, bell(784, 1.4, 0.28), sec(660))
# kelas (710-825): kapur + kertas
for i in range(10):
    place(S, scratch(0.35, 0.45), sec(720 + i * 10))
place(S, rustle(1.2, 0.4), sec(760)); place(S, thunk(0.4), sec(790))
# tulip & keju (826-908): peti dimuat
for fr in (830, 848, 866, 884):
    place(S, thunk(0.7), sec(fr), 0.75)
place(S, rustle(1.6, 0.45), sec(840)); place(S, bell(1568, 0.4, 0.14), sec(870))
# kota dari atas (909-1003)
place(S, whoosh(1.0, True), sec(909), 0.65)
# ruang gelap (1004-1088): sting + drone pengganti musik
place(S, bell(98, 3.2, 0.6), sec(1021))
place(S, lp(noise(2.4), 200) * np.sin(np.pi * t_(2.4) / 2.4), sec(1021), 0.45)
place(S, pad(73.42, 15.0, 0.30), sec(1002))
# adidaya / ulang (1089-1299)
place(S, whoosh(0.8, True), sec(1089), 0.55)
place(S, bell(131, 3.0, 0.5), sec(1103))
for i in range(10):
    place(S, drum(58, 0.5), sec(1201 + i * 9), 0.45)
place(S, whoosh(0.9, False), sec(1250), 0.5)
# finale (1300-1451)
place(S, whoosh(1.1, False), sec(1300), 0.55)
place(S, pad(146.83, 3.4, 0.45), sec(1320))
place(S, rustle(3.0, 0.5), sec(1330))
for i in range(6):
    place(S, drum(52, 0.5), sec(1340 + i * 12), max(0.1, 0.45 - i * 0.06))
place(S, bell(98, 4.0, 0.35), sec(1420))

# ---------------- MUSIK: mars, berhenti di kalimat "pertanyaan besar" ----------------
M = np.zeros(N); beat = 60 / 108; STOP = 33.4
chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (196.0, 246.94, 293.66), (220.0, 261.63, 329.63)]
bar = 4 * beat; i = 0
while i * bar < STOP:
    a = i * bar; c = chords[i % 4]; L = min(bar, STOP - a) + 0.3
    for f in c: place(M, pad(f, L, 0.20), a)
    place(M, pad(c[0] / 2, L, 0.42), a)
    for k in range(8):
        tt = a + k * beat / 2
        if tt < STOP: place(M, pluck(c[[0, 1, 2, 1, 2, 1, 0, 2][k]] * 4, 0.45, 0.45), tt)
    for k in (0, 2):
        if a + k * beat < STOP - 0.2: place(M, drum(60, 0.65), a + k * beat)
    for k in (1, 3):
        if a + k * beat < STOP - 0.2: place(M, hp(noise(0.08), 4500) * ex(0.08, 60), a + k * beat, 0.22)
    i += 1
M[int(STOP * SR):] = 0.0

fade = np.minimum(t_(DUR) / 0.8, 1.0) * np.minimum((DUR - t_(DUR)) / 1.0, 1.0); M = M * fade
def wav(name, x):
    s = np.clip(np.stack([x, x]).T, -1, 1).astype(np.float32); import soundfile as sf
    sf.write(name, s, SR, subtype="FLOAT")
try: import soundfile
except ImportError: subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "soundfile"])
wav("work/music_raw.wav", M / (np.abs(M).max() + 1e-9)); wav("work/sfx_raw.wav", S / (np.abs(S).max() + 1e-9)); print("stems ok", N / SR)
