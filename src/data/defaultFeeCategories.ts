import { FeeCategoryItem } from '../types';

export const DEFAULT_FEE_CATEGORIES: FeeCategoryItem[] = [
  // 1. Fasal 6(1): Yuran Ahli Biasa (Penubuhan 1-3 Tahun)
  {
    id: 'fee-cat-biasa-1-3',
    code: 'YURAN_AHLI_1_3_TAHUN',
    name: 'Yuran Ahli Biasa (Penubuhan 1–3 Tahun)',
    shortName: 'Ahli Biasa (1–3 Tahun)',
    amount: 100,
    membershipType: 'Ahli Biasa',
    enrollmentCriteria: 'Semua Enrolmen Murid',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    badge: 'Ahli Biasa • 1–3 Tahun',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description:
      'Yuran tahunan bagi Institusi Islam Ahli Biasa (berdaftar IKRAM MUSLEH & KPM/Jabatan Agama Islam) berusia penubuhan satu hingga tiga tahun.',
    features: [
      'Kadar khas penubuhan awal sekolah 1 hingga 3 tahun (Fasal 6(1))',
      'Keahlian automatik Guru Besar / Mudir / Pengetua (Fasal 4(2))',
      'Hak mengundi & perbincangan usul dalam Mesyuarat Agung MPGBSIM',
      'Sijil Keahlian Rasmi & akses penuh Portal Ahli PGB',
    ],
    academicSession: '2026/2027',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    isActive: true,
    order: 1,
    isCustom: false,
  },

  // 2. Fasal 6(1): Yuran Ahli Biasa (> 3 Tahun • <= 300 Murid)
  {
    id: 'fee-cat-biasa-bawah-300',
    code: 'YURAN_AHLI_BAWAH_300',
    name: 'Yuran Ahli Biasa (> 3 Tahun • ≤ 300 Murid)',
    shortName: 'Ahli Biasa (≤ 300 Murid)',
    amount: 300,
    membershipType: 'Ahli Biasa',
    enrollmentCriteria: '300 Murid ke Bawah (≤ 300)',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    badge: 'Ahli Biasa • ≤ 300 Murid',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description:
      'Yuran tahunan bagi Institusi Islam Ahli Biasa yang telah ditubuhkan melebihi tiga tahun dengan enrolmen murid 300 orang ke bawah.',
    features: [
      'Mengikut kategori enrolmen ≤ 300 orang murid (Fasal 6(1))',
      'Hak penuh mengundi & membawa usul dalam Mesyuarat Agung Tahunan',
      'Penyertaan program latihan ikhtisas & kompetensi PGB (Fasal 3(3))',
      'Akses penuh Portal Ahli, Kad Digital QR & Direktori Kebangsaan',
    ],
    academicSession: '2026/2027',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    isActive: true,
    order: 2,
    isCustom: false,
  },

  // 3. Fasal 6(1): Yuran Ahli Biasa (> 3 Tahun • >= 301 Murid)
  {
    id: 'fee-cat-biasa-atas-301',
    code: 'YURAN_AHLI_ATAS_301',
    name: 'Yuran Ahli Biasa (> 3 Tahun • ≥ 301 Murid)',
    shortName: 'Ahli Biasa (≥ 301 Murid)',
    amount: 600,
    membershipType: 'Ahli Biasa',
    enrollmentCriteria: '301 Murid ke Atas (≥ 301)',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    badge: 'Ahli Biasa • ≥ 301 Murid',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description:
      'Yuran tahunan bagi Institusi Islam Ahli Biasa yang telah ditubuhkan melebihi tiga tahun dengan enrolmen murid 301 orang ke atas.',
    features: [
      'Mengikut kategori enrolmen ≥ 301 orang murid (Fasal 6(1))',
      'Hak penuh mengundi & membawa usul dalam Mesyuarat Agung Tahunan',
      'Penyertaan program latihan ikhtisas, kurikulum & kokurikulum (Fasal 3)',
      'Akses penuh Portal Ahli, Kad Digital QR & Direktori Kebangsaan',
    ],
    academicSession: '2026/2027',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    isActive: true,
    order: 3,
    isCustom: false,
  },

  // 4. Fasal 6(2): Yuran Ahli Bersekutu (Penubuhan 1-3 Tahun)
  {
    id: 'fee-cat-bersekutu-1-3',
    code: 'YURAN_BERSEKUTU_1_3_TAHUN',
    name: 'Yuran Ahli Bersekutu (Penubuhan 1–3 Tahun)',
    shortName: 'Ahli Bersekutu (1–3 Tahun)',
    amount: 200,
    membershipType: 'Ahli Bersekutu',
    enrollmentCriteria: 'Semua Enrolmen Murid',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    badge: 'Ahli Bersekutu • 1–3 Tahun',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description:
      'Yuran tahunan bagi Institusi Pendidikan Ahli Bersekutu (berdaftar KPM/Jabatan Agama, bukan rangkaian IKRAM MUSLEH) berusia 1–3 tahun.',
    features: [
      'Keahlian Bersekutu mengikut Fasal 4(7) & Fasal 6(2)',
      'Hak menghadiri Mesyuarat Agung Tahunan & program kebangsaan',
      'Sijil Pengiktirafan Keahlian Bersekutu MPGBSIM',
      'Akses Portal Ahli PGB & Direktori Jaringan Sekolah Islam',
    ],
    academicSession: '2026/2027',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    isActive: true,
    order: 4,
    isCustom: false,
  },

  // 5. Fasal 6(2): Yuran Ahli Bersekutu (> 3 Tahun • <= 300 Murid)
  {
    id: 'fee-cat-bersekutu-bawah-300',
    code: 'YURAN_BERSEKUTU_BAWAH_300',
    name: 'Yuran Ahli Bersekutu (> 3 Tahun • ≤ 300 Murid)',
    shortName: 'Ahli Bersekutu (≤ 300 Murid)',
    amount: 500,
    membershipType: 'Ahli Bersekutu',
    enrollmentCriteria: '300 Murid ke Bawah (≤ 300)',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    badge: 'Ahli Bersekutu • ≤ 300 Murid',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    description:
      'Yuran tahunan bagi Institusi Pendidikan Ahli Bersekutu berusia lebih 3 tahun dengan enrolmen murid 300 orang ke bawah.',
    features: [
      'Yuran Ahli Bersekutu institusi matang enrolmen ≤ 300 murid (Fasal 6(2))',
      'Hak menghadiri Mesyuarat Agung & perbahasan umum majlis',
      'Akses latihan kepimpinan kepengetuaan & perkongsian amalan terbaik',
      'Akses penuh Portal Ahli, Kad Digital QR & Direktori Kebangsaan',
    ],
    academicSession: '2026/2027',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    isActive: true,
    order: 5,
    isCustom: false,
  },

  // 6. Fasal 6(2): Yuran Ahli Bersekutu (> 3 Tahun • >= 301 Murid)
  {
    id: 'fee-cat-bersekutu-atas-301',
    code: 'YURAN_BERSEKUTU_ATAS_301',
    name: 'Yuran Ahli Bersekutu (> 3 Tahun • ≥ 301 Murid)',
    shortName: 'Ahli Bersekutu (≥ 301 Murid)',
    amount: 800,
    membershipType: 'Ahli Bersekutu',
    enrollmentCriteria: '301 Murid ke Atas (≥ 301)',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    badge: 'Ahli Bersekutu • ≥ 301 Murid',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description:
      'Yuran tahunan bagi Institusi Pendidikan Ahli Bersekutu berusia lebih 3 tahun dengan enrolmen murid 301 orang ke atas.',
    features: [
      'Yuran Ahli Bersekutu institusi matang enrolmen ≥ 301 murid (Fasal 6(2))',
      'Hak menghadiri Mesyuarat Agung & wacana pendidikan kebangsaan',
      'Penyertaan persidangan kepimpinan & perkongsian ekosistem Rabbani',
      'Akses penuh Portal Ahli, Kad Digital QR & Direktori Kebangsaan',
    ],
    academicSession: '2026/2027',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    isActive: true,
    order: 6,
    isCustom: false,
  },

  // 7. Fasal 6(3): Yuran Pendaftaran Masuk Baharu
  {
    id: 'fee-cat-daftar-baharu',
    code: 'YURAN_PENDAFTARAN_BARU',
    name: 'Yuran Pendaftaran Masuk (Ahli Baharu) — Fasal 6(3)',
    shortName: 'Pendaftaran Ahli Baharu',
    amount: 100,
    membershipType: 'Semua',
    enrollmentCriteria: 'Sekolah Baharu Memohon',
    clause: 'Fasal 6(3)',
    badge: 'Pendaftaran • Sekali Sahaja',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description:
      'Bayaran pendaftaran masuk sekali sahaja semasa institusi sekolah memohon menjadi Ahli Biasa atau Ahli Bersekutu MPGBSIM.',
    features: [
      'Bayaran sekali sahaja (*one-time admission fee*) mengikut Fasal 6(3)',
      'Pemprosesan dossier permohonan keahlian oleh Urus Setia Pusat',
      'Penyediaan sijil watikah keahlian rasmi & nombor pendaftaran majlis',
    ],
    academicSession: '2026/2027',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    isActive: true,
    order: 7,
    isCustom: false,
  },

  // 8. Yuran Konvensyen Kebangsaan PGB
  {
    id: 'fee-cat-konvensyen-kpsi',
    code: 'YURAN_KONVENSYEN_KPSI',
    name: 'Yuran Penyertaan Konvensyen Kebangsaan Pemimpin Sekolah Islam',
    shortName: 'Konvensyen Kebangsaan KPSI',
    amount: 250,
    membershipType: 'Semua',
    enrollmentCriteria: 'Perwakilan PGB / GPK',
    clause: 'Aktiviti Ikhtisas Fasal 3(3)',
    badge: 'Program & Konvensyen',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description:
      'Penyertaan persidangan dwitahunan kepimpinan sekolah Islam kebangsaan, pembentangan kertas kerja amalan terbaik & kit konvensyen.',
    features: [
      'Penyertaan 2 hari 1 malam konvensyen kepimpinan kebangsaan',
      'Kit konvensyen, fail modul kepimpinan & sijil penyertaan digital ber-QR',
      'Makan minum rasmi sepanjang persidangan berlangsung',
    ],
    academicSession: '2026/2027',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    isActive: true,
    order: 8,
    isCustom: false,
  },
];
