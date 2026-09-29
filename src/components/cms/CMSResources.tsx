import React, { useState } from 'react';
import { useAdminContent } from '../../context/AdminContentContext';
import { ResourceDocument } from '../../types';
import { BookMarked, Plus, Edit2, Trash2, Save, X, CheckCircle, FileText, Download, FileCheck } from 'lucide-react';

export const CMSResources: React.FC = () => {
  const { siteData, addResource, updateResource, deleteResource } = useAdminContent();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<ResourceDocument>>({
    title: '',
    category: 'Pekeliling',
    fileFormat: 'PDF',
    fileSize: '2.4 MB',
    publishedDate: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
    downloads: 150,
    description: '',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (item: ResourceDocument) => {
    setForm({ ...item });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.description?.trim()) {
      showToast('Sila lengkapkan tajuk dan penerangan dokumen.');
      return;
    }

    if (editingId) {
      updateResource(editingId, {
        title: form.title,
        category: (form.category as any) || 'Pekeliling',
        fileFormat: form.fileFormat || 'PDF',
        fileSize: form.fileSize || '1.5 MB',
        publishedDate: form.publishedDate || new Date().toLocaleDateString('ms-MY'),
        downloads: Number(form.downloads) || 100,
        description: form.description,
      });
      showToast('Dokumen sumber berjaya dikemaskini!');
      setEditingId(null);
    } else {
      const newItem: ResourceDocument = {
        id: `res-${Date.now()}`,
        title: form.title,
        category: (form.category as any) || 'Pekeliling',
        fileFormat: form.fileFormat || 'PDF',
        fileSize: form.fileSize || '1.5 MB',
        publishedDate: form.publishedDate || new Date().toLocaleDateString('ms-MY'),
        downloads: Number(form.downloads) || 1,
        description: form.description,
      };
      addResource(newItem);
      showToast('Dokumen sumber baharu berjaya diterbitkan!');
    }

    setIsAdding(false);
    setForm({
      title: '',
      category: 'Pekeliling',
      fileFormat: 'PDF',
      fileSize: '2.4 MB',
      publishedDate: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
      downloads: 150,
      description: '',
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadam dokumen: "${title}"?`)) {
      deleteResource(id);
      showToast('Dokumen sumber telah dipadam.');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-teal-700" />
            <h3 className="text-lg font-extrabold text-slate-900">
              Pusat Sumber, Pekeliling & Modul ({siteData.resources?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Muat naik, sunting dan susun garis panduan, pekeliling rasmi, modul kepimpinan dan bahan rujukan PGB.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingId(null);
            } else {
              setEditingId(null);
              setForm({
                title: '',
                category: 'Pekeliling',
                fileFormat: 'PDF',
                fileSize: '2.4 MB',
                publishedDate: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
                downloads: 150,
                description: '',
              });
              setIsAdding(true);
            }
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer ${
            isAdding ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-teal-800 hover:bg-teal-900 text-white'
          }`}
        >
          {isAdding ? (
            <>
              <X className="w-4 h-4" />
              <span>Tutup Borang</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Daftar Dokumen Baharu</span>
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-4">
          <h4 className="text-sm font-extrabold text-teal-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-teal-800 text-white flex items-center justify-center text-xs">
              {editingId ? '✏️' : '+'}
            </span>
            <span>{editingId ? 'Kemaskini Butiran Dokumen' : 'Daftar Dokumen Sumber Baharu'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tajuk Dokumen / Pekeliling <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Garis Panduan Pelaksanaan AI Beretika di Sekolah-Sekolah Islam Malaysia 2026"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori Dokumen
              </label>
              <select
                value={form.category || 'Pekeliling'}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-medium"
              >
                <option value="Pekeliling">Pekeliling</option>
                <option value="Garis Panduan">Garis Panduan</option>
                <option value="Modul Kepimpinan">Modul Kepimpinan</option>
                <option value="Kertas Dasar">Kertas Dasar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Format Fail
              </label>
              <select
                value={form.fileFormat || 'PDF'}
                onChange={(e) => setForm({ ...form, fileFormat: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              >
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX (Word)</option>
                <option value="PPTX">PPTX (Powerpoint)</option>
                <option value="XLSX">XLSX (Excel)</option>
                <option value="ZIP">ZIP (Pakej Lengkap)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Saiz Fail (Anggaran)
              </label>
              <input
                type="text"
                value={form.fileSize || ''}
                onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                placeholder="Contoh: 3.2 MB"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tarikh Diterbitkan
              </label>
              <input
                type="text"
                value={form.publishedDate || ''}
                onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
                placeholder="Contoh: 12 Februari 2026"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Huraian & Skop Dokumen <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Huraikan kegunaan, pematuhan dan intipati dokumen ini untuk Pengetua dan Guru Besar..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-teal-200/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Kemaskini Dokumen' : 'Terbitkan Dokumen'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid of resource items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(siteData.resources || []).map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all flex flex-col justify-between shadow-2xs space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
                  {doc.category}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {doc.fileFormat} • {doc.fileSize}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">{doc.title}</h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{doc.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Diterbitkan: {doc.publishedDate}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(doc)}
                  className="p-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                  title="Sunting Dokumen"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Padam Dokumen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
