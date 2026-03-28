import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useRealtime } from './RealtimeContext';

const ActiveOrdersContext = createContext({ activeCount: 0 });

export function ActiveOrdersProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { get } = useApi();
  const { orderVersion } = useRealtime();
  const [activeCount, setActiveCount] = useState(0);

  // Reset count when user logs out
  useEffect(() => {
    if (!isAuthenticated) setActiveCount(0);
  }, [isAuthenticated]);

  const checkActiveOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { orders } = await get('/orders?limit=50');
      if (!orders) return;
      const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
      setActiveCount(active.length);
    } catch (err) {
      // silent
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    checkActiveOrders();
  }, [isAuthenticated, checkActiveOrders, orderVersion]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => checkActiveOrders();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, checkActiveOrders]);

  return (
    <ActiveOrdersContext.Provider value={{ activeCount }}>
      {children}
    </ActiveOrdersContext.Provider>
  );
}

export function useActiveOrders() {
  return useContext(ActiveOrdersContext);
}
