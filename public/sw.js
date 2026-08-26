/*
 * Offline support for Party Games.
 *
 * The point is narrow and practical: a party happens somewhere with bad wifi,
 * and every game's logic already runs entirely in the browser. If a page has
 * been visited once, it should still play when the network disappears.
 *
 * Strategy:
 *   - build assets (/_next/static/*) are content-hashed, so cache-first
 *   - pages are network-first, falling back to the cached copy, then /offline
 *   - anything that changes data (POST, auth, server actions) is never cached
 */

const VERSION = "v1";
const PAGES = `pg-pages-${VERSION}`;
const ASSETS = `pg-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PAGES && key !== ASSETS)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Requests that must always reach the server. */
function isUncacheable(request, url) {
  return (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.searchParams.has("_rsc") ||
    request.headers.get("accept")?.includes("text/x-component")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (isUncacheable(request, url)) return;

  // Hashed build output never changes under the same URL.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(ASSETS).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  const isPage = request.mode === "navigate";
  if (!isPage && !url.pathname.startsWith("/assets/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache a genuine success — an error page is worse than nothing.
        if (response.ok) {
          const copy = response.clone();
          caches.open(PAGES).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (isPage) return caches.match(OFFLINE_URL);
        return Response.error();
      }),
  );
});
