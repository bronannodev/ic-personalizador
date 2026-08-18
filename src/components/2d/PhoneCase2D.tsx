import React, { useRef, useState, useCallback } from 'react';
import { DeviceConfig, CaseStyle, ImageTransform } from '../../types/customizer';
import { ImagePlus } from 'lucide-react';

interface PhoneCase2DProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  transform: ImageTransform;
  onUpdateTransform?: (updates: Partial<ImageTransform>) => void;
  showGuides?: boolean;
}

export const PhoneCase2D: React.FC<PhoneCase2DProps> = ({
  device,
  caseStyle,
  uploadedImage,
  transform,
  onUpdateTransform,
  showGuides = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; initX: number; initY: number }>({
    x: 0,
    y: 0,
    initX: 0,
    initY: 0,
  });

  const [isInteracting, setIsInteracting] = useState(false);

  // Dimensiones reales en mm
  const realWidth = device.dimensions.realWidthMm || device.dimensions.width * 25.4;
  const realHeight = device.dimensions.realHeightMm || device.dimensions.height * 25.4;
  const widthRatio = realWidth / realHeight;

  // Fondo de la funda
  const isTransparent = caseStyle.transmission > 0.5;
  const bgColor = isTransparent ? 'rgba(255, 255, 255, 0.12)' : caseStyle.color;

  // Handlers para arrastrar la imagen directamente sobre el lienzo
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!uploadedImage || !onUpdateTransform) return;
      isDraggingRef.current = true;
      setIsInteracting(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initX: transform.x,
        initY: transform.y,
      };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [uploadedImage, transform.x, transform.y, onUpdateTransform]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || !onUpdateTransform || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const percentX = (deltaX / (rect.width / 2)) * 50;
      const percentY = (deltaY / (rect.height / 2)) * 50;

      const newX = Math.max(-100, Math.min(100, dragStartRef.current.initX + percentX));
      const newY = Math.max(-100, Math.min(100, dragStartRef.current.initY + percentY));

      onUpdateTransform({ x: Math.round(newX), y: Math.round(newY) });
    },
    [onUpdateTransform]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      isDraggingRef.current = false;
      setIsInteracting(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Ignored
      }
    },
    []
  );

  // Zoom con rueda del ratón
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!uploadedImage || !onUpdateTransform) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newScale = Math.max(0.3, Math.min(3.0, Number((transform.scale + delta).toFixed(2))));
      onUpdateTransform({ scale: newScale });
    },
    [uploadedImage, transform.scale, onUpdateTransform]
  );

  // Radio de curvatura proporcional a las esquinas
  const cornerRadiusPx = Math.round(device.dimensions.cornerRadius * 60);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-2 sm:p-4 select-none">
      {/* Texto de guía superior */}
      {showGuides && (
        <div className="mb-3 text-center pointer-events-none px-4">
          <p className="text-xs text-slate-300/90 font-medium tracking-tight">
            Para lograr una cobertura total, rellena el rectángulo completo (área segura y bordes)
          </p>
        </div>
      )}

      {/* Contenedor central del lienzo con proporciones exactas en mm */}
      <div className="relative flex items-center justify-center h-[72%] max-h-[380px] sm:max-h-[480px]">
        {/* ========================================================================= */}
        {/* ZONA DE COBERTURA TOTAL Y SANGRÍA (Rectángulo exterior rayado)            */}
        {/* ========================================================================= */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className={`relative flex items-center justify-center h-full transition-shadow duration-200 ${
            uploadedImage ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          style={{
            aspectRatio: `${widthRatio}`,
          }}
        >
          {/* Franja de sangría superior rayada */}
          <div className="absolute -top-4 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#474b59,#474b59_7px,#2c2f38_7px,#2c2f38_14px)] opacity-75 rounded-t-sm pointer-events-none border-t border-x border-white/20" />

          {/* Franja de sangría inferior rayada */}
          <div className="absolute -bottom-4 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#474b59,#474b59_7px,#2c2f38_7px,#2c2f38_14px)] opacity-75 rounded-b-sm pointer-events-none border-b border-x border-white/20" />

          {/* ========================================================================= */}
          {/* CUERPO DE LA FUNDA (Silhouette & Printable Canvas)                        */}
          {/* ========================================================================= */}
          <div
            className="relative w-full h-full overflow-hidden shadow-2xl transition-all duration-300 border border-white/30"
            style={{
              borderRadius: `${cornerRadiusPx}px`,
              backgroundColor: bgColor,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 2px rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* CAPA DE IMAGEN SUBIDA */}
            {uploadedImage ? (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                <img
                  src={uploadedImage}
                  alt="Diseño personalizado"
                  className="max-w-none transition-transform duration-75 origin-center will-change-transform"
                  style={{
                    transform: `translate(${transform.x}%, ${transform.y}%) scale(${
                      transform.scale
                    }) rotate(${transform.rotation}deg) scaleX(${
                      transform.flipH ? -1 : 1
                    }) scaleY(${transform.flipV ? -1 : 1})`,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400/60 pointer-events-none">
                <div className="w-full h-full border border-dashed border-white/20 rounded-[inherit] flex flex-col items-center justify-center p-4">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <ImagePlus className="w-4 h-4 text-slate-300" />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Cargar Diseño
                  </span>
                  <span className="text-[11px] text-slate-400 max-w-[170px]">
                    Subí tu foto o diseño desde el menú
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* RECORTE EXACTO DEL MÓDULO DE CÁMARAS (Basado en dimensiones milimétricas) */}
            {/* ========================================================================= */}
            <CameraCutoutHole device={device} />

            {/* ========================================================================= */}
            {/* LÍNEA DE PUNTOS: ÁREA SEGURA DE IMPRESIÓN (Safe Zone)                    */}
            {/* ========================================================================= */}
            {showGuides && (
              <div
                className="absolute inset-[12px] sm:inset-[14px] border-2 border-dashed border-white/50 pointer-events-none transition-opacity duration-200"
                style={{
                  borderRadius: `${Math.max(8, cornerRadiusPx - 10)}px`,
                  opacity: isInteracting ? 0.95 : 0.7,
                }}
              />
            )}

            {/* Bisel del borde exterior */}
            <div
              className="absolute inset-0 border-[2px] border-white/20 pointer-events-none"
              style={{
                borderRadius: `${cornerRadiusPx}px`,
              }}
            />
          </div>
        </div>

        {/* Indicador de llamada lateral: "Área segura de impresión" */}
        {showGuides && (
          <div className="absolute -left-32 sm:-left-40 top-1/2 -translate-y-1/2 flex items-center space-x-2 pointer-events-none hidden xs:flex">
            <span className="text-[11px] font-medium text-slate-300 text-right leading-tight max-w-[80px]">
              Área segura de impresión
            </span>
            <div className="w-8 sm:w-12 border-t border-dashed border-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE DEL RECORTE DE CÁMARA (Cálculo exacto en milímetros)
// ============================================================================
const CameraCutoutHole: React.FC<{ device: DeviceConfig }> = ({ device }) => {
  const camera = device.camera;
  const realWidth = device.dimensions.realWidthMm || 75;
  const realHeight = device.dimensions.realHeightMm || 150;

  // Si tenemos dimensiones exactas en mm de dimsensiones.md, calculamos porcentajes exactos
  let leftPercent = 6.5;
  let topPercent = 4.5;
  let widthPercent = 40.0;
  let heightPercent = 25.0;
  let radiusPercent = 22;

  if (camera.moduleX && camera.moduleY && camera.moduleWidth && camera.moduleHeight) {
    leftPercent = (camera.moduleX / realWidth) * 100;
    topPercent = (camera.moduleY / realHeight) * 100;
    widthPercent = (camera.moduleWidth / realWidth) * 100;
    heightPercent = (camera.moduleHeight / realHeight) * 100;
    if (camera.moduleRadius) {
      radiusPercent = (camera.moduleRadius / camera.moduleWidth) * 100;
    }
  } else {
    // Fallback según tipo de cámara
    const type = camera.type;
    if (type === 'triple-pro-large') {
      leftPercent = 6.5;
      topPercent = 4.5;
      widthPercent = 44;
      heightPercent = 27;
      radiusPercent = 22;
    } else if (type === 'diagonal-dual') {
      leftPercent = 7.5;
      topPercent = 4.8;
      widthPercent = 38;
      heightPercent = 22;
      radiusPercent = 22;
    } else if (type === 'vertical-pill-modern') {
      leftPercent = 8.5;
      topPercent = 4.8;
      widthPercent = 28;
      heightPercent = 24;
      radiusPercent = 35;
    }
  }

  return (
    <div
      className="absolute z-20 pointer-events-none shadow-lg transition-all"
      style={{
        top: `${topPercent}%`,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
      }}
    >
      {/* Bloque gris exacto con bordes redondeados y bisel suave */}
      <div
        className="w-full h-full bg-[#7d828f] border border-[#616673] shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] relative overflow-hidden"
        style={{
          borderRadius: `${radiusPercent}%`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/15 pointer-events-none" />
      </div>
    </div>
  );
};
