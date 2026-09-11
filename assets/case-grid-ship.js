/**

 * Case grid — spaceship passes through each tile once, then reappears after a pause

 */

(function initCaseGridShip() {

  const grid = document.querySelector('.case-grid');

  if (!grid) return;



  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cards = [...grid.querySelectorAll('.case-card')];

  if (!cards.length) return;



  const TRAVEL_DURATION = 22;

  const PAUSE_DURATION = 6;

  const FACE_TOWARD = -22;

  const FACE_AWAY = 22;



  const legs = [

    { card: 0, from: [-0.06, 0.94], to: [1.06, 0.06] },

    { card: 1, from: [-0.06, 0.06], to: [1.06, 0.94] },

    { card: 2, from: [1.06, 0.06], to: [-0.06, 0.94] },

    { card: 3, from: [1.06, 0.94], to: [-0.06, 0.06] }

  ];



  const LEG_DURATION = TRAVEL_DURATION + PAUSE_DURATION;

  const LOOP_DURATION = LEG_DURATION * legs.length;



  const shipTemplate = `

    <img class="case-ship__img" src="assets/images/spaceship.png?v=2" alt="" width="800" height="600" decoding="async">

    <span class="case-ship__beacon case-ship__beacon--left"></span>

    <span class="case-ship__beacon case-ship__beacon--center"></span>

    <span class="case-ship__beacon case-ship__beacon--right"></span>

  `;



  const ships = cards.map((card) => {

    let ship = card.querySelector('.case-ship');

    if (!ship) {

      ship = document.createElement('div');

      ship.className = 'case-ship';

      ship.innerHTML = shipTemplate;

      const halation = card.querySelector('.case-card__halation');

      if (halation) card.insertBefore(ship, halation.nextSibling);

      else card.insertBefore(ship, card.firstChild);

    }

    return ship;

  });



  if (prefersReducedMotion) {

    ships.forEach((s) => { s.hidden = true; });

    return;

  }



  let rafId = 0;

  let startTs = 0;

  let cardRects = [];



  function measureRects() {

    const g = grid.getBoundingClientRect();

    cardRects = cards.map((card) => {

      const r = card.getBoundingClientRect();

      return {

        pxW: r.width,

        pxH: r.height

      };

    });

  }



  function shipSize(cardIdx) {

    const w = cardRects[cardIdx]?.pxW || 200;

    return Math.max(36, Math.min(w * 0.16, 58));

  }



  function facingAngle(dx, dy) {

    const toward = Math.abs(dx) >= Math.abs(dy) ? dx >= 0 : dy <= 0;

    return toward ? FACE_TOWARD : FACE_AWAY;

  }



  function legAt(elapsed) {

    const loopT = elapsed % LOOP_DURATION;

    const legIdx = Math.floor(loopT / LEG_DURATION);

    const legLocal = loopT - legIdx * LEG_DURATION;

    const leg = legs[legIdx];

    const traveling = legLocal < TRAVEL_DURATION;

    const t = traveling ? legLocal / TRAVEL_DURATION : 1;

    const x = leg.from[0] + (leg.to[0] - leg.from[0]) * t;

    const y = leg.from[1] + (leg.to[1] - leg.from[1]) * t;

    const dx = leg.to[0] - leg.from[0];

    const dy = leg.to[1] - leg.from[1];

    return { leg, traveling, x, y, dx, dy };

  }



  function applyFrame(ts) {

    if (!cardRects.length) return;

    if (!startTs) startTs = ts;



    const elapsed = (ts - startTs) / 1000;

    const { leg, traveling, x, y, dx, dy } = legAt(elapsed);



    ships.forEach((ship, i) => {

      if (i !== leg.card || !traveling) {

        ship.style.visibility = 'hidden';

        return;

      }



      const r = cardRects[i];

      const w = shipSize(i);

      const px = x * r.pxW - w * 0.5;

      const py = y * r.pxH - w * 0.38;



      ship.style.visibility = 'visible';

      ship.style.width = `${w}px`;

      ship.style.transform = `translate3d(${px}px, ${py}px, 0) rotateY(${facingAngle(dx, dy)}deg)`;

    });

  }



  function rebuild() {

    measureRects();

  }



  function loop(ts) {

    applyFrame(ts);

    rafId = requestAnimationFrame(loop);

  }



  function start() {

    if (rafId) return;

    rebuild();

    startTs = 0;

    rafId = requestAnimationFrame(loop);

  }



  function stop() {

    if (!rafId) return;

    cancelAnimationFrame(rafId);

    rafId = 0;

  }



  rebuild();

  window.addEventListener('resize', rebuild, { passive: true });



  if ('ResizeObserver' in window) {

    const ro = new ResizeObserver(rebuild);

    ro.observe(grid);

  }



  if ('IntersectionObserver' in window) {

    const io = new IntersectionObserver((entries) => {

      if (entries[0]?.isIntersecting) start();

      else stop();

    }, { threshold: 0.08 });

    io.observe(grid);

  } else {

    start();

  }



  document.addEventListener('visibilitychange', () => {

    if (document.hidden) stop();

    else start();

  });

})();


