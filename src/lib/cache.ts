type CacheItem<T> = {
    value: T;
    expiry: number;
};

export class InMemoryCache {
    private cache: Map<string, CacheItem<any>>;
    private defaultTTL: number;

    constructor(defaultTTLSeconds: number = 60) {
        this.cache = new Map();
        this.defaultTTL = defaultTTLSeconds * 1000;
    }

    set<T>(key: string, value: T, ttlSeconds?: number): void {
        const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

// Export a singleton instance for file listings
export const fileCache = new InMemoryCache(60); // 1 minute cache
