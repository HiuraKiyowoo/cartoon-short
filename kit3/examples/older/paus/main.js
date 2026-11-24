import * as THREE from "three";
import { drawPerson, drawMitreCard, headGeo, CW, CH } from "./cast.js";
import { drawFx2 } from "./fx2.js";
import { Pen, INK } from "./toon.ts";
import { addM, mkMat, buildGrave, buildRome, buildHall, buildJail, buildDesk } from "./world.js";

const Q = new URLSearchParams(location.search), W = +(Q.get("w") || 1080), H = Math.round((W * 16) / 9);
const FPS = 30, TOTAL = 1376, SU = 0.00216;
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
const ORG = { G: [-100, 0, 0], C: [100, 0, 0], B: [0, 0, 0], J: [0, 0, -100], S: [0, 0, 100] };
const grp = (k) => { const g = new THREE.Group(); g.position.set(...ORG[k]); scene.add(g); return g; };
const gG = grp("G"), gC = grp("C"), gB = grp("B"), gJ = grp("J"), gS = grp("S");
const WG = buildGrave(gG), WC = buildRome(gC), WB = buildHall(gB), WJ = buildJail(gJ), WS = buildDesk(gS);
const stages = { G: gG, C: gC, B: gB, J: gJ, S: gS };
const flames = []; for (const [x, y, z] of WB.flames) flames.push([x, y, z]);

const LOOK = {
  night: { bg: ["#0f1438", "#3b4088"], fog: 0x262c6a, fn: [16, 85], hemi: [0x8a9be0, 0x1d2a3a, 1.15], dir: [0xbcc8ff, 1.5, [-4, 8, 5]], card: 0xc4cff8 },
  rage: { bg: ["#2a0b1a", "#8a2a30"], fog: 0x4a1424, fn: [14, 70], hemi: [0xffa0a0, 0x301018, 1.1], dir: [0xffb0a0, 1.5, [-4, 8, 5]], card: 0xffd0c8 },
  dusk: { bg: ["#e8754a", "#ffd9a0"], fog: 0xf5b87c, fn: [50, 230], hemi: [0xfff0d0, 0xb08060, 1.15], dir: [0xffe0a0, 1.6, [-6, 6, 6]], card: 0xffead0 },
  hall: { bg: ["#3a2a3f", "#6a4a4a"], fog: 0x5a4048, fn: [24, 62], hemi: [0xfff2d8, 0x806050, 1.2], dir: [0xffe6b0, 1.2, [-3, 8, 6]], card: 0xfff2dc },
  jail: { bg: ["#1d2036", "#343a5c"], fog: 0x262a44, fn: [10, 34], hemi: [0xa9b6e8, 0x40385a, 1.5], dir: [0xcfe0ff, 1.5, [-2, 6, 4]], card: 0xe4eaff },
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
const mitreImpl = (x, y, z, s, rz, tilt = 0) => { const tex = getTex("M" + Math.round(tilt), CW, CH, (cv) => drawMitreCard(cv, tilt)); const m = grab("p", PGEO, { at: 0.5 }); const [ox, oy, oz] = OF(); m.visible = true; m.material.map = tex; m.material.color.copy(cardTint); m.position.set(ox + x, oy + y, oz + z); m.rotation.set(0, yawTo(ox + x, oz + z), 0); m.rotateZ(rz); m.scale.set(s, s, 1); };

let QUEUE = [];
const person = (...a) => QUEUE.push(() => personImpl(...a));
const fx = (...a) => QUEUE.push(() => fxImpl(...a));
const mitreCard = (...a) => QUEUE.push(() => mitreImpl(...a));
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
const gavelIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.rotate(-0.5); const p = new Pen(g); p.line([[0, 20], [0, 150]], "#8a5a32", 18); p.poly([[-70, -50], [70, -50], [70, 30], [-70, 30]], "#7a4d2b", 12); p.poly([[-82, -60], [-62, -60], [-62, 40], [-82, 40]], "#c9a24a", 8); p.poly([[62, -60], [82, -60], [82, 40], [62, 40]], "#c9a24a", 8); g.restore(); };
const coffinIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g); p.poly([[-40, -130], [40, -130], [76, -40], [44, 130], [-44, 130], [-76, -40]], "#8a5a32", 12); p.poly([[-10, -90], [10, -90], [10, -40], [40, -40], [40, -22], [10, -22], [10, 70], [-10, 70], [-10, -22], [-40, -22], [-40, -40], [-10, -40]], "#efdcaa", 6); g.restore(); };
const slash = (g, cx, cy, s, pr) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.strokeStyle = "#c0262d"; g.lineWidth = 34; g.lineCap = "round"; g.beginPath(); g.arc(0, 0, 225, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pr); g.stroke(); if (pr > 0.99) { g.beginPath(); g.moveTo(-158, -158); g.lineTo(158, 158); g.stroke(); } g.restore(); };

