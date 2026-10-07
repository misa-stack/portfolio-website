(function () {
  "use strict";

  function pauseMedia(container) {
    container.querySelectorAll("video, audio").forEach(function (media) { media.pause(); });
  }

  function initShowcases(scope) {
    (scope || document).querySelectorAll("[data-showcase]").forEach(function (showcase, showcaseIndex) {
      if (showcase.dataset.showcaseReady) return;
      const own = function (selector) {
        return Array.from(showcase.querySelectorAll(selector)).filter(function (element) {
          return element.closest("[data-showcase]") === showcase;
        });
      };
      const buttons = own("[data-scene-button]");
      const scenes = own("[data-scene]");
      if (!buttons.length || !scenes.length) return;
      const validButtons = buttons.filter(function (button) {
        return scenes.some(function (scene) { return scene.dataset.scene === button.dataset.sceneButton; });
      });
      if (!validButtons.length) return;
      validButtons.forEach(function (button, index) {
        const scene = scenes.find(function (item) { return item.dataset.scene === button.dataset.sceneButton; });
        if (!scene.id) scene.id = "showcase-" + showcaseIndex + "-scene-" + index;
        button.setAttribute("aria-controls", scene.id);
      });
      function select(button, focus) {
        validButtons.forEach(function (item) {
          item.setAttribute("aria-pressed", String(item === button));
        });
        scenes.forEach(function (scene) {
          const active = scene.dataset.scene === button.dataset.sceneButton;
          const entering = active && scene.hidden;
          scene.hidden = !active;
          if (!active) pauseMedia(scene);
          if (entering && typeof scene.animate === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            scene.getAnimations().forEach(function (animation) { animation.cancel(); });
            scene.animate([{ opacity: .4, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
          }
        });
        if (focus) button.focus();
      }
      validButtons.forEach(function (button, index) {
        button.addEventListener("click", function () { select(button, false); });
        button.addEventListener("keydown", function (event) {
          let next;
          if (event.key === "ArrowRight") next = (index + 1) % validButtons.length;
          if (event.key === "ArrowLeft") next = (index + validButtons.length - 1) % validButtons.length;
          if (event.key === "Home") next = 0;
          if (event.key === "End") next = validButtons.length - 1;
          if (next === undefined) return;
          event.preventDefault();
          select(validButtons[next], true);
        });
      });
      select(validButtons.find(function (button) { return button.getAttribute("aria-pressed") === "true"; }) || validButtons[0], false);
      showcase.dataset.showcaseReady = "true";
      showcase.classList.add("showcase-ready");
    });
  }

  initShowcases();
  window.initShowcases = initShowcases;

  const media = Array.from(document.querySelectorAll("[data-showcase] video, [data-showcase] audio, [data-manual-video]"));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (!entry.isIntersecting) entry.target.pause(); });
    }, { threshold: 0 });
    media.forEach(function (item) { observer.observe(item); });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) media.forEach(function (item) { item.pause(); });
  });
  media.forEach(function (item) {
    item.addEventListener("error", function () {
      const error = item.parentElement.querySelector(".media-error");
      if (error) error.hidden = false;
    });
  });
})();
