import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Sparkles, SlidersHorizontal, LayoutGrid, Settings, Check } from 'lucide-react';
import { InspirationSource, AcademicClusterId, UserStressLevel } from '../../types';
import { ACADEMIC_CLUSTERS, ACADEMIC_TRACK_LABELS, getClustersByTrack } from '../../data/academicTracks';

interface PersonalizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  academicClusterId: AcademicClusterId;
  onChangeAcademicCluster: (id: AcademicClusterId) => void;
  stressLevel: UserStressLevel;
  onChangeStressLevel: (level: UserStressLevel) => void;
  inspirationSource: InspirationSource;
  onChangeInspirationSource: (source: InspirationSource) => void;
  preferredName: string;
  onChangePreferredName: (name: string) => void;
}

const STRESS_DESCRIPTIONS: Record<UserStressLevel, string> = {
  1: 'Very relaxed',
  2: 'Light & easy',
  3: 'Slightly busy',
  4: 'A little pressured',
  5: 'Moderate',
  6: 'Somewhat stressed',
  7: 'Stressed',
  8: 'Quite stressed',
  9: 'Very stressed',
  10: 'Overwhelmed'
};

export const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  academicClusterId,
  onChangeAcademicCluster,
  stressLevel,
  onChangeStressLevel,
  inspirationSource,
  onChangeInspirationSource,
  preferredName,
  onChangePreferredName
}) => {
  if (!isOpen) return null;

  const academicClusters = getClustersByTrack('academic');
  const techproClusters = getClustersByTrack('techpro');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl p-6 space-y-5 transition-colors ${
          isDarkMode
            ? 'bg-[#221C1A] text-[#EDE5DB] border border-[#3D352F] shadow-2xl'
            : 'bg-[#FAF7F2] text-[#3D2C2C] border border-[#EAE2D5] shadow-xl'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Personalize Your Companion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Make your AI companion feel like it knows you and your track
            </p>
          </div>
        </div>

        {/* Preferred Name */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            What should we call you?
          </label>
          <input
            type="text"
            value={preferredName}
            onChange={(e) => onChangePreferredName(e.target.value)}
            placeholder="e.g. Maria"
            maxLength={24}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
              isDarkMode
                ? 'bg-[#1A1614] border-[#3D332B] text-[#EDE5DB] placeholder-[#786D63] focus:ring-1 focus:ring-[#8C7662]'
                : 'bg-white border-[#E8DDD0] text-[#3D2C2C] placeholder-[#A69797] focus:ring-1 focus:ring-[#C9B39F]'
            }`}
          />
        </div>

        {/* Academic Track Select */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Your academic track &amp; strand</span>
          </label>
          <div className="relative">
            <select
              value={academicClusterId}
              onChange={(e) => onChangeAcademicCluster(e.target.value as AcademicClusterId)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none appearance-none cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-[#1A1614] border-[#3D332B] text-[#EDE5DB] focus:ring-1 focus:ring-[#8C7662]'
                  : 'bg-white border-[#E8DDD0] text-[#3D2C2C] focus:ring-1 focus:ring-[#C9B39F]'
              }`}
            >
              <optgroup label={ACADEMIC_TRACK_LABELS.academic}>
                {academicClusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={ACADEMIC_TRACK_LABELS.techpro}>
                {techproClusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400`}>
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <p className={`text-[11px] ${isDarkMode ? 'text-[#9E8F82]' : 'text-[#8C7A7A]'}`}>
            This helps Cali and the others talk about your real classes, projects, and deadlines.
          </p>
        </div>

        {/* Stress / Energy Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>Current load / stress</span>
            </label>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              isDarkMode ? 'bg-[#2C221D] text-amber-300 border-[#4D3F36]' : 'bg-white text-amber-700 border-amber-200'
            }`}>
              {stressLevel}/10 · {STRESS_DESCRIPTIONS[stressLevel]}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={stressLevel}
            onChange={(e) => onChangeStressLevel(Number(e.target.value) as UserStressLevel)}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Ease</span>
            <span>Heavy</span>
          </div>
        </div>

        {/* Inspiration Source */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Daily inspiration source
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            <div
              onClick={() => onChangeInspirationSource('affirmations')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                inspirationSource === 'affirmations'
                  ? isDarkMode
                    ? 'bg-[#2C221D] border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white border-amber-400/90 shadow-md ring-1 ring-amber-400/30'
                  : isDarkMode
                  ? 'bg-[#1A1614] border-[#332A24] hover:border-[#4D3F36]'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${
                inspirationSource === 'affirmations'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold">Affirmations</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Gentle, secular daily encouragements
                  </p>
                </div>
                {inspirationSource === 'affirmations' && <Check className="w-4 h-4 text-amber-500" />}
              </div>
            </div>

            <div
              onClick={() => onChangeInspirationSource('scripture')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                inspirationSource === 'scripture'
                  ? isDarkMode
                    ? 'bg-[#2C221D] border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white border-amber-400/90 shadow-md ring-1 ring-amber-400/30'
                  : isDarkMode
                  ? 'bg-[#1A1614] border-[#332A24] hover:border-[#4D3F36]'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${
                inspirationSource === 'scripture'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold">Scripture verses</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Calming Bible verses for reflection
                  </p>
                </div>
                {inspirationSource === 'scripture' && <Check className="w-4 h-4 text-amber-500" />}
              </div>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Save my preferences
          </button>
        </div>
      </motion.div>
    </div>
  );
};
