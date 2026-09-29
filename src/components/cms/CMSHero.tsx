import React, { useState } from 'react';
import { useAdminContent, HeroData, BrandingData } from '../../context/AdminContentContext';
import { Layout, Save, CheckCircle, ShieldCheck, Sparkles, Building2, Camera } from 'lucide-react';

export const CMSHero: React.FC = () => {
  const { siteData, updateHero, updateBranding, syncAllToFirestore, setIsLogoModalOpen } = useAdminContent();
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [brandingForm, setBrandingForm] = useState<BrandingData>(
    siteData.branding || {
      logoUrl: '/mpgbsim-official-logo.png',
      orgName: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
      shortName: 'MPGBSIM',
      motto: 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani',
      subMotto: 'Jaringan kepimpinan Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia.',
      secondaryContext:
        'Menyatukan aspirasi kepimpinan SMKA, SABK, Sekolah Islam Swasta dan Institusi Tahfiz ke arah kecemerlangan modal insan bersepadu.',
      establishedYear: '1988',
    }
  );

  const [heroForm, setHeroForm] = useState<HeroData>(
    siteData.hero || {
      badge: 'Badan Kepimpinan Pengetua & Guru Besar Sekolah Islam Kebangsaan',
      btnKenaliText: 'Kenali MPGBSIM',
      btnProgramText: 'Lihat Program',
      btnPortalText: 'Portal Ahli PGB',
      trustPillars: [
        {
          title: 'Jaringan Nasional',
          value: '14 Negeri & Wilayah',
          desc: 'Merangkumi seluruh Malaysia',
        },
        {
          title: 'Sekolah Ahli',
          value: '250+ Institusi',
          desc: 'SMKA, SABK, Swasta & Tahfiz',
        },
        {
          title: 'Pemimpin Pendidikan',
          value: '1,500+ PGB & SLT',
          desc: 'Pengetua & Guru Besar',
        },
        {
          title: 'Generasi Pelajar',
          value: '120,000+ Murid',
          desc: 'Menerima impak kurikulum holistik',
        },
      ],
    }
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateBranding(brandingForm);
    updateHero(heroForm);
    await syncAllToFirestore();
    setIsSaving(false);
    showToast('Elemen Hero Banner & Slogan Utama berjaya dikemaskini dan disegerakkan!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
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
            <Layout className="w-4 h-4 text-teal-300" />
            <span>Modul CMS Hero Banner & Identiti</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Penyesuaian Banner Utama & Moto Rasmi Laman Web
          </h2>
          <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
            Tukar tajuk utama, slogan, keterangan, tahun penubuhan, label butang tindakan dan 4 tonggak maklumat (Trust Pillars).
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

      {/* Identiti & Slogan */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nama Organisasi & Moto Utama</h3>
              <p className="text-xs text-slate-500">Tajuk besar yang dipaparkan pada banner hero.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-teal-700" />
            <span>Tukar Logo Rasmi</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Rasmi Organisasi
            </label>
            <input
              type="text"
              required
              value={brandingForm.orgName}
              onChange={(e) => setBrandingForm({ ...brandingForm, orgName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Singkatan / Akronim
            </label>
            <input
              type="text"
              required
              value={brandingForm.shortName}
              onChange={(e) => setBrandingForm({ ...brandingForm, shortName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-bold text-teal-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Moto Keramat Rasmi (Dipaparkan dengan warna emas di Hero)
            </label>
            <input
              type="text"
              required
              value={brandingForm.motto}
              onChange={(e) => setBrandingForm({ ...brandingForm, motto: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-black text-amber-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sub-Moto / Penerangan Di Bawah Moto
            </label>
            <input
              type="text"
              required
              value={brandingForm.subMotto}
              onChange={(e) => setBrandingForm({ ...brandingForm, subMotto: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Keterangan Lanjutan (Penjelasan Penyatuan Institusi)
            </label>
            <textarea
              rows={2}
              required
              value={brandingForm.secondaryContext}
              onChange={(e) => setBrandingForm({ ...brandingForm, secondaryContext: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tahun Ditubuhkan (Dipaparkan pada lencana tahun)
            </label>
            <input
              type="text"
              required
              value={brandingForm.establishedYear}
              onChange={(e) => setBrandingForm({ ...brandingForm, establishedYear: e.target.value })}
              placeholder="cth: 1988"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Lencana Hero & Butang Tindakan */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Lencana & Butang Tindakan (CTA Buttons)</h3>
            <p className="text-xs text-slate-500">Ubah ayat lencana atas dan 3 butang navigasi utama.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Teks Lencana Atas (Hero Badge)
          </label>
          <input
            type="text"
            required
            value={heroForm.badge}
            onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-semibold text-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Label Butang 1 (Kenali)
            </label>
            <input
              type="text"
              required
              value={heroForm.btnKenaliText}
              onChange={(e) => setHeroForm({ ...heroForm, btnKenaliText: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Label Butang 2 (Program)
            </label>
            <input
              type="text"
              required
              value={heroForm.btnProgramText}
              onChange={(e) => setHeroForm({ ...heroForm, btnProgramText: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Label Butang 3 (Portal PGB)
            </label>
            <input
              type="text"
              required
              value={heroForm.btnPortalText}
              onChange={(e) => setHeroForm({ ...heroForm, btnPortalText: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>
      </div>

      {/* 4 Trust Pillars */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">4 Tonggak Keyakinan (Trust Pillars di Bawah Hero)</h3>
            <p className="text-xs text-slate-500">Angka dan penerangan bagi 4 kad sorotan di bahagian bawah banner.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {heroForm.trustPillars.map((pillar, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-800 text-teal-100">
                Tonggak #{idx + 1}
              </span>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tajuk Tonggak</label>
                <input
                  type="text"
                  required
                  value={pillar.title}
                  onChange={(e) => {
                    const updated = [...heroForm.trustPillars];
                    updated[idx] = { ...updated[idx], title: e.target.value };
                    setHeroForm({ ...heroForm, trustPillars: updated });
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nilai / Angka Paparan</label>
                <input
                  type="text"
                  required
                  value={pillar.value}
                  onChange={(e) => {
                    const updated = [...heroForm.trustPillars];
                    updated[idx] = { ...updated[idx], value: e.target.value };
                    setHeroForm({ ...heroForm, trustPillars: updated });
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-teal-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Penerangan / Kategori</label>
                <input
                  type="text"
                  required
                  value={pillar.desc}
                  onChange={(e) => {
                    const updated = [...heroForm.trustPillars];
                    updated[idx] = { ...updated[idx], desc: e.target.value };
                    setHeroForm({ ...heroForm, trustPillars: updated });
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan ke Firestore...' : 'Simpan Semua Perubahan Hero'}</span>
        </button>
      </div>
    </form>
  );
};
