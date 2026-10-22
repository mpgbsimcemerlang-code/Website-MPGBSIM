import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Search,
  Image as ImageIcon,
  Paperclip,
  Pin,
  Reply,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  School,
  MapPin,
  ExternalLink,
  Smile,
  ArrowLeft,
  Radio,
  Shield,
  Clock,
  FileText,
  FileSpreadsheet,
  FileUp,
  Link2,
  Eye,
  Download,
  ChevronUp,
  ChevronDown,
  Bell,
} from 'lucide-react';
import {
  useMemberPortal,
  normalizeSchoolCode,
  getDmChannelId,
} from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { PGBChatMessage, PGBChatPresence, MemberSchool, PortalNotification } from '../../types';
import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  isFirestoreQuotaExceeded,
  isQuotaExceededError,
  markFirestoreQuotaExceeded,
} from '../../firebase';
import { compressImageFile } from '../../utils/imageCompressor';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/storage';

const CHAT_STORAGE_KEY = 'mpgbsim_pgb_live_chat_v1';
const PRESENCE_STORAGE_KEY = 'mpgbsim_pgb_chat_presence_v1';

interface ChannelDef {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  badge: string;
}

const PUBLIC_CHANNELS: ChannelDef[] = [
  {
    id: 'umum-kebangsaan',
    name: 'Dewan Sembang Umum PGB',
    shortLabel: 'Umum Kebangsaan',
    description: 'Ruang interaksi langsung, salam ukhuwah & perbincangan semasa semua Pengetua dan Guru Besar MPGBSIM.',
    badge: 'Utama',
  },
  {
    id: 'pengurusan-pentadbiran',
    name: 'Tadbir Urus & Pentadbiran Sekolah',
    shortLabel: 'Tadbir Urus & SOP',
    description: 'Perbincangan pengurusan sekolah, kewangan, sumber manusia, pendaftaran & penyelarasan KPM/JPN/JAIN.',
    badge: 'Pentadbiran',
  },
  {
    id: 'kurikulum-peperiksaan',
    name: 'Kurikulum, SPPIM, UPKK & SPM',
    shortLabel: 'Kurikulum & Peperiksaan',
    description: 'Penyelarasan akademik, takwim peperiksaan utama, modul kecemerlangan & perkongsian bahan PdPc.',
    badge: 'Akademik',
  },
  {
    id: 'inovasi-ai-stem',
    name: 'Transformasi Digital, AI & STEM',
    shortLabel: 'Inovasi AI & STEM',
    description: 'Perkongsian amalan AI generatif dalam pentadbiran, robotik, dan pendigitalan sekolah Islam.',
    badge: 'Digital',
  },
  {
    id: 'kebajikan-ukhuwah',
    name: 'Kebajikan, Penanda Aras & Ta’awun',
    shortLabel: 'Kebajikan & Lawatan',
    description: 'Jalinan lawatan penanda aras antara sekolah, bantuan kebajikan ahli & kerjasama strategik.',
    badge: 'Ukhuwah',
  },
];

const INITIAL_WELCOME_MESSAGES: PGBChatMessage[] = [
  {
    id: 'msg-seed-1',
    channelId: 'umum-kebangsaan',
    senderId: 'seed-pengerusi',
    senderName: 'Sekretariat Utama MPGBSIM',
    senderRole: 'Urus Setia Kebangsaan',
    senderSchool: 'Majlis Pengetua Guru Besar Sekolah Islam Malaysia',
    senderSchoolCode: 'MPGBSIM-HQ',
    senderState: 'Kebangsaan',
    text: 'Assalamualaikum w.b.t. dan selamat datang ke Ruang Sembang Live PGB MPGBSIM! Ruangan ini menghubungkan semua Pengetua dan Guru Besar secara langsung mengikut masa nyata (real-time). Sila pilih saluran perbincangan atau klik mana-mana rakan PGB di sebelah kiri untuk memulakan perbualan.',
    pinned: true,
    reactions: { '👍': ['BLAD001', 'JAIM/SAS(M)130'], '🤲': ['MJAC011'] },
    createdAt: '2026-03-25T08:30:00.000Z',
  },
  {
    id: 'msg-seed-2',
    channelId: 'umum-kebangsaan',
    senderId: 'seed-blad001',
    senderName: 'Noor Asyikin Binti Ahmat',
    senderRole: 'Pengetua',
    senderSchool: 'SEKOLAH MENENGAH SRI AL-AMIN BANGI',
    senderSchoolCode: 'BLAD001',
    senderState: 'Selangor',
    text: 'Waalaikumussalam w.b.t. Alhamdulillah, inisiatif ruang sembang langsung ini sangat memudahkan kita berhubung terus sesama PGB seluruh Malaysia untuk bertukar pandangan dan menyelaraskan program.',
    reactions: { '❤️': ['MPGBSIM-HQ', 'JAIM/SAS(M)130'] },
    createdAt: '2026-03-25T08:45:00.000Z',
  },
  {
    id: 'msg-seed-3',
    channelId: 'pengurusan-pentadbiran',
    senderId: 'seed-jaim130',
    senderName: 'Pengetua SMA I-Musleh',
    senderRole: 'Pengetua',
    senderSchool: 'SEKOLAH MENENGAH AGAMA I-MUSLEH',
    senderSchoolCode: 'JAIM/SAS(M)130',
    senderState: 'Melaka',
    text: 'Assalamualaikum rakan-rakan PGB. Jika ada sekolah yang ingin berkongsi kertas kerja atau SOP pengurusan asrama & pembangunan sahsiah pelajar menengah, boleh kongsikan pautan dokumen di saluran ini ya.',
    reactions: { '👍': ['BLAD001'] },
    createdAt: '2026-03-25T09:15:00.000Z',
  },
  {
    id: 'msg-seed-4',
    channelId: 'kurikulum-peperiksaan',
    senderId: 'seed-mjac011',
    senderName: 'Abdul Qayyum Bin Yaakop',
    senderRole: 'Guru Besar',
    senderSchool: 'SEKOLAH RENDAH ISLAM I-MUSLEH MELAKA',
    senderSchoolCode: 'MJAC011',
    senderState: 'Melaka',
    text: 'Assalamualaikum semua Guru Besar & Pengetua. Semoga persiapan anak-anak kita menjelang peperiksaan UPKK, SPPIM dan SPM tahun ini berjalan lancar. Boleh kongsikan jadual bengkel teknik menjawab di sini.',
    reactions: { '🤲': ['BLAD001', 'MPGBSIM-HQ'] },
    createdAt: '2026-03-25T10:00:00.000Z',
  },
];

const QUICK_EMOJIS = ['👍', '❤️', '🤲', '👏', '💡'];

