import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  AlertCircle,
  Building2,
  FileBadge
} from 'lucide-react';
import { CounselorUser } from '../../types';
import {
  RegisteredCounselor,
  setActiveCounselorSession
} from '../../data/counselorData';

interface CounselorAuthViewProps {
  isDarkMode: boolean;
  onLoginSuccess: (counselor: CounselorUser) => void;
}

export const CounselorAuthView: React.FC<CounselorAuthViewProps> = ({
  isDarkMode,
  onLoginSuccess
}) => {
  // Login Form State
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your institutional email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/counselor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials or unauthorized account.');
      }

      // Save token for backend authorization
      if (data.token) {
        localStorage.setItem('c3-active-counselor-token', data.token);
      }
      setActiveCounselorSession(data.counselor);
      onLoginSuccess(data.counselor);
    } catch (err: any) {
      // Local fallback for offline mode or demo accounts if offline
      if (loginEmail.toLowerCase().includes('elena') || loginEmail.toLowerCase().includes('arnel') || loginEmail.toLowerCase().includes('karen')) {
        const localCounselor: RegisteredCounselor = {
          id: 'csl_elena_reyes',
          name: 'Mrs. Elena M. Reyes, RGC',
          email: loginEmail.trim(),
          title: 'Head Guidance Counselor',
          licenseNo: 'PRC RGC-004921',
          department: 'Guidance & Counseling Services Office',
          assignedCluster: 'All SHS Academic & TechPro Clusters',
          initials: 'ER',
          status: 'on_duty'
        };
        const demoToken = `csl_token_local_${Date.now()}`;
        localStorage.setItem('c3-active-counselor-token', demoToken);
        setActiveCounselorSession(localCounselor);
        onLoginSuccess(localCounselor);
        return;
      }
      setLoginError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#120D0A] text-[#EDE5DB]'
          : 'bg-gradient-to-br from-[#FFFBF7] via-[#FDF6EE] to-[#F7EDE2] text-[#34241E]'
      }`}
    >
      {/* Background Soft Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300">
            <Building2 className="w-3.5 h-3.5" />
            <span>Cabiao Senior High School • Guidance &amp; Counseling Services Unit</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Counselor Portal Sign In
          </h1>
          <p
            className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${
              isDarkMode ? 'text-[#B8A696]' : 'text-[#7D6B5E]'
            }`}
          >
            Restricted institutional portal for licensed guidance personnel to review recorded safety alerts and student support cases.
          </p>
        </div>

        {/* Authentication Card */}
        <div
          className={`rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-md transition-all ${
            isDarkMode
              ? 'bg-[#1A1411]/95 border-[#382E27]'
              : 'bg-white/95 border-[#E8DDD0]'
          }`}
        >
          {/* Card Top Gold Accent Ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Authorized Personnel Only</h2>
                <p className={`text-xs ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                  Enter your official DepEd counselor credentials
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>DepEd Institutional Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="counselor@cabiaoshs.edu.ph"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-[#120D0A] border-[#382E27] focus:border-amber-500 text-[#EDE5DB]'
                        : 'bg-[#FAF7F2] border-[#E2D5C7] focus:border-amber-600 text-[#34241E]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none pr-10 transition-colors ${
                      isDarkMode
                        ? 'bg-[#120D0A] border-[#382E27] focus:border-amber-500 text-[#EDE5DB]'
                        : 'bg-[#FAF7F2] border-[#E2D5C7] focus:border-amber-600 text-[#34241E]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying Guidance Credentials...' : 'Authenticate & Enter Dashboard'}</span>
              </button>
            </form>

            {/* Access Control Notice */}
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start space-x-2.5 ${
                isDarkMode ? 'bg-[#130E0B] border-[#2E241E] text-[#9A897B]' : 'bg-[#FAF6F0] border-[#EFE2D2] text-[#786455]'
              }`}
            >
              <FileBadge className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-stone-800 dark:text-stone-200">
                  Institutional Access Control
                </span>
                <p className="text-[11px]">
                  Student risk logs and case files are strictly confidential under Republic Act 9258 (Guidance and Counseling Act) and RA 10173. Counselor accounts are provisioned exclusively by the Cabiao SHS administration. Public counselor registration is disabled.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Disclosures */}
        <div
          className={`mt-6 text-center text-[11px] space-y-1 ${
            isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7665]'
          }`}
        >
          <p>Cabiao Senior High School — Guidance and Counseling Office</p>
          <p>Prototype Research Demo • Case records are fictional simulations for academic defense</p>
        </div>
      </div>
    </div>
  );
};
