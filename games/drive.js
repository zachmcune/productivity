(function () {
  const BrainBreak = window.BrainBreak;

  let driveReady = false;
  let savedBestLap = null;

  function formatLap(secs) {
    if (!secs) return '—';
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return m > 0 ? `${m}:${s.padStart(4, '0')}` : `${s}s`;
  }

  function updateBestDisplay(sessionBest) {
    const display = savedBestLap && sessionBest
      ? Math.min(savedBestLap, sessionBest)
      : (sessionBest || savedBestLap);
    document.getElementById('drive-best').textContent = formatLap(display);
    if (sessionBest && (savedBestLap == null || sessionBest < savedBestLap)) {
      savedBestLap = sessionBest;
      if (window.GameScores) {
        GameScores.tryRecord('drive', sessionBest, { lowerIsBetter: true });
      }
    }
  }

  async function driveInit() {
    if (window.GameScores) {
      await GameScores.init();
      savedBestLap = GameScores.get('drive');
      GameScores.updateDisplay('drive');
    }

    if (!driveReady) {
      window.DriveGame.init(document.getElementById('drive-container'), hud => {
        document.getElementById('drive-speed').textContent = hud.speed;
        document.getElementById('drive-laps').textContent = hud.lap;
        updateBestDisplay(hud.best);
      });
      driveReady = true;
      document.getElementById('drive-start').addEventListener('click', () => {
        if (BrainBreak.activeGame !== 'drive') return;
        window.DriveGame.start();
        document.getElementById('drive-message').textContent = 'Go! Cross the white line to finish a lap.';
      });
    }
    document.getElementById('drive-message').textContent = 'Press Start, then race around the oval track!';
  }

  BrainBreak.register('drive', {
    init() {},
    onActivate: driveInit,
    stop() {
      window.DriveGame.stop();
    },
  });
})();
