import { useEffect } from "react";

export function useTrackViewedProduct(productId: string | null) {
  useEffect(() => {
    if (!productId) return;

    const sessionId = sessionStorage.getItem("sessionId") || Date.now().toString();
    sessionStorage.setItem("sessionId", sessionId);

    // Track the viewed product
    fetch("/api/viewed-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        sessionId,
      }),
    }).catch((error) => console.error("Failed to track viewed product:", error));
  }, [productId]);
}
