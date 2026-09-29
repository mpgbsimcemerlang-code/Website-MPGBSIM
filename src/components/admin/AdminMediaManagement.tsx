import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Upload,
  Link as LinkIcon,
  Search,
  X,
  ExternalLink,
  Film,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { MediaItem } from '../../types';

export const AdminMediaManagement: React.FC = () => {
  const { siteData, addMedia, updateMedia, deleteMedia } = useAdminContent();
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');

  // Form states
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Aktiviti');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
  );
  const [location, setLocation] = useState('Pusat Konvensyen Antarabangsa Bangi');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Aktiviti',
    'Muzakarah',
    'Bengkel Kepimpinan',
    'Lawatan Kerja',
    'Sumbangan & Majlis',
    'Video Rasmi',
  ];

  const mediaList = siteData.media || [];

  const filteredMedia = mediaList.filter((item) => {
    const itemType = item.type || (item.videoUrl ? 'video' : 'photo');
    const matchesType = filterType === 'all' || itemType === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const isVideo = activeTab === 'video';
    const fallbackImage = isVideo
      ? 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'
      : 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800';

    const newMedia: MediaItem = {
      id: `media-${Date.now()}`,
      title,
      caption: caption || title,
      category,
      date,
      location,
      type: isVideo ? 'video' : 'photo',
      thumbnailUrl: imageUrl || fallbackImage,
      videoUrl: isVideo ? videoUrl : undefined,
    };

    await addMedia(newMedia);
    setIsModalOpen(false);
    // Reset
    setTitle('');
    setCaption('');
    setImageUrl('');
    setVideoUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Pengurusan Media & Galeri</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Muat naik foto aktiviti, pautkan video YouTube rasmi, dan susun galeri multimedia portal MPGBSIM.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('photo');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/20"
          >
            <Upload className="w-4 h-4" />
            <span>Muat Naik Foto</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('video');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-rose-900/20"
          >
            <Video className="w-4 h-4" />
            <span>Tambah Pautan Video</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tajuk foto, video, lokasi atau kategori..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({mediaList.length})
          </button>
          <button
            onClick={() => setFilterType('photo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterType === 'photo' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto Sahaja</span>
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterType === 'video' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video Sahaja</span>
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        {filteredMedia.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Tiada media dalam galeri mengikut carian ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => {
              const isVideo = item.type === 'video' || (item.videoUrl && item.videoUrl.length > 0);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 overflow-hidden bg-white hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as any).src =
                          'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600';
                      }}
                    />

                    {isVideo ? (
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                          <Film className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    ) : null}

                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {item.category || 'Galeri'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Padam "${item.title}" daripada galeri media?`)) {
                          deleteMedia(item.id);
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white transition opacity-0 group-hover:opacity-100"
                      title="Padam Media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    {item.caption && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.caption}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{item.date || 'Terkini'}</span>
                      {isVideo && item.videoUrl ? (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-0.5"
                        >
                          <span>Pautan Video</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-teal-700 font-semibold">Foto HD</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === 'photo' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {activeTab === 'photo' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {activeTab === 'photo' ? 'Muat Naik Foto ke Galeri' : 'Tambah Pautan Video Media'}
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switch inside modal */}
            <div className="flex p-1 bg-slate-100 rounded-xl my-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  activeTab === 'photo' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Foto / Gambar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  activeTab === 'video' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Pautan Video (YouTube/Vimeo)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tajuk Media
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth: Majlis Ihtifal & Pelancaran Kurikulum Tahfiz 2026"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tarikh Rakaman
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lokasi Aktiviti
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="cth: Putrajaya / SMKA Maahad Hamidiah"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              {activeTab === 'video' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pautan Video (URL YouTube / Vimeo)
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-600 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Image upload area / URL */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {activeTab === 'photo' ? 'Fail Gambar / Foto' : 'Poster / Thumbnail Video'}
                </label>

                {/* Drag and drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition ${
                    isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                  <p className="text-[11px] font-bold text-slate-700">
                    Klik untuk pilih foto dari komputer atau seret masuk fail
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP sehingga 5MB</p>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Atau Pautan URL Gambar:</span>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                </div>

                {imageUrl && imageUrl.trim() ? (
                  <div className="mt-2 p-2 bg-slate-100 rounded-xl flex items-center gap-2">
                    <img src={imageUrl} alt="Pratonton" className="w-12 h-10 object-cover rounded-lg border border-slate-200" />
                    <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Gambar sedia untuk disimpan
                    </span>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Keterangan Ringkas / Kapsyen
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Keterangan gambar atau perincian aktiviti..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-md shadow-teal-900/20 transition"
                >
                  Simpan ke Galeri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