// ---------------------------------------------------------------- shots
const SHOTS = [
  { id: "hook", a: 0, b: 132, st: "G", look: "night" }, { id: "rome", a: 132, b: 234, st: "C", look: "dusk" }, { id: "rage", a: 234, b: 345, st: "G", look: "rage" },
  { id: "tomb", a: 345, b: 405, st: "G", look: "night" }, { id: "rise", a: 405, b: 492, st: "G", look: "night" }, { id: "throne", a: 492, b: 585, st: "B", look: "hall" },
  { id: "trial", a: 585, b: 741, st: "B", look: "hall" }, { id: "deacon", a: 741, b: 852, st: "B", look: "hall" }, { id: "silent", a: 852, b: 963, st: "B", look: "hall" },
  { id: "verdict", a: 963, b: 1026, st: "S", look: "paper" }, { id: "crowd", a: 1026, b: 1086, st: "B", look: "hall" }, { id: "sack", a: 1086, b: 1158, st: "B", look: "hall" },
  { id: "jail", a: 1158, b: 1209, st: "J", look: "jail" }, { id: "torn", a: 1209, b: 1245, st: "S", look: "paper" }, { id: "rule", a: 1245, b: 1308, st: "S", look: "paper" }, { id: "final", a: 1308, b: 1376, st: "S", look: "paper" },
];
const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const HG = headGeo(1, 0, false), HY = (s) => (975 - HG.hc) * SU * s;           // head-centre height of a standing adult at scale s
const HYS = (s) => (975 - HG.hc - 1.2 * 2 * HG.b) * SU * s;                       // seated (card sole = seat level)
const KICKS = [[sec(33.38) - 2, 1.0], [1356 - 2, 1.2], [sec(39.2) - 2, 1.0], [sec(14.6), 0.5], [sec(1.0) + 6, 0.2], [sec(1.0) + 36, 0.2], [sec(1.0) + 66, 0.2], [sec(1.0) + 96, 0.2], [1213, 0.7]];
const blink = (f, seed) => ((f * 7 + seed * 31) % 96) < 4 ? 1 : 0;
const idle = (f, seed) => Math.sin(f / 14 + seed * 2) * 0.012;

