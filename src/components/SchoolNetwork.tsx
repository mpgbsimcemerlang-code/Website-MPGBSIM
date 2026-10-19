import React, { useState, useMemo, useEffect } from 'react';
import { NetworkStats, MemberSchool } from '../types';
import { MALAYSIA_STATES, SCHOOL_TYPES } from '../data/constants';
import { useAdminContent } from '../context/AdminContentContext';
import {
  School,
  MapPin,
  Users,
  Search,
  Edit3,
  Building2,
  X,
  Eye,
  Globe,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  ShieldCheck,
  ExternalLink,
  UserCheck,
  BookOpen,
  Radio,
  RotateCcw,
} from 'lucide-react';
import { SchoolNetworkCharts, resolveSchoolMembershipType } from './SchoolNetworkCharts';

interface SchoolNetworkProps {
  stats: NetworkStats;
  onUpdateStats: (newStats: NetworkStats) => void;
  schools: MemberSchool[];
}

type LiveCardFilter = 'ALL' | 'PENGETUA' | 'GURU_BESAR' | 'MURID_RENDAH' | 'PELAJAR_MENENGAH';

export const isPrimarySchoolRecord = (school: MemberSchool): boolean => {
  const typeLower = (school.type || '').toLowerCase();
  const nameLower = (school.name || '').toLowerCase();
  const desigLower = (school.designation || '').toLowerCase();
  const principalLower = (school.principal || '').toLowerCase();

  // 1. Explicit secondary school indicators take strict precedence.
  // Any institution labeled "Sekolah Menengah", "SMK", "SMKA", "SMA", "SMI", "SMABK", "Maahad Tahfiz",
  // or designated under Pengetua leadership is a Secondary School.
  // "SEKOLAH MENENGAH SRI AL-AMIN BANGI" contains "sri", but its level is unmistakably secondary.
  if (
    typeLower === 'sekolah menengah' ||
    typeLower.includes('menengah') ||
    typeLower.includes('smka') ||
    typeLower.includes('sabk') ||
    typeLower.includes('tahfiz') ||
    nameLower.includes('sekolah menengah') ||
    nameLower.includes('menengah') ||
    /\bsmk\b|\bsmka\b|\bsma\b|\bsmi\b|\bsmabk\b|\bmaahad\b/i.test(nameLower)
  ) {
    return false;
  }

  // 2. Explicit primary school indicators
  if (
    typeLower === 'sekolah rendah' ||
    typeLower.includes('rendah') ||
    nameLower.includes('sekolah rendah') ||
    nameLower.includes('rendah') ||
    /\bsriti\b|\bsra\b|\bsrai\b|\bsr\b/i.test(nameLower) ||
    (/\bsri\b/i.test(nameLower) && !nameLower.includes('menengah'))
  ) {
    return true;
  }

  // 3. Designation check: Pengetua is secondary, Guru Besar is primary
  if (desigLower.includes('pengetua') || principalLower.includes('pengetua')) {
    return false;
  }
  if (desigLower.includes('guru besar') || principalLower.includes('guru besar')) {
    return true;
  }

  return false;
};

export const isGuruBesarRecord = (school: MemberSchool): boolean => {
  const desigLower = (school.designation || '').toLowerCase();
  const principalLower = (school.principal || '').toLowerCase();

  if (desigLower.includes('guru besar') || principalLower.includes('guru besar')) {
    return true;
  }
  if (desigLower.includes('pengetua') || principalLower.includes('pengetua')) {
    return false;
  }
  return isPrimarySchoolRecord(school);
};

