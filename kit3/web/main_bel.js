import * as THREE from "three";
import { drawAny, headGeo, CW, CH } from "./cast_bel.js";
import { drawFx4 as drawFx2 } from "./fx4.js";
import { Pen, INK } from "./toon.ts";
import { addM, mkMat, buildDesk } from "./world.js";
import { buildNusantara } from "./world_nus.js";
import { buildKanal } from "./world_kanal.js";
import { buildKelas, buildPeta } from "./world_int.js";

const Q = new URLSearchParams(location.search), W = +(Q.get("w") || 1080), H = Math.round((W * 16) / 9);
const FPS = 30, TOTAL = 1451, SU = 0.00216;
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (x) => { x = cl(x); return x * x * x * (x * (6 * x - 15) + 10); };
const bk = (x) => { x = cl(x); const c = 2.0; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t, lv = (A, B, t) => A.map((v, i) => lerp(v, B[i], t));
const sec = (s) => Math.round(s * FPS);
const ramp = (f, a, b) => cl((f - a) / (b - a));

// ---------------------------------------------------------------- renderer / scene
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
renderer.setSize(W, H); renderer.setPixelRatio(1); document.body.appendChild(renderer.domElement); renderer.autoClear = false;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 900);
const hemi = new THREE.HemisphereLight(0xffffff, 0x555555, 1), sun = new THREE.DirectionalLight(0xffffff, 1); scene.add(hemi, sun, sun.target);
// panggung (playbook 6): dijauhkan satu sama lain supaya kamera satu panggung tidak melihat panggung lain
const ORG = { N: [-260, 0, 0], K: [0, 0, -170], I: [260, 0, 0], S: [0, 0, 140] };
const grp = (k) => { const g = new THREE.Group(); g.position.set(...ORG[k]); scene.add(g); return g; };
const gN = grp("N"), gK = grp("K"), gI = grp("I"), gS = grp("S");
const WN = buildNusantara(gN), WK = buildKanal(gK), WI = buildKelas(gI), WP = buildPeta(gI, 60), WS = buildDesk(gS);
const stages = { N: gN, K: gK, I: gI, S: gS };

const LOOK = {
  tropik: { bg: ["#3f8fc4", "#dff0f6"], fog: 0xcfe4ee, fn: [60, 300], hemi: [0xfff6e0, 0x8fb0a0, 1.2], dir: [0xfff0d0, 1.5, [-6, 10, 7]], card: 0xfff8ee },
  hujan: { bg: ["#4a5d72", "#b8c4cc"], fog: 0xa8b6c0, fn: [30, 190], hemi: [0xe4eef6, 0x6a7a8a, 1.05], dir: [0xdce6f0, 1.0, [-5, 9, 6]], card: 0xeef4f8 },
  senja: { bg: ["#3a4a78", "#f2a868"], fog: 0xcf9a80, fn: [40, 220], hemi: [0xffdcc0, 0x6a6488, 1.1], dir: [0xffbe80, 1.35, [-6, 8, 7]], card: 0xffe6d4 },
  kelas: { bg: ["#5a5344", "#a89878"], fog: 0x8a8070, fn: [8, 30], hemi: [0xfff0d8, 0x6a6050, 1.15], dir: [0xffeec8, 1.05, [-2, 6, 6]], card: 0xfff2e0 },
  peta: { bg: ["#3a2a22", "#6b4c34"], fog: 0x4a3426, fn: [8, 34], hemi: [0xffdc9a, 0x6a4a30, 1.25], dir: [0xffcf88, 1.05, [-2, 7, 6]], card: 0xffe8c8 },
  paper: { bg: ["#3a1f28", "#5b2f3a"], fog: 0x3a1f28, fn: [40, 90], hemi: [0xffffff, 0xaaaaaa, 1], dir: [0xffffff, 0.2, [0, 0, 5]], card: 0xffffff },
};
const bgTex = {}; for (const k in LOOK) { const c = document.createElement("canvas"); c.width = 4; c.height = 256; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, LOOK[k].bg[0]); gr.addColorStop(1, LOOK[k].bg[1]); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; bgTex[k] = t; }
let curLook = null, cardTint = new THREE.Color(1, 1, 1);
const setLook = (k) => { const L = LOOK[k]; scene.background = bgTex[k]; scene.fog = new THREE.Fog(L.fog, L.fn[0], L.fn[1]); hemi.color.setHex(L.hemi[0]); hemi.groundColor.setHex(L.hemi[1]); hemi.intensity = L.hemi[2]; sun.color.setHex(L.dir[0]); sun.intensity = L.dir[1]; cardTint.setHex(L.card); curLook = k; };

