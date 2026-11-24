// Set & properti asli untuk "Belanda menjadi jajahan Indonesia".
// Semua bentuk, tekstur, panji, dan warna di file ini ditulis dari nol.
import * as THREE from "three";
import { makeFleet } from "./ship.js";

export const INK = 0x241a24;

const GRAD = (() => {
  const t = new THREE.DataTexture(new Uint8Array([92, 168, 246]), 3, 1, THREE.RedFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

export const toon = (color, map = null, extra = {}) =>
  new THREE.MeshToonMaterial({ color, map, gradientMap: GRAD, ...extra });

const rng = (seed) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

const tex = (w, h, draw, rep = [1, 1]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep[0], rep[1]);
  t.anisotropy = 4;
  return t;
};

// ---------------------------------------------------------------- painters
const wood = tex(256, 256, (g, w, h) => {
  g.fillStyle = "#8a5a3b";
  g.fillRect(0, 0, w, h);
  const r = rng(7);
  for (let x = 0; x < w; x += 32) {
    g.fillStyle = x % 64 ? "#7d4f33" : "#956343";
    g.fillRect(x + 2, 0, 28, h);
    g.strokeStyle = "rgba(52,30,20,.75)";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }
  g.strokeStyle = "rgba(58,34,22,.35)";
  g.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    const x = r() * w, y = r() * h, l = 18 + r() * 70;
    g.beginPath();
    g.moveTo(x, y);
    g.bezierCurveTo(x + 6, y + l * 0.3, x - 4, y + l * 0.7, x + 3, y + l);
    g.stroke();
  }
});

const sail = tex(256, 256, (g, w, h) => {
  g.fillStyle = "#f4e7c8";
  g.fillRect(0, 0, w, h);
  const r = rng(19);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(150,120,80,${0.02 + r() * 0.05})`;
    g.beginPath();
    g.ellipse(r() * w, r() * h, 6 + r() * 26, 3 + r() * 12, r() * 3, 0, 7);
    g.fill();
  }
  g.strokeStyle = "rgba(120,92,60,.55)";
  g.lineWidth = 3;
  for (let y = 24; y < h; y += 38) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  g.strokeStyle = "#3a2a24";
  g.lineWidth = 12;
  g.strokeRect(6, 6, w - 12, h - 12);
});

const water = tex(512, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#3f9aa8");
  gr.addColorStop(1, "#226878");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const r = rng(31);
  for (let i = 0; i < 190; i++) {
    const y = r() * h, x = r() * w, l = 24 + r() * 90;
    g.strokeStyle = `rgba(${140 + r() * 60},${210 + r() * 40},${215 + r() * 40},${0.06 + r() * 0.18})`;
    g.lineWidth = 1 + r() * 3;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + l * 0.5, y - 3 - r() * 5, x + l, y);
    g.stroke();
  }
  for (let i = 0; i < 26; i++) {
    g.strokeStyle = "rgba(235,250,250,.35)";
    g.lineWidth = 2 + r() * 2;
    const y = r() * h, x = r() * w, l = 10 + r() * 34;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + l, y);
    g.stroke();
  }
}, [18, 18]);

const plaster = tex(256, 256, (g, w, h) => {
  g.fillStyle = "#e9dcc0";
  g.fillRect(0, 0, w, h);
  const r = rng(43);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = `rgba(120,96,70,${r() * 0.06})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 4);
  }
  g.strokeStyle = "rgba(120,96,70,.16)";
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const x = r() * w, y = r() * h;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 8, y + 14);
    g.lineTo(x + 2, y + 30);
    g.stroke();
  }
});

const roof = tex(256, 256, (g, w, h) => {
  g.fillStyle = "#b75238";
  g.fillRect(0, 0, w, h);
  const r = rng(57);
  for (let y = 0; y < h; y += 26) {
    for (let x = 0; x < w; x += 34) {
      g.fillStyle = `rgb(${168 + r() * 34},${72 + r() * 24},${50 + r() * 18})`;
      g.beginPath();
      g.roundRect(x + 2, y + 2, 30, 22, 5);
      g.fill();
    }
  }
});

