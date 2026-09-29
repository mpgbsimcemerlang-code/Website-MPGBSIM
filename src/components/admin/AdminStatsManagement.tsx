import React, { useState } from 'react';
import { useAdminContent } from '../../context/AdminContentContext';
import { NetworkStats } from '../../types';
import { BarChart3, Save, RotateCcw, CheckCircle, AlertCircle, School, Users, MapPin, Sparkles } from 'lucide-react';

export const AdminStatsManagement: React.FC = () => {
  const { siteData, updateStats, syncAllToFirestore } = useAdminContent();
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [statsForm, setStatsForm] = useState<NetworkStats>(
    siteData.stats || {
      schoolsCount: 420,
      statesCount: 14,
      principalsCount: 850,
      studentsBenefited: '180,000+',
      isPlaceholder: true,
    }
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateStats(statsForm);
    await syncAllToFirestore();
    setIsSaving(false);
    showToast('Statistik rangkaian sekolah berjaya dikemaskini dan disegerakkan ke Cloud Firestore!');
  };

  const handleResetToDefault = async () => {
    const defaults: NetworkStats = {
      schoolsCount: 420,
      statesCount: 14,
      principalsCount: 850,
      studentsBenefited: '180,000+',
      isPlaceholder: true,
    };
    setStatsForm(defaults);
    updateStats(defaults);
    await syncAllToFirestore();
    showToast('Statistik telah diset semula kepada nilai anggaran rasmi.');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      {/* Toast */}
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
            <BarChart3 className="w-4 h-4 text-teal-300" />
            <span>Modul CMS Statistik Rangkaian</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Statistik Impak & Rangkaian Sekolah MPGBSIM
          </h2>
          <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
            Kemas kini angka rasmi bagi bilangan sekolah ahli, liputan negeri, kepimpinan PGB, dan jumlah murid di laman utama.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 text-xs font-bold text-teal-200 hover:text-white hover:bg-teal-800/60 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-teal-700/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Set Semula</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Statistik'}</span>
          </button>
        </div>
      </div>

      {/* Notice Card */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950">
          <span className="font-bold block">Status Bancian & Paparan Laman:</span>
          Angka-angka ini dipaparkan pada kad statistik bahagian "Rangkaian Sekolah-Sekolah Ahli MPGBSIM". Anda boleh mengaktifkan atau menyahaktifkan label makluman anggaran bancian.
        </div>
      </div>

      {/* Grid of 4 Core Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Stat 1: Sekolah Ahli */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            <School className="w-4 h-4 text-teal-700" />
            <span>Jumlah Sekolah Ahli Berdaftar</span>
          </div>
          <p className="text-xs text-slate-500">Angka keseluruhan sekolah SMKA, SABK, Swasta dan Tahfiz.</p>
          <input
            type="number"
            required
            min={0}
            value={statsForm.schoolsCount}
            onChange={(e) => setStatsForm({ ...statsForm, schoolsCount: Number(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 text-base font-bold text-teal-900 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        {/* Stat 2: Negeri & Wilayah */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            <MapPin className="w-4 h-4 text-teal-700" />
            <span>Liputan Negeri & Wilayah Persekutuan</span>
          </div>
          <p className="text-xs text-slate-500">Liputan cawangan negeri di seluruh Malaysia.</p>
          <input
            type="number"
            required
            min={1}
            max={16}
            value={statsForm.statesCount}
            onChange={(e) => setStatsForm({ ...statsForm, statesCount: Number(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 text-base font-bold text-teal-900 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        {/* Stat 3: Pengetua & Guru Besar */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            <Users className="w-4 h-4 text-teal-700" />
            <span>Jumlah Pemimpin Pendidikan (PGB & SLT)</span>
          </div>
          <p className="text-xs text-slate-500">Bilangan Pengetua, Guru Besar dan Barisan Pentadbir.</p>
          <input
            type="number"
            required
            min={0}
            value={statsForm.principalsCount}
            onChange={(e) => setStatsForm({ ...statsForm, principalsCount: Number(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 text-base font-bold text-teal-900 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        {/* Stat 4: Murid Mendapat Manfaat */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-teal-700" />
            <span>Anggaran Murid Menerima Manfaat</span>
          </div>
          <p className="text-xs text-slate-500">Format teks seperti "180,000+" atau "250,000+ Pelajar".</p>
          <input
            type="text"
            required
            value={statsForm.studentsBenefited}
            onChange={(e) => setStatsForm({ ...statsForm, studentsBenefited: e.target.value })}
            className="w-full px-3.5 py-2.5 text-base font-bold text-teal-900 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Placeholder Disclaimer Toggle */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-sm font-bold text-slate-900 block">
              Papar Lencana "Nilai Anggaran / Pemegang Tempat"
            </span>
            <span className="text-xs text-slate-500">
              Jika diaktifkan, amaran makluman rasmi bahawa angka adalah anggaran bancian sementara akan dipaparkan di atas seksyen.
            </span>
          </div>
          <input
            type="checkbox"
            checked={!!statsForm.isPlaceholder}
            onChange={(e) => setStatsForm({ ...statsForm, isPlaceholder: e.target.checked })}
            className="w-5 h-5 text-teal-700 rounded-sm focus:ring-teal-600"
          />
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Statistik'}</span>
        </button>
      </div>
    </form>
  );
};
