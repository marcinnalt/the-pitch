/* StorySpark Local — the quest game
   Four gentle stops, three kind choices each. The scripted deck works offline;
   set window.STORYSPARK_QUEST_API to a local model endpoint to generate one. */

(function () {
  "use strict";

  const store = window.StorySparkStore;
  const i18n = window.StorySparkI18n;

  const DECK = {
    en: {
      startKicker: "Ready?",
      startTitle: "One path, four small choices.",
      startCopy:
        "Pack nothing. Bring your kindest thinking. The path starts at the yellow gate and ends under the paper stars.",
      start: "Start the quest",
      next: "Next stop",
      finish: "See my stars",
      again: "New quest",
      complete: "Quest complete!",
      summary:
        "You walked the whole path. Here is what you practised — no score, just four small moves.",
      full: "All four stops. Every choice was a kind one.",
      stop: "Stop",
      of: "of",
      choose: "What do you do?",
      lesson: "What you practised",
      toStudio: "Make a story",
      home: "Back home",
      apiNote: "The local model was not reachable, so this is the scripted quest.",
      stops: [
        {
          title: "The yellow gate",
          prompt:
            "The gate latch is high. A smaller kid is on tiptoe, holding a box and wobbling.",
          choices: [
            { label: "Lift the latch together", outcome: "Click. The gate swings wide and the box stays steady. Two sets of hands made it easy.", lesson: "You noticed a wobble and offered the exact help that was needed." },
            { label: "Fetch a grown-up", outcome: "A grown-up lifts the latch, and you hold the box while the smaller kid climbs through.", lesson: "You asked for help early instead of letting someone struggle." },
            { label: "Cheer from the path", outcome: "“You can do it!” The smaller kid tries once more, and the latch gives way.", lesson: "You gave encouragement without taking the moment away." }
          ]
        },
        {
          title: "The snack table",
          prompt:
            "One biscuit is left on the plate. Your friend sits down, hungry after running.",
          choices: [
            { label: "Snap it in two", outcome: "Two crooked halves. Yours is smaller, and somehow the snack tastes better.", lesson: "You shared something scarce without making a speech about it." },
            { label: "Give the whole biscuit", outcome: "Your friend beams and breaks it anyway, handing half straight back.", lesson: "You made room for someone else, and they made room for you." },
            { label: "Find another box", outcome: "You rummage in the cupboard and find a second box. Now there are plenty.", lesson: "You looked for a bigger solution instead of dividing a small one." }
          ]
        },
        {
          title: "The quiet corner",
          prompt:
            "A new kid sits alone with a blank sheet, watching the others build a paper town.",
          choices: [
            { label: "Sit nearby and draw", outcome: "You draw a wonky house next to theirs. They add a chimney. Nobody says much.", lesson: "You joined quietly, without demanding a smile first." },
            { label: "Invite them to build", outcome: "“We need a bridge person.” They stand up fast, sheet forgotten.", lesson: "You gave someone a real job, not just a polite hello." },
            { label: "Wave and save a seat", outcome: "They wave back and shuffle over, still shy but no longer alone.", lesson: "You left the door open and let them choose when to walk through." }
          ]
        },
        {
          title: "The paper stars",
          prompt:
            "A gust scatters the paper stars across the yard. Everyone is chasing them at once.",
          choices: [
            { label: "Gather them together", outcome: "You hold the bag open while three kids drop stars in. The bag gets heavy.", lesson: "You turned a scramble into a team job." },
            { label: "Hold the ladder", outcome: "You brace the ladder while someone rescues the star from the branch.", lesson: "You did the steady, unseen job so someone else could be brave." },
            { label: "Make new stars", outcome: "You fold fresh stars from the scrap paper. Soon there are more than before.", lesson: "You fixed the mood by making something new." }
          ]
        }
      ]
    },
    es: {
      startKicker: "¿Listo?",
      startTitle: "Un camino, cuatro decisiones pequeñas.",
      startCopy:
        "No traigas nada. Trae tu pensamiento más amable. El camino empieza en la puerta amarilla y termina bajo las estrellas de papel.",
      start: "Empezar la aventura",
      next: "Siguiente parada",
      finish: "Ver mis estrellas",
      again: "Nueva aventura",
      complete: "¡Aventura completada!",
      summary:
        "Recorriste todo el camino. Esto es lo que practicaste: sin puntuación, solo cuatro gestos pequeños.",
      full: "Las cuatro paradas. Cada elección fue amable.",
      stop: "Parada",
      of: "de",
      choose: "¿Qué haces?",
      lesson: "Lo que practicaste",
      toStudio: "Crear una historia",
      home: "Volver al inicio",
      apiNote: "El modelo local no respondió, así que esta es la aventura de muestra.",
      stops: [
        {
          title: "La puerta amarilla",
          prompt:
            "El pestillo está alto. Alguien más pequeño está de puntillas, con una caja, tambaleándose.",
          choices: [
            { label: "Abrir el pestillo juntos", outcome: "Clic. La puerta se abre y la caja no se cae. Dos pares de manos lo hicieron fácil.", lesson: "Notaste el tambaleo y ofreciste justo la ayuda que hacía falta." },
            { label: "Buscar a un adulto", outcome: "Un adulto abre el pestillo y tú sostienes la caja mientras la otra persona pasa.", lesson: "Pediste ayuda a tiempo en vez de dejar que alguien se esforzara solo." },
            { label: "Animar desde el camino", outcome: "«¡Tú puedes!» Lo intenta una vez más y el pestillo cede.", lesson: "Diste ánimo sin quitarle el momento." }
          ]
        },
        {
          title: "La mesa de la merienda",
          prompt:
            "Queda una galleta en el plato. Tu amigo se sienta, con hambre después de correr.",
          choices: [
            { label: "Partirla en dos", outcome: "Dos mitades torcidas. La tuya es más pequeña y, aun así, sabe mejor.", lesson: "Compartiste algo escaso sin dar un discurso." },
            { label: "Darle la galleta entera", outcome: "Sonríe y la parte igual, devolviéndote la mitad.", lesson: "Hiciste sitio para otra persona y ella te lo devolvió." },
            { label: "Buscar otra caja", outcome: "Rebuscas en el armario y encuentras otra caja. Ahora hay de sobra.", lesson: "Buscaste una solución más grande en vez de dividir una pequeña." }
          ]
        },
        {
          title: "El rincón tranquilo",
          prompt:
            "Alguien nuevo está solo con una hoja en blanco, mirando cómo los demás construyen una ciudad de papel.",
          choices: [
            { label: "Sentarte cerca y dibujar", outcome: "Dibujas una casa torcida junto a la suya. Añade una chimenea. Nadie dice mucho.", lesson: "Te acercaste sin exigir una sonrisa primero." },
            { label: "Invitarle a construir", outcome: "«Necesitamos a alguien para el puente.» Se levanta rápido, olvidando la hoja.", lesson: "Le diste una tarea de verdad, no solo un saludo educado." },
            { label: "Saludar y guardar un sitio", outcome: "Devuelve el saludo y se acerca, aún tímido pero ya no solo.", lesson: "Dejaste la puerta abierta y elegiste cuándo entrar." }
          ]
        },
        {
          title: "Las estrellas de papel",
          prompt:
            "Una ráfaga esparce las estrellas por el patio. Todo el mundo corre tras ellas a la vez.",
          choices: [
            { label: "Recogerlas juntos", outcome: "Sostienes la bolsa mientras tres niños echan estrellas. La bolsa pesa.", lesson: "Convertiste una carrera en un trabajo de equipo." },
            { label: "Sujetar la escalera", outcome: "Aseguras la escalera mientras alguien rescata la estrella de la rama.", lesson: "Hiciste el trabajo firme e invisible para que otra persona fuera valiente." },
            { label: "Hacer estrellas nuevas", outcome: "Doblas estrellas con el papel de recorte. Pronto hay más que antes.", lesson: "Arreglaste el ambiente creando algo nuevo." }
          ]
        }
      ]
    },
    fr: {
      startKicker: "Prêt ?",
      startTitle: "Un chemin, quatre petits choix.",
      startCopy:
        "N'emporte rien. Apporte ta pensée la plus gentille. Le chemin commence à la porte jaune et finit sous les étoiles en papier.",
      start: "Commencer la quête",
      next: "Prochaine étape",
      finish: "Voir mes étoiles",
      again: "Nouvelle quête",
      complete: "Quête terminée !",
      summary:
        "Tu as fait tout le chemin. Voici ce que tu as travaillé — pas de score, juste quatre petits gestes.",
      full: "Les quatre étapes. Chaque choix était gentil.",
      stop: "Étape",
      of: "sur",
      choose: "Que fais-tu ?",
      lesson: "Ce que tu as travaillé",
      toStudio: "Créer une histoire",
      home: "Retour à l'accueil",
      apiNote: "Le modèle local n'a pas répondu ; voici la quête de démonstration.",
      stops: [
        {
          title: "La porte jaune",
          prompt:
            "Le loquet est haut. Un plus petit est sur la pointe des pieds, avec une boîte, et vacille.",
          choices: [
            { label: "Ouvrir le loquet ensemble", outcome: "Clic. La porte s'ouvre et la boîte reste droite. Deux paires de mains, c'était facile.", lesson: "Tu as remarqué le déséquilibre et offert exactement l'aide utile." },
            { label: "Chercher un adulte", outcome: "Un adulte ouvre le loquet et tu tiens la boîte pendant que l'autre passe.", lesson: "Tu as demandé de l'aide tôt au lieu de laisser quelqu'un peiner." },
            { label: "Encourager depuis le chemin", outcome: "« Tu peux le faire ! » Un nouvel essai, et le loquet cède.", lesson: "Tu as encouragé sans prendre le moment à l'autre." }
          ]
        },
        {
          title: "La table du goûter",
          prompt:
            "Il reste un biscuit sur l'assiette. Ton ami s'assoit, affamé après avoir couru.",
          choices: [
            { label: "Le casser en deux", outcome: "Deux moitiés bancales. La tienne est plus petite, et le goûter est meilleur.", lesson: "Tu as partagé quelque chose de rare sans faire de discours." },
            { label: "Donner le biscuit entier", outcome: "Ton ami sourit et le casse quand même, te rendant la moitié.", lesson: "Tu as fait de la place à quelqu'un, et il t'en a fait aussi." },
            { label: "Chercher une autre boîte", outcome: "Tu fouilles le placard et trouves une deuxième boîte. Maintenant, il y en a plein.", lesson: "Tu as cherché une plus grande solution au lieu de diviser." }
          ]
        },
        {
          title: "Le coin tranquille",
          prompt:
            "Un nouvel enfant est seul avec une feuille blanche, à regarder les autres construire une ville en papier.",
          choices: [
            { label: "T'asseoir près et dessiner", outcome: "Tu dessines une maison bancale à côté de la sienne. Il ajoute une cheminée. Personne ne parle beaucoup.", lesson: "Tu t'es joint calmement, sans exiger un sourire d'abord." },
            { label: "L'inviter à construire", outcome: "« On a besoin de quelqu'un pour le pont. » Il se lève vite, la feuille oubliée.", lesson: "Tu as donné un vrai rôle, pas juste un bonjour poli." },
            { label: "Saluer et garder une place", outcome: "Il salue à son tour et s'approche, encore timide mais plus seul.", lesson: "Tu as laissé la porte ouverte et le choix du moment." }
          ]
        },
        {
          title: "Les étoiles en papier",
          prompt:
            "Une bourrasque éparpille les étoiles dans la cour. Tout le monde court en même temps.",
          choices: [
            { label: "Les ramasser ensemble", outcome: "Tu tiens le sac ouvert pendant que trois enfants y déposent des étoiles. Le sac devient lourd.", lesson: "Tu as transformé une bousculade en travail d'équipe." },
            { label: "Tenir l'échelle", outcome: "Tu stabilises l'échelle pendant que quelqu'un sauve l'étoile de la branche.", lesson: "Tu as fait le travail discret et solide pour qu'un autre soit courageux." },
            { label: "Fabriquer de nouvelles étoiles", outcome: "Tu plies des étoiles dans les chutes de papier. Bientôt, il y en a plus qu'avant.", lesson: "Tu as réparé l'ambiance en créant du neuf." }
          ]
        }
      ]
    },
    ar: {
      startKicker: "مستعد؟",
      startTitle: "درب واحد، أربعة اختيارات صغيرة.",
      startCopy:
        "لا تحمل شيئًا. أحضر أفكارك اللطيفة. يبدأ الدرب عند البوابة الصفراء وينتهي تحت النجوم الورقية.",
      start: "ابدأ المغامرة",
      next: "المحطة التالية",
      finish: "أرى نجومي",
      again: "مغامرة جديدة",
      complete: "اكتملت المغامرة!",
      summary:
        "مشيت الدرب كله. هذا ما تدرّبت عليه — بلا نقاط، فقط أربع خطوات صغيرة.",
      full: "المحطات الأربع كلها. كل اختيار كان لطيفًا.",
      stop: "محطة",
      of: "من",
      choose: "ماذا تفعل؟",
      lesson: "ما تدرّبت عليه",
      toStudio: "اصنع قصة",
      home: "العودة للبداية",
      apiNote: "لم يستجب النموذج المحلي، لذا هذه هي المغامرة التجريبية.",
      stops: [
        {
          title: "البوابة الصفراء",
          prompt:
            "مزلاج البوابة عالٍ. طفل أصغر يقف على أطراف أصابعه حاملًا صندوقًا ويترنح.",
          choices: [
            { label: "افتحا المزلاج معًا", outcome: "طقطقة. تنفتح البوابة ويبقى الصندوق ثابتًا. يدان معًا جعلتا الأمر سهلًا.", lesson: "لاحظت الترنح وقدّمت المساعدة المطلوبة بالضبط." },
            { label: "أحضر شخصًا كبيرًا", outcome: "يرفع الكبير المزلاج وأنت تمسك الصندوق حتى يعبر الطفل.", lesson: "طلبت المساعدة مبكرًا بدل ترك أحدهم يتعب وحده." },
            { label: "شجّع من الدرب", outcome: "«تستطيع!» يحاول مرة أخرى فيستسلم المزلاج.", lesson: "شجّعت دون أن تسلب الطفل لحظته." }
          ]
        },
        {
          title: "طاولة الوجبة الخفيفة",
          prompt:
            "بقيت قطعة بسكويت واحدة. يجلس صديقك جائعًا بعد الجري.",
          choices: [
            { label: "اقسمها نصفين", outcome: "نصفان مائلان. نصفك أصغر، ومع ذلك طعم البسكويت أفضل.", lesson: "شاركت شيئًا قليلًا دون خطبة." },
            { label: "أعطه القطعة كلها", outcome: "يبتسم صديقك ويكسرها رغم ذلك ويعيد لك نصفها.", lesson: "أفسحت مكانًا لغيرك، فأفسح هو لك." },
            { label: "ابحث عن علبة أخرى", outcome: "تبحث في الخزانة فتجد علبة ثانية. الآن هناك الكثير.", lesson: "بحثت عن حل أكبر بدل تقسيم حل صغير." }
          ]
        },
        {
          title: "الزاوية الهادئة",
          prompt:
            "طفل جديد يجلس وحده أمام ورقة بيضاء، يراقب الآخرين يبنون مدينة ورقية.",
          choices: [
            { label: "اجلس قريبًا وارسم", outcome: "ترسم بيتًا مائلًا بجانب بيته. يضيف مدخنة. لا أحد يقول الكثير.", lesson: "انضممت بهدوء دون أن تطلب ابتسامة أولًا." },
            { label: "ادعه للبناء", outcome: "«نحتاج من يبني الجسر.» يقف سريعًا ناسيًا الورقة.", lesson: "أعطيته مهمة حقيقية لا مجرد تحية مهذبة." },
            { label: "لوّح واحفظ له مقعدًا", outcome: "يرد التحية ويقترب، ما زال خجولًا لكنه لم يعد وحده.", lesson: "تركت الباب مفتوحًا وتركته يختار وقت الدخول." }
          ]
        },
        {
          title: "النجوم الورقية",
          prompt:
            "تهب نسمة فتبعثر النجوم الورقية في الساحة. الجميع يركض خلفها في آن واحد.",
          choices: [
            { label: "اجمعوها معًا", outcome: "تمسك الكيس مفتوحًا بينما يضع ثلاثة أطفال النجوم. يصبح الكيس ثقيلًا.", lesson: "حوّلت التدافع إلى عمل جماعي." },
            { label: "أمسك السلم", outcome: "تثبّت السلم بينما ينقذ أحدهم النجمة من الغصن.", lesson: "قمت بالعمل الثابت الخفي ليتمكن غيرك من الشجاعة." },
            { label: "اصنع نجومًا جديدة", outcome: "تطوي نجومًا من بقايا الورق. قريبًا تصبح أكثر من قبل.", lesson: "أصلحت الجو بصنع شيء جديد." }
          ]
        }
      ]
    }
  };

  const stage = document.querySelector("[data-quest-stage]");
  const card = document.querySelector("[data-quest-card]");
  const kicker = document.querySelector("[data-quest-kicker]");
  const title = document.querySelector("[data-quest-title]");
  const copy = document.querySelector("[data-quest-copy]");
  const choices = document.querySelector("[data-quest-choices]");
  const actions = document.querySelector("[data-quest-actions]") ||
    document.querySelector(".quest-actions");
  const startBtn = document.querySelector("[data-quest-start]");
  const heartsEl = document.querySelector("[data-quest-hearts]");
  const starsEl = document.querySelector("[data-quest-stars]");
  const stepEl = document.querySelector("[data-quest-step]");
  const trail = document.querySelector("[data-quest-trail]");
  const nameEl = document.querySelector("[data-quest-name]");
  const avatarEl = document.querySelector("[data-quest-avatar]");
  const noteEl = document.querySelector("[data-quest-note]");

  const lang = () => {
    const code = store ? store.getLanguage() : "en";
    return DECK[code] ? code : "en";
  };

  const profile = () => (store ? store.getActiveProfile() : null);
  const lane = () => DECK[lang()] || DECK.en;

  let activeDeck = null;
  let stopIndex = 0;
  let hearts = 0;
  let stars = 0;
  let lessons = [];
  let phase = "idle";

  const avatarFor = (id) =>
    (store && store.AVATARS.find((avatar) => avatar.id === id)) || null;

  const paintKid = () => {
    const kid = profile();
    if (!kid) return;

    if (nameEl) nameEl.textContent = kid.name;
    const avatar = avatarFor(kid.avatar);
    if (avatarEl && avatar) {
      avatarEl.src = avatar.src;
      avatarEl.alt = "";
    }
    document.documentElement.dir = lang() === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang();
  };

  const paintStats = () => {
    if (heartsEl) heartsEl.textContent = String(hearts);
    if (starsEl) starsEl.textContent = String(stars);
    if (stepEl) stepEl.textContent = String(Math.min(stopIndex, 4));

    if (trail) {
      Array.from(trail.children).forEach((item, index) => {
        item.classList.toggle("is-done", index < stopIndex);
        item.classList.toggle("is-current", index === stopIndex && phase === "play");
      });
    }
  };

  const setActions = (button, label, handler) => {
    if (!actions) return;
    actions.textContent = "";
    button.textContent = label;
    button.addEventListener("click", handler);
    actions.appendChild(button);
  };

  const makeButton = (className, label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    return button;
  };

  const reset = () => {
    activeDeck = lane();
    stopIndex = 0;
    hearts = 0;
    stars = 0;
    lessons = [];
    phase = "idle";

    paintKid();
    paintStats();

    if (kicker) kicker.textContent = activeDeck.startKicker;
    if (title) title.textContent = activeDeck.startTitle;
    if (copy) copy.textContent = activeDeck.startCopy;

    if (choices) {
      choices.hidden = true;
      choices.textContent = "";
    }

    const button = makeButton("btn btn--yellow", activeDeck.start);
    button.dataset.questStart = "";
    setActions(button, activeDeck.start, begin);
  };

  const begin = async () => {
    if (phase === "play") return;
    phase = "play";
    activeDeck = await requestQuest();
    stopIndex = 0;
    hearts = 0;
    stars = 0;
    lessons = [];
    renderStop();
  };

  const requestQuest = async () => {
    const endpoint = window.STORYSPARK_QUEST_API;
    if (!endpoint) return lane();

    const kid = profile();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: kid ? kid.name : "Pip",
          age_band: kid ? kid.ageBand : "4-6",
          language: lang(),
          lesson: "kindness",
          knowledge: store ? store.activeSnippets(2) : []
        })
      });

      if (!response.ok) throw new Error(`Quest request failed (${response.status})`);

      const data = await response.json();
      if (!data || !Array.isArray(data.stops) || data.stops.length < 2) {
        throw new Error("Quest response was not usable");
      }

      const base = lane();
      return {
        ...base,
        startTitle: data.title || base.startTitle,
        stops: data.stops
          .slice(0, 4)
          .map((stop, index) => ({
            title: stop.title || `${base.stop} ${index + 1}`,
            prompt: stop.prompt || stop.narration || "",
            choices: (stop.choices || []).slice(0, 3).map((choice) => ({
              label: choice.label || "Choose",
              outcome: choice.outcome || choice.text || "",
              lesson: choice.lesson || ""
            }))
          }))
          .filter((stop) => stop.prompt && stop.choices.length >= 2)
      };
    } catch (error) {
      console.warn("StorySpark quest API unavailable, using the scripted quest.", error);
      if (noteEl) noteEl.textContent = lane().apiNote;
      return lane();
    }
  };

  const renderStop = () => {
    const deck = activeDeck || lane();
    const stop = deck.stops[stopIndex];

    if (!stop) {
      renderEnd();
      return;
    }

    phase = "play";
    paintKid();
    paintStats();

    if (kicker) kicker.textContent = `${deck.stop} ${stopIndex + 1} ${deck.of} ${deck.stops.length}`;
    if (title) title.textContent = stop.title;
    if (copy) copy.textContent = stop.prompt;

    if (choices) {
      choices.hidden = false;
      choices.textContent = "";

      stop.choices.forEach((choice) => {
        const button = makeButton("quest-choice", choice.label);

        const label = document.createElement("span");
        label.className = "quest-choice__label";
        label.textContent = choice.label;

        const arrow = document.createElement("span");
        arrow.className = "choice-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";

        button.textContent = "";
        button.append(label, arrow);

        button.addEventListener("click", () => choose(choice), { once: true });
        choices.appendChild(button);
      });
    }

    if (actions) actions.textContent = "";
  };

  const choose = (choice) => {
    hearts += 1;
    stars += 1;
    lessons.push({ stop: activeDeck.stops[stopIndex].title, lesson: choice.lesson });

    if (choices) {
      choices.hidden = true;
      choices.textContent = "";
    }

    if (kicker) kicker.textContent = activeDeck.lesson;
    if (title) title.textContent = choice.label;
    if (copy) copy.textContent = choice.outcome;

    paintStats();

    const last = stopIndex >= activeDeck.stops.length - 1;
    const button = makeButton(
      "btn btn--yellow",
      last ? activeDeck.finish : activeDeck.next
    );

    setActions(button, last ? activeDeck.finish : activeDeck.next, () => {
      stopIndex += 1;
      paintStats();
      if (stopIndex >= activeDeck.stops.length) {
        renderEnd();
      } else {
        renderStop();
      }
    });
  };

  const renderEnd = () => {
    phase = "end";

    if (store) store.recordGame(hearts);

    paintKid();
    paintStats();

    if (kicker) kicker.textContent = activeDeck.complete;
    if (title) title.textContent = `${stars} / ${activeDeck.stops.length} ★`;
    if (copy) {
      copy.textContent =
        activeDeck.summary + " " + (stars >= activeDeck.stops.length ? activeDeck.full : "");
    }

    if (choices) {
      choices.hidden = false;
      choices.textContent = "";

      lessons.forEach((entry) => {
        const row = document.createElement("div");
        row.className = "quest-lesson";

        const stop = document.createElement("strong");
        stop.textContent = entry.stop;

        const text = document.createElement("span");
        text.textContent = entry.lesson;

        row.append(stop, text);
        choices.appendChild(row);
      });
    }

    if (!actions) return;
    actions.textContent = "";

    const again = makeButton("btn", activeDeck.again);
    again.addEventListener("click", () => {
      reset();
      begin();
    });

    const studio = document.createElement("a");
    studio.className = "btn btn--yellow";
    studio.href = "play.html";
    studio.textContent = activeDeck.toStudio;

    actions.append(again, studio);
  };

  reset();

  document.addEventListener("storyspark:language", () => {
    reset();
  });

  if (startBtn) startBtn.remove();
})();
