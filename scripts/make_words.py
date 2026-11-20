#!/usr/bin/env python3
"""Buat words.json sementara dari teks skrip, tanpa ASR.

Dipakai sebelum voiceover ada: timing dihitung dari laju bicara + jeda di tanda baca.
Setelah voiceover direkam, ganti words.json dengan hasil speech-to-text berword-time
(atau hand-fix) — formatnya sama: [{"word": str, "start": float, "end": float}, ...]

Pakai:
  python3 scripts/make_words.py assets/script_id.txt assets/words.json --wps 3.7
"""
import argparse
import json
import re

PAUSE = {",": 0.18, ";": 0.24, ":": 0.24, ".": 0.34, "!": 0.34, "?": 0.34, "—": 0.30, "-": 0.14}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--wps", type=float, default=3.7, help="kata per detik")
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()

    raw = open(a.src, encoding="utf-8").read()
    text = " ".join(l.strip() for l in raw.splitlines() if l.strip())
    tokens = re.findall(r"[^\s]+", text)

    words, t = [], 0.0
    for tok in tokens:
        core = tok.rstrip(",.;:!?—").lstrip("—")
        if not core:
            continue
        # kata panjang butuh sedikit lebih lama (suku kata), kata 1-2 huruf lebih cepat
        dur = max(0.12, (len(core) / 5.0) / a.wps * 1.0)
        words.append({"word": core, "start": round(t, 3), "end": round(t + dur, 3)})
        t += dur
        tail = tok[len(core):] if tok.endswith(tuple(PAUSE)) else ""
        for ch in tail:
            if ch in PAUSE:
                t += PAUSE[ch]
        t += 0.04  # jeda antar kata

    total = words[-1]["end"] if words else 0.0
    frames = round(total * a.fps)
    json.dump({"fps": a.fps, "words": words, "totalSeconds": round(total, 3), "totalFrames": frames,
               "source": a.src, "method": f"estimasi {a.wps} kata/detik (belum ada ASR)"},
              open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(words)} kata · {total:.2f} s · {frames} frame @{a.fps}fps → {a.out}")


if __name__ == "__main__":
    main()
