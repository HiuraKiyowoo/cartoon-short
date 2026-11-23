import { Pen, bodyFront, headBlob, soldier, townsfolk, OFFICER, INK } from "./toon.ts";
export const CW = 450, CH = 750, K = 0.75;
const rad = (d) => (d * Math.PI) / 180;
const ROBE = { ...OFFICER, hat: null, rifle: false, sword: false, sash: null, belt: null, moustache: null, build: "stout" };
export const OUT = {
  judge: { ...ROBE, jacket: "#9a2230", pants: "#7d1b27", boots: "#241726", buttons: "#e8c45a", skin: "#f1d0ae", sash: "#e8c45a" },
  lawyer: { ...ROBE, jacket: "#27222f", pants: "#27222f", boots: "#241726", buttons: "#27222f", skin: "#e8c6a2", moustache: "#4a3a30", build: undefined },
  guard: { ...soldier(2), rifle: false },
};

// ---- pakaian khusus cerita "Belanda jadi jajahan Indonesia" ----
// pelaut Nusantara: kemeja bergaris, kain ikat kepala, sabuk kain, telanjang kaki
// Pelaut Nusantara — ditulis bersih dari nol (tanpa mewarisi townsfolk) supaya tidak ada
// sisa `dress`/`sash` yang membuat siluetnya bertabrakan seperti gaun.
export const PELAUT = { dress: undefined, sash: undefined, belt: undefined, jacket: "#3f6fb5", pants: "#e6d9bd", boots: "#c9a06a", hat: "hair", hair: "#2a201a", buttons: "#f2e6c8" };
// raja/penguasa Nusantara: jubah gelap, kain emas, penutup kepala tinggi
export const RAJA = { ...OFFICER, jacket: "#5a2f6e", pants: "#3a2440", boots: "#241726", hat: "shako_tall", cap: "#e8c45a", sash: "#e8c45a", sword: true, rifle: false, belt: null, moustache: null, skin: "#e8c39a", build: "stout" };
// murid sekolah: seragam sederhana + topi
export const MURID = { dress: undefined, jacket: "#4a5a86", pants: "#3d4440", boots: "#4a3426", hat: "cap", cap: "#2f3a52", buttons: "#e8e2d0" };
// serdadu kolonial: shako, mantel merah, tali silang
export const SERDADU = { ...soldier(1), jacket: "#a5352f", pants: "#2f3540", hat: "shako_tall", sash: "#f1efe6", buttons: "#e8c45a", rifle: false, moustache: "#4a3020" };

