import {
  NewsItem,
  StrategicFocus,
  BestPracticeItem,
  ProgramEvent,
  LeaderProfile,
  MemberSchool,
  MediaItem,
  ResourceDocument,
  NetworkStats,
  EventRegistration,
  AlumniRecord,
} from '../types';
import faizLeaderPhoto from '../assets/images/mohamad_faiz_azizan_leader.webp';

export const INITIAL_NETWORK_STATS: NetworkStats = {
  schoolsCount: 420,
  statesCount: 14,
  principalsCount: 850,
  studentsBenefited: '180,000+',
  isPlaceholder: true,
};

export const STRATEGIC_FOCUS_LIST: StrategicFocus[] = [
  {
    id: 1,
    code: 'FOKUS-01',
    title: 'Kepimpinan PGB',
    shortDesc: 'Peningkatan kompetensi kepimpinan instruksional, integriti tadbir urus, dan kebitaraan Pengetua serta Guru Besar berjiwa Rabbani.',
    fullDesc: 'Fokus ini memacu standard profesionalisme pentadbir sekolah Islam melalui siri wacana kepimpinan berimpak tinggi, pentauliahan kepimpinan Islam kontemporari, dan pendedahan kepada amalan tadbir urus terbaik bertaraf antarabangsa.',
    iconName: 'ShieldCheck',
    initiatives: [
      'Program Pembangunan Kepimpinan Eksekutif PGB (E-LEAD Rabbani)',
      'Kerangka Kompetensi Standard Pentadbir Sekolah Islam Malaysia',
      'Pementoran & Bimbingan PGB Baharu oleh Tokoh Pendidikan Senior',
      'Wacana Meja Bulat Dasar Kepimpinan Bersama KPM & Agensi Pusat'
    ],
    kpi: '100% PGB mencapai skor tahap kompetensi kepimpinan berimpak tinggi',
    status: 'Fokus Utama'
  },
  {
    id: 2,
    code: 'FOKUS-02',
    title: 'MPGBSIM sebagai Pusat Perkongsian Amalan Terbaik',
    shortDesc: 'Hab rujukan kurikulum integrasi, pedagogi tahfiz termaju, dan model pengurusan sekolah Islam cemerlang merentas negeri.',
    fullDesc: 'Menjadikan MPGBSIM sebagai gedung ilmu rujukan kebangsaan di mana amalan terbaik dari sekolah model (benchmark schools) didokumentasikan, disebarluaskan dan dijadikan panduan adaptasi untuk institusi pendidikan Islam lain.',
    iconName: 'Share2',
    initiatives: [
      'Repositori Terbuka Amalan Terbaik Pendidikan Islam (RT-PIM)',
      'Siri Jelajah Penandaarasan & Ziarah Mahabbah Antara Sekolah',
      'Penerbitan Jurnal Pengurusan & Kepimpinan Sekolah Islam',
      'Sijil Pengiktirafan Inovasi Pengurusan Sekolah Cemerlang'
    ],
    kpi: 'Sekurang-kurangnya 50 Amalan Terbaik didokumentasikan setiap tahun',
    status: 'Sedang Berjalan'
  },
  {
    id: 3,
    code: 'FOKUS-03',
    title: 'AI & Transformasi Digital',
    shortDesc: 'Penerapan kecerdasan buatan (AI), analisis data analitik sekolah, dan automasi pentadbiran yang beretika selaras syariat.',
    fullDesc: 'Melengkapkan Pengetua dan Guru Besar dengan keupayaan memanfaatkan alatan GenAI, sistem pengurusan sekolah pintar (Smart School OS), dashboard analitik prestasi murid serta pengukuhan keselamatan siber dan etika digital Islam.',
    iconName: 'Cpu',
    initiatives: [
      'Garis Panduan Penggunaan AI Beretika & Berpandukan Syariah',
      'Bengkel Literasi AI Generatif untuk Pengurusan Sekolah',
      'Inisiatif Transformasi Sekolah Pintar Islam (SMART-SIM)',
      'Dashboard Analitik Kepimpinan Berpusat untuk PGB'
    ],
    kpi: '80% sekolah ahli mengintegrasikan alatan digital & AI dalam pentadbiran',
    status: 'Fokus Utama'
  },
  {
    id: 4,
    code: 'FOKUS-04',
    title: 'Keberkesanan Media MPGBSIM',
    shortDesc: 'Penyampaian naratif pendidikan Islam yang kredibel, pemerkasaan portal rasmi, dan saluran advokasi nasional yang berwibawa.',
    fullDesc: 'Membina citra institusi yang profesional di persada nasional dan antarabangsa melalui komunikasi strategik, penyiaran kenyataan media berwibawa mengenai isu pendidikan semasa, serta penerbitan buletin berkala MPGBSIM.',
    iconName: 'Radio',
    initiatives: [
      'Penaiktarafan Portal Rasmi & Studio Komunikasi Digital MPGBSIM',
      'Advokasi Dasar Pendidikan Islam dalam Media Arus Perdana',
      'Penerbitan Buletin Bulanan & Podcast Kepimpinan "Suara PGB"',
      'Sidang Media & Kenyataan Bersama Berkenaan Isu Pendidikan Islam'
    ],
    kpi: 'Peningkatan liputan dan kesedaran awam terhadap peranan MPGBSIM sebanyak 60%',
    status: 'Sedang Berjalan'
  },
  {
    id: 5,
    code: 'FOKUS-05',
    title: 'Kebajikan & Sokongan PGB',
    shortDesc: 'Ekosistem kebajikan, bantuan sokongan perundangan profesional, dan pengukuhan kesejahteraan emosi para pentadbir.',
    fullDesc: 'Memastikan para Pengetua dan Guru Besar mendapat sokongan moral, bantuan khidmat nasihat pentadbiran dan perundangan profesional, serta ruang jaringan ukhuwah bagi menangani tekanan cabaran pengurusan alaf baharu.',
    iconName: 'HeartHandshake',
    initiatives: [
      'Tabung Kebajikan & Kecemasan Ahli MPGBSIM Kebangsaan',
      'Klinik Khidmat Nasihat Perundangan & Tadbir Urus Pengurusan',
      'Retreat Kesejahteraan Emosi & Kepimpinan Rohani PGB',
      'Jaringan Sokongan Rakan Sebaya (PGB Peer-Support Network)'
    ],
    kpi: 'Saluran bantuan kebajikan beroperasi 24/7 untuk ahli yang memerlukan',
    status: 'Sedang Berjalan'
  },
  {
    id: 6,
    code: 'FOKUS-06',
    title: '1 Program Berimpak Tinggi',
    shortDesc: 'Penganjuran persidangan perdana tahunan bertaraf kebangsaan yang menghimpunkan seluruh saf kepimpinan sekolah Islam.',
    fullDesc: 'Program mercu tanda (flagship) tahunan yang membawa pembuat dasar negara, pakar pendidikan global, serta para cendekiawan untuk merumuskan resolusi strategik hala tuju pendidikan Islam Malaysia.',
    iconName: 'Sparkles',
    initiatives: [
      'Konvensyen Kepimpinan Pendidikan Islam Kebangsaan (KOPIK 2026)',
      'Majlis Anugerah Tokoh Kepimpinan PGB Rabbani Kebangsaan',
      'Pameran Inovasi Pendidikan & Ekspo Penyedia Teknologi Sekolah',
      'Perumusan Resolusi Pendidikan Islam untuk Dikemukakan kepada Kerajaan'
    ],
    kpi: 'Penyertaan lebih 1,000 pentadbir sekolah Islam dari seluruh negara',
    status: 'Perancangan 2026'
  }
];

