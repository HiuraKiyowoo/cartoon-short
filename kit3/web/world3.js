import * as THREE from "three";
import { cvTex, mkMat, addM, T } from "./world.js";
const R = (s) => { let x = s * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 14) => new THREE.CylinderGeometry(rt, rb, h, s);
const tudor = (base) => cvTex("tudor" + base, 256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.strokeStyle = "#5a3b28"; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h * 0.45); g.lineTo(w, h * 0.45); g.moveTo(0, h * 0.45); g.lineTo(w / 2, 0); g.moveTo(w, h * 0.45); g.lineTo(w / 2, 0); g.stroke(); g.fillStyle = "#4a4a68"; for (const x of [0.12, 0.62]) g.fillRect(w * x, h * 0.55, w * 0.24, h * 0.22); g.fillStyle = "#6e4a30"; g.fillRect(w * 0.42, h * 0.78, w * 0.16, h * 0.22); });
const barleyTex = (rx, ry) => cvTex("barley", 256, 256, (g, w, h) => { g.fillStyle = "#e3b84a"; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#d4a53a" : "#efc85f"; g.fillRect((i * w) / 16, 0, w / 16 - 4, h); } g.strokeStyle = "#b8862b"; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const x = (i * 37) % w, y = (i * 91) % h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 14); g.stroke(); } }, rx, ry);
export const buildVillage = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(61), o = { sheaves: [] };
  addM(g, new THREE.CircleGeometry(150, 40), mkMat(T("grass", "#7fb35a", null, 40, 40)), [0, 0, 0], { rot: [-Math.PI / 2, 0, 0], ink: false });
  addM(g, box(5.2, 0.03, 120), mkMat(T("plain", "#d3ae72", null, 2, 20)), [0, 0.02, -20], { ink: false });
  addM(g, box(30, 0.03, 40), mkMat(barleyTex(6, 8)), [-21, 0.03, -6], { ink: false });
  for (let i = 0; i < 6; i++) { const z = 10 - i * 6.2, w = 4.2, h = 3.4 + r() * 1.2, d = 4.6, x = 7.2; const base = ["#f3e6c9", "#efd9b3", "#f6ecd6"][i % 3];
    addM(g, box(w, h, d), mkMat(tudor(base)), [x, h / 2, z]); addM(g, new THREE.ConeGeometry(3.7, 2.0, 4), mkMat(0xc4573b), [x, h + 1.0, z], { rot: [0, Math.PI / 4, 0] }); }
  // church
  addM(g, box(9, 7, 7), mkMat(T("stone", "#e8dcc0", null, 3, 2)), [0, 3.5, -44]); addM(g, new THREE.ConeGeometry(6.5, 3, 4), mkMat(0x8a6a56), [0, 8.5, -44], { rot: [0, Math.PI / 4, 0] });
  addM(g, box(3, 12, 3), mkMat(T("stone", "#e8dcc0", null, 1, 3)), [5.5, 6, -42]); addM(g, new THREE.ConeGeometry(2.4, 5, 4), mkMat(0x3a6ea5), [5.5, 14.5, -42], { rot: [0, Math.PI / 4, 0] }); addM(g, box(0.15, 1.1, 0.15), mkMat(0xe8c45a), [5.5, 17.6, -42], { ink: 0.02 });
  addM(g, box(2.4, 3.6, 0.2), mkMat(0x6e4a30), [0, 1.8, -40.4]);
  for (let i = 0; i < 12; i++) { const x = (r() > 0.5 ? 1 : -1) * (14 + r() * 24), z = -r() * 60 + 8, s = 0.8 + r() * 0.7; addM(g, cyl(0.2 * s, 0.26 * s, 2 * s, 7), mkMat(0x6a4a30), [x, s, z], { ink: 0.02 }); addM(g, new THREE.SphereGeometry(1.5 * s, 12, 9), mkMat(0x4f9a47), [x, 2.8 * s, z], { ink: 0.04 }); }
  for (let i = 0; i < 5; i++) addM(g, new THREE.SphereGeometry(20 + r() * 12, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mkMat(0x86b86a), [-100 + i * 50, -1, -110 - r() * 20], { ink: 0.1 });
  for (let i = 0; i < 26; i++) { const x = -34 + r() * 27, z = -24 + r() * 36; const sh = new THREE.Group(); sh.position.set(x, 0, z); g.add(sh); addM(sh, new THREE.ConeGeometry(0.55, 1.5, 8), mkMat(0xd8a93a), [0, 0.75, 0], { ink: 0.03 }); addM(sh, cyl(0.07, 0.07, 1.2, 6), mkMat(0xa6771f), [0, 0.5, 0], { ink: 0.01 }); o.sheaves.push(sh); }
  for (let i = 0; i < 16; i++) addM(g, box(0.1, 0.9, 0.1), mkMat(0x7a5434), [-6.2, 0.45, 12 - i * 2.4], { ink: 0.02 }); addM(g, box(0.07, 0.07, 38), mkMat(0x7a5434), [-6.2, 0.75, -7], { ink: 0.015 });
  o.g = g; return o;
};
export const buildDock = (par) => { // wooden dock + bench for the accused, and the judge's bench; hall-local coords
  const wd = mkMat(0x8a5a32), wd2 = mkMat(0x6e4426);
  const dk = new THREE.Group(); dk.position.set(-1.4, 0, -2.8); par.add(dk);
  addM(dk, box(2.8, 0.7, 0.16), wd, [0, 0.35, 0.9]); for (const sx of [-1, 1]) addM(dk, box(0.16, 0.7, 1.9), wd, [sx * 1.4, 0.35, 0]);
  addM(dk, box(2.8, 0.12, 0.18), wd2, [0, 0.76, 0.9]); addM(dk, box(2.6, 0.35, 1.4), wd2, [0, 0.18, -0.6]);
  const jb = new THREE.Group(); jb.position.set(0, 0, -9.0); par.add(jb);
  addM(jb, box(4.0, 1.5, 0.9), mkMat(0x7a4d2b), [0, 0.75, 0]); addM(jb, box(4.3, 0.14, 1.1), wd2, [0, 1.55, 0]);
  return { dk, jb };
};
