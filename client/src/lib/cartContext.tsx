import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { CartItem } from "@shared/schema";
import { calculateDiscountedPrice } from "@/lib/utils";

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  clearCart: () => void;
  removeDisabledProducts: (activeProductIds: string[]) => void;
  cartItemCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to create unique key for cart items considering size and color
const getCartItemKey = (productId: string, size?: string, color?: string): string => {
  const parts = [productId];
  if (size) parts.push(size);
  if (color) parts.push(color);
  return parts.join("-");
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("axo-cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("axo-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const itemKey = getCartItemKey(newItem.product.id, newItem.size, newItem.color);
      const existing = prev.find(
        (item) => getCartItemKey(item.product.id, item.size, item.color) === itemKey
      );

      if (existing) {
        return prev.map((item) =>
          getCartItemKey(item.product.id, item.size, item.color) === itemKey
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity < 1) return;
    const itemKey = getCartItemKey(productId, size, color);
    setCart((prev) =>
      prev.map((item) =>
        getCartItemKey(item.product.id, item.size, item.color) === itemKey
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (productId: string, size?: string, color?: string) => {
    const itemKey = getCartItemKey(productId, size, color);
    setCart((prev) =>
      prev.filter((item) => getCartItemKey(item.product.id, item.size, item.color) !== itemKey)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const removeDisabledProducts = (activeProductIds: string[]) => {
    setCart((prev) =>
      prev.filter((item) => activeProductIds.includes(item.product.id))
    );
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total with size-based pricing and discounts
  const cartTotal = cart.reduce((sum, item) => {
    const SIZE_PRICE_MULTIPLIERS: Record<string, number> = {
      "XS": 0.9,
      "S": 0.95,
      "M": 1.0,
      "L": 1.1,
      "XL": 1.2,
      "XXL": 1.3,
      "6x6": 1.0,
      "9x9": 1.35,
    };

    const multiplier = item.size ? (SIZE_PRICE_MULTIPLIERS[item.size] || 1.0) : 1.0;
    const basePrice = parseFloat(item.product.price) * multiplier;
    
    // Apply discount if available
    const finalPrice = calculateDiscountedPrice(
      basePrice,
      item.product.discountType,
      item.product.discountValue
    );
    
    return sum + finalPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        removeDisabledProducts,
        cartItemCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
