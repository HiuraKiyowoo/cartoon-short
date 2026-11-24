import * as THREE from "three";
import { drawAny, headGeo, CW, CH } from "./cast.js";
import { drawFx4 as drawFx2 } from "./fx4.js";
import { Pen, INK } from "./toon.ts";
import { addM, mkMat, buildDesk } from "./world.js";
import { buildSea, buildDeck, mkBoat } from "./world4.js";

const Q = new URLSearchParams(location.search), W = +(Q.get("w") || 1080), H = Math.round((W * 16) / 9);
const FPS = 30, TOTAL = 180, SU = 0.00216;
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
const ORG = { Z: [-100, 0, 0], D: [100, 0, 0], S: [0, 0, 100] };
const grp = (k) => { const g = new THREE.Group(); g.position.set(...ORG[k]); scene.add(g); return g; };
const gZ = grp("Z"), gD = grp("D"), gS = grp("S");
const WZ = buildSea(gZ), WD = buildDeck(gD), WS = buildDesk(gS);
const stages = { Z: gZ, D: gD, S: gS };

const LOOK = {
  sea: { bg: ["#6f9fc4", "#eaf1f5"], fog: 0xdbe6ee, fn: [40, 190], hemi: [0xffffff, 0x8fb0c8, 1.15], dir: [0xfff4e0, 1.4, [-5, 9, 6]], card: 0xfffaf0 },
  grey: { bg: ["#5d7790", "#c9d3da"], fog: 0xb4c2cc, fn: [26, 130], hemi: [0xe8f0f8, 0x708aa0, 1.1], dir: [0xdfe8f2, 1.1, [-5, 8, 6]], card: 0xf2f6fa },
  hold: { bg: ["#2a1c14", "#4a3020"], fog: 0x3a281c, fn: [12, 34], hemi: [0xffe6c0, 0x70503a, 1.25], dir: [0xffd9a0, 1.0, [-2, 6, 5]], card: 0xffecd0 },
  dusk: { bg: ["#4a5878", "#f2b27a"], fog: 0xcfa088, fn: [30, 150], hemi: [0xffe0c8, 0x7a7090, 1.1], dir: [0xffc890, 1.3, [-5, 7, 6]], card: 0xffe6d4 },
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
const tint = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false })); ovS.add(tint);

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
const xMark = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.lineCap = "round"; for (const [w, c] of [[50, INK], [34, "#c0262d"]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(-70, -70); g.lineTo(70, 70); g.moveTo(70, -70); g.lineTo(-70, 70); g.stroke(); } g.restore(); };
const beanIcon = (g, cx, cy, s, col) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g); p.line([[-18, 60], [-20, 120]], "#3b3f52", 14); p.line([[18, 60], [20, 120]], "#3b3f52", 14); p.ell(0, 10, 40, 66, col, 9); p.ell(0, -78, 34, 38, "#ffe2c2", 9); g.restore(); };
const pirateIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g); p.line([[-110, 130], [-110, -110]], "#6e4a30", 12); p.poly([[-104, -110], [120, -90], [90, -30], [120, 20], [-104, 30]], "#241726", 10); p.ell(0, -40, 34, 32, "#f6f3ea", 6); p.ell(-12, -44, 8, 9, "#241726", 0); p.ell(12, -44, 8, 9, "#241726", 0); p.stroke([[-30, 0], [30, -50]], 9, "#f6f3ea"); p.stroke([[30, 0], [-30, -50]], 9, "#f6f3ea"); g.restore(); };
const swordsIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g); for (const sx of [-1, 1]) { p.line([[sx * 100, -120], [-sx * 70, 100]], "#d9dde8", 16); p.stroke([[-sx * 100, 60], [-sx * 20, 100]], 12, "#6e4a30"); p.ell(-sx * 70, 100, 12, 12, "#e8c45a", 6); } p.ell(0, -30, 26, 26, "#d5343b", 8); g.restore(); };
const blastIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g); const st = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 60 : 150; st.push([Math.cos(a) * r, -40 + Math.sin(a) * r]); } p.poly(st, "#ff9b2e", 9); p.ell(0, -40, 60, 60, "#ffe27a", 0); p.ell(0, 30, 54, 62, "#a86f3a", 9); p.poly([[-54, 8], [54, 8], [54, 22], [-54, 22]], "#3a3036", 5); g.restore(); };
const shipIcon = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g); p.poly([[-150, 40], [150, 40], [110, 110], [-110, 110]], "#4a3226", 11); p.line([[-40, 40], [-40, -150]], "#6e4a30", 11); p.line([[50, 40], [50, -110]], "#6e4a30", 11); p.poly([[-130, -120], [-44, -120], [-44, 20], [-130, 20]], "#f7efd8", 9); p.poly([[56, -90], [130, -90], [130, 20], [56, 20]], "#f7efd8", 9); g.restore(); };
const slate = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); const p = new Pen(g); p.poly([[-260, -150], [260, -150], [260, 150], [-260, 150]], "#6e4a30", 12); p.poly([[-236, -126], [236, -126], [236, 126], [-236, 126]], "#2a3a38", 6); g.strokeStyle = "#e8e6dc"; g.lineWidth = 7; g.lineCap = "round"; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-200, -84 + i * 54); for (let k = 0; k < 8; k++) g.lineTo(-200 + (k + 1) * 50 * (i === 3 ? 0.6 : 1), -84 + i * 54 + (k % 2 ? 7 : -7)); g.stroke(); } g.restore(); };


