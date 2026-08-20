import React from 'react';
import { ContactShadows } from '@react-three/drei';

export const StudioEnvironment: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.8} />

      <directionalLight
        position={[4, 6, 5]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      <directionalLight position={[-4, 3, 3]} intensity={0.9} color="#e0e7ff" />

      <directionalLight position={[0, -4, -5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[3, -2, -3]} intensity={0.7} color="#cbd5e1" />

      <pointLight position={[0, 5, 2]} intensity={0.6} />

      <ContactShadows
        position={[0, -3.4, 0]}
        opacity={0.65}
        scale={12}
        blur={2.2}
        far={6}
        resolution={512}
        color="#000000"
      />
    </>
  );
};
