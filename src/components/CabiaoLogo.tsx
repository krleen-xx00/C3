import React from 'react';

interface CabiaoLogoProps {
  className?: string;
  size?: number;
  alt?: string;
  showRing?: boolean;
}

export const CabiaoLogo: React.FC<CabiaoLogoProps> = ({
  className = "w-10 h-10 sm:w-11 sm:h-11",
  alt = "Cabiao National Senior High School Official Logo",
  showRing = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${
        showRing
          ? 'ring-2 ring-emerald-700/40 dark:ring-emerald-400/50 shadow-sm'
          : ''
      } ${className}`}
    >
      <img
        src="/logo.jpg"
        alt={alt}
        className="w-full h-full object-contain select-none pointer-events-none"
        loading="eager"
        draggable={false}
      />
    </div>
  );
};
