// Uji set flag Chromium: apakah WebGL (swiftshader) bisa hidup di lingkungan ini?
// Keluaran: satu baris per set flag dengan status konteks + renderer.
import { chromium } from "playwright";

const SET = {
  dasar: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  tanpa_sandbox: ["--no-sandbox", "--disable-dev-shm-usage", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  sandbox_gpu_off: ["--no-sandbox", "--disable-gpu-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-features=Vulkan"],
  swiftshader_webgl: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=swiftshader-webgl", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
};

for (const [nama, args] of Object.entries(SET)) {
  let b;
  try {
    b = await chromium.launch({ args, timeout: 45000 });
    const pg = await b.newPage();
    await pg.goto("about:blank");
    const hasil = await pg.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return { ok: false, alasan: "tidak ada konteks" };
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      return {
        ok: true,
        versi: gl.getParameter(gl.VERSION),
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      };
    });
    console.log(`${nama.padEnd(18)} ${hasil.ok ? "OK" : "GAGAL"} ${hasil.ok ? hasil.versi + " | " + hasil.renderer : hasil.alasan}`);
  } catch (e) {
    console.log(`${nama.padEnd(18)} GAGAL launch: ${String(e).split("\n")[0].slice(0, 90)}`);
  } finally {
    if (b) await b.close().catch(() => {});
  }
}