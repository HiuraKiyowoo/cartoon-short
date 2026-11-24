// Karakter kartun asli: digambar langsung di canvas, tanpa mengambil cast pihak lain.
export const CW = 450, CH = 750, K = 0.75;

const P = {
  laksamana: { skin: "#d9a878", coat: "#1f4f52", coat2: "#173c3e", trim: "#e2b85a", shirt: "#f2e6cc", pants: "#2a3540", boots: "#241a20", sash: "#c9553f", hat: "wrap", hair: "#241a20" },
  admiral: { skin: "#e6c09a", coat: "#26344f", coat2: "#1c273c", trim: "#d9b45a", shirt: "#f4ead2", pants: "#d8c9a8", boots: "#1e1820", sash: "#8f2f3a", hat: "tricorn", hair: "#d8d0c0" },
  sailor: { skin: "#d8a678", coat: "#3f7f86", coat2: "#2f6268", trim: "#efe2c4", shirt: "#efe2c4", pants: "#5a4636", boots: "#2a2020", sash: "#b8453c", hat: "bandana", hair: "#2a1e1a" },
  merchant: { skin: "#c98f62", coat: "#7a3b2e", coat2: "#5f2c22", trim: "#d9b45a", shirt: "#efe0c0", pants: "#4a3a2a", boots: "#2a2020", sash: "#2f6b5f", hat: "cap", hair: "#241a20" },
  teacher: { skin: "#e0b48c", coat: "#6b4a2e", coat2: "#543820", trim: "#c9a05a", shirt: "#f4ead2", pants: "#3a3038", boots: "#241a20", sash: null, hat: null, hair: "#3a2a20" },
  student: { skin: "#d9a878", coat: "#e8dcc0", coat2: "#d9c9a8", trim: "#2f6b66", shirt: "#f6efdc", pants: "#2f4a5a", boots: "#2a2020", sash: null, hat: null, hair: "#241a20" },
  official: { skin: "#e6c09a", coat: "#2a2230", coat2: "#1e1824", trim: "#c9a05a", shirt: "#f4ead2", pants: "#2a2230", boots: "#1e1820", sash: "#6b2f3a", hat: null, hair: "#d8d0c0" },
};

const rad = (d) => (d * Math.PI) / 180;

const line = (g, x1, y1, x2, y2, w, col) => {
  g.strokeStyle = col;
  g.lineWidth = w;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
};

const blob = (g, x, y, rx, ry, col, rot = 0) => {
  g.fillStyle = col;
  g.beginPath();
  g.ellipse(x, y, rx, ry, rot, 0, 7);
  g.fill();
};

const rr = (g, x, y, w, h, r, col) => {
  g.fillStyle = col;
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
};

function arm(g, sx, sy, ex, ey, w, col, hand) {
  line(g, sx, sy, ex, ey, w, col);
  blob(g, ex, ey, w * 0.52, w * 0.52, hand || col);
}

function leg(g, x, hip, knee, foot, w, pants, boots) {
  line(g, x, hip, x + (x < 300 ? -6 : 6), knee, w, pants);
  line(g, x + (x < 300 ? -6 : 6), knee, x + (x < 300 ? -10 : 10), foot, w * 0.88, boots);
  blob(g, x + (x < 300 ? -16 : 16), foot + 6, w * 0.62, w * 0.34, boots);
}

