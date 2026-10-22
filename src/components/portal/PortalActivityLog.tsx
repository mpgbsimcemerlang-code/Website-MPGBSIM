import React, { useState, useMemo } from 'react';
import {
  Activity,
  Clock,
  CheckCircle,
  Search,
  Download,
  Printer,
  Shield,
  Award,
  UserCheck,
  FileText,
  CreditCard,
  Sparkles,
  LogIn,
  Lock,
  Building2,
  Calendar,
  Filter,
  QrCode,
  User,
  School,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { useMemberPortal, inferActivityCategory, normalizeSchoolCode } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { ActivityLogCategory, AuditLogItem, MemberSchool } from '../../types';
import { OfficialSchoolCertificateModal } from './OfficialSchoolCertificateModal';
import { DigitalMembershipCardModal } from './DigitalMembershipCardModal';

const CATEGORY_META: Record<
  ActivityLogCategory,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    iconBg: string;
    iconColor: string;
    icon: any;
  }
> = {
  LOG_MASUK: {
    label: 'Log Masuk & Sesi',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    icon: LogIn,
  },
  SIJIL_KAD: {
    label: 'Sijil & Kad Digital',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    icon: Award,
  },
  PROFIL: {
    label: 'Kemas Kini & Profil',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-900',
    badgeBorder: 'border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    icon: UserCheck,
  },
  DOKUMEN: {
    label: 'Muat Turun Dokumen',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    icon: FileText,
  },
  YURAN: {
    label: 'Yuran & Pembayaran',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
    icon: CreditCard,
  },
  PROGRAM_AMALAN: {
    label: 'Program & Kejayaan',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    icon: Sparkles,
  },
  KESELAMATAN: {
    label: 'Keselamatan Akaun',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-900',
    badgeBorder: 'border-rose-200',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
    icon: Lock,
  },
  LAIN_LAIN: {
    label: 'Aktiviti Sistem',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    iconBg: 'bg-slate-200',
    iconColor: 'text-slate-700',
    icon: Activity,
  },
};

