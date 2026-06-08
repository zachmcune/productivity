(function () {
  const BrainBreak = window.BrainBreak;

  const astCanvas = document.getElementById('ast-canvas');
  const astCtx = astCanvas.getContext('2d');
  const AST_W = 480;
  const AST_H = 480;
  let astShip;
  let astBullets;
  let astRocks;
  let astScore;
  let astLives;
  let astLevel;
  let astRunning;
  let astKeys;

  function astInit() {
    astKeys = {};
    astRunning = false;
    document.getElementById('ast-message').textContent = 'Press Start to play.';
  }

  function astStart() {
    astScore = 0;
    astLives = 3;
    astLevel = 1;
    astShip = { x: AST_W / 2, y: AST_H / 2, angle: -Math.PI / 2, vx: 0, vy: 0, invuln: 0 };
    astBullets = [];
    astRocks = [];
    astSpawnRocks(4);
    astRunning = true;
    astUpdateHUD();
    document.getElementById('ast-message').textContent = 'Destroy asteroids before they hit you.';
    if (BrainBreak.gameLoops.asteroids) cancelAnimationFrame(BrainBreak.gameLoops.asteroids);
    astLoop();
  }

  function astSpawnRocks(count, x, y, size) {
    for (let i = 0; i < count; i++) {
      const s = size || (Math.random() < 0.5 ? 40 : 25);
      astRocks.push({
        x: x ?? Math.random() * AST_W,
        y: y ?? Math.random() * AST_H,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: s,
        verts: astMakeVerts(s),
      });
    }
  }

  function astMakeVerts(size) {
    const n = 8 + Math.floor(Math.random() * 4);
    const verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = size * (0.7 + Math.random() * 0.3);
      verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    return verts;
  }

  function astWrap(o) {
    if (o.x < 0) o.x += AST_W;
    if (o.x > AST_W) o.x -= AST_W;
    if (o.y < 0) o.y += AST_H;
    if (o.y > AST_H) o.y -= AST_H;
  }

  function astUpdateHUD() {
    document.getElementById('ast-score').textContent = astScore;
    document.getElementById('ast-lives').textContent = astLives;
    document.getElementById('ast-level').textContent = astLevel;
  }

  function astLoop() {
    if (!astRunning || BrainBreak.activeGame !== 'asteroids') return;

    if (astKeys.ArrowLeft) astShip.angle -= 0.08;
    if (astKeys.ArrowRight) astShip.angle += 0.08;
    if (astKeys.ArrowUp) {
      astShip.vx += Math.cos(astShip.angle) * 0.15;
      astShip.vy += Math.sin(astShip.angle) * 0.15;
    }
    astShip.vx *= 0.99;
    astShip.vy *= 0.99;
    astShip.x += astShip.vx;
    astShip.y += astShip.vy;
    astWrap(astShip);
    if (astShip.invuln > 0) astShip.invuln--;

    astBullets.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      astWrap(b);
    });
    astBullets = astBullets.filter(b => b.life > 0);

    astRocks.forEach(r => {
      r.x += r.vx;
      r.y += r.vy;
      astWrap(r);
    });

    for (let i = astBullets.length - 1; i >= 0; i--) {
      for (let j = astRocks.length - 1; j >= 0; j--) {
        const b = astBullets[i];
        const r = astRocks[j];
        const dx = b.x - r.x;
        const dy = b.y - r.y;
        if (dx * dx + dy * dy < r.size * r.size) {
          astBullets.splice(i, 1);
          astScore += r.size > 30 ? 20 : 50;
          if (r.size > 30) {
            astSpawnRocks(2, r.x, r.y, 18);
          }
          astRocks.splice(j, 1);
          break;
        }
      }
    }

    if (astShip.invuln <= 0) {
      for (const r of astRocks) {
        const dx = astShip.x - r.x;
        const dy = astShip.y - r.y;
        if (dx * dx + dy * dy < (r.size + 8) ** 2) {
          astLives--;
          astShip.invuln = 90;
          astShip.x = AST_W / 2;
          astShip.y = AST_H / 2;
          astShip.vx = 0;
          astShip.vy = 0;
          astUpdateHUD();
          if (astLives <= 0) {
            astRunning = false;
            const text = `Game over! Final score: ${astScore}`;
            document.getElementById('ast-message').textContent = text;
            if (window.GameScores) {
              GameScores.tryRecord('asteroids', astScore).then(isNew => {
                if (isNew) document.getElementById('ast-message').textContent = `${text} New high score!`;
              });
            }
            return;
          }
          break;
        }
      }
    }

    if (astRocks.length === 0) {
      astLevel++;
      astSpawnRocks(3 + astLevel);
      astUpdateHUD();
      document.getElementById('ast-message').textContent = `Wave ${astLevel}!`;
    }

    astDraw();
    astUpdateHUD();
    BrainBreak.gameLoops.asteroids = requestAnimationFrame(astLoop);
  }

  function astDraw() {
    astCtx.fillStyle = '#000';
    astCtx.fillRect(0, 0, AST_W, AST_H);

    astRocks.forEach(r => {
      astCtx.strokeStyle = '#aaa';
      astCtx.lineWidth = 1.5;
      astCtx.beginPath();
      r.verts.forEach((v, i) => {
        const px = r.x + v.x;
        const py = r.y + v.y;
        if (i === 0) astCtx.moveTo(px, py);
        else astCtx.lineTo(px, py);
      });
      astCtx.closePath();
      astCtx.stroke();
    });

    astCtx.fillStyle = '#fff';
    astBullets.forEach(b => {
      astCtx.beginPath();
      astCtx.arc(b.x, b.y, 2, 0, Math.PI * 2);
      astCtx.fill();
    });

    if (astShip.invuln <= 0 || Math.floor(astShip.invuln / 5) % 2) {
      astCtx.save();
      astCtx.translate(astShip.x, astShip.y);
      astCtx.rotate(astShip.angle);
      astCtx.strokeStyle = '#fff';
      astCtx.lineWidth = 2;
      astCtx.beginPath();
      astCtx.moveTo(12, 0);
      astCtx.lineTo(-8, -7);
      astCtx.lineTo(-5, 0);
      astCtx.lineTo(-8, 7);
      astCtx.closePath();
      astCtx.stroke();
      astCtx.restore();
    }
  }

  function astShoot() {
    if (!astRunning) return;
    astBullets.push({
      x: astShip.x + Math.cos(astShip.angle) * 14,
      y: astShip.y + Math.sin(astShip.angle) * 14,
      vx: Math.cos(astShip.angle) * 7,
      vy: Math.sin(astShip.angle) * 7,
      life: 50,
    });
  }

  BrainBreak.register('asteroids', {
    init() {
      document.getElementById('ast-start').addEventListener('click', astStart);

      document.addEventListener('keydown', e => {
        if (BrainBreak.activeGame !== 'asteroids') return;
        astKeys[e.key] = true;
        if (e.key === ' ') {
          e.preventDefault();
          astShoot();
        }
      });

      document.addEventListener('keyup', e => {
        if (BrainBreak.activeGame === 'asteroids') astKeys[e.key] = false;
      });
    },
    onActivate: astInit,
    stop() {
      cancelAnimationFrame(BrainBreak.gameLoops.asteroids);
      BrainBreak.gameLoops.asteroids = null;
    },
  });
})();
