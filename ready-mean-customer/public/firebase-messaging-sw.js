/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Activate new service worker immediately
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

firebase.initializeApp({
  apiKey: 'AIzaSyBa-wiRKnMUsgqQwGCfut1whd3VGiP9dzE',
  authDomain: 'ready-meen.firebaseapp.com',
  projectId: 'ready-meen',
  storageBucket: 'ready-meen.firebasestorage.app',
  messagingSenderId: '126904829631',
  appId: '1:126904829631:web:02b90f99090e9780d8a80a',
});

const messaging = firebase.messaging();

// Background messages — update badge and notify clients
messaging.onBackgroundMessage((payload) => {
  // Try setting badge directly
  try { navigator.setAppBadge(); } catch (e) {}

  // Notify all open windows to refresh badge count
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
    windowClients.forEach((client) => {
      client.postMessage({ type: 'FCM_PUSH_RECEIVED' });
    });
  });

  // webpush.notification in the FCM payload auto-shows the notification,
  // so we only manually show for data-only messages
  if (!payload.notification) {
    const title = payload.data?.title;
    const body = payload.data?.body;
    if (title) {
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: payload.data?.order_id ? `order-${payload.data.order_id}` : 'ready-meen',
        renotify: true,
        data: payload.data || {},
      });
    }
  }
});

// Handle notification click — open the order
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const orderId = event.notification.data?.order_id;
  const url = orderId ? `/orders/${orderId}` : '/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
