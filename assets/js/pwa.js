/* StorySpark Local — install + offline.
   Registering the service worker is the whole one-liner:
       navigator.serviceWorker.register("sw.js");
   Everything else here just makes the install button behave. */

(function () {
  "use strict";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((error) => {
        console.warn("StorySpark could not enable offline mode.", error);
      });
    });
  }

  const standalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  let deferredPrompt = null;
  const buttons = Array.from(document.querySelectorAll("[data-install-app]"));
  const notes = Array.from(document.querySelectorAll("[data-install-note]"));

  const setNote = (message) => {
    notes.forEach((note) => {
      note.textContent = message;
    });
  };

  const isIos = () =>
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

  const paint = () => {
    if (standalone()) {
      buttons.forEach((button) => {
        button.textContent = "Installed — open from your home screen";
        button.disabled = true;
        button.hidden = false;
      });
      setNote("StorySpark is installed. It opens without a browser bar and works offline.");
      return;
    }

    if (deferredPrompt) {
      buttons.forEach((button) => {
        button.hidden = false;
        button.disabled = false;
        button.textContent = "Install StorySpark";
      });
      setNote("One tap installs the app. After the first visit it works offline.");
      return;
    }

    buttons.forEach((button) => {
      button.hidden = false;
      button.textContent = isIos() ? "How to install on iPhone" : "Install StorySpark";
    });

    if (isIos()) {
      setNote("On iPhone or iPad: tap Share, then “Add to Home Screen”. It then opens offline like an app.");
    } else {
      setNote("Use your browser menu → “Install app” / “Add to Home screen”. It works offline after the first visit.");
    }
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    paint();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    paint();
  });

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setNote("Installing… StorySpark will appear on your home screen.");
        }
        deferredPrompt = null;
        paint();
        return;
      }

      const target = document.getElementById("install");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      setNote(
        isIos()
          ? "On iPhone or iPad: tap Share, then “Add to Home Screen”."
          : "Open your browser menu and choose “Install app” or “Add to Home screen”."
      );
    });
  });

  paint();
})();