const stone = tex(256, 256, (g, w, h) => {
  g.fillStyle = "#8d8a80";
  g.fillRect(0, 0, w, h);
  const r = rng(71);
  for (let y = 0; y < h; y += 34) {
    for (let x = (y / 34) % 2 ? -24 : 0; x < w; x += 48) {
      g.fillStyle = `rgb(${128 + r() * 30},${124 + r() * 28},${116 + r() * 26})`;
      g.fillRect(x + 2, y + 2, 44, 30);
      g.strokeStyle = "rgba(58,54,50,.5)";
      g.lineWidth = 3;
      g.strokeRect(x + 2, y + 2, 44, 30);
    }
  }
});

const grass = tex(256, 256, (g, w, h) => {
  g.fillStyle = "#6f8a52";
  g.fillRect(0, 0, w, h);
  const r = rng(83);
  for (let i = 0; i < 700; i++) {
    g.strokeStyle = `rgba(${70 + r() * 50},${110 + r() * 50},${54 + r() * 40},.7)`;
    g.lineWidth = 1.5;
    const x = r() * w, y = r() * h;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 6, y - 4 - r() * 8);
    g.stroke();
  }
});

const cloud = tex(512, 256, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  const r = rng(97);
  for (let i = 0; i < 22; i++) {
    const x = 80 + r() * (w - 160), y = 100 + r() * 70, rad = 28 + r() * 58;
    const gr = g.createRadialGradient(x, y, rad * 0.2, x, y, rad);
    gr.addColorStop(0, "rgba(255,248,232,.95)");
    gr.addColorStop(0.7, "rgba(255,244,226,.55)");
    gr.addColorStop(1, "rgba(255,240,220,0)");
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, rad, 0, 7);
    g.fill();
  }
});

const foam = tex(256, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  const r = rng(103);
  g.strokeStyle = "rgba(245,255,255,.85)";
  for (let i = 0; i < 20; i++) {
    g.lineWidth = 1 + r() * 3;
    const y = 30 + r() * 70, x = 10 + r() * (w - 90), l = 20 + r() * 70;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + l * 0.5, y - 5 - r() * 6, x + l, y);
    g.stroke();
  }
});

const banner = (a, b, emblem) => tex(256, 128, (g, w, h) => {
  g.fillStyle = a;
  g.fillRect(0, 0, w, h);
  g.fillStyle = b;
  g.fillRect(0, 0, w, 22);
  g.fillRect(0, h - 22, w, 22);
  g.strokeStyle = "#2a1c26";
  g.lineWidth = 8;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.save();
  g.translate(w / 2, h / 2);
  g.strokeStyle = b;
  g.lineWidth = 7;
  g.beginPath();
  g.arc(0, 0, 26, 0, 7);
  g.stroke();
  if (emblem === "wave") {
    for (let i = -1; i <= 1; i++) {
      g.beginPath();
      g.moveTo(-22, i * 10);
      g.quadraticCurveTo(-8, i * 10 - 8, 0, i * 10);
      g.quadraticCurveTo(10, i * 10 + 8, 22, i * 10);
      g.stroke();
    }
  } else if (emblem === "sun") {
    for (let i = 0; i < 8; i++) {
      const a2 = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(Math.cos(a2) * 14, Math.sin(a2) * 14);
      g.lineTo(Math.cos(a2) * 32, Math.sin(a2) * 32);
      g.stroke();
    }
  } else {
    g.beginPath();
    g.moveTo(0, -24);
    g.lineTo(10, 0);
    g.lineTo(0, 24);
    g.lineTo(-10, 0);
    g.closePath();
    g.stroke();
  }
  g.restore();
});

export const T = {
  wood, sail, water, plaster, roof, stone, grass, cloud, foam,
  bannerWave: banner("#1d6b66", "#e8c45a", "wave"),
  bannerSun: banner("#8e2f3a", "#f0d9a8", "sun"),
  bannerKris: banner("#2f3f6b", "#d9b45a", "kris"),
};

// ---------------------------------------------------------------- helpers
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const cyl = (r1, r2, h, mat, seg = 8) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat);

function ink(mesh, k = 1.035) {
  const o = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }));
  o.scale.setScalar(k);
  mesh.add(o);
  return mesh;
}

// ---------------------------------------------------------------- ships
function buildFleet() {
  return makeFleet({ T });
}

