import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Users, Mail, Edit3 } from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

interface CallToActionProps {
  onJoinClick: () => void;
  onContactClick: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  onJoinClick,
  onContactClick
}) => {
  const { siteData, isAdmin, setIsCMSOpen } = useAdminContent();
  const cta = siteData.cta || {
    badge: 'Seruan Jaringan Kepimpinan Kebangsaan',
    title: 'Bersama memperkasa pendidikan Islam Malaysia.',
    description:
      'Sertai ratusan Pengetua dan Guru Besar di seluruh tanah air untuk membina permuafakatan, mengoptimumkan tadbir urus sekolah dan melahirkan generasi Rabbani yang berdaya saing di persada dunia.',
    btnPrimaryText: 'Daftar Keahlian PGB / Sekolah',
    btnSecondaryText: 'Hubungi Urus Setia',
    footerNotes: 'Tiada yuran tersembunyi • Kelulusan rasmi Jawatankuasa MPGBSIM • Akses modul eksklusif',
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white overflow-hidden border-b border-teal-900/40">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-30 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {isAdmin && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setIsCMSOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/70 hover:bg-teal-800 text-teal-200 border border-teal-500/40 text-xs font-semibold transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Sunting Teks Seruan / CTA (CMS)</span>
            </button>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-semibold mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{cta.badge}</span>
        </div>

        {/* Exact headline requested */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white mb-6">
          {cta.title}
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          {cta.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            id="btn-cta-daftar-ahli"
            onClick={onJoinClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-950" />
            <span>{cta.btnPrimaryText}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            type="button"
            id="btn-cta-hubungi"
            onClick={onContactClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-sm sm:text-base border border-slate-700 active:scale-98 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>{cta.btnSecondaryText}</span>
          </button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Pengiktirafan Rasmi
          </span>
          <span>•</span>
          <span>Rangkaian 14 Negeri</span>
          <span>•</span>
          <span>{cta.footerNotes || 'Bimbingan Berterusan PGB'}</span>
        </div>
      </div>
    </section>
  );
};
