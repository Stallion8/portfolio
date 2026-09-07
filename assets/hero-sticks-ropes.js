/**
 * Hero — Sticks & Ropes (idle drift + subtle pointer pull)
 */
(function initHeroSticksRopes() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const layer = hero?.querySelector('.hero__visual-layer');
  if (!layer || !hero || prefersReducedMotion) return;

  const hitzone = document.createElement('div');
  hitzone.className = 'hero__sticks-hitzone';
  hitzone.setAttribute('aria-hidden', 'true');

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__sticks-ropes';
  hitzone.appendChild(canvas);
  layer.insertBefore(hitzone, layer.firstChild);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const NODE_COUNT = 52;
  const STICK_REPULSE = 5200;
  const STICK_RADIUS = 68;
  const COHERE_RADIUS = 140;
  const BOND_DIST = 72;
  const MOUSE_PULL = 0.32;
  const MAX_SPEED = 4.2;
  const POINTER_AURA = 44;
  const CLUSTER_X = 0.5;

  const LEGEND_LINES = [
    [
      { text: 'sticks', color: 'red', phase: 0 },
      { text: ' · ', color: 'graphite', phase: 0.6 },
      { text: 'repel', color: 'graphite', phase: 1.2 }
    ],
    [
      { text: 'ropes', color: 'cyan', phase: 2 },
      { text: ' · ', color: 'graphite', phase: 2.6 },
      { text: 'connect', color: 'graphite', phase: 3.2 }
    ]
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let visible = true;
  let t = 0;
  const legend = { right: 0, bottom: 0, left: 0, lineHeight: 16 };
  const pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0, active: false };

  let nodes = [];
  let springs = [];

  const probe = document.createElement('span');
  probe.style.display = 'none';
  document.body.appendChild(probe);

  function rgb(varName) {
    probe.style.color = `var(${varName})`;
    const m = getComputedStyle(probe).color.match(/[\d.]+/g);
    if (!m) return { r: 200, g: 200, b: 200 };
    return { r: +m[0], g: +m[1], b: +m[2] };
  }

  let colors = {
    cyan: rgb('--cyan'),
    red: rgb('--signal-red'),
    bone: rgb('--bone'),
    graphite: rgb('--graphite')
  };
  document.body.removeChild(probe);

  function refreshColors() {
    const p = document.createElement('span');
    p.style.display = 'none';
    document.body.appendChild(p);
    function read(varName) {
      p.style.color = `var(${varName})`;
      const m = getComputedStyle(p).color.match(/[\d.]+/g);
      if (!m) return { r: 200, g: 200, b: 200 };
      return { r: +m[0], g: +m[1], b: +m[2] };
    }
    colors = {
      cyan: read('--cyan'),
      red: read('--signal-red'),
      bone: read('--bone'),
      graphite: read('--graphite')
    };
    document.body.removeChild(p);
  }

  const themeObserver = new MutationObserver(() => refreshColors());
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function clusterCenter() {
    return { x: width * CLUSTER_X, y: height * 0.48 };
  }

  function mouseRadius() {
    return Math.hypot(width, height) * 0.72;
  }

  function isPointerInHitzone(clientX, clientY) {
    const rect = hitzone.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right
      && clientY >= rect.top && clientY <= rect.bottom;
  }

  function drift(seed, time, ampX, ampY, speed) {
    return {
      x: Math.sin(time * speed + seed) * ampX + Math.sin(time * speed * 0.53 + seed * 1.7) * ampX * 0.4,
      y: Math.cos(time * speed * 0.8 + seed * 1.3) * ampY + Math.sin(time * speed * 0.37 + seed * 2.1) * ampY * 0.4
    };
  }

  function legendViewportBottom() {
    const zoneRect = hitzone.getBoundingClientRect();
    const viewBottom = window.innerHeight - 32;
    const canvasY = viewBottom - zoneRect.top;
    const pad = 18;
    return Math.max(pad + 32, Math.min(height - pad, canvasY));
  }

  function setLegendPosition() {
    const pad = 18;
    ctx.font = '11px "IBM Plex Mono", monospace';

    let maxWidth = 0;
    LEGEND_LINES.forEach((line) => {
      const lineWidth = line.reduce((sum, word) => sum + ctx.measureText(word.text).width, 0);
      maxWidth = Math.max(maxWidth, lineWidth);
    });

    legend.right = width - pad;
    legend.left = legend.right - maxWidth;
    legend.bottom = legendViewportBottom();
    legend.lineHeight = 16;
  }

  function hitzonePoint(clientX, clientY) {
    const rect = hitzone.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function setPointerFromClient(clientX, clientY) {
    if (!isPointerInHitzone(clientX, clientY)) {
      pointer.active = false;
      return;
    }
    const p = hitzonePoint(clientX, clientY);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = true;
  }

  function applyPointerAttraction() {
    if (!pointer.active) return;

    const radius = mouseRadius();
    nodes.forEach((node) => {
      const dx = pointer.x - node.x;
      const dy = pointer.y - node.y;
      const dist = Math.hypot(dx, dy);
      if (dist > radius || dist < 1) return;

      const falloff = 1 - dist / radius;
      const force = falloff * falloff * falloff * MOUSE_PULL;
      node.vx += (dx / dist) * force;
      node.vy += (dy / dist) * force;
    });
  }

  function capNodeSpeed(node) {
    const speed = Math.hypot(node.vx, node.vy);
    if (speed > MAX_SPEED) {
      node.vx = (node.vx / speed) * MAX_SPEED;
      node.vy = (node.vy / speed) * MAX_SPEED;
    }
  }

  function buildGraph() {
    const c = clusterCenter();
    const spreadX = width * 0.34;
    const spreadY = height * 0.36;

    nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
      const angle = (i / NODE_COUNT) * Math.PI * 2 + Math.random() * 0.4;
      const radius = 0.45 + Math.random() * 0.75;
      const homeX = c.x + Math.cos(angle) * spreadX * radius;
      const homeY = c.y + Math.sin(angle) * spreadY * radius;
      return {
        x: homeX,
        y: homeY,
        homeX,
        homeY,
        vx: 0,
        vy: 0,
        kind: i % 3 === 0 ? 'stick' : 'rope',
        seed: Math.random() * 1000,
        phase: Math.random() * Math.PI * 2
      };
    });

    springs = [];
    nodes.forEach((node, i) => {
      const neighbors = nodes
        .map((other, j) => ({
          j,
          d: i === j ? Infinity : Math.hypot(node.homeX - other.homeX, node.homeY - other.homeY)
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);

      neighbors.forEach(({ j, d }) => {
        if (i < j) springs.push({ i, j, rest: d * 0.92 });
      });
    });

    setLegendPosition();
  }

  function resize() {
    const rect = hitzone.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGraph();
  }

  function ropeCohesion(node) {
    if (node.kind !== 'rope') return { x: 0, y: 0 };
    let sx = 0;
    let sy = 0;
    nodes.forEach((other) => {
      if (other === node || other.kind !== 'rope') return;
      const dx = other.x - node.x;
      const dy = other.y - node.y;
      const d = Math.hypot(dx, dy);
      if (d < COHERE_RADIUS && d > 0.001) {
        const f = 1 - d / COHERE_RADIUS;
        sx += (dx / d) * f * 0.08;
        sy += (dy / d) * f * 0.08;
      }
    });
    return { x: sx, y: sy };
  }

  function applyStickRepulsion() {
    nodes.forEach((node) => {
      if (node.kind === 'stick') return;
      nodes.forEach((stick) => {
        if (stick.kind !== 'stick') return;
        const dx = node.x - stick.x;
        const dy = node.y - stick.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist < STICK_RADIUS) {
          const k = (STICK_RADIUS - dist) / STICK_RADIUS;
          const force = k * k * STICK_REPULSE / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      });
    });
  }

  function integrate() {
    t += 0.016;
    const springK = 0.013;
    const damp = 0.86;
    const homeK = 0.004;

    for (let s = 0; s < springs.length; s++) {
      const a = nodes[springs[s].i];
      const b = nodes[springs[s].j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const force = (dist - springs[s].rest) * springK;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    applyStickRepulsion();
    applyPointerAttraction();

    nodes.forEach((node) => {
      const d = drift(node.seed, t, 16, 14, 0.4);
      const targetX = node.homeX + d.x;
      const targetY = node.homeY + d.y;
      node.vx += (targetX - node.x) * homeK;
      node.vy += (targetY - node.y) * homeK;

      const coh = ropeCohesion(node);
      node.vx += coh.x;
      node.vy += coh.y;

      node.vx *= damp;
      node.vy *= damp;
      capNodeSpeed(node);
      node.x += node.vx;
      node.y += node.vy;

      const pad = 24;
      node.x = Math.max(pad, Math.min(width - pad, node.x));
      node.y = Math.max(pad, Math.min(height - pad, node.y));
    });

    draw();
  }

  function drawEmergentBonds() {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].kind !== 'rope') continue;
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[j].kind !== 'rope') continue;
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d >= COHERE_RADIUS) continue;
        const bonded = d < BOND_DIST;
        const alpha = bonded
          ? (0.35 + 0.45 * (1 - d / BOND_DIST))
          : (1 - d / COHERE_RADIUS) * (1 - d / COHERE_RADIUS) * 0.28;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${colors.cyan.r}, ${colors.cyan.g}, ${colors.cyan.b}, ${alpha})`;
        ctx.lineWidth = bonded ? 1.6 : 0.9;
        ctx.stroke();
      }
    }
  }

  function legendColor(key, alpha) {
    const c = colors[key] || colors.graphite;
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
  }

  function drawLegend() {
    ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    LEGEND_LINES.forEach((line, lineIndex) => {
      const baseY = legend.bottom - (LEGEND_LINES.length - 1 - lineIndex) * legend.lineHeight;
      let x = legend.left;

      line.forEach((word) => {
        const pulse = Math.sin(t * 1.7 + word.phase);
        const alpha = 0.74 + pulse * 0.14;
        const dy = pulse * 0.45;
        ctx.fillStyle = legendColor(word.color, alpha);
        ctx.fillText(word.text, x, baseY + dy);
        x += ctx.measureText(word.text).width;
      });
    });
  }

  function drawPointerAura() {
    if (!pointer.active) return;

    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.14;
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.14;

    const pulse = 0.85 + Math.sin(t * 2.2) * 0.08;
    const r = POINTER_AURA * pulse;

    ctx.beginPath();
    ctx.arc(pointer.smoothX, pointer.smoothY, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${colors.cyan.r}, ${colors.cyan.g}, ${colors.cyan.b}, 0.1)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pointer.smoothX, pointer.smoothY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colors.cyan.r}, ${colors.cyan.g}, ${colors.cyan.b}, 0.22)`;
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const c = clusterCenter();
    const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, width * 0.32);
    grad.addColorStop(0, `rgba(${colors.cyan.r}, ${colors.cyan.g}, ${colors.cyan.b}, 0.07)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    springs.forEach((s) => {
      const a = nodes[s.i];
      const b = nodes[s.j];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const tension = Math.min(1, Math.abs(dist - s.rest) / 40);
      const alpha = 0.1 + (1 - tension) * 0.2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(${colors.cyan.r}, ${colors.cyan.g}, ${colors.cyan.b}, ${alpha})`;
      ctx.lineWidth = 0.75 + (1 - tension) * 0.65;
      ctx.stroke();
    });

    drawEmergentBonds();

    nodes.forEach((node) => {
      const angle = Math.atan2(node.vy, node.vx) + node.phase * 0.1;

      if (node.kind === 'stick') {
        const len = 14;
        const sx = node.x - Math.cos(angle) * len * 0.5;
        const sy = node.y - Math.sin(angle) * len * 0.5;
        const ex = node.x + Math.cos(angle) * len * 0.5;
        const ey = node.y + Math.sin(angle) * len * 0.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(${colors.red.r}, ${colors.red.g}, ${colors.red.b}, 0.75)`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.bone.r}, ${colors.bone.g}, ${colors.bone.b}, 0.5)`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.cyan.r}, ${colors.cyan.g}, ${colors.cyan.b}, 0.55)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.bone.r}, ${colors.bone.g}, ${colors.bone.b}, 0.85)`;
        ctx.fill();
      }
    });

    drawPointerAura();
    setLegendPosition();
    drawLegend();
  }

  function loop() {
    if (!visible) {
      rafId = 0;
      return;
    }
    integrate();
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', setLegendPosition, { passive: true });
  document.addEventListener('pointermove', (e) => setPointerFromClient(e.clientX, e.clientY), { passive: true });
  document.addEventListener('pointerdown', (e) => setPointerFromClient(e.clientX, e.clientY), { passive: true });

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(hitzone);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible && !rafId) rafId = requestAnimationFrame(loop);
    }, { threshold: 0.1 });
    io.observe(hero);
  }

  requestAnimationFrame(resize);
  rafId = requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (visible && !rafId) {
      rafId = requestAnimationFrame(loop);
    }
  });
})();
