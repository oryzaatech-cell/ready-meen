import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';

const OrderBadgeContext = createContext({ newCount: 0, markSeen: () => {} });

export function OrderBadgeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { get } = useApi();
  const [newCount, setNewCount] = useState(0);
  const lastSeenRef = useRef(localStorage.getItem('vendor_orders_last_seen') || '');

  const checkNewOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [{ orders: placedOrders }, { orders: cancelOrders }] = await Promise.all([
        get('/orders?status=placed&limit=50'),
        get('/orders?status=cancel_requested&limit=50'),
      ]);
      const orders = [...(placedOrders || []), ...(cancelOrders || [])];
      if (!orders) return;
      const lastSeen = lastSeenRef.current;
      if (lastSeen) {
        const unseen = orders.filter(o => o.created_at > lastSeen);
        setNewCount(unseen.length);
      } else {
        // First time — don't show badge for existing orders
        setNewCount(0);
        if (orders.length > 0) {
          lastSeenRef.current = orders[0].created_at;
          localStorage.setItem('vendor_orders_last_seen', orders[0].created_at);
        }
      }
    } catch (err) {
      // silent
    }
  }, [isAuthenticated]);

  // Poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    checkNewOrders();
    const interval = setInterval(checkNewOrders, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkNewOrders]);

  // Also check on window focus
  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => checkNewOrders();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, checkNewOrders]);

  const markSeen = useCallback(() => {
    const now = new Date().toISOString();
    lastSeenRef.current = now;
    localStorage.setItem('vendor_orders_last_seen', now);
    setNewCount(0);
  }, []);

  return (
    <OrderBadgeContext.Provider value={{ newCount, markSeen }}>
      {children}
    </OrderBadgeContext.Provider>
  );
}

export function useOrderBadge() {
  return useContext(OrderBadgeContext);
}
