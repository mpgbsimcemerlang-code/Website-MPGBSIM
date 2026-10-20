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

  schools.forEach((sch) => {
    const rawCode = sch.code?.trim().toUpperCase();
    if (!rawCode) {
      hasEmptyCode = true;
      return;
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

  // 2. Specific Verification for Musleh Schools (Primary SRI MJAC011 & Secondary SMA JAIM/SAS(M)130)
  const sriMusleh = schools.find(
    (s) => s.code?.toUpperCase() === 'MJAC011' || s.id === 'sch-musleh-1'
  );
  const smaMusleh = schools.find(
    (s) =>
      s.code?.toUpperCase() === 'JAIM/SAS(M)130' ||
      s.code?.toUpperCase() === 'MIA1009' ||
      s.code?.toUpperCase().includes('JAIM/SAS') ||
      s.email?.toLowerCase() === 'smimmelaka@gmail.com' ||
      (s.name?.toLowerCase().includes('menengah') && s.name?.toLowerCase().includes('musleh'))
  );

  if (sriMusleh && smaMusleh) {
    checks.push({
      id: 'musleh-code-integrity',
      category: 'code',
      title: 'Integriti Institusi Musleh (SRI MJAC011 & SMA JAIM/SAS(M)130)',
      description: 'Pengesahan integriti kedua-dua institusi berasingan: Sekolah Rendah Islam I Musleh dan Sekolah Menengah Agama I-Musleh.',
      status: 'passed',
      message: `Kedua-dua institusi Musleh berdaftar dengan rekod dan kod berasingan yang sah: SRI I Musleh [MJAC011] dan SMA I-Musleh [JAIM/SAS(M)130].`,
      details: [
        `SRI I Musleh: ${sriMusleh.name} (Kod: ${sriMusleh.code}) - Guru Besar: ${sriMusleh.principal}`,
        `SMA I-Musleh: ${smaMusleh.name} (Kod: ${smaMusleh.code}) - Pengetua: ${smaMusleh.principal} | Emel: ${smaMusleh.email}`,
      ],
    });
  } else if (sriMusleh && !smaMusleh) {
    checks.push({
      id: 'musleh-code-integrity',
      category: 'code',
      title: 'Integriti Institusi Musleh (SRI MJAC011 & SMA JAIM/SAS(M)130)',
      description: 'Pengesahan institusi SRI I Musleh dan SMA I-Musleh.',
      status: 'warning',
      message: `SRI I Musleh [MJAC011] ditemui, manakala Sekolah Menengah Agama I-Musleh [JAIM/SAS(M)130] perlu dipastikan dalam direktori.`,
      details: [`SRI I Musleh: ${sriMusleh.name} [Kod: ${sriMusleh.code}]`],
    });
  } else {
    checks.push({
      id: 'musleh-code-integrity',
      category: 'code',
      title: 'Integriti Institusi Musleh (SRI MJAC011 & SMA JAIM/SAS(M)130)',
      description: 'Pengesahan rekod sekolah Musleh.',
      status: 'warning',
      message: 'Perlu semakan rekod institusi Musleh dalam senarai direktori.',
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
      const isPrimaryMuslehMatch =
        (s.code === 'MJAC011' || s.id === 'sch-musleh-1') &&
        (userMemNo.includes('MJAC011') ||
          userEmail === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
          userEmail.includes('imuslehmelaka') ||
          (userSchool.toLowerCase().includes('musleh') && (userSchool.toLowerCase().includes('rendah') || userSchool.toLowerCase().includes('sri'))));

      const isSecondaryMuslehMatch =
        (s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.email === 'smimmelaka@gmail.com') &&
        (userMemNo.includes('JAIM/SAS') ||
          userMemNo.includes('MIA1009') ||
          userEmail === 'smimmelaka@gmail.com' ||
          (userSchool.toLowerCase().includes('musleh') && (userSchool.toLowerCase().includes('menengah') || userSchool.toLowerCase().includes('sma'))));

      return codeMatch || emailMatch || nameMatch || isPrimaryMuslehMatch || isSecondaryMuslehMatch;
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
        'Konfigurasi auto-link sedia bertindak apabila Pengetua/Guru Besar log masuk menggunakan emel atau kod sekolah (cth: MJAC011 atau MIA1009).',
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
      hasLegacyMuslehCode: false,
      muslehSchoolFound: !!sriMusleh && !!smaMusleh,
      muslehLinkedCorrectly: !!sriMusleh && !!smaMusleh && sriMusleh.code === 'MJAC011' && (smaMusleh.code === 'MIA1009' || smaMusleh.code?.includes('JAIM/SAS')),
      portalUserLinked,
    },
    checks,
  };
}

/**
 * Repairs data integrity:
 * - Deduplicates schools by code and id
 * - Preserves distinct SRI I Musleh (MJAC011) and SMA I-Musleh (MIA1009)
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
    const rawCode = sch.code?.trim().toUpperCase() || '';
    const rawName = sch.name?.trim().toLowerCase() || '';
    const rawEmail = sch.email?.trim().toLowerCase() || '';

    // Differentiate between Primary Musleh (SRI) and Secondary Musleh (SMA)
    const isPrimaryMusleh =
      sch.id === 'sch-musleh-1' ||
      rawCode === 'MJAC011' ||
      rawEmail === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      (rawName.includes('musleh') && (rawName.includes('rendah') || rawName.includes('sri')));

    const isSecondaryMusleh =
      sch.id === 'sch-musleh-menengah-1' ||
      sch.id === 'school-1792309529681-bv4d' ||
      rawCode === 'MIA1009' ||
      rawCode.includes('JAIM/SAS') ||
      rawEmail === 'smimmelaka@gmail.com' ||
      (rawName.includes('musleh') && (rawName.includes('menengah') || rawName.includes('sma') || rawName.includes('smim')));

    let targetId = sch.id;
    let targetCode = rawCode;

    if (isPrimaryMusleh) {
      targetId = 'sch-musleh-1';
      targetCode = 'MJAC011';
    } else if (isSecondaryMusleh) {
      targetId = sch.id.startsWith('school-') ? sch.id : 'sch-musleh-menengah-1';
      targetCode = 'JAIM/SAS(M)130';
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
        designation: sch.designation || existing.designation,
        icNumber: sch.icNumber || existing.icNumber,
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

  // Enforce correct school level, designation & official Google Maps address for institutions with potential legacy cache drift
  schoolsMap.forEach((s) => {
    const sNameLower = (s.name || '').toLowerCase();
    if (s.code === 'BLAD001' || s.name?.includes('SEKOLAH MENENGAH SRI AL-AMIN BANGI')) {
      s.type = 'Sekolah Menengah';
      s.designation = 'Pengetua';
      if (!s.principal?.includes('Pengetua') && s.principal) {
        s.principal = `${s.principal} (Pengetua)`;
      }
    } else if (s.code === 'AYR2001' || s.name?.includes('SEKOLAH RENDAH ISLAM AL HIDAYAH IPOH')) {
      s.type = 'Sekolah Rendah';
      s.designation = 'Guru Besar';
    }

    if (sNameLower.includes('al amin kuching') || sNameLower.includes('al-amin kuching')) {
      s.state = 'Sarawak';
      s.district = s.district && s.district.toLowerCase() !== 'selangor' ? s.district : 'Kuching';
      if (sNameLower.includes('menengah') || /\bsm\b|\bsmi\b/i.test(s.name || '')) {
        s.type = 'Sekolah Menengah';
        s.address =
          '1st Floor, Sublot No. 1, 10 to 68, 71, 72, Lot 10010, Section 65, KTLD, The Hub@Matang Jaya, 93050 Kuching, Sarawak';
      } else if (!s.address || !s.address.toLowerCase().includes('kuching')) {
        s.address = 'Matang Jaya, 93050 Kuching, Sarawak';
      }
    }
  });

  // 1. Ensure Sekolah Rendah Islam I Musleh exists (MJAC011)
  let sriMusleh = Array.from(schoolsMap.values()).find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1');
  if (!sriMusleh) {
    sriMusleh = {
      id: 'sch-musleh-1',
      name: 'SEKOLAH RENDAH ISLAM I MUSLEH',
      code: 'MJAC011',
      type: 'Sekolah Rendah',
      state: 'Melaka',
      district: 'Melaka Tengah',
      principal: 'Abdul Qayyum bin Yaakop',
      designation: 'Guru Besar',
      icNumber: '850312-04-5123',
      email: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
      phone: '+60 6-335 1290',
      studentCount: 428,
      teacherCount: 32,
      joinYear: 2026,
      serviceStartYear: 2026,
      pgbStartYear: 2026,
      website: 'https://imuslehmelaka.edu.my',
      address: 'No. 25-1, Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
      description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Abdul Qayyum bin Yaakop.',
      logoUrl: '/mpgbsim-official-logo.png',
      schoolPhotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
      principalPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      updatedAt: new Date().toISOString(),
    };
    schoolsMap.set('sch-musleh-1', sriMusleh);
    schoolsMap.set('code:MJAC011', sriMusleh);
    actionsTaken.push('Memastikan entiti rasmi Sekolah Rendah Islam I Musleh (Kod: MJAC011) terpelihara');
  } else {
    if (!sriMusleh.icNumber) {
      sriMusleh.icNumber = '850312-04-5123';
    }
    if (!sriMusleh.address || sriMusleh.address.toLowerCase().includes('peringgit')) {
      sriMusleh.address = 'No. 25-1, Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka';
    }
  }

  // 2. Ensure Sekolah Menengah Agama I-Musleh exists (JAIM/SAS(M)130)
  let smaMusleh = Array.from(schoolsMap.values()).find(
    (s) =>
      s.code === 'JAIM/SAS(M)130' ||
      s.code === 'MIA1009' ||
      s.email?.toLowerCase() === 'smimmelaka@gmail.com' ||
      s.code?.includes('JAIM/SAS') ||
      (s.name?.toLowerCase().includes('menengah') && s.name?.toLowerCase().includes('musleh'))
  );
  if (!smaMusleh) {
    smaMusleh = {
      id: 'sch-musleh-menengah-1',
      name: 'SEKOLAH MENENGAH AGAMA I-MUSLEH',
      code: 'JAIM/SAS(M)130',
      type: 'Sekolah Menengah',
      state: 'Melaka',
      district: 'Ayer Keroh',
      principal: 'Masitah Binti Seikh Omar (Pengetua)',
      designation: 'Pengetua',
      icNumber: '730627-01-5156',
      email: 'smimmelaka@gmail.com',
      schoolEmail: 'smimmelaka@gmail.com',
      pgbEmail: 'smimmelaka@gmail.com',
      phone: '06-2349405',
      schoolPhone: '06-2349405',
      pgbPhone: '013-2695286',
      studentCount: 79,
      teacherCount: 10,
      joinYear: 2023,
      serviceStartYear: 2023,
      pgbStartYear: 2023,
      website: 'https://i-musleh.com',
      address: 'Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
      description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Masitah Binti Seikh Omar (Pengetua).',
      logoUrl: '/mpgbsim-official-logo.png',
      schoolPhotoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80',
      principalPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      updatedAt: new Date().toISOString(),
    };
    schoolsMap.set('sch-musleh-menengah-1', smaMusleh);
    schoolsMap.set('code:JAIM/SAS(M)130', smaMusleh);
    actionsTaken.push('Memastikan entiti rasmi Sekolah Menengah Agama I-Musleh (Kod: JAIM/SAS(M)130) terpelihara');
  } else {
    smaMusleh.code = 'JAIM/SAS(M)130';
    if (!smaMusleh.icNumber) {
      smaMusleh.icNumber = '730627-01-5156';
    }
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
    const userSchool = (portalUser.school || '').toLowerCase().trim();

    const isSecondaryMuslehUser =
      userMemNo.includes('JAIM/SAS') ||
      userMemNo.includes('MIA1009') ||
      userEmail === 'smimmelaka@gmail.com' ||
      (userSchool.includes('musleh') && (userSchool.includes('menengah') || userSchool.includes('sma') || userSchool.includes('smim')));

    const isPrimaryMuslehUser =
      !isSecondaryMuslehUser &&
      (userMemNo.includes('MJAC011') ||
        userEmail === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
        userEmail.includes('imuslehmelaka') ||
        (userSchool.includes('musleh') && (userSchool.includes('rendah') || userSchool.includes('sri'))));

    if (isSecondaryMuslehUser && smaMusleh) {
      repairedUser.membershipNo = 'MPGB-2026-JAIM/SAS(M)130';
      repairedUser.schoolCode = 'JAIM/SAS(M)130';
      repairedUser.school = smaMusleh.name;
      repairedUser.schoolType = smaMusleh.type;
      repairedUser.position = 'Pengetua';
      repairedUser.state = smaMusleh.state;
      if (!repairedUser.icNumber && smaMusleh.icNumber) {
        repairedUser.icNumber = smaMusleh.icNumber;
      }
      if (smaMusleh.principal) {
        repairedUser.fullName = smaMusleh.principal;
      }
      if (smaMusleh.principalPhotoUrl) {
        repairedUser.photoURL = smaMusleh.principalPhotoUrl;
      }
      if (smaMusleh.schoolPhotoUrl) {
        repairedUser.schoolPhotoUrl = smaMusleh.schoolPhotoUrl;
      }
      repairedUser.updatedAt = new Date().toISOString();
      actionsTaken.push('Menyelaraskan profil Portal Ahli dengan Sekolah Menengah Agama I-Musleh [MPGB-2026-JAIM/SAS(M)130].');
    } else if (isPrimaryMuslehUser && sriMusleh) {
      repairedUser.membershipNo = 'MPGB-2026-MJAC011';
      repairedUser.school = sriMusleh.name;
      repairedUser.schoolType = sriMusleh.type;
      repairedUser.position = 'Guru Besar';
      repairedUser.state = sriMusleh.state;
      if (!repairedUser.icNumber && sriMusleh.icNumber) {
        repairedUser.icNumber = sriMusleh.icNumber;
      }
      if (sriMusleh.principal) {
        repairedUser.fullName = sriMusleh.principal;
      }
      if (sriMusleh.principalPhotoUrl) {
        repairedUser.photoURL = sriMusleh.principalPhotoUrl;
      }
      if (sriMusleh.schoolPhotoUrl) {
        repairedUser.schoolPhotoUrl = sriMusleh.schoolPhotoUrl;
      }
      repairedUser.updatedAt = new Date().toISOString();
      actionsTaken.push('Menyelaraskan profil Portal Ahli dengan Sekolah Rendah Islam I Musleh [MPGB-2026-MJAC011].');
    } else {
      // Find matching school for normal user with strict hierarchical priority
      const matched =
        (portalUser.schoolId ? finalSchools.find((s) => s.id === portalUser.schoolId) : undefined) ||
        finalSchools.find((s) => portalUser.uid === `sch-user-${s.id}` || portalUser.uid === s.id) ||
        (portalUser.schoolCode ? finalSchools.find((s) => s.code && s.code.toUpperCase() === portalUser.schoolCode?.toUpperCase()) : undefined) ||
        (userMemNo ? finalSchools.find((s) => s.code && userMemNo.toUpperCase().includes(s.code.toUpperCase())) : undefined) ||
        (portalUser.school ? finalSchools.find((s) => s.name && s.name.toLowerCase().trim() === portalUser.school?.toLowerCase().trim()) : undefined) ||
        (portalUser.pgbEmail ? finalSchools.find((s) => s.pgbEmail && s.pgbEmail.toLowerCase().trim() === portalUser.pgbEmail?.toLowerCase().trim()) : undefined) ||
        (userEmail ? finalSchools.find((s) => {
          const emailMatches = s.email && s.email.toLowerCase() === userEmail;
          if (!emailMatches) return false;
          if (portalUser.schoolType && s.type && portalUser.schoolType.toLowerCase().trim() === s.type.toLowerCase().trim()) return true;
          if (portalUser.position === 'Guru Besar' && s.type?.toLowerCase().includes('rendah')) return true;
          if (portalUser.position === 'Pengetua' && s.type?.toLowerCase().includes('menengah')) return true;
          return false;
        }) : undefined);
      if (matched) {
        if (matched.principal && !repairedUser.fullName) repairedUser.fullName = matched.principal;
        if (matched.name && !repairedUser.school) repairedUser.school = matched.name;
        if (matched.icNumber && !repairedUser.icNumber) repairedUser.icNumber = matched.icNumber;
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
