import React, { useState } from 'react';
import {
  X,
  User,
  Briefcase,
  Award,
  BookOpen,
  HeartHandshake,
  Quote,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Building2,
  Lock,
  Upload,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { AlumniRecord, LeadershipHistoryRecord, AlumniConsent } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface AlumniRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AlumniRecord, 'id' | 'submittedAt'>) => Promise<string>;
}

export const AlumniRegistrationModal: React.FC<AlumniRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Step 1: Personal
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('Dato\' Hj.');
  const [photo, setPhoto] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [gender, setGender] = useState<'Lelaki' | 'Perempuan'>('Lelaki');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Selangor');

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingPhoto(true);
    try {
      const dataUrl = await compressImageFile(file, 600, 600, 0.85);
      if (dataUrl) {
        setPhoto(dataUrl);
      }
    } catch (err) {
      console.warn('Gagal memproses gambar profil:', err);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Step 2: Leadership History
  const [lastPosition, setLastPosition] = useState('Mantan Pengetua Cemerlang');
  const [lastSchool, setLastSchool] = useState('');
  const [careerStartYear, setCareerStartYear] = useState<number>(1990);
  const [retirementYear, setRetirementYear] = useState<number>(2024);
  const [leadershipHistory, setLeadershipHistory] = useState<LeadershipHistoryRecord[]>([
    {
      id: `lh-${Date.now()}`,
      schoolName: '',
      position: 'Pengetua',
      startYear: 2010,
      endYear: 2024,
      state: 'Selangor',
      highlights: '',
    },
  ]);

  // Step 3: Professional Background
  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertiseList, setExpertiseList] = useState<string[]>([
    'Kepimpinan Rabbani',
    'Pengurusan Sekolah',
  ]);
  const [biography, setBiography] = useState('');
  const [currentOrganisation, setCurrentOrganisation] = useState('');

  // Step 4: Achievements & Contributions
  const [awardsInput, setAwardsInput] = useState('');
  const [awardsList, setAwardsList] = useState<string[]>([]);
  const [achievementsInput, setAchievementsInput] = useState('');
  const [achievementsList, setAchievementsList] = useState<string[]>([]);
  const [contributions, setContributions] = useState('');

  // Step 5: MPGBSIM History
  const [mpgbsimRole, setMpgbsimRole] = useState('');
  const [mpgbsimStartYear, setMpgbsimStartYear] = useState<number>(2015);
  const [mpgbsimEndYear, setMpgbsimEndYear] = useState<number>(2024);
  const [mpgbsimContribution, setMpgbsimContribution] = useState('');

  // Step 6: Legacy Quote
  const [legacyQuote, setLegacyQuote] = useState('');

  // Step 7: Consent & Privacy
  const [consent, setConsent] = useState<AlumniConsent>({
    allowPublicDisplay: true,
    allowSchoolHistory: true,
    allowExpertise: true,
    allowQuote: true,
    allowContact: false,
  });

  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const statesList = [
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
    'Wilayah Persekutuan Kuala Lumpur',
    'Wilayah Persekutuan Putrajaya',
    'Wilayah Persekutuan Labuan',
  ];

  const handleAddLeadershipRecord = () => {
    setLeadershipHistory((prev) => [
      ...prev,
      {
        id: `lh-${Date.now()}`,
        schoolName: '',
        position: 'Pengetua',
        startYear: 2015,
        endYear: 2024,
        state: state,
        highlights: '',
      },
    ]);
  };

  const handleRemoveLeadershipRecord = (id: string) => {
    if (leadershipHistory.length === 1) return;
    setLeadershipHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateLeadershipRecord = (
    id: string,
    field: keyof LeadershipHistoryRecord,
    val: any
  ) => {
    setLeadershipHistory((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim()) {
      setExpertiseList((prev) => [...prev, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };

  const handleAddAward = () => {
    if (awardsInput.trim()) {
      setAwardsList((prev) => [...prev, awardsInput.trim()]);
      setAwardsInput('');
    }
  };

  const handleAddAchievement = () => {
    if (achievementsInput.trim()) {
      setAchievementsList((prev) => [...prev, achievementsInput.trim()]);
      setAchievementsInput('');
    }
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage('');
    if (step === 1) {
      if (!fullName.trim()) {
        setErrorMessage('Sila masukkan nama penuh anda.');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Sila masukkan alamat emel yang sah.');
        return false;
      }
      if (!phone.trim()) {
        setErrorMessage('Sila masukkan nombor telefon rujukan.');
        return false;
      }
    } else if (step === 2) {
      if (!lastSchool.trim()) {
        setErrorMessage('Sila masukkan sekolah terakhir yang anda pimpin.');
        return false;
      }
      if (!lastPosition.trim()) {
        setErrorMessage('Sila masukkan jawatan terakhir anda.');
        return false;
      }
    } else if (step === 6) {
      if (!legacyQuote.trim()) {
        setErrorMessage('Sila tinggalkan pesanan legasi ringkas untuk generasi PGB baharu.');
        return false;
      }
    } else if (step === 7) {
      if (!consent.allowPublicDisplay) {
        setErrorMessage('Sila berikan persetujuan untuk paparan maklumat awam rasmi alumni.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(7, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(7)) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const alumniData: Omit<AlumniRecord, 'id' | 'submittedAt'> = {
        fullName: fullName.trim(),
        title: title.trim(),
        photo: photo.trim() || undefined,
        gender,
        email: email.trim(),
        phone: phone.trim(),
        state,
        lastPosition: lastPosition.trim(),
        lastSchool: lastSchool.trim(),
        careerStartYear,
        retirementYear,
        leadershipHistory: leadershipHistory.filter((r) => r.schoolName.trim().length > 0),
        expertise: expertiseList,
        biography: biography.trim() || undefined,
        currentOrganisation: currentOrganisation.trim() || undefined,
        awards: awardsList,
        achievements: achievementsList,
        contributions: contributions.trim() || undefined,
        mpgbsimRole: mpgbsimRole.trim() || undefined,
        mpgbsimStartYear,
        mpgbsimEndYear,
        mpgbsimContribution: mpgbsimContribution.trim() || undefined,
        legacyQuote: legacyQuote.trim(),
        consent,
        verificationStatus: 'SUBMITTED',
      };

      await onSubmit(alumniData);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Gagal menghantar permohonan alumni. Sila cuba lagi.');
    }
  };

  const stepTitles = [
    'Maklumat Peribadi',
    'Sejarah Kepimpinan',
    'Latar Belakang Profesional',
    'Anugerah & Sumbr',
    'Sejarah MPGBSIM',
    'Jejak Legasi',
    'Privasi & Persetujuan',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative border-b border-teal-500/20">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup Dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Pendaftaran Alumni PGB MPGBSIM
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Jejak Kepimpinan, Legasi Pendidikan
            </h2>
            <p className="text-xs text-slate-300">
              Daftarkan rekod kepimpinan dan sumbangan anda dalam direktori rasmi alumni Pengetua & Guru Besar.
            </p>
          </div>

          {/* Step Progress Indicator */}
          {!submittedSuccess && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-teal-300 mb-1.5 font-semibold">
                <span>
                  Langkah {currentStep} daripada 7: {stepTitles[currentStep - 1]}
                </span>
                <span>{Math.round((currentStep / 7) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${(currentStep / 7) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Pendaftaran Berjaya Dihantar!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Rekod pendaftaran Alumni PGB anda telah disimpan. Jawatankuasa Urusetia MPGBSIM & Media AJK akan menyemak dan mengesahkan profil anda sebelum dipaparkan di direktori rasmi awam.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 max-w-lg mx-auto">
                <strong className="font-bold">Status: SUBMITTED (Dalam Semakan)</strong>
                <p className="mt-1">
                  Status akan dikemas kini kepada <strong className="text-teal-800">APPROVED</strong> sebaik sahaja disahkan oleh pentadbir.
                </p>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Kembali ke Direktori
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-700" />
                    Langkah 1: Maklumat Peribadi
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gelaran</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Dato' Hj. / Ustaz / Cikgu"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Penuh <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nama Penuh Mengikut MyKad"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jantina <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Lelaki">Lelaki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Negeri Kediaman / Khidmat <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        {statesList.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Alamat Emel Utama <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@alumni.org"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombor Telefon <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+60 12-345 6789"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Gambar Profil Alumni PGB
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {/* Preview Box */}
                      <div className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 border-2 border-amber-400 shadow-md flex items-center justify-center">
                        {photo ? (
                          <img
                            src={photo}
                            alt="Pratonton Gambar Profil Alumni"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-slate-400" />
                        )}
                        {isCompressingPhoto && (
                          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-amber-300 text-[10px] font-bold">
                            Memproses...
                          </div>
                        )}
                      </div>

                      {/* File Upload Controls */}
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer border border-teal-600/40">
                            <Upload className="w-4 h-4 text-amber-300" />
                            <span>Muat Naik Gambar Profil</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoFileChange}
                              className="hidden"
                            />
                          </label>

                          {photo && (
                            <button
                              type="button"
                              onClick={() => setPhoto('')}
                              className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Padam Foto</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Muat naik gambar profil rasmi dari galeri atau kamera peranti anda (PNG, JPG, WEBP). Gambar dioptimumkan secara automatik.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Leadership History */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-teal-700" />
                      Langkah 2: Sejarah Kepimpinan Institusi
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jawatan Terakhir Ditandatangani <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastPosition}
                        onChange={(e) => setLastPosition(e.target.value)}
                        placeholder="Contoh: Mantan Pengetua Cemerlang"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sekolah / Institusi Terakhir <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastSchool}
                        onChange={(e) => setLastSchool(e.target.value)}
                        placeholder="Contoh: SMKA Maahad Hamidiah Kajang"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tahun Mula Menceburi Bidang Pendidikan
                      </label>
                      <input
                        type="number"
                        value={careerStartYear}
                        onChange={(e) => setCareerStartYear(parseInt(e.target.value) || 1990)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tahun Bersara / Akhir Perkhidmatan
                      </label>
                      <input
                        type="number"
                        value={retirementYear}
                        onChange={(e) => setRetirementYear(parseInt(e.target.value) || 2024)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  {/* Multiple Leadership Records */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Senarai Sekolah & Jawatan Dijawat
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddLeadershipRecord}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Rekod Kepimpinan
                      </button>
                    </div>

                    {leadershipHistory.map((rec, idx) => (
                      <div
                        key={rec.id || idx}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                            Rekod #{idx + 1}
                          </span>
                          {leadershipHistory.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLeadershipRecord(rec.id!)}
                              className="text-rose-600 hover:text-rose-800 text-xs font-medium cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Nama Sekolah / Institusi
                            </label>
                            <input
                              type="text"
                              value={rec.schoolName}
                              onChange={(e) =>
                                handleUpdateLeadershipRecord(rec.id!, 'schoolName', e.target.value)
                              }
                              placeholder="Contoh: SRI Al-Amin Bangi"
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Jawatan
                            </label>
                            <input
                              type="text"
                              value={rec.position}
                              onChange={(e) =>
                                handleUpdateLeadershipRecord(rec.id!, 'position', e.target.value)
                              }
                              placeholder="Pengetua / Guru Besar / PK"
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Tahun Mula
                            </label>
                            <input
                              type="number"
                              value={rec.startYear}
                              onChange={(e) =>
                                handleUpdateLeadershipRecord(
                                  rec.id!,
                                  'startYear',
                                  parseInt(e.target.value) || 2010
                                )
                              }
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Tahun Tamat
                            </label>
                            <input
                              type="number"
                              value={rec.endYear}
                              onChange={(e) =>
                                handleUpdateLeadershipRecord(
                                  rec.id!,
                                  'endYear',
                                  parseInt(e.target.value) || 2024
                                )
                              }
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Professional Background */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-700" />
                    Langkah 3: Latar Belakang Profesional & Kepakaran
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bidang Kepakaran Kepimpinan
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        placeholder="Contoh: Kurikulum Integrasi, Pementoran Guru"
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAddExpertise}
                        className="px-4 py-2 bg-teal-800 text-white font-bold text-xs rounded-lg hover:bg-teal-700 cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {expertiseList.map((exp, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-900 border border-teal-200 px-2.5 py-1 rounded-md"
                        >
                          {exp}
                          <button
                            type="button"
                            onClick={() =>
                              setExpertiseList((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="text-teal-600 hover:text-teal-900 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organisasi / Penglibatan Terkini
                    </label>
                    <input
                      type="text"
                      value={currentOrganisation}
                      onChange={(e) => setCurrentOrganisation(e.target.value)}
                      placeholder="Contoh: Perunding Kurikulum / Ahli Jawatankuasa Syariah"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Biografi / Ringkasan Pengalaman
                    </label>
                    <textarea
                      rows={3}
                      value={biography}
                      onChange={(e) => setBiography(e.target.value)}
                      placeholder="Ringkasan ringkas perjalanan perkhidmatan anda dalam kepimpinan..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Achievements and Contributions */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-teal-700" />
                    Langkah 4: Anugerah & Pencapaian Utam
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Anugerah & Pingat Kehormatan
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={awardsInput}
                        onChange={(e) => setAwardsInput(e.target.value)}
                        placeholder="Contoh: Anugerah Tokoh Guru Selangor 2023"
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAddAward}
                        className="px-4 py-2 bg-teal-800 text-white font-bold text-xs rounded-lg hover:bg-teal-700 cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                    <ul className="space-y-1 mt-2">
                      {awardsList.map((awd, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200"
                        >
                          <span>{awd}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAwardsList((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="text-rose-600 font-bold"
                          >
                            Hapus
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pencapaian Projek & Inovasi Utama
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={achievementsInput}
                        onChange={(e) => setAchievementsInput(e.target.value)}
                        placeholder="Contoh: Pelopor Tahfiz Model Ulul Albab"
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAddAchievement}
                        className="px-4 py-2 bg-teal-800 text-white font-bold text-xs rounded-lg hover:bg-teal-700 cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                    <ul className="space-y-1 mt-2">
                      {achievementsList.map((ach, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200"
                        >
                          <span>{ach}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAchievementsList((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="text-rose-600 font-bold"
                          >
                            Hapus
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* STEP 5: MPGBSIM History */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-teal-700" />
                    Langkah 5: Sejarah & Peranan Dalam MPGBSIM
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jawatan / Peranan Dalam MPGBSIM
                      </label>
                      <input
                        type="text"
                        value={mpgbsimRole}
                        onChange={(e) => setMpgbsimRole(e.target.value)}
                        placeholder="Contoh: Mantan Pengerusi Biro Akademik / Ahli Jawatankuasa"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tahun Menyertai MPGBSIM
                      </label>
                      <input
                        type="number"
                        value={mpgbsimStartYear}
                        onChange={(e) =>
                          setMpgbsimStartYear(parseInt(e.target.value) || 2015)
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tahun Tamat Peranan
                      </label>
                      <input
                        type="number"
                        value={mpgbsimEndYear}
                        onChange={(e) => setMpgbsimEndYear(parseInt(e.target.value) || 2024)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sumbangan Kepada Perkembangan MPGBSIM
                    </label>
                    <textarea
                      rows={3}
                      value={mpgbsimContribution}
                      onChange={(e) => setMpgbsimContribution(e.target.value)}
                      placeholder="Inisiatif atau penganjuran acara yang dilaksana semasa berkhidmat..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: Legacy Quote */}
              {currentStep === 6 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <Quote className="w-4 h-4 text-teal-700" />
                    Langkah 6: Jejak Legasi
                  </h3>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                    <label className="block text-xs font-black text-amber-900 uppercase tracking-wider">
                      Pesanan Kepada Generasi Pengetua & Guru Besar Baharu <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={legacyQuote}
                      onChange={(e) => setLegacyQuote(e.target.value)}
                      placeholder="Tinggalkan nasihat, pedoman rohani atau Mutiara kata kepimpinan anda..."
                      className="w-full p-3 text-sm border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[11px] text-amber-800">
                      Pesanan ini akan dipaparkan secara menonjol pada profil anda untuk pencerahan generasi pentadbir seterusnya.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 7: Privacy and Consent */}
              {currentStep === 7 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-700" />
                    Langkah 7: Privasi & Persetujuan Paparan Awam
                  </h3>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="text-xs text-slate-700 space-y-1">
                      <strong className="font-bold text-slate-900">
                        Dasar Perlindungan Data & Privasi Alumni:
                      </strong>
                      <p>
                        Data peribadi sensitif seperti No. MyKad, alamat rumah persendirian, nombor telefon peribadi, serta tarikh lahir penuh TIDAK AKAN dipaparkan secara terbuka.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent.allowPublicDisplay}
                          onChange={(e) =>
                            setConsent((prev) => ({ ...prev, allowPublicDisplay: e.target.checked }))
                          }
                          className="mt-0.5 w-4 h-4 text-teal-700 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span>
                          Saya bersetuju profil alumni saya (Nama, Foto, Jawatan Terakhir, Sekolah, Negeri & Pesanan) dipaparkan di direktori rasmi awam Alumni PGB MPGBSIM.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent.allowSchoolHistory}
                          onChange={(e) =>
                            setConsent((prev) => ({ ...prev, allowSchoolHistory: e.target.checked }))
                          }
                          className="mt-0.5 w-4 h-4 text-teal-700 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span>Saya membenarkan paparan sejarah kepimpinan sekolah yang pernah saya pimpin.</span>
                      </label>

                      <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent.allowQuote}
                          onChange={(e) =>
                            setConsent((prev) => ({ ...prev, allowQuote: e.target.checked }))
                          }
                          className="mt-0.5 w-4 h-4 text-teal-700 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span>Saya membenarkan kata-kata hikmah legasi saya ditampilkan dalam siri Jejak Legasi.</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 rounded-lg shadow-md transition-colors cursor-pointer"
                  >
                    <span>Seterusnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sedang Menyimpan...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Hantar Pendaftaran Alumni</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
