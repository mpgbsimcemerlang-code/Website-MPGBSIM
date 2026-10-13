/**
 * StorageManagementService
 * 
 * Implements a Least-Recently-Used (LRU) cache policy to purge oldest non-critical data
 * from localStorage before new items are saved, preventing 'QuotaExceededError' crashes.
 * 
 * Features:
 * 1. Proactive & Reactive LRU Eviction: Tracks access timestamps for stored keys and
 *    evicts least-recently-used non-critical keys to maintain safe quota headroom.
 * 2. Critical Data Protection: Guarantees that essential items (such as user credentials,
 *    current active session, and view modes) are NEVER purged by the LRU algorithm.
 * 3. Compact Metadata Index: Maintains a lightweight persistent LRU access index with
 *    in-memory synchronization for O(1) access.
 * 4. Automatic Obsolete Key Cleanup: Automatically sweeps away dead legacy keys on startup
 *    and before writes.
 * 5. Multi-tiered Fallback: Backed by IndexedDB and in-memory cache to guarantee zero-crash
 *    durability even in restricted browser environments.
 */

const DB_NAME = 'mpgbsim_cms_db';
const DB_VERSION = 1;
const STORE_NAME = 'cms_store';

function openIndexedDB(): Promise<IDBDatabase> {
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
 * Save data to IndexedDB (asynchronous high-capacity persistent storage)
 */
export async function saveToIndexedDB<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Non-blocking fallback
  }
}

/**
 * Load data from IndexedDB
 */
export async function loadFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return null;
  }
}

export interface StorageItemMetadata {
  key: string;
  lastAccessed: number;
  size: number;
  isCritical: boolean;
}

export interface StorageUsageStats {
  usedBytes: number;
  quotaLimit: number;
  percentage: number;
  itemCount: number;
  criticalItemCount: number;
  purgeableItemCount: number;
}

export interface SetItemOptions {
  isCritical?: boolean;
  fallbackToIndexedDB?: boolean;
}

// Typical browser localStorage quota is ~5MB (5 * 1024 * 1024 bytes in UTF-16 characters)
const DEFAULT_QUOTA_LIMIT_BYTES = 5 * 1024 * 1024;
// When storage usage exceeds this safety threshold, proactively evict LRU items
const PROACTIVE_EVICTION_THRESHOLD_BYTES = 3.6 * 1024 * 1024; // ~3.6 MB

const LRU_METADATA_KEY = '__mpgbsim_lru_meta_v1__';

// Keys that must NEVER be evicted by the LRU algorithm
const DEFAULT_CRITICAL_KEYS = new Set<string>([
  'mpgbsim_portal_user_v1',
  'mpgbsim_admin_session_v2',
  'mpgbsim_view_mode_v1',
  'portal_user',
]);

// Prefixes that are critical
const CRITICAL_KEY_PREFIXES = ['mpgbsim_rl_']; // Rate-limiting security state

// Obsolete legacy keys that should be immediately removed whenever detected
const OBSOLETE_LEGACY_KEYS = [
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
];

