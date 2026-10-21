import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileDown,
  Printer,
  QrCode,
  ShieldCheck,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool } from '../../types';
import { Logo } from '../Logo';
import { downloadElementAsSinglePagePdf } from '../../utils/pdfGenerator';

interface OfficialSchoolCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolOverride?: MemberSchool | null;
}

export const OfficialSchoolCertificateModal: React.FC<OfficialSchoolCertificateModalProps> = ({
  isOpen,
  onClose,
  schoolOverride,
}) => {
  const { currentUser, registeredSchools, recordAuditLog } = useMemberPortal();
  const { siteData } = useAdminContent();

  const certRef = useRef<HTMLDivElement | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const allSchools =
    registeredSchools && registeredSchools.length > 0
      ? registeredSchools
      : siteData.memberSchools || [];

  const isSecondaryMusleh =
    !schoolOverride &&
    (currentUser?.email === 'smimmelaka@gmail.com' ||
      currentUser?.schoolCode === 'JAIM/SAS(M)130' ||
      currentUser?.schoolCode === 'MIA1009' ||
      (currentUser?.membershipNo &&
        (currentUser.membershipNo.includes('JAIM/SAS') ||
          currentUser.membershipNo.includes('MIA1009'))) ||
      (currentUser?.school &&
        (currentUser.school.toLowerCase().includes('menengah') ||
          currentUser.school.toLowerCase().includes('sma')) &&
        currentUser.school.toLowerCase().includes('musleh')));

  const isPrimaryMusleh =
    !schoolOverride &&
    !isSecondaryMusleh &&
    (currentUser?.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      (currentUser?.email && currentUser.email.toLowerCase().includes('imuslehmelaka')) ||
      (currentUser?.membershipNo && currentUser.membershipNo.includes('MJAC011')) ||
      (currentUser?.school &&
        (currentUser.school.toLowerCase().includes('rendah') ||
          currentUser.school.toLowerCase().includes('sri')) &&
        currentUser.school.toLowerCase().includes('musleh')));

  const matchedSchool: MemberSchool | undefined = schoolOverride
    ? schoolOverride
    : isSecondaryMusleh
    ? allSchools.find(
        (s) =>
          s.code === 'JAIM/SAS(M)130' ||
          s.code === 'MIA1009' ||
          s.id === 'sch-musleh-menengah-1' ||
          s.id === 'school-musleh-menengah-1' ||
          s.email?.toLowerCase() === 'smimmelaka@gmail.com'
      )
    : isPrimaryMusleh
    ? allSchools.find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1')
    : (currentUser?.schoolId
        ? allSchools.find((s) => s.id === currentUser.schoolId)
        : undefined) ||
      allSchools.find(
        (s) => currentUser?.uid === `sch-user-${s.id}` || currentUser?.uid === s.id
      ) ||
      (currentUser?.schoolCode
        ? allSchools.find(
            (s) =>
              s.code && s.code.toUpperCase() === currentUser.schoolCode?.toUpperCase()
          )
        : undefined) ||
      (currentUser?.membershipNo
        ? allSchools.find(
            (s) =>
              s.code &&
              currentUser.membershipNo?.toUpperCase().includes(s.code.toUpperCase())
          )
        : undefined) ||
      (currentUser?.school
        ? allSchools.find(
            (s) =>
              s.name &&
              s.name.toLowerCase().trim() === currentUser.school?.toLowerCase().trim()
          )
        : undefined) ||
      allSchools[0];

  const schoolName = schoolOverride
    ? schoolOverride.name
    : currentUser?.school ||
      matchedSchool?.name ||
      (isSecondaryMusleh
        ? 'SEKOLAH MENENGAH AGAMA I-MUSLEH'
        : isPrimaryMusleh
        ? 'SEKOLAH RENDAH ISLAM I MUSLEH'
        : 'Sekolah Islam Ahli Berdaftar MPGBSIM');

  const principalName = schoolOverride
    ? schoolOverride.principal || 'Pengetua / Guru Besar'
    : currentUser?.fullName ||
      matchedSchool?.principal ||
      (isSecondaryMusleh
        ? 'Masitah Binti Seikh Omar'
        : isPrimaryMusleh
        ? 'Ustaz Abdul Qayyum bin Yaakop'
        : 'Pengetua / Guru Besar');

  const position = schoolOverride
    ? schoolOverride.designation ||
      (schoolOverride.type?.toLowerCase().includes('rendah') ? 'Guru Besar' : 'Pengetua')
    : currentUser?.position ||
      matchedSchool?.designation ||
      (isSecondaryMusleh ? 'Pengetua' : isPrimaryMusleh ? 'Guru Besar' : 'Pengetua');

  const schoolType = schoolOverride
    ? schoolOverride.type || 'Sekolah Menengah'
    : currentUser?.schoolType ||
      matchedSchool?.type ||
      (isSecondaryMusleh
        ? 'Sekolah Menengah'
        : isPrimaryMusleh
        ? 'Sekolah Rendah'
        : 'Sekolah Menengah');

  const membershipType: 'Ahli Biasa' | 'Ahli Bersekutu' = schoolOverride
    ? schoolOverride.membershipType ||
      (schoolOverride.type === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa')
    : currentUser?.membershipType ||
      matchedSchool?.membershipType ||
      (schoolType === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa');

  const state = schoolOverride
    ? schoolOverride.state || 'Malaysia'
    : currentUser?.state || matchedSchool?.state || 'Melaka';

  const address = schoolOverride
    ? schoolOverride.address || `${schoolOverride.district || ''}, ${schoolOverride.state || ''}`
    : currentUser?.address ||
      matchedSchool?.address ||
      (isSecondaryMusleh
        ? 'Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka'
        : 'Batu 4 1/2, Jalan Peringgit, 75400 Melaka');

  const rawCode = schoolOverride
    ? schoolOverride.code || 'MPGB'
    : currentUser?.schoolCode ||
      currentUser?.membershipNo?.replace(/^MPGB-\d{4}-/, '') ||
      matchedSchool?.code ||
      (isSecondaryMusleh ? 'JAIM/SAS(M)130' : 'MJAC011');

  const effectiveCode = schoolOverride
    ? rawCode === 'MIA1009'
      ? 'JAIM/SAS(M)130'
      : rawCode
    : isSecondaryMusleh
    ? 'JAIM/SAS(M)130'
    : isPrimaryMusleh
    ? 'MJAC011'
    : rawCode === 'MIA1009'
    ? 'JAIM/SAS(M)130'
    : rawCode;

  const membershipNumber = schoolOverride
    ? `MPGB-2026-${effectiveCode}`
    : isSecondaryMusleh
    ? 'MPGB-2026-JAIM/SAS(M)130'
    : isPrimaryMusleh
    ? 'MPGB-2026-MJAC011'
    : currentUser?.membershipNo?.replace('MIA1009', 'JAIM/SAS(M)130') ||
      `MPGB-2026-${effectiveCode}`;

  const rawJoinYear = schoolOverride
    ? schoolOverride.joinYear
    : currentUser?.joinYear || matchedSchool?.joinYear;
  const joinYear =
    isPrimaryMusleh && (!rawJoinYear || Number(rawJoinYear) === 2026)
      ? 2011
      : rawJoinYear || (isSecondaryMusleh ? 2023 : 2024);

  const logoUrl = schoolOverride
    ? schoolOverride.logoUrl || '/mpgbsim-official-logo.png'
    : currentUser?.logoUrl ||
      matchedSchool?.logoUrl ||
      '/mpgbsim-official-logo.png';

  useEffect(() => {
    if (!isOpen) return;
    const payload = JSON.stringify({
      type: 'SIJIL_RASMI_KEAHLIAN_MPGBSIM',
      regNo: 'PPM-002-10-23041996',
      certificateNo: `SIJIL-${membershipNumber}`,
      school: schoolName,
      schoolCode: effectiveCode,
      membershipCategory:
        membershipType === 'Ahli Bersekutu'
          ? 'Ahli Bersekutu (Fasal 4(3))'
          : 'Ahli Biasa (Fasal 4(2))',
      principal: principalName,
      state,
      joinYear,
      status: 'SAH & AKTIF (SESI 2026/2027)',
      verifyUrl: `https://www.mpgbsim.org/?verify=${encodeURIComponent(membershipNumber)}`,
    });

    QRCode.toDataURL(
      payload,
      {
        width: 220,
        margin: 1,
        color: { dark: '#064e3b', light: '#ffffff' },
      },
      (err, url) => {
        if (!err && url) setQrCodeUrl(url);
      }
    );
  }, [
    isOpen,
    membershipNumber,
    schoolName,
    effectiveCode,
    membershipType,
    principalName,
    state,
    joinYear,
  ]);

  if (!isOpen) return null;

  const handleDownloadCertificatePdf = async () => {
    if (!certRef.current || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setDownloadSuccess(false);
    try {
      const safeCode = (effectiveCode || 'SEKOLAH').replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadElementAsSinglePagePdf(
        certRef.current,
        `Sijil_Rasmi_Keahlian_MPGBSIM_${safeCode}.pdf`
      );
      recordAuditLog(
        'Muat Turun Sijil Rasmi Keahlian (PDF)',
        `Memuat turun Sijil Perakuan Keahlian Rasmi (Format PDF Saiz A4) bagi institusi ${schoolName} (Kod: ${effectiveCode}, No. Ahli: ${membershipNumber}).`,
        {
          schoolName,
          schoolCode: effectiveCode,
          state,
          membershipNo: membershipNumber,
          category: 'SIJIL_KAD',
        }
      );
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.error('Error generating certificate PDF:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex flex-col overflow-hidden print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      {/* Top Sticky Action Bar (Hidden in Print) */}
      <div className="no-print shrink-0 w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 text-white shadow-xl z-20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pratonton Sijil Perakuan Keahlian Rasmi (Saiz Penuh A4 — 210mm × 297mm)
              </h3>
              <p className="text-[11px] text-slate-400">
                Tatal (scroll) ke bawah untuk menyemak keseluruhan sijil sebelum muat turun PDF atau cetak penuh 1 muka surat A4.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={handleDownloadCertificatePdf}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-slate-950" />
              <span>
                {isDownloadingPdf
                  ? 'Menjana Sijil PDF A4...'
                  : 'Muat Turun Sijil PDF (Penuh A4)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                recordAuditLog(
                  'Cetak Sijil Rasmi Keahlian (A4)',
                  `Mencetak Sijil Perakuan Keahlian Rasmi (Saiz A4) bagi institusi ${schoolName} (Kod: ${effectiveCode}, No. Ahli: ${membershipNumber}).`,
                  {
                    schoolName,
                    schoolCode: effectiveCode,
                    state,
                    membershipNo: membershipNumber,
                    category: 'SIJIL_KAD',
                  }
                );
                window.print();
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak Sijil (Penuh A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="max-w-5xl mx-auto mt-3 p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Sijil Rasmi Keahlian Sekolah MPGBSIM (Saiz Penuh 1 Muka Surat A4) telah berjaya dimuat turun!
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-700 px-2 py-0.5 rounded">
              SAIZ PENUH A4
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Preview Viewport */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center justify-start print:p-0 print:overflow-visible">
        {/* Official Certificate Sheet (Exact Full 1-Page A4 Portrait: 794px x 1123px) */}
        <div
          ref={certRef}
          id="official-profile-print-area"
          className="shrink-0 w-[794px] min-h-[1123px] bg-white text-slate-900 rounded-xl shadow-2xl p-6 border border-slate-200 flex flex-col justify-between relative box-border"
        >
          {/* Ornamental Double Border Frame filling Full A4 Height */}
          <div className="flex-1 border-[3.5px] border-teal-900 rounded-xl p-2 bg-gradient-to-b from-amber-50/25 via-white to-teal-50/25 flex flex-col">
            <div className="flex-1 border-[1.5px] border-amber-500/80 rounded-lg px-8 py-7 relative flex flex-col justify-between">
              {/* Corner Accents */}
              <div className="w-5 h-5 border-t-2 border-l-2 border-amber-600 absolute top-3 left-3" />
              <div className="w-5 h-5 border-t-2 border-r-2 border-amber-600 absolute top-3 right-3" />
              <div className="w-5 h-5 border-b-2 border-l-2 border-amber-600 absolute bottom-3 left-3" />
              <div className="w-5 h-5 border-b-2 border-r-2 border-amber-600 absolute bottom-3 right-3" />

              {/* TOP SECTION: Serial & Reg No Bar + Crest + Organization Title */}
              <div>
                <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-500 pb-3.5 border-b border-slate-200">
                  <span>NO. PENDAFTARAN ROS: PPM-002-10-23041996</span>
                  <span className="font-bold text-teal-900">
                    NO. SIJIL: SIJIL/{membershipNumber}
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <Logo showText={false} size="lg" className="shrink-0" />
                    {logoUrl && logoUrl !== '/mpgbsim-official-logo.png' && (
                      <img
                        src={logoUrl}
                        alt="Logo Sekolah"
                        crossOrigin="anonymous"
                        className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1 bg-white"
                      />
                    )}
                  </div>

                  <p
                    className="text-lg font-bold text-teal-900"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                  </p>

                  <h1 className="text-xl font-black text-teal-950 uppercase tracking-wide mt-1.5">
                    Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia
                  </h1>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mt-1">
                    (MPGBSIM • Pertubuhan Kebangsaan Ditubuhkan Pada 23 April 1996)
                  </p>

                  {/* Main Certificate Banner */}
                  <div className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-white shadow-sm border border-amber-400/60">
                    <h2
                      className="text-2xl font-bold tracking-widest uppercase text-amber-300"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Sijil Perakuan Keahlian Rasmi
                    </h2>
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION: Proclamation, School Highlight Box, Principal & Constitutional Rights */}
              <div className="my-6 flex flex-col items-center text-center">
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Dengan ini diperakui dan disahkan bahawa institusi pendidikan Islam yang tersebut di bawah adalah merupakan ahli berdaftar yang sah di bawah Perlembagaan Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM):
                </p>

                {/* School Name & Code Highlight Box */}
                <div className="mt-5 w-full p-6 rounded-2xl bg-slate-50 border-2 border-teal-800/30 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700 block">
                    Institusi Sekolah Ahli Berdaftar
                  </span>
                  <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mt-1.5">
                    {schoolName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5">{address}</p>

                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Kod Pendaftaran Sekolah
                      </span>
                      <strong className="font-mono font-bold text-teal-900 text-sm">
                        {effectiveCode}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Klasifikasi Fasal 4
                      </span>
                      <strong className="font-bold text-amber-800 text-sm">
                        {membershipType === 'Ahli Bersekutu'
                          ? 'Ahli Bersekutu (Fasal 4(3))'
                          : 'Ahli Biasa (Fasal 4(2))'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Negeri & Kategori
                      </span>
                      <strong className="font-bold text-slate-900 text-sm">
                        {state} • {schoolType}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Principal / Representative Block */}
                <div className="mt-5 w-full grid grid-cols-3 gap-4 text-left p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs">
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Perwakilan Kepimpinan Rasmi (Pengetua / Guru Besar):
                    </span>
                    <strong className="text-base font-extrabold text-teal-950 block mt-0.5">
                      {principalName}
                    </strong>
                    <span className="text-xs text-teal-800 font-semibold">
                      Jawatan: {position}
                    </span>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Tahun Mula Keahlian:
                    </span>
                    <strong className="text-base font-mono font-black text-amber-800">
                      Tahun {joinYear}
                    </strong>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Status Sesi 2026/2027: AKTIF
                    </span>
                  </div>
                </div>

                {/* Constitutional Recognition Clause */}
                <div className="mt-5 w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-[11px] text-slate-600 leading-relaxed">
                  Institusi ini diiktiraf secara rasmi dalam jaringan kebangsaan MPGBSIM serta layak menikmati semua keistimewaan kepimpinan, pembangunan profesionalisme PGB, penyelarasan kurikulum bersepadu, dan jaringan kerjasama strategik pendidikan Islam seluruh Malaysia.
                </div>
              </div>

              {/* BOTTOM SECTION: Signatures, Official Seal, QR Verification & Footnote */}
              <div>
                <div className="pt-5 border-t-2 border-slate-200 grid grid-cols-3 gap-4 items-end text-center">
                  {/* Left: Pengerusi Signature */}
                  <div className="flex flex-col items-center">
                    <div
                      className="text-lg text-teal-900 italic font-serif mb-1 select-none"
                      style={{ fontFamily: "'Amiri', serif" }}
                    >
                      Mohamad Faiz Azizan
                    </div>
                    <div className="w-44 border-b border-slate-400 mb-1.5" />
                    <strong className="text-[11.5px] font-extrabold text-slate-900 block">
                      USTAZ MOHAMAD FAIZ BIN AZIZAN
                    </strong>
                    <span className="text-[10px] text-teal-800 font-semibold block">
                      Pengerusi Kebangsaan MPGBSIM
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia
                    </span>
                  </div>

                  {/* Center: Official Seal & QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2 rounded-xl bg-white border-2 border-amber-500/70 shadow-xs">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Pengesahan Sijil"
                          className="w-20 h-20 object-contain"
                        />
                      ) : (
                        <QrCode className="w-16 h-16 text-teal-950" />
                      )}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-bold text-teal-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>METERAI DIGITAL DISAHKAN</span>
                    </div>
                    <span className="text-[8.5px] font-mono text-slate-500">
                      {membershipNumber}
                    </span>
                  </div>

                  {/* Right: Setiausaha Agung / Urus Setia */}
                  <div className="flex flex-col items-center">
                    <div
                      className="text-lg text-teal-900 italic font-serif mb-1 select-none"
                      style={{ fontFamily: "'Amiri', serif" }}
                    >
                      Urus Setia Pusat
                    </div>
                    <div className="w-44 border-b border-slate-400 mb-1.5" />
                    <strong className="text-[11.5px] font-extrabold text-slate-900 block">
                      SETIAUSAHA AGUNG & URUS SETIA
                    </strong>
                    <span className="text-[10px] text-teal-800 font-semibold block">
                      Sekretariat Kebangsaan MPGBSIM
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Tarikh Keluaran:{' '}
                      {new Intl.DateTimeFormat('ms-MY', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date())}
                    </span>
                  </div>
                </div>

                {/* Bottom Address Footnote */}
                <div className="mt-4 pt-2.5 border-t border-slate-200 text-center">
                  <p className="text-[9px] text-slate-500">
                    Sekretariat MPGBSIM: D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor • Tel: 03-4251 6157 / 03-4251 6167 • Laman Web Rasmi: https://www.mpgbsim.org/
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
