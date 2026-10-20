/**
 * Data Permulaan & Sampel untuk MPGBSIM Member Portal
 * Dinyatakan dengan jelas sebagai DATA DEMO untuk ilustrasi fungsi portal rasmi.
 */

import {
  UserProfile,
  AnnouncementItem,
  PortalDocument,
  BestPracticeItem,
  MemberSubmission,
  PortalResource,
  PortalNotification,
  AuditLogItem,
  AIPromptItem,
  AIToolItem,
} from '../types';

export const DEMO_USERS: Record<string, UserProfile> = {
  MUSLEH: {
    uid: 'sch-user-sch-musleh-1',
    email: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
    fullName: 'Ustaz Abdul Qayyum bin Yaakop',
    role: 'MEMBER',
    position: 'Guru Besar',
    school: 'Sekolah Rendah Islam I Musleh',
    schoolType: 'Rakan Musleh',
    state: 'Melaka',
    phone: '+60 6-335 1290',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
    expertise: ['Kepimpinan Instruksional', 'Pengurusan Sekolah Islam', 'Pendidikan Bersepadu'],
    interests: ['Transformasi Digital & AI', 'Pembangunan Sahsiah Rabbani', 'Inovasi Kokurikulum'],
    membershipNo: 'MPGB-2026-MJAC011',
    joinYear: 2026,
    status: 'active',
    hidePhone: true,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-09-24T10:00:00Z',
  },
  MUSLEH_MENENGAH: {
    uid: 'sch-user-sch-musleh-menengah-1',
    email: 'smimmelaka@gmail.com',
    fullName: 'Masitah Binti Seikh Omar',
    role: 'MEMBER',
    position: 'Pengetua',
    school: 'Sekolah Menengah Agama I-Musleh',
    schoolType: 'Sekolah Menengah',
    state: 'Melaka',
    district: 'Ayer Keroh',
    phone: '013-2695286',
    schoolPhone: '06-2349405',
    schoolEmail: 'smimmelaka@gmail.com',
    pgbPhone: '013-2695286',
    pgbEmail: 'smimmelaka@gmail.com',
    address: 'Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80',
    logoUrl: '/mpgbsim-official-logo.png',
    expertise: ['Kepimpinan Kurikulum Menengah Agama', 'Tadbir Urus Sekolah Islam', 'Pendidikan Bersepadu'],
    interests: ['Inovasi Pendidikan Menengah', 'Kepimpinan Wanita Madani', 'Pembangunan Huffaz'],
    membershipNo: 'MPGB-2026-JAIM/SAS(M)130',
    schoolCode: 'JAIM/SAS(M)130',
    joinYear: 2023,
    serviceStartYear: 2023,
    pgbStartYear: 2023,
    studentCount: 79,
    teacherCount: 10,
    website: 'https://i-musleh.com',
    status: 'active',
    hidePhone: true,
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
  MEMBER: {
    uid: 'demo-member-pgb',
    email: 'zamri.razak@smkaputrajaya.edu.my',
    fullName: 'Ustaz Zamri bin Abdul Razak',
    role: 'MEMBER',
    position: 'Pengetua',
    school: 'Sekolah Menengah Kebangsaan Agama (SMKA) Putrajaya',
    schoolType: 'SMKA',
    state: 'Wilayah Persekutuan',
    phone: '+60 12-345 6789',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    expertise: ['Kepimpinan Kurikulum Dini', 'Pembangunan Sahsiah Murid', 'Pengurusan Kewangan Sekolah'],
    interests: ['Transformasi Digital Sekolah Islam', 'Pendidikan Tahfiz Integrasi', 'STEM Islamik'],
    membershipNo: 'MPGB-2024-0088',
    joinYear: 2018,
    status: 'active',
    hidePhone: true,
    createdAt: '2018-03-15T08:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z',
  },
  MEDIA_AJK: {
    uid: 'demo-media-ajk',
    email: 'aminah.zakaria@srikreatif.edu.my',
    fullName: 'Ustazah Dr. Hajah Aminah binti Zakaria',
    role: 'MEDIA_AJK',
    position: 'Guru Besar / AJK Penerangan & Media',
    school: 'Sekolah Rendah Islam Integrasi As-Syakirin',
    schoolType: 'Sekolah Islam Swasta',
    state: 'Selangor',
    phone: '+60 12-441 8902',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    expertise: ['Penerbitan Media Digital', 'Pengurusan Acara Pendidikan', 'Komunikasi Korporat'],
    interests: ['AI & Transformasi Media', 'Pembangunan Profesional Guru', 'Hubungan Komuniti'],
    membershipNo: 'MPGB-2024-0042',
    joinYear: 2019,
    status: 'active',
    hidePhone: false,
    createdAt: '2019-01-10T09:00:00Z',
    updatedAt: '2026-09-22T14:00:00Z',
  },
  ADMIN: {
    uid: 'demo-super-admin',
    email: 'mpgbsim.cemerlang@gmail.com',
    fullName: 'Sekretariat Utama MPGBSIM',
    role: 'ADMIN',
    position: 'Pegawai Eksekutif Pentadbiran & Keahlian Kebangsaan',
    school: 'Ibu Pejabat Sekretariat MPGBSIM',
    schoolType: 'Sekretariat Kebangsaan',
    state: 'Selangor',
    phone: '+60 3-8925 7890',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    expertise: ['Tadbir Urus Organisasi', 'Penggubalan Dasar Pendidikan Islam', 'Audit & Keselamatan Data'],
    interests: ['Kecerdasan Buatan (AI) Dalam Pendidikan', 'Sistem Pangkalan Data Bersepadu'],
    membershipNo: 'MPGB-HQ-001',
    joinYear: 2015,
    status: 'active',
    hidePhone: false,
    createdAt: '2015-01-01T08:00:00Z',
    updatedAt: '2026-09-23T12:00:00Z',
  },
  PUBLIC: {
    uid: 'demo-public-guest',
    email: 'tetamu@sekolah.edu.my',
    fullName: 'Pelawat Tetamu / Guru Kanan',
    role: 'PUBLIC',
    position: 'Penolong Kanan Pentadbiran (Bakal Pemohon)',
    school: 'Sekolah Menengah Agama Rakyat',
    schoolType: 'SABK',
    state: 'Perak',
    phone: '',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    expertise: ['Kurikulum'],
    interests: ['Keahlian MPGBSIM'],
    membershipNo: '-',
    joinYear: 2026,
    status: 'pending',
    hidePhone: true,
  },
};

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'JEMPUTAN MENYERTAI MESYUARAT MPGBSIM & KURSUS PROFESIONALISME GURU BESAR/PENGETUA',
    summary: 'Pemberitahuan rasmi mengenai tarikh, agenda pemilihan kepimpinan baharu dan pengesahan kehadiran PGB.',
    content: `Guru Besar dan Pengetua
Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)

Assalamualaikum Warahmatullahi Wabarakatuh,

Tuan/Puan,
JEMPUTAN MENYERTAI MESYUARAT MPGBSIM & KURSUS PROFESIONALISME
GURU BESAR/PENGETUA

Semoga tuan sentiasa di dalam lindungan Allah SWT setiap masa dan komited dalam
menjalankan tugas.

2. Merujuk perkara diatas sukacita dimaklumkan bahawa Mesyuarat MPGBSIM &
Kursus Profesionalisme Guru Besar/Pengetua akan diadakan seperti berikut:

Tarikh : 27 - 28 Oktober 2026 (Selasa-Rabu)
Tempat : The Scapes Hotel & IAB Genting Highlands
Masa : 7.00 pagi – 2.00 petang
Yuran PGB : RM200.00
Yuran Pasangan/Keluarga : RM350.00

3. Bayaran yuran penyertaan hendaklah dijelaskan melalui pautan
https://app.herepay.org/mpgbsim/pf_0012 selewat-lewatnya 26 Oktober 2026.

4. Semoga dengan sokongan tuan dapat melancarkan program dalam meneruskan
perjuangan dalam arus perdana pendidikan. Segala kerjasama dan sokongan pihak tuan
didahului dengan ucapan Jazakumullah Khairan Kathira.

Sekian, terima kasih. Wassalam.

Yang menjalankan amanah,

MOHAMAD FAIZ BIN AZIZAN
Pengerusi MPGBSIM
Sesi 2026-2028`,
    category: 'Mesyuarat',
    author: 'Setiausaha Agung MPGBSIM',
    authorRole: 'Urus Setia Kebangsaan',
    date: '2026-09-30',
    status: 'published',
    pinned: true,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    attachmentName: 'Surat jemputan menyertai mesyuarat mpgbsim & kursus profesionalisme guru besar/pengetua.pdf',
    attachmentUrl: 'https://drive.google.com/file/d/1PIemR7HOk9-JC--T1gMLMmMx4pwxDZh9/view?usp=sharing',
  },
  {
    id: 'ann-2',
    title: 'Pekeliling Amalan Transformasi AI Generatif Bagi Pengurusan Sekolah Islam',
    summary: 'Garis panduan etika, keselamatan data murid dan integrasi alat AI untuk Pengetua dan Guru Besar.',
    content: `Assalamualaikum Wrt. Wbt.

Sekretariat MPGBSIM dengan sukacitanya mengeluarkan Garis Panduan Pelaksanaan AI Generatif bagi membantu kepimpinan sekolah mengoptimumkan teknologi AI secara beretika berlandaskan prinsip Syariah dan Akta Perlindungan Data Peribadi.

Fokus garis panduan:
1. Perlindungan Data Murid & Guru dalam sistem AI berasaskan awan.
2. Piawaian semakan manusia (Human-in-the-loop) bagi bahan kurikulum Islam.
3. Contoh Prompt Library rasmi yang boleh dimanfaatkan Pengetua.

Dokumen lengkap boleh dimuat turun daripada Pusat Dokumen di dalam portal ini.`,
    category: 'Rasmi',
    author: 'Biro Transformasi Digital & AI MPGBSIM',
    authorRole: 'Biro Digital',
    date: '2026-09-19',
    status: 'published',
    pinned: true,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    attachmentName: 'Garis_Panduan_AI_Sekolah_Islam_MPGBSIM.pdf',
    attachmentUrl: 'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link',
  },
  {
    id: 'ann-3',
    title: 'Pembukaan Permohonan Geran Inovasi Pendidikan & Wakaf Sekolah 2026',
    summary: 'Geran pembangunan sehingga RM15,000 bagi projek inovasi kurikulum tahfiz dan kelestarian sekolah.',
    content: `Peluang dana sokongan kepada sekolah-sekolah ahli MPGBSIM yang mempunyai cadangan inovasi berimpak tinggi dalam kategori:
- Inovasi Kaedah Hafazan & Murajaah Berasaskan Teknologi
- Program Kelestarian Hijau & Kebun Wakaf Sekolah
- Modul Sahsiah Rabbani Murid Asrama

Tarikh tutup permohonan: 10 November 2026. Borang permohonan boleh diisi melalui tab Borang & Submisi di portal ahli.`,
    category: 'Peluang',
    author: 'Biro Kewangan & Dana Wakaf MPGBSIM',
    date: '2026-09-15',
    status: 'published',
    pinned: false,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ann-4',
    title: 'Tabung Kebajikan Khas Bencana Banjir Sekolah Ahli Pantai Timur & Utara',
    summary: 'Bantuan kecemasan dan mobilisasi sukarelawan untuk sekolah ahli yang terkesan musim tengkujuh.',
    content: `Biro Kebajikan MPGBSIM telah mengaktifkan Bilik Gerakan Bencana Banjir untuk membantu sekolah-sekolah ahli yang berisiko. Pengetua dan Guru Besar yang memerlukan bantuan logistik atau pembersihan boleh segera berhubung dengan wakil penyelaras negeri.`,
    category: 'Kebajikan',
    author: 'Biro Kebajikan & Khidmat Komuniti',
    date: '2026-09-12',
    status: 'published',
    pinned: false,
  },
  {
    id: 'ann-5',
    title: 'Peringatan: Tarikh Akhir Kemas Kini Data Enrolmen Murid & Guru 2026',
    summary: 'Semua sekolah ahli diminta mengemas kini statistik enrolmen terkini dalam Direktori Sekolah.',
    content: `Bagi memastikan laporan tahunan MPGBSIM tepat dan boleh diakses untuk perkongsian data kementerian, mohon Pengetua menyemak maklumat profil sekolah dalam portal sebelum 30 September 2026.`,
    category: 'Penting',
    author: 'Unit Data & Penyelidikan MPGBSIM',
    date: '2026-09-10',
    status: 'published',
    pinned: false,
  },
];

