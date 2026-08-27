import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { Sparkles, Shield, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState<string>('maria.santos@cabiaoshs.edu.ph');
  const [password, setPassword] = useState<string>('student123');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [gradeSection, setGradeSection] = useState<string>('Grade 11 - STEM');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: name || 'Student User',
        email,
        role: selectedRole,
        avatar: selectedRole === 'student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        gradeSection: selectedRole === 'student' ? gradeSection : undefined,
        department: selectedRole === 'counselor' ? 'Guidance Office - Cabiao SHS' : undefined
      };
      onLogin(newUser);
    } else {
      const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        onLogin(found);
      } else {
        const customUser: User = {
          id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: selectedRole,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          gradeSection: 'Grade 12 - Cabiao SHS'
        };
        onLogin(customUser);
      }
    }
  };

  const loginAsDemoUser = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Decorative Blobs */}
      <div className="absolute top-12 left-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-10 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        
        {/* Logo */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center mb-4">
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Cabiao National Senior High School logo"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome to <span className="text-emerald-500">C3</span>
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Cabiao Senior High School • AI Companion System
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Research Prototype for Emotional Well-Being & Support
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* QUICK DEMO LOGIN BOX FOR EVALUATORS */}
        <div className="mb-6 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Quick 1-Click Demo Login (For Evaluators)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => loginAsDemoUser('std_maria_santos')}
              className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-left transition-all group"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">👩‍🎓</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Maria Santos</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Student (Grade 12 STEM)</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                Enter Student View →
              </span>
            </button>

            <button
              type="button"
              onClick={() => loginAsDemoUser('csl_elena_reyes')}
              className="p-3 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 hover:from-indigo-500/20 hover:to-sky-500/20 rounded-xl border border-indigo-200 dark:border-indigo-800 text-left transition-all group"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">👩‍🏫</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Mrs. Elena Reyes</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Guidance Counselor</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                Enter Counselor View →
              </span>
            </button>
          </div>
        </div>

        {/* Standard Form Box */}
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800">
          
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setEmail('maria.santos@cabiaoshs.edu.ph');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                selectedRole === 'student'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('counselor');
                setEmail('elena.reyes@cabiaoshs.edu.ph');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                selectedRole === 'counselor'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Counselor Portal</span>
            </button>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clara Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            )}

            {isRegistering && selectedRole === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Grade & Track / Section</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 12 - STEM A"
                  value={gradeSection}
                  onChange={(e) => setGradeSection(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">School Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cabiaoshs.edu.ph"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 ${
                selectedRole === 'student'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-600/25'
              }`}
            >
              <span>{isRegistering ? 'Create Account' : `Sign In as ${selectedRole === 'student' ? 'Student' : 'Counselor'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              {isRegistering ? 'Already have a Cabiao SHS account? Sign in' : "Don't have an account? Register new student"}
            </button>
          </div>

        </div>

        {/* Footnote */}
        <p className="text-[11px] text-center text-slate-400 mt-6">
          Cabiao Senior High School Mental Health Support Prototype • Safe & Confidential
        </p>

      </div>
    </div>
  );
};
