import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  BadgeCheck,
  FileBadge,
  Building2,
  Mail,
  Phone,
  Clock,
  LogOut,
  Calendar,
  Sparkles
} from 'lucide-react';
import { CounselorUser } from '../../types';

interface CounselorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  counselor: CounselorUser;
  isDarkMode: boolean;
  onSignOut: () => void;
}

export const CounselorProfileModal: React.FC<CounselorProfileModalProps> = ({
  isOpen,
  onClose,
  counselor,
  isDarkMode,
  onSignOut
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all ${
            isDarkMode
              ? 'bg-[#1E1714] border-[#3D322B] text-[#EDE5DB]'
              : 'bg-white border-[#EFE2D2] text-[#3D2C2C]'
          }`}
        >
          {/* Header Banner with Seal */}
          <div
            className={`p-6 border-b text-center relative ${
              isDarkMode
                ? 'bg-gradient-to-b from-[#2B2019] to-[#1E1714] border-[#382E27]'
                : 'bg-gradient-to-b from-[#FAF4EC] to-[#F5ECE0] border-[#EAE0D2]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-[#A09080] hover:text-white hover:bg-[#382E27]'
                  : 'text-[#7D6B5E] hover:text-[#3D2C2C] hover:bg-[#EAE0D2]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Counselor Avatar Medallion */}
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-md ${
                  isDarkMode
                    ? 'bg-[#3A2A1E] text-[#F3D5B5] ring-2 ring-[#5C4533]'
                    : 'bg-[#EBDCCB] text-[#5C3B20] ring-2 ring-[#D8C2AA]'
                }`}
              >
                {counselor.initials}
              </div>

              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold tracking-tight">
                  {counselor.name}
                </h3>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {counselor.title}
                </p>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Authenticated &amp; On Duty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-3.5 text-xs">
            <div
              className={`p-3 rounded-xl border flex items-center space-x-3 ${
                isDarkMode ? 'bg-[#16110E] border-[#302620]' : 'bg-[#FAF7F2] border-[#EFE5D8]'
              }`}
            >
              <FileBadge className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Professional License / ID
                </span>
                <span className="font-bold">{counselor.licenseNo || 'PRC Registered Guidance Counselor'}</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center space-x-3 ${
                isDarkMode ? 'bg-[#16110E] border-[#302620]' : 'bg-[#FAF7F2] border-[#EFE5D8]'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Assigned Department &amp; Clusters
                </span>
                <span className="font-bold">{counselor.department}</span>
                <p className="text-[11px] opacity-80 mt-0.5">📍 {counselor.assignedCluster || 'All Senior High Clusters'}</p>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center space-x-3 ${
                isDarkMode ? 'bg-[#16110E] border-[#302620]' : 'bg-[#FAF7F2] border-[#EFE5D8]'
              }`}
            >
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Official DepEd Email
                </span>
                <span className="font-mono text-[11px] font-semibold">{counselor.email}</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center space-x-3 ${
                isDarkMode ? 'bg-[#16110E] border-[#302620]' : 'bg-[#FAF7F2] border-[#EFE5D8]'
              }`}
            >
              <Clock className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Office Duty Hours
                </span>
                <span className="font-semibold">{counselor.dutyHours || 'Mon - Fri (8:00 AM - 5:00 PM)'}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className={`p-4 border-t flex items-center justify-between gap-2 ${
              isDarkMode ? 'bg-[#16110E] border-[#302620]' : 'bg-[#FAF7F2] border-[#EFE5D8]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-[#3D332B] text-[#D8C7B5] hover:bg-[#251E19]'
                  : 'border-[#DEC5AB] text-[#5C4533] hover:bg-[#EFE5D8]'
              }`}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Counselor</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
