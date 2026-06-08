/** Brain Break game picker and lifecycle manager. */
window.BrainBreak = {
  activeGame: 'memory',
  gameLoops: { asteroids: null, pacman: null },
  _games: {},

  register(name, api) {
    this._games[name] = api;
  },

  switchGame(name) {
    if (this.activeGame === name) return;
    this.stopGame(this.activeGame);
    this.activeGame = name;
    document.querySelectorAll('.game-pick').forEach(b =>
      b.classList.toggle('active', b.dataset.game === name)
    );
    document.querySelectorAll('.game-view').forEach(v =>
      v.classList.toggle('active', v.id === 'game-' + name)
    );
    this._games[name]?.onActivate?.();
  },

  stopGame(name) {
    this._games[name]?.stop?.();
  },

  async boot() {
    document.querySelectorAll('.game-pick').forEach(btn => {
      btn.addEventListener('click', () => this.switchGame(btn.dataset.game));
    });
    if (window.GameScores) {
      await GameScores.init();
      GameScores.updateAllDisplays();
    }
    Object.values(this._games).forEach(g => g.init?.());
    this.switchGame('memory');
  },
};
