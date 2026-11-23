// Set khusus cerita Belanda: ruang kelas (papan tulis) dan ruang peta gelap.
// Gaya mengikuti modul lain: primitif + tekstur canvas, garis tinta via `addM`, densitas `T()`.
import * as THREE from "three";
import { cvTex, mkMat, addM, T } from "./world.js";

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);

/** Papan tulis dengan teks diegetik. Teks harus terbaca, tidak tercermin. */
const papanTex = (teks) =>
  cvTex("papan" + teks, 512, 256, (g, w, h) => {
    g.fillStyle = "#2f3b33"; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,.06)";
    for (let i = 0; i < 90; i++) g.fillRect((i * 53) % w, (i * 97) % h, 2, 2);
    g.strokeStyle = "#e8dfc8"; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = "#f4ecd6"; g.font = "bold 44px 'DejaVu Sans', sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    const kata = teks.split(" ");
    kata.forEach((k, i) => g.fillText(k, w / 2, 84 + i * 62));
  });

export const buildKelas = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {};
  const kayu = mkMat(T("plain", "#9a6f45", null, 3, 3)), dinding = mkMat(T("stone", "#e6d6b6", null, 2, 2));
  const papan = mkMat(T("plain", "#8a6a48", null, 1, 1));
  // lantai + dinding belakang + dinding samping
  addM(g, box(16, 0.2, 12), mkMat(T("plain", "#8f6b46", null, 6, 5)), [0, -0.1, 0], { ink: 0.02 });
  addM(g, box(16, 5.2, 0.3), dinding, [0, 2.6, -5.9], { ink: 0.03 });
  for (const sx of [-1, 1]) addM(g, box(0.3, 5.2, 12), dinding, [sx * 7.9, 2.6, 0], { ink: 0.03 });
  addM(g, box(16, 0.4, 12), mkMat(T("plain", "#7a5a3c", null, 4, 3)), [0, 5.1, 0], { ink: 0.03 });
  // papan tulis
  addM(g, box(6.4, 2.6, 0.18), papan, [0, 3.1, -5.7], { ink: 0.04 });
  o.papan = addM(g, box(6.0, 2.2, 0.06), new THREE.MeshBasicMaterial({ map: papanTex("BAHASA INDONESIA") }), [0, 3.1, -5.6], { ink: 0.02 });
  addM(g, box(6.2, 0.14, 0.22), mkMat(0x6e4a30), [0, 1.72, -5.62], { ink: 0.02 });
  // meja guru + kursi
  addM(g, box(2.4, 0.14, 0.9), kayu, [0, 0.78, -4.2], { ink: 0.03 });
  for (const sx of [-1, 1]) addM(g, box(0.14, 0.78, 0.8), kayu, [sx * 1.05, 0.39, -4.2], { ink: 0.02 });
  addM(g, box(0.9, 0.1, 0.5), kayu, [-4.6, 0.62, -4.4], { ink: 0.02 });
  // bangku murid 3 baris × 2 kolom
  o.bangku = [];
  for (let r = 0; r < 3; r++) for (const sx of [-1, 1]) {
    const x = sx * 2.3, z = -1.4 + r * 2.3;
    const gr = new THREE.Group(); gr.position.set(x, 0, z); g.add(gr);
    addM(gr, box(2.2, 0.12, 0.7), kayu, [0, 0.72, 0], { ink: 0.03 });
    addM(gr, box(0.16, 0.72, 0.6), kayu, [-1.0, 0.36, 0], { ink: 0.02 });
    addM(gr, box(0.16, 0.72, 0.6), kayu, [1.0, 0.36, 0], { ink: 0.02 });
    addM(gr, box(2.2, 0.1, 0.4), kayu, [0, 0.44, 0.62], { ink: 0.02 });
    o.bangku.push([x, z]);
  }
  // jendela samping + cahaya masuk
  for (const sx of [-1, 1]) for (const z of [-3.0, 1.2]) addM(g, box(0.08, 1.8, 1.8), mkMat(0xbfe0f2), [sx * 7.72, 2.9, z], { ink: 0.02 });
  // lampu gantung
  addM(g, cyl(0.03, 0.03, 1.2, 6), mkMat(0x333333), [0, 5.0, -1.0], { ink: 0.01 });
  addM(g, new THREE.ConeGeometry(0.55, 0.5, 12), mkMat(0xe8c45a), [0, 4.3, -1.0], { ink: 0.02 });
  o.g = g; return o;
};

/** Ruang gelap dengan meja peta + lilin (untuk kalimat "pertanyaan besar"). */
const petaTex = () =>
  cvTex("peta", 256, 256, (g, w, h) => {
    g.fillStyle = "#e8d9b4"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#9a6f45"; g.lineWidth = 3;
    for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo((i * 41) % w, 0); g.bezierCurveTo(w * 0.4, h * 0.3, w * 0.6, h * 0.7, (i * 67) % w, h); g.stroke(); }
    g.fillStyle = "rgba(120,90,60,.35)";
    g.beginPath(); g.arc(w * 0.32, h * 0.42, 26, 0, 7); g.fill();
    g.beginPath(); g.arc(w * 0.68, h * 0.6, 34, 0, 7); g.fill();
    g.strokeStyle = "#8a3b34"; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.2, h * 0.75); g.lineTo(w * 0.55, h * 0.3); g.lineTo(w * 0.85, h * 0.45); g.stroke();
    g.strokeRect(4, 4, w - 8, h - 8);
  });

export const buildRuangPeta = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {};
  const kayu = mkMat(T("plain", "#7a5133", null, 2, 2));
  addM(g, box(14, 0.2, 10), mkMat(T("plain", "#5c4028", null, 5, 4)), [0, -0.1, 0], { ink: 0.02 });
  for (const [w, h, d, p] of [[14, 4.6, 0.3, [0, 2.3, -4.9]], [0.3, 4.6, 10, [-6.9, 2.3, 0]], [0.3, 4.6, 10, [6.9, 2.3, 0]]]) addM(g, box(w, h, d), mkMat(T("stone", "#4a4038", null, 2, 2)), p, { ink: 0.03 });
  // meja besar
  addM(g, box(3.4, 0.16, 2.1), kayu, [0, 0.86, 0], { ink: 0.035 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addM(g, box(0.16, 0.86, 0.16), kayu, [sx * 1.5, 0.43, sz * 0.9], { ink: 0.02 });
  o.peta = addM(g, box(3.0, 0.03, 1.7), new THREE.MeshBasicMaterial({ map: petaTex() }), [0, 0.95, 0], { rot: [0, 0.06, 0], ink: 0.02 });
  // lilin + tumpukan buku
  addM(g, cyl(0.07, 0.08, 0.3, 10), mkMat(0xefe6d0), [1.15, 1.09, 0.55], { ink: 0.015 });
  addM(g, new THREE.ConeGeometry(0.06, 0.17, 8), mkMat(0xffb43c), [1.15, 1.31, 0.55], { ink: 0.01 });
  for (const [dx, dy, dz, c] of [[-1.0, 1.02, 0.5, 0x6e4a30], [-1.0, 1.12, 0.5, 0x8a5f39], [-0.75, 1.02, -0.6, 0x5a3b28]]) addM(g, box(0.44, 0.1, 0.32), mkMat(c), [dx, dy, dz], { ink: 0.02 });
  for (const sx of [-1, 1]) addM(g, cyl(0.05, 0.06, 1.6, 8), mkMat(0x2a2a2a), [sx * 5.6, 3.6, -4.5], { ink: 0.01 });
  o.g = g; return o;
};