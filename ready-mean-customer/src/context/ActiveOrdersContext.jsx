import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';

const ActiveOrdersContext = createContext({ activeCount: 0 });

export function ActiveOrdersProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { get } = useApi();
  const [activeCount, setActiveCount] = useState(0);

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
    const interval = setInterval(checkActiveOrders, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkActiveOrders]);

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
