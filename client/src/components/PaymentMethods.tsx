import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus } from "lucide-react";

export function PaymentMethods() {
  const paymentMethods = [
    {
      id: "stripe",
      name: "Credit Card",
      icon: "💳",
      description: "Visa, Mastercard, American Express",
      enabled: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: "🅿️",
      description: "Fast and secure payments",
      enabled: true,
    },
    {
      id: "apple-pay",
      name: "Apple Pay",
      icon: "🍎",
      description: "One-click payments on Apple devices",
      enabled: true,
    },
    {
      id: "google-pay",
      name: "Google Pay",
      icon: "🔵",
      description: "Fast checkout with Google Pay",
      enabled: true,
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      icon: "🏦",
      description: "Direct bank transfers (ACH/Wire)",
      enabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Multiple ways to pay for your purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-2xl">{method.icon}</div>
                  <Badge variant={method.enabled ? "default" : "secondary"}>
                    {method.enabled ? "Available" : "Coming Soon"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground">{method.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
