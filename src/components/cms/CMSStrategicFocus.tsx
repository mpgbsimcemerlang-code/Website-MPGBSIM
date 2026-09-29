import React, { useState } from 'react';
import { useAdminContent } from '../../context/AdminContentContext';
import { StrategicFocus } from '../../types';
import { Flag, Plus, Edit2, Trash2, Save, X, CheckCircle, ShieldCheck, Cpu, Radio, HeartHandshake, Sparkles, Share2 } from 'lucide-react';

export const CMSStrategicFocus: React.FC = () => {
  const { siteData, addStrategicFocus, updateStrategicFocus, deleteStrategicFocus } = useAdminContent();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<StrategicFocus>>({
    code: 'FS-01',
    title: '',
    shortDesc: '',
    fullDesc: '',
    iconName: 'ShieldCheck',
    initiatives: [''],
    kpi: '',
    status: 'Fokus Utama',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (item: StrategicFocus) => {
    setForm({
      ...item,
      initiatives: item.initiatives && item.initiatives.length ? [...item.initiatives] : [''],
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.shortDesc?.trim()) {
      showToast('Sila lengkapkan tajuk dan huraian fokus strategik.');
      return;
    }

    const cleanedInitiatives = (form.initiatives || []).map((p) => p.trim()).filter(Boolean);

    if (editingId !== null) {
      updateStrategicFocus(editingId, {
        code: form.code || `FS-0${siteData.strategicFocus?.length || 1}`,
        title: form.title,
        shortDesc: form.shortDesc,
        fullDesc: form.fullDesc || form.shortDesc,
        iconName: form.iconName || 'Flag',
        initiatives: cleanedInitiatives.length ? cleanedInitiatives : ['Inisiatif Pemerkasaan Kepimpinan'],
        kpi: form.kpi || '100% Sekolah Mengadaptasi',
        status: (form.status as any) || 'Fokus Utama',
      });
      showToast('Fokus strategik berjaya dikemaskini!');
      setEditingId(null);
    } else {
      const newId = Date.now();
      const newItem: StrategicFocus = {
        id: newId,
        code: form.code || `FS-0${(siteData.strategicFocus?.length || 0) + 1}`,
        title: form.title,
        shortDesc: form.shortDesc,
        fullDesc: form.fullDesc || form.shortDesc,
        iconName: form.iconName || 'Flag',
        initiatives: cleanedInitiatives.length ? cleanedInitiatives : ['Inisiatif Pemerkasaan Kepimpinan'],
        kpi: form.kpi || '100% Sekolah Mengadaptasi',
        status: (form.status as any) || 'Fokus Utama',
      };
      addStrategicFocus(newItem);
      showToast('Fokus strategik baharu berjaya ditambah!');
    }

    setIsAdding(false);
    setForm({
      code: 'FS-01',
      title: '',
      shortDesc: '',
      fullDesc: '',
      iconName: 'ShieldCheck',
      initiatives: [''],
      kpi: '',
      status: 'Fokus Utama',
    });
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadam fokus strategik: "${title}"?`)) {
      deleteStrategicFocus(id);
      showToast('Fokus strategik telah dipadam.');
    }
  };

  const addInitiativeRow = () => {
    setForm((prev) => ({
      ...prev,
      initiatives: [...(prev.initiatives || []), ''],
    }));
  };

  const updateInitiativeRow = (index: number, val: string) => {
    setForm((prev) => {
      const arr = [...(prev.initiatives || [])];
      arr[index] = val;
      return { ...prev, initiatives: arr };
    });
  };

  const removeInitiativeRow = (index: number) => {
    setForm((prev) => {
      const arr = [...(prev.initiatives || [])];
      arr.splice(index, 1);
      return { ...prev, initiatives: arr.length ? arr : [''] };
    });
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
            <Flag className="w-5 h-5 text-teal-700" />
            <h3 className="text-lg font-extrabold text-slate-900">
              Pelan Tindakan & Fokus Strategik ({siteData.strategicFocus?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Uruskan teras strategik kebangsaan, inisiatif tindakan, KPI sasaran, dan ikon paparan dashboard.
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
                code: `FS-0${(siteData.strategicFocus?.length || 0) + 1}`,
                title: '',
                shortDesc: '',
                fullDesc: '',
                iconName: 'ShieldCheck',
                initiatives: [''],
                kpi: 'Pencapaian 100% Sekolah',
                status: 'Fokus Utama',
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
              <span>Tambah Fokus Baharu</span>
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
            <span>{editingId ? 'Kemaskini Fokus Strategik' : 'Tambah Teras Strategik Baharu'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kod Fokus (cth: FS-01)
              </label>
              <input
                type="text"
                required
                value={form.code || ''}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="FS-01"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tajuk Fokus Strategik <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Pemerkasaan Integriti & Tadbir Urus Institusi"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status Pelaksanaan
              </label>
              <select
                value={form.status || 'Fokus Utama'}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-medium"
              >
                <option value="Fokus Utama">Fokus Utama</option>
                <option value="Sedang Berjalan">Sedang Berjalan</option>
                <option value="Perancangan 2026">Perancangan 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ikon Paparan
              </label>
              <select
                value={form.iconName || 'ShieldCheck'}
                onChange={(e) => setForm({ ...form, iconName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              >
                <option value="ShieldCheck">ShieldCheck (Tadbir Urus / Integriti)</option>
                <option value="Cpu">Cpu (Digital & AI)</option>
                <option value="Radio">Radio (Jaringan / Komunikasi)</option>
                <option value="HeartHandshake">HeartHandshake (Kebajikan & Wakaf)</option>
                <option value="Sparkles">Sparkles (Kurikulum & Inovasi)</option>
                <option value="Share2">Share2 (Kolaborasi Strategik)</option>
                <option value="Flag">Flag (Tindakan Umum)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sasaran KPI
              </label>
              <input
                type="text"
                value={form.kpi || ''}
                onChange={(e) => setForm({ ...form, kpi: e.target.value })}
                placeholder="Contoh: 100% PGB tamat modul tadbir urus"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Huraian Ringkas (Kad Dashboard) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={form.shortDesc || ''}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                placeholder="Ringkasan objektif teras fokus strategik ini..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Huraian Penuh (Modal Pop-up)
              </label>
              <textarea
                rows={3}
                value={form.fullDesc || ''}
                onChange={(e) => setForm({ ...form, fullDesc: e.target.value })}
                placeholder="Huraian terperinci mengenai pelaksanaan, strategi, dan matlamat jangka panjang..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Inisiatif List */}
            <div className="sm:col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Senarai Inisiatif Tindakan
                </label>
                <button
                  type="button"
                  onClick={addInitiativeRow}
                  className="text-xs font-bold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Inisiatif</span>
                </button>
              </div>

              {(form.initiatives || ['']).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-bold text-slate-400">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateInitiativeRow(idx, e.target.value)}
                    placeholder={`Inisiatif tindakan ${idx + 1}...`}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
                  />
                  {(form.initiatives || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInitiativeRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Padam baris"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
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
              <span>{editingId ? 'Kemaskini Fokus' : 'Simpan Fokus'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid of strategic focus items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(siteData.strategicFocus || []).map((focus) => (
          <div
            key={focus.id}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all flex flex-col justify-between shadow-2xs space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-100/70 text-teal-900">
                  {focus.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  {focus.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{focus.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{focus.shortDesc}</p>

              {focus.initiatives && focus.initiatives.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    {focus.initiatives.length} Inisiatif Tindakan Terkandung
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[150px]">
                KPI: {focus.kpi}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(focus)}
                  className="p-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                  title="Sunting Fokus"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(focus.id, focus.title)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Padam Fokus"
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
