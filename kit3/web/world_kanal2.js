// Panggung KANAL (Belanda) — tata letak RAPI (menggantikan versi yang menaruh prop di dalam air):
//   air kanal  : x -9,5 .. +9,5, permukaan y 0,05
//   tepi kanal : x ±10,6 (lebar 2,2) -> atas y 2,3 ; muka dalam x ±9,5
//   jalan batu : x ±(11,7 .. 33), atas y 2,3  (SELEVEL dengan tepi kanal)
//   jembatan   : dek rata, atas y 2,3 (sama dengan jalan) supaya karakter berdiri pas
//   SEMUA prop (peti, tong, kereta, lampu, kincir, rumah) berdiri di y 2,3 — BUKAN di air.
import * as THREE from "three";
import { cvTex, mkMat, addM } from "./world.js";
const R = (s) => { let x = s * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
export const Y_JALAN = 2.3;   // permukaan jalan/tepi kanal (level acuan semua prop & karakter)

const airKanal = cvTex("airK", 512, 512, (g, w, h) => {
  g.fillStyle = "#3f5f57"; g.fillRect(0, 0, w, h); const r = R(17);
  for (let i = 0; i < 80; i++) { const x = r() * w, y = r() * h, l = 30 + r() * 60;
    g.strokeStyle = i % 3 ? "#5d8277" : "#2c4740"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); }
}, 20, 26);
const bataTex = cvTex("bataK", 256, 256, (g, w, h) => {
  g.fillStyle = "#8a5f4a"; g.fillRect(0, 0, w, h); const r = R(7); const rows = 8;
  for (let y = 0; y < rows; y++) { const yy = (y * h) / rows; let x = (y % 2) * 22;
    while (x < w) { const bw = 34 + r() * 18; g.fillStyle = `rgb(${130 + r() * 40 | 0},${86 + r() * 26 | 0},${64 + r() * 20 | 0})`; g.fillRect(x + 2, yy + 2, bw - 3, h / rows - 3); x += bw; } }
  g.strokeStyle = "#4e3426"; g.lineWidth = 3; for (let y = 0; y <= rows; y++) { g.beginPath(); g.moveTo(0, (y * h) / rows); g.lineTo(w, (y * h) / rows); g.stroke(); }
}, 3, 4);
const jendelaTex = cvTex("jendelaK", 256, 256, (g, w, h) => {
  g.fillStyle = "#2f4a5e"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#7fb8d8"; for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) g.fillRect(20 + i * 118, 22 + j * 76, 96, 56);
  g.strokeStyle = "#f2efe6"; g.lineWidth = 6; for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) g.strokeRect(20 + i * 118, 22 + j * 76, 96, 56);
  g.strokeStyle = "#3a2f28"; g.lineWidth = 10; g.strokeRect(4, 4, w - 8, h - 8);
});
const batuJalan = cvTex("batuJ", 256, 256, (g, w, h) => {
  g.fillStyle = "#7d7a72"; g.fillRect(0, 0, w, h); const r = R(23);
  for (let i = 0; i < 80; i++) { g.fillStyle = r() > 0.5 ? "#6d6a62" : "#8d8a80"; g.beginPath(); g.ellipse(r() * w, r() * h, 16 + r() * 20, 10 + r() * 14, 0, 0, 7); g.fill(); }
}, 6, 3);

const rumahKanal = (par, x, z, w, h, warna, ry = 0) => {   // berdiri di atas jalan (y = Y_JALAN)
  const g = new THREE.Group(); g.position.set(x, Y_JALAN, z); g.rotation.y = ry; par.add(g);
  addM(g, box(w, h, 4.4), mkMat(bataTex), [0, h / 2, 0], { ink: 0.035 });
  addM(g, box(w * 0.92, h * 0.62, 0.16), mkMat(jendelaTex), [0, h * 0.56, 2.28], { ink: 0.02 });
  addM(g, box(w * 0.3, h * 0.2, 0.14), mkMat(0x4a3020), [0, h * 0.11, 2.3], { ink: 0.02 });
  const tri = new THREE.Shape(); tri.moveTo(-w / 2 - 0.1, 0); tri.lineTo(w / 2 + 0.1, 0); tri.lineTo(0, w * 0.55); tri.lineTo(-w / 2 - 0.1, 0);
  const tg = new THREE.ExtrudeGeometry(tri, { depth: 4.6, bevelEnabled: false }); tg.translate(0, 0, -2.3);
  addM(g, tg, mkMat(warna), [0, h, 0], { ink: 0.04 });
  addM(g, box(w * 0.16, w * 0.16, 0.2), mkMat(0xf2efe6), [0, h + w * 0.5, 2.36], { ink: 0.02 });
  return g;
};

