/** Cloudflare-backed auth client for Productivity Hub. */
window.HubAuth = {
  _cached: undefined,

  async me(force = false) {
    if (!force && this._cached !== undefined) return this._cached;
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      this._cached = data.user;
      return data.user;
    } catch {
      this._cached = null;
      return null;
    }
  },

  clearCache() {
    this._cached = undefined;
    if (window.HubStorage) HubStorage.reset();
  },

  async signup(email, password) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign up failed');
    this._cached = data.user;
    if (window.HubStorage) HubStorage.reset();
    return data.user;
  },

  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign in failed');
    this._cached = data.user;
    if (window.HubStorage) HubStorage.reset();
    return data.user;
  },

  async logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    this.clearCache();
  },

  async importLocalData() {
    const items = {
      'hub-notes': localStorage.getItem('hub-notes') || '',
      'hub-todos': localStorage.getItem('hub-todos') || '[]',
      'hub-colors': localStorage.getItem('hub-colors') || '[]',
      'hub-transitions-enabled': localStorage.getItem('hub-transitions-enabled') || 'true',
      'hub-game-scores': localStorage.getItem('hub-game-scores') || '{}',
    };

    const res = await fetch('/api/auth/import', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import failed');
    if (window.HubStorage) HubStorage.reset();
    return data.imported;
  },

  bindNav() {
    const el = document.getElementById('nav-auth');
    if (!el) return;
    this.me().then(user => {
      if (user) {
        el.textContent = user.email;
        el.href = 'account.html';
        el.title = 'Account';
      } else {
        el.textContent = 'Sign in';
        el.href = 'account.html';
        el.title = 'Sign in';
      }
    });
  },
};
