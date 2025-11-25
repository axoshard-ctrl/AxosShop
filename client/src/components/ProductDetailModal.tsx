import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Bell } from "lucide-react";
import { useCurrency } from "@/lib/currencyContext";
import { useToast } from "@/hooks/use-toast";
import { InventoryStatus } from "@/components/InventoryStatus";
import { ProductReviews } from "@/components/ProductReviews";
import { calculateDiscountedPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product } from "@shared/schema";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color?: string) => void;
}

const getSizesForProduct = (product: Product): string[] => {
  if (!product.availableSizes) return [];
  try {
    return JSON.parse(product.availableSizes);
  } catch {
    return [];
  }
};

const getColorsForProduct = (product: Product): string[] => {
  if (!product.availableColors) return [];
  try {
    return JSON.parse(product.availableColors);
  } catch {
    return [];
  }
};

const COLOR_MAP: Record<string, string> = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Navy": "#001f3f",
  "Gray": "#808080",
  "Purple": "#800080",
  "Rose Pink": "#E75480",
  "Rose Pink Purple Gradient": "#E75480",
  "Charcoal": "#36454F",
  "Heather Gray": "#A9A9A9",
  "Natural": "#D2B48C",
};

const getColorHex = (colorName: string): string => {
  return COLOR_MAP[colorName] || "#CCCCCC";
};

const getColorHueRotation = (colorName: string): number => {
  const hueMap: Record<string, number> = {
    "Black": 0,
    "White": 0,
    "Navy": 240,
    "Gray": 0,
    "Purple": 270,
    "Rose Pink": 330,
    "Rose Pink Purple Gradient": 330,
    "Charcoal": 0,
    "Heather Gray": 0,
    "Natural": 30,
  };
  return hueMap[colorName] || 0;
};

const getColorSaturation = (colorName: string): number => {
  const saturationMap: Record<string, number> = {
    "Black": 0,
    "White": 0,
    "Navy": 1.3,
    "Gray": 0,
    "Purple": 1.2,
    "Rose Pink": 1.4,
    "Rose Pink Purple Gradient": 1.4,
    "Charcoal": 0,
    "Heather Gray": 0,
    "Natural": 0.8,
  };
  return saturationMap[colorName] || 1;
};

const getColorFilter = (colorName: string): string => {
  const filterMap: Record<string, string> = {
    "Black": "brightness(0.3) saturate(0)",
    "White": "brightness(1.8) saturate(0) invert(1)",
    "Navy": "hue-rotate(240deg) saturate(1.4) brightness(0.9)",
    "Gray": "saturate(0) brightness(1.1)",
    "Purple": "hue-rotate(270deg) saturate(1.3) brightness(0.95)",
    "Rose Pink": "hue-rotate(330deg) saturate(1.4) brightness(0.98)",
    "Rose Pink Purple Gradient": "hue-rotate(280deg) saturate(1.3) brightness(0.96)",
    "Charcoal": "saturate(0) brightness(0.4)",
    "Heather Gray": "saturate(0) brightness(1.2)",
    "Natural": "hue-rotate(25deg) saturate(0.6) brightness(1.05)",
  };
  return filterMap[colorName] || "none";
};

const getColorSpecificImage = (baseImageUrl: string, product: Product, colorName: string): string => {
  if (!colorName) return baseImageUrl;
  
  // Map for color-specific images based on product type and color
  const colorImageMap: Record<string, Record<string, string>> = {
    "tshirt": {
      "Black": "/attached_assets/product-tshirt-black.png",
      "Navy": "/attached_assets/product-tshirt-navy.png",
    },
    "hoodie": {
      "Navy": "/attached_assets/product-hoodie-navy.png",
      "Charcoal": "/attached_assets/product-hoodie-charcoal.png",
      "Heather Gray": "/attached_assets/product-hoodie-heathergray.png",
    },
  };
  
  const categoryImages = colorImageMap[product.category];
  if (categoryImages && categoryImages[colorName]) {
    return categoryImages[colorName];
  }
  
  return baseImageUrl;
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
  const colors = product ? getColorsForProduct(product) : [];
  const defaultSize = sizes.length > 0 ? sizes[0] : "";
  const defaultColor = colors.length > 0 ? colors[0] : "";
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [restockEmail, setRestockEmail] = useState("");
  const [hasNotified, setHasNotified] = useState(false);
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      const newSizes = getSizesForProduct(product);
      const newColors = getColorsForProduct(product);
      const newDefaultSize = newSizes.length > 0 ? newSizes[0] : "";
      const newDefaultColor = newColors.length > 0 ? newColors[0] : "";
      setSelectedSize(newDefaultSize);
      setSelectedColor(newDefaultColor);
      setRestockEmail("");
      setHasNotified(false);
    }
  }, [product?.id, isOpen]);

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
    onAddToCart(product, selectedSize, selectedColor);
    onClose();
  };

  const hasSize = sizes.length > 0;
  const hasColor = colors.length > 0;

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

            {/* Color selector */}
            {colors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Available Colors
                </label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color: string) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Color preview */}
                {selectedColor && (
                  <div className="mt-3 p-3 rounded-lg border border-border bg-card flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-md border-2 border-border"
                      style={{
                        backgroundColor: getColorHex(selectedColor)
                      }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {selectedColor}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Price and Add to Cart */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold text-foreground">
                    {formatPrice(calculateDiscountedPrice(
                      getAdjustedPrice(parseFloat(product.price), selectedSize),
                      product.discountType,
                      product.discountValue
                    ))}
                  </p>
                  {product.discountType && product.discountValue && (
                    <>
                      <p className="text-lg text-muted-foreground line-through">
                        {formatPrice(getAdjustedPrice(parseFloat(product.price), selectedSize))}
                      </p>
                      <Badge className="bg-red-500 text-white">
                        {getDiscountPercentage(
                          getAdjustedPrice(parseFloat(product.price), selectedSize),
                          product.discountType,
                          product.discountValue
                        )}% OFF
                      </Badge>
                    </>
                  )}
                </div>
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
                disabled={product.stock === 0 || (hasSize && !selectedSize) || (hasColor && !selectedColor)}
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
          <div className="flex items-center justify-center bg-muted rounded-lg p-8 relative">
            <div className="relative">
              <img
                src={getColorSpecificImage(product.imageUrl, product, selectedColor)}
                alt={product.name}
                className="max-w-full max-h-96 object-contain transition-all duration-300"
              />
            </div>
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