export function drawPerson(cv, o = {}) {
  const g = cv.getContext("2d");
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, cv.width, cv.height);
  g.setTransform(K, 0, 0, K, 0, 0);

  const kind = o.kind || "sailor";
  const c = P[kind] || P.sailor;
  const expr = o.expr || "neutral";
  const pose = o.pose || "stand";
  const seed = o.seed || 1;
  const tilt = o.tilt || 0;
  const bob = o.bob || 0;
  const look = o.look || 0;

  const cx = 300;
  const headY = 292 + bob;
  const headRX = 92, headRY = 108;
  const chin = headY + headRY * 0.92;
  const shoulder = chin + 42;
  const hip = 716 + bob * 0.4;
  const foot = 962;

  // shadow / contact
  g.fillStyle = "rgba(30,18,28,.18)";
  g.beginPath();
  g.ellipse(cx, foot + 14, 112, 22, 0, 0, 7);
  g.fill();

  // legs
  leg(g, cx - 46, hip, 824, foot, 62, c.pants, c.boots);
  leg(g, cx + 46, hip, 824, foot, 62, c.pants, c.boots);

  // torso
  const tw = kind === "student" ? 108 : 118;
  g.fillStyle = c.coat;
  g.beginPath();
  g.moveTo(cx - tw, shoulder);
  g.quadraticCurveTo(cx - tw - 10, shoulder + 150, cx - tw + 8, hip);
  g.lineTo(cx + tw - 8, hip);
  g.quadraticCurveTo(cx + tw + 10, shoulder + 150, cx + tw, shoulder);
  g.quadraticCurveTo(cx, shoulder - 26, cx - tw, shoulder);
  g.closePath();
  g.fill();

  // coat opening + shirt
  if (kind !== "student") {
    g.fillStyle = c.shirt;
    g.beginPath();
    g.moveTo(cx - 26, shoulder + 6);
    g.lineTo(cx + 26, shoulder + 6);
    g.lineTo(cx + 16, hip - 10);
    g.lineTo(cx - 16, hip - 10);
    g.closePath();
    g.fill();
  }

  // coat lapels
  g.fillStyle = c.coat2;
  g.beginPath();
  g.moveTo(cx - tw + 6, shoulder + 6);
  g.lineTo(cx - 30, shoulder + 40);
  g.lineTo(cx - 58, hip - 20);
  g.lineTo(cx - tw + 14, hip - 8);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(cx + tw - 6, shoulder + 6);
  g.lineTo(cx + 30, shoulder + 40);
  g.lineTo(cx + 58, hip - 20);
  g.lineTo(cx + tw - 14, hip - 8);
  g.closePath();
  g.fill();

  // sash
  if (c.sash) {
    g.fillStyle = c.sash;
    g.beginPath();
    g.moveTo(cx - tw + 16, shoulder + 44);
    g.lineTo(cx + tw - 18, shoulder + 86);
    g.lineTo(cx + tw - 26, shoulder + 122);
    g.lineTo(cx - tw + 8, shoulder + 80);
    g.closePath();
    g.fill();
    blob(g, cx - tw + 8, shoulder + 92, 20, 14, c.sash, 0.3);
  }

  // buttons / trim
  if (kind === "admiral" || kind === "official" || kind === "laksamana") {
    g.fillStyle = c.trim;
    for (let i = 0; i < 5; i++) blob(g, cx - 34 + (i % 2) * 8, shoulder + 84 + i * 42, 6, 6, c.trim);
    line(g, cx - tw + 12, shoulder + 10, cx - tw + 12, hip - 14, 6, c.trim);
    line(g, cx + tw - 12, shoulder + 10, cx + tw - 12, hip - 14, 6, c.trim);
  }
  if (kind === "student") {
    g.fillStyle = c.trim;
    g.beginPath();
    g.moveTo(cx - 34, shoulder - 2);
    g.lineTo(cx, shoulder + 42);
    g.lineTo(cx + 34, shoulder - 2);
    g.lineTo(cx + 20, shoulder - 10);
    g.lineTo(cx, shoulder + 20);
    g.lineTo(cx - 20, shoulder - 10);
    g.closePath();
    g.fill();
  }
  if (kind === "sailor") {
    g.fillStyle = "#efe2c4";
    for (let i = 0; i < 4; i++) g.fillRect(cx - tw + 6, shoulder + 40 + i * 46, tw * 2 - 12, 10);
  }

  // arms
  const shL = [cx - tw + 8, shoulder + 18];
  const shR = [cx + tw - 8, shoulder + 18];
  if (pose === "point") {
    arm(g, shL[0], shL[1], cx - 150, shoulder + 150, 40, c.coat, c.skin);
    arm(g, shR[0], shR[1], cx + 156, shoulder + 34, 40, c.coat, c.skin);
  } else if (pose === "wave") {
    arm(g, shL[0], shL[1], cx - 140, hip - 30, 40, c.coat, c.skin);
    arm(g, shR[0], shR[1], cx + 150, shoulder - 70, 40, c.coat, c.skin);
  } else if (pose === "hold") {
    arm(g, shL[0], shL[1], cx - 110, shoulder + 150, 40, c.coat, c.skin);
    arm(g, shR[0], shR[1], cx + 20, shoulder + 150, 40, c.coat, c.skin);
  } else {
    arm(g, shL[0], shL[1], cx - 138, hip - 34, 40, c.coat, c.skin);
    arm(g, shR[0], shR[1], cx + 138, hip - 34, 40, c.coat, c.skin);
  }

  // neck
  rr(g, cx - 26, chin - 24, 52, 62, 20, c.skin);

  // head
  g.save();
  g.translate(cx, headY);
  g.rotate(rad(tilt));
  blob(g, 0, 0, headRX, headRY, c.skin);

  // ears
  blob(g, -headRX + 4, 10, 16, 22, c.skin);
  blob(g, headRX - 4, 10, 16, 22, c.skin);

  // hair / hat
  if (c.hat === "tricorn") {
    g.fillStyle = "#22202a";
    g.beginPath();
    g.moveTo(-118, -58);
    g.quadraticCurveTo(0, -128, 118, -58);
    g.quadraticCurveTo(66, -34, 0, -44);
    g.quadraticCurveTo(-66, -34, -118, -58);
    g.closePath();
    g.fill();
    g.strokeStyle = c.trim;
    g.lineWidth = 7;
    g.stroke();
    blob(g, 42, -70, 12, 8, c.trim, -0.3);
  } else if (c.hat === "wrap") {
    g.fillStyle = "#efe2c4";
    g.beginPath();
    g.ellipse(0, -78, 104, 40, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = c.sash;
    g.beginPath();
    g.ellipse(0, -88, 86, 28, -0.1, Math.PI, 0);
    g.fill();
    g.strokeStyle = "#2a1c26";
    g.lineWidth = 4;
    g.stroke();
    blob(g, 62, -96, 12, 10, c.trim, 0.2);
  } else if (c.hat === "bandana") {
    g.fillStyle = c.sash;
    g.beginPath();
    g.ellipse(0, -58, 96, 44, 0, Math.PI, 0);
    g.fill();
    g.strokeStyle = "#2a1c26";
    g.lineWidth = 4;
    g.stroke();
    g.beginPath();
    g.moveTo(78, -72);
    g.lineTo(120, -44);
    g.lineTo(92, -34);
    g.closePath();
    g.fill();
  } else if (c.hat === "cap") {
    g.fillStyle = c.coat2;
    g.beginPath();
    g.ellipse(0, -64, 88, 40, 0, Math.PI, 0);
    g.fill();
    g.fillRect(-86, -66, 172, 18);
    g.strokeStyle = "#2a1c26";
    g.lineWidth = 4;
    g.strokeRect(-86, -66, 172, 18);
  } else {
    g.fillStyle = c.hair;
    g.beginPath();
    g.ellipse(0, -30, headRX + 4, headRY * 0.82, 0, Math.PI * 1.04, Math.PI * 1.96);
    g.fill();
    blob(g, -headRX + 10, 26, 18, 34, c.hair);
    blob(g, headRX - 10, 26, 18, 34, c.hair);
  }

  // face
  const ex = 34, ey = 14 + look * 6;
  const blink = o.blink ? 1 : 0;
  for (const sx of [-1, 1]) {
    if (blink) {
      line(g, sx * ex - 14, ey, sx * ex + 14, ey, 5, "#2a1c26");
    } else {
      blob(g, sx * ex, ey, 13, 16, "#fffaf0");
      blob(g, sx * ex + look * 5, ey + 2, 7, 9, "#2a1c26");
      blob(g, sx * ex + look * 5 + 2, ey - 1, 2.4, 3, "#fffaf0");
    }
    // brows
    g.strokeStyle = c.hair;
    g.lineWidth = 7;
    g.beginPath();
    if (expr === "stern" || expr === "shock") {
      g.moveTo(sx * ex - 18, ey - 30 + (expr === "shock" ? -6 : 0));
      g.lineTo(sx * ex + 16, ey - 38 + (expr === "shock" ? -10 : 0));
    } else {
      g.moveTo(sx * ex - 16, ey - 32);
      g.quadraticCurveTo(sx * ex, ey - 40, sx * ex + 16, ey - 32);
    }
    g.stroke();
  }

  // nose
  g.strokeStyle = "rgba(90,50,40,.55)";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(look * 4, 34);
  g.quadraticCurveTo(6 + look * 4, 48, -2 + look * 4, 52);
  g.stroke();

  // mouth
  g.strokeStyle = "#2a1c26";
  g.lineWidth = 6;
  g.beginPath();
  if (expr === "grin") {
    g.arc(0, 62, 28, 0.15, Math.PI - 0.15);
  } else if (expr === "shock") {
    blob(g, 0, 68, 14, 18, "#2a1c26");
  } else if (expr === "stern") {
    g.moveTo(-22, 66);
    g.lineTo(22, 66);
  } else {
    g.moveTo(-18, 64);
    g.quadraticCurveTo(0, 72, 18, 64);
  }
  g.stroke();

  g.restore();
}
