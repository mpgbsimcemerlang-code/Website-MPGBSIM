import React from 'react';
import {
  X,
  Award,
  BookOpen,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
  Quote,
  Briefcase,
  CheckCircle2,
  Share2,
  ShieldCheck,
  User,
  HeartHandshake,
  GraduationCap,
} from 'lucide-react';
import { AlumniRecord } from '../../types';

interface AlumniDetailModalProps {
  alumni: AlumniRecord | null;
  onClose: () => void;
  onOpenRegistration?: () => void;
}

export const AlumniDetailModal: React.FC<AlumniDetailModalProps> = ({
  alumni,
  onClose,
  onOpenRegistration,
}) => {
  if (!alumni) return null;

  const totalYearsServiced =
    alumni.retirementYear && alumni.careerStartYear
      ? Math.max(1, alumni.retirementYear - alumni.careerStartYear)
      : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Alumni PGB: ${alumni.fullName}`,
          text: `Jejak Legasi Kepimpinan ${alumni.fullName} (${alumni.lastPosition} ${alumni.lastSchool})`,
          url: window.location.href,
        })
        .catch(() => null);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Pautan profil alumni telah disalin ke papan klip.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 max-h-[92vh] flex flex-col my-auto">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shrink-0 border-b border-teal-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors cursor-pointer z-10"
            aria-label="Tutup Dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Profile Photo */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl bg-slate-800">
                {alumni.photo ? (
                  <img
                    src={alumni.photo}
                    alt={alumni.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-900 text-teal-200 font-bold text-3xl">
                    {alumni.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                Alumni PGB
              </span>
            </div>

            {/* Profile Info Summary */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-medium text-teal-300">
                <span>{alumni.title || 'Mantan PGB'}</span>
                <span aria-hidden="true">·</span>
                <span>{alumni.gender}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <MapPin className="w-3 h-3" />
                  {alumni.state}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {alumni.fullName}
              </h2>

              <p className="text-sm sm:text-base text-amber-200/90 font-medium">
                {alumni.lastPosition} — <span className="text-slate-200">{alumni.lastSchool}</span>
              </p>

              {/* Service Period & Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/80 text-amber-300 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {alumni.careerStartYear} – {alumni.retirementYear || 'Kini'} ({totalYearsServiced} Tahun Khidmat)
                </span>

                {alumni.verifiedAt && (
                  <span className="inline-flex items-center gap-1 bg-teal-900/60 px-2.5 py-1 rounded-md border border-teal-500/40 text-teal-300 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    Profil Disahkan MPGBSIM
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Section 1: Legacy Quote / Pesanan */}
          {alumni.legacyQuote && (
            <section className="bg-amber-50/90 border border-amber-200 rounded-xl p-5 sm:p-6 relative">
              <Quote className="w-8 h-8 text-amber-300 absolute top-4 right-4 opacity-50" />
              <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Pesanan Kepada Generasi Pengetua & Guru Besar
              </h3>
              <p className="text-sm sm:text-base italic text-slate-800 font-serif leading-relaxed">
                “{alumni.legacyQuote}”
              </p>
            </section>
          )}

          {/* Section 2: Visual Leadership Journey Timeline */}
          {alumni.leadershipHistory && alumni.leadershipHistory.length > 0 && (
            <section className="space-y-4">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-700" />
                  Jejak Kepimpinan & Sekolah Dijaga
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {alumni.leadershipHistory.length} Rekod Institusi
                </span>
              </div>

              {/* Vertical Visual Timeline */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200">
                {alumni.leadershipHistory.map((rec, idx) => (
                  <div key={rec.id || idx} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-teal-700 border-2 border-white text-white flex items-center justify-center text-xs shadow-md">
                      <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>

                    <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors p-4 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-md">
                          {rec.startYear} – {rec.endYear}
                        </span>
                        {rec.state && (
                          <span className="text-xs text-slate-500 font-medium">
                            {rec.state}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {rec.schoolName}
                      </h4>

                      <p className="text-xs font-semibold text-amber-700">
                        Jawatan: {rec.position}
                      </p>

                      {rec.highlights && (
                        <p className="text-xs text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60 mt-2">
                          <span className="font-semibold text-slate-700">Inisiatif Kunci: </span>
                          {rec.highlights}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Professional Expertise & Biography */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expertise */}
            {alumni.expertise && alumni.expertise.length > 0 && (
              <section className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  Bidang Kepakaran & Rujukan
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {alumni.expertise.map((exp, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-white text-teal-900 border border-teal-200 px-2.5 py-1 rounded-md shadow-2xs"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Current / Last Organisation */}
            <section className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-700" />
                Latar Belakang & Organisasi Terkini
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {alumni.currentOrganisation ? (
                  <span>
                    <strong className="text-slate-900">Penglibatan Semasa:</strong>{' '}
                    {alumni.currentOrganisation}
                  </span>
                ) : (
                  'Bersara daripada perkhidmatan rasmi dan terus menyumbang sebagai perunding bebas & tokoh masyarakat.'
                )}
              </p>
              {alumni.biography && (
                <p className="text-xs text-slate-600 pt-2 border-t border-slate-200 leading-relaxed">
                  {alumni.biography}
                </p>
              )}
            </section>
          </div>

          {/* Section 4: Achievements & Awards */}
          {((alumni.awards && alumni.awards.length > 0) ||
            (alumni.achievements && alumni.achievements.length > 0)) && (
            <section className="space-y-3 bg-teal-50/50 border border-teal-100 p-5 rounded-xl">
              <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-700" />
                Anugerah & Pencapaian Utama
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {alumni.awards?.map((awd, i) => (
                  <li key={`awd-${i}`} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{awd}</span>
                  </li>
                ))}
                {alumni.achievements?.map((ach, i) => (
                  <li key={`ach-${i}`} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Section 5: MPGBSIM History & Contributions */}
          {(alumni.mpgbsimRole || alumni.mpgbsimContribution) && (
            <section className="bg-slate-900 text-white p-5 sm:p-6 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-400" />
                  Sumbangan & Legasi Dalam MPGBSIM
                </h3>
                {alumni.mpgbsimStartYear && (
                  <span className="text-xs text-slate-400 font-mono">
                    Menyertai {alumni.mpgbsimStartYear}
                  </span>
                )}
              </div>

              {alumni.mpgbsimRole && (
                <p className="text-xs sm:text-sm font-semibold text-teal-200">
                  Peranan: {alumni.mpgbsimRole}
                </p>
              )}

              {alumni.mpgbsimContribution && (
                <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                  {alumni.mpgbsimContribution}
                </p>
              )}
            </section>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Profil disahkan bagi direktori rasmi Alumni PGB MPGBSIM
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Kongsi Pautan</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
