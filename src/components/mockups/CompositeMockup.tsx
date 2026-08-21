import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DeviceConfig, CaseStyle, ImageTransform } from '../../types/customizer';

interface CompositeMockupProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  transform: ImageTransform;
}

export const CompositeMockup: React.FC<CompositeMockupProps> = ({
  device,
  uploadedImage,
  transform,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mockupImg, setMockupImg] = useState<HTMLImageElement | null>(null);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);

  const mockupSrc = device.mockupImagePath || '/MockupsV2/Iphone16/Iphone16pro.png';

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setMockupImg(img);
    img.onerror = () => console.warn('Error cargando mockup:', mockupSrc);
    img.src = mockupSrc;
  }, [mockupSrc]);

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
    if (!canvas || !mockupImg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = mockupImg.naturalWidth || 1024;
    const H = mockupImg.naturalHeight || 1024;
    canvas.width = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    const realWidth = device.dimensions.realWidthMm || device.dimensions.width * 25.4;
    const realHeight = device.dimensions.realHeightMm || device.dimensions.height * 25.4;
    const widthRatio = realWidth / realHeight;

    let caseH = H * 0.815;
    let caseW = caseH * widthRatio;
    let centerX = W * 0.505;
    let centerY = H * 0.485;

    if (device.id === 'iphone-17-pro-max') {
      caseH = H * 0.58;
      caseW = caseH * widthRatio;
      centerX = W * 0.465;
      centerY = H * 0.605;
    } else if (device.id === 'iphone-17-air') {
      caseH = H * 0.68;
      caseW = caseH * widthRatio;
      centerX = W * 0.495;
      centerY = H * 0.580;
    } else if (device.id === 'iphone-17') {
      caseH = H * 0.80;
      caseW = caseH * widthRatio;
      centerX = W * 0.505;
      centerY = H * 0.475;
    }

    if (userImg) {
      ctx.save();

      const offsetX = (transform.x / 100) * (caseW / 2);
      const offsetY = (transform.y / 100) * (caseH / 2);

      ctx.translate(centerX + offsetX, centerY + offsetY);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

      const imgAspect = userImg.naturalWidth / userImg.naturalHeight;
      const caseAspect = caseW / caseH;
      let baseW: number, baseH: number;

      // Base: contain (imagen completa sin recortar de inicio)
      if (imgAspect > caseAspect) {
        baseW = caseW;
        baseH = caseW / imgAspect;
      } else {
        baseH = caseH;
        baseW = caseH * imgAspect;
      }

      const drawW = baseW * transform.scale;
      const drawH = baseH * transform.scale;

      ctx.drawImage(userImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    ctx.drawImage(mockupImg, 0, 0, W, H);
  }, [mockupImg, userImg, transform, device]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 select-none">
      <div className="relative flex items-center justify-center w-full max-w-[360px] sm:max-w-[420px] md:max-w-[460px] bg-white rounded-xl p-2.5 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
        />

        {!uploadedImage && mockupImg && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-black/75 backdrop-blur-md rounded-xl px-6 py-4 text-center border border-white/15 shadow-2xl">
              <p className="text-sm font-semibold text-white">Subí tu diseño</p>
              <p className="text-xs text-slate-300 mt-1">para ver la funda terminada</p>
            </div>
          </div>
        )}

        {!mockupImg && (
          <div className="w-full aspect-square flex items-center justify-center bg-slate-100 rounded-xl">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-600 font-medium">Cargando maqueta...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
