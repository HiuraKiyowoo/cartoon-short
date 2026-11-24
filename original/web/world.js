// Set & properti asli untuk "Belanda menjadi jajahan Indonesia".
// Semua bentuk, tekstur, panji, dan warna di file ini ditulis dari nol.
import * as THREE from "three";
import { makeFleet, makeShip } from "./ship.js";
import { makeCard, cardRow, textTexture } from "./cards.js";

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
  g.fillStyle = "#9c6a45";
  g.fillRect(0, 0, w, h);
  const r = rng(7);
  for (let x = 0; x < w; x += 32) {
    g.fillStyle = x % 64 ? "#8d5c3c" : "#a9744c";
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
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#fdf7e6");
  gr.addColorStop(0.62, "#f6ebd0");
  gr.addColorStop(1, "#e8d5b0");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const r = rng(19);
  for (let i = 0; i < 220; i++) {
    g.fillStyle = `rgba(152,124,86,${0.01 + r() * 0.028})`;
    g.beginPath();
    g.ellipse(r() * w, r() * h, 4 + r() * 16, 2 + r() * 7, r() * 3, 0, 7);
    g.fill();
  }
  g.strokeStyle = "rgba(146,120,84,.26)";
  g.lineWidth = 2;
  for (let x = 34; x < w; x += 52) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }
  g.strokeStyle = "rgba(146,120,84,.16)";
  g.lineWidth = 1.5;
  for (let y = 40; y < h; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
});

const sailPattern = tex(256, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#fdf4dd");
  gr.addColorStop(1, "#efdfbc");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#b4462f";
  g.fillRect(0, 58, w, 26);
  g.fillStyle = "#d9a441";
  g.fillRect(0, 100, w, 16);
  g.fillStyle = "#b4462f";
  g.fillRect(0, 168, w, 20);
  g.strokeStyle = "rgba(140,110,76,.3)";
  g.lineWidth = 2;
  for (let x = 34; x < w; x += 52) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }
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

const brick = tex(256, 256, (g, w, h) => {
  g.fillStyle = "#b07a5a";
  g.fillRect(0, 0, w, h);
  const r = rng(509);
  for (let y = 0; y < h; y += 22) {
    for (let x = (y / 22) % 2 ? -26 : 0; x < w; x += 52) {
      g.fillStyle = `rgb(${150 + r() * 46},${92 + r() * 34},${66 + r() * 26})`;
      g.fillRect(x + 2, y + 2, 48, 18);
    }
  }
  g.strokeStyle = "rgba(90,64,48,.35)";
  g.lineWidth = 2;
  for (let y = 0; y < h; y += 22) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
}, [2, 2]);

const earth = tex(256, 256, (g, w, h) => {
  g.fillStyle = "#9a7a55";
  g.fillRect(0, 0, w, h);
  const r = rng(311);
  for (let i = 0; i < 500; i++) {
    g.fillStyle = `rgba(${90 + r() * 60},${68 + r() * 44},${44 + r() * 34},${0.06 + r() * 0.16})`;
    g.beginPath();
    g.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 5, r() * 3, 0, 7);
    g.fill();
  }
  g.strokeStyle = "rgba(70,52,36,.25)";
  for (let i = 0; i < 14; i++) {
    g.lineWidth = 1 + r() * 2;
    const x = r() * w, y = r() * h;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 20, y + 8, x + 44, y - 4);
    g.stroke();
  }
}, [6, 6]);

const awning = tex(256, 128, (g, w, h) => {
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? "#f1e4c8" : "#b4462f";
    g.fillRect((i * w) / 8, 0, w / 8, h);
  }
  g.fillStyle = "rgba(60,40,30,.18)";
  g.fillRect(0, h - 16, w, 16);
});

const tulipSign = textTexture(512, 256, (g, w, h) => {
  g.fillStyle = "#f2e6cc";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#3a2a24";
  g.lineWidth = 14;
  g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = "#2f3f6b";
  g.font = "bold 96px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("TULIP", w / 2, h / 2 - 4);
});

