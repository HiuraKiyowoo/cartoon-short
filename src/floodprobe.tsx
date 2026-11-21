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
  [-17, 7.5, 23, 0, 3.2, 0, 38],   // luas dari gang: halaman, tong, dinding
  [14, 12, 17, 0, 3.0, 0, 36],     // dari ketinggian: tata letak + dinding belakang
  [11, 2.1, 15, 0.5, 3.4, 0, 42],  // dari jalan, rendah: alas tong + gelang besi
  [-10.5, 8.5, 7, 0, 2.4, 0, 40],  // dari sisi platform (tempat Crick), turun ke tong
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
      <ThreeCanvas width={1080} height={1920} shadows camera={{ position: [v[0], v[1], v[2]], fov: v[6] }}>
        <Aim pos={[v[0], v[1], v[2]]} look={[v[3], v[4], v[5]]} />
        <hemisphereLight args={["#bcd8f5", "#8d7f6b", 0.75]} />
        <directionalLight position={[14, 20, 11]} intensity={1.5} castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048}
          shadow-camera-left={-26} shadow-camera-right={26} shadow-camera-top={26} shadow-camera-bottom={-26} />
        <primitive object={built.root} dispose={null} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
