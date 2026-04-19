/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Precache dei file generati da Vite
precacheAndRoute(self.__WB_MANIFEST);

// Gestore per il click sulla notifica
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Quando l'utente clicca, prova a riportarlo all'app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
