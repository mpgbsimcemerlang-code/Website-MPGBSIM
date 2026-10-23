import React from 'react';
import { CertificateTemplateId } from '../../types';

export interface CertificateTemplateTheme {
  id: CertificateTemplateId;
  name: string;
  subtitle: string;
  badgeLabel: string;
  previewSwatches: [string, string, string];
  // Outer sheet & frame styling
  sheetBgClass: string;
  outerBorderClass: string;
  innerBorderClass: string;
  cornerColorHex: string;
  // Typography & Header colors
  serialTextClass: string;
  serialHighlightClass: string;
  basmalahColorClass: string;
  orgTitleClass: string;
  orgSubClass: string;
  // Main Certificate Banner
  titleBannerBgClass: string;
  titleBannerTextClass: string;
  // Highlight Card (Participant / School)
  primaryCardBgClass: string;
  primaryCardBorderClass: string;
  primaryCardKickerClass: string;
  primaryCardTitleClass: string;
  primaryCardAccentTextClass: string;
  // Secondary Highlight Block (Program / Principal Block)
  secondaryCardBgClass: string;
  secondaryCardBorderClass: string;
  secondaryCardTitleClass: string;
  secondaryCardSubClass: string;
  secondaryCardBadgeClass: string;
  secondaryCardIconColorClass: string;
  secondaryCardLabelClass: string;
  // Clause Box
  clauseBgClass: string;
  clauseBorderClass: string;
  clauseTextClass: string;
  // Signatures & QR Seal
  signCalligraphyClass: string;
  signRoleClass: string;
  qrBorderClass: string;
  qrBadgeTextClass: string;
  qrDarkHex: string;
  // Ornament style
  ornamentColorHex: string;
  ornamentSecondaryHex: string;
  motifStyle: 'mihrab-emerald' | 'mushaf-gold' | 'ottoman-sapphire' | 'modern-khat' | 'raudhah-maroon';
}

