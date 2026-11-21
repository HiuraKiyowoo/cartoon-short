// Render video penuh tanpa @remotion/cli (pakai @remotion/renderer langsung).
// usage: node scripts/render_media.mjs [outfile] [scale] [gl]
//   SCALE=1 (1080x1920) default · SCALE=1.3333 (1440x2560)
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const [out = "out/final/video_silent.mp4", scaleArg = process.env.SCALE || "1", gl = process.env.GL || "angle"] = process.argv.slice(2);
const frameRange = process.env.FRAMES ? process.env.FRAMES.split("-").map(Number) as [number, number] : undefined;
const compId = process.env.COMPOSITION || "BeerFlood";
const tmp = process.env.REMOTION_TMP;
if (tmp) {
  fs.mkdirSync(tmp, { recursive: true });
  process.env.TEMP = process.env.TMP = tmp;
}
fs.mkdirSync(path.dirname(out), { recursive: true });

const t0 = Date.now();
await ensureBrowser();
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY || "src/index.tsx"), publicDir: path.resolve("public") });
console.log("bundle", ((Date.now() - t0) / 1000).toFixed(1) + "s");

const inputProps = process.env.INPUT_PROPS ? JSON.parse(process.env.INPUT_PROPS) : {};
const composition = await selectComposition({ serveUrl, id: compId, chromiumOptions: { gl }, inputProps });
console.log("komposisi", composition.width + "x" + composition.height, composition.durationInFrames + " frame", composition.fps + " fps", "scale", scaleArg);

const t1 = Date.now();
let last = 0;
await renderMedia({
  composition, serveUrl, codec: "h264", crf: 16, outputLocation: out,
  scale: Number(scaleArg), chromiumOptions: { gl },
  frameRange,
  inputProps,
  concurrency: Number(process.env.CONCURRENCY || 4),
  onProgress: ({ renderedFrames, encodedFrames, progress }) => {
    const done = Math.max(renderedFrames, encodedFrames);
    if (done - last >= 25) {
      last = done;
      const el = (Date.now() - t1) / 1000;
      const fps = done / Math.max(el, 1);
      const eta = (composition.durationInFrames - done) / Math.max(fps, 0.001);
      console.log(`  ${done}/${composition.durationInFrames} frame · ${fps.toFixed(2)} fps · sisa ~${(eta / 60).toFixed(1)} menit`);
    }
  },
});
console.log("render selesai dalam", ((Date.now() - t1) / 1000 / 60).toFixed(1), "menit →", out);
