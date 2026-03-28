import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const RealtimeContext = createContext({ orderVersion: 0, productVersion: 0 });

export function RealtimeProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [orderVersion, setOrderVersion] = useState(0);
  const [productVersion, setProductVersion] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.db_id) return;

    const channels = [];

    // Listen for order changes for this vendor
    const orderChannel = supabase
      .channel(`vendor-orders-${user.db_id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'order_info',
        filter: `vendor_id=eq.${user.db_id}`,
      }, () => {
        setOrderVersion(v => v + 1);
      })
      .subscribe();
    channels.push(orderChannel);

    // Listen for product changes for this vendor
    const productChannel = supabase
      .channel(`vendor-products-${user.db_id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_info',
        filter: `vendor_id=eq.${user.db_id}`,
      }, () => {
        setProductVersion(v => v + 1);
      })
      .subscribe();
    channels.push(productChannel);

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [isAuthenticated, user?.db_id]);

  return (
    <RealtimeContext.Provider value={{ orderVersion, productVersion }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
