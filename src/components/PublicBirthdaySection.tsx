import React, { useMemo, useState } from 'react';
import { Cake, Sparkles, Calendar, School, Award, Copy, Check, RefreshCw, Heart } from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';
import {
  buildSafeBirthdayRoster,
  DEFAULT_BIRTHDAY_SETTINGS,
  generateBirthdayGreeting,
  getKualaLumpurDateParts,
  MALAY_MONTH_NAMES,
  PublicSafeBirthdayMember,
} from '../utils/birthdayUtils';

export const PublicBirthdaySection: React.FC = () => {
  const { siteData } = useAdminContent();
  const settings = siteData.birthdaySettings || DEFAULT_BIRTHDAY_SETTINGS;

  // Track template variation offset per member card so visitors/members can cycle polite variations
  const [variationOffsets, setVariationOffsets] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const klToday = useMemo(() => getKualaLumpurDateParts(), []);

  const roster = useMemo(() => {
    return buildSafeBirthdayRoster({
      schools: siteData.memberSchools || [],
      applications: siteData.memberApplications || [],
      submissions: siteData.submissions || [],
      settings,
    });
  }, [siteData.memberSchools, siteData.memberApplications, siteData.submissions, settings]);

  // Respect Admin CMS visibility toggles
  if (!settings.enabled || !settings.showOnPublicWebsite) {
    return null;
  }

  const todayList = roster.todayBirthdays;
  const upcomingPreview = roster.upcomingBirthdays.slice(0, 3);
  const nextUpcomingList = roster.allIdentifiedBirthdays.filter((b) => !b.isBirthdayToday).slice(0, 3);
  const todayFormatted = `${klToday.day} ${MALAY_MONTH_NAMES[klToday.month]}`;

  const handleCycleGreeting = (memberKey: string) => {
    setVariationOffsets((prev) => ({
      ...prev,
      [memberKey]: (prev[memberKey] || 0) + 1,
    }));
  };

  const getActiveGreeting = (entry: PublicSafeBirthdayMember) => {
    const offset = variationOffsets[entry.memberKey] || 0;
    if (offset === 0) return entry.greetingText;
    return generateBirthdayGreeting({
      memberKey: `${entry.memberKey}-v${offset}`,
      memberName: entry.memberName,
      position: entry.position,
      schoolName: entry.schoolName,
      state: entry.state,
      templates: settings.greetingTemplates,
      dateSeed: `${klToday.isoDate}-${offset}`,
      showPosition: settings.showPosition,
      showSchoolName: settings.showSchoolName,
    });
  };

  const handleCopyGreeting = (entry: PublicSafeBirthdayMember) => {
    const text = getActiveGreeting(entry);
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(entry.memberKey);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section
      id="sambutan-hari-lahir"
      aria-labelledby="birthday-section-heading"
      className="py-16 lg:py-20 bg-gradient-to-b from-white via-emerald-50/40 to-white border-y border-emerald-900/10 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-emerald-900/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-800 mb-2">
              <Cake className="w-4 h-4 text-amber-600" />
              <span>Apresiasi Kepimpinan Pendidikan Islam</span>
            </div>
            <h2
              id="birthday-section-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              {settings.sectionTitlePublic || 'Sambutan Hari Lahir Ahli MPGBSIM'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              {settings.sectionSubtitlePublic ||
                'Merakamkan sekalung penghargaan dan doa kesejahteraan buat barisan Pengetua serta Guru Besar sekolah ahli MPGBSIM yang menyambut ulang tahun kelahiran.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-500 block">Tarikh Hari Ini (MYT)</span>
              <strong className="text-slate-900 font-bold">
                {todayFormatted} {klToday.year}
              </strong>
            </div>
          </div>
        </div>

        {/* Today's Birthday Celebration Cards */}
        {todayList.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-2xs">
                  {todayList.length}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-teal-950">
                  Selamat Hari Lahir — Sambutan Hari Ini ({todayFormatted})
                </h3>
              </div>
              <span className="text-xs text-teal-800 font-semibold">
                Ikhlas daripada Sekretariat & Seluruh Warga MPGBSIM
              </span>
            </div>

            <div
              className={`grid grid-cols-1 ${
                todayList.length === 1
                  ? 'lg:grid-cols-1 max-w-3xl'
                  : todayList.length === 2
                  ? 'lg:grid-cols-2'
                  : 'md:grid-cols-2 lg:grid-cols-3'
              } gap-6`}
            >
              {todayList.map((entry) => {
                const activeGreeting = getActiveGreeting(entry);
                const isCopied = copiedId === entry.memberKey;

                return (
                  <article
                    key={entry.memberKey}
                    className="bg-white rounded-2xl border border-amber-300/80 shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between relative"
                  >
                    {/* Top festive institutional bar */}
                    <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 px-5 py-3.5 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                        <span className="text-xs font-extrabold tracking-wide uppercase text-amber-200">
                          Selamat Hari Lahir
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-white/15 px-2.5 py-0.5 rounded-md text-white">
                        {entry.readableCelebrationDate}
                      </span>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      {/* Member Identity (Public-safe fields only — NO IC, NO Birth Year) */}
                      <div className="flex items-start gap-4">
                        {settings.showPhoto !== false && (
                          <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                            {entry.photoUrl ? (
                              <img
                                src={entry.photoUrl}
                                alt={entry.memberName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Cake className="w-6 h-6 text-teal-700" />
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {settings.showMemberName !== false && (
                            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                              {entry.memberName}
                            </h4>
                          )}
                          {settings.showPosition !== false && entry.position && (
                            <p className="text-xs font-bold text-teal-800 flex items-center gap-1.5 mt-0.5">
                              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{entry.position}</span>
                            </p>
                          )}
                          {settings.showSchoolName !== false && entry.schoolName && (
                            <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-1 leading-relaxed">
                              <School className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span>
                                {entry.schoolName}
                                {settings.showState !== false && entry.state ? ` (${entry.state})` : ''}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Formal Birthday Greeting Message */}
                      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 relative">
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                          “{activeGreeting}”
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCycleGreeting(entry.memberKey)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-teal-800 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          title="Tukar variasi teks ucapan"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Variasi Ucapan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyGreeting(entry)}
                          className="text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Ucapan Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Ucapan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          /* Meaningful Empty State when no member has a birthday today */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4 max-w-2xl">
                <div className="w-12 h-12 rounded-2xl bg-teal-900/10 border border-teal-900/15 flex items-center justify-center shrink-0 text-teal-900">
                  <Heart className="w-6 h-6 text-teal-800" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Tiada Sambutan Hari Lahir Pada Hari Ini ({todayFormatted})
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {settings.emptyTodayMessagePublic ||
                      'Tiada rekod ulang tahun kelahiran Pengetua atau Guru Besar pada tarikh hari ini. Warga MPGBSIM sentiasa mendoakan kesihatan yang berpanjangan, keberkatan usia, dan kecemerlangan kepimpinan buat seluruh pentadbir sekolah Islam ahli.'}
                  </p>
                </div>
              </div>

              {(upcomingPreview.length > 0 || nextUpcomingList.length > 0) && (
                <div className="lg:border-l lg:border-slate-200 lg:pl-6 shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-2">
                    Sambutan Akan Datang Terdekat
                  </span>
                  <div className="space-y-2">
                    {(upcomingPreview.length > 0 ? upcomingPreview : nextUpcomingList).map((up) => (
                      <div
                        key={up.memberKey}
                        className="flex items-center justify-between gap-4 text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/70"
                      >
                        <div className="min-w-0">
                          {settings.showMemberName !== false && (
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                              {up.memberName}
                            </span>
                          )}
                          {settings.showSchoolName !== false && up.schoolName && (
                            <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                              {up.schoolName}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-teal-900 bg-teal-100/80 px-2 py-0.5 rounded text-[11px] shrink-0">
                          {up.formattedDayMonth}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
