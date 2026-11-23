// Aset KHUSUS cerita "Belanda jadi jajahan Indonesia".
//
// Aturan yang dipegang berkas ini:
//  - TIDAK memakai bendera negara asli. Semua bendera/panji di sini adalah banner rekaan
//    (warna + lambang karangan) supaya tidak menyerang identitas negara nyata.
//  - TIDAK memakai sisa aset cerita lain (kota pastel, kaktus, gunung berapi, papan "PASTELES").
//  - Tekstur digambar sendiri; bentuk dari primitif; garis tinta lewat `addM`.
import * as THREE from "three";
import { cvTex, mkMat, addM, T } from "./world.js";

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
const R = (s) => { let x = s * 7919 + 104729; return () => ((x = (x * 7919 + 104729) % 233280) / 233280); };

// ---------------------------------------------------------------- BANNER REKAAN
/** Panji rekaan: bidang indigo, jalur krem, bintang emas delapan. Tidak meniru bendera negara mana pun. */
export const bannerRekaan = (tipe = "armada") =>
  cvTex("banner" + tipe, 256, 160, (g, w, h) => {
    const dasar = tipe === "armada" ? "#2a3f7a" : "#7a2f36";
    g.fillStyle = dasar; g.fillRect(0, 0, w, h);
    g.fillStyle = "#efe3c2"; g.fillRect(0, h * 0.42, w, h * 0.16);
    g.fillStyle = "#e8c45a";
    const cx = w / 2, cy = h / 2, r1 = h * 0.3, r2 = h * 0.12;
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r2 : r1;
      i ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
    g.strokeStyle = "#1d2a52"; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  });

const bannerMat = (tipe) => new THREE.MeshBasicMaterial({ map: bannerRekaan(tipe), side: THREE.DoubleSide });

// ---------------------------------------------------------------- TEKSTUR
/** Rumah kanal: bata, jendela berderet, pintu tinggi — gaya kota kanal, bukan pastel. */
const kanalTex = (bata, jendela = "#2f3a52") =>
  cvTex("kanal" + bata + jendela, 256, 256, (g, w, h) => {
    g.fillStyle = bata; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,0,0,.16)"; g.lineWidth = 2;
    for (let y = 0; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let y = 0; y < h; y += 12) for (let x = (y / 12) % 2 ? 0 : 12; x < w; x += 24) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 12); g.stroke(); }
    g.fillStyle = jendela;
    for (const yy of [h * 0.16, h * 0.46]) for (const xx of [w * 0.2, w * 0.62]) { g.fillRect(xx, yy, w * 0.18, h * 0.2); g.strokeStyle = "#f2e6c8"; g.lineWidth = 4; g.strokeRect(xx, yy, w * 0.18, h * 0.2); }
    g.fillStyle = "#5a3b28"; g.fillRect(w * 0.4, h * 0.72, w * 0.2, h * 0.24);
  });

const airTex = cvTex("airKanal", 128, 128, (g, w, h) => {
  g.fillStyle = "#2f6f8a"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(220,240,250,.35)"; g.lineWidth = 3;
  for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(0, 8 + i * 14); g.bezierCurveTo(w * 0.3, 4 + i * 14, w * 0.7, 14 + i * 14, w, 8 + i * 14); g.stroke(); }
});

