import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/authContext";
import { useCart } from "@/lib/cartContext";
import { useCurrency } from "@/lib/currencyContext";
import { useLocation } from "wouter";
import { Heart, Package, LogOut } from "lucide-react";
import type { Order, OrderItem } from "@shared/schema";

interface OrderWithItems extends Order {
  items: OrderItem[];
}

export default function UserProfile() {
  const { user, logout, isLoading } = useAuth();
  const { cartItemCount } = useCart();
  const { formatPrice } = useCurrency();
  const [, setLocation] = useLocation();

  const { data: orders = [] } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/user/orders"],
    enabled: !!user,
  });

  const { data: wishlistItems = [] } = useQuery<string[]>({
    queryKey: ["/api/user/wishlist"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please log in to view your profile</p>
          <Button onClick={() => setLocation("/login")} size="lg">
            Go to Login
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} onCartClick={() => {}} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              {user.isAdmin && (
                <Badge className="mt-2 bg-primary">Admin</Badge>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                setLocation("/");
              }}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button onClick={() => setLocation("/shop")}>Start Shopping</Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {order.items && order.items.length > 0 && (
                          <div className="space-y-2 border-b pb-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium">
                                  {formatPrice(parseFloat(item.price) * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">
                            {formatPrice(parseFloat(order.totalAmount))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <div className="space-y-4">
              {wishlistItems.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                    <Button onClick={() => setLocation("/shop")}>Browse Products</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} in your wishlist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Wishlist feature coming soon - you have {wishlistItems.length} saved item{wishlistItems.length !== 1 ? "s" : ""}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
