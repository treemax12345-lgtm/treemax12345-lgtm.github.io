// Версийн дугаарыг өөрчлөх бүрд cache шинэчлэгдэнэ
const CACHE = "v3";

// Ямар файлуудыг cache-д хадгалах
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Суулгах үед cache үүсгэнэ
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Хуучин cache-уудыг устгана
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-аас авах, cache backup болгон ашиглах
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Шинэ хувилбарыг cache-д хадгална
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
