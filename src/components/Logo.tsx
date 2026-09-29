import React from 'react';
import { Camera } from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const isLight = variant === 'light';
  const { siteData, isAdmin, setIsLogoModalOpen } = useAdminContent();

  const branding = siteData?.branding || {
    logoUrl: '/mpgbsim-official-logo.png',
    orgName: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    shortName: 'MPGBSIM',
  };

  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 md:w-12 md:h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg md:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 group relative ${className}`}>
      {/* Official Circular Seal of MPGBSIM */}
      <div
        id="mpgbsim-brand-emblem"
        onClick={() => {
          if (isAdmin) {
            setIsLogoModalOpen(true);
          }
        }}
        className={`relative flex items-center justify-center shrink-0 rounded-full overflow-hidden transition-transform duration-300 ${
          isAdmin ? 'cursor-pointer hover:ring-4 hover:ring-amber-400' : 'group-hover:scale-105'
        } shadow-md ${iconSizes[size]} bg-white ring-2 ${
          isLight ? 'ring-slate-300' : 'ring-teal-400/40'
        }`}
        title={isAdmin ? 'Klik untuk tukar logo rasmi' : (branding.orgName || 'MPGBSIM')}
      >
        <img
          src={branding.logoUrl || '/mpgbsim-official-logo.png'}
          alt={`Logo Rasmi ${branding.orgName || 'MPGBSIM'}`}
          className="w-full h-full object-contain"
        />

        {/* Quick edit overlay for admin */}
        {isAdmin && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white">
            <Camera className="w-4 h-4 text-amber-300 drop-shadow-md" />
          </div>
        )}
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col leading-tight">
        <span
          className={`font-black tracking-wider uppercase font-sans ${titleSizes[size]} ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {branding.shortName || 'MPGBSIM'}
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] md:text-[11px] font-medium tracking-tight uppercase line-clamp-1 ${
              isLight ? 'text-slate-600' : 'text-teal-200/90'
            }`}
          >
            {branding.orgName || 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia'}
          </span>
        )}
      </div>
    </div>
  );
};
