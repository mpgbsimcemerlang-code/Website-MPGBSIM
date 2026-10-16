import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Printer,
  Calendar,
  Layers,
  X,
  Share2,
  BookOpen,
  School,
  Check
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { ExamCalendarItem } from '../../types';
import {
  getExamCountdownInfo,
  getCategoryBadgeStyle,
  getMalaysiaTodayDateString,
  getDistinctCategories,
  formatMalayDateRange
} from '../../utils/examCountdown';
import { BigThreeExamsShowcase } from '../exams/BigThreeExamsShowcase';
import { DigitalLiveClockCard } from '../exams/DigitalLiveClockCard';

export const PortalExamCalendar: React.FC = () => {
  const { siteData } = useAdminContent();
  const exams = siteData.examCalendar || [];

  const todayStr = useMemo(() => getMalaysiaTodayDateString(), []);

  // Filter only published exams for PGB view
  const publishedExams = useMemo(() => {
    return exams.filter((e) => e.status === 'published' && e.isPublished !== false);
  }, [exams]);

  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeModalExam, setActiveModalExam] = useState<ExamCalendarItem | null>(null);
  const [copiedSchedule, setCopiedSchedule] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const categories = useMemo(() => getDistinctCategories(publishedExams), [publishedExams]);

  // Computed exams with countdown
  const processedExams = useMemo(() => {
    return publishedExams.map((exam) => {
      const countdown = getExamCountdownInfo(exam, todayStr);
      return {
        ...exam,
        countdown,
      };
    });
  }, [publishedExams, todayStr]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: processedExams.length,
      upcoming: processedExams.filter((e) => e.countdown.liveStatus === 'upcoming').length,
      ongoing: processedExams.filter((e) => e.countdown.liveStatus === 'ongoing').length,
      completed: processedExams.filter((e) => e.countdown.liveStatus === 'completed').length,
    };
  }, [processedExams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return processedExams.filter((item) => {
      // 1. Status Filter
      if (selectedStatusTab === 'upcoming' && item.countdown.liveStatus !== 'upcoming') return false;
      if (selectedStatusTab === 'ongoing' && item.countdown.liveStatus !== 'ongoing') return false;
      if (selectedStatusTab === 'completed' && item.countdown.liveStatus !== 'completed') return false;

      // 2. Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // 3. Search Query
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
      const order = { ongoing: 1, upcoming: 2, completed: 3, draft: 4, archived: 5 };
      const diff = (order[a.countdown.liveStatus] || 99) - (order[b.countdown.liveStatus] || 99);
      if (diff !== 0) return diff;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [processedExams, selectedStatusTab, selectedCategory, searchTerm]);

  // Spotlight exam (Ongoing first, or closest upcoming)
  const spotlightExam = useMemo(() => {
    const ongoing = processedExams.find((e) => e.countdown.liveStatus === 'ongoing');
    if (ongoing) return ongoing;
    const upcoming = processedExams
      .filter((e) => e.countdown.liveStatus === 'upcoming')
      .sort((a, b) => a.countdown.countdownDays - b.countdown.countdownDays)[0];
    return upcoming || processedExams[0] || null;
  }, [processedExams]);

  // Copy whole schedule to clipboard for school management
  const handleCopySchedule = () => {
    const lines = [
      '📅 *TAKWIM PEPERIKSAAN & PENTAKSIRAN PENDIDIKAN ISLAM MPGBSIM 2026*',
      `Rujukan Kepimpinan Pengetua & Guru Besar (Tarikh Semasa: ${todayStr})`,
      '--------------------------------------------------',
      '',
    ];

    processedExams.forEach((e, idx) => {
      lines.push(`${idx + 1}. [${e.category}] ${e.title}`);
      lines.push(`   🗓️ Tarikh: ${e.countdown.formattedRange}`);
      lines.push(`   ⏱️ Status: ${e.countdown.countdownLabel}`);
      if (e.notes) lines.push(`   📌 Catatan: ${e.notes}`);
      if (e.sourceUrl) lines.push(`   🔗 Sumber: ${e.sourceUrl}`);
      lines.push('');
    });

    lines.push('Disediakan melalui Portal Rasmi Kepimpinan MPGBSIM.');

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedSchedule(true);
      showToast('Ringkasan Takwim Peperiksaan telah disalin ke papan keratan (Clipboard)! Sedia ditampal ke WhatsApp atau dokumen sekolah.');
      setTimeout(() => setCopiedSchedule(false), 3000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-teal-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-700 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-bold uppercase tracking-wider">
              <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
              Portal Pengetua & Guru Besar
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Takwim Peperiksaan & Countdown Pentaksiran Islam
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Jadual rasmi dan countdown langsung peperiksaan awam (SPM 2026), pentaksiran KAFA/UPKK 2026, dan pentaksiran SPPIM bagi penyelarasan takwim institusi dan persediaan calon sekolah ahli.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopySchedule}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              {copiedSchedule ? <Check className="w-4 h-4 text-emerald-900" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSchedule ? 'Disalin ke Clipboard!' : 'Salin Ringkasan Takwim'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 flex items-center gap-2 transition cursor-pointer"
              title="Cetak Takwim Peperiksaan"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Ujian Besar Bertulis Live Digital Showcase */}
      <BigThreeExamsShowcase
        exams={publishedExams}
        onSelectExam={(e) => setActiveModalExam(e)}
        isPortalView={true}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Status Tabs */}
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

        {/* Categories & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari peperiksaan / subjek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Grid of Exams */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Tiada Peperiksaan Ditemui</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tiada rekod peperiksaan yang sepadan dengan kriteria carian atau penapis kategori anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => {
            const badgeStyle = getCategoryBadgeStyle(exam.category);
            const liveInfo = exam.countdown;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.indicator}`} />
                      {exam.category}
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {exam.academicYear}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-black text-slate-900 group-hover:text-teal-900 transition-colors line-clamp-2">
                    {exam.title}
                  </h3>

                  {/* Date Range */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span className="truncate">{liveInfo.formattedRange}</span>
                  </div>

                  {/* Description / Notes snippet */}
                  {exam.notes && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-xl border border-amber-100 line-clamp-2">
                      <span className="font-bold">Arahan: </span>
                      {exam.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Countdown & Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {/* Live Status Tag */}
                  <div>
                    {liveInfo.liveStatus === 'ongoing' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Sedang Berlangsung
                      </span>
                    ) : liveInfo.liveStatus === 'upcoming' ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        liveInfo.urgencyLevel === 'urgent'
                          ? 'bg-rose-50 text-rose-900 border-rose-300 font-extrabold'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}>
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{liveInfo.countdownLabel}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {exam.initialStatusNotice || 'Telah Selesai'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveModalExam(exam)}
                    className="px-3 py-1.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                  >
                    <span>Butiran</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail View */}
      {activeModalExam && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 relative">
              <button
                onClick={() => setActiveModalExam(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                    {activeModalExam.category}
                  </span>
                  <span className="text-xs text-teal-200 font-semibold">
                    Tahun {activeModalExam.academicYear}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white leading-tight">
                  {activeModalExam.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700 max-h-[70vh] overflow-y-auto">
              {/* Live Moving Digital Clock in Modal */}
              <DigitalLiveClockCard
                startDate={activeModalExam.startDate}
                endDate={activeModalExam.endDate}
                title={activeModalExam.title}
                category={activeModalExam.category}
                initialNotice={activeModalExam.initialStatusNotice}
                variant="featured"
              />

              {/* Date Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  <span>Tempoh Peperiksaan</span>
                </div>
                <div className="text-sm font-black text-slate-800">
                  {formatMalayDateRange(activeModalExam.startDate, activeModalExam.endDate)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Tarikh Mula: {activeModalExam.startDate} • Tarikh Tamat: {activeModalExam.endDate || activeModalExam.startDate}
                </div>
              </div>

              {/* Description */}
              {activeModalExam.description && (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">Keterangan Peperiksaan</div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {activeModalExam.description}
                  </p>
                </div>
              )}

              {/* Administrative Notes for School Leaders */}
              {activeModalExam.notes && (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Arahan Pentadbiran PGB & Pengurusan Sekolah</span>
                  </div>
                  <p className="text-xs text-amber-950 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
                    {activeModalExam.notes}
                  </p>
                </div>
              )}

              {/* Official Source URL */}
              {activeModalExam.sourceUrl && (
                <div className="pt-2">
                  <a
                    href={activeModalExam.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    <span>Pautan Sumber Rasmi</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setActiveModalExam(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
