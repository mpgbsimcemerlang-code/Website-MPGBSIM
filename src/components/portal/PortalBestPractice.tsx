import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  School,
  User,
  ArrowRight,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Share2,
  X,
  Award,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { BestPracticeItem } from '../../types';

export const PortalBestPractice: React.FC = () => {
  const { siteData } = useAdminContent();
  const {
    bestPractices,
    currentRole,
    currentUser,
    setPortalTab,
    reviewBestPractice,
  } = useMemberPortal();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedPractice, setSelectedPractice] = useState<BestPracticeItem | null>(null);

  const categories = [
    'Semua',
    'Kepimpinan',
    'Kurikulum',
    'HEM',
    'Kokurikulum',
    'Tarbiah',
    'AI',
    'Digital',
    'HR',
    'Kewangan',
    'Pengurusan',
    'Inovasi',
  ];

  // Unified list from website CMS (siteData.practices) and Member Portal submissions
  const unifiedPractices: BestPracticeItem[] = React.useMemo(() => {
    const map = new Map<string, BestPracticeItem>();
    (siteData.practices || []).forEach((p) => {
      map.set(p.id, {
        ...p,
        school: p.school || p.schoolName,
        status: p.status || 'Published',
      });
    });
    bestPractices.forEach((bp) => {
      map.set(bp.id, {
        ...bp,
        school: bp.school || bp.schoolName,
      });
    });
    return Array.from(map.values());
  }, [siteData.practices, bestPractices]);

  // Members only see Published/Approved items OR their own submissions
  const visiblePractices = unifiedPractices.filter((item) => {
    if (currentRole === 'ADMIN' || currentRole === 'MEDIA_AJK') return true;
    if (item.status === 'Published' || item.status === 'Approved' || item.status === 'published' || !item.status) return true;
    if (currentUser?.uid && item.authorId === currentUser.uid) return true;
    return false;
  });

  const filteredPractices = visiblePractices.filter((item) => {
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.school || item.schoolName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.challenge || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Submit Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Hab Amalan Terbaik Pendidikan Islam
          </div>
          <h1 className="text-2xl font-black text-slate-900">Best Practice Hub MPGBSIM</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gedung perkongsian amalan terbaik, model intervensi, kajian kes dan inovasi kepimpinan sekolah Islam.
          </p>
        </div>

        <button
          onClick={() => setPortalTab('kongsi-amalan')}
          className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Kongsi Amalan Terbaik Sekolah Anda
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Categories Tab */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tajuk, sekolah atau kata kunci amalan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Best Practices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPractices.map((bp) => {
          const isOwn = currentUser?.uid && bp.authorId === currentUser.uid;
          return (
            <div
              key={bp.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                    {bp.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isOwn && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-900">
                        Submisi Anda
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        bp.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-900'
                          : bp.status === 'Approved'
                          ? 'bg-teal-100 text-teal-900'
                          : bp.status === 'Under Review' || bp.status === 'Submitted'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {bp.status || 'Published'}
                    </span>
                  </div>
                </div>

                <h3
                  onClick={() => setSelectedPractice(bp)}
                  className="font-black text-base text-slate-900 hover:text-emerald-800 leading-snug cursor-pointer line-clamp-2"
                >
                  {bp.title}
                </h3>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600">
                  <School className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate font-medium">{bp.school || bp.schoolName}</span>
                </div>

                {/* Challenge Summary */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Cabaran Dihadapi:
                  </span>
                  <p className="text-slate-700 line-clamp-2">
                    {bp.challenge || bp.description || 'Penerangan cabaran di sekolah.'}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[130px] text-[11px]">Penulis: {bp.author}</span>
                <button
                  onClick={() => setSelectedPractice(bp)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5"
                >
                  Kajian Penuh <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPractices.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">Tiada amalan terbaik ditemui</h3>
          <p className="text-xs text-slate-500 mt-1">Jadilah yang pertama berkongsi amalan terbaik sekolah anda!</p>
        </div>
      )}

      {/* Comprehensive Best Practice 12-Field Detail Modal */}
      {selectedPractice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 space-y-6">
            <button
              onClick={() => setSelectedPractice(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-900">
                  Kategori: {selectedPractice.category}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                  Status: {selectedPractice.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {selectedPractice.title}
              </h2>
            </div>

            {/* Author & School info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Institusi / Sekolah:</span>
                <strong className="text-slate-900 text-sm">{selectedPractice.school || selectedPractice.schoolName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Penggerak / Penulis:</span>
                <strong className="text-slate-900 text-sm">{selectedPractice.author}</strong>
              </div>
            </div>

            {/* 12 Required Sections Display */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              {/* 1. Challenge */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900 mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  1. Cabaran & Titik Kesukaran Awal (The Challenge)
                </h4>
                <p className="leading-relaxed text-slate-800">
                  {selectedPractice.challenge || selectedPractice.description || 'Penerangan cabaran yang dihadapi institusi.'}
                </p>
              </div>

              {/* 2. Approach & Solution */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  2. Pendekatan & Formula Solusi (The Approach)
                </h4>
                <p className="leading-relaxed text-slate-800">
                  {selectedPractice.approach || selectedPractice.impactSummary || 'Formula penyelesaian berimpak tinggi yang diperkenalkan.'}
                </p>
              </div>

              {/* 3. Implementation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-700" />
                  3. Tatacara Pelaksanaan Lapangan (Implementation)
                </h4>
                <p className="leading-relaxed text-slate-800">
                  {selectedPractice.implementation || 'Fasa pelaksanaan bersama guru, murid dan pihak berkepentingan.'}
                </p>
              </div>

              {/* 4. Outcome */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  4. Impak & Hasil Terbukti (Outcome & Impact)
                </h4>
                <p className="leading-relaxed text-slate-800">
                  {selectedPractice.outcome || 'Peningkatan markah, sahsiah, atau kelestarian kewangan sekolah.'}
                </p>
              </div>

              {/* 5. Lesson Learned */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-1.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  5. Ibrah & Pengajaran Kepimpinan (Lesson Learned)
                </h4>
                <p className="leading-relaxed text-slate-800">
                  {selectedPractice.lessonLearned || 'Hikmah dan panduan replikasi untuk pengetua sekolah lain.'}
                </p>
              </div>

              {/* Supporting document if available */}
              {(selectedPractice.supportingDocs || (selectedPractice as any).driveUrl || (selectedPractice as any).documentUrl) && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-teal-800 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-teal-950 block">
                        Dokumen & Modul Sokongan Inovasi
                      </span>
                      <span className="text-[11px] text-teal-800 font-mono line-clamp-1">
                        {selectedPractice.supportingDocs || (selectedPractice as any).driveUrl || 'Modul_Inovasi_Sekolah.pdf'}
                      </span>
                    </div>
                  </div>
                  <a
                    href={
                      (selectedPractice as any).driveUrl ||
                      (selectedPractice as any).documentUrl ||
                      (selectedPractice.supportingDocs?.startsWith('http')
                        ? selectedPractice.supportingDocs
                        : 'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link')
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <span>Muat Turun Dokumen / Modul</span>
                  </a>
                </div>
              )}
            </div>

            {/* Admin / Media AJK Review Action Controls */}
            {(currentRole === 'ADMIN' || currentRole === 'MEDIA_AJK') && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-amber-400 font-bold block">Panel Kelulusan Media AJK / Admin</span>
                  <span className="text-slate-300 text-[11px]">Kemas kini status penerbitan amalan terbaik ini</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      reviewBestPractice(selectedPractice.id, 'Published');
                      setSelectedPractice(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                  >
                    Luluskan & Terbitkan
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Masukkan sebab penolakan atau cadangan penambahbaikan:');
                      if (reason) {
                        reviewBestPractice(selectedPractice.id, 'Rejected', reason);
                        setSelectedPractice(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
                  >
                    Tolak / Minta Semula
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPractice(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
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
