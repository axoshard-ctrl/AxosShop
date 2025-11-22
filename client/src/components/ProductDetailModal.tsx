import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Bell } from "lucide-react";
import { useCurrency } from "@/lib/currencyContext";
import { useToast } from "@/hooks/use-toast";
import { InventoryStatus } from "@/components/InventoryStatus";
import { ProductReviews } from "@/components/ProductReviews";
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
  const [restockEmail, setRestockEmail] = useState("");
  const [hasNotified, setHasNotified] = useState(false);
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const restockMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/restock/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          userEmail: email,
        }),
      });
      if (!response.ok) throw new Error("Failed to register notification");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ You'll be notified when this item is back in stock!" });
      setHasNotified(true);
      setRestockEmail("");
    },
    onError: () => {
      toast({
        title: "Could not register notification",
        variant: "destructive",
      });
    },
  });

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
                  {formatPrice(getAdjustedPrice(parseFloat(product.price), selectedSize))}
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

              {/* Inventory Status Component */}
              {product.stock <= 15 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <InventoryStatus 
                    stock={product.stock}
                    restockEmail={restockEmail}
                  />
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || (hasSize && !selectedSize)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>

              {/* Restock Notification */}
              {product.stock === 0 && !hasNotified && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">
                      Get notified when back in stock
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={restockEmail}
                      onChange={(e) => setRestockEmail(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      onClick={() => {
                        if (!restockEmail) {
                          toast({
                            title: "Please enter your email",
                            variant: "destructive",
                          });
                          return;
                        }
                        restockMutation.mutate(restockEmail);
                      }}
                      disabled={restockMutation.isPending}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {restockMutation.isPending ? "..." : "Notify"}
                    </Button>
                  </div>
                </div>
              )}

              {hasNotified && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-700">
                  ✓ Notification registered! We'll email you when this item is back in stock.
                </div>
              )}
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

        {/* Reviews Section */}
        <div className="border-t pt-8 mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Customer Reviews</h3>
          <ProductReviews productId={product.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
