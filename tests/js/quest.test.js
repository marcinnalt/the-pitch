"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { loadQuest } = require("./helpers");

const LANGUAGES = ["en", "es", "fr", "ar"];

test("the quest deck exists in all four story languages", () => {
  const { deck } = loadQuest();

  assert.deepEqual(Object.keys(deck).sort(), LANGUAGES.slice().sort());
});

test("every language has four stops and three kind choices per stop", () => {
  const { deck } = loadQuest();

  for (const language of LANGUAGES) {
    const quest = deck[language];
    assert.equal(quest.stops.length, 4, `${language} stops`);

    for (const [index, stop] of quest.stops.entries()) {
      assert.ok(stop.title.trim(), `${language} stop ${index} title`);
      assert.ok(stop.prompt.trim(), `${language} stop ${index} prompt`);
      assert.equal(stop.choices.length, 3, `${language} stop ${index} choices`);

      for (const [choiceIndex, choice] of stop.choices.entries()) {
        assert.ok(choice.label.trim(), `${language} ${index}.${choiceIndex} label`);
        assert.ok(choice.outcome.trim(), `${language} ${index}.${choiceIndex} outcome`);
        assert.ok(choice.lesson.trim(), `${language} ${index}.${choiceIndex} lesson`);
        assert.ok(choice.label.length <= 48, `${language} ${index}.${choiceIndex} label is too long`);
      }
    }
  }
});

test("the chrome strings are translated in every language", () => {
  const { deck } = loadQuest();
  const keys = ["start", "next", "finish", "again", "complete", "summary", "stop", "of", "choose", "lesson"];

  for (const language of LANGUAGES) {
    for (const key of keys) {
      assert.equal(typeof deck[language][key], "string", `${language}.${key}`);
      assert.ok(deck[language][key].trim().length > 0, `${language}.${key} is empty`);
    }
  }
});

test("no deck contains raw HTML or script injection", () => {
  const { deck } = loadQuest();
  const text = JSON.stringify(deck);

  assert.ok(!/<script/i.test(text));
  assert.ok(!/onerror\s*=/i.test(text));
  assert.ok(!/javascript:/i.test(text));
});

test("outcomes stay short enough for a child-facing card", () => {
  const { deck } = loadQuest();

  for (const language of LANGUAGES) {
    for (const stop of deck[language].stops) {
      for (const choice of stop.choices) {
        assert.ok(choice.outcome.length <= 300, `${language}: ${choice.outcome.length} chars`);
        assert.ok(choice.lesson.length <= 180, `${language}: lesson too long`);
      }
    }
  }
});

test("stop titles are unique within a language", () => {
  const { deck } = loadQuest();

  for (const language of LANGUAGES) {
    const titles = deck[language].stops.map((stop) => stop.title);
    assert.equal(new Set(titles).size, titles.length, language);
  }
});
