"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { read } = require("./helpers");

const PAGES = [
  "index.html",
  "what-it-does.html",
  "how-it-works.html",
  "family.html",
  "play.html",
  "game.html",
  "grown-ups.html"
];

test("the family page has a real knowledge-base upload UI", () => {
  const family = read("family.html");

  assert.ok(family.includes('id="bookshelf"'), "missing bookshelf section");
  assert.ok(family.includes("data-kb-file"), "missing file input");
  assert.ok(family.includes("data-note-form"), "missing paste-note form");
  assert.ok(family.includes("data-kb-list"), "missing bookshelf list");
  assert.ok(family.includes("data-avatar-picker"), "missing avatar picker");
  assert.ok(family.includes("assets/js/family.js"), "family.js not loaded");
});

test("the studio points people at the knowledge-base upload", () => {
  const play = read("play.html");

  assert.ok(play.includes("studio-bookshelf"), "missing bookshelf callout in the studio");
  assert.ok(play.includes('href="family.html#bookshelf"'), "callout does not link to the upload");
});

test("every page exposes the bookshelf and install entry points", () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.ok(html.includes('href="family.html#bookshelf"'), `${page} has no bookshelf link`);
    assert.ok(html.includes('href="grown-ups.html#install"'), `${page} has no install link`);
  }
});

test("the install section explains phone installation", () => {
  const grown = read("grown-ups.html");

  assert.ok(grown.includes('id="install"'), "missing install section");
  assert.ok(grown.includes("data-install-app"), "missing install button");
  assert.ok(grown.includes("Add to Home Screen"), "missing iPhone guidance");
  assert.ok(grown.includes("sw.js"), "missing service-worker one-liner");
});

test("family.js wires up every knowledge-base control", () => {
  const family = read("assets/js/family.js");

  for (const hook of [
    "[data-kb-file]",
    "[data-note-form]",
    "[data-kb-list]",
    "[data-profile-form]",
    "[data-avatar-picker]"
  ]) {
    assert.ok(family.includes(hook), `family.js does not use ${hook}`);
  }

  assert.ok(family.includes("readAsText"), "files are not read as text");
  assert.ok(family.includes("300 * 1024"), "missing file-size guard");
});
