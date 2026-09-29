import React from 'react';
import { StrategicFocus } from '../types';
import {
  ShieldCheck,
  Share2,
  Cpu,
  Radio,
  HeartHandshake,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  Flag
} from 'lucide-react';

interface StrategicFocusProps {
  focusList: StrategicFocus[];
  onSelectFocus: (focus: StrategicFocus) => void;
}

export const StrategicFocusSection: React.FC<StrategicFocusProps> = ({
  focusList,
  onSelectFocus
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-teal-600" />;
      case 'Share2':
        return <Share2 className="w-6 h-6 text-teal-600" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-amber-600" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-teal-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-teal-600" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-amber-600" />;
      default:
        return <Flag className="w-6 h-6 text-teal-600" />;
    }
  };

  return (
    <section id="fokus-strategik" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-100/70 text-teal-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Flag className="w-3.5 h-3.5 text-teal-700" />
            <span>Pelan Tindakan Kebangsaan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Enam Fokus Strategik MPGBSIM
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Pelan pemerkasaan bersepadu untuk mengukuhkan wibawa pentadbiran, kecemerlangan pendidikan Islam, dan kebajikan kepimpinan sekolah.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* 6 Strategic Focus Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {focusList.map((focus) => (
            <div
              key={focus.id}
              id={`strategic-card-${focus.id}`}
              className="group relative flex flex-col justify-between p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all duration-200"
            >
              <div>
                {/* Header: Code & Status */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {focus.code}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      focus.status === 'Fokus Utama'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : focus.status === 'Perancangan 2026'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-teal-100 text-teal-900 border border-teal-200'
                    }`}
                  >
                    {focus.status}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 shrink-0 group-hover:scale-105 transition-transform">
                    {getIcon(focus.iconName)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug">
                      {focus.title}
                    </h3>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {focus.shortDesc}
                </p>

                {/* Initiatives list preview */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Inisiatif Utama:
                  </p>
                  {focus.initiatives.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                  {focus.initiatives.length > 2 && (
                    <p className="text-[11px] text-teal-700 font-medium pl-5">
                      +{focus.initiatives.length - 2} lagi inisiatif berimpak
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Action & KPI */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 max-w-[65%] line-clamp-1" title={focus.kpi}>
                  <strong className="text-slate-700">KPI:</strong> {focus.kpi}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectFocus(focus)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer group-hover:translate-x-0.5"
                >
                  <span>Perincian</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