// ---------------------------------------------------------------- coasts
function palm(x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = cyl(0.1 * s, 0.16 * s, 2.6 * s, toon(0x7b5a3a), 6);
  trunk.position.y = 1.3 * s;
  trunk.rotation.z = 0.1;
  ink(trunk, 1.05);
  g.add(trunk);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.25 * s, 8, 6), toon(0x3f7a4a));
    leaf.scale.set(0.95, 0.13, 0.3);
    leaf.position.y = 2.6 * s;
    leaf.rotation.y = (i / 7) * Math.PI * 2;
    leaf.rotation.z = -0.25;
    leaf.position.x = Math.cos((i / 7) * Math.PI * 2) * 0.6 * s;
    leaf.position.z = Math.sin((i / 7) * Math.PI * 2) * 0.6 * s;
    ink(leaf, 1.03);
    g.add(leaf);
  }
  g.position.set(x, 0, z);
  return g;
}

function windmill(x, z, s = 1) {
  const g = new THREE.Group();
  const body = cyl(0.8 * s, 1.1 * s, 3.4 * s, toon(0xffffff, T.plaster), 8);
  body.position.y = 1.7 * s;
  ink(body, 1.03);
  g.add(body);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.0 * s, 1.1 * s, 8), toon(0xffffff, T.roof));
  cap.position.y = 3.95 * s;
  ink(cap, 1.03);
  g.add(cap);
  const hub = cyl(0.1 * s, 0.1 * s, 0.3 * s, toon(0x3a2a24), 6);
  hub.rotation.x = Math.PI / 2;
  hub.position.set(0, 3.4 * s, 1.0 * s);
  g.add(hub);
  for (let i = 0; i < 4; i++) {
    const blade = box(0.22 * s, 2.2 * s, 0.08 * s, toon(0xd9c9a4));
    blade.position.set(0, 3.4 * s + Math.cos((i / 4) * Math.PI * 2) * 1.1 * s, 1.0 * s + Math.sin((i / 4) * Math.PI * 2) * 1.1 * s);
    blade.rotation.x = (i / 4) * Math.PI * 2;
    ink(blade, 1.04);
    g.add(blade);
  }
  g.position.set(x, 0, z);
  return g;
}

function fort(x, z, s = 1) {
  const g = new THREE.Group();
  const wall = box(5.2 * s, 2.2 * s, 2.6 * s, toon(0xffffff, T.stone));
  wall.position.y = 1.1 * s;
  ink(wall, 1.03);
  g.add(wall);
  for (let i = 0; i < 5; i++) {
    const m = box(0.7 * s, 0.55 * s, 0.5 * s, toon(0xffffff, T.stone));
    m.position.set(-2.1 * s + i * 1.05 * s, 2.45 * s, 1.1 * s);
    g.add(m);
  }
  const tower = cyl(0.9 * s, 1.1 * s, 3.2 * s, toon(0xffffff, T.stone), 8);
  tower.position.set(-2.6 * s, 1.6 * s, 0);
  ink(tower, 1.03);
  g.add(tower);
  const rf = new THREE.Mesh(new THREE.ConeGeometry(1.3 * s, 1.2 * s, 8), toon(0xffffff, T.roof));
  rf.position.set(-2.6 * s, 3.7 * s, 0);
  ink(rf, 1.03);
  g.add(rf);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.2 * s, 0.7 * s), new THREE.MeshBasicMaterial({ map: T.bannerSun, side: THREE.DoubleSide, transparent: true }));
  flag.position.set(-1.6 * s, 4.1 * s, 0.1);
  g.add(flag);
  g.position.set(x, 0, z);
  return g;
}

function shrine(x, z, s = 1) {
  const g = new THREE.Group();
  const base = box(5.0 * s, 1.0 * s, 4.0 * s, toon(0xffffff, T.stone));
  base.position.y = 0.5 * s;
  ink(base, 1.02);
  g.add(base);
  for (let i = 0; i < 3; i++) {
    const w = (4.2 - i * 0.9) * s;
    const tier = box(w, 1.1 * s, w * 0.78, toon(0xffffff, T.plaster));
    tier.position.y = (1.0 + i * 1.05) * s;
    ink(tier, 1.02);
    g.add(tier);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, 1.0 * s, 4), toon(0xffffff, T.roof));
    rf.rotation.y = Math.PI / 4;
    rf.position.y = (1.95 + i * 1.05) * s;
    ink(rf, 1.02);
    g.add(rf);
  }
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.0 * s, 0.6 * s), new THREE.MeshBasicMaterial({ map: T.bannerWave, side: THREE.DoubleSide, transparent: true }));
  flag.position.set(1.4 * s, 4.6 * s, 0);
  g.add(flag);
  g.position.set(x, 0, z);
  return g;
}

