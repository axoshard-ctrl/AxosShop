import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, ShoppingCart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { calculateDiscountedPrice } from "@/lib/utils";
import { useCurrency } from "@/lib/currencyContext";

interface ProductComparisonProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductComparison({
  products,
  onRemove,
  onAddToCart,
}: ProductComparisonProps) {
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen || products.length === 0) return null;

  // Fetch reviews for all products
  const reviews: Record<string, any[]> = {};
  for (const product of products) {
    const { data: productReviews = [] } = useQuery({
      queryKey: [`/api/products/${product.id}/reviews`],
    }) as any;
    reviews[product.id] = productReviews;
  }

  const getRating = (productId: string) => {
    const productReviews = reviews[productId] || [];
    if (productReviews.length === 0) return 0;
    return parseFloat(
      (
        productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        productReviews.length
      ).toFixed(1)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Comparison
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Comparison</DialogTitle>
          <DialogDescription>
            Compare specifications, prices, and ratings
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Specification</TableHead>
                {products.map((product) => (
                  <TableHead key={product.id} className="min-w-48">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.category}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => onRemove(product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Image */}
              <TableRow>
                <TableCell className="font-semibold">Image</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Price */}
              <TableRow>
                <TableCell className="font-semibold">Price</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id}>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(
                          calculateDiscountedPrice(
                            parseFloat(product.price),
                            product.discountType,
                            product.discountValue
                          )
                        )}
                      </p>
                      {product.discountValue && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(parseFloat(product.price))}
                        </p>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Stock */}
              <TableRow>
                <TableCell className="font-semibold">Stock</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          product.stock > 10
                            ? "bg-green-500"
                            : product.stock > 0
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span>
                        {product.stock > 0
                          ? `${product.stock} units`
                          : "Out of stock"}
                      </span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Rating */}
              <TableRow>
                <TableCell className="font-semibold">Rating</TableCell>
                {products.map((product) => {
                  const rating = getRating(product.id);
                  const reviewCount = reviews[product.id]?.length || 0;
                  return (
                    <TableCell key={product.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm">
                          {rating > 0 ? `${rating}/5` : "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({reviewCount})
                        </span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Description */}
              <TableRow>
                <TableCell className="font-semibold">Description</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id}>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {product.description}
                    </p>
                  </TableCell>
                ))}
              </TableRow>

              {/* Category */}
              <TableRow>
                <TableCell className="font-semibold">Category</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id}>
                    <span className="px-2 py-1 rounded-md bg-primary/10 text-sm font-medium">
                      {product.category}
                    </span>
                  </TableCell>
                ))}
              </TableRow>

              {/* Action */}
              <TableRow>
                <TableCell />
                {products.map((product) => (
                  <TableCell key={product.id}>
                    <Button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      size="sm"
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
