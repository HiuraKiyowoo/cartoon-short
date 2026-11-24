# DENAH — cerita "Belanda jadi jajahan" (kit v3)

Semua koordinat LOKAL panggung (kamera memakai `A()` yang menambah ORG panggung).
Sumbu: +x kanan, +y atas, +z ke arah KAMERA. Kamera selalu di +z menghadap -z, kecuali dinyatakan lain.
Skala: tinggi karakter dewasa ≈ 2,1 unit; anak ≈ 1,3; rumah ≈ 11-18; kapal ≈ 12 × 3.

ORG panggung: `N = (-260,0,0)` · `K = (0,0,-170)` · `I = (260,0,0)` · `S = (0,0,140)`

---

## 1. Panggung N — pelabuhan Nusantara

| Objek | Posisi (x, y, z) | Ukuran | Catatan |
|---|---|---|---|
| daratan | bidang penuh, atas **y = 0** | 150 × 90 (z -25…65) | **tempat karakter berdiri = y 0** |
| laut | y = -0,06 | 800 × 800 | terlihat hanya untuk z < -25 |
| dek dermaga | (0, 0.70, -2) | 26 × 0,3 × 7 (z -5,5…1,5) | atas **y 0,85** |
| tiang dermaga | x {0, ±5,5, ±11}, z {-5, 1} | ⌀0,5, tinggi 2,4 | atas y 2,1 — **jangan taruh karakter di x 0 bila kamera di +z** |
| pagar dermaga | z -5,4, balok y 2,0 | ⌀0,18 tinggi 1,25 | mengiris karakter bila karakter di belakangnya |
| gudang rempah | (13,5, 0…4,2, -1) | 7 × 4,2 × 5 | sisi kanan |
| karung rempah | x 10,6…12,8, z -3,4…-2,1 | ⌀1,0 × 1,1 | atas dek |
| kapal lateen | (-14,-15) s1,25 · (2,-19) s1,45 · (17,-14) s1,05 · (-30,-22) s1,15 | lambung ≈12 × 3, tiang y 8,6 | kapal (2,-19) tiang di x -0,3 dan +5,5 |
| palem | x -30…+30 langkah 5,4, z 12…26 | tinggi ≈9 | latar depan |
| rumah panggung | (22,10) · (30,14) · (15,16) | 3,4 × 3 | z positif (belakang kamera bila kamera di z 3-9) |
| panji merah-putih | x -4,2 z -3,2 dan x 4,6 z -3,0 | kain 2,6 × 1,7 di y 5,4 dan 0,6 di y 4,4 | tiang 6,6 |

**Kamera di panggung N (karakter berdiri di y = 0):**

| Shot | pos → look | fov | Karakter |
|---|---|---|---|
| hook_wide | [18,11,26]→[8,6,14] · look [0,5,-30] | 46 | — |
| hook_face | [0.15,1.90,6.2]→[0.1,1.86,5.4] · look [0,1.72,**3.2**] | 38 | panglima (0,0,3.2) s1,15 |
| rapat | [0,2.05,8.8]→[0,2.0,7.5] · look [0,1.35,**3.2**] | 46 | raja/panglima/pelaut x -1/0/1, z 3,2 |
| serang_wide | [15,6.5,20]→[6,8.5,12] · look [0,4.5,-26] | 46 | — |
| serang_dekat | [-4.5,2.2,-5]→[3,3.4,-8.5] · look [0,7.5,-22] | 54 | — (kamera di atas dek) |
| armada | [13,7.5,21]→[5,9.5,13] · look [0,4.2,-28] | 46 | — |
| end | [6,7,26]→[3,8.5,32] · look [8,4,-30] | 44 | — |

---

## 2. Panggung K — kota kanal Belanda

