import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  School,
  MapPin,
  Mail,
  Phone,
  Lock,
  Save,
  CheckCircle,
  Sparkles,
  QrCode,
  Download,
  Printer,
  Calendar,
  Award,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  Check,
  GraduationCap,
  Users,
  Globe,
  Building2,
  ImageIcon,
  Camera,
  Upload,
  Trash2,
  UserCheck,
  X,
  FileText,
  FileDown,
  CreditCard,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool } from '../../types';
import { Logo } from '../Logo';
import QRCode from 'qrcode';
import { DigitalMembershipCardModal } from './DigitalMembershipCardModal';
import { compressImageFile, compressDataUrl } from '../../utils/imageCompressor';
import { downloadElementAsSinglePagePdf } from '../../utils/pdfGenerator';

const normalizeSchoolCategory = (t?: string): string => {
  if (!t) return 'Sekolah Menengah';
  if (t === 'Sekolah Rendah' || t === 'Sekolah Menengah' || t === 'Maahad Tahfiz' || t === 'Rakan Musleh') {
    return t;
  }
  if (t.includes('Rendah') || t.includes('SRI')) return 'Sekolah Rendah';
  if (t.includes('Tahfiz')) return 'Maahad Tahfiz';
  if (t.includes('Musleh')) return 'Rakan Musleh';
  return 'Sekolah Menengah';
};

