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
  subtext,
  className = '',
}) => {
  const isDark = theme === 'dark';

  if (!showWordmark) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src="/rthub_icon.png"
          alt="RtHub Icon"
          style={{ width: size, height: size }}
          className="rounded-2xl shadow-md transition-transform duration-300 hover:scale-105 object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="flex flex-col">
        <img
          src="/rthub_logo.png"
          alt="RtHub Logo"
          style={{ height: size }}
          className="object-contain transition-transform duration-300 hover:scale-[1.02]"
        />
        {subtext && (
          <span
            className={`text-[11px] tracking-wider font-semibold -mt-1 pl-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default RtHubLogo;
