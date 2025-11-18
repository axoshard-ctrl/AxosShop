import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

const getSizesForProduct = (product: Product): string[] => {
  if (!product.availableSizes) return [];
  try {
    return JSON.parse(product.availableSizes);
  } catch {
    return [];
  }
};

const SIZE_PRICE_MULTIPLIERS: Record<string, number> = {
  "XS": 0.9,
  "S": 0.95,
  "M": 1.0,
  "L": 1.1,
  "XL": 1.2,
  "XXL": 1.3,
  "6x6": 1.0,
  "9x9": 1.35,
};

const getAdjustedPrice = (basePrice: number, size?: string): number => {
  if (!size) return basePrice;
  const multiplier = SIZE_PRICE_MULTIPLIERS[size] || 1.0;
  return basePrice * multiplier;
};

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const sizes = product ? getSizesForProduct(product) : [];
  const defaultSize = sizes.length > 0 ? sizes[0] : "";
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    onClose();
  };

  const hasSize = sizes.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          {/* Left side - Description and options */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size selector */}
            {hasSize && (
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Available Sizes {product.category === "plushie" && "(inches)"}
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size: string) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Price and Add to Cart */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-4xl font-bold text-foreground">
                  ${getAdjustedPrice(parseFloat(product.price), selectedSize).toFixed(2)}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">
                    {product.stock} in stock
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || (hasSize && !selectedSize)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Right side - Product image */}
          <div className="flex items-center justify-center bg-muted rounded-lg p-8">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full max-h-96 object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
