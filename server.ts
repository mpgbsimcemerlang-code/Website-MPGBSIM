import express from 'express';
import fs from 'fs';
import path from 'path';
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

function loadFirebaseConfig(): { projectId: string; firestoreDatabaseId: string } {
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return {
        projectId: parsed.projectId || 'compact-vigil-cf6jr',
        firestoreDatabaseId:
          parsed.firestoreDatabaseId || 'ai-studio-mpgbsimmajlispen-d6e7972c-8fd2-4adc-81e6-ff46f648dee7',
      };
    }
  } catch (err) {
    console.warn('Failed to read firebase-applet-config.json:', err);
  }
  return {
    projectId: 'compact-vigil-cf6jr',
    firestoreDatabaseId: 'ai-studio-mpgbsimmajlispen-d6e7972c-8fd2-4adc-81e6-ff46f648dee7',
  };
}

const firebaseConfig = loadFirebaseConfig();

// Short-lived cache for news metadata so HTML + /api/og-image requests are fast
const newsCache = new Map<string, { item: ServerNewsMeta; expiresAt: number }>();

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

async function fetchNewsById(newsId: string): Promise<ServerNewsMeta | null> {
  if (!newsId) return null;
  const cleanId = newsId.trim();

  const cached = newsCache.get(cleanId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.item;
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      firebaseConfig.projectId
    )}/databases/${encodeURIComponent(firebaseConfig.firestoreDatabaseId)}/documents/news/${encodeURIComponent(
      cleanId
    )}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const docData: any = await response.json();
      const fields = docData?.fields || {};
      const title = extractFirestoreString(fields.title);
      const summary = extractFirestoreString(fields.summary);
      const content = extractFirestoreString(fields.content);
      const primaryImage = extractFirestoreString(fields.imageUrl);
      const fallbackGalleryImage = extractFirstArrayString(fields.additionalImages);
      const imageUrl = primaryImage || fallbackGalleryImage || '/mpgbsim-official-logo.png';

      if (title) {
        const meta: ServerNewsMeta = {
          id: cleanId,
          title,
          summary: summary || (content ? content.slice(0, 220) : ''),
          content,
          imageUrl,
          category: extractFirestoreString(fields.category),
          date: extractFirestoreString(fields.date),
          author: extractFirestoreString(fields.author),
          schoolName: extractFirestoreString(fields.schoolName),
        };
        newsCache.set(cleanId, { item: meta, expiresAt: Date.now() + 60_000 });
        return meta;
      }
    }
  } catch (err) {
    // Fallback to default news if Firestore fetch times out or fails
  }

  if (DEFAULT_NEWS_FALLBACK[cleanId]) {
    return DEFAULT_NEWS_FALLBACK[cleanId];
  }

  return null;
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

  const shareUrl = `${origin}/?berita=${encodeURIComponent(news.id)}`;
  const ogImageUrl = `${origin}/api/og-image/${encodeURIComponent(news.id)}`;

  const safeTitle = escapeHtmlAttr(fullTitle);
  const safeDesc = escapeHtmlAttr(shortDesc);
  const safeUrl = escapeHtmlAttr(shareUrl);
  const safeImage = escapeHtmlAttr(ogImageUrl);

  let updated = html;

  // Replace <title>
  updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  // Replace primary meta tags
  updated = updated.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="title" content="${safeTitle}" />`
  );
  updated = updated.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );
  updated = updated.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${safeUrl}" />`
  );

  // Replace OpenGraph tags for WhatsApp, Telegram, Facebook
  updated = updated.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="article" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${safeUrl}" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${safeImage}" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:secure_url" content="${safeImage}" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:type" content="image/jpeg" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:alt" content="${safeTitle}" />`
  );

  // Replace Twitter / Telegram large card tags
  updated = updated.replace(
    /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:url" content="${safeUrl}" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${safeImage}" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image:alt" content="${safeTitle}" />`
  );

  return updated;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Dynamic OpenGraph Image endpoint for WhatsApp, Telegram & Facebook crawlers
  // Converts Firestore base64 data:image URIs or remote URLs into a direct binary image response
  app.get('/api/og-image/:newsId', async (req, res) => {
    const rawId = (req.params.newsId || '').replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const news = await fetchNewsById(rawId);
    const imageUrl = news?.imageUrl || '';

    try {
      // Case A: Base64 data URI stored in Firestore (e.g., data:image/jpeg;base64,...)
      if (imageUrl.startsWith('data:image/')) {
        const matches = imageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
        if (matches && matches[2]) {
          const mimeType = matches[1] || 'image/jpeg';
          const buffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Length', buffer.length.toString());
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.status(200).send(buffer);
          return;
        }
      }

      // Case B: External HTTP/HTTPS image URL
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const imgResp = await fetch(imageUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (imgResp.ok) {
          const contentType = imgResp.headers.get('content-type') || 'image/jpeg';
          const arrayBuf = await imgResp.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', buffer.length.toString());
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.status(200).send(buffer);
          return;
        } else {
          res.redirect(302, imageUrl);
          return;
        }
      }
    } catch (err) {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        res.redirect(302, imageUrl);
        return;
      }
    }

    // Case C: Fallback to official MPGBSIM logo
    const fallbackLogoPath = path.resolve(
      __dirname,
      isProd ? 'dist/mpgbsim-official-logo.png' : 'public/mpgbsim-official-logo.png'
    );
    if (fs.existsSync(fallbackLogoPath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(fallbackLogoPath);
    } else {
      res.status(404).end();
    }
  });

  // 2. JSON metadata endpoint for news preview inspection
  app.get('/api/news-meta/:newsId', async (req, res) => {
    const news = await fetchNewsById(req.params.newsId);
    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }
    const origin = getRequestOrigin(req);
    res.json({
      id: news.id,
      title: `${news.title} | MPGBSIM`,
      description: news.summary,
      shareUrl: `${origin}/?berita=${encodeURIComponent(news.id)}`,
      ogImageUrl: `${origin}/api/og-image/${encodeURIComponent(news.id)}`,
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Intercept root or /berita/:id requests BEFORE vite middlewares if news param is present
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