export const OUTFIT_BARU = { pelaut: PELAUT, raja: RAJA, murid: MURID, serdadu: SERDADU };
export const outfitOf = (kind, v = 0) => (OUTFIT_BARU[kind] ? OUTFIT_BARU[kind] : kind === "folk" ? townsfolk(v) : OUT[kind]);
export const headGeo = (seed = 1, facing = 0, stout = false) => {
  const H = headBlob(seed, 118, facing), HH = 2 * H.b, torso = stout ? 1.15 : 1.1, legs = stout ? 1.32 : 1.4;
  const torsoBot = 975 - legs * HH, chin = torsoBot - torso * HH, hc = chin - H.b;
  return { a: H.a, b: H.b, hc, crown: hc - H.b, cx: 300, torsoBot, chin, HH };
};
const WIG = "#ebe7f0";
const wig = (p, g, tilt = 0, long = true) => {
  const cx = g.cx; p.rot = [rad(tilt), cx, g.hc + g.b];
  for (const sx of [-1, 1]) for (let k = 0; k < (long ? 3 : 2); k++) p.ell(cx + sx * g.a * 0.98, g.hc + (k - 0.5) * g.b * 0.5, g.a * 0.32, g.b * 0.3, WIG, 8);
  p.ell(cx, g.crown + g.b * 0.32, g.a * 1.04, g.b * 0.52, WIG, 9);
  for (let k = -2; k <= 2; k++) p.ell(cx + k * g.a * 0.36, g.crown + g.b * 0.08 + Math.abs(k) * 5, g.a * 0.22, g.b * 0.2, WIG, 7);
  p.rot = null;
};
const cap = (p, g, tilt = 0) => { const cx = g.cx, by = g.crown + g.b * 0.15; p.rot = [rad(tilt), cx, g.hc + g.b]; p.poly([[cx - g.a * 0.85, by + 8], [cx + g.a * 0.85, by + 8], [cx + g.a * 0.7, by - g.b * 0.45], [cx - g.a * 0.7, by - g.b * 0.45]], "#c92a3a", 10); p.poly([[cx - g.a * 0.95, by + 14], [cx + g.a * 0.95, by + 14], [cx + g.a * 0.85, by + 2], [cx - g.a * 0.85, by + 2]], "#e8c45a", 8); p.rot = null; };
const bands = (p, g) => { const cx = g.cx; p.poly([[cx - 22, g.chin - 2], [cx - 2, g.chin - 2], [cx - 4, g.chin + g.HH * 0.6], [cx - 20, g.chin + g.HH * 0.6]], "#ffffff", 6); p.poly([[cx + 2, g.chin - 2], [cx + 22, g.chin - 2], [cx + 20, g.chin + g.HH * 0.6], [cx + 4, g.chin + g.HH * 0.6]], "#ffffff", 6); };
export const drawPerson = (cv, o) => {
  const g = cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
  const p = new Pen(g), out = outfitOf(o.kind, o.v ?? 0), seed = o.seed ?? 1;
  bodyFront(p, out, { phase: o.phase ?? 0, expr: o.expr ?? "neutral", mode: o.mode ?? "stand", look: o.look ?? 0, blink: o.blink ?? false, lift: o.lift ?? 60, tilt: o.tilt ?? 0, headTilt: o.headTilt ?? 0, wave: o.wave, facing: o.facing ?? 0, seed, prop: o.prop ?? null });
  const gg = headGeo(seed, o.facing ?? 0, o.kind === "judge");
  if (o.kind === "judge") { wig(p, gg, o.headTilt ?? 0); cap(p, gg, o.headTilt ?? 0); }
  if (o.kind === "lawyer") { wig(p, gg, o.headTilt ?? 0, false); bands(p, gg); }
};
// ---------------------------------------------------------------- RAT (upright, 600x1000 design space)
export const drawRat = (cv, o) => {
  const g = cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
  const p = new Pen(g), expr = o.expr ?? "neutral", fur = o.fur ?? "#8f8896", belly = "#ddd6df", pink = "#f2a7b5", bl = o.blink ? 1 : 0, lk = (o.look ?? 0) * 10;
  const bob = Math.sin((o.t ?? 0) * 6) * 0;
  p.line([[372, 905], [470, 900], [520, 820], [500, 740], [535, 690]], pink, 20);
  if (o.hold === "sack") { p.ell(430, 740, 78, 88, "#b88a55", 9); p.poly([[405, 660], [455, 660], [440, 690], [420, 690]], "#9a6f3f", 7); }
  for (const sx of [-1, 1]) { p.line([[300 + sx * 56, 870], [300 + sx * 60, 962]], fur, 34); p.ell(300 + sx * 66, 968, 46, 18, fur, 8); }
  p.ell(300, 730, 150, 200, fur, 10); p.ell(300, 780, 96, 140, belly, 0);
  const up = o.wave !== undefined;
  p.line([[170, 690], [130, 780], [140, 850]], fur, 28); p.ell(140, 856, 24, 20, pink, 6);
  if (up) { p.line([[430, 690], [490, 600], [480, 520]], fur, 28); p.ell(480, 512, 24, 20, pink, 6); } else { p.line([[430, 690], [470, 780], [458, 850]], fur, 28); p.ell(458, 856, 24, 20, pink, 6); }
  if (o.hold === "barley") { p.stroke([[458, 856], [470, 700], [440, 560]], 8, "#d9a93a"); for (let i = 0; i < 5; i++) p.ell(440 + (i % 2 ? 14 : -14) * (1 - i * 0.1), 570 + i * 26, 12, 22, "#e8c24a", 5); }
  for (const sx of [-1, 1]) { p.ell(300 + sx * 112, 395, 66, 74, fur, 10); p.ell(300 + sx * 112, 400, 40, 46, pink, 0); }
  p.ell(300, 500, 128, 118, fur, 10); p.ell(300, 566, 60, 46, "#aaa2b0", 8); p.ell(300, 538, 17, 13, "#f08aa5", 6);
  for (const sx of [-1, 1]) for (const dy of [-8, 8]) p.stroke([[300 + sx * 40, 566 + dy * 0.4], [300 + sx * 135, 560 + dy * 2.2]], 3, INK);
  const eye = (sx) => { const x = 300 + sx * 52, y = 478;
    if (expr === "sneaky") { p.ell(x, y, 26, 22, "#fff", 6); p.ell(x + lk * 1.8, y + 3, 9, 11, INK, 0); p.poly([[x - 32, y - 14], [x + 32, y - 6 + (sx > 0 ? 0 : -8)], [x + 32, y - 28], [x - 32, y - 30]], fur, 7); }
    else if (bl) p.stroke([[x - 20, y], [x + 20, y]], 6);
    else if (expr === "scared") { p.ell(x, y, 30, 34, "#fff", 6); p.ell(x + lk, y + 2, 6, 7, INK, 0); p.stroke([[x - 28, y - 44 + sx * 4], [x + 24, y - 54]], 5); }
    else { p.ell(x, y, 24, 28, "#fff", 6); p.ell(x + lk, y + 3, 10, 12, INK, 0); } };
  eye(-1); eye(1);
  if (expr === "grin") { p.arc(300, 590, 40, 28, 10, 170, 6); p.poly([[286, 600], [314, 600], [312, 632], [288, 632]], "#fff", 5); }
  else if (expr === "munch") { p.ell(300, 605, 22 + 6 * Math.abs(Math.sin((o.t ?? 0) * 18)), 14, "#7a2b3a", 5); p.poly([[290, 592], [310, 592], [309, 616], [291, 616]], "#fff", 4); }
  else if (expr === "scared") { p.ell(300, 604, 20, 24, "#7a2b3a", 5); p.poly([[290, 590], [310, 590], [309, 612], [291, 612]], "#fff", 4); }
  else { p.stroke([[280, 596], [300, 604], [320, 596]], 4); p.poly([[291, 600], [309, 600], [308, 624], [292, 624]], "#fff", 4); }
  if (expr === "scared") p.ell(380, 430, 5, 9, "#9fd4ff", 2);
};
// ---------------------------------------------------------------- CAT (sitting, front)
export const drawCat = (cv, o) => {
  const g = cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
  const p = new Pen(g), expr = o.expr ?? "glare", fur = o.fur ?? "#e89a48", dk = "#b9631f", lt = "#f8dcae", bl = o.blink ? 1 : 0;
  p.line([[430, 940], [540, 920], [560, 800], [520, 700]], fur, 40);
  p.ell(300, 800, 180, 190, fur, 11); p.ell(300, 860, 100, 120, lt, 0);
  for (const sx of [-1, 1]) { p.line([[300 + sx * 70, 860], [300 + sx * 76, 950]], fur, 52); p.ell(300 + sx * 78, 962, 56, 28, lt, 9); }
  for (const sx of [-1, 1]) { p.poly([[300 + sx * 70, 420], [300 + sx * 160, 300], [300 + sx * 175, 450]], fur, 10); p.poly([[300 + sx * 100, 420], [300 + sx * 150, 350], [300 + sx * 158, 430]], "#f2a7b5", 0); }
  p.ell(300, 520, 165, 135, fur, 11);
  for (const dx of [-40, 0, 40]) p.stroke([[300 + dx, 400], [300 + dx * 0.9, 440]], 9, dk);
  p.ell(300, 590, 80, 58, lt, 0);
  const eye = (sx) => { const x = 300 + sx * 70, y = 505;
    if (bl) { p.stroke([[x - 30, y], [x + 30, y]], 7); return; }
    p.ell(x, y, 38, expr === "glare" || expr === "hiss" ? 30 : 38, "#d6f04a", 8); p.ell(x, y, 8, expr === "glare" || expr === "hiss" ? 26 : 34, INK, 0);
    if (expr === "glare" || expr === "hiss") p.poly([[x - sx * 48, y - 44 - sx * 0], [x + sx * 44, y - 4 - 0], [x + sx * 44, y - 40], [x - sx * 48, y - 52]], fur, 8); };
  eye(-1); eye(1);
  p.poly([[286, 560], [314, 560], [300, 580]], "#f08aa5", 6);
  if (expr === "hiss") { p.poly([[240, 600], [360, 600], [345, 680], [255, 680]], "#7a1b2b", 8); p.poly([[262, 600], [276, 600], [269, 626]], "#fff", 3); p.poly([[324, 600], [338, 600], [331, 626]], "#fff", 3); p.ell(300, 670, 30, 12, "#f08aa5", 0); }
  else { p.stroke([[300, 580], [300, 596]], 5); p.stroke([[268, 604], [300, 596], [332, 604]], 5); }
  for (const sx of [-1, 1]) for (const dy of [-6, 8]) p.stroke([[300 + sx * 64, 590 + dy], [300 + sx * 190, 580 + dy * 3]], 3, INK);
};
export const drawAny = (cv, o) => (o.kind === "rat" ? drawRat(cv, o) : o.kind === "cat" ? drawCat(cv, o) : drawPerson(cv, o));
