import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface ViewControlsProps {
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  isAutoRotating,
  onToggleAutoRotate,
  controlsRef,
}) => {
  const setBackView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, 0, 9.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const setIsometricView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(5.5, 3.5, 6.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const setFrontView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, 0, -9.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 bg-surface/85 backdrop-blur-md p-1.5 rounded-full border border-surface-border shadow-lg">
      <button
        onClick={setBackView}
        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-muted hover:bg-surface-hover text-slate-200 transition-colors"
        title="Vista trasera"
      >
        Atrás
      </button>
      <button
        onClick={setIsometricView}
        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-muted hover:bg-surface-hover text-slate-200 transition-colors"
        title="Vista 3D"
      >
        3D
      </button>
      <button
        onClick={setFrontView}
        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-muted hover:bg-surface-hover text-slate-200 transition-colors"
        title="Vista frontal"
      >
        Frente
      </button>
      <div className="w-[1px] h-3.5 bg-surface-border mx-0.5" />
      <button
        onClick={onToggleAutoRotate}
        className={`p-1.5 rounded-full transition-colors ${
          isAutoRotating
            ? 'bg-brand text-white shadow-sm'
            : 'bg-surface-muted hover:bg-surface-hover text-slate-300'
        }`}
        title={isAutoRotating ? 'Pausar' : 'Girar'}
      >
        {isAutoRotating ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
