import React from 'react';
import { ProgramEvent } from '../types';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Tag,
  ArrowRight,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

interface UpcomingProgramsProps {
  programs: ProgramEvent[];
  onRegisterProgram: (program: ProgramEvent) => void;
}

export const UpcomingProgramsSection: React.FC<UpcomingProgramsProps> = ({
  programs,
  onRegisterProgram
}) => {
  const { isAdmin, setIsCMSOpen } = useAdminContent();

  return (
    <section id="program" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-200">
              <CalendarDays className="w-3.5 h-3.5 text-teal-700" />
              <span>Takwim & Acara Rasmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Program & Konvensyen Kebangsaan
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mt-4 rounded-full" />
            
            {isAdmin && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsCMSOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold hover:bg-amber-100 transition shadow-2xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                  <span>Urus Program & Takwim Dalam CMS ({programs.length} Acara)</span>
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 md:mt-0 text-sm text-slate-500 max-w-md">
            Sertai siri wacana kepimpinan, bengkel kemahiran eksekutif dan persidangan tahunan Pengetua dan Guru Besar Sekolah Islam Malaysia.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...programs]
            .sort((a, b) => {
              if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
              }
              if (a.order !== undefined) return -1;
              if (b.order !== undefined) return 1;

              const getTime = (p: ProgramEvent) => {
                if (p.closingDate && /^\d{4}-\d{2}-\d{2}$/.test(p.closingDate)) {
                  return new Date(p.closingDate).getTime();
                }
                const matchIso = (p.date || '').match(/(\d{4}-\d{2}-\d{2})/);
                if (matchIso) return new Date(matchIso[1]).getTime();
                const parsed = new Date(p.date || '').getTime();
                return isNaN(parsed) ? 0 : parsed;
              };
              return getTime(a) - getTime(b);
            })
            .map((prog) => {
            const fillPercentage = Math.round((prog.spotsFilled / prog.spotsTotal) * 100);

            return (
              <div
                key={prog.id}
                id={`program-card-${prog.id}`}
                className="flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400/80 transition-all group"
              >
                {/* Poster Banner if available */}
                {prog.posterUrl && (
                  <div
                    onClick={() => onRegisterProgram(prog)}
                    className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 cursor-pointer flex items-center justify-center"
                  >
                    <img
                      src={prog.posterUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
                    />
                    <img
                      src={prog.posterUrl}
                      alt={prog.title}
                      className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent z-20 pointer-events-none" />
                    <div className="absolute top-3 right-3 z-30">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-black/60 text-white backdrop-blur-xs border border-white/20">
                        Poster Program
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          prog.mode === 'Fizikal'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : prog.mode === 'Hibrid'
                            ? 'bg-teal-100 text-teal-900 border border-teal-200'
                            : 'bg-purple-100 text-purple-900 border border-purple-200'
                        }`}
                      >
                        Mod {prog.mode}
                      </span>

                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md">
                        {prog.fees}
                      </span>
                    </div>

                    {/* Title & Theme */}
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-900 transition-colors leading-snug mb-2">
                      {prog.title}
                    </h3>

                    {prog.theme && (
                      <p className="text-xs sm:text-sm font-medium italic text-teal-800 mb-4 bg-teal-50/70 p-2.5 rounded-lg border-l-2 border-teal-600">
                        {prog.theme}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                      {prog.description}
                    </p>

                    {/* Meta Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 mb-6 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{prog.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>{prog.time}</span>
                      </div>

                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">{prog.venue}</span>
                      </div>

                      <div className="flex items-center gap-2 sm:col-span-2 text-slate-500 pt-1 border-t border-slate-100">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">Sasaran: {prog.targetAudience}</span>
                      </div>

                      {prog.closingDate && (
                        <div className="flex items-center gap-2 sm:col-span-2 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 font-bold text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Tutup Pendaftaran: {prog.closingDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Capacity progress */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Status Kapasiti Pendaftaran</span>
                        <span className="text-teal-800 font-bold">
                          {prog.spotsFilled} / {prog.spotsTotal} Peserta ({fillPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-600 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Tarikh Tutup: <strong className="text-slate-800">{prog.closingDate}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => onRegisterProgram(prog)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <span>Daftar / Info Lanjut</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
