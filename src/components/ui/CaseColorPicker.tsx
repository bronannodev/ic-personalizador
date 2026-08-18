import React from 'react';
import { CaseStyle } from '../../types/customizer';
import { CASE_STYLES } from '../../config/devices';
import { Check } from 'lucide-react';

interface CaseColorPickerProps {
  selectedStyle: CaseStyle;
  onSelectStyle: (style: CaseStyle) => void;
}

export const CaseColorPicker: React.FC<CaseColorPickerProps> = ({
  selectedStyle,
  onSelectStyle,
}) => {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Material y acabado de la funda
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CASE_STYLES.map((style: CaseStyle) => {
          const isSelected = selectedStyle.id === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style)}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 ${
                isSelected
                  ? 'bg-brand/15 border-brand text-white shadow-sm'
                  : 'bg-surface-muted/40 border-surface-border text-slate-300 hover:bg-surface-muted hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-full border border-white/20 shadow-inner flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: style.color,
                    boxShadow:
                      style.transmission > 0.5
                        ? 'inset 0 0 4px rgba(255,255,255,0.8)'
                        : undefined,
                  }}
                />
                <span className="text-xs font-medium tracking-tight">
                  {style.name}
                </span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-brand-light" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
