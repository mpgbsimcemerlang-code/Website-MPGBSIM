export interface AIMemoryFieldValues {
  schoolName: string;
  field1: string;
  field2: string;
  field3: string;
}

export interface AISubModuleConfig {
  id: string;
  promptId: string;
  pillarId: 'kepimpinan' | 'pentadbiran' | 'kurikulum' | 'hem' | 'data';
  title: string;
  summary: string;
  documentType: string;
  labels: {
    schoolName: string;
    field1: string;
    field2: string;
    field3: string;
  };
  defaults: AIMemoryFieldValues;
  buildPrompt: (v: AIMemoryFieldValues) => string;
  buildDraftDocument: (v: AIMemoryFieldValues) => string;
}

export interface AIPillarConfig {
  id: 'kepimpinan' | 'pentadbiran' | 'kurikulum' | 'hem' | 'data';
  number: number;
  title: string;
  shortLabel: string;
  promptCategory: 'Kepimpinan' | 'Pentadbiran' | 'Kurikulum' | 'HEM' | 'Data & Analisis';
  description: string;
  colorScheme: {
    bgBadge: string;
    textBadge: string;
    borderHover: string;
    activeRing: string;
    btnBg: string;
    btnHover: string;
    lightBg: string;
    dotColor: string;
  };
  subModules: AISubModuleConfig[];
}

