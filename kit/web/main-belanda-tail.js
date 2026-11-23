// ---------------------------------------------------------------- panggung
// Cerita: "Belanda menjadi jajahan Indonesia" (alternatif sejarah).
// Tahap 1 = pelabuhan + armada (modul buildHarbor). Tahap kota/kelas menyusul.
const ORG = { H: [0, 0, 0], T: [400, 0, 0] };
const grp = (k) => { const g = new THREE.Group(); g.position.set(...ORG[k]); scene.add(g); return g; };
const gH = grp("H"), gT = grp("T");
const WH = buildHarbor(gH), WT = buildTown(gT);
const stages = { H: gH, T: gT };

const LOOK = {
  pagi: { bg: ["#7cc4f0", "#ffeec9"], fog: 0xf2e2c0, fn: [60, 260], hemi: [0xffffff, 0x9fb4c0, 1.15], dir: [0xfff2cf, 1.5, [-6, 11, 8]], card: 0xfff6e6 },
  senja: { bg: ["#8a5f8f", "#ffb072"], fog: 0xe0a888, fn: [40, 190], hemi: [0xffe2c8, 0x6f6070, 1.1], dir: [0xffc487, 1.45, [-6, 8, 8]], card: 0xffe8d6 },
  malam: { bg: ["#1a2440", "#4a5a86"], fog: 0x27324e, fn: [30, 150], hemi: [0xa8c0ff, 0x2a3348, 0.85], dir: [0xbcd0ff, 0.75, [-6, 9, 7]], card: 0xdfe6ff },
};
const bgTex = {}; for (const k in LOOK) { const c = document.createElement("canvas"); c.width = 4; c.height = 256; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, LOOK[k].bg[0]); gr.addColorStop(1, LOOK[k].bg[1]); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; bgTex[k] = t; }
let curLook = null, cardTint = new THREE.Color(1, 1, 1);
const setLook = (k) => { const L = LOOK[k]; scene.background = bgTex[k]; scene.fog = new THREE.Fog(L.fog, L.fn[0], L.fn[1]); hemi.color.setHex(L.hemi[0]); hemi.groundColor.setHex(L.hemi[1]); hemi.intensity = L.hemi[2]; sun.color.setHex(L.dir[0]); sun.intensity = L.dir[1]; cardTint.setHex(L.card); curLook = k; };

// ---------------------------------------------------------------- rencana shot (tahap 1)
const SHOTS = [
  { id: "armada", a: 0, b: 146, st: "H", look: "pagi" },
  { id: "dermaga", a: 150, b: 229, st: "H", look: "pagi" },
  { id: "datang", a: 233, b: 316, st: "H", look: "senja" },
  { id: "hadapan", a: 317, b: 488, st: "H", look: "senja" },
  { id: "sisa", a: 488, b: 1451, st: "H", look: "pagi" },
];
const TOTALF = 1451;
const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const blink = (f, seed) => ((f * 7 + seed * 31) % 96) < 4 ? 1 : 0;
const idle = (f, seed) => Math.sin(f / 14 + seed * 2) * 0.012;
const hyOf = (seed, stout, s) => (975 - headGeo(seed, 0, stout).hc) * SU * s;

