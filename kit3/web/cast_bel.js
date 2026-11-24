// KAST BARU untuk cerita "Belanda jadi jajahan" (playbook 13.3: jangan pakai kapten/hakim/istri lama).
import { Pen, bodyFront, headBlob, soldier, townsfolk, OFFICER, RIFLEMAN, KID, PARENT, INK } from "./toon.ts";
export const CW = 450, CH = 750, K = 0.75;
const rad = (d) => (d * Math.PI) / 180;
const SK = ["#c99067", "#b87d52", "#d9ab82", "#a86a44", "#e0b98f"];

export const OUT = {
  // Raja Nusantara: kain merah, selempang emas, keris, mahkota (aksesori sendiri)
  raja: { ...OFFICER, jacket: "#8f2230", pants: "#e8d9a8", boots: "#4a2a1c", hat: "hair", hair: "#1f1712",
          buttons: "#e8c45a", sash: "#e8c45a", sword: true, rifle: false, belt: null,
          moustache: "#241a12", build: "stout", skin: "#c99067" },
  // Panglima: baju hijau laut, ikat kepala, keris
  panglima: { ...RIFLEMAN, jacket: "#2f6b5a", pants: "#e0d2a8", boots: "#3d2a1c", hat: "hair", hair: "#241a12",
              buttons: "#e8c45a", rifle: false, belt: "#6b4526", sash: "#a83a3a", moustache: "#241a12", skin: "#b87d52" },
  // Pelaut Nusantara (dipakai massal dengan v)
  pelaut: { jacket: "#3f6fb5", pants: "#e6d9bd", boots: "#8a6a44", hat: "hair", hair: "#241a12",
            buttons: "#f2e6c8", belt: null, sash: null, skin: "#c99067" },
  // Warga Nusantara
  warga: { ...townsfolk(0), jacket: "#7a4a8a", pants: "#3d3a34", boots: "#4a3426", hat: "hair", hair: "#241a12", sash: null },
  // Gubernur Belanda: mantel biru, wig putih, topi tinggi
  gubernur: { jacket: "#22406e", pants: "#2f3444", boots: "#1f1a22", hat: "tophat", cap: "#1f1a22",
              buttons: "#e8c45a", belt: "#3a3036", sash: null, build: "stout", skin: "#f1d2b0" },
  // Pegawai peta Belanda (perwira)
  juru: { ...RIFLEMAN, jacket: "#3a4a78", pants: "#e8e4d8", boots: "#241726", hat: "shako", cap: "#243050",
          buttons: "#e8c45a", rifle: false, skin: "#f1d2b0" },
  // Murid Belanda (anak, kini belajar bahasa Indonesia)
  murid: { ...KID, jacket: "#4a5a86", pants: "#3d4440", boots: "#5a3b2a", hat: "hair", hair: "#d8b878",
           cap: undefined, buttons: "#f2efe6", skin: "#ffe2c2" },
  // Guru Belanda
  guru: { ...PARENT, jacket: "#5a4a6e", pants: "#3b3f52", boots: "#3a2a20", hat: "hair", hair: "#8a7a6a",
          buttons: "#d9dde0", belt: "#3a3036", skin: "#ffe2c2" },
};
export const outfitOf = (kind, v = 0) =>
  kind === "folk" ? townsfolk(v)
  : kind === "boy" ? { ...KID, skin: SK[v % 5] }
  : kind === "pelaut" || kind === "warga" ? { ...OUT[kind], skin: SK[v % 5],
      jacket: kind === "pelaut" ? ["#3f6fb5", "#2f6b8a", "#5a6f9a", "#3a7a6a", "#6a5a9a"][v % 5] : ["#7a4a8a", "#a8563a", "#4a7a5a", "#8a6a2a", "#5a5a8a"][v % 5] }
  : OUT[kind];

export const headGeo = (seed = 1, facing = 0, stout = false) => {
  const H = headBlob(seed, 118, facing), HH = 2 * H.b, torso = stout ? 1.15 : 1.1, legs = stout ? 1.32 : 1.4;
  const torsoBot = 975 - legs * HH, chin = torsoBot - torso * HH, hc = chin - H.b;
  return { a: H.a, b: H.b, hc, crown: hc - H.b, cx: 300, torsoBot, chin, HH };
};

