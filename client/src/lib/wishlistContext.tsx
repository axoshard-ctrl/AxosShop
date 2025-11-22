import React, { createContext, useContext, useState, useEffect } from "react";

interface WishlistContextType {
  wishlist: Set<string>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistItems: () => string[];
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        setWishlist(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to load wishlist:", e);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(Array.from(wishlist)));
  }, [wishlist]);

  const addToWishlist = (productId: string) => {
    setWishlist((prev) => new Set(prev).add(productId));
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.has(productId);
  };

  const getWishlistItems = () => {
    return Array.from(wishlist);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
