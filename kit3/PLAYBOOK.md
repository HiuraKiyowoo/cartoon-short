# PLAYBOOK — cara membuat short kartun "kualitas Claude"

Semua angka di sini diambil dari 4 video jadi (Paus, Perang Kue, Pengadilan Tikus, Mary Celeste). Contoh kode nyata ada di `examples/mary/` (paling baru) dan `examples/older/`.

---

## 0. Sepuluh aturan yang membuat hasilnya bagus (baca ini dulu)

1. **Timing diukur, bukan ditebak.** Frame tiap adegan berasal dari `tools/timing.py` (silencedetect + transkrip per segmen). Visual muncul 3-6 frame SEBELUM kata kuncinya.
2. **Satu kalimat = satu adegan = satu gambar.** Satu adegan 1,3-4 detik (40-120 frame). Lebih panjang dari ±4 detik → pecah jadi dua angle.
3. **Kamera tidak pernah diam.** Setiap adegan punya posisi awal → akhir (`lv(...)` + `sm(u)`), plus `roll` kecil (±1-3°) yang berlawanan arah di tiap adegan. Dunia juga tidak diam (ombak, bendera, kapal bergoyang, burung, napas karakter).
4. **Variasi jenis shot berurutan:** wide → medium → close-up → inset (gulungan/angka) → wide. Jangan dua adegan berurutan dengan framing sama.
5. **Hook 3 detik pertama:** adegan 1 harus langsung "aneh/mengerikan/lucu" secara visual (wide dramatis atau close-up ekspresi), bukan judul.
6. **Teks di layar minimal dan diegetik:** angka besar (1872, 10, 9), papan nama, tanda tanya/seru. Tidak ada subtitle panjang, tidak ada nama orang nyata sebagai caption.
7. **Pop-in dengan overshoot (`bk`)** untuk setiap objek/angka/karakter baru + `fx("puff")` di kaki + SFX `pop/thunk` pada frame yang sama. Satu momen visual = satu bunyi.
8. **Klimaks diberi "kick":** KICKS (guncangan kamera teredam) + flash putih tipis + SFX rendah (`stamp_hit`, `bell(98)`). Jangan lebih dari 4-5 kick per video.
9. **Audio: musik = 50% RMS suara, SFX ≤ 50%, tanpa ducking, satu gain linear per stem** → `mix.py` yang menjaga ini. Akhir: ~−14 LUFS, true peak < −1 dBTP.
10. **Selalu lihat contact sheet (still 540px) sebelum render penuh.** Render penuh 1080px ± 0,65 dtk/frame; jangan membuangnya untuk adegan yang belum dicek.

---

## 1. Alur kerja (urutan wajib)

```
 0. setup.sh (sekali)
 1. Riset fakta + naskah (hook kuat, 20-55 dtk)        → user rekam voiceover (ElevenLabs) → work/voice.mp3
 2. python3 tools/timing.py work/voice.mp3 [--asr model] → tabel frame per kalimat
 3. Tulis cast.js (karakter) + dunia (world*.js) + SHOTS di web/main.js
 4. npm run bundle
 5. node render.mjs stills/a "frame,frame,..." 540  &&  python3 sheet.py stills/a stills/contact.jpg 6   → LIHAT, perbaiki, ulangi
 6. Render penuh 2 proses paralel (lihat bag. 9)
 7. python3 work/audio_template.py (disalin & diisi cue) && python3 work/mix.py
 8. ./finish.sh nama DURASI "Judul"  → out/nama.mp4 + out/qa_sheet.jpg + cek freeze/black/loudness
 9. Kirim MP4 (< 30 MB) + saran judul, deskripsi, thumbnail, jam upload
```

Perintah lengkap:
```bash
./setup.sh
cp work/audio_template.py work/audio.py          # edit cue di sini
ffprobe -v error -show_entries format=duration -of csv=p=0 work/voice.mp3   # TOTAL frame = durasi x 30
python3 tools/timing.py work/voice.mp3 --asr /path/sherpa-onnx-whisper-small
npm run bundle
node render.mjs stills/a "0,40,80,120" 540 && python3 sheet.py stills/a stills/contact.jpg 6
N=1547; node render.mjs frames "0-$((N/2))" 1080 & node render.mjs frames "$((N/2+1))-$N" 1080 & wait
python3 work/audio.py && python3 work/mix.py
./finish.sh nama_video 51.57 "Judul"
```

