import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Bell,
  BarChart3,
  Users,
  Inbox,
  StickyNote,
  RotateCcw,
  Sparkles,
  Info,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useAdminContent, DEFAULT_DASHBOARD_CONFIG } from '../../context/AdminContentContext';
import { DashboardConfig } from '../../types';

interface AdminDashboardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'banner' | 'announcement' | 'metrics' | 'membership' | 'submissions' | 'memo';
}

export const AdminDashboardEditorModal: React.FC<AdminDashboardEditorModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'banner',
}) => {
  const { siteData, updateDashboardConfig, syncAllToFirestore } = useAdminContent();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [form, setForm] = useState<DashboardConfig>(() => {
    return {
      ...DEFAULT_DASHBOARD_CONFIG,
      ...(siteData.dashboardConfig || {}),
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...DEFAULT_DASHBOARD_CONFIG,
        ...(siteData.dashboardConfig || {}),
      });
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab, siteData.dashboardConfig]);

  if (!isOpen) return null;

  const handleChange = (field: keyof DashboardConfig, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Adakah anda pasti mahu menetapkan semula semua teks dashboard ke tetapan asal?')) {
      setForm(DEFAULT_DASHBOARD_CONFIG);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateDashboardConfig(form);
    await syncAllToFirestore();
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between gap-4 shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Editor Kandungan & Teks Dashboard CMS
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-800 text-teal-200 text-[10px] font-bold">
                  Boleh Ubah Suai Sepenuhnya
                </span>
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Admin boleh menukar apa-apa ayat, tajuk banner, notis pengumuman, teks metrik dan maklumat dalam dashboard ini.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-100/80 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('banner')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'banner'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Banner & Aluan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('announcement')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'announcement'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Pengumuman Khas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>4 Kad Metrik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('membership')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'membership'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Seksyen Keahlian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Peti Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('memo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'memo'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Memo / Tugasan</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Semua elemen teks dashboard berjaya disimpan dan diselaraskan ke Cloud Firestore!</span>
            </div>
          )}

          {/* TAB 1: BANNER & WELCOME */}
          {activeTab === 'banner' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-950 text-xs">
                <strong>Sesuaikan Banner Utama Dashboard</strong>
                <p className="text-teal-800 text-[11px] mt-0.5">
                  Teks ini dipaparkan di bahagian paling atas skrin Pusat Kawalan CMS Pentadbir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lencana / Badge Atas Banner
                  </label>
                  <input
                    type="text"
                    required
                    value={form.welcomeBadge}
                    onChange={(e) => handleChange('welcomeBadge', e.target.value)}
                    placeholder="cth. Pusat Kawalan Pentadbir Rasmi MPGBSIM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tajuk / Kata Aluan Utama
                  </label>
                  <input
                    type="text"
                    required
                    value={form.welcomeGreeting}
                    onChange={(e) => handleChange('welcomeGreeting', e.target.value)}
                    placeholder="cth. Selamat Datang, Pentadbir"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Perenggan Keterangan Aluan Banner
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.welcomeDesc}
                  onChange={(e) => handleChange('welcomeDesc', e.target.value)}
                  placeholder="Penerangan operasi portal dan penyegerakan awan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Label Status Backend
                  </label>
                  <input
                    type="text"
                    value={form.backendStatusLabel}
                    onChange={(e) => handleChange('backendStatusLabel', e.target.value)}
                    placeholder="cth. Status Backend"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teks Nilai Status
                  </label>
                  <input
                    type="text"
                    value={form.backendStatusValue}
                    onChange={(e) => handleChange('backendStatusValue', e.target.value)}
                    placeholder="cth. Firestore Aktif"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teks Butang Segerak
                  </label>
                  <input
                    type="text"
                    value={form.syncBtnLabel}
                    onChange={(e) => handleChange('syncBtnLabel', e.target.value)}
                    placeholder="cth. Segerak ke Cloud Firestore"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENT */}
          {activeTab === 'announcement' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                <strong>Bar Pengumuman / Notis Khas Pentadbir</strong>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Paparkan notis segera atau peringatan penting kepada semua pentadbir yang membuka dashboard ini.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Papar Bar Pengumuman di Atas Dashboard
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Boleh diaktifkan atau dinyahaktifkan pada bila-bila masa.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showAnnouncement}
                    onChange={(e) => handleChange('showAnnouncement', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis / Gaya Notis
                  </label>
                  <select
                    value={form.announcementType}
                    onChange={(e) => handleChange('announcementType', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none bg-white"
                  >
                    <option value="info">Makluman (Biru / Teal)</option>
                    <option value="warning">Amaran / Penting (Kuning / Amber)</option>
                    <option value="success">Kejayaan / Positif (Hijau)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tajuk Notis
                  </label>
                  <input
                    type="text"
                    value={form.announcementTitle}
                    onChange={(e) => handleChange('announcementTitle', e.target.value)}
                    placeholder="cth. Makluman Operasi Dashboard Pentadbir"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kandungan Ayat Pengumuman
                </label>
                <textarea
                  rows={3}
                  value={form.announcementText}
                  onChange={(e) => handleChange('announcementText', e.target.value)}
                  placeholder="Tulis ayat pengumuman di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              {/* Live Preview */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pratonton Bar Notis:
                </span>
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    form.announcementType === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : form.announcementType === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-teal-50 border-teal-200 text-teal-950'
                  }`}
                >
                  {form.announcementType === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : form.announcementType === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block">{form.announcementTitle || 'Tajuk Notis'}</strong>
                    <p className="mt-0.5 opacity-90">{form.announcementText || 'Teks pengumuman pentadbir...'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: METRIC CARDS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-950 text-xs flex items-center justify-between">
                <div>
                  <strong>Teks & Label 4 Kad Statistik Utama</strong>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Angka dikira secara dinamik, manakala semua tajuk dan ayat penerangan boleh ditukar di sini.
                  </p>
                </div>
                <div className="w-40">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Teks Butang Kad
                  </label>
                  <input
                    type="text"
                    value={form.cardActionText}
                    onChange={(e) => handleChange('cardActionText', e.target.value)}
                    placeholder="Urus"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* News Card Config */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-[10px] font-bold">
                    Kad 1: Berita & Pekeliling
                  </span>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Kad</label>
                    <input
                      type="text"
                      value={form.cardNewsTitle}
                      onChange={(e) => handleChange('cardNewsTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Subteks</label>
                    <input
                      type="text"
                      value={form.cardNewsSub}
                      onChange={(e) => handleChange('cardNewsSub', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                </div>

                {/* Events Card Config */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                    Kad 2: Acara & Program
                  </span>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Kad</label>
                    <input
                      type="text"
                      value={form.cardEventsTitle}
                      onChange={(e) => handleChange('cardEventsTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Subteks</label>
                    <input
                      type="text"
                      value={form.cardEventsSub}
                      onChange={(e) => handleChange('cardEventsSub', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                </div>

                {/* Practices Card Config */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-bold">
                    Kad 3: Amalan Terbaik
                  </span>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Kad</label>
                    <input
                      type="text"
                      value={form.cardPracticesTitle}
                      onChange={(e) => handleChange('cardPracticesTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Subteks</label>
                    <input
                      type="text"
                      value={form.cardPracticesSub}
                      onChange={(e) => handleChange('cardPracticesSub', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                </div>

                {/* Schools Card Config */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                    Kad 4: Sekolah Ahli
                  </span>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Kad</label>
                    <input
                      type="text"
                      value={form.cardSchoolsTitle}
                      onChange={(e) => handleChange('cardSchoolsTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Subteks</label>
                    <input
                      type="text"
                      value={form.cardSchoolsSub}
                      onChange={(e) => handleChange('cardSchoolsSub', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEMBERSHIP SECTION */}
          {activeTab === 'membership' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-950 text-xs">
                <strong>Teks Bahagian Permohonan Keahlian Baharu</strong>
                <p className="text-teal-800 text-[11px] mt-0.5">
                  Ubah tajuk seksyen, penerangan, teks butang, dan makluman sekiranya tiada permohonan tertangguh.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Seksyen</label>
                  <input
                    type="text"
                    value={form.membershipTitle}
                    onChange={(e) => handleChange('membershipTitle', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teks Butang Tindakan</label>
                  <input
                    type="text"
                    value={form.membershipBtnText}
                    onChange={(e) => handleChange('membershipBtnText', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penerangan Seksyen</label>
                <textarea
                  rows={2}
                  value={form.membershipDesc}
                  onChange={(e) => handleChange('membershipDesc', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tajuk Mesej Bila Kosong / Selesai
                  </label>
                  <input
                    type="text"
                    value={form.membershipEmptyTitle}
                    onChange={(e) => handleChange('membershipEmptyTitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penerangan Mesej Bila Kosong
                  </label>
                  <input
                    type="text"
                    value={form.membershipEmptyDesc}
                    onChange={(e) => handleChange('membershipEmptyDesc', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                <strong>Teks Bahagian Peti Masuk Pertanyaan & Submisi</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Ubah tajuk dan huraian mesej peti masuk pertanyaan awam di dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Seksyen Peti Masuk</label>
                <input
                  type="text"
                  value={form.submissionsTitle}
                  onChange={(e) => handleChange('submissionsTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penerangan Seksyen Peti Masuk</label>
                <textarea
                  rows={2}
                  value={form.submissionsDesc}
                  onChange={(e) => handleChange('submissionsDesc', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teks Sekiranya Tiada Mesej</label>
                <input
                  type="text"
                  value={form.submissionsEmptyDesc}
                  onChange={(e) => handleChange('submissionsEmptyDesc', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 6: ADMIN MEMO */}
          {activeTab === 'memo' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-950 text-xs">
                <strong>Papan Memo & Peringatan Tugasan Pentadbir</strong>
                <p className="text-purple-800 text-[11px] mt-0.5">
                  Tulis senarai tugasan (action items) atau memo penting untuk peringatan sesama pentadbir di dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pengarang Memo / Jawatan</label>
                  <input
                    type="text"
                    value={form.adminMemoAuthor || ''}
                    onChange={(e) => handleChange('adminMemoAuthor', e.target.value)}
                    placeholder="cth. Urus Setia Kebangsaan"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarikh / Nota Masa</label>
                  <input
                    type="text"
                    value={form.adminMemoDate || ''}
                    onChange={(e) => handleChange('adminMemoDate', e.target.value)}
                    placeholder="cth. 23 September 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kandungan Memo / Tugasan</label>
                <textarea
                  rows={4}
                  value={form.adminMemo}
                  onChange={(e) => handleChange('adminMemo', e.target.value)}
                  placeholder="Tulis peringatan tugasan pentadbiran di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none font-sans leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Asal</span>
            </button>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-900/20 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan & Menyegerak...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan & Segerak Firestore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