export const LATEST_NEWS_LIST: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Kenyataan Rasmi MPGBSIM: Memperkukuh Kerangka AI & Etika Digital di Sekolah-Sekolah Islam',
    slug: 'kenyataan-ai-etika-digital-sekolah-islam',
    summary: 'MPGBSIM menggariskan panduan komprehensif bagi memastikan pemanfaatan teknologi kecerdasan buatan selaras dengan nilai integriti dan syariat Islam.',
    content: `KUALA LUMPUR — Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) hari ini melancarkan Kerangka Kerja AI & Etika Digital untuk Institusi Pendidikan Islam 2026.\n\nYang Dipertua MPGBSIM menegaskan bahawa kemajuan pesat teknologi kecerdasan buatan (GenAI) tidak boleh dilihat sebagai ancaman sebaliknya perlu dimanfaatkan secara bijaksana oleh para pentadbir dan warga pendidik demi memacu kecekapan pengurusan serta memudah cara pembelajaran berimpak tinggi.\n\n"Pendidikan Islam mesti sentiasa berada di barisan hadapan kemajuan ilmu. Kita bukan sekadar pengguna teknologi, bahkan pembina acuan adab dan akhlak digital berteraskan nilai Rabbani," jelas beliau semasa sidang media selepas mesyuarat jawatankuasa kepimpinan kebangsaan.\n\nDokumen kerangka ini bakal diedarkan kepada semua sekolah ahli dan boleh dimuat turun secara percuma melalui Portal Rasmi MPGBSIM.`,
    category: 'Kenyataan Media',
    date: '14 September 2026',
    author: 'Urus Setia Komunikasi Strategik MPGBSIM',
    readTime: '4 min bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    featured: true
  },
  {
    id: 'news-2',
    title: 'Persediaan Konvensyen Kepimpinan Pendidikan Islam Kebangsaan (KOPIK 2026) Masuki Fasa Akhir',
    slug: 'persediaan-kopik-2026-fasa-akhir',
    summary: 'Lebih 1,000 Pengetua dan Guru Besar dijangka berkumpul di Pusat Konvensyen Antarabangsa Putrajaya bagi membincangkan resolusi hala tuju pendidikan Islam alaf baharu.',
    content: `PUTRAJAYA — Jawatankuasa Penganjur Konvensyen Kepimpinan Pendidikan Islam Kebangsaan (KOPIK 2026) mengesahkan bahawa pendaftaran awal kini telah mencapai 75% daripada kapasiti dewan.\n\nBertemakan "Kepimpinan Futuristik Berjiwa Rabbani: Menavigasi Dinamika Pendidikan Abad Ke-21", konvensyen tiga hari ini akan menampilkan pembentangan ucaptama daripada tokoh pendidikan ternama dalam dan luar negara, bengkel pengurusan strategik, serta majlis penganugerahan kepimpinan cemerlang.\n\nPara pentadbir sekolah yang belum mendaftar digalakkan memanfaatkan pendaftaran melalui Portal Ahli MPGBSIM sebelum tarikh tutup pada hujung bulan ini.`,
    category: 'Aktiviti',
    date: '10 September 2026',
    author: 'Jawatankuasa Acara Kebangsaan',
    readTime: '3 min bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    featured: false
  },
  {
    id: 'news-3',
    title: 'Sesi Dialog Meja Bulat Dasar Pendidikan Islam Bersama KPM & Agensi Pusat',
    slug: 'dialog-meja-bulat-kpm-agensi-pusat',
    summary: 'Pertemuan bersejarah membincangkan pelarasan piawaian kurikulum tahfiz integrasi, skim kebajikan guru, dan peruntukan dana naik taraf infrastruktur sekolah.',
    content: `CYBERJAYA — MPGBSIM telah mengadakan sesi rundingan meja bulat bersama wakil Kementerian Pendidikan Malaysia (KPM) serta agensi-agensi agama persekutuan.\n\nAntara usul utama yang dibentangkan oleh pihak Majlis adalah penyeragaman pengiktirafan sijil tahfiz kebangsaan, penambahbaikan laluan kerjaya pentadbir sekolah Islam swasta dan bantuan geran pendigitalan untuk sekolah-sekolah di kawasan luar bandar.\n\nSesi ini membuahkan persetujuan penubuhan Jawatankuasa Kerja Bersama bagi meneliti perincian pelaksanaan dalam tempoh enam bulan akan datang.`,
    category: 'Pengurusan',
    date: '02 September 2026',
    author: 'Biro Advokasi & Dasar MPGBSIM',
    readTime: '5 min bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    featured: false
  },
  {
    id: 'news-4',
    title: 'Pentauliahan 45 Pengetua & Guru Besar Baharu dalam Program Mentoring E-LEAD',
    slug: 'pentauliahan-45-pengetua-guru-besar-baharu',
    summary: 'Kumpulan pertama pentadbir baharu berjaya menamatkan fasa bimbingan intensif 6 bulan di bawah pengawasan tokoh pendidikan tersohor.',
    content: `BANGI — Seramai 45 orang Pengetua dan Guru Besar yang baru dilantik telah menerima watikah penyempurnaan program bimbingan E-LEAD Rabbani dalam satu majlis apresiasi di Kompleks Pendidikan Islam Bangi.\n\nProgram ini memberi penekanan terhadap kepimpinan instruksional, kemahiran pengurusan krisis, komunikasi strategik bersama ibu bapa serta pengukuhan integriti kewangan sekolah.\n\nPara graduan program menyatakan keyakinan tinggi untuk membawa pembaharuan positif di sekolah masing-masing berbekalkan jaringan sokongan padu MPGBSIM.`,
    category: 'Pendidikan',
    date: '25 Ogos 2026',
    author: 'Institut Latihan Kepimpinan MPGBSIM',
    readTime: '3 min bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    featured: false
  }
];

