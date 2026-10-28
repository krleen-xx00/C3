import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Shield,
  CheckCircle2,
  X,
  Lock,
  UserCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User, AcademicClusterId } from '../types';
import { ACADEMIC_CLUSTERS } from '../data/academicTracks';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLoginSuccess: (user: User) => void;
  isDarkMode: boolean;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  isDarkMode
}) => {
  const [email, setEmail] = useState<string>(currentUser.email || 'maria.santos@cabiaoshs.edu.ph');
  const [name, setName] = useState<string>(currentUser.name || 'Maria Santos');
  const [gradeSection, setGradeSection] = useState<string>(currentUser.gradeSection || 'Grade 12 - STEM A');
  const [academicClusterId, setAcademicClusterId] = useState<AcademicClusterId>(
    (currentUser.academicClusterId as AcademicClusterId) || 'tp-ict'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your school email');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/school-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          gradeSection,
          academicClusterId
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to authenticate school account');
      }
    } catch {
      // Fallback local update
      const updatedUser: User = {
        ...currentUser,
        email,
        name,
        gradeSection,
        academicClusterId,
        studentId: currentUser.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`
      };
      onLoginSuccess(updatedUser);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-md bg-black/70">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative ${
            isDarkMode
              ? 'bg-[#1C1613] border-[#382E27] text-[#EDE5DB]'
              : 'bg-white border-[#E8DDD0] text-[#3D2C2C]'
          }`}
        >
          {/* Top Gold Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-600" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-4 right-4 p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-[#2C241F] text-[#8A796B]' : 'hover:bg-[#EFE5D8] text-[#8C7575]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-7 space-y-5">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Student School Account</h3>
                <p className={`text-xs ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                  Cabiao Senior High School DepEd Portal
                </p>
              </div>
            </div>

            {/* Privacy Shield Notice */}
            <div
              className={`p-3 rounded-2xl border text-xs flex items-start space-x-2.5 ${
                isDarkMode ? 'bg-[#15110E] border-[#332821]' : 'bg-[#FAF6F0] border-[#EFE2D2]'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-amber-700 dark:text-amber-300">
                  Student Privacy &amp; Anonymized Identifier
                </span>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                  When chatting with companions, your identity is masked behind an anonymized handle (e.g. <strong>{currentUser.studentId || 'STU-8921'}</strong>). Guidance counselors maintain secure duty-of-care audit trails under DepEd safety protocols.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Clara Santos"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                    isDarkMode ? 'bg-[#15110E] border-[#382E27]' : 'bg-[#FAF7F2] border-[#E8DFD3]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">School Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student.name@cabiaoshs.edu.ph"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                    isDarkMode ? 'bg-[#15110E] border-[#382E27]' : 'bg-[#FAF7F2] border-[#E8DFD3]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Grade &amp; Section</label>
                  <input
                    type="text"
                    required
                    value={gradeSection}
                    onChange={(e) => setGradeSection(e.target.value)}
                    placeholder="Grade 12 - STEM A"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode ? 'bg-[#15110E] border-[#382E27]' : 'bg-[#FAF7F2] border-[#E8DFD3]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Academic Track / Cluster</label>
                  <select
                    value={academicClusterId}
                    onChange={(e) => setAcademicClusterId(e.target.value as AcademicClusterId)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDarkMode ? 'bg-[#15110E] border-[#382E27]' : 'bg-[#FAF7F2] border-[#E8DFD3]'
                    }`}
                  >
                    {ACADEMIC_CLUSTERS.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.shortLabel} ({cl.name.split('—')[0].trim()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md ${
                    isDarkMode
                      ? 'bg-[#D4A373] hover:bg-[#C28F5E] text-[#1E1712]'
                      : 'bg-[#8F5B34] hover:bg-[#784823] text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Connecting School Account...' : 'Confirm School Login'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
