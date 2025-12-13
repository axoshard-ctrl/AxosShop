import { useState, useEffect } from "react";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function Checkout() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isDark, setIsDark] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Coupon and gift card state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; amount: number } | null>(null);

  useEffect(() => {
    if (cart.length === 0) {
      setLocation("/shop");
    }
  }, [cart, setLocation]);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const html = document.documentElement;
      setIsDark(html.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches);
    };

    checkDarkMode();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", checkDarkMode);
    
    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", checkDarkMode);
    };
  }, []);

  const handleApplyCoupon = () => {
    const validCoupons: Record<string, number> = {
      "SAVE10": 10,
      "SAVE20": 20,
      "WELCOME": 15,
    };

    const code = couponCode.toUpperCase();
    if (validCoupons[code]) {
      setAppliedCoupon({ code, discount: validCoupons[code] });
      setCouponCode("");
    } else {
      alert("Invalid coupon code");
    }
  };

  const handleApplyGiftCard = () => {
    const validGiftCards: Record<string, number> = {
      "GIFT-ABC123": 25,
      "GIFT-XYZ789": 50,
      "GIFT-QWE456": 100,
    };

    const code = giftCardCode.toUpperCase();
    if (validGiftCards[code]) {
      setAppliedGiftCard({ code, amount: validGiftCards[code] });
      setGiftCardCode("");
    } else {
      alert("Invalid gift card code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !address || !city || !state || !zip) {
      setError("Please fill in all fields");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            customerEmail: email,
            customerName: name,
            totalAmount: cartTotal.toFixed(2),
            status: "pending",
          },
          items: cart.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: (parseFloat(item.product.price) * item.quantity).toFixed(2),
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order creation error:", errorData);
        throw new Error(errorData.message || "Order creation failed");
      }

      setLocation("/order-confirmation");
    } catch (err: any) {
      setError(err.message || "Failed to create order. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Color scheme based on dark mode
  const colors = {
    bg: isDark ? "#0f172a" : "#ffffff",
    bgSecondary: isDark ? "#1e293b" : "#f5f5f5",
    text: isDark ? "#f1f5f9" : "#000000",
    textSecondary: isDark ? "#cbd5e1" : "#666666",
    border: isDark ? "#334155" : "#dddddd",
    accent: "#6d28d9",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: colors.bg }}>
      <Header cartItemCount={cartItemCount} onCartClick={() => {}} />

      <main style={{ flex: 1, padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "30px", color: colors.text }}>Checkout</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
          {/* Form */}
          <div>
            <Card style={{ padding: "30px", backgroundColor: colors.bgSecondary }}>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ backgroundColor: "#fee", padding: "12px", borderRadius: "4px", marginBottom: "20px", color: "#c00" }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: "20px" }}>
                  <Label style={{ display: "block", marginBottom: "8px", color: colors.text, fontWeight: "500" }}>Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    style={{ padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", width: "100%", backgroundColor: colors.bg, color: colors.text }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <Label style={{ display: "block", marginBottom: "8px", color: colors.text, fontWeight: "500" }}>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    style={{ padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", width: "100%", backgroundColor: colors.bg, color: colors.text }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <Label style={{ display: "block", marginBottom: "8px", color: colors.text, fontWeight: "500" }}>Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                    style={{ padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", width: "100%", backgroundColor: colors.bg, color: colors.text }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <Label style={{ display: "block", marginBottom: "8px", color: colors.text, fontWeight: "500" }}>City</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      style={{ padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", width: "100%", backgroundColor: colors.bg, color: colors.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ display: "block", marginBottom: "8px", color: colors.text, fontWeight: "500" }}>State</Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="NY"
                      style={{ padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", width: "100%", backgroundColor: colors.bg, color: colors.text }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <Label style={{ display: "block", marginBottom: "8px", color: colors.text, fontWeight: "500" }}>Zip Code</Label>
                  <Input
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="10001"
                    style={{ padding: "10px", border: `1px solid ${colors.border}`, borderRadius: "4px", width: "100%", backgroundColor: colors.bg, color: colors.text }}
                  />
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <Label style={{ display: "block", marginBottom: "12px", color: colors.text, fontWeight: "500" }}>Payment Method</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer", color: colors.text }}>
                      <input
                        type="radio"
                        value="stripe"
                        checked={paymentMethod === "stripe"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ marginRight: "10px" }}
                      />
                      Stripe (Card)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer", color: colors.text }}>
                      <input
                        type="radio"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ marginRight: "10px" }}
                      />
                      PayPal
                    </label>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer", color: colors.text }}>
                      <input
                        type="radio"
                        value="bank_transfer"
                        checked={paymentMethod === "bank_transfer"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ marginRight: "10px" }}
                      />
                      Bank Transfer
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: colors.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    opacity: isProcessing ? 0.6 : 1,
                  }}
                >
                  {isProcessing ? "Processing..." : `Complete Order - $${cartTotal.toFixed(2)}`}
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card style={{ padding: "30px", backgroundColor: colors.bgSecondary, height: "fit-content" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: colors.text }}>Order Summary</h2>

              <div style={{ marginBottom: "20px", maxHeight: "300px", overflowY: "auto" }}>
                {cart.map((item) => (
                  <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", paddingBottom: "15px", borderBottom: `1px solid ${colors.border}`, color: colors.text }}>
                    <div>
                      <p style={{ fontWeight: "600" }}>{item.product.name}</p>
                      <p style={{ fontSize: "14px", color: colors.textSecondary }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: "600" }}>${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `2px solid ${colors.border}`, paddingTop: "20px", marginBottom: "20px" }}>
                {/* Coupon Section */}
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px", color: colors.text }}>Coupon Code</h3>
                  {appliedCoupon ? (
                    <div style={{ backgroundColor: isDark ? "#164e63" : "#e8f5e9", padding: "10px", borderRadius: "4px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", color: isDark ? "#86efac" : "#2e7d32" }}>
                      <span style={{ fontSize: "14px" }}>✓ {appliedCoupon.code} ({appliedCoupon.discount}% off)</span>
                      <button
                        onClick={handleRemoveCoupon}
                        style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: isDark ? "#86efac" : "#2e7d32", fontSize: "16px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", opacity: appliedGiftCard ? 0.5 : 1 }}>
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        disabled={appliedGiftCard !== null}
                        style={{ padding: "8px", border: `1px solid ${colors.border}`, borderRadius: "4px", flex: 1, fontSize: "14px", backgroundColor: colors.bg, color: colors.text, cursor: appliedGiftCard ? "not-allowed" : "text" }}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={appliedGiftCard !== null}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: colors.accent,
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: appliedGiftCard ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          opacity: appliedGiftCard ? 0.5 : 1,
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                  {appliedGiftCard && (
                    <p style={{ fontSize: "12px", color: isDark ? "#fbbf24" : "#d97706", marginTop: "8px" }}>
                      Gift card applied - coupon code disabled
                    </p>
                  )}
                </div>

                {/* Gift Card Section */}
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px", color: colors.text }}>Gift Card</h3>
                  {appliedGiftCard ? (
                    <div style={{ backgroundColor: isDark ? "#3730a3" : "#f3e5f5", padding: "10px", borderRadius: "4px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", color: isDark ? "#d8b4fe" : "#6a1b9a" }}>
                      <span style={{ fontSize: "14px" }}>✓ {appliedGiftCard.code}</span>
                      <button
                        onClick={handleRemoveGiftCard}
                        style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: isDark ? "#d8b4fe" : "#6a1b9a", fontSize: "16px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", opacity: appliedCoupon ? 0.5 : 1 }}>
                      <Input
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value)}
                        placeholder="Enter code"
                        disabled={appliedCoupon !== null}
                        style={{ padding: "8px", border: `1px solid ${colors.border}`, borderRadius: "4px", flex: 1, fontSize: "14px", backgroundColor: colors.bg, color: colors.text, cursor: appliedCoupon ? "not-allowed" : "text" }}
                      />
                      <Button
                        onClick={handleApplyGiftCard}
                        disabled={appliedCoupon !== null}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: colors.accent,
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: appliedCoupon ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          opacity: appliedCoupon ? 0.5 : 1,
                        }}
                      >
                        Redeem
                      </Button>
                    </div>
                  )}
                  {appliedCoupon && (
                    <p style={{ fontSize: "12px", color: isDark ? "#fbbf24" : "#d97706", marginTop: "8px" }}>
                      Coupon applied - gift card disabled
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: colors.text, fontSize: "14px" }}>
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: isDark ? "#86efac" : "#2e7d32", fontSize: "14px", fontWeight: "600" }}>
                      <span>Coupon Discount:</span>
                      <span>-${(cartTotal * appliedCoupon.discount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {appliedGiftCard && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: isDark ? "#d8b4fe" : "#6a1b9a", fontSize: "14px", fontWeight: "600" }}>
                      <span>Gift Card:</span>
                      <span>-${appliedGiftCard.amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: colors.text, fontSize: "14px" }}>
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold", marginTop: "15px", color: colors.text }}>
                    <span>Total:</span>
                    <span style={{ color: colors.accent }}>
                      ${Math.max(0, cartTotal - (appliedCoupon ? cartTotal * appliedCoupon.discount / 100 : 0) - (appliedGiftCard ? appliedGiftCard.amount : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
