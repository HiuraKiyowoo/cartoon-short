# PLAN — London Beer Flood (1814), 50 detik, 1080x1920 @30fps

Skrip: `assets/script_id.txt` · timing: `assets/words-voice.json` (**word timestamps asli** dari voiceover)
Total: **1.504 frame** (50,14 s). Voiceover: ElevenLabs "Jonathan – News Anchor", mono 44,1 kHz, 824 KB.
Transkripsi: faster-whisper `small` (id), 102 kata. Suara asli **tidak boleh diubah** — gambar mengikuti suara.

## Timing aktual (dari kata ke frame, @30fps)

| # | shot | frame | kalimat (kata kunci → frame) |
|---|---|---|---|
| 1 | hook: gang sempit, air gelap | 0–113 | "Di London, delapan orang **tewas** f49 … **bir** f92" |
| 2 | setting: tong 22 kaki | 113–321 | "**Tahun** f125 **1814** f136 … **Horshaw** f291" |
| 3 | Crick melihat gelang lepas | 321–494 | "**Sore** f329 **jurugudang** f364 **Crick** f390 … **lepas** f450" |
| 4 | 17 tahun / gelang rutin | 494–667 | "**Dia** f504 **17 tahun** f518-526 … **setahun** f644" |
| 5 | atasan: tulis memo | 667–795 | "**Atasannya** f674 **bahaya** f731 … **aja** f778" |
| 6 | memo di tangan → tong pecah | 795–968 | "**Satu** f805 … **ditangannya** f881 … **pecah** f937" |
| 7 | gelombang 15 kaki | 968–1049 | "**Glombang** f974 **bir** f989 … **jalan** f1059" |
| 8 | 8 tewas · vonis juri · pajak (twist) | 1049–1504 | "**Delapan** f1088 **tewas** f1107 · **5** f1138 **melayat** f1181 **anak** f1193 **2 tahun** f1217-1223 · **Juri** f1253 **Tuhan** f1303 · **pabriknya selamat** f1341-1357 · **pajak** f1423 · **menewaskan** f1464 **8 orang** f1482-1493" |

**Jangkar wajib** (reaksi visual mendarat 0–3 frame sebelum katanya):
gelang jatuh ≈ f447 · memo ditulis ≈ f758 · **tong pecah f934** · **gelombang menerjang f971** ·
angka 8 muncul f1085 · vonis juri f1250 · potongan akhir (pajak) f1330.
Musik march **berhenti** di f934; sting rendah di f1250; hening di f1490.


Fakta terverifikasi (Wikipedia London Beer Flood; History.com; Smithsonian):
17 Oktober 1814 ±16.30, Meux & Co Horse Shoe Brewery, sudut Tottenham Court Road / Great Russell Street.
Tong kayu 22 kaki (6,7 m), diikat 80 long ton besi, isi 3.555 barrel porter 10 bulan. Gelang besi 700 pon
(320 kg) lepas; juru gudang George Crick (17 tahun bekerja) diberi tahu atasannya "tidak akan ada bahaya".
Satu jam kemudian tong pecah. Gelombang 15 kaki (4,6 m) menembus dinding belakang 25 kaki. 8 orang tewas.
Vonis juri: "casually, accidentally and by misfortune". Pabrik selamat karena rebate HM Excise.

