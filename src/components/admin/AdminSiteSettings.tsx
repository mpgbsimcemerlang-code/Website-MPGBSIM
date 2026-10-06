import React, { useState, useRef } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  Save,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useAdminContent, BrandingData, ContactInfoData } from '../../context/AdminContentContext';
import { AdminDashboardEditorModal } from './AdminDashboardEditorModal';

export const AdminSiteSettings: React.FC = () => {
  const { siteData, updateBranding, updateContactInfo, syncAllToFirestore } = useAdminContent();
  const [isDashboardEditorOpen, setIsDashboardEditorOpen] = useState(false);

  const [brandingForm, setBrandingForm] = useState<BrandingData>({
    logoUrl: siteData.branding.logoUrl || '/logo.png',
    orgName: siteData.branding.orgName || 'Majlis Pengetua Guru Besar Sekolah Islam Malaysia',
    shortName: siteData.branding.shortName || 'MPGBSIM',
    motto: siteData.branding.motto || 'Menerajui Kecemerlangan Kepimpinan Pendidikan Islam Malaysia',
    subMotto: siteData.branding.subMotto || 'Memperkasa Institusi Pendidikan Islam Malaysia',
    secondaryContext: siteData.branding.secondaryContext || '',
    establishedYear: siteData.branding.establishedYear || '2005',
    registrationNumber: siteData.branding.registrationNumber || 'PPM-012-10-2005',
  });

  const [contactForm, setContactForm] = useState<ContactInfoData>({
    email: siteData.contactInfo.email || 'mpgbsim.cemerlang@gmail.com',
    phone: siteData.contactInfo.phone || '+60 3-8925 4567',
    whatsapp: siteData.contactInfo.whatsapp || '+60 19-334 5678',
    address: siteData.contactInfo.address || 'Aras 3, Kompleks Pendidikan Islam, Bandar Baru Bangi, 43650 Selangor',
    operatingHours: siteData.contactInfo.operatingHours || 'Isnin - Jumaat: 8:30 Pagi - 5:00 Petang',
    socialFacebook: siteData.contactInfo.socialFacebook || 'https://facebook.com/mpgbsim',
    socialYoutube: siteData.contactInfo.socialYoutube || 'https://youtube.com/@mpgbsim',
    socialTelegram: siteData.contactInfo.socialTelegram || 'https://t.me/mpgbsim',
    socialInstagram: siteData.contactInfo.socialInstagram || 'https://instagram.com/mpgbsim',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep form in sync when siteData loads or updates from Firestore
  React.useEffect(() => {
    if (siteData.branding) {
      setBrandingForm((prev) => ({
        ...prev,
        logoUrl: siteData.branding.logoUrl || prev.logoUrl,
        orgName: siteData.branding.orgName || prev.orgName,
        shortName: siteData.branding.shortName || prev.shortName,
        motto: siteData.branding.motto || prev.motto,
        subMotto: siteData.branding.subMotto || prev.subMotto,
        secondaryContext: siteData.branding.secondaryContext || prev.secondaryContext,
        establishedYear: siteData.branding.establishedYear || prev.establishedYear,
        registrationNumber: siteData.branding.registrationNumber || prev.registrationNumber,
      }));
    }
    if (siteData.contactInfo) {
      setContactForm((prev) => ({
        ...prev,
        email: siteData.contactInfo.email || prev.email,
        phone: siteData.contactInfo.phone || prev.phone,
        whatsapp: siteData.contactInfo.whatsapp || prev.whatsapp,
        address: siteData.contactInfo.address || prev.address,
        operatingHours: siteData.contactInfo.operatingHours || prev.operatingHours,
        socialFacebook: siteData.contactInfo.socialFacebook || prev.socialFacebook,
        socialYoutube: siteData.contactInfo.socialYoutube || prev.socialYoutube,
        socialTelegram: siteData.contactInfo.socialTelegram || prev.socialTelegram,
        socialInstagram: siteData.contactInfo.socialInstagram || prev.socialInstagram,
      }));
    }
  }, [siteData.branding, siteData.contactInfo]);

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      console.warn('Sila pilih fail imej logo yang sah.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBrandingForm((prev) => ({
        ...prev,
        logoUrl: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBranding(brandingForm);
      await updateContactInfo(contactForm);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Ralat menyimpan tetapan:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndSyncCloud = async () => {
    setSyncing(true);
    try {
      await updateBranding(brandingForm);
      await updateContactInfo(contactForm);
      await syncAllToFirestore();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Ralat menyegerakkan ke cloud:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Tetapan Laman Web & Organisasi</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kemas kini profil rasmi MPGBSIM, logo pertubuhan, maklumat perhubungan urus setia dan pautan media sosial ke pangkalan data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAndSyncCloud}
            disabled={syncing || saving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Menyegerak Cloud...' : 'Simpan & Segerak Firestore'}</span>
          </button>
          <button
            type="submit"
            disabled={saving || syncing}
            className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-900/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Sedang Menyimpan...' : 'Simpan Tetapan'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tetapan laman web berjaya disimpan dan disegerakkan ke pangkalan data rasmi.</span>
        </div>
      )}

      {/* 1. Organisation Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">1. Maklumat Organisasi MPGBSIM</h4>
            <p className="text-[11px] text-slate-400">Nama rasmi, akronim, moto dan pengenalan persatuan</p>
          </div>
        </div>

        {/* Logo preview & change */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img
                src={brandingForm.logoUrl || '/mpgbsim-official-logo.png'}
                alt="Logo MPGBSIM"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as any).src = '/mpgbsim-official-logo.png';
                }}
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Logo Rasmi MPGBSIM</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Format disyorkan PNG telus beresolusi tinggi (minima 200x200 px).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-teal-600 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              <span>Muat Naik Logo</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Penuh Organisasi
            </label>
            <input
              type="text"
              value={brandingForm.orgName}
              onChange={(e) => setBrandingForm({ ...brandingForm, orgName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Akronim / Singkatan
            </label>
            <input
              type="text"
              value={brandingForm.shortName}
              onChange={(e) => setBrandingForm({ ...brandingForm, shortName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Moto / Cogan Kata
            </label>
            <input
              type="text"
              value={brandingForm.motto}
              onChange={(e) => setBrandingForm({ ...brandingForm, motto: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              No. Pendaftaran ROS / Penubuhan
            </label>
            <input
              type="text"
              value={brandingForm.registrationNumber || ''}
              onChange={(e) => setBrandingForm({ ...brandingForm, registrationNumber: e.target.value })}
              placeholder="cth: PPM-012-10-2005"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-xs">
            URL Logo Terus
          </label>
          <input
            type="url"
            value={brandingForm.logoUrl}
            onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>
      </div>

      {/* 2. Contact Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">2. Maklumat Perhubungan & Urus Setia</h4>
            <p className="text-[11px] text-slate-400">Saluran komunikasi rasmi dipaparkan pada borang hubungi dan footer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Emel Rasmi Urus Setia
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombor Telefon Pejabat
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombor Hotline / WhatsApp
            </label>
            <input
              type="text"
              value={contactForm.whatsapp || ''}
              onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
              placeholder="+60 19-334 5678"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Waktu Operasi Urus Setia
            </label>
            <input
              type="text"
              value={contactForm.operatingHours || 'Isnin - Jumaat: 8:30 Pagi - 5:00 Petang'}
              onChange={(e) => setContactForm({ ...contactForm, operatingHours: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-xs">
            Alamat Pejabat / Urus Setia
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <textarea
              rows={2}
              value={contactForm.address}
              onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 3. Social Media Links */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">3. Pautan Media Sosial Rasmi</h4>
            <p className="text-[11px] text-slate-400">Saluran media sosial dipaparkan di bahagian atas dan bawah laman</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Facebook Rasmi
            </label>
            <input
              type="url"
              value={contactForm.socialFacebook || ''}
              onChange={(e) => setContactForm({ ...contactForm, socialFacebook: e.target.value })}
              placeholder="https://facebook.com/mpgbsim"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Saluran YouTube
            </label>
            <input
              type="url"
              value={contactForm.socialYoutube || ''}
              onChange={(e) => setContactForm({ ...contactForm, socialYoutube: e.target.value })}
              placeholder="https://youtube.com/@mpgbsim"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Saluran Telegram
            </label>
            <input
              type="url"
              value={contactForm.socialTelegram || ''}
              onChange={(e) => setContactForm({ ...contactForm, socialTelegram: e.target.value })}
              placeholder="https://t.me/mpgbsim"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Akaun Instagram / X (Twitter)
            </label>
            <input
              type="url"
              value={contactForm.socialInstagram || ''}
              onChange={(e) => setContactForm({ ...contactForm, socialInstagram: e.target.value })}
              placeholder="https://instagram.com/mpgbsim"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Dashboard Text & Customization Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900/90 via-slate-900 to-teal-950 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Penyesuaian Semua Teks & Ayat Dashboard CMS
            </h3>
          </div>
          <p className="text-xs text-teal-100/80 mt-1 max-w-xl leading-relaxed">
            Ubah apa-apa teks pada Pusat Kawalan CMS seperti ucapan aluan, status, notis pengumuman segera, tajuk 4 kad metrik utama, seksyen permohonan keahlian, dan memo tindakan urus setia.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDashboardEditorOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-md shadow-amber-400/20"
        >
          <Sliders className="w-4 h-4" />
          <span>Buka Editor Dashboard</span>
        </button>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-900/20"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Semua Perubahan</span>
        </button>
      </div>
    </form>

    <AdminDashboardEditorModal
      isOpen={isDashboardEditorOpen}
      onClose={() => setIsDashboardEditorOpen(false)}
    />
  </>
  );
};
