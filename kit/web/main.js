import * as THREE from "three";
import { drawAny, headGeo, CW, CH } from "./cast.js";
import { drawFx4 as drawFx2 } from "./fx4.js";
import { Pen, INK } from "./toon.ts";
import { addM, mkMat, buildDesk, buildHall } from "./world.js";
import { buildKelas, buildRuangPeta } from "./world_belanda.js";
import { buildKotaKanal, buildPelabuhanNusantara } from "./world_rekaan.js";

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
const ORG = { H: [0, 0, 0], T: [400, 0, 0], K: [800, 0, 0], S: [1200, 0, 0] };
const grp = (k) => { const g = new THREE.Group(); g.position.set(...ORG[k]); scene.add(g); return g; };
const gH = grp("H"), gT = grp("T"), gK = grp("K"), gS = grp("S");
const WH = buildPelabuhanNusantara(gH), WT = buildKotaKanal(gT);
const WK = buildKelas(gK), WS2 = buildRuangPeta(gS);
const stages = { H: gH, T: gT, K: gK, S: gS };

const LOOK = {
  pagi: { bg: ["#7cc4f0", "#ffeec9"], fog: 0xf2e2c0, fn: [60, 260], hemi: [0xffffff, 0x9fb4c0, 1.15], dir: [0xfff2cf, 1.5, [-6, 11, 8]], card: 0xfff6e6 },
  senja: { bg: ["#8a5f8f", "#ffb072"], fog: 0xe0a888, fn: [40, 190], hemi: [0xffe2c8, 0x6f6070, 1.1], dir: [0xffc487, 1.45, [-6, 8, 8]], card: 0xffe8d6 },
  malam: { bg: ["#1a2440", "#4a5a86"], fog: 0x27324e, fn: [30, 150], hemi: [0xa8c0ff, 0x2a3348, 0.85], dir: [0xbcd0ff, 0.75, [-6, 9, 7]], card: 0xdfe6ff },
  kelas: { bg: ["#f3e2c4", "#e2c79c"], fog: 0xdcc9a8, fn: [14, 46], hemi: [0xfff4e0, 0xa98c62, 1.25], dir: [0xffeccb, 1.15, [-2, 7, 6]], card: 0xfff6e8 },
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
  { id: "serang", a: 488, b: 569, st: "H", look: "senja" },
  { id: "pasar", a: 570, b: 616, st: "T", look: "pagi" },
  { id: "amsterdam", a: 617, b: 709, st: "T", look: "senja" },
  { id: "kelas", a: 710, b: 825, st: "K", look: "kelas" },
  { id: "tulip", a: 826, b: 908, st: "H", look: "pagi" },
  { id: "kota", a: 909, b: 1003, st: "T", look: "senja" },
  { id: "gelap", a: 1004, b: 1088, st: "S", look: "malam" },
  { id: "adidaya", a: 1089, b: 1200, st: "T", look: "pagi" },
  { id: "ulang", a: 1201, b: 1299, st: "H", look: "malam" },
  { id: "akhir", a: 1300, b: 1451, st: "H", look: "senja" },
];
// ATURAN KAMERA (dari catatan user): frontal atau 3/4 saja, JANGAN profil.
// Kartu karakter selalu menghadap kamera; kalau adegan dilihat dari samping, karakter
// tampak seperti tempelan dan bayangan kontaknya jadi garis.
const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const blink = (f, seed) => ((f * 7 + seed * 31) % 96) < 4 ? 1 : 0;
const idle = (f, seed) => Math.sin(f / 14 + seed * 2) * 0.012;

