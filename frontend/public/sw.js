// Service Worker para PWA do Studio Letícia Oliveira
const CACHE_NAME = 'studio-leticia-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Erro ao pré-armazenar recursos no cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições estáticas
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não interceptar requisições para a API nem métodos que não sejam GET
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api') || url.origin !== location.origin) {
    return;
  }

  // Estratégia Network First com fallback para Cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});

// =========================================================================
// SISTEMA DE NOTIFICAÇÕES WEB PUSH (ALERTA NATIVO ANDROID / WINDOWS / MAC)
// =========================================================================
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '✨ Novo agendamento recebido no Studio!' };
  }

  const title = data.title || '✨ Studio Letícia Oliveira';
  const options = {
    body: data.body || 'Um novo agendamento acabou de ser realizado!',
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    // Padrão de vibração potente no Android: vibra 300ms, pausa 100ms, vibra 300ms, pausa 100ms, vibra 400ms
    vibrate: [300, 100, 300, 100, 400],
    tag: data.tag || `studio-notif-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Ação de clique na notificação nativa do celular/PC
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se a página já estiver aberta, foca nela
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não estiver aberta, abre a janela
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