export const BEST_PRACTICES_LIST: BestPracticeItem[] = [
  {
    id: 'bp-1',
    title: 'Model Integrasi Kurikulum Tahfiz & STEM Bersepadu (i-STEM Tahfiz)',
    schoolName: 'Sekolah Menengah Agama Persekutuan Kajang',
    state: 'Selangor',
    category: 'Tahfiz & Kurikulum',
    impactSummary: 'Peningkatan 98% kelulusan sains tulen serentak dengan 92% pelajar mengkhatamkan 30 juzuk Al-Quran sebelum tamat Tingkatan 5.',
    description: 'Program ini menyusun jadual hafazan secara modul waktu subuh dan maghrib yang dipadankan dengan pembelajaran berasaskan inkuiri sains pada waktu siang, disokong oleh makmal sains digital bertaraf tinggi.',
    keyOutcomes: [
      '98% murid khatam 30 juzuk dengan mutqin',
      'Pemenang Anugerah Inovasi STEM Peringkat Antarabangsa',
      'Peningkatan purata gred SPM sekolah kepada 1.82'
    ],
    leadPerson: 'Ustaz Ahmad Fauzi bin Daud (Pengetua Cemerlang)',
    year: '2025/2026',
    badge: 'Penandaarasan Kebangsaan'
  },
  {
    id: 'bp-2',
    title: 'Sistem Pengurusan Sekolah Pintar Berasaskan AI (Smart Tadbir-AI)',
    schoolName: 'Sekolah Rendah Islam Hira’ Shah Alam',
    state: 'Selangor',
    category: 'Kepimpinan Digital',
    impactSummary: 'Mengurangkan beban kerja perkeranian pentadbir dan guru sebanyak 65% melalui automasi pelaporan kehadiran, takwim, dan analisis sahsiah.',
    description: 'Membangunkan sistem dalaman bersepadu yang menggunakan kecerdasan buatan untuk mengesan corak kehadiran murid, menjana laporan perkembangan sahsiah harian, serta memudahkan komunikasi telus dengan ibu bapa melalui aplikasi mudah alih.',
    keyOutcomes: [
      'Penjimatan 180 jam waktu pentadbiran sebulan bagi guru',
      'Kadar respons ibu bapa terhadap maklum balas sekolah mencecah 94%',
      'Sifar keciciran maklumat rekod disiplin dan kebajikan murid'
    ],
    leadPerson: 'Dr. Siti Rahmah binti Idris (Guru Besar)',
    year: '2025/2026',
    badge: 'Inovasi Digital'
  },
  {
    id: 'bp-3',
    title: 'Model Ekosistem Tarbiyah & Sahsiah Rabbani Berterusan (S-RABBANI)',
    schoolName: 'Sekolah Menengah Agama Al-Ittihadiah',
    state: 'Kedah',
    category: 'Pembangunan Sahsiah',
    impactSummary: 'Kadar salah laku disiplin sifar dan pembentukan kepimpinan murid kendiri melalui usrah harian serta amalan muamalah beradab.',
    description: 'Pendekatan pembinaan karakter yang berstruktur melibatkan pengawasan mentor guru (Murabbi), buku log amalan solat berjemaah, aktiviti sukarelawan komuniti mingguan serta audit kendiri integriti murid.',
    keyOutcomes: [
      'Sifar rekod kes disiplin berat selama 3 tahun berturut-turut',
      '100% murid terlibat dalam aktiviti khidmat masyarakat luar bandar',
      'Pengiktirafan Anugerah Sahsiah Terpuji Peringkat Negeri'
    ],
    leadPerson: 'Tuan Haji Hashim bin Wan Chik (Pengetua)',
    year: '2024/2026',
    badge: 'Sahsiah Unggul'
  },
  {
    id: 'bp-4',
    title: 'Dana Wakaf Pendidikan Lestari & Keusahawanan Sekolah (WAKAF-PRENEUR)',
    schoolName: 'Kolej Islam Sultan Alam Shah',
    state: 'Selangor',
    category: 'Kelestarian & Wakaf',
    impactSummary: 'Menjana dana pusingan wakaf melebihi RM 1.2 Juta bagi membiayai yuran pelajar asnaf dan menaik taraf fasiliti makmal komputer.',
    description: 'Inisiatif endowmen wakaf pendidikan berstruktur dengan tadbir urus audit luaran yang telus, disokong oleh perusahaan sosial sekolah (kebun fertigasi moden dan koperasi digital) untuk kelestarian pembiayaan jangka panjang.',
    keyOutcomes: [
      '120 murid asnaf ditaja yuran dan sara hidup persekolahan penuh',
      'Pembinaan makmal komputer berkuasa tinggi berdana sendiri',
      'Tadbir urus kewangan sekolah mendapat pensijilan 5 Bintang'
    ],
    leadPerson: 'Puan Hajah Zaleha binti Mustafa (Pengetua Kanan)',
    year: '2025/2026',
    badge: 'Kelestarian Kewangan'
  }
];