const frame = (f) => {
  for (const k in pools) for (const m of pools[k]) m.visible = false;
  for (const k in used) used[k] = 0; QUEUE = [];
  const S = shotAt(f), u = (f - S.a) / Math.max(1, S.b - S.a); curStage = S.st;
  for (const k in stages) stages[k].visible = k === S.st;
  if (curLook !== S.look) setLook(S.look);
  const [ox, oy, oz] = ORG[S.st]; const A = (a) => [a[0] + ox, a[1] + oy, a[2] + oz];
  let flashA = 0, tintA = 0, C = null;

  // tokoh cerita ini
  const tokoh = (kind, o = {}, seed0 = 20) => ({ kind, seed: seed0, blink: blink(f, seed0), expr: o.expr ?? "neutral", ...o });
  const pelaut = (o = {}) => tokoh("pelaut", o, 20);
  const raja = (o = {}) => tokoh("raja", o, 21);
  const murid = (o = {}) => tokoh("murid", o, 22);
  const serdadu = (o = {}) => tokoh("serdadu", o, 23);

  switch (S.id) {
    case "armada": {
      const p = sm(ramp(f, 0, 130));
      C = { pos: A(lv([0, 6.4, 22], [0.7, 7.0, 18], p)), look: A(lv([0, 4.0, -28], [-1, 3.7, -34], p)), fov: lerp(52, 48, p), roll: lerp(-1.5, 1.5, u) };
      if (f > 40) fx("bird", ((f - 40) % 44) / 44, -7.0 + ((f - 40) % 44) / 44 * 13, 7.8, -22, 0.9, 0, false);
      if (f > 80) fx("cloud", ((f - 80) % 62) / 62, -9.5, 10.0, -16, 8.0, 0, true);
      break; }
    case "dermaga": {
      const p = sm(ramp(f, 150, 214));
      C = { pos: A(lv([1.6, 2.3, 12.5], [0.5, 1.95, 9.5], p)), look: A(lv([0, 1.9, 3.0], [0, 1.8, 2.8], p)), fov: lerp(44, 39, p), roll: lerp(-1, 1, u) };
      person(pelaut({ expr: "neutral", look: Math.sin(f / 12) }), -0.95, 0, 2.6, 1.0, false, idle(f, 3), true);
      fx("steam", ((f - 150) % 30) / 30, -0.95, 1.45, 2.6, 0.5);
      break; }
    case "datang": {
      const p = sm(ramp(f, 233, 300));
      C = { pos: A(lv([5.5, 3.0, 15], [2.5, 3.3, 11], p)), look: A(lv([-4, 3.4, -28], [-8, 3.6, -32], p)), fov: lerp(50, 46, p), roll: lerp(1.5, -1.5, u) };
      fx("splash", ((f - 233) % 26) / 26, -3.2, 0.05, -12.0, 1.1);
      break; }
    case "hadapan": {
      const p = sm(ramp(f, 317, 430));
      C = { pos: A(lv([0, 2.0, 10.4], [0, 1.8, 8.8], p)), look: A(lv([0, 1.75, 3.0], [0, 1.7, 2.9], p)), fov: lerp(40, 35, p), roll: lerp(-2, 2, u) };
      person(serdadu({ expr: "stern", headTilt: Math.sin(f / 10) * 3 }), 0.6, 0, 2.9, 0.98, false, idle(f, 7), true);
      person(pelaut({ expr: "nervous", look: Math.sin(f / 9) * 0.6, headTilt: Math.sin(f / 12) * 4 }), -0.6, 0, 2.7, 0.98, true, idle(f, 8), true);
      if (f > 430 && f < 470) fx("exclaim", ramp(f, 430, 442), -0.85, 2.1, 2.7, 0.7, 0.1);
      break; }
    case "serang": {
      const p = sm(ramp(f, 488, 556));
      C = { pos: A(lv([0, 3.6, 19], [-1.0, 3.0, 15], p)), look: A(lv([0, 3.8, -8], [0, 3.5, -11], p)), fov: lerp(50, 46, p), roll: lerp(2, -2, u) };
      if (f > 500) fx("boom", ((f - 500) % 34) / 34, 11.0, 4.6, -26, 1.8, 0, true);
      if (f > 500) fx("smoke", ((f - 500) % 34) / 34, 9.0, 5.4, -27, 2.8, 0, true);
      break; }
    case "pasar": {
      const p = sm(ramp(f, 570, 606));
      C = { pos: A(lv([0, 3.4, 9.6], [0, 3.2, 8.2], p)), look: A(lv([0, 3.0, 2.2], [0, 2.95, 2.0], p)), fov: lerp(46, 42, p), roll: lerp(-1.5, 1.5, u) };
      person(pelaut({ expr: "grin", look: Math.sin(f / 12) }), -0.8, 1.68, 2.2, 0.92, false, idle(f, 11), false);
      person(murid({ expr: "neutral", look: Math.sin(f / 14 + 1) }), 0.85, 1.68, 2.0, 0.9, true, idle(f, 12), false);
      fx("spark", ((f - 570) % 26) / 26, 0.1, 1.6, 0.4, 0.7, 0, true);
      break; }
    case "amsterdam": {
      const p = sm(ramp(f, 617, 690));
      C = { pos: A(lv([0, 3.2, 10.6], [0, 3.8, 8.6], p)), look: A(lv([0, 3.1, 1.6], [0, 3.5, 0.6], p)), fov: lerp(48, 44, p), roll: lerp(-2, 2, u) };
      person(raja({ expr: "grin", lift: 150 + Math.sin(f / 9) * 10 }), -0.75, 1.68, 2.2, 1.0, false, idle(f, 13), false);
      if (f > 660) fx("spark", ((f - 660) % 22) / 22, -0.6, 2.5, 1.2, 0.8, 0, true);
      break; }
    case "kelas": {
      const p = sm(ramp(f, 710, 800));
      C = { pos: A(lv([0, 1.95, 4.8], [0, 1.82, 4.0], p)), look: A(lv([0, 2.4, -4.4], [0, 2.5, -4.8], p)), fov: lerp(46, 42, p), roll: lerp(-1, 1, u) };
      person(murid({ expr: "neutral", look: Math.sin(f / 16) }), -0.9, 0, -2.9, 0.88, false, idle(f, 14), true);
      person(murid({ expr: "neutral", look: Math.sin(f / 18 + 1) }), 0.95, 0, -2.9, 0.88, true, idle(f, 15), true);
      break; }
    case "tulip": {
      const p = sm(ramp(f, 826, 895));
      C = { pos: A(lv([0, 2.2, 12], [0, 2.0, 10.4], p)), look: A(lv([0, 1.6, 4.4], [0, 1.5, 4.0], p)), fov: lerp(44, 40, p), roll: lerp(1.5, -1.5, u) };
      person(pelaut({ expr: "grin", look: Math.sin(f / 13) }), -0.72, 0, 4.6, 0.92, false, idle(f, 16), true);
      person(serdadu({ expr: "neutral" }), 0.75, 0, 4.9, 0.92, true, idle(f, 17), true);
      fx("spark", ((f - 826) % 28) / 28, 0.0, 1.5, 4.2, 0.65, 0, true);
      break; }
    case "kota": {
      const p = sm(ramp(f, 909, 990));
      C = { pos: A(lv([0, 10.0, 22], [0, 14.0, 30], p)), look: A(lv([0, 2.4, -6], [0, 1.8, -10], p)), fov: lerp(50, 46, p), roll: lerp(-2, 2, u) };
      break; }
    case "gelap": {
      const p = sm(ramp(f, 1004, 1070));
      C = { pos: A(lv([0, 1.8, 5.4], [0, 1.6, 4.4], p)), look: A(lv([0, 1.15, -0.9], [0, 1.1, -1.1], p)), fov: lerp(42, 38, p), roll: lerp(-1, 1, u) };
      person(raja({ expr: "stern", look: Math.sin(f / 20) }), -0.58, 0, -1.4, 0.9, false, idle(f, 18), true);
      person(serdadu({ expr: "stern", headTilt: Math.sin(f / 14) * 3 }), 0.58, 0, -1.4, 0.9, true, idle(f, 19), true);
      fx("glow", ((f - 1004) % 40) / 40, 0.5, 1.3, 0.3, 1.0, 0, true);
      break; }
    case "adidaya": {
      const p = sm(ramp(f, 1089, 1180));
      C = { pos: A(lv([-4.5, 3.2, 10.5], [4.5, 3.2, 10.5], p)), look: A(lv([0, 2.6, -5], [0, 2.6, -5], p)), fov: 48, roll: lerp(-1, 1, u) };
      break; }
    case "ulang": {
      const p = sm(ramp(f, 1201, 1280));
      C = { pos: A(lv([0, 3.4, 20], [0, 3.1, 17], p)), look: A(lv([0, 4.0, -10], [0, 3.7, -11], p)), fov: lerp(46, 42, p), roll: lerp(1.5, -1.5, u) };
      if (f > 1230) fx("smoke", ((f - 1230) % 46) / 46, -6.0, 3.0, -20, 2.4, 0, true);
      break; }
    case "akhir": {
      const p = sm(ramp(f, 1300, 1430));
      C = { pos: A(lv([0, 5.6, 24], [3.0, 8.2, 40], p)), look: A(lv([0, 4.6, -26], [-1, 4.4, -32], p)), fov: lerp(50, 46, p), roll: lerp(1.5, -1.5, u) };
      if (f > 1340) fx("bird", ((f - 1340) % 44) / 44, -8.0 + ((f - 1340) % 44) / 44 * 15, 8.2, -26, 0.9, 0, false);
      break; }
    default: {
      C = { pos: A([0, 6.0, 20]), look: A([0, 3.0, -20]), fov: 50, roll: 0 };
      break; }
  }

  for (const q of QUEUE) q();
  if (!C) C = { pos: A([0, 3, 20]), look: A([0, 2, -10]), fov: 45, roll: 0 };
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
    // uji okulasi: apakah ada benda lain antara kamera dan titik tengah kartu?
    const pusat = bb.getCenter(new THREE.Vector3());
    const arah = pusat.clone().sub(cam.position).normalize();
    const rc = new THREE.Raycaster(cam.position.clone(), arah, 0.1, pusat.distanceTo(cam.position) - 0.05);
    const tabrak = rc.intersectObjects(scene.children, true).filter((h) => h.object !== m);
    out.push({ pool: k, x0: r(x0), x1: r(x1), y0: r(y0), y1: r(y1), minY: r(bb.min.y), cut: x0 < -1 || x1 > 1 || y0 < -1 || y1 > 1,
      terhalang: tabrak.length ? (tabrak[0].object.material && tabrak[0].object.material.name ? tabrak[0].object.material.name : "benda") : null });
  }
  return out;
};
window.drawOnly = (f) => { frame(f); return true; };
window.ready = true;