const cheeseSign = textTexture(512, 256, (g, w, h) => {
  g.fillStyle = "#f2e6cc";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#3a2a24";
  g.lineWidth = 14;
  g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = "#8e2f3a";
  g.font = "bold 96px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("KEJU", w / 2, h / 2 - 4);
});

export const T = {
  wood, sail, water, plaster, roof, stone, grass, cloud, foam,
  bannerWave: banner("#1d6b66", "#e8c45a", "wave"),
  bannerSun: banner("#8e2f3a", "#f0d9a8", "sun"),
  bannerKris: banner("#2f3f6b", "#d9b45a", "kris"),
  sailPattern,
  earth,
  brick,
  awning,
  tulipSign,
  cheeseSign,
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
  const base = new THREE.Mesh(new THREE.PlaneGeometry(46, 270), toon(0xffffff, T.grass));
  base.rotation.x = -Math.PI / 2;
  base.position.set(s * 28, 0.06, -158);
  g.add(base);

  const bank = box(9, 1.4, 250, toon(0x7f8f5a, T.grass));
  bank.position.set(s * 9.5, 0.7, -155);
  ink(bank, 1.01);
  g.add(bank);

  for (let i = 0; i < 12; i++) {
    const hh = 2.4 + ((i * 5) % 4) * 1.5;
    const knoll = new THREE.Mesh(new THREE.SphereGeometry(hh, 12, 8), toon(0x5c7a4a));
    knoll.scale.set(1.6, 0.55, 1.1);
    knoll.position.set(s * (8 + (i % 5) * 3.2), hh * 0.2, -34 - Math.floor(i / 5) * 12 - (i % 3) * 4);
    ink(knoll, 1.02);
    g.add(knoll);
  }

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

  for (let i = 0; i < 9; i++) {
    const h = 5 + (i % 4) * 3.2;
    const isle = new THREE.Mesh(new THREE.SphereGeometry(h, 12, 8), toon(0x6f8a72));
    isle.scale.set(2.4, 0.34, 1);
    isle.position.set(-88 + i * 22, h * 0.1, -238 - (i % 3) * 14);
    g.add(isle);
  }

  g.userData = { fleet, sea, kind: "sea", ships: fleet.userData.ships };
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
  const facades = [0xd9a882, 0xc08a68, 0xe6c49c, 0xa8705a, 0xd2b090];
  for (let side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const w = 3.4 + r() * 1.2;
      const h = 4.2 + r() * 2.6;
      const d = 4.2 + r() * 1.6;
      const x = side * (5.6 + w / 2);
      const z = -44 + i * 5.4;
      const tone = facades[(i * 3 + (side > 0 ? 1 : 0)) % facades.length];

      const b = box(w, h, d, toon(tone, T.brick));
      b.position.set(x, h / 2, z);
      ink(b, 1.02);
      g.add(b);

      // gable bertingkat khas kanal
      for (let k = 0; k < 3; k++) {
        const gw = w * (0.86 - k * 0.2);
        const gb = box(gw, 0.62, d, toon(tone, T.brick));
        gb.position.set(x, h + 0.31 + k * 0.62, z);
        ink(gb, 1.02);
        g.add(gb);
        const cap = box(gw + 0.16, 0.1, d + 0.16, toon(0x7a5a46));
        cap.position.set(x, h + 0.62 + k * 0.62, z);
        g.add(cap);
      }

      const lit = 0.55 + r() * 0.45;
      const winMat = toon(0xffd9a0, null, { emissive: 0xff9a3a, emissiveIntensity: lit });
      for (let k = 0; k < 3; k++) {
        const wy = 1.5 + k * 1.25;
        if (wy > h - 0.8) continue;
        for (let j = -1; j <= 1; j += 2) {
          const win = box(0.62, 0.85, 0.1, winMat);
          win.position.set(x - side * (w / 2 + 0.04), wy, z + j * (d * 0.24));
          win.rotation.y = Math.PI / 2;
          g.add(win);
          const frame = box(0.76, 1.0, 0.06, toon(0x4a3324));
          frame.position.set(x - side * (w / 2 + 0.01), wy, z + j * (d * 0.24));
          frame.rotation.y = Math.PI / 2;
          g.add(frame);
        }
      }

      const door = box(0.9, 1.6, 0.12, toon(0x4a2c1e));
      door.position.set(x - side * (w / 2 + 0.05), 0.8, z);
      door.rotation.y = Math.PI / 2;
      g.add(door);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
      lamp.position.set(x - side * (w / 2 + 0.16), 2.4, z);
      g.add(lamp);
    }
  }

  // panji di sepanjang kanal
  for (const [x, z] of [[-3.6, 2], [3.6, -6], [-3.6, -14], [3.6, -22]]) {
    const pole = cyl(0.07, 0.09, 5.4, toon(0x5a3a24), 6);
    pole.position.set(x, 2.7, z);
    g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), new THREE.MeshBasicMaterial({ map: T.bannerSun, side: THREE.DoubleSide, transparent: true }));
    flag.position.set(x + 0.78, 4.9, z);
    g.add(flag);
  }

  const bridge = box(8.4, 0.45, 2.6, toon(0xffffff, T.wood));
  bridge.position.set(0, 1.25, -8);
  ink(bridge, 1.02);
  g.add(bridge);
  for (const sx of [-1, 1]) {
    for (let k = -1; k <= 1; k++) {
      const post = box(0.14, 1.0, 0.14, toon(0x4a3324));
      post.position.set(sx * 3.9, 1.95, -8 + k * 1.1);
      g.add(post);
    }
    const rail = box(0.12, 0.12, 2.6, toon(0x5a3524));
    rail.position.set(sx * 3.9, 2.5, -8);
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

  const boardTex = textTexture(1024, 512, (c, w, h) => {
    c.fillStyle = "#22352c";
    c.fillRect(0, 0, w, h);
    const dust = c.createRadialGradient(w * 0.3, h * 0.4, 20, w * 0.5, h * 0.5, w * 0.7);
    dust.addColorStop(0, "rgba(255,255,255,.07)");
    dust.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = dust;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#f4efdc";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "bold 74px Georgia, serif";
    c.fillText("BAHASA INDONESIA", w / 2, 92);
    c.strokeStyle = "rgba(244,239,220,.7)";
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(w * 0.2, 146);
    c.lineTo(w * 0.8, 146);
    c.stroke();
    c.font = "56px Georgia, serif";
    c.fillText("selamat pagi", w / 2, 232);
    c.fillText("terima kasih", w / 2, 318);
    c.fillText("apa kabar?", w / 2, 404);
  });
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(9.2, 4.4),
    new THREE.MeshBasicMaterial({ map: boardTex })
  );
  board.position.set(0, 4.6, -7.68);
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

  cardRow(g, [
    { kind: "teacher", expr: "grin", pose: "point", x: -1.9, z: -3.0, h: 3.5, seed: 3 },
    { kind: "dutchStudent", expr: "neutral", pose: "stand", x: -2.2, z: 0.3, h: 3.2, back: true, seed: 5 },
    { kind: "dutchStudent", expr: "neutral", pose: "stand", x: 1.6, z: 0.3, h: 3.2, back: true, seed: 6 },
    { kind: "dutchwoman", expr: "neutral", pose: "stand", x: 5.2, z: 0.3, h: 3.1, back: true, seed: 7 },
  ]);

  g.userData = { kind: "class" };
  return g;
}