export const PortalActivityLog: React.FC = () => {
  const { currentUser, auditLogs, registeredSchools, setPortalTab, recordAuditLog } = useMemberPortal();
  const { siteData } = useAdminContent();

  const [viewScope, setViewScope] = useState<'my-school' | 'all-members' | 'school-summary'>('my-school');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ActivityLogCategory>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const allSchools: MemberSchool[] = useMemo(() => {
    return registeredSchools && registeredSchools.length > 0
      ? registeredSchools
      : siteData.memberSchools || [];
  }, [registeredSchools, siteData.memberSchools]);

  // Match current user's school info
  const currentSchoolCodeClean = useMemo(() => {
    const raw =
      currentUser?.schoolCode ||
      currentUser?.membershipNo?.replace(/^MPGB-\d{4}-/i, '') ||
      '';
    return normalizeSchoolCode(raw);
  }, [currentUser]);

  // Enrich auditLogs with school details and category if missing on legacy entries
  const enrichedLogs = useMemo<AuditLogItem[]>(() => {
    return auditLogs.map((log) => {
      const cat = log.category || inferActivityCategory(log.action);
      if (log.schoolName && log.schoolCode) {
        return { ...log, category: cat };
      }

      const emailLower = (log.email || '').toLowerCase().trim();
      const userLower = (log.user || '').toLowerCase().trim();
      const contentLower = (log.content || '').toLowerCase();

      const matchedSchool = allSchools.find((s) => {
        const sEmail = (s.email || '').toLowerCase().trim();
        const sPgbEmail = (s.pgbEmail || '').toLowerCase().trim();
        const sPrincipal = (s.principal || '').toLowerCase().trim();
        const sCode = (s.code || '').toLowerCase().trim();
        const sName = (s.name || '').toLowerCase().trim();
        return (
          (emailLower && (sEmail === emailLower || sPgbEmail === emailLower)) ||
          (sCode && contentLower.includes(sCode)) ||
          (sName && contentLower.includes(sName)) ||
          (sPrincipal && userLower && (sPrincipal.includes(userLower) || userLower.includes(sPrincipal)))
        );
      });

      return {
        ...log,
        category: cat,
        schoolName: log.schoolName || matchedSchool?.name || (emailLower === 'mpgbsim.cemerlang@gmail.com' ? 'Sekretariat Utama MPGBSIM' : 'Institusi Sekolah Ahli MPGBSIM'),
        schoolCode: log.schoolCode || matchedSchool?.code || (emailLower === 'mpgbsim.cemerlang@gmail.com' ? 'HQ-001' : ''),
        state: log.state || matchedSchool?.state || 'Malaysia',
        position: log.position || matchedSchool?.designation || 'Pengetua / Guru Besar',
        membershipNo:
          log.membershipNo ||
          (matchedSchool?.code ? `MPGB-2026-${matchedSchool.code}` : 'MPGB-AHLI'),
      };
    });
  }, [auditLogs, allSchools]);

  // Filter logs belonging to the currently logged-in PGB / school
  const mySchoolLogs = useMemo(() => {
    if (!currentUser) return [];
    const myEmail = (currentUser.email || '').toLowerCase().trim();
    const myPgbEmail = (currentUser.pgbEmail || '').toLowerCase().trim();
    const myName = (currentUser.fullName || '').replace(/\(.*?\)/g, '').toLowerCase().trim();
    const mySchoolName = (currentUser.school || '').toLowerCase().trim();

    const matched = enrichedLogs.filter((log) => {
      const logCodeClean = normalizeSchoolCode(log.schoolCode);
      const logEmail = (log.email || '').toLowerCase().trim();
      const logUser = (log.user || '').replace(/\(.*?\)/g, '').toLowerCase().trim();
      const logSchool = (log.schoolName || '').toLowerCase().trim();
      const logContent = (log.content || '').toLowerCase();

      if (currentSchoolCodeClean && logCodeClean && currentSchoolCodeClean === logCodeClean) {
        return true;
      }
      if (myEmail && logEmail === myEmail) return true;
      if (myPgbEmail && logEmail === myPgbEmail) return true;
      if (mySchoolName && logSchool && logSchool === mySchoolName) return true;
      if (myName && logUser && (logUser.includes(myName) || myName.includes(logUser))) return true;
      if (currentSchoolCodeClean && logContent.includes(currentSchoolCodeClean.toLowerCase())) {
        return true;
      }
      return false;
    });

    const isReset = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_audit_logs_reset') === 'true';

    // Ensure at least the current active login session is visible if user is logged in (unless logs were recently reset by admin)
    if (matched.length === 0 && !isReset && enrichedLogs.length > 0) {
      const fallbackNow = new Date();
      return [
        {
          id: 'session-current-active',
          user: currentUser.fullName || 'Pengetua / Guru Besar',
          email: currentUser.pgbEmail || currentUser.email || 'ahli@mpgbsim.org',
          action: 'Log Masuk Portal Ahli (Sesi Aktif)',
          content: `${currentUser.position || 'PGB'} ${currentUser.fullName} dari ${currentUser.school} (${currentUser.state || 'Malaysia'}) sedang aktif dalam sesi Portal Ahli.`,
          timestamp: fallbackNow.toLocaleString('ms-MY', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          isoTimestamp: fallbackNow.toISOString(),
          schoolName: currentUser.school,
          schoolCode: currentUser.schoolCode || currentUser.membershipNo?.replace(/^MPGB-\d{4}-/i, '') || '',
          state: currentUser.state || 'Malaysia',
          position: currentUser.position || 'Pengetua / Guru Besar',
          membershipNo: currentUser.membershipNo || 'MPGB-AHLI',
          category: 'LOG_MASUK' as ActivityLogCategory,
        },
      ];
    }

    return matched;
  }, [enrichedLogs, currentUser, currentSchoolCodeClean]);

  const activeDataset = viewScope === 'my-school' ? mySchoolLogs : enrichedLogs;

  const filteredLogs = useMemo(() => {
    const nowMs = Date.now();
    return activeDataset.filter((log) => {
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }

      if (selectedPeriod !== 'ALL' && log.isoTimestamp) {
        const logMs = new Date(log.isoTimestamp).getTime();
        if (!Number.isNaN(logMs)) {
          const diffHours = (nowMs - logMs) / (1000 * 60 * 60);
          if (selectedPeriod === 'TODAY' && diffHours > 24) return false;
          if (selectedPeriod === '7DAYS' && diffHours > 24 * 7) return false;
          if (selectedPeriod === '30DAYS' && diffHours > 24 * 30) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hay = `${log.user} ${log.email} ${log.action} ${log.content} ${log.schoolName || ''} ${log.schoolCode || ''} ${log.state || ''} ${log.membershipNo || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [activeDataset, selectedCategory, selectedPeriod, searchQuery]);

  // Statistics for KPI cards
  const stats = useMemo(() => {
    const total = activeDataset.length;
    const logins = activeDataset.filter((l) => l.category === 'LOG_MASUK').length;
    const certAndCard = activeDataset.filter((l) => l.category === 'SIJIL_KAD').length;
    const profileAndDocs = activeDataset.filter(
      (l) => l.category === 'PROFIL' || l.category === 'DOKUMEN' || l.category === 'YURAN'
    ).length;

    const latestLogin = mySchoolLogs.find((l) => l.category === 'LOG_MASUK') || mySchoolLogs[0];
    const latestActivity = mySchoolLogs[0];

    return {
      total,
      logins,
      certAndCard,
      profileAndDocs,
      latestLoginTimestamp: latestLogin?.timestamp || 'Sesi Semasa Aktif',
      latestActivityTitle: latestActivity?.action || 'Log Masuk Portal Ahli',
      latestActivityTime: latestActivity?.timestamp || 'Hari ini',
    };
  }, [activeDataset, mySchoolLogs]);

  // Summary per registered school for "Ringkasan Status Keaktifan Mengikut Sekolah"
  const schoolActivitySummaries = useMemo(() => {
    return allSchools
      .map((sch) => {
        const schCodeClean = normalizeSchoolCode(sch.code);
        const schNameLower = (sch.name || '').toLowerCase().trim();
        const schEmailLower = (sch.email || '').toLowerCase().trim();
        const schPgbEmailLower = (sch.pgbEmail || '').toLowerCase().trim();

        const logsForSchool = enrichedLogs.filter((l) => {
          const lCode = normalizeSchoolCode(l.schoolCode);
          const lName = (l.schoolName || '').toLowerCase().trim();
          const lEmail = (l.email || '').toLowerCase().trim();
          return (
            (schCodeClean && lCode && schCodeClean === lCode) ||
            (schNameLower && lName && schNameLower === lName) ||
            (schEmailLower && lEmail === schEmailLower) ||
            (schPgbEmailLower && lEmail === schPgbEmailLower)
          );
        });

        const loginLogs = logsForSchool.filter((l) => l.category === 'LOG_MASUK');
        const certLogs = logsForSchool.filter((l) => l.category === 'SIJIL_KAD');
        const profileLogs = logsForSchool.filter((l) => l.category === 'PROFIL');

        const isReset = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_audit_logs_reset') === 'true';
        const isCurrentSchool =
          !isReset &&
          enrichedLogs.length > 0 &&
          (Boolean(currentSchoolCodeClean && schCodeClean === currentSchoolCodeClean) ||
          Boolean(currentUser?.school && sch.name?.toLowerCase().trim() === currentUser.school.toLowerCase().trim()));

        const lastLogin =
          loginLogs[0]?.timestamp ||
          (isCurrentSchool ? 'Sesi Semasa Aktif' : logsForSchool[0]?.timestamp || '-');
        const lastActivity =
          logsForSchool[0]?.action ||
          (isCurrentSchool ? 'Log Masuk Portal Ahli' : 'Belum Log Masuk');

        return {
          school: sch,
          totalCount: logsForSchool.length + (isCurrentSchool && logsForSchool.length === 0 ? 1 : 0),
          loginCount: loginLogs.length + (isCurrentSchool && loginLogs.length === 0 ? 1 : 0),
          certCount: certLogs.length,
          profileCount: profileLogs.length,
          lastLogin,
          lastActivity,
          isActive: logsForSchool.length > 0 || isCurrentSchool,
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [allSchools, enrichedLogs, currentSchoolCodeClean, currentUser]);

  const handleExportCsv = () => {
    recordAuditLog(
      'Eksport Laporan Log Keaktifan (CSV)',
      `Mengeksport ${filteredLogs.length} rekod Log Keaktifan Ahli ke fail CSV untuk pemantauan keahlian aktif.`,
      { category: 'DOKUMEN' }
    );

    const headers = [
      'Bil',
      'Tarikh & Masa',
      'Nama Pengetua / Guru Besar',
      'Jawatan',
      'Institusi Sekolah',
      'Kod Sekolah',
      'Negeri',
      'No. Keahlian',
      'Kategori',
      'Aktiviti Utama',
      'Butiran Rekod Aktiviti',
    ];

    const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = filteredLogs.map((log, idx) => {
      const catLabel = CATEGORY_META[log.category || 'LAIN_LAIN']?.label || 'Aktiviti Portal';
      return [
        String(idx + 1),
        escapeCsv(log.timestamp),
        escapeCsv(log.user),
        escapeCsv(log.position || 'Pengetua / Guru Besar'),
        escapeCsv(log.schoolName || '-'),
        escapeCsv(log.schoolCode || '-'),
        escapeCsv(log.state || '-'),
        escapeCsv(log.membershipNo || '-'),
        escapeCsv(catLabel),
        escapeCsv(log.action),
        escapeCsv(log.content),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Log_Keaktifan_Ahli_MPGBSIM_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintLog = () => {
    recordAuditLog(
      'Cetak Laporan Log Keaktifan Ahli',
      `Mencetak laporan pemantauan Log Keaktifan Ahli (${filteredLogs.length} rekod).`,
      { category: 'DOKUMEN' }
    );
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Activity className="w-72 h-72 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Pemantauan Rekod Keahlian Aktif MPGBSIM
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Log Keaktifan Ahli (Pengetua & Guru Besar)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Merekodkan tarikh dan masa tepat setiap kali Pengetua / Guru Besar (PGB) melog masuk ke Portal Ahli serta aktiviti utama yang dilakukan (seperti memuat turun Sijil Rasmi Keahlian, Kad Digital QR, mengemas kini profil kepimpinan, atau memuat turun dokumen) bagi tujuan pengesahan keahlian aktif.
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Eksport Laporan CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrintLog}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak Rekod Log</span>
            </button>
          </div>
        </div>

        {/* Active PGB Status Monitoring Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/90 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status Pemantauan Keahlian Anda
                </div>
                <div className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-2">
                  <span>KEAHLIAN AKTIF & DISAHKAN</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono text-[10px]">
                    {currentUser?.membershipNo || 'MPGB-AHLI'}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Log Masuk Terakhir Direkodkan
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {stats.latestLoginTimestamp}
              </span>
            </div>
          </div>

          {/* Quick Actions to trigger & verify tracked activities */}
          <div className="no-print lg:col-span-5 flex flex-wrap lg:justify-end items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-teal-800/90 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1.5 border border-teal-600/50 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Sijil Rasmi (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCardModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Kad Digital (QR)</span>
            </button>
            <button
              type="button"
              onClick={() => setPortalTab('profil')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Kemas Kini Profil</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Jumlah Rekod Aktiviti
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {stats.total}
            </strong>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              Direkodkan secara masa nyata
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Log Masuk Portal PGB
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
              {stats.logins}
            </strong>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Pengesahan kehadiran sesi
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Muat Turun Sijil & Kad
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
              {stats.certAndCard}
            </strong>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Sijil A4 & Kad QR Rasmi
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Kemas Kini Profil & Dokumen
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-teal-800 mt-1 block">
              {stats.profileAndDocs}
            </strong>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Penyelarasan data & sumber
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Scope Switcher & Search / Filter Controls */}
      <div className="no-print bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* View Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewScope('my-school')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                viewScope === 'my-school'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Rekod Aktiviti Saya & Institusi ({mySchoolLogs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewScope('all-members')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                viewScope === 'all-members'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Log Aktiviti Semua PGB ({enrichedLogs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewScope('school-summary')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                viewScope === 'school-summary'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Status Keaktifan Sekolah Ahli ({schoolActivitySummaries.length})</span>
            </button>
          </div>

          {/* Search & Period Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari PGB, sekolah, kod atau aktiviti..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {viewScope !== 'school-summary' && (
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 text-xs font-bold text-slate-700 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden"
              >
                <option value="ALL">Semua Tempoh Masa</option>
                <option value="TODAY">Hari Ini (24 Jam)</option>
                <option value="7DAYS">7 Hari Terakhir</option>
                <option value="30DAYS">30 Hari Terakhir</option>
              </select>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        {viewScope !== 'school-summary' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Kategori
            </button>
            {(Object.keys(CATEGORY_META) as ActivityLogCategory[]).map((catKey) => {
              const meta = CATEGORY_META[catKey];
              const IconComp = meta.icon;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedCategory === catKey
                      ? 'bg-teal-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW 1 & 2: CHRONOLOGICAL ACTIVITY LOG TABLE */}
      {viewScope !== 'school-summary' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                {viewScope === 'my-school'
                  ? `Senarai Rekod Log Masuk & Aktiviti (${currentUser?.school || 'Institusi Anda'})`
                  : 'Senarai Penuh Rekod Keaktifan Pengetua & Guru Besar (Seluruh Negara)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Setiap rekod mempunyai cap masa (tarikh & waktu) yang disahkan secara automatik untuk tujuan audit keahlian aktif MPGBSIM.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
              {filteredLogs.length} Rekod Dipaparkan
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Tiada Rekod Aktiviti Ditemui</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tiada log aktiviti yang sepadan dengan carian atau penapis kategori semasa. Sila pilih "Semua Kategori" untuk melihat keseluruhan rekod.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 sm:px-6">Tarikh & Masa</th>
                    <th className="py-3.5 px-4">Pengetua / Guru Besar & Institusi</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Aktiviti Utama & Butiran Rekod</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Status Rekod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.map((log) => {
                    const catKey = log.category || inferActivityCategory(log.action);
                    const meta = CATEGORY_META[catKey] || CATEGORY_META.LAIN_LAIN;
                    const IconComp = meta.icon;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Column 1: Date & Time */}
                        <td className="py-4 px-4 sm:px-6 align-top whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                            <span>{log.timestamp}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            ID: {log.id.slice(0, 14)}
                          </span>
                        </td>

                        {/* Column 2: PGB & School */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-slate-900">{log.user}</div>
                          <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                            {log.schoolName || 'Institusi Sekolah Ahli MPGBSIM'}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {log.schoolCode && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                                Kod: {log.schoolCode}
                              </span>
                            )}
                            {log.state && (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[10px] font-semibold border border-amber-200">
                                {log.state}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {log.email}
                            </span>
                          </div>
                        </td>

                        {/* Column 3: Category Badge */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                          >
                            <IconComp className="w-3.5 h-3.5 shrink-0" />
                            <span>{meta.label}</span>
                          </span>
                        </td>

                        {/* Column 4: Action & Details */}
                        <td className="py-4 px-4 align-top max-w-md">
                          <div className="font-extrabold text-slate-900">{log.action}</div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                            {log.content}
                          </p>
                        </td>

                        {/* Column 5: Verification Status */}
                        <td className="py-4 px-4 sm:px-6 align-top text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Sah & Aktif</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 3: SCHOOL ACTIVITY MONITORING SUMMARY TABLE */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                Ringkasan Pemantauan Keaktifan Mengikut Sekolah Ahli Berdaftar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekod keaktifan log masuk, muat turun sijil rasmi, dan kemas kini profil bagi setiap institusi sekolah ahli MPGBSIM.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Institusi Sekolah & Kod</th>
                  <th className="py-3.5 px-4">Pengetua / Guru Besar</th>
                  <th className="py-3.5 px-4">Log Masuk Terakhir</th>
                  <th className="py-3.5 px-4">Aktiviti Utama Terakhir</th>
                  <th className="py-3.5 px-4 text-center">Jumlah Rekod</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Status Keahlian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {schoolActivitySummaries
                  .filter((item) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase().trim();
                    const hay = `${item.school.name} ${item.school.code} ${item.school.principal} ${item.school.state}`.toLowerCase();
                    return hay.includes(q);
                  })
                  .map((item) => (
                    <tr key={item.school.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="font-bold text-slate-900">{item.school.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">
                            Kod: {item.school.code}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.school.state} • Ahli sejak {item.school.joinYear || 2024}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-slate-800">
                          {item.school.principal || 'Pengetua / Guru Besar'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {item.school.pgbEmail || item.school.email || '-'}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {item.lastLogin}
                        </span>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <span className="font-semibold text-teal-900 block">
                          {item.lastActivity}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Log Masuk: {item.loginCount} • Sijil/Kad: {item.certCount} • Profil: {item.profileCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 align-top text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 font-mono font-black text-xs">
                          {item.totalCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 sm:px-6 align-top text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Keahlian Aktif</span>
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals for quick certificate / digital card download */}
      <OfficialSchoolCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
      <DigitalMembershipCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
    </div>
  );
};
