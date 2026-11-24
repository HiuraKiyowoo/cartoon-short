import { Pen, bodyFront, headBlob, soldier, townsfolk, OFFICER, INK } from "./toon.ts";
export const CW = 450, CH = 750, K = 0.75;
const rad = (d) => (d * Math.PI) / 180;
export const OUT = {
  remontel: { jacket: "#fbfbf6", pants: "#4a4a58", boots: "#2b1f1a", skin: "#ffe2c2", moustache: "#3a2a20", build: "stout", buttons: "#d9dde0" },
  santa: { ...OFFICER, jacket: "#24407e", pants: "#f1efe6", boots: "#241726", hat: null, sash: "#e8c45a", buttons: "#e8c45a", moustache: null, rifle: false, sword: true, skin: "#ecd0b6", belt: null, build: "stout" },
  officer: { ...soldier(1), jacket: "#3b6ea5", pants: "#3d4440", boots: "#241726", rifle: false, sash: "#c0353a", moustache: "#2a201a" },
  guard: { ...soldier(2), jacket: "#3b6ea5", pants: "#3d4440", boots: "#241726", rifle: true },
  official: { jacket: "#6a3b2a", pants: "#2b2b36", boots: "#241726", skin: "#c99067", moustache: "#2a201a", hat: "tophat", build: "stout", buttons: "#e8c45a", sash: "#2e6b4b" },
};
export const outfitOf = (kind, v = 0) => (kind === "folk" ? townsfolk(v) : OUT[kind]);
export const headGeo = (seed = 1, facing = 0, stout = false) => {
  const H = headBlob(seed, 118, facing), HH = 2 * H.b, torso = stout ? 1.15 : 1.1, legs = stout ? 1.32 : 1.4;
  const torsoBot = 975 - legs * HH, chin = torsoBot - torso * HH, hc = chin - H.b;
  return { a: H.a, b: H.b, hc, crown: hc - H.b, cx: 300, torsoBot, chin, HH };
};
const chefHat = (p, g, tilt = 0) => {
  const cx = g.cx, by = g.crown + g.b * 0.34, w = g.a * 0.95; p.rot = [rad(tilt), cx, by + g.b * 0.6];
  p.poly([[cx - w * 0.8, by], [cx - w * 0.85, by - g.b * 0.9], [cx + w * 0.85, by - g.b * 0.9], [cx + w * 0.8, by]], "#ffffff", 10);
  for (const [dx, dy, r] of [[-0.75, -0.95, 0.52], [0, -1.25, 0.62], [0.75, -0.95, 0.52]]) p.ell(cx + dx * w * 0.85, by + dy * g.b, r * w * 0.8, r * w * 0.8, "#ffffff", 10);
  p.poly([[cx - w * 0.9, by - 8], [cx + w * 0.9, by - 8], [cx + w * 0.9, by + g.b * 0.16], [cx - w * 0.9, by + g.b * 0.16]], "#f0ece0", 9); p.rot = null;
};
const bicorn = (p, g, tilt = 0) => {
  const cx = g.cx, by = g.crown + g.b * 0.55, w = g.a * 1.65; p.rot = [rad(tilt), cx, by + g.b * 0.6];
  p.poly([[cx - w, by + g.b * 0.05], [cx - w * 0.55, by - g.b * 0.6], [cx, by - g.b * 0.25], [cx + w * 0.55, by - g.b * 0.6], [cx + w, by + g.b * 0.05], [cx + w * 0.55, by + g.b * 0.28], [cx - w * 0.55, by + g.b * 0.28]], "#1d1a2b", 11);
  p.stroke([[cx - w * 0.97, by + g.b * 0.02], [cx - w * 0.55, by - g.b * 0.55], [cx, by - g.b * 0.22], [cx + w * 0.55, by - g.b * 0.55], [cx + w * 0.97, by + g.b * 0.02]], 9, "#e8c45a");
  p.poly([[cx + w * 0.5, by - g.b * 0.5], [cx + w * 0.9, by - g.b * 1.6], [cx + w * 0.62, by - g.b * 0.55]], "#f6f3ea", 7);
  p.poly([[cx + w * 0.45, by - g.b * 0.5], [cx + w * 0.7, by - g.b * 1.05], [cx + w * 0.6, by - g.b * 0.5]], "#c0353a", 0); p.rot = null;
};
const apron = (p, g) => { const wt = g.a * 0.62, wb = g.a * 0.92, y0 = g.chin + g.HH * 0.5, y1 = g.torsoBot - 6; p.poly([[300 - wt, y0], [300 + wt, y0], [300 + wb, y1], [300 - wb, y1]], "#fffdf6", 8); p.stroke([[300 - wt, y0], [300 + wt, y0]], 8, "#d5343b"); };
// remove the lower part of the viewer's-left leg and replace with a wooden peg
const peg = (cv, p, g, side = -1) => {
  const c = cv.getContext("2d"), legLen = 975 - g.torsoBot, x0 = 300 + side * 60, y0 = g.torsoBot + legLen * 0.42;
  c.save(); c.globalCompositeOperation = "destination-out"; c.fillRect(x0 - 58, y0, 116, 1000 - y0); c.restore();
  p.poly([[x0 - 12, y0 - 6], [x0 + 12, y0 - 6], [x0 + 8, 970], [x0 - 8, 970]], "#8a5a32", 9); p.poly([[x0 - 15, 940], [x0 + 15, 940], [x0 + 18, 975], [x0 - 18, 975]], "#6e4426", 7);
};
export const drawPerson = (cv, o) => {
  const g = cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
  const p = new Pen(g), out = outfitOf(o.kind, o.v ?? 0), seed = o.seed ?? 1;
  bodyFront(p, out, { phase: o.phase ?? 0, expr: o.expr ?? "neutral", mode: o.mode ?? "stand", look: o.look ?? 0, blink: o.blink ?? false, lift: o.lift ?? 60, tilt: o.tilt ?? 0, headTilt: o.headTilt ?? 0, wave: o.wave, facing: o.facing ?? 0, seed, prop: o.prop ?? null });
  const stout = o.kind === "remontel" || o.kind === "santa" || o.kind === "official", gg = headGeo(seed, o.facing ?? 0, stout);
  if (o.kind === "remontel") { apron(p, gg); chefHat(p, gg, o.headTilt ?? 0); }
  if (o.kind === "santa") { bicorn(p, gg, o.headTilt ?? 0); if (o.oneleg) peg(cv, p, gg, -1); }
};
export const newCard = () => { const c = document.createElement("canvas"); c.width = CW; c.height = CH; return c; };
