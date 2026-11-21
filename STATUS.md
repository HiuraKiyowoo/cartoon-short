# STATUS — cartoon-short (London Beer Flood)

Terakhir diperbarui: 21 Nov 2026, sesi malam.

## Yang sudah selesai dan terbukti

| Hal | Status | Bukti |
|---|---|---|
| Skrip Indonesia | selesai | `assets/script_id.txt` (111 kata) |
| Voiceover | diterima | ElevenLabs "Jonathan – News Anchor", 824 KB, mono 44,1 kHz, **50,44 s** |
| Timing per kata | selesai | `assets/words-voice.json` — 102 kata, 1.504 frame @30fps (faster-whisper `small`, id) |
| Batas shot + jangkar | selesai | `PLAN.md` (tong pecah f934, gelombang f971, angka 8 f1085, juri f1250) |
| Look render (ink+lens+bloom+grade) | **bekerja** | frame di VPS & GitHub Actions, 467 draw call / 1,24 jt segitiga |
| Composer manual (`post.manual`) | bekerja | `src/videos/beerflood/Bridge.tsx` — render di `useEffect`, satu `EffectPass` per effect |
| Skrip render + GL probe + transkripsi | tersedia | `scripts/{setup_vps.sh,gl_probe.sh,render.sh,render_media.mjs,stills.mjs,transcribe.py,make_words.py}` |
| Render di GitHub Actions | **bekerja** (setelah fix composer) | run 44878991084: rgb 95,119,141 & 139,128,117 (bukan warna latar) |

## Yang belum

1. **Scene masih jembatan 1831**, belum pabrik London 1814. Ini pekerjaan besar dan jadi jalur kritis:
   `world.ts` (38 KB), `build.ts` (45 KB), `cast.ts` (29 KB) semuanya khas jembatan.
   Rencana: modul scene baru yang ringan — tong 22 kaki (silinder + hoop besi instanced), dinding
   belakang 25 kaki, gang New Street, rumah petak (bisa pakai ulang `buildTown`), 3–5 tokoh kartu.
2. **Audio**: toolkit repo (`templates/audio/`) itu infrastruktur yang berguna (mix LUFS + limiter),
   tapi musik dan tabel SFX-nya khusus cerita jembatan → harus dibuat baru.
   Aturan level dari spec user: musik **50 % level suara (−6 dB, gated RMS)**, SFX ≤ 50 % dengan
   puncak ≤ 0,7× puncak suara; satu linear gain + peak limiter di seluruh mix.
3. **Render final 1.504 frame** + mux + QA.

## Angka penting (jangan diukur ulang)

- Biaya render ditentukan **geometri**, bukan piksel dan bukan efek:
  probe kubus 1,4 s/frame · jembatan penuh 56–61 s/frame · scale 0,5 → tetap 60 s/frame ·
  lens blur dimatikan → hemat hanya 3 s.
- Karena itu render final boleh **2K** tanpa tambahan waktu; satu-satunya tuas cepat = scene ringan.
- GL yang bekerja: **hanya `swangle`** (SwiftShader). `angle`, `egl`, `vulkan` gagal dengan
  `GL_VENDOR = Disabled` di container (GitHub Actions, Codespace, VPS) walau Mesa llvmpipe ada.

## Mesin

- **VPS**: `ssh -p 25000 root@178.83.180.197`, kunci `~/.ssh/hp2_ed25519`. 4 vCPU / 7,9 GB / 252 GB,
  Debian 12, Node 22, Mesa 22.3.6. Repo di `/root/cartoon-short`, venv whisper di `/root/wv`.
  **Masa aktif sampai 21 Nov 2026 17:30 WIB.**
- **GitHub Actions**: repo publik `HiuraKiyowoo/cartoon-short`, workflow `Render Stills`,
  menit gratis tanpa batas, batas 6 jam per job → cocok untuk render panjang per potongan.
- **Codespace**: `special-space-disco-wr6vg6qv4xg4hg4j9` (2 vCPU / 8 GB), masih hidup.

## Jebakan yang sudah memakan waktu (jangan diulang)

- `@remotion/cli` menarik `@remotion/captions` yang sering ETARGET → cukup `bundler` + `renderer`,
  unduh browser lewat `ensureBrowser()`.
- Entry Remotion ber-JSX wajib `.tsx`; berkas `.mjs` tidak boleh memuat anotasi TypeScript.
- `| tee` menyembunyikan exit code → `set -o pipefail`.
- `useFrame` mati di `frameloop: "never"` → composer harus dirender di `useEffect`.
- Lens blur (`CONVOLUTION`) tidak boleh digabung dalam satu `EffectPass`.
- Aset Kenney GLB tidak ada di repo (404 terus) → pohon/semak jatuh ke versi prosedural.
