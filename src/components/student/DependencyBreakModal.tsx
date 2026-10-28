import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wind,
  Home,
  Coffee,
  Heart,
  X,
  Sparkles,
  Clock,
  RotateCcw,
  CheckCircle2,
  Smile
} from 'lucide-react';

interface DependencyBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToHomeHub: () => void;
  messageCount: number;
  activeMinutes: number;
  isDarkMode: boolean;
}

export const DependencyBreakModal: React.FC<DependencyBreakModalProps> = ({
  isOpen,
  onClose,
  onBackToHomeHub,
  messageCount,
  activeMinutes,
  isDarkMode
}) => {
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  // 60-second countdown timer for breathing exercise
  useEffect(() => {
    if (!isBreathingActive) {
      setSecondsRemaining(60);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive]);

  // 4-4-4 diaphragmatic rhythm
  useEffect(() => {
    if (!isBreathingActive || secondsRemaining === 0) return;

    const rhythm = setInterval(() => {
      setBreathingPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);

    return () => clearInterval(rhythm);
  }, [isBreathingActive, secondsRemaining]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-md bg-black/65">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative ${
            isDarkMode
              ? 'bg-[#1D1714] border-[#3D322A] text-[#EDE5DB]'
              : 'bg-white border-[#EAE0D2] text-[#3D2C2C]'
          }`}
        >
          {/* Decorative Warm Top Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-4 right-4 p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-[#2C241F] text-[#8A796B]' : 'hover:bg-[#EFE5D8] text-[#9C8888]'
            }`}
            title="Continue softly"
          >
            <X className="w-5 h-5" />
          </button>

          {!isBreathingActive ? (
            /* Main Grounding Prompt */
            <div className="p-6 sm:p-8 text-center space-y-6">
              {/* Calm Icon */}
              <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md">
                <Coffee className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs">
                  🌿
                </span>
              </div>

              {/* Title & Safeguard Badge */}
              <div className="space-y-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Dependency &amp; Wellbeing Safeguard</span>
                </span>
                
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  {messageCount >= 40 ? "Take a Breather!" : "Time for a gentle pause"}
                </h3>

                {/* EXACT SPECIFIED MANDATED GROUNDING MESSAGE */}
                <p className="text-sm sm:text-base font-semibold leading-relaxed max-w-md mx-auto text-stone-800 dark:text-stone-100">
                  {messageCount >= 40
                    ? "Take a Breather! You've reached the 40-message session limit. Remember to rest, hydrate, or talk to someone offline."
                    : "You've been sharing with us for a while! Remember to take a break, grab some water, or talk to someone you trust offline."}
                </p>
              </div>

              {/* Session Stats Chips */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-center space-x-4 text-xs ${
                  isDarkMode ? 'bg-[#15100E] border-[#2E241E] text-[#A09080]' : 'bg-[#FAF6F0] border-[#EFE2D2] text-[#7D6B5E]'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Session: <strong>{activeMinutes >= 20 ? '20+ mins active' : `${activeMinutes} mins`}</strong></span>
                </span>
                <span>•</span>
                <span>Messages: <strong>{messageCount >= 40 ? '40 messages (Session limit reached)' : `${messageCount} of 40 messages`}</strong></span>
              </div>

              {/* Action Buttons: [1-Min Breathing Exercise] and [Back to Home Hub] */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBreathingActive(true)}
                  className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md border ${
                    isDarkMode
                      ? 'bg-[#291F38] hover:bg-[#36274B] text-[#EADCF7] border-[#4E356C]'
                      : 'bg-[#F4EDFA] hover:bg-[#EADBFA] text-[#5C348A] border-[#D8C7F0]'
                  }`}
                >
                  <Wind className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                  <span>1-Min Breathing Exercise</span>
                </button>

                <button
                  type="button"
                  onClick={onBackToHomeHub}
                  className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md ${
                    isDarkMode
                      ? 'bg-[#D4A373] hover:bg-[#C28F5E] text-[#1E1712]'
                      : 'bg-[#8F5B34] hover:bg-[#784823] text-white'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Home Hub</span>
                </button>
              </div>

              <p className={`text-[11px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                Our AI companions are here to support your reflection, but real-world balance, rest, and human connection always come first.
              </p>
            </div>
          ) : (
            /* Interactive 1-Minute Breathing View */
            <div className="p-6 sm:p-8 text-center space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center space-x-1.5">
                  <Wind className="w-4 h-4" />
                  <span>1-Minute Grounding Breath</span>
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                  {secondsRemaining}s left
                </span>
              </div>

              {/* Pulsing Breathing Orb */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                <motion.div
                  animate={{
                    scale: breathingPhase === 'inhale' ? 1.35 : breathingPhase === 'hold' ? 1.35 : 0.85,
                    boxShadow:
                      breathingPhase === 'inhale'
                        ? '0 0 45px rgba(168, 85, 247, 0.45)'
                        : '0 0 15px rgba(168, 85, 247, 0.15)'
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 text-white font-black text-sm sm:text-base flex flex-col items-center justify-center shadow-lg uppercase tracking-wider"
                >
                  <span>{breathingPhase}</span>
                  <span className="text-[10px] font-normal lowercase opacity-85 mt-0.5">
                    {breathingPhase === 'inhale' && 'deeply in'}
                    {breathingPhase === 'hold' && 'relax shoulders'}
                    {breathingPhase === 'exhale' && 'slowly out'}
                  </span>
                </motion.div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {breathingPhase === 'inhale' && 'Inhale gentle calm through your nose...'}
                  {breathingPhase === 'hold' && 'Hold softly. Feel your feet on the floor...'}
                  {breathingPhase === 'exhale' && 'Release all tension out through your mouth...'}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                  Box breathing rhythm (4s in • 4s hold • 4s out)
                </p>
              </div>

              {secondsRemaining === 0 ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Great job! You took a mindful breath.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onBackToHomeHub}
                    className={`w-full py-3 rounded-2xl text-sm font-black transition-all cursor-pointer shadow-md ${
                      isDarkMode ? 'bg-[#D4A373] text-[#1E1712]' : 'bg-[#8F5B34] text-white'
                    }`}
                  >
                    Return to Wellness Hub
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBreathingActive(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      isDarkMode ? 'border-[#3D332B] text-[#D0C0B0]' : 'border-[#E8DFD3] text-[#6D5A50]'
                    }`}
                  >
                    Back to Pause Notice
                  </button>

                  <button
                    type="button"
                    onClick={onBackToHomeHub}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDarkMode ? 'bg-[#D4A373] text-[#1E1712]' : 'bg-[#8F5B34] text-white'
                    }`}
                  >
                    Back to Home Hub
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
