const CACHE = "v5";
const STATIC = ["/", "/index.html", "/manifest.json"];

// Суулгах үед үндсэн файлуудыг cache-лна
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

// Хуучин cache устгана
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Firebase болон YouTube request-уудыг cache-лахгүй
  const url = e.request.url;
  if (url.includes("firebase") || url.includes("youtube") ||
      url.includes("googleapis") || url.includes("gstatic") ||
      url.includes("unpkg") || url.includes("cdnjs") ||
      url.includes("jsdelivr") || url.includes("fonts.g")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Бусад файлд: Network-аас авах, алдаатай бол cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
