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
import { PublicBirthdaySection } from './components/PublicBirthdaySection';
import { LeadershipSection } from './components/LeadershipSection';
import { AlumniPublicSection } from './components/alumni/AlumniPublicSection';
import { QuoteSection } from './components/QuoteSection';
import { ResourcesSection } from './components/ResourcesSection';
import { CallToAction } from './components/CallToAction';
import { ContactSection } from './components/ContactSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { DetailModal, ModalContentType } from './components/DetailModal';

// Admin CMS & Logo Management
import { AdminContentProvider, useAdminContent } from './context/AdminContentContext';
import { UploadLogoModal } from './components/UploadLogoModal';
import { AdminCMSModal } from './components/AdminCMSModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminFloatingControl } from './components/AdminFloatingControl';

import { StrategicFocus, NewsItem, BestPracticeItem, ProgramEvent } from './types';
import { db, doc, getDoc } from './firebase';

import { MemberPortalProvider, useMemberPortal } from './context/MemberPortalContext';
import { PortalMainLayout } from './components/portal/PortalMainLayout';
import { MpgbChatbot } from './components/MpgbChatbot';

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
  const fetchedDeepLinkDocIdRef = React.useRef<string | null>(null);

  // Listen for admin exit impersonation to seamlessly reopen Admin CMS modal
  useEffect(() => {
    const handleReopenCms = () => {
      setIsCMSOpen(true);
    };
    window.addEventListener('mpgbsim_reopen_cms', handleReopenCms);
    return () => window.removeEventListener('mpgbsim_reopen_cms', handleReopenCms);
  }, [setIsCMSOpen]);

  // Detect shared news link (?berita=<id> or ?news=<id>) and automatically open & keep the news article modal synced
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathMatch = window.location.pathname.match(/^\/berita\/([^/]+)/);
    const targetNewsId =
      params.get('berita') ||
      params.get('news') ||
      (pathMatch ? decodeURIComponent(pathMatch[1]) : null);
    if (!targetNewsId) return;

    const allNews = siteData.news || [];
    const matchedNews = allNews.find(
      (n) => String(n.id) === String(targetNewsId)
    );

    if (matchedNews) {
      if (handledDeepLinkNewsIdRef.current !== targetNewsId) {
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
      } else {
        // Keep the open modal synchronized when Firestore / IndexedDB finishes hydrating the real imageUrl
        setDetailModalContent((prev) => {
          if (prev?.type === 'news' && String(prev.data.id) === String(targetNewsId)) {
            const bestImageUrl =
              matchedNews.imageUrl && matchedNews.imageUrl.trim() !== ''
                ? matchedNews.imageUrl
                : prev.data.imageUrl || '';
            if (
              prev.data.imageUrl !== bestImageUrl ||
              prev.data.title !== matchedNews.title ||
              prev.data.content !== matchedNews.content
            ) {
              return {
                type: 'news',
                data: { ...prev.data, ...matchedNews, imageUrl: bestImageUrl },
              };
            }
          }
          return prev;
        });
      }
    }

    // If matchedNews is not yet in siteData.news or its imageUrl was stripped in local cache, fetch directly from Firestore
    if (
      (!matchedNews || !matchedNews.imageUrl || matchedNews.imageUrl.trim() === '') &&
      fetchedDeepLinkDocIdRef.current !== targetNewsId
    ) {
      fetchedDeepLinkDocIdRef.current = targetNewsId;
      getDoc(doc(db, 'news', targetNewsId))
        .then((docSnap) => {
          if (docSnap.exists()) {
            const firestoreNews = {
              id: docSnap.id,
              ...(docSnap.data() as any),
            } as NewsItem;
            handledDeepLinkNewsIdRef.current = targetNewsId;
            if (viewMode !== 'public') {
              setViewMode('public');
            }
            setDetailModalContent((prev) => {
              const fallbackImg = prev?.type === 'news' ? prev.data.imageUrl : '';
              return {
                type: 'news',
                data: {
                  ...(matchedNews || {}),
                  ...firestoreNews,
                  imageUrl: firestoreNews.imageUrl || fallbackImg || '',
                },
              };
            });
          }
        })
        .catch(() => {});
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
        'alumni',
        'hubungi',
        'soalan-lazim',
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
      alumni: 'Jejak Kepimpinan & Direktori Alumni PGB | MPGBSIM',
      hubungi: 'Hubungi Sekretariat Kebangsaan | MPGBSIM',
      'soalan-lazim': 'Soalan Lazim (FAQ) Keahlian & Portal PGB | MPGBSIM',
    };
    document.title = sectionTitles[activeSection] || 'MPGBSIM - Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia';
  }, [viewMode, activeSection, detailModalContent]);

  const handleOpenPortal = () => {
    setViewMode('portal');
  };

  // If viewMode is 'portal', render the dedicated MPGBSIM Member Portal interface + Mursyid AI Chatbot
  if (viewMode === 'portal') {
    return (
      <>
        <PortalMainLayout />
        <MpgbChatbot onOpenPortal={handleOpenPortal} />
      </>
    );
  }

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

        {/* SAMBUTAN HARI LAHIR AHLI MPGBSIM (Ucapan Automatik Mesra Privasi) */}
        <PublicBirthdaySection />

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

        {/* SOALAN LAZIM (FAQ) KEAHLIAN & PORTAL MPGBSIM (Schema.org FAQPage) */}
        <FAQSection
          onOpenPortal={handleOpenPortal}
          onNavigateSection={handleScrollTo}
        />
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

      {/* Floating AI Chatbot: Mursyid AI - Pembantu Maya Rasmi MPGBSIM */}
      <MpgbChatbot
        onOpenPortal={handleOpenPortal}
        onNavigateSection={handleScrollTo}
      />

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
