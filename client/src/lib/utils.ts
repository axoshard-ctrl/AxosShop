import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDiscountedPrice(
  price: number | string,
  discountType?: string | null,
  discountValue?: number | string | null
): number {
  const originalPrice = parseFloat(String(price));
  
  if (!discountType || !discountValue) {
    return originalPrice;
  }

  const discount = parseFloat(String(discountValue));
  
  if (discountType === "percentage") {
    return originalPrice * (1 - discount / 100);
  } else if (discountType === "fixed") {
    return Math.max(0, originalPrice - discount);
  }
  
  return originalPrice;
}

export function getDiscountPercentage(
  originalPrice: number | string,
  discountType?: string | null,
  discountValue?: number | string | null
): number {
  const original = parseFloat(String(originalPrice));
  
  if (!discountType || !discountValue) {
    return 0;
  }

  const discount = parseFloat(String(discountValue));
  
  if (discountType === "percentage") {
    return discount;
  } else if (discountType === "fixed") {
    return Math.round((discount / original) * 100);
  }
  
  return 0;
}

