import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/authContext";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cartContext";
import { ShoppingBag, Calendar, Package, ArrowRight, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderHistory() {
  const { user } = useAuth();
  const { cartItemCount } = useCart();
  const [, setLocation] = useLocation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/user/orders"],
    enabled: !!user,
  }) as any;

  const handleAddToCart = () => {
    // Handle add to cart
  };

  const handleProductClick = () => {
    // Handle product click
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please log in to view your order history</p>
          <Button onClick={() => setLocation("/login")} size="lg">
            Go to Login
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">My Orders</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
            Order History
          </h1>
          <p className="text-lg text-muted-foreground">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Orders */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Button onClick={() => setLocation("/")} size="lg">
                <Zap className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const getStatusColor = (status: string) => {
                switch (status.toLowerCase()) {
                  case "completed":
                  case "delivered":
                    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                  case "pending":
                  case "processing":
                    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
                  case "cancelled":
                    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
                  default:
                    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
                }
              };

              return (
                <Card key={order.id} className="hover:shadow-lg transition-all duration-200 border-primary/10">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </CardTitle>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {order.itemCount || order.items?.length || 0} item{order.itemCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Email:</span>
                        <span className="font-medium text-foreground">{order.customerEmail}</span>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="pt-3 border-t border-primary/10">
                          <p className="font-semibold text-foreground mb-2">Items:</p>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item: any) => (
                              <div key={item.id} className="flex justify-between text-muted-foreground">
                                <span>{item.productName}</span>
                                <span className="text-foreground">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-muted-foreground text-xs pt-1">
                                +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="mt-4 w-full gap-2">
                      <ArrowRight className="h-4 w-4" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
