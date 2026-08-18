import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DeviceConfig, CaseStyle, ImageTransform } from '../../types/customizer';

interface CompositeMockupProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  transform: ImageTransform;
}

/**
 * CompositeMockup — Incrusta la imagen del usuario SOLO en las zonas transparentes
 * del mockup PNG real de cada modelo.
 *
 * Los mockups en public/mockups/modelos/ tienen:
 *   - Zonas TRANSPARENTES (alfa=0): Superficie de la funda → ahí va el diseño del usuario
 *   - Zonas OPACAS: Hardware (cámaras, botones), sombras y fondo blanco → se mantienen intactos
 *
 * Técnica Canvas (3 pasos):
 *   1. Dibujar el mockup PNG (los agujeros transparentes quedan vacíos)
 *   2. destination-over: dibujar imagen del usuario DETRÁS → rellena SOLO los agujeros
 *   3. destination-over: rellenar fondo blanco DETRÁS de todo
 */
export const CompositeMockup: React.FC<CompositeMockupProps> = ({
  device,
  uploadedImage,
  transform,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mockupImg, setMockupImg] = useState<HTMLImageElement | null>(null);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);

  const mockupSrc = device.mockupImagePath || '/mockups/modelos/Iphone13/iphone13pro.png';

  // Cargar imagen del mockup
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setMockupImg(img);
    img.onerror = () => console.warn('Error cargando mockup:', mockupSrc);
    img.src = mockupSrc;
  }, [mockupSrc]);

  // Cargar imagen del usuario
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

  // Renderizar la composición en el canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mockupImg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600;
    const H = 600;
    canvas.width = W;
    canvas.height = H;

    // Limpiar todo
    ctx.clearRect(0, 0, W, H);

    // ============================================================
    // PASO 1: Dibujar el mockup PNG tal cual
    // Las zonas transparentes de la funda quedan como "agujeros"
    // ============================================================
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(mockupImg, 0, 0, W, H);

    if (userImg) {
      // ============================================================
      // PASO 2: Dibujar la imagen del usuario DETRÁS del mockup
      // destination-over: solo pinta donde el canvas es transparente
      // → rellena únicamente las zonas de la funda (los agujeros)
      // ============================================================
      ctx.globalCompositeOperation = 'destination-over';

      ctx.save();

      const centerX = W / 2;
      const centerY = H / 2;

      ctx.translate(centerX, centerY);

      // Offset del usuario (en porcentaje)
      const offsetX = (transform.x / 100) * (W / 2);
      const offsetY = (transform.y / 100) * (H / 2);
      ctx.translate(offsetX, offsetY);

      // Escala
      ctx.scale(transform.scale, transform.scale);

      // Rotación
      ctx.rotate((transform.rotation * Math.PI) / 180);

      // Flip
      ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

      // Dibujar cubriendo todo el canvas (object-fit: cover)
      const imgAspect = userImg.width / userImg.height;
      const canvasAspect = W / H;
      let drawW: number, drawH: number;

      if (imgAspect > canvasAspect) {
        drawH = H;
        drawW = H * imgAspect;
      } else {
        drawW = W;
        drawH = W / imgAspect;
      }

      ctx.drawImage(userImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // ============================================================
    // PASO 3: Fondo blanco DETRÁS de todo
    // Rellena cualquier zona que aún sea transparente
    // ============================================================
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Restaurar operación por defecto
    ctx.globalCompositeOperation = 'source-over';
  }, [mockupImg, userImg, transform]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-1 sm:p-2 select-none">
      {/* Canvas de composición — más grande */}
      <div className="relative flex items-center justify-center w-full max-w-[540px] sm:max-w-[600px]">
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]"
          style={{
            maxWidth: '600px',
            imageRendering: 'auto',
          }}
        />

        {/* Indicador de "sin imagen" */}
        {!uploadedImage && mockupImg && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-4 text-center border border-white/10">
              <p className="text-sm font-semibold text-white/90">Subí tu diseño</p>
              <p className="text-xs text-white/50 mt-1">para ver la previsualización</p>
            </div>
          </div>
        )}

        {/* Loading del mockup */}
        {!mockupImg && (
          <div className="w-full aspect-square flex items-center justify-center bg-surface-muted/30 rounded-2xl">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-brand/50 border-t-brand rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Cargando maqueta...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
