(function () {
  const TRACK_A = 42;
  const TRACK_B = 26;
  const TRACK_INNER = 0.62;
  const TRACK_OUTER = 0.98;

  let container, renderer, scene, camera, car, carState, keys, animId, running, clock;
  let lapStart, bestLap, currentLap, lapCount, onHudUpdate;

  function createCar() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe94560 });
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x2d2d44 });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const trimMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 4.2), bodyMat);
    chassis.position.y = 0.55;
    group.add(chassis);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 2.2), cabinMat);
    cabin.position.set(0, 1.05, -0.2);
    group.add(cabin);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.08, 0.6), trimMat);
    stripe.position.set(0, 0.8, 1.4);
    group.add(stripe);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
    [[-1, 1.5], [1, 1.5], [-1, -1.5], [1, -1.5]].forEach(([x, z]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.42, z);
      group.add(w);
    });

    group.userData.wheels = [];
    group.children.forEach(c => {
      if (c.geometry === wheelGeo) group.userData.wheels.push(c);
    });
    return group;
  }

  function buildTrack(scene) {
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(280, 280),
      new THREE.MeshLambertMaterial({ color: 0x3a7d44 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    scene.add(grass);

    const trackShape = new THREE.Shape();
    trackShape.absellipse(0, 0, TRACK_A, TRACK_B, 0, Math.PI * 2, false, 64);
    const hole = new THREE.Path();
    hole.absellipse(0, 0, TRACK_A * TRACK_INNER, TRACK_B * TRACK_INNER, 0, Math.PI * 2, true, 64);
    trackShape.holes.push(hole);

    const track = new THREE.Mesh(
      new THREE.ShapeGeometry(trackShape),
      new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
    );
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.02;
    scene.add(track);

    const curbMat = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
    const curbGeo = new THREE.BoxGeometry(1.2, 0.35, 1.2);
    const steps = 72;
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const ox = Math.cos(t) * TRACK_A * TRACK_OUTER;
      const oz = Math.sin(t) * TRACK_B * TRACK_OUTER;
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(ox, 0.18, oz);
      scene.add(curb);
    }

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const startLine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 8), lineMat);
    startLine.position.set(TRACK_A * 0.8, 0.06, 0);
    scene.add(startLine);

    const innerGrass = new THREE.Mesh(
      new THREE.CircleGeometry(TRACK_A * TRACK_INNER * 0.95, 48),
      new THREE.MeshLambertMaterial({ color: 0x4caf50 })
    );
    innerGrass.rotation.x = -Math.PI / 2;
    innerGrass.position.y = 0.01;
    scene.add(innerGrass);

    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 2, 6),
        new THREE.MeshLambertMaterial({ color: 0x5c3d2e })
      );
      trunk.position.y = 1;
      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 3, 8),
        new THREE.MeshLambertMaterial({ color: 0x2e6b3e })
      );
      leaves.position.y = 3;
      tree.add(trunk, leaves);
      tree.position.set(Math.cos(t) * 55, 0, Math.sin(t) * 38);
      scene.add(tree);
    }
  }

  function trackNorm(x, z) {
    return (x / TRACK_A) ** 2 + (z / TRACK_B) ** 2;
  }

  function resetCar() {
    carState = {
      x: TRACK_A * 0.78,
      z: 0,
      angle: Math.PI / 2,
      speed: 0,
      steer: 0,
      lastCross: false,
    };
    car.position.set(carState.x, 0, carState.z);
    car.rotation.y = carState.angle;
    lapStart = clock.getElapsedTime();
    currentLap = 0;
  }

  function updateCar(dt) {
    const accel = keys.up ? 28 : keys.down ? -14 : 0;
    const turnInput = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);

    carState.speed += accel * dt;
    carState.speed *= keys.up || keys.down ? 0.985 : 0.96;
    carState.speed = Math.max(-12, Math.min(38, carState.speed));

    if (Math.abs(carState.speed) > 0.5) {
      carState.angle += turnInput * 2.2 * dt * Math.sign(carState.speed);
    }

    carState.x += Math.sin(carState.angle) * carState.speed * dt;
    carState.z += Math.cos(carState.angle) * carState.speed * dt;

    const norm = trackNorm(carState.x, carState.z);
    if (norm > TRACK_OUTER * TRACK_OUTER) {
      const scale = (TRACK_OUTER * 0.96) / Math.sqrt(norm);
      carState.x *= scale;
      carState.z *= scale;
      carState.speed *= 0.7;
    } else if (norm < TRACK_INNER * TRACK_INNER) {
      const scale = (TRACK_INNER * 1.04) / Math.sqrt(norm);
      carState.x *= scale;
      carState.z *= scale;
      carState.speed *= 0.75;
    }

    car.position.set(carState.x, 0, carState.z);
    car.rotation.y = carState.angle;

    (car.userData.wheels || []).forEach(w => {
      w.rotation.x += carState.speed * dt * 0.8;
    });

    const crossed = carState.z < 0 && carState.x > TRACK_A * 0.5;
    if (crossed && !carState.lastCross && carState.speed > 5) {
      const now = clock.getElapsedTime();
      const lap = now - lapStart;
      if (lap > 2) {
        lapCount++;
        if (!bestLap || lap < bestLap) bestLap = lap;
        currentLap = lap;
      }
      lapStart = now;
    }
    carState.lastCross = crossed;

    if (onHudUpdate) {
      onHudUpdate({
        speed: Math.abs(Math.round(carState.speed * 2.2)),
        lap: lapCount,
        best: bestLap,
        current: currentLap,
      });
    }
  }

  function updateCamera() {
    const dist = 10;
    const height = 5.5;
    const cx = carState.x - Math.sin(carState.angle) * dist;
    const cz = carState.z - Math.cos(carState.angle) * dist;
    camera.position.lerp(new THREE.Vector3(cx, height, cz), 0.08);
    camera.lookAt(carState.x, 1.2, carState.z);
  }

  function loop() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    updateCar(dt);
    updateCamera();
    renderer.render(scene, camera);
    animId = requestAnimationFrame(loop);
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function bindKeys() {
    keys = { up: false, down: false, left: false, right: false };
    const set = (e, v) => {
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') keys.up = v;
      if (k === 'ArrowDown' || k === 's' || k === 'S') keys.down = v;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = v;
      if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = v;
    };
    window.addEventListener('keydown', e => {
      if (!running) return;
      set(e, true);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', e => set(e, false));
  }

  window.DriveGame = {
    init(el, hudCallback) {
      container = el;
      onHudUpdate = hudCallback;
      clock = new THREE.Clock();
      lapCount = 0;
      bestLap = null;
      currentLap = 0;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x6eb5ff);
      scene.fog = new THREE.Fog(0x6eb5ff, 60, 220);

      camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const sun = new THREE.DirectionalLight(0xffffff, 0.85);
      sun.position.set(40, 80, 30);
      sun.castShadow = true;
      scene.add(sun);

      buildTrack(scene);
      car = createCar();
      scene.add(car);
      resetCar();
      bindKeys();
      onResize();
      window.addEventListener('resize', onResize);
    },

    start() {
      if (!scene) return;
      running = true;
      clock.getDelta();
      resetCar();
      if (animId) cancelAnimationFrame(animId);
      loop();
    },

    stop() {
      running = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    },

    isRunning() {
      return running;
    },
  };
})();
