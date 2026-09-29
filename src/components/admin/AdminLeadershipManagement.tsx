import React, { useState, useRef } from 'react';
import { useAdminContent } from '../../context/AdminContentContext';
import { LeaderProfile } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle,
  MoveUp,
  MoveDown,
  Search,
  Camera,
  Upload,
  MapPin,
  Building,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminLeadershipManagement: React.FC = () => {
  const { siteData, addLeader, updateLeader, deleteLeader, reorderLeaders } = useAdminContent();
  const leaders = siteData.leadership || [];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<LeaderProfile>>({
    name: '',
    role: 'Ahli Jawatankuasa Kebangsaan',
    subRole: '',
    institution: '',
    state: 'Selangor',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const processAndSetImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Sila pilih fail imej yang sah (JPG, PNG, JPEG, WEBP).');
      return;
    }

    setIsProcessingPhoto(true);
    try {
      // Compress and optimize to high quality portrait WebP/JPEG under ~80KB
      const optimizedDataUrl = await compressImageFile(file, 800, 1000, 0.85);
      setForm((prev) => ({ ...prev, avatarUrl: optimizedDataUrl }));
      showToast('Foto profil tokoh berjaya dimuat naik & sedia disimpan!');
    } catch (err) {
      console.warn('Canvas optimization fallback to FileReader:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        showToast('Foto profil tokoh berjaya dimuat naik!');
      };
      reader.onerror = () => {
        showToast('Ralat membaca fail gambar. Sila cuba lagi.');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndSetImage(file);
    }
    // Reset file input value so user can re-select same file if desired
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleEdit = (item: LeaderProfile) => {
    setForm({
      ...item,
      term: item.term || 'Penggal 2026–2028',
      category: item.category || 'Kepimpinan Utama',
      avatarUrl: item.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    });
    setEditingId(item.id);
    setIsAdding(true);
    setShowUrlInput(false);
  };

  const handleAddNew = () => {
    setForm({
      name: '',
      role: 'Ahli Jawatankuasa Kebangsaan',
      subRole: '',
      institution: 'Sekolah Ahli MPGBSIM',
      state: 'Selangor',
      term: 'Penggal 2026–2028',
      category: 'Kepimpinan Utama',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    });
    setEditingId(null);
    setIsAdding(true);
    setShowUrlInput(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      showToast('Sila masukkan nama penuh tokoh kepimpinan.');
      return;
    }
    if (!form.role?.trim()) {
      showToast('Sila masukkan jawatan tokoh dalam majlis.');
      return;
    }

    setIsSaving(true);
    try {
      const finalAvatar = form.avatarUrl?.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
      const finalTerm = form.term?.trim() || 'Penggal 2026–2028';
      const finalCategory = form.category?.trim() || 'Kepimpinan Utama';
      const finalInstitution = form.institution?.trim() || 'Sekolah Ahli MPGBSIM';
      const finalState = form.state?.trim() || 'Selangor';

      if (editingId) {
        await updateLeader(editingId, {
          name: form.name.trim(),
          role: form.role.trim(),
          subRole: form.subRole?.trim() || '',
          institution: finalInstitution,
          state: finalState,
          term: finalTerm,
          category: finalCategory,
          avatarUrl: finalAvatar,
        });
        showToast(`Maklumat ${form.name.trim()} berjaya dikemaskini!`);
      } else {
        const newLeader: LeaderProfile = {
          id: `ldr-${Date.now()}`,
          name: form.name.trim(),
          role: form.role.trim(),
          subRole: form.subRole?.trim() || '',
          institution: finalInstitution,
          state: finalState,
          term: finalTerm,
          category: finalCategory,
          avatarUrl: finalAvatar,
        };
        await addLeader(newLeader);
        showToast(`Tokoh kepimpinan ${form.name.trim()} berjaya ditambah & disimpan!`);
      }

      setIsAdding(false);
      setEditingId(null);
    } catch (err: any) {
      console.error('Error saving leader:', err);
      showToast('Ralat semasa menyimpan maklumat tokoh.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteLeader(id);
    setConfirmDeleteId(null);
    showToast(`Tokoh kepimpinan "${name}" telah dipadam.`);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= leaders.length) return;

    const newArr = [...leaders];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    await reorderLeaders(newArr);
    showToast('Susunan urutan tokoh berjaya dikemaskini!');
  };

  const filteredLeaders = leaders.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Alert */}
      {toast && (
        <div className="p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600/50 text-teal-200 text-xs font-semibold mb-2">
            <Users className="w-4 h-4 text-teal-300" />
            <span>Modul CMS Saf Kepimpinan ({leaders.length} Tokoh)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Pengurusan Barisan Kepimpinan Tertinggi MPGBSIM
          </h2>
          <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
            Tambah, sunting peranan, institusi, kelayakan, foto profil serta susun urutan paparan tokoh pada halaman utama laman web.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tokoh Pemimpin</span>
        </button>
      </div>

      {/* Add / Edit Form Modal Drawer */}
      {isAdding && (
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border-2 border-teal-600 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              <span>{editingId ? 'Kemaskini Maklumat Tokoh' : 'Daftar Tokoh Kepimpinan Baharu'}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Penuh & Gelaran
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="cth: Dato' Seri Ustaz Hj. Kamaruddin bin Mohamad"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jawatan Utama Dalam Majlis
              </label>
              <input
                type="text"
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="cth: Yang Dipertua Kebangsaan / Timbalan YDP"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-semibold text-teal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Portfolio / Sub-Jawatan (Pilihan)
              </label>
              <input
                type="text"
                value={form.subRole || ''}
                onChange={(e) => setForm({ ...form, subRole: e.target.value })}
                placeholder="cth: Pengerusi Jawatankuasa Hal Ehwal Kurikulum"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Institusi / Sekolah Semasa
              </label>
              <input
                type="text"
                value={form.institution || ''}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                placeholder="cth: SMKA Maahad Muar / SRI Al-Amin Bangi"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Negeri
              </label>
              <input
                type="text"
                value={form.state || ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="cth: Johor / Selangor / Kedah"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            {/* Sesi Penggal Kepimpinan (cth: Penggal 2026-2028) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Penggal / Sesi Kepimpinan
              </label>
              <input
                type="text"
                value={form.term || 'Penggal 2026–2028'}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                placeholder="cth: Penggal 2026–2028"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-semibold text-slate-800"
              />
            </div>

            {/* Kategori Kepimpinan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori Kepimpinan
              </label>
              <select
                value={form.category || 'Kepimpinan Utama'}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-semibold text-slate-800"
              >
                <option value="Kepimpinan Utama">Kepimpinan Utama</option>
                <option value="Exco Kebangsaan">Exco Kebangsaan</option>
                <option value="Pengerusi Biro">Pengerusi Biro</option>
                <option value="Penasihat Kehormat">Penasihat Kehormat</option>
              </select>
            </div>

            {/* Foto Profil Tokoh - Gambar Besar & Boleh Upload Terus (Bukan Guna Pautan URL) */}
            <div className="md:col-span-2 pt-3 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-700" />
                <span>Foto Profil Tokoh (Gambar Besar Wajah Jelas & Boleh Upload Terus)</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-3">
                Muat naik gambar foto profil tokoh terus dari komputer atau telefon anda. Foto akan dipaparkan bersaiz besar dan jelas pada saf kepimpinan.
              </p>

              {/* Hidden Native File Input with programmatic ref for 100% reliable mobile & desktop file picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handlePhotoUpload}
                className="sr-only pointer-events-none"
                aria-hidden="true"
                tabIndex={-1}
              />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-slate-50 border border-teal-200">
                {/* Large Portrait Preview - Gambar Besar (Boleh Klik / Sentuh Untuk Upload) */}
                <div
                  onClick={() => !isProcessingPhoto && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processAndSetImage(file);
                  }}
                  className="relative w-40 h-52 sm:w-48 sm:h-64 rounded-2xl overflow-hidden border-2 border-dashed border-teal-600 hover:border-teal-400 shadow-md bg-slate-100 shrink-0 flex items-center justify-center cursor-pointer group transition-all"
                  title="Klik untuk memilih foto dari komputer atau telefon"
                >
                  {isProcessingPhoto ? (
                    <div className="text-center p-3 text-teal-800">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-700" />
                      <span className="text-xs font-bold block">Memproses Foto...</span>
                      <span className="text-[10px] text-slate-500 block">Mengoptimumkan gambar</span>
                    </div>
                  ) : form.avatarUrl && form.avatarUrl.trim() ? (
                    <>
                      <img
                        src={form.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'}
                        alt={form.name || 'Pratonton Tokoh'}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                      {/* Hover / Touch Overlay */}
                      <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-3 text-center">
                        <Upload className="w-6 h-6 text-amber-300 mb-1" />
                        <span className="text-xs font-bold">Tukar Foto</span>
                        <span className="text-[10px] text-slate-200">Klik untuk pilih fail baru</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-3 text-slate-400 group-hover:text-teal-700 transition-colors">
                      <Camera className="w-10 h-10 mx-auto mb-1 text-teal-600/70" />
                      <span className="text-xs font-bold text-teal-900 block">Klik / Sentuh Foto</span>
                      <span className="text-[10px] text-slate-500 block">Pilih dari telefon / komputer</span>
                    </div>
                  )}

                  {!isProcessingPhoto && (
                    <span className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-center text-amber-300 font-bold backdrop-blur-xs pointer-events-none">
                      Wajah Tokoh Jelas
                    </span>
                  )}
                </div>

                {/* Upload Controls & Actions */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-800 block">
                      Pilih Fail Imej Dari Komputer / Telefon:
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Format: JPG, PNG, WEBP. Gambar akan dioptimumkan secara automatik agar bersaiz ringan dan berkualiti tinggi.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Explicit Button Triggering Native File Picker */}
                    <button
                      type="button"
                      disabled={isProcessingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPhoto ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      ) : (
                        <Upload className="w-4 h-4 text-amber-300" />
                      )}
                      <span>
                        {isProcessingPhoto
                          ? 'Sedang Memproses...'
                          : form.avatarUrl
                          ? 'Tukar / Upload Foto Baru'
                          : 'Pilih & Upload Foto Tokoh'}
                      </span>
                    </button>

                    {form.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, avatarUrl: '' }))}
                        className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Padam Foto</span>
                      </button>
                    )}
                  </div>

                  {/* Optional URL Toggle / Fallback if needed */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] text-teal-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showUrlInput ? '▼ Sembunyikan Input URL' : '► Pilihan: Masukkan Pautan URL Gambar'}</span>
                    </button>

                    {showUrlInput && (
                      <div className="mt-2 animate-in fade-in">
                        <input
                          type="url"
                          value={form.avatarUrl || ''}
                          onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Maklumat Tokoh'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search Bar & Counter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tokoh mengikut nama, jawatan, sekolah atau negeri..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 shrink-0">
          Memaparkan {filteredLeaders.length} daripada {leaders.length} tokoh
        </div>
      </div>

      {/* Leaders List with Large Clear Portrait Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeaders.map((leader, index) => (
          <div
            key={leader.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start gap-4 mb-3">
                {/* Large Portrait Preview for Leader Card */}
                <div
                  onClick={() => handleEdit(leader)}
                  className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-teal-700/40 shrink-0 bg-slate-100 shadow-sm cursor-pointer hover:border-teal-500 hover:shadow-md transition-all relative group/img"
                  title="Klik untuk sunting atau tukar foto tokoh"
                >
                  <img
                    src={leader.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'}
                    alt={leader.name}
                    className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold p-1 text-center">
                    <Camera className="w-4 h-4 mb-0.5 text-amber-300" />
                    <span>Tukar Foto</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block bg-teal-50 px-2 py-0.5 rounded-md self-start inline-block">
                      {leader.role}
                    </span>

                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30"
                        title="Alih ke atas"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === leaders.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30"
                        title="Alih ke bawah"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                    {leader.name}
                  </h4>
                  {leader.subRole && (
                    <p className="text-[11px] text-amber-700 font-semibold mt-0.5 line-clamp-1">
                      {leader.subRole}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="truncate">{leader.institution}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Negeri {leader.state}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    {leader.category || 'Kepimpinan Utama'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {leader.term || 'Penggal 2026–2028'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons or Inline Delete Confirmation */}
            {confirmDeleteId === leader.id ? (
              <div className="mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center animate-in fade-in">
                <p className="text-[11px] text-rose-800 font-bold mb-2">Padam tokoh ini?</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(leader.id, leader.name)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition cursor-pointer"
                  >
                    Ya, Padam
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleEdit(leader)}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sunting</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(leader.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Padam</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
