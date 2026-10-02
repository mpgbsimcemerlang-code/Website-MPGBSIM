import React from 'react';
import { Logo } from './Logo';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  ArrowUp,
  ExternalLink,
  Info,
  Lock,
  Settings,
  LogOut
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenPortal }) => {
  const { siteData, isAdmin, logoutAdmin, setIsLoginModalOpen, setIsCMSOpen } = useAdminContent();
  const branding = siteData?.branding || {
    orgName: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    shortName: 'MPGBSIM',
    motto: 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani',
    subMotto: 'Jaringan kepimpinan Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia.',
    secondaryContext: '',
  };
  const contactInfo = siteData?.contactInfo || {
    address: 'Kolej Islam Malaya (KIK), Jalan Universiti, 46350 Petaling Jaya, Selangor',
    email: 'mpgbsim.cemerlang@gmail.com',
    phone: '+60 3-7956 1234',
    whatsapp: '+60 19-345 6789',
    operatingHours: 'Isnin - Jumaat: 8:30 Pagi - 5:00 Petang',
    socialFacebook: 'https://facebook.com',
    socialYoutube: 'https://youtube.com',
    socialTelegram: 'https://t.me',
    socialInstagram: 'https://instagram.com',
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand Profile */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="dark" size="md" />
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-3">
              {branding.subMotto || branding.secondaryContext || 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) merupakan badan kepimpinan pendidikan yang memartabatkan tadbir urus dan kualiti pentadbiran sekolah Islam di Malaysia.'}
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300 font-medium">
              “{branding.motto}”
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="block text-slate-400 text-xs font-semibold mb-2">
                Saluran Komunikasi Rasmi:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={contactInfo.socialFacebook || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-teal-900 transition-colors"
                  aria-label="Facebook MPGBSIM"
                >
                  <span className="font-bold text-xs">f</span>
                </a>
                <a
                  href={contactInfo.socialYoutube || 'https://youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-teal-900 transition-colors"
                  aria-label="YouTube MPGBSIM"
                >
                  <span className="font-bold text-xs">YT</span>
                </a>
                <a
                  href={contactInfo.socialTelegram || 'https://t.me'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-teal-900 transition-colors"
                  aria-label="Saluran Telegram Rasmi PGB"
                >
                  <span className="font-bold text-xs">TG</span>
                </a>
                <a
                  href={contactInfo.socialInstagram || `https://wa.me/${contactInfo.whatsapp?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-teal-900 transition-colors"
                  aria-label="Komunikasi MPGBSIM"
                >
                  <span className="font-bold text-xs">IG</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Pautan Pantas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#utama" className="hover:text-teal-400 transition-colors">
                  Utama
                </a>
              </li>
              <li>
                <a href="#tentang" className="hover:text-teal-400 transition-colors">
                  Tentang MPGBSIM
                </a>
              </li>
              <li>
                <a href="#fokus-strategik" className="hover:text-teal-400 transition-colors">
                  Fokus Strategik
                </a>
              </li>
              <li>
                <a href="#berita" className="hover:text-teal-400 transition-colors">
                  Berita & Pengumuman
                </a>
              </li>
              <li>
                <a href="#kepimpinan" className="hover:text-teal-400 transition-colors">
                  Saf Kepimpinan
                </a>
              </li>
              <li>
                <a href="#sekolah-ahli" className="hover:text-teal-400 transition-colors">
                  Rangkaian Sekolah
                </a>
              </li>
              <li>
                <a href="#program" className="hover:text-teal-400 transition-colors">
                  Takwim Program
                </a>
              </li>
              <li>
                <a href="#best-practice" className="hover:text-teal-400 transition-colors">
                  Amalan Terbaik
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Membership */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Sumber & Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="hover:text-teal-400 transition-colors cursor-pointer text-left"
                >
                  Pusat Sumber Ahli (Khas Ahli PGB)
                </button>
              </li>
              <li>
                <a href="#berita" className="hover:text-teal-400 transition-colors">
                  Warta & Berita Terkini
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Portal Ahli PGB (Log Masuk)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Dasar Privasi & Perlindungan Data
                </button>
              </li>
              <li>
                <a href="#hubungi" className="hover:text-teal-400 transition-colors">
                  Borang Pertanyaan Urus Setia
                </a>
              </li>
            </ul>

            <div className="pt-3">
              <div className="p-3 rounded-lg bg-teal-950/60 border border-teal-800/60 text-[11px] text-teal-200">
                <span className="font-bold text-amber-300 block mb-0.5">{branding.orgName}</span>
                {branding.subMotto}
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line leading-relaxed">
                  {contactInfo.address}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-amber-300 hover:underline"
                >
                  {contactInfo.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{contactInfo.phone} {contactInfo.whatsapp ? `/ ${contactInfo.whatsapp}` : ''}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 whitespace-pre-line">
              Waktu Pejabat: {contactInfo.operatingHours}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer Bar */}
      <div className="border-t border-slate-900 bg-black/40 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="text-center sm:text-left space-y-1">
            <p>
              © {new Date().getFullYear()} {branding.orgName} ({branding.shortName}). Hak Cipta Terpelihara.
            </p>
            <p className="text-slate-400">
              * Nota: Data statistik dan maklumat angka merupakan pemegang tempat (placeholder rasmi) yang sedang dimuktamadkan oleh Majlis.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dasar Privasi
            </button>
            <span>•</span>
            {!isAdmin ? (
              <button
                id="btn-footer-admin-login"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                title="Log masuk pentadbir untuk buka CMS"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Log Masuk Pentadbir (CMS)</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  id="btn-footer-cms-open"
                  type="button"
                  onClick={() => setIsCMSOpen(true)}
                  className="inline-flex items-center gap-1.5 text-teal-300 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pusat Kawalan CMS</span>
                </button>
                <span>•</span>
                <button
                  id="btn-footer-admin-logout"
                  type="button"
                  onClick={logoutAdmin}
                  className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Keluar</span>
                </button>
              </div>
            )}
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              <span>Ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
