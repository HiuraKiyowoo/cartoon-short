import { Pen, INK } from "./toon.ts";
const rad = (d) => (d * Math.PI) / 180;
const circ = (p, x, y, r, fill, ol = 6) => p.ell(x, y, r, r, fill, ol);
// 256x256 effect cards (origin = centre). t in 0..1 life
export const drawFx = (cv, kind, t) => {
  const g = cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 256, 256);
  const p = new Pen(g); const C = 128;
  if (kind === "puff") {
    g.globalAlpha = Math.max(0, 1 - t * t);
    for (let i = 0; i < 6; i++) { const a = rad(i * 60 + 20), r = 22 + 58 * t * (0.7 + 0.3 * Math.sin(i * 2.1)); circ(p, C + Math.cos(a) * r * 0.9, C + Math.sin(a) * r * 0.55, 20 + 20 * t, "#f4efe6", 6); }
    circ(p, C, C, 30 + 26 * t, "#f4efe6", 6); g.globalAlpha = 1;
  } else if (kind === "dirt") {
    g.globalAlpha = Math.max(0, 1 - t * t * 0.8);
    for (let i = 0; i < 7; i++) { const a = rad(i * 51 + 10), r = 20 + 85 * t, x = C + Math.cos(a) * r, y = C - Math.abs(Math.sin(a)) * r * 1.2 + 80 * t * t; circ(p, x, y, 9 - 3 * t, "#6b4a32", 4); }
    g.globalAlpha = 1;
  } else if (kind === "sweat") {
    const y = C + 30 * t; p.poly([[C, y - 50], [C + 24, y + 6], [C + 14, y + 30], [C - 14, y + 30], [C - 24, y + 6]], "#8fd2ff", 6);
    g.globalAlpha = 1;
  } else if (kind === "vein") {
    const s = 0.9 + 0.2 * Math.sin(t * 40);
    for (const [a, b] of [[-1, 0], [1, 0]]) { p.stroke([[C + a * 40 * s, C - 40 * s], [C + a * 10, C - 8], [C + a * 36 * s, C + 4]], 14, INK); p.stroke([[C + a * 40 * s, C - 40 * s], [C + a * 10, C - 8], [C + a * 36 * s, C + 4]], 8, "#e2332d"); }
  } else if (kind === "star") {
    for (let i = 0; i < 3; i++) { const a = rad(t * 300 + i * 120), x = C + Math.cos(a) * 70, y = C + Math.sin(a) * 26;
      p.poly([[x, y - 24], [x + 7, y - 7], [x + 24, y], [x + 7, y + 7], [x, y + 24], [x - 7, y + 7], [x - 24, y], [x - 7, y - 7]], "#ffd84a", 5); }
  } else if (kind === "spark") {
    g.globalAlpha = Math.max(0, 1 - t); for (let i = 0; i < 5; i++) { const a = rad(i * 72 + 15), r = 30 + 80 * t, x = C + Math.cos(a) * r, y = C + Math.sin(a) * r, s = 18 * (1 - t * 0.5);
      p.poly([[x, y - s], [x + s * 0.3, y - s * 0.3], [x + s, y], [x + s * 0.3, y + s * 0.3], [x, y + s], [x - s * 0.3, y + s * 0.3], [x - s, y], [x - s * 0.3, y - s * 0.3]], "#fff3b0", 4); } g.globalAlpha = 1;
  } else if (kind === "steam") {
    g.globalAlpha = 0.9; for (let i = 0; i < 3; i++) { const y = C + 70 - ((t * 140 + i * 50) % 150), r = 20 + (150 - (y - C + 70)) * 0.12; circ(p, C + (i - 1) * 40 + Math.sin(t * 20 + i) * 8, y, r, "#fbf6ef", 5); } g.globalAlpha = 1;
  } else if (kind === "fly") {
    p.ell(C - 10, C - 10, 14, 8, "#dfeaf2", 3, 0, 360, -0.5); p.ell(C + 8, C - 12, 14, 8, "#dfeaf2", 3, 0, 360, 0.5); circ(p, C, C, 9, "#2b2326", 3);
  } else if (kind === "calendar") {
    p.poly([[C - 50, C - 62], [C + 50, C - 62], [C + 50, C + 62], [C - 50, C + 62]], "#fffdf6", 7); p.poly([[C - 50, C - 62], [C + 50, C - 62], [C + 50, C - 30], [C - 50, C - 30]], "#d5343b", 7);
    for (let i = 0; i < 3; i++) p.stroke([[C - 28, C - 6 + i * 26], [C + 28, C - 6 + i * 26]], 7, "#7d7a8a");
  } else if (kind === "shovel") {
    p.line([[C, 8], [C, 170]], "#8a5a32", 12); p.line([[C - 26, 14], [C + 26, 14]], "#8a5a32", 12);
    p.poly([[C - 28, 168], [C + 28, 168], [C + 32, 232], [C, 252], [C - 32, 232]], "#9aa3ad", 8);
  } else if (kind === "flame") {
    p.poly([[C, C - 90], [C + 34, C - 10], [C + 22, C + 40], [C - 22, C + 40], [C - 34, C - 10]], "#ffb43a", 6); p.poly([[C, C - 40], [C + 16, C], [C + 10, C + 30], [C - 10, C + 30], [C - 16, C]], "#fff1a0", 0);
  } else if (kind === "bits") {
    g.globalAlpha = Math.max(0, 1 - t * 0.7); for (let i = 0; i < 8; i++) { const a = rad(i * 45 + 7), r = 30 + 90 * t, x = C + Math.cos(a) * r, y = C + Math.sin(a) * r * 0.8 + 60 * t * t;
      p.poly([[x - 10, y - 7], [x + 10, y - 4], [x + 6, y + 8], [x - 8, y + 6]], "#efdcaa", 3); } g.globalAlpha = 1;
  } else if (kind === "cloud") {
    for (const [x, y, r] of [[-60, 20, 40], [-15, 0, 56], [40, 12, 46], [80, 26, 30]]) circ(p, C + x, C + y, r, "#fff3e6", 0);
  } else if (kind === "blob") {
    const gr = g.createRadialGradient(C, C, 0, C, C, 120); gr.addColorStop(0, "rgba(10,8,20,.55)"); gr.addColorStop(1, "rgba(10,8,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  } else if (kind === "glow") {
    const gr = g.createRadialGradient(C, C, 0, C, C, 125); gr.addColorStop(0, "rgba(255,244,200,1)"); gr.addColorStop(0.35, "rgba(255,226,150,.45)"); gr.addColorStop(1, "rgba(255,210,120,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  }
};
