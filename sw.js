/* StorySpark Local — offline cache.
   The whole site is static, so the app shell can be cached after the first visit.
   Navigation is network-first with an offline fallback; assets are cache-first. */

"use strict";

const VERSION = "storyspark-v1";
const SHELL = [
  "./",
  "index.html",
  "what-it-does.html",
  "how-it-works.html",
  "family.html",
  "play.html",
  "game.html",
  "grown-ups.html",
  "manifest.webmanifest",
  "assets/css/style.css",
  "assets/js/main.js",
  "assets/js/store.js",
  "assets/js/i18n.js",
  "assets/js/play.js",
  "assets/js/family.js",
  "assets/js/game.js",
  "assets/js/pwa.js",
  "assets/favicon.svg",
  "assets/icons/icon-180.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/avatars/fox.svg",
  "assets/avatars/frog.svg",
  "assets/avatars/cat.svg",
  "assets/avatars/bear.svg",
  "assets/avatars/bunny.svg",
  "assets/avatars/owl.svg",
  "assets/avatars/whale.svg",
  "assets/avatars/monster.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("index.html"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
