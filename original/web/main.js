// Renderer + timeline asli. Set/karakter/tekstur ada di world.js (buatan sendiri).
import * as THREE from "three";
import { buildWorld, T } from "./world.js";

const Q = new URLSearchParams(location.search);
const W = +(Q.get("w") || 1080), H = Math.round((W * 16) / 9);
const FPS = 30;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (x) => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); };

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = false;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(48, W / H, 0.1, 700);
const hemi = new THREE.HemisphereLight(0xffffff, 0x555555, 1.1);
const sun = new THREE.DirectionalLight(0xffffff, 1.4);
scene.add(hemi, sun, sun.target);

const stages = buildWorld(scene);

// ---------------------------------------------------------------- looks
const LOOK = {
  pagi: { sky: ["#79c3e8", "#ffe8bd"], fog: 0xf5dfb6, fn: [55, 230], hemi: [0xfff4e0, 0x667a68, 1.18], dir: [0xfff0c8, 1.55], sun: [-7, 9, 6] },
  senja: { sky: ["#4f6fa8", "#ffd096"], fog: 0xe9cdb4, fn: [150, 520], hemi: [0xffd9b2, 0x6a5a70, 1.18], dir: [0xffc27c, 1.65], sun: [-8, 9, 7] },
  malam: { sky: ["#16203c", "#463a58"], fog: 0x2a2a44, fn: [30, 150], hemi: [0x9fb0ff, 0x2a2a3a, 0.82], dir: [0x9fb0ff, 0.7], sun: [-4, 8, 5] },
  lilin: { sky: ["#241a20", "#5e3c26"], fog: 0x3a2a20, fn: [5, 42], hemi: [0xffd9a0, 0x2a1a18, 1.02], dir: [0xffc27c, 1.25], sun: [-2, 5, 3] },
  kelas: { sky: ["#3a2f28", "#6a5444"], fog: 0x5a4a3a, fn: [12, 55], hemi: [0xffe8c8, 0x5a4a3a, 1.0], dir: [0xffe0b0, 1.0], sun: [-3, 6, 4] },
};
const skyTex = {};
for (const k in LOOK) {
  const c = document.createElement("canvas");
  c.width = 360;
  c.height = 640;
  const g = c.getContext("2d");
  const L = LOOK[k];
  const gr = g.createLinearGradient(0, 0, 0, 640);
  gr.addColorStop(0, L.sky[0]);
  gr.addColorStop(0.62, L.sky[0]);
  gr.addColorStop(1, L.sky[1]);
  g.fillStyle = gr;
  g.fillRect(0, 0, 360, 640);

  // pendar hangat di kaki langit
  const glow = g.createRadialGradient(180, 640, 10, 180, 640, 380);
  glow.addColorStop(0, k === "malam" ? "rgba(120,140,200,.35)" : "rgba(255,214,150,.55)");
  glow.addColorStop(1, "rgba(255,214,150,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, 360, 640);

  if (k === "malam") {
    for (let i = 0; i < 90; i++) {
      const x = (i * 137) % 360, y = (i * 83) % 380;
      g.fillStyle = `rgba(255,250,235,${0.15 + ((i * 7) % 10) / 22})`;
      g.fillRect(x, y, 1.6, 1.6);
    }
  } else {
    let seed = k === "pagi" ? 11 : 23;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.save();
    g.filter = "blur(5px)";
    for (let i = 0; i < 13; i++) {
      const cx = 20 + rand() * 320;
      const cy = 30 + rand() * 250;
      const sc = 9 + rand() * 15;
      for (let j = 0; j < 6; j++) {
        g.fillStyle = `rgba(255,248,236,${0.45 + rand() * 0.35})`;
        g.beginPath();
        g.ellipse(cx + (rand() - 0.5) * sc * 2.4, cy + (rand() - 0.5) * sc * 0.7,
          sc * (0.5 + rand() * 0.6), sc * (0.26 + rand() * 0.22), 0, 0, 7);
        g.fill();
      }
    }
    g.restore();
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  skyTex[k] = t;
}
let curLook = null;

// kilau matahari: deret goresan terang di permukaan air
const sparkTex = (() => {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 32;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 16, 1, 64, 16, 60);
  gr.addColorStop(0, "rgba(255,248,222,1)");
  gr.addColorStop(0.45, "rgba(255,234,186,.5)");
  gr.addColorStop(1, "rgba(255,228,176,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 32);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

const glitter = (() => {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: sparkTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < 56; i++) {
    const t = 0.62 + Math.pow(i / 56, 0.7) * 0.38;
    const w = 0.5 + Math.random() * 2.4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.1, 0.5 + Math.random() * 0.9), mat.clone());
    m.material.opacity = 0.25 + Math.random() * 0.5;
    m.rotation.x = -Math.PI / 2;
    m.position.set((Math.random() - 0.5) * (3.5 + t * 14), 0.04, t * 190);
    m.userData.sp = 0.6 + Math.random();
    g.add(m);
  }
  g.userData.dash = g.children;
  return g;
})();
scene.add(glitter);
function setLook(k) {
  if (curLook === k) return;
  const L = LOOK[k];
  scene.background = skyTex[k];
  scene.fog = new THREE.Fog(L.fog, L.fn[0], L.fn[1]);
  hemi.color.setHex(L.hemi[0]); hemi.groundColor.setHex(L.hemi[1]); hemi.intensity = L.hemi[2];
  sun.color.setHex(L.dir[0]); sun.intensity = L.dir[1];
  curLook = k;
}

// ---------------------------------------------------------------- overlay
const ovS = new THREE.Scene();
const ovC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const vc = document.createElement("canvas");
vc.width = 256; vc.height = 456;
{
  const g = vc.getContext("2d");
  const gr = g.createRadialGradient(128, 228, 70, 128, 228, 300);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(0.6, "rgba(0,0,0,.03)");
  gr.addColorStop(1, "rgba(0,0,0,.2)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 456);
}
const vig = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(vc), transparent: true, depthTest: false }));
ovS.add(vig);
const flash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0xfff6e8, transparent: true, opacity: 0, depthTest: false }));
ovS.add(flash);

