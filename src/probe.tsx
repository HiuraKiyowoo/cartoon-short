import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";

/** Prints WebGL capability to the browser console so CI logs show whether a context exists. */
const Diag: React.FC = () => {
  const { gl, size } = useThree();
  React.useEffect(() => {
    try {
      const ctx = gl.getContext();
      const dbg = ctx ? ctx.getExtension("WEBGL_debug_renderer_info") : null;
      const unmasked = dbg && ctx ? ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "n/a";
      console.log(
        "DIAG webgl=" + !!ctx +
        " version=" + (ctx ? ctx.getParameter(ctx.VERSION) : "none") +
        " renderer=" + (ctx ? ctx.getParameter(ctx.RENDERER) : "none") +
        " UNMASKED=" + unmasked +
        " size=" + size.width + "x" + size.height
      );
    } catch (e) {
      console.log("DIAG error " + String(e));
    }
  }, [gl, size]);
  return null;
};

const Cube: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <mesh rotation={[f * 0.02, f * 0.03, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff5533" />
    </mesh>
  );
};

export const Probe: React.FC = () => (
  <AbsoluteFill style={{ background: "#101018" }}>
    <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 0, 6], fov: 40 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Diag />
      <Cube />
    </ThreeCanvas>
  </AbsoluteFill>
);
