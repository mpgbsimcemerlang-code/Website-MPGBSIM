import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  X,
  Image as ImageIcon,
  Send,
  Eye,
  Bookmark,
  Upload,
  Camera,
  AlertTriangle,
  Trophy,
  Sparkles,
  Building,
  UserCheck,
  ChevronRight,
  Check,
  Award,
  RefreshCw,
  AlertCircle,
  MapPin,
  Globe,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { NewsItem } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  sortNewsByPublishedDate,
  toInputDateFormat,
  formatToMalayDate,
} from '../../utils/dateUtils';

// Preset HD Images for quick selection matching Portal Ahli
const PRESET_NEWS_IMAGES = [
  {
    label: 'Robotik & STEM Antarabangsa',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
    desc: 'Murid menyertai pertandingan robotik & inovasi teknologi',
  },
  {
    label: 'Tahfiz, Hafazan & Tilawah',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1000&q=80',
    desc: 'Majlis khatam hafazan dan pertandingan musabaqah Al-Quran',
  },
  {
    label: 'Juara Sukan & Memanah Tradisional',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',
    desc: 'Kejuaraan memanah berkuda, silat dan sukan kebangsaan',
  },
  {
    label: 'Kecemerlangan Akademik & SPM/STAM',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    desc: 'Keputusan cemerlang dan majlis graduasi para murid',
  },
  {
    label: 'Pentas Anugerah & Piala Kejayaan',
    url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1000&q=80',
    desc: 'Penerimaan piala, pingat dan sijil penghargaan kepimpinan',
  },
  {
    label: 'Aktiviti Kepimpinan & Sahsiah',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
    desc: 'Kem kepimpinan murid dan jalinan ukhuwah sekolah Islam',
  },
];

const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'WP Kuala Lumpur',
  'WP Labuan',
  'WP Putrajaya',
];

const CATEGORIES = [
  'Kejayaan Sekolah',
  'Robotik, STEM & Digital',
  'Kejayaan Akademik & Tahfiz',
  'Kokurikulum & Sukan',
  'Kepimpinan & Tarbiah',
  'Anugerah Khas & Pengiktirafan',
  'Kenyataan Media',
  'Pendidikan',
  'Pengurusan',
  'Aktiviti',
];

const ACHIEVEMENT_LEVELS = [
  'Antarabangsa',
  'Kebangsaan',
  'Negeri',
  'Daerah',
  'Institusi',
];

