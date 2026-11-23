// Entri lembar uji tokoh (di-bundle esbuild karena cast.js mengimpor toon.ts).
import { drawAny, CW, CH } from "./cast.js";
const daftar = [
  ["pelaut", { kind: "pelaut" }],
  ["raja", { kind: "raja" }],
  ["murid", { kind: "murid" }],
  ["serdadu", { kind: "serdadu" }],
  ["folk v2", { kind: "folk", v: 2 }],
  ["guard", { kind: "guard" }],
];
for (const [nama, o] of daftar) {
  const fig = document.createElement("figure");
  const cv = document.createElement("canvas");
  cv.width = CW; cv.height = CH;
  const cap = document.createElement("figcaption");
  cap.textContent = nama;
  fig.appendChild(cv); fig.appendChild(cap);
  document.body.appendChild(fig);
  try { drawAny(cv, { expr: "neutral", blink: 0, seed: 20, ...o }); }
  catch (e) { cap.textContent = nama + " GAGAL: " + e.message; }
}
window.ready = true;