function buildCoast(side) {
  const g = new THREE.Group();
  const s = side < 0 ? -1 : 1;
  const base = new THREE.Mesh(new THREE.PlaneGeometry(70, 34), toon(0xffffff, T.grass));
  base.rotation.x = -Math.PI / 2;
  base.position.set(s * 24, 0.06, -46);
  g.add(base);

  for (let i = 0; i < 7; i++) {
    const h = 3.0 + (i % 3) * 1.6;
    const hill = new THREE.Mesh(new THREE.SphereGeometry(h, 14, 10), toon(0x5f7d4a));
    hill.scale.y = 0.6;
    hill.position.set(s * (19 + i * 3.1), h * 0.3, -52 - (i % 2) * 6);
    ink(hill, 1.03);
    g.add(hill);
  }

  for (let i = 0; i < 8; i++) {
    const x = s * (15 + i * 2.3), z = -40 - (i % 3) * 2.4;
    const h = 2.2 + (i % 4) * 0.65;
    const house = box(2.1, h, 1.9, toon(0xffffff, T.plaster));
    house.position.set(x, h / 2, z);
    ink(house, 1.03);
    g.add(house);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.0, 4), toon(0xffffff, T.roof));
    rf.rotation.y = Math.PI / 4;
    rf.position.set(x, h + 0.45, z);
    ink(rf, 1.03);
    g.add(rf);
  }

  if (side < 0) {
    g.add(palm(s * 14, -37, 1.15));
    g.add(palm(s * 18, -39, 0.95));
    g.add(palm(s * 21, -36, 1.05));
    g.add(shrine(s * 24, -43, 1.0));
  } else {
    g.add(windmill(s * 17, -39, 1.05));
    g.add(fort(s * 25, -42, 1.0));
  }
  return g;
}

function cloudCard(x, y, z, s) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(6 * s, 3 * s),
    new THREE.MeshBasicMaterial({ map: T.cloud, transparent: true, depthWrite: false, opacity: 0.9 })
  );
  m.position.set(x, y, z);
  return m;
}

// ---------------------------------------------------------------- sea stage
export function buildSeaStage() {
  const g = new THREE.Group();

  const sea = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), toon(0xffffff, T.water));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = 0;
  g.add(sea);

  const fleet = buildFleet();
  g.add(fleet);

  g.add(buildCoast(-1));
  g.add(buildCoast(1));

  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(5.5, 32),
    new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.92 })
  );
  sun.position.set(16, 15, -150);
  g.add(sun);

  for (const [x, y, z, s] of [
    [-26, 24, -130, 2.6], [12, 30, -145, 3.2], [38, 20, -120, 2.0],
    [-48, 17, -110, 1.7], [54, 27, -140, 2.4], [2, 35, -160, 3.6],
  ]) g.add(cloudCard(x, y, z, s));

  g.userData = { fleet, sea, kind: "sea" };
  return g;
}

