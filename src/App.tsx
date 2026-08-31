import React, { useState, useEffect } from 'react';
import { User, CompanionId, MoodLog, CrisisAlert, AcademicClusterId, UserStressLevel } from './types';
import { MOCK_USERS, INITIAL_MOOD_LOGS, INITIAL_CRISIS_ALERTS } from './data/mockData';
import { StudentDashboard } from './components/student/StudentDashboard';
import { CompanionRoomView } from './components/student/CompanionRoomView';
import { AboutUsView } from './components/student/AboutUsView';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { ViewSwitcher, AppViewMode } from './components/ViewSwitcher';
import { CrisisModal } from './components/CrisisModal';
import { NightModeToggle } from './components/NightModeToggle';
import { SchoolHeaderStamp } from './components/SchoolHeaderStamp';
import { PersistentCrisisButton } from './components/PersistentCrisisButton';

export default function App() {
  const [currentUser] = useState<User>(MOCK_USERS[0]); // Maria Santos (Student)
  const [viewMode, setViewMode] = useState<AppViewMode>('student');
  const [activeCompanionRoom, setActiveCompanionRoom] = useState<CompanionId | null>('casti');
  
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

  const handleOpenEmergencyCrisis = (isTier3: boolean = true) => {
    setIsTier3Emergency(isTier3);
    setIsCrisisModalOpen(true);
  };

  const handleOpenAlwaysOnCrisis = () => {
    setIsTier3Emergency(false);
    setIsCrisisModalOpen(true);
  };

  const handleViewChange = (mode: AppViewMode) => {
    setViewMode(mode);
    if (mode === 'companions' && !activeCompanionRoom) {
      setActiveCompanionRoom('casti');
    }
  };

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

      {/* Top Left School Logo Stamp (Subtle branding) - Shown on student and counselor dashboard views */}
      {(viewMode === 'student' || viewMode === 'counselor') && (
        <SchoolHeaderStamp isDarkMode={isDarkMode} />
      )}

      {/* Top Right Header Controls: 4-Way View Switcher (Student / AI Companions / Counselor / About) + Night Toggle */}
      <div className="fixed right-2 sm:right-6 top-3 sm:top-4 z-40 flex items-center space-x-1.5 sm:space-x-2.5">
        <ViewSwitcher
          viewMode={viewMode}
          onViewChange={handleViewChange}
          isDarkMode={isDarkMode}
        />
        <NightModeToggle
          isDarkMode={isDarkMode}
          onToggle={toggleNightMode}
          className="relative"
        />
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full pb-16 md:pb-0">
        {viewMode === 'about' ? (
          <AboutUsView
            isDarkMode={isDarkMode}
            onBackToDashboard={() => handleViewChange('student')}
          />
        ) : viewMode === 'counselor' ? (
          <CounselorDashboard isDarkMode={isDarkMode} />
        ) : viewMode === 'companions' ? (
          <CompanionRoomView
            currentUser={currentUser}
            companionId={activeCompanionRoom || 'casti'}
            isDarkMode={isDarkMode}
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
      {viewMode === 'student' && (
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

    </div>
  );
}
