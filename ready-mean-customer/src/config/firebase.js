import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let messaging = null;

function getFirebaseApp() {
  if (!app && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

function getFirebaseMessaging() {
  if (!messaging) {
    const fbApp = getFirebaseApp();
    if (fbApp) {
      try {
        messaging = getMessaging(fbApp);
      } catch (err) {
        console.warn('Firebase messaging not supported:', err.message);
      }
    }
  }
  return messaging;
}

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const msg = getFirebaseMessaging();
    if (!msg) return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('Missing VITE_FIREBASE_VAPID_KEY');
      return null;
    }

    // Register the Firebase messaging service worker explicitly
    // so getToken can bind to it on both Android and iOS PWA
    const tokenOptions = { vapidKey };
    if ('serviceWorker' in navigator) {
      try {
        const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope',
        });
        tokenOptions.serviceWorkerRegistration = swReg;
      } catch (swErr) {
        console.warn('Firebase SW registration failed:', swErr.message);
      }
    }

    const token = await getToken(msg, tokenOptions);
    return token;
  } catch (err) {
    console.warn('FCM token error:', err.message);
    return null;
  }
}

export function onForegroundMessage(callback) {
  const msg = getFirebaseMessaging();
  if (!msg) return () => {};
  return onMessage(msg, callback);
}
