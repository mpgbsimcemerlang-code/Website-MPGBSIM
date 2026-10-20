/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { StrategicFocusSection } from './components/StrategicFocus';
import { LatestNewsSection } from './components/LatestNews';
import { BestPracticeSection } from './components/BestPractice';
import { UpcomingProgramsSection } from './components/UpcomingPrograms';
import { ExamPublicSection } from './components/exams/ExamPublicSection';
import { FeePaymentSection } from './components/FeePaymentSection';
import { SchoolNetworkSection } from './components/SchoolNetwork';
import { LeadershipSection } from './components/LeadershipSection';
import { AlumniPublicSection } from './components/alumni/AlumniPublicSection';
import { QuoteSection } from './components/QuoteSection';
import { ResourcesSection } from './components/ResourcesSection';
import { CallToAction } from './components/CallToAction';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { DetailModal, ModalContentType } from './components/DetailModal';

// Admin CMS & Logo Management
import { AdminContentProvider, useAdminContent } from './context/AdminContentContext';
import { UploadLogoModal } from './components/UploadLogoModal';
import { AdminCMSModal } from './components/AdminCMSModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminFloatingControl } from './components/AdminFloatingControl';

import { StrategicFocus, NewsItem, BestPracticeItem, ProgramEvent } from './types';

import { MemberPortalProvider, useMemberPortal } from './context/MemberPortalContext';
import { PortalMainLayout } from './components/portal/PortalMainLayout';