const frame = (f) => {
  for (const k in used) used[k] = 0; QUEUE = [];
  const S = shotAt(f), u = (f - S.a) / (S.b - S.a), lf = f - S.a; curStage = S.st;
  for (const k in stages) stages[k].visible = k === S.st;
  if (curLook !== S.look) setLook(S.look);
  const [ox, oy, oz] = ORG[S.st]; let C = null; const A = (a) => [a[0] + ox, a[1] + oy, a[2] + oz];
  let flashA = 0, tintA = 0;
  const pope = (o) => ({ kind: "pope", seed: 2, blink: blink(f, 2), ...o });
  const corpse = (o) => ({ kind: "corpse", seed: 4, mode: "sit", ...o });
  switch (S.id) {
    case "hook": { // night graveyard, pope digging at the tomb
      C = { pos: A(lv([0.9, 1.0, 4.4], [0.1, 1.35, 3.0], sm(u))), look: A(lv([0.2, 1.55, 0], [0, 1.6, 0], u)), fov: lerp(46, 40, u), roll: lerp(2, -1, u) };
      const cyc = (lf % 30) / 30, dig = cyc < 0.5 ? sm(cyc / 0.5) : 1 - sm((cyc - 0.5) / 0.5);
      person(pope({ expr: "stern", mode: "stand", headTilt: 3 }), 0, 0, 0, 1.15, false, idle(f, 2));
      fx("shovel", 0, 0.72, 0.62 + 0.28 * (1 - dig), 0.2, 1.7, lerp(-0.45, 0.12, dig));
      if (cyc > 0.5 && cyc < 0.95) fx("dirt", (cyc - 0.5) / 0.45, 0.75, 0.15, 0.4, 1.2);
      break; }
    case "rome": { flashA = 1 - ramp(f, 132, 139); // dusk wide of Rome
      C = { pos: A(lv([-6, 7, 29], [3, 14, 26], sm(u))), look: A(lv([0, 3.0, -2], [0, 3.6, -4], u)), fov: 50, roll: lerp(-2, 1, u) };
      for (let i = 0; i < 4; i++) fx("cloud", 0, -18 + i * 13 + lf * 0.02, 17 + (i % 2) * 3, -40, 11 + i * 1.3);
      break; }
    case "rage": { // close on angry pope
      const sc = 1.25, hy = HY(sc); const an = ramp(f, 252, 285);
      C = { pos: A(lv([0.05, hy + 0.1, 3.6], [0.0, hy + 0.04, 2.5], sm(u))), look: A([0, hy + 0.08, 0]), fov: 38, roll: lerp(-3, 4, u) };
      tintA = 0.1 * an * (0.6 + 0.4 * Math.sin(f / 3));
      const sh = f > 285 ? Math.sin(f * 2.3) * 0.012 * an : 0;
      person(pope({ expr: an > 0.5 ? "stern" : "neutral", mode: "stand", headTilt: -4 * an }), sh, 0, 0, sc, false, idle(f, 2), false);
      if (an > 0.2) { fx("vein", (lf % 20) / 20, 0.26, hy + 0.34, 0.1, 0.5 * an); fx("steam", (f % 40) / 40, -0.42, hy + 0.1, 0.1, 0.7 * an); fx("steam", ((f + 20) % 40) / 40, 0.42, hy + 0.1, 0.1, 0.7 * an); }
      break; }
    case "tomb": { // calendar pages flutter off the tomb
      C = { pos: A(lv([-1.6, 1.9, 5.6], [0.2, 2.0, 4.6], sm(u))), look: A([1.7, 1.2, -1.6]), fov: 46, roll: lerp(3, -2, u) };
      WG.sar.position.set(1.7, 0, -1.6); WG.lid.position.x = 0;
      for (let i = 0; i < 7; i++) { const t0 = i * 6, v = cl((lf - t0) / 40); if (v <= 0 || v >= 1) continue; fx("calendar", 0, 1.7 + Math.sin(v * 7 + i) * 0.5 + i * 0.1 - 0.3, 1.0 + v * 2.2, -1.2, 0.65, Math.sin(v * 9 + i) * 0.5); }
      break; }
    case "rise": { // lid slides, corpse hauled up
      const lid = sm(ramp(f, 411, 440)), up = bk(ramp(f, 436, 478));
      WG.lid.position.x = -lid * 2.4; WG.lid.position.y = 0.96 + Math.sin(lid * Math.PI) * 0.08;
      C = { pos: A(lv([-0.8, 0.8, 4.0], [0.8, 2.0, 3.0], sm(u))), look: A([1.7, lerp(1.0, 1.7, up), -1.6]), fov: 46, roll: lerp(-3, 3, u) };
      if (up > 0) { const y = lerp(-0.4, 1.0, up); person(corpse({ expr: "dazed", headTilt: Math.sin(f / 3) * 5 }), 1.7 + Math.sin(f / 4) * 0.03, lerp(-0.2, 0.78, up), -1.55, 1.15, false, Math.sin(f / 5) * 0.05, false); }
      person(pope({ expr: "pained", mode: "stand", wave: 1 }), 0.1, 0, 0.4, 1.15, true, -0.04 + Math.sin(f / 4) * 0.02);
      if (lid > 0 && lid < 1) fx("puff", lid, 0.4, 0.5, -0.9, 2.0); if (up > 0.2 && up < 0.99) fx("puff", up, 2.9, 0.5, -0.9, 2.2);
      break; }
    case "throne": { // flash cut, corpse dropped on throne, dressed
      flashA = 1 - ramp(f, 492, 498);
      const drop = bk(ramp(f, 497, 512)), seat = 1.0;
      C = { pos: A(lv([-1.2, 1.5, -4.4], [0.4, 1.55, -6.8], sm(u))), look: A([0, 1.7, -10]), fov: lerp(50, 40, u), roll: lerp(-4, 3, u) };
      const y = lerp(seat + 3.5, seat, drop), cape = f > sec(16.7);
      person(corpse({ expr: "dazed", headTilt: 14 * ramp(f, 540, 570), cape, nomitre: f < sec(17.5) }), 0, y, -10.15, 1.1, false, 0, false);
      if (f >= sec(17.5)) { const m = bk(ramp(f, sec(17.5), sec(17.5) + 14)); const hy = HYS(1.1) + seat; mitreCard(0.02, lerp(hy + 3, hy - 0.02 - (cape ? 0 : 0), m) - 0.64, -10.1, 1.1, 0.25 * ramp(f, 545, 570)); }
      if (f > 512 && f < 530) fx("puff", ramp(f, 512, 530), 0, 0.9, -9.7, 2.0);
      if (f > sec(16.7) && f < sec(16.7) + 16) fx("spark", ramp(f, sec(16.7), sec(16.7) + 16), 0, 1.6, -9.9, 2.2, 0, true);
      person(pope({ expr: "grin", mode: "stand", wave: 1 }), 1.9, 0.6, -8.8, 1.15, true, idle(f, 2), false);
      break; }
    case "trial": { // wide of the hall, clergy sweating
      C = { pos: A(lv([3.2, 2.5, 9.5], [-2.2, 1.7, 2.4], sm(u))), look: A(lv([0, 1.5, -7], [0.2, 1.6, -9], u)), fov: lerp(52, 46, u), roll: lerp(2, -2, u) };
      hall(f, "trial"); break; }
    case "deacon": {
      const hy = HY(1.15); const talk = Math.floor(lf / 6) % 2;
      C = { pos: A(lv([0.8, hy + 0.1, -2.1], [0.35, hy + 0.02, -2.9], sm(u))), look: A([0, hy - 0.05, -4.9]), fov: 36, roll: lerp(-3, 2, u) };
      person({ kind: "deacon", seed: 3, expr: talk ? "shock" : "nervous", mode: "stand", look: Math.sin(f / 9) * 0.8, blink: blink(f, 3) }, 0, 0, -4.9, 1.15, false, Math.sin(f / 5) * 0.02, false);
      fx("sweat", (f % 24) / 24, 0.33, hy + 0.2, -4.8, 0.45); fx("sweat", ((f + 12) % 24) / 24, -0.33, hy + 0.05, -4.8, 0.4);
      person(corpse({ expr: "dazed", headTilt: 14, cape: true, nomitre: false }), 0, 1.0, -10.15, 1.1, false, 0, false);
      person(pope({ expr: "stern", mode: "stand" }), 1.9, 0.6, -8.8, 1.15, true, idle(f, 2), false);
      break; }
    case "silent": { // corpse says nothing
      const hy = HYS(1.1) + 1.0 + 0.1;
      C = { pos: A(lv([0.6, hy + 0.1, -6.3], [0.1, hy - 0.05, -7.5], sm(u))), look: A([0, hy - 0.05, -10.1]), fov: 34, roll: lerp(2, -3, u) };
      const slump = sm(ramp(f, 880, 950));
      person(corpse({ expr: "dazed", headTilt: 14 + 22 * slump, cape: true, mitreTilt: 6 * slump }), 0, 1.0, -10.15, 1.1, false, 0, false);
      const a = f / 9; fx("fly", 0, 0.45 * Math.cos(a), hy + 0.2 + 0.18 * Math.sin(a * 1.7), -9.6 + 0.2 * Math.sin(a), 0.22, 0, false);
      break; }
    case "verdict": { // stamp on the scroll
      const hit = sec(33.4) - 2, land = ramp(f, hit - 5, hit), dn = sm(land), up = f < hit - 14 ? 0.4 * sm(ramp(f, 963, hit - 14)) : 0.4 * (1 - sm(ramp(f, hit - 14, hit - 7)));
      const stampY = f < hit ? lerp(3.4 - up * 1.2, 0.5, dn * dn) : lerp(0.5, 1.6, sm(ramp(f, hit + 4, hit + 14)));
      C = { pos: A(lv([0.1, 0.1, 6.0], [0, -0.05, 5.0], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(-1.5, 1, u) };
      const g = sg; const pr = paperBase(g, ramp(f, 963, 975) * 0.9 + 0.1); header(g); bodyLines(g, pr.top, 1);
      if (f >= hit) { const pp = ramp(f, hit, hit + 4); ring(g, 512, 840, lerp(1.5, 1, eo(pp)), -0.2, "BERSALAH"); fx("puff", ramp(f, hit, hit + 12), 0, -0.55, 0.5, 1.5); }
      WS.tex.needsUpdate = true; WS.scroll.position.set(0, 0, 0); WS.scroll.rotation.z = 0;
      fx("stamp", 0, 0.2, stampY - 1.6, 0.6, 1.5, 0.1);
      break; }
    case "crowd": {
      C = { pos: A(lv([0, 1.0, 1.5], [0.2, 1.4, 4.0], sm(u))), look: A([0, 1.55, 9]), fov: 52, roll: lerp(-5, 5, u) };
      hall(f, "crowd"); break; }
    case "sack": { // mitre knocked off, Stephen dragged out
      const hit = sec(36.7), fl = ramp(f, hit, hit + 28), sl = sm(ramp(f, sec(37.3), sec(38.5)));
      const x = lerp(0, -3.6, sl), z = lerp(-6.2, -1.0, sl);
      C = { pos: A([x + lerp(2.4, -0.9, sm(u)), 1.7, z + lerp(4.4, 3.4, u)]), look: A([x, 1.45, z]), fov: 46, roll: lerp(3, -4, u) };
      person(pope({ expr: f < hit ? "stern" : "shock", mode: "stand", nomitre: f >= hit - 1, headTilt: f > hit ? -8 : 0 }), x, 0, z, 1.15, false, Math.sin(f / 3) * 0.04 * sl, true);
      if (f >= hit - 1) mitreCard(lerp(x, x + 1.8, fl), HY(1.15) + 0.2 + Math.sin(fl * Math.PI) * 1.6 - fl * fl * 0.8, z, 1.1, fl * 9, 0);
      for (const sx of [-1, 1]) person({ kind: "guard", seed: 1 + (sx > 0 ? 1 : 0), expr: "stern", mode: "stand", blink: blink(f, 5) }, x + sx * 0.95, 0, z + 0.1, 1.15, sx < 0, sl * sx * -0.05, true);
      if (f > hit && f < hit + 12) fx("star", ramp(f, hit, hit + 12), x, HY(1.15) + 0.5, z, 1.2);
      person(corpse({ expr: "dazed", headTilt: 14, cape: true }), 0, 1.0, -10.15, 1.1, false, 0, false);
      break; }
    case "jail": { // gate slams
      const hit = sec(39.2), dn = f < hit ? 1 - bk(ramp(f, hit - 14, hit)) * 1 : 0; const gy = f < hit ? lerp(3.4, 0, bk(ramp(f, hit - 14, hit))) : 0;
      WJ.gate.position.set(0, gy, 1.6);
      C = { pos: A(lv([0.3, 1.6, 7.0], [-0.1, 1.3, 6.0], sm(u))), look: A([0, 1.0, -0.5]), fov: 40, roll: lerp(2, -2, u) };
      person(pope({ expr: f < hit ? "shock" : "pained", mode: "sit", nomitre: true, headTilt: f < hit ? 0 : 10 }), 0.2, 0, -0.2, 1.3, false, 0, true);
      if (f >= hit && f < hit + 14) fx("puff", ramp(f, hit, hit + 14), 0, 0.3, 1.9, 2.0);
      if (f > hit + 8) { fx("sweat", (f % 30) / 30, 0.5, 1.4, -1.0, 0.45); }
      break; }
    case "torn": { // verdict scroll tears
      const t0 = 1212, tr = sm(ramp(f, t0, t0 + 18));
      C = { pos: A(lv([0, 0, 5.2], [0, 0, 4.6], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(0, 2, u) };
      const off = document.createElement("canvas"); off.width = 1024; off.height = 1536; const og = off.getContext("2d");
      paperBase(og, 1); header(og); bodyLines(og, 0, 1); ring(og, 512, 840, 1, -0.2, "BERSALAH");
      sg.clearRect(0, 0, 1024, 1536);
      for (const side of [-1, 1]) { sg.save(); sg.beginPath(); const zig = (y) => 512 + Math.sin(y / 40) * 26; sg.moveTo(side < 0 ? 0 : 1024, 0); for (let y = 0; y <= 1536; y += 24) sg.lineTo(zig(y) + side * 0, y); sg.lineTo(side < 0 ? 0 : 1024, 1536); sg.closePath(); sg.clip();
        sg.translate(512 + side * 512 * 0 + side * 140 * tr, 768 + 120 * tr * tr); sg.rotate(side * 0.35 * tr); sg.translate(-512, -768); sg.drawImage(off, 0, 0); sg.restore(); }
      WS.tex.needsUpdate = true; fx("bits", ramp(f, t0, t0 + 24), 0, 0.2, 0.4, 3.0);
      break; }
    case "rule": { // new scroll unrolls, quill writes
      const op = sm(ramp(f, 1247, 1274)), wr = ramp(f, 1268, 1305);
      C = { pos: A(lv([0.05, 0.1, 6.2], [0, 0, 5.1], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(-1.5, 1.5, u) };
      const pr = paperBase(sg, op); if (op > 0.95) { header(sg); bodyLines(sg, pr.top, wr, 8, 330); } WS.tex.needsUpdate = true;
      if (f > 1262 && f < 1290) fx("spark", ramp(f, 1262, 1290), 0, 1.0, 0.4, 2.6, 0, true);
      break; }
    case "final": { // pictogram + stamp on "mati"
      const hit = 1356 - 2, a1 = bk(ramp(f, sec(44.35), sec(44.35) + 8)), a2 = bk(ramp(f, sec(44.95), sec(44.95) + 8)), a3 = ramp(f, hit - 6, hit), pop = Math.max(0, 1 - ramp(f, hit, hit + 10));
      C = { pos: A(lv([0, 0, 5.2], [0, 0, 4.4], sm(u))), look: A([0, 0, 0]), fov: 40, roll: 0 };
      const pr = paperBase(sg, 1); header(sg); bodyLines(sg, pr.top, 1, 4, 330);
      if (a1 > 0) gavelIcon(sg, 330, 800, 1.2 * a1); if (a2 > 0) coffinIcon(sg, 690, 800, 1.2 * a2); if (a3 > 0) slash(sg, 512, 820, 1.0 + 0.25 * pop, a3);
      if (f >= hit) { fx("puff", ramp(f, hit, hit + 12), 0, -1.0, 0.5, 1.8); }
      WS.tex.needsUpdate = true; break; }
  }
  // camera + kicks
  let kx = 0, ky = 0; for (const [kf, amp] of KICKS) { const d = f - kf; if (d >= 0 && d < 9) { const e = Math.exp(-d / 2.5) * amp; kx += Math.sin(d * 2.7) * 0.05 * e; ky += Math.cos(d * 3.3) * 0.05 * e; if (d < 8) flashA = Math.max(flashA, 0); } }
  cam.fov = C.fov; cam.position.set(C.pos[0] + kx, C.pos[1] + ky, C.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(...C.look); cam.rotateZ((C.roll * Math.PI) / 180 + kx * 0.4); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); CAMP.copy(cam.position);
  sun.position.set(cam.position.x + LOOK[S.look].dir[2][0], cam.position.y + LOOK[S.look].dir[2][1], cam.position.z + LOOK[S.look].dir[2][2]); sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -3)); sun.target.updateMatrixWorld();
  QUEUE.forEach((q) => q()); QUEUE = [];
  // dynamic bits
  if (S.st === "B") for (let i = 0; i < flames.length; i++) fx("flame", 0, flames[i][0], flames[i][1] + Math.sin(f / 3 + i) * 0.03, flames[i][2], 0.5 + Math.sin(f / 2.3 + i) * 0.04, 0, true), QUEUE.splice(0).forEach((q) => q());
  if (S.st === "B" && WB.shafts) WB.shafts.forEach((c, i) => (c.material.opacity = 0.09 + 0.025 * Math.sin(f / 22 + i)));
  for (const k in pools) for (let i = used[k]; i < pools[k].length; i++) pools[k][i].visible = false;
  flash.material.opacity = flashA; tint.material.opacity = tintA;
  // sort alpha cards back-to-front handled by renderOrder; render
  renderer.clear(); renderer.render(scene, cam); renderer.render(ovS, ovC);
};
// shared hall population (trial/crowd)
const hall = (f, mode) => {
  const L = [["clergyA", "pained"], ["clergyB", "nervous"], ["clergyC", "stern"], ["clergyA", "nervous"]];
  if (mode === "trial") {
    const wob = (i) => Math.sin(f / 11 + i);
    for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) { const [k, e] = L[(i + (sx > 0 ? 2 : 0)) % 4]; person({ kind: k, seed: 5 + i + (sx > 0 ? 3 : 0), expr: e, mode: "stand", look: wob(i) * sx, blink: blink(f, i + sx) }, sx * 2.1, 0, 5.5 - i * 3.3, 1.15, sx > 0, idle(f, i + sx), true);
      if ((i + (sx > 0 ? 1 : 0)) % 2 === 0) fx("sweat", ((f + i * 9) % 26) / 26, sx * 2.1 + 0.3, 1.95, 5.5 - i * 3.3, 0.4); }
    person({ kind: "deacon", seed: 3, expr: "nervous", mode: "stand", look: Math.sin(f / 9), blink: blink(f, 3) }, 0, 0, -4.9, 1.15, false, idle(f, 3), true);
    person({ kind: "guard", seed: 1, expr: "stern", mode: "stand" }, -1.1, 0, -6.8, 1.15, false, 0, true); person({ kind: "guard", seed: 2, expr: "stern", mode: "stand" }, 1.1, 0, -6.8, 1.15, true, 0, true);
    person({ kind: "pope", seed: 2, expr: Math.floor(f / 40) % 2 ? "stern" : "grin", mode: "stand", wave: 1, blink: blink(f, 2) }, 1.9, 0.6, -8.8, 1.15, true, idle(f, 2), false);
    person({ kind: "corpse", seed: 4, mode: "sit", expr: "dazed", headTilt: 14, cape: true }, 0, 1.0, -10.15, 1.1, false, 0, false);
  } else { // angry crowd
    const E = ["stern", "pained", "shock", "stern", "grin"];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const i = r * 4 + c, x = (c - 1.5) * 1.5 + (r % 2) * 0.5, z = 4.8 + r * 2.4; const fist = (i % 3) === 0 && Math.sin(f / 4 + i) > -0.2;
      person({ kind: i % 2 ? "folk" : ["clergyA", "clergyB", "clergyC"][i % 3], v: i, seed: 1 + i, expr: E[i % 5], mode: "stand", wave: fist ? 1 : undefined, blink: blink(f, i) }, x, Math.max(0, Math.sin(f / 3 + i) * 0.05), z, 1.15, i % 2 === 0, Math.sin(f / 6 + i) * 0.05, true);
      if (i % 4 === 1) fx("vein", (f % 20) / 20, x + 0.2, 2.1, z, 0.4); }
  }
};
window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.93); };
window.drawOnly = (f) => { frame(f); return true; };
window.ready = true;