export const INITIAL_DOCUMENTS: PortalDocument[] = [
  {
    id: 'doc-1',
    title: 'Perlembagaan Rasmi MPGBSIM (Pindaan 2024)',
    description: 'Dokumen asas perlembagaan, tatacara mesyuarat, peranan kepimpinan dan klausa keahlian kebangsaan.',
    category: 'Dokumen MPGBSIM',
    fileSize: '2.4 MB',
    version: 'v2.4',
    uploadDate: '2026-01-15',
    uploader: 'Sekretariat Utama',
    visibility: 'MEMBER',
    fileFormat: 'PDF',
    downloads: 342,
  },
  {
    id: 'doc-2',
    title: 'Modul Kepimpinan Holistik Pengetua Sekolah Islam (MKH-PGB)',
    description: 'Panduan kompetensi kepimpinan Rabbani, pengurusan bakat guru, kewangan wakaf dan kurikulum bersepadu.',
    category: 'Modul',
    fileSize: '8.7 MB',
    version: 'v3.1',
    uploadDate: '2026-05-10',
    uploader: 'Biro Akademik & Latihan',
    visibility: 'MEMBER',
    fileFormat: 'PDF',
    downloads: 620,
  },
  {
    id: 'doc-3',
    title: 'Garis Panduan Integrasi AI Generatif Dalam Pentadbiran Sekolah',
    description: 'SOP penggunaan ChatGPT, Gemini dan automasi borang bagi memelihara privasi data murid dan institusi.',
    category: 'AI & Digital',
    fileSize: '3.1 MB',
    version: 'v1.0',
    uploadDate: '2026-09-18',
    uploader: 'Biro Transformasi Digital',
    visibility: 'MEMBER',
    fileFormat: 'PDF',
    downloads: 415,
  },
  {
    id: 'doc-4',
    title: 'Template Kertas Kerja Rasmi Cadangan Program & Sumbangan',
    description: 'Templat standard format Word untuk permohonan kelulusan program sekolah dan permohonan tajaan.',
    category: 'Template',
    fileSize: '450 KB',
    version: 'v2026',
    uploadDate: '2026-02-01',
    uploader: 'Unit Pentadbiran',
    visibility: 'MEMBER',
    fileFormat: 'DOCX',
    downloads: 890,
  },
  {
    id: 'doc-5',
    title: 'Minit Mesyuarat Majlis Pimpinan Kebangsaan Bil. 3/2026',
    description: 'Ringkasan keputusan dasar pimpinan tertinggi MPGBSIM, pelantikan jawatankuasa dan laporan kewangan.',
    category: 'Mesyuarat',
    fileSize: '1.2 MB',
    version: 'v1.0',
    uploadDate: '2026-08-30',
    uploader: 'Setiausaha Agung',
    visibility: 'ADMIN',
    fileFormat: 'PDF',
    downloads: 45,
  },
  {
    id: 'doc-6',
    title: 'Brosur Penerangan Rasmi MPGBSIM (Untuk Hebahan Luar)',
    description: 'Bahan promosi penerangan profil, visi, misi dan keistimewaan mendaftar sekolah di bawah MPGBSIM.',
    category: 'Sumber PGB',
    fileSize: '4.8 MB',
    version: 'v2026',
    uploadDate: '2026-04-12',
    uploader: 'Biro Penerangan',
    visibility: 'PUBLIC',
    fileFormat: 'PDF',
    downloads: 1205,
  },
  {
    id: 'doc-7',
    title: 'Instrumen Penilaian Kendiri Standard Kualiti Sekolah Islam (SKSI)',
    description: 'Rubrik audit kendiri bagi mengukur kemenjadian murid, kualiti pengajaran tahfiz dan tadbir urus.',
    category: 'Pentadbiran',
    fileSize: '1.8 MB',
    version: 'v4.0',
    uploadDate: '2026-03-25',
    uploader: 'Biro Jaminan Kualiti',
    visibility: 'MEMBER',
    fileFormat: 'XLSX',
    downloads: 512,
  },
];

