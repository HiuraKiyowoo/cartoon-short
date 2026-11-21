// Klip pendek (kalimat pembuka skrip, f0–112 = 3,77 s): set London 1814 + suara asli.
// Tujuannya menguji seluruh rantai (geometri → look → audio → mux) sebelum scene penuh dibangun.
// Kamera meluncur dari gang gelap ke tong: mengikuti kalimat "Di London, delapan orang tewas tenggelam di dalam bir."
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { buildFloodSet } from "./videos/beerflood/floodset";
import { Kit } from "./videos/beerflood/build";
import { InkPass } from "./videos/beerflood/ink";
import { GradeEffect, GRADES, GRADE_STRENGTH } from "./videos/beerflood/grade";
import { EffectComposer as PostComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";

export const TEASER_FRAMES = 113;

/**
 * Composer minimal untuk klip ini: garis tinta + tone map + grade.
 * Dirender di useEffect (bukan useFrame) — useFrame tidak dieksekusi saat ThreeCanvas memakai
 * frameloop "never". Satu EffectPass per effect: lens blur bertipe CONVOLUTION tidak boleh digabung.
 */
const Post: React.FC = () => {
  const { gl, scene, camera } = useThree();
  const composer = React.useMemo(() => {
    const c = new PostComposer(gl as never, { frameBufferType: THREE.HalfFloatType, multisampling: 2, alpha: false });
    c.addPass(new RenderPass(scene as never, camera as never));
    c.addPass(new InkPass(scene, camera as THREE.PerspectiveCamera));
    c.addPass(new EffectPass(camera as never, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL })));
    c.addPass(new EffectPass(camera as never, new GradeEffect(GRADES.day, GRADE_STRENGTH.day)));
    return c;
  }, [gl, scene, camera]);
  const f = useCurrentFrame();
  React.useEffect(() => {
    const el = gl.domElement;
    composer.setSize(el.width, el.height, false);
    gl.autoClear = false;
    composer.render();
  }, [f, composer, gl]);
  React.useEffect(() => () => composer.dispose(), [composer]);
  return null;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };

const Glide: React.FC = () => {
  const f = useCurrentFrame();
  const k = smooth(f / TEASER_FRAMES);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // mulai rendah di mulut gang (lantai gelap), naik pelan ke arah tong
  camera.position.set(-15 + 9 * k, 0.75 + 2.6 * k, 20 - 8 * k);
  camera.lookAt(new THREE.Vector3(-2 + 2 * k, 1.2 + 2.0 * k, 0));
  camera.fov = 40 - 3 * k;
  camera.updateProjectionMatrix();
  return null;
};

export const FloodTeaser: React.FC = () => {
  const f = useCurrentFrame();
  const built = React.useMemo(() => buildFloodSet({} as Kit), []);
  // gelombang porter di lantai: muncul dari kedalaman gang, makin dekat
  const w = built.wave;
  w.visible = true;
  w.position.z = 26 - 12 * smooth(f / TEASER_FRAMES);
  (w.material as THREE.MeshLambertMaterial).opacity = 0.55 + 0.35 * smooth(f / TEASER_FRAMES);

  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ position: [-15, 0.75, 20], fov: 40 }}>
        <Glide />
        <hemisphereLight args={["#9fb8d6", "#6f6355", 0.55]} />
        <directionalLight position={[14, 20, 11]} intensity={1.35} castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048}
          shadow-camera-left={-26} shadow-camera-right={26} shadow-camera-top={26} shadow-camera-bottom={-26} />
        <primitive object={built.root} dispose={null} />
        <Post />
      </ThreeCanvas>
      <Audio src={staticFile("voice.mp3")} />
    </AbsoluteFill>
  );
};