export const PortalProfile: React.FC = () => {
  const { currentUser, updateUserProfile, changeUserPassword, registeredSchools, setPortalTab } = useMemberPortal();
  const { siteData, updateMemberSchool } = useAdminContent();

  const allSchools =
    registeredSchools && registeredSchools.length > 0
      ? registeredSchools
      : siteData.memberSchools || [];

  // Track if initial values have been populated once so edits are never overwritten on re-renders
  const initializedUidRef = React.useRef<string | null>(null);
  const printAreaRef = React.useRef<HTMLDivElement | null>(null);

  // 1. Maklumat Pengetua / Guru Besar (PGB) States
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [position, setPosition] = useState(currentUser?.position || 'Pengetua');
  const [serviceStartYear, setServiceStartYear] = useState<number | string>(
    currentUser?.serviceStartYear || currentUser?.pgbStartYear || 2020
  );
  const [icNumber, setIcNumber] = useState(currentUser?.icNumber || '');
  const [pgbEmail, setPgbEmail] = useState(currentUser?.pgbEmail || currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');

  // 2. Maklumat Institusi Sekolah States
  const [school, setSchool] = useState(currentUser?.school || '');
  const [schoolCode, setSchoolCode] = useState(currentUser?.schoolCode || '');
  const [schoolType, setSchoolType] = useState(normalizeSchoolCategory(currentUser?.schoolType));
  const [membershipType, setMembershipType] = useState<'Ahli Biasa' | 'Ahli Bersekutu'>(
    currentUser?.membershipType || (currentUser?.schoolType === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa')
  );
  const [joinYear, setJoinYear] = useState<number | string>(
    currentUser?.joinYear || 2024
  );
  const [state, setState] = useState(currentUser?.state || 'Melaka');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [schoolEmail, setSchoolEmail] = useState(currentUser?.schoolEmail || '');
  const [schoolPhone, setSchoolPhone] = useState(currentUser?.schoolPhone || '');
  const [studentCount, setStudentCount] = useState<number | string>(currentUser?.studentCount ?? 0);
  const [teacherCount, setTeacherCount] = useState<number | string>(currentUser?.teacherCount ?? 0);
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [logoUrl, setLogoUrl] = useState(currentUser?.logoUrl || '');
  const [schoolPhotoUrl, setSchoolPhotoUrl] = useState(currentUser?.schoolPhotoUrl || '');

  // 3. Kawalan Privasi & Kepakaran Kepimpinan
  const [hidePhone, setHidePhone] = useState(currentUser?.hidePhone ?? true);
  const [expertiseStr, setExpertiseStr] = useState(
    currentUser?.expertise?.join(', ') || 'Kepimpinan Kurikulum Dini, Pembangunan Sahsiah'
  );
  const [interestsStr, setInterestsStr] = useState(
    currentUser?.interests?.join(', ') || 'AI Dalam Pendidikan, STEM Islamik, Transformasi Digital'
  );

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloadSuccess, setPdfDownloadSuccess] = useState(false);
  const [isDigitalCardModalOpen, setIsDigitalCardModalOpen] = useState(false);
  const [cardQrCodeUrl, setCardQrCodeUrl] = useState<string>('');

  // Password Change States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Synchronize local states when currentUser or allSchools is loaded
  useEffect(() => {
    const isSecondaryMusleh =
      currentUser?.email === 'smimmelaka@gmail.com' ||
      currentUser?.schoolCode === 'JAIM/SAS(M)130' ||
      currentUser?.schoolCode === 'MIA1009' ||
      (currentUser?.membershipNo && (currentUser.membershipNo.includes('JAIM/SAS') || currentUser.membershipNo.includes('MIA1009'))) ||
      (currentUser?.school && (currentUser.school.toLowerCase().includes('menengah') || currentUser.school.toLowerCase().includes('sma')) && currentUser.school.toLowerCase().includes('musleh'));

    const isPrimaryMusleh =
      !isSecondaryMusleh &&
      (currentUser?.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
        currentUser?.schoolCode === 'MJAC011' ||
        (currentUser?.email && currentUser.email.toLowerCase().includes('imuslehmelaka')) ||
        (currentUser?.membershipNo && currentUser.membershipNo.includes('MJAC011')) ||
        (currentUser?.school && (currentUser.school.toLowerCase().includes('rendah') || currentUser.school.toLowerCase().includes('sri')) && currentUser.school.toLowerCase().includes('musleh')) ||
        (!currentUser && !currentUser?.email));

    const matchedSchool: MemberSchool | undefined = isSecondaryMusleh
      ? allSchools.find((s) => s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.id === 'school-musleh-menengah-1' || s.email?.toLowerCase() === 'smimmelaka@gmail.com' || (s.name?.toLowerCase().includes('menengah') && s.name?.toLowerCase().includes('musleh')))
      : isPrimaryMusleh
      ? allSchools.find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1' || (s.name?.toLowerCase().includes('rendah') && s.name?.toLowerCase().includes('musleh')))
      : (currentUser?.schoolId ? allSchools.find((s) => s.id === currentUser.schoolId) : undefined) ||
        allSchools.find((s) => currentUser?.uid === `sch-user-${s.id}` || currentUser?.uid === s.id) ||
        (currentUser?.schoolCode ? allSchools.find((s) => s.code && s.code.toUpperCase() === currentUser.schoolCode?.toUpperCase()) : undefined) ||
        (currentUser?.membershipNo ? allSchools.find((s) => s.code && currentUser.membershipNo?.toUpperCase().includes(s.code.toUpperCase())) : undefined) ||
        (currentUser?.school ? allSchools.find((s) => s.name && s.name.toLowerCase().trim() === currentUser.school?.toLowerCase().trim()) : undefined) ||
        (currentUser?.pgbEmail ? allSchools.find((s) => s.pgbEmail && s.pgbEmail.toLowerCase().trim() === currentUser.pgbEmail?.toLowerCase().trim()) : undefined) ||
        (currentUser?.email ? allSchools.find((s) => {
          const emailMatches = s.email && s.email.toLowerCase() === currentUser.email.toLowerCase();
          if (!emailMatches) return false;
          if (currentUser.schoolType && s.type && currentUser.schoolType.toLowerCase().trim() === s.type.toLowerCase().trim()) return true;
          if (currentUser.position === 'Guru Besar' && s.type?.toLowerCase().includes('rendah')) return true;
          if (currentUser.position === 'Pengetua' && s.type?.toLowerCase().includes('menengah')) return true;
          return false;
        }) : undefined) ||
        allSchools[0];

    const effectiveFullName =
      currentUser?.fullName ||
      matchedSchool?.principal ||
      (isSecondaryMusleh ? 'Masitah Binti Seikh Omar (Pengetua)' : isPrimaryMusleh ? 'Ustaz Abdul Qayyum bin Yaakop' : '');

    const effectiveSchool =
      currentUser?.school ||
      matchedSchool?.name ||
      (isSecondaryMusleh ? 'SEKOLAH MENENGAH AGAMA I-MUSLEH' : isPrimaryMusleh ? 'Sekolah Rendah Islam I Musleh' : '');

    const effectivePosition =
      currentUser?.position ||
      matchedSchool?.designation ||
      (isSecondaryMusleh ? 'Pengetua' : isPrimaryMusleh ? 'Guru Besar' : 'Pengetua');

    const effectiveState = currentUser?.state || matchedSchool?.state || 'Melaka';

    const effectivePhone =
      currentUser?.phone ||
      currentUser?.pgbPhone ||
      matchedSchool?.pgbPhone ||
      matchedSchool?.phone ||
      (isSecondaryMusleh ? '013-2695286' : isPrimaryMusleh ? '+60 6-335 1290' : '');

    const effectivePhotoURL =
      currentUser?.photoURL ||
      matchedSchool?.principalPhotoUrl ||
      (isSecondaryMusleh ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' : '') ||
      '';

    const codeNorm = (currentUser?.schoolCode || matchedSchool?.code || '').trim().toLowerCase();
    const nameNorm = (effectiveSchool || '').trim().toLowerCase();
    const emailNorm = (currentUser?.pgbEmail || currentUser?.email || matchedSchool?.pgbEmail || matchedSchool?.email || '').trim().toLowerCase();
    const principalNorm = (effectiveFullName || '')
      .replace(/\(.*?\)/g, '')
      .trim()
      .toLowerCase();

    const matchedApp = (siteData.memberApplications || []).find((a) => {
      const aCode = (a.schoolCode || '').trim().toLowerCase();
      const aName = (a.schoolName || '').trim().toLowerCase();
      const aEmail = (a.email || a.pgbEmail || '').trim().toLowerCase();
      const aFullName = (a.fullName || '').trim().toLowerCase();
      return (
        (codeNorm && aCode && aCode === codeNorm) ||
        (nameNorm && aName && aName === nameNorm) ||
        (emailNorm && aEmail && aEmail === emailNorm) ||
        (principalNorm && aFullName && (principalNorm.includes(aFullName) || aFullName.includes(principalNorm)))
      );
    });

    let subIc = '';
    for (const sub of siteData.submissions || []) {
      const msg = sub.message || '';
      const kpMatch = msg.match(/No\s*KP:\s*([0-9A-Za-z-]{6,20})/i);
      if (!kpMatch || !kpMatch[1] || kpMatch[1] === '-') continue;
      const msgLower = msg.toLowerCase();
      const subEmail = (sub.email || '').trim().toLowerCase();
      const subName = (sub.name || '').trim().toLowerCase();
      if (
        (codeNorm && msgLower.includes(`(${codeNorm})`)) ||
        (nameNorm && msgLower.includes(nameNorm)) ||
        (emailNorm && (subEmail === emailNorm || msgLower.includes(emailNorm))) ||
        (principalNorm && subName && (principalNorm.includes(subName) || subName.includes(principalNorm)))
      ) {
        subIc = kpMatch[1].trim();
        break;
      }
    }

    const effectiveIcNumber =
      currentUser?.icNumber ||
      matchedSchool?.icNumber ||
      matchedApp?.icNumber ||
      subIc ||
      (isSecondaryMusleh ? '730627-01-5156' : isPrimaryMusleh ? '850312-04-5123' : '');

    const effectiveServiceStartYear =
      currentUser?.serviceStartYear ||
      currentUser?.pgbStartYear ||
      (matchedSchool as any)?.serviceStartYear ||
      (matchedSchool as any)?.pgbStartYear ||
      (isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2026 : 2020);

    const effectiveJoinYear =
      currentUser?.joinYear ||
      matchedSchool?.joinYear ||
      (isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2026 : 2024);

    const effectivePgbEmail =
      currentUser?.pgbEmail ||
      currentUser?.email ||
      matchedSchool?.pgbEmail ||
      (isSecondaryMusleh ? 'smimmelaka@gmail.com' : isPrimaryMusleh ? 'abdulqayyumyaakop@imuslehmelaka.edu.my' : '');

    const effectiveSchoolCode =
      isSecondaryMusleh
        ? 'JAIM/SAS(M)130'
        : currentUser?.schoolCode ||
          matchedSchool?.code ||
          (isPrimaryMusleh ? 'MJAC011' : '');

    const effectiveSchoolType = normalizeSchoolCategory(
      currentUser?.schoolType ||
      matchedSchool?.type ||
      (isSecondaryMusleh ? 'Sekolah Menengah' : isPrimaryMusleh ? 'Sekolah Rendah' : 'Sekolah Menengah')
    );

    const effectiveMembershipType: 'Ahli Biasa' | 'Ahli Bersekutu' =
      currentUser?.membershipType ||
      matchedSchool?.membershipType ||
      matchedApp?.membershipType ||
      (effectiveSchoolType === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa');

    const effectiveDistrict =
      currentUser?.district ||
      matchedSchool?.district ||
      (isSecondaryMusleh ? 'Ayer Keroh' : isPrimaryMusleh ? 'Melaka Tengah' : '');

    const effectiveAddress =
      currentUser?.address ||
      matchedSchool?.address ||
      (isSecondaryMusleh ? 'Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka' : isPrimaryMusleh ? 'Batu 4 1/2, Jalan Peringgit, 75400 Melaka' : '');

    const effectiveSchoolEmail =
      currentUser?.schoolEmail ||
      matchedSchool?.schoolEmail ||
      matchedSchool?.email ||
      (isSecondaryMusleh ? 'smimmelaka@gmail.com' : isPrimaryMusleh ? 'admin@imuslehmelaka.edu.my' : '');

    const effectiveSchoolPhone =
      currentUser?.schoolPhone ||
      matchedSchool?.schoolPhone ||
      matchedSchool?.phone ||
      (isSecondaryMusleh ? '06-2349405' : isPrimaryMusleh ? '+60 6-335 1290' : '');

    const effectiveStudentCount =
      currentUser?.studentCount ??
      matchedSchool?.studentCount ??
      (isSecondaryMusleh ? 79 : isPrimaryMusleh ? 428 : 0);

    const effectiveTeacherCount =
      currentUser?.teacherCount ??
      matchedSchool?.teacherCount ??
      (isSecondaryMusleh ? 10 : isPrimaryMusleh ? 32 : 0);

    const effectiveWebsite =
      currentUser?.website ||
      matchedSchool?.website ||
      (isSecondaryMusleh ? 'https://i-musleh.com' : isPrimaryMusleh ? 'https://imuslehmelaka.edu.my' : '');

    const effectiveLogoUrl =
      currentUser?.logoUrl ||
      matchedSchool?.logoUrl ||
      '/mpgbsim-official-logo.png';

    const effectiveSchoolPhotoUrl =
      currentUser?.schoolPhotoUrl ||
      matchedSchool?.schoolPhotoUrl ||
      (isSecondaryMusleh ? 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80' : isPrimaryMusleh ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80' : '');

    const shouldPopulate = !initializedUidRef.current || (currentUser && initializedUidRef.current !== currentUser.uid) || !fullName;
    if (shouldPopulate) {
      if (currentUser?.uid) {
        initializedUidRef.current = currentUser.uid;
      } else {
        initializedUidRef.current = 'guest-session';
      }

      setFullName(effectiveFullName);
      setPosition(effectivePosition);
      setSchool(effectiveSchool);
      setState(effectiveState);
      setPhone(effectivePhone);
      setPhotoURL(effectivePhotoURL);
      setIcNumber(effectiveIcNumber);
      setServiceStartYear(effectiveServiceStartYear);
      setJoinYear(effectiveJoinYear);
      setPgbEmail(effectivePgbEmail);
      setSchoolCode(effectiveSchoolCode);
      setSchoolType(effectiveSchoolType);
      setMembershipType(effectiveMembershipType);
      setDistrict(effectiveDistrict);
      setAddress(effectiveAddress);
      setSchoolEmail(effectiveSchoolEmail);
      setSchoolPhone(effectiveSchoolPhone);
      setStudentCount(effectiveStudentCount);
      setTeacherCount(effectiveTeacherCount);
      setWebsite(effectiveWebsite);
      setLogoUrl(effectiveLogoUrl);
      setSchoolPhotoUrl(effectiveSchoolPhotoUrl);
      setHidePhone(currentUser?.hidePhone ?? true);

      if (currentUser?.expertise && currentUser.expertise.length > 0) {
        setExpertiseStr(currentUser.expertise.join(', '));
      }
      if (currentUser?.interests && currentUser.interests.length > 0) {
        setInterestsStr(currentUser.interests.join(', '));
      }
    } else if (!icNumber && effectiveIcNumber) {
      setIcNumber(effectiveIcNumber);
    }
  }, [currentUser, allSchools, siteData.memberApplications, siteData.submissions]);

  const statesList = [
    'Selangor',
    'Kuala Lumpur',
    'Wilayah Persekutuan',
    'Johor',
    'Perak',
    'Kedah',
    'Kelantan',
    'Terengganu',
    'Pahang',
    'Negeri Sembilan',
    'Melaka',
    'Pulau Pinang',
    'Perlis',
    'Sabah',
    'Sarawak',
  ];

  const schoolTypesList = [
    'Sekolah Rendah',
    'Sekolah Menengah',
    'Maahad Tahfiz',
    'Rakan Musleh',
  ];

  const positionsList = [
    'Pengetua',
    'Guru Besar',
    'Pemangku Pengetua',
    'Penolong Kanan Pentadbiran',
  ];

  // Photo Upload Handlers with automatic client-side compression (<80KB)
  const handlePgbPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 360, 360, 0.72);
        setPhotoURL(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => setPhotoURL(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSchoolPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 500, 0.70);
        setSchoolPhotoUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => setSchoolPhotoUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 260, 260, 0.75);
        setLogoUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => setLogoUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!fullName || !fullName.trim()) {
      setSaveError('Sila masukkan Nama Penuh Pengetua / Guru Besar (PGB).');
      return;
    }
    if (!school || !school.trim()) {
      setSaveError('Sila masukkan Nama Penuh Institusi Sekolah.');
      return;
    }

    setIsSaving(true);
    try {
      // Re-compress any existing large base64 data URLs before saving to Firestore/localStorage
      const safePhotoURL = photoURL ? await compressDataUrl(photoURL.trim(), 360, 360, 0.72) : undefined;
      const safeSchoolPhotoUrl = schoolPhotoUrl ? await compressDataUrl(schoolPhotoUrl.trim(), 800, 500, 0.70) : undefined;
      const safeLogoUrl = logoUrl ? await compressDataUrl(logoUrl.trim(), 260, 260, 0.75) : undefined;

      await updateUserProfile({
        fullName: fullName.trim(),
        position,
        serviceStartYear: Number(serviceStartYear) || undefined,
        pgbStartYear: Number(serviceStartYear) || undefined,
        joinYear: Number(joinYear) || undefined,
        icNumber: icNumber ? icNumber.trim() : undefined,
        pgbEmail: pgbEmail ? pgbEmail.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        pgbPhone: phone ? phone.trim() : undefined,
        photoURL: safePhotoURL,
        school: school.trim(),
        schoolCode: schoolCode ? schoolCode.trim().toUpperCase() : undefined,
        schoolType: schoolType || 'Sekolah Menengah',
        membershipType: membershipType || 'Ahli Biasa',
        state: state || 'Melaka',
        district: district ? district.trim() : undefined,
        address: address ? address.trim() : undefined,
        schoolEmail: schoolEmail ? schoolEmail.trim() : undefined,
        schoolPhone: schoolPhone ? schoolPhone.trim() : undefined,
        studentCount: Number(studentCount) || 0,
        teacherCount: Number(teacherCount) || 0,
        website: website ? website.trim() : undefined,
        logoUrl: safeLogoUrl,
        schoolPhotoUrl: safeSchoolPhotoUrl,
        hidePhone,
        expertise: expertiseStr.split(',').map((s) => s.trim()).filter(Boolean),
        interests: interestsStr.split(',').map((s) => s.trim()).filter(Boolean),
      });

      // Synchronize directly with website member schools directory
      const isSecondaryUser = Boolean(
        currentUser?.email === 'smimmelaka@gmail.com' ||
        currentUser?.schoolCode === 'JAIM/SAS(M)130' ||
        currentUser?.schoolCode === 'MIA1009' ||
        currentUser?.membershipNo?.includes('JAIM/SAS') ||
        currentUser?.membershipNo?.includes('MIA1009') ||
        (currentUser?.school && (currentUser.school.toLowerCase().includes('menengah') || currentUser.school.toLowerCase().includes('sma')) && currentUser.school.toLowerCase().includes('musleh'))
      );

      const isPrimaryUser = Boolean(
        !isSecondaryUser &&
        (currentUser?.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
          currentUser?.schoolCode === 'MJAC011' ||
          currentUser?.email?.toLowerCase().includes('imuslehmelaka') ||
          currentUser?.membershipNo?.includes('MJAC011') ||
          (currentUser?.school && (currentUser.school.toLowerCase().includes('rendah') || currentUser.school.toLowerCase().includes('sri')) && currentUser.school.toLowerCase().includes('musleh')))
      );

      const schoolsList = siteData.memberSchools || [];
      const matchedSchool: MemberSchool | undefined = isSecondaryUser
        ? schoolsList.find((s) => s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.id === 'school-musleh-menengah-1' || s.email?.toLowerCase() === 'smimmelaka@gmail.com' || (s.name?.toLowerCase().includes('menengah') && s.name?.toLowerCase().includes('musleh')))
        : isPrimaryUser
        ? schoolsList.find((s) => s.id === 'sch-musleh-1' || s.code === 'MJAC011' || s.email?.toLowerCase() === 'abdulqayyumyaakop@imuslehmelaka.edu.my' || (s.name?.toLowerCase().includes('rendah') && s.name?.toLowerCase().includes('musleh')))
        : (currentUser?.schoolId ? schoolsList.find((s) => s.id === currentUser.schoolId) : undefined) ||
          schoolsList.find((s) => currentUser?.uid === `sch-user-${s.id}` || currentUser?.uid === s.id) ||
          (currentUser?.schoolCode ? schoolsList.find((s) => s.code && s.code.toUpperCase() === currentUser.schoolCode?.toUpperCase()) : undefined) ||
          (currentUser?.membershipNo ? schoolsList.find((s) => s.code && currentUser.membershipNo?.toUpperCase().includes(s.code.toUpperCase())) : undefined) ||
          (currentUser?.school ? schoolsList.find((s) => s.name && s.name.toLowerCase().trim() === currentUser.school?.toLowerCase().trim()) : undefined) ||
          (currentUser?.pgbEmail ? schoolsList.find((s) => s.pgbEmail && s.pgbEmail.toLowerCase().trim() === currentUser.pgbEmail?.toLowerCase().trim()) : undefined);

      if (matchedSchool) {
        await updateMemberSchool(matchedSchool.id, {
          name: school.trim() || matchedSchool.name,
          code: schoolCode ? schoolCode.trim().toUpperCase() : matchedSchool.code,
          type: schoolType || matchedSchool.type,
          membershipType: membershipType || matchedSchool.membershipType || 'Ahli Biasa',
          principal: fullName.trim() || matchedSchool.principal,
          icNumber: icNumber ? icNumber.trim() : matchedSchool.icNumber,
          serviceStartYear: Number(serviceStartYear) || (matchedSchool as any).serviceStartYear,
          pgbStartYear: Number(serviceStartYear) || (matchedSchool as any).pgbStartYear,
          joinYear: Number(joinYear) || matchedSchool.joinYear,
          state: state || matchedSchool.state,
          district: district ? district.trim() : matchedSchool.district,
          address: address ? address.trim() : matchedSchool.address,
          phone: schoolPhone ? schoolPhone.trim() : (phone ? phone.trim() : matchedSchool.phone),
          email: schoolEmail ? schoolEmail.trim() : matchedSchool.email,
          schoolEmail: schoolEmail ? schoolEmail.trim() : matchedSchool.schoolEmail,
          schoolPhone: schoolPhone ? schoolPhone.trim() : matchedSchool.schoolPhone,
          pgbEmail: pgbEmail ? pgbEmail.trim() : matchedSchool.pgbEmail,
          pgbPhone: phone ? phone.trim() : matchedSchool.pgbPhone,
          studentCount: Number(studentCount) || matchedSchool.studentCount,
          teacherCount: Number(teacherCount) || matchedSchool.teacherCount,
          website: website ? website.trim() : matchedSchool.website,
          logoUrl: safeLogoUrl || matchedSchool.logoUrl,
          schoolPhotoUrl: safeSchoolPhotoUrl || matchedSchool.schoolPhotoUrl,
          principalPhotoUrl: safePhotoURL || matchedSchool.principalPhotoUrl,
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 5000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err.message || 'Ralat semasa menyimpan maklumat profil kepimpinan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.trim().length < 6) {
      setPasswordError('Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Pengesahan kata laluan baharu tidak sepadan. Sila pastikan kedua-duanya sama.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changeUserPassword(newPassword, oldPassword);
      setPasswordSuccess(res.message || 'Kata laluan log masuk anda telah berjaya ditukar!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 7000);
    } catch (err: any) {
      setPasswordError(err.message || 'Ralat berlaku semasa mengemas kini kata laluan.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const isSecondaryMuslehCard =
    currentUser?.email === 'smimmelaka@gmail.com' ||
    schoolCode === 'JAIM/SAS(M)130' ||
    schoolCode === 'MIA1009' ||
    currentUser?.schoolCode === 'JAIM/SAS(M)130' ||
    currentUser?.schoolCode === 'MIA1009' ||
    (currentUser?.membershipNo && (currentUser.membershipNo.includes('JAIM/SAS') || currentUser.membershipNo.includes('MIA1009'))) ||
    (school && (school.toLowerCase().includes('menengah') || school.toLowerCase().includes('sma')) && school.toLowerCase().includes('musleh'));

  const isPrimaryMuslehCard =
    !isSecondaryMuslehCard &&
    (currentUser?.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      schoolCode === 'MJAC011' ||
      currentUser?.schoolCode === 'MJAC011' ||
      (currentUser?.email && currentUser.email.toLowerCase().includes('imusleh')) ||
      (school && (school.toLowerCase().includes('rendah') || school.toLowerCase().includes('sri')) && school.toLowerCase().includes('musleh')) ||
      (currentUser?.membershipNo && currentUser.membershipNo.includes('MJAC011')));

  const rawCode = schoolCode || currentUser?.schoolCode || currentUser?.membershipNo?.replace(/^MPGB-\d{4}-/, '') || (isSecondaryMuslehCard ? 'JAIM/SAS(M)130' : 'MJAC011');
  const effectiveCardCode = isSecondaryMuslehCard ? 'JAIM/SAS(M)130' : isPrimaryMuslehCard ? 'MJAC011' : (rawCode === 'MIA1009' ? 'JAIM/SAS(M)130' : rawCode);
  const membershipNumber = isSecondaryMuslehCard
    ? 'MPGB-2026-JAIM/SAS(M)130'
    : isPrimaryMuslehCard
    ? 'MPGB-2026-MJAC011'
    : currentUser?.membershipNo?.replace('MIA1009', 'JAIM/SAS(M)130') || `MPGB-2026-${effectiveCardCode}`;

  useEffect(() => {
    const payload = JSON.stringify({
      org: 'MPGBSIM',
      id: membershipNumber,
      name: fullName,
      position,
      school,
      state,
      status: 'AKTIF',
      website: 'https://www.mpgbsim.org/',
    });

    QRCode.toDataURL(payload, { width: 150, margin: 1, color: { dark: '#064e3b', light: '#ffffff' } }, (err, url) => {
      if (!err && url) {
        setCardQrCodeUrl(url);
      }
    });
  }, [membershipNumber, fullName, position, school, state]);

  const handleDownloadProfilePdf = async () => {
    if (!printAreaRef.current || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setPdfDownloadSuccess(false);
    try {
      const safeCode = (effectiveCardCode || 'PGB').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeName = (fullName || 'Ahli_MPGBSIM').replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadElementAsSinglePagePdf(
        printAreaRef.current,
        `Rekod_Profil_Rasmi_MPGBSIM_${safeCode}_${safeName}.pdf`
      );
      setPdfDownloadSuccess(true);
      setTimeout(() => setPdfDownloadSuccess(false), 4500);
    } catch (err) {
      console.error('Error generating 1-page PDF:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 print:space-y-0 print:pb-0">
      {/* Header */}
      <div className="no-print bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5" />
            Maklumat Keahlian & Akaun Rasmi
          </div>
          <h1 className="text-2xl font-black text-slate-900">Profil Ahli & Kad Digital MPGBSIM</h1>
          <p className="text-xs text-slate-500 mt-1">
            Urus profil kepimpinan PGB, maklumat institusi sekolah, kawalan privasi, muat naik foto institusi dan kad pengenalan digital ahli.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsDigitalCardModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            title="Muat Turun & Papar Kad Keahlian Digital (QR Code)"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Muat Turun Kad Digital (QR Code)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            title="Cetak & Muat Turun Rekod Profil Kepimpinan Rasmi (PDF 1 Muka)"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak / Muat Turun Profil (PDF)</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="no-print p-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Maklumat profil kepimpinan dan institusi sekolah telah berjaya disimpan dan diselaraskan ke direktori kebangsaan.</span>
        </div>
      )}

      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Digital Membership Card (Kad Digital Keahlian MPGBSIM) */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Kad Pengenalan Digital Ahli
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white shadow-xl border border-amber-500/30 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            {/* Background subtle watermark */}
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
              <Sparkles className="w-56 h-56 text-amber-300" />
            </div>

            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Logo showText={false} size="sm" className="shrink-0" />
                  <div>
                    <span className="text-[11px] font-black text-white tracking-wider block">
                      MPGBSIM MEMBER
                    </span>
                    <span className="text-[8px] text-amber-300 block uppercase tracking-wider">
                      {schoolType || currentUser?.schoolType || 'Sekolah Islam Malaysia'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  membershipType === 'Ahli Bersekutu'
                    ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {currentUser?.role === 'ADMIN' ? 'ADMIN PENTADBIR' : membershipType.toUpperCase()}
                </span>
              </div>

              {/* Photo & Member info */}
              <div className="mt-4 flex items-center gap-3.5">
                <img
                  src={
                    photoURL ||
                    currentUser?.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0 bg-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-sm text-white truncate">{fullName || 'Ustaz Abdul Qayyum bin Yaakop'}</h3>
                  <p className="text-[11px] text-amber-300 font-semibold truncate">{position || 'Guru Besar'}</p>
                  <p className="text-[10px] text-slate-300 truncate">{school || 'Sekolah Rendah Islam I Musleh'}</p>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {state || 'Melaka'} • Kod: {effectiveCardCode}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                      membershipType === 'Ahli Bersekutu'
                        ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                        : 'bg-teal-500/25 text-teal-200 border-teal-400/40'
                    }`}>
                      {membershipType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics Badge */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[9px] px-2.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30 font-semibold flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-amber-400" />
                  {studentCount || 0} Murid
                </span>
                <span className="text-[9px] px-2.5 py-0.5 rounded-md bg-teal-400/15 text-teal-300 border border-teal-400/30 font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3 text-teal-400" />
                  {teacherCount || 0} Guru
                </span>
              </div>

              {/* Sekeping Foto Institusi Sekolah */}
              {(schoolPhotoUrl || currentUser?.schoolPhotoUrl || school.toLowerCase().includes('musleh')) && (
                <div className="mt-3.5 rounded-xl overflow-hidden border border-slate-700/80 relative h-24 bg-slate-950">
                  <img
                    src={
                      schoolPhotoUrl ||
                      currentUser?.schoolPhotoUrl ||
                      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80'
                    }
                    alt={school || 'Foto Institusi Sekolah'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-2">
                    <span className="text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1">
                      <School className="w-3 h-3 text-amber-400 shrink-0" />
                      Institusi: {school || 'Sekolah Rendah Islam I Musleh'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer with QR & Details */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-end justify-between">
              <div className="space-y-1 text-[10px] text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[9px]">NO. KEAHLIAN RASMI:</span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {membershipNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[9px]">TAHUN AHLI MPGBSIM:</span>
                    <span className="font-semibold text-white">{joinYear || currentUser?.joinYear || 2024}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">TAHUN MENJADI PGB:</span>
                    <span className="font-semibold text-amber-300">{serviceStartYear || 2020}</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setIsDigitalCardModalOpen(true)}
                className="p-1.5 rounded-xl bg-white text-slate-900 flex flex-col items-center justify-center shrink-0 border border-amber-400/40 cursor-pointer hover:scale-105 transition shadow-sm"
                title="Klik untuk membuka Kad Keahlian Digital penuh & muat turun PNG"
              >
                {cardQrCodeUrl ? (
                  <img src={cardQrCodeUrl} alt="QR Code Ahli" className="w-12 h-12 object-contain" />
                ) : (
                  <QrCode className="w-10 h-10" />
                )}
                <span className="text-[7px] font-mono font-bold mt-0.5">DISAHKAN</span>
              </div>
            </div>

            {/* Card Preview Footer: Emel & Laman Web Rasmi */}
            <div className="mt-3 pt-2 border-t border-slate-800 text-[8px] text-slate-400 flex items-center justify-between">
              <span className="text-teal-300 font-medium">mpgbsim.cemerlang@gmail.com</span>
              <span className="text-amber-300 font-mono text-[7.5px]">https://www.mpgbsim.org/</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDigitalCardModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Muat Turun Kad Keahlian Digital (QR Code)</span>
          </button>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-700" />
              Status Keahlian Sah
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Profil anda diiktiraf sebagai Ahli Berdaftar Rasmi Majlis Pengetua & Guru Besar Sekolah Islam Malaysia (MPGBSIM). Semua maklumat selaras dengan borang pendaftaran keahlian baharu.
            </p>
          </div>

          {/* HerePay Official Fee Payment Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 border border-emerald-600/40 text-white space-y-2.5 text-xs shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Bayar Yuran PGB (HerePay)
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Sesi 2026/2027
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Jelaskan yuran tahunan institusi anda secara selamat melalui saluran rasmi <strong>HerePay</strong> (FPX, DuitNow QR, Kad Debit/Kredit).
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://app.herepay.org/mpgbsim"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <span>Buka HerePay Rasmi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setPortalTab('yuran')}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-300" />
                <span>Lihat Sejarah & Resit Bayaran</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Profile Form & Change Password */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1: Profile Details Form (Maklumat Profil Kepimpinan) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-teal-800" />
                  <h2 className="text-lg font-black text-slate-900">Sunting Maklumat Profil Kepimpinan</h2>
                </div>
                <p className="text-xs text-slate-500">
                  Kemaskini maklumat Pengetua/Guru Besar dan data institusi sekolah. Maklumat ini selaras dengan borang pendaftaran keahlian baharu MPGBSIM.
                </p>
              </div>

              {/* BUTANG CETAK PROFIL (PDF) */}
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
                title="Cetak & Muat Turun Rekod Profil Kepimpinan (PDF)"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Cetak Profil</span>
              </button>
            </div>

            {isSaved && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2.5 shadow-md animate-in fade-in">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Maklumat Profil Kepimpinan dan Institusi Sekolah berjaya disimpan dan diselaraskan!</span>
              </div>
            )}

            {saveError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* BAHAGIAN 1: MAKLUMAT PENGETUA / GURU BESAR (PGB) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h3 className="font-bold text-sm text-teal-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-teal-700" />
                    <span>1. Maklumat Pengetua / Guru Besar (PGB)</span>
                  </h3>
                  <span className="text-[10px] text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full font-bold">
                    Kepimpinan Institusi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Penuh PGB *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="cth: Ustaz Ahmad Fauzi bin Daud"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jawatan Hakiki PGB *</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    >
                      {positionsList.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-700" />
                      <span>Tahun Menjadi PGB *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1970"
                      max={new Date().getFullYear() + 2}
                      value={serviceStartYear}
                      onChange={(e) => setServiceStartYear(e.target.value)}
                      placeholder="cth: 2018"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Tahun mula dilantik / memegang jawatan Pengetua atau Guru Besar</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. Kad Pengenalan PGB</label>
                    <input
                      type="text"
                      value={icNumber}
                      onChange={(e) => setIcNumber(e.target.value)}
                      placeholder="cth: 750101-01-5555"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">No. pengenalan diri rasmi PGB</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-teal-700" />
                      <span>Email Rasmi PGB</span>
                    </label>
                    <input
                      type="email"
                      value={pgbEmail}
                      onChange={(e) => setPgbEmail(e.target.value)}
                      placeholder="pgb@sekolah.edu.my"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Emel peribadi rasmi / urusan PGB</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-teal-700" />
                      <span>No. Telefon PGB</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="012-3456789"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">No. telefon bimbit / WhatsApp PGB</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Emel Utama (ID Log Masuk Akaun)</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Emel log masuk portal terikat secara rasmi</span>
                </div>

                {/* Upload Gambar PGB (Foto Profil Rasmi / Korporat) */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="p-3.5 rounded-xl bg-white border border-teal-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-teal-900 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-teal-700" />
                        <span>Upload Gambar PGB (Foto Profil Rasmi / Korporat)</span>
                      </label>
                      <span className="text-[10px] text-slate-500">Maks. 3MB (JPG / PNG)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Muat naik gambar potret atau foto korporat formal Pengetua / Guru Besar untuk paparan profil rasmi keahlian MPGBSIM.
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                      <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {photoURL ? (
                          <img
                            src={photoURL}
                            alt="Foto PGB"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-1">
                            <UserCheck className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                            <span className="text-[9px] text-slate-500 block leading-tight">Tiada Foto</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-[11px] cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{photoURL ? 'Tukar Foto PGB' : 'Pilih Foto PGB'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePgbPhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {photoURL && (
                            <button
                              type="button"
                              onClick={() => setPhotoURL('')}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Padam Foto</span>
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          value={photoURL}
                          onChange={(e) => setPhotoURL(e.target.value)}
                          placeholder="Atau masukkan pautan URL imej foto..."
                          className="w-full p-2 text-[10px] rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAHAGIAN 2: MAKLUMAT INSTITUSI SEKOLAH */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h3 className="font-bold text-sm text-teal-900 flex items-center gap-2">
                    <School className="w-4 h-4 text-teal-700" />
                    <span>2. Maklumat Institusi Sekolah</span>
                  </h3>
                  <span className="text-[10px] text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full font-bold">
                    Data Institusi
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Penuh Institusi Sekolah *</label>
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="cth: SMKA Maahad Muar"
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>

                {/* Kategori Keahlian MPGBSIM (Fasal 4 Perlembagaan): Ahli Biasa vs Ahli Bersekutu */}
                <div className="p-3.5 rounded-2xl bg-white border border-teal-200 space-y-2.5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                      <Shield className="w-4 h-4 text-teal-700" />
                      <span>Status / Kategori Keahlian Sekolah (Fasal 4 Perlembagaan MPGBSIM) *</span>
                    </label>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      Klasifikasi Rasmi Keahlian
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMembershipType('Ahli Biasa')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        membershipType === 'Ahli Biasa'
                          ? 'bg-teal-900 text-white border-teal-900 shadow-sm ring-2 ring-teal-500/20'
                          : 'bg-slate-50 hover:bg-teal-50/50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        membershipType === 'Ahli Biasa'
                          ? 'bg-amber-400 border-amber-300 text-slate-950'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs block">
                          Ahli Biasa (Fasal 4(2))
                        </span>
                        <span className={`text-[10px] block mt-0.5 leading-snug ${
                          membershipType === 'Ahli Biasa' ? 'text-teal-100' : 'text-slate-500'
                        }`}>
                          Sekolah-Sekolah Islam Malaysia di bawah IKRAM MUSLEH
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMembershipType('Ahli Bersekutu')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        membershipType === 'Ahli Bersekutu'
                          ? 'bg-indigo-900 text-white border-indigo-900 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 hover:bg-indigo-50/50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        membershipType === 'Ahli Bersekutu'
                          ? 'bg-amber-400 border-amber-300 text-slate-950'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs block">
                          Ahli Bersekutu (Fasal 4(3))
                        </span>
                        <span className={`text-[10px] block mt-0.5 leading-snug ${
                          membershipType === 'Ahli Bersekutu' ? 'text-indigo-100' : 'text-slate-500'
                        }`}>
                          Sekolah Rangkaian IKRAM MUSLEH (Bersekutu / Rakan Musleh)
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kod Sekolah</label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      placeholder="cth: JEA0012"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Kod rasmi kementerian/sekolah</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Sekolah *</label>
                    <select
                      value={schoolType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchoolType(val);
                        if (val === 'Rakan Musleh') {
                          setMembershipType('Ahli Bersekutu');
                        }
                      }}
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    >
                      {schoolTypesList.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Klasifikasi kategori sekolah</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-700" />
                      <span>Tahun Menjadi Ahli MPGBSIM *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1970"
                      max={new Date().getFullYear() + 2}
                      value={joinYear}
                      onChange={(e) => setJoinYear(e.target.value)}
                      placeholder="cth: 2024"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Tahun sekolah rasmi menjadi ahli MPGBSIM (minimum 1970)</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Negeri Institusi *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    >
                      {statesList.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Lokasi negeri institusi</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daerah</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="cth: Muar / Petaling Perdana"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Institusi</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="cth: Jalan Joned, 84000 Muar, Johor"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email Rasmi Sekolah & No Telefon Sekolah */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-teal-700" />
                      <span>Email Rasmi Sekolah</span>
                    </label>
                    <input
                      type="email"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                      placeholder="cth: jea0012@moe.edu.my atau pejabat@sekolah.edu.my"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Emel rasmi pejabat pentadbiran sekolah</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-teal-700" />
                      <span>No Telefon Sekolah</span>
                    </label>
                    <input
                      type="tel"
                      value={schoolPhone}
                      onChange={(e) => setSchoolPhone(e.target.value)}
                      placeholder="cth: 06-9521234 atau 03-88881234"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">No. telefon pejabat / talian tetap sekolah</span>
                  </div>
                </div>

                {/* Jumlah Murid, Jumlah Guru & Laman Web */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                      <span>Jumlah Murid</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={studentCount}
                      onChange={(e) => setStudentCount(e.target.value)}
                      placeholder="cth: 650"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Bilangan murid / pelajar terkini</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-700" />
                      <span>Jumlah Guru</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={teacherCount}
                      onChange={(e) => setTeacherCount(e.target.value)}
                      placeholder="cth: 55"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Bilangan tenaga pengajar / guru</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-teal-700" />
                      <span>Laman Web Rasmi</span>
                    </label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="cth: www.sekolah.edu.my"
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Portal / laman web sekolah (jika ada)</span>
                  </div>
                </div>

                {/* Upload Logo Sekolah & Sekeping Foto Institusi (Sekolah) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  {/* Logo Upload */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-teal-700" />
                        <span>Logo / Lencana Sekolah</span>
                      </label>
                      <span className="text-[10px] text-slate-500">Maks. 2MB</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] cursor-pointer transition flex items-center gap-1.5 shadow-xs">
                            <Upload className="w-3 h-3" />
                            <span>{logoUrl ? 'Tukar Logo' : 'Pilih Logo'}</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                          {logoUrl && (
                            <button
                              type="button"
                              onClick={() => setLogoUrl('')}
                              className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                            >
                              Padam Logo
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="Atau pautan URL logo..."
                          className="w-full p-1.5 text-[10px] rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sekeping Foto Institusi Upload */}
                  <div className="p-3.5 rounded-xl bg-white border border-teal-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-teal-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>Sekeping Foto Institusi (Sekolah) *</span>
                      </label>
                      <span className="text-[10px] text-slate-500">Maks. 5MB</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Foto mercu tanda institusi sekolah (bangunan pentadbiran atau pintu gerbang utama).
                    </p>
                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="w-20 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {schoolPhotoUrl ? (
                          <img src={schoolPhotoUrl} alt="Foto Institusi" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-semibold text-[11px] cursor-pointer transition flex items-center gap-1.5 shadow-xs">
                            <Upload className="w-3 h-3" />
                            <span>{schoolPhotoUrl ? 'Tukar Foto Institusi' : 'Pilih Foto Institusi'}</span>
                            <input type="file" accept="image/*" onChange={handleSchoolPhotoUpload} className="hidden" />
                          </label>
                          {schoolPhotoUrl && (
                            <button
                              type="button"
                              onClick={() => setSchoolPhotoUrl('')}
                              className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                            >
                              Padam Foto Institusi
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          value={schoolPhotoUrl}
                          onChange={(e) => setSchoolPhotoUrl(e.target.value)}
                          placeholder="Atau pautan URL foto institusi..."
                          className="w-full p-1.5 text-[10px] rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAHAGIAN 3: KAWALAN PRIVASI & KEPAKARAN KEPIMPINAN */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                  3. Kawalan Privasi & Kepakaran Kepimpinan
                </h3>

                {/* Privacy Controls Checkbox */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hidePhone}
                      onChange={(e) => setHidePhone(e.target.checked)}
                      className="mt-0.5 rounded text-teal-800 focus:ring-teal-700"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">
                        Kawalan Privasi: Sembunyikan Nombor Telefon Daripada Direktori Awam
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Apabila ditandakan, nombor telefon anda tidak akan dipaparkan secara terbuka kepada pengunjung luar direktori.
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bidang Kepakaran (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={expertiseStr}
                    onChange={(e) => setExpertiseStr(e.target.value)}
                    placeholder="cth. Kurikulum Dini, Kewangan Wakaf, Kepimpinan Digital"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 focus:bg-white text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Minat Profesional (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={interestsStr}
                    onChange={(e) => setInterestsStr(e.target.value)}
                    placeholder="cth. AI Dalam Pendidikan, STEM Tahfiz, Robotik"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 focus:bg-white text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {isSaved && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Maklumat profil kepimpinan berjaya disimpan dan diselaraskan!</span>
                  </div>
                )}
                {saveError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Data yang dikemaskini akan diselaraskan serta-merta ke kad keahlian digital dan direktori sekolah MPGBSIM.
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Cetak & Muat Turun Rekod Profil Kepimpinan Rasmi (PDF)"
                    >
                      <Printer className="w-4 h-4 text-teal-800" />
                      <span>Cetak Profil</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Menyimpan Maklumat...' : 'Simpan Perubahan Profil Kepimpinan'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Card 2: Setting Tukar Password Untuk Log In */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-800">
                <KeyRound className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Tetapan Tukar Kata Laluan Log Masuk</h2>
                <p className="text-xs text-slate-500">
                  Ubah kata laluan akaun untuk log masuk ke Portal MPGBSIM melalui Emel atau Kod Sekolah.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                Kata laluan ini boleh digunakan bersama ID Emel rasmi (<strong>{currentUser?.email}</strong>) atau Kod Sekolah (<strong>{effectiveCardCode}</strong>) di borang log masuk portal.
              </div>
            </div>

            {(!currentUser?.portalPassword || currentUser?.portalPassword === 'MPGBSIM2026') && (
              <div className="mt-3 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-2.5 shadow-xs">
                <KeyRound className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Peringatan Keselamatan:</strong> Akaun anda masih menggunakan kata laluan sementara rasmi (<strong>MPGBSIM2026</strong>). Sila tetapkan kata laluan peribadi baharu di bawah bagi menjamin keselamatan akaun sekolah anda.
                </div>
              </div>
            )}

            {passwordSuccess && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2.5 shadow-md animate-in fade-in">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kata Laluan Baharu */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kata Laluan Baharu *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 aksara"
                      minLength={6}
                      className="w-full p-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Gunakan gabungan huruf, nombor dan simbol untuk keselamatan optimum.
                  </span>
                </div>

                {/* Sahkan Kata Laluan Baharu */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sahkan Kata Laluan Baharu *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Masukkan semula kata laluan"
                      minLength={6}
                      className={`w-full p-3 pr-10 rounded-xl bg-slate-50 border text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 ${
                        confirmPassword && confirmPassword === newPassword
                          ? 'border-emerald-300 focus:ring-emerald-500'
                          : confirmPassword && confirmPassword !== newPassword
                          ? 'border-rose-300 focus:ring-rose-500'
                          : 'border-slate-200 focus:ring-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword === newPassword && (
                    <span className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3" /> Kata laluan sepadan
                    </span>
                  )}
                  {confirmPassword && confirmPassword !== newPassword && (
                    <span className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> Kata laluan tidak sepadan
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Perubahan akan diselaraskan serta-merta ke akaun sekolah & portal ahli.
                </span>
                <button
                  type="submit"
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {passwordLoading ? 'Mengemas kini...' : 'Tukar & Simpan Kata Laluan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Cetak Profil & Muat Turun PDF (1 Muka Surat A4) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
          {/* Action Header (Hidden in print) */}
          <div className="no-print max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Pratonton Rekod Profil Rasmi Kepimpinan (Format PDF — 1 Muka Surat)</h3>
                <p className="text-[11px] text-slate-400">
                  Muat turun terus sebagai fail PDF 1 muka surat A4 yang sama tepat seperti pratonton di bawah atau cetak terus.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isDownloadingPdf}
                onClick={handleDownloadProfilePdf}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                title="Muat turun terus fail PDF 1 muka surat A4 yang sama seperti pratonton ini"
              >
                <FileDown className="w-4 h-4 text-slate-950" />
                <span>{isDownloadingPdf ? 'Menjana PDF (1 Muka)...' : 'Muat Turun PDF (1 Muka)'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                title="Cetak lembaran rasmi ini dalam 1 muka surat A4"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Cetak (1 Muka)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {pdfDownloadSuccess && (
            <div className="no-print max-w-4xl w-full mb-3 p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Fail PDF Rekod Profil Rasmi Kepimpinan (1 Muka Surat A4) telah berjaya dimuat turun!</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-700 px-2 py-0.5 rounded">1 MUKA SURAT A4</span>
            </div>
          )}

          {/* Official Document Sheet (1-Page A4 Calibrated Layout) */}
          <div
            ref={printAreaRef}
            id="official-profile-print-area"
            className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full p-5 sm:p-7 border border-slate-200 relative overflow-hidden"
          >
            {/* Top Corporate Strip */}
            <div className="h-2 bg-gradient-to-r from-teal-800 via-amber-500 to-teal-800 rounded-t-xl -mt-5 -mx-5 sm:-mt-7 sm:-mx-7 mb-4" />

            {/* Letterhead Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 pb-3 border-b-2 border-teal-900/80">
              <div className="shrink-0 p-1 bg-white rounded-xl">
                <Logo showText={false} size="lg" className="shrink-0" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-sm sm:text-base font-black text-teal-950 uppercase tracking-tight">
                  Majlis Pengetua & Guru Besar Sekolah Islam Malaysia (MPGBSIM)
                </h1>
                <p className="text-[10px] font-semibold text-amber-800 mt-0.5">
                  Pertubuhan Kebangsaan Kepimpinan Pentadbir Sekolah Islam Malaysia (PPM-002-10-23041996)
                </p>
                <p className="text-[9.5px] text-slate-500 mt-0.5 leading-snug">
                  D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor • Tel: 03-4251 6157 / 03-4251 6167 • Emel: mpgbsim.cemerlang@gmail.com • Web: https://www.mpgbsim.org/
                </p>
              </div>
              <div className="text-center sm:text-right shrink-0">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-mono font-bold text-[11px]">
                  {membershipNumber}
                </span>
                <span className="block text-[8.5px] text-slate-400 mt-0.5 font-semibold">STATUS: AHLI AKTIF & SAH</span>
              </div>
            </div>

            {/* Title & Document Badge */}
            <div className="mt-3 text-center bg-slate-50 border border-slate-200 rounded-xl py-2 px-3">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                Lembaran Rekod Rasmi Profil Kepimpinan & Institusi Sekolah Ahli
              </h2>
              <p className="text-[9.5px] text-slate-500 mt-0.5">
                Penyata maklumat Pengetua/Guru Besar dan data sekolah berdaftar di bawah MPGBSIM (Tahun {new Date().getFullYear()})
              </p>
            </div>

            {/* Grid 3 Key Badges */}
            <div className="grid grid-cols-3 gap-2.5 mt-3 text-xs">
              <div className="p-2 rounded-xl bg-teal-50/50 border border-teal-200">
                <span className="text-[9px] text-slate-500 block">No. Keahlian Rasmi:</span>
                <strong className="text-teal-950 font-mono text-[11px]">{membershipNumber}</strong>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-200">
                <span className="text-[9px] text-slate-500 block">Status Pengiktirafan:</span>
                <strong className="text-amber-900 flex items-center gap-1 font-bold text-[11px]">
                  <CheckCircle className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>Diperakui Sah & Aktif</span>
                </strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Tarikh Cetakan Dokumen:</span>
                <strong className="text-slate-800 text-[11px]">
                  {new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                </strong>
              </div>
            </div>

            {/* BAHAGIAN 1: MAKLUMAT PENGETUA / GURU BESAR (PGB) */}
            <div className="mt-3.5 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-teal-900 text-white px-3.5 py-1.5 flex items-center justify-between">
                <h3 className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>1. Maklumat Pengetua / Guru Besar (PGB)</span>
                </h3>
                <span className="text-[9px] bg-teal-800 px-2 py-0.5 rounded font-semibold text-teal-200">
                  Kepimpinan Institusi
                </span>
              </div>

              <div className="p-3.5 flex flex-row items-start gap-4 bg-white">
                <div className="w-20 h-24 rounded-xl bg-slate-100 border-2 border-teal-800/20 overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                  {photoURL ? (
                    <img src={photoURL} alt={fullName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[11px] w-full">
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-slate-500 block">Nama Penuh PGB:</span>
                    <strong className="text-slate-900 font-bold text-xs block">{fullName || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Jawatan Hakiki PGB:</span>
                    <strong className="text-teal-900 font-bold">{position || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Tahun Menjadi PGB:</span>
                    <strong className="text-amber-800 font-bold font-mono">{serviceStartYear || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">No. Kad Pengenalan PGB:</span>
                    <span className="text-slate-800 font-mono">{icNumber || 'Dalam Rekod Rasmi'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Email Rasmi PGB:</span>
                    <span className="text-slate-800 break-all">{pgbEmail || currentUser?.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">No. Telefon PGB:</span>
                    <span className="text-slate-800 font-mono">{phone || '-'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-100 flex items-center gap-2">
                    <span className="text-[9px] text-slate-500">Alamat Emel Akaun Log Masuk:</span>
                    <span className="text-slate-700 font-mono text-[10.5px] font-semibold">{currentUser?.email || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BAHAGIAN 2: MAKLUMAT INSTITUSI SEKOLAH */}
            <div className="mt-3.5 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-teal-900 text-white px-3.5 py-1.5 flex items-center justify-between">
                <h3 className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-amber-300" />
                  <span>2. Maklumat Institusi Sekolah Ahli</span>
                </h3>
                <span className="text-[9px] bg-teal-800 px-2 py-0.5 rounded font-semibold text-teal-200">
                  Data Rasmi Sekolah
                </span>
              </div>

              <div className="p-3.5 bg-white space-y-2.5 text-[11px]">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-500 block">Nama Penuh Institusi Sekolah:</span>
                    <strong className="text-slate-900 font-bold text-xs block">{school || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Kod Sekolah:</span>
                    <span className="font-mono font-bold text-teal-900">{schoolCode || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Status Keahlian (Fasal 4):</span>
                    <strong className={membershipType === 'Ahli Bersekutu' ? 'text-indigo-800' : 'text-teal-900'}>
                      {membershipType}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Kategori Sekolah:</span>
                    <strong className="text-slate-800">{schoolType || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Tahun Ahli MPGBSIM:</span>
                    <strong className="text-teal-900 font-bold font-mono">{joinYear || currentUser?.joinYear || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Negeri Institusi:</span>
                    <strong className="text-slate-800">{state || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Daerah:</span>
                    <span className="text-slate-800">{district || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                  <div className="sm:col-span-2">
                    <span className="text-[9px] text-slate-500 block">Alamat Lengkap Institusi:</span>
                    <span className="text-slate-800">{address || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Laman Web Rasmi:</span>
                    <span className="text-slate-800 truncate block">{website || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Email Pejabat Sekolah:</span>
                    <span className="text-slate-800 break-all">{schoolEmail || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">No. Tel. Pejabat Sekolah:</span>
                    <span className="text-slate-800 font-mono">{schoolPhone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Jumlah Murid / Pelajar:</span>
                    <strong className="text-slate-800 font-mono">{studentCount || 0} orang</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Jumlah Tenaga Pengajar:</span>
                    <strong className="text-slate-800 font-mono">{teacherCount || 0} orang</strong>
                  </div>
                </div>

                {(schoolPhotoUrl || logoUrl) && (
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    {logoUrl && (
                      <div className="flex items-center gap-2">
                        <img src={logoUrl} alt="Logo" crossOrigin="anonymous" className="w-8 h-8 object-contain rounded border border-slate-200 p-0.5" />
                        <span className="text-[9px] text-slate-500">Logo Institusi</span>
                      </div>
                    )}
                    {schoolPhotoUrl && (
                      <div className="flex items-center gap-2">
                        <img src={schoolPhotoUrl} alt="Foto Sekolah" crossOrigin="anonymous" className="w-14 h-8 object-cover rounded border border-slate-200" />
                        <span className="text-[9px] text-slate-500">Mercu Tanda Sekolah</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* BAHAGIAN 3: KEPIMPINAN, KEPAKARAN & KAWALAN PRIVASI */}
            <div className="mt-3.5 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 text-slate-900 px-3.5 py-1.5 border-b border-slate-200">
                <h3 className="font-bold text-[11px] uppercase tracking-wider">
                  3. Kawalan Privasi, Bidang Kepakaran & Minat Kepimpinan
                </h3>
              </div>
              <div className="p-3 bg-white grid grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">Bidang Kepakaran:</span>
                  <span className="text-slate-800 font-medium">{expertiseStr || '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Minat Profesional:</span>
                  <span className="text-slate-800 font-medium">{interestsStr || '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Status Privasi Telefon:</span>
                  <span className="text-slate-800">
                    {hidePhone ? 'Dilindungi (Urus Setia Sahaja)' : 'Dipaparkan di Direktori Awam'}
                  </span>
                </div>
              </div>
            </div>

            {/* BAHAGIAN 4: PENGESAHAN URUS SETIA RASMI */}
            <div className="mt-4 pt-3 border-t-2 border-slate-200 grid grid-cols-3 gap-3 items-center">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center p-1 bg-white shrink-0">
                  {cardQrCodeUrl ? (
                    <img src={cardQrCodeUrl} alt="QR Verifikasi" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-10 h-10 text-slate-800" />
                  )}
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-400 block font-mono">KOD VERIFIKASI:</span>
                  <strong className="text-[10px] text-teal-900 font-mono block">VERIFIED-{effectiveCardCode}</strong>
                  <span className="text-[8.5px] text-slate-500">Imbas untuk semakan rasmi</span>
                </div>
              </div>

              <div className="text-center p-2 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-[9.5px] font-bold text-amber-950 block">METERAI RASMI KEAHLIAN</span>
                <span className="text-[8.5px] text-amber-800 block">MPGBSIM KEBANGSAAN</span>
                <span className="text-[8px] text-amber-700 font-mono">SELESAI DISEMAK & DISAHKAN</span>
              </div>

              <div className="text-right text-[11px]">
                <span className="text-[9px] text-slate-400 block">DIKELUARKAN OLEH:</span>
                <strong className="text-slate-900 block text-[11px]">Urus Setia Kebangsaan MPGBSIM</strong>
                <span className="text-[9px] text-slate-500">Majlis Pengetua & Guru Besar Sekolah Islam Malaysia</span>
              </div>
            </div>

            {/* Official Footnote */}
            <div className="mt-3 pt-2 border-t border-slate-100 text-center">
              <p className="text-[8.5px] text-slate-400 leading-tight">
                Dokumen ini merupakan salinan rekod profil rasmi yang dijana secara digital daripada Portal Ahli MPGBSIM (https://www.mpgbsim.org/) pada {new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}. Cetakan atau muat turun fail PDF 1 muka surat ini diperakui sah sebagai bukti keahlian dan rekod institusi sekolah.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Digital Membership Card Modal */}
      <DigitalMembershipCardModal
        isOpen={isDigitalCardModalOpen}
        onClose={() => setIsDigitalCardModalOpen(false)}
      />
    </div>
  );
};
