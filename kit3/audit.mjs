// Audit penempatan: cetak laporan JSON untuk beberapa frame (dipakai CI).
import { chromium } from "playwright";
const [, , spec = "40,120,200,290,370,460,530,600,650,690,730,790,860,940,1100,1240,1390", w = "540"] = process.argv;
const frames = []; for (const part of spec.split(",")) { const [a, b] = part.split("-").map(Number); for (let i = a; i <= (b ?? a); i++) frames.push(i); }
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--allow-file-access-from-files"] });
const pg = await b.newPage({ viewport: { width: +w, height: Math.round(+w * 16 / 9) } });
pg.on("pageerror", (e) => console.log("[err]", e.message));
await pg.goto(`file://${new URL("./web/index.html", import.meta.url).pathname}?w=${w}`);
await pg.waitForFunction("window.ready===true", { timeout: 60000 });
const rep = await pg.evaluate((fs) => window.auditShot(fs), frames);
for (const r of rep) {
  const rusak = r.baris.filter((b) => b.potong || b.terhalang);
  console.log(`f${r.f} ${r.shot} [${r.panggung}/${r.look}] kartu=${r.kartu} rusak=${rusak.length}`);
  for (const x of r.baris) console.log(`   kartu x=${x.x} y=${x.y} kaki=${x.kaki} jarak=${x.jarak}${x.potong ? "  [POTONG]" : ""}${x.terhalang ? "  [TERHALANG oleh " + x.terhalang + "]" : ""}`);
}
console.log("RINGKASAN:", JSON.stringify(rep.map((r) => ({ f: r.f, shot: r.shot, kartu: r.kartu, rusak: r.baris.filter((b) => b.potong || b.terhalang).length }))));
await b.close();
