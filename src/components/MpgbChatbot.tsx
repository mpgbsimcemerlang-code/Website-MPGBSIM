import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  BookOpen,
  Building2,
  CreditCard,
  Users,
  ChevronRight,
  Copy,
  Check,
  MessageCircleQuestion,
} from 'lucide-react';
import {
  useAdminContent,
  DEFAULT_MEMBER_SCHOOLS,
  DEFAULT_LEADERSHIP,
} from '../context/AdminContentContext';
import { useMemberPortal } from '../context/MemberPortalContext';
import { MPGBSIM_FAQ_LIST } from './FAQSection';
import { MemberSchool, LeaderProfile } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    action: 'portal' | 'sekolah-ahli' | 'bayar-yuran' | 'kepimpinan' | 'program' | 'hubungi';
  }>;
}

interface QuickQuestion {
  id: string;
  label: string;
  prompt: string;
  category: 'Umum' | 'Sekolah & Pimpinan' | 'Portal & Yuran';
}

const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: 'q-gb-musleh',
    label: 'Siapa Guru Besar SRI I Musleh?',
    prompt: 'Siapa guru besar Sekolah Rendah Islam I Musleh?',
    category: 'Sekolah & Pimpinan',
  },
  {
    id: 'q-what',
    label: 'Apakah itu MPGBSIM?',
    prompt: 'Apakah itu MPGBSIM, sejarah penubuhan, serta visi dan misinya?',
    category: 'Umum',
  },
  {
    id: 'q-pimpinan',
    label: 'Barisan Kepimpinan Pusat',
    prompt: 'Siapakah barisan Jawatankuasa Kepimpinan Pusat MPGBSIM sesi semasa?',
    category: 'Sekolah & Pimpinan',
  },
  {
    id: 'q-sekolah',
    label: 'Statistik & Senarai Sekolah Ahli',
    prompt: 'Berapakah jumlah sekolah ahli MPGBSIM mengikut negeri dan status pendaftaran agensi (KPM, Jabatan Agama, MIEB)?',
    category: 'Sekolah & Pimpinan',
  },
  {
    id: 'q-keahlian',
    label: 'Beza Ahli Biasa & Bersekutu',
    prompt: 'Apakah perbezaan antara kategori Ahli Biasa (Fasal 4(2)) dan Ahli Bersekutu (Fasal 4(3)) MPGBSIM?',
    category: 'Umum',
  },
  {
    id: 'q-portal',
    label: 'Cara Log Masuk & Reset Kata Laluan PGB',
    prompt: 'Bagaimanakah cara log masuk ke Portal Rasmi Ahli PGB dan apakah perlu dibuat jika terlupa kata laluan?',
    category: 'Portal & Yuran',
  },
  {
    id: 'q-yuran',
    label: 'Cara Bayar Yuran HerePay',
    prompt: 'Bagaimanakah cara menjelaskan yuran keahlian tahunan MPGBSIM secara dalam talian?',
    category: 'Portal & Yuran',
  },
  {
    id: 'q-pendidikan',
    label: 'Tips Kepimpinan & Pengurusan Sekolah',
    prompt: 'Berikan panduan amalan terbaik kepimpinan instruksional Pengetua dan Guru Besar di sekolah Islam.',
    category: 'Umum',
  },
];

interface MpgbChatbotProps {
  onOpenPortal?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

// Helper to normalize text for accurate fuzzy/entity matching
function normalizeText(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[-/.,'"()[\]?!:;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Expand common school abbreviations so "sri i musleh" matches "sekolah rendah islam i musleh"
function expandSchoolAliases(str: string): string {
  const n = normalizeText(str);
  return n
    .replace(/\bsri\b/g, 'sekolah rendah islam')
    .replace(/\bsmi\b/g, 'sekolah menengah islam')
    .replace(/\bsma\b/g, 'sekolah menengah agama')
    .replace(/\bsmka\b/g, 'sekolah menengah kebangsaan agama')
    .replace(/\bsrai\b/g, 'sekolah rendah agama integrasi')
    .replace(/\bsabk\b/g, 'sekolah agama bantuan kerajaan')
    .replace(/\bi\s+musleh\b/g, 'i musleh')
    .replace(/\bimusleh\b/g, 'i musleh');
}

export const MpgbChatbot: React.FC<MpgbChatbotProps> = ({
  onOpenPortal,
  onNavigateSection,
}) => {
  const { siteData } = useAdminContent();
  const { viewMode, setViewMode } = useMemberPortal();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    'Semua' | 'Umum' | 'Sekolah & Pimpinan' | 'Portal & Yuran'
  >('Semua');

  // Merge live schools with default schools so key schools like SEKOLAH RENDAH ISLAM I MUSLEH are always present
  const allSchools: MemberSchool[] = useMemo(() => {
    const live = siteData.memberSchools || [];
    const map = new Map<string, MemberSchool>();
    DEFAULT_MEMBER_SCHOOLS.forEach((s) => {
      map.set((s.code || s.id).toUpperCase(), s);
    });
    live.forEach((s) => {
      const key = (s.code || s.id).toUpperCase();
      const existing = map.get(key);
      // Ensure SRI I Musleh always retains its Guru Besar name if missing
      const isSriMusleh =
        s.id === 'sch-musleh-1' ||
        (s.code || '').toUpperCase() === 'MJAC011' ||
        normalizeText(s.name).includes('sekolah rendah islam i musleh');
      const resolvedPrincipal =
        s.principal && s.principal.trim() !== '' && s.principal !== '-'
          ? s.principal
          : isSriMusleh
          ? 'Abdul Qayyum bin Yaakop'
          : existing?.principal || '';
      map.set(key, {
        ...(existing || {}),
        ...s,
        principal: resolvedPrincipal,
      });
    });
    return Array.from(map.values());
  }, [siteData.memberSchools]);

  const allLeaders: LeaderProfile[] = useMemo(() => {
    const live = siteData.leadership || [];
    return live.length > 0 ? live : DEFAULT_LEADERSHIP;
  }, [siteData.leadership]);

  const initialGreeting: ChatMessage = useMemo(
    () => ({
      id: 'welcome-mursyid',
      role: 'model',
      text: `**Assalamualaikum warahmatullahi wabarakatuh & Salam Kepimpinan Pendidikan Rabbani.**\n\nSaya **Mursyid AI**, Pegawai Maya Rasmi bagi **Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)**.\n\nSaya dikhususkan untuk menjawab hal ehwal berkaitan:\n• **Keahlian MPGBSIM & Portal Ahli PGB** *(Pendaftaran, e-Kad, Reset Kata Laluan, Yuran HerePay)*\n• **Direktori Sekolah Islam Ahli & Kepimpinan PGB** *(Maklumat sekolah, Guru Besar & Pengetua)*\n• **Program, Takwim Rasmi Majlis & Konvensyen**\n• **Pengurusan Sekolah Islam & Kepimpinan Rabbani**\n\nAda sebarang pertanyaan mengenai keahlian, takwim, atau program majlis yang boleh saya bantu?`,
      timestamp: new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      suggestedActions: [
        { label: 'Buka Portal Ahli PGB', action: 'portal' },
        { label: 'Direktori Sekolah Ahli', action: 'sekolah-ahli' },
        { label: 'Bayar Yuran HerePay', action: 'bayar-yuran' },
      ],
    }),
    []
  );

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for custom global event so any section can trigger Mursyid AI
  useEffect(() => {
    const handleOpenChatbot = (e: Event) => {
      if (siteData.dashboardConfig?.enableAiChatbot === false) return;
      setIsOpen(true);
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      if (customEvent.detail?.prompt) {
        handleSendQuestion(customEvent.detail.prompt);
      }
    };
    window.addEventListener('open-mursyid-ai', handleOpenChatbot);
    return () => window.removeEventListener('open-mursyid-ai', handleOpenChatbot);
  });

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, isLoading]);

  // Build structured live context string from siteData for Gemini grounding (includes ALL schools)
  const liveSiteContext = useMemo(() => {
    const schools = allSchools;
    const leaders = allLeaders;
    const programs = siteData.programs || [];
    const news = (siteData.news || []).slice(0, 8);
    const practices = (siteData.practices || []).slice(0, 6);

    const stateCounts: Record<string, number> = {};
    let kpmCount = 0;
    let jaCount = 0;
    let miebCount = 0;

    schools.forEach((s) => {
      const st = s.state || 'Lain-lain';
      stateCounts[st] = (stateCounts[st] || 0) + 1;
      const agencies = Array.isArray(s.registeredAgencies) ? s.registeredAgencies : [];
      if (agencies.includes('KPM')) kpmCount++;
      if (agencies.includes('Jabatan Agama')) jaCount++;
      if (agencies.includes('MIEB')) miebCount++;
    });

    const stateSummary = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([st, cnt]) => `${st} (${cnt})`)
      .join(', ');

    const schoolLines = schools
      .map((s, idx) => {
        const agencies =
          Array.isArray(s.registeredAgencies) && s.registeredAgencies.length > 0
            ? ` | Berdaftar: ${s.registeredAgencies.join(', ')}`
            : '';
        const roleLabel =
          s.designation ||
          ((s.type || '').toLowerCase().includes('rendah') ? 'Guru Besar' : 'Pengetua');
        const pgb = s.principal ? ` | ${roleLabel}: ${s.principal}` : '';
        return `${idx + 1}. ${s.name} (Kod: ${s.code || '-'}) - ${s.district ? `${s.district}, ` : ''}${s.state}, Jenis: ${s.type}, Keahlian: ${s.membershipType || 'Ahli Biasa'}${pgb}${agencies}`;
      })
      .join('\n');

    const leaderLines = leaders
      .map(
        (l) =>
          `- ${l.role}${l.subRole ? ` (${l.subRole})` : ''}: ${l.name} (${l.institution || ''}, ${l.state || ''})`
      )
      .join('\n');

    const programLines = programs
      .slice(0, 8)
      .map((p) => `- ${p.title} | Tarikh: ${p.date} | Lokasi: ${p.venue} | Mod: ${p.mode}`)
      .join('\n');

    const newsLines = news
      .map((n) => `- [${n.date || ''}] ${n.title}: ${n.summary || ''}`)
      .join('\n');

    const practiceLines = practices
      .map((bp) => `- ${bp.title} oleh ${bp.schoolName || bp.school || ''} (${bp.category})`)
      .join('\n');

    return `
RINGKASAN STATISTIK RANGKAIAN MPGBSIM:
- Jumlah Sekolah Ahli Berdaftar dalam Sistem: ${schools.length} buah sekolah
- Taburan Mengikut Negeri: ${stateSummary}
- Analisis Pendaftaran Agensi: KPM (${kpmCount} sekolah), Jabatan Agama (${jaCount} sekolah), MIEB (${miebCount} sekolah)

SENARAI JAWATANKUASA KEPIMPINAN PUSAT MPGBSIM:
${leaderLines || 'Tiada rekod kepimpinan.'}

SENARAI PROGRAM & TAKWIM MPGBSIM:
${programLines || 'Tiada rekod program.'}

BERITA SEMASA MPGBSIM:
${newsLines || 'Tiada rekod berita.'}

AMALAN TERBAIK (BEST PRACTICE) SEKOLAH AHLI:
${practiceLines || 'Tiada rekod amalan terbaik.'}

DIREKTORI PENUH SEKOLAH AHLI & PENGETUA/GURU BESAR MPGBSIM:
${schoolLines}
`.trim();
  }, [allSchools, allLeaders, siteData.programs, siteData.news, siteData.practices]);