export const UPCOMING_PROGRAMS_LIST: ProgramEvent[] = [
  {
    id: 'prog-1',
    title: 'Konvensyen Kepimpinan Pendidikan Islam Kebangsaan 2026 (KOPIK 2026)',
    theme: '“Kepimpinan Futuristik Berjiwa Rabbani: Menavigasi Dinamika Pendidikan Abad Ke-21”',
    date: '28 – 30 Oktober 2026',
    time: '8:30 Pagi – 5:00 Petang',
    venue: 'Pusat Konvensyen Antarabangsa Putrajaya (PICC)',
    mode: 'Fizikal',
    targetAudience: 'Pengetua, Guru Besar, Penolong Kanan, dan Lembaga Pengelola Sekolah Islam',
    description: 'Acara perdana dwi-tahunan MPGBSIM yang menghimpunkan lebih 1,000 pemimpin pendidikan untuk membahaskan resolusi hala tuju, bengkel masterclass kepimpinan, dan pameran teknologi pendidikan.',
    spotsTotal: 1000,
    spotsFilled: 780,
    registrationOpen: true,
    closingDate: '15 Oktober 2026',
    fees: 'RM 350 (Ahli) / RM 450 (Bukan Ahli)',
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'prog-2',
    title: 'Bengkel Eksekutif: Pemanfaatan AI Generatif & Analisis Data Pengurusan Sekolah',
    theme: '“Automasi Pintar & Keputusan Berasaskan Data untuk PGB Abad Ke-21”',
    date: '18 November 2026',
    time: '9:00 Pagi – 4:30 Petang',
    venue: 'Auditorium Kompleks Pendidikan Islam, Bangi & Hibrid Zoom',
    mode: 'Hibrid',
    targetAudience: 'PGB & Guru Penyelaras ICT Sekolah Islam',
    description: 'Latihan amali (hands-on) membina prompt AI pengurusan, merangka jadual waktu pintar, menguruskan analitis prestasi peperiksaan, dan memelihara etika privasi data murid.',
    spotsTotal: 250,
    spotsFilled: 195,
    registrationOpen: true,
    closingDate: '10 November 2026',
    fees: 'Percuma untuk Ahli MPGBSIM Berdaftar',
    posterUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'prog-3',
    title: 'Wacana Meja Bulat: Pemerkasaan Tadbir Urus & Skim Kebajikan PGB Sekolah Islam',
    theme: '“Integriti Kepimpinan, Kemakmuran Institusi, Kesejahteraan Pentadbir”',
    date: '05 Disember 2026',
    time: '2:30 Petang – 5:30 Petang',
    venue: 'Dewan Bankuet Ar-Razi, Cyberjaya',
    mode: 'Fizikal',
    targetAudience: 'Ahli Jawatankuasa Kebangsaan, Wakil PGB Negeri, dan Penasihat Undang-Undang',
    description: 'Sesi perbincangan tertutup menggubal draf memorandum cadangan penambahbaikan skim sara hidup, perlindungan perundangan dan tabung amanah kebajikan PGB.',
    spotsTotal: 80,
    spotsFilled: 65,
    registrationOpen: true,
    closingDate: '28 November 2026',
    fees: 'Tertutup (Jemputan & Ahli Majlis)',
    posterUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'prog-4',
    title: 'Webinar Kebangsaan: Model Kurikulum Tahfiz Integrasi Masa Hadapan',
    theme: '“Mengimbangi Hafazan Mutqin dan Penguasaan Sains Tulen Bertaraf Global”',
    date: '14 Januari 2027',
    time: '9:30 Pagi – 12:30 Tengah Hari',
    venue: 'Siaran Langsung Portal MPGBSIM & YouTube Live',
    mode: 'Dalam Talian',
    targetAudience: 'Terbuka kepada semua Guru Besar, Pengetua & Guru Tahfiz',
    description: 'Perkongsian amalan terbaik oleh 3 sekolah model yang berjaya melahirkan Huffaz profesional cemerlang SPM dan STAM dengan metodologi pembelajaran moden.',
    spotsTotal: 1500,
    spotsFilled: 420,
    registrationOpen: true,
    closingDate: '12 Januari 2027',
    fees: 'Percuma (Penyertaan Terbuka)',
    posterUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
  }
];

export const LEADERSHIP_TEAM: LeaderProfile[] = [
  {
    id: 'lead-1',
    name: 'Mohamad Faiz Azizan',
    role: 'Pengerusi Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    subRole: 'Yang Dipertua Kebangsaan MPGBSIM',
    institution: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    state: 'Selangor',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    avatarUrl: faizLeaderPhoto,
    order: 0
  },
  {
    id: 'lead-2',
    name: 'Dr. Mohd Syukri bin Abdullah',
    role: 'Timbalan Yang Dipertua Kebangsaan',
    subRole: 'Penyelaras Kluster Kepimpinan Instruksional',
    institution: 'Sekolah Menengah Agama Integrasi Putrajaya',
    state: 'Wilayah Persekutuan',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    order: 1
  },
  {
    id: 'lead-3',
    name: 'Ustazah Hajah Noraini binti Ahmad',
    role: 'Naib Yang Dipertua (Sektor Rendah)',
    subRole: 'Penyelaras Guru Besar Sekolah Rendah Islam',
    institution: 'Sekolah Rendah Islam Integrasi Al-Hikmah',
    state: 'Johor',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    order: 2
  },
  {
    id: 'lead-4',
    name: 'Tuan Haji Azhar bin Zainal Abidin',
    role: 'Setiausaha Agung Kehormat',
    subRole: 'Ketua Urus Setia Dasar & Pentadbiran',
    institution: 'Sekolah Menengah Agama Persekutuan Labu',
    state: 'Negeri Sembilan',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    order: 3
  },
  {
    id: 'lead-5',
    name: 'Ustaz Khairul Anuar bin Sulaiman',
    role: 'Bendahari Kehormat Kebangsaan',
    subRole: 'Pengerusi Biro Kelestarian & Tabung Kebajikan',
    institution: 'Maahad Tahfiz Sains Integrasi Kubang Pasu',
    state: 'Kedah',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    order: 4
  },
  {
    id: 'lead-6',
    name: 'Dr. Wan Noor Fariza binti Wan Ismail',
    role: 'Ketua Biro AI & Transformasi Digital',
    subRole: 'Penyelaras Inovasi Pengurusan Digital PGB',
    institution: 'Sekolah Menengah Islam Hidayah',
    state: 'Kelantan',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    order: 5
  }
];

export const SAMPLE_MEMBER_SCHOOLS: MemberSchool[] = [
  {
    id: 'sch-musleh-1',
    name: 'Sekolah Rendah Islam I Musleh',
    code: 'MJAC011',
    type: 'Sekolah Rendah',
    state: 'Melaka',
    district: 'Melaka Tengah',
    principal: 'Abdul Qayyum bin Yaakop',
    principalPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    studentCount: 428,
    teacherCount: 36,
    joinYear: 2011,
    serviceStartYear: 2024,
    pgbStartYear: 2024,
    website: 'https://imuslehmelaka.edu.my/',
    email: 'sekolahrendahimusleh@gmail.com',
    pgbEmail: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
    phone: '06-2320970',
    schoolPhone: '06-2320970',
    pgbPhone: '06-2320970',
    address: 'Sekolah Rendah: No. 25, Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Melaka.',
    description:
      'Sekolah Rendah Islam I Musleh (SRIIM) merupakan sebuah institusi pendidikan rendah Islam di Melaka yang menggabungkan pendidikan akademik arus perdana dengan pembentukan sahsiah, kerohanian dan karakter murid berteraskan konsep Soleh wa Musleh.\n\nSRIIM terletak di Kompleks Komersial Boulevard, Taman Tasik Utama, Ayer Keroh, Melaka dan dikendalikan oleh Syarikat Edu Insaniah Sdn. Bhd. sejak 2011. Sekolah ini berdaftar dengan Kementerian Pendidikan Malaysia (KPM) dan Jabatan Agama Islam Melaka (JAIM), dengan kod institusi MJAC011.\n\nDari segi pendidikan, SRIIM berpegang kepada falsafah pembentukan insan Rabbani berasaskan al-Quran dan al-Sunnah, dengan penekanan kepada tiga nilai utama: ILMU • IMAN • IHSAN.',
    logoUrl: '',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
  }
];

