// Service Worker para PWA - Cache otimizado
const CACHE_NAME = 'bovinet-v1';
const API_CACHE_NAME = 'bovinet-api-v1';

// Recursos estáticos para cache
const STATIC_RESOURCES = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  // Adicionar outros recursos críticos
];

// URLs da API para cache
const API_ENDPOINTS = [
  '/api/listings',
  '/api/truckers',
  '/api/auth/me'
];

// Instalação do SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_RESOURCES))
  );
});

// Estratégia de cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache API com estratégia stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            // Só cacheia respostas GET bem-sucedidas
            if (event.request.method === 'GET' && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          
          // Retorna cache se disponível, senão busca da rede
          return response || fetchPromise;
        });
      })
    );
    return;
  }
  
  // Cache para recursos estáticos
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Limpeza de cache antigo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});