export const INITIAL_BEST_PRACTICES: BestPracticeItem[] = [
  {
    id: 'bp-01',
    title: 'Program Huffaz Technopreneur: Integrasi Hafazan Al-Quran & Kemahiran Kod Python',
    school: 'Sekolah Menengah Kebangsaan Agama (SMKA) Putrajaya',
    author: 'Ustaz Zamri bin Abdul Razak',
    authorId: 'demo-member-pgb',
    category: 'Kurikulum',
    challenge: 'Murid tahfiz menghadapi kekangan masa untuk menguasai kemahiran teknologi tinggi era IR4.0 tanpa menjejaskan kualiti murajaah 30 juzuk Al-Quran.',
    approach: 'Mewujudkan modul mikro-pembelajaran 45 minit selepas solat Asar yang mengaitkan logik algoritma komputer dengan struktur ayat-ayat Al-Quran dan sains astronomi Islam.',
    implementation: 'Dilaksanakan kepada 120 orang murid tingkatan 2 dan 3 dengan kerjasama Fakulti Sains Komputer universiti tempatan dan bimbingan guru sains komputer sekolah.',
    outcome: '94% murid mengekalkan hafazan mumtaz di samping 8 pasukan berjaya menghasilkan prototaip aplikasi mudah alih Islamik dan memenangi Pingat Emas Inovasi Sains Kebangsaan.',
    lessonLearned: 'Keseimbangan rohani dan sains moden saling melengkapi apabila disusun secara terancang tanpa membebankan jadual harian murid.',
    images: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'],
    supportingDocs: 'Modul_Ringkas_Huffaz_Tech.pdf',
    status: 'Published',
    submittedDate: '2026-08-15',
    year: '2026',
    badge: 'Penarafan 5 Bintang',
    state: 'Wilayah Persekutuan',
  },
  {
    id: 'bp-02',
    title: 'Model Kepimpinan Rabbani Berasaskan Data Analitik Enrolmen & Kemenjadian Murid',
    school: 'Sekolah Rendah Islam Hira’ Shah Alam',
    author: 'Dr. Siti Rahmah binti Idris',
    category: 'Kepimpinan',
    challenge: 'Maklumat pemantauan sahsiah, kehadiran solat berjemaah dan penguasaan subjek teras direkod secara berasingan menyebabkan kelewatan intervensi murid.',
    approach: 'Membangunkan papan pemuka bersepadu menggunakan analitik awan yang membolehkan guru kelas dan pentadbir mengesan kemerosotan murid secara masa nyata.',
    implementation: 'Sistem diguna pakai oleh 68 orang guru bagi memantau 1,100 orang murid bermula sesi persekolahan 2025.',
    outcome: 'Kadar ponteng sifar, penguasaan solat fardhu meningkat kepada 99.2%, dan perjumpaan ibu bapa kini berpandukan data tingkah laku yang telus.',
    lessonLearned: 'Teknologi data memudahkan guru bertindak atas dasar rahmah dan hikmah dengan data bukti yang sahih.',
    images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'],
    status: 'Published',
    submittedDate: '2026-07-20',
    year: '2025',
    badge: 'Inovasi Terbaik',
    state: 'Selangor',
  },
  {
    id: 'bp-03',
    title: 'Ekosistem Wakaf Produktif & Kebun Lestari Sumber Dana Mandiri Sekolah',
    school: 'Sekolah Menengah Agama Persekutuan Kajang',
    author: 'Ustaz Ahmad Fauzi bin Daud',
    category: 'Kewangan',
    challenge: 'Kebergantungan kepada yuran bulanan menimbulkan cabaran apabila kos sara hidup meningkat dan ramai keluarga asnaf memerlukan bantuan pembiayaan.',
    approach: 'Mengaktifkan tanah rizab wakaf seluas 2 ekar dengan projek fertigasi sayuran hidroponik dan ladang kelulut diurus bersama alumni dan PIBG.',
    implementation: 'Dana permulaan RM25,000 dikumpul melalui wakaf tunai alumni, dikendalikan oleh unit koperasi murid bersama pakar pertanian agrotek.',
    outcome: 'Menjana pulangan bersih RM4,200 sebulan yang disalurkan terus kepada Tabung Sara Hidup Murid B40 dan jamuan asrama percuma.',
    lessonLearned: 'Sekolah Islam memiliki potensi besar menjana kemandirian kewangan melalui pengurusan wakaf produktif yang amanah dan telus.',
    images: ['https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80'],
    status: 'Published',
    submittedDate: '2026-09-02',
    year: '2026',
    badge: 'Kelestarian Hijau',
    state: 'Selangor',
  },
  {
    id: 'bp-04',
    title: 'Sistem Rumah (House System) Tarbiah Asrama Membentuk Sahsiah Rabbani',
    school: 'Maahad Tahfiz Sains Integrasi Tanah Merah',
    author: 'Ustaz Wan Muhammad Naim bin Hassan',
    category: 'Tarbiah',
    challenge: 'Disiplin dan adab di asrama sukar dipantau secara konsisten oleh warden yang terhad bilangannya.',
    approach: 'Mengadaptasi sistem naqib berperingkat berdasar kepimpinan sahabat Rasulullah SAW dengan permarkahan merit adab harian.',
    implementation: 'Dibahagikan kepada 4 rumah asrama dengan peranan murabbi muda daripada kalangan murid senior tingkatan 5.',
    outcome: 'Penurunan kes salah laku disiplin sebanyak 87%, budaya menghormati guru semakin kukuh dan kebersihan asrama mencapai gred A cemerlang.',
    lessonLearned: 'Pemberian kepercayaan kepimpinan kepada murid melahirkan rasa tanggungjawab yang jauh lebih berkesan daripada hukuman semata-mata.',
    status: 'Published',
    submittedDate: '2026-06-18',
    year: '2025',
    state: 'Kelantan',
  },
];

export const INITIAL_SUBMISSIONS: MemberSubmission[] = [
  {
    id: 'sub-101',
    submitter: 'Ustaz Zamri bin Abdul Razak',
    submitterEmail: 'zamri.razak@smkaputrajaya.edu.my',
    school: 'SMKA Putrajaya',
    type: 'Best Practice',
    title: 'Modul Bahasa Arab Pantas Berbantukan Aplikasi AI Voice',
    content: 'Kajian rintis penggunaan pengecaman suara AI untuk mempercepatkan kelancaran fasohah bertutur bahasa Arab dalam kalangan murid tahfiz.',
    attachmentName: 'Kertas_Kerja_Arab_AI.pdf',
    date: '2026-09-21',
    status: 'Under Review',
  },
  {
    id: 'sub-102',
    submitter: 'Ustaz Mohd Hafiz bin Ismail',
    submitterEmail: 'admin@sri-imusleh.edu.my',
    school: 'Sekolah Rendah Islam I Musleh',
    type: 'Cadangan program',
    title: 'Cadangan Bengkel Pembinaan Kurikulum Dini Rakan Musleh & MPGBSIM',
    content: 'Mencadangkan sesi wacana kepimpinan meja bulat khas bagi memperkasakan integrasi sukatan tahfiz swasta dengan standard kebangsaan KPM.',
    date: '2026-09-18',
    status: 'Approved',
  },
  {
    id: 'sub-103',
    submitter: 'Ustazah Dr. Hajah Aminah binti Zakaria',
    submitterEmail: 'aminah.zakaria@srikreatif.edu.my',
    school: 'SRI Integrasi As-Syakirin',
    type: 'Kisah kejayaan',
    title: 'Kemenangan Pasukan Robotik Tahfiz di Peringkat Antarabangsa Istanbul',
    content: 'Pasukan murid tahfiz sekolah berjaya meraih tempat kedua dalam International Islamic Science Fair 2026 dengan projek Penapis Air Berasaskan Biji Kelor.',
    date: '2026-09-15',
    status: 'Published',
  },
];

