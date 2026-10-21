import React, { useMemo, useState } from 'react';
import {
  Cake,
  Sparkles,
  Calendar,
  School,
  Award,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Clock,
  ChevronRight,
  Search,
  Heart,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { useMemberPortal } from '../../context/MemberPortalContext';
import {
  buildSafeBirthdayRoster,
  DEFAULT_BIRTHDAY_SETTINGS,
  generateBirthdayGreeting,
  getKualaLumpurDateParts,
  MALAY_MONTH_NAMES,
  PublicSafeBirthdayMember,
} from '../../utils/birthdayUtils';

interface PortalBirthdaySectionProps {
  compact?: boolean;
}

export const PortalBirthdaySection: React.FC<PortalBirthdaySectionProps> = ({ compact = false }) => {
  const { siteData } = useAdminContent();
  const { setPortalTab, recordPortalActivity } = useMemberPortal();
  const settings = siteData.birthdaySettings || DEFAULT_BIRTHDAY_SETTINGS;

  const [horizonFilter, setHorizonFilter] = useState<'7days' | '30days' | 'all'>('7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [variationOffsets, setVariationOffsets] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const klToday = useMemo(() => getKualaLumpurDateParts(), []);
  const todayFormatted = `${klToday.day} ${MALAY_MONTH_NAMES[klToday.month]} ${klToday.year}`;

  const roster = useMemo(() => {
    return buildSafeBirthdayRoster({
      schools: siteData.memberSchools || [],
      applications: siteData.memberApplications || [],
      submissions: siteData.submissions || [],
      settings: {
        ...settings,
        upcomingDaysWindow: 7,
      },
    });
  }, [siteData.memberSchools, siteData.memberApplications, siteData.submissions, settings]);

  const upcoming30DaysList = useMemo(() => {
    return roster.allIdentifiedBirthdays.filter(
      (b) => !b.isBirthdayToday && b.daysUntilBirthday >= 1 && b.daysUntilBirthday <= 30
    );
  }, [roster.allIdentifiedBirthdays]);

  if (!settings.enabled || !settings.showOnMemberPortal) {
    if (compact) return null;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Cake className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Modul Ucapan Hari Lahir Dinyahaktifkan</h3>
        <p className="text-xs text-slate-500 mt-1">
          Pentadbir telah menyahaktifkan sementara paparan ucapan hari lahir pada Portal PGB.
        </p>
      </div>
    );
  }

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

  const handleCycleVariation = (memberKey: string) => {
    setVariationOffsets((prev) => ({
      ...prev,
      [memberKey]: (prev[memberKey] || 0) + 1,
    }));
  };

  const handleCopyGreeting = (entry: PublicSafeBirthdayMember) => {
    const text = getActiveGreeting(entry);
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(entry.memberKey);
    setTimeout(() => setCopiedId(null), 2500);
    try {
      recordPortalActivity(
        'PROFILE_UPDATE',
        'Salin Ucapan Hari Lahir PGB',
        `Menyalin teks ucapan hari lahir untuk ${entry.memberName} (${entry.schoolName})`
      );
    } catch {}
  };

  const handleShareWhatsApp = (entry: PublicSafeBirthdayMember) => {
    const text = getActiveGreeting(entry);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const upcomingList = useMemo(() => {
    const base =
      horizonFilter === '7days'
        ? roster.upcomingBirthdays
        : horizonFilter === '30days'
        ? upcoming30DaysList
        : roster.allIdentifiedBirthdays.filter((b) => !b.isBirthdayToday);

    if (!searchQuery.trim()) return base;
    const q = searchQuery.trim().toLowerCase();
    return base.filter(
      (b) =>
        b.memberName.toLowerCase().includes(q) ||
        b.schoolName.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q) ||
        b.formattedDayMonth.toLowerCase().includes(q)
    );
  }, [roster, upcoming30DaysList, horizonFilter, searchQuery]);

  // COMPACT WIDGET VIEW FOR PORTAL DASHBOARD HOME
  if (compact) {
    const previewUpcoming = roster.upcomingBirthdays.slice(0, 4);

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Hari Lahir Ahli PGB
                </h3>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                  Zon Waktu MYT
                </span>
              </div>
              <p className="text-xs text-teal-100/90">
                Sambutan hari ini ({klToday.day} {MALAY_MONTH_NAMES[klToday.month]}) & 7 hari akan datang
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPortalTab('hari-lahir')}
            className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Buka Modul Penuh</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Today's Birthdays */}
          {roster.todayBirthdays.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Menyambut Hari Lahir Hari Ini ({roster.todayBirthdays.length})</span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roster.todayBirthdays.map((entry) => {
                  const activeGreeting = getActiveGreeting(entry);
                  const isCopied = copiedId === entry.memberKey;

                  return (
                    <div
                      key={entry.memberKey}
                      className="p-4 rounded-xl bg-amber-50/70 border border-amber-300/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {settings.showMemberName !== false && (
                            <h4 className="font-extrabold text-sm text-slate-900">
                              {entry.memberName}
                            </h4>
                          )}
                          {settings.showPosition !== false && (
                            <p className="text-xs font-bold text-teal-800">{entry.position}</p>
                          )}
                          {settings.showSchoolName !== false && (
                            <p className="text-[11px] text-slate-600 mt-0.5">{entry.schoolName}</p>
                          )}
                        </div>
                        <span className="text-[11px] font-extrabold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shrink-0">
                          Hari Ini • {entry.readableCelebrationDate}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 italic bg-white/90 p-3 rounded-lg border border-amber-200/70 leading-relaxed">
                        “{activeGreeting}”
                      </p>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleCycleVariation(entry.memberKey)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-teal-900 px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 flex items-center gap-1 transition cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Tukar Ucapan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyGreeting(entry)}
                          className="text-[11px] font-bold bg-white hover:bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Ucapan</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(entry)}
                          className="text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Kongsi</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-teal-700 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Tiada sambutan hari lahir PGB pada hari ini ({klToday.day} {MALAY_MONTH_NAMES[klToday.month]}).
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Lihat senarai hari lahir ahli yang akan datang dalam tempoh 7 hari berikutnya di bawah.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming 7 Days List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>Senarai Hari Lahir Akan Datang (7 Hari Berikutnya)</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {roster.upcomingBirthdays.length} Ahli
              </span>
            </div>

            {previewUpcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {previewUpcoming.map((up) => (
                  <div
                    key={up.memberKey}
                    className="p-3 rounded-xl bg-slate-50/90 hover:bg-teal-50/40 border border-slate-200/80 flex items-center justify-between gap-3 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{up.memberName}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {up.position} • {up.schoolName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-teal-900 block">
                        {up.formattedDayMonth}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {up.daysUntilBirthday === 1
                          ? 'Esok'
                          : `Dalam ${up.daysUntilBirthday} hari`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                Tiada sambutan hari lahir dalam tempoh 7 hari akan datang. Klik "Buka Modul Penuh" untuk melihat jadual 30 hari berikutnya.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FULL PORTAL PAGE VIEW
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
              <Cake className="w-4 h-4" />
              <span>Ukhuwah & Apresiasi Kepimpinan PGB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hari Lahir Ahli MPGBSIM
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Senarai sambutan ulang tahun kelahiran Pengetua & Guru Besar sekolah ahli MPGBSIM mengikut zon waktu Malaysia (<code className="font-mono text-amber-200">Asia/Kuala_Lumpur</code>). Kongsikan ucapan rasmi dan doa kesejahteraan buat rakan kepimpinan.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-teal-200 block">Tarikh Hari Ini</span>
              <strong className="text-sm font-extrabold text-white mt-0.5 block">
                {todayFormatted}
              </strong>
            </div>
            <div className="bg-amber-400/20 border border-amber-300/30 rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-amber-200 block">Sambutan Hari Ini</span>
              <strong className="text-xl font-extrabold text-amber-300 mt-0.5 block">
                {roster.todayBirthdays.length}
              </strong>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3.5 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] text-teal-200 block">7 Hari Berikutnya</span>
              <strong className="text-xl font-extrabold text-white mt-0.5 block">
                {roster.upcomingBirthdays.length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TODAY'S BIRTHDAYS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Sambutan Hari Lahir Hari Ini ({klToday.day} {MALAY_MONTH_NAMES[klToday.month]})
              </h2>
              <p className="text-xs text-slate-500">
                Ahli yang menyambut ulang tahun kelahiran pada hari ini
              </p>
            </div>
          </div>
        </div>

        {roster.todayBirthdays.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {roster.todayBirthdays.map((entry) => {
              const activeGreeting = getActiveGreeting(entry);
              const isCopied = copiedId === entry.memberKey;

              return (
                <div
                  key={entry.memberKey}
                  className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/70 via-white to-teal-50/30 p-5 space-y-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {settings.showPhoto !== false && (
                        <div className="w-14 h-14 rounded-xl bg-teal-900 text-white flex items-center justify-center overflow-hidden shrink-0 font-bold">
                          {entry.photoUrl ? (
                            <img
                              src={entry.photoUrl}
                              alt={entry.memberName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Cake className="w-6 h-6 text-amber-300" />
                          )}
                        </div>
                      )}
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md mb-1">
                          Selamat Hari Lahir
                        </span>
                        {settings.showMemberName !== false && (
                          <h3 className="text-base font-extrabold text-slate-900">
                            {entry.memberName}
                          </h3>
                        )}
                        {settings.showPosition !== false && (
                          <p className="text-xs font-bold text-teal-800 flex items-center gap-1 mt-0.5">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>{entry.position}</span>
                          </p>
                        )}
                        {settings.showSchoolName !== false && (
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <School className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {entry.schoolName}
                              {settings.showState !== false && entry.state ? ` (${entry.state})` : ''}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-mono font-extrabold text-teal-950 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg shrink-0">
                      {entry.readableCelebrationDate}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-amber-200/90">
                    <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                      “{activeGreeting}”
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCycleVariation(entry.memberKey)}
                      className="text-xs font-semibold text-slate-600 hover:text-teal-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tukar Variasi Ucapan</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyGreeting(entry)}
                        className="text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
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

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(entry)}
                        className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Kongsi WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
            <Cake className="w-8 h-8 text-teal-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">
              Tiada Sambutan Hari Lahir Pada Hari Ini ({klToday.day} {MALAY_MONTH_NAMES[klToday.month]})
            </h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Tiada ahli PGB yang menyambut ulang tahun kelahiran pada tarikh hari ini. Anda boleh menyemak senarai hari lahir yang akan datang di bawah dan menyediakan ucapan lebih awal.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: UPCOMING BIRTHDAYS (SORTED BY NEAREST DATE) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-700" />
              <span>Senarai Hari Lahir Akan Datang (Susunan Tarikh Terdekat)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Disusun secara automatik mengikut bilangan hari terdekat dari tarikh hari ini
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHorizonFilter('7days')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                horizonFilter === '7days'
                  ? 'bg-teal-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              7 Hari Berikutnya ({roster.upcomingBirthdays.length})
            </button>
            <button
              type="button"
              onClick={() => setHorizonFilter('30days')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                horizonFilter === '30days'
                  ? 'bg-teal-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              30 Hari Berikutnya ({upcoming30DaysList.length})
            </button>
            <button
              type="button"
              onClick={() => setHorizonFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                horizonFilter === 'all'
                  ? 'bg-teal-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Rekod Tarikh Lahir ({roster.allIdentifiedBirthdays.length})
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama Pengetua/Guru Besar, sekolah, negeri atau bulan kelahiran..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
          />
        </div>

        {upcomingList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingList.map((entry) => {
              const activeGreeting = getActiveGreeting(entry);
              const isCopied = copiedId === entry.memberKey;

              return (
                <div
                  key={entry.memberKey}
                  className="p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-teal-300 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {settings.showMemberName !== false && (
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {entry.memberName}
                        </h3>
                      )}
                      {settings.showPosition !== false && (
                        <p className="text-xs font-semibold text-teal-800">{entry.position}</p>
                      )}
                      {settings.showSchoolName !== false && (
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {entry.schoolName} ({entry.state})
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-mono font-extrabold text-teal-950 bg-teal-100/80 px-2.5 py-1 rounded-lg">
                        {entry.formattedDayMonth}
                      </span>
                      <span className="block text-[10px] font-bold text-amber-800 mt-1">
                        {entry.daysUntilBirthday === 1
                          ? 'Esok'
                          : `Dalam ${entry.daysUntilBirthday} hari`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 italic leading-relaxed">
                    “{activeGreeting}”
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCycleVariation(entry.memberKey)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Variasi</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyGreeting(entry)}
                        className="text-[11px] font-bold bg-white hover:bg-teal-50 text-teal-900 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Ucapan</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(entry)}
                        className="text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Kongsi</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200/70">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              Tiada rekod hari lahir ditemui untuk tapisan ini.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Cuba pilih tab "30 Hari Berikutnya" atau "Semua Rekod Tarikh Lahir" di atas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
