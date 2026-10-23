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
 * Generates a direct deep-link URL to a specific news item.
 * When clicked or shared on WhatsApp/Telegram/Facebook, the server injects
 * OpenGraph tags (title, summary, and /api/og-image/:newsId) so the rich image card appears.
 */
export function getNewsShareUrl(newsId: string): string {
  return `${getSiteOrigin()}/?berita=${encodeURIComponent(newsId)}`;
}

/**
 * Generates the HTTP binary OpenGraph image endpoint URL for a news article.
 * Converts base64 data:image URIs in Firestore into a valid HTTP image for WhatsApp/Telegram/Facebook crawlers.
 */
export function getNewsOgImageUrl(newsId: string): string {
  return `${getSiteOrigin()}/api/og-image/${encodeURIComponent(newsId)}`;
}

/**
 * Formats the share payload for WhatsApp/Telegram.
 * By default (includeCaption = false), returns ONLY the clean URL so WhatsApp/Telegram/Facebook
 * renders the rich OpenGraph photo preview card at the top + the clickable link below it
 * (matching the exact preview card style requested).
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
 * Copies the direct news link (or caption + link) to clipboard and returns true if successful.
 */
export async function copyNewsShareLink(
  newsOrId: string | NewsItem,
  includeCaption = false
): Promise<boolean> {
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
 * Shares the news link (and optionally attaches the actual image file if requested via Web Share API).
 */
export async function shareNewsNative(
  news: NewsItem,
  options?: { attachImageFile?: boolean; includeCaption?: boolean }
): Promise<'shared' | 'copied'> {
  const url = getNewsShareUrl(news.id);
  const title = news.title.includes('MPGBSIM') ? news.title : `${news.title} | MPGBSIM`;
  const text = options?.includeCaption ? getNewsShareMessage(news, true) : undefined;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    if (options?.attachImageFile && news.imageUrl) {
      try {
        const imgSource = news.imageUrl.startsWith('data:image/')
          ? news.imageUrl
          : getNewsOgImageUrl(news.id);
        const resp = await fetch(imgSource);
        if (resp.ok) {
          const blob = await resp.blob();
          const ext = blob.type.includes('png') ? 'png' : 'jpg';
          const file = new File([blob], `berita-${news.id}.${ext}`, {
            type: blob.type || 'image/jpeg',
          });
          const shareDataWithFile: ShareData = {
            title,
            text: `${title}\n${url}`,
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
 * Updates client-side document <head> OpenGraph & Twitter meta tags and browser address bar
 * when a news article is opened or closed.
 */
export function updateDocumentOpenGraphMeta(news: NewsItem | null): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const origin = getSiteOrigin();

  if (news) {
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
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('berita') !== news.id) {
        currentUrl.searchParams.set('berita', news.id);
        window.history.replaceState({}, fullTitle, currentUrl.toString());
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
      if (currentUrl.searchParams.has('berita') || currentUrl.searchParams.has('news')) {
        currentUrl.searchParams.delete('berita');
        currentUrl.searchParams.delete('news');
        window.history.replaceState({}, DEFAULT_SITE_TITLE, currentUrl.toString());
      }
    } catch {
      // Ignore URL update errors
    }
  }
}
