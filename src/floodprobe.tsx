// Komposisi uji untuk set London 1814. Kamera TETAP dan tanpa composer, jadi yang terlihat
// benar-benar geometri set-nya. Sudut kamera mengikuti nomor frame supaya empat sudut bisa
// dihasilkan dalam satu render:
//   COMPOSITION=FloodSet GL=swangle node scripts/stills.mjs out/set_ "0,1,2,3" 1.0
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { buildFloodSet } from "./videos/beerflood/floodset";
import { Kit } from "./videos/beerflood/build";

/** pos.x, pos.y, pos.z, look.x, look.y, look.z, fov */
const VIEWS: number[][] = [
  [-13, 2.4, 15, 0, 3.6, 0, 42],   // dari gang, rendah, ke tong
  [12, 8.5, 12, 0, 3.2, 0, 38],    // dari ketinggian: halaman + dinding belakang
  [0, 1.6, 12, 0, 5.8, 0, 45],     // menengok ke atas tong
  [3.5, 6.4, -9.5, 0, 2.4, 2, 40], // dari sisi dinding, seperti dari platform Crick
];

const Aim: React.FC<{ pos: [number, number, number]; look: [number, number, number] }> = ({ pos, look }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(new THREE.Vector3(look[0], look[1], look[2]));
  camera.updateProjectionMatrix();
  return null;
};

export const FloodSetProbe: React.FC = () => {
  const frame = useCurrentFrame();
  const v = VIEWS[frame % VIEWS.length];
  const built = React.useMemo(() => buildFloodSet({} as Kit), []);
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} camera={{ position: [v[0], v[1], v[2]], fov: v[6] }}>
        <Aim pos={[v[0], v[1], v[2]]} look={[v[3], v[4], v[5]]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[9, 15, 7]} intensity={1.5} />
        <primitive object={built.root} dispose={null} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