---

## 2. Naskah & hook (kalau diminta menulis naskah)

- **Format hook (kalimat 1, ≤ 12 kata):** kontradiksi atau angka mustahil. Contoh: "Paus ini diadili… padahal sudah mati." / "Kapal ini ditemukan utuh, tapi tidak ada satu pun orang di dalamnya."
- Struktur 45 dtk: **Hook (0-4) → konteks 1 kalimat → 3-4 fakta bertingkat (makin aneh) → twist/penutup tanpa jawaban** ("Sampai sekarang, tidak ada yang tahu.").
- **Cek fakta dulu** (web search). Cerita yang diperdebatkan wajib diberi kata "konon". Jangan menulis legenda sebagai fakta.
- Kekerasan dibuat non-grafis; tidak menyebut orang nyata yang masih hidup.
- Idea jangan dipakai ulang; hindari topik yang sudah jadi video.

---

## 3. Timing

`tools/timing.py` memotong voiceover di jeda (`silencedetect n=-32dB d=0.18`) lalu (opsional) transkrip whisper-small per segmen (whisper dibatasi 30 dtk → HARUS per segmen). Hasil: `frame mulai - frame selesai`.

Cara memakainya:
- Tiap baris tabel = satu adegan (kalau segmen > 4 dtk, bagi dua).
- `a` = frame mulai segmen **dikurangi 3-6** (visual mendahului suara).
- Momen dalam adegan (angka muncul, karakter masuk) = frame saat kata kuncinya diucapkan − 3. Kalau perlu presisi kata, jalankan ASR pada potongan kecil (±1 dtk).
- Adegan terakhir `b = TOTAL` (durasi × 30). Frame terakhir fade ke hitam (`tintA`).

---

## 4. KAMERA — inti kualitas

Kamera = `C = { pos, look, fov, roll }` per frame; `pos`/`look` lewat `A([x,y,z])` (koordinat lokal panggung). Gerak: `lv(awal, akhir, sm(u))` (`u` = progres adegan 0..1).

**Unit dunia ≈ 1 meter.** Karakter skala 1 tingginya ±2,1 unit (anak 0,58-0,6, "besar" 1,15-1,3). Mata karakter: `hyOf(seed, stout, scale)`.

### 4a. Resep shot (angka dari proyek jadi)

| Jenis | Posisi kamera (awal → akhir) | Look | FOV | Dipakai untuk |
|---|---|---|---|---|
| **Wide establishing (laut/kota)** | `[16,9,24]→[7,5,13]` tinggi & jauh, mendekat | target jauh `[0,4.5,-22]` | 46 | Hook, kapal, pembukaan |
| **Wide keluar (penutup)** | `[4,6,26]→[2,7,30]` mundur+naik | `[8,4,-30]` | 44 | Ending sepi + fade |
| **Low angle layar/tiang** | `[-5,2.5,-8]→[3,5.5,-10]` | `[0,7.5,-22]` | 54 | Layar, bangunan megah |
| **Medium trio/kerumunan** | `[0,1.9,8.6]→[0,1.8,7.0]` push-in lambat | `[0,1.2,-0.5]` | 46 | 2-4 karakter berjajar |
| **Close-up wajah** | `[0.2,hy,2.8]→[0.1,hy,2.2]` (hy = tinggi mata) | `[0,hy-0.05,-1.5]` | 38 | Ekspresi, reaksi, twist |
| **Insert gulungan/angka** | `[0.1,0,6.0]→[0,0,5.0]` lurus ke kertas | `[0,0,0]` | 40 | Angka, ikon, tanda X |
| **Interior sempit (palka/kabin)** | `[40,1.9,0.9]→[40,1.8,-6.0]` jalan masuk | ujung lorong `[40,1,-13.5]` | 50 | Kargo, barang tertinggal |
| **Dolly sejajar** | x bergeser `lerp(14,-14,sm(u))`, y 5, z 12 | tetap `[0,4,-22]` | 46 | Menyapu pemandangan |
| **Mengikuti rombongan** | mundur dari kerumunan `[-0.5,2,-2]→[1.8,1.9,-3.5]` | arah gerak `[1.2,1.2,-9]` | 50 | Kabur/berjalan pergi |

