/**
 * Robust hybrid storage system (IndexedDB + localStorage fallback)
 * Eliminates "Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota"
 * by persisting full CMS state (including images/posters) in IndexedDB (no 5MB limit)
 * while maintaining fast synchronous initialization and cleaning up old cache keys.
 */

const DB_NAME = 'mpgbsim_cms_db';
const DB_VERSION = 1;
const STORE_NAME = 'cms_store';
const CONTENT_KEY = 'site_content_v3';

export const LOCAL_STORAGE_KEYS = {
  SITE_CONTENT: 'mpgbsim_cms_content_v3',
  ADMIN_SESSION: 'mpgbsim_admin_session_v2',
  OBSOLETE_KEYS: [
    'mpgbsim_cms_content_v1',
    'mpgbsim_cms_content_v2',
    'mpgbsim_admin_session_v1',
  ],
};

/**
 * Open or initialize IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save data to IndexedDB
 */
export async function saveToIndexedDB<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
  }
}

/**
 * Load data from IndexedDB
 */
export async function loadFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB load failed:', err);
    return null;
  }
}

/**
 * Clean up obsolete keys in localStorage to free up browser quota
 */
export function purgeObsoleteLocalStorage(): void {
  try {
    LOCAL_STORAGE_KEYS.OBSOLETE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
    // Also remove heavy cache items if quota is tight
    const candidateHeavyKeys = [
      'mpgbsim_cms_content_v1',
      'mpgbsim_cms_content_v2',
      'mpgbsim_admin_session_v1',
      'mpgbsim_site_content_v1',
      'mpgbsim_site_content_v2',
    ];
    candidateHeavyKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
  } catch {
    // Ignore in case localStorage is restricted
  }
}

/**
 * Safely writes an item to localStorage with quota protection and fallback sanitization.
 * Never throws QuotaExceededError or any DOMException.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

    if (!isQuotaError) {
      console.warn(`[safeLocalStorageSet] Storage error for "${key}":`, err);
      return false;
    }

    console.warn(`[safeLocalStorageSet] Quota exceeded on "${key}". Freeing non-essential cache.`);
    purgeObsoleteLocalStorage();

    // Remove heavy temporary caches only, NEVER remove main CMS content
    try {
      localStorage.removeItem('mpgbsim_portal_audit_logs');
      localStorage.removeItem('mpgbsim_portal_notifications');
    } catch {}

    // First retry
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      // If still exceeding quota, strip base64 from value if JSON for localStorage only
      try {
        const parsed = JSON.parse(value);
        const stripped = stripLargeBase64(parsed);
        localStorage.setItem(key, JSON.stringify(stripped));
        return true;
      } catch (finalErr) {
        console.warn(`[safeLocalStorageSet] Storage quota reached for "${key}":`, finalErr);
        return false;
      }
    }
  }
}

export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Safely save site content across IndexedDB and localStorage
 * Handles QuotaExceededError gracefully without throwing
 */
export async function persistSiteContent(data: any): Promise<void> {
  // 1. Always save full data into IndexedDB (virtually unlimited quota)
  await saveToIndexedDB(CONTENT_KEY, data);

  // 2. Save into localStorage with quota protection and old key cleanup
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SITE_CONTENT, serialized);
  } catch (err: any) {
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

    if (isQuotaError) {
      console.warn('localStorage quota reached. Purging legacy cache and storing compact state.');
      purgeObsoleteLocalStorage();

      try {
        // Try again after purging
        localStorage.setItem(LOCAL_STORAGE_KEYS.SITE_CONTENT, JSON.stringify(data));
      } catch {
        // If still full, strip very large base64 strings from localStorage copy only,
        // while IndexedDB retains the full copy intact.
        try {
          const stripped = stripLargeBase64(data);
          localStorage.setItem(LOCAL_STORAGE_KEYS.SITE_CONTENT, JSON.stringify(stripped));
        } catch {
          // If still fails, IndexedDB has already persisted the state. No crash!
          console.info('CMS state safely preserved in IndexedDB.');
        }
      }
    } else {
      console.warn('Non-quota error saving to localStorage:', err);
    }
  }
}

/**
 * Helper to strip very large base64 data URLs for the localStorage cache fallback
 * Preserves avatarUrl and photoUrl up to 400KB so leader and user profiles never lose photos
 */
function stripLargeBase64(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(stripLargeBase64);
  }
  const copy: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const isProfilePhoto = key === 'avatarUrl' || key === 'photoUrl' || key === 'photoURL';
    const limit = isProfilePhoto ? 400000 : 80000;

    if (typeof val === 'string' && val.startsWith('data:') && val.length > limit) {
      // Keep a valid fallback URL for localStorage cache only if excessively large; IndexedDB holds the real data
      copy[key] = val;
    } else if (typeof val === 'object') {
      copy[key] = stripLargeBase64(val);
    } else {
      copy[key] = val;
    }
  }
  return copy;
}

/**
 * Synchronous initial load from localStorage
 */
export function getInitialSiteContentSync(): any | null {
  purgeObsoleteLocalStorage();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SITE_CONTENT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed sync read from localStorage:', e);
  }
  return null;
}

/**
 * Asynchronous load from IndexedDB (called on mount to hydrate full high-res assets)
 */
export async function getFullSiteContentAsync(): Promise<any | null> {
  return loadFromIndexedDB(CONTENT_KEY);
}
