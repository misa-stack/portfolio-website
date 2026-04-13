/* ============================================================
   ui-logic.js — shared across all pages
   Canvas, ping, geo, nav active, CZ/EN switcher, mobile menu
   ============================================================ */

// ── Canvas particle background ───────────────────────────────
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

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * 2000, y: Math.random() * 1200,
      r: Math.random() * 1.0 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.25 + 0.04,
    });
  }

  (function draw() {
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
  })();
})();

// ── Fake latency ping ────────────────────────────────────────
(function initPing() {
  const el = document.getElementById('ping-stat');
  if (!el) return;
  function update() {
    el.textContent = Math.floor(Math.random() * 18 + 4) + 'ms';
    setTimeout(update, 2200 + Math.random() * 1500);
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

// ── Mobile menu ──────────────────────────────────────────────
(function initMobileMenu() {
  const btn  = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  let open = false;

  btn.addEventListener('click', () => {
    open = !open;
    menu.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    // morph hamburger → X
    const bars = btn.querySelectorAll('.bar');
    if (open) {
      bars[0].style.transform = 'translateY(6px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-6px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (open && !btn.contains(e.target) && !menu.contains(e.target)) {
      open = false;
      menu.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', false);
      const bars = btn.querySelectorAll('.bar');
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });
})();

// ── CZ / EN Language Switcher ────────────────────────────────
(function initLang() {
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
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('lang-active',   btn.dataset.lang === lang);
      btn.classList.toggle('lang-inactive', btn.dataset.lang !== lang);
    });
    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = lang === 'cz'
        ? (el.dataset.cz || el.dataset.en)
        : el.dataset.en;
    });
    document.documentElement.setAttribute('data-lang', lang);
  }
})();

// ── GSAP reveals ─────────────────────────────────────────────
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined') return;
  gsap.fromTo('.reveal',
    { opacity: 0, y: 22 },
    { opacity: 1, y: 0, duration: 0.75, stagger: 0.09, ease: 'power3.out', delay: 0.1 }
  );
});
