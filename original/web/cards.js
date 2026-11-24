// Kartu karakter: canvas 2D digambar sendiri, ditempel sebagai plane di scene.
import * as THREE from "three";
import { drawPerson } from "./cast.js";

const cache = new Map();

function texFor(kind, expr, pose, seed, back) {
  const key = `${kind}|${expr}|${pose}|${seed}|${back ? 1 : 0}`;
  if (cache.has(key)) return cache.get(key);
  const cv = document.createElement("canvas");
  cv.width = 450;
  cv.height = 750;
  drawPerson(cv, { kind, expr, pose, seed, back });
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  cache.set(key, t);
  return t;
}

export function makeCard(o = {}) {
  const h = o.h || 3.3;
  const w = (h * 450) / 750;
  const t = texFor(o.kind || "sailor", o.expr || "neutral", o.pose || "stand", o.seed || 1, o.back);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide })
  );
  const s = o.flip ? -1 : 1;
  m.scale.x = s;
  m.position.set(o.x || 0, (o.y || 0) + h / 2, o.z || 0);
  m.userData.isCard = true;
  return m;
}

export function cardRow(stage, list) {
  const cards = [];
  for (const o of list) {
    const c = makeCard(o);
    stage.add(c);
    cards.push(c);
  }
  stage.userData.cards = (stage.userData.cards || []).concat(cards);
  return cards;
}

// teks diegetik: papan tulis, plang, spanduk
export function textTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
