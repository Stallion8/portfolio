// ==========================================================================
// Motion scale — detect refresh rate, normalize animation feel across displays
// ==========================================================================
const motion = {
  hz: 60,
  scale: 1,
  ready: false,
  lastTs: 0,
  dt(ts) {
    const dt = this.lastTs ? Math.min((ts - this.lastTs) / 1000, 0.05) : 1 / 60;
    this.lastTs = ts;
    return dt;
  },
  lerp(current, target, rate, dt) {
    const k = 1 - Math.exp(-rate * dt * this.scale);
    return current + (target - current) * k;
  }
};

(function detectRefreshRate() {
  const samples = [];
  let last = 0;
  function sample(ts) {
    if (last) {
      const frameMs = ts - last;
      if (frameMs > 5 && frameMs < 50) samples.push(1000 / frameMs);
    }
    last = ts;
    if (samples.length < 32) {
      requestAnimationFrame(sample);
      return;
    }
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    motion.hz = Math.round(avg);
    motion.scale = avg < 85 ? Math.min(2.4, 120 / avg) : 1;
    motion.ready = true;
    document.documentElement.style.setProperty('--motion-scale', motion.scale.toFixed(2));
  }
  requestAnimationFrame(sample);
})();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================================================
// PRATIK.OS brand → Home
// ==========================================================================
(function initBrandHomeLink() {
  const brand = document.querySelector('.topbar__brand');
  if (!brand || brand.closest('a')) return;

  const stylesheet = document.querySelector('link[rel="stylesheet"]');
  const homeHref = stylesheet?.getAttribute('href')?.includes('../') ? '../index.html' : 'index.html';

  const link = document.createElement('a');
  link.href = homeHref;
  link.className = brand.className;
  link.setAttribute('aria-label', 'PRATIK.OS — Home');
  link.innerHTML = brand.innerHTML;
  brand.replaceWith(link);
})();

// ==========================================================================
// Scroll progress bar
// ==========================================================================
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.innerHTML = '<div class="progress-bar__fill"></div>';
  document.body.appendChild(bar);
  const fill = bar.querySelector('.progress-bar__fill');
  function update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    fill.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ==========================================================================
