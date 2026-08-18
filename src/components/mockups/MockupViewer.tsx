import React, { useState } from 'react';
import { DeviceConfig, CaseStyle, ImageTransform } from '../../types/customizer';
import { CompositeMockup } from './CompositeMockup';
import { Scene } from '../3d/Scene';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Sparkles, Rotate3d, Camera, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MockupViewerProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  transform: ImageTransform;
  customTexture: THREE.CanvasTexture | null;
}

type MockupType = 'composite-3in1' | 'hero-perspective' | 'interactive-3d' | 'lifestyle';

export const MockupViewer: React.FC<MockupViewerProps> = ({
  device,
  caseStyle,
  uploadedImage,
  transform,
  customTexture,
}) => {
  const [activeMockup, setActiveMockup] = useState<MockupType>('composite-3in1');
  const [is3dAutoRotating] = useState(true);
  const controlsRef = React.useRef<OrbitControlsImpl | null>(null);

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-4 p-3 sm:p-5 relative select-none">
      {/* ========================================================================= */}
      {/* 1. SELECTOR DE MAQUETAS EN MINIATURA (Estilo Printful / Maqueta del usuario) */}
      {/* ========================================================================= */}
      <div className="flex md:flex-col items-center gap-2.5 z-30 order-2 md:order-1 overflow-x-auto max-w-full py-1">
        {/* Miniatura 1: Maqueta 3 en 1 (Exacta a la imagen enviada por el usuario) */}
        <button
          type="button"
          onClick={() => setActiveMockup('composite-3in1')}
          className={`p-1.5 rounded-2xl border transition-all flex flex-col items-center flex-shrink-0 group ${
            activeMockup === 'composite-3in1'
              ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
              : 'bg-white/[0.04] border-white/10 hover:bg-white/10'
          }`}
          title="Maqueta 3 en 1 (Trasera, lateral e inferior)"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#12131a] flex items-center justify-center overflow-hidden relative shadow-inner p-1">
            <img
              src="/mockups/iphone_mockup_template.png"
              alt="3 en 1"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="text-[10px] text-slate-300 font-medium mt-1">Maqueta 3 en 1</span>
        </button>

        {/* Miniatura 2: Perspectiva 3D Hero */}
        <button
          type="button"
          onClick={() => setActiveMockup('hero-perspective')}
          className={`p-1.5 rounded-2xl border transition-all flex flex-col items-center flex-shrink-0 group ${
            activeMockup === 'hero-perspective'
              ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
              : 'bg-white/[0.04] border-white/10 hover:bg-white/10'
          }`}
          title="Perspectiva 3D con luz de estudio"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#12131a] flex items-center justify-center overflow-hidden relative shadow-inner">
            <Smartphone className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[10px] text-slate-300 font-medium mt-1">Perspectiva</span>
        </button>

        {/* Miniatura 3: 3D Interactivo 360° */}
        <button
          type="button"
          onClick={() => setActiveMockup('interactive-3d')}
          className={`p-1.5 rounded-2xl border transition-all flex flex-col items-center flex-shrink-0 group ${
            activeMockup === 'interactive-3d'
              ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
              : 'bg-white/[0.04] border-white/10 hover:bg-white/10'
          }`}
          title="Giro libre en 360 grados"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#12131a] flex items-center justify-center overflow-hidden relative shadow-inner">
            <Rotate3d className="w-6 h-6 text-indigo-400 group-hover:rotate-45 transition-transform" />
          </div>
          <span className="text-[10px] text-slate-300 font-medium mt-1">Giro 360°</span>
        </button>

        {/* Miniatura 4: Lifestyle Maqueta */}
        <button
          type="button"
          onClick={() => setActiveMockup('lifestyle')}
          className={`p-1.5 rounded-2xl border transition-all flex flex-col items-center flex-shrink-0 group ${
            activeMockup === 'lifestyle'
              ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
              : 'bg-white/[0.04] border-white/10 hover:bg-white/10'
          }`}
          title="Maqueta estilo vida real"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#12131a] flex items-center justify-center overflow-hidden relative shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[10px] text-slate-300 font-medium mt-1">Lifestyle</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. ÁREA PRINCIPAL DE RENDERIZADO DE LA MAQUETA SELECCIONADA                */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative order-1 md:order-2 overflow-hidden min-h-[300px]">
        <AnimatePresence mode="wait">
          {/* VISTA 1: MAQUETA 3 EN 1 (Exacta a la imagen de referencia del usuario) */}
          {activeMockup === 'composite-3in1' && (
            <motion.div
              key="composite-mockup"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center relative"
            >
              <CompositeMockup
                device={device}
                caseStyle={caseStyle}
                uploadedImage={uploadedImage}
                transform={transform}
              />
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center space-x-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-slate-200 text-[11px] shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Maqueta fotográfica 3 en 1 con incrustado directo</span>
              </div>
            </motion.div>
          )}

          {/* VISTA 2: HERO PERSPECTIVE 3D RENDER */}
          {activeMockup === 'hero-perspective' && (
            <motion.div
              key="hero-mockup"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full relative flex items-center justify-center"
            >
              <div className="w-full h-full relative">
                <Scene
                  device={device}
                  caseStyle={caseStyle}
                  customTexture={customTexture}
                  isAutoRotating={false}
                  onControlsReady={(controls) => {
                    controlsRef.current = controls;
                    controls.reset();
                    controls.object.position.set(1.4, 0.4, 7.5);
                    controls.target.set(0, 0, 0);
                    controls.update();
                  }}
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/60 rounded-full blur-xl pointer-events-none" />
              </div>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-slate-200 text-[11px] shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Perspectiva 3D con bordes impresos</span>
              </div>
            </motion.div>
          )}

          {/* VISTA 3: 3D INTERACTIVO 360° */}
          {activeMockup === 'interactive-3d' && (
            <motion.div
              key="interactive-3d-mockup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full relative"
            >
              <Scene
                device={device}
                caseStyle={caseStyle}
                customTexture={customTexture}
                isAutoRotating={is3dAutoRotating}
                onControlsReady={(controls) => {
                  controlsRef.current = controls;
                }}
              />

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center space-x-2 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-slate-200 text-xs shadow-lg">
                <Rotate3d className="w-4 h-4 text-indigo-400" />
                <span>Arrastrá libremente para rotar en 360°</span>
              </div>
            </motion.div>
          )}

          {/* VISTA 4: MAQUETA LIFESTYLE */}
          {activeMockup === 'lifestyle' && (
            <motion.div
              key="lifestyle-mockup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center p-4 relative"
            >
              <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-gradient-to-br from-slate-900 via-[#10121a] to-slate-950 flex items-center justify-center p-6">
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-purple-500/10 blur-3xl" />

                <div
                  className="relative shadow-[0_30px_70px_rgba(0,0,0,0.85)] rotate-[-8deg] hover:rotate-0 transition-transform duration-500"
                  style={{
                    width: '180px',
                    aspectRatio: `${device.dimensions.width / device.dimensions.height}`,
                  }}
                >
                  <div
                    className="w-full h-full rounded-[26px] overflow-hidden border border-white/20 relative shadow-2xl"
                    style={{ backgroundColor: caseStyle.color }}
                  >
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Funda"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `translate(${transform.x}%, ${transform.y}%) scale(${
                            transform.scale
                          }) rotate(${transform.rotation}deg) scaleX(${
                            transform.flipH ? -1 : 1
                          })`,
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                        Tu Diseño
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />

                    <div className="absolute top-2 left-2 w-14 h-14 rounded-2xl bg-[#14161c] border border-white/25 shadow-lg flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-black border border-slate-600 shadow-inner" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center space-x-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-slate-300 text-[11px]">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Presentación en contexto real</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
