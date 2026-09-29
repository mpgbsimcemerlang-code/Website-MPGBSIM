import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  User,
  Building2,
  Bell,
  Calendar,
  FileText,
  Sparkles,
  Cpu,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { useMemberPortal, PortalTab } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { AI_PROMPTS_LIBRARY } from '../../data/portalMockData';

export const PortalGlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    announcements,
    documents,
    bestPractices,
    setPortalTab,
    setPortalSubTab,
  } = useMemberPortal();

  const { siteData } = useAdminContent();
  const schools = siteData.memberSchools || [];
  const programs = siteData.programs || [];

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('semua');

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  // Search logic across all collections
  const q = query.trim().toLowerCase();

  const matchingSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.principal.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
  );

  const matchingAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
  );

  const matchingPrograms = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.theme || '').toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );

  const matchingDocuments = documents.filter(
    (d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
  );

  const matchingPractices = bestPractices.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      (b.school || b.schoolName || '').toLowerCase().includes(q) ||
      (b.challenge || '').toLowerCase().includes(q)
  );

  const matchingPrompts = AI_PROMPTS_LIBRARY.filter(
    (pr) => pr.title.toLowerCase().includes(q) || pr.prompt.toLowerCase().includes(q)
  );

  const matchingNews = (siteData.news || []).filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      (n.schoolName || '').toLowerCase().includes(q) ||
      (n.summary || '').toLowerCase().includes(q) ||
      (n.category || '').toLowerCase().includes(q)
  );

  const totalResults =
    matchingSchools.length +
    matchingAnnouncements.length +
    matchingPrograms.length +
    matchingDocuments.length +
    matchingPractices.length +
    matchingPrompts.length +
    matchingNews.length;

  const handleNavigate = (tab: PortalTab, subTab?: string) => {
    setPortalTab(tab);
    if (subTab) setPortalSubTab(subTab);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search input bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-amber-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ahli, sekolah, pengumuman, program, modul, dokumen atau prompt..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 focus:outline-hidden placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              Kosongkan
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <p className="font-semibold text-slate-700">Taip kata kunci untuk memulakan carian bersepadu.</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <span className="text-[10px] text-slate-400">Cadangan:</span>
                {['Mesyuarat AGM', 'Tahfiz', 'Garis Panduan AI', 'SMKA', 'Wakaf'].map((sugg) => (
                  <button
                    key={sugg}
                    onClick={() => setQuery(sugg)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Tiada padanan dijumpai untuk &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Announcements Section */}
              {matchingAnnouncements.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-2 px-1">
                    Pengumuman ({matchingAnnouncements.length})
                  </span>
                  <div className="space-y-1">
                    {matchingAnnouncements.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => handleNavigate('pengumuman')}
                        className="p-2.5 rounded-xl hover:bg-amber-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 truncate block">{a.title}</span>
                            <span className="text-[10px] text-slate-400">{a.category} • {a.date}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schools & PGB */}
              {matchingSchools.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block mb-2 px-1">
                    Direktori Sekolah & PGB ({matchingSchools.length})
                  </span>
                  <div className="space-y-1">
                    {matchingSchools.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleNavigate('direktori', 'sekolah')}
                        className="p-2.5 rounded-xl hover:bg-indigo-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 truncate block">{s.name}</span>
                            <span className="text-[10px] text-slate-500">Pengetua: {s.principal} • {s.state}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Programs */}
              {matchingPrograms.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block mb-2 px-1">
                    Program & Acara ({matchingPrograms.length})
                  </span>
                  <div className="space-y-1">
                    {matchingPrograms.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleNavigate('program')}
                        className="p-2.5 rounded-xl hover:bg-teal-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 truncate block">{p.title}</span>
                            <span className="text-[10px] text-slate-400">{p.date} • {p.venue}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {matchingDocuments.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-2 px-1">
                    Dokumen & Pekeliling ({matchingDocuments.length})
                  </span>
                  <div className="space-y-1">
                    {matchingDocuments.slice(0, 3).map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleNavigate('dokumen')}
                        className="p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 truncate block">{d.title}</span>
                            <span className="text-[10px] text-slate-400">{d.category} • {d.fileSize}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Practice */}
              {matchingPractices.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-2 px-1">
                    Best Practice ({matchingPractices.length})
                  </span>
                  <div className="space-y-1">
                    {matchingPractices.slice(0, 3).map((bp) => (
                      <div
                        key={bp.id}
                        onClick={() => handleNavigate('best-practice')}
                        className="p-2.5 rounded-xl hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 truncate block">{bp.title}</span>
                            <span className="text-[10px] text-slate-400">{bp.school || bp.schoolName}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Berita Kejayaan Sekolah */}
              {matchingNews.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-2 px-1">
                    Berita Kejayaan Sekolah PGB ({matchingNews.length})
                  </span>
                  <div className="space-y-1">
                    {matchingNews.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNavigate('kejayaan-sekolah')}
                        className="p-2.5 rounded-xl hover:bg-amber-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 truncate block">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.schoolName || n.category} • {n.date}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Prompts */}
              {matchingPrompts.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-2 px-1">
                    Prompt Library AI ({matchingPrompts.length})
                  </span>
                  <div className="space-y-1">
                    {matchingPrompts.slice(0, 2).map((pr) => (
                      <div
                        key={pr.id}
                        onClick={() => handleNavigate('ai-hub')}
                        className="p-2.5 rounded-xl hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 truncate block">{pr.title}</span>
                            <span className="text-[10px] text-slate-400">{pr.category}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Ketik Esc untuk tutup</span>
          <span className="font-medium text-teal-800">Carian Bersepadu MPGBSIM</span>
        </div>
      </div>
    </div>
  );
};
