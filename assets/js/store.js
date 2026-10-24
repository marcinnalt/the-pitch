/* StorySpark Local — shared family data
   Profiles, story language and the family knowledge base live in localStorage,
   so the pitch works with no accounts and no server. */

(function () {
  "use strict";

  const KEYS = {
    profiles: "storyspark.profiles.v1",
    active: "storyspark.active.v1",
    knowledge: "storyspark.knowledge.v1"
  };

  const LANGUAGES = [
    { code: "en", label: "English", dir: "ltr" },
    { code: "es", label: "Español", dir: "ltr" },
    { code: "fr", label: "Français", dir: "ltr" },
    { code: "ar", label: "العربية", dir: "rtl" }
  ];

  const AVATAR_COLORS = ["#FFD22E", "#FF5A36", "#7CC7FF", "#8FE3AE", "#FFEAA6", "#14110F"];

  const AVATARS = [
    { id: "fox", label: "Fox", src: "assets/avatars/fox.svg" },
    { id: "frog", label: "Frog", src: "assets/avatars/frog.svg" },
    { id: "cat", label: "Cat", src: "assets/avatars/cat.svg" },
    { id: "bear", label: "Bear", src: "assets/avatars/bear.svg" },
    { id: "bunny", label: "Bunny", src: "assets/avatars/bunny.svg" },
    { id: "owl", label: "Owl", src: "assets/avatars/owl.svg" },
    { id: "whale", label: "Whale", src: "assets/avatars/whale.svg" },
    { id: "monster", label: "Monster", src: "assets/avatars/monster.svg" }
  ];

  const DEFAULT_PROFILE = {
    id: "pip",
    name: "Pip",
    ageBand: "4-6",
    color: "#FFD22E",
    avatar: "fox",
    language: "en",
    lesson: "kindness",
    stories: 0,
    hearts: 0,
    createdAt: 0
  };

  const read = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const write = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* Storage can be unavailable in private mode; the demo still runs. */
    }
  };

  const uid = () => "kid-" + Math.random().toString(36).slice(2, 10);

  const getProfiles = () => {
    const stored = read(KEYS.profiles, null);
    if (!Array.isArray(stored) || stored.length === 0) {
      write(KEYS.profiles, [DEFAULT_PROFILE]);
      return [DEFAULT_PROFILE];
    }
    return stored;
  };

  const saveProfiles = (profiles) => {
    write(KEYS.profiles, profiles.slice(0, 8));
  };

  const getActiveProfile = () => {
    const profiles = getProfiles();
    const id = read(KEYS.active, profiles[0].id);
    return profiles.find((profile) => profile.id === id) || profiles[0];
  };

  const setActiveProfile = (id) => {
    write(KEYS.active, id);
  };

  const addProfile = (data) => {
    const profiles = getProfiles();
    const profile = {
      id: uid(),
      name: String(data.name || "New kid").trim().slice(0, 24) || "New kid",
      ageBand: data.ageBand || "4-6",
      color: data.color || AVATAR_COLORS[0],
      avatar: data.avatar || "fox",
      language: data.language || "en",
      lesson: data.lesson || "kindness",
      stories: 0,
      hearts: 0,
      createdAt: Date.now()
    };

    profiles.push(profile);
    saveProfiles(profiles);
    setActiveProfile(profile.id);
    return profile;
  };

  const updateProfile = (id, patch) => {
    const profiles = getProfiles().map((profile) =>
      profile.id === id ? { ...profile, ...patch } : profile
    );
    saveProfiles(profiles);
  };

  const removeProfile = (id) => {
    let profiles = getProfiles().filter((profile) => profile.id !== id);

    if (profiles.length === 0) {
      profiles = [{ ...DEFAULT_PROFILE, id: uid(), createdAt: Date.now() }];
    }

    saveProfiles(profiles);

    if (read(KEYS.active, null) === id) {
      setActiveProfile(profiles[0].id);
    }
  };

  const getLanguage = () => getActiveProfile().language || "en";

  const setLanguage = (code) => {
    updateProfile(getActiveProfile().id, { language: code });
  };

  const getKnowledge = () => {
    const stored = read(KEYS.knowledge, []);
    return Array.isArray(stored) ? stored : [];
  };

  const saveKnowledge = (items) => {
    write(KEYS.knowledge, items.slice(0, 24));
  };

  const addKnowledge = (item) => {
    const text = String(item.text || "").trim().slice(0, 20000);
    if (!text) return null;

    const notes = getKnowledge();
    const entry = {
      id: uid(),
      title: String(item.title || "Family notes").trim().slice(0, 80) || "Family notes",
      text: text,
      words: text.split(/\s+/).filter(Boolean).length,
      enabled: true,
      addedAt: Date.now()
    };

    notes.unshift(entry);
    saveKnowledge(notes);
    return entry;
  };

  const toggleKnowledge = (id) => {
    saveKnowledge(
      getKnowledge().map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const removeKnowledge = (id) => {
    saveKnowledge(getKnowledge().filter((item) => item.id !== id));
  };

  const activeSnippets = (limit = 3) =>
    getKnowledge()
      .filter((item) => item.enabled && item.text)
      .slice(0, limit)
      .map((item) => `${item.title}: ${item.text.slice(0, 700)}`);

  const recordStory = () => {
    const profile = getActiveProfile();
    updateProfile(profile.id, { stories: (profile.stories || 0) + 1 });
  };

  const recordGame = (hearts) => {
    const profile = getActiveProfile();
    updateProfile(profile.id, {
      hearts: (profile.hearts || 0) + Math.max(0, Number(hearts) || 0)
    });
  };

  window.StorySparkStore = {
    LANGUAGES,
    AVATAR_COLORS,
    AVATARS,
    getProfiles,
    getActiveProfile,
    setActiveProfile,
    addProfile,
    updateProfile,
    removeProfile,
    getLanguage,
    setLanguage,
    getKnowledge,
    addKnowledge,
    toggleKnowledge,
    removeKnowledge,
    activeSnippets,
    recordStory,
    recordGame
  };
})();
