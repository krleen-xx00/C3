import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Wind, BookOpen, HeartHandshake, CheckCircle, X, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { RiskTier, User } from '../../types';

interface TieredResourceCardProps {
  tier: RiskTier;
  currentUser: User;
  isDarkMode: boolean;
  onDismissTier2Prompt?: () => void;
  onConnectGuidance?: () => void;
  triggerContext?: string;
}

export const TieredResourceCard: React.FC<TieredResourceCardProps> = ({
  tier,
  currentUser,
  isDarkMode,
  onDismissTier2Prompt,
  onConnectGuidance,
  triggerContext
}) => {
  const [activeTab, setActiveTab] = useState<'breathe' | 'ground' | 'journal'>('breathe');
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);
  const [tier2Status, setTier2Status] = useState<'prompt' | 'connected' | 'dismissed'>('prompt');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 4-7-8 Breathing Loop
  useEffect(() => {
    let interval: any = null;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            setBreathPhase(current => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              return 'Inhale';
            });
            return breathPhase === 'Inhale' ? 7 : (breathPhase === 'Hold' ? 8 : 4);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathCount(4);
      setBreathPhase('Inhale');
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);

  const handleConnect = async () => {
    setTier2Status('connected');
    if (onConnectGuidance) {
      onConnectGuidance();
    }
    try {
      await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          studentName: currentUser.name,
          gradeSection: currentUser.gradeSection || 'Grade 12 - STEM A',
          tier: 2,
          triggerPhrase: triggerContext || 'Student accepted Tier 2 counselor connection prompt',
          referralType: 'tier2_accepted',
          contextSnippet: 'Student clicked [Yes, connect me] on the gentle Guidance Office prompt.'
        })
      });
    } catch (e) {
      console.error("Error creating referral ticket:", e);
    }
  };

  const handleDecline = async () => {
    setTier2Status('dismissed');
    if (onDismissTier2Prompt) {
      onDismissTier2Prompt();
    }
    try {
      await fetch('/api/risk-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 2,
          anonymized: true,
          actionTaken: 'referral_declined',
          category: 'moderate_distress'
        })
      });
    } catch (e) {
      console.error("Error logging anonymized risk event:", e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-3xl border transition-all overflow-hidden ${
        tier === 2
          ? isDarkMode
            ? 'bg-[#201815] border-amber-900/50 shadow-lg'
            : 'bg-gradient-to-br from-amber-50/90 via-[#FFFDF9] to-orange-50/70 border-amber-200/80 shadow-md'
          : isDarkMode
          ? 'bg-[#1A1E1B] border-emerald-900/40 shadow-md'
          : 'bg-gradient-to-br from-emerald-50/80 via-[#FAFDFB] to-teal-50/60 border-emerald-200/70 shadow-sm'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
            tier === 2
              ? isDarkMode ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100 text-amber-800'
              : isDarkMode ? 'bg-emerald-950/80 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {tier === 2 ? <HeartHandshake className="w-5 h-5" /> : <Wind className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                tier === 2
                  ? isDarkMode ? 'bg-amber-900/40 text-amber-300 border border-amber-700/40' : 'bg-amber-100 text-amber-900 border border-amber-300/60'
                  : isDarkMode ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40' : 'bg-emerald-100 text-emerald-900 border border-emerald-300/60'
              }`}>
                {tier === 2 ? 'Gentle Support & Check-In' : 'Calm Coping Space'}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#EDE5DB] mt-0.5">
              {tier === 2
                ? 'Take a gentle breath. You don\'t have to carry this alone.'
                : 'Here are a few gentle practices to help you reset.'}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Tier 2 Guidance Prompt Section (If Tier 2) */}
      {tier === 2 && tier2Status === 'prompt' && (
        <div className={`mx-4 sm:mx-5 mb-4 p-4 rounded-2xl border transition-all ${
          isDarkMode
            ? 'bg-[#291E19] border-amber-700/50 text-amber-100'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-amber-400/20 rounded-xl text-amber-600 dark:text-amber-300 flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                It sounds like things are heavy right now. Would you like to talk to someone at the Guidance Office?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Your guidance counselor can provide confidential, warm support.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
                <button
                  type="button"
                  onClick={handleConnect}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                >
                  Yes, connect me
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    isDarkMode
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:bg-white'
                  }`}
                >
                  Not right now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tier 2 Connected Confirmation */}
      {tier === 2 && tier2Status === 'connected' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mx-4 sm:mx-5 mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-emerald-900 dark:text-emerald-200"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="text-xs font-medium">
            <p className="font-bold">Referral Sent</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              A guidance counselor will reach out to you soon. Thank you for reaching out.
            </p>
          </div>
        </motion.div>
      )}

      {/* Expandable In-App Coping Resources (Tier 1 & 2) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 sm:px-5 pb-5 pt-1 space-y-4"
          >
            {/* Tabs */}
            <div className="flex items-center space-x-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-2xl max-w-sm">
              <button
                type="button"
                onClick={() => setActiveTab('breathe')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'breathe'
                    ? isDarkMode
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🌬️ 4-7-8 Breathing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ground')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ground'
                    ? isDarkMode
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🌿 5-4-3-2-1 Grounding
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('journal')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'journal'
                    ? isDarkMode
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📝 Micro Prompt
              </button>
            </div>

            {/* Tab 1: 4-7-8 Breathing Guide */}
            {activeTab === 'breathe' && (
              <div className={`p-4 rounded-2xl border text-center transition-all ${
                isDarkMode ? 'bg-black/20 border-slate-800' : 'bg-white/80 border-slate-200/80'
              }`}>
                <div className="py-3 flex flex-col items-center justify-center">
                  <motion.div
                    animate={
                      isBreathing
                        ? breathPhase === 'Inhale'
                          ? { scale: [1, 1.3], opacity: [0.8, 1] }
                          : breathPhase === 'Hold'
                          ? { scale: 1.3, opacity: 1 }
                          : { scale: [1.3, 1], opacity: [1, 0.8] }
                        : { scale: 1 }
                    }
                    transition={{ duration: breathPhase === 'Inhale' ? 4 : (breathPhase === 'Hold' ? 7 : 8), ease: 'easeInOut' }}
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-lg transition-colors ${
                      breathPhase === 'Inhale'
                        ? 'bg-sky-500 shadow-sky-500/30'
                        : breathPhase === 'Hold'
                        ? 'bg-amber-500 shadow-amber-500/30'
                        : 'bg-emerald-500 shadow-emerald-500/30'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider">{breathPhase}</span>
                    <span className="text-xl font-black">{breathCount}s</span>
                  </motion.div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 font-medium">
                    {isBreathing
                      ? breathPhase === 'Inhale'
                        ? 'Inhale quietly through your nose for 4 seconds...'
                        : breathPhase === 'Hold'
                        ? 'Hold your breath gently for 7 seconds...'
                        : 'Exhale completely through your mouth for 8 seconds...'
                      : 'Practice 4-7-8 diaphragmatic breathing to settle your nervous system.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsBreathing(!isBreathing)}
                    className="mt-3.5 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    {isBreathing ? 'Stop Exercise' : 'Start 4-7-8 Breathing'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: 5-4-3-2-1 Sensory Grounding */}
            {activeTab === 'ground' && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                isDarkMode ? 'bg-black/20 border-slate-800' : 'bg-white/80 border-slate-200/80'
              }`}>
                <p className="font-bold text-slate-900 dark:text-[#EDE5DB] mb-1">
                  5-4-3-2-1 Sensory Grounding:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center space-x-2">
                    <span className="font-bold text-sky-600 dark:text-sky-400">5</span>
                    <span>Things you can <strong>see</strong> around you</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center space-x-2">
                    <span className="font-bold text-amber-600 dark:text-amber-400">4</span>
                    <span>Things you can physically <strong>touch</strong></span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">3</span>
                    <span>Things you can <strong>hear</strong> right now</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center space-x-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400">2</span>
                    <span>Things you can <strong>smell</strong></span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-2 sm:col-span-2">
                    <span className="font-bold text-rose-600 dark:text-rose-400">1</span>
                    <span>Positive truth or quality you appreciate about yourself</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Micro Reflection / Journaling Prompt */}
            {activeTab === 'journal' && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                isDarkMode ? 'bg-black/20 border-slate-800' : 'bg-white/80 border-slate-200/80'
              }`}>
                <p className="font-bold text-slate-900 dark:text-[#EDE5DB]">
                  Gentle 1-Minute Reflection Prompt:
                </p>
                <blockquote className="italic text-slate-600 dark:text-slate-300 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border-l-4 border-amber-400">
                  "What is one small thing within your reach today that would give you 5 minutes of comfort?"
                </blockquote>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  You don't need to write a long paragraph. Even drinking a glass of cold water or standing in the fresh air counts as a victory.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
