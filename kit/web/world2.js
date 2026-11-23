import * as THREE from "three";
import { grad3, cvTex, mkMat, addM, T } from "./world.js";
const R = (s) => { let x = s * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 16, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
const signTex = (txt, bg, fg, w = 512, h = 160, fs = 96) => cvTex("sign" + txt + bg + fg, w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = fg; g.font = `bold ${fs}px 'DejaVu Sans', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 4); });
const flagTex = (cols, vert = true) => cvTex("flag" + cols.join(""), 192, 128, (g, w, h) => { cols.forEach((c, i) => { g.fillStyle = c; if (vert) g.fillRect((i * w) / cols.length, 0, w / cols.length + 1, h); else g.fillRect(0, (i * h) / cols.length, w, h / cols.length + 1); }); });
const awningTex = cvTex("awn", 256, 128, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#e0443a"; g.fillRect((i * w) / 8, 0, w / 8 + 1, h); } });
const flagMat = (t) => new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide });
const palm = (g, x, z, s, r) => { const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t); addM(t, cyl(0.13 * s, 0.2 * s, 3.4 * s, 7), mkMat(0x8a6240), [0, 1.7 * s, 0], { ink: 0.02, rot: [0, 0, 0.12] }); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + r; addM(t, new THREE.ConeGeometry(0.28 * s, 2.0 * s, 4), mkMat(0x3e9a4a), [Math.cos(a) * 0.9 * s + 0.3, 3.4 * s - 0.1, Math.sin(a) * 0.9 * s], { rot: [Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25], ink: 0.02 }); } };
const cactus = (g, x, z, s) => { const m = mkMat(0x4a9a4e); addM(g, cyl(0.25 * s, 0.28 * s, 2.2 * s, 8), m, [x, 1.1 * s, z], { ink: 0.025 }); addM(g, cyl(0.17 * s, 0.17 * s, 0.9 * s, 8), m, [x + 0.45 * s, 1.35 * s, z], { ink: 0.02 }); addM(g, cyl(0.15 * s, 0.15 * s, 0.8 * s, 8), m, [x - 0.4 * s, 1.05 * s, z], { ink: 0.02 }); };

// ---------------------------------------------------------------- MEXICAN TOWN
export const buildTown = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(41), o = {};
  addM(g, new THREE.CircleGeometry(140, 40), mkMat(T("plain", "#e3c283", null, 40, 40)), [0, 0, 0], { rot: [-Math.PI / 2, 0, 0], ink: false });
  addM(g, box(9, 0.03, 70), mkMat(T("checker", "#d9b97a", "#c9a565", 2, 20)), [0, 0.02, -10], { ink: false });
  const cols = ["#f06f9b", "#f5c453", "#43b8c4", "#f08a4a", "#8bc96a", "#e0654f", "#b78be0"];
  // street rows
  for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) { const x = sx * (6.4 + (r() * 0.6)), z = 8 - i * 5.2, w = 3.8, h = 3.2 + r() * 1.6, d = 4.4; const col = cols[(i * 2 + (sx > 0 ? 3 : 0)) % 7];
    addM(g, box(w, h, d), mkMat(T("house", col, null, 1, 1)), [x, h / 2, z]); addM(g, box(w + 0.25, 0.3, d + 0.25), mkMat(0xf6efe0), [x, h + 0.15, z]);
    if (i % 3 === 0) addM(g, cyl(0.1, 0.1, 0.9, 6), mkMat(0x6e4a30), [x + sx * 1.0, h + 0.7, z], { ink: 0.02 }); }
  // bakery
  const bk = new THREE.Group(); bk.position.set(0, 0, -9); g.add(bk);
  addM(bk, box(6.4, 4.2, 4.4), mkMat(T("house", "#fbe3b0", null, 1, 1)), [0, 2.1, 0]); addM(bk, box(6.7, 0.3, 4.7), mkMat(0xc4573b), [0, 4.35, 0]);
  addM(bk, box(2.2, 2.2, 0.15), mkMat(0x3a2530), [0, 1.2, 2.25], { ink: 0.02 });
  for (const sx of [-1, 1]) addM(bk, box(1.3, 1.3, 0.15), mkMat(0xbfe8f2), [sx * 2.3, 1.7, 2.25], { ink: 0.02 });
  const aw = addM(bk, box(6.0, 0.18, 1.7), mkMat(awningTex), [0, 2.8, 3.0], { rot: [0.35, 0, 0] }); o.awn = aw;
  addM(bk, box(5.2, 1.3, 0.2), new THREE.MeshBasicMaterial({ map: signTex("PASTELES", "#2f8f6b", "#ffe7a3") }), [0, 3.7, 2.35], { ink: 0.03 });
  addM(bk, new THREE.ConeGeometry(0.5, 0.9, 8), mkMat(0xf1b46c), [-2.6, 4.9, 0], { ink: 0.03 });
  // year sign on a post
  addM(g, cyl(0.07, 0.07, 3.6, 6), mkMat(0x6e4a30), [-3.4, 1.8, -3], { ink: 0.02 });
  o.year = addM(g, box(2.2, 1.0, 0.14), new THREE.MeshBasicMaterial({ map: signTex("1838", "#fff2c8", "#8a2a30", 384, 176, 130) }), [-3.4, 3.9, -3], { ink: 0.03, rot: [0, 0.15, 0] });
  // church at back
  addM(g, box(10, 7, 6), mkMat(T("stone", "#f2e3c4", null, 3, 2)), [-9, 3.5, -46]); for (const sx of [-1, 1]) { addM(g, box(2.6, 11, 2.6), mkMat(T("stone", "#f2e3c4", null, 1, 3)), [-9 + sx * 3.6, 5.5, -43]); addM(g, new THREE.SphereGeometry(1.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mkMat(0x3fa6b0), [-9 + sx * 3.6, 11, -43]); addM(g, box(0.15, 1.0, 0.15), mkMat(0xe8c45a), [-9 + sx * 3.6, 13, -43], { ink: 0.02 }); }
  addM(g, box(2.4, 3.6, 0.2), mkMat(0x6e4a30), [-9, 1.8, -42.9]);
  // volcano
  addM(g, new THREE.ConeGeometry(34, 30, 20, 1), mkMat(0x7c6aa0), [34, 15, -110], { ink: 0.18 }); addM(g, new THREE.ConeGeometry(8, 7, 20), mkMat(0xf7f3ee), [34, 27, -110], { ink: 0.05 });
  for (let i = 0; i < 6; i++) addM(g, new THREE.SphereGeometry(16 + r() * 8, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mkMat(0xc99a5e), [-90 + i * 36, -1, -90 - r() * 25], { ink: 0.12 });
  for (let i = 0; i < 14; i++) cactus(g, (r() > 0.5 ? 1 : -1) * (12 + r() * 14), 14 - r() * 70, 0.8 + r() * 0.8);
  // papel picado
  const pc = ["#f06f9b", "#f5c453", "#43b8c4", "#8bc96a", "#ff8a3d", "#b78be0"]; o.flags = [];
  for (let row = 0; row < 3; row++) { const z = 3 - row * 9; for (let i = 0; i < 16; i++) { const x = -6 + (i / 15) * 12, y = 5.6 - Math.sin((i / 15) * Math.PI) * 0.7; const tri = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.7, 3), new THREE.MeshBasicMaterial({ color: pc[(i + row) % 6] })); tri.position.set(x, y - 0.35, z); tri.rotation.set(Math.PI, 0, 0); g.add(tri); o.flags.push(tri); } addM(g, box(12.4, 0.04, 0.04), mkMat(0x333333), [0, 5.55, z], { ink: false }); }
  o.g = g; return o;
};
// ---------------------------------------------------------------- HARBOUR / FORTRESS / FLEET
const sailTex = cvTex("sail", 256, 256, (g, w, h) => { g.fillStyle = "#f7f0dd"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(214,201,172,.55)"; for (let i = 1; i < 7; i++) g.fillRect(0, (i * h) / 7 - 3, w, 6); g.strokeStyle = "#c9bda0"; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); });
const sailMat = new THREE.MeshBasicMaterial({ map: sailTex, side: THREE.DoubleSide });

const ship = (par, x, z, s = 1, ry = 0, layar = false) => {
  const sg = new THREE.Group(); sg.position.set(x, 0, z); sg.rotation.y = ry; sg.scale.setScalar(s); par.add(sg);
  const sh = new THREE.Shape(); sh.moveTo(-6, 2.0); sh.lineTo(-5.2, 0); sh.lineTo(4.6, 0); sh.lineTo(6.6, 2.2); sh.lineTo(5.6, 2.2); sh.lineTo(-6, 2.0);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: false }); hg.translate(0, 0, -1.6);
  addM(sg, hg, mkMat(0x7a4a2e), [0, 0.1, 0], { ink: 0.05 });
  addM(sg, box(11.6, 0.34, 3.3), mkMat(0xf3e7c6), [0.3, 1.25, 0], { ink: 0.025 });
  for (let i = 0; i < 5; i++) for (const sz of [-1, 1]) addM(sg, box(0.55, 0.45, 0.1), mkMat(0x1c1420), [-3.4 + i * 1.7, 0.85, sz * 1.62], { ink: 0.01 });
  for (const mx of [-3.4, 0.2, 3.6]) { addM(sg, cyl(0.12, 0.16, 9, 7), mkMat(0x5a3a26), [mx, 6.3, 0], { ink: 0.02 }); addM(sg, box(0.12, 0.12, 3.8), mkMat(0x5a3a26), [mx, 8.3, 0], { ink: 0.02 }); addM(sg, box(0.12, 0.12, 3.2), mkMat(0x5a3a26), [mx, 5.2, 0], { ink: 0.02 });
    addM(sg, box(0.1, 2.5, 3.5), mkMat(0xfaf3dc), [mx + 0.05, 6.75, 0], { ink: 0.03 }); addM(sg, box(0.1, 2.0, 3.0), mkMat(0xfaf3dc), [mx + 0.05, 3.9, 0], { ink: 0.03 }); }
  // layar terkembang: dua tingkat per tiang, bidang di sepanjang z (sama arah dengan layar tergulung)
  if (layar) for (const [mx, y1, y2, wz, hy] of [[-3.4, 6.6, 3.9, 3.5, 2.5], [0.2, 8.0, 5.2, 3.7, 2.6], [3.6, 6.4, 3.8, 3.3, 2.4]]) {
    for (const [y, wz2, hy2] of [[y1, wz, hy], [y2, wz * 0.85, hy * 0.8]]) {
      const sl = new THREE.Mesh(new THREE.PlaneGeometry(wz2, hy2), sailMat);
      sl.position.set(mx, y, 0); sl.rotation.y = Math.PI / 2; sg.add(sl);
    }
  }
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), flagMat(flagTex(["#2a4f9e", "#ffffff", "#d5343b"]))); fl.position.set(3.6, 11.0, 0.9); fl.rotation.y = Math.PI / 2; sg.add(fl);
  const guns = []; for (let i = 0; i < 5; i++) guns.push([x + Math.cos(ry) * (-3.4 + i * 1.7) * s, 0.85 * s, z - Math.sin(ry) * (-3.4 + i * 1.7) * s + 1.7 * s]);
  return { g: sg, guns };
};
export const buildHarbor = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(51), o = {};
  addM(g, new THREE.PlaneGeometry(500, 300), mkMat(T("plain", "#2f9bd4", null, 60, 40)), [0, -0.12, -140], { rot: [-Math.PI / 2, 0, 0], ink: false });
  addM(g, new THREE.PlaneGeometry(500, 80), mkMat(T("plain", "#f1dba5", null, 60, 10)), [0, 0, 28], { rot: [-Math.PI / 2, 0, 0], ink: false });
  addM(g, new THREE.PlaneGeometry(500, 2.2), mkMat(0xdff4ff), [0, 0.01, -10.6], { rot: [-Math.PI / 2, 0, 0], ink: false });
  // fortress
  const F = new THREE.Group(); F.position.set(0, 0, -4); g.add(F); const st = mkMat(T("stone", "#d2c4a0", null, 4, 1)), st2 = mkMat(T("stone", "#c4b48c", null, 1, 2));
  addM(F, box(20, 3.3, 2.4), st, [0, 1.65, 0]);
  for (let i = 0; i < 11; i++) addM(F, box(1.0, 0.7, 0.5), st, [-9.5 + i * 1.9, 3.65, -1.0]);
  addM(F, box(2.8, 2.4, 0.2), mkMat(0x2b2133), [0, 1.2, 1.25], { ink: 0.02 });
  for (const sx of [-1, 1]) { addM(F, cyl(2.0, 2.2, 6, 14), st2, [sx * 11, 3, 0]); addM(F, cyl(2.4, 2.4, 0.5, 14), st, [sx * 11, 6.25, 0]); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; addM(F, box(0.75, 0.6, 0.75), st, [sx * 11 + Math.cos(a) * 2.2, 6.8, Math.sin(a) * 2.2]); } }
  addM(F, cyl(0.06, 0.06, 4, 6), mkMat(0x555555), [11, 8.5, 0], { ink: 0.015 }); const mf = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.2), flagMat(flagTex(["#1f8a4c", "#ffffff", "#d5343b"]))); mf.position.set(12.0, 9.8, 0); F.add(mf); o.mflag = mf;
  o.cannons = []; for (const x of [-6, -2, 2, 6]) { addM(F, box(1.2, 0.5, 1.2), mkMat(0x6e4a30), [x, 3.5, -0.5]); addM(F, cyl(0.3, 0.38, 2.2, 10), mkMat(0x34363f), [x, 3.9, -1.3], { rot: [Math.PI / 2, 0, 0], ink: 0.03 }); o.cannons.push([x, 3.9, -4 - 2.3]); }
  for (let i = 0; i < 9; i++) addM(g, new THREE.SphereGeometry(0.28, 8, 6), mkMat(0x34363f), [-2 + (i % 3) * 0.55, 0.28, -1.0 + Math.floor(i / 3) * 0.55], { ink: 0.02 });
  for (let i = 0; i < 9; i++) palm(g, (r() - 0.5) * 60, 6 + r() * 26, 0.9 + r() * 0.6, r() * 6);
  // fleet
  o.ships = [ship(g, -15, -24, 1.2, 0, true), ship(g, 1, -34, 1.35, 0, true), ship(g, 19, -26, 1.2, 0, true), ship(g, -32, -42, 1.25, 0, true), ship(g, 36, -46, 1.2, 0, true)];
  for (let i = 0; i < 4; i++) addM(g, new THREE.SphereGeometry(30 + r() * 14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mkMat(0x6aa07a), [-90 + i * 60, -1, -170], { ink: 0.1 });
  o.g = g; return o;
};

// ---------------------------------------------------------------- PROP DERMAGA (tong, peti, tiang tambat, tali)
export const buildQuayProps = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(73), o = { tong: [], peti: [], tiang: [] };
  const kayu = mkMat(T("plain", "#8a5f39", null, 2, 2)), besi = mkMat(0x4a4a52), tali = mkMat(0xc9b184);
  const tong = (x, z, s = 1) => { const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = r() * 6.28; g.add(gr);
    addM(gr, cyl(0.42 * s, 0.38 * s, 0.95 * s, 12), kayu, [0, 0.475 * s, 0], { ink: 0.03 });
    for (const y of [0.2, 0.5, 0.8]) addM(gr, cyl(0.44 * s, 0.44 * s, 0.07 * s, 12), besi, [0, y * s, 0], { ink: 0.02 });
    o.tong.push(gr); return gr; };
  const peti = (x, z, s = 1) => { const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = r() * 1.2 - 0.6; g.add(gr);
    addM(gr, box(0.9 * s, 0.62 * s, 0.66 * s), kayu, [0, 0.31 * s, 0], { ink: 0.035 });
    addM(gr, box(0.94 * s, 0.08 * s, 0.7 * s), mkMat(0x6e4a30), [0, 0.6 * s, 0], { ink: 0.02 });
    o.peti.push(gr); return gr; };
  const tiangTambat = (x, z) => { addM(g, cyl(0.19, 0.22, 1.15, 10), mkMat(0x6e4a30), [x, 0.57, z], { ink: 0.03 });
    addM(g, cyl(0.21, 0.21, 0.12, 10), besi, [x, 1.12, z], { ink: 0.02 }); o.tiang.push([x, z]); };
  // tepi quay (z ~ 9..13), dua sisi supaya terasa kedalaman
  tong(-5.4, 4.2, 1.0); tong(-6.1, 5.0, 0.95); tong(5.0, 3.9, 1.0); tong(-6.2, 12.4, 1.0);
  peti(-4.0, 4.0, 1.15); peti(-3.2, 4.9, 0.9); peti(3.9, 4.4, 1.05); peti(5.6, 5.2, 1.0);
  tiangTambat(-7.4, 4.6); tiangTambat(0.4, 4.2); tiangTambat(6.8, 4.8); tiangTambat(9.6, 6.0);
  // gulungan tali di geladak
  for (let i = 0; i < 6; i++) addM(g, new THREE.TorusGeometry(0.34, 0.07, 6, 14), tali, [-4.6 + i * 0.16, 0.09 + i * 0.055, 5.6], { rot: [-Math.PI / 2, 0, 0], ink: 0.02 });
  o.g = g; return o;
};
