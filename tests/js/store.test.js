"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { ROOT, loadStore } = require("./helpers");

test("first visit creates the default Pip profile", () => {
  const { store } = loadStore();
  const profiles = store.getProfiles();

  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].id, "pip");
  assert.equal(profiles[0].name, "Pip");
  assert.equal(profiles[0].ageBand, "4-6");
  assert.equal(profiles[0].language, "en");
  assert.equal(profiles[0].avatar, "fox");
  assert.equal(store.getActiveProfile().id, "pip");
});

test("adding a kid trims the name, stores the avatar and makes them active", () => {
  const { store } = loadStore();
  const kid = store.addProfile({
    name: "  Nori  ",
    ageBand: "6-8",
    avatar: "owl",
    language: "es",
    lesson: "courage"
  });

  assert.equal(kid.name, "Nori");
  assert.equal(kid.avatar, "owl");
  assert.equal(kid.language, "es");
  assert.equal(kid.lesson, "courage");
  assert.equal(kid.stories, 0);
  assert.equal(kid.hearts, 0);
  assert.equal(store.getActiveProfile().id, kid.id);
  assert.equal(store.getProfiles().length, 2);
});

test("profile names are capped at 24 characters and never blank", () => {
  const { store } = loadStore();
  const long = store.addProfile({ name: "x".repeat(40) });
  const blank = store.addProfile({ name: "   " });

  assert.equal(long.name.length, 24);
  assert.equal(blank.name, "New kid");
});

test("unknown avatars and languages fall back to safe defaults", () => {
  const { store } = loadStore();
  const kid = store.addProfile({ name: "Milo", avatar: "dragon", language: "xx", lesson: "flying" });

  assert.equal(kid.avatar, "dragon"); // stored, UI resolves to the first avatar
  assert.equal(kid.language, "xx");
  assert.equal(kid.lesson, "flying");
});

test("the family is capped at eight profiles", () => {
  const { store } = loadStore();
  for (let index = 0; index < 10; index += 1) {
    store.addProfile({ name: `Kid ${index}` });
  }

  assert.equal(store.getProfiles().length, 8);
  assert.equal(store.getProfiles()[0].id, "pip");
});

test("switching the active profile changes the current language", () => {
  const { store } = loadStore();
  const kid = store.addProfile({ name: "Ada", language: "ar" });

  assert.equal(store.getLanguage(), "ar");
  store.setLanguage("fr");
  assert.equal(store.getLanguage(), "fr");
  assert.equal(store.getActiveProfile().id, kid.id);

  store.setActiveProfile("pip");
  assert.equal(store.getLanguage(), "en");
});

test("updating a profile keeps the other kids untouched", () => {
  const { store } = loadStore();
  const kid = store.addProfile({ name: "Ira" });

  store.updateProfile(kid.id, { name: "Ira B", lesson: "honesty" });

  const updated = store.getProfiles().find((profile) => profile.id === kid.id);
  assert.equal(updated.name, "Ira B");
  assert.equal(updated.lesson, "honesty");
  assert.equal(store.getProfiles().find((profile) => profile.id === "pip").name, "Pip");
});

test("removing the active kid falls back to the first remaining profile", () => {
  const { store } = loadStore();
  const kid = store.addProfile({ name: "Sol" });

  store.removeProfile(kid.id);

  assert.equal(store.getProfiles().length, 1);
  assert.equal(store.getActiveProfile().id, "pip");
});

test("removing the last profile creates a fresh default instead of an empty family", () => {
  const { store } = loadStore();
  store.removeProfile("pip");

  const profiles = store.getProfiles();
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].name, "Pip");
  assert.notEqual(profiles[0].id, "pip");
});

test("a bookmarked active id that no longer exists falls back safely", () => {
  const { store } = loadStore();
  store.setActiveProfile("gone");

  assert.equal(store.getActiveProfile().id, "pip");
});

test("knowledge notes are newest-first, counted and capped", () => {
  const { store } = loadStore();

  store.addKnowledge({ title: "Garden", text: "We share the watering can." });
  store.addKnowledge({ title: "Bedtime", text: "One story, then lights out." });

  const notes = store.getKnowledge();
  assert.equal(notes.length, 2);
  assert.equal(notes[0].title, "Bedtime");
  assert.equal(notes[0].words, 5);
  assert.equal(notes[1].title, "Garden");
});

test("blank knowledge notes are ignored and text is capped", () => {
  const { store } = loadStore();

  assert.equal(store.addKnowledge({ title: "Empty", text: "   " }), null);

  const note = store.addKnowledge({ title: "", text: "x".repeat(25000) });
  assert.equal(note.title, "Family notes");
  assert.equal(note.text.length, 20000);
});

test("only enabled notes are sent as model snippets", () => {
  const { store } = loadStore();
  store.addKnowledge({ title: "One", text: "first" });
  const two = store.addKnowledge({ title: "Two", text: "second" });
  store.addKnowledge({ title: "Three", text: "third" });
  store.addKnowledge({ title: "Four", text: "fourth" });

  store.toggleKnowledge(two.id);

  const snippets = store.activeSnippets(3);
  assert.equal(snippets.length, 3);
  assert.ok(snippets.some((snippet) => snippet.startsWith("One: first")));
  assert.ok(!snippets.some((snippet) => snippet.startsWith("Two:")));
});

test("snippets truncate long notes to 700 characters", () => {
  const { store } = loadStore();
  store.addKnowledge({ title: "Long", text: "y".repeat(2000) });

  const [snippet] = store.activeSnippets(3);
  assert.equal(snippet.length, "Long: ".length + 700);
});

test("deleting a note removes it", () => {
  const { store } = loadStore();
  const note = store.addKnowledge({ title: "Gone", text: "bye" });

  store.removeKnowledge(note.id);

  assert.equal(store.getKnowledge().length, 0);
});

test("stories and hearts are recorded against the active kid only", () => {
  const { store } = loadStore();
  const kid = store.addProfile({ name: "Jun" });

  store.recordStory();
  store.recordStory();
  store.recordGame(4);
  store.recordGame(-2);

  const active = store.getProfiles().find((profile) => profile.id === kid.id);
  const pip = store.getProfiles().find((profile) => profile.id === "pip");
  assert.equal(active.stories, 2);
  assert.equal(active.hearts, 4);
  assert.equal(pip.stories, 0);
  assert.equal(pip.hearts, 0);
});

test("all eight avatars exist on disk", () => {
  const { store } = loadStore();

  assert.equal(store.AVATARS.length, 8);
  for (const avatar of store.AVATARS) {
    const file = path.join(ROOT, avatar.src);
    assert.ok(fs.existsSync(file), `${avatar.src} is missing`);
    assert.ok(fs.readFileSync(file, "utf8").includes("<svg"), `${avatar.src} is not an SVG`);
  }
});

test("four languages are offered, with Arabic marked RTL", () => {
  const { store } = loadStore();
  const codes = store.LANGUAGES.map((language) => language.code);

  assert.deepEqual(codes, ["en", "es", "fr", "ar"]);
  assert.equal(store.LANGUAGES.find((language) => language.code === "ar").dir, "rtl");
});

test("storage failures do not crash the store", () => {
  const { window, store } = loadStore();
  window.localStorage.setItem = () => {
    throw new Error("quota");
  };
  window.localStorage.getItem = () => {
    throw new Error("blocked");
  };

  assert.doesNotThrow(() => store.getProfiles());
  assert.doesNotThrow(() => store.addKnowledge({ title: "x", text: "y" }));
  assert.equal(store.getActiveProfile().name, "Pip");
});
