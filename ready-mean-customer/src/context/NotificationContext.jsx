import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useRealtime } from './RealtimeContext';
import { requestNotificationPermission, onForegroundMessage } from '../config/firebase';

const NotificationContext = createContext({ notifications: [], unreadCount: 0, markAllRead: () => {}, refresh: () => {} });

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { get, put } = useApi();
  const { orderVersion } = useRealtime();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await get('/notifications?limit=20');
      const count = data.unread_count || 0;
      setNotifications(data.notifications || []);
      setUnreadCount(count);
      if (navigator.setAppBadge) {
        count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge();
      }
    } catch (err) {
      // silent
    }
  }, [isAuthenticated, get]);

  // Register FCM token after login
  useEffect(() => {
    if (!isAuthenticated) return;

    async function registerFCM() {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          await put('/auth/fcm-token', { token });
        }
      } catch (err) {
        // FCM not available — in-app notifications still work
      }
    }

    registerFCM();
  }, [isAuthenticated, put]);

  // Listen for foreground push messages — show in-app toast since browser won't show push
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onForegroundMessage((payload) => {
      fetchNotifications();
      // Show a native notification even when the app is in the foreground
      const title = payload.notification?.title || payload.data?.title;
      const body = payload.notification?.body || payload.data?.body;
      if (title && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        });
      }
    });

    return unsubscribe;
  }, [isAuthenticated, fetchNotifications]);

  // Refresh on realtime order updates + window focus
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, fetchNotifications, orderVersion]);

  const markAllRead = useCallback(async () => {
    try {
      await put('/notifications/read-all', {});
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (navigator.clearAppBadge) navigator.clearAppBadge();
    } catch (err) {
      // silent
    }
  }, [put]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
