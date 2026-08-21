import React, { useState, useMemo } from 'react';
import { BrandId, DeviceConfig } from '../../types/customizer';
import { BRANDS_DATA } from '../../config/devices';
import { Check, Construction, ChevronRight, ArrowLeft, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BrandAndModelSelectorProps {
  selectedBrand: BrandId | null;
  selectedDevice: DeviceConfig | null;
  onSelectBrand: (brand: BrandId) => void;
  onSelectDevice: (device: DeviceConfig) => void;
}

export const BrandAndModelSelector: React.FC<BrandAndModelSelectorProps> = ({
  selectedBrand,
  selectedDevice,
  onSelectBrand,
  onSelectDevice,
}) => {
  const currentBrand = selectedBrand
    ? BRANDS_DATA.find((b) => b.id === selectedBrand)
    : null;

  const devices = currentBrand?.devices || [];
  const isSamsungSelected = selectedBrand === 'samsung';

  const groupedGenerations = useMemo(() => {
    const map = new Map<string, DeviceConfig[]>();
    devices.forEach((d) => {
      const gen = d.generation || 'Otros';
      if (!map.has(gen)) {
        map.set(gen, []);
      }
      map.get(gen)!.push(d);
    });
    return Array.from(map.entries()).map(([gen, items]) => ({
      name: gen,
      devices: items,
    }));
  }, [devices]);

  const [activeGenView, setActiveGenView] = useState<string | null>(null);

  return (
    <div className="w-full space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
          1. Marca
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80">
          {BRANDS_DATA.map((brand) => {
            const isSelected = selectedBrand === brand.id;
            const isSamsung = brand.id === 'samsung';

            return (
              <button
                key={brand.id}
                type="button"
                disabled={isSamsung}
                onClick={() => {
                  if (isSamsung) return;
                  onSelectBrand(brand.id);
                  setActiveGenView(null);
                }}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSamsung
                    ? 'opacity-65 cursor-not-allowed text-slate-400 bg-slate-200/40 border border-dashed border-amber-400/40'
                    : isSelected
                    ? 'bg-white text-slate-900 shadow-sm font-semibold border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title={isSamsung ? 'Samsung próximamente' : undefined}
              >
                <span>{brand.name}</span>
                {isSamsung ? (
                  <motion.div
                    animate={{ rotate: [0, -14, 14, -14, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center"
                  >
                    <Construction className="w-4 h-4 text-amber-500" />
                  </motion.div>
                ) : (
                  isSelected && <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedBrand ? (
          isSamsungSelected ? (
            <motion.div
              key="samsung-wip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-amber-500/[0.06] border border-dashed border-amber-500/30 text-center space-y-3"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Construction className="w-9 h-9 text-amber-500" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Samsung en construcción
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  Estamos calibrando los modelos Samsung. Pronto estarán disponibles.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="apple-selector"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 pt-1"
            >
              <AnimatePresence mode="wait">
                {activeGenView === null ? (
                  <motion.div
                    key="generation-list"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        2. Elegí la serie
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {groupedGenerations.length} series
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                      {groupedGenerations.map((group) => {
                        const hasSelected = group.devices.some((d) => d.id === selectedDevice?.id);
                        return (
                          <button
                            key={group.name}
                            type="button"
                            onClick={() => {
                              setActiveGenView(group.name);
                              if (!hasSelected && group.devices.length > 0) {
                                onSelectDevice(group.devices[0]);
                              }
                            }}
                            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-150 group ${
                              hasSelected
                                ? 'bg-indigo-50/90 border-indigo-400 text-indigo-950 shadow-sm'
                                : 'bg-white/80 border-slate-200/90 text-slate-700 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  hasSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-200'
                                }`}
                              >
                                <Smartphone className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 tracking-tight">
                                  {group.name}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {group.devices.length} versiones disponibles
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {hasSelected && (
                                <span className="text-[11px] font-medium text-indigo-600 hidden xs:inline">
                                  {selectedDevice?.name}
                                </span>
                              )}
                              <ChevronRight
                                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                                  hasSelected ? 'text-indigo-600' : 'text-slate-400'
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`version-list-${activeGenView}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveGenView(null)}
                        className="flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-medium py-1 px-1.5 -ml-1 rounded-lg hover:bg-indigo-50"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Cambiar de serie</span>
                      </button>

                      <span className="text-xs font-semibold text-slate-700">
                        {activeGenView}
                      </span>
                    </div>

                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                      3. Elegí la versión exacta
                    </label>

                    <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                      {groupedGenerations
                        .find((g) => g.name === activeGenView)
                        ?.devices.map((device) => {
                          const isSelected = selectedDevice?.id === device.id;
                          return (
                            <button
                              key={device.id}
                              type="button"
                              onClick={() => onSelectDevice(device)}
                              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-150 ${
                                isSelected
                                  ? 'bg-indigo-50/90 border-indigo-400 text-indigo-950 shadow-sm'
                                  : 'bg-white/80 border-slate-200/90 text-slate-700 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${
                                    isSelected
                                      ? 'bg-indigo-600 ring-4 ring-indigo-500/20'
                                      : 'bg-slate-300'
                                  }`}
                                />
                                <div>
                                  <p
                                    className={`text-xs sm:text-sm font-medium transition-colors ${
                                      isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'
                                    }`}
                                  >
                                    {device.name}
                                  </p>
                                  {device.dimensions.realWidthMm && (
                                    <p className="text-[10px] text-slate-400">
                                      {device.dimensions.realWidthMm} × {device.dimensions.realHeightMm} mm
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Seleccionar</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        ) : (
          <div className="p-4 rounded-2xl bg-slate-100/80 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            Seleccioná una marca arriba para ver los modelos disponibles
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
