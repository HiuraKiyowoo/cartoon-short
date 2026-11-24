// Panggung KANAL (kota Belanda: kanal, rumah bata berpelana, jembatan, kincir) — aset BARU.
import * as THREE from "three";
import { cvTex, mkMat, addM } from "./world.js";
const R = (s) => { let x = s * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);

const airKanal = cvTex("airK", 512, 512, (g, w, h) => {
  g.fillStyle = "#3f5f57"; g.fillRect(0, 0, w, h); const r = R(17);
  for (let i = 0; i < 80; i++) { const x = r() * w, y = r() * h, l = 30 + r() * 60;
    g.strokeStyle = i % 3 ? "#5d8277" : "#2c4740"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); }
}, 26, 26);
const bataTex = cvTex("bataK", 256, 256, (g, w, h) => {
  const base = "#8a5f4a"; g.fillStyle = base; g.fillRect(0, 0, w, h); const r = R(7); const rows = 8;
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

// satu rumah kanal: badan sempit tinggi + atap pelana + tangga gable
const rumahKanal = (par, x, z, w, h, warna, ry = 0) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; par.add(g);
  addM(g, box(w, h, 4.4), mkMat(bataTex), [0, h / 2, 0], { ink: 0.035 });
  addM(g, box(w * 0.92, h * 0.62, 0.16), mkMat(jendelaTex), [0, h * 0.56, 2.28], { ink: 0.02 });
  addM(g, box(w * 0.3, h * 0.2, 0.14), mkMat(0x4a3020), [0, h * 0.11, 2.3], { ink: 0.02 });
  // pelana segitiga
  const tri = new THREE.Shape(); tri.moveTo(-w / 2 - 0.1, 0); tri.lineTo(w / 2 + 0.1, 0); tri.lineTo(0, w * 0.55); tri.lineTo(-w / 2 - 0.1, 0);
  const tg = new THREE.ExtrudeGeometry(tri, { depth: 4.6, bevelEnabled: false }); tg.translate(0, 0, -2.3);
  addM(g, tg, mkMat(warna), [0, h, 0], { ink: 0.04 });
  addM(g, box(w * 0.16, w * 0.16, 0.2), mkMat(0xf2efe6), [0, h + w * 0.5, 2.36], { ink: 0.02 });
  return g;
};

export const buildKanal = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {}; const r = R(31);
  // air kanal
  o.air = addM(g, new THREE.PlaneGeometry(60, 120), mkMat(airKanal), [0, 0.05, -10], { rot: [-Math.PI / 2, 0, 0], ink: false });
  // tepi batu + jalan
  for (const sx of [-1, 1]) {
    addM(g, box(2.2, 2.0, 120), mkMat(bataTex), [sx * 11.1, 1.0, -10], { ink: 0.03 });
    addM(g, box(2.6, 0.26, 120), mkMat(batuJalan), [sx * 11.1, 2.1, -10], { ink: 0.02 });
    addM(g, box(16, 0.3, 120), mkMat(batuJalan), [sx * 22, 0.15, -10], { ink: false });
  }
  // baris rumah kanal (dua sisi, tinggi & warna beda-beda)
  const warnas = [0x6b3f30, 0x2f4a44, 0x7a5a34, 0x503a4a, 0x8a4a34, 0x3a4a60];
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) {
    const z = 22 - i * 8.5, w = 5.6 + r() * 1.4, h = 11 + r() * 7;
    rumahKanal(g, sx * (15.5 + r() * 1.6), z, w, h, warnas[(i + (sx > 0 ? 3 : 0)) % 6], sx > 0 ? 0 : Math.PI);
  }
  // jembatan lengkung
  const jb = new THREE.Group(); jb.position.set(0, 0, 2); g.add(jb);
  for (let i = -4; i <= 4; i++) { const t = i / 4, y = 2.3 - Math.abs(t) * 1.1; addM(jb, box(3.4, 0.32, 1.6), mkMat(bataTex), [i * 3.1, y, 0], { ink: 0.03 }); }
  for (const sz of [-1, 1]) for (let i = -4; i <= 4; i++) { const t = i / 4, y = 2.3 - Math.abs(t) * 1.1;
    addM(jb, box(0.16, 1.0, 0.16), mkMat(0x3a2f28), [i * 3.1, y + 0.65, sz * 0.85], { ink: 0.02 }); }
  for (const sz of [-1, 1]) addM(jb, box(28, 0.13, 0.13), mkMat(0x3a2f28), [0, 3.35, sz * 0.85], { ink: 0.02 });
  // kincir angin (latar)
  const km = new THREE.Group(); km.position.set(-30, 0, -28); g.add(km);
  addM(km, cyl(2.4, 3.2, 9, 10), mkMat(bataTex), [0, 4.5, 0], { ink: 0.04 });
  addM(km, new THREE.ConeGeometry(3.4, 2.6, 10), mkMat(0x4a3a30), [0, 10.3, 0], { ink: 0.035 });
  o.blades = new THREE.Group(); o.blades.position.set(0, 8.4, 3.4); km.add(o.blades);
  for (let i = 0; i < 4; i++) addM(o.blades, box(1.0, 7.4, 0.22), mkMat(0xd8cba8), [0, 0, 0], { rot: [0, 0, (i * Math.PI) / 2], ink: 0.03 });
  addM(o.blades, cyl(0.4, 0.4, 0.5, 8), mkMat(0x4a3020), [0, 0, 0.2], { rot: [Math.PI / 2, 0, 0], ink: 0.02 });
  // peti tulip + tong + kereta tangan di tepi kanal
  o.krat = [];
  for (let i = 0; i < 6; i++) { const k = new THREE.Group(); k.position.set(-9.4 + (i % 3) * 1.25, 0.3, 6 - Math.floor(i / 3) * 1.4); g.add(k);
    addM(k, box(1.1, 0.6, 1.15), mkMat(0xb08a5a), [0, 0.3, 0], { ink: 0.03 });
    for (let j = 0; j < 4; j++) { const bx = -0.42 + (j % 2) * 0.84, bz = -0.4 + Math.floor(j / 2) * 0.8;
      addM(k, cyl(0.05, 0.05, 0.42, 6), mkMat(0x3f7a34), [bx, 0.8, bz], { ink: 0.015 });
      addM(k, new THREE.ConeGeometry(0.15, 0.24, 6), mkMat(j % 2 ? 0xd5343b : 0xe8c45a), [bx, 1.12, bz], { ink: 0.02 }); }
    o.krat.push(k); }
  for (let i = 0; i < 3; i++) addM(g, cyl(0.5, 0.5, 1.1, 10), mkMat(0x8a5a32), [8.6, 0.55, 5 - i * 1.4], { ink: 0.03 });
  addM(g, box(3.2, 0.16, 1.4), mkMat(0x6b4a2c), [-8.2, 0.62, 9.4], { ink: 0.03 });
  for (const sx of [-1, 1]) addM(g, cyl(0.5, 0.5, 0.16, 10), mkMat(0x4a3426), [-8.2 + sx * 1.3, 0.5, 9.4], { rot: [Math.PI / 2, 0, 0], ink: 0.02 });
  // tiang lampu jalan
  for (const [x, z] of [[-10.6, 10], [10.6, 4], [-10.6, -2]]) {
    addM(g, cyl(0.09, 0.12, 4.6, 8), mkMat(0x2f3338), [x, 2.3, z], { ink: 0.02 });
    addM(g, box(0.5, 0.6, 0.5), new THREE.MeshBasicMaterial({ color: 0xffd88a }), [x, 4.7, z], { ink: 0.02 });
  }
  o.g = g; return o;
};