// ---------------------------------------------------------------- map room
export function buildMapStage() {
  const g = new THREE.Group();

  const floor = box(20, 0.3, 16, toon(0x3a2c24, T.wood));
  floor.position.y = -0.15;
  g.add(floor);

  const back = box(20, 9, 0.35, toon(0x4a352a, T.wood));
  back.position.set(0, 4.5, -7.5);
  g.add(back);
  const sideL = box(0.35, 9, 16, toon(0x40301f, T.wood));
  sideL.position.set(-9.8, 4.5, 0);
  g.add(sideL);
  const sideR = sideL.clone();
  sideR.position.x = 9.8;
  g.add(sideR);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), toon(0x2a1e18));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, 7.6, 0);
  g.add(ceil);

  // rak buku di belakang
  for (let i = 0; i < 3; i++) {
    const shelf = box(5.4, 0.14, 1.0, toon(0x6b4a2e));
    shelf.position.set(-5.6, 2.4 + i * 1.5, -6.9);
    g.add(shelf);
    for (let j = 0; j < 14; j++) {
      const bk = box(0.16, 0.9 + (j % 3) * 0.14, 0.7, toon([0x8e2f3a, 0x2f3f6b, 0x6b4a2e, 0x3f6b52][j % 4]));
      bk.position.set(-8.1 + j * 0.37, 2.95 + i * 1.5, -6.9);
      g.add(bk);
    }
  }

  const table = box(6.4, 0.3, 3.6, toon(0x6b4a2e, T.wood));
  table.position.set(0, 1.5, -1.6);
  ink(table, 1.015);
  g.add(table);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.26, 1.5, 0.26, toon(0x4a3324));
    leg.position.set(sx * 2.85, 0.75, -1.6 + sz * 1.45);
    g.add(leg);
  }

  const mapTex = textTexture(1024, 640, (c, w, h) => {
    c.fillStyle = "#e6d3a4";
    c.fillRect(0, 0, w, h);
    const rr = (seed) => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let sd = 77;
    c.strokeStyle = "rgba(120,86,52,.5)";
    c.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      c.beginPath();
      const x = rr(sd += 13) * w, y = rr(sd += 7) * h;
      c.moveTo(x, y);
      c.bezierCurveTo(x + 30, y - 18, x + 60, y + 16, x + 96, y - 6);
      c.stroke();
    }
    c.fillStyle = "rgba(90,120,90,.28)";
    for (let i = 0; i < 9; i++) {
      const x = 80 + rr(sd += 5) * (w - 220);
      const y = 90 + rr(sd += 9) * (h - 200);
      c.beginPath();
      c.ellipse(x, y, 40 + rr(sd += 3) * 70, 24 + rr(sd += 4) * 44, rr(sd += 2) * 3, 0, 7);
      c.fill();
    }
    c.strokeStyle = "#7a4a2e";
    c.lineWidth = 10;
    c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = "#5a3a26";
    c.font = "bold 54px Georgia, serif";
    c.textAlign = "center";
    c.fillText("NUSANTARA", w / 2, h - 70);
  });
  const map = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 3.2), new THREE.MeshBasicMaterial({ map: mapTex }));
  map.rotation.x = -Math.PI / 2;
  map.position.set(0, 1.66, -1.6);
  g.add(map);

  const candle = cyl(0.07, 0.09, 0.55, toon(0xf4ead2), 6);
  candle.position.set(2.1, 1.93, -0.9);
  g.add(candle);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
  flame.scale.y = 1.7;
  flame.position.set(2.1, 2.3, -0.9);
  g.add(flame);
  const glow = new THREE.PointLight(0xffb45a, 8, 9, 2);
  glow.position.set(2.1, 2.7, -0.9);
  g.add(glow);

  // kris di atas meja
  const blade = box(0.09, 0.03, 1.5, toon(0xd8d2c0));
  blade.position.set(-1.9, 1.7, -1.3);
  blade.rotation.y = 0.5;
  g.add(blade);
  const hilt = box(0.13, 0.07, 0.42, toon(0x8a6a3a));
  hilt.position.set(-2.25, 1.72, -0.75);
  hilt.rotation.y = 0.5;
  g.add(hilt);

  // kompas
  const comp = cyl(0.22, 0.22, 0.06, toon(0xc9a05a), 12);
  comp.position.set(1.2, 1.7, -2.3);
  g.add(comp);
  const needle = box(0.04, 0.03, 0.3, toon(0x8e2f3a));
  needle.position.set(1.2, 1.74, -2.3);
  needle.rotation.y = 0.6;
  g.add(needle);

  cardRow(g, [
    { kind: "laksamana", expr: "stern", pose: "point", x: -2.9, z: 0.6, h: 3.5, seed: 31 },
  ]);

  g.userData = { kind: "map", flame, glow };
  return g;
}

