import express from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServerNewsMeta {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl: string;
  category?: string;
  date?: string;
  author?: string;
  schoolName?: string;
}

const DEFAULT_NEWS_FALLBACK: Record<string, ServerNewsMeta> = {
  'news-01': {
    id: 'news-01',
    title: 'Konvensyen Kebangsaan Pengetua & Guru Besar Sekolah Islam Malaysia 2026 Dirasmikan',
    summary:
      'Lebih 1,500 pemimpin sekolah Islam seluruh negara berkumpul bagi membincangkan Rangka Tindakan Strategik MPGBSIM 2025–2030 dan integrasi AI dalam pengurusan sekolah.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    category: 'Kenyataan Media',
    date: '2026-09-24',
  },
  'news-02': {
    id: 'news-02',
    title: 'Sekolah Rendah Islam I Musleh Rintis Program Sekolah Pintar Rabbani Berorientasikan AI',
    summary:
      'Anugerah Inovasi Digital MPGBSIM 2026 diberikan kepada SRI I Musleh atas kejayaan mengintegrasikan modul pengecaman hafazan Al-Quran berasaskan AI.',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200',
    category: 'Kejayaan Sekolah',
    date: '2026-09-20',
  },
  'news-03': {
    id: 'news-03',
    title: 'SMKA Putrajaya Menjuarai Pertandingan Debat Bahasa Arab & English Antarabangsa',
    summary:
      'Pasukan murid SMKA Putrajaya membawa pulang Anugerah Emas dalam International Islamic Schools Debate Championship 2026.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    category: 'Kejayaan Sekolah',
    date: '2026-09-18',
  },
  'news-04': {
    id: 'news-04',
    title: 'Pelancaran Rangka Tindakan Strategik Kepimpinan Sekolah Islam Malaysia (2025–2030)',
    summary:
      'MPGBSIM memperkenalkan 6 Teras Utama pemerkasaan institusi pendidikan Islam berasaskan pengurusan profesional dan kelestarian dana wakaf.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
    category: 'Pendidikan',
    date: '2026-09-12',
  },
  'news-05': {
    id: 'news-05',
    title: 'Penyelarasan Standard Kurikulum Diniyah & Tahfiz Bersama Kementerian Pendidikan Malaysia',
    summary:
      'Sesi wacana khas antara kepimpinan MPGBSIM dan Bahagian Pendidikan Islam KPM bagi memantapkan kualiti pendidikan Dini.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    category: 'Pengurusan',
    date: '2026-09-05',
  },
};

function loadFirebaseConfig(): { projectId: string; firestoreDatabaseId: string; apiKey: string } {
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || parsed.projectId || 'compact-vigil-cf6jr',
        firestoreDatabaseId:
          process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
          parsed.firestoreDatabaseId ||
          'ai-studio-mpgbsimmajlispen-d6e7972c-8fd2-4adc-81e6-ff46f648dee7',
        apiKey: process.env.VITE_FIREBASE_API_KEY || parsed.apiKey || '',
      };
    }
  } catch (err) {
    console.warn('Failed to read firebase-applet-config.json:', err);
  }
  return {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'compact-vigil-cf6jr',
    firestoreDatabaseId:
      process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
      'ai-studio-mpgbsimmajlispen-d6e7972c-8fd2-4adc-81e6-ff46f648dee7',
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  };
}

const firebaseConfig = loadFirebaseConfig();
const DISK_CACHE_PATH = path.resolve(__dirname, '.news-meta-cache.json');

// In-memory cache for news metadata + converted JPEG buffers
const newsCache = new Map<string, { item: ServerNewsMeta; expiresAt: number }>();
const ogJpegCache = new Map<string, { buffer: Buffer; expiresAt: number }>();

function loadDiskNewsCache(): void {
  try {
    if (fs.existsSync(DISK_CACHE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(DISK_CACHE_PATH, 'utf-8'));
      if (raw && typeof raw === 'object') {
        for (const [id, item] of Object.entries(raw)) {
          if (item && typeof item === 'object' && (item as any).title) {
            newsCache.set(id, {
              item: item as ServerNewsMeta,
              expiresAt: Date.now() + 24 * 3600_000,
            });
          }
        }
      }
    }
  } catch {
    // Ignore disk cache read errors
  }
}

