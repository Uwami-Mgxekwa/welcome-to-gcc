/* ===== Gauteng City College – Open Day ===== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Intro loader with greetings ---------- */
  const loader = document.getElementById('loader');
  const loaderWord = document.getElementById('loaderWord');
  const greetings = ['Welcome', 'Sawubona', 'Dumela', 'Molo', 'Welkom', 'Avuxeni'];
  document.body.classList.add('locked');

  let g = 0;
  const greetTimer = setInterval(() => {
    g++;
    if (g >= greetings.length) return;
    loaderWord.style.animation = 'none';
    void loaderWord.offsetWidth; // restart animation
    loaderWord.style.animation = '';
    loaderWord.textContent = greetings[g];
  }, 520);

  function finishLoader() {
    clearInterval(greetTimer);
    loader.classList.add('done');
    document.body.classList.remove('locked');
    startReveal();
    typeText();
    setTimeout(() => launchConfetti(140), 500);
  }
  setTimeout(finishLoader, reduceMotion ? 300 : 3200);

  /* ---------- 2. Typing effect ---------- */
  const typedEl = document.getElementById('typed');
  const phrases = [
    'Hello, future tech leader! 👋',
    'Welcome to Open Day!',
    'Your future starts here.',
    'Dream it. Code it. Build it.'
  ];
  let started = false;

  function typeText() {
    if (started) return;
    started = true;
    if (reduceMotion) { typedEl.textContent = phrases[0]; return; }

    let p = 0, i = 0, deleting = false;
    (function tick() {
      const full = phrases[p];
      typedEl.textContent = full.slice(0, i);

      if (!deleting && i < full.length) { i++; return setTimeout(tick, 70); }
      if (!deleting && i === full.length) { deleting = true; return setTimeout(tick, 1600); }
      if (deleting && i > 0) { i--; return setTimeout(tick, 35); }

      deleting = false;
      p = (p + 1) % phrases.length;
      setTimeout(tick, 350);
    })();
  }

  /* ---------- 3. Scroll reveal ---------- */
  function startReveal() {
    const items = document.querySelectorAll('.reveal');

    // Stagger siblings for a smooth cascade
    document.querySelectorAll('.pillars, .grid, .hero').forEach(group => {
      group.querySelectorAll('.reveal').forEach((el, idx) => {
        el.style.setProperty('--d', (idx * 0.09) + 's');
      });
    });

    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('show'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => io.observe(el));
  }

  /* ---------- 4. Card spotlight follows pointer ---------- */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- 5. Animated network background ---------- */
  const bg = document.getElementById('bg');
  const bctx = bg.getContext('2d');
  let W, H, dots = [];
  const mouse = { x: null, y: null };

  function sizeBg() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = bg.width = window.innerWidth * dpr;
    H = bg.height = window.innerHeight * dpr;
    bg.style.width = window.innerWidth + 'px';
    bg.style.height = window.innerHeight + 'px';
    const count = Math.min(90, Math.floor(window.innerWidth / 14));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45 * dpr,
      vy: (Math.random() - 0.5) * 0.45 * dpr,
      r: (Math.random() * 1.6 + 0.8) * dpr
    }));
  }

  function drawBg() {
    bctx.clearRect(0, 0, W, H);
    const link = Math.min(W, H) * 0.14;

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;

      bctx.beginPath();
      bctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      bctx.fillStyle = 'rgba(0,224,255,0.8)';
      bctx.fill();

      for (let j = i + 1; j < dots.length; j++) {
        const o = dots[j];
        const dist = Math.hypot(d.x - o.x, d.y - o.y);
        if (dist < link) {
          bctx.strokeStyle = 'rgba(124,92,255,' + (1 - dist / link) * 0.45 + ')';
          bctx.lineWidth = 1;
          bctx.beginPath();
          bctx.moveTo(d.x, d.y);
          bctx.lineTo(o.x, o.y);
          bctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const md = Math.hypot(d.x - mouse.x, d.y - mouse.y);
        if (md < link * 1.4) {
          bctx.strokeStyle = 'rgba(255,79,216,' + (1 - md / (link * 1.4)) * 0.6 + ')';
          bctx.beginPath();
          bctx.moveTo(d.x, d.y);
          bctx.lineTo(mouse.x, mouse.y);
          bctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawBg);
  }

  window.addEventListener('resize', sizeBg);
  window.addEventListener('pointermove', (e) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
  });
  window.addEventListener('pointerleave', () => { mouse.x = mouse.y = null; });
  sizeBg();
  if (!reduceMotion) drawBg();

  /* ---------- 6. Confetti ---------- */
  const cv = document.getElementById('confetti');
  const cctx = cv.getContext('2d');
  let pieces = [], confettiRunning = false;
  const colors = ['#00e0ff', '#7c5cff', '#ff4fd8', '#ffd166', '#3dff9a', '#ffffff'];

  function sizeConfetti() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }
  window.addEventListener('resize', sizeConfetti);
  sizeConfetti();

  function launchConfetti(amount, originX, originY) {
    if (reduceMotion) return;
    const ox = originX ?? cv.width / 2;
    const oy = originY ?? cv.height * 0.35;
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 4;
      pieces.push({
        x: ox, y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: Math.random() * 8 + 4,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    if (!confettiRunning) { confettiRunning = true; stepConfetti(); }
  }

  function stepConfetti() {
    cctx.clearRect(0, 0, cv.width, cv.height);
    pieces = pieces.filter(p => p.life < 220 && p.y < cv.height + 40);

    pieces.forEach(p => {
      p.life++;
      p.vy += 0.22;      // gravity
      p.vx *= 0.99;      // drag
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);
      cctx.globalAlpha = Math.max(0, 1 - p.life / 220);
      cctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        cctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        cctx.beginPath();
        cctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        cctx.fill();
      }
      cctx.restore();
    });

    if (pieces.length) {
      requestAnimationFrame(stepConfetti);
    } else {
      confettiRunning = false;
      cctx.clearRect(0, 0, cv.width, cv.height);
    }
  }

  /* ---------- 7. Button surprises ---------- */
  function burstFromButton(btn, count) {
    const r = btn.getBoundingClientRect();
    launchConfetti(count, r.left + r.width / 2, r.top + r.height / 2);
  }

  const celebrate = document.getElementById('celebrate');
  const celebrate2 = document.getElementById('celebrate2');

  const messages = [
    '🎉 Welcome to Gauteng City College!',
    '🚀 Your tech journey starts now!',
    '💙 So glad you are here today!',
    '✨ The future is yours to build!'
  ];
  let m = 0;

  celebrate.addEventListener('click', () => {
    burstFromButton(celebrate, 160);
    setTimeout(() => launchConfetti(80, cv.width * 0.15, cv.height * 0.5), 150);
    setTimeout(() => launchConfetti(80, cv.width * 0.85, cv.height * 0.5), 300);
    celebrate.textContent = messages[m % messages.length];
    m++;
  });

  celebrate2.addEventListener('click', () => {
    burstFromButton(celebrate2, 200);
    celebrate2.textContent = '🎓 See you in class!';
  });

  /* Extra: tapping a course card gives a tiny sparkle */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => launchConfetti(26, e.clientX, e.clientY));
  });
})();
