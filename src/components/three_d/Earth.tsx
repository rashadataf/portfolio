import { useRef } from "react";
import { Canvas, MeshProps, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import { useIntersect } from "../../hooks/useIntersect";

const Earth = () => {
  const earth = useGLTF("./earth/scene.gltf");
  const meshRef = useRef<MeshProps>(null);
  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.0004;
    meshRef.current.rotation.y = 0.0004;
  })
  return (
    <mesh ref={meshRef}>
      <primitive
        object={earth.scene}
        scale={1}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    </mesh>
  );
};

const EarthModel = () => {
  const [ref, isVisible] = useIntersect();

  return (
    <Canvas
      className="absolute top-0 left-0 w-screen h-screen"
      ref={c => ref.current = c}
    >
      {isVisible &&
        <>
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={20}
            minPolarAngle={0}
          />
          <Earth />
          <Preload all />
        </>
      }
    </Canvas>
  );
};

export default EarthModel;
