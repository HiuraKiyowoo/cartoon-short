#!/usr/bin/env python3
"""Cari timing kalimat dari voiceover TANPA menebak.
Pakai:  python3 tools/timing.py work/voice.mp3 [--asr path/ke/sherpa-onnx-whisper-small]
1) ffmpeg silencedetect (n=-32dB, d=0.18) -> memotong voiceover jadi segmen
2) (opsional) whisper-small via sherpa-onnx per segmen (whisper maks 30 dtk, jadi WAJIB per segmen) -> teks
Output: tabel  segmen | detik | FRAME(30fps) | teks   -> jadikan dasar rentang SHOTS di main.js
"""
import subprocess, re, sys, os, wave, tempfile
import numpy as np
mp3 = sys.argv[1]; asr = sys.argv[sys.argv.index("--asr") + 1] if "--asr" in sys.argv else None
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]).decode())
out = subprocess.run(["ffmpeg", "-nostats", "-i", mp3, "-af", "silencedetect=n=-32dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
cuts = [0.0]
for s, e in zip(st, en):
    if s > 0.3: cuts.append(round((s + e) / 2, 2))   # potong di tengah jeda
cuts.append(round(dur, 2)); cuts = sorted(set(cuts))
rec = None
if asr:
    import sherpa_onnx
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=asr + "/small-encoder.int8.onnx", decoder=asr + "/small-decoder.int8.onnx", tokens=asr + "/small-tokens.txt", language="id", task="transcribe", num_threads=4)
    wav = tempfile.mktemp(suffix=".wav"); subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-ar", "16000", "-ac", "1", wav], check=True)
    w = wave.open(wav); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
print(f"durasi {dur:.3f}s = {round(dur*30)} frame\n")
for i, (s, e) in enumerate(zip(cuts, cuts[1:])):
    txt = ""
    if rec:
        stm = rec.create_stream(); stm.accept_waveform(16000, a[int(s * 16000):int(e * 16000)]); rec.decode_stream(stm); txt = stm.result.text.strip()
    print(f"{i:2d} | {s:6.2f}-{e:6.2f}s | frame {round(s*30):4d}-{round(e*30):4d} | {txt}")
print("\nCatatan: frame mulai kalimat ~ frame di tabel. Mulai visual 3-6 frame SEBELUM kata kunci supaya terasa pas.")
