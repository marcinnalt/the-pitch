/* StorySpark Local — tiny UI translation layer.
   The interface speaks the family's language; generated stories do too
   (the language code is sent to the local model). */

(function () {
  "use strict";

  const DICT = {
    en: {
      step1: "Step 1 · Draw your hero",
      step2: "Steps 2 & 3 · Set the story",
      pointer: "Use a finger or mouse",
      who: "Who is the hero?",
      pickName: "pick a name",
      practice: "What should they practise?",
      pickLesson: "pick a lesson",
      tell: "Tell my story",
      hint: "StorySpark will look at your drawing, then start a chapter with three real choices.",
      drawHere: "Draw your hero here",
      blob: "a blob counts",
      clear: "Clear paper",
      erase: "Erase",
      paper: "Your paper · keep it weird",
      chapter: "Chapter",
      lessonUnder: "The lesson underneath",
      save: "Save coloring page",
      restart: "Start a new story",
      previewNote: "Preview story — the full app writes this from your drawing with the Gemini 4 engine.",
      looking: "Looking at your drawing…",
      finding: "StorySpark is finding the hero in your crayon lines.",
      language: "Story language",
      noDrawing: "No drawing this time — that's fine. {name} is here anyway.",
      gameTitle: "StorySpark Quest",
      gameIntro: "Walk the path. Make kind choices. Collect hearts.",
      start: "Start the quest",
      choose: "What do you do?",
      next: "Next stop",
      finish: "See my stars",
      again: "New quest",
      complete: "Quest complete!",
      hearts: "Hearts",
      stars: "Stars",
      round: "Stop",
      of: "of",
      hintGame: "Every choice earns a heart. There are no wrong answers, only different ones."
    },
    es: {
      step1: "Paso 1 · Dibuja a tu héroe",
      step2: "Pasos 2 y 3 · Prepara la historia",
      pointer: "Usa un dedo o el ratón",
      who: "¿Quién es el héroe?",
      pickName: "elige un nombre",
      practice: "¿Qué quieres que practique?",
      pickLesson: "elige una lección",
      tell: "Cuéntame la historia",
      hint: "StorySpark mirará tu dibujo y empezará un capítulo con tres decisiones de verdad.",
      drawHere: "Dibuja a tu héroe aquí",
      blob: "un garabato vale",
      clear: "Borrar todo",
      erase: "Borrar",
      paper: "Tu papel · que sea raro",
      chapter: "Capítulo",
      lessonUnder: "La lección escondida",
      save: "Guardar página para colorear",
      restart: "Empezar otra historia",
      previewNote: "Historia de muestra: la app completa la escribe con Gemini 4 a partir de tu dibujo.",
      looking: "Mirando tu dibujo…",
      finding: "StorySpark busca al héroe en tus trazos.",
      language: "Idioma de la historia",
      noDrawing: "Hoy no hay dibujo, ¡no pasa nada! {name} está aquí igual.",
      gameTitle: "La búsqueda de StorySpark",
      gameIntro: "Camina por el sendero. Elige con amabilidad. Recoge corazones.",
      start: "Empezar la aventura",
      choose: "¿Qué haces?",
      next: "Siguiente parada",
      finish: "Ver mis estrellas",
      again: "Nueva aventura",
      complete: "¡Aventura completada!",
      hearts: "Corazones",
      stars: "Estrellas",
      round: "Parada",
      of: "de",
      hintGame: "Cada elección gana un corazón. No hay respuestas malas, solo distintas."
    },
    fr: {
      step1: "Étape 1 · Dessine ton héros",
      step2: "Étapes 2 et 3 · Prépare l'histoire",
      pointer: "Avec un doigt ou la souris",
      who: "Qui est le héros ?",
      pickName: "choisis un prénom",
      practice: "Qu'est-ce qu'on va travailler ?",
      pickLesson: "choisis une leçon",
      tell: "Raconte-moi l'histoire",
      hint: "StorySpark regardera ton dessin, puis écrira un chapitre avec trois vrais choix.",
      drawHere: "Dessine ton héros ici",
      blob: "un gribouillis, ça compte",
      clear: "Tout effacer",
      erase: "Gomme",
      paper: "Ton papier · reste bizarre",
      chapter: "Chapitre",
      lessonUnder: "La leçon cachée",
      save: "Enregistrer le coloriage",
      restart: "Recommencer une histoire",
      previewNote: "Histoire de démo — l'app complète l'écrit avec Gemini 4 à partir de ton dessin.",
      looking: "Je regarde ton dessin…",
      finding: "StorySpark cherche le héros dans tes traits.",
      language: "Langue de l'histoire",
      noDrawing: "Pas de dessin cette fois — ce n'est pas grave. {name} est là quand même.",
      gameTitle: "La quête StorySpark",
      gameIntro: "Suis le chemin. Choisis avec gentillesse. Récolte des cœurs.",
      start: "Commencer la quête",
      choose: "Que fais-tu ?",
      next: "Prochaine étape",
      finish: "Voir mes étoiles",
      again: "Nouvelle quête",
      complete: "Quête terminée !",
      hearts: "Cœurs",
      stars: "Étoiles",
      round: "Étape",
      of: "sur",
      hintGame: "Chaque choix gagne un cœur. Il n'y a pas de mauvaise réponse, seulement des différentes."
    },
    ar: {
      step1: "الخطوة ١ · ارسم بطلك",
      step2: "الخطوتان ٢ و٣ · جهّز القصة",
      pointer: "استخدم إصبعك أو الفأرة",
      who: "من هو البطل؟",
      pickName: "اختر اسمًا",
      practice: "ماذا نريد أن يتدرّب عليه؟",
      pickLesson: "اختر درسًا",
      tell: "احكِ لي القصة",
      hint: "سينظر ستوري سبارك في رسمك، ثم يبدأ فصلًا بثلاثة خيارات حقيقية.",
      drawHere: "ارسم بطلك هنا",
      blob: "حتى الخربشة تُحتسب",
      clear: "امسح الورقة",
      erase: "ممحاة",
      paper: "ورقتك · كن غريبًا",
      chapter: "الفصل",
      lessonUnder: "الدرس المخبأ",
      save: "احفظ صفحة التلوين",
      restart: "ابدأ قصة جديدة",
      previewNote: "قصة تجريبية — التطبيق الكامل يكتبها بمحرك Gemini 4 من رسمك.",
      looking: "أنظر إلى رسمك…",
      finding: "ستوري سبارك يبحث عن البطل بين خطوطك.",
      language: "لغة القصة",
      noDrawing: "لا يوجد رسم هذه المرة — لا بأس. {name} هنا معنا.",
      gameTitle: "مغامرة ستوري سبارك",
      gameIntro: "امشِ على الدرب. اختر بلطف. اجمع القلوب.",
      start: "ابدأ المغامرة",
      choose: "ماذا تفعل؟",
      next: "المحطة التالية",
      finish: "أرى نجومي",
      again: "مغامرة جديدة",
      complete: "اكتملت المغامرة!",
      hearts: "قلوب",
      stars: "نجوم",
      round: "محطة",
      of: "من",
      hintGame: "كل اختيار يمنحك قلبًا. لا توجد إجابات خاطئة، فقط إجابات مختلفة."
    }
  };

  const getLang = () => {
    const store = window.StorySparkStore;
    const code = store ? store.getLanguage() : "en";
    return DICT[code] ? code : "en";
  };

  const t = (key, vars) => {
    const lang = getLang();
    let value = (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;

    if (vars) {
      Object.keys(vars).forEach((name) => {
        value = value.split(`{${name}}`).join(vars[name]);
      });
    }

    return value;
  };

  const apply = (lang) => {
    const code = DICT[lang] ? lang : "en";
    const store = window.StorySparkStore;
    const meta = store
      ? store.LANGUAGES.find((language) => language.code === code)
      : null;

    document.documentElement.lang = code;
    document.documentElement.dir = meta && meta.dir === "rtl" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n, node.dataset);
    });

    document.querySelectorAll("[data-i18n-ph]").forEach((node) => {
      node.placeholder = t(node.dataset.i18nPh);
    });

    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.value = code;
    });
  };

  const init = () => {
    apply(getLang());

    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.addEventListener("change", () => {
        const code = select.value;
        if (window.StorySparkStore) window.StorySparkStore.setLanguage(code);
        apply(code);
        document.dispatchEvent(
          new CustomEvent("storyspark:language", { detail: code })
        );
      });
    });
  };

  window.StorySparkI18n = { t, apply, init, DICT };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
