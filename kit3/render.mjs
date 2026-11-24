import { chromium } from "playwright"; import fs from "fs";
const [,, outDir, spec, w = "1080"] = process.argv; fs.mkdirSync(outDir, { recursive: true });
const frames = []; for (const part of spec.split(",")) { const [a, b] = part.split("-").map(Number); for (let i = a; i <= (b ?? a); i++) frames.push(i); }
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--allow-file-access-from-files"] });
const pg = await b.newPage({ viewport: { width: +w, height: Math.round(+w * 16 / 9) } });
pg.on("pageerror", e => console.log("[err]", e.message)); pg.on("console", m => { if (m.type() === "error") console.log("[console]", m.text()); });
await pg.goto(`file://${new URL("./web/index.html", import.meta.url).pathname}?w=${w}`); await pg.waitForFunction("window.ready===true", { timeout: 60000 });
const t0 = Date.now(); let n = 0;
for (const f of frames) { const name = `${outDir}/f${String(f).padStart(4, "0")}.jpg`; if (process.env.RESUME && fs.existsSync(name)) continue;
  const d = await pg.evaluate((f) => window.renderFrame(f), f); fs.writeFileSync(name, Buffer.from(d.split(",")[1], "base64")); n++;
  if (n % 25 === 0) console.log(`${n}/${frames.length} ${((Date.now() - t0) / n / 1000).toFixed(2)}s/frame`); }
console.log("done", n, ((Date.now() - t0) / Math.max(1, n) / 1000).toFixed(2), "s/frame"); await b.close();
