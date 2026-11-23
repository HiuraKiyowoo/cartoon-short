import * as THREE from "three";
import { drawAny, headGeo, CW, CH } from "./cast.js";
import { drawFx4 as drawFx2 } from "./fx4.js";
import { Pen, INK } from "./toon.ts";
import { addM, mkMat, buildDesk, buildHall } from "./world.js";
import { buildHarbor, buildTown } from "./world2.js";

const Q = new URLSearchParams(location.search), W = +(Q.get("w") || 1080), H = Math.round((W * 16) / 9);
const FPS = 30, TOTAL = 1180, SU = 0.00216;
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (x) => { x = cl(x); return x * x * x * (x * (6 * x - 15) + 10); };
const eo = (x) => 1 - Math.pow(1 - cl(x), 3);
const bk = (x) => { x = cl(x); const c = 2.0; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t, lv = (A, B, t) => A.map((v, i) => lerp(v, B[i], t));
const sec = (s) => Math.round(s * FPS);
const ramp = (f, a, b) => cl((f - a) / (b - a));

// ---------------------------------------------------------------- renderer / scene
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
renderer.setSize(W, H); renderer.setPixelRatio(1); document.body.appendChild(renderer.domElement); renderer.autoClear = false;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 400);
const hemi = new THREE.HemisphereLight(0xffffff, 0x555555, 1), sun = new THREE.DirectionalLight(0xffffff, 1); scene.add(hemi, sun, sun.target);

// ---------------------------------------------------------------- panggung
// Cerita: "Belanda menjadi jajahan Indonesia" (alternatif sejarah).
// Tahap 1 = pelabuhan + armada (modul buildHarbor). Tahap kota/kelas menyusul.
const ORG = { H: [0, 0, 0], T: [400, 0, 0] };
const grp = (k) => { const g = new THREE.Group(); g.position.set(...ORG[k]); scene.add(g); return g; };
const gH = grp("H"), gT = grp("T");
const WH = buildHarbor(gH), WT = buildTown(gT);
const stages = { H: gH, T: gT };

const LOOK = {
  pagi: { bg: ["#7cc4f0", "#ffeec9"], fog: 0xf2e2c0, fn: [60, 260], hemi: [0xffffff, 0x9fb4c0, 1.15], dir: [0xfff2cf, 1.5, [-6, 11, 8]], card: 0xfff6e6 },
  senja: { bg: ["#8a5f8f", "#ffb072"], fog: 0xe0a888, fn: [40, 190], hemi: [0xffe2c8, 0x6f6070, 1.1], dir: [0xffc487, 1.45, [-6, 8, 8]], card: 0xffe8d6 },
  malam: { bg: ["#1a2440", "#4a5a86"], fog: 0x27324e, fn: [30, 150], hemi: [0xa8c0ff, 0x2a3348, 0.85], dir: [0xbcd0ff, 0.75, [-6, 9, 7]], card: 0xdfe6ff },
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
const stageOf = {}; let curStage = "B";
const OF = () => ORG[curStage];
// person: o = drawPerson opts; world pos relative to current stage origin
const personImpl = (o, x, y, z, s = 1, flip = false, rz = 0, blob = true) => {
  const key = "P" + quant(o), tex = getTex(key, CW, CH, (cv) => drawAny(cv, o)); const m = grab("p", PGEO, { at: 0.5 });
  const [ox, oy, oz] = OF(); m.visible = true; m.material.map = tex; m.material.color.copy(cardTint); m.material.needsUpdate = false;
  m.position.set(ox + x, oy + y, oz + z); m.rotation.set(0, yawTo(ox + x, oz + z), 0); m.rotateZ(rz); m.scale.set(flip ? -s : s, s, 1);
  if (blob && y < 0.3) { const b = grab("b", FGEO, { tr: true }); b.visible = true; b.material.map = getTex("blob", 256, 256, (cv) => drawFx2(cv, "blob", 0)); b.material.color.set(0xffffff); b.position.set(ox + x, oy + y + 0.012, oz + z); b.scale.set(1.0 * s, 1, 0.5 * s); b.rotation.y = 0; }
};
const fxImpl = (kind, t, x, y, z, s = 1, rz = 0, add = false) => {
  const key = "F" + kind + Math.round(t * 16), tex = getTex(key, 256, 256, (cv) => drawFx2(cv, kind, t)); const m = grab("f", UGEO, { tr: true, add });
  const [ox, oy, oz] = OF(); m.visible = true; m.material.map = tex; m.material.blending = add ? THREE.AdditiveBlending : THREE.NormalBlending; m.material.color.set(0xffffff);
  m.position.set(ox + x, oy + y, oz + z); m.rotation.set(0, yawTo(ox + x, oz + z), 0); m.rotateZ(rz); m.scale.set(s, s, 1); m.renderOrder = 5;
};

let QUEUE = [];
const person = (...a) => QUEUE.push(() => personImpl(...a));
const fx = (...a) => QUEUE.push(() => fxImpl(...a));
// overlay (vignette + flash)
const ovS = new THREE.Scene(), ovC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const vcv = document.createElement("canvas"); vcv.width = 256; vcv.height = 456; { const g = vcv.getContext("2d"); const gr = g.createRadialGradient(128, 228, 60, 128, 228, 290); gr.addColorStop(0, "rgba(10,5,20,0)"); gr.addColorStop(1, "rgba(10,5,20,.62)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 456); }
const vig = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(vcv), transparent: true, depthTest: false })); ovS.add(vig);
const flash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })); ovS.add(flash);
const tint = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0xff2020, transparent: true, opacity: 0, depthTest: false })); ovS.add(tint);

