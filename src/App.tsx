import { useState } from 'react';
import { useCustomizerState } from './hooks/useCustomizerState';
import { PhoneCase2D } from './components/2d/PhoneCase2D';
import { DesignToolbar } from './components/2d/DesignToolbar';
import { CompositeMockup } from './components/mockups/CompositeMockup';
import { BrandAndModelSelector } from './components/ui/BrandAndModelSelector';
import { ImageUploader } from './components/ui/ImageUploader';
import { TransformControls } from './components/ui/TransformControls';
import { MoltenMetal } from './components/ui/MoltenMetal';
import { IntroSplash } from './components/intro/IntroSplash';
import Stepper, { Step } from './components/ui/Stepper';
import { ImagePlus, Smartphone, Eye, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isTransformPanelOpen, setIsTransformPanelOpen] = useState(false);

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
  } = useCustomizerState();

  const isStep1 = activeStep === 1;

  // Determinar qué se muestra en el visor según el paso activo
  const showMockupPreview = activeStep === 3;
  const showEditor = activeStep === 2;

  // Labels y botones del stepper
  const stepLabels = ['Celular', 'Diseño', 'Resultado'];

  const getNextButtonText = () => {
    switch (activeStep) {
      case 2:
        return 'Ver funda terminada';
      case 3:
        return 'Volver al paso 1';
      default:
        return 'Continuar';
    }
  };

  // En el paso 3, el botón final reinicia al paso 1
  const handleFinalStep = () => {
    setActiveStep(1);
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-[#07080c] text-slate-100 font-sans selection:bg-white/20 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* ANIMACIÓN DE ENTRADA: ZOOM FLUIDO DEL LOGO DESDE EL CENTRO                 */}
      {/* ========================================================================= */}
      {showSplash && (
        <IntroSplash
          logoSrc="/logo.webp"
          durationMs={3400}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Fondo animado fluido MoltenMetal */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
        <MoltenMetal
          color1="#181135"
          color2="#6366f1"
          color3="#c084fc"
          speed={0.25}
          scale={3.5}
          detail={3}
          glow={1.4}
          coreSize={0.08}
          swirl={0.8}
          fold={-0.2}
          blackPoint={0.08}
          brightness={1.1}
          colorMode="molten"
          grain={true}
          grainIntensity={0.04}
          mouseInteraction={true}
          mouseStrength={0.2}
          opacity={0.9}
        />
        <div className="absolute inset-0 bg-radial from-transparent via-[#07080c]/60 to-[#07080c]/90" />
      </div>

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* PANTALLA INICIAL (PASO 1): LOGO + TEXTO + SELECCIÓN DE MARCA Y MODELO     */}
        {/* ========================================================================= */}
        {isStep1 ? (
          <motion.div
            key="step1-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 min-h-screen max-w-lg mx-auto w-full"
          >
            {/* Logo en el centro con filtro blanco */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              src="/logo.webp"
              alt="Logo"
              className="h-10 sm:h-12 w-auto object-contain brightness-0 invert opacity-95 mb-5 hover:opacity-100 transition-opacity"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Texto minimalista */}
            <div className="text-center space-y-1 mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Personalizá tu funda
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Elegí tu modelo de celular para comenzar a diseñar
              </p>
            </div>

            {/* Stepper centrado (Paso 1: Marca y Modelo) */}
            <div className="w-full">
              <Stepper
                currentStep={1}
                stepLabels={stepLabels}
                backButtonText="Anterior"
                nextButtonText="Continuar al diseño"
                onStepChange={(step) => setActiveStep(step)}
              >
                <Step>
                  <BrandAndModelSelector
                    selectedBrand={state.selectedBrand}
                    selectedDevice={state.selectedDevice}
                    onSelectBrand={handleSelectBrand}
                    onSelectDevice={handleSelectDevice}
                  />
                </Step>
                <Step>
                  <div />
                </Step>
                <Step>
                  <div />
                </Step>
              </Stepper>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* PANTALLA DE EDICIÓN (PASOS 2 Y 3)                                         */
          /* ========================================================================= */
          <motion.div
            key="editor-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex-1 w-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-screen"
          >
            {/* ===== ÁREA DEL VISOR ===== */}
            <section className="relative w-full h-[54vh] sm:h-[58vh] md:h-screen md:flex-1 bg-[#090b12]/85 backdrop-blur-2xl flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden border-b md:border-b-0 md:border-r border-white/10 flex-shrink-0">
              {/* Barra superior de control del visor */}
              <div className="w-full flex items-center justify-between z-30">
                {/* Badge del modelo actual */}
                <div className="flex items-center space-x-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-xl shadow-md text-xs font-medium text-slate-200">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{state.selectedDevice.name}</span>
                </div>

                {/* Indicador del modo actual */}
                <div className="flex items-center bg-black/60 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-xl shadow-lg">
                  {showMockupPreview ? (
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Funda terminada</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-300">
                      <ImagePlus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Editor de diseño</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Renderizado del Lienzo */}
              <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden py-1">
                <AnimatePresence mode="wait">
                  {showMockupPreview ? (
                    /* ===== PASO 3: MAQUETA INCRUSTADA ===== */
                    <motion.div
                      key="mockup-view"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full"
                    >
                      <CompositeMockup
                        device={state.selectedDevice}
                        caseStyle={state.selectedCaseStyle}
                        uploadedImage={state.uploadedImage}
                        transform={state.imageTransform}
                      />
                    </motion.div>
                  ) : (
                    /* ===== PASO 2: EDITOR 2D ===== */
                    <motion.div
                      key="editor-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      <PhoneCase2D
                        device={state.selectedDevice}
                        caseStyle={state.selectedCaseStyle}
                        uploadedImage={state.uploadedImage}
                        transform={state.imageTransform}
                        onUpdateTransform={updateTransform}
                        showGuides={true}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Barra inferior de diseño (solo en paso 2) */}
              {showEditor && (
                <div className="w-full max-w-lg z-30">
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
                    isTransformPanelOpen={isTransformPanelOpen}
                  />
                </div>
              )}
            </section>

            {/* ===== ÁREA DEL STEPPER (PASOS 2 Y 3) ===== */}
            <section className="w-full md:w-[480px] lg:w-[520px] flex-1 md:flex-initial flex flex-col justify-start md:justify-center p-3.5 sm:p-6 md:p-8 overflow-y-auto bg-[#0a0c14]/90 backdrop-blur-3xl z-20">
              <Stepper
                currentStep={activeStep}
                stepLabels={stepLabels}
                backButtonText="Anterior"
                nextButtonText={getNextButtonText()}
                onStepChange={(step) => setActiveStep(step)}
                onFinalStepCompleted={handleFinalStep}
              >
                {/* Paso 1 en modo editor: cambiar de celular */}
                <Step>
                  <BrandAndModelSelector
                    selectedBrand={state.selectedBrand}
                    selectedDevice={state.selectedDevice}
                    onSelectBrand={handleSelectBrand}
                    onSelectDevice={handleSelectDevice}
                  />
                </Step>

                {/* Paso 2: Subir y Ajustar Foto */}
                <Step>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-white flex items-center">
                        <ImagePlus className="w-4 h-4 mr-2 text-indigo-400" />
                        Subí tu foto o diseño
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                        Arrastrá sobre la funda para moverla o usá los controles de ajuste
                      </p>
                    </div>

                    <ImageUploader
                      uploadedImage={state.uploadedImage}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={handleRemoveImage}
                    />

                    {/* Controles finos de transformación */}
                    {state.uploadedImage && (
                      <TransformControls
                        transform={state.imageTransform}
                        onUpdateTransform={updateTransform}
                        onRotate90={rotate90}
                        onReset={resetTransform}
                      />
                    )}
                  </div>
                </Step>

                {/* Paso 3: Funda Terminada (Resultado Final) */}
                <Step>
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-white flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-emerald-400" />
                        Tu funda terminada
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                        Así se verá tu funda personalizada para {state.selectedDevice.name}
                      </p>
                    </div>

                    {/* Resumen */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Modelo</span>
                        <span className="text-white font-medium">{state.selectedDevice.name}</span>
                      </div>
                      <div className="border-t border-white/5" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Diseño</span>
                        <span className="text-white font-medium">
                          {state.uploadedImage ? 'Imagen cargada' : 'Sin imagen'}
                        </span>
                      </div>
                    </div>

                    {/* Nota informativa */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                      <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                        Si el diseño te gusta, envianoslo y seguimos con tu pedido.
                      </p>
                    </div>

                    {/* Botón Volver al Paso 1 */}
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Volver al paso 1</span>
                    </button>
                  </div>
                </Step>
              </Stepper>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