export const MEDIA_GALLERY_LIST: MediaItem[] = [
  {
    id: 'med-1',
    title: 'Wacana Meja Bulat Kepimpinan PGB Kebangsaan 2026',
    type: 'photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    date: '02 September 2026',
    location: 'Cyberjaya, Selangor',
    caption: 'Sesi perbincangan strategik bersama kepimpinan tertinggi sekolah-sekolah Islam seluruh Malaysia.'
  },
  {
    id: 'med-2',
    title: 'Sorotan Persidangan Agung Tahunan & Pelancaran Pelan Strategik',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    date: '15 Julai 2026',
    location: 'PICC, Putrajaya',
    caption: 'Montaj video pelancaran Pelan Transformasi Kepimpinan MPGBSIM 2026-2030.'
  },
  {
    id: 'med-3',
    title: 'Bengkel Transformasi AI dalam Pengurusan Sekolah Islam',
    type: 'photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    date: '20 Ogos 2026',
    location: 'Bangi, Selangor',
    caption: 'Peserta bengkel meneliti modul automasi pentadbiran dan analisis data sekolah.'
  },
  {
    id: 'med-4',
    title: 'Lawatan Penandaarasan & Ziarah Mahabbah ke Sekolah Model Cemerlang',
    type: 'photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',
    date: '05 Ogos 2026',
    location: 'Kajang, Selangor',
    caption: 'Delegasi pentadbir meninjau kemudahan makmal sains bersepadu tahfiz.'
  },
  {
    id: 'med-5',
    title: 'Wawancara Eksklusif: "Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani"',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
    date: '28 Jun 2026',
    location: 'Studio Media MPGBSIM',
    caption: 'Bicara kepimpinan bersama Yang Dipertua Kebangsaan MPGBSIM membincangkan hala tuju pendidikan Rabbani.'
  },
  {
    id: 'med-6',
    title: 'Apresiasi Graduan Program Mentoring E-LEAD PGB Baharu',
    type: 'photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    date: '25 Ogos 2026',
    location: 'Bangi, Selangor',
    caption: 'Barisan Pengetua dan Guru Besar baharu yang menyempurnakan pentauliahan kepimpinan.'
  }
];

export const RESOURCE_DOCS: ResourceDocument[] = [
  {
    id: 'res-1',
    title: 'Garis Panduan Tadbir Urus & Integriti Pentadbiran Sekolah Islam 2026',
    category: 'Garis Panduan',
    publishedDate: 'Ogos 2026',
    fileSize: '4.2 MB',
    fileFormat: 'PDF',
    downloads: 1240,
    description: 'Panduan lengkap piawaian tadbir urus kewangan, pengurusan sumber manusia dan etika kepimpinan bagi PGB.',
    driveUrl: 'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link',
  },
  {
    id: 'res-2',
    title: 'Kerangka AI & Literasi Digital Beretika Sekolah Islam Malaysia',
    category: 'Kertas Dasar',
    publishedDate: 'September 2026',
    fileSize: '2.8 MB',
    fileFormat: 'PDF',
    downloads: 890,
    description: 'Garis panduan rasmi pengintegrasian kecerdasan buatan (GenAI) dalam kurikulum dan operasi harian sekolah.',
    driveUrl: 'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link',
  },
  {
    id: 'res-3',
    title: 'Modul Kepimpinan Rabbani: Siri Bimbingan Eksekutif E-LEAD',
    category: 'Modul Kepimpinan',
    publishedDate: 'Julai 2026',
    fileSize: '6.5 MB',
    fileFormat: 'PDF',
    downloads: 2150,
    description: 'Modul latihan kepimpinan instruksional, kemahiran syura, pengurusan konflik dan pembinaan iklim sekolah mithali.',
    driveUrl: 'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link',
  },
  {
    id: 'res-4',
    title: 'Pekeliling MPGBSIM Bil 1/2026: Pendaftaran Ahli & Prosedur Undian Majlis',
    category: 'Pekeliling',
    publishedDate: 'Jun 2026',
    fileSize: '1.4 MB',
    fileFormat: 'PDF',
    downloads: 1680,
    description: 'Surat pekeliling rasmi berhubung tatacara pengesahan keahlian tahunan dan hak perwakilan ke Konvensyen Kebangsaan.',
    driveUrl: 'https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link',
  }
];

export const MALAYSIA_STATES = [
  'Semua Negeri',
  'Selangor',
  'Wilayah Persekutuan',
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
  'Terengganu'
];

export const PORTAL_SCHOOL_TYPES = [
  'Sekolah Rendah',
  'Sekolah Menengah',
  'Maahad Tahfiz',
  'Rakan Musleh'
];

export const SCHOOL_TYPES = [
  'Semua Jenis Sekolah',
  ...PORTAL_SCHOOL_TYPES
];

