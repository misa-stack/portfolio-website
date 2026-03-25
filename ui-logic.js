
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * 2000, y: Math.random() * 1200,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.3 + 0.05,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Fake latency ping ────────────────────────────────────────
(function initPing() {
  const el = document.getElementById('ping-stat');
  if (!el) return;
  function update() {
    el.textContent = Math.floor(Math.random() * 18 + 4) + 'ms';
    setTimeout(update, 2000 + Math.random() * 1500);
  }
  update();
})();

// ── Geolocation display ──────────────────────────────────────
(function initLocation() {
  const el = document.getElementById('location-stat');
  if (!el) return;
  fetch('https://ip-api.com/json/?fields=city,country')
    .then(r => r.json())
    .then(d => { if (d.city) el.textContent = d.city + ', ' + d.country; })
    .catch(() => { el.textContent = 'CZ_ORIGIN'; });
})();

// ── Active nav highlight ─────────────────────────────────────
(function initNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === path) a.classList.add('active-page');
  });
})();

// ── GSAP scroll reveals ───────────────────────────────────────
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined') return;
  gsap.fromTo('.reveal',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.75, stagger: 0.09, ease: 'power3.out' }
  );
});

// ── CZ / EN Language Switcher ────────────────────────────────
(function initLang() {
  // Detect saved preference, default to EN
  const saved = localStorage.getItem('lang') || 'en';
  applyLang(saved);

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const lang = btn.dataset.lang;
    localStorage.setItem('lang', lang);
    applyLang(lang);
  });

  function applyLang(lang) {
    // Update toggle button active state
    document.querySelectorAll('[data-lang]').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('lang-active', isActive);
      btn.classList.toggle('lang-inactive', !isActive);
    });

    // Translate all elements with data-en / data-cz attributes
    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = lang === 'cz'
        ? (el.dataset.cz || el.dataset.en)
        : el.dataset.en;
    });

    // Store on <html> for CSS targeting if needed
    document.documentElement.setAttribute('data-lang', lang);
  }
})();