### 4b. Aturan penempatan (belajar dari kesalahan)
1. **Layar portrait: FOV horizontal sempit** (fov 46 vertikal ≈ 14,7° ke samping per sisi). Karakter di sisi harus berjarak ±1,0 unit dan kamera mundur (z 7-9); kalau tidak, mereka keluar frame. Cek di still!
2. **Kamera di dalam ruangan** harus benar-benar di dalam kotak (box dibuat `BackSide`; di luar akan culled/hitam). Lorong sempit ±1,25 supaya benda terlihat di tengah frame, bukan di tepi.
3. **Jangan taruh kamera di dalam kolom/pilar/tiang** (bidang hitam). Geser start camera 0,3-0,5 unit.
4. **Tinggi kamera = peran emosi:** rendah (y 1,5) = karakter besar/mengancam; tinggi (y 6-9) = kecil/tak berdaya/luas; setinggi mata = netral/dekat.
5. **Roll ±1-3° dan berlawanan arah** antar adegan; roll 4-6° + `Math.sin` untuk panik/pusing.
6. Hindari objek penghalang di depan target (pagar dermaga menutup tikus → naikkan tikus, turunkan pagar; kapal tertutup tembok benteng → naikkan kamera ke y 7,5).
7. Kamera `look` selalu ke titik yang menarik (wajah, objek), bukan tengah ruang kosong.

### 4c. Easing & gerak (sudah ada di main.js)
- `sm(x)` smootherstep (gerak kamera) · `eo(x)` ease-out cubic · `bk(x)` back/overshoot (POP objek) · `ramp(f,a,b)` progres 0..1 antar frame · `lerp`, `lv` (lerp vektor) · `sec(s)`
- `KICKS=[[frame,kekuatan]]` → guncangan kamera 9 frame meluruh `exp(-d/2.5)`.
- `flashA` (0-0.55) → kilat putih; `tintA` → fade hitam (akhir) atau tint warna.

---

## 5. KARAKTER (kartu 2D billboard di dunia 3D)

Karakter digambar di canvas 450×750 (ruang desain 600×1000, K=0.75, telapak kaki di y=975) memakai `toon.ts` (`Pen`, `bodyFront`). Kartu selalu menghadap kamera (yaw saja). Karena itu karakter tampak "flat" tapi hidup di dunia 3D = gaya channel.

**Mendefinisikan karakter** (`cast.js` → `OUT`):
```js
captain: { ...OFFICER, jacket:"#1f3558", pants:"#e8e4d8", boots:"#241726", hat:"cap", cap:"#1f3558",
           buttons:"#e8c45a", sash:null, sword:false, rifle:false, belt:null, moustache:"#5a4a3c", build:"stout", skin:"#f1d2b0" }
```
- Basis: `OFFICER` (stout), `RIFLEMAN`, `KID` (anak), `PARENT`, `soldier(v)`, `townsfolk(v)` (warga acak, `v`=varian).
- Topi: `hat: "cap" | "shako" | "shako_tall" | "bonnet" | "hair" | null`.
- Varian massal (pelaut): `kind:"sailor", v:i` → warna kulit & topi berganti otomatis (`SK`, daftar `cap`).
- **Aksesori tambahan** digambar setelah `bodyFront` di `drawPerson` memakai geometri kepala `headGeo(seed, facing, stout)` → `{a,b,hc,crown,chin,HH,cx}`: contoh `beard()` (janggut dagu), `wig()` (wig hakim), `cap()` (topi). Pakai `p.rot=[rad(tilt), cx, hc+b]` agar ikut memiringkan kepala. **Janggut harus di dagu saja** (jangan menutup mulut).
- **Ekspresi valid:** `neutral, stern, grin, laugh, whistle, nervous, shock, relief, relief_open, dazed, pained, smile, smile_closed, lick` (nama lain = crash; "scared" tidak ada untuk manusia → `nervous`). Hewan punya set sendiri: tikus `neutral, scared, grin, sneaky, munch`; kucing `glare, hiss`.
- Opsi lain `bodyFront`: `mode:"stand"|"sit"` (sit rawan wig/topi melayang → lebih aman berdiri di belakang meja), `wave:1` (tangan terangkat), `headTilt` (derajat), `look` (arah pupil), `blink`, `prop`.
- **Hewan/objek hidup**: tambah fungsi `drawX(cv,o)` di `cast.js` dengan `Pen` (`p.ell, p.poly, p.line, p.stroke, p.arc`), lalu daftarkan di `drawAny`. Gambar di ruang 600×1000, kaki di y≈970, kepala besar (bean) agar ekspresif.

