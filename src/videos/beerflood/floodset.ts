// Set London 1814: halaman pabrik Meux & Co (Horse Shoe), tong porter raksasa 22 kaki,
// dinding belakang 25 kaki yang bisa pecah, gang New Street, rumah petak, gerobak dan barrel.
//
// Geometri sengaja RINGAN: satu tong (silinder + hoop), beberapa kotak, dan rumah petak dari
// `house()` yang sudah ada. Biaya render pipeline ini ditentukan jumlah segitiga (terukur:
// scene jembatan 1,24 juta segitiga = 57 s/frame; kubus = 1,4 s/frame), jadi set ini dijaga kecil.
import * as THREE from "three";
import { Batch, V, boxGeo, house, lam, Kit } from "./build";
import { cobble, planksHD, brick, rep } from "./paint";

export const VAT_H = 6.7;      // 22 kaki
export const VAT_R = 3.35;
export const WALL_H = 7.6;     // 25 kaki, tebal 2,5 bata
export const WALL_T = 0.55;
export const STREET_W = 7.0;

const mat = {
  cobble: () => lam("floodCobble", () => ({ map: rep(cobble(), 14, 14), color: "#c9c2b4" })),
  plank: () => lam("floodPlank", () => ({ map: rep(planksHD(), 6, 3) })),
  brick: () => lam("floodBrick", () => ({ map: rep(brick(), 8, 4), color: "#b98d75" })),
  iron: () => lam("floodIron", () => ({ color: "#4a4a4e" })),
  stone: () => lam("floodStone", () => ({ color: "#bdb3a4" })),
  wood: () => lam("floodWood", () => ({ color: "#8a5f3d" })),
  dark: () => lam("floodDark", () => ({ color: "#2c2622" })),
};

export type FloodSet = {
  root: THREE.Group;
  /** bagian dinding yang jatuh saat tong pecah (di-hide/geser oleh animasi) */
  wallBreak: THREE.Object3D;
  /** pelat air/gelombang gelap yang menyapu jalan */
  wave: THREE.Mesh;
};

