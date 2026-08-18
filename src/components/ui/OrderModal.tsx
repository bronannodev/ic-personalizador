import React from 'react';
import { DeviceConfig, CaseStyle } from '../../types/customizer';
import {
  X,
  MessageCircle,
  Download,
  CheckCircle2,
  Sparkles,
  Smartphone,
} from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceConfig;
  caseStyle: CaseStyle;
  uploadedImage: string | null;
  previewImageUrl: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  device,
  caseStyle,
  uploadedImage,
  previewImageUrl,
}) => {
  if (!isOpen) return null;

  // Armar texto del mensaje para WhatsApp
  const messageText = `Hola, quiero encargar una funda personalizada.

Modelo: ${device.name}
Marca: ${device.brand.toUpperCase()}
Acabado de funda: ${caseStyle.name}

Adjunto el diseño que preparé en el personalizador 3D. ¿Tienen disponibilidad y precio?`;

  const encodedMessage = encodeURIComponent(messageText);
  // Número de WhatsApp del emprendimiento (configurable)
  const defaultWhatsAppNumber = '5491123456789';
  const whatsappUrl = `https://wa.me/${defaultWhatsAppNumber}?text=${encodedMessage}`;

  const handleDownload = () => {
    if (previewImageUrl) {
      const link = document.createElement('a');
      link.href = previewImageUrl;
      link.download = `funda-personalizada-${device.id}.jpg`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface border border-surface-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Resumen de tu funda
              </h2>
              <p className="text-xs text-slate-400">
                Paso final para consultar o encargar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Previsualización del diseño */}
          <div className="bg-surface-muted/60 border border-surface-border rounded-xl p-3 flex items-center space-x-4">
            <div className="w-20 h-28 bg-surface rounded-lg border border-surface-border overflow-hidden flex-shrink-0 relative shadow-md">
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">
                  Sin foto
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-brand-light font-medium">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{device.name}</span>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Acabado: </span>
                {caseStyle.name}
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Diseño: </span>
                {uploadedImage ? 'Personalizado propio' : 'Sin foto cargada'}
              </div>
              <div className="pt-1">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-300 hover:text-white bg-surface hover:bg-surface-hover px-2.5 py-1 rounded-md border border-surface-border transition-colors"
                >
                  <Download className="w-3 h-3 mr-1" />
                  <span>Guardar imagen del diseño</span>
                </button>
              </div>
            </div>
          </div>

          {/* Caja explicativa de cómo funciona */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>¿Cómo completar tu encargo?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Al tocar el botón, se abrirá WhatsApp con los detalles de tu modelo. Puedes adjuntar la imagen que guardaste para coordinar precio, envío y tiempo de entrega.
            </p>
          </div>
        </div>

        {/* Modal Footer / CTAs */}
        <div className="p-4 border-t border-surface-border bg-surface-muted/40 space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/40"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Consultar por WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium text-center"
          >
            Volver a editar
          </button>
        </div>
      </div>
    </div>
  );
};