export const SchoolNetworkSection: React.FC<SchoolNetworkProps> = ({
  schools,
}) => {
  const { isAdmin, setIsCMSOpen, siteData } = useAdminContent();

  // Track live update timestamp whenever schools or applications change
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() =>
    new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    setLastSyncedAt(
      new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  }, [schools, siteData.memberSchools, siteData.memberApplications]);

  useEffect(() => {
    const onLiveUpdate = () => {
      setLastSyncedAt(
        new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    window.addEventListener('mpgbsim_school_updated', onLiveUpdate);
    window.addEventListener('mpgbsim_content_updated', onLiveUpdate);
    window.addEventListener('storage', onLiveUpdate);
    return () => {
      window.removeEventListener('mpgbsim_school_updated', onLiveUpdate);
      window.removeEventListener('mpgbsim_content_updated', onLiveUpdate);
      window.removeEventListener('storage', onLiveUpdate);
    };
  }, []);

  // Merge registered schools with any approved applications & enrich designation from applications
  const effectiveSchools = useMemo(() => {
    const baseList = schools && schools.length > 0 ? schools : siteData.memberSchools || [];
    const approvedApps = (siteData.memberApplications || []).filter((a) => a.status === 'approved');

    const enriched = baseList.map((sch) => {
      if (sch.designation) return sch;
      const matchedApp = approvedApps.find(
        (a) =>
          (a.schoolCode && sch.code && a.schoolCode.toLowerCase() === sch.code.toLowerCase()) ||
          (a.schoolName && sch.name && a.schoolName.toLowerCase() === sch.name.toLowerCase())
      );
      if (matchedApp?.designation) {
        return { ...sch, designation: matchedApp.designation };
      }
      return sch;
    });

    // Include any approved application not yet present in baseList
    approvedApps.forEach((app) => {
      const exists = enriched.some(
        (s) =>
          (app.schoolCode && s.code && app.schoolCode.toLowerCase() === s.code.toLowerCase()) ||
          (app.schoolName && s.name && app.schoolName.toLowerCase() === s.name.toLowerCase())
      );
      if (!exists && app.schoolName) {
        enriched.push({
          id: `app-sch-${app.id}`,
          name: app.schoolName,
          code: app.schoolCode || '-',
          type: app.schoolType || 'Sekolah Menengah',
          state: app.state || 'Selangor',
          district: app.district || '',
          principal: app.fullName || 'PGB Berdaftar',
          designation: app.designation,
          principalPhotoUrl: app.pgbPhotoUrl || '',
          studentCount: Number(app.studentCount) || 0,
          teacherCount: Number(app.teacherCount) || 0,
          joinYear: Number(app.joinYear || app.schoolJoinYear) || new Date().getFullYear(),
          logoUrl: app.logoUrl || '',
          schoolPhotoUrl: app.schoolPhotoUrl || '',
          website: app.website || '',
          address: app.address || '',
          phone: app.schoolPhone || app.phoneNumber || '',
          email: app.schoolEmail || app.email || '',
        });
      }
    });

    return enriched;
  }, [schools, siteData.memberSchools, siteData.memberApplications]);

  // Compute the 5 real-time Live Metrics from effectiveSchools
  const liveMetrics = useMemo(() => {
    let principalsCount = 0;
    let headteachersCount = 0;
    let primaryStudentsCount = 0;
    let secondaryStudentsCount = 0;
    let primarySchoolsCount = 0;
    let secondarySchoolsCount = 0;
    let totalTeachersCount = 0;
    const statesSet = new Set<string>();

    effectiveSchools.forEach((sch) => {
      const primary = isPrimarySchoolRecord(sch);
      const guruBesar = isGuruBesarRecord(sch);
      const students = Math.max(0, Number(sch.studentCount) || 0);
      const teachers = Math.max(0, Number(sch.teacherCount) || 0);

      if (guruBesar) {
        headteachersCount += 1;
      } else {
        principalsCount += 1;
      }

      if (primary) {
        primarySchoolsCount += 1;
        primaryStudentsCount += students;
      } else {
        secondarySchoolsCount += 1;
        secondaryStudentsCount += students;
      }

      totalTeachersCount += teachers;
      if (sch.state && sch.state.trim()) {
        statesSet.add(sch.state.trim());
      }
    });

    const pendingAppsCount = (siteData.memberApplications || []).filter(
      (a) => a.status === 'pending'
    ).length;

    let ordinarySchoolsCount = 0;
    let associateSchoolsCount = 0;
    effectiveSchools.forEach((sch) => {
      if (resolveSchoolMembershipType(sch) === 'Ahli Bersekutu') {
        associateSchoolsCount += 1;
      } else {
        ordinarySchoolsCount += 1;
      }
    });

    return {
      totalSchools: effectiveSchools.length,
      ordinarySchoolsCount,
      associateSchoolsCount,
      principalsCount,
      headteachersCount,
      primaryStudentsCount,
      secondaryStudentsCount,
      primarySchoolsCount,
      secondarySchoolsCount,
      totalStudentsCount: primaryStudentsCount + secondaryStudentsCount,
      totalTeachersCount,
      statesCovered: statesSet.size,
      pendingAppsCount,
    };
  }, [effectiveSchools, siteData.memberApplications]);

  // School profile modal state
  const [selectedSchool, setSelectedSchool] = useState<MemberSchool | null>(null);

  // Derive live school record so modal immediately reflects CMS profile updates
  const activeSchool = selectedSchool
    ? effectiveSchools.find(
        (s) =>
          s.id === selectedSchool.id ||
          (selectedSchool.code && s.code && s.code.toLowerCase() === selectedSchool.code.toLowerCase())
      ) || selectedSchool
    : null;

  // Directory Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('Semua Negeri');
  const [selectedType, setSelectedType] = useState('Semua Jenis Sekolah');
  const [selectedMembershipType, setSelectedMembershipType] = useState<'Semua Keahlian' | 'Ahli Biasa' | 'Ahli Bersekutu'>('Semua Keahlian');
  const [liveCardFilter, setLiveCardFilter] = useState<LiveCardFilter>('ALL');

  // Filter schools
  const normalizeCategory = (school: MemberSchool) => {
    const isPrimary = isPrimarySchoolRecord(school);
    const t = (school.type || '').trim();
    if (t === 'Maahad Tahfiz' || t.toLowerCase().includes('tahfiz')) return 'Maahad Tahfiz';
    if (t === 'Rakan Musleh' || t.toLowerCase().includes('musleh')) return 'Rakan Musleh';
    return isPrimary ? 'Sekolah Rendah' : 'Sekolah Menengah';
  };

  const filteredSchools = effectiveSchools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = selectedState === 'Semua Negeri' || school.state === selectedState;
    const matchesType = selectedType === 'Semua Jenis Sekolah' || normalizeCategory(school) === selectedType;
    const memType = resolveSchoolMembershipType(school);
    const matchesMembership =
      selectedMembershipType === 'Semua Keahlian' || memType === selectedMembershipType;

    let matchesLiveCard = true;
    if (liveCardFilter === 'PENGETUA') {
      matchesLiveCard = !isGuruBesarRecord(school);
    } else if (liveCardFilter === 'GURU_BESAR') {
      matchesLiveCard = isGuruBesarRecord(school);
    } else if (liveCardFilter === 'MURID_RENDAH') {
      matchesLiveCard = isPrimarySchoolRecord(school);
    } else if (liveCardFilter === 'PELAJAR_MENENGAH') {
      matchesLiveCard = !isPrimarySchoolRecord(school);
    }

    return matchesSearch && matchesState && matchesType && matchesMembership && matchesLiveCard;
  });

  const handleSelectLiveCard = (filter: LiveCardFilter) => {
    setLiveCardFilter((prev) => (prev === filter ? 'ALL' : filter));
  };

  return (
    <section id="sekolah-ahli" className="py-20 bg-slate-100/70 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
            <School className="w-4 h-4 text-teal-700" />
            <span>Rangkaian Pendidikan Islam Kebangsaan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Rangkaian Sekolah-Sekolah Ahli MPGBSIM
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Jaringan kolaborasi kepimpinan merangkumi SRI, SMI, Maahad Tahfiz & Rakan Musleh di bawah Musleh Integrated Education Berhad (MIEB) di seluruh tanah air.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Live Updates Status Bar */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <Radio className="w-3.5 h-3.5 text-emerald-700" />
              <span>PAPARAN DATA LANGSUNG (LIVE UPDATES)</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-600">
              Dikemas kini secara masa nyata mengikut pendaftaran sekolah & kemas kini profil ahli
            </span>
            <span aria-hidden="true" className="text-slate-300 hidden md:inline">·</span>
            <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
              Segerak Terakhir: {lastSyncedAt}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {liveCardFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setLiveCardFilter('ALL')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Papar Semua ({liveMetrics.totalSchools})</span>
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsCMSOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Urus Sekolah di CMS</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Live Updates Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {/* Card 1: Jumlah Sekolah yang Berdaftar */}
          <button
            type="button"
            onClick={() => handleSelectLiveCard('ALL')}
            className={`text-left p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
              liveCardFilter === 'ALL'
                ? 'border-teal-600 ring-2 ring-teal-600/15 shadow-md'
                : 'border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Live</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {liveMetrics.totalSchools.toLocaleString('ms-MY')}
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                Jumlah Sekolah Berdaftar
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              {liveMetrics.ordinarySchoolsCount} Ahli Biasa · {liveMetrics.associateSchoolsCount} Ahli Bersekutu
            </p>
          </button>

          {/* Card 2: Jumlah Pengetua */}
          <button
            type="button"
            onClick={() => handleSelectLiveCard('PENGETUA')}
            className={`text-left p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
              liveCardFilter === 'PENGETUA'
                ? 'border-teal-600 ring-2 ring-teal-600/15 shadow-md'
                : 'border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Live</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {liveMetrics.principalsCount.toLocaleString('ms-MY')}
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                Jumlah Pengetua
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              Peneraju Sekolah Menengah Islam & Maahad Tahfiz
            </p>
          </button>

          {/* Card 3: Jumlah Guru Besar */}
          <button
            type="button"
            onClick={() => handleSelectLiveCard('GURU_BESAR')}
            className={`text-left p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
              liveCardFilter === 'GURU_BESAR'
                ? 'border-teal-600 ring-2 ring-teal-600/15 shadow-md'
                : 'border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Live</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {liveMetrics.headteachersCount.toLocaleString('ms-MY')}
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                Jumlah Guru Besar
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              Peneraju Sekolah Rendah Islam (SRI & Rakan Musleh)
            </p>
          </button>

          {/* Card 4: Jumlah Murid Sekolah Rendah */}
          <button
            type="button"
            onClick={() => handleSelectLiveCard('MURID_RENDAH')}
            className={`text-left p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
              liveCardFilter === 'MURID_RENDAH'
                ? 'border-teal-600 ring-2 ring-teal-600/15 shadow-md'
                : 'border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Live</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {liveMetrics.primaryStudentsCount.toLocaleString('ms-MY')}
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                Jumlah Murid Sekolah Rendah
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              Enrolmen aktif di {liveMetrics.primarySchoolsCount} buah sekolah rendah ahli
            </p>
          </button>

          {/* Card 5: Jumlah Pelajar Sekolah Menengah */}
          <button
            type="button"
            onClick={() => handleSelectLiveCard('PELAJAR_MENENGAH')}
            className={`text-left p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
              liveCardFilter === 'PELAJAR_MENENGAH'
                ? 'border-teal-600 ring-2 ring-teal-600/15 shadow-md'
                : 'border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Live</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {liveMetrics.secondaryStudentsCount.toLocaleString('ms-MY')}
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                Jumlah Pelajar Sekolah Menengah
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              Enrolmen aktif di {liveMetrics.secondarySchoolsCount} buah sekolah menengah ahli
            </p>
          </button>
        </div>

        {/* Summary Strip: Combined Enrolment & Coverage */}
        <div className="mb-10 px-5 py-3.5 rounded-xl bg-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
            <span className="font-bold text-amber-300">Ringkasan Keseluruhan Rangkaian:</span>
            <span>
              Jumlah Enrolmen Keseluruhan:{' '}
              <strong className="font-mono tabular-nums text-white">
                {liveMetrics.totalStudentsCount.toLocaleString('ms-MY')}
              </strong>{' '}
              murid & pelajar
            </span>
            <span aria-hidden="true" className="text-teal-600">·</span>
            <span>
              Tenaga Pengajar:{' '}
              <strong className="font-mono tabular-nums text-white">
                {liveMetrics.totalTeachersCount.toLocaleString('ms-MY')}
              </strong>{' '}
              guru
            </span>
            <span aria-hidden="true" className="text-teal-600">·</span>
            <span>
              Liputan:{' '}
              <strong className="font-mono tabular-nums text-white">
                {liveMetrics.statesCovered}
              </strong>{' '}
              negeri
            </span>
          </div>
          <div className="text-[11px] text-teal-200/90 shrink-0">
            Klik mana-mana kad statistik di atas untuk menapis senarai sekolah di bawah
          </div>
        </div>

        {/* Visualisasi Data Taburan Sekolah & Enrolmen (Recharts) */}
        <SchoolNetworkCharts schools={effectiveSchools} />

        {/* Member Schools Sample Directory & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                <span>Direktori Rangkaian Sekolah Ahli</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Institusi pendidikan Islam berdaftar di bawah naungan MPGBSIM mengikut negeri dan kategori.
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Menunjukkan <strong className="text-slate-900 font-mono tabular-nums">{filteredSchools.length}</strong> daripada{' '}
              <strong className="text-slate-900 font-mono tabular-nums">{effectiveSchools.length}</strong> sekolah ahli berdaftar
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama sekolah, kod, atau PGB..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
              >
                {MALAYSIA_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
              >
                {SCHOOL_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedMembershipType}
                onChange={(e) => setSelectedMembershipType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50 font-semibold text-slate-800"
              >
                <option value="Semua Keahlian">Semua Kategori Keahlian ({effectiveSchools.length})</option>
                <option value="Ahli Biasa">Ahli Biasa — Fasal 4(2) ({liveMetrics.ordinarySchoolsCount})</option>
                <option value="Ahli Bersekutu">Ahli Bersekutu — Fasal 4(3) ({liveMetrics.associateSchoolsCount})</option>
              </select>
            </div>
          </div>

          {/* Quick Membership Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs font-bold text-slate-600 mr-1">Kategori Keahlian:</span>
            <button
              type="button"
              onClick={() => setSelectedMembershipType('Semua Keahlian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedMembershipType === 'Semua Keahlian'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Sekolah ({effectiveSchools.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedMembershipType('Ahli Biasa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedMembershipType === 'Ahli Biasa'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ahli Biasa ({liveMetrics.ordinarySchoolsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMembershipType('Ahli Bersekutu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedMembershipType === 'Ahli Bersekutu'
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Ahli Bersekutu ({liveMetrics.associateSchoolsCount})</span>
            </button>
          </div>

          {/* Interactive Hint */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 bg-teal-50/80 rounded-xl border border-teal-200/80 text-teal-950 text-xs mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
              </span>
              <span className="font-semibold">
                Klik pada mana-mana sekolah untuk melihat profil lengkap, maklumat institusi dan kepimpinan.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-800 font-medium shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Privasi PGB dilindungi (No. telefon peribadi tidak dipaparkan)</span>
            </div>
          </div>

          {/* School Directory Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Sekolah</th>
                  <th className="py-3 px-4">Kod</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Negeri / Daerah</th>
                  <th className="py-3 px-4">Pengetua / Guru Besar</th>
                  <th className="py-3 px-4 text-right">Enrolmen</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((sch) => {
                    const isPrimary = isPrimarySchoolRecord(sch);
                    const isGB = isGuruBesarRecord(sch);
                    return (
                      <tr
                        key={sch.id}
                        onClick={() => setSelectedSchool(sch)}
                        className="hover:bg-teal-50/60 transition-colors cursor-pointer group"
                        title="Klik untuk lihat profil penuh sekolah"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-teal-900">
                          <div className="flex items-center gap-2">
                            {sch.logoUrl && (
                              <img
                                src={sch.logoUrl}
                                alt=""
                                className="w-6 h-6 rounded-md object-contain shrink-0 border border-slate-200 p-0.5 bg-white"
                              />
                            )}
                            <span>{sch.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-teal-800 font-bold">
                          {sch.code}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800 block">
                            {isPrimary ? 'Sekolah Rendah' : 'Sekolah Menengah'}
                          </span>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                                resolveSchoolMembershipType(sch) === 'Ahli Bersekutu'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {resolveSchoolMembershipType(sch)}
                            </span>
                            {sch.type &&
                              sch.type.toLowerCase().trim() !== (isPrimary ? 'sekolah rendah' : 'sekolah menengah') && (
                                <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                                  {sch.type}
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {sch.district ? `${sch.district}, ${sch.state}` : sch.state}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          <div className="flex items-center gap-2.5">
                            {sch.principalPhotoUrl ? (
                              <img
                                src={sch.principalPhotoUrl}
                                alt={sch.principal}
                                className="w-8 h-8 rounded-full object-cover border-2 border-teal-700 shrink-0 shadow-xs"
                                onError={(e) => {
                                  (e.target as any).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0 font-bold">
                                {sch.principal ? sch.principal.charAt(0) : 'P'}
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-slate-900 group-hover:text-teal-900 block">
                                {sch.principal}
                              </span>
                              <span className="text-[11px] text-teal-700 font-medium">
                                {isGB ? 'Guru Besar' : 'Pengetua'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          <span className="font-bold text-slate-900">
                            {(Number(sch.studentCount) || 0).toLocaleString('ms-MY')}
                          </span>
                          <span className="block text-[10px] font-sans text-slate-500">
                            {isPrimary ? 'Murid Rendah' : 'Pelajar Menengah'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSchool(sch);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs transition-transform cursor-pointer shadow-2xs group-hover:scale-105"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Profil</span>
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsCMSOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition cursor-pointer"
                                title="Buka Pusat Kawalan CMS untuk menyunting profil sekolah ini"
                              >
                                <Edit3 className="w-3 h-3 text-amber-800" />
                                <span className="hidden sm:inline">CMS</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      Tiada sekolah sepadan dengan carian ini. Sila ubah penapis anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* School Full Profile Modal */}
      {selectedSchool && activeSchool && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedSchool(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedSchool(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
              title="Tutup Paparan"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Banner */}
            <div className="relative p-6 sm:p-7 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-inner">
                  {activeSchool.logoUrl ? (
                    <img
                      src={activeSchool.logoUrl}
                      alt={activeSchool.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <School className="w-10 h-10 text-amber-300" />
                  )}
                </div>

                <div className="min-w-0 pr-8">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                        resolveSchoolMembershipType(activeSchool) === 'Ahli Bersekutu'
                          ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-200'
                          : 'bg-emerald-500/30 border-emerald-400/50 text-emerald-200'
                      }`}
                    >
                      {resolveSchoolMembershipType(activeSchool)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold">
                      {activeSchool.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-mono font-bold">
                      Kod: {activeSchool.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-xs">
                      {activeSchool.state}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {activeSchool.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-200/90 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>{activeSchool.district}, {activeSchool.state}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 sm:p-7 space-y-5 max-h-[calc(85vh-160px)] overflow-y-auto">
              {/* 1. PGB Leadership Spotlight (Kecuali No. Telefon PGB) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-slate-50 border border-teal-200">
                <div className="text-[11px] font-bold text-teal-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span>Kepimpinan Institusi</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* PGB Corporate Photo */}
                  <div className="shrink-0 flex flex-col items-center">
                    {activeSchool.principalPhotoUrl ? (
                      <img
                        src={activeSchool.principalPhotoUrl}
                        alt={activeSchool.principal}
                        className="w-24 h-32 object-cover rounded-xl border-2 border-teal-700 shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-32 rounded-xl bg-slate-200 border-2 border-slate-300 flex flex-col items-center justify-center text-slate-400">
                        <Users className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-[10px]">Tiada Foto</span>
                      </div>
                    )}
                    <span className="mt-1.5 px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-bold">
                      Foto Korporat PGB
                    </span>
                  </div>

                  {/* PGB Details */}
                  <div className="flex-1 text-center sm:text-left space-y-2.5">
                    <div>
                      <span className="text-xs text-slate-500 block">Nama Pengetua / Guru Besar:</span>
                      <h4 className="text-lg font-bold text-slate-900 leading-snug">
                        {activeSchool.principal}
                      </h4>
                      <p className="text-xs font-semibold text-teal-800 mt-0.5">
                        {isGuruBesarRecord(activeSchool) ? 'Guru Besar' : 'Pengetua'} Berdaftar MPGBSIM
                      </p>
                    </div>

                    {/* Strict Privacy Protection Notice (Kecuali No. Telefon PGB) */}
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-left space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Dasar Privasi & Keselamatan Kepimpinan PGB</span>
                      </div>
                      <p className="text-[11px] text-amber-800/90 leading-relaxed">
                        Nombor telefon peribadi Pengetua / Guru Besar <strong>tidak dipaparkan</strong> bagi melindungi privasi dan integriti keselamatan kepimpinan sekolah selaras dengan dasar tadbir urus MPGBSIM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Key Institutional Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center text-teal-700 mb-1">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {activeSchool.studentCount ? `${activeSchool.studentCount}+` : '-'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isPrimarySchoolRecord(activeSchool) ? 'Bilangan Murid' : 'Bilangan Pelajar'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center text-teal-700 mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {activeSchool.teacherCount ? `${activeSchool.teacherCount}` : '25+'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Tenaga Pengajar</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center text-teal-700 mb-1">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {activeSchool.joinYear || '2020'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Tahun Ahli MPGBSIM</span>
                </div>
              </div>

              {/* Foto Institusi Sekolah jika ada */}
              {activeSchool.schoolPhotoUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative group">
                  <img
                    src={activeSchool.schoolPhotoUrl}
                    alt={`Foto Institusi ${activeSchool.name}`}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-101 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider mb-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Premis & Institusi Rasmi Sekolah</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white/95">
                        {activeSchool.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Latar Belakang & Penerangan Institusi */}
              {activeSchool.description && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    <span>Profil & Latar Belakang Institusi</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeSchool.description}
                  </p>
                </div>
              )}

              {/* 4. Maklumat Perhubungan Rasmi Institusi (Bukan Peribadi PGB) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Maklumat Perhubungan Rasmi Sekolah
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeSchool.address && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">Alamat Surat-Menyurat:</span>
                        <span className="text-slate-800 font-medium">{activeSchool.address}</span>
                      </div>
                    </div>
                  )}

                  {activeSchool.email && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">Emel Rasmi Pejabat:</span>
                        <a
                          href={`mailto:${activeSchool.email}`}
                          className="text-teal-700 hover:underline font-semibold break-all"
                        >
                          {activeSchool.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {activeSchool.phone && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">Talian Pejabat Am Sekolah:</span>
                        <a
                          href={`tel:${activeSchool.phone}`}
                          className="text-teal-700 hover:underline font-semibold"
                        >
                          {activeSchool.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {activeSchool.website && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <Globe className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">Portal / Laman Web Rasmi:</span>
                        <a
                          href={activeSchool.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 hover:underline font-semibold inline-flex items-center gap-1 break-all"
                        >
                          <span>{activeSchool.website}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Ahli Institusi Berdaftar MPGBSIM</span>
              </span>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSchool(null);
                      setIsCMSOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Buka CMS untuk mengemaskini maklumat profil sekolah ini"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting di CMS</span>
                  </button>
                )}
                {activeSchool.website && (
                  <a
                    href={activeSchool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Laman Web Sekolah</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedSchool(null)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
