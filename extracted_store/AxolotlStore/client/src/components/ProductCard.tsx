import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <Card
      className="group overflow-hidden hover-elevate transition-all"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          data-testid={`img-product-${product.id}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground line-clamp-1" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <Button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
