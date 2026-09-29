import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Lock,
  Plus,
  Trash2,
  X,
  FileCheck,
  CheckCircle,
  Shield,
  Clock,
  User,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { PortalDocument } from '../../types';

export const PortalDocuments: React.FC = () => {
  const { documents, currentRole, addDocument, deleteDocument, currentUser } = useMemberPortal();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Admin upload modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PortalDocument['category']>('Dokumen MPGBSIM');
  const [newDesc, setNewDesc] = useState('');
  const [newVersion, setNewVersion] = useState('v1.0');
  const [newVisibility, setNewVisibility] = useState<PortalDocument['visibility']>('MEMBER');
  const [newFormat, setNewFormat] = useState('PDF');
  const [newSize, setNewSize] = useState('1.5 MB');

  const canManage = currentRole === 'ADMIN';

  const categories = [
    'Semua',
    'Mesyuarat',
    'Pentadbiran',
    'Program',
    'Sumber PGB',
    'AI & Digital',
    'Modul',
    'Template',
    'Dokumen MPGBSIM',
  ];

  // RBAC Document visibility rule:
  // PUBLIC documents: visible to anyone
  // MEMBER documents: visible to MEMBER, MEDIA_AJK, ADMIN
  // ADMIN documents: only visible to ADMIN
  const allowedDocuments = documents.filter((docItem) => {
    if (currentRole === 'ADMIN') return true;
    if (currentRole === 'MEMBER' || currentRole === 'MEDIA_AJK') {
      return docItem.visibility === 'PUBLIC' || docItem.visibility === 'MEMBER';
    }
    return docItem.visibility === 'PUBLIC';
  });

  const filteredDocuments = allowedDocuments.filter((docItem) => {
    const matchCat = selectedCategory === 'Semua' || docItem.category === selectedCategory;
    const matchQuery =
      docItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docItem.uploader.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleDownload = (docItem: PortalDocument) => {
    alert(`Memuat turun fail: ${docItem.title} (${docItem.fileSize})`);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addDocument({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      version: newVersion,
      fileSize: newSize,
      uploader: currentUser?.fullName || 'Sekretariat MPGBSIM',
      visibility: newVisibility,
      fileFormat: newFormat,
      uploadDate: new Date().toISOString().split('T')[0],
      downloads: 1,
    });

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Repositori Dokumen & Surat Pekeliling
          </div>
          <h1 className="text-2xl font-black text-slate-900">Pusat Dokumen Ahli (Document Centre)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Muat turun perlembagaan persatuan, instrumen audit SKSI, modul kursus dan templat kertas kerja rasmi.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            + Muat Naik Dokumen
          </button>
        )}
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
              placeholder="Cari tajuk atau penerangan dokumen..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Document Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocuments.map((docItem) => (
          <div
            key={docItem.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                  {docItem.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    docItem.visibility === 'ADMIN'
                      ? 'bg-purple-100 text-purple-900'
                      : docItem.visibility === 'MEMBER'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {docItem.visibility === 'ADMIN' ? 'Admin Sahaja' : docItem.visibility === 'MEMBER' ? 'Ahli Sahaja' : 'Awam'}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {docItem.fileFormat || 'PDF'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                    {docItem.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                    Versi: {docItem.version} • Saiz: {docItem.fileSize}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                {docItem.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] truncate max-w-[120px]">Oleh: {docItem.uploader}</span>

              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    onClick={() => {
                      if (confirm(`Padam dokumen: ${docItem.title}?`)) {
                        deleteDocument(docItem.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                    title="Padam"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDownload(docItem)}
                  className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Muat Turun
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Document Modal for Admin */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4">+ Muat Naik Dokumen Rasmi</h2>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tajuk Dokumen *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Garis Panduan Pelaksanaan Audit SKSI 2026"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  >
                    <option value="Mesyuarat">Mesyuarat</option>
                    <option value="Pentadbiran">Pentadbiran</option>
                    <option value="Program">Program</option>
                    <option value="Sumber PGB">Sumber PGB</option>
                    <option value="AI & Digital">AI & Digital</option>
                    <option value="Modul">Modul</option>
                    <option value="Template">Template</option>
                    <option value="Dokumen MPGBSIM">Dokumen MPGBSIM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterlihatan (Visibility) *</label>
                  <select
                    value={newVisibility}
                    onChange={(e) => setNewVisibility(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  >
                    <option value="MEMBER">Ahli Sahaja (MEMBER)</option>
                    <option value="PUBLIC">Awam (PUBLIC)</option>
                    <option value="ADMIN">Pentadbir Sahaja (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Penerangan Dokumen</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Tujuan dokumen, peruntukan klausa atau sasaran pengguna..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Versi</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="v1.0"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Format Fail</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="PPTX">PPTX</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Anggaran Saiz</label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="2.4 MB"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 font-bold text-white shadow-xs"
                >
                  Terbitkan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