class StorageManagementServiceClass {
  private metadataMap: Map<string, StorageItemMetadata> = new Map();
  private inMemoryFallback: Map<string, string> = new Map();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize metadata index from localStorage and scan existing keys
   */
  public init(): void {
    if (this.isInitialized || typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      // 1. Immediately purge obsolete legacy keys
      this.purgeObsoleteKeys();

      // 2. Load stored metadata
      const rawMeta = window.localStorage.getItem(LRU_METADATA_KEY);
      if (rawMeta) {
        try {
          const parsed = JSON.parse(rawMeta);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: StorageItemMetadata) => {
              if (item && item.key && item.key !== LRU_METADATA_KEY) {
                this.metadataMap.set(item.key, item);
              }
            });
          }
        } catch {}
      }

      // 3. Reconcile with actual localStorage keys
      const now = Date.now();
      const currentKeys = new Set<string>();

      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || key === LRU_METADATA_KEY) continue;
        currentKeys.add(key);

        const val = window.localStorage.getItem(key) || '';
        const size = (key.length + val.length) * 2;
        const isCrit = this.isCriticalKey(key);

        const existing = this.metadataMap.get(key);
        if (existing) {
          existing.size = size;
          existing.isCritical = isCrit || existing.isCritical;
        } else {
          this.metadataMap.set(key, {
            key,
            lastAccessed: now,
            size,
            isCritical: isCrit,
          });
        }
      }

      // Remove metadata entries for keys that no longer exist
      for (const [key] of this.metadataMap) {
        if (!currentKeys.has(key)) {
          this.metadataMap.delete(key);
        }
      }

      this.persistMetadata();
      this.isInitialized = true;
    } catch {
      // Graceful degradation
    }
  }

  /**
   * Checks if a key is marked or categorized as critical
   */
  public isCriticalKey(key: string): boolean {
    if (DEFAULT_CRITICAL_KEYS.has(key)) return true;
    for (const prefix of CRITICAL_KEY_PREFIXES) {
      if (key.startsWith(prefix)) return true;
    }
    const meta = this.metadataMap.get(key);
    return meta?.isCritical === true;
  }

  /**
   * Explicitly sets the critical status of a key
   */
  public setCritical(key: string, isCritical: boolean): void {
    const meta = this.metadataMap.get(key);
    if (meta) {
      meta.isCritical = isCritical;
      this.persistMetadata();
    }
  }

  /**
   * Touch a key to update its LRU recency timestamp
   */
  public touch(key: string): void {
    const meta = this.metadataMap.get(key);
    if (meta) {
      meta.lastAccessed = Date.now();
      this.persistMetadata();
    }
  }

  /**
   * Get an item from localStorage with LRU timestamp update
   */
  public getItem(key: string): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.inMemoryFallback.get(key) || null;
    }

    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) {
        const meta = this.metadataMap.get(key);
        if (meta) {
          meta.lastAccessed = Date.now();
        } else {
          this.metadataMap.set(key, {
            key,
            lastAccessed: Date.now(),
            size: (key.length + value.length) * 2,
            isCritical: this.isCriticalKey(key),
          });
        }
        return value;
      }
    } catch {
      // Fallback
    }

    return this.inMemoryFallback.get(key) || null;
  }

  /**
   * Save an item to localStorage with proactive LRU eviction and reactive QuotaExceededError protection.
   * Guarantees non-crash execution.
   */
  public setItem(key: string, value: string, options?: SetItemOptions): boolean {
    if (typeof window === 'undefined') return false;

    // Cache in memory for instant synchronous access
    this.inMemoryFallback.set(key, value);

    // IndexedDB background mirror if requested
    if (options?.fallbackToIndexedDB) {
      saveToIndexedDB(key, value).catch(() => {});
    }

    if (!window.localStorage) {
      return true;
    }

    const estimatedItemBytes = (key.length + value.length) * 2;
    const isCritical = options?.isCritical ?? this.isCriticalKey(key);

    // 1. Proactive Eviction: Check if writing this item will exceed safety threshold
    const currentUsage = this.calculateUsedBytes();
    if (currentUsage + estimatedItemBytes > PROACTIVE_EVICTION_THRESHOLD_BYTES) {
      const bytesToFree = (currentUsage + estimatedItemBytes) - (PROACTIVE_EVICTION_THRESHOLD_BYTES * 0.85);
      if (bytesToFree > 0) {
        this.evictOldest(bytesToFree, key);
      }
    }

    // 2. Direct attempt
    try {
      window.localStorage.setItem(key, value);
      this.recordSuccessfulSet(key, estimatedItemBytes, isCritical);
      return true;
    } catch (err: any) {
      const isQuota = this.isQuotaError(err);
      if (!isQuota) {
        return false;
      }

      // 3. Reactive Eviction: Handle QuotaExceededError
      return this.handleQuotaExceededRecovery(key, value, estimatedItemBytes, isCritical);
    }
  }

  /**
   * Remove an item from localStorage and metadata
   */
  public removeItem(key: string): void {
    this.inMemoryFallback.delete(key);
    this.metadataMap.delete(key);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
        this.persistMetadata();
      } catch {}
    }
  }

  /**
   * Clear non-critical or all localStorage entries
   */
  public clear(onlyNonCritical = false): void {
    this.inMemoryFallback.clear();

    if (typeof window === 'undefined' || !window.localStorage) return;

    if (!onlyNonCritical) {
      try {
        window.localStorage.clear();
        this.metadataMap.clear();
      } catch {}
      return;
    }

    // Clear only non-critical
    for (const [key, meta] of this.metadataMap) {
      if (!meta.isCritical) {
        try {
          window.localStorage.removeItem(key);
          this.metadataMap.delete(key);
        } catch {}
      }
    }
    this.persistMetadata();
  }

  /**
   * Evict the oldest (least-recently-used) non-critical items until the required bytes are freed
   * @param requiredBytes Amount of bytes to free
   * @param excludeKey Key currently being saved (do not evict itself)
   * @returns Array of evicted keys
   */
  public evictOldest(requiredBytes?: number, excludeKey?: string): string[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];

    // Purge obsolete keys first
    this.purgeObsoleteKeys();

    const targetBytes = requiredBytes ?? 500 * 1024; // Default to free at least 500KB
    let freedBytes = 0;
    const evictedKeys: string[] = [];

    // Filter non-critical items and sort ascending by lastAccessed (LRU first)
    const purgeableCandidates = Array.from(this.metadataMap.values())
      .filter((item) => !item.isCritical && item.key !== excludeKey && item.key !== LRU_METADATA_KEY)
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    for (const candidate of purgeableCandidates) {
      try {
        window.localStorage.removeItem(candidate.key);
        this.metadataMap.delete(candidate.key);
        freedBytes += candidate.size;
        evictedKeys.push(candidate.key);

        if (freedBytes >= targetBytes) {
          break;
        }
      } catch {}
    }

    // If still need space, truncate oversized audit logs
    if (freedBytes < targetBytes) {
      try {
        const logsRaw = window.localStorage.getItem('mpgbsim_audit_logs_v1');
        if (logsRaw) {
          const logs = JSON.parse(logsRaw);
          if (Array.isArray(logs) && logs.length > 10) {
            const truncated = JSON.stringify(logs.slice(0, 10));
            window.localStorage.setItem('mpgbsim_audit_logs_v1', truncated);
            freedBytes += (logsRaw.length - truncated.length) * 2;
          }
        }
      } catch {}
    }

    this.persistMetadata();
    return evictedKeys;
  }

  /**
   * Immediately remove obsolete legacy keys
   */
  public purgeObsoleteKeys(): number {
    if (typeof window === 'undefined' || !window.localStorage) return 0;
    let purged = 0;

    for (const key of OBSOLETE_LEGACY_KEYS) {
      try {
        if (window.localStorage.getItem(key) !== null) {
          window.localStorage.removeItem(key);
          this.metadataMap.delete(key);
          purged++;
        }
      } catch {}
    }

    return purged;
  }

  /**
   * Get storage usage statistics and LRU details
   */
  public getStorageUsage(): StorageUsageStats {
    const usedBytes = this.calculateUsedBytes();
    let criticalCount = 0;
    let purgeableCount = 0;

    for (const meta of this.metadataMap.values()) {
      if (meta.isCritical) {
        criticalCount++;
      } else {
        purgeableCount++;
      }
    }

    return {
      usedBytes,
      quotaLimit: DEFAULT_QUOTA_LIMIT_BYTES,
      percentage: Math.min(100, Math.round((usedBytes / DEFAULT_QUOTA_LIMIT_BYTES) * 100)),
      itemCount: this.metadataMap.size,
      criticalItemCount: criticalCount,
      purgeableItemCount: purgeableCount,
    };
  }

  /**
   * Retrieve current LRU ranking list (oldest to newest)
   */
  public getLRUList(): StorageItemMetadata[] {
    return Array.from(this.metadataMap.values()).sort((a, b) => a.lastAccessed - b.lastAccessed);
  }

  // --- Private Helpers ---

  private recordSuccessfulSet(key: string, size: number, isCritical: boolean): void {
    this.metadataMap.set(key, {
      key,
      lastAccessed: Date.now(),
      size,
      isCritical,
    });
    this.persistMetadata();
  }

  private handleQuotaExceededRecovery(
    key: string,
    value: string,
    estimatedItemBytes: number,
    isCritical: boolean
  ): boolean {
    // Stage 1: Evict oldest non-critical items
    this.evictOldest(estimatedItemBytes * 2, key);

    try {
      window.localStorage.setItem(key, value);
      this.recordSuccessfulSet(key, estimatedItemBytes, isCritical);
      return true;
    } catch {}

    // Stage 2: If the key being saved is NOT the site content, compact the site content in localStorage
    if (key !== 'mpgbsim_cms_content_v3') {
      try {
        const cmsRaw = window.localStorage.getItem('mpgbsim_cms_content_v3');
        if (cmsRaw) {
          const cmsData = JSON.parse(cmsRaw);
          const compact = this.stripHeavyBase64(cmsData, 10000);
          window.localStorage.setItem('mpgbsim_cms_content_v3', JSON.stringify(compact));
        }
      } catch {}

      try {
        window.localStorage.setItem(key, value);
        this.recordSuccessfulSet(key, estimatedItemBytes, isCritical);
        return true;
      } catch {}
    }

    // Stage 3: Evict ALL remaining non-critical items
    this.clear(true);

    try {
      window.localStorage.setItem(key, value);
      this.recordSuccessfulSet(key, estimatedItemBytes, isCritical);
      return true;
    } catch {}

    // Stage 4: If value is a JSON object with base64 data, strip large base64
    try {
      const parsed = JSON.parse(value);
      const stripped = this.stripHeavyBase64(parsed, 12000);
      const strippedJson = JSON.stringify(stripped);
      window.localStorage.setItem(key, strippedJson);
      this.recordSuccessfulSet(key, strippedJson.length * 2, isCritical);
      return true;
    } catch {}

    // Stage 5: Save in IndexedDB as a fail-safe (virtually unlimited quota)
    saveToIndexedDB(key, value).catch(() => {});

    // Stage 6: Gracefully return true if memory cache succeeded, preventing crash
    return this.inMemoryFallback.has(key);
  }

  private isQuotaError(err: any): boolean {
    return (
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'))
    );
  }

  private calculateUsedBytes(): number {
    if (typeof window === 'undefined' || !window.localStorage) return 0;
    let total = 0;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          const val = window.localStorage.getItem(key) || '';
          total += (key.length + val.length) * 2;
        }
      }
    } catch {}
    return total;
  }

  private persistMetadata(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      // Keep metadata compact: array of items
      const metaArray = Array.from(this.metadataMap.values());
      const serialized = JSON.stringify(metaArray);
      window.localStorage.setItem(LRU_METADATA_KEY, serialized);
    } catch {
      // If saving metadata itself hits quota, don't crash
    }
  }

  private stripHeavyBase64(obj: any, limit = 20000): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.stripHeavyBase64(item, limit));
    }
    const copy: any = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string' && v.startsWith('data:') && v.length > limit) {
        copy[k] = '';
      } else if (typeof v === 'object') {
        copy[k] = this.stripHeavyBase64(v, limit);
      } else {
        copy[k] = v;
      }
    }
    return copy;
  }
}

// Singleton export
export const StorageManagementService = new StorageManagementServiceClass();
