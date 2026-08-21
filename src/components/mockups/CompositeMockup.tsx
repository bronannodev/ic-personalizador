import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DeviceConfig, CaseStyle, ImageTransform } from '../../types/customizer';
import {
  renderSceneToCanvas,
  preloadMockup,
  getCachedMockup,
  preloadStudioBackground,
  getStudioBackground,
  SCENE_ASPECT,
  MockupData,
} from '../../utils/caseRenderer';

interface CompositeMockupProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  transform: ImageTransform;
}

// Resolución del lienzo de la escena de estudio (retrato 4:5). La funda se
// dibuja centrada sobre el fondo de estudio dentro del renderizador canónico.
const SCENE_H = 1350;
const SCENE_W = Math.round(SCENE_H * SCENE_ASPECT);

export const CompositeMockup: React.FC<CompositeMockupProps> = ({
  device,
  caseStyle,
  uploadedImage,
  transform,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);
  const [mockup, setMockup] = useState<MockupData | null>(
    () => getCachedMockup(device.mockupImagePath)
  );
  const [studioBg, setStudioBg] = useState<HTMLImageElement | null>(
    () => getStudioBackground()
  );

  // Precarga el fondo de estudio para la escena de presentación.
  useEffect(() => {
    let active = true;
    preloadStudioBackground().then((img) => {
      if (active) setStudioBg(img);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!uploadedImage) {
      setUserImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setUserImg(img);
    img.src = uploadedImage;
  }, [uploadedImage]);

  // Carga y analiza el mockup fotográfico del dispositivo seleccionado.
  useEffect(() => {
    let active = true;
    const cached = getCachedMockup(device.mockupImagePath);
    setMockup(cached);
    if (device.mockupImagePath) {
      preloadMockup(device.mockupImagePath).then((data) => {
        if (active) setMockup(data);
      });
    }
    return () => {
      active = false;
    };
  }, [device.mockupImagePath]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = SCENE_W;
    canvas.height = SCENE_H;
    renderSceneToCanvas(canvas, {
      device,
      caseStyle,
      image: userImg,
      transform,
      showCamera: true,
      mockup,
      sceneBackground: studioBg,
    });
  }, [device, caseStyle, userImg, transform, mockup, studioBg]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 select-none">
      <div className="relative flex items-center justify-center w-full max-w-[300px] sm:max-w-[340px] md:max-w-[380px] rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[70vh] object-contain block"
          aria-label={`Vista previa de la funda para ${device.name}`}
        />

        {!uploadedImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-black/75 backdrop-blur-md rounded-xl px-6 py-4 text-center border border-white/15 shadow-2xl">
              <p className="text-sm font-semibold text-white">Subí tu diseño</p>
              <p className="text-xs text-slate-300 mt-1">para ver la funda terminada</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