**Menaruh karakter di adegan:**
```js
person(opts, x, y, z, skala, flip, rz, blob)
person(cap({expr:"neutral"}), -1.0, 0, 0.6, 1.0*pop, false, idle(f,3), true)
```
- `x` kiri/kanan, `y` tinggi lantai, `z` kedalaman (z kecil = jauh dari kamera di +z). `rz` = putar miring (pakai `idle()` = napas, `Math.sin(f/3)*0.03` = gemetar). `blob=true` bayangan oval di lantai.
- Tekstur karakter di-cache berdasarkan opsi (dibulatkan 0.1) → ekspresi/headTilt berubah = tekstur baru (aman, cache 140).
- Rombongan 7 orang: dua baris (z 0,6 dan −0,6/−1,6), x berjarak 0,9, `flip` bergantian, ekspresi variasi.
- Berjalan: `y = Math.abs(Math.sin(f/3))*0.07` (bouncing) + `x/z` dengan `lerp(...,sm(w))`.

---

## 6. DUNIA & ASSET 3D

**Prinsip gaya:** semua `MeshToonMaterial` dengan gradient 3-step (`grad3`) + outline hull terbalik (`addM` otomatis menambah mesh `BackSide` yang diperbesar sepanjang normal; `ink: 0.03` = tebal outline; `ink:false` = tanpa). Warna datar cerah, tekstur kanvas dilukis dengan garis gelap (plank, batu, ombak).

**Helper dasar (`world.js`):**
```js
addM(parent, geometry, material, [x,y,z], { rot:[rx,ry,rz], scale:[..], ink:0.03 })
mkMat(0xa86f3a)                 // warna datar toon
mkMat(cvTex("nama", 256,256, (g,w,h)=>{...gambar kanvas...}, repeatX, repeatY))   // bertekstur
```
**Resep membuat asset baru** (lihat `world4.js` sebagai contoh lengkap):
1. Susun dari primitif: `BoxGeometry`, `CylinderGeometry`, `SphereGeometry`, `ConeGeometry`, `TorusGeometry`, `ExtrudeGeometry` (lambung kapal dari `Shape`). 5-15 bagian cukup; detail datang dari warna + outline.
2. Palet 3-4 warna per benda: dasar, bayangan lebih gelap (×0.7), aksen terang kecil (emas/merah).
3. Objek yang bergerak dikembalikan dalam objek `o` (`o.wheel`, `o.sail`, `o.flag`) lalu dianimasikan di `frame()` dengan `rotation`/`position` berbasis `f`.
4. Barang kecil yang menceritakan cerita (cangkir, boneka, sepatu bot, bekas perahu di dek) → letakkan di dekat titik kamera close-up; ini yang membuat adegan "kosong tapi mengerikan".
5. Skala: dek 8,4×24; palka 8×4×16; kabin 6×3×8; barel Ø1×1,1. Karakter 2,1 tinggi.

**Panggung (stage):** beberapa dunia disimpan di satu scene tapi berjauhan (`ORG = {Z:[-100,0,0], D:[100,0,0], S:[0,0,100]}`); tiap adegan hanya menampakkan satu (`stages[k].visible`). Ruang kecil di dalam satu panggung ditaruh dengan offset (palka x=+40, kabin x=−40) supaya kamera interior tidak melihat dunia luar.

**Dunia yang sudah ada:**
`world.js`: `buildGrave, buildRome, buildHall` (aula pengadilan), `buildJail, buildDesk` (**gulungan/papan teks**, `WS.sc` kanvas 1024×1536) · `world2.js`: `buildTown` (kota Meksiko), `buildHarbor` (pelabuhan+benteng+5 kapal) · `world3.js`: `buildVillage`, `buildDock` (kursi terdakwa) · `world4.js`: `mkShip, mkBoat, buildSea, buildDeck` (kapal+dek+palka+kabin).

