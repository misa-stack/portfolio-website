(function () {
  const root = document.documentElement;
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const langButtons = Array.from(document.querySelectorAll("[data-lang]"));
  const focusableSelector = "a[href], button:not([disabled]), summary, [tabindex]:not([tabindex='-1'])";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lastFocus = null;

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
    localStorage.setItem("lang", lang);

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
  }

  function closeMenu(restoreFocus) {
    if (!menuButton || !mobileNav) return;
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

  applyLanguage(localStorage.getItem("lang") || "en");

  if (menuButton && mobileNav) {
    mobileNav.inert = true;
    menuButton.addEventListener("click", function () {
      if (menuButton.getAttribute("aria-expanded") === "true") closeMenu(true);
      else openMenu();
    });

    mobileNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
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
  }

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