  // Comprehensive & Accurate Local Question-Answering Engine (strictly scoped to MPGBSIM & Islamic school affairs)
  const buildLocalFallbackAnswer = (query: string): string => {
    const rawQuery = query.trim();
    const q = normalizeText(rawQuery);
    const qExpanded = expandSchoolAliases(rawQuery);
    const schools = allSchools;
    const leaders = allLeaders;
    const programs = siteData.programs || [];
    const news = siteData.news || [];
    const practices = siteData.practices || [];
    const alumni = siteData.alumni || [];

    const OUT_OF_SCOPE_RESPONSE =
      'Maaf, saya Mursyid AI yang dikhususkan untuk urusan Majlis Pengetua & Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) sahaja. Ada sebarang pertanyaan mengenai keahlian, takwim, atau program majlis yang boleh saya bantu?';

    // 0. STRICT OUT-OF-SCOPE FILTERING: Politics, entertainment, personal affairs, gossip, external finance/crypto, unrelated sports
    const isExplicitlyOutOfScope =
      /\b(politik|pru|pilihan raya|parti|umno|pas|pkr|dap|bersatu|perikatan nasional|barisan nasional|pakatan harapan|calon pru|undi|kerajaan campuran|menteri kewangan|perdana menteri|kabinet|ahli parlimen|adun)\b/i.test(q) ||
      /\b(hiburan|artis|selebriti|gossip|gosip|konsert|wayang|movie|drama|lagu|filem|pelakon|penyanyi|netflix|kpop|tiktok|tiktoker|influencer)\b/i.test(q) ||
      /\b(umur awak|umur kamu|jodoh|dating|kahwin|cinta|girlfriend|boyfriend|peribadi saya|siapa bf|siapa gf)\b/i.test(q) ||
      /\b(kripto|crypto|bitcoin|forex|saham bursa|skim cepat kaya|pelaburan wang)\b/i.test(q) ||
      /\b(epl|liga inggeris|manchester united|chelsea|liverpool|arsenal|piala dunia|world cup|formula 1|f1)\b/i.test(q);

    if (isExplicitlyOutOfScope) {
      return OUT_OF_SCOPE_RESPONSE;
    }

    // =========================================================================
    // A. DIRECT ENTITY MATCHING: SPECIFIC SCHOOL OR PRINCIPAL / HEADMASTER QUERY
    //    e.g., "siapa guru besar sekolah rendah islam i musleh" -> "Abdul Qayyum bin Yaakop"
    // =========================================================================
    const isAskingWhoPrincipal =
      /\b(siapa|siapakah|nama)\b.*\b(guru besar|pengetua|mudir|pentadbir|gb|pgb|ketua)\b/i.test(q) ||
      /\b(guru besar|pengetua|mudir|pentadbir|gb|pgb)\b.*\b(siapa|siapakah)\b/i.test(q) ||
      /^(siapa\s+)?(guru besar|pengetua|mudir|gb|pgb)\s+/i.test(q);

    // Strip question & generic words to isolate distinctive school/person keywords
    const fillerWords = new Set([
      'siapa',
      'siapakah',
      'apakah',
      'apa',
      'nama',
      'guru',
      'besar',
      'pengetua',
      'mudir',
      'pentadbir',
      'gb',
      'pgb',
      'ketua',
      'bagi',
      'untuk',
      'di',
      'dekat',
      'dalam',
      'dari',
      'daripada',
      'kepada',
      'tentang',
      'mengenai',
      'maklumat',
      'info',
      'tolong',
      'beritahu',
      'nyatakan',
      'cari',
      'senaraikan',
      'yang',
      'ialah',
      'adalah',
      'sekarang',
      'semasa',
      'terkini',
      'mana',
      'di',
      'ke',
      'dan',
      'atau',
      'encik',
      'cikgu',
      'ustaz',
      'ustazah',
      'tuan',
      'puan',
      'haji',
      'hajah',
      'dr',
    ]);

    const genericSchoolWords = new Set([
      'sekolah',
      'rendah',
      'menengah',
      'islam',
      'agama',
      'kebangsaan',
      'integrasi',
      'tahfiz',
      'maahad',
      'sri',
      'smi',
      'sma',
      'smka',
      'srai',
      'sabk',
      'al',
      'at',
      'as',
      'ass',
      'ad',
      'an',
      'ar',
      'darul',
      'bantuan',
      'kerajaan',
    ]);

    const queryTokens = qExpanded.split(' ').filter(Boolean);
    const nonFillerTokens = queryTokens.filter((t) => !fillerWords.has(t));
    const distinctiveTokens = nonFillerTokens.filter(
      (t) => !genericSchoolWords.has(t) && (t.length >= 2 || t === 'i')
    );

    const wantsRendah =
      qExpanded.includes('rendah') || /\bsri\b/.test(q) || q.includes('guru besar');
    const wantsMenengah =
      qExpanded.includes('menengah') || /\b(smi|sma|smka|sabk)\b/.test(q) || q.includes('pengetua');

    // Score each school against the user's question
    const scoredSchools = schools
      .map((s) => {
        const sNameNorm = normalizeText(s.name);
        const sNameExpanded = expandSchoolAliases(s.name);
        const sCodeNorm = normalizeText(s.code || '');
        const sPgbNorm = normalizeText((s.principal || '').replace(/\(.*?\)/g, ''));

        let score = 0;

        // 1. Exact school code match
        if (sCodeNorm && sCodeNorm.length >= 4 && q.includes(sCodeNorm)) {
          score += 100;
        }

        // 2. Full school name appears inside the user's query (e.g. "siapa guru besar sekolah rendah islam i musleh")
        if (sNameNorm.length >= 6 && (q.includes(sNameNorm) || qExpanded.includes(sNameExpanded))) {
          score += 95;
        }

        // 3. Stripped query (without "siapa guru besar") matches school name
        const strippedPhrase = nonFillerTokens.join(' ').trim();
        if (
          strippedPhrase.length >= 5 &&
          (sNameNorm === strippedPhrase ||
            sNameExpanded === strippedPhrase ||
            sNameNorm.includes(strippedPhrase) ||
            sNameExpanded.includes(strippedPhrase))
        ) {
          score += 85;
        }

        // 4. Distinctive token matching (e.g. "i musleh", "putrajaya", "syakirin", "hidayah", "al-amin", etc.)
        if (distinctiveTokens.length > 0) {
          const schoolTokens = new Set(sNameExpanded.split(' ').filter(Boolean));
          let matchedDistinctive = 0;
          for (const dt of distinctiveTokens) {
            if (schoolTokens.has(dt) || sNameExpanded.includes(dt)) {
              matchedDistinctive++;
            }
          }
          if (matchedDistinctive === distinctiveTokens.length && matchedDistinctive >= 1) {
            // Check that at least one distinctive token has length >= 3 (avoid matching only "i")
            const hasSubstantiveToken = distinctiveTokens.some((t) => t.length >= 3);
            if (hasSubstantiveToken) {
              score += 50 + matchedDistinctive * 15;
            }
          }
        }

        // 5. Disambiguate Rendah vs Menengah when multiple schools share a brand name (like SRI I Musleh vs SMA I-Musleh)
        if (score > 0) {
          const isSchoolRendah =
            sNameExpanded.includes('rendah') || (s.type || '').toLowerCase().includes('rendah');
          const isSchoolMenengah =
            sNameExpanded.includes('menengah') || (s.type || '').toLowerCase().includes('menengah');
          if (wantsRendah && isSchoolRendah) score += 25;
          if (wantsRendah && isSchoolMenengah) score -= 20;
          if (wantsMenengah && isSchoolMenengah) score += 25;
          if (wantsMenengah && isSchoolRendah) score -= 20;
        }

        // 6. Match by Principal / Guru Besar name if user asks about a person (e.g. "siapa abdul qayyum bin yaakop" or "ustaz abdul qayyum sekolah mana")
        if (sPgbNorm.length >= 5) {
          const pgbTokens = sPgbNorm
            .split(' ')
            .filter((t) => t.length >= 3 && t !== 'bin' && t !== 'binti' && t !== 'hj' && t !== 'hjh');
          if (q.includes(sPgbNorm)) {
            score += 90;
          } else if (pgbTokens.length >= 2) {
            const matchedPgbTokens = pgbTokens.filter((pt) => q.includes(pt));
            if (matchedPgbTokens.length >= 2) {
              score += 75;
            }
          }
        }

        return { school: s, score };
      })
      .filter((item) => item.score >= 50)
      .sort((a, b) => b.score - a.score);

    // If we found a strong school/principal match, answer directly and accurately!
    if (scoredSchools.length > 0) {
      const topMatch = scoredSchools[0];
      const s = topMatch.school;
      const cleanPrincipal =
        (s.principal || '')
          .replace(/\s*\((Pengetua|Guru Besar|Mudir)\)\s*/gi, '')
          .trim() || 'Pentadbir Sekolah';
      const roleTitle =
        s.designation ||
        ((s.type || '').toLowerCase().includes('rendah') ||
        (s.name || '').toLowerCase().includes('rendah')
          ? 'Guru Besar'
          : 'Pengetua');
      const agencies =
        Array.isArray(s.registeredAgencies) && s.registeredAgencies.length > 0
          ? s.registeredAgencies.join(', ')
          : 'Berdaftar MPGBSIM';

      // Check if this principal also holds a central leadership portfolio in MPGBSIM
      const pgbNorm = normalizeText(cleanPrincipal);
      const centralLeaderRole = leaders.find((l) => {
        const lNorm = normalizeText(l.name);
        return lNorm.includes(pgbNorm) || pgbNorm.includes(lNorm);
      });

      if (
        isAskingWhoPrincipal ||
        q.includes('guru besar') ||
        q.includes('pengetua') ||
        q.includes('mudir') ||
        q.includes('siapa')
      ) {
        return `**${cleanPrincipal}** ialah ${roleTitle} bagi **${s.name}**.\n\n**Butiran Rasmi Kepimpinan & Sekolah:**\n• **Nama ${roleTitle}**: **${cleanPrincipal}**${
          centralLeaderRole ? `\n• **Jawatan Pusat MPGBSIM**: ${centralLeaderRole.role}` : ''
        }\n• **Nama Institusi**: ${s.name}\n• **Kod Sekolah**: ${s.code || '-'}\n• **Daerah & Negeri**: ${
          s.district ? `${s.district}, ` : ''
        }${s.state}\n• **Kategori Sekolah**: ${s.type} (${s.membershipType || 'Ahli Biasa'})\n• **Agensi Berdaftar**: ${agencies}${
          s.studentCount ? `\n• **Bilangan Murid & Guru**: ${s.studentCount} murid${s.teacherCount ? ` / ${s.teacherCount} guru` : ''}` : ''
        }${s.phone || s.schoolPhone ? `\n• **No. Telefon Sekolah**: ${s.schoolPhone || s.phone}` : ''}${
          s.website ? `\n• **Laman Web**: ${s.website}` : ''
        }`;
      }

      // If multiple schools matched a broader school search, list up to 5
      const topSchools = scoredSchools.slice(0, 5).map((item) => item.school);
      const details = topSchools
        .map((sch) => {
          const cPgb =
            (sch.principal || '')
              .replace(/\s*\((Pengetua|Guru Besar|Mudir)\)\s*/gi, '')
              .trim() || 'Pentadbir Sekolah';
          const rTitle =
            sch.designation ||
            ((sch.type || '').toLowerCase().includes('rendah') ? 'Guru Besar' : 'Pengetua');
          const ag =
            Array.isArray(sch.registeredAgencies) && sch.registeredAgencies.length > 0
              ? sch.registeredAgencies.join(', ')
              : 'Berdaftar MPGBSIM';
          return `• **${sch.name}** (Kod: **${sch.code || '-'}**)\n  - **${rTitle}**: **${cPgb}**\n  - **Lokasi**: ${sch.district ? `${sch.district}, ` : ''}${sch.state} | **Kategori**: ${sch.type} (${sch.membershipType || 'Ahli Biasa'})\n  - **Agensi Berdaftar**: ${ag}${sch.phone ? ` | **Tel**: ${sch.phone}` : ''}`;
        })
        .join('\n\n');

      return `Berikut ialah maklumat rasmi sekolah ahli MPGBSIM yang sepadan dengan pertanyaan Tuan/Puan:\n\n${details}`;
    }

    // =========================================================================
    // B. SPECIFIC CENTRAL LEADERSHIP ROLE LOOKUP (e.g. "siapa pengerusi mpgbsim", "siapa setiausaha agung")
    // =========================================================================
    if (
      q.includes('pengerusi') ||
      q.includes('timbalan pengerusi') ||
      q.includes('setiausaha agung') ||
      q.includes('bendahari') ||
      q.includes('pimpinan') ||
      q.includes('kepimpinan') ||
      q.includes('jawatankuasa') ||
      q.includes('ajk') ||
      q.includes('exco')
    ) {
      if (q.includes('timbalan pengerusi')) {
        const timbalan = leaders.find((l) => l.role.toLowerCase().includes('timbalan pengerusi'));
        if (timbalan) {
          return `**${timbalan.name}** ialah **${timbalan.role}** MPGBSIM (${timbalan.subRole || timbalan.institution}, ${timbalan.state}).`;
        }
      }
      if (q.includes('setiausaha')) {
        const su = leaders.find((l) => l.role.toLowerCase().includes('setiausaha'));
        if (su) {
          return `**${su.name}** ialah **${su.role}** MPGBSIM (${su.subRole || su.institution}, ${su.state}).`;
        }
      }
      if (
        (q.includes('siapa pengerusi') || q.includes('nama pengerusi') || q === 'pengerusi mpgbsim') &&
        !q.includes('biro')
      ) {
        const pengerusi = leaders[0] || DEFAULT_LEADERSHIP[0];
        return `**${pengerusi.name}** ialah **Pengerusi Kebangsaan Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)** bagi ${pengerusi.term || 'Penggal 2026–2028'}.\n\n**Barisan Kepimpinan Utama MPGBSIM:**\n${leaders
          .slice(0, 6)
          .map((l) => `• **${l.role}**: ${l.name} *(${l.institution}, ${l.state})*`)
          .join('\n')}`;
      }

      const list = leaders
        .slice(0, 15)
        .map(
          (l) =>
            `• **${l.role}**: **${l.name}** *(${l.institution}${l.state ? `, ${l.state}` : ''})*`
        )
        .join('\n');
      return `**Barisan Jawatankuasa Kepimpinan Pusat MPGBSIM Sesi Semasa:**\n\n${list}\n\nBarisan kepimpinan ini menerajui hala tuju strategik jaringan sekolah-sekolah Islam di seluruh Malaysia.`;
    }

    // =========================================================================
    // C. PURE MATH EXPRESSIONS (OUT OF SCOPE)
    // =========================================================================
    const isPureMath =
      /^[0-9\s.+\-*/()%]+$/.test(rawQuery.replace(/[?=]/g, '').trim()) &&
      /[0-9]/.test(rawQuery) &&
      /[+\-*/%]/.test(rawQuery);
    if (isPureMath) {
      return OUT_OF_SCOPE_RESPONSE;
    }

    // =========================================================================
    // D. DATE, TIME & DAY QUERIES
    // =========================================================================
    if (
      q.includes('tarikh hari ini') ||
      q.includes('hari ini hari apa') ||
      q.includes('berapa haribulan') ||
      q.includes('pukul berapa sekarang') ||
      q.includes('waktu sekarang')
    ) {
      const now = new Date();
      const tarikhStr = now.toLocaleDateString('ms-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const masaStr = now.toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `**Maklumat Tarikh & Waktu Semasa:**\n\n• **Hari & Tarikh**: **${tarikhStr}**\n• **Waktu Semasa**: **${masaStr}**`;
    }

    // =========================================================================
    // E. SCHOOLS BY MALAYSIAN STATE
    // =========================================================================
    const malaysianStates = [
      'selangor',
      'johor',
      'kedah',
      'kelantan',
      'terengganu',
      'pahang',
      'perak',
      'pulau pinang',
      'penang',
      'negeri sembilan',
      'melaka',
      'perlis',
      'sabah',
      'sarawak',
      'kuala lumpur',
      'putrajaya',
      'wilayah persekutuan',
    ];
    const matchedState = malaysianStates.find((st) => q.includes(st));
    if (
      matchedState &&
      (q.includes('sekolah') ||
        q.includes('senarai') ||
        q.includes('ahli') ||
        q.includes('guru besar') ||
        q.includes('pengetua') ||
        q.includes('berapa'))
    ) {
      const normalizedState = matchedState === 'penang' ? 'pulau pinang' : matchedState;
      const stateSchools = schools.filter((s) =>
        (s.state || '').toLowerCase().includes(normalizedState)
      );
      if (stateSchools.length > 0) {
        const list = stateSchools
          .slice(0, 20)
          .map((s, i) => {
            const cleanPgb = (s.principal || 'Pentadbir').replace(/\s*\((Pengetua|Guru Besar)\)\s*/gi, '');
            const rLabel = (s.type || '').toLowerCase().includes('rendah') ? 'Guru Besar' : 'Pengetua';
            return `${i + 1}. **${s.name}** (${s.code || s.type}) — ${rLabel}: **${cleanPgb}**`;
          })
          .join('\n');
        return `Terdapat **${stateSchools.length} buah sekolah ahli MPGBSIM** di negeri berkaitan:\n\n${list}${
          stateSchools.length > 20
            ? `\n\n*...dan ${stateSchools.length - 20} buah sekolah lagi di dalam Direktori Sekolah Ahli.*`
            : ''
        }`;
      }
    }

    // =========================================================================
    // F. PORTAL PGB LOGIN, RESET PASSWORD (MPGBSIM2026), E-KAD & PROFILE
    // =========================================================================
    if (
      q.includes('lupa') ||
      q.includes('password') ||
      q.includes('kata laluan') ||
      q.includes('reset') ||
      q.includes('mpgbsim2026') ||
      q.includes('log masuk') ||
      q.includes('login') ||
      q.includes('portal') ||
      q.includes('e kad') ||
      q.includes('ekad') ||
      q.includes('cetak profil')
    ) {
      return `**Panduan Portal Rasmi Ahli PGB & Tetapan Semula Kata Laluan:**\n\n1. **Cara Log Masuk**:\n   Klik butang **"Portal Ahli PGB"** di bahagian atas laman web rasmi MPGBSIM, kemudian masukkan **Kod Sekolah / E-mel Rasmi** serta **Kata Laluan**.\n\n2. **Lupa Kata Laluan Portal PGB**:\n   Sekiranya Pengetua atau Guru Besar terlupa kata laluan akaun sekolah, sila maklumkan kepada **Urus Setia / Pentadbir CMS MPGBSIM**. Pentadbir CMS boleh menekan butang **Reset Password** untuk menetapkan semula kata laluan akaun anda kepada kata laluan sementara rasmi iaitu:\n   • Kata Laluan Sementara: **MPGBSIM2026**\n   *(Selepas log masuk menggunakan kata laluan sementara tersebut, Tuan/Puan boleh menukarnya kepada kata laluan baharu di tab **Profil & Institusi**)*.\n\n3. **Kemudahan Eksklusif Di Dalam Portal PGB**:\n   • **Kad Keahlian Digital (e-Kad PGB)** lengkap dengan Kod QR Verifikasi & Sijil Keahlian.\n   • **Cetakan Rekod Profil Rasmi 1 Muka Surat A4 (PDF)** termasuk status pendaftaran agensi (**KPM**, **Jabatan Agama**, **MIEB**).\n   • **Ruang Sembang Live PGB**, **Hub AI & Digital PGB**, **Takwim Peperiksaan**, serta **Direktori Alumni PGB**.`;
    }

    // =========================================================================
    // G. YURAN & HEREPAY PAYMENT QUERIES
    // =========================================================================
    if (
      q.includes('yuran') ||
      q.includes('herepay') ||
      q.includes('bayar') ||
      q.includes('pembayaran') ||
      q.includes('resit') ||
      q.includes('sumbangan')
    ) {
      return `**Panduan Pembayaran Yuran Keahlian & Sumbangan MPGBSIM:**\n\n• Semua urusan pembayaran yuran pendaftaran keahlian baharu, yuran tahunan sekolah/PGB, dan yuran penyertaan konvensyen dilaksanakan secara dalam talian melalui gerbang rasmi **HerePay MPGBSIM**:\n  - Pautan Rasmi: **https://app.herepay.org/mpgbsim**\n• Menyokong pembayaran terus melalui **FPX Perbankan Internet**, **DuitNow QR**, dan **Kad Debit/Kredit**.\n• **Resit Rasmi Digital** dijana secara automatik sebaik transaksi berjaya untuk simpanan rekod dan audit kewangan sekolah.`;
    }

    // =========================================================================
    // H. MEMBERSHIP CATEGORIES (FASAL 4(2) & FASAL 4(3))
    // =========================================================================
    if (
      q.includes('ahli biasa') ||
      q.includes('bersekutu') ||
      q.includes('fasal 4') ||
      q.includes('kategori keahlian') ||
      q.includes('syarat ahli') ||
      q.includes('daftar ahli') ||
      q.includes('permohonan keahlian') ||
      q.includes('beza ahli')
    ) {
      return `**Kategori & Syarat Keahlian MPGBSIM (Fasal 4 Perlembagaan):**\n\n1. **Ahli Biasa — Fasal 4(2)**:\n   Terdiri daripada Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia di bawah rangkaian **IKRAM Musleh** (Sekolah Rendah Islam - SRI & Sekolah Menengah Islam - SMI).\n\n2. **Ahli Bersekutu — Fasal 4(3)**:\n   Terbuka kepada Pengetua dan Guru Besar daripada **Sekolah Rangkaian / Rakan Musleh, Sekolah Agama Bantuan Kerajaan (SABK), SMKA, SMAN, SRAI, SAR/KAFA, serta Maahad Tahfiz** yang berdaftar di seluruh Malaysia.\n\n3. **Status Pendaftaran Agensi Institusi**:\n   Di dalam profil institusi Portal PGB, sekolah bebas menandakan pendaftaran rasmi sama ada di bawah **KPM**, **Jabatan Agama Negeri**, dan/atau **MIEB** (boleh memilih satu, dua, atau ketiga-tiga agensi serentak).`;
    }

    // =========================================================================
    // I. EDUCATION, SCHOOL MANAGEMENT, PEDAGOGY, DRAFTING LETTERS/SPEECHES
    // =========================================================================
    if (
      q.includes('surat rasmi') ||
      q.includes('contoh surat') ||
      q.includes('buat surat') ||
      q.includes('jemputan')
    ) {
      return `**Format & Contoh Draf Surat Rasmi Sekolah:**\n\n**[KEPALA SURAT RASMI SEKOLAH]**\nRuj. Kami: Bil. ( ) dlm. Pentadbiran/2026\nTarikh: ${new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nKepada:\n**Pihak Berkenaan / Ibu Bapa / Penjaga**\n\nTuan/Puan,\n\n**PERKARA: JEMPUTAN / MAKLUMAN RASMI PROGRAM SEKOLAH**\n\nDengan segala hormatnya perkara di atas adalah dirujuk.\n\n2. Sukacita dimaklumkan bahawa pihak sekolah akan menganjurkan program tersebut mengikut ketetapan berikut:\n   • **Tarikh**: [Masukkan Tarikh]\n   • **Masa**: [Masukkan Masa]\n   • **Tempat**: [Masukkan Lokasi]\n\n3. Kehadiran dan kerjasama daripada pihak Tuan/Puan amatlah dihargai demi kecemerlangan anak-anak didik dan warga sekolah.\n\nSekian, terima kasih.\n\n**"MEMPERKASA KEPIMPINAN PENDIDIKAN, MEMBINA GENERASI RABBANI"**\n\nSaya yang menjalankan amanah,\n\n..................................................\n**(NAMA PENGETUA / GURU BESAR)**\nPengetua / Guru Besar`;
    }

    if (
      q.includes('teks ucapan') ||
      q.includes('ucapan perasmian') ||
      q.includes('ucapan guru besar') ||
      q.includes('ucapan pengetua') ||
      q.includes('tazkirah')
    ) {
      return `**Kerangka Teks Ucapan / Tazkirah Kepimpinan Pengetua & Guru Besar:**\n\n**1. Mukadimah & Alu-aluan:**\n• *Bismillahirrahmanirrahim. Assalamualaikum warahmatullahi wabarakatuh.*\n• Alhamdulillah, syukur ke hadrat Allah SWT kerana dengan izin dan limpah kurnia-Nya kita dapat berhimpun dalam majlis ilmu yang penuh barakah ini.\n\n**2. Intipati Utama Kepimpinan Pendidikan Rabbani:**\n• Pendidikan Islam bukan sekadar pencapaian akademik di atas kertas, tetapi proses **ta'dib** (pembinaan adab, akhlak, dan sahsiah) yang menyepadukan ilmu *naqli* (wahyu) dan ilmu *aqli* (kontemporari).\n• Guru dan pemimpin sekolah adalah *qudwah hasanah* (suri teladan terbaik) kepada murid.\n\n**3. Seruan & Harapan:**\n• Marilah kita memperkukuhkan kerjasama berpasukan (*amal jama'i*), memanfaatkan inovasi digital & AI secara beretika, serta memastikan tiada seorang pun murid yang tercicir.\n\n**4. Penutup:**\n• *Wabillahi taufiq wal hidayah, wassalamualaikum warahmatullahi wabarakatuh.*`;
    }

    if (
      q.includes('kertas kerja') ||
      q.includes('pelan strategik') ||
      q.includes('skpm') ||
      q.includes('pak21') ||
      q.includes('kbat') ||
      q.includes('pbd') ||
      q.includes('kepimpinan instruksional') ||
      q.includes('pengurusan sekolah')
    ) {
      return `**Panduan Pengurusan Sekolah & Kepimpinan Instruksional Berkualiti:**\n\n1. **Kepimpinan Instruksional & Rabbani (PGB)**:\n   • Menetapkan hala tuju sekolah yang jelas berasaskan data pencapaian murid dan pembinaan adab (*Biah Solehah*).\n   • Melaksanakan *Learning Walks*, pencerapan PdP konstruktif, dan bimbingan (*coaching & mentoring*) kepada barisan guru.\n\n2. **Pemerkasaan Kurikulum (PAK21, KBAT & PBD)**:\n   • Mengamalkan Pembelajaran Abad Ke-21 (**PAK21**) berpusatkan murid (*4K1N: Komunikasi, Kolaboratif, Pemikiran Kritis, Kreativiti, serta Nilai & Etika*).\n   • Memastikan Pentaksiran Bilik Darjah (**PBD**) dilaksanakan secara berterusan dan autentik.\n\n3. **Struktur Standard Kertas Kerja Program Sekolah**:\n   • **1.0 Tujuan** | **2.0 Latar Belakang & Rasional** | **3.0 Objektif (SMART)** | **4.0 Kumpulan Sasaran** | **5.0 Tarikh, Masa & Tempat** | **6.0 Jawatankuasa Pelaksana** | **7.0 Anggaran Belanjawan** | **8.0 Penutup & Kelulusan PGB**.`;
    }

    // =========================================================================
    // J. ISLAMIC KNOWLEDGE & TARBIAH QUERIES
    // =========================================================================
    if (
      q.includes('rukun islam') ||
      q.includes('rukun iman') ||
      q.includes('hadis') ||
      q.includes('doa') ||
      q.includes('al quran') ||
      q.includes('quran') ||
      q.includes('rabbani') ||
      q.includes('tarbiah')
    ) {
      if (q.includes('rukun islam')) {
        return `**5 Rukun Islam:**\n\n1. **Mengucap dua kalimah syahadah** (*Tiada Tuhan yang disembah melainkan Allah dan Nabi Muhammad SAW itu pesuruh Allah*).\n2. **Mendirikan solat fardu lima waktu** sehari semalam.\n3. **Menunaikan zakat** bagi yang memenuhi syarat nisab dan haul.\n4. **Berpuasa pada bulan Ramadan**.\n5. **Menunaikan fardu haji di Makkah** bagi mereka yang berkemampuan.`;
      }
      if (q.includes('rukun iman')) {
        return `**6 Rukun Iman:**\n\n1. **Beriman kepada Allah SWT**.\n2. **Beriman kepada para Malaikat**.\n3. **Beriman kepada Kitab-kitab suci Allah**.\n4. **Beriman kepada para Rasul**.\n5. **Beriman kepada Hari Akhirat**.\n6. **Beriman kepada Qada' dan Qadar** (ketentuan baik dan buruk daripada Allah SWT).`;
      }
      if (q.includes('doa')) {
        return `**Doa Pembuka Majlis Ilmu & Mesyuarat Sekolah:**\n\n• **بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ**\n• *“Allahumma iftah 'alaina hikmataka wansyur 'alaina min khaza'ini rahmatika ya Arhamar Rahimin.”*\n  *(Ya Allah, bukakanlah ke atas kami hikmah-Mu dan limpahkanlah ke atas kami khazanah rahmat-Mu, wahai Tuhan Yang Maha Pemurah lagi Maha Penyayang)*.\n• *“Rabbi yassir wala tu'assir, Rabbi tammim bil khair.”*\n  *(Ya Tuhanku, permudahkanlah urusan kami dan janganlah Engkau sukarkan, dan sempurnakanlah ia dengan kebaikan)*.`;
      }
      return `**Mutiara Hikmah Kepimpinan & Pendidikan Islam (Rabbani):**\n\n• **Hadis Kepimpinan sebagai Amanah**:\n  Rasulullah SAW bersabda: *"Setiap kamu adalah pemimpin (ra'in), dan setiap kamu akan dipertanggungjawabkan atas kepimpinannya."* (HR. Bukhari & Muslim).\n• **Konsep Generasi Rabbani (Surah Ali 'Imran: 79)**:\n  Generasi yang berilmu tinggi, mengamalkan ilmunya dengan ikhlas, mengajar masyarakat, serta menghubungkan hati dan amal dengan Allah SWT.`;
    }

    // =========================================================================
    // K. AI IN ISLAMIC EDUCATION & SCHOOL LEADERSHIP
    // =========================================================================
    if (
      q.includes('apa itu ai') ||
      q.includes('kecerdasan buatan') ||
      q.includes('artificial intelligence') ||
      (q.includes('ai') && (q.includes('sekolah') || q.includes('pendidikan') || q.includes('pgb')))
    ) {
      return `**Aplikasi Kecerdasan Buatan (AI) Dalam Pengurusan Sekolah Islam:**\n\n• **Peranan AI Untuk Pemimpin Sekolah (PGB)**:\n  1. Membantu Pengetua & Guru Besar menyediakan draf kertas kerja, pelan strategik, minit mesyuarat, dan teks ucapan majlis.\n  2. Membantu guru merancang RPH bersepadu, bahan bantu mengajar PAK21, dan soalan pentaksiran aras KBAT.\n  3. Mengoptimumkan pengurusan rekod sekolah, pencerapan guru, dan pemantauan hafazan murid.\n\n*Nota: Mursyid AI dikhususkan untuk urusan MPGBSIM dan pengurusan sekolah Islam sahaja.*`;
    }

    // =========================================================================
    // L. AGENCY REGISTRATION & SCHOOL STATISTICS
    // =========================================================================
    if (
      q.includes('statistik') ||
      q.includes('jumlah sekolah') ||
      q.includes('berapa sekolah') ||
      q.includes('senarai sekolah') ||
      q.includes('agensi') ||
      (q.includes('sekolah') && (q.includes('kpm') || q.includes('mieb') || q.includes('jabatan agama')))
    ) {
      const stateCounts: Record<string, number> = {};
      let kpm = 0;
      let ja = 0;
      let mieb = 0;
      let allThree = 0;
      schools.forEach((s) => {
        stateCounts[s.state] = (stateCounts[s.state] || 0) + 1;
        const ag = s.registeredAgencies || [];
        const hasKpm = ag.includes('KPM');
        const hasJa = ag.includes('Jabatan Agama');
        const hasMieb = ag.includes('MIEB');
        if (hasKpm) kpm++;
        if (hasJa) ja++;
        if (hasMieb) mieb++;
        if (hasKpm && hasJa && hasMieb) allThree++;
      });
      const topStates = Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([st, c]) => `• **${st}**: ${c} buah sekolah`)
        .join('\n');

      return `**Statistik & Analisis Pendaftaran Sekolah Ahli MPGBSIM:**\n\nJumlah keseluruhan institusi berdaftar dalam sistem ialah **${schools.length} buah sekolah Islam** di seluruh Malaysia.\n\n**Data Analisis Pendaftaran Agensi:**\n• Berdaftar di bawah **KPM**: **${kpm}** buah sekolah\n• Berdaftar di bawah **Jabatan Agama Negeri**: **${ja}** buah sekolah\n• Berdaftar di bawah **MIEB**: **${mieb}** buah sekolah\n• Berdaftar dengan **Ketiga-tiga Agensi Serentak**: **${allThree}** buah sekolah\n\n**Taburan Sekolah Mengikut Negeri:**\n${topStates}\n\n*(Tuan/Puan boleh menaip nama sekolah secara spesifik seperti "Siapa guru besar Sekolah Rendah Islam I Musleh?" atau nama negeri seperti "Senarai sekolah di Selangor")*.`;
    }

    // =========================================================================
    // M. BEST PRACTICES, PROGRAMS, NEWS, ALUMNI & CONTACT
    // =========================================================================
    if (q.includes('amalan terbaik') || q.includes('best practice') || q.includes('inovasi')) {
      const bpList = practices
        .slice(0, 5)
        .map(
          (bp) =>
            `• **${bp.title}** — *${bp.schoolName || bp.school || 'Sekolah Ahli'}* (${bp.category})`
        )
        .join('\n');
      return `**Perkongsian Amalan Terbaik (Best Practices) Sekolah Ahli MPGBSIM:**\n\n${
        bpList || '• Pelbagai modul pengurusan, kurikulum bersepadu, dan inovasi tahfiz dikongsikan oleh sekolah ahli.'
      }\n\nAhli PGB boleh memuat naik dan berkongsi kertas amalan terbaik sekolah masing-masing melalui **Portal Rasmi Ahli PGB**.`;
    }

    if (
      q.includes('program') ||
      q.includes('takwim') ||
      q.includes('konvensyen') ||
      q.includes('berita') ||
      q.includes('aktiviti') ||
      q.includes('terkini')
    ) {
      const progList = programs
        .slice(0, 5)
        .map((p) => `• **${p.title}** (${p.date} — ${p.venue})`)
        .join('\n');
      const newsList = news
        .slice(0, 4)
        .map((n) => `• **${n.title}** *(${n.date || 'Terkini'})*`)
        .join('\n');
      return `**Program Kebangsaan & Berita Semasa MPGBSIM:**\n\n**Takwim Program & Konvensyen:**\n${
        progList || '• Tiada program disenaraikan buat masa ini.'
      }\n\n**Berita & Sorotan Terkini:**\n${
        newsList || '• Tiada berita terkini.'
      }`;
    }

    if (q.includes('alumni') || q.includes('pesara')) {
      const alumniList = alumni
        .slice(0, 5)
        .map((a) => `• **${a.title ? `${a.title} ` : ''}${a.fullName}** — Bekas ${a.lastPosition} *(${a.lastSchool}, ${a.state})*`)
        .join('\n');
      return `**Direktori & Jaringan Alumni PGB MPGBSIM:**\n\nMPGBSIM menghargai jasa dan kepakaran para mantan Pengetua serta Guru Besar yang telah bersara melalui Direktori Alumni PGB.\n\n${
        alumniList ? `**Tokoh Alumni Berdaftar:**\n${alumniList}\n\n` : ''
      }Mantan PGB boleh mendaftar sebagai ahli Alumni di seksyen **Direktori Alumni PGB** pada laman utama.`;
    }

    if (
      q.includes('hubungi') ||
      q.includes('alamat') ||
      q.includes('telefon') ||
      q.includes('emel') ||
      q.includes('email') ||
      q.includes('sekretariat') ||
      q.includes('pejabat') ||
      q.includes('lokasi')
    ) {
      return `**Maklumat Perhubungan Sekretariat Kebangsaan MPGBSIM:**\n\n• **Alamat Pejabat**: ${
        siteData.contactInfo?.address ||
        'D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor Darul Ehsan.'
      }\n• **No. Telefon Urus Setia**: ${
        siteData.contactInfo?.phone || '03-4251 6157 / 03-4251 6167'
      }\n• **E-mel Rasmi**: ${
        siteData.contactInfo?.email || 'mpgbsim.cemerlang@gmail.com'
      }\n• **Waktu Operasi**: ${
        siteData.contactInfo?.operatingHours || 'Isnin – Jumaat (8:30 Pagi – 5:30 Petang)'
      }`;
    }

    // =========================================================================
    // N. CHECK FAQ LIST MATCH
    // =========================================================================
    const matchedFaq = MPGBSIM_FAQ_LIST.find(
      (f) =>
        normalizeText(f.question).includes(q) ||
        f.keywords.some((kw) => q.includes(normalizeText(kw)))
    );
    if (matchedFaq) {
      return `**${matchedFaq.question}**\n\n${matchedFaq.answer}`;
    }

    // =========================================================================
    // O. GREETINGS & IDENTITY
    // =========================================================================
    if (
      q.includes('siapa anda') ||
      q.includes('siapa awak') ||
      q.includes('mursyid') ||
      q.includes('nama anda') ||
      q === 'assalamualaikum' ||
      q === 'salam' ||
      q === 'hai' ||
      q === 'hello' ||
      q === 'hi' ||
      q === 'terima kasih' ||
      q === 'syukran'
    ) {
      if (q.includes('terima kasih') || q.includes('syukran')) {
        return `**Sama-sama & Afwan, Tuan/Puan.** Semoga maklumat yang dikongsikan memberi manfaat. Sekiranya ada sebarang pertanyaan mengenai keahlian, takwim, atau program majlis MPGBSIM, silakan bertanya pada bila-bila masa.`;
      }
      return `**Waalaikumussalam warahmatullahi wabarakatuh & Salam Kepimpinan Pendidikan Rabbani.**\n\nSaya ialah **Mursyid AI**, Pegawai Maya Rasmi bagi **Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)**.\n\nSaya dikhususkan untuk menjawab hal ehwal berkaitan:\n1. **Maklumat Spesifik Sekolah & PGB** *(cth: "Siapa Guru Besar Sekolah Rendah Islam I Musleh?" -> **Abdul Qayyum bin Yaakop**)*\n2. **Direktori ${schools.length} Buah Sekolah Ahli**, Kepimpinan Pusat, Portal PGB & Yuran HerePay\n3. **Pengurusan Sekolah Islam, Kurikulum & Kepimpinan Rabbani**\n4. **Program, Konvensyen & Takwim Rasmi Majlis**\n\nAda sebarang pertanyaan mengenai keahlian, takwim, atau program majlis yang boleh saya bantu?`;
    }

    // =========================================================================
    // P. IF ASKING ABOUT MPGBSIM GENERALLY
    // =========================================================================
    if (q.includes('mpgbsim') || q.includes('majlis pengetua') || q.includes('visi') || q.includes('misi') || q.includes('sejarah')) {
      return `**Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)** ialah pertubuhan rasmi peringkat kebangsaan (No. Pendaftaran ROS: **PPM-002-10-23041996**, ditubuhkan pada **23 April 1996**) yang menaungi barisan Pengetua dan Guru Besar Sekolah-Sekolah Islam di seluruh Malaysia.\n\n**Visi MPGBSIM:**\n"${
        siteData.visionMission?.vision ||
        'Peneraju Kecemerlangan Kepimpinan Pendidikan Islam Bertaraf Antarabangsa'
      }"\n\n**Ringkasan Rangkaian Semasa:**\n• **Pengerusi Kebangsaan**: **Mohamad Faiz Azizan**\n• **Sekolah Ahli Berdaftar**: **${
        schools.length
      } buah institusi** (SRI, SMI, SABK, SMKA, SMAN, SRAI & Maahad Tahfiz)\n• **Agensi Pendaftaran**: KPM, Jabatan Agama Islam Negeri & MIEB\n• **Pejabat Sekretariat**: Seri Kembangan, Selangor (Tel: 03-4251 6157)`;
    }

    // =========================================================================
    // Q. STRICT DECLINE FOR OUT-OF-SCOPE / UNRELATED TOPICS
    // =========================================================================
    const isRelatedToMpgbOrSchool =
      /\b(mpgbsim|sekolah|pgb|guru|pengetua|mudir|pendidikan|murid|pelajar|kurikulum|kpm|mieb|jabatan agama|jain|main|yuran|keahlian|portal|takwim|program|majlis|tarbiah|surat|kertas kerja|ucapan|doa|kepimpinan|islam|peperiksaan|spm|upkk|sppim)\b/i.test(q);

    if (!isRelatedToMpgbOrSchool) {
      return OUT_OF_SCOPE_RESPONSE;
    }

    return `**Panduan Urusan MPGBSIM & Pengurusan Sekolah Islam:**\n\nBerikut ialah maklumat berkaitan pertanyaan Tuan/Puan:\n\n• **Fokus Rujukan**: Bagi urusan rasmi MPGBSIM dan pengurusan sekolah Islam, Tuan/Puan boleh mendapatkan maklumat lanjut melalui modul-modul berikut:\n  - **Maklumat Spesifik Sekolah**: Taip nama sekolah seperti *"Siapa guru besar Sekolah Rendah Islam I Musleh?"* (Jawapan: **Abdul Qayyum bin Yaakop**).\n  - **Keahlian & Portal PGB**: Semak syarat keahlian Fasal 4 atau log masuk portal ahli.\n  - **Takwim & Program Majlis**: Rujuk program dan konvensyen kebangsaan yang tersenarai.\n\nAda sebarang pertanyaan mengenai keahlian, takwim, atau program majlis yang boleh saya bantu?`;
  };

