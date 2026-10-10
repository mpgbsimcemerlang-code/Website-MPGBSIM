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
} from 'lucide-react';
import { useMemberPortal, PortalTab } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { BestPracticeItem, MemberSchool } from '../../types';

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
    registeredProgramIds,
  } = useMemberPortal();

  const { siteData } = useAdminContent();
  const programs = siteData.programs || [];

  // Match the member's registered school from the live website directory (siteData.memberSchools)
  const currentSchoolData: MemberSchool | null = React.useMemo(() => {
    const isMusleh =
      currentUser?.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      (currentUser?.email && currentUser.email.toLowerCase().includes('imusleh')) ||
      (currentUser?.school && currentUser.school.toLowerCase().includes('musleh')) ||
      (currentUser?.membershipNo && (currentUser.membershipNo.includes('MJAC011') || currentUser.membershipNo.includes('MIA1009')));

    const matched = (siteData.memberSchools || []).find((s) => {
      if (isMusleh && (s.id === 'sch-musleh-1' || s.code === 'MJAC011' || s.code === 'MIA1009' || s.name.toLowerCase().includes('musleh'))) {
        return true;
      }
      if (currentUser?.membershipNo && s.code && currentUser.membershipNo.includes(s.code)) return true;
      if (currentUser?.email && s.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser?.school && s.name && s.name.toLowerCase() === currentUser.school.toLowerCase()) return true;
      return false;
    });

    if (matched) return matched;
    if (isMusleh) {
      return (
        (siteData.memberSchools || []).find((s) => s.code === 'MJAC011') ||
        null
      );
    }
    return (siteData.memberSchools || [])[0] || null;
  }, [siteData.memberSchools, currentUser]);

  // 8 Quick Access Items specified in Prompt Section F
  const quickAccessCards: {
    id: PortalTab;
    title: string;
    sub: string;
    icon: any;
    color: string;
    subTab?: string;
  }[] = [
    {
      id: 'pengumuman',
      title: 'Pengumuman',
      sub: 'Surat rasmi, AGM & pekeliling',
      icon: Bell,
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'program',
      title: 'Program',
      sub: 'Konvensyen & takwim kepimpinan',
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
                  {currentSchoolData?.name || currentUser?.school || 'Sekolah Rendah Islam I Musleh'}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-2">
                <span className="text-slate-400">Kod:</span>
                <span className="font-mono font-bold text-amber-300">
                  {currentSchoolData?.code || 'MJAC011'}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-2">
                <span className="text-slate-400">No. Ahli:</span>
                <span className="font-mono font-bold text-teal-300">
                  {currentUser?.membershipNo?.replace('MIA1009', 'MJAC011') || `MPGB-2026-${currentSchoolData?.code || 'MJAC011'}`}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Keahlian Sah & Aktif</span>
              </div>
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

          <div className="flex items-center gap-2">
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
              <span className="font-mono text-amber-800 font-bold">{currentSchoolData?.code || 'MJAC011'}</span>
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
                {currentSchoolData?.principal || currentUser?.fullName || 'Ustaz Abdul Qayyum bin Yaakop'}
              </strong>
              <span className="text-[11px] font-semibold text-teal-800 block">
                {currentUser?.position || 'Guru Besar'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {currentSchoolData?.email || 'abdulqayyumyaakop@imuslehmelaka.edu.my'}
              </span>
            </div>
          </div>

          {/* Column 3: Institutional Specifications Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Kod Sekolah</span>
              <strong className="text-sm font-black text-teal-900 font-mono mt-0.5 block">
                {currentSchoolData?.code || 'MJAC011'}
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
                {currentSchoolData?.studentCount || 420} Murid | {currentSchoolData?.teacherCount || 32} Guru
              </strong>
              <span className="text-[10px] text-slate-500">Kapasiti Sesi 2026</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">No. Keahlian Rasmi</span>
              <strong className="text-xs font-bold text-amber-700 font-mono mt-0.5 block truncate">
                {currentUser?.membershipNo?.replace('MIA1009', 'MJAC011') || `MPGB-2026-${currentSchoolData?.code || 'MJAC011'}`}
              </strong>
              <span className="text-[10px] text-emerald-600 font-semibold">Tahun: {currentSchoolData?.joinYear || 2026}</span>
            </div>

            <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Hubungan & Laman Web</span>
                <span className="text-xs font-semibold text-slate-800 block truncate">
                  Tel: {currentSchoolData?.phone || '+60 6-335 1290'}
                </span>
                <a
                  href={currentSchoolData?.website || 'https://sri-imusleh.edu.my'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-medium truncate"
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span>{currentSchoolData?.website || 'https://sri-imusleh.edu.my'}</span>
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

      {/* 8 Quick Access Cards Grid */}
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
            return (
              <button
                key={idx}
                onClick={() => {
                  setPortalTab(card.id);
                  if (card.subTab) {
                    setPortalSubTab(card.subTab);
                  }
                }}
                className="group p-4 sm:p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400/50 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
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
                    {card.sub}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-teal-800 group-hover:text-amber-600">
                  <span>Buka Modul</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
              onClick={() => onOpenAnnouncementModal && onOpenAnnouncementModal(ann)}
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
                  <button
                    onClick={() => {
                      alert(`Memuat turun dokumen rasmi: ${docItem.title}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-teal-900 text-white text-[11px] font-semibold shrink-0"
                  >
                    Muat Turun
                  </button>
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
                <span>+60 3-8925 7890 / +60 19-345 6789</span>
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
    </div>
  );
};
