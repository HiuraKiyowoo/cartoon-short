import { Pen, bodyFront, headBlob, soldier, townsfolk, INK, mul } from "./toon.ts";
export const CW = 450, CH = 750, K = 0.75; // card canvas px, design->px
const rad = (d) => (d * Math.PI) / 180;
const hh = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

// outfits (own cast)
export const OUT = {
  pope: { jacket: "#f3eee0", pants: "#e9e2cf", boots: "#6e4426", dress: "#f3eee0", skin: "#ffe2c2", sash: "#c0353a" },
  corpse: { jacket: "#d9ad2f", pants: "#c89a22", boots: "#6e4426", skin: "#c9ddb9" },
  deacon: { jacket: "#5b3f8c", pants: "#3b2f5a", boots: "#2b1f1a", dress: "#5b3f8c", skin: "#ecd0b6" },
  clergyA: { jacket: "#8a6a3b", pants: "#5a4426", boots: "#2b1f1a", dress: "#8a6a3b", hat: "hair", hair: "#b9b4a8", skin: "#f5c9a0" },
  clergyB: { jacket: "#4f6a56", pants: "#3a4c40", boots: "#2b1f1a", dress: "#4f6a56", skin: "#ffe2c2", hat: "hair", hair: "#3a2a20" },
  clergyC: { jacket: "#7a3f48", pants: "#4c2a30", boots: "#2b1f1a", dress: "#7a3f48", skin: "#c99067", hat: "hair", hair: "#22191a" },
  guard: { jacket: "#a33a34", pants: "#3d4440", boots: "#241726", skin: "#ecd0b6", hat: "hair", hair: "#6b4a2a", sash: "#e8c45a" },
};
export const outfitOf = (kind, v = 0) => (kind === "folk" ? townsfolk(v) : OUT[kind]);

// design-space head geometry for adult build (matches bodyFront)
export const headGeo = (seed = 1, facing = 0, stout = false) => {
  const H = headBlob(seed, 118, facing), HH = 2 * H.b;
  const torso = stout ? 1.15 : 1.1, legs = stout ? 1.32 : 1.4;
  const torsoBot = 975 - legs * HH, chin = torsoBot - torso * HH, hc = chin - H.b;
  return { a: H.a, b: H.b, hc, crown: hc - H.b, cx: 300 };
};

const mitre = (p, g, tilt = 0, col = "#f3eee0", trim = "#d9ad2f", lift = 0) => {
  const w = g.a * 1.05, h = g.b * 1.7, cx = g.cx, by = g.crown + g.b * 0.42 - lift;
  p.rot = [rad(tilt), cx, by + g.b * 0.5];
  p.poly([[cx - w, by], [cx - w * 0.78, by - h * 0.78], [cx - w * 0.18, by - h], [cx, by - h * 0.82], [cx + w * 0.18, by - h], [cx + w * 0.78, by - h * 0.78], [cx + w, by]], col, 11);
  p.poly([[cx - w, by - 4], [cx + w, by - 4], [cx + w * 0.97, by + g.b * 0.2], [cx - w * 0.97, by + g.b * 0.2]], trim, 10);
  p.poly([[cx - 14, by - h * 0.28], [cx + 14, by - h * 0.28], [cx + 14, by - h * 0.78], [cx - 14, by - h * 0.78]], "#c0353a", 0);
  p.rot = null;
};

// draw one character card. o: {kind, v, mode, expr, phase, look, blink, tilt, headTilt, wave, facing, seed, lift, mitreTilt, hat}
export const drawPerson = (cv, o) => {
  const g = cv.getContext("2d");
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
  const p = new Pen(g);
  const out = outfitOf(o.kind, o.v ?? 0);
  const seed = o.seed ?? 1;
  bodyFront(p, out, { phase: o.phase ?? 0, expr: o.expr ?? "neutral", mode: o.mode ?? "stand", look: o.look ?? 0, blink: o.blink ?? false,
    lift: o.lift ?? 60, tilt: o.tilt ?? 0, headTilt: o.headTilt ?? 0, wave: o.wave, facing: o.facing ?? 0, seed, prop: o.prop ?? null });
  if (o.kind === "pope" || o.kind === "corpse") {
    const gg = headGeo(seed, o.facing ?? 0, false);
    // head tilt in bodyFront rotates head around neck; approximate mitre tilt with same angle
    if (o.mode === "sit") { gg.crown += 1.2 * 2 * gg.b; gg.hc += 1.2 * 2 * gg.b; }
    if (!o.nomitre) mitre(p, gg, (o.headTilt ?? 0) + (o.mitreTilt ?? 0), o.kind === "corpse" ? "#e8dfc0" : "#f3eee0", "#d9ad2f", (o.mitreLift ?? 0) + gg.b * 0.2);
    if (o.cape) { // gold-trimmed red mantle over the shoulders
      const cy = gg.hc + gg.b * 1.05, w = gg.a * 1.5;
      p.poly([[300 - w, cy + 40], [300 - w * 0.6, cy - 14], [300, cy - 4], [300 + w * 0.6, cy - 14], [300 + w, cy + 40], [300 + w * 0.8, cy + 190], [300, cy + 130], [300 - w * 0.8, cy + 190]], "#b02f3a", 10);
      p.poly([[300 - w * 0.55, cy - 8], [300 + w * 0.55, cy - 8], [300 + w * 0.5, cy + 22], [300 - w * 0.5, cy + 22]], "#d9ad2f", 8);
    }
  }
};
export const newCard = () => { const c = document.createElement("canvas"); c.width = CW; c.height = CH; return c; };

export const drawMitreCard = (cv, tilt = 0) => {
  const g = cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
  const p = new Pen(g), gg = { a: 118, b: 100, cx: 300, crown: 500, hc: 600 };
  mitre(p, gg, tilt, "#f3eee0", "#d9ad2f", 0);
};
