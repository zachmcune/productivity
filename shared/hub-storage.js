/** Synced storage: localStorage when guest, Cloudflare D1 when signed in. */
window.HubStorage = {
  _ready: null,
  _cloud: false,
  _cache: new Map(),

  reset() {
    this._ready = null;
    this._cloud = false;
    this._cache.clear();
  },

  async init() {
    if (this._ready) return this._ready;
    this._ready = (async () => {
      const user = window.HubAuth ? await HubAuth.me() : null;
      this._cloud = !!user;
    })();
    return this._ready;
  },

  isCloud() {
    return this._cloud;
  },

  getSync(key, fallback = null) {
    if (this._cloud) {
      return this._cache.has(key) ? this._cache.get(key) : fallback;
    }
    return localStorage.getItem(key) ?? fallback;
  },

  async get(key, fallback = null) {
    await this.init();
    if (this._cloud) {
      if (this._cache.has(key)) return this._cache.get(key);
      const res = await fetch(`/api/data/${encodeURIComponent(key)}`, {
        credentials: 'include',
      });
      if (!res.ok) return fallback;
      const data = await res.json();
      const value = data.value ?? fallback;
      this._cache.set(key, value);
      return value;
    }
    return localStorage.getItem(key) ?? fallback;
  },

  async set(key, value) {
    await this.init();
    const text = String(value);
    if (this._cloud) {
      this._cache.set(key, text);
      const res = await fetch(`/api/data/${encodeURIComponent(key)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      return;
    }
    localStorage.setItem(key, text);
  },
};
