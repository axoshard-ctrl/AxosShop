import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { useCurrency } from "@/lib/currencyContext";
import { useLanguage } from "@/lib/languageContext";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { calculateDiscountedPrice } from "@/lib/utils";

interface CheckoutFormProps {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  paymentMethod: string;
  promoCode: string;
  promoDiscount: number;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  onZipChange: (zip: string) => void;
  onPaymentMethodChange: (method: string) => void;
  onPromoChange: (code: string) => void;
  onApplyPromo: (code: string) => void;
}

function CheckoutForm({ 
  customerName, 
  customerEmail, 
  shippingAddress,
  shippingCity,
  shippingState,
  shippingZip,
  paymentMethod,
  promoCode,
  promoDiscount,
  onNameChange, 
  onEmailChange,
  onAddressChange,
  onCityChange,
  onStateChange,
  onZipChange,
  onPaymentMethodChange,
  onPromoChange,
  onApplyPromo,
}: CheckoutFormProps) {
  const { toast } = useToast();
  const { cart, cartTotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const isFormValid = customerName && customerEmail && shippingAddress && shippingCity && shippingState && shippingZip && paymentMethod;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all fields and select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate price for each item with size and discount applied
      const calculateItemPrice = (item: any) => {
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
        return calculateDiscountedPrice(basePrice, item.product.discountType, item.product.discountValue);
      };

      // Create order with manual transaction
      const response = await apiRequest("POST", "/api/orders", {
        order: {
          customerEmail,
          customerName,
          totalAmount: cartTotal.toFixed(2),
          status: "pending",
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: calculateItemPrice(item),
        })),
      });

      if (response.ok) {
        const orderData = await response.json();
        const orderId = orderData.id;

        // Create manual transaction for this order
        const txnResponse = await apiRequest("POST", "/api/transactions/manual", {
          orderId,
          amount: cartTotal,
          paymentMethod,
          notes: `Payment method: ${paymentMethod}`
        });

        if (txnResponse.ok) {
          clearCart();
          setLocation(`/order-confirmation?orderId=${orderId}&paymentMethod=${paymentMethod}`);
        } else {
          throw new Error('Failed to create transaction');
        }
      } else {
        throw new Error('Order creation failed');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast({
        title: "Checkout Error",
        description: err.message || "An error occurred during checkout",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-base">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="John Doe"
              required
              data-testid="input-customer-name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-base">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="john@example.com"
              required
              data-testid="input-customer-email"
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Shipping Address</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-base">Street Address</Label>
            <Input
              id="address"
              type="text"
              value={shippingAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="123 Main Street"
              required
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-base">City</Label>
              <Input
                id="city"
                type="text"
                value={shippingCity}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="New York"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-base">State/Province</Label>
              <Input
                id="state"
                type="text"
                value={shippingState}
                onChange={(e) => onStateChange(e.target.value)}
                placeholder="NY"
                required
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="zip" className="text-base">Postal Code</Label>
            <Input
              id="zip"
              type="text"
              value={shippingZip}
              onChange={(e) => onZipChange(e.target.value)}
              placeholder="10001"
              required
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Payment Method</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="bank_transfer"
              name="paymentMethod"
              value="bank_transfer"
              checked={paymentMethod === "bank_transfer"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4"
            />
            <label htmlFor="bank_transfer" className="ml-3 cursor-pointer text-sm">
              Bank Transfer
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="cash"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4"
            />
            <label htmlFor="cash" className="ml-3 cursor-pointer text-sm">
              Cash
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="check"
              name="paymentMethod"
              value="check"
              checked={paymentMethod === "check"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4"
            />
            <label htmlFor="check" className="ml-3 cursor-pointer text-sm">
              Check
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="crypto"
              name="paymentMethod"
              value="crypto"
              checked={paymentMethod === "crypto"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4"
            />
            <label htmlFor="crypto" className="ml-3 cursor-pointer text-sm">
              Cryptocurrency
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="paypal"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4"
            />
            <label htmlFor="paypal" className="ml-3 cursor-pointer text-sm">
              PayPal
            </label>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full text-base py-6"
        disabled={!isFormValid || isProcessing}
      >
        {isProcessing ? "Processing..." : `Complete Order - ${formatPrice(cartTotal)}`}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your order is secure. You will receive confirmation details via email.
      </p>
    </form>
  );
}

// Helper function to calculate cart total
const calculateCartTotal = (cart: any[]) => {
  return cart.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);
};

export default function Checkout() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState("");
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const { cart, cartTotal, cartItemCount } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const handleApplyPromo = (code: string) => {
    // Simple promo code validation
    const validPromoCodes: Record<string, number> = {
      "SAVE10": 10,
      "SAVE20": 20,
      "WELCOME": 15,
    };

    if (validPromoCodes[code.toUpperCase()]) {
      setPromoDiscount(validPromoCodes[code.toUpperCase()]);
      setAppliedPromo(code.toUpperCase());
      toast({
        title: "Success",
        description: `Promo code applied! You save ${validPromoCodes[code.toUpperCase()]}%`,
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "This promo code is not valid",
        variant: "destructive",
      });
      setPromoDiscount(0);
      setAppliedPromo("");
    }
  };

  const handleApplyGiftCard = (code: string) => {
    // Mock gift card validation - in production, verify with backend
    const validGiftCards: Record<string, number> = {
      "GIFT-ABC123": 25,
      "GIFT-XYZ789": 50,
      "GIFT-QWE456": 100,
    };

    if (validGiftCards[code.toUpperCase()]) {
      const amount = validGiftCards[code.toUpperCase()];
      setGiftCardDiscount(amount);
      setAppliedGiftCard(code.toUpperCase());
      toast({
        title: "Success",
        description: `Gift card applied! Credit: $${amount.toFixed(2)}`,
      });
    } else {
      toast({
        title: "Invalid Gift Card",
        description: "This gift card code is not valid or has been used",
        variant: "destructive",
      });
      setGiftCardDiscount(0);
      setAppliedGiftCard("");
    }
  };

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checking out",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [cart, setLocation, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} onCartClick={() => {}} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Select your payment method and complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 lg:p-8">
              <CheckoutForm
                customerName={customerName}
                customerEmail={customerEmail}
                shippingAddress={shippingAddress}
                shippingCity={shippingCity}
                shippingState={shippingState}
                shippingZip={shippingZip}
                paymentMethod={paymentMethod}
                promoCode={promoCode}
                promoDiscount={promoDiscount}
                onNameChange={setCustomerName}
                onEmailChange={setCustomerEmail}
                onAddressChange={setShippingAddress}
                onCityChange={setShippingCity}
                onStateChange={setShippingState}
                onZipChange={setShippingZip}
                onPaymentMethodChange={setPaymentMethod}
                onPromoChange={setPromoCode}
                onApplyPromo={handleApplyPromo}
              />
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-foreground">
                      {formatPrice(parseFloat(item.product.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              
              {/* Promo Code */}
              {appliedPromo ? (
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    ✓ Promo code applied: {appliedPromo}
                  </p>
                </div>
              ) : (
                <div className="mb-4 space-y-2">
                  <label className="text-sm font-medium">Promo Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={appliedGiftCard !== ""}
                      className="text-sm disabled:opacity-50"
                    />
                    <Button
                      type="button"
                      onClick={() => handleApplyPromo(promoCode)}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                      disabled={appliedGiftCard !== ""}
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedGiftCard && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Promo codes are disabled when a gift card is applied
                    </p>
                  )}
                </div>
              )}

              {/* Gift Card Code */}
              {appliedGiftCard ? (
                <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    ✓ Gift card applied: {appliedGiftCard}
                  </p>
                </div>
              ) : (
                <div className="mb-4 space-y-2">
                  <label className="text-sm font-medium">Gift Card Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter gift card code"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value)}
                      disabled={appliedPromo !== ""}
                      className="text-sm disabled:opacity-50"
                    />
                    <Button
                      type="button"
                      onClick={() => handleApplyGiftCard(giftCardCode)}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                      disabled={appliedPromo !== ""}
                    >
                      Redeem
                    </Button>
                  </div>
                  {appliedPromo && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Gift cards are disabled when a promo code is applied
                    </p>
                  )}
                </div>
              )}

              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('cart.subtotal', language)}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Promo Discount ({promoDiscount}%)</span>
                    <span>-{formatPrice((cartTotal * promoDiscount) / 100)}</span>
                  </div>
                )}
                {giftCardDiscount > 0 && (
                  <div className="flex justify-between text-sm text-purple-600 font-medium">
                    <span>Gift Card Credit</span>
                    <span>-{formatPrice(giftCardDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('cart.shipping', language)}</span>
                  <span>Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('cart.total', language)}</span>
                  <span className="text-primary">
                    {formatPrice(Math.max(0, cartTotal - (cartTotal * promoDiscount) / 100 - giftCardDiscount))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
