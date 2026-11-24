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
  senja: { sky: ["#4f6fa8", "#ffcf8a"], fog: 0xf2c08a, fn: [70, 280], hemi: [0xffd9b2, 0x6a5a70, 1.18], dir: [0xffc27c, 1.65], sun: [-8, 9, 7] },
  malam: { sky: ["#16203c", "#463a58"], fog: 0x2a2a44, fn: [30, 150], hemi: [0x9fb0ff, 0x2a2a3a, 0.82], dir: [0x9fb0ff, 0.7], sun: [-4, 8, 5] },
  kelas: { sky: ["#3a2f28", "#6a5444"], fog: 0x5a4a3a, fn: [12, 55], hemi: [0xffe8c8, 0x5a4a3a, 1.0], dir: [0xffe0b0, 1.0], sun: [-3, 6, 4] },
};
const skyTex = {};
for (const k in LOOK) {
  const c = document.createElement("canvas");
  c.width = 8; c.height = 256;
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, LOOK[k].sky[0]);
  gr.addColorStop(1, LOOK[k].sky[1]);
  g.fillStyle = gr; g.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  skyTex[k] = t;
}
let curLook = null;
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
  gr.addColorStop(0, "rgba(16,8,22,0)");
  gr.addColorStop(0.65, "rgba(16,8,22,.06)");
  gr.addColorStop(1, "rgba(16,8,22,.34)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 456);
}
const vig = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(vc), transparent: true, depthTest: false }));
ovS.add(vig);
const flash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0xfff6e8, transparent: true, opacity: 0, depthTest: false }));
ovS.add(flash);

// ---------------------------------------------------------------- shots
const SHOTS = [
  { id: "armada", a: 0, b: 146, st: "sea", look: "pagi" },
  { id: "dermaga", a: 146, b: 229, st: "sea", look: "pagi" },
  { id: "datang", a: 229, b: 317, st: "sea", look: "senja" },
  { id: "hadapan", a: 317, b: 488, st: "sea", look: "senja" },
  { id: "serang", a: 488, b: 570, st: "sea", look: "senja" },
  { id: "pasar", a: 570, b: 617, st: "town", look: "pagi" },
  { id: "amsterdam", a: 617, b: 710, st: "town", look: "senja" },
  { id: "kelas", a: 710, b: 826, st: "class", look: "kelas" },
  { id: "tulip", a: 826, b: 909, st: "town", look: "pagi" },
  { id: "kota", a: 909, b: 1004, st: "town", look: "senja" },
  { id: "gelap", a: 1004, b: 1089, st: "map", look: "malam" },
  { id: "adidaya", a: 1089, b: 1201, st: "town", look: "pagi" },
  { id: "ulang", a: 1201, b: 1300, st: "sea", look: "malam" },
  { id: "akhir", a: 1300, b: 1452, st: "sea", look: "senja" },
];
const shotAt = (f) => {
  let s = SHOTS[0];
  for (const x of SHOTS) if (f >= x.a) s = x;
  return s;
};

function camFor(S, u) {
  const e = sm(u);
  switch (S.id) {
    case "armada": return { pos: [-6 + 9 * e, 3.2 + 0.5 * e, 21 - 9 * e], look: [0, 3.1, -13], fov: 46, roll: -1.5 + 3 * e };
    case "dermaga": return { pos: [-16 + 3 * e, 2.2, 9 - 2 * e], look: [-22, 1.4, -16], fov: 44, roll: 1.5 - 3 * e };
    case "datang": return { pos: [7 - 3 * e, 2.0, 11 - 4 * e], look: [0, 1.7, -9], fov: 46, roll: -2 + 4 * e };
    case "hadapan": return { pos: [0, 8.4 - 1.2 * e, 42 - 6 * e], look: [0, 2.6, -14], fov: 50 - 3 * e, roll: -1.5 + 3 * e };
    case "serang": return { pos: [9 + 5 * e, 2.2, 7 - 5 * e], look: [20, 1.7, -20], fov: 44, roll: 2 - 4 * e };
    case "pasar": return { pos: [-2.5 + 1.5 * e, 2.1, 8 - 3 * e], look: [0, 1.4, -9], fov: 44, roll: -1 + 2 * e };
    case "amsterdam": return { pos: [2.5 - 2 * e, 3.6, 15 - 4 * e], look: [0, 2.2, -17], fov: 46, roll: 1 - 2 * e };
    case "kelas": return { pos: [0, 3.2, 9 - 2 * e], look: [0, 3.0, -8], fov: 46, roll: -1 + 2 * e };
    case "tulip": return { pos: [-3.5 + 2 * e, 2.1, 8 - 2 * e], look: [0, 1.2, -8], fov: 42, roll: 1 - 2 * e };
    case "kota": return { pos: [0, 11 - 2 * e, 17 - 4 * e], look: [0, 2.0, -22], fov: 48, roll: -2 + 3 * e };
    case "gelap": return { pos: [0, 2.7, 5.8 - 1.5 * e], look: [0, 1.7, -2.2], fov: 40, roll: -1 + 2 * e };
    case "adidaya": return { pos: [-9 + 18 * e, 3.6, 13 - 2 * e], look: [0, 2.2, -13], fov: 46, roll: 0 };
    case "ulang": return { pos: [0, 2.5, 26 - 9 * e], look: [0, 1.8, -11], fov: 46, roll: 2 - 3 * e };
    default: return { pos: [0, 3.2, 21 + 20 * e], look: [0, 2.2, -32], fov: 50, roll: -1 + 1 * e };
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

  flash.material.opacity = 0;
  renderer.clear();
  renderer.render(scene, cam);
  renderer.render(ovS, ovC);
};

window.renderFrame = (f) => { frame(f); return renderer.domElement.toDataURL("image/jpeg", 0.94); };
window.ready = true;