// =====================================================================================
// EDIT DARI SINI. Template 6 adegan (6 detik) yang SUDAH jalan: ganti isi, jangan ganti struktur.
// Aturan: 1 adegan = 1 kalimat/ide. a,b = frame awal/akhir (dari tools/timing.py). st = panggung (Z laut, D dek, S gulungan). look = suasana.
// =====================================================================================
const SHOTS = [
  { id: "hook",  a: 0,   b: 40,  st: "Z", look: "grey" },   // wide establishing, kamera meluncur masuk
  { id: "deck",  a: 40,  b: 80,  st: "D", look: "grey" },   // 3 karakter berjajar, pop satu-satu
  { id: "num",   a: 80,  b: 115, st: "S", look: "paper" },  // gulungan + angka besar (bk = pop overshoot)
  { id: "face",  a: 115, b: 150, st: "D", look: "grey" },   // close-up 1 karakter + ikon emosi
  { id: "end",   a: 150, b: 180, st: "Z", look: "dusk" },   // wide keluar + fade hitam
];
const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const hyOf = (seed, stout, s) => (975 - headGeo(seed, 0, stout).hc) * SU * s;   // tinggi mata karakter (utk kamera close-up)
const KICKS = [[80, 0.5], [128, 0.7]];                                            // [frame, kekuatan] guncangan kamera di momen klimaks
const blink = (f, seed) => ((f * 7 + seed * 31) % 96) < 4 ? 1 : 0;
const idle = (f, seed) => Math.sin(f / 14 + seed * 2) * 0.012;
const hyC = hyOf(3, true, 1.3);

