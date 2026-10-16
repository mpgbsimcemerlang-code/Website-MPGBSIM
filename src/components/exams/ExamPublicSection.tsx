import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarDays,
  X,
  Share2
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { ExamCalendarItem } from '../../types';
import {
  getExamCountdownInfo,
  getCategoryBadgeStyle,
  getMalaysiaTodayDateString,
  getDistinctCategories
} from '../../utils/examCountdown';
import { BigThreeExamsShowcase } from './BigThreeExamsShowcase';
import { DigitalLiveClockCard } from './DigitalLiveClockCard';

export const ExamPublicSection: React.FC = () => {
  const { siteData } = useAdminContent();
  const exams = siteData.examCalendar || [];

  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeModalExam, setActiveModalExam] = useState<ExamCalendarItem | null>(null);

  const todayStr = useMemo(() => getMalaysiaTodayDateString(), []);

  // Filter only published exams for public display
  const publishedExams = useMemo(() => {
    return exams.filter((e) => e.status === 'published' && e.isPublished !== false);
  }, [exams]);

  // Categories & Years list
  const categories = useMemo(() => getDistinctCategories(publishedExams), [publishedExams]);
  const years = useMemo(() => {
    const list = Array.from(new Set(publishedExams.map((e) => String(e.academicYear || 2026))));
    return list.sort().reverse();
  }, [publishedExams]);

  // Computed exams with countdown info
  const processedExams = useMemo(() => {
    return publishedExams.map((exam) => {
      const countdown = getExamCountdownInfo(exam, todayStr);
      return {
        ...exam,
        countdown,
      };
    });
  }, [publishedExams, todayStr]);

  // Filtered list
  const filteredExams = useMemo(() => {
    return processedExams.filter((item) => {
      // 1. Status Filter
      if (selectedStatusTab === 'upcoming' && item.countdown.liveStatus !== 'upcoming') return false;
      if (selectedStatusTab === 'ongoing' && item.countdown.liveStatus !== 'ongoing') return false;
      if (selectedStatusTab === 'completed' && item.countdown.liveStatus !== 'completed') return false;

      // 2. Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // 3. Year Filter
      if (selectedYear !== 'all' && String(item.academicYear) !== selectedYear) return false;

      // 4. Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCategory && !matchDesc && !matchNotes) return false;
      }

      return true;
    }).sort((a, b) => {
      // Priority: Ongoing first, then upcoming (soonest first), then completed
      const order = { ongoing: 1, upcoming: 2, completed: 3, draft: 4, archived: 5 };
      const diff = (order[a.countdown.liveStatus] || 99) - (order[b.countdown.liveStatus] || 99);
      if (diff !== 0) return diff;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [processedExams, selectedStatusTab, selectedCategory, selectedYear, searchTerm]);

  // Imminent / Closest Featured Exam for Top Hero Spotlight
  const spotlightExam = useMemo(() => {
    const ongoing = processedExams.find((e) => e.countdown.liveStatus === 'ongoing');
    if (ongoing) return ongoing;
    const upcoming = processedExams
      .filter((e) => e.countdown.liveStatus === 'upcoming')
      .sort((a, b) => a.countdown.countdownDays - b.countdown.countdownDays)[0];
    return upcoming || processedExams[0] || null;
  }, [processedExams]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: processedExams.length,
      upcoming: processedExams.filter((e) => e.countdown.liveStatus === 'upcoming').length,
      ongoing: processedExams.filter((e) => e.countdown.liveStatus === 'ongoing').length,
      completed: processedExams.filter((e) => e.countdown.liveStatus === 'completed').length,
    };
  }, [processedExams]);

  return (
    <section id="peperiksaan" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-50 relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900 text-teal-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            Kalendar Peperiksaan & Countdown Pendidikan
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Jadual Peperiksaan Awam & Pentaksiran Institusi Islam
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Rujukan komprehensif bagi Pengetua, Guru Besar, guru, ibu bapa dan calon peperiksaan SPM, UPKK/KAFA dan SPPIM dengan kiraan hari secara langsung (Live Countdown).
          </p>
        </div>

        {/* 3 Ujian Besar Bertulis Live Digital Showcase */}
        <div className="mb-14">
          <BigThreeExamsShowcase
            exams={publishedExams}
            onSelectExam={(e) => setActiveModalExam(e)}
          />
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
          {/* Main Status Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-1.5 border-b border-slate-100 pb-3">
            <button
              onClick={() => setSelectedStatusTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedStatusTab === 'all'
                  ? 'bg-teal-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Semua Peperiksaan</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedStatusTab === 'all' ? 'bg-teal-800 text-teal-200' : 'bg-slate-200 text-slate-700'}`}>
                {tabCounts.all}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatusTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedStatusTab === 'upcoming'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Akan Datang</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedStatusTab === 'upcoming' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {tabCounts.upcoming}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatusTab('ongoing')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedStatusTab === 'ongoing'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Sedang Berlangsung</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedStatusTab === 'ongoing' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                {tabCounts.ongoing}
              </span>
            </button>

            <button
              onClick={() => setSelectedStatusTab('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedStatusTab === 'completed'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Arkib / Selesai</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedStatusTab === 'completed' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                {tabCounts.completed}
              </span>
            </button>
          </div>

          {/* Sub Filters: Category, Year, Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Year & Search */}
            <div className="flex items-center gap-2">
              {years.length > 1 && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="py-1.5 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                >
                  <option value="all">Semua Tahun</option>
                  {years.map((y) => (
                    <option key={y} value={y}>Tahun {y}</option>
                  ))}
                </select>
              )}

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari peperiksaan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">Tiada Peperiksaan Ditemui</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tiada rekod peperiksaan yang sepadan dengan penapisan status atau carian "{searchTerm}". Sila tukar penapis di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map((item) => {
              const catStyle = getCategoryBadgeStyle(item.category);
              const { liveStatus, statusBadgeText, countdownDays, countdownLabel, formattedRange, isToday } = item.countdown;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {/* Top Bar: Category & Status */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${catStyle.indicator}`} />
                        {item.category} • {item.academicYear}
                      </span>

                      {/* Status Pill */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          liveStatus === 'ongoing'
                            ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                            : liveStatus === 'upcoming'
                            ? isToday
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : 'bg-teal-50 text-teal-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusBadgeText}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-extrabold text-slate-900 group-hover:text-teal-900 transition-colors line-clamp-2 leading-snug mb-2">
                      {item.title}
                    </h4>

                    {/* Date Range */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>{formattedRange}</span>
                    </div>

                    {/* Description Excerpt */}
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action & Countdown Badge */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    {/* Countdown Display */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-teal-50 group-hover:text-teal-800 transition">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        {liveStatus === 'upcoming' ? (
                          <div className="text-xs font-black text-amber-600">
                            {countdownLabel}
                          </div>
                        ) : liveStatus === 'ongoing' ? (
                          <div className="text-xs font-black text-emerald-600">
                            {countdownLabel}
                          </div>
                        ) : (
                          <div className="text-xs font-semibold text-slate-400">
                            {item.initialStatusNotice || 'Selesai'}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block -mt-0.5">
                          {liveStatus === 'completed' ? 'Arkib rekod' : 'Waktu Malaysia'}
                        </span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setActiveModalExam(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-800 text-slate-700 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Lihat Maklumat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-10 p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              Tarikh peperiksaan tertakluk kepada pengumuman rasmi Lembaga Peperiksaan Malaysia (LPM), JAKIM dan IKRAM Musleh.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">
            Kemas kini terakhir: Sesi Akademik 2026/2027
          </span>
        </div>
      </div>

      {/* Interactive Detail Modal */}
      {activeModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                  {activeModalExam.category} • Tahun {activeModalExam.academicYear}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {activeModalExam.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalExam(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Ticking Digital Clock in Modal */}
            <DigitalLiveClockCard
              startDate={activeModalExam.startDate}
              endDate={activeModalExam.endDate}
              title={activeModalExam.title}
              category={activeModalExam.category}
              initialNotice={activeModalExam.initialStatusNotice}
              variant="featured"
            />

            {/* Date Details */}
            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Julat Tarikh Peperiksaan:</span>
                <strong className="text-slate-900 font-bold">
                  {getExamCountdownInfo(activeModalExam, todayStr).formattedRange}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Tarikh Mula:</span>
                <span className="font-semibold text-slate-800">{activeModalExam.startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Tarikh Tamat:</span>
                <span className="font-semibold text-slate-800">{activeModalExam.endDate}</span>
              </div>
            </div>

            {/* Description & Notes */}
            {activeModalExam.description && (
              <div>
                <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Keterangan Peperiksaan
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeModalExam.description}
                </p>
              </div>
            )}

            {activeModalExam.notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong className="block font-bold mb-0.5">Nota Khusus:</strong>
                <span>{activeModalExam.notes}</span>
              </div>
            )}

            {activeModalExam.sourceUrl && (
              <div className="pt-2">
                <a
                  href={activeModalExam.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Pautan Sumber Rujukan Rasmi</span>
                </a>
              </div>
            )}

            <button
              onClick={() => setActiveModalExam(null)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
