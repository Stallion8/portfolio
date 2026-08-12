// ==========================================================================
// Mobile nav toggle
// ==========================================================================
const menuToggle = document.querySelector('.menu-toggle');
const topbarNav = document.querySelector('.topbar__nav');
if (menuToggle && topbarNav) {
  menuToggle.addEventListener('click', () => {
    topbarNav.classList.toggle('open');
  });
  topbarNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => topbarNav.classList.remove('open'));
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      card.style.transform = `translateY(-4px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
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

  const nav = document.querySelector('.topbar__nav');
  const menuToggle = document.querySelector('.menu-toggle');
  if (!nav || !menuToggle) return;

  const wrap = document.createElement('div');
  wrap.className = 'topbar__right';

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

  nav.parentNode.insertBefore(wrap, nav);
  wrap.appendChild(nav);
  wrap.appendChild(switcher);
  wrap.appendChild(menuToggle);

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
// Work tile galaxy halation — mouse-synced, tiles only
// ==========================================================================
(function initTileHalation() {
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll('.case-card');
  if (!cards.length) return;

  const activeTiles = new Set();
  let rafId = 0;

  function parseGlowColor(el) {
    const probe = document.createElement('span');
    probe.style.color = getComputedStyle(el).getPropertyValue('--card-glow').trim() || 'var(--cyan)';
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color.match(/[\d.]+/g);
    document.body.removeChild(probe);
    if (!rgb) return { r: 53, g: 228, b: 224 };
    return { r: +rgb[0], g: +rgb[1], b: +rgb[2] };
  }

  function themeIntensity() {
    const theme = document.documentElement.getAttribute('data-theme') || 'amoled';
    return theme === 'amoled' ? 1 : 0.72;
  }

  function drawBloom(ctx, x, y, radius, color, alpha, blend) {
    ctx.globalCompositeOperation = blend;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    grad.addColorStop(0.35, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.45})`);
    grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  cards.forEach(card => {
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
      tx: 0.5,
      ty: 0.5,
      x: 0.5,
      y: 0.5,
      strength: 0,
      stars: [],
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
        const count = Math.min(36, Math.floor((this.width * this.height) / 4200));
        this.stars = Array.from({ length: count }, () => ({
          x: Math.random(),
          y: Math.random(),
          r: Math.random() * 0.9 + 0.25,
          twinkle: Math.random() * Math.PI * 2
        }));
      },
      render(ts) {
        const t = ts * 0.001;
        const { ctx, width, height } = this;
        ctx.clearRect(0, 0, width, height);

        this.x += (this.tx - this.x) * 0.14;
        this.y += (this.ty - this.y) * 0.14;

        const hovered = card.matches(':hover');
        const target = hovered ? 1 : 0;
        this.strength += (target - this.strength) * 0.1;

        if (this.strength < 0.02 && !hovered) {
          card.classList.remove('is-halation-active');
          activeTiles.delete(this);
          return;
        }

        card.classList.add('is-halation-active');
        const intensity = themeIntensity();
        const glow = parseGlowColor(card);
        const secondary = glow.r > 180
          ? { r: 53, g: 228, b: 224 }
          : { r: 255, g: 45, b: 66 };
        const blend = getComputedStyle(document.documentElement).getPropertyValue('--halation-blend').trim() || 'screen';
        const hx = this.x * width;
        const hy = this.y * height;
        const base = Math.max(width, height);

        drawBloom(ctx, hx, hy, base * 0.55, glow, (0.13 + this.strength * 0.08) * intensity, blend);
        drawBloom(
          ctx,
          hx + Math.sin(t * 0.7) * 8,
          hy + Math.cos(t * 0.55) * 6,
          base * 0.32,
          secondary,
          (0.07 + this.strength * 0.04) * intensity,
          blend
        );
        drawBloom(ctx, hx, hy, base * 0.12, { r: 255, g: 255, b: 255 }, 0.03 * this.strength * intensity, blend);

        ctx.globalCompositeOperation = 'source-over';
        this.stars.forEach(star => {
          const alpha = (0.12 + Math.sin(t * 1.4 + star.twinkle) * 0.1) * this.strength * intensity;
          ctx.beginPath();
          ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        });
      }
    };

    card.addEventListener('mouseenter', () => {
      state.resize();
      activeTiles.add(state);
      if (!rafId) rafId = requestAnimationFrame(loop);
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      state.tx = (e.clientX - rect.left) / rect.width;
      state.ty = (e.clientY - rect.top) / rect.height;
    });

    card.addEventListener('mouseleave', () => {
      state.tx = 0.5;
      state.ty = 0.5;
    });

    card.addEventListener('touchstart', (e) => {
      state.resize();
      activeTiles.add(state);
      if (!rafId) rafId = requestAnimationFrame(loop);
      if (e.touches[0]) {
        const rect = card.getBoundingClientRect();
        state.tx = (e.touches[0].clientX - rect.left) / rect.width;
        state.ty = (e.touches[0].clientY - rect.top) / rect.height;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (activeTiles.has(state)) state.resize();
    });
  });

  function loop(ts) {
    [...activeTiles].forEach(state => state.render(ts));
    rafId = activeTiles.size ? requestAnimationFrame(loop) : 0;
  }
})();
