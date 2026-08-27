import React from 'react';

interface CabiaoLogoProps {
  className?: string;
  size?: number;
}

export const CabiaoLogo: React.FC<CabiaoLogoProps> = ({
  className = "w-10 h-10 sm:w-11 sm:h-11",
  size = 120
}) => {
  // Number of gear teeth on outer ring
  const numTeeth = 24;
  const teeth = Array.from({ length: numTeeth }, (_, i) => {
    const angle = (i * 360) / numTeeth;
    return (
      <rect
        key={i}
        x="55"
        y="1"
        width="10"
        height="10"
        rx="1.5"
        fill="#1E6B35"
        stroke="#114B23"
        strokeWidth="0.8"
        transform={`rotate(${angle} 60 60)`}
      />
    );
  });

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cabiao National Senior High School Official Logo"
    >
      <defs>
        {/* Curved text paths for circular typography */}
        <path
          id="cabiao-top-arc"
          d="M 18,60 A 42,42 0 1,1 102,60"
          fill="none"
        />
        <path
          id="cabiao-bottom-arc"
          d="M 100,60 A 40,40 0 0,1 20,60"
          fill="none"
        />
        <clipPath id="inner-circle-clip">
          <circle cx="60" cy="60" r="33" />
        </clipPath>
        <linearGradient id="torch-flame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#E53935" />
          <stop offset="50%" stopColor="#FB8C00" />
          <stop offset="100%" stopColor="#FFEB3B" />
        </linearGradient>
      </defs>

      {/* 1. Outer Green Gear Base */}
      <g>
        {teeth}
        {/* Main outer green circle */}
        <circle cx="60" cy="60" r="53" fill="#1E6B35" stroke="#0F3D1C" strokeWidth="1.2" />
        {/* Inner white text ring */}
        <circle cx="60" cy="60" r="46.5" fill="#FFFFFF" stroke="#0F3D1C" strokeWidth="1.2" />
        {/* Inner boundary circle */}
        <circle cx="60" cy="60" r="33.5" fill="#FFFFFF" stroke="#0F3D1C" strokeWidth="1.4" />
      </g>

      {/* 2. Ring Typography */}
      {/* Top Arc Text */}
      <text
        fill="#111827"
        fontSize="5.4"
        fontWeight="800"
        fontFamily="sans-serif"
        letterSpacing="0.6"
      >
        <textPath
          href="#cabiao-top-arc"
          startOffset="50%"
          textAnchor="middle"
        >
          CABIAO NATIONAL SENIOR HIGH SCHOOL
        </textPath>
      </text>

      {/* Bottom Arc Text */}
      <text
        fill="#111827"
        fontSize="5.2"
        fontWeight="800"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        <textPath
          href="#cabiao-bottom-arc"
          startOffset="50%"
          textAnchor="middle"
        >
          CABIAO, NUEVA ECIJA
        </textPath>
      </text>

      {/* Laurel branches on bottom left and right of ring */}
      <g fill="#1E6B35" stroke="#0F3D1C" strokeWidth="0.3">
        {/* Left branch */}
        <path d="M 23,67 Q 21,73 24,78 Q 23,73 25,69 Z" />
        <path d="M 25,68 C 21,69 20,72 23,73 C 24,72 26,70 25,68 Z" />
        <path d="M 27,74 C 23,76 23,79 26,79 C 27,78 28,75 27,74 Z" />
        {/* Right branch */}
        <path d="M 97,67 Q 99,73 96,78 Q 97,73 95,69 Z" />
        <path d="M 95,68 C 99,69 100,72 97,73 C 96,72 94,70 95,68 Z" />
        <path d="M 93,74 C 97,76 97,79 94,79 C 93,78 92,75 93,74 Z" />
      </g>

      {/* 3. Inner Center Emblem Shield */}
      <g clipPath="url(#inner-circle-clip)">
        {/* Background split (Philippine flag colors: Blue, Red, White, Yellow) */}
        {/* Top-left Blue */}
        <path d="M 27,27 L 60,60 L 27,60 Z" fill="#1565C0" />
        {/* Top-right Red */}
        <path d="M 27,27 L 93,27 L 93,60 L 60,60 Z" fill="#D32F2F" />
        {/* Bottom Red/Yellow sweep */}
        <path d="M 27,60 L 60,60 L 93,60 L 93,93 L 27,93 Z" fill="#FDD835" />
        {/* Diagonal White triangle */}
        <polygon points="27,27 27,93 64,60" fill="#FFFFFF" />

        {/* 4. Open Book at the Top with Torch */}
        {/* Open Book Pages */}
        <g stroke="#111827" strokeWidth="0.8">
          {/* Left Page */}
          <path
            d="M 60,42 Q 48,43 36,40 L 36,49 Q 48,51 60,47 Z"
            fill="#FFFFFF"
          />
          {/* Right Page */}
          <path
            d="M 60,42 Q 72,43 84,40 L 84,49 Q 72,51 60,47 Z"
            fill="#FFFFFF"
          />
          {/* Spine & Base */}
          <line x1="60" y1="42" x2="60" y2="47" stroke="#111827" strokeWidth="1" />
        </g>

        {/* Book Text */}
        <text
          x="47"
          y="46"
          fontSize="2.6"
          fontWeight="900"
          fill="#1A237E"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          INTELLECT
        </text>
        <text
          x="73"
          y="44.5"
          fontSize="2.4"
          fontWeight="900"
          fill="#B71C1C"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          SKILL
        </text>
        <text
          x="73"
          y="47.5"
          fontSize="2.3"
          fontWeight="900"
          fill="#B71C1C"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          CHARACTER
        </text>

        {/* Rising Torch in the Center */}
        <g>
          {/* Torch Handle */}
          <rect x="58.5" y="37" width="3" height="9" fill="#1976D2" stroke="#0D47A1" strokeWidth="0.6" rx="0.5" />
          <path d="M 57.5,38 L 62.5,38 L 61,41 L 59,41 Z" fill="#FFC107" stroke="#FFA000" strokeWidth="0.4" />
          {/* Torch Flame */}
          <path
            d="M 60,28 C 64,32 64,35 62,37 C 60.5,38.5 59.5,38.5 58,37 C 56,35 56,32 60,28 Z"
            fill="url(#torch-flame)"
            stroke="#D32F2F"
            strokeWidth="0.6"
          />
          <path
            d="M 60,31 C 62,33 62,35 61,36 C 60,36.5 59.5,36.5 59,36 C 58,35 58,33 60,31 Z"
            fill="#FFF59D"
          />
        </g>

        {/* 5. Three Golden Interlocking Mechanical Gears */}
        <g fill="#FBC02D" stroke="#5D4037" strokeWidth="0.7">
          {/* Left Gear */}
          <circle cx="48" cy="56" r="7.5" />
          <circle cx="48" cy="56" r="3" fill="#FFFFFF" stroke="#5D4037" strokeWidth="0.7" />
          {/* Right Gear */}
          <circle cx="72" cy="56" r="7.5" />
          <circle cx="72" cy="56" r="3" fill="#FFFFFF" stroke="#5D4037" strokeWidth="0.7" />
          {/* Center Lower Gear */}
          <circle cx="60" cy="64" r="8.5" />
          <circle cx="60" cy="64" r="3.5" fill="#FFFFFF" stroke="#5D4037" strokeWidth="0.7" />
        </g>
        {/* Gear Teeth Detail marks */}
        <g stroke="#5D4037" strokeWidth="1" strokeLinecap="round">
          <line x1="48" y1="46" x2="48" y2="48" />
          <line x1="48" y1="64" x2="48" y2="66" />
          <line x1="38" y1="56" x2="40" y2="56" />
          <line x1="56" y1="56" x2="58" y2="56" />
          
          <line x1="72" y1="46" x2="72" y2="48" />
          <line x1="72" y1="64" x2="72" y2="66" />
          <line x1="62" y1="56" x2="64" y2="56" />
          <line x1="80" y1="56" x2="82" y2="56" />

          <line x1="60" y1="53" x2="60" y2="55" />
          <line x1="60" y1="73" x2="60" y2="75" />
          <line x1="49" y1="64" x2="51" y2="64" />
          <line x1="69" y1="64" x2="71" y2="64" />
        </g>

        {/* 6. Clasped Hands Shaking (Unity & Guidance) */}
        <g stroke="#263238" strokeWidth="0.8" strokeLinejoin="round">
          {/* Left White Arm & Hand */}
          <path
            d="M 28,78 L 44,70 L 54,72 L 58,74 L 54,79 L 45,78 L 30,88 Z"
            fill="#FFFFFF"
          />
          {/* Right Gold Arm & Hand */}
          <path
            d="M 92,78 L 76,70 L 64,72 L 56,76 L 60,82 L 72,80 L 90,88 Z"
            fill="#FBC02D"
          />
          {/* Fingers Interlock Line */}
          <path
            d="M 52,73 Q 57,75 60,77"
            fill="none"
            stroke="#263238"
            strokeWidth="0.8"
          />
          <path
            d="M 51,76 Q 56,78 59,80"
            fill="none"
            stroke="#263238"
            strokeWidth="0.8"
          />
        </g>

        {/* 7. Foundation Year 2016 in the Center Base */}
        <rect x="50" y="80.5" width="20" height="6" rx="2" fill="#FFFFFF" stroke="#0F3D1C" strokeWidth="0.5" />
        <text
          x="60"
          y="85"
          fontSize="4"
          fontWeight="900"
          fill="#0D47A1"
          textAnchor="middle"
          fontFamily="sans-serif"
          letterSpacing="0.4"
        >
          2016
        </text>
      </g>
    </svg>
  );
};
