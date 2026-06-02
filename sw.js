const CACHE = "site-v1";

// Кэшлэх файлууд
const STATIC = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/love.jpeg",
  "/love2.jpeg",
  "/love3.jpeg",
  "/love4.jpeg",
  "/love5.jpeg",
  "/love6.jpeg",
  "/web.jpg"
];

// Суулгахад файлуудыг кэшлэнэ
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC.map(u => new Request(u, {cache:"reload"}))))
      .catch(() => {})
  );
  self.skipWaiting();
});

// Хуучин кэш устгана
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = e.request.url;

  // Firebase, YouTube, CDN — зөвхөн network (кэш биш)
  if (
    url.includes("firebase") || url.includes("gstatic") ||
    url.includes("googleapis") || url.includes("youtube") ||
    url.includes("cdnjs") || url.includes("jsdelivr") ||
    url.includes("unpkg") || url.includes("fonts.g") ||
    url.includes("openstreetmap") || url.includes("tile.")
  ) {
    e.respondWith(fetch(e.request).catch(() => new Response("", {status:503})));
    return;
  }

  // Өөрийн файлууд — Network эхлэж, алдаатай бол кэш
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Шинэ хувилбарыг кэшэд хадгална
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