  const detectSuggestedActions = (
    text: string
  ): ChatMessage['suggestedActions'] => {
    const lower = text.toLowerCase();
    const actions: NonNullable<ChatMessage['suggestedActions']> = [];
    if (lower.includes('portal') || lower.includes('log masuk') || lower.includes('mpgbsim2026')) {
      actions.push({ label: 'Buka Portal Ahli PGB', action: 'portal' });
    }
    if (lower.includes('sekolah') || lower.includes('direktori') || lower.includes('guru besar') || lower.includes('pengetua')) {
      actions.push({ label: 'Lihat Direktori Sekolah', action: 'sekolah-ahli' });
    }
    if (lower.includes('yuran') || lower.includes('herepay')) {
      actions.push({ label: 'Ke Seksyen Bayar Yuran', action: 'bayar-yuran' });
    }
    if (lower.includes('pimpinan') || lower.includes('pengerusi') || lower.includes('jawatankuasa')) {
      actions.push({ label: 'Lihat Barisan Kepimpinan', action: 'kepimpinan' });
    }
    if (lower.includes('hubungi') || lower.includes('sekretariat') || lower.includes('alamat')) {
      actions.push({ label: 'Hubungi Urus Setia', action: 'hubungi' });
    }
    return actions.slice(0, 3);
  };

