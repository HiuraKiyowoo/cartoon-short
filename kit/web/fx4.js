import { Pen, INK } from "./toon.ts";
import { drawFx3 } from "./fx3.js";
const C = 128;
export const drawFx4 = (cv, kind, t) => {
  const g = cv.getContext("2d"); const p = new Pen(g); const clr = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 256, 256); };
  if (kind === "barley") { clr(); p.stroke([[C - 6, 236], [C + 2, 150], [C + 12, 60]], 7, "#c79a2e"); for (let i = 0; i < 6; i++) { const y = 60 + i * 22, x = C + 12 - i * 2; p.ell(x - 13, y, 11, 19, "#e8c24a", 5); p.ell(x + 13, y + 6, 11, 19, "#e8c24a", 5); } p.stroke([[C + 12, 44], [C + 14, 14]], 4, "#c79a2e"); }
  else if (kind === "letter") { clr(); p.poly([[C - 90, C - 56], [C + 90, C - 56], [C + 90, C + 56], [C - 90, C + 56]], "#fffaf0", 8); p.stroke([[C - 90, C - 56], [C, C + 8], [C + 90, C - 56]], 6, INK); p.ell(C, C + 6, 18, 18, "#c0262d", 6); }
  else if (kind === "exclaim") { clr(); g.font = "bold 200px 'DejaVu Sans'"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("!", C, C + 8); g.fillStyle = "#ffd84a"; g.fillText("!", C, C + 8); }
  else if (kind === "call") { clr(); for (let i = 0; i < 3; i++) p.arc(40, C, 40 + i * 34, 40 + i * 34, -40, 40, 12 - i * 2, i % 2 ? "#ffd84a" : "#ffffff"); }
  else if (kind === "cage") { clr(); p.stroke([[24, 70], [232, 70]], 10, "#7a4d2b"); p.stroke([[24, 206], [232, 206]], 12, "#7a4d2b"); for (let i = 0; i < 6; i++) p.stroke([[34 + i * 38, 70], [34 + i * 38, 206]], 8, "#7a4d2b"); p.stroke([[24, 70], [24, 206]], 10, "#5d3a1e"); p.stroke([[232, 70], [232, 206]], 10, "#5d3a1e"); }
  else drawFx3(cv, kind, t);
};