| Objek | Posisi | Catatan |
|---|---|---|
| air kanal | x **-9,5…+9,5**, y 0,05 | sempit, hanya di tengah |
| tepi kanal (tembok) | x ±10,6 (lebar 2,2), atas **y 2,3** | muka dalam x ±9,5 |
| jalan batu | x ±(11,7…33), atas **y 2,3** | **tempat karakter berdiri = y 2,3** |
| rumah kanal | x ±(12,6…14,0), dasar y 2,3, z = 20 - i·8,5 (i 0…6) | tinggi 11…18, dalam 4,4 |
| jembatan | dek rata, atas **y 2,3**, x ±10,5, z 2 ±1,8 | **pagar di z 3,65 & 0,35** → taruh karakter di **z 3,4** (muka pagar dekat) agar kaki tidak teriris |
| kincir | (-24, 2,3, -26) | kincir bilah r 3,7 di y 10,7 |
| peti tulip | x -12,4…-9,7, z 6,2…4,7, dasar y 2,3 | tinggi total 3,0 dengan tulip |
| tong kayu | x 13,0, z 4,4…1,6 | di jalan timur |
| kereta tangan | (13,4, 2,3, 8,6) | jalan timur |
| lampu jalan | x ±30, z 8/0/-8 | di luar jalan, supaya tidak menutupi kanal |

**Kamera di panggung K (karakter di y = 2,3):**

| Shot | pos → look | fov | Karakter |
|---|---|---|---|
| krat / kirim | [-12.4, 5.9, 11.4]→[-12.4,5.5,10.2] · look [-12.4,3.0,6.0] | 40 | — (peti + tulip) |
| klaim | [0,3.5,9.6]→[0,3.4,8.4] · look [0,3.25,**3.4**] | 46 | raja (-0.95) & gubernur (0.95), y 2,3, z **3,4** |
| kota_wide | dolly x 15→-15, y 7,5, z 14 · look [0,4,9,-22] | 46 | — |
| kanal_senja | [0.4,3.65,8.6]→[0.2,3.8,9.6] · look [0,3.2,3.4] | 46 | juru (-0.2), y 2,3, z 3,4, s1,15 |

---

## 3. Panggung I — interior (kelas & ruang peta)

Kelas: ruang 18 × 7 × 14 (x ±9, z ±7), lantai **y 0**; papan tulis 9,2 × 3,4 di z -6,75 (y 2,3…5,7), huruf 19 px (muat FOV portrait); meja guru (0,0,-4,2); **bangku murid hanya satu baris di z 0,4** (baris z 3,0 dibuang: menghalangi kaki bila kamera di z > 1).

| Shot | pos → look | fov | Karakter |
|---|---|---|---|
| kelas_wide | [0.5,3.2,5.9]→[0.4,3.1,4.9] · look [0,2.55,-4.6] | 46 | guru (-1.0) & murid (0.95) di z -2,8, y 0 |
| kelas_close | [0.35,1.62,1.9]→[0.3,1.58,1.3] · look [0.2,1.30,-4.6] | 44 | murid (0.85, z -3,2, s0,78) |

Ruang peta (offset x +60 di panggung yang sama): ruang 16 × 6 × 13 (z ±6,5), lantai y 0; **meja peta (x 60, atas y 1,97, z -1,4) 7,2 × 3,6**; kursi x 60 ± 5,2; lilin di atas meja.

| Shot | pos → look | fov | Karakter |
|---|---|---|---|
| peta_wide | [61,2.8,5.4]→[60.6,2.65,4.4] · look [60,2.45,**-3.0**] | 48 | gubernur (59.05) & juru (60.95) di **z -3,0** (di depan meja, bukan di dalamnya) |
| peta_close | [60.2,1.63,3.1]→[60.1,1.58,2.5] · look [60,1.48,**0.4**] | 38 | gubernur (60, z 0,4) — **di depan meja** |

---

## 4. Aturan tetap (dari playbook 14)

1. Karakter = kartu datar; `person()` hanya MENGANTRE, dijalankan setelah `cam.lookAt()` dan `CAMP.copy()`.
2. Jangan pernah mengatur `rotation.y` kartu manual.
3. FOV portrait sempit: medium (fov 46) hanya menampilkan ±1,0 unit pada jarak 5 dan ±2,0 unit pada jarak 7 → karakter di |x| ≤ 1,0, kamera z 7…9.
4. Karakter tidak boleh berdiri di dalam mesh (meja, peti, tiang): periksa `y` terhadap permukaan dan `z` terhadap benda di antaranya.
5. Setiap sudut frame diperiksa pada still: subjek terlihat penuh, wajah terbaca, tidak teriris, tidak tertutup, tidak hitam.
