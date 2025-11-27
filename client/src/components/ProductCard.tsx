import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { useWishlist } from "@/lib/wishlistContext";
import { useCurrency } from "@/lib/currencyContext";
import { useQuery } from "@tanstack/react-query";
import { calculateDiscountedPrice, getDiscountPercentage } from "@/lib/utils";
import { useState } from "react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size?: string) => void;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const isOutOfStock = product.stock === 0;
  const [isHovering, setIsHovering] = useState(false);
  const [cartAnimating, setCartAnimating] = useState(false);

  // Fetch reviews to calculate rating and count
  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/products/${product.id}/reviews`],
  }) as any;

  const averageRating = reviews.length > 0
    ? parseFloat((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  const reviewCount = reviews.length;

  let availableSizes: string[] = [];
  if (product.availableSizes) {
    try {
      availableSizes = JSON.parse(product.availableSizes);
    } catch {
      availableSizes = [];
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 600);
    // If product has sizes, open the modal instead
    if (availableSizes.length > 0) {
      onProductClick(product);
    } else {
      // Products without sizes can be added directly
      onAddToCart(product);
    }
  };

  // Determine stock status
  let stockStatus = "";
  let stockColor = "";
  if (isOutOfStock) {
    stockStatus = "Out of Stock";
    stockColor = "bg-destructive/90";
  } else if (product.stock <= 5) {
    stockStatus = `Only ${product.stock} left!`;
    stockColor = "bg-orange-500/90";
  } else if (product.stock <= 15) {
    stockStatus = "Low Stock";
    stockColor = "bg-yellow-500/90";
  }

  return (
    <Card 
      className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30" 
      data-testid={`card-product-${product.id}`}
      onClick={() => onProductClick(product)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          data-testid={`img-product-${product.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-primary/0 group-hover:from-black/20 transition-all duration-500" />
        
        {/* Quick View Button on Hover */}
        {isHovering && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product);
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="flex flex-col items-center gap-2">
              <Eye className="w-8 h-8 text-white" />
              <span className="text-white font-semibold text-sm">Quick View</span>
            </div>
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isInWishlist(product.id)) {
              removeFromWishlist(product.id);
            } else {
              addToWishlist(product.id);
            }
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-all backdrop-blur-sm hover:scale-110 z-10"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isInWishlist(product.id)
                ? "fill-pink-500 text-pink-500"
                : "text-gray-400 hover:text-pink-500"
            }`}
          />
        </button>
      </div>
      <CardContent className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>
        {/* Star Rating with Review Count Badge */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          {reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground">{averageRating}</span>
              <Badge variant="outline" className="text-xs">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </Badge>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No reviews yet</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid={`text-product-price-${product.id}`}>
              {formatPrice(calculateDiscountedPrice(parseFloat(product.price), product.discountType, product.discountValue))}
            </p>
            {product.discountType && product.discountValue && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(parseFloat(product.price))}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            {isOutOfStock ? (
              <Badge variant="destructive" className="bg-destructive/90" data-testid={`badge-out-of-stock-${product.id}`}>
                Out of Stock
              </Badge>
            ) : stockStatus ? (
              <Badge className={`${stockColor} text-white`}>
                {stockStatus}
              </Badge>
            ) : (
              <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                In Stock
              </div>
            )}
            {product.discountType && product.discountValue && (
              <Badge className="bg-red-500 text-white">
                {getDiscountPercentage(parseFloat(product.price), product.discountType, product.discountValue)}% OFF
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button
          onClick={handleAddToCart}
          className={`w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40 transition-all duration-200 text-white font-semibold group-hover:scale-105 ${
            cartAnimating ? 'scale-95 opacity-75' : 'scale-100 opacity-100'
          }`}
          disabled={isOutOfStock}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className={`mr-2 h-4 w-4 transition-transform ${cartAnimating ? 'scale-125' : 'scale-100'}`} />
          {availableSizes.length > 0 ? "View Options" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
