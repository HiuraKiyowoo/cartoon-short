// Kapal galleon asli. Semua geometri, layar, dan panji dibentuk di sini.
// Dibuat sebagai modul mandiri: tidak mengambil model kapal pihak lain.
import * as THREE from "three";

const INK = 0x241a24;

const GRAD = (() => {
  const t = new THREE.DataTexture(new Uint8Array([96, 170, 246]), 3, 1, THREE.RedFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const toon = (color, map = null, extra = {}) =>
  new THREE.MeshToonMaterial({ color, map, gradientMap: GRAD, ...extra });

const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const cyl = (r1, r2, h, mat, seg = 8) =>
  new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat);

function ink(mesh, k = 1.03) {
  const o = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }));
  o.scale.setScalar(k);
  mesh.add(o);
  return mesh;
}

// layar persegi: lebar mengecil ke bawah, permukaan menggembung
function sailGeometry(w, h, bulge) {
  const geo = new THREE.PlaneGeometry(w, h, 12, 8);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const u = x / w + 0.5;
    const v = y / h + 0.5;
    p.setX(i, x * (0.84 + 0.16 * v));
    p.setZ(i, Math.sin(u * Math.PI) * bulge * (0.55 + 0.45 * v));
  }
  geo.computeVertexNormals();
  return geo;
}

export function makeShip(ctx, o = {}) {
  const { T } = ctx;
  const g = new THREE.Group();

  // --- lambung: profil samping diekstrusi, haluan naik
  const s = new THREE.Shape();
  s.moveTo(-3.55, 1.02);
  s.lineTo(2.85, 1.02);
  s.quadraticCurveTo(3.85, 1.08, 3.7, 1.52);
  s.quadraticCurveTo(3.62, 0.62, 2.85, 0.3);
  s.quadraticCurveTo(0.2, -0.12, -2.65, 0.12);
  s.quadraticCurveTo(-3.7, 0.28, -3.92, 0.86);
  s.lineTo(-3.55, 1.02);
  const hullGeo = new THREE.ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: false, curveSegments: 10 });
  hullGeo.translate(0, 0, -0.85);
  const hull = new THREE.Mesh(hullGeo, toon(o.hullColor || 0xffffff, T.wood));
  hull.position.y = 0.06;
  ink(hull, 1.018);
  g.add(hull);

  // --- geladak
  const deck = box(5.9, 0.16, 1.62, toon(0xcaa26c, T.wood));
  deck.position.set(-0.25, 1.06, 0);
  ink(deck, 1.015);
  g.add(deck);

  // --- garis tepi + meriam
  for (const sz of [-0.87, 0.87]) {
    const stripe = box(6.2, 0.1, 0.06, toon(0xd8c08a));
    stripe.position.set(-0.2, 0.5, sz);
    g.add(stripe);
    for (let i = -2; i <= 2; i++) {
      const port = box(0.26, 0.22, 0.07, toon(0x1c1318));
      port.position.set(i * 1.08, 0.74, sz);
      g.add(port);
    }
  }

  // --- bangunan buritan
  const castle = box(1.7, 0.95, 1.46, toon(o.hullColor || 0xffffff, T.wood));
  castle.position.set(-2.75, 1.55, 0);
  ink(castle, 1.025);
  g.add(castle);
  const cRoof = box(1.9, 0.12, 1.58, toon(0x7a4a30));
  cRoof.position.set(-2.75, 2.06, 0);
  g.add(cRoof);
  for (const sz of [-0.74, 0.74]) {
    for (let i = 0; i < 3; i++) {
      const win = box(0.24, 0.3, 0.04, toon(0xf0d79a, null, { emissive: 0x6b4a1a }));
      win.position.set(-3.3 + i * 0.55, 1.62, sz);
      g.add(win);
    }
  }

  // --- bangunan haluan
  const fore = box(1.1, 0.5, 1.42, toon(o.hullColor || 0xffffff, T.wood));
  fore.position.set(2.3, 1.35, 0);
  ink(fore, 1.03);
  g.add(fore);

  // --- tiang haluan (bowsprit)
  const bow = cyl(0.05, 0.1, 2.6, toon(0x6b4226), 6);
  bow.rotation.z = -1.16;
  bow.position.set(4.35, 1.95, 0);
  ink(bow, 1.05);
  g.add(bow);
  const jib = new THREE.Mesh(sailGeometry(2.0, 1.6, 0.22), toon(0xfff4dc, T.sail, { side: THREE.DoubleSide }));
  jib.rotation.y = Math.PI / 2;
  jib.position.set(4.28, 2.2, 0);
  jib.rotation.z = 0.6;
  g.add(jib);

  // --- tiang utama + layar
  const mastMat = toon(0x6b4226);
  const masts = [[-1.85, 4.2], [0.25, 5.5], [2.15, 3.4]];
  const addSail = (x, y, w, h, bulge) => {
    const m = new THREE.Mesh(sailGeometry(w, h, bulge), toon(0xfff4dc, T.sail, { side: THREE.DoubleSide }));
    m.position.set(x, y, 0);
    g.add(m);
    const yard = cyl(0.045, 0.045, w * 1.04, mastMat, 5);
    yard.rotation.z = Math.PI / 2;
    yard.position.set(x, y + h * 0.5, 0);
    g.add(yard);
  };
  for (const [x, h] of masts) {
    const m = cyl(0.075, 0.12, h, mastMat, 6);
    m.position.set(x, 1.05 + h / 2, 0);
    ink(m, 1.05);
    g.add(m);

    addSail(x, 1.05 + h * 0.42, 3.1, h * 0.34, 0.3);
    addSail(x, 1.05 + h * 0.74, 2.25, h * 0.24, 0.24);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), toon(0xd9b45a));
    ball.position.set(x, 1.05 + h + 0.06, 0);
    g.add(ball);
  }

  // --- panji di tiang agung
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.62),
    flagMaterial(o.banner || T.bannerWave)
  );
  flag.position.set(0.25 + 0.56, 1.05 + 5.5 - 0.1, 0.02);
  g.add(flag);

  const pennant = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.22),
    flagMaterial(T.bannerSun)
  );
  pennant.position.set(2.15 + 0.42, 1.05 + 3.4 - 0.05, 0.02);
  g.add(pennant);

  // --- busa di garis air
  const f = new THREE.Mesh(
    new THREE.PlaneGeometry(7.6, 2.4),
    new THREE.MeshBasicMaterial({ map: T.foam, transparent: true, depthWrite: false, opacity: 0.75 })
  );
  f.rotation.x = -Math.PI / 2;
  f.position.set(0.1, 0.04, 0);
  g.add(f);

  g.scale.setScalar(o.scale || 1);
  g.rotation.y = o.yaw || 0;
  g.position.set(o.x || 0, 0, o.z || 0);
  g.userData.bob = o.bob || { amp: 0.035, spd: 26, ph: (o.x || 0) * 0.7 };
  return g;
}