const frame = (f) => {
  for (const k in used) used[k] = 0; QUEUE = [];
  const S = shotAt(f), u = (f - S.a) / (S.b - S.a), lf = f - S.a; curStage = S.st;       // u = progres adegan 0..1
  for (const k in stages) stages[k].visible = k === S.st;
  if (curLook !== S.look) setLook(S.look);
  const [ox, oy, oz] = ORG[S.st]; let C = null; const A = (a) => [a[0] + ox, a[1] + oy, a[2] + oz];   // A() = koordinat lokal panggung -> dunia
  let flashA = 0, tintA = 0;
  const cap = (o) => ({ kind: "captain", seed: 3, blink: blink(f, 3), mode: "stand", ...o });
  const wife = (o) => ({ kind: "wife", v: 1, seed: 4, blink: blink(f, 4), mode: "stand", ...o });
  const girl = (o) => ({ kind: "girl", seed: 5, blink: blink(f, 5), mode: "stand", ...o });
  // gerak ambient (selalu hidup, jangan ada frame yang benar2 diam)
  WZ.sea.material.map.offset.set(f * 0.0007, f * 0.0004);
  const mp = WZ.mary; mp.g.position.y = Math.sin(f / 17) * 0.18; mp.g.rotation.z = Math.sin(f / 23) * 0.03; mp.flag.rotation.y = Math.sin(f / 5) * 0.4;
  WD.wheel.rotation.z = Math.sin(f / 40) * 0.5; WD.sail.rotation.y = Math.sin(f / 9) * 0.03;
  WZ.boat.visible = false;
  switch (S.id) {
    case "hook": {   // WIDE: kamera tinggi & jauh, mendekat (dolly-in) + roll kecil. Burung/awan = parallax.
      C = { pos: A(lv([16, 9, 24], [7, 5, 13], sm(u))), look: A([0, 4.5, -22]), fov: 46, roll: lerp(2, -1, u) };
      fx("bird", (f % 40) / 40, 8 - lf * 0.15, 11, -8, 1.4); fx("cloud", 0, -20, 22, -70, 18);
      break; }
    case "deck": {   // MEDIUM trio: kamera setinggi dada (y~1.9), z 8.6->7.0 (push-in lambat), karakter spasi 1.0 (layar portrait sempit!)
      C = { pos: A(lv([0, 1.9, 8.6], [0, 1.8, 7.0], sm(u))), look: A([0, 1.2, -0.5]), fov: 46, roll: lerp(-1.5, 1.5, u) };
      const pop = (t0) => bk(ramp(f, t0, t0 + 9));
      [[40, -1.0, cap({ expr: "neutral" }), 1.0], [52, 0.0, wife({ expr: "neutral" }), 0.95], [64, 1.0, girl({ expr: "grin" }), 0.58]].forEach(([t0, x, o, s]) => {
        if (f < t0) return; person(o, x, 0, 0.6, s * pop(t0), false, idle(f, 3), true); if (f < t0 + 12) fx("puff", ramp(f, t0, t0 + 12), x, 0.3, 0.7, 1.8); });
      break; }
    case "num": {    // GULUNGAN: kamera lurus di depan kertas (z 6->5, fov 40). Teks = bigNum + bk (pop overshoot). Selalu paperBase+header dulu.
      C = { pos: A(lv([0.1, 0, 6.0], [0, 0, 5.0], sm(u))), look: A([0, 0, 0]), fov: 40, roll: lerp(-1.5, 1.5, u) };
      paperBase(sg, 1); header(sg); const np = bk(ramp(f, 84, 94)); if (np > 0) bigNum(sg, "1872", 512, 760, 230, "#c0262d", np);
      shipIcon(sg, 512, 1130, 1.0 * bk(ramp(f, 100, 110)));
      WS.tex.needsUpdate = true; WS.scroll.position.set(0, 0, 0); WS.scroll.rotation.z = 0;
      if (f > 84 && f < 98) fx("puff", ramp(f, 84, 98), 0, -0.1, 0.6, 2.0);
      break; }
    case "face": {   // CLOSE-UP: kamera di tinggi mata (hyC), z 2.8->2.2, fov 38 (lensa sempit = wajah besar). Ekspresi berganti di momen reaksi.
      C = { pos: A(lv([0.2, hyC, 2.8], [0.1, hyC, 2.2], sm(u))), look: A([0, hyC - 0.05, -1.5]), fov: 38, roll: 5 * Math.sin(f / 12) };
      const sh = f >= 128; person(cap({ expr: sh ? "shock" : "neutral", wave: sh ? 1 : undefined, headTilt: sh ? Math.sin(f / 3) * 4 : 0 }), 0, 0, -1.5, 1.3, false, sh ? Math.sin(f / 3) * 0.03 : idle(f, 3), true);
      if (sh) { fx("exclaim", 0, 1.0, hyC + 0.6, -1.3, 1.1 * bk(ramp(f, 128, 136)), 0.1); fx("sweat", (f % 20) / 20, 0.5, hyC + 0.1, -1.4, 0.55); }
      break; }
    case "end": {    // WIDE keluar + fade ke hitam (tint). Kapal sendirian = kesan sepi.
      C = { pos: A(lv([4, 6, 26], [2, 7, 30], sm(u))), look: A([8, 4, -30]), fov: 44, roll: lerp(-1, 1, u) };
      tintA = ramp(f, 162, 180) * 0.85; break; }
  }
  // kick kamera (guncangan teredam eksponensial) + render
  let kx = 0, ky = 0; for (const [kf, amp] of KICKS) { const d = f - kf; if (d >= 0 && d < 9) { const e = Math.exp(-d / 2.5) * amp; kx += Math.sin(d * 2.7) * 0.05 * e; ky += Math.cos(d * 3.3) * 0.05 * e; } }
  cam.fov = C.fov; cam.position.set(C.pos[0] + kx, C.pos[1] + ky, C.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(...C.look); cam.rotateZ((C.roll * Math.PI) / 180 + kx * 0.4); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); CAMP.copy(cam.position);
  sun.position.set(cam.position.x + LOOK[S.look].dir[2][0], cam.position.y + LOOK[S.look].dir[2][1], cam.position.z + LOOK[S.look].dir[2][2]); sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -3)); sun.target.updateMatrixWorld();
  QUEUE.forEach((q) => q()); QUEUE = [];                       // karakter/efek baru ditaruh SETELAH kamera final (billboard butuh posisi kamera)
  for (const k in pools) for (let i = used[k]; i < pools[k].length; i++) pools[k][i].visible = false;
  flash.material.opacity = flashA; tint.material.opacity = tintA;
  renderer.clear(); renderer.render(scene, cam); renderer.render(ovS, ovC);
};
window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.93); };
window.drawOnly = (f) => { frame(f); return true; };
window.ready = true;
