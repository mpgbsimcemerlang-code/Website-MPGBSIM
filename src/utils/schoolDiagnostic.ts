import { MemberSchool, UserProfile } from '../types';

export interface DiagnosticCheckItem {
  id: string;
  category: 'code' | 'id' | 'linkage' | 'asset' | 'storage';
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'error';
  message: string;
  details?: string[];
  recommendation?: string;
}

export interface DiagnosticReport {
  timestamp: string;
  overallStatus: 'passed' | 'warning' | 'error';
  summary: {
    totalSchools: number;
    uniqueCodesCount: number;
    uniqueIdsCount: number;
    duplicateCodes: string[];
    duplicateIds: string[];
    hasLegacyMuslehCode: boolean;
    muslehSchoolFound: boolean;
    muslehLinkedCorrectly: boolean;
    portalUserLinked: boolean;
  };
  checks: DiagnosticCheckItem[];
}

/**
 * Runs a complete diagnostic verification on member schools and portal member data linkage.
 */
export function runSchoolDiagnostic(
  schools: MemberSchool[],
  portalUser?: UserProfile | null
): DiagnosticReport {
  const checks: DiagnosticCheckItem[] = [];
  const timestamp = new Date().toLocaleTimeString('ms-MY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // 1. Check School Code Uniqueness & Normalization
  const codeCounts = new Map<string, { count: number; schoolNames: string[]; ids: string[] }>();
  let hasEmptyCode = false;
  let hasLegacyMIA1009 = false;

  schools.forEach((sch) => {
    const rawCode = sch.code?.trim().toUpperCase();
    if (!rawCode) {
      hasEmptyCode = true;
      return;
    }
    if (rawCode === 'MIA1009') {
      hasLegacyMIA1009 = true;
    }

    const existing = codeCounts.get(rawCode) || { count: 0, schoolNames: [], ids: [] };
    existing.count += 1;
    existing.schoolNames.push(sch.name);
    existing.ids.push(sch.id);
    codeCounts.set(rawCode, existing);
  });

  const duplicateCodes: string[] = [];
  codeCounts.forEach((data, code) => {
    if (data.count > 1) {
      duplicateCodes.push(`${code} (${data.count}x: ${data.schoolNames.join(', ')})`);
    }
  });

  if (duplicateCodes.length === 0 && !hasEmptyCode) {
    checks.push({
      id: 'code-uniqueness',
      category: 'code',
      title: 'Keunikan Kod Sekolah (School Code Uniqueness)',
      description: 'Memastikan tiada pertindihan kod sekolah (seperti MJAC011, WRA0001, dll) di seluruh direktori.',
      status: 'passed',
      message: `Semua ${schools.length} institusi sekolah mempunyai kod pendaftaran yang unik dan sah.`,
      details: Array.from(codeCounts.keys()).map((c) => `Kod: ${c} ✓`),
    });
  } else {
    checks.push({
      id: 'code-uniqueness',
      category: 'code',
      title: 'Keunikan Kod Sekolah (School Code Uniqueness)',
      description: 'Memastikan tiada pertindihan kod sekolah di seluruh direktori.',
      status: 'error',
      message: `Dikesan ${duplicateCodes.length} kod bertindih / sekolah tanpa kod.`,
      details: duplicateCodes,
      recommendation: 'Jalankan fungsi Auto-Baiki untuk mencantumkan data sekolah yang berulang.',
    });
  }

  // 2. Specific Verification for MJAC011 (Sekolah Rendah Islam I Musleh)
  const muslehMatches = schools.filter(
    (s) =>
      s.code?.toUpperCase() === 'MJAC011' ||
      s.code?.toUpperCase() === 'MIA1009' ||
      s.id === 'sch-musleh-1' ||
      s.name.toLowerCase().includes('musleh')
  );

  const muslehSchool = schools.find(
    (s) => s.code?.toUpperCase() === 'MJAC011' || s.id === 'sch-musleh-1'
  );

  if (muslehMatches.length === 1 && muslehSchool?.code === 'MJAC011') {
    checks.push({
      id: 'musleh-code-integrity',
      category: 'code',
      title: 'Integriti Kod SRI I Musleh (MJAC011)',
      description: 'Pengesahan khusus rekod Sekolah Rendah Islam I Musleh dan kod rasmi MJAC011.',
      status: 'passed',
      message: `Sekolah Rendah Islam I Musleh tepat terpaut dengan kod unik [MJAC011] dan ID [sch-musleh-1].`,
      details: [
        `Nama Institusi: ${muslehSchool.name}`,
        `Kod Rasmi: ${muslehSchool.code}`,
        `Pengetua / Guru Besar: ${muslehSchool.principal || 'Ustaz Abdul Qayyum bin Yaakop'}`,
        `Negeri: ${muslehSchool.state} (${muslehSchool.district})`,
        `Foto Korporat PGB: ${muslehSchool.principalPhotoUrl ? 'Tersedia ✓' : 'Belum dimuat naik'}`,
        `Foto Institusi Sekolah: ${muslehSchool.schoolPhotoUrl ? 'Tersedia ✓' : 'Belum dimuat naik'}`,
      ],
    });
  } else if (muslehMatches.length > 1) {
    checks.push({
      id: 'musleh-code-integrity',
      category: 'code',
      title: 'Integriti Kod SRI I Musleh (MJAC011)',
      description: 'Pengesahan khusus rekod Sekolah Rendah Islam I Musleh dan kod rasmi MJAC011.',
      status: 'warning',
      message: `Dikesan ${muslehMatches.length} rekod berasingan berkaitan SRI I Musleh dalam sistem.`,
      details: muslehMatches.map((m) => `ID: ${m.id} | Kod: ${m.code} | Nama: ${m.name}`),
      recommendation: 'Gunakan butang Auto-Baiki untuk mencantumkan rekod Musleh menjadi satu entiti unik tunggal.',
    });
  } else if (!muslehSchool) {
    checks.push({
      id: 'musleh-code-integrity',
      category: 'code',
      title: 'Integriti Kod SRI I Musleh (MJAC011)',
      description: 'Pengesahan khusus rekod Sekolah Rendah Islam I Musleh dan kod rasmi MJAC011.',
      status: 'error',
      message: 'Sekolah Rendah Islam I Musleh tidak ditemui dalam senarai direktori semasa.',
      recommendation: 'Sistem perlu memulihkan rekod default Sekolah Rendah Islam I Musleh.',
    });
  }

  // 3. School ID Uniqueness Check
  const idCounts = new Map<string, number>();
  schools.forEach((s) => {
    idCounts.set(s.id, (idCounts.get(s.id) || 0) + 1);
  });
  const duplicateIds: string[] = [];
  idCounts.forEach((count, id) => {
    if (count > 1) duplicateIds.push(`${id} (${count}x)`);
  });

  if (duplicateIds.length === 0) {
    checks.push({
      id: 'id-uniqueness',
      category: 'id',
      title: 'Keunikan Pengenalan Sekolah (School ID Uniqueness)',
      description: 'Memastikan setiap entiti sekolah mempunyai ID rekod yang unik dalam pangkalan data.',
      status: 'passed',
      message: `Semua ${schools.length} sekolah mempunyai ID rekod pangkalan data yang unik.`,
    });
  } else {
    checks.push({
      id: 'id-uniqueness',
      category: 'id',
      title: 'Keunikan Pengenalan Sekolah (School ID Uniqueness)',
      description: 'Memastikan setiap entiti sekolah mempunyai ID rekod yang unik.',
      status: 'error',
      message: `Dikesan ${duplicateIds.length} ID sekolah bertindih: ${duplicateIds.join(', ')}`,
      recommendation: 'Auto-Baiki akan menjana ID unik bagi setiap rekod pendua.',
    });
  }

  // 4. Portal Member Profile Linkage Check
  let portalUserLinked = false;
  if (portalUser) {
    const userMemNo = portalUser.membershipNo || '';
    const userSchool = portalUser.school || '';
    const userEmail = portalUser.email || '';

    // Match with school
    const matched = schools.find((s) => {
      const codeMatch = s.code && userMemNo.includes(s.code);
      const emailMatch = s.email && userEmail.toLowerCase() === s.email.toLowerCase();
      const nameMatch = s.name && userSchool.toLowerCase().trim() === s.name.toLowerCase().trim();
      const muslehMatch =
        (s.code === 'MJAC011' || s.id === 'sch-musleh-1') &&
        (userMemNo.includes('MJAC011') || userMemNo.includes('MIA1009') || userSchool.toLowerCase().includes('musleh'));
      return codeMatch || emailMatch || nameMatch || muslehMatch;
    });

    if (matched) {
      portalUserLinked = true;
      const nameInSync = !matched.principal || !portalUser.fullName || matched.principal === portalUser.fullName;
      const schoolInSync = !matched.name || !portalUser.school || matched.name === portalUser.school;

      checks.push({
        id: 'member-portal-linkage',
        category: 'linkage',
        title: 'Pautan Profil Portal Ahli (Member Data Linkage)',
        description: 'Memastikan pengguna portal yang log masuk dipautkan dengan tepat kepada sekolah dan kod rasmi.',
        status: nameInSync && schoolInSync ? 'passed' : 'warning',
        message: nameInSync && schoolInSync
          ? `Akaun pengguna portal (${portalUser.email}) terpaut sempurna dengan ${matched.name} [${matched.code}].`
          : `Akaun portal terpaut tetapi terdapat perbezaan nama/PGB dengan direktori CMS.`,
        details: [
          `No. Keahlian Portal: ${portalUser.membershipNo}`,
          `Sekolah Terpaut: ${matched.name} (Kod: ${matched.code})`,
          `Nama PGB Portal: ${portalUser.fullName || '-'}`,
          `Nama PGB Direktori CMS: ${matched.principal || '-'}`,
          `Status Segerak Nama: ${nameInSync ? 'Sepadan ✓' : 'Perlu diselaraskan'}`,
        ],
      });
    } else {
      checks.push({
        id: 'member-portal-linkage',
        category: 'linkage',
        title: 'Pautan Profil Portal Ahli (Member Data Linkage)',
        description: 'Memastikan pengguna portal dipautkan kepada institusi sekolah.',
        status: 'warning',
        message: `Pengguna portal (${portalUser.email}) belum terpaut kepada mana-mana kod sekolah dalam direktori.`,
        details: [`No. Keahlian Semasa: ${userMemNo}`, `Institusi: ${userSchool}`],
        recommendation: 'Pautkan profil pengguna portal dengan kod sekolah yang sah.',
      });
    }
  } else {
    checks.push({
      id: 'member-portal-linkage',
      category: 'linkage',
      title: 'Pautan Profil Portal Ahli (Member Data Linkage)',
      description: 'Status pengguna portal ahli yang sedang aktif.',
      status: 'passed',
      message: 'Tiada sesi portal pengguna aktif dikesan pada peranti ini (Sedia untuk log masuk).',
      details: [
        'Konfigurasi auto-link sedia bertindak apabila Pengetua/Guru Besar log masuk menggunakan emel atau kod sekolah (cth: MJAC011).',
      ],
    });
  }

  // 5. Data Completeness & Asset Integrity
  const missingPhotos: string[] = [];
  const missingPrincipals: string[] = [];
  schools.forEach((s) => {
    if (!s.principal || s.principal.trim() === '') {
      missingPrincipals.push(s.name);
    }
    if (!s.principalPhotoUrl && !s.schoolPhotoUrl) {
      missingPhotos.push(`${s.name} (${s.code})`);
    }
  });

  checks.push({
    id: 'asset-integrity',
    category: 'asset',
    title: 'Kelengkapan Maklumat & Aset Visual (Data & Assets)',
    description: 'Pemeriksaan nama Pengetua/Guru Besar, foto korporat, dan gambar foto institusi.',
    status: missingPrincipals.length > 0 ? 'warning' : 'passed',
    message:
      missingPrincipals.length > 0
        ? `Terdapat ${missingPrincipals.length} sekolah yang belum menetapkan nama Pengetua/Guru Besar.`
        : `Semua ${schools.length} institusi sekolah mempunyai maklumat Pengetua/Guru Besar yang lengkap.`,
    details: [
      `Sekolah dengan foto PGB atau institusi: ${schools.length - missingPhotos.length} / ${schools.length}`,
      ...(missingPrincipals.length > 0 ? [`Sekolah tanpa PGB: ${missingPrincipals.slice(0, 3).join(', ')}`] : []),
    ],
  });

  // Calculate Overall Status
  let overallStatus: 'passed' | 'warning' | 'error' = 'passed';
  if (checks.some((c) => c.status === 'error')) {
    overallStatus = 'error';
  } else if (checks.some((c) => c.status === 'warning')) {
    overallStatus = 'warning';
  }

  return {
    timestamp,
    overallStatus,
    summary: {
      totalSchools: schools.length,
      uniqueCodesCount: codeCounts.size,
      uniqueIdsCount: idCounts.size,
      duplicateCodes,
      duplicateIds,
      hasLegacyMuslehCode: hasLegacyMIA1009,
      muslehSchoolFound: !!muslehSchool,
      muslehLinkedCorrectly: muslehMatches.length === 1 && muslehSchool?.code === 'MJAC011',
      portalUserLinked,
    },
    checks,
  };
}

/**
 * Repairs data integrity:
 * - Deduplicates schools by code and id
 * - Upgrades any legacy MIA1009 to MJAC011
 * - Preserves the most up-to-date and populated fields
 * - Synchronizes portal user profile if present
 */
export function repairSchoolIntegrity(
  schools: MemberSchool[],
  portalUser?: UserProfile | null
): {
  repairedSchools: MemberSchool[];
  repairedUser: UserProfile | null;
  actionsTaken: string[];
} {
  const actionsTaken: string[] = [];
  const schoolsMap = new Map<string, MemberSchool>();

  // Process schools and deduplicate
  schools.forEach((sch) => {
    // Check if Musleh school
    const isMusleh =
      sch.id === 'sch-musleh-1' ||
      sch.code?.toUpperCase() === 'MJAC011' ||
      sch.code?.toUpperCase() === 'MIA1009' ||
      sch.name.toLowerCase().includes('musleh') ||
      (sch.email && sch.email.toLowerCase().includes('imusleh'));

    let targetId = sch.id;
    let targetCode = sch.code?.trim().toUpperCase() || '';

    if (isMusleh) {
      targetId = 'sch-musleh-1';
      targetCode = 'MJAC011';
      if (sch.code === 'MIA1009') {
        actionsTaken.push(`Mengemaskini kod lapuk MIA1009 kepada kod rasmi MJAC011 bagi ${sch.name}`);
      }
    }

    const key = `code:${targetCode || targetId}`;
    const existing = schoolsMap.get(key) || schoolsMap.get(targetId);

    if (existing) {
      // Merge: prefer non-empty and newer properties
      const merged: MemberSchool = {
        ...existing,
        ...sch,
        id: targetId,
        code: targetCode,
        name: sch.name || existing.name,
        principal: sch.principal || existing.principal,
        principalPhotoUrl: sch.principalPhotoUrl || existing.principalPhotoUrl,
        schoolPhotoUrl: sch.schoolPhotoUrl || existing.schoolPhotoUrl,
        logoUrl: sch.logoUrl || existing.logoUrl,
        state: sch.state || existing.state,
        district: sch.district || existing.district,
        phone: sch.phone || existing.phone,
        email: sch.email || existing.email,
        studentCount: Math.max(sch.studentCount || 0, existing.studentCount || 0),
        teacherCount: Math.max(sch.teacherCount || 0, existing.teacherCount || 0),
        updatedAt: new Date().toISOString(),
      };
      schoolsMap.set(key, merged);
      schoolsMap.set(targetId, merged);
      actionsTaken.push(`Mencantumkan rekod bertindih bagi institusi "${merged.name}" (Kod: ${targetCode})`);
    } else {
      const normalized: MemberSchool = {
        ...sch,
        id: targetId,
        code: targetCode,
        updatedAt: sch.updatedAt || new Date().toISOString(),
      };
      schoolsMap.set(key, normalized);
      schoolsMap.set(targetId, normalized);
    }
  });

  // Ensure Sekolah Rendah Islam I Musleh exists
  let musleh = Array.from(schoolsMap.values()).find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1');
  if (!musleh) {
    musleh = {
      id: 'sch-musleh-1',
      name: 'Sekolah Rendah Islam I Musleh',
      code: 'MJAC011',
      type: 'Rakan Musleh',
      state: 'Melaka',
      district: 'Melaka Tengah',
      principal: 'Ustaz Abdul Qayyum bin Yaakop',
      email: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
      phone: '+60 6-335 1290',
      studentCount: 420,
      teacherCount: 32,
      joinYear: 2026,
      website: 'https://sri-imusleh.edu.my',
      address: 'KM 9, Jalan Bukit Baru, 75150 Melaka',
      description:
        'Institusi pendidikan rendah Islam bernaung di bawah Rangkaian Musleh, memupuk pembinaan sahsiah Rabbani, hafazan Al-Quran dan kecemerlangan kurikulum kebangsaan.',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
      schoolPhotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
      principalPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      updatedAt: new Date().toISOString(),
    };
    schoolsMap.set('sch-musleh-1', musleh);
    schoolsMap.set('code:MJAC011', musleh);
    actionsTaken.push('Memulihkan entiti rasmi Sekolah Rendah Islam I Musleh (Kod: MJAC011)');
  }

  // Deduplicate array
  const seenIds = new Set<string>();
  const seenCodes = new Set<string>();
  const finalSchools: MemberSchool[] = [];

  schoolsMap.forEach((sch) => {
    const codeKey = sch.code?.toUpperCase();
    if (!seenIds.has(sch.id) && (!codeKey || !seenCodes.has(codeKey))) {
      seenIds.add(sch.id);
      if (codeKey) seenCodes.add(codeKey);
      finalSchools.push(sch);
    }
  });

  // Repair portal user if present
  let repairedUser: UserProfile | null = null;
  if (portalUser) {
    repairedUser = { ...portalUser };
    const userMemNo = portalUser.membershipNo || '';
    const userEmail = (portalUser.email || '').toLowerCase().trim();
    const isMuslehUser =
      userMemNo.includes('MJAC011') ||
      userMemNo.includes('MIA1009') ||
      userEmail.includes('imusleh') ||
      (portalUser.school && portalUser.school.toLowerCase().includes('musleh'));

    if (isMuslehUser) {
      repairedUser.membershipNo = 'MPGB-2026-MJAC011';
      repairedUser.school = musleh.name;
      repairedUser.schoolType = musleh.type;
      repairedUser.state = musleh.state;
      if (musleh.principal) {
        repairedUser.fullName = musleh.principal;
      }
      if (musleh.principalPhotoUrl) {
        repairedUser.photoURL = musleh.principalPhotoUrl;
      }
      if (musleh.schoolPhotoUrl) {
        repairedUser.schoolPhotoUrl = musleh.schoolPhotoUrl;
      }
      repairedUser.updatedAt = new Date().toISOString();
      actionsTaken.push('Menyelaraskan profil Portal Ahli dengan kod rasmi MPGB-2026-MJAC011 & data Pengetua.');
    } else {
      // Find matching school for normal user
      const matched = finalSchools.find(
        (s) => (s.code && userMemNo.includes(s.code)) || (s.email && s.email.toLowerCase() === userEmail)
      );
      if (matched) {
        if (matched.principal && !repairedUser.fullName) repairedUser.fullName = matched.principal;
        if (matched.name && !repairedUser.school) repairedUser.school = matched.name;
        actionsTaken.push(`Menyelaraskan profil pengguna portal dengan institusi "${matched.name}"`);
      }
    }
  }

  return {
    repairedSchools: finalSchools,
    repairedUser,
    actionsTaken,
  };
}
