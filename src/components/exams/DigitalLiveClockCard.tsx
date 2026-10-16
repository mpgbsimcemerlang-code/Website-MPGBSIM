import React, { useState, useEffect } from 'react';
import { Clock, Radio, CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateLiveDigitalCountdown, LiveDigitalCountdownResult } from '../../utils/examCountdown';

interface DigitalLiveClockCardProps {
  startDate: string;
  endDate?: string;
  title?: string;
  category?: string;
  variant?: 'featured' | 'compact' | 'mini';
  initialNotice?: string;
  className?: string;
}

export const DigitalLiveClockCard: React.FC<DigitalLiveClockCardProps> = ({
  startDate,
  endDate,
  title,
  category = 'SPM',
  variant = 'featured',
  initialNotice,
  className = '',
}) => {
  const [countdown, setCountdown] = useState<LiveDigitalCountdownResult>(() =>
    calculateLiveDigitalCountdown(startDate, endDate)
  );
  const [blink, setBlink] = useState(true);

  // Live 1-second interval ticker for live moving digital time
  useEffect(() => {
    // Tick immediately and then every 1000ms
    setCountdown(calculateLiveDigitalCountdown(startDate, endDate));

    const interval = setInterval(() => {
      setCountdown(calculateLiveDigitalCountdown(startDate, endDate));
      setBlink((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const pad = (n: number) => String(n).padStart(2, '0');

  // Format colors based on category
  const themeColors = {
    SPM: {
      accent: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bgGlow: 'bg-emerald-500/10',
      boxBg: 'bg-emerald-950/60',
      pulseDot: 'bg-emerald-400',
    },
    'UPKK/KAFA': {
      accent: 'text-amber-400',
      border: 'border-amber-500/40',
      bgGlow: 'bg-amber-500/10',
      boxBg: 'bg-amber-950/60',
      pulseDot: 'bg-amber-400',
    },
    SPPIM: {
      accent: 'text-sky-400',
      border: 'border-sky-500/40',
      bgGlow: 'bg-sky-500/10',
      boxBg: 'bg-sky-950/60',
      pulseDot: 'bg-sky-400',
    },
  }[category.includes('UPKK') ? 'UPKK/KAFA' : category.includes('SPPIM') ? 'SPPIM' : 'SPM'] || {
    accent: 'text-teal-400',
    border: 'border-teal-500/40',
    bgGlow: 'bg-teal-500/10',
    boxBg: 'bg-teal-950/60',
    pulseDot: 'bg-teal-400',
  };

  // 1. COMPLETED STATE (e.g. SPPIM 2026 which was held in Sept 2026)
  if (countdown.status === 'completed' || initialNotice?.toLowerCase().includes('telah')) {
    return (
      <div
        className={`rounded-2xl p-4 sm:p-5 bg-slate-950/90 border border-slate-800 text-slate-200 shadow-xl relative overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            Status Peperiksaan
          </span>
          <span className="text-[11px] font-mono text-slate-400">Arkib Rasmi</span>
        </div>

        <div className="py-2.5 px-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                {initialNotice || 'Telah Selesai Berlangsung'}
              </div>
              <div className="text-[11px] text-slate-400">
                Sesi pentaksiran telah disempurnakan mengikut takwim.
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-800/60 text-[10px] font-extrabold uppercase">
            Rekod Lengkap
          </span>
        </div>
      </div>
    );
  }

  // 2. ONGOING STATE
  if (countdown.status === 'ongoing') {
    return (
      <div
        className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/70 border border-emerald-500/50 shadow-2xl relative overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Sedang Berlangsung Sekarang
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-300">Masa Berbaki</span>
        </div>

        {/* Digital Clock Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
          <div className="rounded-xl p-2 sm:p-2.5 bg-slate-950/80 border border-emerald-500/30 text-center flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300 leading-none">
              {countdown.days}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              Hari
            </span>
          </div>

          <div className="rounded-xl p-2 sm:p-2.5 bg-slate-950/80 border border-emerald-500/30 text-center flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300 leading-none">
              {pad(countdown.hours)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              Jam
            </span>
          </div>

          <div className="rounded-xl p-2 sm:p-2.5 bg-slate-950/80 border border-emerald-500/30 text-center flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300 leading-none">
              {pad(countdown.minutes)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              Minit
            </span>
          </div>

          <div className="rounded-xl p-2 sm:p-2.5 bg-slate-950/80 border border-emerald-500/30 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 leading-none">
              {pad(countdown.seconds)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              Saat
            </span>
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Kemajuan Tempoh Peperiksaan</span>
            <span className="text-emerald-300 font-bold">{countdown.progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-1000"
              style={{ width: `${countdown.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 3. UPCOMING STATE - Ticking Digital Countdown
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border ${themeColors.border} shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Decorative LED grid accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${themeColors.bgGlow} rounded-full blur-2xl pointer-events-none`} />

      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800/90 text-white border border-slate-700/80">
          <span className={`w-2 h-2 rounded-full ${themeColors.pulseDot} animate-ping`} />
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Countdown Digital Berdetik</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${blink ? 'bg-amber-400' : 'bg-transparent'}`} />
          Masa Nyata
        </span>
      </div>

      {/* 4-Column Digital Electronic Countdown Box */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 relative z-10">
        {/* DAYS */}
        <div className="rounded-xl p-2.5 sm:p-3 bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center shadow-inner group">
          <div className="text-2xl sm:text-4xl font-black font-mono text-white tracking-tight drop-shadow-sm group-hover:scale-105 transition-transform">
            {countdown.days}
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1">
            Hari
          </span>
        </div>

        {/* HOURS */}
        <div className="rounded-xl p-2.5 sm:p-3 bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center shadow-inner group">
          <div className="text-2xl sm:text-4xl font-black font-mono text-slate-100 tracking-tight drop-shadow-sm group-hover:scale-105 transition-transform">
            {pad(countdown.hours)}
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Jam
          </span>
        </div>

        {/* MINUTES */}
        <div className="rounded-xl p-2.5 sm:p-3 bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center shadow-inner group">
          <div className="text-2xl sm:text-4xl font-black font-mono text-slate-100 tracking-tight drop-shadow-sm group-hover:scale-105 transition-transform">
            {pad(countdown.minutes)}
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Minit
          </span>
        </div>

        {/* SECONDS (Live Ticking) */}
        <div className="rounded-xl p-2.5 sm:p-3 bg-slate-950/90 border border-amber-500/40 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="text-2xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] group-hover:scale-105 transition-transform">
            {pad(countdown.seconds)}
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-amber-300 uppercase tracking-widest mt-1">
            Saat
          </span>
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate">
          Sasaran Mula: <strong className="text-white">08:00 AM (Waktu Malaysia)</strong>
        </span>
        <span className="font-mono text-amber-400 font-bold shrink-0">
          {countdown.days === 0 ? 'HARI INI BERMULA' : `${countdown.days} HARI LAGI`}
        </span>
      </div>
    </div>
  );
};
