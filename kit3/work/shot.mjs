import { chromium } from "playwright";
const [,, url, out, w="1200", h="800"] = process.argv;
const b = await chromium.launch({ args:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--allow-file-access-from-files"] });
const pg = await b.newPage({ viewport:{width:+w,height:+h} });
pg.on("console", m=>console.log("[page]", m.text())); pg.on("pageerror", e=>console.log("[err]", e.message));
await pg.goto(url); await pg.waitForFunction("window.done===true",{timeout:60000});
await pg.screenshot({ path: out }); await b.close();
