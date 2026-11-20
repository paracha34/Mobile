import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';

const WISHLIST_STORAGE_KEY = 'gadget_zone_wishlist_v1';

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse wishlist from localStorage:', e);
    }
    return [];
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { showToast } = useToast();

  // Keep localStorage synchronized whenever wishlist state changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage:', e);
    }
  }, [wishlist]);

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.id === productId);
  };

  const addToWishlist = (product: Product) => {
    if (!isInWishlist(product.id)) {
      setWishlist((prev) => [product, ...prev]);
      showToast(`Added "${product.name}" to your wishlist`, 'success');
    }
  };

  const removeFromWishlist = (productId: string) => {
    const itemToRemove = wishlist.find((item) => item.id === productId);
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.name}" from wishlist`, 'info');
    }
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    if (wishlist.length === 0) return;
    setWishlist([]);
    showToast('Wishlist cleared', 'info');
  };

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