export const SAMPLE_MEMBER_APPLICATIONS = [
  {
    id: 'app-mt-01',
    refId: 'MPGB-REG-2026-081',
    fullName: 'Ustaz Haji Ahmad Shafie bin Mohd Nor',
    icNumber: '750412-03-5189',
    email: 'mudir@tahfizdarululum.edu.my',
    phoneNumber: '+60 19-948 2145',
    pgbEmail: 'mudir@tahfizdarululum.edu.my',
    pgbPhone: '+60 19-948 2145',
    schoolEmail: 'pejabat@tahfizdarululum.edu.my',
    schoolPhone: '+60 9-771 9021',
    designation: 'Pengetua',
    serviceStartYear: 2017,
    schoolName: 'Maahad Tahfiz Darul Ulum Al-Hikmah',
    schoolCode: 'MTD-9021',
    schoolType: 'Maahad Tahfiz',
    state: 'Kelantan',
    district: 'Kota Bharu',
    website: 'https://tahfizdarululum.edu.my',
    studentCount: 380,
    teacherCount: 28,
    logoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=400&q=80',
    pgbPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1000&q=80',
    schoolDescription: 'Sebuah institusi tahfiz Al-Quran dan sains integrasi yang menumpukan penguasaan 30 juzuk hafazan Al-Quran berserta kurikulum KBSM arus perdana.',
    address: 'Lot 142, Mukim Kemumin, Pengkalan Chepa, 16100 Kota Bharu, Kelantan',
    status: 'pending' as const,
    submittedAt: '2026-09-18T10:30:00.000Z',
  },
  {
    id: 'app-mt-02',
    refId: 'MPGB-REG-2026-094',
    fullName: 'Ustazah Dr. Hajah Aminah binti Zakaria',
    icNumber: '780821-08-6202',
    email: 'pengetua@srikreatif.edu.my',
    phoneNumber: '+60 12-441 8902',
    pgbEmail: 'pengetua@srikreatif.edu.my',
    pgbPhone: '+60 12-441 8902',
    schoolEmail: 'admin@assyakirin-islamic.edu.my',
    schoolPhone: '+60 3-5512 3301',
    designation: 'Guru Besar',
    serviceStartYear: 2019,
    schoolName: 'Sekolah Rendah Islam Integrasi As-Syakirin',
    schoolCode: 'SRI-3301',
    schoolType: 'Sekolah Rendah',
    state: 'Selangor',
    district: 'Shah Alam',
    website: 'https://assyakirin-islamic.edu.my',
    studentCount: 520,
    teacherCount: 36,
    logoUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80',
    pgbPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80',
    schoolDescription: 'Menawarkan pendidikan holistik berteraskan Al-Quran, Fardhu Ain, tahfiz intensif dan kurikulum kebangsaan KSSR.',
    address: 'Seksyen 7, 40000 Shah Alam, Selangor',
    status: 'pending' as const,
    submittedAt: '2026-09-20T14:15:00.000Z',
  },
];

export const DEFAULT_EVENT_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-demo-01',
    eventId: 'prog-1',
    eventTitle: 'Konvensyen Kepimpinan Pendidikan Islam Kebangsaan 2026 (KOPIK 2026)',
    eventDate: '28 – 30 Oktober 2026',
    participantName: 'Hj. Kamaruddin bin Abdul Wahab',
    participantEmail: 'kamaruddin.wahab@smka-hamidiah.edu.my',
    participantPhone: '+60 19-382 1104',
    schoolName: 'SMKA Maahad Hamidiah, Kajang',
    position: 'Pengetua Cemerlang',
    state: 'Selangor',
    registeredAt: '2026-09-22T08:30:00.000Z',
    status: 'confirmed',
    attendanceCode: 'MPGB-7102',
    notes: 'Wakil Jawatankuasa Kurikulum Zon Tengah',
  },
  {
    id: 'reg-demo-02',
    eventId: 'prog-1',
    eventTitle: 'Konvensyen Kepimpinan Pendidikan Islam Kebangsaan 2026 (KOPIK 2026)',
    eventDate: '28 – 30 Oktober 2026',
    participantName: 'Ustazah Dr. Hajah Fauziah binti Mohd Ariff',
    participantEmail: 'fauziah.ariff@musleh.edu.my',
    participantPhone: '+60 13-922 8410',
    schoolName: 'Kolej Islam As-Sofa',
    position: 'Pengetua',
    state: 'Negeri Sembilan',
    registeredAt: '2026-09-24T11:15:00.000Z',
    status: 'confirmed',
    attendanceCode: 'MPGB-5831',
    notes: 'Perlu pengesahan sijil CPD',
  },
  {
    id: 'reg-demo-03',
    eventId: 'prog-1',
    eventTitle: 'Konvensyen Kepimpinan Pendidikan Islam Kebangsaan 2026 (KOPIK 2026)',
    eventDate: '28 – 30 Oktober 2026',
    participantName: 'Ustaz Mohd Hafiz bin Mansor',
    participantEmail: 'hafiz.mansor@sri-alhikmah.edu.my',
    participantPhone: '+60 12-710 4390',
    schoolName: 'Sekolah Rendah Islam Al-Hikmah',
    position: 'Guru Besar',
    state: 'Johor',
    registeredAt: '2026-09-25T14:45:00.000Z',
    status: 'attended',
    attendanceCode: 'MPGB-9240',
    notes: 'Hadir bersama 1 orang Guru Penolong Kanan',
  },
  {
    id: 'reg-demo-04',
    eventId: 'prog-2',
    eventTitle: 'Bengkel Eksekutif: Pemanfaatan AI Generatif & Analisis Data Pengurusan Sekolah',
    eventDate: '18 November 2026',
    participantName: 'Cikgu Ahmad Syakir bin Zakaria',
    participantEmail: 'ahmad.syakir@srai-bangi.edu.my',
    participantPhone: '+60 18-245 7712',
    schoolName: 'SRAI Bandar Baru Bangi',
    position: 'Penolong Kanan Pentadbiran',
    state: 'Selangor',
    registeredAt: '2026-09-26T09:20:00.000Z',
    status: 'confirmed',
    attendanceCode: 'MPGB-3184',
    notes: 'Penyelaras AI & ICT Sekolah',
  },
  {
    id: 'reg-demo-05',
    eventId: 'prog-2',
    eventTitle: 'Bengkel Eksekutif: Pemanfaatan AI Generatif & Analisis Data Pengurusan Sekolah',
    eventDate: '18 November 2026',
    participantName: 'Ustazah Noraini binti Sulaiman',
    participantEmail: 'noraini.sulaiman@tahfiz-darululum.edu.my',
    participantPhone: '+60 19-883 4901',
    schoolName: 'Maahad Tahfiz Darul Ulum',
    position: 'Pengetua',
    state: 'Kelantan',
    registeredAt: '2026-09-27T16:00:00.000Z',
    status: 'confirmed',
    attendanceCode: 'MPGB-4429',
    notes: 'Penyertaan Mod Hibrid Zoom Online',
  },
  {
    id: 'reg-demo-06',
    eventId: 'prog-3',
    eventTitle: 'Wacana Meja Bulat: Pemerkasaan Tadbir Urus & Skim Kebajikan PGB Sekolah Islam',
    eventDate: '05 Disember 2026',
    participantName: 'Tuan Haji Ramli bin Othman',
    participantEmail: 'ramli.othman@mitc.edu.my',
    participantPhone: '+60 12-390 1245',
    schoolName: 'Maahad Integrasi Tahfiz Selangor (MITS) Sepang',
    position: 'Pengetua',
    state: 'Selangor',
    registeredAt: '2026-09-28T10:10:00.000Z',
    status: 'confirmed',
    attendanceCode: 'MPGB-1088',
    notes: 'Panel Meja Bulat Zon Selatan',
  },
];