**LOOK (suasana per adegan):** `{bg:[atas,bawah], fog, fn:[dekat,jauh], hemi, dir(cahaya), card(tint kartu)}`. Preset: `sea` cerah, `grey` mendung, `hold` interior hangat gelap, `dusk` senja, `paper` ungu gelap untuk gulungan. Ganti LOOK antar-adegan = ganti mood tanpa mengubah dunia. Tint kartu (`card`) membuat karakter menyatu dengan cahaya adegan.

---

## 7. EFEK KARTU (`fx(kind, t, x, y, z, skala, rz, additive)`)

`t` = 0..1 umur efek (pakai `ramp(f,a,b)`; yang berulang `(f%40)/40`). Jenis: `puff dirt sweat vein star spark steam fly calendar shovel flame bits cloud blob glow stamp pastry cake croissant boot coffin cball smoke boom splash xmark qmark tag bird zzz barley letter exclaim call cage`.
- Karakter muncul → `puff` di kaki (skala 1,3-2). Ide/bingung → `qmark`. Kaget → `exclaim` + `sweat`. Barang penting → `star` berputar. Air → `splash`. Latar → `bird`, `cloud` (jauh, skala besar).
- Efek baru: tambah cabang `else if (kind==="x")` di `fx4.js` (canvas 256×256, titik tengah C=128, gambar dengan `Pen`).

**Gulungan/teks (stage S):** `paperBase(sg,1); header(sg)` lalu `bigNum(sg,"1872",512,760,230,"#c0262d", bk(ramp(...)))`, ikon: `shipIcon, pirateIcon, swordsIcon, blastIcon, beanIcon, slate, xMark, ring`. Setelah menggambar: `WS.tex.needsUpdate = true`. Untuk membuka gulungan: `paperBase(sg, ramp(f,a,b))`. Coretan "teori dibantah" = `xMark` muncul berurutan + flash 0,25 + SFX `thunk+sad`.

---

## 8. AUDIO

- `work/sfxlib.py` = pustaka suara sintetis (semua asli): `thunk stamp_hit bell clang whoosh rustle scratch drip pluck pad drum cannon whistle pop clink crack chirp sad squeak crunch meow hiss step cricket creak wave wind gull tick splash oar`.
- `work/audio_template.py`: `place(S, suara, detik, gain)`; cue = `sec(frame)`. Musik: `make_music([akor...], bpm)`; minor lambat (Am F G Am, 76 bpm) untuk misteri; mayor (C G Am F, 100-112 bpm) untuk lucu.
- Aturan cue: objek muncul → `pop`+`thunk`; transisi/gulungan → `whoosh`; klimaks → `stamp_hit`+`bell(98)`; hewan → `squeak/meow/hiss`; ambient bed `wave+wind` (laut), `cricket` (malam) sangat pelan.
- `work/mix.py`: mengukur RMS suara (gated), menjadikan musik tepat 0,5× (−6,02 dB), SFX ≤ 0,5× dengan peak ≤ 0,7× peak suara. Satu gain linear per stem, tanpa kompresi/ducking. Cetak "music vs voice −6.0 dB".
- `finish.sh`: satu gain ke −14 LUFS, `alimiter 0.708`, AAC 192k.

---

## 9. RENDER

- Chromium headless + WebGL SwiftShader (CPU). 1080 lebar: ± 0,65 dtk/frame sendirian; dua proses paralel masing-masing ±1,5-1,8 dtk/frame (total lebih cepat). Still 540 lebar: 0,35-0,5 dtk/frame.
- Bagi frame jadi 2 bagian untuk 2 proses. `RESUME=1` melewati frame yang sudah ada kalau proses terputus.
- Video ± 40-50 dtk = 1200-1550 frame ≈ 15-20 menit. Jalankan di latar belakang & cek `r1.log`.
- Kirim ke Telegram/WA: ukuran < 30 MB → CRF 23-24 (video 50 dtk ≈ 10-14 MB).
- Format: 1080×1920, 30 fps, H.264 yuv420p, +faststart.