export function buildWorld(scene) {
  const stages = {
    sea: buildSeaStage(),
    town: buildTownStage(),
    class: buildClassStage(),
    map: buildMapStage(),
    dock: buildDockStage(),
    market: buildMarketStage(),
    palace: buildPalaceStage(),
  };
  for (const k in stages) {
    stages[k].position.set(0, 0, 0);
    stages[k].visible = false;
    scene.add(stages[k]);
  }
  return stages;
}

// ---------------------------------------------------------------- docks
export function buildDockStage() {
  const g = new THREE.Group();

  const sea = new THREE.Mesh(new THREE.PlaneGeometry(170, 170), toon(0xffffff, T.water));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.02;
  g.add(sea);

  const quay = box(54, 1.0, 28, toon(0xffffff, T.stone));
  quay.position.set(0, 0.5, -14);
  ink(quay, 1.005);
  g.add(quay);

  const lip = box(54, 0.26, 1.4, toon(0xa8a294));
  lip.position.set(0, 1.03, -0.6);
  g.add(lip);

  for (let i = -5; i <= 5; i++) {
    const b = cyl(0.2, 0.24, 0.55, toon(0x3a3430), 7);
    b.position.set(i * 4.8, 1.28, -1.2);
    g.add(b);
    const rope = cyl(0.04, 0.04, 0.9, toon(0x8a7a5c), 4);
    rope.rotation.z = Math.PI / 2;
    rope.position.set(i * 4.8 + 0.45, 1.35, -1.2);
    g.add(rope);
  }

  const warehouse = (cx, w, h, d, tone) => {
    const b = box(w, h, d, toon(tone, T.plaster));
    b.position.set(cx, 1 + h / 2, -24);
    ink(b, 1.01);
    g.add(b);
    const rf1 = box(w * 0.62, 0.34, d * 1.1, toon(0xffffff, T.roof));
    rf1.rotation.z = 0.42;
    rf1.position.set(cx - w * 0.24, 1 + h + 1.0, -24);
    g.add(rf1);
    const rf2 = box(w * 0.62, 0.34, d * 1.1, toon(0xffffff, T.roof));
    rf2.rotation.z = -0.42;
    rf2.position.set(cx + w * 0.24, 1 + h + 1.0, -24);
    g.add(rf2);
    const door = box(2.6, 3.4, 0.16, toon(0x4a3324));
    door.position.set(cx, 1 + 1.7, -24 + d / 2 + 0.06);
    g.add(door);
    for (let i = -1; i <= 1; i += 2) {
      const win = box(1.3, 1.6, 0.14, toon(0xf0dca8, null, { emissive: 0x6b4a1a }));
      win.position.set(cx + i * w * 0.26, 1 + h * 0.62, -24 + d / 2 + 0.06);
      g.add(win);
    }
  };
  warehouse(-17, 13, 8.5, 9, 0xf2e6cc);
  warehouse(0, 15, 10, 9.5, 0xe8d8b8);
  warehouse(17.5, 12, 7.5, 8.5, 0xf6ebd4);

  // derek kayu
  const post = box(0.4, 7.2, 0.4, toon(0x6b4a2e));
  post.position.set(10.5, 1 + 3.6, -7);
  ink(post, 1.02);
  g.add(post);
  const jib = box(5.4, 0.32, 0.32, toon(0x6b4a2e));
  jib.rotation.z = 0.5;
  jib.position.set(12.6, 1 + 7.0, -7);
  g.add(jib);
  const rope = cyl(0.035, 0.035, 4.2, toon(0x8a7a5c), 4);
  rope.position.set(14.9, 1 + 4.9, -7);
  g.add(rope);
  const hookCrate = box(1.05, 1.05, 1.05, toon(0xb98a5a, T.wood));
  hookCrate.position.set(14.9, 1 + 2.7, -7);
  ink(hookCrate, 1.02);
  g.add(hookCrate);

  // peti dan tong di dermaga
  const rand = rng(401);
  for (let i = 0; i < 16; i++) {
    const x = -22 + rand() * 44;
    const z = -4 - rand() * 10;
    if (Math.abs(x) < 3.5) continue;
    if (rand() > 0.5) {
      const c = box(1.1, 1.0, 1.1, toon(0xc09060, T.wood));
      c.position.set(x, 1.5, z);
      c.rotation.y = rand() * 0.8;
      ink(c, 1.02);
      g.add(c);
    } else {
      const bar = cyl(0.62, 0.5, 1.3, toon(0x8a5a3a, T.wood), 9);
      bar.position.set(x, 1.65, z);
      ink(bar, 1.02);
      g.add(bar);
      for (const yy of [1.25, 2.05]) {
        const ring = cyl(0.64, 0.64, 0.1, toon(0x3a3430), 9);
        ring.position.set(x, yy, z);
        g.add(ring);
      }
    }
  }

  // kapal bersandar
  const s1 = makeShip({ T }, { x: -15, z: 2.0, yaw: 1.45, scale: 1.0, hullColor: 0xf2e2cc, banner: T.bannerKris, seed: 2 });
  const s2 = makeShip({ T }, { x: 14, z: 3.0, yaw: -1.4, scale: 0.94, hullColor: 0xe9cbb0, banner: T.bannerWave, seed: 5 });
  g.add(s1, s2);

  // panji di dermaga
  for (const x of [-6.5, 6.5]) {
    const pole = cyl(0.09, 0.12, 7, toon(0x5a3a24), 6);
    pole.position.set(x, 1 + 3.5, -3.5);
    ink(pole, 1.04);
    g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.15), new THREE.MeshBasicMaterial({ map: T.bannerSun, side: THREE.DoubleSide, transparent: true }));
    flag.position.set(x + 1.0, 1 + 6.5, -3.5);
    g.add(flag);
  }

  cardRow(g, [
    { kind: "sailor", expr: "stern", pose: "point", x: -3.2, z: -2.0, h: 3.3, seed: 4 },
    { kind: "merchant", expr: "neutral", pose: "hold", x: 2.6, z: -3.4, h: 3.3, seed: 9 },
  ]);

  g.userData = { kind: "dock" };
  return g;
}

