import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  User,
  BadgeCheck,
  FileBadge,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  Building2,
  Phone,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { CounselorUser } from '../../types';
import {
  RegisteredCounselor,
  getRegisteredCounselors,
  saveRegisteredCounselors,
  DEFAULT_COUNSELORS
} from '../../data/counselorData';

interface CounselorAuthViewProps {
  isDarkMode: boolean;
  onLoginSuccess: (counselor: CounselorUser) => void;
}

export const CounselorAuthView: React.FC<CounselorAuthViewProps> = ({
  isDarkMode,
  onLoginSuccess
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState<string>('elena.reyes@cabiaoshs.edu.ph');
  const [loginPassword, setLoginPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpTitle, setSignUpTitle] = useState<string>('Guidance Counselor');
  const [signUpLicense, setSignUpLicense] = useState<string>('');
  const [signUpDepartment, setSignUpDepartment] = useState<string>('Guidance & Counseling Services Office');
  const [signUpCluster, setSignUpCluster] = useState<string>('All SHS Academic & TechPro Clusters');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState<string>('');
  const [signUpPhone, setSignUpPhone] = useState<string>('');
  const [signUpError, setSignUpError] = useState<string>('');
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = (counselor: RegisteredCounselor) => {
    setIsSubmitting(true);
    setLoginError('');
    setTimeout(() => {
      onLoginSuccess(counselor);
      setIsSubmitting(false);
    }, 350);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your email/username and password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const registered = getRegisteredCounselors();
      const user = registered.find(
        c => c.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (!user) {
        setLoginError('No guidance counselor account found with this email. Try a demo account or sign up.');
        setIsSubmitting(false);
        return;
      }

      if (user.password && user.password !== loginPassword) {
        setLoginError('Incorrect password. For testing, use "password123" or 1-click demo buttons.');
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess(user);
      setIsSubmitting(false);
    }, 400);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');

    if (!signUpName.trim()) {
      setSignUpError('Please provide your full name with credentials (e.g., Mrs. Maria Santos, RGC).');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setSignUpError('Please provide a valid institutional email address.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const registered = getRegisteredCounselors();
      const existing = registered.find(
        c => c.email.toLowerCase() === signUpEmail.trim().toLowerCase()
      );

      if (existing) {
        setSignUpError('An account with this email address already exists. Please log in.');
        setIsSubmitting(false);
        return;
      }

      // Generate initials
      const nameParts = signUpName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, '').trim().split(' ');
      const initials = nameParts.length >= 2 
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : signUpName.slice(0, 2).toUpperCase();

      const newCounselor: RegisteredCounselor = {
        id: `csl_custom_${Date.now()}`,
        name: signUpName.trim(),
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        title: signUpTitle.trim() || 'Guidance Counselor',
        licenseNo: signUpLicense.trim() ? `PRC RGC-${signUpLicense.trim().replace(/^PRC\s*RGC-?/i, '')}` : 'DepEd Guidance Personnel',
        department: signUpDepartment.trim() || 'Guidance & Counseling Services Office',
        assignedCluster: signUpCluster.trim() || 'All SHS Academic & TechPro Clusters',
        initials,
        phoneNumber: signUpPhone.trim() || '+63 917 000 0000',
        dutyHours: 'Mon - Fri (8:00 AM - 5:00 PM)',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        status: 'on_duty'
      };

      const updatedList = [newCounselor, ...registered];
      saveRegisteredCounselors(updatedList);
      setSignUpSuccess(true);

      setTimeout(() => {
        onLoginSuccess(newCounselor);
        setIsSubmitting(false);
      }, 700);
    }, 500);
  };

  return (
    <div
      id="counselor-auth-portal"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 min-h-[calc(100vh-6rem)] flex items-center justify-center"
    >
      <div
        className={`w-full rounded-3xl border shadow-xl overflow-hidden backdrop-blur-md transition-all duration-300 ${
          isDarkMode
            ? 'bg-[#1D1714]/95 border-[#3D322A] shadow-black/50'
            : 'bg-white/95 border-[#EFE3D5] shadow-[#E8DACB]/50'
        }`}
      >
        {/* Top Header Banner with School Seal */}
        <div
          className={`p-6 sm:p-8 text-center border-b relative overflow-hidden ${
            isDarkMode
              ? 'bg-gradient-to-b from-[#2A2019] to-[#1D1714] border-[#382E27]'
              : 'bg-gradient-to-b from-[#FAF4EC] to-[#F5ECE0] border-[#EAE0D2]'
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-3">
            {/* School Seal */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-white shadow-md ring-2 ring-amber-500/30 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="Cabiao National Senior High School Seal"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <span className={`text-base sm:text-lg font-black tracking-tight ${isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'}`}>
                  Cabiao National Senior High School
                </span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Guidance &amp; Counseling Portal Access</span>
              </p>
              <p className={`text-xs max-w-lg mx-auto ${isDarkMode ? 'text-[#A8988A]' : 'text-[#7D665B]'}`}>
                Authorized guidance counselors and mental health facilitators must authenticate to triage student welfare alerts, mood analytics, and intervention queues.
              </p>
            </div>

            {/* Mode Switcher Tabs: Sign In / Register */}
            <div
              className={`inline-flex p-1 rounded-2xl border mt-2 ${
                isDarkMode ? 'bg-[#15100D] border-[#382E27]' : 'bg-[#EFE5D8] border-[#DFD3C4]'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                }}
                className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? isDarkMode
                      ? 'bg-[#D4A373] text-[#1E1712] shadow-xs'
                      : 'bg-[#8F5B34] text-white shadow-xs'
                    : isDarkMode
                      ? 'text-[#9A897B] hover:text-[#EDE5DB]'
                      : 'text-[#7D665B] hover:text-[#3D2C2C]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Counselor Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setSignUpError('');
                }}
                className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? isDarkMode
                      ? 'bg-[#D4A373] text-[#1E1712] shadow-xs'
                      : 'bg-[#8F5B34] text-white shadow-xs'
                    : isDarkMode
                      ? 'text-[#9A897B] hover:text-[#EDE5DB]'
                      : 'text-[#7D665B] hover:text-[#3D2C2C]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Counselor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left Form: Counselor Email & Password */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'}`}>
                      Sign in with your Counselor Account
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D665B]'}`}>
                      Enter your official Cabiao SHS guidance credentials below.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        DepEd / School Email Address
                      </label>
                      <div className="relative">
                        <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="elena.reyes@cabiaoshs.edu.ph"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                          Password
                        </label>
                        <span className={`text-[11px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                          Demo: <code className="font-mono">password123</code>
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-2.5 p-1 rounded-md transition-colors cursor-pointer ${
                            isDarkMode ? 'text-[#8A796B] hover:text-[#EDE5DB]' : 'text-[#9C8888] hover:text-[#3D2C2C]'
                          }`}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md ${
                        isDarkMode
                          ? 'bg-[#D4A373] hover:bg-[#C28F5E] text-[#1E1712]'
                          : 'bg-[#8F5B34] hover:bg-[#784823] text-white'
                      } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <span>{isSubmitting ? 'Authenticating...' : 'Access Counselor Dashboard'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Legal & Privacy Disclaimer */}
                  <div
                    className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start space-x-2 ${
                      isDarkMode
                        ? 'bg-[#191411] border-[#302620] text-[#9E8E81]'
                        : 'bg-[#FAF6F0] border-[#EFE5D8] text-[#7D6B5E]'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />
                    <p>
                      <strong>Confidentiality Notice:</strong> In compliance with the Guidance and Counseling Act (R.A. 9258) and Data Privacy Act (R.A. 10173), student emotional check-ins are restricted to licensed counselors and authorized school administrators.
                    </p>
                  </div>
                </div>

                {/* Right Column: 1-Click Quick Demo Counselor Logins */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="space-y-1">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                      isDarkMode ? 'text-[#E0A868]' : 'text-[#8F5B34]'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>1-Click Guidance Counselor Demo Accounts</span>
                    </span>
                    <p className={`text-[11px] ${isDarkMode ? 'text-[#968677]' : 'text-[#8C7575]'}`}>
                      Click any registered counselor to instantly simulate their session and active alerts:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {DEFAULT_COUNSELORS.map((counselor) => (
                      <button
                        key={counselor.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(counselor)}
                        disabled={isSubmitting}
                        className={`w-full p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center space-x-3 group ${
                          isDarkMode
                            ? 'bg-[#221B17] hover:bg-[#2E241E] border-[#382D25] hover:border-[#5C4533]'
                            : 'bg-[#FAF6F0] hover:bg-[#F4ECE0] border-[#EFE2D2] hover:border-[#DEC5AB]'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isDarkMode
                              ? 'bg-[#382A1F] text-[#F3D5B5] ring-1 ring-[#5C4533]'
                              : 'bg-[#EBDCCB] text-[#5C3B20] ring-1 ring-[#D8C2AA]'
                          }`}
                        >
                          {counselor.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-xs sm:text-[13px] font-bold truncate ${
                              isDarkMode ? 'text-[#EDE5DB] group-hover:text-amber-300' : 'text-[#3D2C2C] group-hover:text-amber-800'
                            }`}>
                              {counselor.name}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active on duty" />
                          </div>
                          <p className={`text-[11px] truncate ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                            {counselor.title} • {counselor.licenseNo}
                          </p>
                          <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-[#8A796B]' : 'text-[#968276]'}`}>
                            📍 {counselor.assignedCluster}
                          </p>
                        </div>
                        <ArrowRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                          isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto space-y-4"
              >
                <div className="text-center space-y-1">
                  <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'}`}>
                    Register Guidance Counselor / Administrator
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D665B]'}`}>
                    Create an institutional counselor profile to manage student mental health interventions and triage queues.
                  </p>
                </div>

                {signUpError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{signUpError}</span>
                  </div>
                )}

                {signUpSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Counselor account created successfully! Opening Guidance Portal...</span>
                  </div>
                )}

                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        Full Name with Honorifics &amp; Title *
                      </label>
                      <div className="relative">
                        <User className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="text"
                          required
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          placeholder="e.g. Dr. Rowena V. Morales, RGC"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        Designation / Role *
                      </label>
                      <div className="relative">
                        <BadgeCheck className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="text"
                          required
                          value={signUpTitle}
                          onChange={(e) => setSignUpTitle(e.target.value)}
                          placeholder="e.g. Guidance Counselor II"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        PRC License / DepEd Employee ID
                      </label>
                      <div className="relative">
                        <FileBadge className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="text"
                          value={signUpLicense}
                          onChange={(e) => setSignUpLicense(e.target.value)}
                          placeholder="e.g. PRC RGC-014920"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        Assigned Track / Clusters
                      </label>
                      <div className="relative">
                        <Building2 className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="text"
                          value={signUpCluster}
                          onChange={(e) => setSignUpCluster(e.target.value)}
                          placeholder="e.g. TVL &amp; STEM Clusters"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        Official DepEd / School Email *
                      </label>
                      <div className="relative">
                        <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="rowena.morales@cabiaoshs.edu.ph"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        Contact Number / Office Ext.
                      </label>
                      <div className="relative">
                        <Phone className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="text"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          placeholder="+63 917 123 4567"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        Password (Min. 6 chars) *
                      </label>
                      <div className="relative">
                        <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="password"
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}`}>
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
                        <input
                          type="password"
                          required
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                              : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md ${
                      isDarkMode
                        ? 'bg-[#D4A373] hover:bg-[#C28F5E] text-[#1E1712]'
                        : 'bg-[#8F5B34] hover:bg-[#784823] text-white'
                    } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span>{isSubmitting ? 'Creating Counselor Account...' : 'Complete Counselor Registration & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
