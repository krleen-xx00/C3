import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, HeartHandshake, CheckCircle, X } from 'lucide-react';
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
  const [tier2Status, setTier2Status] = useState<'prompt' | 'connected' | 'dismissed'>('prompt');

  // Only Tier 2 (moderate distress) offers confidential connection with the Guidance Office.
  if (tier !== 2 || tier2Status === 'dismissed') {
    return null;
  }

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
      console.error('Error creating referral ticket:', e);
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
      console.error('Error logging anonymized risk event:', e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-3xl border transition-all overflow-hidden p-4 sm:p-5 shadow-lg ${
        isDarkMode
          ? 'bg-[#201815] border-amber-900/50 text-[#EDE5DB]'
          : 'bg-gradient-to-br from-amber-50/90 via-[#FFFDF9] to-orange-50/70 border-amber-200/80 text-[#3D2C2C]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
              isDarkMode ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDarkMode
                  ? 'bg-amber-900/40 text-amber-300 border border-amber-700/40'
                  : 'bg-amber-100 text-amber-900 border border-amber-300/60'
              }`}
            >
              Gentle Support &amp; Check-In
            </span>
            <h4 className="text-xs sm:text-sm font-bold mt-0.5">
              Take a gentle moment. You don&apos;t have to carry this alone.
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDecline}
          className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Guidance Connection Prompt Body */}
      {tier2Status === 'prompt' && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#291E19] border-amber-700/50 text-amber-100'
              : 'bg-amber-50/90 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-amber-400/20 rounded-xl text-amber-600 dark:text-amber-300 shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                It sounds like things are heavy right now. Would you like to talk to someone at the Guidance Office?
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Your guidance counselor can provide confidential, warm support.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
                <button
                  type="button"
                  onClick={handleConnect}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Yes, connect me
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'border-stone-700 text-stone-300 hover:bg-stone-800'
                      : 'border-stone-300 text-stone-700 hover:bg-white'
                  }`}
                >
                  Not right now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Confirmation */}
      {tier2Status === 'connected' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-emerald-900 dark:text-emerald-200"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs font-medium">
            <p className="font-bold">Referral Sent</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              A guidance counselor will reach out to you soon. Thank you for reaching out.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
