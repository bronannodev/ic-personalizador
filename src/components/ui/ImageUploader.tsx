import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  uploadedImage: string | null;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  uploadedImage,
  onImageUpload,
  onRemoveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      // Reset input value to allow uploading the same file again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!uploadedImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full border-2 border-dashed border-brand/40 hover:border-brand bg-brand/5 hover:bg-brand/10 transition-all duration-200 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-brand/15 text-brand-light flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-white mb-1">
            Subir foto o diseño
          </span>
          <span className="text-xs text-slate-400 max-w-[240px]">
            Toca aquí para elegir desde tu galería o cámara
          </span>
          <span className="inline-block mt-3 px-3 py-1 bg-surface-muted rounded-full text-[11px] font-medium text-slate-300 border border-surface-border">
            JPG, PNG o WEBP
          </span>
        </div>
      ) : (
        <div className="bg-surface-muted/60 border border-surface-border rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-12 h-12 rounded-lg bg-surface border border-surface-border overflow-hidden flex-shrink-0 relative">
              <img
                src={uploadedImage}
                alt="Miniatura"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-light flex-shrink-0" />
                <span className="text-xs font-semibold text-white truncate">
                  Foto cargada
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                Aplicada en la funda
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors"
              title="Cambiar imagen"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onRemoveImage}
              className="p-2 rounded-lg bg-surface hover:bg-red-500/20 border border-surface-border hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
              title="Eliminar imagen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
