import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cartContext";
import type { Product } from "@shared/schema";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

export default function Home() {
  const { toast } = useToast();
  const { cart, addToCart, updateQuantity, removeItem, cartItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const activeProducts = products?.filter((p) => p.isActive) || [];

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing && existing.quantity >= product.stock) {
      toast({
        title: "Cannot add more",
        description: "Maximum stock reached for this item",
        variant: "destructive",
      });
      return;
    }

    addToCart({ product, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Official Axo Shard Merch
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Get your exclusive purple axolotl merchandise with that legendary Minecraft-inspired pixelated texture!
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <img
                  src={heroImage}
                  alt="Axo Shard Mascot"
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Shop All Products</h2>
          <p className="text-muted-foreground mt-2">
            Find the perfect axolotl merch for you
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : activeProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              No products available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
