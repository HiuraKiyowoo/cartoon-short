import * as THREE from "three";
import { cvTex, mkMat, addM, T } from "./world.js";
const R = (s) => { let x = s * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 14) => new THREE.CylinderGeometry(rt, rb, h, s);
const waveTex = cvTex("waves4", 512, 512, (g, w, h) => { g.fillStyle = "#2f86bd"; g.fillRect(0, 0, w, h); const r = R(7); for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * h, l = 30 + r() * 50; g.strokeStyle = i % 3 ? "#58a9d8" : "#256f9e"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 10, x + l, y); g.stroke(); } }, 40, 40);
const plankTex = cvTex("planks4", 256, 256, (g, w, h) => { const cols = ["#b98a56", "#c4965f", "#ad7f4c", "#bf9058"]; for (let i = 0; i < 8; i++) { g.fillStyle = cols[i % 4]; g.fillRect((i * w) / 8, 0, w / 8, h); g.fillStyle = "#6e4a2a"; g.fillRect((i * w) / 8, 0, 4, h); } g.fillStyle = "#6e4a2a"; for (let i = 0; i < 6; i++) g.fillRect(((i * 53) % w), ((i * 91) % h), 18, 4); }, 3, 12);
const wallTex = cvTex("wall4", 256, 256, (g, w, h) => { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#8a5f3a" : "#946a42"; g.fillRect(0, (i * h) / 6, w, h / 6); g.fillStyle = "#4e321c"; g.fillRect(0, (i * h) / 6, w, 4); } }, 3, 1);
const hullTex = cvTex("hull4", 128, 128, (g, w, h) => { g.fillStyle = "#3b2a22"; g.fillRect(0, 0, w, h); g.fillStyle = "#f2e6c8"; g.fillRect(0, h * 0.32, w, h * 0.12); g.fillStyle = "#1a1018"; for (let i = 0; i < 4; i++) g.fillRect(8 + i * 32, h * 0.34, 14, h * 0.08); });
const sailMat = (c = 0xf7efd8) => new THREE.MeshToonMaterial({ color: c, gradientMap: mkMat(0xffffff).gradientMap, side: THREE.DoubleSide });
export const mkShip = (par, x, z, s, o = {}) => {
  const sg = new THREE.Group(); sg.position.set(x, 0, z); sg.rotation.y = o.ry ?? 0; sg.scale.setScalar(s); par.add(sg);
  const sh = new THREE.Shape(); sh.moveTo(-6.2, 2.1); sh.lineTo(-5.4, 0); sh.lineTo(4.4, 0); sh.lineTo(6.8, 2.3); sh.lineTo(5.8, 2.3); sh.lineTo(-6.2, 2.1);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: false }); hg.translate(0, 0, -1.6);
  const hm = mkMat(o.hull ?? 0x4a3226); addM(sg, hg, hm, [0, 0.0, 0], { ink: 0.05 });
  addM(sg, box(12.2, 0.3, 3.35), mkMat(o.stripe ?? 0xf3e7c6), [0.3, 1.15, 0], { ink: 0.025 });
  addM(sg, box(12.2, 0.16, 3.5), mkMat(0x7a5638), [0.3, 2.3, 0], { ink: 0.02 });
  const masts = o.masts ?? [-2.6, 2.4], parts = {};
  masts.forEach((mx, i) => { addM(sg, cyl(0.13, 0.18, 9.5, 8), mkMat(0x5a3a26), [mx, 6.6, 0], { ink: 0.02 }); addM(sg, box(0.12, 0.12, 4.2), mkMat(0x5a3a26), [mx, 9.0, 0], { ink: 0.02 }); addM(sg, box(0.12, 0.12, 3.6), mkMat(0x5a3a26), [mx, 6.0, 0], { ink: 0.02 });
    if (o.sails !== false) { const up = addM(sg, box(0.1, 2.4, 3.9), sailMat(), [mx + 0.08, 7.55, 0], { ink: 0.03 }), lo = addM(sg, box(0.1, 2.9, 3.4), sailMat(), [mx + 0.08, 4.45, 0], { ink: 0.03 }); (parts.sails ||= []).push(up, lo); } });
  if (o.sails !== false) { const jib = addM(sg, new THREE.ConeGeometry(2.0, 5.5, 3), sailMat(0xefe4c4), [7.6, 5.0, 0], { rot: [0, 0, -0.3], ink: 0.03 }); jib.scale.z = 0.05; (parts.sails ||= []).push(jib); }
  addM(sg, cyl(0.08, 0.1, 4.6, 6), mkMat(0x5a3a26), [7.0, 3.2, 0], { rot: [0, 0, -1.2], ink: 0.02 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.1), new THREE.MeshBasicMaterial({ color: o.flag ?? 0xd5343b, side: THREE.DoubleSide })); fl.position.set(masts[masts.length - 1] + 0.9, 10.2, 0); sg.add(fl); parts.flag = fl;
  parts.g = sg; return parts;
};
export const mkBoat = (par, x, y, z, s = 1) => {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); par.add(g); const wd = mkMat(0x8a5a32);
  addM(g, box(2.4, 0.2, 1.0), wd, [0, 0.1, 0], { ink: 0.025 }); for (const sz of [-1, 1]) addM(g, box(2.6, 0.5, 0.1), wd, [0, 0.4, sz * 0.5], { ink: 0.025 });
  addM(g, box(0.1, 0.5, 1.0), wd, [-1.25, 0.4, 0], { ink: 0.025 }); addM(g, box(0.1, 0.5, 1.0), wd, [1.25, 0.4, 0], { ink: 0.025 });
  for (const sz of [-1, 1]) addM(g, cyl(0.04, 0.04, 2.0, 5), mkMat(0xc9a36a), [0.1, 0.7, sz * 0.9], { rot: [Math.PI / 2 - 0.3 * sz, 0, 0.25], ink: 0.015 });
  return g;
};
export const buildSea = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {};
  o.sea = addM(g, new THREE.PlaneGeometry(700, 700), mkMat(waveTex), [0, -0.05, -150], { rot: [-Math.PI / 2, 0, 0], ink: false });
  o.mary = mkShip(g, 0, -22, 1.3, {}); o.dei = mkShip(g, -42, -8, 1.0, { hull: 0x2d4a3a, stripe: 0xe8c45a, flag: 0x2a4f9e, masts: [-2.8, 0, 2.8], ry: 0.45 });
  o.boat = mkBoat(g, -10, 0, -3, 1.0);
  for (let i = 0; i < 4; i++) addM(g, new THREE.SphereGeometry(40 + i * 8, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mkMat(0x7ca3b8), [-120 + i * 80, -2, -240], { ink: 0.05 });
  o.g = g; return o;
};
const barrel = (g, x, y, z, s = 1, rot) => { const b = new THREE.Group(); b.position.set(x, y, z); if (rot) b.rotation.set(...rot); g.add(b); addM(b, cyl(0.5 * s, 0.5 * s, 1.1 * s, 12), mkMat(0xa86f3a), [0, 0.55 * s, 0], { ink: 0.03 }); for (const dy of [0.2, 0.9]) addM(b, cyl(0.52 * s, 0.52 * s, 0.07 * s, 12), mkMat(0x3a3036), [0, dy * s, 0], { ink: 0.01 }); return b; };
export const buildDeck = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {}, wd = mkMat(0x8a5a32), wd2 = mkMat(0x6e4426), rope = mkMat(0xd8c08a);
  o.sea = addM(g, new THREE.PlaneGeometry(600, 600), mkMat(waveTex), [0, -2.0, -100], { rot: [-Math.PI / 2, 0, 0], ink: false });
  addM(g, box(8.4, 0.3, 24), mkMat(plankTex), [0, -0.15, -4], { ink: 0.03 });
  for (const sx of [-1, 1]) { addM(g, box(0.25, 1.1, 24), wd2, [sx * 4.1, 0.55, -4], { ink: 0.03 }); addM(g, box(0.4, 0.14, 24), wd, [sx * 4.1, 1.15, -4], { ink: 0.025 }); for (let i = 0; i < 9; i++) addM(g, box(0.18, 1.5, 0.18), wd, [sx * 4.1, 0.85, 6 - i * 3], { ink: 0.02 }); }
  addM(g, box(8.4, 1.1, 0.25), wd2, [0, 0.55, -16], { ink: 0.03 });
  addM(g, cyl(0.38, 0.45, 12, 10), mkMat(0x5a3a26), [0, 6, -7], { ink: 0.03 }); addM(g, box(0.2, 0.2, 7), mkMat(0x5a3a26), [0, 3.3, -7], { ink: 0.02 });
  o.sail = addM(g, box(6.6, 3.3, 0.12), sailMat(), [0, 6.6, -6.7], { ink: 0.03 }); o.sail2 = addM(g, box(6.2, 3.0, 0.12), sailMat(), [0, 10.2, -6.7], { ink: 0.03 });
  // open hatch
  addM(g, box(2.4, 0.25, 2.6), wd, [0.2, 0.12, -4.4], { ink: 0.03 }); addM(g, box(1.8, 0.28, 2.0), mkMat(0x120c14), [0.2, 0.14, -4.4], { ink: false }); addM(g, box(2.0, 0.1, 2.2), wd2, [-3.0, 0.08, -4.4], { rot: [0, 0.3, 0.12], ink: 0.02 });
  // cabin + wheel
  const cab = new THREE.Group(); cab.position.set(0, 0, -14.3); g.add(cab); addM(cab, box(5.2, 2.5, 3.0), mkMat(wallTex), [0, 1.25, 0]); addM(cab, box(5.5, 0.2, 3.3), wd, [0, 2.6, 0], { ink: 0.025 }); addM(cab, box(1.1, 1.9, 0.12), mkMat(0x2a1c18), [0, 1.0, 1.55], { ink: 0.02 }); o.door = cab.children[cab.children.length - 1];
  for (const sx of [-1, 1]) addM(cab, box(0.8, 0.7, 0.1), mkMat(0xbfe8f2), [sx * 1.7, 1.5, 1.55], { ink: 0.02 });
  addM(g, cyl(0.06, 0.06, 1.2, 6), mkMat(0x4a3022), [0, 0.6, -10.5], { ink: 0.015 }); o.wheel = new THREE.Group(); o.wheel.position.set(0, 1.4, -10.5); g.add(o.wheel); addM(o.wheel, new THREE.TorusGeometry(0.7, 0.07, 6, 18), wd, [0, 0, 0], { ink: 0.02 }); for (let i = 0; i < 4; i++) addM(o.wheel, box(1.7, 0.08, 0.08), wd, [0, 0, 0], { rot: [0, 0, (i * Math.PI) / 4], ink: 0.01 });
  // deck clutter: barrels, chest, rope coil, lantern
  barrel(g, -3.2, 0, 3, 1.0); barrel(g, -3.2, 0, 4.3, 1.0); barrel(g, -2.6, 0, 3.6, 0.9); barrel(g, 3.2, 0, 1.0, 1.0); barrel(g, 3.2, 0, 2.3, 1.0);
  addM(g, box(1.3, 0.8, 0.8), mkMat(0x6a4630), [2.6, 0.4, 4.4], { ink: 0.03 }); addM(g, box(1.34, 0.12, 0.84), mkMat(0x3a3036), [2.6, 0.82, 4.4], { ink: 0.015 });
  addM(g, new THREE.TorusGeometry(0.5, 0.17, 6, 14), rope, [-2.4, 0.17, -4.2], { rot: [Math.PI / 2, 0, 0], ink: 0.02 });
  o.lantern = addM(g, cyl(0.16, 0.2, 0.4, 8), new THREE.MeshBasicMaterial({ color: 0xffd36a }), [-1.4, 2.0, -12.7], { ink: 0.02 });
  // davits (empty boat spot)
  for (const sz of [-12.6, -9.0]) { addM(g, cyl(0.07, 0.07, 2.9, 6), mkMat(0x3a3036), [3.5, 1.5, sz], { ink: 0.015 }); addM(g, box(1.4, 0.08, 0.08), mkMat(0x3a3036), [4.1, 2.9, sz], { ink: 0.015 }); o["rope" + sz] = addM(g, cyl(0.025, 0.025, 1.7, 5), rope, [4.7, 2.0, sz], { ink: 0.01 }); }
  addM(g, box(1.5, 0.02, 4.0), mkMat(0xa57547), [3.5, 0.01, -10.8], { ink: false }); // pale outline where the boat sat
  // HOLD (x = +40)
  const hd = new THREE.Group(); hd.position.set(40, 0, 0); g.add(hd);
  addM(hd, box(8, 4, 16), new THREE.MeshToonMaterial({ color: 0x6e4a2c, side: THREE.BackSide, gradientMap: mkMat(0xffffff).gradientMap }), [0, 2, -6], { ink: false });
  addM(hd, box(7.8, 0.2, 15.8), mkMat(plankTex), [0, 0, -6], { ink: 0.02 });
  o.barrels = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) { o.barrels.push(barrel(hd, -1.25 + r * 2.5, 0.1, 0.5 - c * 1.7, 1.0)); if (c % 2 === 0) o.barrels.push(barrel(hd, -1.25 + r * 2.5, 1.2, 0.5 - c * 1.7, 0.95)); }
  // CABIN (x = -40)
  const cb = new THREE.Group(); cb.position.set(-40, 0, 0); g.add(cb);
  addM(cb, box(6, 3, 8), new THREE.MeshToonMaterial({ color: 0xc09a68, side: THREE.BackSide, gradientMap: mkMat(0xffffff).gradientMap }), [0, 1.5, -3], { ink: false });
  addM(cb, box(5.8, 0.2, 7.8), mkMat(plankTex), [0, 0, -3], { ink: 0.02 });
  addM(cb, box(2.2, 0.12, 1.2), wd, [-0.4, 1.0, -5.0], { ink: 0.025 }); for (const [dx, dz] of [[-1.3, -4.5], [0.5, -4.5], [-1.3, -5.5], [0.5, -5.5]]) addM(cb, box(0.1, 1.0, 0.1), wd2, [dx, 0.5, dz], { ink: 0.015 });
  addM(cb, cyl(0.14, 0.12, 0.16, 10), mkMat(0xf6f1e6), [-0.9, 1.14, -5.0], { ink: 0.015 }); addM(cb, box(0.4, 0.06, 0.28), mkMat(0xb02f3a), [0.1, 1.09, -4.9], { ink: 0.012 }); addM(cb, cyl(0.04, 0.04, 0.4, 6), mkMat(0x6a4630), [0.7, 1.1, -5.2], { rot: [0, 0, 1.3], ink: 0.01 });
  addM(cb, box(2.4, 0.5, 1.2), mkMat(0xd8c8a8), [-1.9, 0.4, -6.4], { ink: 0.025 }); addM(cb, box(1.6, 0.14, 0.9), mkMat(0xc0353a), [-1.9, 0.72, -6.4], { ink: 0.015 });
  addM(cb, new THREE.SphereGeometry(0.22, 10, 8), mkMat(0xf6d9b8), [1.6, 0.65, -4.2], { ink: 0.015 }); addM(cb, box(0.34, 0.5, 0.2), mkMat(0xf08ab0), [1.6, 0.3, -4.2], { ink: 0.015 });
  addM(cb, box(0.5, 0.2, 0.3), mkMat(0x241726), [1.0, 0.1, -3.2], { ink: 0.015 }); addM(cb, box(0.5, 0.2, 0.3), mkMat(0x241726), [1.0, 0.1, -2.7], { ink: 0.015 });
  o.g = g; return o;
};
