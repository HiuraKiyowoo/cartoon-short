import * as THREE from "three";
import { drawAny, headGeo, CW, CH } from "./cast.js";
import { drawFx4 as drawFx2 } from "./fx4.js";
import { Pen, INK } from "./toon.ts";
import { addM, mkMat, buildDesk, buildHall } from "./world.js";
import { buildVillage, buildDock } from "./world3.js";

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
const ORG = { H: [-100, 0, 0], V: [100, 0, 0], S: [0, 0, 100] };
const grp = (k) => { const g = new THREE.Group(); g.position.set(...ORG[k]); scene.add(g); return g; };
const gH = grp("H"), gV = grp("V"), gS = grp("S");
const WH = buildHall(gH), WV = buildVillage(gV), WS = buildDesk(gS); buildDock(WH.g);
const stages = { H: gH, V: gV, S: gS };
const flames = WH.flames;

const LOOK = {
  day: { bg: ["#58b6ee", "#fff0c4"], fog: 0xfbe9c0, fn: [40, 170], hemi: [0xffffff, 0xc9a070, 1.15], dir: [0xfff0c8, 1.5, [-5, 9, 6]], card: 0xfff6e6 },
  dusk: { bg: ["#7a5a90", "#f5a46a"], fog: 0xd8a080, fn: [24, 100], hemi: [0xffe0c8, 0x806078, 1.1], dir: [0xffc890, 1.4, [-5, 7, 6]], card: 0xffe6d4 },
  hall: { bg: ["#3a2a3f", "#6a4a4a"], fog: 0x5a4048, fn: [24, 62], hemi: [0xfff2d8, 0x806050, 1.2], dir: [0xffe6b0, 1.2, [-3, 8, 6]], card: 0xfff2dc },
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

// ---------------------------------------------------------------- scroll painter
const SC = WS.sc, sg = SC.getContext("2d"), sp = new Pen(sg);
const wavy = (g, x0, x1, y, amp, col, w, prog = 1) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); const n = 40, e = Math.floor(n * prog); for (let i = 0; i <= e; i++) { const x = lerp(x0, x1, i / n); const yy = y + Math.sin(i * 1.3) * amp; if (i) g.lineTo(x, yy); else g.moveTo(x, yy); } g.stroke(); };
const paperBase = (g, open) => {
  g.clearRect(0, 0, 1024, 1536); const ph = Math.max(40, open * 1360), top = 768 - ph / 2;
  g.save(); g.shadowColor = "rgba(0,0,0,.4)"; g.shadowBlur = 30; g.shadowOffsetY = 14; g.fillStyle = "#f2e4b6"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(100, top, 824, ph, 14); g.fill(); g.restore(); g.stroke();
  const gr = g.createLinearGradient(100, 0, 924, 0); gr.addColorStop(0, "rgba(120,80,30,.35)"); gr.addColorStop(0.1, "rgba(120,80,30,0)"); gr.addColorStop(0.9, "rgba(120,80,30,0)"); gr.addColorStop(1, "rgba(120,80,30,.35)"); g.fillStyle = gr; g.fillRect(100, top, 824, ph);
  for (const y of [top - 22, top + ph + 22]) { g.fillStyle = "#d9bf86"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(70, y - 34, 884, 68, 34); g.fill(); g.stroke(); g.fillStyle = "#b8934e"; g.beginPath(); g.ellipse(70, y, 22, 34, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(954, y, 22, 34, 0, 0, 7); g.fill(); g.stroke(); }
  return { top, ph };
};
const ring = (g, cx, cy, s, rot, label) => {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(s, s); g.globalAlpha = 0.93;
  g.strokeStyle = "#c0262d"; g.lineWidth = 16; g.beginPath(); g.ellipse(0, 0, 300, 150, 0, 0, 7); g.stroke(); g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 276, 126, 0, 0, 7); g.stroke();
  g.fillStyle = "#c0262d"; g.font = "bold 96px 'DejaVu Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, 0, 6); g.restore();
};
const bodyLines = (g, top, prog, n = 9, y0 = 330) => { for (let i = 0; i < n; i++) wavy(g, 200, i % 3 === 2 ? 640 : 824, y0 + i * 84, 5, "#6d5d49", 11, cl(prog * (n + 1) - i)); };
const header = (g) => { g.fillStyle = "#c0262d"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(512, 215, 52, 0, 7); g.fill(); g.stroke(); g.strokeStyle = "#f2e4b6"; g.lineWidth = 8; g.beginPath(); g.moveTo(512, 185); g.lineTo(512, 245); g.moveTo(488, 205); g.lineTo(536, 205); g.stroke(); };
const houseIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g); p.poly([[-90, -10], [90, -10], [90, 110], [-90, 110]], "#f1e4c8", 11); p.poly([[-112, -10], [0, -104], [112, -10]], "#c4573b", 11); p.poly([[-20, 40], [20, 40], [20, 110], [-20, 110]], "#6e4a30", 7); p.ell(-52, 40, 18, 18, "#bcd4ff", 6); p.ell(52, 40, 18, 18, "#bcd4ff", 6); g.restore(); };
const letterIcon = (g, cx, cy, s, rot) => { g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(s, s); const p = new Pen(g); p.poly([[-80, -50], [80, -50], [80, 50], [-80, 50]], "#fffaf0", 9); p.stroke([[-80, -50], [0, 10], [80, -50]], 6); p.ell(0, 6, 16, 16, "#c0262d", 6); g.restore(); };
const xMark = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.lineCap = "round"; for (const [w, c] of [[50, INK], [34, "#c0262d"]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(-70, -70); g.lineTo(70, 70); g.moveTo(70, -70); g.lineTo(-70, 70); g.stroke(); } g.restore(); };
const qpt = (t) => { const A = [250, 520], Cc = [760, 400], B = [770, 1130]; return [(1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * Cc[0] + t * t * B[0], (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * Cc[1] + t * t * B[1]]; };

const SHOTS = [
  { id: "hook", a: 0, b: 139, st: "H", look: "hall" }, { id: "village", a: 139, b: 239, st: "V", look: "day" }, { id: "swarm", a: 239, b: 332, st: "V", look: "day" },
  { id: "march", a: 332, b: 416, st: "V", look: "day" }, { id: "call", a: 416, b: 480, st: "H", look: "hall" }, { id: "empty", a: 480, b: 532, st: "H", look: "hall" },
  { id: "lawyer", a: 532, b: 644, st: "H", look: "hall" }, { id: "letter", a: 644, b: 702, st: "S", look: "paper" }, { id: "migrate", a: 702, b: 774, st: "V", look: "day" },
  { id: "pula", a: 774, b: 804, st: "H", look: "hall" }, { id: "road", a: 804, b: 915, st: "V", look: "dusk" }, { id: "catclose", a: 915, b: 945, st: "V", look: "dusk" },
  { id: "agree", a: 945, b: 1000 - 17, st: "H", look: "hall" }, { id: "gavel", a: 983, b: 1023, st: "H", look: "hall" }, { id: "escape", a: 1023, b: 1073, st: "H", look: "hall" },
  { id: "sneaky", a: 1073, b: 1127, st: "H", look: "hall" }, { id: "finale", a: 1127, b: 1180, st: "H", look: "hall" },
];
SHOTS[12].b = 983;
const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const hyOf = (seed, stout, s) => (975 - headGeo(seed, 0, stout).hc) * SU * s;
const KICKS = [[82, 0.6], [575, 0.4], [685, 0.5], [915, 1.0], [1000, 1.1], [1158, 1.5]];
const blink = (f, seed) => ((f * 7 + seed * 31) % 96) < 4 ? 1 : 0;
const idle = (f, seed) => Math.sin(f / 14 + seed * 2) * 0.012;
const DOCK = [[-2.2, "scared"], [-1.4, "scared"], [-0.6, "scared"]];

const frame = (f) => {
  for (const k in used) used[k] = 0; QUEUE = [];
  const S = shotAt(f), u = (f - S.a) / (S.b - S.a), lf = f - S.a; curStage = S.st;
  for (const k in stages) stages[k].visible = k === S.st;
  if (curLook !== S.look) setLook(S.look);
  const [ox, oy, oz] = ORG[S.st]; let C = null; const A = (a) => [a[0] + ox, a[1] + oy, a[2] + oz];
  let flashA = 0, tintA = 0;
  const judge = (o) => ({ kind: "judge", seed: 9, blink: blink(f, 9), mode: "stand", ...o });
  const lawyer = (o) => ({ kind: "lawyer", seed: 10, blink: blink(f, 10), mode: "stand", ...o });
  const rat = (o) => ({ kind: "rat", blink: blink(f, (o.id ?? 1) * 3), ...o });
  const cat = (o) => ({ kind: "cat", blink: blink(f, 11 + (o.id ?? 0)), ...o });
  const hyL = hyOf(10, false, 1.15), hyJ = hyOf(9, true, 1.1) + 0.6;
  const theJudge = (o = {}) => person(judge(o), 0, 0.6, -10.1, 1.1, false, 0, false);
  const dockRats = (exprs, extra) => DOCK.forEach(([x], i) => { const e = exprs[i % exprs.length]; person(rat({ id: i + 1, expr: e, look: Math.sin(f / 12 + i) * 0.7, ...(extra || {}) }), x, 0.35, -3.4, 0.75, i % 2 === 1, Math.sin(f / 5 + i) * 0.03, false); if (e === "scared" && (f + i * 7) % 20 < 12) fx("sweat", ((f + i * 7) % 20) / 12, x + 0.35, 1.85, -3.2, 0.4); });
  // sheaves in the field vanish after the swarm
  WV.sheaves.forEach((sh, i) => sh.scale.setScalar(f < 252 ? 1 : f >= 332 ? 0.001 : Math.max(0.001, 1 - ramp(f, 252 + (i * 3) % 40, 292 + (i * 3) % 40))));
  switch (S.id) {
    case "hook": {
      const p1 = sm(ramp(f, 70, 108));
      C = { pos: A(lv(lv([-2.3, 2.1, 4.4], [-1.7, 1.9, 1.2], sm(ramp(f, 0, 82))), [0.7, 1.7, 4.6], p1)), look: A(lv([-1.4, 1.2, -3.3], [0.1, 1.6, -1.8], p1)), fov: 40, roll: lerp(-2, 2, u) };
      dockRats(["scared", "scared", "scared"]); theJudge({ expr: "stern" });
      if (f >= 80) { const b = bk(ramp(f, 80, 94)); person(lawyer({ expr: "grin", wave: 1, headTilt: Math.sin(f / 8) * 3 }), 0.4, lerp(-2.6, 0, b), -1.6, 1.15, false, idle(f, 10), true); if (f < 96) fx("puff", ramp(f, 82, 96), 0.4, 0.2, -1.5, 2.0); }
      if (f >= 82 && f < 100) flashA = 0.5 * (1 - ramp(f, 82, 92));
      break; }
    case "village": {
      C = { pos: A(lv([-6, 8, 18], [2.5, 3.2, 9], sm(u))), look: A(lv([0, 2, -16], [1, 3, -20], u)), fov: 46, roll: lerp(2, -1, u) };
      [[-0.9, 0], [0.9, 1], [1.4, 2]].forEach(([x, i]) => person({ kind: "folk", v: i + 1, seed: 1 + i, expr: "neutral", mode: "stand", blink: blink(f, i) }, x, Math.abs(Math.sin(f / 5 + i)) * 0.05, lerp(8, -2, ((lf / 100) + i * 0.3) % 1.2), 1.15, i % 2 === 0, idle(f, i), true));
      fx("bird", (f % 40) / 40, 6 - lf * 0.08, 10, -15, 1.1); fx("cloud", 0, -16 + lf * 0.03, 15, -45, 12); fx("cloud", 0, 18 - lf * 0.02, 17, -50, 10);
      break; }
    case "swarm": {
      C = { pos: A(lv([-6, 2.4, 8], [-11, 3.0, 4], sm(u))), look: A([-16, 1.0, -6]), fov: 50, roll: lerp(-2, 2, u) };
      for (let i = 0; i < 18; i++) { const x = -9.5 - (i % 9) * 2.0 + Math.sin(f / 9 + i) * 0.3, z = -1.5 - Math.floor(i / 9) * 3.4 + ((i * 7) % 5) * 0.3 + lf * 0.01; person(rat({ id: i % 5, expr: "munch", hold: i % 2 ? "barley" : undefined, t: Math.round((f / 30) * 4) / 4 }), x, Math.abs(Math.sin(f / 3 + i)) * 0.08, z, 0.55, i % 2 === 0, Math.sin(f / 4 + i) * 0.05, true); }
      person({ kind: "folk", v: 3, seed: 5, expr: "shock", mode: "stand", wave: 1 }, -6.4, 0, 1.0, 1.15, false, Math.sin(f / 4) * 0.05, true);
      if (f > 270) fx("exclaim", 0, -6.4, 2.6 + Math.sin(f / 5) * 0.05, 1.0, 0.7 * bk(ramp(f, 270, 278)));
      for (let k = 0; k < 4; k++) fx("barley", 0, -11 - k * 2.4, 1.6 + Math.sin(f / 7 + k) * 0.2, -1, 0.7, Math.sin(f / 9 + k) * 0.4);
      break; }
    case "march": {
      C = { pos: A(lv([2.6, 1.7, 8], [0.8, 1.6, 2.5], sm(u))), look: A([0, 1.3, -2]), fov: 44, roll: lerp(2, -2, u) };
      const z = lerp(-12, 1.0, sm(u) * 0.95 + u * 0.05);
      [-1.4, 1.4].forEach((x, i) => person({ kind: "folk", v: i + 2, seed: 8 + i, expr: i ? "grin" : "stern", mode: "stand", wave: 1, blink: blink(f, i) }, x, Math.abs(Math.sin(f / 4 + i)) * 0.1, z, 1.15, i === 0, Math.sin(f / 5 + i) * 0.05, true));
      person({ kind: "folk", v: 5, seed: 12, expr: "stern", mode: "stand", wave: 1 }, 2.6, Math.abs(Math.sin(f / 4)) * 0.1, z - 1.2, 1.15, true, 0.05, true);
      [-0.5, 0, 0.5].forEach((x, i) => person(rat({ id: i + 1, expr: "scared", look: Math.sin(f / 9 + i) }), x, 0.18 + Math.abs(Math.sin(f / 4)) * 0.05, z - 0.12, 0.38, i % 2 === 0, 0, false));
      fx("cage", 0, 0, 0.62 + Math.abs(Math.sin(f / 4)) * 0.05, z + 0.12, 2.0);
      break; }
    case "call": {
      C = { pos: A(lv([0.5, 2.3, -4.0], [0.1, 2.2, -6.6], sm(u))), look: A([0, 2.5, -10]), fov: 40, roll: lerp(-2, 2, u) };
      theJudge({ expr: "shock", wave: Math.sin(f / 4) > 0 ? 1 : undefined, headTilt: Math.sin(f / 6) * 4 });
      fx("call", (f % 16) / 16, 1.0, hyJ + 0.1, -9.5, 1.2 + 0.1 * Math.sin(f / 3), 0, false); fx("call", ((f + 8) % 16) / 16, -1.0, hyJ + 0.1, -9.5, 1.2, Math.PI, false);
      break; }
    case "empty": {
      C = { pos: A(lv([-0.5, 2.1, 2.8], [-1.0, 1.9, 1.6], sm(u))), look: A([-1.4, 0.9, -3.4]), fov: 40, roll: lerp(1, -2, u) };
      theJudge({ expr: "neutral", look: Math.sin(f / 15), headTilt: Math.sin(f / 20) * 4 });
      const a = f / 8; fx("fly", 0, -1.4 + 0.5 * Math.cos(a), 1.3 + 0.2 * Math.sin(a * 1.7), -3.0 + 0.3 * Math.sin(a), 0.3); fx("qmark", 0, -1.4, 2.3 + Math.sin(f / 6) * 0.05, -3.2, 0.8 * bk(ramp(f, 492, 500)), 0.1);
      break; }
    case "lawyer": {
      const pz = sm(ramp(f, 532, 600));
      C = { pos: A(lv([0.2, 1.9, 3.6], [0.0, hyL + 0.05, 1.4], pz)), look: A([0, lerp(1.5, hyL - 0.05, pz), -1.6]), fov: lerp(42, 34, pz), roll: lerp(-2, 2, u) };
      const reason = f >= 611;
      person(lawyer({ expr: reason ? "grin" : "stern", wave: reason ? 1 : undefined, headTilt: reason ? Math.sin(f / 7) * 4 : -3 }), 0, 0, -1.6, 1.15, false, idle(f, 10), true);
      if (f >= 548 && f < 566) fx("spark", ramp(f, 548, 566), 0.9, hyL + 0.2, -1.5, 2.2, 0, true);
      if (reason) fx("spark", ((f - 611) % 20) / 20, -0.7, hyL + 0.35, -1.4, 1.2, 0, true);
      break; }
    case "letter": {
      C = { pos: A(lv([0.05, 0.1, 6.0], [0, 0, 5.0], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(-1.5, 1.5, u) };
      paperBase(sg, ramp(f, 644, 654) * 0.9 + 0.1); header(sg);
      for (let i = 0; i <= 26; i++) { const [x, y] = qpt(i / 26); sg.fillStyle = "#6d5d49"; sg.beginPath(); sg.arc(x, y, 9, 0, 7); sg.fill(); }
      houseIcon(sg, 770, 1190, 1.0);
      const p = sm(ramp(f, 652, 680)) * 0.56, [lx, ly] = qpt(p), fall = sm(ramp(f, 686, 702));
      letterIcon(sg, lx, ly + fall * 160, 1.0, fall * 0.9);
      if (f >= 682) xMark(sg, qpt(0.62)[0], qpt(0.62)[1], bk(ramp(f, 682, 690)) * 0.9);
      WS.tex.needsUpdate = true; WS.scroll.position.set(0, 0, 0); WS.scroll.rotation.z = 0;
      break; }
    case "migrate": {
      C = { pos: A(lv([-3, 2.6, 11], [3, 2.6, 11], sm(u))), look: A([0, 1.0, -4]), fov: 46, roll: lerp(-1, 1, u) };
      for (let i = 0; i < 10; i++) { const v = ramp(f, 702 + i * 3, 748 + i * 3); if (v <= 0 || v >= 1) continue; person(rat({ id: i % 5, expr: "neutral", hold: i % 2 ? "sack" : undefined, look: 1 }), lerp(-9, 9, v), Math.abs(Math.sin(f / 2.5 + i)) * 0.1, -1.0 - (i % 3) * 0.9, 0.5, false, Math.sin(f / 3 + i) * 0.05, true); if ((f + i) % 6 === 0) fx("puff", 0.4, lerp(-9, 9, v) - 0.4, 0.15, -1.0 - (i % 3) * 0.9, 0.5); }
      break; }
    case "pula": {
      C = { pos: A(lv([0.8, hyL, 1.2], [0.4, hyL, 0.6], sm(u))), look: A([0, hyL - 0.05, -1.6]), fov: 34, roll: lerp(3, -2, u) };
      person(lawyer({ expr: "grin", wave: 1, headTilt: -6 + Math.sin(f / 5) * 3 }), 0, 0, -1.6, 1.15, false, idle(f, 10), true); fx("spark", ((f - 774) % 14) / 14, 0.55, hyL + 0.3, -1.4, 1.1, 0, true);
      break; }
    case "road": {
      C = { pos: A(lv([0.3, 0.9, 8.5], [0.15, 1.1, 5.8], sm(u))), look: A([0, 1.0, -16]), fov: lerp(42, 38, u), roll: lerp(-1, 1, u) };
      for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const b = bk(ramp(f, 812 + i * 6 + (sx > 0 ? 3 : 0), 822 + i * 6 + (sx > 0 ? 3 : 0))); if (b > 0) person(cat({ id: i + (sx > 0 ? 6 : 0), expr: "glare" }), sx * 2.3, 0, -1 - i * 3.2, 0.85 * b, sx > 0, 0, true); }
      person(rat({ id: 2, expr: "scared", look: Math.sin(f / 10) * 0.8 }), 0, 0, 3.0, 0.62, false, Math.sin(f / 4) * 0.03, true); fx("sweat", (f % 22) / 22, 0.35, 1.5, 3.1, 0.4);
      break; }
    case "catclose": { const hc = 975 - 520, hyc = hc * SU * 1.4;
      C = { pos: A(lv([0, hyc + 0.05, 3.6], [0, hyc + 0.02, 2.5], sm(u))), look: A([0, hyc - 0.05, 0]), fov: 38, roll: lerp(-3, 3, u) };
      flashA = 0.5 * (1 - ramp(f, 915, 923));
      person(cat({ id: 20, expr: f < 930 ? "glare" : "hiss" }), 0, 0, 0, 1.4, false, Math.sin(f / 3) * 0.02, false);
      [-1, 1].forEach((sx) => person(cat({ id: 21 + (sx > 0 ? 1 : 0), expr: "glare" }), sx * 1.9, 0, -2.2, 1.0, sx > 0, 0, true));
      if (f > 918 && f < 940) fx("exclaim", 0, 0.9, hyc + 0.5, 0.2, 0.8 * bk(ramp(f, 918, 926)), 0.2);
      break; }
    case "agree": {
      C = { pos: A(lv([0.3, hyJ + 0.1, -4.8], [0.1, hyJ, -6.6], sm(u))), look: A([0, hyJ - 0.1, -10]), fov: 36, roll: lerp(-2, 2, u) };
      theJudge({ expr: "neutral", headTilt: Math.sin(f / 4) * 6 });
      break; }
    case "gavel": { const hit = 1000, st = f < hit - 10 ? 0 : f <= hit ? ramp(f, hit - 10, hit) : 1 - ramp(f, hit + 4, hit + 14);
      C = { pos: A(lv([0.2, hyJ - 0.2, -4.6], [0.0, hyJ - 0.3, -6.2], sm(u))), look: A([0, hyJ - 0.4, -9.6]), fov: 40, roll: lerp(2, -2, u) };
      theJudge({ expr: f < hit ? "stern" : "grin", prop: ["hammer", st] }); flashA = f >= hit ? 0.5 * (1 - ramp(f, hit, hit + 8)) : 0;
      if (f >= hit && f < hit + 14) fx("puff", ramp(f, hit, hit + 14), 0.5, 1.7, -8.6, 1.5);
      break; }
    case "escape": {
      C = { pos: A(lv([0, 1.7, 6.0], [0, 1.8, 5.0], sm(u))), look: A([0, 1.3, -3]), fov: 48, roll: lerp(-2, 2, u) };
      person(lawyer({ expr: "grin", headTilt: 10 * Math.sin(f / 6) }), 0.3, 0, -1.8, 1.15, false, 0.03 * Math.sin(f / 5), true);
      [0, 1, 2, 3].forEach((i) => { const v = sm(ramp(f, 1026 + i * 3, 1068)); person(rat({ id: i + 1, expr: "grin", wave: 1 }), lerp(-3.4 + i * 0.5, 5.5 + i, v), Math.abs(Math.sin(f / 2.5 + i)) * 0.12, lerp(-3.4, 0.5 + i * 0.3, v), 0.6, i % 2 === 0, Math.sin(f / 3 + i) * 0.08, true); });
      for (let k = 0; k < 6; k++) { const v = ramp(f, 1030 + k * 3, 1062 + k * 3); if (v > 0 && v < 1) fx("star", v, -2.5 + k, 3.4 + Math.sin(k) * 0.5 - v * 0.6, -2, 0.9); }
      break; }
    case "sneaky": { const hyR = (975 - 500) * SU * 1.2;
      C = { pos: A(lv([0.1, hyR, 2.4], [0.1, hyR, 1.8], sm(u))), look: A([0, hyR - 0.05, -2]), fov: 38, roll: lerp(-2, 2, u) };
      const sn = f >= 1100; person(rat({ id: 1, expr: sn ? "sneaky" : "munch", hold: "barley", t: Math.round((f / 30) * 6) / 6, look: sn ? Math.sin(f / 6) * 1.2 : 0 }), 0, 0, -2, 1.2, false, Math.sin(f / 6) * 0.02, true);
      person(rat({ id: 2, expr: "grin", look: 1 }), 1.3, 0, -2.4, 1.0, true, 0.04, true);
      if (!sn) fx("barley", 0, -0.9, 0.6, -1.9, 0.9, 0.3); if (f % 8 < 4 && !sn) fx("bits", (f % 8) / 4, 0.1, hyR - 0.4, -1.8, 0.5);
      if (sn) fx("sweat", (f % 22) / 22, 0.55, hyR + 0.2, -1.8, 0.45);
      break; }
    case "finale": { const jump = ramp(f, 1152, 1160), hiss = f >= 1160;
      C = { pos: A(lv([0, 1.6, 5.6], [0, 1.7, 5.0], sm(u))), look: A([0, 1.2, -3]), fov: 46, roll: 0 };
      flashA = f >= 1158 ? 0.7 * (1 - ramp(f, 1158, 1166)) : 0;
      const sc = f >= 1158;
      person(lawyer({ expr: sc ? "shock" : "grin", wave: sc ? 1 : undefined, headTilt: sc ? -8 : 0 }), 0.2, sc ? Math.abs(Math.sin((f - 1158) / 2)) * 0.1 : 0, -3.0, 1.15, false, sc ? Math.sin(f) * 0.03 : 0, true);
      [-2.0, -1.0, 1.3].forEach((x, i) => person(rat({ id: i + 1, expr: sc ? "scared" : "grin", look: Math.sin(f / 5 + i) }), x, sc ? Math.abs(Math.sin((f - 1158) / 2 + i)) * 0.15 : 0, -0.6 - i * 0.2, 0.62, i % 2 === 0, sc ? Math.sin(f * 1.3 + i) * 0.12 : 0, true));
      if (f >= 1133) { const j = eo(jump); person(cat({ id: 30, expr: hiss ? "hiss" : "glare" }), 0, lerp(0.6, 0, j), lerp(-9.6, 1.4, j), lerp(0.7, 1.5, j), false, 0, false); }
      if (f > 1158 && f < 1172) fx("exclaim", 0, 1.2, 2.8, 1.2, 1.0 * bk(ramp(f, 1158, 1166)), 0.2);
      break; }
  }
  if (S.st === "H") { flames.forEach(([x, y, z], i) => fx("flame", 0, x, y + Math.sin(f / 3 + i) * 0.03, z, 0.5 + Math.sin(f / 2.3 + i) * 0.04, 0, true)); if (WH.shafts) WH.shafts.forEach((c, i) => (c.material.opacity = 0.09 + 0.025 * Math.sin(f / 22 + i))); }
  let kx = 0, ky = 0; for (const [kf, amp] of KICKS) { const d = f - kf; if (d >= 0 && d < 9) { const e = Math.exp(-d / 2.5) * amp; kx += Math.sin(d * 2.7) * 0.05 * e; ky += Math.cos(d * 3.3) * 0.05 * e; } }
  cam.fov = C.fov; cam.position.set(C.pos[0] + kx, C.pos[1] + ky, C.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(...C.look); cam.rotateZ((C.roll * Math.PI) / 180 + kx * 0.4); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); CAMP.copy(cam.position);
  sun.position.set(cam.position.x + LOOK[S.look].dir[2][0], cam.position.y + LOOK[S.look].dir[2][1], cam.position.z + LOOK[S.look].dir[2][2]); sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -3)); sun.target.updateMatrixWorld();
  QUEUE.forEach((q) => q()); QUEUE = [];
  for (const k in pools) for (let i = used[k]; i < pools[k].length; i++) pools[k][i].visible = false;
  flash.material.opacity = flashA; tint.material.opacity = tintA;
  renderer.clear(); renderer.render(scene, cam); renderer.render(ovS, ovC);
};
window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.93); };
window.drawOnly = (f) => { frame(f); return true; };
window.ready = true;
