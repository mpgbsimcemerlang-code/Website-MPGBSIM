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
    description: 'Panduan lengkap piawaian tadbir urus kewangan, pengurusan sumber manusia dan etika kepimpinan bagi PGB.'
  },
  {
    id: 'res-2',
    title: 'Kerangka AI & Literasi Digital Beretika Sekolah Islam Malaysia',
    category: 'Kertas Dasar',
    publishedDate: 'September 2026',
    fileSize: '2.8 MB',
    fileFormat: 'PDF',
    downloads: 890,
    description: 'Garis panduan rasmi pengintegrasian kecerdasan buatan (GenAI) dalam kurikulum dan operasi harian sekolah.'
  },
  {
    id: 'res-3',
    title: 'Modul Kepimpinan Rabbani: Siri Bimbingan Eksekutif E-LEAD',
    category: 'Modul Kepimpinan',
    publishedDate: 'Julai 2026',
    fileSize: '6.5 MB',
    fileFormat: 'PDF',
    downloads: 2150,
    description: 'Modul latihan kepimpinan instruksional, kemahiran syura, pengurusan konflik dan pembinaan iklim sekolah mithali.'
  },
  {
    id: 'res-4',
    title: 'Pekeliling MPGBSIM Bil 1/2026: Pendaftaran Ahli & Prosedur Undian Majlis',
    category: 'Pekeliling',
    publishedDate: 'Jun 2026',
    fileSize: '1.4 MB',
    fileFormat: 'PDF',
    downloads: 1680,
    description: 'Surat pekeliling rasmi berhubung tatacara pengesahan keahlian tahunan dan hak perwakilan ke Konvensyen Kebangsaan.'
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

