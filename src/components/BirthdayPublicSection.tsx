import React, { useMemo, useState } from 'react';
import { Cake, Copy, Check, Calendar, Building2, ShieldCheck, Settings } from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';
import {
  buildSafeBirthdayRoster,
  DEFAULT_BIRTHDAY_SETTINGS,
  MALAY_MONTH_NAMES,
  PublicSafeBirthdayMember,
} from '../utils/birthdayUtils';

interface BirthdayPublicSectionProps {
  onOpenPortal?: () => void;
  onOpenCmsBirthday?: () => void;
}

export const BirthdayPublicSection: React.FC<BirthdayPublicSectionProps> = ({
  onOpenPortal,
  onOpenCmsBirthday,
}) => {
  const { siteData, isAdmin } = useAdminContent();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const settings = useMemo(
    () => ({
      ...DEFAULT_BIRTHDAY_SETTINGS,
      ...(siteData.birthdaySettings || {}),
    }),
    [siteData.birthdaySettings]
  );

  const roster = useMemo(() => {
    return buildSafeBirthdayRoster({
      schools: siteData.memberSchools || [],
      applications: siteData.memberApplications || [],
      submissions: siteData.submissions || [],
      settings,
    });
  }, [siteData.memberSchools, siteData.memberApplications, siteData.submissions, settings]);

  // Jika dimatikan oleh Admin untuk paparan awam, jangan paparkan kepada pengunjung awam
  if (!settings.enabled || !settings.showOnPublicWebsite) {
    if (!isAdmin) return null;
    return (
      <section id="sambutan-hari-lahir" className="py-8 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <strong className="text-slate-900">Notis Pentadbir CMS:</strong> Seksyen Sambutan Hari Lahir Ahli MPGBSIM kini dinyahaktifkan daripada paparan awam.
          </div>
          {onOpenCmsBirthday && (
            <button
              type="button"
              onClick={onOpenCmsBirthday}
              className="px-4 py-2 rounded-lg bg-teal-900 hover:bg-teal-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Aktifkan dalam Admin CMS
            </button>
          )}
        </div>
      </section>
    );
  }

  const todayFormatted = `${roster.referenceKlDate.day} ${
    MALAY_MONTH_NAMES[roster.referenceKlDate.month] || ''
  } ${roster.referenceKlDate.year}`;

  const handleCopyGreeting = (member: PublicSafeBirthdayMember) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(member.greetingText).catch(() => {});
    }
    setCopiedId(member.memberKey);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section
      id="sambutan-hari-lahir"
      className="py-16 sm:py-20 bg-gradient-to-b from-white via-teal-50/30 to-slate-50 border-t border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-teal-800 tracking-wide mb-2">
              Apresiasi & Ukhuwah Kepimpinan MPGBSIM · Tarikh Semasa: {todayFormatted}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
              {settings.sectionTitlePublic || DEFAULT_BIRTHDAY_SETTINGS.sectionTitlePublic}
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
              {settings.sectionSubtitlePublic || DEFAULT_BIRTHDAY_SETTINGS.sectionSubtitlePublic}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isAdmin && onOpenCmsBirthday && (
              <button
                type="button"
                onClick={onOpenCmsBirthday}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              >
                <Settings className="w-4 h-4 text-teal-700" />
                <span>Urus Ucapan Hari Lahir (CMS)</span>
              </button>
            )}
            {onOpenPortal && (
              <button
                type="button"
                onClick={onOpenPortal}
                className="px-4 py-2.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Lihat Kalendar Penuh di Portal PGB</span>
              </button>
            )}
          </div>
        </div>

        {/* Today's Birthday Celebrants */}
        {roster.todayBirthdays.length > 0 ? (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Cake className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="text-lg font-bold text-slate-900">
                  Selamat Hari Lahir — Sambutan Hari Ini ({roster.referenceKlDate.day}{' '}
                  {MALAY_MONTH_NAMES[roster.referenceKlDate.month]})
                </h3>
              </div>
              <p className="text-xs text-slate-500 tabular-nums">
                {roster.todayBirthdays.length} ahli kepimpinan menyambut ulang tahun kelahiran hari ini
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {roster.todayBirthdays.map((member) => {
                const isCopied = copiedId === member.memberKey;
                return (
                  <article
                    key={member.memberKey}
                    className="rounded-2xl bg-white border border-teal-200/90 shadow-sm overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    {/* Card Top Banner */}
                    <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-medium text-amber-300 tracking-wide">
                          Selamat Hari Lahir · {member.readableCelebrationDate}
                        </p>
                        <h4 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                          {settings.showMemberName ? member.memberName : 'Ahli Kepimpinan MPGBSIM'}
                        </h4>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                        <Cake className="w-5 h-5 text-amber-300" />
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div className="flex items-start gap-4">
                        {settings.showPhoto && (
                          <div className="w-16 h-16 rounded-2xl bg-teal-900/10 border border-teal-200 overflow-hidden shrink-0 flex items-center justify-center text-teal-900 font-extrabold text-lg">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.memberName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>
                                {(member.memberName || 'P')
                                  .split(' ')
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                            {settings.showPosition && member.position && (
                              <span className="font-semibold text-teal-900">{member.position}</span>
                            )}
                            {settings.showPosition && settings.showSchoolName && member.schoolName && (
                              <span aria-hidden="true">·</span>
                            )}
                            {settings.showSchoolName && member.schoolName && (
                              <span className="font-medium text-slate-800">{member.schoolName}</span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            <span>Tarikh Hari Lahir: {member.formattedDayMonth}</span>
                            {settings.showState && member.state && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{member.state}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Official Greeting Quote */}
                      <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
                        <p className="italic text-slate-800">“{member.greetingText}”</p>
                      </div>

                      {/* Footer Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>Ikhlas daripada Majlis Kepimpinan MPGBSIM</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyGreeting(member)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-900 text-slate-700 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
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
          /* Polite Empty State When No Birthday Falls on Today */
          <div className="mt-8 rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 max-w-3xl">
                <div className="w-12 h-12 rounded-2xl bg-teal-900 text-amber-300 flex items-center justify-center shrink-0">
                  <Cake className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-teal-800 font-semibold">
                    <span>Tiada Sambutan Pada Hari Ini ({todayFormatted})</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Doa & Penghargaan Berterusan Buat Kepimpinan Sekolah Ahli MPGBSIM
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {settings.emptyTodayMessagePublic || DEFAULT_BIRTHDAY_SETTINGS.emptyTodayMessagePublic}
                  </p>
                </div>
              </div>

              {onOpenPortal && (
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-teal-900 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Semak Senarai Akan Datang di Portal PGB
                </button>
              )}
            </div>

            {/* If there are upcoming birthdays in the next 7 days, show a polite preview strip */}
            {roster.upcomingBirthdays.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-3">
                  Sambutan Hari Lahir Terdekat ({settings.upcomingDaysWindow || 7} Hari Berikutnya):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roster.upcomingBirthdays.slice(0, 3).map((up) => (
                    <div
                      key={up.memberKey}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {settings.showMemberName ? up.memberName : 'Ahli Kepimpinan MPGBSIM'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {settings.showPosition && up.position ? up.position : ''}
                          {settings.showPosition && settings.showSchoolName && up.schoolName ? ' · ' : ''}
                          {settings.showSchoolName && up.schoolName ? up.schoolName : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-teal-800 whitespace-nowrap">
                          {up.formattedDayMonth}
                        </p>
                        <p className="text-[10px] text-slate-500 tabular-nums whitespace-nowrap">
                          {up.daysUntilBirthday === 1
                            ? 'Esok'
                            : `Dalam ${up.daysUntilBirthday} hari`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
