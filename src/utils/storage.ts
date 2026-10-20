/**
 * Robust hybrid storage system (IndexedDB + localStorage fallback)
 * Eliminates "Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota"
 * by persisting full CMS state (including images/posters) in IndexedDB (no 5MB limit)
 * while maintaining fast synchronous initialization and cleaning up old cache keys.
 */

const CONTENT_KEY = 'site_content_v3';

export const LOCAL_STORAGE_KEYS = {
  SITE_CONTENT: 'mpgbsim_cms_content_v3',
  ADMIN_SESSION: 'mpgbsim_admin_session_v2',
  OBSOLETE_KEYS: [
    'mpgbsim_cms_content',
    'mpgbsim_cms_content_v1',
    'mpgbsim_cms_content_v2',
    'mpgbsim_admin_session_v1',
    'mpgbsim_site_content',
    'mpgbsim_site_content_v1',
    'mpgbsim_site_content_v2',
    'mpgbsim_portal_audit_logs',
    'mpgbsim_portal_notifications',
    'mpgbsim_portal_mock_data',
  ],
};

import {
  StorageManagementService,
  saveToIndexedDB,
  loadFromIndexedDB,
} from '../services/StorageManagementService';

export { StorageManagementService, saveToIndexedDB, loadFromIndexedDB };

/**
 * Clean up obsolete keys in localStorage to free up browser quota
 */
export function purgeObsoleteLocalStorage(): void {
  StorageManagementService.purgeObsoleteKeys();
}

/**
 * Safely writes an item to localStorage with LRU eviction and quota protection.
 * Never throws QuotaExceededError or crashes the application.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  return StorageManagementService.setItem(key, value);
}

export function safeLocalStorageGet(key: string): string | null {
  return StorageManagementService.getItem(key);
}

export function safeLocalStorageRemove(key: string): void {
  StorageManagementService.removeItem(key);
}

/**
 * Safely save site content across IndexedDB and localStorage
 * Handles QuotaExceededError gracefully without throwing
 */
export async function persistSiteContent(data: any): Promise<void> {
  // 1. Always save full high-res data into IndexedDB (virtually unlimited quota)
  await saveToIndexedDB(CONTENT_KEY, data);

  // 2. Always purge obsolete legacy keys first
  StorageManagementService.purgeObsoleteKeys();

  // 3. Proactively compact base64 before writing to localStorage to prevent quota exhaustion
  try {
    const serialized = JSON.stringify(data);
    if (serialized.length > 700000) {
      const compact = stripLargeBase64(data, 25000);
      StorageManagementService.setItem(LOCAL_STORAGE_KEYS.SITE_CONTENT, JSON.stringify(compact));
      return;
    }
    StorageManagementService.setItem(LOCAL_STORAGE_KEYS.SITE_CONTENT, serialized);
  } catch (err: any) {
    try {
      const compact = stripLargeBase64(data, 12000);
      StorageManagementService.setItem(LOCAL_STORAGE_KEYS.SITE_CONTENT, JSON.stringify(compact));
    } catch {
      // IndexedDB has already persisted full data!
    }
  }
}

/**
 * Helper to strip very large base64 data URLs for the localStorage cache fallback
 * Preserves avatarUrl and photoUrl up to limit so leader and user profiles never lose photos
 */
export function stripLargeBase64(obj: any, customLimit?: number): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => stripLargeBase64(item, customLimit));
  }
  const copy: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const isProtectedPhoto =
      key === 'avatarUrl' ||
      key === 'photoUrl' ||
      key === 'photoURL' ||
      key === 'principalPhotoUrl' ||
      key === 'pgbPhotoUrl' ||
      key === 'logoUrl' ||
      key === 'schoolPhotoUrl' ||
      key === 'imageUrl' ||
      key === 'posterUrl';
    const limit = isProtectedPhoto ? Math.max(customLimit ?? 0, 350000) : (customLimit ?? 25000);

    if (typeof val === 'string' && val.startsWith('data:') && val.length > limit) {
      copy[key] = '';
    } else if (typeof val === 'object') {
      copy[key] = stripLargeBase64(val, customLimit);
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
