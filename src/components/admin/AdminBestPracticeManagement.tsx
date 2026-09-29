import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Award,
  BookOpen,
  MapPin,
  X,
  Send,
  CheckCircle2,
  Tag,
  GraduationCap,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { BestPracticeItem } from '../../types';

export const AdminBestPracticeManagement: React.FC = () => {
  const { siteData, addPractice, updatePractice, deletePractice } = useAdminContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BestPracticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deletePractice(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error('Ralat ketika memadam amalan:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = [
    'Tahfiz & Kurikulum',
    'Kepimpinan Digital',
    'Pembangunan Sahsiah',
    'Kelestarian & Wakaf',
    'Inovasi Pedagogi & STEM',
    'Jaringan Antarabangsa',
  ];

  const malaysianStates = [
    'Johor',
    'Kedah',
    'Kelantan',
    'Melaka',
    'Negeri Sembilan',
    'Pahang',
    'Perak',
    'Perlis',
    'Pulau Pinang',
    'Sabah',
    'Sarawak',
    'Selangor',
    'Terengganu',
    'W.P. Kuala Lumpur',
    'W.P. Labuan',
    'W.P. Putrajaya',
  ];

  const initialFormState: Omit<BestPracticeItem, 'id'> = {
    title: '',
    schoolName: '',
    state: 'Selangor',
    category: 'Tahfiz & Kurikulum',
    impactSummary: '',
    description: '',
    keyOutcomes: ['Peningkatan gred purata sekolah', 'Penguasaan hafazan 30 juzuk bersijil'],
    leadPerson: 'Pengetua / Guru Besar',
    year: '2026',
    badge: 'Amalan Teladan Kebangsaan',
    status: 'published',
  };

  const [formData, setFormData] = useState<Omit<BestPracticeItem, 'id'>>(initialFormState);
  const [outcomesText, setOutcomesText] = useState(initialFormState.keyOutcomes.join('\n'));

  const practicesList = siteData.practices || [];
  const filteredPractices = practicesList.filter((item) => {
    const itemStatus = item.status || 'published';
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || itemStatus === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setOutcomesText(initialFormState.keyOutcomes.join('\n'));
    setEditingId(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (item: BestPracticeItem) => {
    setFormData({
      title: item.title,
      schoolName: item.schoolName,
      state: item.state,
      category: item.category,
      impactSummary: item.impactSummary,
      description: item.description,
      keyOutcomes: item.keyOutcomes || [],
      leadPerson: item.leadPerson,
      year: item.year,
      badge: item.badge || 'Amalan Teladan Kebangsaan',
      status: item.status || 'published',
    });
    setOutcomesText((item.keyOutcomes || []).join('\n'));
    setEditingId(item.id);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.schoolName.trim()) return;

    const outcomesArray = outcomesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const practicePayload = {
      ...formData,
      keyOutcomes: outcomesArray.length ? outcomesArray : ['Peningkatan kualiti pengurusan sekolah'],
    };

    if (editingId) {
      updatePractice(editingId, practicePayload);
    } else {
      const newId = `prac-${Date.now()}`;
      addPractice({
        ...practicePayload,
        id: newId,
      });
    }
    setIsEditing(false);
  };

  const handleTogglePublish = (item: BestPracticeItem) => {
    const currentStatus = item.status || 'published';
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    updatePractice(item.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Pengurusan Amalan Terbaik Pendidikan</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cipta, sunting, kategorikan bidang fokus dan terbitkan amalan teladan daripada sekolah-sekolah Islam seluruh Malaysia.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Amalan Terbaik</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tajuk amalan, nama sekolah, atau negeri..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">Semua Kategori Amalan</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">Semua Status</option>
            <option value="published">Diterbitkan</option>
            <option value="draft">Draf</option>
          </select>
        </div>
      </div>

      {/* Practices List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPractices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Tiada amalan terbaik dijumpai mengikut tapisan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPractices.map((item) => {
              const status = item.status || 'published';
              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[10px] font-bold">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {status === 'published' ? 'Diterbitkan' : 'Draf'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.state} • {item.year}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs font-semibold text-teal-800 mt-0.5">{item.schoolName}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.impactSummary || item.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                        status === 'published'
                          ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                          : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      {status === 'published' ? 'Jadikan Draf' : 'Terbitkan'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Sunting Amalan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Padam Amalan"
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

      {/* Add / Edit Practice Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Sunting Amalan Terbaik' : 'Cipta Amalan Terbaik Baharu'}
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
                  Tajuk Amalan Terbaik
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="cth: Model Integrasi Tahfiz Sains dan Robotik Islamik"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="cth: SMKA Kuala Selangor"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Negeri
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {malaysianStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori Bidang
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    Status Penerbitan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="published">Diterbitkan (Published)</option>
                    <option value="draft">Draf (Draft)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tahun Pelaksanaan
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tokoh / Pegawai Peneraju
                </label>
                <input
                  type="text"
                  value={formData.leadPerson}
                  onChange={(e) => setFormData({ ...formData, leadPerson: e.target.value })}
                  placeholder="cth: Ustazah Hajah Rohani binti Mohd Salleh (Pengetua Cemerlang)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ringkasan Impak Utama
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.impactSummary}
                  onChange={(e) => setFormData({ ...formData, impactSummary: e.target.value })}
                  placeholder="Ringkasan impak pencapaian murid dan sekolah..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Huraian Lengkap Amalan
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Huraian kaedah pelaksanaan, cabaran yang diatasi, dan tatacara pelaksanaan..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hasil Kejayaan Utama (1 hasil per baris)
                </label>
                <textarea
                  rows={3}
                  value={outcomesText}
                  onChange={(e) => setOutcomesText(e.target.value)}
                  placeholder="Peningkatan kelulusan 100% SPM&#10;Juara Inovasi Robotik Kebangsaan&#10;Pensijilan ISO 9001:2015"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                />
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
                  <span>{editingId ? 'Simpan Perubahan' : 'Cipta Amalan'}</span>
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

            <h3 className="text-lg font-black text-slate-900">Padam Amalan Terbaik?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Adakah anda pasti ingin memadamkan amalan terbaik ini secara kekal daripada sistem?
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-900 line-clamp-2">
                {itemToDelete.title}
              </p>
              <p className="text-[10px] text-teal-800 font-semibold mt-1">
                {itemToDelete.schoolName} ({itemToDelete.state})
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