/** Bangun seluruh set. Semua objek statis digabung jadi satu mesh per material oleh Batch. */
export const buildFloodSet = (kit: Kit): FloodSet => {
  const root = new THREE.Group();
  const b = new Batch();

  // ---------- tanah halaman + gang ----------
  b.add(boxGeo(V(-30, -0.4, -30), V(30, 0, 30), 2), mat.cobble());
  // trotoar tipis di depan rumah petak (sisi timur gang)
  b.add(boxGeo(V(STREET_W / 2, 0, -26), V(STREET_W / 2 + 1.6, 0.22, 14), 1), mat.stone());

  // ---------- tong porter raksasa (hero) ----------
  const vatGeo = new THREE.CylinderGeometry(VAT_R, VAT_R * 1.04, VAT_H, 28, 1, true);
  b.add(vatGeo, mat.plank(), new THREE.Matrix4().makeTranslation(0, VAT_H / 2, 0));
  // tutup atas + dasar
  b.add(new THREE.CylinderGeometry(VAT_R * 1.04, VAT_R * 1.04, 0.25, 28), mat.wood(), new THREE.Matrix4().makeTranslation(0, VAT_H, 0));
  b.add(new THREE.CylinderGeometry(VAT_R * 1.06, VAT_R * 1.06, 0.3, 28), mat.stone(), new THREE.Matrix4().makeTranslation(0, 0.15, 0));
  // 8 gelang besi (700 pon masing-masing = 0,28 m tebal visual)
  for (let i = 0; i < 8; i++) {
    const y = 0.55 + i * ((VAT_H - 1.0) / 7);
    b.add(new THREE.CylinderGeometry(VAT_R + 0.09, VAT_R + 0.09, 0.26, 28, 1, true), mat.iron(),
      new THREE.Matrix4().makeTranslation(0, y, 0));
  }

  // ---------- perancah/platform di sisi tong (tempat Crick dan memonya) ----------
  b.add(boxGeo(V(-VAT_R - 2.6, VAT_H - 2.3, -1.5), V(-VAT_R - 0.6, VAT_H - 2.1, 2.6), 1), mat.plank());
  for (const z of [-1.4, 0.5, 2.4]) {
    b.add(boxGeo(V(-VAT_R - 2.5, 0, z), V(-VAT_R - 2.3, VAT_H - 2.2, z + 0.2), 1), mat.wood());
  }
  // tangga naik ke platform
  for (let i = 0; i < 7; i++) {
    b.add(boxGeo(V(-VAT_R - 4.2, i * 0.62, 4.0 - i * 0.5), V(-VAT_R - 3.0, i * 0.62 + 0.12, 4.4 - i * 0.5), 1), mat.plank());
  }

  // ---------- dinding belakang pabrik (25 kaki, 2,5 bata) ----------
  b.add(boxGeo(V(-14, 0, -VAT_R - 4.6), V(14, WALL_H, -VAT_R - 4.6 + WALL_T), 3), mat.brick());
  // bagian yang pecah: dua sayap + sepotong di atas tungku, jadi animasi bisa menjatuhkannya
  const wallBreak = new THREE.Group();
  {
    const bb = new Batch();
    bb.add(boxGeo(V(-1.9, 0, -VAT_R - 4.55), V(1.9, WALL_H - 1.2, -VAT_R - 4.55 + WALL_T - 0.02), 3), mat.brick());
    bb.build(wallBreak);
  }
  root.add(wallBreak);

  // ---------- rumah petak di sisi gang (rumah petak St Giles) ----------
  for (let i = 0; i < 5; i++) {
    house(b, STREET_W / 2 + 1.7, -22 + i * 9.5, Math.PI / 2, 6.2, 8.4, 9.4, i % 4, 0);
  }
  // sisi barat gang, sedikit lebih jauh
  for (let i = 0; i < 3; i++) {
    house(b, -STREET_W / 2 - 6.4, -14 + i * 10.5, -Math.PI / 2, 6.0, 8.0, 8.4, (i + 2) % 4, 0);
  }

  // ---------- barrel, gerobak, tiang lampu ----------
  for (let i = 0; i < 9; i++) {
    const x = 7.4 + (i % 3) * 1.15, z = -3.0 + Math.floor(i / 3) * 1.2;
    b.add(new THREE.CylinderGeometry(0.52, 0.48, 1.15, 12), mat.wood(), new THREE.Matrix4().makeTranslation(x, 0.58, z));
  }
  b.add(boxGeo(V(9.6, 0.55, 3.4), V(13.4, 0.85, 4.9), 1), mat.plank());          // badan gerobak
  b.add(new THREE.CylinderGeometry(0.62, 0.62, 0.18, 14), mat.dark(),
    new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(10.4, 0.62, 3.2));  // roda
  b.add(new THREE.CylinderGeometry(0.62, 0.62, 0.18, 14), mat.dark(),
    new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(12.9, 0.62, 5.1));
  b.add(boxGeo(V(-1.1, 0, 9.4), V(-0.9, 4.2, 9.6), 1), mat.iron());            // tiang lampu
  b.add(boxGeo(V(-1.4, 4.2, 9.1), V(-0.6, 4.9, 9.9), 1), mat.dark());

  b.build(root, true);

  // ---------- gelombang porter (mesh terpisah, dianimasikan) ----------
  const waveGeo = new THREE.PlaneGeometry(90, 26, 1, 1);
  waveGeo.rotateX(-Math.PI / 2);
  const wave = new THREE.Mesh(waveGeo, lam("floodWave", () => ({ color: "#241a14", transparent: true, opacity: 0.9 })));
  wave.position.set(0, 0.18, 16);
  wave.visible = false;
  root.add(wave);

  // propt Kenney (kalau ada) diabaikan: paketnya tidak ada di repo, set ini murni prosedural
  void kit;

  return { root, wallBreak, wave };
};
