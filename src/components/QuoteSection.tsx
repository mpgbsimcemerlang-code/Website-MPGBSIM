import React from 'react';
import { Quote, Award, Edit3, Shield } from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

export const QuoteSection: React.FC = () => {
  const { siteData, isAdmin, setIsCMSOpen } = useAdminContent();

  const quote = siteData.quote || {
    quoteText: '“Bersama PGB, kita membina sekolah Islam yang lebih unggul.”',
    authorName: 'Dato’ Seri Ustaz Haji Kamaruddin bin Mohamad',
    authorRole: 'Yang Dipertua Kebangsaan / Pengerusi MPGBSIM',
    badge: 'Amanat Kepimpinan Pendidikan Islam Malaysia',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  };

  const currentPhoto =
    quote.authorPhotoUrl ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';

  return (
    <section className="relative py-20 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950 text-white overflow-hidden border-b border-teal-900/40">
      {/* Subtle geometric motif background */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Quick Edit Bar (Opens CMS Control Center) */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsCMSOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-900/80 hover:bg-teal-800 text-teal-200 border border-teal-500/40 text-xs font-semibold transition cursor-pointer shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Sunting Teks & Foto Amanat (Pusat Kawalan CMS)</span>
            </button>
          </div>
        )}

        {/* Main Content Layout with Chairman Picture Frame */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* Ruang Paparan Gambar Pengerusi MPGBSIM */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative w-48 h-64 sm:w-56 sm:h-72 rounded-3xl overflow-hidden border-2 border-amber-400/60 ring-4 ring-teal-500/30 shadow-2xl shadow-teal-950/80 bg-slate-900 transition-all duration-300">
              <img
                src={currentPhoto}
                alt={quote.authorName || 'Pengerusi MPGBSIM'}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';
                }}
              />
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20 pointer-events-none" />

              {/* Top Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/75 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>MPGBSIM</span>
              </div>

              {/* Floating Title Pill */}
              <div className="absolute bottom-3.5 left-3 right-3 text-center pointer-events-none z-10">
                <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-teal-950/90 text-amber-300 border border-amber-400/40 shadow-lg backdrop-blur-sm">
                  Pengerusi MPGBSIM
                </span>
              </div>
            </div>
          </div>

          {/* Quote Text & Attribution */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            {/* Badge & Quote Icon */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-900/70 border border-teal-500/40 text-amber-400 shadow-lg shadow-teal-950/60">
                <Quote className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] font-semibold text-teal-300 shadow-sm">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{quote.badge || 'Amanat Kepimpinan Pendidikan Islam Malaysia'}</span>
              </div>
            </div>

            {/* Quote Body */}
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-relaxed sm:leading-relaxed text-white">
              {quote.quoteText}
            </blockquote>

            {/* Attribution */}
            <div className="mt-6 pt-5 border-t border-teal-900/50 flex flex-col items-center lg:items-start">
              <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 to-teal-400 rounded-full mb-3" />
              <h3 className="text-lg sm:text-xl font-black text-amber-300 tracking-tight">
                {quote.authorName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium max-w-xl">
                {quote.authorRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
