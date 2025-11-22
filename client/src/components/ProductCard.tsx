import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useWishlist } from "@/lib/wishlistContext";
import { useCurrency } from "@/lib/currencyContext";
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
    // If product has sizes, open the modal instead
    if (availableSizes.length > 0) {
      onProductClick(product);
    } else {
      // Products without sizes can be added directly
      onAddToCart(product);
    }
  };

  return (
    <Card 
      className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30" 
      data-testid={`card-product-${product.id}`}
      onClick={() => onProductClick(product)}
    >
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          data-testid={`img-product-${product.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-primary/0 group-hover:from-black/20 transition-all duration-500" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isInWishlist(product.id)) {
              removeFromWishlist(product.id);
            } else {
              addToWishlist(product.id);
            }
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-all backdrop-blur-sm hover:scale-110"
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
        {/* Star Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">(Coming soon)</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid={`text-product-price-${product.id}`}>
            {formatPrice(parseFloat(product.price))}
          </p>
          {isOutOfStock ? (
            <Badge variant="destructive" className="bg-destructive/90" data-testid={`badge-out-of-stock-${product.id}`}>
              Out of Stock
            </Badge>
          ) : (
            <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {product.stock} left
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40 transition-all duration-200 text-white font-semibold group-hover:scale-105"
          disabled={isOutOfStock}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {availableSizes.length > 0 ? "View Options" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
