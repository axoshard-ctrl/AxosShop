import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OrderConfirmation() {
  const [paymentIntentId, setPaymentIntentId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("payment_intent");
    if (id) {
      setPaymentIntentId(id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            Order Confirmed! <Sparkles className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase! Your adorable axolotl merch is on its way.
          </p>
        </div>

        {paymentIntentId && (
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="text-sm font-mono font-semibold break-all" data-testid="text-order-id">
              {paymentIntentId}
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to your email address.
        </p>

        <Link href="/">
          <a className="block">
            <Button size="lg" className="w-full" data-testid="button-continue-shopping">
              Continue Shopping
            </Button>
          </a>
        </Link>
      </Card>
    </div>
  );
}
