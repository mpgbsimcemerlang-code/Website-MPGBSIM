import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { ExamCalendarItem } from '../../types';
import { DigitalLiveClockCard } from './DigitalLiveClockCard';
import { formatMalayDateRange } from '../../utils/examCountdown';

interface BigThreeExamsShowcaseProps {
  exams: ExamCalendarItem[];
  onSelectExam?: (exam: ExamCalendarItem) => void;
  className?: string;
  isPortalView?: boolean;
}

export const BigThreeExamsShowcase: React.FC<BigThreeExamsShowcaseProps> = ({
  exams,
  onSelectExam,
  className = '',
  isPortalView = false,
}) => {
  // Live Malaysian Time Clock
  const [currentMyTime, setCurrentMyTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('ms-MY', {
          timeZone: 'Asia/Kuala_Lumpur',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(now);
        setCurrentMyTime(formatted);
      } catch {
        setCurrentMyTime(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Identify the 3 Big Written Exams from the exam database
  // 1. UPKK Written Exam: 'exam-upkk-2026-bertulis' or title includes 'Bertulis UPKK'
  const upkkWritten: ExamCalendarItem = exams.find(
    (e) =>
      e.id === 'exam-upkk-2026-bertulis' ||
      (e.category?.includes('UPKK') && e.title.toLowerCase().includes('bertulis'))
  ) || {
    id: 'exam-upkk-2026-bertulis',
    title: 'Peperiksaan Bertulis UPKK 2026',
    category: 'UPKK/KAFA',
    academicYear: 2026,
    startDate: '2026-11-02',
    endDate: '2026-11-05',
    description: 'Peperiksaan bertulis berpusat Ujian Penilaian Kelas KAFA (UPKK) Tahun 2026.',
    notes: 'Subjek: Ulum Syar’iyyah, Sirah, Jawi & Khat, Adab (Akhlak Islamiah), dan Bahasa Arab.',
    sourceUrl: 'https://ecentral.my/tarikh-upkk/',
    status: 'published',
    isPublished: true,
  };

  // 2. SPPIM SRI: 'exam-sppim-2026-sri' or category SPPIM
  const sppimExam: ExamCalendarItem = exams.find(
    (e) =>
      e.id === 'exam-sppim-2026-sri' ||
      e.category?.includes('SPPIM') ||
      e.title.toLowerCase().includes('sppim')
  ) || {
    id: 'exam-sppim-2026-sri',
    title: 'Syahadah Pentaksiran Pelajar IKRAM Musleh (SPPIM) bagi Sekolah Rendah Islam (SRI)',
    category: 'SPPIM',
    academicYear: 2026,
    startDate: '2026-09-12',
    endDate: '2026-09-13',
    description: 'Pentaksiran kemuncak sahsiah, hafazan, dan kurikulum Dini bagi murid Tahun 6 Sekolah Rendah Islam (SRI).',
    notes: 'Maklumat yang diberikan menyatakan pentaksiran ini telah berlangsung pada tarikh tersebut.',
    initialStatusNotice: 'Telah berlangsung',
    status: 'published',
    isPublished: true,
  };

  // 3. SPM Written Exam: 'exam-spm-2026-bertulis' or category SPM with bertulis
  const spmWritten: ExamCalendarItem = exams.find(
    (e) =>
      e.id === 'exam-spm-2026-bertulis' ||
      (e.category === 'SPM' && e.title.toLowerCase().includes('bertulis'))
  ) || {
    id: 'exam-spm-2026-bertulis',
    title: 'Peperiksaan Bertulis SPM',
    category: 'SPM',
    academicYear: 2026,
    startDate: '2026-11-23',
    endDate: '2026-12-17',
    description: 'Sidang peperiksaan bertulis utama bagi Sijil Pelajaran Malaysia (SPM) Tahun 2026.',
    notes: 'Melibatkan semua calon tingkatan 5 sekolah menengah ahli MPGBSIM.',
    status: 'published',
    isPublished: true,
  };

  const bigThree = [
    {
      item: upkkWritten,
      code: 'UPKK 2026',
      badgeBg: 'bg-amber-400 text-slate-950',
      tagColor: 'text-amber-400',
      borderGlow: 'hover:border-amber-400/60',
      level: 'Sekolah Rendah & KAFA (Tahun 5)',
      highlights: ['Ulum Syar’iyyah', 'Sirah', 'Jawi & Khat', 'Adab (Akhlak)', 'Bahasa Arab'],
      totalDays: '4 Hari Peperiksaan Bertulis',
      targetAudience: 'Murid KAFA / SRI Seluruh Malaysia',
    },
    {
      item: sppimExam,
      code: 'SPPIM 2026',
      badgeBg: 'bg-sky-400 text-slate-950',
      tagColor: 'text-sky-400',
      borderGlow: 'hover:border-sky-400/60',
      level: 'Sekolah Rendah Islam (Tahun 6)',
      highlights: ['Kurikulum Diniyah', 'Hafazan Al-Quran', 'Pembinaan Sahsiah', 'Kemuncak SRI'],
      totalDays: '2 Hari Pentaksiran Kemuncak',
      targetAudience: 'Murid Tahun 6 Rangkaian SRI IKRAM Musleh',
    },
    {
      item: spmWritten,
      code: 'SPM 2026',
      badgeBg: 'bg-emerald-400 text-slate-950',
      tagColor: 'text-emerald-400',
      borderGlow: 'hover:border-emerald-400/60',
      level: 'Sekolah Menengah (Tingkatan 5)',
      highlights: ['Peperiksaan Berpusat', 'Pensijilan Terbuka Kebangsaan', 'Dewan Utama'],
      totalDays: '25 Hari Sidang Bertulis Berpusat',
      targetAudience: 'Calon SPM Sekolah Menengah Seluruh Negara',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner with Real-time Clock */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 p-6 sm:p-7 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sorotan Peperiksaan Utama 2026</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              3 Ujian Besar Bertulis: UPKK, SPPIM & SPM
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Jadual rasmi dan paparan <span className="text-amber-300 font-bold">digital countdown masa bergerak (live ticking)</span> bagi tiga penilaian bertulis terbesar institusi pendidikan Islam dan kebangsaan.
            </p>
          </div>

          {/* Live Malaysian Clock Widget */}
          <div className="bg-slate-950/80 border border-teal-500/40 rounded-2xl p-4 sm:p-5 shrink-0 min-w-[280px] shadow-lg backdrop-blur-md flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-teal-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Waktu Piawai Malaysia (MST)
              </span>
              <span className="font-mono text-slate-400">UTC+8</span>
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
              {currentMyTime || 'Memuatkan waktu Malaysia...'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Kiraan masa bergerak setiap saat secara tepat</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main Examination Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {bigThree.map((examCard) => {
          const item = examCard.item;
          const dateRange = formatMalayDateRange(item.startDate, item.endDate);

          return (
            <div
              key={item.id}
              className={`rounded-3xl bg-slate-900/95 border border-slate-800 ${examCard.borderGlow} transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden relative group`}
            >
              {/* Header Ribbon */}
              <div className="p-5 sm:p-6 pb-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${examCard.badgeBg} shadow-xs flex items-center gap-1.5`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    {examCard.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tahun {item.academicYear || 2026}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{examCard.level}</span>
                  </div>
                </div>

                {/* Date Banner */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Tarikh Peperiksaan</div>
                    <div className="font-bold text-white text-xs sm:text-sm">{dateRange}</div>
                  </div>
                </div>

                {/* Subject / Scope Badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-teal-400" />
                    <span>Fokus Sukatan / Komponen Pentaksiran:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {examCard.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800/90 text-slate-300 border border-slate-700/80"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Digital Live Ticking Clock Display */}
              <div className="px-5 sm:px-6 pb-5 pt-1">
                <DigitalLiveClockCard
                  startDate={item.startDate}
                  endDate={item.endDate}
                  title={item.title}
                  category={item.category}
                  initialNotice={item.initialStatusNotice}
                  variant="featured"
                />

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {item.sourceUrl ? (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-teal-300 hover:text-white flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Rujukan Rasmi</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">Takwim MPGBSIM</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectExam && onSelectExam(item as ExamCalendarItem)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
                  >
                    <span>Butiran Lengkap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
