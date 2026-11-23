import * as THREE from "three";
import { drawPerson, headGeo, CW, CH } from "./cast.js";
import { drawFx3 as drawFx2 } from "./fx3.js";
import { Pen, INK } from "./toon.ts";
import { addM, mkMat, buildDesk } from "./world.js";
import { buildTown, buildHarbor } from "./world2.js";

const Q = new URLSearchParams(location.search), W = +(Q.get("w") || 1080), H = Math.round((W * 16) / 9);
const FPS = 30, TOTAL = 1213, SU = 0.00216;
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
const ORG = { M: [-100, 0, 0], H: [100, 0, 0], S: [0, 0, 100] };
const grp = (k) => { const g = new THREE.Group(); g.position.set(...ORG[k]); scene.add(g); return g; };
const gM = grp("M"), gH = grp("H"), gS = grp("S");
const WM = buildTown(gM), WH = buildHarbor(gH), WS = buildDesk(gS);
const stages = { M: gM, H: gH, S: gS };

const LOOK = {
  day: { bg: ["#4fb3f0", "#fff0c4"], fog: 0xfbe9c0, fn: [40, 170], hemi: [0xffffff, 0xc9a070, 1.15], dir: [0xfff0c8, 1.5, [-5, 9, 6]], card: 0xfff6e6 },
  sea: { bg: ["#3d9be0", "#d5f1ff"], fog: 0xcdeaff, fn: [50, 190], hemi: [0xffffff, 0x8fb0c8, 1.15], dir: [0xfff4d8, 1.5, [-5, 9, 6]], card: 0xfffaf0 },
  war: { bg: ["#8a6a78", "#f0b07a"], fog: 0xd9a47e, fn: [30, 140], hemi: [0xffe6d0, 0x9a7060, 1.1], dir: [0xffc890, 1.5, [-5, 7, 6]], card: 0xffe8d4 },
  dusk: { bg: ["#7a5a90", "#f5a46a"], fog: 0xd8a080, fn: [28, 120], hemi: [0xffe0c8, 0x806078, 1.1], dir: [0xffc890, 1.4, [-5, 7, 6]], card: 0xffe6d4 },
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
  const key = "P" + quant(o), tex = getTex(key, CW, CH, (cv) => drawPerson(cv, o)); const m = grab("p", PGEO, { at: 0.5 });
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
const bigNum = (g, txt, cx, cy, fs, col, sc = 1, rot = 0) => { g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(sc, sc); g.font = `bold ${fs}px 'DejaVu Sans', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = fs * 0.09; g.strokeStyle = INK; g.strokeText(txt, 0, 0); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore(); };
const coins = (g, cx, cy, n, s) => { for (let i = 0; i < n; i++) { g.fillStyle = "#e8b932"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.ellipse(cx, cy - i * 20 * s, 48 * s, 20 * s, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#f6d466"; g.beginPath(); g.ellipse(cx, cy - i * 20 * s - 4 * s, 34 * s, 12 * s, 0, 0, 7); g.fill(); } };
const shopIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g);
  p.poly([[-130, -30], [130, -30], [130, 120], [-130, 120]], "#fbe3b0", 12); p.poly([[-150, -80], [150, -80], [150, -30], [-150, -30]], "#c4573b", 12);
  for (let i = 0; i < 6; i++) { const x0 = -150 + i * 50; p.poly([[x0, -30], [x0 + 50, -30], [x0 + 46, 12], [x0 + 4, 12]], i % 2 ? "#ffffff" : "#e0443a", 8); }
  p.poly([[-30, 24], [30, 24], [30, 120], [-30, 120]], "#3a2530", 8); p.ell(-90, 66, 26, 26, "#bfe8f2", 8); p.ell(90, 66, 26, 26, "#bfe8f2", 8); p.ell(0, -118, 44, 34, "#f1b46c", 10); p.ell(0, -128, 34, 22, "#f08ab0", 8); g.restore(); };
const cannonIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g);
  p.poly([[-130, -10], [110, -70], [138, -28], [-112, 46]], "#34363f", 12); p.poly([[-70, 40], [60, 8], [74, 62], [-60, 84]], "#7a4d2b", 10);
  p.ell(-10, 100, 52, 52, "#8a5a32", 12); p.ell(-10, 100, 12, 12, "#c9a24a", 6); for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 4; p.stroke([[-10 - Math.cos(a) * 46, 100 - Math.sin(a) * 46], [-10 + Math.cos(a) * 46, 100 + Math.sin(a) * 46]], 7, "#c9a24a"); }
  const st = []; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = i % 2 ? 22 : 52; st.push([196 + Math.cos(a) * r, -92 + Math.sin(a) * r]); } p.poly(st, "#ff9b2e", 8); p.ell(196, -92, 18, 18, "#ffe27a", 0); g.restore(); };
const bootIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g);
  p.poly([[-34, -150], [34, -150], [36, 36], [-36, 36]], "#f6f3ea", 12); p.stroke([[-20, -146], [-22, 34]], 9, "#c0353a"); p.poly([[-42, -160], [42, -160], [42, -122], [-42, -122]], "#fffdf6", 11); p.stroke([[-42, -140], [42, -140]], 6, "#d9d4c4");
  p.poly([[-38, 36], [38, 36], [92, 80], [94, 118], [-38, 118]], "#241726", 12); g.restore(); };
const ICON = [shopIcon, cannonIcon, bootIcon];

// ---------------------------------------------------------------- shots
const SHOTS = [
  { id: "hook", a: 0, b: 106, st: "S", look: "paper" }, { id: "town", a: 106, b: 230, st: "M", look: "day" }, { id: "baker", a: 230, b: 374, st: "M", look: "day" },
  { id: "bill", a: 374, b: 440, st: "S", look: "paper" }, { id: "tiny", a: 440, b: 543, st: "M", look: "day" }, { id: "refuse", a: 543, b: 593, st: "M", look: "day" },
  { id: "bill2", a: 593, b: 655, st: "S", look: "paper" }, { id: "fleet", a: 655, b: 724, st: "H", look: "sea" }, { id: "volley", a: 724, b: 802, st: "H", look: "war" },
  { id: "fight", a: 802, b: 889, st: "H", look: "war" }, { id: "hit", a: 889, b: 959, st: "H", look: "war" }, { id: "stump", a: 959, b: 1007, st: "M", look: "dusk" },
  { id: "burial", a: 1007, b: 1087, st: "M", look: "dusk" }, { id: "icons", a: 1087, b: 1213, st: "S", look: "paper" },
];
const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const hyOf = (seed, stout, s) => (975 - headGeo(seed, 0, stout).hc) * SU * s;
const KICKS = [[71, 0.6], [472, 0.4], [551, 0.9], [612, 1.1], [669, 0.3], [735, 0.3], [742, 0.3], [750, 0.3], [772, 0.6], [782, 0.6], [790, 0.7], [912, 1.3], [969, 0.4], [1078, 1.0], [1096, 0.3], [1198, 1.2]];
const blink = (f, seed) => ((f * 7 + seed * 31) % 96) < 4 ? 1 : 0;
const idle = (f, seed) => Math.sin(f / 14 + seed * 2) * 0.012;
const ball = (f, f0, dur, A, B, arc, s) => { const v = (f - f0) / dur; if (v < 0 || v > 1) return; fx("cball", 0, lerp(A[0], B[0], v), lerp(A[1], B[1], v) + 4 * v * (1 - v) * arc, lerp(A[2], B[2], v), s); };
const FOLK = [[-1.6, -1.0], [2.6, -2.4], [-3.0, -3.5], [3.6, 0.5], [0.2, 2.5]];

const frame = (f) => {
  for (const k in used) used[k] = 0; QUEUE = [];
  const S = shotAt(f), u = (f - S.a) / (S.b - S.a), lf = f - S.a; curStage = S.st;
  for (const k in stages) stages[k].visible = k === S.st;
  if (curLook !== S.look) setLook(S.look);
  const [ox, oy, oz] = ORG[S.st]; let C = null; const A = (a) => [a[0] + ox, a[1] + oy, a[2] + oz];
  let flashA = 0, tintA = 0; WS.scroll.visible = S.id !== "hook";
  const chef = (o) => ({ kind: "remontel", seed: 6, blink: blink(f, 6), mode: "stand", ...o });
  const santa = (o) => ({ kind: "santa", seed: 7, blink: blink(f, 7), mode: "stand", ...o });
  const offc = (o) => ({ kind: "official", seed: 8, blink: blink(f, 8), mode: "stand", ...o });
  switch (S.id) {
    case "hook": { const push = sm(ramp(f, 60, 106));
      C = { pos: A([0, 0.1, lerp(6.2, 4.9, push)]), look: A([0, 0, 0]), fov: 40, roll: lerp(-2, 2, u) };
      flashA = f >= 71 ? 0.55 * (1 - ramp(f, 71, 80)) : 0;
      const hop = Math.abs(Math.sin(f / 5)) * 0.1 * (f > 39 ? 1 : 0.2);
      person(santa({ oneleg: true, expr: f < 39 ? "stern" : "shock", headTilt: f > 39 ? -6 : 0 }), -0.35, -1.75 + hop, 0, 1.35, false, Math.sin(f / 7) * 0.04, false);
      if (f >= 39) { fx("boot", 0, 1.2, 0.9 + Math.sin(f / 8) * 0.12, 0.3, 1.9 * bk(ramp(f, 39, 48)), 0.4 + Math.sin(f / 9) * 0.2); if (f < 52) fx("star", ramp(f, 39, 52), 1.2, 0.9, 0.5, 2.0); }
      if (f < 39) fx("qmark", 0, -0.2, 1.55 + Math.sin(f / 6) * 0.05, 0.3, 0.8 * bk(ramp(f, 8, 16)), 0.1);
      const PK = [["pastry", -1.15, 1.3], ["cake", 1.15, -0.55], ["croissant", -1.2, -0.45]];
      PK.forEach(([k, x, y], i) => { const s = bk(ramp(f, 72 + i * 4, 82 + i * 4)) * (1.5 + 0.25 * sm(ramp(f, 90, 106))); if (s > 0) fx(k, 0, x, y + Math.sin(f / 8 + i * 2) * 0.1, 0.4, s, Math.sin(f / 9 + i) * 0.25); });
      break; }
    case "town": {
      C = { pos: A(lv([-2, 7.5, 15], [1.5, 3.0, 6.5], sm(u))), look: A(lv([0, 2.4, -9], [-0.5, 3.2, -9], u)), fov: lerp(48, 44, u), roll: lerp(2, -1, u) };
      person(chef({ expr: "grin", wave: 1 }), 0.9, 0, -5.0, 1.15, false, idle(f, 6), true);
      FOLK.forEach(([x, z], i) => person({ kind: "folk", v: i, seed: 1 + i, expr: i % 2 ? "grin" : "neutral", mode: "stand", blink: blink(f, i) }, x + Math.sin(f / 30 + i) * 0.4, Math.abs(Math.sin(f / 5 + i)) * 0.05, z, 1.15, i % 2 === 0, idle(f, i), true));
      fx("cloud", 0, -16 + lf * 0.03, 15, -45, 12); fx("cloud", 0, 18 - lf * 0.02, 17, -50, 10); fx("bird", (f % 40) / 40, 6 - lf * 0.08, 10, -15, 1.1);
      break; }
    case "baker": { const wide = sm(ramp(f, 262, 292)), hy = hyOf(6, true, 1.15);
      C = { pos: A(lv([0.9, hy + 0.05, -0.9], [-1.2, 2.0, 4.6], wide)), look: A(lv([0.5, hy - 0.05, -4.2], [0.3, 1.5, -5], wide)), fov: lerp(34, 46, wide), roll: lerp(-2, 2, u) };
      person(chef({ expr: f < 262 ? "grin" : f < 330 ? "shock" : "pained", wave: f >= 290 ? 1 : undefined, headTilt: f < 262 ? Math.sin(f / 10) * 4 : 0 }), 0.5, 0, -4.2, 1.15, false, idle(f, 6), true);
      if (f < 262) fx("croissant", 0, 1.4, hy + 0.2 + Math.sin(f / 8) * 0.08, -4.1, 1.1 * bk(ramp(f, 232, 242)), 0.3);
      if (f >= 300) { fx("sweat", (f % 24) / 24, 0.9, hy + 0.15, -4.1, 0.5); fx("sweat", ((f + 12) % 24) / 24, 0.0, hy + 0.05, -4.1, 0.45); }
      for (let i = 0; i < 5; i++) { const p = ramp(f, 276 + i * 3, 372); if (p <= 0 || p >= 1) continue; person({ kind: "folk", v: i + 2, seed: 20 + i, expr: i % 2 ? "grin" : "stern", mode: "stand", wave: 1, blink: blink(f, i) }, lerp(-7, 7, p), Math.abs(Math.sin(f / 3 + i)) * 0.12, -2.5 - (i % 3) * 0.9, 1.15, true, Math.sin(f / 4 + i) * 0.08, true); }
      for (let k = 0; k < 4; k++) { const v = (f - (290 + k * 14)) / 36; if (v < 0 || v > 1) continue; fx(k % 2 ? "cake" : "pastry", 0, 0.2 + (k - 1.5) * 1.6 * v, 1 + 4 * v * (1 - v) * 2.2, -5.4, 0.8, v * 6); }
      if (f > 270 && f < 285) fx("puff", ramp(f, 270, 285), 0.2, 0.6, -5.2, 2.2);
      break; }
    case "bill": { C = { pos: A(lv([0.1, 0.1, 6.0], [0, -0.05, 5.0], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(-1.5, 1, u) };
      paperBase(sg, ramp(f, 374, 386) * 0.9 + 0.1); header(sg); const np = bk(ramp(f, 388, 398));
      if (np > 0) { bigNum(sg, "60.000", 512, 760, 170, "#c0262d", np); coins(sg, 290, 1060, 3, 1.2 * np); coins(sg, 512, 1090, 5, 1.2 * np); coins(sg, 734, 1060, 2, 1.2 * np); }
      if (f >= 418) ring(sg, 512, 760, 1.2 * (1 + (1 - eo(ramp(f, 418, 424))) * 0.5), -0.08, "");
      WS.tex.needsUpdate = true; WS.scroll.position.set(0, 0, 0); WS.scroll.rotation.z = 0;
      if (f > 388 && f < 400) fx("puff", ramp(f, 388, 400), 0, -0.3, 0.5, 1.8);
      break; }
    case "tiny": { const hy = hyOf(6, true, 1.15);
      C = { pos: A(lv([3.6, 2.4, 5.5], [1.2, 2.0, 3.4], sm(u))), look: A([0, 3.0, -8]), fov: 44, roll: lerp(1.5, -1.5, u) };
      person(chef({ expr: f < 472 ? "grin" : "nervous", wave: f < 472 ? 1 : undefined, headTilt: f < 472 ? -6 : 0 }), -1.3, 0, -4.8, 1.15, false, idle(f, 6), true);
      if (f >= 472) fx("tag", 0, 0, 5.0 + Math.sin(f / 9) * 0.1, -6.4, 2.6 * bk(ramp(f, 472, 484)), -0.04);
      if (f > 500) { fx("qmark", 0, -1.3, hy + 0.55, -4.7, 0.9 * bk(ramp(f, 500, 508)), 0.1); fx("sweat", (f % 24) / 24, -0.75, hy + 0.1, -4.7, 0.45); }
      FOLK.slice(0, 3).forEach(([x, z], i) => person({ kind: "folk", v: i + 4, seed: 30 + i, expr: "neutral", mode: "stand", blink: blink(f, i) }, x + 1, 0, z + 1.5, 1.15, i % 2 === 0, idle(f, i), true));
      break; }
    case "refuse": { const hy = hyOf(8, true, 1.25);
      C = { pos: A(lv([0.1, hy + 0.05, 3.6], [0, hy + 0.0, 2.9], sm(u))), look: A([0, hy - 0.05, -2]), fov: 38, roll: lerp(-2, 2, u) };
      person(offc({ expr: "stern", headTilt: f > 551 ? 5 : 0 }), 0, 0, -2, 1.25, false, idle(f, 8), true);
      if (f >= 551) fx("xmark", 0, 0.8, hy + 0.55, -1.8, 1.5 * bk(ramp(f, 551, 560)), -0.1);
      [[-1.9, -3.6], [1.9, -4.0]].forEach(([x, z], i) => person({ kind: "folk", v: i + 1, seed: 40 + i, expr: "stern", mode: "stand", wave: 1 }, x, Math.abs(Math.sin(f / 4 + i)) * 0.08, z, 1.15, i === 0, Math.sin(f / 5 + i) * 0.05, true));
      break; }
    case "bill2": { C = { pos: A(lv([0.05, 0.1, 6.0], [0, 0, 4.8], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(1, -1.5, u) };
      paperBase(sg, 1); header(sg); const z0 = f >= 612, zp = bk(ramp(f, 612, 621)), shk = z0 ? Math.sin(f * 2.1) * 0.015 * (1 - ramp(f, 612, 640)) : 0;
      if (!z0) bigNum(sg, "60.000", 512, 760, 170, "#c0262d"); else bigNum(sg, "600.000", 512, 760, 150, "#c0262d", 0.9 + 0.1 * zp + 0.12 * (1 - ramp(f, 612, 624)), shk);
      coins(sg, 290, 1060, z0 ? 6 : 3, 1.2); coins(sg, 512, 1090, z0 ? 9 : 5, 1.2); coins(sg, 734, 1060, z0 ? 5 : 2, 1.2);
      if (f >= 636) ring(sg, 512, 760, 1.28 * (1 + (1 - eo(ramp(f, 636, 642))) * 0.4), -0.08, "");
      tintA = z0 ? 0.14 * Math.max(0, 1 - ramp(f, 612, 655)) : 0; flashA = f >= 612 ? 0.7 * (1 - ramp(f, 612, 620)) : 0;
      WS.tex.needsUpdate = true; WS.scroll.position.set(0, 0, 0); WS.scroll.rotation.z = 0;
      if (f >= 612 && f < 626) fx("boom", ramp(f, 612, 626), 0, -0.3, 0.6, 2.8);
      break; }
    case "fleet": {
      C = { pos: A(lv([-14, 7.5, 14], [10, 7.5, 10], sm(u))), look: A(lv([-4, 3.2, -34], [8, 3.2, -34], u)), fov: 46, roll: lerp(-2, 2, u) };
      fx("bird", (f % 40) / 40, -6 + lf * 0.1, 15, -40, 1.6); fx("bird", ((f + 17) % 40) / 40, 8 - lf * 0.08, 18, -55, 1.8); fx("cloud", 0, 10, 20, -80, 20); fx("cloud", 0, -30, 24, -90, 18);
      break; }
    case "volley": {
      const gunsOf = WH.ships.slice(0, 3).map((s) => s.guns);
      if (f < 763) { const p = sm(ramp(f, 724, 763));
        C = { pos: A(lv([-8, 7.5, 10], [8, 7.5, 8], p)), look: A(lv([-6, 3.2, -34], [8, 3.2, -34], p)), fov: 46, roll: lerp(-2, 2, p) };
        gunsOf.forEach((gs, i) => gs.forEach((gp, k) => { const t = 726 + i * 6 + k * 3, v = ramp(f, t, t + 12); if (v > 0 && v < 1) { fx("boom", v, gp[0], gp[1] + 0.6, gp[2] + 0.5, 1.6, 0, true); fx("smoke", v, gp[0], gp[1] + 1.0, gp[2] + 0.6, 2.4); } ball(f, t, 20, [gp[0], gp[1] + 0.6, gp[2]], [(k - 2) * 3.2, 3.5, -5], 6, 0.8); }));
      } else { const p = ramp(f, 763, 802);
        C = { pos: A([lerp(-4, 4, sm(p)), 4.2, -12.5]), look: A([0, 3.2, -4]), fov: 48, roll: lerp(2, -2, p) };
        [[-5, 772, 3.6], [-1, 782, 3.2], [3, 790, 3.6], [6, 797, 3.4]].forEach(([x, t, y], i) => { ball(f, t - 14, 14, [x * 1.4, 4.6, -20], [x, y, -5.2], 2.5, 0.9); const v = ramp(f, t, t + 12); if (v > 0 && v < 1) { fx("boom", v, x, y, -5.1, 2.8, 0, true); fx("smoke", v, x + 0.2, y + 0.4, -5.0, 3.0); } if (i % 2 === 0) { const w = ramp(f, t - 6, t + 10); if (w > 0 && w < 1) fx("splash", w, x * 0.6 + 2, 0.3, -9, 3.0); } });
        [-5, -1, 3, 6].forEach((x, i) => person({ kind: "guard", seed: 1 + (i % 2), expr: "shock", mode: "stand", blink: blink(f, i) }, x, 3.3 - 0.0 + Math.abs(Math.sin(f / 3 + i)) * 0.06, -3.6, 1.1, i % 2 === 0, Math.sin(f / 3 + i) * 0.05, false));
      }
      break; }
    case "fight": { const hy = hyOf(7, true, 1.25) + 3.3;
      C = { pos: A(lv([-2.5, 3.0, 5.5], [1.8, 4.4, 3.4], sm(u))), look: A([0.2, 4.6, -4]), fov: 42, roll: lerp(-3, 3, u) };
      person(santa({ expr: "stern", wave: 1, headTilt: Math.sin(f / 9) * 4 }), 0, 3.3, -3.6, 1.25, false, idle(f, 7), false);
      [[-4.2, "stern"], [4.2, "grin"]].forEach(([x, e], i) => person({ kind: i ? "officer" : "guard", seed: 3 + i, expr: e, mode: "stand", wave: i ? 1 : undefined }, x, 3.3, -3.6, 1.15, x < 0, idle(f, i), false));
      [0, 1, 2, 3, 4, 5].forEach((i) => { const t = 812 + i * 12, c = WH.cannons[i % 4], v = ramp(f, t, t + 12); if (v > 0 && v < 1) { fx("boom", v, c[0], c[1], c[2] + 0.2, 2.2, 0, true); fx("smoke", v, c[0], c[1] + 0.5, c[2], 2.6); } ball(f, t, 24, [c[0], c[1], c[2]], [c[0] * 3, 5, -30], 3, 0.7); });
      if (f > 806 && f < 818) fx("spark", ramp(f, 806, 818), 0, hy + 0.3, -3.4, 2.0, 0, true);
      break; }
    case "hit": { const hy = hyOf(7, true, 1.25) + 3.3, im = f >= 912, post = ramp(f, 912, 959);
      C = { pos: A(lv([9, 4.4, -3.2], [5.2, 4.2, -2.6], sm(ramp(f, 889, 912)))), look: A([0, hy - 0.45, -3.6]), fov: lerp(40, 36, sm(ramp(f, 889, 912))), roll: lerp(-2, 3, u) };
      flashA = im ? 0.95 * (1 - ramp(f, 912, 920)) : 0;
      const topple = sm(ramp(f, 920, 954));
      person(santa({ oneleg: im, expr: !im ? "shock" : f < 930 ? "shock" : "dazed", headTilt: im ? -8 : 0, wave: !im ? 1 : undefined }), 0, 3.3, -3.6, 1.25, false, im ? 0.9 * topple + Math.sin(f / 2) * 0.03 * (1 - topple) : idle(f, 7), false);
      if (!im) { ball(f, 893, 19, [-9, hy - 1.0, -6.0], [-0.2, 3.7, -3.5], 1.5, 0.6); for (let k = 1; k < 4; k++) { const v = (f - 893) / 19 - k * 0.12; if (v > 0 && v < 1) fx("smoke", 0.3, lerp(-9, -0.2, v), lerp(hy - 1.0, 3.7, v) + 6 * v * (1 - v) * 0.25, lerp(-6, -3.5, v), 0.9); } }
      if (im) { const bv = ramp(f, 912, 948); fx("boot", 0, lerp(0.1, 5.2, bv), 3.6 + Math.sin(bv * Math.PI) * 3.8, lerp(-3.4, -2.2, bv), 1.3, bv * 12);
        if (f < 928) { fx("boom", ramp(f, 912, 928), 0, 3.7, -3.3, 3.2, 0, true); fx("smoke", ramp(f, 912, 940), 0.2, 4.0, -3.2, 3.2); }
        if (f > 925) fx("star", ((f - 925) % 24) / 24, 0, hy + 0.5, -3.4, 1.4); if (f > 930) fx("bird", (f % 40) / 40, -2, hy + 2.2, -3.0, 1.0); }
      [-4.4, 4.4].forEach((x, i) => person({ kind: "guard", seed: 1 + i, expr: im ? "shock" : "stern", mode: "stand" }, x, 3.3, -3.6, 1.1, x < 0, 0, false));
      break; }
    case "stump": { const hy = hyOf(7, true, 1.25);
      C = { pos: A(lv([0.3, 1.7, 4.0], [0.1, 1.5, 3.0], sm(u))), look: A([0, 1.5, -2]), fov: 40, roll: lerp(-2, 2, u) };
      flashA = 0.5 * (1 - ramp(f, 969, 977));
      person(santa({ oneleg: true, expr: f < 969 ? "pained" : "dazed", headTilt: 8, tilt: 0 }), 0, 0, -2, 1.25, false, Math.sin(f / 8) * 0.03, true);
      fx("boot", 0, 1.15, 1.0 + Math.sin(f / 9) * 0.1, -1.6, 1.5, 0.35 + Math.sin(f / 10) * 0.1);
      fx("sweat", (f % 24) / 24, 0.45, hy + 0.2, -1.9, 0.5); if (f > 969 && f < 985) fx("star", ramp(f, 969, 985), 0, hy + 0.55, -1.9, 1.5);
      person({ kind: "officer", seed: 4, expr: "shock", mode: "stand", blink: blink(f, 4) }, -1.8, 0, -2.6, 1.15, false, idle(f, 4), true); person({ kind: "guard", seed: 2, expr: "pained", mode: "stand" }, 1.9, 0, -2.6, 1.15, true, idle(f, 5), true);
      break; }
    case "burial": { const volley = f >= 1078;
      C = { pos: A(lv([0, 1.6, 6.0], [0, 2.0, 2.2], sm(u))), look: A([0, 1.3, -3]), fov: 44, roll: lerp(-1.5, 1.5, u) };
      flashA = volley ? 0.5 * (1 - ramp(f, 1078, 1085)) : 0;
      fx("coffin", 0, 0, 1.25 + Math.sin(f / 14) * 0.04, -3.0, 2.2, Math.sin(f / 20) * 0.03);
      [-1, 1].forEach((sx) => [0, 1, 2].forEach((r) => person({ kind: "guard", seed: 1 + (r % 2), expr: "stern", mode: "stand", blink: blink(f, r + sx) }, sx * 1.9, 0, -1.2 - r * 2.0, 1.15, sx > 0 ? false : true, 0, true)));
      if (volley) [-1, 1].forEach((sx) => [0, 1, 2].forEach((r) => { const v = ramp(f, 1078, 1096); if (v < 1) { fx("boom", v, sx * 1.9 + sx * 0.3, 2.0, -1.2 - r * 2.0, 1.3, 0, true); fx("smoke", v, sx * 1.9, 2.4, -1.2 - r * 2.0, 1.6); } }));
      if (volley) for (let i = 0; i < 4; i++) fx("bird", ((f + i * 9) % 40) / 40, -3 + i * 2 + (f - 1078) * 0.02, 4 + (f - 1078) * 0.08 + i * 0.3, -5, 1.1);
      break; }
    case "icons": { C = { pos: A(lv([0.05, 0, 6.2], [0, 0, 5.3], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(-1, 1, u) };
      paperBase(sg, 1); header(sg); const T0 = [1090, 1138, 1174];
      T0.forEach((t0, i) => { const pp = bk(ramp(f, t0, t0 + 9)); if (pp <= 0) return; const cy = 430 + i * 360; bigNum(sg, "1", 250, cy, 300, "#c0262d", pp); ICON[i](sg, 640, cy + (i === 1 ? 10 : i === 2 ? 50 : 0), (i === 2 ? 0.8 : 1.1) * pp); });
      if (f >= 1198) { ring(sg, 640, 430 + 2 * 360 + 30, 1.0 * (1 + (1 - eo(ramp(f, 1198, 1206))) * 0.4), -0.08, ""); flashA = 0.6 * (1 - ramp(f, 1198, 1206)); }
      WS.tex.needsUpdate = true; WS.scroll.position.set(0, 0, 0); WS.scroll.rotation.z = 0;
      T0.forEach((t0, i) => { if (f > t0 + 1 && f < t0 + 13) fx("puff", ramp(f, t0 + 1, t0 + 13), 0.3, 0.9 - i * 0.55 * 1.0, 0.6, 1.6); });
      break; }
  }
  // camera + kicks
  let kx = 0, ky = 0; for (const [kf, amp] of KICKS) { const d = f - kf; if (d >= 0 && d < 9) { const e = Math.exp(-d / 2.5) * amp; kx += Math.sin(d * 2.7) * 0.05 * e; ky += Math.cos(d * 3.3) * 0.05 * e; } }
  cam.fov = C.fov; cam.position.set(C.pos[0] + kx, C.pos[1] + ky, C.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(...C.look); cam.rotateZ((C.roll * Math.PI) / 180 + kx * 0.4); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); CAMP.copy(cam.position);
  sun.position.set(cam.position.x + LOOK[S.look].dir[2][0], cam.position.y + LOOK[S.look].dir[2][1], cam.position.z + LOOK[S.look].dir[2][2]); sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -3)); sun.target.updateMatrixWorld();
  QUEUE.forEach((q) => q()); QUEUE = [];
  if (S.st === "H") { WH.ships.forEach((s, i) => { s.g.position.y = Math.sin(f / 9 + i * 2) * 0.14; s.g.rotation.z = Math.sin(f / 11 + i) * 0.03; }); WH.mflag.rotation.y = Math.sin(f / 6) * 0.25; }
  if (S.st === "M" && WM.flags) WM.flags.forEach((t, i) => (t.rotation.z = Math.sin(f / 7 + i) * 0.25));
  for (const k in pools) for (let i = used[k]; i < pools[k].length; i++) pools[k][i].visible = false;
  flash.material.opacity = flashA; tint.material.opacity = tintA;
  renderer.clear(); renderer.render(scene, cam); renderer.render(ovS, ovC);
};
window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.93); };

// ---- audit penempatan (dipakai probe_frame.mjs) ----
// Mengembalikan posisi layar (NDC) tiap kartu yang tampak + tinggi dunia terendahnya,
// supaya cacat seperti "terpotong tepi frame" atau "mengapung" bisa DIUKUR, bukan ditaksir.
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
