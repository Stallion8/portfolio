/**
 * iGaming case study — animated diagrams + Reality Check threshold demo
 */
(function initIgamingDiagrams() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initRcDemo(root) {
    const meter = root.querySelector('[data-rc-meter]');
    const fill = root.querySelector('[data-rc-fill]');
    const playBtn = root.querySelector('[data-rc-play]');
    const prompt = root.querySelector('[data-rc-prompt]');
    const locked = root.querySelector('[data-rc-locked]');
    const readout = root.querySelector('[data-rc-readout]');
    if (!meter || !fill || !playBtn || !prompt || !locked || !readout) return;

    const THRESHOLD = 100;
    let value = 0;
    let lockedOut = false;
    let driftId = 0;

    function format(v) {
      return `£${Math.round(v)}`;
    }

    function setValue(next) {
      value = Math.min(THRESHOLD + 8, Math.max(0, next));
      const pct = Math.min(100, (value / THRESHOLD) * 100);
      fill.style.width = `${pct}%`;
      readout.textContent = format(value);

      if (!lockedOut && value >= THRESHOLD) {
        lockedOut = true;
        root.classList.add('is-threshold');
        playBtn.disabled = true;
        playBtn.setAttribute('aria-disabled', 'true');
        prompt.hidden = false;
        locked.hidden = false;
        stopDrift();
      }
    }

    function stopDrift() {
      if (driftId) {
        clearInterval(driftId);
        driftId = 0;
      }
    }

    function startDrift() {
      if (reduced || lockedOut || driftId) return;
      driftId = window.setInterval(() => {
        if (lockedOut) return;
        setValue(value + 0.35);
      }, 1200);
    }

    playBtn.addEventListener('click', () => {
      if (lockedOut) return;
      setValue(value + 14 + Math.random() * 10);
    });

    if (!reduced) startDrift();

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) startDrift();
        else stopDrift();
      }, { threshold: 0.2 });
      io.observe(root);
    }

    setValue(18);
  }

  document.querySelectorAll('[data-rc-demo]').forEach(initRcDemo);
})();
