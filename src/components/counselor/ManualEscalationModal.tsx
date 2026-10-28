import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  X,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  Calendar,
  FileText,
  AlertTriangle,
  Lock,
  Building2,
  Check
} from 'lucide-react';
import { FlaggedRiskItem, ManualEscalationRecord } from '../../data/flaggedRiskData';
import { CounselorUser } from '../../types';

interface ManualEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FlaggedRiskItem | null;
  currentCounselor: CounselorUser;
  onConfirmEscalation: (id: string, record: ManualEscalationRecord) => void;
  isDarkMode: boolean;
}

export const ManualEscalationModal: React.FC<ManualEscalationModalProps> = ({
  isOpen,
  onClose,
  item,
  currentCounselor,
  onConfirmEscalation,
  isDarkMode
}) => {
  const [actionPlan, setActionPlan] = useState<'guidance_session' | 'in_person_check' | 'parent_outreach_manual' | 'cluster_referral'>('guidance_session');
  const [parentContactedManually, setParentContactedManually] = useState<boolean>(false);
  const [parentContactDetails, setParentContactDetails] = useState<string>('');
  const [counselorNotes, setCounselorNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!counselorNotes.trim()) {
      setError('Please provide counselor case notes outlining the intervention plan.');
      return;
    }

    const actionTitles = {
      guidance_session: '1-on-1 Guidance Session Scheduled',
      in_person_check: 'Immediate In-Person Welfare Check',
      parent_outreach_manual: 'Manual Counselor-Led Parent Outreach',
      cluster_referral: 'Academic Cluster Coordinator Triage'
    };

    const record: ManualEscalationRecord = {
      counselorName: currentCounselor.name,
      counselorLicense: currentCounselor.licenseNo || 'PRC RGC Licensed',
      actionPlan,
      actionTitle: actionTitles[actionPlan],
      parentContactedManually,
      parentContactDetails: parentContactedManually ? parentContactDetails.trim() : undefined,
      counselorNotes: counselorNotes.trim(),
      escalatedAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    onConfirmEscalation(item.id, record);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-sm bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-6 ${
            isDarkMode
              ? 'bg-[#1D1714] border-[#3D322A] text-[#EDE5DB]'
              : 'bg-white border-[#EAE0D2] text-[#3D2C2C]'
          }`}
        >
          {/* Header */}
          <div
            className={`p-5 sm:p-6 border-b flex items-center justify-between ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#2A1D1B] via-[#221815] to-[#1D1714] border-[#382E27]'
                : 'bg-gradient-to-r from-[#FFF5F5] via-[#FFF9F2] to-[#FAF5EE] border-[#EAE0D2]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    Manual Counselor Escalation Log
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    Tiered Protocol
                  </span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                  Student: <span className="font-mono font-bold text-amber-500">{item.anonymizedStudentId}</span> • Companion: {item.companionUsed} • {item.gradeSection}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-[#2C231D] text-[#8A796B]' : 'hover:bg-[#EFE5D8] text-[#9C8888]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-7rem)] overflow-y-auto">
            {/* Flagged Snippet Preview */}
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                isDarkMode ? 'bg-[#15100E] border-[#382D25]' : 'bg-[#FAF6F0] border-[#EFE2D2]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <span>TRIGGERED CHAT SNIPPET:</span>
                <span>{item.displayTime}</span>
              </div>
              <p className="italic font-serif text-slate-800 dark:text-slate-200">
                &ldquo;{item.flaggedSnippet}&rdquo;
              </p>
            </div>

            {/* MANDATORY HUMAN-IN-THE-LOOP DISCLAIMER BANNER */}
            <div
              className={`p-3.5 rounded-2xl border flex items-start space-x-3 text-xs leading-relaxed ${
                isDarkMode
                  ? 'bg-[#261E16] border-[#4A3828] text-[#F3D7B5]'
                  : 'bg-[#FFF8EE] border-[#F2DAC0] text-[#7A4B1A]'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold uppercase tracking-wider block text-[11px] text-amber-700 dark:text-amber-300">
                  Privacy &amp; Human Escalation Protocol
                </span>
                <p className="text-[11px] mt-0.5">
                  Automated alerts are sent strictly to this Guidance Counselor Dashboard. <strong>No automated messages are ever sent directly to parents.</strong> Any parent notification must be conducted manually and personally by a guidance counselor after human review.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Action Protocol Selection */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                1. Select Counselor Intervention Protocol *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'guidance_session', label: '1-on-1 Guidance Session', desc: 'Schedule private in-person counseling slot' },
                  { id: 'in_person_check', label: 'Direct Wellness Check', desc: 'Immediate check-in with student / class adviser' },
                  { id: 'cluster_referral', label: 'Academic Load Triage', desc: 'Coordinate deadline extension with teachers' },
                  { id: 'parent_outreach_manual', label: 'Direct Parent Outreach', desc: 'Manual counselor-led phone call/meeting' },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setActionPlan(plan.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      actionPlan === plan.id
                        ? isDarkMode
                          ? 'bg-[#362719] border-[#6E4221] text-[#F9E6CD] ring-1 ring-[#8F5B34]'
                          : 'bg-[#FFF3E5] border-[#E8C29B] text-[#5C3B20] ring-1 ring-[#8F5B34]'
                        : isDarkMode
                          ? 'bg-[#181310] border-[#332A24] text-[#A8988A] hover:bg-[#221B17]'
                          : 'bg-[#FAF6F0] border-[#EFE5D8] text-[#7D6B5E] hover:bg-[#F3EBE0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{plan.label}</span>
                      {actionPlan === plan.id && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <span className="text-[10px] mt-1 opacity-80">{plan.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Parent Notification Protocol Checkbox */}
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 transition-colors ${
                parentContactedManually
                  ? isDarkMode ? 'bg-[#1D2B20] border-[#36593D]' : 'bg-[#F0FDF4] border-[#BBF7D0]'
                  : isDarkMode ? 'bg-[#181310] border-[#332A24]' : 'bg-[#FAF6F0] border-[#EFE5D8]'
              }`}
            >
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={parentContactedManually}
                  onChange={(e) => setParentContactedManually(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold block">
                    Record Manual Counselor-Led Parent Notification
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                    Check only if you, as the guidance counselor, personally initiated direct phone or in-person communication with the student&apos;s parent/guardian.
                  </span>
                </div>
              </label>

              {parentContactedManually && (
                <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    Parent Contact Details &amp; Outcome Notes:
                  </label>
                  <input
                    type="text"
                    value={parentContactDetails}
                    onChange={(e) => setParentContactDetails(e.target.value)}
                    placeholder="e.g. Spoke with mother Mrs. Santos via phone at 2:15 PM; scheduled in-person session for Thursday."
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#141F17] border-[#2A4730] text-[#D1FAE5] placeholder-[#507D5C]'
                        : 'bg-white border-[#86EFAC] text-[#14532D] placeholder-[#86EFAC]'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Step 3: Counselor Case Notes */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                3. Clinical / Guidance Counselor Case Notes *
              </label>
              <textarea
                required
                rows={3}
                value={counselorNotes}
                onChange={(e) => setCounselorNotes(e.target.value)}
                placeholder="Document your observations, immediate de-escalation steps, assigned peer support, or referral plan..."
                className={`w-full p-3 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                    : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                }`}
              />
            </div>

            {/* Footer with Counselor Signature Badge */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDarkMode ? 'bg-[#15100D] border-[#2C231D]' : 'bg-[#FAF5EE] border-[#E8DDD0]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">
                  Signing Counselor: <strong>{currentCounselor.name}</strong> ({currentCounselor.licenseNo || 'RGC Verified'})
                </span>
              </div>
              <span className={`text-[10px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                DepEd SHS Protocol
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#241E1A] hover:bg-[#2F2621] border-[#3D332B] text-[#D0C0B0]'
                    : 'bg-white hover:bg-[#F8F2EA] border-[#E8DFD3] text-[#6D5A50]'
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md ${
                  isDarkMode
                    ? 'bg-[#D4A373] hover:bg-[#C28F5E] text-[#1E1712]'
                    : 'bg-[#8F5B34] hover:bg-[#784823] text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Official Escalation Log</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
