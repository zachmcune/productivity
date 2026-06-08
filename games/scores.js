/** High scores — localStorage for guests, account sync when signed in. */
window.GameScores = {
  KEY: 'hub-game-scores',
  _data: null,

  async init() {
    if (this._data) return this._data;
    let raw = '{}';
    if (window.HubStorage) {
      await HubStorage.init();
      raw = await HubStorage.get(this.KEY, '{}');
    } else {
      raw = localStorage.getItem(this.KEY) || '{}';
    }
    try {
      this._data = JSON.parse(raw);
    } catch {
      this._data = {};
    }
    return this._data;
  },

  get(game) {
    return this._data?.[game] ?? null;
  },

  async persist() {
    const json = JSON.stringify(this._data);
    if (window.HubStorage) {
      await HubStorage.set(this.KEY, json);
    } else {
      localStorage.setItem(this.KEY, json);
    }
  },

  async tryRecord(game, value, { lowerIsBetter = false } = {}) {
    await this.init();
    const current = this._data[game];
    const beats = current == null
      || (lowerIsBetter ? value < current : value > current);
    if (!beats) return false;
    this._data[game] = value;
    await this.persist();
    this.updateDisplay(game);
    return true;
  },

  async tryMemoryRecord(moves, seconds) {
    await this.init();
    const current = this._data.memory;
    const beats = !current
      || moves < current.moves
      || (moves === current.moves && seconds < current.seconds);
    if (!beats) return false;
    this._data.memory = { moves, seconds };
    await this.persist();
    this.updateDisplay('memory');
    return true;
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  formatLap(secs) {
    if (!secs) return '—';
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return m > 0 ? `${m}:${s.padStart(4, '0')}` : `${s}s`;
  },

  updateDisplay(game) {
    const id = game === 'drive' ? 'drive-best-record' : `${game}-best`;
    const el = document.getElementById(id);
    if (!el) return;
    const val = this.get(game);
    switch (game) {
      case 'memory':
        el.textContent = val
          ? `Best: ${val.moves} moves in ${this.formatTime(val.seconds)}`
          : 'Best: —';
        break;
      case 'asteroids':
      case 'pacman':
        el.textContent = val != null ? `Best score: ${val}` : 'Best score: —';
        break;
      case 'questions':
        el.textContent = val != null ? `Best guess: ${val} questions` : 'Best guess: —';
        break;
      case 'drive':
        el.textContent = val != null ? `Best lap: ${this.formatLap(val)}` : 'Best lap: —';
        break;
      default:
        break;
    }
  },

  updateAllDisplays() {
    ['memory', 'asteroids', 'pacman', 'questions', 'drive'].forEach(g => this.updateDisplay(g));
  },
};
