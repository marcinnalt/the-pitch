/* StorySpark Local — shared front-end behaviour
   Nav, scroll reveals, the home page story demo and the lesson filters. */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".nav-panel");

  if (header && toggle && panel) {
    const closeNav = () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    panel.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("nav-open")) {
        closeNav();
        toggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ----------------------------------------------------------------------
     Home page: try a chapter demo
     ---------------------------------------------------------------------- */
  const demo = document.querySelector("[data-demo]");

  if (demo) {
    const text = demo.querySelector("[data-demo-text]");
    const choices = Array.from(demo.querySelectorAll("[data-demo-choice]"));
    const choiceWrap = demo.querySelector("[data-demo-choices]");
    const lesson = demo.querySelector("[data-demo-lesson]");
    const lessonText = demo.querySelector("[data-demo-lesson-text]");
    const reset = demo.querySelector("[data-demo-reset]");
    const originalText = text ? text.textContent : "";
    let chosen = false;

    const choose = (button) => {
      if (!text || chosen) return;
      chosen = true;
      text.textContent = button.dataset.outcome || "";
      if (lessonText) lessonText.textContent = button.dataset.lesson || "";
      if (lesson) lesson.hidden = false;
      if (choiceWrap) choiceWrap.hidden = true;
      if (reset) {
        reset.hidden = false;
        reset.focus();
      }
    };

    const startOver = () => {
      chosen = false;
      if (text) text.textContent = originalText;
      if (lesson) lesson.hidden = true;
      if (choiceWrap) choiceWrap.hidden = false;
      if (reset) reset.hidden = true;
      if (choices[0]) choices[0].focus();
    };

    choices.forEach((button) => {
      button.addEventListener("click", () => choose(button));
    });

    if (reset) reset.addEventListener("click", startOver);
  }

  /* ----------------------------------------------------------------------
     Lesson library filters (what-it-does.html)
     ---------------------------------------------------------------------- */
  const filterRoot = document.querySelector("[data-filter-root]");

  if (filterRoot) {
    const cards = Array.from(filterRoot.querySelectorAll("[data-lesson-card]"));
    const groups = Array.from(filterRoot.querySelectorAll("[data-filter-group]"));
    const count = filterRoot.querySelector("[data-filter-count]");
    const empty = filterRoot.querySelector("[data-empty-state]");
    const resetAll = filterRoot.querySelector("[data-filter-reset]");
    const total = cards.length;
    const state = {};

    groups.forEach((group) => {
      state[group.dataset.filterGroup] = "all";
    });

    const apply = () => {
      let shown = 0;

      cards.forEach((card) => {
        const age = state.age || "all";
        const theme = state.theme || "all";
        const matchAge = age === "all" || card.dataset.age === age;
        const matchTheme = theme === "all" || card.dataset.theme === theme;
        const visible = matchAge && matchTheme;

        card.classList.toggle("is-hidden", !visible);
        if (visible) shown += 1;
      });

      if (count) {
        count.textContent =
          shown === total
            ? `Showing all ${total} lessons`
            : `Showing ${shown} of ${total} lessons`;
      }

      if (empty) empty.classList.toggle("is-visible", shown === 0);
    };

    groups.forEach((group) => {
      const buttons = Array.from(group.querySelectorAll("[data-filter-value]"));

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          buttons.forEach((other) => other.setAttribute("aria-pressed", "false"));
          button.setAttribute("aria-pressed", "true");
          state[group.dataset.filterGroup] = button.dataset.filterValue;
          apply();
        });
      });
    });

    if (resetAll) {
      resetAll.addEventListener("click", () => {
        groups.forEach((group) => {
          state[group.dataset.filterGroup] = "all";
          group.querySelectorAll("[data-filter-value]").forEach((button) => {
            button.setAttribute(
              "aria-pressed",
              String(button.dataset.filterValue === "all")
            );
          });
        });
        apply();
      });
    }

    apply();
  }
})();
