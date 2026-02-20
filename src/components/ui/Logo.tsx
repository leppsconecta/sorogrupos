
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 'md', theme = 'dark' }) => {
  const iconSizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-3xl'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const soroColor = theme === 'dark' ? 'text-white' : 'text-blue-950';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon: Yellow rounded square with white S cut-out style */}
      {/* Icon: Yellow rounded square with white S cut-out style */}
      <div className={`${iconSizes[size].split(' ')[0]} ${iconSizes[size].split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
        <img
          src="/logo-icon.png"
          alt="SoroEmpregos Icon"
          className="w-full h-full object-contain rounded-xl shadow-lg shadow-yellow-400/20"
        />
      </div>

      {/* Text: SORO (White/DarkBlue) GRUPOS (Yellow) */}
      <div className="whitespace-nowrap leading-none">
        <h1 className={`${textSizes[size]} font-bold tracking-tighter ${soroColor}`}>
          SORO<span className="text-yellow-400 font-black">EMPREGOS</span>
        </h1>
      </div>
    </div>
  );
};
