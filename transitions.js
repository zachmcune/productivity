(function () {
  const ENTER_MS = 2000;
  const MAX_EXIT_MS = 5500;
  const STORAGE_KEY = 'hub-transition';
  const SETTINGS_KEY = 'hub-transitions-enabled';
  const MAX_BALLS = 900;
  const SAMPLE_STEP = 4;
  const GRAVITY = 0.6;
  const BOUNCE = 0.3;
  const ROLL_ACCEL = 0.22;
  const GROUND_FRICTION = 0.985;

  const MELT_SELECTORS = [
    '.card-icon',
    '.game-pick',
    '.nav-home',
    '.nav-brand',
    '.home-header h1',
    'h1.page-title',
  ];

  const FALLBACK_PALETTE = [
    '#0d0d12', '#1e1e2a', '#6c8cff', '#4ecca3', '#e94560',
    '#c77dff', '#f0b429', '#8888a0', '#eaeaf0',
  ];

  let canvas, ctx, running = false;
  let cachedMeltElements = [];

  function setupCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'transition-canvas';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getPacman() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const groundY = H - 44;
    const radius = Math.min(56, W * 0.1);
    const x = W + radius;
    const targetX = W - radius * 0.55;
    const y = groundY - radius + 6;
    return {
      x,
      targetX,
      y,
      radius,
      groundY,
      mouthX: targetX - radius * 0.82,
      facing: Math.PI,
      slideIn: true,
    };
  }

  function drawGround(groundY) {
    ctx.strokeStyle = 'rgba(46, 46, 61, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(window.innerWidth, groundY);
    ctx.stroke();
  }

  function drawPacman(pac, chompPhase) {
    const slide = pac.slideIn
      ? Math.min(1, Math.max(0, (performance.now() - pac.slideStart - (pac.slideDelay || 0)) / 550))
      : 1;
    const ease = 1 - Math.pow(1 - slide, 3);
    pac.x = pac.slideIn
      ? window.innerWidth + pac.radius + (pac.targetX - (window.innerWidth + pac.radius)) * ease
      : pac.targetX;
    pac.mouthX = pac.x - pac.radius * 0.82;

    const mouth = 0.38 + 0.16 * Math.sin(chompPhase);

    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.moveTo(pac.x, pac.y);
    // false = draw the large body arc; true was only filling the mouth wedge
    ctx.arc(pac.x, pac.y, pac.radius, pac.facing + mouth, pac.facing - mouth, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    const eyeX = pac.x + pac.radius * 0.22;
    const eyeY = pac.y - pac.radius * 0.38;
    ctx.arc(eyeX, eyeY, pac.radius * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }

  function getMeltableElements() {
    const seen = new Set();
    const els = [];
    MELT_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (seen.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        seen.add(el);
        els.push(el);
      });
    });
    return els;
  }

  function accentFromElement(el) {
    const card = el.closest('.card');
    if (!card) return null;
    return getComputedStyle(card).getPropertyValue('--card-accent').trim() || null;
  }

  function drawElementToCanvas(el, octx, w, h) {
    const style = getComputedStyle(el);
    const accent = accentFromElement(el);

    if (el.classList.contains('card-icon')) {
      octx.font = `${h * 0.88}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText(el.textContent.trim(), w / 2, h / 2);
      return;
    }

    if (el.classList.contains('game-pick') || el.classList.contains('nav-home')) {
      octx.font = `500 ${Math.min(h * 0.38, 15)}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillStyle = style.color || '#eaeaf0';
      octx.fillText(el.textContent.trim(), w / 2, h / 2);
      return;
    }

    if (el.classList.contains('nav-brand') || el.matches('.home-header h1')) {
      const fontSize = parseFloat(style.fontSize) || 28;
      octx.font = `500 ${fontSize}px "DM Sans", system-ui, sans-serif`;
      octx.textBaseline = 'alphabetic';
      const span = el.querySelector('span');
      const full = el.textContent;
      const plain = span ? full.replace(span.textContent, '').trim() : full;
      const accentText = span ? span.textContent : '';
      const accentColor = span ? (getComputedStyle(span).color || '#6c8cff') : style.color;
      let x = 0;
      const y = fontSize * 0.85;
      if (plain) {
        octx.fillStyle = style.color || '#eaeaf0';
        octx.fillText(plain + (accentText ? ' ' : ''), x, y);
        x += octx.measureText(plain + (accentText ? ' ' : '')).width;
      }
      if (accentText) {
        octx.fillStyle = accentColor;
        octx.fillText(accentText, x, y);
      }
      return;
    }

    if (el.classList.contains('page-title')) {
      const fontSize = parseFloat(style.fontSize) || 28;
      octx.font = `500 ${fontSize}px "DM Sans", system-ui, sans-serif`;
      octx.fillStyle = style.color || '#eaeaf0';
      octx.textBaseline = 'alphabetic';
      octx.fillText(el.textContent.trim(), 0, fontSize * 0.85);
      return;
    }

    octx.fillStyle = accent || style.color || '#6c8cff';
    octx.fillRect(0, 0, w, h);
  }

  function rasterizeElement(el, priority) {
    const rect = el.getBoundingClientRect();
    const w = Math.max(4, Math.ceil(rect.width));
    const h = Math.max(4, Math.ceil(rect.height));
    const dpr = 2;
    const off = document.createElement('canvas');
    off.width = w * dpr;
    off.height = h * dpr;
    const octx = off.getContext('2d');
    octx.scale(dpr, dpr);
    drawElementToCanvas(el, octx, w, h);

    const data = octx.getImageData(0, 0, off.width, off.height).data;
    const accent = accentFromElement(el);
    const points = [];
    const step = priority ? SAMPLE_STEP - 1 : SAMPLE_STEP;

    for (let py = 0; py < off.height; py += step) {
      for (let px = 0; px < off.width; px += step) {
        const i = (py * off.width + px) * 4;
        if (data[i + 3] < 90) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const isDark = r < 30 && g < 30 && b < 35;
        const color = isDark && accent ? accent : `rgb(${r},${g},${b})`;
        points.push({
          homeX: rect.left + px / dpr + (Math.random() - 0.5) * 2,
          homeY: rect.top + py / dpr + (Math.random() - 0.5) * 2,
          color,
        });
      }
    }
    return points;
  }

  function colorsForElement(el) {
    const accent = accentFromElement(el);
    const textColor = getComputedStyle(el).color || '#eaeaf0';
    if (accent) return [accent, textColor, '#eaeaf0', '#8888a0'];
    return [textColor, '#eaeaf0', '#6c8cff', '#4ecca3', '#c77dff'];
  }

  function fillElementWithBalls(rect, colors, count) {
    const points = [];
    const cols = Math.max(2, Math.ceil(Math.sqrt(count * (rect.width / Math.max(rect.height, 1)))));
    const rows = Math.ceil(count / cols);
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      points.push({
        homeX: rect.left + ((col + 0.5) / cols) * rect.width + (Math.random() - 0.5) * 3,
        homeY: rect.top + ((row + 0.5) / rows) * rect.height + (Math.random() - 0.5) * 3,
        color: colors[i % colors.length],
      });
    }
    return points;
  }

  function spawnPointsForElement(el, priority) {
    const rect = el.getBoundingClientRect();
    const colors = colorsForElement(el);
    let points = rasterizeElement(el, priority);

    const isEmoji = el.classList.contains('card-icon');
    const minBalls = priority ? 42 : isEmoji ? 30 : 18;

    if (isEmoji || points.length < minBalls) {
      const needed = Math.max(minBalls - points.length, isEmoji ? minBalls : 12);
      points = points.concat(fillElementWithBalls(rect, colors, needed));
    }

    return points;
  }

  function pushBall(balls, p, priority) {
    if (balls.length >= MAX_BALLS) return;
    const baseRadius = 3.5 + Math.random() * 4;
    balls.push({
      x: p.homeX,
      y: p.homeY,
      homeX: p.homeX,
      homeY: p.homeY,
      vx: 0,
      vy: 0,
      baseRadius,
      radius: 0.5,
      color: p.color,
      alpha: 0,
      state: 'emerge',
      emergeDelay: Math.random() * (priority ? 200 : 400) + 80,
      grounded: false,
      eaten: false,
    });
  }

  function buildBallsFromIcons(clickedLink) {
    cachedMeltElements = getMeltableElements();
    const balls = [];
    const clickedCard = clickedLink?.querySelector('.card-icon') || clickedLink;

    cachedMeltElements.forEach(el => {
      const priority = clickedCard && (
        el === clickedCard || el.contains(clickedCard) ||
        clickedCard.contains(el) || el.closest('a') === clickedLink
      );
      const points = spawnPointsForElement(el, priority);
      const keepChance = priority ? 1 : 0.7;

      points.forEach(p => {
        if (!priority && Math.random() > keepChance) return;
        pushBall(balls, p, priority);
      });
    });

    return balls;
  }

  function hideMeltSources() {
    cachedMeltElements.forEach(el => el.classList.add('melt-hidden'));
  }

  function showMeltSources() {
    document.querySelectorAll('.melt-hidden').forEach(el => el.classList.remove('melt-hidden'));
  }

  function hideChrome() {
    document.body.classList.add('transition-active', 'transition-chrome-hidden');
  }

  function showChrome() {
    document.body.classList.remove('transition-chrome-hidden', 'transition-active');
  }

  function drawBall(b) {
    if (b.alpha <= 0.01) return;
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, Math.max(0.5, b.radius), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function updateBallExit(b, pac, elapsed) {
    if (b.eaten) return false;

    if (b.state === 'emerge') {
      if (elapsed < b.emergeDelay) return true;
      b.alpha = Math.min(1, b.alpha + 0.07);
      b.radius = Math.min(b.baseRadius, b.radius + 0.35);
      if (b.alpha >= 0.95 && b.radius >= b.baseRadius * 0.9) {
        b.state = 'fall';
        b.vx = (Math.random() - 0.5) * 2;
        b.vy = Math.random() * 1.5;
      }
      return true;
    }

    if (b.state === 'fall' || b.state === 'roll') {
      b.vy += GRAVITY;
      b.x += b.vx;
      b.y += b.vy;

      const floor = pac.groundY - b.radius;
      if (b.y >= floor) {
        b.y = floor;
        if (Math.abs(b.vy) > 1.5) {
          b.vy *= -BOUNCE;
          b.vx += (Math.random() - 0.5) * 1.5;
        } else {
          b.vy = 0;
          b.state = 'roll';
          b.grounded = true;
        }
      }

      if (b.state === 'roll') {
        const toMouth = pac.mouthX - b.x;
        b.vx += Math.sign(toMouth) * ROLL_ACCEL;
        b.vx *= GROUND_FRICTION;
        b.vy = 0;
        b.y = floor;
        if (Math.abs(b.vx) < 0.15 && Math.abs(toMouth) > 30) b.vx += Math.sign(toMouth) * 0.4;
      }

      const inMouth = b.x >= pac.mouthX - b.radius * 0.5 &&
        Math.hypot(b.x - pac.mouthX, b.y - pac.y) < pac.radius * 1.05;
      if (inMouth || b.x > pac.x - pac.radius * 0.3) {
        b.state = 'eaten';
      }
    }

    if (b.state === 'eaten') {
      b.alpha -= 0.14;
      b.radius *= 0.9;
      b.x += 1.5;
      if (b.alpha <= 0) b.eaten = true;
      return !b.eaten;
    }

    return true;
  }

  function isInternalLink(link) {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (link.target === '_blank' || link.download) return false;
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin && /\.html?$/.test(url.pathname);
    } catch {
      return false;
    }
  }

  function playExit(clickedLink, onDone) {
    if (running) return;
    running = true;
    canvas.classList.add('active');

    const balls = buildBallsFromIcons(clickedLink);
    hideMeltSources();
    hideChrome();

    const pac = getPacman();
    pac.slideStart = performance.now();
    pac.slideDelay = 600;

    const t0 = performance.now();
    let chompPhase = 0;

    function frame(now) {
      const elapsed = now - t0;
      chompPhase += 0.3;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawGround(pac.groundY);

      balls.forEach(b => updateBallExit(b, pac, elapsed));
      balls.forEach(drawBall);
      drawPacman(pac, chompPhase);

      const active = balls.filter(b => !b.eaten && b.alpha > 0.02).length;
      const minTimePassed = elapsed > 1800;
      const allEaten = active === 0;

      if ((allEaten && minTimePassed) || elapsed > MAX_EXIT_MS) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        canvas.classList.remove('active');
        running = false;
        onDone();
        return;
      }
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function playEnter() {
    if (running) return;
    running = true;
    canvas.classList.add('active');
    hideChrome();

    const balls = buildBallsFromIcons(null);
    const pac = getPacman();
    pac.slideIn = false;
    pac.x = pac.targetX;
    pac.mouthX = pac.x - pac.radius * 0.82;
    hideMeltSources();

    balls.forEach((b, i) => {
      b.x = pac.mouthX - 10;
      b.y = pac.y + (Math.random() - 0.5) * pac.radius * 0.5;
      b.vx = -5 - Math.random() * 4;
      b.vy = -7 - Math.random() * 5;
      b.alpha = 0.95;
      b.radius = b.baseRadius * 0.7;
      b.state = 'spit';
      b.spitDelay = i * 3;
      b.grounded = false;
      b.eaten = false;
    });

    const t0 = performance.now();
    let chompPhase = 0;

    function frame(now) {
      const t = Math.min(1, (now - t0) / ENTER_MS);
      const elapsed = now - t0;
      chompPhase += 0.28;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawGround(pac.groundY);

      let arrived = 0;

      balls.forEach(b => {
        if (b.eaten) return;

        if (b.state === 'spit') {
          if (elapsed < b.spitDelay) return;
          b.vy += GRAVITY * 0.45;
          b.x += b.vx;
          b.y += b.vy;
          b.vx *= 0.99;

          const dist = Math.hypot(b.homeX - b.x, b.homeY - b.y);
          if (dist < 30 || t > 0.35) b.state = 'gather';
        }

        if (b.state === 'gather') {
          const ease = 1 - Math.pow(1 - Math.min(1, t * 1.4), 3);
          b.x += (b.homeX - b.x) * (0.08 + ease * 0.18);
          b.y += (b.homeY - b.y) * (0.08 + ease * 0.18);
          b.radius += (b.baseRadius - b.radius) * 0.1;

          if (Math.hypot(b.homeX - b.x, b.homeY - b.y) < 4) arrived++;
        }

        if (t > 0.7) {
          const fade = (t - 0.7) / 0.3;
          b.alpha = 0.95 * (1 - fade);
        }

        drawBall(b);
      });

      drawPacman(pac, chompPhase);

      if (t < 1) requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        canvas.classList.remove('active');
        document.documentElement.classList.remove('page-enter-pending');
        showMeltSources();
        showChrome();
        running = false;
      }
    }

    requestAnimationFrame(frame);
  }

  function isTransitionsEnabled() {
    if (window.HubStorage?.isCloud()) {
      return HubStorage.getSync(SETTINGS_KEY, 'true') !== 'false';
    }
    return localStorage.getItem(SETTINGS_KEY) !== 'false';
  }

  async function createToggle() {
    let enabled = true;
    if (window.HubStorage) {
      await HubStorage.init();
      const stored = await HubStorage.get(SETTINGS_KEY, 'true');
      enabled = stored !== 'false';
    } else {
      enabled = isTransitionsEnabled();
    }

    const wrap = document.createElement('div');
    wrap.id = 'transition-toggle';
    wrap.className = 'transition-toggle';
    wrap.innerHTML = `
      <label class="transition-toggle-label" title="Page transition animations">
        <span class="transition-toggle-text">Animations</span>
        <input type="checkbox" id="transition-toggle-input" ${enabled ? 'checked' : ''}>
        <span class="transition-toggle-slider"></span>
      </label>
    `;
    document.body.appendChild(wrap);

    document.getElementById('transition-toggle-input').addEventListener('change', async (e) => {
      const value = e.target.checked ? 'true' : 'false';
      if (window.HubStorage) {
        await HubStorage.set(SETTINGS_KEY, value);
      } else {
        localStorage.setItem(SETTINGS_KEY, value);
      }
    });
  }

  async function init() {
    if (window.HubStorage) await HubStorage.init();
    setupCanvas();
    await createToggle();

    document.addEventListener('click', e => {
      if (!isTransitionsEnabled()) return;
      const link = e.target.closest('a[href]');
      if (!link || !isInternalLink(link) || running) return;
      e.preventDefault();
      const dest = link.href;
      playExit(link, () => {
        sessionStorage.setItem(STORAGE_KEY, '1');
        window.location.href = dest;
      });
    });

    if (!isTransitionsEnabled()) {
      document.documentElement.classList.remove('page-enter-pending');
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      sessionStorage.removeItem(STORAGE_KEY);
      requestAnimationFrame(() => playEnter());
    } else {
      document.documentElement.classList.remove('page-enter-pending');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