---

## 10. QA checklist (sebelum kirim)

- [ ] Contact sheet 540px: tiap adegan ada subjek terlihat penuh, tidak terpotong, tidak tertutup benda, tidak ada bidang hitam.
- [ ] Karakter di tepi layar? (portrait sempit) → rapatkan/mundur.
- [ ] Setiap kalimat voiceover punya perubahan visual pada kata kuncinya.
- [ ] Tidak ada ekspresi/typo `kind` salah (crash `faceFront`).
- [ ] `mix.py`: music −6,0 dB & sfx ≤ −6 dB vs voice. Final: ≈ −14 LUFS, true peak < −1 dBTP.
- [ ] freezedetect/blackdetect kosong (kecuali fade akhir). Durasi MP4 = durasi voiceover.
- [ ] Hook dalam 3 detik pertama menarik di thumbnail/scroll.

---

## 11. Jebakan yang pernah terjadi (dan perbaikannya)

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| Crash `faceFront` | ekspresi tidak valid ("scared" untuk manusia) | pakai `nervous` |
| Flash putih menetap di awal | variabel flash tak digating | `if (f >= trigger)` |
| Kapal tak terlihat di pelabuhan | tertutup tembok benteng | naikkan kamera y 7,5, look lebih rendah |
| Teks/ikon terpotong di gulungan | posisi di luar 824 px lebar kertas | pakai x 200-824, y 330-1400 |
| Tikus tertutup pagar dermaga | pagar lebih tinggi dari tikus | tikus y=0,35 s=0,75; pagar diturunkan |
| Dermaga menembus kolom aula | posisi bertabrakan | geser dermaga x=−1,4 |
| Wig/topi hakim melayang | mode `sit` mengubah titik kepala | hakim berdiri di balik meja |
| Janggut menutup mulut | poligon terlalu tinggi | janggut dagu saja (`chin−6` ke bawah) |
| Istri berdiri di dalam palka | palka z=−4,4 bentrok posisi | pindahkan palka, trio di z 0,6 |
| Kapten di luar layar | FOV horizontal sempit | x −1,0/0/1,0 & kamera z 8,6→7,0 |
| Palka hitam | kamera di luar kotak (back-face) | kamera masuk ke dalam kotak |
| Barel hanya di tepi layar | lorong terlalu lebar | lorong ±1,25 |
| Transkrip whisper terpotong | batas 30 dtk | transkrip per segmen |
| File > 30 MB | CRF terlalu rendah | CRF 23-24 |
| Sumber luar tak bisa diunduh | jaringan allowlist (hanya npm/pip/GitHub) | semua aset digambar sendiri; model ASR dari GitHub release |

---

## 12. Membuat video untuk cerita baru — templat berpikir

1. Daftar **objek/tokoh kunci** (≤ 4 karakter, ≤ 3 dunia). Gambar daftar `OUT` dan asset.
2. Daftar **angka/fakta kunci** → jadikan adegan gulungan (S) berisi `bigNum`.
3. Rancang urutan shot dengan pola: `WIDE (hook) → medium → insert → close-up reaksi → wide → insert → close-up (twist) → wide keluar + fade`.
4. Setiap 3-4 adegan sisipkan satu adegan dunia "kosong yang aneh" (barang tertinggal, tanda tanya) supaya ada jeda emosi.
5. Tutup dengan pertanyaan terbuka + `qmark` besar + fade.

Mulai dari `web/main.js` (templat 5 adegan yang sudah jalan) atau salin `examples/mary/main.js` (19 adegan, referensi kualitas).

---

## 13. Asset: BUAT BARU atau PAKAI ULANG? (aturan wajib)

**Boleh dipakai ulang (infrastruktur, bukan "isi"):** `toon.ts`, `addM/mkMat/cvTex`, sistem `person/fx/QUEUE`, kamera & easing, gulungan teks (`paperBase`, `bigNum`, `xMark`), `fx` generik (puff, star, qmark, exclaim, splash), `sfxlib.py`, `mix.py`, `finish.sh`.

