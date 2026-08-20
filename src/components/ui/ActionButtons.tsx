import React from 'react';
import { Smartphone, Palette, Sparkles } from 'lucide-react';

interface ActionButtonsProps {
  activeTab: 'device' | 'design' | 'style';
  onTabChange: (tab: 'device' | 'design' | 'style') => void;
  onOpenOrderModal: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  activeTab,
  onTabChange,
  onOpenOrderModal,
}) => {
  return (
    <div className="w-full bg-surface/90 backdrop-blur-xl border-t border-surface-border p-3 flex flex-col gap-2">
      <button
        onClick={onOpenOrderModal}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand to-indigo-600 hover:from-brand-hover hover:to-indigo-500 active:scale-[0.99] text-white font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg shadow-brand/25 transition-all"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Quiero esta funda</span>
      </button>

      <div className="grid grid-cols-3 gap-1 bg-surface-muted/60 p-1 rounded-xl border border-surface-border">
        <button
          onClick={() => onTabChange('device')}
          className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'device'
              ? 'bg-surface text-white shadow-sm border border-surface-border font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Celular</span>
        </button>

        <button
          onClick={() => onTabChange('design')}
          className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'design'
              ? 'bg-surface text-white shadow-sm border border-surface-border font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diseño</span>
        </button>

        <button
          onClick={() => onTabChange('style')}
          className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'style'
              ? 'bg-surface text-white shadow-sm border border-surface-border font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Funda</span>
        </button>
      </div>
    </div>
  );
};