export const AI_PILLARS_CONFIG: AIPillarConfig[] = [
  // ============================================================================
  // 1. AI UNTUK KEPIMPINAN
  // ============================================================================
  {
    id: 'kepimpinan',
    number: 1,
    title: '1. AI untuk Kepimpinan',
    shortLabel: '1. AI Kepimpinan',
    promptCategory: 'Kepimpinan',
    description:
      'Menyokong perancangan strategik 5 tahun, perangkaan wawasan sekolah Rabbani, penulisan amanat tahunan dan komunikasi empati bersama pemegang taruh.',
    colorScheme: {
      bgBadge: 'bg-purple-100',
      textBadge: 'text-purple-900',
      borderHover: 'hover:border-purple-400',
      activeRing: 'ring-2 ring-purple-600 border-purple-600',
      btnBg: 'bg-purple-900',
      btnHover: 'hover:bg-purple-800',
      lightBg: 'bg-purple-50/70',
      dotColor: 'text-purple-600',
    },
    subModules: [
      {
        id: 'kep-1',
        promptId: 'pr-kep-1',
        pillarId: 'kepimpinan',
        title: 'Draf Pelan Strategik Berasaskan Aspirasi KPM & Dini',
        summary:
          'Jana kerangka Pelan Strategik Sekolah 5 Tahun lengkap dengan SWOT, Teras KPM & Dini, serta Matriks KPI.',
        documentType: 'Pelan Strategik 5 Tahun',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Tempoh & Kategori Sekolah',
          field2: 'Teras Fokus Utama (Akademik, Dini & Tahfiz)',
          field3: 'Sasaran KPI Utama (5 Tahun)',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: '2026–2030 (Sekolah Menengah Islam Bersepadu / SABK)',
          field2: 'Kecemerlangan Akademik SPM, Kelestarian Hafazan Al-Quran & Biah Solehah Rabbani',
          field3: 'GPS SPM < 2.20, 100% Lulus Subjek Dini, & Sifar Kes Disiplin Berat',
        },
        buildPrompt: (v) => `Anda ialah Pakar Perancangan Strategik Pendidikan Islam dan Penasihat Kepimpinan Pengetua/Guru Besar (PGB).
Bina satu Draf Pelan Strategik Sekolah 5 Tahun yang komprehensif berdasarkan maklumat berikut:
- Nama Sekolah: ${v.schoolName}
- Tempoh & Kategori Sekolah: ${v.field1}
- Teras Fokus Utama: ${v.field2}
- Sasaran KPI Utama: ${v.field3}

Sila hasilkan dokumen lengkap mengikut struktur rasmi berikut:
1. Pernyataan Visi, Misi & Motto Sekolah Rabbani.
2. Analisis SWOT (Kekuatan, Kelemahan, Peluang, Ancaman) semasa.
3. 5 Teras Strategik Utama (Selaras 6 Aspirasi Murid KPM & Pendidikan Dini/Tahfiz).
4. Jadual Matriks Sasaran KPI 5 Tahun (Tahun 1 hingga Tahun 5).
5. Pelan Tindakan Tahunan & Agihan Tanggungjawab (PGB, PK Pentadbiran, PK HEM, PK Kokurikulum).
6. Mekanisme Pemantauan & Semakan Berkala (Mid-Term Review).`,
        buildDraftDocument: (v) => `DOKUMEN RASMI: DRAF PELAN STRATEGIK SEKOLAH (${v.field1})
INSTITUSI: ${v.schoolName.toUpperCase()}
RUJUKAN PORTAL: MPGBSIM/KEP/PS-01 (www.mpgbsim.org)
====================================================================

1.0 HALATUJU & WAWASAN SEKOLAH RABBANI
• Visi: Pendidikan Berkualiti, Insan Terdidik, Negara Sejahtera Berteraskan Al-Quran & As-Sunnah.
• Misi: Melestarikan sistem pendidikan Islam bersepadu yang membangunkan potensi murid secara holistik bagi memenuhi Aspirasi KPM dan kemenjadian Insan Rabbani.
• Fokus Strategik: ${v.field2}

2.0 ANALISIS PERSEKITARAN (SWOT)
• Kekuatan (S): Barisan kepimpinan PGB dan guru komited, sokongan kukuh PIBG/Lembaga Pengelola, serta kurikulum bersepadu Akademik & Dini.
• Kelemahan (W): Jurang penguasaan KBAT bagi sebahagian murid sederhana dan kekangan infrastruktur digital bilik darjah.
• Peluang (O): Jaringan kerjasama strategik bersama MPGBSIM Kebangsaan, agensi wakaf korporat, dan universiti tempatan.
• Ancaman (T): Pengaruh gajet/media sosial tidak terkawal dan cabaran kos operasi semasa.

3.0 LIMA (5) TERAS STRATEGIK UTAMA (ASPIRASI KPM & DINI)
• Teras 1 (Kurikulum & Akademik): Memperkasa PdP Bermakna, Pedagogi Terbeza & Penguasaan STEM/KBAT.
• Teras 2 (Pendidikan Dini & Tahfiz): Memantapkan penguasaan Bahasa Arab, Turath, serta kualiti Murajaah Al-Quran.
• Teras 3 (HEM & Sahsiah Rabbani): Membudayakan Biah Solehah, kepimpinan murid (Nuqaba'/Pengawas) dan kebajikan asrama.
• Teras 4 (Profesionalisme Keguruan & AI): Meningkatkan kompetensi digital dan integrasi AI beretika dalam kalangan guru.
• Teras 5 (Tadbir Urus & Jaringan Komuniti): Memperkukuh kelestarian kewangan wakaf/CSR dan penglibatan ibu bapa (PIBG).

4.0 SASARAN PETUNJUK PRESTASI UTAMA (KPI 5 TAHUN)
• Sasaran Utama: ${v.field3}
• Tahun 1 (Baseline): Pemantapan asas literasi Dini, audit fasiliti & pembudayaan PLC guru.
• Tahun 2–3 (Pecutan): Peningkatan GPMP subjek kritikal sebanyak 15% & pendigitalan penuh pengurusan sekolah.
• Tahun 4–5 (Kelestarian): Penandaarasan sekolah contoh peringkat kebangsaan di bawah rangkaian MPGBSIM.

5.0 MEKANISME PEMANTAUan & TADBIR URUS
• Semakan pencapaian KPI dijalankan setiap suku tahun dalam Mesyuarat Pengurusan Tertinggi dipengerusikan oleh Pengetua/Guru Besar.
• Pelaporan bersepadu dibentangkan kepada Lembaga Pengelola Sekolah (LPS) dan Mesyuarat Agung PIBG.`,
      },
      {
        id: 'kep-2',
        promptId: 'pr-kep-2',
        pillarId: 'kepimpinan',
        title: 'Penulisan Teks Ucapan Tazkirah Perhimpunan',
        summary:
          'Hasilkan teks amanat perhimpunan mingguan PGB yang menyentuh hati, lengkap dengan dalil Al-Quran/Hadis dan 3 mesej tindakan murid.',
        documentType: 'Teks Ucapan & Tazkirah PGB',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Topik Tazkirah / Fokus Minggu Ini',
          field2: 'Dalil / Nilai Teras Pilihan',
          field3: 'Kumpulan Sasaran & Tempoh Ucapan',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Adab Menuntut Ilmu, Disiplin Solat Berjemaah & Persediaan Peperiksaan',
          field2: 'Surah Al-Mujadalah Ayat 11 (Allah mengangkat darjat orang beriman dan berilmu)',
          field3: 'Semua Guru & Murid (Ucapan Rasmi 7 Minit)',
        },
        buildPrompt: (v) => `Anda adalah penasihat kepimpinan pendidikan Islam berpengalaman.
Tuliskan draf teks ucapan perhimpunan rasmi untuk Pengetua / Guru Besar:
- Nama Sekolah: ${v.schoolName}
- Topik Fokus Minggu Ini: ${v.field1}
- Dalil / Nilai Teras: ${v.field2}
- Sasaran & Tempoh: ${v.field3}

Struktur Teks Ucapan:
1. Mukadimah ringkas dengan salam, selawat dan penghargaan kepada guru bertugas.
2. Petikan ayat Al-Quran atau Hadis sahih berkaitan (${v.field2}) berserta terjemahan dan pengajaran hikmah.
3. Tiga amanat praktikal yang boleh diamalkan murid dalam rutin harian kelas dan asrama.
4. Kata-kata perangsang kepimpinan yang membakar semangat kecemerlangan.
5. Penutup berserta doa ringkas keberkatan ilmu.`,
        buildDraftDocument: (v) => `TEKS UCAPAN & TAZKIRAH PERHIMPUNAN RASMI MINGGUAN
INSTITUSI: ${v.schoolName.toUpperCase()}
TAJUK: ${v.field1.toUpperCase()}
SASARAN: ${v.field3}
====================================================================

1. MUKADIMAH & ALU-ALUAN
Bismillahirrahmanirrahim. Assalamualaikum warahmatullahi wabarakatuh, salam sejahtera dan salam generasi Rabbani.
Alhamdulillah, marilah kita merafakkan setinggi-tinggi kesyukuran ke hadrat Allah SWT serta selawat dan salam ke atas junjungan besar Nabi Muhammad SAW. Terima kasih kepada barisan Pentadbir, rakan-rakan guru yang dikasihi, guru bertugas mingguan, serta anak-anak murid ${v.schoolName} yang diberkati sekalian.

2. RENUNGAN DALIL & HIKMAH
Pada pagi yang penuh keberkatan ini, saya ingin mengajak seluruh warga sekolah menghayati intipati daripada ${v.field2}.
Ketahuilah anak-anak sekalian, kecemerlangan sejati di sekolah Islam bukan sekadar diukur pada deretan gred di atas kertas, tetapi bermula daripada keberkatan adab, kejujuran hati, dan disiplin kita menjaga hubungan dengan Allah SWT serta hubungan sesama manusia.

3. TIGA (3) AMANAT UTAMA MINGGU INI (${v.field1})
Pertama — Menjaga Adab Terhadap Guru dan Ilmu:
Ilmu itu umpama cahaya, dan cahaya Allah tidak akan meresap ke dalam hati yang lalai atau kurang beradab. Hormatilah guru, tumpukan perhatian sepenuhnya semasa PdP, dan pastikan buku catatan sentiasa kemas.

Kedua — Ketepatan Waktu dan Disiplin Solat Berjemaah:
Orang yang berjaya mengurus waktunya untuk solat di awal waktu adalah orang yang pasti berjaya mengurus jadual ulang kajinya. Jadikan loceng pertama dan seruan azan sebagai keutamaan kita.

Ketiga — Persediaan Rapi dan Usaha Berterusan (Istiqamah):
Jangan menunggu saat akhir. Mulakan ulang kaji berfokus bersama rakan sebaya, bertanya kepada guru apabila kurang faham, dan jaga kesihatan fizikal serta emosi.

4. PENUTUP & DOA
Saya mendoakan agar setiap langkah warga ${v.schoolName} pada minggu ini dikurniakan taufiq, kefahaman yang tajam (futuhul 'arifin), dan akhlak yang terpuji.
"Ya Allah, bukakanlah ke atas kami hikmah-Mu dan limpahkanlah ke atas kami khazanah rahmat-Mu, wahai Tuhan Yang Maha Pemurah lagi Maha Penyayang."
Sekian, wabillahi taufiq wal hidayah, wassalamualaikum warahmatullahi wabarakatuh.`,
      },
      {
        id: 'kep-3',
        promptId: 'pr-kep-3',
        pillarId: 'kepimpinan',
        title: 'Penilaian Prestasi & Maklum Balas Membina Guru',
        summary:
          'Susun ulasan penilaian prestasi tahunan (PBPPP) dan skrip bimbingan instruksional (Coaching GROW) yang empati serta profesional.',
        documentType: 'Ulasan Prestasi & Skrip Coaching Guru',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Kategori / Jawatan Guru Dinilai',
          field2: 'Kekuatan Utama Guru',
          field3: 'Aspek Pembangunan / Penambahbaikan (Fokus Bimbingan)',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Guru Akademik & Panitia Pendidikan Islam (DG41/DG44)',
          field2: 'Komited dalam kelas bimbingan murid, hubungan baik dengan ibu bapa & sahsiah terpuji',
          field3: 'Kepelbagaian bahan bantu mengajar digital/AI dan pengurusan masa aktiviti berkumpulan PdP',
        },
        buildPrompt: (v) => `Bertindak sebagai Pengetua / Guru Besar Cemerlang yang mahir dalam bimbingan instruksional (Instructional Coaching).
Sediakan ulasan penilaian prestasi dan skrip maklum balas membina untuk:
- Sekolah: ${v.schoolName}
- Kategori Guru: ${v.field1}
- Kekuatan Utama: ${v.field2}
- Aspek Perlu Penambahbaikan: ${v.field3}

Sila sediakan:
1. Ulasan Rasmi Penilai Pertama/Kedua (Format PBPPP) yang profesional dan membina.
2. Skrip Dialog Bimbingan (Pendekatan GROW Model: Goal, Reality, Options, Will) berunsur hikmah dan empati.
3. 3 Cadangan Pembangunan Profesionalisme Berterusan (CPD) untuk suku tahun akan datang.`,
        buildDraftDocument: (v) => `REKOD PENILAIAN PRESTASI & MAKLUM BALAS MEMBINA GURU (PBPPP)
INSTITUSI: ${v.schoolName.toUpperCase()}
KATEGORI PEGAWAI: ${v.field1}
====================================================================

1.0 ULASAN RASMI PENILAI (PENGETUA / GURU BESAR)
Pegawai menunjukkan komitmen kerja yang sangat baik dan dedikasi tinggi sepanjang sesi persekolahan. Antara kekuatan utama beliau ialah: ${v.field2}. Sumbangan beliau amat dihargai dalam menjayakan misi kemenjadian murid sekolah. Bagi melonjakkan lagi potensi kecemerlangan instruksional pada fasa akan datang, pegawai disarankan memberi tumpuan kepada aspek: ${v.field3}.

2.0 PANDUAN SKRIP DIALOG BIMBINGAN EMPATI (MODEL GROW)
• Matlamat (Goal):
  "Alhamdulillah Cikgu/Ustaz/Ustazah, pihak pentadbiran amat menghargai usaha gigih cikgu khususnya dalam ${v.field2}. Untuk penggal hadapan, apakah sasaran utama yang cikgu ingin capai bagi menjadikan sesi PdP lebih interaktif?"
• Realiti Semasa (Reality):
  "Berdasarkan pencerapan mesra lalu, penguasaan kandungan cikgu sangat mantap. Namun kita melihat ruang penambahbaikan pada aspek ${v.field3}. Apakah cabaran utama yang cikgu hadapi ketika ini?"
• Pilihan Strategi (Options):
  "Mari kita teroka beberapa pendekatan mudah — contohnya mengintegrasikan alatan kuiz AI pantas (seperti Conker/Canva AI) selama 10 minit pertama dan menetapkan pemasa (timer) bagi gerak kerja kumpulan murid."
• Komitmen Tindakan (Will):
  "Insya-Allah, pihak sekolah sedia menyokong melalui perkongsian PLC panitia. Kita akan melihat perkembangan positif ini dalam sesi bimbingan bulan hadapan."

3.0 CADANGAN PEMBANGUNAN PROFESIONALISME BERTERUSAN (CPD)
1. Bengkel Amali PdP Digital & Integrasi Alatan AI Pendidikan (2 Jam).
2. Sesi Perkongsian Amalan Terbaik (Peer Learning / Lesson Study) bersama Guru Cemerlang.
3. Pemantauan Kendiri Pengurusan Masa PdP menggunakan Senarai Semak Pengajaran Berfokus.`,
      },
    ],
  },

  // ============================================================================
  // 2. AI UNTUK PENTADBIRAN
  // ============================================================================
  {
    id: 'pentadbiran',
    number: 2,
    title: '2. AI untuk Pentadbiran',
    shortLabel: '2. AI Pentadbiran',
    promptCategory: 'Pentadbiran',
    description:
      'Mempercepatkan automasi surat-menyurat rasmi, penyediaan kertas kerja permohonan dana wakaf, dan peringkasan minit mesyuarat pengurusan.',
    colorScheme: {
      bgBadge: 'bg-blue-100',
      textBadge: 'text-blue-900',
      borderHover: 'hover:border-blue-400',
      activeRing: 'ring-2 ring-blue-600 border-blue-600',
      btnBg: 'bg-blue-900',
      btnHover: 'hover:bg-blue-800',
      lightBg: 'bg-blue-50/70',
      dotColor: 'text-blue-600',
    },
    subModules: [
      {
        id: 'pen-1',
        promptId: 'pr-pen-1',
        pillarId: 'pentadbiran',
        title: 'Kertas Kerja Memohon Dana Sumbangan & CSR',
        summary:
          'Bina kertas kerja permohonan dana wakaf pendidikan dan tajaan korporat (CSR) lengkap dengan anggaran belanjawan dan impak sosial.',
        documentType: 'Kertas Kerja Dana Wakaf & CSR',
        labels: {
          schoolName: 'Nama Sekolah / Institusi Pemohon',
          field1: 'Nama Projek / Inisiatif Pembangunan',
          field2: 'Jumlah Dana Dipohon & Pecahan Utama',
          field3: 'Objektif & Impak Kepada Murid',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Projek Naik Taraf Makmal Komputer AI & Pusat Sumber Digital Huffaz',
          field2: 'RM45,000.00 (25 Unit Komputer, Rangkaian Jalur Lebar & Papan Pintar Interaktif)',
          field3: 'Manfaat langsung kepada 480 orang murid bagi penguasaan literasi digital, STEM dan penyelidikan Turath',
        },
        buildPrompt: (v) => `Anda adalah Pengurus Pembangunan Dana & Wakaf institusi pendidikan Islam.
Bina satu draf Kertas Kerja Rasmi bagi memohon tajaan CSR korporat atau dana wakaf pendidikan:
- Nama Sekolah: ${v.schoolName}
- Nama Projek: ${v.field1}
- Jumlah Dana & Komponen: ${v.field2}
- Objektif & Impak: ${v.field3}

Sila susun kertas kerja mengikut format rasmi institusi:
1. Ringkasan Eksekutif.
2. Latar Belakang Sekolah & Justifikasi Keperluan Mendesak.
3. Objektif & Impak Jangka Panjang Projek.
4. Jadual Anggaran Pecahan Belanjawan Terperinci.
5. Manfaat & Nilai Tambah Kepada Pihak Penaja (CSR / Wakaf Korporat).
6. Penutup & Perakuan Pengetua/Guru Besar.`,
        buildDraftDocument: (v) => `KERTAS KERJA PERMOHONAN DANA SUMBANGAN WAKAF & TAJAAN KORPORAT (CSR)
PROJEK: ${v.field1.toUpperCase()}
INSTITUSI PEMOHON: ${v.schoolName.toUpperCase()}
====================================================================

1.0 RINGKASAN EKSEKUTIF
Kertas kerja ini dikemukakan bagi memohon pertimbangan tajaan Tanggungjawab Sosial Korporat (CSR) dan sumbangan dana wakaf pendidikan berjumlah ${v.field2} bagi menjayakan ${v.field1} di ${v.schoolName}. Inisiatif ini bertujuan menyediakan kemudahan pembelajaran abad ke-21 yang kondusif untuk melahirkan generasi ilmuwan Rabbani.

2.0 PENYATAAN MASALAH & JUSTIFIKASI KEPERLUAN
Pertambahan enrolmen murid serta keperluan kurikulum semasa menuntut prasarana pembelajaran yang lebih moden dan selamat. Kemudahan sedia ada telah berusia dan memerlukan penggantian segera agar murid tidak ketinggalan dalam arus transformasi pendidikan digital.

3.0 OBJEKTIF & IMPAK PROJEK
• ${v.field3}.
• Meningkatkan kecekapan pengajaran dan pembelajaran (PdP) guru berasaskan teknologi terkini.
• Mewujudkan fasiliti wakaf kekal yang memberi manfaat berpanjangan (amal jariah) kepada warga sekolah dan komuniti setempat.

4.0 ANGGARAN BELANJAWAN & KEPERLUAN DANA
• Jumlah Keseluruhan Dipohon: ${v.field2}
• Fasa Pelaksanaan: Suku Tahun Semasa (Tempoh siap dijangka dalam 6 minggu selepas kelulusan dana).
• Semua perolehan akan diuruskan secara telus melalui Jawatankuasa Kewangan & Perolehan Sekolah.

5.0 NILAI TAMBAH KEPADA PIHAK PENAJA (SOCIAL ROI)
1. Resit Rasmi Sumbangan bagi tujuan rekod dan pelepasan cukai berkaitan.
2. Plak Penghargaan Rasmi Penaja pada fasiliti projek.
3. Hebahan penghargaan dalam Portal Rasmi Sekolah, Mesyuarat Agung PIBG serta rangkaian kebangsaan MPGBSIM (https://www.mpgbsim.org/).

6.0 PENUTUP
Pihak pengurusan ${v.schoolName} merakamkan setinggi-tinggi penghargaan atas keprihatinan dan sokongan pihak YBhg. Dato'/Tuan/Puan dalam memperkasa institusi pendidikan Islam negara.

Disediakan oleh: Jawatankuasa Pembangunan & Wakaf Sekolah
Disahkan oleh: Pengetua / Guru Besar ${v.schoolName}`,
      },
      {
        id: 'pen-2',
        promptId: 'pr-pen-2',
        pillarId: 'pentadbiran',
        title: 'Format Minit Mesyuarat Tindakan Segera',
        summary:
          'Tukarkan nota mesyuarat pengurusan kepada minit rasmi lengkap dengan Matriks Tindakan Segera (PIC & Tarikh Akhir).',
        documentType: 'Minit Mesyuarat & Matriks Tindakan',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Nama Mesyuarat, Bilangan & Tarikh',
          field2: 'Pengerusi & Kehadiran Utama',
          field3: 'Isi Perbincangan / Keputusan Utama Mesyuarat',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Mesyuarat Pengurusan Tertinggi Sekolah Bil. 4/2026 (20 Oktober 2026)',
          field2: 'Pengetua, PK Pentadbiran, PK HEM, PK Kokurikulum & Semua GKMP',
          field3: '1. Pelaksanaan Bengkel Pecutan SPM mulai minggu hadapan.\n2. Audit keselamatan pendawaian asrama oleh PK HEM.\n3. Pembentangan bajet Hari Anugerah Kecemerlangan.',
        },
        buildPrompt: (v) => `Bertindak sebagai Setiausaha Pengurusan Sekolah yang cekap.
Tukarkan maklumat perbincangan mesyuarat berikut kepada Format Minit Mesyuarat Pengurusan Rasmi:
- Sekolah: ${v.schoolName}
- Mesyuarat: ${v.field1}
- Kehadiran: ${v.field2}
- Isi Perbincangan: ${v.field3}

Sila hasilkan:
1. Minit Mesyuarat Rasmi mengikut format standard (Perutusan Pengerusi, Pengesahan Minit, Perkara Berbangkit, Keputusan Mesyuarat, Penutup).
2. Jadual Ringkasan Tindakan Segera (Action Matrix): Bil | Perkara | Pegawai Bertanggungjawab (PIC) | Tarikh Akhir.
3. Draf mesej WhatsApp peringatan tindakan kepada ahli mesyuarat.`,
        buildDraftDocument: (v) => `MINIT MESYUARAT PENGURUSAN RASMI & MATRIKS TINDAKAN SEGERA
INSTITUSI: ${v.schoolName.toUpperCase()}
MESYUARAT: ${v.field1}
KEHADIRAN: ${v.field2}
====================================================================

1.0 PERUTUSAN PENGERUSI
1.1 Tuan Pengerusi memulakan mesyuarat dengan bacaan Ummul Kitab dan merakamkan penghargaan atas komitmen semua barisan pentadbir dalam memastikan kelancaran operasi sekolah.
1.2 Beliau menegaskan supaya setiap keputusan mesyuarat dilaksanakan mengikut garis masa yang ditetapkan demi kebajikan murid dan kecemerlangan akademik.
Tindakan: Makluman Semua

2.0 PENGESAHAN MINIT MESYUARAT LALU
2.1 Minit mesyuarat yang lalu telah disahkan tanpa pindaan.

3.0 PERBINCANGAN & KEPUTUSAN UTAMA MESYUARAT
Berdasarkan pembentangan dan perbincangan ahli mesyuarat, ketetapan berikut telah dipersetujui:
${v.field3}

4.0 JADUAL MATRIKS TINDAKAN SEGERA (ACTION PLAN)
--------------------------------------------------------------------
BIL | KEPUTUSAN / TINDAKAN                  | PIC UTAMA        | TARIKH AKHIR
--------------------------------------------------------------------
1.  | Penyelarasan Jadual & Modul Akademik  | PK Pentadbiran   | Dalam 7 Hari
2.  | Pemeriksaan Keselamatan & Kebajikan   | PK HEM & Warden  | Dalam 5 Hari
3.  | Kertas Kerja & Anggaran Kewangan      | Setiausaha / PK  | Dalam 10 Hari
--------------------------------------------------------------------

5.0 PENUTUP
Mesyuarat ditangguhkan dengan bacaan Tasbih Kaffarah dan Surah Al-'Asr. Maklum balas status tindakan hendaklah dikemas kini sebelum mesyuarat berikutnya.

Disediakan oleh: Setiausaha Pengurusan ${v.schoolName}
Disahkan oleh: Pengerusi Mesyuarat`,
      },
      {
        id: 'pen-3',
        promptId: 'pr-pen-3',
        pillarId: 'pentadbiran',
        title: 'SOP Pengurusan Premis & Keselamatan Asrama',
        summary:
          'Hasilkan Prosedur Operasi Standard (SOP) keselamatan premis 3K, kawalan pelawat, pencegahan kebakaran dan kecemasan asrama.',
        documentType: 'SOP Premis & Keselamatan Asrama (3K)',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Skop Kawasan Premis / Blok Asrama',
          field2: 'Kapasiti Murid & Petugas Bertanggungjawab',
          field3: 'Keutamaan Keselamatan (Kebakaran, Kesihatan, Kawalan Keluar Masuk)',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Blok Asrama Putera & Puteri, Dewan Makan, Surau & Pondok Pengawal Utama',
          field2: '360 Penghuni Asrama | Ketua Warden, 6 Warden Bertugas & 4 Pengawal Keselamatan',
          field3: 'Audit pendawaian elektrik, latihan pengungsian kebakaran (Fire Drill), SOP pelawat & kecemasan kesihatan malam',
        },
        buildPrompt: (v) => `Anda ialah Pakar Pengurusan Keselamatan Fasiliti dan Asrama Sekolah (3K: Kebersihan, Kesihatan, Keselamatan).
Bina satu dokumen Prosedur Operasi Standard (SOP) Pengurusan Premis & Keselamatan Asrama bagi:
- Nama Sekolah: ${v.schoolName}
- Skop Kawasan: ${v.field1}
- Kapasiti & Petugas: ${v.field2}
- Fokus Keselamatan: ${v.field3}

Sila sediakan SOP lengkap merangkumi:
1. Objektif & Skop Keselamatan Premis.
2. SOP Rondaan Berkala Warden & Pengawal Keselamatan.
3. SOP Pencegahan Kebakaran & Laluan Kecemasan.
4. SOP Kawalan Pelawat & Pengurusan Murid Sakit Cemas.
5. Senarai Semak Audit Keselamatan Mingguan.`,
        buildDraftDocument: (v) => `PROSEDUR OPERASI STANDARD (SOP) PENGURUSAN PREMIS & KESELAMATAN ASRAMA (3K)
INSTITUSI: ${v.schoolName.toUpperCase()}
SKOP KAWASAN: ${v.field1}
KAPASITI & PETUGAS: ${v.field2}
====================================================================

1.0 OBJEKTIF & DASAR KESELAMATAN
Memastikan persekitaran premis sekolah dan asrama berada pada tahap keselamatan, kesihatan dan kebersihan (3K) tertinggi setiap masa dengan tumpuan khusus terhadap: ${v.field3}.

2.0 SOP KAWALAN KELUAR MASUK & PELAWAT
• Semua pelawat dan ibu bapa wajib mendaftar di Pondok Pengawal Utama serta memakai Pas Pelawat.
• Ibu bapa hanya dibenarkan berjumpa murid di ruang menunggu yang ditetapkan pada waktu lawatan rasmi. Larangan mutlak bagi pelawat memasuki dorm asrama tanpa kebenaran khas PK HEM/Ketua Warden.

3.0 SOP PENCEGAHAN KEBAKARAN & KESELAMATAN ELEKTRIK
• Penggunaan peralatan elektrik berkuasa tinggi tidak dibenarkan di dalam dorm tanpa kelulusan.
• Alat pemadam api, lampu kecemasan dan pelan laluan pengungsian (Fire Escape Plan) hendaklah disemak setiap bulan.
• Latihan Pengungsian Kebakaran (Fire Drill) wajib dilaksanakan sekurang-kurangnya 2 kali setahun pada waktu siang dan malam.

4.0 SOP RONDAAN MALAM & PENGURUSAN KECEMASAN MURID SAKIT
• Warden bertugas dan pengawal keselamatan menjalankan rondaan berkala pada jam 11.00 malam, 1.00 pagi dan 3.30 pagi.
• Sekiranya berlaku kecemasan kesihatan, Warden Bertugas hendaklah menghubungi ibu bapa serta-merta dan membawa murid ke hospital/klinik kesihatan terdekat menggunakan kenderaan rasmi berserta Buku Rekod Kesihatan Murid.

5.0 SENARAI SEMAK AUDIT MINGGUAN (TANDATANGAN WARDEN & PK HEM)
[ ] Pintu pagar utama & pagar perimeter berkunci sempurna selepas jam 10.30 malam.
[ ] Laluan tangga kecemasan bebas daripada sebarang halangan.
[ ] Bekalan air bersih, kebersihan dewan makan & tandas asrama memuaskan.
[ ] Buku Log Rondaan Pengawal & Laporan Harian Warden lengkap ditandatangani.`,
      },
    ],
  },

  // ============================================================================
  // 3. AI UNTUK KURIKULUM
  // ============================================================================
  {
    id: 'kurikulum',
    number: 3,
    title: '3. AI untuk Kurikulum',
    shortLabel: '3. AI Kurikulum',
    promptCategory: 'Kurikulum',
    description:
      'Menghubungkan pedagogi terbeza, penjanaan soalan KBAT dwibahasa, integrasi hafazan tahfiz dengan STEM, dan pemulihan mata pelajaran kritikal.',
    colorScheme: {
      bgBadge: 'bg-emerald-100',
      textBadge: 'text-emerald-900',
      borderHover: 'hover:border-emerald-400',
      activeRing: 'ring-2 ring-emerald-600 border-emerald-600',
      btnBg: 'bg-emerald-900',
      btnHover: 'hover:bg-emerald-800',
      lightBg: 'bg-emerald-50/70',
      dotColor: 'text-emerald-600',
    },
    subModules: [
      {
        id: 'kur-1',
        promptId: 'pr-kur-1',
        pillarId: 'kurikulum',
        title: 'Pelan Intervensi Murid Percubaan SPM',
        summary:
          'Rangka pelan pecutan akademik berfokus mengikut 3 kelompok murid (Cemerlang, Sederhana, GALUS) selepas analisis peperiksaan percubaan.',
        documentType: 'Pelan Intervensi Akademik SPM',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Mata Pelajaran Kritikal & Bilangan Calon',
          field2: 'Pencapaian Percubaan Semasa vs Sasaran SPM',
          field3: 'Kelemahan Utama Dikenal Pasti (Post-Mortem)',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Matematik, Bahasa Arab Tinggi & Syariah Islamiah (95 Calon)',
          field2: 'Percubaan: Lulus 72% (GPMP 5.10) -> Sasaran SPM: Lulus 100% (GPMP 3.20)',
          field3: 'Kurang menguasai teknik menjawab soalan KBAT Kertas 2 dan pengurusan masa peperiksaan',
        },
        buildPrompt: (v) => `Bertindak sebagai Pakar Analisis Kurikulum & Kecemerlangan Akademik SPM.
Berdasarkan data keputusan peperiksaan percubaan berikut:
- Sekolah: ${v.schoolName}
- Subjek & Calon: ${v.field1}
- Pencapaian Semasa vs Sasaran: ${v.field2}
- Kelemahan Utama: ${v.field3}

Sila rangka Pelan Intervensi Pecutan Akhir SPM (8 Minggu) yang mengandungi:
1. Analisis Jurang & Sasaran GPMP.
2. Strategi Berfokus Mengikut 3 Kelompok Murid (Elit Straight A, Near-Miss Cemerlang, dan Kumpulan Harapan Lulus/GALUS).
3. Jadual Aktiviti Mingguan & Program Guru Muda (Peer Coaching).
4. Mekanisme Pemantauan Panitia & Pelibatan Ibu Bapa.`,
        buildDraftDocument: (v) => `PELAN INTERVENSI BERFOKUS PECUTAN AKHIR SPM
INSTITUSI: ${v.schoolName.toUpperCase()}
SUBJEK & CALON: ${v.field1}
SASARAN PENINGKATAN: ${v.field2}
====================================================================

1.0 RUMUSAN POST-MORTEM & PUNCA UTAMA
Berdasarkan analisis item peperiksaan percubaan, isu utama yang perlu ditangani secara berfokus ialah: ${v.field3}. Pelan intervensi 8 minggu ini dirangka menggunakan pendekatan Pedagogi Terbeza (Differentiated Instruction).

2.0 STRATEGI PENGUPAYAAN MENGIKUT 3 KELOMPOK MURID
A. Kelompok 1: Kumpulan Elit / Sasaran A+ & A
   • Fokus: Penguasaan soalan KBAT Aras Tinggi dan latihan soalan klon negeri-negeri cemerlang.
   • Peranan: Dilantik sebagai "Guru Muda (Peer Coach)" untuk membimbing rakan sebaya dalam halaqah akademik.

B. Kelompok 2: Kumpulan Sederhana (Near-Miss A / B)
   • Fokus: Klinik Teknik Menjawab Kertas 2 mengikut skema pemarkahan sebenar dan latih tubi topik berwajaran tinggi.

C. Kelompok 3: Kumpulan Harapan Lulus (GALUS)
   • Fokus: "Modul Lulus Pasti" — penguasaan topik asas wajib lulus, bimbingan kumpulan kecil (1 Guru : 5 Murid), dan semakan jawapan secara individu.

3.0 JADUAL PELAKSANAAN MINGGUAN (8 MINGGU)
• Minggu 1–2: Bengkel Diagnostik Topikal & Pembetulan Kesilapan Lazim Kertas Percubaan.
• Minggu 3–5: Latih Tubi Berfokus Waktu Prep Petang/Malam & Sesi Bimbingan Guru Muda.
• Minggu 6–7: Simulasi Peperiksaan Berjadual (Time-Trial) & Semakan Skema Pantas.
• Minggu 8: Restu Ilmu, Motivasi Rohani & Pecutan Akhir Topik Sasaran.

4.0 PEMANTAUAN & PELAPORAN
Ketua Panitia dan GKMP akan menyemak rekod markah latihan mingguan setiap hari Jumaat untuk dibentangkan kepada PK Pentadbiran dan Pengetua.`,
      },
      {
        id: 'kur-2',
        promptId: 'pr-kur-2',
        pillarId: 'kurikulum',
        title: 'Jadual Waktu Murajaah & Tahfiz Terbeza',
        summary:
          'Susun sistem pengulangan hafazan Al-Quran (Sabak, Para Sabak, Amokhtar) mengikut tahap murid secara harmoni dengan subjek akademik/STEM.',
        documentType: 'Sistem & Jadual Murajaah Tahfiz Terbeza',
        labels: {
          schoolName: 'Nama Sekolah / Maahad',
          field1: 'Tingkatan / Tahap Murid & Sasaran Hafazan',
          field2: 'Slot Masa Halaqah Harian Sedia Ada',
          field3: 'Pendekatan Integrasi Akademik / STEM',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Tingkatan 1 hingga 5 (Sasaran 6 Juzuk Setahun / 30 Juzuk 5 Tahun)',
          field2: 'Halaqah Subuh (6.15–7.15 pagi), Slot Dhuha (7.30–8.30 pagi) & Murajaah Maghrib (7.30–8.30 malam)',
          field3: 'Tadabbur ayat kauniyah Al-Quran dihubungkan dengan konsep Sains, Matematik dan rekod tasmi digital',
        },
        buildPrompt: (v) => `Anda ialah Pakar Kurikulum Tahfiz Bersepadu (Ulul Albab / Tahfiz Sains & Dini).
Rangka satu Sistem & Jadual Waktu Murajaah & Tahfiz Terbeza untuk:
- Institusi: ${v.schoolName}
- Tahap & Sasaran: ${v.field1}
- Slot Masa Halaqah: ${v.field2}
- Integrasi STEM/Akademik: ${v.field3}

Sila sediakan:
1. Pembahagian Pedagogi Terbeza kepada 3 Tahap Keupayaan Murid.
2. Jadual Waktu Harian Bersepadu (Sabak, Para Sabak, Amokhtar).
3. Kaedah Integrasi Tadabbur Al-Quran dengan STEM.
4. Mekanisme Penilaian Kualiti Ingatan Hafazan (Mutqin).`,
        buildDraftDocument: (v) => `DOKUMEN KURIKULUM: JADUAL WAKTU MURAJAAH & TAHFIZ TERBEZA
INSTITUSI: ${v.schoolName.toUpperCase()}
SASARAN PROGRAM: ${v.field1}
====================================================================

1.0 PENDEKATAN PEDAGOGI TAHFIZ TERBEZA (3 TAHAP KEUPAYAAN)
Bagi memastikan tiada murid keciciran dan kualiti hafazan kekal mutqin tanpa menjejaskan pencapaian akademik, murid dibahagikan kepada 3 kumpulan bimbingan:
• Tahap 1 (Al-Mahir / Cepat): Sasaran Sabak 1.5 – 2 muka surat sehari + penekanan Qiraat & Tadabbur mendalam.
• Tahap 2 (Al-Mutawassit / Sederhana): Sasaran Sabak 1 muka surat sehari mengikut unjuran standard.
• Tahap 3 (Al-Mubtadi / Bimbingan Intensif): Sasaran Sabak setengah muka surat sehari dengan fokus pemulihan Makhraj, Tajwid (Talaqqi Musyafahah) dan kelancaran bacaan.

2.0 STRUKTUR JADUAL HARIAN BERSEPADU
Slot Masa: ${v.field2}
--------------------------------------------------------------------
SLOT WAKTU         | AKTIVITI UTAMA                                 | KAEDAH SEMAKAN
--------------------------------------------------------------------
Selepas Subuh      | Tasmi' Sabak (Hafazan Baharu)                  | Semakan Individu Muhaffiz
Slot Pagi / Dhuha  | Para Sabak (Ulangan Juzuk Semasa)              | Berpasangan (Peer Tasmi')
Selepas Asar       | Persediaan Lauh Baharu (Tahriri / Tulisan)     | Buku Rekod Hafazan
Selepas Maghrib    | Amokhtar (Murajaah Juzuk Lama Secara Berjadual)| Halaqah Berfokus
--------------------------------------------------------------------

3.0 INTEGRASI TADABBUR AL-QURAN & STEM
• ${v.field3}.
• Setiap minggu, guru Sains dan Matematik memulakan topik baharu dengan merujuk ayat-ayat kauniyah yang telah dihafaz oleh murid bagi membina pemikiran Ulul Albab.

4.0 PENILAIAN MUTQIN BERKALA
Ujian Syahadah/Ithbat Hafazan dijalankan setiap hujung penggal dengan syarat lulus minimum 85% kelancaran dan tajwid sebelum beralih ke sasaran juzuk seterusnya.`,
      },
      {
        id: 'kur-3',
        promptId: 'pr-kur-3',
        pillarId: 'kurikulum',
        title: 'Rubrik Penilaian Kurikulum Dini & Azhari',
        summary:
          'Bina rubrik pentaksiran bilik darjah (TP1–TP6) bagi penilaian lisan, bertulis dan amali subjek Syariah, Usuluddin dan Bahasa Arab.',
        documentType: 'Rubrik Pentaksiran Dini & Azhari',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Mata Pelajaran Dini / Azhari & Tingkatan',
          field2: 'Komponen Pentaksiran (Syafawi / Tahriri / Amali)',
          field3: 'Kemahiran Fokus & Kriteria KBAT',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Al-Syariah, Usuluddin & Al-Lughah Al-Arabiah Al-Muasirah (Tingkatan 1–5)',
          field2: '40% Ujian Bertulis (Tahriri), 30% Lisan/Hafazan Nas (Syafawi), 30% Penghayatan Amali',
          field3: 'Kefahaman dalil naqli, kemahiran istinbat hukum semasa & komunikasi Bahasa Arab Fusha',
        },
        buildPrompt: (v) => `Bertindak sebagai Pakar Pentaksiran Kurikulum Bersepadu Dini (KBD) dan Kurikulum Azhari.
Bina satu Rubrik Penilaian Holistik bagi:
- Sekolah: ${v.schoolName}
- Mata Pelajaran & Tahap: ${v.field1}
- Komponen Pentaksiran: ${v.field2}
- Kemahiran Fokus: ${v.field3}

Sila sediakan:
1. Jadual Rubrik Penilaian 6 Tahap Penguasaan (TP1 hingga TP6).
2. Kriteria Penilaian Lisan (Syafawi), Penulisan (Tahriri) dan Penghayatan Amali.
3. Contoh Soalan KBAT Dwibahasa (Melayu/Arab) berserta panduan pemarkahan.`,
        buildDraftDocument: (v) => `DOKUMEN STANDARD PENTAKSIRAN: RUBRIK PENILAIAN KURIKULUM DINI & AZHARI
INSTITUSI: ${v.schoolName.toUpperCase()}
MATA PELAJARAN: ${v.field1}
WAJARAN PENTAKSIRAN: ${v.field2}
====================================================================

1.0 FOKUS KEMAHIRAN PENTAKSIRAN HOLISTIK
Pentaksiran ini menilai penguasaan murid secara menyeluruh merangkumi: ${v.field3}.

2.0 RUBRIK TAHAP PENGUASAAN (TP1 – TP6)
• TP1 (Tahu Asas): Murid boleh menyebut istilah asas dan membaca petikan teks/dalil dengan bimbingan penuh guru.
• TP2 (Faham): Murid boleh menerangkan maksud kalimah/pengertian hukum secara ringkas dalam Bahasa Melayu atau Bahasa Arab mudah.
• TP3 (Aplikasi Asas): Murid boleh membaca dalil dengan betul, mengaplikasikan kaedah nahu/hukum asas dalam latihan bertulis dan amali.
• TP4 (Analisis Terperinci): Murid menghafaz dalil berkaitan dengan lancar serta mampu menghuraikan hubung kait hukum dengan situasi harian.
• TP5 (Penilaian & KBAT): Murid mampu mengemukakan hujah naqli dan aqli secara tersusun serta berkomunikasi dalam Bahasa Arab Fusha dengan baik.
• TP6 (Kreatif & Mithali): Murid berupaya membuat rumusan penyelesaian masalah kontemporari berteraskan maqasid syariah serta menjadi suri teladan amali kepada rakan sebaya.

3.0 PECAHAN KRITERIA PENILAIAN AMALI & SYAFAWI
1. Kelancaran & Ketepatan Sebutan Bahasa Arab / Dalil (10 Markah)
2. Kefahaman Kandungan & Huraian Istinbat Hukum (10 Markah)
3. Aplikasi Adab, Sahsiah & Amali Ibadah Harian (10 Markah)

4.0 TINDAKAN SUSULAN PANITIA
Murid yang berada pada tahap TP1 dan TP2 wajib mengikuti Klinik Pemulihan Lughatul Quran dan Bimbingan Talaqqi Berfokus setiap minggu.`,
      },
    ],
  },

  // ============================================================================
  // 4. AI UNTUK HEM & SAHSIAH
  // ============================================================================
  {
    id: 'hem',
    number: 4,
    title: '4. AI untuk HEM & Sahsiah',
    shortLabel: '4. AI HEM',
    promptCategory: 'HEM',
    description:
      'Pengesanan awal isu emosi dan tekanan asrama, modul pembinaan kepimpinan pengawas, serta komunikasi pantas mengendalikan isu viral media sosial.',
    colorScheme: {
      bgBadge: 'bg-amber-100',
      textBadge: 'text-amber-900',
      borderHover: 'hover:border-amber-400',
      activeRing: 'ring-2 ring-amber-600 border-amber-600',
      btnBg: 'bg-amber-900',
      btnHover: 'hover:bg-amber-800',
      lightBg: 'bg-amber-50/70',
      dotColor: 'text-amber-600',
    },
    subModules: [
      {
        id: 'hem-1',
        promptId: 'pr-hem-1',
        pillarId: 'hem',
        title: 'SOP Komunikasi Krisis & Isu Tular Media',
        summary:
          'Sediakan pelan tindak balas pantas (Golden Hour) 4 fasa dan draf kenyataan rasmi PGB kepada ibu bapa bagi menangani isu tular.',
        documentType: 'SOP Komunikasi Krisis & Kenyataan Rasmi',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Kategori Isu / Senario Krisis',
          field2: 'Saluran Komunikasi & Pihak Terlibat',
          field3: 'Tindakan Siasatan & Penyelesaian Segera Sekolah',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Aduan kebajikan dewan makan / salah faham isu disiplin murid yang tular di media sosial',
          field2: 'Kumpulan WhatsApp Rasmi Ibu Bapa (PIBG), Lembaga Pengelola Sekolah & Pejabat Pendidikan Daerah',
          field3: 'Penubuhan Jawatankuasa Siasatan Dalaman serta-merta, pertemuan empat mata bersama waris & penambahbaikan SOP',
        },
        buildPrompt: (v) => `Sebagai Perunding Komunikasi Krisis Pendidikan, rangka Pelan Tindak Balas Pantas (Rapid Response SOP) untuk Pengetua/Guru Besar:
- Sekolah: ${v.schoolName}
- Senario Krisis: ${v.field1}
- Saluran & Pihak Terlibat: ${v.field2}
- Tindakan Segera: ${v.field3}

Hasilkan panduan lengkap 4 fasa:
1. Fasa 1: Pengesahan Fakta & Kawalan Dalaman (Jam 0 – 2).
2. Fasa 2: Draf Kenyataan Rasmi & Mesej WhatsApp Ibu Bapa (Jam 2 – 4) yang empati dan berwibawa.
3. Fasa 3: Sesi Libat Urus & Penyelesaian (Hari 1 – 3).
4. Fasa 4: Pemulihan Kepercayaan & Tarbiah (Minggu 1 – 2).`,
        buildDraftDocument: (v) => `SOP PENGURUSAN KOMUNIKASI KRISIS & TINDAK BALAS PANTAS (GOLDEN HOUR)
INSTITUSI: ${v.schoolName.toUpperCase()}
SENARIO RUJUKAN: ${v.field1}
====================================================================

FASA 1: PENGESAHAN FAKTA & KAWALAN DALAMAN (JAM 0 HINGGA JAM 2)
1. Pengetua/Guru Besar mengaktifkan Jawatankuasa Pengurusan Krisis Sekolah (PGB, PK HEM, Ketua Warden, Guru Kaunseling).
2. Jalankan semakan fakta secara menyeluruh tanpa mendedahkan identiti atau privasi mana-mana murid/guru di ruang awam.
3. Maklumkan laporan awal kepada Pengerusi Lembaga Pengelola Sekolah, YDP PIBG dan pegawai perhubungan PPD/JPN (${v.field2}).

FASA 2: DRAF KENYATAAN RASMI KEPADA IBU BAPA / PENJAGA (JAM 2 HINGGA JAM 4)
--------------------------------------------------------------------
[DRAF MESEJ RASMI PENGETUA/GURU BESAR]
Assalamualaikum wrt. wbt. Ibu Bapa / Penjaga warga ${v.schoolName} yang dihormati,

Pihak pengurusan sekolah mengambil maklum dengan penuh keprihatinan berhubung perkara yang sedang diperkatakan berkaitan (${v.field1}). Keselamatan, kebajikan dan kesejahteraan emosi anak-anak didik sentiasa menjadi keutamaan tertinggi kami.

Untuk makluman, pihak sekolah telah mengambil langkah segera iaitu: ${v.field3}. Kami memohon kerjasama semua pihak agar tidak membuat spekulasi atau menyebarkan maklumat yang belum disahkan demi menjaga aib dan kesejahteraan emosi anak-anak kita. Pihak sekolah sentiasa membuka pintu perbincangan secara terus bersama ibu bapa yang terlibat.

Terima kasih atas sokongan dan kepercayaan berterusan kepada pihak sekolah.
Pengetua / Guru Besar, ${v.schoolName}
--------------------------------------------------------------------

FASA 3: LIBAT URUS & PENYELESAIAN (HARI 1 – HARI 3)
• Mengadakan pertemuan harmoni secara tertutup bersama waris dan pihak berkaitan.
• Menyediakan sokongan psikososial dan kaunseling kepada murid yang terkesan.

FASA 4: AUDIT PASCA-KRISIS & PEMULIHAN (MINGGU 1 – 2)
• Mengemas kini prosedur operasi berkaitan dan membentangkan laporan penambahbaikan kepada Lembaga Pengelola & PIBG.`,
      },
      {
        id: 'hem-2',
        promptId: 'pr-hem-2',
        pillarId: 'hem',
        title: 'Modul Tarbiah & Biah Solehah Asrama',
        summary:
          'Bina takwim tarbiah asrama, sistem usrah Nuqaba’/Pengawas, saringan emosi rakan sebaya dan kempen Sifar Buli.',
        documentType: 'Modul Tarbiah & Biah Solehah Asrama',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Kumpulan Sasaran & Jawatankuasa Pelaksana',
          field2: 'Tema & Fokus Pembinaan Sahsiah',
          field3: 'Aktiviti Teras (Usrah, Kempen Adab & Sokongan Emosi)',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Semua Penghuni Asrama, Lembaga Pengawas, BADAR & Majlis Nuqaba’',
          field2: 'Asrama Harmoni Berteraskan Ukhuwah Islamiyah, Sifar Buli & Cinta Ilmu',
          field3: 'Halaqah Usrah Jumaat, Sistem Mentor-Mentee (Abang/Kakak Angkat Beradab) & Anugerah Dorm Rabbani',
        },
        buildPrompt: (v) => `Anda ialah Pakar Pembangunan Sahsiah & Tarbiah Sekolah Islam Berasrama.
Bina satu Modul Tahunan "Tarbiah & Biah Solehah Asrama" untuk:
- Sekolah: ${v.schoolName}
- Sasaran & Pelaksana: ${v.field1}
- Tema Sahsiah: ${v.field2}
- Aktiviti Teras: ${v.field3}

Sila sediakan:
1. Kerangka Konsep Biah Solehah Asrama.
2. Jadual Aktiviti Tarbiah Mingguan & Bulanan.
3. Sistem Sokongan Emosi & Pencegahan Buli (Buddy Support System).
4. Piagam Adab Penghuni Asrama.`,
        buildDraftDocument: (v) => `MODUL PEMBANGUNAN SAHSIAH: TARBIAH & BIAH SOLEHAH ASRAMA
INSTITUSI: ${v.schoolName.toUpperCase()}
SASARAN & PELAKSANA: ${v.field1}
TEMA UTAMA: ${v.field2}
====================================================================

1.0 OBJEKTIF MODUL BIAH SOLEHAH
Melahirkan penghuni asrama yang menghayati adab Islami, saling menyayangi kerana Allah, bebas daripada sebarang unsur buli atau tekanan emosi, serta menjadikan asrama sebagai taman ilmu dan ibadah.

2.0 PELAKSANAAN AKTIVITI TERAS TARBIAH
Fokus Program: ${v.field3}
• Harian: Solat Fardu Berjemaah di awal waktu, Bacaan Al-Ma'thurat Pagi/Petang & Budaya memberi salam serta senyum.
• Mingguan: Liqa' Usrah Nuqaba' setiap malam Jumaat (kumpulan kecil 8–10 murid merentas tingkatan) membincangkan isu adab, pengurusan emosi dan ukhuwah.
• Bulanan: Qiamullail Perdana, Gotong-Royong Mahabbah Dorm & Pertandingan Dorm Bersih dan Ceria (Anugerah Dorm Rabbani).

3.0 SISTEM PENGESANAN AWAL EMOSI & SIFAR BULI (CAKNA EMOSI)
• Setiap murid baharu (Tingkatan 1) dipadankan dengan Pembimbing Rakan Sebaya / Naqib terlatih di bawah seliaan terus Guru Bimbingan & Kaunseling serta Warden.
• Peti/Saluran Aduan Rahsia "Bicara Hati" disediakan bagi membolehkan murid berkongsi sebarang tekanan emosi atau salah laku dengan selamat.

4.0 LIMA (5) PIAGAM ADAB PENGHUNI ASRAMA
1. Menjaga solat berjemaah dan menghormati waktu ibadah serta waktu tidur rakan.
2. Menghormati yang lebih tua dan menyayangi serta membimbing yang lebih muda.
3. Menjaga pertuturan daripada kata-kata kesat, ejekan atau perbuatan menyakiti rakan.
4. Memelihara amanah harta benda sekolah dan kebersihan ruang dorm bersama.
5. Sentiasa bekerjasama dengan Warden, Naqib dan Pengawas demi keharmonian asrama.`,
      },
      {
        id: 'hem-3',
        promptId: 'pr-hem-3',
        pillarId: 'hem',
        title: 'Analisis Kehadiran & Amaran Awal Ponteng',
        summary:
          'Hasilkan matriks pengesanan risiko ketidakhadiran (Early Warning System), pelan kaunseling berfokus dan surat cakna ibu bapa.',
        documentType: 'Laporan Analisis Kehadiran & Intervensi Ponteng',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Peratus Kehadiran Semasa vs Sasaran Sekolah',
          field2: 'Pola / Punca Ketidakhadiran Yang Dikesan',
          field3: 'Tindakan Intervensi Bersepadu (HEM & Kaunseling)',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Kehadiran Semasa: 92.4% -> Sasaran Tahunan: 97.0%',
          field2: 'Ketidakhadiran berkala pada hari Isnin/Jumaat dan isu motivasi akademik bagi 18 orang murid',
          field3: 'Panggilan Cakna Guru Kelas, Sesi Kaunseling Individu, Ziarah Cakna PIBG & Program Jom Ke Sekolah',
        },
        buildPrompt: (v) => `Bertindak sebagai Pakar Pengurusan Hal Ehwal Murid (HEM) & Bimbingan Kaunseling.
Bantu saya merangka sistem Analisis Kehadiran & Intervensi Amaran Awal Ponteng bagi:
- Sekolah: ${v.schoolName}
- Data Kehadiran: ${v.field1}
- Pola Dikesan: ${v.field2}
- Tindakan Intervensi: ${v.field3}

Sila hasilkan:
1. Matriks Pengesanan Awal Risiko (Early Warning System).
2. Pelan Intervensi Bersepadu (Guru Kelas, Kaunselor, PK HEM & PIBG).
3. Draf Surat / Mesej Cakna Prihatin kepada Ibu Bapa yang berhemah.`,
        buildDraftDocument: (v) => `PELAN ANALISIS KEHADIRAN MURID & SISTEM AMARAN AWAL PONTENG
INSTITUSI: ${v.schoolName.toUpperCase()}
STATUS KEHADIRAN: ${v.field1}
====================================================================

1.0 ANALISIS POLA KETIDAKHADIRAN SEMASA
Hasil semakan rekod kehadiran bulanan mendapati corak ketidakhadiran utama melibatkan: ${v.field2}. Pendekatan intervensi awal berteraskan konsep "Cakna & Empati" digerakkan sebelum kes mencapai tahap surat amaran disiplin.

2.0 MATRIKS AMARAN AWAL (EARLY WARNING SYSTEM - EWS)
• Kod Hijau (Hadir > 95%): Sijil Penghargaan Kehadiran Penuh setiap penggal.
• Kod Kuning (Tidak Hadir 3 Hari Tanpa Sebab / Berkala): Panggilan Cakna oleh Guru Kelas kepada ibu bapa pada hari ke-3 dan rujukan awal kepada Guru Bimbingan & Kaunseling.
• Kod Jingga (Tidak Hadir 7–10 Hari): Sesi konsultasi bersemuka PK HEM, Kaunselor dan Ibu Bapa bagi mengenal pasti punca sebenar (kesihatan, emosi, pengangkutan atau kewangan).
• Kod Merah (Risiko Keciciran Tinggi): Lawatan "Ziarah Cakna Mahabbah" ke rumah murid bersama wakil Pentadbir dan PIBG.

3.0 PELAN INTERVENSI BERSEPADU
Langkah Pelaksanaan: ${v.field3}.

4.0 DRAF MESEJ / SURAT PRIHATIN KEPADA IBU BAPA
--------------------------------------------------------------------
Assalamualaikum wrt. wbt. Tuan/Puan Penjaga yang dihormati,
Pihak ${v.schoolName} sentiasa mengambil berat akan perkembangan akademik dan kesejahteraan anak jagaan Tuan/Puan. Berdasarkan rekod kehadiran semasa, kami mendapati anak Tuan/Puan tidak dapat hadir ke sekolah beberapa hari kebelakangan ini.

Kami amat berbesar hati sekiranya pihak Tuan/Puan dapat berkongsi sekiranya terdapat sebarang kekangan kesihatan, emosi atau keperluan yang boleh pihak sekolah dan Unit Bimbingan Kaunseling bantu bersama. Kehadiran penuh anak Tuan/Puan amat penting bagi memastikan beliau tidak ketinggalan dalam sesi PdP.
Terima kasih atas kerjasama erat Tuan/Puan.
Unit Hal Ehwal Murid (HEM), ${v.schoolName}
--------------------------------------------------------------------`,
      },
    ],
  },

  // ============================================================================
  // 5. AI UNTUK DATA & ANALITIK
  // ============================================================================
  {
    id: 'data',
    number: 5,
    title: '5. AI untuk Data & Analitik',
    shortLabel: '5. AI Data',
    promptCategory: 'Data & Analisis',
    description:
      'Menganalisis maklum balas Google Form ibu bapa (PIBG), mengesan trend pencapaian peperiksaan dan merumuskan beban tugas guru berasaskan data sahih.',
    colorScheme: {
      bgBadge: 'bg-rose-100',
      textBadge: 'text-rose-900',
      borderHover: 'hover:border-rose-400',
      activeRing: 'ring-2 ring-rose-600 border-rose-600',
      btnBg: 'bg-rose-900',
      btnHover: 'hover:bg-rose-800',
      lightBg: 'bg-rose-50/70',
      dotColor: 'text-rose-600',
    },
    subModules: [
      {
        id: 'dat-1',
        promptId: 'pr-dat-1',
        pillarId: 'data',
        title: 'Analisis Sentimen Kaji Selidik Ibu Bapa PIBG',
        summary:
          'Rumuskan ratusan respons Google Form ibu bapa kepada laporan sentimen eksekutif, kekuatan sekolah dan tindakan Quick Wins.',
        documentType: 'Laporan Analisis Sentimen PIBG',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Tajuk Kaji Selidik & Bilangan Responden Ibu Bapa',
          field2: 'Pujian / Kekuatan Utama Yang Disebut Ibu Bapa',
          field3: 'Cadangan / Isu Utama Yang Dibangkitkan (Pain Points)',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'Kaji Selidik Kepuasan Ibu Bapa Sesi 2026 (312 Responden Google Form)',
          field2: 'Dedikasi guru membimbing sahsiah murid, program solat & tahfiz, serta komunikasi pantas guru kelas',
          field3: 'Kesesakan laluan trafik waktu pulang, variasi menu kantin/asrama & penyelarasan jadual kelas tambahan',
        },
        buildPrompt: (v) => `Bertindak sebagai Penganalisis Data Pendidikan & Perhubungan Komuniti PIBG.
Sediakan Laporan Analisis Sentimen Kaji Selidik Ibu Bapa berdasarkan maklumat berikut:
- Sekolah: ${v.schoolName}
- Kaji Selidik & Responden: ${v.field1}
- Maklum Balas Positif (Kekuatan): ${v.field2}
- Isu / Cadangan Penambahbaikan: ${v.field3}

Sila jalankan analisis komprehensif:
1. Rumusan Sentimen Keseluruhan (Pecahan Positif, Neutral, Perlu Perhatian).
2. Analisis 3 Kekuatan Utama Sekolah.
3. Analisis 3 Isu Utama (Pain Points) berserta Cadangan Tindakan Segera (Quick Wins - 14 Hari).
4. Draf Maklum Balas Rasmi Pengetua/Guru Besar kepada PIBG.`,
        buildDraftDocument: (v) => `LAPORAN EKSEKUTIF: ANALISIS SENTIMEN KAJI SELIDIK IBU BAPA (PIBG)
INSTITUSI: ${v.schoolName.toUpperCase()}
SUMBER DATA: ${v.field1}
====================================================================

1.0 RINGKASAN SENTIMEN KESELURUHAN
Berdasarkan analisis ke atas maklum balas ibu bapa/penjaga, indeks kepuasan keseluruhan berada pada tahap POSITIF & MEMBINA:
• Sentimen Positif (Sangat Berpuas Hati & Memuji): ~78%
• Sentimen Neutral (Cadangan Penambahbaikan Berkala): ~15%
• Sentimen Perlu Perhatian Segera (Isu Operasi/Fasiliti): ~7%

2.0 KEKUATAN UTAMA SEKOLAH (MENGIKUT PERSEPSI IBU BAPA)
Ibu bapa merakamkan penghargaan tinggi terhadap aspek berikut:
• ${v.field2}.
• Keyakinan tinggi ibu bapa terhadap pembentukan adab dan biah solehah di sekolah.

3.0 ISU UTAMA (PAIN POINTS) & PELAN TINDAKAN SEGERA (QUICK WINS 14 HARI)
Isu Dikesan: ${v.field3}
• Tindakan Quick Win 1 (Trafik & Keselamatan): Menyusun semula aliran sehala kenderaan waris dengan kerjasama RELA/Pengawal dan jadual pelepasan berperingkat.
• Tindakan Quick Win 2 (Kebajikan Makanan): Semakan menu berkala bersama Jawatankuasa Kantin/Dewan Makan dan wakil AJK PIBG setiap bulan.
• Tindakan Quick Win 3 (Jadual Akademik): Mengedarkan takwim kelas bimbingan sebulan lebih awal melalui saluran rasmi ibu bapa.

4.0 RUMUSAN PEMBENTANGAN MESYUARAT AJK PIBG
Laporan ini dicadangkan untuk dibentangkan dalam Mesyuarat AJK PIBG terdekat sebagai bukti ketelusan tadbir urus sekolah yang mendengar suara pemegang taruh.`,
      },
      {
        id: 'dat-2',
        promptId: 'pr-dat-2',
        pillarId: 'data',
        title: 'Sintesis Laporan Tahunan Sekolah Ahli',
        summary:
          'Sintesis data pencapaian akademik, tahfiz, HEM, kokurikulum dan beban tugas guru menjadi Laporan Tahunan Eksekutif.',
        documentType: 'Laporan Tahunan Eksekutif Sekolah',
        labels: {
          schoolName: 'Nama Sekolah Ahli MPGBSIM',
          field1: 'Pencapaian Utama Akademik, Dini & Tahfiz',
          field2: 'Sorotan Kemenjadian HEM & Kejayaan Kokurikulum',
          field3: 'Pengurusan Staf, Kewangan & Sasaran Tahun Hadapan',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: 'GPS SPM 2.38 (100% Layak Sijil), 24 Murid Khatam 30 Juzuk & 96% Lulus Cemerlang Subjek Dini',
          field2: 'Purata Kehadiran 96.8%, Johan Bahas Bahasa Arab Kebangsaan & Penarafan Asrama 5 Bintang',
          field3: '100% Guru Selesai Latihan AI Pendidikan (42 Jam CPD) | Sasaran 2027: Pendigitalan Penuh Bilik Darjah',
        },
        buildPrompt: (v) => `Anda ialah Ketua Editor Laporan Eksekutif Pendidikan.
Sintesis dan susun satu Laporan Tahunan Eksekutif Sekolah bagi:
- Sekolah Ahli: ${v.schoolName}
- Pencapaian Akademik & Tahfiz: ${v.field1}
- Pencapaian HEM & Kokurikulum: ${v.field2}
- Pengurusan Staf & Hala Tuju: ${v.field3}

Sila hasilkan dokumen Laporan Tahunan Eksekutif merangkumi:
1. Perutusan Eksekutif Pengetua / Guru Besar.
2. Papan Pemuka Pencapaian Utama (KPI Highlights).
3. Rumusan 4 Bidang Utama (Kurikulum, HEM, Kokurikulum, Tadbir Urus).
4. Hala Tuju Tahun Hadapan.`,
        buildDraftDocument: (v) => `LAPORAN TAHUNAN EKSEKUTIF SEKOLAH AHLI MPGBSIM
INSTITUSI: ${v.schoolName.toUpperCase()}
PORTAL RASMI: https://www.mpgbsim.org/
====================================================================

1.0 RINGKASAN EKSEKUTIF PENGETUA / GURU BESAR
Alhamdulillah, sepanjang sesi persekolahan semasa, ${v.schoolName} telah melakar pencapaian membanggakan merentasi bidang akademik, kurikulum Dini/Tahfiz, pembangunan sahsiah dan kokurikulum hasil gandingan mantap warga pendidik, murid, PIBG dan Lembaga Pengelola.

2.0 SOROTAN PETUNJUK PRESTASI UTAMA (KPI DASHBOARD)
• Kecemerlangan Kurikulum & Tahfiz:
  ${v.field1}
• Kemenjadian Murid (HEM & Kokurikulum):
  ${v.field2}
• Pembangunan Profesionalisme & Tadbir Urus:
  ${v.field3}

3.0 ANALISIS KESEJAHTERAAN & BEBAN TUGAS GURU
Melalui penggunaan sistem pengurusan digital dan alatan kecerdasan buatan (AI) di bawah inisiatif MPGBSIM, masa penyediaan dokumentasi pentadbiran guru berjaya dikurangkan sebanyak 30%, membolehkan guru memberi tumpuan penuh kepada kualiti PdP dan bimbingan murid.

4.0 HALA TUJU STRATEGIK SESI AKAN DATANG
1. Memperkukuh program intervensi berfokus bagi mengekalkan kelestarian kecemerlangan peperiksaan awam dan Dini.
2. Memperluas jaringan kerjasama strategik antara sekolah ahli MPGBSIM di peringkat negeri dan kebangsaan.

Disediakan oleh: Pentadbiran ${v.schoolName}`,
      },
      {
        id: 'dat-3',
        promptId: 'pr-dat-3',
        pillarId: 'data',
        title: 'Unjuran Enrolmen & Kapasiti Bilik Darjah',
        summary:
          'Analisis data enrolmen murid, kapasiti bilik darjah/asrama dan pengiraan nisbah agihan waktu mengajar guru secara optimum.',
        documentType: 'Laporan Unjuran Enrolmen & Perjawatan',
        labels: {
          schoolName: 'Nama Sekolah / Institusi',
          field1: 'Enrolmen Semasa, Bilangan Kelas & Guru',
          field2: 'Permohonan Kemasukan Baharu & Kapasiti Maksimum',
          field3: 'Keperluan Perjawatan Guru & Ruang Fizikal',
        },
        defaults: {
          schoolName: 'Sekolah Menengah Islam Al-Amin Bestari',
          field1: '640 Orang Murid | 20 Bilik Darjah | 52 Orang Guru (Nisbah Semasa 1:12.3)',
          field2: '320 Permohonan Baharu bagi 130 Kekosongan (Kapasiti Optimum: 32 Murid/Kelas)',
          field3: 'Keperluan tambahan 2 Guru Dini/Tahfiz, 1 Guru Sains & pembukaan 1 kelas baharu Tingkatan 1',
        },
        buildPrompt: (v) => `Bertindak sebagai Pakar Perancangan Data Enrolmen & Sumber Manusia Sekolah.
Berdasarkan data semasa sekolah berikut:
- Sekolah: ${v.schoolName}
- Enrolmen & Staf Semasa: ${v.field1}
- Permohonan Baharu & Kapasiti: ${v.field2}
- Keperluan Perjawatan & Ruang: ${v.field3}

Sila sediakan Laporan Unjuran Enrolmen & Kapasiti Sesi Akan Datang:
1. Analisis Kadar Penggunaan Bilik Darjah & Unjuran Enrolmen.
2. Analisis Nisbah Guru-Murid & Pengagihan Beban Waktu Mengajar.
3. Cadangan Saringan Kemasukan Murid Baharu.
4. Syor Perjawatan & Infrastruktur kepada Lembaga Pengelola.`,
        buildDraftDocument: (v) => `LAPORAN ANALITIK: UNJURAN ENROLMEN, KAPASITI KELAS & PERJAWATAN GURU
INSTITUSI: ${v.schoolName.toUpperCase()}
====================================================================

1.0 PROFIL DATA SEMASA SEKOLAH
• Status Semasa: ${v.field1}
• Permohonan & Kapasiti: ${v.field2}

2.0 ANALISIS KAPASITI BILIK DARJAH & SARINGAN KEMASUKAN
• Kadar permintaan kemasukan murid baharu melebihi kekosongan sedia ada sebanyak lebih 2 kali ganda, menunjukkan tahap kepercayaan ibu bapa yang sangat tinggi terhadap institusi.
• Bagi mengekalkan kualiti PdP dan perhatian individu, saiz kelas dihadkan kepada maksimum 32 orang murid bagi setiap bilik darjah.
• Saringan kemasukan dilaksanakan menerusi 3 penilaian: Ujian Diagnostik Akademik (40%), Ujian Tilawah & Hafazan Al-Quran (40%), serta Temu Bual Sahsiah Murid & Komitmen Ibu Bapa (20%).

3.0 UNJURAN BEBAN TUGAS & KEPERLUAN PERJAWATAN GURU
• Keperluan dikenal pasti: ${v.field3}.
• Waktu mengajar optimum guru ditetapkan antara 24 hingga 28 waktu seminggu bagi memberi ruang kepada persediaan PdP, bimbingan halaqah dan semakan latihan murid.

4.0 SYOR TINDAKAN PENGURUSAN
1. Membentangkan cadangan lantikan perjawatan baharu dalam Mesyuarat Lembaga Pengelola Sekolah selewat-lewatnya suku keempat tahun semasa.
2. Melaksanakan penyelenggaraan awal kerusi, meja dan peralatan pengajaran sebelum sesi baharu bermula.`,
      },
    ],
  },
];
