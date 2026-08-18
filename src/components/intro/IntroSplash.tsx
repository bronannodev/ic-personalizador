import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroSplashProps {
  onComplete: () => void;
  logoSrc?: string;
  durationMs?: number;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({
  onComplete,
  logoSrc = '/logo.webp',
  durationMs = 3400,
}) => {
  const [phase, setPhase] = useState<'entering' | 'exiting' | 'done'>('entering');

  useEffect(() => {
    // Fase 1: Entrada y permanencia
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, durationMs - 800);

    // Fase 2: Finalización y transición al menú
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [durationMs, onComplete]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intro-splash"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'exiting' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080c] select-none cursor-pointer overflow-hidden"
        onClick={() => {
          setPhase('done');
          onComplete();
        }}
      >
        {/* Halo de luz suave animado en el fondo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: phase === 'entering' ? [0.8, 1.2, 1.1] : 1.4,
            opacity: phase === 'entering' ? [0, 0.4, 0.25] : 0,
          }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-500/20 to-transparent blur-3xl pointer-events-none"
        />

        {/* Logo con zoom fluido desde el centro */}
        <motion.div
          initial={{ scale: 0.55, opacity: 0, filter: 'blur(8px)' }}
          animate={
            phase === 'entering'
              ? {
                  scale: [0.55, 1.04, 1.0],
                  opacity: [0, 1, 1],
                  filter: ['blur(8px)', 'blur(0px)', 'blur(0px)'],
                }
              : {
                  scale: 1.18,
                  opacity: 0,
                  filter: 'blur(6px)',
                }
          }
          transition={{
            duration: phase === 'entering' ? 1.6 : 0.65,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative flex flex-col items-center justify-center p-8"
        >
          <img
            src={logoSrc}
            alt="Logo"
            className="w-auto h-16 sm:h-20 md:h-24 object-contain brightness-0 invert drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
            onError={(e) => {
              // Fallback estilizado si la imagen no carga
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Línea de brillo sutil debajo del logo */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '120px', opacity: 0.7 }}
            transition={{ delay: 0.6, duration: 1.0, ease: 'easeOut' }}
            className="h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent mt-6"
          />

          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-[11px] sm:text-xs tracking-[0.25em] uppercase text-slate-300 font-light mt-3"
          >
            Hecho en La Rioja
          </motion.span>
        </motion.div>

        {/* Indicador discreto para saltar */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          whileHover={{ opacity: 0.9 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="absolute bottom-8 text-[11px] uppercase tracking-widest text-slate-500 hover:text-white px-3 py-1 rounded-full transition-all"
        >
          Toca para comenzar
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};
