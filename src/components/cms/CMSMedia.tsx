import React, { useState } from 'react';
import { useAdminContent } from '../../context/AdminContentContext';
import { MediaItem } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { Layers, Plus, Edit2, Trash2, Save, X, CheckCircle, Image as ImageIcon, Video, Upload, ExternalLink } from 'lucide-react';

export const CMSMedia: React.FC = () => {
  const { siteData, addMedia, updateMedia, deleteMedia } = useAdminContent();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<MediaItem>>({
    title: '',
    type: 'photo',
    thumbnailUrl: '',
    videoUrl: '',
    caption: '',
    date: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
    location: 'Kuala Lumpur',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        showToast('Mengoptimumkan fail gambar...');
        const compressed = await compressImageFile(file, 1280, 1280, 0.82);
        setForm((prev) => ({
          ...prev,
          thumbnailUrl: compressed,
        }));
        showToast('Gambar media berjaya dioptimumkan & dimuat naik!');
      } catch (err) {
        console.warn('Gagal memampat fail media:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const res = event.target.result as string;
            setForm((prev) => ({
              ...prev,
              thumbnailUrl: res,
            }));
            showToast('Gambar media berjaya dimuat naik!');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleEdit = (item: MediaItem) => {
    setForm({ ...item });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.thumbnailUrl?.trim()) {
      showToast('Sila masukkan tajuk dan pautan imej thumbnail media.');
      return;
    }

    if (editingId) {
      updateMedia(editingId, {
        title: form.title,
        type: form.type || 'photo',
        thumbnailUrl: form.thumbnailUrl,
        videoUrl: form.type === 'video' ? form.videoUrl : undefined,
        caption: form.caption || '',
        date: form.date || new Date().toLocaleDateString('ms-MY'),
        location: form.location || 'Malaysia',
      });
      showToast('Media berjaya dikemaskini!');
      setEditingId(null);
    } else {
      const newItem: MediaItem = {
        id: `media-${Date.now()}`,
        title: form.title,
        type: form.type || 'photo',
        thumbnailUrl: form.thumbnailUrl,
        videoUrl: form.type === 'video' ? form.videoUrl : undefined,
        caption: form.caption || '',
        date: form.date || new Date().toLocaleDateString('ms-MY'),
        location: form.location || 'Malaysia',
      };
      addMedia(newItem);
      showToast('Media baharu berjaya ditambah!');
    }

    setIsAdding(false);
    setForm({
      title: '',
      type: 'photo',
      thumbnailUrl: '',
      videoUrl: '',
      caption: '',
      date: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
      location: 'Kuala Lumpur',
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadam media: "${title}"?`)) {
      deleteMedia(id);
      showToast('Media telah dipadam daripada galeri.');
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
            <Layers className="w-5 h-5 text-teal-700" />
            <h3 className="text-lg font-extrabold text-slate-900">
              Pengurusan Galeri & Multimedia ({siteData.media?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Uruskan koleksi foto rasmi, liputan video, tarikh, penerangan dan lokasi aktiviti kepimpinan PGB.
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
                type: 'photo',
                thumbnailUrl: '',
                videoUrl: '',
                caption: '',
                date: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
                location: 'Kuala Lumpur',
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
              <span>Tambah Media Baharu</span>
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
            <span>{editingId ? 'Kemaskini Butiran Media' : 'Tambah Media Baharu ke Galeri'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tajuk Media / Aktiviti <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Majlis Perasmian Konvensyen Kepimpinan Sekolah Islam Kebangsaan 2026"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jenis Media
              </label>
              <select
                value={form.type || 'photo'}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'photo' | 'video' })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-medium"
              >
                <option value="photo">Foto / Gambar (Galeri)</option>
                <option value="video">Video (Liputan / Rakaman)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lokasi Aktiviti
              </label>
              <input
                type="text"
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Contoh: Putrajaya International Convention Centre (PICC)"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tarikh Peristiwa
              </label>
              <input
                type="text"
                value={form.date || ''}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="Contoh: 15 Mac 2026"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Muat Naik Fail Foto
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pilih Fail Imej</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <span className="text-[11px] text-slate-500">Maks 3MB</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pautan Imej Thumbnail / Gambar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.thumbnailUrl || ''}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... atau fail yang dimuat naik"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-mono"
              />
            </div>

            {form.type === 'video' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pautan Video (YouTube / MP4)
                </label>
                <input
                  type="text"
                  value={form.videoUrl || ''}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... atau https://..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-mono"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Keterangan / Kapsyen Ringkas
              </label>
              <textarea
                rows={2}
                value={form.caption || ''}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                placeholder="Ringkasan peristiwa atau aktiviti kepimpinan yang dirakamkan..."
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
              <span>{editingId ? 'Kemaskini Media' : 'Simpan Media'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid of media items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(siteData.media || []).map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-teal-300 transition-all flex flex-col"
          >
            <div className="relative h-36 bg-slate-900">
              <img
                src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600'}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600';
                }}
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                {item.type === 'video' ? <Video className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-teal-300" />}
                <span className="capitalize">{item.type}</span>
              </span>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.date} • {item.location}</p>
                {item.caption && (
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{item.caption}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={item.videoUrl || item.thumbnailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-teal-700 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Lihat</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="p-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                    title="Sunting"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Padam"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
