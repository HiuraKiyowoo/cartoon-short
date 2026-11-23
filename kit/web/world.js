import * as THREE from "three";
const INKC = 0x150b17;
export const grad3 = (() => { const t = new THREE.DataTexture(new Uint8Array([95, 170, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const R = (s) => { let x = s * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const texCache = new Map();
export const cvTex = (key, w, h, fn, rx = 1, ry = 1) => {
  const k = `${key}|${rx}|${ry}`; if (texCache.has(k)) return texCache.get(k);
  const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4;
  texCache.set(k, t); return t;
};
const shadeC = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return "#" + c.getHexString(); };
// painters: flat colour, dark seams (painted-in)
const P = {
  stone: (base) => (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r = R(3); const rows = 6;
    for (let y = 0; y < rows; y++) { const yy = (y * h) / rows; let x = (y % 2) * 40; while (x < w) { const bw = 70 + r() * 40; g.fillStyle = shadeC(base, 0.9 + r() * 0.2); g.fillRect(x + 2, yy + 2, bw - 4, h / rows - 4); x += bw; } }
    g.strokeStyle = shadeC(base, 0.5); g.lineWidth = 4; for (let y = 0; y <= rows; y++) { g.beginPath(); g.moveTo(0, (y * h) / rows); g.lineTo(w, (y * h) / rows); g.stroke(); } },
  plain: (base) => (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r = R(5); for (let i = 0; i < 30; i++) { g.fillStyle = shadeC(base, 0.92 + r() * 0.12); g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 40, 10 + r() * 20, 0, 0, 7); g.fill(); } },
  grass: (base) => (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r = R(9); for (let i = 0; i < 160; i++) { g.strokeStyle = shadeC(base, 0.75 + r() * 0.5); g.lineWidth = 3; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 8, y - 10 - r() * 10); g.stroke(); } },
  checker: (a, b) => (g, w, h) => { const n = 4; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect((i * w) / n, (j * h) / n, w / n, h / n); } g.strokeStyle = shadeC(a, 0.45); g.lineWidth = 5; g.strokeRect(0, 0, w, h); for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo((i * w) / n, 0); g.lineTo((i * w) / n, h); g.moveTo(0, (i * h) / n); g.lineTo(w, (i * h) / n); g.stroke(); } },
  house: (base) => (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = "#4a3a52"; for (const x of [0.2, 0.6]) { g.fillRect(w * x, h * 0.2, w * 0.18, h * 0.28); g.fillStyle = shadeC(base, 0.7); g.fillRect(w * x - 5, h * 0.2 + h * 0.28, w * 0.18 + 10, 8); g.fillStyle = "#4a3a52"; } g.fillStyle = "#6e4a30"; g.fillRect(w * 0.4, h * 0.62, w * 0.2, h * 0.38); },
  arches: (base) => (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const rows = 3, cols = 8; g.fillStyle = "#3a2f45"; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = (c + 0.5) * (w / cols), y = (r + 0.62) * (h / rows), aw = w / cols * 0.28, ah = h / rows * 0.5; g.beginPath(); g.moveTo(x - aw, y + ah / 2); g.lineTo(x - aw, y - ah * 0.1); g.arc(x, y - ah * 0.1, aw, Math.PI, 0); g.lineTo(x + aw, y + ah / 2); g.fill(); } g.strokeStyle = shadeC(base, 0.55); g.lineWidth = 5; for (let r = 1; r < rows; r++) { g.beginPath(); g.moveTo(0, (r * h) / rows); g.lineTo(w, (r * h) / rows); g.stroke(); } },
  apse: () => (g, w, h) => { g.fillStyle = "#c8a24a"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9d28a"; g.beginPath(); g.arc(w / 2, h * 0.42, w * 0.3, 0, 7); g.fill(); g.strokeStyle = "#7a5a1e"; g.lineWidth = 8; g.stroke(); g.fillStyle = "#b02f3a"; g.fillRect(w / 2 - 14, h * 0.2, 28, h * 0.44); g.fillRect(w / 2 - 80, h * 0.34, 160, 28); g.strokeStyle = "#7a5a1e"; g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w / 2, h * 0.42, w * (0.34 + i * 0.015), 0, 7); g.stroke(); } },
};
export const mkMat = (c, o = {}) => {
  if (typeof c === "string" || typeof c === "number") return new THREE.MeshToonMaterial({ color: c, gradientMap: grad3, ...o });
  return new THREE.MeshToonMaterial({ map: c, color: 0xffffff, gradientMap: grad3, ...o });
};
const inkMats = new Map();
const inkMat = (t) => { if (inkMats.has(t)) return inkMats.get(t); const m = new THREE.MeshBasicMaterial({ color: INKC, side: THREE.BackSide, fog: true });
  m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `vec3 transformed = position + normalize(normal) * ${t.toFixed(4)};`); }; m.customProgramCacheKey = () => "ink" + t; inkMats.set(t, m); return m; };
