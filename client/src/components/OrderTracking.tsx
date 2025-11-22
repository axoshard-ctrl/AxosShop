import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { OrderStatusHistory } from "@shared/schema";

interface OrderWithHistory {
  id: string;
  userId: string;
  total: string;
  status: string;
  createdAt: string;
  statusHistory: OrderStatusHistory[];
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Order Placed",
    color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200",
    badge: "warning",
  },
  processing: {
    icon: Package,
    label: "Processing",
    color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200",
    badge: "default",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    color: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200",
    badge: "default",
  },
  delivered: {
    icon: CheckCircle2,
    label: "Delivered",
    color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200",
    badge: "default",
  },
  cancelled: {
    icon: AlertCircle,
    label: "Cancelled",
    color: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200",
    badge: "destructive",
  },
};

export function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: orderData, isLoading, error } = useQuery<OrderWithHistory>({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Order not found");
      const order = await response.json();

      // Fetch status history
      const historyResponse = await fetch(`/api/orders/${orderId}/status-history`);
      const statusHistory = await historyResponse.json();

      return {
        ...order,
        statusHistory,
      };
    },
    enabled: !!orderId,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
            <p className="text-muted-foreground mt-2">
              We couldn't find the order you're looking for. Please check the order number and try again.
            </p>
          </div>
          <Link href="/user/orders">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/user/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Order Tracking</h1>
          {isLoading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <p className="text-sm text-muted-foreground">
              Order ID: <span className="font-mono font-semibold">{orderId}</span>
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : orderData ? (
          <>
            {/* Order Summary */}
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${parseFloat(orderData.total).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="text-lg font-semibold text-foreground">
                    {format(new Date(orderData.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </Card>

            {/* Current Status */}
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Order Status</h2>
                {(() => {
                  const config = statusConfig[orderData.status as keyof typeof statusConfig];
                  const Icon = config?.icon || Package;
                  return (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${config?.color}`}>
                      <Icon className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">{config?.label}</p>
                        <p className="text-sm">
                          {format(new Date(orderData.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>

            {/* Status Timeline */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Status History</h2>
              <div className="space-y-4">
                {orderData.statusHistory && orderData.statusHistory.length > 0 ? (
                  orderData.statusHistory.map((entry, index) => {
                    const config = statusConfig[entry.status as keyof typeof statusConfig];
                    const Icon = config?.icon || Package;
                    const isLast = index === orderData.statusHistory.length - 1;

                    return (
                      <div key={entry.id} className="relative">
                        {/* Timeline line */}
                        {!isLast && (
                          <div className="absolute left-6 top-16 bottom-0 w-1 bg-muted" />
                        )}

                        {/* Timeline item */}
                        <div className="flex gap-4">
                          <div className={`relative z-10 rounded-full p-2 ${config?.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-foreground">{config?.label}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(
                                    new Date(entry.createdAt),
                                    "MMMM dd, yyyy 'at' hh:mm a"
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Tracking info */}
                            {entry.trackingNumber && (
                              <div className="mt-3 p-3 bg-muted rounded-md space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                  TRACKING NUMBER
                                </p>
                                <p className="font-mono font-semibold text-foreground">
                                  {entry.trackingNumber}
                                </p>
                                {entry.carrier && (
                                  <p className="text-xs text-muted-foreground">
                                    via {entry.carrier.toUpperCase()}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Notes */}
                            {entry.notes && (
                              <div className="mt-2 text-sm text-muted-foreground border-l-2 border-muted pl-3">
                                {entry.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No status updates yet.</p>
                )}
              </div>
            </Card>

            {/* Tracking Link */}
            {orderData.statusHistory.some((h) => h.trackingNumber) && (
              <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-muted-foreground mb-2">
                  Track your shipment with the carrier for real-time updates:
                </p>
                {orderData.statusHistory
                  .filter((h) => h.trackingNumber)
                  .map((entry) => (
                    <div key={entry.id} className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        {entry.carrier?.toUpperCase()} Tracking
                      </p>
                      <p className="font-mono text-sm">{entry.trackingNumber}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (!entry.carrier || !entry.trackingNumber) return;

                          const trackingUrls: Record<string, string> = {
                            fedex: `https://tracking.fedex.com/en/tracking/${entry.trackingNumber}`,
                            ups: `https://www.ups.com/track?tracknum=${entry.trackingNumber}`,
                            usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${entry.trackingNumber}`,
                            dhl: `https://www.dhl.com/en/en/express/tracking.html?AWB=${entry.trackingNumber}`,
                          };

                          const trackingUrl = trackingUrls[entry.carrier.toLowerCase()];
                          if (trackingUrl) {
                            window.open(trackingUrl, "_blank");
                          }
                        }}
                      >
                        Track with {entry.carrier?.toUpperCase()}
                      </Button>
                    </div>
                  ))}
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
