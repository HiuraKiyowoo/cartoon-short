// Panggung NUSANTARA (pelabuhan tropis) — aset BARU untuk cerita "Belanda jadi jajahan".
// Semua dibuat dari primitif (playbook bagian 6): 5-15 bagian per objek, 3-4 warna, outline otomatis.
import * as THREE from "three";
import { cvTex, mkMat, addM } from "./world.js";
const R = (s) => { let x = s * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);

const lautTex = cvTex("lautN", 512, 512, (g, w, h) => {
  g.fillStyle = "#2a86b8"; g.fillRect(0, 0, w, h);
  const r = R(13);
  for (let i = 0; i < 90; i++) { const x = r() * w, y = r() * h, l = 26 + r() * 46;
    g.strokeStyle = i % 3 ? "#5cb3dd" : "#1f6d9a"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 8, x + l, y); g.stroke(); }
}, 30, 30);
const papanTex = cvTex("papanN", 256, 256, (g, w, h) => {
  const c = ["#b98a56", "#c4965f", "#a87c4a", "#c09058"];
  for (let i = 0; i < 8; i++) { g.fillStyle = c[i % 4]; g.fillRect((i * w) / 8, 0, w / 8, h); g.fillStyle = "#6b4526"; g.fillRect((i * w) / 8, 0, 4, h); }
}, 2, 8);
const ijukTex = cvTex("ijukN", 256, 256, (g, w, h) => {
  g.fillStyle = "#8a6a34"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? "#7a5c2c" : "#9c7a3c"; g.fillRect(0, (i * h) / 40, w, h / 40 - 1); }
}, 6, 2);
const batuTex = cvTex("batuN", 256, 256, (g, w, h) => {
  g.fillStyle = "#8a7a68"; g.fillRect(0, 0, w, h); const r = R(5);
  for (let i = 0; i < 60; i++) { g.fillStyle = r() > 0.5 ? "#7a6a58" : "#9a8a76"; g.beginPath(); g.ellipse(r() * w, r() * h, 14 + r() * 22, 8 + r() * 12, 0, 0, 7); g.fill(); }
}, 3, 2);
const sawahTex = cvTex("sawahN", 256, 256, (g, w, h) => {
  g.fillStyle = "#4e8f3e"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 120; i++) { const x = (i * 71) % w, y = (i * 37) % h; g.strokeStyle = i % 3 ? "#63ad4c" : "#3d7a32"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 12); g.stroke(); }
}, 20, 20);

// palem: batang melengkung + 6 pelepah
export const mkPalem = (par, x, z, s = 1, bend = 0.4) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); par.add(g);
  let px = 0, py = 0;
  for (let i = 0; i < 6; i++) { const seg = addM(g, cyl(0.16, 0.2, 1.6, 8), mkMat(0x8a6a44), [px, py + 0.8, 0], { rot: [0, 0, -bend * i * 0.06], ink: 0.02 }); px += Math.sin(bend * i * 0.06) * 1.5; py += 1.5; }
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, f = addM(g, box(3.0, 0.1, 0.7), mkMat(0x3f7a34), [px + Math.cos(a) * 1.5, py + 0.35, Math.sin(a) * 1.5], { rot: [0, -a, -0.25], ink: 0.025 }); }
  addM(g, new THREE.SphereGeometry(0.35, 8, 6), mkMat(0x6a4a26), [px, py + 0.1, 0], { ink: 0.02 });
  return g;
};

// rumah panggung beratap ijuk
export const mkRumahPanggung = (par, x, z, s = 1, ry = 0) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(s); par.add(g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addM(g, cyl(0.16, 0.18, 1.6, 8), mkMat(0x6b4a2c), [sx * 1.3, 0.8, sz * 1.1], { ink: 0.02 });
  addM(g, box(3.4, 0.2, 3.0), mkMat(papanTex), [0, 1.7, 0], { ink: 0.03 });
  addM(g, box(3.2, 1.5, 2.8), mkMat(0xb08a5a), [0, 2.55, 0], { ink: 0.03 });
  addM(g, box(0.9, 1.1, 0.1), mkMat(0x5a3a22), [0, 2.4, 1.42], { ink: 0.02 });
  addM(g, box(4.2, 0.3, 3.6), mkMat(ijukTex), [0, 3.42, 0], { ink: 0.03 });
  addM(g, new THREE.ConeGeometry(2.7, 1.1, 4), mkMat(0x7a5c2c), [0, 3.95, 0], { rot: [0, Math.PI / 4, 0], ink: 0.03 });
  return g;
};

