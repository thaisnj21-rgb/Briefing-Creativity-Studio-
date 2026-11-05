// Service worker: guarda o app no aparelho para abrir mesmo sem internet.
const CACHE = "orcamentos-creativity-v1";
const ARQUIVOS = [
  "./", "index.html", "app.css", "app.js", "manifest.webmanifest",
  "vendor/html2canvas.min.js", "vendor/jspdf.umd.min.js",
  "assets/logo.png", "assets/simbolo.png", "assets/assinatura.png",
  "assets/icon-192.png", "assets/icon-512.png", "assets/icon-maskable-512.png",
  "assets/apple-touch-icon.png", "assets/favicon-32.png",
  "fonts/montserrat-latin-300-normal.woff2", "fonts/montserrat-latin-400-normal.woff2",
  "fonts/montserrat-latin-500-normal.woff2", "fonts/montserrat-latin-600-normal.woff2",
  "fonts/montserrat-latin-700-normal.woff2", "fonts/montserrat-latin-800-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro (para pegar atualizações), cache como reserva offline.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
