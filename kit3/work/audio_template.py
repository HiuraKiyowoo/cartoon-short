# Stems untuk satu video. Jalankan dari folder kit:  python3 work/audio_template.py && python3 work/mix.py
# Cue SFX = FRAME dari main.js (fr/30 = detik). Level akhir diatur mix.py, jadi di sini cukup rasio relatif antar-SFX.
import sys, os, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from sfxlib import *
import soundfile as sf

DUR = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "work/voice.mp3"]).decode())
N = int(DUR * SR); sec = lambda fr: fr / 30
S = np.zeros(N)

# ---- ambient bed (pilih sesuai lokasi: wave+wind = laut, cricket = malam, dst.)
place(S, wind(DUR - 0.5, 0.12), 0.2)

# ---- CUE: satu baris per momen visual. Aturan: SETIAP kemunculan objek/angka = whoosh/pop + thunk; klimaks = stamp_hit/bell rendah.
place(S, whoosh(0.8, True), 0.1, 0.4)               # hook: kamera masuk
place(S, pop(500, 0.9), sec(40));  place(S, thunk(0.6), sec(40))   # contoh: angka muncul di frame 40
place(S, stamp_hit(), sec(100));   place(S, bell(98, 3.0, 0.4), sec(100))  # contoh: klimaks

# ---- MUSIC: pad akor + bell arpeggio + drum ringan. chords = (bass, nada2, nada3) dalam Hz.
def make_music(chords, bpm=76, drum_from=8.0, bell_oct=4):
    M = np.zeros(N); beat = 60 / bpm; bar = 4 * beat; i = 0; end = DUR - 1.2
    while i * bar < end:
        a = i * bar; c = chords[i % len(chords)]; L = min(bar, end - a) + 0.6
        for f in c: place(M, pad(f * 2, L, 0.24), a)
        place(M, pad(c[0], L, 0.5), a)
        for k in range(4):
            if a + k * beat < end: place(M, bell(c[[2, 1, 2, 0][k]] * bell_oct, 1.8, 0.1), a + k * beat)
        if a >= drum_from:
            for k in (0, 2):
                if a + k * beat < end - 0.2: place(M, drum(52, 0.5), a + k * beat)
        i += 1
    fade = np.minimum(t_(DUR) / 1.5, 1.0) * np.minimum((DUR - t_(DUR)) / 1.6, 1.0)
    return M * fade
# Am F G Am (misteri/sedih). Ceria: C G Am F = [(130.81,164.81,196.0),(98.0,123.47,146.83),(110.0,130.81,164.81),(87.31,110.0,130.81)] bpm 100-112
M = make_music([(110.0, 130.81, 164.81), (87.31, 110.0, 130.81), (98.0, 123.47, 146.83), (110.0, 130.81, 164.81)], bpm=76)

w = lambda name, x: sf.write(name, np.clip(np.stack([x, x]).T, -1, 1).astype(np.float32), SR, subtype="FLOAT")
w("work/music_raw.wav", M / (np.abs(M).max() + 1e-9)); w("work/sfx_raw.wav", S / (np.abs(S).max() + 1e-9)); print("stems ok", round(DUR, 2), "s")
