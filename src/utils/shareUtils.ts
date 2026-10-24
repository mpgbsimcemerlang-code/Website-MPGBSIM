import { NewsItem } from '../types';

const DEFAULT_SITE_TITLE =
  'MPGBSIM — Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia | Portal Rasmi Kebangsaan';
const DEFAULT_SITE_DESC =
  'Portal Rasmi Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM). Memperkasa kepimpinan pendidikan, membina generasi Rabbani merentasi SMKA, SABK, Sekolah Islam Swasta & Maahad Tahfiz seluruh Malaysia.';

export function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://www.mpgbsim.org';
}

export function getDisplayDomain(): string {
  try {
    const u = new URL(getSiteOrigin());
    return u.hostname.replace(/^www\./i, '');
  } catch {
    return 'mpgbsim.org';
  }
}

/**
 * Syncs news item(s) to the Express server cache so /berita/:newsId and /api/og-image/:newsId.jpg
 * always have instant access to the latest title, summary, and imageUrl.
 */
export async function syncNewsToServerCache(news: NewsItem | NewsItem[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/news-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ news }),
    });
  } catch {
    // Non-blocking best-effort sync
  }
}

/**
 * Generates a unique path-based deep-link URL to a specific news item (/berita/:newsId).
 * Path-based URLs ensure WhatsApp, Telegram, and Facebook never reuse cached homepage logos
 * and always fetch the article's dedicated 1200x630 JPEG OpenGraph card.
 */
export function getNewsShareUrl(newsId: string): string {
  const cleanId = String(newsId || '').trim();
  return `${getSiteOrigin()}/?berita=${encodeURIComponent(cleanId)}`;
}

/**
 * Generates the HTTP binary 1200x630 JPEG OpenGraph image endpoint URL for a news article.
 * Converts WebP/PNG/JPEG base64 data URIs in Firestore into a standard JPEG for WhatsApp/Telegram/Facebook crawlers.
 */
export function getNewsOgImageUrl(newsId: string): string {
  const cleanId = String(newsId || '').trim();
  return `${getSiteOrigin()}/api/og-image/${encodeURIComponent(cleanId)}.jpg`;
}

/**
 * Formats the share payload for WhatsApp/Telegram.
 * By default (includeCaption = false), returns ONLY the clean URL so WhatsApp/Telegram/Facebook
 * renders the rich OpenGraph photo preview card at the top + the clickable link below it
 * (matching the exact "Pratonton Kad Kongsi" preview card style).
 */
export function getNewsShareMessage(news: NewsItem, includeCaption = false): string {
  const url = getNewsShareUrl(news.id);
  if (!includeCaption) {
    return url;
  }
  const schoolLine = news.schoolName ? `🏫 *${news.schoolName}*\n` : '';
  return `📰 *${news.title}*\n${schoolLine}📅 ${news.date}\n\n${url}`;
}