export const buildKanal = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {}; const r = R(31);
  o.air = addM(g, new THREE.PlaneGeometry(19, 120), mkMat(airKanal), [0, 0.05, -10], { rot: [-Math.PI / 2, 0, 0], ink: false });
  for (const sx of [-1, 1]) {
    addM(g, box(2.2, 2.3, 120), mkMat(bataTex), [sx * 10.6, 1.15, -10], { ink: 0.03 });
    addM(g, box(21, 0.4, 120), mkMat(batuJalan), [sx * 22, 2.1, -10], { ink: 0.02 });
    addM(g, box(0.5, 0.28, 120), mkMat(batuJalan), [sx * 9.75, Y_JALAN - 0.06, -10], { ink: 0.02 });
  }
  const warnas = [0x6b3f30, 0x2f4a44, 0x7a5a34, 0x503a4a, 0x8a4a34, 0x3a4a60];
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) {
    const z = 20 - i * 8.5, w = 5.6 + r() * 1.4, h = 6.5 + r() * 4.0;   // tinggi 6,5-10,5: atap pelana ikut masuk bingkai dari jalan
    rumahKanal(g, sx * (12.6 + r() * 1.4), z, w, h, warnas[(i + (sx > 0 ? 3 : 0)) % 6], sx > 0 ? 0 : Math.PI);
  }
  const jb = new THREE.Group(); jb.position.set(0, 0, 2); g.add(jb);
  addM(jb, box(21, 0.34, 3.6), mkMat(bataTex), [0, Y_JALAN - 0.17, 0], { ink: 0.03 });
  addM(jb, box(21, 0.16, 3.6), mkMat(batuJalan), [0, Y_JALAN - 0.08, 0], { ink: false });
  for (const sz of [-1, 1]) {
    for (let i = -3; i <= 3; i++) addM(jb, box(0.18, 0.9, 0.18), mkMat(0x3a2f28), [i * 3.0, Y_JALAN + 0.45, sz * 1.65], { ink: 0.02 });
    addM(jb, box(19, 0.14, 0.14), mkMat(0x3a2f28), [0, Y_JALAN + 0.9, sz * 1.65], { ink: 0.02 });
  }
  for (const sx of [-1, 1]) addM(jb, box(1.6, 2.4, 3.6), mkMat(bataTex), [sx * 10.2, 1.1, 0], { ink: 0.03 });
  const km = new THREE.Group(); km.position.set(-24, Y_JALAN, -26); g.add(km);
  addM(km, cyl(2.4, 3.2, 9, 10), mkMat(bataTex), [0, 4.5, 0], { ink: 0.04 });
  addM(km, new THREE.ConeGeometry(3.4, 2.6, 10), mkMat(0x4a3a30), [0, 10.3, 0], { ink: 0.035 });
  o.blades = new THREE.Group(); o.blades.position.set(0, 8.4, 3.4); km.add(o.blades);
  for (let i = 0; i < 4; i++) addM(o.blades, box(1.0, 7.4, 0.22), mkMat(0xd8cba8), [0, 0, 0], { rot: [0, 0, (i * Math.PI) / 2], ink: 0.03 });
  addM(o.blades, cyl(0.4, 0.4, 0.5, 8), mkMat(0x4a3020), [0, 0, 0.2], { rot: [Math.PI / 2, 0, 0], ink: 0.02 });
  // peti tulip TERBUKA di tepi kanal barat (x -12,4): dinding 4 sisi, tulip tumbuh dari DALAM peti
  o.krat = [];
  // peti di BIBIR KANAL (x -10,6; bibir kanal = x 9,5…11,7) supaya kamera dari sisi kanal
  // melihat: air di depan, peti di bibir, rumah di belakang — bukan dinding bata memenuhi layar.
  for (let i = 0; i < 4; i++) {
    const kz = 8.2 - i * 1.45;
    const k = new THREE.Group(); k.position.set(-10.6, Y_JALAN, kz); g.add(k);
    addM(k, box(1.3, 0.12, 1.3), mkMat(0x9a7448), [0, 0.06, 0], { ink: 0.03 });
    for (const sx of [-1, 1]) addM(k, box(0.12, 0.62, 1.3), mkMat(0xb08a5a), [sx * 0.59, 0.31, 0], { ink: 0.025 });
    for (const sz of [-1, 1]) addM(k, box(1.3, 0.62, 0.12), mkMat(0xb08a5a), [0, 0.31, sz * 0.59], { ink: 0.025 });
    for (let j = 0; j < 4; j++) { const bx = -0.36 + (j % 2) * 0.72, bz = -0.34 + Math.floor(j / 2) * 0.68;
      addM(k, cyl(0.045, 0.045, 0.5, 6), mkMat(0x3f7a34), [bx, 0.36, bz], { ink: 0.012 });
      const kn = addM(k, new THREE.SphereGeometry(0.15, 8, 6), mkMat(j % 2 ? 0xd5343b : 0xe8c45a), [bx, 0.78, bz], { ink: 0.018 });
      kn.scale.set(1, 1.25, 1);
      addM(k, new THREE.SphereGeometry(0.09, 6, 5), mkMat(j % 2 ? 0xb02a30 : 0xc9a63a), [bx - 0.1, 0.72, bz + 0.06], { ink: 0.012 });
      addM(k, new THREE.SphereGeometry(0.09, 6, 5), mkMat(j % 2 ? 0xb02a30 : 0xc9a63a), [bx + 0.1, 0.72, bz - 0.06], { ink: 0.012 }); }
    o.krat.push(k);
  }
  for (let i = 0; i < 3; i++) addM(g, cyl(0.5, 0.5, 1.1, 10), mkMat(0x8a5a32), [19.0, Y_JALAN + 0.55, 4.4 - i * 1.4], { ink: 0.03 });
  addM(g, box(3.2, 0.16, 1.4), mkMat(0x6b4a2c), [19.4, Y_JALAN + 0.62, 8.6], { ink: 0.03 });
  for (const sx of [-1, 1]) addM(g, cyl(0.5, 0.5, 0.16, 10), mkMat(0x4a3426), [19.4 + sx * 1.3, Y_JALAN + 0.5, 8.6], { rot: [Math.PI / 2, 0, 0], ink: 0.02 });
  for (const [x, z] of [[-30, 8], [30, 0], [-30, -8]]) {
    addM(g, cyl(0.09, 0.12, 4.6, 8), mkMat(0x2f3338), [x, Y_JALAN + 2.3, z], { ink: 0.02 });
    addM(g, box(0.5, 0.6, 0.5), new THREE.MeshBasicMaterial({ color: 0xffd88a }), [x, Y_JALAN + 4.4, z], { ink: 0.02 });
  }
  o.g = g; o.yJalan = Y_JALAN; return o;
};
