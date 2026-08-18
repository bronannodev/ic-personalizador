import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CaseStyle, DeviceConfig } from '../../types/customizer';

interface PhoneGeometryProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  customTexture: THREE.CanvasTexture | null;
}

// Helper para crear forma de rectángulo redondeado 2D
function createRoundedRectShape(
  width: number,
  height: number,
  radius: number
): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

export const PhoneGeometry: React.FC<PhoneGeometryProps> = ({
  device,
  caseStyle,
  customTexture,
}) => {
  const { width, height, depth, cornerRadius } = device.dimensions;
  const camera = device.camera;

  // 1. Geometría del cuerpo del teléfono
  const phoneBodyGeometry = useMemo(() => {
    const shape = createRoundedRectShape(width, height, cornerRadius);
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      curveSegments: 16,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, [width, height, depth, cornerRadius]);

  // 2. Geometría de la pantalla frontal
  const screenGeometry = useMemo(() => {
    const sWidth = width - 0.12;
    const sHeight = height - 0.12;
    const shape = createRoundedRectShape(sWidth, sHeight, cornerRadius - 0.04);
    const geom = new THREE.ShapeGeometry(shape, 16);
    return geom;
  }, [width, height, cornerRadius]);

  // 3. Geometría del marco / funda externa (Case)
  const caseGeometry = useMemo(() => {
    const caseWidth = width + 0.12;
    const caseHeight = height + 0.12;
    const caseDepth = depth + 0.08;
    const shape = createRoundedRectShape(caseWidth, caseHeight, cornerRadius + 0.04);
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: caseDepth,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      curveSegments: 16,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, [width, height, depth, cornerRadius]);

  // 4. Geometría de la superficie trasera personalizable (con UVs mapeadas de 0 a 1)
  const backPlateGeometry = useMemo(() => {
    const pWidth = width + 0.08;
    const pHeight = height + 0.08;
    const shape = createRoundedRectShape(pWidth, pHeight, cornerRadius + 0.02);
    const geom = new THREE.ShapeGeometry(shape, 24);

    // Ajustar coordenadas UV manualmente para que la imagen quede perfectamente centrada y derecha
    const pos = geom.attributes.position;
    const uvs: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      const u = (px + pWidth / 2) / pWidth;
      const v = (py + pHeight / 2) / pHeight;
      uvs.push(u, v);
    }
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geom;
  }, [width, height, cornerRadius]);

  // 5. Geometría de la isla de cámaras
  const cameraBumpGeometry = useMemo(() => {
    const shape = createRoundedRectShape(
      camera.width,
      camera.height,
      camera.radius
    );
    const extrudeSettings = {
      depth: camera.depth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      curveSegments: 12,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, [camera]);

  // Posiciones de lentes según el tipo de cámara
  const lensPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const zOffset = camera.depth / 2 + 0.02;

    if (camera.type === 'triple-pro-large' || camera.type === 'triple-pro-classic') {
      // Distribución triangular Pro (iPhone 16 Pro / 15 Pro / 14 Pro / 13 Pro / 12 Pro)
      const r = camera.type === 'triple-pro-large' ? 0.3 : 0.26;
      positions.push([-r, r - 0.05, zOffset]);
      positions.push([-r, -r + 0.05, zOffset]);
      positions.push([r - 0.05, 0, zOffset]);
    } else if (camera.type === 'diagonal-dual') {
      // Distribución diagonal estándar (iPhone 15 / 14 / 13)
      const r = 0.24;
      positions.push([-r, r, zOffset]);
      positions.push([r, -r, zOffset]);
    } else if (camera.type === 'vertical-pill-modern' || camera.type === 'vertical-pill-classic' || camera.type === 'vertical-dual-square') {
      // Distribución vertical dual (iPhone 16, X, XS, 12, 11)
      const step = 0.26;
      positions.push([0, step, zOffset]);
      positions.push([0, -step, zOffset]);
    } else if (camera.type === 'single-lens') {
      // Lente única (iPhone XR, SE)
      positions.push([0, 0, zOffset]);
    } else if (camera.type === 'vertical-quad') {
      // Distribución vertical cuádruple (Samsung Galaxy S24 Ultra)
      const step = 0.42;
      positions.push([-0.18, 0.65, zOffset]);
      positions.push([-0.18, 0.65 - step, zOffset]);
      positions.push([-0.18, 0.65 - step * 2, zOffset]);
      positions.push([0.22, 0.65 - step * 0.6, zOffset]); // Lente periscopio
    } else {
      // Distribución vertical triple (Samsung Galaxy S24 / S23)
      const step = 0.42;
      positions.push([0, step, zOffset]);
      positions.push([0, 0, zOffset]);
      positions.push([0, -step, zOffset]);
    }
    return positions;
  }, [camera]);

  // Color del marco del teléfono (Titanio oscuro / aluminio pulido)
  const phoneChassisColor = device.brand === 'apple' ? '#26282e' : '#1e2026';

  return (
    <group position={[0, 0, 0]}>
      {/* ===== CUERPO DEL TELÉFONO (Chassis) ===== */}
      <mesh geometry={phoneBodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={phoneChassisColor}
          metalness={0.88}
          roughness={0.25}
        />
      </mesh>

      {/* ===== PANTALLA FRONTAL (OLED con reflejo) ===== */}
      <mesh
        geometry={screenGeometry}
        position={[0, 0, -depth / 2 - 0.041]}
        rotation={[0, Math.PI, 0]}
      >
        <meshPhysicalMaterial
          color="#050608"
          roughness={0.05}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Dynamic Island / Cámara frontal (sutil) */}
      <mesh position={[0, height / 2 - 0.35, -depth / 2 - 0.043]}>
        <capsuleGeometry args={[0.04, 0.16, 8, 12]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ===== FUNDA EXTERNA (Case Sides & Frame) ===== */}
      <mesh geometry={caseGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={caseStyle.color}
          roughness={caseStyle.roughness}
          metalness={caseStyle.metalness}
          transmission={caseStyle.transmission}
          opacity={caseStyle.opacity}
          transparent={caseStyle.opacity < 1 || caseStyle.transmission > 0}
          clearcoat={caseStyle.clearcoat}
          clearcoatRoughness={0.1}
          ior={1.5}
        />
      </mesh>

      {/* ===== SUPERFICIE TRASERA PERSONALIZADA CON TEXTURA DEL USUARIO ===== */}
      <mesh
        geometry={backPlateGeometry}
        position={[0, 0, depth / 2 + 0.043]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          map={customTexture || undefined}
          color={customTexture ? '#ffffff' : caseStyle.color}
          roughness={caseStyle.roughness}
          metalness={caseStyle.metalness * 0.5}
          clearcoat={caseStyle.clearcoat}
          clearcoatRoughness={0.15}
          reflectivity={0.5}
        />
      </mesh>

      {/* ===== MÓDULO DE CÁMARAS TRASERAS ===== */}
      <group position={camera.position}>
        {/* Base de la isla de cámaras */}
        <mesh geometry={cameraBumpGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={device.brand === 'apple' ? '#1c1d22' : '#22252a'}
            roughness={0.3}
            metalness={0.6}
            clearcoat={0.8}
          />
        </mesh>

        {/* Lentes de cámara individuales */}
        {lensPositions.map((pos, idx) => (
          <group key={idx} position={pos}>
            {/* Anillo exterior de metal */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.04, 24]} />
              <meshStandardMaterial
                color="#4a4d57"
                metalness={0.95}
                roughness={0.15}
              />
            </mesh>

            {/* Cristal óptico de la lente */}
            <mesh position={[0, 0, 0.021]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.105, 0.105, 0.01, 24]} />
              <meshPhysicalMaterial
                color="#030406"
                roughness={0.02}
                metalness={0.9}
                clearcoat={1.0}
                clearcoatRoughness={0.02}
              />
            </mesh>

            {/* Reflejo azul/morado sutil del tratamiento antirreflejo */}
            <mesh position={[0, 0, 0.023]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.06, 16]} />
              <meshBasicMaterial
                color="#203a70"
                transparent
                opacity={0.35}
              />
            </mesh>
          </group>
        ))}

        {/* Flash LED */}
        {camera.hasFlash && (
          <mesh
            position={[
              camera.type.includes('triple') ? 0.22 : 0,
              camera.type.includes('triple') ? 0.32 : 0.25,
              camera.depth / 2 + 0.01,
            ]}
          >
            <circleGeometry args={[0.065, 16]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#fef08a"
              emissiveIntensity={0.25}
              roughness={0.4}
            />
          </mesh>
        )}

        {/* Sensor LiDAR */}
        {camera.hasLidar && (
          <mesh position={[0.22, -0.32, camera.depth / 2 + 0.01]}>
            <circleGeometry args={[0.05, 16]} />
            <meshStandardMaterial color="#0a0a0c" roughness={0.2} />
          </mesh>
        )}
      </group>
    </group>
  );
};
