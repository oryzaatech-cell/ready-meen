/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'placeholder',
  projectId: 'placeholder',
  messagingSenderId: 'placeholder',
  appId: 'placeholder',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || payload.notification?.title;
  const body = payload.data?.body || payload.notification?.body;
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