const frame = (f) => {
  for (const k in used) used[k] = 0; QUEUE = [];
  const S = shotAt(f), u = (f - S.a) / Math.max(1, S.b - S.a); curStage = S.st;
  for (const k in stages) stages[k].visible = k === S.st;
  if (curLook !== S.look) setLook(S.look);
  const [ox, oy, oz] = ORG[S.st]; const A = (a) => [a[0] + ox, a[1] + oy, a[2] + oz];
  let flashA = 0, tintA = 0, C = null;

  // tokoh: penduduk Nusantara (folk) dan serdadu Eropa (guard)
  const folk = (o = {}) => ({ kind: "folk", v: o.v ?? 2, seed: 20 + (o.v ?? 2), blink: blink(f, 20 + (o.v ?? 2)), expr: o.expr ?? "neutral", ...o });
  const guard = (o = {}) => ({ kind: "guard", seed: 30, blink: blink(f, 30), expr: o.expr ?? "stern", ...o });

  switch (S.id) {
    case "armada": {
      // frame 0 sudah gambar hook: armada terlihat penuh dari atas air
      const p = sm(ramp(f, 0, 120));
      C = { pos: A(lv([0, 2.2, 46], [0, 8.5, 58], p)), look: A(lv([0, 2.0, -20], [0, 3.4, -32], p)), fov: lerp(50, 46, p), roll: lerp(-1.5, 1.5, u) };
      person(folk({ v: 1, expr: "proud", look: Math.sin(f / 18) }), -1.5, 0, 9.5, 1.05, false, idle(f, 1), true);
      person(folk({ v: 4, expr: "proud", look: Math.sin(f / 16 + 2) }), 1.7, 0, 10.5, 1.05, true, idle(f, 2), true);
      if (f % 26 < 13) fx("cloud", ((f % 26) / 13), 3.5, 0.6, -6.0, 9.0, 0, true);
      break; }
    case "dermaga": {
      const p = sm(ramp(f, 150, 215));
      C = { pos: A(lv([2.6, 2.4, 19], [1.2, 1.9, 15.5], p)), look: A(lv([0.2, 1.9, 6], [0, 1.7, 5], p)), fov: lerp(44, 38, p), roll: lerp(-1, 1, u) };
      person(folk({ v: 3, expr: "neutral", look: Math.sin(f / 12) }), -0.9, 0, 9.0, 1.12, false, idle(f, 3), true);
      fx("steam", ((f - 150) % 30) / 30, -0.9, 1.35, 9.0, 0.5);
      break; }
    case "datang": {
      const p = sm(ramp(f, 233, 300));
      C = { pos: A(lv([-6.5, 1.5, 24], [-3.0, 1.7, 18], p)), look: A(lv([8, 3.4, -26], [4, 3.0, -30], p)), fov: 46, roll: lerp(1.5, -1.5, u) };
      person(folk({ v: 5, expr: "wary", look: 1 }), -0.5, 0, 8.5, 1.0, false, idle(f, 5), true);
      fx("splash", ((f - 233) % 24) / 24, -2.2, 0.05, 6.0, 0.9);
      break; }
    case "hadapan": {
      const p = sm(ramp(f, 317, 430));
      C = { pos: A(lv([0.9, 2.0, 15.5], [0.2, 1.75, 12.6], p)), look: A(lv([-0.4, 1.75, 8.6], [0, 1.7, 9.0], p)), fov: lerp(40, 34, p), roll: lerp(-2, 2, u) };
      person(guard({ expr: "stern", headTilt: Math.sin(f / 10) * 3 }), 0.75, 0, 9.4, 1.15, false, idle(f, 7), true);
      person(folk({ v: 2, expr: "wary", look: Math.sin(f / 9) * 0.6, headTilt: Math.sin(f / 12) * 4 }), -0.85, 0, 8.9, 1.12, true, idle(f, 8), true);
      if (f > 430 && f < 470) fx("exclaim", ramp(f, 430, 442), -0.85, 2.05, 8.9, 0.7, 0.1);
      break; }
    default: {
      C = { pos: A([0, 6.5, 50]), look: A([0, 3.0, -28]), fov: 48, roll: Math.sin(f / 90) * 1.2 };
      break; }
  }

  for (const q of QUEUE) q();
  if (!C) C = { pos: A([0, 3, 30]), look: A([0, 2, -10]), fov: 45, roll: 0 };
  cam.fov = C.fov; cam.position.set(C.pos[0], C.pos[1], C.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(C.look[0], C.look[1], C.look[2]);
  cam.rotateZ((C.roll * Math.PI) / 180); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); CAMP.copy(cam.position);
  sun.position.set(cam.position.x + LOOK[S.look].dir[2][0], cam.position.y + LOOK[S.look].dir[2][1], cam.position.z + LOOK[S.look].dir[2][2]);
  sun.target.position.set(cam.position.x, 1, cam.position.z - 12); sun.target.updateMatrixWorld();

  flash.material.opacity = cl(flashA); tint.material.opacity = cl(tintA);
  renderer.setViewport(0, 0, W, H); renderer.render(scene, cam);
  renderer.autoClear = false; renderer.clearDepth();
  renderer.render(ovS, ovC);
  renderer.autoClear = true;
};

window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.93); };

// ---- audit penempatan (dipakai probe_frame.mjs) ----
// Mengukur tiap kartu yang tampak: posisi layar (NDC) + tinggi dunia terendah.
// [POTONG] = keluar tepi frame; [APUNG] = minY jauh di atas tanah (kartu 'f' = efek, memang di udara).
window.__audit = (f) => {
  frame(f);
  const out = [], v = new THREE.Vector3();
  for (const k of ["p", "f", "b"]) for (const m of pools[k]) {
    if (!m.visible) continue;
    const bb = new THREE.Box3().setFromObject(m);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const cx of [bb.min.x, bb.max.x]) for (const cy of [bb.min.y, bb.max.y]) for (const cz of [bb.min.z, bb.max.z]) {
      v.set(cx, cy, cz).project(cam);
      x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
    }
    const r = (n) => Math.round(n * 1000) / 1000;
    out.push({ pool: k, x0: r(x0), x1: r(x1), y0: r(y0), y1: r(y1), minY: r(bb.min.y), cut: x0 < -1 || x1 > 1 || y0 < -1 || y1 > 1 });
  }
  return out;
};
window.drawOnly = (f) => { frame(f); return true; };
window.ready = true;