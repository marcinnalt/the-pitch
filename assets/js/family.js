/* StorySpark Local — family library UI
   Renders kid profiles, the avatar picker and the family knowledge base.
   Everything is stored on this device by store.js. */

(function () {
  "use strict";

  const store = window.StorySparkStore;
  if (!store) return;

  const profileGrid = document.querySelector("[data-profiles]");
  const profileForm = document.querySelector("[data-profile-form]");
  const status = document.querySelector("[data-family-status]");
  const picker = document.querySelector("[data-avatar-picker]");
  const kbList = document.querySelector("[data-kb-list]");
  const kbCount = document.querySelector("[data-kb-count]");
  const kbSummary = document.querySelector("[data-kb-summary]");
  const noteForm = document.querySelector("[data-note-form]");
  const fileInput = document.querySelector("[data-kb-file]");

  let chosenAvatar = "fox";

  const say = (message, tone) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone || "ok";
  };

  const lessonLabel = (key) => {
    const names = {
      kindness: "Kindness",
      courage: "Courage",
      sharing: "Sharing",
      honesty: "Honesty",
      patience: "Patience",
      curiosity: "Curiosity"
    };
    return names[key] || "Kindness";
  };

  const languageLabel = (code) => {
    const match = store.LANGUAGES.find((language) => language.code === code);
    return match ? match.label : "English";
  };

  const avatarFor = (id) =>
    store.AVATARS.find((avatar) => avatar.id === id) || store.AVATARS[0];

  /* ------------------------------------------------------------------ */
  /* Profiles                                                            */
  /* ------------------------------------------------------------------ */

  const renderProfiles = () => {
    const profiles = store.getProfiles();
    const active = store.getActiveProfile();

    if (!profileGrid) return;
    profileGrid.textContent = "";

    profiles.forEach((profile) => {
      const avatar = avatarFor(profile.avatar);
      const isActive = profile.id === active.id;

      const card = document.createElement("article");
      card.className = "kid-card" + (isActive ? " is-active" : "");

      const pick = document.createElement("button");
      pick.type = "button";
      pick.className = "kid-card__pick";
      pick.setAttribute("aria-pressed", String(isActive));
      pick.setAttribute(
        "aria-label",
        `Use ${profile.name}'s profile${isActive ? " (active)" : ""}`
      );

      const image = document.createElement("img");
      image.src = avatar.src;
      image.alt = "";
      image.width = 72;
      image.height = 72;
      image.loading = "lazy";

      const copy = document.createElement("span");
      copy.className = "kid-card__copy";
      copy.innerHTML =
        `<strong>${escapeHtml(profile.name)}</strong>` +
        `<span>${escapeHtml(profile.ageBand)} · ${escapeHtml(languageLabel(profile.language))}</span>` +
        `<span class="kid-card__lesson">${escapeHtml(lessonLabel(profile.lesson))}</span>`;

      const stats = document.createElement("span");
      stats.className = "kid-card__stats";
      stats.innerHTML =
        `<span><b>${profile.stories || 0}</b> stories</span>` +
        `<span><b>${profile.hearts || 0}</b> hearts</span>`;

      pick.append(image, copy, stats);
      pick.addEventListener("click", () => {
        store.setActiveProfile(profile.id);
        renderProfiles();
        say(`${profile.name} is holding the crayon now.`);
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "kid-card__remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        if (!window.confirm(`Remove ${profile.name}'s profile from this device?`)) {
          return;
        }
        store.removeProfile(profile.id);
        renderProfiles();
        say(`${profile.name}'s profile was removed.`);
      });

      card.append(pick, remove);
      profileGrid.appendChild(card);
    });
  };

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return map[character];
    });

  /* ------------------------------------------------------------------ */
  /* Avatar picker                                                       */
  /* ------------------------------------------------------------------ */

  if (picker) {
    store.AVATARS.forEach((avatar) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "avatar-option";
      button.dataset.avatar = avatar.id;
      button.setAttribute("aria-pressed", String(avatar.id === chosenAvatar));
      button.setAttribute("aria-label", avatar.label);

      const image = document.createElement("img");
      image.src = avatar.src;
      image.alt = "";
      image.width = 56;
      image.height = 56;
      image.loading = "lazy";

      const label = document.createElement("span");
      label.textContent = avatar.label;

      button.append(image, label);
      button.addEventListener("click", () => {
        chosenAvatar = avatar.id;
        picker.querySelectorAll(".avatar-option").forEach((option) => {
          option.setAttribute(
            "aria-pressed",
            String(option.dataset.avatar === chosenAvatar)
          );
        });
      });

      picker.appendChild(button);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Add a profile                                                       */
  /* ------------------------------------------------------------------ */

  if (profileForm) {
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(profileForm);
      const name = String(data.get("name") || "").trim();

      if (!name) {
        say("Give the hero a name first.", "warn");
        return;
      }

      if (store.getProfiles().length >= 8) {
        say("Eight profiles is the limit — remove one to add another.", "warn");
        return;
      }

      const profile = store.addProfile({
        name,
        avatar: chosenAvatar,
        ageBand: data.get("ageBand"),
        language: data.get("language"),
        lesson: data.get("lesson")
      });

      profileForm.reset();
      chosenAvatar = "fox";
      picker.querySelectorAll(".avatar-option").forEach((option) => {
        option.setAttribute("aria-pressed", String(option.dataset.avatar === "fox"));
      });

      renderProfiles();
      say(`${profile.name} is ready. Their stories start with ${avatarFor(profile.avatar).label}.`);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Knowledge base                                                      */
  /* ------------------------------------------------------------------ */

  const renderKnowledge = () => {
    const notes = store.getKnowledge();

    if (kbCount) {
      kbCount.textContent = `${notes.length} note${notes.length === 1 ? "" : "s"}`;
    }
    if (kbSummary) {
      kbSummary.textContent = `${notes.length} note${notes.length === 1 ? "" : "s"}`;
    }
    if (!kbList) return;

    kbList.textContent = "";

    if (notes.length === 0) {
      const empty = document.createElement("p");
      empty.className = "kb-empty";
      empty.textContent =
        "Nothing here yet. Add a note, a family story, or the values you'd like the adventures to practise.";
      kbList.appendChild(empty);
      return;
    }

    notes.forEach((note) => {
      const row = document.createElement("article");
      row.className = "kb-item" + (note.enabled ? "" : " is-off");

      const top = document.createElement("div");
      top.className = "kb-item__top";

      const title = document.createElement("h3");
      title.textContent = note.title;

      const words = document.createElement("span");
      words.textContent = `${note.words || 0} words`;

      top.append(title, words);

      const preview = document.createElement("p");
      preview.className = "kb-item__preview";
      preview.textContent =
        note.text.length > 180 ? note.text.slice(0, 180) + "…" : note.text;

      const actions = document.createElement("div");
      actions.className = "kb-item__actions";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "text-btn";
      toggle.textContent = note.enabled ? "In use — turn off" : "Off — turn on";
      toggle.addEventListener("click", () => {
        store.toggleKnowledge(note.id);
        renderKnowledge();
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-btn";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => {
        if (!window.confirm(`Delete “${note.title}” from this device?`)) return;
        store.removeKnowledge(note.id);
        renderKnowledge();
      });

      actions.append(toggle, remove);
      row.append(top, preview, actions);
      kbList.appendChild(row);
    });
  };

  if (noteForm) {
    noteForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(noteForm);
      const text = String(data.get("text") || "").trim();

      if (!text) {
        say("Paste or type a note first.", "warn");
        return;
      }

      const entry = store.addKnowledge({
        title: data.get("title") || "Family notes",
        text
      });

      if (entry) {
        noteForm.reset();
        renderKnowledge();
        say(`“${entry.title}” is on the bookshelf.`);
      }
    });
  }

  const readFile = (file) =>
    new Promise((resolve, reject) => {
      if (file.size > 300 * 1024) {
        reject(new Error(`${file.name} is larger than 300 KB.`));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error(`${file.name} could not be read.`));
      reader.readAsText(file);
    });

  if (fileInput) {
    fileInput.addEventListener("change", async () => {
      const files = Array.from(fileInput.files || []);
      if (files.length === 0) return;

      let added = 0;
      let failed = 0;

      for (const file of files) {
        try {
          const text = await readFile(file);
          const title = file.name.replace(/\.[^.]+$/, "");
          if (store.addKnowledge({ title, text })) added += 1;
        } catch (error) {
          failed += 1;
          say(error.message, "warn");
        }
      }

      fileInput.value = "";
      renderKnowledge();
      if (added) {
        say(
          `${added} note${added === 1 ? "" : "s"} added` +
            (failed ? `, ${failed} skipped.` : ".")
        );
      }
    });
  }

  renderProfiles();
  renderKnowledge();
})();
