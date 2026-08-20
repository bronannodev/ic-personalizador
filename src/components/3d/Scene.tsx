import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CaseStyle, DeviceConfig } from '../../types/customizer';
import { PhoneGeometry } from './PhoneGeometry';
import { StudioEnvironment } from './StudioEnvironment';

interface SceneProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  customTexture: THREE.CanvasTexture | null;
  isAutoRotating: boolean;
  onControlsReady?: (controls: OrbitControlsImpl) => void;
}

export const Scene: React.FC<SceneProps> = ({
  device,
  caseStyle,
  customTexture,
  isAutoRotating,
  onControlsReady,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const handleControlsRef = (controls: OrbitControlsImpl | null) => {
    if (controls) {
      (controlsRef as React.MutableRefObject<OrbitControlsImpl | null>).current = controls;
      if (onControlsReady) {
        onControlsReady(controls);
      }
    }
  };

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, 0, 9.5], fov: 42 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 2)]}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <StudioEnvironment />

          <PhoneGeometry
            device={device}
            caseStyle={caseStyle}
            customTexture={customTexture}
          />

          <OrbitControls
            ref={handleControlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={5}
            maxDistance={14}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={(Math.PI * 5) / 6}
            autoRotate={isAutoRotating}
            autoRotateSpeed={2.5}
            dampingFactor={0.08}
            enableDamping={true}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