// ---------------------------------------------------------------- card pools
const PGEO = new THREE.PlaneGeometry(600 * SU, 1000 * SU); PGEO.translate(0, 475 * SU, 0);
const UGEO = new THREE.PlaneGeometry(1, 1), FGEO = new THREE.PlaneGeometry(1, 1); FGEO.rotateX(-Math.PI / 2);
const texCache = new Map();
const quant = (o) => JSON.stringify(o, (k, v) => (typeof v === "number" ? Math.round(v * 10) / 10 : v));
const getTex = (key, w, h, draw) => {
  let e = texCache.get(key); if (e) { texCache.delete(key); texCache.set(key, e); return e.tex; }
  if (texCache.size > 140) { const [k0, e0] = texCache.entries().next().value; e0.tex.dispose(); texCache.delete(k0); }
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; e = { cv, tex }; texCache.set(key, e); return tex;
};
const mkCard = (geo, o) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: !!o.tr, alphaTest: o.at ?? 0, alphaToCoverage: !o.tr, depthWrite: !o.tr, side: THREE.DoubleSide, fog: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending })); m.visible = false; scene.add(m); return m; };
const pools = { p: [], f: [], b: [] }; const used = { p: 0, f: 0, b: 0 };
const grab = (k, geo, o) => { const a = pools[k]; if (used[k] >= a.length) a.push(mkCard(geo, o)); return a[used[k]++]; };
let CAMP = new THREE.Vector3();
const yawTo = (x, z) => Math.atan2(CAMP.x - x, CAMP.z - z);
let curStage = "N";
const OF = () => ORG[curStage];
const personImpl = (o, x, y, z, s = 1, flip = false, rz = 0, blob = true) => {
  const key = "P" + quant(o), tex = getTex(key, CW, CH, (cv) => drawAny(cv, o)); const m = grab("p", PGEO, { at: 0.5 });
  const [ox, oy, oz] = OF(); m.visible = true; m.material.map = tex; m.material.color.copy(cardTint); m.material.needsUpdate = false;
  m.position.set(ox + x, oy + y, oz + z); m.rotation.set(0, yawTo(ox + x, oz + z), 0); m.rotateZ(rz); m.scale.set(flip ? -s : s, s, 1);
  if (blob && y < 0.3) { const b = grab("b", FGEO, { tr: true }); b.visible = true; b.material.map = getTex("blob", 256, 256, (cv) => drawFx2(cv, "blob", 0)); b.position.set(ox + x, oy + y + 0.012, oz + z); b.scale.set(1.0 * s, 1, 0.5 * s); b.rotation.y = 0; }
};
const fxImpl = (kind, t, x, y, z, s = 1, rz = 0, add = false) => {
  const key = "F" + kind + Math.round(t * 16), tex = getTex(key, 256, 256, (cv) => drawFx2(cv, kind, t)); const m = grab("f", UGEO, { tr: true, add });
  const [ox, oy, oz] = OF(); m.visible = true; m.material.map = tex; m.material.blending = add ? THREE.AdditiveBlending : THREE.NormalBlending; m.material.color.set(0xffffff);
  m.position.set(ox + x, oy + y, oz + z); m.rotation.set(0, yawTo(ox + x, oz + z), 0); m.rotateZ(rz); m.scale.set(s, s, 1); m.renderOrder = 5;
};
let QUEUE = [];
const person = (...a) => QUEUE.push(() => personImpl(...a));
const fx = (...a) => QUEUE.push(() => fxImpl(...a));
const ovS = new THREE.Scene(), ovC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const vcv = document.createElement("canvas"); vcv.width = 256; vcv.height = 456; { const g = vcv.getContext("2d"); const gr = g.createRadialGradient(128, 228, 60, 128, 228, 290); gr.addColorStop(0, "rgba(10,5,20,0)"); gr.addColorStop(1, "rgba(10,5,20,.6)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 456); }
const vig = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(vcv), transparent: true, depthTest: false })); ovS.add(vig);
const flash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })); ovS.add(flash);
const tint = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false })); ovS.add(tint);

