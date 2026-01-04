
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
      <div className={`${iconSizes[size].split(' ')[0]} ${iconSizes[size].split(' ')[1]} bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-400/20`}>
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M75 32C75 22 58 18 45 22C32 26 28 35 35 42C42 49 75 48 75 68C75 88 45 85 25 75" 
            stroke="white" 
            strokeWidth="18" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {/* Text: SORO (White/DarkBlue) GRUPOS (Yellow) */}
      <div className="whitespace-nowrap leading-none">
        <h1 className={`${textSizes[size]} font-bold tracking-tighter ${soroColor}`}>
          SORO<span className="text-yellow-400 font-black">GRUPOS</span>
        </h1>
      </div>
    </div>
  );
};
