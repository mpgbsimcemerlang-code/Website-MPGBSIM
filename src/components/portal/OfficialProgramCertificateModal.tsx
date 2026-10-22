import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileDown,
  Printer,
  QrCode,
  ShieldCheck,
  Calendar,
  MapPin,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  useAdminContent,
  DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
} from '../../context/AdminContentContext';
import { EventRegistration, ProgramEvent, ProgramCertificateConfig } from '../../types';
import { Logo } from '../Logo';
import { downloadElementAsSinglePagePdf } from '../../utils/pdfGenerator';

interface OfficialProgramCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: EventRegistration | null;
  programEvent?: ProgramEvent | null;
  configOverride?: Partial<ProgramCertificateConfig>;
  onAuditDownload?: (certNo: string, eventTitle: string) => void;
}

export const OfficialProgramCertificateModal: React.FC<OfficialProgramCertificateModalProps> = ({
  isOpen,
  onClose,
  registration,
  programEvent,
  configOverride,
  onAuditDownload,
}) => {
  const { siteData } = useAdminContent();
  const certRef = useRef<HTMLDivElement | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const baseConfig: ProgramCertificateConfig = {
    ...DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
    ...(siteData.programCertificateConfig || {}),
    ...(configOverride || {}),
  };

  const matchedProgram: ProgramEvent | undefined =
    programEvent ||
    (registration?.eventId
      ? (siteData.programs || []).find((p) => p.id === registration.eventId)
      : undefined);

  const effectiveCertificateTitle =
    (configOverride?.certificateTitle !== undefined
      ? configOverride.certificateTitle
      : registration?.certificateTitleOverride?.trim() ||
        matchedProgram?.certificateTitleOverride?.trim() ||
        baseConfig.certificateTitle) || 'SIJIL PENYERTAAN PROGRAM';

  const effectiveProgramTitle =
    matchedProgram?.certificateProgramNameOverride?.trim() ||
    matchedProgram?.title ||
    registration?.eventTitle ||
    'Program Pembangunan Profesionalisme Kepimpinan MPGBSIM';

  const effectiveTheme =
    matchedProgram?.theme || 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani';
  const effectiveDate = matchedProgram?.date || registration?.eventDate || 'Sesi 2026/2027';
  const effectiveTime = matchedProgram?.time || 'Sepenuh Hari';
  const effectiveVenue =
    matchedProgram?.venue || registration?.eventVenue || 'Kompleks Pendidikan Islam Kebangsaan';
  const effectiveMode = matchedProgram?.mode || registration?.eventMode || 'Fizikal';

  const participantName =
    registration?.participantName || 'Pengetua / Guru Besar Ahli MPGBSIM';
  const participantPosition = registration?.position || 'Pengetua / Guru Besar';
  const participantIc = registration?.icNumber || '';
  const schoolName = registration?.schoolName || 'Sekolah Islam Ahli Berdaftar MPGBSIM';
  const schoolCode = registration?.schoolCode || registration?.attendanceCode || 'MPGBSIM';
  const stateName = registration?.state || 'Malaysia';

  const certificateNo =
    registration?.certificateNo ||
    `MPGBSIM/SIJIL/2026/${(registration?.eventId || 'PROG')
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase()
      .slice(-4)}/${schoolCode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 10)}`;

  const issuedDateFormatted = React.useMemo(() => {
    const rawDate = registration?.certificateIssuedAt || registration?.attendedAt;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        return new Intl.DateTimeFormat('ms-MY', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(parsed);
      }
    }
    return new Intl.DateTimeFormat('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, [registration?.certificateIssuedAt, registration?.attendedAt]);

  useEffect(() => {
    if (!isOpen) return;
    const payload = JSON.stringify({
      type: 'SIJIL_PENYERTAAN_PROGRAM_MPGBSIM',
      regNo: 'PPM-002-10-23041996',
      certificateNo,
      certificateTitle: effectiveCertificateTitle,
      participant: participantName,
      position: participantPosition,
      school: schoolName,
      schoolCode,
      program: effectiveProgramTitle,
      date: effectiveDate,
      venue: effectiveVenue,
      status: 'HADIR & DISAHKAN OLEH URUS SETIA MPGBSIM',
      verifyUrl: `https://www.mpgbsim.org/?verify_cert=${encodeURIComponent(certificateNo)}`,
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
    certificateNo,
    effectiveCertificateTitle,
    participantName,
    participantPosition,
    schoolName,
    schoolCode,
    effectiveProgramTitle,
    effectiveDate,
    effectiveVenue,
  ]);

  if (!isOpen || !registration) return null;

  const handleDownloadPdf = async () => {
    if (!certRef.current || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setDownloadSuccess(false);
    try {
      const safeName = participantName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      const safeProg = effectiveProgramTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35);
      await downloadElementAsSinglePagePdf(
        certRef.current,
        `Sijil_Penyertaan_${safeProg}_${safeName}.pdf`
      );
      if (onAuditDownload) {
        onAuditDownload(certificateNo, effectiveProgramTitle);
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.error('Error generating program certificate PDF:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950/90 backdrop-blur-xs flex flex-col overflow-hidden print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      {/* Top Sticky Action Bar (Hidden in Print) */}
      <div className="no-print shrink-0 w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 text-white shadow-xl z-20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pratonton {effectiveCertificateTitle} (Saiz Penuh A4 — 210mm × 297mm)
              </h3>
              <p className="text-[11px] text-slate-400">
                Program: <strong className="text-amber-300">{effectiveProgramTitle}</strong> • Peserta:{' '}
                <strong className="text-white">{participantName}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
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
                if (onAuditDownload) {
                  onAuditDownload(certificateNo, effectiveProgramTitle);
                }
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
                {effectiveCertificateTitle} bagi &ldquo;{effectiveProgramTitle}&rdquo; telah berjaya dimuat turun!
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
          id="official-program-certificate-print-area"
          className="shrink-0 w-[794px] min-h-[1123px] bg-white text-slate-900 rounded-xl shadow-2xl p-6 border border-slate-200 flex flex-col justify-between relative box-border"
        >
          {/* Ornamental Double Border Frame filling Full A4 Height */}
          <div className="flex-1 border-[3.5px] border-teal-900 rounded-xl p-2 bg-gradient-to-b from-amber-50/30 via-white to-teal-50/25 flex flex-col">
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
                  <span className="font-bold text-teal-900">NO. RUJUKAN SIJIL: {certificateNo}</span>
                </div>

                <div className="mt-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <Logo showText={false} size="lg" className="shrink-0" />
                  </div>

                  <p
                    className="text-lg font-bold text-teal-900"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                  </p>

                  <h1 className="text-xl font-black text-teal-950 uppercase tracking-wide mt-1.5">
                    {baseConfig.certificateSubtitle ||
                      'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia'}
                  </h1>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mt-1">
                    (MPGBSIM • Pertubuhan Kebangsaan Ditubuhkan Pada 23 April 1996)
                  </p>

                  {/* Main Editable Certificate Title Banner */}
                  <div className="mt-6 px-9 py-3.5 rounded-xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-white shadow-sm border border-amber-400/70">
                    <h2
                      className="text-2xl font-bold tracking-widest uppercase text-amber-300"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {effectiveCertificateTitle}
                    </h2>
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION: Participant Identity & Attended Program Details */}
              <div className="my-5 flex flex-col items-center text-center">
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {baseConfig.introText || 'Dengan sukacitanya diperakui dan disahkan bahawa'}
                </p>

                {/* Participant / PGB Name Highlight Box */}
                <div className="mt-4 w-full p-5 rounded-2xl bg-slate-50 border-2 border-teal-800/30 shadow-2xs">
                  <span className="text-[10.5px] font-bold uppercase tracking-widest text-teal-700 block">
                    Perwakilan Kepimpinan Pendidikan Islam
                  </span>
                  <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mt-1">
                    {participantName}
                  </h3>
                  {participantIc && (
                    <p className="text-xs font-mono font-semibold text-slate-600 mt-1">
                      NO. KAD PENGENALAN: {participantIc}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Jawatan Rasmi
                      </span>
                      <strong className="font-bold text-teal-900 text-sm">
                        {participantPosition}
                      </strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Institusi / Sekolah Ahli ({stateName})
                      </span>
                      <strong className="font-bold text-slate-900 text-sm block truncate">
                        {schoolName}{' '}
                        {schoolCode && !schoolCode.startsWith('MPGB-') ? `(${schoolCode})` : ''}
                      </strong>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {baseConfig.participationText ||
                    'telah menghadiri dan menyertai dengan jayanya program:'}
                </p>

                {/* Program / Takwim Event Highlight Box */}
                <div className="mt-4 w-full p-5 rounded-2xl bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white border border-amber-400/50 shadow-sm">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-widest mb-2">
                    Takwim Rasmi MPGBSIM • Mod {effectiveMode}
                  </span>
                  <h4 className="text-xl font-black text-white uppercase leading-snug">
                    {effectiveProgramTitle}
                  </h4>
                  {effectiveTheme && (
                    <p className="text-xs text-amber-200 italic mt-1.5">
                      &ldquo;{effectiveTheme}&rdquo;
                    </p>
                  )}

                  <div className="mt-4 pt-3.5 border-t border-teal-800/80 grid grid-cols-2 gap-4 text-xs text-left">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-teal-300 block font-bold">
                          Tarikh & Masa Program
                        </span>
                        <strong className="text-white font-bold block">
                          {effectiveDate}
                        </strong>
                        <span className="text-[11px] text-teal-200">{effectiveTime}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-teal-300 block font-bold">
                          Tempat / Lokasi Pelaksanaan
                        </span>
                        <strong className="text-white font-bold block line-clamp-2">
                          {effectiveVenue}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recognition Clause */}
                <div className="mt-4 w-full p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-slate-600 leading-relaxed">
                  {baseConfig.recognitionClause ||
                    'Penyertaan dan komitmen tuan/puan dalam menjayakan program pembangunan profesionalisme kepimpinan pendidikan Islam kebangsaan ini amatlah dihargai dan disanjung tinggi.'}
                </div>
              </div>

              {/* BOTTOM SECTION: Chairman Digital Signature, QR Seal & Secretariat */}
              <div>
                <div className="pt-5 border-t-2 border-slate-200 grid grid-cols-3 gap-4 items-end text-center">
                  {/* Left: Chairman's Digital Signature */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 flex items-center justify-center mb-1">
                      {baseConfig.chairmanSignatureImageUrl ? (
                        <img
                          src={baseConfig.chairmanSignatureImageUrl}
                          alt="Tandatangan Digital Pengerusi"
                          crossOrigin="anonymous"
                          className="max-h-16 max-w-[180px] object-contain select-none"
                        />
                      ) : (
                        <div
                          className="text-xl text-teal-900 italic font-serif select-none"
                          style={{ fontFamily: "'Amiri', serif" }}
                        >
                          {baseConfig.chairmanSignatureText || 'Mohamad Faiz Azizan'}
                        </div>
                      )}
                    </div>
                    <div className="w-48 border-b border-slate-400 mb-1.5" />
                    <strong className="text-[11.5px] font-extrabold text-slate-900 uppercase block">
                      {baseConfig.chairmanName || 'USTAZ MOHAMAD FAIZ BIN AZIZAN'}
                    </strong>
                    <span className="text-[10px] text-teal-800 font-semibold block">
                      {baseConfig.chairmanRole || 'Pengerusi Kebangsaan MPGBSIM'}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {baseConfig.chairmanOrg ||
                        'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia'}
                    </span>
                  </div>

                  {/* Center: Official Seal & QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2 rounded-xl bg-white border-2 border-amber-500/70 shadow-xs">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Pengesahan Sijil Penyertaan"
                          className="w-20 h-20 object-contain"
                        />
                      ) : (
                        <QrCode className="w-16 h-16 text-teal-950" />
                      )}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-bold text-teal-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>SIJIL DIGITAL DISAHKAN</span>
                    </div>
                    <span className="text-[8.5px] font-mono text-slate-500">
                      { registration.attendanceCode || schoolCode }
                    </span>
                  </div>

                  {/* Right: Setiausaha Agung / Urus Setia */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 flex items-center justify-center mb-1">
                      <div
                        className="text-xl text-teal-900 italic font-serif select-none"
                        style={{ fontFamily: "'Amiri', serif" }}
                      >
                        {baseConfig.secondarySignatureText || 'Urus Setia Pusat'}
                      </div>
                    </div>
                    <div className="w-48 border-b border-slate-400 mb-1.5" />
                    <strong className="text-[11.5px] font-extrabold text-slate-900 uppercase block">
                      {baseConfig.secondarySignatoryName || 'SETIAUSAHA AGUNG & URUS SETIA'}
                    </strong>
                    <span className="text-[10px] text-teal-800 font-semibold block">
                      {baseConfig.secondarySignatoryRole || 'Sekretariat Kebangsaan MPGBSIM'}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Tarikh Keluaran: {issuedDateFormatted}
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