| # | frame | s | kata (skrip) | setting | cahaya | kamera | aksi/pose | SFX |
|---|---|---|---|---|---|---|---|---|
| 1 | 0–78 | 0–2,6 | "Di London, delapan orang tewas tenggelam di dalam bir." | gang sempit St Giles, senja, cairan gelap di sela batu | golden | CU air mengalir → tarik pelan ke dinding bata | 0 tokoh; hanya air & bata | tetes, ambience gang |
| 2 | 78–270 | 2,6–9,0 | "Tahun seribu delapan ratus empat belas … pabrik Horse Shoe." | halaman pabrik, tong 22 kaki mendominasi | day | low-angle dari bawah tong, crane naik pelan | 2 pekerja kecil di kaki tong | kayu berderak, angin |
| 3 | 270–420 | 9,0–14,0 | "Sore itu, juru gudang … satu gelang besi lepas" | dekat tong, platform kayu | day | CU gelang → CU tangan Crick | Crick (pena di tangan), gelang jatuh | ting logam, langkah |
| 4 | 420–585 | 14,0–19,5 | "Dia sudah tujuh belas tahun bekerja … dua tiga kali setahun." | dalam gudang, rak barrel | day (interior lebih gelap) | MS Crick, tarik ke rak | Crick mengangkat bahu, gelang lain di lantai | gesek kayu, ambience |
| 5 | 585–735 | 19,5–24,5 | "Atasannya bilang, tidak akan ada bahaya. Tulis memo saja." | pintu kantor, dua orang | day | two-shot, push in ke memo | atasan melambai pergi; Crick menulis | pintu, pena di kertas |
| 6 | 735–900 | 24,5–30,0 | "Satu jam kemudian … dan tongnya pecah." | sepanjang tong, Crick di platform | day → flash 6 frame | hold creeping, lalu kick keras | tong pecah (set piece), papan beterbangan | snap, rumble, crash |
| 7 | 900–1005 | 30,0–33,5 | "Gelombang bir setinggi lima belas kaki menerjang jalan." | New Street, dinding belakang 25 kaki | day (silau) | wide rendah, gelombang menyeberang frame | warga naik ke meja; gelombang | whoosh besar, pecah kayu |
| 8 | 1005–1228 | 33,5–40,93 | "Delapan orang tewas … pajak atas bir yang menewaskan delapan orang." | luar rumah petak → ruang bawah tanah gelap (implisit) → plakat/angka | day → golden → malam | mundur dari pintu (tidak masuk) → potongan plakat → angka 8 bergaris | pelayat tampak dari luar; angka 8 menutup | sting rendah, drone, lalu hening |

## Aturan shot

- **Korban tidak pernah ditampilkan langsung.** Shot 7–8 hanya dari luar rumah, dari air yang naik, dari pintu
  yang tertutup. Nada hormat, bukan slapstick.
- **Setiap reaksi visual mendarat 0–3 frame sebelum katanya** (acuan `words.json`).
- Shot 6 pakai `KICKS` (flip-shake 7 frame) di frame pecah; shot 7 `FLASH_AT` sudah dipakai di akhir shot 5
  (kilatan waktu, 6 frame).
- DOF: shot 1 CU cInf 15–16, shot 3 & 5 close-up 12–14, shot 4 MS 10–12, shot 2/7 wide 0 (tajam).
- Light: `day` untuk shot 2–7, `golden` untuk 1 dan ekor 8; malam hanya di potongan terakhir.
- Musik: march pendek sampai shot 6, **berhenti** saat tong pecah, lalu drone rendah di shot 8.
- SFX mengikuti tabel; puncak SFX ≤ 0,7× puncak suara, musik 50 % level suara (spec).

## Yang harus diganti dari template bridge

| Berkas | Dari (jembatan 1831) | Jadi (London 1814) |
|---|---|---|
| `world.ts` | dek jembatan, rantai, hangers, sungai, taman | halaman pabrik, tong raksasa + 80 hoop, dinding belakang 25 kaki, New Street, rumah petak berlantai bawah tanah |
| `build.ts` | menara, span 54 m, bunting | tembok bata, tong kayu (silinder), rak barrel, gerobak, papan pabrik |
| `cast.ts` | 74 tentara berbaris, penonton, swing | Crick, atasan, 2 pekerja, pelayat (dari luar), warga naik meja |
| `story.ts` | SHOTS/CAMS/DOF bridge, SNAP 34,62 | SHOTS/CAMS/DOF tabel di atas, pecah di frame 735 |

Nomor `id` shot pada kode = 1-based sesuai tabel (`SHOTS[id - 1]`).