export const addM = (par, geo, mat, pos = [0, 0, 0], o = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(...pos); if (o.rot) m.rotation.set(...o.rot); if (o.scale) m.scale.set(...o.scale);
  if (o.ink !== false && o.ink !== undefined || o.ink === undefined) { if (o.ink !== false) { const im = new THREE.Mesh(geo, inkMat(o.ink || 0.035)); m.add(im); } }
  par.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 16, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
export const T = (kind, a, b, rx = 1, ry = 1) => cvTex(kind + a + (b || ""), 256, 256, P[kind](a, b), rx, ry);

// ---------------------------------------------------------------- GRAVEYARD
export const buildGrave = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(11), o = {};
  addM(g, new THREE.CircleGeometry(90, 40), mkMat(T("grass", "#2f5240", null, 30, 30)), [0, 0, 0], { rot: [-Math.PI / 2, 0, 0], ink: false });
  // sarcophagus
  const sar = new THREE.Group(); sar.position.set(1.7, 0, -1.6); g.add(sar);
  addM(sar, box(2.5, 0.85, 1.15), mkMat(T("stone", "#b9b2bb", null, 2, 1)), [0, 0.425, 0]);
  addM(sar, box(2.2, 0.02, 0.85), mkMat(0x0f0b14), [0, 0.86, 0], { ink: false });
  o.lid = addM(sar, box(2.64, 0.22, 1.28), mkMat(T("stone", "#c9c2cb", null, 2, 1)), [0, 0.96, 0]);
  o.sar = sar;
  // tombstones
  for (let i = 0; i < 22; i++) { const x = (r() - 0.5) * 30, z = -4 - r() * 18; if (Math.abs(x - 1.7) < 2.4 && z > -6) continue; const s = 0.7 + r() * 0.8;
    const tg = new THREE.Group(); tg.position.set(x, 0, z); tg.rotation.y = (r() - 0.5) * 0.5; tg.rotation.z = (r() - 0.5) * 0.12; g.add(tg);
    addM(tg, box(0.8 * s, 1.1 * s, 0.22), mkMat(T("stone", "#9a98a6", null, 1, 1)), [0, 0.55 * s, 0]);
    addM(tg, cyl(0.4 * s, 0.4 * s, 0.22, 14), mkMat(T("stone", "#9a98a6", null, 1, 1)), [0, 1.1 * s, 0], { rot: [Math.PI / 2, 0, 0] });
    if (r() > 0.5) { addM(tg, box(0.1, 0.5 * s, 0.05), mkMat(0x6d6a7a), [0, 1.05 * s, 0.13], { ink: 0.01 }); addM(tg, box(0.32 * s, 0.1, 0.05), mkMat(0x6d6a7a), [0, 1.12 * s, 0.13], { ink: 0.01 }); } }
  // iron fence
  for (let i = -16; i <= 16; i++) { const x = i * 0.7; addM(g, cyl(0.03, 0.03, 1.5, 6), mkMat(0x2a2432), [x, 0.75, -9.5], { ink: 0.015 }); addM(g, cyl(0, 0.07, 0.22, 6), mkMat(0x2a2432), [x, 1.6, -9.5], { ink: 0.015 }); }
  addM(g, box(23, 0.07, 0.07), mkMat(0x2a2432), [0, 1.2, -9.5], { ink: 0.015 }); addM(g, box(23, 0.07, 0.07), mkMat(0x2a2432), [0, 0.35, -9.5], { ink: 0.015 });
  // crypt
  addM(g, box(7, 5, 3), mkMat(T("stone", "#7f7d92", null, 3, 2)), [-6.5, 2.5, -24]);
  addM(g, box(2.2, 3, 0.3), mkMat(0x0d0912), [-6.5, 1.5, -22.4], { ink: false });
  // cypress trees
  for (let i = 0; i < 12; i++) { const x = (r() - 0.5) * 50, z = -12 - r() * 18, s = 0.8 + r() * 0.9; addM(g, cyl(0.12 * s, 0.18 * s, 1, 6), mkMat(0x4a3426), [x, 0.5, z], { ink: 0.02 });
    addM(g, new THREE.ConeGeometry(1 * s, 6 * s, 8), mkMat(0x1f3a32), [x, 3.5 * s, z]); }
  // moon + stars
  const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff3c7, fog: false })); moon.position.set(-9, 13, -60); g.add(moon); o.moon = moon;
  const pts = []; for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, e = 0.15 + r() * 1.2; pts.push(Math.cos(a) * Math.cos(e) * 120, Math.sin(e) * 120, -Math.abs(Math.sin(a)) * Math.cos(e) * 120 - 20); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, fog: false, sizeAttenuation: false })));
  o.g = g; return o;
};
// ---------------------------------------------------------------- ROME
export const buildRome = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(21), o = {};
  addM(g, new THREE.CircleGeometry(120, 40), mkMat(T("plain", "#d8b777", null, 30, 30)), [0, 0, 0], { rot: [-Math.PI / 2, 0, 0], ink: false });
  addM(g, new THREE.PlaneGeometry(200, 7), mkMat(0x5fa4d8), [0, 0.02, 22], { rot: [-Math.PI / 2, 0, 0], ink: false });
  const cols = ["#f0d9a8", "#e8b98a", "#f2c9a0", "#e9d0b0", "#d99a7a"];
  for (let i = 0; i < 70; i++) { const x = (r() - 0.5) * 70, z = -22 + r() * 34; if (Math.abs(x) < 9 && z < 4 && z > -16) continue; if (z > 17 && z < 27) continue; const w = 2 + r() * 1.8, h = 2 + r() * 2.2, d = 2 + r() * 1.8;
    const col = cols[(r() * 5) | 0]; const hm = mkMat(T("house", col, null, 1, 1));
    addM(g, box(w, h, d), hm, [x, h / 2, z]); const c = new THREE.ConeGeometry(Math.max(w, d) * 0.78, 1.1, 4); addM(g, c, mkMat(0xc4573b), [x, h + 0.55, z], { rot: [0, Math.PI / 4, 0] }); }
  // basilica with dome
  addM(g, box(8, 4.6, 10), mkMat(T("stone", "#efe2c4", null, 3, 2)), [0, 2.3, -6]);
  addM(g, new THREE.SphereGeometry(2.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mkMat(0xd6a94a), [0, 4.6, -6]); addM(g, cyl(2.6, 2.6, 0.8, 20), mkMat(T("stone", "#efe2c4", null, 2, 1)), [0, 4.9, -6]);
  addM(g, box(0.15, 1.1, 0.15), mkMat(0xd6a94a), [0, 9.0, -6], { ink: 0.02 }); addM(g, box(0.6, 0.15, 0.15), mkMat(0xd6a94a), [0, 8.9, -6], { ink: 0.02 });
  addM(g, box(2.6, 4.2, 1.2), mkMat(T("stone", "#f3e8cd", null, 1, 2)), [0, 2.1, -0.8]);
  addM(g, new THREE.ConeGeometry(1.9, 1.2, 4), mkMat(0xc4573b), [0, 4.8, -0.8], { rot: [0, Math.PI / 4, 0] });
  // colosseum
  addM(g, cyl(6.4, 6.9, 6.6, 36, true), new THREE.MeshToonMaterial({ map: T("arches", "#dcc08c", null, 6, 1), gradientMap: grad3, side: THREE.DoubleSide }), [18, 3.3, -8]);
  // hills + cypress
  for (let i = 0; i < 8; i++) addM(g, new THREE.SphereGeometry(18 + r() * 10, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mkMat(0x7fa86a), [-70 + i * 22, -1, -60 - r() * 20], { ink: 0.12 });
  for (let i = 0; i < 18; i++) { const x = (r() - 0.5) * 60, z = -26 + r() * 30; addM(g, new THREE.ConeGeometry(0.7, 4.5, 8), mkMat(0x2f5a3a), [x, 2.3, z], { ink: 0.03 }); }
  const sun = new THREE.Mesh(new THREE.SphereGeometry(7, 20, 12), new THREE.MeshBasicMaterial({ color: 0xfff0b8, fog: false })); sun.position.set(-34, 10, -90); g.add(sun);
  o.g = g; return o;
};
// ---------------------------------------------------------------- BASILICA
export const buildHall = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(31), o = {};
  addM(g, box(14, 0.2, 30), mkMat(T("checker", "#d8cfc0", "#9a8f86", 3, 7)), [0, -0.1, 1], { ink: false });
  addM(g, box(2.4, 0.03, 20), mkMat(0xb02f3a), [0, 0.02, 3.5], { ink: false });
  for (const sx of [-1, 1]) { addM(g, box(0.4, 9, 30), mkMat(T("stone", "#d7c8a8", null, 4, 3)), [sx * 6.2, 4.5, 1], { ink: false });
    for (let i = 0; i < 6; i++) { const z = 9 - i * 4.2; addM(g, new THREE.PlaneGeometry(1.6, 4.2), new THREE.MeshBasicMaterial({ color: 0xfff1c0, fog: false }), [sx * 5.95, 5.6, z], { rot: [0, -sx * Math.PI / 2, 0], ink: false });
      addM(g, new THREE.CircleGeometry(0.8, 14, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xfff1c0, fog: false }), [sx * 5.95, 7.7, z], { rot: [0, -sx * Math.PI / 2, 0], ink: false });
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.7, 8, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
      cone.position.set(sx * 3.4, 3.4, z); cone.rotation.z = sx * 0.55; g.add(cone); (o.shafts ||= []).push(cone); }
    for (let i = 0; i < 7; i++) { const z = 10 - i * 3.6; addM(g, cyl(0.38, 0.45, 8, 14), mkMat(T("stone", "#e6d9bb", null, 1, 4)), [sx * 3.3, 4, z]); addM(g, box(1.1, 0.35, 1.1), mkMat(0xcdbf9c), [sx * 3.3, 0.18, z]); addM(g, box(1.1, 0.35, 1.1), mkMat(0xcdbf9c), [sx * 3.3, 8.1, z]); } }
  addM(g, box(14, 0.3, 30), mkMat(0x6b4a34), [0, 9.2, 1], { ink: false });
  for (let i = 0; i < 8; i++) addM(g, box(13, 0.4, 0.5), mkMat(0x4f3626), [0, 8.9, 12 - i * 3.5]);
  addM(g, box(14, 9, 0.4), mkMat(T("apse"), null, null, 1, 1), [0, 4.5, -12.5], { ink: false });
  addM(g, box(5.4, 0.3, 3.6), mkMat(T("stone", "#cabba0", null, 2, 1)), [0, 0.15, -9.6]); addM(g, box(4.2, 0.3, 2.6), mkMat(T("stone", "#d8c9ac", null, 2, 1)), [0, 0.45, -10]);
  const gold = mkMat(0xd9ad2f);
  addM(g, box(1.3, 0.5, 1.0), gold, [0, 0.85, -10.2]); addM(g, box(1.3, 2.4, 0.22), gold, [0, 1.8, -10.75]); addM(g, new THREE.ConeGeometry(0.85, 0.9, 4), gold, [0, 3.35, -10.75], { rot: [0, Math.PI / 4, 0] });
  for (const sx of [-1, 1]) { addM(g, box(0.18, 0.7, 1.0), gold, [sx * 0.7, 1.25, -10.2]); addM(g, cyl(0.1, 0.1, 2.6, 8), mkMat(0x3b3140), [sx * 2.1, 1.3, -9.2]); (o.flames ||= []).push([sx * 2.1, 2.9, -9.2]); }
  addM(g, new THREE.PlaneGeometry(14, 9), new THREE.MeshBasicMaterial({ visible: false }), [0, 4, 14.5]);
  o.g = g; return o;
};
// ---------------------------------------------------------------- JAIL
export const buildJail = (par) => {
  const g = new THREE.Group(); par.add(g); const o = {};
  const st = mkMat(T("stone", "#5d5a6e", null, 3, 2));
  addM(g, box(9, 0.2, 9), mkMat(T("stone", "#4c4a5c", null, 3, 3)), [0, -0.1, 0], { ink: false });
  addM(g, box(9, 5, 0.4), st, [0, 2.5, -3.2], { ink: false }); addM(g, box(0.4, 5, 9), st, [-4.2, 2.5, 0], { ink: false }); addM(g, box(0.4, 5, 9), st, [4.2, 2.5, 0], { ink: false }); addM(g, box(9, 0.3, 9), mkMat(0x2b2833), [0, 5, 0], { ink: false });
  addM(g, box(1.0, 1.3, 0.1), new THREE.MeshBasicMaterial({ color: 0xbcd4ff, fog: false }), [-1.6, 3.2, -2.98], { ink: 0.02 });
  for (const x of [-0.25, 0, 0.25]) addM(g, cyl(0.03, 0.03, 1.3, 6), mkMat(0x1a1620), [-1.6 + x, 3.2, -2.9], { ink: 0.01 });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.4, 4.8, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xbcd4ff, transparent: true, opacity: 0.11, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); beam.position.set(-1.1, 1.6, -1.9); beam.rotation.z = 0.35; beam.rotation.x = 0.4; g.add(beam);
  addM(g, box(1.6, 0.35, 1.0), mkMat(0xd9bd5a), [1.9, 0.18, -2.2]);
  const gate = new THREE.Group(); g.add(gate); o.gate = gate;
  for (let i = 0; i <= 14; i++) addM(gate, cyl(0.055, 0.055, 3.2, 8), mkMat(0x262130), [-1.75 + i * 0.25, 1.6, 0], { ink: 0.02 });
  for (const y of [0.35, 1.6, 2.95]) addM(gate, box(3.9, 0.12, 0.12), mkMat(0x262130), [0, y, 0], { ink: 0.02 });
  o.g = g; return o;
};
// ---------------------------------------------------------------- SCROLL desk (backdrop)
export const buildDesk = (par) => {
  const g = new THREE.Group(); par.add(g);
  const bg = cvTex("damask", 512, 512, (c, w, h) => { c.fillStyle = "#5b2f3a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#7a4452"; c.lineWidth = 6; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.beginPath(); c.ellipse(64 + i * 128, 64 + j * 128, 34, 54, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(i * 128, j * 128 + 64); c.lineTo(i * 128 + 128, j * 128 + 64); c.stroke(); } }, 3, 4);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(22, 30), new THREE.MeshBasicMaterial({ map: bg })); m.position.z = -0.6; g.add(m);
  const sc = document.createElement("canvas"); sc.width = 1024; sc.height = 1536; const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const scroll = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.3), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); g.add(scroll);
  return { g, scroll, sc, tex };
};
