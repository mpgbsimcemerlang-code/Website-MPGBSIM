import React, { useState, useMemo, useRef } from 'react';
import {
  CreditCard,
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
  DollarSign,
  Building2,
  Calendar,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Tag,
  Receipt,
  UserCheck,
  ZoomIn,
  X,
  FileCheck,
  BadgeAlert,
  ArrowUpDown,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { FeeCategoryItem, FeePaymentRecord } from '../../types';
import { DEFAULT_FEE_CATEGORIES } from '../../data/defaultFeeCategories';
import { formatToMalayDate } from '../../utils/dateUtils';
import { compressDataUrl } from '../../utils/imageCompressor';

export const AdminFeeManagement: React.FC = () => {
  const { siteData, addFeeCategory, updateFeeCategory, deleteFeeCategory, resetFeeCategoriesToDefault } =
    useAdminContent();
  const {
    feePayments = [],
    updateFeePaymentStatus,
    updateFeePaymentProof,
    deleteFeePayment,
    recordFeePayment,
    currentUser,
  } = useMemberPortal();

  // Active Main Sub-Tab: 'ledger' (Buku Lejer Bendahari) vs 'categories' (Pengurusan Kategori Yuran)
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'categories'>('ledger');

  // Active categories from siteData or default
  const feeCategories: FeeCategoryItem[] = useMemo(() => {
    return siteData.feeCategories && siteData.feeCategories.length > 0
      ? siteData.feeCategories
      : DEFAULT_FEE_CATEGORIES;
  }, [siteData.feeCategories]);

  // --- LEDGER STATE (Buku Lejer Bendahari) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'BERJAYA' | 'DALAM_SEMAKAN' | 'DIBATALKAN'>('ALL');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('ALL');

  // Modals for Ledger
  const [viewingProofRecord, setViewingProofRecord] = useState<FeePaymentRecord | null>(null);
  const [uploadingProofRecord, setUploadingProofRecord] = useState<FeePaymentRecord | null>(null);
  const [viewingReceiptRecord, setViewingReceiptRecord] = useState<FeePaymentRecord | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<FeePaymentRecord | null>(null);

  // File Upload State
  const [uploadedProofData, setUploadedProofData] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isCompressingProof, setIsCompressingProof] = useState(false);
  const proofFileInputRef = useRef<HTMLInputElement>(null);

  // --- CATEGORIES STATE (Pengurusan Kategori Yuran) ---
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<FeeCategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<FeeCategoryItem | null>(null);

  // Form State for Category
  const [catName, setCatName] = useState('');
  const [catShortName, setCatShortName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catAmount, setCatAmount] = useState<number>(300);
  const [catType, setCatType] = useState<'Semua' | 'Ahli Biasa' | 'Ahli Bersekutu' | 'Lain-lain'>('Ahli Biasa');
  const [catCriteria, setCatCriteria] = useState('');
  const [catClause, setCatClause] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSession, setCatSession] = useState('2026/2027');
  const [catGatewayUrl, setCatGatewayUrl] = useState('https://app.herepay.org/mpgbsim');
  const [catFeatures, setCatFeatures] = useState<string>('');
  const [catIsActive, setCatIsActive] = useState(true);

  // Form State for Manual Fee Entry
  const [manualSchoolName, setManualSchoolName] = useState('');
  const [manualSchoolCode, setManualSchoolCode] = useState('');
  const [manualPayerName, setManualPayerName] = useState('');
  const [manualPayerEmail, setManualPayerEmail] = useState('');
  const [manualPayerPhone, setManualPayerPhone] = useState('');
  const [manualCategoryCode, setManualCategoryCode] = useState<string>(
    feeCategories[0]?.code || 'YURAN_AHLI_BAWAH_300'
  );
  const [manualAmount, setManualAmount] = useState<number>(300);
  const [manualMethod, setManualMethod] = useState('HerePay (DuitNow QR)');
  const [manualRef, setManualRef] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualStatus, setManualStatus] = useState<'BERJAYA' | 'DALAM_SEMAKAN'>('BERJAYA');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSession, setManualSession] = useState('2026/2027');

  // Filtered Fee Payments for Ledger
  const filteredPayments = useMemo(() => {
    return feePayments.filter((p) => {
      // Category filter
      if (selectedCategoryFilter !== 'ALL' && p.category !== selectedCategoryFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'ALL' && p.status !== selectedStatusFilter) {
        return false;
      }
      // Session filter
      if (selectedSessionFilter !== 'ALL' && p.academicSession !== selectedSessionFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sName = (p.schoolName || '').toLowerCase();
        const sCode = (p.schoolCode || '').toLowerCase();
        const pName = (p.payerName || '').toLowerCase();
        const ref = (p.transactionRef || '').toLowerCase();
        const cat = (p.categoryLabel || '').toLowerCase();
        if (
          !sName.includes(q) &&
          !sCode.includes(q) &&
          !pName.includes(q) &&
          !ref.includes(q) &&
          !cat.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [feePayments, selectedCategoryFilter, selectedStatusFilter, selectedSessionFilter, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalCollected = feePayments
      .filter((p) => p.status === 'BERJAYA')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const filteredTotal = filteredPayments
      .filter((p) => p.status === 'BERJAYA')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const pendingCount = feePayments.filter((p) => p.status === 'DALAM_SEMAKAN').length;
    const successCount = feePayments.filter((p) => p.status === 'BERJAYA').length;
    const cancelledCount = feePayments.filter((p) => p.status === 'DIBATALKAN').length;

    return {
      totalCollected,
      filteredTotal,
      pendingCount,
      successCount,
      cancelledCount,
      totalRecords: feePayments.length,
    };
  }, [feePayments, filteredPayments]);

  // All Academic Sessions present in payments
  const academicSessions = useMemo(() => {
    const set = new Set<string>();
    set.add('2026/2027');
    set.add('2025/2026');
    feePayments.forEach((p) => {
      if (p.academicSession) set.add(p.academicSession);
    });
    return Array.from(set);
  }, [feePayments]);

  // --- CATEGORY ACTIONS ---
  const handleOpenAddCategory = () => {
    setCatName('');
    setCatShortName('');
    setCatCode(`YURAN_KHAS_${Date.now().toString().slice(-4)}`);
    setCatAmount(300);
    setCatType('Ahli Biasa');
    setCatCriteria('Semua Enrolmen Murid');
    setCatClause('Fasal 6 Perlembagaan');
    setCatDesc('');
    setCatSession('2026/2027');
    setCatGatewayUrl('https://app.herepay.org/mpgbsim');
    setCatFeatures('Akses penuh Portal Ahli\nSijil Keahlian Rasmi\nHak mengundi dalam mesyuarat');
    setCatIsActive(true);
    setCategoryModalMode('add');
    setEditingCategory(null);
  };

  const handleOpenEditCategory = (item: FeeCategoryItem) => {
    setEditingCategory(item);
    setCatName(item.name);
    setCatShortName(item.shortName || item.name);
    setCatCode(item.code);
    setCatAmount(item.amount);
    setCatType(item.membershipType || 'Ahli Biasa');
    setCatCriteria(item.enrollmentCriteria || '');
    setCatClause(item.clause || '');
    setCatDesc(item.description || '');
    setCatSession(item.academicSession || '2026/2027');
    setCatGatewayUrl(item.gatewayUrl || 'https://app.herepay.org/mpgbsim');
    setCatFeatures(Array.isArray(item.features) ? item.features.join('\n') : '');
    setCatIsActive(item.isActive !== false);
    setCategoryModalMode('edit');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert('Sila masukkan nama kategori yuran.');
      return;
    }
    const cleanAmount = Number(catAmount);
    if (isNaN(cleanAmount) || cleanAmount < 0) {
      alert('Sila masukkan amaun yuran (RM) yang sah.');
      return;
    }

    const featureList = catFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (categoryModalMode === 'add') {
      const newCat: FeeCategoryItem = {
        id: `fee-cat-${Date.now()}`,
        code: catCode.trim().toUpperCase() || `YURAN_CUSTOM_${Date.now()}`,
        name: catName.trim(),
        shortName: catShortName.trim() || catName.trim(),
        amount: cleanAmount,
        membershipType: catType,
        enrollmentCriteria: catCriteria.trim() || undefined,
        clause: catClause.trim() || undefined,
        description: catDesc.trim() || undefined,
        features: featureList.length > 0 ? featureList : undefined,
        academicSession: catSession.trim() || '2026/2027',
        gatewayUrl: catGatewayUrl.trim() || 'https://app.herepay.org/mpgbsim',
        badge: catShortName.trim() || catName.trim(),
        badgeColor:
          catType === 'Ahli Biasa'
            ? 'bg-teal-100 text-teal-800 border-teal-200'
            : catType === 'Ahli Bersekutu'
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : 'bg-purple-100 text-purple-800 border-purple-200',
        isActive: catIsActive,
        isCustom: true,
        order: feeCategories.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addFeeCategory(newCat);
      alert(`Kategori yuran baharu "${newCat.name}" (RM ${newCat.amount}) telah berjaya ditambah.`);
    } else if (categoryModalMode === 'edit' && editingCategory) {
      await updateFeeCategory(editingCategory.id, {
        name: catName.trim(),
        shortName: catShortName.trim() || catName.trim(),
        code: catCode.trim().toUpperCase(),
        amount: cleanAmount,
        membershipType: catType,
        enrollmentCriteria: catCriteria.trim() || undefined,
        clause: catClause.trim() || undefined,
        description: catDesc.trim() || undefined,
        features: featureList.length > 0 ? featureList : undefined,
        academicSession: catSession.trim() || '2026/2027',
        gatewayUrl: catGatewayUrl.trim() || 'https://app.herepay.org/mpgbsim',
        badge: catShortName.trim() || catName.trim(),
        isActive: catIsActive,
      });
      alert(`Kategori yuran "${catName.trim()}" telah berjaya dikemas kini.`);
    }

    setCategoryModalMode(null);
    setEditingCategory(null);
  };

  const handleToggleCategoryActive = async (cat: FeeCategoryItem) => {
    const nextState = !cat.isActive;
    await updateFeeCategory(cat.id, { isActive: nextState });
  };

  const handleDeleteCategory = async (cat: FeeCategoryItem) => {
    if (confirm(`Adakah anda pasti mahu memadam kategori yuran "${cat.name}"?`)) {
      await deleteFeeCategory(cat.id);
      setCategoryToDelete(null);
    }
  };

  const handleResetCategories = async () => {
    if (
      confirm(
        'Adakah anda pasti mahu menetapkan semula semua kategori yuran kepada standard Fasal 6 Perlembagaan MPGBSIM?'
      )
    ) {
      await resetFeeCategoriesToDefault();
      alert('Semua kategori yuran telah dikembalikan kepada konfigurasi standard.');
    }
  };

  // --- PROOF UPLOAD HANDLER ---
  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Saiz fail bukti bayaran melebihi had maksimum 8MB.');
      return;
    }

    setIsCompressingProof(true);
    setUploadedFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const rawResult = evt.target?.result as string;
        try {
          if (file.type.startsWith('image/')) {
            const compressed = await compressDataUrl(rawResult, 1200, 0.85);
            setUploadedProofData(compressed);
          } else {
            setUploadedProofData(rawResult);
          }
        } catch {
          setUploadedProofData(rawResult);
        } finally {
          setIsCompressingProof(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('Error reading file:', err);
      setIsCompressingProof(false);
    }
  };

  const handleSaveUploadedProof = async () => {
    if (!uploadingProofRecord || !uploadedProofData) {
      alert('Sila pilih fail bukti pembayaran terlebih dahulu.');
      return;
    }

    await updateFeePaymentProof(uploadingProofRecord.id, uploadedProofData, uploadedFileName);
    alert(`Bukti pembayaran untuk rekod #${uploadingProofRecord.transactionRef} telah berjaya disimpan.`);
    setUploadingProofRecord(null);
    setUploadedProofData(null);
    setUploadedFileName('');
  };

  // --- STATUS CHANGE HANDLER ---
  const handleUpdateStatus = async (
    record: FeePaymentRecord,
    newStatus: 'BERJAYA' | 'DALAM_SEMAKAN' | 'DIBATALKAN'
  ) => {
    let notes = record.notes;
    if (newStatus === 'DIBATALKAN') {
      const reason = prompt('Sila nyatakan sebab penolakan/pembatalan transaksi yuran ini:');
      if (reason === null) return;
      notes = reason ? `Dibatalkan: ${reason}` : 'Dibatalkan oleh Bendahari';
    }

    const verifierName = currentUser?.fullName
      ? `${currentUser.fullName} (Bendahari MPGBSIM)`
      : 'Ustaz Bendahari Kehormat MPGBSIM';

    await updateFeePaymentStatus(record.id, newStatus, notes, verifierName);
  };

  // --- CSV EXPORT FOR BENDAHARI ---
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      alert('Tiada rekod pembayaran untuk dieksport.');
      return;
    }

    const headers = [
      'No Rujukan',
      'Kod Sekolah',
      'Nama Sekolah',
      'Pembayar',
      'Emel',
      'No Tel',
      'Kategori Yuran',
      'Jumlah (RM)',
      'Kaedah',
      'Tarikh Bayaran',
      'Status',
      'Sesi',
      'Disahkan Oleh',
      'Tarikh Disahkan',
      'Ada Bukti Muat Naik',
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.transactionRef || ''}"`,
      `"${p.schoolCode || ''}"`,
      `"${(p.schoolName || '').replace(/"/g, '""')}"`,
      `"${(p.payerName || '').replace(/"/g, '""')}"`,
      `"${p.payerEmail || ''}"`,
      `"${p.payerPhone || ''}"`,
      `"${(p.categoryLabel || '').replace(/"/g, '""')}"`,
      p.amount,
      `"${p.paymentMethod || ''}"`,
      `"${p.paymentDate || ''}"`,
      `"${p.status}"`,
      `"${p.academicSession || ''}"`,
      `"${p.verifiedBy || ''}"`,
      `"${p.verifiedAt || ''}"`,
      p.paymentProofUrl || p.receiptUrl ? 'YA' : 'TIDAK',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lejer_Yuran_MPGBSIM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- MANUAL ENTRY SUBMISSION ---
  const handleSaveManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSchoolName.trim()) {
      alert('Sila masukkan nama sekolah.');
      return;
    }
    if (!manualPayerName.trim()) {
      alert('Sila masukkan nama pembayar / PGB.');
      return;
    }
    const cleanAmount = Number(manualAmount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      alert('Sila masukkan amaun yuran yang sah.');
      return;
    }

    const matchedCat = feeCategories.find((c) => c.code === manualCategoryCode) || feeCategories[0];
    const categoryLabel = matchedCat ? `${matchedCat.name}` : 'Yuran Keahlian MPGBSIM';

    const ref = manualRef.trim() || `MANUAL-${Date.now().toString().slice(-6)}`;

    await recordFeePayment({
      schoolName: manualSchoolName.trim(),
      schoolCode: manualSchoolCode.trim().toUpperCase() || 'MPGB-MANUAL',
      payerName: manualPayerName.trim(),
      payerEmail: manualPayerEmail.trim() || 'bendahari@mpgbsim.org',
      payerPhone: manualPayerPhone.trim(),
      category: manualCategoryCode,
      categoryLabel,
      amount: cleanAmount,
      paymentMethod: manualMethod,
      transactionRef: ref,
      paymentDate: manualDate,
      status: manualStatus,
      academicSession: manualSession,
      gateway: 'Manual',
      notes: manualNotes.trim() || 'Direkodkan secara manual oleh Bendahari MPGBSIM',
      paymentProofUrl: uploadedProofData || undefined,
      receiptUrl: uploadedProofData || undefined,
      proofFileName: uploadedFileName || undefined,
      proofUploadedAt: uploadedProofData ? new Date().toISOString() : undefined,
      verifiedBy:
        manualStatus === 'BERJAYA'
          ? currentUser?.fullName
            ? `${currentUser.fullName} (Bendahari MPGBSIM)`
            : 'Bendahari Kehormat MPGBSIM'
          : undefined,
      verifiedAt: manualStatus === 'BERJAYA' ? new Date().toISOString() : undefined,
    });

    alert(`Rekod bayaran manual bagi ${manualSchoolName} (RM ${cleanAmount}) telah berjaya disimpan.`);
    setIsManualModalOpen(false);
    // Reset manual form
    setManualSchoolName('');
    setManualSchoolCode('');
    setManualPayerName('');
    setManualPayerEmail('');
    setManualPayerPhone('');
    setManualAmount(300);
    setManualRef('');
    setManualNotes('');
    setUploadedProofData(null);
    setUploadedFileName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Biro Kewangan & Bendahari Kehormat
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-xs font-medium">
                Sesi 2026/2027
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pengurusan Kewangan, Yuran & Lejer Bendahari
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Pantau kutipan yuran keahlian sekolah Islam, semak bukti muat naik pembayaran (*payment proofs*),
              sahkan resit secara terus ke Firestore, dan kemaskini kategori kadar yuran majlis.
            </p>
          </div>

          {/* Sub-Tabs Switcher */}
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto shadow-inner">
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'ledger'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Buku Lejer & Rekod ({feePayments.length})</span>
              {stats.pendingCount > 0 && (
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black animate-pulse">
                  {stats.pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'categories'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Kategori Yuran ({feeCategories.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: BUKU LEJER BENDAHARI (REKOD BAYARAN & BUKTI PEMBAYARAN)       */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Kutipan Sah (BERJAYA)</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                RM {stats.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                {stats.successCount} transaksi berstatus berjaya
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Menunggu Semakan</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
                {stats.pendingCount} Rekod
              </div>
              <div className="text-[11px] text-amber-700 font-medium mt-1">
                {stats.pendingCount > 0 ? 'Perlu semakan bukti bayaran' : 'Semua telah disemak'}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Kutipan Paparan Semasa</span>
                <Filter className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-teal-700 font-mono">
                RM {stats.filteredTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                Berdasarkan {filteredPayments.length} rekod terpilih
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Kategori Yuran Aktif</span>
                <Tag className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {feeCategories.filter((c) => c.isActive).length} / {feeCategories.length}
              </div>
              <div className="text-[11px] text-indigo-600 font-medium mt-1">
                Kategori yuran sedia dipungut
              </div>
            </div>
          </div>

          {/* Action Toolbar & Filters */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama sekolah, kod sekolah, nama pembayar, atau no rujukan transaksi..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Rekod Bayaran Manual</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Eksport Lejer CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              {/* Category Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Tapis Mengikut Kategori Yuran:
                </label>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="ALL">Semua Kategori Yuran ({feeCategories.length})</option>
                  {feeCategories.map((cat) => (
                    <option key={cat.id} value={cat.code}>
                      {cat.name} (RM {cat.amount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Status Pengesahan:
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="BERJAYA">BERJAYA (Disahkan)</option>
                  <option value="DALAM_SEMAKAN">DALAM SEMAKAN (Menunggu Bukti/Kelulusan)</option>
                  <option value="DIBATALKAN">DIBATALKAN / Ditolak</option>
                </select>
              </div>

              {/* Academic Session Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Sesi Akademik:
                </label>
                <select
                  value={selectedSessionFilter}
                  onChange={(e) => setSelectedSessionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="ALL">Semua Sesi</option>
                  {academicSessions.map((session) => (
                    <option key={session} value={session}>
                      Sesi {session}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Senarai Transaksi Yuran & Bukti Muat Naik
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                  {filteredPayments.length} Rekod
                </span>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Klik butang pada bukti pembayaran untuk memeriksa slip atau sahkan transaksi
              </span>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Tiada rekod bayaran yuran dijumpai</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Cuba ubah penapis kategori yuran, status, atau masukkan rekod bayaran manual baharu.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter('ALL');
                    setSelectedStatusFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Set Semula Semua Penapis
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">No. Rujukan & Tarikh</th>
                      <th className="py-3 px-4">Sekolah & Pembayar</th>
                      <th className="py-3 px-4">Kategori Yuran</th>
                      <th className="py-3 px-4">Amaun (RM)</th>
                      <th className="py-3 px-4 text-center">Bukti Pembayaran</th>
                      <th className="py-3 px-4">Status & Pengesah</th>
                      <th className="py-3 px-4 text-right">Tindakan Bendahari</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((record) => {
                      const hasProof = Boolean(record.paymentProofUrl || record.receiptUrl);
                      const isSuccess = record.status === 'BERJAYA';
                      const isPending = record.status === 'DALAM_SEMAKAN';
                      const isCancelled = record.status === 'DIBATALKAN';

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Col 1: Ref & Date */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 block">
                              {record.transactionRef}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {record.paymentDate || '—'}
                            </span>
                            <span className="text-[10px] text-teal-800 font-medium">
                              {record.paymentMethod || 'HerePay'}
                            </span>
                          </td>

                          {/* Col 2: School & Payer */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                              {record.schoolName}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-800 block">
                              {record.schoolCode || 'MPGB'}
                            </span>
                            <span className="text-[11px] text-slate-600 truncate max-w-[200px] block">
                              {record.payerName}
                            </span>
                            {record.payerPhone && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {record.payerPhone}
                              </span>
                            )}
                          </td>

                          {/* Col 3: Category */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block leading-tight max-w-[200px]">
                              {record.categoryLabel}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Sesi {record.academicSession || '2026/2027'}
                            </span>
                          </td>

                          {/* Col 4: Amount */}
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-black text-sm text-slate-900 block">
                              RM {Number(record.amount || 0).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {record.gateway === 'Manual' ? 'Manual/CDM' : 'Gerbang Rasmi'}
                            </span>
                          </td>

                          {/* Col 5: Payment Proof Upload & Viewer */}
                          <td className="py-3.5 px-4 text-center">
                            {hasProof ? (
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setViewingProofRecord(record)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                  title="Buka paparan bukti pembayaran penuh"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Lihat Bukti</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadingProofRecord(record);
                                    setUploadedProofData(null);
                                    setUploadedFileName('');
                                  }}
                                  className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                                >
                                  Ganti Fail
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                  Tiada Bukti
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadingProofRecord(record);
                                    setUploadedProofData(null);
                                    setUploadedFileName('');
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Muat Naik</span>
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Col 6: Status & Verifier */}
                          <td className="py-3.5 px-4">
                            {isSuccess && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>BERJAYA</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>SEMAKAN</span>
                              </span>
                            )}
                            {isCancelled && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-[11px]">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>DIBATALKAN</span>
                              </span>
                            )}

                            {record.verifiedBy && (
                              <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[160px]" title={record.verifiedBy}>
                                Sah: <span className="font-semibold text-slate-700">{record.verifiedBy}</span>
                              </div>
                            )}
                            {record.verifiedAt && (
                              <div className="text-[9px] text-slate-400">
                                {new Date(record.verifiedAt).toLocaleDateString('ms-MY')}
                              </div>
                            )}
                          </td>

                          {/* Col 7: Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Status Action Buttons */}
                              {record.status !== 'BERJAYA' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(record, 'BERJAYA')}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                                  title="Sahkan Transaksi Sebagai Berjaya"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {record.status !== 'DALAM_SEMAKAN' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(record, 'DALAM_SEMAKAN')}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                                  title="Tandakan Sebagai Dalam Semakan"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}
                              {record.status !== 'DIBATALKAN' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(record, 'DIBATALKAN')}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                                  title="Tolak / Batalkan Transaksi Ini"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}

                              {/* View Official Receipt */}
                              <button
                                type="button"
                                onClick={() => setViewingReceiptRecord(record)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                title="Lihat & Cetak Resit Rasmi MPGBSIM"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>

                              {/* Delete Record */}
                              <button
                                type="button"
                                onClick={() => setRecordToDelete(record)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 transition cursor-pointer"
                                title="Padam Rekod Pembayaran"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PENGURUSAN KATEGORI YURAN (BOLEH DIEDIT & DITAMBAH)            */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          {/* Header Actions for Categories */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Penyelarasan Kategori & Kadar Yuran Majlis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Tambah kategori yuran baharu atau kemaskini kadar yuran perlembagaan. Semua kategori aktif
                akan segera dicerminkan dalam borang pembayaran portal dan laman web rasmi.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetCategories}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
                title="Kembalikan kepada kategori asal Fasal 6"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Set Semula Standard</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Kategori Baharu</span>
              </button>
            </div>
          </div>

          {/* Fee Categories Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feeCategories.map((cat, idx) => {
              const isStandard = !cat.isCustom;
              return (
                <div
                  key={cat.id || idx}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs ${
                    cat.isActive
                      ? 'border-slate-200 hover:border-emerald-500 hover:shadow-md'
                      : 'border-slate-200/60 bg-slate-50/70 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Badge & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          cat.badgeColor || 'bg-teal-100 text-teal-800 border-teal-200'
                        }`}
                      >
                        {cat.membershipType}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCategoryActive(cat)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer ${
                            cat.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {cat.isActive ? 'Aktif' : 'Nyahaktif'}
                        </button>
                        {cat.isCustom && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                            Kategori Baharu
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category Title & Amount */}
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{cat.name}</h4>
                      {cat.clause && (
                        <span className="text-[11px] font-mono font-semibold text-emerald-800 block mt-0.5">
                          {cat.clause}
                        </span>
                      )}
                    </div>

                    {/* Amount Tag */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Kadar Yuran:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-slate-400">RM</span>
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          {cat.amount.toFixed(0)}
                        </span>
                        <span className="text-[11px] text-slate-500">/ tahun</span>
                      </div>
                    </div>

                    {/* Criteria and details */}
                    <div className="space-y-1 text-xs text-slate-600">
                      {cat.enrollmentCriteria && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Enrolmen:</span>
                          <span className="font-semibold text-slate-700">{cat.enrollmentCriteria}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Sesi:</span>
                        <span className="font-mono text-slate-700">{cat.academicSession || '2026/2027'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Kod Sistem:</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                          {cat.code}
                        </span>
                      </div>
                    </div>

                    {cat.description && (
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    )}

                    {/* Features preview */}
                    {Array.isArray(cat.features) && cat.features.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        {cat.features.slice(0, 2).map((feat, fIdx) => (
                          <div key={fIdx} className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(cat)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Kemaskini</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 transition cursor-pointer"
                      title="Padam Kategori Yuran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LIHAT BUKTI PEMBAYARAN RESOLUSI TINGGI (PROOF VIEWER)            */}
      {/* ========================================================================= */}
      {viewingProofRecord && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Bukti Pembayaran Yuran Rasmi
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Ref: {viewingProofRecord.transactionRef} • {viewingProofRecord.schoolName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProofRecord(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Image / File View */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Summary Bar */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Kategori Yuran:</span>
                  <span className="font-bold text-slate-900">{viewingProofRecord.categoryLabel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Jumlah:</span>
                  <span className="font-black text-emerald-800 font-mono text-sm">
                    RM {Number(viewingProofRecord.amount).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Pembayar / Tarikh:</span>
                  <span className="font-semibold text-slate-800">
                    {viewingProofRecord.payerName} ({viewingProofRecord.paymentDate})
                  </span>
                </div>
              </div>

              {/* Image Preview Container */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900/5 p-2 flex items-center justify-center min-h-[300px]">
                {viewingProofRecord.paymentProofUrl || viewingProofRecord.receiptUrl ? (
                  <img
                    src={viewingProofRecord.paymentProofUrl || viewingProofRecord.receiptUrl}
                    alt="Bukti Bayaran"
                    className="max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-md"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <span>Tiada fail imej bukti tersedia.</span>
                  </div>
                )}
              </div>

              {viewingProofRecord.proofFileName && (
                <div className="text-center text-xs text-slate-500 font-mono">
                  Fail: {viewingProofRecord.proofFileName}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {viewingProofRecord.status !== 'BERJAYA' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(viewingProofRecord, 'BERJAYA');
                      setViewingProofRecord(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sahkan Sebagai BERJAYA</span>
                  </button>
                )}
                {viewingProofRecord.status !== 'DIBATALKAN' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(viewingProofRecord, 'DIBATALKAN');
                      setViewingProofRecord(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                  >
                    Tolak / Batal
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {viewingProofRecord.paymentProofUrl && (
                  <a
                    href={viewingProofRecord.paymentProofUrl}
                    download={viewingProofRecord.proofFileName || `Bukti_Bayaran_${viewingProofRecord.transactionRef}.jpg`}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Muat Turun Fail</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewingProofRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MUAT NAIK / GANTI BUKTI PEMBAYARAN (PROOF UPLOAD)                */}
      {/* ========================================================================= */}
      {uploadingProofRecord && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Muat Naik Bukti Pembayaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadingProofRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-800">{uploadingProofRecord.schoolName}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Ref: {uploadingProofRecord.transactionRef} • RM {uploadingProofRecord.amount.toFixed(2)}
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={proofFileInputRef}
                onChange={handleProofFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => proofFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                  uploadedProofData
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50'
                }`}
              >
                {isCompressingProof ? (
                  <div className="space-y-2">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-600 font-bold">Mengoptimumkan fail...</p>
                  </div>
                ) : uploadedProofData ? (
                  <div className="space-y-3">
                    <img
                      src={uploadedProofData}
                      alt="Pratonton"
                      className="max-h-48 mx-auto rounded-lg shadow-xs"
                    />
                    <div className="text-xs font-bold text-emerald-700">
                      ✓ Fail dipilih: {uploadedFileName}
                    </div>
                    <span className="text-[11px] text-slate-500 underline">Klik untuk tukar fail lain</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      Klik untuk pilih gambar slip / resit DuitNow / bank transfer
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Format PNG, JPG, JPEG atau WebP (Maksimum 8MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUploadingProofRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!uploadedProofData || isCompressingProof}
                onClick={handleSaveUploadedProof}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                Simpan Bukti Bayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH / KEMASKINI KATEGORI YURAN (CATEGORY EDITOR MODAL)        */}
      {/* ========================================================================= */}
      {categoryModalMode && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-black text-slate-900">
                  {categoryModalMode === 'add' ? 'Tambah Kategori Yuran Baharu' : 'Kemaskini Kategori Yuran'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCategoryModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 overflow-y-auto space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penuh Kategori Yuran *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Yuran Ahli Biasa (> 3 Tahun • ≤ 300 Murid)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Short Name & System Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Ringkas (Label Kad)
                  </label>
                  <input
                    type="text"
                    value={catShortName}
                    onChange={(e) => setCatShortName(e.target.value)}
                    placeholder="Contoh: Ahli Biasa (≤ 300 Murid)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kod Kategori Sistem
                  </label>
                  <input
                    type="text"
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    placeholder="Contoh: YURAN_AHLI_BAWAH_300"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Amount RM & Membership Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kadar Yuran (RM) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      RM
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={catAmount}
                      onChange={(e) => setCatAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelayakan Keahlian
                  </label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Ahli Biasa">Ahli Biasa (Fasal 4(1))</option>
                    <option value="Ahli Bersekutu">Ahli Bersekutu (Fasal 4(7))</option>
                    <option value="Semua">Semua Kategori Sekolah</option>
                    <option value="Lain-lain">Lain-lain / Program Khas</option>
                  </select>
                </div>
              </div>

              {/* Criteria & Clause */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kriteria Enrolmen / Penubuhan
                  </label>
                  <input
                    type="text"
                    value={catCriteria}
                    onChange={(e) => setCatCriteria(e.target.value)}
                    placeholder="Contoh: 300 Murid ke Bawah (≤ 300)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fasal / Rujukan Perlembagaan
                  </label>
                  <input
                    type="text"
                    value={catClause}
                    onChange={(e) => setCatClause(e.target.value)}
                    placeholder="Contoh: Fasal 6(1) & Fasal 4(1)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penerangan Yuran
                </label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Keterangan perincian kategori yuran..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Features (One per line) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kelebihan / Manfaat Keahlian (1 baris setiap satu)
                </label>
                <textarea
                  rows={3}
                  value={catFeatures}
                  onChange={(e) => setCatFeatures(e.target.value)}
                  placeholder="Hak mengundi dalam MAT&#10;Sijil Keahlian Rasmi&#10;Akses Portal Ahli PGB"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Gateway URL & Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sesi Akademik
                  </label>
                  <input
                    type="text"
                    value={catSession}
                    onChange={(e) => setCatSession(e.target.value)}
                    placeholder="2026/2027"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pautan HerePay Gateway
                  </label>
                  <input
                    type="text"
                    value={catGatewayUrl}
                    onChange={(e) => setCatGatewayUrl(e.target.value)}
                    placeholder="https://app.herepay.org/mpgbsim"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catIsActive}
                    onChange={(e) => setCatIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Kategori ini aktif dan dipaparkan dalam borang bayaran
                  </span>
                </label>
              </div>

              <div className="px-1 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCategoryModalMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {categoryModalMode === 'add' ? 'Simpan Kategori Baharu' : 'Kemaskini Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REKOD BAYARAN MANUAL (BENDAHARI DIRECT ENTRY)                    */}
      {/* ========================================================================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Rekod Pembayaran Yuran Manual (Bendahari)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualPayment} className="p-6 overflow-y-auto space-y-4">
              {/* School Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualSchoolName}
                    onChange={(e) => setManualSchoolName(e.target.value)}
                    placeholder="Contoh: SRI Al-Azhar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kod Sekolah
                  </label>
                  <input
                    type="text"
                    value={manualSchoolCode}
                    onChange={(e) => setManualSchoolCode(e.target.value)}
                    placeholder="KJA3002"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Payer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pembayar / PGB *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualPayerName}
                    onChange={(e) => setManualPayerName(e.target.value)}
                    placeholder="Nama Guru Besar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emel Pembayar
                  </label>
                  <input
                    type="email"
                    value={manualPayerEmail}
                    onChange={(e) => setManualPayerEmail(e.target.value)}
                    placeholder="emel@sekolah.edu.my"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Telefon
                  </label>
                  <input
                    type="text"
                    value={manualPayerPhone}
                    onChange={(e) => setManualPayerPhone(e.target.value)}
                    placeholder="013-XXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Kategori Yuran *
                  </label>
                  <select
                    value={manualCategoryCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setManualCategoryCode(code);
                      const matched = feeCategories.find((c) => c.code === code);
                      if (matched) setManualAmount(matched.amount);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {feeCategories.map((cat) => (
                      <option key={cat.id} value={cat.code}>
                        {cat.name} (RM {cat.amount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Bayaran (RM) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Method & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kaedah Bayaran
                  </label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="HerePay (DuitNow QR)">HerePay (DuitNow QR)</option>
                    <option value="Pindahan Bank Manual (EFT)">Pindahan Bank Manual (EFT)</option>
                    <option value="Mesin Deposit Tunai (CDM)">Mesin Deposit Tunai (CDM)</option>
                    <option value="Cek Cawangan Bank">Cek Cawangan Bank</option>
                    <option value="Tunai Pejabat">Tunai Pejabat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Rujukan / Resit
                  </label>
                  <input
                    type="text"
                    value={manualRef}
                    onChange={(e) => setManualRef(e.target.value)}
                    placeholder="HP-MPGB-XXXX atau No Slip"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarikh Bayaran
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Status & Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Transaksi
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                  >
                    <option value="BERJAYA">BERJAYA (Sahkan Terus)</option>
                    <option value="DALAM_SEMAKAN">DALAM SEMAKAN (Perlu Verifikasi Lanjut)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sesi Persekolahan
                  </label>
                  <input
                    type="text"
                    value={manualSession}
                    onChange={(e) => setManualSession(e.target.value)}
                    placeholder="2026/2027"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Bendahari (Pilihan)
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Catatan rujukan atau kaedah penerimaan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="px-1 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Simpan Rekod Bayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RESIT RASMI MPGBSIM (OFFICIAL RECEIPT MODAL)                    */}
      {/* ========================================================================= */}
      {viewingReceiptRecord && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Resit Rasmi Pembayaran Yuran MPGBSIM
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Resit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReceiptRecord(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 print:p-0">
              {/* Receipt Header */}
              <div className="text-center pb-6 border-b-2 border-emerald-900 space-y-1">
                <img
                  src="/mpgbsim-official-logo.png"
                  alt="MPGBSIM Logo"
                  className="w-16 h-16 mx-auto object-contain mb-2"
                />
                <h2 className="text-base font-black text-slate-900 tracking-wide uppercase">
                  Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)
                </h2>
                <p className="text-[11px] text-slate-600">
                  No. Pendaftaran ROS: PPM-002-10-23041996 • Ditubuhkan Pada 23 April 1996
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor
                </p>
                <div className="inline-block mt-3 px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono font-black text-xs uppercase tracking-wider">
                  RESIT RASMI PEMBAYARAN YURAN
                </div>
              </div>

              {/* Receipt Meta Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Diterima Daripada:</span>
                  <div className="font-bold text-slate-900">{viewingReceiptRecord.schoolName}</div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    Kod: {viewingReceiptRecord.schoolCode || 'MPGB-AHLI'}
                  </div>
                  <div className="text-slate-600">Nama PGB: {viewingReceiptRecord.payerName}</div>
                  <div className="text-slate-500 text-[11px]">{viewingReceiptRecord.payerEmail}</div>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Butiran Resit:</span>
                  <div className="font-mono font-black text-emerald-800">
                    No. Resit: {viewingReceiptRecord.transactionRef}
                  </div>
                  <div className="text-slate-600">Tarikh: {viewingReceiptRecord.paymentDate}</div>
                  <div className="text-slate-600">Kaedah: {viewingReceiptRecord.paymentMethod}</div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    Sesi: {viewingReceiptRecord.academicSession || '2026/2027'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Bil</th>
                      <th className="py-2.5 px-3">Perihal / Keterangan</th>
                      <th className="py-2.5 px-3 text-right">Amaun (RM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-3 px-3 font-mono">1</td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 block">{viewingReceiptRecord.categoryLabel}</strong>
                        <span className="text-[11px] text-slate-500">
                          {viewingReceiptRecord.notes || 'Pembayaran yuran rasmi mengikut Fasal 6 Perlembagaan MPGBSIM'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {Number(viewingReceiptRecord.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-[10px] text-slate-600">
                        Jumlah Pembayaran Diterima:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm text-emerald-900 font-black">
                        RM {Number(viewingReceiptRecord.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signature and Verification Footer */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Status Pengesahan:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 font-mono text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    STATUS: {viewingReceiptRecord.status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Resit berkomputer rasmi ini sah tanpa tandatangan fizikal.
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-script text-lg text-emerald-900 italic font-bold">
                    {viewingReceiptRecord.verifiedBy || 'Bendahari Kehormat MPGBSIM'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 border-t border-slate-300 pt-1">
                    Biro Kewangan & Urus Setia
                  </div>
                  <div className="text-[10px] text-slate-500">
                    MPGBSIM Malaysia
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end print:hidden">
              <button
                type="button"
                onClick={() => setViewingReceiptRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: PENGESAHAN PADAM REKOD                                          */}
      {/* ========================================================================= */}
      {recordToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Padam Rekod Pembayaran?</h3>
              <p className="text-xs text-slate-500">
                Adakah anda pasti mahu memadam rekod yuran rujukan{' '}
                <strong className="text-slate-800 font-mono">{recordToDelete.transactionRef}</strong> ({recordToDelete.schoolName})? Tindakan ini tidak boleh diundur.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteFeePayment(recordToDelete.id);
                  setRecordToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Ya, Padam Rekod
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
