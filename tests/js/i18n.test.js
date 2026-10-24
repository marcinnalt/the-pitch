"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { loadI18n, makeDocument } = require("./helpers");

test("every language exposes the same set of UI keys", () => {
  const { i18n } = loadI18n();
  const base = Object.keys(i18n.DICT.en).sort();

  for (const language of Object.keys(i18n.DICT)) {
    assert.deepEqual(Object.keys(i18n.DICT[language]).sort(), base, language);
  }
});

test("translations return real copy, never the raw key", () => {
  const { i18n } = loadI18n();

  for (const language of Object.keys(i18n.DICT)) {
    for (const key of Object.keys(i18n.DICT.en)) {
      const value = i18n.DICT[language][key];
      assert.equal(typeof value, "string", `${language}.${key}`);
      assert.ok(value.length > 0, `${language}.${key} is empty`);
    }
  }
});

test("variables are interpolated", () => {
  const { i18n } = loadI18n();

  assert.equal(i18n.t("noDrawing", { name: "Nori" }), "No drawing this time — that's fine. Nori is here anyway.");
});

test("Arabic switches the document to RTL, English to LTR", () => {
  const ar = loadI18n({ language: "ar" });
  assert.equal(ar.document.documentElement.dir, "rtl");
  assert.equal(ar.document.documentElement.lang, "ar");

  const es = loadI18n({ language: "es" });
  assert.equal(es.document.documentElement.dir, "ltr");
  assert.equal(es.document.documentElement.lang, "es");
});

test("an unknown language falls back to English", () => {
  const { i18n, document } = loadI18n({ language: "xx" });

  assert.equal(document.documentElement.lang, "en");
  assert.equal(i18n.t("tell"), "Tell my story");
});

test("data-i18n nodes and placeholders are filled in", () => {
  const nodes = {
    "[data-i18n]": [
      { dataset: { i18n: "tell" }, textContent: "" },
      { dataset: { i18n: "hearts" }, textContent: "" }
    ],
    "[data-i18n-ph]": [
      { dataset: { i18nPh: "pickName" }, placeholder: "" }
    ],
    "[data-language-select]": [
      { value: "fr", addEventListener() {} }
    ]
  };

  const doc = makeDocument({ nodes });
  const { i18n } = loadI18n({ document: doc, language: "es" });
  i18n.apply("es");

  assert.equal(nodes["[data-i18n]"][0].textContent, "Cuéntame la historia");
  assert.equal(nodes["[data-i18n]"][1].textContent, "Corazones");
  assert.equal(nodes["[data-i18n-ph]"][0].placeholder, "elige un nombre");
  assert.equal(nodes["[data-language-select]"][0].value, "es");
});
