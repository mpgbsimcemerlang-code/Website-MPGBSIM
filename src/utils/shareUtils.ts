import { NewsItem } from '../types';

/**
 * Generates a direct deep-link URL to a specific news item.
 * When clicked, the app automatically scrolls to #berita and opens the news article modal.
 */
export function getNewsShareUrl(newsId: string): string {
  const baseOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.mpgbsim.org';

  return `${baseOrigin}/?berita=${encodeURIComponent(newsId)}`;
}

/**
 * Formats a WhatsApp/Telegram share text message with title, school name, and direct URL.
 */
export function getNewsShareMessage(news: NewsItem): string {
  const url = getNewsShareUrl(news.id);
  const schoolLine = news.schoolName ? `🏫 *${news.schoolName}*\n` : '';
  return `📰 *${news.title}*\n${schoolLine}📅 ${news.date}\n\nBaca laporan penuh di Portal Rasmi MPGBSIM:\n👉 ${url}`;
}

/**
 * Copies the direct news link to clipboard and returns true if successful.
 */
export async function copyNewsShareLink(newsId: string): Promise<boolean> {
  const url = getNewsShareUrl(newsId);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = url;
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