// ---------------------------------------------------------------- gulungan (panggung S)
const SC = WS.sc, sg = SC.getContext("2d"), sp = new Pen(sg);
const wavy = (g, x0, x1, y, amp, col, w, prog = 1) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); const n = 40, e = Math.floor(n * prog); for (let i = 0; i <= e; i++) { const x = lerp(x0, x1, i / n); const yy = y + Math.sin(i * 1.3) * amp; if (i) g.lineTo(x, yy); else g.moveTo(x, yy); } g.stroke(); };
const paperBase = (g, open) => {
  g.clearRect(0, 0, 1024, 1536); const ph = Math.max(40, open * 1360), top = 768 - ph / 2;
  g.save(); g.shadowColor = "rgba(0,0,0,.4)"; g.shadowBlur = 30; g.shadowOffsetY = 14; g.fillStyle = "#f2e4b6"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(100, top, 824, ph, 14); g.fill(); g.restore(); g.stroke();
  const gr = g.createLinearGradient(100, 0, 924, 0); gr.addColorStop(0, "rgba(120,80,30,.35)"); gr.addColorStop(0.1, "rgba(120,80,30,0)"); gr.addColorStop(0.9, "rgba(120,80,30,0)"); gr.addColorStop(1, "rgba(120,80,30,.35)"); g.fillStyle = gr; g.fillRect(100, top, 824, ph);
  for (const y of [top - 22, top + ph + 22]) { g.fillStyle = "#d9bf86"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(70, y - 34, 884, 68, 34); g.fill(); g.stroke(); g.fillStyle = "#b8934e"; g.beginPath(); g.ellipse(70, y, 22, 34, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(954, y, 22, 34, 0, 0, 7); g.fill(); g.stroke(); }
  return { top, ph };
};
const header = (g) => { g.fillStyle = "#c0262d"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(512, 215, 52, 0, 7); g.fill(); g.stroke(); g.strokeStyle = "#f2e4b6"; g.lineWidth = 8; g.beginPath(); g.moveTo(512, 185); g.lineTo(512, 245); g.moveTo(488, 205); g.lineTo(536, 205); g.stroke(); };
const bigNum = (g, txt, cx, cy, fs, col, sc = 1, rot = 0) => { g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(sc, sc); g.font = `bold ${fs}px 'DejaVu Sans', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = fs * 0.09; g.strokeStyle = INK; g.strokeText(txt, 0, 0); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore(); };
const bodyLines = (g, top, prog, n = 9, y0 = 330) => { for (let i = 0; i < n; i++) wavy(g, 200, i % 3 === 2 ? 640 : 824, y0 + i * 84, 5, "#6d5d49", 11, cl(prog * (n + 1) - i)); };
const kapalIcon = (g, cx, cy, s, col = "#4a3226") => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g);
  p.poly([[-150, 40], [150, 40], [110, 110], [-110, 110]], col, 11); p.line([[-40, 40], [-40, -150]], "#6e4a30", 11);
  p.poly([[-120, -140], [-30, -140], [10, 20], [-120, 20]], "#f7efd8", 9); p.line([[60, 40], [60, -90]], "#6e4a30", 9); g.restore(); };
const kepulauanIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g);
  for (const [x, y, r] of [[-120, 20, 44], [-40, -30, 34], [30, 40, 50], [120, -10, 30], [70, -70, 22]]) p.ell(x, y, r, r * 0.6, "#5a8a4a", 9);
  p.stroke([[-180, 90], [180, 70]], 8, "#2f86bd"); g.restore(); };

// =====================================================================================
// ADEGAN — 17 shot, pola: wide → medium → insert → close-up → wide (playbook 4a & 12)
// =====================================================================================
const SHOTS = [
  { id: "hook_wide",    a: 0,    b: 80,   st: "N", look: "tropik" },
  { id: "hook_face",    a: 80,   b: 157,  st: "N", look: "tropik" },
  { id: "tahun",        a: 157,  b: 236,  st: "S", look: "paper" },
  { id: "rapat",        a: 236,  b: 322,  st: "N", look: "tropik" },
  { id: "serang_wide",  a: 322,  b: 420,  st: "N", look: "hujan" },
  { id: "serang_dekat", a: 420,  b: 496,  st: "N", look: "hujan" },
  { id: "krat",         a: 496,  b: 574,  st: "K", look: "hujan" },
  { id: "klaim",        a: 574,  b: 621,  st: "K", look: "hujan" },
  { id: "kelas_wide",   a: 621,  b: 660,  st: "I", look: "kelas" },
  { id: "kelas_close",  a: 660,  b: 717,  st: "I", look: "kelas" },
  { id: "kirim",        a: 717,  b: 741,  st: "K", look: "hujan" },
  { id: "kota_wide",    a: 741,  b: 832,  st: "K", look: "hujan" },
  { id: "peta_wide",    a: 832,  b: 912,  st: "I", look: "peta" },
  { id: "peta_close",   a: 912,  b: 1012, st: "I", look: "peta" },
  { id: "armada",       a: 1012, b: 1188, st: "N", look: "senja" },
  { id: "kanal_senja",  a: 1188, b: 1301, st: "K", look: "senja" },
  { id: "end",          a: 1301, b: 1451, st: "N", look: "senja" },
];
const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const hyOf = (seed, stout, s) => (975 - headGeo(seed, 0, stout).hc) * SU * s;
const KICKS = [[1055, 0.5], [1122, 0.75], [430, 0.35]];
const blink = (f, seed) => ((f * 7 + seed * 31) % 96) < 4 ? 1 : 0;
const idle = (f, seed) => Math.sin(f / 14 + seed * 2) * 0.012;
const hyP = hyOf(11, false, 1.0);

const frame = (f) => {
  for (const k in used) used[k] = 0; QUEUE = [];
  const S = shotAt(f), u = (f - S.a) / (S.b - S.a), lf = f - S.a; curStage = S.st;
  for (const k in stages) stages[k].visible = k === S.st;
  if (curLook !== S.look) setLook(S.look);
  const [ox, oy, oz] = ORG[S.st]; let C = null; const A = (a) => [a[0] + ox, a[1] + oy, a[2] + oz];
  let flashA = 0, tintA = 0;
  const F = (o) => ({ kind: o.kind, v: o.v ?? 0, seed: o.seed ?? 7, blink: blink(f, o.seed ?? 7), mode: "stand", ...o });
  // gerak ambient (playbook 3): tidak ada frame yang benar-benar diam
  // semua animasi ambient WAJIB tahan nilai kosong: panggung bisa tidak punya bagian itu
  const each = (arr, fn) => { if (arr && arr.length) arr.forEach(fn); };
  if (WN.sea) WN.sea.material.map.offset.set(f * 0.0006, f * 0.00035);
  each(WN.ships, (s, i) => { s.g.position.y = Math.sin(f / 16 + i) * 0.16; s.g.rotation.z = Math.sin(f / 21 + i) * 0.025; if (s.sail) s.sail.rotation.z = Math.sin(f / 13 + i) * 0.015; if (s.fl) s.fl.rotation.y = Math.sin(f / 5 + i) * 0.35; if (s.fl2) s.fl2.rotation.y = Math.sin(f / 5 + i) * 0.35; });
  each(WN.banner, (b, i) => { b.rotation.y = Math.sin(f / 6 + i) * 0.3; });
  if (WK.air) WK.air.material.map.offset.set(-f * 0.0004, f * 0.00025);
  if (WK.blades) WK.blades.rotation.z = f * 0.012;
  each(WI.lilin, (fl, i) => { fl.scale.set(1 + Math.sin(f / 5 + i) * 0.12, 1 + Math.sin(f / 4 + i * 2) * 0.2, 1); });
  each(WP.lilin, (fl, i) => { fl.scale.set(1 + Math.sin(f / 5 + i) * 0.14, 1 + Math.sin(f / 4 + i * 2) * 0.22, 1); });
  switch (S.id) {
    case "hook_wide": {
      C = { pos: A(lv([18, 11, 26], [8, 6, 14], sm(u))), look: A([0, 5, -30]), fov: 46, roll: lerp(2, -1, u) };
      fx("bird", (f % 40) / 40, 9 - lf * 0.12, 12, -10, 1.5); fx("cloud", 0, -22, 24, -80, 20);
      break; }
    case "hook_face": {
      // kamera DI DEPAN karakter (karakter di z 3,2 di depan dermaga) supaya tidak ada peti/tiang penghalang
      C = { pos: A(lv([0.15, 1.90, 6.2], [0.1, 1.86, 5.4], sm(u))), look: A([0, 1.72, 3.2]), fov: 38, roll: lerp(-1.2, 1.2, u) };
      const sh = f >= 120;
      person(F({ kind: "panglima", expr: sh ? "shock" : "stern", look: Math.sin(f / 11) * 1.2, headTilt: sh ? Math.sin(f / 3) * 4 : 0 }), 0, 0, 3.2, 1.15, false, sh ? Math.sin(f / 3) * 0.03 : idle(f, 7), true);
      if (sh) { fx("exclaim", 0, 0.9, 2.95, 3.3, 1.1 * bk(ramp(f, 120, 128)), 0.1); fx("sweat", (f % 20) / 20, 0.42, 2.5, 3.15, 0.5); }
      break; }
    case "tahun": {
      C = { pos: A(lv([0.1, 0, 6.0], [0, 0, 5.0], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(-1.5, 1.5, u) };
      paperBase(sg, 1); header(sg); bodyLines(sg, 300, ramp(f, 165, 200), 7, 340);
      const np = bk(ramp(f, 175, 186)); if (np > 0) bigNum(sg, "1600", 512, 700, 220, "#c0262d", np);
      kepulauanIcon(sg, 512, 1120, 1.0 * bk(ramp(f, 196, 208)));
      kapalIcon(sg, 300, 1330, 0.7 * bk(ramp(f, 208, 220)));
      WS.tex.needsUpdate = true; WS.scroll.position.set(0, 0, 0); WS.scroll.rotation.z = 0;
      if (f > 175 && f < 190) fx("puff", ramp(f, 175, 190), 0, -0.1, 0.6, 2.0);
      break; }
    case "rapat": {
      C = { pos: A(lv([0, 2.05, 8.8], [0, 2.0, 7.5], sm(u))), look: A([0, 1.35, 3.2]), fov: 46, roll: lerp(-1.5, 1.5, u) };
      const pop = (t0) => bk(ramp(f, t0, t0 + 9));
      [[244, -1.0, F({ kind: "raja", seed: 3, expr: "stern" }), 1.1], [256, 0.0, F({ kind: "panglima", seed: 11, expr: "neutral" }), 1.0],
       [268, 1.0, F({ kind: "pelaut", v: 2, seed: 21, expr: "neutral" }), 0.98]].forEach(([t0, x, o, s]) => {
        if (f < t0) return; person(o, x, 0, 3.2, s * pop(t0), false, idle(f, t0 % 7), true); if (f < t0 + 12) fx("puff", ramp(f, t0, t0 + 12), x, 0.3, 3.3, 1.8); });
      break; }
    case "serang_wide": {
      C = { pos: A(lv([15, 6.5, 20], [6, 8.5, 12], sm(u))), look: A([0, 4.5, -26]), fov: 46, roll: lerp(-2, 2, u) };
      fx("cloud", 0, 14, 20, -70, 22); fx("bird", (f % 40) / 40, -12, 11, -14, 1.4);
      break; }
    case "serang_dekat": {
      C = { pos: A(lv([-4.5, 2.2, -5.0], [3.0, 3.4, -8.5], sm(u))), look: A([0, 7.5, -22]), fov: 54, roll: lerp(2, -2, u) };
      fx("splash", (f % 34) / 34, -2.6, 0.4, -13, 1.6); fx("splash", ((f + 14) % 34) / 34, 3.4, 0.4, -15, 1.4);
      flashA = f >= 430 && f < 434 ? 0.25 : 0; break; }
    case "krat": {
      C = { pos: A(lv([-9.4, 1.5, 8.4], [-9.4, 1.35, 7.2], sm(u))), look: A([-9.4, 1.05, 6.0]), fov: 40, roll: lerp(1.5, -1.5, u) };
      fx("star", (f % 40) / 40, -9.4, 2.0, 6.2, 0.85, 0, true);
      break; }
    case "klaim": {
      C = { pos: A(lv([0, 2.9, 9.6], [0, 2.75, 8.2], sm(u))), look: A([0, 2.6, 2.0]), fov: 46, roll: lerp(-1.5, 1.5, u) };
      const pop = (t0) => bk(ramp(f, t0, t0 + 10));
      if (f >= 582) person(F({ kind: "raja", seed: 3, expr: "grin" }), -0.95, 2.45, 2.0, 1.05 * pop(582), false, idle(f, 3), false);
      if (f >= 594) person(F({ kind: "gubernur", seed: 5, expr: "nervous", headTilt: -4 }), 0.95, 2.45, 2.0, 1.05 * pop(594), true, idle(f, 5), false);
      if (f >= 582 && f < 596) fx("puff", ramp(f, 582, 596), -0.95, 2.7, 2.2, 1.7);
      if (f >= 594 && f < 608) fx("puff", ramp(f, 594, 608), 0.95, 2.7, 2.2, 1.7);
      if (f >= 598 && f < 614) fx("star", ramp(f, 598, 614), 0, 3.1, 2.1, 0.7, 0, true);
      break; }
    case "kelas_wide": {
      C = { pos: A(lv([0.5, 3.1, 5.8], [0.4, 3.0, 4.8], sm(u))), look: A([0, 2.6, -4.8]), fov: 46, roll: lerp(-1.5, 1.5, u) };
      const pop = (t0) => bk(ramp(f, t0, t0 + 9));
      if (f >= 628) person(F({ kind: "guru", seed: 9, expr: "neutral", look: -1.2 }), -1.0, 0, -3.4, 1.05 * pop(628), false, idle(f, 9), true);
      if (f >= 640) person(F({ kind: "murid", seed: 13, expr: "nervous" }), 0.95, 0, -3.6, 0.75 * pop(640), false, idle(f, 13), true);
      break; }
    case "kelas_close": {
      C = { pos: A(lv([0.95, 1.70, 1.6], [0.9, 1.66, 0.8], sm(u))), look: A([0.85, 1.95, -5.0]), fov: 46, roll: lerp(1.2, -1.2, u) };
      const as = f >= 690;
      person(F({ kind: "murid", seed: 13, expr: as ? "smile" : "dazed", look: as ? 0.8 : 0.2, headTilt: as ? 3 : 0 }), 0.85, 0, -3.6, 0.78, false, idle(f, 13), true);
      if (as) fx("spark", (f % 26) / 26, 1.35, 1.7, -3.3, 0.7, 0, true);
      break; }
    case "kirim": {
      C = { pos: A(lv([-9.4, 1.7, 9.2], [-9.4, 1.55, 8.0], sm(u))), look: A([-9.4, 1.2, 6.2]), fov: 40, roll: lerp(-1.5, 1.5, u) };
      fx("star", ((f + 12) % 40) / 40, -9.4, 2.2, 6.4, 0.9, 0, true);
      break; }
    case "kota_wide": {
      C = { pos: A([lerp(15, -15, sm(u)), 6.5, 14]), look: A([0, 4.0, -22]), fov: 46, roll: lerp(1.5, -1.5, u) };
      fx("bird", (f % 44) / 44, 8, 13, -12, 1.4); break; }
    case "peta_wide": {
      C = { pos: A(lv([1.0, 2.7, 5.2], [0.6, 2.55, 4.2], sm(u))), look: A([0, 2.35, -2.0]), fov: 48, roll: lerp(-1.5, 1.5, u) };
      const pop = (t0) => bk(ramp(f, t0, t0 + 10));
      if (f >= 840) person(F({ kind: "gubernur", seed: 5, expr: "stern" }), -0.95, 0, -4.2, 1.1 * pop(840), false, idle(f, 5), true);
      if (f >= 852) person(F({ kind: "juru", seed: 17, expr: "neutral", look: 0.6 }), 0.95, 0, -4.4, 1.02 * pop(852), true, idle(f, 17), true);
      break; }
    case "peta_close": {
      C = { pos: A(lv([0.2, hyP + 0.05, 2.9], [0.1, hyP, 2.3], sm(u))), look: A([0, hyP - 0.05, -1.5]), fov: 38, roll: 3 * Math.sin(f / 12) };
      const sh = f >= 960;
      person(F({ kind: "gubernur", seed: 5, expr: sh ? "shock" : "nervous", headTilt: sh ? Math.sin(f / 3) * 4 : -3 }), 0, 0, -1.5, 1.25, false, sh ? Math.sin(f / 3) * 0.03 : idle(f, 5), true);
      if (sh) { fx("exclaim", 0, 0.9, hyP + 0.7, -1.3, 1.1 * bk(ramp(f, 960, 968)), 0.1); fx("sweat", (f % 20) / 20, 0.42, hyP + 0.15, -1.4, 0.5); }
      break; }
    case "armada": {
      C = { pos: A(lv([13, 7.5, 21], [5, 9.5, 13], sm(u))), look: A([0, 4.2, -28]), fov: 46, roll: lerp(2, -2, u) };
      flashA = (f >= 1055 && f < 1058) || (f >= 1122 && f < 1125) ? 0.16 : 0;
      fx("cloud", 0, -18, 22, -76, 24); fx("bird", (f % 40) / 40, 10, 12, -16, 1.6); break; }
    case "kanal_senja": {
      C = { pos: A(lv([0.4, 3.2, 10.4], [0.2, 3.6, 11.8], sm(u))), look: A([0, 2.6, 2.0]), fov: 46, roll: lerp(-1, 1, u) };
      person(F({ kind: "juru", seed: 17, expr: "dazed", look: Math.sin(f / 20) * 1.5 }), -0.2, 2.45, 2.0, 1.0, false, idle(f, 17), false);
      if (f % 40 < 2) fx("qmark", (f % 40) / 40, 0.5, 4.3, 2.0, 0.9);
      break; }
    case "end": {
      C = { pos: A(lv([6, 7, 26], [3, 8.5, 32], sm(u))), look: A([8, 4, -30]), fov: 44, roll: lerp(-1, 1, u) };
      fx("qmark", (f % 44) / 44, 2.0, 12, -12, 3.2);
      tintA = ramp(f, 1400, 1451) * 0.9; break; }
  }
  let kx = 0, ky = 0; for (const [kf, amp] of KICKS) { const d = f - kf; if (d >= 0 && d < 9) { const e = Math.exp(-d / 2.5) * amp; kx += Math.sin(d * 2.7) * 0.05 * e; ky += Math.cos(d * 3.3) * 0.05 * e; } }
  cam.fov = C.fov; cam.position.set(C.pos[0] + kx, C.pos[1] + ky, C.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(...C.look); cam.rotateZ((C.roll * Math.PI) / 180 + kx * 0.4); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); CAMP.copy(cam.position);
  sun.position.set(cam.position.x + LOOK[S.look].dir[2][0], cam.position.y + LOOK[S.look].dir[2][1], cam.position.z + LOOK[S.look].dir[2][2]); sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -3)); sun.target.updateMatrixWorld();
  QUEUE.forEach((q) => q()); QUEUE = [];   // kartu ditaruh SETELAH kamera final (billboard butuh posisi kamera)
  for (const k in pools) for (let i = used[k]; i < pools[k].length; i++) pools[k][i].visible = false;
  flash.material.opacity = flashA; tint.material.opacity = tintA;
  renderer.clear(); renderer.render(scene, cam); renderer.render(ovS, ovC);
};
window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.93); };
window.drawOnly = (f) => { frame(f); return true; };
window.ready = true;
