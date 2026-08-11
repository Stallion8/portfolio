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
if (isFinePointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    topbar.style.boxShadow = y > 10 ? '0 8px 24px rgba(0,0,0,0.35)' : 'none';
    lastY = y;
  }, { passive: true });
}
