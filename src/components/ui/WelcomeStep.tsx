import React, { useState } from 'react';
import { BrandId, DeviceConfig } from '../../types/customizer';
import { BRANDS_DATA } from '../../config/devices';
import { ArrowRight, Search, Check } from 'lucide-react';

interface WelcomeStepProps {
  selectedBrand: BrandId;
  selectedDevice: DeviceConfig;
  onSelectBrand: (brand: BrandId) => void;
  onSelectDevice: (device: DeviceConfig) => void;
  onNextStep: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  selectedBrand,
  selectedDevice,
  onSelectBrand,
  onSelectDevice,
  onNextStep,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const currentBrand = BRANDS_DATA.find((b) => b.id === selectedBrand);
  const devices = currentBrand?.devices || [];

  const filteredDevices = devices.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 sm:py-12 flex flex-col justify-between min-h-screen">
      <div className="space-y-6">
        {/* Encabezado minimalista con logo blanco sin caja */}
        <div className="text-center space-y-3 pt-2 flex flex-col items-center">
          <img
            src="/logo.webp"
            alt="Logo"
            className="h-10 sm:h-12 w-auto object-contain brightness-0 invert opacity-95 mb-2 hover:opacity-100 transition-opacity"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Personalizá tu funda
            </h1>
            <p className="text-sm text-slate-400 max-w-sm mx-auto font-normal mt-1">
              Elegí tu modelo de celular para probar tu foto o diseño sobre la funda real.
            </p>
          </div>
        </div>

        {/* Selector de marca tipo Glass iOS */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Marca
          </label>
          <div className="grid grid-cols-2 gap-2 bg-white/[0.04] p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
            {BRANDS_DATA.map((brand) => {
              const isSelected = selectedBrand === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => onSelectBrand(brand.id)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-white/15 text-white shadow-sm border border-white/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {brand.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buscador de modelos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Modelo ({currentBrand?.name})
            </label>
            <span className="text-xs text-slate-500">
              {filteredDevices.length} disponibles
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Grilla de modelos estilo iOS */}
          <div className="grid grid-cols-1 gap-2 max-h-[42vh] overflow-y-auto pr-1">
            {filteredDevices.map((device) => {
              const isSelected = selectedDevice.id === device.id;
              return (
                <button
                  key={device.id}
                  onClick={() => onSelectDevice(device)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${
                        isSelected
                          ? 'bg-indigo-400 ring-4 ring-indigo-500/20'
                          : 'bg-white/25'
                      }`}
                    />
                    <div>
                      <div className={`text-sm font-medium ${isSelected ? 'text-white font-semibold' : 'text-slate-300'}`}>
                        {device.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {device.brand === 'apple' ? 'iPhone Series' : 'Galaxy Series'}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    device.badge && (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10">
                        {device.badge}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Botón continuar fijo / sticky en la base */}
      <div className="pt-6">
        <button
          onClick={onNextStep}
          className="w-full py-4 px-6 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.99] font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-xl shadow-white/10 transition-all"
        >
          <span>Personalizar {selectedDevice.name}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
