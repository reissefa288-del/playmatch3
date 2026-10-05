import { writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { buildPrecacheUrls, precacheBuildId } from './precacheManifest'

function renderServiceWorker(cacheName: string, precache: string[]) {
  return `'use strict';
const CACHE=${JSON.stringify(cacheName)};
const PRECACHE=${JSON.stringify(precache)};
const PUSH_NAV=${JSON.stringify('push-navigate')};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || 'PlayMeet';
  const body = notification.body || '';
  const url = data.url || '/';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  const targetUrl = new URL(url, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.postMessage({ type: PUSH_NAV, url });
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    }),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    }),
  );
});
`
}

/** P11 — emit dist/sw.js with hashed shell + LCP precache manifest. */
export function generateServiceWorker(): Plugin {
  return {
    name: 'generate-service-worker',
    apply: 'build',
    writeBundle(options, bundle) {
      const outDir = options.dir ?? 'dist'
      const precache = buildPrecacheUrls(bundle)
      const cacheName = `pm-shell-${precacheBuildId(bundle)}`
      writeFileSync(path.join(outDir, 'sw.js'), renderServiceWorker(cacheName, precache), 'utf8')
    },
  }
}
