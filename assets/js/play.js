/* StorySpark Local — studio preview
   A crayon canvas, a few story worlds, and a scripted branching chapter. */

(function () {
  "use strict";

  const STORIES = {
    kindness: {
      label: "Kindness",
      title: "The Lost Firefly",
      intro:
        "{name} finds a tiny firefly tangled in the tall grass. Its light flickers like a nervous star. “I can't find my way home,” it whispers.",
      choices: [
        {
          label: "Untangle the little wings",
          text:
            "{name} kneels down and gently untangles the wings. The firefly zips free, lands on {name}'s nose, and lights up the whole garden like a birthday cake.",
          lesson: "Kindness is a small, bright thing you can hand to someone."
        },
        {
          label: "Call the garden snail for help",
          text:
            "{name} calls the garden snail, who knows every leaf by name. Together they build a lantern path, and the firefly hums all the way home.",
          lesson: "Asking for help is its own kind of courage."
        },
        {
          label: "Share the night-light",
          text:
            "{name} gives the firefly the little night-light from the hallway. “Now I can see my family,” it says. The walk home is dark, but the stars feel friendlier.",
          lesson: "Sharing what you need makes the whole night softer."
        }
      ]
    },

    courage: {
      label: "Courage",
      title: "The Very Small Knight",
      intro:
        "The castle door is tall as a tree. {name} is small as a teacup. From inside comes a snore so big it ruffles the drawbridge. “Someone has to check,” it creaks.",
      choices: [
        {
          label: "Tiptoe in with a wooden spoon",
          text:
            "The snore belongs to a dragon with a pillow over its head. {name} taps the spoon twice. “Oh, good,” yawns the dragon. “I was hoping someone would wake me for breakfast.”",
          lesson: "Courage is often just one small step wearing a cape."
        },
        {
          label: "Bring the dragon a snack first",
          text:
            "The dragon smells honey toast before it sees the tiny knight. It sits up, delighted. “A visitor with snacks! The very best kind.”",
          lesson: "Meeting someone with kindness can turn a monster into a host."
        },
        {
          label: "Ask the castle mouse to come along",
          text:
            "The mouse knows a shortcut through the wall. Together they find the dragon crying over a lost teddy. Two small helpers are braver than one.",
          lesson: "You don't have to be brave alone."
        }
      ]
    },

    sharing: {
      label: "Sharing",
      title: "Two Scoops, One Cone",
      intro:
        "One ice cream. Two hungry friends. The sun is already licking the top scoop. {name} holds the cone, and everybody waits to see what happens next.",
      choices: [
        {
          label: "Split it down the middle",
          text:
            "The scoop wobbles, then splits. Two smaller ice creams, two enormous grins. It turns out the middle is the best part.",
          lesson: "Half can feel like a whole when it's shared."
        },
        {
          label: "Take turns, one lick each",
          text:
            "One lick. Two licks. Three. By the time the cone is gone they're both sticky, both laughing, and both convinced they won.",
          lesson: "Fair doesn't always mean equal — sometimes it means everyone gets a turn."
        },
        {
          label: "Find a second cone",
          text:
            "{name} runs to the kitchen and comes back with a chipped mug, a paper boat and a very small teacup. Nobody minds what it's in.",
          lesson: "When there isn't enough, you can sometimes make more."
        }
      ]
    },

    honesty: {
      label: "Honesty",
      title: "The Missing Crayon",
      intro:
        "The red crayon is gone. Everyone has a theory: the dog ate it, the carpet ate it, the wind ate it. {name} knows exactly where it went — and the truth feels prickly.",
      choices: [
        {
          label: "Say it was you",
          text:
            "The words come out wobbly: “I used it. I'm sorry.” The room goes quiet, then someone hands over the blue crayon. The drawing gets finished together.",
          lesson: "Telling the truth is the first step; helping fix it is the second."
        },
        {
          label: "Hide it in the pencil pot",
          text:
            "The crayon pokes out of the pot like a guilty flag. Everyone sees it. {name} sighs. “Okay. It was me.”",
          lesson: "A hidden mistake is heavier than a spoken one."
        },
        {
          label: "Draw a sorry picture",
          text:
            "{name} slides a drawing across the table: two figures, one red crayon, one big “sorry”. The other kid adds a sun. Nobody needs a speech.",
          lesson: "There are many ways to say sorry — as long as you mean it."
        }
      ]
    },

    patience: {
      label: "Patience",
      title: "The Seed That Took Its Time",
      intro:
        "{name} planted one seed on Monday. It is now Friday. Around it, everyone else's garden is showing off. The seed is doing absolutely nothing, as far as anyone can tell.",
      choices: [
        {
          label: "Wait and water it anyway",
          text:
            "On Sunday a green hook pushes through the soil. By Tuesday it's taller than the watering can. It was busy the whole time, underground.",
          lesson: "Some growing happens where you can't see it."
        },
        {
          label: "Sing it a song",
          text:
            "The seed does not care about the song. But the worm underneath does, and it loosens the soil while it listens. Up comes the sprout.",
          lesson: "Waiting is easier with something to do."
        },
        {
          label: "Plant another seed beside it",
          text:
            "Two seeds now. Then three. The garden is crowded, muddy and full of maybes — and one morning, all three are up.",
          lesson: "Patience is easier when you make room for more than one hope."
        }
      ]
    },

    curiosity: {
      label: "Curiosity",
      title: "What's Under the Rock?",
      intro:
        "{name} lifts the rock. Underneath: one wiggly bug, three sleepy worms, and a tiny door the size of a thumbnail. The bug says, “You're early.”",
      choices: [
        {
          label: "Ask the bug what's behind the door",
          text:
            "“The same thing as out here,” says the bug, “only smaller.” {name} kneels down and discovers the whole garden has a downstairs.",
          lesson: "A good question can open a door you didn't know was there."
        },
        {
          label: "Look closer before touching",
          text:
            "{name} counts six legs, two antennae and one very shiny shell. The bug relaxes. “Most giants just grab,” it says.",
          lesson: "Looking carefully is a kind of respect."
        },
        {
          label: "Build a tiny ramp to the door",
          text:
            "A twig, a leaf, a dab of mud. The bug climbs in, turns around, and leaves the door open behind it.",
          lesson: "Wonder is better when you leave things a little better."
        }
      ]
    }
  };

  const PAPER = "#fffdf3";
  const API_ENDPOINT = window.STORYSPARK_API || "";
  const canvas = document.querySelector("[data-canvas]");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const canvasEmpty = document.querySelector("[data-canvas-empty]");

  const nameChips = Array.from(document.querySelectorAll("[data-name]"));
  const lessonChips = Array.from(document.querySelectorAll("[data-lesson]"));
  const nameInput = document.querySelector("[data-name-input]");
  const generate = document.querySelector("[data-generate]");
  const generateHint = document.querySelector("[data-generate-hint]");
  const swatches = Array.from(document.querySelectorAll("[data-color]"));
  const clearButton = document.querySelector("[data-clear]");

  const result = document.querySelector("[data-result]");
  const resultImage = document.querySelector("[data-result-image]");
  const resultPlaceholder = document.querySelector("[data-result-placeholder]");
  const resultName = document.querySelector("[data-result-name]");
  const resultChapter = document.querySelector("[data-result-chapter]");
  const resultTitle = document.querySelector("[data-result-title]");
  const resultText = document.querySelector("[data-result-text]");
  const resultChoices = document.querySelector("[data-result-choices]");
  const resultLesson = document.querySelector("[data-result-lesson]");
  const resultLessonText = document.querySelector("[data-result-lesson-text]");
  const resultSave = document.querySelector("[data-result-save]");
  const resultRestart = document.querySelector("[data-result-restart]");

  let brushColor = "#14110f";
  let brushSize = 16;
  let drawing = false;
  let hasInk = false;
  let lastPoint = null;
  let heroName = "Pip";
  let lessonKey = "kindness";

  /* ----------------------------------------------------------------------
     Drawing pad
     ---------------------------------------------------------------------- */
  if (ctx) {
    const fillPaper = () => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const pointFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    fillPaper();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      drawing = true;
      hasInk = true;
      lastPoint = pointFromEvent(event);

      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = brushColor;
      ctx.fill();
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!drawing || !lastPoint) return;
      const point = pointFromEvent(event);

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.stroke();

      lastPoint = point;
    });

    const stopDraw = () => {
      drawing = false;
      lastPoint = null;
    };

    canvas.addEventListener("pointerup", stopDraw);
    canvas.addEventListener("pointercancel", stopDraw);
    canvas.addEventListener("pointerleave", (event) => {
      if (event.buttons === 0) stopDraw();
    });
  }

  swatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      swatches.forEach((other) => other.setAttribute("aria-pressed", "false"));
      swatch.setAttribute("aria-pressed", "true");
      brushColor = swatch.dataset.color;
      brushSize = swatch.dataset.eraser === "true" ? 44 : 16;
    });
  });

  if (clearButton && ctx) {
    clearButton.addEventListener("click", () => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
    });
  }

  /* ----------------------------------------------------------------------
     Chips
     ---------------------------------------------------------------------- */
  const selectChip = (chips, chosen) => {
    chips.forEach((chip) => chip.setAttribute("aria-pressed", "false"));
    chosen.setAttribute("aria-pressed", "true");
  };

  nameChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      selectChip(nameChips, chip);
      heroName = chip.dataset.name;
      if (nameInput) nameInput.value = heroName;
    });
  });

  if (nameInput) {
    nameInput.addEventListener("input", () => {
      const value = nameInput.value.trim();
      heroName = value || "Pip";
      nameChips.forEach((chip) => {
        chip.setAttribute(
          "aria-pressed",
          String(chip.dataset.name.toLowerCase() === heroName.toLowerCase())
        );
      });
    });
  }

  lessonChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      selectChip(lessonChips, chip);
      lessonKey = chip.dataset.lesson;
    });
  });

  /* ----------------------------------------------------------------------
     Story rendering
     ---------------------------------------------------------------------- */
  const store = window.StorySparkStore;
  const t = (key, vars) => (window.StorySparkI18n ? window.StorySparkI18n.t(key, vars) : key);
  const activeProfile = store ? store.getActiveProfile() : null;

  if (activeProfile) {
    heroName = activeProfile.name || "Pip";
    if (nameInput) nameInput.value = heroName;

    if (STORIES[activeProfile.lesson]) {
      lessonKey = activeProfile.lesson;
      const matchingChip = lessonChips.find(
        (chip) => chip.dataset.lesson === lessonKey
      );
      if (matchingChip) selectChip(lessonChips, matchingChip);
    }
  }

  const withName = (text) => text.split("{name}").join(heroName);

  const languageLabel = () => {
    if (store && activeProfile) {
      const language = store.LANGUAGES.find(
        (item) => item.code === activeProfile.language
      );
      return language ? language.label : "English";
    }
    return "English";
  };

  const renderChapter = (storyOverride) => {
    const story = storyOverride || STORIES[lessonKey] || STORIES.kindness;

    if (resultChapter) resultChapter.textContent = `${t("chapter")} 1 · ${story.label}`;
    if (resultTitle) resultTitle.textContent = story.title;
    if (resultText) resultText.textContent = withName(story.intro);
    if (resultName) resultName.textContent = heroName;

    if (resultLesson) resultLesson.hidden = true;
    if (resultLessonText) resultLessonText.textContent = "";

    if (resultChoices) {
      resultChoices.hidden = false;
      resultChoices.textContent = "";

      story.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "demo-btn";

        const label = document.createElement("span");
        label.textContent = choice.label;

        const arrow = document.createElement("span");
        arrow.className = "choice-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";

        button.append(label, arrow);

        button.addEventListener("click", () => {
          if (resultText) resultText.textContent = withName(choice.text);
          if (resultLessonText) resultLessonText.textContent = choice.lesson;
          if (resultLesson) resultLesson.hidden = false;
          if (resultChoices) resultChoices.hidden = true;
          if (resultLesson) {
            resultLesson.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        });

        resultChoices.appendChild(button);
      });
    }
  };

  if (generate && result) {
    const originalLabel = generate.innerHTML;

    const requestChapter = async () => {
      if (!API_ENDPOINT) {
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        return null;
      }

      const payload = {
        name: heroName,
        lesson: lessonKey,
        age_band: activeProfile ? activeProfile.ageBand : "4-6",
        language: store ? store.getLanguage() : "en",
        transcript: "",
        drawing: hasInk && canvas ? canvas.toDataURL("image/png") : null,
        knowledge: store ? store.activeSnippets(3) : []
      };

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Chapter request failed (${response.status})`);
      }

      const data = await response.json();
      if (!data || !data.narration || !Array.isArray(data.choices)) {
        throw new Error("Chapter response was not usable");
      }

      const fallback = STORIES[lessonKey] || STORIES.kindness;

      return {
        label: fallback.label,
        title: data.title || fallback.title,
        intro: data.narration,
        choices: data.choices
          .map((choice) => ({
            label: choice.label || "Choose",
            text: choice.outcome || choice.text || "",
            lesson: choice.lesson || ""
          }))
          .filter((choice) => choice.text)
      };
    };

    generate.addEventListener("click", async () => {
      if (generate.disabled) return;

      if (nameInput) {
        heroName = nameInput.value.trim().slice(0, 24) || heroName;
      }

      generate.disabled = true;
      generate.textContent = t("looking");
      if (generateHint) generateHint.textContent = t("finding");

      let liveStory = null;
      let fellBack = false;

      try {
        liveStory = await requestChapter();
      } catch (error) {
        fellBack = true;
        console.warn("StorySpark API unavailable, using the scripted preview.", error);
      }

      renderChapter(liveStory);

      if (resultImage) {
        if (hasInk && canvas) {
          resultImage.src = canvas.toDataURL("image/png");
          resultImage.alt = `The character you drew, ${heroName}`;
          resultImage.hidden = false;
          if (resultPlaceholder) resultPlaceholder.hidden = true;
        } else {
          resultImage.hidden = true;
          resultImage.removeAttribute("src");
          if (resultPlaceholder) {
            resultPlaceholder.hidden = false;
            resultPlaceholder.textContent = t("noDrawing", { name: heroName });
          }
        }
      }

      result.hidden = false;
      result.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (resultTitle) {
        resultTitle.setAttribute("tabindex", "-1");
        resultTitle.focus({ preventScroll: true });
      }

      if (resultChapter) {
        const story = liveStory || STORIES[lessonKey] || STORIES.kindness;
        resultChapter.textContent = `${t("chapter")} 1 · ${story.label} · ${languageLabel()}`;
      }

      if (store && activeProfile) {
        store.updateProfile(activeProfile.id, { lesson: lessonKey });
        store.recordStory();
      }

      generate.disabled = false;
      generate.innerHTML = originalLabel;
      if (window.StorySparkI18n) {
        window.StorySparkI18n.apply(store ? store.getLanguage() : "en");
      }

      if (generateHint) {
        generateHint.textContent = fellBack
          ? "The local model was not reachable, so this is the scripted preview."
          : t("hint");
      }
    });
  }

  if (resultSave && canvas) {
    resultSave.addEventListener("click", () => {
      const link = document.createElement("a");
      const slug = heroName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.download = `storyspark-${slug}-coloring-page.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  if (resultRestart) {
    resultRestart.addEventListener("click", () => {
      if (result) result.hidden = true;
      const studio = document.getElementById("studio");
      if (studio) {
        studio.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start"
        });
      }
      if (generate) generate.focus({ preventScroll: true });
    });
  }
})();
