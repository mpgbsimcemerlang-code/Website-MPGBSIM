import React, { useState, useRef } from 'react';
import {
  Bell,
  Search,
  Filter,
  Pin,
  Calendar,
  User,
  Plus,
  Edit3,
  Trash2,
  X,
  FileText,
  Download,
  CheckCircle,
  Eye,
  Archive,
  ArrowRight,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { AnnouncementItem } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

export const PortalAnnouncements: React.FC = () => {
  const {
    announcements,
    currentRole,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useMemberPortal();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  // Admin / Media AJK modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<AnnouncementItem['category']>('Rasmi');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formPinned, setFormPinned] = useState(false);
  const [formStatus, setFormStatus] = useState<AnnouncementItem['status']>('published');
  const [formImage, setFormImage] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [uploadedPosterName, setUploadedPosterName] = useState<string | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const handlePosterFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej yang sah (PNG, JPG, JPEG atau WebP).');
      return;
    }
    setIsUploadingPoster(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1000, 1400, 0.85);
      setFormImage(compressedDataUrl);
      setUploadedPosterName(file.name);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormImage((e.target?.result as string) || '');
        setUploadedPosterName(file.name);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const canManage = currentRole === 'ADMIN' || currentRole === 'MEDIA_AJK';

  const getAnnouncementDownloadUrl = (ann: AnnouncementItem): string => {
    const raw = (ann.attachmentUrl || '').trim();
    if (raw && raw !== '#') {
      if (/^(https?:\/\/|data:|\/)/i.test(raw)) return raw;
      return `https://${raw}`;
    }
    if (
      ann.id === 'ann-1' ||
      ann.title.toUpperCase().includes('JEMPUTAN MENYERTAI MESYUARAT MPGBSIM')
    ) {
      return 'https://drive.google.com/file/d/1PIemR7HOk9-JC--T1gMLMmMx4pwxDZh9/view?usp=sharing';
    }
    return 'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link';
  };

  const categories = ['Semua', 'Rasmi', 'Mesyuarat', 'Program', 'Kebajikan', 'Peluang', 'Penting'];

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchCat = selectedCategory === 'Semua' || ann.category === selectedCategory;
    const matchQuery =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  // Sort pinned first, then date descending
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('Rasmi');
    setFormSummary('');
    setFormContent('');
    setFormAuthor(currentRole === 'ADMIN' ? 'Sekretariat Utama MPGBSIM' : 'Biro Penerangan & Media');
    setFormPinned(false);
    setFormStatus('published');
    setFormImage('');
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setUploadedPosterName(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (ann: AnnouncementItem) => {
    setEditingId(ann.id);
    setFormTitle(ann.title);
    setFormCategory(ann.category);
    setFormSummary(ann.summary);
    setFormContent(ann.content);
    setFormAuthor(ann.author);
    setFormPinned(ann.pinned || false);
    setFormStatus(ann.status || 'published');
    setFormImage(ann.imageUrl || '');
    setFormAttachmentName(ann.attachmentName || '');
    setFormAttachmentUrl(ann.attachmentUrl || '');
    setUploadedPosterName(ann.imageUrl?.startsWith('data:image') ? 'Poster_Dimuat_Naik.webp' : null);
    setIsEditorOpen(true);
  };

  const handleSubmitEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Sila lengkapkan tajuk dan kandungan pengumuman.');
      return;
    }

    if (editingId) {
      await updateAnnouncement(editingId, {
        title: formTitle,
        category: formCategory,
        summary: formSummary,
        content: formContent,
        author: formAuthor,
        pinned: formPinned,
        status: formStatus,
        imageUrl: formImage || undefined,
        attachmentName: formAttachmentName.trim() || undefined,
        attachmentUrl: formAttachmentUrl.trim() || undefined,
      });
    } else {
      await createAnnouncement({
        title: formTitle,
        category: formCategory,
        summary: formSummary || formContent.slice(0, 150) + '...',
        content: formContent,
        author: formAuthor || 'Sekretariat MPGBSIM',
        date: new Date().toISOString().split('T')[0],
        pinned: formPinned,
        status: formStatus,
        imageUrl: formImage || undefined,
        attachmentName: formAttachmentName.trim() || undefined,
        attachmentUrl: formAttachmentUrl.trim() || undefined,
      });
    }
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5" />
            Warta Rasmi & Edaran
          </div>
          <h1 className="text-2xl font-black text-slate-900">Pusat Pengumuman & Pekeliling</h1>
          <p className="text-xs text-slate-500 mt-1">
            Siaran pekeliling dasar, ketetapan mesyuarat, peluang geran dan makluman penting untuk PGB.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Cipta Pengumuman Baharu
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
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
              placeholder="Cari tajuk atau isi pengumuman..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className={`rounded-3xl bg-white border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
              ann.pinned ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
            }`}
          >
            {/* Announcement Banner Image if available */}
            {ann.imageUrl && (
              <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                  {ann.category}
                </span>
              </div>
            )}

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  {!ann.imageUrl && (
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
                  )}
                  {ann.pinned && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                      Disematkan
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="font-bold text-base text-slate-900 hover:text-teal-900 leading-snug cursor-pointer line-clamp-2"
                >
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {ann.summary || ann.content}
                </p>

                {(ann.attachmentName || ann.attachmentUrl) && (
                  <div className="mt-3 p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-teal-800 shrink-0" />
                      <span className="text-[11px] font-semibold text-teal-950 truncate">
                        {ann.attachmentName || 'Dokumen Lampiran Rasmi'}
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

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {new Date(ann.date).toLocaleDateString('ms-MY', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {canManage && (
                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                      title="Sunting"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAnnouncement(ann)}
                    className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5"
                  >
                    Baca Penuh <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedAnnouncements.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">Tiada pengumuman ditemui</h3>
          <p className="text-xs text-slate-500 mt-1">Cuba tukar kata kunci carian atau pilih kategori lain.</p>
        </div>
      )}

      {/* Read Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                {selectedAnnouncement.category}
              </span>
              {selectedAnnouncement.pinned && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Warta Utama
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {selectedAnnouncement.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span>Dikeluarkan oleh: <strong className="text-slate-800">{selectedAnnouncement.author}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Tarikh: {selectedAnnouncement.date}</span>
              </div>
            </div>

            {selectedAnnouncement.imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}

            <div className="mt-5 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
              {selectedAnnouncement.content}
            </div>

            {(selectedAnnouncement.attachmentName || selectedAnnouncement.attachmentUrl) && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-6 h-6 text-teal-800 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {selectedAnnouncement.attachmentName || 'Dokumen Lampiran Rasmi PDF'}
                    </div>
                    <span className="text-[10px] text-slate-500">Dokumen Lampiran Rasmi PDF (Google Drive)</span>
                  </div>
                </div>
                <a
                  href={getAnnouncementDownloadUrl(selectedAnnouncement)}
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
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin/Media AJK Add/Edit Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4">
              {editingId ? 'Sunting Pengumuman' : 'Cipta Pengumuman Baharu'}
            </h2>

            <form onSubmit={handleSubmitEditor} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tajuk Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Mesyuarat Pimpinan Kebangsaan Bil. 4/2026"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  >
                    <option value="Rasmi">Rasmi</option>
                    <option value="Mesyuarat">Mesyuarat</option>
                    <option value="Program">Program</option>
                    <option value="Kebajikan">Kebajikan</option>
                    <option value="Peluang">Peluang</option>
                    <option value="Penting">Penting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penulis / Biro *</label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ringkasan Pendek (Summary)</label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Keterangan ringkas untuk paparan kad dashboard..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kandungan Penuh (Content) *</label>
                <textarea
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tuliskan butiran terperinci pengumuman di sini..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block font-bold text-slate-700">
                    Pautan Gambar Banner / Poster (Pilihan)
                  </label>
                  <button
                    type="button"
                    onClick={() => posterInputRef.current?.click()}
                    disabled={isUploadingPoster}
                    className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-60"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingPoster ? 'Memproses...' : 'Muat Naik Poster'}</span>
                  </button>
                </div>

                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePosterFileUpload(file);
                    if (e.target) e.target.value = '';
                  }}
                />

                {formImage ? (
                  <div className="rounded-2xl border border-teal-300 bg-teal-50/50 p-3 flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-24 h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                      <img src={formImage} alt="Pratonton Poster" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-teal-800 font-bold text-xs">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {uploadedPosterName ? `Poster: ${uploadedPosterName}` : 'Poster / Banner sedia digunakan'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => posterInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Tukar Poster</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormImage('');
                            setUploadedPosterName(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold"
                        >
                          Buang Poster
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => posterInputRef.current?.click()}
                    className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/30 p-3.5 text-center transition cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5 text-teal-700 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-700">
                      Klik untuk Muat Naik Poster / Gambar Banner dari peranti
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PNG, JPG atau WebP (Atau tampal pautan URL gambar di bawah)
                    </p>
                  </div>
                )}

                <input
                  type="text"
                  value={formImage.startsWith('data:image') ? '' : formImage}
                  onChange={(e) => {
                    setUploadedPosterName(null);
                    setFormImage(e.target.value);
                  }}
                  placeholder={
                    formImage.startsWith('data:image')
                      ? 'Poster telah dimuat naik dari peranti (atau tampal URL di sini untuk ganti)...'
                      : 'Atau tampal pautan URL Gambar Banner / Poster (https://...)'
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Fail Lampiran (Pilihan)</label>
                  <input
                    type="text"
                    value={formAttachmentName}
                    onChange={(e) => setFormAttachmentName(e.target.value)}
                    placeholder="Contoh: Surat_Jemputan_Mesyuarat.pdf"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pautan Google Drive / Dokumen (Pilihan)</label>
                  <input
                    type="url"
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Sematkan ke atas (Pinned Announcement)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Adakah anda pasti mahu memadam pengumuman ini?')) {
                        deleteAnnouncement(editingId);
                        setIsEditorOpen(false);
                      }
                    }}
                    className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Padam
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 font-bold text-white shadow-xs"
                  >
                    {editingId ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