export const CERTIFICATE_TEMPLATES: CertificateTemplateTheme[] = [
  {
    id: 'warisan-zaitun',
    name: '1. Warisan Zamrud & Kubah Islamik',
    subtitle: 'Hijau Zamrud Diraja & Emas dengan motif bintang Rub el Hizb serta gerbang Mihrab',
    badgeLabel: 'Islamik Klasik (Default)',
    previewSwatches: ['#042f2e', '#0f766e', '#d97706'],
    sheetBgClass: 'bg-white',
    outerBorderClass: 'border-[3.5px] border-teal-900 bg-gradient-to-b from-amber-50/30 via-white to-teal-50/30',
    innerBorderClass: 'border-[1.5px] border-amber-500/85',
    cornerColorHex: '#b45309',
    serialTextClass: 'text-slate-500 border-slate-200',
    serialHighlightClass: 'text-teal-900',
    basmalahColorClass: 'text-teal-900',
    orgTitleClass: 'text-teal-950',
    orgSubClass: 'text-amber-800',
    titleBannerBgClass: 'bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 border-amber-400/80',
    titleBannerTextClass: 'text-amber-300',
    primaryCardBgClass: 'bg-slate-50/95',
    primaryCardBorderClass: 'border-2 border-teal-800/30',
    primaryCardKickerClass: 'text-teal-700',
    primaryCardTitleClass: 'text-slate-950',
    primaryCardAccentTextClass: 'text-teal-900',
    secondaryCardBgClass: 'bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white',
    secondaryCardBorderClass: 'border border-amber-400/50',
    secondaryCardTitleClass: 'text-white',
    secondaryCardSubClass: 'text-amber-200',
    secondaryCardBadgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    secondaryCardIconColorClass: 'text-amber-400',
    secondaryCardLabelClass: 'text-teal-300',
    clauseBgClass: 'bg-amber-50/60',
    clauseBorderClass: 'border-amber-200/80',
    clauseTextClass: 'text-slate-600',
    signCalligraphyClass: 'text-teal-900',
    signRoleClass: 'text-teal-800',
    qrBorderClass: 'border-amber-500/80',
    qrBadgeTextClass: 'text-teal-900',
    qrDarkHex: '#064e3b',
    ornamentColorHex: '#0f766e',
    ornamentSecondaryHex: '#d97706',
    motifStyle: 'mihrab-emerald',
  },
  {
    id: 'andalusia-diraja',
    name: '2. Mushaf Andalusia & Emas Diraja',
    subtitle: 'Latar Krim Parchment Mushaf dengan bingkai Arabesque Emas & ukiran klasik Andalusia',
    badgeLabel: 'Mushaf & Arabesque Islamik',
    previewSwatches: ['#78350f', '#b45309', '#fef3c7'],
    sheetBgClass: 'bg-[#fffdf7]',
    outerBorderClass: 'border-[4px] border-amber-800 bg-gradient-to-b from-amber-50/70 via-[#fffef9] to-amber-100/40',
    innerBorderClass: 'border-[2px] border-amber-600/80',
    cornerColorHex: '#92400e',
    serialTextClass: 'text-amber-900/70 border-amber-200/80',
    serialHighlightClass: 'text-amber-950',
    basmalahColorClass: 'text-amber-900',
    orgTitleClass: 'text-amber-950',
    orgSubClass: 'text-teal-900',
    titleBannerBgClass: 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-400',
    titleBannerTextClass: 'text-amber-200',
    primaryCardBgClass: 'bg-white/95',
    primaryCardBorderClass: 'border-2 border-amber-700/40',
    primaryCardKickerClass: 'text-amber-800',
    primaryCardTitleClass: 'text-amber-950',
    primaryCardAccentTextClass: 'text-amber-900',
    secondaryCardBgClass: 'bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900 text-white',
    secondaryCardBorderClass: 'border border-amber-400/70',
    secondaryCardTitleClass: 'text-amber-50',
    secondaryCardSubClass: 'text-amber-200',
    secondaryCardBadgeClass: 'bg-amber-400/25 text-amber-200 border-amber-300/50',
    secondaryCardIconColorClass: 'text-amber-300',
    secondaryCardLabelClass: 'text-amber-300/90',
    clauseBgClass: 'bg-amber-100/45',
    clauseBorderClass: 'border-amber-300/80',
    clauseTextClass: 'text-amber-950/80',
    signCalligraphyClass: 'text-amber-950',
    signRoleClass: 'text-amber-800',
    qrBorderClass: 'border-amber-600',
    qrBadgeTextClass: 'text-amber-950',
    qrDarkHex: '#78350f',
    ornamentColorHex: '#b45309',
    ornamentSecondaryHex: '#065f46',
    motifStyle: 'mushaf-gold',
  },
  {
    id: 'biru-ottoman',
    name: '3. Astaka Biru Uthmaniyyah',
    subtitle: 'Biru Nilam Diraja (Sapphire) & Emas dengan corak geometri Uthmaniyyah berwibawa',
    badgeLabel: 'Geometri Uthmaniyyah',
    previewSwatches: ['#172554', '#1e40af', '#f59e0b'],
    sheetBgClass: 'bg-white',
    outerBorderClass: 'border-[3.5px] border-blue-950 bg-gradient-to-b from-blue-50/40 via-white to-amber-50/25',
    innerBorderClass: 'border-[1.5px] border-amber-500/80',
    cornerColorHex: '#1e3a8a',
    serialTextClass: 'text-slate-500 border-blue-100',
    serialHighlightClass: 'text-blue-950',
    basmalahColorClass: 'text-blue-950',
    orgTitleClass: 'text-slate-950',
    orgSubClass: 'text-blue-900',
    titleBannerBgClass: 'bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-950 border-amber-400/80',
    titleBannerTextClass: 'text-amber-300',
    primaryCardBgClass: 'bg-blue-50/35',
    primaryCardBorderClass: 'border-2 border-blue-900/25',
    primaryCardKickerClass: 'text-blue-800',
    primaryCardTitleClass: 'text-slate-950',
    primaryCardAccentTextClass: 'text-blue-950',
    secondaryCardBgClass: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white',
    secondaryCardBorderClass: 'border border-amber-400/60',
    secondaryCardTitleClass: 'text-white',
    secondaryCardSubClass: 'text-amber-200',
    secondaryCardBadgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    secondaryCardIconColorClass: 'text-amber-400',
    secondaryCardLabelClass: 'text-blue-200',
    clauseBgClass: 'bg-blue-50/50',
    clauseBorderClass: 'border-blue-200/80',
    clauseTextClass: 'text-slate-700',
    signCalligraphyClass: 'text-blue-950',
    signRoleClass: 'text-blue-900',
    qrBorderClass: 'border-blue-900/70',
    qrBadgeTextClass: 'text-blue-950',
    qrDarkHex: '#172554',
    ornamentColorHex: '#1e3a8a',
    ornamentSecondaryHex: '#d97706',
    motifStyle: 'ottoman-sapphire',
  },
  {
    id: 'hijrah-kontemporari',
    name: '4. Khatulistiwa Islamik Kontemporari',
    subtitle: 'Rekaan Eksekutif Moden Putih Bersih dengan jalur geometri Islamik & aksen Zamrud',
    badgeLabel: 'Moden & Eksekutif',
    previewSwatches: ['#0f172a', '#0d9488', '#eab308'],
    sheetBgClass: 'bg-white',
    outerBorderClass: 'border-[3px] border-slate-900 bg-gradient-to-br from-teal-50/20 via-white to-slate-50/50',
    innerBorderClass: 'border border-teal-600/60',
    cornerColorHex: '#0d9488',
    serialTextClass: 'text-slate-500 border-slate-200',
    serialHighlightClass: 'text-slate-900',
    basmalahColorClass: 'text-teal-800',
    orgTitleClass: 'text-slate-950',
    orgSubClass: 'text-teal-700',
    titleBannerBgClass: 'bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 border-teal-400/70',
    titleBannerTextClass: 'text-white',
    primaryCardBgClass: 'bg-white',
    primaryCardBorderClass: 'border-2 border-slate-200',
    primaryCardKickerClass: 'text-teal-700',
    primaryCardTitleClass: 'text-slate-950',
    primaryCardAccentTextClass: 'text-teal-900',
    secondaryCardBgClass: 'bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white',
    secondaryCardBorderClass: 'border border-teal-500/40',
    secondaryCardTitleClass: 'text-white',
    secondaryCardSubClass: 'text-teal-200',
    secondaryCardBadgeClass: 'bg-teal-500/20 text-teal-200 border-teal-400/40',
    secondaryCardIconColorClass: 'text-teal-400',
    secondaryCardLabelClass: 'text-slate-300',
    clauseBgClass: 'bg-slate-50',
    clauseBorderClass: 'border-slate-200',
    clauseTextClass: 'text-slate-600',
    signCalligraphyClass: 'text-slate-900',
    signRoleClass: 'text-teal-800',
    qrBorderClass: 'border-teal-600/70',
    qrBadgeTextClass: 'text-slate-900',
    qrDarkHex: '#0f172a',
    ornamentColorHex: '#0d9488',
    ornamentSecondaryHex: '#0f172a',
    motifStyle: 'modern-khat',
  },
  {
    id: 'raudhah-amethyst',
    name: '5. Raudhah Maroon Diraja & Emas',
    subtitle: 'Maroon Ungu Diraja & Emas untuk Anugerah Khas, Apresiasi Kepimpinan & Nadwah',
    badgeLabel: 'Anugerah & Apresiasi Diraja',
    previewSwatches: ['#4c0519', '#881337', '#f59e0b'],
    sheetBgClass: 'bg-[#fffcfd]',
    outerBorderClass: 'border-[3.5px] border-rose-950 bg-gradient-to-b from-rose-50/35 via-white to-amber-50/30',
    innerBorderClass: 'border-[1.5px] border-amber-500/85',
    cornerColorHex: '#881337',
    serialTextClass: 'text-slate-500 border-rose-100',
    serialHighlightClass: 'text-rose-950',
    basmalahColorClass: 'text-rose-950',
    orgTitleClass: 'text-rose-950',
    orgSubClass: 'text-amber-800',
    titleBannerBgClass: 'bg-gradient-to-r from-rose-950 via-red-950 to-rose-950 border-amber-400/80',
    titleBannerTextClass: 'text-amber-300',
    primaryCardBgClass: 'bg-rose-50/30',
    primaryCardBorderClass: 'border-2 border-rose-900/25',
    primaryCardKickerClass: 'text-rose-900',
    primaryCardTitleClass: 'text-slate-950',
    primaryCardAccentTextClass: 'text-rose-950',
    secondaryCardBgClass: 'bg-gradient-to-br from-rose-950 via-stone-900 to-red-950 text-white',
    secondaryCardBorderClass: 'border border-amber-400/60',
    secondaryCardTitleClass: 'text-white',
    secondaryCardSubClass: 'text-amber-200',
    secondaryCardBadgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    secondaryCardIconColorClass: 'text-amber-400',
    secondaryCardLabelClass: 'text-rose-200',
    clauseBgClass: 'bg-amber-50/60',
    clauseBorderClass: 'border-amber-200/80',
    clauseTextClass: 'text-slate-700',
    signCalligraphyClass: 'text-rose-950',
    signRoleClass: 'text-rose-900',
    qrBorderClass: 'border-amber-500/80',
    qrBadgeTextClass: 'text-rose-950',
    qrDarkHex: '#4c0519',
    ornamentColorHex: '#881337',
    ornamentSecondaryHex: '#d97706',
    motifStyle: 'raudhah-maroon',
  },
];

