import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Layers,
  Lightbulb,
  ArrowRight,
  Database,
  Users,
  Compass,
  FileText,
  Download,
  Printer,
  RefreshCw,
  CheckCircle2,
  Sliders,
  X,
} from 'lucide-react';
import { AI_PROMPTS_LIBRARY, AI_TOOLS_LIST } from '../../data/portalMockData';
import {
  AI_PILLARS_CONFIG,
  AIPillarConfig,
  AISubModuleConfig,
  AIMemoryFieldValues,
} from '../../data/aiPillarModules';
import { AIPromptItem, AIToolItem } from '../../types';

const renderPlatformLogo = (toolId: string, sizeClass = 'w-12 h-12') => {
  switch (toolId) {
    case 'tool-gemini':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 border border-indigo-200/80 shadow-xs flex items-center justify-center shrink-0 relative overflow-hidden`}
          title="Gemini AI"
        >
          <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
            <defs>
              <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A73E8" />
                <stop offset="50%" stopColor="#9334E6" />
                <stop offset="100%" stopColor="#E94235" />
              </linearGradient>
            </defs>
            <path
              d="M18 3C18 11.284 11.284 18 3 18C11.284 18 18 24.716 18 33C18 24.716 24.716 18 33 18C24.716 18 18 11.284 18 3Z"
              fill="url(#geminiGrad)"
            />
          </svg>
        </div>
      );
    case 'tool-chatgpt':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-[#10A37F] border border-emerald-700/30 shadow-xs flex items-center justify-center shrink-0 text-white`}
          title="ChatGPT (OpenAI)"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a4.5 4.5 0 0 0-3.89 2.25L4.5 11.5a4.5 4.5 0 0 0 0 4.5l2.1 3.63a4.5 4.5 0 0 0 6.15 1.65l6.25-3.6" />
            <path d="M15.89 5.25A4.5 4.5 0 0 0 9.74 3.6L3.5 7.2" />
            <path d="M19.5 12.5a4.5 4.5 0 0 0 0-4.5L17.4 4.37a4.5 4.5 0 0 0-6.15-1.65L5 6.32" />
            <path d="M8.11 18.75a4.5 4.5 0 0 0 6.15 1.65l6.24-3.6" />
            <path d="M19.5 8l-3.61 6.25a4.5 4.5 0 0 1-3.89 2.25H4.8" />
            <polygon points="12 8.5 15 10.25 15 13.75 12 15.5 9 13.75 9 10.25 12 8.5" fill="currentColor" fillOpacity="0.18" />
          </svg>
        </div>
      );
    case 'tool-perplexity':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-[#13343B] border border-cyan-800/40 shadow-xs flex items-center justify-center shrink-0 text-[#20B8CD]`}
          title="Perplexity AI"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M5 5l14 14" />
            <path d="M19 5L5 19" />
            <rect x="6.5" y="6.5" width="11" height="11" rx="1" strokeOpacity="0.85" />
          </svg>
        </div>
      );
    case 'tool-claude':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-[#D97757] border border-orange-700/30 shadow-xs flex items-center justify-center shrink-0 text-white`}
          title="Claude AI (Anthropic)"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="2.5" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="21.5" y2="12" />
            <line x1="5.3" y1="5.3" x2="18.7" y2="18.7" />
            <line x1="18.7" y1="5.3" x2="5.3" y2="18.7" />
            <line x1="7.5" y1="3.4" x2="16.5" y2="20.6" />
            <line x1="3.4" y1="7.5" x2="20.6" y2="16.5" />
            <circle cx="12" cy="12" r="2.2" fill="#D97757" stroke="none" />
          </svg>
        </div>
      );
    case 'tool-copilot':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-sky-50 via-white to-indigo-50 border border-sky-200 shadow-xs flex items-center justify-center shrink-0`}
          title="Microsoft Copilot"
        >
          <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
            <defs>
              <linearGradient id="copBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A4EF" />
                <stop offset="100%" stopColor="#2B579A" />
              </linearGradient>
              <linearGradient id="copWarm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB900" />
                <stop offset="50%" stopColor="#F25022" />
                <stop offset="100%" stopColor="#D83B01" />
              </linearGradient>
            </defs>
            <path
              d="M8 21C6.34 21 5 19.66 5 18C5 14.5 7.5 9 13 9H19C16.5 9 14.5 12 13.5 15.5L12 21H8Z"
              fill="url(#copBlue)"
            />
            <path
              d="M28 15C29.66 15 31 16.34 31 18C31 21.5 28.5 27 23 27H17C19.5 27 21.5 24 22.5 20.5L24 15H28Z"
              fill="url(#copWarm)"
            />
            <path
              d="M13 9H21C24.5 9 26.5 11.5 25.5 15L22.5 24C21.5 26 19.5 27 17 27H14C11.5 27 10 24.5 11 21L13.5 12.5C14 10.5 13.5 9 13 9Z"
              fill="#7F52FF"
              fillOpacity="0.88"
            />
          </svg>
        </div>
      );
    case 'tool-conker':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 border border-orange-400/40 shadow-xs flex items-center justify-center shrink-0 text-white`}
          title="Conker AI (Bina Kuiz)"
        >
          <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
            <path
              d="M7 9C7 6.79 8.79 5 11 5H17C19.21 5 21 6.79 21 9V11H7V9Z"
              fill="#FDE68A"
            />
            <path
              d="M8 11H20V16C20 19.87 16.87 23 13 23H15C11.13 23 8 19.87 8 16V11Z"
              fill="white"
            />
            <path
              d="M11.5 16.2L13.3 18L16.8 14.2"
              stroke="#EA580C"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14 2.5V5" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'tool-suno':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-slate-950 via-fuchsia-950 to-amber-600 border border-fuchsia-500/40 shadow-xs flex items-center justify-center shrink-0 text-white`}
          title="Suno AI"
        >
          <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
            <defs>
              <linearGradient id="sunoSun" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#D946EF" />
              </linearGradient>
            </defs>
            <circle cx="14" cy="14" r="7.5" fill="url(#sunoSun)" />
            <path d="M5 16H23" stroke="#0F172A" strokeWidth="1.6" />
            <path d="M6.5 18.8H21.5" stroke="#0F172A" strokeWidth="1.6" />
            <path d="M9 21.4H19" stroke="#0F172A" strokeWidth="1.6" />
            <path d="M18 6.5V12.5C18 13.6 17.1 14.5 16 14.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'tool-pixlr':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-slate-900 border border-violet-500/40 shadow-xs flex items-center justify-center shrink-0`}
          title="Pixlr AI"
        >
          <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
            <circle cx="14" cy="14" r="10" stroke="url(#pixlrGrad)" strokeWidth="3.5" />
            <circle cx="14" cy="14" r="4" fill="#38BDF8" />
            <path d="M14 4L18 10H10L14 4Z" fill="#F43F5E" />
            <path d="M24 14L18 18V10L24 14Z" fill="#FBBF24" />
            <path d="M14 24L10 18H18L14 24Z" fill="#10B981" />
            <path d="M4 14L10 10V18L4 14Z" fill="#A855F7" />
            <defs>
              <linearGradient id="pixlrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
    case 'tool-bing-image':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 border border-blue-400/40 shadow-xs flex items-center justify-center shrink-0 text-white`}
          title="Bing Image Creator"
        >
          <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
            <path
              d="M7 5.5L11.5 7.2V18.2L17.8 14.5L14.5 12.8L16.5 9.5L22 12.5V17.5L11.5 23.2L7 20.5V5.5Z"
              fill="white"
            />
            <path
              d="M20.5 4.5L21.5 7L24 8L21.5 9L20.5 11.5L19.5 9L17 8L19.5 7L20.5 4.5Z"
              fill="#FDE047"
            />
          </svg>
        </div>
      );
    case 'tool-notebooklm':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xs flex items-center justify-center shrink-0 text-emerald-400`}
          title="Google NotebookLM"
        >
          <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
            <rect x="5" y="4" width="18" height="20" rx="3.5" stroke="currentColor" strokeWidth="2" />
            <path d="M9 12C10.5 9.5 12.5 9.5 14 12C15.5 14.5 17.5 14.5 19 12" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M9 17H19" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.8" />
            <path d="M9 8H14" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.8" />
          </svg>
        </div>
      );
    case 'tool-canva':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-[#00C4CC] via-[#4856DF] to-[#8B3DFF] border border-cyan-300/40 shadow-xs flex items-center justify-center shrink-0 text-white`}
          title="Canva for Education AI"
        >
          <span className="font-serif italic font-black text-xl tracking-tighter select-none drop-shadow-xs">
            Canva
          </span>
        </div>
      );
    case 'tool-gamma':
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 border border-indigo-400/40 shadow-xs flex items-center justify-center shrink-0 text-white`}
          title="Gamma App"
        >
          <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
            <path
              d="M7 8H21L15.5 14.5H20V21H13.5V15.5L7 8Z"
              fill="white"
            />
            <circle cx="9.5" cy="18.5" r="2.5" fill="#FDE047" />
          </svg>
        </div>
      );
    default:
      return (
        <div
          className={`${sizeClass} rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center shrink-0 font-black text-sm`}
        >
          AI
        </div>
      );
  }
};

const renderPillarIcon = (pillarId: AIPillarConfig['id']) => {
  switch (pillarId) {
    case 'kepimpinan':
      return <Compass className="w-5 h-5" />;
    case 'pentadbiran':
      return <BookOpen className="w-5 h-5" />;
    case 'kurikulum':
      return <Lightbulb className="w-5 h-5" />;
    case 'hem':
      return <Users className="w-5 h-5" />;
    case 'data':
      return <Database className="w-5 h-5" />;
  }
};

export const PortalAIDigitalHub: React.FC = () => {
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string>('Semua');
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>('Semua');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabSection, setActiveTabSection] = useState<
    'all' | 'kepimpinan' | 'pentadbiran' | 'kurikulum' | 'hem' | 'data' | 'prompts' | 'tools'
  >('all');

  // Interactive Studio State for the 15 Modules across the 5 Pillars
  const [selectedSubModuleId, setSelectedSubModuleId] = useState<string>('kep-1');
  const [studioOutputMode, setStudioOutputMode] = useState<'draft' | 'prompt'>('draft');
  const [customValuesMap, setCustomValuesMap] = useState<Record<string, AIMemoryFieldValues>>(() => {
    const initial: Record<string, AIMemoryFieldValues> = {};
    AI_PILLARS_CONFIG.forEach((pillar) => {
      pillar.subModules.forEach((mod) => {
        initial[mod.id] = { ...mod.defaults };
      });
    });
    return initial;
  });
  const [editableDraftMap, setEditableDraftMap] = useState<Record<string, string>>(() => {
    const initialDrafts: Record<string, string> = {};
    AI_PILLARS_CONFIG.forEach((pillar) => {
      pillar.subModules.forEach((mod) => {
        initialDrafts[mod.id] = mod.buildDraftDocument(mod.defaults);
      });
    });
    return initialDrafts;
  });
  const [studioStatusToast, setStudioStatusToast] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const studioRef = useRef<HTMLDivElement | null>(null);

  // Find current active sub-module and pillar
  const allSubModules: AISubModuleConfig[] = AI_PILLARS_CONFIG.flatMap((p) => p.subModules);
  const activeSubModule: AISubModuleConfig =
    allSubModules.find((m) => m.id === selectedSubModuleId) || allSubModules[0];
  const activePillar: AIPillarConfig =
    AI_PILLARS_CONFIG.find((p) => p.id === activeSubModule.pillarId) || AI_PILLARS_CONFIG[0];

  const currentFieldValues: AIMemoryFieldValues =
    customValuesMap[activeSubModule.id] || activeSubModule.defaults;
  const currentDraftText: string =
    editableDraftMap[activeSubModule.id] ?? activeSubModule.buildDraftDocument(currentFieldValues);
  const currentBuiltPrompt: string = activeSubModule.buildPrompt(currentFieldValues);

  // Sync top tab selection with active pillar and prompt category
  const handleSelectTopTab = (
    tabId: 'all' | 'kepimpinan' | 'pentadbiran' | 'kurikulum' | 'hem' | 'data' | 'prompts' | 'tools'
  ) => {
    setActiveTabSection(tabId);
    if (['kepimpinan', 'pentadbiran', 'kurikulum', 'hem', 'data'].includes(tabId)) {
      const targetPillar = AI_PILLARS_CONFIG.find((p) => p.id === tabId);
      if (targetPillar) {
        setSelectedPromptCategory(targetPillar.promptCategory);
        if (activeSubModule.pillarId !== targetPillar.id) {
          setSelectedSubModuleId(targetPillar.subModules[0].id);
        }
      }
    } else if (tabId === 'all') {
      setSelectedPromptCategory('Semua');
    }
  };

  // Handle clicking any of the 15 sub-modules
  const handleSelectSubModule = (subMod: AISubModuleConfig, scrollToStudio = true) => {
    setSelectedSubModuleId(subMod.id);
    const parentPillar = AI_PILLARS_CONFIG.find((p) => p.id === subMod.pillarId);
    if (parentPillar && activeTabSection !== 'all') {
      setSelectedPromptCategory(parentPillar.promptCategory);
    }
    if (scrollToStudio && studioRef.current) {
      setTimeout(() => {
        studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleFieldChange = (fieldKey: keyof AIMemoryFieldValues, value: string) => {
    const updatedValues: AIMemoryFieldValues = {
      ...currentFieldValues,
      [fieldKey]: value,
    };
    setCustomValuesMap((prev) => ({
      ...prev,
      [activeSubModule.id]: updatedValues,
    }));
    // Automatically keep the draft document updated as the user customizes inputs
    setEditableDraftMap((prev) => ({
      ...prev,
      [activeSubModule.id]: activeSubModule.buildDraftDocument(updatedValues),
    }));
  };

  const handleRegenerateDraft = () => {
    const freshDraft = activeSubModule.buildDraftDocument(currentFieldValues);
    setEditableDraftMap((prev) => ({
      ...prev,
      [activeSubModule.id]: freshDraft,
    }));
    triggerToast('Draf dokumen rasmi telah dikemas kini mengikut maklumat sekolah anda!');
  };

  const handleResetDefaults = () => {
    const def = { ...activeSubModule.defaults };
    setCustomValuesMap((prev) => ({
      ...prev,
      [activeSubModule.id]: def,
    }));
    setEditableDraftMap((prev) => ({
      ...prev,
      [activeSubModule.id]: activeSubModule.buildDraftDocument(def),
    }));
    triggerToast('Maklumat input telah ditetapkan semula kepada contoh asal.');
  };

  const triggerToast = (msg: string) => {
    setStudioStatusToast(msg);
    setTimeout(() => {
      setStudioStatusToast(null);
    }, 3500);
  };

  const handleCopyStudioContent = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`${label} berjaya disalin ke papan keratan (Clipboard)!`);
  };

  const handleDownloadDocument = () => {
    const blob = new Blob([currentDraftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = activeSubModule.title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_');
    a.href = url;
    a.download = `${safeTitle}_MPGBSIM.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Fail dokumen (.TXT) berjaya dimuat turun!');
  };

  const categories = ['Semua', 'Kepimpinan', 'Pentadbiran', 'Kurikulum', 'HEM', 'Data & Analisis'];

  const toolFilterGroups = [
    { id: 'Semua', label: `Semua Platform (${AI_TOOLS_LIST.length})` },
    { id: 'llm', label: 'AI Teks & Carian (Gemini, ChatGPT, Claude, Copilot, Perplexity)' },
    { id: 'pdp', label: 'Kuiz, Audio & PdP (Conker, Suno, NotebookLM)' },
    { id: 'kreatif', label: 'Grafik, Imej & Slaid (Pixlr, Bing Image, Canva, Gamma)' },
  ];

  const filteredTools = AI_TOOLS_LIST.filter((tool) => {
    if (selectedToolFilter === 'Semua') return true;
    if (selectedToolFilter === 'llm') {
      return ['tool-gemini', 'tool-chatgpt', 'tool-perplexity', 'tool-claude', 'tool-copilot'].includes(tool.id);
    }
    if (selectedToolFilter === 'pdp') {
      return ['tool-conker', 'tool-suno', 'tool-notebooklm'].includes(tool.id);
    }
    if (selectedToolFilter === 'kreatif') {
      return ['tool-pixlr', 'tool-bing-image', 'tool-canva', 'tool-gamma'].includes(tool.id);
    }
    return true;
  });

  const filteredPrompts = AI_PROMPTS_LIBRARY.filter((item) => {
    const matchCat = selectedPromptCategory === 'Semua' || item.category === selectedPromptCategory;
    const matchQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleCopyPrompt = (promptItem: AIPromptItem) => {
    navigator.clipboard.writeText(promptItem.prompt);
    setCopiedPromptId(promptItem.id);
    setTimeout(() => {
      setCopiedPromptId(null);
    }, 2500);
  };

  const handleOpenPromptInStudio = (promptItem: AIPromptItem) => {
    const matchingMod = allSubModules.find(
      (m) => m.promptId === promptItem.id || m.title.toLowerCase() === promptItem.title.toLowerCase()
    );
    if (matchingMod) {
      handleSelectSubModule(matchingMod, true);
    }
  };

  // Visible pillars based on activeTabSection
  const visiblePillars =
    activeTabSection === 'all'
      ? AI_PILLARS_CONFIG
      : AI_PILLARS_CONFIG.filter((p) => p.id === activeTabSection);

  const quickLaunchLLMs = AI_TOOLS_LIST.filter((t) =>
    ['tool-gemini', 'tool-chatgpt', 'tool-claude', 'tool-perplexity', 'tool-copilot'].includes(t.id)
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-purple-900/50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Biro Transformasi Digital MPGBSIM
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            AI & DIGITAL HUB SEKOLAH ISLAM
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-purple-200 leading-relaxed max-w-2xl">
            Studio interaktif 5 Teras Kepimpinan & Pengurusan AI, pustaka prompt sedia guna, dan 12 platform AI pendidikan beretika untuk Pengetua, Guru Besar serta warga pendidik.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-purple-300">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">✓ 5 Teras & 15 Modul AI Berfungsi Penuh</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">✓ Penjana Draf Dokumen & Prompt Sekolah</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">✓ 12 Platform AI Pendidikan</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for the 7 Sections */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'Semua Fokus (1–7)' },
          { id: 'kepimpinan', label: '1. AI Kepimpinan' },
          { id: 'pentadbiran', label: '2. AI Pentadbiran' },
          { id: 'kurikulum', label: '3. AI Kurikulum' },
          { id: 'hem', label: '4. AI HEM & Sahsiah' },
          { id: 'data', label: '5. AI Data & Analitik' },
          { id: 'prompts', label: '6. Prompt Library (15)' },
          { id: 'tools', label: '7. Alatan AI (12)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSelectTopTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTabSection === tab.id
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5 Pillars of Educational AI Framework (Sections 1 to 5) */}
      {(activeTabSection === 'all' ||
        ['kepimpinan', 'pentadbiran', 'kurikulum', 'hem', 'data'].includes(activeTabSection)) && (
        <div className="space-y-6">
          {/* Interactive Instruction Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-teal-50/60 border border-purple-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-900 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">
                  Klik Mana-Mana Modul Di Bawah Untuk Menggunakan Penjana Dokumen & Prompt AI
                </p>
                <p className="text-[11px] text-slate-600">
                  Kesemua 5 Teras dan 15 Modul di bawah berfungsi sepenuhnya — klik pada senarai modul untuk membuka Studio Interaktif.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold shrink-0 self-start sm:self-center">
              ● 15/15 Modul Aktif
            </span>
          </div>

          {/* Grid of Pillar Cards */}
          <div
            className={`grid grid-cols-1 ${
              visiblePillars.length === 1 ? 'lg:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'
            } gap-5`}
          >
            {visiblePillars.map((pillar) => {
              const isPillarSelected = activePillar.id === pillar.id;
              return (
                <div
                  key={pillar.id}
                  className={`p-6 rounded-3xl bg-white border transition-all shadow-xs flex flex-col justify-between ${
                    isPillarSelected
                      ? pillar.colorScheme.activeRing
                      : `border-slate-200 ${pillar.colorScheme.borderHover}`
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className={`w-10 h-10 rounded-2xl ${pillar.colorScheme.bgBadge} ${pillar.colorScheme.textBadge} flex items-center justify-center`}
                      >
                        {renderPillarIcon(pillar.id)}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${pillar.colorScheme.bgBadge} ${pillar.colorScheme.textBadge}`}
                      >
                        3 Modul Interaktif
                      </span>
                    </div>

                    <h3 className="font-black text-base text-slate-900">{pillar.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {pillar.description}
                    </p>

                    {/* Interactive Clickable Sub-Modules (The 3 Bullets per Pillar) */}
                    <div className="mt-4 space-y-2">
                      {pillar.subModules.map((subMod) => {
                        const isActiveMod = activeSubModule.id === subMod.id;
                        return (
                          <button
                            key={subMod.id}
                            type="button"
                            onClick={() => handleSelectSubModule(subMod, true)}
                            className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 group ${
                              isActiveMod
                                ? `${pillar.colorScheme.lightBg} border-slate-900/30 shadow-2xs`
                                : 'bg-slate-50/90 hover:bg-slate-100 border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <span
                                className={`${pillar.colorScheme.dotColor} font-black text-sm leading-none mt-0.5`}
                              >
                                •
                              </span>
                              <span
                                className={`text-xs leading-snug ${
                                  isActiveMod
                                    ? 'font-black text-slate-900'
                                    : 'font-semibold text-slate-700 group-hover:text-slate-900'
                                }`}
                              >
                                {subMod.title}
                              </span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors ${
                                isActiveMod
                                  ? `${pillar.colorScheme.btnBg} text-white`
                                  : 'bg-white text-slate-600 border border-slate-200 group-hover:border-slate-400'
                              }`}
                            >
                              {isActiveMod ? 'Aktif' : 'Guna'}
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer Action Button */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      Klik item di atas untuk bina draf
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectSubModule(pillar.subModules[0], true)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${pillar.colorScheme.btnBg} ${pillar.colorScheme.btnHover}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Buka Studio {pillar.shortLabel.replace(/^\d+\.\s*/, '')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================================================================= */}
          {/* INTERACTIVE AI STUDIO & DOCUMENT BUILDER FOR ALL 15 SUB-MODULES   */}
          {/* ================================================================= */}
          <div
            ref={studioRef}
            className="rounded-3xl bg-white border-2 border-purple-900/20 shadow-lg overflow-hidden scroll-mt-6"
          >
            {/* Studio Top Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Studio AI Interaktif PGB
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 text-[11px] font-bold">
                      {activePillar.title}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                      {activeSubModule.documentType}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                    {activeSubModule.title}
                  </h2>
                  <p className="text-xs text-purple-200 mt-1 max-w-3xl">
                    {activeSubModule.summary}
                  </p>
                </div>

                {/* Quick switcher for the 3 modules within the active pillar */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                    Tukar Modul Dalam {activePillar.title}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePillar.subModules.map((mod, idx) => (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleSelectSubModule(mod, false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeSubModule.id === mod.id
                            ? 'bg-white text-purple-950 shadow-sm'
                            : 'bg-white/10 hover:bg-white/20 text-purple-100'
                        }`}
                      >
                        Modul {activePillar.number}.{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Toast Notification inside Studio */}
            {studioStatusToast && (
              <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{studioStatusToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStudioStatusToast(null)}
                  className="text-white/80 hover:text-white text-xs"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Studio Body: Left = School Parameter Inputs, Right = Generated Document / Prompt */}
            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/60">
              {/* LEFT COLUMN: 4 Customizer Inputs */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-800" />
                      <h3 className="font-black text-sm text-slate-900">
                        1. Maklumat & Konteks Sekolah
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="text-[11px] font-semibold text-slate-500 hover:text-purple-800 flex items-center gap-1"
                      title="Tetapkan semula kepada contoh asal"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Contoh Asal
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {activeSubModule.labels.schoolName}
                    </label>
                    <input
                      type="text"
                      value={currentFieldValues.schoolName}
                      onChange={(e) => handleFieldChange('schoolName', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {activeSubModule.labels.field1}
                    </label>
                    <input
                      type="text"
                      value={currentFieldValues.field1}
                      onChange={(e) => handleFieldChange('field1', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {activeSubModule.labels.field2}
                    </label>
                    <textarea
                      rows={2}
                      value={currentFieldValues.field2}
                      onChange={(e) => handleFieldChange('field2', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {activeSubModule.labels.field3}
                    </label>
                    <textarea
                      rows={3}
                      value={currentFieldValues.field3}
                      onChange={(e) => handleFieldChange('field3', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerateDraft}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Jana & Kemas Kini Draf Dokumen
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Ubah maklumat di atas untuk menyesuaikan draf dokumen & prompt AI secara automatik.
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: Output Workspace (Draft Document OR Custom Prompt + Direct AI Launch) */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
                <div>
                  {/* Mode Switcher Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setStudioOutputMode('draft')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          studioOutputMode === 'draft'
                            ? 'bg-purple-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Draf Dokumen Sedia Guna
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudioOutputMode('prompt')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          studioOutputMode === 'prompt'
                            ? 'bg-purple-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Prompt AI Tersuai
                      </button>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {studioOutputMode === 'draft' ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyStudioContent(currentDraftText, 'Draf dokumen rasmi')
                            }
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Salin Draf
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadDocument}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Muat Turun (.TXT)
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPrintModal(true)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Paparan Cetak Rasmi
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyStudioContent(currentBuiltPrompt, 'Prompt AI tersuai')
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Salin Prompt Tersuai
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Output Content Area */}
                  {studioOutputMode === 'draft' ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Draf dokumen di bawah boleh disunting terus sebelum disalin atau dicetak:
                        </span>
                        <span className="font-semibold text-emerald-700">
                          ✓ Format Rasmi Sekolah
                        </span>
                      </div>
                      <textarea
                        rows={14}
                        value={currentDraftText}
                        onChange={(e) =>
                          setEditableDraftMap((prev) => ({
                            ...prev,
                            [activeSubModule.id]: e.target.value,
                          }))
                        }
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Prompt ini telah diisi secara automatik dengan maklumat sekolah anda:
                        </span>
                        <span className="font-semibold text-purple-800">
                          Sedia untuk Gemini / ChatGPT / Claude
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-[310px] overflow-y-auto">
                        {currentBuiltPrompt}
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct 1-Click Copy & Open in AI Platforms */}
                <div className="pt-3 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700">
                      Salin Prompt & Buka Terus Dalam Platform AI Pilihan (1-Klik):
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {quickLaunchLLMs.map((llm) => (
                      <a
                        key={`studio-launch-${llm.id}`}
                        href={llm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          navigator.clipboard.writeText(currentBuiltPrompt);
                          triggerToast(
                            `Prompt telah disalin! Sila tampal (Ctrl+V) di ${llm.name}.`
                          );
                        }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-400 transition-all group"
                        title={`Salin Prompt & Buka ${llm.name}`}
                      >
                        {renderPlatformLogo(llm.id, 'w-7 h-7')}
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold text-slate-800 group-hover:text-purple-950 truncate">
                            {llm.name.replace(/\s*\(.*?\)\s*/g, '')}
                          </span>
                          <span className="block text-[9px] text-slate-500">Salin & Buka</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: PROMPT LIBRARY (Now shown on 'all', 'prompts', AND when any Pillar 1-5 tab is selected!) */}
      {(activeTabSection === 'all' ||
        activeTabSection === 'prompts' ||
        ['kepimpinan', 'pentadbiran', 'kurikulum', 'hem', 'data'].includes(activeTabSection)) && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                6. Pustaka Prompt Sedia Guna (15 Modul Lengkap)
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Prompt Library Pengetua & Guru Besar ({filteredPrompts.length} Prompt)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Salin prompt dengan 1-klik atau klik &ldquo;Buka Dalam Studio&rdquo; untuk menjana draf dokumen rasmi sekolah anda.
              </p>
            </div>

            {/* Prompt category filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedPromptCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedPromptCategory === c
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPrompts.map((p) => {
              const isCopied = copiedPromptId === p.id;
              return (
                <div
                  key={p.id}
                  className="rounded-3xl p-5 bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">
                        {p.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPromptInStudio(p)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-900 hover:bg-purple-800 text-white flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Buka Dalam Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(p)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 shadow-xs'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Disalin!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Salin Prompt
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.description}</p>

                    {/* Prompt Box */}
                    <div className="mt-3 p-3.5 rounded-2xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                      {p.prompt}
                    </div>

                    {/* Usage Instructions */}
                    <div className="mt-3 p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Cara Penggunaan:</strong> {p.usageInstructions}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-1">
                    {p.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 7: TOOLS & RESOURCES */}
      {(activeTabSection === 'all' || activeTabSection === 'tools') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider mb-2">
                <Cpu className="w-3.5 h-3.5" />
                7. Alatan AI Disyorkan untuk Sekolah Islam
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Platform & Alatan AI Terpilih untuk PGB & Guru
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik terus pada logo atau kad platform AI di bawah untuk membuka alatan rasmi bagi pengurusan sekolah, PdP, kuiz, grafik dan audio.
              </p>
            </div>

            {/* Category filter tabs for AI Tools */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {toolFilterGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedToolFilter(group.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedToolFilter === group.id
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick-Launch Visual Logo Dock for Teachers & PGB */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-teal-50/40 to-indigo-50/40 border border-slate-200/90">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                Akses Pantas Logo Platform AI (Klik Untuk Buka Terus)
              </span>
              <span className="text-[11px] font-semibold text-teal-800">
                {AI_TOOLS_LIST.length} Platform Rasmi
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2.5">
              {AI_TOOLS_LIST.map((tool) => (
                <a
                  key={`dock-${tool.id}`}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-2 rounded-2xl bg-white hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-400 shadow-2xs hover:shadow-sm transition-all text-center"
                  title={`Buka ${tool.name}`}
                >
                  <div className="group-hover:scale-105 transition-transform">
                    {renderPlatformLogo(tool.id, 'w-11 h-11')}
                  </div>
                  <span className="mt-1.5 text-[10px] font-bold text-slate-800 group-hover:text-teal-900 line-clamp-1 leading-tight">
                    {tool.name.replace(/\s*\(.*?\)\s*/g, '')}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Detailed AI Platform Cards with Prominent Logos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool: AIToolItem) => (
              <div
                key={tool.id}
                className="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top: Prominent Platform Logo + Badges */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group-hover:scale-105 transition-transform"
                    >
                      {renderPlatformLogo(tool.id, 'w-14 h-14')}
                    </a>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-900">
                          {tool.badge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold truncate">
                          {tool.category}
                        </span>
                      </div>
                      <h3 className="font-black text-base text-slate-900 group-hover:text-teal-900 transition-colors leading-snug">
                        {tool.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{tool.description}</p>

                  <div className="mt-3.5 p-3 rounded-2xl bg-white border border-slate-200/90 text-[11px] text-slate-700">
                    <strong className="text-teal-900 block mb-0.5">Sangat Sesuai Untuk Guru & PGB:</strong>
                    <span>{tool.bestFor}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400 truncate max-w-[170px]">
                    {tool.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </span>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    Buka Platform <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* OFFICIAL DOCUMENT PRINT PREVIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                  Pratonton Dokumen Rasmi ({activeSubModule.documentType})
                </span>
                <h3 className="text-sm font-black">{activeSubModule.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDocument}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Muat Turun .TXT
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 bg-white">
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-teal-900">
                    MAJLIS PENGETUA & GURU BESAR SEKOLAH ISLAM MALAYSIA (MPGBSIM)
                  </p>
                  <h4 className="text-base font-black text-slate-900">
                    {currentFieldValues.schoolName.toUpperCase()}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Portal Rasmi: https://www.mpgbsim.org/ | Biro Transformasi Digital & AI
                  </p>
                </div>
                <div className="text-left sm:text-right text-[11px] text-slate-500">
                  <p className="font-bold text-slate-800">{activePillar.title}</p>
                  <p>Tarikh Jana: {new Date().toLocaleDateString('ms-MY')}</p>
                </div>
              </div>

              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed">
                {currentDraftText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


