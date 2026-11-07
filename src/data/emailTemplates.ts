import { EmailTemplateType } from '../types';

export interface EmailTemplateDefinition {
  type: EmailTemplateType;
  label: string;
  badge: string;
  description: string;
  defaultSubject: string;
  defaultSalutation: string;
  defaultBodyText: string;
  defaultClosing: string;
  defaultSlogan: string;
  defaultRefPrefix: string;
}

export const OFFICIAL_EMAIL_TEMPLATES: Record<EmailTemplateType, EmailTemplateDefinition> = {
  JEMPUTAN_MESYUARAT: {
    type: 'JEMPUTAN_MESYUARAT',
    label: 'Surat Jemputan Mesyuarat / Wacana Agung',
    badge: 'Mesyuarat & Wacana',
    description: 'Template surat jemputan rasmi ke Mesyuarat Agung Tahunan, Wacana Kepimpinan PGB, atau Sidang Muzakarah MPGBSIM.',
    defaultRefPrefix: 'MPGBSIM/MESY/2026',
    defaultSubject: 'JEMPUTAN MENGHADIRI MESYUARAT KEPIMPINAN & WACANA STRATEGIK PGB SEKOLAH ISLAM MALAYSIA 2026',
    defaultSalutation: 'Yang Berusaha Pengetua / Guru Besar,',
    defaultBodyText: `Dengan segala hormat dan takzimnya perkara di atas adalah dirujuk.

2. Sukacita dimaklumkan bahawa Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) akan menganjurkan Sesi Mesyuarat Kepimpinan & Wacana Strategik PGB Peringkat Kebangsaan bagi memperkukuhkan halatuju Rangka Tindakan Strategik Pendidikan Islam Malaysia.

3. Sehubungan dengan itu, pihak Majlis dengan penuh takzim menjemput Yang Berusaha Pengetua / Guru Besar atau wakil rasmi pihak sekolah untuk menghadiri mesyuarat tersebut mengikut butiran ketetapan berikut:

    • Tarikh      : Sila tetapkan tarikh (cth: 24 Mac 2026)
    • Hari        : Sila tetapkan hari (cth: Sabtu)
    • Masa        : 8:30 Pagi – 1:00 Tengah Hari
    • Kaedah / Tempat : Dewan Utama Sekretariat Kebangsaan / Secara Dalam Talian (Google Meet / Zoom)
    • Agenda Utama: Penyelarasan Kurikulum Diniyah, Integrasi AI Sekolah Rabbani, & Pemerkasaan Dana Pendidikan

4. Kerjasama dan kehadiran Yang Berusaha Tuan/Puan amatlah dihargai demi memartabatkan kualiti kepimpinan institusi pendidikan Islam di Malaysia. Sila sahkan kehadiran melalui pautan Portal Ahli MPGBSIM atau menghubungi Urus Setia Sekretariat selewat-lewatnya 3 hari sebelum tarikh program.`,
    defaultClosing: `Sekian untuk makluman dan tindakan Yang Berusaha Tuan/Puan selanjutnya. Segala sokongan dan kerjasama yang diberikan didahului dengan setinggi-tinggi ucapan jazakumullahu khairal jaza'.`,
    defaultSlogan: `"MEMACU KEPIMPINAN RABBANI, MEMBINA GENERASI SOLEH WA MUSLEH"`,
  },

  YURAN_TAHUNAN: {
    type: 'YURAN_TAHUNAN',
    label: 'Peringatan / Notis Pembayaran Yuran Tahunan',
    badge: 'Kewangan & Yuran',
    description: 'Template notis rasmi tuntutan dan peringatan pembayaran yuran tahunan keahlian institusi sekolah bagi sesi kalendar 2026.',
    defaultRefPrefix: 'MPGBSIM/KEW-YURAN/2026',
    defaultSubject: 'PERINGATAN PEMBAYARAN YURAN KEAHLIAN TAHUNAN INSTITUSI SEKOLAH ISLAM MALAYSIA SESI 2026',
    defaultSalutation: 'Yang Berusaha Pengetua / Guru Besar & Pengurusan Sekolah,',
    defaultBodyText: `Semoga warkah ini menemui Yang Berusaha Tuan/Puan dalam keadaan sihat walafiat serta sentiasa berada di bawah naungan rahmat dan taufiq Allah SWT.

2. Adalah dimaklumkan bahawa menurut Perlembagaan Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (Fasal 9: Kewangan & Yuran), setiap institusi sekolah ahli berdaftar dikehendaki menjelaskan sumbangan Yuran Tahunan Keahlian bagi memastikan kelancaran operasi dakwah, latihan profesionalisme guru, dan pembangunan portal digital majlis.

3. Kadar yuran tahunan bagi sesi 2026 adalah sebagaimana ketetapan Majlis Mesyuarat Agung:
    • Yuran Tahunan Institusi: RM 300.00 / RM 500.00 setahun (mengikut kategori sekolah)
    • Tempoh Pembayaran     : Sebelum atau pada 30 April 2026

4. Pembayaran boleh dilaksanakan dengan mudah dan pantas melalui saluran rasmi berikut:
    a) Gerbang Pembayaran Terus (HerePay FPX): https://app.herepay.org/mpgbsim
    b) Pindahan Atas Talian (Bank Transfer):
       • Nama Bank   : BANK ISLAM MALAYSIA BERHAD
       • Nama Akaun  : MAJLIS PENGETUA GURU BESAR SEKOLAH ISLAM MALAYSIA
       • No. Akaun   : 1209 2010 0345 67
       • Rujukan     : [KOD SEKOLAH] - YURAN 2026

5. Setelah bayaran dibuat, mohon muat naik resit/slip transaksi ke dalam ruangan "Rekod Yuran" di Portal Ahli MPGBSIM untuk pengeluaran Resit Rasmi dan Sijil Perakuan Keahlian Aktif secara automatik.`,
    defaultClosing: `Pihak Majlis merakamkan setinggi-tinggi penghargaan dan terima kasih atas komitmen berterusan pihak sekolah dalam melestarikan perjuangan pendidikan Islam nusantara.`,
    defaultSlogan: `"BERKHIDMAT KERANA ALLAH UNTUK PENDIDIKAN UMMAH"`,
  },

  PEMBERITAHUAN_PROGRAM: {
    type: 'PEMBERITAHUAN_PROGRAM',
    label: 'Pemberitahuan Program & Bengkel Latihan PGB',
    badge: 'Program & Latihan',
    description: 'Surat edaran pemakluman kursus kepimpinan, bengkel AI bilik darjah, seminar pentadbiran atau pertandingan antarabangsa.',
    defaultRefPrefix: 'MPGBSIM/PROG/2026',
    defaultSubject: 'PEMBERITAHUAN PENYERTAAN KONVENSYEN KEBANGSAAN KEPIMPINAN SEKOLAH ISLAM MALAYSIA 2026',
    defaultSalutation: 'Yang Berusaha Pengetua / Guru Besar & Barisan Pentadbir,',
    defaultBodyText: `Dengan segala hormatnya perkara di atas adalah dirujuk.

2. Sukacita dimaklumkan bahawa Biro Pembangunan Kepimpinan & Latihan MPGBSIM akan menganjurkan Konvensyen Kebangsaan Kepimpinan Sekolah Islam Malaysia 2026 berteraskan modul Transformasi Digital & Kepimpinan Rabbani.

3. Objektif utama program ini adalah:
    i.   Memperkasa kemahiran pengurusan pentadbir sekolah berasaskan teknologi Generative AI & tadbir urus moden.
    ii.  Menyelaras standard kurikulum diniyah dengan pelan pendidikan terkini Kementerian Pendidikan Malaysia (KPM).
    iii. Menyediakan platform perkongsian amalan terbaik (Best Practices) sesama institusi sekolah Islam seluruh negara.

4. Pihak Majlis mengalu-alukan penyertaan daripada barisan kepimpinan sekolah tuan/puan (Pengetua, Guru Besar, Guru Penolong Kanan, dan Ketua Bidang). Setiap peserta yang hadir akan dianugerahkan Sijil Penyertaan Rasmi Peringkat Kebangsaan yang disahkan oleh Pengerusi Kebangsaan MPGBSIM.

5. Pendaftaran peserta boleh dilaksanakan secara terus melalui Menu "Acara & Takwim" di Portal Ahli MPGBSIM (https://www.mpgbsim.org/portal).`,
    defaultClosing: `Semoga penyertaan pihak sekolah dalam program ini dapat menyuntik lonjakan kecemerlangan kepada warga sekolah. Sekian, terima kasih.`,
    defaultSlogan: `"KEPIMPINAN BERWIBAWA, PENDIDIKAN CEMERLANG, UMMAH GEMILANG"`,
  },

  PEKELILING_KHAS: {
    type: 'PEKELILING_KHAS',
    label: 'Surat Pekeliling / Makluman Khas Majlis',
    badge: 'Pekeliling Rasmi',
    description: 'Pekeliling rasmi pentadbiran mengenai arahan keselamatan, garis panduan kurikulum, atau keputusan rasmi Jawatankuasa Pusat.',
    defaultRefPrefix: 'MPGBSIM/PEK/2026',
    defaultSubject: 'SURAT PEKELILING PENTADBIRAN BIL. 01/2026: GARIS PANDUAN PENGURUSAN DAN KESELAMATAN INSTITUSI SEKOLAH ISLAM',
    defaultSalutation: 'Yang Berusaha Pengetua / Guru Besar Sekolah-Sekolah Ahli MPGBSIM,',
    defaultBodyText: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

2. Pekeliling ini bertujuan memberi panduan dan ketetapan rasmi Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) berhubung pematuhan standard pengurusan, kebajikan murid, dan keselamatan warga institusi pendidikan Islam swasta dan rangkaian.

3. Pihak pentadbiran sekolah ahli dinasihatkan mengambil perhatian dan melaksanakan ketetapan berikut dengan penuh integriti:
    a) Mengemaskini data direktori pentadbiran dan profil kepimpinan di Portal Ahli MPGBSIM bagi tujuan pelaporan rasmi KPM/Jabatan Agama.
    b) Memperkukuh modul Karamah Insaniah serta prosedur operasi standard (SOP) pencegahan buli dan sahsiah murid.
    c) Memastikan dokumentasi audit kewangan dan permohonan pembaharuan pendaftaran institusi diselaraskan mengikut tempoh masa yang ditetapkan.

