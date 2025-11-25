import React, { createContext, useContext, useState, useEffect } from "react";

interface WishlistContextType {
  wishlist: Set<string>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistItems: () => string[];
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from localStorage on mount and sync with backend if authenticated
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const response = await fetch("/api/user/wishlist");
        if (response.ok) {
          const data = await response.json();
          setWishlist(new Set(data));
        } else {
          // If not authenticated, try loading from localStorage
          const saved = localStorage.getItem("wishlist");
          if (saved) {
            try {
              setWishlist(new Set(JSON.parse(saved)));
            } catch (e) {
              console.error("Failed to load wishlist from localStorage:", e);
            }
          }
        }
      } catch (e) {
        // Fallback to localStorage if API call fails
        const saved = localStorage.getItem("wishlist");
        if (saved) {
          try {
            setWishlist(new Set(JSON.parse(saved)));
          } catch (parseError) {
            console.error("Failed to load wishlist:", parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const addToWishlist = async (productId: string) => {
    try {
      // Try to sync with backend if authenticated
      const response = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        // Backend sync successful
        setWishlist((prev) => new Set(prev).add(productId));
      } else if (response.status === 401) {
        // User not authenticated, just use localStorage
        setWishlist((prev) => new Set(prev).add(productId));
        localStorage.setItem("wishlist", JSON.stringify(Array.from(new Set([...wishlist, productId]))));
      }
    } catch (e) {
      // Network error, fallback to localStorage
      console.error("Failed to add to wishlist:", e);
      setWishlist((prev) => new Set(prev).add(productId));
      localStorage.setItem("wishlist", JSON.stringify(Array.from(new Set([...wishlist, productId]))));
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/user/wishlist/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Backend sync successful
        setWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else if (response.status === 401) {
        // User not authenticated, just use localStorage
        setWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        const updated = wishlist;
        updated.delete(productId);
        localStorage.setItem("wishlist", JSON.stringify(Array.from(updated)));
      }
    } catch (e) {
      // Network error, fallback to localStorage
      console.error("Failed to remove from wishlist:", e);
      setWishlist((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      const updated = wishlist;
      updated.delete(productId);
      localStorage.setItem("wishlist", JSON.stringify(Array.from(updated)));
    }
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
        isLoading,
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
