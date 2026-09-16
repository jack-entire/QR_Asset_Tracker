// Service worker for the QR asset scanner.
//
// Caches the app shell on install so it keeps working with no signal once a
// crew member has loaded it once (site conditions are assumed offline).
// Cache-first for our own files; anything else just falls through to the
// network (there isn't supposed to be anything else - no analytics, no CDN
// calls at runtime).
//
// Bump CACHE_VERSION whenever index.html/jsQR.js/sw.js/trial_items.csv
// changes so returning devices pick up the new version instead of a stale
// cached copy.
//
// CACHE_PREFIX includes this service worker's own scope (a full URL, unique
// per job/path even when two jobs' pages share one hosting origin - see the
// JOB_ID note in index.html). Cache Storage is shared across the WHOLE
// origin, not scoped per path, so without this a naive fixed cache name
// would let one job's activate handler below delete another job's cache.
const CACHE_VERSION = "v8";
const CACHE_PREFIX = "qr-scan-page-" + self.registration.scope;
const CACHE_NAME = CACHE_PREFIX + "-" + CACHE_VERSION;
// Deliberately NOT "./" here - it resolves differently across hosts (plain
// http.server vs GitHub Pages vs others) and caches.addAll() is all-or-
// nothing: if any single URL in the list fails to fetch, the WHOLE install
// is rejected and NOTHING gets cached - offline would silently never work,
// which breaks the brief's "must work offline" constraint. Caching each
// file with its own catch means one bad entry can't take the others down.
const APP_SHELL = ["./index.html", "./jsQR.js", "./sw.js", "./trial_items.csv"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(APP_SHELL.map((url) =>
        // fetch()+cache.put() rather than cache.add() - Cache.add() isn't
        // universally implemented across mobile browsers, and if it's
        // missing entirely every entry would silently fail here (same
        // failure mode this per-entry catch is meant to guard against).
        // fetch()/cache.put() are both baseline-supported wherever the
        // Cache API exists at all.
        //
        // fetch() only rejects on a network error - a 404/500 still
        // resolves "successfully". Without the .ok check, a bad response
        // (e.g. a deploy race where trial_items.csv isn't live yet) would
        // get cached as if it were the real file, and every offline load
        // after that would serve the error page forever - checked here
        // instead of assuming a resolved fetch means a good response.
        fetch(url)
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return cache.put(url, response);
          })
          .catch((e) => console.warn("SW: failed to cache", url, e))
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      // Only ever touch caches in THIS scope's own namespace (see
      // CACHE_PREFIX above) - never a bare "delete anything that isn't my
      // current name," which would reach across into another job's cache
      // on a shared origin.
      Promise.all(
        names
          .filter((n) => n.startsWith(CACHE_PREFIX) && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Opportunistically cache same-origin successful responses so the
        // app shell self-heals if a file was added after first install.
        if (response && response.ok && event.request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