export function getCertificateTemplateTheme(
  templateId?: CertificateTemplateId | string
): CertificateTemplateTheme {
  return (
    CERTIFICATE_TEMPLATES.find((t) => t.id === templateId) || CERTIFICATE_TEMPLATES[0]
  );
}

/**
 * Renders Islamic Geometric Corner Ornaments (Rub el Hizb 8-pointed star & Arabesque filigree)
 */
export const IslamicCornerOrnaments: React.FC<{
  primaryHex: string;
  secondaryHex: string;
  showMotif?: boolean;
}> = ({ primaryHex, secondaryHex, showMotif = true }) => {
  if (!showMotif) {
    return (
      <>
        <div
          className="w-5 h-5 border-t-2 border-l-2 absolute top-3 left-3 pointer-events-none"
          style={{ borderColor: secondaryHex }}
        />
        <div
          className="w-5 h-5 border-t-2 border-r-2 absolute top-3 right-3 pointer-events-none"
          style={{ borderColor: secondaryHex }}
        />
        <div
          className="w-5 h-5 border-b-2 border-l-2 absolute bottom-3 left-3 pointer-events-none"
          style={{ borderColor: secondaryHex }}
        />
        <div
          className="w-5 h-5 border-b-2 border-r-2 absolute bottom-3 right-3 pointer-events-none"
          style={{ borderColor: secondaryHex }}
        />
      </>
    );
  }

  const CornerSvg: React.FC<{ className: string }> = ({ className }) => (
    <svg
      viewBox="0 0 64 64"
      className={`w-11 h-11 absolute pointer-events-none select-none ${className}`}
      fill="none"
    >
      {/* Outer L-bracket */}
      <path
        d="M2 58 V8 C2 4.686 4.686 2 8 2 H58"
        stroke={primaryHex}
        strokeWidth="2.2"
      />
      <path
        d="M8 50 V12 C8 9.79 9.79 8 12 8 H50"
        stroke={secondaryHex}
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      {/* Islamic 8-Pointed Star (Rub el Hizb) in the corner */}
      <g transform="translate(20, 20)">
        <rect
          x="-7"
          y="-7"
          width="14"
          height="14"
          stroke={secondaryHex}
          strokeWidth="1.4"
          fill="white"
        />
        <rect
          x="-7"
          y="-7"
          width="14"
          height="14"
          transform="rotate(45)"
          stroke={primaryHex}
          strokeWidth="1.4"
          fill="white"
        />
        <circle cx="0" cy="0" r="2.8" fill={secondaryHex} />
      </g>
    </svg>
  );

  return (
    <>
      <CornerSvg className="top-2 left-2" />
      <CornerSvg className="top-2 right-2 scale-x-[-1]" />
      <CornerSvg className="bottom-2 left-2 scale-y-[-1]" />
      <CornerSvg className="bottom-2 right-2 scale-x-[-1] scale-y-[-1]" />
    </>
  );
};

