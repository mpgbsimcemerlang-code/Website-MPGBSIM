import React from 'react';
import {
  Bell,
  Calendar,
  FileText,
  Sparkles,
  Users,
  Cpu,
  ClipboardList,
  Share2,
  ArrowRight,
  MapPin,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  ExternalLink,
  Shield,
  Phone,
  Mail,
  CheckCircle,
  Building2,
  School,
  Globe,
  Eye,
  User,
  GraduationCap,
  Trophy,
  QrCode,
  Download,
  CalendarDays,
  CreditCard,
  Receipt,
  MessageSquare,
  Activity,
  Cake,
} from 'lucide-react';
import { useMemberPortal, PortalTab } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { BestPracticeItem, MemberSchool } from '../../types';
import { DigitalMembershipCardModal } from './DigitalMembershipCardModal';
import { OfficialSchoolCertificateModal } from './OfficialSchoolCertificateModal';
import { PortalBirthdaySection } from './PortalBirthdaySection';

interface PortalDashboardHomeProps {
  onOpenAnnouncementModal?: (ann: any) => void;
  onOpenProgramModal?: (prog: any) => void;
  onOpenPracticeModal?: (practice: any) => void;
}

export const PortalDashboardHome: React.FC<PortalDashboardHomeProps> = ({
  onOpenAnnouncementModal,
  onOpenProgramModal,
  onOpenPracticeModal,
}) => {
  const {
    currentUser,
    setPortalTab,
    setPortalSubTab,
    announcements,
    documents,
    bestPractices,
    auditLogs,
    registeredProgramIds,
    totalUnreadChatCount,
    unreadPersonalChatCount,
    unreadPersonalSenders,
    openDirectChatWithSchool,
  } = useMemberPortal();

  const { siteData } = useAdminContent();
  const programs = siteData.programs || [];

  const [isDigitalCardModalOpen, setIsDigitalCardModalOpen] = React.useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = React.useState(false);
  const [selectedDashboardAnnouncement, setSelectedDashboardAnnouncement] = React.useState<any | null>(null);

  const getAnnouncementDownloadUrl = (ann: any): string => {
    const raw = (ann?.attachmentUrl || '').trim();
    if (raw && raw !== '#') {
      if (/^(https?:\/\/|data:|\/)/i.test(raw)) return raw;
      return `https://${raw}`;
    }
    if (
      ann?.id === 'ann-1' ||
      (ann?.title || '').toUpperCase().includes('JEMPUTAN MENYERTAI MESYUARAT MPGBSIM')
    ) {
      return 'https://drive.google.com/file/d/1PIemR7HOk9-JC--T1gMLMmMx4pwxDZh9/view?usp=sharing';
    }
    return 'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link';
  };

  const isSecondaryMusleh = React.useMemo(() => {
    return Boolean(
      currentUser?.email === 'smimmelaka@gmail.com' ||
      currentUser?.schoolCode === 'JAIM/SAS(M)130' ||
      currentUser?.schoolCode === 'MIA1009' ||
      currentUser?.membershipNo?.includes('JAIM/SAS') ||
      currentUser?.membershipNo?.includes('MIA1009') ||
      (currentUser?.school && (currentUser.school.toLowerCase().includes('menengah') || currentUser.school.toLowerCase().includes('sma')) && currentUser.school.toLowerCase().includes('musleh'))
    );
  }, [currentUser]);

  const isPrimaryMusleh = React.useMemo(() => {
    if (isSecondaryMusleh) return false;
    return Boolean(
      currentUser?.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      currentUser?.schoolCode === 'MJAC011' ||
      currentUser?.email?.toLowerCase().includes('imuslehmelaka') ||
      currentUser?.membershipNo?.includes('MJAC011') ||
      (currentUser?.school && (currentUser.school.toLowerCase().includes('rendah') || currentUser.school.toLowerCase().includes('sri')) && currentUser.school.toLowerCase().includes('musleh'))
    );
  }, [currentUser, isSecondaryMusleh]);

  const currentSchoolData: MemberSchool | null = React.useMemo(() => {
    const schools = siteData.memberSchools || [];
    if (!schools.length) return null;

    if (isSecondaryMusleh) {
      return (
        schools.find((s) => s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.id === 'school-musleh-menengah-1' || s.email?.toLowerCase() === 'smimmelaka@gmail.com' || (s.name?.toLowerCase().includes('menengah') && s.name?.toLowerCase().includes('musleh'))) ||
        null
      );
    }

    if (isPrimaryMusleh) {
      return (
        schools.find((s) => s.id === 'sch-musleh-1' || s.code === 'MJAC011' || s.email?.toLowerCase() === 'abdulqayyumyaakop@imuslehmelaka.edu.my' || (s.name?.toLowerCase().includes('rendah') && s.name?.toLowerCase().includes('musleh'))) ||
        null
      );
    }

    // Strict Priority:
    // 1. Direct schoolId match
    if (currentUser?.schoolId) {
      const byId = schools.find((s) => s.id === currentUser.schoolId);
      if (byId) return byId;
    }

    // 2. Direct uid match
    if (currentUser?.uid) {
      const byUid = schools.find((s) => currentUser.uid === `sch-user-${s.id}` || currentUser.uid === s.id);
      if (byUid) return byUid;
    }

    // 3. Direct schoolCode match
    if (currentUser?.schoolCode) {
      const byCode = schools.find((s) => s.code && s.code.toUpperCase() === currentUser.schoolCode?.toUpperCase());
      if (byCode) return byCode;
    }

    // 4. Membership number containing school code
    if (currentUser?.membershipNo) {
      const byMem = schools.find((s) => s.code && currentUser.membershipNo?.toUpperCase().includes(s.code.toUpperCase()));
      if (byMem) return byMem;
    }

    // 5. Exact school name match
    if (currentUser?.school) {
      const byName = schools.find((s) => s.name && s.name.toLowerCase().trim() === currentUser.school?.toLowerCase().trim());
      if (byName) return byName;
    }

    // 6. Personal PGB Email match
    if (currentUser?.pgbEmail) {
      const byPgbEmail = schools.find((s) => s.pgbEmail && s.pgbEmail.toLowerCase().trim() === currentUser.pgbEmail?.toLowerCase().trim());
      if (byPgbEmail) return byPgbEmail;
    }

    // 7. Generic school email with matching school type / position
    if (currentUser?.email) {
      const byEmail = schools.find((s) => {
        const emailMatches = s.email && s.email.toLowerCase() === currentUser.email.toLowerCase();
        if (!emailMatches) return false;
        if (currentUser.schoolType && s.type && currentUser.schoolType.toLowerCase().trim() === s.type.toLowerCase().trim()) return true;
        if (currentUser.position === 'Guru Besar' && s.type?.toLowerCase().includes('rendah')) return true;
        if (currentUser.position === 'Pengetua' && s.type?.toLowerCase().includes('menengah')) return true;
        return false;
      });
      if (byEmail) return byEmail;
    }

    return null;
  }, [siteData.memberSchools, currentUser]);

  // Quick Access Items
  const quickAccessCards: {
    id: PortalTab;
    title: string;
    sub: string;
    icon: any;
    color: string;
    subTab?: string;
  }[] = [
    {
      id: 'sembang-live',
      title: 'Sembang Live PGB',
      sub: 'Ruang interaksi langsung semua PGB',
      icon: MessageSquare,
      color: 'from-teal-700 via-emerald-700 to-slate-900',
    },
    {
      id: 'yuran',
      title: 'Bayar Yuran PGB',
      sub: 'Gerbang rasmi HerePay & rekod resit',
      icon: CreditCard,
      color: 'from-emerald-600 via-teal-700 to-slate-900',
    },
    {
      id: 'pengumuman',
      title: 'Pengumuman',
      sub: 'Surat rasmi, AGM & pekeliling',
      icon: Bell,
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'peperiksaan',
      title: 'Kalendar Peperiksaan',
      sub: 'Countdown SPM, UPKK & SPPIM',
      icon: CalendarDays,
      color: 'from-slate-900 to-teal-950',
    },
    {
      id: 'program',
      title: 'Program & Sijil',
      sub: 'Takwim, rekod kehadiran & sijil penyertaan PGB',
      icon: Calendar,
      color: 'from-teal-600 to-teal-700',
    },
    {
      id: 'dokumen',
      title: 'Dokumen',
      sub: 'Modul, perlembagaan & pekeliling',
      icon: FileText,
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'best-practice',
      title: 'Best Practice',
      sub: 'Amalan terbaik sekolah Islam',
      icon: Sparkles,
      color: 'from-emerald-600 to-emerald-700',
    },
    {
      id: 'direktori',
      title: 'Direktori PGB',
      sub: 'Rangkaian kepimpinan pengetua',
      icon: Users,
      color: 'from-indigo-600 to-indigo-700',
      subTab: 'pgb',
    },
    {
      id: 'ai-hub',
      title: 'AI & Digital',
      sub: 'Prompt library & alatan AI PGB',
      icon: Cpu,
      color: 'from-purple-600 to-purple-700',
    },
    {
      id: 'kejayaan-sekolah',
      title: 'Kejayaan Sekolah',
      sub: 'Papar langsung di web MPGBSIM',
      icon: Trophy,
      color: 'from-amber-600 to-amber-700',
    },
    {
      id: 'kongsi-amalan',
      title: 'Kongsi Amalan',
      sub: 'Hantar modul & kajian amalan',
      icon: Share2,
      color: 'from-cyan-600 to-cyan-700',
    },
    {
      id: 'hari-lahir',
      title: 'Hari Lahir Ahli',
      sub: 'Sambutan hari ini & 7 hari akan datang',
      icon: Cake,
      color: 'from-amber-500 via-amber-600 to-teal-800',
    },
    {
      id: 'log-keaktifan',
      title: 'Log Keaktifan Ahli',
      sub: 'Rekod tarikh log masuk & aktiviti PGB',
      icon: Activity,
      color: 'from-emerald-700 via-teal-800 to-slate-900',
    },
  ];

  const recentAnnouncements = React.useMemo(() => {
    return [...announcements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [announcements]);

  const upcomingPrograms = programs.slice(0, 2);

  const recentBestPractices = React.useMemo(() => {
    const map = new Map<string, BestPracticeItem>();
    (siteData.practices || []).forEach((p) => {
      map.set(p.id, { ...p, status: p.status || 'Published', school: p.school || p.schoolName });
    });
    bestPractices.forEach((bp) => {
      map.set(bp.id, { ...bp, school: bp.school || bp.schoolName });
    });
    return Array.from(map.values())
      .filter((b) => b.status === 'Published' || b.status === 'published' || !b.status)
      .slice(0, 2);
  }, [siteData.practices, bestPractices]);

  const recentDocuments = React.useMemo(() => {
    const list = [...documents];
    (siteData.resources || []).forEach((r) => {
      if (!list.some((d) => d.id === r.id || d.title.toLowerCase() === r.title.toLowerCase())) {
        list.push({
          id: r.id,
          title: r.title,
          category: 'Dokumen MPGBSIM',
          fileFormat: r.fileFormat || 'PDF',
          fileSize: r.fileSize || '2.8 MB',
          uploadDate: r.publishedDate || '2026',
          uploader: 'Sekretariat MPGBSIM',
          version: '1.0',
          downloads: r.downloads || 0,
          description: r.description,
          visibility: 'PUBLIC',
          downloadUrl:
            r.driveUrl ||
            r.fileUrl ||
            'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link',
        });
      }
    });
    return list.slice(0, 3);
  }, [documents, siteData.resources]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Hero Banner with School Spotlight */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle geometric background pattern */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Sparkles className="w-80 h-80 text-amber-300" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Portal Rasmi MPGBSIM • Sesi 2026
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Assalamualaikum, <span className="text-amber-300">{currentUser?.fullName || 'Pengetua / Guru Besar'}</span>
            </h1>

            <p className="mt-2 text-base sm:text-lg font-medium text-slate-200">
              Selamat datang ke Portal Ahli Rasmi MPGBSIM.
            </p>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Data akaun dan profil kepimpinan institusi anda diselaraskan sepenuhnya dengan direktori laman web rasmi majlis.
            </p>

            {/* Member Metadata Pills */}
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-2">
                <School className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400">Institusi:</span>
                <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-none">
                  {currentSchoolData?.name || currentUser?.school || (isSecondaryMusleh ? 'SEKOLAH MENENGAH AGAMA I-MUSLEH' : 'Sekolah Rendah Islam I Musleh')}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-2">
                <span className="text-slate-400">Kod:</span>
                <span className="font-mono font-bold text-amber-300">
                  {isSecondaryMusleh ? 'JAIM/SAS(M)130' : (currentSchoolData?.code || currentUser?.schoolCode || 'MJAC011')}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-2">
                <span className="text-slate-400">No. Ahli:</span>
                <span className="font-mono font-bold text-teal-300">
                  {isSecondaryMusleh ? 'MPGB-2026-JAIM/SAS(M)130' : (currentUser?.membershipNo?.replace('MIA1009', 'JAIM/SAS(M)130') || (currentSchoolData?.code ? `MPGB-2026-${currentSchoolData.code}` : 'MPGB-2026-MJAC011'))}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Keahlian Sah & Aktif</span>
              </div>
            </div>

            {/* Quick Action: Digital Membership Card Download & Fee Payment */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPortalTab('yuran')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>Bayar Yuran PGB (HerePay)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDigitalCardModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-slate-950" />
                <span>Kad Keahlian Digital (QR)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCertificateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs flex items-center gap-2 border border-amber-400/40 shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Sijil Rasmi Keahlian Sekolah</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalTab('program')}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-extrabold text-xs flex items-center gap-2 border border-amber-400/50 shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Rekod Kehadiran & Sijil Program</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalTab('log-keaktifan')}
                className="px-4 py-2.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 font-extrabold text-xs flex items-center gap-2 border border-emerald-500/40 shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Log Keaktifan Ahli</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalTab('peperiksaan')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs flex items-center gap-2 border border-amber-400/30 transition cursor-pointer"
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>Countdown 3 Ujian Bertulis (UPKK • SPPIM • SPM)</span>
              </button>
            </div>
          </div>

          {/* Right Spotlight Card with School Campus Image & PGB Portrait */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-slate-900/95 border border-slate-700/90 shadow-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Institusi Sekolah Ahli Anda
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {currentSchoolData?.type || 'Rakan Musleh'}
                </span>
              </div>

              {/* Institution Photo with Logo Badge */}
              <div className="mt-3 relative h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={
                    currentSchoolData?.schoolPhotoUrl ||
                    currentUser?.schoolPhotoUrl ||
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt={currentSchoolData?.name || 'Foto Institusi Sekolah'}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent flex items-end justify-between p-2.5">
                  <span className="text-[11px] font-semibold text-white drop-shadow-md truncate">
                    {currentSchoolData?.district || 'Melaka Tengah'}, {currentSchoolData?.state || 'Melaka'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-amber-300 border border-white/10 backdrop-blur-xs font-bold">
                    Kod: {currentSchoolData?.code || 'MJAC011'}
                  </span>
                </div>

                {/* Logo in top-left overlay */}
                <div className="absolute top-2 left-2 w-10 h-10 rounded-lg bg-white/95 p-1 shadow-md border border-slate-200 flex items-center justify-center">
                  <img
                    src={
                      currentSchoolData?.logoUrl ||
                      currentUser?.logoUrl ||
                      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80'
                    }
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Principal Info & Photo */}
              <div className="mt-3.5 flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <img
                  src={
                    currentSchoolData?.principalPhotoUrl ||
                    currentUser?.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={currentSchoolData?.principal || 'PGB'}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shrink-0 shadow-md bg-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {currentSchoolData?.principal || currentUser?.fullName || 'Ustaz Abdul Qayyum bin Yaakop'}
                  </div>
                  <div className="text-[11px] text-amber-300 truncate">
                    {currentUser?.position || 'Guru Besar'} • {currentSchoolData?.name || 'Sekolah Rendah Islam I Musleh'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tel: {currentSchoolData?.phone || '+60 6-335 1290'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPortalTab('profil')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold transition shrink-0 cursor-pointer border border-slate-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Profil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seksyen Sambutan Hari Lahir Ahli PGB (Hari Ini & 7 Hari Akan Datang) */}
      <PortalBirthdaySection compact={true} />

      {/* Saluran Siaran Langsung Berita Kejayaan Sekolah PGB */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-teal-700 p-1 shadow-lg">
        <div className="bg-slate-900 rounded-[22px] p-5 sm:p-7 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
            <Trophy className="w-64 h-64 text-amber-400" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Saluran Berita Kejayaan Sekolah PGB • Siaran Langsung</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
              <span>Ada Berita Pencapaian Sekolah Baharu?</span>
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pengetua & Guru Besar boleh memasukkan sendiri berita kejayaan, anugerah robotik, hafazan, kokurikulum atau akademik sekolah anda. Berita akan disiarkan <strong className="text-amber-300">secara langsung (real-time)</strong> di bahagian Berita Laman Utama MPGBSIM!
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setPortalTab('kejayaan-sekolah')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>Hantar Berita Kejayaan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profil Lengkap Institusi Ahli Berdaftar (Selaras Dengan Direktori Laman Web) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider mb-1">
              <School className="w-3.5 h-3.5 text-teal-700" />
              <span>Data Rasmi Sekolah Ahli PGB</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Profil Institusi: {currentSchoolData?.name || 'Sekolah Rendah Islam I Musleh'}
            </h2>
            <p className="text-xs text-slate-500">
              Data dan gambar di bawah diselaraskan secara langsung dengan paparan Direktori Laman Web MPGBSIM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCertificateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-slate-950" />
              <span>Sijil Rasmi Keahlian Sekolah</span>
            </button>
            <button
              onClick={() => setPortalTab('profil')}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-teal-300" />
              <span>Kemas Kini Profil & Gambar</span>
            </button>
            <button
              onClick={() => {
                setPortalTab('direktori');
                setPortalSubTab('sekolah');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Buka Direktori Web</span>
            </button>
          </div>
        </div>

        {/* 3 Columns: Campus Photo, PGB Portrait, and Institutional Specs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Column 1: Campus Picture */}
          <div className="md:col-span-4 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-950 min-h-[200px] flex flex-col justify-between">
            <img
              src={
                currentSchoolData?.schoolPhotoUrl ||
                currentUser?.schoolPhotoUrl ||
                'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80'
              }
              alt="Foto Institusi Sekolah"
              className="w-full h-full object-cover absolute inset-0 opacity-90"
            />
            <div className="relative z-10 p-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/10">
                <School className="w-3.5 h-3.5 text-amber-400" />
                Foto Institusi Rasmi
              </span>
            </div>
            <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
              <p className="text-xs font-bold leading-tight truncate">{currentSchoolData?.name || 'Sekolah Rendah Islam I Musleh'}</p>
              <p className="text-[11px] text-slate-300 truncate">{currentSchoolData?.address || 'KM 9, Jalan Bukit Baru, 75150 Melaka'}</p>
            </div>
          </div>

          {/* Column 2: PGB Leadership Portrait */}
          <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col items-center text-center justify-between">
            <div className="w-full flex justify-between items-center text-[10px] text-slate-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-teal-800">Kepimpinan PGB</span>
              <span className="font-mono text-amber-800 font-bold">{isSecondaryMusleh ? 'JAIM/SAS(M)130' : (currentSchoolData?.code || 'MJAC011')}</span>
            </div>

            <div className="relative my-1">
              <img
                src={
                  currentSchoolData?.principalPhotoUrl ||
                  currentUser?.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }
                alt="Pengetua / Guru Besar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-teal-700 shadow-md bg-white"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-teal-800 text-white text-[9px] font-bold">
                PGB
              </span>
            </div>

            <div className="mt-2 w-full">
              <strong className="text-xs font-extrabold text-slate-900 block truncate">
                {currentSchoolData?.principal || currentUser?.fullName || (isSecondaryMusleh ? 'Masitah Binti Seikh Omar (Pengetua)' : 'Ustaz Abdul Qayyum bin Yaakop')}
              </strong>
              <span className="text-[11px] font-semibold text-teal-800 block">
                {currentUser?.position || (isSecondaryMusleh ? 'Pengetua' : 'Guru Besar')}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {currentSchoolData?.email || (isSecondaryMusleh ? 'smimmelaka@gmail.com' : 'abdulqayyumyaakop@imuslehmelaka.edu.my')}
              </span>
            </div>
          </div>

          {/* Column 3: Institutional Specifications Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Kod Sekolah</span>
              <strong className="text-sm font-black text-teal-900 font-mono mt-0.5 block">
                {isSecondaryMusleh ? 'JAIM/SAS(M)130' : (currentSchoolData?.code || 'MJAC011')}
              </strong>
              <span className="text-[10px] text-slate-500">Pendaftaran Rasmi</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Kategori Sekolah</span>
              <strong className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                {currentSchoolData?.type || 'Rakan Musleh'}
              </strong>
              <span className="text-[10px] text-slate-500">{currentSchoolData?.state || 'Melaka'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Bilangan Murid & Guru</span>
              <strong className="text-xs font-bold text-slate-800 mt-0.5 block">
                {currentSchoolData?.studentCount ?? (isSecondaryMusleh ? 79 : 420)} Murid | {currentSchoolData?.teacherCount ?? (isSecondaryMusleh ? 10 : 32)} Guru
              </strong>
              <span className="text-[10px] text-slate-500">Kapasiti Sesi 2026</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">No. Keahlian Rasmi</span>
              <strong className="text-xs font-bold text-amber-700 font-mono mt-0.5 block truncate">
                {isSecondaryMusleh ? 'MPGB-2026-JAIM/SAS(M)130' : (currentUser?.membershipNo?.replace('MIA1009', 'JAIM/SAS(M)130') || (currentSchoolData?.code ? `MPGB-2026-${currentSchoolData.code}` : 'MPGB-2026-MJAC011'))}
              </strong>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Tahun: {isPrimaryMusleh ? (currentSchoolData?.joinYear && Number(currentSchoolData.joinYear) !== 2026 ? Number(currentSchoolData.joinYear) : 2011) : (currentSchoolData?.joinYear || (isSecondaryMusleh ? 2023 : 2024))}
              </span>
            </div>

            <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Hubungan & Laman Web</span>
                <span className="text-xs font-semibold text-slate-800 block truncate">
                  Tel: {currentSchoolData?.phone || (isSecondaryMusleh ? '06-2349405' : '+60 6-335 1290')}
                </span>
                <a
                  href={currentSchoolData?.website || (isSecondaryMusleh ? 'https://i-musleh.com' : 'https://imuslehmelaka.edu.my')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-medium truncate"
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span>{currentSchoolData?.website || (isSecondaryMusleh ? 'https://i-musleh.com' : 'https://imuslehmelaka.edu.my')}</span>
                </a>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src={
                    currentSchoolData?.logoUrl ||
                    currentUser?.logoUrl ||
                    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80'
                  }
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat PGB Quick-Launch Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-teal-800 border border-teal-600/50 text-amber-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
            {totalUnreadChatCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-slate-900 animate-bounce">
                {totalUnreadChatCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Rangkaian Interaksi Masa Nyata (Live Chat)</span>
              {totalUnreadChatCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                  {totalUnreadChatCount} mesej baharu
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
              Ruang Sembang Langsung Semua PGB MPGBSIM
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {unreadPersonalSenders.length > 0
                ? `Mesej peribadi baharu daripada ${unreadPersonalSenders[0].senderName} (${unreadPersonalSenders[0].senderSchool}): "${unreadPersonalSenders[0].latestText}"`
                : 'Berinteraksi secara langsung bersama rakan Pengetua & Guru Besar seluruh Malaysia mengikut saluran topik atau mesej terus (1-ke-1).'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (unreadPersonalSenders.length > 0) {
              openDirectChatWithSchool(
                unreadPersonalSenders[0].channelId || unreadPersonalSenders[0].senderSchoolCode
              );
            } else {
              setPortalTab('sembang-live');
            }
          }}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-md transition cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>
            {totalUnreadChatCount > 0
              ? `Buka Sembang (${totalUnreadChatCount} mesej baharu) →`
              : 'Masuk Ruang Sembang Live →'}
          </span>
        </button>
      </div>

      {/* Quick Access Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Pusat Akses Pantas (Quick Access)</h2>
            <p className="text-xs text-slate-500">Pilih modul utama untuk memulakan tugasan atau capaian bahan</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickAccessCards.map((card, idx) => {
            const Icon = card.icon;
            const isLiveChatCard = card.id === 'sembang-live';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isLiveChatCard && unreadPersonalSenders.length > 0) {
                    openDirectChatWithSchool(
                      unreadPersonalSenders[0].channelId || unreadPersonalSenders[0].senderSchoolCode
                    );
                  } else {
                    if (card.subTab) {
                      setPortalSubTab(card.subTab);
                    }
                    setPortalTab(card.id);
                  }
                  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                }}
                className={`group relative p-4 sm:p-5 rounded-2xl bg-white hover:bg-slate-50 border ${
                  isLiveChatCard && totalUnreadChatCount > 0
                    ? 'border-rose-400 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-amber-400/50'
                } shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer`}
              >
                {isLiveChatCard && totalUnreadChatCount > 0 && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-xs animate-pulse">
                    {totalUnreadChatCount} mesej baharu
                  </span>
                )}
                <div>
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-teal-900 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {isLiveChatCard && unreadPersonalChatCount > 0
                      ? `${unreadPersonalChatCount} mesej peribadi PGB belum dibaca`
                      : card.sub}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-teal-800 group-hover:text-amber-600">
                  <span>{isLiveChatCard && totalUnreadChatCount > 0 ? 'Baca Mesej' : 'Buka Modul'}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Widget: Log Keaktifan Ahli (Pemantauan Rekod Keahlian Aktif) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Pemantauan Rekod Keahlian Aktif
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Modul Log Keaktifan Ahli (Pengetua & Guru Besar)
              </h2>
              <p className="text-xs text-slate-500">
                Rekod automatik tarikh dan masa setiap kali PGB melog masuk serta aktiviti utama (muat turun sijil, kad digital, kemas kini profil & dokumen).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPortalTab('log-keaktifan')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-xs transition-colors cursor-pointer"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Buka Log Keaktifan Penuh ({auditLogs.length}) →</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {auditLogs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              onClick={() => setPortalTab('log-keaktifan')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                    {log.action}
                  </span>
                  <span className="font-mono text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-teal-700" />
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-2 line-clamp-2">
                  {log.content}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-bold text-slate-800 truncate">{log.user}</span>
                {log.schoolCode && (
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {log.schoolCode}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 1: Pengumuman Terkini */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">SECTION 1: Pengumuman Terkini Ahli</h2>
              <p className="text-xs text-slate-500">Pemberitahuan rasmi pimpinan kebangsaan dan surat edaran</p>
            </div>
          </div>
          <button
            onClick={() => setPortalTab('pengumuman')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 hover:underline"
          >
            Lihat Semua ({announcements.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentAnnouncements.map((ann) => (
            <div
              key={ann.id}
              onClick={() => {
                if (onOpenAnnouncementModal) {
                  onOpenAnnouncementModal(ann);
                } else {
                  setSelectedDashboardAnnouncement(ann);
                }
              }}
              className="p-5 rounded-2xl bg-slate-50 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === 'Rasmi'
                        ? 'bg-blue-100 text-blue-900'
                        : ann.category === 'Mesyuarat'
                        ? 'bg-amber-100 text-amber-900'
                        : ann.category === 'Penting'
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(ann.date).toLocaleDateString('ms-MY', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 hover:text-teal-900 line-clamp-2 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{ann.summary}</p>

                {(ann.attachmentName || ann.attachmentUrl) && (
                  <div className="mt-3 p-2.5 rounded-xl bg-teal-50/80 border border-teal-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                      <span className="text-[11px] font-semibold text-teal-950 truncate">
                        {ann.attachmentName || 'Dokumen Lampiran'}
                      </span>
                    </div>
                    <a
                      href={getAnnouncementDownloadUrl(ann)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Muat Turun</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[150px] font-medium text-[11px]">Oleh: {ann.author}</span>
                <span className="text-teal-800 font-bold hover:underline flex items-center gap-0.5">
                  Baca <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Program Akan Datang */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">SECTION 2: Program & Acara Akan Datang</h2>
              <p className="text-xs text-slate-500">Takwim kursus kepimpinan, konvensyen dan persidangan meja bulat</p>
            </div>
          </div>
          <button
            onClick={() => setPortalTab('program')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 hover:underline"
          >
            Lihat Takwim Penuh →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingPrograms.map((prog) => {
            const isRegistered = registeredProgramIds.includes(prog.id);
            return (
              <div
                key={prog.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-200 hover:border-teal-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-teal-800 text-white text-[10px] font-bold uppercase tracking-wider">
                      {prog.mode || 'Fizikal'}
                    </span>
                    {isRegistered ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Telah Didaftar
                      </span>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold">Penyertaan Terbuka</span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">{prog.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{prog.description}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>{prog.date} {prog.time ? `• ${prog.time}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span className="truncate">{prog.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900">
                    Yuran: <span className="text-amber-700">{prog.fees || 'Percuma Ahli'}</span>
                  </span>
                  <button
                    onClick={() => {
                      if (onOpenProgramModal) {
                        onOpenProgramModal(prog);
                      } else {
                        setPortalTab('program');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-xs"
                  >
                    {isRegistered ? 'Semak Butiran' : 'Daftar Sekarang'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3 & 4: Best Practice & Sumber Terbaharu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 3: Best Practice Terkini */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">SECTION 3: Best Practice Terkini</h2>
                  <p className="text-xs text-slate-500">Perkongsian inovasi dan model kejayaan sekolah Islam</p>
                </div>
              </div>
              <button
                onClick={() => setPortalTab('best-practice')}
                className="text-xs font-semibold text-teal-800 hover:underline"
              >
                Lihat Hub →
              </button>
            </div>

            <div className="space-y-3.5">
              {recentBestPractices.map((bp) => (
                <div
                  key={bp.id}
                  onClick={() => onOpenPracticeModal && onOpenPracticeModal(bp)}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                      {bp.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Tahun {bp.year || '2026'}</span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{bp.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Institusi: {bp.school || bp.schoolName}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {bp.approach || bp.impactSummary || bp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-right">
            <button
              onClick={() => setPortalTab('kongsi-amalan')}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 justify-end ml-auto"
            >
              + Kongsi Amalan Terbaik Sekolah Anda →
            </button>
          </div>
        </section>

        {/* SECTION 4: Sumber Terbaharu */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">SECTION 4: Sumber & Dokumen</h2>
                  <p className="text-xs text-slate-500">Pusat muat turun modul, templat dan pekeliling</p>
                </div>
              </div>
              <button
                onClick={() => setPortalTab('dokumen')}
                className="text-xs font-semibold text-teal-800 hover:underline"
              >
                Pusat Dokumen →
              </button>
            </div>

            <div className="space-y-3">
              {recentDocuments.map((docItem) => (
                <div
                  key={docItem.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-200 shrink-0">
                      {docItem.fileFormat || 'PDF'}
                    </div>
                    <div className="truncate text-left">
                      <div className="font-semibold text-xs text-slate-900 truncate">{docItem.title}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{docItem.category}</span>
                        <span>•</span>
                        <span>{docItem.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={
                      docItem.downloadUrl ||
                      'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-teal-900 text-white text-[11px] font-semibold shrink-0 transition-colors"
                  >
                    Muat Turun
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-right">
            <button
              onClick={() => setPortalTab('sumber')}
              className="text-xs font-bold text-blue-800 hover:underline flex items-center gap-1 justify-end ml-auto"
            >
              Lihat Pusat Sumber Lengkap →
            </button>
          </div>
        </section>
      </div>

      {/* SECTION 5: Quick Links & Hubungi Sekretariat */}
      <section className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
              SECTION 5: Pautan Pintas & Khidmat Sokongan
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Bantuan Khidmat Urus Setia & Pendaftaran Ahli
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Sebarang pertanyaan berkaitan keahlian, pembaharuan rekod sekolah, penyerahan kertas kerja atau masalah log masuk, sila hubungi sekretariat kebangsaan secara terus.
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>mpgbsim.cemerlang@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>03-4251 6157, 03-4251 6167</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <a
                  href="https://www.mpgbsim.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:underline font-mono"
                >
                  https://www.mpgbsim.org/
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2.5">
            <button
              onClick={() => setPortalTab('profil')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors text-center"
            >
              Kemaskini Profil Pengetua & Sekolah
            </button>
            <button
              onClick={() => setPortalTab('ai-hub')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors text-center"
            >
              Buka AI & Digital Hub
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Announcement Detail Modal */}
      {selectedDashboardAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedDashboardAnnouncement(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                {selectedDashboardAnnouncement.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {selectedDashboardAnnouncement.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
              <span>
                Dikeluarkan oleh:{' '}
                <strong className="text-slate-800">{selectedDashboardAnnouncement.author}</strong>
              </span>
              <span>Tarikh: {selectedDashboardAnnouncement.date}</span>
            </div>

            {selectedDashboardAnnouncement.imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={selectedDashboardAnnouncement.imageUrl}
                  alt={selectedDashboardAnnouncement.title}
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}

            <div className="mt-5 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
              {selectedDashboardAnnouncement.content}
            </div>

            {(selectedDashboardAnnouncement.attachmentName ||
              selectedDashboardAnnouncement.attachmentUrl) && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-6 h-6 text-teal-800 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {selectedDashboardAnnouncement.attachmentName ||
                        'Dokumen Lampiran Rasmi PDF'}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Dokumen Lampiran Rasmi PDF (Google Drive)
                    </span>
                  </div>
                </div>
                <a
                  href={getAnnouncementDownloadUrl(selectedDashboardAnnouncement)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun</span>
                </a>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDashboardAnnouncement(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Membership Card Modal */}
      <DigitalMembershipCardModal
        isOpen={isDigitalCardModalOpen}
        onClose={() => setIsDigitalCardModalOpen(false)}
      />

      {/* Official School Membership Certificate Modal */}
      <OfficialSchoolCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />
    </div>
  );
};