  const handleSendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-mursyid')
        .slice(-8)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch('/api/mpgb-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          siteContext: liveSiteContext,
        }),
      });

      let replyText = '';
      if (response.ok) {
        const data = await response.json();
        replyText = data.reply || '';
      }

      if (!replyText) {
        replyText = buildLocalFallbackAnswer(trimmed);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ms-MY', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestedActions: detectSuggestedActions(`${trimmed} ${replyText}`),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackReply = buildLocalFallbackAnswer(trimmed);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString('ms-MY', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestedActions: detectSuggestedActions(`${trimmed} ${fallbackReply}`),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuestion(input);
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...initialGreeting,
        timestamp: new Date().toLocaleTimeString('ms-MY', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text.replace(/\*\*/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionNavigate = (
    target: 'portal' | 'sekolah-ahli' | 'bayar-yuran' | 'kepimpinan' | 'program' | 'hubungi'
  ) => {
    if (target === 'portal') {
      if (onOpenPortal) {
        onOpenPortal();
      } else {
        setViewMode('portal');
      }
      setIsOpen(false);
      return;
    }

    if (viewMode !== 'public') {
      setViewMode('public');
    }

    setTimeout(() => {
      if (onNavigateSection) {
        onNavigateSection(target);
      } else {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    setIsOpen(false);
  };

  // Format markdown bold & bullet lines cleanly without external library
  const renderFormattedMessage = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        return <div key={lineIdx} className="h-2" />;
      }

      const isBullet =
        trimmedLine.startsWith('• ') ||
        trimmedLine.startsWith('- ') ||
        trimmedLine.startsWith('* ');
      const cleanLine = isBullet ? trimmedLine.slice(2) : line;

      // Parse **bold** segments
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={pIdx}>{part}</React.Fragment>;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 pl-1 py-0.5">
            <span className="text-teal-700 font-bold mt-0.5 shrink-0">•</span>
            <span className="flex-1">{renderedParts}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="leading-relaxed">
          {renderedParts}
        </p>
      );
    });
  };

  const filteredQuestions = useMemo(() => {
    if (activeCategory === 'Semua') return QUICK_QUESTIONS;
    return QUICK_QUESTIONS.filter((q) => q.category === activeCategory);
  }, [activeCategory]);

  // Respect Admin CMS ON/OFF toggle for AI Chatbot
  const isChatbotEnabled = siteData.dashboardConfig?.enableAiChatbot !== false;
  if (!isChatbotEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating Launcher Button (Positioned above Admin / Live Chat button on bottom-right) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Tanya Mursyid AI - Chatbot Rasmi MPGBSIM"
            className="group flex items-center gap-3 pl-2.5 pr-4 py-2 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 hover:from-teal-800 hover:to-slate-800 text-white shadow-2xl border border-amber-400/60 hover:border-amber-300 transition-all duration-200 hover:scale-[1.03] cursor-pointer"
          >
            {/* Character Avatar Image */}
            <div className="relative w-12 h-12 rounded-xl bg-amber-400/20 border-2 border-amber-400/80 flex items-center justify-center shadow-md shrink-0 overflow-visible">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_nyb83tnyb83tnyb8_b2aa451c.jpeg"
                alt="Karakter Mursyid AI - Chatbot Pintar MPGBSIM"
                className="w-full h-full rounded-[10px] object-cover object-top"
              />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
              </span>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white">
                  Tanya Mursyid AI
                </span>
                <span className="text-[10px] font-bold text-amber-300">
                  · MPGBSIM
                </span>
              </div>
              <p className="text-[11px] text-teal-200 leading-tight">
                Pembantu Pintar Serba Boleh
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Chatbot Modal / Slide-over Window */}
      {isOpen && (
        <aside
          aria-label="Tetingkap Sembang Mursyid AI MPGBSIM"
          className={`fixed z-50 transition-all duration-200 flex flex-col bg-white border border-slate-200 shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-6 rounded-3xl'
              : 'bottom-4 right-4 left-4 sm:left-auto sm:w-[430px] h-[640px] max-h-[88vh] rounded-3xl'
          }`}
        >
          {/* Header: Character Persona "Mursyid AI" */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-teal-900 text-white px-5 py-4 flex items-center justify-between gap-3 border-b border-teal-800/60 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-2xl bg-amber-400/20 border-2 border-amber-400/80 flex items-center justify-center shadow-md shrink-0">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_nyb83tnyb83tnyb8_b2aa451c.jpeg"
                  alt="Mursyid AI - Chatbot Pintar MPGBSIM"
                  className="w-full h-full rounded-[14px] object-cover object-top"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"
                  title="Mursyid AI Aktif"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-white tracking-tight truncate">
                    Mursyid AI
                  </h2>
                  <span className="text-[11px] font-semibold text-amber-300 shrink-0">
                    · Pembantu Pintar MPGBSIM
                  </span>
                </div>
                <p className="text-xs text-teal-200/90 truncate">
                  Jawab Semua Soalan: Sekolah Ahli, PGB, Pendidikan & Umum
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Mulakan Semula Perbualan"
                aria-label="Mulakan Semula Perbualan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="hidden sm:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title={isExpanded ? 'Kecilkan Tetingkap' : 'Besarkan Tetingkap'}
                aria-label={isExpanded ? 'Kecilkan Tetingkap' : 'Besarkan Tetingkap'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-rose-600/80 transition cursor-pointer"
                title="Tutup Mursyid AI"
                aria-label="Tutup Mursyid AI"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Topic Filter Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <MessageCircleQuestion className="w-3.5 h-3.5 text-teal-700" />
                <span>Soalan Pantas Mursyid AI:</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg">
                {(['Semua', 'Umum', 'Sekolah & Pimpinan', 'Portal & Yuran'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-teal-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {filteredQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendQuestion(q.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-600/40 text-xs font-semibold whitespace-nowrap transition shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.role === 'model';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[88%]">
                    {isBot && (
                      <div className="w-9 h-9 rounded-xl border border-teal-800/30 bg-teal-900 overflow-hidden shrink-0 mt-0.5 shadow-xs">
                        <img
                          src="/assets/aistudio/Gemini_Generated_Image_nyb83tnyb83tnyb8_b2aa451c.jpeg"
                          alt="Mursyid AI"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-xs ${
                        isBot
                          ? 'bg-white border border-slate-200 text-slate-700'
                          : 'bg-teal-900 text-white font-medium'
                      }`}
                    >
                      {isBot && (
                        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100 text-[11px] text-slate-400">
                          <span className="font-bold text-teal-800">
                            Mursyid AI · Pembantu Pintar MPGBSIM
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-teal-700 transition cursor-pointer"
                            title="Salin Jawapan"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-[10px] text-emerald-600 font-semibold">
                                  Disalin
                                </span>
                              </>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {isBot ? renderFormattedMessage(msg.text) : <p>{msg.text}</p>}
                      </div>

                      {/* Suggested Quick Navigation Buttons */}
                      {isBot &&
                        msg.suggestedActions &&
                        msg.suggestedActions.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                            {msg.suggestedActions.map((act) => (
                              <button
                                key={act.label}
                                type="button"
                                onClick={() => handleActionNavigate(act.action)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-900 text-teal-900 hover:text-white text-[11px] font-bold transition cursor-pointer"
                              >
                                {act.action === 'portal' && <BookOpen className="w-3 h-3" />}
                                {act.action === 'sekolah-ahli' && <Building2 className="w-3 h-3" />}
                                {act.action === 'bayar-yuran' && <CreditCard className="w-3 h-3" />}
                                {act.action === 'kepimpinan' && <Users className="w-3 h-3" />}
                                <span>{act.label}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        )}

                      <div
                        className={`mt-1.5 text-[10px] text-right ${
                          isBot ? 'text-slate-400' : 'text-teal-200'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl border border-teal-800/30 bg-teal-900 overflow-hidden shrink-0 shadow-xs">
                  <img
                    src="/assets/aistudio/Gemini_Generated_Image_nyb83tnyb83tnyb8_b2aa451c.jpeg"
                    alt="Mursyid AI"
                    className="w-full h-full object-cover object-top animate-pulse"
                  />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-white border border-slate-200 text-xs text-slate-600 shadow-xs flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-700 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-700 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-700 animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span className="font-medium text-slate-500">
                    Mursyid AI sedang menyemak jawapan...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Footer */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3.5 bg-white border-t border-slate-200 shrink-0"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya apa sahaja soalan (cth: Siapa Guru Besar SRI I Musleh?)..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-700 outline-none transition disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Hantar Soalan"
                className="px-4 py-2.5 rounded-xl bg-teal-900 hover:bg-teal-800 disabled:bg-slate-200 text-amber-300 disabled:text-slate-400 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <span>Hantar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
};