/**
 * Subtle Islamic Geometric Rosette Watermark & Header Divider with Rub el Hizb emblem
 */
export const IslamicDividerOrnament: React.FC<{
  primaryHex: string;
  secondaryHex: string;
  showMotif?: boolean;
}> = ({ primaryHex, secondaryHex, showMotif = true }) => {
  if (!showMotif) return null;
  return (
    <div className="flex items-center justify-center gap-2.5 my-1.5 select-none pointer-events-none">
      <div
        className="h-[1px] w-20 opacity-60"
        style={{
          background: `linear-gradient(to right, transparent, ${secondaryHex})`,
        }}
      />
      <svg viewBox="0 0 32 32" className="w-4 h-4 shrink-0" fill="none">
        <rect
          x="7"
          y="7"
          width="18"
          height="18"
          stroke={secondaryHex}
          strokeWidth="1.6"
        />
        <rect
          x="7"
          y="7"
          width="18"
          height="18"
          transform="rotate(45 16 16)"
          stroke={primaryHex}
          strokeWidth="1.6"
        />
        <circle cx="16" cy="16" r="3" fill={secondaryHex} />
      </svg>
      <div
        className="h-[1px] w-20 opacity-60"
        style={{
          background: `linear-gradient(to left, transparent, ${secondaryHex})`,
        }}
      />
    </div>
  );
};