export const SAMPLE_ALUMNI_RECORDS: AlumniRecord[] = [
  {
    id: 'alm-01',
    fullName: "Dato' Haji Ishak bin Ahmad",
    title: "Dato' Hj.",
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    gender: 'Lelaki',
    email: 'ishak.ahmad@alumni.mpgbsim.org',
    phone: '+60 19-320 4455',
    state: 'Selangor',
    lastPosition: 'Mantan Pengetua Cemerlang',
    lastSchool: 'SMKA Maahad Hamidiah Kajang',
    careerStartYear: 1988,
    retirementYear: 2022,
    leadershipHistory: [
      {
        id: 'lh-1',
        schoolName: "Sekolah Rendah Islam Hira' Shah Alam",
        position: 'Guru Besar',
        startYear: 1995,
        endYear: 2003,
        state: 'Selangor',
        highlights: 'Memelopori kurikulum integrasi sains dan tahfiz'
      },
      {
        id: 'lh-2',
        schoolName: 'SAM Bestari Subang Jaya',
        position: 'Pengetua',
        startYear: 2003,
        endYear: 2012,
        state: 'Selangor',
        highlights: 'Pencapaian Anugerah Sekolah Harapan Negara'
      },
      {
        id: 'lh-3',
        schoolName: 'SMKA Maahad Hamidiah Kajang',
        position: 'Pengetua Cemerlang',
        startYear: 2012,
        endYear: 2022,
        state: 'Selangor',
        highlights: 'Melahirkan 150+ huffaz cemerlang akademik'
      }
    ],
    expertise: ['Kepimpinan Rabbani', 'Pengurusan Kewangan Sekolah', 'Pembangunan Insan', 'Tadbir Urus Islah'],
    biography: 'Mengabdi selama lebih 34 tahun dalam persada kepimpinan pendidikan Islam tanah air. Beliau dikenali atas ketegasan integriti dan inovasi pengurusan sekolah Rabbani.',
    currentOrganisation: 'Lembaga Penasihat Pendidikan Islam Selangor',
    awards: ['Anugerah Tokoh Guru Selangor 2023', 'Pingat Jasa Kebangsaan (PJK)', 'Anugerah Pengetua Cemerlang Kebangsaan'],
    achievements: [
      'Pelopor Program Tahfiz Model Ulul Albab Zon Tengah',
      'Meningkatkan peratusan gred A+ SPM ke 98% di SMKA Hamidiah',
      'Penulis Buku "Model Tadbir Urus Sekolah Islam Rabbani"'
    ],
    contributions: 'Menyumbang dalam merangka Standard Kompetensi Pentadbir Sekolah Islam Malaysia.',
    mpgbsimRole: 'Mantan Pengerusi Biro Akademik MPGBSIM (2014–2020)',
    mpgbsimStartYear: 2010,
    mpgbsimEndYear: 2022,
    mpgbsimContribution: 'Menerajui penyediaan Modul Kepimpinan PGB dan penganjuran KOPIK Zon Tengah.',
    legacyQuote: 'Pendidikan Islam bukan sekadar menyampaikan ilmu pengetahuan, tetapi membina jiwa Rabbani yang menjadi benteng ummah dan tiang negara.',
    consent: {
      allowPublicDisplay: true,
      allowSchoolHistory: true,
      allowExpertise: true,
      allowQuote: true,
      allowContact: false,
    },
    verificationStatus: 'APPROVED',
    submittedAt: '2026-08-10T10:00:00.000Z',
    verifiedAt: '2026-08-12T14:30:00.000Z',
    verifiedBy: 'Pentadbir Rasmi MPGBSIM',
    featured: true,
  },
  {
    id: 'alm-02',
    fullName: 'Datin Hajah Salmah binti Yusof',
    title: 'Datin Hjh.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    gender: 'Perempuan',
    email: 'salmah.yusof@alumni.mpgbsim.org',
    phone: '+60 12-881 3344',
    state: 'Negeri Sembilan',
    lastPosition: 'Mantan Guru Besar Cemerlang',
    lastSchool: 'Sekolah Rendah Islam Musleh Seri Seremban',
    careerStartYear: 1992,
    retirementYear: 2024,
    leadershipHistory: [
      {
        id: 'lh-4',
        schoolName: 'Sekolah Rendah Islam Al-Amin Bangi',
        position: 'Guru Besar',
        startYear: 1998,
        endYear: 2010,
        state: 'Selangor',
        highlights: 'Mengembangkan enrolmen murid daripada 200 ke 1,200 orang'
      },
      {
        id: 'lh-5',
        schoolName: 'SRI Musleh Seri Seremban',
        position: 'Guru Besar Cemerlang',
        startYear: 2010,
        endYear: 2024,
        state: 'Negeri Sembilan',
        highlights: 'Anugerah Sekolah Cemerlang KBAT Kebangsaan'
      }
    ],
    expertise: ['Pengurusan Kurikulum Integrasi', 'Pedagogi Awal Kanak-kanak', 'Pementoran Guru Baharu'],
    biography: 'Berpengalaman luas dalam memperkasakan pendidikan dasar Islam dan pembangunan sahsiah awal anak-anak Musleh.',
    currentOrganisation: 'Konsultan Bebas Kurikulum Pendidikan Islam',
    awards: ['Anugerah Tokoh Pentadbir Musleh 2022', 'Pingat Khidmat Cemerlang'],
    achievements: [
      'Peneraju Modul Pembentukan Sahsiah Rabbani (PSR) Sekolah Rendah',
      'Pengasuh Lebih 50 Guru Besar Baharu Sekolah Islam'
    ],
    contributions: 'Membimbing puluhan sekolah rendah Islam persendirian mencapai akreditasi KPM.',
    mpgbsimRole: 'Mantan Ahli Jawatankuasa Kebangsaan MPGBSIM (2016–2024)',
    mpgbsimStartYear: 2012,
    mpgbsimEndYear: 2024,
    mpgbsimContribution: 'Memimpin Kluster Pembangunan Guru Besar Sekolah Rendah Islam.',
    legacyQuote: 'Setiap anak adalah amanah suci. Sentuhlah hati mereka dengan kasih sayang Islam sebelum membentuk akal mereka dengan keilmuan.',
    consent: {
      allowPublicDisplay: true,
      allowSchoolHistory: true,
      allowExpertise: true,
      allowQuote: true,
      allowContact: false,
    },
    verificationStatus: 'APPROVED',
    submittedAt: '2026-08-15T09:15:00.000Z',
    verifiedAt: '2026-08-16T11:00:00.000Z',
    verifiedBy: 'Pentadbir Rasmi MPGBSIM',
    featured: true,
  },
  {
    id: 'alm-03',
    fullName: 'Dr. Ustaz Haji Ahmad Tajuddin bin Zakaria',
    title: 'Dr. Ustaz',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    gender: 'Lelaki',
    email: 'tajuddin.zakaria@alumni.mpgbsim.org',
    phone: '+60 13-900 7711',
    state: 'Kedah',
    lastPosition: 'Mantan Pengetua & Penasihat Kurikulum',
    lastSchool: 'Kolej Islam Sultan Alam Shah (KISAS)',
    careerStartYear: 1985,
    retirementYear: 2021,
    leadershipHistory: [
      {
        id: 'lh-6',
        schoolName: 'Sekolah Menengah Agama Persekutuan Kajang',
        position: 'Pengetua',
        startYear: 1992,
        endYear: 2005,
        state: 'Selangor',
        highlights: 'Juara Debat Bahasa Arab & Bahasa Melayu Kebangsaan'
      },
      {
        id: 'lh-7',
        schoolName: 'Kolej Islam Sultan Alam Shah (KISAS)',
        position: 'Pengetua',
        startYear: 2005,
        endYear: 2021,
        state: 'Selangor',
        highlights: 'Kedudukan Top 3 SPM Sekolah Berasrama Penuh Kebangsaan'
      }
    ],
    expertise: ['Pengajian Islam & Bahasa Arab', 'Transformasi Digital Sekolah', 'Penyelidikan Educational Leadership'],
    biography: 'Tokoh ilmuwan dan pentadbir yang menyatukan tradisi keilmuan Islam klasik dengan teknologi pengurusan moden.',
    currentOrganisation: 'Profesor Pentadbiran Pendidikan (Pensyarah Pelawat)',
    awards: ['Anugerah Tokoh Maal Hijrah 2023', 'Pingat Mahkota Kedah'],
    achievements: [
      'Memelopori sistem digital rekod pencapaian murid KISAS Online',
      'Penerbitan 12 artikel ilmiah kepimpinan pendidikan Islam'
    ],
    contributions: 'Penceramah utama Wacana Kepimpinan PGB Kebangsaan.',
    mpgbsimRole: 'Penasihat Kehormat Alumni MPGBSIM',
    mpgbsimStartYear: 2008,
    mpgbsimEndYear: 2021,
    mpgbsimContribution: 'Penggubal Kerangka Pembangunan Kepimpinan Eksekutif PGB.',
    legacyQuote: 'Integriti dan kerohanian pengetua adalah cermin utama keberkatan sesebuah sekolah Islam. Jangan sekali-kali kompromi terhadap kualiti agama.',
    consent: {
      allowPublicDisplay: true,
      allowSchoolHistory: true,
      allowExpertise: true,
      allowQuote: true,
      allowContact: false,
    },
    verificationStatus: 'APPROVED',
    submittedAt: '2026-08-20T16:20:00.000Z',
    verifiedAt: '2026-08-21T09:45:00.000Z',
    verifiedBy: 'Pentadbir Rasmi MPGBSIM',
    featured: true,
  },
  {
    id: 'alm-04',
    fullName: 'Hajah Wan Azizah binti Wan Ismail',
    title: 'Hjh.',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    gender: 'Perempuan',
    email: 'wanazizah.ismail@alumni.mpgbsim.org',
    phone: '+60 19-911 2233',
    state: 'Kelantan',
    lastPosition: 'Mantan Pengetua Cemerlang',
    lastSchool: 'SMKA Naim Lilbanat Kota Bharu',
    careerStartYear: 1990,
    retirementYear: 2023,
    leadershipHistory: [
      {
        id: 'lh-8',
        schoolName: 'Sekolah Rendah Islam Aman Kota Bharu',
        position: 'Guru Besar',
        startYear: 1998,
        endYear: 2011,
        state: 'Kelantan',
        highlights: 'Membangunkan cawangan baharu sekolah menengah'
      },
      {
        id: 'lh-9',
        schoolName: 'SMKA Naim Lilbanat Kota Bharu',
        position: 'Pengetua Cemerlang',
        startYear: 2011,
        endYear: 2023,
        state: 'Kelantan',
        highlights: 'Pencapaian Johan Tilawah & Hafazan Antarabangsa'
      }
    ],
    expertise: ['Tarbiah & Sahsiah Murid', 'Pengurusan Hal Ehwal Murid', 'Kepimpinan Wanita Islam'],
    biography: 'Pendidik berjiwa murni yang menitikberatkan jati diri muslimah dan keunggulan akhlak murid-murid perempuan.',
    currentOrganisation: 'Ahli Jawatankuasa Syariah & Pendidikan Kelantan',
    awards: ['Anugerah Tokoh Wanite Pendidikan Kelantan 2024'],
    achievements: [
      'Anugerah Sekolah Unggul Kementerian Pendidikan Malaysia',
      'Melahirkan puluhan kepimpinan wanita dalam agensi pendidikan'
    ],
    contributions: 'Penceramah jemputan Bengkel Sahsiah Rabbani PGB.',
    mpgbsimRole: 'Mantan Pengerusi Biro Hal Ehwal Wanita MPGBSIM (2015–2023)',
    mpgbsimStartYear: 2012,
    mpgbsimEndYear: 2023,
    mpgbsimContribution: 'Memperkasa pementoran pentadbir wanita di sekolah-sekolah Islam.',
    legacyQuote: 'Didiklah anak-anak dengan keteguhan iman dan ketrampilan ilmu agar mereka mampu berdiri teguh di badai zaman tanpa menggadaikan maruah agama.',
    consent: {
      allowPublicDisplay: true,
      allowSchoolHistory: true,
      allowExpertise: true,
      allowQuote: true,
      allowContact: false,
    },
    verificationStatus: 'APPROVED',
    submittedAt: '2026-08-25T11:00:00.000Z',
    verifiedAt: '2026-08-26T14:10:00.000Z',
    verifiedBy: 'Pentadbir Rasmi MPGBSIM',
    featured: false,
  }
];



