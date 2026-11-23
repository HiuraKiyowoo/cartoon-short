// Audit penempatan kartu: proyeksikan setiap kartu yang tampak ke koordinat layar
// dan ukur tinggi dunia (min.y) untuk mendeteksi benda yang mengapung atau terpotong.
//
// Pakai:  node probe_frame.mjs "0,150,300,450,599" 1080
// Butuh:  web/main.js memaparkan window.__audit(f)  (lihat contoh main.js)
//
// Aturan yang dipakai (bukan selera):
//   - NDC di luar [-1,1]               → kartu terpotong tepi frame
//   - NDC di luar [-0.94,0.94]         → terlalu dekat tepi, rawan terpotong saat kamera bergerak
//   - world min.y > ambang (default 0.05) → kartu mengapung di atas tanah
import { chromium } from "playwright";

const [,, spec = "0", w = "1080", ambangMengapung = "0.05"] = process.argv;
const frames = [];
for (const part of spec.split(",")) {
  const [a, b] = part.split("-").map(Number);
  for (let i = a; i <= (b ?? a); i++) frames.push(i);
}

const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--allow-file-access-from-files"] });
const pg = await b.newPage({ viewport: { width: +w, height: Math.round((+w * 16) / 9) } });
pg.on("pageerror", (e) => console.log("[err]", e.message));
await pg.goto(`file://${new URL("./web/index.html", import.meta.url).pathname}?w=${w}`);
await pg.waitForFunction("window.ready===true", { timeout: 60000 });

if (!(await pg.evaluate(() => typeof window.__audit === "function"))) {
  console.log("GAGAL: web/main.js tidak memaparkan window.__audit(f). Tambahkan blok audit ke main.js.");
  await b.close();
  process.exit(2);
}

const ambang = parseFloat(ambangMengapung);
let masalah = 0;
for (const f of frames) {
  const kartu = await pg.evaluate((f) => window.__audit(f), f);
  const terpotong = kartu.filter((k) => k.cut);
  const rawan = kartu.filter((k) => !k.cut && (Math.abs(k.x0) > 0.94 || Math.abs(k.x1) > 0.94 || Math.abs(k.y0) > 0.94 || Math.abs(k.y1) > 0.94));
  const mengapung = kartu.filter((k) => k.minY > ambang);
  masalah += terpotong.length + mengapung.length;
  console.log(`frame ${f}: ${kartu.length} kartu | terpotong ${terpotong.length} | rawan ${rawan.length} | mengapung ${mengapung.length}`);
  for (const k of terpotong) console.log(`   [POTONG] ${k.pool} x=[${k.x0},${k.x1}] y=[${k.y0},${k.y1}] minY=${k.minY}`);
  for (const k of mengapung) console.log(`   [APUNG ] ${k.pool} minY=${k.minY} (ambang ${ambang}) x=[${k.x0},${k.x1}]`);
  for (const k of rawan) console.log(`   [RAWAN ] ${k.pool} hampir tepi x=[${k.x0},${k.x1}] y=[${k.y0},${k.y1}]`);
}
console.log(`selesai: ${frames.length} frame, ${masalah} temuan wajib diperbaiki`);
await b.close();