export const AdminNewsManagement: React.FC = () => {
  const { siteData, addNews, updateNews, deleteNews } = useAdminContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Omit<NewsItem, 'id'> = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'Kejayaan Sekolah',
    achievementLevel: 'Kebangsaan',
    schoolName: 'Sekolah Ahli MPGBSIM',
    schoolCode: 'MPGB-AHLI',
    state: 'Selangor',
    date: formatToMalayDate(new Date()),
    author: 'Urus Setia MPGBSIM',
    readTime: '3 minit bacaan',
    imageUrl: PRESET_NEWS_IMAGES[0].url,
    featured: false,
    status: 'published',
    scheduleDate: '',
    isSchoolAchievement: true,
  };

  const [formData, setFormData] = useState<Omit<NewsItem, 'id'>>(initialFormState);
  const [uploadedImageDetails, setUploadedImageDetails] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // In-App Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteNews(itemToDelete.id);
      setNotificationMsg({
        type: 'success',
        text: `Berita "${itemToDelete.title}" berjaya dipadamkan daripada sistem MPGBSIM.`,
      });
      setItemToDelete(null);
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err: any) {
      console.error('Ralat ketika memadam berita:', err);
      setNotificationMsg({
        type: 'error',
        text: 'Ralat ketika memadam berita. Sila pastikan sambungan internet anda aktif.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProcessFile = async (file: File) => {
    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Sila pilih fail format imej yang sah (JPG, PNG, WebP, dsb).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setImageError('Saiz fail melebihi had 15MB. Sila pilih foto yang lebih kecil.');
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1280, 1280, 0.82);
      setFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
      const estSizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);
      setUploadedImageDetails({
        name: file.name,
        size: `${estSizeKb} KB (Dioptimumkan)`,
      });
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({ ...prev, imageUrl: result }));
        setUploadedImageDetails({
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAdminImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setUploadedImageDetails(null);
    setImageError('');
    if (adminFileInputRef.current) adminFileInputRef.current.value = '';
  };

  // Fast Fill Template Generator matching Portal Ahli
  const applyTemplate = (type: 'robotik' | 'akademik' | 'sukan' | 'kenyataan_media') => {
    const defaultSchool = formData.schoolName || 'Sekolah Ahli MPGBSIM';
    const defaultAuthor = formData.author || 'Urus Setia MPGBSIM';

    if (type === 'robotik') {
      setFormData((prev) => ({
        ...prev,
        title: `Kejayaan Gemilang ${defaultSchool} Merangkul Tempat Pertama Pertandingan Inovasi & Robotik 2026`,
        achievementLevel: 'Kebangsaan',
        category: 'Robotik, STEM & Digital',
        summary: `Pasukan inovasi murid ${defaultSchool} berjaya mengharumkan nama institusi dengan merangkul pingat emas dalam kejohanan reka cipta teknologi dan kecerdasan buatan peringkat kebangsaan.`,
        content: `Alhamdulillah, warga ${defaultSchool} meraikan detik bersejarah apabila pasukan murid sekolah berjaya merangkul johan dalam Pertandingan Inovasi & Robotik Sekolah-Sekolah Malaysia 2026.\n\nPencapaian ini adalah hasil kegigihan para murid di bawah bimbingan guru penasihat STEM yang komited meluangkan masa membina model prototaip pintar berasaskan automasi lestari.\n\n"Kejayaan ini membuktikan murid-murid sekolah Islam berupaya bersaing dan mendahului dalam bidang sains teknologi, mengintegrasikan adab, kefahaman syariah dan kehebatan daya cipta," ulas pentadbiran sekolah.\n\nPihak pentadbiran ${defaultSchool} merakamkan setinggi-tinggi tahniah kepada para pemenang, barisan guru pembimbing, dan ibu bapa atas sokongan padu yang berterusan.`,
        imageUrl: PRESET_NEWS_IMAGES[0].url,
        isSchoolAchievement: true,
      }));
      setUploadedImageDetails(null);
    } else if (type === 'akademik') {
      setFormData((prev) => ({
        ...prev,
        title: `${defaultSchool} Catat Peningkatan Gred Purata & 100% Lulus Tahfiz Serta Peperiksaan Utama`,
        achievementLevel: 'Negeri',
        category: 'Kejayaan Akademik & Tahfiz',
        summary: `Keputusan rasmi terkini menyaksikan lonjakan kualiti akademik dan pencapaian cemerlang murid ${defaultSchool} dengan rekod kelulusan syahadah tahfiz yang membanggakan.`,
        content: `Majlis Pengetua Guru Besar Sekolah Islam Malaysia (MPGBSIM) mengucapkan setinggi-tinggi tahniah kepada ${defaultSchool} atas keputusan cemerlang yang dicatatkan dalam penilaian akademik dan pentaksiran tahfiz baru-baru ini.\n\nSeramai 45 orang murid berjaya menyempurnakan hafazan mengikut sukatan kurikulum bersepadu dengan gred Mumtaz, di samping peningkatan ketara pada Gred Purata Sekolah (GPS).\n\nKejayaan ini mencerminkan keberkesanan modul bimbingan rohani dan disiplin hafazan yang digarap secara sistematik oleh saf tenaga pengajar ${defaultSchool}.\n\nSemoga kecemerlangan ini menjadi penyuntik semangat kepada seluruh warga sekolah untuk terus melahirkan generasi huffaz yang berwibawa, berakhlak mulia dan cemerlang ilmu.`,
        imageUrl: PRESET_NEWS_IMAGES[1].url,
        isSchoolAchievement: true,
      }));
      setUploadedImageDetails(null);
    } else if (type === 'sukan') {
      setFormData((prev) => ({
        ...prev,
        title: `Kontinjen ${defaultSchool} Dominasi Kejohanan Sukan Memanah & Seni Silat Sekolah Islam`,
        achievementLevel: 'Kebangsaan',
        category: 'Kokurikulum & Sukan',
        summary: `Atlet murid ${defaultSchool} berjaya membawa pulang 4 pingat emas dan piala pusingan dalam kejohanan sukan sunnah dan silat peringkat kebangsaan.`,
        content: `Kontinjen sukan ${defaultSchool} telah melakarkan kejayaan manis apabila berjaya membawa pulang 4 pingat emas dan dinobatkan sebagai Juara Keseluruhan dalam Kejohanan Sukan Sunnah & Seni Memanah Tradisional 2026.\n\nPara atlet mempamerkan disiplin tinggi, fokus jitu dan semangat kesukanan yang terpuji sepanjang berlangsungnya kejohanan tersebut.\n\n"Aktiviti sukan sunnah ini bukan sahaja melatih ketangkasan fizikal malah membentuk ketenangan emosi dan sahsiah kepimpinan yang kukuh dalam jiwa anak-anak murid," ulas pihak sekolah.\n\nSyabas dan tahniah diucapkan kepada semua atlet, jurulatih, dan warga ${defaultSchool}!`,
        imageUrl: PRESET_NEWS_IMAGES[2].url,
        isSchoolAchievement: true,
      }));
      setUploadedImageDetails(null);
    } else if (type === 'kenyataan_media') {
      setFormData((prev) => ({
        ...prev,
        title: `Kenyataan Media Rasmi MPGBSIM: Memperkasa Kurikulum Bersepadu & Kepimpinan Sekolah Islam Malaysia`,
        achievementLevel: 'Kebangsaan',
        category: 'Kenyataan Media',
        summary: `Majlis Pengetua Guru Besar Sekolah Islam Malaysia menegaskan komitmen berterusan dalam memperkasakan kualiti pengurusan institusi dan sahsiah murabbi.`,
        content: `KUALA LUMPUR — Majlis Pengetua Guru Besar Sekolah Islam Malaysia (MPGBSIM) mengeluarkan kenyataan rasmi berhubung hala tuju pemerkasaan pendidikan Islam di seluruh negara.\n\nInisiatif ini merangkumi pengukuhan kurikulum bersepadu, standard pensijilan tahfiz, serta pemantapan kompetensi digital bagi barisan pengetua dan guru besar.\n\nMPGBSIM menyeru semua institusi ahli untuk terus bersinergi dalam menjayakan agenda transformasi pendidikan ummah yang berteraskan kecemerlangan adab dan intelek.`,
        imageUrl: PRESET_NEWS_IMAGES[4].url,
        isSchoolAchievement: false,
      }));
      setUploadedImageDetails(null);
    }
  };

  const newsList: NewsItem[] = siteData.news || [];
  const sortedNewsList: NewsItem[] = sortNewsByPublishedDate<NewsItem>(newsList);
  const filteredNews: NewsItem[] = sortedNewsList.filter((item) => {
    const itemStatus = item.status || 'published';
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.schoolName && item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || itemStatus === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      date: formatToMalayDate(new Date()),
    });
    setEditingId(null);
    setUploadedImageDetails(null);
    setImageError('');
    setIsEditing(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setFormData({
      title: item.title,
      slug: item.slug || item.title.toLowerCase().replace(/\s+/g, '-'),
      summary: item.summary,
      content: item.content,
      category: item.category || 'Kejayaan Sekolah',
      achievementLevel: item.achievementLevel || 'Kebangsaan',
      schoolName: item.schoolName || 'Sekolah Ahli MPGBSIM',
      schoolCode: item.schoolCode || 'MPGB-AHLI',
      state: item.state || 'Selangor',
      date: item.date || formatToMalayDate(new Date()),
      author: item.author || 'Urus Setia MPGBSIM',
      readTime: item.readTime || '3 minit bacaan',
      imageUrl: item.imageUrl || PRESET_NEWS_IMAGES[0].url,
      featured: !!item.featured,
      status: item.status || 'published',
      scheduleDate: item.scheduleDate || '',
      isSchoolAchievement: item.isSchoolAchievement ?? true,
    });
    setEditingId(item.id);
    if (item.imageUrl?.startsWith('data:')) {
      setUploadedImageDetails({ name: 'Foto Dimuat Naik Sebelumnya', size: 'Sedia' });
    } else {
      setUploadedImageDetails(null);
    }
    setImageError('');
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const submissionData = {
      ...formData,
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      content: formData.content.trim(),
      category: formData.category || 'Kejayaan Sekolah',
      achievementLevel: formData.achievementLevel || 'Kebangsaan',
      schoolName: formData.schoolName?.trim() || 'Sekolah Ahli MPGBSIM',
      schoolCode: formData.schoolCode?.trim() || 'MPGB-AHLI',
      state: formData.state || 'Selangor',
      date: formData.date?.trim() || formatToMalayDate(new Date()),
      imageUrl: formData.imageUrl?.trim() || PRESET_NEWS_IMAGES[0].url,
      isSchoolAchievement: formData.isSchoolAchievement ?? true,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateNews(editingId, submissionData);
      setNotificationMsg({
        type: 'success',
        text: `Berita "${formData.title}" berjaya dikemaskini.`,
      });
    } else {
      const newId = `news-${Date.now()}`;
      addNews({
        ...submissionData,
        id: newId,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
      });
      setNotificationMsg({
        type: 'success',
        text: `Berita "${formData.title}" berjaya dicipta dan diterbitkan secara langsung ke laman web.`,
      });
    }
    setIsEditing(false);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleToggleStatus = (item: NewsItem) => {
    const currentStatus = item.status || 'published';
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    updateNews(item.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notificationMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                notificationMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            />
            <span>{notificationMsg.text}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Pengurusan Berita & Kejayaan Sekolah</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cipta, sunting, jadualkan dan terbitkan berita pencapaian sekolah serta warta rasmi ke portal MPGBSIM.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Berita Baharu</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tajuk berita, sekolah, pengarang, atau kata kunci..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">Semua Status</option>
            <option value="published">Diterbitkan (Published)</option>
            <option value="draft">Draf (Draft)</option>
            <option value="scheduled">Terjadual (Scheduled)</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* News Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Sub-header with Sorting Info */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Senarai Berita ({filteredNews.length})</span>
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md border border-teal-200">
              <Calendar className="w-3 h-3 text-teal-700" />
              <span>Disusun Mengikut Tarikh Diterbitkan (Terkini di Atas)</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500">
            Klik ikon pensel untuk menyunting tajuk, tarikh siaran, atau kandungan berita
          </span>
        </div>

        {filteredNews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Tiada berita dijumpai mengikut tapisan semasa.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNews.map((item) => {
              const status = item.status || 'published';
              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={item.imageUrl || PRESET_NEWS_IMAGES[0].url}
                      alt={item.title}
                      className="w-20 h-16 object-cover rounded-xl shrink-0 bg-slate-100 border border-slate-200"
                      onError={(e) => {
                        (e.target as any).src = PRESET_NEWS_IMAGES[0].url;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold">
                          {item.category}
                        </span>
                        {item.achievementLevel && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            🏆 {item.achievementLevel}
                          </span>
                        )}
                        {item.schoolName && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 flex items-center gap-1">
                            <Building className="w-2.5 h-2.5 text-teal-600" />
                            <span>{item.schoolName}</span>
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'draft'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {status === 'published' ? 'Diterbitkan' : status === 'draft' ? 'Draf' : 'Terjadual'}
                        </span>
                        {item.featured && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                            Pilihan Utama
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">{item.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.summary}</p>
                      {item.scheduleDate && status === 'scheduled' && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Dikeluarkan pada: {new Date(item.scheduleDate).toLocaleString('ms-MY')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        status === 'published'
                          ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                          : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      {status === 'published' ? 'Tukar ke Draf' : 'Terbitkan'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Sunting Berita"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Padam Berita"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal - Full Template matching Portal Ahli */}
      {isEditing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-6xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-6 animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Top Banner with Live Broadcast Indicator */}
            <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-5 sm:p-6 text-white shadow-lg border border-teal-800 relative overflow-hidden mb-5 shrink-0">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2 backdrop-blur-xs">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                    </span>
                    <span>Siaran Langsung Ke Laman Utama Rasmi MPGBSIM</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
                    <span>{editingId ? 'Kemaskini Berita / Kejayaan Sekolah' : 'Cipta Berita & Kejayaan Sekolah Baharu'}</span>
                  </h3>
                  <p className="text-xs text-teal-100/90 mt-1 max-w-2xl">
                    Format borang seragam dengan Portal Ahli. Berita yang disiarkan akan dipaparkan secara langsung di seksyen Berita laman web utama MPGBSIM.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="self-start sm:self-center p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Tutup Borang"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2-Column Responsive Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Main Form (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Quick Fill Templates (Matching Portal Ahli) */}
                  {!editingId && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Templat Pantas (Pilih untuk isi draf secara automatik seperti Portal Ahli):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyTemplate('robotik')}
                          className="px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 shadow-xs transition-colors cursor-pointer"
                        >
                          🤖 Robotik & STEM
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate('akademik')}
                          className="px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 shadow-xs transition-colors cursor-pointer"
                        >
                          📖 Tahfiz & Akademik
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate('sukan')}
                          className="px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 shadow-xs transition-colors cursor-pointer"
                        >
                          🏹 Sukan Sunnah & Memanah
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate('kenyataan_media')}
                          className="px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 shadow-xs transition-colors cursor-pointer"
                        >
                          📢 Kenyataan Media Rasmi
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} id="adminNewsForm" className="space-y-5 text-xs">
                    {/* Tajuk Berita */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tajuk Berita Kejayaan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Contoh: SRI Musleh Melaka Merangkul Johan Pertandingan Robotik Antarabangsa 2026"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all bg-white"
                      />
                    </div>

                    {/* Peringkat Kejayaan & Kategori Berita */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Peringkat Kejayaan
                        </label>
                        <select
                          value={formData.achievementLevel || 'Kebangsaan'}
                          onChange={(e) => setFormData({ ...formData, achievementLevel: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 bg-white text-xs sm:text-sm font-medium text-slate-800"
                        >
                          {ACHIEVEMENT_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              Peringkat {lvl}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Kategori Berita
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 bg-white text-xs sm:text-sm font-medium text-slate-800"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tarikh Siaran Berita / Diterbitkan (Published Date) */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 via-emerald-50/50 to-slate-50 border border-teal-200 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-teal-700" />
                          <span>Tarikh Siaran / Diterbitkan (Published Date)</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full border border-teal-300 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-teal-700" />
                          <span>Turutan Web: Berita disusun mengikut tarikh terkini</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Date Picker Input */}
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Pilih Tarikh Kalendar:
                          </label>
                          <input
                            type="date"
                            required
                            value={toInputDateFormat(formData.date)}
                            onChange={(e) => {
                              if (e.target.value) {
                                setFormData({ ...formData, date: formatToMalayDate(e.target.value) });
                              }
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 bg-white text-xs sm:text-sm font-bold text-slate-900 shadow-2xs cursor-pointer"
                          />
                        </div>

                        {/* Formatted Date Display & Quick Action Buttons */}
                        <div className="sm:col-span-6 space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Format Tarikh Dipaparkan di Laman Web:
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 px-3 py-2 rounded-xl bg-white border border-teal-200 text-xs font-bold text-teal-950 shadow-2xs truncate flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="truncate">{formData.date || formatToMalayDate(new Date())}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, date: formatToMalayDate(new Date()) })}
                                className="px-2.5 py-2 rounded-xl bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                                title="Set tarikh ke hari ini"
                              >
                                Hari Ini
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const y = new Date();
                                  y.setDate(y.getDate() - 1);
                                  setFormData({ ...formData, date: formatToMalayDate(y) });
                                }}
                                className="px-2.5 py-2 rounded-xl bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                                title="Set tarikh ke semalam"
                              >
                                Semalam
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 pt-0.5">
                        * Tarikh ini akan dipaparkan pada kad berita di laman utama dan menentukan kedudukan susunan berita secara kronologi mengikut tarikh terkini.
                      </p>
                    </div>

                    {/* Maklumat Institusi & Pengarang */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Building className="w-3.5 h-3.5 text-teal-700" />
                        <span>Maklumat Institusi & Pelapor</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Nama Sekolah / Institusi
                          </label>
                          <input
                            type="text"
                            value={formData.schoolName || ''}
                            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                            placeholder="cth: SRI Musleh Melaka"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Kod Sekolah / No Keahlian
                          </label>
                          <input
                            type="text"
                            value={formData.schoolCode || ''}
                            onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                            placeholder="cth: MPGB-AHLI-01"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Negeri
                          </label>
                          <select
                            value={formData.state || 'Selangor'}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-100"
                          >
                            {MALAYSIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Pengarang / Urus Setia
                          </label>
                          <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            placeholder="cth: Pengetua / Urus Setia"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ringkasan Berita (Teaser) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Ringkasan Berita (Lead / Teaser Kad Muka Depan) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400">1 - 3 ayat ringkas</span>
                      </div>
                      <textarea
                        required
                        rows={2}
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        placeholder="Ringkasan padat pencapaian yang akan dipaparkan pada kad hadapan di laman utama MPGBSIM..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-white"
                      />
                    </div>

                    {/* Kandungan Penuh Berita */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kandungan Penuh Berita Kejayaan <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Tulis butiran lanjut pencapaian: nama pemenang/peserta, nama guru pembimbing, ulasan Pengetua/Guru Besar/Urus Setia, impak kejayaan kepada sekolah dan kata-kata inspirasi..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed font-sans bg-white"
                      />
                    </div>

                    {/* Pilihan Gambar Kejayaan - Dedicated Upload Button (No URL required) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Foto / Gambar Kejayaan Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Muat Naik Terus Dari Peranti (Tanpa URL)</span>
                        </span>
                      </div>

                      {/* Hidden File Input for Device/Phone/Computer Upload */}
                      <input
                        ref={adminFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAdminImageUpload}
                      />

                      {/* Upload Status & Preview Card */}
                      {formData.imageUrl && (uploadedImageDetails || formData.imageUrl.startsWith('data:')) ? (
                        /* State: Custom photo uploaded */
                        <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/50 p-4 transition-all shadow-xs">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                            <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-900 border border-emerald-300 shadow-md shrink-0">
                              <img
                                src={formData.imageUrl || PRESET_NEWS_IMAGES[0].url}
                                alt="Foto dimuat naik"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-600 text-white shadow-xs">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0 text-center sm:text-left">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold mb-1.5 shadow-xs">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Foto Berjaya Dimuat Naik & Sedia Disiarkan</span>
                              </div>
                              <p className="text-xs font-bold text-slate-900 truncate" title={uploadedImageDetails?.name || 'Foto Berita'}>
                                {uploadedImageDetails?.name || 'Foto Berita Kejayaan'}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {uploadedImageDetails?.size ? `Saiz Fail: ${uploadedImageDetails.size}` : 'Imej dioptimumkan untuk kelajuan web'}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <button
                                  type="button"
                                  onClick={() => adminFileInputRef.current?.click()}
                                  disabled={isUploadingPhoto}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5 text-teal-700" />
                                  <span>Tukar Foto Lain</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Padam Foto</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* State: Primary Upload Area */
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`rounded-2xl border-2 border-dashed p-6 transition-all text-center ${
                            isDragging
                              ? 'border-teal-600 bg-teal-50/90 scale-[1.01]'
                              : 'border-slate-300 bg-slate-50/80 hover:bg-slate-50 hover:border-teal-500'
                          }`}
                        >
                          <div className="max-w-md mx-auto flex flex-col items-center">
                            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3 shadow-inner">
                              {isUploadingPhoto ? (
                                <RefreshCw className="w-7 h-7 animate-spin text-teal-700" />
                              ) : (
                                <Upload className="w-7 h-7 text-teal-700" />
                              )}
                            </div>

                            <h4 className="text-sm font-extrabold text-slate-900">
                              {isUploadingPhoto
                                ? 'Sedang Memproses & Mengoptimumkan Foto...'
                                : 'Muat Naik Foto / Gambar Kejayaan'}
                            </h4>

                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                              Pilih foto aktiviti atau murid cemerlang terus dari peranti anda tanpa perlu menggunakan pautan URL.
                            </p>

                            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                              <button
                                type="button"
                                onClick={() => adminFileInputRef.current?.click()}
                                disabled={isUploadingPhoto}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                              >
                                <Camera className="w-4 h-4" />
                                <span>Pilih & Muat Naik Foto Dari Peranti</span>
                              </button>
                            </div>

                            <p className="text-[10px] text-slate-400 mt-2.5">
                              Menyokong format JPG, PNG, WebP (Dioptimumkan secara automatik untuk pemuatan laju)
                            </p>
                          </div>
                        </div>
                      )}

                      {imageError && (
                        <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{imageError}</span>
                        </p>
                      )}

                      {/* Preset HD Image Gallery Selection matching Portal Ahli */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-600">
                            Atau pilih daripada foto contoh resolusi tinggi galeri:
                          </span>
                          {formData.imageUrl && !uploadedImageDetails && !formData.imageUrl.startsWith('data:') && (
                            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                              Foto dipilih daripada galeri
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {PRESET_NEWS_IMAGES.map((img, idx) => {
                            const isSelected =
                              formData.imageUrl === img.url &&
                              !uploadedImageDetails &&
                              !formData.imageUrl.startsWith('data:');
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, imageUrl: img.url }));
                                  setUploadedImageDetails(null);
                                }}
                                className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-teal-600 ring-2 ring-teal-200'
                                    : 'border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={img.label}
                                  className="w-full h-14 sm:h-16 object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="p-1 bg-slate-900/80 text-white text-[9px] font-bold truncate">
                                  {img.label}
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1 right-1 p-0.5 rounded-full bg-teal-600 text-white shadow-xs">
                                    <Check className="w-2.5 h-2.5" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Status Penerbitan & Jadual */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Status Penerbitan
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                          >
                            <option value="published">Diterbitkan Serta-Merta (Published)</option>
                            <option value="draft">Simpan Sebagai Draf (Draft)</option>
                            <option value="scheduled">Jadualkan Penerbitan (Scheduled)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Masa Anggaran Bacaan
                          </label>
                          <input
                            type="text"
                            value={formData.readTime}
                            onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                          />
                        </div>
                      </div>

                      {formData.status === 'scheduled' && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                          <label className="block font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Tarikh & Masa Jadual</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.scheduleDate}
                            onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-600 bg-white"
                          />
                        </div>
                      )}

                      <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Cadangkan Sebagai Berita Pilihan Utama (Featured)
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Akan dipaparkan pada kad besar di muka depan laman web jika dipilih.
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>{editingId ? 'Simpan Perubahan Berita' : 'Cipta & Siarkan Berita'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: Real-time Live Preview (5 cols) matching Portal Ahli */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="sticky top-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        <Eye className="w-4 h-4 text-teal-600" />
                        <span>Pratonton Langsung di Laman Web</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Live Preview
                      </span>
                    </div>

                    {/* Simulated Card on Website */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={formData.imageUrl || PRESET_NEWS_IMAGES[0].url}
                          alt={formData.title || 'Pratonton Berita'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        {/* Category Pill */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md">
                          {formData.category}
                        </span>

                        {/* Achievement Level Pill */}
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-900/90 text-teal-200 border border-teal-500/40 backdrop-blur-xs">
                          {formData.achievementLevel || 'Kebangsaan'}
                        </span>

                        {/* School Badge Pill on bottom of image */}
                        <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5 text-xs text-white">
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold truncate text-teal-100">
                            {formData.schoolName || 'Sekolah Ahli MPGBSIM'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-teal-600" />
                            {formData.date || 'Hari ini'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formData.readTime || '3 minit bacaan'}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2 line-clamp-2">
                          {formData.title || 'Tajuk Berita Kejayaan Sekolah Anda Akan Muncul Di Sini...'}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                          {formData.summary ||
                            'Ringkasan berita akan dipaparkan di sini untuk pembaca di laman utama MPGBSIM sebelum membaca laporan penuh...'}
                        </p>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="truncate max-w-[170px] flex items-center gap-1 font-semibold text-slate-700">
                            <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            {formData.author || 'Urus Setia MPGBSIM'}
                          </span>

                          <span className="font-bold text-teal-700 inline-flex items-center gap-1">
                            <span>Baca Penuh</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        Kad ini memaparkan pratonton tepat bagaimana artikel anda akan muncul kepada pelawat di laman web utama MPGBSIM.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900">Padam Berita?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Adakah anda pasti ingin memadamkan berita ini secara kekal daripada sistem CMS MPGBSIM?
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-900 line-clamp-2">
                {itemToDelete.title}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">
                  {itemToDelete.category}
                </span>
                <span>•</span>
                <span>{itemToDelete.date}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 font-semibold">
              Amaran: Tindakan ini tidak boleh diundur. Berita ini akan dipadamkan daripada laman utama serta-merta.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sedang Memadam...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Sahkan Padam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

