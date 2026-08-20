import React from 'react';
import { ImageTransform } from '../../types/customizer';
import {
  ZoomIn,
  RotateCw,
  Move,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
} from 'lucide-react';

interface TransformControlsProps {
  transform: ImageTransform;
  onUpdateTransform: (updates: Partial<ImageTransform>) => void;
  onRotate90: () => void;
  onReset: () => void;
  onClose?: () => void;
}

export const TransformControls: React.FC<TransformControlsProps> = ({
  transform,
  onUpdateTransform,
  onRotate90,
  onReset,
  onClose,
}) => {
  return (
    <div className="w-full space-y-3 bg-[#0d0f17]/95 border border-white/15 rounded-3xl p-4 sm:p-5 backdrop-blur-2xl shadow-2xl">
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <span className="text-xs font-semibold text-white flex items-center gap-1.5">
          <Move className="w-4 h-4 text-indigo-400" />
          Ajustes de imagen
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="text-[11px] font-medium text-slate-300 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 transition-all"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span>Restablecer</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center">
            <ZoomIn className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Zoom / Escala
          </span>
          <span className="font-mono text-indigo-300 font-semibold text-xs">
            {Math.round(transform.scale * 100)}%
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() =>
              onUpdateTransform({
                scale: Math.max(0.3, Number((transform.scale - 0.1).toFixed(2))),
              })
            }
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/15 active:scale-95 border border-white/10 flex items-center justify-center text-slate-300 text-xs flex-shrink-0 transition-all"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="0.3"
            max="3.0"
            step="0.05"
            value={transform.scale}
            onChange={(e) =>
              onUpdateTransform({ scale: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <button
            type="button"
            onClick={() =>
              onUpdateTransform({
                scale: Math.min(3.0, Number((transform.scale + 0.1).toFixed(2))),
              })
            }
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/15 active:scale-95 border border-white/10 flex items-center justify-center text-slate-300 text-xs flex-shrink-0 transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center">
            <RotateCw className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Rotación
          </span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-indigo-300 font-semibold text-xs">
              {transform.rotation}°
            </span>
            <button
              type="button"
              onClick={onRotate90}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/70 border border-indigo-500/50 text-indigo-200 font-medium transition-colors"
            >
              +90°
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={transform.rotation}
          onChange={(e) =>
            onUpdateTransform({ rotation: parseInt(e.target.value, 10) })
          }
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Posición X</span>
            <span className="font-mono text-slate-400">{transform.x}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={transform.x}
            onChange={(e) =>
              onUpdateTransform({ x: parseInt(e.target.value, 10) })
            }
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Posición Y</span>
            <span className="font-mono text-slate-400">{transform.y}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={transform.y}
            onChange={(e) =>
              onUpdateTransform({ y: parseInt(e.target.value, 10) })
            }
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