const depth = (() => {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 512;
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "rgba(10,46,44,0)");
  gr.addColorStop(0.55, "rgba(10,46,44,.1)");
  gr.addColorStop(1, "rgba(8,38,38,.42)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 8, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false }));
})();
ovS.add(depth);

// ---------------------------------------------------------------- shots
const SHOTS = [
  { id: "hook",      a: 0,    b: 164,  st: "map",    look: "lilin" },
  { id: "peta",      a: 164,  b: 241,  st: "map",    look: "lilin" },
  { id: "pelabuhan", a: 241,  b: 325,  st: "dock",   look: "pagi" },
  { id: "armada",    a: 325,  b: 502,  st: "sea",    look: "senja" },
  { id: "serang",    a: 502,  b: 576,  st: "dock",   look: "senja" },
  { id: "dagang",    a: 576,  b: 622,  st: "market", look: "pagi" },
  { id: "kolonial",  a: 622,  b: 722,  st: "town",   look: "senja" },
  { id: "kelas",     a: 722,  b: 836,  st: "class",  look: "kelas" },
  { id: "tulip",     a: 836,  b: 915,  st: "market", look: "pagi" },
  { id: "istana",    a: 915,  b: 1014, st: "palace", look: "lilin" },
  { id: "tanya",     a: 1014, b: 1100, st: "map",    look: "lilin" },
  { id: "adidaya",   a: 1100, b: 1190, st: "palace", look: "lilin" },
  { id: "salah",     a: 1190, b: 1306, st: "town",   look: "malam" },
  { id: "kebiasaan", a: 1306, b: 1374, st: "map",    look: "lilin" },
  { id: "akhir",     a: 1374, b: 1452, st: "sea",    look: "malam" },
];
const shotAt = (f) => {
  let s = SHOTS[0];
  for (const x of SHOTS) if (f >= x.a) s = x;
  return s;
};

