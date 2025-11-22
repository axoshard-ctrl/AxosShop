import { useQuery } from "@tanstack/react-query";
import { useWishlist } from "@/lib/wishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Wishlist() {
  const { getWishlistItems } = useWishlist();
  const wishlistIds = getWishlistItems();

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const wishlistProducts = products.filter((p: any) =>
    wishlistIds.includes(p.id)
  );

  // Dummy handlers for wishlist view
  const handleAddToCart = () => {};
  const handleProductClick = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 fill-pink-500 text-pink-500" />
          <h1 className="text-4xl font-bold">My Wishlist</h1>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-6 text-lg">
              Your wishlist is empty. Start adding products you love!
            </p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6">
              You have {wishlistProducts.length} item
              {wishlistProducts.length !== 1 ? "s" : ""} in your wishlist
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
