import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CART_STORAGE_KEY = 'gadgetzone_cart_items_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product_id === newItem.product_id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + newItem.quantity;
        const maxStock = newItem.max_stock ?? 99;
        updated[existingIndex].quantity = Math.min(newQty, maxStock);
        return updated;
      }
      return [...prevItems, newItem];
    });

    showToast(`Added "${newItem.name}" to cart`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = items.find((i) => i.product_id === productId);
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.name}" from cart`, 'info');
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          const max = item.max_stock ?? 99;
          return { ...item, quantity: Math.min(quantity, max) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getCount = () => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getCount,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