// Hero scroll-cue: fade out once the user actually starts scrolling
// ==========================================================================
const scrollCue = document.querySelector('.hero__scroll-cue');
if (scrollCue) {
  window.addEventListener('scroll', () => {
    scrollCue.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
}

// ==========================================================================
// Text scramble / decode-in — signature terminal-boot effect for the
// homepage hero name
// ==========================================================================
function scrambleInto(el, duration = 700) {
  const finalText = el.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&01';
  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const revealCount = Math.floor(progress * finalText.length);
    let out = '';
    for (let i = 0; i < finalText.length; i++) {
      out += (i < revealCount || finalText[i] === ' ')
        ? finalText[i]
        : chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = out;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  requestAnimationFrame(frame);
}
if (!prefersReducedMotion) {
  document.querySelectorAll('[data-scramble]').forEach((el, i) => {
    setTimeout(() => scrambleInto(el), 250 + i * 120);
  });
}

// ==========================================================================
// Magnetic buttons — subtle cursor-attraction on primary CTAs
// ==========================================================================
if (window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35 - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ==========================================================================
// Scroll reveal
// ==========================================================================
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in-view'));
}

// ==========================================================================
// MoodDial widget — dual emoji-slider reaction demo
// (signature interactive element referenced throughout the site)
// ==========================================================================
function initMoodDial(root) {
  const moodSlider = root.querySelector('[data-mood-slider]');
  const intensitySlider = root.querySelector('[data-intensity-slider]');
  const moodEmoji = root.querySelector('[data-mood-emoji]');
  const intensityEmoji = root.querySelector('[data-intensity-emoji]');
  const readout = root.querySelector('[data-readout]');
  if (!moodSlider || !intensitySlider) return;

  const moodMap = ['😤', '😕', '😐', '🙂', '🤩'];
  const intensityMap = ['🫥', '🙂', '😆', '🔥', '🚀'];
  const moodWords = ['frustrated', 'unsure', 'neutral', 'into it', 'obsessed'];
  const intensityWords = ['barely felt it', 'noticed it', 'genuinely felt it', 'really felt it', 'maximum intensity'];

  function update() {
    const m = Math.round(Number(moodSlider.value));
    const i = Math.round(Number(intensitySlider.value));
    moodEmoji.textContent = moodMap[m];
    intensityEmoji.textContent = intensityMap[i];
    moodEmoji.style.transform = `scale(${1 + i * 0.06})`;
    if (readout) {
      readout.innerHTML = `Reaction logged: <strong>${moodWords[m]}</strong>, ${intensityWords[i]}.`;
    }
  }

  moodSlider.addEventListener('input', update);
  intensitySlider.addEventListener('input', update);
  update();
}
document.querySelectorAll('[data-mooddial]').forEach(initMoodDial);

// ==========================================================================
// Case card magnetic tilt on pointer move (desktop only, subtle)
// ==========================================================================
const isFinePointer = window.matchMedia('(pointer: fine)').matches;
if (isFinePointer && !prefersReducedMotion) {
  document.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-7.5px) scale(1.013) rotateX(${y * -8}deg) rotateY(${x * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ==========================================================================
// Topbar shrink-on-scroll
// ==========================================================================
const topbar = document.querySelector('.topbar');
if (topbar) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    topbar.style.boxShadow = y > 10 ? `0 8px 24px ${getComputedStyle(document.documentElement).getPropertyValue('--shadow-soft').trim()}` : 'none';
  }, { passive: true });
}

// ==========================================================================
// Theme switcher — Amoled / Beige / Sunshine (site-wide, persisted)
// ==========================================================================
(function initThemeSwitcher() {
  const themes = [
    {
      id: 'amoled',
      label: 'Amoled theme',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"/></svg>'
    },
    {
      id: 'beige',
      label: 'Beige theme',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M8 14c1.2 1.6 2.6 2.5 4 2.5s2.8-.9 4-2.5"/></svg>'
    },
    {
      id: 'sunshine',
      label: 'Sunshine theme',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'
    }
  ];

  const topbarEl = document.querySelector('.topbar');
  const brand = topbarEl?.querySelector('.topbar__brand');
  const nav = document.querySelector('.topbar__nav');
  const menuToggle = document.querySelector('.menu-toggle');
  if (!topbarEl || !brand || !nav || !menuToggle) return;

  let right = topbarEl.querySelector('.topbar__right');
  if (!right) {
    right = document.createElement('div');
    right.className = 'topbar__right';
    topbarEl.appendChild(right);
  }
  right.appendChild(nav);
  right.appendChild(menuToggle);

  const switcher = document.createElement('div');
  switcher.className = 'theme-switcher';
  switcher.setAttribute('role', 'radiogroup');
  switcher.setAttribute('aria-label', 'Color theme');

  const thumb = document.createElement('span');
  thumb.className = 'theme-switcher__thumb';
  switcher.appendChild(thumb);

  const buttons = themes.map((theme) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-switcher__btn';
    btn.dataset.theme = theme.id;
    btn.setAttribute('aria-label', theme.label);
    btn.innerHTML = theme.icon;
    switcher.appendChild(btn);
    return btn;
  });

  brand.after(switcher);

  const current = document.documentElement.getAttribute('data-theme') || 'amoled';

  function moveThumb(themeId) {
    const index = themes.findIndex(t => t.id === themeId);
    thumb.style.transform = `translateX(${index * 34}px)`;
    buttons.forEach(btn => {
      const active = btn.dataset.theme === themeId;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setTheme(themeId, persist = true) {
    if (!themes.some(t => t.id === themeId)) return;
    document.documentElement.classList.add('theme-switching');
    document.documentElement.setAttribute('data-theme', themeId);
    moveThumb(themeId);
    if (persist) localStorage.setItem('pratik-theme', themeId);
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 520);
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });

  moveThumb(current);
})();

// ==========================================================================
// Mobile nav — portal menu outside topbar on small screens (iOS Safari fix)
// ==========================================================================
(function initMobileNav() {
  const topbar = document.querySelector('.topbar');
  const nav = document.querySelector('.topbar__nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!topbar || !nav || !toggle) return;

  const mq = window.matchMedia('(max-width: 720px)');
  let placeholder = null;

  function setTopbarHeight() {
    document.documentElement.style.setProperty('--topbar-height', `${topbar.offsetHeight}px`);
  }

  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  function openMenu() {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  }

  function restoreNavToTopbar() {
    const right = topbar.querySelector('.topbar__right');
    if (right) right.insertBefore(nav, toggle);
    else if (placeholder) placeholder.parentNode.insertBefore(nav, placeholder);
  }

  function syncNavPlacement() {
    setTopbarHeight();
    if (mq.matches) {
      if (!placeholder) {
        placeholder = document.createComment('nav-placeholder');
        nav.parentNode.insertBefore(placeholder, nav);
        document.body.appendChild(nav);
        nav.classList.add('topbar__nav--mobile');
      }
    } else if (placeholder) {
      closeMenu();
      nav.classList.remove('topbar__nav--mobile');
      restoreNavToTopbar();
      placeholder.remove();
      placeholder = null;
    }
  }

  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (nav.classList.contains('open')) closeMenu();
    else openMenu();
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('click', (e) => {
    if (!mq.matches || !nav.classList.contains('open')) return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  mq.addEventListener('change', syncNavPlacement);
  window.addEventListener('resize', setTopbarHeight);
  syncNavPlacement();
})();

// ==========================================================================
// Work tile galaxy halation — idle fluid drift + mouse-synced, tiles only
// ==========================================================================
(function initTileHalation() {
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll('.case-card');
  if (!cards.length) return;

  const activeTiles = new Set();
  let rafId = 0;
  const IDLE_STRENGTH = 0.44;

  function parseGlowColor(el) {
    const probe = document.createElement('span');
    probe.style.color = getComputedStyle(el).getPropertyValue('--card-glow').trim() || '#35e4e0';
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color.match(/[\d.]+/g);
    document.body.removeChild(probe);
    if (!rgb) return { r: 53, g: 228, b: 224 };
    return { r: +rgb[0], g: +rgb[1], b: +rgb[2] };
  }

  function drawBloom(ctx, x, y, radius, color, alpha, blend) {
    ctx.globalCompositeOperation = blend;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    grad.addColorStop(0.08, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.72})`);
    grad.addColorStop(0.2, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.28})`);
    grad.addColorStop(0.38, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.07})`);
    grad.addColorStop(0.55, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.015})`);
    grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSpaceField(ctx, width, height, depth) {
    const cx = width * 0.5;
    const cy = height * 0.46;
    const span = Math.max(width, height) * 0.78;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, span);
    grad.addColorStop(0, `rgba(6, 8, 18, ${0.42 * depth})`);
    grad.addColorStop(0.55, `rgba(4, 5, 12, ${0.58 * depth})`);
    grad.addColorStop(1, `rgba(2, 3, 8, ${0.68 * depth})`);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function drawStar(ctx, x, y, star, t, intensity, hoverBoost) {
    const twinkle = 0.86 + Math.sin(t * 1.35 + star.twinkle) * 0.14;
    const alpha = (star.bright
      ? 0.55 + hoverBoost * 0.18
      : star.medium
        ? 0.4 + hoverBoost * 0.14
        : 0.3 + hoverBoost * 0.1) * twinkle * intensity;

    if (star.bright) {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, star.r * 2.4);
      halo.addColorStop(0, `rgba(255, 255, 255, ${Math.min(alpha * 0.55, 0.5)})`);
      halo.addColorStop(0.45, `rgba(210, 228, 255, ${alpha * 0.12})`);
      halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, star.r * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha, 0.95)})`;
    ctx.fill();
  }

  function drawMicroStar(ctx, x, y, star, t, intensity, hoverBoost) {
    const twinkle = 0.92 + Math.sin(t * 2.1 + star.twinkle) * 0.08;
    const alpha = (0.2 + hoverBoost * 0.08) * twinkle * intensity;
    ctx.beginPath();
    ctx.arc(x, y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(215, 225, 245, ${alpha})`;
    ctx.fill();
  }

  function mixRgb(a, b, t) {
    return {
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t)
    };
  }

  function drawGalaxyBlob(ctx, cx, cy, base, glow, secondary, strength, intensity, blend, t, phase) {
    const wobbleX = Math.sin(t * 0.36 + phase) * 5 + Math.sin(t * 0.19 + phase * 1.7) * 2.5;
    const wobbleY = Math.cos(t * 0.31 + phase) * 4 + Math.cos(t * 0.16 + phase * 1.4) * 2;
    const x = cx + wobbleX;
    const y = cy + wobbleY;
    const s = strength * intensity;
    const pulse = 1 + Math.sin(t * 0.48 + phase) * 0.06;
    const tint = mixRgb(glow, secondary, 0.38 + Math.sin(t * 0.22 + phase) * 0.12);

    drawBloom(ctx, x, y, base * 0.72 * pulse, glow, 0.05 * s, blend);
    drawBloom(ctx, x, y, base * 0.5 * pulse, tint, 0.058 * s, blend);
    drawBloom(ctx, x, y, base * 0.34 * pulse, glow, 0.066 * s, blend);
    drawBloom(ctx, x, y, base * 0.22 * pulse, tint, 0.04 * s, blend);
  }

  function ensureLoop() {
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  cards.forEach((card, index) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'case-card__halation';
    canvas.setAttribute('aria-hidden', 'true');
    card.prepend(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = {
      card,
      canvas,
      ctx,
      width: 0,
      height: 0,
      dpr: 1,
      phase: index * 1.7 + Math.random() * Math.PI,
      pointerX: 0.5,
      pointerY: 0.5,
      tx: 0.5,
      ty: 0.5,
      x: 0.5,
      y: 0.5,
      hoverBlend: 0,
      pointerActive: false,
      visible: false,
      stars: [],
      microStars: [],
      lastWidth: 0,
      lastHeight: 0,
      initStarfield() {
        const count = Math.min(168, Math.floor((this.width * this.height) / 1050));
        this.stars = Array.from({ length: count }, () => {
          const roll = Math.random();
          const bright = roll > 0.86;
          const medium = !bright && roll > 0.52;
          return {
            x: Math.random(),
            y: Math.random(),
            r: bright
              ? Math.random() * 0.55 + 0.85
              : medium
                ? Math.random() * 0.35 + 0.42
                : Math.random() * 0.3 + 0.32,
            bright,
            medium,
            twinkle: Math.random() * Math.PI * 2,
            drift: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.22 + 0.08,
            phase: Math.random() * Math.PI * 2
          };
        });
        const microCount = Math.min(340, Math.floor((this.width * this.height) / 400));
        this.microStars = Array.from({ length: microCount }, () => ({
          x: Math.random(),
          y: Math.random(),
          r: Math.random() * 0.2 + 0.1,
          twinkle: Math.random() * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.18 + 0.04
        }));
      },
      resize() {
        const rect = card.getBoundingClientRect();
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = Math.max(rect.width, 1);
        this.height = Math.max(rect.height, 1);
        canvas.width = Math.floor(this.width * this.dpr);
        canvas.height = Math.floor(this.height * this.dpr);
        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        const sizeChanged = Math.abs(this.width - this.lastWidth) > 2
          || Math.abs(this.height - this.lastHeight) > 2;
        if (!this.stars.length || sizeChanged) {
          this.initStarfield();
          this.lastWidth = this.width;
          this.lastHeight = this.height;
        }
      },
      idlePoint(t) {
        const p = this.phase;
        return {
          x: 0.5
            + Math.sin(t * 0.34 + p) * 0.17
            + Math.sin(t * 0.19 + p * 1.6) * 0.08
            + Math.cos(t * 0.11 + p * 0.7) * 0.04,
          y: 0.5
            + Math.cos(t * 0.29 + p * 0.8) * 0.14
            + Math.cos(t * 0.16 + p * 1.3) * 0.07
            + Math.sin(t * 0.13 + p) * 0.04
        };
      },
      render(ts, dt) {
        if (!this.visible) return;

        const step = dt * motion.scale;
        const t = ts * 0.001;
        const { ctx, width, height } = this;
        ctx.clearRect(0, 0, width, height);

        const idle = this.idlePoint(t);
        const hovered = card.matches(':hover');
        this.hoverBlend = motion.lerp(this.hoverBlend, hovered ? 1 : 0, 9.5, dt);

        const targetX = this.pointerActive
          ? this.pointerX * this.hoverBlend + idle.x * (1 - this.hoverBlend)
          : idle.x;
        const targetY = this.pointerActive
          ? this.pointerY * this.hoverBlend + idle.y * (1 - this.hoverBlend)
          : idle.y;

        this.tx = targetX;
        this.ty = targetY;
        this.x = motion.lerp(this.x, this.tx, 7.5, dt);
        this.y = motion.lerp(this.y, this.ty, 7.5, dt);

        const strength = IDLE_STRENGTH + (1 - IDLE_STRENGTH) * this.hoverBlend;
        card.classList.add('is-halation-visible');
        card.classList.toggle('is-halation-active', this.hoverBlend > 0.08);

        const intensity = 1;
        const depth = 1;
        const glow = parseGlowColor(card);
        const secondary = glow.r > 180
          ? { r: 53, g: 228, b: 224 }
          : { r: 255, g: 45, b: 66 };
        const halationBlend = 'screen';
        const hx = this.x * width;
        const hy = this.y * height;
        const base = Math.max(width, height);

        drawSpaceField(ctx, width, height, depth);

        drawGalaxyBlob(ctx, hx, hy, base, glow, secondary, strength, intensity, halationBlend, t, this.phase);

        ctx.globalCompositeOperation = 'source-over';
        this.microStars.forEach(star => {
          star.x += Math.sin(t * star.speed + star.phase) * 0.00004 * step * 60;
          star.y += Math.cos(t * star.speed * 0.9 + star.phase) * 0.000035 * step * 60;
          if (star.x < 0) star.x += 1;
          if (star.x > 1) star.x -= 1;
          if (star.y < 0) star.y += 1;
          if (star.y > 1) star.y -= 1;
          drawMicroStar(ctx, star.x * width, star.y * height, star, t, intensity, this.hoverBlend);
        });

        this.stars.forEach(star => {
          star.x += Math.sin(t * star.speed + star.drift) * 0.00006 * step * 60;
          star.y += Math.cos(t * star.speed * 0.85 + star.phase) * 0.00005 * step * 60;
          if (star.x < 0) star.x += 1;
          if (star.x > 1) star.x -= 1;
          if (star.y < 0) star.y += 1;
          if (star.y > 1) star.y -= 1;

          drawStar(ctx, star.x * width, star.y * height, star, t, intensity, this.hoverBlend);
        });
      }
    };

    card.addEventListener('mouseenter', () => {
      state.pointerActive = true;
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      state.pointerX = (e.clientX - rect.left) / rect.width;
      state.pointerY = (e.clientY - rect.top) / rect.height;
    });

    card.addEventListener('mouseleave', () => {
      state.pointerActive = false;
    });

    card.addEventListener('touchstart', (e) => {
      state.pointerActive = true;
      if (e.touches[0]) {
        const rect = card.getBoundingClientRect();
        state.pointerX = (e.touches[0].clientX - rect.left) / rect.width;
        state.pointerY = (e.touches[0].clientY - rect.top) / rect.height;
      }
    }, { passive: true });

    card.addEventListener('touchend', () => {
      state.pointerActive = false;
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (state.visible) state.resize();
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          state.visible = entry.isIntersecting;
          if (state.visible) {
            state.resize();
            activeTiles.add(state);
            card.classList.add('is-halation-visible');
            ensureLoop();
          } else {
            activeTiles.delete(state);
            card.classList.remove('is-halation-visible', 'is-halation-active');
          }
        });
      }, { threshold: 0.12, rootMargin: '40px 0px' });
      io.observe(card);
    } else {
      state.visible = true;
      state.resize();
      activeTiles.add(state);
      ensureLoop();
    }
  });

  let loopLastTs = 0;
  function loop(ts) {
    const dt = loopLastTs ? Math.min((ts - loopLastTs) / 1000, 0.05) : 1 / 60;
    loopLastTs = ts;
    motion.lastTs = ts;
    [...activeTiles].forEach(state => state.render(ts, dt));
    rafId = activeTiles.size ? requestAnimationFrame(loop) : 0;
  }
})();
