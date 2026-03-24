import { createContext, useState, useCallback, useContext } from 'react';

export const CartContext = createContext(null);

// Generate a composite key so the same product with different options = separate cart entries
function makeCartKey(item) {
  return `${item.product_id}__${item.cutting_type || 'whole'}__${item.cleaning ? '1' : '0'}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((item) => {
    const key = makeCartKey(item);
    setItems((prev) => {
      const existing = prev.find((i) => i.cart_key === key);
      if (existing) {
        return prev.map((i) =>
          i.cart_key === key ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, { ...item, cart_key: key }];
    });
  }, []);

  const updateQty = useCallback((cartKey, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.cart_key !== cartKey));
    } else {
      setItems((prev) =>
        prev.map((i) => {
          if (i.cart_key !== cartKey) return i;
          const cappedQty = i.stock_qty ? Math.min(qty, i.stock_qty) : qty;
          return { ...i, qty: cappedQty };
        })
      );
    }
  }, []);

  const removeItem = useCallback((cartKey) => {
    setItems((prev) => prev.filter((i) => i.cart_key !== cartKey));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    totalAmount,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
