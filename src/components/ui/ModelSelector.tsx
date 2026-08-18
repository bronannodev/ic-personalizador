import React from 'react';
import { DeviceConfig } from '../../types/customizer';
import { BRANDS_DATA } from '../../config/devices';
import { Check } from 'lucide-react';

interface ModelSelectorProps {
  selectedBrandId: string;
  selectedDevice: DeviceConfig;
  onSelectDevice: (device: DeviceConfig) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedBrandId,
  selectedDevice,
  onSelectDevice,
}) => {
  const currentBrand = BRANDS_DATA.find((b) => b.id === selectedBrandId);
  const devices = currentBrand?.devices || [];

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        2. Selecciona tu modelo
      </label>
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {devices.map((device) => {
          const isSelected = selectedDevice.id === device.id;
          return (
            <button
              key={device.id}
              onClick={() => onSelectDevice(device)}
              className={`flex-shrink-0 snap-start px-3.5 py-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between min-w-[130px] sm:min-w-[150px] relative ${
                isSelected
                  ? 'bg-brand/15 border-brand text-white shadow-sm'
                  : 'bg-surface-muted/40 border-surface-border text-slate-300 hover:border-slate-600 hover:bg-surface-muted'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    isSelected
                      ? 'bg-indigo-400 ring-4 ring-indigo-500/20'
                      : 'bg-white/25'
                  }`}
                />
                {device.badge && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {device.badge}
                  </span>
                )}
                {isSelected && !device.badge && (
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium tracking-tight">
                {device.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