// ---------------------------------------------------------------- KOTA KANAL (Amsterdam)
export const buildKotaKanal = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(97), o = { banner: [] };
  // jalan bata
  addM(g, box(64, 0.2, 46), mkMat(T("plain", "#7d6a58", null, 12, 9)), [0, -0.1, -6], { ink: 0.02 });
  // kanal + tepi batu
  addM(g, new THREE.PlaneGeometry(9, 44), mkMat(airTex), [0, 0.06, -6], { rot: [-Math.PI / 2, 0, 0], ink: false });
  for (const sx of [-1, 1]) addM(g, box(1.1, 0.6, 44), mkMat(T("stone", "#8a8172", null, 1, 10)), [sx * 5.1, 0.25, -6], { ink: 0.03 });
  // rumah kanal dua baris, atap pelana
  const bata = ["#a5493a", "#8d5a45", "#96604a", "#7d4a3c"];
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) {
    const x = sx * (7.2 + r() * 0.5), z = -24 + i * 6.4, w = 4.2, hh = 6.2 + r() * 1.8, d = 5.0;
    const col = bata[(i + (sx > 0 ? 2 : 0)) % 4];
    const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(gr);
    addM(gr, box(d, hh, w), mkMat(kanalTex(col)), [0, hh / 2, 0]);
    // atap pelana (prisma dari balok diputar) + hiasan puncak
    addM(gr, box(d + 0.5, 0.35, w + 0.5), mkMat(0x4a3a30), [0, hh + 0.18, 0], { ink: 0.03 });
    const prisma = new THREE.CylinderGeometry(w * 0.72, w * 0.72, d + 0.4, 3);
    const atap = addM(gr, prisma, mkMat(col === "#a5493a" ? 0x6b4a3a : 0x5a3f33), [0, hh + 1.0, 0], { ink: 0.035 });
    atap.rotation.set(0, Math.PI / 2, Math.PI / 2);
    addM(gr, box(0.14, 0.9, 0.14), mkMat(0xf2e6c8), [0, hh + 1.5, 0], { ink: 0.02 });
  }
  // jembatan kanal
  for (const z of [-16, 2]) {
    // dek jembatan + pagar supaya tidak terbaca sebagai papan nyangkut
    addM(g, box(13, 0.35, 3.6), mkMat(T("plain", "#8a6a4a", null, 3, 2)), [0, 1.5, z], { ink: 0.03 });
    for (const sx of [-1, 1]) addM(g, box(0.3, 1.5, 3.6), mkMat(T("stone", "#8a8172", null, 1, 2)), [sx * 6.2, 0.75, z], { ink: 0.03 });
    // pagar hanya di sisi jauh: pagar sisi dekat berada di depan karakter dan mengiris badannya
    for (let i = -3; i <= 3; i++) addM(g, box(0.14, 0.9, 0.14), mkMat(0x6e4a30), [i * 1.9, 2.15, z - 1.7], { ink: 0.02 });
    addM(g, box(12.6, 0.12, 0.12), mkMat(0x6e4a30), [0, 2.55, z - 1.7], { ink: 0.02 });
  }
  // tiang panji rekaan + perahu kanal
  o.banner = [];
  for (const [x, z, tipe] of [[-1.25, 4.6, "kota"], [1.5, -13.5, "armada"]]) {
    addM(g, cyl(0.09, 0.11, 6.2, 8), mkMat(0x5a3b28), [x, 3.1, z], { ink: 0.02 });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), bannerMat(tipe));
    b.position.set(x, 5.05, z); b.rotation.y = Math.PI; g.add(b); o.banner.push(b);
  }
  const kapalKanal = (x, z) => { addM(g, box(4.6, 0.7, 1.7), mkMat(T("plain", "#7a5133", null, 2, 1)), [x, 0.35, z], { ink: 0.03 }); addM(g, box(0.1, 2.6, 0.1), mkMat(0x5a3b26), [x - 1.4, 2.0, z], { ink: 0.02 }); };
  kapalKanal(-2.0, -12); kapalKanal(2.4, 4);
  o.g = g; return o;
};

