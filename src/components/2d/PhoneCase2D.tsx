import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DeviceConfig, CaseStyle, ImageTransform } from '../../types/customizer';
import { ImagePlus, Sparkles } from 'lucide-react';
import { preloadMockup, getCachedMockup, MockupData } from '../../utils/caseRenderer';

interface PhoneCase2DProps {
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  transform: ImageTransform;
  onUpdateTransform?: (updates: Partial<ImageTransform>) => void;
  onUploadClick?: () => void;
  showGuides?: boolean;
}

export const PhoneCase2D: React.FC<PhoneCase2DProps> = ({
  device,
  caseStyle,
  uploadedImage,
  transform,
  onUpdateTransform,
  onUploadClick,
  showGuides = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerImgRef = useRef<HTMLImageElement>(null);
  const outerImgRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; initX: number; initY: number }>({
    x: 0,
    y: 0,
    initX: 0,
    initY: 0,
  });

  const curPosRef = useRef<{ x: number; y: number }>({ x: transform.x, y: transform.y });
  const rafRef = useRef<number | null>(null);

  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchScaleRef = useRef<number>(1.0);

  const [isInteracting, setIsInteracting] = useState(false);

  // Mockup fotográfico del dispositivo (para posicionar el diseño dentro de la
  // ventana real de la funda, igual que el render final).
  const [mockup, setMockup] = useState<MockupData | null>(
    () => getCachedMockup(device.mockupImagePath)
  );

  useEffect(() => {
    let active = true;
    setMockup(getCachedMockup(device.mockupImagePath));
    if (device.mockupImagePath) {
      preloadMockup(device.mockupImagePath).then((data) => {
        if (active) setMockup(data);
      });
    }
    return () => {
      active = false;
    };
  }, [device.mockupImagePath]);

  const usePhoto = !!mockup && mockup.hasWindow && !!mockup.window;

  // Fracción del contenedor que ocupa la ventana del diseño (para convertir el
  // arrastre en píxeles a porcentaje relativo a la ventana).
  const windowFracRef = useRef<{ w: number; h: number }>({ w: 1, h: 1 });
  useEffect(() => {
    if (usePhoto && mockup?.window) {
      windowFracRef.current = {
        w: mockup.window.w / mockup.naturalWidth,
        h: mockup.window.h / mockup.naturalHeight,
      };
    } else {
      windowFracRef.current = { w: 1, h: 1 };
    }
  }, [usePhoto, mockup]);

  useEffect(() => {
    curPosRef.current = { x: transform.x, y: transform.y };
  }, [transform.x, transform.y]);

  const realWidth = device.dimensions.realWidthMm || device.dimensions.width * 25.4;
  const realHeight = device.dimensions.realHeightMm || device.dimensions.height * 25.4;
  const widthRatio = realWidth / realHeight;

  const isTransparent = caseStyle.transmission > 0.5;
  const bgColor = isTransparent ? 'rgba(255, 255, 255, 0.12)' : caseStyle.color;

  const updateImgStyle = (x: number, y: number, scale: number) => {
    const transformStr = `translate3d(${x}%, ${y}%, 0) scale(${scale}) rotate(${
      transform.rotation
    }deg) scaleX(${transform.flipH ? -1 : 1}) scaleY(${transform.flipV ? -1 : 1})`;

    if (innerImgRef.current) {
      innerImgRef.current.style.transform = transformStr;
    }
    if (outerImgRef.current) {
      outerImgRef.current.style.transform = transformStr;
    }
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!uploadedImage) {
        onUploadClick?.();
        return;
      }
      if (!onUpdateTransform) return;
      isDraggingRef.current = true;
      setIsInteracting(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initX: curPosRef.current.x,
        initY: curPosRef.current.y,
      };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [uploadedImage, onUpdateTransform, onUploadClick]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // El desplazamiento es porcentual respecto a la VENTANA del diseño, que
      // ocupa una fracción del contenedor (en modo foto). En modo vectorial la
      // fracción es 1 (todo el contenedor).
      const frac = windowFracRef.current;
      const percentX = (deltaX / (rect.width * frac.w)) * 100;
      const percentY = (deltaY / (rect.height * frac.h)) * 100;

      const newX = Math.max(-150, Math.min(150, dragStartRef.current.initX + percentX));
      const newY = Math.max(-150, Math.min(150, dragStartRef.current.initY + percentY));

      curPosRef.current = { x: newX, y: newY };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateImgStyle(newX, newY, transform.scale);
      });
    },
    [transform.scale, transform.rotation, transform.flipH, transform.flipV]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsInteracting(false);
        if (onUpdateTransform) {
          onUpdateTransform({
            x: Math.round(curPosRef.current.x),
            y: Math.round(curPosRef.current.y),
          });
        }
      }
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    },
    [onUpdateTransform]
  );

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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && uploadedImage && onUpdateTransform) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialPinchDistRef.current = dist;
        initialPinchScaleRef.current = transform.scale;
      }
    },
    [uploadedImage, transform.scale, onUpdateTransform]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        e.touches.length === 2 &&
        initialPinchDistRef.current !== null &&
        uploadedImage &&
        onUpdateTransform
      ) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const factor = dist / initialPinchDistRef.current;
        const newScale = Math.max(
          0.3,
          Math.min(3.0, Number((initialPinchScaleRef.current * factor).toFixed(2)))
        );
        onUpdateTransform({ scale: newScale });
      }
    },
    [uploadedImage, onUpdateTransform]
  );

  const handleTouchEnd = useCallback(() => {
    initialPinchDistRef.current = null;
  }, []);

  const imgTransformStr = `translate3d(${transform.x}%, ${transform.y}%, 0) scale(${
    transform.scale
  }) rotate(${transform.rotation}deg) scaleX(${transform.flipH ? -1 : 1}) scaleY(${
    transform.flipV ? -1 : 1
  })`;

  /* ======================================================================= */
  /* MODO FOTOGRÁFICO: usa el PNG real de la funda con el diseño incrustado.  */
  /* ======================================================================= */
  if (usePhoto && mockup && mockup.window) {
    const mockAspect = mockup.naturalWidth / mockup.naturalHeight;
    const win = mockup.window;
    const winLeft = (win.x / mockup.naturalWidth) * 100;
    const winTop = (win.y / mockup.naturalHeight) * 100;
    const winW = (win.w / mockup.naturalWidth) * 100;
    const winH = (win.h / mockup.naturalHeight) * 100;

    return (
      <div
        className="relative flex flex-col items-center justify-center w-full h-full select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative flex items-center justify-center h-[76vh] sm:h-[78vh] md:h-[82vh] max-h-[680px] w-full py-1">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className={`relative h-full touch-none ${
              uploadedImage ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
            }`}
            style={{ aspectRatio: `${mockAspect}`, maxHeight: '100%' }}
          >
            {/* Ventana del diseño: la imagen del cliente recortada al hueco real */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: `${winLeft}%`,
                top: `${winTop}%`,
                width: `${winW}%`,
                height: `${winH}%`,
              }}
            >
              {uploadedImage ? (
                <img
                  ref={innerImgRef}
                  src={uploadedImage}
                  alt="Diseño en funda"
                  className="max-w-none max-h-none origin-center will-change-transform pointer-events-none"
                  style={{
                    transform: imgTransformStr,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-600 bg-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 text-indigo-600 border border-indigo-500/30 flex items-center justify-center mb-2 shadow">
                    <ImagePlus className="w-6 h-6" />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Subir foto
                  </span>
                </div>
              )}
            </div>

            {/* Foto real de la funda POR ENCIMA (marco, cámara, sombras reales) */}
            <img
              src={mockup.src}
              alt={`Funda ${device.name}`}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_25px_45px_rgba(0,0,0,0.6)]"
              draggable={false}
            />

            {/* Guía de área segura dentro de la ventana */}
            {showGuides && uploadedImage && (
              <div
                className="absolute border-2 border-dashed border-white/60 pointer-events-none rounded-lg transition-opacity duration-200"
                style={{
                  left: `${winLeft}%`,
                  top: `${winTop}%`,
                  width: `${winW}%`,
                  height: `${winH}%`,
                  opacity: isInteracting ? 0.9 : 0,
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================================= */
  /* MODO VECTORIAL (fallback): mockups sin ventana transparente utilizable.  */
  /* ======================================================================= */
  const cornerRadiusPx = Math.round(device.dimensions.cornerRadius * 60);

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-full select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative flex items-center justify-center h-[76vh] sm:h-[78vh] md:h-[82vh] max-h-[660px] w-full py-1">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className={`relative flex items-center justify-center h-full touch-none ${
            uploadedImage ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          }`}
          style={{
            aspectRatio: `${widthRatio}`,
            maxHeight: '100%',
          }}
        >
          {uploadedImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img
                ref={outerImgRef}
                src={uploadedImage}
                alt="Vista completa exterior"
                className="max-w-none max-h-none origin-center opacity-30 brightness-[0.4] saturate-50 will-change-transform pointer-events-none"
                  style={{
                    transform: imgTransformStr,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  draggable={false}
                />
            </div>
          )}

          <div className="absolute -top-3.5 left-0 right-0 h-3.5 bg-[repeating-linear-gradient(45deg,#474b59,#474b59_7px,#2c2f38_7px,#2c2f38_14px)] opacity-60 rounded-t-sm pointer-events-none border-t border-x border-white/20 z-20" />
          <div className="absolute -bottom-3.5 left-0 right-0 h-3.5 bg-[repeating-linear-gradient(45deg,#474b59,#474b59_7px,#2c2f38_7px,#2c2f38_14px)] opacity-60 rounded-b-sm pointer-events-none border-b border-x border-white/20 z-20" />

          <div
            className="relative w-full h-full overflow-hidden shadow-2xl transition-all duration-200 border border-white/40 z-10"
            style={{
              borderRadius: `${cornerRadiusPx}px`,
              backgroundColor: bgColor,
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 2px rgba(255, 255, 255, 0.2)',
            }}
          >
            {uploadedImage ? (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                <img
                  ref={innerImgRef}
                  src={uploadedImage}
                  alt="Diseño en funda"
                  className="max-w-none max-h-none origin-center will-change-transform pointer-events-none"
                  style={{
                    transform: imgTransformStr,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  draggable={false}
                />
              </div>
            ) : (
              <div
                onClick={onUploadClick}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-300 group hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-full h-full border-2 border-dashed border-indigo-400/40 group-hover:border-indigo-400/80 rounded-[inherit] flex flex-col items-center justify-center p-4 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                    <ImagePlus className="w-7 h-7" />
                  </div>
                  <span className="text-sm uppercase tracking-wider font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Subir foto o diseño
                  </span>
                  <span className="text-xs text-slate-400 max-w-[200px]">
                    Toca aquí para elegir tu imagen
                  </span>
                </div>
              </div>
            )}

            <CameraCutoutHole device={device} />

            {showGuides && (
              <div
                className="absolute inset-[12px] sm:inset-[14px] border-2 border-dashed border-white/50 pointer-events-none transition-opacity duration-200 z-10"
                style={{
                  borderRadius: `${Math.max(8, cornerRadiusPx - 10)}px`,
                  opacity: isInteracting ? 0.95 : 0.65,
                }}
              />
            )}

            <div
              className="absolute inset-0 border-[2px] border-white/20 pointer-events-none z-10"
              style={{
                borderRadius: `${cornerRadiusPx}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CameraCutoutHole: React.FC<{ device: DeviceConfig }> = ({ device }) => {
  const camera = device.camera;
  const realWidth = device.dimensions.realWidthMm || 75;
  const realHeight = device.dimensions.realHeightMm || 150;

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
