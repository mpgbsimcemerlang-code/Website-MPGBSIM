import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  Archive,
  Save,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { ExamCalendarItem, ExamPublishStatus } from '../../types';
import {
  getExamCountdownInfo,
  getCategoryBadgeStyle,
  getMalaysiaTodayDateString,
  formatMalayDateRange
} from '../../utils/examCountdown';

export const AdminExamManagement: React.FC = () => {
  const {
    siteData,
    addExamItem,
    updateExamItem,
    deleteExamItem,
    resetExamCalendarToDefault,
  } = useAdminContent();

  const exams: ExamCalendarItem[] = siteData.examCalendar || [];
  const todayStr = useMemo(() => getMalaysiaTodayDateString(), []);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewExamModal, setPreviewExamModal] = useState<ExamCalendarItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'SPM' | 'UPKK/KAFA' | 'SPPIM' | string>('SPM');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formAcademicYear, setFormAcademicYear] = useState<number>(2026);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formStatus, setFormStatus] = useState<ExamPublishStatus>('published');
  const [formInitialStatusNotice, setFormInitialStatusNotice] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Distinct categories and years
  const categories = useMemo(() => {
    const list = Array.from(new Set(['SPM', 'UPKK/KAFA', 'SPPIM', ...exams.map((e) => e.category).filter(Boolean)]));
    return list;
  }, [exams]);

  const years = useMemo(() => {
    const list = Array.from(new Set(exams.map((e) => String(e.academicYear || 2026))));
    return list.sort().reverse();
  }, [exams]);

  // Computed exams with countdown
  const processedExams = useMemo(() => {
    return exams.map((exam) => {
      const countdown = getExamCountdownInfo(exam, todayStr);
      return {
        ...exam,
        countdown,
      };
    });
  }, [exams, todayStr]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: exams.length,
      upcoming: processedExams.filter((e) => e.countdown.liveStatus === 'upcoming' && e.status === 'published').length,
      ongoing: processedExams.filter((e) => e.countdown.liveStatus === 'ongoing' && e.status === 'published').length,
      completed: processedExams.filter((e) => e.countdown.liveStatus === 'completed' || e.status === 'archived').length,
      draft: exams.filter((e) => e.status === 'draft').length,
    };
  }, [exams, processedExams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return processedExams.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedYear !== 'all' && String(item.academicYear) !== selectedYear) return false;

      if (selectedStatus === 'upcoming' && item.countdown.liveStatus !== 'upcoming') return false;
      if (selectedStatus === 'ongoing' && item.countdown.liveStatus !== 'ongoing') return false;
      if (selectedStatus === 'completed' && item.countdown.liveStatus !== 'completed') return false;
      if (selectedStatus === 'draft' && item.status !== 'draft') return false;
      if (selectedStatus === 'archived' && item.status !== 'archived') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchDesc && !matchNotes) return false;
      }

      return true;
    }).sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [processedExams, selectedCategory, selectedYear, selectedStatus, searchTerm]);

  // Open modal for new item
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('SPM');
    setFormCustomCategory('');
    setFormAcademicYear(2026);
    setFormStartDate(todayStr);
    setFormEndDate(todayStr);
    setFormDescription('');
    setFormNotes('');
    setFormSourceUrl('');
    setFormStatus('published');
    setFormInitialStatusNotice('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (exam: ExamCalendarItem) => {
    setEditingId(exam.id);
    setFormTitle(exam.title);
    if (['SPM', 'UPKK/KAFA', 'SPPIM'].includes(exam.category)) {
      setFormCategory(exam.category);
      setFormCustomCategory('');
    } else {
      setFormCategory('Lain-lain');
      setFormCustomCategory(exam.category);
    }
    setFormAcademicYear(Number(exam.academicYear) || 2026);
    setFormStartDate(exam.startDate);
    setFormEndDate(exam.endDate || exam.startDate);
    setFormDescription(exam.description || '');
    setFormNotes(exam.notes || '');
    setFormSourceUrl(exam.sourceUrl || '');
    setFormStatus(exam.status || 'published');
    setFormInitialStatusNotice(exam.initialStatusNotice || '');
    setIsModalOpen(true);
  };

  // Save / Update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Sila masukkan tajuk peperiksaan.');
      return;
    }
    if (!formStartDate) {
      alert('Sila pilih tarikh mula peperiksaan.');
      return;
    }

    const finalCategory = formCategory === 'Lain-lain' ? (formCustomCategory.trim() || 'Umum') : formCategory;
    const finalEndDate = formEndDate || formStartDate;

    setIsSubmitting(true);
    try {
      const payload: Partial<ExamCalendarItem> = {
        title: formTitle.trim(),
        category: finalCategory,
        academicYear: formAcademicYear,
        startDate: formStartDate,
        endDate: finalEndDate,
        description: formDescription.trim(),
        notes: formNotes.trim(),
        sourceUrl: formSourceUrl.trim(),
        status: formStatus,
        isPublished: formStatus === 'published',
        initialStatusNotice: formInitialStatusNotice.trim() || undefined,
      };

      if (editingId) {
        await updateExamItem(editingId, payload);
        showToast('Jadual peperiksaan berjaya dikemas kini!');
      } else {
        await addExamItem(payload as any);
        showToast('Peperiksaan baharu berjaya ditambah!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Ralat semasa menyimpan: ' + (err.message || 'Sila cuba lagi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadam peperiksaan "${title}"?`)) {
      try {
        await deleteExamItem(id);
        showToast('Peperiksaan telah dipadam daripada rekod.');
      } catch (err: any) {
        alert('Gagal memadam: ' + (err.message || 'Sila cuba lagi'));
      }
    }
  };

  // Quick toggle status
  const handleToggleStatus = async (exam: ExamCalendarItem, newStatus: ExamPublishStatus) => {
    try {
      await updateExamItem(exam.id, {
        status: newStatus,
        isPublished: newStatus === 'published',
      });
      showToast(`Status ditukar kepada "${newStatus === 'published' ? 'Diterbitkan' : newStatus === 'draft' ? 'Draf' : 'Diarkibkan'}"`);
    } catch (err: any) {
      alert('Gagal mengemas kini status: ' + err.message);
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    const confirmMsg =
      'Adakah anda pasti mahu menetapkan semula Kalendar Peperiksaan kepada 11 rekod rasmi awal (SPM 2026, UPKK 2026 & SPPIM 2026)?\n\nPerubahan tarikh tersuai akan digantikan dengan tarikh rasmi asal.';
    if (window.confirm(confirmMsg)) {
      try {
        await resetExamCalendarToDefault();
        showToast('Kalendar peperiksaan telah ditetapkan semula kepada rekod rasmi awal!');
      } catch (err: any) {
        alert('Gagal menetapkan semula: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-teal-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-700 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-teal-900/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-bold uppercase tracking-wider">
              <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
              Admin CMS • Modul Kalendar Peperiksaan
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pengurusan Takwim Peperiksaan & Live Countdown
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Urus tarikh peperiksaan SPM, UPKK/KAFA, SPPIM dan pentaksiran institusi. Sebarang perubahan tarikh akan dikemas kini serta-merta pada laman utama website rasmi dan Portal Ahli Pengetua/Guru Besar tanpa perlu mengubah kod sumber.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg hover:shadow-amber-400/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Peperiksaan</span>
            </button>

            <button
              onClick={handleResetToDefault}
              title="Tetapkan semula jadual kepada rekod rasmi asal (SPM 2026, UPKK 2026, SPPIM 2026)"
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden sm:inline">Set Semula Rasmi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Rekod</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Semua takwim tersimpan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Akan Datang</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.upcoming}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Countdown aktif</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Berlangsung</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.ongoing}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Sedang berjalan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Selesai / Arkib</div>
          <div className="text-2xl font-black text-slate-700 mt-1">{metrics.completed}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tamat & rujukan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Draf</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{metrics.draft}</div>
          <div className="text-[10px] text-purple-700 mt-0.5">Belum diterbitkan</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'upcoming', label: 'Akan Datang' },
              { id: 'ongoing', label: 'Sedang Berlangsung' },
              { id: 'completed', label: 'Selesai / Arkib' },
              { id: 'draft', label: 'Draf' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari tajuk, kategori, nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Secondary Category & Year Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Kategori:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          {years.length > 1 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="py-1 px-2.5 rounded-lg text-xs bg-slate-50 border border-slate-200 font-semibold text-slate-700"
              >
                <option value="all">Semua Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Exams Table / Cards List */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Tiada Peperiksaan Dijumpai</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tiada rekod peperiksaan yang menepati penapis atau carian anda. Cuba ubah kata kunci atau tambah peperiksaan baru.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-teal-900 text-white text-xs font-bold hover:bg-teal-800 transition cursor-pointer"
          >
            Tambah Peperiksaan Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExams.map((exam) => {
            const badgeStyle = getCategoryBadgeStyle(exam.category);
            const liveInfo = exam.countdown;

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md ${
                  exam.status === 'draft'
                    ? 'border-dashed border-purple-300 bg-purple-50/10'
                    : exam.status === 'archived'
                    ? 'border-slate-200 bg-slate-50/50 opacity-80'
                    : liveInfo.liveStatus === 'ongoing'
                    ? 'border-emerald-300 bg-emerald-50/10 ring-1 ring-emerald-400/30'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Title & Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                        <span className={`w-2 h-2 rounded-full ${badgeStyle.indicator}`} />
                        {exam.category}
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                        Sesi {exam.academicYear}
                      </span>

                      {/* Live Status Badge */}
                      {liveInfo.liveStatus === 'ongoing' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          SEDANG BERLANGSUNG
                        </span>
                      ) : liveInfo.liveStatus === 'upcoming' ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                          liveInfo.urgencyLevel === 'urgent'
                            ? 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {liveInfo.countdownLabel}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {exam.initialStatusNotice || 'Telah Selesai'}
                        </span>
                      )}

                      {/* Publish State */}
                      {exam.status === 'draft' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          DRAF PENTADBIR
                        </span>
                      )}
                      {exam.status === 'archived' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          ARKIB
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {exam.title}
                    </h3>

                    {exam.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {exam.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-teal-700" />
                        <span>{formatMalayDateRange(exam.startDate, exam.endDate)}</span>
                      </div>

                      {exam.notes && (
                        <div className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-[11px]">
                          <Info className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="line-clamp-1">{exam.notes}</span>
                        </div>
                      )}

                      {exam.sourceUrl && (
                        <a
                          href={exam.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-teal-700 hover:text-teal-900 hover:underline text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Rujukan Sumber</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    {/* Quick Publish Toggle */}
                    <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                      <button
                        onClick={() => handleToggleStatus(exam, 'published')}
                        title="Terbitkan ke Laman & Portal"
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                          exam.status === 'published'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span className="text-[11px]">Terbit</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(exam, 'draft')}
                        title="Simpan sebagai Draf (Tidak dipaparkan kepada umum)"
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                          exam.status === 'draft'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <EyeOff className="w-3 h-3" />
                        <span className="text-[11px]">Draf</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(exam, 'archived')}
                        title="Arkibkan rekod"
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                          exam.status === 'archived'
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Archive className="w-3 h-3" />
                        <span className="text-[11px]">Arkib</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-teal-200"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(exam.id, exam.title)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200"
                      title="Padam peperiksaan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-800 text-amber-400 flex items-center justify-center font-bold">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {editingId ? 'Edit Maklumat Peperiksaan' : 'Tambah Peperiksaan Baharu'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Modul Takwim Rasmi Peperiksaan Awam & Pentaksiran Islam
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tajuk Peperiksaan / Pentaksiran <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ujian Bertutur Bahasa Melayu / Peperiksaan Bertulis SPM"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs sm:text-sm"
                />
              </div>

              {/* Category & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Peperiksaan <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs"
                  >
                    <option value="SPM">SPM (Sijil Pelajaran Malaysia)</option>
                    <option value="UPKK/KAFA">UPKK/KAFA (Ujian Penilaian Kelas KAFA)</option>
                    <option value="SPPIM">SPPIM (Syahadah Pentaksiran Pelajar IKRAM Musleh)</option>
                    <option value="STAM">STAM (Sijil Tinggi Agama Malaysia)</option>
                    <option value="Lain-lain">Kategori Lain (Tersuai)</option>
                  </select>

                  {formCategory === 'Lain-lain' && (
                    <input
                      type="text"
                      placeholder="Masukkan nama kategori baru"
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      className="mt-2 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Akademik <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2035}
                    value={formAcademicYear}
                    onChange={(e) => setFormAcademicYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs"
                  />
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarikh Mula <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => {
                      setFormStartDate(e.target.value);
                      if (!formEndDate || formEndDate < e.target.value) {
                        setFormEndDate(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarikh Tamat <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Untuk peperiksaan sehari, samakan tarikh mula dan tamat.
                  </p>
                </div>
              </div>

              {/* Status Penerbitan & Status Awal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Penerbitan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ExamPublishStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs"
                  >
                    <option value="published">Diterbitkan (Paparkan di Website & Portal)</option>
                    <option value="draft">Draf (Hanya Admin Boleh Melihat)</option>
                    <option value="archived">Diarkibkan (Arkib Peperiksaan Lepas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Status Awal (Pilihan)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Telah berlangsung / Jadual Tentatif"
                    value={formInitialStatusNotice}
                    onChange={(e) => setFormInitialStatusNotice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Digunakan jika rekod telah berlangsung sebelum sistem ini dibina (seperti SPPIM).
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan & Deskripsi Ringkas
                </label>
                <textarea
                  rows={2}
                  placeholder="Huraian ringkas mengenai skop, kertas, atau calon peperiksaan..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nota / Arahan Khas untuk PGB & Sekolah Ahli
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Sidang ujian lisan dikendalikan di bilik peperiksaan lisan sekolah ahli..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                />
              </div>

              {/* Source URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pautan Sumber Rujukan Rasmi (URL)
                </label>
                <input
                  type="url"
                  placeholder="Contoh: https://ecentral.my/tarikh-upkk/ atau pautan LP KPM"
                  value={formSourceUrl}
                  onChange={(e) => setFormSourceUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                />
              </div>

              {/* Preview Box */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pratonton Paparan Tarikh:</span>
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold">Julat Tarikh: </span>
                  {formStartDate ? formatMalayDateRange(formStartDate, formEndDate || formStartDate) : 'Belum dipilih'}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer transition flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Peperiksaan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