export function makeFleet(ctx) {
  const g = new THREE.Group();
  const ships = [];

  // baris belakang → depan, haluan menghadap kamera sedikit menyudut
  const layout = [
    [-16.5, -30, 0.72, 0.82], [-8.5, -29, 0.8, 0.86], [-0.5, -28.5, 0.75, 0.84], [7.5, -29, 0.82, 0.86], [15.5, -30, 0.74, 0.82],
    [-11.5, -20, 0.86, 0.92], [-4.0, -19, 0.9, 0.96], [3.5, -19, 0.88, 0.94], [11.0, -20, 0.84, 0.92],
    [-7.5, -10.5, 0.92, 1.02], [1.5, -10, 0.96, 1.06], [10.0, -11, 0.9, 1.0],
    [-8.0, 2.0, 0.66, 1.72],
  ];
  const tints = [0xffffff, 0xe9cbb0, 0xcdd8ce, 0xdcb4aa, 0xf0e0c4];
  layout.forEach(([x, z, yaw, s], i) => {
    const hero = i === layout.length - 1;
    const ship = makeShip(ctx, {
      x, z, scale: s, yaw,
      hullColor: hero ? 0xb08a7c : tints[i % tints.length],
      banner: i % 3 === 0 ? T_of(ctx).bannerKris : i % 2 ? T_of(ctx).bannerWave : T_of(ctx).bannerSun,
      bob: { amp: 0.05 / s, spd: 30 + (i % 5) * 4, ph: i * 1.7 },
    });
    ships.push(ship);
    g.add(ship);
  });

  g.userData.ships = ships;
  return g;
}

const flagMaterial = (map) =>
  new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide, transparent: true, alphaTest: 0.02 });

const T_of = (ctx) => ctx.T;