export const PortalLiveChat: React.FC = () => {
  const {
    currentUser,
    currentRole,
    registeredSchools,
    unreadChatByChannel,
    unreadPersonalChatCount,
    unreadPersonalSenders,
    targetChatChannelId,
    targetChatPeerSchoolCode,
    clearTargetChatNavigation,
    markChatChannelAsRead,
    sendPortalChatNotification,
    recordAuditLog,
  } = useMemberPortal();
  const { siteData } = useAdminContent();

  const memberSchools: MemberSchool[] = useMemo(() => {
    if (Array.isArray(registeredSchools) && registeredSchools.length > 0) {
      return registeredSchools;
    }
    return Array.isArray(siteData?.memberSchools) ? siteData.memberSchools : [];
  }, [registeredSchools, siteData?.memberSchools]);

  const myIdentity = useMemo(() => {
    const uid = currentUser?.uid || 'pgb-guest';
    const fullName = currentUser?.fullName || 'Ahli PGB MPGBSIM';
    const position = currentUser?.position || 'Pengetua / Guru Besar';
    const school = currentUser?.school || 'Sekolah Ahli MPGBSIM';
    const matchedSchool = memberSchools.find(
      (s) =>
        (currentUser?.schoolId && s.id === currentUser.schoolId) ||
        (currentUser?.school && s.name && s.name.toLowerCase().trim() === currentUser.school.toLowerCase().trim())
    );
    const schoolCode =
      currentUser?.schoolCode ||
      currentUser?.membershipNo?.replace(/^MPGB-\d{4}-/i, '') ||
      matchedSchool?.code ||
      uid;
    const state = currentUser?.state || 'Malaysia';
    const avatarUrl = currentUser?.photoURL || currentUser?.logoUrl || '';
    return { uid, fullName, position, school, schoolCode, state, avatarUrl };
  }, [currentUser, memberSchools]);

  // Messages state (initialized from localStorage or welcome seed)
  const [messages, setMessages] = useState<PGBChatMessage[]>(() => {
    try {
      const saved = safeLocalStorageGet(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_WELCOME_MESSAGES;
  });

  // Presence state
  const [presenceMap, setPresenceMap] = useState<Record<string, PGBChatPresence>>(() => {
    try {
      const saved = safeLocalStorageGet(PRESENCE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Navigation & Channel selection
  const [activeChannelId, setActiveChannelId] = useState<string>('umum-kebangsaan');
  const [selectedDmSchool, setSelectedDmSchool] = useState<MemberSchool | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'saluran' | 'ahli'>('saluran');
  const [memberSearch, setMemberSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Online' | 'Offline'>('Semua');
  const [messageSearch, setMessageSearch] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Composer state
  const [inputText, setInputText] = useState('');
  const [replyTarget, setReplyTarget] = useState<PGBChatMessage | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentSize, setAttachmentSize] = useState('');
  const [attachmentType, setAttachmentType] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; title: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelsScrollRef = useRef<HTMLDivElement>(null);
  const directoryScrollRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  const scrollPaneBy = (ref: React.RefObject<HTMLDivElement | null>, amount: number) => {
    if (!ref.current) return;
    ref.current.scrollBy({ top: amount, behavior: 'smooth' });
  };

  // Persist messages locally whenever updated
  useEffect(() => {
    try {
      safeLocalStorageSet(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-250)));
    } catch {}
  }, [messages]);

  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  useEffect(() => {
    const tickTimer = window.setInterval(() => {
      setNowTick(Date.now());
    }, 10000);
    return () => window.clearInterval(tickTimer);
  }, []);

  // Setup BroadcastChannel & storage listener for instant multi-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PRESENCE_STORAGE_KEY && e.newValue) {
        try {
          setPresenceMap(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return () => window.removeEventListener('storage', handleStorage);
    }
    const bc = new BroadcastChannel('mpgbsim_pgb_live_chat');
    broadcastRef.current = bc;

    bc.onmessage = (ev) => {
      const data = ev.data;
      if (!data) return;
      if (data.type === 'NEW_OR_UPDATED_MSG' && data.message) {
        const incoming = data.message as PGBChatMessage;
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === incoming.id);
          const next = exists
            ? prev.map((m) => (m.id === incoming.id ? incoming : m))
            : [...prev, incoming];
          return next.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      } else if (data.type === 'DELETE_MSG' && data.id) {
        setMessages((prev) => prev.filter((m) => m.id !== data.id));
      } else if (data.type === 'PRESENCE_OFFLINE') {
        const targetCode = (data.schoolCode || '').trim().toUpperCase();
        const targetKey = data.presenceKey || '';
        setPresenceMap((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((k) => {
            if (
              k.trim().toUpperCase() === targetCode ||
              next[k]?.id === targetKey ||
              (next[k]?.schoolCode || '').trim().toUpperCase() === targetCode
            ) {
              delete next[k];
            }
          });
          return next;
        });
      } else if (data.type === 'PRESENCE_ONLINE' && data.presence) {
        const p = data.presence as PGBChatPresence;
        if (p.schoolCode) {
          setPresenceMap((prev) => ({ ...prev, [p.schoolCode]: p }));
        }
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorage);
      bc.close();
      broadcastRef.current = null;
    };
  }, []);

  // Real-time Firestore listener for pgbChatMessages & pgbChatPresence
  useEffect(() => {
    if (isFirestoreQuotaExceeded()) return;

    const unsubMessages = onSnapshot(
      collection(db, 'pgbChatMessages'),
      (snap) => {
        if (snap.empty) {
          // Seed initial welcome messages to Firestore if empty
          INITIAL_WELCOME_MESSAGES.forEach((seedMsg) => {
            setDoc(doc(db, 'pgbChatMessages', seedMsg.id), seedMsg, { merge: true }).catch(() => {});
          });
          return;
        }
        const loaded: PGBChatMessage[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as PGBChatMessage;
          if (d && d.text !== undefined) {
            loaded.push({ ...d, id: d.id || docSnap.id });
          }
        });
        loaded.sort(
          (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
        setMessages(loaded);
      },
      (err) => {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        }
      }
    );

    const unsubPresence = onSnapshot(
      collection(db, 'pgbChatPresence'),
      (snap) => {
        const map: Record<string, PGBChatPresence> = {};
        const now = Date.now();
        snap.forEach((docSnap) => {
          const p = docSnap.data() as PGBChatPresence;
          if (!p || !p.schoolCode) return;
          if (p.statusText === 'Luar Talian') return;
          const ageMs = p.lastActiveAt ? now - new Date(p.lastActiveAt).getTime() : 0;
          if (ageMs < 90 * 1000) {
            map[p.schoolCode] = p;
          }
        });
        setPresenceMap(map);
        try {
          safeLocalStorageSet(PRESENCE_STORAGE_KEY, JSON.stringify(map));
        } catch {}
      },
      () => {}
    );

    return () => {
      unsubMessages();
      unsubPresence();
    };
  }, []);

  // Broadcast own presence heartbeat when entering Live Chat & every 25s
  useEffect(() => {
    if (!currentUser || isFirestoreQuotaExceeded()) return;
    const presenceKey = myIdentity.schoolCode.replace(/[^a-zA-Z0-9_-]/g, '_') || myIdentity.uid;

    const sendHeartbeat = () => {
      const payload: PGBChatPresence = {
        id: presenceKey,
        uid: myIdentity.uid,
        fullName: myIdentity.fullName,
        position: myIdentity.position,
        school: myIdentity.school,
        schoolCode: myIdentity.schoolCode,
        state: myIdentity.state,
        avatarUrl: myIdentity.avatarUrl || '',
        lastActiveAt: new Date().toISOString(),
        statusText: 'Dalam Talian',
      };

      setPresenceMap((prev) => ({ ...prev, [myIdentity.schoolCode]: payload }));
      setDoc(doc(db, 'pgbChatPresence', presenceKey), payload, { merge: true }).catch(() => {});
    };

    sendHeartbeat();
    const timer = window.setInterval(sendHeartbeat, 25000);
    return () => window.clearInterval(timer);
  }, [currentUser, myIdentity]);

  // Helper to check if a PGB / school code is currently Online (Green) or Offline (Red)
  const isSchoolOnline = (code?: string): boolean => {
    if (!code) return false;
    const normCode = code.trim().toUpperCase();
    const myNorm = (myIdentity.schoolCode || '').trim().toUpperCase();
    if (Boolean(currentUser) && normCode && myNorm && normCode === myNorm) return true;

    const entry =
      presenceMap[code] ||
      presenceMap[normCode] ||
      Object.values(presenceMap).find(
        (p) => (p.schoolCode || '').trim().toUpperCase() === normCode
      );
    if (!entry || entry.statusText === 'Luar Talian') return false;
    if (!entry.lastActiveAt) return false;
    const ageMs = nowTick - new Date(entry.lastActiveAt).getTime();
    // Online only if active heartbeat within the last 90 seconds
    return ageMs < 90 * 1000;
  };

  // Auto-scroll to bottom when messages change in active channel
  const currentChannelMessages = useMemo(() => {
    return messages
      .filter((m) => m.channelId === activeChannelId)
      .filter((m) => {
        if (!messageSearch.trim()) return true;
        const q = messageSearch.toLowerCase();
        return (
          m.text.toLowerCase().includes(q) ||
          m.senderName.toLowerCase().includes(q) ||
          m.senderSchool.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, activeChannelId, messageSearch]);

  const pinnedMessages = useMemo(
    () => currentChannelMessages.filter((m) => m.pinned),
    [currentChannelMessages]
  );

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentChannelMessages.length, activeChannelId]);

  // Unique states for directory filter
  const availableStates = useMemo(() => {
    const s = new Set<string>();
    memberSchools.forEach((sch) => {
      if (sch.state) s.add(sch.state);
    });
    return ['Semua', ...Array.from(s).sort()];
  }, [memberSchools]);

  // Count online vs offline PGBs
  const onlineOfflineCounts = useMemo(() => {
    let online = 0;
    let offline = 0;
    memberSchools.forEach((sch) => {
      if (isSchoolOnline(sch.code)) online += 1;
      else offline += 1;
    });
    return { online, offline };
  }, [memberSchools, presenceMap, myIdentity.schoolCode, currentUser, nowTick]);

  // Filtered PGB peers for Direct Message or Directory (Unread sorted first, then Online, then Name)
  const filteredPeers = useMemo(() => {
    return memberSchools
      .filter((sch) => {
        const matchState = stateFilter === 'Semua' || sch.state === stateFilter;
        const online = isSchoolOnline(sch.code);
        const matchStatus =
          statusFilter === 'Semua' ||
          (statusFilter === 'Online' && online) ||
          (statusFilter === 'Offline' && !online);
        const q = memberSearch.trim().toLowerCase();
        const matchQ =
          !q ||
          (sch.principal || '').toLowerCase().includes(q) ||
          (sch.name || '').toLowerCase().includes(q) ||
          (sch.code || '').toLowerCase().includes(q) ||
          (sch.state || '').toLowerCase().includes(q);
        return matchState && matchStatus && matchQ;
      })
      .sort((a, b) => {
        const dmA = getDmChannelId(myIdentity.schoolCode, a.code || a.id);
        const dmB = getDmChannelId(myIdentity.schoolCode, b.code || b.id);
        const unreadA = unreadChatByChannel[dmA] || 0;
        const unreadB = unreadChatByChannel[dmB] || 0;
        if (unreadA !== unreadB) return unreadB - unreadA;

        const aOnline = isSchoolOnline(a.code) ? 1 : 0;
        const bOnline = isSchoolOnline(b.code) ? 1 : 0;
        if (aOnline !== bOnline) return bOnline - aOnline;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [
    memberSchools,
    stateFilter,
    statusFilter,
    memberSearch,
    presenceMap,
    myIdentity.schoolCode,
    currentUser,
    nowTick,
    unreadChatByChannel,
  ]);

  // Count total unread messages across public channels
  const unreadPublicChannelsCount = useMemo(() => {
    return PUBLIC_CHANNELS.reduce((sum, ch) => sum + (unreadChatByChannel[ch.id] || 0), 0);
  }, [unreadChatByChannel]);

  const handleSelectPublicChannel = (channelId: string) => {
    setSelectedDmSchool(null);
    setActiveChannelId(channelId);
    setReplyTarget(null);
    setMobileShowChat(true);
    markChatChannelAsRead(channelId);
  };

  const handleSelectPeerDm = (school: MemberSchool) => {
    const dmId = getDmChannelId(myIdentity.schoolCode, school.code || school.id);
    setSelectedDmSchool(school);
    setActiveChannelId(dmId);
    setReplyTarget(null);
    setMobileShowChat(true);
    markChatChannelAsRead(dmId);
  };

  // Handle incoming deep-link navigation from Portal Notification Bell / Toast Banner
  useEffect(() => {
    if (!targetChatChannelId && !targetChatPeerSchoolCode) return;
    if (memberSchools.length === 0) return;

    const targetClean = normalizeSchoolCode(targetChatPeerSchoolCode || '');
    const matchedSchool = memberSchools.find((s) => {
      const sClean = normalizeSchoolCode(s.code || s.id);
      if (targetClean && sClean === targetClean) return true;
      if (targetChatChannelId) {
        const dmId = getDmChannelId(myIdentity.schoolCode, s.code || s.id);
        if (dmId === targetChatChannelId) return true;
      }
      return false;
    });

    if (matchedSchool) {
      const dmId = getDmChannelId(myIdentity.schoolCode, matchedSchool.code || matchedSchool.id);
      setSelectedDmSchool(matchedSchool);
      setActiveChannelId(dmId);
      setReplyTarget(null);
      setMobileShowChat(true);
      markChatChannelAsRead(dmId);
    } else if (targetChatChannelId) {
      setSelectedDmSchool(null);
      setActiveChannelId(targetChatChannelId);
      setMobileShowChat(true);
      markChatChannelAsRead(targetChatChannelId);
    }
    clearTargetChatNavigation();
  }, [
    targetChatChannelId,
    targetChatPeerSchoolCode,
    memberSchools,
    myIdentity.schoolCode,
    markChatChannelAsRead,
    clearTargetChatNavigation,
  ]);

  // Automatically mark the currently open channel as read when viewing it and window has focus
  useEffect(() => {
    if (!activeChannelId) return;
    const unreadInActive = unreadChatByChannel[activeChannelId] || 0;
    if (unreadInActive <= 0) return;

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const isChatPaneVisible = isDesktop || mobileShowChat;
    const isWindowFocused = typeof document !== 'undefined' ? document.hasFocus() : true;

    if (isChatPaneVisible && isWindowFocused) {
      markChatChannelAsRead(activeChannelId);
    }
  }, [activeChannelId, unreadChatByChannel, mobileShowChat, markChatChannelAsRead]);

  // Also mark active channel as read when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (activeChannelId && (unreadChatByChannel[activeChannelId] || 0) > 0) {
        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
        if (isDesktop || mobileShowChat) {
          markChatChannelAsRead(activeChannelId);
        }
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeChannelId, unreadChatByChannel, mobileShowChat, markChatChannelAsRead]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUploadChatImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail gambar yang sah (PNG, JPG, WebP).');
      return;
    }
    setIsUploadingImage(true);
    try {
      const compressed = await compressImageFile(file, 900, 1200, 0.82);
      setUploadedImage(compressed);
      setUploadedImageName(file.name);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage((e.target?.result as string) || '');
        setUploadedImageName(file.name);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadChatDoc = async (file: File) => {
    // Had saiz fail langsung: 800 KB agar kekal selamat di bawah had 1MB dokumen Firestore
    const MAX_SIZE = 800 * 1024;
    if (file.size > MAX_SIZE) {
      alert(
        `Saiz fail (${formatFileSize(file.size)}) melebihi had langsung 800 KB untuk ruang sembang.\n\nSila gunakan butang 'Pautan Cloud / Drive' untuk berkongsi fail bersaiz besar seperti Google Drive atau OneDrive agar penghantaran pantas dan lancar.`
      );
      return;
    }

    setIsUploadingDoc(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = (e.target?.result as string) || '';
        setAttachmentUrl(result);
        setAttachmentName(file.name);
        setAttachmentSize(formatFileSize(file.size));
        setAttachmentType(file.type || file.name.split('.').pop() || 'dokumen');
      };
      reader.onerror = () => {
        alert('Ralat membaca fail dari peranti. Sila cuba lagi.');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Doc upload error:', err);
      alert('Gagal memproses fail yang dipilih.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDownloadFile = (url: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'dokumen_pgb';
      link.setAttribute('download', filename || 'dokumen_pgb');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      window.open(url, '_blank');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !uploadedImage && !attachmentUrl.trim()) return;

    setIsSending(true);
    const nowIso = new Date().toISOString();
    const msgId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const msgText =
      inputText.trim() ||
      (uploadedImage
        ? 'Berkongsi gambar / poster'
        : attachmentName
        ? `Berkongsi dokumen: ${attachmentName}`
        : 'Berkongsi lampiran fail');
    const isDm = Boolean(selectedDmSchool || activeChannelId.startsWith('dm_'));
    const recipientCode = selectedDmSchool?.code || selectedDmSchool?.id || '';

    const initialReadBy = Array.from(
      new Set(
        [
          normalizeSchoolCode(myIdentity.schoolCode),
          myIdentity.schoolCode,
          myIdentity.uid,
        ].filter(Boolean)
      )
    );

    const newMsg: PGBChatMessage = {
      id: msgId,
      channelId: activeChannelId,
      senderId: myIdentity.uid,
      senderName: myIdentity.fullName,
      senderRole: myIdentity.position,
      senderSchool: myIdentity.school,
      senderSchoolCode: myIdentity.schoolCode,
      senderState: myIdentity.state,
      ...(myIdentity.avatarUrl ? { senderAvatar: myIdentity.avatarUrl } : {}),
      ...(isDm
        ? {
            isDirectMessage: true,
            recipientSchoolCode: recipientCode,
            recipientSchoolName: selectedDmSchool?.name || '',
            recipientName: selectedDmSchool?.principal || 'Pengetua / Guru Besar',
          }
        : {}),
      readBy: initialReadBy,
      text: msgText,
      ...(uploadedImage ? { imageUrl: uploadedImage } : {}),
      ...(attachmentUrl.trim() ? { attachmentUrl: attachmentUrl.trim() } : {}),
      ...(attachmentName.trim() ? { attachmentName: attachmentName.trim() } : {}),
      ...(attachmentSize ? { attachmentSize } : {}),
      ...(attachmentType ? { attachmentType } : {}),
      ...(replyTarget
        ? {
            replyToId: replyTarget.id,
            replyToSender: replyTarget.senderName,
            replyToText: replyTarget.text.slice(0, 120),
          }
        : {}),
      pinned: false,
      reactions: {},
      createdAt: nowIso,
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMsg]);
    broadcastRef.current?.postMessage({ type: 'NEW_OR_UPDATED_MSG', message: newMsg });
    markChatChannelAsRead(activeChannelId);

    // Clear composer
    setInputText('');
    setReplyTarget(null);
    setUploadedImage('');
    setUploadedImageName(null);
    setAttachmentName('');
    setAttachmentUrl('');
    setAttachmentSize('');
    setAttachmentType('');
    setShowAttachmentInput(false);

    // If this is a personal 1-to-1 chat to another PGB, dispatch a portal notification to that PGB's portal
    if (isDm && recipientCode) {
      const dmNotif: PortalNotification = {
        id: `notif-dm-${msgId}`,
        userId: recipientCode,
        recipientSchoolCode: recipientCode,
        senderSchoolCode: myIdentity.schoolCode,
        senderName: myIdentity.fullName,
        senderSchool: myIdentity.school,
        chatChannelId: activeChannelId,
        title: `Mesej Peribadi Baharu daripada ${myIdentity.fullName}`,
        message: `${myIdentity.school}: "${msgText.slice(0, 140)}"`,
        type: 'chat',
        date: nowIso,
        read: false,
        linkTab: 'sembang-live',
      };
      sendPortalChatNotification(dmNotif).catch(() => {});
    }

    // Rekod log keaktifan supaya PGB mendapat mata keaktifan sembang live
    try {
      const channelObj = PUBLIC_CHANNELS.find((c) => c.id === activeChannelId);
      const channelTitle = channelObj ? channelObj.name : (isDm ? `Mesej Peribadi (${selectedDmSchool?.name || recipientCode})` : 'Ruang Sembang');
      recordAuditLog(
        'Aktif Ruang Sembang PGB',
        `PGB ${myIdentity.fullName} (${myIdentity.school}) aktif berkongsi idea dalam ${channelTitle}: "${msgText.slice(0, 90)}${msgText.length > 90 ? '...' : ''}"`,
        {
          user: myIdentity.fullName,
          email: currentUser?.pgbEmail || currentUser?.email || 'ahli@mpgbsim.org',
          schoolName: myIdentity.school,
          schoolCode: myIdentity.schoolCode,
          state: myIdentity.state,
          position: myIdentity.position,
          category: 'PROGRAM_AMALAN',
        }
      );
    } catch (e) {}

    try {
      await setDoc(doc(db, 'pgbChatMessages', msgId), newMsg, { merge: true });
    } catch (err) {
      console.warn('Live chat Firestore sync warning:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleReaction = async (msg: PGBChatMessage, emoji: string) => {
    const reactorKey = myIdentity.schoolCode || myIdentity.uid;
    const currentReactions = { ...(msg.reactions || {}) };
    const list = currentReactions[emoji] ? [...currentReactions[emoji]] : [];
    const idx = list.indexOf(reactorKey);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(reactorKey);
    }
    if (list.length === 0) {
      delete currentReactions[emoji];
    } else {
      currentReactions[emoji] = list;
    }

    const updatedMsg: PGBChatMessage = { ...msg, reactions: currentReactions };
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? updatedMsg : m)));
    broadcastRef.current?.postMessage({ type: 'NEW_OR_UPDATED_MSG', message: updatedMsg });

    try {
      await setDoc(doc(db, 'pgbChatMessages', msg.id), { reactions: currentReactions }, { merge: true });
    } catch {}
  };

  const handleTogglePin = async (msg: PGBChatMessage) => {
    const updatedMsg: PGBChatMessage = { ...msg, pinned: !msg.pinned };
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? updatedMsg : m)));
    broadcastRef.current?.postMessage({ type: 'NEW_OR_UPDATED_MSG', message: updatedMsg });

    try {
      await setDoc(doc(db, 'pgbChatMessages', msg.id), { pinned: updatedMsg.pinned }, { merge: true });
    } catch {}
  };

  const handleDeleteMessage = async (msg: PGBChatMessage) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    broadcastRef.current?.postMessage({ type: 'DELETE_MSG', id: msg.id });
    try {
      await deleteDoc(doc(db, 'pgbChatMessages', msg.id));
    } catch {}
  };

  const activeChannelDef = PUBLIC_CHANNELS.find((c) => c.id === activeChannelId);

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Rangkaian Sembang Langsung PGB Kebangsaan (Live Real-Time)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-400 shrink-0" />
            <span>Ruang Sembang & Interaksi PGB MPGBSIM</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Menghubungkan semua {memberSchools.length} Pengetua & Guru Besar Sekolah Islam Malaysia secara langsung untuk perbincangan dasar, kurikulum, dan mesej terus antara sekolah.
          </p>
        </div>

        {/* Active Logged-in PGB Identity Card */}
        <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-2.5 shrink-0">
          <div className="relative">
            {myIdentity.avatarUrl ? (
              <img
                src={myIdentity.avatarUrl}
                alt={myIdentity.fullName}
                className="w-10 h-10 rounded-xl object-cover border border-amber-400/50 bg-slate-900"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white font-black text-sm flex items-center justify-center">
                {myIdentity.fullName.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>
          <div className="text-xs min-w-0">
            <div className="font-bold text-white truncate max-w-[200px]">{myIdentity.fullName}</div>
            <div className="text-[11px] text-amber-300 font-medium truncate max-w-[220px]">
              {myIdentity.school}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black tracking-wide shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {myIdentity.schoolCode} · ONLINE
              </span>
              <span className="text-[10px] text-slate-300">{myIdentity.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Unread Personal Message Notification Banner inside Ruang Sembang PGB (Automatically disappears once opened & read) */}
      {unreadPersonalSenders.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 via-amber-500 to-teal-800 p-0.5 rounded-2xl shadow-md animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-[14px] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 animate-bounce">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-black tracking-wide">
                    {unreadPersonalChatCount} mesej baharu
                  </span>
                  <span className="text-xs font-bold text-amber-300 truncate">
                    Mesej Peribadi daripada {unreadPersonalSenders[0].senderName} ({unreadPersonalSenders[0].senderSchool})
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  "{unreadPersonalSenders[0].latestText}"
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const sender = unreadPersonalSenders[0];
                  const senderClean = normalizeSchoolCode(sender.senderSchoolCode);
                  const peer = memberSchools.find(
                    (s) =>
                      normalizeSchoolCode(s.code || s.id) === senderClean ||
                      getDmChannelId(myIdentity.schoolCode, s.code || s.id) === sender.channelId
                  );
                  if (peer) {
                    handleSelectPeerDm(peer);
                  } else {
                    setActiveChannelId(sender.channelId);
                    setMobileShowChat(true);
                    markChatChannelAsRead(sender.channelId);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Buka & Baca ({unreadPersonalSenders[0].count} mesej baharu)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Chat Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[740px] lg:h-[780px] min-h-0">
        {/* LEFT SIDEBAR: Channels & PGB Directory */}
        <div
          className={`lg:col-span-4 xl:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/70 h-full min-h-0 overflow-hidden ${
            mobileShowChat ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Sidebar Segmented Switcher */}
          <div className="p-3.5 border-b border-slate-200 bg-white shrink-0 space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSidebarTab('saluran')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sidebarTab === 'saluran'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Saluran Topik ({PUBLIC_CHANNELS.length})</span>
                {unreadPublicChannelsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shrink-0 animate-pulse">
                    {unreadPublicChannelsCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('ahli')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sidebarTab === 'ahli'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Direktori PGB ({memberSchools.length})</span>
                {unreadPersonalChatCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shrink-0 animate-pulse">
                    {unreadPersonalChatCount} baharu
                  </span>
                )}
              </button>
            </div>

            {/* Online (Green) vs Offline (Red) Legend & Counter */}
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Kod Hijau (Online): {onlineOfflineCounts.online}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Kod Merah (Offline): {onlineOfflineCounts.offline}</span>
              </div>
            </div>
          </div>

          {sidebarTab === 'saluran' ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Scroll Controls Header for Saluran Topik */}
              <div className="px-3.5 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Senarai Saluran & PGB
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollPaneBy(channelsScrollRef, -260)}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-300 text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Scroll Atas Saluran Topik"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Atas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollPaneBy(channelsScrollRef, 260)}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-300 text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Scroll Bawah Saluran Topik"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Bawah</span>
                  </button>
                </div>
              </div>

              <div
                ref={channelsScrollRef}
                className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 scroll-smooth"
              >
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Saluran Sembang Kebangsaan ({PUBLIC_CHANNELS.length})
                </div>
                {PUBLIC_CHANNELS.map((ch) => {
                  const isSelected = !selectedDmSchool && activeChannelId === ch.id;
                  const unreadCount = isSelected ? 0 : unreadChatByChannel[ch.id] || 0;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleSelectPublicChannel(ch.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-teal-900 text-white border-teal-800 shadow-sm'
                          : unreadCount > 0
                          ? 'bg-amber-50/80 hover:bg-amber-50 text-slate-900 border-amber-400 shadow-2xs'
                          : 'bg-white hover:bg-teal-50/50 text-slate-800 border-slate-200/80'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-teal-800 text-amber-300' : 'bg-teal-50 text-teal-800'
                        }`}
                      >
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs truncate">{ch.name}</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 bg-rose-600 text-white animate-pulse">
                              {unreadCount} mesej baharu
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] line-clamp-2 mt-1 leading-snug ${
                            isSelected ? 'text-teal-100' : 'text-slate-500'
                          }`}
                        >
                          {ch.description}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Full Scrollable List of PGBs inside Saluran Topik */}
                <div className="pt-4 px-1">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Mesej Terus Rakan PGB ({memberSchools.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSidebarTab('ahli')}
                      className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Cari & Tapis PGB →
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredPeers.map((sch) => {
                      const dmId = getDmChannelId(myIdentity.schoolCode, sch.code || sch.id);
                      const isSelected = selectedDmSchool?.id === sch.id;
                      const unreadDmCount = isSelected ? 0 : unreadChatByChannel[dmId] || 0;
                      const isOnline = isSchoolOnline(sch.code);
                      const photo = sch.principalPhotoUrl || sch.logoUrl;
                      return (
                        <button
                          key={sch.id}
                          type="button"
                          onClick={() => handleSelectPeerDm(sch)}
                          className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-800'
                              : unreadDmCount > 0
                              ? 'bg-amber-50/90 hover:bg-amber-100/80 text-slate-900 border-rose-400 ring-1 ring-rose-400/50 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200/70'
                          }`}
                        >
                          <div className="relative shrink-0">
                            {photo ? (
                              <img
                                src={photo}
                                alt={sch.principal || sch.name}
                                className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                                {(sch.principal || sch.name || 'P').charAt(0)}
                              </div>
                            )}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                isOnline ? 'bg-emerald-500' : 'bg-rose-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs truncate">
                              {sch.principal || 'Pengetua / Guru Besar'}
                            </div>
                            <div
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {sch.name}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black tracking-wide border ${
                                  isOnline
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : 'bg-rose-600 text-white border-rose-700'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                {sch.code} · {isOnline ? 'ONLINE' : 'OFFLINE'}
                              </span>
                            </div>
                          </div>
                          {unreadDmCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black shrink-0 animate-pulse shadow-2xs">
                              {unreadDmCount} mesej baharu
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Full PGB Directory for Direct 1-to-1 Chat */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-3 bg-white border-b border-slate-200 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Cari nama PGB, sekolah atau kod..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    {availableStates.map((st) => (
                      <option key={st} value={st}>
                        {st === 'Semua' ? 'Semua Negeri' : st}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'Semua' | 'Online' | 'Offline')}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <option value="Semua">Semua Status ({memberSchools.length})</option>
                    <option value="Online">🟢 Online Hijau ({onlineOfflineCounts.online})</option>
                    <option value="Offline">🔴 Offline Merah ({onlineOfflineCounts.offline})</option>
                  </select>
                </div>

                {/* Scroll Controls Header for Direktori PGB */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    Dipaparkan: {filteredPeers.length} PGB
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollPaneBy(directoryScrollRef, -280)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Scroll Atas Direktori PGB"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Atas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollPaneBy(directoryScrollRef, 280)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Scroll Bawah Direktori PGB"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Bawah</span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                ref={directoryScrollRef}
                className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5 scroll-smooth"
              >
                {filteredPeers.map((sch) => {
                  const dmId = getDmChannelId(myIdentity.schoolCode, sch.code || sch.id);
                  const isSelected = selectedDmSchool?.id === sch.id;
                  const unreadDmCount = isSelected ? 0 : unreadChatByChannel[dmId] || 0;
                  const isOnline = isSchoolOnline(sch.code);
                  const photo = sch.principalPhotoUrl || sch.logoUrl;

                  return (
                    <button
                      key={sch.id}
                      type="button"
                      onClick={() => handleSelectPeerDm(sch)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-teal-900 text-white border-teal-800 shadow-xs'
                          : unreadDmCount > 0
                          ? 'bg-amber-50/90 hover:bg-amber-100/80 text-slate-900 border-rose-400 ring-1 ring-rose-400/50 shadow-xs'
                          : 'bg-white hover:bg-teal-50/50 text-slate-800 border-slate-200/80'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {photo ? (
                          <img
                            src={photo}
                            alt={sch.principal || sch.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                            {(sch.principal || sch.name || 'P').charAt(0)}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                            isOnline ? 'bg-emerald-500' : 'bg-rose-600'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate">
                          {sch.principal || 'Pengetua / Guru Besar'}
                        </div>
                        <div
                          className={`text-[11px] font-medium truncate ${
                            isSelected ? 'text-amber-300' : 'text-teal-800'
                          }`}
                        >
                          {sch.name}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide border ${
                              isOnline
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-rose-600 text-white border-rose-700'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            {sch.code} · {isOnline ? 'ONLINE' : 'OFFLINE'}
                          </span>
                          <span
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-teal-100' : 'text-slate-500'
                            }`}
                          >
                            {sch.state}
                          </span>
                        </div>
                      </div>

                      {unreadDmCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black shrink-0 animate-pulse shadow-2xs">
                          {unreadDmCount} mesej baharu
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Active Chat Conversation */}
        <div
          onClick={() => {
            if (activeChannelId && (unreadChatByChannel[activeChannelId] || 0) > 0) {
              markChatChannelAsRead(activeChannelId);
            }
          }}
          className={`lg:col-span-8 xl:col-span-8 flex flex-col h-full min-h-0 bg-white overflow-hidden ${
            !mobileShowChat ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Active Channel / DM Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileShowChat(false)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {selectedDmSchool ? (
                <>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 overflow-hidden flex items-center justify-center">
                      {selectedDmSchool.principalPhotoUrl || selectedDmSchool.logoUrl ? (
                        <img
                          src={selectedDmSchool.principalPhotoUrl || selectedDmSchool.logoUrl}
                          alt={selectedDmSchool.principal}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <School className="w-5 h-5 text-teal-800" />
                      )}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                        isSchoolOnline(selectedDmSchool.code) ? 'bg-emerald-500' : 'bg-rose-600'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-black text-sm text-slate-900 truncate">
                        {selectedDmSchool.principal || 'Pengetua / Guru Besar'}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide ${
                          isSchoolOnline(selectedDmSchool.code)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {selectedDmSchool.code} ·{' '}
                        {isSchoolOnline(selectedDmSchool.code) ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {selectedDmSchool.name} ({selectedDmSchool.state})
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-teal-900 text-amber-300 flex items-center justify-center shrink-0">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-sm sm:text-base text-slate-900 truncate">
                        {activeChannelDef?.name || 'Ruang Sembang PGB'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {activeChannelDef?.description}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Search & Scroll Buttons for Ruangan Chat */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  placeholder="Cari mesej..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollPaneBy(chatScrollRef, -320)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Scroll Atas Ruangan Chat"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Atas</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollPaneBy(chatScrollRef, 320)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Scroll Bawah Ruangan Chat"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Bawah</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pinned Message Banner (if any) */}
          {pinnedMessages.length > 0 && (
            <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Pin className="w-3.5 h-3.5 text-amber-700 shrink-0 fill-amber-600" />
                <span className="font-bold text-amber-950 shrink-0">Mesej Disematkan:</span>
                <span className="text-amber-900 truncate">
                  <strong>{pinnedMessages[pinnedMessages.length - 1].senderName}:</strong>{' '}
                  {pinnedMessages[pinnedMessages.length - 1].text}
                </span>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div
            ref={chatScrollRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 scroll-smooth"
          >
            {currentChannelMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 border border-teal-200">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">
                  Mulakan Perbualan Pertama di Ruang Ini
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  {selectedDmSchool
                    ? `Hantarkan mesej terus kepada ${selectedDmSchool.principal || 'PGB'} (${selectedDmSchool.name}). Mesej akan diterima secara langsung di portal beliau.`
                    : 'Semua mesej yang dihantar di sini akan dapat dilihat dan dibalas secara langsung oleh semua PGB MPGBSIM.'}
                </p>
              </div>
            ) : (
              currentChannelMessages.map((msg) => {
                const isMine =
                  msg.senderId === myIdentity.uid ||
                  (msg.senderSchoolCode &&
                    myIdentity.schoolCode &&
                    msg.senderSchoolCode === myIdentity.schoolCode);
                const canDelete =
                  isMine || currentRole === 'ADMIN' || currentRole === 'MEDIA_AJK';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group ${
                      isMine ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Sender Avatar */}
                    <div className="shrink-0 mt-0.5">
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs"
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shadow-2xs ${
                            isMine
                              ? 'bg-teal-800 text-white'
                              : 'bg-white border border-slate-200 text-teal-900'
                          }`}
                        >
                          {(msg.senderName || 'P').charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Message Bubble Container */}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${
                        isMine ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Sender Name & School Metadata */}
                      <div
                        className={`flex items-center gap-1.5 text-[11px] mb-1 px-1 flex-wrap ${
                          isMine ? 'justify-end text-right' : 'justify-start'
                        }`}
                      >
                        <span className="font-bold text-slate-900">{msg.senderName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-teal-800">{msg.senderSchool}</span>
                        {msg.senderSchoolCode && (
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black tracking-wide ${
                              isSchoolOnline(msg.senderSchoolCode)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            {msg.senderSchoolCode}
                          </span>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl p-3.5 shadow-2xs border relative ${
                          isMine
                            ? 'bg-teal-900 text-white border-teal-800 rounded-tr-xs'
                            : 'bg-white text-slate-800 border-slate-200 rounded-tl-xs'
                        }`}
                      >
                        {/* Quoted Reply Preview */}
                        {msg.replyToText && (
                          <div
                            className={`mb-2 p-2 rounded-xl text-[11px] border-l-4 ${
                              isMine
                                ? 'bg-teal-950/60 border-amber-400 text-teal-100'
                                : 'bg-slate-100 border-teal-700 text-slate-600'
                            }`}
                          >
                            <div className="font-bold text-[10px] opacity-90">
                              Membalas {msg.replyToSender}:
                            </div>
                            <div className="line-clamp-2">{msg.replyToText}</div>
                          </div>
                        )}

                        {/* Shared Image / Poster */}
                        {msg.imageUrl && (
                          <div className="mb-2.5 rounded-xl overflow-hidden border border-black/10 bg-slate-950 max-w-sm group relative">
                            <img
                              src={msg.imageUrl}
                              alt="Lampiran Gambar Sembang"
                              className="w-full max-h-72 object-contain cursor-pointer hover:opacity-95 transition"
                              onClick={() =>
                                setPreviewImageModal({
                                  url: msg.imageUrl!,
                                  title: msg.text || 'Gambar Sembang PGB',
                                })
                              }
                            />
                            {/* Action bar for downloading & previewing */}
                            <div className="p-2 bg-slate-900/90 backdrop-blur-xs border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                              <span className="text-[11px] text-slate-300 font-medium truncate flex items-center gap-1">
                                📷 Gambar Dikongsi
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewImageModal({
                                      url: msg.imageUrl!,
                                      title: msg.text || 'Gambar Sembang PGB',
                                    })
                                  }
                                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                                  title="Lihat Gambar Penuh"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadFile(
                                      msg.imageUrl!,
                                      `gambar_pgb_${msg.id.slice(-6)}.png`
                                    )
                                  }
                                  className="px-2 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs transition"
                                  title="Muat Turun Gambar ke Peranti"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Muat Turun</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message Text */}
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words">
                          {msg.text}
                        </p>

                        {/* Shared Document Attachment / Link */}
                        {msg.attachmentUrl && (
                          <div
                            className={`mt-2.5 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                              isMine
                                ? 'bg-teal-950/80 border-teal-700 text-white'
                                : 'bg-slate-50 border-teal-300 text-teal-950'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-teal-800 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                                {msg.attachmentName?.toLowerCase().endsWith('.xls') ||
                                msg.attachmentName?.toLowerCase().endsWith('.xlsx') ||
                                msg.attachmentName?.toLowerCase().endsWith('.csv') ? (
                                  <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                                ) : (
                                  <FileText className="w-5 h-5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div
                                  className={`text-xs font-bold truncate max-w-xs ${
                                    isMine ? 'text-white' : 'text-slate-900'
                                  }`}
                                  title={msg.attachmentName || 'Dokumen Dikongsi'}
                                >
                                  {msg.attachmentName || 'Dokumen Dikongsi'}
                                </div>
                                <div className="text-[10px] text-teal-300/90 flex items-center gap-2 mt-0.5">
                                  {msg.attachmentSize && (
                                    <span className="font-medium bg-teal-900/60 text-teal-200 px-1.5 py-0.2 rounded text-[10px]">
                                      {msg.attachmentSize}
                                    </span>
                                  )}
                                  <span className={isMine ? 'text-teal-200' : 'text-slate-500'}>
                                    {msg.attachmentUrl.startsWith('data:')
                                      ? 'Fail Peranti (Langsung)'
                                      : 'Pautan Cloud / Drive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              {msg.attachmentUrl.startsWith('data:') ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadFile(
                                      msg.attachmentUrl!,
                                      msg.attachmentName || 'dokumen_pgb'
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                                  title="Muat Turun Fail ke Komputer / Telefon"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Muat Turun</span>
                                </button>
                              ) : (
                                <a
                                  href={msg.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                                  title="Buka atau Muat Turun Fail dari Pautan Luar"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Buka / Muat Turun</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Timestamp & Pinned status */}
                        <div
                          className={`mt-1.5 flex items-center justify-end gap-2 text-[10px] ${
                            isMine ? 'text-teal-200/80' : 'text-slate-400'
                          }`}
                        >
                          {msg.pinned && (
                            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                              <Pin className="w-2.5 h-2.5 fill-amber-400" /> Disemat
                            </span>
                          )}
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString('ms-MY', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Reactions & Quick Actions Bar */}
                      <div
                        className={`mt-1.5 flex items-center gap-1.5 flex-wrap ${
                          isMine ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {/* Existing Reactions */}
                        {msg.reactions &&
                          Object.entries(msg.reactions).map(([emoji, users]) =>
                            users && users.length > 0 ? (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(msg, emoji)}
                                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-teal-400 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <span>{emoji}</span>
                                <span>{users.length}</span>
                              </button>
                            ) : null
                          )}

                        {/* Hover Action Buttons (Emoji, Reply, Pin, Delete) */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {QUICK_EMOJIS.map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => handleToggleReaction(msg, em)}
                              className="p-1 rounded-lg hover:bg-slate-200/70 text-xs cursor-pointer"
                              title={`Reaksi ${em}`}
                            >
                              {em}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setReplyTarget(msg)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Balas Mesej"
                          >
                            <Reply className="w-3 h-3" />
                            <span>Balas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePin(msg)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 cursor-pointer"
                            title={msg.pinned ? 'Nyah-semat' : 'Sematkan Mesej'}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg)}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 cursor-pointer"
                              title="Padam Mesej"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Area */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 space-y-2.5">
            {/* Reply Banner */}
            {replyTarget && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-teal-900">
                    Membalas kepada {replyTarget.senderName}:
                  </span>{' '}
                  <span className="text-slate-600 truncate">{replyTarget.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="p-1 rounded-lg hover:bg-teal-100 text-slate-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Uploaded Image Preview */}
            {uploadedImage && (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 text-white text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={uploadedImage}
                    alt="Pratonton"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-teal-400 truncate">
                      {uploadedImageName || 'Gambar sedia dihantar'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Gambar akan dipaparkan terus dalam ruang sembang
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage('');
                    setUploadedImageName(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold"
                >
                  Buang
                </button>
              </div>
            )}

            {/* Uploaded Document / Attachment Preview */}
            {attachmentUrl && (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-teal-800 text-amber-400 flex items-center justify-center shrink-0">
                    {attachmentName?.toLowerCase().endsWith('.xls') ||
                    attachmentName?.toLowerCase().endsWith('.xlsx') ||
                    attachmentName?.toLowerCase().endsWith('.csv') ? (
                      <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-amber-400 truncate">
                      {attachmentName || 'Dokumen sedia dihantar'}
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-2">
                      {attachmentSize && <span>Saiz: {attachmentSize}</span>}
                      <span>
                        {attachmentUrl.startsWith('data:')
                          ? 'Fail Dokumen Peranti'
                          : 'Pautan Cloud / Drive'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentUrl('');
                    setAttachmentName('');
                    setAttachmentSize('');
                    setAttachmentType('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}

            {/* Optional Document Link Attachment Drawer */}
            {showAttachmentInput && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Nama Dokumen (cth: Kertas Kerja AGM.pdf)"
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="Pautan Google Drive / PDF (https://...)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAttachmentInput(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Main Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadChatImage(file);
                  if (e.target) e.target.value = '';
                }}
              />

              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadChatDoc(file);
                  if (e.target) e.target.value = '';
                }}
              />

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 transition cursor-pointer shrink-0"
                title="Muat Naik Gambar / Poster (PNG, JPG, WebP)"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={isUploadingDoc}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 transition cursor-pointer shrink-0"
                title="Muat Naik Dokumen / Fail (PDF, Word, Excel, PPTX)"
              >
                <FileUp className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
                  showAttachmentInput
                    ? 'bg-teal-100 text-teal-900 border-teal-300'
                    : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border-slate-200'
                }`}
                title="Kongsi Pautan Dokumen / Google Drive"
              >
                <Link2 className="w-4 h-4" />
              </button>

              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={
                  selectedDmSchool
                    ? `Tulis mesej terus kepada ${selectedDmSchool.principal || selectedDmSchool.name}...`
                    : `Tulis mesej kepada rakan PGB di #${activeChannelDef?.shortLabel || 'Saluran'}... (Tekan Enter untuk hantar)`
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700 text-xs sm:text-sm resize-none"
              />

              <button
                type="submit"
                disabled={isSending || (!inputText.trim() && !uploadedImage && !attachmentUrl.trim())}
                className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Hantar</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Preview & Download Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-6"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between p-3.5 bg-slate-900 rounded-t-2xl border border-slate-700 text-white">
              <div className="font-semibold text-xs sm:text-sm text-teal-300 truncate max-w-md">
                {previewImageModal.title}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadFile(
                      previewImageModal.url,
                      `gambar_pgb_${Date.now()}.png`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                  title="Muat Turun Gambar ke Peranti"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun Gambar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-white cursor-pointer transition"
                  title="Tutup Pratonton"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image View */}
            <div className="w-full bg-slate-950 p-2 sm:p-4 rounded-b-2xl border-x border-b border-slate-800 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