// ---------------------------------------------------------------- market
export function buildMarketStage() {
  const g = new THREE.Group();

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), toon(0xffffff, T.earth));
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);

  const stall = (cx, sign) => {
    for (const [dx, dz, hh] of [[-2.8, -1.6, 3.4], [2.8, -1.6, 3.4], [-2.8, 1.6, 3.0], [2.8, 1.6, 3.0]]) {
      const p = cyl(0.09, 0.11, hh, toon(0x6b4a2e), 6);
      p.position.set(cx + dx, hh / 2, dz - 2);
      ink(p, 1.04);
      g.add(p);
    }
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.2), toon(0xffffff, T.awning, { side: THREE.DoubleSide }));
    roof.rotation.x = -Math.PI / 2 + 0.16;
    roof.position.set(cx, 3.5, -2);
    g.add(roof);
    const counter = box(5.8, 0.9, 1.9, toon(0xc09060, T.wood));
    counter.position.set(cx, 0.45, -2);
    ink(counter, 1.02);
    g.add(counter);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshBasicMaterial({ map: sign }));
    board.position.set(cx, 4.0, -2.2);
    g.add(board);
  };
  stall(-6.5, T.tulipSign);
  stall(6.5, T.cheeseSign);

  // tulip: pot, batang, kelopak
  const tulip = (x, z, col) => {
    const pot = cyl(0.26, 0.2, 0.42, toon(0xb4462f), 8);
    pot.position.set(x, 0.95, z);
    g.add(pot);
    const st = cyl(0.03, 0.03, 0.62, toon(0x3f7a4a), 4);
    st.position.set(x, 1.45, z);
    g.add(st);
    const bl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), toon(col));
    bl.scale.y = 1.35;
    bl.position.set(x, 1.82, z);
    g.add(bl);
  };
  const cols = [0xd94f3a, 0xf0c14a, 0xd94f3a, 0xe88ab0, 0xf0c14a];
  for (let i = 0; i < 10; i++) {
    tulip(-3.4 + (i % 5) * 0.62, -2.9 + Math.floor(i / 5) * 0.7, cols[i % cols.length]);
    tulip(3.4 + (i % 5) * 0.62, -2.9 + Math.floor(i / 5) * 0.7, cols[(i + 2) % cols.length]);
  }

  // keju: roda besar
  for (let i = 0; i < 5; i++) {
    const ch = cyl(0.42, 0.42, 0.26, toon(0xf0c14a), 14);
    ch.rotation.x = Math.PI / 2;
    ch.position.set(4.0 + (i % 3) * 1.05, 1.05 + Math.floor(i / 3) * 0.5, -2.4);
    ink(ch, 1.02);
    g.add(ch);
    const rind = cyl(0.38, 0.38, 0.28, toon(0xd9a441), 14);
    rind.rotation.x = Math.PI / 2;
    rind.position.copy(ch.position);
    g.add(rind);
  }

  // keranjang rempah
  for (let i = 0; i < 6; i++) {
    const x = -9 + i * 1.5;
    const bask = cyl(0.5, 0.36, 0.5, toon(0xb98a5a, T.wood), 10);
    bask.position.set(x, 0.95, 1.5);
    ink(bask, 1.02);
    g.add(bask);
    const mound = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 7), toon(i % 2 ? 0x8e3f2a : 0x6b4a2e));
    mound.scale.y = 0.45;
    mound.position.set(x, 1.18, 1.5);
    g.add(mound);
  }

  // pohon dan rumah latar
  for (const [x, z, s] of [[-15, -12, 1.25], [-12, -17, 1.0], [14, -13, 1.15], [17, -18, 0.95]]) {
    const trunk = cyl(0.11 * s, 0.17 * s, 3.2 * s, toon(0x7b5a3a), 6);
    trunk.position.set(x, 1.6 * s, z);
    g.add(trunk);
    for (let i = 0; i < 7; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.3 * s, 8, 6), toon(0x3f7a4a));
      leaf.scale.set(1, 0.14, 0.32);
      leaf.position.set(x + Math.cos((i / 7) * 6.28) * 1.1 * s, 3.3 * s, z + Math.sin((i / 7) * 6.28) * 1.1 * s);
      g.add(leaf);
    }
  }
  for (let i = 0; i < 5; i++) {
    const b = box(3.4, 2.6 + (i % 2), 3, toon(0xf2e6cc));
    b.position.set(-20 + i * 9, 1.6, -22 - (i % 3) * 3);
    g.add(b);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.2, 4), toon(0xffffff, T.roof));
    rf.rotation.y = Math.PI / 4;
    rf.position.set(-20 + i * 9, 3.6, -22 - (i % 3) * 3);
    g.add(rf);
  }

  cardRow(g, [
    { kind: "merchant", expr: "grin", pose: "hold", x: 0, z: -1.2, h: 3.3, seed: 11 },
    { kind: "dutchwoman", expr: "grin", pose: "point", x: -2.0, z: 2.4, h: 3.2, seed: 13 },
    { kind: "sailor", expr: "neutral", pose: "stand", x: 2.4, z: 3.0, h: 3.2, seed: 15 },
  ]);

  g.userData = { kind: "market" };
  return g;
}

