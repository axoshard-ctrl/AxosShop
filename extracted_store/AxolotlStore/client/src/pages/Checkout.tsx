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
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !customerName || !customerEmail) {
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
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Create order in backend
        await apiRequest("POST", "/api/orders", {
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
            price: item.product.price,
          })),
        });

        clearCart();
        window.location.href = `/order-confirmation?payment_intent=${paymentIntent.id}`;
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="John Doe"
            required
            data-testid="input-customer-name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={customerEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="john@example.com"
            required
            data-testid="input-customer-email"
          />
        </div>
      </div>

      <Separator />

      <div className="bg-muted p-4 rounded-md space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground">Order Summary</h3>
        {cart.map((item) => (
          <div key={item.product.id} className="flex justify-between text-sm">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span data-testid="text-checkout-total">${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">Payment Details</Label>
        <PaymentElement />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="button-pay"
      >
        {isProcessing ? "Processing..." : `Pay $${cartTotal.toFixed(2)}`}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const { cart, cartTotal, cartItemCount } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    apiRequest("POST", "/api/create-payment-intent", { items })
      .then((data) => {
        setClientSecret(data.clientSecret);
        // Verify the server-calculated amount matches our cart total
        if (Math.abs(data.amount - cartTotal) > 0.01) {
          toast({
            title: "Price Mismatch",
            description: "Cart prices have changed. Please review your order.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize checkout",
          variant: "destructive",
        });
        setLocation("/");
      });
  }, [cart, cartTotal, setLocation, toast]);

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Complete your purchase securely
          </p>
        </div>

        <Card className="p-6">
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
    </div>
  );
}
