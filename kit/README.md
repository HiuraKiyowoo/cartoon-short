# Kit Cartoon Short (engine buatan sendiri)

Menghasilkan video vertikal 1080x1920, 30 fps: karakter bean-head datar di dunia 3D warna-warni, sinkron dengan voiceover, plus musik & SFX sintetis di 50% volume suara.

## Isi
- `web/` engine: `toon.ts` (gambar karakter, dari repo mromidev/claude-animated-shorts, MIT), `fx*.js` (efek kartu), `world*.js` (dunia 3D), `cast.js` (karakter proyek), `main.js` (timeline per frame), `index.html`.
- `render.mjs` render frame lewat Chromium (Playwright), `sheet.py` contact sheet, `finish.sh` encode MP4 + QA.
- `work/audio.py` sintesis musik+SFX, `work/mix.py` mixing (musik & SFX = 50% RMS suara), `work/shot.mjs` screenshot halaman tes.
- `examples/paus|kue|tikus/` tiga proyek jadi (main.js + cast.js + audio.py) sebagai contoh. Mulai dari yang paling mirip ceritamu.

## Setup (sekali)
    npm install && npx playwright install chromium
    pip install numpy scipy pillow   # ffmpeg harus terpasang

## Alur per video
1. Taruh voiceover di `work/voice.mp3`. Catat durasinya: `ffprobe -show_entries format=duration -of csv=p=0 work/voice.mp3`. Jumlah frame = durasi x 30.
2. Cari timing: `ffmpeg -i work/voice.mp3 -af silencedetect=n=-32dB:d=0.18 -f null -` (jeda antar kalimat). Cocokkan dengan teks naskah.
3. Tulis `cast.js` (karakter) dan `main.js` (daftar SHOTS dengan rentang frame per kalimat, kamera, efek, KICKS). Salin dari contoh.
4. Bundle: `npx esbuild web/main.js --bundle --outfile=web/bundle.js --loader:.ts=ts --format=iife`
5. Cek tampilan dulu (murah): `node render.mjs stills/a "40,100,190,..." 540 && python3 sheet.py stills/a stills/contact.jpg 6`. Perbaiki sampai rapi.
6. Render penuh (dua proses paralel, ~15 menit): `node render.mjs frames "0-589" 1080 &` dan `node render.mjs frames "590-1179" 1080 &`
7. Audio: sesuaikan cue di `work/audio.py` (frame/30 = detik), lalu `python3 work/audio.py && python3 work/mix.py`. Pastikan mix.py melapor music dan sfx -6 dB terhadap suara.
8. `./finish.sh nama_video DURASI "Judul"` lalu cek `out/qa_sheet.jpg` dan hasil freeze/black.

## Aturan gaya
Karakter datar, kepala bean, outline tebal; teks hanya pendek dan diegetik (angka, papan nama); tanpa nama orang nyata sebagai caption; adegan kekerasan dibuat non-grafis. Hook kuat di 3 detik pertama.
