/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBa-wiRKnMUsgqQwGCfut1whd3VGiP9dzE',
  authDomain: 'ready-meen.firebaseapp.com',
  projectId: 'ready-meen',
  storageBucket: 'ready-meen.firebasestorage.app',
  messagingSenderId: '126904829631',
  appId: '1:126904829631:web:02b90f99090e9780d8a80a',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // If a notification payload is present, the browser shows it automatically.
  // Only manually show when we have data-only messages.
  if (payload.notification) return;

  const title = payload.data?.title;
  const body = payload.data?.body;
  if (!title) return;

  const options = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
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
