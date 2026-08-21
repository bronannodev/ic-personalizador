import React from 'react';
import {
  Move,
  RotateCw,
  Maximize2,
  AlignCenter,
  FlipHorizontal,
  Trash2,
  UploadCloud,
  CheckCircle2,
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
  onChangePhotoClick?: () => void;
  isTransformPanelOpen: boolean;
}

export const DesignToolbar: React.FC<DesignToolbarProps> = ({
  uploadedImage,
  imageMetadata,
  transform,
  onRotate90,
  onFlipH,
  onCenter,
  onFitFull,
  onRemove,
  onToggleTransformPanel,
  onChangePhotoClick,
  isTransformPanelOpen,
}) => {
  if (!uploadedImage) return null;

  return (
    <div className="w-full flex flex-col items-center space-y-2 pointer-events-auto">
      {/* Barra de herramientas flotante de vidrio */}
      <div className="w-full max-w-md flex items-center justify-between bg-white/90 backdrop-blur-2xl border border-slate-200/90 p-1 rounded-xl shadow-xl gap-1">
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5 scrollbar-none w-full justify-around sm:justify-start">
          {/* Ajustar / Transformar */}
          <button
            type="button"
            onClick={onToggleTransformPanel}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              isTransformPanelOpen
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95'
            }`}
            title="Ajustar zoom y rotación"
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Ajustar</span>
          </button>

          {/* Centrar */}
          <button
            type="button"
            onClick={onCenter}
            className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all flex items-center space-x-1 flex-shrink-0"
            title="Centrar"
          >
            <AlignCenter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Centrar</span>
          </button>

          {/* Cobertura total */}
          <button
            type="button"
            onClick={onFitFull}
            className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all flex items-center space-x-1 flex-shrink-0"
            title="Ajustar a la funda completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Llenar</span>
          </button>

          {/* Girar 90° */}
          <button
            type="button"
            onClick={onRotate90}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all flex items-center space-x-1 flex-shrink-0"
            title="Girar 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Espejo / Flip */}
          <button
            type="button"
            onClick={onFlipH}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 flex-shrink-0 ${
              transform.flipH
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95'
            }`}
            title="Efecto espejo"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Cambiar foto */}
          {onChangePhotoClick && (
            <button
              type="button"
              onClick={onChangePhotoClick}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all flex items-center space-x-1 flex-shrink-0"
              title="Cambiar foto"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          )}

          {/* Eliminar foto */}
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all flex-shrink-0"
            title="Eliminar foto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pill informativa discreta sobre la calidad */}
      {imageMetadata && (
        <div className="flex items-center gap-2 text-[10px] text-slate-600 bg-white/80 backdrop-blur-md px-3 py-0.5 rounded-md border border-slate-200/80 shadow-xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Calidad: <strong className="text-slate-800">{imageMetadata.quality}</strong> ({imageMetadata.dpi} DPI)</span>
        </div>
      )}
    </div>
  );
};