export const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: 'notif-1',
    userId: 'all',
    title: 'Panggilan Mesyuarat Agung Tahunan (AGM) Ke-11',
    message: 'Mesyuarat Agung Tahunan akan berlangsung pada 24 Oktober 2026. Sila sahkan kehadiran anda.',
    type: 'pengumuman',
    date: '2026-09-22T08:30:00Z',
    read: false,
    linkTab: 'program',
  },
  {
    id: 'notif-2',
    userId: 'all',
    title: 'Pekeliling Amalan AI Generatif Diterbitkan',
    message: 'Garis Panduan AI bagi sekolah Islam kini sedia dimuat turun daripada Pusat Dokumen.',
    type: 'dokumen',
    date: '2026-09-19T14:20:00Z',
    read: false,
    linkTab: 'dokumen',
  },
  {
    id: 'notif-3',
    userId: 'all',
    title: 'Konvensyen Pemimpin Sekolah Islam 2026',
    message: 'Pendaftaran dibuka untuk Konvensyen Kebangsaan di Cyberjaya. Tempat terhad.',
    type: 'program',
    date: '2026-09-14T09:00:00Z',
    read: true,
    linkTab: 'program',
  },
  {
    id: 'notif-4',
    userId: 'demo-member-pgb',
    title: 'Submisi Amalan Terbaik Diterima',
    message: 'Submisi anda "Modul Bahasa Arab Pantas Berbantukan Aplikasi AI" sedang disemak oleh Biro Penerangan.',
    type: 'submission',
    date: '2026-09-21T11:00:00Z',
    read: false,
    linkTab: 'best-practice',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-101',
    user: 'Sekretariat Utama (Admin)',
    email: 'mpgbsim.cemerlang@gmail.com',
    action: 'Menerbitkan Pengumuman',
    content: 'Menerbitkan pengumuman AGM Ke-11 Sesi 2026 (ID: ann-1)',
    timestamp: '2026-09-22 09:15:30',
  },
  {
    id: 'log-102',
    user: 'Ustazah Dr. Hajah Aminah (Media AJK)',
    email: 'aminah.zakaria@srikreatif.edu.my',
    action: 'Meluluskan Submisi',
    content: 'Meluluskan cadangan program kolaborasi Rakan Musleh (ID: sub-102)',
    timestamp: '2026-09-19 15:45:12',
  },
  {
    id: 'log-103',
    user: 'Sekretariat Utama (Admin)',
    email: 'mpgbsim.cemerlang@gmail.com',
    action: 'Memuat Naik Dokumen',
    content: 'Memuat naik Garis Panduan AI Generatif (ID: doc-3)',
    timestamp: '2026-09-18 11:20:00',
  },
  {
    id: 'log-104',
    user: 'Ustaz Zamri (Ahli PGB)',
    email: 'zamri.razak@smkaputrajaya.edu.my',
    action: 'Menghantar Amalan Terbaik',
    content: 'Menghantar amalan terbaik: Modul Bahasa Arab Pantas (ID: sub-101)',
    timestamp: '2026-09-21 10:55:04',
  },
];

