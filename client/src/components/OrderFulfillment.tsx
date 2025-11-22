import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  trackingNumber?: string;
}

interface OrderItem {
  productName: string;
  quantity: number;
  price: string;
}

interface OrderDetails extends Order {
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  confirmed: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  shipped: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
  delivered: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <AlertCircle className="h-4 w-4" />,
};

export function OrderFulfillment() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: {
      orderId: string;
      status: string;
      trackingNumber?: string;
    }) =>
      apiRequest("PATCH", `/api/orders/${data.orderId}`, {
        status: data.status,
        trackingNumber: data.trackingNumber,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      setIsDetailsOpen(false);
      setNewStatus("");
      setTrackingNumber("");
      setSelectedOrder(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order as OrderDetails);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || "");
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;

    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: newStatus,
      trackingNumber: trackingNumber || undefined,
    });
  };

  const filteredOrders = orders?.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  }) || [];

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    confirmed: orders?.filter((o) => o.status === "confirmed").length || 0,
    shipped: orders?.filter((o) => o.status === "shipped").length || 0,
    delivered: orders?.filter((o) => o.status === "delivered").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Fulfillment</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track customer orders
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Orders */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {isLoading ? "..." : orderStats.total}
              </p>
            </div>
            <Package className="h-5 w-5 text-blue-500" />
          </div>
        </Card>

        {/* Pending */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {isLoading ? "..." : orderStats.pending}
              </p>
            </div>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
        </Card>

        {/* Confirmed */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {isLoading ? "..." : orderStats.confirmed}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </div>
        </Card>

        {/* Shipped */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Shipped</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {isLoading ? "..." : orderStats.shipped}
              </p>
            </div>
            <Truck className="h-5 w-5 text-purple-500" />
          </div>
        </Card>

        {/* Delivered */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {isLoading ? "..." : orderStats.delivered}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "All Orders" },
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
          { value: "shipped", label: "Shipped" },
          { value: "delivered", label: "Delivered" },
        ].map((option) => (
          <Button
            key={option.value}
            variant={filterStatus === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Orders</h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-muted/50 transition"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-foreground">
                        {order.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {order.customerEmail}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {STATUS_ICONS[order.status]}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_COLORS[order.status]
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No orders found
          </div>
        )}
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Update order status and tracking information
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm mt-1">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium mt-1">
                    {selectedOrder.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm mt-1">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-sm font-semibold mt-1">
                    ${parseFloat(selectedOrder.totalAmount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedOrder.createdAt), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div>
                  <label className="text-sm font-medium">Order Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newStatus === "shipped" && (
                  <div>
                    <label className="text-sm font-medium">Tracking Number</label>
                    <Input
                      placeholder="Enter tracking number (optional)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={
                    updateStatusMutation.isPending ||
                    newStatus === selectedOrder.status
                  }
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