// kapal layar lateen Nusantara (lambung melengkung, layar segitiga miring)
export const mkKapalNus = (par, x, z, s = 1, o = {}) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = o.ry ?? 0; g.scale.setScalar(s); par.add(g);
  const sh = new THREE.Shape();
  sh.moveTo(-5.6, 1.9); sh.quadraticCurveTo(-6.6, 1.2, -6.2, 0.2);
  sh.lineTo(4.6, 0.0); sh.quadraticCurveTo(6.2, 0.5, 7.0, 2.0);
  sh.lineTo(5.6, 1.85); sh.lineTo(-5.6, 1.9);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 3.0, bevelEnabled: false }); hg.translate(0, 0, -1.5);
  addM(g, hg, mkMat(o.hull ?? 0x6b4526), [0, 0, 0], { ink: 0.05 });
  addM(g, box(11.4, 0.26, 3.1), mkMat(0xf0e2bd), [0.4, 1.1, 0], { ink: 0.025 });
  addM(g, box(11.0, 0.14, 3.2), mkMat(0x8a6a44), [0.4, 2.15, 0], { ink: 0.02 });
  addM(g, cyl(0.12, 0.17, 8.6, 8), mkMat(0x6b4a2c), [-1.6, 6.0, 0], { ink: 0.02 });
  addM(g, cyl(0.10, 0.14, 6.4, 8), mkMat(0x6b4a2c), [2.4, 4.9, 0], { ink: 0.02 });
  // lateen: tiang miring + layar segitiga (dibuat dari Shape, tipis)
  const yard = addM(g, cyl(0.09, 0.09, 9.0, 8), mkMat(0x8a6a44), [-1.6, 6.6, 0], { rot: [0, 0, -0.72], ink: 0.02 });
  const ls = new THREE.Shape(); ls.moveTo(-3.6, 9.4); ls.lineTo(3.2, 6.4); ls.lineTo(-3.0, 3.4); ls.lineTo(-3.6, 9.4);
  const lg = new THREE.ExtrudeGeometry(ls, { depth: 0.09, bevelEnabled: false });
  const lm = new THREE.MeshToonMaterial({ color: 0xf7efd8, gradientMap: mkMat(0xffffff).gradientMap, side: THREE.DoubleSide });
  const sail = addM(g, lg, lm, [-1.9, 0, 0], { rot: [0, 0, 0], ink: 0.03 });
  const ls2 = new THREE.Shape(); ls2.moveTo(-2.4, 8.2); ls2.lineTo(2.6, 5.6); ls2.lineTo(-2.0, 3.2); ls2.lineTo(-2.4, 8.2);
  const sail2 = addM(g, new THREE.ExtrudeGeometry(ls2, { depth: 0.08, bevelEnabled: false }), lm, [2.2, 0, 0], { ink: 0.03 });
  // cadik/biduk kecil di sisi (ciri kapal Nusantara)
  for (const sz of [-1, 1]) addM(g, cyl(0.22, 0.22, 7.0, 8), mkMat(0x8a6a44), [0.4, 0.5, sz * 2.4], { rot: [Math.PI / 2, 0, 0], ink: 0.02 });
  addM(g, cyl(0.06, 0.06, 5.2, 6), mkMat(0x6b4a2c), [0, 1.5, -2.4], { ink: 0.015 });
  addM(g, cyl(0.06, 0.06, 5.2, 6), mkMat(0x6b4a2c), [0, 1.5, 2.4], { ink: 0.015 });
  // panji merah-putih
  const pole = addM(g, cyl(0.07, 0.09, 4.4, 6), mkMat(0x6b4a2c), [5.6, 3.4, 0], { ink: 0.015 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ color: 0xd5343b, side: THREE.DoubleSide }));
  fl.position.set(6.3, 5.2, 0); g.add(fl);
  const fl2 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.42), new THREE.MeshBasicMaterial({ color: 0xf2efe6, side: THREE.DoubleSide }));
  fl2.position.set(6.3, 4.55, 0); g.add(fl2);
  return { g, sail, sail2, yard, fl, fl2 };
};

