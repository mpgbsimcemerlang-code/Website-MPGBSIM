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
  CreditCard,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas-pro';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool } from '../../types';
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

  const isSecondaryMusleh =
    currentUser?.email === 'smimmelaka@gmail.com' ||
    currentUser?.schoolCode === 'JAIM/SAS(M)130' ||
    currentUser?.schoolCode === 'MIA1009' ||
    (currentUser?.membershipNo && (currentUser.membershipNo.includes('JAIM/SAS') || currentUser.membershipNo.includes('MIA1009'))) ||
    (currentUser?.school && (currentUser.school.toLowerCase().includes('menengah') || currentUser.school.toLowerCase().includes('sma')) && currentUser.school.toLowerCase().includes('musleh'));

  const isPrimaryMusleh =
    !isSecondaryMusleh &&
    (currentUser?.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      (currentUser?.email && currentUser.email.toLowerCase().includes('imuslehmelaka')) ||
      (currentUser?.membershipNo && currentUser.membershipNo.includes('MJAC011')) ||
      (currentUser?.school && (currentUser.school.toLowerCase().includes('rendah') || currentUser.school.toLowerCase().includes('sri')) && currentUser.school.toLowerCase().includes('musleh')));

  const matchedSchool: MemberSchool | undefined = isSecondaryMusleh
    ? allSchools.find((s) => s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.id === 'school-musleh-menengah-1' || s.email?.toLowerCase() === 'smimmelaka@gmail.com')
    : isPrimaryMusleh
    ? allSchools.find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1')
    : (currentUser?.schoolId ? allSchools.find((s) => s.id === currentUser.schoolId) : undefined) ||
      allSchools.find((s) => currentUser?.uid === `sch-user-${s.id}` || currentUser?.uid === s.id) ||
      (currentUser?.schoolCode ? allSchools.find((s) => s.code && s.code.toUpperCase() === currentUser.schoolCode?.toUpperCase()) : undefined) ||
      (currentUser?.membershipNo ? allSchools.find((s) => s.code && currentUser.membershipNo?.toUpperCase().includes(s.code.toUpperCase())) : undefined) ||
      (currentUser?.school ? allSchools.find((s) => s.name && s.name.toLowerCase().trim() === currentUser.school?.toLowerCase().trim()) : undefined) ||
      (currentUser?.pgbEmail ? allSchools.find((s) => s.pgbEmail && s.pgbEmail.toLowerCase().trim() === currentUser.pgbEmail?.toLowerCase().trim()) : undefined) ||
      (currentUser?.email ? allSchools.find((s) => {
        const emailMatches = s.email && s.email.toLowerCase() === currentUser.email.toLowerCase();
        if (!emailMatches) return false;
        if (currentUser.schoolType && s.type && currentUser.schoolType.toLowerCase().trim() === s.type.toLowerCase().trim()) return true;
        if (currentUser.position === 'Guru Besar' && s.type?.toLowerCase().includes('rendah')) return true;
        if (currentUser.position === 'Pengetua' && s.type?.toLowerCase().includes('menengah')) return true;
        return false;
      }) : undefined) ||
      allSchools[0];

  const fullName =
    currentUser?.fullName ||
    matchedSchool?.principal ||
    (isSecondaryMusleh ? 'Masitah Binti Seikh Omar (Pengetua)' : isPrimaryMusleh ? 'Ustaz Abdul Qayyum bin Yaakop' : 'Ahli PGB MPGBSIM');

  const position =
    currentUser?.position ||
    matchedSchool?.designation ||
    (isSecondaryMusleh ? 'Pengetua' : isPrimaryMusleh ? 'Guru Besar' : 'Pengetua');

  const school =
    currentUser?.school ||
    matchedSchool?.name ||
    (isSecondaryMusleh ? 'SEKOLAH MENENGAH AGAMA I-MUSLEH' : isPrimaryMusleh ? 'Sekolah Rendah Islam I Musleh' : 'Sekolah Ahli Berdaftar MPGBSIM');

  const schoolType =
    currentUser?.schoolType ||
    matchedSchool?.type ||
    (isSecondaryMusleh ? 'Sekolah Menengah' : isPrimaryMusleh ? 'Sekolah Rendah' : 'Sekolah Menengah');

  const membershipType: 'Ahli Biasa' | 'Ahli Bersekutu' =
    currentUser?.membershipType ||
    matchedSchool?.membershipType ||
    (schoolType === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa');

  const state = currentUser?.state || matchedSchool?.state || 'Melaka';
  const rawCode = currentUser?.schoolCode || currentUser?.membershipNo?.replace(/^MPGB-\d{4}-/, '') || matchedSchool?.code || (isSecondaryMusleh ? 'JAIM/SAS(M)130' : 'MJAC011');
  const effectiveCode = isSecondaryMusleh ? 'JAIM/SAS(M)130' : isPrimaryMusleh ? 'MJAC011' : (rawCode === 'MIA1009' ? 'JAIM/SAS(M)130' : rawCode);

  const membershipNumber = isSecondaryMusleh
    ? 'MPGB-2026-JAIM/SAS(M)130'
    : isPrimaryMusleh
    ? 'MPGB-2026-MJAC011'
    : currentUser?.membershipNo?.replace('MIA1009', 'JAIM/SAS(M)130') || `MPGB-2026-${effectiveCode}`;

  const matchedApp = (siteData.memberApplications || []).find((a) => {
    const codeNorm = (effectiveCode || '').trim().toLowerCase();
    const nameNorm = (school || '').trim().toLowerCase();
    return (
      (codeNorm && (a.schoolCode || '').trim().toLowerCase() === codeNorm) ||
      (nameNorm && (a.schoolName || '').trim().toLowerCase() === nameNorm)
    );
  });

  const icNumber =
    currentUser?.icNumber ||
    matchedSchool?.icNumber ||
    matchedApp?.icNumber ||
    (isSecondaryMusleh ? '730627-01-5156' : isPrimaryMusleh ? '850312-04-5123' : '');
  const photoURL =
    currentUser?.photoURL ||
    matchedSchool?.principalPhotoUrl ||
    (isSecondaryMusleh ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' : '') ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  // Gambar Bangunan Sekolah Masing-Masing (Resolusi Sekolah Ahli)
  const schoolBuildingPhoto =
    currentUser?.schoolPhotoUrl ||
    matchedSchool?.schoolPhotoUrl ||
    (isSecondaryMusleh ? 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80' : undefined) ||
    (isPrimaryMusleh ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80' : undefined) ||
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80';

  // Maklumat Rasmi Sekretariat Kebangsaan MPGBSIM Mengikut Arahan Rasmi
  const MPGBSIM_OFFICIAL_CONTACT = {
    email: 'mpgbsim.cemerlang@gmail.com',
    website: 'https://www.mpgbsim.org/',
    address: 'D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan 43300 Selangor',
    phones: '03-4251 6157, 03-4251 6167',
  };

  const joinYear = currentUser?.joinYear || matchedSchool?.joinYear || 2024;
  const serviceStartYear =
    currentUser?.serviceStartYear || currentUser?.pgbStartYear || (matchedSchool as any)?.serviceStartYear || 2018;

  const verificationPayload = JSON.stringify({
    org: 'MPGBSIM',
    id: membershipNumber,
    name: fullName,
    position,
    school,
    membershipType,
    state,
    status: 'AKTIF',
    validUntil: '31/12/2026',
    email: MPGBSIM_OFFICIAL_CONTACT.email,
    phones: MPGBSIM_OFFICIAL_CONTACT.phones,
    address: MPGBSIM_OFFICIAL_CONTACT.address,
    website: MPGBSIM_OFFICIAL_CONTACT.website,
    verifyUrl: `${MPGBSIM_OFFICIAL_CONTACT.website}verify?memberId=${encodeURIComponent(membershipNumber)}`,
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
    const verifyUrl = `${MPGBSIM_OFFICIAL_CONTACT.website}verify?memberId=${encodeURIComponent(membershipNumber)}`;
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
                className="w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white shadow-2xl border-2 border-amber-400/50 p-6 relative overflow-hidden flex flex-col justify-between min-h-[500px] font-sans"
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
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      <span>AHLI RASMI</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                        membershipType === 'Ahli Bersekutu'
                          ? 'bg-indigo-500/25 border-indigo-400/50 text-indigo-200'
                          : 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300'
                      }`}
                    >
                      {membershipType === 'Ahli Bersekutu' ? 'AHLI BERSEKUTU' : 'AHLI BIASA'}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Photo & Details */}
                <div className="relative z-10 mt-3.5 mb-2 flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={photoURL}
                      alt={fullName}
                      className="w-20 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-xl bg-slate-800"
                      crossOrigin="anonymous"
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
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${
                          membershipType === 'Ahli Bersekutu'
                            ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50'
                            : 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50'
                        }`}
                      >
                        {membershipType}
                      </span>
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

                {/* Gambar Bangunan Sekolah Masing-Masing (Muka Hadapan) */}
                <div className="relative z-10 my-2.5 rounded-2xl overflow-hidden border border-amber-400/40 shadow-lg h-24 bg-slate-900 group">
                  <img
                    src={schoolBuildingPhoto}
                    alt={`Bangunan Sekolah ${school}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent flex items-end justify-between p-2">
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[9.5px] font-bold text-amber-200 truncate">
                        Bangunan: {school}
                      </span>
                    </div>
                    <span className="text-[8px] px-2 py-0.5 rounded-full bg-teal-900/90 text-teal-300 border border-teal-500/50 font-mono font-bold shrink-0">
                      {effectiveCode}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Membership No & QR Code */}
                <div className="relative z-10 pt-2.5 border-t border-teal-800/60 flex items-end justify-between gap-2">
                  <div className="space-y-1">
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider block">
                        NO. KEAHLIAN RASMI:
                      </span>
                      <span className="text-xs font-mono font-black text-amber-300 tracking-wider">
                        {membershipNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[9px]">
                      <div>
                        <span className="text-slate-400 block text-[8px]">TAHUN AHLI:</span>
                        <span className="font-bold text-white">{joinYear}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px]">KATEGORI:</span>
                        <span
                          className={`font-black uppercase ${
                            membershipType === 'Ahli Bersekutu' ? 'text-indigo-300' : 'text-amber-300'
                          }`}
                        >
                          {membershipType}
                        </span>
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
                      <img src={qrCodeUrl} alt="QR Code PGB" className="w-14 h-14 object-contain" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-200 animate-pulse rounded" />
                    )}
                    <span className="text-[7px] font-mono font-bold text-slate-800 mt-0.5 uppercase tracking-tighter">
                      PENGESAHAN
                    </span>
                  </div>
                </div>

                {/* Bottom Bar: Emel, Laman Web & Telefon Rasmi */}
                <div className="relative z-10 mt-2.5 pt-2 text-[8px] text-slate-300 border-t border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-300 font-medium truncate max-w-[210px] flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      {MPGBSIM_OFFICIAL_CONTACT.email}
                    </span>
                    <span className="text-amber-300 font-mono font-semibold flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-teal-400 shrink-0" />
                      03-4251 6157
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="truncate max-w-[240px] text-amber-200/90 font-mono text-[7.5px] flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-teal-400 shrink-0" />
                      {MPGBSIM_OFFICIAL_CONTACT.website}
                    </span>
                    <span className="text-emerald-400 font-semibold text-[7.5px]">SAH 2026</span>
                  </div>
                </div>
              </div>
            ) : (
              /* BACK OF CARD */
              <div
                ref={backCardRef}
                className="w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white shadow-2xl border-2 border-amber-400/50 p-6 relative overflow-hidden flex flex-col justify-between min-h-[500px] font-sans"
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

                <div className="relative z-10 my-3 space-y-2.5 text-[9.5px] text-slate-300 leading-relaxed">
                  <div className="space-y-1 text-slate-300 text-[9px]">
                    <p>1. Kad Digital ini adalah hak milik rasmi Majlis Pengetua & Guru Besar Sekolah Islam Malaysia (MPGBSIM).</p>
                    <p>2. Kad ini mengesahkan status pemegang sebagai Pengetua / Guru Besar institusi berdaftar.</p>
                  </div>

                  {/* Gambar Bangunan Sekolah Masing-Masing Pada Muka Belakang */}
                  <div className="p-2 rounded-2xl bg-slate-900/90 border border-amber-400/40 flex items-center gap-2.5 shadow-md">
                    <img
                      src={schoolBuildingPhoto}
                      alt={`Bangunan Institusi ${school}`}
                      className="w-16 h-12 rounded-xl object-cover border border-amber-400/60 shrink-0 shadow-sm"
                      crossOrigin="anonymous"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[7.5px] font-bold text-teal-300 uppercase tracking-wider block">
                        INSTITUSI SEKOLAH BERDAFTAR
                      </span>
                      <h5 className="text-[10px] font-black text-white truncate leading-tight">
                        {school}
                      </h5>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[8px] text-slate-300 font-mono">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                            membershipType === 'Ahli Bersekutu'
                              ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40'
                              : 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                          }`}
                        >
                          {membershipType}
                        </span>
                        <span className="text-amber-300 font-bold">Kod: {effectiveCode}</span>
                        <span>•</span>
                        <span>{state}</span>
                        <span>•</span>
                        <span className="text-emerald-300">{schoolType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Maklumat Rasmi Sekretariat Kebangsaan MPGBSIM */}
                  <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-700/60 text-[8.5px] text-teal-100 space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-teal-800/80 pb-1">
                      <span className="font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-amber-400" />
                        SEKRETARIAT KEBANGSAAN MPGBSIM
                      </span>
                      <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                        IBU PEJABAT
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-200">
                      <p className="flex items-start gap-1 leading-tight">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-white">Alamat:</strong> {MPGBSIM_OFFICIAL_CONTACT.address}
                        </span>
                      </p>

                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-teal-300 shrink-0" />
                        <span>
                          <strong className="text-white">No. Telefon:</strong> {MPGBSIM_OFFICIAL_CONTACT.phones}
                        </span>
                      </p>

                      <p className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-amber-300 shrink-0" />
                        <span>
                          <strong className="text-white">Emel:</strong>{' '}
                          <a
                            href={`mailto:${MPGBSIM_OFFICIAL_CONTACT.email}`}
                            className="text-amber-300 hover:underline font-medium"
                          >
                            {MPGBSIM_OFFICIAL_CONTACT.email}
                          </a>
                        </span>
                      </p>

                      <p className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-teal-300 shrink-0" />
                        <span>
                          <strong className="text-white">Laman Web:</strong>{' '}
                          <a
                            href={MPGBSIM_OFFICIAL_CONTACT.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-300 underline font-mono text-[8px]"
                          >
                            {MPGBSIM_OFFICIAL_CONTACT.website}
                          </a>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-2.5 border-t border-teal-800/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[7.5px] text-slate-400 block">MOTO KEPIMPINAN:</span>
                    <span className="text-[9.5px] font-bold text-amber-300">
                      "Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani"
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center text-amber-300 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HerePay Official Fee Payment Strip */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-600/40 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-emerald-300 block">Status Yuran Keahlian Sesi 2026/2027</span>
                <span className="text-[11px] text-slate-300">Bayar yuran tahunan institusi secara selamat melalui gerbang rasmi HerePay</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://app.herepay.org/mpgbsim"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <span>Bayar di HerePay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
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
