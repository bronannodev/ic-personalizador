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

    const isIphone17ProMax = device.id === 'iphone-17-pro-max';
    const isProMaxOrPlus =
      device.id.includes('pro-max') ||
      device.id.includes('promax') ||
      device.id.includes('plus');

    let centerX = W * 0.508;
    let centerY = H * 0.496;
    let caseW = isProMaxOrPlus ? W * 0.385 : W * 0.370;
    let caseH = H * 0.762;

    if (isIphone17ProMax) {
      centerX = W * 0.465;
      centerY = H * 0.605;
      caseW = W * 0.540;
      caseH = H * 0.535;
    }

    if (userImg) {
      ctx.save();

      const offsetX = (transform.x / 100) * (caseW / 2);
      const offsetY = (transform.y / 100) * (caseH / 2);

      ctx.translate(centerX + offsetX, centerY + offsetY);
      ctx.scale(transform.scale, transform.scale);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

      const imgAspect = userImg.naturalWidth / userImg.naturalHeight;
      const caseAspect = caseW / caseH;
      let drawW: number, drawH: number;

      if (imgAspect > caseAspect) {
        drawH = caseH;
        drawW = caseH * imgAspect;
      } else {
        drawW = caseW;
        drawH = caseW / imgAspect;
      }

      ctx.drawImage(userImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    ctx.drawImage(mockupImg, 0, 0, W, H);
  }, [mockupImg, userImg, transform, device.id]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 select-none">
      <div className="relative flex items-center justify-center w-full max-w-[360px] sm:max-w-[420px] md:max-w-[460px] bg-white rounded-[32px] p-2.5 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
        />

        {!uploadedImage && mockupImg && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-black/75 backdrop-blur-md rounded-2xl px-6 py-4 text-center border border-white/15 shadow-2xl">
              <p className="text-sm font-semibold text-white">Subí tu diseño</p>
              <p className="text-xs text-slate-300 mt-1">para ver la funda terminada</p>
            </div>
          </div>
        )}

        {!mockupImg && (
          <div className="w-full aspect-square flex items-center justify-center bg-slate-100 rounded-2xl">
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
