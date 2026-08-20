import React, { useState, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { DeviceConfig, CaseStyle, ImageTransform } from '../../types/customizer';
import { PhoneCase2D } from '../2d/PhoneCase2D';
import { Scene } from '../3d/Scene';
import { ViewControls } from './ViewControls';
import { ImageUploader } from './ImageUploader';
import { TransformControls } from './TransformControls';
import { CaseColorPicker } from './CaseColorPicker';
import {
  ChevronLeft,
  Box,
  Layers,
  Sparkles,
  Palette,
  Rotate3d,
} from 'lucide-react';

interface EditorStepProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  transform: ImageTransform;
  customTexture: THREE.CanvasTexture | null;
  onBackToSelection: () => void;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
  onUpdateTransform: (updates: Partial<ImageTransform>) => void;
  onRotate90: () => void;
  onResetTransform: () => void;
  onSelectCaseStyle: (style: CaseStyle) => void;
  onOpenOrderModal: () => void;
}

export const EditorStep: React.FC<EditorStepProps> = ({
  device,
  caseStyle,
  uploadedImage,
  transform,
  customTexture,
  onBackToSelection,
  onImageUpload,
  onRemoveImage,
  onUpdateTransform,
  onRotate90,
  onResetTransform,
  onSelectCaseStyle,
  onOpenOrderModal,
}) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [is3dAutoRotating, setIs3dAutoRotating] = useState(false);
  const [activePanel, setActivePanel] = useState<'design' | 'style'>('design');

  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden relative">
      <div className="relative flex-1 h-[50vh] md:h-full w-full bg-[#07080c]/30 backdrop-blur-sm flex items-center justify-center overflow-hidden">
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          <button
            onClick={onBackToSelection}
            className="pointer-events-auto flex items-center space-x-1.5 px-3 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border border-white/10 backdrop-blur-xl transition-colors text-xs font-medium shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{device.name}</span>
          </button>

          <div className="pointer-events-auto flex items-center bg-white/[0.08] p-1 rounded-full border border-white/10 backdrop-blur-xl shadow-md">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
                viewMode === '2d'
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
                viewMode === '3d'
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D</span>
            </button>
          </div>
        </div>

        {viewMode === '2d' ? (
          <div className="w-full h-full flex items-center justify-center animate-fade-in">
            <PhoneCase2D
              device={device}
              caseStyle={caseStyle}
              uploadedImage={uploadedImage}
              transform={transform}
            />
          </div>
        ) : (
          <div className="w-full h-full relative animate-fade-in">
            <ViewControls
              isAutoRotating={is3dAutoRotating}
              onToggleAutoRotate={() => setIs3dAutoRotating(!is3dAutoRotating)}
              controlsRef={controlsRef}
            />

            <Scene
              device={device}
              caseStyle={caseStyle}
              customTexture={customTexture}
              isAutoRotating={is3dAutoRotating}
              onControlsReady={(controls) => {
                controlsRef.current = controls;
              }}
            />

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-slate-300 text-[11px]">
              <Rotate3d className="w-3.5 h-3.5 text-slate-300" />
              <span>Arrastrá para girar en 3D</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full md:w-[420px] lg:w-[450px] bg-[#12141c]/95 md:bg-[#12141c]/80 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl z-20 h-[50vh] md:h-full">
        <div className="p-3 border-b border-white/10 flex items-center space-x-2 bg-white/[0.02]">
          <button
            onClick={() => setActivePanel('design')}
            className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
              activePanel === 'design'
                ? 'bg-white/15 text-white border border-white/20 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Foto y Ajustes</span>
          </button>
          <button
            onClick={() => setActivePanel('style')}
            className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
              activePanel === 'style'
                ? 'bg-white/15 text-white border border-white/20 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Funda</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activePanel === 'design' ? (
            <div className="space-y-4 animate-fade-in">
              <ImageUploader
                uploadedImage={uploadedImage}
                onImageUpload={onImageUpload}
                onRemoveImage={onRemoveImage}
              />

              {uploadedImage && (
                <TransformControls
                  transform={transform}
                  onUpdateTransform={onUpdateTransform}
                  onRotate90={onRotate90}
                  onReset={onResetTransform}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <CaseColorPicker
                selectedStyle={caseStyle}
                onSelectStyle={onSelectCaseStyle}
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onOpenOrderModal}
            className="w-full py-4 px-6 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.99] font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-xl shadow-white/10 transition-all"
          >
            <span>Quiero esta funda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
