// Panggung INTERIOR (ruang kelas Belanda + ruang peta) — aset BARU.
// Aturan playbook 4b.2: kamera WAJIB di dalam kotak (dinding BackSide), kalau di luar = hitam.
import * as THREE from "three";
import { cvTex, mkMat, addM } from "./world.js";
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
const BACK = (c) => new THREE.MeshToonMaterial({ color: c, side: THREE.BackSide, gradientMap: mkMat(0xffffff).gradientMap });

const lantaiTex = cvTex("lantaiK", 256, 256, (g, w, h) => {
  const c = ["#b98a56", "#c4965f", "#a87c4a", "#ba8c54"];
  for (let i = 0; i < 8; i++) { g.fillStyle = c[i % 4]; g.fillRect((i * w) / 8, 0, w / 8, h); g.fillStyle = "#6b4526"; g.fillRect((i * w) / 8, 0, 3, h); }
}, 6, 4);
const dindingTex = cvTex("dindingK", 256, 256, (g, w, h) => {
  g.fillStyle = "#cbb99a"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#b8a488"; for (let i = 0; i < 24; i++) g.fillRect((i * 53) % w, (i * 91) % h, 22, 12);
  g.fillStyle = "#6b5a44"; g.fillRect(0, h - 26, w, 26);
}, 4, 2);
const papanTulisTex = (tulisan) => cvTex("papanT" + tulisan, 512, 256, (g, w, h) => {
  g.fillStyle = "#6b4a2c"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#2f3f3a"; g.fillRect(12, 12, w - 24, h - 24);
  g.strokeStyle = "#e8e6dc"; g.lineWidth = 3; g.strokeRect(12, 12, w - 24, h - 24);
  g.fillStyle = "#e8e6dc"; g.font = "bold 19px 'DejaVu Sans', sans-serif"; g.textAlign = "center";
  g.fillText(tulisan, w / 2, h / 2 + 4);
  g.strokeStyle = "#cfcdc4"; g.lineWidth = 3; g.lineCap = "round";
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(60, 190 + i * 16); for (let k = 0; k < 7; k++) g.lineTo(60 + (k + 1) * 56, 190 + i * 16 + (k % 2 ? 5 : -5)); g.stroke(); }
});
const petaTex = cvTex("petaK", 512, 384, (g, w, h) => {
  g.fillStyle = "#d8c39a"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#8a7a5a"; g.lineWidth = 3;
  for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(0, i * 48); g.lineTo(w, i * 48); g.stroke(); }
  for (let i = 0; i < 11; i++) { g.beginPath(); g.moveTo(i * 48, 0); g.lineTo(i * 48, h); g.stroke(); }
  g.fillStyle = "#7a9a6a"; // kepulauan
  for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(70 + (i * 79) % 380, 90 + (i * 61) % 220, 22 + (i % 4) * 12, 9 + (i % 3) * 7, i * 0.4, 0, 7); g.fill(); }
  g.strokeStyle = "#a83a3a"; g.lineWidth = 4; g.setLineDash([9, 7]);
  g.beginPath(); g.moveTo(60, 300); g.quadraticCurveTo(240, 150, 430, 90); g.stroke(); g.setLineDash([]);
  g.fillStyle = "#8a4a2a"; g.beginPath(); g.arc(430, 300, 34, 0, 7); g.fill();
  g.fillStyle = "#f0e2bd"; g.beginPath(); g.moveTo(430, 268); g.lineTo(440, 300); g.lineTo(430, 332); g.lineTo(420, 300); g.closePath(); g.fill();
});

export const buildKelas = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {};
  addM(g, box(18, 7, 14), BACK(0xcbb99a), [0, 3.4, 0], { ink: false });
  addM(g, box(17.8, 0.2, 13.8), mkMat(lantaiTex), [0, 0, 0], { ink: 0.02 });
  addM(g, box(17.8, 7, 0.2), mkMat(dindingTex), [0, 3.4, -6.9], { ink: false });
  addM(g, box(0.2, 7, 13.8), mkMat(dindingTex), [-8.9, 3.4, 0], { ink: false });
  addM(g, box(0.2, 7, 13.8), mkMat(dindingTex), [8.9, 3.4, 0], { ink: false });
  // papan tulis di dinding belakang
  addM(g, box(9.2, 3.4, 0.16), mkMat(papanTulisTex("BAHASA INDONESIA")), [0, 4.0, -6.75], { ink: 0.03 });
  addM(g, box(7.9, 0.22, 0.24), mkMat(0x6b4a2c), [0, 2.0, -6.72], { ink: 0.02 });
  // jendela tinggi (cahaya masuk)
  for (let i = -1; i <= 1; i++) {
    addM(g, box(0.16, 3.2, 2.4), mkMat(0x7fb8d8), [-8.78, 4.2, i * 3.6], { ink: 0.03 });
    addM(g, box(0.1, 0.16, 2.6), mkMat(0xf2efe6), [-8.7, 5.9, i * 3.6], { ink: 0.02 });
    addM(g, box(0.1, 0.16, 2.6), mkMat(0xf2efe6), [-8.7, 2.5, i * 3.6], { ink: 0.02 });
  }
  // meja guru + bangku murid
  o.meja = new THREE.Group(); o.meja.position.set(0, 0, -4.2); g.add(o.meja);
  addM(o.meja, box(4.0, 0.2, 1.5), mkMat(0x9a7448), [0, 1.9, 0], { ink: 0.03 });
  for (const sx of [-1, 1]) addM(o.meja, box(0.2, 1.9, 1.3), mkMat(0x7a5638), [sx * 1.8, 0.95, 0], { ink: 0.02 });
  addM(o.meja, box(1.0, 0.1, 0.7), mkMat(0xf2efe6), [0.7, 2.06, 0.2], { rot: [0, 0.2, 0], ink: 0.02 });
  o.bangku = [];
  for (let i = 0; i < 3; i++) {   // HANYA satu baris (di z 0,4): baris z 3,0 menghalangi kaki karakter dari kamera
    const bx = -4.6 + (i % 3) * 4.6, bz = 0.4;
    const b = new THREE.Group(); b.position.set(bx, 0, bz); g.add(b);
    addM(b, box(2.6, 0.16, 0.8), mkMat(0x9a7448), [0, 1.15, 0], { ink: 0.03 });
    for (const sx of [-1, 1]) addM(b, box(0.16, 1.15, 0.7), mkMat(0x7a5638), [sx * 1.1, 0.58, 0.15], { ink: 0.02 });
    addM(b, box(1.6, 0.14, 0.4), mkMat(0x9a7448), [0, 0.72, -0.55], { ink: 0.025 });
    o.bangku.push(b);
  }
  o.g = g; return o;
};

