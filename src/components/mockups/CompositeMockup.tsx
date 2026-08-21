import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DeviceConfig, CaseStyle, ImageTransform } from '../../types/customizer';
import { renderCaseToCanvas } from '../../utils/caseRenderer';

interface CompositeMockupProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  transform: ImageTransform;
}

// Resolución del lienzo de vista previa (retrato). El aspecto real de la funda
// se calcula dentro del renderizador canónico a partir de las dimensiones del
// dispositivo, así que aquí solo definimos un lienzo generoso y nítido.
const CANVAS_W = 1000;
const CANVAS_H = 1400;

export const CompositeMockup: React.FC<CompositeMockupProps> = ({
  device,
  caseStyle,
  uploadedImage,
  transform,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);

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

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    renderCaseToCanvas(canvas, {
      device,
      caseStyle,
      image: userImg,
      transform,
      showCamera: true,
    });
  }, [device, caseStyle, userImg, transform]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 select-none">
      <div className="relative flex items-center justify-center w-full max-w-[300px] sm:max-w-[340px] md:max-w-[380px] bg-white rounded-2xl p-4 sm:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[68vh] object-contain"
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
