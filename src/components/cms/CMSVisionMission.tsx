import React, { useState } from 'react';
import { useAdminContent, VisionMissionData } from '../../context/AdminContentContext';
import { Target, Eye, BookOpen, Save, CheckCircle, Plus, Trash2, ShieldCheck, GraduationCap, Sparkles } from 'lucide-react';

export const CMSVisionMission: React.FC = () => {
  const { siteData, updateVisionMission, syncAllToFirestore } = useAdminContent();
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<VisionMissionData>(
    siteData.visionMission || {
      strategicPlanTitle: 'Rangka Tindakan Strategik Kepimpinan Sekolah Islam Malaysia (2025–2030)',
      vision: 'Peneraju Kecemerlangan Kepimpinan Pendidikan Islam Bertaraf Antarabangsa',
      visionSub:
        'Menjadikan institusi pendidikan Islam sebagai model pembinaan modal insan unggul yang mengintegrasikan ilmu naqli dan aqli berteraskan nilai ketuhanan.',
      missions: [
        'Membangunkan kapasiti kepimpinan berprestasi tinggi dalam kalangan Pengetua dan Guru Besar secara berterusan.',
        'Menyelaras dan memperkasakan standard kurikulum akademik, tahfiz, dan pembinaan sahsiah bertaraf kebangsaan serta global.',
        'Memperkukuhkan jaringan strategik, perkongsian pintar, dan penyelidikan amalan terbaik antara institusi pendidikan Islam.',
        'Mendaulatkan kebajikan, profesionalisme, serta hak institusi sekolah Islam melalui advokasi dasar yang berkesan.',
      ],
      introParagraph1:
        'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) merupakan badan penaung dan kepimpinan tertinggi yang menghimpunkan para pentadbir sekolah Islam dari seluruh pelusuk tanah air.',
      introParagraph2:
        'Didorong oleh iltizam melahirkan generasi Rabbani yang teguh aqidah dan cemerlang intelek, MPGBSIM bertindak sebagai jambatan strategik antara institusi sekolah, kementerian, agensi agama negeri, serta komuniti masyarakat.',
      introParagraph3:
        'Dengan pendekatan kepimpinan transformasional, kami komited memastikan setiap sekolah ahli dipacu dengan tata kelola profesional, kurikulum futuristik, dan pengurusan wakaf pendidikan yang mampan.',
      pillar1Title: 'Pembangunan Kepimpinan & Governan',
      pillar1Desc:
        'Memantapkan kompetensi manajerial, kepimpinan instruksional, dan pematuhan tadbir urus berwibawa bagi semua pentadbir sekolah ahli.',
      pillar2Title: 'Integrasi Kurikulum & Ekosistem Rabbani',
      pillar2Desc:
        'Mengharmonikan sukatan KPM dengan kurikulum diniyah serta pengajian tahfiz berpiawaian tinggi bagi membentuk sahsiah terpuji.',
    }
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddMission = () => {
    setForm((prev) => ({
      ...prev,
      missions: [...prev.missions, 'Misi baharu pemerkasaan pendidikan Islam.'],
    }));
  };

  const handleUpdateMission = (index: number, text: string) => {
    setForm((prev) => {
      const updated = [...prev.missions];
      updated[index] = text;
      return { ...prev, missions: updated };
    });
  };

  const handleDeleteMission = (index: number) => {
    if (form.missions.length <= 1) {
      alert('Sekurang-kurangnya satu kenyataan misi diperlukan.');
      return;
    }
    setForm((prev) => ({
      ...prev,
      missions: prev.missions.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateVisionMission(form);
    await syncAllToFirestore();
    setIsSaving(false);
    showToast('Kandungan Pengenalan, Visi, Misi & Tonggak Teras berjaya disimpan dan disegerakkan!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600/50 text-teal-200 text-xs font-semibold mb-2">
            <BookOpen className="w-4 h-4 text-teal-300" />
            <span>Modul CMS Pengenalan & Hala Tuju</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Pengenalan, Naratif Rasmi, Visi & Misi Organisasi
          </h2>
          <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
            Semua teks yang anda ubah di sini akan serta-merta mengemas kini seksyen "Tentang MPGBSIM" di laman utama laman web.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-md shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan & Segerak'}</span>
        </button>
      </div>

      {/* Section 1: Pelan Strategik & Naratif Pengenalan */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tajuk Pelan & Perenggan Naratif Profil</h3>
            <p className="text-xs text-slate-500">Ayat pengenalan yang menceritakan latar belakang MPGBSIM.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tajuk Pelan Tindakan / Tagline Strategik
          </label>
          <input
            type="text"
            required
            value={form.strategicPlanTitle}
            onChange={(e) => setForm({ ...form, strategicPlanTitle: e.target.value })}
            placeholder="cth: Rangka Tindakan Strategik Kepimpinan Sekolah Islam Malaysia (2025–2030)"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Perenggan 1 (Pengenalan Badan Penaung)
          </label>
          <textarea
            rows={3}
            required
            value={form.introParagraph1}
            onChange={(e) => setForm({ ...form, introParagraph1: e.target.value })}
            placeholder="Perenggan pertama pengenalan..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Perenggan 2 (Peranan & Jambatan Advokasi)
          </label>
          <textarea
            rows={3}
            required
            value={form.introParagraph2}
            onChange={(e) => setForm({ ...form, introParagraph2: e.target.value })}
            placeholder="Perenggan kedua pengenalan..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Perenggan 3 (Komitmen Masa Hadapan & AI/Teknologi)
          </label>
          <textarea
            rows={3}
            required
            value={form.introParagraph3}
            onChange={(e) => setForm({ ...form, introParagraph3: e.target.value })}
            placeholder="Perenggan ketiga pengenalan..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white leading-relaxed"
          />
        </div>
      </div>

      {/* Section 2: Visi & Sub-Visi */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Kenyataan Visi Organisasi</h3>
            <p className="text-xs text-slate-500">Pernyataan visi agung dan tafsiran aspirasi jangka panjang.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Pernyataan Visi Utama
          </label>
          <input
            type="text"
            required
            value={form.vision}
            onChange={(e) => setForm({ ...form, vision: e.target.value })}
            placeholder="cth: Peneraju Kecemerlangan Kepimpinan Pendidikan Islam Bertaraf Antarabangsa"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-teal-900 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Huraian / Sub-Visi
          </label>
          <textarea
            rows={2}
            required
            value={form.visionSub}
            onChange={(e) => setForm({ ...form, visionSub: e.target.value })}
            placeholder="Huraian lanjut tentang visi..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white leading-relaxed"
          />
        </div>
      </div>

      {/* Section 3: Misi-Misi Organisasi */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Senarai Misi Strategik</h3>
              <p className="text-xs text-slate-500">Tindakan teras yang dilaksanakan oleh MPGBSIM.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddMission}
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-teal-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Misi</span>
          </button>
        </div>

        <div className="space-y-3">
          {form.missions.map((mission, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                {idx + 1}
              </div>
              <textarea
                rows={2}
                required
                value={mission}
                onChange={(e) => handleUpdateMission(idx, e.target.value)}
                placeholder={`Misi ${idx + 1}...`}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white leading-relaxed font-medium"
              />
              <button
                type="button"
                onClick={() => handleDeleteMission(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer mt-1"
                title="Padam Misi"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Dua Tonggak Teras (Pillars) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">2 Tonggak Teras Nilai</h3>
            <p className="text-xs text-slate-500">Kad sorotan nilai integriti dan pembangunan sahsiah.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Tonggak 1 (Governan & Integriti)</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tajuk Tonggak 1</label>
              <input
                type="text"
                required
                value={form.pillar1Title}
                onChange={(e) => setForm({ ...form, pillar1Title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Penerangan Tonggak 1</label>
              <textarea
                rows={2}
                required
                value={form.pillar1Desc}
                onChange={(e) => setForm({ ...form, pillar1Desc: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
              />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
              <GraduationCap className="w-4 h-4 text-amber-700" />
              <span>Tonggak 2 (Pendidikan Rabbani)</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tajuk Tonggak 2</label>
              <input
                type="text"
                required
                value={form.pillar2Title}
                onChange={(e) => setForm({ ...form, pillar2Title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Penerangan Tonggak 2</label>
              <textarea
                rows={2}
                required
                value={form.pillar2Desc}
                onChange={(e) => setForm({ ...form, pillar2Desc: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan ke Firestore...' : 'Simpan Semua Perubahan Pengenalan'}</span>
        </button>
      </div>
    </form>
  );
};
