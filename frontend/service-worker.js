const cacheName = 'crud-jwt-v4'
const arquivos = [
  '/',
  '/index.html',
  '/usuarios.html',
  '/style.css',
  '/auth.js',
  '/usuarios.js',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(arquivos))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(nomes =>
      Promise.all(
        nomes
          .filter(nome => nome !== cacheName)
          .map(nome => caches.delete(nome))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api')) return

  event.respondWith(
    fetch(request)
      .then(resposta => {
        const copia = resposta.clone()
        caches.open(cacheName).then(cache => cache.put(request, copia))
        return resposta
      })
      .catch(() => caches.match(request))
  )
})