export const AI_PROMPTS_LIBRARY: AIPromptItem[] = [
  // 1. AI UNTUK KEPIMPINAN
  {
    id: 'pr-kep-1',
    title: 'Draf Pelan Strategik Berasaskan Aspirasi KPM & Dini',
    category: 'Kepimpinan',
    description: 'Merangka pelan strategik sekolah 5 tahun yang mengharmonikan Pelan Pembangunan Pendidikan Malaysia (PPPM) KPM dengan teras Kurikulum Bersepadu Dini/Tahfiz.',
    prompt: `Anda ialah Pakar Perancangan Strategik Pendidikan Islam dan Penasihat Kepimpinan Pengetua/Guru Besar (PGB).
Bina satu Draf Pelan Strategik Sekolah 5 Tahun (2026–2030) untuk:
- Nama Sekolah: [Masukkan Nama Sekolah]
- Kategori Sekolah: [SABK / SMKA / SRI / SMI / Maahad Tahfiz Sains]
- Fokus Utama: [cth. Kecemerlangan Akademik SPM, Kelestarian Hafazan Al-Quran, & Sahsiah Rabbani]

Sila hasilkan dokumen lengkap mengikut struktur rasmi berikut:
1. Pernyataan Visi, Misi & Motto Sekolah Rabbani.
2. Analisis SWOT (Kekuatan, Kelemahan, Peluang, Ancaman) semasa.
3. 5 Teras Strategik Utama (Selaras Aspirasi Murid KPM & Pendidikan Dini).
4. Jadual Matriks Sasaran KPI 5 Tahun (Baseline 2026 hingga Sasaran 2030).
5. Pelan Tindakan Tahunan & Agihan Tanggungjawab (PGB, PK Pentadbiran, PK HEM, PK Kokurikulum).
6. Mekanisme Pemantauan & Semakan Berkala (Mid-Term Review).`,
    usageInstructions: 'Klik "Buka Studio & Guna Modul" untuk menjana pelan strategik sekolah anda secara automatik atau salin prompt ini ke Gemini AI / ChatGPT.',
    tags: ['Pelan Strategik', 'KPM', 'Kurikulum Dini', 'Kepimpinan PGB'],
  },
  {
    id: 'pr-kep-2',
    title: 'Penulisan Teks Ucapan Tazkirah Perhimpunan',
    category: 'Kepimpinan',
    description: 'Menjana teks ucapan Pengetua/Guru Besar yang padat, membina motivasi murid dan menyuntik nilai adab serta integriti berteraskan Al-Quran & Sunnah.',
    prompt: `Anda adalah penasihat kepimpinan pendidikan Islam berpengalaman.
Tuliskan draf teks ucapan perhimpunan rasmi selama 7 minit untuk seorang Pengetua / Guru Besar Sekolah Islam.
- Nama Sekolah: [Masukkan Nama Sekolah]
- Topik Fokus: [Masukkan Topik: cth. Adab Menuntut Ilmu, Disiplin Solat Berjemaah & Persediaan Peperiksaan]
- Sasaran: [Murid Sekolah Menengah / Sekolah Rendah & Guru]

Struktur Teks Ucapan:
1. Mukadimah ringkas dengan salam, selawat dan penghargaan kepada guru bertugas.
2. Petikan sepotong ayat Al-Quran atau Hadis sahih yang relevan berserta terjemahan dan pengajaran hikmah.
3. Tiga amanat/nasihat praktikal yang boleh diamalkan murid dalam rutin harian kelas dan asrama.
4. Kata-kata perangsang kepimpinan yang membakar semangat kecemerlangan duniawi dan ukhrawi.
5. Penutup berserta doa ringkas keberkatan ilmu.
Gunakan nada bahasa Melayu tinggi yang mendidik, empati tetapi berwibawa.`,
    usageInstructions: 'Gunakan Studio Interaktif untuk memasukkan topik perhimpunan minggu ini atau salin terus ke Gemini / ChatGPT.',
    tags: ['Ucapan', 'Tazkirah', 'Perhimpunan', 'Amanat PGB'],
  },
  {
    id: 'pr-kep-3',
    title: 'Penilaian Prestasi & Maklum Balas Membina Guru',
    category: 'Kepimpinan',
    description: 'Membantu PGB menyusun ulasan penilaian prestasi tahunan (PBPPP) dan skrip sesi bimbingan (coaching & mentoring) guru secara empati dan profesional.',
    prompt: `Bertindak sebagai Pengetua / Guru Besar Cemerlang yang mahir dalam bimbingan instruksional (Instructional Coaching).
Saya perlu menyediakan ulasan penilaian prestasi dan skrip maklum balas membina untuk seorang guru:
- Nama / Kategori Guru: [cth. Guru Akademik / Guru Dini / Guru Baharu]
- Kekuatan Utama: [cth. Komited dalam kelas tambahan dan disenangi murid]
- Aspek Perlu Penambahbaikan: [cth. Pengurusan masa PdP, penggunaan bahan digital/AI dan ketepatan penghantaran rekod RPH]

Sila sediakan:
1. Ulasan Rasmi Penilai Pertama/Kedua (Format PBPPP) yang profesional dan membina.
2. Skrip Dialog Bimbingan (Pendekatan GROW Model: Goal, Reality, Options, Will) berunsur hikmah dan empati.
3. 3 Cadangan Pembangunan Profesionalisme Berterusan (CPD) yang sesuai untuk guru tersebut bagi suku tahun akan datang.
4. Kata-kata penghargaan dan motivasi berteraskan konsep kerja sebagai ibadah.`,
    usageInstructions: 'Sesuai untuk sesi semakan prestasi pertengahan/akhir tahun dan bimbingan pencerapan PdP guru.',
    tags: ['PBPPP', 'Prestasi Guru', 'Coaching', 'Maklum Balas'],
  },

  // 2. AI UNTUK PENTADBIRAN
  {
    id: 'pr-pen-1',
    title: 'Kertas Kerja Memohon Dana Sumbangan & CSR',
    category: 'Pentadbiran',
    description: 'Menghasilkan draf kertas kerja permohonan dana wakaf, infaq pembangunan dan penajaan korporat (CSR) yang lengkap serta meyakinkan.',
    prompt: `Anda adalah Pengurus Pembangunan Dana & Wakaf institusi pendidikan Islam.
Bina satu draf Kertas Kerja Rasmi bagi memohon tajaan CSR korporat atau dana wakaf pendidikan:
- Nama Projek: [cth. Naik Taraf Makmal Komputer AI & Pusat Sumber Digital Huffaz]
- Nama Sekolah: [Masukkan Nama Sekolah]
- Jumlah Dana Dipohon: [cth. RM50,000]
- Objektif Utama: [cth. Menyediakan 30 buah komputer dan fasiliti pembelajaran digital untuk 450 orang murid]

Sila susun kertas kerja mengikut format rasmi institusi:
1. Ringkasan Eksekutif (Executive Summary).
2. Latar Belakang Sekolah & Pencapaian Semasa.
3. Penyataan Masalah & Justifikasi Keperluan Mendesak.
4. Objektif, Sasaran & Impak Jangka Panjang Projek.
5. Anggaran Pecahan Belanjawan Terperinci (Jadual Kos).
6. Nilai Tambah & Manfaat kepada Pihak Penaja (Pelepasan cukai, Sijil Penghargaan, Publisiti Rasmi).
7. Penutup & Maklumat Akaun Rasmi Sekolah.`,
    usageInstructions: 'Isi jumlah dana dan nama projek di Studio Interaktif untuk menjana kertas kerja siap cetak.',
    tags: ['Kertas Kerja', 'Dana Wakaf', 'CSR', 'Pentadbiran'],
  },
  {
    id: 'pr-pen-2',
    title: 'Format Minit Mesyuarat Tindakan Segera',
    category: 'Pentadbiran',
    description: 'Meringkaskan nota perbincangan mesyuarat pengurusan sekolah kepada format minit mesyuarat rasmi beserta jadual maklum balas tindakan segera.',
    prompt: `Bertindak sebagai Setiausaha Pengurusan Sekolah yang cekap.
Tukarkan nota ringkas perbincangan mesyuarat berikut kepada Format Minit Mesyuarat Pengurusan Rasmi:
- Nama Mesyuarat: [cth. Mesyuarat Pengurusan Tertinggi Sekolah Bil. 3/2026]
- Tarikh & Masa: [Masukkan Tarikh & Masa]
- Pengerusi: [Nama Pengetua / Guru Besar]
- Isi Perbincangan / Nota Mentah: [Masukkan isi-isi penting perbincangan di sini]

Sila hasilkan:
1. Minit Mesyuarat Rasmi mengikut format Pekeliling Kemajuan Pentadbiran Awam (Perutusan Pengerusi, Pengesahan Minit Lalu, Perkara Berbangkit, Perbincangan Kertas Kerja/Isu Utama, Hal-hal Lain, Penutup).
2. Jadual Ringkasan Tindakan Segera (Action Matrix): Bil | Perkara/Keputusan | Pegawai Bertanggungjawab (PIC) | Tarikh Akhir (Deadline) | Status Semasa.
3. Draf Mesej Peringatan WhatsApp Rasmi kepada ahli mesyuarat berkaitan tindakan yang perlu diselesaikan dalam tempoh 7 hari.`,
    usageInstructions: 'Tampal nota kasar mesyuarat untuk ditukarkan kepada minit rasmi dalam beberapa saat.',
    tags: ['Minit Mesyuarat', 'Pentadbiran', 'Tindakan Segera', 'Surat Rasmi'],
  },
  {
    id: 'pr-pen-3',
    title: 'SOP Pengurusan Premis & Keselamatan Asrama',
    category: 'Pentadbiran',
    description: 'Merangka Prosedur Operasi Standard (SOP) penyelenggaraan fasiliti, pencegahan kebakaran, kawalan pelawat dan keselamatan murid asrama.',
    prompt: `Anda ialah Pakar Pengurusan Keselamatan Fasiliti dan Asrama Sekolah (3K: Kebersihan, Kesihatan, Keselamatan).
Bina satu dokumen Prosedur Operasi Standard (SOP) Pengurusan Premis & Keselamatan Asrama yang komprehensif bagi:
- Nama Sekolah: [Masukkan Nama Sekolah]
- Fokus Kawasan: [cth. Blok Asrama Putera/Puteri, Dewan Makan, Makmal & Kawalan Pintu Utama]
- Kapasiti Penghuni: [cth. 350 orang murid asrama]

Sila sediakan SOP lengkap merangkumi:
1. Objektif & Skop Keselamatan Premis.
2. SOP Rondaan Berkala Warden & Pengawal Keselamatan (Siang & Malam).
3. SOP Pencegahan Kebakaran, Laluan Kecemasan & Pengurusan Pendawaian Elektrik.
4. SOP Kawalan Keluar Masuk Pelawat / Ibu Bapa & Prosedur Murid Sakit Cemas (Kecemasan Malam).
5. Senarai Semak Audit Keselamatan Mingguan (Checklist) untuk ditandatangani oleh PK HEM dan Warden.`,
    usageInstructions: 'Gunakan untuk mengemas kini buku panduan keselamatan asrama dan fail audit 3K sekolah.',
    tags: ['SOP', 'Keselamatan Asrama', 'Premis 3K', 'Warden'],
  },

  // 3. AI UNTUK KURIKULUM
  {
    id: 'pr-kur-1',
    title: 'Pelan Intervensi Murid Percubaan SPM',
    category: 'Kurikulum',
    description: 'Menstrukturkan tindakan pemulihan berfokus dan pecutan akhir akademik bagi subjek kritikal berdasarkan analisis keputusan peperiksaan percubaan.',
    prompt: `Bertindak sebagai Pakar Analisis Kurikulum & Kecemerlangan Akademik SPM.
Berdasarkan data keputusan peperiksaan percubaan berikut:
- Nama Sekolah: [Masukkan Nama Sekolah]
- Subjek Fokus: [cth. Matematik, Bahasa Inggeris, Bahasa Arab Tinggi, Syariah Islamiah]
- Bilangan Calon & Peratus Lulus Semasa: [cth. 90 calon, Lulus 68%, GPMP 5.42]
- Isu / Kelemahan Utama: [cth. Lemah menjawab soalan KBAT Kertas 2 dan penguasaan kosa kata Bahasa Arab]

Sila rangka Pelan Intervensi Pecutan Akhir SPM (8 Minggu) yang mengandungi:
1. Sasaran Peningkatan GPMP & Peratus Layak Sijil (LMS).
2. Strategi Pengupayaan Mengikut 3 Kelompok Murid:
   - Kumpulan Elit / Straight A (Pengayaan KBAT)
   - Kumpulan Sederhana / Near-Miss A/B (Klinik Teknik Menjawab)
   - Kumpulan Harapan Lulus / GALUS (Modul Lulus Pasti & Bimbingan Berfokus)
3. Jadual Pelaksanaan Mingguan & Program Guru Muda (Peer Coaching).
4. Mekanisme Pemantauan Panitia & Pelibatan Ibu Bapa.`,
    usageInstructions: 'Sesuai digunakan oleh PK Pentadbiran, GKMP dan Ketua Panitia selepas analisis post-mortem peperiksaan.',
    tags: ['Intervensi SPM', 'Kurikulum', 'Akademik', 'GPMP'],
  },
  {
    id: 'pr-kur-2',
    title: 'Jadual Waktu Murajaah & Tahfiz Terbeza',
    category: 'Kurikulum',
    description: 'Menyusun jadual pengulangan hafazan (murajaah) Al-Quran secara pedagogi terbeza mengikut tahap keupayaan murid tanpa menjejaskan subjek akademik/STEM.',
    prompt: `Anda ialah Pakar Kurikulum Tahfiz Bersepadu (Ulul Albab / Tahfiz Sains & Dini).
Rangka satu Sistem & Jadual Waktu Murajaah (Pengulangan Hafazan) & Tahfiz Terbeza untuk:
- Nama Institusi: [Masukkan Nama Sekolah / Maahad]
- Peringkat Murid: [cth. Tingkatan 1 hingga Tingkatan 5]
- Sasaran Juzuk: [cth. 6 Juzuk setahun / 30 Juzuk dalam 5 tahun beserta subjek Akademik/STEM]

Sila sediakan:
1. Pembahagian Pedagogi Terbeza kepada 3 Tahap Keupayaan Murid (Lancar/Cepat, Sederhana, Perlu Bimbingan Talaqqi Intensif).
2. Jadual Waktu Harian Bersepadu (Halaqah Subuh, Slot Qailulah/Zohor, Murajaah Mandiri Maghrib, & Integrasi Hujung Minggu).
3. Kaedah "Sabak" (Hafazan Baharu), "Para Sabak" (Hafazan Semasa) dan "Amokhtar" (Murajaah Lama) yang sistematik.
4. Teknik Integrasi Tadabbur Ayat Al-Quran dengan Konsep Sains/STEM di dalam bilik darjah.
5. Templat Buku Rekod Prestasi Tasmi' & Murajaah Mingguan.`,
    usageInstructions: 'Sangat berguna untuk Penyelaras Tahfiz dan PK Kurikulum menyusun jadual waktu tahunan.',
    tags: ['Tahfiz', 'Murajaah', 'Pedagogi Terbeza', 'Ulul Albab'],
  },
  {
    id: 'pr-kur-3',
    title: 'Rubrik Penilaian Kurikulum Dini & Azhari',
    category: 'Kurikulum',
    description: 'Membina rubrik pentaksiran holistik (lisan, bertulis dan amali) bagi subjek Usuluddin, Syariah, Al-Lughah Al-Arabiah dan kurikulum Azhari/STAM.',
    prompt: `Bertindak sebagai Pakar Pentaksiran Kurikulum Bersepadu Dini (KBD) dan Kurikulum Azhari.
Bina satu Rubrik Penilaian Holistik (Pentaksiran Bilik Darjah & Amali) bagi:
- Mata Pelajaran: [cth. Al-Syariah / Usuluddin / Al-Lughah Al-Arabiah Al-Mu'asirah / Mutalaah & Insya']
- Tingkatan / Tahap: [cth. Tingkatan 4 / Calon Sijil Menengah Agama (SMA) / STAM]
- Fokus Kemahiran: [cth. Kefahaman Nas, Istinbat Hukum, Kemahiran Bertutur Bahasa Arab & Aplikasi Akhlak]

Sila sediakan:
1. Jadual Rubrik Penilaian 6 Tahap Penguasaan (TP1 hingga TP6) yang jelas dan boleh diukur.
2. Kriteria Penilaian Lisan (Syafawi), Penulisan (Tahriri) dan Penghayatan Amali.
3. 5 Contoh Soalan Kemahiran Berfikir Aras Tinggi (KBAT) Dwibahasa (Bahasa Melayu & Bahasa Arab) berserta skema jawapan ringkas.
4. Panduan intervensi bagi murid yang masih berada di tahap penguasaan TP1–TP3.`,
    usageInstructions: 'Gunakan untuk menyelaraskan standard pemarkahan panitia Dini dan persediaan peperiksaan SMA/STAM/SPM.',
    tags: ['Rubrik Dini', 'Azhari', 'Bahasa Arab', 'Pentaksiran'],
  },

  // 4. AI UNTUK HEM & SAHSIAH
  {
    id: 'pr-hem-1',
    title: 'SOP Komunikasi Krisis & Isu Tular Media',
    category: 'HEM',
    description: 'Panduan tindak balas pantas (Golden Hour) merangka kenyataan rasmi, komunikasi ibu bapa dan pengurusan krisis sekiranya berlaku isu tular media sosial.',
    prompt: `Sebagai Perunding Komunikasi Krisis Pendidikan, rangka Pelan Tindak Balas Pantas (Rapid Response SOP) untuk Pengetua/Guru Besar sekiranya berlaku isu disiplin, kebajikan atau aduan tular di media sosial:
- Nama Sekolah: [Masukkan Nama Sekolah]
- Ringkasan Senario Krisis: [cth. Aduan berkaitan fasiliti/makanan asrama atau salah faham tindakan disiplin dimuat naik ke media sosial]

Hasilkan panduan lengkap 4 fasa:
1. Fasa 1: Pengesahan Fakta & Kawalan Dalaman (Jam 0 – 2): Langkah siasatan pantas, perlindungan privasi murid/guru dan laporan awal kepada PPD/JPN/Lembaga Pengelola.
2. Fasa 2: Kenyataan Rasmi & Mesej WhatsApp Ibu Bapa (Jam 2 – 4): Draf kenyataan rasmi yang tenang, empati, berfakta dan bertanggungjawab tanpa mengeruhkan keadaan.
3. Fasa 3: Sesi Libat Urus & Penyelesaian (Hari 1 – 3): Protokol pertemuan harmoni bersama ibu bapa dan pihak terlibat.
4. Fasa 4: PemulihanKepercayaan & Tarbiah (Minggu 1 – 2): Langkah penambahbaikan SOP dan pemulihan imej institusi.`,
    usageInstructions: 'Sediakan dalam fail pengurusan krisis PGB dan PK HEM sebagai rujukan kecemasan.',
    tags: ['SOP Krisis', 'Isu Tular', 'Komunikasi Ibu Bapa', 'HEM'],
  },
  {
    id: 'pr-hem-2',
    title: 'Modul Tarbiah & Biah Solehah Asrama',
    category: 'HEM',
    description: 'Merangka modul pembangunan sahsiah penghuni asrama, budaya usrah kepemimpinan pengawas/naqib, dan kempen Biah Solehah sepanjang tahun.',
    prompt: `Anda ialah Pakar Pembangunan Sahsiah & Tarbiah Sekolah Islam Berasrama.
Bina satu Modul Tahunan "Tarbiah & Biah Solehah Asrama" serta Kepimpinan Naqib/Pengawas untuk:
- Nama Sekolah: [Masukkan Nama Sekolah]
- Sasaran: [Penghuni Asrama Putera & Puteri / Barisan Kepimpinan Murid]
- Fokus Sahsiah: [cth. Budaya Hormat-Menghormati, Sifar Buli, Cinta Masjid, & Adab Sesama Rakan]

Sila sediakan:
1. Kerangka Konsep "Biah Solehah" (Persekitaran Kondusif Berteraskan Iman & Ukhuwah).
2. Takwim Aktiviti Tarbiah Bulanan & Mingguan (Usrah Nuqaba', Kuliah Maghrib Berfokus, Qiamullail Perdana, Kempen Sahsiah Mulia).
3. Modul Pengesanan Awal Emosi & Sokongan Rakan Sebaya (Sistem Buddy/Mentor Asrama bagi mengelakkan tekanan emosi dan buli).
4. Piagam Adab Penghuni Asrama & Sistem Pengiktirafan Dorm Terbaik / Tokoh Sahsiah Terpuji.`,
    usageInstructions: 'Gunakan bersama Badan Dakwah & Rohani (BADAR), Lembaga Pengawas, Warden dan Unit Bimbingan Kaunseling.',
    tags: ['Biah Solehah', 'Tarbiah Asrama', 'Sahsiah', 'Naqib'],
  },
  {
    id: 'pr-hem-3',
    title: 'Analisis Kehadiran & Amaran Awal Ponteng',
    category: 'HEM',
    description: 'Menganalisis corak ketidakhadiran murid, mengenal pasti punca risiko keciciran awal, dan menjana surat/mesej intervensi kaunseling berhemah.',
    prompt: `Bertindak sebagai Pakar Pengurusan Hal Ehwal Murid (HEM) & Bimbingan Kaunseling.
Bantu saya merangka sistem Analisis Kehadiran & Intervensi Amaran Awal Ponteng bagi:
- Nama Sekolah: [Masukkan Nama Sekolah]
- Peratus Kehadiran Semasa: [cth. 91.5% berbanding sasaran 96.0%]
- Pola Ketidakhadiran Dikesan: [cth. Kerap tidak hadir pada hari Isnin/Jumaat atau selepas cuti penggal bagi murid tingkatan menengah atas]

Sila hasilkan:
1. Matriks Pengesanan Awal Risiko (Early Warning System): Kategori Hijau, Kuning (3 hari berturut/berkala), Jingga, dan Merah.
2. Pelan Intervensi Bersepadu (Cakna Kehadiran): Kerjasama Guru Kelas, Guru Kaunseling, PK HEM dan PIBG.
3. Draf Mesej / Surat Prihatin kepada Ibu Bapa (Nada empati dan ingin membantu, bukan sekadar menghukum).
4. Borang Temu Bual Kaunseling Punca Ketidakhadiran (Masalah emosi, kewangan, pengangkutan, atau motivasi akademik) beserta cadangan penyelesaian.`,
    usageInstructions: 'Gunakan setiap hujung bulan selepas semakan data kehadiran APDM/SSDM untuk tindakan proaktif HEM.',
    tags: ['Kehadiran Murid', 'Intervensi Ponteng', 'HEM', 'Kaunseling'],
  },

  // 5. AI UNTUK DATA & ANALITIK
  {
    id: 'pr-dat-1',
    title: 'Analisis Sentimen Kaji Selidik Ibu Bapa PIBG',
    category: 'Data & Analisis',
    description: 'Menganalisis maklum balas terbuka Google Form ibu bapa (PIBG) secara pantas untuk mengenal pasti tahap kepuasan, kekuatan sekolah dan isu utama.',
    prompt: `Bertindak sebagai Penganalisis Data Pendidikan & Perhubungan Komuniti PIBG.
Berikut adalah ringkasan / maklum balas daripada borang kaji selidik ibu bapa (Google Form PIBG):
- Nama Sekolah: [Masukkan Nama Sekolah]
- Fokus Kaji Selidik: [cth. Maklum Balas Pengurusan Sekolah, Kurikulum, Kebajikan Asrama & Program PIBG]
- Data / Maklum Balas Ibu Bapa: [Tampal senarai respons Google Form atau ringkasan isu di sini]

Sila jalankan analisis komprehensif:
1. Rumusan Sentimen Keseluruhan: Anggaran pecahan Positif, Neutral, dan Perlu Perhatian Segera.
2. 3 Kekuatan Utama sekolah yang paling dihargai oleh ibu bapa.
3. 3 Isu Utama (Pain Points) yang paling kerap dibangkitkan berserta punca masalah.
4. Pelan Tindakan Segera (Quick Wins - 14 Hari) dan Pelan Jangka Sederhana untuk dibentangkan dalam Mesyuarat AJK PIBG.
5. Draf Maklum Balas Rasmi Pengetua/Guru Besar kepada ibu bapa yang telus, profesional dan meyakinkan.`,
    usageInstructions: 'Eksport jawapan Google Form ibu bapa atau masukkan isu utama di Studio Interaktif untuk menjana laporan PIBG.',
    tags: ['Analisis Sentimen', 'PIBG', 'Google Form', 'Data Sekolah'],
  },
  {
    id: 'pr-dat-2',
    title: 'Sintesis Laporan Tahunan Sekolah Ahli',
    category: 'Data & Analisis',
    description: 'Merumus pencapaian akademik, kokurikulum, sahsiah dan kewangan sepanjang tahun kepada Laporan Tahunan Eksekutif yang kemas untuk Lembaga Pengelola & MPGBSIM.',
    prompt: `Anda ialah Ketua Editor Laporan Eksekutif Pendidikan.
Sintesis dan susun satu Laporan Tahunan Eksekutif Sekolah bagi sesi persekolahan semasa:
- Nama Sekolah: [Masukkan Nama Sekolah]
- Sorotan Pencapaian Akademik & Tahfiz: [cth. GPS SPM meningkat kepada 2.45, 18 murid khatam 30 juzuk]
- Sorotan Kokurikulum & Kemenjadian Murid: [cth. Johan Bahas Bahasa Arab Kebangsaan, 98% kehadiran tahunan]
- Cabaran & Perancangan Tahun Hadapan: [cth. Menaik taraf fasiliti digital dan latihan AI untuk semua guru]

Sila hasilkan dokumen Laporan Tahunan Eksekutif merangkumi:
1. Perutusan Eksekutif Pengetua / Guru Besar.
2. Papan Pemuka Pencapaian Utama (Key Highlights & KPI Dashboard dalam bentuk jadual ringkas).
3. Analisis Pencapaian Mengikut 4 Bidang: Kurikulum & Tahfiz, Hal Ehwal Murid, Kokurikulum, dan Pentadbiran/Kewangan.
4. Rumusan Beban Tugas Guru & Inisiatif Kebajikan Staf.
5. Hala Tuju & Sasaran Strategik Tahun Hadapan.`,
    usageInstructions: 'Sesuai untuk pembentangan Mesyuarat Agung PIBG, Lembaga Pengelola Sekolah (LPS) dan pelaporan MPGBSIM.',
    tags: ['Laporan Tahunan', 'Sintesis Data', 'KPI Sekolah', 'Eksekutif'],
  },
  {
    id: 'pr-dat-3',
    title: 'Unjuran Enrolmen & Kapasiti Bilik Darjah',
    category: 'Data & Analisis',
    description: 'Menganalisis trend kemasukan murid, unjuran kapasiti kelas/asrama, dan pengagihan nisbah guru-murid secara optimum bagi sesi persekolahan baharu.',
    prompt: `Bertindak sebagai Pakar Perancangan Data Enrolmen & Sumber Manusia Sekolah.
Berdasarkan data semasa sekolah berikut:
- Nama Sekolah: [Masukkan Nama Sekolah]
- Enrolmen Semasa & Bilangan Kelas: [cth. 620 orang murid, 20 buah bilik darjah, 48 orang guru]
- Trend Permohonan Kemasukan Baharu: [cth. 280 permohonan untuk 120 kekosongan Tingkatan 1 / Tahun 1]
- Kekangan Semasa: [cth. Kapasiti bilik darjah maksimum 32 orang/kelas dan keperluan guru subjek Dini/Sains]

Sila sediakan Laporan Unjuran Enrolmen & Kapasiti Sesi Akan Datang:
1. Jadual Unjuran Enrolmen 3 Tahun & Kadar Penggunaan Bilik Darjah / Katil Asrama.
2. Analisis Nisbah Guru-Murid & Pengiraan Optimum Agihan Waktu Mengajar Guru (mengelakkan lebihan beban tugas).
3. Strategi Saringan Kemasukan Murid Baharu (Ujian Diagnostik Akademik, Bacaan Al-Quran & Temu Bual Sahsiah).
4. Cadangan Pengoptimuman Ruang Fizikal & Belanjawan Mengurus Per Kapita.`,
    usageInstructions: 'Gunakan semasa merancang pengambilan murid baharu dan penyusunan perjawatan guru tahun hadapan.',
    tags: ['Unjuran Enrolmen', 'Kapasiti Kelas', 'Beban Tugas Guru', 'Analitik'],
  },
];

