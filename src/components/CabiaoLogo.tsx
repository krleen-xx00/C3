import React from 'react';

interface CabiaoLogoProps {
  className?: string;
  size?: number;
  alt?: string;
  showRing?: boolean;
}

export const CabiaoLogo: React.FC<CabiaoLogoProps> = ({
  className = "w-16 h-16 sm:w-20 sm:h-20",
  alt = "Cabiao Senior High School Official Logo",
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/logo.png"
        alt={alt}
        className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
        loading="eager"
        draggable={false}
      />
    </div>
  );
};
