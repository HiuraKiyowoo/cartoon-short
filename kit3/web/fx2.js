import { Pen, INK } from "./toon.ts";
import { drawFx } from "./fx.js";
export const drawFx2 = (cv, kind, t) => {
  if (kind === "stamp") {
    const g = cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 256, 256); const p = new Pen(g);
    p.ell(128, 50, 36, 36, "#8a3a2a", 8); p.poly([[112, 70], [144, 70], [140, 150], [116, 150]], "#8a3a2a", 8);
    p.poly([[58, 150], [198, 150], [206, 214], [50, 214]], "#a8452f", 8); p.poly([[50, 214], [206, 214], [204, 232], [52, 232]], "#2b2326", 4);
  } else drawFx(cv, kind, t);
};