export const AI_TOOLS_LIST: AIToolItem[] = [
  {
    id: 'tool-gemini',
    name: 'Gemini AI (Google Gemini)',
    category: 'Model Bahasa Raya (LLM)',
    description: 'Model AI pintar daripada Google dengan sokongan carian terkini, analisis imej serta pemprosesan dokumen panjang sehingga ribuan patah perkataan.',
    url: 'https://gemini.google.com',
    badge: 'Disyorkan',
    bestFor: 'Analisis laporan sekolah, sintesis pekeliling kementerian, dan penulisan teks rasmi bahasa Melayu.',
    brandColor: 'from-blue-600 via-indigo-600 to-purple-600',
  },
  {
    id: 'tool-chatgpt',
    name: 'ChatGPT (OpenAI)',
    category: 'Model Bahasa Raya (LLM)',
    description: 'Pembantu AI perbualan paling meluas digunakan untuk penjanaan idea pengajaran, penulisan kertas kerja, surat rasmi dan terjemahan dwibahasa.',
    url: 'https://chatgpt.com',
    badge: 'Paling Popular',
    bestFor: 'Merangka RPH, teks ucapan perhimpunan, kertas kerja program sekolah, dan latihan pengukuhan murid.',
    brandColor: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'tool-perplexity',
    name: 'Perplexity AI',
    category: 'Enjin Carian Pintar & Rujukan',
    description: 'Enjin carian berasaskan AI yang memberikan jawapan komprehensif berserta pautan sumber rujukan sahih dan fakta masa nyata.',
    url: 'https://www.perplexity.ai',
    badge: 'Carian Pantas',
    bestFor: 'Mencari fakta perundangan, data perangkaan pendidikan semasa dan kajian ilmiah terkini berserta sitasi.',
    brandColor: 'from-cyan-700 to-slate-900',
  },
  {
    id: 'tool-claude',
    name: 'Claude AI (Anthropic)',
    category: 'Model Bahasa & Penulisan Halus',
    description: 'Model AI beretika tinggi yang terkenal dengan gaya bahasa penulisan semula jadi, analisis dokumen PDF tebal dan penaakulan mendalam.',
    url: 'https://claude.ai',
    badge: 'Penulisan Terbaik',
    bestFor: 'Menyunting buku panduan sekolah, merumus dokumen dasar tebal, dan penulisan artikel ilmiah/tarbiah yang bernas.',
    brandColor: 'from-amber-700 to-orange-800',
  },
  {
    id: 'tool-copilot',
    name: 'MS Copilot (Microsoft)',
    category: 'Pembantu Produktiviti & Web AI',
    description: 'Pembantu AI pintar daripada Microsoft yang berintegrasi rapat dengan ekosistem carian web Bing serta aplikasi pejabat (Word, Excel, PowerPoint).',
    url: 'https://copilot.microsoft.com',
    badge: 'Ekosistem Microsoft',
    bestFor: 'Membantu pentadbir dan guru merangka dokumen pengurusan, jadual data, serta carian maklumat bersepadu.',
    brandColor: 'from-sky-500 via-blue-600 to-indigo-700',
  },
  {
    id: 'tool-conker',
    name: 'Conker AI (Bina Kuiz)',
    category: 'Pembina Kuiz & Pentaksiran PdP',
    description: 'Platform AI khusus untuk guru menjana kuiz interaktif, soalan aneka pilihan (MCQ) dan lembaran pentaksiran bilik darjah dalam beberapa saat.',
    url: 'https://www.conker.ai',
    badge: 'Bina Kuiz Guru',
    bestFor: 'Membina kuiz pantas mengikut topik kurikulum, petikan teks buku, dan eksport terus ke Google Forms atau Canvas.',
    brandColor: 'from-orange-500 to-rose-600',
  },
  {
    id: 'tool-suno',
    name: 'Suno AI',
    category: 'Penjana Lagu & Audio Pendidikan',
    description: 'Platform AI kreatif yang menghasilkan lagu pendidikan, nasyid motivasi dan audio muzik lengkap dengan vokal hanya daripada lirik atau tajuk.',
    url: 'https://suno.com',
    badge: 'Audio & Lagu PdP',
    bestFor: 'Mencipta lagu hafalan sifir, lagu tema kem kepimpinan sekolah, nasyid motivasi murid dan muzik latar montaj.',
    brandColor: 'from-fuchsia-600 via-pink-600 to-amber-500',
  },
  {
    id: 'tool-pixlr',
    name: 'Pixlr AI',
    category: 'Suntingan Foto & Reka Grafik AI',
    description: 'Editor foto dan grafik berasaskan web dengan fungsi AI pantas seperti buang latar belakang (Remove BG), AI Generative Fill dan penambahbaikan gambar.',
    url: 'https://pixlr.com',
    badge: 'Suntingan Gambar',
    bestFor: 'Menyunting gambar aktiviti murid, membuang latar belakang gambar profil guru/PGB, dan mereka bentuk grafik hebahan sekolah.',
    brandColor: 'from-violet-600 via-fuchsia-600 to-cyan-500',
  },
  {
    id: 'tool-bing-image',
    name: 'Bing Image Creator',
    category: 'Penjana Imej & Ilustrasi AI',
    description: 'Alatan penjanaan imej AI percuma dikuasakan oleh DALL·E (Microsoft) untuk menghasilkan ilustrasi visual, poster latar dan grafik kreatif daripada teks.',
    url: 'https://www.bing.com/images/create',
    badge: 'Jana Imej AI',
    bestFor: 'Menjana ilustrasi bahan bantu mengajar (BBM), gambar kulit buku program, dan visual bercerita untuk murid.',
    brandColor: 'from-blue-600 to-teal-500',
  },
  {
    id: 'tool-notebooklm',
    name: 'Google NotebookLM',
    category: 'Penolong Penyelidikan Dokumen AI',
    description: 'Sistem analisis berasaskan sumber rujukan yang anda muat naik sendiri (Buku teks, minit mesyuarat, dasar sekolah) tanpa risiko halusinasi.',
    url: 'https://notebooklm.google.com',
    badge: 'Eksklusif Pengetua',
    bestFor: 'Membaca dan menyoal isi kandungan buku dasar kurikulum, teks perlembagaan dan pelan strategik sekolah.',
    brandColor: 'from-slate-800 to-emerald-700',
  },
  {
    id: 'tool-canva',
    name: 'Canva for Education AI',
    category: 'Reka Bentuk & Bahan Promosi',
    description: 'Peralatan reka bentuk intuitif dengan keupayaan Magic Studio AI untuk menghasilkan poster program sekolah dan infografik.',
    url: 'https://www.canva.com/education/',
    badge: 'Media & Grafik',
    bestFor: 'Penghasilan poster hebahan AGM, sijil penghargaan murid dan montaj video ringkas aktiviti sekolah.',
    brandColor: 'from-cyan-500 via-blue-500 to-purple-600',
  },
  {
    id: 'tool-gamma',
    name: 'Gamma App',
    category: 'Pembina Slaid & Pembentangan Pantas',
    description: 'Hasilkan slaid pembentangan profesional mesyuarat PIBG atau taklimat kurikulum dalam masa 2 minit hanya dengan menaip tajuk.',
    url: 'https://gamma.app',
    badge: 'Produktiviti',
    bestFor: 'Menyediakan slaid pembentangan taklimat mesyuarat pimpinan dan modul kursus guru.',
    brandColor: 'from-indigo-600 to-violet-700',
  },
];

