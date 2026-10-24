/* Shared helpers for the browser-logic tests.
   The site has no bundler, so tests load the real source files into a Node VM
   with a small window/document stub. */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "../..");

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function fakeStorage() {
  const data = new Map();

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
    get length() {
      return data.size;
    },
    _data: data
  };
}

function loadStore() {
  const window = { localStorage: fakeStorage() };
  global.window = window;
  vm.runInThisContext(read("assets/js/store.js"), { filename: "store.js" });

  if (!window.StorySparkStore) {
    throw new Error("store.js did not expose StorySparkStore");
  }

  return { window, store: window.StorySparkStore, storage: window.localStorage };
}

function makeDocument({ nodes = {} } = {}) {
  return {
    readyState: "complete",
    documentElement: { lang: "", dir: "" },
    querySelectorAll(selector) {
      return nodes[selector] || [];
    },
    addEventListener() {},
    dispatchEvent() {}
  };
}

function loadI18n({ language = "en", document } = {}) {
  const window = {
    StorySparkStore: {
      LANGUAGES: [
        { code: "en", label: "English", dir: "ltr" },
        { code: "es", label: "Español", dir: "ltr" },
        { code: "fr", label: "Français", dir: "ltr" },
        { code: "ar", label: "العربية", dir: "rtl" }
      ],
      getLanguage: () => language,
      setLanguage: () => {}
    }
  };

  const doc = document || makeDocument();
  global.window = window;
  global.document = doc;
  vm.runInThisContext(read("assets/js/i18n.js"), { filename: "i18n.js" });

  if (!window.StorySparkI18n) {
    throw new Error("i18n.js did not expose StorySparkI18n");
  }

  return { window, i18n: window.StorySparkI18n, document: doc };
}

function loadQuest() {
  const window = { StorySparkStore: null };
  const document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      textContent: "",
      className: "",
      type: "",
      dataset: {},
      append() {},
      appendChild() {},
      setAttribute() {},
      addEventListener() {}
    }),
    addEventListener() {},
    documentElement: { lang: "", dir: "" }
  };

  global.window = window;
  global.document = document;
  vm.runInThisContext(read("assets/js/game.js"), { filename: "game.js" });

  if (!window.StorySparkQuest) {
    throw new Error("game.js did not expose StorySparkQuest");
  }

  return { window, deck: window.StorySparkQuest.DECK };
}

module.exports = {
  ROOT,
  read,
  fakeStorage,
  loadStore,
  makeDocument,
  loadI18n,
  loadQuest
};
