import React, { useState, useEffect } from 'react';
import { User, CompanionId, MoodLog, CrisisAlert, AcademicClusterId, UserStressLevel } from './types';
import { MOCK_USERS, INITIAL_MOOD_LOGS, INITIAL_CRISIS_ALERTS } from './data/mockData';
import { StudentDashboard } from './components/student/StudentDashboard';
import { CompanionRoomView } from './components/student/CompanionRoomView';
import { AboutUsView } from './components/student/AboutUsView';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { AppViewMode } from './components/ViewSwitcher';
import { TopNavbar } from './components/TopNavbar';
import { CrisisModal } from './components/CrisisModal';
import { PersistentCrisisButton } from './components/PersistentCrisisButton';
import { StudentAuthModal } from './components/StudentAuthModal';
import { StudentAuthView } from './components/student/StudentAuthView';
import { DeploymentMode } from './components/DeploymentModeSwitcher';
import { RouteBadge } from './components/RouteBadge';

function getInitialDeploymentMode(): DeploymentMode {
  if (typeof window === 'undefined') return 'all';
  const path = window.location.pathname.toLowerCase();
  if (path === '/student' || path.startsWith('/student/')) return 'student';
  if (path === '/counselor' || path.startsWith('/counselor/')) return 'counselor';
  
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get('mode')?.toLowerCase();
  if (modeParam === 'student') return 'student';
  if (modeParam === 'counselor') return 'counselor';
  if (modeParam === 'all' || modeParam === 'prototype') return 'all';

  try {
    const saved = localStorage.getItem('c3-deployment-mode');
    if (saved === 'student' || saved === 'counselor' || saved === 'all') {
      return saved as DeploymentMode;
    }
  } catch {}

  return 'all';
}

