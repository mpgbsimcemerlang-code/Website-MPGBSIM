import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Edit3,
  Trash2,
  X,
  FileText,
  Calendar,
  User,
  CheckCircle,
  Eye,
  AlertCircle,
  Save,
  Send,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { AnnouncementItem } from '../../types';

export const AdminAnnouncementsManagement: React.FC = () => {
  const {
    announcements: portalAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useMemberPortal();
  const { siteData } = useAdminContent();

  // Unified list of announcements from portal & siteData
  const announcementsList: AnnouncementItem[] = React.useMemo(() => {
    const map = new Map<string, AnnouncementItem>();
    (siteData.announcements || []).forEach((a) => map.set(a.id, a));
    (portalAnnouncements || []).forEach((a) => map.set(a.id, a));
    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });
    return list;
  }, [siteData.announcements, portalAnnouncements]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  // Modal editor states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<AnnouncementItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<AnnouncementItem['category']>('Rasmi');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('Sekretariat Utama MPGBSIM');
  const [formAuthorRole, setFormAuthorRole] = useState('Urus Setia Kebangsaan');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPinned, setFormPinned] = useState(false);
  const [formStatus, setFormStatus] = useState<AnnouncementItem['status']>('published');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ['Semua', 'Rasmi', 'Mesyuarat', 'Program', 'Kebajikan', 'Peluang', 'Penting'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAnnouncements = announcementsList.filter((item) => {
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchStatus =
      selectedStatus === 'Semua' ||
      (selectedStatus === 'published' && (item.status === 'published' || !item.status)) ||
      item.status === selectedStatus;
    const matchQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStatus && matchQuery;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('Rasmi');
    setFormSummary('');
    setFormContent('');
    setFormAuthor('Sekretariat Utama MPGBSIM');
    setFormAuthorRole('Urus Setia Kebangsaan');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPinned(false);
    setFormStatus('published');
    setFormImageUrl('');
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormSummary(item.summary);
    setFormContent(item.content);
    setFormAuthor(item.author);
    setFormAuthorRole(item.authorRole || 'Urus Setia Kebangsaan');
    setFormDate(item.date || new Date().toISOString().split('T')[0]);
    setFormPinned(item.pinned || false);
    setFormStatus(item.status || 'published');
    setFormImageUrl(item.imageUrl || '');
    setFormAttachmentName(item.attachmentName || '');
    setFormAttachmentUrl(item.attachmentUrl || '');
    setIsEditorOpen(true);
  };

  const handleTogglePin = async (item: AnnouncementItem) => {
    try {
      await updateAnnouncement(item.id, { pinned: !item.pinned });
      showToast(item.pinned ? 'Pengumuman unpinned daripada atas portal.' : 'Pengumuman berjaya disematkan di atas portal!');
    } catch (e: any) {
      alert('Ralat mengemas kini status pin: ' + e.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadam pengumuman/pekeliling ini?\n\n"${title}"`)) {
      try {
        await deleteAnnouncement(id);
        showToast('Pengumuman telah berjaya dipadam secara kekal.');
      } catch (e: any) {
        alert('Ralat memadam pengumuman: ' + e.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Sila masukkan sekurang-kurangnya tajuk dan kandungan pengumuman.');
      return;
    }

    const payload: Partial<AnnouncementItem> = {
      title: formTitle.trim(),
      category: formCategory,
      summary: formSummary.trim() || formContent.trim().slice(0, 150) + '...',
      content: formContent.trim(),
      author: formAuthor.trim() || 'Sekretariat Utama MPGBSIM',
      authorRole: formAuthorRole.trim() || undefined,
      date: formDate,
      pinned: formPinned,
      status: formStatus,
      imageUrl: formImageUrl.trim() || undefined,
      attachmentName: formAttachmentName.trim() || undefined,
      attachmentUrl: formAttachmentUrl.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateAnnouncement(editingId, payload);
        showToast('Pengumuman / pekeliling berjaya dikemaskini!');
      } else {
        await createAnnouncement(payload as Omit<AnnouncementItem, 'id'>);
        showToast('Pengumuman / pekeliling baharu berjaya diterbitkan ke Portal Ahli!');
      }
      setIsEditorOpen(false);
    } catch (e: any) {
      alert('Ralat menyimpan pengumuman: ' + e.message);
    }
  };

  const totalPinned = announcementsList.filter((a) => a.pinned).length;
  const totalPublished = announcementsList.filter((a) => a.status === 'published' || !a.status).length;
  const totalDrafts = announcementsList.filter((a) => a.status === 'draft').length;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg font-bold text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Megaphone className="w-3.5 h-3.5 text-amber-700" />
            Pusat Kawalan Pengumuman & Pekeliling Ahli
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Pengurusan Pengumuman & Pekeliling Portal Ahli PGB
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cipta, kemaskini, pin, atau padam pengumuman rasmi, pekeliling, dan warta yang disiarkan terus ke Portal Ahli Pengetua & Guru Besar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Cipta Pengumuman / Pekeliling Baharu</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
          <div className="text-[11px] font-bold text-teal-800 uppercase">Jumlah Pengumuman</div>
          <div className="text-2xl font-black text-teal-950 tabular-nums">{announcementsList.length}</div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="text-[11px] font-bold text-amber-800 uppercase">Disematkan di Atas (Pinned)</div>
          <div className="text-2xl font-black text-amber-950 tabular-nums">{totalPinned}</div>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="text-[11px] font-bold text-emerald-800 uppercase">Terbit (Dilihat Ahli)</div>
          <div className="text-2xl font-black text-emerald-950 tabular-nums">{totalPublished}</div>
        </div>
        <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl">
          <div className="text-[11px] font-bold text-slate-700 uppercase">Simpanan Draf</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">{totalDrafts}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Categories Tab */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2 min-w-[280px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="published">Terbit (Published)</option>
              <option value="draft">Draf (Draft)</option>
            </select>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pengumuman..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">Tiada pengumuman ditemui.</p>
            <p>Klik &ldquo;Cipta Pengumuman / Pekeliling Baharu&rdquo; untuk mula menerbitkan maklumat rasmi kepada ahli PGB.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredAnnouncements.map((item) => {
              const isPinned = item.pinned;
              const isDraft = item.status === 'draft';

              return (
                <div
                  key={item.id}
                  className={`p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                    isPinned ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Image / Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Megaphone className="w-6 h-6 text-teal-700" />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isPinned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 flex items-center gap-1 shadow-2xs">
                            <Pin className="w-3 h-3 fill-slate-950" />
                            Disematkan (Pinned)
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                          {item.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDraft ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {isDraft ? 'Draf' : 'Terbit'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.date}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.summary}</p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {item.author} {item.authorRole ? `(${item.authorRole})` : ''}
                        </span>
                        {item.attachmentName && (
                          <span className="flex items-center gap-1 text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            <FileText className="w-3.5 h-3.5 text-teal-700" />
                            Lampiran: {item.attachmentName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Preview */}
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition cursor-pointer"
                      title="Lihat Pratonton"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Toggle Pin */}
                    <button
                      type="button"
                      onClick={() => handleTogglePin(item)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        item.pinned
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                      title={item.pinned ? 'Nyah-semat (Unpin)' : 'Sematkan ke Atas Portal (Pin)'}
                    >
                      <Pin className={`w-4 h-4 ${item.pinned ? 'fill-slate-950' : ''}`} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl border border-teal-200 transition cursor-pointer"
                      title="Sunting Pengumuman"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition cursor-pointer"
                      title="Padam Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal (Create / Edit) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-teal-800" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editingId ? 'Sunting Pengumuman / Pekeliling' : 'Cipta Pengumuman / Pekeliling Baharu'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Tajuk Pengumuman / Pekeliling *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="cth: Pekeliling Amalan Transformasi AI Generatif Bagi Sekolah Islam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 outline-none text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 outline-none text-xs font-semibold bg-white"
                  >
                    <option value="Rasmi">Rasmi</option>
                    <option value="Mesyuarat">Mesyuarat</option>
                    <option value="Program">Program</option>
                    <option value="Kebajikan">Kebajikan</option>
                    <option value="Peluang">Peluang</option>
                    <option value="Penting">Penting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penulis / Penerbit</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Sekretariat Utama MPGBSIM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peranan Penulis</label>
                  <input
                    type="text"
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    placeholder="Urus Setia Kebangsaan / Biro Media"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarikh Penerbitan</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinned-checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="pinned-checkbox" className="font-bold text-amber-950 cursor-pointer">
                    Sematkan di Atas Portal (Pin to Top)
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Penerbitan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 outline-none text-xs font-bold bg-white"
                  >
                    <option value="published">Diterbitkan (Terbit di Portal Ahli)</option>
                    <option value="draft">Simpan Draf (Belum Siar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ringkasan / Abstrak (Summary)</label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Ringkasan 1-2 ayat yang akan dipaparkan pada kad pengumuman..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kandungan Penuh Pengumuman / Pekeliling *</label>
                <textarea
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tuliskan isi penuh kenyataan rasmi, agenda mesyuarat, atau ketetapan pekeliling..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pautan Dokumen / Pekeliling (Google Drive / PDF Link)</label>
                  <input
                    type="url"
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-teal-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Fail Lampiran</label>
                  <input
                    type="text"
                    value={formAttachmentName}
                    onChange={(e) => setFormAttachmentName(e.target.value)}
                    placeholder="Pekeliling_MPGBSIM_Bil_2_2026.pdf"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pautan Gambar Banner / Poster (Pilihan)</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{editingId ? 'Kemaskini Pengumuman' : 'Terbitkan Pengumuman Baharu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-900">
                  {previewItem.category}
                </span>
                {previewItem.pinned && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-slate-950" />
                    Pinned
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewItem.imageUrl && (
              <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200">
                <img src={previewItem.imageUrl} alt={previewItem.title} className="w-full h-full object-cover" />
              </div>
            )}

            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{previewItem.title}</h3>

            <div className="flex items-center gap-4 text-xs text-slate-500 border-y border-slate-100 py-2">
              <span>Tarikh: <strong>{previewItem.date}</strong></span>
              <span>Penerbit: <strong>{previewItem.author}</strong></span>
            </div>

            <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {previewItem.content}
            </div>

            {previewItem.attachmentUrl && (
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-teal-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  {previewItem.attachmentName || 'Dokumen Pekeliling'}
                </span>
                <a
                  href={previewItem.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun Fail</span>
                </a>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Tutup Pratonton
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
