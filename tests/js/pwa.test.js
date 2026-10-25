"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { ROOT, read } = require("./helpers");

const PAGES = [
  "index.html",
  "what-it-does.html",
  "how-it-works.html",
  "family.html",
  "play.html",
  "game.html",
  "grown-ups.html"
];

const manifest = JSON.parse(read("manifest.webmanifest"));

test("the manifest is valid and installable", () => {
  assert.equal(manifest.short_name, "StorySpark");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.match(manifest.background_color, /^#[0-9A-F]{6}$/i);
  assert.match(manifest.theme_color, /^#[0-9A-F]{6}$/i);
  assert.ok(manifest.icons.length >= 2);
  assert.ok(manifest.shortcuts.length >= 2);
});

test("the manifest ships 192px and 512px icons", () => {
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192"));
  assert.ok(sizes.includes("512x512"));

  for (const icon of manifest.icons) {
    assert.ok(fs.existsSync(path.join(ROOT, icon.src)), `${icon.src} is missing`);
  }
});

test("PNG icons have the size they claim", () => {
  for (const icon of manifest.icons.filter((item) => item.type === "image/png")) {
    const buffer = fs.readFileSync(path.join(ROOT, icon.src));
    assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG", `${icon.src} is not a PNG`);

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    assert.equal(`${width}x${height}`, icon.sizes, `${icon.src} size mismatch`);
  }
});

test("every page links the manifest and the install script", () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.ok(html.includes('rel="manifest"'), `${page} has no manifest link`);
    assert.ok(html.includes("manifest.webmanifest"), `${page} has the wrong manifest path`);
    assert.ok(html.includes("assets/js/pwa.js"), `${page} does not load pwa.js`);
    assert.ok(html.includes("apple-touch-icon"), `${page} has no apple touch icon`);
  }
});

test("the service worker precaches every page and core asset", () => {
  const sw = read("sw.js");

  assert.ok(sw.includes('const VERSION = "storyspark-v1"'));
  assert.ok(sw.includes('register("sw.js")') === false); // registration lives in pwa.js
  assert.ok(sw.includes('request.method !== "GET"'));
  assert.ok(sw.includes('url.pathname.includes("/api/")'));

  for (const page of PAGES) {
    assert.ok(sw.includes(`"${page}"`), `${page} is not in the offline shell`);
  }

  for (const asset of [
    "assets/css/style.css",
    "assets/js/store.js",
    "assets/js/i18n.js",
    "assets/js/play.js",
    "assets/js/family.js",
    "assets/js/game.js",
    "assets/js/pwa.js",
    "assets/avatars/fox.svg",
    "assets/icons/icon-512.png"
  ]) {
    assert.ok(sw.includes(`"${asset}"`), `${asset} is not cached`);
  }
});

test("the offline shell only lists files that exist", () => {
  const sw = read("sw.js");
  const block = sw.match(/const SHELL = \[([\s\S]*?)\];/);
  assert.ok(block, "SHELL array not found");

  const entries = block[1]
    .split("\n")
    .map((line) => line.trim().replace(/,$/, ""))
    .filter((line) => line.startsWith('"'))
    .map((line) => line.slice(1, -1));

  assert.ok(entries.length > 20);
  for (const entry of entries) {
    if (entry === "./") continue;
    assert.ok(fs.existsSync(path.join(ROOT, entry)), `${entry} is cached but missing`);
  }
});

test("the install UI and one-line registration exist", () => {
  const pwa = read("assets/js/pwa.js");
  const grown = read("grown-ups.html");

  assert.ok(pwa.includes('navigator.serviceWorker.register("sw.js")'));
  assert.ok(pwa.includes("beforeinstallprompt"));
  assert.ok(pwa.includes("appinstalled"));
  assert.ok(grown.includes("data-install-app"));
  assert.ok(grown.includes("data-install-note"));
  assert.ok(grown.includes('navigator.serviceWorker.register("sw.js");'));
});
