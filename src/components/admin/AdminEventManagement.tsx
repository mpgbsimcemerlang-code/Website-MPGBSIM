import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Send,
  CheckCircle2,
  History,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Link2,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { ProgramEvent } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

export const AdminEventManagement: React.FC = () => {
  const { siteData, addProgram, updateProgram, deleteProgram } = useAdminContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ProgramEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Poster upload state
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProgram(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error('Ralat ketika memadam acara:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const initialFormState: Omit<ProgramEvent, 'id'> = {
    title: '',
    theme: '',
    date: '2026-10-15',
    time: '8:30 Pagi - 5:00 Petang',
    venue: 'Pusat Konvensyen Antarabangsa Bangi',
    mode: 'Fizikal',
    targetAudience: 'Pengetua & Guru Besar Sekolah Islam Malaysia',
    description: '',
    spotsTotal: 150,
    spotsFilled: 0,
    registrationOpen: true,
    closingDate: '2026-10-10',
    fees: 'Percuma untuk Ahli MPGBSIM',
    posterUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
    status: 'upcoming',
  };

  const [formData, setFormData] = useState<Omit<ProgramEvent, 'id'>>(initialFormState);

  const programsList = siteData.programs || [];
  const filteredEvents = programsList.filter((item) => {
    const itemStatus = item.status || 'upcoming';
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || itemStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handlePosterFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Sila pilih fail imej yang sah (PNG, JPG, JPEG, WebP).');
      return;
    }
    setUploadError(null);
    setIsUploadingPoster(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1000, 1400, 0.85);
      setFormData((prev) => ({ ...prev, posterUrl: compressedDataUrl }));
    } catch (err) {
      console.error('Ralat memproses poster:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, posterUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setUploadError(null);
    setShowUrlFallback(false);
    setIsEditing(true);
  };

  const handleOpenEdit = (item: ProgramEvent) => {
    setFormData({
      title: item.title,
      theme: item.theme,
      date: item.date,
      time: item.time,
      venue: item.venue,
      mode: item.mode,
      targetAudience: item.targetAudience,
      description: item.description,
      spotsTotal: item.spotsTotal,
      spotsFilled: item.spotsFilled,
      registrationOpen: item.registrationOpen,
      closingDate: item.closingDate,
      fees: item.fees,
      posterUrl: item.posterUrl || '',
      status: item.status || 'upcoming',
    });
    setEditingId(item.id);
    setUploadError(null);
    setShowUrlFallback(false);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      updateProgram(editingId, formData);
    } else {
      const newId = `prog-${Date.now()}`;
      addProgram({
        ...formData,
        id: newId,
      });
    }
    setIsEditing(false);
  };

  const handleToggleUpcomingPast = (item: ProgramEvent) => {
    const currentStatus = item.status || 'upcoming';
    const nextStatus = currentStatus === 'upcoming' ? 'past' : 'upcoming';
    updateProgram(item.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Pengurusan Acara & Program</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cipta, kemas kini, tetapkan status acara akan datang atau program lepas, dan buka pendaftaran peserta.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Acara Baharu</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama acara, tema, atau tempat program..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
        >
          <option value="all">Semua Status Acara</option>
          <option value="upcoming">Akan Datang (Upcoming)</option>
          <option value="past">Telah Berlangsung (Past)</option>
          <option value="cancelled">Dibatalkan (Cancelled)</option>
        </select>
      </div>

      {/* Event Cards / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Tiada program atau acara dijumpai mengikut tapisan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEvents.map((item) => {
              const status = item.status || 'upcoming';
              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={item.posterUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-xl shrink-0 bg-slate-100 border border-slate-200"
                      onError={(e) => {
                        (e.target as any).src =
                          'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            status === 'upcoming'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'past'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {status === 'upcoming' ? 'Akan Datang' : status === 'past' ? 'Program Lepas' : 'Dibatalkan'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                          {item.mode}
                        </span>
                        {item.registrationOpen && status === 'upcoming' && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                            Pendaftaran Dibuka
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">{item.theme}</p>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar className="w-3 h-3 text-teal-700" />
                          {item.date} ({item.time})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {item.spotsFilled} / {item.spotsTotal} Peserta
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleToggleUpcomingPast(item)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                        status === 'upcoming'
                          ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      {status === 'upcoming' ? 'Tukar ke Program Lepas' : 'Tukar ke Akan Datang'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Sunting Acara"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Padam Acara"
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

      {/* Add / Edit Event Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Sunting Maklumat Acara' : 'Cipta Acara Baharu'}
              </h4>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Program / Acara
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="cth: Kolokium Kepimpinan Pengetua Sekolah Islam Kebangsaan 2026"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tema Acara
                  </label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="cth: Membina Ekosistem Pendidikan Rabbani Abad Ke-21"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Acara
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="upcoming">Akan Datang (Upcoming)</option>
                    <option value="past">Telah Berlangsung (Past)</option>
                    <option value="cancelled">Dibatalkan (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tarikh Acara
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="cth: 18 - 20 Oktober 2026"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Waktu / Masa
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="cth: 8:30 Pagi - 5:00 Petang"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mod Pelaksanaan
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Fizikal">Fizikal</option>
                    <option value="Dalam Talian">Dalam Talian (Online)</option>
                    <option value="Hibrid">Hibrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lokasi / Tempat
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="cth: Dewan Perdana, Bangi Avenue Convention Centre"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Yuran Penyertaan
                  </label>
                  <input
                    type="text"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    placeholder="cth: Percuma untuk Ahli / RM150 Bukan Ahli"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Penerangan Program
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan objektif program dan modul pengisian..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sasaran Peserta
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Pengetua & Guru Besar"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jumlah Tempat
                  </label>
                  <input
                    type="number"
                    value={formData.spotsTotal}
                    onChange={(e) => setFormData({ ...formData, spotsTotal: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tempat Terisi
                  </label>
                  <input
                    type="number"
                    value={formData.spotsFilled}
                    onChange={(e) => setFormData({ ...formData, spotsFilled: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              {/* Muat Naik Poster Gambar Program */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-xs">
                    Poster Gambar Program
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>{showUrlFallback ? 'Guna Muat Naik Fail' : 'Guna Pautan URL'}</span>
                  </button>
                </div>

                {!showUrlFallback ? (
                  <div className="space-y-3">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePosterFile(file);
                        if (e.target) e.target.value = '';
                      }}
                    />

                    {/* Preview or Dropzone */}
                    {formData.posterUrl ? (
                      <div className="relative rounded-2xl border-2 border-teal-500/40 bg-slate-900 p-3.5 flex flex-col sm:flex-row items-center gap-4 overflow-hidden shadow-inner">
                        <div className="relative w-36 h-48 sm:w-28 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shadow-md">
                          <img
                            src={formData.posterUrl}
                            alt="Pratonton Poster"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-600 text-white shadow-xs">
                            Poster
                          </span>
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-2">
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-teal-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Poster program sedia digunakan</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Fail gambar telah dimuat naik dan dioptimumkan untuk paparan pantas dan visual berkualiti tinggi di portal.
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingPoster}
                              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingPoster ? 'Memproses...' : 'Tukar Poster'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, posterUrl: '' }))}
                              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/70 text-slate-300 hover:text-rose-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700 active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Padam Poster</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingPoster(true);
                        }}
                        onDragLeave={() => setIsDraggingPoster(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingPoster(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handlePosterFile(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                          isDraggingPoster
                            ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
                            : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 shadow-xs">
                          {isUploadingPoster ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          {isUploadingPoster
                            ? 'Sedang memuat naik dan memampatkan poster...'
                            : 'Klik untuk muat naik poster gambar program'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          atau seret dan lepas fail imej di sini (PNG, JPG, WebP)
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                          Saiz automatik dioptimumkan untuk visual tajuk dan paparan pantas
                        </p>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      placeholder="https://... pautan URL poster imej"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Masukkan URL pautan terus ke fail imej sekiranya poster dihoskan di pelayan luar.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="regOpen"
                  checked={formData.registrationOpen}
                  onChange={(e) => setFormData({ ...formData, registrationOpen: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <label htmlFor="regOpen" className="font-semibold text-slate-700 select-none">
                  Buka Pendaftaran Peserta Dalam Talian Sekarang
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-md shadow-teal-900/20 transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Simpan Perubahan' : 'Cipta Acara'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900">Padam Acara?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Adakah anda pasti ingin memadamkan acara ini secara kekal daripada sistem?
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-900 line-clamp-2">
                {itemToDelete.title}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {itemToDelete.date} • {itemToDelete.venue}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sedang Memadam...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Sahkan Padam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