// mahkota: pita emas + 3 pucuk + batu merah di tengah (ditaruh di atas kepala, ikut miring)
const mahkota = (p, g, tilt = 0) => {
  const cx = g.cx, y = g.crown + g.b * 0.55;
  p.rot = [rad(tilt), cx, g.hc + g.b];
  p.poly([[cx - g.a * 0.95, y + 16], [cx + g.a * 0.95, y + 16], [cx + g.a * 0.9, y - 6], [cx - g.a * 0.9, y - 6]], "#e8c45a", 7);
  for (const k of [-1, 0, 1]) p.poly([[cx + k * g.a * 0.55 - 12, y - 4], [cx + k * g.a * 0.55 + 12, y - 4], [cx + k * g.a * 0.55, y - 34 - (k === 0 ? 12 : 0)]], "#f2d878", 6);
  p.ell(cx, y + 4, 9, 9, "#c0353a", 4);
  p.rot = null;
};
// wig panjang putih (pejabat Eropa)
const wigPutih = (p, g, tilt = 0, col = "#ebe7f0") => {
  const cx = g.cx; p.rot = [rad(tilt), cx, g.hc + g.b];
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) p.ell(cx + sx * g.a * 0.99, g.hc + (k - 0.5) * g.b * 0.5, g.a * 0.33, g.b * 0.31, col, 8);
  p.ell(cx, g.crown + g.b * 0.3, g.a * 1.05, g.b * 0.5, col, 9);
  for (let k = -2; k <= 2; k++) p.ell(cx + k * g.a * 0.36, g.crown + g.b * 0.06 + Math.abs(k) * 5, g.a * 0.22, g.b * 0.2, col, 7);
  p.rot = null;
};
// ikat kepala (panglima/pelaut Nusantara)
const ikat = (p, g, tilt = 0, col = "#a83a3a") => {
  const cx = g.cx, y = g.crown + g.b * 0.5; p.rot = [rad(tilt), cx, g.hc + g.b];
  p.poly([[cx - g.a * 0.96, y + 14], [cx + g.a * 0.96, y + 14], [cx + g.a * 0.9, y - 8], [cx - g.a * 0.9, y - 8]], col, 7);
  p.poly([[cx + g.a * 0.7, y + 6], [cx + g.a * 1.15, y - 26], [cx + g.a * 0.98, y - 4]], col, 5);
  p.rot = null;
};
const jenggot = (p, g, tilt = 0, col = "#241a12") => {
  const cx = g.cx; p.rot = [rad(tilt), cx, g.hc + g.b];
  p.poly([[cx - g.a * 0.52, g.chin - 6], [cx + g.a * 0.52, g.chin - 6], [cx + g.a * 0.3, g.chin + g.HH * 0.46], [cx, g.chin + g.HH * 0.6], [cx - g.a * 0.3, g.chin + g.HH * 0.46]], col, 9);
  p.rot = null;
};

export const drawPerson = (cv, o) => {
  const g2 = cv.getContext("2d"); g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, cv.width, cv.height); g2.setTransform(K, 0, 0, K, 0, 0);
  const p = new Pen(g2), out = outfitOf(o.kind, o.v ?? 0), seed = o.seed ?? 1, tilt = o.headTilt ?? 0;
  bodyFront(p, out, { phase: o.phase ?? 0, expr: o.expr ?? "neutral", mode: o.mode ?? "stand", look: o.look ?? 0,
    blink: o.blink ?? false, lift: o.lift ?? 60, tilt: o.tilt ?? 0, headTilt: tilt, wave: o.wave, facing: o.facing ?? 0, seed, prop: o.prop ?? null });
  const hg = headGeo(seed, o.facing ?? 0, o.kind === "raja" || o.kind === "gubernur");
  if (o.kind === "raja") { mahkota(p, hg, tilt); jenggot(p, hg, tilt); }
  else if (o.kind === "gubernur") { wigPutih(p, hg, tilt); }
  else if (o.kind === "guru") { wigPutih(p, hg, tilt, "#c9c2bb"); }
  else if (o.kind === "panglima") { ikat(p, hg, tilt, "#a83a3a"); jenggot(p, hg, tilt, "#241a12"); }
  else if (o.kind === "pelaut" || o.kind === "warga") ikat(p, hg, tilt, (o.v ?? 0) % 2 ? "#3a5a8a" : "#a83a3a");
};
export const drawAny = (cv, o) => drawPerson(cv, o);
