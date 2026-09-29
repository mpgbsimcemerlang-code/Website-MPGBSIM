import React from 'react';
import {
  ArrowRight,
  Calendar,
  Compass,
  Award,
  Users,
  BookOpen,
  Sparkles,
  ChevronDown,
  Camera
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

interface HeroProps {
  onExploreClick: () => void;
  onProgramsClick: () => void;
  onOpenPortal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onProgramsClick,
  onOpenPortal
}) => {
  const { siteData, isAdmin, setIsLogoModalOpen, setIsCMSOpen } = useAdminContent();
  const branding = siteData?.branding || {
    logoUrl: '/mpgbsim-official-logo.png',
    orgName: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    shortName: 'MPGBSIM',
    motto: 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani',
    subMotto: 'Jaringan kepimpinan Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia.',
    secondaryContext:
      'Menyatukan aspirasi kepimpinan SMKA, SABK, Sekolah Islam Swasta dan Institusi Tahfiz ke arah kecemerlangan modal insan bersepadu.',
    establishedYear: '1988',
  };
  const hero = siteData?.hero;
  const motto = branding.motto || 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani';

  // Fallbacks to ensure safe rendering
  const heroBadge = hero?.badge || 'Badan Kepimpinan Pengetua & Guru Besar Sekolah Islam Kebangsaan';
  const btnKenaliText = hero?.btnKenaliText || 'Kenali MPGBSIM';
  const btnProgramText = hero?.btnProgramText || 'Lihat Program';
  const btnPortalText = hero?.btnPortalText || 'Portal Ahli PGB';
  const trustPillars = hero?.trustPillars || [
    { title: 'Jaringan Nasional', value: '14 Negeri & Wilayah', desc: 'Merangkumi seluruh Malaysia' },
    { title: 'Pendidikan Bersepadu', value: 'Akademik & Rabbani', desc: 'Kurikulum seimbang & holistik' },
    { title: 'Kepimpinan PGB', value: 'Kompetensi Abad Ke-21', desc: 'Tadbir urus & inovasi digital' },
    { title: 'Transformasi AI', value: 'Teknologi Beretika', desc: 'Panduan AI Sekolah Islam' }
  ];

  return (
    <section
      id="utama"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-islamic-pattern"
    >
      {/* Decorative Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Islamic Rosette Watermark (Vector) */}
      <div className="absolute right-10 lg:right-24 top-1/2 -translate-y-1/2 w-80 h-80 lg:w-[480px] lg:h-[480px] opacity-[0.06] pointer-events-none select-none text-teal-400">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" fill="none" />
          <polygon points="100,10 120,80 190,100 120,120 100,190 80,120 10,100 80,80" stroke="currentColor" strokeWidth="2" fill="none" />
          <polygon points="100,25 153,47 175,100 153,153 100,175 47,153 25,100 47,47" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="100" cy="100" r="15" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Official Emblem & Year */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition duration-500" />
            <div
              onClick={() => {
                if (isAdmin) setIsLogoModalOpen(true);
              }}
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1 shadow-2xl ring-4 ring-teal-500/30 overflow-hidden ${
                isAdmin ? 'cursor-pointer hover:ring-amber-400 group' : ''
              }`}
              title={isAdmin ? 'Klik untuk tukar logo rasmi' : branding.orgName}
            >
              <img
                src={branding.logoUrl || '/mpgbsim-official-logo.png'}
                alt={`Logo Rasmi ${branding.orgName}`}
                className="w-full h-full object-contain"
              />
              {isAdmin && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                  <Camera className="w-5 h-5 text-amber-300 mb-1" />
                  <span className="text-[9px] font-bold text-amber-200 uppercase tracking-wider">Tukar Logo</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-block text-[11px] font-semibold text-amber-300 uppercase tracking-widest bg-slate-900/90 px-3 py-0.5 rounded-full border border-teal-500/30 shadow-xs">
              Ditubuhkan Sejak {branding.establishedYear}
            </span>
            {isAdmin && (
              <button
                onClick={() => setIsCMSOpen(true)}
                className="text-[10px] font-bold text-teal-300 hover:text-white bg-teal-900/60 hover:bg-teal-800 px-2 py-0.5 rounded-full border border-teal-600/40 transition flex items-center gap-1"
                title="Sunting Teks & Identiti Hero di CMS"
              >
                <span>✏️ Sunting Hero</span>
              </button>
            )}
          </div>
        </div>

        {/* Institutional Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-xs shadow-lg shadow-teal-950/40">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{heroBadge}</span>
        </div>

        {/* Official Headline */}
        <h1
          id="hero-headline"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.18] sm:leading-[1.15]"
        >
          <span className="block text-slate-100">{motto.split(',')[0] || motto}</span>
          {motto.includes(',') && (
            <span className="block bg-gradient-to-r from-teal-300 via-amber-200 to-teal-200 bg-clip-text text-transparent mt-1 pb-1">
              {motto.split(',').slice(1).join(',').trim()}
            </span>
          )}
        </h1>

        {/* Subheadline */}
        <p
          id="hero-subheadline"
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal"
        >
          {branding.subMotto || 'Jaringan kepimpinan Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia.'}
        </p>

        {/* Secondary Context */}
        <p className="mt-2 text-xs sm:text-sm text-teal-200/80 max-w-2xl mx-auto">
          {branding.secondaryContext || ''}
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Button: Kenali MPGBSIM */}
          <button
            id="btn-hero-kenali"
            type="button"
            onClick={onExploreClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm sm:text-base transition-all shadow-lg shadow-teal-900/50 hover:shadow-teal-600/30 active:scale-98 cursor-pointer border border-teal-400/40"
          >
            <Compass className="w-4 h-4 text-teal-200" />
            <span>{btnKenaliText}</span>
            <ArrowRight className="w-4 h-4 text-teal-200" />
          </button>

          {/* Button: Lihat Program */}
          <button
            id="btn-hero-program"
            type="button"
            onClick={onProgramsClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-semibold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer border border-slate-700 hover:border-slate-600"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{btnProgramText}</span>
          </button>

          {/* Quick Portal Ahli entry */}
          <button
            id="btn-hero-portal"
            type="button"
            onClick={onOpenPortal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{btnPortalText}</span>
          </button>
        </div>

        {/* Trust Indicators / Credentials Grid */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          {trustPillars.map((pillar, idx) => {
            const icons = [
              <Users key="0" className="w-4 h-4" />,
              <BookOpen key="1" className="w-4 h-4" />,
              <Award key="2" className="w-4 h-4" />,
              <Sparkles key="3" className="w-4 h-4" />
            ];
            const colors = ['text-teal-400', 'text-amber-400', 'text-teal-400', 'text-amber-400'];
            return (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 backdrop-blur-xs">
                <div className={`flex items-center gap-2 ${colors[idx % colors.length]} mb-1`}>
                  {icons[idx % icons.length]}
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{pillar.title}</span>
                </div>
                <p className="text-sm font-bold text-white">{pillar.value}</p>
                <p className="text-[11px] text-slate-400">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Scroll down prompt */}
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={onExploreClick}
            aria-label="Skrol ke bawah untuk lihat kandungan"
            className="group flex flex-col items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/80 hover:border-teal-400/60 text-slate-300 hover:text-teal-300 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-xs"
          >
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-400 group-hover:text-teal-300">
              Skrol Untuk Lihat Kandungan
            </span>
            <ChevronDown className="w-4 h-4 text-teal-400 group-hover:translate-y-0.5 transition-transform animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
