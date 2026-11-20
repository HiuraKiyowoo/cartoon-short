// Render still frames from the composition (Linux/CI friendly; no hardcoded browser path).
// usage: node scripts/stills.mjs <outPrefix> <frame,frame,...> [scale]
// env: ENTRY (default src/index.ts), COMPOSITION (default BeerFlood), GL (default swangle), CHROME_PATH, REMOTION_TMP
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

// every Remotion bundle copies public/ into the temp dir; point it at a big disk when the default is small
const tmp = process.env.REMOTION_TMP;
if (tmp) {
  fs.mkdirSync(tmp, { recursive: true });
  process.env.TEMP = process.env.TMP = tmp;
}

const [prefix, frames, scale = "0.5"] = process.argv.slice(2);
const entry = process.env.ENTRY || "src/index.tsx";
const compositionId = process.env.COMPOSITION || "BeerFlood";
const gl = process.env.GL || "swangle";
const browserExecutable = process.env.CHROME_PATH || undefined;
const inputProps = process.env.INPUT_PROPS ? JSON.parse(process.env.INPUT_PROPS) : {};

const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve("public") });
console.log("bundle", ((Date.now() - t0) / 1000).toFixed(1) + "s");

const composition = await selectComposition({ serveUrl, id: compositionId, browserExecutable, chromiumOptions: { gl }, inputProps });
console.log("composition", composition.width + "x" + composition.height, composition.durationInFrames + " frames", composition.fps + " fps");

for (const f of frames.split(",").map(Number)) {
  const t = Date.now();
  await renderStill({
    composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88,
    scale: Number(scale), browserExecutable, chromiumOptions: { gl }, timeoutInMilliseconds: 240000, inputProps,
    onBrowserLog: (l) => { console.log("[" + l.type + "]", String(l.text).slice(0, 400)); },
  });
  console.log("still", f, ((Date.now() - t) / 1000).toFixed(1) + "s");
}
