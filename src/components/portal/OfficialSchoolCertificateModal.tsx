import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileDown,
  Palette,
  Printer,
  QrCode,
  ShieldCheck,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useMemberPortal } from '../../context/MemberPortalContext';
import {
  useAdminContent,
  DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG,
} from '../../context/AdminContentContext';
import {
  CertificateTemplateId,
  MemberSchool,
  MembershipCertificateConfig,
} from '../../types';
import { Logo } from '../Logo';
import { downloadElementAsSinglePagePdf } from '../../utils/pdfGenerator';
import {
  CERTIFICATE_TEMPLATES,
  getCertificateTemplateTheme,
  IslamicCenterWatermark,
  IslamicCornerOrnaments,
  IslamicDividerOrnament,
} from './certificateTemplates';

interface OfficialSchoolCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolOverride?: MemberSchool | null;
  configOverride?: Partial<MembershipCertificateConfig>;
}

export const OfficialSchoolCertificateModal: React.FC<OfficialSchoolCertificateModalProps> = ({
  isOpen,
  onClose,
  schoolOverride,
  configOverride,
}) => {
  const { currentUser, registeredSchools, recordAuditLog } = useMemberPortal();
  const { siteData } = useAdminContent();

  const certRef = useRef<HTMLDivElement | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewTemplateChoice, setPreviewTemplateChoice] = useState<CertificateTemplateId | null>(
    null
  );

  // Merge MembershipCertificateConfig with fallback to ProgramCertificateConfig for Chairman signature if not set
  const baseConfig: MembershipCertificateConfig = {
    ...DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG,
    ...(siteData.programCertificateConfig?.chairmanSignatureImageUrl
      ? {
          chairmanSignatureImageUrl:
            siteData.programCertificateConfig.chairmanSignatureImageUrl,
        }
      : {}),
    ...(siteData.programCertificateConfig?.chairmanName
      ? { chairmanName: siteData.programCertificateConfig.chairmanName }
      : {}),
    ...(siteData.programCertificateConfig?.chairmanRole
      ? { chairmanRole: siteData.programCertificateConfig.chairmanRole }
      : {}),
    ...(siteData.membershipCertificateConfig || {}),
    ...(configOverride || {}),
  };

  // If membershipCertificateConfig has empty string for chairmanSignatureImageUrl, still fall back to programCertificateConfig if available unless overridden
  const effectiveChairmanSigImg =
    configOverride?.chairmanSignatureImageUrl !== undefined
      ? configOverride.chairmanSignatureImageUrl
      : siteData.membershipCertificateConfig?.chairmanSignatureImageUrl ||
        siteData.programCertificateConfig?.chairmanSignatureImageUrl ||
        '';

  useEffect(() => {
    setPreviewTemplateChoice(null);
  }, [isOpen, baseConfig.templateId]);

  const activeTemplateId: CertificateTemplateId =
    previewTemplateChoice || baseConfig.templateId || 'warisan-zaitun';
  const theme = getCertificateTemplateTheme(activeTemplateId);

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

  const rawPrincipalName = schoolOverride
    ? schoolOverride.principal || 'Pengetua / Guru Besar'
    : currentUser?.fullName ||
      matchedSchool?.principal ||
      (isSecondaryMusleh
        ? 'Masitah Binti Seikh Omar'
        : isPrimaryMusleh
        ? 'Ustaz Abdul Qayyum bin Yaakop'
        : 'Pengetua / Guru Besar');

  const principalName = rawPrincipalName.replace(/\s*\((Pengetua|Guru Besar|Mudir)\)\s*$/i, '').trim();

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

  // Item Visibility Flags
  const showRosNumber = baseConfig.showRosNumber !== false;
  const showCertNumber = baseConfig.showCertNumber !== false;
  const showLogo = baseConfig.showLogo !== false;
  const showSchoolLogo = baseConfig.showSchoolLogo !== false;
  const showBasmalah = baseConfig.showBasmalah !== false;
  const showIslamicMotif = baseConfig.showIslamicMotif !== false;
  const showOrgHeader = baseConfig.showOrgHeader !== false;
  const showSchoolAddress = baseConfig.showSchoolAddress !== false;
  const showFasalClassification = baseConfig.showFasalClassification !== false;
  const showPrincipalBlock = baseConfig.showPrincipalBlock !== false;
  const showRecognitionClause = baseConfig.showRecognitionClause !== false;
  const showChairmanSign = baseConfig.showChairmanSign !== false;
  const showQrSeal = baseConfig.showQrSeal !== false;
  const showSecondarySign = baseConfig.showSecondarySign !== false;
  const showIssuedDate = baseConfig.showIssuedDate !== false;
  const showFooterAddress = baseConfig.showFooterAddress !== false;

  const visibleBottomCols =
    (showChairmanSign ? 1 : 0) + (showQrSeal ? 1 : 0) + (showSecondarySign ? 1 : 0);

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
        color: { dark: theme.qrDarkHex, light: '#ffffff' },
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
    theme.qrDarkHex,
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
    <div className="fixed inset-0 z-[130] bg-slate-950/90 backdrop-blur-xs flex flex-col overflow-hidden print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      {/* Top Sticky Action Bar (Hidden in Print) */}
      <div className="no-print shrink-0 w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 text-white shadow-xl z-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pratonton {baseConfig.certificateTitle || 'Sijil Perakuan Keahlian Rasmi'} (Saiz Penuh A4 — 210mm × 297mm)
              </h3>
              <p className="text-[11px] text-slate-400">
                Institusi: <strong className="text-amber-300">{schoolName}</strong> ({effectiveCode})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Template Selector in Preview Bar */}
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={activeTemplateId}
                onChange={(e) =>
                  setPreviewTemplateChoice(e.target.value as CertificateTemplateId)
                }
                className="bg-transparent text-xs font-bold text-amber-200 focus:outline-hidden cursor-pointer"
                title="Tukar Rekaan Template Sijil"
              >
                {CERTIFICATE_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id} className="bg-slate-900 text-white">
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>

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
          <div className="max-w-6xl mx-auto mt-3 p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-md">
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
          className={`shrink-0 w-[794px] min-h-[1123px] ${theme.sheetBgClass} text-slate-900 rounded-xl shadow-2xl p-6 border border-slate-200 flex flex-col justify-between relative box-border`}
        >
          {/* Ornamental Double Border Frame filling Full A4 Height */}
          <div className={`flex-1 rounded-xl p-2 flex flex-col ${theme.outerBorderClass}`}>
            <div
              className={`flex-1 rounded-lg px-8 py-7 relative flex flex-col justify-between overflow-hidden ${theme.innerBorderClass}`}
            >
              {/* Subtle Center Islamic Geometric Rosette Watermark */}
              <IslamicCenterWatermark
                primaryHex={theme.ornamentColorHex}
                secondaryHex={theme.ornamentSecondaryHex}
                showMotif={showIslamicMotif}
              />

              {/* Islamic Geometric Corner Ornaments */}
              <IslamicCornerOrnaments
                primaryHex={theme.ornamentColorHex}
                secondaryHex={theme.ornamentSecondaryHex}
                showMotif={showIslamicMotif}
              />

              {/* TOP SECTION: Serial & Reg No Bar + Crest + Organization Title */}
              <div className="relative z-10">
                {(showRosNumber || showCertNumber) && (
                  <div
                    className={`flex items-center justify-between text-[10.5px] font-mono pb-3.5 border-b ${theme.serialTextClass}`}
                  >
                    <span>
                      {showRosNumber
                        ? baseConfig.rosNumberText || 'NO. PENDAFTARAN ROS: PPM-002-10-23041996'
                        : ''}
                    </span>
                    {showCertNumber && (
                      <span className={`font-bold ${theme.serialHighlightClass}`}>
                        NO. SIJIL: SIJIL/{membershipNumber}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-col items-center text-center">
                  {(showLogo || (showSchoolLogo && logoUrl && logoUrl !== '/mpgbsim-official-logo.png')) && (
                    <div className="flex items-center justify-center gap-4 mb-2.5">
                      {showLogo && <Logo showText={false} size="lg" className="shrink-0" />}
                      {showSchoolLogo && logoUrl && logoUrl !== '/mpgbsim-official-logo.png' && (
                        <img
                          src={logoUrl}
                          alt="Logo Sekolah"
                          crossOrigin="anonymous"
                          className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1 bg-white"
                        />
                      )}
                    </div>
                  )}

                  {showBasmalah && (
                    <p
                      className={`text-lg font-bold ${theme.basmalahColorClass}`}
                      style={{ fontFamily: "'Amiri', serif" }}
                    >
                      {baseConfig.basmalahText || 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'}
                    </p>
                  )}

                  <IslamicDividerOrnament
                    primaryHex={theme.ornamentColorHex}
                    secondaryHex={theme.ornamentSecondaryHex}
                    showMotif={showIslamicMotif}
                  />

                  {showOrgHeader && (
                    <>
                      <h1
                        className={`text-xl font-black uppercase tracking-wide mt-1 ${theme.orgTitleClass}`}
                      >
                        {baseConfig.certificateSubtitle ||
                          'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia'}
                      </h1>
                      {baseConfig.orgRegistrationTagline !== '' && (
                        <p
                          className={`text-xs font-bold uppercase tracking-widest mt-1 ${theme.orgSubClass}`}
                        >
                          {baseConfig.orgRegistrationTagline ||
                            '(MPGBSIM • Pertubuhan Kebangsaan Ditubuhkan Pada 23 April 1996)'}
                        </p>
                      )}
                    </>
                  )}

                  {/* Main Certificate Banner */}
                  <div
                    className={`mt-5 px-8 py-3 rounded-xl text-white shadow-sm border ${theme.titleBannerBgClass}`}
                  >
                    <h2
                      className={`text-2xl font-bold tracking-widest uppercase ${theme.titleBannerTextClass}`}
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {baseConfig.certificateTitle || 'Sijil Perakuan Keahlian Rasmi'}
                    </h2>
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION: Proclamation, School Highlight Box, Principal & Constitutional Rights */}
              <div className="my-5 flex flex-col items-center text-center relative z-10">
                {baseConfig.introText !== '' && (
                  <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                    {baseConfig.introText}
                  </p>
                )}

                {/* School Name & Code Highlight Box */}
                <div
                  className={`mt-5 w-full p-6 rounded-2xl shadow-2xs ${theme.primaryCardBgClass} ${theme.primaryCardBorderClass}`}
                >
                  {baseConfig.institutionCardLabel !== '' && (
                    <span
                      className={`text-[11px] font-bold uppercase tracking-widest block ${theme.primaryCardKickerClass}`}
                    >
                      {baseConfig.institutionCardLabel || 'Institusi Sekolah Ahli Berdaftar'}
                    </span>
                  )}
                  <h3
                    className={`text-2xl font-black uppercase tracking-tight mt-1.5 ${theme.primaryCardTitleClass}`}
                  >
                    {schoolName}
                  </h3>
                  {showSchoolAddress && address && (
                    <p className="text-xs text-slate-600 mt-1.5">{address}</p>
                  )}

                  <div
                    className={`mt-4 pt-4 border-t border-slate-200 grid ${
                      showFasalClassification ? 'grid-cols-3' : 'grid-cols-2'
                    } gap-3 text-xs`}
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Kod Pendaftaran Sekolah
                      </span>
                      <strong
                        className={`font-mono font-bold text-sm ${theme.primaryCardAccentTextClass}`}
                      >
                        {effectiveCode}
                      </strong>
                    </div>
                    {showFasalClassification && (
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
                    )}
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
                {showPrincipalBlock && (
                  <div className="mt-5 w-full grid grid-cols-3 gap-4 text-left p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs">
                    <div className="col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        {baseConfig.principalBlockLabel ||
                          'Perwakilan Kepimpinan Rasmi (Pengetua / Guru Besar):'}
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
                      {baseConfig.activeSessionLabel !== '' && (
                        <span className="text-[11px] text-emerald-700 font-bold">
                          {baseConfig.activeSessionLabel || 'Status Sesi 2026/2027: AKTIF'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Constitutional Recognition Clause */}
                {showRecognitionClause && baseConfig.recognitionClause !== '' && (
                  <div
                    className={`mt-5 w-full p-3.5 rounded-xl border text-[11px] leading-relaxed ${theme.clauseBgClass} ${theme.clauseBorderClass} ${theme.clauseTextClass}`}
                  >
                    {baseConfig.recognitionClause}
                  </div>
                )}
              </div>

              {/* BOTTOM SECTION: Signatures, Official Seal, QR Verification & Footnote */}
              <div className="relative z-10">
                {visibleBottomCols > 0 && (
                  <div
                    className={`pt-5 border-t-2 border-slate-200 grid ${
                      visibleBottomCols === 1
                        ? 'grid-cols-1'
                        : visibleBottomCols === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-3'
                    } gap-4 items-end text-center`}
                  >
                    {/* Left: Pengerusi Signature */}
                    {showChairmanSign && (
                      <div className="flex flex-col items-center">
                        <div className="h-16 flex items-center justify-center mb-1">
                          {effectiveChairmanSigImg ? (
                            <img
                              src={effectiveChairmanSigImg}
                              alt="Tandatangan Digital Pengerusi"
                              crossOrigin="anonymous"
                              className="max-h-16 max-w-[180px] object-contain select-none"
                            />
                          ) : (
                            <div
                              className={`text-xl italic font-serif select-none ${theme.signCalligraphyClass}`}
                              style={{ fontFamily: "'Amiri', serif" }}
                            >
                              {baseConfig.chairmanSignatureText || 'Mohamad Faiz Azizan'}
                            </div>
                          )}
                        </div>
                        <div className="w-44 border-b border-slate-400 mb-1.5" />
                        <strong className="text-[11.5px] font-extrabold text-slate-900 uppercase block">
                          {baseConfig.chairmanName || 'USTAZ MOHAMAD FAIZ BIN AZIZAN'}
                        </strong>
                        <span className={`text-[10px] font-semibold block ${theme.signRoleClass}`}>
                          {baseConfig.chairmanRole || 'Pengerusi Kebangsaan MPGBSIM'}
                        </span>
                        {baseConfig.chairmanOrg !== '' && (
                          <span className="text-[9px] text-slate-500">
                            {baseConfig.chairmanOrg ||
                              'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Center: Official Seal & QR Code */}
                    {showQrSeal && (
                      <div className="flex flex-col items-center justify-center">
                        <div
                          className={`p-2 rounded-xl bg-white border-2 shadow-xs ${theme.qrBorderClass}`}
                        >
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
                        <div
                          className={`mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-bold ${theme.qrBadgeTextClass}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{baseConfig.qrSealLabel || 'METERAI DIGITAL DISAHKAN'}</span>
                        </div>
                        <span className="text-[8.5px] font-mono text-slate-500">
                          {membershipNumber}
                        </span>
                      </div>
                    )}

                    {/* Right: Setiausaha Agung / Urus Setia */}
                    {showSecondarySign && (
                      <div className="flex flex-col items-center">
                        <div className="h-16 flex items-center justify-center mb-1">
                          {baseConfig.secondarySignatureImageUrl ? (
                            <img
                              src={baseConfig.secondarySignatureImageUrl}
                              alt="Tandatangan Setiausaha"
                              crossOrigin="anonymous"
                              className="max-h-16 max-w-[180px] object-contain select-none"
                            />
                          ) : (
                            <div
                              className={`text-xl italic font-serif select-none ${theme.signCalligraphyClass}`}
                              style={{ fontFamily: "'Amiri', serif" }}
                            >
                              {baseConfig.secondarySignatureText || 'Urus Setia Pusat'}
                            </div>
                          )}
                        </div>
                        <div className="w-44 border-b border-slate-400 mb-1.5" />
                        <strong className="text-[11.5px] font-extrabold text-slate-900 uppercase block">
                          {baseConfig.secondarySignatoryName || 'SETIAUSAHA AGUNG & URUS SETIA'}
                        </strong>
                        <span className={`text-[10px] font-semibold block ${theme.signRoleClass}`}>
                          {baseConfig.secondarySignatoryRole || 'Sekretariat Kebangsaan MPGBSIM'}
                        </span>
                        {showIssuedDate && (
                          <span className="text-[9px] text-slate-500">
                            Tarikh Keluaran:{' '}
                            {new Intl.DateTimeFormat('ms-MY', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }).format(new Date())}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Address Footnote */}
                {showFooterAddress && baseConfig.footerAddressText !== '' && (
                  <div className="mt-4 pt-2.5 border-t border-slate-200 text-center">
                    <p className="text-[9px] text-slate-500">
                      {baseConfig.footerAddressText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
