import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  deviceName: string;
}

export const Header: React.FC<HeaderProps> = ({ deviceName }) => {
  return (
    <header className="w-full bg-surface/80 backdrop-blur-xl border-b border-surface-border sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center overflow-hidden p-1 shadow-sm">
          <img
            src="/logo.webp"
            alt="Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white">
              Personalizador 3D
            </h1>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand/10 text-brand-light border border-brand/20">
              <Sparkles className="w-2.5 h-2.5 mr-1 text-brand-light" />
              En vivo
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">
            {deviceName}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center text-xs text-slate-400 bg-surface-muted/60 px-3 py-1.5 rounded-full border border-surface-border">
        <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
        <span>Garantía de ajuste perfecto</span>
      </div>
    </header>
  );
};