// ---------------------------------------------------------------- palace
export function buildPalaceStage() {
  const g = new THREE.Group();

  const floor = box(34, 0.3, 30, toon(0xffffff, T.stone));
  floor.position.y = -0.15;
  g.add(floor);

  const back = box(34, 11, 0.4, toon(0xe8d8b8, T.plaster));
  back.position.set(0, 5.5, -14);
  g.add(back);

  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(7.4, 4.2),
    new THREE.MeshBasicMaterial({ map: T.bannerKris })
  );
  banner.position.set(0, 7.2, -13.7);
  g.add(banner);
  const rod = cyl(0.09, 0.09, 7.8, toon(0x5a3a24), 6);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, 9.35, -13.7);
  g.add(rod);

  for (let i = 0; i < 4; i++) {
    const win = box(2.2, 5.4, 0.14, toon(0xffe9bd, null, { emissive: 0xa87838 }));
    win.position.set(-12 + i * 8, 5.6, -13.6);
    if (i === 1 || i === 2) win.position.x += 1.2;
    if (Math.abs(win.position.x) < 4.4) continue;
    g.add(win);
  }

  for (const x of [-13, -7.5, 7.5, 13]) {
    const col = cyl(0.52, 0.6, 9.6, toon(0xf4ead2), 12);
    col.position.set(x, 4.8, -7.5);
    ink(col, 1.015);
    g.add(col);
    const cap = box(1.5, 0.3, 1.5, toon(0xe0cfa8));
    cap.position.set(x, 9.7, -7.5);
    g.add(cap);
    const baseC = box(1.5, 0.35, 1.5, toon(0xe0cfa8));
    baseC.position.set(x, 0.18, -7.5);
    g.add(baseC);
  }

  const cloth = box(11.1, 1.72, 0.14, toon(0x8e2f3a, null, { side: THREE.DoubleSide }));
  cloth.position.set(0, 0.86, -1.32);
  g.add(cloth);
  const cloth2 = box(11.1, 1.72, 0.14, toon(0x8e2f3a));
  cloth2.position.set(0, 0.86, -4.68);
  g.add(cloth2);

  const table = box(11, 0.32, 3.4, toon(0x6b4a2e, T.wood));
  table.position.set(0, 1.7, -3);
  ink(table, 1.015);
  g.add(table);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.3, 1.7, 0.3, toon(0x5a3a24));
    leg.position.set(sx * 4.9, 0.85, -3 + sz * 1.3);
    g.add(leg);
  }

  const map = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.2), toon(0xe6d3a4));
  map.rotation.x = -Math.PI / 2;
  map.position.set(-0.4, 1.88, -3);
  g.add(map);

  for (const [x, z] of [[-3.6, -2.2], [-1.2, -2.4], [1.4, -2.2], [3.8, -2.4]]) {
    const candle = cyl(0.06, 0.07, 0.55, toon(0xf4ead2), 6);
    candle.position.set(x, 2.15, z);
    g.add(candle);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
    flame.scale.y = 1.6;
    flame.position.set(x, 2.5, z);
    g.add(flame);
  }

  const chand = cyl(0.12, 0.12, 2.2, toon(0x3a3430), 6);
  chand.position.set(0, 8.9, -2);
  g.add(chand);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.09, 6, 18), toon(0x8a6a3a));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 7.8, -2);
  g.add(ring);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
    fl.scale.y = 1.5;
    fl.position.set(Math.cos(a) * 1.5, 7.95, -2 + Math.sin(a) * 1.5);
    g.add(fl);
  }

  cardRow(g, [
    { kind: "laksamana", expr: "stern", pose: "hold", x: -4.2, z: -5.4, h: 4.2, seed: 21 },
    { kind: "official", expr: "neutral", pose: "point", x: -1.2, z: -5.6, h: 4.1, seed: 22 },
    { kind: "dutchman", expr: "shock", pose: "stand", x: 2.2, z: -5.4, h: 4.15, seed: 23 },
    { kind: "merchant", expr: "grin", pose: "hold", x: 5.2, z: -5.2, h: 4.05, seed: 24 },
  ]);

  g.userData = { kind: "palace" };
  return g;
}