// ---------------------------------------------------------------- canal town
export function buildTownStage() {
  const g = new THREE.Group();

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), toon(0xffffff, T.stone));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.02;
  g.add(ground);

  const canal = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 80), toon(0xffffff, T.water));
  canal.rotation.x = -Math.PI / 2;
  canal.position.set(0, 0.05, -18);
  g.add(canal);

  const r = rng(211);
  for (let side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const w = 3.4 + r() * 1.2, h = 4.2 + r() * 2.4, d = 4.2 + r() * 1.6;
      const x = side * (5.6 + w / 2), z = -44 + i * 5.4;
      const b = box(w, h, d, toon(0xffffff, T.plaster));
      b.position.set(x, h / 2, z);
      ink(b, 1.02);
      g.add(b);
      const rf = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, 1.5, 4), toon(0xffffff, T.roof));
      rf.rotation.y = Math.PI / 4;
      rf.position.set(x, h + 0.75, z);
      ink(rf, 1.02);
      g.add(rf);
      for (let k = 0; k < 3; k++) {
        const win = box(0.55, 0.75, 0.08, toon(0x2f4f66));
        win.position.set(x - side * (w / 2 + 0.05), 1.6 + k * 1.15, z - 1.0 + (k % 2) * 1.8);
        g.add(win);
      }
    }
  }

  const bridge = box(8.4, 0.45, 2.6, toon(0xffffff, T.wood));
  bridge.position.set(0, 1.25, -8);
  ink(bridge, 1.02);
  g.add(bridge);
  for (const sx of [-1, 1]) {
    const rail = box(0.12, 1.0, 2.6, toon(0x5a3524));
    rail.position.set(sx * 4.1, 1.95, -8);
    g.add(rail);
  }

  for (let i = 0; i < 3; i++) {
    const boat = box(1.0, 0.35, 2.4, toon(0xffffff, T.wood));
    boat.position.set(-2.2 + i * 2.2, 0.22, -22 - i * 4);
    ink(boat, 1.03);
    g.add(boat);
  }

  g.userData = { kind: "town" };
  return g;
}

// ---------------------------------------------------------------- classroom
export function buildClassStage() {
  const g = new THREE.Group();
  const floor = box(22, 0.3, 16, toon(0xffffff, T.wood));
  floor.position.y = -0.15;
  g.add(floor);
  const back = box(22, 8, 0.3, toon(0xd9c9a8));
  back.position.set(0, 4, -8);
  g.add(back);
  const sideL = box(0.3, 8, 16, toon(0xcfbfa0));
  sideL.position.set(-11, 4, 0);
  g.add(sideL);
  const sideR = sideL.clone();
  sideR.position.x = 11;
  g.add(sideR);

  const board = box(9.2, 4.4, 0.12, toon(0x24352e));
  board.position.set(0, 4.6, -7.75);
  g.add(board);
  const frame = box(9.7, 4.9, 0.08, toon(0x6b4a2e));
  frame.position.set(0, 4.6, -7.83);
  g.add(frame);

  for (let i = 0; i < 4; i++) {
    const desk = box(3.2, 0.18, 1.5, toon(0xffffff, T.wood));
    desk.position.set(-6.5 + i * 4.3, 1.5, 1.0);
    ink(desk, 1.02);
    g.add(desk);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leg = box(0.14, 1.5, 0.14, toon(0x5a3524));
      leg.position.set(desk.position.x + sx * 1.35, 0.75, desk.position.z + sz * 0.55);
      g.add(leg);
    }
  }

  const teacher = box(2.6, 0.2, 1.2, toon(0xffffff, T.wood));
  teacher.position.set(-6.0, 1.7, -4.6);
  g.add(teacher);

  g.userData = { kind: "class" };
  return g;
}

// ---------------------------------------------------------------- map room
export function buildMapStage() {
  const g = new THREE.Group();
  const floor = box(18, 0.3, 14, toon(0x2a2228));
  floor.position.y = -0.15;
  g.add(floor);
  const table = box(6.0, 0.3, 3.4, toon(0x4a3328));
  table.position.set(0, 1.5, -1.5);
  ink(table, 1.02);
  g.add(table);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.22, 1.5, 0.22, toon(0x3a2820));
    leg.position.set(sx * 2.6, 0.75, -1.5 + sz * 1.35);
    g.add(leg);
  }
  const map = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.8), toon(0xe6d3a4));
  map.rotation.x = -Math.PI / 2;
  map.position.set(0, 1.68, -1.5);
  g.add(map);
  const candle = cyl(0.08, 0.1, 0.5, toon(0xf0e2c0), 6);
  candle.position.set(1.9, 1.9, -1.3);
  g.add(candle);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffcf6a }));
  flame.position.set(1.9, 2.22, -1.3);
  g.add(flame);
  g.userData = { kind: "map", flame };
  return g;
}

export function buildWorld(scene) {
  const stages = {
    sea: buildSeaStage(),
    town: buildTownStage(),
    class: buildClassStage(),
    map: buildMapStage(),
  };
  for (const k in stages) {
    stages[k].position.set(0, 0, 0);
    stages[k].visible = false;
    scene.add(stages[k]);
  }
  return stages;
}
