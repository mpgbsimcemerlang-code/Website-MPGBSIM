import React from 'react';
import { ShieldAlert, Clock, AlertCircle } from 'lucide-react';

interface RateLimitNoticeProps {
  isLimited: boolean;
  retryAfterSeconds: number;
  message?: string | null;
  compact?: boolean;
  className?: string;
}

export const RateLimitNotice: React.FC<RateLimitNoticeProps> = ({
  isLimited,
  retryAfterSeconds,
  message,
  compact = false,
  className = '',
}) => {
  if (!isLimited && retryAfterSeconds <= 0) return null;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-fadeIn ${className}`}
        role="alert"
      >
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
        <span className="font-medium">
          Kawalan Had Penulisan: Sila tunggu{' '}
          <strong className="text-amber-200 font-bold underline">{retryAfterSeconds}s</strong> sebelum menghantar semula.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/60 p-4 shadow-lg backdrop-blur-md animate-fadeIn ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Kawalan Keselamatan Penulisan Pangkalan Data</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3 animate-spin" /> {retryAfterSeconds}s
              </span>
            </h4>
          </div>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            {message ||
              `Borang telah dihantar baru sebentar tadi. Sila tunggu ${retryAfterSeconds} saat sebelum menghantar semula bagi mengelakkan permohonan bertindih dan pembaziran kuota pangkalan data.`}
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-amber-400/90 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Butang penghantaran akan diaktifkan semula secara automatik sebaik sahaja pemasa tamat.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
