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
    title: 'Mesyuarat Agung Tahunan (AGM) MPGBSIM Kali Ke-11 Sesi 2026',
    summary: 'Pemberitahuan rasmi mengenai tarikh, agenda pemilihan kepimpinan baharu dan pengesahan kehadiran PGB.',
    content: `Assalamualaikum Wrt. Wbt.
Kepada Semua Ahli Pengetua & Guru Besar yang dihormati,

Sukacita dimaklumkan bahawa Mesyuarat Agung Tahunan (AGM) MPGBSIM Kali Ke-11 akan diadakan seperti ketetapan berikut:

Tarikh: 24 Oktober 2026 (Sabtu)
Masa: 8:30 Pagi – 4:30 Petang
Tempat: Dewan Persidangan Utama, Kompleks Pendidikan Islam Antarabangsa, Bangi
Mod: Hibrid (Fizikal & Siaran Langsung Portal Ahli)

Agenda Utama:
1. Ucapan Dasar Yang Dipertua MPGBSIM
2. Pembentangan dan Pengesahan Minit Mesyuarat Kali Ke-10
3. Laporan Aktiviti Tahunan 2025/2026
4. Pembentangan Penyata Kewangan Beraudit
5. Pembentangan Usul Transformasi Digital Sekolah Islam
6. Hal-hal Lain

Sila sahkan kehadiran anda melalui butang Pengesahan Kehadiran di bawah tab Program selewat-lewatnya 15 Oktober 2026. Kehadiran Pengetua dan Guru Besar amat dihargai demi masa depan pendidikan Islam negara.`,
    category: 'Mesyuarat',
    author: 'Setiausaha Agung MPGBSIM',
    authorRole: 'Urus Setia Kebangsaan',
    date: '2026-09-22',
    status: 'published',
    pinned: true,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    attachmentName: 'Surat_Panggilan_AGM_MPGBSIM_2026.pdf',
    attachmentUrl: '#',
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
    attachmentUrl: '#',
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
  {
    id: 'pr-1',
    title: 'Penulisan Ucapan Perhimpunan Rasmi Berunsur Tazkirah Kepimpinan',
    category: 'Kepimpinan',
    description: 'Menjana teks ucapan Pengetua yang padat, membina motivasi murid dan menyuntik nilai integriti berteraskan ayat Al-Quran.',
    prompt: `Anda adalah penasihat kepimpinan pendidikan Islam berpengalaman. 
Tuliskan draf teks ucapan perhimpunan rasmi selama 7 minit untuk seorang Pengetua Sekolah Islam.
Topik: [Masukkan Topik: cth. Disiplin Solat dan Ketepatan Waktu Menjelang Peperiksaan].
Sasaran: Murid sekolah menengah berumur 13-17 tahun.
Struktur:
1. Mukadimah ringkas dengan selawat dan doa kesyukuran.
2. Petikan sepotong ayat Al-Quran atau Hadis sahih yang relevan berserta terjemahan hikmah.
3. Tiga nasihat praktikal yang boleh diamalkan murid dalam rutin harian asrama/kelas.
4. Kata-kata perangsang kepimpinan yang membakar semangat.
5. Penutup doa ringkas.
Gunakan nada bahasa Melayu tinggi yang mendidik, mesra tetapi berwibawa.`,
    usageInstructions: 'Gantikan kurungan [Topik] dengan fokus semasa sekolah anda, kemudian tampal ke Google Gemini atau ChatGPT.',
    tags: ['Ucapan', 'Tazkirah', 'Perhimpunan', 'Nilai'],
  },
  {
    id: 'pr-2',
    title: 'Pelan Intervensi Akademik Berdasarkan Analisis Jurang Markah Percubaan',
    category: 'Kurikulum',
    description: 'Menstrukturkan tindakan pemulihan pantas bagi subjek kritikal berasaskan peratusan murid lulus dan gagal.',
    prompt: `Bertindak sebagai Pakar Analisis Kurikulum Sekolah Menengah.
Berdasarkan data keputusan peperiksaan percubaan berikut:
- Subjek: [Nama Subjek, cth. Matematik Tambahan / Pendidikan Islam]
- Bilangan calon: [Jumlah Murid, cth. 85 orang]
- Peratus lulus: [cth. 64%]
- Kelemahan utama yang dikenal pasti: [cth. Kertas 2 bahagian Kemahiran Berfikir Aras Tinggi (KBAT) dan hafazan ayat hukum]

Sila rangka Pelan Intervensi 6 Minggu (Rapid Intervention Plan) yang mengandungi:
1. Objektif sasaran peningkatan Gred Purata Mata Pelajaran (GPMP).
2. Pembahagian murid kepada 3 kumpulan: Cemerlang, Sederhana, dan Harapan Lulus.
3. Modul aktiviti mingguan berfokus dengan pendekatan rakan sebaya (peer coaching).
4. Mekanisme pemantauan mingguan oleh Guru Kanan Mata Pelajaran.
5. Templat borang komitmen murid yang berkesan.`,
    usageInstructions: 'Sesuai digunakan oleh Guru Kanan Pentadbiran dan Guru Panitia untuk mesyuarat kurikulum.',
    tags: ['Akademik', 'SPM', 'Intervensi', 'Analisis Data'],
  },
  {
    id: 'pr-3',
    title: 'Rangka Kertas Kerja Memohon Dana Wakaf / Penajaan Korporat',
    category: 'Pentadbiran',
    description: 'Menghasilkan draf kertas kerja permohonan dana sumbangan yang profesional mengikut format institusi.',
    prompt: `Anda adalah Pengurus Pembangunan Dana institusi pendidikan Islam.
Bina satu draf Kertas Kerja Rasmi bagi memohon tajaan/dana wakaf daripada agensi korporat atau alumni.
Nama Projek: [cth. Pembangunan Makmal Komputer AI & Pusat Digital Huffaz]
Institusi: [Nama Sekolah Anda]
Jumlah Dana Dipohon: [cth. RM45,000]
Objektif: [cth. Menyediakan 30 unit komputer riba dan sambungan jalur lebar pantas untuk murid asrama]

Sila susun kertas kerja mengikut format standard:
1. Ringkasan Eksekutif (Executive Summary).
2. Latar Belakang Sekolah & Pencapaian Semasa.
3. Penyataan Masalah & Keperluan Mendesak.
4. Butiran Projek & Jadual Pelaksanaan.
5. Anggaran Pecahan Belanjawan Terperinci.
6. Pulangan Nilai Sosial (Social ROI) kepada Pihak Penaja (termasuk potongan cukai jika berkenaan dan liputan publisiti portal MPGBSIM).
7. Kesimpulan & Maklumat Hubungan Rasmi.`,
    usageInstructions: 'Lengkapkan anggaran belanjawan sebelum menyerahkan kepada syarikat berkaitan.',
    tags: ['Kertas Kerja', 'Dana', 'Wakaf', 'Sumbangan'],
  },
  {
    id: 'pr-4',
    title: 'Pelan Pengurusan Krisis Disiplin & Media Sosial Sekolah',
    category: 'HEM',
    description: 'Panduan merangka SOP komunikasi pantas dan tindakan pemulihan adab sekiranya berlaku isu tular.',
    prompt: `Sebagai Perunding Komunikasi Krisis Pendidikan, rangka Pelan Tindak Balas Pantas (Rapid Response SOP) untuk Pengetua Sekolah Islam sekiranya berlaku isu disiplin atau aduan tular di media sosial.
Senario: [Masukkan Ringkasan Senario: cth. Isu ketidakpuasan hati makanan dewan makan asrama dimuat naik di TikTok]

Hasilkan panduan 4 fasa:
1. Fasa Pengesahan Fakta (Jam 0 - 2): Langkah siasatan dalaman dan perlindungan privasi murid.
2. Fasa Kenyataan Media & Mesej WhatsApp Rasmi (Jam 2 - 4): Contoh templat mesej penenang kepada ibu bapa yang empati dan bertanggungjawab tanpa menuding jari.
3. Fasa Tindakan Pembetulan (Hari 1 - 3): Sesi dialog bersama wakil ibu bapa dan pihak pembekal.
4. Fasa Pemulihan Tarbiah & Reputasi Sekolah (Minggu 1 - 2): Pengajaran hikmah kepada murid dan penambahbaikan SOP.`,
    usageInstructions: 'Gunakan sebagai panduan asas perbincangan bersama warden dan kaunselor sekolah.',
    tags: ['HEM', 'Krisis', 'Media Sosial', 'Disiplin'],
  },
  {
    id: 'pr-5',
    title: 'Prompt Analisis Sentimen & Maklum Balas Soal Selidik Ibu Bapa (PIBG)',
    category: 'Data & Analisis',
    description: 'Menganalisis puluhan jawapan teks terbuka daripada borang Google Form secara pantas dan tepat.',
    prompt: `Berikut adalah senarai 20 maklum balas terbuka daripada borang soal selidik ibu bapa berkaitan sesi persekolahan:
[Tampal teks maklum balas di sini]

Sila jalankan analisis:
1. Rumusan Sentimen Keseluruhan: Peratusan Positif, Neutral dan Perlu Perhatian Segera.
2. Tiga Kekuatan Utama sekolah yang paling kerap dipuji oleh ibu bapa.
3. Tiga Titik Kesakitan (Pain Points) atau rungutan yang paling banyak dibangkitkan (cth: kebersihan tandas, kualiti makanan, komunikasi guru).
4. Cadangan Tindakan Segera (Quick Wins) yang boleh diselesaikan dalam tempoh 14 hari tanpa kos tinggi.
5. Draf ucapan terima kasih Pengetua dalam kumpulan WhatsApp PIBG yang meredakan kebimbangan ibu bapa.`,
    usageInstructions: 'Eksport maklum balas Google Form ke bentuk teks dan tampal ke prompt ini.',
    tags: ['Analisis', 'Ibu Bapa', 'PIBG', 'Maklum Balas'],
  },
  {
    id: 'pr-6',
    title: 'Rangka Modul Kem Kepimpinan Murid Rabbani (3 Hari 2 Malam)',
    category: 'Tarbiah & Sahsiah',
    description: 'Menyusun tentatif, objektif slot dan aktiviti LDK yang menyatukan sahsiah kepimpinan dengan amalan sunnah.',
    prompt: `Rangka satu kertas konsep dan jadual program Kem Kepimpinan Pemimpin Murid Sekolah Islam (Pengawas, Ketua Asrama, Naqib) bertema "Pemimpin Rabbani: Mewarisi Integriti Sahabat".
Tempoh: 3 Hari 2 Malam di Pusat Latihan / Kem Asrama.
Jumlah Peserta: 60 orang murid tingkatan 3 dan 4.

Sila sediakan:
1. Objektif Khusus Kemenjadian Murid.
2. Jadual Tentatif Lengkap dari Solat Subuh berjemaah, Qiamullail, slot Latihan Dalam Kumpulan (LDK) hingga aktiviti riadhah sunnah.
3. Modul 4 Slot Utama:
   - Slot 1: Karisma Umar Al-Khattab (Ketegasan & Keadilan).
   - Slot 2: Seni Berunding & Komunikasi Empati Musab bin Umair.
   - Slot 3: Simulasi Pengurusan Konflik Rakan Sebaya di Sekolah.
   - Slot 4: Ikrar Amanah & Resolusi Tindakan.
4. Rubrik penilaian kemenjadian peserta pra dan pasca kem.`,
    usageInstructions: 'Gunakan untuk merangka kertas kerja program kepimpinan pengawas sekolah.',
    tags: ['Tarbiah', 'Kepimpinan Murid', 'Kem', 'Sahsiah'],
  },
];