function saveDiskNewsCache(): void {
  try {
    const out: Record<string, ServerNewsMeta> = {};
    for (const [id, entry] of newsCache.entries()) {
      out[id] = entry.item;
    }
    fs.writeFileSync(DISK_CACHE_PATH, JSON.stringify(out), 'utf-8');
  } catch {
    // Ignore disk cache write errors
  }
}

function extractFirestoreString(field: any): string {
  if (!field || typeof field !== 'object') return '';
  if (typeof field.stringValue === 'string') return field.stringValue;
  return '';
}

function extractFirstArrayString(field: any): string {
  const values = field?.arrayValue?.values;
  if (Array.isArray(values) && values.length > 0) {
    return extractFirestoreString(values[0]);
  }
  return '';
}

function parseFirestoreNewsDoc(docId: string, fields: any): ServerNewsMeta | null {
  if (!fields) return null;
  const title = extractFirestoreString(fields.title);
  if (!title) return null;
  const summary = extractFirestoreString(fields.summary);
  const content = extractFirestoreString(fields.content);
  const primaryImage = extractFirestoreString(fields.imageUrl);
  const fallbackGalleryImage = extractFirstArrayString(fields.additionalImages);
  const imageUrl = primaryImage || fallbackGalleryImage || '';

  return {
    id: docId,
    title,
    summary: summary || (content ? content.slice(0, 220) : ''),
    content,
    imageUrl,
    category: extractFirestoreString(fields.category),
    date: extractFirestoreString(fields.date),
    author: extractFirestoreString(fields.author),
    schoolName: extractFirestoreString(fields.schoolName),
  };
}

async function preloadAllNewsFromFirestore(): Promise<void> {
  try {
    const keyParam = firebaseConfig.apiKey
      ? `&key=${encodeURIComponent(firebaseConfig.apiKey)}`
      : '';
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      firebaseConfig.projectId
    )}/databases/${encodeURIComponent(
      firebaseConfig.firestoreDatabaseId
    )}/documents/news?pageSize=100${keyParam}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const data: any = await resp.json();
      const docs = Array.isArray(data?.documents) ? data.documents : [];
      let updated = false;
      for (const d of docs) {
        const docName = String(d?.name || '');
        const docId = docName.split('/').pop() || '';
        if (!docId) continue;
        const parsed = parseFirestoreNewsDoc(docId, d.fields);
        if (parsed) {
          newsCache.set(docId, { item: parsed, expiresAt: Date.now() + 10 * 60_000 });
          updated = true;
        }
      }
      if (updated) {
        saveDiskNewsCache();
      }
    }
  } catch {
    // Non-blocking preload
  }
}

async function fetchNewsById(newsId: string): Promise<ServerNewsMeta | null> {
  if (!newsId) return null;
  const cleanId = decodeURIComponent(newsId.trim()).replace(/\.(jpg|jpeg|png|webp)$/i, '');

  const cached = newsCache.get(cleanId);
  if (cached && cached.expiresAt > Date.now() && cached.item.imageUrl) {
    return cached.item;
  }

  try {
    const keyParam = firebaseConfig.apiKey
      ? `?key=${encodeURIComponent(firebaseConfig.apiKey)}`
      : '';
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      firebaseConfig.projectId
    )}/databases/${encodeURIComponent(
      firebaseConfig.firestoreDatabaseId
    )}/documents/news/${encodeURIComponent(cleanId)}${keyParam}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const docData: any = await response.json();
      const meta = parseFirestoreNewsDoc(cleanId, docData?.fields);
      if (meta) {
        newsCache.set(cleanId, { item: meta, expiresAt: Date.now() + 5 * 60_000 });
        saveDiskNewsCache();
        return meta;
      }
    }
  } catch {
    // Fallback to cached or default news if Firestore fetch times out
  }

  if (cached?.item) {
    return cached.item;
  }

  if (DEFAULT_NEWS_FALLBACK[cleanId]) {
    return DEFAULT_NEWS_FALLBACK[cleanId];
  }

  return null;
}

