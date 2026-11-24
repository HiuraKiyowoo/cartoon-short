# Kit Cartoon Short v2

Engine untuk video vertikal 1080×1920 / 30 fps: karakter bean-head datar di dunia 3D toon warna-warni, sinkron persis dengan voiceover, plus musik & SFX sintetis (50% level suara).

**Mulai dari sini → `PLAYBOOK.md`** (alur kerja, penempatan kamera, cara membuat karakter/asset, audio, QA, jebakan).

## Isi
| Path | Fungsi |
|---|---|
| `PLAYBOOK.md` | Panduan lengkap (bahasa Indonesia) |
| `PROMPT_UNTUK_AGENT.txt` | Prompt siap tempel untuk AI agent lain |
| `web/main.js` | **Template proyek** 5 adegan yang sudah jalan: ganti `SHOTS` + isi `case` |
| `web/toon.ts` | Gambar karakter (`Pen`, `bodyFront`) — dari mromidev/claude-animated-shorts (MIT) |
| `web/cast.js` | Definisi karakter (kapten, istri, anak, pelaut, tikus, kucing…) |
| `web/world*.js` | Dunia 3D (aula, kota, pelabuhan, desa, laut+kapal+dek, gulungan teks) |
| `web/fx*.js` | Efek kartu (puff, star, qmark, exclaim, splash, …) |
| `render.mjs` / `sheet.py` | Render frame via Chromium; contact sheet |
| `tools/timing.py` | Timing kalimat dari voiceover (+ transkrip opsional) |
| `work/sfxlib.py` | Pustaka SFX/synth · `audio_template.py` stem · `mix.py` mixing 50% |
| `finish.sh` | Encode MP4 + loudness + QA |
| `examples/mary/` | Referensi kualitas: `main.js` 19 adegan, `cast.js`, `audio.py` |
| `examples/older/` | Paus, Kue, Tikus |

## Setup & tes 2 menit
```bash
./setup.sh                 # node>=18, python3, ffmpeg wajib
npm run bundle
node render.mjs stills/a "0,30,60,95,125,165" 540 && python3 sheet.py stills/a stills/contact.jpg 6
```
Lihat `stills/contact.jpg` — kalau muncul kapal, trio karakter, angka 1872, close-up kapten, kit sudah benar.

## Video baru
Letakkan `work/voice.mp3` → `python3 tools/timing.py work/voice.mp3` → edit `web/main.js` (+ `cast.js`, dunia bila perlu) → still → render penuh → audio → `./finish.sh`. Detail di PLAYBOOK bag. 1.

Lisensi: `toon.ts` MIT (mromidev). Sisanya buatan sendiri untuk proyek ini.
