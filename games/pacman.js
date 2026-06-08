(function () {
  const BrainBreak = window.BrainBreak;

  const pacCanvas = document.getElementById('pac-canvas');
  const pacCtx = pacCanvas.getContext('2d');
  const PAC_CELL = 12;

  const LETTER_R = [
    '###########',
    '#.........#',
    '#.#######.#',
    '#.#.....#.#',
    '#.#######.#',
    '#.#.......#',
    '#.#.......#',
    '#.#.....###',
    '#.#......##',
    '#.#######.#',
    '#.........#',
    '###########',
  ];
  const LETTER_A = [
    '###########',
    '#.........#',
    '#.#######.#',
    '#.........#',
    '#.#######.#',
    '#.#.....#.#',
    '#.#.....#.#',
    '#.#.....#.#',
    '#.#######.#',
    '#.........#',
    '#.........#',
    '###########',
  ];
  const LETTER_D = [
    '###########',
    '#.........#',
    '#.#######.#',
    '#.#.....#.#',
    '#.#.....#.#',
    '#.#.....#.#',
    '#.#.....#.#',
    '#.#.....#.#',
    '#.#######.#',
    '#.........#',
    '#.........#',
    '###########',
  ];

  function pacBuildMap() {
    const letters = [LETTER_R, LETTER_A, LETTER_D];
    const h = letters[0].length;
    const rows = [];
    const innerW = letters.reduce((w, l, i) => w + l[0].length + (i < 2 ? 1 : 0), 0);
    rows.push('#'.repeat(innerW + 2));
    for (let r = 0; r < h; r++) {
      let row = '#';
      letters.forEach((l, i) => {
        row += l[r];
        if (i < 2) row += '#';
      });
      row += '#';
      rows.push(row);
    }
    rows.push('#'.repeat(innerW + 2));
    return rows;
  }

  let pacMap;
  let pacGrid;
  let pacPlayer;
  let pacGhosts;
  let pacScore;
  let pacLives;
  let pacRunning;
  let pacDir;
  let pacNextDir;
  let pacDotsLeft;
  let pacTick = 0;

  function pacInit() {
    pacRunning = false;
    document.getElementById('pac-message').textContent = 'Press Start to play the RAD maze.';
  }

  function pacParseMap() {
    pacMap = pacBuildMap();
    pacGrid = [];
    pacDotsLeft = 0;
    let spawn = null;
    const ghostSpawns = [];
    for (let y = 0; y < pacMap.length; y++) {
      pacGrid[y] = [];
      for (let x = 0; x < pacMap[y].length; x++) {
        const ch = pacMap[y][x];
        if (ch === '#') pacGrid[y][x] = 1;
        else {
          pacGrid[y][x] = 2;
          pacDotsLeft++;
          if (!spawn) spawn = { x, y };
          if (ghostSpawns.length < 2 && x > pacMap[y].length - 8) ghostSpawns.push({ x, y });
        }
      }
    }
    if (ghostSpawns.length < 2) ghostSpawns.push({ x: spawn.x + 5, y: spawn.y });
    return { spawn, ghostSpawns };
  }

  function pacStart() {
    const { spawn, ghostSpawns } = pacParseMap();
    pacScore = 0;
    pacLives = 3;
    pacPlayer = { x: spawn.x, y: spawn.y, px: spawn.x, py: spawn.y, mouth: 0 };
    pacGhosts = ghostSpawns.map((g, i) => ({
      x: g.x,
      y: g.y,
      px: g.x,
      py: g.y,
      color: ['#ff4444', '#44bbff'][i],
      dir: [{ x: 0, y: 0 }, { x: -1, y: 0 }][i],
    }));
    pacDir = { x: 0, y: 0 };
    pacNextDir = { x: 0, y: 0 };
    pacRunning = true;
    pacUpdateHUD();
    document.getElementById('pac-message').textContent = 'Eat all the dots!';
    if (BrainBreak.gameLoops.pacman) cancelAnimationFrame(BrainBreak.gameLoops.pacman);
    pacLoop();
  }

  function pacCanMove(x, y) {
    if (y < 0 || y >= pacGrid.length || x < 0 || x >= pacGrid[0].length) return false;
    return pacGrid[y][x] !== 1;
  }

  function pacUpdateHUD() {
    document.getElementById('pac-score').textContent = pacScore;
    document.getElementById('pac-dots').textContent = pacDotsLeft;
    document.getElementById('pac-lives').textContent = pacLives;
  }

  function pacLoop() {
    if (!pacRunning || BrainBreak.activeGame !== 'pacman') return;
    pacTick++;

    if (pacTick % 6 === 0) {
      if (pacCanMove(pacPlayer.x + pacNextDir.x, pacPlayer.y + pacNextDir.y)) {
        pacDir = { ...pacNextDir };
      }
      if (pacCanMove(pacPlayer.x + pacDir.x, pacPlayer.y + pacDir.y)) {
        pacPlayer.px = pacPlayer.x;
        pacPlayer.py = pacPlayer.y;
        pacPlayer.x += pacDir.x;
        pacPlayer.y += pacDir.y;
        if (pacGrid[pacPlayer.y][pacPlayer.x] === 2) {
          pacGrid[pacPlayer.y][pacPlayer.x] = 0;
          pacDotsLeft--;
          pacScore += 10;
          pacUpdateHUD();
          if (pacDotsLeft <= 0) {
            pacRunning = false;
            const text = `You cleared RAD! Score: ${pacScore} 🎉`;
            document.getElementById('pac-message').textContent = text;
            if (window.GameScores) {
              GameScores.tryRecord('pacman', pacScore).then(isNew => {
                if (isNew) document.getElementById('pac-message').textContent = `${text} New high score!`;
              });
            }
            pacDraw();
            return;
          }
        }
      }

      pacGhosts.forEach(g => {
        const options = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]
          .filter(d => pacCanMove(g.x + d.x, g.y + d.y) && !(d.x === -g.dir.x && d.y === -g.dir.y));
        if (options.length) {
          const chase = options.reduce((best, d) => {
            const dist = Math.abs(pacPlayer.x - g.x - d.x) + Math.abs(pacPlayer.y - g.y - d.y);
            return dist < best.dist ? { d, dist } : best;
          }, { d: options[0], dist: Infinity });
          if (Math.random() < 0.7) g.dir = chase.d;
          else g.dir = options[Math.floor(Math.random() * options.length)];
        }
        if (pacCanMove(g.x + g.dir.x, g.y + g.dir.y)) {
          g.px = g.x;
          g.py = g.y;
          g.x += g.dir.x;
          g.y += g.dir.y;
        }
        if (g.x === pacPlayer.x && g.y === pacPlayer.y) {
          pacLives--;
          pacUpdateHUD();
          if (pacLives <= 0) {
            pacRunning = false;
            const text = `Game over! Score: ${pacScore}`;
            document.getElementById('pac-message').textContent = text;
            if (window.GameScores) {
              GameScores.tryRecord('pacman', pacScore).then(isNew => {
                if (isNew) document.getElementById('pac-message').textContent = `${text} New high score!`;
              });
            }
            return;
          }
          pacPlayer.x = pacPlayer.px;
          pacPlayer.y = pacPlayer.py;
          document.getElementById('pac-message').textContent = 'Ghost got you!';
        }
      });
    }

    pacPlayer.mouth = (pacPlayer.mouth + 0.3) % (Math.PI * 0.5);
    pacDraw();
    BrainBreak.gameLoops.pacman = requestAnimationFrame(pacLoop);
  }

  function pacDraw() {
    const w = pacGrid[0].length * PAC_CELL;
    const h = pacGrid.length * PAC_CELL;
    pacCanvas.width = w;
    pacCanvas.height = h;

    pacCtx.fillStyle = '#000';
    pacCtx.fillRect(0, 0, w, h);

    for (let y = 0; y < pacGrid.length; y++) {
      for (let x = 0; x < pacGrid[0].length; x++) {
        if (pacGrid[y][x] === 1) {
          pacCtx.fillStyle = '#2244aa';
          pacCtx.fillRect(x * PAC_CELL, y * PAC_CELL, PAC_CELL, PAC_CELL);
        } else if (pacGrid[y][x] === 2) {
          pacCtx.fillStyle = '#ffcc88';
          pacCtx.beginPath();
          pacCtx.arc(x * PAC_CELL + PAC_CELL / 2, y * PAC_CELL + PAC_CELL / 2, 2, 0, Math.PI * 2);
          pacCtx.fill();
        }
      }
    }

    const px = (pacPlayer.px + (pacPlayer.x - pacPlayer.px) * ((pacTick % 6) / 6)) * PAC_CELL + PAC_CELL / 2;
    const py = (pacPlayer.py + (pacPlayer.y - pacPlayer.py) * ((pacTick % 6) / 6)) * PAC_CELL + PAC_CELL / 2;
    let angle = 0;
    if (pacDir.x === 1) angle = 0;
    else if (pacDir.x === -1) angle = Math.PI;
    else if (pacDir.y === 1) angle = Math.PI / 2;
    else if (pacDir.y === -1) angle = -Math.PI / 2;

    pacCtx.fillStyle = '#ffdd00';
    pacCtx.beginPath();
    pacCtx.moveTo(px, py);
    pacCtx.arc(px, py, PAC_CELL / 2 - 1, angle + pacPlayer.mouth, angle - pacPlayer.mouth, true);
    pacCtx.closePath();
    pacCtx.fill();

    pacGhosts.forEach(g => {
      const gx = (g.px + (g.x - g.px) * ((pacTick % 6) / 6)) * PAC_CELL + PAC_CELL / 2;
      const gy = (g.py + (g.y - g.py) * ((pacTick % 6) / 6)) * PAC_CELL + PAC_CELL / 2;
      pacCtx.fillStyle = g.color;
      pacCtx.beginPath();
      pacCtx.arc(gx, gy - 1, PAC_CELL / 2 - 1, Math.PI, 0);
      pacCtx.lineTo(gx + PAC_CELL / 2 - 1, gy + PAC_CELL / 2 - 1);
      pacCtx.lineTo(gx - PAC_CELL / 2 + 1, gy + PAC_CELL / 2 - 1);
      pacCtx.closePath();
      pacCtx.fill();
      pacCtx.fillStyle = '#fff';
      pacCtx.fillRect(gx - 4, gy - 2, 3, 3);
      pacCtx.fillRect(gx + 1, gy - 2, 3, 3);
      pacCtx.fillStyle = '#000';
      pacCtx.fillRect(gx - 3, gy - 1, 1, 2);
      pacCtx.fillRect(gx + 2, gy - 1, 1, 2);
    });
  }

  BrainBreak.register('pacman', {
    init() {
      document.getElementById('pac-start').addEventListener('click', pacStart);

      document.addEventListener('keydown', e => {
        if (BrainBreak.activeGame !== 'pacman' || !pacRunning) return;
        const dirs = {
          ArrowRight: { x: 1, y: 0 },
          ArrowLeft: { x: -1, y: 0 },
          ArrowUp: { x: 0, y: -1 },
          ArrowDown: { x: 0, y: 1 },
        };
        if (dirs[e.key]) {
          e.preventDefault();
          pacNextDir = dirs[e.key];
        }
      });
    },
    onActivate: pacInit,
    stop() {
      cancelAnimationFrame(BrainBreak.gameLoops.pacman);
      BrainBreak.gameLoops.pacman = null;
    },
  });
})();
