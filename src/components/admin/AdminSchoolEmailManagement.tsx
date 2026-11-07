import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Mail,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Edit,
  Printer,
  Calendar,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Tag,
  Building2,
  Users,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Copy,
  Info,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Paperclip,
  Check,
  AlertTriangle,
  SendHorizontal,
  Settings,
  Key,
  Lock,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { useMemberPortal } from '../../context/MemberPortalContext';
import {
  MemberSchool,
  SchoolOfficialEmail,
  EmailRecipientItem,
  EmailTemplateType,
  EmailDispatchStatus,
  EmailDeliveryMethod,
  EmailSmtpConfig,
} from '../../types';
import { OFFICIAL_EMAIL_TEMPLATES, EmailTemplateDefinition } from '../../data/emailTemplates';
import { db } from '../../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { compressDataUrl } from '../../utils/imageCompressor';

const STORAGE_KEY = 'mpgbsim_school_official_emails_v1';

export const AdminSchoolEmailManagement: React.FC = () => {
  const { siteData } = useAdminContent();
  const { registeredSchools, currentUser } = useMemberPortal();

  // Active Tab: 'compose' | 'history' | 'schools-list'
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'schools-list'>('compose');

  // Stored Email Dispatches
  const [emailsList, setEmailsList] = useState<SchoolOfficialEmail[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  });

  // SMTP Settings State
  const [smtpConfig, setSmtpConfig] = useState<EmailSmtpConfig>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('mpgbsim_smtp_config_v1');
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      user: 'mpgbsim.cemerlang@gmail.com',
      pass: '',
      fromName: 'MPGBSIM Kebangsaan <mpgbsim.cemerlang@gmail.com>',
      fromEmail: 'mpgbsim.cemerlang@gmail.com',
    };
  });
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const saveSmtpConfig = (cfg: EmailSmtpConfig) => {
    setSmtpConfig(cfg);
    try {
      localStorage.setItem('mpgbsim_smtp_config_v1', JSON.stringify(cfg));
    } catch {}
  };

  // Real-time Firestore sync for emailsList
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(collection(db, 'schoolOfficialEmails'), (snapshot) => {
        if (!snapshot.empty) {
          const list: SchoolOfficialEmail[] = [];
          snapshot.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as SchoolOfficialEmail);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setEmailsList(list);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          } catch {}
        }
      });
    } catch (e) {
      console.warn('Firestore schoolOfficialEmails listener notice:', e);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Save to localStorage when emailsList changes
  const saveEmailsList = (list: SchoolOfficialEmail[]) => {
    setEmailsList(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  // Directory Schools list (Deduplicated 53 registered schools)
  const allSchools: MemberSchool[] = useMemo(() => {
    return registeredSchools && registeredSchools.length > 0
      ? registeredSchools
      : siteData.memberSchools || [];
  }, [registeredSchools, siteData.memberSchools]);

  // Valid schools with at least an email address
  const validSchoolsWithEmail = useMemo(() => {
    return allSchools.filter((s) => {
      const email = (s.email || s.schoolEmail || s.pgbEmail || '').trim();
      return email.includes('@');
    });
  }, [allSchools]);

  // Default Chairman Signature & Info from Admin Certificate Config
  const defaultChairmanSign = useMemo(() => {
    return (
      siteData.membershipCertificateConfig?.chairmanSignatureImageUrl ||
      siteData.programCertificateConfig?.chairmanSignatureImageUrl ||
      ''
    );
  }, [siteData.membershipCertificateConfig, siteData.programCertificateConfig]);

  const defaultChairmanName = useMemo(() => {
    return (
      siteData.membershipCertificateConfig?.chairmanName ||
      siteData.programCertificateConfig?.chairmanName ||
      'USTAZ MOHAMAD FAIZ BIN AZIZAN'
    );
  }, [siteData.membershipCertificateConfig, siteData.programCertificateConfig]);

  const defaultChairmanRole = useMemo(() => {
    return (
      siteData.membershipCertificateConfig?.chairmanRole ||
      siteData.programCertificateConfig?.chairmanRole ||
      'Pengerusi Kebangsaan MPGBSIM'
    );
  }, [siteData.membershipCertificateConfig, siteData.programCertificateConfig]);

  // ==========================================
  // COMPOSE / EDITOR FORM STATE
  // ==========================================
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>('JEMPUTAN_MESYUARAT');
  const [title, setTitle] = useState(OFFICIAL_EMAIL_TEMPLATES.JEMPUTAN_MESYUARAT.label);
  const [referenceNo, setReferenceNo] = useState(
    `MPGBSIM/MESY/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
  );
  const [letterDate, setLetterDate] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' });
  });
  const [subject, setSubject] = useState(OFFICIAL_EMAIL_TEMPLATES.JEMPUTAN_MESYUARAT.defaultSubject);
  const [salutation, setSalutation] = useState(OFFICIAL_EMAIL_TEMPLATES.JEMPUTAN_MESYUARAT.defaultSalutation);
  const [bodyText, setBodyText] = useState(OFFICIAL_EMAIL_TEMPLATES.JEMPUTAN_MESYUARAT.defaultBodyText);
  const [closingText, setClosingText] = useState(OFFICIAL_EMAIL_TEMPLATES.JEMPUTAN_MESYUARAT.defaultClosing);
  const [slogan, setSlogan] = useState(OFFICIAL_EMAIL_TEMPLATES.JEMPUTAN_MESYUARAT.defaultSlogan);

  // Signatory details
  const [chairmanName, setChairmanName] = useState(defaultChairmanName);
  const [chairmanRole, setChairmanRole] = useState(defaultChairmanRole);
  const [chairmanSignatureUrl, setChairmanSignatureUrl] = useState(defaultChairmanSign);
  const [showChairmanSignature, setShowChairmanSignature] = useState(true);
  const [showOfficialLetterhead, setShowOfficialLetterhead] = useState(true);

  // Recipient Selection state
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<Set<string>>(() => {
    return new Set(validSchoolsWithEmail.map((s) => s.id));
  });

  // Filter for School Selection
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolStateFilter, setSchoolStateFilter] = useState('SEMUA');

  // UI Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewSchool, setPreviewSchool] = useState<MemberSchool | null>(null);
  const [viewLogDetailModal, setViewLogDetailModal] = useState<SchoolOfficialEmail | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Signature File Input Ref
  const signInputRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Handle template selection change
  const handleSelectTemplate = (type: EmailTemplateType) => {
    setSelectedTemplate(type);
    const tmpl = OFFICIAL_EMAIL_TEMPLATES[type];
    setTitle(tmpl.label);
    setReferenceNo(
      `${tmpl.defaultRefPrefix}/${Math.floor(100 + Math.random() * 900)}`
    );
    setSubject(tmpl.defaultSubject);
    setSalutation(tmpl.defaultSalutation);
    setBodyText(tmpl.defaultBodyText);
    setClosingText(tmpl.defaultClosing);
    setSlogan(tmpl.defaultSlogan);
  };

  // Upload Chairman Signature image
  const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej (PNG, JPG, WebP) untuk tandatangan.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const rawBase64 = ev.target?.result as string;
        if (rawBase64) {
          const optimized = await compressDataUrl(rawBase64, 400, 200, 0.85);
          setChairmanSignatureUrl(optimized);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Gagal memuat naik tandatangan:', err);
    }
  };

  // Filtered schools for selection
  const filteredSchools = useMemo(() => {
    return validSchoolsWithEmail.filter((sch) => {
      const q = schoolSearchQuery.toLowerCase();
      const matchQuery =
        !q ||
        sch.name.toLowerCase().includes(q) ||
        (sch.code && sch.code.toLowerCase().includes(q)) ||
        (sch.principal && sch.principal.toLowerCase().includes(q)) ||
        (sch.state && sch.state.toLowerCase().includes(q));

      const matchState = schoolStateFilter === 'SEMUA' || sch.state === schoolStateFilter;
      return matchQuery && matchState;
    });
  }, [validSchoolsWithEmail, schoolSearchQuery, schoolStateFilter]);

  // Select / Deselect All schools
  const handleToggleSelectAll = () => {
    if (selectedSchoolIds.size === filteredSchools.length && filteredSchools.length > 0) {
      setSelectedSchoolIds(new Set());
    } else {
      setSelectedSchoolIds(new Set(filteredSchools.map((s) => s.id)));
    }
  };

  const handleToggleSchool = (id: string) => {
    const next = new Set(selectedSchoolIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedSchoolIds(next);
  };

  // Distinct states for filtering
  const distinctStates = useMemo(() => {
    const s = new Set<string>();
    validSchoolsWithEmail.forEach((sch) => {
      if (sch.state) s.add(sch.state);
    });
    return Array.from(s).sort();
  }, [validSchoolsWithEmail]);

  // Helper to build 1-click Gmail Web compose URL
  const buildGmailWebUrl = (
    recipientsList: string[],
    subj: string,
    body: string,
    ref: string,
    salut = salutation,
    clos = closingText,
    slog = slogan,
    cName = chairmanName || defaultChairmanName,
    cRole = chairmanRole || defaultChairmanRole
  ) => {
    const to = recipientsList.filter(Boolean).join(',');
    const su = `${subj} [Ruj: ${ref || referenceNo}]`;
    const fullBody = `${salut}\n\n${body}\n\n${clos}\n\n"${slog}"\n\nSaya yang menjalankan amanah,\n\n${cName}\n${cRole}\nMajlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)\nEmel: mpgbsim.cemerlang@gmail.com`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(su)}&body=${encodeURIComponent(fullBody)}`;
  };

  // Test SMTP connection handler
  const handleTestSmtp = async () => {
    if (!smtpConfig.pass) {
      alert('Sila masukkan Kata Laluan Aplikasi (App Password) Gmail sebelum menguji.');
      return;
    }
    setIsTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch('/api/test-smtp-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpConfig,
          targetEmail: smtpConfig.user || 'mpgbsim.cemerlang@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSmtpTestResult({ ok: true, message: data.message });
      } else {
        setSmtpTestResult({ ok: false, message: data.error || 'Ralat sambungan SMTP.' });
      }
    } catch (e: any) {
      setSmtpTestResult({ ok: false, message: e?.message || 'Gagal menghubungi pelayan.' });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // ==========================================
  // SEND / DISPATCH EMAIL FUNCTION
  // mode: 'gmail-web' | 'smtp' | 'draft'
  // ==========================================
  const handleDispatchEmail = async (mode: 'gmail-web' | 'smtp' | 'draft' = 'gmail-web') => {
    const targetSchools = validSchoolsWithEmail.filter((s) => selectedSchoolIds.has(s.id));

    if (mode !== 'draft' && targetSchools.length === 0) {
      alert('Sila pilih sekurang-kurangnya SATU sekolah penerima sebelum menghantar emel.');
      return;
    }

    if (!subject.trim()) {
      alert('Sila masukkan subjek / tajuk surat emel.');
      return;
    }

    if (!bodyText.trim()) {
      alert('Sila masukkan isi kandungan surat.');
      return;
    }

    // If user chose SMTP but password is not configured
    if (mode === 'smtp' && !smtpConfig.pass) {
      setShowSmtpModal(true);
      alert('Penghantaran automatik memerlukan Kata Laluan Aplikasi Gmail (App Password). Sila masukkan App Password di tetingkap tetapan SMTP yang dibuka, atau gunakan butang "Buka & Hantar di Gmail Rasmi (1-Klik)".');
      return;
    }

    setIsSending(true);
    setStatusFeedback(null);

    const nowIso = new Date().toISOString();
    const emailId = `email-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const asDraft = mode === 'draft';

    // Build recipient list
    const recipients: EmailRecipientItem[] = targetSchools.map((sch) => {
      const email = (sch.email || sch.schoolEmail || sch.pgbEmail || '').trim();
      return {
        schoolId: sch.id,
        schoolName: sch.name,
        schoolCode: sch.code || '-',
        principal: sch.principal || 'Pengetua / Guru Besar',
        email,
        state: sch.state || 'Malaysia',
        status: asDraft ? 'PENDING' : 'SENT',
        deliveryMethod: mode === 'gmail-web' ? ('DIRECT_GMAIL' as const) : mode === 'smtp' ? ('REAL_SMTP' as const) : ('UNSENT' as const),
        sentAt: asDraft ? undefined : nowIso,
        customReferenceNo: `${referenceNo}/${sch.code || sch.id.slice(-4)}`,
      };
    });

    let sentCount = asDraft ? 0 : recipients.length;
    let unsentCount = asDraft ? recipients.length : 0;
    let deliveryMethodResult: EmailDeliveryMethod = mode === 'gmail-web' ? 'DIRECT_GMAIL' : mode === 'smtp' ? 'REAL_SMTP' : 'UNSENT';

    // 1. Direct Gmail Web Compose Mode
    if (mode === 'gmail-web') {
      const emailAddresses = recipients.map((r) => r.email).filter(Boolean);
      const gmailUrl = buildGmailWebUrl(emailAddresses, subject.trim(), bodyText.trim(), referenceNo.trim());
      
      // Open official Gmail in new tab
      window.open(gmailUrl, '_blank');

      setStatusFeedback({
        type: 'success',
        message: `Tetingkap Gmail Rasmi (mpgbsim.cemerlang@gmail.com) telah dibuka dengan surat rasmi dan senarai ${emailAddresses.length} sekolah! Rekod telah disimpan dalam log.`,
      });
    }

    // 2. Real SMTP Server Mode
    if (mode === 'smtp') {
      try {
        const resp = await fetch('/api/dispatch-school-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: emailId,
            subject: subject.trim(),
            referenceNo: referenceNo.trim(),
            letterDate,
            salutation: salutation.trim(),
            bodyText: bodyText.trim(),
            closingText: closingText.trim(),
            slogan: slogan.trim(),
            chairmanName: chairmanName.trim() || defaultChairmanName,
            chairmanRole: chairmanRole.trim() || defaultChairmanRole,
            chairmanSignatureUrl: chairmanSignatureUrl || undefined,
            showChairmanSignature,
            recipients,
            smtpConfig,
          }),
        });

        const data = await resp.json();
        if (resp.ok && data.ok) {
          if (data.hasRealSmtp) {
            deliveryMethodResult = 'REAL_SMTP';
            if (Array.isArray(data.results)) {
              data.results.forEach((res: any, idx: number) => {
                if (recipients[idx]) {
                  recipients[idx].status = res.status;
                  recipients[idx].deliveryMethod = res.deliveryMethod;
                  recipients[idx].errorMessage = res.errorMessage;
                  recipients[idx].messageId = res.messageId;
                  recipients[idx].sentAt = res.sentAt;
                }
              });
              sentCount = data.sentCount ?? sentCount;
              unsentCount = data.unsentCount ?? unsentCount;
            }
            setStatusFeedback({
              type: 'success',
              message: `Emel surat rasmi berjaya dihantar ke ${sentCount} sekolah melalui pelayan SMTP!`,
            });
          } else {
            // No real SMTP was active
            deliveryMethodResult = 'UNSENT';
            recipients.forEach((r) => {
              r.status = 'UNSENT';
              r.deliveryMethod = 'UNSENT';
              r.errorMessage = data.message;
            });
            sentCount = 0;
            unsentCount = recipients.length;
            setStatusFeedback({
              type: 'error',
              message: data.message || 'Pelayan SMTP belum aktif. Surat disimpan sebagai DRAF.',
            });
          }
        } else {
          deliveryMethodResult = 'UNSENT';
          recipients.forEach((r) => {
            r.status = 'FAILED';
            r.deliveryMethod = 'UNSENT';
            r.errorMessage = data.error || 'Ralat penghantaran';
          });
          sentCount = 0;
          unsentCount = recipients.length;
          setStatusFeedback({
            type: 'error',
            message: data.error || 'Gagal menghantar melalui pelayan SMTP.',
          });
        }
      } catch (e: any) {
        deliveryMethodResult = 'UNSENT';
        setStatusFeedback({
          type: 'error',
          message: 'Ralat pelayan: ' + (e?.message || 'Gagal menyambung ke pelayan SMTP.'),
        });
      }
    }

    if (mode === 'draft') {
      setStatusFeedback({
        type: 'success',
        message: `Surat rasmi berjaya disimpan sebagai DRAF (${recipients.length} sekolah tersenarai).`,
      });
    }

    const emailRecord: SchoolOfficialEmail = {
      id: emailId,
      title: title.trim() || OFFICIAL_EMAIL_TEMPLATES[selectedTemplate].label,
      templateType: selectedTemplate,
      referenceNo: referenceNo.trim() || 'MPGBSIM/EML/2026',
      letterDate,
      senderName: currentUser?.fullName || 'Urus Setia Sekretariat Kebangsaan',
      senderRole: currentUser?.position || 'Pentadbir CMS MPGBSIM',
      senderOrg: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)',
      senderPhone: '03-4251 6157',
      senderEmail: 'mpgbsim.cemerlang@gmail.com',
      subject: subject.trim(),
      salutation: salutation.trim(),
      bodyText: bodyText.trim(),
      closingText: closingText.trim(),
      slogan: slogan.trim(),
      chairmanName: chairmanName.trim() || defaultChairmanName,
      chairmanRole: chairmanRole.trim() || defaultChairmanRole,
      chairmanSignatureUrl: chairmanSignatureUrl || undefined,
      showChairmanSignature,
      showOfficialLetterhead,
      includePdfAttachmentNotice: true,
      status: asDraft ? 'DRAFT' : unsentCount > 0 && sentCount === 0 ? 'UNSENT' : 'SENT',
      deliveryMethod: deliveryMethodResult,
      recipients,
      recipientCount: recipients.length,
      sentCount,
      unsentCount,
      sentAt: asDraft ? undefined : nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastUpdatedBy: currentUser?.fullName || 'Pentadbir CMS',
      tags: [selectedTemplate, `${recipients.length} Sekolah`, deliveryMethodResult],
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'schoolOfficialEmails', emailId), emailRecord);
    } catch (e) {
      console.warn('Gagal menyimpan ke Firestore (disimpan ke cache setempat):', e);
    }

    // Save locally
    const updatedList = [emailRecord, ...emailsList.filter((m) => m.id !== emailId)];
    saveEmailsList(updatedList);

    setIsSending(false);

    // Switch to history tab after 1.8s
    setTimeout(() => {
      setActiveTab('history');
    }, 1800);
  };

  // Delete an email dispatch log
  const handleDeleteEmail = async (id: string) => {
    if (!window.confirm('Adakah anda pasti mahu memadam rekod log emel ini?')) return;
    try {
      await deleteDoc(doc(db, 'schoolOfficialEmails', id));
    } catch (e) {
      console.warn('Firestore delete doc notice:', e);
    }
    const updated = emailsList.filter((e) => e.id !== id);
    saveEmailsList(updated);
  };

  // Re-send / mark single recipient as SENT
  const handleMarkRecipientSent = async (emailLog: SchoolOfficialEmail, recipientEmail: string) => {
    const updatedRecipients = emailLog.recipients.map((r) => {
      if (r.email === recipientEmail) {
        return {
          ...r,
          status: 'SENT' as const,
          sentAt: new Date().toISOString(),
          errorMessage: undefined,
        };
      }
      return r;
    });

    const sentCount = updatedRecipients.filter((r) => r.status === 'SENT').length;
    const unsentCount = updatedRecipients.length - sentCount;
    const status: EmailDispatchStatus = unsentCount === 0 ? 'SENT' : 'UNSENT';

    const updatedLog: SchoolOfficialEmail = {
      ...emailLog,
      recipients: updatedRecipients,
      sentCount,
      unsentCount,
      status,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'schoolOfficialEmails', emailLog.id), updatedLog);
    } catch {}

    const updatedList = emailsList.map((m) => (m.id === emailLog.id ? updatedLog : m));
    saveEmailsList(updatedList);
    setViewLogDetailModal(updatedLog);
  };

  // Print Letter Function
  const handlePrintLetter = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white shadow-xl border border-teal-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>Sistem Komunikasi Rasmi Sekolah MPGBSIM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Pengurusan Emel & Surat Rasmi Ke Sekolah</span>
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              Hantar surat rasmi terus ke alamat emel berdaftar pada profil sekolah-sekolah ahli MPGBSIM.
              Lengkap dengan template surat jemputan, peringatan yuran tahunan, tandatangan Pengerusi, dan log penghantaran (Sent / Unsent).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSmtpModal(true)}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-teal-800/90 text-amber-300 hover:bg-teal-700 border border-teal-600/60 shadow-md transition cursor-pointer"
              title="Tetapan Pelayan SMTP & Kata Laluan Aplikasi Gmail"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>Tetapan SMTP / Gmail</span>
              {smtpConfig.pass ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="SMTP Aktif" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Perlu Kata Laluan" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                activeTab === 'compose'
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-black'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Cipta & Hantar Surat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                activeTab === 'history'
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-black'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Log Penghantaran ({emailsList.length})</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs bar */}
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-teal-800/50">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-teal-700/80 text-white'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            <span>1. Karang Surat (Editor)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-teal-700/80 text-white'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. Status & Log Emel (Sent / Unsent)</span>
            <span className="px-1.5 py-0.2 bg-teal-800 text-teal-200 rounded-full text-[10px]">
              {emailsList.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schools-list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'schools-list'
                ? 'bg-teal-700/80 text-white'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>3. Direktori Emel Sekolah ({validSchoolsWithEmail.length} Sah)</span>
          </button>
        </div>
      </div>

      {/* Real Email Delivery Advisory Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-xs text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
              <span>Pengesahan Penghantaran Emel Sebenar ke Peti Masuk Sekolah</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold uppercase">
                {smtpConfig.pass ? 'SMTP Bersambung' : 'Gmail 1-Klik Aktif'}
              </span>
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed max-w-3xl">
              Bagi memastikan emel benar-benar sampai ke peti masuk sekolah penerima (bukan sekadar catatan dalam sistem):
              Gunakan butang <strong>"Buka di Gmail Rasmi (1-Klik)"</strong> untuk menghantar terus dari akaun rasmi <code>mpgbsim.cemerlang@gmail.com</code>, 
              atau masukkan Kata Laluan Aplikasi (App Password) di butang <strong>"Tetapan SMTP / Gmail"</strong> untuk penghantaran automatik oleh pelayan.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowSmtpModal(true)}
          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Konfigurasi SMTP</span>
        </button>
      </div>

      {/* Status Feedback Notice */}
      {statusFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            statusFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            {statusFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusFeedback(null)}
            className="text-xs font-bold underline hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: COMPOSE & SEND EMAIL TO SCHOOLS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Template Selection & Letter Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Template Selection */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Pilih Template Surat Rasmi</h3>
                    <p className="text-xs text-slate-500">Pilih daripada format standard MPGBSIM</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 border border-amber-200 text-amber-800">
                  {OFFICIAL_EMAIL_TEMPLATES[selectedTemplate].badge}
                </span>
              </div>

              {/* Template Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {(Object.keys(OFFICIAL_EMAIL_TEMPLATES) as EmailTemplateType[]).map((type) => {
                  const tmpl = OFFICIAL_EMAIL_TEMPLATES[type];
                  const isSelected = selectedTemplate === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectTemplate(type)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-teal-900 text-white border-teal-950 shadow-md ring-2 ring-teal-600/30'
                          : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {tmpl.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />}
                      </div>
                      <p className={`text-[11px] line-clamp-2 leading-tight ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                        {tmpl.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Letter Details & Editable Fields */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Butiran Surat & Kandungan</h3>
                    <p className="text-xs text-slate-500">Semua teks boleh disunting mengikut kesesuaian majlis</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold flex items-center gap-1.5 border border-teal-200 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-700" />
                    <span>Pratonton Surat Rasmi</span>
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Rujukan Fail Surat
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    placeholder="cth: MPGBSIM/MESY/2026/014"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarikh Surat Rasmi
                  </label>
                  <input
                    type="text"
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    placeholder="cth: 24 Mac 2026 / 15 Syawal 1447H"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subjek / Tajuk Emel Surat (HURUF BESAR)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  placeholder="Masukkan tajuk surat..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Panggilan Hormat / Salutation
                </label>
                <input
                  type="text"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  placeholder="cth: Yang Berusaha Pengetua / Guru Besar,"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Isi Kandungan Surat Rasmi</span>
                  <span className="text-[11px] text-slate-400 font-normal">Menyokong perenggan bernombor</span>
                </label>
                <textarea
                  rows={8}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-sans leading-relaxed focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  placeholder="Tulis kandungan surat di sini..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penutup Surat
                  </label>
                  <textarea
                    rows={2}
                    value={closingText}
                    onChange={(e) => setClosingText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cogan Kata / Slogan Rasmi
                  </label>
                  <textarea
                    rows={2}
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Chairman Signature & Signatory Configuration */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Tandatangan & Pengesahan Pengerusi</h3>
                    <p className="text-xs text-slate-500">Muat naik imej tandatangan digital Pengerusi Kebangsaan</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showChairmanSignature}
                    onChange={(e) => setShowChairmanSignature(e.target.checked)}
                    className="rounded text-teal-700 focus:ring-teal-500"
                  />
                  <span>Sertakan Tandatangan</span>
                </label>
              </div>

              {showChairmanSignature && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Penandatangan
                      </label>
                      <input
                        type="text"
                        value={chairmanName}
                        onChange={(e) => setChairmanName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jawatan / Organisasi
                      </label>
                      <input
                        type="text"
                        value={chairmanRole}
                        onChange={(e) => setChairmanRole(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Signature Upload & Preview Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <input
                      ref={signInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadSignature}
                    />

                    {chairmanSignatureUrl ? (
                      <div className="space-y-2">
                        <div className="h-16 flex items-center justify-center bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
                          <img
                            src={chairmanSignatureUrl}
                            alt="Tandatangan Pengerusi"
                            className="max-h-full object-contain filter contrast-125"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => signInputRef.current?.click()}
                            className="text-[11px] font-bold text-teal-800 hover:underline cursor-pointer"
                          >
                            Tukar Imej Tandatangan
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setChairmanSignatureUrl('')}
                            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            Padam
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-700">Muat Naik Tandatangan Pengerusi</p>
                        <p className="text-[10px] text-slate-400 mb-2">Format PNG latar belakang lutsinar / JPG</p>
                        <button
                          type="button"
                          onClick={() => signInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Pilih Fail Imej
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recipient Selection & Dispatch Action (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 4: School Recipient Selection */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-black text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Pilih Sekolah Penerima</h3>
                    <p className="text-xs text-slate-500">
                      {selectedSchoolIds.size} daripada {validSchoolsWithEmail.length} sekolah dipilih
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  {selectedSchoolIds.size === filteredSchools.length && filteredSchools.length > 0
                    ? 'Nyahpilih Semua'
                    : 'Pilih Semua'}
                </button>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={schoolSearchQuery}
                    onChange={(e) => setSchoolSearchQuery(e.target.value)}
                    placeholder="Cari nama sekolah, kod atau PGB..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={schoolStateFilter}
                    onChange={(e) => setSchoolStateFilter(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="SEMUA">Semua Negeri ({validSchoolsWithEmail.length} Sekolah)</option>
                    {distinctStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scrollable Checklist */}
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                {filteredSchools.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Tiada sekolah sepadan dengan carian.
                  </div>
                ) : (
                  filteredSchools.map((school) => {
                    const isChecked = selectedSchoolIds.has(school.id);
                    const email = (school.email || school.schoolEmail || school.pgbEmail || '').trim();
                    return (
                      <div
                        key={school.id}
                        onClick={() => handleToggleSchool(school.id)}
                        className={`pt-1.5 first:pt-0 p-2.5 rounded-xl transition cursor-pointer flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-teal-50/70 border border-teal-200/80'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 text-teal-800">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-teal-800" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {school.name}
                            </span>
                            {school.code && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-mono font-bold shrink-0">
                                {school.code}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-teal-700 font-medium truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{email}</span>
                          </p>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                            <span className="truncate">{school.principal || 'PGB'}</span>
                            <span className="shrink-0">{school.state}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Step 5: Send Action Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2 text-xs text-amber-950">
                <div className="font-black flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pengesahan Sebelum Hantar:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
                  <li>Surat akan dialamatkan terus kepada Pengetua / Guru Besar sekolah yang dipilih.</li>
                  <li>Emel dihantar ke alamat emel rasmi sekolah yang berdaftar pada profil direktori.</li>
                  <li>Log penghantaran akan merekodkan status penerimaan setiap sekolah secara automatik.</li>
                </ul>
              </div>

              {/* Delivery Action Options */}
              <div className="space-y-3 pt-1">
                {/* Option 1: Direct 1-Click Gmail Official Web Compose (Recommended) */}
                <button
                  type="button"
                  disabled={isSending || selectedSchoolIds.size === 0}
                  onClick={() => handleDispatchEmail('gmail-web')}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-800 hover:from-teal-800 hover:to-emerald-700 text-white shadow-lg shadow-teal-950/25 transition flex items-center justify-between gap-3 cursor-pointer disabled:opacity-50 border border-amber-400/30 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">Buka & Hantar Melalui Gmail (1-Klik)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase">
                          Disyorkan
                        </span>
                      </div>
                      <p className="text-[11px] text-teal-100/90 leading-tight mt-0.5">
                        Buka tetingkap Gmail rasmi (mpgbsim.cemerlang@gmail.com) bersama surat dan {selectedSchoolIds.size} emel sekolah penerima.
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-amber-300 shrink-0" />
                </button>

                {/* Option 2: Automated Server SMTP Dispatch */}
                <button
                  type="button"
                  disabled={isSending || selectedSchoolIds.size === 0}
                  onClick={() => handleDispatchEmail('smtp')}
                  className="w-full p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 transition flex items-center justify-between gap-3 cursor-pointer disabled:opacity-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 font-bold">
                      <Send className="w-4 h-4 text-teal-800" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Hantar Automatik (Melalui Pelayan SMTP)</span>
                        {smtpConfig.pass ? (
                          <span className="text-[10px] text-emerald-700 font-bold">● SMTP Sedia</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-bold">● Perlu App Password</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Dihantar secara latar belakang ke semua {selectedSchoolIds.size} sekolah menggunakan pelayan SMTP.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {/* Sub Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratonton Format Surat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDispatchEmail('draft')}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Simpan Draf Sahaja</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HISTORY & SENT / UNSENT LOG                                        */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Log Penghantaran Emel & Surat Rasmi ({emailsList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pantau rekod penghantaran, status Sent / Unsent, dan senarai sekolah penerima.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cipta Surat Baharu</span>
            </button>
          </div>

          {emailsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Mail className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Belum Ada Rekod Emel Dihantar</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Anda belum menghantar sebarang surat rasmi kepada sekolah-sekolah. Klik "Cipta Surat Baharu" untuk mula mengarang surat jemputan atau notis yuran.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className="px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-700 cursor-pointer"
              >
                Karang Surat Pertama Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {emailsList.map((item) => {
                const isAllSent = item.unsentCount === 0 && item.sentCount > 0;
                const isDraft = item.status === 'DRAFT';
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.deliveryMethod === 'REAL_SMTP' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ DIHANTAR (PELAYAN SMTP)
                            </span>
                          ) : item.deliveryMethod === 'DIRECT_GMAIL' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
                              ✓ DIHANTAR (GMAIL RASMI)
                            </span>
                          ) : isDraft ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
                              • DRAF SURAT
                            </span>
                          ) : item.status === 'SENT' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300" title="Rekod tersimpan dalam sistem tanpa sambungan SMTP">
                              • REKOD SISTEM (BELUM DIEMEL KELUAR)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                              ⚠️ {item.unsentCount} SEKOLAH BELUM DIHANTAR
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                            {item.referenceNo}
                          </span>

                          <span className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString('ms-MY', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-900">{item.subject}</h4>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const emails = item.recipients.map((r) => r.email).filter(Boolean);
                            const url = buildGmailWebUrl(
                              emails,
                              item.subject,
                              item.bodyText,
                              item.referenceNo,
                              item.salutation,
                              item.closingText,
                              item.slogan,
                              item.chairmanName,
                              item.chairmanRole
                            );
                            window.open(url, '_blank');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-amber-300"
                          title="Buka tetingkap Gmail untuk menghantar surat ini sekarang"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber-700" />
                          <span>Buka di Gmail</span>
                          <ExternalLink className="w-3 h-3 text-amber-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewLogDetailModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-teal-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Log & Surat</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEmail(item.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Padam Rekod Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats summary & Recipient Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-600">
                          Jumlah Sekolah: <strong>{item.recipientCount}</strong>
                        </span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sent: {item.sentCount}</span>
                        </span>
                        {item.unsentCount > 0 && (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Unsent / Gagal: {item.unsentCount}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Oleh: {item.senderName} ({item.senderRole})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCHOOL EMAIL DIRECTORY VIEW                                        */}
      {/* ========================================================================= */}
      {activeTab === 'schools-list' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Direktori Alamat Emel Sekolah Berdaftar ({allSchools.length} Sekolah)
              </h3>
              <p className="text-xs text-slate-500">
                Senarai emel rasmi sekolah yang didaftarkan pada profil direktori institusi ahli MPGBSIM.
              </p>
            </div>
            <div className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
              ✓ {validSchoolsWithEmail.length} Sekolah Mempunyai Format Emel Sah
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Nama Sekolah</th>
                  <th className="py-3 px-3">Kod</th>
                  <th className="py-3 px-3">Pengetua / Guru Besar</th>
                  <th className="py-3 px-3">Emel Sekolah Rasmi</th>
                  <th className="py-3 px-3">Negeri</th>
                  <th className="py-3 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSchools.map((sch, idx) => {
                  const email = (sch.email || sch.schoolEmail || sch.pgbEmail || '').trim();
                  const hasEmail = email.includes('@');
                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sch.name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {sch.code || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{sch.principal || '-'}</td>
                      <td className="py-2.5 px-3">
                        {hasEmail ? (
                          <span className="font-mono text-teal-800 font-bold">{email}</span>
                        ) : (
                          <span className="text-rose-500 italic">Tiada emel berdaftar</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{sch.state || '-'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchoolIds(new Set([sch.id]));
                            setActiveTab('compose');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] border border-teal-200 transition cursor-pointer"
                        >
                          Hantar Emel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRATONTON SURAT RASMI (OFFICIAL LETTER PREVIEW)                     */}
      {/* ========================================================================= */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-800" />
                <h3 className="text-sm font-black text-slate-900">
                  Pratonton Format Surat Rasmi MPGBSIM
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintLetter}
                  className="px-3 py-1.5 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Letter Sheet */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100">
              <div
                ref={printAreaRef}
                className="max-w-[800px] mx-auto bg-white p-8 sm:p-12 shadow-md rounded-2xl border border-slate-200 text-slate-900 font-serif leading-relaxed text-sm space-y-6"
              >
                {/* Official Letterhead */}
                {showOfficialLetterhead && (
                  <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                    <img
                      src="/mpgbsim-official-logo.png"
                      alt="Logo MPGBSIM"
                      className="w-20 h-20 object-contain shrink-0"
                    />
                    <div className="text-center flex-1 font-sans">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide uppercase">
                        Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia
                      </h2>
                      <p className="text-xs font-bold text-amber-700 uppercase">
                        (MPGBSIM • Pertubuhan Kebangsaan Ditubuhkan Pada 23 April 1996)
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                        NO. PENDAFTARAN ROS: PPM-002-10-23041996
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor
                        <br />
                        Tel: 03-4251 6157 • Emel: sekretariat@mpgbsim.org • Web: www.mpgbsim.org
                      </p>
                    </div>
                  </div>
                )}

                {/* Reference and Date Bar */}
                <div className="flex justify-between items-start text-xs font-sans text-slate-700 pt-2">
                  <div>
                    <p>
                      Rujukan Kami : <strong>{referenceNo}</strong>
                    </p>
                    <p>
                      Rujukan Tuan : -
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      Tarikh : <strong>{letterDate}</strong>
                    </p>
                  </div>
                </div>

                {/* Recipient Block (Sample or Selected) */}
                <div className="font-sans text-xs space-y-0.5">
                  <p className="font-bold">Kepada:</p>
                  <p className="font-black text-sm">Pengetua / Guru Besar</p>
                  <p className="font-bold">Sekolah-Sekolah Islam Ahli Berdaftar MPGBSIM</p>
                  <p className="text-slate-600">Malaysia</p>
                </div>

                {/* Salutation */}
                <div className="font-sans text-xs font-bold">{salutation}</div>

                {/* Subject Header */}
                <div className="font-sans font-black text-sm uppercase underline tracking-wide">
                  {subject}
                </div>

                {/* Letter Body Text */}
                <div className="font-sans text-xs leading-relaxed whitespace-pre-line text-slate-800 space-y-4">
                  {bodyText}
                </div>

                {/* Closing */}
                <div className="font-sans text-xs pt-2">
                  <p>{closingText}</p>
                </div>

                {/* Slogan */}
                <div className="font-sans text-xs font-black uppercase text-slate-900 tracking-wider">
                  {slogan}
                </div>

                {/* Signature Block */}
                {showChairmanSignature && (
                  <div className="font-sans text-xs space-y-2 pt-4">
                    <p>Saya yang menjalankan amanah,</p>
                    {chairmanSignatureUrl ? (
                      <div className="h-16 flex items-center">
                        <img
                          src={chairmanSignatureUrl}
                          alt="Tandatangan"
                          className="max-h-full object-contain filter contrast-125"
                        />
                      </div>
                    ) : (
                      <div className="h-12 border-b border-slate-300 w-48" />
                    )}
                    <div>
                      <p className="font-black text-sm uppercase underline">{chairmanName}</p>
                      <p className="font-bold text-slate-700">{chairmanRole}</p>
                      <p className="text-slate-600">
                        Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETAIL LOG PENGHANTARAN EMEL (VIEW LOG DETAIL MODAL)               */}
      {/* ========================================================================= */}
      {viewLogDetailModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-800" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Maklumat Log Penghantaran Emel
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Ref: {viewLogDetailModal.referenceNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewLogDetailModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold">Jumlah Sekolah</div>
                  <div className="text-lg font-black text-slate-900">
                    {viewLogDetailModal.recipientCount}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs text-emerald-700 font-bold">Berjaya Sent</div>
                  <div className="text-lg font-black text-emerald-800">
                    {viewLogDetailModal.sentCount}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <div className="text-xs text-rose-700 font-bold">Unsent / Gagal</div>
                  <div className="text-lg font-black text-rose-800">
                    {viewLogDetailModal.unsentCount}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                  <div className="text-xs text-teal-700 font-bold">Tarikh Dihantar</div>
                  <div className="text-xs font-bold text-teal-900 mt-1">
                    {viewLogDetailModal.sentAt
                      ? new Date(viewLogDetailModal.sentAt).toLocaleDateString('ms-MY', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Draf'}
                  </div>
                </div>
              </div>

              {/* Subject & Body Snippet */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-500">Tajuk Surat / Subjek:</div>
                <h4 className="text-sm font-black text-slate-900">{viewLogDetailModal.subject}</h4>
                <div className="text-xs text-slate-700 whitespace-pre-line max-h-40 overflow-y-auto pt-2 border-t border-slate-200 leading-relaxed font-sans">
                  {viewLogDetailModal.bodyText}
                </div>
              </div>

              {/* Recipient Status Breakdown Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Senarai Sekolah & Status Penghantaran:
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Anda boleh klik "Buka di Gmail" pada mana-mana sekolah untuk menghantar emel sebenar terus dari akaun rasmi anda.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const emails = viewLogDetailModal.recipients.map((r) => r.email).filter(Boolean);
                        const url = buildGmailWebUrl(
                          emails,
                          viewLogDetailModal.subject,
                          viewLogDetailModal.bodyText,
                          viewLogDetailModal.referenceNo,
                          viewLogDetailModal.salutation,
                          viewLogDetailModal.closingText,
                          viewLogDetailModal.slogan,
                          viewLogDetailModal.chairmanName,
                          viewLogDetailModal.chairmanRole
                        );
                        window.open(url, '_blank');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Buka Semua di Gmail (1-Klik)</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {viewLogDetailModal.recipients.length} Penerima
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Sekolah</th>
                        <th className="py-2.5 px-3">Alamat Emel</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Kaedah</th>
                        <th className="py-2.5 px-3 text-right">Tindakan Hantar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {viewLogDetailModal.recipients.map((rec, idx) => {
                        const isSent = rec.status === 'SENT';
                        const method = rec.deliveryMethod || viewLogDetailModal.deliveryMethod;
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {rec.schoolName}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {rec.principal} • {rec.state}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-teal-800 font-semibold">{rec.email}</td>
                            <td className="py-2.5 px-3">
                              {isSent ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>SENT</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>UNSENT</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[10px]">
                              {method === 'REAL_SMTP' ? (
                                <span className="text-emerald-700 font-bold">Pelayan SMTP</span>
                              ) : method === 'DIRECT_GMAIL' ? (
                                <span className="text-blue-700 font-bold">Gmail Rasmi</span>
                              ) : (
                                <span className="text-amber-700 font-medium">Rekod Sistem</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const url = buildGmailWebUrl(
                                      [rec.email],
                                      viewLogDetailModal.subject,
                                      viewLogDetailModal.bodyText,
                                      viewLogDetailModal.referenceNo,
                                      viewLogDetailModal.salutation,
                                      viewLogDetailModal.closingText,
                                      viewLogDetailModal.slogan,
                                      viewLogDetailModal.chairmanName,
                                      viewLogDetailModal.chairmanRole
                                    );
                                    window.open(url, '_blank');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                                  title="Buka surat ini di Gmail khas untuk sekolah ini"
                                >
                                  <Mail className="w-3 h-3 text-teal-700" />
                                  <span>Buka Gmail</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-teal-600" />
                                </button>
                                {!isSent && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkRecipientSent(viewLogDetailModal, rec.email)}
                                    className="px-2 py-1 rounded-lg bg-emerald-800 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer"
                                    title="Tandakan emel ini telah dihantar"
                                  >
                                    Tandai Sent
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewLogDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TETAPAN PELAYAN EMEL SMTP & GMAIL APP PASSWORD                     */}
      {/* ========================================================================= */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Tetapan Pelayan Emel SMTP / Gmail</h3>
                  <p className="text-[11px] text-teal-200">Konfigurasi penghantaran emel automatik MPGBSIM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSmtpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              {/* Guidance Box for Gmail */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs space-y-2 text-teal-950">
                <div className="font-bold flex items-center gap-1.5 text-teal-900">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Panduan Menjana Kata Laluan Aplikasi (App Password) Gmail:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-teal-900 leading-relaxed">
                  <li>Log masuk akaun rasmi <strong>mpgbsim.cemerlang@gmail.com</strong> di <code>myaccount.google.com</code>.</li>
                  <li>Pergi ke menu <strong>Keselamatan (Security)</strong> & pastikan <em>2-Step Verification</em> aktif.</li>
                  <li>Cari <strong>Kata Laluan Aplikasi (App Passwords)</strong> di ruangan carian keselamatan Google.</li>
                  <li>Namakan aplikasi sebagai <code>MPGBSIM CMS</code> dan klik <strong>Create</strong>.</li>
                  <li>Salin kod 16-aksara yang dijana (contoh: <code>abcd efgh ijkl mnop</code>) dan masukkan di bawah.</li>
                </ol>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pelayan SMTP (Host):
                  </label>
                  <input
                    type="text"
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Port:</label>
                    <input
                      type="number"
                      value={smtpConfig.port}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) })}
                      placeholder="465"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400">465 (SSL) atau 587 (TLS)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Akaun Pengirim:</label>
                    <input
                      type="email"
                      value={smtpConfig.user}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                      placeholder="mpgbsim.cemerlang@gmail.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Kata Laluan Aplikasi (App Password - 16 Aksara):</span>
                    {smtpConfig.pass ? (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Telah Ditetapkan</span>
                    ) : (
                      <span className="text-[10px] text-rose-500 font-bold">* Diperlukan untuk SMTP</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={smtpConfig.pass}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                    placeholder="Masukkan Kata Laluan Aplikasi 16-aksara Google"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono tracking-wider focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* SMTP Test Feedback */}
              {smtpTestResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                    smtpTestResult.ok
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  {smtpTestResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{smtpTestResult.message}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={isTestingSmtp || !smtpConfig.pass}
                onClick={handleTestSmtp}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {isTestingSmtp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menguji Sambungan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-teal-700" />
                    <span>Uji Sambungan & Hantar Emel Ujian</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSmtpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveSmtpConfig(smtpConfig);
                    setShowSmtpModal(false);
                    setStatusFeedback({
                      type: 'success',
                      message: 'Tetapan SMTP berjaya disimpan ke peranti pentadbir.',
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Simpan Tetapan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