export function buildWhatsAppShareUrl(news: NewsItem, includeCaption = false): string {
  const text = getNewsShareMessage(news, includeCaption);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildTelegramShareUrl(news: NewsItem, includeCaption = false): string {
  const url = getNewsShareUrl(news.id);
  if (!includeCaption) {
    return `https://t.me/share/url?url=${encodeURIComponent(url)}`;
  }
  const caption = `📰 ${news.title}${news.schoolName ? ` — ${news.schoolName}` : ''}`;
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(caption)}`;
}

export function buildFacebookShareUrl(news: NewsItem): string {
  const url = getNewsShareUrl(news.id);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Converts any news image (including data:image/webp) into a standard 1200x630 image/jpeg Blob
 * in the browser so Web Share API (navigator.share) never passes unsupported WebP files to WhatsApp.
 */
async function convertNewsImageToJpegBlob(news: NewsItem): Promise<Blob | null> {
  // First try the server's 1200x630 sharp JPEG endpoint
  try {
    const ogResp = await fetch(getNewsOgImageUrl(news.id));
    if (ogResp.ok) {
      const contentType = ogResp.headers.get('content-type') || '';
      if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        return await ogResp.blob();
      }
    }
  } catch {
    // Fallback to client canvas conversion below
  }

  if (!news.imageUrl || typeof document === 'undefined') return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 1200, 630);

        const scale = Math.max(1200 / img.width, 630 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (1200 - w) / 2;
        const y = (630 - h) / 2;
        ctx.drawImage(img, x, y, w, h);

        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          0.88
        );
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = news.imageUrl;
  });
}

/**
 * Copies the direct news link (or caption + link) to clipboard and returns true if successful.
 */
export async function copyNewsShareLink(
  newsOrId: string | NewsItem,
  includeCaption = false
): Promise<boolean> {
  if (typeof newsOrId !== 'string') {
    syncNewsToServerCache(newsOrId);
  }

  const textToCopy =
    typeof newsOrId === 'string'
      ? getNewsShareUrl(newsOrId)
      : getNewsShareMessage(newsOrId, includeCaption);

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}

/**
 * Shares the news link (and optionally attaches the 1200x630 JPEG image file if requested via Web Share API).
 */
export async function shareNewsNative(
  news: NewsItem,
  options?: { attachImageFile?: boolean; includeCaption?: boolean }
): Promise<'shared' | 'copied'> {
  await syncNewsToServerCache(news);

  const url = getNewsShareUrl(news.id);
  const title = news.title.includes('MPGBSIM') ? news.title : `${news.title} | MPGBSIM`;
  const summaryText = (news.summary || news.content || '').replace(/\s+/g, ' ').trim();
  const shortSummary = summaryText.length > 160 ? `${summaryText.slice(0, 157)}...` : summaryText;
  const text = options?.includeCaption ? getNewsShareMessage(news, true) : undefined;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    if (options?.attachImageFile && news.imageUrl) {
      try {
        const jpegBlob = await convertNewsImageToJpegBlob(news);
        if (jpegBlob) {
          const file = new File([jpegBlob], `berita-${news.id}.jpg`, {
            type: 'image/jpeg',
          });
          const captionWithLink = options?.includeCaption
            ? getNewsShareMessage(news, true)
            : `*${title}*\n${shortSummary ? `${shortSummary}\n\n` : ''}${url}`;
          const shareDataWithFile: ShareData = {
            title,
            text: captionWithLink,
            files: [file],
          };
          if (typeof navigator.canShare === 'function' && navigator.canShare(shareDataWithFile)) {
            await navigator.share(shareDataWithFile);
            return 'shared';
          }
        }
      } catch {
        // Fallback to URL share below
      }
    }

    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return 'shared';
      }
    }
  }

  await copyNewsShareLink(news, options?.includeCaption);
  return 'copied';
}

function setMetaTagContent(selector: string, content: string): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute('content', content);
  }
}

/**
 * Updates client-side document <head> OpenGraph & Twitter meta tags, syncs the news item to the
 * server OG cache, and updates the browser address bar when a news article is opened or closed.
 */
export function updateDocumentOpenGraphMeta(news: NewsItem | null): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const origin = getSiteOrigin();

  if (news) {
    syncNewsToServerCache(news);

    const cleanTitle = news.title.trim();
    const fullTitle = cleanTitle.includes('MPGBSIM') ? cleanTitle : `${cleanTitle} | MPGBSIM`;
    const rawDesc = (news.summary || news.content || cleanTitle).replace(/\s+/g, ' ').trim();
    const shortDesc = rawDesc.length > 220 ? `${rawDesc.slice(0, 217)}...` : rawDesc;
    const shareUrl = getNewsShareUrl(news.id);
    const ogImage = getNewsOgImageUrl(news.id);

    document.title = fullTitle;
    setMetaTagContent('meta[name="title"]', fullTitle);
    setMetaTagContent('meta[name="description"]', shortDesc);
    setMetaTagContent('meta[property="og:type"]', 'article');
    setMetaTagContent('meta[property="og:url"]', shareUrl);
    setMetaTagContent('meta[property="og:title"]', fullTitle);
    setMetaTagContent('meta[property="og:description"]', shortDesc);
    setMetaTagContent('meta[property="og:image"]', ogImage);
    setMetaTagContent('meta[property="og:image:secure_url"]', ogImage);
    setMetaTagContent('meta[property="og:image:type"]', 'image/jpeg');
    setMetaTagContent('meta[property="og:image:alt"]', fullTitle);
    setMetaTagContent('meta[name="twitter:url"]', shareUrl);
    setMetaTagContent('meta[name="twitter:title"]', fullTitle);
    setMetaTagContent('meta[name="twitter:description"]', shortDesc);
    setMetaTagContent('meta[name="twitter:image"]', ogImage);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', shareUrl);
    }

    try {
      const targetQuery = `/?berita=${encodeURIComponent(news.id)}`;
      const currentParam = new URLSearchParams(window.location.search).get('berita');
      if (currentParam !== news.id && !window.location.pathname.startsWith('/berita/')) {
        window.history.replaceState({}, fullTitle, targetQuery);
      }
    } catch {
      // Ignore URL update errors in constrained frames
    }
  } else {
    const defaultLogo = `${origin}/mpgbsim-official-logo.png`;
    document.title = DEFAULT_SITE_TITLE;
    setMetaTagContent('meta[name="title"]', DEFAULT_SITE_TITLE);
    setMetaTagContent('meta[name="description"]', DEFAULT_SITE_DESC);
    setMetaTagContent('meta[property="og:type"]', 'website');
    setMetaTagContent('meta[property="og:url"]', `${origin}/`);
    setMetaTagContent('meta[property="og:title"]', DEFAULT_SITE_TITLE);
    setMetaTagContent('meta[property="og:description"]', DEFAULT_SITE_DESC);
    setMetaTagContent('meta[property="og:image"]', defaultLogo);
    setMetaTagContent('meta[property="og:image:secure_url"]', defaultLogo);
    setMetaTagContent('meta[property="og:image:type"]', 'image/png');
    setMetaTagContent('meta[name="twitter:url"]', `${origin}/`);
    setMetaTagContent('meta[name="twitter:title"]', DEFAULT_SITE_TITLE);
    setMetaTagContent('meta[name="twitter:description"]', DEFAULT_SITE_DESC);
    setMetaTagContent('meta[name="twitter:image"]', defaultLogo);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${origin}/`);
    }

    try {
      const currentUrl = new URL(window.location.href);
      if (
        currentUrl.pathname.startsWith('/berita/') ||
        currentUrl.searchParams.has('berita') ||
        currentUrl.searchParams.has('news')
      ) {
        currentUrl.pathname = '/';
        currentUrl.searchParams.delete('berita');
        currentUrl.searchParams.delete('news');
        window.history.replaceState({}, DEFAULT_SITE_TITLE, currentUrl.toString());
      }
    } catch {
      // Ignore URL update errors
    }
  }
}