export const AI_TOOLS_LIST: AIToolItem[] = [
  {
    id: 'tool-gemini',
    name: 'Google Gemini for Education',
    category: 'Model Bahasa Raya (LLM)',
    description: 'Model AI termaju Google dengan sokongan carian terkini dan pemprosesan dokumen panjang sehingga ribuan patah perkataan.',
    url: 'https://gemini.google.com',
    badge: 'Disyorkan',
    bestFor: 'Analisis laporan sekolah, sintesis pekeliling kementerian, dan penulisan teks rasmi bahasa Melayu.',
  },
  {
    id: 'tool-notebooklm',
    name: 'Google NotebookLM',
    category: 'Penolong Penyelidikan Dokumen AI',
    description: 'Sistem analisis berasaskan sumber rujukan yang anda muat naik sendiri (Buku teks, minit mesyuarat, dasar sekolah) tanpa risiko halusinasi.',
    url: 'https://notebooklm.google.com',
    badge: 'Eksklusif Pengetua',
    bestFor: 'Membaca dan menyoal isi kandungan buku dasar kurikulum, teks perlembagaan dan pelan strategik sekolah.',
  },
  {
    id: 'tool-perplexity',
    name: 'Perplexity AI',
    category: 'Enjin Carian Pintar & Rujukan',
    description: 'Enjin carian berasaskan AI yang memberikan jawapan komprehensif berserta pautan sumber rujukan sahih.',
    url: 'https://www.perplexity.ai',
    badge: 'Carian Pantas',
    bestFor: 'Mencari fakta perundangan, data perangkaan pendidikan semasa dan kajian ilmiah terkini.',
  },
  {
    id: 'tool-canva',
    name: 'Canva for Education AI',
    category: 'Reka Bentuk & Bahan Promosi',
    description: 'Peralatan reka bentuk intuitif dengan keupayaan Magic Studio AI untuk menghasilkan poster program sekolah dan infografik.',
    url: 'https://www.canva.com/education/',
    badge: 'Media & Grafik',
    bestFor: 'Penghasilan poster hebahan AGM, sijil penghargaan murid dan montaj video ringkas aktiviti sekolah.',
  },
  {
    id: 'tool-gamma',
    name: 'Gamma App',
    category: 'Pembina Slaid & Pembentangan Pantas',
    description: 'Hasilkan slaid pembentangan profesional mesyuarat PIBG atau taklimat kurikulum dalam masa 2 minit hanya dengan menaip tajuk.',
    url: 'https://gamma.app',
    badge: 'Produktiviti',
    bestFor: 'Menyediakan slaid pembentangan taklimat mesyuarat pimpinan dan modul kursus guru.',
  },
];
