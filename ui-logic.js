(function () {
  const root = document.documentElement;
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const langButtons = Array.from(document.querySelectorAll("[data-lang]"));
  const focusableSelector = "a[href], button:not([disabled]), summary, [tabindex]:not([tabindex='-1'])";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lastFocus = null;
  let navigationTimer = null;
  const themeButton = document.querySelector('[data-theme-toggle]');

  function storePreference(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* Preferences remain usable without storage. */ }
  }
  function readPreference(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function updateThemeControl() {
    if (!themeButton) return;
    const light = root.dataset.theme === 'light';
    const czech = root.lang === 'cs';
    themeButton.querySelector('[data-theme-label]').textContent = light ? (czech ? 'Tmavý' : 'Dark') : (czech ? 'Světlý' : 'Light');
    themeButton.setAttribute('aria-label', light ? (czech ? 'Přepnout na tmavý motiv' : 'Switch to dark theme') : (czech ? 'Přepnout na světlý motiv' : 'Switch to light theme'));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#eee8e1' : '#191719');
  }

  function updateMenuLabel() {
    if (!menuButton) return;
    const isCzech = root.lang === "cs";
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-label", isOpen
      ? (isCzech ? "Zavřít navigaci" : "Close navigation")
      : (isCzech ? "Otevřít navigaci" : "Open navigation"));
  }

  function applyLanguage(language) {
    const lang = language === "cz" ? "cz" : "en";
    root.lang = lang === "cz" ? "cs" : "en";
    storePreference("lang", lang);

    document.querySelectorAll("[data-en]").forEach(function (element) {
      const value = lang === "cz" ? element.dataset.cz : element.dataset.en;
      if (typeof value === "string") element.textContent = value;
    });

    document.querySelectorAll("[data-en-label]").forEach(function (element) {
      const value = lang === "cz" ? element.dataset.czLabel : element.dataset.enLabel;
      if (typeof value === "string") {
        element.setAttribute("aria-label", value);
        if (element.hasAttribute("data-label")) element.dataset.label = value;
      }
    });

    document.querySelectorAll('[data-en-alt]').forEach(function (element) {
      element.alt = lang === 'cz' ? element.dataset.czAlt : element.dataset.enAlt;
    });

    document.querySelectorAll("[data-href-en]").forEach(function (element) {
      const value = lang === "cz" ? element.dataset.hrefCz : element.dataset.hrefEn;
      if (typeof value === "string") element.setAttribute("href", value);
    });

    langButtons.forEach(function (button) {
      const active = button.dataset.lang === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateMenuLabel();
    updateThemeControl();
    document.dispatchEvent(new CustomEvent('portfolio:language', { detail: { language: lang } }));
  }

  function closeMenu(restoreFocus) {
    if (!menuButton || !mobileNav) return;
    clearTimeout(navigationTimer);
    navigationTimer = null;
    mobileNav.classList.remove("is-leaving");
    mobileNav.querySelectorAll(".is-selected").forEach(function (link) { link.classList.remove("is-selected"); });
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    mobileNav.inert = true;
    menuButton.setAttribute("aria-expanded", "false");
    updateMenuLabel();
    document.body.style.overflow = "";
    if (restoreFocus && lastFocus) lastFocus.focus();
  }

  function openMenu() {
    if (!menuButton || !mobileNav) return;
    lastFocus = document.activeElement;
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    mobileNav.inert = false;
    menuButton.setAttribute("aria-expanded", "true");
    updateMenuLabel();
    document.body.style.overflow = "hidden";
    const firstLink = mobileNav.querySelector("a");
    if (firstLink) firstLink.focus();
  }

  langButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyLanguage(button.dataset.lang);
    });
  });

  applyLanguage(readPreference("lang") || "en");
  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      storePreference('portfolio-theme', root.dataset.theme);
      updateThemeControl();
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      if (image.dataset.failed) return;
      image.dataset.failed = 'true';
      image.hidden = true;
      const fallback = document.createElement('p');
      fallback.className = 'media-error';
      fallback.dataset.en = 'This image could not load. You can still read about the project below.';
      fallback.dataset.cz = 'Obrázek se nepodařilo načíst. Popis projektu najdeš níže.';
      fallback.textContent = root.lang === 'cs' ? fallback.dataset.cz : fallback.dataset.en;
      image.parentElement.append(fallback);
    });
    if (image.complete && !image.naturalWidth) image.dispatchEvent(new Event('error'));
  });

  if (menuButton && mobileNav) {
    mobileNav.inert = true;
    mobileNav.setAttribute('aria-hidden', 'true');
    Array.from(mobileNav.children).forEach(function (element, index) {
      element.style.setProperty("--menu-order", index);
    });
    menuButton.addEventListener("click", function () {
      if (menuButton.getAttribute("aria-expanded") === "true") closeMenu(true);
      else openMenu();
    });

    mobileNav.addEventListener("click", function (event) {
      const link = event.target.closest("a");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
      if (reducedMotion.matches) { closeMenu(false); return; }
      event.preventDefault();
      if (navigationTimer !== null) return;
      mobileNav.classList.add("is-leaving");
      link.classList.add("is-selected");
      navigationTimer = setTimeout(function () { window.location.assign(link.href); }, 200);
    });

    document.addEventListener("keydown", function (event) {
      if (!mobileNav.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = [menuButton].concat(Array.from(mobileNav.querySelectorAll(focusableSelector)));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu(false);
    });
    window.addEventListener("pageshow", function () { closeMenu(false); });
  }

  document.querySelectorAll('[data-tilt]').forEach(function (element) {
    let frame = null;
    function reset() {
      cancelAnimationFrame(frame);
      element.style.removeProperty('--tilt-x');
      element.style.removeProperty('--tilt-y');
    }
    element.addEventListener('pointermove', function (event) {
      if (reducedMotion.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--tilt-x', ((event.clientX - rect.left) / rect.width - .5) * 5 + 'deg');
        element.style.setProperty('--tilt-y', -((event.clientY - rect.top) / rect.height - .5) * 5 + 'deg');
      });
    });
    element.addEventListener('pointerleave', reset);
    reducedMotion.addEventListener('change', reset);
  });

  document.querySelectorAll("details.work-card").forEach(function (details) {
    const summary = details.querySelector("summary");
    const body = details.querySelector(".work-body");
    if (!summary || !body) return;

    summary.addEventListener("click", function (event) {
      if (reducedMotion.matches || typeof body.animate !== "function") return;
      event.preventDefault();
      if (details.dataset.animating === "true") return;

      details.dataset.animating = "true";
      const closing = details.open;

      if (!closing) details.open = true;

      const frames = closing
        ? [
            { opacity: 1, transform: "translateY(0) scale(1)" },
            { opacity: 0, transform: "translateY(-12px) scale(0.99)" }
          ]
        : [
            { opacity: 0, transform: "translateY(-12px) scale(0.99)" },
            { opacity: 1, transform: "translateY(0) scale(1)" }
          ];

      const animation = body.animate(frames, {
        duration: closing ? 190 : 380,
        easing: closing ? "ease-in" : "cubic-bezier(0.16, 1, 0.3, 1)"
      });

      animation.addEventListener("finish", function () {
        if (closing) details.open = false;
        delete details.dataset.animating;
      }, { once: true });

      animation.addEventListener("cancel", function () {
        delete details.dataset.animating;
      }, { once: true });
    });
  });

  document.querySelectorAll("[data-project-video]").forEach(function (video) {
    if (video.closest('[data-showcase]')) return;
    const details = video.closest("details");
    let inView = false;
    let wantsPlayback = !reducedMotion.matches && !navigator.connection?.saveData;
    let automaticPause = false;

    function syncPlayback() {
      const visible = inView && !document.hidden && (!details || details.open);
      if (visible && !video.hasAttribute("src")) {
        video.src = video.dataset.src;
        video.preload = "metadata";
      }
      if (visible && wantsPlayback) {
        video.play().catch(function () { /* Native controls remain available when autoplay is blocked. */ });
      } else if (!visible && !video.paused) {
        automaticPause = true;
        video.pause();
      }
    }

    video.muted = true;
    video.addEventListener("pause", function () {
      if (!automaticPause) wantsPlayback = false;
      automaticPause = false;
    });
    video.addEventListener("play", function () { wantsPlayback = true; });
    video.addEventListener("error", function () {
      const error = video.parentElement.querySelector(".media-error");
      if (error) error.hidden = false;
    });
    document.addEventListener("visibilitychange", syncPlayback);
    if (details) details.addEventListener("toggle", syncPlayback);
    reducedMotion.addEventListener("change", function () {
      if (reducedMotion.matches) { wantsPlayback = false; video.pause(); }
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        syncPlayback();
      }, { threshold: 0.15 });
      observer.observe(video);
    } else {
      inView = true;
      syncPlayback();
    }
  });

  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    const revealTargets = Array.from(document.querySelectorAll(
      ".section-heading, .project-row, .work-card, .panel, .timeline article, .service-feature, .service-item, .capability-main, .capability-side, .first-message-panel, .contact-link"
    ));

    revealTargets.forEach(function (element, index) {
      element.classList.add("scroll-reveal");
      element.style.transitionDelay = (index % 3) * 45 + "ms";
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -5% 0px" });

    revealTargets.forEach(function (element) {
      observer.observe(element);
    });

    requestAnimationFrame(function () {
      root.classList.add("motion-ready");
    });
  }
})();