// ---------------------------------------------------------------- rencana shot (tahap 1)
const SHOTS = [
  { id: "armada", a: 0, b: 146, st: "H", look: "pagi" },
  { id: "dermaga", a: 150, b: 229, st: "H", look: "pagi" },
  { id: "datang", a: 233, b: 316, st: "H", look: "senja" },
  { id: "hadapan", a: 317, b: 488, st: "H", look: "senja" },
  { id: "sisa", a: 488, b: 1451, st: "H", look: "pagi" },
];
const TOTALF = 1451;
const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const blink = (f, seed) => ((f * 7 + seed * 31) % 96) < 4 ? 1 : 0;
const idle = (f, seed) => Math.sin(f / 14 + seed * 2) * 0.012;
const hyOf = (seed, stout, s) => (975 - headGeo(seed, 0, stout).hc) * SU * s;

const frame = (f) => {
  for (const k in used) used[k] = 0; QUEUE = [];
  const S = shotAt(f), u = (f - S.a) / Math.max(1, S.b - S.a); curStage = S.st;
  for (const k in stages) stages[k].visible = k === S.st;
  if (curLook !== S.look) setLook(S.look);
  const [ox, oy, oz] = ORG[S.st]; const A = (a) => [a[0] + ox, a[1] + oy, a[2] + oz];
  let flashA = 0, tintA = 0, C = null;

  // tokoh: penduduk Nusantara (folk) dan serdadu Eropa (guard)
  const folk = (o = {}) => ({ kind: "folk", v: o.v ?? 2, seed: 20 + (o.v ?? 2), blink: blink(f, 20 + (o.v ?? 2)), expr: o.expr ?? "neutral", ...o });
  const guard = (o = {}) => ({ kind: "guard", seed: 30, blink: blink(f, 30), expr: o.expr ?? "stern", ...o });

  switch (S.id) {
    case "armada": {
      // frame 0 sudah gambar hook: armada terlihat penuh dari atas air
      const p = sm(ramp(f, 0, 120));
      C = { pos: A(lv([0, 6.0, 26], [0, 7.2, 30], p)), look: A(lv([0, 3.0, -20], [0, 2.6, -28], p)), fov: lerp(56, 52, p), roll: lerp(-1.5, 1.5, u) };
      person(folk({ v: 1, expr: "grin", look: Math.sin(f / 18) }), -2.1, 0, 2.0, 0.85, false, idle(f, 1), true);
      person(folk({ v: 4, expr: "grin", look: Math.sin(f / 16 + 2) }), 2.1, 0, 3.2, 0.85, true, idle(f, 2), true);
      if (f % 26 < 13) fx("cloud", ((f % 26) / 13), 5.0, 1.4, -0.5, 9.0, 0, true);
      break; }
    case "dermaga": {
      const p = sm(ramp(f, 150, 215));
      C = { pos: A(lv([-9.5, 3.0, 14], [-8.0, 2.6, 12], p)), look: A(lv([-0.2, 1.7, 2.0], [-0.1, 1.68, 2.0], p)), fov: lerp(48, 42, p), roll: lerp(-1, 1, u) };
      person(folk({ v: 3, expr: "neutral", look: Math.sin(f / 12) }), 0.0, 0, 2.0, 1.05, false, idle(f, 3), true);
      fx("steam", ((f - 150) % 30) / 30, 0.0, 1.35, 2.0, 0.5);
      break; }
    case "datang": {
      const p = sm(ramp(f, 233, 300));
      C = { pos: A(lv([2.0, 2.6, -8], [1.0, 3.0, -14], p)), look: A(lv([2, 3.6, -40], [-2, 3.2, -46], p)), fov: 47, roll: lerp(1.5, -1.5, u) };
      
      fx("splash", ((f - 233) % 24) / 24, -2.0, 0.05, -14.0, 1.1);
      break; }
    case "hadapan": {
      const p = sm(ramp(f, 317, 430));
      C = { pos: A(lv([-2.6, 2.2, 16.0], [-2.0, 1.9, 13.5], p)), look: A(lv([0.2, 1.7, 2.4], [0.1, 1.66, 2.3], p)), fov: lerp(46, 42, p), roll: lerp(-2, 2, u) };
      person(guard({ expr: "stern", headTilt: Math.sin(f / 10) * 3 }), 1.25, 0, 2.6, 1.12, false, idle(f, 7), true);
      person(folk({ v: 2, expr: "nervous", look: Math.sin(f / 9) * 0.6, headTilt: Math.sin(f / 12) * 4 }), -1.05, 0, 2.3, 1.1, true, idle(f, 8), true);
      if (f > 430 && f < 470) fx("exclaim", ramp(f, 430, 442), -1.05, 2.15, 2.3, 0.7, 0.1);
      break; }
    default: {
      C = { pos: A([0, 6.5, 50]), look: A([0, 3.0, -28]), fov: 48, roll: Math.sin(f / 90) * 1.2 };
      break; }
  }

  for (const q of QUEUE) q();
  if (!C) C = { pos: A([0, 3, 30]), look: A([0, 2, -10]), fov: 45, roll: 0 };
  cam.fov = C.fov; cam.position.set(C.pos[0], C.pos[1], C.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(C.look[0], C.look[1], C.look[2]);
  cam.rotateZ((C.roll * Math.PI) / 180); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); CAMP.copy(cam.position);
  sun.position.set(cam.position.x + LOOK[S.look].dir[2][0], cam.position.y + LOOK[S.look].dir[2][1], cam.position.z + LOOK[S.look].dir[2][2]);
  sun.target.position.set(cam.position.x, 1, cam.position.z - 12); sun.target.updateMatrixWorld();

  flash.material.opacity = cl(flashA); tint.material.opacity = cl(tintA);
  renderer.setViewport(0, 0, W, H); renderer.render(scene, cam);
  renderer.autoClear = false; renderer.clearDepth();
  renderer.render(ovS, ovC);
  renderer.autoClear = true;
};

window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.93); };

// ---- audit penempatan (dipakai probe_frame.mjs) ----
// Mengukur tiap kartu yang tampak: posisi layar (NDC) + tinggi dunia terendah.
// [POTONG] = keluar tepi frame; [APUNG] = minY jauh di atas tanah (kartu 'f' = efek, memang di udara).
window.__audit = (f) => {
  frame(f);
  const out = [], v = new THREE.Vector3();
  for (const k of ["p", "f", "b"]) for (const m of pools[k]) {
    if (!m.visible) continue;
    const bb = new THREE.Box3().setFromObject(m);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const cx of [bb.min.x, bb.max.x]) for (const cy of [bb.min.y, bb.max.y]) for (const cz of [bb.min.z, bb.max.z]) {
      v.set(cx, cy, cz).project(cam);
      x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
    }
    const r = (n) => Math.round(n * 1000) / 1000;
    out.push({ pool: k, x0: r(x0), x1: r(x1), y0: r(y0), y1: r(y1), minY: r(bb.min.y), cut: x0 < -1 || x1 > 1 || y0 < -1 || y1 > 1 });
  }
  return out;
};
window.drawOnly = (f) => { frame(f); return true; };
window.ready = true;