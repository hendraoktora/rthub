import React from 'react';

interface RtHubLogoProps {
  size?: number;
  showWordmark?: boolean;
  theme?: 'dark' | 'light';
  subtext?: string;
  className?: string;
}

export const RtHubLogo: React.FC<RtHubLogoProps> = ({
  size = 40,
  showWordmark = true,
  theme = 'light',
  subtext = 'Smart Neighborhood OS',
  className = '',
}) => {
  const isDark = theme === 'dark';
  const iconSize = size;
  const gradientId = React.useId();

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Concept 1: House Silhouette + Interlocking RT Continuous Loop */}
      <div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Primary Vibrant Gradient (Electric Royal Blue to Cyber Cyan) */}
            <linearGradient id={`${gradientId}-primary`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Glow / Ambient Shadow Gradient */}
            <linearGradient id={`${gradientId}-glow`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Outer House Contour with Rounded Roof Peak and Soft Corner Base */}
          <path
            d="M 50 10 
               C 52.5 10, 54.5 11.2, 56.5 13 
               L 86 38 
               C 89 40.5, 90 43.5, 90 47.5 
               L 90 80 
               C 90 86.5, 84.5 92, 78 92 
               L 22 92 
               C 15.5 92, 10 86.5, 10 80 
               L 10 47.5 
               C 10 43.5, 11 40.5, 14 38 
               L 43.5 13 
               C 45.5 11.2, 47.5 10, 50 10 Z"
            stroke={`url(#${gradientId}-primary)`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Inner Interlocking R & T Continuous Ribbon Loop */}
          {/* 1. Left Vertical Stem & Upper R Curve */}
          <path
            d="M 29 78 
               L 29 44 
               C 29 36, 36 31, 48 31 
               C 60 31, 67 36, 67 46 
               C 67 55, 59 60, 48 60 
               L 29 60"
            stroke={`url(#${gradientId}-primary)`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* 2. Interlocking T Crossbar and Downward Diagonal R Connection */}
          <path
            d="M 48 60 
               L 69 78 
               M 72 38 
               L 72 58"
            stroke={`url(#${gradientId}-primary)`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Center Connection Dot / Hub Node */}
          <circle 
            cx="50" 
            cy="46" 
            r="3.5" 
            fill="#06B6D4" 
          />
        </svg>
      </div>

      {/* Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center tracking-tight leading-none">
            <span className={`font-extrabold text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Rt
            </span>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Hub
            </span>
          </div>
          {subtext && (
            <p className={`text-[11px] font-medium tracking-normal mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RtHubLogo;