**Harus dibuat BARU untuk setiap ide/video:**
1. **Dunia utama** (`world5.js`, dst.): tempat kejadian cerita. Jangan memakai `buildDeck/buildHall/buildTown` kalau cerita bukan di sana. Minimal 1 dunia baru yang menjadi "wajah" video (Batu Yap → pulau + batu bulat raksasa; Centralia → jalan retak berasap).
2. **Objek ikonik cerita** (benda yang disebut di hook): dibuat dari primitif, 5-15 bagian, dengan warna dan siluet khas. Contoh: batu uang berlubang di tengah, kelelawar dengan bom, merpati dengan layar.
3. **Karakter inti**: outfit, warna, aksesori baru di `cast.js` (`OUT`). Jangan memakai kapten/hakim/istri lagi. Ganti siluet (topi, rambut, janggut, postur gemuk/kurus) agar langsung beda.
4. **Palet & LOOK** baru (warna langit, fog, cahaya) yang cocok dengan mood cerita.
5. **Cue SFX/musik** baru (akor, tempo, ambient).

**Cek anti-copy sebelum render penuh:** bandingkan contact sheet dengan video sebelumnya. Kalau latar atau karakter terlihat sama, ulangi. Hapus semua kode dunia yang tidak dipakai agar tidak tergoda.

Urutan membuat asset baru: (a) tulis daftar objek dari naskah, (b) buat tiap objek sebagai fungsi `mkX(parent,x,y,z,s)` di file world baru, (c) uji sendiri dengan 1 still dekat (kamera 4 unit di depannya), (d) baru susun dunia, (e) baru tulis SHOTS.

---

## 14. Karakter tampak "garis"/dari samping: penyebab & cara mencegah

Karakter adalah KARTU datar. Kartu hanya terlihat benar jika **selalu menghadap kamera**. Kalau karakter tampak seperti garis tipis, penyebabnya salah satu ini:

1. **Kartu ditaruh sebelum posisi kamera final (paling sering).** `yawTo()` memakai posisi kamera; kalau `person()` langsung digambar sebelum `cam.position` diisi, kartu menghadap ke arah lama. **Wajib:** `person/fx` hanya mengantre (`QUEUE.push`), lalu dijalankan SETELAH `cam.lookAt(...)` dan `CAMP.copy(cam.position)` (lihat akhir `frame()`).
2. **Rotasi kartu diatur manual** (`rotation.y` tetap / karakter dibuat sebagai mesh 3D biasa). Jangan. Selalu: `m.rotation.set(0, Math.atan2(CAMP.x-x, CAMP.z-z), 0)`.
3. **Kartu `PlaneGeometry` satu sisi.** Pakai `side: THREE.DoubleSide` dan `alphaTest`.
4. **Kamera terlalu tinggi/miring ke bawah** (pitch besar): kartu vertikal tampak menyusut. Tahan pitch kamera ≤ ~25° saat ada karakter; kalau perlu pandangan dari atas, pakai kartu di lantai (`FGEO`) atau tampilkan lewat gulungan.
5. **Kamera bergerak menyamping jauh** dengan `look` tetap: karakter di tepi layar terlihat miring karena perspektif. Jaga karakter di tengah ±1,0 unit, dan geser `look` mengikuti subjek.
6. **Karakter diputar dengan `rz` besar** atau `scale.x` kecil. `flip` hanya `scale.x = -s`; jangan skala x ke arah 0.
7. **Karakter digambar menghadap samping** (`bodySide`) tanpa disengaja. Standarnya `bodyFront` (menghadap depan). Pose berjalan pakai `bodyFront` + loncat kecil pada `y`, bukan mengganti ke sisi.

**Pola framing supaya karakter selalu terbaca:**
- Dominan **frontal** atau ¾ (kamera sejajar dada/mata, sudut ≤ 25° dari depan).
- Close-up: kamera setinggi mata (`hyOf`), jarak 2,2-2,8, fov 38.
- Medium: jarak 7-9, fov 46, karakter spasi ±1,0.
- Selalu tampilkan **wajah dan ekspresi** pada kalimat penting; tubuh dari samping/belakang hanya untuk adegan berjalan menjauh, dan itu pun karakter tetap kartu menghadap kamera.
- Setiap still: periksa bahwa tiap karakter terlihat lebar penuh dan wajahnya terbaca.
