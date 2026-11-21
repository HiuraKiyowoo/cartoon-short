#!/usr/bin/env python3
"""Transkripsi voiceover → words.json (word timestamps) untuk timing shot.

Pakai di VPS:
  /root/whisper-venv/bin/python scripts/transcribe.py assets/voice.mp3 assets/words.json

Model default "small" (multilingual, cukup akurat untuk timing; ±460 MB unduh sekali).
Kalau model tidak bisa diunduh, pakai --fallback yang menyelaraskan frasa skrip ke
segmen bicara hasil deteksi silence (tanpa ASR).
"""
import argparse
import json
import subprocess
import sys


def run_whisper(src, out, model_name, lang):
    from faster_whisper import WhisperModel
    m = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, info = m.transcribe(src, language=lang, word_timestamps=True, vad_filter=True)
    words = []
    for s in segments:
        for w in (s.words or []):
            t = (w.word or "").strip()
            if t:
                words.append({"word": t, "start": round(w.start, 3), "end": round(w.end, 3)})
    if not words:
        raise SystemExit("whisper tidak mengembalikan kata")
    total = words[-1]["end"]
    json.dump({"fps": 30, "words": words, "totalSeconds": round(total, 3), "totalFrames": round(total * 30),
               "source": src, "method": f"faster-whisper {model_name} ({lang})", "language": info.language},
              open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"KATA={len(words)} DETIK={total:.2f} FRAME={round(total * 30)} -> {out}")


def duration(src):
    o = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", src], capture_output=True, text=True)
    return float(o.stdout.strip())


def run_fallback(src, text_path, out, fps=30):
    """Selaraskan frasa skrip ke segmen bicara (deteksi silence), lalu sebar kata per durasi."""
    import re
    dur = duration(src)
    sil = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-af",
                          "silencedetect=noise=-35dB:d=0.25", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    cuts = [float(m) for m in re.findall(r"silence_end: ([0-9.]+)", sil)]
    text = " ".join(l.strip() for l in open(text_path, encoding="utf-8") if l.strip())
    phrases = [p.strip() for p in re.split(r"(?<=[.!?])\s+", text) if p.strip()]
    bounds = [0.0] + cuts + [dur]
    bounds = sorted(set(b for b in bounds if 0 <= b <= dur))
    if len(bounds) < len(phrases) + 1:
        step = dur / len(phrases)
        bounds = [i * step for i in range(len(phrases) + 1)]
    spans = []
    idx = 0
    for i, ph in enumerate(phrases):
        a = bounds[min(i, len(bounds) - 2)]
        b = bounds[min(i + 1, len(bounds) - 1)]
        spans.append((ph, a, b))
        idx += 1
    words = []
    for ph, a, b in spans:
        ws = ph.split()
        if not ws:
            continue
        wsum = sum(max(1, len(w)) for w in ws)
        t = a
        for w in ws:
            d = (b - a) * (max(1, len(w)) / wsum)
            words.append({"word": w, "start": round(t, 3), "end": round(t + d, 3)})
            t += d
    total = words[-1]["end"] if words else dur
    json.dump({"fps": fps, "words": words, "totalSeconds": round(total, 3), "totalFrames": round(total * fps),
               "source": src, "method": "fallback: frasa ke segmen silence"},
              open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"KATA={len(words)} DETIK={total:.2f} FRAME={round(total * fps)} -> {out} (fallback)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--model", default="small")
    ap.add_argument("--lang", default="id")
    ap.add_argument("--fallback", action="store_true")
    ap.add_argument("--script", default="assets/script_id.txt")
    a = ap.parse_args()
    if a.fallback:
        run_fallback(a.src, a.script, a.out)
    else:
        try:
            run_whisper(a.src, a.out, a.model, a.lang)
        except Exception as e:
            print("whisper gagal:", e, file=sys.stderr)
            print("pindah ke fallback", file=sys.stderr)
            run_fallback(a.src, a.script, a.out)
