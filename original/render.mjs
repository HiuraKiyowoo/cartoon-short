import { chromium } from "playwright";
import fs from "fs";

const [, , outDir, spec, w = "1080"] = process.argv;
if (!outDir || !spec) {
  console.error("usage: node render.mjs <outDir> <frames e.g. 400 or 0-599 or 400,650> [width]");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const frames = [];
for (const part of spec.split(",")) {
  const [a, b] = part.split("-").map(Number);
  for (let i = a; i <= (b ?? a); i++) frames.push(i);
}

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: +w, height: Math.round(+w * 16 / 9) } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("[console]", m.text()); });

await page.goto(`file://${new URL("./web/index.html", import.meta.url).pathname}?w=${w}`);
await page.waitForFunction("window.ready===true", { timeout: 60000 });

const t0 = Date.now();
let n = 0;
for (const f of frames) {
  const name = `${outDir}/f${String(f).padStart(4, "0")}.jpg`;
  if (process.env.RESUME && fs.existsSync(name)) continue;
  const d = await page.evaluate((f) => window.renderFrame(f), f);
  fs.writeFileSync(name, Buffer.from(d.split(",")[1], "base64"));
  n++;
  console.log(`${n}/${frames.length} frame ${f} ${((Date.now() - t0) / n / 1000).toFixed(2)}s/frame`);
}
await browser.close();
console.log("done", n);
