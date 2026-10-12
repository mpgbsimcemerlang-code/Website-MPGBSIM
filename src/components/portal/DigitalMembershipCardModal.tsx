import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  School,
  GraduationCap,
  Award,
  Share2,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas-pro';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { Logo } from '../Logo';

interface DigitalMembershipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalMembershipCardModal: React.FC<DigitalMembershipCardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, registeredSchools } = useMemberPortal();
  const { siteData } = useAdminContent();

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  // Match Member School Data
  const allSchools =
    registeredSchools && registeredSchools.length > 0
      ? registeredSchools
      : siteData.memberSchools || [];

  const isMuslehProfile =
    currentUser?.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
    (currentUser?.email && currentUser.email.toLowerCase().includes('imusleh')) ||
    (currentUser?.school && currentUser.school.toLowerCase().includes('musleh')) ||
    (currentUser?.membershipNo &&
      (currentUser.membershipNo.includes('MIA1009') || currentUser.membershipNo.includes('MJAC011')));

  const matchedSchool =
    allSchools.find((s) => {
      if (isMuslehProfile && (s.code === 'MJAC011' || s.id === 'sch-musleh-1' || s.name.toLowerCase().includes('musleh')))
        return true;
      if (currentUser?.membershipNo && s.code && currentUser.membershipNo.includes(s.code)) return true;
      if (currentUser?.email && s.email && currentUser.email.toLowerCase() === s.email.toLowerCase()) return true;
      if (currentUser?.school && s.name && currentUser.school.toLowerCase().trim() === s.name.toLowerCase().trim())
        return true;
      return false;
    }) || allSchools[0];

  const fullName = currentUser?.fullName || matchedSchool?.principal || 'Ustaz Abdul Qayyum bin Yaakop';
  const position = currentUser?.position || (isMuslehProfile ? 'Guru Besar' : 'Pengetua');
  const school = currentUser?.school || matchedSchool?.name || 'Sekolah Rendah Islam I Musleh';
  const schoolType = currentUser?.schoolType || matchedSchool?.type || (isMuslehProfile ? 'Rakan Musleh' : 'Sekolah Menengah');
  const state = currentUser?.state || matchedSchool?.state || 'Melaka';
  const rawCode = currentUser?.membershipNo?.split('-').pop() || matchedSchool?.code || 'MJAC011';
  const effectiveCode = isMuslehProfile || rawCode === 'MIA1009' ? 'MJAC011' : rawCode;

  const membershipNumber = isMuslehProfile
    ? 'MPGB-2026-MJAC011'
    : currentUser?.membershipNo?.replace('MIA1009', 'MJAC011') || `MPGB-2026-${effectiveCode}`;

  const icNumber = currentUser?.icNumber || (matchedSchool as any)?.icNumber || '850312-04-5123';
  const photoURL =
    currentUser?.photoURL ||
    matchedSchool?.principalPhotoUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const joinYear = currentUser?.joinYear || matchedSchool?.joinYear || 2024;
  const serviceStartYear =
    currentUser?.serviceStartYear || currentUser?.pgbStartYear || (matchedSchool as any)?.serviceStartYear || 2018;

  const verificationPayload = JSON.stringify({
    org: 'MPGBSIM',
    id: membershipNumber,
    name: fullName,
    position,
    school,
    state,
    status: 'AKTIF',
    validUntil: '31/12/2026',
    verifyUrl: `https://mpgbsim.edu.my/verify?memberId=${encodeURIComponent(membershipNumber)}`,
  });

  // Generate QR Code Data URL on mount / modal open
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(
      verificationPayload,
      {
        width: 300,
        margin: 1,
        color: {
          dark: '#064e3b',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
        } else {
          setQrCodeUrl(url);
        }
      }
    );
  }, [isOpen, verificationPayload]);

  if (!isOpen) return null;

  const handleDownloadCard = async () => {
    const targetRef = activeSide === 'front' ? cardRef : backCardRef;
    if (!targetRef.current) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      // Allow images to attempt CORS loading
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#022c22',
        logging: false,
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Kad_Keahlian_MPGBSIM_${cleanName}_${activeSide.toUpperCase()}.png`;
      link.href = image;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Ralat semasa memuat turun kad keahlian:', err);
      alert('Gagal menjana imej kad. Sila cuba lagi atau guna butang Cetak.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleCopyVerificationLink = () => {
    const verifyUrl = `https://mpgbsim.edu.my/verify?memberId=${encodeURIComponent(membershipNumber)}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Kad Digital Pengesahan Ahli
              </div>
              <h2 className="text-lg font-black text-white">Kad Keahlian Digital MPGBSIM</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Card View Switcher */}
          <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSide('front')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSide === 'front'
                    ? 'bg-teal-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Muka Hadapan (Front)
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSide === 'back'
                    ? 'bg-teal-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Muka Belakang (Back)
              </button>
            </div>

            <button
              onClick={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Pusing Kad</span>
            </button>
          </div>

          {/* DIGITAL CARD DISPLAY CONTAINER */}
          <div className="flex justify-center my-2">
            {activeSide === 'front' ? (
              /* FRONT OF CARD */
              <div
                ref={cardRef}
                className="w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white shadow-2xl border-2 border-amber-400/50 p-6 relative overflow-hidden flex flex-col justify-between min-h-[440px] font-sans"
              >
                {/* Metallic Accent Waves */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Card Top Header */}
                <div className="relative z-10 border-b border-amber-500/30 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Logo showText={false} size="sm" className="shrink-0" />
                    <div>
                      <h4 className="text-[11px] font-black tracking-wider text-amber-300 uppercase leading-none">
                        MAJLIS PENGETUA & GURU BESAR
                      </h4>
                      <h5 className="text-[9px] font-semibold text-slate-200 tracking-wider uppercase mt-0.5">
                        SEKOLAH ISLAM MALAYSIA (MPGBSIM)
                      </h5>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>AHLI RASMI</span>
                  </div>
                </div>

                {/* Card Middle: Photo & Details */}
                <div className="relative z-10 my-4 flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={photoURL}
                      alt={fullName}
                      className="w-20 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-xl bg-slate-800"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-amber-500 text-slate-950 rounded-full shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[9px] font-bold text-teal-300 uppercase tracking-widest block">
                      {position}
                    </span>
                    <h3 className="text-sm font-black text-white leading-tight break-words">
                      {fullName}
                    </h3>
                    <p className="text-[11px] font-semibold text-amber-200/90 leading-tight">
                      {school}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                        {state}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                        Kod: {effectiveCode}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                        {schoolType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Membership No & QR Code */}
                <div className="relative z-10 pt-3 border-t border-teal-800/60 flex items-end justify-between gap-2">
                  <div className="space-y-1">
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider block">
                        NO. KEAHLIAN RASMI:
                      </span>
                      <span className="text-xs font-mono font-black text-amber-300 tracking-wider">
                        {membershipNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[9px]">
                      <div>
                        <span className="text-slate-400 block text-[8px]">TAHUN AHLI:</span>
                        <span className="font-bold text-white">{joinYear}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px]">STATUS:</span>
                        <span className="font-bold text-emerald-400">BERDAFTAR</span>
                      </div>
                    </div>
                  </div>

                  {/* Generated QR Code */}
                  <div className="p-1.5 rounded-2xl bg-white text-slate-900 shadow-lg flex flex-col items-center justify-center shrink-0 border border-amber-400/50">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code PGB" className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 animate-pulse rounded" />
                    )}
                    <span className="text-[7px] font-mono font-bold text-slate-800 mt-0.5 uppercase tracking-tighter">
                      PENGESAHAN
                    </span>
                  </div>
                </div>

                {/* Bottom Bar Stamp */}
                <div className="relative z-10 mt-3 pt-2 text-[8px] text-slate-400 flex items-center justify-between border-t border-slate-800/50">
                  <span>Dikeluarkan oleh Ibu Pejabat MPGBSIM</span>
                  <span className="text-amber-300 font-semibold">SAH SEHINGGA 2026</span>
                </div>
              </div>
            ) : (
              /* BACK OF CARD */
              <div
                ref={backCardRef}
                className="w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white shadow-2xl border-2 border-amber-400/50 p-6 relative overflow-hidden flex flex-col justify-between min-h-[440px] font-sans"
              >
                <div className="relative z-10 border-b border-amber-500/30 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-extrabold tracking-wider text-white">
                      TERMA & SYARAT KEAHLIAN RASMI
                    </span>
                  </div>
                  <span className="text-[9px] text-amber-300 font-mono">MPGBSIM-VERIFIED</span>
                </div>

                <div className="relative z-10 my-4 space-y-3 text-[10px] text-slate-300 leading-relaxed">
                  <p>
                    1. Kad Digital ini adalah hak milik rasmi Majlis Pengetua & Guru Besar Sekolah Islam Malaysia (MPGBSIM).
                  </p>
                  <p>
                    2. Kad ini mengesahkan status pemegang sebagai Pengetua / Guru Besar / Kepimpinan Sekolah Islam yang berdaftar.
                  </p>
                  <p>
                    3. Imbas Kod QR di muka hadapan untuk pengesahan identiti dan ketelusan status keahlian dalam talian.
                  </p>

                  <div className="p-3 rounded-2xl bg-teal-900/40 border border-teal-700/50 text-[9px] text-teal-200 space-y-1">
                    <span className="font-bold text-amber-300 block">SEKRETARIAT KEBANGSAAN MPGBSIM:</span>
                    <p>Pejabat Agong MPGBSIM, Kompleks Pendidikan Islam, Melaka</p>
                    <p>Emel: info@mpgbsim.edu.my | Tel: +60 6-335 1290</p>
                    <p>Laman Web Rasmi: https://mpgbsim.edu.my</p>
                  </div>
                </div>

                <div className="relative z-10 pt-3 border-t border-teal-800/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-400 block">MOTO UMMAT:</span>
                    <span className="text-[10px] font-bold text-amber-300">
                      "Memimpin Transformasi Pendidikan Islam Kebangsaan"
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center text-amber-300">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="px-4 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              {isDownloading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <Download className="w-4 h-4 text-amber-300" />
              )}
              <span>{isDownloading ? 'Menjana Imej HD...' : 'Muat Turun PNG (HD)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintCard}
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyVerificationLink}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-slate-950" />
              ) : (
                <Copy className="w-4 h-4 text-slate-950" />
              )}
              <span>{copiedLink ? 'Pautan Disalin!' : 'Salin Pautan QR'}</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Imej Kad Keahlian Digital telah berjaya dimuat turun ke peranti anda!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
