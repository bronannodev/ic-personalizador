import React from 'react';
import {
  Move,
  RotateCw,
  Maximize2,
  AlignCenter,
  FlipHorizontal,
  Trash2,
  Info,
} from 'lucide-react';
import { DeviceConfig, ImageMetadata, ImageTransform } from '../../types/customizer';

interface DesignToolbarProps {
  device: DeviceConfig;
  uploadedImage: string | null;
  imageMetadata: ImageMetadata | null;
  transform: ImageTransform;
  onRotate90: () => void;
  onFlipH: () => void;
  onCenter: () => void;
  onFitFull: () => void;
  onRemove: () => void;
  onToggleTransformPanel: () => void;
  isTransformPanelOpen: boolean;
}

export const DesignToolbar: React.FC<DesignToolbarProps> = ({
  device,
  uploadedImage,
  imageMetadata,
  transform,
  onRotate90,
  onFlipH,
  onCenter,
  onFitFull,
  onRemove,
  onToggleTransformPanel,
  isTransformPanelOpen,
}) => {
  if (!uploadedImage) return null;

  const qualityBadgeColor =
    imageMetadata?.quality === 'Excelente'
      ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
      : imageMetadata?.quality === 'Buena'
      ? 'text-green-400 bg-green-500/15 border-green-500/30'
      : imageMetadata?.quality === 'Aceptable'
      ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
      : 'text-rose-400 bg-rose-500/15 border-rose-500/30';

  const widthCm = ((device.dimensions.realWidthMm || 75) / 10).toFixed(2);
  const heightCm = ((device.dimensions.realHeightMm || 150) / 10).toFixed(2);

  return (
    <div className="w-full flex flex-col space-y-2 z-30 pointer-events-auto">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DE ACCIONES RÁPIDAS (Idéntica a la maqueta de referencia) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between bg-black/70 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-lg overflow-x-auto gap-1">
        <div className="flex items-center space-x-1">
          {/* Botón Transformar */}
          <button
            onClick={onToggleTransformPanel}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 ${
              isTransformPanelOpen
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Ajustar escala y rotación fina"
          >
            <Move className="w-3.5 h-3.5" />
            <span>Transformar</span>
          </button>

          {/* Botón Posición / Centrar */}
          <button
            onClick={onCenter}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1.5"
            title="Centrar en el medio de la funda"
          >
            <AlignCenter className="w-3.5 h-3.5" />
            <span>Posición</span>
          </button>

          {/* Botón Cobertura Total */}
          <button
            onClick={onFitFull}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1.5"
            title="Ajustar a cobertura total y bordes"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Ajustar</span>
          </button>

          {/* Botón Girar 90° */}
          <button
            onClick={onRotate90}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1"
            title="Girar 90 grados"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Girar</span>
          </button>

          {/* Botón Voltear Horizontal */}
          <button
            onClick={onFlipH}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1 ${
              transform.flipH
                ? 'bg-white/20 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Efecto espejo horizontal"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voltear</span>
          </button>
        </div>

        {/* Botón Eliminar Foto */}
        <button
          onClick={onRemove}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-1 flex-shrink-0"
          title="Eliminar foto"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. TARJETA DE INFORMACIÓN DEL ARCHIVO Y DPI (Estilo Imagen de Referencia)   */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between bg-black/60 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-2xl shadow-md gap-2 text-xs">
        <div className="flex items-center space-x-3">
          {/* Miniatura de la imagen subida */}
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 flex-shrink-0 bg-slate-900 shadow-sm">
            <img
              src={uploadedImage}
              alt="Miniatura"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5 text-slate-200 font-medium truncate max-w-[140px] sm:max-w-[200px]">
              <span className="text-[11px] text-slate-400">Archivo:</span>
              <span className="truncate text-white font-semibold">
                {imageMetadata?.fileName || 'foto_personalizada.jpg'}
              </span>
            </div>

            <div className="text-[10px] text-slate-400">
              Anchura: <span className="text-slate-200">{widthCm} cm</span> · Altura:{' '}
              <span className="text-slate-200">{heightCm} cm</span>
            </div>
          </div>
        </div>

        {/* Indicador de Calidad y DPI */}
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[11px] font-medium shadow-sm ${qualityBadgeColor}`}
          >
            <span>
              Calidad: <span className="font-bold">{imageMetadata?.quality || 'Buena'}</span> /{' '}
              {imageMetadata?.dpi || 280} DPI
            </span>
            <Info className="w-3 h-3 ml-0.5 opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
};