function AppContent() {
  const {
    siteData,
    updateStats,
    isLogoModalOpen,
    setIsLogoModalOpen,
    isCMSOpen,
    setIsCMSOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    addAlumniRecord,
  } = useAdminContent();

  const { viewMode, setViewMode } = useMemberPortal();

  const [detailModalContent, setDetailModalContent] = useState<ModalContentType>(null);
  const [activeSection, setActiveSection] = useState('utama');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const handledDeepLinkNewsIdRef = React.useRef<string | null>(null);

  // Detect shared news link (?berita=<id> or ?news=<id>) and automatically open the news article modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetNewsId = params.get('berita') || params.get('news');
    if (!targetNewsId) return;

    if (handledDeepLinkNewsIdRef.current === targetNewsId) return;

    const allNews = siteData.news || [];
    const matchedNews = allNews.find(
      (n) => String(n.id) === String(targetNewsId)
    );

    if (matchedNews) {
      handledDeepLinkNewsIdRef.current = targetNewsId;
      if (viewMode !== 'public') {
        setViewMode('public');
      }
      setDetailModalContent({ type: 'news', data: matchedNews });
      setTimeout(() => {
        const el = document.getElementById('berita');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  }, [siteData.news, viewMode, setViewMode]);

  // Track active section for navigation highlight and scroll button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);

      const sections = [
        'utama',
        'tentang',
        'fokus-strategik',
        'berita',
        'best-practice',
        'program',
        'peperiksaan',
        'bayar-yuran',
        'sekolah-ahli',
        'kepimpinan',
        'sumber',
        'hubungi',
      ];

      const scrollPosition = window.scrollY + 160;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamically update document title for SEO & browser tab clarity
  useEffect(() => {
    if (viewMode === 'portal') {
      document.title = 'Portal Rasmi Ahli PGB | MPGBSIM - Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia';
      return;
    }
    if (detailModalContent?.type === 'news' && detailModalContent.data?.title) {
      document.title = `${detailModalContent.data.title} | Berita MPGBSIM`;
      return;
    }
    const sectionTitles: Record<string, string> = {
      utama: 'MPGBSIM - Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
      tentang: 'Pengenalan & Perlembagaan | MPGBSIM',
      'fokus-strategik': 'Fokus Strategik Pendidikan Islam | MPGBSIM',
      berita: 'Berita & Perkembangan Semasa | MPGBSIM',
      'best-practice': 'Perkongsian Amalan Terbaik Sekolah Islam | MPGBSIM',
      program: 'Takwim & Konvensyen Kebangsaan | MPGBSIM',
      peperiksaan: 'Takwim Peperiksaan & Pentaksiran | MPGBSIM',
      'bayar-yuran': 'Kadar Yuran Keahlian & Pembayaran | MPGBSIM',
      'sekolah-ahli': 'Direktori Sekolah-Sekolah Islam Ahli Biasa & Bersekutu | MPGBSIM',
      kepimpinan: 'Jawatankuasa Kepimpinan Pusat | MPGBSIM',
      sumber: 'Pusat Sumber & Muat Turun Dokumen Rasmi | MPGBSIM',
      hubungi: 'Hubungi Sekretariat Kebangsaan | MPGBSIM',
    };
    document.title = sectionTitles[activeSection] || 'MPGBSIM - Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia';
  }, [viewMode, activeSection, detailModalContent]);

  // If viewMode is 'portal', render the dedicated MPGBSIM Member Portal interface
  if (viewMode === 'portal') {
    return <PortalMainLayout />;
  }

  const handleOpenPortal = () => {
    setViewMode('portal');
  };

  const handleSelectNews = (news: NewsItem) => {
    setDetailModalContent({ type: 'news', data: news });
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('berita', String(news.id));
      window.history.replaceState(null, '', `${url.pathname}?${url.searchParams.toString()}`);
    } catch {
      // Ignore history API errors in restricted environments
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalContent(null);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('berita') || url.searchParams.has('news')) {
        url.searchParams.delete('berita');
        url.searchParams.delete('news');
        const queryStr = url.searchParams.toString();
        window.history.replaceState(
          null,
          '',
          `${url.pathname}${queryStr ? `?${queryStr}` : ''}${url.hash}`
        );
      }
    } catch {
      // Ignore history API errors
    }
  };

  const handleScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-700 selection:text-white flex flex-col">
      {/* Header & Navigation (includes embedded Admin Bar when session is active) */}
      <Navbar
        onOpenPortal={handleOpenPortal}
        activeSection={activeSection}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. HERO */}
        <Hero
          onExploreClick={() => handleScrollTo('tentang')}
          onProgramsClick={() => handleScrollTo('program')}
          onOpenPortal={handleOpenPortal}
          onFeePaymentClick={() => handleScrollTo('bayar-yuran')}
        />

        {/* 2. INTRODUCTION (With Dynamic Visi & Misi) */}
        <Introduction />

        {/* 3. STRATEGIC FOCUS */}
        <StrategicFocusSection
          focusList={siteData.strategicFocus || []}
          onSelectFocus={(focus: StrategicFocus) =>
            setDetailModalContent({ type: 'focus', data: focus })
          }
        />

        {/* 4. LATEST NEWS (Managed via CMS & Member Portal PGB Live Submissions) */}
        <LatestNewsSection
          newsList={siteData.news || []}
          onSelectNews={handleSelectNews}
          onOpenPortal={handleOpenPortal}
        />

        {/* 5. BEST PRACTICE (Managed via CMS) */}
        <BestPracticeSection
          practices={siteData.practices || []}
          onSelectPractice={(bp: BestPracticeItem) =>
            setDetailModalContent({ type: 'practice', data: bp })
          }
          onRequestShare={() => setDetailModalContent({ type: 'sharePractice' })}
        />

        {/* 6. UPCOMING PROGRAMS (Managed via CMS) */}
        <UpcomingProgramsSection
          programs={siteData.programs || []}
          onRegisterProgram={(prog: ProgramEvent) =>
            setDetailModalContent({ type: 'program', data: prog })
          }
        />

        {/* KALENDAR PEPERIKSAAN & COUNTDOWN PENDIDIKAN (Live Takwim SPM, UPKK, SPPIM) */}
        <ExamPublicSection />

        {/* PEMBAYARAN YURAN PGB & KEAHLIAN RASMI (Gerbang Rasmi HerePay) */}
        <FeePaymentSection onOpenPortal={handleOpenPortal} />

        {/* 7. SCHOOL NETWORK (Dynamic Statistics & Directory) */}
        <SchoolNetworkSection
          stats={siteData.stats}
          onUpdateStats={updateStats}
          schools={siteData.memberSchools || []}
        />

        {/* KEPIMPINAN (Barisan Kepimpinan PGB Kebangsaan - Managed via CMS) */}
        <LeadershipSection leaders={siteData.leadership || []} />

        {/* ALUMNI PGB MPGBSIM (Jejak Kepimpinan & Legasi Pendidikan) */}
        <AlumniPublicSection
          alumniList={siteData.alumni || []}
          onAddAlumniRecord={addAlumniRecord}
        />

        {/* 8. QUOTE */}
        <QuoteSection />

        {/* 10. CALL TO ACTION */}
        <CallToAction
          onJoinClick={handleOpenPortal}
          onContactClick={() => handleScrollTo('hubungi')}
        />

        {/* HUBUNGI KAMI */}
        <ContactSection />
      </main>

      {/* 11. FOOTER */}
      <Footer
        onOpenPrivacy={() => setDetailModalContent({ type: 'privacy' })}
        onOpenPortal={handleOpenPortal}
      />

      {/* General Detail / Reader Modal */}
      <DetailModal
        content={detailModalContent}
        onClose={handleCloseDetailModal}
      />

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Skrol ke atas laman"
          className="fixed bottom-5 left-5 z-40 px-3.5 py-2.5 rounded-full bg-slate-900/90 hover:bg-teal-700 text-teal-300 hover:text-white border border-teal-500/40 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowUp className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Ke Atas</span>
        </button>
      )}

      {/* Floating Quick Action Widget for Admin CMS & Login/Logout */}
      <AdminFloatingControl />

      {/* Admin Modals */}
      <UploadLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

      <AdminCMSModal
        isOpen={isCMSOpen}
        onClose={() => setIsCMSOpen(false)}
      />

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AdminContentProvider>
      <MemberPortalProvider>
        <AppContent />
      </MemberPortalProvider>
    </AdminContentProvider>
  );
}
