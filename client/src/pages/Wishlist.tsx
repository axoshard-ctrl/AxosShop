import { useQuery } from "@tanstack/react-query";
import { useWishlist } from "@/lib/wishlistContext";
import { useCart } from "@/lib/cartContext";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { getWishlistItems, removeFromWishlist } = useWishlist();
  const { cartItemCount, addToCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const wishlistIds = getWishlistItems();

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const wishlistProducts = products.filter((p: any) =>
    wishlistIds.includes(p.id)
  );

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    });
  };

  const handleProductClick = () => {
    // Handle product click
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} onCartClick={() => {}} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100/50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800 mb-4">
            <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400 fill-pink-600 dark:fill-pink-400" />
            <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">Saved Items</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
            My Wishlist
          </h1>
          <p className="text-lg text-muted-foreground">
            {wishlistProducts.length === 0
              ? "Your wishlist is empty. Start adding products you love!"
              : `${wishlistProducts.length} item${wishlistProducts.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        {/* Empty State */}
        {wishlistProducts.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">
                Save your favorite products to view them later
              </p>
              <Button onClick={() => setLocation("/")} size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="flex items-center justify-between gap-4 p-4 bg-card/50 rounded-lg border border-primary/10">
              <div>
                <p className="text-sm text-muted-foreground">Total saved items</p>
                <p className="text-2xl font-bold text-foreground">{wishlistProducts.length}</p>
              </div>
              <Button 
                onClick={() => {
                  wishlistProducts.forEach((product: any) => {
                    addToCart(product);
                  });
                  toast({
                    title: "Added to cart",
                    description: `All ${wishlistProducts.length} items added to your cart`,
                  });
                }}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add All to Cart
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((product: any) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onProductClick={handleProductClick}
                  />
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Continue Shopping Button */}
            <div className="flex justify-center pt-8">
              <Button 
                variant="outline"
                onClick={() => setLocation("/")}
                size="lg"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
