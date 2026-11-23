# Mix: voice untouched; music at exactly 50 % of the voice's gated RMS (-6.02 dB); SFX at <= 50 % with peaks capped at 0.7x voice peak.
# Only one linear gain per stem; no ducking, no compression.
import numpy as np, subprocess, soundfile as sf
SR = 44100
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "work/voice.mp3", "-ar", str(SR), "-ac", "1", "work/voice_44k.wav"], check=True)
v, _ = sf.read("work/voice_44k.wav"); m, _ = sf.read("work/music_raw.wav"); s, _ = sf.read("work/sfx_raw.wav")
m = m.mean(1); s = s.mean(1); N = len(m); v = np.pad(v, (0, max(0, N - len(v))))[:N]
def gated_rms(x, abs_gate_db=-50, rel_db=-10, win=0.4, hop=0.1):
    w, h = int(win * SR), int(hop * SR); p = np.array([np.mean(x[i:i + w] ** 2) for i in range(0, len(x) - w, h)])
    db = 10 * np.log10(p + 1e-12); keep = db > abs_gate_db
    if not keep.any(): return 1e-9
    ref = 10 * np.log10(p[keep].mean()); keep &= db > ref + rel_db
    return float(np.sqrt(p[keep].mean()))
rv, rm, rs = gated_rms(v), gated_rms(m), gated_rms(s)
gm = 0.5 * rv / rm; gs = 0.5 * rv / rs
pk_v = np.abs(v).max(); cap = 0.7 * pk_v
if np.abs(s).max() * gs > cap: gs = cap / np.abs(s).max()
m2, s2 = m * gm, s * gs
db = lambda a, b: 20 * np.log10(a / b)
print(f"voice gated RMS {20*np.log10(rv):.2f} dBFS | music vs voice {db(gated_rms(m2), rv):+.2f} dB | sfx vs voice {db(gated_rms(s2), rv):+.2f} dB")
print(f"voice peak {pk_v:.3f} | music peak {np.abs(m2).max():.3f} | sfx peak {np.abs(s2).max():.3f} (cap {cap:.3f})")
mix = v + m2 + s2; sf.write("work/mix.wav", np.stack([mix, mix]).T.astype(np.float32), SR, subtype="FLOAT"); print("mix peak", np.abs(mix).max(), "dur", N / SR)