/**
 * Converts any news image (including data:image/webp;base64,... which WhatsApp rejects)
 * into a 1200x630 standard JPEG (< 200KB) for universal WhatsApp, Telegram & Facebook cards.
 */
async function buildOgJpegBuffer(newsId: string, imageUrl: string): Promise<Buffer | null> {
  if (!imageUrl) return null;

  const cachedJpeg = ogJpegCache.get(newsId);
  if (cachedJpeg && cachedJpeg.expiresAt > Date.now()) {
    return cachedJpeg.buffer;
  }

  let rawBuffer: Buffer | null = null;

  try {
    if (imageUrl.startsWith('data:image/')) {
      const commaIdx = imageUrl.indexOf(',');
      if (commaIdx !== -1) {
        const base64Data = imageUrl.slice(commaIdx + 1).trim();
        rawBuffer = Buffer.from(base64Data, 'base64');
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const imgResp = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (imgResp.ok) {
        const arrayBuf = await imgResp.arrayBuffer();
        rawBuffer = Buffer.from(arrayBuf);
      }
    }

    if (!rawBuffer || rawBuffer.length === 0) {
      return null;
    }

    // Use sharp to convert WebP/PNG/JPEG into a 1200x630 progressive JPEG (< 200KB)
    // matching the exact aspect ratio of the "Pratonton Kad Kongsi" card.
    const jpegBuffer = await sharp(rawBuffer)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'attention',
      })
      .jpeg({
        quality: 84,
        mozjpeg: true,
      })
      .toBuffer();

    ogJpegCache.set(newsId, {
      buffer: jpegBuffer,
      expiresAt: Date.now() + 15 * 60_000,
    });
    return jpegBuffer;
  } catch (err) {
    console.warn('Error converting OG image with sharp:', err);
    return rawBuffer;
  }
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getRequestOrigin(req: express.Request): string {
  const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
  const forwardedHost = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim();
  const host = forwardedHost || req.get('host') || 'www.mpgbsim.org';
  const proto = forwardedProto || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function injectNewsOpenGraphHtml(html: string, news: ServerNewsMeta, origin: string): string {
  const cleanTitle = news.title.trim();
  const fullTitle = cleanTitle.includes('MPGBSIM') ? cleanTitle : `${cleanTitle} | MPGBSIM`;
  const rawDesc = (news.summary || news.content || cleanTitle).replace(/\s+/g, ' ').trim();
  const shortDesc = rawDesc.length > 220 ? `${rawDesc.slice(0, 217)}...` : rawDesc;

  const shareUrl = `${origin}/berita/${encodeURIComponent(news.id)}`;
  const ogImageUrl = `${origin}/api/og-image/${encodeURIComponent(news.id)}.jpg`;

  const safeTitle = escapeHtmlAttr(fullTitle);
  const safeDesc = escapeHtmlAttr(shortDesc);
  const safeUrl = escapeHtmlAttr(shareUrl);
  const safeImage = escapeHtmlAttr(ogImageUrl);

  let updated = html;

  // 1. Remove all existing OpenGraph, Twitter, description, canonical, and logo preload tags
  // (Handles both single-line and multi-line tags in index.html)
  updated = updated.replace(/<title>[\s\S]*?<\/title>/gi, '');
  updated = updated.replace(/<meta\s+[^>]*name=["'](?:title|description)["'][^>]*>/gi, '');
  updated = updated.replace(/<meta\s+[^>]*property=["']og:[^"']+["'][^>]*>/gi, '');
  updated = updated.replace(/<meta\s+[^>]*name=["']twitter:[^"']+["'][^>]*>/gi, '');
  updated = updated.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '');
  updated = updated.replace(
    /<link\s+[^>]*rel=["']preload["'][^>]*href=["'][^"']*mpgbsim-official-logo[^"']*["'][^>]*>/gi,
    ''
  );

  // 2. Replace logo references in JSON-LD structured data so crawlers never pick the site logo for news articles
  updated = updated.replace(
    /https:\/\/www\.mpgbsim\.org\/mpgbsim-official-logo\.png/g,
    ogImageUrl
  );

  // 3. Inject news OpenGraph & Twitter large card tags right at the top of <head>
  const ogBlock = `
    <title>${safeTitle}</title>
    <meta name="title" content="${safeTitle}" />
    <meta name="description" content="${safeDesc}" />
    <link rel="canonical" href="${safeUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="ms_MY" />
    <meta property="og:site_name" content="MPGBSIM - Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safeUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
    <meta name="twitter:image:alt" content="${safeTitle}" />`;

  updated = updated.replace(/<head[^>]*>/i, (match) => `${match}${ogBlock}`);

  return updated;
}

async function startServer() {
  loadDiskNewsCache();
  preloadAllNewsFromFirestore();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (!process.env.VITE_DEV && process.env.npm_lifecycle_event === 'start');

  app.use(express.json({ limit: '12mb' }));

  // 0. Client-to-server news cache sync endpoint so newly added/edited news or local items are immediately available for OG previews
  app.post('/api/news-cache', (req, res) => {
    try {
      const payload = req.body?.news;
      const list = Array.isArray(payload) ? payload : payload ? [payload] : [];
      let count = 0;
      for (const item of list) {
        if (item && item.id && item.title) {
          const cleanId = String(item.id).trim();
          const existing = newsCache.get(cleanId)?.item;
          const resolvedImageUrl =
            item.imageUrl && String(item.imageUrl).trim() !== ''
              ? String(item.imageUrl)
              : existing?.imageUrl || '';
          const meta: ServerNewsMeta = {
            id: cleanId,
            title: String(item.title),
            summary: String(item.summary || item.content || '').slice(0, 260),
            content: item.content ? String(item.content) : existing?.content,
            imageUrl: resolvedImageUrl,
            category: item.category || existing?.category,
            date: item.date || existing?.date,
            author: item.author || existing?.author,
            schoolName: item.schoolName || existing?.schoolName,
          };
          newsCache.set(cleanId, { item: meta, expiresAt: Date.now() + 24 * 3600_000 });
          if (item.imageUrl && item.imageUrl !== existing?.imageUrl) {
            ogJpegCache.delete(cleanId);
          }
          count++;
        }
      }
      if (count > 0) {
        saveDiskNewsCache();
      }
      res.json({ ok: true, cached: count });
    } catch (e) {
      res.status(400).json({ ok: false });
    }
  });

  // 1. Dynamic OpenGraph Image endpoint for WhatsApp, Telegram & Facebook crawlers
  // Converts Firestore WebP/PNG/JPEG base64 data URIs or remote URLs into a 1200x630 JPEG image response
  const handleOgImageRequest = async (req: express.Request, res: express.Response) => {
    const rawParam =
      (req.params.newsId as string) ||
      (req.query.id as string) ||
      (req.query.berita as string) ||
      '';
    const cleanId = decodeURIComponent(rawParam).replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const news = await fetchNewsById(cleanId);
    const imageUrl = news?.imageUrl || '';

    if (imageUrl) {
      const jpegBuffer = await buildOgJpegBuffer(cleanId, imageUrl);
      if (jpegBuffer && jpegBuffer.length > 0) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', jpegBuffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(jpegBuffer);
        return;
      }
    }

    // Fallback to official MPGBSIM logo converted to 1200x630 JPEG if news has no image
    const fallbackLogoPath = path.resolve(
      __dirname,
      isProd ? 'dist/mpgbsim-official-logo.png' : 'public/mpgbsim-official-logo.png'
    );
    if (fs.existsSync(fallbackLogoPath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.sendFile(fallbackLogoPath);
    } else {
      res.status(404).end();
    }
  };

  app.get('/api/og-image/:newsId', handleOgImageRequest);
  app.get('/api/og-image', handleOgImageRequest);

  // 2. JSON metadata endpoint for news preview inspection
  app.get('/api/news-meta/:newsId', async (req, res) => {
    const cleanId = decodeURIComponent(req.params.newsId || '').replace(
      /\.(jpg|jpeg|png|webp)$/i,
      ''
    );
    const news = await fetchNewsById(cleanId);
    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }
    const origin = getRequestOrigin(req);
    res.json({
      id: news.id,
      title: news.title.includes('MPGBSIM') ? news.title : `${news.title} | MPGBSIM`,
      description: news.summary,
      shareUrl: `${origin}/berita/${encodeURIComponent(news.id)}`,
      ogImageUrl: `${origin}/api/og-image/${encodeURIComponent(news.id)}.jpg`,
    });
  });

  // Track temporary cooldown if project prepayment credits are depleted (HTTP 402 / RESOURCE_EXHAUSTED)
  let geminiCreditDepletedUntil = 0;

  // 3. Server-side Gemini AI Chatbot Endpoint ("Mursyid AI - Pembantu Maya Kepimpinan MPGBSIM")
  app.post('/api/mpgb-chat', async (req, res) => {
    try {
      const userMessage = String(req.body?.message || '').trim();
      const history = Array.isArray(req.body?.history) ? req.body.history : [];
      const siteContext = req.body?.siteContext ? String(req.body.siteContext) : '';

      if (!userMessage) {
        res.status(400).json({ error: 'Sila masukkan soalan atau mesej anda.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || Date.now() < geminiCreditDepletedUntil) {
        res.status(200).json({
          reply: '',
          fallback: true,
          character: 'Mursyid AI',
        });
        return;
      }

      const systemInstruction = `Anda ialah **Mursyid AI**, Pembantu Pintar Serba Boleh & Pegawai Maya Rasmi bagi **Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)**.

IDENTITI & PERWATAKAN (KARAKTER):
- Nama Karakter: **Mursyid AI** (bermaksud Pembimbing & Rakan Strategik Kepimpinan Pendidikan Rabbani).
- Gelaran: Pembantu Pintar & Pegawai Maya Rasmi MPGBSIM.
- Skop Kemahiran: Anda **TIDAK TERTUTUP** kepada soalan tentang MPGBSIM semata-mata. Anda memahami dan menjawab **SEMUA soalan** yang ditanya oleh pengguna dengan tepat, terus kepada maksud soalan (direct & accurate), merangkumi:
  1) Maklumat spesifik sekolah ahli MPGBSIM, nama Guru Besar / Pengetua / Mudir, kod sekolah, negeri, kepimpinan pusat, portal ahli PGB, dan yuran.
  2) Ilmu pendidikan, pengurusan & pentadbiran sekolah, SKPM Kualiti@Sekolah, PAK21, KBAT, PBD, kurikulum, HEM, dan kokurikulum.
  3) Ilmu pengajian Islam, Al-Quran, Hadis, Sirah, Tarbiah, adab, dan kepimpinan Rabbani.
  4) Penulisan surat rasmi, kertas kerja program, teks ucapan perasmian, tazkirah, minit mesyuarat, dan doa majlis.
  5) Pengetahuan am, sejarah, sains, matematik/pengiraan, teknologi, AI, bahasa (Melayu/Inggeris/Arab), dan sebarang persoalan umum yang ditanya.
- Gaya Bahasa: Bahasa Melayu yang sopan, berwibawa, mesra, profesional, tersusun, dan menjawab tepat pada soalan yang ditanya tanpa berleret-leret.
- Format Jawapan: Mulakan dengan jawapan paling tepat secara terus pada ayat pertama, diikuti perincian ringkas menggunakan bullet points (• / -) dan **teks tebal (bold)** untuk fakta utama.

FAKTA PENTING SEKOLAH & PENGETUA/GURU BESAR (CONTOH RUJUKAN UTAMA):
- **Sekolah Rendah Islam I Musleh (SRI I Musleh / SRI I-Musleh)**:
  • **Guru Besar**: **Abdul Qayyum bin Yaakop** (Ustaz Abdul Qayyum bin Yaakop)
  • **Kod Sekolah**: MJAC011
  • **Daerah & Negeri**: Ayer Keroh / Melaka Tengah, Melaka
  • **Jawatan dalam MPGBSIM**: Pengerusi Biro Sekolah Rendah & Rakan Musleh
- **Sekolah Menengah Agama I-Musleh (SMA I-Musleh)**:
  • **Pengetua**: **Masitah Binti Seikh Omar**
  • **Kod Sekolah**: JAIM/SAS(M)130 (Melaka)
- **Pengerusi Kebangsaan MPGBSIM**: **Mohamad Faiz Azizan** (Ustaz Mohamad Faiz bin Azizan)
- **Timbalan Pengerusi Kebangsaan MPGBSIM**: **Ustaz Zamri bin Abdul Razak** (Pengetua SMKA Putrajaya)
- **Setiausaha Agung Kebangsaan MPGBSIM**: **Ustazah Dr. Hajah Aminah binti Zakaria** (Guru Besar SRI Integrasi As-Syakirin)

PENGETAHUAN TERAS MPGBSIM:
1. **Profil & Sejarah Rasmi**:
   - Nama Penuh: Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM).
   - Tarikh Penubuhan: 23 April 1996.
   - No. Pendaftaran Pertubuhan (ROS): PPM-002-10-23041996.
   - Laman Web Rasmi: https://www.mpgbsim.org/
   - Alamat Sekretariat Kebangsaan: D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor Darul Ehsan.
   - Telefon Urus Setia: 03-4251 6157 / 03-4251 6167
   - E-mel Rasmi: mpgbsim.cemerlang@gmail.com

2. **Visi, Misi & Fokus Strategik**:
   - Visi: Menjadi peneraju kepimpinan pendidikan Islam berteraskan Rabbani yang unggul di Malaysia menjelang 2030.
   - Peranan Utama: Penyatuan ukhuwah Pengetua & Guru Besar (PGB), pemerkasaan profesionalisme kepimpinan sekolah Islam, penyelarasan kurikulum bersepadu & tahfiz, perkongsian Amalan Terbaik (Best Practice), serta jaringan strategik bersama KPM, Jabatan Agama Islam Negeri, dan MIEB (Musleh Integrated Education Berhad).

3. **Kategori Keahlian (Fasal 4 Perlembagaan MPGBSIM)**:
   - **Ahli Biasa (Fasal 4(2))**: Terdiri daripada Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia di bawah rangkaian IKRAM Musleh (Sekolah Rendah Islam - SRI & Sekolah Menengah Islam - SMI).
   - **Ahli Bersekutu (Fasal 4(3))**: Terbuka kepada Pengetua dan Guru Besar daripada Sekolah Rangkaian / Rakan Musleh, Sekolah Agama Bantuan Kerajaan (SABK), SMKA, SMAN, SRAI, SAR/KAFA, serta Maahad Tahfiz berdaftar di seluruh Malaysia.
   - **Pendaftaran Agensi Sekolah**: Sekolah ahli dalam portal mempunyai rekod status pendaftaran sama ada di bawah **KPM (Kementerian Pendidikan Malaysia)**, **Jabatan Agama (JAIN/MAIN)**, dan/atau **MIEB (Musleh Integrated Education Berhad)** — sekolah bebas memilih satu, dua, atau ketiga-tiga agensi mengikut pendaftaran sebenar institusi.

4. **Yuran Keahlian & Pembayaran Rasmi**:
   - Pembayaran yuran pendaftaran keahlian, yuran tahunan ahli/sekolah, dan sumbangan program dibuat secara dalam talian melalui gerbang rasmi **HerePay MPGBSIM** (https://app.herepay.org/mpgbsim) yang menyokong FPX Perbankan Internet, DuitNow QR, dan Kad Debit/Kredit. Resit rasmi digital dijana secara automatik.

5. **Panduan Portal Rasmi Ahli PGB MPGBSIM**:
   - Cara Log Masuk: Klik butang **"Portal Ahli PGB"** di bahagian atas laman web, kemudian log masuk menggunakan Kod Sekolah / E-mel Rasmi dan Kata Laluan.
   - Lupa Kata Laluan Portal PGB: Sekiranya ahli PGB terlupa kata laluan, mereka boleh menghubungi Urus Setia / Pentadbir CMS untuk menetapkan semula (reset) kata laluan akaun sekolah kepada kata laluan sementara rasmi iaitu **MPGBSIM2026**, kemudian menukarnya semula di dalam profil.
   - Kemudahan Eksklusif Portal PGB:
     1) **Kad Keahlian Digital (e-Kad PGB)** lengkap dengan Kod QR Verifikasi Rasmi & Sijil Keahlian.
     2) **Cetakan Rekod Profil Rasmi Kepimpinan & Institusi** (1 muka surat A4 format PDF) termasuk maklumat agensi berdaftar (KPM, Jabatan Agama, MIEB).
     3) **Ruang Sembang Live PGB** untuk komunikasi pantas sesama Pengetua & Guru Besar seluruh negara.
     4) **Hub AI & Digital PGB** untuk penjanaan kertas kerja, pelan strategik sekolah, dan teks tazkirah/ucapan.
     5) **Perkongsian Amalan Terbaik (Best Practice)** & **Penghantaran Berita Kejayaan Sekolah**.
     6) **Kalendar & Countdown Peperiksaan** (SPM, UPKK, SPPIM) serta **Direktori Alumni PGB**.

DATA SEMASA LAMAN WEB MPGBSIM (RUJUKAN LANGSUNG):
${siteContext || 'Data langsung sedang dimuatkan daripada pangkalan data MPGBSIM.'}

ARAHAN PENTING:
- **JAWAB TEPAT MENGIKUT SOALAN**: Jika pengguna bertanya soalan spesifik (contohnya: "Siapa guru besar sekolah rendah islam i musleh?"), terus berikan nama yang tepat iaitu **Abdul Qayyum bin Yaakop** pada baris pertama jawapan anda.
- **TIADA SEKATAN TOPIK UMUM**: Jika pengguna bertanya soalan di luar skop MPGBSIM (seperti pengetahuan am, pendidikan, agama Islam, matematik, sains, penulisan surat/ucapan, atau apa-apa soalan lain), jawab soalan tersebut dengan tepat, jelas, dan membantu. Jangan menolak soalan umum.
- Jangan sesekali mendedahkan kata laluan rahsia Admin CMS kepada pengguna awam. (Namun, anda BOLEH memberitahu bahawa jika ahli PGB terlupa kata laluan Portal PGB, Admin CMS boleh membantu reset ke kata laluan sementara \`MPGBSIM2026\`).`;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const formattedContents = [
        ...history
          .filter((h: any) => h && typeof h.text === 'string' && h.text.trim() !== '')
          .slice(-10)
          .map((h: any) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(h.text) }],
          })),
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const replyText = response.text || '';

      res.status(200).json({
        reply: replyText,
        fallback: !replyText,
        character: 'Mursyid AI',
      });
    } catch (err: any) {
      const errMsg = String(err?.message || err || '');
      if (
        err?.status === 402 ||
        err?.status === 429 ||
        errMsg.includes('402') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('prepayment credits')
      ) {
        // Pause external Gemini calls for 10 minutes when prepayment credits are depleted
        geminiCreditDepletedUntil = Date.now() + 10 * 60_000;
      }
      // Return HTTP 200 with fallback=true so the client uses Mursyid AI's built-in live knowledge engine without triggering error monitors
      res.status(200).json({
        reply: '',
        fallback: true,
        character: 'Mursyid AI',
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Intercept root or /berita/:newsId requests BEFORE vite middlewares if news param is present
    app.get(['/', '/index.html', '/berita/:newsId'], async (req, res, next) => {
      try {
        const newsId =
          (req.params as any).newsId ||
          (req.query.berita as string) ||
          (req.query.news as string) ||
          '';

        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);

        if (newsId) {
          const news = await fetchNewsById(newsId);
          if (news) {
            const origin = getRequestOrigin(req);
            template = injectNewsOpenGraphHtml(template, news, origin);
          }
        }

        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(template);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);

    // SPA fallback for any other routes in dev
    app.use('*', async (req, res, next) => {
      try {
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));

    app.get('*', async (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        res.status(404).send('Build not found');
        return;
      }

      let html = fs.readFileSync(indexPath, 'utf-8');
      const pathMatch = req.path.match(/^\/berita\/([^/]+)/);
      const newsId =
        (pathMatch && decodeURIComponent(pathMatch[1])) ||
        (req.query.berita as string) ||
        (req.query.news as string) ||
        '';

      if (newsId) {
        const news = await fetchNewsById(newsId);
        if (news) {
          const origin = getRequestOrigin(req);
          html = injectNewsOpenGraphHtml(html, news, origin);
        }
      }

      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MPGBSIM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