// ---------------------------------------------------------------- PELABUHAN NUSANTARA
/** Pelabuhan tropis: dermaga kayu, pohon kelapa, bukit hijau, kapal layar lateen + banner rekaan. */
export const buildPelabuhanNusantara = (par) => {
  const g = new THREE.Group(); par.add(g); const r = R(53), o = { banner: [] };
  addM(g, new THREE.PlaneGeometry(420, 300), mkMat(T("plain", "#2f8fb8", null, 50, 36)), [0, -0.14, -120], { rot: [-Math.PI / 2, 0, 0], ink: false });
  addM(g, new THREE.PlaneGeometry(420, 90), mkMat(T("plain", "#d8c08a", null, 50, 11)), [0, 0, 26], { rot: [-Math.PI / 2, 0, 0], ink: false });
  // bukit tropis berlapis
  for (let i = 0; i < 5; i++) addM(g, new THREE.SphereGeometry(26 + r() * 12, 14, 9, 0, Math.PI * 2, 0, Math.PI / 2), mkMat(0x4f8b52), [-70 + i * 36, -1, -150 - r() * 20], { ink: 0.1 });
  // kelapa
  const kelapa = (x, z, s = 1) => { addM(g, cyl(0.14 * s, 0.2 * s, 4.2 * s, 7), mkMat(0x8a6240), [x, 2.1 * s, z], { ink: 0.02, rot: [0, 0, 0.1] });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; addM(g, new THREE.ConeGeometry(0.3 * s, 2.4 * s, 4), mkMat(0x3f9a4a), [x + Math.cos(a) * 1.0 * s, 4.1 * s, z + Math.sin(a) * 1.0 * s], { rot: [Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2], ink: 0.02 }); } };
  for (let i = 0; i < 9; i++) kelapa((r() > 0.5 ? 1 : -1) * (10 + r() * 26), 8 + r() * 22, 0.9 + r() * 0.5);
  // dermaga kayu menjorok ke air
  for (const jx of [-14, 18]) {
    addM(g, box(4.2, 0.3, 22), mkMat(T("plain", "#8a6a44", null, 2, 8)), [jx, 0.9, -2], { ink: 0.03 });
    for (const zz of [-12, -4, 4, 10]) for (const sx of [-1, 1]) addM(g, cyl(0.22, 0.24, 1.6, 8), mkMat(0x6e4a30), [jx + sx * 1.7, 0.1, zz], { ink: 0.03 });
  }
  // kapal layar lateen + banner rekaan
  o.kapal = [];
  const kapalLateen = (x, z, s, ry) => {
    const sg = new THREE.Group(); sg.position.set(x, 0, z); sg.rotation.y = ry; sg.scale.setScalar(s); g.add(sg);
    addM(sg, box(10, 1.1, 3.0), mkMat(T("plain", "#8a5f39", null, 6, 2)), [0, 0.9, 0], { ink: 0.04 });
    addM(sg, box(7.2, 0.25, 2.4), mkMat(0x6e4a30), [0, 1.55, 0], { ink: 0.02 });
    addM(sg, cyl(0.16, 0.2, 11, 8), mkMat(0x6e4a30), [0.6, 6.4, 0], { ink: 0.02 });
    for (const [mx, my, rot] of [[-2.6, 4.6, 0.5], [3.4, 5.0, -0.5]]) addM(sg, box(0.12, 0.12, 6.4), mkMat(0x6e4a30), [mx, my, 0], { rot: [0, 0, rot], ink: 0.02 });
    const layar = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4.2), new THREE.MeshBasicMaterial({ map: cvTex("lateen", 128, 128, (c, w, h) => { c.fillStyle = "#f4ecd4"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(190,175,140,.7)"; c.lineWidth = 6; for (let i = 1; i < 5; i++) c.fillRect(0, (i * h) / 5 - 3, w, 6); }), side: THREE.DoubleSide }));
    layar.position.set(1.4, 5.6, 0); layar.rotation.set(0, Math.PI / 2, -0.28); sg.add(layar);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.2), bannerMat("armada"));
    b.position.set(0.6, 11.4, 0); b.rotation.y = Math.PI / 2; sg.add(b); o.banner.push(b);
  };
  for (const [x, z, s, ry] of [[-18, -24, 1.25, -0.5], [-4, -34, 1.4, -0.3], [12, -26, 1.25, 0.45], [26, -40, 1.2, 0.6], [-30, -42, 1.2, -0.65], [4, -50, 1.3, -0.15]]) kapalLateen(x, z, s, ry);
  o.g = g; return o;
};