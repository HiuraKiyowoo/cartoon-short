// Lembar uji tokoh: semua pakaian digambar berdampingan supaya cacat gambar
// (badan strip, tanpa lengan, gaun tak diminta) langsung terlihat.
import { chromium } from "playwright";
import fs from "fs";
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--allow-file-access-from-files"] });
const pg = await b.newPage({ viewport: { width: 1400, height: 620 }, deviceScaleFactor: 2 });
pg.on("pageerror", (e) => console.log("[err]", e.message));
await pg.goto(`file://${new URL("./web/tokoh.html", import.meta.url).pathname}`);
await pg.waitForFunction("window.ready===true", { timeout: 30000 });
fs.mkdirSync("stills", { recursive: true });
await pg.screenshot({ path: "stills/tokoh.png", fullPage: true });
const teks = await pg.evaluate(() => [...document.querySelectorAll("figcaption")].map((c) => c.textContent).join(" | "));
console.log("tokoh:", teks);
await b.close();
