import { useState, useRef } from 'react';
import { useCustomizerState } from './hooks/useCustomizerState';
import { PhoneCase2D } from './components/2d/PhoneCase2D';
import { DesignToolbar } from './components/2d/DesignToolbar';
import { CompositeMockup } from './components/mockups/CompositeMockup';
import { BrandAndModelSelector } from './components/ui/BrandAndModelSelector';
import { TransformControls } from './components/ui/TransformControls';
import { MoltenMetal } from './components/ui/MoltenMetal';
import { IntroSplash } from './components/intro/IntroSplash';
import {
  Eye,
  ChevronLeft,
  ArrowRight,
  Upload,
  MessageCircle,
  RotateCcw,
  Download,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToCloudinary, deleteFromCloudinary } from './utils/cloudinary';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isTransformPanelOpen, setIsTransformPanelOpen] = useState(false);
  const [isCloudinaryProcessing, setIsCloudinaryProcessing] = useState<boolean>(false);
  const [cloudinaryMockupUrl, setCloudinaryMockupUrl] = useState<string | null>(null);
  const [lastCloudinaryPublicId, setLastCloudinaryPublicId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    state,
    handleSelectBrand,
    handleSelectDevice,
    handleImageUpload,
    handleRemoveImage,
    updateTransform,
    rotate90,
    toggleFlipH,
    centerPosition,
    fitToFullCoverage,
    resetTransform,
    exportPreviewImage,
  } = useCustomizerState();

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleResetToStep1 = () => {
    // Si había una imagen subida en Cloudinary pero el usuario reinicia, la borramos en segundo plano
    if (lastCloudinaryPublicId) {
      deleteFromCloudinary(lastCloudinaryPublicId);
      setLastCloudinaryPublicId(null);
      setCloudinaryMockupUrl(null);
    }
    setActiveStep(1);
  };

  const handleGoToStep3 = async () => {
    setActiveStep(3);
    setIsCloudinaryProcessing(true);
    try {
      const previewUrl = exportPreviewImage();
      if (previewUrl) {
        // Borrar la anterior si existía para no duplicar
        if (lastCloudinaryPublicId) {
          deleteFromCloudinary(lastCloudinaryPublicId);
        }
        const uploadRes = await uploadToCloudinary(previewUrl, 'pedidos');
        if (uploadRes) {
          setCloudinaryMockupUrl(uploadRes.secureUrl);
          setLastCloudinaryPublicId(uploadRes.publicId);
        }
      }
    } catch (err) {
      console.error('Error procesando Cloudinary:', err);
    } finally {
      setIsCloudinaryProcessing(false);
    }
  };

  const handleWhatsAppOrder = () => {
    let message = `Hola! Quiero encargar la funda personalizada para *${state.selectedDevice.name}* (Marca: ${state.selectedBrand.toUpperCase()}). ¿Que precio tiene?`;
    if (cloudinaryMockupUrl) {
      message += `\n\nDiseño: ${cloudinaryMockupUrl}`;
    }

    const defaultWhatsAppNumber = '5493804359576';
    const whatsappUrl = `https://wa.me/${defaultWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadPreview = () => {
    const previewUrl = cloudinaryMockupUrl || exportPreviewImage();
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `funda-${state.selectedDevice.id}.jpg`;
      link.click();
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-[#f1f3f6] text-slate-800 font-sans selection:bg-indigo-500/20 overflow-hidden select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {showSplash && (
        <IntroSplash
          logoSrc="/logo.webp"
          durationMs={3400}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Fondo animado fluido con burbujas visibles en tonos morados y grises */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <MoltenMetal
          color1="#4c1d95"
          color2="#7c3aed"
          color3="#94a3b8"
          speed={0.25}
          scale={3.2}
          detail={3}
          glow={1.4}
          coreSize={0.09}
          swirl={0.8}
          fold={-0.2}
          blackPoint={0.05}
          brightness={1.2}
          colorMode="molten"
          grain={true}
          grainIntensity={0.03}
          mouseInteraction={true}
          mouseStrength={0.2}
          opacity={0.9}
        />
        <div className="absolute inset-0 bg-radial from-transparent via-[#f1f3f6]/15 to-[#f1f3f6]/50" />
      </div>

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* PASO 1: SELECCIÓN DE MARCA Y MODELO                                       */}
        {/* ========================================================================= */}
        {activeStep === 1 && (
          <motion.div
            key="step1-screen"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto max-w-lg mx-auto w-full min-h-screen"
          >
            <div className="w-full bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-xl p-5 sm:p-6 flex flex-col items-center space-y-4">
              <img
                src="/logo.webp"
                alt="Logo"
                className="h-9 sm:h-11 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              <div className="text-center space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  Personalizá tu funda
                </h1>
                <p className="text-xs text-slate-500">
                  Elegí el modelo de tu celular para comenzar a diseñar
                </p>
              </div>

              <div className="w-full pt-1">
                <BrandAndModelSelector
                  selectedBrand={state.selectedBrand}
                  selectedDevice={state.selectedDevice}
                  onSelectBrand={handleSelectBrand}
                  onSelectDevice={handleSelectDevice}
                />
              </div>

              <div className="w-full pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="w-full py-3 px-5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] font-semibold text-sm flex items-center justify-center space-x-2 shadow-md transition-all"
                >
                  <span>Continuar al diseño</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: EDITOR DE DISEÑO                                                  */}
        {/* ========================================================================= */}
        {activeStep === 2 && (
          <motion.div
            key="step2-editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden"
          >
            {/* Top Bar Minimalista */}
            <header className="w-full z-30 px-3 sm:px-6 pt-3 flex items-center justify-between pointer-events-none">
              <button
                type="button"
                onClick={handleResetToStep1}
                className="pointer-events-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 backdrop-blur-xl transition-all text-xs font-medium shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Cambiar</span>
                <span className="font-semibold text-slate-900">{state.selectedDevice.name}</span>
              </button>

              <div className="pointer-events-auto flex items-center space-x-2 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200/80 backdrop-blur-xl shadow-sm text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-slate-700 font-medium">Editor 2D</span>
              </div>
            </header>

            {/* Lienzo Principal de la Funda */}
            <main className="relative flex-1 w-full flex items-center justify-center overflow-hidden px-2 py-1">
              <PhoneCase2D
                device={state.selectedDevice}
                caseStyle={state.selectedCaseStyle}
                uploadedImage={state.uploadedImage}
                transform={state.imageTransform}
                onUpdateTransform={updateTransform}
                onUploadClick={triggerUpload}
                showGuides={true}
              />

              {/* Panel flotante de Ajustes/Transformación */}
              <AnimatePresence>
                {isTransformPanelOpen && state.uploadedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40"
                  >
                    <TransformControls
                      transform={state.imageTransform}
                      onUpdateTransform={updateTransform}
                      onRotate90={rotate90}
                      onReset={resetTransform}
                      onClose={() => setIsTransformPanelOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Dock Inferior */}
            <footer className="w-full z-30 px-3 sm:px-6 pb-3 sm:pb-5 pt-1 flex flex-col items-center gap-2">
              {state.uploadedImage ? (
                <div className="w-full max-w-md flex flex-col items-center gap-2">
                  <DesignToolbar
                    device={state.selectedDevice}
                    uploadedImage={state.uploadedImage}
                    imageMetadata={state.imageMetadata}
                    transform={state.imageTransform}
                    onRotate90={rotate90}
                    onFlipH={toggleFlipH}
                    onCenter={centerPosition}
                    onFitFull={fitToFullCoverage}
                    onRemove={handleRemoveImage}
                    onToggleTransformPanel={() =>
                      setIsTransformPanelOpen(!isTransformPanelOpen)
                    }
                    onChangePhotoClick={triggerUpload}
                    isTransformPanelOpen={isTransformPanelOpen}
                  />

                  <button
                    type="button"
                    onClick={handleGoToStep3}
                    className="w-full py-3 px-6 rounded-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] font-semibold text-sm flex items-center justify-center space-x-2 shadow-md transition-all"
                  >
                    <span>Ver funda terminada</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerUpload}
                    className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir foto o diseño</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoToStep3}
                    className="py-3 px-4 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-all"
                  >
                    Omitir
                  </button>
                </div>
              )}
            </footer>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: FUNDA TERMINADA / MAQUETA FINAL CON ESCENAS                       */}
        {/* ========================================================================= */}
        {activeStep === 3 && (
          <motion.div
            key="step3-mockup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden"
          >
            {/* Top Bar */}
            <header className="w-full z-30 px-3 sm:px-6 pt-3 flex items-center justify-between pointer-events-none">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="pointer-events-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 backdrop-blur-xl transition-all text-xs font-medium shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Ajustar diseño</span>
              </button>

              <div className="pointer-events-auto flex items-center space-x-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200/80 backdrop-blur-xl shadow-sm text-xs text-emerald-600 font-medium">
                <Eye className="w-3.5 h-3.5" />
                <span>{state.selectedDevice.name}</span>
              </div>
            </header>

            {/* Vista de Maqueta Central */}
            <main className="relative flex-1 w-full flex items-center justify-center overflow-hidden p-2">
              <div className="w-full max-w-lg h-full flex items-center justify-center">
                {isCloudinaryProcessing ? (
                  <div className="w-full max-w-[360px] sm:max-w-[420px] bg-white/95 border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 shadow-2xl backdrop-blur-2xl">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>

                    <div className="text-center space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Procesando maqueta final...
                      </p>
                      <p className="text-xs text-slate-500">
                        Generando render fotorrealista en alta resolución
                      </p>
                    </div>

                    {/* Barra de progreso animada */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                ) : (
                  <CompositeMockup
                    device={state.selectedDevice}
                    caseStyle={state.selectedCaseStyle}
                    uploadedImage={state.uploadedImage}
                    transform={state.imageTransform}
                  />
                )}
              </div>
            </main>

            {/* Acciones directas */}
            <footer className="w-full z-30 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 flex flex-col items-center gap-2 bg-gradient-to-t from-[#f1f3f6] via-[#f1f3f6]/80 to-transparent">
              <div className="w-full max-w-md space-y-2">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  disabled={isCloudinaryProcessing}
                  className="w-full py-3.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-700/20 transition-all"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-current" />
                  <span>Pedir esta funda por WhatsApp</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPreview}
                    disabled={isCloudinaryProcessing}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/80 hover:bg-white disabled:opacity-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Guardar diseño</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/80 hover:bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all text-center shadow-sm"
                  >
                    Ajustar foto
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToStep1}
                    className="py-2 px-3 rounded-lg bg-white/80 hover:bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 text-xs font-medium flex items-center gap-1 transition-all shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Cambiar</span>
                  </button>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
