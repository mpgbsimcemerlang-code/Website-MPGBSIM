import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Building2,
  TrendingUp,
  MapPin,
  GraduationCap,
  Award,
  Layers,
  Sparkles,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { MemberSchool } from '../types';
import { isPrimarySchoolRecord } from './SchoolNetwork';

interface SchoolNetworkChartsProps {
  schools: MemberSchool[];
}

export const resolveSchoolMembershipType = (
  sch: Partial<MemberSchool> | null | undefined
): 'Ahli Biasa' | 'Ahli Bersekutu' => {
  if (!sch) return 'Ahli Biasa';
  if (sch.membershipType === 'Ahli Bersekutu' || sch.membershipType === 'Ahli Biasa') {
    return sch.membershipType;
  }
  const t = (sch.type || '').toLowerCase();
  const n = (sch.name || '').toLowerCase();
  if (t.includes('rakan musleh') || t.includes('bersekutu') || n.includes('rakan musleh')) {
    return 'Ahli Bersekutu';
  }
  return 'Ahli Biasa';
};

type ChartViewType = 'membership_distribution' | 'state_schools' | 'state_students' | 'composition';

const COLORS = {
  primary: '#0d9488', // Teal 600 - Sekolah Rendah
  primaryLight: '#2dd4bf', // Teal 400
  secondary: '#4f46e5', // Indigo 600 - Sekolah Menengah
  secondaryLight: '#818cf8', // Indigo 400
  amber: '#f59e0b', // Amber 500 - Ahli Bersekutu
  amberDark: '#d97706', // Amber 600
  sky: '#0284c7', // Sky 600
  emerald: '#10b981', // Emerald 500 - Ahli Biasa
  rose: '#f43f5e', // Rose 500
};

