# PLAN SHOT — "Belanda menjadi jajahan Indonesia" (alternatif sejarah)

Voiceover: `work/voice.mp3` · 48,353 s · **1.451 frame** @30 fps · penyelarasan silence-align (cost 1,77)
Output: 1080×1920, 30 fps. Musik + SFX disintesis (`work/audio.py`), mix `work/mix.py`.
Batas yang dipegang: **tanpa bendera negara asli** (pakai banner rekaan), tanpa tokoh nyata yang masih hidup,
korban tidak ditampilkan.

## Tabel shot

| # | Frame | Frasa | Setting | Cahaya | Kamera | Aksi / properti | SFX |
|---|---|---|---|---|---|---|---|
| 1 | 0–146 | "Bagaimana jika… negara jajahan Indonesia?" | Dua tepi laut berhadapan: kiri pelabuhan Nusantara, kanan pelabuhan Eropa | pagi dingin | glida lambat dari permukaan air ke langit | peta laut digambar di air, dua siluet armada saling berhadapan | whoosh lembut, gelombang |
| 2 | 150–229 | "Bayangkan tahun 1600-an." | Pelabuhan kayu tua, jung dan kapal layar bersandar | night-blue | crane naik dari dermaga ke layar | papan kayu terukir "1600" (teks diegetik, harus terbaca) | creak, ombak, gong rendah |
| 3 | 233–316 | "Alih-alih VOC menguasai Nusantara," | Kapal bertanda banner rekaan mencoba masuk teluk | golden | two-shot dari buritan | kapal asing ditahan; rantai dermaga ditarik | klak rantai, thunk |
| 4 | 317–488 | "kerajaan-kerajaan… bersatu, armada sangat kuat" | Teluk lebar, 12+ kapal berlayar berbaris | siang terang | wide reveal, menarik jauh ke belakang | armada berlayar serempak; banner rekaan berwarna | drum perang, angin layar |
| 5 | 495–569 | "Mereka menyerang pelabuhan-pelabuhan Belanda," | Benteng batu Eropa di tepi kanal | golden sore | push-in cepat ke gerbang | kapal menembus barikade; asap meriam (tanpa korban) | rumble, crash, asap |
| 6 | 570–616 | "menguasai perdagangan," | Pasar pelabuhan: karung, rempah, timbangan | siang | insert close-up timbangan lalu tarik | koin dan rempah berpindah, timbangan naik-turun | ting koin, kerumunan |
| 7 | 617–709 | "bahkan mendirikan pemerintahan kolonial di Amsterdam," | Kota kanal: rumah bata bergaris, jembatan kecil | golden | crane menyusuri kanal | banner rekaan dinaikkan di gedung pemerintahan | terompet pendek, kerekan |
| 8 | 720–825 | "Kini, orang Belanda harus belajar bahasa Indonesia." | Ruang kelas kayu; papan tulis | siang dalam ruang | two-shot dari belakang murid | buku terbuka bertuliskan "BAHASA INDONESIA" (diegetik, tidak tercermin) | gesekan kursi, kapur |
| 9 | 830–908 | "Tulip dan keju dikirim ke Nusantara," | Dermaga: peti tulip + roda keju diangkat | siang | insert peti lalu crane ke kapal | peti dimuat; tulip jatuh satu kelopak | thunk, kerekan |
| 10 | 910–1003 | "dan Amsterdam menjadi pusat pemerintahan kolonial." | Kota kanal luas dari atas | golden | naik tinggi, semua kanal terlihat | kota penuh, kapal masuk kanal | ambience kota, terompet |
| 11 | 1015–1086 | "Tapi ada satu pertanyaan besar." | Ruang gelap, satu meja dengan peta | night-blue, kontras tinggi | push-in lambat ke peta | musik berhenti; drone rendah; satu lilin | sting, drone |
| 12 | 1095–1293 | "Apakah Indonesia… adidaya, atau mengulangi kesalahan?" | Layar terbelah: kiri kota terang & merata, kanan benteng bayangan | terang vs gelap | pan lambat kiri→kanan | dua versi masa depan berdampingan | sting kedua, drone naik |
| 13 | 1300–1443 | "Karena sejarah punya kebiasaan: yang berkuasa jarang mau berhenti." | Kembali ke laut, armada terus berlayar ke horizon | golden memudar | pull back sampai armada jadi siluet | armada tidak berhenti; layar-layar mengecil ke cakrawala | drum meredup, angin |

## Catatan pengerjaan

- Frame 0 wajib sudah menjadi gambar hook (bukan layar kosong).
- Setiap reaksi visual mendarat 0–3 frame **sebelum** katanya.
- Musik berhenti di shot 11 (kalimat "pertanyaan besar"), lalu drone melanjutkan.
- Aset yang belum ada di engine dan perlu dibuat: **kapal layar berlayer** (world2.js sudah punya `ship`,
  perlu diperiksa apakah bisa dipakai ulang), **banner rekaan**, **papan tulis + buku bertulisan**,
  **peti tulip & roda keju**, **timbangan pasar**.
- Sebelum render penuh: `node probe_frame.mjs` untuk setiap shot — tidak boleh ada `[POTONG]` pada pool `p`
  dan `b`, tidak boleh ada `[APUNG]` pada pool `p`/`b`.
