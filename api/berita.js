const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'compact-vigil-cf6jr';
const DATABASE_ID =
  process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  'ai-studio-mpgbsimmajlispen-d6e7972c-8fd2-4adc-81e6-ff46f648dee7';
const API_KEY =
  process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCoUNSSoxIocRQBwoQfqQE8_svuFXYMtZM';

function extractStr(field) {
  if (!field || typeof field !== 'object') return '';
  return typeof field.stringValue === 'string' ? field.stringValue : '';
}

function escapeAttr(val) {
  return String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  const rawId = String(req.query?.id || req.query?.berita || req.query?.news || '')
    .trim()
    .replace(/\.(jpg|jpeg|png|webp)$/i, '');

  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || 'www.mpgbsim.org')
    .split(',')[0]
    .trim();
  const origin = `${proto}://${host}`;

  let title = 'MPGBSIM - Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia';
  let summary =
    'Portal Rasmi Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM). Direktori Sekolah Islam, Portal Ahli PGB, Takwim & Amalan Terbaik.';

  if (rawId) {
    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
        PROJECT_ID
      )}/databases/${encodeURIComponent(DATABASE_ID)}/documents/news/${encodeURIComponent(
        rawId
      )}?key=${encodeURIComponent(API_KEY)}`;

      const fsResp = await fetch(firestoreUrl);
      if (fsResp.ok) {
        const docData = await fsResp.json();
        const fields = docData?.fields || {};
        const docTitle = extractStr(fields.title);
        const docSummary = extractStr(fields.summary) || extractStr(fields.content);
        if (docTitle) {
          title = docTitle.includes('MPGBSIM') ? docTitle : `${docTitle} | MPGBSIM`;
        }
        if (docSummary) {
          const clean = docSummary.replace(/\s+/g, ' ').trim();
          summary = clean.length > 220 ? `${clean.slice(0, 217)}...` : clean;
        }
      }
    } catch {
      // Fallback to default title/summary
    }
  }

  const shareUrl = rawId ? `${origin}/berita/${encodeURIComponent(rawId)}` : `${origin}/`;
  const ogImageUrl = rawId
    ? `${origin}/api/og-image/${encodeURIComponent(rawId)}.jpg`
    : `${origin}/mpgbsim-official-logo.png`;

  const safeTitle = escapeAttr(title);
  const safeDesc = escapeAttr(summary);
  const safeUrl = escapeAttr(shareUrl);
  const safeImage = escapeAttr(ogImageUrl);
  const clientRedirectUrl = rawId ? `/?berita=${encodeURIComponent(rawId)}` : '/';

  const html = `<!doctype html>
<html lang="ms-MY">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
    <meta name="twitter:image:alt" content="${safeTitle}" />
    <script>
      if (!/bot|crawl|spider|whatsapp|telegram|facebook|twitter|slack|discord|linkedin|preview|skype/i.test(navigator.userAgent)) {
        window.location.replace(${JSON.stringify(clientRedirectUrl)});
      }
    </script>
  </head>
  <body style="font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;">
    <div>
      <img src="${safeImage}" alt="${safeTitle}" style="max-width:480px;width:100%;border-radius:12px;margin-bottom:16px;" />
      <h1 style="font-size:18px;margin:0 0 8px;">${safeTitle}</h1>
      <p style="font-size:14px;color:#cbd5e1;max-width:480px;margin:0 auto 16px;">${safeDesc}</p>
      <a href="${escapeAttr(clientRedirectUrl)}" style="display:inline-block;padding:10px 20px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Baca Berita Penuh di Portal MPGBSIM</a>
    </div>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  return res.status(200).send(html);
}