export const SchoolNetworkCharts: React.FC<SchoolNetworkChartsProps> = ({ schools }) => {
  const [activeView, setActiveView] = useState<ChartViewType>('membership_distribution');
  const [chartLayout, setChartLayout] = useState<'grouped' | 'stacked'>('stacked');
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for smooth fade-in as user scrolls down
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleReplayAnimation = () => {
    setIsVisible(false);
    setTimeout(() => {
      setAnimationKey((prev) => prev + 1);
      setIsVisible(true);
    }, 120);
  };

  // Process data by State
  const stateData = useMemo(() => {
    const map = new Map<
      string,
      {
        state: string;
        primarySchools: number;
        secondarySchools: number;
        ordinarySchools: number; // Ahli Biasa
        associateSchools: number; // Ahli Bersekutu
        totalSchools: number;
        primaryStudents: number;
        secondaryStudents: number;
        ordinaryStudents: number;
        associateStudents: number;
        totalStudents: number;
        teachers: number;
      }
    >();

    schools.forEach((sch) => {
      const stateName = (sch.state || 'Lain-lain').trim();
      const isPrimary = isPrimarySchoolRecord(sch);
      const memType = resolveSchoolMembershipType(sch);
      const isAssociate = memType === 'Ahli Bersekutu';
      const students = Math.max(0, Number(sch.studentCount) || 0);
      const teachers = Math.max(0, Number(sch.teacherCount) || 0);

      if (!map.has(stateName)) {
        map.set(stateName, {
          state: stateName,
          primarySchools: 0,
          secondarySchools: 0,
          ordinarySchools: 0,
          associateSchools: 0,
          totalSchools: 0,
          primaryStudents: 0,
          secondaryStudents: 0,
          ordinaryStudents: 0,
          associateStudents: 0,
          totalStudents: 0,
          teachers: 0,
        });
      }

      const entry = map.get(stateName)!;
      if (isPrimary) {
        entry.primarySchools += 1;
        entry.primaryStudents += students;
      } else {
        entry.secondarySchools += 1;
        entry.secondaryStudents += students;
      }

      if (isAssociate) {
        entry.associateSchools += 1;
        entry.associateStudents += students;
      } else {
        entry.ordinarySchools += 1;
        entry.ordinaryStudents += students;
      }

      entry.totalSchools += 1;
      entry.totalStudents += students;
      entry.teachers += teachers;
    });

    // Sort by total schools descending, then by students
    return Array.from(map.values()).sort((a, b) => {
      if (b.totalSchools !== a.totalSchools) {
        return b.totalSchools - a.totalSchools;
      }
      return b.totalStudents - a.totalStudents;
    });
  }, [schools]);

  // Overall totals and breakdown for Pie Charts
  const overallStats = useMemo(() => {
    let primarySchools = 0;
    let secondarySchools = 0;
    let ordinarySchools = 0;
    let associateSchools = 0;
    let ordinaryPrimary = 0;
    let ordinarySecondary = 0;
    let associatePrimary = 0;
    let associateSecondary = 0;
    let primaryStudents = 0;
    let secondaryStudents = 0;
    let ordinaryStudents = 0;
    let associateStudents = 0;
    let totalTeachers = 0;

    schools.forEach((sch) => {
      const isPrimary = isPrimarySchoolRecord(sch);
      const memType = resolveSchoolMembershipType(sch);
      const isAssociate = memType === 'Ahli Bersekutu';
      const students = Math.max(0, Number(sch.studentCount) || 0);
      const teachers = Math.max(0, Number(sch.teacherCount) || 0);

      if (isPrimary) {
        primarySchools += 1;
        primaryStudents += students;
        if (isAssociate) associatePrimary += 1;
        else ordinaryPrimary += 1;
      } else {
        secondarySchools += 1;
        secondaryStudents += students;
        if (isAssociate) associateSecondary += 1;
        else ordinarySecondary += 1;
      }

      if (isAssociate) {
        associateSchools += 1;
        associateStudents += students;
      } else {
        ordinarySchools += 1;
        ordinaryStudents += students;
      }

      totalTeachers += teachers;
    });

    const totalSchools = primarySchools + secondarySchools;
    const totalStudents = primaryStudents + secondaryStudents;

    // Top state by schools & students
    const topStateBySchools = stateData.length > 0 ? stateData[0] : null;
    const topStateByStudents =
      stateData.length > 0
        ? [...stateData].sort((a, b) => b.totalStudents - a.totalStudents)[0]
        : null;

    const avgEnrollmentPerSchool =
      totalSchools > 0 ? Math.round(totalStudents / totalSchools) : 0;

    const ordinaryPercentage =
      totalSchools > 0 ? Math.round((ordinarySchools / totalSchools) * 100) : 0;
    const associatePercentage =
      totalSchools > 0 ? Math.round((associateSchools / totalSchools) * 100) : 0;

    // Membership category composition for pie
    const membershipPie = [
      {
        name: 'Ahli Biasa',
        value: ordinarySchools,
        percentage: ordinaryPercentage,
      },
      {
        name: 'Ahli Bersekutu',
        value: associateSchools,
        percentage: associatePercentage,
      },
    ];

    // School level composition for pie
    const schoolLevelPie = [
      {
        name: 'Sekolah Rendah',
        value: primarySchools,
        percentage: totalSchools > 0 ? Math.round((primarySchools / totalSchools) * 100) : 0,
      },
      {
        name: 'Sekolah Menengah',
        value: secondarySchools,
        percentage: totalSchools > 0 ? Math.round((secondarySchools / totalSchools) * 100) : 0,
      },
    ];

    // Student enrollment composition for pie
    const studentEnrollmentPie = [
      {
        name: 'Murid Rendah',
        value: primaryStudents,
        percentage: totalStudents > 0 ? Math.round((primaryStudents / totalStudents) * 100) : 0,
      },
      {
        name: 'Pelajar Menengah',
        value: secondaryStudents,
        percentage: totalStudents > 0 ? Math.round((secondaryStudents / totalStudents) * 100) : 0,
      },
    ];

    return {
      primarySchools,
      secondarySchools,
      ordinarySchools,
      associateSchools,
      ordinaryPrimary,
      ordinarySecondary,
      associatePrimary,
      associateSecondary,
      ordinaryPercentage,
      associatePercentage,
      totalSchools,
      primaryStudents,
      secondaryStudents,
      ordinaryStudents,
      associateStudents,
      totalStudents,
      totalTeachers,
      avgEnrollmentPerSchool,
      topStateBySchools,
      topStateByStudents,
      membershipPie,
      schoolLevelPie,
      studentEnrollmentPie,
    };
  }, [schools, stateData]);

  // Custom Tooltip component for Recharts
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs text-white min-w-[230px]">
          <div className="font-bold text-sm text-amber-300 border-b border-slate-700 pb-1.5 mb-2 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {data.totalSchools} Sekolah
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                Ahli Biasa (Fasal 4(2)):
              </span>
              <span className="font-mono font-bold">{data.ordinarySchools} buah</span>
            </div>

            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                Ahli Bersekutu (Fasal 4(3)):
              </span>
              <span className="font-mono font-bold">{data.associateSchools} buah</span>
            </div>

            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-teal-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
                Sekolah Rendah:
              </span>
              <span className="font-mono font-bold">{data.primarySchools} buah</span>
            </div>

            <div className="flex items-center justify-between text-indigo-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                Sekolah Menengah:
              </span>
              <span className="font-mono font-bold">{data.secondarySchools} buah</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
              <span>Murid Rendah:</span>
              <span className="font-mono font-bold text-teal-400">
                {data.primaryStudents.toLocaleString('ms-MY')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Pelajar Menengah:</span>
              <span className="font-mono font-bold text-indigo-400">
                {data.secondaryStudents.toLocaleString('ms-MY')}
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-bold text-amber-300">
              <span>Jumlah Enrolmen:</span>
              <span className="font-mono">
                {data.totalStudents.toLocaleString('ms-MY')} orang
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-2.5 shadow-xl text-xs text-white">
          <p className="font-bold text-amber-300">{data.name}</p>
          <p className="font-mono text-sm font-extrabold mt-0.5">
            {data.value.toLocaleString('ms-MY')}
            {data.payload.percentage !== undefined ? ` (${data.payload.percentage}%)` : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      ref={containerRef}
      className={`mb-10 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 overflow-hidden transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.99]'
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Visualisasi Data Rasmi MPGBSIM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Analisis Taburan Sekolah (Ahli Biasa & Ahli Bersekutu)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualisasi dinamik taburan institusi <strong className="text-emerald-700">Ahli Biasa (Fasal 4(2))</strong> &{' '}
            <strong className="text-indigo-700">Ahli Bersekutu (Fasal 4(3))</strong> serta bilangan murid mengikut negeri di seluruh Malaysia.
          </p>
        </div>

        {/* View Switcher Tabs & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
            <button
              type="button"
              onClick={() => setActiveView('membership_distribution')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'membership_distribution'
                  ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ahli Biasa vs Bersekutu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('state_schools')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'state_schools'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Tahap Sekolah / Negeri</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('state_students')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'state_students'
                  ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enrolmen / Negeri</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('composition')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'composition'
                  ? 'bg-white text-amber-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Pecahan Komposisi</span>
            </button>
          </div>

          {/* Toggle Stacked vs Grouped for bar views */}
          {activeView !== 'composition' && (
            <button
              type="button"
              onClick={() => setChartLayout(chartLayout === 'stacked' ? 'grouped' : 'stacked')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Tukar mod carta bertindan / bersebelahan"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Mod:</span>
              <span className="font-bold text-teal-700">
                {chartLayout === 'stacked' ? 'Bertindan' : 'Bersebelahan'}
              </span>
            </button>
          )}

          {/* Replay Animation Button */}
          <button
            type="button"
            onClick={handleReplayAnimation}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-teal-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            title="Mainkan semula animasi carta"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Animasi</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Eksekutif Analisis Taburan Sekolah: Ahli Biasa vs Ahli Bersekutu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black uppercase tracking-wider mb-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                Kategori 1 • Fasal 4(2) Perlembagaan
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Sekolah Ahli Biasa MPGBSIM
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Institusi pendidikan Islam rangkaian penuh IKRAM MUSLEH (Sekolah Rendah, Menengah & Maahad Tahfiz)
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono leading-none">
                {overallStats.ordinarySchools}
              </div>
              <span className="text-[11px] font-bold text-emerald-800">
                {overallStats.ordinaryPercentage}% daripada {overallStats.totalSchools} sekolah
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200/60 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block">Sekolah Rendah</span>
              <span className="font-bold text-slate-900 font-mono">{overallStats.ordinaryPrimary} buah</span>
            </div>
            <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block">Sekolah Menengah</span>
              <span className="font-bold text-slate-900 font-mono">{overallStats.ordinarySecondary} buah</span>
            </div>
            <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block">Jumlah Murid</span>
              <span className="font-bold text-emerald-700 font-mono">
                {overallStats.ordinaryStudents.toLocaleString('ms-MY')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-amber-50/40 to-white border border-indigo-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 text-[10px] font-black uppercase tracking-wider mb-1.5">
                <Award className="w-3 h-3 text-indigo-700" />
                Kategori 2 • Fasal 4(3) Perlembagaan
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Sekolah Ahli Bersekutu MPGBSIM
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Sekolah Rakan Musleh & institusi pendidikan Islam bersekutu dalam jaringan kerjasama strategik MPGBSIM
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono leading-none">
                {overallStats.associateSchools}
              </div>
              <span className="text-[11px] font-bold text-indigo-800">
                {overallStats.associatePercentage}% daripada {overallStats.totalSchools} sekolah
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-200/60 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/80 rounded-xl p-2 border border-indigo-100">
              <span className="text-[10px] text-slate-500 block">Sekolah Rendah</span>
              <span className="font-bold text-slate-900 font-mono">{overallStats.associatePrimary} buah</span>
            </div>
            <div className="bg-white/80 rounded-xl p-2 border border-indigo-100">
              <span className="text-[10px] text-slate-500 block">Sekolah Menengah</span>
              <span className="font-bold text-slate-900 font-mono">{overallStats.associateSecondary} buah</span>
            </div>
            <div className="bg-white/80 rounded-xl p-2 border border-indigo-100">
              <span className="text-[10px] text-slate-500 block">Jumlah Murid</span>
              <span className="font-bold text-indigo-700 font-mono">
                {overallStats.associateStudents.toLocaleString('ms-MY')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Quick Insight Stat Pills with Staggered Fade-in */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-5">
        <div
          className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 transition-all duration-700 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold mb-1">
            <Building2 className="w-4 h-4" />
            <span>Negeri Terbanyak Sekolah</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900">
            {overallStats.topStateBySchools ? overallStats.topStateBySchools.state : '-'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {overallStats.topStateBySchools?.totalSchools || 0} buah sekolah berdaftar
          </p>
        </div>

        <div
          className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 transition-all duration-700 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold mb-1">
            <Users className="w-4 h-4" />
            <span>Negeri Enrolmen Tertinggi</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900">
            {overallStats.topStateByStudents ? overallStats.topStateByStudents.state : '-'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {overallStats.topStateByStudents?.totalStudents.toLocaleString('ms-MY') || 0} orang
            pelajar
          </p>
        </div>

        <div
          className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 transition-all duration-700 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Nisbah Ahli Biasa : Bersekutu</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-mono tabular-nums">
            {overallStats.ordinaryPercentage}% : {overallStats.associatePercentage}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {overallStats.ordinarySchools} Ahli Biasa / {overallStats.associateSchools} Ahli Bersekutu
          </p>
        </div>

        <div
          className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 transition-all duration-700 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold mb-1">
            <Award className="w-4 h-4" />
            <span>Nisbah Enrolmen (R : M)</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
            {overallStats.studentEnrollmentPie[0]?.percentage || 0}% :{' '}
            {overallStats.studentEnrollmentPie[1]?.percentage || 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {overallStats.primaryStudents.toLocaleString('ms-MY')} R /{' '}
            {overallStats.secondaryStudents.toLocaleString('ms-MY')} M
          </p>
        </div>
      </div>

      {/* Main Chart Canvas Area with smooth fade transition */}
      <div
        key={`chart-canvas-${activeView}-${chartLayout}-${animationKey}`}
        className="relative w-full pt-2 transition-opacity duration-500 ease-in-out"
      >
        {/* VIEW 0: Analisis Taburan Sekolah Ahli Biasa vs Ahli Bersekutu Mengikut Negeri */}
        {activeView === 'membership_distribution' && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Analisis Taburan Sekolah Ahli Biasa & Ahli Bersekutu Mengikut Negeri
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  Ahli Biasa ({overallStats.ordinarySchools})
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                  Ahli Bersekutu ({overallStats.associateSchools})
                </span>
              </div>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="state"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                  />
                  <Bar
                    key={`bar-ord-sch-${animationKey}`}
                    dataKey="ordinarySchools"
                    name="Ahli Biasa (Fasal 4(2))"
                    fill={COLORS.emerald}
                    stackId={chartLayout === 'stacked' ? 'membership' : undefined}
                    radius={chartLayout === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                    isAnimationActive={isVisible}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    animationBegin={150}
                  />
                  <Bar
                    key={`bar-assoc-sch-${animationKey}`}
                    dataKey="associateSchools"
                    name="Ahli Bersekutu (Fasal 4(3))"
                    fill={COLORS.amber}
                    stackId={chartLayout === 'stacked' ? 'membership' : undefined}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={isVisible}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    animationBegin={350}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 1: Taburan Bilangan Sekolah Mengikut Negeri */}
        {activeView === 'state_schools' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Bilangan Institusi Ahli Mengikut Negeri (Sekolah Rendah vs Sekolah Menengah)
              </span>
              <span className="text-[11px] text-slate-400">Unit: Buah Sekolah</span>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="state"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                  />
                  <Bar
                    key={`bar-prim-sch-${animationKey}`}
                    dataKey="primarySchools"
                    name="Sekolah Rendah"
                    fill={COLORS.primary}
                    stackId={chartLayout === 'stacked' ? 'a' : undefined}
                    radius={chartLayout === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                    isAnimationActive={isVisible}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    animationBegin={150}
                  />
                  <Bar
                    key={`bar-sec-sch-${animationKey}`}
                    dataKey="secondarySchools"
                    name="Sekolah Menengah"
                    fill={COLORS.secondary}
                    stackId={chartLayout === 'stacked' ? 'a' : undefined}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={isVisible}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    animationBegin={350}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 2: Taburan Enrolmen Pelajar Mengikut Negeri */}
        {activeView === 'state_students' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                Jumlah Enrolmen Murid & Pelajar Mengikut Negeri
              </span>
              <span className="text-[11px] text-slate-400">Unit: Bilangan Pelajar</span>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="state"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                  />
                  <Bar
                    key={`bar-prim-stu-${animationKey}`}
                    dataKey="primaryStudents"
                    name="Murid Rendah"
                    fill={COLORS.primary}
                    stackId={chartLayout === 'stacked' ? 'a' : undefined}
                    radius={chartLayout === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                    isAnimationActive={isVisible}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    animationBegin={150}
                  />
                  <Bar
                    key={`bar-sec-stu-${animationKey}`}
                    dataKey="secondaryStudents"
                    name="Pelajar Menengah"
                    fill={COLORS.sky}
                    stackId={chartLayout === 'stacked' ? 'a' : undefined}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={isVisible}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    animationBegin={350}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: Pecahan Komposisi Kebangsaan (Donut Charts) */}
        {activeView === 'composition' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center py-2 animate-fadeIn">
            {/* Donut 0: Ahli Biasa vs Ahli Bersekutu */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Taburan Kategori Keahlian (Fasal 4)
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Ahli Biasa vs Ahli Bersekutu:{' '}
                <strong className="text-slate-800">{overallStats.totalSchools}</strong> sekolah
              </p>

              <div className="w-full h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      key={`pie-membership-${animationKey}`}
                      data={overallStats.membershipPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      isAnimationActive={isVisible}
                      animationDuration={1300}
                      animationEasing="ease-out"
                      animationBegin={100}
                    >
                      <Cell fill={COLORS.emerald} />
                      <Cell fill={COLORS.amber} />
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-slate-700 font-medium">Ahli Biasa</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {overallStats.ordinarySchools} ({overallStats.ordinaryPercentage}%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="text-slate-700 font-medium">Ahli Bersekutu</span>
                  <span className="font-bold text-amber-800 font-mono">
                    {overallStats.associateSchools} ({overallStats.associatePercentage}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Donut 1: Institusi Mengikut Tahap */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Pecahan Institusi Sekolah Ahli
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Jumlah Keseluruhan:{' '}
                <strong className="text-slate-800">{overallStats.totalSchools}</strong> buah sekolah
              </p>

              <div className="w-full h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      key={`pie-level-${animationKey}`}
                      data={overallStats.schoolLevelPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      isAnimationActive={isVisible}
                      animationDuration={1300}
                      animationEasing="ease-out"
                      animationBegin={200}
                    >
                      <Cell fill={COLORS.primary} />
                      <Cell fill={COLORS.secondary} />
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
                  <span className="text-slate-700 font-medium">Sekolah Rendah</span>
                  <span className="font-bold text-teal-800 font-mono">
                    {overallStats.primarySchools} ({overallStats.schoolLevelPie[0].percentage}%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                  <span className="text-slate-700 font-medium">Sekolah Menengah</span>
                  <span className="font-bold text-indigo-800 font-mono">
                    {overallStats.secondarySchools} ({overallStats.schoolLevelPie[1].percentage}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Donut 2: Enrolmen Murid Mengikut Tahap */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Pecahan Enrolmen Pelajar Kebangsaan
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Jumlah Keseluruhan:{' '}
                <strong className="text-slate-800 font-mono">
                  {overallStats.totalStudents.toLocaleString('ms-MY')}
                </strong>{' '}
                orang
              </p>

              <div className="w-full h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      key={`pie-student-${animationKey}`}
                      data={overallStats.studentEnrollmentPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      isAnimationActive={isVisible}
                      animationDuration={1300}
                      animationEasing="ease-out"
                      animationBegin={300}
                    >
                      <Cell fill={COLORS.primary} />
                      <Cell fill={COLORS.sky} />
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
                  <span className="text-slate-700 font-medium">Murid Rendah</span>
                  <span className="font-bold text-teal-800 font-mono">
                    {overallStats.primaryStudents.toLocaleString('ms-MY')} (
                    {overallStats.studentEnrollmentPie[0].percentage}%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
                  <span className="text-slate-700 font-medium">Pelajar Menengah</span>
                  <span className="font-bold text-sky-800 font-mono">
                    {overallStats.secondaryStudents.toLocaleString('ms-MY')} (
                    {overallStats.studentEnrollmentPie[1].percentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <span className="flex items-center gap-1.5 text-teal-700 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Data berintegrasi secara automatik dengan pangkalan data sekolah ahli biasa & ahli bersekutu
        </span>
        <span className="font-mono">
          Jumlah Liputan: {stateData.length} Negeri • {overallStats.ordinarySchools} Ahli Biasa • {overallStats.associateSchools} Ahli Bersekutu
        </span>
      </div>
    </div>
  );
};

