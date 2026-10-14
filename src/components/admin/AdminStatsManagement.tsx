import React, { useState, useMemo } from 'react';
import { useAdminContent } from '../../context/AdminContentContext';
import { NetworkStats } from '../../types';
import { isPrimarySchoolRecord, isGuruBesarRecord } from '../SchoolNetwork';
import { BarChart3, Save, RotateCcw, CheckCircle, AlertCircle, School, Users, MapPin, Sparkles, Radio } from 'lucide-react';

export const AdminStatsManagement: React.FC = () => {
  const { siteData, updateStats } = useAdminContent();
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const liveCounts = useMemo(() => {
    const schools = siteData.memberSchools || [];
    let principals = 0;
    let headteachers = 0;
    let primaryStudents = 0;
    let secondaryStudents = 0;

    schools.forEach((sch) => {
      const isPrimary = isPrimarySchoolRecord(sch);
      const isGB = isGuruBesarRecord(sch);
      const count = Math.max(0, Number(sch.studentCount) || 0);

      if (isGB) headteachers += 1;
      else principals += 1;

      if (isPrimary) primaryStudents += count;
      else secondaryStudents += count;
    });

    return {
      totalSchools: schools.length,
      principals,
      headteachers,
      primaryStudents,
      secondaryStudents,
    };
  }, [siteData.memberSchools]);

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
            Pantau kiraan langsung (Live Updates) daripada direktori sekolah ahli serta kemas kini angka sasaran rangkaian kebangsaan.
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

      {/* Live Updates Real-Time Summary */}
      <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
            <Radio className="w-4 h-4 text-emerald-700" />
            <span>Kiraan Data Langsung (Live Updates) — Rangkaian Sekolah-Sekolah Ahli MPGBSIM</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800">
            Automatik daripada Direktori Sekolah
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-white border border-emerald-200/80">
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">
              {liveCounts.totalSchools.toLocaleString('ms-MY')}
            </div>
            <div className="text-[11px] font-bold text-slate-600 mt-0.5">Sekolah Berdaftar</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-emerald-200/80">
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">
              {liveCounts.principals.toLocaleString('ms-MY')}
            </div>
            <div className="text-[11px] font-bold text-slate-600 mt-0.5">Jumlah Pengetua</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-emerald-200/80">
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">
              {liveCounts.headteachers.toLocaleString('ms-MY')}
            </div>
            <div className="text-[11px] font-bold text-slate-600 mt-0.5">Jumlah Guru Besar</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-emerald-200/80">
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">
              {liveCounts.primaryStudents.toLocaleString('ms-MY')}
            </div>
            <div className="text-[11px] font-bold text-slate-600 mt-0.5">Murid Sekolah Rendah</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-emerald-200/80">
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">
              {liveCounts.secondaryStudents.toLocaleString('ms-MY')}
            </div>
            <div className="text-[11px] font-bold text-slate-600 mt-0.5">Pelajar Sekolah Menengah</div>
          </div>
        </div>
      </div>

      {/* Notice Card */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950">
          <span className="font-bold block">Status Bancian & Paparan Laman:</span>
          Angka di atas dikira secara langsung (live updates) daripada pangkalan data sekolah berdaftar dan dipaparkan pada ruangan "Rangkaian Sekolah-Sekolah Ahli MPGBSIM".
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
