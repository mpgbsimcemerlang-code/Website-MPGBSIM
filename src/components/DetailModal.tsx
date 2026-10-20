import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Award,
  MapPin,
  FileText,
  Share2,
  Bookmark,
  Send,
  Building,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Users,
  Phone,
  Mail,
  AlertCircle,
  Printer,
  Copy,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { NewsItem, StrategicFocus, BestPracticeItem, ProgramEvent } from '../types';
import { db, doc, getDoc, setDoc } from '../firebase';
import { useAdminContent } from '../context/AdminContentContext';
import { useMemberPortal } from '../context/MemberPortalContext';
import { checkAndRecordRateLimit } from '../utils/rateLimiter';
import { getNewsShareUrl, getNewsShareMessage, copyNewsShareLink } from '../utils/shareUtils';

export type ModalContentType =
  | { type: 'news'; data: NewsItem }
  | { type: 'focus'; data: StrategicFocus }
  | { type: 'practice'; data: BestPracticeItem }
  | { type: 'program'; data: ProgramEvent }
  | { type: 'privacy' }
  | { type: 'sharePractice' }
  | null;

interface DetailModalProps {
  content: ModalContentType;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ content, onClose }) => {
  const { siteData, registerForEvent } = useAdminContent();
  const { setViewMode, setPortalTab } = useMemberPortal();

  // Program registration form state
  const [progName, setProgName] = useState('');
  const [progPosition, setProgPosition] = useState('Pengetua');
  const [progSchool, setProgSchool] = useState('');
  const [progState, setProgState] = useState('Selangor');
  const [progPhone, setProgPhone] = useState('');
  const [progEmail, setProgEmail] = useState('');
  const [progNotes, setProgNotes] = useState('');
  const [progSubmitting, setProgSubmitting] = useState(false);
  const [progError, setProgError] = useState<string | null>(null);
  const [progRegistered, setProgRegistered] = useState(false);
  const [regReceipt, setRegReceipt] = useState<{
    code: string;
    message: string;
    registeredAt: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedNewsLink, setCopiedNewsLink] = useState(false);
  const [fetchedNewsItem, setFetchedNewsItem] = useState<NewsItem | null>(null);

  // Share best practice mini-form state
  const [shareTitle, setShareTitle] = useState('');
  const [shareSchool, setShareSchool] = useState('');
  const [shareDesc, setShareDesc] = useState('');
  const [shareSubmitted, setShareSubmitted] = useState(false);

  React.useEffect(() => {
    if (!content) {
      document.body.style.overflow = '';
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow || '';
    };
  }, [content, onClose]);

  // Reset form when content opens/changes and ensure live Firestore news image is fetched if needed
  React.useEffect(() => {
    setCopiedNewsLink(false);
    if (content?.type === 'program') {
      setProgRegistered(false);
      setRegReceipt(null);
      setProgError(null);
      setCopiedCode(false);
    }
    if (content?.type === 'news' && content.data?.id) {
      const targetId = content.data.id;
      const inSiteData = siteData.news?.find((n) => String(n.id) === String(targetId));
      const existingImg = inSiteData?.imageUrl || content.data.imageUrl;
      if (!existingImg || existingImg.trim() === '') {
        getDoc(doc(db, 'news', targetId))
          .then((snap) => {
            if (snap.exists()) {
              setFetchedNewsItem({ id: snap.id, ...(snap.data() as any) } as NewsItem);
            }
          })
          .catch(() => {});
      }
    } else {
      setFetchedNewsItem(null);
    }
  }, [content, siteData.news]);

  if (!content) return null;

  // Retrieve current live news item from siteData / Firestore so imageUrl is always identical to the card
  const liveNews: NewsItem | null =
    content.type === 'news' && content.data
      ? (() => {
          const fromSite = siteData.news?.find((n) => String(n.id) === String(content.data.id));
          const fromFetched =
            fetchedNewsItem && String(fetchedNewsItem.id) === String(content.data.id)
              ? fetchedNewsItem
              : null;
          const resolvedImageUrl =
            (fromFetched?.imageUrl && fromFetched.imageUrl.trim() !== '' ? fromFetched.imageUrl : '') ||
            (fromSite?.imageUrl && fromSite.imageUrl.trim() !== '' ? fromSite.imageUrl : '') ||
            (content.data.imageUrl && content.data.imageUrl.trim() !== '' ? content.data.imageUrl : '') ||
            'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800';
          return {
            ...content.data,
            ...(fromSite || {}),
            ...(fromFetched || {}),
            imageUrl: resolvedImageUrl,
          };
        })()
      : null;

  // Retrieve current live event from siteData to ensure live capacity is always accurate
  const liveProgram: ProgramEvent | null =
    content.type === 'program' && content.data
      ? siteData.programs?.find((p) => p.id === content.data.id) || content.data
      : null;

  const spotsTotal = liveProgram?.spotsTotal || 100;
  const spotsFilled = liveProgram?.spotsFilled || 0;
  const fillPercentage = Math.min(Math.round((spotsFilled / spotsTotal) * 100), 100);
  const isCapacityFull = spotsFilled >= spotsTotal || liveProgram?.registrationOpen === false;

  const handleProgramRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveProgram) return;

    if (isCapacityFull) {
      setProgError('Kapasiti pendaftaran bagi program ini telah penuh. Pendaftaran telah ditutup.');
      return;
    }

    const rateLimit = checkAndRecordRateLimit('program_registration');
    if (!rateLimit.allowed) {
      setProgError(rateLimit.message);
      return;
    }

    setProgSubmitting(true);
    setProgError(null);

    try {
      const res = await registerForEvent(liveProgram.id, {
        participantName: progName.trim(),
        participantEmail: progEmail.trim(),
        participantPhone: progPhone.trim(),
        schoolName: progSchool.trim(),
        position: progPosition.trim(),
        state: progState.trim(),
        notes: progNotes.trim(),
      });

      if (res.success) {
        setProgRegistered(true);
        const code = res.registrationId
          ? `MPGB-${res.registrationId.slice(-4).toUpperCase()}`
          : `MPGB-${Math.floor(1000 + Math.random() * 9000)}`;
        setRegReceipt({
          code,
          message: res.message,
          registeredAt: new Date().toLocaleString('ms-MY', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        });
      } else {
        setProgError(res.message);
      }
    } catch (err: any) {
      console.error('Ralat ketika memproses pendaftaran:', err);
      setProgError(err?.message || 'Ralat berlaku ketika memproses pendaftaran. Sila cuba sebentar lagi.');
    } finally {
      setProgSubmitting(false);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateLimit = checkAndRecordRateLimit('practice_submission');
    if (!rateLimit.allowed) {
      alert(rateLimit.message);
      return;
    }

    try {
      const id = `share-${Date.now()}`;
      await setDoc(doc(db, 'submissions', id), {
        id,
        submitter: shareSchool,
        type: 'Kisah kejayaan',
        title: shareTitle,
        content: shareDesc,
        date: new Date().toISOString().split('T')[0],
        status: 'Submitted',
      });
      await setDoc(doc(db, 'practices', id), {
        id,
        title: shareTitle,
        schoolName: shareSchool,
        category: 'Kurikulum',
        description: shareDesc,
        status: 'Submitted',
        year: '2026',
      });
      await setDoc(doc(db, 'bestPractices', id), {
        id,
        title: shareTitle,
        schoolName: shareSchool,
        category: 'Kurikulum',
        description: shareDesc,
        status: 'Submitted',
        year: '2026',
      });
    } catch (err) {}
    setShareSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div role="dialog" aria-modal="true" className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-900 bg-white/80 hover:bg-white rounded-full shadow-xs transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Type: NEWS */}
        {content.type === 'news' && liveNews && (
          <div>
            {/* Full Unobstructed News Image Container with Ambient Backdrop */}
            <div className="relative w-full h-64 sm:h-96 overflow-hidden bg-slate-950 flex items-center justify-center">
              {/* Subtle blurred background fill so portrait/poster photos look framed without cropping */}
              <img
                src={liveNews.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
              />
              {/* Main exact news image */}
              <img
                src={liveNews.imageUrl}
                alt={liveNews.title}
                className="relative z-10 w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800';
                }}
              />
            </div>

            <div className="p-6 sm:p-8 max-h-[62vh] overflow-y-auto">
              {/* Category & Title Header */}
              <div className="mb-5">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500 text-slate-950 shadow-2xs inline-block">
                    {liveNews.category}
                  </span>
                  {liveNews.achievementLevel && (
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-teal-800 text-teal-100 border border-teal-600/50 shadow-2xs inline-block">
                      Peringkat {liveNews.achievementLevel}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {liveNews.title}
                </h3>
              </div>

              {/* School Achievement Spotlight if present */}
              {(liveNews.schoolName || liveNews.isSchoolAchievement) && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-900">
                        Kejayaan Sekolah Ahli MPGBSIM
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {liveNews.schoolName || 'Sekolah Ahli Berdaftar'}
                      </div>
                    </div>
                  </div>

                  {liveNews.state && (
                    <div className="px-3 py-1 rounded-lg bg-white border border-amber-200 text-xs font-bold text-amber-900 shrink-0 self-start sm:self-auto">
                      Negeri: {liveNews.state}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pb-4 mb-6 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    {liveNews.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {liveNews.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    {liveNews.author}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await copyNewsShareLink(liveNews.id);
                    setCopiedNewsLink(true);
                    setTimeout(() => setCopiedNewsLink(false), 3000);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    copiedNewsLink
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                  }`}
                >
                  {copiedNewsLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Pautan Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Salin Pautan Berita</span>
                    </>
                  )}
                </button>
              </div>

              <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {liveNews.content}
              </div>

              {/* Direct News Link & Social Sharing Panel */}
              <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-teal-700" />
                      <span>Kongsi Pautan Terus Berita Ini</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Apabila pautan ini diklik, pembaca akan dibawa terus ke paparan penuh berita ini.
                    </p>
                  </div>

                  {/* Quick Social Share Links */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(getNewsShareMessage(liveNews))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                    >
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(getNewsShareUrl(liveNews.id))}&text=${encodeURIComponent(`📰 ${liveNews.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                    >
                      <span>Telegram</span>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getNewsShareUrl(liveNews.id))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                    >
                      <span>Facebook</span>
                    </a>
                  </div>
                </div>

                {/* Direct URL Input + Copy Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getNewsShareUrl(liveNews.id)}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-700 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await copyNewsShareLink(liveNews.id);
                      setCopiedNewsLink(true);
                      setTimeout(() => setCopiedNewsLink(false), 3000);
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      copiedNewsLink
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-teal-800 text-white shadow-xs'
                    }`}
                  >
                    {copiedNewsLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Pautan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {liveNews.schoolName
                    ? `Diterbitkan secara langsung melalui Portal Ahli MPGBSIM (${liveNews.schoolName})`
                    : 'Diterbitkan oleh Urus Setia MPGBSIM'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content Type: STRATEGIC FOCUS */}
        {content.type === 'focus' && (
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {content.data.code}
              </span>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {content.data.status}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
              {content.data.title}
            </h3>

            <p className="text-sm text-slate-700 leading-relaxed mb-6 font-normal">
              {content.data.fullDesc}
            </p>

            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Senarai Inisiatif Strategik Kebangsaan:
              </h4>
              <div className="space-y-2.5">
                {(content.data.initiatives || []).map((init, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{init}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
              <strong className="block text-amber-900 font-bold mb-0.5">Penunjuk Prestasi Utama (KPI):</strong>
              <p>{content.data.kpi}</p>
            </div>
          </div>
        )}

        {/* Content Type: BEST PRACTICE */}
        {content.type === 'practice' && (
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {content.data.badge}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {content.data.category} • Tahun {content.data.year}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
              {content.data.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-700">
                {content.data.schoolName}, {content.data.state}
              </span>
              <span>•</span>
              <span>Diterajui: {content.data.leadPerson}</span>
            </div>

            <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-950">
                <strong className="block text-teal-900 font-bold mb-1">Ringkasan Impak & Pembuktian:</strong>
                <p>{content.data.impactSummary}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Metodologi & Pelaksanaan:</h4>
                <p>{content.data.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Hasil Pencapaian Terperinci:</h4>
                <div className="space-y-2">
                  {(content.data.keyOutcomes || []).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Type: PROGRAM REGISTRATION */}
        {content.type === 'program' && (
          <div className="max-h-[85vh] overflow-y-auto">
            {content.data.posterUrl && (
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                {/* Ambient backdrop so portrait/square posters never get cropped awkwardly */}
                <img
                  src={content.data.posterUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                />
                <img
                  src={content.data.posterUrl}
                  alt={content.data.title}
                  className="relative z-10 max-h-full max-w-full object-contain drop-shadow-md"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none z-20" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white z-30">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-600/90 text-white backdrop-blur-xs shadow-xs">
                    Poster Rasmi Program
                  </span>
                  <a
                    href={content.data.posterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition cursor-pointer"
                  >
                    <span>Buka Poster Penuh</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-900 border border-teal-200">
                  Info Lanjut Program & Konvensyen MPGBSIM
                </span>

                {isCapacityFull ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Kapasiti Penuh
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pendaftaran Dibuka
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                {liveProgram?.title || content.data.title}
              </h3>
              {(liveProgram?.theme || content.data.theme) && (
                <p className="text-xs sm:text-sm font-medium italic text-teal-800 mb-4 bg-teal-50 p-2.5 rounded-lg border-l-2 border-teal-600">
                  {liveProgram?.theme || content.data.theme}
                </p>
              )}

              {/* Status Kapasiti Pendaftaran (Live Real-time Bar) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-700" />
                    Status Kapasiti Pendaftaran
                  </span>
                  <span className="font-extrabold text-teal-900">
                    {spotsFilled} / {spotsTotal} Peserta ({fillPercentage}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isCapacityFull
                        ? 'bg-rose-500'
                        : fillPercentage >= 80
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-teal-600 to-amber-500'
                    }`}
                    style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>
                    Baki Kekosongan: <strong className="text-slate-800 font-bold">{Math.max(spotsTotal - spotsFilled, 0)} tempat</strong>
                  </span>
                  <span>
                    Tarikh Tutup: <strong className="text-slate-800">{liveProgram?.closingDate || content.data.closingDate || 'Sebelum Acara'}</strong>
                  </span>
                </div>
              </div>

              {/* Event Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-2xs">
                <div>
                  <span className="text-slate-400 block font-medium">Tarikh Acara:</span>
                  <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-700" />
                    {liveProgram?.date || content.data.date}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Masa & Waktu:</span>
                  <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    {liveProgram?.time || content.data.time || '8:30 Pagi - 5:00 Petang'}
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-medium">Tempat / Mod:</span>
                  <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {liveProgram?.venue || content.data.venue} ({liveProgram?.mode || content.data.mode})
                  </strong>
                </div>
                <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Kadar Yuran:</span>
                  <strong className="text-amber-900 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    {liveProgram?.fees || content.data.fees}
                  </strong>
                </div>
              </div>

              {/* Description preview */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Maklumat & Ringkasan Program:
                </h4>
                <p className="whitespace-pre-line">
                  {liveProgram?.description || content.data.description}
                </p>
                {(liveProgram?.targetAudience || content.data.targetAudience) && (
                  <p className="pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                    <strong className="text-slate-800">Sasaran Peserta:</strong>{' '}
                    {liveProgram?.targetAudience || content.data.targetAudience}
                  </p>
                )}
              </div>

              {/* Exclusive Registration via PGB Member Portal Notice (No Public Website Form) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-teal-800/90 border border-teal-600/50 text-amber-400 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      Pendaftaran Eksklusif Ahli PGB
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white">
                      Pendaftaran Hanya Melalui Portal PGB Masing-Masing
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Laman web utama ini hanya memaparkan maklumat lanjut program. Untuk mendaftar penyertaan bagi sekolah anda, sila log masuk ke <strong>Portal Ahli PGB MPGBSIM</strong> masing-masing dan daftar di ruangan <strong>Takwim & Program</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setPortalTab('program');
                      setViewMode('portal');
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <span>Log Masuk Portal PGB Untuk Daftar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition cursor-pointer"
                  >
                    Tutup Info Lanjut
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Type: SHARE BEST PRACTICE FORM */}
        {content.type === 'sharePractice' && (
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
              Cadang & Kongsi Amalan Terbaik Sekolah Anda
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Amalan terbaik yang terpilih akan didokumentasikan dalam Repositori Terbuka MPGBSIM serta menerima pengiktirafan di peringkat kebangsaan.
            </p>

            {shareSubmitted ? (
              <div className="p-6 rounded-xl bg-teal-50 border border-teal-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                <h4 className="text-base font-bold text-teal-900">Cadangan Diterima!</h4>
                <p className="text-xs text-slate-600">
                  Jawatankuasa Penilaian Amalan Terbaik MPGBSIM akan menyemak dokumen ini dan menghubungi pihak sekolah anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleShareSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tajuk Amalan Terbaik / Inovasi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Model Pengurusan Tahfiz Terpimpin Melalui Analitik AI"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Sekolah & Negeri
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Sekolah Menengah Islam Hidayah, Johor"
                    value={shareSchool}
                    onChange={(e) => setShareSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Penerangan Ringkas & Bukti Impak
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Sila nyatakan objektif amalan, cara pelaksanaan, dan pencapaian konkrit yang dicapai oleh sekolah..."
                    value={shareDesc}
                    onChange={(e) => setShareDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Hantar Cadangan ke Panel MPGBSIM</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Content Type: PRIVACY POLICY */}
        {content.type === 'privacy' && (
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4">
              Dasar Privasi & Perlindungan Data MPGBSIM
            </h3>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) komited untuk melindungi privasi dan keselamatan data peribadi Pengetua, Guru Besar, pentadbir, murid, serta pihak-pihak berkepentingan selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA) Malaysia.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">1. Pengumpulan Maklumat</h4>
              <p>
                Kami hanya mengumpul maklumat yang diserahkan secara sukarela oleh pihak sekolah atau Pengetua/Guru Besar semasa memohon keahlian, mendaftar ke konvensyen, atau menghantar maklum balas rasmi melalui portal ini.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">2. Penggunaan Data</h4>
              <p>
                Data yang dikumpul digunakan khusus untuk urusan pentadbiran keahlian, penyaluran pekeliling rasmi, jemputan persidangan, serta penerbitan statistik beragregat pendidikan Islam kebangsaan. Kami tidak akan menjual atau menyewakan data kepada pihak ketiga.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">3. Keselamatan & Seni Bina Awan</h4>
              <p>
                Sistem portal direka dengan protokol keselamatan ketat, bersedia untuk dihubungkan kepada pangkalan data awan berenkripsi (seperti Firebase Firestore & Authentication) bagi menjamin kerahsiaan data pentadbir sekolah.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">4. Pertanyaan Privasi</h4>
              <p>
                Untuk sebarang kemas kini atau pertanyaan berhubung dasar privasi, sila hubungi Urus Setia MPGBSIM di emel: <strong>mpgbsim.cemerlang@gmail.com</strong> atau layari laman rasmi: <strong>https://www.mpgbsim.org/</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Modal Bottom Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
