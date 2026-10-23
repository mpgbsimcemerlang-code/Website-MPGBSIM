import express from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

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
  const PORT = 3000;
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
