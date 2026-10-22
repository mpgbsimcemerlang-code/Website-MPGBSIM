import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Building2,
  MapPin,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool } from '../../types';
import { formatMalaysianWhatsAppNumber } from '../../utils/birthdayUtils';

export const PortalPGBSpotlight: React.FC = () => {
  const { siteData } = useAdminContent();
  const {
    currentUser,
    openDirectChatWithSchool,
    setPortalTab,
    recordAuditLog,
  } = useMemberPortal();

  // Combine candidate schools with valid principals
  const candidateSchools = useMemo(() => {
    const list = siteData?.memberSchools || [];
    return list.filter(
      (s) =>
        s &&
        s.principal &&
        s.principal.trim().length > 2 &&
        s.name &&
        s.name.trim().length > 2
    );
  }, [siteData?.memberSchools]);

  const [selectedSchool, setSelectedSchool] = useState<MemberSchool | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Random selection function
  const pickRandomSchool = (excludeId?: string) => {
    if (candidateSchools.length === 0) return null;

    const mySchoolCode = (currentUser?.schoolCode || '').toLowerCase().trim();
    let pool = candidateSchools.filter((s) => {
      const sCode = (s.code || '').toLowerCase().trim();
      const isMySchool = mySchoolCode && sCode === mySchoolCode;
      const isExcluded = excludeId && s.id === excludeId;
      return !isMySchool && !isExcluded;
    });

    if (pool.length === 0) {
      pool = candidateSchools;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex] || null;
  };

  // Run once on portal mount to pick a random PGB
  useEffect(() => {
    if (candidateSchools.length > 0 && !selectedSchool) {
      const picked = pickRandomSchool();
      if (picked) {
        setSelectedSchool(picked);
      }
    }
  }, [candidateSchools]);

  // Handle manually shuffling to another PGB
  const handleShuffle = () => {
    setIsRotating(true);
    setTimeout(() => {
      const nextSchool = pickRandomSchool(selectedSchool?.id);
      if (nextSchool) {
        setSelectedSchool(nextSchool);
      }
      setIsRotating(false);
    }, 250);
  };

  if (!selectedSchool) {
    return null;
  }

  const pgbName = selectedSchool.principal.replace(/\s*\([^)]*\)/g, '').trim();
  const designation = selectedSchool.designation || 'Pengetua / Guru Besar';
  const rawPersonalPhone =
    selectedSchool.pgbPhone ||
    selectedSchool.phone ||
    selectedSchool.schoolPhone ||
    '';
  const targetWhatsAppPhone = formatMalaysianWhatsAppNumber(rawPersonalPhone);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    const parts = name.split(' ').filter((p) => !['bin', 'binti', 'bt', 'al-hafiz', 'haji', 'ustaz', 'ustazah'].includes(p.toLowerCase()));
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Direct WhatsApp Link to PGB Personal Number
  const handleDirectWhatsApp = () => {
    const greetingMsg = `Salam ${designation} ${pgbName}, saya ${currentUser?.fullName || 'rakan PGB'} daripada ${currentUser?.school || 'MPGBSIM'}. Berbesar hati dapat berhubung dengan ${designation} melalui jaringan kepimpinan rasmi MPGBSIM.`;
    const whatsappUrl = targetWhatsAppPhone
      ? `https://wa.me/${targetWhatsAppPhone}?text=${encodeURIComponent(greetingMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(greetingMsg)}`;

    try {
      recordAuditLog?.(
        'WhatsApp PGB Spotlight',
        `Menghubungi ${pgbName} (${selectedSchool.name}) secara terus melalui WhatsApp ke nombor peribadi ${targetWhatsAppPhone || 'umum'}`
      );
    } catch {}

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDirectChat = () => {
    try {
      recordAuditLog?.(
        'Sembang Live PGB Spotlight',
        `Memulakan sembang live bersama ${pgbName} (${selectedSchool.name}) dalam portal`
      );
    } catch {}
    openDirectChatWithSchool(selectedSchool.code || selectedSchool.id);
  };

  return (
    <section
      aria-label="PGB Spotlight"
      className="group/card relative bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-teal-400/80 transition-all duration-300 ease-out overflow-hidden"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 px-5 py-3.5 text-white flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs group-hover/card:rotate-6 group-hover/card:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                PGB Spotlight
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-800/80 border border-teal-700/50 text-[10px] font-semibold text-teal-200">
                Tokoh Kepimpinan Ahli MPGBSIM
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate hidden sm:block">
              Mengenali rakan Pengetua & Guru Besar di seluruh Malaysia setiap kali portal dimuatkan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isRotating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
            title="Papar profil Pengetua / Guru Besar yang lain secara rawak"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isRotating ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'}`} />
            <span className="hidden sm:inline">PGB Lain</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs transition-all duration-200 cursor-pointer"
            title={isCollapsed ? 'Kembangkan Widget' : 'Kecilkan Widget'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Spotlight Body (Collapsible with smooth fade-in animation) */}
      {!isCollapsed && (
        <div
          key={selectedSchool.id}
          className="p-5 sm:p-6 bg-gradient-to-br from-slate-50/70 via-white to-teal-50/20 animate-in fade-in zoom-in-[0.99] duration-500 ease-out"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Profile Card Main Info with Hover Effects */}
            <div className="group/profile flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 cursor-default">
              {/* Photo or Initials Avatar with Hover Zoom & Ring Glow */}
              <div className="relative shrink-0">
                {selectedSchool.principalPhotoUrl ? (
                  <img
                    src={selectedSchool.principalPhotoUrl}
                    alt={pgbName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-600/30 shadow-md group-hover/profile:scale-105 group-hover/profile:shadow-lg group-hover/profile:border-teal-500 transition-all duration-300 ease-out"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-800 to-slate-900 text-amber-300 flex items-center justify-center font-black text-xl sm:text-2xl border-2 border-teal-700/40 shadow-md group-hover/profile:scale-105 group-hover/profile:shadow-lg group-hover/profile:border-teal-500 transition-all duration-300 ease-out">
                    {getInitials(pgbName)}
                  </div>
                )}
                <span
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs group-hover/profile:scale-110 transition-transform duration-300"
                  title="Ahli Berdaftar Sah MPGBSIM"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Details with Hover Polish */}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-100/80 text-teal-900 text-xs font-bold border border-teal-200 group-hover/profile:border-teal-400 group-hover/profile:bg-teal-100 transition-colors duration-200">
                    {designation}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold group-hover/profile:bg-slate-200/80 transition-colors duration-200">
                    {selectedSchool.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[11px] font-semibold border border-amber-200/80 group-hover/profile:border-amber-300 transition-colors duration-200">
                    {selectedSchool.type}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug group-hover/profile:text-teal-950 transition-colors duration-200">
                  {pgbName}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium group-hover/profile:text-slate-800 transition-colors duration-200">
                  <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0 group-hover/profile:scale-110 transition-transform duration-200" />
                  <span className="truncate">{selectedSchool.name}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5 group-hover/profile:text-slate-600 transition-colors duration-200">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover/profile:scale-110 transition-transform duration-200" />
                    <span>{selectedSchool.district ? `${selectedSchool.district}, ` : ''}{selectedSchool.state}</span>
                  </div>
                  {selectedSchool.studentCount ? (
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedSchool.studentCount} Murid</span>
                    </div>
                  ) : null}
                  {selectedSchool.joinYear ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Sertai {selectedSchool.joinYear}</span>
                    </div>
                  ) : null}
                  {targetWhatsAppPhone ? (
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 group-hover/profile:bg-emerald-100/70 transition-colors duration-200">
                      <Share2 className="w-3 h-3 text-emerald-600 group-hover/profile:rotate-12 transition-transform duration-200" />
                      <span>WhatsApp Peribadi Sedia Hubung</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Action Buttons: Direct WhatsApp Link to Personal Number with Polished Hover Effects */}
            <div className="flex flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/70">
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                title={`Kirim mesej terus ke WhatsApp peribadi ${pgbName}${targetWhatsAppPhone ? ` (${targetWhatsAppPhone})` : ''}`}
                className="group/wa flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-white group-hover/wa:scale-110 group-hover/wa:rotate-6 transition-transform duration-200" />
                <span>Hubungi PGB (WhatsApp)</span>
              </button>

              <div className="flex items-center gap-1.5 self-center md:self-end">
                <button
                  type="button"
                  onClick={handleOpenDirectChat}
                  title="Buka bilik sembang langsung 1-ke-1 dalam portal"
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 hover:text-teal-900 text-xs font-semibold border border-teal-200 hover:border-teal-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  <span className="hidden sm:inline">Sembang Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPortalTab('direktori');
                  }}
                  title="Lihat profil lengkap sekolah dalam direktori"
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 hover:border-slate-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <span>Direktori</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
