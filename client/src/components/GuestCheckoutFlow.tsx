import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cartContext";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingBag, Lock } from "lucide-react";

interface GuestCheckoutData {
  email: string;
  phone: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface CheckoutStep {
  id: "contact" | "shipping" | "payment" | "confirm";
  name: string;
  completed: boolean;
}

export function GuestCheckoutFlow() {
  const { toast } = useToast();
  const { cart, cartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<"contact" | "shipping" | "payment" | "confirm">(
    "contact"
  );
  const [formData, setFormData] = useState<Partial<GuestCheckoutData>>({
    country: "United States",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const createSessionMutation = useMutation({
    mutationFn: async (data: Partial<GuestCheckoutData>) => {
      const response = await apiRequest("POST", "/api/guest/checkout/session", {
        email: data.email,
        phone: data.phone,
        cartData: JSON.stringify({
          items: cart,
          total: cartTotal,
          shippingAddress: {
            fullName: data.fullName,
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
          },
        }),
      });
      return response;
    },
  });

  const handleNext = () => {
    // Validate current step
    if (currentStep === "contact") {
      if (!formData.email || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill in all contact fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("shipping");
    } else if (currentStep === "shipping") {
      if (
        !formData.fullName ||
        !formData.street ||
        !formData.city ||
        !formData.state ||
        !formData.zipCode ||
        !formData.country
      ) {
        toast({
          title: "Error",
          description: "Please fill in all shipping fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      if (
        !formData.cardholderName ||
        !formData.cardNumber ||
        !formData.expiryMonth ||
        !formData.expiryYear ||
        !formData.cvv
      ) {
        toast({
          title: "Error",
          description: "Please fill in all payment fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("confirm");
    }
  };

  const handleSubmit = async () => {
    if (!agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to terms and conditions",
        variant: "destructive",
      });
      return;
    }

    try {
      const session = await createSessionMutation.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Order placed successfully! Check your email for confirmation.",
      });
      clearCart();
      // Redirect to order confirmation
      window.location.href = `/order-confirmation/${session.id}`;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const steps: CheckoutStep[] = [
    { id: "contact", name: "Contact", completed: currentStep !== "contact" },
    { id: "shipping", name: "Shipping", completed: currentStep === "payment" || currentStep === "confirm" },
    { id: "payment", name: "Payment", completed: currentStep === "confirm" },
    { id: "confirm", name: "Confirm", completed: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-foreground">Guest Checkout</h1>
          </div>
          <p className="text-muted-foreground">
            Continue without creating an account - takes less than 2 minutes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Indicator */}
            <div className="flex gap-2 mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentStep === step.id
                        ? "bg-purple-600 text-white"
                        : step.completed
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.completed ? "✓" : index + 1}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`h-1 w-8 mx-1 ${step.completed ? "bg-green-600" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Contact Step */}
            {currentStep === "contact" && (
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Contact Information</h2>
                <p className="text-sm text-muted-foreground">
                  We'll use this to send you order updates
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full">
                  Continue to Shipping
                </Button>
              </Card>
            )}

            {/* Shipping Step */}
            {currentStep === "shipping" && (
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Shipping Address</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName || ""}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={formData.street || ""}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state || ""}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode || ""}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country || ""}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("contact")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {/* Payment Step */}
            {currentStep === "payment" && (
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-foreground">Payment Information</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your payment information is secure and encrypted
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name *</Label>
                    <Input
                      id="cardholderName"
                      value={formData.cardholderName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, cardholderName: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber || ""}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiryMonth">Month *</Label>
                      <Select
                        value={formData.expiryMonth || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, expiryMonth: value })
                        }
                      >
                        <SelectTrigger id="expiryMonth">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }).map((_, i) => (
                            <SelectItem key={i} value={String(i + 1).padStart(2, "0")}>
                              {String(i + 1).padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="expiryYear">Year *</Label>
                      <Select
                        value={formData.expiryYear || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, expiryYear: value })
                        }
                      >
                        <SelectTrigger id="expiryYear">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }).map((_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <SelectItem key={i} value={String(year).slice(-2)}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        value={formData.cvv || ""}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("shipping")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Review Order
                  </Button>
                </div>
              </Card>
            )}

            {/* Confirm Step */}
            {currentStep === "confirm" && (
              <Card className="p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Confirm Your Order</h2>

                {/* Contact Summary */}
                <div className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Contact</p>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                  <p className="text-sm text-muted-foreground">{formData.phone}</p>
                </div>

                {/* Shipping Summary */}
                <div className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Shipping Address</p>
                  <p className="text-sm text-muted-foreground">{formData.fullName}</p>
                  <p className="text-sm text-muted-foreground">{formData.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.city}, {formData.state} {formData.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{formData.country}</p>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-xs cursor-pointer">
                    I agree to the terms and conditions and privacy policy
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("payment")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!agreeToTerms || createSessionMutation.isPending}
                    className="flex-1"
                  >
                    {createSessionMutation.isPending ? "Processing..." : "Complete Order"}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-4">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">
                    ${(cartTotal * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">
                    ${(cartTotal + 10 + cartTotal * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