/**
 * Subtle background Islamic Geometric Star Rosette watermark in the center of the certificate
 */
export const IslamicCenterWatermark: React.FC<{
  primaryHex: string;
  secondaryHex: string;
  showMotif?: boolean;
}> = ({ primaryHex, secondaryHex, showMotif = true }) => {
  if (!showMotif) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.035]">
      <svg viewBox="0 0 240 240" className="w-[460px] h-[460px]" fill="none">
        <circle cx="120" cy="120" r="110" stroke={primaryHex} strokeWidth="2" />
        <circle cx="120" cy="120" r="92" stroke={secondaryHex} strokeWidth="1.5" strokeDasharray="6 4" />
        <rect x="48" y="48" width="144" height="144" stroke={primaryHex} strokeWidth="2" />
        <rect
          x="48"
          y="48"
          width="144"
          height="144"
          transform="rotate(45 120 120)"
          stroke={secondaryHex}
          strokeWidth="2"
        />
        <rect
          x="68"
          y="68"
          width="104"
          height="104"
          transform="rotate(22.5 120 120)"
          stroke={primaryHex}
          strokeWidth="1.5"
        />
        <rect
          x="68"
          y="68"
          width="104"
          height="104"
          transform="rotate(67.5 120 120)"
          stroke={secondaryHex}
          strokeWidth="1.5"
        />
        <circle cx="120" cy="120" r="28" stroke={primaryHex} strokeWidth="2" />
      </svg>
    </div>
  );
};