export const buildNusantara = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {}; const r = R(29);
  o.sea = addM(g, new THREE.PlaneGeometry(800, 800), mkMat(lautTex), [0, -0.06, -170], { rot: [-Math.PI / 2, 0, 0], ink: false });
  // tanah + bukit tropis
  addM(g, box(150, 0.3, 90), mkMat(sawahTex), [0, -0.15, 20], { ink: false });
  for (let i = 0; i < 9; i++) { const x = -46 + i * 12, h = 12 + r() * 16, z = -34 - r() * 22;
    addM(g, new THREE.ConeGeometry(9 + r() * 7, h, 7), mkMat(0x3f6f46), [x, h / 2 - 1, z], { ink: 0.05 });
    addM(g, new THREE.ConeGeometry(4 + r() * 3, h * 0.45, 7), mkMat(0x4f8447), [x, h * 0.72, z], { ink: 0.04 }); }
  // dermaga kayu
  addM(g, box(26, 0.3, 7), mkMat(papanTex), [0, 0.7, -2], { ink: 0.03 });
  for (const sx of [-11, -5.5, 0, 5.5, 11]) for (const sz of [-5, 1]) addM(g, cyl(0.22, 0.26, 2.4, 8), mkMat(0x6b4526), [sx, 0.35, sz], { ink: 0.02 });
  for (const sz of [-5.4, 1.4]) addM(g, box(26, 0.14, 0.14), mkMat(0x7a5638), [0, 2.0, sz], { ink: 0.02 });
  for (const sx of [-11, -5.5, 0, 5.5, 11]) addM(g, cyl(0.09, 0.09, 1.25, 6), mkMat(0x6b4526), [sx, 1.45, -5.4], { ink: 0.015 });
  // gudang rempah + karung
  addM(g, box(7, 4.2, 5), mkMat(batuTex), [13.5, 2.1, -1], { ink: 0.04 });
  addM(g, box(7.8, 0.4, 5.8), mkMat(ijukTex), [13.5, 4.4, -1], { ink: 0.03 });
  for (let i = 0; i < 5; i++) addM(g, cyl(0.5, 0.42, 1.1, 8), mkMat(0xc9a86a), [10.6 + (i % 3) * 1.1, 0.55, -3.4 + Math.floor(i / 3) * 1.3], { ink: 0.03 });
  o.ships = [];
  o.ships.push(mkKapalNus(g, -14, -15, 1.25, { ry: -0.55 }));
  o.ships.push(mkKapalNus(g, 2, -19, 1.45, { ry: -0.35, hull: 0x5a3a26 }));
  o.ships.push(mkKapalNus(g, 17, -14, 1.05, { ry: -0.2 }));
  o.ships.push(mkKapalNus(g, -30, -22, 1.15, { ry: -0.9 }));
  o.boat = null;
  for (let i = 0; i < 12; i++) mkPalem(g, -30 + i * 5.4, 12 + r() * 14, 0.9 + r() * 0.5, 0.3 + r() * 0.5);
  mkRumahPanggung(g, 22, 10, 1.1, -0.3); mkRumahPanggung(g, 30, 14, 0.95, 0.2); mkRumahPanggung(g, 15, 16, 0.85, 0.5);
  // panji perang di dermaga (merah-putih) — objek penting cerita
  o.banner = [];
  for (const [x, z] of [[-4.2, -3.2], [4.6, -3.0]]) {
    addM(g, cyl(0.1, 0.12, 6.6, 8), mkMat(0x6b4a2c), [x, 3.3, z], { ink: 0.02 });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.7), new THREE.MeshBasicMaterial({ color: 0xd5343b, side: THREE.DoubleSide }));
    b.position.set(x, 5.4, z); g.add(b); o.banner.push(b);
    const b2 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.6), new THREE.MeshBasicMaterial({ color: 0xf2efe6, side: THREE.DoubleSide }));
    b2.position.set(x, 4.4, z); g.add(b2); o.banner.push(b2);
  }
  o.g = g; return o;
};