export default function App() {
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>(getInitialDeploymentMode);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('c3-student-user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return MOCK_USERS[0]; // Maria Santos (Student)
  });

  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem('c3-student-authenticated');
      if (auth !== null) return auth === 'true';
      return !!localStorage.getItem('c3-student-user');
    } catch {
      return false;
    }
  });

  const handleStudentAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsStudentAuthenticated(true);
    try {
      localStorage.setItem('c3-student-user', JSON.stringify(user));
      localStorage.setItem('c3-student-authenticated', 'true');
      if (user.name) {
        const first = user.name.split(' ')[0];
        setPreferredName(first);
        localStorage.setItem('c3-preferred-name', first);
      }
      if (user.academicClusterId) {
        setAcademicClusterId(user.academicClusterId);
        localStorage.setItem('c3-academic-cluster', user.academicClusterId);
      }
    } catch {}
  };

  const handleStudentLogout = () => {
    setIsStudentAuthenticated(false);
    try {
      localStorage.setItem('c3-student-authenticated', 'false');
    } catch {}
    setViewMode('student');
  };
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    const init = getInitialDeploymentMode();
    if (init === 'counselor') return 'counselor';
    return 'student';
  });
  const [activeCompanionRoom, setActiveCompanionRoom] = useState<CompanionId | null>('casti');
  
  // Modal for Student School Account
  const [isStudentAuthModalOpen, setIsStudentAuthModalOpen] = useState<boolean>(false);
  
  // Personalization state (shared between dashboard and companion room)
  const [preferredName, setPreferredName] = useState<string>(() => {
    try {
      return localStorage.getItem('c3-preferred-name') || 'Maria';
    } catch { return 'Maria'; }
  });
  const [academicClusterId, setAcademicClusterId] = useState<AcademicClusterId>(() => {
    try {
      const saved = localStorage.getItem('c3-academic-cluster');
      return (saved as AcademicClusterId) || 'tp-ict';
    } catch { return 'tp-ict'; }
  });
  const [stressLevel, setStressLevel] = useState<UserStressLevel>(() => {
    try {
      const saved = Number(localStorage.getItem('c3-stress-level'));
      return (saved >= 1 && saved <= 10 ? saved : 5) as UserStressLevel;
    } catch { return 5; }
  });

  const handleChangePreferredName = (name: string) => {
    setPreferredName(name);
    try { localStorage.setItem('c3-preferred-name', name); } catch {}
  };
  const handleChangeAcademicCluster = (id: AcademicClusterId) => {
    setAcademicClusterId(id);
    try { localStorage.setItem('c3-academic-cluster', id); } catch {}
  };
  const handleChangeStressLevel = (level: UserStressLevel) => {
    setStressLevel(level);
    try { localStorage.setItem('c3-stress-level', String(level)); } catch {}
  };

  // App state synchronized with backend
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(INITIAL_MOOD_LOGS);
  const [, setCrisisAlerts] = useState<CrisisAlert[]>(INITIAL_CRISIS_ALERTS);

  // Crisis Modal State
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);
  const [isTier3Emergency, setIsTier3Emergency] = useState<boolean>(false);

  // Night Mode state with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('c3-night-mode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleNightMode = () => {
    setIsDarkMode(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem('c3-night-mode', JSON.stringify(nextVal));
      } catch (e) {
        console.error("Failed to save night mode preference", e);
      }
      return nextVal;
    });
  };

  // Sync state with server on mount
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.moodLogs) setMoodLogs(data.moodLogs);
          if (data.crisisAlerts) setCrisisAlerts(data.crisisAlerts);
        }
      } catch (err) {
        console.error("Error syncing server state:", err);
      }
    };
    fetchState();
  }, []);

  const handleAddMoodLog = async (logData: Omit<MoodLog, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      const data = await res.json();
      if (data.success && data.moodLog) {
        setMoodLogs(prev => [data.moodLog, ...prev]);
      }
    } catch {
      const newLog: MoodLog = {
        ...logData,
        id: `ml_local_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      setMoodLogs(prev => [newLog, ...prev]);
    }
  };

  const handleSelectDeploymentMode = (mode: DeploymentMode) => {
    setDeploymentMode(mode);
    try {
      localStorage.setItem('c3-deployment-mode', mode);
    } catch {}

    const newPath = mode === 'student' ? '/student' : mode === 'counselor' ? '/counselor' : '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ mode }, '', newPath);
    }

    if (mode === 'counselor') {
      setViewMode('counselor');
    } else if (mode === 'student') {
      setViewMode(prev => prev === 'counselor' ? 'student' : prev);
    }
  };

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const currentMode = getInitialDeploymentMode();
      setDeploymentMode(currentMode);
      if (currentMode === 'counselor') {
        setViewMode('counselor');
      } else if (currentMode === 'student') {
        setViewMode(prev => prev === 'counselor' ? 'student' : prev);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenEmergencyCrisis = (isTier3: boolean = true) => {
    setIsTier3Emergency(isTier3);
    setIsCrisisModalOpen(true);
  };

  const handleOpenAlwaysOnCrisis = () => {
    setIsTier3Emergency(false);
    setIsCrisisModalOpen(true);
  };

  const handleViewChange = (mode: AppViewMode) => {
    // Prevent switching to counselor portal in isolated student deployment mode
    if (deploymentMode === 'student' && mode === 'counselor') {
      return;
    }
    // In isolated counselor deployment mode, keep counselor focus unless about
    if (deploymentMode === 'counselor' && (mode === 'student' || mode === 'companions')) {
      return;
    }
    setViewMode(mode);
    if (mode === 'companions' && !activeCompanionRoom) {
      setActiveCompanionRoom('casti');
    }
  };

  // Enforce isolated routing bounds
  const effectiveViewMode: AppViewMode =
    deploymentMode === 'counselor'
      ? 'counselor'
      : deploymentMode === 'student' && viewMode === 'counselor'
      ? 'student'
      : viewMode;

  const todayStr = new Date().toISOString().split('T')[0];
  const latestMoodLog = moodLogs.find(l => l.studentId === currentUser.id && l.date === todayStr) || moodLogs[0];

  return (
    <div className={`relative min-h-screen transition-colors duration-500 font-sans antialiased overflow-x-hidden ${
      isDarkMode
        ? 'bg-gradient-to-b from-[#181412] via-[#1E1916] to-[#151210] text-[#EDE5DB] selection:bg-[#47382B] selection:text-[#EDE5DB]'
        : 'bg-gradient-to-b from-[#FAF7F2] via-[#FAF3EC] to-[#F5EEE6] text-[#3D2C2C] selection:bg-[#E8D4C4] selection:text-[#3D2C2C]'
    }`}>
      
      {/* Decorative Soft Glowing Background Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Top-Left Peach/Rose Ambient Glow */}
        <div className={`absolute -top-28 -left-28 w-[480px] h-[480px] rounded-full blur-3xl transition-opacity duration-700 ${
          isDarkMode
            ? 'bg-[#3D251C]/25 opacity-40'
            : 'bg-[#FCE6DB]/70 opacity-80'
        }`} />
        
        {/* Top-Right Soft Lavender Ambient Glow */}
        <div className={`absolute -top-20 -right-24 w-[460px] h-[460px] rounded-full blur-3xl transition-opacity duration-700 ${
          isDarkMode
            ? 'bg-[#291E3B]/30 opacity-40'
            : 'bg-[#EDE5F8]/60 opacity-80'
        }`} />
        
        {/* Mid-Left Sage Ambient Glow */}
        <div className={`absolute top-1/2 -left-32 w-[420px] h-[420px] rounded-full blur-3xl transition-opacity duration-700 ${
          isDarkMode
            ? 'bg-[#1D2C20]/25 opacity-30'
            : 'bg-[#E3F2E7]/55 opacity-70'
        }`} />

        {/* Bottom Warm Golden Ambient Glow */}
        <div className={`absolute bottom-0 right-1/4 w-[520px] h-[380px] rounded-full blur-3xl transition-opacity duration-700 ${
          isDarkMode
            ? 'bg-[#362719]/25 opacity-35'
            : 'bg-[#FAE8D4]/60 opacity-75'
        }`} />
      </div>

      {/* Unified Top Navigation Header: School Seal & Title + ViewSwitcher + Deployment Mode + NightMode Toggle */}
      <TopNavbar
        viewMode={effectiveViewMode}
        onViewChange={handleViewChange}
        isDarkMode={isDarkMode}
        onToggleNightMode={toggleNightMode}
        currentUser={isStudentAuthenticated ? currentUser : undefined}
        onOpenStudentAuth={() => setIsStudentAuthModalOpen(true)}
        onStudentLogout={isStudentAuthenticated ? handleStudentLogout : undefined}
        deploymentMode={deploymentMode}
        onSelectDeploymentMode={handleSelectDeploymentMode}
      />

      {/* Main Container */}
      <main className="relative z-10 w-full pb-16 md:pb-0">
        {effectiveViewMode === 'about' ? (
          <AboutUsView
            isDarkMode={isDarkMode}
            onBackToDashboard={() => handleViewChange('student')}
          />
        ) : effectiveViewMode === 'counselor' ? (
          <CounselorDashboard isDarkMode={isDarkMode} />
        ) : !isStudentAuthenticated ? (
          <StudentAuthView
            isDarkMode={isDarkMode}
            onLoginSuccess={handleStudentAuthSuccess}
          />
        ) : effectiveViewMode === 'companions' ? (
          <CompanionRoomView
            currentUser={currentUser}
            companionId={activeCompanionRoom || 'casti'}
            isDarkMode={isDarkMode}
            deploymentMode={deploymentMode}
            latestMoodLog={latestMoodLog}
            preferredName={preferredName}
            academicClusterId={academicClusterId}
            stressLevel={stressLevel}
            onBackToDashboard={() => { handleViewChange('student'); }}
            onSwitchCompanionRoom={(id) => setActiveCompanionRoom(id)}
            onCrisisTriggered={handleOpenEmergencyCrisis}
          />
        ) : (
          <StudentDashboard
            currentUser={currentUser}
            moodLogs={moodLogs}
            isDarkMode={isDarkMode}
            onAddMoodLog={handleAddMoodLog}
            onOpenCompanionRoom={(id) => {
              setActiveCompanionRoom(id);
              setViewMode('companions');
            }}
            onOpenAbout={() => handleViewChange('about')}
            onCrisisTriggered={handleOpenEmergencyCrisis}
            preferredName={preferredName}
            onChangePreferredName={handleChangePreferredName}
            academicClusterId={academicClusterId}
            onChangeAcademicCluster={handleChangeAcademicCluster}
            stressLevel={stressLevel}
            onChangeStressLevel={handleChangeStressLevel}
          />
        )}
      </main>

      {/* Student View Only: Persistent 24/7 Always-On Crisis Support Button & Interstitial Modal */}
      {isStudentAuthenticated && (effectiveViewMode === 'student' || (deploymentMode === 'student' && effectiveViewMode !== 'about')) && (
        <>
          <PersistentCrisisButton
            onClick={handleOpenAlwaysOnCrisis}
            isDarkMode={isDarkMode}
          />

          <CrisisModal
            isOpen={isCrisisModalOpen}
            onClose={() => setIsCrisisModalOpen(false)}
            studentName={currentUser.name.split(' ')[0]}
            isDarkMode={isDarkMode}
            isTier3Emergency={isTier3Emergency}
            onContactGuidance={() => {
              // Guidance notification handling
            }}
          />
        </>
      )}

      {/* Student School Account Profile & Login Modal */}
      <StudentAuthModal
        isOpen={isStudentAuthModalOpen}
        onClose={() => setIsStudentAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('c3-student-user', JSON.stringify(user));
            if (user.academicClusterId) {
              setAcademicClusterId(user.academicClusterId);
              localStorage.setItem('c3-academic-cluster', user.academicClusterId);
            }
            if (user.name) {
              const firstName = user.name.split(' ')[0];
              setPreferredName(firstName);
              localStorage.setItem('c3-preferred-name', firstName);
            }
          } catch {}
        }}
        isDarkMode={isDarkMode}
      />

      {/* Floating Deployment Route Simulator Badge */}
      <RouteBadge
        deploymentMode={deploymentMode}
        onSelectDeploymentMode={handleSelectDeploymentMode}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