function camFor(S, u) {
  const e = sm(u);
  switch (S.id) {
    case "hook": return { pos: [0.7 - 0.3 * e, 2.55, 4.4 - 0.9 * e], look: [-0.3, 1.9, -1.6], fov: 36, roll: 0.6 - 0.4 * e };
    case "peta": return { pos: [-0.6 + 1.2 * e, 3.1 - 0.3 * e, 5.2 - 0.8 * e], look: [0, 1.8, -2], fov: 42, roll: -0.5 + 0.6 * e };
    case "pelabuhan": return { pos: [-1.5 + 3 * e, 2.8, 17 - 4 * e], look: [0, 3.4, -15], fov: 44, roll: -1 + 1.4 * e };
    case "armada": return { pos: [-2 + 2.5 * e, 5.2 - 0.7 * e, 25 - 7 * e], look: [-2, 2.4, -13], fov: 42, roll: -1.2 + 2.4 * e };
    case "serang": return { pos: [8 - 2 * e, 2.0, 10 - 3.5 * e], look: [-5, 3.4, -15], fov: 48, roll: 2 - 3 * e };
    case "dagang": return { pos: [-2.0 + 1.4 * e, 2.1, 8.5 - 2.5 * e], look: [-3.4, 1.7, -2.5], fov: 42, roll: -1 + 1.6 * e };
    case "kolonial": return { pos: [1.5 - 1.0 * e, 4.4 - 0.4 * e, 16 - 3.5 * e], look: [0, 2.6, -20], fov: 44, roll: 1 - 1.6 * e };
    case "kelas": return { pos: [0.4 - 0.8 * e, 2.85, 7.6 - 1.3 * e], look: [-0.4, 3.4, -6.5], fov: 40, roll: -0.6 + 1.0 * e };
    case "tulip": return { pos: [2.2 + 1.6 * e, 1.95, 6.8 - 1.8 * e], look: [5.2, 1.5, -2.6], fov: 40, roll: 0.8 - 1.2 * e };
    case "istana": return { pos: [0, 2.8, 8.5 - 2.5 * e], look: [0, 3.9, -6], fov: 44, roll: -0.7 + 1.2 * e };
    case "tanya": return { pos: [0.5 - 0.6 * e, 2.45, 4.2 - 1.0 * e], look: [0, 1.95, -1.5], fov: 34, roll: 0.8 - 1.0 * e };
    case "adidaya": return { pos: [-1.2 - 1.6 * e, 2.35, 4.6 - 1.1 * e], look: [-3.6, 2.9, -5.2], fov: 34, roll: -0.8 + 1.2 * e };
    case "salah": return { pos: [0, 7.0 - 1.0 * e, 12 - 2 * e], look: [0, 2.2, -24], fov: 48, roll: 1.4 - 2.2 * e };
    case "kebiasaan": return { pos: [1.1, 2.2, 3.4 - 0.5 * e], look: [1.9, 2.35, -1.3], fov: 30, roll: -0.6 + 1.0 * e };
    default: return { pos: [0, 2.6, 26 - 7 * e], look: [0, 2.0, -16], fov: 44, roll: 1.2 - 1.6 * e };
  }
}

// ---------------------------------------------------------------- frame
const frame = (f) => {
  const S = shotAt(f);
  const u = clamp((f - S.a) / Math.max(1, S.b - S.a));
  for (const k in stages) stages[k].visible = k === S.st;
  setLook(S.look);

  if (stages.sea.userData.ships) {
    for (const s of stages.sea.userData.ships) {
      const b = s.userData.bob || { amp: 0.03, spd: 26, ph: 0 };
      s.position.y = Math.sin(f / b.spd + b.ph) * b.amp;
      s.rotation.z = Math.sin(f / (b.spd * 1.25) + b.ph) * 0.011;
    }
  }
  T.water.offset.set(f * 0.0012, f * 0.0006);
  T.cloud.offset.x = f * 0.0004;

  const C = camFor(S, u);
  cam.fov = C.fov;
  cam.position.set(C.pos[0], C.pos[1], C.pos[2]);
  cam.up.set(0, 1, 0);
  cam.lookAt(C.look[0], C.look[1], C.look[2]);
  cam.rotateZ((C.roll * Math.PI) / 180);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();

  const L = LOOK[S.look];
  sun.position.set(cam.position.x + L.sun[0], cam.position.y + L.sun[1], cam.position.z + L.sun[2]);
  sun.target.position.set(C.look[0], C.look[1], C.look[2]);
  sun.target.updateMatrixWorld();

  glitter.position.set(16, 0.03, -152);
  glitter.rotation.y = Math.atan2(cam.position.x - 16, cam.position.z + 152);
  for (const d of glitter.userData.dash) {
    d.material.opacity = Math.max(0, d.material.opacity * 0.92 + 0.08 * (0.25 + 0.35 * Math.sin(f * 0.09 * d.userData.sp + d.position.z)));
  }

  const vis = stages[S.st];
  if (vis && vis.userData.cards) {
    for (const c of vis.userData.cards) {
      c.rotation.y = Math.atan2(cam.position.x - c.position.x, cam.position.z - c.position.z);
    }
  }

  flash.material.opacity = 0;
  renderer.clear();
  renderer.render(scene, cam);
  renderer.render(ovS, ovC);
};

window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.94); };
window.ready = true;
