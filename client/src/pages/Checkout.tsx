import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const getStripePromise = () => {
  if (!STRIPE_PUBLIC_KEY) {
    console.warn("Stripe public key not found");
    return null;
  }
  return loadStripe(STRIPE_PUBLIC_KEY);
};

const stripePromise = getStripePromise();

interface CheckoutFormProps {
  customerName: string;
  customerEmail: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
}

function CheckoutForm({ customerName, customerEmail, onNameChange, onEmailChange }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { cart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const isFormValid = customerName && customerEmail && stripe && elements;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !stripe || !elements) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          receipt_email: customerEmail,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        try {
          const response = await apiRequest("POST", "/api/orders", {
            order: {
              customerEmail,
              customerName,
              totalAmount: cartTotal.toFixed(2),
              status: "completed",
              stripePaymentIntentId: paymentIntent.id,
            },
            items: cart.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity,
              price: parseFloat(item.product.price),
            })),
          });

          if (response.ok) {
            clearCart();
            window.location.href = `/order-confirmation?payment_intent=${paymentIntent.id}`;
          } else {
            throw new Error('Order creation failed');
          }
        } catch (orderError) {
          console.error('Order creation error:', orderError);
          toast({
            title: "Order Error",
            description: "Payment succeeded but order saving failed. Please contact support.",
            variant: "destructive",
          });
        }
        setIsProcessing(false);
      } else {
        toast({
          title: "Payment Incomplete",
          description: "Payment was not completed. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

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
        <h3 className="text-lg font-semibold mb-4 text-foreground">Payment Details</h3>
        <div className="bg-muted/50 p-4 rounded-lg">
          <PaymentElement />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full text-base py-6"
        disabled={!isFormValid || isProcessing}
        data-testid="button-pay"
      >
        {isProcessing ? "Processing..." : `Pay $${cartTotal.toFixed(2)}`}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your payment is secure and encrypted. We never store your card details.
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
  const [clientSecret, setClientSecret] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const { cart, cartTotal, cartItemCount } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const items = cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: parseFloat(item.product.price),
          size: item.size,
        }));

        const response = await apiRequest("POST", "/api/create-payment-intent", { items });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
        
        // Compare amounts more reliably
        const calculatedTotal = calculateCartTotal(cart);
        if (Math.abs(data.amount - calculatedTotal) > 0.01) {
          toast({
            title: "Price Mismatch",
            description: "Cart prices have changed. Please review your order.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Payment intent error:', error);
        toast({
          title: "Error",
          description: "Failed to initialize checkout",
          variant: "destructive",
        });
        setLocation("/");
      }
    };

    createPaymentIntent();
  }, [cart, setLocation, toast]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} onCartClick={() => {}} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Complete your purchase securely with Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 lg:p-8">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  customerName={customerName}
                  customerEmail={customerEmail}
                  onNameChange={setCustomerName}
                  onEmailChange={setCustomerEmail}
                />
              </Elements>
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
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
