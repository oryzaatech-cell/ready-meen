import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { requestNotificationPermission, onForegroundMessage } from '../config/firebase';

const NotificationContext = createContext({ notifications: [], unreadCount: 0, markAllRead: () => {}, refresh: () => {} });

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { get, put } = useApi();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await get('/notifications?limit=20');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
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

  // Listen for foreground push messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onForegroundMessage(() => {
      // Refresh notifications when a push arrives while app is open
      fetchNotifications();
    });

    return unsubscribe;
  }, [isAuthenticated, fetchNotifications]);

  // Poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  // Also check on window focus
  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await put('/notifications/read-all', {});
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
