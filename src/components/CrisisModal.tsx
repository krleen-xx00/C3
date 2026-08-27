import React, { useState } from 'react';
import { Heart, PhoneCall, Sparkles, X, ShieldAlert, CheckCircle, Shield, ArrowRight, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  isDarkMode?: boolean;
  isTier3Emergency?: boolean;
  onContactGuidance?: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  studentName = 'Maria',
  isDarkMode = false,
  isTier3Emergency = false,
  onContactGuidance
}) => {
  const [breathingStep, setBreathingStep] = useState<number>(0);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [guidanceRequested, setGuidanceRequested] = useState<boolean>(false);

  if (!isOpen) return null;

  const startBreathing = () => {
    setIsBreathingActive(true);
    setBreathingStep(1); // Breathe in (4s)
    setTimeout(() => setBreathingStep(2), 4000); // Hold (4s)
    setTimeout(() => setBreathingStep(3), 8000); // Exhale (4s)
    setTimeout(() => {
      setIsBreathingActive(false);
      setBreathingStep(0);
    }, 12000);
  };

  const handleTalkToGuidance = async () => {
    setGuidanceRequested(true);
    if (onContactGuidance) {
      onContactGuidance();
    }
    try {
      await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          tier: 3,
          referralType: isTier3Emergency ? 'tier3_emergency' : 'manual_request',
          triggerPhrase: isTier3Emergency ? 'Emergency Crisis Interstitial triggered' : 'Student tapped Crisis Support button',
          contextSnippet: 'Immediate Guidance Office contact requested via Crisis Support modal.'
        })
      });
    } catch (err) {
      console.error("Error creating guidance referral:", err);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isTier3Emergency ? 'bg-black/80 backdrop-blur-md' : 'bg-black/50 backdrop-blur-xs'
      }`}
      onClick={isTier3Emergency ? undefined : onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-[32px] overflow-hidden p-6 sm:p-8 space-y-5 transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#221C1A] text-[#EDE5DB] border border-[#3D352F] shadow-[0_12px_48px_rgba(0,0,0,0.6)]'
            : 'bg-[#FAF7F2] text-[#3D2C2C] border border-[#EAE2D5] shadow-[0_12px_48px_rgba(61,44,44,0.18)]'
        }`}
      >
        {/* If not Tier 3 Emergency, allow standard close button */}
        {!isTier3Emergency && (
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-[#A89A8D] hover:text-[#EDE5DB] hover:bg-[#332C26]'
                : 'text-[#8C7A7A] hover:text-[#3D2C2C] hover:bg-[#F2ECE3]'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Heading Section */}
        <div className="flex items-start space-x-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isTier3Emergency
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : isDarkMode ? 'bg-[#3A2929] text-[#E08A8A]' : 'bg-[#F5E6E6] text-[#A66363]'
          }`}>
            {isTier3Emergency ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <Heart className="w-6 h-6" />}
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isTier3Emergency
                ? 'bg-rose-500/20 text-rose-500 dark:text-rose-300 border border-rose-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
            }`}>
              {isTier3Emergency ? 'High Priority Crisis Support' : '24/7 Cabiao SHS Well-Being Support'}
            </span>
            <h3 className="text-lg sm:text-xl font-bold mt-1 leading-snug">
              You matter, and you don't have to go through this alone.
            </h3>
          </div>
        </div>

        {/* Transparent Notice if Tier 3 Emergency */}
        {isTier3Emergency && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2.5 text-xs text-rose-900 dark:text-rose-200">
            <Shield className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Safety Notice:</strong> Because your safety matters most, our system will also let a Guidance Office adult know so they can check in with you.
            </p>
          </div>
        )}

        <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-[#B0A294]' : 'text-[#6E5B5B]'}`}>
          Please connect with immediate mental health care. Professional counselors and crisis responders are available 24/7:
        </p>

        {/* National Center for Mental Health (NCMH) Crisis Hotlines */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            National Center for Mental Health (NCMH) Hotlines
          </div>

          {/* Hotline 1: 1553 Landline Toll-Free */}
          <div className={`flex items-center justify-between p-3 rounded-2xl border shadow-2xs ${
            isDarkMode ? 'bg-[#1C1815] border-[#36302B]' : 'bg-white border-[#EDE5DA]'
          }`}>
            <div className="flex items-center space-x-2.5">
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs font-bold">1553 (NCMH Toll-Free)</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-[#8C7E72]' : 'text-[#8C7A7A]'}`}>Luzon-wide Landline Toll-Free</p>
              </div>
            </div>
            <a
              href="tel:1553"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Call 1553
            </a>
          </div>

          {/* Hotline 2: Mobile 1 */}
          <div className={`flex items-center justify-between p-3 rounded-2xl border shadow-2xs ${
            isDarkMode ? 'bg-[#1C1815] border-[#36302B]' : 'bg-white border-[#EDE5DA]'
          }`}>
            <div className="flex items-center space-x-2.5">
              <PhoneCall className="w-4 h-4 text-sky-500" />
              <div>
                <p className="text-xs font-bold">0917-899-8727</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-[#8C7E72]' : 'text-[#8C7A7A]'}`}>Globe / TM 24/7 Mobile</p>
              </div>
            </div>
            <a
              href="tel:09178998727"
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Call Hotline
            </a>
          </div>

          {/* Hotline 3 & 4 Grid */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:09663514518"
              className={`p-2.5 rounded-2xl border text-center block hover:border-indigo-400 transition-colors ${
                isDarkMode ? 'bg-[#1C1815] border-[#36302B]' : 'bg-white border-[#EDE5DA]'
              }`}
            >
              <span className="text-[10px] text-slate-400 block">Globe / TM</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">0966-351-4518</span>
            </a>
            <a
              href="tel:09086392672"
              className={`p-2.5 rounded-2xl border text-center block hover:border-indigo-400 transition-colors ${
                isDarkMode ? 'bg-[#1C1815] border-[#36302B]' : 'bg-white border-[#EDE5DA]'
              }`}
            >
              <span className="text-[10px] text-slate-400 block">Smart / TNT</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">0908-639-2672</span>
            </a>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="space-y-2 pt-2">
          {guidanceRequested ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center space-x-2 text-emerald-800 dark:text-emerald-200 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>A Cabiao SHS guidance counselor has been alerted to check in on you.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTalkToGuidance}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              <UserCheck className="w-4 h-4" />
              <span>Talk to Guidance Office now</span>
            </button>
          )}

          {isTier3Emergency ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition-colors"
            >
              I'm safe, continue
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-2 text-xs transition-colors underline ${
                isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Return to quiet space
            </button>
          )}
        </div>

        {/* Grounding Breath (Optional) */}
        {!isTier3Emergency && (
          <div className={`p-3.5 rounded-2xl border text-center space-y-2 shadow-2xs ${
            isDarkMode ? 'bg-[#1C1815] border-[#36302B]' : 'bg-white border-[#EDE5DA]'
          }`}>
            {isBreathingActive ? (
              <div className="py-1">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  isDarkMode ? 'bg-[#31283B]' : 'bg-[#EDE8F5]'
                }`}>
                  <Sparkles className="w-4 h-4 text-[#A58ECC]" />
                </div>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-[#C5B4E3]' : 'text-[#6B5294]'}`}>
                  {breathingStep === 1 && 'Breathe In Gently...'}
                  {breathingStep === 2 && 'Hold Softly...'}
                  {breathingStep === 3 && 'Exhale Slowly...'}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={startBreathing}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center space-x-1.5 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try a 12-Second Calm Breath</span>
              </button>
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
};