export const buildPeta = (par, ox = 60) => {
  const g = new THREE.Group(); g.position.set(ox, 0, 0); par.add(g); const o = {};
  addM(g, box(16, 6, 13), BACK(0x5a4436), [0, 3, 0], { ink: false });
  addM(g, box(15.8, 0.2, 12.8), mkMat(lantaiTex), [0, 0, 0], { ink: 0.02 });
  addM(g, box(15.8, 6, 0.2), mkMat(0x6b5240), [0, 3, -6.4], { ink: false });
  for (const sx of [-1, 1]) addM(g, box(0.2, 6, 12.8), mkMat(0x6b5240), [sx * 7.9, 3, 0], { ink: false });
  // meja peta panjang + peta tergelar
  o.meja = new THREE.Group(); o.meja.position.set(0, 0, -3.4); g.add(o.meja);   // di BELAKANG karakter (kalau di depan, meja menutupi mereka)
  addM(o.meja, box(7.2, 0.24, 3.6), mkMat(0x8a6a44), [0, 1.85, 0], { ink: 0.03 });
  addM(o.meja, box(6.8, 0.1, 3.2), mkMat(petaTex), [0, 2.0, 0], { ink: 0.02 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addM(o.meja, box(0.22, 1.85, 0.22), mkMat(0x6b4a2c), [sx * 3.2, 0.92, sz * 1.4], { ink: 0.02 });
  // lilin (menyala)
  o.lilin = [];
  for (const [x, z] of [[-2.6, 1.2], [2.4, 1.3], [-3.0, -1.2]]) {
    addM(g, cyl(0.26, 0.3, 0.5, 8), mkMat(0x8a7a5a), [x, 2.2, z - 3.4], { ink: 0.02 });
    addM(g, cyl(0.09, 0.09, 0.7, 6), mkMat(0xf2e6c8), [x, 2.75, z - 3.4], { ink: 0.015 });
    const f = addM(g, new THREE.ConeGeometry(0.11, 0.3, 6), new THREE.MeshBasicMaterial({ color: 0xffcf6a }), [x, 3.24, z - 3.4], { ink: false });
    o.lilin.push(f);
  }
  // kursi kayu berukir di sisi meja
  for (const sx of [-1, 1]) {
    const c = new THREE.Group(); c.position.set(sx * 5.2, 0, -3.0); c.rotation.y = sx > 0 ? -0.6 : 0.6; g.add(c);
    addM(c, box(1.5, 0.18, 1.5), mkMat(0x7a5638), [0, 1.7, 0], { ink: 0.03 });
    addM(c, box(0.16, 2.6, 1.5), mkMat(0x6b4a2c), [sx * 0.7, 2.9, 0], { ink: 0.03 });
    for (const a of [-1, 1]) for (const b of [-1, 1]) addM(c, box(0.14, 1.7, 0.14), mkMat(0x6b4a2c), [a * 0.6, 0.85, b * 0.6], { ink: 0.02 });
  }
  // kain panji tergantung di dinding
  for (const sx of [-1, 1]) {
    addM(g, cyl(0.06, 0.06, 3.6, 6), mkMat(0x6b4a2c), [sx * 6.0, 4.4, -6.2], { rot: [0, 0, Math.PI / 2], ink: 0.015 });
    addM(g, box(3.4, 2.0, 0.1), mkMat(sx > 0 ? 0xd5343b : 0x2f4a7a), [sx * 6.0, 3.3, -6.18], { ink: 0.03 });
  }
  // rak gulungan peta
  for (let i = 0; i < 10; i++) addM(g, cyl(0.13, 0.13, 1.9, 6), mkMat(0xd8c39a), [-6.6 + (i % 5) * 0.34, 4.9, -6.1 + Math.floor(i / 5) * 0.34], { rot: [Math.PI / 2, 0, 0], ink: 0.02 });
  addM(g, box(2.4, 0.12, 0.9), mkMat(0x6b4a2c), [-6.0, 3.95, -6.1], { ink: 0.02 });
  o.g = g; return o;
};