4. Pihak Majlis amat mengharapkan kerjasama padu Yang Berusaha Tuan/Puan agar garis panduan ini dapat dipatuhi dan disampaikan kepada seluruh warga pendidik di institusi masing-masing.`,
    defaultClosing: `Kerjasama dan keprihatinan Yang Berusaha Tuan/Puan dalam mendokong ketetapan pekeliling ini amatlah dihargai dan disanjung tinggi.`,
    defaultSlogan: `"BERKHIDMAT UNTUK AGAMA, BANGSA DAN NEGARA"`,
  },

  SURAT_RASMI_CUSTOM: {
    type: 'SURAT_RASMI_CUSTOM',
    label: 'Surat Rasmi Kustom (Bebas / Khas)',
    badge: 'Kustom Bebas',
    description: 'Template surat rasmi format standard MPGBSIM dengan ruang teks yang boleh diedit sepenuhnya mengikut keperluan urusan pentadbiran.',
    defaultRefPrefix: 'MPGBSIM/PENT/2026',
    defaultSubject: 'MAKLUMAN RASMI PENTADBIRAN MAJLIS PENGETUA GURU BESAR SEKOLAH ISLAM MALAYSIA (MPGBSIM)',
    defaultSalutation: 'Yang Berusaha Pengetua / Guru Besar,',
    defaultBodyText: `Dengan segala hormatnya perkara di atas adalah dirujuk.

2. Adalah dimaklumkan bahawa pihak Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) ingin menyampaikan makluman rasmi berkaitan hal ehwal pentadbiran dan perancangan strategik institusi sekolah ahli bagi sesi semasa.

3. [Sila masukkan perenggan huraian atau isi kandungan surat rasmi anda di sini...]

4. Sebarang pertanyaan atau urusan lanjut berhubung perkara ini, pihak Yang Berusaha Tuan/Puan boleh menghubungi Urus Setia Sekretariat Kebangsaan MPGBSIM melalui talian 03-4251 6157 atau emel rasmi sekretariat@mpgbsim.org.`,
    defaultClosing: `Sekian untuk makluman dan tindakan pihak tuan/puan. Segala kerjasama dan perhatian yang diberikan didahului dengan ucapan terima kasih.`,
    defaultSlogan: `"MEMACU KEPIMPINAN RABBANI, MEMBINA GENERASI SOLEH WA MUSLEH"`,
  },
};
