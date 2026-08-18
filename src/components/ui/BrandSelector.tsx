import React from 'react';
import { BrandId } from '../../types/customizer';
import { BRANDS_DATA } from '../../config/devices';

interface BrandSelectorProps {
  selectedBrand: BrandId;
  onSelectBrand: (brand: BrandId) => void;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  selectedBrand,
  onSelectBrand,
}) => {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        1. Selecciona la marca
      </label>
      <div className="grid grid-cols-2 gap-2 bg-surface-muted/70 p-1 rounded-xl border border-surface-border">
        {BRANDS_DATA.map((brand) => {
          const isActive = selectedBrand === brand.id;
          return (
            <button
              key={brand.id}
              onClick={() => onSelectBrand(brand.id)}
              className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? 'bg-brand text-white shadow-md shadow-brand/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-surface-hover/50'
              }`}
            >
              {brand.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
